"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

// Executa os scripts comuns sem navegador ou bibliotecas externas.
function preparar() {
  const dados = new Map();
  const avisos = [];
  const falhas = { leitura: false, gravacao: null, remocao: false };
  const window = {
    crypto: { randomUUID: () => "run-teste" },
    dispatchEvent: evento => avisos.push(evento.detail),
    localStorage: {
      getItem(chave) { if (falhas.leitura) throw new Error("Bloqueado"); return dados.get(chave) ?? null; },
      setItem(chave, valor) { if (falhas.gravacao === chave) throw new Error("Sem espaço"); dados.set(chave, valor); },
      removeItem(chave) { if (falhas.remocao) throw new Error("Bloqueado"); dados.delete(chave); }
    }
  };
  const contexto = vm.createContext({ window, CustomEvent: class { constructor(tipo, opcoes) { this.detail = opcoes.detail; } } });
  for (const nome of ["state", "events", "items", "legacy", "engine", "save"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, `../js/${nome}.js`), "utf8"), contexto);
  }
  const J = window.Jogo;
  const run = J.estado.novo(J.legado.vazio());
  run.eventoId = "caixas_suspeitas";
  return { J, run, dados, falhas, avisos };
}
const simples = valor => JSON.parse(JSON.stringify(valor));

test("novos herdeiros começam com os valores acordados, sem itens herdados", () => {
  const { J } = preparar();
  const legado = J.legado.vazio();
  legado.itens.push("espada_antiga");
  const run = J.estado.novo(legado);
  assert.deepEqual(simples(run.atributos), { hp: 100, escudo: 5, ataque: 2, honra: 0, habitantes: 50, gold: 5 });
  assert.deepEqual(simples(run.inventario), []);
  assert.equal(J.estado.faixaHonra(30), "alta");
  assert.equal(J.estado.faixaHonra(-30), "baixa");
  assert.equal(J.estado.faixaHonra(29), "neutra");
  assert.equal(J.estado.faixaHonra(-29), "neutra");
});

test("renda usa grupos completos de 50 habitantes somente nas rodadas múltiplas de três", () => {
  for (const [habitantes, rodada, esperado] of [
    [20, 3, 5], [49, 3, 5], [50, 1, 5], [50, 2, 5],
    [50, 3, 6], [99, 3, 6], [100, 3, 7], [150, 6, 8], [100, 7, 5]
  ]) {
    const { J, run } = preparar();
    run.eventoId = "mercador";
    run.atributos.habitantes = habitantes;
    run.rodada = rodada;
    assert.equal(J.engine.escolher(run, "seguir"), true);
    assert.equal(run.atributos.gold, esperado, `${habitantes} habitantes na rodada ${rodada}`);
  }
});

test("menos de 20 habitantes custa um gold a cada rodada e nunca gera dívida", () => {
  for (const rodada of [1, 2, 3, 4]) {
    for (const gold of [0, 1, 5]) {
      const { J, run } = preparar();
      run.eventoId = "mercador";
      run.rodada = rodada;
      Object.assign(run.atributos, { habitantes: 19, gold });
      J.engine.escolher(run, "seguir");
      assert.equal(run.atributos.gold, Math.max(0, gold - 1));
      assert.equal(run.ultimoResultado.economia.variacaoRenda, gold ? -1 : 0);
    }
  }
});

test("renda considera os habitantes após a decisão e não repete ao carregar ou continuar", () => {
  const { J, run } = preparar();
  run.rodada = 3;
  // Aceitar as caixas perde doze habitantes antes do cálculo da renda.
  J.engine.escolher(run, "deixar");
  assert.equal(run.atributos.gold, 5);
  assert.equal(run.atributos.habitantes, 38);
  run.eventoId = "mercador";
  run.fase = "escolha";
  run.ultimoResultado = null;
  run.atributos.habitantes = 100;
  J.engine.escolher(run, "seguir");
  assert.equal(run.atributos.gold, 7);
  assert.equal(J.engine.escolher(run, "seguir"), false);
  J.save.gravarRun(run);
  const carregada = J.save.lerRun();
  assert.equal(carregada.atributos.gold, 7);
  assert.equal(carregada.ultimoResultado.economia.renda, 2);
  assert.equal(J.engine.avancar(carregada), true);
  assert.equal(carregada.rodada, 4);
  assert.equal(carregada.atributos.gold, 7);
});

