(function () {
  "use strict";

  const artes = {
    festival_dos_mortos: {
      imagem: "assets/eventos-especificos/festival-dos-mortos.png",
      imagemAlt: "Procissão noturna com velas e oferendas em memória dos mortos"
    },
    ano_novo_lunar: {
      imagem: "assets/eventos-especificos/ano-novo-lunar.png",
      imagemAlt: "Moradores celebram o Ano Novo Lunar sob lanternas, partilhando comida"
    },
    incendio_no_bosque: {
      imagem: "assets/eventos-especificos/incendio-no-bosque.png",
      imagemAlt: "Fogo avança entre as árvores em direção à vila"
    },
    lei_do_machado: {
      imagem: "assets/eventos-especificos/lei-do-machado.png",
      imagemAlt: "Lenhadores diante de árvores marcadas para o corte"
    },
    festival_da_seiva: {
      imagem: "assets/eventos-especificos/festival-da-seiva.png",
      imagemAlt: "Moradores celebram a primavera junto a uma árvore"
    },
    espirito_da_floresta: {
      imagem: "assets/eventos-especificos/espirito-da-floresta.png",
      imagemAlt: "Árvore-espírito ergue as raízes da terra"
    },
    vigilia_da_geada: {
      imagem: "assets/eventos-especificos/vigilia-da-geada.png",
      imagemAlt: "Famílias e animais buscam abrigo durante a geada"
    },
    dizimo_da_floresta: {
      imagem: "assets/eventos-especificos/dizimo-da-floresta.png",
      imagemAlt: "Oferenda de outono entre raízes e folhas"
    },
    hospede_palido: {
      imagem: "assets/eventos-especificos/hospede-palido.png",
      imagemAlt: "Busto de um vampiro pálido de manto escuro e olhar vigilante"
    },
    anel_do_defunto: {
      imagem: "assets/eventos-especificos/anel-do-defunto.png",
      imagemAlt: "Anel repousa sobre uma sepultura"
    },
    a_voz: {
      imagem: "assets/eventos-especificos/a-voz.png",
      imagemAlt: "Sombra sussurra ao herdeiro encapuzado"
    },
    cura_licantropia: {
      imagem: "assets/eventos-especificos/preco-da-cura.png",
      imagemAlt: "Curandeira prepara ervas diante de um círculo de pedras"
    },
    cura_vampirismo: {
      imagem: "assets/eventos-especificos/estaca-e-aurora.png",
      imagemAlt: "O padre e o vampiro seguram juntos uma estaca de madeira"
    },
    cura_possessao: {
      imagem: "assets/eventos-especificos/exorcismo.png",
      imagemAlt: "Vampiro assustado em vestes nobres"
    },
    bruxa_frutos_negros: {
      imagem: "assets/eventos-especificos/frutos-negros-na-soleira.png",
      imagemAlt: "Cesto de frutos escuros junto à soleira de uma casa"
    },
    bruxa_vela: {
      imagem: "assets/eventos-especificos/vela-que-nao-apaga.png",
      imagemAlt: "Vela acesa resiste ao vento perto da mão da bruxa"
    },
    testamento: {
      imagem: "assets/eventos-especificos/testamento-selado.png",
      imagemAlt: "Testamento selado com o brasão da família"
    },
    caravana_da_ponte: {
      imagem: "assets/eventos-especificos/caravana-na-ponte.png",
      imagemAlt: "Carroças atravessam uma ponte sobre o rio"
    },
    contrabandista: {
      imagem: "assets/eventos-especificos/caminho-sem-guarda.png",
      imagemAlt: "Contrabandistas escondem caixas numa estrada à noite"
    },
    milicia: {
      imagem: "assets/eventos-especificos/escudos-de-celeiro.png",
      imagemAlt: "Guardas treinam com escudos improvisados de madeira"
    },
    pedreira: {
      imagem: "assets/eventos-especificos/pedra-e-pao.png",
      imagemAlt: "Trabalhadores extraem pedra com provisões ao lado"
    },
    javalis: {
      imagem: "assets/eventos-especificos/donos-da-plantacao.png",
      imagemAlt: "Javalis invadem uma plantação"
    },
    colheita: {
      imagem: "assets/eventos-especificos/uma-noite-sem-fome.png",
      imagemAlt: "Moradores dividem uma colheita farta na praça"
    },
    calice_no_pantano: {
      imagem: "assets/eventos-especificos/calice-no-pantano.png",
      imagemAlt: "Cálice parcialmente submerso entre juncos no pântano"
    },
    torre_na_lagoa: {
      imagem: "assets/eventos-especificos/torre-na-lagoa.png",
      imagemAlt: "Torre isolada refletida na água da lagoa"
    },
    mapa_na_pedra: {
      imagem: "assets/eventos-especificos/mapa-na-pedra.png",
      imagemAlt: "Mapa de uma rota gravado numa pedra"
    },
    ponte_partida: {
      imagem: "assets/eventos-especificos/ponte-partida.png",
      imagemAlt: "Ponte de madeira danificada sobre o rio"
    },
    pedagio_revolta: {
      imagem: "assets/eventos-especificos/preco-da-ponte.png",
      imagemAlt: "Moradores confrontam o cobrador do pedágio da ponte"
    },
    retorno_do_menino: {
      imagem: "assets/eventos-especificos/retorno-do-menino.png",
      imagemAlt: "Menino adotado retorna pela estrada da vila"
    },
    primeiro_conselho_do_menino: {
      imagem: "assets/eventos-especificos/primeiro-parecer.png",
      imagemAlt: "Jovem conselheiro apresenta seu parecer diante de dois anciãos"
    },
    mao_do_rei: {
      imagem: "assets/eventos-especificos/mao-do-rei.png",
      imagemAlt: "Herdeiro entrega o selo do conselho ao jovem conselheiro"
    },
    conselheiro_menino_armazem: {
      imagem: "assets/eventos-especificos/conselho-armazem.png",
      imagemAlt: "Jovem conselheiro conversa sobre o estoque do armazém"
    },
    conselheiro_menino_ponte: {
      imagem: "assets/eventos-especificos/conselho-ponte.png",
      imagemAlt: "Jovem conselheiro aponta uma ponte no mapa diante de um ancião"
    },
    conselheiro_menino_guardas: {
      imagem: "assets/eventos-especificos/conselho-guardas.png",
      imagemAlt: "Jovem conselheiro acompanha o treino dos guardas"
    }
  };

  for (const evento of window.Jogo.eventos) {
    const arte = artes[evento.id];
    if (!arte) continue;
    evento.imagem = arte.imagem;
    evento.imagemAlt = arte.imagemAlt;
  }
})();
