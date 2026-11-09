"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

function runComItem(ambiente, id, fase = "escolha") {
  const { J, novaRun, resultado } = ambiente;
  const item = J.itens.find((candidato) => candidato.id === id);
  const run = item?.uso?.bosqueSagrado ? J.estado.novo(J.legado.vazio(), "druida_herdeiro") : novaRun();
  J.engine.registrarSorteio(
    run,
    J.eventos.find((evento) => evento.id === "saqueadores"),
  );
  run.atributos.hp = 50;
  run.condicao.ativa = item?.uso?.condicaoAtiva || "licantropia";
  run.condicao.rodada = run.rodada;
  J.engine.concederItem(run, id);
  if (fase === "resultado") resultado(run);
  run.inventarioAberto = true;
  return run;
}

test("todos os outros consumíveis oferecem uso nas duas telas, respeitando a batalha do Tomo", (t) => {
  const catalogo = preparar().J.itens;
  const ids = catalogo.filter((item) => item.uso && item.id !== "adaga_cerimonial").map((item) => item.id);
  t.diagnostic(`Catálogo: ${catalogo.length} itens; ${ids.length + 1} utilizáveis, incluindo a adaga.`);
  for (const id of ids)
    for (const fase of ["escolha", "resultado"]) {
      const ambiente = preparar();
      const { J, app } = ambiente;
      const item = J.itens.find((candidato) => candidato.id === id);
      const run = runComItem(ambiente, id, fase);
      const rerrolagemDeCombate = Boolean(item.uso.rerrolarCombate || item.uso.rerrolarMenorDadoCombate);
      const permitido = (id !== "tomo_do_esquecimento" || fase === "escolha") && !rerrolagemDeCombate;
      const antes = JSON.stringify(run);
      assert.equal(J.engine.podeUsarItem(run, id), permitido, `${id}: ${fase}`);
      J.ui.jogo(run);
      const botaoVisivel =
        item.id === "calice_negro"
          ? app.innerHTML.includes('data-item-sacrificio="habitantes"') ||
            app.innerHTML.includes('data-item-sacrificio="culto"')
          : app.innerHTML.includes(`data-usar-item="${id}"`);
      assert.equal(botaoVisivel, permitido, `${id}: botão em ${fase}`);
      assert.equal(J.engine.usarItem(run, id), permitido, `${id}: execução em ${fase}`);
      if (permitido) {
        assert.notEqual(JSON.stringify(run), antes, id);
        assert.equal(J.save.runValida(run), true, `${id}: save após uso em ${fase}`);
      } else assert.equal(JSON.stringify(run), antes, id);
    }
});

