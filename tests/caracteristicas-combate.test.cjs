"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { preparar } = require("./helpers/jogo.cjs");

function criar(traco, chefe = false) {
  const contexto = preparar();
  const { J } = contexto;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../js/events-bosses.js"), "utf8"), {
    window: { Jogo: J },
  });
  const run = J.estado.novo(J.legado.vazio(), "avarento");
  const evento = J.eventoPorId(chefe ? "embate_barao" : "saqueadores");
  evento.batalha.semAjuste = true;
  evento.batalha.defesa = 6;
  evento.batalha.dadosInimigo = 1;
  evento.batalha.derrota.dano = 20;
  if (chefe) {
    evento.batalha.vidaMaxima = 50;
    evento.batalha.danoPorAcerto = 25;
  }
  run.debugTracoInimigo = traco;
  run.atributos.ataque = 6;
  run.atributos.escudo = 0;
  J.engine.registrarSorteio(run, evento);
  assert.equal(J.engine.escolher(run, evento.opcoes.find((o) => o.combate).id), true);
  return { ...contexto, run, evento };
}

function turno(c, herdeiro, inimigo) {
  const { J, run } = c;
  assert.equal(J.engine.rolarCombate(run), true);
  run.combatePendente.dadosHerdeiro.fill(herdeiro);
  run.combatePendente.dadosInimigo.fill(inimigo);
  return J.engine.continuarCombate(run);
}

function dano(c, herdeiro = 0, inimigo = 20) {
  return c.J.engine.calcularDanoDerrota(c.run, c.J.engine.perfilCombate(c.run), herdeiro, inimigo);
}

test("catálogo completo oferece resumo, seleção, sorteio compatível e save", () => {
  const catalogo = preparar().J.engine.caracteristicasCombate;
  assert.equal(Object.keys(catalogo).length, 32);
  for (const [id, definicao] of Object.entries(catalogo)) {
    const c = criar(id, Boolean(definicao.chefe));
    assert.equal(c.run.combatePendente.tracoInimigo, id);
    c.J.ui.jogo(c.run);
    assert.ok(c.app.innerHTML.includes('data-acao="combate-caracteristica"'));
    assert.ok(c.app.innerHTML.includes('class="disputa-caracteristica-resumo" hidden'));
    assert.ok(c.app.innerHTML.includes(definicao.nome));
    c.J.save.gravarRun(c.run);
    const salva = c.J.save.lerRun();
    assert.ok(salva, id);
    assert.equal(salva.combatePendente.tracoInimigo, id);
  }
  const c = criar("nenhum");
  const comuns = c.J.engine.tracosElegiveis(c.evento);
  assert.ok(!comuns.includes("tenaz"));
  assert.ok(!c.J.engine.tracosElegiveis({ ...c.evento, letal: true }).includes("piedoso"));
});

test("posturas, distração e modificadores de dano usam os valores anunciados", () => {
  const distraido = criar("distraido");
  const defesa = distraido.J.engine.perfilCombate(distraido.run).defesa;
  const gold = distraido.run.atributos.gold;
  assert.equal(distraido.J.engine.distrairInimigo(distraido.run), true);
  assert.equal(distraido.run.atributos.gold, gold - 1);
  assert.equal(distraido.J.engine.distrairInimigo(distraido.run), false);
  assert.equal(distraido.J.engine.perfilCombate(distraido.run).defesa, defesa - 3);
  for (const [id, postura, esperado] of [
    ["duelista", "defensiva", 4],
    ["covarde", "defensiva", 8],
    ["covarde", "agressiva", 4],
  ]) {
    const c = criar(id);
    c.J.engine.definirPosturaCombate(c.run, postura);
    assert.equal(c.J.engine.perfilCombate(c.run).defesa, esperado);
  }
  assert.equal(dano(criar("exausto")).danoBase, 16);
  assert.equal(dano(criar("oportunista")).danoBase, 24);
  const agouro = criar("agourento");
  assert.equal(dano(agouro, 7, 30).danoBase, 26);
  assert.equal(dano(agouro, 8, 30).danoBase, 20);
  const sangue = criar("sanguinario");
  sangue.run.atributos.hp = sangue.run.hpMax / 4;
  assert.equal(dano(sangue).danoBase, 24);
  const perseguidor = criar("perseguidor");
  perseguidor.run.atributos.escudo = 8;
  perseguidor.J.engine.definirPosturaCombate(perseguidor.run, "defensiva");
  assert.equal(dano(perseguidor).escudo, 5);
  const temerario = criar("temerario");
  assert.equal(temerario.J.engine.perfilCombate(temerario.run).dadosHerdeiro, 2);
  assert.equal(temerario.J.engine.perfilCombate(temerario.run).dadosInimigo, 2);
});

