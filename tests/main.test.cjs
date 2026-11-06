"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

// Exercita o botão através do controlador real, inclusive quando o save muda
// depois que o menu já foi aberto. A apresentação é substituída por um registro.
function preparar() {
  const dados = new Map();
  const app = {
    addEventListener(tipo, funcao) {
      this[tipo] = funcao;
    },
  };
  const tela = {};
  const window = {
    crypto: { randomUUID: () => "run-controlador" },
    dispatchEvent() {},
    localStorage: {
      getItem: (chave) => dados.get(chave) ?? null,
      setItem: (chave, valor) => dados.set(chave, valor),
      removeItem: (chave) => dados.delete(chave),
    },
  };
  const contexto = vm.createContext({
    window,
    document: {
      getElementById: () => app,
      querySelector: (seletor) =>
        seletor === "#app #painel-progresso > summary"
          ? { click: () => Object.assign(tela, { progressoAbriu: true }) }
          : null,
      querySelectorAll: () => [],
      addEventListener() {},
    },
    CustomEvent: class {
      constructor(tipo, opcoes) {
        this.detail = opcoes.detail;
      }
    },
  });
  vm.runInContext("Math.random = () => 0.25;", contexto);
  const executar = (nome) =>
    vm.runInContext(fs.readFileSync(path.join(__dirname, `../js/${nome}.js`), "utf8"), contexto);
  for (const nome of ["state", "herdeiros", "events", "items", "legacy", "engine", "save"]) executar(nome);
  const J = window.Jogo;
  J.ui = {
    modoDebug: () => true,
    menu: (run) => Object.assign(tela, { nome: "inicio", run }),
    intro: () => Object.assign(tela, { nome: "intro" }),
    tutorial() {},
    jogo: (run) => Object.assign(tela, { nome: "jogo", run }),
    fim: (run) => Object.assign(tela, { nome: "fim", run }),
    confirmarNovaRun: async () => true,
  };
  function novaRun(rodada = 1) {
    const run = J.estado.novo(J.legado.vazio());
    run.eventoId = "caixas_suspeitas";
    run.rodada = rodada;
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
  return { J, dados, tela, window, novaRun, clicar, iniciarControlador: () => executar("main") };
}

test("debug libera todos os personagens sem forçar outro início ou conceder conquistas", async () => {
  const { J, dados, clicar, iniciarControlador } = preparar();
  dados.set("debug_forcar_heroi", "1");
  iniciarControlador();
  await clicar({ acao: "debug-liberar-personagens" });
  for (const id of J.herdeiros.desbloqueaveis) assert.equal(J.save.lerLegado().flags[id], true);
  assert.equal(dados.has("debug_forcar_heroi"), false);
  assert.equal(J.save.lerLegado().conquistasDesbloqueadas.length, 0);
  assert.equal(J.save.lerRun(), null);
});

test("Carregar lê o save atual no clique, sem retomar a cópia antiga do menu", async () => {
  const { J, tela, novaRun, clicar, iniciarControlador } = preparar();
  J.save.gravarRun(novaRun(1));
  iniciarControlador();
  const atual = novaRun(7);
  atual.atributos.hp = 43;
  atual.atributos.habitantes = 31;
  atual.atributos.ataque = 4;
  atual.flags.praga_evitada = true;
  J.save.gravarRun(atual);

  await clicar({ acao: "carregar" });
  assert.equal(tela.nome, "jogo");
  assert.equal(tela.run.rodada, 7);
  assert.equal(tela.run.atributos.hp, 43);
  assert.equal(tela.run.atributos.habitantes, 31);
  assert.equal(tela.run.atributos.ataque, 4);
  assert.equal(tela.run.flags.praga_evitada, true);
});

test("Progresso abre o histórico da crônica atual", async () => {
  const { J, tela, novaRun, clicar, iniciarControlador } = preparar();
  J.save.gravarRun(novaRun(8));
  iniciarControlador();

  await clicar({ acao: "carregar" });
  await clicar({ acao: "alternar-progresso" });

  assert.equal(tela.nome, "jogo");
  assert.equal(tela.run.rodada, 8);
  assert.equal(tela.progressoAbriu, true);
});

test("Carregar recupera o resultado salvo sem reaplicar a escolha", async () => {
  const { J, tela, novaRun, clicar, iniciarControlador } = preparar();
  J.save.gravarRun(novaRun());
  iniciarControlador();
  const atual = novaRun(4);
  J.engine.escolher(atual, "verificar");
  J.save.gravarRun(atual);

  await clicar({ acao: "carregar" });
  assert.equal(tela.run.rodada, 4);
  assert.equal(tela.run.fase, "resultado");
  assert.equal(tela.run.atributos.hp, 110);
  assert.equal(tela.run.ultimoResultado.escolha, "Vou verificar pessoalmente.");
  await clicar({ acao: "continuar" });
  assert.equal(tela.run.rodada, 5);
  assert.equal(tela.run.atributos.hp, 110);
  assert.equal(J.save.lerRun().rodada, 5);
});

test("Carregar continua a sessão em memória se o navegador não puder salvar", async () => {
  const { J, tela, window, novaRun, clicar, iniciarControlador } = preparar();
  J.save.gravarRun(novaRun(3));
  iniciarControlador();
  await clicar({ acao: "carregar" });
  await clicar({ opcao: "verificar" });
  await clicar({ acao: "menu" });
  // Simula uma leitura indisponível; o progresso que está em memória continua utilizável.
  window.localStorage.getItem = () => {
    throw new Error("Armazenamento indisponível");
  };
  await clicar({ acao: "carregar" });
  assert.equal(tela.nome, "jogo");
  assert.equal(tela.run.rodada, 3);
  assert.equal(tela.run.atributos.hp, 110);
});

test("comprar pelo controlador salva o saldo, a renda e os preços sem reaplicar ao carregar", async () => {
  const { J, tela, novaRun, clicar, iniciarControlador } = preparar();
  const run = novaRun(3);
  run.eventoId = "mercador";
  run.atributos.hp = 70;
  J.save.gravarRun(run);
  iniciarControlador();
  await clicar({ acao: "carregar" });
  await clicar({ mercadoria: "pocao_cura" });
  assert.equal(tela.run.fase, "resultado");
  assert.equal(tela.run.atributos.hp, 80);
  assert.equal(tela.run.atributos.gold, 1);
  assert.equal(J.save.lerRun().comprasMercador.pocao_cura, 1);
  await clicar({ acao: "menu" });
  await clicar({ acao: "carregar" });
  assert.equal(tela.run.atributos.gold, 1);
  assert.equal(tela.run.atributos.hp, 80);
  const pocao = J.eventos.find((e) => e.id === "mercador").mercadorias[0];
  assert.equal(J.engine.precoMercadoria(tela.run, pocao), 7);
  await clicar({ acao: "continuar" });
  assert.equal(tela.run.rodada, 4);
  assert.equal(tela.run.atributos.gold, 1);
});

test("botões de teste alteram apenas a honra e preservam rodada, saldo e resultado ao carregar", async () => {
  const { J, tela, novaRun, clicar, iniciarControlador } = preparar();
  J.save.gravarRun(novaRun(3));
  iniciarControlador();
  await clicar({ acao: "carregar" });
  const antes = JSON.parse(JSON.stringify(tela.run));
  await clicar({ acao: "honra-mais" });
  assert.equal(tela.run.atributos.honra, 30);
  assert.equal(J.estado.faixaHonra(tela.run.atributos.honra), "alta");
  assert.deepEqual(JSON.parse(JSON.stringify(tela.run)), {
    ...antes,
    atributos: { ...antes.atributos, honra: 30 },
    honraSempreNeutra: false,
  });
  await clicar({ acao: "honra-menos" });
  await clicar({ acao: "honra-menos" });
  assert.equal(tela.run.atributos.honra, -30);
  await clicar({ acao: "menu" });
  await clicar({ acao: "carregar" });
  assert.equal(tela.run.atributos.honra, -30);
  await clicar({ opcao: "verificar" });
  const resultado = JSON.parse(JSON.stringify(tela.run.ultimoResultado));
  const gold = tela.run.atributos.gold;
  await clicar({ acao: "honra-mais" });
  assert.equal(tela.run.fase, "resultado");
  assert.equal(tela.run.rodada, 3);
  assert.equal(tela.run.atributos.gold, gold);
  assert.deepEqual(JSON.parse(JSON.stringify(tela.run.ultimoResultado)), resultado);
});