test("compras cobram o preço exibido, melhoram atributos e aumentam cada produto separadamente", () => {
  const { J, run } = preparar();
  const evento = J.eventos.find(e => e.id === "mercador");
  Object.assign(run.atributos, { hp: 70, gold: 100 });
  const visitar = () => { run.eventoId = "mercador"; run.fase = "escolha"; run.ultimoResultado = null; };
  visitar();
  assert.deepEqual(simples(evento.mercadorias.map(m => J.engine.precoMercadoria(run, m))), [5, 10, 10]);
  assert.equal(J.engine.comprar(run, "pocao_cura"), true);
  assert.equal(run.atributos.hp, 80);
  assert.equal(run.atributos.gold, 95);
  assert.equal(J.engine.comprar(run, "pocao_cura"), false);
  visitar();
  assert.deepEqual(simples(evento.mercadorias.map(m => J.engine.precoMercadoria(run, m))), [7, 10, 10]);
  assert.equal(J.engine.comprar(run, "pocao_cura"), true);
  assert.equal(run.atributos.hp, 90);
  assert.equal(run.atributos.gold, 88);
  visitar();
  assert.equal(J.engine.comprar(run, "arma_melhor"), true);
  assert.equal(run.atributos.ataque, 4);
  visitar();
  assert.equal(J.engine.comprar(run, "escudo_melhor"), true);
  assert.equal(run.atributos.escudo, 8);
  assert.equal(run.atributos.gold, 68);
  assert.deepEqual(simples(evento.mercadorias.map(m => J.engine.precoMercadoria(run, m))), [9, 12, 12]);
  assert.deepEqual(simples(run.comprasMercador), { pocao_cura: 2, arma_melhor: 1, escudo_melhor: 1 });
  J.save.gravarRun(run);
  assert.deepEqual(simples(J.save.lerRun()), simples(run));
});

test("compras inválidas não alteram a run; renda futura não pode pagar uma compra", () => {
  const { J, run } = preparar();
  run.eventoId = "mercador";
  run.rodada = 3;
  run.atributos.gold = 4;
  const antes = simples(run);
  for (const id of ["pocao_cura", "arma_melhor", "escudo_melhor", "ausente", "__proto__"]) {
    assert.equal(J.engine.comprar(run, id), false);
    assert.deepEqual(simples(run), antes);
  }
  assert.equal(J.engine.escolher(run, "seguir"), true);
  assert.equal(run.atributos.gold, 5);
  // A renda é contabilizada depois do débito, sem esconder o preço pago.
  run.fase = "escolha";
  run.ultimoResultado = null;
  assert.equal(J.engine.comprar(run, "pocao_cura"), true);
  assert.equal(run.atributos.gold, 1);
  assert.deepEqual(simples(run.ultimoResultado.economia), { renda: 1, variacaoRenda: 1, gasto: 5 });
});

test("mercador pode ser sorteado e permite seguir mesmo sem moedas", () => {
  const { J, run } = preparar();
  const ids = new Set(Array.from({ length: 100 }, (_, i) => J.engine.sortear(run, () => i / 100).id));
  assert.ok(ids.has("mercador"));
  assert.ok(ids.size > 1);
  run.eventoId = "mercador";
  run.atributos.gold = 0;
  assert.equal(J.engine.escolher(run, "seguir"), true);
  assert.equal(run.atributos.gold, 0);
});

