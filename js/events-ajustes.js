(function () {
  "use strict";
  const Jogo = window.Jogo = window.Jogo || {};

// Honra extrema abre decisões novas em cenas já conhecidas.
  const opcoesPorHonra = {
    ferreiro: [
      { id: "selo_guardioes", texto: "Aceitar o Selo dos guardiões.", requisitos: { honraMin: 91 }, itens: ["selo_do_povo"], resultado: "O ferreiro reconhece a confiança do povo e grava seu selo no aço. A peça reforça seu corpo e seu equipamento." }
    ],
    corvo: [
      { id: "pacto_dente", texto: "Aceitar a oferta do corvo.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "O corvo deixa cair um dente negro na sua palma. Uma voz promete força; o preço se faz sentir antes que a ave desapareça." }
    ],
    mercador_sem_sombra: [
      { id: "pacto_dente", texto: "Aceitar a oferta sem sombra.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "O mercador entrega um dente negro. Uma voz promete força; o preço se faz sentir antes que a carroça desapareça." }
    ],
    lobo_pactuario: [
      { id: "pacto_dente", texto: "Aceitar a oferta da matilha.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "O lobo deixa um dente negro aos seus pés. Uma voz promete força; o preço se faz sentir antes que a matilha desapareça." }
    ],
    rei_sob_a_colina: [
      { id: "pacto_dente", texto: "Aceitar a oferta do rei sob a colina.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "O rei entrega um dente negro retirado de sua coroa. Uma voz promete força; o preço se faz sentir quando a pedra se fecha." }
    ],
    sussurro_do_ouro: [
      { id: "pacto_dente", texto: "Aceitar a oferta que vem do cofre.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "Entre as moedas, aparece um dente negro. Uma voz promete força; o preço se faz sentir quando o cofre se cala." }
    ],
    viajantes: [
      { id: "dar_sementes", texto: "Confiar-lhes sementes e um começo sem dívida.", requisitos: { honraMin: 90 }, efeitos: { habitantes: 5, honra: 5 }, resultado: "Você entrega sementes do celeiro e dispensa qualquer pagamento. Os viajantes plantam junto às casas; o povo vê que a confiança também pode ser herdada." },
      { id: "cobrar_entrada", texto: "Cobrar pela entrada e tomar parte da carga.", requisitos: { honraMax: -90 }, efeitos: { habitantes: -3, honra: -6, gold: 4 }, resultado: "Os guardas recolhem as ferramentas e as últimas moedas dos viajantes. Três deles partem a pé; os demais entram sem erguer os olhos." }
    ],
    caravana_da_ponte: [
      { id: "abrigo_sem_pedagio", texto: "Oferecer abrigo e dividir a carga sem cobrar passagem.", requisitos: { honraMin: 90 }, efeitos: { habitantes: 5, honra: 4, gold: -2 }, flags: { caravana_recebida: true }, resultado: "Você paga o abrigo com as próprias moedas e reparte a carga entre as famílias. A condutora leva a história pela estrada." }
    ],
    noite_dos_mortos: [
      { id: "lembrar_nomes", texto: "Ouvir cada nome e ficar até a última vela.", requisitos: { honraMin: 90 }, efeitos: { honra: 5, hp: -3 }, resultado: "A vigília atravessa a noite. Ao amanhecer, cada família sabe que seus mortos foram lembrados pelo senhor.", flags: { mortos_ouvidos: true } },
      { id: "tomar_oferendas", texto: "Recolher o pão das lápides para o cofre.", requisitos: { honraMax: -90 }, efeitos: { gold: 4, honra: -6, habitantes: -2 }, resultado: "Seus homens levam o pão antes que as velas se apaguem. Duas casas fecham as janelas e não voltam a abrir para o castelo." }
    ]
  };
  for (const [eventoId, opcoes] of Object.entries(opcoesPorHonra)) {
    const evento = Jogo.eventos.find(carta => carta.id === eventoId);
    if (evento) evento.opcoes.push(...opcoes);
  }

  const cartaOrfao = Jogo.eventos.find(evento => evento.id === "orfao");
  if (cartaOrfao) {
    for (const opcao of cartaOrfao.opcoes.filter(item => item.flags?.orfao_acolhido)) {
      opcao.marcoRodada = { id: "menino_adotado", honraMin: 50, flag: "menino_adotado_com_honra" };
    }
  }

  const cartaBruxa = Jogo.eventos.find(evento => evento.id === "bruxa");
  if (cartaBruxa) {
    cartaBruxa.peso = 2;
    cartaBruxa.grupoRecorrencia = "bruxa";
  }
})();
