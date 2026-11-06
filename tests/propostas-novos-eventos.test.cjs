"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preparar } = require("./helpers/jogo.cjs");

test("debug permite escolher cada um dos 20 eventos nórdicos, inclusive os já vistos", async () => {
  const { J, app, novaRun, iniciar, clicar } = preparar();
  const run = novaRun();
  const eventos = J.eventos.filter((evento) => evento.divino);
  assert.equal(eventos.length, 20);
  for (const evento of eventos) run.flags[`especial_${evento.id}`] = true;
  J.save.gravarRun(run);
  iniciar();
  await clicar({ acao: "carregar" });
  for (const evento of eventos) {
    assert.ok(app.innerHTML.includes(`data-evento-id="${evento.id}"`));
    await clicar({ acao: "debug-especial-norte", eventoId: evento.id });
    assert.equal(J.save.lerRun().eventoId, evento.id);
    assert.equal(J.save.lerRun().fase, "escolha");
  }
  const salva = J.save.lerRun();
  const antes = JSON.stringify(salva);
  assert.equal(J.engine.debugAtivarEventoEspecial(salva, "norte", "mercador"), false);
  assert.equal(JSON.stringify(salva), antes);
  salva.aguardaDecisaoCulto = true;
  assert.equal(J.engine.debugAtivarEventoEspecial(salva, "norte", eventos[0].id), false);
});

test("debug ativa as duas novas transformações pelo controlador e persiste a sequência", async () => {
  for (const [id, acao, eventoId, marco] of [
    ["olhos_mercurio", "debug-condicao-olhos-mercurio", "primeira_conta", "olhosMercurioInicio"],
    ["olho_mil_nomes", "debug-condicao-olho-mil-nomes", "fila_no_portao", "olhoMilNomesInicio"],
  ]) {
    const { J, app, novaRun, iniciar, clicar } = preparar();
    const run = novaRun();
    run.rodada = 20;
    run.flags[`${id}_encerrado`] = true;
    run.flags[`${id}_encerrada`] = true;
    run.flags[`${id}_etapa4`] = true;
    const antes = JSON.stringify(run.atributos);
    J.save.gravarRun(run);
    iniciar();
    await clicar({ acao: "carregar" });
    assert.ok(app.innerHTML.includes(`data-acao="${acao}"`));
    await clicar({ acao });
    const salva = J.save.lerRun();
    assert.ok(salva);
    assert.equal(salva.flags[`${id}_ativo`], true);
    assert.equal(salva.flags[`${id}_etapa3`], true);
    assert.equal(salva.flags[`${id}_etapa4`], undefined);
    assert.equal(salva.flags[`${id}_encerrado`], undefined);
    assert.equal(salva.flags[`${id}_encerrada`], undefined);
    assert.equal(salva.marcos[marco], 20);
    assert.equal(salva.rodada, 20);
    assert.equal(salva.eventoId, eventoId);
    assert.equal(salva.fase, "escolha");
    assert.equal(JSON.stringify(salva.atributos), antes);
    assert.equal(J.engine.cumpre(J.eventoPorId(eventoId).requisitos, salva), true);
    salva.aguardaDecisaoCulto = true;
    const aguardando = JSON.stringify(salva);
    assert.equal(J.engine.debugForcarCondicao(salva, id), false);
    assert.equal(JSON.stringify(salva), aguardando);
  }
});

const idsComuns = [
  "arvore_sobre_estrada",
  "telhas_antes_da_chuva",
  "medida_do_trigo",
  "parede_de_pedra",
  "carroca_de_ferramentas",
  "canal_assoreado",
  "salgueiro_marcado",
  "caldeira_emprestada",
  "roda_perde_eixo",
  "ponte_de_corda",
  "velas_de_sebo",
  "deposito_de_carvao",
  "cerca_de_espinhos",
  "lastro_de_cobre",
  "lugar_a_mesa",
  "troca_de_turnos",
  "chaves_sala_comum",
  "patio_dividido",
  "retrato_sem_dono",
  "cao_escolheu_porta",
  "carta_recomendacao",
  "heranca_ferramentas",
  "copia_do_registro",
  "bolsa_de_botoes",
  "carregamento_de_vidro",
  "farinha_com_limalha",
  "pedra_de_distancias",
  "remessa_trocada",
  "cadernos_agrimensor",
  "mercado_ferramentas_quebradas",
  "caixa_de_amostras",
  "leilao_de_cordas",
  "sombra_campanario",
  "sal_nao_derrete",
  "quarto_sem_pegadas",
  "chuva_poco_seco",
  "moedas_viradas",
  "janela_casa_vazia",
];