test("estados dos chefes mudam ao confirmar o turno e preservam o golpe final", () => {
  const tenaz = criar("tenaz", true);
  turno(tenaz, 20, 1);
  turno(tenaz, 20, 1);
  assert.equal(tenaz.run.combatePendente.vidaChefe, 1);
  assert.match(tenaz.run.combatePendente.ultimaTrocaChefe, /Tenaz/);
  turno(tenaz, 20, 1);
  assert.equal(tenaz.run.combatePendente.etapa, "desfecho");
  assert.equal(tenaz.J.engine.continuarCombate(tenaz.run), true);
  assert.equal(tenaz.run.ultimoResultado.combate.venceu, true);
  const sentinela = criar("sentinela", true);
  turno(sentinela, 20, 1);
  assert.equal(sentinela.run.combatePendente.vidaChefe, 37);
  turno(sentinela, 20, 1);
  assert.equal(sentinela.run.combatePendente.vidaChefe, 12);
  const vingativo = criar("vingativo", true);
  turno(vingativo, 20, 1);
  assert.equal(dano(vingativo).danoBase, 24);
  turno(vingativo, 1, 20);
  assert.equal(dano(vingativo).danoBase, 20);
  const impaciente = criar("impaciente", true);
  for (let i = 0; i < 4; i++) turno(impaciente, 1, 20);
  assert.equal(impaciente.run.combatePendente.impaciencia, 3);
  turno(impaciente, 20, 1);
  assert.equal(impaciente.run.combatePendente.impaciencia, 0);
  const hesitante = criar("hesitante", true);
  assert.equal(hesitante.J.engine.perfilCombate(hesitante.run).defesa, 3);
  turno(hesitante, 1, 20);
  assert.equal(hesitante.J.engine.perfilCombate(hesitante.run).defesa, 6);
  const adaptavel = criar("adaptavel", true);
  turno(adaptavel, 1, 20);
  assert.equal(adaptavel.J.engine.perfilCombate(adaptavel.run).defesa, 8);
  adaptavel.J.engine.definirPosturaCombate(adaptavel.run, "agressiva");
  assert.equal(adaptavel.J.engine.perfilCombate(adaptavel.run).defesa, 6);
});

test("margem e Vida controlam Resiliente, Frágil, Berserker, Metódico e Encurralado", () => {
  for (const [id, margem, esperado] of [
    ["resiliente", 2, 13],
    ["resiliente", 3, 25],
    ["fragil", 6, 35],
    ["fragil", 5, 25],
    ["metodico", 5, 19],
  ]) {
    const c = criar(id, true);
    assert.equal(
      c.J.engine.danoAcertoChefe(c.run, c.J.engine.perfilCombate(c.run), 20 + margem, 20),
      esperado,
    );
  }
  const berserker = criar("berserker", true);
  berserker.run.combatePendente.vidaChefe = 25;
  assert.equal(dano(berserker).danoBase, 26);
  const concentrado = criar("concentrado", true);
  assert.equal(dano(concentrado).danoBase, 26);
  turno(concentrado, 20, 1);
  assert.equal(dano(concentrado).danoBase, 20);
  const encurralado = criar("encurralado", true);
  encurralado.run.combatePendente.vidaChefe = 12;
  assert.equal(encurralado.J.engine.perfilCombate(encurralado.run).defesa, 9);
});

