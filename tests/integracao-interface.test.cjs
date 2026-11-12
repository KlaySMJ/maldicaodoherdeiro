"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

function leitura() {
  const contexto = preparar();
  const visual = { textContent: "" };
  const decisao = { hidden: true, classList: { add() {} } };
  let callback = null;
  let intervalo = null;
  contexto.app.querySelector = (seletor) =>
    ({ "[data-texto-visual]": visual, "[data-decisao-evento]": decisao })[seletor] || null;
  contexto.window.matchMedia = () => ({ matches: false });
  contexto.window.setInterval = (fn, atraso) => {
    callback = fn;
    intervalo = atraso;
    return 1;
  };
  contexto.window.clearInterval = () => {
    callback = null;
  };
  return { ...contexto, visual, decisao, callback: () => callback, intervalo: () => intervalo };
}

test("pausa prevalece sobre texto imediato e retomar conclui a leitura sem rolar escolhas", () => {
  const { J, window, novaRun, visual, decisao, callback } = leitura();
  const run = novaRun();
  window.localStorage.setItem("velocidade_texto", "imediato");
  J.ui.alternarTextoAutomatico();
  J.ui.jogo(run);
  assert.equal(visual.textContent, "");
  assert.equal(decisao.hidden, true);
  assert.equal(callback(), null);
  J.ui.alternarTextoAutomatico();
  assert.equal(visual.textContent, J.eventoPorId(run.eventoId).texto);
  assert.equal(decisao.hidden, false);
  assert.equal(run.fase, "escolha");
});

test("texto rápido conserva a velocidade ao pausar e retomar do mesmo caractere", () => {
  const { J, window, novaRun, visual, callback, intervalo } = leitura();
  window.localStorage.setItem("velocidade_texto", "rapido");
  J.ui.jogo(novaRun());
  assert.equal(intervalo(), 8);
  callback()();
  const parcial = visual.textContent;
  J.ui.alternarTextoAutomatico();
  assert.equal(callback(), null);
  J.ui.alternarTextoAutomatico();
  assert.equal(visual.textContent, parcial);
  assert.equal(intervalo(), 8);
  callback()();
  assert.ok(visual.textContent.length > parcial.length);
});

test("consequência principal recebe destaque sem repetir os números do resultado", () => {
  const { J, novaRun, resultado, app } = preparar();
  const run = novaRun();
  resultado(run);
  Object.assign(run.ultimoResultado.alteracoes, { hp: -8, gold: 2 });
  J.ui.jogo(run, { textoCompleto: true });
  assert.equal((app.innerHTML.match(/consequencia-principal/g) || []).length, 1);
  assert.equal((app.innerHTML.match(/<strong>-8<\/strong>/g) || []).length, 1);
  assert.equal((app.innerHTML.match(/<strong>\+2<\/strong>/g) || []).length, 1);
  assert.match(app.innerHTML, /<li class="consequencia-principal"><span>Vida/);
});

test("mapa do moinho preserva a especialização e a renda da versão remota", () => {
  const { J, novaRun, app } = preparar();
  const run = novaRun();
  run.construcoes.push("moinho");
  run.sistemas.especializacao = "comercial";
  run.construcoesAbertas = true;
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /data-obra-id="moinho"/);
  assert.match(app.innerHTML, /Escolha definitiva: comercial/);
  assert.match(app.innerHTML, /\+1 Gold a cada 5 dias/);
  assert.equal(J.sistemas.renda(run), 0);
  run.rodada = 5;
  assert.equal(J.sistemas.renda(run), 1);
});
