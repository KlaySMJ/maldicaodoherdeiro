"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preparar } = require("./helpers/jogo.cjs");

const camposEvento = new Set([
  "abissal",
  "apenasAposIds",
  "apenasAposTipo",
  "batalha",
  "bauAleatorio",
  "chanceAposAnterior",
  "conselheiro",
  "conselheiroPadrao",
  "conselhoNegativo",
  "consequenciaAgendada",
  "disparadoPelaEngine",
  "divino",
  "entidadeX",
  "entidadeXAparicoesMin",
  "entidadeXInicio",
  "especial",
  "forcarSorteioQuandoElegivel",
  "grupoRecorrencia",
  "id",
  "imagem",
  "imagemAlt",
  "informacoes",
  "intervaloRodadas",
  "letal",
  "marcaCondicaoDecidida",
  "mercadorias",
  "multiplicadoresPeso",
  "nemesis",
  "narrativamenteUnico",
  "oncePerRun",
  "oncePerYear",
  "opcaoCorreta",
  "opcoes",
  "pacto",
  "peso",
  "poolOpcoes",
  "protecaoCeleiro",
  "requerDesbloqueio",
  "requisitos",
  "texto",
  "tipo",
  "titulo",
  "zodiaco",
]);

const camposOpcao = new Set([
  "abracarCondicao",
  "armadilha",
  "combate",
  "consequenciaTardia",
  "construcoes",
  "consumirItens",
  "consumoVampirismo",
  "curaUniversal",
  "curarCondicao",
  "definir",
  "desbloqueia",
  "dueloDados",
  "dissolverCulto",
  "efeitoContinuo",
  "efeitoDivino",
  "efeitoTemporario",
  "efeitos",
  "encerramento",
  "entidadeXCeder",
  "entrarNoCulto",
  "flags",
  "id",
  "iniciarRecargaItens",
  "itens",
  "marcoRodada",
  "multiplicadores",
  "recompensaItemEspecial",
  "recompensaItemGenerico",
  "requisitos",
  "resultado",
  "resultadoCulto",
  "sacrificarPopulacao",
  "testeSorte",
  "texto",
]);

function percorrer(valor, visitar) {
  if (!valor || typeof valor !== "object") return;
  if (Array.isArray(valor)) {
    valor.forEach((item) => percorrer(item, visitar));
    return;
  }
  visitar(valor);
  Object.values(valor).forEach((item) => percorrer(item, visitar));
}

test("o catálogo completo mantém IDs e índice únicos", () => {
  const { J } = preparar();
  assert.equal(J.eventos.length, 397);
  assert.equal(J.eventosPorId.size, J.eventos.length);
  assert.equal(J.validarCatalogoEventos(), true);

  const ids = new Set();
  for (const evento of J.eventos) {
    assert.ok(evento.id && !ids.has(evento.id), `ID duplicado: ${evento.id}`);
    ids.add(evento.id);
    assert.equal(J.eventoPorId(evento.id), evento);
  }
});

test("eventos e opções usam somente campos reconhecidos", () => {
  const { J } = preparar();
  for (const evento of J.eventos) {
    for (const campo of Object.keys(evento)) {
      assert.ok(camposEvento.has(campo), `Campo de evento desconhecido: ${evento.id}.${campo}`);
    }
    const opcoes = evento.poolOpcoes || evento.opcoes;
    assert.ok(Array.isArray(opcoes), `Evento sem opções: ${evento.id}`);
    for (const opcao of opcoes) {
      for (const campo of Object.keys(opcao)) {
        assert.ok(camposOpcao.has(campo), `Campo de opção desconhecido: ${evento.id}.${opcao.id}.${campo}`);
      }
    }
  }
});

test("cartas narrativamente únicas têm proteção contra repetição", () => {
  const { J } = preparar();
  const unicas = J.eventos.filter((evento) => evento.narrativamenteUnico);
  assert.ok(unicas.some((evento) => evento.id === "espiao"));
  assert.ok(unicas.length > 0);
  for (const evento of unicas) {
    assert.ok(
      evento.oncePerRun || evento.oncePerYear || evento.letal,
      `${evento.id} está marcada como única sem proteção contra repetição.`,
    );
  }
  assert.equal(J.eventoPorId("espiao").oncePerRun, true);
});

