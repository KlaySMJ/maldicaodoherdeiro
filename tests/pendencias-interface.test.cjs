"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

function falha(evento = "saqueadores", cao = false) {
  const c = preparar();
  const r = c.J.estado.novo(c.J.legado.vazio(), "avarento");
  r.debugTracoInimigo = "nenhum";
  r.atributos.ataque = 0;
  r.atributos.escudo = 0;
  if (cao) {
    c.J.engine.concederItem(r, "cao_companheiro");
    r.sistemas.vinculos.cao_companheiro = "ativo";
  }
  const e = c.J.eventoPorId(evento);
  c.J.engine.registrarSorteio(r, e);
  assert.equal(c.J.engine.escolher(r, e.opcoes.find((o) => o.combate).id), true);
  assert.equal(c.J.engine.rolarCombate(r), true);
  r.combatePendente.dadosHerdeiro.fill(1);
  r.combatePendente.dadosInimigo.fill(20);
  return { ...c, r };
}

test("escolhas mostram uma consulta por bloqueio e não revelam Honra ou flags", () => {
  const { J, novaRun, app } = preparar();
  const r = novaRun();
  r.atributos.gold = 0;
  r.construcoes.push("moinho");
  J.engine.registrarSorteio(r, J.eventoPorId("moinho_especializacao"));
  J.ui.jogo(r, { textoCompleto: true });
  assert.equal(
    (app.innerHTML.match(/class="escolha escolha-desabilitada requisito-consulta"/g) || []).length,
    2,
  );
  assert.match(app.innerHTML, /Faltam 3 Gold/);
  const evento = {
    id: "segredos",
    opcoes: [
      { id: "honra", texto: "Honra oculta", requisitos: { honraMin: 90 } },
      { id: "flag", texto: "Flag oculta", requisitos: { flags: ["segredo"] } },
      { id: "sair", texto: "Sair" },
    ],
  };
  assert.equal(J.sistemasUI.indisponiveis(evento, r), "");
});

test("prévia do cão confere com o golpe confirmado e preserva o vínculo até confirmar", () => {
  const { J, app, r } = falha("saqueadores", true);
  const vida = r.atributos.hp;
  J.ui.jogo(r, { textoCompleto: true });
  const dano = Number(app.innerHTML.match(/Dano recebido: <strong>(\d+)<\/strong>/)[1]);
  assert.equal(r.sistemas.vinculos.cao_companheiro, "ativo");
  assert.equal(r.atributos.hp, vida);
  J.engine.continuarCombate(r);
  assert.equal(r.ultimoResultado.combate.dano, dano);
  assert.equal(r.atributos.hp, vida - dano);
  assert.equal(r.sistemas.vinculos.cao_companheiro, "usado");
});

test("penalidades adicionais de Vida aparecem sem repetir o dano do golpe", () => {
  const { J, app, r } = falha("javalis");
  J.engine.continuarCombate(r);
  J.ui.jogo(r, { textoCompleto: true });
  const total = r.ultimoResultado.alteracoes.hp;
  assert.ok(total < -r.ultimoResultado.combate.dano);
  assert.match(app.innerHTML, new RegExp(`Saldo de Vida<\\/span><strong>${total}<\\/strong>`));
});

test("a velocidade escolhida funciona na sessão com armazenamento bloqueado", () => {
  const { J, window } = preparar();
  window.localStorage.setItem = () => {
    throw Error("bloqueado");
  };
  window.localStorage.getItem = () => {
    throw Error("bloqueado");
  };
  for (const valor of ["rapido", "imediato", "normal"]) {
    assert.equal(J.ui.alternarVelocidadeTexto(), valor);
    assert.equal(J.ui.preferenciaTexto(), valor);
  }
});

test("o encerramento distingue desbloqueio de troféu de item recebido", () => {
  const { J, app, r } = falha("embate_barao");
  r.atributos.ataque = 100;
  for (let i = 0; i < 4; i++) {
    if (r.combatePendente.etapa === "preparacao") J.engine.rolarCombate(r);
    r.combatePendente.dadosHerdeiro.fill(20);
    r.combatePendente.dadosInimigo.fill(1);
    J.engine.continuarCombate(r);
  }
  J.engine.continuarCombate(r);
  J.ui.fim(r, true);
  const semHistorico = app.innerHTML.replace(/<details id="historico-fim"[\s\S]*?<\/details>/g, "");
  assert.match(semHistorico, /Troféu: Estandarte do Barão/);
  assert.match(semHistorico, /não começa com o item/);
  J.ui.fim(r, false);
  assert.match(app.innerHTML, /Ao salvar o legado/);
});

test("o cenário acompanha obras, ruínas e duração das marcas sem alterar o save", () => {
  const { J, novaRun } = preparar();
  const r = novaRun();
  r.construcoes = ["moinho", "ponte"];
  J.sistemas.vila(r);
  r.vila.obras.moinho.nivel = 3;
  r.vila.obras.moinho.dano = 2;
  r.estacao = "inverno";
  r.vila.marcas = [{ tipo: "festa", fim: r.rodada }];
  const antes = JSON.stringify(r);
  const html = J.sistemasUI.mapa(r);
  assert.equal((html.match(/data-caminho-obra=/g) || []).length, 2);
  assert.match(html, /data-estado-visual="interrompida"/);
  assert.match(html, /data-estacao-visual="inverno"/);
  assert.match(html, /data-marca-visual="festa"/);
  assert.equal(JSON.stringify(r), antes);
  r.rodada++;
  assert.doesNotMatch(J.sistemasUI.mapa(r), /data-marca-visual="festa"/);
});
