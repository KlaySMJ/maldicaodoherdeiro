(function () {
  "use strict";
  const Jogo = (window.Jogo = window.Jogo || {});

  Jogo.registrarEventos(
    {
      id: "bruxa_fio_da_vida",
      titulo: "A bruxa e o fio da vida",
      tipo: "encontro",
      peso: 1,
      grupoRecorrencia: "bruxa",
      requisitos: { flagsAusentes: ["bruxa_fio_da_vida_resolvida"] },
      imagem: "assets/ervas.webp",
      imagemAlt: "Ervas medicinais arrumadas junto a um pilão",
      texto: "A bruxa retorna com um feixe de raízes frescas.",
      informacoes:
        "Diz que pode fechar suas feridas ou ensinar a vila a reconhecer as plantas. Ela não pede ouro pelo conhecimento, só que ninguém chame tudo de mato.",
      opcoes: [
        {
          id: "tratar",
          texto: "Pedir que cuide das suas feridas · 2 gold",
          requisitos: { goldMin: 2 },
          efeitos: { hp: 20, gold: -2, honra: 1 },
          flags: { bruxa_fio_da_vida_resolvida: true },
          resultado:
            "A bruxa prepara um emplastro ardido. A febre cede, e ela deixa uma parte das raízes para a vila.",
        },
        {
          id: "ensinar",
          texto: "Ensinar as famílias a colher as raízes.",
          efeitos: { habitantes: 3, honra: 3 },
          flags: { bruxa_fio_da_vida_resolvida: true },
          resultado:
            "Três famílias aprendem a distinguir remédio de erva daninha. A bruxa corrige a pronúncia de todos, inclusive a sua.",
        },
        {
          id: "guardar",
          texto: "Guardar as raízes para outra ocasião.",
          efeitos: { hp: 6 },
          flags: { bruxa_fio_da_vida_resolvida: true },
          resultado:
            "Você guarda algumas folhas no bolso. A bruxa avisa que elas duram menos que uma promessa.",
        },
      ],
    },
    {
      id: "bruxa_frutos_negros",
      titulo: "Frutos negros na soleira",
      tipo: "encontro",
      peso: 1,
      grupoRecorrencia: "bruxa",
      requisitos: { flagsAusentes: ["bruxa_frutos_resolvido"] },
      imagem: "assets/vila.webp",
      imagemAlt: "Um pequeno cesto deixado diante de uma porta",
      texto: "A bruxa deixa frutos escuros e proíbe cozinhá-los em ferro.",
      informacoes: "O cheiro é doce. O aviso sobre a panela parece específico demais.",
      opcoes: [
        {
          id: "provar",
          texto: "Provar um dos frutos.",
          efeitos: { hp: 14, honra: 1 },
          flags: { bruxa_frutos_resolvido: true },
          resultado:
            "A língua fica roxa até o jantar, mas suas forças voltam. A bruxa ri como quem já sabia.",
        },
        {
          id: "repartir",
          texto: "Repartir o cesto entre as casas.",
          efeitos: { habitantes: 4, honra: 3 },
          flags: { bruxa_frutos_resolvido: true },
          resultado:
            "O povo come os frutos crus. Quatro viajantes que estavam de passagem decidem esperar a próxima colheita.",
        },
        {
          id: "frasco",
          texto: "Pedir que a bruxa prepare um tônico.",
          itens: ["pocao_cura_grande"],
          flags: { bruxa_frutos_resolvido: true },
          resultado:
            "Ela mói os frutos num frasco e manda que você não pergunte pela cor. O tônico fica guardado para quando precisar.",
        },
      ],
    },
    {
      id: "bruxa_vela",
      titulo: "A vela que não apaga",
      tipo: "encontro",
      peso: 1,
      grupoRecorrencia: "bruxa",
      requisitos: { flagsAusentes: ["bruxa_vela_resolvida"] },
      imagem: "assets/ervas.webp",
      imagemAlt: "Uma vela curta entre folhas secas e pequenos frascos",
      texto: "A bruxa acende uma vela no pátio. O vento a dobra, mas não a apaga.",
      informacoes:
        "Ela oferece a chama para proteger sua próxima batalha. A vela cheira a cera, fumaça e alguma coisa que você prefere não nomear.",
      opcoes: [
        {
          id: "aceitar",
          texto: "Aceitar a proteção da vela.",
          itens: ["amuleto_ultima_guarda"],
          efeitos: { honra: 1 },
          flags: { bruxa_vela_resolvida: true },
          resultado: "A bruxa apaga a vela entre os dedos e recolhe a fumaça num pequeno amuleto.",
        },
        {
          id: "estudar",
          texto: "Pedir que ensine o preparo aos guardas.",
          efeitos: { escudo: 1, honra: 2 },
          flags: { bruxa_vela_resolvida: true },
          resultado:
            "Os guardas passam a cobrir melhor as frestas das armaduras. A bruxa chama isso de feitiço; o armeiro chama de ajuste.",
        },
        {
          id: "recusar",
          texto: "Agradecer e deixar a vela no pátio.",
          efeitos: { honra: 1 },
          flags: { bruxa_vela_resolvida: true },
          resultado: "A chama continua acesa até o amanhecer. A bruxa leva o resto da cera para a floresta.",
        },
      ],
    },
    {
      id: "bruxa_fonte",
      titulo: "Água para a bruxa",
      tipo: "encontro",
      peso: 1,
      grupoRecorrencia: "bruxa",
      requisitos: { flagsAusentes: ["bruxa_fonte_resolvida"] },
      imagem: "assets/poco.webp",
      imagemAlt: "Um poço de pedra com um balde de madeira",
      texto: "A bruxa encontra o poço quase seco e pede ajuda para descer um balde.",
      informacoes:
        "Diz que precisa de água limpa para uma cura, não para um feitiço. O poço é fundo, e a corda foi remendada muitas vezes.",
      opcoes: [
        {
          id: "descer",
          texto: "Descer com a bruxa até a água.",
          efeitos: { hp: -4, honra: 3, habitantes: 2 },
          flags: { bruxa_fonte_resolvida: true },
          resultado:
            "Você volta com as mãos feridas e água suficiente. A bruxa trata dois doentes; as famílias ficam para agradecer.",
        },
        {
          id: "corda",
          texto: "Dar uma corda nova à bruxa · 2 gold",
          requisitos: { goldMin: 2 },
          efeitos: { gold: -2, hp: 15 },
          flags: { bruxa_fonte_resolvida: true },
          resultado:
            "Com a corda nova, ela alcança a água sem descer. O primeiro gole tem gosto de ferrugem; a cura, ao menos, funciona.",
        },
        {
          id: "mandar",
          texto: "Mandá-la buscar água na floresta.",
          efeitos: { honra: -1 },
          flags: { bruxa_fonte_resolvida: true },
          resultado:
            "Ela vai sem discutir. Na manhã seguinte, o poço amanhece cheio e ninguém sabe explicar por quê.",
        },
      ],
    },
    {
      id: "mao_do_rei",
      titulo: "A mão do Rei",
      tipo: "encontro",
      peso: 0.1,
      forcarSorteioQuandoElegivel: true,
      requisitos: {
        flags: ["menino_adotado_com_honra"],
        flagsAusentes: ["mao_do_rei_resolvida"],
        rodadasDesde: { menino_adotado: 40 },
      },
      imagem: "assets/eventos-pessoas/menino-conselheiro.webp",
      imagemAlt: "O adolescente acolhido pela vila, vestido para servir no conselho, com um sorriso honroso",
      texto: "O menino cresceu e virou conselheiro; as famílias o procuram antes de falar com você.",
      informacoes:
        "Quarenta rodadas se passaram desde que você acolheu o menino. O nome do cargo é antigo. O trabalho, não.",
      opcoes: [
        {
          id: "nomear",
          texto: "Nomeá-lo conselheiro da vila.",
          efeitos: { honra: 5 },
          flags: { menino_conselheiro: true, mao_do_rei_resolvida: true },
          consequenciaTardia: { eventoId: "primeiro_conselho_do_menino", atrasoMin: 10, atrasoMax: 20 },
          resultado:
            "Diante do povo, você entrega ao adolescente o selo do conselho. A partir de hoje, ele terá voz ao seu lado — e não esquecerá quem lhe deu lugar.",
        },
      ],
    },
    {
      id: "conselheiro_menino_armazem",
      titulo: "Conselho: Contas do armazém",
      tipo: "especial",
      peso: 0.3,
      especial: true,
      conselheiro: true,
      requisitos: { flags: ["menino_conselheiro"], tracosAusentes: ["menino_cronista"] },
      imagem: "assets/eventos-pessoas/menino-conselheiro.webp",
      imagemAlt: "O jovem conselheiro, em vestes formais, apresenta suas contas do armazém",
      texto: "O conselheiro nota a contagem duplicada e propõe dividir o excedente.",
      informacoes: "Ele já sabe quais famílias precisam mais. Você confirma a lista.",
      opcoes: [
        {
          id: "repartir",
          texto: "Seguir o conselho.",
          efeitos: { habitantes: 5, honra: 3, gold: -2 },
          resultado:
            "Os grãos chegam às casas antes da chuva. Cinco pessoas que pensavam partir decidem ficar.",
        },
      ],
    },
    {
      id: "conselheiro_menino_ponte",
      titulo: "Conselho: A ponte e a estrada",
      tipo: "especial",
      peso: 0.3,
      especial: true,
      conselheiro: true,
      requisitos: { flags: ["menino_conselheiro"], tracosAusentes: ["menino_cronista"] },
      imagem: "assets/eventos-pessoas/menino-conselheiro.webp",
      imagemAlt: "O jovem conselheiro, em vestes formais, explica como reparar a ponte",
      texto: "O adolescente ouve os carroceiros antes de falar.",
      informacoes:
        "Sugere consertar as tábuas soltas antes que uma roda quebre no meio da travessia. A obra é pequena; o desvio que ela evita, não.",
      opcoes: [
        {
          id: "reparar",
          texto: "Pagar o reparo · 2 gold",
          requisitos: { goldMin: 2 },
          efeitos: { gold: -2, habitantes: 3, honra: 2 },
          resultado:
            "A ponte volta a receber carroças. Três viajantes escolhem ficar depois de uma travessia tranquila.",
        },
        {
          id: "esperar",
          texto: "Aguardar a próxima estação.",
          efeitos: { honra: 1 },
          resultado:
            "O menino aceita a decisão e anota quais tábuas cederam primeiro. A lista será útil quando houver moedas.",
        },
      ],
    },
    {
      id: "conselheiro_menino_guardas",
      titulo: "Conselho: Treinar sem ferir",
      tipo: "especial",
      peso: 0.3,
      especial: true,
      conselheiro: true,
      requisitos: { flags: ["menino_conselheiro"], tracosAusentes: ["menino_cronista"] },
      imagem: "assets/eventos-pessoas/menino-conselheiro.webp",
      imagemAlt: "O jovem conselheiro, em vestes formais, orienta os guardas no treino",
      texto: "O conselheiro nota que os guardas mais novos treinam com escudos de tamanhos diferentes.",
      informacoes: "O armeiro já separou madeira para fazer os ajustes.",
      opcoes: [
        {
          id: "ajustar",
          texto: "Preparar equipamento para os guardas.",
          efeitos: { ataque: 1, escudo: 1, honra: 2 },
          resultado:
            "O treino fica mais seguro e mais justo. O armeiro diz que o menino enxerga detalhes que adultos preferem ignorar.",
        },
      ],
    },
  );
})();
