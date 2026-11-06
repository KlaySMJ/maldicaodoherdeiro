(function () {
  "use strict";
  const Jogo = (window.Jogo = window.Jogo || {});

  // Eventos 28–100 fornecidos pelo autor.
  Jogo.registrarEventos(
    ...[
      {
        id: "moinho_parado",
        titulo: "Moinho parado",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          flagsAusentes: ["moinho_decidido"],
        },
        texto: "A roda do moinho parou de girar. O moleiro jura que o rio mudou de ideia; o rio não comenta.",
        informacoes: "Sem moinho, o pão encarece e a praça esvazia.",
        opcoes: [
          {
            id: "consertar",
            texto: "Pagar o conserto · 4 gold",
            requisitos: {
              goldMin: 4,
            },
            efeitos: {
              habitantes: 3,
              honra: 2,
              gold: -4,
            },
            resultado:
              "A roda volta a girar. Três famílias de padeiros se mudam para perto do cheiro de pão.",
            flags: {
              moinho_decidido: true,
              moinho_reparado: true,
            },
          },
          {
            id: "canal",
            texto: "Limpar o canal com as próprias mãos.",
            efeitos: {
              honra: 3,
              hp: -7,
            },
            resultado:
              "Você tira galhos, lama e um sapato que ninguém reconhece. A roda gira, e suas costas reclamam por uma semana.",
            flags: {
              moinho_decidido: true,
              moinho_reparado: true,
            },
          },
          {
            id: "vender",
            texto: "Vender a pedra do moinho.",
            efeitos: {
              gold: 6,
              habitantes: -2,
              honra: -3,
            },
            resultado:
              "A pedra rende 6 gold. O moleiro parte com o filho, e o silêncio no vale passa a ter eco.",
            flags: {
              moinho_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante moinho parado",
      },
      {
        id: "farinha_nova",
        titulo: "Farinha nova",
        tipo: "encontro",
        peso: 3,
        requisitos: {
          flags: ["moinho_reparado"],
          flagsAusentes: ["farinha_decidida"],
        },
        texto:
          "O moinho trabalha de novo e a farinha sai mais branca do que a vila está acostumada. Padeiros de três povoados querem comprar.",
        informacoes: "O excedente pode virar moedas, pão ou reserva para o inverno.",
        opcoes: [
          {
            id: "vender",
            texto: "Vender aos padeiros.",
            efeitos: {
              gold: 6,
              honra: 1,
            },
            resultado:
              "Os padeiros pagam em dia e prometem voltar. O moleiro guarda parte das moedas num pote que já tinha dono.",
            flags: {
              farinha_decidida: true,
            },
          },
          {
            id: "assar",
            texto: "Assar pão para as casas.",
            efeitos: {
              habitantes: 4,
              honra: 3,
            },
            resultado:
              "O cheiro atravessa a vila e a estrada. Quatro viajantes chegam sem terem sido convidados.",
            flags: {
              farinha_decidida: true,
            },
          },
          {
            id: "guardar",
            texto: "Guardar a farinha para o inverno.",
            efeitos: {
              hp: 8,
            },
            resultado:
              "Os sacos enchem o celeiro. Você dorme melhor, embora o celeireiro conte cada saco duas vezes.",
            flags: {
              farinha_decidida: true,
            },
          },
          {
            id: "padaria",
            texto: "Abrir a padaria do povo.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              habitantes: 6,
              honra: 3,
            },
            resultado:
              "O povo assa junto, e o forno nunca esfria. Seis famílias descobrem que podem confiar no senhor.",
            flags: {
              farinha_decidida: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante farinha nova",
      },
      {
        id: "bardo",
        titulo: "O bardo de uma canção só",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          flagsAusentes: ["bardo_decidido"],
        },
        texto:
          "Um bardo chega pedindo pouso e promete compor uma canção sobre o senhor da vila. Não diz quando, nem como ela termina.",
        informacoes: "Canções correm mais rápido que cavalos, para o bem e para o mal.",
        opcoes: [
          {
            id: "abrigar",
            texto: "Dar abrigo e pão.",
            efeitos: {
              honra: 2,
              gold: -1,
            },
            resultado:
              "O bardo dorme perto do fogo e parte antes da aurora. Deixa um verso rabiscado na parede.",
            flags: {
              bardo_decidido: true,
              bardo_cantou: true,
            },
          },
          {
            id: "exigir",
            texto: "Exigir uma canção de graça.",
            efeitos: {
              gold: 2,
              honra: -2,
            },
            resultado: "O bardo canta de cara fechada. Os moradores aplaudem por educação e riem do final.",
            flags: {
              bardo_decidido: true,
              bardo_cantou: true,
            },
          },
          {
            id: "recusar",
            texto: "Mandá-lo embora.",
            efeitos: {
              honra: -1,
            },
            resultado:
              "Ele ergue as sobrancelhas e segue pela estrada, cantarolando algo que soa familiar demais.",
            flags: {
              bardo_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o bardo de uma canção só",
      },
      {
        id: "cancao_que_corre",
        titulo: "A canção que corre",
        tipo: "encontro",
        peso: 3,
        requisitos: {
          rodadaMin: 7,
          flags: ["bardo_cantou"],
          flagsAusentes: ["cancao_resolvida"],
        },
        texto:
          "Um estranho cantarola na praça uma canção sobre a vila. Ele erra o nome do senhor, mas acerta quase tudo o mais.",
        informacoes: "A canção já chegou a lugares onde a vila nunca foi.",
        opcoes: [
          {
            id: "aprender",
            texto: "Aprender a canção com ele.",
            requisitos: {
              honraMin: -29,
            },
            efeitos: {
              habitantes: 4,
              honra: 2,
            },
            resultado:
              "A canção foi bem generosa com você. Quatro viajantes chegam pedindo para viver nessa vila.",
            flags: {
              cancao_resolvida: true,
            },
          },
          {
            id: "pagar",
            texto: "Pagar para mudar um verso · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              honra: 1,
              gold: -3,
            },
            resultado:
              "O estranho troca um verso por moedas. Ninguém na praça nota a diferença, exceto você.",
            flags: {
              cancao_resolvida: true,
            },
          },
          {
            id: "calar",
            texto: "Calar o cantor.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              habitantes: -3,
              honra: -5,
            },
            resultado: "A praça silencia. Três pessoas partem sem dizer nada e cantarolam pela estrada.",
            flags: {
              cancao_resolvida: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a canção que corre",
      },
      {
        id: "gado_perdido",
        titulo: "Gado perdido",
        tipo: "encontro",
        peso: 2,
        texto:
          "Metade do rebanho sumiu antes do amanhecer. Há pegadas de gado e de botas, mas nenhuma delas leva ao mesmo lugar.",
        informacoes: "O rebanho alimenta a vila e paga parte dos impostos.",
        opcoes: [
          {
            id: "seguir",
            texto: "Seguir as pegadas pessoalmente.",
            efeitos: {
              honra: 2,
              gold: 2,
              hp: -6,
            },
            resultado:
              "Você encontra o gado em um vale e uma cerca quebrada. Volta com lama até o pescoço e as vacas, mais ou menos intactas.",
          },
          {
            id: "rastreador",
            texto: "Contratar um rastreador · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              habitantes: 2,
              gold: -3,
            },
            resultado:
              "O rastreador recupera o rebanho em um dia. Dois pastores que pensavam em partir ficam.",
          },
          {
            id: "culpar",
            texto: "Culpar os vizinhos.",
            efeitos: {
              gold: 3,
              honra: -3,
              habitantes: -2,
            },
            resultado:
              "A multa enche o cofre, mas duas famílias acusadas partem. O gado aparece dias depois, no mesmo vale de sempre.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante gado perdido",
      },
      {
        id: "lobos",
        titulo: "Lobos na neve",
        tipo: "batalha",
        peso: 2,
        texto:
          "Lobos magros rondam o curral. Eles entram à noite e saem antes que alguém aprenda seus nomes.",
        informacoes:
          "O ataque precisa alcançar a defesa da matilha. Seu escudo reduz o dano recebido, sem se desgastar.",
        opcoes: [
          {
            id: "guardar",
            texto: "Montar guarda no curral.",
            combate: true,
          },
          {
            id: "fogueiras",
            texto: "Soltar fogueiras no curral.",
            efeitos: {
              habitantes: -2,
              honra: -1,
            },
            resultado: "Os lobos recuam, o feno queima. Dois pastores culpam você e partem.",
          },
        ],
        batalha: {
          defesa: 3,
          vitoria: {
            dano: 11,
            efeitos: {
              honra: 3,
              gold: 2,
            },
            resultado: "A matilha foge deixando uma pele para vender. O curral dorme em paz.",
          },
          derrota: {
            dano: 18,
            efeitos: {},
            resultado: "Os lobos rompem a cerca e levam o que podem. Você volta com mordidas e vergonha.",
          },
          penalidadeFalha: {
            efeitos: {
              habitantes: -3,
            },
            texto: "Três pastores desistem da vila.",
          },
        },
        imagem: "assets/batalha.webp",
        imagemAlt: "Cena da vila durante lobos na neve",
      },
      {
        id: "prisioneiro",
        titulo: "A fuga do prisioneiro",
        tipo: "desordem",
        peso: 1,
        requisitos: {
          flagsAusentes: ["prisioneiro_decidido"],
        },
        multiplicadoresPeso: [
          {
            requisitos: {
              honraMax: -30,
            },
            multiplicador: 5,
          },
        ],
        texto:
          "A tranca da cela foi arrombada por dentro. O prisioneiro foi pego na cerca, ferido, e pede para falar com você.",
        informacoes: "Ele afirma que foi preso por roubar pão. Ninguém lembra o julgamento.",
        opcoes: [
          {
            id: "ouvir",
            texto: "Ouvi-lo antes de decidir.",
            requisitos: {
              honraMin: -49,
            },
            efeitos: {
              honra: 3,
              gold: -2,
            },
            resultado:
              "A história é esquisita e quase verdadeira. Você paga o pão que ele roubou e solta o homem.",
            flags: {
              prisioneiro_decidido: true,
              prisioneiro_solto: true,
            },
          },
          {
            id: "devolver",
            texto: "Devolver à cela.",
            efeitos: {
              honra: -1,
            },
            resultado: "A tranca é consertada. O homem não grita; os outros presos também ouvem.",
            flags: {
              prisioneiro_decidido: true,
            },
          },
          {
            id: "enforcar",
            texto: "Enforcá-lo como exemplo.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              habitantes: -3,
              honra: -6,
            },
            resultado: "Ninguém mais tenta fugir. Três famílias se mudam para longe da forca.",
            flags: {
              prisioneiro_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a fuga do prisioneiro",
      },
      {
        id: "prisioneiro_volta",
        titulo: "O prisioneiro volta",
        tipo: "encontro",
        peso: 3,
        requisitos: {
          rodadaMin: 10,
          flags: ["prisioneiro_solto"],
          flagsAusentes: ["prisioneiro_pago"],
        },
        texto:
          "O homem que você soltou volta com uma mula e um saco. Diz que deve algo a alguém, e esse alguém é você.",
        informacoes: "Ele não parece perigoso, mas parece decidido.",
        opcoes: [
          {
            id: "receber",
            texto: "Receber o pagamento.",
            efeitos: {
              gold: 5,
              honra: 2,
            },
            resultado:
              "O saco está cheio de sal e moedas. Ele pede um lugar na vila e promete nunca mais roubar pão.",
            flags: {
              prisioneiro_pago: true,
            },
          },
          {
            id: "guarda",
            texto: "Pedir que fique como guarda.",
            efeitos: {
              ataque: 1,
              habitantes: 1,
            },
            resultado: "Ele recusa a espada, mas ensina os guardas a encostar a lâmina no lugar certo.",
            flags: {
              prisioneiro_pago: true,
            },
          },
          {
            id: "seguir",
            texto: "Mandá-lo seguir viagem.",
            efeitos: {
              honra: -1,
            },
            resultado: "Ele vira a mula e parte sem protestar. O saco fica pesado na sua consciência.",
            flags: {
              prisioneiro_pago: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o prisioneiro volta",
      },
      {
        id: "cofre_vazio",
        titulo: "O cofre vazio",
        tipo: "desordem",
        peso: 1,
        requisitos: {
          goldMin: 3,
        },
        multiplicadoresPeso: [
          {
            requisitos: {
              honraMax: -30,
            },
            multiplicador: 5,
          },
        ],
        texto:
          "O cofre foi aberto durante a noite sem arrombar a fechadura. Apenas quem conhece o esconderijo poderia ter feito isso.",
        informacoes: "Alguém próximo de você sabe onde guardas o ouro.",
        opcoes: [
          {
            id: "interrogar",
            texto: "Interrogar a criadagem.",
            efeitos: {
              gold: -3,
              honra: -3,
              habitantes: -2,
            },
            resultado: "O culpado confessa para parar a dor. As moedas voltam em parte, a confiança, nunca.",
          },
          {
            id: "trocar",
            texto: "Trocar o esconderijo e seguir em frente.",
            efeitos: {
              gold: -3,
            },
            resultado: "Você aprende a lição. A criadagem aprende que você a conhece.",
          },
          {
            id: "perdoar",
            texto: "Perdoar o ladrão que se apresentar.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 3,
              habitantes: 1,
              gold: -3,
            },
            resultado:
              "Um jovem cozinheiro devolve o que sobrou e pede perdão. Ele passa a vigiar o cofre do lado de dentro.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o cofre vazio",
      },
      {
        id: "casamento",
        titulo: "Casamento na praça",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          honraMin: 30,
        },
        texto:
          "Dois jovens de famílias rivais querem casar sob a árvore velha. Os pais fingem que isso não está acontecendo.",
        informacoes: "Você pode presidir a cerimônia, ceder o salão ou pedir um dote aos noivos.",
        opcoes: [
          {
            id: "presidir",
            texto: "Presidir a cerimônia.",
            efeitos: {
              habitantes: 4,
              honra: 3,
            },
            resultado:
              "As famílias dançam, de má vontade e depois de boa. Quatro parentes distantes pedem para ficar.",
          },
          {
            id: "salao",
            texto: "Oferecer o salão de banquetes · 4 gold",
            requisitos: {
              goldMin: 4,
            },
            efeitos: {
              habitantes: 5,
              honra: 2,
              gold: -4,
            },
            resultado: "A festa dura dois dias. Cinco convidados nunca mais voltam para casa.",
          },
          {
            id: "dote",
            texto: "Pedir um dote ao noivo.",
            efeitos: {
              gold: 5,
              honra: -3,
            },
            resultado: "A cerimônia ocorre sem alegria. Os jovens se casam, e ninguém dança.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante casamento na praça",
      },
      {
        id: "seca",
        titulo: "A seca",
        tipo: "mandatorio",
        peso: 1,
        protecaoCeleiro: true,
        texto:
          "As nuvens passam sem parar. Os poços descem, e os campos racham. À noite, você divide sua água com quem não tem.",
        informacoes: "A seca não negocia. Resta decidir como atravessá-la.",
        opcoes: [
          {
            id: "repartir",
            texto: "Repartir a água com todos.",
            efeitos: {
              honra: 2,
              hp: -8,
              habitantes: -3,
            },
            resultado:
              "A água dura até a chuva. Três famílias partem em busca de terras mais úmidas; o resto fica, mais magro e mais unido.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a seca",
      },
      {
        id: "padre",
        titulo: "O padre sem igreja",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          flagsAusentes: ["padre_decidido"],
        },
        texto:
          "Um padre de batina remendada pede abrigo. Diz que sua igreja ardeu e que ainda tem fé, mas não tem teto.",
        informacoes: "A fé pode ser um bom alicerce ou um bom pretexto.",
        opcoes: [
          {
            id: "celeiro",
            texto: "Dar o celeiro velho como capela.",
            efeitos: {
              habitantes: 3,
              honra: 2,
            },
            resultado: "O padre varre o chão e acende duas velas. Três famílias passam a frequentar.",
            flags: {
              padre_decidido: true,
              padre_aceito: true,
              capela_erguida: true,
            },
          },
          {
            id: "dizimo",
            texto: "Exigir um dízimo para ficar.",
            efeitos: {
              gold: 4,
              honra: -3,
            },
            resultado: "O padre paga e agradece em latim. O povo percebe a transação e para de se confessar.",
            flags: {
              padre_decidido: true,
              padre_aceito: true,
            },
          },
          {
            id: "recusar",
            texto: "Recusar abrigo.",
            efeitos: {
              honra: -2,
            },
            resultado: "Ele ergue a mão num gesto que pode ser bênção ou ameaça, e segue.",
            flags: {
              padre_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o padre sem igreja",
      },
      {
        id: "capela",
        titulo: "A capela",
        tipo: "encontro",
        peso: 3,
        requisitos: {
          rodadaMin: 8,
          flags: ["padre_aceito"],
          flagsAusentes: ["capela_decidida"],
        },
        texto:
          "O padre pede pedras e mãos para erguer uma capela de verdade. A vila discute se prefere um teto novo ou um sino.",
        informacoes: "Você pode ajudar a erguer a capela, pagar pedreiros ou dispensar o padre.",
        opcoes: [
          {
            id: "erguer",
            texto: "Erguer a capela com o povo.",
            efeitos: {
              habitantes: 5,
              honra: 3,
              hp: -6,
            },
            resultado:
              "Você carrega pedras até cair de sono. A capela ergue-se torta e bela, e cinco famílias pedem para ficar.",
            flags: {
              capela_decidida: true,
              capela_erguida: true,
            },
          },
          {
            id: "pagar",
            texto: "Pagar pedreiros · 5 gold",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              habitantes: 4,
              honra: 2,
              gold: -5,
            },
            resultado: "A capela fica reta e fria. Quatro viajantes ficam por causa do sino.",
            flags: {
              capela_decidida: true,
              capela_erguida: true,
            },
          },
          {
            id: "dispensar",
            texto: "Dispensar o padre.",
            efeitos: {
              honra: -3,
              habitantes: -2,
            },
            resultado: "O padre parte com o sino debaixo do braço. Duas famílias, devotas, o acompanham.",
            flags: {
              capela_decidida: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a capela",
      },
      {
        id: "menino_vai_embora",
        titulo: "O menino vai embora",
        tipo: "encontro",
        peso: 3,
        requisitos: {
          rodadaMin: 8,
          flags: ["orfao_explorado"],
          flagsAusentes: ["orfao_resolvido"],
          tracosAusentes: ["menino_cronista"],
        },
        texto:
          "O menino que carregava sacos fez uma trouxa menor do que as dívidas que você lhe deve. Ele está parado no portão e não chora.",
        informacoes:
          "Você pode pedir que ele fique, pagar o que lhe deve ou mandar os guardas fecharem o portão.",
        opcoes: [
          {
            id: "perdao",
            texto: "Pedir perdão e oferecer lugar à mesa.",
            requisitos: {
              honraMin: -49,
            },
            efeitos: {
              habitantes: 2,
              honra: 4,
            },
            resultado: "Ele pensa por muito tempo. Fica, mas com a porta aberta. A vila respira.",
            flags: {
              orfao_resolvido: true,
            },
          },
          {
            id: "pagar",
            texto: "Pagar pelo trabalho que ele fez · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              honra: 2,
              gold: -3,
            },
            resultado:
              "Ele conta as moedas duas vezes e parte. Os moradores o acompanham com os olhos até a curva.",
            flags: {
              orfao_resolvido: true,
            },
          },
          {
            id: "trancar",
            texto: "Mandar os guardas trancarem o portão.",
            efeitos: {
              habitantes: -3,
              honra: -5,
            },
            resultado:
              "O portão é fechado, o menino não. Ele sai por uma brecha, e três famílias vão atrás dele.",
            flags: {
              orfao_resolvido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o menino vai embora",
      },
      {
        id: "cinzas_da_praga",
        titulo: "Cinzas da praga",
        tipo: "desordem",
        peso: 4,
        requisitos: {
          flags: ["praga_entrou"],
          flagsAusentes: ["cinzas_resolvidas"],
        },
        texto:
          "As casas dos mortos continuam fechadas. Há quem queira queimá-las, quem queira saqueá-las, e quem não queira ir lá.",
        informacoes: "A febre passou, mas deixou perguntas.",
        opcoes: [
          {
            id: "queimar",
            texto: "Queimar as casas com respeito.",
            efeitos: {
              honra: 3,
              hp: -5,
            },
            resultado: "A fumaça sobe devagar. Você respira cinzas, mas ninguém mais adoece.",
            flags: {
              cinzas_resolvidas: true,
            },
          },
          {
            id: "recolher",
            texto: "Permitir que os parentes recolham os bens.",
            efeitos: {
              honra: 2,
              habitantes: -3,
            },
            resultado:
              "Alguns parentes levam mais que o necessário e partem com a carga. Três famílias seguem por perto.",
            flags: {
              cinzas_resolvidas: true,
            },
          },
          {
            id: "tomar",
            texto: "Tomar os bens para o cofre.",
            efeitos: {
              gold: 6,
              honra: -5,
              habitantes: -2,
            },
            resultado: "Seus guardas esvaziam as casas. As moedas pesam no cofre, e as famílias no peito.",
            flags: {
              cinzas_resolvidas: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante cinzas da praga",
      },
      {
        id: "imunes",
        titulo: "Os que ficaram de pé",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          flags: ["praga_evitada"],
          flagsAusentes: ["imunes_decidido"],
        },
        texto:
          "A curandeira diz que a vila nunca esteve tão saudável. Ela pergunta, sem acusar, se o senhor sabia mais do que contou.",
        informacoes: "A praga que não chegou ainda circula nas conversas.",
        opcoes: [
          {
            id: "verdade",
            texto: "Contar a verdade.",
            efeitos: {
              honra: 2,
              habitantes: 2,
            },
            resultado: "A praça ouve em silêncio. Duas famílias que temiam partir decidem ficar.",
            flags: {
              imunes_decidido: true,
            },
          },
          {
            id: "sorte",
            texto: "Dizer que foi sorte.",
            efeitos: {
              honra: 1,
            },
            resultado: "A curandeira concorda sem acreditar. O povo prefere a versão simples.",
            flags: {
              imunes_decidido: true,
            },
          },
          {
            id: "cobrar",
            texto: "Cobrar pelas ervas protetoras",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              gold: 5,
              honra: -4,
            },
            resultado: "A vila paga, sem entender pelo quê. A curandeira nota e não diz nada.",
            flags: {
              imunes_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante os que ficaram de pé",
      },
      {
        id: "carta_do_velho",
        titulo: "A carta do velho senhor",
        tipo: "encontro",
        peso: 3,
        requisitos: {
          rodadaMin: 8,
          flags: ["testamento_lido"],
          flagsAusentes: ["carta_lida"],
        },
        texto:
          "Um antigo servo traz um envelope que o velho senhor mandou guardar. Diz que só deveria entregá-lo quando você hesitasse.",
        informacoes: "A carta é breve e não explica quase nada.",
        opcoes: [
          {
            id: "ler",
            texto: "Ler em voz alta para a vila.",
            efeitos: {
              honra: 3,
              habitantes: 2,
            },
            resultado: "A carta pede paciência ao povo. Dois moradores choram e outros dois decidem ficar.",
            flags: {
              carta_lida: true,
            },
          },
          {
            id: "guardar",
            texto: "Ler a sós e guardá-la.",
            efeitos: {
              honra: 1,
            },
            resultado: "A carta tem uma frase que você relê três vezes. O servo não pergunta o que diz.",
            flags: {
              carta_lida: true,
            },
          },
          {
            id: "queimar",
            texto: "Queimar sem ler.",
            efeitos: {
              honra: -3,
            },
            resultado: "O papel vira cinza. O servo faz o sinal da cruz e parte para sempre.",
            flags: {
              carta_lida: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a carta do velho senhor",
      },
      {
        id: "rosto_do_velho",
        titulo: "O rosto do velho senhor",
        tipo: "encontro",
        peso: 3,
        requisitos: {
          rodadaMin: 12,
          flags: ["carta_lida"],
          flagsAusentes: ["rosto_decidido"],
        },
        texto: "Uma velha na praça diz que você tem o olhar do senhor anterior. Não sabe se é elogio.",
        informacoes: "Você pode ouvir as lembranças da velha, negar a semelhança ou mandá-la calar.",
        opcoes: [
          {
            id: "perguntar",
            texto: "Perguntar o que ela recorda.",
            efeitos: {
              honra: 2,
              hp: -2,
            },
            resultado:
              "A história é longa e triste. Você sai com o peito mais pesado e a vila, mais próxima.",
            flags: {
              rosto_decidido: true,
            },
            desbloqueia: {
              flags: ["senhor_compreendido"],
            },
          },
          {
            id: "outro",
            texto: "Dizer que você é outro homem.",
            efeitos: {
              honra: 1,
            },
            resultado: "A velha sorri sem concordar. O povo observa se o olhar muda.",
            flags: {
              rosto_decidido: true,
            },
          },
          {
            id: "calar",
            texto: "Mandar calar a velha.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              honra: -4,
              habitantes: -2,
            },
            resultado:
              "A velha cala. Duas famílias, que também lembravam do velho senhor, partem na mesma noite.",
            flags: {
              rosto_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o rosto do velho senhor",
      },
      {
        id: "incendio",
        titulo: "O celeiro em chamas",
        tipo: "mandatorio",
        peso: 1,
        texto:
          "O fogo começa no celeiro e pula para o telhado vizinho. Você corre com baldes ao lado do povo, sem saber quem acendeu.",
        informacoes: "O fogo não pergunta quem é o senhor.",
        opcoes: [
          {
            id: "combater",
            texto: "Combater o fogo com o povo.",
            efeitos: {
              honra: 2,
              hp: -8,
              habitantes: -2,
            },
            resultado: "As chamas cedem ao amanhecer. Duas famílias, sem teto, seguem para o sul.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o celeiro em chamas",
      },
      {
        id: "ladroes_estrada",
        titulo: "Ladrões na estrada",
        tipo: "batalha",
        peso: 2,
        texto:
          "Uma carroça de grãos foi cercada na curva do bosque. O cocheiro volta a pé, sem a carroça e sem o chapéu.",
        informacoes:
          "O ataque precisa alcançar a defesa dos ladrões. Seu escudo reduz o dano recebido, sem se desgastar.",
        opcoes: [
          {
            id: "perseguir",
            texto: "Perseguir os ladrões.",
            combate: true,
          },
          {
            id: "pagar",
            texto: "Pagar o resgate da carga · 4 gold",
            requisitos: {
              goldMin: 4,
            },
            efeitos: {
              gold: -4,
              honra: -1,
            },
            resultado: "A carga volta para o cocheiro. Os ladrões levam as moedas e somem no bosque.",
          },
        ],
        batalha: {
          defesa: 3,
          vitoria: {
            dano: 11,
            efeitos: {
              honra: 3,
              gold: 4,
            },
            resultado:
              "Os ladrões largam a carga e correm. O cocheiro recupera o chapéu e promete contar a história por anos.",
          },
          derrota: {
            dano: 18,
            efeitos: {},
            resultado:
              "Os ladrões conhecem o bosque melhor que seus homens. Você volta com mais cortes do que provas.",
          },
          penalidadeFalha: {
            efeitos: {
              gold: -3,
              habitantes: -2,
            },
            texto: "O resgate leva 3 gold e dois ajudantes desistem de seguir viagem.",
          },
        },
        imagem: "assets/batalha.webp",
        imagemAlt: "Cena da vila durante ladrões na estrada",
      },
      {
        id: "torneio",
        titulo: "O torneio da aldeia",
        tipo: "encontro",
        peso: 2,
        texto:
          "Os jovens querem testar quem dá o melhor golpe com bastões de madeira. Um deles já escolheu seu adversário: você.",
        informacoes: "Você pode enfrentar o rapaz, premiar o vencedor ou proibir os jogos.",
        opcoes: [
          {
            id: "aceitar",
            texto: "Aceitar o desafio.",
            efeitos: {
              ataque: 1,
              honra: 2,
              hp: -6,
            },
            resultado:
              "Você perde dois rounds e ganha o terceiro por teimosia. A praça aplaude, e seu ombro, não.",
          },
          {
            id: "premiar",
            texto: "Premiar o vencedor · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              habitantes: 3,
              honra: 2,
              gold: -3,
            },
            resultado:
              "O vencedor ganha uma bolsa e a fama de ser seu favorito. Três jovens pedem para treinar na vila.",
          },
          {
            id: "proibir",
            texto: "Proibir o torneio.",
            efeitos: {
              honra: -2,
              habitantes: -1,
            },
            resultado:
              "Os bastões voltam aos fornos. Um jovem desistiu de ficar e tira a vila da lista dos seus planos.",
          },
        ],
        imagem: "assets/forja.webp",
        imagemAlt: "Cena da vila durante o torneio da aldeia",
      },
      {
        id: "arauto_do_rei",
        titulo: "O arauto do rei",
        tipo: "encontro",
        peso: 1,
        requisitos: {
          rodadaMin: 6,
          flagsAusentes: ["arauto_decidido"],
        },
        texto:
          "Um arauto de tabardo limpo anuncia que o rei quer saber quantos homens a vila pode oferecer à guerra. A voz dele é maior que o corpo.",
        informacoes: "O rei está distante, mas a convocação nunca esteve tão perto.",
        opcoes: [
          {
            id: "enviar",
            texto: "Enviar soldados e cumprir o dever.",
            efeitos: {
              gold: 5,
              honra: 1,
              habitantes: -4,
            },
            resultado:
              "Quatro jovens partem com lanças emprestadas. O arauto paga e escreve seu nome num rolo que você não vê.",
            flags: {
              arauto_decidido: true,
            },
          },
          {
            id: "alegar",
            texto: "Alegar que a vila é pobre.",
            efeitos: {
              honra: -2,
            },
            resultado: 'O arauto anota "pobre" sem acreditar. Não promete nada, mas também não ameaça.',
            flags: {
              arauto_decidido: true,
            },
          },
          {
            id: "negociar",
            texto: "Negociar um tributo em grãos.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 2,
              gold: -3,
            },
            resultado:
              "O arauto aceita grãos em vez de homens. O povo percebe e agradece com o silêncio de quem quer dizer mais.",
            flags: {
              arauto_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o arauto do rei",
      },
      {
        id: "espiao",
        titulo: "O espião de sotaque estranho",
        tipo: "encontro",
        narrativamenteUnico: true,
        oncePerRun: true,
        peso: 1,
        texto:
          "Um forasteiro pergunta demais sobre o moinho, o celeiro e a idade dos guardas. Diz que é só curiosidade, e cada pergunta tem um carimbo diferente.",
        informacoes: "Ele pode ser um espião, ou apenas um sujeito muito curioso.",
        opcoes: [
          {
            id: "seguir",
            texto: "Segui-lo discretamente.",
            efeitos: {
              honra: 2,
              gold: 3,
              hp: -4,
            },
            resultado:
              "Você descobre que ele anota tudo em código. O forasteiro foge, deixando o dinheiro para trás.",
          },
          {
            id: "prender",
            texto: "Prendê-lo para interrogar.",
            efeitos: {
              honra: -3,
            },
            resultado:
              "A prisão só rende negativas. Os moradores perguntam se prender curiosos agora é norma da vila.",
          },
          {
            id: "conversar",
            texto: "Oferecer-lhe um copo e conversar.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 3,
              habitantes: 2,
            },
            resultado: "Ele era apenas um cartógrafo em dificuldade. Seu mapa leva dois colonos até a vila.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o espião de sotaque estranho",
      },
      {
        id: "bruxa",
        titulo: "A bruxa da floresta",
        tipo: "encontro",
        peso: 2,
        grupoRecorrencia: "bruxa",
        texto:
          "Uma mulher de olhos cansados oferece uma poção em troca de uma conversa. Os moradores a chamam de bruxa; ela não discorda nem confirma.",
        informacoes: "Ninguém sabe se a poção cura ou apenas colore a língua.",
        opcoes: [
          {
            id: "beber",
            texto: "Beber a poção.",
            efeitos: {
              hp: 14,
              honra: 1,
              gold: -2,
            },
            resultado:
              "A poção tem gosto de terra e promessa. Você recupera catorze de vida e uma sensação de dívida.",
          },
          {
            id: "ouvir",
            texto: "Ouvi-la em vez de comprar.",
            efeitos: {
              honra: 3,
            },
            resultado:
              "Ela fala do bosque, das raízes e dos ancestrais. Ninguém na vila sabe o que você ouviu.",
          },
          {
            id: "acusar",
            texto: "Acusá-la perante o povo.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              honra: -5,
              habitantes: -3,
            },
            resultado:
              "A mulher desaparece antes do julgamento. Três moradores, que a conheciam, partem para protegê-la.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a bruxa da floresta",
      },
      {
        id: "feira",
        titulo: "A feira da colheita",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          honraMin: 30,
        },
        texto:
          "Os moradores montaram bancas sem que ninguém mandasse. Há pão, couro, ferro, e um único espelho que ninguém conseguiu vender.",
        informacoes:
          "Você pode isentar as bancas, cobrar uma taxa pequena ou comprar o espelho que ninguém quer.",
        opcoes: [
          {
            id: "isentar",
            texto: "Isentar as bancas de taxas.",
            efeitos: {
              habitantes: 6,
              honra: 3,
            },
            resultado: "A feira lota e dura até a noite. Seis comerciantes pedem para ficar.",
          },
          {
            id: "cobrar",
            texto: "Cobrar uma taxa mínima.",
            efeitos: {
              gold: 5,
              honra: 1,
            },
            resultado: "A taxa é pequena e a reclamação também. O cofre agradece em silêncio.",
          },
          {
            id: "espelho",
            texto: "Comprar o espelho · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              honra: 2,
              habitantes: 1,
              gold: -3,
            },
            resultado:
              "Você olha o reflexo por um tempo. O mercador sorri e anuncia que a vila é uma boa praça.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a feira da colheita",
      },
      {
        id: "julgamento",
        titulo: "O julgamento na praça",
        tipo: "desordem",
        peso: 1,
        multiplicadoresPeso: [
          {
            requisitos: {
              honraMax: -30,
            },
            multiplicador: 5,
          },
        ],
        texto:
          "Um camponês acusa o vizinho de mover as pedras do limite. O vizinho jura que as pedras se moveram sozinhas.",
        informacoes:
          "Um acusa o outro de mover as pedras. Você pode medi-las, dividir o terreno ou condenar um dos vizinhos.",
        opcoes: [
          {
            id: "medir",
            texto: "Medir o terreno com cuidado.",
            requisitos: {
              honraMin: -49,
            },
            efeitos: {
              honra: 3,
              hp: -3,
            },
            resultado:
              "A fita mostra que as pedras de fato se moveram, por erro de ambos. Os dois riem, relutantes.",
          },
          {
            id: "dividir",
            texto: "Dividir o terreno pela metade.",
            efeitos: {
              honra: 1,
              habitantes: -1,
            },
            resultado: "Ninguém fica satisfeito. Um dos vizinhos parte, achando justiça demais para si.",
          },
          {
            id: "condenar",
            texto: "Condenar o mais pobre.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              gold: 3,
              honra: -4,
              habitantes: -2,
            },
            resultado:
              "A multa é paga com o único boi da família. A praça se esvazia mais cedo do que o habitual.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o julgamento na praça",
      },
      {
        id: "pregador",
        titulo: "O pregador furioso",
        tipo: "desordem",
        peso: 2,
        texto:
          "Um homem sobe na carroça e grita que a vila vive em pecado. Metade ri; a outra metade já está silenciosa.",
        informacoes: "A fúria do pregador cresce com a plateia.",
        opcoes: [
          {
            id: "ouvir",
            texto: "Ouvi-lo até o fim.",
            efeitos: {
              honra: 1,
              habitantes: -1,
            },
            resultado: "Ao fim, ninguém sabe se foi ofendido ou convertido. Um homem parte sem despedida.",
          },
          {
            id: "mesa",
            texto: "Levá-lo à mesa com os padres e anciãos.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 2,
              habitantes: 2,
            },
            resultado:
              "À mesa, o pregador cansa de gritar e começa a conversar. Duas famílias, aliviadas, decidem ficar.",
          },
          {
            id: "arrastar",
            texto: "Mandar os guardas arrastá-lo.",
            efeitos: {
              honra: -3,
              habitantes: -3,
            },
            resultado: "O pregador vira mártir em uma tarde. Três famílias o seguem para fora da vila.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o pregador furioso",
      },
      {
        id: "mercador_de_gente",
        titulo: "O mercador de gente",
        tipo: "encontro",
        peso: 1,
        requisitos: {
          rodadaMin: 5,
        },
        texto:
          "Uma carroça de grades passa pelo portão. Sob a lona, rostos cansados observam em silêncio. O mercador oferece duas bocas a mais pelo preço de um jantar.",
        informacoes: "Há coisas que não se compram, mas se vendem.",
        opcoes: [
          {
            id: "libertar",
            texto: "Comprar a liberdade deles · 5 gold",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              habitantes: 4,
              honra: 4,
              gold: -5,
            },
            resultado:
              "Quatro pessoas descem da carroça. O mercador conta as moedas e olha para trás sem falar.",
          },
          {
            id: "abrigar",
            texto: "Dar-lhe uma noite de abrigo e seguir.",
            efeitos: {
              honra: -3,
            },
            resultado:
              "A carroça parte antes da aurora. Alguns moradores evitam seu olhar na manhã seguinte.",
          },
          {
            id: "atacar",
            texto: "Atacar o mercador.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              habitantes: 6,
              honra: 3,
              hp: -8,
            },
            resultado: "Os guardas ajudam a rendê-lo. Seis pessoas ficam na vila, e as grades viram lenha.",
          },
          {
            id: "servir",
            texto: "Comprar uma pessoa para servir.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              gold: 3,
              honra: -8,
              habitantes: -3,
            },
            resultado: "O servo trabalha de olhos baixos. Três moradores partem à noite, sem bater a porta.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o mercador de gente",
      },
      {
        id: "fera_da_floresta",
        titulo: "A fera da floresta",
        tipo: "batalha",
        peso: 1,
        requisitos: {
          rodadaMin: 9,
        },
        texto:
          "Um urso enorme invadiu a plantação. Os lavradores olham para você e para o urso, nessa ordem.",
        informacoes:
          "O ataque precisa alcançar a defesa da fera. Seu escudo reduz o dano recebido, sem se desgastar.",
        opcoes: [
          {
            id: "enfrentar",
            texto: "Enfrentar a fera.",
            combate: true,
          },
          {
            id: "isca",
            texto: "Atrair o urso com isca · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              honra: 1,
              gold: -3,
              hp: -3,
            },
            resultado:
              "A isca funciona, quase. Você ganha um arranhão e a promessa de que o urso não voltará.",
          },
          {
            id: "ceder",
            texto: "Deixar a floresta em paz.",
            efeitos: {
              habitantes: -5,
              honra: -1,
            },
            resultado: "A plantação vira refeição. Cinco lavradores migram para campos mais seguros.",
          },
        ],
        batalha: {
          defesa: 6,
          vitoria: {
            dano: 18,
            efeitos: {
              honra: 4,
              gold: 5,
              habitantes: 2,
            },
            resultado: "A pele rende 5 gold. Dois lavradores, impressionados, decidem ficar.",
          },
          derrota: {
            dano: 28,
            efeitos: {},
            resultado:
              "A fera derruba tudo que tenta contê-la. Você é arrastado para fora da plantação, com a dignidade intacta, ao menos.",
          },
          penalidadeFalha: {
            efeitos: {
              habitantes: -4,
            },
            texto: "Quatro lavradores deixam as terras.",
          },
        },
        imagem: "assets/batalha.webp",
        imagemAlt: "Cena da vila durante a fera da floresta",
      },
      {
        id: "mina_esquecida",
        titulo: "A mina esquecida",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          rodadaMin: 5,
          flagsAusentes: ["mina_decidida"],
        },
        texto:
          "Crianças acharam uma entrada coberta de cipó atrás do moinho. Dentro, há tábuas apodrecidas e um brilho que talvez seja ferro.",
        informacoes:
          "Você pode reabrir a mina com escoras, entrar sozinho para avaliá-la ou lacrar a entrada.",
        opcoes: [
          {
            id: "reabrir",
            texto: "Reabrir a mina com escoras novas · 5 gold",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              habitantes: 4,
              honra: 2,
              gold: 1,
            },
            resultado:
              "As escoras seguram. Quatro mineiros mudam para a vila, e a primeira carga já paga parte da obra.",
            flags: {
              mina_decidida: true,
              mina_aberta: true,
            },
          },
          {
            id: "entrar",
            texto: "Entrar sozinho para avaliar.",
            efeitos: {
              gold: 4,
              honra: 2,
              hp: -8,
            },
            resultado:
              "Você sai com ferro, poeira e uma ideia ruim para o futuro. A mina fica aberta, e ninguém a vigia.",
            flags: {
              mina_decidida: true,
              mina_aberta: true,
            },
          },
          {
            id: "lacrar",
            texto: "Lacrar a entrada.",
            efeitos: {
              honra: 1,
            },
            resultado: "As crianças reclamam, os pais agradecem. O brilho continua lá dentro, esperando.",
            flags: {
              mina_decidida: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a mina esquecida",
      },
      {
        id: "desabamento",
        titulo: "O desabamento",
        tipo: "mandatorio",
        peso: 4,
        requisitos: {
          rodadaMin: 9,
          flags: ["mina_aberta"],
          flagsAusentes: ["desabamento_ocorrido"],
        },
        texto:
          "A terra treme sob os pés. Um som surdo vem de dentro da mina, e os gritos chegam depois. Você corre.",
        informacoes:
          "Os mineiros estão presos lá dentro. Para alcançá-los, você também terá de entrar na mina instável.",
        opcoes: [
          {
            id: "resgatar",
            texto: "Entrar para resgatar os mineiros.",
            efeitos: {
              honra: 3,
              hp: -12,
              habitantes: -4,
            },
            resultado:
              "Você tira cinco homens da escuridão. Quatro outros ficam para sempre. A mina é lacrada pela segunda vez.",
            flags: {
              desabamento_ocorrido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o desabamento",
      },
      {
        id: "irmaos_rivais",
        titulo: "Os irmãos rivais",
        tipo: "desordem",
        peso: 2,
        texto:
          "Dois irmãos herdaram a mesma casa e o mesmo ressentimento. Levam a briga à praça, onde ela cresce como se tivesse sido semeada.",
        informacoes: "A vila escolhe lados rápido, e o senhor, mais devagar.",
        opcoes: [
          {
            id: "dividir",
            texto: "Dividir a casa em duas.",
            efeitos: {
              honra: 1,
              gold: -1,
            },
            resultado: "Um muro é erguido ao meio. Eles se falam pelos buracos entre as tábuas.",
          },
          {
            id: "juntos",
            texto: "Fazer os dois trabalharem juntos.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 3,
              habitantes: 2,
            },
            resultado:
              "Cansados de cavar lado a lado, os irmãos acabam almoçando juntos. Duas famílias, ao ver, ficam.",
          },
          {
            id: "tomar",
            texto: "Tomar a casa para a vila.",
            efeitos: {
              gold: 4,
              honra: -4,
              habitantes: -2,
            },
            resultado: "Os irmãos partem em direções opostas. A casa vira armazém, e ninguém a chama de lar.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante os irmãos rivais",
      },
      {
        id: "estalajadeira",
        titulo: "A estalajadeira",
        tipo: "encontro",
        peso: 2,
        texto:
          "Uma mulher quer abrir uma estalagem na estrada da vila. Já tem as panelas, o nome e a paciência; só falta a licença do senhor.",
        informacoes: "Você pode conceder a licença, cobrar uma taxa anual ou mandá-la voltar pela estrada.",
        opcoes: [
          {
            id: "conceder",
            texto: "Conceder a licença.",
            efeitos: {
              habitantes: 4,
              honra: 2,
            },
            resultado:
              "A estalagem abre com dois quartos e um cachorro. Quatro viajantes ficam por causa da sopa.",
          },
          {
            id: "taxa",
            texto: "Cobrar uma taxa anual",
            efeitos: {
              gold: 4,
              honra: -2,
            },
            resultado: "A estalajadeira paga, mas ajusta os preços. A sopa fica mais rala.",
          },
          {
            id: "negar",
            texto: "Negar a licença.",
            efeitos: {
              honra: -2,
              habitantes: -1,
            },
            resultado: "Ela carrega as panelas de volta pela estrada. O cachorro olha para trás.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a estalajadeira",
      },
      {
        id: "ratos",
        titulo: "Ratos no celeiro",
        tipo: "encontro",
        peso: 2,
        texto:
          "Os ratos chegaram em ondas, mastigando sacos e dignidade. O celeireiro propõe soluções que ninguém entende.",
        informacoes: "Um celeiro roído é um inverno mais duro.",
        opcoes: [
          {
            id: "gatos",
            texto: "Trazer gatos de outras aldeias · 2 gold",
            requisitos: {
              goldMin: 2,
            },
            efeitos: {
              habitantes: 2,
              honra: 1,
              gold: -2,
            },
            resultado:
              "Os gatos chegam em uma carroça e se instalam como senhores. Os ratos, de repente, têm compromissos em outros lugares.",
          },
          {
            id: "cacar",
            texto: "Caçar os ratos com o povo.",
            efeitos: {
              honra: 2,
              hp: -4,
            },
            resultado:
              'A noite é longa e ridícula. Você leva três mordidas e um título secreto: "Senhor dos Ratos".',
          },
          {
            id: "queimar",
            texto: "Queimar o celeiro velho.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              honra: -4,
              habitantes: -3,
            },
            resultado: "Os ratos fogem e os grãos também. Três famílias seguem os ratos para fora da vila.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante ratos no celeiro",
      },
      {
        id: "cometa",
        titulo: "O corpo no céu",
        tipo: "mandatorio",
        peso: 1,
        requisitos: {
          flagsAusentes: ["cometa_visto"],
        },
        texto:
          "Uma estrela com cauda atravessa o céu por três noites. Os velhos se benzem, os jovens apontam, os cães uivam sem parar.",
        informacoes: "Você pode passar as noites ao relento observando a estrela com o povo.",
        opcoes: [
          {
            id: "observar",
            texto: "Observar com o povo.",
            efeitos: {
              honra: 1,
              hp: -3,
            },
            resultado:
              "Você passa as noites ao relento e pega um resfriado. A vila, que dormia mal, passa a dormir pior.",
            flags: {
              cometa_visto: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o corpo no céu",
      },
      {
        id: "profeta_do_cometa",
        titulo: "O profeta do cometa",
        tipo: "desordem",
        peso: 3,
        requisitos: {
          flags: ["cometa_visto"],
          flagsAusentes: ["profeta_decidido"],
        },
        texto:
          "Um homem com olhos acesos prega que o fim chega pelo céu. Metade da praça acredita; a outra metade ainda não decidiu.",
        informacoes:
          "Você pode acalmar a praça, pagar para o profeta partir ou lucrar com o medo que ele espalha.",
        opcoes: [
          {
            id: "desmentir",
            texto: "Desmentir o profeta com calma.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 3,
              habitantes: 2,
            },
            resultado: "A voz tranquila vence o grito. Duas famílias, antes em pânico, decidem permanecer.",
            flags: {
              profeta_decidido: true,
            },
          },
          {
            id: "pagar",
            texto: "Pagar para o profeta partir · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              gold: -3,
              honra: -1,
            },
            resultado: "O profeta aceita as moedas e anuncia o próximo fim em outra vila.",
            flags: {
              profeta_decidido: true,
            },
          },
          {
            id: "aproveitar",
            texto: "Aproveitar o medo.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              gold: 6,
              honra: -5,
              habitantes: -3,
            },
            resultado: "As doações enchem o cofre. Os que não doam, partem.",
            flags: {
              profeta_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o profeta do cometa",
      },
      {
        id: "guarda_cansado",
        titulo: "O guarda cansado",
        tipo: "encontro",
        peso: 2,
        texto:
          "Seu guarda mais antigo dorme em pé, apoiado na lança. Quando o acorda, ele pede, com a voz de quem pede uma vez só, dias de folga.",
        informacoes: "Guardas cansados protegem menos, mas guardas descansados cobram mais.",
        opcoes: [
          {
            id: "descanso",
            texto: "Conceder uma semana de descanso.",
            efeitos: {
              habitantes: 1,
              honra: 2,
              gold: -1,
            },
            resultado:
              "A semana é calma, e o guarda volta renovado. Ele leva um pão extra para a ronda, por gratidão.",
          },
          {
            id: "dobrar",
            texto: "Dobrar o turno dos outros.",
            efeitos: {
              honra: -2,
              habitantes: -1,
            },
            resultado: "O guarda descansa, os outros resmungam. Um deles pede transferência para outra vila.",
          },
          {
            id: "assumir",
            texto: "Assumir seu turno uma noite.",
            efeitos: {
              honra: 3,
              hp: -4,
            },
            resultado: "A noite é fria e o guarda dorme em paz. Pela manhã, todos já sabem quem fez a ronda.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o guarda cansado",
      },
      {
        id: "guardas_desertam",
        titulo: "Guardas desertando",
        tipo: "desordem",
        peso: 1,
        multiplicadoresPeso: [
          {
            requisitos: {
              honraMax: -30,
            },
            multiplicador: 5,
          },
        ],
        texto:
          "Três guardas sumiram durante a noite, levando lanças e botas. Os que ficaram evitam seu olhar.",
        informacoes: "Guardas que partem não costumam voltar, e os que ficam observam sua reação.",
        opcoes: [
          {
            id: "recompensa",
            texto: "Oferecer uma recompensa aos que ficam · 4 gold",
            requisitos: {
              goldMin: 4,
            },
            efeitos: {
              ataque: 1,
              honra: 1,
              gold: -4,
            },
            resultado: "Os guardas apertam as correias e voltam ao posto. Um deles pede para ser promovido.",
          },
          {
            id: "cacar",
            texto: "Caçar os desertores.",
            efeitos: {
              hp: -5,
              honra: -3,
            },
            resultado: "Você encontra dois e os traz de volta amarrados. A tropa fica, mas ressentida.",
          },
          {
            id: "ouvir",
            texto: "Ouvir os motivos dos que ficaram.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 3,
              habitantes: 2,
            },
            resultado:
              "As queixas são justas: pouca comida, nenhuma folga. Você ajusta o que pode, e duas famílias de guardas decidem ficar.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante guardas desertando",
      },
      {
        id: "rumores",
        titulo: "Rumores da lavanderia",
        tipo: "desordem",
        peso: 2,
        texto:
          "As lavadeiras cochicham em voz baixa sobre o senhor. Cada versão do rumor é mais interessante que a anterior.",
        informacoes:
          "Você pode pagar por elogios, conversar com as lavadeiras ou tentar calá-las. Ignoradas, elas continuam falando.",
        opcoes: [
          {
            id: "ignorar",
            texto: "Ignorar os rumores.",
            efeitos: {
              honra: -1,
            },
            resultado: "Os rumores crescem sem alimento extra. Ninguém os desmente e todos os repetem.",
          },
          {
            id: "pagar",
            texto: "Pagar a lavanderia para falar bem · 2 gold",
            requisitos: {
              goldMin: 2,
            },
            efeitos: {
              honra: 2,
              gold: -2,
            },
            resultado: "As lavadeiras passam a lembrar suas virtudes com um tom suspeitamente entusiasmado.",
          },
          {
            id: "visitar",
            texto: "Visitar a lavanderia e conversar.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 3,
              habitantes: 1,
              hp: -2,
            },
            resultado:
              "Você leva um balde d'água na cabeça por acidente. Todos riem e o rumor morre de tédio.",
          },
          {
            id: "silenciar",
            texto: "Silenciar as fofoqueiras.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              honra: -4,
              habitantes: -2,
            },
            resultado:
              "Duas lavadeiras, expulsas, levam o rumor para outras vilas. Ele chega lá antes delas.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante rumores da lavanderia",
      },
      {
        id: "cavaleiro_errante",
        titulo: "O cavaleiro errante",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          honraMin: 30,
        },
        texto:
          "Um cavaleiro de armadura remendada pede um dia de descanso. Diz que ouviu falar da vila numa canção, e que as canções costumam exagerar.",
        informacoes: "Ele não pede nada além de pouso, mas observa tudo.",
        opcoes: [
          {
            id: "treino",
            texto: "Oferecer pouso e treino.",
            efeitos: {
              ataque: 1,
              escudo: 1,
              honra: 2,
              hp: -5,
            },
            resultado:
              "O cavaleiro ensina três lições e uma dor nas costelas. Parte na manhã, sem dizer adeus.",
          },
          {
            id: "guarda",
            texto: "Propor que ele fique como guarda.",
            efeitos: {
              habitantes: 3,
              honra: 2,
              gold: -3,
            },
            resultado: "Ele recusa, mas dois escudeiros e uma cozinheira que o seguiam pedem para ficar.",
          },
          {
            id: "pedir",
            texto: "Pedir que lute pela vila quando precisar.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 3,
              ataque: 1,
            },
            resultado: "Ele estende a mão e promete voltar. O povo observa e sente o peso dessa palavra.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o cavaleiro errante",
      },
      {
        id: "duelo",
        titulo: "O duelo de honra",
        tipo: "batalha",
        peso: 1,
        requisitos: {
          rodadaMin: 7,
        },
        texto:
          "Um jovem nobre diz que você ofendeu sua família ao usar o nome do pai dele numa frase. Ele exige um duelo, com testemunhas e sem pressa.",
        informacoes:
          "O ataque precisa alcançar a defesa do duelista. Seu escudo reduz o dano recebido, sem se desgastar.",
        opcoes: [
          {
            id: "aceitar",
            texto: "Aceitar o duelo.",
            combate: true,
          },
          {
            id: "desculpar",
            texto: "Pedir desculpas em público.",
            efeitos: {
              honra: -2,
            },
            resultado: "O jovem aceita as desculpas com ar de quem queria mais. A praça murmura.",
          },
          {
            id: "campeao",
            texto: "Mandar um campeão em seu lugar.",
            requisitos: {
              goldMin: 4,
            },
            efeitos: {
              honra: 1,
              gold: -4,
            },
            resultado: "O campeão vence sem esforço. A vila aplaude e comenta que você deixou outro lutar.",
          },
        ],
        batalha: {
          defesa: 4,
          vitoria: {
            dano: 12,
            efeitos: {
              honra: 3,
              gold: 4,
            },
            resultado:
              "O duelista cai e perde o orgulho. Os padrinhos pagam a aposta e se retiram em silêncio.",
          },
          derrota: {
            dano: 20,
            efeitos: {},
            resultado: "Você é humilhado diante de testemunhas. O jovem sorri e se vai.",
          },
          penalidadeFalha: {
            efeitos: {
              honra: -3,
              gold: -3,
            },
            texto: "A derrota custa respeito e a bolsa da aposta.",
          },
        },
        imagem: "assets/batalha.webp",
        imagemAlt: "Cena da vila durante o duelo de honra",
      },
      {
        id: "coletor",
        titulo: "O coletor de impostos",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          rodadaMin: 4,
        },
        texto:
          "Um homem de chapéu alto confere o livro de contas da vila. Corrige somas com um sorriso que não alcança os olhos.",
        informacoes: "Ele diz que representa o rei. Ninguém viu o rei, nem o selo.",
        opcoes: [
          {
            id: "pagar",
            texto: "Pagar o imposto devido · 5 gold",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              honra: 2,
              gold: -5,
            },
            resultado:
              "O coletor assina um recibo que talvez valha algo. A vila respira sem entender por quê.",
          },
          {
            id: "esconder",
            texto: "Esconder parte dos grãos.",
            efeitos: {
              gold: 3,
              honra: -3,
              habitantes: -2,
            },
            resultado:
              "O coletor desconfia e faz perguntas. Dois moradores, assustados, partem na manhã seguinte.",
          },
          {
            id: "provar",
            texto: "Pedir que prove seu mandato.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 3,
              hp: -3,
            },
            resultado:
              "O coletor falha em provar. Ele parte irritado, deixando uma cicatriz verbal e nenhuma conta.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o coletor de impostos",
      },
      {
        id: "refugiados",
        titulo: "Retirantes da guerra",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          rodadaMin: 6,
          flagsAusentes: ["refugiados_decidido"],
        },
        texto:
          "Uma fila de famílias com trouxas e crianças dorme perto do portão. Algumas têm feridas, outras só têm silêncio.",
        informacoes: "Aceitar muitos é alimentar muitos. Recusar é escolher quem fica.",
        opcoes: [
          {
            id: "abrir",
            texto: "Abrir os portões a todos.",
            requisitos: {
              honraMin: -29,
            },
            efeitos: {
              habitantes: 8,
              honra: 3,
              hp: -4,
            },
            resultado:
              "A vila quase estoura, mas respira junto. Oito novas famílias dão novo ritmo ao trabalho.",
            flags: {
              refugiados_decidido: true,
            },
          },
          {
            id: "trabalhar",
            texto: "Aceitar só quem puder trabalhar.",
            efeitos: {
              habitantes: 4,
              honra: -3,
            },
            resultado: "Quatro famílias entram. As outras ficam para trás, sem olhar para você.",
            flags: {
              refugiados_decidido: true,
            },
          },
          {
            id: "recusar",
            texto: "Recusar a entrada.",
            efeitos: {
              honra: -5,
            },
            resultado:
              "As famílias seguem pela estrada. Os moradores observam o portão se fechar e fazem o mesmo silêncio.",
            flags: {
              refugiados_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante retirantes da guerra",
      },
      {
        id: "heranca_disputada",
        titulo: "A herança disputada",
        tipo: "desordem",
        peso: 1,
        requisitos: {
          rodadaMin: 6,
        },
        texto: "Um velho morreu sem testamento, e sete parentes aparecem para cobrar o mesmo cavalo.",
        informacoes: "O cavalo tem pouco valor. A discussão, nenhum limite.",
        opcoes: [
          {
            id: "dividir",
            texto: "Dividir os bens em partes iguais.",
            efeitos: {
              honra: 1,
              habitantes: -1,
            },
            resultado: "O cavalo é vendido, e as moedas, divididas em sete. Um parente parte descontente.",
          },
          {
            id: "cuidador",
            texto: "Dar tudo ao parente que cuidou do velho.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 3,
              habitantes: 1,
            },
            resultado:
              "Os outros reclamam, mas sabem que é justo. O cuidador passa a viver com mais dignidade.",
          },
          {
            id: "tomar",
            texto: "Tomar a herança para o cofre.",
            efeitos: {
              gold: 5,
              honra: -4,
              habitantes: -2,
            },
            resultado: "Os parentes saem de mãos vazias. Dois deles juram que o cavalo ainda terá dono.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a herança disputada",
      },
      {
        id: "sino_rachado",
        titulo: "O sino rachado",
        tipo: "encontro",
        peso: 2,
        texto:
          "O sino da vila rachou numa manhã de geada, produzindo um som que lembra uma tosse. Ninguém sabe quando começar o dia.",
        informacoes: "O sino organiza a vila. Sem ele, cada um segue o relógio que prefere.",
        opcoes: [
          {
            id: "fundir",
            texto: "Mandar fundir outro · 5 gold",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              habitantes: 3,
              honra: 2,
              gold: -5,
            },
            resultado:
              "O novo sino ressoa pela vila inteira. Três famílias de uma aldeia vizinha afirmam ouvi-lo ao longe.",
          },
          {
            id: "remendar",
            texto: "Remendar o sino com o ferreiro.",
            efeitos: {
              honra: 1,
              gold: -1,
            },
            resultado:
              'O sino volta a tocar, mas com um tom esquisito. As crianças o apelidam de "o Doente".',
          },
          {
            id: "sem",
            texto: "Ficar sem sino.",
            efeitos: {
              honra: -2,
              habitantes: -1,
            },
            resultado: "O silêncio é incômodo. Alguns acordam tarde, outros cedo, e todos reclamam.",
          },
        ],
        imagem: "assets/forja.webp",
        imagemAlt: "Cena da vila durante o sino rachado",
      },
      {
        id: "velho_soldado",
        titulo: "O velho soldado",
        tipo: "encontro",
        peso: 2,
        texto:
          "Um homem manco, com um olho opaco, se apresenta como veterano de três guerras. Pede um canto para morar e um motivo para levantar de manhã.",
        informacoes: "Ele conhece táticas que ninguém mais conhece.",
        opcoes: [
          {
            id: "treinar",
            texto: "Pedir que treine seus homens.",
            efeitos: {
              ataque: 1,
              habitantes: 1,
              gold: -2,
            },
            resultado: "O veterano resmunga de manhã e ensina de tarde. Sua tropa melhora a olhos vistos.",
          },
          {
            id: "ouvir",
            texto: "Ouvir suas histórias à noite.",
            efeitos: {
              honra: 2,
              escudo: 1,
              hp: -2,
            },
            resultado: "As histórias são tristes e úteis. Você aprende a segurar o escudo de modo diferente.",
          },
          {
            id: "recusar",
            texto: "Mandá-lo embora sem pouso.",
            efeitos: {
              honra: -3,
            },
            resultado:
              "Ele sai pela estrada sem reclamar. Os moradores observam se você vai olhar para trás.",
          },
        ],
        imagem: "assets/forja.webp",
        imagemAlt: "Cena da vila durante o velho soldado",
      },
      {
        id: "pao_contado",
        titulo: "Pão contado",
        tipo: "desordem",
        peso: 1,
        protecaoCeleiro: true,
        multiplicadoresPeso: [
          {
            requisitos: {
              honraMax: -30,
            },
            multiplicador: 5,
          },
        ],
        texto:
          "A padaria fechou três dias seguidos. As filas aumentam, e os preços também. Alguém começa a vender pão por baixo do balcão.",
        informacoes:
          "Você pode abrir o celeiro, tabelar o preço do pão ou confiscar o que é vendido às escondidas.",
        opcoes: [
          {
            id: "abrir",
            texto: "Abrir o celeiro do senhor · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              habitantes: 4,
              honra: 3,
              gold: -3,
            },
            resultado: "O pão volta a ser pão. Quatro famílias que olhavam a estrada decidem ficar.",
          },
          {
            id: "tabelar",
            texto: "Tabelar o preço do pão.",
            efeitos: {
              honra: 1,
              habitantes: -2,
            },
            resultado: "O preço cai, o pão some. Duas famílias partem em busca de padarias mais honestas.",
          },
          {
            id: "confiscar",
            texto: "Confiscar pão dos revendedores.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              gold: 4,
              honra: -5,
              habitantes: -3,
            },
            resultado:
              "Você enche o cofre e esvazia a praça. Três famílias deixam a vila de barriga cheia e olhar duro.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante pão contado",
      },
      {
        id: "noite_dos_mortos",
        titulo: "A noite dos mortos",
        tipo: "encontro",
        peso: 2,
        intervaloRodadas: 50,
        texto:
          "Uma vez por ano, os moradores acendem velas no cemitério e deixam pão nas lápides. Ninguém lembra por quê, apenas como.",
        informacoes: "Os mortos também fazem parte da vila.",
        opcoes: [
          {
            id: "velas",
            texto: "Acender uma vela para cada morto.",
            efeitos: {
              honra: 3,
              gold: -2,
            },
            resultado: "A noite é longa e silenciosa. Os moradores, comovidos, agradecem sem dizer palavra.",
          },
          {
            id: "enlutados",
            texto: "Passar a noite com os enlutados.",
            efeitos: {
              honra: 2,
              habitantes: 2,
              hp: -3,
            },
            resultado:
              "Você ouve nomes que ninguém cita há anos. Duas famílias, sentindo-se ouvidas, decidem ficar.",
          },
          {
            id: "dispensar",
            texto: "Dispensar a tradição.",
            efeitos: {
              honra: -3,
              habitantes: -1,
            },
            resultado:
              "As velas são acesas mesmo assim, longe dos olhos do senhor. Um morador parte na manhã seguinte.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a noite dos mortos",
      },
      {
        id: "nobre_falido",
        titulo: "O nobre falido",
        tipo: "encontro",
        peso: 1,
        requisitos: {
          rodadaMin: 5,
        },
        texto: "Um nobre de roupas caras e mãos vazias pede asilo. Seu cavalo é mais bem vestido que ele.",
        informacoes: "Ele diz conhecer pessoas importantes. Elas, talvez, não o conheçam mais.",
        opcoes: [
          {
            id: "acolher",
            texto: "Acolhê-lo como hóspede.",
            efeitos: {
              honra: 2,
              habitantes: 1,
              gold: -2,
            },
            resultado:
              "O nobre agradece com cerimônia e come como um lavrador. Seu cavalo é presenteado à vila.",
          },
          {
            id: "penhor",
            texto: "Exigir um penhor.",
            efeitos: {
              gold: 4,
              honra: -2,
            },
            resultado:
              "O nobre entrega um anel que talvez seja falso. O ourives promete avaliar na semana seguinte.",
          },
          {
            id: "casar",
            texto: "Pedir que se case com uma viúva da vila.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              habitantes: 3,
              honra: 3,
            },
            resultado: "O nobre aceita, relutante, e acaba feliz. A viúva traz uma família inteira ao altar.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o nobre falido",
      },
      {
        id: "tempestade",
        titulo: "A tempestade",
        tipo: "mandatorio",
        peso: 1,
        requisitos: {
          rodadaMin: 5,
        },
        texto:
          "O céu fecha à tarde, e à noite a chuva é de pedra. Telhados voam, o rio sobe, e você corre entre as casas, segurando o que consegue.",
        informacoes: "Algumas noites não oferecem escolha, só resistência.",
        opcoes: [
          {
            id: "atravessar",
            texto: "Atravessar a noite com o povo.",
            efeitos: {
              honra: 2,
              hp: -9,
              habitantes: -2,
            },
            resultado:
              "Na manhã, os telhados voltam a ser cobertos por braços. Duas famílias, sem casa, partem.",
          },
        ],
        imagem: "assets/geada.webp",
        imagemAlt: "Cena da vila durante a tempestade",
      },
      {
        id: "homens_do_senhor",
        titulo: "Os homens do senhor",
        tipo: "desordem",
        peso: 5,
        requisitos: {
          honraMax: -30,
        },
        texto:
          'Seus guardas, sem ordem clara, começaram a pedir "contribuições" nas casas. Quem nega, apanha. Quem paga, também.',
        informacoes: "A vila aprende a ser como o senhor.",
        opcoes: [
          {
            id: "punir",
            texto: "Punir os guardas excessivos.",
            efeitos: {
              honra: 3,
              gold: -2,
            },
            resultado:
              "Dois guardas são açoitados em público. A vila nota, em silêncio, que você pode ser contido.",
          },
          {
            id: "fingir",
            texto: "Fingir que não viu.",
            efeitos: {
              gold: 3,
              honra: -3,
              habitantes: -3,
            },
            resultado: "Os guardas ficam mais ousados. Três famílias se despedem dos vizinhos às escondidas.",
          },
          {
            id: "parte",
            texto: "Pedir parte do que arrecadarem.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              gold: 6,
              honra: -6,
              habitantes: -4,
            },
            resultado: "Seu cofre pesa. A vila, vazia, ecoa seus passos.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante os homens do senhor",
      },
      {
        id: "culto_do_poco",
        titulo: "O culto do poço",
        tipo: "desordem",
        peso: 4,
        requisitos: {
          rodadaMin: 8,
          flags: ["poco_contaminado"],
          flagsAusentes: ["culto_resolvido"],
        },
        texto:
          "Algumas pessoas passaram a rezar de joelhos ao redor do poço, dizendo que ele fala à noite. Ninguém mais bebe daquela água, a não ser eles.",
        informacoes: "A água foi contaminada por descuido. A reverência, por desespero.",
        opcoes: [
          {
            id: "cavar",
            texto: "Fechar o poço e cavar outro · 5 gold",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              habitantes: 4,
              honra: 3,
              gold: -5,
            },
            resultado:
              "O novo poço dá água limpa. Os devotos esvaziam o antigo e carregam a lenda para a nova água.",
            flags: {
              culto_resolvido: true,
            },
          },
          {
            id: "conversar",
            texto: "Conversar com os devotos.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 3,
              hp: -4,
            },
            resultado: "A conversa é longa e confusa. Os devotos aceitam abandonar o poço, mas não o culto.",
            flags: {
              culto_resolvido: true,
            },
          },
          {
            id: "dispersar",
            texto: "Dispersar os devotos à força.",
            efeitos: {
              habitantes: -4,
              honra: -4,
            },
            resultado: "Os guardas empurram e batem. Quatro devotos partem, levando o canto consigo.",
            flags: {
              culto_resolvido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o culto do poço",
      },
      {
        id: "portao_aberto",
        titulo: "O portão aberto",
        tipo: "batalha",
        peso: 1,
        requisitos: {
          rodadaMin: 8,
        },
        texto:
          "Durante a ronda, o portão estava destrancado por dentro. Homens armados já estão entre as casas, e ninguém sabe quem abriu.",
        informacoes:
          "O ataque precisa alcançar a defesa dos invasores. Seu escudo reduz o dano recebido, sem se desgastar.",
        opcoes: [
          {
            id: "retomar",
            texto: "Retomar o portão.",
            combate: true,
          },
          {
            id: "evacuar",
            texto: "Evacuar pelas trilhas.",
            efeitos: {
              habitantes: -4,
              honra: -2,
            },
            resultado: "A maior parte escapa. Quatro pessoas se perdem na escuridão.",
          },
        ],
        batalha: {
          defesa: 4,
          vitoria: {
            dano: 13,
            efeitos: {
              honra: 3,
              gold: 4,
            },
            resultado: "Os invasores recuam pela mesma abertura. O portão é trancado com três barras.",
          },
          derrota: {
            dano: 22,
            efeitos: {},
            resultado: "Você é obrigado a recuar para o pátio. Os invasores saqueiam à vontade.",
          },
          penalidadeFalha: {
            efeitos: {
              habitantes: -8,
              gold: -3,
            },
            texto: "Oito moradores morrem ou fogem no saque; o cofre perde 3 gold.",
          },
        },
        imagem: "assets/batalha.webp",
        imagemAlt: "Cena da vila durante o portão aberto",
      },
      {
        id: "viuva",
        titulo: "A viúva do soldado",
        tipo: "encontro",
        peso: 2,
        texto:
          "Uma mulher traz uma medalha a você. Diz que o marido a recebeu por lutar a seu serviço ou ao do seu antecessor. Os registros se contradizem.",
        informacoes: "Ela só quer saber se a morte dele serviu a algo.",
        opcoes: [
          {
            id: "pensao",
            texto: "Garantir uma pensão · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              honra: 3,
              habitantes: 1,
              gold: -3,
            },
            resultado: "A viúva agradece sem sorrir. Os outros soldados da vila notam o gesto.",
          },
          {
            id: "sentido",
            texto: "Dizer que a morte tem sentido.",
            efeitos: {
              honra: 1,
            },
            resultado:
              "A viúva aceita as palavras e vai embora com a medalha. A vila não sabe se ela acreditou.",
          },
          {
            id: "negar",
            texto: "Negar qualquer dívida.",
            efeitos: {
              honra: -4,
              habitantes: -1,
            },
            resultado:
              "Ela deixa a medalha sobre a mesa. Os guardas olham para o chão, e o senhor, para a medalha.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a viúva do soldado",
      },
      {
        id: "boticario",
        titulo: "O aprendiz de boticário",
        tipo: "encontro",
        peso: 2,
        texto:
          "Um rapaz pálido oferece xaropes de sabor discutível. Jura que seu mestre morreu sem lhe ensinar nada, exceto como misturar.",
        informacoes: "Seus remédios podem curar, ou ao menos conservar.",
        opcoes: [
          {
            id: "comprar",
            texto: "Comprar um xarope · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              hp: 12,
              gold: -3,
            },
            resultado: "O xarope tem gosto de cobre e mel. Você recupera doze de vida e um leve zumbido.",
          },
          {
            id: "quarto",
            texto: "Pagar-lhe um quarto na vila.",
            efeitos: {
              habitantes: 3,
              honra: 2,
              gold: -2,
            },
            resultado: "O aprendiz se instala. Em semanas, três famílias passam a procurá-lo.",
          },
          {
            id: "expulsar",
            texto: "Expulsá-lo por charlatanismo.",
            efeitos: {
              honra: -2,
            },
            resultado: "O rapaz parte sem se queixar. Pela estrada, tosse mais do que deveria.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o aprendiz de boticário",
      },
      {
        id: "pastores",
        titulo: "Pastores de passagem",
        tipo: "encontro",
        peso: 2,
        texto:
          "Um rebanho de ovelhas ocupa a estrada. Os pastores pedem pasto por três dias e prometem lã em troca.",
        informacoes: "Ovelhas comem tudo o que veem, inclusive suas cercas.",
        opcoes: [
          {
            id: "permitir",
            texto: "Permitir o pasto nos campos comunais.",
            efeitos: {
              gold: 4,
              honra: 1,
            },
            resultado: "Os pastores pagam em lã e queijo. Os lavradores reclamam, mas o cofre agradece.",
          },
          {
            id: "ficar",
            texto: "Convidá-los a ficar de vez.",
            requisitos: {
              honraMin: -29,
            },
            efeitos: {
              habitantes: 4,
              honra: 2,
            },
            resultado:
              "As ovelhas aprovam, os pastores também. Quatro famílias ficam, e um cachorro, sozinho, escolhe você.",
          },
          {
            id: "adiante",
            texto: "Mandar o rebanho adiante.",
            efeitos: {
              honra: -1,
            },
            resultado: "As ovelhas partem balindo. Nenhuma cerca é mastigada, e ninguém sente falta delas.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante pastores de passagem",
      },
      {
        id: "ladrao_de_cavalos",
        titulo: "O ladrão de cavalos",
        tipo: "desordem",
        peso: 2,
        texto:
          "Um rapaz foi pego sentado em um cavalo que não era seu. Jura que o animal o seguiu até a cerca.",
        informacoes: "A vila observa, em silêncio, o que será feito do rapaz.",
        opcoes: [
          {
            id: "ouvir",
            texto: "Ouvir a versão do cavalo.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 2,
              habitantes: 1,
            },
            resultado:
              "O cavalo de fato o segue. O dono, tocado, deixa o animal com o rapaz por uma pequena troca.",
          },
          {
            id: "multar",
            texto: "Aplicar uma multa.",
            efeitos: {
              gold: 3,
              honra: -1,
            },
            resultado: "O rapaz paga com lágrimas e quatro dias de trabalho. O cavalo parece decepcionado.",
          },
          {
            id: "cortar",
            texto: "Cortar-lhe a mão.",
            requisitos: {
              honraMax: -50,
            },
            efeitos: {
              honra: -7,
              habitantes: -4,
            },
            resultado:
              "Ninguém mais toca em um cavalo alheio. Quatro famílias deixam a vila antes do amanhecer.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o ladrão de cavalos",
      },
      {
        id: "oleiro",
        titulo: "O forno do oleiro",
        tipo: "encontro",
        peso: 2,
        texto:
          "O oleiro quer construir um forno maior e mudar para a vila. Diz que seu barro é bom e suas pernas são ruins.",
        informacoes: "Fornos grandes trazem moedas e fumaça.",
        opcoes: [
          {
            id: "ajudar",
            texto: "Ajudar a construir o forno.",
            efeitos: {
              habitantes: 3,
              honra: 2,
              hp: -4,
            },
            resultado:
              "Você carrega tijolos até a tarde. O oleiro, agradecido, faz um prato com seu brasão que ninguém ousa usar.",
          },
          {
            id: "financiar",
            texto: "Financiar a obra · 4 gold",
            requisitos: {
              goldMin: 4,
            },
            efeitos: {
              habitantes: 4,
              honra: 1,
              gold: -4,
            },
            resultado: "O forno nasce em um mês. Quatro aprendizes chegam com cheiro de barro.",
          },
          {
            id: "aluguel",
            texto: "Cobrar aluguel do terreno.",
            efeitos: {
              gold: 4,
              honra: -2,
            },
            resultado: "O oleiro paga, mas a fumaça sobe com mais ressentimento que o normal.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o forno do oleiro",
      },
      {
        id: "criancas_floresta",
        titulo: "Crianças na floresta",
        tipo: "encontro",
        peso: 2,
        texto:
          "Três crianças desapareceram depois do jantar. Os pais cercam o portão e olham para você, não para as árvores.",
        informacoes: "A floresta escurece rápido.",
        opcoes: [
          {
            id: "entrar",
            texto: "Entrar na floresta com tochas.",
            efeitos: {
              honra: 4,
              habitantes: 3,
              hp: -8,
            },
            resultado:
              "As crianças são achadas em uma clareira, assustadas e cheias de amoras. Três famílias ficam por gratidão.",
          },
          {
            id: "guardas",
            texto: "Mandar os guardas na frente.",
            efeitos: {
              honra: 1,
              gold: -2,
            },
            resultado: "Os guardas as trazem ao amanhecer. Você é agradecido com educação, não com calor.",
          },
          {
            id: "esperar",
            texto: "Esperar até o amanhecer.",
            efeitos: {
              honra: -4,
              habitantes: -2,
            },
            resultado:
              "As crianças voltam sozinhas. Os pais não esquecem a noite, e duas famílias partem com os pequenos.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante crianças na floresta",
      },
      {
        id: "pedra_do_limite",
        titulo: "A pedra do limite",
        tipo: "encontro",
        peso: 2,
        requisitos: {
          rodadaMin: 4,
        },
        texto:
          "O senhor da aldeia vizinha diz que a pedra do limite foi movida para dentro das terras dele. Pede que a coloquem de volta, ou que ele mesmo o faça.",
        informacoes: "A pedra tem cem anos e muitas versões.",
        opcoes: [
          {
            id: "medir",
            texto: "Medir o limite junto com o vizinho.",
            efeitos: {
              honra: 2,
              habitantes: 1,
              hp: -3,
            },
            resultado:
              "A medição é longa e comprova que ambos tinham razão. Vocês dividem um pedaço de terra e uma garrafa.",
          },
          {
            id: "recusar",
            texto: "Recusar e fortalecer a fronteira.",
            efeitos: {
              escudo: 1,
              honra: -2,
              gold: -2,
            },
            resultado: "O vizinho parte irritado. Seus guardas ganham escudos novos e um inimigo permanente.",
          },
          {
            id: "ceder",
            texto: "Ceder a faixa de terra.",
            efeitos: {
              habitantes: -2,
              honra: -1,
            },
            resultado: "A faixa é entregue, e duas famílias que a cultivavam partem junto com ela.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a pedra do limite",
      },
      {
        id: "sonho_do_velho",
        titulo: "O sonho do velho senhor",
        tipo: "mandatorio",
        peso: 1,
        requisitos: {
          rodadaMin: 10,
          flagsAusentes: ["sonho_tido"],
        },
        texto:
          "Você dorme na poltrona do seu predecessor e sonha com uma vila que não reconhece. Ele está de pé na porta, sem rosto, e pergunta o que você fez.",
        informacoes:
          "O predecessor pergunta o que você fez com a vila. A resposta fica entre vocês no sonho.",
        opcoes: [
          {
            id: "responder",
            texto: "Responder ao sonho com sinceridade.",
            efeitos: {
              honra: 1,
              hp: -4,
            },
            resultado:
              "Você acorda com o coração acelerado e a certeza de que ninguém mais ouviu a resposta.",
            flags: {
              sonho_tido: true,
            },
            desbloqueia: {
              flags: ["vontade_ouvida"],
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o sonho do velho senhor",
      },
      {
        id: "moedas_falsas",
        titulo: "Moedas falsas",
        tipo: "desordem",
        peso: 2,
        requisitos: {
          goldMin: 4,
        },
        texto:
          "O ferreiro mostra uma moeda que se desfaz sob o martelo. Três outras iguais passaram pelo cofre sem que ninguém notasse.",
        informacoes: "Há alguém fabricando moedas na região.",
        opcoes: [
          {
            id: "investigar",
            texto: "Investigar a origem.",
            efeitos: {
              honra: 2,
              gold: -3,
              hp: -3,
            },
            resultado:
              "A trilha leva a um estaleiro de falsificadores. Você derruba o ateliê, e as moedas falsas se tornam lenha.",
          },
          {
            id: "trocar",
            texto: "Trocar as moedas pelas boas.",
            efeitos: {
              gold: -4,
            },
            resultado:
              "O prejuízo é pago em silêncio. O ferreiro guarda uma das moedas falsas como lembrança.",
          },
          {
            id: "passar",
            texto: "Passar adiante as moedas falsas.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              gold: 4,
              honra: -6,
              habitantes: -2,
            },
            resultado:
              "As moedas circulam. Algumas famílias descobrem de onde vieram e partem sem fazer barulho.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante moedas falsas",
      },
      {
        id: "carvoeiros",
        titulo: "Os carvoeiros",
        tipo: "encontro",
        peso: 2,
        texto:
          "Uma família de pele escurecida de fuligem pede para queimar lenha no bosque comunal. Seus filhos parecem mais velhos que seus pais.",
        informacoes: "Carvão aquece e vende, mas queima árvores.",
        opcoes: [
          {
            id: "permitir",
            texto: "Permitir a queima controlada.",
            efeitos: {
              gold: 5,
              habitantes: 2,
              honra: -1,
            },
            resultado: "O bosque diminui, o cofre aumenta. A fuligem desenha sombras novas nas paredes.",
          },
          {
            id: "terreno",
            texto: "Oferecer um terreno distante.",
            efeitos: {
              habitantes: 3,
              honra: 2,
            },
            resultado:
              "O terreno é áspero, mas os carvoeiros o transformam em casa. Três famílias vizinhas se juntam a eles.",
          },
          {
            id: "proibir",
            texto: "Proibir a queima.",
            efeitos: {
              honra: 1,
            },
            resultado: "Os carvoeiros parecem entender e vão embora. O bosque agradece em folhas.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante os carvoeiros",
      },
      {
        id: "contador_de_mortos",
        titulo: "O contador de mortos",
        tipo: "encontro",
        peso: 1,
        requisitos: {
          rodadaMin: 10,
        },
        texto:
          "O padre, o ferreiro e a ervateira se juntam à porta de seu salão e apresentam uma lista de nomes. Pedem que você a leia em voz alta.",
        informacoes: "A lista contém todos que a vila perdeu desde que você chegou.",
        opcoes: [
          {
            id: "ler",
            texto: "Ler cada nome com calma.",
            efeitos: {
              honra: 4,
              hp: -5,
            },
            resultado: "A leitura é longa. Ao fim, o salão está em silêncio, e alguém começa a chorar.",
          },
          {
            id: "guardar",
            texto: "Pedir que a lista seja guardada para depois.",
            efeitos: {
              honra: -3,
            },
            resultado: "Eles concordam, sem concordar. A lista é guardada em uma gaveta que ninguém esquece.",
          },
          {
            id: "culpa",
            texto: "Dizer que não foi sua culpa.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              honra: -5,
              habitantes: -2,
            },
            resultado:
              "A lista é dobrada e devolvida ao bolso. Dois dos presentes saem da vila na manhã seguinte.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o contador de mortos",
      },
      {
        id: "vigia_da_torre",
        titulo: "O vigia da torre",
        tipo: "encontro",
        peso: 2,
        texto:
          "O vigia da torre desceu para dizer que viu fumaça no horizonte três noites seguidas. Ele não sabe se é aviso ou invenção.",
        informacoes: "Ele não está acostumado a ser ouvido.",
        opcoes: [
          {
            id: "batedor",
            texto: "Mandar um batedor investigar.",
            efeitos: {
              honra: 2,
              escudo: 1,
              gold: -2,
            },
            resultado:
              "O batedor volta com notícias de um acampamento distante. Você reforça o portão, só por precaução.",
          },
          {
            id: "subir",
            texto: "Subir à torre e ver por si mesmo.",
            efeitos: {
              honra: 2,
              hp: -3,
            },
            resultado:
              "A subida é longa e o horizonte, vazio. O vigia suspira aliviado por ter sido levado a sério.",
          },
          {
            id: "ignorar",
            texto: "Ignorar o aviso.",
            efeitos: {
              honra: -2,
            },
            resultado: "O vigia volta à torre. Na noite seguinte, não desce mais para avisar.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o vigia da torre",
      },
      {
        id: "enxame",
        titulo: "O enxame",
        tipo: "encontro",
        peso: 2,
        texto:
          "Um enxame de abelhas pousou no telhado da cozinha. A cozinheira recusa-se a sair, e o enxame também.",
        informacoes: "Abelhas podem ser sorte ou problema, dependendo do ferrão.",
        opcoes: [
          {
            id: "fumaca",
            texto: "Tirar o enxame com fumaça.",
            efeitos: {
              gold: 4,
              honra: 1,
              hp: -4,
            },
            resultado:
              "Você leva meia dúzia de picadas e um pote de mel. O enxame se muda para a colmeia do pátio.",
          },
          {
            id: "apicultor",
            texto: "Chamar o apicultor da aldeia vizinha · 2 gold",
            requisitos: {
              goldMin: 2,
            },
            efeitos: {
              habitantes: 2,
              honra: 1,
              gold: -2,
            },
            resultado:
              "O apicultor resolve em uma tarde. Duas famílias de sua aldeia passam a visitar a vila por causa do mel.",
          },
          {
            id: "esperar",
            texto: "Esperar que se mudem.",
            efeitos: {
              honra: -1,
            },
            resultado: "As abelhas ficam. A cozinheira passa a cozinhar fora.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o enxame",
      },
      {
        id: "lagoa_proibida",
        titulo: "A lagoa proibida",
        tipo: "encontro",
        peso: 1,
        texto:
          "Os mais velhos dizem que a lagoa atrás do bosque é amaldiçoada. Os mais jovens dizem que há peixes. Ambos podem estar certos.",
        informacoes: "A lagoa nunca ficou seca, nem nos piores invernos.",
        opcoes: [
          {
            id: "pescar",
            texto: "Pescar na lagoa.",
            efeitos: {
              habitantes: 4,
              gold: 2,
              honra: -3,
            },
            resultado: "Os peixes são gordos. Os velhos olham de longe e se benzem.",
          },
          {
            id: "respeitar",
            texto: "Respeitar a proibição.",
            efeitos: {
              honra: 3,
            },
            resultado: "Os velhos assentem. Os jovens, mais tarde, pescam escondidos, e ninguém conta.",
          },
          {
            id: "consagrar",
            texto: "Consagrar a lagoa em nome do povo.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 4,
              habitantes: 3,
            },
            resultado:
              "A lagoa vira lugar de encontro e silêncio. Três famílias se instalam à margem, sem fazer barulho.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a lagoa proibida",
      },
      {
        id: "vizinho_pede_ajuda",
        titulo: "O vizinho pede ajuda",
        tipo: "batalha",
        peso: 1,
        requisitos: {
          rodadaMin: 9,
        },
        texto:
          "Um mensageiro suado conta que a aldeia vizinha está sendo atacada por bandidos. Pede homens e lanças, e pede depressa.",
        informacoes:
          "O ataque precisa alcançar a defesa dos bandidos. Seu escudo reduz o dano recebido, sem se desgastar.",
        opcoes: [
          {
            id: "marchar",
            texto: "Marchar em socorro.",
            combate: true,
          },
          {
            id: "suprimentos",
            texto: "Enviar apenas suprimentos · 3 gold",
            requisitos: {
              goldMin: 3,
            },
            efeitos: {
              gold: -3,
              honra: -2,
            },
            resultado:
              "O mensageiro agradece com o olhar de quem esperava mais. A vila vizinha sobrevive, a custo.",
          },
          {
            id: "recusar",
            texto: "Recusar o pedido.",
            efeitos: {
              honra: -4,
              habitantes: -1,
            },
            resultado:
              "O mensageiro parte sem discutir. A fumaça no horizonte, nos dias seguintes, discute por ele.",
          },
        ],
        batalha: {
          defesa: 5,
          vitoria: {
            dano: 15,
            efeitos: {
              honra: 4,
              habitantes: 5,
              gold: 4,
            },
            resultado:
              "Os bandidos fogem ao ver sua bandeira. Cinco famílias da aldeia salva pedem asilo, e o vizinho paga com um cavalo magro.",
          },
          derrota: {
            dano: 24,
            efeitos: {},
            resultado:
              "Você chega tarde e é empurrado de volta. A aldeia vizinha queima, e você volta ferido.",
          },
          penalidadeFalha: {
            efeitos: {
              habitantes: -5,
              honra: -3,
            },
            texto: "Cinco de seus homens não voltam, e a vila ouve a notícia sem querer.",
          },
        },
        imagem: "assets/batalha.webp",
        imagemAlt: "Cena da vila durante o vizinho pede ajuda",
      },
      {
        id: "volta_do_barao",
        titulo: "A volta do barão",
        tipo: "batalha",
        peso: 1,
        requisitos: {
          rodadaMin: 12,
        },
        texto:
          "Os estandartes cinzentos aparecem no vale. O barão, que ninguém conhece, agora chega em pessoa, com mais homens e menos paciência.",
        informacoes:
          "O ataque precisa alcançar a defesa do exército. Seu escudo reduz o dano recebido, sem se desgastar.",
        opcoes: [
          {
            id: "defender",
            texto: "Defender a vila nas muralhas.",
            combate: true,
          },
          {
            id: "pagar",
            texto: "Pagar o tributo atrasado · 8 gold",
            requisitos: {
              goldMin: 8,
            },
            efeitos: {
              gold: -8,
              honra: -2,
            },
            resultado: "O barão conta as moedas e sorri. Você entende que, para ele, o assunto não terminou.",
          },
          {
            id: "encontro",
            texto: "Pedir um encontro sem armas.",
            requisitos: {
              honraMin: 50,
            },
            efeitos: {
              honra: 3,
              hp: -6,
            },
            resultado:
              "O barão ouve com ar de tédio e concorda em partir. Antes, quebra seu nariz, só para ter algo a contar.",
          },
        ],
        batalha: {
          defesa: 6,
          vitoria: {
            dano: 20,
            efeitos: {
              honra: 5,
              gold: 8,
              habitantes: 4,
            },
            resultado: "O barão recua com metade dos homens. A vila canta, mesmo com as paredes chamuscadas.",
          },
          derrota: {
            dano: 30,
            efeitos: {},
            resultado:
              "As muralhas cedem na terceira investida. O barão ocupa a praça por uma noite e se retira ao amanhecer, sem explicações.",
          },
          penalidadeFalha: {
            efeitos: {
              habitantes: -12,
              gold: -5,
            },
            texto: "Doze moradores morrem ou fogem; o saque leva 5 gold.",
          },
        },
        imagem: "assets/batalha.webp",
        imagemAlt: "Cena da vila durante a volta do barão",
      },
      {
        id: "primo_distante",
        titulo: "O primo distante",
        tipo: "desordem",
        peso: 2,
        requisitos: {
          rodadaMin: 12,
          flagsAusentes: ["primo_decidido"],
        },
        texto:
          "Um homem de sobrenome parecido com o seu chega com uma carta e um sorriso que não olha ninguém nos olhos. Diz ter direitos sobre a terra.",
        informacoes: "Os papéis parecem verdadeiros. Os parentescos, talvez.",
        opcoes: [
          {
            id: "receber",
            texto: "Receber o primo como hóspede.",
            efeitos: {
              honra: 1,
              gold: -3,
            },
            resultado:
              "O primo come, bebe, mede os tapetes e parte. Deixa um cheiro de perfume caro e uma pergunta no ar.",
            flags: {
              primo_decidido: true,
            },
          },
          {
            id: "contestar",
            texto: "Contestar os papéis diante do povo.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 3,
              habitantes: 2,
              hp: -4,
            },
            resultado:
              "A farsa é exposta pelo próprio padre. O primo foge, e a vila, pela primeira vez, ri com você.",
            flags: {
              primo_decidido: true,
            },
          },
          {
            id: "expulsar",
            texto: "Expulsá-lo pela força.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              honra: -5,
              habitantes: -3,
            },
            resultado:
              "O primo é arrastado para fora. Três famílias, que o achavam simpático, deixam a vila logo depois.",
            flags: {
              primo_decidido: true,
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante o primo distante",
      },
      {
        id: "inverno_longo",
        titulo: "O inverno longo",
        tipo: "mandatorio",
        peso: 1,
        requisitos: {
          rodadaMin: 14,
        },
        texto:
          "A neve cobre as portas pela segunda vez. As reservas diminuem, e cada pessoa conta a lenha como quem conta dias.",
        informacoes: "As reservas diminuem, e você só pode dividir o que ainda resta.",
        opcoes: [
          {
            id: "dividir",
            texto: "Dividir o que resta com o povo.",
            efeitos: {
              honra: 2,
              hp: -10,
              habitantes: -4,
            },
            resultado: "Vocês atravessam os meses. Quatro moradores não chegam ao degelo, e sua barba, sim.",
          },
        ],
        imagem: "assets/geada.webp",
        imagemAlt: "Cena da vila durante o inverno longo",
      },
      {
        id: "bispo",
        titulo: "A visita do bispo",
        tipo: "encontro",
        peso: 1,
        requisitos: {
          rodadaMin: 14,
        },
        texto:
          "Um bispo gordo e educado chega em liteira e pede para inspecionar a moral da vila. Ele traz um livro de contas diferente do coletor.",
        informacoes: "O bispo não pede nada, apenas observa. Esse é o problema.",
        opcoes: [
          {
            id: "humildade",
            texto: "Receber com humildade.",
            requisitos: {
              honraMin: 30,
            },
            efeitos: {
              honra: 3,
              habitantes: 3,
              gold: -3,
            },
            resultado:
              "O bispo deixa uma bênção e uma anotação elogiosa. Três famílias do clero ficam para ajudar.",
          },
          {
            id: "doar",
            texto: "Pagar uma doação · 5 gold",
            requisitos: {
              goldMin: 5,
            },
            efeitos: {
              honra: 2,
              gold: -5,
            },
            resultado: "O bispo agradece com palavras longas. A vila entende que o bom nome tem preço.",
          },
          {
            id: "esconder",
            texto: "Esconder o que a vila realmente é.",
            requisitos: {
              honraMax: -30,
            },
            efeitos: {
              gold: 3,
              honra: -4,
              habitantes: -2,
            },
            resultado: "O bispo parte sem desconfiar. Dois moradores que viram a farsa partem logo depois.",
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante a visita do bispo",
      },
      {
        id: "aquele_que_vem_depois",
        titulo: "Aquele que vem depois",
        tipo: "mandatorio",
        peso: 1,
        requisitos: {
          rodadaMin: 20,
          flagsAusentes: ["sucessor_visto"],
        },
        texto:
          "Numa noite sem lua, você vê uma criança sentada no degrau do portão. Ela não responde quando você fala. Apenas olha, e parece já saber seu nome.",
        informacoes: "Ela parece saber seu nome, mas você não sabe de onde veio.",
        opcoes: [
          {
            id: "sentar",
            texto: "Sentar-se ao lado da criança.",
            efeitos: {
              honra: 3,
              hp: -5,
            },
            resultado:
              "Vocês ficam em silêncio até o amanhecer. Ao despertar, o degrau está vazio, e sua vontade, mais leve.",
            flags: {
              sucessor_visto: true,
            },
            desbloqueia: {
              flags: ["sucessor_pressentido"],
            },
          },
        ],
        imagem: "assets/vila.webp",
        imagemAlt: "Cena da vila durante aquele que vem depois",
      },
    ],
  );
})();