test("saves anteriores à economia migram sem perder progresso nem repetir decisões", () => {
  for (const fase of ["escolha", "resultado"]) {
    const { J, run, dados } = preparar();
    if (fase === "resultado") J.engine.escolher(run, "verificar");
    run.rodada = 6;
    run.versao = 1;
    delete run.atributos.gold;
    delete run.comprasMercador;
    if (run.ultimoResultado) {
      delete run.ultimoResultado.alteracoes.gold;
      delete run.ultimoResultado.economia;
    }
    dados.set("run_atual", JSON.stringify(run));
    const carregada = J.save.lerRun();
    assert.equal(carregada.versao, 2);
    assert.equal(carregada.rodada, 6);
    assert.equal(carregada.fase, fase);
    assert.equal(carregada.atributos.hp, run.atributos.hp);
    assert.equal(carregada.atributos.gold, 5);
    assert.deepEqual(simples(carregada.comprasMercador), {});
    if (fase === "resultado") assert.equal(carregada.ultimoResultado.alteracoes.gold, 0);
    assert.equal(J.save.gravarRun(carregada), true);
    assert.deepEqual(simples(J.save.lerRun()), simples(carregada));
  }
});

test("saldo e compras corrompidos são rejeitados ao carregar", () => {
  const { J, run, dados } = preparar();
  for (const gold of [-1, 1.5, "5", null, Number.MAX_SAFE_INTEGER + 1]) {
    const invalida = simples(run);
    invalida.atributos.gold = gold;
    dados.set("run_atual", JSON.stringify(invalida));
    assert.equal(J.save.lerRun(), null);
  }
  for (const compras of [null, [], { pocao_cura: -1 }, { arma_melhor: "1" }, { escudo_melhor: 1.5 }]) {
    dados.set("run_atual", JSON.stringify({ ...run, comprasMercador: compras }));
    assert.equal(J.save.lerRun(), null);
  }
});

test("um novo herdeiro reinicia saldo e preços; o legado não guarda moedas", () => {
  const { J, run, dados } = preparar();
  run.eventoId = "mercador";
  J.engine.comprar(run, "pocao_cura");
  run.atributos.gold = 50;
  J.engine.encerrar(run, "derrota", "Teste");
  assert.equal(J.save.finalizar(run), true);
  const herdeiro = J.estado.novo(J.save.lerLegado());
  assert.equal(herdeiro.atributos.gold, 5);
  assert.deepEqual(simples(herdeiro.comprasMercador), {});
  assert.equal(Object.hasOwn(JSON.parse(dados.get("legado")), "gold"), false);
});

test("caixas oferecem no máximo três opções, com variantes por honra", () => {
  const { J, run } = preparar();
  const evento = J.eventos.find(e => e.id === "caixas_suspeitas");
  assert.equal(J.engine.opcoes(evento, run).length, 2);
  run.atributos.honra = 50;
  assert.deepEqual(simples(J.engine.opcoes(evento, run).map(o => o.id)), ["deixar", "verificar", "uniao"]);
  run.atributos.honra = -50;
  assert.deepEqual(simples(J.engine.opcoes(evento, run).map(o => o.id)), ["deixar", "verificar", "expurgo"]);
  assert.equal(J.engine.escolher(run, "uniao"), false);
  assert.equal(run.fase, "escolha");
  assert.equal(J.engine.escolher(run, "expurgo"), true);
  assert.equal(run.atributos.habitantes, 20);
});

test("ataque malsucedido aplica dano mitigado e penalidade adicional do evento", () => {
  const { J, run } = preparar();
  run.eventoId = "saqueadores";
  J.engine.escolher(run, "combater");
  assert.equal(run.atributos.hp, 81);
  assert.equal(run.atributos.habitantes, 38);
  assert.equal(run.atributos.escudo, 5);
  assert.equal(run.ultimoResultado.combate.venceu, false);
  assert.equal(run.ultimoResultado.combate.dano, 19);
});

test("ataque igual à defesa vence; o dano nunca fica negativo", () => {
  const { J, run } = preparar();
  run.eventoId = "saqueadores";
  run.atributos.ataque = 3;
  run.atributos.escudo = 20;
  J.engine.escolher(run, "combater");
  assert.equal(run.ultimoResultado.combate.venceu, true);
  assert.equal(run.atributos.hp, 100);
  assert.equal(run.atributos.habitantes, 50);
  assert.equal(run.atributos.escudo, 20);
});

