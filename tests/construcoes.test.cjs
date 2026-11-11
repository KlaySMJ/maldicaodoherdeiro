"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

function base(id = "moinho") {
  const c = preparar();
  const run = c.novaRun();
  run.construcoes.push(id);
  run.atributos.gold = 30;
  c.J.sistemas.vila(run);
  run.rodada = 7;
  return { ...c, run, S: c.J.sistemas };
}
function recarregar(J, run) {
  assert.equal(J.save.runValida(run), true);
  assert.equal(J.save.gravarRun(run), true);
  const lida = J.save.lerRun();
  assert.ok(lida);
  return lida;
}

test("melhorias cobram uma vez, aguardam seis dias e preservam o dia da carta", () => {
  const { J, S, run } = base();
  assert.equal(S.executarObra(run, "moinho", "melhorar"), true);
  assert.equal(run.atributos.gold, 24);
  assert.equal(run.rodada, 7);
  assert.equal(S.executarObra(run, "moinho", "melhorar"), false);
  assert.equal(run.atributos.gold, 24);
  const lida = recarregar(J, run);
  lida.rodada = 13;
  assert.equal(S.executarObra(lida, "moinho", "melhorar", "comercial"), true);
  assert.equal(lida.atributos.gold, 14);
  assert.equal(lida.sistemas.especializacao, "comercial");
  assert.equal(S.executarObra(lida, "moinho", "melhorar", "comunitario"), false);
  lida.rodada = 15;
  assert.equal(S.renda(lida), 1);
  assert.equal(recarregar(J, lida).vila.obras.moinho.caminho, "comercial");
});

test("artesãos concluem melhorias após três dias sem pagar nem avançar a carta", () => {
  const { J, S, run } = base("ponte");
  run.atributos.gold = 0;
  assert.equal(S.executarObra(run, "ponte", "historia"), true);
  assert.equal(S.executarObra(run, "ponte", "historia"), false);
  assert.equal(S.executarObra(run, "ponte", "concluir"), false);
  const lida = recarregar(J, run);
  lida.rodada = 10;
  assert.equal(S.executarObra(lida, "ponte", "concluir"), true);
  assert.equal(lida.rodada, 10);
  assert.equal(lida.atributos.gold, 0);
  assert.equal(lida.vila.obras.ponte.nivel, 2);
  assert.equal(S.executarObra(lida, "ponte", "concluir"), false);
});

test("danos reduzem melhorias e interrompem renda; reparos recuperam os efeitos", () => {
  const { J, S, run } = base("mercado_coberto");
  assert.equal(S.executarObra(run, "mercado_coberto", "melhorar"), true);
  run.rodada = 10;
  assert.equal(S.bonusObras(run, "renda"), 1);
  S.danificar(run);
  assert.equal(S.nivelObra(run, "mercado_coberto"), 1);
  assert.equal(S.bonusObras(run, "renda"), 0);
  S.danificar(run);
  assert.equal(S.ativa(run, "mercado_coberto"), false);
  assert.ok(!J.engine.preverRenda(run).fontes.some((f) => f.nome === "Mercado coberto"));
  run.atributos.gold = 0;
  assert.equal(S.executarObra(run, "mercado_coberto", "reparar"), false);
  assert.equal(S.executarObra(run, "mercado_coberto", "mutirao"), true);
  const lida = recarregar(J, run);
  lida.rodada = 13;
  assert.equal(S.executarObra(lida, "mercado_coberto", "concluir"), true);
  assert.equal(S.ativa(lida, "mercado_coberto"), true);
  assert.equal(lida.vila.obras.mercado_coberto.nivel, 2);
  assert.equal(lida.atributos.gold, 0);
});

test("moinho antigo mantém escolha e benefícios sem conceder níveis ao carregar", () => {
  const { J, S, run } = base();
  run.sistemas.especializacao = "comunitario";
  delete run.vila;
  const lida = recarregar(J, run);
  S.vila(lida);
  assert.equal(lida.vila.obras.moinho.nivel, 1);
  assert.equal(lida.vila.obras.moinho.caminho, "comunitario");
  assert.equal(S.bonusObras(lida, "cura"), 0);
  lida.rodada = 13;
  assert.equal(S.executarObra(lida, "moinho", "melhorar"), true);
  lida.rodada = 19;
  assert.equal(S.executarObra(lida, "moinho", "melhorar", "comercial"), false);
  assert.equal(S.executarObra(lida, "moinho", "melhorar", "comunitario"), true);
  assert.equal(S.bonusObras(lida, "cura"), 2);
});

test("desconto da forja e proteção das obras respeitam níveis e interrupção", () => {
  const { J, S, run } = base("forja");
  const arma = J.eventoPorId("mercador").mercadorias.find((i) => i.id === "arma_melhor");
  const preco = J.engine.precoMercadoria(run, arma);
  S.executarObra(run, "forja", "melhorar");
  assert.equal(J.engine.precoMercadoria(run, arma), preco - 1);
  S.danificar(run);
  S.danificar(run);
  assert.equal(J.engine.precoMercadoria(run, arma), preco + 2);
  run.construcoes.push("muralha", "celeiro");
  S.vila(run);
  run.rodada = 13;
  S.executarObra(run, "muralha", "melhorar");
  S.executarObra(run, "celeiro", "melhorar");
  assert.equal(S.bonusObras(run, "defesa"), 2);
});