const idsCadeias = [
  "carta_na_encadernacao",
  "marcas_no_vau",
  "posto_de_pedra",
  "destino_da_carta",
  "cacos_sob_cinza",
  "receita_incompleta",
  "forno_de_areia",
  "janela_guarda_calor",
  "frutos_terreno_baldio",
  "enxerto_recusado",
  "raizes_sob_parede",
  "primeira_cesta_pomar",
  "pagina_fundo_bau",
  "herdeiro_cobrador",
  "testemunhas_ponte",
  "conta_encerrada",
  "lanterna_colina",
  "cinzas_no_abrigo",
  "codigo_dos_panos",
  "aviso_recebido",
  "desenho_no_barril",
  "camada_de_argila",
  "agua_sobe_devagar",
  "primeira_distribuicao",
  "tear_desmontado",
  "fio_tres_cores",
  "padrao_emprestado",
  "ultimo_rolo",
];

const idsTransformacoes = [
  "cambista_sem_balanca",
  "vidro_sob_palpebra",
  "primeira_conta",
  "peso_da_visao",
  "olho_no_reboco",
  "olho_dos_mil_nomes",
  "fila_no_portao",
  "olho_pede_silencio",
];

const obterOpcoes = (J, run, eventoId) => {
  run.fase = "escolha";
  run.eventoId = eventoId;
  return J.engine.opcoes(J.eventoPorId(eventoId), run);
};

test("as 74 propostas aprovadas formam o catálogo e apontam para artes disponíveis", () => {
  const { J } = preparar();
  const ids = [...idsComuns, ...idsCadeias, ...idsTransformacoes];
  const eventos = ids.map((id) => J.eventoPorId(id));

  assert.equal(idsComuns.length, 38);
  assert.equal(idsCadeias.length, 28);
  assert.equal(idsTransformacoes.length, 8);
  assert.equal(new Set(ids).size, 74);
  assert.equal(J.eventos.length, 385);
  assert.ok(eventos.every(Boolean));
  assert.ok(eventos.every((evento) => evento.imagem.endsWith(".webp")));
  assert.ok(eventos.every((evento) => fs.existsSync(path.join(__dirname, "..", evento.imagem))));
  assert.equal(J.validarCatalogoEventos(), true);
});

test("as sete cadeias avançam por uma escolha marcada e permitem encerrar", () => {
  const { J, novaRun } = preparar();
  const cadeias = [
    ["carta_na_encadernacao", "marcas_no_vau", "posto_de_pedra", "destino_da_carta"],
    ["cacos_sob_cinza", "receita_incompleta", "forno_de_areia", "janela_guarda_calor"],
    ["frutos_terreno_baldio", "enxerto_recusado", "raizes_sob_parede", "primeira_cesta_pomar"],
    ["pagina_fundo_bau", "herdeiro_cobrador", "testemunhas_ponte", "conta_encerrada"],
    ["lanterna_colina", "cinzas_no_abrigo", "codigo_dos_panos", "aviso_recebido"],
    ["desenho_no_barril", "camada_de_argila", "agua_sobe_devagar", "primeira_distribuicao"],
    ["tear_desmontado", "fio_tres_cores", "padrao_emprestado", "ultimo_rolo"],
  ];

  for (const cadeia of cadeias) {
    const run = novaRun();
    run.rodada = 12;
    const primeira = J.eventoPorId(cadeia[0]);
    assert.equal(J.engine.cumpre(primeira.requisitos, run), true, cadeia[0]);
    for (let indice = 1; indice < cadeia.length; indice += 1) {
      const anterior = J.eventoPorId(cadeia[indice - 1]);
      const proxima = J.eventoPorId(cadeia[indice]);
      const escolha = anterior.opcoes.find((opcao) =>
        Object.keys(opcao.flags || {}).some((flag) => flag.endsWith(`_etapa${indice + 1}`)),
      );
      assert.ok(escolha, `${anterior.id} precisa oferecer continuação`);
      Object.assign(run.flags, escolha.flags);
      assert.equal(J.engine.cumpre(proxima.requisitos, run), true, proxima.id);
    }
    const final = J.eventoPorId(cadeia.at(-1));
    assert.ok(
      final.opcoes.every(
        (opcao) => opcao.flags?.[`${final.requisitos.flags[0].replace(/_etapa\d+$/, "")}_encerrada`],
      ),
    );
  }

  const semente = J.eventoPorId("primeira_cesta_pomar").opcoes.find(
    (opcao) => opcao.id === "guardar_sementes",
  );
  assert.equal(semente.efeitos.hpMax, 10);
  assert.equal(semente.efeitos.hp, undefined);
});

test("o caminho sem autorização da caravana continua, mas oculta o Entreposto", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.rodada = 12;
  run.flags.caravana_teceles_etapa3 = true;
  const opcaoSemAcordo = J.eventoPorId("padrao_emprestado").opcoes.find(
    (opcao) => opcao.id === "usar_padrao",
  );
  Object.assign(run.flags, opcaoSemAcordo.flags);

  assert.equal(run.flags.tecelagem_padrao_sem_acordo, true);
  assert.equal(J.engine.cumpre(J.eventoPorId("ultimo_rolo").requisitos, run), true);
  assert.equal(
    obterOpcoes(J, run, "ultimo_rolo").some((opcao) => opcao.id === "construir_entreposto"),
    false,
  );

  const runComAcordo = novaRun();
  runComAcordo.rodada = 12;
  runComAcordo.flags.caravana_teceles_etapa4 = true;
  assert.equal(
    obterOpcoes(J, runComAcordo, "ultimo_rolo").some((opcao) => opcao.id === "construir_entreposto"),
    true,
  );
});