test("penalidade de falha pode definir mais HP perdido, sem alterar a engine", () => {
  const { J, run } = preparar();
  const batalha = J.eventos.find(e => e.id === "saqueadores").batalha;
  batalha.penalidadeFalha = { efeitos: { hp: -7, habitantes: -2 }, texto: "Você sofre uma ferida adicional." };
  run.eventoId = "saqueadores";
  J.engine.escolher(run, "combater");
  assert.equal(run.atributos.hp, 74);
  assert.equal(run.atributos.habitantes, 48);
  assert.equal(run.atributos.escudo, 5);
  assert.match(run.ultimoResultado.texto, /ferida adicional/);
});

test("derrotas por HP ou habitantes encerram a run após a consequência inteira", () => {
  for (const atributo of ["hp", "habitantes"]) {
    const { J, run } = preparar();
    run.eventoId = "saqueadores";
    run.atributos[atributo] = 1;
    J.engine.escolher(run, "combater");
    assert.equal(run.atributos[atributo], 0);
    assert.equal(run.status, "encerrada");
    assert.equal(run.fim.tipo, "derrota");
    assert.equal(J.engine.avancar(run), false);
  }
});

test("desbloqueios permanecem pendentes e só entram nas pools da próxima run", () => {
  const { J, run, dados } = preparar();
  J.eventos.push({ id: "evento_secreto", bloqueado: true, opcoes: [{ id: "ok", texto: "Ok" }] });
  J.itens.push({ id: "item_secreto", bloqueado: true }, { id: "item_da_flag", requerDesbloqueio: "marca" });
  J.eventos.find(e => e.id === run.eventoId).opcoes[1].desbloqueia = {
    eventos: ["evento_secreto"], itens: ["item_secreto"], flags: ["marca"]
  };
  J.engine.escolher(run, "verificar");
  J.save.gravarRun(run);
  assert.equal(dados.has("legado"), false);
  assert.equal(J.engine.pools(run).eventos.some(e => e.id === "evento_secreto"), false);
  assert.equal(J.engine.pools(run).itens.length, 0);
  const retomada = J.save.lerRun();
  J.engine.encerrar(retomada, "vitoria", "Condição de teste");
  assert.equal(J.save.finalizar(retomada), true);
  assert.equal(dados.has("run_atual"), false);
  const proxima = J.estado.novo(J.save.lerLegado());
  assert.equal(J.engine.pools(proxima).eventos.some(e => e.id === "evento_secreto"), true);
  assert.deepEqual(simples(J.engine.pools(proxima).itens.map(i => i.id)), ["item_secreto", "item_da_flag"]);
  assert.deepEqual(simples(proxima.inventario), []);
});

test("objetivos são lembrados mesmo se sua condição deixar de ser verdadeira", () => {
  const { J, run } = preparar();
  assert.equal(J.objetivosLegado.length, 0);
  J.objetivosLegado.push({ id: "objetivo_teste", condicao: r => r.atributos.honra >= 5, desbloqueia: { flags: ["objetivo_feito"] } });
  J.engine.escolher(run, "verificar");
  run.atributos.honra = -20;
  J.legado.avaliar(run);
  J.legado.avaliar(run);
  assert.deepEqual(simples(run.conquistas.objetivosConcluidos), ["objetivo_teste"]);
  assert.equal(run.conquistas.flags.objetivo_feito, true);
});

