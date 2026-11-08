(function () {
  "use strict";
  const Jogo = window.Jogo;
  const nomeTraco = {
    ...Object.fromEntries(Object.entries(Jogo.herdeiros.novos).map(([id, h]) => [id, h.nome])),
    corajoso: "A herdeira corajosa",
    avarento: "O herdeiro avarento",
    doente: "O herdeiro doente",
    druida_herdeiro: "O Druida-Herdeiro",
    menino_cronista: "O Conselheiro",
  };
  const condicoes = [
    ["licantropia", "licantropia", "A fera desperta"],
    ["vampirismo", "vampirismo", "A sede antiga"],
    ["possessao", "possessao", "Uma voz por dentro"],
  ];
  const herdeiros = [
    "corajoso",
    "avarento",
    "doente",
    "druida_herdeiro",
    "menino_cronista",
    "heroi_do_povo",
    ...Object.keys(Jogo.herdeiros.novos),
  ];
  const estruturas = [
    "ponte",
    "moinho",
    "capela",
    "forja",
    "muralha",
    "mercado_coberto",
    "torre_vigia",
    "enfermaria_ervateira",
    "praca_forca",
    "celeiro",
  ];
  const especiaisVistos = (run, eventos) => {
    const vistos = { ...(run.legadoDaRun?.flags || {}), ...(run.conquistas?.flags || {}) };
    return eventos.length > 0 && eventos.every((evento) => vistos[`visto_${evento.id}`] === true);
  };
  const transformacoesVistas = (run) => {
    const vistos = { ...(run.legadoDaRun?.flags || {}), ...(run.conquistas?.flags || {}) };
    return condicoes.every(([id]) => vistos[`transformacao_vista_${id}`] === true);
  };
  const progressoLegado = (run) => ({ ...(run.legadoDaRun?.flags || {}), ...(run.conquistas?.flags || {}) });
  const todosHerdeirosVenceram = (run) =>
    herdeiros.every((id) => progressoLegado(run)[`herdeiro_vitorioso_${id}`] === true);
  const todosCompanheirosDoDruida = (run) =>
    ["lobo", "corvo", "cervo"].every((id) => progressoLegado(run)[`companheiro_visto_${id}`] === true);
  const raridades = [...new Set(Jogo.itens.map((item) => item.raridade).filter(Boolean))];
  const zodiacos = Jogo.eventos.filter((evento) => evento.zodiaco);
  const deusesNordicos = Jogo.eventos.filter((evento) => evento.divino);
  const novosPressagios = [
    ["lua_vermelha", "Uma noite sem luto", "A Lua Vermelha"],
    ["cometa_cinzas", "Cinzas sobre o cofre", "O Cometa de Cinzas"],
    ["nuvem_faminta", "A colheita resistiu", "A Nuvem Faminta"],
    ["ferrugem_negra", "Ferro que não cede", "A Ferrugem Negra"],
    ["corvos", "Uma pena por resposta", "Os corvos"],
    ["noite_lamento", "Mais vozes ao amanhecer", "A Noite do Lamento"],
    ["procissao", "Portas abertas", "A Procissão sem Rostos"],
    ["vinda_barao", "Os cofres ficaram", "A Vinda do Barão"],
    ["sombra_coroada", "Um trono sem clemência", "A Sombra Coroada"],
    ["testemunha_pedra", "As mãos limpas", "A Testemunha de Pedra"],
  ];
  const novasCadeias = [
    ["carta_navegacao", "A última marca do mapa", "Uma carta na encadernação"],
    ["oficio_vidreiro", "Vidro contra o frio", "Cacos sob a cinza"],
    ["pomar_sem_placa", "A primeira colheita", "Frutos no terreno baldio"],
    ["livro_dividas", "A dívida teve resposta", "Uma página no fundo do baú"],
    ["posto_sinais", "Um sinal na colina", "A lanterna na colina"],
    ["aprendizes_cisterna", "Água para a vila", "O desenho no barril"],
    ["caravana_teceles", "O último fio", "O tear desmontado"],
  ];
  const venceuPressagio = (run, id) =>
    run.pressagios?.historico?.some((registro) => registro.id === id && registro.sucesso === true) === true;
  const completouCadeia = (run, id) =>
    run.flags?.[`${id}_etapa4`] === true && run.flags?.[`${id}_encerrada`] === true;
  const conquistouAntes = (run, id, contexto) =>
    contexto?.desbloqueadas?.has(id) === true ||
    run.legadoDaRun?.conquistasDesbloqueadas?.includes(id) === true ||
    run.conquistas?.conquistasDesbloqueadas?.includes(id) === true;
  const chegouAoFimDaVisao = (run, id, flagFinal, manter) =>
    run.flags?.[`${id}_etapa4`] === true &&
    run.flags?.[flagFinal] === true &&
    run.flags?.[`${id}_ativo`] === manter;
  const encontrosVistos = (run, ids) => {
    const vistos = progressoLegado(run);
    return ids.every((id) => vistos[`visto_${id}`] === true);
  };
  const conquistasRecentes = [
    ...novosPressagios.map(([id, nome, pressagio]) => ({
      id: `pressagio_${id}`,
      nome,
      descricao: `Encerre “${pressagio}” com sucesso.`,
      categoria: "pressagios",
      condicao: (run) => venceuPressagio(run, id),
    })),
    {
      id: "pressagios_todos_superados",
      nome: "O amanhã foi outro",
      descricao: "Supere os dez Maus Presságios. O progresso acumula entre crônicas.",
      categoria: "pressagios",
      condicao: (run, contexto) =>
        novosPressagios.every(
          ([id]) => venceuPressagio(run, id) || conquistouAntes(run, `pressagio_${id}`, contexto),
        ),
    },
    ...novasCadeias.map(([id, nome, inicio]) => ({
      id: `cadeia_${id}`,
      nome,
      descricao: `Conclua os quatro encontros da história iniciada em “${inicio}”.`,
      categoria: "historias",
      condicao: (run) => completouCadeia(run, id),
    })),
    {
      id: "cadeias_sete_historias",
      nome: "Histórias levadas ao fim",
      descricao:
        "Conclua as histórias da carta, do vidro, do pomar, das dívidas, dos sinais, da cisterna e dos tecelões. O progresso acumula entre crônicas.",
      categoria: "historias",
      condicao: (run, contexto) =>
        novasCadeias.every(
          ([id]) => completouCadeia(run, id) || conquistouAntes(run, `cadeia_${id}`, contexto),
        ),
    },
    {
      id: "visao_mercurio_aceita",
      nome: "Ver o preço de tudo",
      descricao: "Aceite a lente e ative os Olhos de Mercúrio.",
      categoria: "transformacoes",
      condicao: (run) => run.flags?.olhos_mercurio_ativo === true,
    },
    {
      id: "visao_mercurio_removida",
      nome: "Só os próprios olhos",
      descricao: "Retire a lente de Mercúrio em “O peso da visão”.",
      categoria: "transformacoes",
      condicao: (run) => chegouAoFimDaVisao(run, "olhos_mercurio", "olhos_mercurio_encerrada", false),
    },
    {
      id: "visao_mercurio_mantida",
      nome: "O preço de continuar vendo",
      descricao: "Chegue à decisão final dos Olhos de Mercúrio e escolha manter a lente.",
      categoria: "transformacoes",
      condicao: (run) => chegouAoFimDaVisao(run, "olhos_mercurio", "olhos_mercurio_encerrada", true),
    },
    {
      id: "visao_mil_nomes_aceita",
      nome: "Os nomes antes da chegada",
      descricao: "Aceite e ative o Olho dos Mil Nomes.",
      categoria: "transformacoes",
      condicao: (run) => run.flags?.olho_mil_nomes_ativo === true,
    },
    {
      id: "visao_mil_nomes_removida",
      nome: "O silêncio dos nomes",
      descricao: "Remova a relíquia em “O olho pede silêncio”.",
      categoria: "transformacoes",
      condicao: (run) => chegouAoFimDaVisao(run, "olho_mil_nomes", "olho_mil_nomes_encerrado", false),
    },
    {
      id: "visao_mil_nomes_mantida",
      nome: "Uma voz que fica",
      descricao: "Chegue à decisão final do Olho dos Mil Nomes e escolha conservar a relíquia.",
      categoria: "transformacoes",
      condicao: (run) => chegouAoFimDaVisao(run, "olho_mil_nomes", "olho_mil_nomes_encerrado", true),
    },
    {
      id: "visoes_simultaneas",
      nome: "Duas maneiras de ver",
      descricao: "Mantenha os Olhos de Mercúrio e o Olho dos Mil Nomes ativos ao mesmo tempo.",
      categoria: "transformacoes",
      condicao: (run) => run.flags?.olhos_mercurio_ativo === true && run.flags?.olho_mil_nomes_ativo === true,
    },
    {
      id: "obra_cisterna_comunitaria",
      nome: "Água de reserva",
      descricao: "Construa a Cisterna comunitária na história dos aprendizes.",
      categoria: "vila",
      condicao: (run) => run.construcoes?.includes("cisterna_comunitaria") === true,
    },
    {
      id: "obra_entreposto_comercial",
      nome: "Um lugar para trocar",
      descricao: "Construa o Entreposto comercial ao concluir a história dos tecelões.",
      categoria: "vila",
      condicao: (run) => run.construcoes?.includes("entreposto_comercial") === true,
    },
    {
      id: "norte_quatro_bencaos",
      nome: "Quatro bênçãos do Norte",
      descricao: "Veja os encontros de Baldr, Frigg, Heimdall e Freyr. O progresso acumula entre crônicas.",
      categoria: "historias",
      condicao: (run) =>
        encontrosVistos(run, ["bencao_baldr", "bencao_frigg", "bencao_heimdall", "bencao_freyr"]),
    },
    {
      id: "norte_quatro_ameacas",
      nome: "Quando o Norte ameaça",
      descricao:
        "Veja os encontros de Jormungand, Fenrir, Hrym e Níðhöggr. O progresso acumula entre crônicas.",
      categoria: "historias",
      condicao: (run) =>
        encontrosVistos(run, ["maldicao_jormungand", "maldicao_fenrir", "maldicao_hrym", "maldicao_nidhogg"]),
    },
  ];
  const lista = [
    {
      id: "fortuna_do_leste",
      nome: "A fortuna atravessa o mar",
      descricao: Jogo.herdeiros.novos.herdeira_leste.desbloqueio,
      condicao: Jogo.herdeiros.condicoes.herdeira_leste,
    },
    {
      id: "chamado_nordico",
      nome: "Sob o olhar do Norte",
      descricao: Jogo.herdeiros.novos.herdeiro_nordico.desbloqueio,
      condicao: Jogo.herdeiros.condicoes.herdeiro_nordico,
    },
    {
      id: "culto_adaga_herdeiro",
      nome: "O preço da lâmina",
      descricao: "Como Herdeiro do Culto, sacrifique 5 seguidores com a adaga.",
      condicao: (run) => run.flags.adaga_herdeiro_culto === true,
    },
    {
      id: "leste_duas_estacoes",
      nome: "Duas visitas no mesmo ano",
      descricao: "Como Herdeira do Leste, resolva as duas visitas zodiacais de um ano.",
      condicao: (run) =>
        run.traco === "herdeira_leste" &&
        [1, 2, 3].some((ano) => run.calendarioLeste.filter((v) => v.ano === ano && v.resolvida).length === 2),
    },
    {
      id: "nordico_duas_faces",
      nome: "Entre favor e castigo",
      descricao: "Como Nórdico, receba uma passiva de bênção e uma de maldição na mesma crônica.",
      condicao: (run) =>
        run.traco === "herdeiro_nordico" && run.flags.passiva_bencao && run.flags.passiva_maldicao,
    },
    {
      id: "cronica_abissal",
      nome: "O que dormia acordou",
      descricao: "Conclua a crônica abissal.",
      condicao: (run) => run.flags?.abissal_5 === true,
    },
    {
      id: "entidade_resolvida",
      nome: "Um nome que não volta",
      descricao: "Resolva o encontro com a Entidade.",
      condicao: (run) => run.flags?.entidade_x_resolvida === true,
    },
    {
      id: "resistir_entidade",
      nome: "A vontade não se curva",
      descricao: "Resista à Entidade quando ela tentar tomar algo de você.",
      condicao: (run) => run.flags?.entidade_x_imune === true,
    },
    {
      id: "calice_concluido",
      nome: "O cálice e os dois caminhos",
      descricao: "Conclua a crônica do Cálice.",
      condicao: (run) => run.flags?.calice_5 === true,
    },
    {
      id: "culto_concluido",
      nome: "Três anos de devoção",
      descricao: "Atravesse três anos e vença sob o chamado do culto.",
      condicao: (run) => run.fim?.tipo === "vitoria_culto",
    },
    {
      id: "bosque_vivo",
      nome: "O bosque que permanece",
      descricao: "Conclua um ano de honra alta como Druida-Herdeiro.",
      condicao: (run) => run.conquistas?.objetivosConcluidos?.includes("bosque_vivo") === true,
    },
    {
      id: "menino_conselheiro",
      nome: "A memória da vila",
      descricao: "Acolha o órfão com honra e permita que ele se torne conselheiro.",
      condicao: (run) => run.flags?.menino_conselheiro === true,
    },
    ...[100, 200, 300].flatMap((valor) => [
      {
        id: `gold_${valor}`,
        nome: `Cofre ${valor}`,
        descricao: `Tenha ${valor} Gold ao mesmo tempo em uma crônica.`,
        condicao: (run) => run.atributos.gold >= valor,
      },
      {
        id: `habitantes_${valor}`,
        nome: `Vila de ${valor}`,
        descricao: `Tenha ${valor} habitantes ao mesmo tempo em uma crônica.`,
        condicao: (run) => run.atributos.habitantes >= valor,
      },
      {
        id: `seguidores_${valor}`,
        nome: `Culto de ${valor}`,
        descricao: `Reúna ${valor} Seguidores ao mesmo tempo em uma crônica.`,
        condicao: (run) => run.cultoAtivo === true && run.seguidoresCulto >= valor,
      },
    ]),
    ...[5, 10].map((valor) => ({
      id: `batalhas_vencidas_${valor}`,
      nome: valor === 5 ? "Cinco vitórias" : "Dez vitórias",
      descricao: `Vença ${valor} batalhas em uma mesma crônica.`,
      condicao: (run) => run.batalhasVencidas >= valor,
    })),
    {
      id: "cinco_compras_diferentes",
      nome: "O mercador já sabe seu nome",
      descricao: "Compre cinco mercadorias diferentes em uma crônica.",
      condicao: (run) => run.mercadoriasCompradas?.length >= 5,
    },
    {
      id: "tres_raridades",
      nome: "Coleção improvável",
      descricao: "Conquiste itens de três raridades diferentes em uma crônica.",
      condicao: (run) => {
        const adquiridas = new Set(run.itensConquistados || []);
        const raridadesAdquiridas = new Set(
          Jogo.itens
            .filter((item) => adquiridas.has(item.id) && raridades.includes(item.raridade))
            .map((item) => item.raridade),
        );
        return raridadesAdquiridas.size >= 3;
      },
    },
    {
      id: "ponte_e_caravana",
      nome: "Rodas sobre o rio",
      descricao: "Repare a ponte e receba uma caravana na vila.",
      condicao: (run) => run.flags?.ponte_reparada === true && run.flags?.caravana_recebida === true,
    },
    {
      id: "ponte_sem_pedagio",
      nome: "Uma estrada livre",
      descricao: "Repare a ponte, elimine o pedágio e receba uma caravana.",
      condicao: (run) =>
        run.flags?.ponte_reparada === true &&
        run.flags?.pedagio_abolido &&
        run.flags?.caravana_recebida === true,
    },
    {
      id: "sobrevive_nemesis",
      nome: "A memória não levou a última palavra",
      descricao: "Enfrente a Nêmesis da memória e sobreviva ao confronto.",
      condicao: (run) => run.flags?.nemesis_enfrentada_e_sobrevivida === true,
    },
    {
      id: "vitorias_com_todos_herdeiros",
      nome: "Toda a linhagem",
      descricao: `Vença uma crônica com cada um dos ${herdeiros.length} herdeiros. O progresso acumula entre crônicas.`,
      condicao: (run) => todosHerdeirosVenceram(run),
    },
    {
      id: "companheiros_druida",
      nome: "O bosque tem muitos olhos",
      descricao:
        "Conheça o Lobo, o Corvo e o Cervo como Druida-Herdeiro. O progresso acumula entre crônicas.",
      condicao: (run) => todosCompanheirosDoDruida(run),
    },
    {
      id: "barão_resolvido_sobreviveu",
      nome: "A última palavra ao barão",
      descricao: "Resolva a volta do barão e sobreviva ao encontro.",
      condicao: (run) => run.flags?.volta_barao_sobreviveu === true,
    },
    {
      id: "vitoria_sem_condicao",
      nome: "Sem pacto com a mudança",
      descricao: "Vença uma crônica sem abraçar nem curar uma condição sobrenatural.",
      condicao: (run) =>
        run.status === "encerrada" &&
        run.fim?.tipo?.startsWith("vitoria") &&
        run.flags?.condicao_abracada !== true &&
        run.flags?.condicao_curada !== true,
    },
    ...[100, 200].map((rodada) => ({
      id: `sobreviver_${rodada}`,
      nome: rodada === 100 ? "Um ano inteiro" : "Dois anos de vigília",
      descricao: `Chegue à rodada ${rodada} e sobreviva para continuar a crônica.`,
      condicao: (run) => run.status === "ativa" && run.rodada >= rodada,
    })),
    {
      id: "morte_devedor_barao",
      nome: "A dívida ficou para a vila",
      descricao: "Morra diante do cobrador do barão, deixando a dívida para o próximo herdeiro.",
      condicao: (run) =>
        run.status === "encerrada" && run.fim?.tipo === "derrota" && run.eventoId === "barao",
    },
    {
      id: "morte_jogo_dados",
      nome: "A aposta final",
      descricao: "Morra apostando o sangue no jogo de dados do velho cego.",
      condicao: (run) =>
        run.status === "encerrada" && run.fim?.tipo === "derrota" && run.eventoId === "dados_do_velho",
    },
    {
      id: "morte_travessia_gelo",
      nome: "Sob o gelo",
      descricao: "Morra tentando atravessar o lago congelado.",
      condicao: (run) =>
        run.status === "encerrada" && run.fim?.tipo === "derrota" && run.eventoId === "travessia_do_gelo",
    },
    ...conquistasRecentes,
    ...condicoes.flatMap(([id, flag, titulo]) => [
      {
        id: `condicao_${id}_abracada`,
        nome: `${titulo}: abraço`,
        descricao: `Abrace a condição sobrenatural de ${id === "possessao" ? "Possessão" : id}.`,
        condicao: (run) => run.flags?.[`condicao_abracada_${flag}`] === true,
      },
      {
        id: `condicao_${id}_curada`,
        nome: `${titulo}: cura`,
        descricao: `Encontre a cura para ${id === "possessao" ? "Possessão" : id}.`,
        condicao: (run) => run.flags?.[`condicao_curada_${flag}`] === true,
      },
    ]),
    {
      id: "primeira_transformacao",
      nome: "Abraçar a mudança",
      descricao: "Abrace pela primeira vez uma transformação sobrenatural.",
      condicao: (run) => condicoes.some(([id]) => run.flags?.[`condicao_abracada_${id}`] === true),
    },
    {
      id: "todas_transformacoes",
      nome: "Além da forma humana",
      descricao: "Abrace licantropia, vampirismo e possessão; o progresso acumula entre crônicas.",
      condicao: (run) => transformacoesVistas(run),
    },
    {
      id: "cinco_estruturas",
      nome: "Pedra sobre pedra",
      descricao: "Construa cinco estruturas diferentes em uma crônica.",
      condicao: (run) => estruturas.filter((id) => run.construcoes?.includes(id)).length >= 5,
    },
    {
      id: "todas_estruturas",
      nome: "A vila completa",
      descricao: "Construa todas as dez estruturas diferentes em uma crônica.",
      condicao: (run) => estruturas.every((id) => run.construcoes?.includes(id)),
    },
    {
      id: "todos_zodiacos",
      nome: "Sob os doze signos",
      descricao: "Veja todos os encontros do zodíaco chinês. O progresso acumula entre crônicas.",
      condicao: (run) => especiaisVistos(run, zodiacos),
    },
    {
      id: "todos_deuses_nordicos",
      nome: "Diante dos deuses do Norte",
      descricao: "Veja todos os encontros dos deuses nórdicos. O progresso acumula entre crônicas.",
      condicao: (run) => especiaisVistos(run, deusesNordicos),
    },
    ...[10, 15, 20].flatMap((valor) => [
      {
        id: `ataque_${valor}`,
        nome: `Golpe ${valor}`,
        descricao: `Alcance ${valor} de Ataque em uma crônica.`,
        condicao: (run) => run.atributos.ataque >= valor,
      },
      {
        id: `escudo_${valor}`,
        nome: `Muralha ${valor}`,
        descricao: `Alcance ${valor} de Escudo em uma crônica.`,
        condicao: (run) => run.atributos.escudo >= valor,
      },
    ]),
    ...Object.keys(nomeTraco).flatMap((traco) => [
      {
        id: `vitoria_${traco}_honra_alta`,
        nome: `${nomeTraco[traco]}: honra alta`,
        descricao: `Vença uma crônica com ${nomeTraco[traco]} e termine com Honra de pelo menos 30.`,
        condicao: (run) =>
          run.status === "encerrada" &&
          run.fim?.tipo?.startsWith("vitoria") &&
          run.atributos.honra >= 30 &&
          run.traco === traco,
      },
      {
        id: `vitoria_${traco}_honra_baixa`,
        nome: `${nomeTraco[traco]}: honra baixa`,
        descricao: `Vença uma crônica com ${nomeTraco[traco]} e termine com Honra de no máximo −30.`,
        condicao: (run) =>
          run.status === "encerrada" &&
          run.fim?.tipo?.startsWith("vitoria") &&
          run.atributos.honra <= -30 &&
          run.traco === traco,
      },
      ...(traco !== "menino_cronista"
        ? [
            {
              id: `vitoria_${traco}_honra_neutra`,
              nome: `${nomeTraco[traco]}: sem transformação`,
              descricao: `Vença uma crônica com ${nomeTraco[traco]} mantendo Honra entre −29 e +29 o tempo todo.`,
              condicao: (run) =>
                run.status === "encerrada" &&
                run.fim?.tipo?.startsWith("vitoria") &&
                run.honraSempreNeutra === true &&
                run.atributos.honra >= -29 &&
                run.atributos.honra <= 29 &&
                run.traco === traco,
            },
          ]
        : []),
    ]),
    // A Heroína do povo não entra em nomeTraco: honra baixa é impossível para ela.
    {
      id: "heroi_do_povo_vitoria_honra",
      nome: "A Heroína do povo: honra alta",
      descricao: "Vença uma crônica com A Heroína do povo e termine com Honra de pelo menos 30.",
      condicao: (run) =>
        run.status === "encerrada" &&
        run.fim?.tipo?.startsWith("vitoria") &&
        run.atributos.honra >= 30 &&
        run.traco === "heroi_do_povo",
    },
    {
      id: "heroi_do_povo_vitoria_honra_neutra",
      nome: "A Heroína do povo: sem transformação",
      descricao: "Vença uma crônica com A Heroína do povo mantendo Honra entre −29 e +29 o tempo todo.",
      condicao: (run) =>
        run.status === "encerrada" &&
        run.fim?.tipo?.startsWith("vitoria") &&
        run.honraSempreNeutra === true &&
        run.atributos.honra >= -29 &&
        run.atributos.honra <= 29 &&
        run.traco === "heroi_do_povo",
    },
    {
      id: "heroi_do_povo_chamado",
      nome: "A Heroína do povo: o chamado",
      descricao: "Sendo a Heroína do povo, aceite o convite do culto.",
      condicao: (run) => run.traco === "heroi_do_povo" && Number.isSafeInteger(run.marcos?.cultoAdesao),
    },
  ];

  function avaliar(run) {
    if (!run || !run.atributos) return [];
    if (run.status === "encerrada" && run.fim?.tipo?.startsWith("vitoria")) {
      Jogo.legado.conceder(run, { flags: [`herdeiro_vitorioso_${run.traco}`] });
    }
    for (const [id] of condicoes) {
      if (run.flags?.[`condicao_abracada_${id}`] === true) {
        Jogo.legado.conceder(run, { flags: [`transformacao_vista_${id}`] });
      }
    }
    // As transformações descobertas em crônicas anteriores ficam registradas no
    // legado; a terceira espécie pode completar a coleção numa run diferente.
    const legadoSalvo = Jogo.save?.lerLegado?.();
    const jaDesbloqueadas = new Set([
      ...(run.legadoDaRun?.conquistasDesbloqueadas || []),
      ...(legadoSalvo?.conquistasDesbloqueadas || []),
      ...(run.conquistas?.conquistasDesbloqueadas || []),
    ]);
    const contexto = { desbloqueadas: jaDesbloqueadas };
    const novas = lista.filter(
      (conquista) => !jaDesbloqueadas.has(conquista.id) && conquista.condicao(run, contexto),
    );
    if (!novas.length) return [];
    run.conquistas = Jogo.legado.mesclar(run.conquistas, {
      versao: 1,
      conquistasDesbloqueadas: novas.map((conquista) => conquista.id),
    });
    Jogo.save?.registrarConquistas(
      run,
      novas.map((conquista) => conquista.id),
    );
    run.avisosConquistas ||= [];
    for (const conquista of novas) {
      run.avisosConquistas.push(conquista.id);
    }
    return novas;
  }

  Jogo.conquistas = { lista, avaliar };
})();
