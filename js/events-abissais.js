(function () {
  "use strict";
  const Jogo = (window.Jogo = window.Jogo || {});

  // Cadeia abissal: as marcas garantem a ordem sem regras especiais na engine.
  Jogo.registrarEventos(
    ...[
      {
        id: "sonhos_umidos",
        titulo: "O canto das marés secas",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        abissal: true,
        requisitos: { rodadaMin: 8, flagsAusentes: ["abissal_1"] },
        imagem: "assets/canto-das-mares.webp",
        imagemAlt: "Ondas concêntricas e uma sombra indistinta sob a água",
        texto:
          "Pela manhã, os moradores acordam com os cabelos úmidos e sal nos lábios. Todos sonharam com o mesmo som: algo grande, a muitas léguas daqui, respirando devagar debaixo d'água. A vila está a dias de qualquer mar.",
        informacoes: "Ninguém sabe explicar o sal. Os cães recusam-se a entrar no salão.",
        opcoes: [
          {
            id: "ouvir",
            texto: "Reunir os moradores e ouvir os sonhos.",
            efeitos: { honra: 2, hp: -4 },
            resultado:
              "Os relatos são parecidos demais. Você anota os pontos em comum, e à noite o som volta, mais claro. Passa a notar que respira no mesmo compasso.",
            flags: { abissal_1: true, abissal_curioso: true },
          },
          {
            id: "proibir",
            texto: "Proibir conversas sobre os sonhos.",
            efeitos: { honra: -2, habitantes: -1 },
            resultado:
              "O silêncio cai sobre a vila. Um morador parte, dizendo que prefere sonhar em paz do que viver calado.",
            flags: { abissal_1: true, abissal_resistente: true },
          },
          {
            id: "vigilia",
            texto: "Pedir ao padre uma noite de vigília.",
            efeitos: { honra: 3, gold: -2 },
            resultado:
              "Velas ardem até a aurora. O som não vem, mas os moradores acordam sabendo que ele esperava do outro lado do sono.",
            flags: { abissal_1: true, abissal_resistente: true },
          },
          {
            id: "dormir",
            texto: "Dormir no meio da praça, para escutar de perto.",
            efeitos: { ataque: 1, honra: -5, hp: -6 },
            resultado:
              "Você acorda com água nos pulmões, sem ter nenhuma por perto. Passa o dia tossindo uma pergunta que não consegue lembrar.",
            flags: { abissal_1: true, abissal_devoto: true },
          },
        ],
      },
      {
        id: "mare_no_poco",
        titulo: "A maré no poço",
        tipo: "especial",
        peso: 0.4,
        especial: true,
        abissal: true,
        requisitos: { rodadaMin: 11, flags: ["abissal_1"], flagsAusentes: ["abissal_2"] },
        imagem: "assets/mare-no-poco.webp",
        imagemAlt: "Balde de poço com peixes pálidos e símbolos na água",
        texto:
          "A água dos poços subiu à borda, com gosto de sal. Nos baldes, peixes brancos, sem olhos, de dentes quase humanos, batem contra a madeira. As crianças brincam com eles, e as mães não conseguem impedir.",
        informacoes: "A água salgada não se mistura com o rio. Circula dentro das paredes.",
        opcoes: [
          {
            id: "tapar",
            texto: "Tapar todos os poços com pedra.",
            efeitos: { honra: 2, gold: -5, habitantes: -3 },
            resultado:
              "Sem água, três famílias partem em busca de rios limpos. As pedras estremecem à noite, como se alguém batesse por baixo.",
            flags: { abissal_2: true, abissal_resistente: true },
          },
          {
            id: "examinar",
            texto: "Examinar os peixes com o boticário.",
            efeitos: { honra: 3, escudo: 1, hp: -6 },
            resultado:
              "Dentro de cada peixe, uma pequena pedra com símbolos gravados. O boticário vomita e se recusa a continuar. Você leva uma das pedras ao bolso, sem saber por quê.",
            flags: { abissal_2: true, abissal_curioso: true },
          },
          {
            id: "permitir",
            texto: "Permitir que o povo beba.",
            efeitos: { habitantes: 4, honra: -4 },
            resultado:
              "A água é doce na boca dos que aceitam. Quatro viajantes, ao sentir o gosto, pedem para ficar. Seus olhos brilham um pouco além do normal.",
            flags: { abissal_2: true, abissal_devoto: true },
          },
          {
            id: "observar",
            texto: "Deixar a água subir e observar o que vem.",
            requisitos: { honraMax: -30 },
            efeitos: { gold: 8, honra: -5, hp: -8 },
            resultado:
              "Uma mão sem dedos aparece na superfície, abre e fecha, e some. O mercador da estrada, interessado em peixes raros, deixa 8 gold e parte, sem fazer perguntas.",
            flags: { abissal_2: true, abissal_curioso: true },
          },
        ],
      },
      {
        id: "olhos_largos",
        titulo: "Os de olhos largos",
        tipo: "especial",
        peso: 0.5,
        especial: true,
        abissal: true,
        requisitos: { rodadaMin: 14, flags: ["abissal_2"], flagsAusentes: ["abissal_3"] },
        imagem: "assets/olhos-largos.webp",
        imagemAlt: "Silhuetas de moradores de olhos abertos junto à lagoa",
        texto:
          "Seus guardas relatam que um grupo de moradores se reúne à noite na margem da lagoa, de mãos dadas, em silêncio. Quando o sol nasce, voltam para casa com os olhos mais abertos do que o normal e cantarolando algo que ninguém ensinou.",
        informacoes: "Não parecem perigosos. Parecem felizes, o que é pior.",
        opcoes: [
          {
            id: "confrontar",
            texto: "Confrontá-los na margem.",
            efeitos: { honra: 3, ataque: 1, hp: -8, habitantes: -3 },
            resultado:
              "Os de olhos largos não resistem, apenas sorriem. Três deles se jogam na lagoa antes que você os alcance. Os outros voltam para casa, mais silenciosos.",
            flags: { abissal_3: true, abissal_resistente: true },
          },
          {
            id: "juntar",
            texto: "Juntar-se à roda uma noite.",
            efeitos: { escudo: 3, habitantes: 4, honra: -6, hp: -8 },
            resultado:
              "A roda canta, e você aprende a letra sem entender uma palavra. Ao amanhecer, quatro moradores novos aparecem à porta, pedindo por um lugar que não conhecem.",
            flags: { abissal_3: true, abissal_devoto: true },
          },
          {
            id: "expulsar",
            texto: "Pedir ao padre que os expulse.",
            efeitos: { honra: -4, habitantes: -5 },
            resultado:
              "O padre tenta, falha, e foge da vila na mesma noite. Cinco famílias o acompanham, apavoradas, sem olhar para trás.",
            flags: { abissal_3: true, abissal_resistente: true },
          },
          {
            id: "decorar",
            texto: "Ouvir a canção até decorar.",
            efeitos: { honra: 2, hp: -4 },
            resultado:
              "A canção é feita de intervalos impossíveis. Você sai com uma dor de cabeça e um nome que não é humano preso na língua.",
            flags: { abissal_3: true, abissal_curioso: true },
          },
        ],
      },
      {
        id: "torre_na_lagoa",
        titulo: "A torre na lagoa",
        tipo: "especial",
        peso: 0.5,
        especial: true,
        abissal: true,
        requisitos: { rodadaMin: 17, flags: ["abissal_3"], flagsAusentes: ["abissal_4"] },
        imagem: "assets/torre-na-lagoa.webp",
        imagemAlt: "Torre escura e sem janelas emergindo da lagoa",
        texto:
          "Em uma noite sem vento, a lagoa baixa de repente, em silêncio. No fundo, coberta de lama e algas, ergue-se uma torre de pedra escura sem janelas, mais antiga que a vila, com ângulos que o olho não acompanha. A porta está aberta.",
        informacoes: "Cada pessoa que olha por muito tempo para a torre sai do transe sem lembrar o que viu.",
        opcoes: [
          {
            id: "entrar",
            texto: "Entrar na torre.",
            efeitos: { ataque: 2, escudo: 2, gold: 10, hp: -15, honra: -5 },
            resultado:
              "Nas paredes, gravuras sobre algo que dorme e outro que espera. Você carrega um punhado de moedas de metal desconhecido e uma certeza: a torre é uma porta, e não um fim.",
            flags: { abissal_4: true, abissal_curioso: true },
          },
          {
            id: "afastar",
            texto: "Ordenar que a vila se afaste da lagoa.",
            efeitos: { honra: 3, habitantes: -4, gold: -2 },
            resultado:
              "Os moradores obedecem, mas quatro famílias aproveitam para partir de vez. A torre fica visível da muralha, sem que ninguém ouse apontar para ela.",
            flags: { abissal_4: true, abissal_resistente: true },
          },
          {
            id: "selar",
            texto: "Selar a porta com ferro e pedra.",
            requisitos: { goldMin: 5 },
            efeitos: { honra: 4, gold: -5, hp: -8 },
            resultado:
              "O ferro entorta ao tocar a porta, mas a pedra segura. Uma pulsação passa pelo chão. Por três dias, ninguém dorme direito.",
            flags: { abissal_4: true, abissal_resistente: true },
          },
          {
            id: "guarda",
            texto: "Deixar a porta aberta e montar guarda.",
            requisitos: { honraMax: -30 },
            efeitos: { gold: 12, habitantes: 3, honra: -8 },
            resultado:
              "Peregrinos de lugares distantes aparecem, pagando para ver a torre. Três ficam. Na manhã seguinte, a lagoa já está um dedo mais cheia.",
            flags: { abissal_4: true, abissal_devoto: true },
          },
        ],
      },
      {
        id: "aquele_que_acorda",
        titulo: "Aquele que acorda",
        tipo: "especial",
        peso: 0.6,
        especial: true,
        abissal: true,
        requisitos: { rodadaMin: 20, flags: ["abissal_4"], flagsAusentes: ["abissal_5"] },
        imagem: "assets/aquele-que-acorda.webp",
        imagemAlt: "Um único olho sugerido dentro de uma coluna de escuridão",
        texto:
          "A lagoa ferve sem calor. Da torre, uma coluna de escuridão sobe ao céu, e as estrelas se afastam dela. O chão treme em compasso com a respiração dos seus sonhos. Os moradores se ajoelham sem que ninguém peça. Algo imenso abre um olho.",
        informacoes:
          "Não é uma batalha. Não é uma negociação. É um momento em que a vila inteira espera o que o senhor fará com o que sabe.",
        opcoes: [
          {
            id: "selar",
            texto: "Selar o despertar com o próprio sangue.",
            requisitos: { honraMin: 30 },
            efeitos: { honra: 10, habitantes: 4, hp: -35 },
            resultado:
              "Você ergue a mão e deixa o sangue cair na pedra. O olho se fecha, devagar, como quem concede uma trégua. A coluna se apaga. Você cai de joelhos, e a vila, em silêncio, entende o preço.",
            flags: { abissal_5: true },
            desbloqueia: { flags: ["mare_selada"] },
          },
          {
            id: "ler",
            texto: "Ler as palavras do fundo em voz alta.",
            requisitos: { flags: ["abissal_curioso"] },
            efeitos: { ataque: 5, escudo: 5, honra: -15 },
            multiplicadores: { habitantes: 0.3 },
            resultado:
              "As palavras saem pela sua boca como se fossem sempre suas. A coisa assente. Dos moradores ajoelhados, a maioria não se levanta. Você sente a força de algo antigo no seu braço.",
            flags: { abissal_5: true },
            desbloqueia: { flags: ["palavras_lembradas"] },
          },
          {
            id: "servir",
            texto: "Oferecer-se como servo.",
            requisitos: { flags: ["abissal_devoto"] },
            efeitos: { gold: 40, ataque: 6, hp: 20, honra: -20 },
            multiplicadores: { habitantes: 0.5 },
            resultado:
              "O olho se fixa em você. Você sente que sempre foi o senhor desta vila por alguém, e não por si. Metade dos moradores se junta à roda e deixa de olhar para o céu.",
            flags: { abissal_5: true },
            desbloqueia: { flags: ["senhor_do_abismo"] },
          },
          {
            id: "fugir",
            texto: "Fugir com quem puder ser levado.",
            efeitos: { honra: -5, hp: -10 },
            multiplicadores: { habitantes: 0.6 },
            resultado:
              "Você puxa o máximo de gente pelas estradas, deixando os de joelhos para trás. A coluna some ao amanhecer, mas a lagoa nunca mais seca. Pelo resto da vida, você ouvirá uma respiração ao longe.",
            flags: { abissal_5: true },
          },
          {
            id: "gritar",
            texto: "Gritar com a criatura até ela voltar a dormir.",
            requisitos: { flags: ["abissal_resistente"], honraMin: 50 },
            efeitos: { honra: 8, ataque: 1, escudo: 1, hp: -25, habitantes: -8 },
            resultado:
              "Você grita todos os nomes de quem a vila perdeu, e o olho, confuso, cede. Oito moradores, que não suportam a luz da escuridão, morrem ou partem. A criatura dorme de novo, mas lembra de você.",
            flags: { abissal_5: true },
            desbloqueia: { flags: ["mare_selada"] },
          },
        ],
      },
    ],
  );
})();
