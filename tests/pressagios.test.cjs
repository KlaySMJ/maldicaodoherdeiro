"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preparar } = require("./helpers/jogo.cjs");

function rodada(J, run, n) {
  run.rodada = n;
  run.estacao = J.estacaoDaRodada(n, run);
}
function ativar(J, run, id) {
  assert.equal(J.pressagios.anunciar(run, id, true), true);
  assert.ok(J.pressagios.confirmar(run));
  return run.pressagios.atual;
}
function vencerPrazo(J, run) {
  rodada(J, run, run.pressagios.atual.fim);
  assert.equal(J.pressagios.resolver(run), true);
}

test("os dez presságios têm artes próprias e o anúncio não altera a carta nem avança o dia", () => {
  const { J, novaRun } = preparar();
  assert.equal(J.pressagios.catalogo.length, 10);
  for (const item of J.pressagios.catalogo) {
    assert.ok(fs.existsSync(path.join(__dirname, "..", item.imagem)), item.id);
    const run = novaRun();
    const antes = JSON.stringify({
      rodada: run.rodada,
      atributos: run.atributos,
      eventoId: run.eventoId,
      opcoes: run.opcoesSorteadas,
    });
    assert.equal(J.pressagios.anunciar(run, item.id, true), true);
    assert.equal(J.pressagios.anunciar(run, "lua_vermelha", true), false);
    assert.equal(J.engine.avancar(run), false);
    assert.equal(J.engine.escolher(run, "seguir"), false);
    assert.equal(
      JSON.stringify({
        rodada: run.rodada,
        atributos: run.atributos,
        eventoId: run.eventoId,
        opcoes: run.opcoesSorteadas,
      }),
      antes,
    );
    assert.equal(J.pressagios.confirmar(run).retomar, false);
    assert.equal(J.pressagios.confirmar(run), null);
  }
});

test("anúncio natural interrompe o avanço e retomada passa exatamente um dia", () => {
  const { J, novaRun, resultado, definirAleatorio } = preparar();
  const run = novaRun();
  rodada(J, run, 25);
  resultado(run);
  definirAleatorio(0);
  const antes = JSON.stringify(run.atributos);
  assert.equal(J.engine.avancar(run), true);
  assert.equal(run.rodada, 25);
  assert.equal(run.pressagios.atual.fase, "anuncio");
  assert.equal(JSON.stringify(run.atributos), antes);
  assert.equal(J.save.gravarRun(run), true);
  const salvo = J.save.lerRun();
  assert.ok(salvo);
  assert.equal(J.pressagios.confirmar(salvo).retomar, true);
  assert.equal(J.engine.avancar(salvo), true);
  assert.equal(salvo.rodada, 26);
  assert.equal(salvo.pressagios.naturais, 1);
});

test("frequência respeita chance, uma tentativa por dia, intervalo, histórico e fim da crônica", () => {
  const { J, novaRun } = preparar();
  const r = novaRun();
  rodada(J, r, 24);
  assert.equal(
    J.pressagios.passagem(r, () => 0),
    false,
  );
  rodada(J, r, 25);
  let chamadas = 0;
  assert.equal(
    J.pressagios.passagem(r, () => {
      chamadas++;
      return 0.8;
    }),
    false,
  );
  assert.equal(
    J.pressagios.passagem(r, () => {
      chamadas++;
      return 0;
    }),
    false,
  );
  assert.equal(chamadas, 1);
  rodada(J, r, 26);
  assert.equal(
    J.pressagios.passagem(r, () => 0),
    true,
  );
  const primeiro = r.pressagios.atual.id;
  J.pressagios.confirmar(r);
  J.pressagios.resolver(r, true);
  J.pressagios.confirmar(r);
  rodada(J, r, 75);
  assert.equal(
    J.pressagios.passagem(r, () => 0),
    false,
  );
  rodada(J, r, 76);
  assert.equal(
    J.pressagios.passagem(r, () => 0),
    true,
  );
  assert.notEqual(r.pressagios.atual.id, primeiro);
  J.pressagios.limpar(r);
  rodada(J, r, 290);
  assert.equal(
    J.pressagios.passagem(r, () => 0),
    false,
  );
  r.pressagios.naturais = 3;
  rodada(J, r, 291);
  assert.equal(
    J.pressagios.passagem(r, () => 0),
    false,
  );
});

