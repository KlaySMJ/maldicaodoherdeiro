"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preparar } = require("./helpers/jogo.cjs");

function criar(J, traco) {
  const legado = J.legado.vazio();
  legado.flags[traco] = true;
  return J.estado.novo(legado, traco);
}
function escolher(J, run, eventoId, opcaoId) {
  run.fase = "escolha";
  run.opcoesSorteadas = [];
  J.engine.registrarSorteio(run, J.eventoPorId(eventoId));
  return J.engine.escolher(run, opcaoId);
}
function efeito(J, run, eventoId, definirAleatorio) {
  const indice = J.efeitosNordicos.findIndex((e) => e.eventoId === eventoId);
  assert.ok(indice >= 0);
  definirAleatorio((indice + 0.1) / J.efeitosNordicos.length);
  run.rodada += 1;
  run.estacao = J.estacaoDaRodada(run.rodada);
  J.engine.iniciarPassivaNordica(run);
}

test("os três herdeiros têm os atributos acordados e permanecem bloqueados sem legado", () => {
  const { J, definirAleatorio } = preparar();
  definirAleatorio(0.05);
  const casos = [
    ["herdeiro_culto", 4, 4, 50, 5, 30],
    ["herdeira_leste", 2, 7, 60, 3, 0],
    ["herdeiro_nordico", 9, 1, 50, 5, 0],
  ];
  for (const [id, ataque, escudo, habitantes, gold, seguidores] of casos) {
    const run = criar(J, id);
    assert.equal(run.atributos.hp, 120);
    assert.equal(run.hpMax, 120);
    assert.equal(run.atributos.ataque, ataque);
    assert.equal(run.atributos.escudo, escudo);
    assert.equal(run.atributos.habitantes, habitantes);
    assert.equal(run.atributos.gold, gold);
    assert.equal(run.seguidoresCulto, seguidores);
    assert.equal(run.cultoAtivo, false);
    assert.equal(J.estado.tracosDisponiveis(J.legado.vazio()).includes(id), false);
    J.engine.registrarSorteio(run, J.eventoPorId("caixas_suspeitas"));
    assert.equal(J.save.runValida(run), true, id);
    J.save.gravarRun(run);
    assert.equal(J.save.lerRun()?.traco, id);
  }
});

test("vitória cultista libera o herdeiro e uma conquista antiga também o concede", () => {
  const { J, resultado } = preparar();
  const run = criar(J, "corajoso");
  run.cultoAtivo = true;
  run.seguidoresCulto = 20;
  run.marcos.cultoAdesao = 1;
  run.rodada = 300;
  resultado(run);
  J.engine.avancar(run);
  assert.equal(run.fim.tipo, "vitoria_culto");
  assert.equal(J.save.lerLegado().flags.herdeiro_culto, true);
  const antigo = J.legado.vazio();
  antigo.conquistasDesbloqueadas.push("culto_concluido");
  assert.equal(J.estado.tracosDisponiveis(antigo).includes("herdeiro_culto"), true);
});

test("desbloqueios exigem aceitar o efeito e ficam persistidos antes do fim da run", () => {
  const { J } = preparar();
  const run = criar(J, "corajoso");
  run.flags.ano_novo_ativo = true;
  assert.equal(escolher(J, run, "zodiaco_boi", "guardar"), true);
  assert.equal(J.save.lerLegado().flags.herdeira_leste, undefined);
  assert.equal(escolher(J, run, "zodiaco_tigre", "aceitar"), true);
  assert.equal(J.save.lerLegado().flags.herdeira_leste, true);
  assert.equal(escolher(J, run, "bencao_thor", "recusar"), true);
  assert.equal(J.save.lerLegado().flags.herdeiro_nordico, undefined);
  assert.equal(escolher(J, run, "maldicao_fenrir", "aceitar"), true);
  assert.equal(J.save.lerLegado().flags.herdeiro_nordico, true);
  assert.ok(J.save.lerLegado().conquistasDesbloqueadas.includes("chamado_nordico"));
});

