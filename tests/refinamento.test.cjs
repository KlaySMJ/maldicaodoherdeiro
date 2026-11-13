"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

test("bloqueios de recursos aparecem uma vez; honra continua como requisito narrativo", () => {
  const { J, novaRun, app } = preparar();
  const run = novaRun();
  run.atributos.gold = 0;
  const evento = J.eventoPorId("moinho_parado");
  J.engine.registrarSorteio(run, evento);
  assert.equal(J.engine.opcoesBloqueadas(evento, run)[0].id, "consertar");
  assert.equal(J.engine.escolher(run, "consertar"), false);
  J.ui.jogo(run, { textoCompleto: true });
  assert.equal(
    (app.innerHTML.match(/class="escolha escolha-desabilitada requisito-consulta"/g) || []).length,
    1,
  );
  assert.match(app.innerHTML, /Faltam 4 Gold/);
  const honra = { id: "teste", opcoes: [{ id: "honra", requisitos: { honraMin: 90, goldMin: 4 } }] };
  assert.equal(J.engine.opcoesBloqueadas(honra, run).length, 0);
  run.atributos.gold = 4;
  assert.equal(J.engine.escolher(run, "consertar"), true);
});

test("Baltazar recebe só a vontade do mestre; outros herdeiros mantêm a recusa", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  const evento = J.eventoPorId("lider_culto");
  run.traco = "herdeiro_culto";
  assert.equal(J.engine.opcoes(evento, run).length, 1);
  assert.equal(J.engine.opcoes(evento, run)[0].texto, "Aceitar a vontade do seu mestre");
  run.traco = "corajoso";
  assert.equal(J.engine.opcoes(evento, run).length, 2);
});

test("chefes aguardam o fim da primeira estação sem descartar a agenda", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.atributos.honra = 30;
  const evento = J.eventoPorId("lider_culto");
  run.rodada = 25;
  assert.equal(J.engine.eventoDisponivel(evento, run), false);
  run.consequenciasAgendadas = [{ eventoId: "embate_barao", rodada: 2 }];
  assert.notEqual(J.engine.sortear(run).bossId, "barao");
  assert.equal(run.consequenciasAgendadas.length, 1);
  run.rodada = 26;
  assert.equal(J.engine.eventoDisponivel(evento, run), true);
  assert.equal(J.engine.sortear(run).id, "embate_barao");
});

test("Mão do Destino lê testes, vantagem, duelo e sorte sem consumir aleatoriedade", () => {
  const { J, novaRun, definirAleatorios } = preparar();
  const run = novaRun();
  const opcao = { testeDados: { dificuldade: 14, limiteCusto: 10, bonus: 2 } };
  assert.equal(J.engine.probabilidadesOpcao(run, opcao), null);
  run.flags.mao_do_destino_ativa = true;
  const antes = JSON.stringify(run);
  definirAleatorios([0]);
  const p = J.engine.probabilidadesOpcao(run, opcao);
  assert.ok(Math.abs(p.sucesso - 0.45) < 1e-12);
  assert.ok(Math.abs(p.sucessoComCusto - 0.2) < 1e-12);
  assert.equal(JSON.stringify(run), antes);
  run.dadosCombatePermanentes = 1;
  assert.ok(Math.abs(J.engine.probabilidadesOpcao(run, opcao).sucesso - 0.6975) < 1e-12);
  run.dadosCombatePermanentes = 0;
  assert.ok(Math.abs(J.engine.probabilidadesOpcao(run, { dueloDados: {} }).sucesso - 191 / 400) < 1e-12);
  assert.equal(J.engine.probabilidadesOpcao(run, { testeSorte: { chance: 55 } }).sucesso, 0.55);
  assert.equal(J.engine.probabilidadesOpcao(run, { testeSorte: { chance: 100 } }), null);
  assert.equal(J.engine.probabilidadesOpcao(run, { efeitos: { gold: 4 } }), null);
});

