(function () {
  "use strict";
  const Jogo = window.Jogo;

  Jogo.eventos.push(
    {
      id: "ano_novo_lunar", titulo: "Ano Novo Lunar", tipo: "encontro", peso: 2, oncePerYear: true,
      requisitos: { estacao: "primavera" }, imagem: "assets/vila.png",
      imagemAlt: "Moradores reunidos na praça para celebrar o começo do ano",
      texto: "Viajantes do leste chegam com lanternas e um calendário marcado pelos ciclos da lua. A vila se reúne para dar as boas-vindas ao novo ano.",
      informacoes: "A celebração pode unir a vila, trazer prosperidade ou encher seus cofres à custa da festa.",
      opcoes: [
        { id: "ano_lunar_festa", texto: "Abrir os portões e oferecer um banquete · 2 Gold.", requisitos: { goldMin: 2 }, efeitos: { gold: -2, habitantes: 4, honra: 2 }, resultado: "Viajantes e moradores dividem a mesa. Quatro pessoas decidem ficar, e as lanternas continuam acesas até o amanhecer." },
        { id: "ano_lunar_bencao", texto: "Acompanhar a vigília das lanternas.", efeitos: { hp: 6, honra: 3 }, resultado: "Você acompanha as lanternas até a última desaparecer. A vila começa o ano em paz, e o descanso recupera suas forças." },
        { id: "ano_lunar_imposto", texto: "Cobrar pela entrada e pelo espaço na praça.", efeitos: { gold: 5, honra: -3 }, resultado: "A praça rende algumas moedas. Os viajantes partem antes da meia-noite, levando consigo a música." }
      ]
    },
    {
      id: "festival_dos_mortos", titulo: "Festival dos Mortos", tipo: "encontro", peso: 2, oncePerYear: true,
      requisitos: { estacao: "outono" }, imagem: "assets/ervas.png",
      imagemAlt: "Pequenas velas acesas entre folhas de outono",
      texto: "Com a queda das folhas, as famílias acendem velas para lembrar quem já se foi. Uma procissão atravessa a vila levando nomes, canções e pequenas oferendas.",
      informacoes: "A lembrança dos mortos pode aproximar os vivos ou servir de desculpa para tomar o que foi deixado nos altares.",
      opcoes: [
        { id: "mortos_procissao", texto: "Caminhar com as famílias e ouvir suas histórias.", efeitos: { hp: 5, honra: 3 }, resultado: "A procissão atravessa as ruas em silêncio. Ao fim, os moradores voltam para casa mais próximos uns dos outros." },
        { id: "mortos_oferenda", texto: "Preparar uma mesa comum para os visitantes · 2 Gold.", requisitos: { goldMin: 2 }, efeitos: { gold: -2, habitantes: 3, honra: 2 }, resultado: "A mesa acolhe quem veio de longe para a procissão. Três viajantes ficam na vila depois do festival." },
        { id: "mortos_tomar", texto: "Recolher as oferendas antes que alguém as leve.", efeitos: { gold: 5, honra: -4 }, resultado: "As moedas dos altares passam para seus cofres. Naquela noite, ninguém canta seu nome entre os mortos." }
      ]
    }
  );
})();