test("honra baixa aumenta o peso da desordem, e sorteios respeitam requisitos", () => {
  const { J, run } = preparar();
  const evento = J.eventos.find(e => e.id === "celeiro");
  assert.equal(J.engine.peso(evento, run), 1);
  run.atributos.honra = -30;
  assert.equal(J.engine.peso(evento, run), 5);
  assert.equal(J.engine.opcoes(evento, run).some(o => o.id === "investigar"), true);
  run.atributos.honra = -50;
  assert.equal(J.engine.opcoes(evento, run).some(o => o.id === "investigar"), false);
  for (const valor of [0, .2, .5, .99]) assert.notEqual(J.engine.sortear(run, () => valor).id, run.eventoId);
  assert.equal(J.engine.cumpre({ flagsLegado: ["ausente"] }, run), false);
  run.legadoDaRun.flags.negada = false;
  assert.equal(J.engine.cumpre({ flagsLegado: ["negada"] }, run), false);
  assert.equal(J.legado.disponivel({ id: "oculto", requerDesbloqueio: "negada" }, "eventos", run.legadoDaRun), false);
});

test("carregar um resultado não reaplica efeitos nem sorteia outra carta", () => {
  const { J, run } = preparar();
  J.engine.escolher(run, "verificar");
  assert.equal(J.save.gravarRun(run), true);
  const carregada = J.save.lerRun();
  assert.equal(carregada.fase, "resultado");
  assert.equal(carregada.eventoId, "caixas_suspeitas");
  assert.equal(carregada.atributos.hp, 90);
  assert.equal(J.engine.escolher(carregada, "verificar"), false);
  assert.equal(carregada.atributos.hp, 90);
  assert.equal(J.engine.avancar(carregada), true);
  assert.equal(carregada.rodada, 2);
});

test("saves inválidos e legado corrompido usam padrões seguros", () => {
  const { J, run, dados, avisos } = preparar();
  for (const invalida of ["{", "null", "[]", '{"versao":999}', JSON.stringify({ ...run, atributos: { hp: "cem" } })]) {
    dados.set("run_atual", invalida);
    assert.equal(J.save.lerRun(), null);
  }
  for (const invalido of ["{", "[]", "null", "42", '{"versao":1,"eventos":1,"flags":[]}', '{"versao":20}']) {
    dados.set("legado", invalido);
    assert.deepEqual(simples(J.save.lerLegado()), simples(J.legado.vazio()));
  }
  assert.ok(avisos.length > 0);
});

test("armazenamento bloqueado não interrompe a engine", () => {
  const { J, run, falhas, avisos } = preparar();
  falhas.leitura = true;
  falhas.gravacao = "run_atual";
  assert.equal(J.save.lerRun(), null);
  assert.deepEqual(simples(J.save.lerLegado()), simples(J.legado.vazio()));
  assert.equal(J.save.gravarRun(run), false);
  assert.equal(J.engine.escolher(run, "verificar"), true);
  falhas.remocao = true;
  assert.equal(J.save.apagarRun(), false);
  assert.ok(avisos.length >= 3);
});

test("falha ao gravar legado mantém o encerramento e permite recuperação idempotente", () => {
  const { J, run, dados, falhas } = preparar();
  J.legado.conceder(run, { eventos: ["novo"], flags: ["marca"] });
  J.engine.encerrar(run, "derrota", "Teste");
  falhas.gravacao = "legado";
  assert.equal(J.save.finalizar(run), false);
  assert.equal(dados.has("run_atual"), true);
  assert.equal(dados.has("legado"), false);
  falhas.gravacao = null;
  const recuperada = J.save.lerRun();
  assert.equal(recuperada.status, "encerrada");
  assert.equal(J.save.finalizar(recuperada), true);
  assert.equal(J.save.finalizar(recuperada), true);
  assert.deepEqual(simples(J.save.lerLegado().eventos), ["novo"]);
  assert.equal(J.save.lerLegado().flags.marca, true);
  assert.equal(dados.has("run_atual"), false);
});

test("apagar a run preserva o legado", () => {
  const { J, run, dados } = preparar();
  const legado = J.legado.vazio();
  legado.flags.anterior = true;
  dados.set("legado", JSON.stringify(legado));
  J.save.gravarRun(run);
  J.save.apagarRun();
  assert.equal(J.save.lerLegado().flags.anterior, true);
});