test("recompensas e saque só acontecem na confirmação correta", () => {
  const generoso = criar("generoso");
  generoso.run.atributos.hp = 50;
  turno(generoso, 20, 1);
  assert.equal(generoso.run.atributos.hp, 58);
  const marcado = criar("marcado", true);
  const gold = marcado.run.atributos.gold;
  turno(marcado, 20, 1);
  assert.equal(marcado.run.atributos.gold, gold);
  turno(marcado, 19, 1);
  marcado.J.engine.continuarCombate(marcado.run);
  assert.ok(marcado.run.atributos.gold >= gold + 2);
  const colecionador = criar("colecionador");
  const premio = colecionador.run.combatePendente.premioItemId;
  assert.ok(premio);
  turno(colecionador, 20, 1);
  assert.ok(colecionador.run.itensConquistados.includes(premio));
  const saqueador = criar("saqueador", true);
  const saldo = saqueador.run.atributos.gold;
  turno(saqueador, 1, 20);
  turno(saqueador, 1, 20);
  assert.equal(saqueador.run.atributos.gold, Math.max(0, saldo - 2));
  const piedoso = criar("piedoso", true);
  piedoso.run.atributos.hp = 3;
  turno(piedoso, 1, 20);
  assert.equal(piedoso.run.combatePendente, null);
  assert.equal(piedoso.run.ultimoResultado.combate.venceu, false);
});

test("chances dos chefes consideram sobrevivência e dano variável sem mutar a partida", () => {
  for (const id of [
    "tenaz",
    "resiliente",
    "fragil",
    "sentinela",
    "impaciente",
    "adaptavel",
    "berserker",
    "concentrado",
    "metodico",
    "vingativo",
    "sanguinario",
    "piedoso",
  ]) {
    const c = criar(id, true);
    c.run.atributos.hp = 20;
    const antes = JSON.stringify(c.run);
    const chance = c.J.engine.chanceVitoriaCombate(c.run);
    assert.ok(Number.isFinite(chance) && chance >= 0 && chance <= 1, id);
    assert.equal(JSON.stringify(c.run), antes);
  }
  const c = criar("tenaz", true);
  c.run.combatePendente.rerrolagensGratis = 1;
  const comRerrolagem = c.J.engine.chanceVitoriaCombate(c.run);
  c.run.combatePendente.rerrolagensGratis = 0;
  assert.ok(comRerrolagem >= c.J.engine.chanceVitoriaCombate(c.run));
});

test("chance de Tenaz exige o acerto adicional e a proteção só cobre uma falha", () => {
  const c = criar("tenaz", true);
  c.run.atributos.hp = 1;
  // Com Ataque e Defesa iguais, uma rolagem vence com probabilidade 21/40.
  // Tenaz exige três acertos; qualquer falha sem proteção encerra a luta.
  const p = 21 / 40;
  assert.ok(Math.abs(c.J.engine.chanceVitoriaCombate(c.run) - p ** 3) < 1e-9);
  c.run.efeitosPreparados.bloquearDanoProximaBatalha = true;
  assert.ok(Math.abs(c.J.engine.chanceVitoriaCombate(c.run) - p ** 3 * (1 + 3 * (1 - p))) < 1e-9);
  const salvo = JSON.stringify(c.run);
  c.J.save.gravarRun(c.run);
  assert.ok(c.J.save.lerRun());
  assert.equal(JSON.stringify(c.run), salvo);
});

test("estados confirmados persistem e uma rerrolagem preserva a característica", () => {
  const c = criar("vingativo", true);
  turno(c, 20, 1);
  c.J.save.gravarRun(c.run);
  const carregada = c.J.save.lerRun();
  assert.equal(carregada.combatePendente.retaliacao, true);
  assert.equal(carregada.combatePendente.acertosRecebidos, 1);
  assert.equal(carregada.combatePendente.posturaAnterior, "equilibrada");
  assert.equal(dano({ ...c, run: carregada }).danoBase, 24);
  carregada.combatePendente.rerrolagensGratis = 1;
  c.J.engine.rolarCombate(carregada);
  assert.equal(c.J.engine.rerrolarCombateGratuito(carregada), true);
  assert.equal(carregada.combatePendente.tracoInimigo, "vingativo");
  assert.equal(carregada.combatePendente.retaliacao, true);
  carregada.combatePendente.impaciencia = 99;
  c.J.save.gravarRun(carregada);
  assert.notEqual(c.J.save.lerRun()?.combatePendente?.impaciencia, 99);
});