test("Lua Vermelha considera somente a queda final e permite curar antes do vencimento", () => {
  const { J, novaRun } = preparar();
  for (const [hp, sucesso] of [
    [81, true],
    [80, false],
    [110, true],
  ]) {
    const r = novaRun();
    r.atributos.hp = 120;
    ativar(J, r, "lua_vermelha");
    J.engine.aplicarEfeitos(r, { hp: -70 });
    r.atributos.hp = hp;
    const habitantes = r.atributos.habitantes;
    vencerPrazo(J, r);
    assert.equal(r.pressagios.atual.resultado.sucesso, sucesso);
    assert.equal(r.atributos.habitantes, habitantes - (sucesso ? 0 : 20));
    const snapshot = JSON.stringify(r.atributos);
    assert.equal(J.pressagios.resolver(r), false);
    J.save.gravarRun(r);
    assert.equal(JSON.stringify(J.save.lerRun().atributos), snapshot);
  }
});

test("metas e recompensas usam os limites aprovados de Gold, população, Escudo e Vida máxima", () => {
  const { J, novaRun } = preparar();
  let r = novaRun();
  ativar(J, r, "cometa_cinzas");
  r.atributos.gold = 30;
  r.atributos.hp = 70;
  vencerPrazo(J, r);
  assert.equal(r.atributos.hp, 75);
  assert.equal(r.atributos.gold, 30);
  r = novaRun();
  r.atributos.escudo = 10;
  ativar(J, r, "ferrugem_negra");
  r.atributos.escudo = 15;
  vencerPrazo(J, r);
  assert.equal(r.atributos.escudo, 18);
  for (const [hp, esperado] of [
    [100, 60],
    [30, 18],
    [1, 1],
  ]) {
    r = novaRun();
    ativar(J, r, "ferrugem_negra");
    r.atributos.hp = hp;
    vencerPrazo(J, r);
    assert.equal(r.atributos.hp, esperado);
  }
  r = novaRun();
  ativar(J, r, "noite_lamento");
  r.atributos.habitantes += 20;
  vencerPrazo(J, r);
  assert.equal(r.atributos.habitantes, 80);
  r = novaRun();
  ativar(J, r, "procissao");
  r.pressagios.atual.progresso.auxilios = 12;
  r.atributos.hp = 50;
  vencerPrazo(J, r);
  assert.equal(r.hpMax, 130);
  assert.equal(r.atributos.hp, 60);
  r = novaRun();
  ativar(J, r, "procissao");
  r.pressagios.atual.progresso.auxilios = 11;
  vencerPrazo(J, r);
  assert.equal(r.atributos.hp, 100);
  assert.equal(r.atributos.habitantes, 45);
  r = novaRun();
  ativar(J, r, "vinda_barao");
  r.atributos.gold = 9;
  vencerPrazo(J, r);
  assert.equal(r.atributos.gold, 4);
  assert.equal(r.atributos.hp, 110);
});

test("auxílios contam ações e gastos efetivos sem incluir renda, passivas ou compras pessoais", () => {
  const { J, novaRun } = preparar();
  const r = novaRun();
  ativar(J, r, "nuvem_faminta");
  r.atributos.gold = 50;
  rodada(J, r, 4);
  assert.equal(J.pressagios.eventoAuxilio(r).id, "pressagio_preparativos");
  J.engine.registrarSorteio(r, J.eventoPorId("pressagio_preparativos"));
  assert.equal(J.engine.escolher(r, "pagar"), true);
  assert.equal(r.pressagios.atual.progresso.gasto, 1);
  assert.equal(r.pressagios.atual.progresso.auxilios, 1);
  assert.equal(r.pressagios.atual.progresso.gold, 0);
  J.engine.aplicarEfeitos(r, { gold: 100, honra: 100 });
  assert.equal(r.pressagios.atual.progresso.gold, 0);
  assert.equal(r.pressagios.atual.progresso.honra, 1);
  r.fase = "escolha";
  r.ultimoResultado = null;
  J.engine.registrarSorteio(r, J.eventoPorId("mercador"));
  const compra = J.eventoPorId("mercador").mercadorias.find((m) => J.engine.podePagar(r, m));
  J.engine.comprar(r, compra.id);
  assert.equal(r.pressagios.atual.progresso.gasto, 1);
});