test("o Culto reduz perdas inteiras uma única vez e compõe com o Celeiro", () => {
  const { J } = preparar();
  const run = criar(J, "herdeiro_culto");
  for (const [perda, esperada] of [
    [0, 0],
    [1, 1],
    [2, 1],
    [3, 1],
    [5, 2],
    [10, 5],
  ]) {
    run.atributos.habitantes = 50;
    J.engine.aplicarEfeitos(run, { habitantes: -perda });
    assert.equal(run.atributos.habitantes, 50 - esperada);
  }
  run.atributos.habitantes = 50;
  J.engine.aplicarEfeitos(run, { habitantes: -10 }, {}, { protecaoCeleiro: true });
  assert.equal(run.atributos.habitantes, 48);
  run.atributos.habitantes = 50;
  J.engine.aplicarEfeitos(run, {}, { habitantes: 0.5 });
  assert.equal(run.atributos.habitantes, 38);
  run.atributos.habitantes = 1;
  J.engine.aplicarEfeitos(run, { habitantes: -1 }, {}, { protecaoCeleiro: true });
  assert.equal(run.atributos.habitantes, 0);
  J.herdeiros.iniciarCulto(run);
  J.engine.aplicarEfeitos(run, { seguidores: -10 });
  assert.equal(run.seguidoresCulto, 70);
});

test("os dois caminhos de adesão preservam a reserva e a adaga ganha Escudo por 5 seguidores", () => {
  for (const convite of [false, true]) {
    const { J, resultado } = preparar();
    const run = criar(J, "herdeiro_culto");
    if (convite) {
      run.rodada = 8;
      assert.equal(escolher(J, run, "o_chamado_da_reserva", "aderir"), true);
    } else {
      run.atributos.habitantes = 0;
      run.atributos.honra = -40;
      resultado(run);
      run.aguardaDecisaoCulto = true;
      assert.equal(J.engine.juntarCulto(run), true);
    }
    assert.equal(run.seguidoresCulto, 80);
    run.seguidoresCulto = 4;
    assert.equal(J.engine.podeUsarItem(run, "adaga_cerimonial", "culto"), false);
    run.seguidoresCulto = 6;
    const antes = { ...run.atributos };
    assert.equal(J.engine.usarItem(run, "adaga_cerimonial", "culto"), true);
    assert.equal(run.seguidoresCulto, 1);
    assert.equal(run.atributos.ataque, antes.ataque + 10);
    assert.equal(run.atributos.escudo, antes.escudo + 5);
    assert.equal(J.engine.usarItem(run, "adaga_cerimonial", "culto"), false);
    assert.ok(run.conquistas.conquistasDesbloqueadas.includes("culto_adaga_herdeiro"));
    assert.equal(J.save.runValida(run), true);
  }
});

test("usar a adaga com os últimos 5 seguidores encerra a run", () => {
  const { J } = preparar();
  const run = criar(J, "herdeiro_culto");
  run.rodada = 8;
  escolher(J, run, "o_chamado_da_reserva", "aderir");
  run.seguidoresCulto = 5;
  assert.equal(J.engine.usarItem(run, "adaga_cerimonial", "culto"), true);
  assert.equal(run.status, "encerrada");
});

test("cartas do culto elegíveis têm peso dobrado, inclusive as de tipo especial", () => {
  const { J } = preparar();
  const normal = criar(J, "corajoso");
  const culto = criar(J, "herdeiro_culto");
  for (const id of ["primeira_chama", "o_chamado_da_reserva"]) {
    assert.equal(J.engine.peso(J.eventoPorId(id), culto), J.engine.peso(J.eventoPorId(id), normal) * 2);
  }
  assert.equal(J.engine.cumpre(J.eventoPorId("primeira_chama").requisitos, culto), false);
});

