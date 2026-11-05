"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

function runComItem(ambiente, id, fase = "escolha") {
  const { J, novaRun, resultado } = ambiente;
  const run = novaRun();
  J.engine.registrarSorteio(run, J.eventos.find(evento => evento.id === "saqueadores"));
  run.atributos.hp = 50;
  run.condicao.ativa = "licantropia";
  run.condicao.rodada = run.rodada;
  J.engine.concederItem(run, id);
  if (fase === "resultado") resultado(run);
  run.inventarioAberto = true;
  return run;
}

test("todos os outros consumíveis oferecem uso nas duas telas, respeitando a batalha do Tomo", t => {
  const catalogo = preparar().J.itens;
  const ids = catalogo.filter(item => item.uso && item.id !== "adaga_cerimonial").map(item => item.id);
  t.diagnostic(`Catálogo: ${catalogo.length} itens; ${ids.length + 1} utilizáveis, incluindo a adaga.`);
  for (const id of ids) for (const fase of ["escolha", "resultado"]) {
    const ambiente = preparar();
    const { J, app } = ambiente;
    const run = runComItem(ambiente, id, fase);
    const permitido = id !== "tomo_do_esquecimento" || fase === "escolha";
    const antes = JSON.stringify(run);
    assert.equal(J.engine.podeUsarItem(run, id), permitido, `${id}: ${fase}`);
    J.ui.jogo(run);
    assert.equal(app.innerHTML.includes(`data-usar-item="${id}"`), permitido, `${id}: botão em ${fase}`);
    assert.equal(J.engine.usarItem(run, id), permitido, `${id}: execução em ${fase}`);
    if (permitido) {
      assert.notEqual(JSON.stringify(run), antes, id);
      assert.equal(J.save.runValida(run), true, `${id}: save após uso em ${fase}`);
    } else assert.equal(JSON.stringify(run), antes, id);
  }
});

test("equipamentos, passivos e objetos de missão não oferecem um botão de consumível", () => {
  const ids = preparar().J.itens.filter(item => !item.uso).map(item => item.id);
  for (const id of ids) {
    const ambiente = preparar();
    const { J, app } = ambiente;
    const run = runComItem(ambiente, id);
    J.ui.jogo(run);
    assert.equal(app.innerHTML.includes(`data-usar-item="${id}"`), false, id);
    assert.equal(J.engine.podeUsarItem(run, id), false, id);
    const antes = JSON.stringify(run);
    assert.equal(J.engine.usarItem(run, id), false, id);
    assert.equal(JSON.stringify(run), antes, id);
  }
});

test("Escudo da fé preserva a carga de cada consumível reutilizável e inicia a recarga", () => {
  const ids = preparar().J.itens.filter(item => item.uso && !item.uso.umaVezPorRun && item.id !== "adaga_cerimonial").map(item => item.id);
  for (const id of ids) for (const fase of ["escolha", "resultado"]) {
    const ambiente = preparar();
    const { J } = ambiente;
    const run = runComItem(ambiente, id, fase);
    J.engine.concederItem(run, "escudo_da_fe");
    assert.equal(J.engine.podeUsarItem(run, id), true, id);
    assert.equal(J.engine.usarItem(run, id), true, id);
    assert.equal(run.inventario.includes(id), true, `${id}: preserva a carga em ${fase}`);
    assert.equal(run.efeitosPreparados.escudoFeCooldown, 10, `${id}: inicia recarga em ${fase}`);
    assert.equal(J.save.runValida(run), true, id);
  }
});

test("um consumível bloqueado pela recarga não pode executar efeitos nem perder carga", () => {
  const ids = preparar().J.itens.filter(item => item.uso && !item.uso.umaVezPorRun && item.id !== "adaga_cerimonial").map(item => item.id);
  for (const id of ids) {
    const ambiente = preparar();
    const { J, app } = ambiente;
    const run = runComItem(ambiente, id);
    J.engine.concederItem(run, "escudo_da_fe");
    run.efeitosPreparados.escudoFeCooldown = 5;
    const antes = JSON.stringify(run);
    assert.equal(J.engine.podeUsarItem(run, id), false, id);
    J.ui.jogo(run);
    assert.equal(app.innerHTML.includes(`data-usar-item="${id}"`), false, id);
    assert.equal(J.engine.usarItem(run, id), false, id);
    assert.equal(JSON.stringify(run), antes, id);
  }
});

