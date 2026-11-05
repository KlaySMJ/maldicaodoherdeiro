"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

test("adaga aparece nas escolhas com 50 seguidores e o clique salva 40 seguidores e +10 Ataque", async () => {
  const { J, app, culto, iniciar, clicar } = preparar();
  const run = culto();
  assert.equal(run.seguidoresCulto, 50);
  const antes = {
    ataque: run.atributos.ataque,
    rodada: run.rodada,
    eventoId: run.eventoId,
    gold: run.atributos.gold,
  };
  assert.equal(J.save.gravarRun(run), true);
  iniciar();
  await clicar({ acao: "carregar" });
  assert.match(app.innerHTML, /data-item-sacrificio="culto"/);
  assert.doesNotMatch(app.innerHTML, /data-item-sacrificio="habitantes"/);
  await clicar({ itemSacrificio: "culto" });
  const salva = J.save.lerRun();
  assert.ok(salva);
  assert.equal(salva.seguidoresCulto, 40);
  assert.equal(salva.atributos.ataque, antes.ataque + 10);
  assert.equal(salva.rodada, antes.rodada);
  assert.equal(salva.eventoId, antes.eventoId);
  assert.equal(salva.atributos.gold, antes.gold);
  assert.equal(salva.fase, "escolha");
  assert.equal(salva.ultimoResultado, null);
  assert.equal(salva.flags.adaga_cerimonial_usada, true);
  assert.equal(salva.inventario.includes("adaga_cerimonial"), false);
  assert.doesNotMatch(app.innerHTML, /data-item-sacrificio=/);
});

test("adaga continua disponível no resultado e registra o bônus de Ataque", () => {
  const { J, culto } = preparar();
  const run = culto("resultado");
  const antes = run.ultimoResultado.alteracoes.ataque;
  assert.equal(J.engine.podeUsarItem(run, "adaga_cerimonial", "culto"), true);
  assert.equal(J.engine.usarItem(run, "adaga_cerimonial", "culto"), true);
  assert.equal(run.seguidoresCulto, 40);
  assert.equal(run.ultimoResultado.alteracoes.ataque, antes + 10);
  assert.match(run.ultimoResultado.texto, /consome dez seguidores/);
  assert.equal(J.save.runValida(run), true);
});

test("sacrifícios inválidos não consomem a adaga nem alteram a run", () => {
  for (const caso of [
    "poucos-seguidores",
    "sem-culto",
    "sem-item",
    "ja-usada",
    "encerrada",
    "alvo-invalido",
    "sem-alvo",
  ]) {
    const { J, culto } = preparar();
    const run = culto();
    let alvo = "culto";
    if (caso === "poucos-seguidores") run.seguidoresCulto = 9;
    if (caso === "sem-culto") run.cultoAtivo = false;
    if (caso === "sem-item") run.inventario = [];
    if (caso === "ja-usada") run.flags.adaga_cerimonial_usada = true;
    if (caso === "encerrada") run.status = "encerrada";
    if (caso === "alvo-invalido") alvo = "gold";
    if (caso === "sem-alvo") alvo = null;
    const antes = JSON.stringify(run);
    assert.equal(J.engine.usarItem(run, "adaga_cerimonial", alvo), false, caso);
    assert.equal(JSON.stringify(run), antes, caso);
  }
});

test("a adaga só pode ser usada uma vez mesmo recebendo outra unidade", () => {
  const { J, culto } = preparar();
  const run = culto();
  J.engine.concederItem(run, "escudo_da_fe");
  run.efeitosPreparados.escudoFeCooldown = 10;
  assert.equal(J.engine.podeUsarItem(run, "adaga_cerimonial", "culto"), true);
  assert.equal(J.engine.usarItem(run, "adaga_cerimonial", "culto"), true);
  J.engine.concederItem(run, "adaga_cerimonial");
  const antes = JSON.stringify(run);
  assert.equal(J.engine.podeUsarItem(run, "adaga_cerimonial"), false);
  assert.equal(J.engine.usarItem(run, "adaga_cerimonial", "culto"), false);
  assert.equal(JSON.stringify(run), antes);
});

test("sacrificar os últimos dez seguidores encerra a run sem saldo negativo", () => {
  const { J, culto } = preparar();
  const run = culto();
  run.seguidoresCulto = 10;
  assert.equal(J.engine.usarItem(run, "adaga_cerimonial", "culto"), true);
  assert.equal(run.seguidoresCulto, 0);
  assert.equal(run.status, "encerrada");
  assert.equal(J.save.runValida(run), true);
});

test("sacrifício de habitantes funciona nas escolhas e conserva a transição ao culto", () => {
  for (const habitantes of [10, 20]) {
    const { J, novaRun, app } = preparar();
    const run = novaRun();
    run.atributos.habitantes = habitantes;
    run.atributos.honra = -40;
    J.engine.concederItem(run, "adaga_cerimonial");
    assert.equal(J.engine.podeUsarItem(run, "adaga_cerimonial", "habitantes"), true);
    J.ui.jogo(run);
    assert.match(app.innerHTML, /data-item-sacrificio="habitantes"/);
    assert.equal(J.engine.usarItem(run, "adaga_cerimonial", "habitantes"), true);
    assert.equal(run.atributos.habitantes, habitantes - 10);
    assert.equal(J.save.runValida(run), true);
    if (habitantes === 10) {
      assert.equal(run.fase, "resultado");
      assert.equal(run.aguardaDecisaoCulto, true);
      assert.equal(run.ultimoResultado.alteracoes.habitantes, -10);
      assert.equal(run.ultimoResultado.alteracoes.ataque, 10);
      J.ui.jogo(run);
      assert.match(app.innerHTML, /data-acao="juntar-culto"/);
    } else assert.equal(run.fase, "escolha");
  }
});
