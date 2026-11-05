"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function preparar(eventoId) {
  const dados = new Map();
  const window = {
    crypto: { randomUUID: () => "novos-eventos" }, dispatchEvent() {},
    localStorage: {
      getItem: chave => dados.get(chave) ?? null,
      setItem: (chave, valor) => dados.set(chave, valor),
      removeItem: chave => dados.delete(chave)
    }
  };
  const contexto = vm.createContext({ window, CustomEvent: class {} });
  for (const nome of [
    "state", "events", "events-vila", "events-pactos", "events-abissais", "events-baus",
    "events-personagens-cadeias", "events-conselheiro", "events-recompensas", "events-specials",
    "events-lethal", "events-cult", "events-foundations", "events-entity", "events-supernatural",
    "events-grail", "events-druida", "events-anuais", "events-personagens", "events-artes-especificas",
    "events-ajustes", "items", "legacy", "engine", "save"
  ]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, `../js/${nome}.js`), "utf8"), contexto);
  }
  const J = window.Jogo;
  const run = J.estado.novo(J.legado.vazio());
  run.eventoId = eventoId;
  run.rodada = 8; // Todos os requisitos mínimos, sem renda nesta rodada.
  Object.assign(run.atributos, { gold: 10, honra: 50 });
  const evento = J.eventos.find(e => e.id === eventoId);
  for (const flag of evento?.requisitos?.flags || []) run.flags[flag] = true;
  return { J, run, dados, evento };
}
const simples = valor => JSON.parse(JSON.stringify(valor));

test("as 24 decisões sem combate dos novos eventos aplicam os efeitos definidos pelo autor", () => {
  const casos = [
    ["orfao", "acolher", { habitantes: 1, honra: 3 }],
    ["orfao", "pao", { honra: 1, gold: -1 }],
    ["orfao", "tutelar", { habitantes: 1, honra: 2 }],
    ["orfao", "explorar", { gold: 3, honra: -4 }, -50],
    ["orfao_cresce", "treinar", { ataque: 1, honra: 2, hp: -4 }],
    ["orfao_cresce", "ferreiro", { escudo: 1, honra: 1, gold: -3 }],
    ["orfao_cresce", "campos", { habitantes: 2, honra: -1 }],
    ["testamento", "ler", { gold: 6, honra: -3 }],
    ["banquete", "sentar", { hp: 8, habitantes: 3, honra: 2 }],
    ["banquete", "vinho", { habitantes: 5, honra: 3, gold: -4 }],
    ["banquete", "servir", { escudo: 1, honra: 3 }],
    ["banquete", "cobrar", { gold: 5, honra: -4 }],
    ["taverna", "mediar", { honra: 3, hp: -5 }],
    ["taverna", "pagar", { honra: 1, gold: -3 }],
    ["taverna", "dispersar", { habitantes: -2, honra: -1 }],
    ["taverna", "prender", { gold: 4, habitantes: -4, honra: -6 }, -50],
    ["peregrino", "comprar", { habitantes: 3, honra: 2, gold: -5 }],
    ["peregrino", "revistar", { gold: 4, honra: 1 }],
    ["peregrino", "taxar", { gold: 3, honra: -2 }],
    ["barao", "pagar", { gold: -6, honra: -1 }],
    ["barao", "negociar", { honra: 2, hp: -3, gold: -3 }],
    ["pedagio_revolta", "abolir", { habitantes: 3, honra: 3, gold: -3 }],
    ["pedagio_revolta", "guardar", { gold: 3, honra: -2 }],
    ["pedagio_revolta", "enforcar", { habitantes: -3, honra: -8 }, -50]
  ];
  for (const [id, opcao, efeitos, honra = 50] of casos) {
    const { J, run } = preparar(id);
    run.atributos.honra = honra;
    const antes = { ...run.atributos };
    assert.equal(J.engine.escolher(run, opcao), true, `${id}/${opcao}`);
    for (const atributo of J.atributos) assert.equal(run.atributos[atributo] - antes[atributo], efeitos[atributo] || 0, `${id}/${opcao}/${atributo}`);
    assert.equal(J.save.runValida(run), true);
    J.save.gravarRun(run);
    assert.deepEqual(simples(J.save.lerRun()), simples(run));
    assert.equal(J.engine.escolher(run, opcao), false);
  }
});

