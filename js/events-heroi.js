(function () {
  "use strict";
  const Jogo = window.Jogo;
  const escolha = (id, texto, efeitos = {}) => Jogo.criarOpcao({ id, texto, efeitos });

  // Linha da Heroína do povo. Como a honra dela nunca cai, os custos aqui são
  // ouro, Vida, Escudo e habitantes — nunca honra negativa, que seria um custo vazio.
  Jogo.registrarEventos(
    {
      id: "a_voz_na_praca",
      titulo: "A voz na praça",
      tipo: "encontro",
      peso: 4,
      oncePerRun: true,
      requisitos: { tracos: "heroi_do_povo", rodadaMin: 3 },
      imagem: "assets/vila.webp",
      imagemAlt: "A praça da vila ao amanhecer",
      texto: "O povo fala baixo quando você passa, mas não por medo.",
      informacoes:
        "Reclamações, pedidos e nomes de quem precisa de justiça chegam antes do pão sair do forno. Atender custa sono e moedas; não atender custa a confiança que você ainda está ganhando.",
      opcoes: [
        {
          ...escolha("ouvir_todos", "Ouvir cada reclamação até o fim.", { honra: 2, hp: -3 }),
          resultado: "Você perde o sono, mas sai da praça sabendo o nome de cada família que ficou.",
        },
        {
          ...escolha("cobrar_cobrador", "Cobrar o cobrador da vila diante de todos.", { honra: 3, gold: -3 }),
          requisitos: { goldMin: 3 },
          resultado: "As moedas voltam para quem pagou a mais. O cobrador não volta mais à praça.",
        },
        {
          ...escolha("subir_para_descansar", "Subir para casa e descansar.", { hp: 4 }),
          resultado: "Você dorme até o sol alto. Lá embaixo, a fila na praça continua crescendo.",
        },
      ],
    },
    {
      id: "pao_do_celeiro",
      titulo: "O pão do celeiro",
      tipo: "desordem",
      peso: 4,
      oncePerRun: true,
      requisitos: { tracos: "heroi_do_povo", rodadaMin: 8 },
      imagem: "assets/eventos-letais/pao.webp",
      imagemAlt: "Um pão rústico sobre uma mesa de madeira",
      texto: "O inverno chegou antes da colheita.",
      informacoes:
        "No celeiro há grão para uma semana a mais — ou para duas famílias a menos. O que se divide hoje é o que se guarda amanhã.",
      opcoes: [
        {
          ...escolha("abrir_celeiro", "Abrir o celeiro para as famílias.", { gold: -5, honra: 3 }),
          resultado: "O grão sai em sacos marcados. Nenhuma porta da vila fica fechada à noite.",
        },
        {
          ...escolha("vender_excedente", "Vender o excedente a quem pode pagar.", {
            gold: 6,
            habitantes: -2,
          }),
          resultado: "Carros saem carregados ao entardecer. Duas casas deixam a chave na porta.",
        },
        {
          ...escolha("cozer_para_a_praca", "Cozer tudo o que sobra e levar à praça.", { hp: -4, honra: 2 }),
          resultado: "A massa dura até o amanhecer. Quem come, lembra.",
        },
      ],
    },
    {
      id: "guarda_da_estrada",
      titulo: "A guarda da estrada",
      tipo: "batalha",
      peso: 3,
      oncePerRun: true,
      requisitos: { tracos: "heroi_do_povo", rodadaMin: 12 },
      imagem: "assets/batalha.webp",
      imagemAlt: "Confronto na estrada que leva à vila",
      texto: "Um bando de desertores montou posto na estrada da ponte.",
      informacoes:
        "Cobram passagem de quem leva grão — e de quem não leva nada. Seu Ataque resolve a briga; o ouro resolve em silêncio.",
      batalha: {
        defesa: 4,
        vitoria: {
          dano: 6,
          efeitos: { honra: 3, gold: 3 },
          resultado: "O bando se desfaz na primeira investida. Os bolsos deixados na estrada pagam a ponte.",
        },
        derrota: {
          dano: 14,
          efeitos: { honra: 1 },
          resultado: "Você recua sangrando, mas o povo viu você enfrentar os desertores sozinha.",
        },
        penalidadeFalha: {
          efeitos: { habitantes: -2 },
          texto: "Dois carros de mudança passam enquanto você se levanta — e não voltam.",
        },
      },
      opcoes: [
        { id: "enfrentar", texto: "Enfrentar o bando na estrada.", combate: true },
        {
          ...escolha("pagar_passagem", "Pagar a passagem e seguir.", { gold: -4 }),
          resultado:
            "Você entrega as moedas sem discutir. Os desertores anotam o seu nome — e deixam passar.",
        },
        {
          ...escolha("desviar_mata", "Desviar pela mata e chegar a pé.", { hp: -5 }),
          resultado: "Espinhos rasgam o manto e o saco pesa mais na chegada, mas a vila não perde nada.",
        },
      ],
    },
    {
      id: "a_noite_dos_lampioes",
      titulo: "A noite dos lampiões",
      tipo: "encontro",
      peso: 3,
      oncePerRun: true,
      requisitos: { tracos: "heroi_do_povo", rodadaMin: 20, honraMin: 30 },
      imagem: "assets/eventos-especificos/festival-dos-mortos.webp",
      imagemAlt: "Lampiões acesos diante das casas da vila",
      texto:
        "Acendem lampiões em cada janela e levam até a sua porta uma refeição farta, temperada com ervas.",
      informacoes:
        "É o jeito da vila de dizer que reconhece quem cuidou dela. Receber bem aproxima quem ainda hesita em bater à sua porta.",
      opcoes: [
        {
          ...escolha("convidar_todos", "Convidar a praça inteira para dentro de casa.", {
            gold: -6,
            honra: 3,
            habitantes: 1,
          }),
          resultado: "A casa não fecha mais. Duas famílias de fora pedem para ficar perto da luz.",
        },
        {
          ...escolha("agradecer_um_por_um", "Agradecer em particular a cada um.", { honra: 2, hp: -3 }),
          resultado: "Você cumprimenta até a última pessoa e dorme de pé. Ninguém fica sem resposta.",
        },
        {
          ...escolha("guardar_o_farto", "Aceitar o jantar e subir para descansar.", { hp: 5 }),
          resultado:
            "Você come, dorme e acorda com os ombros descansados. Lá embaixo, os lampiões continuam acesos.",
        },
      ],
    },
    {
      // Único caminho do culto para quem tem honra imune: chance baixa (peso 1),
      // só a partir da rodada 50 e com honra alta reconhecida pelo povo.
      id: "o_chamado_na_capela",
      titulo: "O chamado na capela",
      tipo: "culto",
      peso: 1,
      oncePerRun: true,
      requisitos: { tracos: "heroi_do_povo", rodadaMin: 50, honraMin: 30, cultoAtivo: false },
      imagem: "assets/eventos-culto/templo.webp",
      imagemAlt: "Uma capela de pedra com uma chama acesa no altar",
      texto: "Vêm à sua casa cobertos por mantos de lã crua.",
      informacoes:
        "Não pedem honra baixa nem promessas baratas: querem justamente aquela que o povo ama. Recusar custa pouco. Aceitar muda o resto da crônica.",
      opcoes: [
        {
          id: "entrar_na_capela",
          texto: "Seguir a chama até a capela.",
          entrarNoCulto: true,
          resultado:
            "Você senta no primeiro degrau. Cinquenta pessoas se ajoelham ao mesmo tempo e a chama cresce. A Adaga cerimonial é guardada no inventário.",
        },
        {
          ...escolha("recusar_cortes", "Recusar sem ferir nenhum orgulho.", { honra: 2 }),
          resultado:
            "Você devolve o convite com as duas mãos. Os visitantes somem na neblina e não voltam a bater.",
        },
        {
          id: "seguir_de_longe",
          texto: "Acompanhar de longe até ver onde param.",
          testeSorte: {
            chance: 50,
            sucesso: {
              efeitos: { honra: 2, gold: 4 },
              resultado: "Você segue até o rio e volta com um saco de moedas que ninguém reclamou.",
            },
            falha: {
              efeitos: { hp: -10 },
              resultado:
                "Eles sabiam. Uma lanterna se acende atrás de você e a noite fica um pouco mais curta.",
            },
          },
        },
      ],
    },
    {
      id: "os_caidos_da_vila",
      titulo: "Os caídos da vila",
      tipo: "encontro",
      peso: 3,
      oncePerRun: true,
      requisitos: { tracos: "heroi_do_povo", rodadaMin: 70 },
      imagem: "assets/eventos-sistemas/tumulo.webp",
      imagemAlt: "Um túmulo simples com flores secas",
      texto: "A vila quer uma placa na ponte; a pedreira cobra por cada letra gravada.",
      informacoes: "Chegam as datas dos caídos. A honra lembra do que o ouro prefere esquecer.",
      opcoes: [
        {
          ...escolha("pagar_placa", "Pagar a placa e o pedreiro.", { gold: -8, honra: 4 }),
          resultado: "O nome de cada um fica legível até a próxima enchente.",
        },
        {
          ...escolha("gravar_mao", "Gravar os nomes com a própria mão.", { honra: 2, hp: -4 }),
          resultado: "Seus dedos sangram na pedra, mas ninguém precisa ler duas vezes.",
        },
        {
          ...escolha("reforcar_muro", "Usar o pedreiro para reforçar o muro.", { escudo: 3 }),
          resultado: "A placa fica em branco por enquanto. O muro, não.",
        },
      ],
    },
  );
})();
