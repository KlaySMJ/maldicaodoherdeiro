"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

test("conquistas de crônicas e atributos são acumuladas uma vez no legado", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.flags.abissal_5 = true;
  run.atributos.ataque = 20;
  run.atributos.escudo = 20;
  J.legado.avaliar(run);
  J.legado.avaliar(run);

  const ids = run.conquistas.conquistasDesbloqueadas;
  assert.ok(ids.includes("cronica_abissal"));
  assert.ok(ids.includes("ataque_10"));
  assert.ok(ids.includes("ataque_15"));
  assert.ok(ids.includes("ataque_20"));
  assert.ok(ids.includes("escudo_10"));
  assert.ok(ids.includes("escudo_15"));
  assert.ok(ids.includes("escudo_20"));
  assert.equal(new Set(ids).size, ids.length);

  const legado = J.legado.mesclar(J.legado.vazio(), run.conquistas);
  assert.ok(legado.conquistasDesbloqueadas.includes("cronica_abissal"));
  assert.ok(legado.conquistasDesbloqueadas.includes("ataque_20"));
});

test("vitórias concedem honra alta, baixa ou neutra para o herdeiro certo", () => {
  const { J } = preparar();
  const runAlta = J.estado.novo(J.legado.vazio(), "corajoso");
  runAlta.status = "encerrada";
  runAlta.fim = { tipo: "vitoria", motivo: "Três anos." };
  runAlta.atributos.honra = 30;
  J.legado.avaliar(runAlta);
  assert.ok(runAlta.conquistas.conquistasDesbloqueadas.includes("vitoria_corajoso_honra_alta"));

  const runBaixa = J.estado.novo(J.legado.vazio(), "corajoso");
  runBaixa.status = "encerrada";
  runBaixa.fim = { tipo: "vitoria", motivo: "Três anos." };
  runBaixa.atributos.honra = -30;
  runBaixa.honraSempreNeutra = false;
  J.legado.avaliar(runBaixa);
  assert.ok(runBaixa.conquistas.conquistasDesbloqueadas.includes("vitoria_corajoso_honra_baixa"));

  const runNeutra = J.estado.novo(J.legado.vazio(), "corajoso");
  runNeutra.status = "encerrada";
  runNeutra.fim = { tipo: "vitoria", motivo: "Três anos." };
  runNeutra.atributos.honra = 29;
  J.legado.avaliar(runNeutra);
  assert.ok(runNeutra.conquistas.conquistasDesbloqueadas.includes("vitoria_corajoso_honra_neutra"));
  const outroHerdeiro = J.estado.novo(J.legado.vazio(), "avarento");
  outroHerdeiro.status = "encerrada";
  outroHerdeiro.fim = { tipo: "vitoria", motivo: "Três anos." };
  J.legado.avaliar(outroHerdeiro);
  assert.ok(!outroHerdeiro.conquistas.conquistasDesbloqueadas.includes("vitoria_corajoso_honra_neutra"));
  assert.ok(outroHerdeiro.conquistas.conquistasDesbloqueadas.includes("vitoria_avarento_honra_neutra"));
});

test("run que saiu da faixa neutra não recebe conquista neutra ao voltar", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.status = "encerrada";
  run.fim = { tipo: "vitoria", motivo: "Três anos." };
  run.atributos.honra = 0;
  run.honraSempreNeutra = false;
  J.legado.avaliar(run);
  assert.ok(!run.conquistas.conquistasDesbloqueadas.includes("vitoria_corajoso_honra_neutra"));
});

test("o Conselheiro inicia com 30 de Honra e fica fora da faixa neutra", () => {
  const { J } = preparar();
  const legado = J.legado.vazio();
  legado.flags.menino_cronista = true;
  const run = J.estado.novo(legado, "menino_cronista");
  assert.equal(run.atributos.honra, 30);
  assert.equal(run.honraSempreNeutra, false);
});

test("conquistas de honra não oferecem faixas impossíveis para cada herdeiro", () => {
  const { J } = preparar();
  const menino = J.conquistas.lista.map((conquista) => conquista.id);
  assert.ok(!menino.includes("vitoria_menino_cronista_honra_neutra"));
  assert.ok(!menino.includes("vitoria_heroi_do_povo_honra_baixa"));
  assert.ok(menino.includes("heroi_do_povo_vitoria_honra_neutra"));

  const legado = J.legado.vazio();
  legado.flags.heroi_do_povo = true;
  const run = J.estado.novo(legado, "heroi_do_povo");
  run.status = "encerrada";
  run.fim = { tipo: "vitoria", motivo: "Três anos." };
  J.legado.avaliar(run);
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("heroi_do_povo_vitoria_honra_neutra"));
});

test("cinco estruturas e todas as dez estruturas são conquistas por crônica", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  const ids = [
    "ponte",
    "moinho",
    "capela",
    "forja",
    "muralha",
    "mercado_coberto",
    "torre_vigia",
    "enfermaria_ervateira",
    "praca_forca",
    "celeiro",
  ];

  run.construcoes = ids.slice(0, 4);
  J.legado.avaliar(run);
  assert.ok(!run.conquistas.conquistasDesbloqueadas.includes("cinco_estruturas"));
  run.construcoes.push(ids[4]);
  J.legado.avaliar(run);
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("cinco_estruturas"));
  assert.ok(!run.conquistas.conquistasDesbloqueadas.includes("todas_estruturas"));
  run.construcoes = ids;
  J.legado.avaliar(run);
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("todas_estruturas"));
});

