(function () {
  "use strict";
  const Jogo = window.Jogo;
  Jogo.registrarEventos(
    {
      id: "companhia_da_vila",
      titulo: "Uma companhia improvável",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      requisitos: { flagsAusentes: ["companhia_da_vila_visto"] },
      imagem: "assets/eventos-sistemas/companhia.webp",
      imagemAlt: "Um cão, um corvo e um gato junto ao portão",
      texto: "Três animais passam a noite junto ao portão. Pela manhã, cada um parece ter escolhido você.",
      informacoes: "Um deles pode acompanhar o herdeiro. Os outros voltarão à estrada.",
      opcoes: [
        {
          id: "cao",
          texto: "Levar o cão de guarda.",
          itens: ["cao_companheiro"],
          resultado: "O cão segue seu passo e aprende a ficar entre você e o perigo.",
        },
        {
          id: "corvo",
          texto: "Levar o corvo da estrada.",
          itens: ["corvo_companheiro"],
          resultado: "O corvo se instala no ombro do mensageiro e começa a reconhecer moedas pelo som.",
        },
        {
          id: "gato",
          texto: "Levar o gato do celeiro.",
          itens: ["gato_companheiro"],
          resultado: "O gato se enrola no manto. Seu ronronar acompanha as noites mais longas.",
        },
      ],
    },
    {
      id: "construcoes_da_vila",
      titulo: "Obras para a vila",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      requisitos: { flagsAusentes: ["construcoes_da_vila_visto"] },
      imagem: "assets/eventos-sistemas/construcoes.webp",
      imagemAlt: "Uma pequena forja e muralhas de pedra em construção",
      texto:
        "Os mestres apresentam os planos de novas obras. O cofre só pode financiar uma delas nesta crônica.",
      informacoes: "A construção escolhida concede um benefício visível durante esta run.",
      opcoes: [
        {
          id: "forja",
          texto: "Construir uma forja · 8 gold.",
          requisitos: { goldMin: 8 },
          efeitos: { gold: -8 },
          construcoes: ["forja"],
          resultado: "A forja fica de pé. O ferreiro promete cobrar menos pelas armas que vender.",
        },
        {
          id: "muralha",
          texto: "Reforçar a muralha · 10 gold.",
          requisitos: { goldMin: 10 },
          efeitos: { gold: -10 },
          construcoes: ["muralha"],
          resultado:
            "Pedras novas fecham as falhas da muralha. Os guardas terão abrigo quando vier a próxima batalha.",
        },
        {
          id: "mercado_coberto",
          texto: "Cobrir o mercado · 8 gold.",
          requisitos: { goldMin: 8 },
          efeitos: { gold: -8 },
          construcoes: ["mercado_coberto"],
          resultado:
            "As bancas ganham telhados. Mercadores e moradores podem negociar mesmo quando a chuva fecha a estrada.",
        },
        {
          id: "torre_vigia",
          texto: "Erguer a torre de vigia · 12 gold.",
          requisitos: { goldMin: 12 },
          efeitos: { gold: -12 },
          construcoes: ["torre_vigia"],
          resultado:
            "A torre domina a estrada. Os guardas veem o perigo cedo e avisam a vila antes do ataque.",
        },
        {
          id: "enfermaria_ervateira",
          texto: "Abrir a enfermaria da ervateira · 8 gold.",
          requisitos: { goldMin: 8 },
          efeitos: { gold: -8 },
          construcoes: ["enfermaria_ervateira"],
          resultado:
            "A ervateira prepara uma sala de repouso. Ela promete cuidar de quem voltar ferido antes que a febre piore.",
        },
        {
          id: "praca_forca",
          texto: "Construir a Praça da Forca · 6 gold.",
          requisitos: { goldMin: 6 },
          efeitos: { gold: -6 },
          construcoes: ["praca_forca"],
          resultado:
            "A forca se ergue no centro da vila. O medo enche os cofres, mas pesa sobre a Honra do herdeiro.",
        },
        {
          id: "celeiro",
          texto: "Construir um celeiro · 8 gold.",
          requisitos: { goldMin: 8 },
          efeitos: { gold: -8 },
          construcoes: ["celeiro"],
          resultado:
            "O novo celeiro guarda grãos para os dias difíceis. Uma reserva agora pode manter mais famílias na vila quando faltar comida.",
        },
        {
          id: "adiar",
          texto: "Guardar o gold para outra necessidade.",
          efeitos: { honra: 1 },
          resultado: "Os mestres guardam as ferramentas. A obra pode esperar; o próximo inverno, talvez não.",
        },
      ],
    },
    {
      id: "prova_do_traco",
      titulo: "A marca do herdeiro",
      tipo: "encontro",
      peso: 1,
      imagem: "assets/eventos-sistemas/traco.webp",
      imagemAlt: "Três símbolos gravados em madeira: lança, moeda e ramo de ervas",
      texto:
        "Um velho escriba encontra uma anotação sobre a natureza deste herdeiro. O povo espera para ver se ela é destino ou apenas tinta.",
      informacoes: "O que recebeu ao nascer ainda pode mudar pelo que faz.",
      opcoes: [
        {
          id: "corajoso",
          texto: "O Corajoso enfrenta o perigo de frente.",
          requisitos: { tracos: "corajoso" },
          efeitos: { ataque: 1, hp: -5 },
          resultado: "O escriba anota uma nova cicatriz ao lado do nome do herdeiro.",
        },
        {
          id: "avarento",
          texto: "O Avarento guarda cada moeda.",
          requisitos: { tracos: "avarento" },
          efeitos: { gold: 3, honra: -1 },
          resultado: "O escriba fecha o livro antes de perguntar para onde foram as moedas.",
        },
        {
          id: "doente",
          texto: "O Doente aceita o repouso.",
          requisitos: { tracos: "doente" },
          efeitos: { hp: 10, habitantes: -1 },
          resultado: "O herdeiro descansa. Um morador assume suas tarefas e parte no fim do dia.",
        },
      ],
    },
    {
      id: "festival_primavera",
      titulo: "As primeiras sementes",
      tipo: "encontro",
      peso: 1,
      requisitos: { estacao: "primavera" },
      imagem: "assets/eventos-sistemas/primavera.webp",
      imagemAlt: "Sementes nas mãos de uma criança",
      texto:
        "A terra amolece depois do frio. Uma criança traz sementes encontradas perto do moinho e pergunta se pode plantá-las.",
      informacoes: "É o primeiro sinal de primavera.",
      opcoes: [
        {
          id: "plantar",
          texto: "Entregar as sementes às famílias.",
          efeitos: { habitantes: 2, honra: 2 },
          resultado: "As famílias dividem o terreno e guardam um punhado de sementes para o próximo ano.",
        },
        {
          id: "vender",
          texto: "Vender as sementes ao mercador.",
          efeitos: { gold: 3, honra: -1 },
          resultado: "As sementes rendem algumas moedas. A criança volta para casa de mãos vazias.",
        },
      ],
    },
    {
      id: "festival_verao",
      titulo: "O dia mais longo",
      tipo: "encontro",
      peso: 1,
      requisitos: { estacao: "verao" },
      imagem: "assets/eventos-sistemas/verao.webp",
      imagemAlt: "Uma roda de moradores reunida sob o sol alto",
      texto:
        "O sol demora a se pôr. A vila acende uma fogueira e pede que o senhor abra os celeiros para uma noite de festa.",
      informacoes: "A noite de verão não dura para sempre.",
      opcoes: [
        {
          id: "festejar",
          texto: "Abrir os celeiros.",
          efeitos: { habitantes: 3, honra: 2, gold: -2 },
          resultado: "A festa continua até o amanhecer. Três viajantes decidem ficar.",
        },
        {
          id: "guardar",
          texto: "Manter o grão para a colheita.",
          efeitos: { gold: 2, honra: -1 },
          resultado: "O celeireiro tranca as portas. O povo canta do lado de fora, mais baixo.",
        },
      ],
    },
    {
      id: "festival_outono",
      titulo: "A última colheita",
      tipo: "encontro",
      peso: 1,
      requisitos: { estacao: "outono" },
      imagem: "assets/eventos-sistemas/outono.webp",
      imagemAlt: "Um cesto de grãos sob folhas secas",
      texto:
        "Os últimos feixes chegam dos campos. Há grão suficiente para guardar ou vender, mas não para as duas coisas.",
      informacoes: "A próxima estação será fria.",
      opcoes: [
        {
          id: "guardar",
          texto: "Guardar metade para o inverno.",
          efeitos: { habitantes: 2, honra: 2 },
          resultado: "Os sacos descem ao celeiro. Duas famílias aceitam passar o inverno na vila.",
        },
        {
          id: "vender",
          texto: "Vender o excedente agora.",
          efeitos: { gold: 5, honra: -1 },
          resultado: "A estrada leva o grão e traz moedas. O celeiro fica quase vazio.",
        },
      ],
    },
    {
      id: "festival_inverno",
      titulo: "A vigília do solstício",
      tipo: "encontro",
      peso: 1,
      requisitos: { estacao: "inverno" },
      imagem: "assets/eventos-sistemas/inverno.webp",
      imagemAlt: "Uma vela acesa numa janela coberta de neve",
      texto:
        "A noite parece não terminar. Uma vela aparece em cada janela, e os moradores pedem que você passe a vigília entre eles.",
      informacoes: "No solstício, até os relógios parecem hesitar.",
      opcoes: [
        {
          id: "vigiar",
          texto: "Ficar com o povo até o amanhecer.",
          efeitos: { hp: 8, honra: 2 },
          resultado: "A chama atravessa a noite. Ao amanhecer, você se sente menos só.",
        },
        {
          id: "castelo",
          texto: "Recolher-se ao castelo.",
          efeitos: { hp: 12, habitantes: -1, honra: -1 },
          resultado: "Você descansa em segurança. Uma família parte antes do fim da noite.",
        },
      ],
    },
    {
      id: "tumulo_herdeiro",
      titulo: "O túmulo do herdeiro passado",
      tipo: "especial",
      peso: 1,
      oncePerRun: true,
      requisitos: { memoriaAnterior: true, flagsAusentes: ["tumulo_herdeiro_visto"] },
      imagem: "assets/eventos-sistemas/tumulo.webp",
      imagemAlt: "Uma lápide simples ao lado de uma coroa enterrada",
      texto:
        "O povo leva você ao túmulo do herdeiro anterior. A pedra registra que ele chegou à rodada {{rodada}} com honra {{honra}}.",
      informacoes: "A causa escrita na pedra: {{motivo}}",
      opcoes: [
        {
          id: "lembrar",
          texto: "Deixar uma moeda sobre a pedra.",
          efeitos: { honra: 2, gold: -1 },
          consequenciaTardia: { eventoId: "eco_da_lapide", atrasoMin: 10, atrasoMax: 20 },
          resultado: "A moeda some entre as fendas. O nome continua legível.",
        },
        {
          id: "seguir",
          texto: "Voltar sem tocar no túmulo.",
          efeitos: { honra: -1 },
          resultado: "Ninguém pergunta por que você não ficou mais tempo.",
        },
      ],
    },
    {
      id: "crianca_cronica",
      titulo: "A criança conta a história",
      tipo: "especial",
      peso: 1,
      oncePerRun: true,
      requisitos: { memoriaAnterior: true },
      imagem: "assets/eventos-sistemas/crianca.webp",
      imagemAlt: "Uma criança contando uma história para moradores reunidos",
      texto:
        "Uma criança conta aos moradores como o herdeiro anterior morreu na rodada {{rodada}}, com honra {{honra}}. Ela repete: {{motivo}}",
      informacoes: "Cada pessoa acrescenta um detalhe diferente. Nenhuma muda o fim.",
      opcoes: [
        {
          id: "corrigir",
          texto: "Contar o que realmente aconteceu.",
          efeitos: { honra: 2 },
          resultado: "A criança escuta até o fim e acrescenta sua versão à história.",
        },
        {
          id: "deixar",
          texto: "Deixar que a lembrança pertença ao povo.",
          efeitos: { honra: 1, habitantes: 1 },
          resultado: "A história muda um pouco quando passa de boca em boca. O povo decide ficar.",
        },
      ],
    },
    {
      id: "retorno_do_menino",
      titulo: "O menino volta pela estrada",
      tipo: "especial",
      narrativamenteUnico: true,
      peso: 0,
      disparadoPelaEngine: true,
      consequenciaAgendada: true,
      oncePerRun: true,
      imagem: "assets/eventos-pessoas/menino-conselheiro.webp",
      imagemAlt: "O adolescente acolhido pela vila, com o traje formal de conselheiro",
      texto:
        "O menino que você acolheu retorna de uma viagem com anotações sobre as famílias da estrada. Ele reconhece o selo da vila e pede para ajudar.",
      informacoes: "Uma escolha antiga volta a produzir efeitos nesta crônica.",
      opcoes: [
        {
          id: "formar",
          texto: "Pagar seus estudos e formação · 3 Gold.",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, ataque: 1, honra: 2 },
          resultado:
            "O jovem usa o que aprendeu para organizar os guardas e orientar os viajantes que chegam.",
        },
        {
          id: "trabalho",
          texto: "Confiar a ele o cuidado dos recém-chegados.",
          efeitos: { habitantes: 3, honra: 1 },
          resultado:
            "Ele recebe as famílias pelo nome. Três viajantes decidem ficar depois de encontrar abrigo.",
        },
      ],
    },
    {
      id: "primeiro_conselho_do_menino",
      titulo: "O primeiro parecer",
      tipo: "especial",
      peso: 0,
      disparadoPelaEngine: true,
      consequenciaAgendada: true,
      imagem: "assets/eventos-pessoas/menino-conselheiro.webp",
      imagemAlt: "O adolescente conselheiro apresenta sua primeira proposta à vila",
      texto:
        "Na primeira sessão formal, o adolescente estuda os pedidos das famílias e propõe começar pelos que ficaram sem abrigo.",
      informacoes: "A nomeação do menino agora afeta as decisões da vila.",
      opcoes: [
        {
          id: "moradia",
          texto: "Aprovar a ajuda para as famílias · 3 Gold.",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, habitantes: 4, honra: 2 },
          resultado:
            "As famílias recebem madeira e lugar para dormir. O conselho ganha a confiança de quem chegou por último.",
        },
        {
          id: "guardas",
          texto: "Usar o plano para reorganizar a guarda.",
          efeitos: { ataque: 1, escudo: 1, honra: 1 },
          resultado:
            "O plano distribui os turnos sem abandonar os campos. Os guardas agradecem ao novo conselheiro.",
        },
      ],
    },
    {
      id: "promessa_do_ferreiro",
      titulo: "A conta do aprendiz",
      tipo: "especial",
      peso: 0,
      disparadoPelaEngine: true,
      consequenciaAgendada: true,
      imagem: "assets/forja.webp",
      imagemAlt: "O ferreiro e um escudo reforçado sobre a bancada",
      texto:
        "O ferreiro traz o escudo que o aprendiz ajudou a reforçar. Ele pede pagamento pelas placas de metal que usou.",
      informacoes: "A promessa feita ao menino retorna à oficina.",
      opcoes: [
        {
          id: "pagar",
          texto: "Pagar as placas · 4 Gold.",
          requisitos: { goldMin: 4 },
          efeitos: { gold: -4, escudo: 2, honra: 1 },
          resultado:
            "O ferreiro entrega o escudo sem cobrar mais nada. O aprendiz fica para terminar o trabalho.",
        },
        {
          id: "recusar",
          texto: "Pedir que ele fique com o escudo.",
          efeitos: { honra: -2, habitantes: -1 },
          resultado: "O aprendiz segue para outra oficina. O ferreiro guarda o escudo e fecha a conta.",
        },
      ],
    },
    {
      id: "eco_da_lapide",
      titulo: "Uma lembrança na praça",
      tipo: "especial",
      peso: 0,
      disparadoPelaEngine: true,
      consequenciaAgendada: true,
      imagem: "assets/eventos-sistemas/tumulo.webp",
      imagemAlt: "Uma coroa antiga diante da lápide do herdeiro anterior",
      texto:
        "A moeda que você deixou no túmulo reaparece na praça. Uma criança repete a causa da morte de {{herdeiro}}: {{motivo}}",
      informacoes: "O povo quer decidir o que fazer com a memória que voltou.",
      opcoes: [
        {
          id: "memorial",
          texto: "Erguer uma placa em sua memória · 2 Gold.",
          requisitos: { goldMin: 2 },
          efeitos: { gold: -2, honra: 3, habitantes: 1 },
          resultado: "A placa não explica a morte, mas registra o que o herdeiro tentou proteger.",
        },
        {
          id: "guardar",
          texto: "Devolver a moeda ao túmulo.",
          efeitos: { honra: 1, hp: 5 },
          resultado: "O silêncio volta à praça. Por uma noite, a vila dorme sem repetir a história.",
        },
      ],
    },
    {
      id: "nemesis_da_memoria",
      titulo: "A morte retorna",
      tipo: "batalha",
      peso: 0,
      disparadoPelaEngine: true,
      nemesis: true,
      imagem: "assets/eventos-sistemas/tumulo.webp",
      imagemAlt: "Uma sombra armada emerge ao lado de uma coroa enterrada",
      texto:
        "A causa que levou {{herdeiro}} aparece diante dos portões com um rosto novo. {{adocao}} ainda vive na memória da linhagem — e a sombra veio terminar o que começou: {{motivo}}",
      informacoes:
        "Este inimigo carrega a memória da run anterior e fica mais forte a cada derrota registrada.",
      batalha: {
        defesa: 4,
        vitoria: {
          dano: 12,
          efeitos: { ataque: 1, honra: 2 },
          resultado: "Você derruba a sombra. A lembrança perde força, mas não desaparece.",
        },
        derrota: {
          dano: 20,
          efeitos: { honra: -2 },
          resultado: "A sombra vence o primeiro confronto e recua para a estrada.",
        },
        penalidadeFalha: {
          efeitos: { habitantes: -2 },
          texto: "Dois moradores fogem ao reconhecer a causa da antiga tragédia.",
        },
      },
      opcoes: [
        { id: "enfrentar", texto: "Enfrentar o inimigo da memória.", combate: true },
        {
          id: "proteger",
          texto: "Evacuar uma família para fora dos portões.",
          efeitos: { hp: -5, honra: 2, habitantes: -1 },
          resultado:
            "A sombra deixa a vila, mas leva consigo um de seus moradores. A família fica em segurança.",
        },
      ],
    },
  );
})();