test("encerramento não sobrescreve um legado que não pôde ser lido", () => {
  const { J, run, dados, falhas } = preparar();
  const legado = J.legado.vazio();
  legado.flags.anterior = true;
  dados.set("legado", JSON.stringify(legado));
  J.legado.conceder(run, { flags: ["nova"] });
  J.engine.encerrar(run, "derrota", "Teste");
  falhas.leitura = true;
  assert.equal(J.save.finalizar(run), false);
  assert.equal(JSON.parse(dados.get("legado")).flags.anterior, true);
  assert.equal(JSON.parse(dados.get("legado")).flags.nova, undefined);
  assert.equal(JSON.parse(dados.get("run_atual")).status, "encerrada");
  falhas.leitura = false;
  assert.equal(J.save.finalizar(J.save.lerRun()), true);
  assert.deepEqual(simples(J.save.lerLegado().flags), { anterior: true, nova: true });
});

test("sem armazenamento, somente conquistas de runs encerradas passam ao herdeiro em memória", () => {
  const { J, run, dados, falhas } = preparar();
  J.legado.conceder(run, { flags: ["conquista"] });
  assert.equal(J.save.lerLegado().flags.conquista, undefined);
  falhas.gravacao = "legado";
  J.engine.encerrar(run, "derrota", "Teste");
  assert.equal(J.save.finalizar(run), false);
  assert.equal(dados.has("legado"), false);
  const herdeiro = J.estado.novo(J.save.lerLegado());
  assert.equal(herdeiro.legadoDaRun.flags.conquista, true);
  assert.deepEqual(simples(herdeiro.inventario), []);
  falhas.gravacao = null;
  J.engine.encerrar(herdeiro, "derrota", "Teste");
  assert.equal(J.save.finalizar(herdeiro), true);
  assert.equal(JSON.parse(dados.get("legado")).flags.conquista, true);
});

test("limiares de aparência e de escolhas são independentes e inclusivos", () => {
  const { J, run } = preparar();
  const evento = J.eventos.find(e => e.id === "caixas_suspeitas");
  const casos = [
    [29, "neutra", null], [30, "alta", null], [49, "alta", null], [50, "alta", "uniao"],
    [-29, "neutra", null], [-30, "baixa", null], [-49, "baixa", null], [-50, "baixa", "expurgo"]
  ];
  for (const [honra, visual, especial] of casos) {
    run.atributos.honra = honra;
    assert.equal(J.estado.faixaHonra(honra), visual);
    const visiveis = J.engine.opcoes(evento, run).map(o => o.id);
    assert.equal(visiveis.includes("uniao"), especial === "uniao", `União com honra ${honra}`);
    assert.equal(visiveis.includes("expurgo"), especial === "expurgo", `Expurgo com honra ${honra}`);
    assert.equal(visiveis.length, especial ? 3 : 2);
  }
});

test("sorteio evita as cinco últimas cartas mesmo com peso alto, sem travar pools pequenas", () => {
  const { J, run } = preparar();
  J.eventos = ["a", "b", "c", "d", "e", "f"].map(id => ({ id, peso: id === "e" ? 1000 : 1, opcoes: [{ id: "ok" }] }));
  run.eventosRecentes = ["a", "b", "c", "d", "e"];
  run.eventoId = "e";
  for (const valor of [0, .2, .8, .999]) assert.equal(J.engine.sortear(run, () => valor).id, "f");
  J.eventos = J.eventos.slice(0, 2);
  run.eventosRecentes = ["a", "b"];
  run.eventoId = "b";
  assert.equal(J.engine.sortear(run, () => .9).id, "a");
  J.eventos = J.eventos.slice(1);
  assert.equal(J.engine.sortear(run).id, "b");
  J.eventos = [];
  assert.equal(J.engine.sortear(run), null);
});

