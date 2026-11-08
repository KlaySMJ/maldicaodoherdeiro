"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { preparar } = require("./helpers/jogo.cjs");

const cadeias = [
  ["carta_navegacao", ["carta_na_encadernacao", "marcas_no_vau", "posto_de_pedra", "destino_da_carta"]],
  ["oficio_vidreiro", ["cacos_sob_cinza", "receita_incompleta", "forno_de_areia", "janela_guarda_calor"]],
  [
    "pomar_sem_placa",
    ["frutos_terreno_baldio", "enxerto_recusado", "raizes_sob_parede", "primeira_cesta_pomar"],
  ],
  ["livro_dividas", ["pagina_fundo_bau", "herdeiro_cobrador", "testemunhas_ponte", "conta_encerrada"]],
  ["posto_sinais", ["lanterna_colina", "cinzas_no_abrigo", "codigo_dos_panos", "aviso_recebido"]],
  [
    "aprendizes_cisterna",
    ["desenho_no_barril", "camada_de_argila", "agua_sobe_devagar", "primeira_distribuicao"],
  ],
  ["caravana_teceles", ["tear_desmontado", "fio_tres_cores", "padrao_emprestado", "ultimo_rolo"]],
];

function nova(J, legado = J.legado.vazio()) {
  const run = J.estado.novo(legado, "corajoso");
  run.rodada = 12;
  run.atributos.gold = 100;
  return run;
}
function escolher(J, run, eventoId, opcaoId) {
  run.fase = "escolha";
  const evento = J.eventoPorId(eventoId);
  assert.ok(evento, eventoId);
  J.engine.registrarSorteio(run, evento);
  assert.equal(J.engine.escolher(run, opcaoId), true, `${eventoId}:${opcaoId}`);
}
function ganhou(run, id) {
  return run.conquistas.conquistasDesbloqueadas.includes(id);
}
function completar(J, run, chave, eventos, ultimaOpcao) {
  eventos.forEach((eventoId, i) => {
    const opcoes = J.eventoPorId(eventoId).opcoes;
    const opcao =
      i < 3
        ? opcoes.find((o) => o.flags?.[`${chave}_etapa${i + 2}`])
        : opcoes.find((o) => !ultimaOpcao || o.id === ultimaOpcao);
    escolher(J, run, eventoId, opcao.id);
    assert.equal(ganhou(run, `cadeia_${chave}`), i === 3);
  });
}

test("as adições têm 30 conquistas, sem IDs repetidos ou títulos de histórias incorretos", () => {
  const { J } = preparar();
  assert.equal(J.conquistas.lista.length, 121);
  assert.equal(new Set(J.conquistas.lista.map((c) => c.id)).size, 121);
  assert.equal(J.conquistas.lista.filter((c) => c.categoria).length, 30);
  for (const [chave, eventos] of cadeias) {
    const conquista = J.conquistas.lista.find((c) => c.id === `cadeia_${chave}`);
    assert.ok(conquista.descricao.includes(J.eventoPorId(eventos[0]).titulo));
  }
});

