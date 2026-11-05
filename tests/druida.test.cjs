"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

test("as estações do druida mudam a cada 25 rodadas", () => {
  const { J } = preparar();
  assert.deepEqual([1, 25, 26, 50, 51, 75, 76, 100].map(J.druida.estacaoDaRodada), [
    "primavera",
    "primavera",
    "verao",
    "verao",
    "outono",
    "outono",
    "inverno",
    "inverno",
  ]);
  assert.equal(J.druida.estacaoDaRodada(101), "primavera");
});

test("novaRun aplica atributos e equipamento inicial do druida", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "druida_herdeiro");

  assert.equal(run.traco, "druida_herdeiro");
  assert.deepEqual(JSON.parse(JSON.stringify(run.atributos)), {
    hp: 110,
    escudo: 2,
    ataque: 4,
    honra: 0,
    habitantes: 50,
    gold: 3,
  });
  assert.equal(run.hpMax, 110);
  assert.equal(run.druidaPassiva, "lobo");
  assert.ok(run.inventario.includes("cajado_de_carvalho_vivo"));
  assert.ok(run.itensConquistados.includes("cajado_de_carvalho_vivo"));
  assert.equal(run.comprasMercador.arma_melhor, 1);
});

test("as três passivas aplicam seus efeitos e a do corvo prepara uma previsão", () => {
  const { J, definirAleatorio } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "druida_herdeiro");
  const evento = { id: "evento-teste", tipo: "encontro", opcoes: [{ id: "primeira" }, { id: "segunda" }] };

  definirAleatorio(0.5);
  J.druida.iniciar(run);
  assert.equal(run.druidaPassiva, "corvo");
  J.druida.prepararEvento(run, evento);
  assert.equal(run.previsaoCorvo, "encontro");
  assert.equal(run.corvoRevelaOpcaoId, "segunda");

  definirAleatorio(0.99);
  run.atributos.hp = 100;
  J.druida.iniciar(run);
  assert.equal(run.druidaPassiva, "cervo");
  assert.equal(run.atributos.hp, 103);
  run.inventario.push("mascara_de_cervo");
  run.atributos.hp = 100;
  J.druida.iniciar(run);
  assert.equal(run.atributos.hp, 104);

  definirAleatorio(0);
  J.druida.iniciar(run);
  assert.equal(run.druidaPassiva, "lobo");
  assert.equal(J.druida.bonusAtaqueCombate(run), 2);
});

test("o cajado cresce na primavera, o bosque atrai moradores e a plantação é única", () => {
  const { J, definirAleatorio } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "druida_herdeiro");
  definirAleatorio(0.25);

  run.rodada = 101;
  run.estacao = "primavera";
  run.cajadoBonusAtaque = 3;
  const ataqueAntes = run.atributos.ataque;
  J.druida.iniciar(run);
  assert.equal(run.cajadoBonusAtaque, 4);
  assert.equal(run.atributos.ataque, ataqueAntes + 1);

  run.rodada = 5;
  run.flags.bosque_sagrado = true;
  const habitantesAntes = run.atributos.habitantes;
  J.druida.iniciar(run);
  assert.equal(run.atributos.habitantes, habitantesAntes + 1);
  assert.equal(J.druida.plantarBosque(run), false);

  run.flags.bosque_sagrado = false;
  assert.equal(J.druida.plantarBosque(run), true);
  assert.equal(J.druida.plantarBosque(run), false);
});

test("o druida registra uma avaliação anual no máximo uma vez e reinicia a sequência", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "druida_herdeiro");
  run.rodada = 100;
  run.atributos.honra = J.config.honraAlta;
  run.druidaAnosAlta = 2;

  J.druida.registrarAno(run);
  J.druida.registrarAno(run);
  assert.equal(run.druidaAnosAlta, 3);
  assert.equal(run.druidaAnoAvaliado, 100);

  run.rodada = 200;
  run.atributos.honra = 0;
  J.druida.registrarAno(run);
  assert.equal(run.druidaAnosAlta, 0);
  assert.equal(run.druidaAnoAvaliado, 200);
});
