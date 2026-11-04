(function () {
  "use strict";
  const Jogo = window.Jogo;
  const make = (id, title, type, weight, min, image, text, info, options, extra = {}) => {
    const { requisitos: requisitosExtra, ...propriedades } = extra;
    return {
      id, titulo: title, tipo: type, peso: weight, imagem: `assets/eventos-culto/${image}.png`,
      imagemAlt: `${title}, desenho em traços brancos sobre preto`, texto: text, informacoes: info,
      requisitos: { rodadaMin: 1, flags: ["culto_ativo"], flagsAusentes: [`${id}_visto`], rodadasDesde: { cultoAdesao: min }, ...(requisitosExtra || {}) },
      opcoes: options, oncePerRun: true, ...propriedades
    };
  };
  const transicao = {
    id: "ultimo_habitante", titulo: "O último habitante", tipo: "especial", peso: 0, disparadoPelaEngine: true,
    imagem: "assets/eventos-culto/ultimo.png", imagemAlt: "Uma chama pequena diante de uma cadeira de pedra num salão vazio",
    texto: "As casas estão vazias e as portas, abertas. Uma chama arde no salão, e vozes repetem seu nome. Uma cadeira de pedra espera à beira do fogo.",
    informacoes: "Você pode encerrar aqui a linhagem ou aceitar o que o espera.",
    opcoes: [
      { id: "encerrar", texto: "Encerrar a linhagem.", resultado: "Você apaga a chama com a mão. O salão fica escuro e, depois, silencioso. Ninguém vem." },
      { id: "juntar", texto: "Aceitar o chamado.", efeitos: { seguidores: 50, honra: -5 }, resultado: "Você senta na cadeira de pedra. Cinquenta pessoas se ajoelham ao mesmo tempo. A chama cresce.", desbloqueia: { flags: ["culto_conhecido"] } }
    ]
  };
  const cult = [
    make("primeira_chama", "A primeira chama", "especial", 3, 2, "chama",
      "Os seguidores se reúnem em círculo e esperam as palavras que você ainda não escolheu.", "A primeira palavra dita aqui será repetida por muito tempo.", [
        { id: "mandamento", texto: "Proclamar um mandamento de ferro.", efeitos: { seguidores: 10, honra: -4 }, resultado: "As palavras são curtas e cruéis. Dez novos fiéis chegam antes do amanhecer." },
        { id: "dividir", texto: "Dividir o pão e a culpa.", efeitos: { seguidores: 5, honra: 2 }, resultado: "Alguns choram. Outros se afastam; o círculo que fica é menor, mas encara você de frente." },
        { id: "silenciar", texto: "Silenciar quem duvida.", requisitos: { honraMax: -50 }, efeitos: { ataque: 1, seguidores: -3, honra: -6 }, resultado: "Três vozes se calam. O círculo se aperta em volta de você." }
      ]),
    make("profeta_rival", "O profeta rival", "desordem", 4, 5, "profeta",
      "Outro pregador, de manto limpo e voz mansa, fala aos seus seguidores na praça. Metade escuta; a outra metade já se levanta.", "Ele não pede nada, só promete.", [
        { id: "desafiar", texto: "Desafiá-lo em público.", efeitos: { seguidores: 10, hp: -8, honra: -3 }, resultado: "A praça se divide e depois se cala. Os que ouviam o rival passam a olhar só para você." },
        { id: "pagar", texto: "Pagar para que ele parta · 5 gold.", requisitos: { goldMin: 5 }, efeitos: { gold: -5, seguidores: -3 }, resultado: "O profeta aceita as moedas. Três fiéis vão embora logo atrás dele." },
        { id: "deixar", texto: "Deixá-lo pregar.", efeitos: { honra: 2, seguidores: -12 }, resultado: "A voz mansa vence a sua. Doze pessoas partem com ele ao pôr do sol." }
      ]),
    make("seguidor_duvida", "O que duvida", "especial", 3, 4, "duvida",
      "Um jovem seguidor se aproxima depois da cerimônia. Diz que quer partir e que a mãe o espera na estrada.", "Os demais observam sem fingir que não ouvem.", [
        { id: "partir", texto: "Deixá-lo partir.", efeitos: { honra: 2, seguidores: -1 }, resultado: "O jovem agradece e se afasta devagar. O círculo parece menor do que antes." },
        { id: "prender", texto: "Prendê-lo no porão.", efeitos: { honra: -3 }, resultado: "O silêncio que cai é o dos que aprenderam a obedecer." },
        { id: "exemplo", texto: "Fazer dele um exemplo.", requisitos: { honraMax: -50 }, efeitos: { seguidores: 7, honra: -6 }, resultado: "Oito novos fiéis chegam de olhos baixos. Ninguém mais pergunta se pode partir." }
      ]),
    make("templo_de_ossos", "O templo de ossos", "especial", 2, 8, "templo",
      "Os seguidores propõem erguer um templo no lugar onde a chama foi acesa. Trouxeram ossos, pedras e uma planta mal desenhada.", "O templo seria permanente, mas custaria caro.", [
        { id: "pedreiros", texto: "Construir com pedreiros · 8 gold.", requisitos: { goldMin: 8 }, efeitos: { gold: -8 }, efeitoContinuo: { seguidoresPorRodada: 1 }, flags: { templo_decidido: true, templo_erguido: true }, resultado: "O templo sobe devagar e firme. Os fiéis passam a chegar sozinhos." },
        { id: "sangue", texto: "Erguer o templo com o sangue dos fiéis.", efeitos: { seguidores: -12, honra: -6 }, efeitoContinuo: { seguidoresPorRodada: 2 }, flags: { templo_decidido: true, templo_erguido: true }, resultado: "A obra consome doze vidas. O templo parece respirar, e os fiéis passam a chegar em filas." },
        { id: "adiar", texto: "Adiar a obra.", efeitos: { seguidores: -2 }, flags: { templo_decidido: true }, resultado: "Dois seguidores partem. Os ossos continuam empilhados no pátio." }
      ], { requisitos: { seguidoresMin: 30 } }),
    make("fogueira_confissao", "A fogueira da confissão", "especial", 1, 10, "fogueira",
      "Um velho seguidor pede que você diga em voz alta o que fez para chegar até aqui.", "É a única chance de sair do culto sem morrer. Também é a de sair sem ninguém.", [
        { id: "confessar", texto: "Confessar diante de todos.", efeitos: { honra: 6, seguidores: -20 }, resultado: "Vinte pessoas se levantam durante a confissão e partem. As que ficam esperam sem se mover." },
        { id: "queimar", texto: "Queimar o livro do culto.", efeitos: { honra: 8 }, flags: { culto_renegado: true }, dissolverCulto: true, desbloqueia: { flags: ["culto_renegado"] }, resultado: "Quando as cinzas esfriam, os seguidores voltam para suas casas. A vila volta a ser uma vila." },
        { id: "manter", texto: "Manter a chama acesa.", efeitos: { seguidores: 5, honra: -3 }, resultado: "Você se recusa a falar. Os que escutavam se aproximam em silêncio." }
      ]),
    make("cacador_de_hereges", "O caçador de hereges", "batalha", 2, 6, "cacador",
      "Um homem de manto negro e crucifixo de ferro chega com doze soldados. Lê uma lista de nomes que pertencem aos seus fiéis.", "Seu ataque precisa alcançar a defesa do caçador. O escudo reduz o dano recebido.", [
        { id: "combater", texto: "Defender os fiéis.", combate: true, flags: { cacador_visto: true } },
        { id: "esconder", texto: "Esconder os fiéis nas cavernas.", efeitos: { seguidores: -6, honra: -2 }, flags: { cacador_visto: true }, resultado: "O caçador busca em vão. Seis fiéis se perdem nas cavernas." },
        { id: "entregar", texto: "Entregar o líder dissidente.", requisitos: { honraMax: -50 }, efeitos: { gold: 4, seguidores: -4, honra: -5 }, flags: { cacador_visto: true }, resultado: "O caçador aceita o nome e parte satisfeito. Os fiéis se calam." }
      ], { batalha: {
        defesa: 5,
        vitoria: { dano: 16, efeitos: { seguidores: 12, gold: 6, honra: -3 }, resultado: "O caçador cai diante de todos. Doze novos fiéis chegam em procissão." },
        derrota: { dano: 24, efeitos: {}, resultado: "Você é arrastado para fora do salão. O caçador queima as cortinas e chama seus fiéis pelo nome." },
        penalidadeFalha: { efeitos: { seguidores: -15 }, texto: "Quinze fiéis são presos ou se dispersam na fuga." }
      } })
  ];
  Jogo.eventos.push(transicao, ...cult);
})();