test("cada presságio concede e salva sua conquista ao cumprir o prazo, sem repetir o aviso", () => {
  const { J } = preparar();
  for (const item of J.pressagios.catalogo) {
    const run = nova(J);
    assert.equal(J.pressagios.anunciar(run, item.id, true), true);
    J.legado.avaliar(run);
    assert.equal(ganhou(run, `pressagio_${item.id}`), false);
    J.pressagios.confirmar(run);
    const p = run.pressagios.atual;
    if (item.id === "cometa_cinzas") run.atributos.gold = 30;
    if (item.id === "nuvem_faminta") p.progresso.gasto = 15;
    if (item.id === "ferrugem_negra")
      run.atributos.escudo += Math.max(2, Math.ceil(p.referencias.escudo * 0.5));
    if (item.id === "corvos") p.progresso.honra = 50;
    if (item.id === "noite_lamento") run.atributos.habitantes += 20;
    if (item.id === "procissao") p.progresso.auxilios = 12;
    if (item.id === "vinda_barao") p.progresso.gold = 40;
    run.rodada = p.fim;
    assert.equal(J.pressagios.resolver(run), true, item.id);
    assert.equal(p.resultado.sucesso, true, item.id);
    const id = `pressagio_${item.id}`;
    assert.ok(ganhou(run, id), id);
    assert.ok(J.save.lerLegado().conquistasDesbloqueadas.includes(id), id);
    J.legado.avaliar(run);
    assert.equal(J.pressagios.resolver(run), false);
    assert.equal(run.avisosConquistas.filter((c) => c === id).length, 1);
    assert.equal(ganhou(run, "pressagios_todos_superados"), item === J.pressagios.catalogo.at(-1));
  }
  const { J: recarregado } = preparar();
  assert.equal(recarregado.save.importar(J.save.exportar()), true);
  const run = nova(recarregado);
  recarregado.legado.avaliar(run);
  assert.equal(run.avisosConquistas.length, 0);
  assert.ok(recarregado.save.lerLegado().conquistasDesbloqueadas.includes("pressagios_todos_superados"));
});

test("presságios fracassados ou cancelados não contam para a coleção", () => {
  const { J } = preparar();
  const run = nova(J);
  J.pressagios.anunciar(run, "cometa_cinzas", true);
  J.pressagios.confirmar(run);
  run.atributos.gold = 29;
  run.rodada = run.pressagios.atual.fim;
  J.pressagios.resolver(run);
  assert.equal(run.pressagios.atual.resultado.sucesso, false);
  assert.equal(ganhou(run, "pressagio_cometa_cinzas"), false);
  run.pressagios.historico.push({ id: "noite_lamento", rodada: run.rodada, sucesso: null });
  J.legado.avaliar(run);
  assert.equal(ganhou(run, "pressagio_noite_lamento"), false);
  assert.equal(ganhou(run, "pressagios_todos_superados"), false);
});

test("as sete histórias exigem quatro encontros e completam a coleção entre partidas", () => {
  const { J } = preparar();
  for (const [chave, eventos] of cadeias) {
    const run = nova(J);
    completar(J, run, chave, eventos);
    assert.equal(ganhou(run, "cadeias_sete_historias"), chave === "caravana_teceles");
    assert.ok(J.save.lerLegado().conquistasDesbloqueadas.includes(`cadeia_${chave}`));
  }
});

test("abandonar nos três primeiros encontros não concede a conquista de conclusão", () => {
  for (const [chave, eventos] of cadeias) {
    for (let abandono = 0; abandono < 3; abandono++) {
      const { J } = preparar();
      if (!J.eventoPorId(eventos[abandono]).opcoes.some((o) => o.flags?.[`${chave}_encerrada`])) continue;
      const run = nova(J);
      for (let i = 0; i <= abandono; i++) {
        const opcoes = J.eventoPorId(eventos[i]).opcoes;
        const opcao = opcoes.find((o) =>
          i === abandono ? o.flags?.[`${chave}_encerrada`] : o.flags?.[`${chave}_etapa${i + 2}`],
        );
        escolher(J, run, eventos[i], opcao.id);
      }
      assert.equal(run.flags[`${chave}_encerrada`], true);
      assert.equal(ganhou(run, `cadeia_${chave}`), false, `${chave}:${abandono}`);
      assert.equal(ganhou(run, "cadeias_sete_historias"), false);
    }
  }
});

