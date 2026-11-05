"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preparar } = require("./helpers/jogo.cjs");

test("peso efetivo da Entidade fica baixo e a pausa entre cartas aumenta para 24 rodadas", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  const entidade = J.eventos.filter((evento) => evento.entidadeX || evento.entidadeXInicio);
  const abissais = J.eventos.filter((evento) => evento.abissal);
  const pesosEntidade = entidade.map((evento) => J.engine.peso(evento, run));
  const pesosAbissais = abissais.map((evento) => J.engine.peso(evento, run));

  assert.equal(entidade.length, 7);
  assert.ok(pesosEntidade.every((peso) => peso >= 0.4 && peso <= 0.6));
  assert.equal(abissais.length, 5);
  assert.ok(pesosAbissais.every((peso) => peso >= 0.5 && peso <= 0.8));
  assert.equal(J.config.intervaloEntidade, 24);
  assert.ok(pesosEntidade.reduce((total, peso) => total + peso, 0) <= 3.5);
  assert.ok(pesosAbissais.reduce((total, peso) => total + peso, 0) >= 3.3);
});

test("vampirismo soma consumo em partes, concede Ataque por cinco e salva o progresso parcial", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.condicao.ativa = "vampirismo";
  run.condicao.rodada = 1;
  run.inventario.push("sede_de_sangue");
  run.atributos.hp = 50;

  for (let consumo = 1; consumo <= 4; consumo += 1) {
    run.rodada = consumo * 6;
    run.fase = "escolha";
    run.eventoId = "a_sede";
    run.itensConsumidosEm.sede_de_sangue = run.rodada - 6;
    assert.equal(J.engine.escolher(run, "morador"), true);
  }
  assert.equal(run.vampirismoHabitantesConsumidos, 4);
  assert.equal(run.vampirismoBonusAtaque, 0);

  assert.equal(J.save.gravarRun(run), true);
  const carregada = J.save.lerRun();
  assert.equal(carregada.vampirismoHabitantesConsumidos, 4);
  assert.equal(carregada.vampirismoBonusAtaque, 0);

  for (let consumo = 5; consumo <= 12; consumo += 1) {
    carregada.rodada = consumo * 6;
    carregada.fase = "escolha";
    carregada.eventoId = "a_sede";
    carregada.itensConsumidosEm.sede_de_sangue = carregada.rodada - 6;
    assert.equal(J.engine.escolher(carregada, "morador"), true);
    if (consumo === 5) assert.equal(carregada.atributos.ataque, run.atributos.ataque + 1);
  }
  assert.equal(carregada.vampirismoHabitantesConsumidos, 12);
  assert.equal(carregada.vampirismoBonusAtaque, 2);
  assert.equal(carregada.atributos.ataque, run.atributos.ataque + 2);
});

test("vampirismo no culto conta seguidores consumidos", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.condicao.ativa = "vampirismo";
  run.condicao.rodada = 1;
  run.cultoAtivo = true;
  run.marcos.cultoAdesao = 1;
  run.seguidoresCulto = 10;
  run.inventario.push("sede_de_sangue");
  run.atributos.hp = 50;

  run.fase = "escolha";
  run.eventoId = "a_sede";
  assert.equal(J.engine.escolher(run, "morador"), true);
  assert.equal(run.seguidoresCulto, 9);
  assert.equal(run.atributos.habitantes, 50);
  assert.equal(run.vampirismoHabitantesConsumidos, 1);
});

test("seleção de herdeiro oferece retratos com detalhes disponíveis ao passar o cursor", () => {
  const { J, app } = preparar();
  J.ui.escolherHerdeiro(J.legado.vazio());

  assert.match(app.innerHTML, /class="herdeiro-opcao/);
  assert.match(app.innerHTML, /aria-disabled="false"/);
  assert.match(app.innerHTML, /class="herdeiro-opcao-info"/);
  assert.match(app.innerHTML, /alt=""/);
});

test("texto da carta mantém cópia acessível sem duplicá-la na leitura visual e informa Gold no hover", () => {
  const { J, novaRun, app } = preparar();
  J.ui.jogo(novaRun(), { textoCompleto: true });

  assert.match(
    app.innerHTML,
    /class="leitor-de-tela">[^<]+<\/span><span data-texto-visual aria-hidden="true">/,
  );
  assert.match(app.innerHTML, /class="recurso-contador gold-contador"[^>]*data-tooltip="[^"]+"/);
  const gold = app.innerHTML.match(/<div class="recurso-contador gold-contador"[\s\S]*?<\/div>/)?.[0] || "";
  assert.match(gold, /<dt>Gold<\/dt><dd>\d+<\/dd>/);
  assert.doesNotMatch(gold, /info-hover|>i</);
});

test("painel de conquistas agrupa progresso em abas acessíveis", () => {
  const { J, app } = preparar();
  J.ui.painelLegado(J.legado.vazio());

  assert.match(app.innerHTML, /role="tablist"/);
  assert.match(app.innerHTML, /id="aba-conquistas"[^>]*aria-selected="true"/);
  assert.match(app.innerHTML, /<progress[^>]*aria-label=/);
  assert.match(app.innerHTML, /class="legado-categoria"/);
});

test("moldura da licantropia acompanha as fases da lua no ciclo de oito rodadas", () => {
  const { J, novaRun, app } = preparar();
  const run = novaRun();
  run.condicao.ativa = "licantropia";
  run.condicao.rodada = 1;
  J.ui.jogo(run, { textoCompleto: true });

  assert.match(app.innerHTML, /data-fase-lunar="nova"/);
  assert.match(app.innerHTML, /Cheia em 7 rod\./);
  assert.equal([...app.innerHTML.matchAll(/moldura-lunar-marca--acesa/g)].length, 1);

  run.rodada = 8;
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /data-fase-lunar="cheia"/);
  assert.match(app.innerHTML, /Lua cheia/);
  assert.equal([...app.innerHTML.matchAll(/moldura-lunar-marca--acesa/g)].length, 8);

  run.condicao.abracada = true;
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /data-fase-lunar="domada"/);
  assert.match(app.innerHTML, /Ciclo domado/);
});

test("pontos do fundo têm núcleos claros, halo e pulsação lenta", () => {
  const css = fs.readFileSync(path.join(__dirname, "../css/style.css"), "utf8");
  const fundoAnimado = css.match(/body::after\s*\{([\s\S]*?)\n\}/)?.[1] || "";

  assert.equal([...fundoAnimado.matchAll(/radial-gradient\(circle at/g)].length, 16);
  assert.equal(
    [
      ...fundoAnimado.matchAll(
        /#fff 0 1px, rgba\(255,255,255,\.74\) 1\.5px, rgba\(255,255,255,\.28\) 3px, transparent 7px/g,
      ),
    ].length,
    16,
  );
  assert.match(fundoAnimado, /animation: vagalumes 18s/);
  const animacao = css.match(/@keyframes vagalumes[^\n]*/)?.[0] || "";
  assert.match(animacao, /opacity: \.98/);
});
