(function () {
  "use strict";
  const Jogo = window.Jogo;
  const make = (configuracao) => {
    const {
      id,
      titulo,
      tipo,
      peso,
      rodadaMin,
      imagem,
      texto,
      informacoes,
      opcoes,
      extra = {},
    } = configuracao;
    const { requisitos: requisitosExtra, ...propriedades } = extra;
    return Jogo.criarEvento({
      id,
      titulo,
      tipo,
      peso,
      imagem: `assets/eventos-culto/${imagem}.webp`,
      imagemAlt: `${titulo}, gravura em alto contraste sobre preto`,
      texto,
      informacoes,
      requisitos: {
        rodadaMin: 1,
        flags: ["culto_ativo"],
        flagsAusentes: [`${id}_visto`],
        rodadasDesde: { cultoAdesao: rodadaMin },
        ...(requisitosExtra || {}),
      },
      opcoes,
      oncePerRun: true,
      ...propriedades,
    });
  };
  const transicao = {
    id: "ultimo_habitante",
    titulo: "O último habitante se foi",
    tipo: "especial",
    peso: 0,
    disparadoPelaEngine: true,
    imagem: "assets/eventos-culto/ultimo.webp",
    imagemAlt: "Uma chama pequena diante de uma cadeira de pedra num salão vazio",
    texto: "As casas estão vazias; no salão, uma chama arde e vozes dizem seu nome.",
    informacoes: "Uma cadeira de pedra espera à beira do fogo.",
    opcoes: [
      {
        id: "encerrar",
        texto: "Encerrar a linhagem.",
        resultado: "Você apaga a chama com a mão. O salão fica escuro e, depois, silencioso. Ninguém vem.",
      },
      {
        id: "juntar",
        texto: "Aceitar o chamado.",
        efeitos: { seguidores: 50, honra: -5 },
        resultado:
          "Você senta na cadeira de pedra. Cinquenta pessoas se ajoelham ao mesmo tempo. A chama cresce.",
        desbloqueia: { flags: ["culto_conhecido"] },
      },
    ],
  };
  const cult = [
    make({
      id: "primeira_chama",
      titulo: "A primeira chama",
      tipo: "especial",
      peso: 3,
      rodadaMin: 2,
      imagem: "chama",
      texto: "Os seguidores se reúnem em círculo e esperam as palavras que você ainda não escolheu.",
      informacoes: "A primeira palavra dita aqui será repetida por muito tempo.",
      opcoes: [
        {
          id: "mandamento",
          texto: "Proclamar um mandamento de ferro.",
          efeitos: { seguidores: 10, honra: -4 },
          resultado: "As palavras são curtas e cruéis. Dez novos fiéis chegam antes do amanhecer.",
        },
        {
          id: "dividir",
          texto: "Dividir o pão e a culpa.",
          efeitos: { seguidores: 5, honra: 2 },
          resultado:
            "Alguns choram. Outros se afastam; o círculo que fica é menor, mas encara você de frente.",
        },
        {
          id: "silenciar",
          texto: "Silenciar quem duvida.",
          requisitos: { honraMax: -50 },
          efeitos: { ataque: 1, seguidores: -3, honra: -6 },
          resultado: "Três vozes se calam. O círculo se aperta em volta de você.",
        },
      ],
    }),
    make({
      id: "profeta_rival",
      titulo: "O profeta rival",
      tipo: "desordem",
      peso: 4,
      rodadaMin: 5,
      imagem: "profeta",
      texto: "Outro pregador, de manto limpo e voz mansa, fala aos seus seguidores na praça.",
      informacoes: "Metade escuta; a outra metade já se levanta. Ele não pede nada, só promete.",
      opcoes: [
        {
          id: "desafiar",
          texto: "Desafiá-lo em público.",
          efeitos: { seguidores: 10, hp: -8, honra: -3 },
          resultado: "A praça se divide e depois se cala. Os que ouviam o rival passam a olhar só para você.",
        },
        {
          id: "pagar",
          texto: "Pagar para que ele parta · 5 gold.",
          requisitos: { goldMin: 5 },
          efeitos: { gold: -5, seguidores: -3 },
          resultado: "O profeta aceita as moedas. Três fiéis vão embora logo atrás dele.",
        },
        {
          id: "deixar",
          texto: "Deixá-lo pregar.",
          efeitos: { honra: 2, seguidores: -12 },
          resultado: "A voz mansa vence a sua. Doze pessoas partem com ele ao pôr do sol.",
        },
      ],
    }),
    make({
      id: "seguidor_duvida",
      titulo: "O que duvida",
      tipo: "especial",
      peso: 3,
      rodadaMin: 4,
      imagem: "duvida",
      texto: "Um jovem seguidor se aproxima depois da cerimônia.",
      informacoes:
        "Diz que quer partir e que a mãe o espera na estrada. Os demais observam sem fingir que não ouvem.",
      opcoes: [
        {
          id: "partir",
          texto: "Deixá-lo partir.",
          efeitos: { honra: 2, seguidores: -1 },
          resultado: "O jovem agradece e se afasta devagar. O círculo parece menor do que antes.",
        },
        {
          id: "prender",
          texto: "Prendê-lo no porão.",
          efeitos: { honra: -3 },
          resultado: "O silêncio que cai é o dos que aprenderam a obedecer.",
        },
        {
          id: "exemplo",
          texto: "Fazer dele um exemplo.",
          requisitos: { honraMax: -50 },
          efeitos: { seguidores: 7, honra: -6 },
          resultado: "Oito novos fiéis chegam de olhos baixos. Ninguém mais pergunta se pode partir.",
        },
      ],
    }),
    make({
      id: "templo_de_ossos",
      titulo: "O templo de ossos",
      tipo: "especial",
      peso: 2,
      rodadaMin: 8,
      imagem: "templo",
      texto: "Os seguidores propõem erguer um templo no lugar onde a chama foi acesa.",
      informacoes:
        "Trouxeram ossos, pedras e uma planta mal desenhada. O templo seria permanente, mas custaria caro.",
      opcoes: [
        {
          id: "pedreiros",
          texto: "Construir com pedreiros · 8 gold.",
          requisitos: { goldMin: 8 },
          efeitos: { gold: -8 },
          efeitoContinuo: { seguidoresPorRodada: 1 },
          resultado: "O templo sobe devagar e firme. Os fiéis passam a chegar sozinhos.",
        },
        {
          id: "sangue",
          texto: "Erguer o templo com o sangue dos fiéis.",
          efeitos: { seguidores: -12, honra: -6 },
          efeitoContinuo: { seguidoresPorRodada: 2 },
          resultado:
            "A obra consome doze vidas. O templo parece respirar, e os fiéis passam a chegar em filas.",
        },
        {
          id: "adiar",
          texto: "Adiar a obra.",
          efeitos: { seguidores: -2 },
          resultado: "Dois seguidores partem. Os ossos continuam empilhados no pátio.",
        },
      ],
      extra: { requisitos: { seguidoresMin: 30 } },
    }),
    make({
      id: "fogueira_confissao",
      titulo: "A fogueira da confissão",
      tipo: "especial",
      peso: 1,
      rodadaMin: 10,
      imagem: "fogueira",
      texto: "Um velho seguidor pede que você diga em voz alta o que fez para chegar até aqui.",
      informacoes: "É a única chance de sair do culto sem morrer. Também é a de sair sem ninguém.",
      opcoes: [
        {
          id: "confessar",
          texto: "Confessar diante de todos.",
          efeitos: { honra: 6, seguidores: -20 },
          resultado:
            "Vinte pessoas se levantam durante a confissão e partem. As que ficam esperam sem se mover.",
        },
        {
          id: "queimar",
          texto: "Queimar o livro do culto.",
          efeitos: { honra: 8 },
          dissolverCulto: true,
          desbloqueia: { flags: ["culto_renegado"] },
          resultado:
            "Quando as cinzas esfriam, os seguidores voltam para suas casas. A vila volta a ser uma vila.",
        },
        {
          id: "manter",
          texto: "Manter a chama acesa.",
          efeitos: { seguidores: 5, honra: -3 },
          resultado: "Você se recusa a falar. Os que escutavam se aproximam em silêncio.",
        },
      ],
    }),
    make({
      id: "cacador_de_hereges",
      titulo: "O caçador de hereges",
      tipo: "batalha",
      peso: 2,
      rodadaMin: 6,
      imagem: "cacador",
      texto: "Um homem de manto negro e crucifixo de ferro chega com doze soldados.",
      informacoes:
        "Lê uma lista de nomes que pertencem aos seus fiéis. Seu ataque precisa alcançar a defesa do caçador. O escudo reduz o dano recebido.",
      opcoes: [
        { id: "combater", texto: "Defender os fiéis.", combate: true },
        {
          id: "esconder",
          texto: "Esconder os fiéis nas cavernas.",
          efeitos: { seguidores: -6, honra: -2 },
          resultado: "O caçador busca em vão. Seis fiéis se perdem nas cavernas.",
        },
        {
          id: "entregar",
          texto: "Entregar o líder dissidente.",
          requisitos: { honraMax: -50 },
          efeitos: { gold: 4, seguidores: -4, honra: -5 },
          resultado: "O caçador aceita o nome e parte satisfeito. Os fiéis se calam.",
        },
      ],
      extra: {
        batalha: {
          defesa: 5,
          vitoria: {
            dano: 16,
            efeitos: { seguidores: 12, gold: 6, honra: -3 },
            resultado: "O caçador cai diante de todos. Doze novos fiéis chegam em procissão.",
          },
          derrota: {
            dano: 24,
            efeitos: {},
            resultado:
              "Você é arrastado para fora do salão. O caçador queima as cortinas e chama seus fiéis pelo nome.",
          },
          penalidadeFalha: {
            efeitos: { seguidores: -15 },
            texto: "Quinze fiéis são presos ou se dispersam na fuga.",
          },
        },
      },
    }),
    make({
      id: "recrutamento_forcado",
      titulo: "A lista de nomes",
      tipo: "desordem",
      peso: 2,
      rodadaMin: 3,
      imagem: "duvida",
      texto: "Um capitão oferece trazer famílias para o culto à força.",
      informacoes:
        "Algumas já estão reunidas no portão, sob guarda. A Honra neutra ou positiva torna esta cobrança mais visível para a vila.",
      opcoes: [
        {
          id: "aceitar",
          texto: "Aceitar o recrutamento forçado.",
          efeitos: { seguidores: 12, honra: -5, habitantes: -2 },
          resultado: "Doze pessoas passam a seguir o culto, mas duas famílias fogem antes do amanhecer.",
        },
        {
          id: "libertar",
          texto: "Mandar as famílias para casa.",
          efeitos: { seguidores: -4, honra: 3 },
          resultado: "Quatro seguidores abandonam o salão. As famílias voltam para casa sem olhar para trás.",
        },
      ],
      extra: { requisitos: { honraMin: -29 } },
    }),
    make({
      id: "tributo_da_chama",
      titulo: "O tributo da chama",
      tipo: "desordem",
      peso: 2,
      rodadaMin: 5,
      imagem: "templo",
      texto: "O culto quer cobrar de cada casa para manter o templo aceso.",
      informacoes: "A cobrança pode fortalecer o culto ou custar a confiança da vila.",
      opcoes: [
        {
          id: "cobrar",
          texto: "Cobrar de todas as casas.",
          efeitos: { gold: 6, honra: -4, habitantes: -3 },
          resultado:
            "O templo recebe óleo para meses. Três famílias levam seus pertences para outra estrada.",
        },
        {
          id: "pagar",
          texto: "Cobrir o custo com o próprio cofre · 4 Gold.",
          requisitos: { goldMin: 4 },
          efeitos: { gold: -4, seguidores: 5, honra: 1 },
          resultado: "O fogo continua aceso sem uma nova cobrança. Cinco fiéis se aproximam da cerimônia.",
        },
      ],
      extra: { requisitos: { honraMin: -29 } },
    }),
    make({
      id: "vigilia_dos_sinos",
      titulo: "Os sinos antes do amanhecer",
      tipo: "especial",
      peso: 1.5,
      rodadaMin: 4,
      imagem: "chama",
      texto: "O culto toca os sinos durante a noite inteira.",
      informacoes:
        "Pela manhã, ninguém consegue ouvir os próprios pensamentos. A vila pede que você limite as cerimônias.",
      opcoes: [
        {
          id: "silencio",
          texto: "Encerrar a vigília.",
          efeitos: { honra: 2, seguidores: -3, hp: 5 },
          resultado: "Os sinos se calam. Três fiéis partem, e o resto da vila consegue dormir.",
        },
        {
          id: "continuar",
          texto: "Deixar os sinos tocarem.",
          efeitos: { seguidores: 6, honra: -2, hp: -5 },
          resultado: "Mais pessoas se juntam ao cântico. O povo passa o dia seguinte exausto.",
        },
      ],
    }),
    make({
      id: "cinzas_do_celeiro",
      titulo: "Cinzas no celeiro",
      tipo: "desordem",
      peso: 1.5,
      rodadaMin: 7,
      imagem: "fogueira",
      texto: "Uma brasa da cerimônia alcança o celeiro.",
      informacoes:
        "O fogo ainda está baixo, mas a fumaça já cobre o pátio. A pressa pode salvar o grão ou as pessoas que trabalham lá.",
      opcoes: [
        {
          id: "apagar",
          texto: "Organizar os fiéis para apagar o fogo.",
          efeitos: { habitantes: 2, seguidores: -4, honra: 2 },
          resultado: "O grão é salvo. Quatro seguidores ficam para trás ajudando as famílias.",
        },
        {
          id: "fechar",
          texto: "Trancar o celeiro e proteger o templo.",
          efeitos: { gold: 4, habitantes: -5, honra: -4 },
          resultado: "O templo continua intacto, mas a fumaça leva o estoque e cinco moradores partem.",
        },
      ],
    }),
    make({
      id: "irmas_da_estrada",
      titulo: "As irmãs da estrada",
      tipo: "encontro",
      peso: 1.5,
      rodadaMin: 8,
      imagem: "irmas-da-estrada",
      extra: { imagemAlt: "Duas irmãs viajantes caminham juntas, com trouxas presas aos mantos" },
      texto: "Duas irmãs buscam a família que perderam quando o culto cresceu.",
      informacoes: "Elas conhecem caminhos seguros e pedem que ninguém seja obrigado a ficar.",
      opcoes: [
        {
          id: "acolher",
          texto: "Ajudá-las a encontrar a família.",
          efeitos: { habitantes: 3, seguidores: -2, honra: 3 },
          resultado: "As irmãs reencontram parentes e decidem ficar. Dois fiéis também deixam o culto.",
        },
        {
          id: "reter",
          texto: "Impedir que saiam até a próxima cerimônia.",
          efeitos: { seguidores: 8, honra: -5, habitantes: -2 },
          resultado: "O culto ganha novos nomes na lista. Duas famílias fogem enquanto as irmãs esperam.",
        },
      ],
    }),
  ];
  Jogo.registrarEventos(transicao, ...cult, {
    id: "o_chamado_da_reserva",
    titulo: "A chama guardada",
    tipo: "culto",
    peso: 2,
    oncePerRun: true,
    requisitos: { tracos: "herdeiro_culto", rodadaMin: 8, cultoAtivo: false },
    imagem: "assets/eventos-culto/templo.webp",
    imagemAlt: "Templo do culto, referência provisória",
    texto: "Uma mulher abre uma caixa de brasas e convida você ao templo.",
    informacoes:
      "Trinta mantos esperam à porta. Ao aderir, os seguidores em reserva recebem mais 50 membros.",
    opcoes: [
      {
        id: "aderir",
        texto: "Levar a chama ao templo.",
        entrarNoCulto: true,
        resultado:
          "Os trinta mantos entram com você. Outros cinquenta esperam junto ao altar; a adaga fica em suas mãos.",
      },
      {
        id: "recusar",
        texto: "Fechar a caixa e permanecer na vila.",
        efeitos: { honra: 2 },
        resultado: "Você devolve as brasas. Os mantos se afastam da porta.",
      },
    ],
  });
})();
