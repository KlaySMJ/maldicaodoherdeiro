(function () {
  "use strict";
  const Jogo = window.Jogo;
  const natureza = (id, texto, efeitos = {}) => ({ id, texto, efeitos });

  Jogo.eventos.push(
    {
      id: "lei_do_machado", titulo: "A lei do machado", tipo: "encontro", peso: 3, oncePerRun: true,
      requisitos: { tracos: "druida_herdeiro", rodadaMin: 4 }, imagem: "assets/arvore-que-pede.png",
      imagemAlt: "Uma árvore antiga diante de uma clareira", texto: "Lenhadores abrem uma trilha e derrubam árvores jovens. As casas precisam de madeira, mas o bosque guarda a nascente que sustenta a vila.",
      informacoes: "A estação mede o que a floresta pode oferecer e o que ainda precisa ficar de pé.",
      opcoes: [
        { ...natureza("corte_parcial", "Permitir um corte pequeno e vigiado.", { gold: 5 }), resultado: "A madeira chega às casas. Você marca as árvores que devem continuar de pé." },
        { ...natureza("proibir_corte", "Proibir o corte e proteger o bosque.", { honra: 1, habitantes: -2 }), resultado: "Os machados param. Duas famílias partem, mas a nascente segue limpa." },
        { ...natureza("replantar", "Cobrar três Gold e replantar a clareira.", { gold: -3, honra: 2 }), requisitos: { goldMin: 3 }, resultado: "Mudas ocupam a clareira antes que a chuva venha. Os lenhadores recebem outro trabalho." },
        { ...natureza("pedir_favor", "Pedir ajuda ao espírito do bosque · 4 Gold.", { gold: -4 }), requisitos: { honraMin: 30, goldMin: 4 }, flags: { machado_decidido: true }, resultado: "A oferenda é aceita. Raízes levantam a terra e fecham a trilha dos machados." }
      ]
    },
    {
      id: "animal_ferido", titulo: "O animal ferido", tipo: "encontro", peso: 3, oncePerRun: true,
      requisitos: { tracos: "druida_herdeiro", rodadaMin: 5 }, imagem: "assets/cervo-branco.png",
      imagemAlt: "Um cervo branco entre as árvores", texto: "Um animal ferido se arrasta até a estrada. Há uma flecha recente em sua lateral e marcas de botas na lama.",
      informacoes: "A floresta observa como você trata quem não pode retribuir.",
      opcoes: [
        { ...natureza("tratar", "Tratar o ferimento com suas ervas.", { hp: -6, honra: 2 }), resultado: "Você limpa a ferida e a fecha com fibras. O animal se afasta quando consegue ficar de pé." },
        { ...natureza("sacrificar", "Abater o animal e vender a carne.", { gold: 4 }), resultado: "A caça rende moedas e alimento. As pegadas que seguem para o bosque não voltam." },
        { id: "caçar_cacador", texto: "Seguir as marcas e procurar o caçador.", testeSorte: {
          chance: 50,
          sucesso: { efeitos: { honra: 3, gold: 4 }, resultado: "Você encontra o caçador, toma seu arco e o expulsa das terras. No caminho de volta, ele deixa cair uma bolsa de moedas." },
          falha: { efeitos: { hp: -8 }, resultado: "O caçador estava esperando. Você escapa, mas uma flecha abre seu ombro." }
        }, flags: { animal_ferido_resolvido: true } }
      ]
    },
    {
      id: "vigilia_da_geada", titulo: "A vigília da geada", tipo: "encontro", peso: 3, oncePerRun: true,
      requisitos: { tracos: "druida_herdeiro", estacao: "inverno" }, imagem: "assets/ervas.png",
      imagemAlt: "Ramos secos e ervas guardadas para o frio", texto: "A geada chega antes da hora. Animais e famílias procuram abrigo, enquanto o frio se infiltra pelas paredes do salão.",
      informacoes: "O frio pode tirar mais do que conforto. Nenhuma opção muda as regras de Honra ou de culto.",
      opcoes: [
        natureza("lenha_viva", "Acender lenha viva para aquecer o salão.", { hp: 8 }),
        { ...natureza("abrigar_animais", "Abrir os estábulos para as famílias e os animais.", { honra: 2, habitantes: -2 }), resultado: "O estábulo fica cheio. Duas pessoas seguem os animais para uma aldeia mais quente." },
        { id: "dividir_calor", texto: "Dividir seu manto e passar a noite com todos.", testeSorte: {
          chance: 60,
          sucesso: { efeitos: { hp: -5, honra: 3, habitantes: 2 }, resultado: "A vigília atravessa a noite. Ao amanhecer, duas famílias decidem ficar e cuidar dos animais." },
          falha: { efeitos: { hp: -12, habitantes: -3 }, resultado: "A geada vence o fogo. Você desperta ferido, e três famílias partem antes do amanhecer." }
        } }
      ]
    },
    {
      id: "festival_da_seiva", titulo: "O festival da seiva", tipo: "encontro", peso: 3, oncePerYear: true,
      requisitos: { tracos: "druida_herdeiro", estacao: "primavera" }, imagem: "assets/arvore-que-pede.png",
      imagemAlt: "Uma árvore antiga coberta de brotos novos", texto: "A seiva volta a correr. A vila pede um festival para celebrar o degelo e preparar o plantio.",
      informacoes: "A festa pode unir a comunidade ou transformar a estação em lucro imediato.",
      opcoes: [
        natureza("dancar", "Dançar com as famílias até o amanhecer.", { hp: 10, habitantes: 3, honra: 2 }),
        { ...natureza("mudas", "Comprar mudas e distribuí-las · 2 Gold.", { gold: -2, honra: 3 }), requisitos: { goldMin: 2 }, resultado: "Cada família leva uma muda. O plantio começa antes do fim do festival." },
        natureza("cobrar", "Cobrar entrada e vender a colheita.", { gold: 6, honra: -2 })
      ]
    },
    {
      id: "incendio_no_bosque", titulo: "Incêndio no bosque", tipo: "batalha", peso: 2, oncePerRun: true, letal: true,
      requisitos: { tracos: "druida_herdeiro", estacao: "verao", rodadaMin: 6 }, imagem: "assets/vila.png",
      imagemAlt: "Fumaça sobe atrás da muralha da vila", texto: "O fogo salta de uma clareira para outra. As chamas cercam as casas mais próximas do bosque e o vento as empurra para a vila.",
      informacoes: "Um companheiro pode ajudar a encontrar uma trilha segura entre as chamas.",
      opcoes: [
        { id: "contrafogo", texto: "Abrir uma faixa de contrafogo.", testeSorte: {
          chance: 55,
          sucesso: { efeitos: { hp: -6, honra: 2 }, resultado: "A faixa segura. O fogo perde força antes de alcançar as casas." },
          falha: { efeitos: { hp: -25, habitantes: -4 }, resultado: "Uma rajada atravessa a faixa. Você volta ferido; quatro moradores perdem suas casas." }
        } },
        natureza("evacuar", "Retirar as famílias e deixar o bosque queimar.", { habitantes: -3 }),
        { id: "animal_incendio", texto: "Entrar no fogo com seu animal.", testeSorte: {
          chance: 55,
          sucesso: { efeitos: { hp: -10, honra: 4, habitantes: 3 }, resultado: "O animal encontra uma passagem entre as chamas. Você guia três famílias para fora e salva parte do bosque." },
          falha: { efeitos: { hp: -30 }, resultado: "A fumaça separa vocês. Seu animal retorna sozinho; você é encontrado mais tarde, com queimaduras graves." }
        } }
      ]
    },
    {
      id: "dizimo_da_floresta", titulo: "O dízimo da floresta", tipo: "encontro", peso: 3, oncePerRun: true,
      requisitos: { tracos: "druida_herdeiro", estacao: "outono" }, imagem: "assets/ervas.png",
      imagemAlt: "Folhas e frutos recolhidos no outono", texto: "A colheita foi farta. Antes que os celeiros fechem, uma voz sai das árvores e pede sua parte.",
      informacoes: "O espírito promete um presente raro se a oferenda for suficiente.",
      opcoes: [
        { id: "oferecer_colheita", texto: "Oferecer três Gold e quatro Habitantes.", requisitos: { goldMin: 3, habitantesMin: 4 }, efeitos: { gold: -3, habitantes: -4, honra: 2 }, testeSorte: {
          chance: 30,
          sucesso: { itens: ["manto_de_folhas"], resultado: "A floresta aceita a colheita e devolve um manto de folhas que não seca." },
          falha: { resultado: "A oferenda é aceita. O espírito não oferece nada em troca." }
        }, resultado: "Você deixa a oferenda entre as raízes." },
        natureza("guardar_colheita", "Guardar a colheita para a vila.", { gold: 6 }),
        natureza("oferecer_sangue", "Oferecer seu sangue e ouvir o bosque.", { hp: -8, honra: 2 })
      ]
    },
    {
      id: "espirito_da_floresta", titulo: "O espírito da floresta", tipo: "batalha", peso: 1, oncePerRun: true,
      requisitos: { tracos: "druida_herdeiro", rodadaMin: 24 }, imagem: "assets/arvore-que-pede.png",
      imagemAlt: "Uma árvore antiga, guardiã de uma clareira", texto: "O espírito da floresta ergue-se diante de você. Seus galhos formam uma coroa e as raízes fecham a trilha atrás de seus passos.",
      informacoes: "A floresta observa sua Honra. Você pode receber sua bênção, enfrentá-la ou aceitar uma punição.",
      batalha: {
        semAjuste: true, defesa: 6,
        vitoria: { dano: 18, efeitos: { honra: 3 }, itens: ["semente_bosque_sagrado"], resultado: "Você resiste às raízes e vence a prova. Uma semente do bosque sagrado cai aos seus pés." },
        derrota: { dano: 26, efeitos: { }, resultado: "As raízes o derrubam. O espírito o poupa, mas a prova foi perdida." }
      },
      opcoes: [
        { id: "bencao", texto: "Aceitar a bênção do espírito.", requisitos: { honraMin: 30 }, efeitos: { honra: 6 }, itens: ["mascara_de_cervo"], desbloqueia: { flags: ["cervo_honrado"] }, resultado: "O espírito deposita a Máscara do Cervo em suas mãos. A Honra preserva a lembrança desse encontro." },
        { id: "desafio", texto: "Pedir uma prova de força.", requisitos: { honraMin: -29, honraMax: 29 }, combate: true },
        { ...natureza("aceitar_punicao", "Aceitar a punição da floresta.", { hp: -25, habitantes: -5 }), requisitos: { honraMax: -30 }, resultado: "O espírito cobra sangue e cinco pessoas deixam a vila antes do amanhecer." },
        natureza("fugir", "Fugir pela trilha antes que se feche.", { hp: -10, habitantes: -3 })
      ]
    }
  );
})();