test("as duas transformações só exibem remoção depois de 16 rodadas", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.rodada = 20;
  run.flags.olhos_mercurio_ativo = true;
  run.flags.olhos_mercurio_etapa4 = true;
  run.marcos.olhosMercurioInicio = 5;
  assert.equal(J.engine.cumpre(J.eventoPorId("peso_da_visao").requisitos, run), false);
  run.rodada = 21;
  assert.equal(J.engine.cumpre(J.eventoPorId("peso_da_visao").requisitos, run), true);

  run.flags.olho_mil_nomes_ativo = true;
  run.flags.olho_mil_nomes_etapa4 = true;
  run.marcos.olhoMilNomesInicio = 5;
  run.rodada = 20;
  assert.equal(J.engine.cumpre(J.eventoPorId("olho_pede_silencio").requisitos, run), false);
  run.rodada = 21;
  assert.equal(J.engine.cumpre(J.eventoPorId("olho_pede_silencio").requisitos, run), true);
});

test("a Cisterna paga seu primeiro Habitante após três rodadas completas", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.atributos.habitantes = 1;
  run.rodada = 20;
  run.eventoId = "primeira_distribuicao";
  assert.equal(J.engine.escolher(run, "construir_cisterna"), true);
  assert.equal(run.marcos.cisternaConstruidaRodada, 20);
  assert.ok(run.construcoes.includes("cisterna_comunitaria"));
  const habitantesNaObra = run.atributos.habitantes;

  run.rodada = 22;
  run.eventoId = "destino_da_carta";
  run.fase = "escolha";
  J.engine.escolher(run, "fechar_abrigo");
  assert.equal(run.atributos.habitantes, habitantesNaObra);

  run.rodada = 23;
  run.eventoId = "destino_da_carta";
  run.fase = "escolha";
  J.engine.escolher(run, "fechar_abrigo");
  assert.equal(run.atributos.habitantes, habitantesNaObra + 1);
  assert.match(run.ultimoResultado.texto, /Cisterna comunitária acrescenta 1 Habitante/);
});

test("o Entreposto respeita o padrão autorizado e rende Gold após duas rodadas", () => {
  const { J, novaRun } = preparar();
  const run = novaRun();
  run.atributos.habitantes = 1;
  run.rodada = 10;
  run.flags.caravana_teceles_etapa4 = true;
  run.eventoId = "ultimo_rolo";
  assert.equal(J.engine.escolher(run, "construir_entreposto"), true);
  assert.equal(run.marcos.entrepostoComercialRodada, 10);
  assert.ok(run.construcoes.includes("entreposto_comercial"));
  run.rodada = 11;
  assert.equal(J.engine.preverRenda(run).rodada, 12);
  assert.ok(J.engine.preverRenda(run).fontes.some((fonte) => fonte.nome === "Entreposto comercial"));

  run.rodada = 12;
  run.eventoId = "destino_da_carta";
  run.fase = "escolha";
  J.engine.escolher(run, "fechar_abrigo");
  assert.match(run.ultimoResultado.texto, /Entreposto comercial rende 1 Gold/);
});

test("as transformações destacam sua moldura e mostram prévias sem revelar perdas de Habitantes", () => {
  const { J, novaRun, app } = preparar();
  const run = novaRun();
  run.flags.olhos_mercurio_ativo = true;
  run.flags.olhos_mercurio_etapa3 = true;
  run.flags.olho_mil_nomes_ativo = true;
  run.flags.olho_mil_nomes_etapa3 = true;
  run.eventoId = "primeira_conta";
  J.ui.jogo(run, { textoCompleto: true });

  assert.match(app.innerHTML, /transformacao-olhos-mercurio/);
  assert.match(app.innerHTML, /moldura-mercurio/);
  assert.match(app.innerHTML, /moldura-mil-nomes/);
  assert.match(app.innerHTML, /Gold -4 · Vida \+12/);
  assert.match(app.innerHTML, /sucesso: Gold \+3 · Vida \+6/);
  assert.match(app.innerHTML, /falha: Gold -2 · Vida -8/);

  run.eventoId = "fila_no_portao";
  J.ui.jogo(run, { textoCompleto: true });
  assert.match(app.innerHTML, /Habitantes \+4/);
  assert.match(app.innerHTML, /sem ganho de Habitantes/);
  assert.doesNotMatch(app.innerHTML, /Habitantes -2/);
});
