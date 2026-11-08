(function () {
  "use strict";
  const Jogo = (window.Jogo = window.Jogo || {});

  // Eventos de exemplo. Textos, pesos, danos e efeitos podem ser balanceados aqui.
  // Respostas condicionais são filtradas antes de renderizar; algumas cartas têm quatro.
  // O comércio oferece suas mercadorias separadamente, com uma resposta para seguir.
  Jogo.registrarEventos([
    {
      id: "caixas_suspeitas",
      titulo: "Caixas suspeitas",
      tipo: "encontro",
      peso: 3,
      imagem: "assets/caixas.webp",
      imagemAlt: "Caixotes de madeira diante do portão do vilarejo, desenhados em branco sobre preto",
      texto: "Uma carroça de mantimentos chega com um cheiro estranho nas caixas.",
      informacoes:
        "O povo aguarda sua palavra. O mercador pede passagem. Ninguém sabe de onde vieram os mantimentos.",
      opcoes: [
        {
          id: "deixar",
          texto: "Deixem vir.",
          efeitos: { habitantes: -12, honra: -4 },
          flags: { praga_entrou: true },
          resultado:
            "As caixas são abertas. Dias depois, a febre atravessa as casas. Doze moradores não resistem.",
        },
        {
          id: "verificar",
          texto: "Vou verificar pessoalmente.",
          efeitos: { hp: -10, honra: 5 },
          flags: { praga_evitada: true },
          resultado:
            "Você encontra sinais de praga e queima a carga. A exposição cobra sua saúde, mas o povo está a salvo.",
        },
        {
          id: "uniao",
          texto: "Juntos, protejamos a vila.",
          requisitos: { honraMin: 50 },
          efeitos: { honra: 2 },
          flags: { praga_evitada: true },
          resultado:
            "Confiando em você, os moradores denunciam a carga antes que seja aberta. O fogo leva a ameaça para longe.",
        },
        {
          id: "expurgo",
          texto: "Expurgo! Queimem tudo.",
          requisitos: { honraMax: -50 },
          efeitos: { honra: -8 },
          multiplicadores: { habitantes: 0.4 },
          resultado:
            "Seus homens queimam carroça, casas e celeiros. Mais da metade dos moradores morre. A febre cessa; o medo permanece.",
        },
      ],
    },
    {
      id: "viajantes",
      titulo: "À procura de um lar",
      tipo: "encontro",
      peso: 3,
      imagem: "assets/vila.webp",
      imagemAlt: "Casas e uma estrada sob as muralhas do castelo",
      texto: "Cinco viajantes chegam da estrada do norte.",
      informacoes:
        "Perderam a colheita e procuram um lugar onde possam recomeçar. Os viajantes pedem abrigo e um pedaço de terra para cultivar.",
      opcoes: [
        {
          id: "acolher",
          texto: "Há lugar para vocês aqui.",
          requisitos: { honraMin: -49 },
          efeitos: { habitantes: 5, honra: 3 },
          resultado:
            "Cinco novos moradores acendem o fogo em casas vazias. Pela primeira vez em semanas, há risos na praça.",
        },
        {
          id: "trabalho",
          texto: "Abrigo em troca de trabalho.",
          efeitos: { habitantes: 3, honra: -1 },
          resultado:
            "Três aceitam suas condições. Os outros seguem pela estrada. O trabalho cresce; a gratidão, nem tanto.",
        },
        {
          id: "recusar",
          texto: "Sigam seu caminho.",
          efeitos: { honra: -3 },
          resultado: "O portão se fecha. Os viajantes desaparecem na neblina antes do anoitecer.",
        },
      ],
    },
    {
      id: "ferreiro",
      titulo: "O fogo da forja",
      tipo: "encontro",
      peso: 2,
      imagem: "assets/forja.webp",
      imagemAlt: "Uma espada sobre a bigorna da forja",
      texto: "O ferreiro recuperou o aço de uma antiga armadura.",
      informacoes:
        "Há material para reforçar uma peça de seu equipamento. O aço pode melhorar seu ataque ou seu escudo.",
      opcoes: [
        {
          id: "espada",
          texto: "Reforce minha espada.",
          efeitos: { ataque: 1 },
          resultado:
            "O ferreiro endireita a lâmina e lhe dá um novo fio. Sua espada está pronta para o que vier.",
        },
        {
          id: "escudo",
          texto: "Reforce meu escudo.",
          efeitos: { escudo: 1 },
          resultado: "Uma nova chapa cobre a madeira. O escudo suportará golpes mais fortes.",
        },
        {
          id: "povo",
          texto: "Façam ferramentas para o povo.",
          efeitos: { habitantes: 2, honra: 3 },
          resultado: "O aço vira enxadas e martelos. Duas famílias que pensavam em partir decidem ficar.",
        },
      ],
    },
    {
      id: "geada",
      titulo: "A primeira geada",
      tipo: "mandatorio",
      peso: 1,
      imagem: "assets/geada.webp",
      imagemAlt: "Um campo de trigo sob o inverno",
      texto: "O frio chega antes da colheita.",
      informacoes:
        "Na noite em que você ajuda a proteger os campos, o gelo toma a terra e a febre toma seu corpo. O inverno não espera uma decisão. Há coisas que nem um senhor pode impedir.",
      opcoes: [
        {
          id: "enfrentar",
          texto: "Enfrentaremos o inverno.",
          efeitos: { hp: -12, habitantes: -4 },
          resultado:
            "Vocês salvam parte da colheita. Quatro moradores partem em busca de terras mais quentes. Você volta ao castelo adoecido.",
        },
      ],
    },
    {
      id: "celeiro",
      titulo: "Sombras no celeiro",
      tipo: "desordem",
      peso: 1,
      multiplicadoresPeso: [{ requisitos: { honraMax: -30 }, multiplicador: 5 }],
      imagem: "assets/caixas.webp",
      imagemAlt: "Estoques de alimentos junto a um portão de pedra",
      texto: "O estoque de grãos está diminuindo. Na praça, dois vizinhos se acusam de roubo.",
      informacoes:
        "Seus guardas esperam uma ordem. Há comida desaparecida e nenhuma prova contra os acusados.",
      opcoes: [
        {
          id: "investigar",
          texto: "Procurem provas primeiro.",
          requisitos: { honraMin: -49 },
          efeitos: { honra: 3 },
          resultado:
            "Os guardas encontram sacos escondidos por um atravessador. Os vizinhos voltam para casa, envergonhados pelas acusações.",
        },
        {
          id: "punir",
          texto: "Punam os dois. Que sirva de exemplo.",
          efeitos: { habitantes: -3, honra: -5 },
          resultado:
            "O castigo cala a praça. Três moradores fogem durante a noite. Os grãos continuam desaparecendo.",
        },
        {
          id: "ignorar",
          texto: "Resolvam entre vocês.",
          efeitos: { habitantes: -5, honra: -2 },
          resultado:
            "A discussão vira briga. Cinco pessoas deixam a vila, e a porta do celeiro continua sem guarda.",
        },
      ],
    },
    {
      id: "mercador",
      titulo: "O mercador da estrada",
      tipo: "mercador",
      peso: 1,
      imagem: "assets/caixas.webp",
      imagemAlt: "Caixotes de mercadorias diante do portão do vilarejo, desenhados em branco sobre preto",
      texto: "O mercador abre seus caixotes na praça.",
      informacoes:
        "Há remédios, armas e escudos para quem ainda tem moedas. Compre um produto ou siga viagem. Cada compra encarece só aquele produto em 2 gold.",
      mercadorias: [
        {
          id: "pocao_cura",
          texto: "Poção de cura · +10 Vida",
          preco: 5,
          aumentoPreco: 2,
          efeitos: { hp: 10 },
          resultado: "Você bebe a poção. O gosto é amargo, mas suas forças retornam: 10 de vida recuperados.",
        },
        {
          id: "arma_melhor",
          texto: "Arma melhor · +2 Ataque",
          preco: 10,
          aumentoPreco: 2,
          efeitos: { ataque: 2 },
          resultado: "Você troca sua arma por uma lâmina de melhor fio. Seu ataque aumenta em 2.",
        },
        {
          id: "escudo_melhor",
          texto: "Escudo melhor · +3 Escudo",
          preco: 10,
          aumentoPreco: 2,
          efeitos: { escudo: 3 },
          resultado:
            "O escudo reforçado se ajusta ao seu braço. Sua proteção aumenta em 3, sem desgaste em combate.",
        },
      ],
      opcoes: [
        {
          id: "seguir",
          texto: "Seguir sem comprar.",
          resultado:
            "Você deixa as mercadorias na carroça. O mercador segue seu caminho, à procura de outro povoado.",
        },
      ],
    },
    {
      id: "saqueadores",
      titulo: "Saqueadores à vista",
      tipo: "batalha",
      peso: 2,
      imagem: "assets/batalha.webp",
      imagemAlt: "Espadas diante de uma torre vigiada por estandartes",
      texto: "Uma coluna armada desce a colina. O vigia reconhece as bandeiras: saqueadores.",
      informacoes:
        "Entre eles e as casas, apenas você e seus homens. O ataque precisa alcançar a defesa inimiga. Seu escudo reduz o dano recebido, sem se desgastar.",
      batalha: {
        defesa: 3,
        vitoria: {
          dano: 10,
          efeitos: { honra: 3, gold: 3 },
          resultado:
            "Sua lâmina rompe a linha inimiga. Os saqueadores recuam, deixando 3 gold. A vila está de pé; você retorna sem ferimentos.",
        },
        derrota: {
          dano: 24,
          efeitos: {},
          resultado: "A linha inimiga resiste. Você é obrigado a recuar, e os saqueadores alcançam as casas.",
        },
        // A penalidade adicional é própria deste evento; não é um debuff universal.
        penalidadeFalha: {
          efeitos: { habitantes: -12 },
          texto: "Durante o saque, a vila perde doze habitantes.",
        },
      },
      opcoes: [
        { id: "combater", texto: "Às armas. Defendam a vila!", combate: true },
        {
          id: "retirar",
          texto: "Retirar o povo pelas trilhas.",
          efeitos: { habitantes: -5, honra: -2 },
          resultado:
            "A maior parte do povo escapa, mas cinco moradores se perdem na retirada. Os saqueadores levam o que encontram.",
        },
      ],
    },
    {
      id: "ervateira",
      titulo: "As mãos da ervateira",
      tipo: "encontro",
      peso: 2,
      imagem: "assets/ervas.webp",
      imagemAlt: "Ervas e um pilão de remédios, desenhados em branco sobre preto",
      texto: "Uma mulher chega com ervas e uma agulha torta.",
      informacoes:
        "Trata feridas há quarenta invernos; seus pacientes ainda discutem os métodos. Ela aceita moedas pelo tratamento ou ajuda para colher mais ervas.",
      opcoes: [
        {
          id: "tratamento",
          texto: "Aceitar o tratamento · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, hp: 18 },
          resultado:
            "A agulha dói mais que a batalha. Ao amanhecer, a febre cede: você recupera 18 de vida por 3 gold.",
        },
        {
          id: "colher",
          texto: "Ajudar na colheita das ervas.",
          efeitos: { hp: 8, honra: 2 },
          resultado:
            "Você volta coberto de lama, com um emplastro e oito pontos de vida a mais. A ervateira guarda seu nome.",
        },
        {
          id: "povo",
          texto: "Levá-la aos doentes da vila.",
          efeitos: { habitantes: 3, honra: 3 },
          resultado:
            "Três moradores que pensavam em partir melhoram e ficam. O senhor precisará esperar pela própria consulta.",
        },
      ],
    },
    {
      id: "ponte_partida",
      titulo: "A ponte partida",
      tipo: "encontro",
      peso: 2,
      requisitos: { flagsAusentes: ["ponte_reparada"] },
      imagem: "assets/ponte.webp",
      imagemAlt: "Uma ponte de madeira partida sobre um rio",
      texto: "A ponte do moinho cedeu.",
      informacoes:
        "Do outro lado, carroças esperam; deste, o carpinteiro calcula quantas tábuas ainda podem ser chamadas de tábuas. Reabrir a estrada pode trazer gente e comércio mais adiante.",
      opcoes: [
        {
          id: "madeira",
          texto: "Comprar madeira nova · 4 gold",
          requisitos: { goldMin: 4 },
          efeitos: { gold: -4, habitantes: 4, honra: 3 },
          flags: { ponte_reparada: true },
          resultado:
            "A ponte fica pronta. Quatro viajantes escolhem ficar na vila. Agora as carroças podem voltar a passar.",
        },
        {
          id: "trabalhar",
          texto: "Trabalhar ao lado do carpinteiro.",
          efeitos: { hp: -8, honra: 3 },
          flags: { ponte_reparada: true },
          resultado:
            "Você perde oito de vida entre farpas e pedras, mas a ponte resiste à primeira carroça. O carpinteiro parece surpreso.",
        },
        {
          id: "pedagio",
          texto: "Cobrar a travessia para pagar a obra.",
          efeitos: { gold: 4, honra: -3 },
          flags: { ponte_reparada: true, ponte_com_pedagio: true },
          resultado:
            "Os viajantes pagam reclamando. A obra termina e sobram 4 gold no cofre. A estrada volta a ter movimento.",
        },
      ],
    },
    {
      id: "caravana_da_ponte",
      titulo: "Rodas sobre o rio",
      tipo: "encontro",
      peso: 3,
      requisitos: { flags: ["ponte_reparada"], flagsAusentes: ["caravana_recebida"] },
      imagem: "assets/caixas.webp",
      imagemAlt: "Caixotes de uma caravana diante do portão",
      texto: "Uma caravana cruza a ponte reparada.",
      informacoes:
        "A condutora oferece pagamento por um lugar no pátio; algumas famílias procuram algo mais permanente. A ponte trouxe a primeira oportunidade de comércio. A caravana partirá de manhã.",
      opcoes: [
        {
          id: "comercio",
          texto: "Abrir o pátio ao comércio.",
          efeitos: { gold: 7, honra: 1 },
          flags: { caravana_recebida: true },
          resultado:
            "O pátio se enche de vozes. A vila recebe 7 gold pelo comércio; a condutora promete contar sobre a nova passagem.",
        },
        {
          id: "acolher",
          texto: "Oferecer terra às famílias.",
          efeitos: { habitantes: 7, gold: 2, honra: 3 },
          flags: { caravana_recebida: true },
          resultado:
            "Sete pessoas ficam para cultivar as terras vazias. Deixam 2 gold como contribuição e penduram roupas nas janelas.",
        },
        {
          id: "confiscar",
          texto: "Requisitar parte da carga.",
          efeitos: { gold: 10, honra: -6 },
          flags: { caravana_recebida: true },
          resultado:
            "Seus guardas recolhem mercadorias que rendem 10 gold. A condutora anota o nome da vila e parte antes da aurora.",
        },
      ],
    },
    {
      id: "poco_turvo",
      titulo: "O fundo do poço",
      tipo: "encontro",
      peso: 2,
      requisitos: { flagsAusentes: ["poco_decidido"] },
      imagem: "assets/poco.webp",
      imagemAlt: "Poço de pedra e um balde gasto na praça",
      texto: "A água do poço tem gosto de ferro.",
      informacoes:
        "Um pedreiro oferece limpar o fundo; na praça, alguém garante que sempre teve esse gosto. Uma corda e algumas pedras podem custar menos que uma vila doente.",
      opcoes: [
        {
          id: "consertar",
          texto: "Pagar a limpeza · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, habitantes: 3, honra: 2 },
          flags: { poco_decidido: true },
          resultado:
            "O pedreiro retira um balde enferrujado do fundo. A água clareia, e três moradores desistem de abandonar a vila.",
        },
        {
          id: "descer",
          texto: "Descer ao poço com os guardas.",
          efeitos: { hp: -7, honra: 3 },
          flags: { poco_decidido: true },
          resultado:
            "Você volta com os joelhos feridos e o balde culpado. Perde sete de vida; a água deixa de ter gosto de ferrugem.",
        },
        {
          id: "adiar",
          texto: "Deixar para depois da colheita.",
          efeitos: { honra: -2 },
          flags: { poco_decidido: true, poco_contaminado: true },
          resultado:
            "As moedas ficam no cofre. Por alguns dias, só se fala do gosto da água. Depois, começam as tosses.",
        },
      ],
    },
    {
      id: "febre_do_poco",
      titulo: "As portas fechadas",
      tipo: "desordem",
      peso: 4,
      requisitos: { flags: ["poco_contaminado"], flagsAusentes: ["febre_resolvida"] },
      imagem: "assets/poco.webp",
      imagemAlt: "O poço de água contaminada no centro do povoado",
      texto: "A curandeira pede ajuda e remédios antes que a febre se espalhe.",
      informacoes:
        "A água turva cobrou sua parte. O problema deixado no poço voltou às casas. Ainda há gente que pode ser salva.",
      opcoes: [
        {
          id: "remedios",
          texto: "Trazer remédios · 4 gold",
          requisitos: { goldMin: 4 },
          efeitos: { gold: -4, hp: 10, habitantes: 3, honra: 4 },
          flags: { febre_resolvida: true },
          resultado:
            "Os remédios chegam a tempo. Você recupera dez de vida; três moradores melhoram e permanecem na vila.",
        },
        {
          id: "cuidar",
          texto: "Cuidar dos doentes pessoalmente.",
          efeitos: { hp: -10, honra: 5 },
          flags: { febre_resolvida: true },
          resultado:
            "A vila atravessa a febre sem novas partidas. Você paga com dez de vida e noites que os moradores não esquecerão.",
        },
        {
          id: "expulsar",
          texto: "Mandar os doentes para fora.",
          efeitos: { habitantes: -6, honra: -6 },
          flags: { febre_resolvida: true },
          resultado:
            "Seis pessoas deixam suas casas. A febre recua dentro das muralhas; nas estradas, ninguém conta os dias.",
        },
      ],
    },
    {
      id: "contrabandista",
      titulo: "O caminho sem guarda",
      tipo: "encontro",
      peso: 1,
      imagem: "assets/caixas.webp",
      imagemAlt: "Caixas fechadas junto à entrada da vila",
      texto: "Um viajante oferece moedas para atravessar sem abrir os sacos.",
      informacoes:
        "Diz que transporta sal. Seu burro parece o único a acreditar. Ele paga pela discrição. Inspecionar a carga também exige seus homens.",
      opcoes: [
        {
          id: "aceitar",
          texto: "Aceitar o pagamento e abrir passagem.",
          efeitos: { gold: 8, honra: -5 },
          resultado:
            "O viajante deixa 8 gold. Ao amanhecer, uma aldeia vizinha reclama de ferramentas roubadas. Os sacos já estão longe.",
        },
        {
          id: "inspecionar",
          texto: "Abrir os sacos sob sua guarda.",
          efeitos: { hp: -4, gold: 3, honra: 2 },
          resultado:
            "Uma faca escondida corta seu braço: quatro de vida perdidos. Os bens roubados voltam aos donos, que deixam 3 gold.",
        },
        {
          id: "voltar",
          texto: "Mandá-lo voltar pela estrada.",
          efeitos: { honra: 1 },
          resultado:
            "O burro se vira antes do dono. Nenhuma moeda muda de mãos. Pela manhã, o caminho ainda está quieto.",
        },
      ],
    },
    {
      id: "milicia",
      titulo: "Escudos de celeiro",
      tipo: "encontro",
      peso: 2,
      imagem: "assets/forja.webp",
      imagemAlt: "Lâmina e bigorna de uma oficina simples",
      texto: "Os moradores ensaiam uma defesa com tampas de barril.",
      informacoes:
        "Um veterano oferece instrução; metade da turma segura o escudo ao contrário. O treino pode melhorar seu equipamento ou devolver braços ao trabalho da vila.",
      opcoes: [
        {
          id: "instruir",
          texto: "Contratar o veterano · 5 gold",
          requisitos: { goldMin: 5 },
          efeitos: { gold: -5, ataque: 1, escudo: 1 },
          resultado:
            "Cinco gold compram lições e reparos. Seu ataque e seu escudo aumentam em um. As tampas voltam aos barris.",
        },
        {
          id: "treinar",
          texto: "Conduzir o treino pessoalmente.",
          efeitos: { hp: -6, ataque: 1 },
          resultado:
            "O treino termina com seis de vida a menos e um de ataque a mais. Seu ombro descobre por que o veterano se aposentou.",
        },
        {
          id: "campos",
          texto: "Liberá-los para cuidar dos campos.",
          efeitos: { habitantes: 4, honra: 2 },
          resultado:
            "Com ajuda na colheita, quatro moradores decidem ficar. O veterano guarda a espada e pede uma enxada.",
        },
      ],
    },
    {
      id: "enchente",
      titulo: "O rio dentro de casa",
      tipo: "mandatorio",
      peso: 1,
      imagem: "assets/vila.webp",
      imagemAlt: "Casas nas terras baixas do vilarejo",
      texto: "O rio sobe durante a noite.",
      informacoes:
        "Você ajuda a tirar crianças e sacos de farinha das casas; a corrente não distingue um do outro. A água já entrou. O que resta é salvar quem ainda pode sair.",
      opcoes: [
        {
          id: "resgatar",
          texto: "Entrar na água com o povo.",
          efeitos: { hp: -6, habitantes: -3, honra: 2 },
          resultado:
            "Três moradores partem após perder suas casas. Você perde seis de vida no resgate, mas os sinos voltam a tocar pela manhã.",
        },
      ],
    },
    {
      id: "pedreira",
      titulo: "Pedra e pão",
      tipo: "encontro",
      peso: 2,
      imagem: "assets/forja.webp",
      imagemAlt: "Ferramentas de ferro usadas pelos trabalhadores",
      texto: "A velha pedreira ainda guarda pedra boa.",
      informacoes:
        "Os trabalhadores pedem comida antes de entrar; o comprador quer a carga antes do próximo frio. A obra pode render moedas, atrair trabalhadores ou esperar uma estação melhor.",
      opcoes: [
        {
          id: "trabalhar",
          texto: "Entrar na pedreira com eles.",
          efeitos: { hp: -5, gold: 5 },
          resultado:
            "A carga rende 5 gold. Uma pedra cobra cinco de vida do seu pé. Os trabalhadores guardam uma porção de pão para você.",
        },
        {
          id: "alimentar",
          texto: "Abastecer os trabalhadores · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, habitantes: 5, honra: 2 },
          resultado:
            "Cinco trabalhadores ficam com suas famílias. Os 3 gold viram comida e mãos que a vila não tinha ontem.",
        },
        {
          id: "fechar",
          texto: "Esperar até os escoramentos ficarem prontos.",
          efeitos: { honra: 2 },
          resultado:
            "O comprador vai embora. Nenhum carro sai carregado, e nenhum trabalhador precisa ser carregado para casa.",
        },
      ],
    },
    {
      id: "desertores",
      titulo: "Soldados sem bandeira",
      tipo: "batalha",
      peso: 1,
      requisitos: { rodadaMin: 6 },
      imagem: "assets/batalha.webp",
      imagemAlt: "Espadas e uma torre sob estandartes",
      texto: "Soldados sem senhor acampam perto do moinho. Pedem um tributo para ir embora.",
      informacoes:
        "Os sacos de farinha já estão junto aos seus cavalos. Eles têm treino e equipamento. A farinha e as moedas do moinho estão com eles.",
      batalha: {
        dadosInimigo: 2,
        defesa: 5,
        vitoria: {
          dano: 16,
          efeitos: { gold: 7, habitantes: 3, honra: 3 },
          resultado:
            "Os desertores fogem. Você recupera 7 gold, e três moleiros voltam à vila. A farinha será dividida na praça.",
        },
        derrota: {
          dano: 25,
          efeitos: {},
          resultado:
            "Os soldados rompem sua linha e levam o moinho. Você recua com os homens que ainda conseguem andar.",
        },
        penalidadeFalha: {
          efeitos: { habitantes: -5, gold: -2 },
          texto: "Cinco moradores fogem; o saque leva mais 2 gold.",
        },
      },
      opcoes: [
        { id: "combater", texto: "Tomar o moinho de volta.", combate: true },
        {
          id: "pagar",
          texto: "Negociar a partida · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, honra: -1 },
          resultado:
            "Os soldados aceitam 3 gold e deixam a farinha. O moleiro conta os sacos duas vezes antes de acreditar.",
        },
        {
          id: "evacuar",
          texto: "Retirar as famílias do moinho.",
          efeitos: { habitantes: -2, honra: 1 },
          resultado:
            "Duas pessoas se perdem na retirada. As outras chegam à vila; o moinho fica para os soldados por enquanto.",
        },
      ],
    },
    {
      id: "javalis",
      titulo: "Os donos da plantação",
      tipo: "batalha",
      peso: 2,
      imagem: "assets/geada.webp",
      imagemAlt: "Espigas de uma plantação no campo",
      texto: "Javalis entraram na plantação. O maior dorme sobre o espantalho.",
      informacoes:
        "Os lavradores esperam que alguém lhe explique a propriedade da terra. Salvar a colheita permite vender o excedente e manter os lavradores na vila.",
      batalha: {
        defesa: 2,
        vitoria: {
          dano: 12,
          efeitos: { gold: 4, habitantes: 2, honra: 2 },
          resultado:
            "A plantação é salva. A venda do excedente rende 4 gold, e dois lavradores desistem de partir.",
        },
        derrota: {
          dano: 20,
          efeitos: {},
          resultado:
            "Os animais atravessam sua defesa e a plantação. Você volta carregado numa porta de celeiro.",
        },
        penalidadeFalha: {
          efeitos: { hp: -4, habitantes: -3 },
          texto: "A queda custa mais quatro de vida; três lavradores abandonam as terras.",
        },
      },
      opcoes: [
        { id: "cacar", texto: "Reunir os guardas para a caçada.", combate: true },
        {
          id: "cacador",
          texto: "Chamar um caçador · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3, habitantes: 2 },
          resultado:
            "O caçador afasta os animais por 3 gold. Dois lavradores ficam; o espantalho é aposentado com pouca cerimônia.",
        },
        {
          id: "ceder",
          texto: "Abandonar aquela parte da plantação.",
          efeitos: { habitantes: -4, honra: -1 },
          resultado:
            "Quatro lavradores partem. Os javalis ficam com a terra e não demonstram intenção de pagar impostos.",
        },
      ],
    },
    {
      id: "colheita",
      titulo: "Uma noite sem fome",
      tipo: "encontro",
      peso: 2,
      imagem: "assets/geada.webp",
      imagemAlt: "Espigas maduras desenhadas em branco sobre preto",
      texto: "Pela primeira vez, sobrou grão.",
      informacoes:
        "O celeireiro traz as contas; do lado de fora, alguém ensaia uma música que só lembra pela metade. O excedente pode virar moedas, comida para os moradores ou um breve descanso.",
      opcoes: [
        {
          id: "vender",
          texto: "Vender o excedente na estrada.",
          efeitos: { gold: 6, honra: -2 },
          resultado:
            "Os sacos rendem 6 gold. Na praça, a música termina cedo. O celeireiro guarda as moedas num pote de farinha.",
        },
        {
          id: "repartir",
          texto: "Dividir o grão entre as casas.",
          efeitos: { hp: 10, habitantes: 4, honra: 3 },
          resultado:
            "Você recupera dez de vida à mesa do povo. Quatro viajantes ficam para a próxima colheita, e a música ganha um verso.",
        },
        {
          id: "descansar",
          texto: "Guardar sementes e descansar.",
          efeitos: { hp: 16, habitantes: 1 },
          resultado:
            "Você recupera dezesseis de vida. Um lavrador fica para cuidar das sementes; ninguém lhe pede uma ordem até a manhã.",
        },
      ],
    },
    {
      id: "cura_critica",
      titulo: "Um lugar para respirar",
      tipo: "especial",
      peso: 0,
      especial: true,
      imagem: "assets/eventos-sistemas/inverno.webp",
      imagemAlt: "Uma lamparina acesa numa sala aquecida durante a noite",
      texto: "O boticário percebe que você mal consegue ficar de pé.",
      informacoes:
        "Ele afasta os curiosos, prepara água quente e pede que a vila cuide do resto até o amanhecer. O repouso recupera sua Vida até 70% do máximo e não custa Gold.",
      opcoes: [
        {
          id: "repousar",
          texto: "Aceitar os cuidados e repousar.",
          resultado:
            "Você passa a noite sob os cuidados do boticário. A febre cede, e seus passos recuperam firmeza.",
        },
      ],
    },
    {
      id: "orfao",
      titulo: "Uma criança no portão",
      tipo: "encontro",
      narrativamenteUnico: true,
      oncePerRun: true,
      peso: 2,
      requisitos: {
        flagsAusentes: ["orfao_decidido"],
        tracosAusentes: ["menino_cronista"],
      },
      imagem: "assets/eventos-pessoas/menino-conselheiro.webp",
      imagemAlt: "O menino que espera diante do portão da vila",
      texto: "Um menino sujo de cinzas espera no portão com uma trouxa menor que ele.",
      informacoes:
        "Diz que veio da vila queimada ao sul e que conheceu seu pai. Os guardas fingem não ouvir. Ninguém pode confirmar a história do menino.",
      opcoes: [
        {
          id: "acolher",
          texto: "Ele fica conosco.",
          requisitos: { honraMin: -49 },
          efeitos: { habitantes: 1, honra: 3 },
          flags: { orfao_decidido: true, orfao_acolhido: true },
          marcoRodada: { id: "menino_adotado", honraMin: 50, flag: "menino_adotado_com_honra" },
          consequenciaTardia: { eventoId: "retorno_do_menino", atrasoMin: 10, atrasoMax: 20 },
          resultado:
            "O menino come como quem não vê comida há dias. A cozinheira finge reclamar e lhe dá um pedaço de pão a mais.",
        },
        {
          id: "pao",
          texto: "Dar pão e mandá-lo seguir.",
          requisitos: { goldMin: 1 },
          efeitos: { honra: 1, gold: -1 },
          flags: { orfao_decidido: true },
          resultado:
            "Ele agradece sem sorrir e segue pela estrada. Um guarda o observa até sumir na neblina.",
        },
        {
          id: "tutelar",
          texto: "Seu pai também chegou aqui sem nada. Será criado como meu.",
          requisitos: { honraMin: 50 },
          efeitos: { habitantes: 1, honra: 2 },
          flags: { orfao_decidido: true, orfao_acolhido: true },
          marcoRodada: { id: "menino_adotado", honraMin: 50, flag: "menino_adotado_com_honra" },
          consequenciaTardia: { eventoId: "retorno_do_menino", atrasoMin: 10, atrasoMax: 20 },
          resultado:
            "O menino ganha um catre perto da forja e um sobrenome emprestado. Na praça, ninguém comenta; todos observam.",
        },
        {
          id: "explorar",
          texto: "Trabalho em troca de telhado.",
          requisitos: { honraMax: -50 },
          efeitos: { gold: 3, honra: -4 },
          flags: { orfao_decidido: true, orfao_explorado: true },
          resultado:
            "O menino carrega sacos até cair de sono. Os moradores olham para o chão e fazem as contas do que isso diz sobre o senhor.",
        },
      ],
    },
    {
      id: "orfao_cresce",
      titulo: "O menino e a espada",
      tipo: "encontro",
      peso: 3,
      requisitos: {
        flags: ["orfao_acolhido"],
        flagsAusentes: ["orfao_resolvido"],
        tracosAusentes: ["menino_cronista"],
        rodadaMin: 8,
      },
      imagem: "assets/forja.webp",
      imagemAlt: "Espada de treino junto à bigorna do ferreiro",
      texto: "O menino cresceu, e seu galho de árvore virou espada de treino.",
      informacoes:
        "Ele pede que você o ensine, e que ninguém conte à cozinheira. A vila acompanha o que você fizer com o garoto que acolheu.",
      opcoes: [
        {
          id: "treinar",
          texto: "Treinar com ele pessoalmente.",
          efeitos: { ataque: 1, honra: 2, hp: -4 },
          flags: { orfao_resolvido: true },
          resultado:
            "Ele acerta suas costelas três vezes antes de aprender a guardar. Você perde quatro de vida e ganha um aliado de verdade.",
        },
        {
          id: "ferreiro",
          texto: "Encaminhá-lo ao ferreiro · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { escudo: 1, honra: 1, gold: -3 },
          flags: { orfao_resolvido: true },
          consequenciaTardia: { eventoId: "promessa_do_ferreiro", atrasoMin: 10, atrasoMax: 20 },
          resultado:
            "O ferreiro aceita o aprendiz. Em um mês, seu escudo ganha rebites que não estavam ali antes.",
        },
        {
          id: "campos",
          texto: "Ele aprende melhor nos campos.",
          efeitos: { habitantes: 2, honra: -1 },
          flags: { orfao_resolvido: true },
          resultado:
            "O menino volta à enxada, de cara fechada. Dois lavradores, que viam nele um sinal de esperança, decidem ficar.",
        },
      ],
    },
    {
      id: "testamento",
      titulo: "A vontade do velho senhor",
      tipo: "mandatorio",
      peso: 1,
      requisitos: { rodadaMin: 5, flagsAusentes: ["testamento_lido"] },
      imagem: "assets/caixas.webp",
      imagemAlt: "Um cofre entre os bens guardados pelo antigo senhor",
      texto: "Na chuva, você encontra o cofre do predecessor e uma carta pedindo perdão.",
      informacoes: "A carta pede perdão a pessoas que você nunca conheceu. As moedas não apagam esse pedido.",
      opcoes: [
        {
          id: "ler",
          texto: "Ler a vontade do senhor.",
          efeitos: { gold: 6, honra: -3 },
          flags: { testamento_lido: true },
          desbloqueia: { flags: ["vontade_lembrada"] },
          resultado:
            "As moedas são suas. A culpa também. Nos dias seguintes, velhos moradores o olham como se reconhecessem alguém.",
        },
      ],
    },
    {
      id: "banquete",
      titulo: "A mesa do povo",
      tipo: "encontro",
      peso: 2,
      requisitos: { honraMin: 30 },
      imagem: "assets/vila.webp",
      imagemAlt: "As casas do povoado reunidas ao redor da praça",
      texto: "Os moradores arrastam mesas para a praça sem pedir permissão.",
      informacoes:
        "Há pão, sopa rala e um violeiro que só sabe uma música. Guardaram o lugar da cabeceira para você. O povo oferece a refeição; o que você faz com ela é decisão sua.",
      opcoes: [
        {
          id: "sentar",
          texto: "Sentar-se entre eles.",
          efeitos: { hp: 8, habitantes: 3, honra: 2 },
          resultado:
            "Você come na mesma tigela que os outros. Três famílias ouvem falar do banquete e pedem lugar na vila.",
        },
        {
          id: "vinho",
          texto: "Mandar abrir o barril de vinho · 4 gold",
          requisitos: { goldMin: 4 },
          efeitos: { habitantes: 5, honra: 3, gold: -4 },
          resultado:
            "A música ganha uma segunda estrofe. Cinco viajantes seguem o cheiro do vinho, ficam na vila, e o barril esvazia antes do amanhecer.",
        },
        {
          id: "servir",
          texto: "Erguer a taça ao povo e servi-lo.",
          requisitos: { honraMin: 50 },
          efeitos: { escudo: 1, honra: 3 },
          resultado:
            "Você serve sopa até o último prato. Os ferreiros, tocados, soldam uma nova chapa no seu escudo antes de dormir.",
        },
        {
          id: "cobrar",
          texto: "Cobrar uma moeda por prato.",
          efeitos: { gold: 5, honra: -4 },
          resultado:
            "O violeiro para no meio da música. A praça se esvazia mais cedo do que enche, mas o cofre fica mais pesado.",
        },
      ],
    },
    {
      id: "taverna",
      titulo: "A taverna sem dono",
      tipo: "desordem",
      peso: 1,
      multiplicadoresPeso: [{ requisitos: { honraMax: -30 }, multiplicador: 5 }],
      imagem: "assets/vila.webp",
      imagemAlt: "Casas de madeira junto à praça da vila",
      texto: "Uma briga começou por causa de uma canção e acabou quando a mesa quebrou.",
      informacoes:
        "Agora três homens se acusam, e o dono da taverna chora em cima do balcão. A vila observa quem o senhor decide proteger.",
      opcoes: [
        {
          id: "mediar",
          texto: "Entrar na briga para separar.",
          requisitos: { honraMin: -49 },
          efeitos: { honra: 3, hp: -5 },
          resultado:
            "Você leva um banco nas costas antes de conseguir falar. A briga acaba por vergonha, não por autoridade.",
        },
        {
          id: "pagar",
          texto: "Pagar uma rodada para todos · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { honra: 1, gold: -3 },
          resultado:
            'A raiva afoga na cerveja. O dono da taverna anota o nome do senhor num caderno de "bons clientes".',
        },
        {
          id: "dispersar",
          texto: "Mandar os guardas dispersarem.",
          efeitos: { habitantes: -2, honra: -1 },
          resultado:
            "A praça esvazia com cassetetes. Duas famílias decidem que uma vila sem canções não vale a estadia.",
        },
        {
          id: "prender",
          texto: "Prender todos e fechar a taverna.",
          requisitos: { honraMax: -50 },
          efeitos: { gold: 4, habitantes: -4, honra: -6 },
          resultado:
            "As multas enchem o cofre, e as portas, os cadeados. Quatro moradores partem na mesma noite, sem se despedir.",
        },
      ],
    },
    {
      id: "peregrino",
      titulo: "O peregrino das relíquias",
      tipo: "encontro",
      peso: 2,
      imagem: "assets/ervas.webp",
      imagemAlt: "Pequenos embrulhos e ervas de um viajante da estrada",
      texto: "Um peregrino de sandálias gastas oferece um dente de santo embrulhado em pano.",
      informacoes:
        "Jura que traz bênçãos para quem o tocar. O pano cheira a estábulo. Ninguém sabe se a relíquia é verdadeira. A fé do povo vale tanto quanto a verdade, ou mais.",
      opcoes: [
        {
          id: "comprar",
          texto: "Comprar a relíquia · 5 gold",
          requisitos: { goldMin: 5 },
          efeitos: { habitantes: 3, honra: 2, gold: -5 },
          resultado:
            "O povo reza diante do dente. Ninguém sabe se é de santo ou de cavalo, mas três pessoas decidem que a vila foi abençoada.",
        },
        {
          id: "revistar",
          texto: "Examinar a bagagem do peregrino.",
          efeitos: { gold: 4, honra: 1 },
          resultado:
            "Você encontra uma sacola de dentes de todos os tamanhos. O peregrino deixa 4 gold para não ser entregue à guarda.",
        },
        {
          id: "taxar",
          texto: "Cobrar uma taxa pela bênção.",
          efeitos: { gold: 3, honra: -2 },
          resultado:
            "O peregrino paga com cara fechada. Algumas pessoas na praça apontam o dedo, outras, a bolsa dele.",
        },
      ],
    },
    {
      id: "barao",
      titulo: "O cobrador do barão",
      tipo: "batalha",
      peso: 2,
      requisitos: { rodadaMin: 4 },
      imagem: "assets/batalha.webp",
      imagemAlt: "Espadas e estandartes dos homens do barão",
      texto: "Um cavaleiro de armadura cinza exige tributo em nome de um barão que ninguém conhece.",
      informacoes:
        "Seus homens esperam atrás, em formação mais limpa do que a de qualquer guarda seu. O cavaleiro exige o tributo. A vila aguarda a sua palavra.",
      batalha: {
        forcarDerrota: true,
        encerrarAoFalhar: true,
        motivoFim:
          "A crônica do herdeiro termina diante do cobrador. No livro da vila, alguém deixou uma nota sobre a dívida que ficou.",
        mostrarLeitura: false,
        defesa: 4,
        vitoria: {
          dano: 14,
          efeitos: { gold: 6, habitantes: 2, honra: 3 },
          resultado:
            "O cavaleiro cai da sela. Os homens do barão recuam levando-o, deixando 6 gold e dois desertores que pedem para ficar.",
        },
        derrota: {
          dano: 22,
          efeitos: {},
          resultado:
            "Você é desarmado antes de entender o golpe. O cavaleiro leva o que quer e deixa um aviso na porta.",
        },
        penalidadeFalha: {
          efeitos: { habitantes: -6, gold: -3 },
          texto: "Seis moradores seguem os soldados em busca de proteção; o saque leva mais 3 gold.",
        },
      },
      opcoes: [
        { id: "combater", texto: "Recusar o tributo e lutar.", combate: true },
        {
          id: "pagar",
          texto: "Pagar o tributo · 6 gold",
          requisitos: { goldMin: 6 },
          efeitos: { gold: -6, honra: -1 },
          resultado:
            "O cavaleiro conta as moedas duas vezes e sorri. Você entende que ele voltará, e que o povo também entendeu.",
        },
        {
          id: "negociar",
          texto: "Falar em nome do povo · 3 gold",
          requisitos: { honraMin: 50, goldMin: 3 },
          efeitos: { honra: 2, hp: -3, gold: -3 },
          resultado:
            "O cavaleiro ouve até o fim, ofendido. No fim aceita metade do tributo, mas não sem acertar o seu ombro com a manopla.",
        },
        {
          id: "recusar",
          texto: "Recusar e deixar uma nota aos que virão.",
          requisitos: { honraMax: 49 },
          resultado:
            "O cobrador parte com os homens. No livro da vila, alguém registra o que restou da dívida.",
          encerramento: {
            tipo: "derrota",
            motivo:
              "A crônica do herdeiro termina diante do cobrador. No livro da vila, alguém deixou uma nota sobre a dívida que ficou.",
          },
        },
      ],
    },
    {
      id: "pedagio_revolta",
      titulo: "O preço da ponte",
      tipo: "desordem",
      peso: 4,
      requisitos: { flags: ["ponte_com_pedagio"], flagsAusentes: ["pedagio_resolvido"] },
      imagem: "assets/ponte.webp",
      imagemAlt: "A passagem da ponte sob protestos dos viajantes",
      texto: "Os viajantes reclamam do pedágio.",
      informacoes:
        "Alguém queimou a cancela durante a noite, e a fumaça ainda sobe sobre o rio. Os guardas procuram culpados; o povo procura desculpas. A ponte que você cobrou voltou a cobrar de você.",
      opcoes: [
        {
          id: "abolir",
          texto: "Abolir o pedágio · 3 gold",
          requisitos: { goldMin: 3 },
          efeitos: { habitantes: 3, honra: 3, gold: -3 },
          flags: { pedagio_resolvido: true, pedagio_abolido: true },
          resultado:
            "Você paga a madeira nova de cancelas que ninguém cobrará. A estrada volta a lotar, e os viajantes agradecem sem fazer barulho.",
        },
        {
          id: "guardar",
          texto: "Dobrar a guarda da ponte.",
          efeitos: { gold: 3, honra: -2 },
          flags: { pedagio_resolvido: true },
          resultado:
            "Os soldados vigiam a ponte de dia e de noite. O dinheiro chega e as visitas ficam mais raras.",
        },
        {
          id: "enforcar",
          texto: "Enforcar os incendiários.",
          requisitos: { honraMax: -50 },
          efeitos: { habitantes: -3, honra: -8 },
          flags: { pedagio_resolvido: true },
          resultado:
            "Ninguém discute o pedágio na semana seguinte. Três famílias levam suas coisas na calada da noite.",
        },
      ],
    },
  ]);
})();
