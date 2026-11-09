"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { preparar } = require("./helpers/jogo.cjs");

function combate(eventoId = "saqueadores") {
  const contexto = preparar();
  const { J } = contexto;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../js/events-bosses.js"), "utf8"), {
    window: { Jogo: J },
  });
  const run = J.estado.novo(J.legado.vazio(), "avarento");
  run.debugTracoInimigo = "nenhum";
  const evento = J.eventoPorId(eventoId);
  J.engine.registrarSorteio(run, evento);
  assert.equal(J.engine.escolher(run, evento.opcoes.find((opcao) => opcao.combate).id), true);
  return { ...contexto, run, evento };
}

function rolar(contexto, herdeiro, inimigo) {
  const { J, run } = contexto;
  assert.equal(J.engine.rolarCombate(run), true);
  run.combatePendente.dadosHerdeiro.fill(herdeiro);
  run.combatePendente.dadosInimigo.fill(inimigo);
}

test("postura altera apenas o combate atual e fica travada depois da rolagem", () => {
  const { J, run } = combate();
  const ataque = run.atributos.ataque;
  const neutro = J.engine.perfilCombate(run).ataque;
  assert.equal(J.engine.definirPosturaCombate(run, "agressiva"), true);
  assert.equal(J.engine.perfilCombate(run).ataque, neutro + 2);
  assert.equal(run.atributos.ataque, ataque);
  assert.equal(J.engine.definirPosturaCombate(run, "defensiva"), true);
  assert.equal(J.engine.perfilCombate(run).ataque, neutro - 2);
  assert.equal(J.engine.definirPosturaCombate(run, "inexistente"), false);
  assert.equal(J.engine.definirPosturaCombate(run, "__proto__"), false);
  assert.equal(J.engine.rolarCombate(run), true);
  assert.equal(J.engine.definirPosturaCombate(run, "agressiva"), false);
  assert.equal(run.combatePendente.postura, "defensiva");
});

test("testes e duelos de dados não permitem posturas de combate", () => {
  for (const campo of ["testeDados", "dueloDados"]) {
    const { J, app } = preparar();
    const run = J.estado.novo(J.legado.vazio(), "avarento");
    const evento = J.eventos.find((carta) =>
      carta.opcoes?.some((opcao) => opcao[campo] && !opcao.requisitos),
    );
    const opcao = evento.opcoes.find((item) => item[campo] && !item.requisitos);
    J.engine.registrarSorteio(run, evento);
    assert.equal(J.engine.escolher(run, opcao.id), true);
    assert.equal(J.engine.definirPosturaCombate(run, "agressiva"), false);
    assert.equal(J.engine.rolarCombate(run), true);
    J.ui.jogo(run);
    assert.doesNotMatch(app.innerHTML, /data-acao="combate-postura"/);
    assert.match(app.innerHTML, /disputa-margem/);
    assert.equal(J.engine.continuarCombate(run), true);
    assert.notEqual(run.fase, "combate");
  }
});

test("a leitura de uma derrota fatal não promete Vida restante após o confronto", () => {
  const contexto = combate();
  const { J, run, app, evento } = contexto;
  evento.letal = true;
  rolar(contexto, 10, 10);
  J.ui.jogo(run);
  assert.match(app.innerHTML, /A derrota neste confronto é fatal/);
  assert.doesNotMatch(app.innerHTML, /Vida após o golpe/);
  J.engine.continuarCombate(run);
  assert.equal(run.status, "encerrada");
});

test("derrotas apertadas reduzem o golpe antes de aplicar o Escudo", () => {
  for (const [faceInimigo, diferenca, dano] of [
    [10, 1, 7],
    [11, 2, 7],
    [12, 3, 13],
    [14, 5, 13],
    [15, 6, 19],
  ]) {
    const contexto = combate();
    const { J, run } = contexto;
    rolar(contexto, 10, faceInimigo);
    const hp = run.atributos.hp;
    assert.equal(J.engine.continuarCombate(run), true);
    assert.equal(run.ultimoResultado.combate.diferenca, -diferenca);
    assert.equal(run.ultimoResultado.combate.dano, dano);
    assert.equal(run.atributos.hp, hp - dano);
  }
});

test("posturas aumentam ou reduzem o dano sem alterar a recompensa de um acerto", () => {
  for (const [postura, dano] of [
    ["equilibrada", 19],
    ["agressiva", 25],
    ["defensiva", 11],
  ]) {
    const contexto = combate();
    const { J, run } = contexto;
    J.engine.definirPosturaCombate(run, postura);
    rolar(contexto, 5, 15);
    assert.equal(J.engine.continuarCombate(run), true);
    assert.equal(run.ultimoResultado.combate.dano, dano);
    assert.equal(run.ultimoResultado.combate.postura, postura);
  }
});

test("postura persiste no save e arquivos anteriores recebem a postura equilibrada", () => {
  const { J, run } = combate();
  J.engine.definirPosturaCombate(run, "defensiva");
  assert.equal(J.save.gravarRun(run), true);
  assert.equal(J.save.lerRun().combatePendente.postura, "defensiva");
  const anterior = JSON.parse(JSON.stringify(run));
  delete anterior.combatePendente.postura;
  assert.equal(J.save.gravarRun(anterior), true);
  assert.equal(J.save.lerRun().combatePendente.postura, "equilibrada");
  run.combatePendente.postura = "inexistente";
  assert.equal(J.save.runValida(run), false);
});