test("cura volta a ficar disponível após dez rodadas de recarga do Escudo da fé", () => {
  for (const id of ["agua_benta", "calice_sagrado"]) {
    const ambiente = preparar();
    const { J, app, resultado } = ambiente;
    const run = runComItem(ambiente, id);
    J.engine.concederItem(run, "escudo_da_fe");
    assert.equal(J.engine.usarItem(run, id), true, id);
    for (let rodada = 1; rodada <= 10; rodada++) {
      resultado(run);
      assert.equal(J.engine.avancar(run), true, id);
    }
    run.condicao.ativa = "possessao";
    run.condicao.rodada = run.rodada;
    run.condicao.curada = false;
    assert.equal(run.efeitosPreparados.escudoFeCooldown, 0, id);
    assert.equal(J.engine.podeUsarItem(run, id), true, id);
    J.ui.jogo(run);
    assert.equal(app.innerHTML.includes(`data-usar-item="${id}"`), true, id);
    assert.equal(J.engine.usarItem(run, id), true, id);
    assert.equal(run.condicao.ativa, null, id);
  }
});

test("itens de uso único continuam utilizáveis com a recarga do escudo e não podem repetir", () => {
  const ids = preparar().J.itens.filter(item => item.uso?.umaVezPorRun).map(item => item.id);
  for (const id of ids) {
    const ambiente = preparar();
    const { J } = ambiente;
    const run = runComItem(ambiente, id);
    J.engine.concederItem(run, "escudo_da_fe");
    run.efeitosPreparados.escudoFeCooldown = 5;
    assert.equal(J.engine.podeUsarItem(run, id), true, id);
    assert.equal(J.engine.usarItem(run, id), true, id);
    J.engine.concederItem(run, id);
    const antes = JSON.stringify(run);
    assert.equal(J.engine.podeUsarItem(run, id), false, id);
    assert.equal(J.engine.usarItem(run, id), false, id);
    assert.equal(JSON.stringify(run), antes, id);
  }
});

test("restrições de cura e de batalha são iguais no inventário e na execução", () => {
  const casos = [
    { id: "agua_benta", condicao: null, abracada: false, permitido: false },
    { id: "agua_benta", condicao: "licantropia", abracada: true, permitido: false },
    { id: "calice_sagrado", condicao: null, abracada: false, permitido: false },
    { id: "calice_sagrado", condicao: "licantropia", abracada: true, permitido: true },
    { id: "tomo_do_esquecimento", evento: "mercador", permitido: false }
  ];
  for (const caso of casos) {
    const ambiente = preparar();
    const { J, app } = ambiente;
    const run = runComItem(ambiente, caso.id);
    if (caso.evento) J.engine.registrarSorteio(run, J.eventos.find(evento => evento.id === caso.evento));
    else { run.condicao.ativa = caso.condicao; run.condicao.abracada = caso.abracada; }
    const antes = JSON.stringify(run);
    assert.equal(J.engine.podeUsarItem(run, caso.id), caso.permitido, caso.id);
    J.ui.jogo(run);
    assert.equal(app.innerHTML.includes(`data-usar-item="${caso.id}"`), caso.permitido, caso.id);
    assert.equal(J.engine.usarItem(run, caso.id), caso.permitido, caso.id);
    if (!caso.permitido) assert.equal(JSON.stringify(run), antes, caso.id);
  }
});

test("inventário e execução rejeitam consumíveis sem unidade ou em uma run encerrada", () => {
  const ids = preparar().J.itens.filter(item => item.uso && item.id !== "adaga_cerimonial").map(item => item.id);
  for (const id of ids) for (const motivo of ["sem-unidade", "encerrada"]) {
    const ambiente = preparar();
    const { J, app } = ambiente;
    const run = runComItem(ambiente, id);
    if (motivo === "sem-unidade") run.inventario = [];
    else J.engine.encerrar(run, "derrota", "Fim da run de teste.");
    const antes = JSON.stringify(run);
    assert.equal(J.engine.podeUsarItem(run, id), false, `${id}: ${motivo}`);
    J.ui.jogo(run);
    assert.equal(app.innerHTML.includes(`data-usar-item="${id}"`), false, `${id}: ${motivo}`);
    assert.equal(J.engine.usarItem(run, id), false, `${id}: ${motivo}`);
    assert.equal(JSON.stringify(run), antes, id);
  }
});