test("calendário do Leste respeita os pares sazonais e seis animais distintos", () => {
  const { J, definirAleatorio } = preparar();
  for (const aleatorio of [0, 0.49, 0.51, 0.99]) {
    definirAleatorio(aleatorio);
    const run = criar(J, "herdeira_leste");
    for (const dia of [101, 201]) {
      run.rodada = dia;
      J.herdeiros.calendario(run);
    }
    assert.equal(run.calendarioLeste.length, 6);
    assert.equal(new Set(run.calendarioLeste.map((v) => v.eventoId)).size, 6);
    for (const ano of [1, 2, 3]) {
      const [a, b] = run.calendarioLeste
        .filter((v) => v.ano === ano)
        .map((v) => Math.floor(((v.rodada - 1) % 100) / 25) + 1);
      assert.ok((a === 1 && [3, 4].includes(b)) || (a === 2 && b === 4));
    }
  }
});

test("encontro extra preserva a carta e as opções; save não repete renda nem cura", () => {
  const { J, definirAleatorio } = preparar();
  definirAleatorio(0);
  let run = criar(J, "herdeira_leste");
  const visita = run.calendarioLeste[0];
  run.rodada = visita.rodada;
  run.estacao = J.estacaoDaRodada(run.rodada);
  run.atributos.gold = 10;
  run.atributos.hp = 80;
  run.construcoes.push("moinho", "mercado_coberto", "praca_forca");
  J.engine.registrarSorteio(run, J.eventoPorId("caixas_suspeitas"));
  assert.equal(run.eventoId, visita.eventoId);
  const opcoes = JSON.stringify(run.encontroLeste.opcoesSorteadas);
  assert.equal(J.save.runValida(run), true);
  J.save.gravarRun(run);
  run = J.save.lerRun();
  assert.ok(run);
  assert.equal(J.engine.escolher(run, J.eventoPorId(run.eventoId).opcoes[0].id), true);
  assert.equal(run.atributos.gold, 10);
  assert.equal(run.atributos.hp, 80);
  J.save.gravarRun(run);
  run = J.save.lerRun();
  assert.ok(run);
  assert.equal(J.engine.escolher(run, "guardar"), false);
  assert.equal(J.engine.avancar(run), true);
  assert.equal(run.rodada, visita.rodada);
  assert.equal(run.eventoId, "caixas_suspeitas");
  assert.equal(JSON.stringify(run.opcoesSorteadas), opcoes);
  assert.equal(run.encontroLeste, null);
  assert.equal(run.fase, "escolha");
  assert.equal(run.atributos.hp, 80);
});

test("o último dia resolve a visita adiada antes de encerrar a crônica", () => {
  const { J, resultado } = preparar();
  const run = criar(J, "herdeira_leste");
  run.rodada = 300;
  run.estacao = "inverno";
  run.calendarioLeste.forEach((v) => (v.resolvida = true));
  J.herdeiros.calendario(run);
  run.calendarioLeste
    .filter((v) => v.ano === 3)
    .forEach((v) => {
      v.rodada = 300;
    });
  run.eventoId = "caixas_suspeitas";
  resultado(run);
  assert.equal(J.engine.avancar(run), true);
  assert.equal(run.rodada, 300);
  assert.equal(run.status, "ativa");
  assert.equal(J.engine.escolher(run, "guardar"), true);
  assert.equal(J.engine.avancar(run), true);
  if (run.status === "ativa") {
    J.engine.escolher(run, J.eventoPorId(run.eventoId).opcoes[0].id);
    J.engine.avancar(run);
  }
  assert.equal(run.status, "encerrada");
  assert.ok(run.fim.tipo.startsWith("vitoria"));
  assert.equal(run.rodada, 300);
});

test("catálogo nórdico tem 10 bênçãos e 10 maldições e mantém Höðr único", () => {
  const { J } = preparar();
  assert.equal(J.efeitosNordicos.filter((e) => e.tipo === "bencao").length, 10);
  assert.equal(J.efeitosNordicos.filter((e) => e.tipo === "maldicao").length, 10);
  assert.equal(J.eventos.filter((e) => e.id === "maldicao_hodr").length, 1);
  assert.ok(J.eventoPorId("maldicao_nidhogg"));
});

