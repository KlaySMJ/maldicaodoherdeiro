(function () {
  "use strict";
  const Jogo = window.Jogo;
  const marca = (id) => ({ [id]: true });
  const risco = (chance, sucesso, falha) => ({ chance, sucesso, falha });
  const op = (id, texto, efeitos, resultado, extra = {}) =>
    Jogo.criarOpcao({ id, texto, efeitos, resultado, ...extra });
  const evento = (configuracao) => {
    const { id, titulo, rodadaMin, peso, imagem, texto, informacoes, opcoes, requisitos = {} } = configuracao;
    return Jogo.criarEvento({
      id,
      titulo,
      tipo: "letal",
      letal: true,
      peso,
      requisitos: { rodadaMin, ...requisitos },
      imagem: `assets/eventos-letais/${imagem}.webp`,
      imagemAlt: `${titulo}, gravura em alto contraste sobre preto`,
      texto,
      informacoes,
      opcoes,
    });
  };
  Jogo.registrarEventos(
    evento({
      id: "travessia_do_gelo",
      titulo: "A travessia do gelo",
      rodadaMin: 6,
      peso: 1.5,
      imagem: "gelo",
      texto: "O lago congelou durante a noite e uma caravana ficou presa na outra margem.",
      informacoes: "Crianças gritam por ajuda, e o gelo range a cada passo. O gelo parece firme. Parece.",
      opcoes: [
        op("atravessar", "Atravessar com uma corda amarrada à cintura.", {}, "", {
          testeSorte: risco(
            60,
            {
              efeitos: { habitantes: 8, honra: 3 },
              resultado:
                "A corda segura. Você leva todos para a margem, um a um. Oito pessoas pedem para ficar.",
            },
            {
              efeitos: { hp: -30, habitantes: -2 },
              resultado: "O gelo cede. A corda o salva, mas dois viajantes não resistem à água.",
            },
          ),
          flags: marca("travessia_decidida"),
        }),
        op(
          "voluntario",
          "Mandar um voluntário.",
          { habitantes: 2, honra: -2 },
          "Um rapaz se oferece. Quatro viajantes chegam à margem; duas pessoas da vila que o seguiram se perdem.",
          { flags: marca("travessia_decidida") },
        ),
        op(
          "esperar",
          "Esperar que o gelo seja testado com um boi.",
          { habitantes: -5, honra: -1 },
          "O boi atravessa, mas cinco viajantes não resistem ao frio da noite.",
          { flags: marca("travessia_decidida") },
        ),
        op("fila", "Atravessar deitados sobre tábuas, com seus homens segurando a corda.", {}, "", {
          requisitos: { honraMin: 50 },
          testeSorte: risco(
            80,
            {
              efeitos: { habitantes: 8, honra: 4 },
              resultado: "O peso se espalha e o gelo aguenta. A caravana atravessa sob suas ordens.",
            },
            {
              efeitos: { hp: -15 },
              resultado: "Uma tábua cede. As cordas seguram, mas você chega encharcado e ferido.",
            },
          ),
          flags: marca("travessia_decidida"),
        }),
      ],
      requisitos: { flagsAusentes: ["travessia_decidida"] },
    }),
    evento({
      id: "casa_em_chamas",
      titulo: "A casa em chamas",
      rodadaMin: 6,
      peso: 1.5,
      imagem: "fogo",
      texto: "Uma família está presa no sótão de uma casa em chamas.",
      informacoes:
        "O telhado já cede de um lado, e os vizinhos gritam instruções contraditórias. Cada segundo pesa. Cada decisão, também.",
      opcoes: [
        op("entrar", "Entrar pela janela do sótão.", {}, "", {
          testeSorte: risco(
            55,
            {
              efeitos: { habitantes: 3, honra: 4, hp: -8 },
              resultado: "Você tira os três pelo telhado, com as roupas fumegando. A vila chora e aplaude.",
            },
            {
              efeitos: { hp: -35 },
              resultado:
                "O telhado cede sob seus pés. Os guardas chegam a tempo de ver a chama tomar a escada — e a família com ela.",
              encerramento: {
                tipo: "derrota",
                motivo:
                  "Você entrou pela janela do sótão em chamas. O telhado não esperou pelos guardas, nem pela família.",
              },
            },
          ),
        }),
        op(
          "parede",
          "Derrubar a parede com os guardas.",
          { habitantes: 1, hp: -14 },
          "A parede cede com uma pedra no seu ombro. Duas pessoas saem; a terceira, tarde demais.",
        ),
        op(
          "isolar",
          "Isolar o fogo e deixar a casa queimar.",
          { habitantes: -3, honra: -2 },
          "O fogo não passa às casas vizinhas. Os gritos do sótão se calam, e a vila não olha para você por dias.",
        ),
      ],
    }),
    evento({
      id: "taca_do_convidado",
      titulo: "A taça do convidado",
      rodadaMin: 7,
      peso: 1.5,
      imagem: "taca",
      texto: "Um nobre ergue uma taça e propõe um brinde à paz.",
      informacoes:
        "Um servo, ao seu lado, mexe os lábios sem som: ‘não beba’. O nobre sorri demais. O servo suou demais.",
      opcoes: [
        op("beber", "Beber primeiro, para mostrar confiança.", {}, "", {
          testeSorte: risco(
            50,
            {
              efeitos: { honra: 4, gold: 6 },
              resultado: "O vinho é só vinho. O nobre, impressionado, deixa um presente.",
            },
            {
              efeitos: { hp: -30 },
              resultado:
                "Seu corpo arde por dentro. O nobre foge entre os criados enquanto você cai de joelhos — e não se levanta.",
              encerramento: {
                tipo: "derrota",
                motivo:
                  "O brinde do nobre era veneno. Você caiu diante da mesa inteira antes que o servo pudesse avisar de novo.",
              },
            },
          ),
          flags: marca("taca_decidida"),
        }),
        op(
          "servo",
          "Mandar um servo provar.",
          { honra: -4 },
          "O servo que tentou avisá-lo prova e fica de pé. O nobre sorri; você nunca sabe se era veneno.",
          { flags: marca("taca_decidida") },
        ),
        op(
          "derrubar",
          "Derrubar a taça ‘sem querer’.",
          { honra: -3 },
          "O vinho mancha o tapete. O nobre fecha o rosto, e o servo desaparece naquela noite.",
          { flags: { taca_decidida: true, vizinho_ofendido: true } },
        ),
        op(
          "pedir",
          "Pedir ao nobre que beba primeiro.",
          { gold: 4, honra: -2 },
          "O nobre hesita, bebe pálido e parte no mesmo dia, deixando moedas e ressentimento.",
          { requisitos: { honraMax: -30 }, flags: { taca_decidida: true, vizinho_ofendido: true } },
        ),
      ],
      requisitos: { flagsAusentes: ["taca_decidida"] },
    }),
    evento({
      id: "cavalo_desembestado",
      titulo: "O cavalo desembestado",
      rodadaMin: 6,
      peso: 1.5,
      imagem: "cavalo",
      texto: "Um cavalo de carga rompe o cabresto e dispara pela praça.",
      informacoes:
        "Três crianças brincam no meio do caminho sem perceber. O cavalo pesa mais que três homens. Há poucos segundos.",
      opcoes: [
        op(
          "atirar",
          "Atirar-se contra o cavalo.",
          { honra: 3, hp: -22 },
          "O impacto o joga contra uma parede. As crianças ficam ilesas; você acorda cercado de rostos em lágrimas.",
        ),
        op("gritar", "Gritar para dispersar as crianças.", {}, "", {
          testeSorte: risco(
            60,
            {
              efeitos: { honra: 1 },
              resultado:
                "As crianças correm para os lados no último instante. O cavalo passa, e a vila respira.",
            },
            {
              efeitos: { habitantes: -1, honra: -4 },
              resultado: "Uma criança demora a se mexer. O silêncio dura mais que o relinchar.",
            },
          ),
        }),
        op(
          "abater",
          "Mandar os guardas abaterem o animal.",
          { gold: -5, honra: -1 },
          "A lança acerta a poucos passos das crianças. O dono pede indenização aos prantos.",
        ),
      ],
    }),
    evento({
      id: "fera_no_celeiro",
      titulo: "A fera no celeiro",
      rodadaMin: 7,
      peso: 1.5,
      imagem: "fera",
      texto: "Algo respira alto no escuro do celeiro.",
      informacoes:
        "A porta tem marcas de garras, os cães não se aproximam e os grãos estão lá dentro. Ninguém viu o que entrou. Todos têm uma teoria.",
      opcoes: [
        op("entrar", "Entrar sozinho com uma tocha.", {}, "", {
          testeSorte: risco(
            55,
            {
              efeitos: { gold: 6, honra: 3 },
              resultado: "Era um lobo ferido. Você o espanta, e o celeiro volta ao uso.",
            },
            {
              efeitos: { hp: -28 },
              resultado:
                "A coisa era maior do que parecia. A tocha cai no grão seco e o escuro fecha atrás de você.",
              encerramento: {
                tipo: "derrota",
                motivo: "Você entrou sozinho com uma tocha. O celeiro ficou quieto depois que a luz apagou.",
              },
            },
          ),
        }),
        op(
          "guardas",
          "Mandar os guardas à frente.",
          { gold: 2, habitantes: -3, honra: -2 },
          "Três guardas não voltam. Os demais expulsam a coisa com lanças e fogo.",
        ),
        op(
          "queimar",
          "Queimar o celeiro.",
          { gold: -8, habitantes: -2 },
          "O fogo ilumina a noite, e algo grita lá dentro. O estoque se perde; dois moradores partem.",
        ),
      ],
    }),
    evento({
      id: "rio_cor_estranha",
      titulo: "O rio que mudou de cor",
      rodadaMin: 8,
      peso: 1.5,
      imagem: "rio",
      texto: "A água do rio ficou cor de ferrugem durante a noite.",
      informacoes:
        "Os peixes boiam, mas alguns moradores juram que o gosto é apenas diferente. A vila inteira bebe dele. Metade já bebeu.",
      opcoes: [
        op("beber", "Beber da água diante de todos.", {}, "", {
          testeSorte: risco(
            50,
            {
              efeitos: { honra: 5, habitantes: 3 },
              resultado: "Era lama de uma enchente a montante. Três famílias que fugiam voltam.",
            },
            {
              efeitos: { hp: -25, habitantes: -4 },
              resultado:
                "A febre chega antes do pôr do sol. Quatro moradores que beberam com você não resistem.",
            },
          ),
          flags: marca("rio_decidido"),
        }),
        op(
          "buscar",
          "Buscar água em outro rio, a dois dias de caminhada.",
          { honra: 2, hp: -6, habitantes: -2 },
          "A água limpa chega em barris. Dois moradores doentes não esperam por ela.",
          { flags: marca("rio_decidido") },
        ),
        op(
          "proibir",
          "Proibir o uso do rio.",
          { habitantes: -3, honra: -2 },
          "A sede vence a obediência. Três famílias partem em busca de outra água.",
          { flags: marca("rio_decidido") },
        ),
      ],
      requisitos: { flagsAusentes: ["rio_decidido"] },
    }),
    evento({
      id: "convite_do_vizinho",
      titulo: "O convite do vizinho",
      rodadaMin: 8,
      peso: 1.5,
      imagem: "banquete",
      texto: "O senhor da aldeia vizinha o convida para um banquete.",
      informacoes:
        "Rumores dizem que ele é amigo. Outros, que não tem amigos. Recusar seria uma ofensa. Aceitar pode ser uma armadilha.",
      opcoes: [
        op("sozinho", "Ir sozinho, como gesto de confiança.", {}, "", {
          testeSorte: risco(
            60,
            {
              efeitos: { gold: 10, honra: 3 },
              resultado:
                "A mesa é farta, e o vizinho é sincero. Você volta com presentes e uma proposta de aliança.",
            },
            {
              efeitos: { hp: -30 },
              resultado: "Homens armados esperavam atrás das tapeçarias. Você escapa pela janela, ferido.",
            },
          ),
          flags: marca("convite_decidido"),
        }),
        op(
          "escolta",
          "Ir com uma escolta de guardas.",
          { gold: 4, hp: -6, honra: -1 },
          "O banquete termina num empurrão no corredor. Você volta com moedas e um olho roxo.",
          { flags: marca("convite_decidido") },
        ),
        op(
          "recusar",
          "Recusar o convite.",
          { honra: -3 },
          "O mensageiro anota a resposta em silêncio. A vila não sabe se ganhou paz ou uma guerra.",
          { flags: { convite_decidido: true, vizinho_ofendido: true } },
        ),
      ],
      requisitos: { flagsAusentes: ["convite_decidido"] },
    }),
    evento({
      id: "desfiladeiro",
      titulo: "O desfiladeiro",
      rodadaMin: 9,
      peso: 1.5,
      imagem: "desfiladeiro",
      texto: "Os suprimentos do inverno precisam atravessar a serra.",
      informacoes:
        "Há uma trilha curta, estreita e conhecida por emboscadas, e outra longa sob a neve. O tempo conta. A neve também.",
      opcoes: [
        op("curta", "Pegar a trilha curta.", {}, "", {
          testeSorte: risco(
            55,
            {
              efeitos: { gold: 8, honra: 2 },
              resultado: "Os suprimentos chegam a tempo. Os mercadores pagam mais pela pressa.",
            },
            {
              efeitos: { hp: -28, gold: -4 },
              resultado: "Flechas vêm das rochas. Você escapa com a carga rasgada e uma flecha no ombro.",
            },
          ),
        }),
        op(
          "longa",
          "Pegar a trilha longa.",
          { hp: -8, gold: -2 },
          "A neve chega aos joelhos, e uma mula cai no abismo. O resto chega inteiro.",
        ),
        op("guia", "Contratar um guia local · 4 gold.", {}, "", {
          requisitos: { goldMin: 4 },
          testeSorte: risco(
            80,
            {
              efeitos: { gold: 2 },
              resultado:
                "O guia conhece cada pedra. A carga chega inteira e os mercadores pagam a diferença.",
            },
            {
              efeitos: { gold: -8, hp: -30 },
              resultado: "O guia entrega a caravana aos bandidos. Você acorda sem a carga e ferido.",
            },
          ),
        }),
      ],
    }),
    evento({
      id: "escolha_do_pao",
      titulo: "A escolha do pão",
      rodadaMin: 8,
      peso: 1.5,
      imagem: "pao",
      texto: "A colheita falhou e restam sacos de grão para apenas metade da vila.",
      informacoes:
        "O padre, o ferreiro e a ervateira esperam sua decisão. Alguns vão sobreviver ao inverno. Outros, não.",
      opcoes: [
        op(
          "sortear",
          "Sortear quem come.",
          { habitantes: -5 },
          "Pedaços de papel numa tigela, e uma tensão que ninguém suporta. Cinco famílias não sobrevivem ao inverno.",
        ),
        op(
          "dar",
          "Dar tudo às crianças e aos velhos.",
          { honra: 4, habitantes: -4, hp: -10 },
          "Os que trabalham passam fome, e você jejua com eles. Quatro adultos não resistem.",
        ),
        op(
          "guarda",
          "Dar tudo à guarda e aos trabalhadores.",
          { escudo: 1, habitantes: -6, honra: -5 },
          "Os fortes sobrevivem, e os fracos não. A vila fica menor e mais dura.",
        ),
        op(
          "ajuda",
          "Pedir ajuda à aldeia vizinha.",
          { honra: 2, habitantes: -2, gold: -3 },
          "O vizinho manda pão em troca de moedas. Duas pessoas não aguentam a espera.",
          { requisitos: { honraMin: 30, flagsAusentes: ["vizinho_ofendido"] } },
        ),
      ],
      requisitos: { populacaoMinimo: 20 },
    }),
    evento({
      id: "cirurgiao_barbeiro",
      titulo: "O cirurgião-barbeiro",
      rodadaMin: 6,
      peso: 2,
      imagem: "barbeiro",
      texto: "Um homem de avental manchado e sorriso exagerado se oferece para tratar seus ferimentos.",
      informacoes:
        "Seus instrumentos brilham como prata de talher. Ele promete cura. Os moradores trocam olhares.",
      opcoes: [
        op("sangria", "Aceitar a sangria.", {}, "", {
          requisitos: { hpMax: 50 },
          testeSorte: risco(
            50,
            { efeitos: { hp: 22 }, resultado: "A febre cede. Você dorme um dia inteiro e acorda com fome." },
            {
              efeitos: { hp: -15 },
              resultado: "O barbeiro erra a veia, e a sala gira. A cor não volta ao rosto.",
            },
          ),
        }),
        op("cauterizar", "Pedir que cauterize as feridas.", {}, "", {
          requisitos: { hpMax: 50 },
          testeSorte: risco(
            60,
            {
              efeitos: { hp: 30 },
              resultado: "O ferro quente arde. Depois, a dor some e os ferimentos secam.",
            },
            {
              efeitos: { hp: -25 },
              resultado: "O ferro estava quente demais, e a carne também. Você grita até o grito falhar.",
            },
          ),
        }),
        op(
          "descansar",
          "Dispensar o barbeiro e descansar.",
          { hp: 8, gold: -1 },
          "Dois dias de cama e caldo resolvem pouco, mas resolvem.",
          { requisitos: { hpMax: 50 } },
        ),
      ],
    }),
    evento({
      id: "dados_do_velho",
      titulo: "O jogo de dados do velho cego",
      rodadaMin: 7,
      peso: 1,
      imagem: "dados",
      texto: "Um velho de olhos leitosos senta na praça com um dado de osso.",
      informacoes:
        "Ele ouve as moedas na bolsa de cada passante e convida você a jogar. Ele não vê, mas nunca perde. Quem aposta, paga.",
      opcoes: [
        op("ouro", "Apostar 5 gold.", {}, "", {
          requisitos: { goldMin: 5 },
          dueloDados: {
            sucesso: {
              efeitos: { gold: 5 },
              flags: { dados_revanche_disponivel: true },
              resultado: "Seu dado supera o do velho. Ele paga dez moedas e pede revanche.",
            },
            falha: {
              efeitos: { gold: -5 },
              resultado: "O dado do velho vence. Ele recolhe as moedas sem tocá-las.",
            },
          },
          flags: marca("dados_decididos"),
        }),
        op("sangue", "Apostar o sangue.", {}, "", {
          testeSorte: risco(
            45,
            {
              efeitos: { ataque: 2, honra: 2 },
              resultado: "Algo em seu braço esquenta. O velho murmura que vai se lembrar de você.",
            },
            {
              efeitos: { hp: -32 },
              resultado: "Um corte aparece na sua coxa, fundo e limpo. O velho sorri em silêncio.",
              encerramento: {
                tipo: "derrota",
                motivo:
                  "Você apostou o sangue, e o velho cobrou a dívida inteira. A praça viu o silêncio dele.",
              },
            },
          ),
          flags: marca("dados_decididos"),
        }),
        op(
          "quebrar",
          "Quebrar os dados.",
          { honra: -2, hp: -2 },
          "Os dados racham com um som seco. O velho gira o rosto na sua direção, e a vila inteira sente.",
          { flags: marca("dados_decididos") },
        ),
      ],
      requisitos: { flagsAusentes: ["dados_decididos"] },
    }),
    Object.assign(
      evento({
        id: "revanche_dados",
        titulo: "A revanche do velho cego",
        rodadaMin: 7,
        peso: 1,
        imagem: "dados",
        texto: "O velho está na praça outra vez, o dado de osso entre vocês.",
        informacoes:
          "Ele reconhece o som das moedas na sua bolsa e empurra os dados para perto. Desta vez, a aposta é de 10 gold. Você pode deixar a mesa sem jogar.",
        opcoes: [
          op("apostar_dez", "Apostar 10 gold.", {}, "", {
            requisitos: { goldMin: 10 },
            dueloDados: {
              bonusOponente: 1,
              sucesso: {
                efeitos: { gold: 10 },
                flags: { dados_revanche_disponivel: false, dados_revanche_concluida: true },
                resultado: "Seu dado supera até o bônus do velho. Ele paga vinte moedas e recolhe o osso.",
              },
              falha: {
                efeitos: { gold: -10 },
                flags: { dados_revanche_disponivel: false, dados_revanche_concluida: true },
                resultado: "O dado do velho vence. Ele recolhe as dez moedas e guarda o osso.",
              },
            },
          }),
          op(
            "deixar_mesa",
            "Afastar os dados e seguir viagem.",
            {},
            "O velho guarda os dados no bolso. Não pede uma terceira partida.",
            { flags: { dados_revanche_disponivel: false, dados_revanche_concluida: true } },
          ),
        ],
        requisitos: { flags: ["dados_revanche_disponivel"], flagsAusentes: ["dados_revanche_concluida"] },
      }),
      { forcarSorteioQuandoElegivel: true },
    ),
    evento({
      id: "coluna_de_fumaca",
      titulo: "A coluna de fumaça",
      rodadaMin: 10,
      peso: 1.5,
      imagem: "fumaca",
      texto: "Uma coluna de fumaça sobe do vale ao norte, onde ficam as plantações de duas famílias.",
      informacoes:
        "Um mensageiro diz que é um ataque, mas não sabe de quem. Pode ser saque. Pode ser incêndio. Pode ser isca.",
      opcoes: [
        op("cavalgar", "Cavalgar até lá, com poucos homens.", {}, "", {
          testeSorte: risco(
            50,
            {
              efeitos: { hp: -6, habitantes: 4, honra: 3 },
              resultado:
                "Era um incêndio, e as famílias já combatiam as chamas. Você ajuda e traz quatro refugiados.",
            },
            {
              efeitos: { hp: -28, habitantes: -3 },
              resultado:
                "Era isca. Bandidos o esperavam no vale. Você volta ferido e sem três dos seus homens.",
            },
          ),
        }),
        op(
          "batedor",
          "Mandar um batedor primeiro.",
          { habitantes: -2, honra: -1 },
          "O batedor chega tarde para as plantações. Duas famílias que esperavam socorro se mudam.",
        ),
        op(
          "esperar",
          "Fechar os portões e esperar.",
          { habitantes: -4, honra: -3 },
          "Os portões fecham, e a fumaça sobe até a tarde. Quatro famílias de fora nunca voltam.",
        ),
      ],
    }),
  );
})();