test("progresso das transformações acumula entre crônicas", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.flags.condicao_abracada_licantropia = true;
  J.legado.avaliar(run);
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("primeira_transformacao"));
  assert.ok(!run.conquistas.conquistasDesbloqueadas.includes("todas_transformacoes"));

  const legadoParcial = J.legado.mesclar(J.legado.vazio(), run.conquistas);
  const proxima = J.estado.novo(legadoParcial, "corajoso");
  proxima.flags.condicao_abracada_vampirismo = true;
  J.legado.avaliar(proxima);
  assert.ok(!proxima.conquistas.conquistasDesbloqueadas.includes("todas_transformacoes"));
  const legadoComDuas = J.legado.mesclar(legadoParcial, proxima.conquistas);
  const terceira = J.estado.novo(legadoComDuas, "corajoso");
  terceira.flags.condicao_abracada_possessao = true;
  J.legado.avaliar(terceira);
  assert.ok(terceira.conquistas.conquistasDesbloqueadas.includes("todas_transformacoes"));
});

test("zodíaco e deuses nórdicos acumulam eventos vistos entre crônicas", () => {
  const { J } = preparar();
  const zodiacos = J.eventos.filter((evento) => evento.zodiaco);
  const deuses = J.eventos.filter((evento) => evento.divino);
  assert.ok(zodiacos.length > 0);
  assert.ok(deuses.length > 0);

  const primeira = J.estado.novo(J.legado.vazio(), "corajoso");
  for (const evento of zodiacos.slice(0, -1)) J.engine.registrarSorteio(primeira, evento);
  J.legado.avaliar(primeira);
  assert.ok(!primeira.conquistas.conquistasDesbloqueadas.includes("todos_zodiacos"));
  for (const evento of deuses.slice(0, -1)) J.engine.registrarSorteio(primeira, evento);
  J.legado.avaliar(primeira);
  assert.ok(!primeira.conquistas.conquistasDesbloqueadas.includes("todos_deuses_nordicos"));

  const legado = J.legado.mesclar(J.legado.vazio(), primeira.conquistas);
  const segunda = J.estado.novo(legado, "corajoso");
  J.engine.registrarSorteio(segunda, zodiacos.at(-1));
  J.engine.registrarSorteio(segunda, deuses.at(-1));
  J.legado.avaliar(segunda);
  assert.ok(segunda.conquistas.conquistasDesbloqueadas.includes("todos_zodiacos"));
  assert.ok(segunda.conquistas.conquistasDesbloqueadas.includes("todos_deuses_nordicos"));
});

test("resistir à Entidade concede a conquista correspondente", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.flags.entidade_x_imune = true;
  J.legado.avaliar(run);
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("resistir_entidade"));
});

test("Gold, habitantes e Seguidores desbloqueiam marcos ao atingir os valores definidos", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.atributos.gold = 99;
  run.atributos.habitantes = 99;
  J.legado.avaliar(run);
  let ids = run.conquistas.conquistasDesbloqueadas;
  assert.ok(!ids.includes("gold_100"));
  assert.ok(!ids.includes("habitantes_100"));

  run.atributos.gold = 300;
  run.atributos.habitantes = 300;
  run.cultoAtivo = true;
  run.seguidoresCulto = 300;
  J.legado.avaliar(run);
  ids = run.conquistas.conquistasDesbloqueadas;
  for (const valor of [100, 200, 300]) {
    assert.ok(ids.includes(`gold_${valor}`));
    assert.ok(ids.includes(`habitantes_${valor}`));
    assert.ok(ids.includes(`seguidores_${valor}`));
  }
});

test("mortes específicas registram a carta que encerrou a crônica", () => {
  const { J } = preparar();
  for (const [eventoId, conquista] of [
    ["barao", "morte_devedor_barao"],
    ["dados_do_velho", "morte_jogo_dados"],
    ["travessia_do_gelo", "morte_travessia_gelo"],
  ]) {
    const run = J.estado.novo(J.legado.vazio(), "corajoso");
    run.eventoId = eventoId;
    J.engine.encerrar(run, "derrota", "Fim de teste.");
    assert.ok(run.conquistas.conquistasDesbloqueadas.includes(conquista), eventoId);
  }
});

test("a conquista do barão entra no histórico assim que o evento é resolvido", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.rodada = 12;
  run.eventoId = "volta_do_barao";
  run.atributos.gold = 20;

  assert.equal(J.engine.escolher(run, "pagar"), true);
  assert.equal(run.flags.volta_barao_sobreviveu, true);
  assert.equal(run.status, "ativa");
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("barão_resolvido_sobreviveu"));
  assert.ok(J.save.lerLegado().conquistasDesbloqueadas.includes("barão_resolvido_sobreviveu"));

  J.engine.encerrar(run, "derrota", "Fim de teste.");
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("barão_resolvido_sobreviveu"));
  assert.equal(J.save.finalizar(run), true);
  assert.ok(J.save.lerLegado().conquistasDesbloqueadas.includes("barão_resolvido_sobreviveu"));
});

test("sobreviver ao primeiro e ao segundo ano concede marcos de crônica", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.rodada = 99;
  J.legado.avaliar(run);
  assert.ok(!run.conquistas.conquistasDesbloqueadas.includes("sobreviver_100"));

  run.rodada = 100;
  J.legado.avaliar(run);
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("sobreviver_100"));
  run.rodada = 200;
  J.legado.avaliar(run);
  assert.ok(run.conquistas.conquistasDesbloqueadas.includes("sobreviver_200"));
});