test("Nórdico sorteia uma vez por dia e salva a passiva sem repetir recursos", () => {
  const { J, definirAleatorio } = preparar();
  let run = criar(J, "herdeiro_nordico");
  efeito(J, run, "bencao_njord", definirAleatorio);
  const gold = run.atributos.gold;
  J.engine.iniciarPassivaNordica(run);
  assert.equal(run.atributos.gold, gold);
  J.engine.registrarSorteio(run, J.eventoPorId("caixas_suspeitas"));
  J.save.gravarRun(run);
  run = J.save.lerRun();
  assert.ok(run);
  J.engine.iniciarPassivaNordica(run);
  assert.equal(run.atributos.gold, gold);
  assert.equal(run.passivaNordica.eventoId, "bencao_njord");
  assert.equal(run.flags.efeito_nordico_recebido, undefined);
});

test("modificadores diários não acumulam atributos nem criam Escudo ao terminar no zero", () => {
  const { J, definirAleatorio } = preparar();
  const run = criar(J, "herdeiro_nordico");
  for (let i = 0; i < 20; i++) {
    efeito(J, run, "bencao_thor", definirAleatorio);
    assert.equal(run.atributos.ataque, 12);
    efeito(J, run, "maldicao_skadi", definirAleatorio);
    assert.equal(run.atributos.ataque, 9);
    assert.equal(run.atributos.escudo, 0);
    efeito(J, run, "bencao_odin", definirAleatorio);
    assert.equal(run.atributos.escudo, 1);
  }
});

test("Fenrir reduz cura uma única vez e Hrym cobra uma vez mesmo coexistindo com cartas", () => {
  const { J, definirAleatorio } = preparar();
  const run = criar(J, "herdeiro_nordico");
  efeito(J, run, "maldicao_fenrir", definirAleatorio);
  assert.equal(escolher(J, run, "maldicao_fenrir", "aceitar"), true);
  run.atributos.hp = 40;
  J.engine.aplicarEfeitos(run, { hp: 9 });
  assert.equal(run.atributos.hp, 44);
  J.engine.aplicarEfeitos(run, { hp: 1 });
  assert.equal(run.atributos.hp, 44);
  run.atributos.gold = 10;
  efeito(J, run, "maldicao_hrym", definirAleatorio);
  assert.equal(run.atributos.gold, 9);
  J.engine.iniciarPassivaNordica(run);
  assert.equal(run.atributos.gold, 9);
  assert.equal(run.efeitoDivino.nome, "Fenrir");
  assert.equal(run.passivaNordica.nome, "Hrym");
});

test("debug é um botão único e não altera run, conquistas ou objetivos", () => {
  const { J, app, window, novaRun } = preparar();
  const run = novaRun();
  J.save.gravarRun(run);
  const antes = JSON.stringify(J.save.lerRun());
  J.ui.menu(run);
  assert.equal((app.innerHTML.match(/data-acao="debug-liberar-personagens"/g) || []).length, 1);
  assert.doesNotMatch(app.innerHTML, /debug-alternar-(druida|heroi|conselheiro)|debug-iniciar-menino/);
  assert.equal(J.save.liberarPersonagens(), true);
  assert.equal(J.save.liberarPersonagens(), true);
  assert.equal(JSON.stringify(J.save.lerRun()), antes);
  const legado = J.save.lerLegado();
  assert.equal(J.estado.tracosDisponiveis(legado).length, 9);
  assert.equal(legado.conquistasDesbloqueadas.length, 0);
  assert.equal(legado.objetivosConcluidos.length, 0);
  window.localStorage.setItem = () => {
    throw new Error("indisponível");
  };
  assert.equal(J.save.liberarPersonagens(), false);
});

