(function () {
  "use strict";
  const Jogo = window.Jogo;
  Jogo.eventos.push(
    {
      id: "companhia_da_vila", titulo: "Uma companhia improvável", tipo: "encontro", peso: 1,
      oncePerRun: true, requisitos: { flagsAusentes: ["companhia_da_vila_visto"] },
      imagem: "assets/eventos-sistemas/companhia.svg", imagemAlt: "Um cão, um corvo e um gato junto ao portão",
      texto: "Três animais passam a noite junto ao portão. Pela manhã, cada um parece ter escolhido você.",
      informacoes: "Um deles pode acompanhar o herdeiro. Os outros voltarão à estrada.",
      opcoes: [
        { id: "cao", texto: "Levar o cão de guarda.", itens: ["cao_companheiro"], resultado: "O cão segue seu passo e aprende a ficar entre você e o perigo." },
        { id: "corvo", texto: "Levar o corvo da estrada.", itens: ["corvo_companheiro"], resultado: "O corvo se instala no ombro do mensageiro e começa a reconhecer moedas pelo som." },
        { id: "gato", texto: "Levar o gato do celeiro.", itens: ["gato_companheiro"], resultado: "O gato se enrola no manto. Seu ronronar acompanha as noites mais longas." }
      ]
    },
    {
      id: "construcoes_da_vila", titulo: "Pedra, ferro e madeira", tipo: "encontro", peso: 1,
      oncePerRun: true, requisitos: { flagsAusentes: ["construcoes_da_vila_visto"] },
      imagem: "assets/eventos-sistemas/construcoes.svg", imagemAlt: "Uma pequena forja e muralhas de pedra em construção",
      texto: "Os mestres da vila oferecem uma obra duradoura. O cofre pode pagar por uma forja ou por reforços nas muralhas.",
      informacoes: "A construção escolhida concede um benefício visível durante esta run.",
      opcoes: [
        { id: "forja", texto: "Construir uma forja · 8 gold.", requisitos: { goldMin: 8 }, efeitos: { gold: -8 }, construcoes: ["forja"], resultado: "A forja fica de pé. O ferreiro promete cobrar menos pelas armas que vender." },
        { id: "muralha", texto: "Reforçar a muralha · 10 gold.", requisitos: { goldMin: 10 }, efeitos: { gold: -10 }, construcoes: ["muralha"], resultado: "Pedras novas fecham as falhas da muralha. Os guardas terão abrigo quando vier a próxima batalha." },
        { id: "adiar", texto: "Guardar o gold para outra necessidade.", efeitos: { honra: 1 }, resultado: "Os mestres guardam as ferramentas. A obra pode esperar; o próximo inverno, talvez não." }
      ]
    },
    {
      id: "prova_do_traco", titulo: "A marca do herdeiro", tipo: "encontro", peso: 1,
      imagem: "assets/eventos-sistemas/traco.svg", imagemAlt: "Três símbolos gravados em madeira: lança, moeda e ramo de ervas",
      texto: "Um velho escriba encontra uma anotação sobre a natureza deste herdeiro. O povo espera para ver se ela é destino ou apenas tinta.",
      informacoes: "O que recebeu ao nascer ainda pode mudar pelo que faz.",
      opcoes: [
        { id: "corajoso", texto: "O Corajoso enfrenta o perigo de frente.", requisitos: { tracos: "corajoso" }, efeitos: { ataque: 1, hp: -5 }, resultado: "O escriba anota uma nova cicatriz ao lado do nome do herdeiro." },
        { id: "avarento", texto: "O Avarento guarda cada moeda.", requisitos: { tracos: "avarento" }, efeitos: { gold: 3, honra: -1 }, resultado: "O escriba fecha o livro antes de perguntar para onde foram as moedas." },
        { id: "doente", texto: "O Doente aceita o repouso.", requisitos: { tracos: "doente" }, efeitos: { hp: 10, habitantes: -1 }, resultado: "O herdeiro descansa. Um morador assume suas tarefas e parte no fim do dia." }
      ]
    },
    {
      id: "festival_primavera", titulo: "As primeiras sementes", tipo: "encontro", peso: 1,
      requisitos: { estacao: "primavera" }, imagem: "assets/eventos-sistemas/primavera.svg", imagemAlt: "Sementes nas mãos de uma criança",
      texto: "A terra amolece depois do frio. Uma criança traz sementes encontradas perto do moinho e pergunta se pode plantá-las.",
      informacoes: "É o primeiro sinal de primavera.", opcoes: [
        { id: "plantar", texto: "Entregar as sementes às famílias.", efeitos: { habitantes: 2, honra: 2 }, resultado: "As famílias dividem o terreno e guardam um punhado de sementes para o próximo ano." },
        { id: "vender", texto: "Vender as sementes ao mercador.", efeitos: { gold: 3, honra: -1 }, resultado: "As sementes rendem algumas moedas. A criança volta para casa de mãos vazias." }
      ]
    },
    {
      id: "festival_verao", titulo: "O dia mais longo", tipo: "encontro", peso: 1,
      requisitos: { estacao: "verao" }, imagem: "assets/eventos-sistemas/verao.svg", imagemAlt: "Uma roda de moradores reunida sob o sol alto",
      texto: "O sol demora a se pôr. A vila acende uma fogueira e pede que o senhor abra os celeiros para uma noite de festa.",
      informacoes: "A noite de verão não dura para sempre.", opcoes: [
        { id: "festejar", texto: "Abrir os celeiros.", efeitos: { habitantes: 3, honra: 2, gold: -2 }, resultado: "A festa continua até o amanhecer. Três viajantes decidem ficar." },
        { id: "guardar", texto: "Manter o grão para a colheita.", efeitos: { gold: 2, honra: -1 }, resultado: "O celeireiro tranca as portas. O povo canta do lado de fora, mais baixo." }
      ]
    },
    {
      id: "festival_outono", titulo: "A última colheita", tipo: "encontro", peso: 1,
      requisitos: { estacao: "outono" }, imagem: "assets/eventos-sistemas/outono.svg", imagemAlt: "Um cesto de grãos sob folhas secas",
      texto: "Os últimos feixes chegam dos campos. Há grão suficiente para guardar ou vender, mas não para as duas coisas.",
      informacoes: "A próxima estação será fria.", opcoes: [
        { id: "guardar", texto: "Guardar metade para o inverno.", efeitos: { habitantes: 2, honra: 2 }, resultado: "Os sacos descem ao celeiro. Duas famílias aceitam passar o inverno na vila." },
        { id: "vender", texto: "Vender o excedente agora.", efeitos: { gold: 5, honra: -1 }, resultado: "A estrada leva o grão e traz moedas. O celeiro fica quase vazio." }
      ]
    },
    {
      id: "festival_inverno", titulo: "A vigília do solstício", tipo: "encontro", peso: 1,
      requisitos: { estacao: "inverno" }, imagem: "assets/eventos-sistemas/inverno.svg", imagemAlt: "Uma vela acesa numa janela coberta de neve",
      texto: "A noite parece não terminar. Uma vela aparece em cada janela, e os moradores pedem que você passe a vigília entre eles.",
      informacoes: "No solstício, até os relógios parecem hesitar.", opcoes: [
        { id: "vigiar", texto: "Ficar com o povo até o amanhecer.", efeitos: { hp: 8, honra: 2 }, resultado: "A chama atravessa a noite. Ao amanhecer, você se sente menos só." },
        { id: "castelo", texto: "Recolher-se ao castelo.", efeitos: { hp: 12, habitantes: -1, honra: -1 }, resultado: "Você descansa em segurança. Uma família parte antes do fim da noite." }
      ]
    },
    {
      id: "tumulo_herdeiro", titulo: "O túmulo do herdeiro passado", tipo: "especial", peso: 1,
      oncePerRun: true, requisitos: { memoriaAnterior: true, flagsAusentes: ["tumulo_herdeiro_visto"] },
      imagem: "assets/eventos-sistemas/tumulo.svg", imagemAlt: "Uma lápide simples ao lado de uma coroa enterrada",
      texto: "O povo leva você ao túmulo do herdeiro anterior. A pedra registra que ele chegou à rodada {{rodada}} com honra {{honra}}.",
      informacoes: "A causa escrita na pedra: {{motivo}}",
      opcoes: [
        { id: "lembrar", texto: "Deixar uma moeda sobre a pedra.", efeitos: { honra: 2, gold: -1 }, resultado: "A moeda some entre as fendas. O nome continua legível." },
        { id: "seguir", texto: "Voltar sem tocar no túmulo.", efeitos: { honra: -1 }, resultado: "Ninguém pergunta por que você não ficou mais tempo." }
      ]
    },
    {
      id: "crianca_cronica", titulo: "A criança conta a história", tipo: "especial", peso: 1,
      oncePerRun: true, requisitos: { memoriaAnterior: true, flagsAusentes: ["crianca_cronica_vista"] },
      imagem: "assets/eventos-sistemas/crianca.svg", imagemAlt: "Uma criança contando uma história para moradores reunidos",
      texto: "Uma criança conta aos moradores como o herdeiro anterior morreu na rodada {{rodada}}, com honra {{honra}}. Ela repete: {{motivo}}",
      informacoes: "Cada pessoa acrescenta um detalhe diferente. Nenhuma muda o fim.",
      opcoes: [
        { id: "corrigir", texto: "Contar o que realmente aconteceu.", efeitos: { honra: 2 }, resultado: "A criança escuta até o fim e acrescenta sua versão à história." },
        { id: "deixar", texto: "Deixar que a lembrança pertença ao povo.", efeitos: { honra: 1, habitantes: 1 }, resultado: "A história muda um pouco quando passa de boca em boca. O povo decide ficar." }
      ]
    }
  );
})();