test("equipamentos, passivos e objetos de missão não oferecem um botão de consumível", () => {
  const ids = preparar()
    .J.itens.filter((item) => !item.uso)
    .map((item) => item.id);
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
  const ids = preparar()
    .J.itens.filter(
      (item) =>
        item.uso &&
        !item.uso.umaVezPorRun &&
        !item.uso.ignorarEscudoDaFe &&
        item.id !== "adaga_cerimonial" &&
        !item.uso.rerrolarCombate &&
        !item.uso.rerrolarMenorDadoCombate,
    )
    .map((item) => item.id);
  for (const id of ids)
    for (const fase of ["escolha", "resultado"]) {
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

test("rerrolagens só ficam disponíveis depois que os dados do combate aparecem", () => {
  for (const id of ["dado_do_destino", "dado_lascado"]) {
    const { J, novaRun } = preparar();
    const run = novaRun();
    run.eventoId = "saqueadores";
    run.debugTracoInimigo = "nenhum";
    J.engine.concederItem(run, id);
    assert.equal(J.engine.podeUsarItem(run, id), false, `${id}: fora de combate`);
    assert.equal(J.engine.escolher(run, "combater"), true, `${id}: iniciar`);
    assert.equal(J.engine.podeUsarItem(run, id), false, `${id}: antes da rolagem`);
    assert.equal(J.engine.rolarCombate(run), true, `${id}: rolar`);
    assert.equal(J.engine.podeUsarItem(run, id), true, `${id}: após a rolagem`);
    assert.equal(J.engine.usarItem(run, id), true, `${id}: usar`);
    assert.equal(run.combatePendente.rerrolagens, 1, `${id}: registrar rerrolagem`);
    assert.equal(J.save.runValida(run), true, `${id}: save durante disputa`);
  }
});

test("um consumível bloqueado pela recarga não pode executar efeitos nem perder carga", () => {
  const ids = preparar()
    .J.itens.filter(
      (item) =>
        item.uso && !item.uso.umaVezPorRun && !item.uso.ignorarEscudoDaFe && item.id !== "adaga_cerimonial",
    )
    .map((item) => item.id);
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
  const ids = preparar()
    .J.itens.filter((item) => item.uso?.umaVezPorRun)
    .map((item) => item.id);
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

test("Sede de sangue ignora a recarga do Escudo da fé e mantém sua recarga própria", () => {
  const ambiente = preparar();
  const { J } = ambiente;
  const run = runComItem(ambiente, "sede_de_sangue");
  J.engine.concederItem(run, "escudo_da_fe");
  assert.equal(J.engine.usarItem(run, "sede_de_sangue"), true);
  assert.equal(run.inventario.includes("sede_de_sangue"), true);
  assert.equal(run.efeitosPreparados.escudoFeCooldown, 0);
  assert.equal(J.engine.recargaItemRestante(run, "sede_de_sangue"), 6);
});

test("restrições de cura e de batalha são iguais no inventário e na execução", () => {
  const casos = [
    { id: "agua_benta", condicao: null, abracada: false, permitido: false },
    { id: "agua_benta", condicao: "licantropia", abracada: true, permitido: false },
    { id: "calice_sagrado", condicao: null, abracada: false, permitido: false },
    { id: "calice_sagrado", condicao: "licantropia", abracada: true, permitido: true },
    { id: "tomo_do_esquecimento", evento: "mercador", permitido: false },
  ];
  for (const caso of casos) {
    const ambiente = preparar();
    const { J, app } = ambiente;
    const run = runComItem(ambiente, caso.id);
    if (caso.evento)
      J.engine.registrarSorteio(
        run,
        J.eventos.find((evento) => evento.id === caso.evento),
      );
    else {
      run.condicao.ativa = caso.condicao;
      run.condicao.abracada = caso.abracada;
    }
    const antes = JSON.stringify(run);
    assert.equal(J.engine.podeUsarItem(run, caso.id), caso.permitido, caso.id);
    J.ui.jogo(run);
    assert.equal(app.innerHTML.includes(`data-usar-item="${caso.id}"`), caso.permitido, caso.id);
    assert.equal(J.engine.usarItem(run, caso.id), caso.permitido, caso.id);
    if (!caso.permitido) assert.equal(JSON.stringify(run), antes, caso.id);
  }
});

test("inventário e execução rejeitam consumíveis sem unidade ou em uma run encerrada", () => {
  const ids = preparar()
    .J.itens.filter((item) => item.uso && !["adaga_cerimonial", "sede_de_sangue"].includes(item.id))
    .map((item) => item.id);
  for (const id of ids)
    for (const motivo of ["sem-unidade", "encerrada"]) {
      const ambiente = preparar();
      const { J, app } = ambiente;
      const run = runComItem(ambiente, id);
      if (motivo === "sem-unidade") run.inventario = [];
      else J.engine.encerrar(run, "derrota", "Fim da run de teste.");
      const antes = JSON.stringify(run);
      assert.equal(J.engine.podeUsarItem(run, id), false, `${id}: ${motivo}`);
      J.ui.jogo(run);
      const item = J.itens.find((candidato) => candidato.id === id);
      const botaoVisivel =
        item.id === "calice_negro"
          ? app.innerHTML.includes('data-item-sacrificio="habitantes"') ||
            app.innerHTML.includes('data-item-sacrificio="culto"')
          : app.innerHTML.includes(`data-usar-item="${id}"`);
      assert.equal(botaoVisivel, false, `${id}: ${motivo}`);
      assert.equal(J.engine.usarItem(run, id), false, `${id}: ${motivo}`);
      assert.equal(JSON.stringify(run), antes, id);
    }
});

test("Sede de sangue só existe enquanto o vampirismo não foi abraçado", () => {
  const ambiente = preparar();
  const { J } = ambiente;
  const run = runComItem(ambiente, "sede_de_sangue");
  assert.equal(run.inventario.includes("sede_de_sangue"), true);
  run.condicao.abracada = true;
  J.engine.sincronizarItemVampirismo(run);
  assert.equal(run.inventario.includes("sede_de_sangue"), false);
});

test("selo dos guardioes so pode ser recebido uma vez por partida", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  const evento = J.eventoPorId("ferreiro");
  const opcao = evento.opcoes.find((item) => item.id === "selo_guardioes");
  run.atributos.honra = 100;
  J.engine.registrarSorteio(run, evento);
  assert.equal(J.engine.cumpre(opcao.requisitos, run), true);
  assert.equal(J.engine.escolher(run, opcao.id), true);
  assert.ok(run.itensConquistados.includes("selo_do_povo"));
  const atributos = JSON.stringify(run.atributos);
  const hpMax = run.hpMax;
  J.engine.registrarSorteio(run, evento);
  assert.equal(J.engine.cumpre(opcao.requisitos, run), false);
  assert.equal(J.engine.escolher(run, opcao.id), false);
  assert.equal(JSON.stringify(run.atributos), atributos);
  assert.equal(run.hpMax, hpMax);
  const salvo = JSON.parse(JSON.stringify(run));
  assert.equal(J.engine.cumpre(opcao.requisitos, salvo), false);
  const antigo = novaRun();
  antigo.atributos.honra = 100;
  antigo.inventario.push("selo_do_povo");
  assert.equal(J.engine.cumpre(opcao.requisitos, antigo), false);
});
