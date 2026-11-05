(function () {
  "use strict";

  const artes = {
    festival_dos_mortos: {
      imagem: "assets/eventos-especificos/festival-dos-mortos.webp",
      imagemAlt: "Procissão noturna com velas e oferendas em memória dos mortos",
    },
    ano_novo_lunar: {
      imagem: "assets/eventos-especificos/ano-novo-lunar.webp",
      imagemAlt: "Moradores celebram o Ano Novo Lunar sob lanternas, partilhando comida",
    },
    incendio_no_bosque: {
      imagem: "assets/eventos-especificos/incendio-no-bosque.webp",
      imagemAlt: "Fogo avança entre as árvores em direção à vila",
    },
    lei_do_machado: {
      imagem: "assets/eventos-especificos/lei-do-machado.webp",
      imagemAlt: "Lenhadores diante de árvores marcadas para o corte",
    },
    festival_da_seiva: {
      imagem: "assets/eventos-especificos/festival-da-seiva.webp",
      imagemAlt: "Moradores celebram a primavera junto a uma árvore",
    },
    espirito_da_floresta: {
      imagem: "assets/eventos-especificos/espirito-da-floresta.webp",
      imagemAlt: "Árvore-espírito ergue as raízes da terra",
    },
    vigilia_da_geada: {
      imagem: "assets/eventos-especificos/vigilia-da-geada.webp",
      imagemAlt: "Famílias e animais buscam abrigo durante a geada",
    },
    dizimo_da_floresta: {
      imagem: "assets/eventos-especificos/dizimo-da-floresta.webp",
      imagemAlt: "Oferenda de outono entre raízes e folhas",
    },
    hospede_palido: {
      imagem: "assets/eventos-especificos/hospede-palido.webp",
      imagemAlt: "Busto de um vampiro pálido de manto escuro e olhar vigilante",
    },
    anel_do_defunto: {
      imagem: "assets/eventos-especificos/anel-do-defunto.webp",
      imagemAlt: "Anel repousa sobre uma sepultura",
    },
    a_voz: {
      imagem: "assets/eventos-especificos/a-voz.webp",
      imagemAlt: "Sombra sussurra ao herdeiro encapuzado",
    },
    cura_licantropia: {
      imagem: "assets/eventos-especificos/preco-da-cura.webp",
      imagemAlt: "Curandeira prepara ervas diante de um círculo de pedras",
    },
    cura_vampirismo: {
      imagem: "assets/eventos-especificos/estaca-e-aurora.webp",
      imagemAlt: "O padre e o vampiro seguram juntos uma estaca de madeira",
    },
    cura_possessao: {
      imagem: "assets/eventos-especificos/exorcismo.webp",
      imagemAlt: "Vampiro assustado em vestes nobres",
    },
    bruxa_frutos_negros: {
      imagem: "assets/eventos-especificos/frutos-negros-na-soleira.webp",
      imagemAlt: "Cesto de frutos escuros junto à soleira de uma casa",
    },
    bruxa_vela: {
      imagem: "assets/eventos-especificos/vela-que-nao-apaga.webp",
      imagemAlt: "Vela acesa resiste ao vento perto da mão da bruxa",
    },
    testamento: {
      imagem: "assets/eventos-especificos/testamento-selado.webp",
      imagemAlt: "Testamento selado com o brasão da família",
    },
    caravana_da_ponte: {
      imagem: "assets/eventos-especificos/caravana-na-ponte.webp",
      imagemAlt: "Carroças atravessam uma ponte sobre o rio",
    },
    contrabandista: {
      imagem: "assets/eventos-especificos/caminho-sem-guarda.webp",
      imagemAlt: "Contrabandistas escondem caixas numa estrada à noite",
    },
    milicia: {
      imagem: "assets/eventos-especificos/escudos-de-celeiro.webp",
      imagemAlt: "Guardas treinam com escudos improvisados de madeira",
    },
    pedreira: {
      imagem: "assets/eventos-especificos/pedra-e-pao.webp",
      imagemAlt: "Trabalhadores extraem pedra com provisões ao lado",
    },
    javalis: {
      imagem: "assets/eventos-especificos/donos-da-plantacao.webp",
      imagemAlt: "Javalis invadem uma plantação",
    },
    colheita: {
      imagem: "assets/eventos-especificos/uma-noite-sem-fome.webp",
      imagemAlt: "Moradores dividem uma colheita farta na praça",
    },
    calice_no_pantano: {
      imagem: "assets/eventos-especificos/calice-no-pantano.webp",
      imagemAlt: "Cálice parcialmente submerso entre juncos no pântano",
    },
    torre_na_lagoa: {
      imagem: "assets/eventos-especificos/torre-na-lagoa.webp",
      imagemAlt: "Torre isolada refletida na água da lagoa",
    },
    mapa_na_pedra: {
      imagem: "assets/eventos-especificos/mapa-na-pedra.webp",
      imagemAlt: "Mapa de uma rota gravado numa pedra",
    },
    ponte_partida: {
      imagem: "assets/eventos-especificos/ponte-partida.webp",
      imagemAlt: "Ponte de madeira danificada sobre o rio",
    },
    pedagio_revolta: {
      imagem: "assets/eventos-especificos/preco-da-ponte.webp",
      imagemAlt: "Moradores confrontam o cobrador do pedágio da ponte",
    },
    retorno_do_menino: {
      imagem: "assets/eventos-especificos/retorno-do-menino.webp",
      imagemAlt: "Menino adotado retorna pela estrada da vila",
    },
    primeiro_conselho_do_menino: {
      imagem: "assets/eventos-especificos/primeiro-parecer.webp",
      imagemAlt: "Jovem conselheiro apresenta seu parecer diante de dois anciãos",
    },
    mao_do_rei: {
      imagem: "assets/eventos-especificos/mao-do-rei.webp",
      imagemAlt: "Herdeiro entrega o selo do conselho ao jovem conselheiro",
    },
    conselheiro_menino_armazem: {
      imagem: "assets/eventos-especificos/conselho-armazem.webp",
      imagemAlt: "Jovem conselheiro conversa sobre o estoque do armazém",
    },
    conselheiro_menino_ponte: {
      imagem: "assets/eventos-especificos/conselho-ponte.webp",
      imagemAlt: "Jovem conselheiro aponta uma ponte no mapa diante de um ancião",
    },
    conselheiro_menino_guardas: {
      imagem: "assets/eventos-especificos/conselho-guardas.webp",
      imagemAlt: "Jovem conselheiro acompanha o treino dos guardas",
    },
  };

  for (const evento of window.Jogo.eventos) {
    const arte = artes[evento.id];
    if (!arte) continue;
    evento.imagem = arte.imagem;
    evento.imagemAlt = arte.imagemAlt;
  }
})();
