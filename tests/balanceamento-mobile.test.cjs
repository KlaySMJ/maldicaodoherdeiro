"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preparar } = require("./helpers/jogo.cjs");

const tracos = ["corajoso", "avarento", "doente", "druida_herdeiro", "menino_cronista", "heroi_do_povo"];

test("a Vida inicial aplica os aumentos definidos aos seis herdeiros", () => {
  const { J } = preparar();
  const esperada = {
    corajoso: 120,
    avarento: 120,
    doente: 90,
    druida_herdeiro: 120,
    menino_cronista: 90,
    heroi_do_povo: 120,
  };

  for (const traco of tracos) {
    const run = J.estado.novo(J.legado.vazio(), traco);
    assert.equal(run.atributos.hp, esperada[traco], traco);
    assert.equal(run.hpMax, esperada[traco], traco);
  }
});

test("cura crítica aparece primeiro e restaura Vida sem custo", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.atributos.hp = 36;
  run.atributos.gold = 5;
  run.consequenciasAgendadas.push({ id: "teste", eventoId: "retorno_do_menino", rodada: 1 });

  const evento = J.engine.sortear(run);
  assert.equal(evento.id, "cura_critica");
  J.engine.registrarSorteio(run, evento);
  assert.equal(J.engine.escolher(run, "repousar"), true);
  assert.equal(run.atributos.hp, 54);
  assert.equal(run.atributos.gold, 5);
});

test("cura crítica espera 25 rodadas mesmo com Vida baixa ou recuperação intermediária", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.rodada = 10;
  run.atributos.hp = 1;
  const evento = J.engine.sortear(run);
  J.engine.registrarSorteio(run, evento);
  J.engine.escolher(run, "repousar");
  assert.equal(run.atributos.hp, 19);
  assert.equal(run.marcos.curaCriticaUltimaRodada, 10);
  for (const rodada of [11, 20, 34]) {
    run.rodada = rodada;
    run.atributos.hp = 1;
    assert.notEqual(J.engine.sortear(run)?.id, "cura_critica");
    assert.equal(J.engine.eventoDisponivel(evento, run), false);
  }
  run.atributos.hp = run.hpMax;
  J.engine.sortear(run);
  run.atributos.hp = 1;
  J.save.gravarRun(run);
  const salva = J.save.lerRun();
  assert.ok(salva);
  assert.equal(salva.marcos.curaCriticaUltimaRodada, 10);
  assert.notEqual(J.engine.sortear(salva)?.id, "cura_critica");
  salva.rodada = 35;
  assert.equal(J.engine.sortear(salva).id, "cura_critica");
  J.engine.registrarSorteio(salva, evento);
  assert.equal(salva.marcos.curaCriticaUltimaRodada, 35);
});

test("cura crítica tem teto de 20 e migra a espera em saves anteriores", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.hpMax = 300;
  run.atributos.hp = 1;
  run.rodada = 40;
  J.engine.registrarSorteio(run, J.eventoPorId("cura_critica"));
  J.engine.escolher(run, "repousar");
  assert.equal(run.atributos.hp, 21);
  delete run.marcos.curaCriticaUltimaRodada;
  J.save.gravarRun(run);
  const salva = J.save.lerRun();
  assert.ok(salva);
  assert.equal(salva.marcos.curaCriticaUltimaRodada, 40);
  assert.notEqual(J.engine.sortear(salva)?.id, "cura_critica");
});

test("a colheita espera duas mudanças de estação e mantém o marco no save", () => {
  const { J } = preparar();
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.rodada = 20;
  run.estacao = "primavera";
  J.engine.registrarSorteio(run, J.eventoPorId("colheita"));
  J.save.gravarRun(run);

  const carregada = J.save.lerRun();
  assert.equal(carregada.marcos.colheitaUltimaRodada, 20);
  carregada.eventosRecentes = [];
  carregada.rodada = 45;
  assert.equal(J.engine.eventoDisponivel(J.eventoPorId("colheita"), carregada), false);
  carregada.rodada = 70;
  assert.equal(J.engine.eventoDisponivel(J.eventoPorId("colheita"), carregada), true);
});

