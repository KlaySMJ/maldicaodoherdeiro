"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

test("menu e intro reais renderizam as ações principais e atualizam a tela", () => {
  const { J, app } = preparar();

  J.ui.menu(null);
  assert.match(app.innerHTML, /data-acao="iniciar"/);
  assert.match(app.innerHTML, /data-acao="tutorial"/);
  assert.match(app.innerHTML, /data-acao="carregar" disabled/);

  J.ui.intro();
  assert.match(app.innerHTML, /class="intro"/);
  assert.match(app.innerHTML, /data-acao="entrar-no-jogo"/);
});

test("tela de fim mostra saída adequada quando o legado foi ou não salvo", () => {
  const { J, app } = preparar();
  const run = {
    fim: { tipo: "derrota", motivo: "A crônica chegou ao fim." },
    ultimoResultado: null,
    rodada: 12,
    atributos: { habitantes: 17 },
  };

  J.ui.fim(run, true);
  assert.match(app.innerHTML, /Um novo herdeiro/);
  assert.match(app.innerHTML, /Voltar ao início/);
  assert.doesNotMatch(app.innerHTML, /Tentar salvar novamente/);

  J.ui.fim(run, false);
  assert.match(app.innerHTML, /Tentar salvar novamente/);
  assert.match(app.innerHTML, /Outro herdeiro sem salvar/);
});

test("tutorial pode ser solicitado fora de uma crônica sem quebrar a interface", () => {
  const { J } = preparar();
  assert.doesNotThrow(() => J.ui.tutorial());
});