test("a previsão do golpe corresponde à perda de Vida contra chefes e a postura pode mudar no próximo turno", () => {
  const contexto = combate("embate_barao");
  const { J, run } = contexto;
  rolar(contexto, 20, 12);
  const perfil = J.engine.perfilCombate(run);
  const previsto = J.engine.calcularDanoDerrota(run, perfil, 20 + perfil.ataque, 12 + perfil.defesa);
  const hp = run.atributos.hp;
  assert.equal(previsto.dano, 7);
  assert.equal(J.engine.continuarCombate(run), true);
  assert.equal(run.atributos.hp, hp - previsto.dano);
  assert.equal(run.combatePendente.vidaChefe, 100);
  assert.equal(run.combatePendente.etapa, "preparacao");
  assert.equal(J.engine.definirPosturaCombate(run, "agressiva"), true);
  for (let acerto = 1; acerto <= 4; acerto++) {
    rolar(contexto, 20, 12);
    assert.equal(J.engine.continuarCombate(run), true);
    assert.equal(run.combatePendente.vidaChefe, 100 - acerto * 25);
  }
  assert.equal(run.combatePendente.etapa, "desfecho");
  assert.equal(J.engine.definirPosturaCombate(run, "defensiva"), false);
  assert.equal(J.engine.continuarCombate(run), true);
  assert.equal(run.status, "encerrada");
  assert.equal(run.fim.tipo, "vitoria_barao");
  assert.equal(run.atributos.hp, hp - previsto.dano);
});

test("a proteção bloqueia só o primeiro contra-ataque e a prévia respeita seu consumo", () => {
  const contexto = combate("embate_barao");
  const { J, run } = contexto;
  run.efeitosPreparados.bloquearDanoProximaBatalha = true;
  const hp = run.atributos.hp;
  rolar(contexto, 20, 12);
  assert.equal(J.engine.calcularDanoDerrota(run, J.engine.perfilCombate(run), 22, 24).dano, 0);
  J.engine.continuarCombate(run);
  assert.equal(run.atributos.hp, hp);
  rolar(contexto, 20, 12);
  assert.equal(J.engine.calcularDanoDerrota(run, J.engine.perfilCombate(run), 22, 24).dano, 7);
  J.engine.continuarCombate(run);
  assert.equal(run.atributos.hp, hp - 7);
});

function chefeCurto(hp, escudo, rerrolagens = 0) {
  const contexto = combate("embate_barao");
  const { run, evento } = contexto;
  Object.assign(evento.batalha, {
    vidaMaxima: 25,
    danoPorAcerto: 25,
    dadosInimigo: 1,
    defesa: 2,
    semAjuste: true,
  });
  evento.batalha.derrota.dano = 10;
  run.combatePendente.vidaChefe = 25;
  run.combatePendente.vidaChefeMaxima = 25;
  run.combatePendente.rerrolagensGratis = rerrolagens;
  run.atributos.hp = hp;
  run.atributos.escudo = escudo;
  return contexto;
}

test("chance contra chefe considera o dano de cada margem, inclusive falhas sem dano", () => {
  const margem = chefeCurto(3, 4);
  const chance = 0.525 * (1 + 0.0925 + 0.0925 ** 2);
  assert.ok(Math.abs(margem.J.engine.chanceVitoriaCombate(margem.run) - chance) < 1e-10);
  const semDano = chefeCurto(3, 9);
  assert.ok(Math.abs(semDano.J.engine.chanceVitoriaCombate(semDano.run) - 26 / 27) < 1e-10);
  const invulneravel = chefeCurto(1, 10);
  assert.ok(Math.abs(invulneravel.J.engine.chanceVitoriaCombate(invulneravel.run) - 1) < 1e-10);
  invulneravel.run.atributos.ataque = -30;
  assert.equal(invulneravel.J.engine.chanceVitoriaCombate(invulneravel.run), 0);
});

test("chance contra chefe preserva a face inimiga na rerrolagem e consome a proteção uma vez", () => {
  const contexto = chefeCurto(1, 0, 1);
  assert.ok(Math.abs(contexto.J.engine.chanceVitoriaCombate(contexto.run) - 0.69125) < 1e-10);
  contexto.run.combatePendente.rerrolagensGratis = 0;
  contexto.run.efeitosPreparados.bloquearDanoProximaBatalha = true;
  assert.ok(Math.abs(contexto.J.engine.chanceVitoriaCombate(contexto.run) - (1 - 0.475 ** 2)) < 1e-10);
});

test("resultado mostra totais, margem e dano real; só um dado empatado conta como escolhido", () => {
  const contexto = combate();
  const { J, run, app } = contexto;
  J.ui.jogo(run);
  assert.match(app.innerHTML, /data-postura="equilibrada" aria-pressed="true"/);
  rolar(contexto, 10, 10);
  J.ui.jogo(run);
  assert.match(app.innerHTML, /<strong>12<\/strong>/);
  assert.match(app.innerHTML, /<strong>13<\/strong>/);
  assert.match(app.innerHTML, /perdeu por 1 ponto/);
  assert.match(app.innerHTML, /Dano do golpe: <strong>7<\/strong>/);
  assert.doesNotMatch(app.innerHTML, /data-acao="combate-postura"/);
  run.combatePendente.dadosHerdeiro = [10, 10];
  J.ui.jogo(run);
  assert.match(app.innerHTML, /Resultado descartado: 10/);
});
