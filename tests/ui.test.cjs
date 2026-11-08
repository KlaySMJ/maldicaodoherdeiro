"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

test("menu e intro reais renderizam as ações principais e atualizam a tela", () => {
  const { J, app } = preparar();

  J.ui.menu(null);
  assert.match(app.innerHTML, /data-acao="iniciar"/);
  assert.match(app.innerHTML, /data-acao="tutorial"/);
  assert.match(app.innerHTML, /data-acao="carregar" disabled/);

  J.ui.intro();
  assert.match(app.innerHTML, /class="intro"/);
  assert.match(app.innerHTML, /data-acao="entrar-no-jogo"/);
});

test("tela de fim mostra saída adequada quando o legado foi ou não salvo", () => {
  const { J, app } = preparar();
  const run = {
    fim: { tipo: "derrota", motivo: "A crônica chegou ao fim." },
    ultimoResultado: null,
    rodada: 12,
    atributos: { habitantes: 17 },
  };

  J.ui.fim(run, true);
  assert.match(app.innerHTML, /Um novo herdeiro/);
  assert.match(app.innerHTML, /Voltar ao início/);
  assert.doesNotMatch(app.innerHTML, /Tentar salvar novamente/);

  J.ui.fim(run, false);
  assert.match(app.innerHTML, /Tentar salvar novamente/);
  assert.match(app.innerHTML, /Outro herdeiro sem salvar/);
});

test("tutorial pode ser solicitado fora de uma crônica sem quebrar a interface", () => {
  const { J } = preparar();
  assert.doesNotThrow(() => J.ui.tutorial());
});

test("impacto acompanha a perda real de Vida e não repete ao redesenhar a tela", () => {
  const { J, app, novaRun } = preparar();
  const run = novaRun();
  J.ui.jogo(run, { textoCompleto: true });
  assert.doesNotMatch(app.innerHTML, /herdeiro-ferido|vida-perdida/);

  run.atributos.hp -= 13;
  run.atributos.honra += 30;
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /herdeiro-ferido/);
  assert.match(app.innerHTML, /vida-perdida[^>]*data-dano="13"/);
  assert.match(app.innerHTML, /honra-mudou/);

  J.ui.jogo(run, { textoCompleto: true });
  assert.doesNotMatch(app.innerHTML, /herdeiro-ferido|vida-perdida/);
  run.atributos.hp += 5;
  J.ui.jogo(run, { textoCompleto: true });
  assert.doesNotMatch(app.innerHTML, /herdeiro-ferido|vida-perdida/);

  run.atributos.hp -= 2;
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /vida-perdida[^>]*data-dano="2"/);
});

test("carregar outra crônica ou voltar do menu não conta como dano", () => {
  const { J, app, novaRun } = preparar();
  const run = novaRun();
  J.ui.jogo(run, { textoCompleto: true });
  const outra = novaRun();
  outra.id = "outra-cronica";
  outra.atributos.hp = 12;
  J.ui.jogo(outra, { textoCompleto: true });
  assert.doesNotMatch(app.innerHTML, /herdeiro-ferido|vida-perdida/);

  J.ui.menu(outra);
  outra.atributos.hp = 8;
  J.ui.jogo(outra, { textoCompleto: true });
  assert.doesNotMatch(app.innerHTML, /herdeiro-ferido|vida-perdida/);
});

test("coleção conta conquistas conhecidas uma vez e distribui todas entre os temas", () => {
  const { J, app } = preparar();
  const legado = J.legado.vazio();
  const ids = J.conquistas.lista.map((conquista) => conquista.id);
  legado.conquistasDesbloqueadas = [ids[0], ids[0], ids[1], "conquista_antiga"];
  J.ui.painelLegado(legado);
  assert.match(app.innerHTML, new RegExp(`aria-label="2 de ${ids.length} conquistas"`));
  assert.match(app.innerHTML, new RegExp(`${ids.length - 2} por conquistar`));
  const renderizadas = [...app.innerHTML.matchAll(/data-conquista-item="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(renderizadas.length, ids.length);
  assert.deepEqual([...new Set(renderizadas)].sort(), [...ids].sort());
  for (const [id, categoria] of [
    ["sobreviver_100", "cronicas"],
    ["vitoria_corajoso_honra_alta", "herdeiros"],
    ["entidade_resolvida", "historias"],
    ["pressagio_lua_vermelha", "pressagios"],
    ["pressagios_todos_superados", "pressagios"],
    ["cadeia_carta_navegacao", "historias"],
    ["norte_quatro_ameacas", "historias"],
    ["visao_mercurio_aceita", "transformacoes"],
    ["obra_cisterna_comunitaria", "vila"],
    ["condicao_vampirismo_abracada", "transformacoes"],
    ["gold_100", "vila"],
    ["ataque_10", "combate"],
  ]) {
    assert.match(
      app.innerHTML,
      new RegExp(`data-conquista-item="${id}"[^>]*data-conquista-categoria="${categoria}"`),
    );
  }
});

test("coleção vazia mantém resumo válido e explica a ausência de conquistas", () => {
  const { J, app } = preparar();
  J.conquistas.lista = [];
  const legado = J.legado.vazio();
  legado.conquistasDesbloqueadas = ["conquista_antiga"];
  J.ui.painelLegado(legado);
  assert.match(app.innerHTML, /0% da coleção/);
  assert.match(app.innerHTML, /Nenhuma conquista cadastrada/);
  assert.doesNotMatch(app.innerHTML, /NaN|Infinity|data-conquista-item=/);
});