test("rodadas mínimas entram exatamente em 4, 5, 6 e 8 ao avançar", () => {
  for (const [id, minima] of [["barao", 4], ["testamento", 5], ["desertores", 6], ["orfao_cresce", 8]]) {
    const { J, run, evento } = preparar(id);
    J.eventos = [evento];
    run.fase = "resultado";
    run.eventoId = "carta_anterior";
    run.rodada = minima - 2;
    const antes = simples(run);
    assert.equal(J.engine.avancar(run), false, id);
    assert.deepEqual(simples(run), antes);
    run.rodada = minima - 1;
    assert.equal(J.engine.avancar(run), true, id);
    assert.equal(run.rodada, minima);
    assert.equal(run.eventoId, id);
    assert.equal(J.save.runValida(run), true);
  }
});

test("órfão acolhido permite a continuação a partir da rodada 8, uma vez por run", () => {
  for (const escolha of ["acolher", "tutelar", "pao", "explorar"]) {
    const { J, run, evento } = preparar("orfao");
    if (escolha === "explorar") run.atributos.honra = -50;
    run.rodada = 7;
    J.engine.escolher(run, escolha);
    assert.equal(J.engine.cumpre(evento.requisitos, run), false);
    const continua = J.eventos.find(e => e.id === "orfao_cresce");
    J.eventos = [continua];
    const acolhido = ["acolher", "tutelar"].includes(escolha);
    assert.equal(J.engine.avancar(run), acolhido, escolha);
    if (acolhido) {
      assert.equal(run.rodada, 8);
      assert.equal(run.eventoId, "orfao_cresce");
      J.engine.escolher(run, "treinar");
      assert.equal(run.flags.orfao_resolvido, true);
      assert.equal(J.engine.sortear(run), null);
    }
  }
});

test("todos os desfechos do pedágio resolvem o evento; só cobrar a ponte o libera", () => {
  for (const [ponte, abre] of [["madeira", false], ["trabalhar", false], ["pedagio", true]]) {
    const { J, run } = preparar("ponte_partida");
    J.engine.escolher(run, ponte);
    const revolta = J.eventos.find(e => e.id === "pedagio_revolta");
    J.eventos = [revolta];
    assert.equal(Boolean(J.engine.sortear(run)), abre);
  }
  for (const escolha of ["abolir", "guardar", "enforcar"]) {
    const { J, run, evento } = preparar("pedagio_revolta");
    run.atributos.honra = -50;
    J.engine.escolher(run, escolha);
    J.eventos = [evento];
    assert.equal(run.flags.pedagio_resolvido, true);
    assert.equal(J.engine.sortear(run), null);
  }
});

test("testamento guarda a flag pendente e só a transfere ao legado em vitória ou derrota", () => {
  for (const tipo of ["vitoria", "derrota"]) {
    const { J, run, dados, evento } = preparar("testamento");
    J.engine.escolher(run, "ler");
    assert.equal(run.flags.testamento_lido, true);
    assert.equal(run.conquistas.flags.vontade_lembrada, true);
    assert.equal(run.legadoDaRun.flags.vontade_lembrada, undefined);
    assert.equal(dados.has("legado"), false);
    assert.equal(J.engine.cumpre(evento.requisitos, run), false);
    J.save.gravarRun(run);
    const carregada = J.save.lerRun();
    assert.equal(carregada.conquistas.flags.vontade_lembrada, true);
    J.engine.encerrar(carregada, tipo, "Fim de teste");
    assert.equal(J.save.finalizar(carregada), true);
    const proxima = J.estado.novo(J.save.lerLegado());
    assert.equal(proxima.legadoDaRun.flags.vontade_lembrada, true);
    assert.equal(proxima.atributos.gold, 5);
    assert.equal(proxima.flags.testamento_lido, undefined);
    assert.equal(J.objetivosLegado.length, 0);
  }
});

