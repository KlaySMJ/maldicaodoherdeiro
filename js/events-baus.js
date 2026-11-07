(function () {
  "use strict";
  const Jogo = (window.Jogo = window.Jogo || {});

  Jogo.registrarEventos(
    {
      id: "bau_estrada",
      titulo: "O baú à beira da estrada",
      tipo: "achado",
      peso: 2.3,
      bauAleatorio: 3,
      imagem: "assets/bau-estrada.webp",
      imagemAlt: "Baú de madeira meio enterrado na lama",
      texto:
        "Depois da chuva, um baú aparece junto à estrada. A tampa está quebrada e os objetos mudam a cada achado.",
      informacoes:
        "Seus homens esperam que você escolha apenas um. Os itens oferecidos são sorteados e não incluem objetos que você já possui.",
      opcoes: [
        {
          id: "pocao",
          texto: "Levar a poção grande.",
          itens: ["pocao_cura_grande"],
          resultado:
            "O frasco é pesado, e o líquido vermelho-escuro se move devagar. Você o prende ao cinto.",
        },
        {
          id: "faca",
          texto: "Ficar com a faca de caça.",
          itens: ["faca_de_caca"],
          resultado: "A lâmina curta ainda cheira a couro. Seu braço parece mais pronto para o que vier.",
        },
        {
          id: "moedas",
          texto: "Pegar o pote de moedas velhas.",
          itens: ["pote_de_moedas_velhas"],
          resultado: "O pote parece pesado demais para o tamanho. Você o guarda sem abrir.",
        },
      ],
    },
    {
      id: "bau_mimico",
      titulo: "Um baú entre as raízes",
      tipo: "achado",
      peso: 1.15,
      bauAleatorio: 2,
      imagem: "assets/bau-mimico.webp",
      imagemAlt: "Baú estreito preso entre duas raízes",
      texto: "Um baú estreito está preso entre duas raízes.",
      informacoes:
        "A madeira está úmida; objetos diferentes aparecem pela fresta da tampa a cada encontro. Pode haver uma armadilha. Os itens sorteados não serão objetos que você já possui.",
      opcoes: [
        {
          id: "frasco",
          texto: "Retirar o frasco pela fresta.",
          itens: ["pocao_cura_grande"],
          armadilha: { chance: 1 / 6, danoHp: 10, perderItem: true },
          resultado: "O vidro se solta com um estalo. Você guarda o frasco no cinto.",
        },
        {
          id: "pote",
          texto: "Alcançar o pote de moedas no fundo.",
          itens: ["pote_de_moedas_velhas"],
          armadilha: { chance: 1 / 6, danoHp: 10, perderItem: true },
          resultado: "Seus dedos encontram metal frio na escuridão. Você puxa o pote para fora.",
        },
        {
          id: "deixar",
          texto: "Seguir sem mexer no baú.",
          resultado: "Você deixa os objetos onde estão e retoma a estrada.",
        },
      ],
    },
  );
})();