test("texto automático pausa e retoma imediatamente, e clicar conclui o texto pausado", () => {
  const { J, app, window, novaRun } = preparar();
  const visual = { textContent: "" };
  const decisao = { hidden: true, classList: { add() {} } };
  app.querySelector = (seletor) =>
    ({ "[data-texto-visual]": visual, "[data-decisao-evento]": decisao })[seletor] || null;
  window.matchMedia = () => ({ matches: false });
  let callback;
  window.setInterval = (fn) => {
    callback = fn;
    return 1;
  };
  window.clearInterval = () => {
    callback = null;
  };
  const run = novaRun();
  J.ui.jogo(run);
  callback();
  const parcial = visual.textContent;
  assert.ok(parcial.length > 0);
  assert.equal(J.ui.alternarTextoAutomatico(), false);
  assert.equal(callback, null);
  assert.equal(visual.textContent, parcial);
  assert.equal(J.ui.alternarTextoAutomatico(), true);
  callback();
  assert.ok(visual.textContent.length > parcial.length);
  J.ui.alternarTextoAutomatico();
  assert.equal(J.ui.completarTextoEvento(), true);
  assert.equal(visual.textContent, J.eventoPorId(run.eventoId).texto);
  assert.equal(decisao.hidden, false);
});

test("Bufão e Bruxa mantêm os retratos do culto ao mudar a honra", () => {
  const { J, app, novaRun } = preparar();
  const run = novaRun();
  run.traco = "coringa";
  run.cultoAtivo = true;
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(
    app.innerHTML,
    /class="retrato retrato-atual[^"]*" src="assets\/herdeiros\/bufao-culto\.webp"/,
  );
  run.atributos.honra = 90;
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(
    app.innerHTML,
    /class="retrato retrato-atual[^"]*" src="assets\/herdeiros\/bufao-culto\.webp"/,
  );
  run.traco = "bruxo";
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(
    app.innerHTML,
    /class="retrato retrato-atual[^"]*" src="assets\/herdeiros\/bruxa-culto\.webp"/,
  );
});

test("obras exibem benefício antes da ação e preservam custo e construção", () => {
  const { J, novaRun, app } = preparar();
  const run = novaRun();
  run.atributos.gold = 8;
  J.engine.registrarSorteio(run, J.eventoPorId("construcoes_da_vila"));
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /class="obra-opcao"/);
  assert.match(app.innerHTML, /−2 Gold na arma melhorada/);
  assert.equal(J.engine.escolher(run, "forja"), true);
  assert.equal(run.atributos.gold, 0);
  assert.ok(run.construcoes.includes("forja"));
  J.save.gravarRun(run);
  assert.ok(J.save.lerRun()?.construcoes.includes("forja"));
});

test("Ataque adicional altera a rolagem, sem virar dano absoluto no chefe", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  const perfil = { batalha: { danoPorAcerto: 25 } };
  const dano = J.engine.danoAcertoChefe(run, perfil, 20, 10);
  run.atributos.ataque += 16;
  assert.equal(J.engine.danoAcertoChefe(run, perfil, 36, 10), dano);
});

test("recusa precoce à Entidade agenda o confronto e permite retomar o save", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  const evento = J.eventos.find(
    (carta) => carta.entidadeX && carta.opcoes.some((opcao) => opcao.entidadeXRecusa),
  );
  run.flags.entidade_x_ativa = true;
  run.marcos.entidadeXRecusaFatalId = evento.id;
  run.rodada = 12;
  J.engine.registrarSorteio(run, evento);
  const recusa = evento.opcoes.find((opcao) => opcao.entidadeXRecusa);
  assert.equal(J.engine.escolher(run, recusa.id), true);
  assert.equal(run.fase, "resultado");
  assert.equal(run.consequenciasAgendadas[0].eventoId, "entidade_x_confronto");
  J.save.gravarRun(run);
  assert.ok(J.save.lerRun());
});