test("as oito cartas anuais ocupam as janelas definidas e não se repetem", () => {
  const { J } = preparar();
  const janelas = [
    ["disputa_das_mudas", 2, "primavera"],
    ["cisterna_rachada", 2, "verao"],
    ["celeiro_comunitario", 2, "outono"],
    ["ponte_sob_gelo", 2, "inverno"],
    ["cercas_antigas", 3, "primavera"],
    ["estrada_dos_retirantes", 3, "verao"],
    ["divida_do_moinho", 3, "outono"],
    ["ultima_vigilia", 3, "inverno"],
  ];

  for (const [id, ano, estacao] of janelas) {
    const evento = J.eventoPorId(id);
    assert.ok(evento, id);
    assert.equal(evento.oncePerRun, true, id);
    assert.equal(evento.forcarSorteioQuandoElegivel, true, id);
    const run = J.estado.novo(J.legado.vazio(), "corajoso");
    run.rodada = (ano - 1) * 100 + J.estacoes.indexOf(estacao) * 25 + 1;
    run.estacao = estacao;
    assert.equal(J.engine.cumpre(evento.requisitos, run), true, id);
    run.rodada += 100;
    assert.equal(J.engine.cumpre(evento.requisitos, run), false, id);
  }

  const anual = J.eventoPorId("disputa_das_mudas");
  const run = J.estado.novo(J.legado.vazio(), "corajoso");
  run.rodada = 101;
  run.estacao = "primavera";
  assert.equal(J.engine.sortear(run).id, anual.id);
  J.engine.registrarSorteio(run, anual);
  assert.equal(J.engine.escolher(run, "dividir_mudas"), true);
  assert.equal(J.engine.eventoDisponivel(anual, run), false);

  for (const id of ["festival_primavera", "festival_verao", "festival_outono", "festival_inverno"])
    assert.equal(J.eventoPorId(id).oncePerRun, true, id);
});

test("combates no fim da run mantêm um teto de dano e não derrubam um herdeiro com Vida cheia", () => {
  const { J } = preparar();
  const combates = J.eventos.filter((evento) => evento.batalha);
  const restantes = new Map(tracos.map((traco) => [traco, Infinity]));
  assert.equal(combates.length, 30);

  for (const evento of combates) {
    for (const traco of tracos) {
      const run = J.estado.novo(J.legado.vazio(), traco);
      run.rodada = 300;
      run.estacao = J.estacaoDaRodada(run.rodada, run);
      run.eventoId = evento.id;
      run.atributos.ataque = 0;
      if (evento.nemesis) run.nemesis = { nivel: 4, enfrentado: false };

      const batalha = J.engine.batalhaAjustada(run, evento.batalha);
      const adicionalNemesis = evento.nemesis ? 20 : 0;
      assert.ok(batalha.derrota.dano <= evento.batalha.derrota.dano + 20 + adicionalNemesis, evento.id);
      const opcao = J.engine.opcoes(evento, run, false).find((item) => item.combate);
      if (!opcao) {
        assert.equal(evento.id, "espirito_da_floresta");
        assert.equal(traco, "menino_cronista");
        continue;
      }

      assert.equal(J.engine.escolher(run, opcao.id), true, `${evento.id}/${traco}`);
      restantes.set(traco, Math.min(restantes.get(traco), run.atributos.hp));
      assert.ok(run.atributos.hp > 0, `${evento.id}/${traco}`);
    }
  }

  for (const traco of tracos) assert.ok(restantes.get(traco) > 0, traco);
});

test("controles mobile têm rótulos, áreas de toque e rolagem para o conteúdo", () => {
  const { J, app, novaRun } = preparar();
  const run = novaRun();
  run.eventoId = "colheita";
  run.historicoCronica = [
    {
      rodada: 224,
      eventoId: "carroca_atolada",
      evento: "A carroça atolada",
      escolha: "Organizar um mutirão",
      desfecho: "A carga chega à vila antes do anoitecer.",
    },
  ];
  J.ui.jogo(run, false);

  for (const acao of ["tutorial", "alternar-inventario", "alternar-progresso"])
    assert.match(app.innerHTML, new RegExp(`data-acao="${acao}"`));
  assert.doesNotMatch(app.innerHTML, /aria-label="Voltar para Casa"/);
  assert.match(app.innerHTML, /aria-controls="painel-inventario"/);
  assert.match(app.innerHTML, /aria-controls="painel-progresso"/);
  assert.match(app.innerHTML, /id="painel-progresso"/);
  assert.match(app.innerHTML, /A carroça atolada/);
  assert.match(app.innerHTML, /Organizar um mutirão/);
  run.historicoCronicaAberto = true;
  J.ui.jogo(run, false);
  assert.match(app.innerHTML, /<details id="painel-progresso"[^>]*open/);

  const css = fs.readFileSync(path.join(__dirname, "../css/style.css"), "utf8");
  assert.match(css, /\.botao-icone[^}]*width: 44px/);
  assert.match(css, /body\s*\{\s*min-height:\s*100dvh;\s*overflow-x:\s*hidden;\s*overflow-y:\s*auto;/);
});
