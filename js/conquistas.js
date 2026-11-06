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
      descricao: "Vença uma crônica com cada um dos seis herdeiros. O progresso acumula entre crônicas.",
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
    const jaDesbloqueadas = new Set(run.conquistas?.conquistasDesbloqueadas || []);
    const novas = lista.filter((conquista) => !jaDesbloqueadas.has(conquista.id) && conquista.condicao(run));
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
