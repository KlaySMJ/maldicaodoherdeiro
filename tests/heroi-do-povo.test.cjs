"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

const simples = (valor) => JSON.parse(JSON.stringify(valor));
const novaHeroi = (J) => J.estado.novo(J.legado.vazio(), "heroi_do_povo");
const emEscolha = (run, eventoId) => {
  run.eventoId = eventoId;
  run.fase = "escolha";
  return run;
};

test("a Heroína do povo começa com 5 de Ataque, 5 de Escudo e honra neutra", () => {
  const { J } = preparar();
  const run = novaHeroi(J);
  assert.equal(run.traco, "heroi_do_povo");
  assert.deepEqual(simples(run.atributos), {
    hp: 100,
    escudo: 5,
    ataque: 5,
    honra: 0,
    habitantes: 50,
    gold: 5,
  });
  assert.equal(run.hpMax, 100);
  assert.deepEqual(simples(run.inventario), []);
});

test("400 de honra concedem a Heroína do povo ao legado e à pool de herdeiros", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");

  run.atributos.honra = 399;
  J.legado.avaliar(run);
  assert.equal(run.conquistas.flags.heroi_do_povo, undefined);

  run.atributos.honra = 400;
  J.legado.avaliar(run);
  assert.equal(run.conquistas.flags.heroi_do_povo, true);
  assert.ok(J.estado.tracosDisponiveis(run.conquistas).includes("heroi_do_povo"));
  assert.equal(J.estado.novo(run.conquistas, "heroi_do_povo").traco, "heroi_do_povo");
});

test("o desbloqueio dispara sozinho ao escolher uma opção que leva a honra a 400", () => {
  const { J } = preparar();
  const run = emEscolha(J.estado.novo(J.legado.vazio(), "corajoso"), "taverna");
  run.atributos.honra = 400;
  run.atributos.gold = 10;
  assert.equal(J.engine.escolher(run, "pagar"), true);
  assert.equal(run.atributos.honra, 401);
  assert.equal(run.conquistas.flags.heroi_do_povo, true);
});

test("a honra da Heroína do povo nunca cai nem fica negativa", () => {
  const { J } = preparar();
  const run = novaHeroi(J);
  run.atributos.honra = 40;

  // Botões de teste e qualquer perda direta são ignorados; ganhos continuam valendo.
  assert.equal(J.engine.testarHonra(run, -30), false);
  assert.equal(run.atributos.honra, 40);
  assert.equal(J.engine.testarHonra(run, 30), true);
  assert.equal(run.atributos.honra, 70);

  // A espada da verdade zera a honra de qualquer herdeiro... menos dela.
  J.engine.concederItem(run, "espada_da_verdade");
  assert.equal(run.atributos.honra, 70);
  const comum = J.estado.novo(J.legado.vazio(), "corajoso");
  comum.atributos.honra = 50;
  J.engine.concederItem(comum, "espada_da_verdade");
  assert.equal(comum.atributos.honra, 0);
});

test("escolhas com honra negativa não derrubam a Heroína do povo", () => {
  const { J } = preparar();
  const dela = emEscolha(novaHeroi(J), "taverna");
  dela.atributos.honra = 40;
  assert.equal(J.engine.escolher(dela, "dispersar"), true);
  assert.equal(dela.atributos.honra, 40);
  assert.equal(dela.atributos.habitantes, 48);

  const dele = emEscolha(J.estado.novo(J.legado.vazio(), "corajoso"), "taverna");
  dele.atributos.honra = 40;
  assert.equal(J.engine.escolher(dele, "dispersar"), true);
  assert.equal(dele.atributos.honra, 39);
});

test("até o chamado do culto não cobra a honra dela", () => {
  const { J, resultado } = preparar();
  const run = novaHeroi(J);
  run.atributos.honra = 60;
  resultado(run);
  run.aguardaDecisaoCulto = true;
  assert.equal(J.engine.juntarCulto(run), true);
  assert.equal(run.cultoAtivo, true);
  assert.equal(run.atributos.honra, 60);
  assert.equal(run.ultimoResultado.alteracoes.honra, 0);
});