test("Odin e cada maldição persistem em fonte própria, sem substituir cartas ou repetir efeitos", () => {
  const { J, novaRun } = preparar();
  const maldicoes = J.efeitosNordicos.filter((e) => e.tipo === "maldicao");
  for (let i = 0; i < maldicoes.length; i++) {
    const r = novaRun();
    ativar(J, r, "corvos");
    assert.equal(
      J.pressagios.resolver(r, false, () => (i + 0.1) / maldicoes.length),
      true,
    );
    assert.equal(r.pressagios.efeito.eventoId, maldicoes[i].eventoId);
    J.save.gravarRun(r);
    assert.ok(J.save.lerRun(), maldicoes[i].eventoId);
    const original = JSON.stringify(r.pressagios.efeito);
    assert.equal(J.pressagios.resolver(r, false), false);
    assert.equal(JSON.stringify(r.pressagios.efeito), original);
  }
  const r = novaRun();
  J.engine.debugAtivarEventoEspecial(r, "norte", "bencao_thor");
  J.engine.escolher(r, "aceitar");
  const anterior = JSON.stringify(r.efeitoDivino);
  ativar(J, r, "corvos");
  J.pressagios.resolver(r, true);
  assert.equal(JSON.stringify(r.efeitoDivino), anterior);
  assert.equal(r.pressagios.efeito.fim - r.pressagios.efeito.inicio, 20);
  assert.ok(J.herdeiros.valorEfeito(r, "revelarHabitantesRodadas"));
  J.pressagios.confirmar(r);
  rodada(J, r, r.pressagios.efeito.fim);
  J.pressagios.passagem(r, () => 0.9);
  assert.equal(r.pressagios.efeito, null);
  assert.equal(JSON.stringify(r.efeitoDivino), anterior);
});

test("presságios morais registram a intenção antes de imunidades e não desfazem uma violação", () => {
  const { J } = preparar();
  const r = J.estado.novo(J.legado.vazio(), "heroi_do_povo");
  ativar(J, r, "testemunha_pedra");
  rodada(J, r, 2);
  J.engine.registrarSorteio(r, J.eventoPorId("banquete"));
  const e = J.eventoPorId("banquete");
  const ruim = e.opcoes.find((o) => (o.efeitos?.honra || 0) < 0);
  assert.ok(ruim);
  J.engine.escolher(r, ruim.id);
  assert.equal(r.atributos.honra, 0);
  assert.equal(r.pressagios.atual.progresso.violacoes, 1);
  J.engine.aplicarEfeitos(r, { honra: 50 });
  vencerPrazo(J, r);
  assert.equal(r.pressagios.atual.resultado.sucesso, false);
});

test("debug abre a cena dos dez eventos e salva confirmação, desfecho e inspeção pelo controlador", async () => {
  for (const id of ["lua_vermelha", "procissao"]) {
    const { J, app, novaRun, iniciar, clicar } = preparar();
    const r = novaRun();
    J.save.gravarRun(r);
    iniciar();
    await clicar({ acao: "debug-alternar" });
    await clicar({ acao: "carregar" });
    for (const p of J.pressagios.catalogo) assert.ok(app.innerHTML.includes(`data-pressagio-id="${p.id}"`));
    await clicar({ acao: "debug-pressagio", pressagioId: id });
    assert.match(app.innerHTML, /Preparar para o presságio/);
    assert.equal((app.innerHTML.match(/<button/g) || []).length, 1);
    const dia = J.save.lerRun().rodada;
    await clicar({ acao: "pressagio-confirmar" });
    assert.equal(J.save.lerRun().rodada, dia);
    assert.match(app.innerHTML, /pressagio-indicador/);
    await clicar({ acao: "pressagio-detalhes" });
    assert.match(app.innerHTML, /Estado do presságio/);
    await clicar({ acao: "entrar-no-jogo" });
    await clicar({ acao: "debug-pressagio-sucesso" });
    const salva = J.save.lerRun();
    assert.ok(salva);
    assert.equal(salva.pressagios.atual.fase, "resultado");
    const antes = JSON.stringify(salva.atributos);
    await clicar({ acao: "pressagio-confirmar" });
    await clicar({ acao: "pressagio-confirmar" });
    assert.equal(JSON.stringify(J.save.lerRun().atributos), antes);
  }
});

test("saves antigos migram e estados corrompidos de presságio ou maldição são rejeitados", () => {
  const { J, novaRun, window } = preparar();
  const r = novaRun();
  delete r.pressagios;
  window.localStorage.setItem("run_atual", JSON.stringify(r));
  assert.ok(J.save.lerRun().pressagios);
  ativar(J, r, "corvos");
  J.pressagios.resolver(r, false, () => 0);
  for (const alterar of [
    (c) => {
      c.pressagios.atual.fim++;
    },
    (c) => {
      c.pressagios.atual.progresso.gold = -1;
    },
    (c) => {
      c.pressagios.efeito.porRodada.efeitos.gold = 100;
    },
    (c) => {
      c.pressagios.efeito.eventoId = "inexistente";
    },
  ]) {
    const copia = JSON.parse(JSON.stringify(r));
    alterar(copia);
    window.localStorage.setItem("run_atual", JSON.stringify(copia));
    assert.equal(J.save.lerRun(), null);
  }
});

