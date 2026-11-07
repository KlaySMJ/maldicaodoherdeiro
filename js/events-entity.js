(function () {
  "use strict";
  const Jogo = window.Jogo;
  Jogo.registrarEventos(
    {
      id: "a_viuva_do_moleiro",
      titulo: "A viúva do moleiro",
      tipo: "encontro",
      peso: 2,
      imagem: "assets/eventos-pessoas/viuva-do-moleiro.webp",
      imagemAlt: "A viúva do moleiro segura um saco de farinha",
      texto: "A viúva de um moleiro chega à praça com as contas da última colheita.",
      informacoes:
        "Diz que os guardas levaram mais sacos do que o combinado; o capitão afirma que ela escondeu parte da farinha. Os dois têm testemunhas. Nenhuma delas parece querer ser a primeira a falar.",
      opcoes: [
        {
          id: "ouvir_viuva",
          texto: "Pagar a diferença enquanto as contas são revistas. · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, honra: 2, habitantes: 1 },
          resultado:
            "A viúva aceita o pagamento, mas deixa as contas com você. O capitão não agradece; na manhã seguinte, traz os livros que faltavam.",
        },
        {
          id: "cobrar_capitao",
          texto: "Exigir que o capitão prove a acusação.",
          efeitos: { honra: 3, gold: -1 },
          resultado:
            "O capitão encontra recibos incompletos. Um gold cobre o saco ausente; a viúva continua sem confiar nele, mas volta para casa.",
        },
        {
          id: "apoiar_guarda",
          texto: "Manter a palavra dos guardas.",
          efeitos: { gold: 2, honra: -3, habitantes: -2 },
          resultado:
            "O capitão recebe o saco e a viúva parte com a filha. A farinha fica no celeiro; ninguém na praça chama aquilo de justiça.",
        },
      ],
    },
    {
      id: "mensageiro_sem_carta",
      titulo: "O mensageiro sem carta",
      tipo: "encontro",
      peso: 2,
      imagem: "assets/eventos-pessoas/mensageiro-sem-carta.webp",
      imagemAlt: "Um mensageiro cansado estende uma mão vazia junto à estrada",
      texto:
        "Um mensageiro chega a pé, com o cavalo mancando atrás. Afirma que perdeu a carta selada que carregava para o castelo.",
      informacoes:
        "A estrada está cheia de lama e de versões diferentes. Ele pede descanso antes que alguém descubra o extravio.",
      opcoes: [
        {
          id: "abrigar_mensageiro",
          texto: "Dar abrigo e procurar a carta pela estrada. · 2 gold",
          requisitos: { goldMin: 2 },
          efeitos: { gold: -2, honra: 2, hp: 4 },
          resultado:
            "Você paga a busca. A carta não aparece, mas o cavalo recebe ferraduras novas e o mensageiro parte ao amanhecer, menos pálido.",
        },
        {
          id: "interrogar_mensageiro",
          texto: "Fazer perguntas até a história se firmar.",
          efeitos: { honra: 1, gold: 3, hp: -3 },
          resultado:
            "A história muda duas vezes. No alforge, você encontra três moedas e um bilhete em branco; o mensageiro jura que não sabe de quem são.",
        },
        {
          id: "mandar_estrada",
          texto: "Mandá-lo seguir viagem sem demora.",
          efeitos: { honra: -2, habitantes: -1 },
          resultado:
            "Ele monta com dificuldade e segue para o sul. Um rapaz da vila, que esperava notícias da irmã, fecha a janela.",
        },
      ],
    },
    {
      id: "entidade_x_chegada",
      titulo: "Uma presença no caminho",
      tipo: "especial",
      peso: 0.25,
      especial: true,
      entidadeXInicio: true,
      requisitos: { rodadaMin: 8 },
      imagem: "assets/eventos-entidade/presenca-no-caminho.webp",
      imagemAlt: "Uma figura alta e sem rosto diante de um caminho estreito",
      texto:
        "Uma figura espera onde a estrada cruza o bosque. Quando você se aproxima, pergunta pelo nome que recebeu ao nascer, embora ninguém na vila o conheça.",
      informacoes: "Não há pegadas ao redor dela. A figura promete desafios, mas não diz quando voltará.",
      opcoes: [
        {
          id: "ouvir_entidade",
          texto: "Escutar o primeiro desafio.",
          efeitos: { hp: -2 },
          flags: { entidade_x_tier1: true },
          resultado:
            "Ela pede apenas que você se lembre da conversa. Depois desaparece. No caminho de volta, uma segunda silhueta o espera entre as árvores.",
        },
      ],
    },
    {
      id: "entidade_x_espelho",
      titulo: "O rosto emprestado",
      tipo: "especial",
      peso: 0.25,
      especial: true,
      entidadeX: true,
      requisitos: { rodadaMin: 8, flags: ["entidade_x_tier1"], flagsAusentes: ["entidade_x_espelho_visto"] },
      imagem: "assets/eventos-entidade/rosto-emprestado.webp",
      imagemAlt: "Um espelho rachado reflete uma figura de rosto vazio",
      texto: "A figura segura um espelho com seu rosto, mas com olhos que não são seus.",
      informacoes:
        "Pergunta se você reconheceria um herdeiro que tivesse feito todas as escolhas ao contrário. A Entidade observa sua resposta em silêncio.",
      opcoes: [
        {
          id: "guardar_espelho",
          texto: "Virar o espelho para a parede.",
          efeitos: { ataque: 1, honra: 1, hp: -3 },
          flags: { entidade_x_tier2: true, entidade_x_espelho_visto: true },
          resultado: "O vidro corta seu polegar. No reflexo partido, a figura sorri com a sua boca.",
        },
        {
          id: "recusar_espelho",
          texto: "Deixar o espelho onde está.",
          flags: { entidade_x_tier2: true, entidade_x_espelho_visto: true },
          testeSorte: {
            chance: 78,
            fatalidadeAleatoria: true,
            sucesso: {
              efeitos: { honra: -2, hp: -4 },
              flags: { entidade_x_tier2: true, entidade_x_espelho_visto: true },
              resultado: "A figura inclina a cabeça, irritada. Você volta à estrada com o ouvido zunindo.",
            },
            falha: {
              efeitos: { hp: -999 },
              flags: { entidade_x_tier2: true, entidade_x_espelho_visto: true },
              resultado:
                "A figura toca seu reflexo. Seu corpo cai na lama antes que os guardas consigam alcançá-lo.",
            },
          },
        },
      ],
    },
    {
      id: "entidade_x_balanca",
      titulo: "A balança sem pratos",
      tipo: "especial",
      peso: 0.25,
      especial: true,
      entidadeX: true,
      requisitos: { rodadaMin: 8, flags: ["entidade_x_tier1"], flagsAusentes: ["entidade_x_balanca_vista"] },
      imagem: "assets/eventos-entidade/balanca-sem-pratos.webp",
      imagemAlt: "Uma balança antiga sustenta uma mão aberta de cada lado",
      texto: "A figura oferece uma balança sem pratos.",
      informacoes:
        "Diz que pode pesar sua promessa ou a fome da vila, mas só uma das duas coisas poderá continuar leve. O desafio não explica o que será cobrado.",
      opcoes: [
        {
          id: "pesar_promessa",
          texto: "Pousar a mão sobre a madeira.",
          efeitos: { honra: 2, gold: -2, hp: -2 },
          flags: { entidade_x_tier2: true, entidade_x_balanca_vista: true },
          resultado:
            "A balança afunda até a terra. A figura guarda o peso invisível e promete voltar com uma pergunta mais difícil.",
        },
        {
          id: "recusar_balanca",
          texto: "Aguardar que o prato se mova.",
          flags: { entidade_x_tier2: true, entidade_x_balanca_vista: true },
          testeSorte: {
            chance: 78,
            fatalidadeAleatoria: true,
            sucesso: {
              efeitos: { honra: -2, hp: -4 },
              flags: { entidade_x_tier2: true, entidade_x_balanca_vista: true },
              resultado:
                "A Entidade se irrita com sua pergunta. A voz dela acompanha você por todo o caminho de volta.",
            },
            falha: {
              efeitos: { hp: -999 },
              flags: { entidade_x_tier2: true, entidade_x_balanca_vista: true },
              resultado: "A mão da figura fecha-se. Seus homens encontram apenas a capa caída no barro.",
            },
          },
        },
      ],
    },
    {
      id: "entidade_x_porta",
      titulo: "A porta que não estava ali",
      tipo: "especial",
      peso: 0.25,
      especial: true,
      entidadeX: true,
      requisitos: { rodadaMin: 8, flags: ["entidade_x_tier1"], flagsAusentes: ["entidade_x_porta_vista"] },
      imagem: "assets/eventos-entidade/porta-no-bosque.webp",
      imagemAlt: "Uma porta estreita aparece sozinha entre árvores retorcidas",
      texto:
        "Uma porta surge entre duas árvores. Do outro lado, alguém chama você pelo título de seu predecessor.",
      informacoes:
        "A Entidade pergunta se deseja entrar para ouvir o que ele teria dito. O caminho atrás de você continua visível, mas parece mais distante.",
      opcoes: [
        {
          id: "espiar_porta",
          texto: "Olhar pela fresta sem atravessar.",
          efeitos: { hp: -5, honra: 1 },
          flags: { entidade_x_tier2: true, entidade_x_porta_vista: true },
          resultado:
            "Do outro lado, o velho senhor está de costas. Quando você pisca, a porta dá para o mesmo bosque.",
        },
        {
          id: "recusar_porta",
          texto: "Voltar pelo caminho de onde veio.",
          flags: { entidade_x_tier2: true, entidade_x_porta_vista: true },
          testeSorte: {
            chance: 78,
            fatalidadeAleatoria: true,
            sucesso: {
              efeitos: { honra: -2, hp: -4 },
              flags: { entidade_x_tier2: true, entidade_x_porta_vista: true },
              resultado:
                "A Entidade demonstra irritação. A porta se fecha, mas seus passos continuam atrás de você.",
            },
            falha: {
              efeitos: { hp: -999 },
              flags: { entidade_x_tier2: true, entidade_x_porta_vista: true },
              resultado: "A porta bate sozinha. A floresta fica vazia, e seus guardas voltam sem você.",
            },
          },
        },
      ],
    },
    {
      id: "entidade_x_nome",
      titulo: "O nome guardado",
      tipo: "especial",
      peso: 0.25,
      especial: true,
      entidadeX: true,
      entidadeXAparicoesMin: 4,
      requisitos: {
        rodadaMin: 8,
        flags: ["entidade_x_espelho_visto", "entidade_x_balanca_vista", "entidade_x_porta_vista"],
        flagsAusentes: ["entidade_x_nome_visto", "entidade_x_resolvida"],
      },
      imagem: "assets/eventos-entidade/nome-guardado.webp",
      imagemAlt: "Um pergaminho sem letras repousa nas mãos de uma figura encapuzada",
      texto:
        "A figura estende um pergaminho sem letras. Diz que há um nome guardado ali, embora o papel esteja vazio.",
      informacoes:
        "A tinta não aparece, mesmo quando você o inclina contra a luz. A figura espera enquanto o papel permanece entre vocês.",
      opcoes: [
        {
          id: "ler_nome",
          texto: "Inclinar o papel contra a luz.",
          efeitos: { honra: 1, hp: -2 },
          flags: { entidade_x_nome_visto: true },
          resultado:
            "Por um instante, uma linha escura atravessa o papel. Quando você pisca, ela desaparece. A figura recolhe o pergaminho.",
        },
        {
          id: "devolver_nome",
          texto: "Devolver o papel sem abri-lo.",
          efeitos: { honra: 1 },
          flags: { entidade_x_nome_visto: true },
          resultado: "A figura aceita o pergaminho. O espaço vazio entre vocês parece maior do que antes.",
        },
      ],
    },
    {
      id: "entidade_x_sino",
      titulo: "O sino de dentro da terra",
      tipo: "especial",
      peso: 0.25,
      especial: true,
      entidadeX: true,
      entidadeXAparicoesMin: 5,
      requisitos: { rodadaMin: 8, flags: ["entidade_x_nome_visto"], flagsAusentes: ["entidade_x_resolvida"] },
      imagem: "assets/eventos-entidade/sino-enterrado.webp",
      imagemAlt: "Um sino enterrado toca sob o chão diante de uma figura imóvel",
      texto: "O som de um sino vem debaixo da estrada.",
      informacoes:
        "A figura não repete o pedido, mas cada badalada parece mover algo sob a vila. O toque faz os dentes vibrarem. A estrada não mostra de onde vem o som.",
      opcoes: [
        {
          id: "ouvir_sino",
          texto: "Permanecer na estrada até o último toque.",
          testeSorte: {
            chance: 58,
            sucesso: {
              efeitos: { honra: 5, hp: -10, escudo: 1 },
              entidadeXResistiu: true,
              resultado:
                "O sino toca dentro de seu peito e se parte. A Entidade recua, e o silêncio retorna à estrada.",
            },
            falha: {
              efeitos: { honra: -8, hp: -14 },
              entidadeXCeder: true,
              resultado: "O som atravessa você. Quando cessa, a figura segura sua sombra como uma coleira.",
            },
          },
        },
        {
          id: "entregar_povo",
          texto: "Abrir os portões quando o sino tocar.",
          efeitos: { habitantes: -5, honra: -5 },
          entidadeXCeder: true,
          resultado:
            "Cinco moradores ouvem o toque e caminham para o bosque. A Entidade toma o lugar que eles deixaram.",
        },
        {
          id: "fugir_sino",
          texto: "Voltar à vila antes do último toque.",
          flags: { entidade_x_tier3: true },
          testeSorte: {
            chance: 72,
            fatalidadeAleatoria: true,
            sucesso: {
              efeitos: { hp: -5, honra: -3 },
              flags: { entidade_x_tier3: true },
              resultado:
                "Você escapa, mas a Entidade bate o sino uma vez, irritada. O som segue você até o portão.",
            },
            falha: {
              efeitos: { hp: -999 },
              flags: { entidade_x_tier3: true },
              resultado: "A estrada se abre sob seus pés. O sino toca uma vez, e então tudo fica quieto.",
            },
          },
        },
      ],
    },
    {
      id: "entidade_x_ultima_prova",
      titulo: "A última pergunta",
      tipo: "especial",
      peso: 0.25,
      especial: true,
      entidadeX: true,
      entidadeXAparicoesMin: 6,
      requisitos: { rodadaMin: 8, flags: ["entidade_x_tier3"], flagsAusentes: ["entidade_x_resolvida"] },
      imagem: "assets/eventos-entidade/ultima-pergunta.webp",
      imagemAlt: "Uma figura sem rosto oferece a mão diante de uma estrada vazia",
      texto:
        "A Entidade surge pela última vez no caminho. Ela oferece a mão e espera que você escolha o que fazer com ela.",
      informacoes: "Não há enigma, promessa ou máscara. Você sente que esta resposta encerrará o encontro.",
      opcoes: [
        {
          id: "resistir_ultima",
          texto: "Deixar a mão oferecida suspensa.",
          testeSorte: {
            chance: 68,
            sucesso: {
              efeitos: { honra: 8, hp: -10 },
              entidadeXResistiu: true,
              resultado:
                "A mão se desfaz em poeira escura. A Entidade some da estrada e não encontrará mais este herdeiro.",
            },
            falha: {
              efeitos: { honra: -10, hp: -15 },
              entidadeXCeder: true,
              resultado:
                "Sua mão se fecha sobre a dela. A Entidade sorri sem rosto e leva o que prometeu guardar.",
            },
          },
        },
        {
          id: "seguir_entidade",
          texto: "Encostar a palma na dela.",
          efeitos: { honra: -8 },
          entidadeXCeder: true,
          resultado:
            "A estrada termina num lugar que não existe no mapa. Você retorna sozinho, com uma marca nova na pele.",
        },
      ],
    },
  );
})();
