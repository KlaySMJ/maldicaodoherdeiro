(function () {
  "use strict";
  const Jogo = window.Jogo;

  const eventos = [
    {
      id: "sopro_da_primavera",
      titulo: "O primeiro sopro",
      tipo: "encontro",
      peso: 1.5,
      oncePerRun: true,
      requisitos: { estacao: "primavera", rodadaMin: 5 },
      imagem: "assets/eventos-sistemas/primavera.webp",
      imagemAlt: "Sementes despertam na primeira luz da primavera",
      texto: "O degelo revela sementes que ninguém lembra de plantar.",
      informacoes:
        "As famílias esperam que a terra dê uma resposta antes da próxima geada. Há tempo para semear, vender ou descobrir quem deixou os grãos no campo.",
      opcoes: [
        {
          id: "semear",
          texto: "Repartir as sementes entre as famílias.",
          efeitos: { habitantes: 3, honra: 2 },
          resultado: "Cada casa guarda uma parte. O campo volta a ter vozes antes de ter brotos.",
        },
        {
          id: "vender",
          texto: "Levar os grãos à estrada e negociar.",
          testeSorte: {
            chance: 55,
            sucesso: {
              efeitos: { gold: 6, honra: 1 },
              resultado:
                "Um comprador paga pela colheita adiantada e leva a notícia de que a vila ainda tem futuro.",
            },
            falha: {
              efeitos: { gold: -2, habitantes: -2 },
              resultado:
                "A chuva apodrece parte dos grãos no caminho. Duas famílias partem sem esperar nova oferta.",
            },
          },
        },
      ],
    },
    {
      id: "poeira_do_verao",
      titulo: "Poeira nos telhados",
      tipo: "encontro",
      peso: 1.5,
      oncePerRun: true,
      requisitos: { estacao: "verao", rodadaMin: 5 },
      imagem: "assets/eventos-sistemas/verao.webp",
      imagemAlt: "O sol do verão cai sobre os telhados e a estrada seca",
      texto: "O calor fecha a estrada antes do meio-dia.",
      informacoes:
        "Os viajantes pedem água; os lavradores, sombra para a colheita que ainda não terminou. Uma pausa pode preservar a vila. Uma aposta pode render mais do que a água custa.",
      opcoes: [
        {
          id: "cisterna",
          texto: "Abrir a cisterna para todos.",
          efeitos: { hp: 7, honra: 2, gold: -1 },
          resultado: "A fila avança devagar. Ao cair da tarde, ninguém precisou deixar a estrada por sede.",
        },
        {
          id: "pedagio",
          texto: "Cobrar pela água e pelo abrigo.",
          testeSorte: {
            chance: 50,
            sucesso: {
              efeitos: { gold: 5, honra: -2 },
              resultado: "Os viajantes pagam sem reclamar, mas seguem antes que a vila esfrie.",
            },
            falha: {
              efeitos: { gold: -2, habitantes: -2, honra: -1 },
              resultado: "A cisterna perde água por uma rachadura. Duas famílias culpam a cobrança e partem.",
            },
          },
        },
      ],
    },
    {
      id: "ultima_colheita_tardia",
      titulo: "A última fileira",
      tipo: "encontro",
      peso: 1.5,
      oncePerRun: true,
      requisitos: { estacao: "outono", rodadaMin: 5 },
      imagem: "assets/eventos-sistemas/outono.webp",
      imagemAlt: "Uma fileira de colheita permanece de pé sob folhas caídas",
      texto: "Uma fileira inteira ficou de pé enquanto o resto foi recolhido.",
      informacoes:
        "O feitor diz que o campo está cansado; uma velha responde que ainda há pão ali. A última parte da colheita pode alimentar a vila ou pagar suas dívidas.",
      opcoes: [
        {
          id: "guardar",
          texto: "Guardar a colheita para o inverno.",
          efeitos: { habitantes: 2, honra: 2 },
          resultado:
            "Os sacos vão para o celeiro comum. As famílias prometem abrir as portas quando chegar a geada.",
        },
        {
          id: "cortar",
          texto: "Colher depressa antes que chova.",
          testeSorte: {
            chance: 55,
            sucesso: {
              efeitos: { gold: 5, habitantes: 1 },
              resultado:
                "A chuva espera. A colheita chega seca à estrada e um comprador paga o preço combinado.",
            },
            falha: {
              efeitos: { hp: -6, habitantes: -2 },
              resultado:
                "O barro prende as carroças. O campo é salvo pela metade, e duas famílias deixam o trabalho.",
            },
          },
        },
      ],
    },
    {
      id: "lenha_da_vigilia",
      titulo: "A lenha da vigília",
      tipo: "encontro",
      peso: 1.5,
      oncePerRun: true,
      requisitos: { estacao: "inverno", rodadaMin: 5 },
      imagem: "assets/eventos-sistemas/inverno.webp",
      imagemAlt: "Lenha empilhada para manter a vigília durante o inverno",
      texto: "A lenha da capela acabou antes da última noite de vigília.",
      informacoes:
        "O padre pede ajuda; os guardas lembram que a muralha também precisa de fogo. O frio vai cobrar de alguém antes do amanhecer.",
      opcoes: [
        {
          id: "partilhar",
          texto: "Dividir a lenha entre a capela e os guardas.",
          efeitos: { hp: 5, honra: 2 },
          resultado:
            "O fogo dura pouco, mas alcança os dois lados da muralha. Ninguém passa a noite sozinho.",
        },
        {
          id: "cortar",
          texto: "Buscar lenha no bosque antes do escuro.",
          testeSorte: {
            chance: 50,
            sucesso: {
              efeitos: { gold: 3, honra: 2 },
              resultado: "Você encontra madeira seca e uma bolsa esquecida entre as raízes.",
            },
            falha: {
              efeitos: { hp: -9, habitantes: -2 },
              resultado:
                "A geada fecha a trilha. Você retorna ferido, e duas famílias não conseguem esperar pelo fogo.",
            },
          },
        },
      ],
    },
    {
      id: "bandeira_sem_pano",
      titulo: "A bandeira sem pano",
      tipo: "batalha",
      peso: 1,
      oncePerRun: true,
      requisitos: { tracos: "corajoso", rodadaMin: 15 },
      imagem: "assets/batalha.webp",
      imagemAlt: "Guardas aguardam junto ao portão para defender a vila",
      texto: "Os guardas treinam com uma bandeira rasgada.",
      informacoes:
        "Quando um bando cruza a estrada, ninguém olha para o capitão: olham para você. O desafio pode fortalecer a guarda ou custar caro a quem vai à frente.",
      batalha: {
        defesa: 6,
        vitoria: {
          dano: 6,
          efeitos: { ataque: 1, honra: 2 },
          resultado: "A guarda acompanha seu avanço. A bandeira volta ao portão com um remendo novo.",
        },
        derrota: {
          dano: 12,
          efeitos: { honra: -1 },
          resultado: "Você recua antes que a linha se rompa. Os guardas retomam o treino em silêncio.",
        },
      },
      opcoes: [
        { id: "avancar", texto: "Ir à frente e enfrentar o bando.", combate: true },
        {
          id: "formar_linha",
          texto: "Manter a linha e proteger os guardas.",
          efeitos: { escudo: 1, habitantes: -1 },
          resultado:
            "A guarda segura o portão. Um ferimento leve no braço vira motivo de orgulho antes do jantar.",
        },
      ],
    },
    {
      id: "cofre_de_pedra",
      titulo: "O cofre de pedra",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      requisitos: { tracos: "avarento", rodadaMin: 15 },
      imagem: "assets/sussurro-do-ouro.webp",
      imagemAlt: "Uma moeda antiga repousa sobre a pedra de um cofre esquecido",
      texto: "Uma rachadura no cofre revela um compartimento que não aparece nos mapas.",
      informacoes:
        "O administrador pede que você não conte aos guardas. A pedra pode esconder uma reserva ou estar sustentando mais do que o cofre.",
      opcoes: [
        {
          id: "abrir",
          texto: "Forçar a pedra e procurar a reserva.",
          testeSorte: {
            chance: 55,
            sucesso: {
              efeitos: { gold: 7, honra: -1 },
              resultado:
                "O compartimento guarda moedas antigas. Você as conta duas vezes antes de fechar a pedra.",
            },
            falha: {
              efeitos: { gold: -3, hp: -5 },
              resultado: "A pedra cede e prende a mão do administrador. O conserto custa mais que a reserva.",
            },
          },
        },
        {
          id: "selar",
          texto: "Selar a rachadura sem abrir o cofre.",
          efeitos: { escudo: 1, honra: 2, gold: -2 },
          resultado:
            "A parede fica firme. O administrador continua desconfiado, mas passa a confiar no seu silêncio.",
        },
      ],
    },
    {
      id: "erva_do_inverno",
      titulo: "A erva que não dorme",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      requisitos: { tracos: "doente", rodadaMin: 15 },
      imagem: "assets/ervas.webp",
      imagemAlt: "Ervas medicinais secam em feixes junto ao fogo",
      texto: "A ervateira encontra uma planta verde sob a neve.",
      informacoes:
        "Diz que ela pode aliviar sua febre, mas só se for colhida antes do degelo. A dose pode ajudar o herdeiro ou atrair quem conhece o mesmo remédio.",
      opcoes: [
        {
          id: "tomar",
          texto: "Tomar a primeira dose e guardar o resto.",
          testeSorte: {
            chance: 60,
            sucesso: {
              efeitos: { hp: 15, escudo: 1 },
              resultado:
                "O calor volta aos dedos. A ervateira guarda o restante para quando a febre regressar.",
            },
            falha: {
              efeitos: { hp: -8, habitantes: -1 },
              resultado:
                "A planta estava amarga demais. A ervateira cuida de você enquanto uma ajudante decide partir.",
            },
          },
        },
        {
          id: "repartir",
          texto: "Repartir as folhas com quem está doente.",
          efeitos: { hp: 5, habitantes: 2, honra: 2 },
          resultado:
            "A dose é fraca para todos, mas ninguém precisa escondê-la. Duas famílias permanecem perto da ervateira.",
        },
      ],
    },
    {
      id: "assembleia_das_raizes",
      titulo: "A assembleia das raízes",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      requerDesbloqueio: "assembleia_das_raizes",
      requisitos: { tracos: "druida_herdeiro" },
      imagem: "assets/arvore-que-pede.webp",
      imagemAlt: "Raízes antigas cercam uma clareira onde a vila se reúne",
      texto: "As raízes do bosque formam um círculo ao redor de uma clareira.",
      informacoes:
        "As famílias esperam que você diga se a terra será protegida ou dividida. A máscara do cervo abre a conversa, mas a decisão ainda pertence à vila.",
      opcoes: [
        {
          id: "proteger",
          texto: "Declarar a clareira parte do bosque sagrado.",
          efeitos: { honra: 5, habitantes: 2 },
          resultado:
            "As raízes não avançam sobre as casas. A vila passa a colher apenas o que o bosque oferece.",
        },
        {
          id: "partilhar",
          texto: "Dividir a clareira entre lavoura e bosque.",
          testeSorte: {
            chance: 50,
            sucesso: {
              efeitos: { gold: 6, habitantes: 2 },
              resultado: "A primeira colheita cresce junto às raízes e rende mais do que o esperado.",
            },
            falha: {
              efeitos: { honra: -3, habitantes: -2 },
              resultado:
                "A terra cede sob o arado. Duas famílias deixam o bosque antes que a disputa recomece.",
            },
          },
        },
      ],
    },
    {
      id: "parede_de_nomes",
      titulo: "A parede de nomes",
      tipo: "encontro",
      peso: 1.2,
      requisitos: { rodadaMin: 35 },
      imagem: "assets/eventos-sistemas/tumulo.webp",
      imagemAlt: "Nomes de antigos moradores aparecem gravados numa parede de pedra",
      texto: "Uma parede atrás do salão guarda nomes de famílias que viveram aqui antes do seu avô.",
      informacoes:
        "Alguns ainda são pronunciados à mesa. A pedra pode registrar os vivos ou voltar a ser apenas parte da muralha.",
      opcoes: [
        {
          id: "restaurar",
          texto: "Pagar o pedreiro para restaurar os nomes · 3 Gold.",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, honra: 3 },
          resultado:
            "O pedreiro recompõe as letras que ainda podem ser lidas. Naquela noite, cada família conta uma história antiga.",
        },
        {
          id: "procurar",
          texto: "Buscar uma inscrição que tenha valor para o cofre.",
          testeSorte: {
            chance: 45,
            sucesso: {
              efeitos: { gold: 8, honra: -2 },
              resultado: "Uma placa escondida atrás dos nomes contém o selo de um antigo cobrador.",
            },
            falha: {
              efeitos: { hp: -4, honra: -1 },
              resultado: "A parede desaba antes de revelar qualquer coisa. O pedreiro escapa por pouco.",
            },
          },
        },
      ],
    },
    {
      id: "ponte_de_taboas",
      titulo: "A ponte de tábuas",
      tipo: "encontro",
      peso: 1.2,
      requisitos: { rodadaMin: 55, flagsAusentes: ["ponte_de_taboas_resolvida"] },
      imagem: "assets/ponte.webp",
      imagemAlt: "Tábuas estreitas sustentam uma passagem sobre o rio",
      texto: "As tábuas antigas da ponte rangem quando passa a primeira carroça.",
      informacoes:
        "O rio está cheio e os viajantes não têm outro caminho. Reparar a travessia custa tempo; cruzá-la às pressas pode custar mais.",
      opcoes: [
        {
          id: "reparar",
          texto: "Reforçar as tábuas · 4 Gold.",
          requisitos: { goldMin: 4 },
          efeitos: { gold: -4, habitantes: 3, honra: 2 },
          flags: { ponte_de_taboas_resolvida: true },
          resultado: "As carroças passam uma a uma. Três viajantes ficam para ajudar na próxima obra.",
        },
        {
          id: "cruzar",
          texto: "Atravessar antes que o rio suba.",
          testeSorte: {
            chance: 50,
            sucesso: {
              efeitos: { gold: 5, habitantes: 2 },
              flags: { ponte_de_taboas_resolvida: true },
              resultado: "A carroça chega ao outro lado e deixa parte da carga como pagamento.",
            },
            falha: {
              efeitos: { hp: -10, habitantes: -2 },
              flags: { ponte_de_taboas_resolvida: true },
              resultado:
                "Uma tábua se solta no meio da travessia. Você volta ferido, e duas famílias não esperam pelo conserto.",
            },
          },
        },
      ],
    },
    {
      id: "fogo_sob_a_geada",
      titulo: "Fogo sob a geada",
      tipo: "desordem",
      peso: 1.2,
      requisitos: { rodadaMin: 75, estacao: "inverno" },
      imagem: "assets/eventos-sistemas/inverno.webp",
      imagemAlt: "Uma faixa de fogo ilumina a neve junto aos campos",
      texto: "Um fogo aparece no campo durante a geada.",
      informacoes:
        "Os guardas juram que ninguém saiu do portão; as famílias dizem que ouviram passos na neve. Apagar as chamas é simples. Descobrir quem as acendeu pode exigir outra escolha.",
      opcoes: [
        {
          id: "apagar",
          texto: "Organizar um balde por casa.",
          efeitos: { habitantes: -1, honra: 2 },
          resultado: "A vila apaga o fogo em corrente. O campo sofre, mas nenhuma casa queima.",
        },
        {
          id: "seguir",
          texto: "Seguir as pegadas para além da muralha.",
          testeSorte: {
            chance: 45,
            sucesso: {
              efeitos: { gold: 7, ataque: 1 },
              resultado:
                "Você alcança o incendiário antes que deixe a estrada. A recompensa paga a ronda da vila.",
            },
            falha: {
              efeitos: { hp: -12, habitantes: -2 },
              resultado:
                "As pegadas levam a uma armadilha na neve. Você retorna ferido, e duas famílias partem antes do amanhecer.",
            },
          },
        },
      ],
    },
  ];

  const etapas = [
    [
      "celeiro",
      "contrabandista",
      "milicia",
      "pedreira",
      "taverna",
      "peregrino",
      "gado_perdido",
      "espiao",
      "torneio",
      "bruxa",
    ],
    [
      "julgamento",
      "pregador",
      "irmaos_rivais",
      "estalajadeira",
      "ratos",
      "guarda_cansado",
      "guardas_desertam",
      "rumores",
      "sino_rachado",
      "velho_soldado",
    ],
    [
      "pao_contado",
      "noite_dos_mortos",
      "viuva",
      "boticario",
      "pastores",
      "ladrao_de_cavalos",
      "oleiro",
      "criancas_floresta",
      "carvoeiros",
      "vigia_da_torre",
      "enxame",
      "lagoa_proibida",
    ],
    [
      "bau_estrada",
      "bau_mimico",
      "equipamento_sem_dono",
      "reliquia_sem_dono",
      "mensageiro_sem_carta",
      "bruxa_noite_de_tosse",
      "ferreiro_reforco_do_portao",
    ],
  ];
  const marcos = [8, 18, 31, 50];
  etapas.forEach((ids, indice) => {
    for (const id of ids) {
      const evento = Jogo.eventoPorId(id);
      if (!evento) throw new Error(`Evento sem definição de progressão: ${id}`);
      evento.requisitos = { ...evento.requisitos, rodadaMin: marcos[indice] };
    }
  });

  Jogo.registrarEventos(eventos);
  const imagensTematicas = [
    [
      "viajantes",
      "assets/eventos-especiais/viajante-norte.webp",
      "Viajantes do norte chegam à estrada diante de uma vila distante",
    ],
    ["enchente", "assets/eventos-letais/rio.webp", "A água do rio invade casas e leva objetos pela corrente"],
    [
      "orfao",
      "assets/eventos-pessoas/menino-conselheiro.webp",
      "Retrato do menino que espera diante do portão da vila",
    ],
    ["banquete", "assets/eventos-letais/banquete.webp", "Uma mesa de banquete farta reúne moradores da vila"],
    ["cofre_vazio", "assets/sussurro-do-ouro.webp", "Um cofre aberto guarda apenas o sussurro do ouro"],
    [
      "carta_do_velho",
      "assets/eventos-especificos/testamento-selado.webp",
      "Uma carta do velho senhor aguarda sob um selo de cera",
    ],
    [
      "contador_de_mortos",
      "assets/eventos-especificos/festival-dos-mortos.webp",
      "Moradores caminham com velas diante da memória dos mortos",
    ],
    ["seca", "assets/eventos-sistemas/verao.webp", "O sol forte do verão seca a terra e os campos"],
    ["farinha_nova", "assets/eventos-letais/pao.webp", "Um pão branco recém-assado repousa sobre a mesa"],
    [
      "feira",
      "assets/eventos-especiais/mercador-vermelho.webp",
      "Um mercador apresenta seus produtos na feira da colheita",
    ],
    [
      "gado_perdido",
      "assets/eventos-letais/fera.webp",
      "Um bovino assustado aparece junto a uma cerca quebrada",
    ],
    ["incendio", "assets/eventos-letais/fogo.webp", "Chamas tomam a estrutura de madeira do celeiro"],
    ["espiao", "assets/olhos-largos.webp", "Olhos atentos observam a vila por trás da escuridão"],
    [
      "julgamento",
      "assets/eventos-especificos/mapa-na-pedra.webp",
      "Um mapa antigo está gravado na pedra que marca o limite",
    ],
    [
      "pregador",
      "assets/eventos-culto/profeta.webp",
      "Um pregador ergue a voz diante de uma plateia inquieta",
    ],
    [
      "mercador_de_gente",
      "assets/mercador-sem-sombra.webp",
      "Um mercador encapuzado esconde o rosto na sombra",
    ],
    [
      "mina_esquecida",
      "assets/eventos-especificos/pedra-e-pao.webp",
      "Um mineiro procura minério dentro de uma caverna escura",
    ],
    [
      "desabamento",
      "assets/eventos-especificos/pedra-e-pao.webp",
      "Um desabamento cobre a entrada de uma mina",
    ],
    [
      "irmaos_rivais",
      "assets/espelho-do-antecessor.webp",
      "Um espelho antigo guarda o rosto de um antecessor",
    ],
    [
      "guardas_desertam",
      "assets/eventos-especificos/conselho-guardas.webp",
      "Guardas discutem a segurança da vila diante de um mapa",
    ],
    ["coletor", "assets/mercador-sem-sombra.webp", "Um homem encapuzado confere moedas e balanças"],
    [
      "refugiados",
      "assets/eventos-especiais/viajante-norte.webp",
      "Uma família atravessa a estrada em busca de abrigo",
    ],
    [
      "heranca_disputada",
      "assets/espelho-do-antecessor.webp",
      "Um espelho antigo reflete a disputa entre herdeiros",
    ],
    ["rosto_do_velho", "assets/rei-sob-a-colina.webp", "O rosto do velho senhor surge acima da colina"],
    ["pao_contado", "assets/eventos-letais/pao.webp", "Um pequeno pão repousa sobre uma mesa quase vazia"],
    [
      "noite_dos_mortos",
      "assets/eventos-especificos/festival-dos-mortos.webp",
      "Moradores caminham com velas durante o festival dos mortos",
    ],
    [
      "menino_vai_embora",
      "assets/eventos-pessoas/menino-conselheiro.webp",
      "Retrato do menino que decide partir da vila",
    ],
    ["boticario", "assets/ervas.webp", "Ervas medicinais secam sobre uma mesa de madeira"],
    [
      "ladrao_de_cavalos",
      "assets/eventos-letais/cavalo.webp",
      "Um cavalo selado escapa pela estrada durante a noite",
    ],
    ["culto_do_poco", "assets/eventos-culto/templo.webp", "Um templo improvisado recebe oferendas do culto"],
    [
      "pedra_do_limite",
      "assets/eventos-especificos/mapa-na-pedra.webp",
      "Um mapa antigo está gravado na pedra que marca o limite",
    ],
    ["sonho_do_velho", "assets/rei-sob-a-colina.webp", "O velho senhor aparece no sonho de seu sucessor"],
    [
      "vigia_da_torre",
      "assets/eventos-especificos/torre-na-lagoa.webp",
      "Uma torre escura se ergue junto à lagoa",
    ],
    ["bispo", "assets/eventos-pessoas/padre.webp", "Retrato de um religioso de vestes formais"],
    ["a_sede", "assets/eventos-sistemas/verao.webp", "O calor seco do verão pesa sobre a estrada"],
    [
      "encruzilhada_calice",
      "assets/eventos-especificos/calice-no-pantano.webp",
      "Um cálice repousa entre as águas escuras do pântano",
    ],
  ];
  for (const [id, imagem, imagemAlt] of imagensTematicas) {
    const evento = Jogo.eventoPorId(id);
    if (!evento) throw new Error(`Evento sem arte temática: ${id}`);
    evento.imagem = imagem;
    evento.imagemAlt = imagemAlt;
  }
  Jogo.validarCatalogoEventos();
})();
