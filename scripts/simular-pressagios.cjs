const { preparar } = require("../tests/helpers/jogo.cjs");
const assert = require("node:assert/strict");
const fs = require("node:fs");
function rng(seed) {
  let v = seed >>> 0;
  return () => {
    v = (Math.imul(1664525, v) + 1013904223) >>> 0;
    return v / 4294967296;
  };
}
const { J, novaRun } = preparar();
const distribution = [0, 0, 0, 0];
for (let seed = 1; seed <= 2000; seed++) {
  const random = rng(seed),
    r = novaRun();
  for (let n = 1; n <= 300; n++) {
    r.rodada = n;
    J.pressagios.passagem(r, random);
    if (J.pressagios.bloqueia(r)) {
      if (r.pressagios.atual.fase === "resultado") {
        assert.ok(r.pressagios.atual.fim <= 300);
      }
      J.pressagios.confirmar(r);
    }
    // Recursos estáveis isolam a frequência do risco de derrota.
    r.atributos.hp = r.hpMax;
    r.atributos.habitantes = 100;
    r.atributos.gold = 100;
  }
  assert.ok(r.pressagios.naturais <= 3);
  assert.equal(r.pressagios.atual, null);
  distribution[r.pressagios.naturais]++;
}
const games = [];
for (const trait of J.herdeiros.todos) {
  const totals = {
    herdeiro: trait,
    partidas: 3,
    vitorias: 0,
    rodadas: 0,
    anuncios: 0,
    sucessos: 0,
    falhas: 0,
    cancelados: 0,
    interrompidos: 0,
  };
  for (let seed = 1; seed <= 3; seed++) {
    const random = rng(seed * 18973 + J.herdeiros.todos.indexOf(trait));
    J.engine.sortear.constructor("return Math")().random = random;
    let r = J.estado.novo(J.legado.vazio(), trait);
    J.engine.registrarSorteio(r, J.engine.sortear(r));
    let steps = 0;
    while (r.status === "ativa" && steps++ < 1100) {
      if (r.aguardaDecisaoCulto) {
        J.engine.juntarCulto(r);
        continue;
      }
      if (J.pressagios.bloqueia(r)) {
        assert.equal(J.save.gravarRun(r), true);
        r = J.save.lerRun();
        assert.ok(r);
        const response = J.pressagios.confirmar(r);
        if (response.retomar) J.engine.avancar(r);
        continue;
      }
      if (r.fase === "resultado") {
        J.engine.avancar(r);
        continue;
      }
      const event = J.eventoPorId(r.eventoId),
        options = J.engine.opcoes(event, r);
      assert.ok(options.length, `${trait}: ${event.id}`);
      const score = (option) => {
        const e = option.efeitos || {},
          a = r.atributos,
          p = r.pressagios.atual;
        let value =
          Math.min(e.hp || 0, r.hpMax - a.hp) * (a.hp < 40 ? 6 : 1.5) +
          (e.gold || 0) * (a.gold < 30 ? 2 : 0.6) +
          (e.habitantes || 0) * (a.habitantes < 25 ? 4 : 0.6) +
          (e.escudo || 0) * 2 +
          (e.ataque || 0) * 2 +
          (e.honra || 0) * 0.3;
        if (option.combate) value -= 30;
        if (a.hp + (e.hp || 0) <= 0) value -= 1000;
        if (a.habitantes + (e.habitantes || 0) <= 0) value -= 200;
        if (p?.fase === "ativo") {
          const aid = J.pressagios.auxilios.has(`${event.id}:${option.id}`);
          if (p.id === "nuvem_faminta" && aid && e.gold < 0) value += 20;
          if (p.id === "procissao" && aid) value += 20;
          if (p.id === "corvos") value += Math.max(0, e.honra || 0) * 3;
          if (p.id === "vinda_barao") value += Math.max(0, e.gold || 0) * 3;
          if (p.id === "noite_lamento") value += (e.habitantes || 0) * 3;
          if (p.id === "ferrugem_negra") value += (e.escudo || 0) * 6;
          if (!J.pressagios.escolhaCompativel(r, event, option)) value -= 500;
        }
        return value;
      };
      options.sort((a, b) => score(b) - score(a));
      assert.equal(J.engine.escolher(r, options[0].id), true);
    }
    assert.ok(steps < 1100, trait);
    totals.rodadas += r.rodada;
    if (r.fim?.tipo?.startsWith("vitoria")) totals.vitorias++;
    totals.anuncios += r.pressagios.naturais;
    for (const result of r.pressagios.historico) {
      if (result.sucesso === null) totals.cancelados++;
      else totals[result.sucesso ? "sucessos" : "falhas"]++;
    }
    if (r.pressagios.atual && r.pressagios.atual.fase !== "resultado") totals.interrompidos++;
  }
  games.push(totals);
}
const result = {
  sementesCalendario: 2000,
  distribuicaoAnuncios: distribution,
  mediaAnuncios: distribution.reduce((a, n, i) => a + n * i, 0) / 2000,
  partidasReais: games,
};
fs.writeFileSync("docs/PRESSAGIOS-SIMULACAO.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