test("histórico de eventos persiste e saves antigos recebem histórico vazio", () => {
  const { J, run, dados } = preparar();
  J.engine.escolher(run, "verificar");
  assert.deepEqual(simples(run.eventosRecentes), ["caixas_suspeitas"]);
  J.save.gravarRun(run);
  assert.deepEqual(simples(J.save.lerRun().eventosRecentes), ["caixas_suspeitas"]);
  delete run.eventosRecentes;
  dados.set("run_atual", JSON.stringify(run));
  assert.deepEqual(simples(J.save.lerRun().eventosRecentes), []);
  for (const invalido of [null, "caixas", [3], ["a", "b", "c", "d", "e", "f"]]) {
    dados.set("run_atual", JSON.stringify({ ...run, eventosRecentes: invalido }));
    assert.equal(J.save.lerRun(), null);
  }
});

test("escolhas no poço abrem consequências da run e a crise resolvida deixa o sorteio", () => {
  const { J, run } = preparar();
  J.eventos = J.eventos.filter(e => ["poco_turvo", "febre_do_poco", "geada"].includes(e.id));
  const poco = J.eventos.find(e => e.id === "poco_turvo");
  const febre = J.eventos.find(e => e.id === "febre_do_poco");
  assert.equal(J.engine.cumpre(febre.requisitos, run), false);
  run.eventoId = poco.id;
  J.engine.escolher(run, "adiar");
  assert.equal(J.engine.cumpre(poco.requisitos, run), false);
  assert.equal(J.engine.cumpre(febre.requisitos, run), true);
  const indice = J.eventos.findIndex(e => e.id === "geada");
  J.eventos[indice].peso = 0;
  assert.equal(J.engine.avancar(run), true);
  assert.equal(run.eventoId, febre.id);
  J.engine.escolher(run, "cuidar");
  assert.equal(run.flags.febre_resolvida, true);
  assert.equal(J.engine.cumpre(febre.requisitos, run), false);
  assert.equal(J.engine.sortear(run), null);
  assert.equal(J.estado.novo(J.legado.vazio()).flags.febre_resolvida, undefined);
});

test("reparar a ponte libera uma caravana, cuja recompensa não pode ser repetida", () => {
  const { J, run } = preparar();
  const caravana = J.eventos.find(e => e.id === "caravana_da_ponte");
  assert.equal(J.engine.cumpre(caravana.requisitos, run), false);
  run.eventoId = "ponte_partida";
  J.engine.escolher(run, "trabalhar");
  assert.equal(J.engine.cumpre(caravana.requisitos, run), true);
  run.fase = "escolha";
  run.eventoId = caravana.id;
  J.engine.escolher(run, "comercio");
  assert.equal(run.atributos.gold, 12);
  assert.equal(J.engine.cumpre(caravana.requisitos, run), false);
});

test("todo evento oferece saídas válidas e resultados finitos para ambas as honras e combates", () => {
  for (const honra of [-50, 0, 50]) {
    const { J } = preparar();
    assert.equal(J.eventos.length, 127);
    assert.equal(new Set(J.eventos.map(e => e.id)).size, J.eventos.length);
    for (const evento of J.eventos) {
      for (const gold of [0, 100]) {
        const base = J.estado.novo(J.legado.vazio());
        Object.assign(base.atributos, { gold, honra });
        base.rodada = Math.max(1, evento.requisitos?.rodadaMin || 1);
        base.eventoId = evento.id;
        for (const flag of evento.requisitos?.flags || []) base.flags[flag] = true;
        for (const flag of evento.requisitos?.flagsLegado || []) base.legadoDaRun.flags[flag] = true;
        const opcoes = J.engine.opcoes(evento, base);
        assert.ok(opcoes.length >= 1 && opcoes.length <= 4, evento.id);
        for (const opcao of opcoes) {
          for (const ataque of evento.batalha ? [0, 10] : [2]) {
            const run = simples(base);
            run.atributos.ataque = ataque;
            assert.equal(J.engine.escolher(run, opcao.id), true, `${evento.id}/${opcao.id}`);
            assert.ok(J.atributos.every(id => Number.isSafeInteger(run.atributos[id])));
            assert.equal(J.save.runValida(run), true, `${evento.id}/${opcao.id}`);
          }
        }
      }
    }
  }
});