test("consequências adiadas e desbloqueios apontam para dados válidos", () => {
  const { J } = preparar();
  const idsItens = new Set(J.itens.map((item) => item.id));
  const tiposDesbloqueio = new Set(["eventos", "itens", "flags"]);

  for (const evento of J.eventos) {
    for (const opcao of evento.poolOpcoes || evento.opcoes) {
      if (opcao.consequenciaTardia?.eventoId) {
        assert.ok(
          J.eventoPorId(opcao.consequenciaTardia.eventoId),
          `${evento.id}.${opcao.id} agenda carta inexistente: ${opcao.consequenciaTardia.eventoId}`,
        );
      }
      percorrer(opcao, (objeto) => {
        const desbloqueia = objeto.desbloqueia;
        if (!desbloqueia) return;
        for (const [tipo, ids] of Object.entries(desbloqueia)) {
          assert.ok(tiposDesbloqueio.has(tipo), `Desbloqueio desconhecido: ${evento.id}.${opcao.id}.${tipo}`);
          assert.ok(Array.isArray(ids), `Desbloqueio ${tipo} precisa ser uma lista.`);
          for (const id of ids) {
            assert.equal(typeof id, "string", `ID inválido em desbloqueia.${tipo}`);
            if (tipo === "eventos") assert.ok(J.eventoPorId(id), `Evento desbloqueado inexistente: ${id}`);
            if (tipo === "itens") assert.ok(idsItens.has(id), `Item desbloqueado inexistente: ${id}`);
          }
        }
      });
    }
  }
});

test("flags escritas por escolhas têm pelo menos um consumidor", () => {
  const { J } = preparar();
  const escritas = new Set();
  const lidas = new Set();

  function adicionarLeituras(requisitos) {
    for (const tipo of ["flags", "flagsAusentes", "flagsLegado"]) {
      for (const id of requisitos?.[tipo] || []) lidas.add(id);
    }
  }

  function coletarLeituras(valor) {
    if (!valor || typeof valor !== "object") return;
    if (Array.isArray(valor)) return valor.forEach(coletarLeituras);
    for (const [campo, conteudo] of Object.entries(valor)) {
      if (campo === "requisitos") {
        for (const tipo of ["flags", "flagsAusentes", "flagsLegado"]) {
          for (const id of conteudo?.[tipo] || []) lidas.add(id);
        }
      }
      if (campo !== "desbloqueia") coletarLeituras(conteudo);
    }
  }

  function coletarEscritas(valor) {
    if (!valor || typeof valor !== "object") return;
    if (Array.isArray(valor)) return valor.forEach(coletarEscritas);
    for (const [campo, conteudo] of Object.entries(valor)) {
      if (campo === "desbloqueia") continue;
      if (campo === "flags" && conteudo && typeof conteudo === "object" && !Array.isArray(conteudo)) {
        Object.keys(conteudo).forEach((id) => escritas.add(id));
        continue;
      }
      coletarEscritas(conteudo);
    }
  }

  for (const evento of J.eventos) {
    adicionarLeituras(evento.requisitos);
    for (const opcao of evento.poolOpcoes || evento.opcoes) {
      coletarLeituras(opcao);
      coletarEscritas(opcao);
    }
  }

  const jsDir = path.join(__dirname, "../js");
  const fontesRuntime = fs
    .readdirSync(jsDir)
    .filter((nome) => nome.endsWith(".js") && !nome.startsWith("events"))
    .map((nome) => fs.readFileSync(path.join(jsDir, nome), "utf8"))
    .join("\n");
  const semLeitura = [...escritas].filter((id) => {
    if (lidas.has(id)) return false;
    const escapado = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return !new RegExp(`(?:\\.|\\?\\.)${escapado}\\b(?!\\s*=)`).test(fontesRuntime);
  });

  assert.deepEqual(semLeitura, [], `Flags gravadas sem leitura: ${semLeitura.join(", ")}`);
});
