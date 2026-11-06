"use strict";
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

// Engine, interface e controlador reais, com layout e armazenamento isolados.
function preparar() {
  const dados = new Map();
  const app = {
    innerHTML: "",
    focus() {},
    querySelector: () => null,
    addEventListener(tipo, funcao) {
      this[tipo] = funcao;
    },
  };
  const window = {
    crypto: { randomUUID: () => "run-item" },
    addEventListener() {},
    dispatchEvent() {},
    cancelAnimationFrame() {},
    requestAnimationFrame: () => 0,
    matchMedia: () => ({ matches: true }),
    localStorage: {
      getItem: (chave) => dados.get(chave) ?? null,
      setItem: (chave, valor) => dados.set(chave, valor),
      removeItem: (chave) => dados.delete(chave),
    },
  };
  const contexto = vm.createContext({
    window,
    Image: class {
      decode() {
        return Promise.resolve();
      }
    },
    document: {
      getElementById: () => app,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
      body: { dataset: {}, classList: { toggle() {} } },
    },
    CustomEvent: class {
      constructor(tipo, opcoes) {
        this.detail = opcoes.detail;
      }
    },
  });
  contexto.__valorAleatorio = 0.25;
  vm.runInContext("Math.random = () => __valorAleatorio;", contexto);
  const executar = (nome) =>
    vm.runInContext(fs.readFileSync(path.join(__dirname, `../../js/${nome}.js`), "utf8"), contexto);
  for (const nome of [
    "state",
    "herdeiros",
    "events",
    "events-vila",
    "events-pactos",
    "events-abissais",
    "events-baus",
    "events-personagens-cadeias",
    "events-conselheiro",
    "events-recompensas",
    "events-specials",
    "events-lethal",
    "events-cult",
    "events-foundations",
    "events-entity",
    "events-supernatural",
    "events-grail",
    "events-druida",
    "events-anuais",
    "events-personagens",
    "events-artes-especificas",
    "events-heroi",
    "events-ajustes",
    "events-progresso",
    "events-propostas",
    "items",
    "legacy",
    "conquistas",
    "druida",
    "engine",
    "save",
    "ui",
  ])
    executar(nome);
  const J = window.Jogo;

  function resultado(run) {
    run.fase = "resultado";
    run.ultimoResultado = {
      escolha: "Decisão anterior",
      texto: "Assim foi feito.",
      combate: null,
      alteracoes: Object.fromEntries(J.atributos.map((id) => [id, 0])),
    };
  }

  function novaRun() {
    const run = J.estado.novo(J.legado.vazio());
    J.engine.registrarSorteio(
      run,
      J.eventos.find((evento) => evento.id === "mercador"),
    );
    return run;
  }

  function culto(fase = "escolha") {
    const run = novaRun();
    run.atributos.habitantes = 0;
    run.atributos.honra = -40;
    resultado(run);
    run.aguardaDecisaoCulto = true;
    assert.equal(J.engine.juntarCulto(run), true);
    if (fase === "escolha") assert.equal(J.engine.avancar(run), true);
    run.inventarioAberto = true;
    return run;
  }

  async function clicar(dataset) {
    await app.click({
      target: {
        closest: () => ({ dataset, disabled: false, getAttribute: () => null, focus() {} }),
      },
      detail: 0,
    });
  }
  return {
    J,
    app,
    window,
    novaRun,
    culto,
    resultado,
    clicar,
    definirAleatorio: (valor) => {
      contexto.__valorAleatorio = valor;
    },
    iniciar: () => executar("main"),
  };
}

module.exports = { preparar };
