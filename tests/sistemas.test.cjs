"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");
const copia = (v) => JSON.parse(JSON.stringify(v));

function salvar(J, run) {
  assert.equal(J.save.runValida(run), true);
  assert.equal(J.save.gravarRun(run), true);
  const lida = J.save.lerRun();
  assert.ok(lida);
  return lida;
}
test("continuações aguardam seis dias e ganham prioridade em doze, com fila persistida", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.flags.bardo_cantou = true;
  run.flags.prisioneiro_solto = true;
  run.rodada = 10;
  J.sistemas.atualizar(run);
  const candidatos = [
    J.eventoPorId("cancao_que_corre"),
    J.eventoPorId("prisioneiro_volta"),
    J.eventoPorId("colheita"),
  ];
  assert.deepEqual(
    Array.from(J.sistemas.filtrar(run, candidatos), (e) => e.id),
    ["colheita"],
  );
  run.rodada = 16;
  assert.equal(J.sistemas.filtrar(run, candidatos).length, 3);
  const lida = salvar(J, run);
  lida.rodada = 22;
  assert.deepEqual(
    Array.from(J.sistemas.filtrar(lida, candidatos), (e) => e.id),
    ["cancao_que_corre"],
  );
  J.engine.registrarSorteio(lida, candidatos[0]);
  assert.equal(J.engine.escolher(lida, "aprender"), true);
  lida.rodada++;
  assert.deepEqual(
    Array.from(J.sistemas.filtrar(lida, candidatos), (e) => e.id),
    ["colheita"],
  );
  lida.rodada++;
  assert.deepEqual(
    Array.from(J.sistemas.filtrar(lida, candidatos), (e) => e.id),
    ["prisioneiro_volta"],
  );
});
test("urgências e eventos programados adiam a fila sem duplicar ou perder a continuação", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.flags.bardo_cantou = true;
  run.rodada = 10;
  J.sistemas.atualizar(run);
  run.rodada = 23;
  const marcada = { id: "programada", forcarSorteioQuandoElegivel: true };
  assert.equal(J.sistemas.filtrar(run, [J.eventoPorId("cancao_que_corre"), marcada]).length, 2);
  run.atributos.hp = 1;
  assert.equal(J.engine.sortear(run).id, "cura_critica");
  assert.equal(run.sistemas.esperas.cancao_que_corre, 10);
  run.flags.bardo_cantou = false;
  J.sistemas.atualizar(run);
  assert.equal(run.sistemas.esperas.cancao_que_corre, undefined);
  run.flags.bardo_cantou = true;
  J.sistemas.atualizar(run);
  assert.equal(run.sistemas.esperas.cancao_que_corre, 23);
});
test("oito cartas conservam saída de crise e até quatro respostas nas fronteiras de população", () => {
  const { J, novaRun } = preparar();
  for (const [id, lote] of Object.entries(J.sistemas.lotes)) {
    for (const habitantes of [1, 25, 26, 59, 60, 61]) {
      const run = novaRun();
      Object.assign(run.atributos, { habitantes, gold: habitantes % 2 ? 0 : 2 });
      run.estacao = lote.estacao;
      const e = J.eventoPorId(id);
      assert.ok(e, id);
      J.engine.registrarSorteio(run, e);
      const opcoes = J.engine.opcoes(e, run);
      assert.ok(opcoes.length > 0 && opcoes.length <= 4, id);
      const especial = opcoes.find((o) => o.id === "sistema_vila");
      assert.ok(especial, id);
      assert.ok(J.engine.cumpre(especial.requisitos, run));
      assert.equal(J.engine.escolher(run, especial.id), true);
      assert.equal(J.save.runValida(run), true, id);
    }
  }
});
test("variante de vila permanece igual ao carregar e após usar item com a carta aberta", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.atributos.habitantes = 25;
  run.estacao = "outono";
  const evento = J.eventoPorId("colheita");
  J.engine.registrarSorteio(run, evento);
  const antes = copia(J.engine.opcoes(evento, run));
  const lida = salvar(J, run);
  lida.atributos.habitantes = 26;
  // A variante não troca de identidade; seus requisitos atuais ainda são conferidos.
  assert.equal(
    J.engine.opcoes(evento, lida).some((o) => o.id === "sistema_vila"),
    false,
  );
  lida.atributos.habitantes = 25;
  assert.deepEqual(copia(J.engine.opcoes(evento, lida)), antes);
});
test("moinho conserva sua cura e a especialização só concede renda nos dias normais", () => {
  const { J, novaRun, resultado } = preparar();
  const run = novaRun();
  run.construcoes.push("moinho");
  run.atributos.gold = 20;
  J.engine.registrarSorteio(run, J.eventoPorId("moinho_especializacao"));
  assert.equal(J.engine.escolher(run, "comercial"), true);
  const lida = salvar(J, run);
  assert.equal(lida.sistemas.especializacao, "comercial");
  lida.rodada = 5;
  assert.equal(J.sistemas.renda(lida), 1);
  lida.rodada = 6;
  assert.equal(J.sistemas.renda(lida), 0);
  assert.ok(lida.sistemas.concluidas.includes("moinho_especializacao"));
  lida.atributos.hp = 50;
  resultado(lida);
  J.engine.avancar(lida);
  assert.equal(lida.atributos.hp, 51);
});
test("saves antigos aguardam uma janela nova para vínculos e especialização", () => {
  const { J, novaRun, window } = preparar();
  const run = novaRun();
  run.rodada = 70;
  J.engine.concederItem(run, "cao_companheiro");
  run.construcoes.push("moinho");
  delete run.sistemas;
  window.localStorage.setItem("run_atual", JSON.stringify(run));
  const lida = J.save.lerRun();
  assert.ok(lida);
  J.sistemas.atualizar(lida);
  assert.equal(lida.sistemas.esperas.vinculo_cao_companheiro, 70);
  assert.equal(lida.sistemas.esperas.moinho_especializacao, 70);
  lida.sistemas.esperas.capela = 71;
  assert.equal(J.save.runValida(lida), false);
});
test("os vínculos preservam as passivas; recusar não repete o encontro", () => {
  const { J, novaRun } = preparar();
  for (const id of J.sistemas.animais) {
    const run = novaRun();
    J.engine.concederItem(run, id);
    const e = J.eventoPorId(`vinculo_${id}`);
    J.engine.registrarSorteio(run, e);
    assert.equal(J.engine.escolher(run, "recusar"), true);
    assert.equal(run.sistemas.vinculos[id], "recusado");
    assert.ok(run.itensConquistados.includes(id));
    const lida = salvar(J, run);
    assert.equal(J.sistemas.filtrar(lida, [e]).length, 0);
  }
});
test("intervenção do cão reduz oito de dano uma vez e não altera uma previsão", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  J.engine.concederItem(run, "cao_companheiro");
  run.sistemas.vinculos.cao_companheiro = "ativo";
  assert.equal(J.sistemas.proteger(run, 11), 11);
  assert.equal(J.sistemas.proteger(run, 12), 4);
  assert.equal(run.sistemas.vinculos.cao_companheiro, "ativo");
  assert.equal(J.sistemas.proteger(run, 20, true), 12);
  assert.equal(J.sistemas.proteger(salvar(J, run), 20, true), 20);
});
test("corvo abre um achado único e o gato só acrescenta cura abaixo da metade", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  J.engine.concederItem(run, "corvo_companheiro");
  J.engine.concederItem(run, "gato_companheiro");
  run.sistemas.vinculos.corvo_companheiro = "ativo";
  run.sistemas.vinculos.gato_companheiro = "ativo";
  const e = J.eventoPorId("livro_das_racoes");
  J.engine.registrarSorteio(run, e);
  assert.equal(J.engine.escolher(run, "busca_corvo"), true);
  assert.equal(run.sistemas.vinculos.corvo_companheiro, "usado");
  run.atributos.hp = 30;
  J.sistemas.rodada(run);
  assert.equal(run.atributos.hp, 31);
  run.atributos.hp = run.hpMax / 2;
  J.sistemas.rodada(run);
  assert.equal(run.atributos.hp, run.hpMax / 2);
});
test("troféus de finais abrem obtenção só numa crônica posterior e recusar não concede arma", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  const evento = J.eventoPorId("embate_barao");
  assert.ok(evento);
  J.legado.conceder(run, { flags: ["barao_derrotado"] });
  assert.equal(J.engine.cumpre(J.eventoPorId("heranca_barao").requisitos, run), false);
  const legado = J.legado.mesclar(run.legadoDaRun, run.conquistas);
  const seguinte = J.estado.novo(legado, "corajoso");
  assert.equal(J.engine.cumpre(J.eventoPorId("heranca_barao").requisitos, seguinte), true);
  assert.equal(seguinte.itensConquistados.includes("estandarte_do_barao"), false);
  J.engine.registrarSorteio(seguinte, J.eventoPorId("heranca_barao"));
  J.engine.escolher(seguinte, "aceitar");
  assert.ok(seguinte.inventario.includes("estandarte_do_barao"));
  assert.equal(J.engine.concederItem(seguinte, "estandarte_do_barao"), false);
});
test("lendários têm uso restrito e a lâmina cobra sua ferida apenas ao receber", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  J.engine.concederItem(run, "relicario_do_silencio");
  J.engine.registrarSorteio(run, J.eventoPorId("calice_no_pantano"));
  assert.equal(J.engine.escolher(run, "usar_relicario"), true);
  assert.ok(!run.inventario.includes("relicario_do_silencio"));
  assert.ok(!run.itensConquistados.includes("calice_sagrado"));
  const hp = run.atributos.hp,
    ataque = run.atributos.ataque;
  J.engine.concederItem(run, "lamina_da_lagoa");
  assert.equal(run.atributos.hp, hp - 10);
  assert.equal(run.atributos.ataque, ataque + 6);
  assert.equal(J.engine.concederItem(run, "lamina_da_lagoa"), false);
  assert.equal(salvar(J, run).atributos.hp, hp - 10);
});
test("oferta contextual favorece cura sem garantia e permanece igual ao carregar", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.atributos.hp = 10;
  const itens = J.itens.filter((i) => i.mercador),
    cura = J.itens.find((i) => i.id === "pocao_cura_grande");
  assert.equal(J.sistemas.pesoMercador(run, cura), 3);
  assert.equal(J.sistemas.mercador(run, itens, () => 0).id, "amuleto_ultima_guarda");
  assert.equal(J.sistemas.mercador(run, itens, () => 0.6).id, "pocao_cura_grande");
  J.engine.registrarSorteio(run, J.eventoPorId("mercador"));
  const oferta = run.ofertaMercador;
  assert.equal(salvar(J, run).ofertaMercador, oferta);
});
test("fontes conferem com atributos e calculam a postura sem contar equipamento duas vezes", () => {
  const { J, novaRun, app } = preparar();
  const run = novaRun();
  J.engine.concederItem(run, "faca_de_caca");
  const ataque = run.atributos.ataque;
  assert.match(J.sistemas.fontes(run, "ataque"), new RegExp(`ataque: ${ataque}\\.`));
  run.efeitosTemporarios.push({
    atributo: "ataque",
    valor: 2,
    inicioRodada: 1,
    fimRodada: 3,
    aplicado: true,
  });
  run.atributos.ataque += 2;
  assert.match(J.sistemas.fontes(run, "ataque"), new RegExp(`Permanente acumulado: ${ataque}`));
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /data-acao="detalhes-atributo"/);
});
test("calendário do Druida e encontros extras não criam transição nem renda duplicada", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "druida_herdeiro");
  J.engine.registrarSorteio(run, J.eventoPorId("mercador"));
  const antes = run.sistemas.estacaoVista;
  run.rodada = 26;
  run.estacao = J.estacaoDaRodada(26, run);
  J.sistemas.rodada(run);
  assert.equal(Boolean(run.sistemas.transicao), antes !== run.sistemas.estacaoVista);
  const copiada = salvar(J, run);
  assert.equal(copiada.sistemas.transicao, run.sistemas.transicao);
});
test("ajuda e preferências não alteram a resolução e a regra de empate acompanha a modalidade", () => {
  const { J, novaRun, app, window } = preparar();
  const run = novaRun();
  run.debugTracoInimigo = "nenhum";
  const e = J.eventoPorId("saqueadores");
  J.engine.registrarSorteio(run, e);
  J.engine.escolher(run, e.opcoes.find((o) => o.combate).id);
  const antes = JSON.stringify(run);
  assert.equal(J.ui.tutorialCombate(run), true);
  assert.equal(JSON.stringify(run), antes);
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /aria-label="Ajuda de combate"/);
  assert.match(app.innerHTML, /herdeiro vence o empate/);
  J.ui.alternarVelocidadeTexto();
  assert.equal(window.localStorage.getItem("velocidade_texto"), "rapido");
  J.ui.alternarVelocidadeTexto();
  assert.equal(J.ui.preferenciaTexto(), "imediato");
  run.combatePendente.tracoInimigo = "veloz";
  assert.match(J.sistemasUI.regraEmpate(run), /Veloz vence/);
});
