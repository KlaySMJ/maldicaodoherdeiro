"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

function iniciar(J, run, eventoId = "saqueadores", opcaoId = "combater", tracoInimigo = "nenhum") {
  run.eventoId = eventoId;
  run.debugTracoInimigo = tracoInimigo;
  J.engine.registrarSorteio(run, J.eventoPorId(eventoId));
  assert.equal(J.engine.escolher(run, opcaoId), true, `${eventoId}:${opcaoId}`);
}

function rolar(J, run) {
  assert.equal(J.engine.rolarCombate(run), true);
}

function resolver(J, run, eventoId = "saqueadores", opcaoId = "combater", tracoInimigo = "nenhum") {
  iniciar(J, run, eventoId, opcaoId, tracoInimigo);
  rolar(J, run);
  assert.equal(J.engine.continuarCombate(run), true);
  return run.ultimoResultado.combate;
}

function novaRun(J, traco = "corajoso") {
  return J.estado.novo(J.legado.vazio(), traco);
}

test("vitória não causa dano; derrota apertada reduz o golpe Feroz antes do Escudo", () => {
  const vitoria = preparar();
  const runVitoria = novaRun(vitoria.J);
  const combateVencido = resolver(vitoria.J, runVitoria);
  assert.equal(combateVencido.venceu, true);
  assert.equal(combateVencido.dano, 0);
  assert.equal(runVitoria.atributos.hp, runVitoria.hpMax);
  assert.equal(
    vitoria.J.engine.batalhaAjustada(runVitoria, vitoria.J.eventoPorId("saqueadores").batalha).vitoria.dano,
    0,
  );

  const derrota = preparar();
  const runDerrota = novaRun(derrota.J);
  runDerrota.atributos.ataque = 0;
  const combatePerdido = resolver(derrota.J, runDerrota, "saqueadores", "combater", "feroz");
  assert.equal(combatePerdido.venceu, false);
  assert.equal(combatePerdido.dano, 10);
  assert.equal(runDerrota.atributos.hp, 110);
});

test("Doente reduz Defesa na primeira rodada e em batalhas sem ajuste", () => {
  const { J } = preparar();
  const run = novaRun(J, "doente");
  const batalha = J.eventoPorId("saqueadores").batalha;
  assert.equal(J.engine.batalhaAjustada(run, batalha).defesa, batalha.defesa - 1);
  assert.equal(J.engine.batalhaAjustada(run, { ...batalha, semAjuste: true }).defesa, batalha.defesa - 1);
});

test("Bruxo acrescenta dados ao conjunto inimigo e usa o menor", () => {
  const { J, definirAleatorios } = preparar();
  const run = novaRun(J, "bruxo");
  run.rodada = 30;
  iniciar(J, run, "capitao_dos_salteadores", "combater");
  const perfil = J.engine.perfilCombate(run);
  assert.equal(perfil.dadosInimigo, 3);
  assert.equal(perfil.inimigoEscolheMenor, true);
  definirAleatorios([0.2, 0.95, 0]);
  rolar(J, run);
  assert.deepEqual(JSON.parse(JSON.stringify(run.combatePendente.dadosInimigo)), [20, 1, 6]);
  assert.equal(J.engine.continuarCombate(run), true);
  assert.equal(run.ultimoResultado.combate.dadoInimigo, 1);
});

test("o d20 do Baltazar usa preto com malha clara para continuar legível", () => {
  const { J, app } = preparar();
  const run = novaRun(J, "herdeiro_culto");
  iniciar(J, run);
  J.ui.jogo(run);
  assert.match(app.innerHTML, /data-cor="#000000"/);
});

test("cada face do Coringa aplica o efeito à disputa atual", () => {
  const { J } = preparar();
  for (const face of [1, 2, 3, 4, 5, 6]) {
    const run = novaRun(J, "coringa");
    run.debugFaceCoringa = face;
    iniciar(J, run);
    const perfil = J.engine.perfilCombate(run);
    assert.equal(perfil.coringa, face);
    assert.equal(perfil.dadosHerdeiro, face === 1 ? 2 : 1);
    assert.equal(perfil.ataque, 2 + (face === 2 ? 2 : 0));
    assert.equal(perfil.dadosInimigo, face === 3 ? 2 : 1);
    assert.equal(perfil.defesa, 3 - (face === 5 ? 1 : 0));
    assert.equal(run.combatePendente.rerrolagemCoringa, face === 4 ? 1 : 0);
  }
});