test("ponte exige caminho no último nível e a escolha fica definitiva", () => {
  const { J, S, run } = base("ponte");
  S.executarObra(run, "ponte", "melhorar");
  run.rodada = 13;
  assert.equal(S.executarObra(run, "ponte", "melhorar"), false);
  assert.equal(S.executarObra(run, "ponte", "melhorar", "guarda"), true);
  assert.equal(S.bonusObras(run, "defesa"), 2);
  const lida = recarregar(J, run);
  assert.equal(lida.vila.obras.ponte.caminho, "guarda");
  lida.vila.obras.ponte.dano = 2;
  assert.equal(S.bonusObras(lida, "defesa"), 0);
});

test("construções recusam ações durante combate, resultados e partidas encerradas", () => {
  const { S, run } = base();
  for (const fase of ["combate", "resultado"]) {
    run.fase = fase;
    assert.equal(S.executarObra(run, "moinho", "melhorar"), false);
  }
  run.fase = "escolha";
  run.status = "encerrada";
  assert.equal(S.executarObra(run, "moinho", "melhorar"), false);
  assert.equal(run.atributos.gold, 30);
});

test("save rejeita níveis, danos e projetos inválidos", () => {
  const { J, run } = base();
  const o = run.vila.obras.moinho;
  o.nivel = 4;
  assert.equal(J.save.runValida(run), false);
  o.nivel = 1;
  o.dano = -1;
  assert.equal(J.save.runValida(run), false);
  o.dano = 0;
  o.projeto = { tipo: "melhorar", inicio: run.rodada + 1 };
  assert.equal(J.save.runValida(run), false);
});

test("mapa mostra todas as obras e requisitos sem executar decisões", () => {
  const { J, S, run, app } = base();
  const antes = JSON.stringify(run);
  J.ui.jogo(run, { textoCompleto: true });
  assert.equal(JSON.stringify(run), antes);
  for (const [nome] of Object.values(S.obras)) assert.ok(app.innerHTML.includes(nome));
  assert.match(app.innerHTML, /data-obra-id="moinho"/);
  run.atributos.gold = 0;
  J.engine.registrarSorteio(run, J.eventoPorId("moinho_especializacao"));
  const snapshot = JSON.stringify(run);
  const html = J.sistemasUI.indisponiveis(J.eventoPorId(run.eventoId), run);
  assert.match(html, /Faltam 3 Gold/);
  assert.ok(!html.includes("data-opcao"));
  assert.equal(J.engine.escolher(run, "comercial"), false);
  assert.equal(JSON.stringify(run), snapshot);
});

test("explicação trata alternativas e preserva requisitos secretos", () => {
  const { J, run } = base();
  run.atributos.gold = 1;
  run.atributos.ataque = 2;
  assert.match(
    J.sistemasUI.requisitos(run, { qualquer: [{ goldMin: 5 }, { ataqueMin: 8 }] }),
    /Faltam 4 Gold ou Faltam 6 Ataque/,
  );
  const evento = {
    id: "consulta_teste",
    opcoes: [
      { id: "segredo", texto: "Segredo", requisitos: { flags: ["oculta"] } },
      { id: "pagar", texto: "Pagar", requisitos: { goldMin: 5 } },
      { id: "sair", texto: "Sair" },
    ],
  };
  const html = J.sistemasUI.indisponiveis(evento, run);
  assert.match(html, /Pagar/);
  assert.ok(!html.includes("Segredo") && !html.includes("oculta"));
});

test("origem do bônus usa a perda real limitada pelo mínimo do atributo", () => {
  const { J, run } = base();
  run.atributos.ataque = 0;
  run.efeitosTemporarios.push({
    atributo: "ataque",
    valor: -5,
    valorAplicado: -2,
    aplicado: true,
    inicioRodada: 1,
    fimRodada: 12,
  });
  assert.match(J.sistemas.fontes(run, "ataque"), /Permanente acumulado: 2/);
  assert.match(J.sistemas.fontes(run, "ataque"), /dia 12: -2/);
});

test("renda prevista inclui as melhorias e confere com a resolução da carta", () => {
  const { J, S, run } = base("mercado_coberto");
  S.executarObra(run, "mercado_coberto", "melhorar");
  run.rodada = 15;
  const evento = J.eventoPorId("colheita");
  J.engine.registrarSorteio(run, evento);
  const previsao = J.engine.preverRenda(run);
  assert.equal(previsao.rodada, 15);
  assert.equal(J.engine.escolher(run, "sistema_vila"), true);
  assert.equal(run.ultimoResultado.economia.renda, previsao.total);
  assert.match(run.ultimoResultado.texto, /melhorias das obras rendem 1 Gold/);
});

test("combate usa a proteção melhorada e uma retirada aplica um dano persistente", () => {
  const { J, S, run } = base("muralha");
  S.executarObra(run, "muralha", "melhorar");
  run.debugTracoInimigo = "nenhum";
  run.atributos.escudo = 0;
  const evento = J.eventoPorId("saqueadores");
  J.engine.registrarSorteio(run, evento);
  assert.equal(J.engine.escolher(run, "combater"), true);
  const perfil = J.engine.perfilCombate(run);
  assert.equal(J.engine.calcularDanoDerrota(run, perfil, 0, 30).reducaoPassiva, 3);
  assert.equal(J.engine.rolarCombate(run), true);
  run.combatePendente.dadosHerdeiro.fill(1);
  run.combatePendente.dadosInimigo.fill(20);
  assert.equal(J.engine.continuarCombate(run), true);
  assert.equal(run.vila.obras.muralha.dano, 1);
  assert.equal(recarregar(J, run).vila.obras.muralha.dano, 1);
  assert.match(run.ultimoResultado.texto, /danifica a construção: Muralha/);
});