test("a visita do Leste conclui antes do presságio no último dia, preservando um resultado salvável", () => {
  const { J, resultado } = preparar();
  const r = J.estado.novo(J.legado.vazio(), "herdeira_leste");
  J.engine.registrarSorteio(r, J.eventoPorId("mercador"));
  ativar(J, r, "lua_vermelha");
  rodada(J, r, 26);
  r.calendarioLeste = [{ ano: 1, estacao: 1, rodada: 26, eventoId: "zodiaco_boi", resolvida: false }];
  resultado(r);
  assert.equal(J.engine.avancar(r), true);
  assert.ok(r.encontroLeste);
  assert.equal(r.pressagios.atual.fase, "ativo");
  const e = J.eventoPorId(r.eventoId);
  assert.equal(J.engine.escolher(r, e.opcoes[0].id), true);
  assert.equal(J.engine.avancar(r), true);
  assert.equal(r.rodada, 26);
  assert.equal(r.encontroLeste, null);
  assert.equal(r.pressagios.atual.fase, "resultado");
  J.save.gravarRun(r);
  assert.ok(J.save.lerRun());
});

test("um presságio de um ano resolve na rodada 300 antes do encerramento", () => {
  const { J, novaRun, resultado } = preparar();
  const r = novaRun();
  rodada(J, r, 200);
  assert.equal(J.pressagios.anunciar(r, "noite_lamento"), true);
  J.pressagios.confirmar(r);
  rodada(J, r, 300);
  r.atributos.habitantes += 20;
  resultado(r);
  assert.equal(J.engine.avancar(r), true);
  assert.equal(r.status, "ativa");
  assert.equal(r.pressagios.atual.fase, "resultado");
  J.pressagios.confirmar(r);
  J.engine.avancar(r);
  assert.equal(r.rodada, 300);
  assert.equal(r.status, "encerrada");
});

test("maldições periódicas cobram uma vez por dia e desaparecem no prazo", () => {
  const { J, novaRun } = preparar();
  const r = novaRun();
  ativar(J, r, "corvos");
  const indice = J.efeitosNordicos
    .filter((e) => e.tipo === "maldicao")
    .findIndex((e) => e.eventoId === "maldicao_hrym");
  r.atributos.gold = 100;
  J.pressagios.resolver(r, false, () => (indice + 0.1) / 10);
  J.pressagios.confirmar(r);
  rodada(J, r, 2);
  J.pressagios.iniciarRodada(r);
  assert.equal(r.atributos.gold, 99);
  J.pressagios.iniciarRodada(r);
  assert.equal(r.atributos.gold, 99);
  J.save.gravarRun(r);
  const salvo = J.save.lerRun();
  assert.ok(salvo);
  J.pressagios.iniciarRodada(salvo);
  assert.equal(salvo.atributos.gold, 99);
  rodada(J, salvo, salvo.pressagios.efeito.fim);
  J.pressagios.passagem(salvo, () => 0.9);
  assert.equal(salvo.pressagios.efeito, null);
});

test("a conversão ao culto cancela a meta exclusiva de habitantes sem premiar nem punir", () => {
  const { J, novaRun } = preparar();
  const r = novaRun();
  ativar(J, r, "noite_lamento");
  J.herdeiros.iniciarCulto(r);
  const antes = JSON.stringify(r.atributos);
  assert.equal(J.pressagios.passagem(r), false);
  assert.equal(r.pressagios.atual, null);
  assert.equal(r.pressagios.historico.at(-1).sucesso, null);
  assert.equal(JSON.stringify(r.atributos), antes);
});

test("falhas pelo debug respeitam derrota e a decisão de entrar no culto", async () => {
  for (const culto of [false, true]) {
    const { J, app, novaRun, iniciar, clicar } = preparar();
    const r = novaRun();
    if (culto) {
      r.atributos.habitantes = 1;
      r.atributos.honra = -40;
    } else r.atributos.hp = 1;
    ativar(J, r, culto ? "lua_vermelha" : "cometa_cinzas");
    assert.equal(J.save.gravarRun(r), true);
    iniciar();
    await clicar({ acao: "debug-alternar" });
    await clicar({ acao: "carregar" });
    await clicar({ acao: "debug-pressagio-falha" });
    if (culto) {
      assert.equal(J.save.lerRun()?.aguardaDecisaoCulto, true);
      assert.ok(app.innerHTML.includes('data-acao="juntar-culto"'));
      await clicar({ acao: "juntar-culto" });
      assert.equal(J.save.lerRun()?.cultoAtivo, true);
      await clicar({ acao: "pressagio-confirmar" });
      assert.equal(J.save.lerRun()?.pressagios.atual, null);
    } else {
      assert.equal(J.save.lerRun(), null);
      assert.match(app.innerHTML, /O herdeiro sucumbiu/);
    }
  }
});
