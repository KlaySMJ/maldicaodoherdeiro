"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preparar } = require("../tests/helpers/jogo.cjs");
const intervalos = [];
let passos = 0,
  adiamentos = 0,
  continuacoes = 0;

// Doze cenários de trinta rodadas: 360 passos no total desta simulação.
for (let cenario = 0; cenario < 12; cenario++) {
  const { J, novaRun } = preparar();
  let run = novaRun();
  Object.assign(run.flags, {
    moinho_reparado: true,
    bardo_cantou: true,
    prisioneiro_solto: true,
    padre_aceito: true,
  });
  run.atributos.gold = 50;
  run.rodada = 10;
  J.sistemas.atualizar(run);
  const candidatos = [...J.sistemas.cadeias.map((id) => J.eventoPorId(id)), J.eventoPorId("colheita")];
  let ultima = 0;
  for (let rodada = 10; rodada < 40; rodada++) {
    passos++;
    run.rodada = rodada;
    const lista = J.sistemas.filtrar(run, candidatos);
    const urgente = (rodada + cenario) % 5 === 0;
    if (urgente && lista.length === 1 && J.sistemas.cadeias.includes(lista[0].id)) adiamentos++;
    if (!urgente && lista.length === 1 && J.sistemas.cadeias.includes(lista[0].id)) {
      const evento = lista[0];
      const espera = rodada - run.sistemas.esperas[evento.id];
      assert.ok(rodada - ultima > 1);
      assert.ok(espera >= 12);
      intervalos.push(espera);
      J.engine.registrarSorteio(run, evento);
      const opcao = J.engine.opcoes(evento, run).find((o) => !o.combate && !o.testeDados);
      assert.ok(opcao, evento.id);
      assert.equal(J.engine.escolher(run, opcao.id), true);
      run.fase = "escolha";
      run.ultimoResultado = null;
      J.engine.registrarSorteio(run, J.eventoPorId("mercador"));
      ultima = rodada;
      continuacoes++;
    }
    assert.equal(J.save.runValida(run), true, `Estado antes da recarga: ${cenario}/${rodada}`);
    assert.equal(J.save.gravarRun(run), true);
    run = J.save.lerRun();
    assert.ok(run, `Recarga: ${cenario}/${rodada}`);
  }
  for (const id of J.sistemas.cadeias) {
    assert.ok(run.sistemas.concluidas.includes(id), id);
    assert.equal(run.sistemas.esperas[id], undefined);
    assert.equal(run.sistemas.concluidas.filter((v) => v === id).length, 1);
  }
}
const relatorio = {
  cenarios: 12,
  passos,
  limite: 500,
  continuacoes,
  adiamentos,
  intervaloMinimo: Math.min(...intervalos),
  intervaloMaximo: Math.max(...intervalos),
  duplicacoes: 0,
  filasRestantes: 0,
  escopo:
    "Fila das quatro cadeias com urgências, espaçamento e recarga a cada rodada; não mede balanceamento de partidas completas.",
};
const destino = path.resolve(__dirname, "../.taste-skill/qa/sistemas");
fs.mkdirSync(destino, { recursive: true });
fs.writeFileSync(path.join(destino, "simulacao.json"), JSON.stringify(relatorio, null, 2));
console.log(JSON.stringify(relatorio));