test("rerrolagem do Coringa rola o conjunto inteiro uma vez", () => {
  const { J, definirAleatorios } = preparar();
  const run = novaRun(J, "coringa");
  run.debugFaceCoringa = 4;
  J.engine.concederItem(run, "dado_da_linhagem");
  iniciar(J, run);
  definirAleatorios([0.1, 0.2, 0.3]);
  rolar(J, run);
  const dadosInimigo = [...run.combatePendente.dadosInimigo];
  const dadosAntigos = [...run.combatePendente.dadosHerdeiro];
  assert.equal(J.engine.rerrolarCombateGratuito(run), true);
  assert.notDeepEqual(run.combatePendente.dadosHerdeiro, dadosAntigos);
  assert.deepEqual(JSON.parse(JSON.stringify(run.combatePendente.dadosInimigo)), dadosInimigo);
  assert.equal(run.combatePendente.rerrolagemCoringa, 0);
  assert.equal(J.engine.rerrolarCombateGratuito(run), false);
});

test("itens de dados afetam apenas o conjunto do herdeiro", () => {
  const { J, definirAleatorios } = preparar();
  const run = novaRun(J);
  J.engine.concederItem(run, "dado_viciado");
  J.engine.concederItem(run, "dado_da_linhagem");
  J.engine.concederItem(run, "trevo_da_sorte");
  iniciar(J, run);
  const perfil = J.engine.perfilCombate(run);
  assert.equal(perfil.dadosHerdeiro, 2);
  assert.equal(perfil.dadosInimigo, 1);
  assert.equal(perfil.bonusResultado, 5);
  definirAleatorios([0, 0, 0]);
  rolar(J, run);
  assert.deepEqual(JSON.parse(JSON.stringify(run.combatePendente.dadosHerdeiro)), [5, 5]);
  assert.deepEqual(JSON.parse(JSON.stringify(run.combatePendente.dadosInimigo)), [1]);
});

test("Dado lascado substitui só a menor face uma vez e permanece no inventário", () => {
  const { J, definirAleatorios, definirAleatorio } = preparar();
  const run = novaRun(J);
  J.engine.concederItem(run, "dado_da_linhagem");
  J.engine.concederItem(run, "dado_lascado");
  iniciar(J, run);
  definirAleatorios([0.1, 0.3, 0.4]);
  rolar(J, run);
  const anterior = [...run.combatePendente.dadosHerdeiro];
  definirAleatorio(0.95);
  assert.equal(J.engine.usarItem(run, "dado_lascado"), true);
  assert.deepEqual(JSON.parse(JSON.stringify(run.combatePendente.dadosHerdeiro)), [20, anterior[1]]);
  assert.equal(run.inventario.includes("dado_lascado"), true);
  assert.equal(J.engine.podeUsarItem(run, "dado_lascado"), false);
});

test("Coringa registra um 20 natural mesmo quando depois rerrola o conjunto", () => {
  const { J, definirAleatorios } = preparar();
  const run = novaRun(J);
  J.engine.concederItem(run, "dado_do_destino");
  iniciar(J, run);
  definirAleatorios([0.999, 0]);
  rolar(J, run);
  assert.equal(run.dadosNaturais20Combate, 1);
  definirAleatorios([0.25]);
  assert.equal(J.engine.usarItem(run, "dado_do_destino"), true);
  assert.equal(run.combatePendente.dadosHerdeiro[0], 6);
  assert.equal(J.herdeiros.condicoes.coringa(run), true);
});

test("Veloz ganha o empate, Cego usa o menor dado e Feroz só aumenta o dano da derrota", () => {
  const veloz = preparar();
  const runVeloz = novaRun(veloz.J);
  const resultadoVeloz = resolver(veloz.J, runVeloz, "saqueadores", "combater", "veloz");
  assert.equal(resultadoVeloz.totalHerdeiro, resultadoVeloz.totalInimigo);
  assert.equal(resultadoVeloz.venceu, false);

  const cego = preparar();
  const runCego = novaRun(cego.J);
  iniciar(cego.J, runCego, "saqueadores", "combater", "cego");
  assert.equal(cego.J.engine.perfilCombate(runCego).dadosInimigo, 2);
  assert.equal(cego.J.engine.perfilCombate(runCego).inimigoEscolheMenor, true);
});

test("pausa batalhas por quatro rodadas, mas o modo de debug continua sorteando combate", () => {
  const { J } = preparar();
  const run = novaRun(J);
  J.eventos = [J.eventoPorId("saqueadores")];
  run.ultimaBatalhaRodada = 10;
  run.rodada = 13;
  assert.equal(
    J.engine.sortear(run, () => 0),
    null,
  );
  run.rodada = 14;
  assert.equal(J.engine.sortear(run, () => 0)?.id, "saqueadores");
  run.rodada = 12;
  run.flags.debugSempreCombate = true;
  assert.equal(J.engine.sortear(run, () => 0)?.id, "saqueadores");
});