test("saves antigos migram sem alterar o herdeiro e saves novos rejeitam estado inválido", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  delete run.calendarioLeste;
  delete run.encontroLeste;
  delete run.passivaNordica;
  J.save.gravarRun(run);
  assert.equal(J.save.lerRun()?.traco, run.traco);
  const novo = criar(J, "herdeiro_nordico");
  J.engine.registrarSorteio(novo, J.eventoPorId("caixas_suspeitas"));
  novo.passivaNordica.inicio = -1;
  assert.equal(J.save.runValida(novo), false);
});

test("o Leste completa 300 dias com seis encontros extras e pode carregar em cada escolha", () => {
  for (const sorteio of [0, 0.51, 0.99]) {
    const { J, definirAleatorio } = preparar();
    definirAleatorio(sorteio);
    let run = criar(J, "herdeira_leste");
    J.registrarEventos({
      id: "dia_tranquilo_teste",
      titulo: "Um dia tranquilo",
      texto: "A vila descansa.",
      tipo: "encontro",
      peso: 0,
      opcoes: [{ id: "esperar", texto: "Esperar.", efeitos: {} }],
    });
    let escolhas = 0;
    while (run.status === "ativa" && escolhas < 310) {
      while (J.pressagios.bloqueia(run)) {
        const resposta = J.pressagios.confirmar(run);
        if (resposta.retomar) J.engine.avancar(run);
      }
      if (run.status !== "ativa") break;
      if (!run.encontroLeste) J.engine.registrarSorteio(run, J.eventoPorId("dia_tranquilo_teste"));
      J.save.gravarRun(run);
      run = J.save.lerRun();
      assert.ok(run, `save na escolha ${escolhas}`);
      const id = run.encontroLeste ? J.eventoPorId(run.eventoId).opcoes[0].id : "esperar";
      assert.equal(J.engine.escolher(run, id), true);
      escolhas++;
      J.save.gravarRun(run);
      run = J.save.lerRun();
      assert.ok(run, `save no resultado ${escolhas}`);
      J.engine.avancar(run);
    }
    assert.equal(run.status, "encerrada");
    assert.equal(run.rodada, 300);
    assert.equal(escolhas, 306);
    assert.equal(run.calendarioLeste.filter((v) => v.resolvida).length, 6);
    assert.ok(run.conquistas.conquistasDesbloqueadas.includes("leste_duas_estacoes"));
  }
});

test("debug no controlador salva todos os desbloqueios e preserva a run atual", async () => {
  const { J, app, window, iniciar, clicar, novaRun } = preparar();
  const run = novaRun();
  J.save.gravarRun(run);
  const antes = JSON.stringify(run);
  window.localStorage.setItem("debug_forcar_menino", "1");
  iniciar();
  assert.equal(window.localStorage.getItem("debug_forcar_menino"), null);
  await clicar({ acao: "debug-liberar-personagens" });
  assert.equal(J.save.lerLegado().flags.herdeiro_culto, undefined);
  J.ui.alternarDebug();
  await clicar({ acao: "debug-liberar-personagens" });
  assert.equal(J.estado.tracosDisponiveis(J.save.lerLegado()).length, 9);
  assert.equal(JSON.stringify(J.save.lerRun()), antes);
  assert.equal((app.innerHTML.match(/data-acao="debug-liberar-personagens"/g) || []).length, 1);
});

test("retomar um baú ou mercador após o zodíaco preserva os itens sorteados", () => {
  for (const eventoId of ["bau_estrada", "mercador"]) {
    const { J, definirAleatorio } = preparar();
    definirAleatorio(0);
    let run = criar(J, "herdeira_leste");
    run.rodada = Math.max(50, run.calendarioLeste[0].rodada);
    run.estacao = J.estacaoDaRodada(run.rodada);
    J.engine.registrarSorteio(run, J.eventoPorId(eventoId));
    const bau = JSON.stringify(run.encontroLeste.recompensasBau);
    const mercadoria = run.encontroLeste.ofertaMercador;
    J.save.gravarRun(run);
    run = J.save.lerRun();
    assert.ok(run);
    J.engine.escolher(run, "guardar");
    J.engine.avancar(run);
    assert.equal(run.eventoId, eventoId);
    assert.equal(JSON.stringify(run.recompensasBau), bau);
    assert.equal(run.ofertaMercador, mercadoria);
    assert.ok(J.engine.opcoes(J.eventoPorId(eventoId), run).length);
    assert.equal(J.save.runValida(run), true);
  }
});