test("o chamado na capela só existe para a Heroína do povo", () => {
  const { J } = preparar();
  const evento = J.eventoPorId("o_chamado_na_capela");
  assert.ok(evento, "evento do culto ausente do catálogo");
  assert.equal(evento.peso, 1);

  const dela = novaHeroi(J);
  dela.rodada = 50;
  dela.atributos.honra = 40;
  assert.equal(J.engine.cumpre(evento.requisitos, dela), true);

  const comum = J.estado.novo(J.legado.vazio(), "corajoso");
  comum.rodada = 50;
  comum.atributos.honra = 40;
  assert.equal(J.engine.cumpre(evento.requisitos, comum), false);

  const cultista = novaHeroi(J);
  cultista.rodada = 50;
  cultista.atributos.honra = 40;
  cultista.cultoAtivo = true;
  assert.equal(J.engine.cumpre(evento.requisitos, cultista), false);

  const cedo = novaHeroi(J);
  cedo.rodada = 49;
  cedo.atributos.honra = 40;
  assert.equal(J.engine.cumpre(evento.requisitos, cedo), false);

  const fraca = novaHeroi(J);
  fraca.rodada = 50;
  fraca.atributos.honra = 20;
  assert.equal(J.engine.cumpre(evento.requisitos, fraca), false);
});

test("aceitar o chamado entra no culto sem tocar na honra e valida o save", () => {
  const { J } = preparar();
  const run = emEscolha(novaHeroi(J), "o_chamado_na_capela");
  run.rodada = 50;
  run.atributos.honra = 40;
  assert.ok(J.engine.opcoes(J.eventoPorId("o_chamado_na_capela"), run).some((o) => o.id === "entrar_na_capela"));

  assert.equal(J.engine.escolher(run, "entrar_na_capela"), true);
  assert.equal(run.cultoAtivo, true);
  assert.equal(run.flags.culto_ativo, true);
  assert.equal(run.seguidoresCulto, 50);
  assert.equal(run.marcos.cultoAdesao, 50);
  assert.equal(run.atributos.honra, 40, "a entrada no culto não pode derrubar a honra dela");
  assert.ok(run.inventario.includes("adaga_cerimonial"));
  assert.equal(run.conquistas.flags.culto_conhecido, true);
  assert.equal(J.save.runValida(run), true);
  J.save.gravarRun(run);
  assert.deepEqual(simples(J.save.lerRun()), simples(run));
});

test("o save aceita o traço novo e degrada em vez de descartar um traço desconhecido", () => {
  const { J } = preparar();
  const run = novaHeroi(J);
  const evento = J.engine.sortear(run);
  assert.ok(evento);
  J.engine.registrarSorteio(run, evento);
  J.save.gravarRun(run);
  const lida = J.save.lerRun();
  assert.ok(lida);
  assert.equal(lida.traco, "heroi_do_povo");
  assert.equal(J.save.runValida(lida), true);

  J.save.gravarRun({ ...run, traco: "heroi_revertido" });
  const degradada = J.save.lerRun();
  assert.ok(degradada, "save com traço desconhecido não pode ser descartado");
  assert.equal(degradada.traco, "corajoso");
});

test("os eventos da linha só aparecem para o traço certo", () => {
  const { J } = preparar();
  const dela = novaHeroi(J);
  const dele = J.estado.novo(J.legado.vazio(), "corajoso");
  const linhas = [
    "a_voz_na_praca",
    "pao_do_celeiro",
    "guarda_da_estrada",
    "a_noite_dos_lampioes",
    "o_chamado_na_capela",
    "os_caidos_da_vila",
  ];
  // Rodada e honra altas o bastante para cumprir as janelas da linha inteira.
  dela.rodada = 70;
  dela.atributos.honra = 40;
  dele.rodada = 70;
  dele.atributos.honra = 40;
  for (const id of linhas) {
    const evento = J.eventoPorId(id);
    assert.ok(evento, `evento ausente: ${id}`);
    assert.equal(J.engine.cumpre(evento.requisitos, dela), true, `herói: ${id}`);
    assert.equal(J.engine.cumpre(evento.requisitos, dele), false, `corajoso: ${id}`);
    assert.ok((evento.opcoes || []).length > 0, `sem opções: ${id}`);
  }
});
