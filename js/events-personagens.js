(function () {
  "use strict";
  const Jogo = window.Jogo;

  const retratos = {
    bruxa: {
      imagem: "assets/eventos-pessoas/bruxa.png",
      alt: "A bruxa da floresta, com nariz comprido, uma verruga e um sorriso amarelo"
    },
    ferreiro: {
      imagem: "assets/eventos-pessoas/ferreiro.png",
      alt: "O ferreiro da vila, homem mais velho de barba grisalha e avental de couro"
    },
    padre: {
      imagem: "assets/eventos-pessoas/padre.png",
      alt: "O padre da vila, calvo no alto, com cabelo grisalho nas laterais e expressão severa"
    }
  };

  const cartasComRetrato = {
    bruxa: "bruxa",
    bruxa_fio_da_vida: "bruxa",
    bruxa_frutos_negros: "bruxa",
    bruxa_vela: "bruxa",
    bruxa_fonte: "bruxa",
    ferreiro: "ferreiro",
    moedas_falsas: "ferreiro",
    equipamento_sem_dono: "ferreiro",
    promessa_do_ferreiro: "ferreiro",
    padre: "padre",
    capela: "padre"
  };

  for (const evento of Jogo.eventos) {
    const retrato = retratos[cartasComRetrato[evento.id]];
    if (!retrato) continue;
    evento.imagem = retrato.imagem;
    evento.imagemAlt = retrato.alt;
  }

  Jogo.eventos.push(
    {
      id: "bruxa_noite_de_tosse", titulo: "A noite das tosses", tipo: "encontro", peso: 1, grupoRecorrencia: "bruxa",
      oncePerRun: true,
      imagem: retratos.bruxa.imagem, imagemAlt: retratos.bruxa.alt,
      texto: "A bruxa bate ao portão antes do amanhecer. Uma tosse seca atravessa as casas, e ela traz folhas para preparar uma infusão que pode aliviar o peito.",
      informacoes: "O remédio é amargo. A bruxa recomenda que todos bebam devagar.",
      opcoes: [
        { id: "provar", texto: "Provar a infusão antes dos outros.", efeitos: { hp: 12, honra: 1 }, resultado: "O gosto amarga sua língua, mas a respiração fica mais leve. A bruxa observa sua reação e começa a preparar o restante." },
        { id: "familias", texto: "Pedir que ela prepare doses para as casas.", efeitos: { habitantes: 2, honra: 2 }, resultado: "A bruxa mede as folhas com cuidado. Duas famílias que já pensavam em partir passam a noite sem tosse e ficam na vila." },
        { id: "recusar", texto: "Agradecer e deixar o remédio de lado.", resultado: "A bruxa guarda as folhas sem discutir. Antes de ir, deixa a porta do salão aberta para o caso de alguém mudar de ideia." }
      ]
    },
    {
      id: "ferreiro_reforco_do_portao", titulo: "O ferro do portão", tipo: "encontro", peso: 2,
      oncePerRun: true,
      imagem: retratos.ferreiro.imagem, imagemAlt: retratos.ferreiro.alt,
      texto: "Uma barra do portão se parte junto à dobradiça. O ferreiro traz o pedaço à forja e propõe reaproveitar o metal antes que a entrada fique vulnerável.",
      informacoes: "O ferro serve para reforçar a entrada ou virar ferramentas para os campos.",
      opcoes: [
        { id: "reforcar", texto: "Pagar o reforço · 3 Gold.", requisitos: { goldMin: 3 }, efeitos: { gold: -3, escudo: 1, honra: 1 }, resultado: "O ferreiro ajusta a barra no portão. A entrada volta a fechar sem ceder ao primeiro empurrão." },
        { id: "ferramentas", texto: "Transformar o ferro em ferramentas.", efeitos: { habitantes: 2, honra: 2 }, resultado: "O ferreiro entrega enxadas e grampos aos trabalhadores. Duas famílias terminam o plantio e decidem ficar." },
        { id: "vender", texto: "Vender o metal como sucata.", efeitos: { gold: 3, honra: -2 }, resultado: "As moedas chegam ao cofre, mas o ferreiro deixa a barra partida junto ao portão." }
      ]
    },
    {
      id: "padre_vigilia_das_velas", titulo: "A vigília das velas", tipo: "encontro", peso: 2,
      oncePerRun: true,
      requisitos: { flags: ["padre_aceito"], rodadaMin: 10 },
      imagem: retratos.padre.imagem, imagemAlt: retratos.padre.alt,
      texto: "O padre reúne os moradores na capela para uma vigília em memória de quem morreu desde sua chegada. Com poucas velas e muitos nomes, ele espera sua decisão.",
      informacoes: "Uma noite de recolhimento pode aliviar o luto ou reabrir feridas.",
      opcoes: [
        { id: "doar", texto: "Comprar velas para a vigília · 2 Gold.", requisitos: { goldMin: 2 }, efeitos: { gold: -2, honra: 3, hp: 6 }, resultado: "As velas duram até o amanhecer. O padre lê cada nome sem apressar a voz, e o salão finalmente descansa." },
        { id: "reunir", texto: "Chamar as famílias para ficarem juntas.", efeitos: { habitantes: 2, honra: 2 }, resultado: "Os moradores dividem o silêncio e contam histórias de quem perderam. Duas famílias deixam de preparar a partida." },
        { id: "dispensar", texto: "Encerrar a vigília por hoje.", efeitos: { honra: -1 }, resultado: "O padre apaga as velas. Ele aceita sua decisão, mas guarda a lista de nomes sob o braço." }
      ]
    }
  );
})();