test("banquete usa +30 para sorteio e +50 para servir, com quatro respostas autorizadas", () => {
  const { J, run, evento } = preparar("banquete");
  for (const [honra, sorteavel, quantidade] of [[29, false, 3], [30, true, 3], [49, true, 3], [50, true, 4]]) {
    run.atributos.honra = honra;
    assert.equal(J.engine.cumpre(evento.requisitos, run), sorteavel);
    assert.equal(J.engine.opcoes(evento, run).length, quantidade);
  }
  run.atributos.gold = 3;
  assert.equal(J.engine.opcoes(evento, run).length, 3);
});

test("taverna muda peso em −30 e respostas em −50; sempre oferece uma saída sem gold", () => {
  const { J, run, evento } = preparar("taverna");
  for (const honra of [-51, -50, -49, -30, -29, 0, 50]) {
    run.atributos.honra = honra;
    run.atributos.gold = 0;
    assert.equal(J.engine.peso(evento, run), honra <= -30 ? 5 : 1);
    const ids = J.engine.opcoes(evento, run).map(o => o.id);
    assert.ok(ids.includes("dispersar"));
    assert.equal(ids.includes("mediar"), honra > -50);
    assert.equal(ids.includes("prender"), honra <= -50);
  }
});

test("barão exige 4 de ataque, mantém escudo e aplica perda de população e gold na falha", () => {
  for (const [ataque, escudo, hp, habitantes, gold, honra] of [[4, 5, 91, 52, 16, 53], [3, 5, 83, 44, 7, 50], [3, 100, 100, 44, 7, 50]]) {
    const { J, run } = preparar("barao");
    Object.assign(run.atributos, { ataque, escudo });
    J.engine.escolher(run, "combater");
    assert.deepEqual(simples(run.atributos), { hp, escudo, ataque, honra, habitantes, gold });
    assert.equal(run.ultimoResultado.combate.venceu, ataque >= 4);
  }
});

test("negociação do barão exige honra e saldo antes da renda e custa 3 gold e 3 HP diretos", () => {
  for (const [honra, gold, permitido] of [[49, 10, false], [50, 2, false], [50, 3, true]]) {
    const { J, run } = preparar("barao");
    Object.assign(run.atributos, { honra, gold, escudo: 100 });
    run.rodada = 6;
    const antes = simples(run);
    assert.equal(J.engine.escolher(run, "negociar"), permitido);
    if (!permitido) assert.deepEqual(simples(run), antes);
    else {
      assert.equal(run.atributos.hp, 97);
      assert.equal(run.atributos.gold, 1); // 3 pagos, depois 1 da vila.
      assert.equal(run.atributos.honra, 52);
      assert.equal(run.ultimoResultado.alteracoes.gold, -2);
    }
  }
});

test("alterar honra para testes durante um banquete não invalida o salvamento da carta já sorteada", () => {
  const { J, run } = preparar("banquete");
  J.engine.testarHonra(run, -30);
  assert.equal(run.atributos.honra, 20);
  assert.equal(J.save.runValida(run), true);
  J.save.gravarRun(run);
  assert.equal(J.save.lerRun().eventoId, "banquete");
  J.eventos = [J.eventos.find(e => e.id === "banquete")];
  assert.equal(J.engine.sortear(run), null, "A mudança não libera um novo sorteio de banquete sem honra");
});

test("carregamento continua rejeitando cartas sem flags ou antes da rodada mínima", () => {
  for (const id of ["barao", "testamento", "orfao_cresce", "pedagio_revolta"]) {
    const { J, run } = preparar(id);
    if (id === "pedagio_revolta") run.flags = {};
    else run.rodada = 1;
    assert.equal(J.save.runValida(run), false, id);
  }
});
