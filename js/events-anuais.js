(function () {
  "use strict";
  const Jogo = window.Jogo;

  Jogo.registrarEventos(
    {
      id: "ano_novo_lunar",
      titulo: "Ano Novo Lunar",
      tipo: "encontro",
      peso: 2,
      oncePerRun: true,
      requisitos: { estacao: "primavera" },
      imagem: "assets/vila.webp",
      imagemAlt: "Moradores reunidos na praça para celebrar o começo do ano",
      texto:
        "Viajantes do leste chegam com lanternas e um calendário marcado pelos ciclos da lua. A vila se reúne para dar as boas-vindas ao novo ano.",
      informacoes:
        "A celebração pode unir a vila, trazer prosperidade ou encher seus cofres à custa da festa.",
      opcoes: [
        {
          id: "ano_lunar_festa",
          texto: "Abrir os portões e oferecer um banquete · 2 Gold.",
          requisitos: { goldMin: 2 },
          efeitos: { gold: -2, habitantes: 4, honra: 2 },
          resultado:
            "Viajantes e moradores dividem a mesa. Quatro pessoas decidem ficar, e as lanternas continuam acesas até o amanhecer.",
        },
        {
          id: "ano_lunar_bencao",
          texto: "Acompanhar a vigília das lanternas.",
          efeitos: { hp: 6, honra: 3 },
          resultado:
            "Você acompanha as lanternas até a última desaparecer. A vila começa o ano em paz, e o descanso recupera suas forças.",
        },
        {
          id: "ano_lunar_imposto",
          texto: "Cobrar pela entrada e pelo espaço na praça.",
          efeitos: { gold: 5, honra: -3 },
          resultado:
            "A praça rende algumas moedas. Os viajantes partem antes da meia-noite, levando consigo a música.",
        },
      ],
    },
    {
      id: "festival_dos_mortos",
      titulo: "Festival dos Mortos",
      tipo: "encontro",
      peso: 2,
      oncePerRun: true,
      requisitos: { estacao: "outono" },
      imagem: "assets/ervas.webp",
      imagemAlt: "Pequenas velas acesas entre folhas de outono",
      texto:
        "Com a queda das folhas, as famílias acendem velas para lembrar quem já se foi. Uma procissão atravessa a vila levando nomes, canções e pequenas oferendas.",
      informacoes:
        "A lembrança dos mortos pode aproximar os vivos ou servir de desculpa para tomar o que foi deixado nos altares.",
      opcoes: [
        {
          id: "mortos_procissao",
          texto: "Caminhar com as famílias e ouvir suas histórias.",
          efeitos: { hp: 5, honra: 3 },
          resultado:
            "A procissão atravessa as ruas em silêncio. Ao fim, os moradores voltam para casa mais próximos uns dos outros.",
        },
        {
          id: "mortos_oferenda",
          texto: "Preparar uma mesa comum para os visitantes · 2 Gold.",
          requisitos: { goldMin: 2 },
          efeitos: { gold: -2, habitantes: 3, honra: 2 },
          resultado:
            "A mesa acolhe quem veio de longe para a procissão. Três viajantes ficam na vila depois do festival.",
        },
        {
          id: "mortos_tomar",
          texto: "Recolher as oferendas antes que alguém as leve.",
          efeitos: { gold: 5, honra: -4 },
          resultado:
            "As moedas dos altares passam para seus cofres. Naquela noite, ninguém canta seu nome entre os mortos.",
        },
      ],
    },
    {
      id: "disputa_das_mudas",
      titulo: "A disputa pelas mudas",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      forcarSorteioQuandoElegivel: true,
      requisitos: { ano: 2, estacao: "primavera" },
      imagem: "assets/eventos-sistemas/primavera.webp",
      imagemAlt: "Mudas novas esperam para ser plantadas no começo da primavera",
      texto:
        "Duas famílias chegam para buscar as últimas mudas guardadas no moinho. Cada uma diz ter recebido a promessa antes do inverno.",
      informacoes: "A decisão define quem planta primeiro e quem aceita dividir o terreno.",
      opcoes: [
        {
          id: "dividir_mudas",
          texto: "Separar as mudas e marcar dois canteiros.",
          efeitos: { habitantes: 2, honra: 3, gold: -1 },
          resultado:
            "As famílias levam partes iguais. Os canteiros ficam lado a lado, com uma passagem entre eles.",
        },
        {
          id: "arbitrar_mudas",
          texto: "Entregar a primeira leva a quem preparou o terreno.",
          efeitos: { honra: 2, gold: 3 },
          resultado:
            "A família que abriu o chão planta antes do meio-dia. A outra guarda as sementes restantes.",
        },
        {
          id: "vender_mudas",
          texto: "Vender as mudas a um viajante.",
          efeitos: { gold: 6, honra: -4, habitantes: -1 },
          resultado: "A carroça parte com as mudas. As duas famílias deixam a praça sem olhar para o moinho.",
        },
      ],
    },
    {
      id: "cisterna_rachada",
      titulo: "A cisterna rachada",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      forcarSorteioQuandoElegivel: true,
      requisitos: { ano: 2, estacao: "verao" },
      imagem: "assets/eventos-sistemas/verao.webp",
      imagemAlt: "Uma cisterna de pedra perde água sob o sol do verão",
      texto:
        "A cisterna perde água por uma rachadura larga. A fila cresceu desde o amanhecer, e os campos também precisam do que resta.",
      informacoes: "Reparar exige Gold; organizar o uso protege a água sem consertar a pedra.",
      opcoes: [
        {
          id: "reparar_cisterna",
          texto: "Pagar pelo reparo antes que a água acabe · 4 Gold.",
          requisitos: { goldMin: 4 },
          efeitos: { gold: -4, honra: 3, escudo: 1 },
          resultado:
            "O pedreiro sela a rachadura. A água volta a subir devagar, e a fila se desfaz antes do anoitecer.",
        },
        {
          id: "turnos_cisterna",
          texto: "Organizar turnos para casas e lavouras.",
          efeitos: { habitantes: 3, honra: 2, gold: -1 },
          resultado:
            "Cada casa recebe uma medida e cada campo, uma hora de irrigação. Ninguém disputa o balde.",
        },
        {
          id: "reservar_cisterna",
          texto: "Reservar o restante para os campos.",
          efeitos: { gold: 5, honra: -4, habitantes: -2 },
          resultado:
            "A colheita recebe a água. Duas famílias seguem para o rio antes de esperar outra distribuição.",
        },
      ],
    },
    {
      id: "celeiro_comunitario",
      titulo: "O celeiro comunitário",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      forcarSorteioQuandoElegivel: true,
      requisitos: { ano: 2, estacao: "outono" },
      imagem: "assets/eventos-sistemas/outono.webp",
      imagemAlt: "Sacos de grãos separados para o inverno dentro de um celeiro",
      texto:
        "A colheita terminou com sacos a menos. As famílias se reúnem para decidir o destino do estoque comum antes da primeira geada.",
      informacoes: "Guardar, vender ou priorizar quem perdeu o campo traz custos diferentes.",
      opcoes: [
        {
          id: "guardar_celeiro_comum",
          texto: "Reservar os sacos para o inverno.",
          efeitos: { hp: 5, habitantes: 1, honra: 3 },
          resultado: "Os sacos recebem marcas para cada casa. Ninguém leva mais do que a parte combinada.",
        },
        {
          id: "vender_celeiro_comum",
          texto: "Vender metade antes que o preço caia.",
          efeitos: { gold: 8, honra: -3 },
          resultado:
            "O comprador pesa a farinha na praça. As moedas chegam antes da chuva, mas o estoque encolhe.",
        },
        {
          id: "priorizar_plantacao",
          texto: "Entregar a maior parte às famílias que perderam o campo.",
          efeitos: { habitantes: 4, gold: -3, honra: 3 },
          resultado: "As famílias recebem grão para atravessar o mês e dividem a sobra com alguns vizinhos.",
        },
      ],
    },
    {
      id: "ponte_sob_gelo",
      titulo: "A ponte sob o gelo",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      forcarSorteioQuandoElegivel: true,
      requisitos: { ano: 2, estacao: "inverno" },
      imagem: "assets/eventos-sistemas/inverno.webp",
      imagemAlt: "Uma ponte estreita coberta por gelo sobre um rio escuro",
      texto:
        "A ponte range sob o gelo. Duas carroças esperam na margem, e o caminho alternativo acrescenta três dias à viagem.",
      informacoes: "Você pode reforçar a travessia, fechá-la ou guiar os viajantes pela trilha alta.",
      opcoes: [
        {
          id: "reforcar_ponte_gelo",
          texto: "Reforçar as tábuas · 4 Gold.",
          requisitos: { goldMin: 4 },
          efeitos: { gold: -4, habitantes: 2, honra: 2 },
          flags: { ponte_reparada: true },
          resultado:
            "O carpinteiro firma as travessas. As carroças cruzam uma por vez, e dois viajantes ficam para a próxima obra.",
        },
        {
          id: "fechar_ponte_gelo",
          texto: "Fechar a passagem até a primavera.",
          efeitos: { gold: -2, habitantes: -2, honra: -1 },
          resultado:
            "Os guardas bloqueiam a ponte. As carroças voltam pelo caminho longo antes de a noite congelar o rio.",
        },
        {
          id: "guiar_rota_gelo",
          texto: "Guiar os viajantes pela trilha alta e cobrar pela escolta.",
          efeitos: { gold: 5, honra: -2, hp: -3 },
          resultado:
            "A trilha chega ao outro lado antes do escuro. A escolta retorna cansada, com algumas moedas.",
        },
      ],
    },
    {
      id: "cercas_antigas",
      titulo: "As cercas antigas",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      forcarSorteioQuandoElegivel: true,
      requisitos: { ano: 3, estacao: "primavera" },
      imagem: "assets/eventos-sistemas/primavera.webp",
      imagemAlt: "Uma cerca de pedra antiga reaparece entre os brotos da primavera",
      texto:
        "O degelo revela cercas baixas sob as ervas. Elas dividem um pomar, um caminho antigo e um trecho de terra que ninguém cultiva.",
      informacoes: "Abra a passagem, destine o terreno à vila ou restaure a cerca do pomar.",
      opcoes: [
        {
          id: "abrir_caminho_cercas",
          texto: "Remover as pedras do caminho e deixá-lo aberto.",
          efeitos: { habitantes: 3, honra: 2, gold: -1 },
          resultado: "As carroças voltam a usar o caminho curto. As pedras viram marcos na entrada do pomar.",
        },
        {
          id: "pomar_comum",
          texto: "Destinar o terreno sem cultivo às famílias.",
          efeitos: { habitantes: 4, honra: 3, gold: -2 },
          resultado: "As famílias limpam o terreno e combinam quais árvores cuidarão.",
        },
        {
          id: "restaurar_cerca",
          texto: "Reerguer a cerca do pomar para proteger a floração.",
          efeitos: { gold: -3, escudo: 1, honra: 1 },
          resultado:
            "As pedras voltam ao lugar e os animais ficam do lado de fora. O caminho segue aberto por outra entrada.",
        },
      ],
    },
    {
      id: "estrada_dos_retirantes",
      titulo: "A estrada dos retirantes",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      forcarSorteioQuandoElegivel: true,
      requisitos: { ano: 3, estacao: "verao" },
      imagem: "assets/eventos-especiais/viajante-norte.webp",
      imagemAlt: "Viajantes cansados atravessam uma estrada seca durante o verão",
      texto:
        "Um grupo atravessa a estrada no calor e traz notícia do sul: o rio baixou tanto que os barcos já não chegam ao mercado. Pedem água para continuar.",
      informacoes: "Acolher quem passa, trocar mantimentos por trabalho ou fechar o acesso muda a viagem.",
      opcoes: [
        {
          id: "acolher_retirantes",
          texto: "Abrir a cisterna e oferecer sombra até a noite.",
          efeitos: { habitantes: 4, gold: -3, honra: 3 },
          resultado:
            "O grupo descansa à sombra. Dois viajantes decidem ficar; os demais seguem com água e uma rota segura.",
        },
        {
          id: "trabalho_retirantes",
          texto: "Trocar mantimentos por reparos na estrada.",
          efeitos: { gold: 3, habitantes: 2, honra: 1 },
          resultado: "Os viajantes firmam o trecho mais fundo da estrada antes de partir.",
        },
        {
          id: "recusar_retirantes",
          texto: "Negar passagem e guardar a água para a vila.",
          efeitos: { gold: 4, habitantes: -3, honra: -4 },
          resultado:
            "Os guardas acompanham o grupo até o vale. A notícia do rio seco segue adiante sem vocês.",
        },
      ],
    },
    {
      id: "divida_do_moinho",
      titulo: "A dívida do moinho",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      forcarSorteioQuandoElegivel: true,
      requisitos: { ano: 3, estacao: "outono" },
      imagem: "assets/eventos-sistemas/outono.webp",
      imagemAlt: "Um moleiro coloca registros antigos sobre uma mesa de madeira",
      texto:
        "O moleiro traz um caderno com promessas feitas em anos anteriores. Algumas foram pagas em sacos ou dias de trabalho; falta trocar uma roda.",
      informacoes: "Pagar, negociar um mutirão ou tomar o moinho encerra a cobrança de modos diferentes.",
      opcoes: [
        {
          id: "pagar_moinho",
          texto: "Quitar a dívida · 5 Gold.",
          requisitos: { goldMin: 5 },
          efeitos: { gold: -5, honra: 3 },
          resultado: "O caderno recebe uma linha final. O moleiro promete trocar a roda antes da geada.",
        },
        {
          id: "renegociar_moinho",
          texto: "Reunir a vila para pagar em dias de trabalho.",
          efeitos: { habitantes: -1, gold: -2, honra: 2 },
          flags: { moinho_reparado: true },
          resultado: "Os moradores trocam a roda em mutirão. O moleiro rasga a lista de horas pendentes.",
        },
        {
          id: "tomar_moinho",
          texto: "Tomar o moinho como pagamento da dívida.",
          efeitos: { gold: 6, honra: -4, habitantes: -2 },
          flags: { moinho_reparado: true },
          resultado:
            "Os guardas assumem a porta e o moleiro parte com o caderno. A farinha volta a sair, mas ninguém a chama de sua.",
        },
      ],
    },
    {
      id: "ultima_vigilia",
      titulo: "A última vigília",
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      forcarSorteioQuandoElegivel: true,
      requisitos: { ano: 3, estacao: "inverno" },
      imagem: "assets/eventos-sistemas/inverno.webp",
      imagemAlt: "Moradores se reúnem à luz de uma fogueira na última noite do inverno",
      texto:
        "O último inverno chega com o depósito de lenha pela metade. As famílias reúnem as reservas e esperam sua decisão antes de fechar as portas.",
      informacoes: "Dividir lenha, reunir recursos para uma festa ou racionar define a noite.",
      opcoes: [
        {
          id: "partilhar_lenha_final",
          texto: "Dividir a lenha entre as casas que têm menos.",
          efeitos: { hp: 8, gold: -3, honra: 3 },
          resultado:
            "Cada casa leva um feixe. O povo passa a noite perto o bastante para ouvir as histórias uns dos outros.",
        },
        {
          id: "festa_vigilia_final",
          texto: "Juntar comida e lenha para uma festa · 4 Gold.",
          requisitos: { goldMin: 4 },
          efeitos: { gold: -4, habitantes: 4, honra: 3 },
          resultado:
            "A última vigília dura até o amanhecer. As famílias limpam a praça juntas antes de voltar para casa.",
        },
        {
          id: "racionar_lenha_final",
          texto: "Racionar a lenha até o degelo.",
          efeitos: { gold: 3, hp: -6, habitantes: -2, honra: -2 },
          resultado: "Os feixes duram mais alguns dias. A vila atravessa a noite em silêncio.",
        },
      ],
    },
  );
})();