const visoes = [
  {
    id: "mercurio",
    inicio: ["cambista_sem_balanca", "seguir_cambista"],
    aceitar: ["vidro_sob_palpebra", "aceitar_lente"],
    meio: "primeira_conta",
    continuar: "comprar_pocao_cambista",
    abandonar: "deixar_estrada",
    fim: "peso_da_visao",
    remover: "retirar_lente",
    manter: "manter_lente",
  },
  {
    id: "mil_nomes",
    inicio: ["olho_no_reboco", "examinar_olho"],
    aceitar: ["olho_dos_mil_nomes", "aceitar_olho_nomes"],
    meio: "fila_no_portao",
    continuar: "acolher_familia_olho",
    abandonar: "recusar_oraculo",
    fim: "olho_pede_silencio",
    remover: "remover_olho_nomes",
    manter: "aceitar_olho_nomes",
  },
];
test("as visões distinguem aceitar, encerrar cedo, remover e manter na decisão final", () => {
  for (const visao of visoes) {
    for (const desfecho of ["abandonar", "remover", "manter"]) {
      const { J } = preparar();
      const run = nova(J);
      escolher(J, run, ...visao.inicio);
      assert.equal(ganhou(run, `visao_${visao.id}_aceita`), false);
      escolher(J, run, ...visao.aceitar);
      assert.ok(ganhou(run, `visao_${visao.id}_aceita`));
      escolher(J, run, visao.meio, visao[desfecho === "abandonar" ? "abandonar" : "continuar"]);
      if (desfecho !== "abandonar") {
        run.rodada += 16;
        escolher(J, run, visao.fim, visao[desfecho]);
      }
      assert.equal(ganhou(run, `visao_${visao.id}_removida`), desfecho === "remover");
      assert.equal(ganhou(run, `visao_${visao.id}_mantida`), desfecho === "manter");
    }
  }
});

test("duas visões exigem efeitos simultâneos na mesma partida", () => {
  const { J } = preparar();
  const run = nova(J);
  for (const visao of visoes) {
    escolher(J, run, ...visao.inicio);
    escolher(J, run, ...visao.aceitar);
  }
  assert.ok(ganhou(run, "visoes_simultaneas"));
  const { J: outroJogo } = preparar();
  const legado = outroJogo.legado.vazio();
  legado.conquistasDesbloqueadas = ["visao_mercurio_aceita", "visao_mil_nomes_aceita"];
  const outra = nova(outroJogo, legado);
  outroJogo.legado.avaliar(outra);
  assert.equal(ganhou(outra, "visoes_simultaneas"), false);
});

test("as novas obras concedem conquista somente quando construídas", () => {
  for (const [chave, estrutura, opcao] of [
    ["aprendizes_cisterna", "cisterna_comunitaria", "construir_cisterna"],
    ["caravana_teceles", "entreposto_comercial", "construir_entreposto"],
  ]) {
    const { J } = preparar();
    const run = nova(J);
    J.legado.avaliar(run);
    assert.equal(ganhou(run, `obra_${estrutura}`), false);
    completar(J, run, chave, cadeias.find(([id]) => id === chave)[1], opcao);
    assert.ok(run.construcoes.includes(estrutura));
    assert.ok(ganhou(run, `obra_${estrutura}`));
  }
});

test("os encontros novos do Norte acumulam as quatro bênçãos e as quatro ameaças entre crônicas", () => {
  const { J } = preparar();
  for (const [conquista, eventos] of [
    ["norte_quatro_bencaos", ["bencao_baldr", "bencao_frigg", "bencao_heimdall", "bencao_freyr"]],
    ["norte_quatro_ameacas", ["maldicao_jormungand", "maldicao_fenrir", "maldicao_hrym", "maldicao_nidhogg"]],
  ]) {
    let legado = J.legado.vazio();
    eventos.forEach((id, i) => {
      const run = nova(J, legado);
      run.flags.passiva_bencao = true;
      run.flags.passiva_maldicao = true;
      J.legado.avaliar(run);
      assert.equal(ganhou(run, conquista), false);
      J.engine.registrarSorteio(run, J.eventoPorId(id));
      J.legado.avaliar(run);
      assert.equal(ganhou(run, conquista), i === 3);
      legado = J.legado.mesclar(legado, run.conquistas);
    });
  }
});