test("escalonamento preserva a base e aumenta a Defesa e o dano a cada ano", () => {
  const { J } = preparar();
  const run = novaRun(J);
  const batalha = J.eventoPorId("saqueadores").batalha;
  for (const rodada of [60, 100, 250]) {
    run.rodada = rodada;
    const ajustada = J.engine.batalhaAjustada(run, batalha);
    const anos = J.anoDaRodada(rodada) - 1;
    assert.equal(ajustada.defesa, batalha.defesa + 4 + anos * 3);
    assert.equal(ajustada.vitoria.dano, 0);
    assert.equal(ajustada.derrota.dano, batalha.derrota.dano + 8 + anos * 2);
  }
});

test("as doze cartas novas são batalhas próprias sem ilustrações novas", () => {
  const { J } = preparar();
  const ids = [
    "caes_famintos",
    "os_naufragos",
    "carroca_virada",
    "bando_da_tocha",
    "cavaleiro_sem_senhor",
    "almas_do_pantano",
    "arqueiros_da_colina",
    "capitao_dos_salteadores",
    "morto_da_estrada",
    "feridos_da_guerra",
    "gigante_do_fosso",
    "cavaleiros_negros",
  ];
  const cartas = ids.map((id) => J.eventoPorId(id));
  assert.equal(cartas.filter(Boolean).length, 12);
  assert.ok(cartas.every((evento) => evento.tipo === "batalha" && evento.imagem === "assets/batalha.webp"));
  assert.ok(cartas.every((evento) => evento.batalha.dadosInimigo === 1 || evento.batalha.dadosInimigo === 2));
  assert.equal(cartas.filter((evento) => evento.opcoes.some((opcao) => !opcao.combate)).length, 3);
});

test("duelo do velho registra os dois d20, o bônus e as chances combinadas", () => {
  const { J, app, definirAleatorios, novaRun: criarRun } = preparar();
  const run = criarRun();
  run.atributos.gold = 10;
  run.flags.dados_revanche_disponivel = true;
  const ganhos = [0, 0];
  for (let herdeiro = 1; herdeiro <= 20; herdeiro += 1) {
    for (let velho = 1; velho <= 20; velho += 1) {
      if (herdeiro > velho) ganhos[0] += 1;
      if (herdeiro > velho + 1) ganhos[1] += 1;
    }
  }
  assert.equal(ganhos[0] / 400, 0.475);
  assert.equal(ganhos[1] / 400, 0.4275);

  run.eventoId = "revanche_dados";
  J.engine.registrarSorteio(run, J.eventoPorId("revanche_dados"));
  definirAleatorios([0.5, 0.5]);
  assert.equal(J.engine.escolher(run, "apostar_dez"), true);
  assert.deepEqual(JSON.parse(JSON.stringify(run.ultimoResultado.dueloDados)), {
    dadoHerdeiro: 11,
    dadoOponente: 11,
    bonusOponente: 1,
    totalHerdeiro: 11,
    totalOponente: 12,
    vencedor: "oponente",
  });
  assert.equal(J.save.runValida(run), true);
  J.ui.jogo(run);
  assert.match(app.innerHTML, /resultado-duelo-dados/);
});

test("Defesa acompanha uma parcela pequena do Ataque permanente", () => {
  const { J } = preparar();
  const run = novaRun(J);
  const batalha = J.eventoPorId("saqueadores").batalha;
  run.rodada = 100;
  for (const [ataque, bonus] of [
    [-5, 0],
    [5, 0],
    [9, 0],
    [10, 1],
    [20, 3],
    [30, 5],
  ]) {
    run.atributos.ataque = ataque;
    assert.equal(J.engine.batalhaAjustada(run, batalha).defesa, batalha.defesa + 4 + bonus);
  }
  run.atributos.ataque = 20;
  for (const [rodada, bonus] of [
    [100, 7],
    [101, 10],
    [200, 10],
    [201, 13],
  ]) {
    run.rodada = rodada;
    assert.equal(J.engine.batalhaAjustada(run, batalha).defesa, batalha.defesa + bonus);
  }
  const fixa = J.engine.batalhaAjustada(run, { ...batalha, semAjuste: true });
  assert.equal(fixa.defesa, batalha.defesa);
});