test("os novos herdeiros exibem retratos próprios na seleção e nos quadros de honra e culto", () => {
  const { J, app, window } = preparar();
  window.JOGO_VERSAO_ASSETS = "quadros-teste";
  const arquivos = {
    herdeiro_culto: "herdeiro-culto",
    herdeira_leste: "herdeira-leste",
    herdeiro_nordico: "herdeiro-nordico",
  };
  const faixas = [
    [0, "neutra"],
    [30, "alta"],
    [60, "alta-2"],
    [90, "altissima"],
    [-30, "baixa"],
    [-60, "baixa-2"],
    [-90, "baixissima"],
  ];
  J.ui.escolherHerdeiro(J.legado.vazio());
  const selecao = app.innerHTML;
  const imagemAtual = () => app.innerHTML.match(/<img class="retrato retrato-atual[^"]*" src="([^"]+)"/)?.[1];
  for (const [id, arquivo] of Object.entries(arquivos)) {
    const botao = selecao.match(new RegExp(`<button[^>]*data-traco="${id}"[\\s\\S]*?<\\/button>`))?.[0];
    assert.ok(botao?.includes(`assets/herdeiros/${arquivo}-neutra.webp?v=quadros-teste`));
    const run = criar(J, id);
    J.engine.registrarSorteio(run, J.eventoPorId("caixas_suspeitas"));
    for (const [honra, faixa] of faixas) {
      run.atributos.honra = honra;
      J.ui.jogo(run);
      const disponivel = id === "herdeiro_culto" && honra > 0 ? "neutra" : faixa;
      const imagem = `assets/herdeiros/${arquivo}-${disponivel}.webp`;
      assert.equal(imagemAtual(), `${imagem}?v=quadros-teste`);
      assert.ok(fs.existsSync(path.join(__dirname, "..", imagem)), imagem);
      assert.match(app.innerHTML, /class="carta carta-herdeiro /);
      assert.doesNotMatch(app.innerHTML, /Selo provisório/);
    }
    assert.ok(app.innerHTML.includes(J.herdeiros.novos[id].nome));
    if (id === "herdeiro_culto") assert.match(app.innerHTML, /Seguidores em reserva/);
    if (id === "herdeiro_nordico") assert.match(app.innerHTML, /Passiva do dia/);
    run.cultoAtivo = true;
    J.ui.jogo(run);
    const imagemCulto = `assets/herdeiros/${arquivo}-culto.webp`;
    assert.equal(imagemAtual(), `${imagemCulto}?v=quadros-teste`);
    assert.ok(fs.existsSync(path.join(__dirname, "..", imagemCulto)), imagemCulto);
    assert.match(app.innerHTML, /retrato-area culto-ativo/);
  }
});

test("uma transição ao culto durante a visita extra permite salvar e retomar a carta normal", () => {
  const { J, definirAleatorio } = preparar();
  definirAleatorio(0);
  let run = criar(J, "herdeira_leste");
  J.engine.registrarSorteio(run, J.eventoPorId("caixas_suspeitas"));
  J.engine.escolher(run, "guardar");
  run.atributos.habitantes = 0;
  run.atributos.honra = -40;
  run.aguardaDecisaoCulto = true;
  assert.equal(J.engine.juntarCulto(run), true);
  assert.equal(J.save.runValida(run), true);
  J.save.gravarRun(run);
  run = J.save.lerRun();
  assert.ok(run);
  assert.equal(J.engine.avancar(run), true);
  assert.equal(run.eventoId, "caixas_suspeitas");
  assert.equal(run.rodada, 1);
  assert.equal(run.cultoAtivo, true);
});
