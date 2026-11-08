(function () {
  "use strict";
  const Jogo = (window.Jogo = window.Jogo || {});

  // Eventos especiais 101–120 fornecidos pelo autor.
  Jogo.registrarEventos(
    ...[
      {
        id: "dama_da_agua",
        titulo: "A dama sob a água",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 8,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Uma mulher de cabelos contra a corrente emerge no rio.",
        informacoes:
          "Diz que devolve tudo o que a água já levou, e que só precisa de algo que o rio ainda não tenha. Ninguém na margem ousa respirar alto. A água ao redor dela está parada.",
        opcoes: [
          {
            id: "espada",
            texto: "Afundar sua espada no rio.",
            requisitos: {
              ataqueMin: 3,
            },
            efeitos: {
              habitantes: 8,
              honra: 3,
              ataque: -2,
            },
            resultado:
              "A lâmina some sem som. Na manhã seguinte, oito pessoas que o rio levara em invernos antigos aparecem à margem, confusas e vivas.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "lembranca",
            texto: "Entregar uma lembrança querida.",
            efeitos: {
              hp: 20,
              honra: -3,
            },
            resultado:
              "Você não sabe mais o nome da primeira pessoa que o ensinou a cavalgar. Sente-se leve, e ligeiramente menor.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "recusar",
            texto: "Agradecer e recusar.",
            efeitos: {
              honra: 2,
            },
            resultado:
              "A mulher afunda sem protestar. O rio volta a correr, e os moradores demoram a se afastar da margem.",
          },
        ],
        imagem: "assets/dama-da-agua.webp",
        imagemAlt: "A dama do lago emerge entre ondas e juncos",
        pacto: true,
      },
      {
        id: "corvo",
        titulo: "O corvo que fala",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 6,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Um corvo pousa no salão e saúda você, seu pai e seu futuro herdeiro.",
        informacoes:
          "Diz que sabe o que as pessoas pensam antes de escolher. O corvo oferece ver o que a vila não vê. Cobra pelo serviço.",
        opcoes: [
          {
            id: "aceitar",
            texto: "Aceitá-lo no ombro.",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              gold: -5,
              honra: -2,
            },
            resultado:
              "O corvo sussurra ao seu ouvido o que cada opção custa aos outros. Você passa a escolher com os olhos abertos.",
            flags: {
              pacto_feito: true,
            },
            efeitoContinuo: {
              revelarHonraRodadas: 5,
            },
            itens: ["amuleto_ultima_guarda"],
          },
          {
            id: "segredo",
            texto: "Pagar por um segredo só.",
            requisitos: {
              goldMin: 2,
            },
            efeitos: {
              gold: 8,
              honra: -3,
            },
            resultado:
              "O corvo conta onde um mercador esconde as moedas. Você as encontra. Ninguém pergunta como.",
          },
          {
            id: "expulsar",
            texto: "Expulsá-lo da casa.",
            efeitos: {
              honra: 1,
            },
            resultado: "O corvo sai pela janela rindo. Por semanas, você ouve pássaros demais nos telhados.",
          },
        ],
        imagem: "assets/corvo.webp",
        imagemAlt: "Corvo de perfil com tapa-olho e uma runa sob as asas",
        pacto: true,
      },
      {
        id: "mercador_sem_sombra",
        titulo: "O mercador sem sombra",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 7,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Um homem de sorriso fácil atravessa o pátio em pleno meio-dia, sem sombra.",
        informacoes:
          "Abre a capa e mostra armaduras, armas e frascos. Diz que aceita qualquer moeda, menos as de ouro. A armadura custa cinco moradores; a lâmina, seis pontos de honra. Pela sombra, ele paga quinze moedas, mas você perde vida e honra.",
        opcoes: [
          {
            id: "armadura",
            texto: "Comprar a armadura do silêncio.",
            efeitos: {
              escudo: 4,
              habitantes: -5,
            },
            resultado:
              "A armadura serve como se tivesse sido feita para você. Cinco moradores partem na mesma noite, sem se despedir, e ninguém fala disso.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "lamina",
            texto: "Comprar a lâmina que nunca erra.",
            efeitos: {
              ataque: 3,
              honra: -6,
            },
            resultado:
              "A lâmina corta o que você aponta. O povo olha para ela e depois para você, calculando quem manda em quem.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "sombra",
            texto: "Vender a própria sombra.",
            efeitos: {
              gold: 15,
              hp: -10,
              honra: -4,
            },
            resultado:
              "Ao meio-dia seguinte, você projeta um pouco menos de chão do que antes. O ouro, porém, é verdadeiro.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "seguir",
            texto: "Deixá-lo seguir.",
            efeitos: {
              honra: 1,
            },
            resultado:
              "O mercador faz uma mesura exagerada e parte. Os cães ladram até o anoitecer, para a estrada vazia.",
          },
        ],
        imagem: "assets/mercador-sem-sombra.webp",
        imagemAlt: "Mercador encapuzado diante de uma balança e sem sombra",
        pacto: true,
      },
      {
        id: "arvore_que_pede",
        titulo: "A árvore que pede",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 5,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Um carvalho antigo abre no tronco uma fenda em forma de boca.",
        informacoes:
          "As raízes se levantaram da terra e apontam para você. Os mais velhos dizem que a árvore já pediu coisas antes, e que quem negou nunca contou o resto.",
        opcoes: [
          {
            id: "sangue",
            texto: "Regar as raízes com seu sangue.",
            efeitos: {
              habitantes: 6,
              honra: 3,
              hp: -12,
            },
            resultado:
              "As folhas caem de uma vez e brotam de novo em um dia. Seis famílias chegam do bosque, dizendo que sonharam com a vila.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "ouvir",
            texto: "Ajoelhar-se e ouvir.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 5,
              escudo: 2,
              habitantes: 4,
            },
            resultado:
              "A árvore não pede nada. Apenas fala, em uma língua que você entende e esquece ao despertar. Os moradores ouvem de longe, comovidos sem saber por quê.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "cortar",
            texto: "Mandar cortar a árvore.",
            efeitos: {
              gold: 8,
              honra: -6,
              habitantes: -4,
            },
            resultado:
              "O machado se parte duas vezes antes de morder. Quando cai, a árvore sangra seiva escura. Quatro famílias deixam a vila antes do pôr do sol.",
          },
        ],
        imagem: "assets/arvore-que-pede.webp",
        imagemAlt: "Árvore antiga com um rosto entalhado e uma mão oferecendo",
        pacto: true,
      },
      {
        id: "cervo_branco",
        titulo: "O cervo de chifres brancos",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 8,
        },
        texto: "Um cervo de pelagem clara e chifres que parecem osso polido cruza o campo sem pressa.",
        informacoes:
          "Os cães não latem, e os caçadores baixam as lanças sem que ninguém ordene. A lenda diz que quem o abate prospera e quem o poupa é lembrado. A lenda não diz qual é melhor.",
        opcoes: [
          {
            id: "abater",
            texto: "Abatê-lo.",
            efeitos: {
              gold: 12,
              honra: -10,
            },
            resultado:
              "Os chifres rendem uma fortuna a um mercador distante. Na vila, os cães não se aproximam de você por muito tempo.",
          },
          {
            id: "poupar",
            texto: "Deixá-lo passar.",
            efeitos: {
              honra: 6,
              habitantes: 4,
            },
            resultado:
              "O cervo olha para você uma vez e some entre as árvores. Quatro famílias do bosque pedem abrigo, dizendo que os animais as guiaram.",
            desbloqueia: { flags: ["druida_herdeiro"] },
          },
          {
            id: "seguir",
            texto: "Segui-lo até a clareira.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              ataque: 2,
              escudo: 2,
              honra: 3,
              hp: -8,
            },
            resultado:
              "A clareira guarda uma pedra coberta de musgo. Você toca nela e volta dois dias depois, mais velho e mais firme.",
          },
        ],
        imagem: "assets/cervo-branco.webp",
        imagemAlt: "Cervo branco parado na orla de uma floresta",
      },
      {
        id: "ceifadeira",
        titulo: "A ceifadeira à mesa",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 10,
        },
        texto: "Na ceia, há um prato a mais na mesa que ninguém lembra de ter posto.",
        informacoes:
          "Uma mulher de manto cinzento senta e pede vinho, com a naturalidade de quem nunca precisou pedir. Ela diz que veio só jantar. Os cães do pátio estão em silêncio.",
        opcoes: [
          {
            id: "conversar",
            texto: "Servir vinho e conversar.",
            efeitos: {
              hp: 20,
              honra: 2,
              habitantes: -2,
            },
            resultado:
              "Ela fala de tudo, menos de mortes. Ao se despedir, deixa o prato limpo. Duas pessoas que dormiam nas casas vizinhas não acordam.",
          },
          {
            id: "barganhar",
            texto: "Barganhar a vida de um moribundo.",
            efeitos: {
              habitantes: 3,
              honra: 4,
              hp: -10,
            },
            resultado:
              "Ela concorda com um aceno cansado. Você se levanta da mesa com a cabeça girando. Três vizinhos, antes à beira da morte, acordam com fome.",
          },
          {
            id: "outro",
            texto: "Pedir que leve outro no seu lugar.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              hp: 25,
              habitantes: -8,
              honra: -10,
            },
            resultado:
              "Ela sorri sem alegria. Na manhã seguinte, oito casas têm cortinas fechadas. A vila nunca mais pergunta nada ao senhor.",
          },
        ],
        imagem: "assets/ceifadeira.webp",
        imagemAlt: "Figura encapuzada da ceifadeira sentada à mesa",
      },
      {
        id: "espelho_do_antecessor",
        titulo: "O espelho do antecessor",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 9,
        },
        texto: "Atrás de uma cortina no salão, você encontra um espelho que não tinha visto.",
        informacoes:
          "Nele, em vez de seu rosto, aparece o do senhor anterior, de costas, olhando para algo que você não vê. O espelho não tem moldura e não reflete a sala.",
        opcoes: [
          {
            id: "olhar",
            texto: "Olhar fixamente.",
            efeitos: {
              honra: 3,
              hp: -5,
            },
            resultado:
              "Ele se vira. Não diz nada. Você sai com os olhos úmidos e uma estranha certeza de que ele esperava mais.",
            desbloqueia: {
              flags: ["antecessor_visto"],
            },
          },
          {
            id: "perguntar",
            texto: "Perguntar o que ele faria.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 4,
              ataque: 1,
              escudo: 1,
              hp: -3,
            },
            resultado:
              "A resposta vem em forma de memória: um dia de batalha que você nunca viveu. Suas mãos passam a saber algo que a cabeça ignora.",
          },
          {
            id: "quebrar",
            texto: "Quebrar o espelho.",
            efeitos: {
              gold: 4,
              honra: -4,
            },
            resultado:
              "Os cacos valem algo para um vidraceiro, mas a vila ouve o barulho e entende que o senhor quebrou algo importante.",
          },
        ],
        imagem: "assets/espelho-do-antecessor.webp",
        imagemAlt: "Espelho antigo refletindo a silhueta de um antecessor",
      },
      {
        id: "fiandeiras",
        titulo: "As três fiandeiras",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 10,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Três velhas fiam sob o carvalho da praça, e ninguém sabe quando chegaram.",
        informacoes:
          "Os fios que enrolam são de cores que não têm nome. Uma delas ergue uma tesoura e pergunta quanto tempo você acha que ainda tem. Os fios pertencem a todos os moradores. Um deles pertence a você.",
        opcoes: [
          {
            id: "longo",
            texto: "Pedir um fio mais longo.",
            efeitos: {
              hp: 30,
              honra: -6,
            },
            resultado:
              "A tesoura corta o fio de outra pessoa para emendar ao seu. Você sente o corpo ficar mais firme. Nunca descobre de quem era.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "vila",
            texto: "Pedir o fio da vila inteira entrelaçado ao seu.",
            efeitos: {
              habitantes: 10,
              hp: -15,
            },
            resultado:
              "O fio da vila se enrola ao seu. Dez novos moradores aparecem pela estrada, sem lembrar por que vieram. Seus joelhos pesam como os de um velho.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "intocado",
            texto: "Pedir que não toquem em nenhum fio.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 4,
            },
            resultado:
              "As velhas se entreolham e voltam a fiar. Quando você olha de novo, a praça está vazia e o carvalho carrega três fitas coloridas.",
          },
        ],
        imagem: "assets/fiandeiras.webp",
        imagemAlt: "Três fiandeiras trabalhando em um único fio",
        pacto: true,
      },
      {
        id: "contrato_vermelho",
        titulo: "O contrato vermelho",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 8,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Um homem muito educado deixa um pergaminho em sua mesa e desaparece pela chaminé.",
        informacoes:
          "O papel está em branco até você tocá-lo, e então as letras surgem em vermelho, com uma caligrafia que parece a sua. O contrato promete força, ouro e proteção. As cláusulas são longas. Há uma linha apagada.",
        opcoes: [
          {
            id: "assinar",
            texto: "Assinar com o próprio sangue.",
            efeitos: {
              gold: 20,
              ataque: 2,
              honra: -10,
              hp: -12,
            },
            resultado:
              "O sangue seca em forma de selo. Seus bolsos pesam e sua mão direita nunca erra. Ninguém na vila mais olha para suas mãos.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "renegociar",
            texto: "Ler as cláusulas e renegociar.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              gold: 10,
              ataque: 1,
              honra: -4,
              hp: -5,
            },
            resultado:
              "Você descobre uma brecha, e o homem aparece para discutir em voz baixa. Ele sai com uma metade do que queria, e você, com a outra.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "povo",
            texto: "Assinar em nome do povo.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              ataque: 4,
              escudo: 4,
              habitantes: -10,
              honra: -12,
            },
            resultado:
              "As casas ficam quietas durante a noite. Pela manhã, dez delas estão vazias, com as portas abertas e o fogo ainda aceso.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "rasgar",
            texto: "Rasgar o contrato.",
            efeitos: {
              honra: 4,
              hp: -6,
            },
            resultado:
              "O papel grita ao ser rasgado, e sua mão queima. A vila acorda com o som e olha para o senhor, sem saber o que viu.",
          },
        ],
        imagem: "assets/contrato-vermelho.webp",
        imagemAlt: "Contrato selado repousando sobre uma mesa",
        pacto: true,
      },
      {
        id: "cavaleiro_de_osso",
        titulo: "O cavaleiro de osso",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 12,
        },
        texto: "Uma armadura enferrujada caminha pela estrada com um arco de ossos no lugar do rosto.",
        informacoes:
          "Não fala. Planta a lança no chão diante do portão e espera. O ataque precisa alcançar a defesa do cavaleiro. Seu escudo reduz o dano recebido, sem se desgastar.",
        opcoes: [
          {
            id: "enfrentar",
            texto: "Enfrentá-lo.",
            combate: true,
          },
          {
            id: "jurar",
            texto: "Jurar lealdade ao cavaleiro.",
            requisitos: {
              honraMin: 50,
              flagsAusentes: ["pacto_feito"],
            },
            efeitos: {
              ataque: 3,
              escudo: 3,
              habitantes: -8,
              honra: -2,
            },
            resultado:
              "O cavaleiro ergue a lança e a abaixa sobre seus ombros. Oito moradores que presenciaram seguem a armadura pela estrada, em silêncio.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "passagem",
            texto: "Pedir passagem pacificamente.",
            efeitos: {
              honra: -3,
            },
            resultado:
              "O cavaleiro não responde. Passa pelo portão, atravessa a vila e some ao norte, sem tocar em ninguém, deixando um vazio atrás.",
          },
        ],
        imagem: "assets/cavaleiro-de-osso.webp",
        imagemAlt: "Cavaleiro de ossos com elmo e espada enferrujada",
        batalha: {
          dadosInimigo: 2,
          defesa: 7,
          vitoria: {
            dano: 22,
            efeitos: {
              honra: 6,
              ataque: 1,
              gold: 10,
            },
            resultado:
              "A armadura desmonta peça por peça. Debaixo dela, há apenas pó e uma moeda antiga. Os moradores nunca esquecem a luta.",
          },
          derrota: {
            dano: 32,
            efeitos: {},
            resultado:
              "Cada golpe seu encontra apenas aço oco. O cavaleiro o derruba sem raiva e vai embora pela estrada.",
          },
          penalidadeFalha: {
            efeitos: {
              honra: -5,
              habitantes: -3,
            },
            texto: "A vila viu o senhor cair. Três famílias partem sem esperar o amanhecer.",
          },
        },
      },
      {
        id: "santa_sem_nome",
        titulo: "A santa sem nome",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 8,
        },
        texto: "Uma mulher descalça entra na vila pedindo apenas água.",
        informacoes:
          "Onde pisa, o barro seca. As crianças a seguem em silêncio e os doentes se arrastam até a porta. Ninguém sabe seu nome. Ela cura, mas diz que cada cura tem um dono.",
        opcoes: [
          {
            id: "vila",
            texto: "Pedir cura para os doentes da vila.",
            efeitos: {
              habitantes: 8,
              honra: 4,
              hp: -8,
            },
            resultado:
              "A santa toca os doentes um a um. Ao terminar, está mais pálida e o senhor, mais cansado. Oito famílias sentem que a vila foi escolhida.",
          },
          {
            id: "si",
            texto: "Pedir cura para si.",
            efeitos: {
              hp: 35,
              honra: -6,
            },
            resultado:
              "Seu corpo parece novo e a vila, desconfiada. Os doentes, nas portas, entendem que foram preteridos.",
          },
          {
            id: "agua",
            texto: "Oferecer água e nada pedir.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 6,
              escudo: 1,
            },
            resultado:
              "Ela bebe devagar. Antes de partir, toca seu escudo. Ele passa a pesar menos e a proteger mais.",
          },
        ],
        imagem: "assets/santa-sem-nome.webp",
        imagemAlt: "Pequena estátua de uma santa sem rosto",
      },
      {
        id: "lobo_pactuario",
        titulo: "O lobo que fala baixo",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 7,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Um lobo cinzento senta no pátio e fala em voz baixa, quase um ronronar.",
        informacoes:
          "Oferece a proteção da matilha em troca de parte do rebanho e de um lugar à mesa. Atrás dele, entre as árvores, dezenas de olhos observam sem piscar.",
        opcoes: [
          {
            id: "matilha",
            texto: "Aceitar o pacto da matilha.",
            efeitos: {
              ataque: 2,
              escudo: 2,
              habitantes: -5,
              honra: -2,
            },
            resultado:
              "A matilha passa a dormir no limite da vila. Cinco moradores somem em semanas, e ninguém acusa os lobos. Ninguém ousa.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "rebanho",
            texto: "Oferecer parte do rebanho, sem pacto.",
            efeitos: {
              honra: 1,
              gold: -3,
            },
            resultado:
              "O lobo come devagar e agradece a hospitalidade. Parte ao anoitecer, e os cães do pátio voltam a latir.",
          },
          {
            id: "expulsar",
            texto: "Expulsá-lo com os guardas.",
            efeitos: {
              honra: 2,
              hp: -8,
            },
            resultado:
              "O lobo recua sem lutar, mas uma dentada profunda em seu braço fica como lembrete. Pelos próximos dias, você ouve uivos que parecem rir.",
          },
        ],
        imagem: "assets/lobo-pactuario.webp",
        imagemAlt: "Lobo olhando para trás sob uma lua estreita",
        pacto: true,
      },
      {
        id: "anjo_cansado",
        titulo: "O anjo cansado",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          honraMin: 30,
          rodadaMin: 12,
        },
        texto: "Um homem de asas encolhidas dorme na porta do celeiro, encolhido sobre palha.",
        informacoes:
          "Tem as mãos queimadas, as penas escuras de fuligem, e chora baixinho quando acorda. Ele diz que carregou a vontade de muitos e que agora só quer descansar. Não pede nada além de um canto.",
        opcoes: [
          {
            id: "pouso",
            texto: "Dar-lhe pouso e silêncio.",
            efeitos: {
              honra: 6,
              habitantes: 8,
            },
            resultado:
              "O anjo dorme por sete dias. Ao partir, deixa uma pena sobre o travesseiro. Oito famílias, tocadas pelo rumor, chegam à vila.",
          },
          {
            id: "bencao",
            texto: "Pedir uma bênção para o povo.",
            efeitos: {
              escudo: 4,
              honra: 4,
              hp: -8,
            },
            resultado:
              "Ele ergue as mãos queimadas e murmura. O cansaço dele passa para você, e a proteção, para a vila.",
          },
          {
            id: "pena",
            texto: "Recolher uma pena como relíquia.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              gold: 20,
              honra: -10,
            },
            resultado:
              "A pena vale uma fortuna a um colecionador. O anjo acorda ao ver a mão, não protesta, e parte sem olhar para trás.",
          },
        ],
        imagem: "assets/anjo-cansado.webp",
        imagemAlt: "Anjo cansado sentado com as asas baixas",
      },
      {
        id: "sussurro_do_ouro",
        titulo: "O sussurro no cofre",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          honraMax: -30,
          goldMin: 5,
          rodadaMin: 9,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "À noite, o cofre fala.",
        informacoes:
          "Primeiro, parece um ranger de metal; depois, uma voz clara que conta as moedas e promete multiplicá-las. A voz não ameaça. Apenas pede que você a ouça até o fim.",
        opcoes: [
          {
            id: "ouvir",
            texto: "Ouvir até o fim.",
            efeitos: {
              gold: 25,
              honra: -8,
              hp: -8,
            },
            resultado:
              "As moedas dobram em uma noite. Você acorda com uma sensação de ter sido contado também.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "morador",
            texto: "Oferecer um morador em troca.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              gold: 40,
              habitantes: -5,
              honra: -12,
            },
            resultado:
              "O cofre engole cinco nomes. As portas ficam abertas durante a noite, e os cães não reconhecem seu cheiro pela manhã.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "esvaziar",
            texto: "Esvaziar o cofre entre o povo.",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              habitantes: 8,
              honra: 6,
              gold: -5,
            },
            resultado:
              "A voz cala. As moedas são repartidas, e oito pessoas que nunca tinham tido uma passam a olhar para você de outro jeito.",
          },
        ],
        imagem: "assets/sussurro-do-ouro.webp",
        imagemAlt: "Cofre aberto com moedas e um rosto sussurrante",
        pacto: true,
      },
      {
        id: "rei_sob_a_colina",
        titulo: "O rei sob a colina",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 14,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Um pastor corre até o salão afirmando que a colina se abriu.",
        informacoes:
          "Dentro, uma fila de soldados de pedra dorme em volta de um trono, e o homem que o ocupa abre os olhos quando você entra. O rei diz que esperou séculos por um senhor digno. Ou desesperado.",
        opcoes: [
          {
            id: "exercito",
            texto: "Pedir o exército adormecido.",
            efeitos: {
              ataque: 4,
              escudo: 4,
              habitantes: -15,
              honra: -4,
            },
            resultado:
              "Os soldados de pedra marcham até as muralhas e se instalam. Quinze moradores, apavorados, partem antes do primeiro dia.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "conselho",
            texto: "Pedir conselho e nada mais.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 5,
              ataque: 1,
              escudo: 1,
              hp: -6,
            },
            resultado:
              "O rei fala por três noites. Você sai da colina com um mapa mental de erros que ainda não cometeu.",
            itens: ["oleo_de_lamina"],
          },
          {
            id: "ouro",
            texto: "Pedir o ouro do trono.",
            efeitos: {
              gold: 30,
              honra: -8,
              hp: -10,
            },
            resultado:
              "O rei não protesta. Suas moedas, porém, nunca pesaram tanto, e à noite os soldados de pedra mudam de posição.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "selar",
            texto: "Selar a colina de novo.",
            efeitos: {
              honra: 3,
              habitantes: 2,
              hp: -6,
            },
            resultado:
              "As pedras voltam ao lugar com esforço da vila inteira. O pastor chora de alívio, e os cães, desde então, evitam a colina.",
          },
        ],
        imagem: "assets/rei-sob-a-colina.webp",
        imagemAlt: "Rei antigo sentado em um salão subterrâneo",
        pacto: true,
      },
      {
        id: "mao_na_janela",
        titulo: "A mão na janela",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 6,
        },
        texto: "Em plena madrugada, uma mão de dedos longos se apoia no parapeito da janela do seu quarto.",
        informacoes:
          "Não bate, não puxa. Apenas espera. O quarto está no segundo andar. A mão não tem braço visível.",
        opcoes: [
          {
            id: "apertar",
            texto: "Apertar a mão.",
            efeitos: {
              hp: 10,
              honra: 2,
              habitantes: -2,
            },
            resultado:
              "A mão é fria e firme. Pela manhã, duas famílias que moravam longe do castelo não estão em casa, e as portas rangem sozinhas.",
          },
          {
            id: "fechar",
            texto: "Fechar a janela.",
            efeitos: {
              hp: -3,
            },
            resultado:
              "A mão recua devagar. Por semanas, você dorme com a janela trancada e acorda sempre antes do amanhecer.",
          },
          {
            id: "moeda",
            texto: "Colocar uma moeda na palma.",
            requisitos: {
              goldMin: 1,
            },
            efeitos: {
              honra: 3,
              gold: -1,
            },
            resultado:
              "A mão se fecha sobre a moeda e some. De manhã, a moeda está no parapeito, mais velha, com o seu rosto gravado.",
          },
        ],
        imagem: "assets/mao-na-janela.webp",
        imagemAlt: "Mão pálida surgindo de uma janela entreaberta",
      },
      {
        id: "relojoeiro",
        titulo: "O relojoeiro do tempo",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 10,
          flagsAusentes: ["pacto_feito"],
        },
        texto: "Um relojoeiro chega à vila com um relógio que marca horas desconhecidas.",
        informacoes:
          "Oferece consertar o que se quebrou entre as pessoas e o tempo. Ele diz que pode apagar o que foi feito. Não diz o que acontece com as consequências.",
        opcoes: [
          {
            id: "erros",
            texto: "Apagar seus erros.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              hp: -10,
              habitantes: -3,
            },
            resultado:
              "As engrenagens giram ao contrário. Os moradores lembram de você como alguém neutro e, por isso, ainda mais assustador. Três pessoas partem sem entender por quê.",
            flags: {
              pacto_feito: true,
            },
            definir: {
              honra: 0,
            },
          },
          {
            id: "acertos",
            texto: "Apagar seus acertos.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              gold: 20,
            },
            resultado:
              "O relojoeiro faz um arranjo discreto. Seus feitos nobres viram boatos, e o cofre ganha um peso estranho. Os moradores lembram que você fez algo importante, mas não o quê.",
            flags: {
              pacto_feito: true,
            },
            definir: {
              honra: 0,
            },
          },
          {
            id: "vida",
            texto: "Pedir mais tempo de vida.",
            efeitos: {
              hp: 25,
              honra: -5,
            },
            resultado:
              "O relógio acelera por um instante, e seu corpo recupera meses perdidos. Algo, em algum lugar, envelhece no seu lugar.",
            flags: {
              pacto_feito: true,
            },
          },
          {
            id: "recusar",
            texto: "Recusar e deixá-lo seguir.",
            efeitos: {
              honra: 1,
            },
            resultado:
              "O relojoeiro ajusta uma engrenagem e parte. Os relógios da vila passam a marcar horas diferentes por uma semana.",
          },
        ],
        imagem: "assets/relojoeiro.webp",
        imagemAlt: "Relojoeiro curvado sobre um relógio aberto",
        pacto: true,
      },
      {
        id: "colheita_de_sombras",
        titulo: "A colheita de sombras",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 9,
        },
        texto: "À noite, uma figura passa pelas casas e corta o chão junto aos adormecidos.",
        informacoes:
          "Pela manhã, ninguém lembra de ter sonhado, e as sombras parecem mais claras. Os moradores acordam descansados. Também mais silenciosos.",
        opcoes: [
          {
            id: "enfrentar",
            texto: "Esperar a figura e enfrentá-la.",
            efeitos: {
              honra: 4,
              ataque: 1,
              hp: -12,
            },
            resultado:
              "A foice acerta seu peito sem ferir. A figura se desfaz em fumaça escura, e as sombras dos moradores voltam ao lugar com um suspiro.",
          },
          {
            id: "comprar",
            texto: "Comprar o que foi colhido · 5 gold",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              habitantes: 5,
              honra: 2,
              gold: -5,
            },
            resultado:
              "A figura aceita as moedas e devolve as sombras. Cinco famílias, aliviadas, passam a dormir melhor, e a se curvar mais.",
          },
          {
            id: "deixar",
            texto: "Deixar a colheita continuar.",
            efeitos: {
              gold: 6,
              honra: -4,
              habitantes: -3,
            },
            resultado:
              "As noites se tornam quietas, e os dias, mais obedientes. Três famílias, que perceberam, partem à noite.",
          },
        ],
        imagem: "assets/colheita-de-sombras.webp",
        imagemAlt: "Espantalho projetando sombras compridas sobre o campo",
      },
      {
        id: "sino_antigo",
        titulo: "A voz do sino antigo",
        tipo: "especial",
        peso: 0.3,
        especial: true,
        requisitos: {
          rodadaMin: 11,
        },
        texto: "Do fundo do lago atrás do bosque, um sino toca sem ninguém tocá-lo.",
        informacoes:
          "As ondas pulsam em compasso com o som, e as crianças dizem que ele chama pelos nomes dos moradores. Ninguém lembra de uma igreja afundada naquele lago.",
        opcoes: [
          {
            id: "mergulhar",
            texto: "Mergulhar para encontrá-lo.",
            efeitos: {
              escudo: 1,
              honra: 5,
              gold: 10,
              hp: -14,
            },
            resultado:
              "A água é gelada e escura. Você traz uma cruz de bronze e uma sensação de ter sido visto por algo maior.",
          },
          {
            id: "responder",
            texto: "Responder ao chamado com um sino da vila.",
            efeitos: {
              habitantes: 5,
              honra: 2,
              gold: -2,
            },
            resultado:
              "O sino da vila ressoa na mesma nota. Cinco pessoas, antes alheias, aparecem à margem sem lembrar de ter sido chamadas.",
          },
          {
            id: "esperar",
            texto: "Tapar os ouvidos e esperar o fim.",
            efeitos: {
              honra: -2,
              habitantes: -2,
            },
            resultado:
              "O som cessa depois de três noites. Duas famílias que o ouviam melhor que as outras partem, e os cães nunca mais se aproximam do lago.",
          },
        ],
        imagem: "assets/sino-antigo.webp",
        imagemAlt: "Sino antigo pendurado em uma viga rachada",
      },
      {
        id: "primeiro_herdeiro",
        titulo: "O primeiro herdeiro",
        tipo: "especial",
        peso: 0.2,
        especial: true,
        requisitos: {
          rodadaMin: 18,
          flagsAusentes: ["pacto_feito"],
          flagsLegado: ["sucessor_pressentido"],
        },
        texto: "Num cômodo fechado há gerações, um homem de armadura antiga se ergue da cadeira.",
        informacoes:
          "Seu rosto lembra o seu, e o de todos os senhores que vieram antes. Ele diz que foi o primeiro a herdar a vontade, e que está cansado de esperar. A vontade que você carrega é mais antiga do que a vila. Ele quer sabê-la inteira.",
        opcoes: [
          {
            id: "aceitar",
            texto: "Aceitar a vontade completa.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 4,
              ataque: 2,
              escudo: 2,
              hp: 20,
              habitantes: -8,
            },
            resultado:
              "Memórias que não são suas se encaixam nas suas. Você enxerga os erros e os acertos de todos os herdeiros. Oito moradores, tocados pela aura, deixam a vila por uma estrada que só eles veem.",
            flags: {
              pacto_feito: true,
            },
            desbloqueia: {
              flags: ["vontade_completa"],
            },
          },
          {
            id: "recusar",
            texto: "Recusar a vontade e seguir o próprio caminho.",
            efeitos: {
              honra: 6,
              habitantes: 4,
              hp: -10,
            },
            resultado:
              "O homem abaixa a cabeça e some como fumaça. Quatro famílias, que ouviram falar de um novo senhor, chegam à vila.",
            desbloqueia: {
              flags: ["vontade_recusada"],
            },
          },
          {
            id: "coroa",
            texto: "Tomar a coroa dele.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              ataque: 4,
              gold: 30,
              honra: -12,
              habitantes: -12,
            },
            resultado:
              "O primeiro herdeiro não luta. Entrega a coroa e se desfaz. Doze moradores acordam sem saber o próprio nome e deixam a vila na manhã seguinte.",
            flags: {
              pacto_feito: true,
            },
            desbloqueia: {
              flags: ["coroa_tomada"],
            },
          },
        ],
        imagem: "assets/primeiro-herdeiro.webp",
        imagemAlt: "Primeiro herdeiro usando uma coroa antiga",
        pacto: true,
      },
    ],
  );
})();
