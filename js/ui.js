(function () {
  "use strict";
  const Jogo = window.Jogo;
  const app = document.getElementById("app");
  const DURACAO_ANIMACAO_DADO = 1600;
  let renderDisputaAtual = 0;
  let animacaoDisputaAtual = Promise.resolve();
  const coresPrincipaisHerdeiros = {
    corajoso: "#46586F",
    avarento: "#8B673D",
    doente: "#747661",
    druida_herdeiro: "#963B32",
    menino_cronista: "#B9753F",
    heroi_do_povo: "#6C596D",
    herdeiro_culto: "#000000",
    herdeira_leste: "#B23A30",
    herdeiro_nordico: "#59656F",
    coringa: "#70484E",
    bruxo: "#4C5C4D",
  };
  const iconesDisputa = {
    espada:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m14 4 6-2-2 7-9 9-4-4 9-9Z"/><path d="m7 14 3 3m-6 5 5-5"/></svg>',
    escudo:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 20 5v6c0 5-3.2 8.3-8 11-4.8-2.7-8-6-8-11V5l8-3Z"/></svg>',
    dado: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 2 9 6-3 12H6L3 8l9-6Z"/><path d="M12 2v10m0 0 9-4m-9 4-6 8m6-8L3 8m9 4 6 8"/></svg>',
  };
  const facesD20 = (() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices = [];
    for (const sinal of [-1, 1]) {
      for (const outroSinal of [-1, 1]) {
        vertices.push(
          [0, sinal, outroSinal * phi],
          [sinal, outroSinal * phi, 0],
          [outroSinal * phi, 0, sinal],
        );
      }
    }
    const raio = Math.sqrt(1 + phi ** 2);
    for (let indice = 0; indice < vertices.length; indice++)
      vertices[indice] = vertices[indice].map((coordenada) => coordenada / raio);
    const faces = [];
    const distanciaQuadrada = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    for (let a = 0; a < vertices.length - 2; a++) {
      for (let b = a + 1; b < vertices.length - 1; b++) {
        if (Math.abs(distanciaQuadrada(vertices[a], vertices[b]) - 4 / raio ** 2) > 0.0001) continue;
        for (let c = b + 1; c < vertices.length; c++) {
          if (
            Math.abs(distanciaQuadrada(vertices[a], vertices[c]) - 4 / raio ** 2) > 0.0001 ||
            Math.abs(distanciaQuadrada(vertices[b], vertices[c]) - 4 / raio ** 2) > 0.0001
          )
            continue;
          let indiceB = b;
          let indiceC = c;
          const ab = vertices[b].map((coordenada, indice) => coordenada - vertices[a][indice]);
          const ac = vertices[c].map((coordenada, indice) => coordenada - vertices[a][indice]);
          let normal = [
            ab[1] * ac[2] - ab[2] * ac[1],
            ab[2] * ac[0] - ab[0] * ac[2],
            ab[0] * ac[1] - ab[1] * ac[0],
          ];
          let positivo = false;
          let negativo = false;
          for (let outro = 0; outro < vertices.length; outro++) {
            if (outro === a || outro === b || outro === c) continue;
            const deslocamento = vertices[outro].map(
              (coordenada, indice) => coordenada - vertices[a][indice],
            );
            const lado = normal.reduce(
              (soma, coordenada, indice) => soma + coordenada * deslocamento[indice],
              0,
            );
            positivo ||= lado > 0.0001;
            negativo ||= lado < -0.0001;
          }
          if (positivo && negativo) continue;
          const centro = [0, 1, 2].map(
            (indice) => (vertices[a][indice] + vertices[b][indice] + vertices[c][indice]) / 3,
          );
          if (normal.reduce((soma, coordenada, indice) => soma + coordenada * centro[indice], 0) < 0) {
            [indiceB, indiceC] = [indiceC, indiceB];
            normal = normal.map((coordenada) => -coordenada);
          }
          const tamanhoNormal = Math.hypot(...normal);
          faces.push({
            vertices: [a, indiceB, indiceC],
            normal: normal.map((coordenada) => coordenada / tamanhoNormal),
          });
        }
      }
    }
    return { vertices, faces: faces.map((face, indice) => ({ ...face, valor: indice + 1 })) };
  })();
  let debugRevelado = false;
  const imagensComTomDaVila = new Set([
    "assets/geada.webp",
    "assets/espelho-do-antecessor.webp",
    "assets/eventos-especiais/viajante-norte.webp",
    "assets/eventos-especificos/a-voz.webp",
    "assets/eventos-especificos/anel-do-defunto.webp",
    "assets/eventos-especificos/ano-novo-lunar.webp",
    "assets/eventos-especificos/caminho-sem-guarda.webp",
    "assets/eventos-especificos/caravana-na-ponte.webp",
    "assets/eventos-especificos/calice-no-pantano.webp",
    "assets/eventos-especificos/conselho-armazem.webp",
    "assets/eventos-especificos/conselho-guardas.webp",
    "assets/eventos-especificos/conselho-ponte.webp",
    "assets/eventos-especificos/dizimo-da-floresta.webp",
    "assets/eventos-especificos/donos-da-plantacao.webp",
    "assets/eventos-especificos/escudos-de-celeiro.webp",
    "assets/eventos-especificos/espirito-da-floresta.webp",
    "assets/eventos-especificos/exorcismo.webp",
    "assets/eventos-especificos/festival-da-seiva.webp",
    "assets/eventos-especificos/festival-dos-mortos.webp",
    "assets/eventos-especificos/frutos-negros-na-soleira.webp",
    "assets/eventos-especificos/hospede-palido.webp",
    "assets/eventos-especificos/incendio-no-bosque.webp",
    "assets/eventos-especificos/lei-do-machado.webp",
    "assets/eventos-especificos/mao-do-rei.webp",
    "assets/eventos-especificos/mapa-na-pedra.webp",
    "assets/eventos-especificos/pedra-e-pao.webp",
    "assets/eventos-especificos/ponte-partida.webp",
    "assets/eventos-especificos/preco-da-cura.webp",
    "assets/eventos-especificos/preco-da-ponte.webp",
    "assets/eventos-especificos/primeiro-parecer.webp",
    "assets/eventos-especificos/retorno-do-menino.webp",
    "assets/eventos-especificos/testamento-selado.webp",
    "assets/eventos-especificos/torre-na-lagoa.webp",
    "assets/eventos-especificos/uma-noite-sem-fome.webp",
    "assets/eventos-especificos/vela-que-nao-apaga.webp",
    "assets/eventos-especificos/vigilia-da-geada.webp",
  ]);
  const nomes = {
    hp: "Vida",
    hpMax: "Vida máxima",
    escudo: "Escudo",
    ataque: "Ataque",
    honra: "Honra",
    habitantes: "Habitantes",
    gold: "Ouro",
  };
  const esc = (valor) =>
    String(valor).replace(
      /[&<>"']/g,
      (letra) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[letra],
    );
  const nomesEspeciais = ["A Entidade", "Entidade"];
  function destacarItens(raiz = app) {
    const itens = (Jogo.itens || []).filter((item) => item.nome && item.raridade);
    if (!itens.length) return;
    const porNome = new Map(itens.map((item) => [item.nome.toLocaleLowerCase("pt-BR"), item]));
    const nomes = itens
      .map((item) => item.nome)
      .sort((a, b) => b.length - a.length)
      .map((nome) => nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const padrao = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${nomes.join("|")})(?![\\p{L}\\p{N}_])`, "giu");
    const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const textos = [];
    while (walker.nextNode()) textos.push(walker.currentNode);
    for (const texto of textos) {
      if (
        texto.parentElement.closest(
          "[data-item-info], .item-info-tooltip, .item-efeito-tooltip, .leitor-de-tela, script, style, textarea, option, svg",
        )
      )
        continue;
      if (temporizadorTextoEvento && texto.parentElement.closest("[data-texto-visual]")) continue;
      const fragmento = document.createDocumentFragment();
      let inicio = 0;
      for (const trecho of texto.textContent.matchAll(padrao)) {
        const item = porNome.get(trecho[0].toLocaleLowerCase("pt-BR"));
        fragmento.append(texto.textContent.slice(inicio, trecho.index));
        const nome = document.createElement("span");
        nome.className = `item-nome raridade-${item.raridade}`;
        nome.dataset.itemInfo = item.id;
        nome.tabIndex = 0;
        nome.textContent = trecho[0];
        const descricao = texto.parentElement
          .closest(".item-efeito")
          ?.querySelector(".item-efeito-tooltip")?.textContent;
        nome.dataset.itemDescricao = descricao || [item.texto, item.descricao].filter(Boolean).join(". ");
        nome.setAttribute("aria-description", nome.dataset.itemDescricao);
        fragmento.append(nome);
        inicio = trecho.index + trecho[0].length;
      }
      if (inicio) {
        fragmento.append(texto.textContent.slice(inicio));
        texto.replaceWith(fragmento);
      }
    }
  }
  let dicaItem = null;
  function fecharDicaItem() {
    dicaItem?.remove();
    dicaItem = null;
  }
  function mostrarDicaItem(alvo) {
    fecharDicaItem();
    dicaItem = document.createElement("div");
    dicaItem.className = "item-info-tooltip";
    dicaItem.setAttribute("role", "tooltip");
    dicaItem.textContent = alvo.dataset.itemDescricao;
    (alvo.closest("dialog[open]") || document.body).append(dicaItem);
    const rect = alvo.getBoundingClientRect();
    const largura = dicaItem.getBoundingClientRect().width;
    dicaItem.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - largura - 8))}px`;
    const altura = dicaItem.getBoundingClientRect().height;
    dicaItem.style.top = `${Math.max(8, rect.top >= altura + 12 ? rect.top - altura - 8 : Math.min(rect.bottom + 8, window.innerHeight - altura - 8))}px`;
  }
  document.addEventListener("pointerover", (evento) => {
    const alvo = evento.target.closest?.("[data-item-info]");
    if (alvo) mostrarDicaItem(alvo);
  });
  document.addEventListener("pointerout", (evento) => {
    if (evento.target.closest?.("[data-item-info]")) fecharDicaItem();
  });
  document.addEventListener("focusin", (evento) => {
    const alvo = evento.target.closest?.("[data-item-info]");
    if (alvo) mostrarDicaItem(alvo);
  });
  document.addEventListener("focusout", fecharDicaItem);
  document.addEventListener(
    "click",
    (evento) => {
      const alvo = evento.target.closest?.("[data-item-info]");
      if (!alvo) return fecharDicaItem();
      evento.preventDefault();
      evento.stopImmediatePropagation();
      mostrarDicaItem(alvo);
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (evento) => {
      if (evento.key === "Escape") fecharDicaItem();
      const alvo = evento.target.closest?.("[data-item-info]");
      if (alvo && (evento.key === "Enter" || evento.key === " ")) {
        evento.preventDefault();
        evento.stopImmediatePropagation();
        mostrarDicaItem(alvo);
      }
    },
    true,
  );
  window.addEventListener("resize", fecharDicaItem);
  window.addEventListener("scroll", fecharDicaItem, true);
  new MutationObserver((mudancas) => {
    const raizes = new Set();
    for (const mudanca of mudancas) {
      for (const node of mudanca.addedNodes) {
        const raiz = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        if (raiz?.nodeType === Node.ELEMENT_NODE && raiz.isConnected) raizes.add(raiz);
      }
    }
    for (const raiz of raizes) destacarItens(raiz);
  }).observe(document.body, { childList: true, subtree: true });
  const textoComNomesEspeciais = (valor) => {
    const nomes = nomesEspeciais.map((nome) => nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    return esc(valor).replace(
      new RegExp(`\\b(?:${nomes})\\b`, "g"),
      '<span class="nome-especial-tremendo">$&</span>',
    );
  };
  const numero = (valor) => new Intl.NumberFormat("pt-BR").format(valor);
  const assinado = (valor) => `${valor > 0 ? "+" : ""}${numero(valor)}`;
  const textoDaRendaProxima = (run) => {
    const previsao = Jogo.engine.preverRenda(run);
    if (!previsao.fontes.length)
      return "Sem renda recorrente prevista nas próximas 30 rodadas. Nenhum item altera a renda recorrente.";
    const fontes = previsao.fontes.map((fonte) => `${fonte.nome}: ${assinado(fonte.valor)} Gold`).join("; ");
    return `Próxima variação de Gold: ${assinado(previsao.total)} na rodada ${numero(previsao.rodada)}. ${fontes}. Itens: nenhum item altera a renda recorrente.`;
  };
  const nomesRaridade = {
    comum: "Comum",
    raro: "Raro",
    epico: "Épico",
    lendario: "Lendário",
    pacto: "Pacto",
  };
  const nomesTraco = {
    ...Object.fromEntries(Object.entries(Jogo.herdeiros.novos).map(([id, h]) => [id, h.nome])),
    corajoso: "Corajosa",
    avarento: "Avarento",
    doente: "Doente",
    druida_herdeiro: "Filho da Floresta",
    menino_cronista: "Menino da Crônica",
    heroi_do_povo: "A Heroína do povo",
  };
  const nomesProprios = Jogo.herdeiros.nomes || {};
  function nomeDoHerdeiro(traco) {
    return nomesProprios[traco] || null;
  }
  function tituloHerdeiro(traco) {
    const nome = nomeDoHerdeiro(traco);
    if (nome) return nome;
    return ["corajoso", "herdeira_leste"].includes(traco) ? "A herdeira" : "O herdeiro";
  }
  function rotuloHerdeiro(traco) {
    const nome = nomeDoHerdeiro(traco);
    const epiteto = nomesTraco[traco] || "Herdeiro";
    return nome ? `${nome} · ${epiteto}` : epiteto;
  }
  const condicaoNomes = { licantropia: "Licantropia", vampirismo: "Vampirismo", possessao: "Possessão" };
  const condicaoDescricoes = {
    licantropia: "+2 Ataque · recupera 1 Vida por rodada",
    vampirismo:
      "+3 Ataque · +2 Escudo · perde 1 Vida por rodada; Sede de sangue: 1 aldeão por até 20 Vida, a cada 6 rodadas",
    possessao: "+2 Ataque · revela a Honra das escolhas",
  };
  const descricoesTraco = {
    ...Object.fromEntries(Object.entries(Jogo.herdeiros.novos).map(([id, h]) => [id, h.descricao])),
    corajoso: "Corajosa: começa com 3 Ataque e recebe +2 nas rolagens de batalha.",
    avarento: "Avarento: começa com 10 Gold.",
    doente:
      "Doente: começa com 90 Vida e 4 Escudo; sua Vida máxima inicial também é 90. Reduz a Defesa inimiga em 2.",
    druida_herdeiro:
      "Druida-Herdeiro: começa com o Cajado de carvalho vivo e recebe a passiva de um companheiro aleatório a cada rodada. A Raposa melhora sua rolagem de combate. As quatro estações seguem o ciclo de 25 rodadas.",
    menino_cronista:
      "Menino da Crônica: começa com 90 Vida, 3 Escudo e 30 Honra. A vila o acolheu quando ele chegou órfão; hoje, ele registra a história de quem o recebeu.",
    heroi_do_povo:
      "Heroína do povo: começa com 5 Ataque e 5 Escudo. A honra dela nunca cai e nunca fica negativa — nem sob a espada da verdade nem sob o chamado do culto.",
  };
  const retratos = {
    corajoso: { arquivo: "corajoso", descricao: "Busto da herdeira corajosa" },
    avarento: { arquivo: "avarento", descricao: "Busto do herdeiro avarento" },
    doente: { arquivo: "doente", descricao: "Busto do herdeiro doente" },
    druida_herdeiro: {
      arquivo: "druida-herdeiro",
      descricao: "Druida-Herdeiro maduro, de barba grisalha e cajado do cervo",
    },
    menino_cronista: { arquivo: "menino-cronista", descricao: "Busto do Menino da Crônica" },
    heroi_do_povo: { arquivo: "heroi-do-povo", descricao: "Busto da Heroína do povo" },
    herdeiro_culto: {
      arquivo: "herdeiro-culto",
      descricao: "Busto do Herdeiro do Culto",
      faixas: ["neutra", "baixa", "baixa-2", "baixissima"],
    },
    herdeira_leste: { arquivo: "herdeira-leste", descricao: "Busto da Herdeira do Leste" },
    herdeiro_nordico: { arquivo: "herdeiro-nordico", descricao: "Busto do Herdeiro Nórdico" },
    coringa: {
      arquivo: null,
      placeholder: "assets/eventos-pessoas/mensageiro-sem-carta.webp",
      descricao: "Retrato temporário do Coringa",
    },
    bruxo: {
      arquivo: null,
      placeholder: "assets/eventos-pessoas/bruxa.webp",
      descricao: "Retrato temporário da Bruxa",
    },
  };
  const fasesRetrato = {
    neutra: "com honra neutra",
    alta: "com honra alta",
    "alta-2": "com honra muito alta",
    altissima: "com honra extremamente alta",
    baixa: "com honra baixa",
    "baixa-2": "com honra muito baixa",
    baixissima: "com honra extremamente baixa",
  };
  const nomesEstacao = { primavera: "Primavera", verao: "Verão", outono: "Outono", inverno: "Inverno" };
  function categoriaVisualEvento(evento) {
    if (evento.batalha || evento.tipo === "batalha") return { classe: "batalha", nome: "Batalha" };
    if (evento.mercadorias || evento.tipo === "mercador") return { classe: "mercador", nome: "Mercador" };
    if (evento.pacto) return { classe: "pacto", nome: "Pacto" };
    if (evento.requisitos?.estacao) return { classe: "sazonal", nome: "Sazonal" };
    const tipos = {
      achado: { classe: "achado", nome: "Achado" },
      desordem: { classe: "desordem", nome: "Desordem" },
      especial: { classe: "especial", nome: "Especial" },
      culto: { classe: "culto", nome: "Culto" },
      sobrenatural: { classe: "sobrenatural", nome: "Sobrenatural" },
      letal: { classe: "letal", nome: "Letal" },
      mandatorio: { classe: "mandatorio", nome: "Obrigatório" },
      derrota: { classe: "derrota", nome: "Derrota" },
    };
    return tipos[evento.tipo] || { classe: "encontro", nome: "Encontro" };
  }
  const nomesConstrucoes = {
    ponte: { nome: "Ponte", bonus: "+1 gold na renda a cada 3 rodadas, com pelo menos 20 habitantes" },
    moinho: { nome: "Moinho", bonus: "+1 HP ao iniciar cada rodada" },
    capela: { nome: "Capela", bonus: "+1 Escudo ao ser erguida" },
    forja: { nome: "Forja", bonus: "−2 gold na arma melhorada" },
    muralha: { nome: "Muralha", bonus: "−2 de dano sofrido em batalhas" },
    mercado_coberto: { nome: "Mercado coberto", bonus: "+1 Gold a cada 5 rodadas" },
    cisterna_comunitaria: {
      nome: "Cisterna comunitária",
      bonus: "+1 Habitante a cada 3 rodadas, começando 3 rodadas depois da obra",
    },
    entreposto_comercial: {
      nome: "Entreposto comercial",
      bonus: "+1 Gold a cada 2 rodadas, começando 2 rodadas depois da obra",
    },
    torre_vigia: { nome: "Torre de vigia", bonus: "Reduz em 3 o dano sofrido em batalhas" },
    enfermaria_ervateira: {
      nome: "Enfermaria da ervateira",
      bonus: "+1 Vida por rodada enquanto a Vida estiver abaixo de 60",
    },
    praca_forca: {
      nome: "Praça da Forca",
      bonus: "+1 Gold a cada 6 rodadas; −1 Honra a cada 10; com culto ativo, +2 Seguidores a cada 10",
    },
    celeiro: {
      nome: "Celeiro",
      bonus: "Reduz pela metade as perdas de habitantes em eventos de fome e seca",
    },
  };
  const nomesAtributosEfeito = {
    hp: "Vida",
    escudo: "Escudo",
    ataque: "Ataque",
    honra: "Honra",
    habitantes: "Habitantes",
    gold: "Ouro",
  };
  const beneficiosConstrucoes = {
    ponte: "+1 Gold na renda",
    moinho: "+1 Vida por rodada",
    capela: "+1 Escudo",
    forja: "−2 Gold na arma melhorada",
    muralha: "−2 dano em batalha",
    mercado_coberto: "+1 Gold a cada 5 rodadas",
    cisterna_comunitaria: "+1 Habitante a cada 3 rodadas",
    entreposto_comercial: "+1 Gold a cada 2 rodadas",
    torre_vigia: "−3 dano em batalha",
    enfermaria_ervateira: "+1 Vida abaixo de 60",
    praca_forca: "+1 Gold a cada 6 rodadas",
    celeiro: "Metade das perdas por fome e seca",
  };
  const chaveTutorial = "herdeiro_tutorial_v1";
  const etapasTutorial = [
    {
      seletor: ".evento-leitura",
      titulo: "Leia antes de escolher",
      texto:
        "Leia o acontecimento antes de responder. Você pode concluir a escrita com um toque ou mudar a velocidade pelo controle Aa.",
    },
    {
      seletor: ".coluna-escolhas",
      titulo: "Faça uma escolha",
      texto:
        "Escolha uma opção para resolver o evento. Depois de ler o desfecho, avance para a rodada seguinte.",
    },
    {
      seletor: ".atributos",
      titulo: "Cuide do herdeiro",
      texto:
        "Vida mantém você na crônica. O Escudo reduz o dano recebido, e o Ataque define sua força nos combates.",
    },
    {
      seletor: '[data-atributo="honra"]',
      titulo: "A Honra deixa marcas",
      texto:
        "Suas decisões mudam a Honra. Ela altera o retrato e pode abrir novas escolhas em certos eventos.",
    },
    {
      seletor: ".recursos-vila",
      titulo: "Administre a vila",
      texto:
        "Habitantes mostram o tamanho da vila. Você usa Gold em compras e construções; algumas escolhas mudam esses valores.",
    },
    {
      seletor: '[data-acao="alternar-construcoes"]',
      titulo: "Acompanhe as obras",
      texto:
        "Abra o mapa para consultar e selecionar uma construção. Melhorias exigem seis dias de intervalo; você pode pagar Gold ou reunir artesãos. A ajuda comunitária fica pronta após três dias. Consultar e concluir trabalhos não passa o dia.",
    },
    {
      seletor: '[data-acao="alternar-inventario"]',
      titulo: "Use o inventário",
      texto:
        "Os itens conquistados ficam no inventário. Alguns têm efeito passivo; outros podem ser usados pelo botão ao lado.",
    },
  ];
  let retratoExibido = null;
  let imagemEventoPrecarregadaSrc = "";
  let imagemEventoPrecarregada = null;
  let ajustePendente = 0;
  let etapaTutorial = null;
  let tutorialForcado = false;
  let tutorialConcluidoNestaSessao = false;
  let camadaTutorial = null;
  let alvoTutorial = null;
  let cronicaTutorial = null;
  let cronicaInerteOriginal = false;
  let temporizadorTextoEvento = 0;
  let completarTextoAtivo = null;
  let retomarTextoAtivo = null;
  function alternarTextoAutomatico() {
    return Jogo.ui.alternarVelocidadeTexto() !== "imediato";
  }
  function atualizarControleTexto() {
    const animado = Jogo.ui?.preferenciaTexto?.() !== "imediato";
    const rotulo = animado ? "Texto com animação de escrita" : "Texto direto na tela";
    const controle = document.querySelector("#alternar-texto-automatico");
    if (controle) {
      controle.setAttribute("aria-pressed", String(animado));
      controle.textContent = rotulo;
    }
    for (const botao of document.querySelectorAll('[data-acao="velocidade-texto"]')) {
      botao.setAttribute("aria-pressed", String(animado));
      botao.setAttribute("aria-label", rotulo);
      botao.title = rotulo;
    }
  }
  document.querySelector("#alternar-texto-automatico")?.addEventListener("click", alternarTextoAutomatico);
  atualizarControleTexto();
  const filaConquistas = [];
  let conquistaEmExibicao = false;

  function exibirProximaConquista() {
    const painel = document.querySelector("[data-notificacoes-conquistas]");
    if (!painel || conquistaEmExibicao || !filaConquistas.length) return;
    const conquista = filaConquistas.shift();
    conquistaEmExibicao = true;
    painel.innerHTML = `<button type="button" class="conquista-aviso conquista-aviso-fechar" data-conquista="${esc(conquista.id)}" aria-label="${conquista.previa ? "Prévia de conquista" : "Conquista desbloqueada"}: ${esc(conquista.nome)}. Dispensar aviso.">
      <span class="conquista-aviso-luz" aria-hidden="true"></span>
      <span class="conquista-aviso-selo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2 14.8 8.5 22 9l-5.5 4.8 1.7 7.2-6.2-3.8-6.2 3.8 1.7-7.2L2 9l7.2-.5L12 2Z"/></svg></span>
      <span class="conquista-aviso-texto"><small>${conquista.previa ? "Prévia de conquista" : "Conquista desbloqueada"}</small><strong>${esc(conquista.nome)}</strong><span>${conquista.previa ? "Exemplo de aviso" : "Registrada na memória da linhagem"}</span></span><span class="conquista-aviso-dispensar" aria-hidden="true">×</span>
    </button>`;
    const cartao = painel.querySelector(".conquista-aviso");
    let temporizador = 0;
    let encerrando = false;
    const fechar = () => {
      if (encerrando) return;
      encerrando = true;
      window.clearTimeout(temporizador);
      const estilo = window.getComputedStyle(cartao);
      cartao.style.setProperty("--conquista-saida-opacidade", estilo.opacity);
      cartao.style.setProperty("--conquista-saida-transform", estilo.transform);
      cartao.classList.add("conquista-aviso--saindo");
      const movimentoReduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const remover = () => {
        window.clearTimeout(temporizador);
        cartao.removeEventListener("animationend", aoTerminarSaida);
        const tinhaFoco = cartao.contains(document.activeElement);
        cartao.remove();
        conquistaEmExibicao = false;
        if (tinhaFoco) app.focus({ preventScroll: true });
        exibirProximaConquista();
      };
      const aoTerminarSaida = (evento) => {
        if (evento.target === cartao && evento.animationName === "conquista-sair") remover();
      };
      cartao.addEventListener("animationend", aoTerminarSaida);
      temporizador = window.setTimeout(remover, movimentoReduzido ? 0 : 400);
    };
    cartao.addEventListener("click", fechar);
    temporizador = window.setTimeout(fechar, 3000);
  }

  function notificarConquistas(run, salvarAvisos = run.status === "ativa") {
    if (!run.avisosConquistas?.length || !document.querySelector("[data-notificacoes-conquistas]")) return;
    const novas = [...new Set(run.avisosConquistas)]
      .map((id) => Jogo.conquistas?.lista.find((conquista) => conquista.id === id))
      .filter(Boolean);
    run.avisosConquistas = [];
    if (salvarAvisos) Jogo.save?.gravarRun(run);
    filaConquistas.push(...novas);
    exibirProximaConquista();
  }

  function preverConquista() {
    if (!modoDebug()) return false;
    const conquista = Jogo.conquistas?.lista.find((item) => item.id === "sobreviver_100");
    if (!conquista) return false;
    filaConquistas.push({ ...conquista, id: "debug-conquista", previa: true });
    exibirProximaConquista();
    return true;
  }

  function ajustarTela() {
    window.cancelAnimationFrame(ajustePendente);
    ajustePendente = window.requestAnimationFrame(() => {
      const cronica = app.querySelector(".cronica");
      if (!cronica) return;
      cronica.style.removeProperty("--altura-cartas");
      cronica.style.removeProperty("--fator-texto");
      if (window.matchMedia?.("(max-width: 900px)").matches) return;
      const mesa = cronica.querySelector(".mesa");
      const limite = app.getBoundingClientRect().bottom;
      const excesso = () => Math.max(0, mesa.getBoundingClientRect().bottom - limite);
      let altura = cronica.querySelector(".carta").getBoundingClientRect().height;
      // Primeiro reduz somente as artes, mantendo ambas iguais e em 3:4.
      for (let tentativa = 0; tentativa < 8 && excesso() > 1 && altura > 36; tentativa++) {
        altura = Math.max(36, altura - excesso() - 2);
        cronica.style.setProperty("--altura-cartas", `${altura}px`);
      }
      // Em telas muito baixas, compacta o texto sem esconder informações da decisão.
      for (const fator of [0.96, 0.92, 0.88]) {
        if (excesso() <= 1) break;
        cronica.style.setProperty("--fator-texto", fator);
      }
    });
  }

  function alinharIdentificacaoComMoldura() {
    const identificacao = app.querySelector(".titulo-run-identificacao");
    const moldura = app.querySelector(".carta-herdeiro");
    if (!identificacao || !moldura) return;
    identificacao.style.removeProperty("transform");
    if (!moldura.getClientRects().length) return;
    const deslocamento = moldura.getBoundingClientRect().left - identificacao.getBoundingClientRect().left;
    identificacao.style.transform = `translateX(${deslocamento}px)`;
  }

  function mostrar(html, tela, contextoMusica = tela === "intro" ? "intro" : "menu") {
    if (temporizadorTextoEvento) window.clearInterval(temporizadorTextoEvento);
    temporizadorTextoEvento = 0;
    completarTextoAtivo = null;
    retomarTextoAtivo = null;
    if (tela !== "jogo") retratoExibido = null;
    app.innerHTML = html;
    fecharDicaItem();
    destacarItens();
    document.body.dataset.tela = tela;
    if (tela !== "jogo") Jogo.audio?.definirDucking(false);
    Jogo.audio?.definirContexto(contextoMusica);
    app.focus({ preventScroll: true });
    ajustarTela();
  }

  function completarTextoEvento(tecla = null) {
    if (!completarTextoAtivo) return false;
    if (
      tecla !== null &&
      tecla !== "Enter" &&
      tecla !== " " &&
      tecla !== "Spacebar" &&
      !/^[1-9]$/.test(tecla)
    )
      return false;
    completarTextoAtivo();
    return true;
  }

  function digitarTextoEvento(texto, animar) {
    const visual = app.querySelector("[data-texto-visual]");
    const decisao = app.querySelector("[data-decisao-evento]");
    const aviso = app.querySelector("[data-opcoes-disponiveis]");
    if (!visual || !decisao || !animar) return;
    const caracteres = Array.from(texto);
    let indice = 0;
    const completar = () => {
      if (temporizadorTextoEvento) window.clearInterval(temporizadorTextoEvento);
      temporizadorTextoEvento = 0;
      visual.textContent = texto;
      destacarItens(visual);
      decisao.hidden = false;
      decisao.classList.add("decisao-evento--pronta");
      if (aviso) aviso.hidden = false;
      completarTextoAtivo = null;
      retomarTextoAtivo = null;
      ajustarTela();
    };
    completarTextoAtivo = completar;
    retomarTextoAtivo = () => {
      if (Jogo.ui.preferenciaTexto?.() === "imediato") {
        completar();
        return;
      }
      temporizadorTextoEvento = window.setInterval(
        () => {
          indice += 1;
          visual.textContent = caracteres.slice(0, indice).join("");
          if (indice >= caracteres.length) completar();
        },
        Math.min(30, 4000 / Math.max(1, caracteres.length)),
      );
    };
    retomarTextoAtivo();
  }

  function tutorialFoiConcluido() {
    try {
      return window.localStorage.getItem(chaveTutorial) === "concluido";
    } catch {
      return false;
    }
  }

  function limparTutorial() {
    if (alvoTutorial) alvoTutorial.classList.remove("tutorial-alvo");
    if (cronicaTutorial) cronicaTutorial.inert = cronicaInerteOriginal;
    camadaTutorial?.remove();
    alvoTutorial = null;
    cronicaTutorial = null;
    camadaTutorial = null;
  }

  function encerrarTutorial() {
    limparTutorial();
    etapaTutorial = null;
    tutorialConcluidoNestaSessao = true;
    try {
      window.localStorage.setItem(chaveTutorial, "concluido");
    } catch {
      /* O tutorial continua disponível nesta sessão. */
    }
    app.focus({ preventScroll: true });
  }

  function posicionarTutorial(painel, alvo) {
    const margem = 16;
    const viewport = window.visualViewport;
    const largura = viewport?.width || window.innerWidth;
    const altura = viewport?.height || window.innerHeight;
    const topoViewport = viewport?.offsetTop || 0;
    const caixaAlvo = alvo.getBoundingClientRect();
    const caixaPainel = painel.getBoundingClientRect();
    const x = Math.min(
      largura - caixaPainel.width - margem,
      Math.max(margem, caixaAlvo.left + caixaAlvo.width / 2 - caixaPainel.width / 2),
    );
    const espacoAbaixo = topoViewport + altura - caixaAlvo.bottom;
    const espacoAcima = caixaAlvo.top - topoViewport;
    const abaixo = espacoAbaixo >= caixaPainel.height + margem || espacoAbaixo >= espacoAcima;
    const yPreferido = abaixo ? caixaAlvo.bottom + margem : caixaAlvo.top - caixaPainel.height - margem;
    const y = Math.min(
      topoViewport + altura - caixaPainel.height - margem,
      Math.max(topoViewport + margem, yPreferido),
    );
    painel.style.left = `${x}px`;
    painel.style.top = `${y}px`;
  }

  function desenharEtapaTutorial() {
    limparTutorial();
    const etapa = etapasTutorial[etapaTutorial];
    if (!etapa) {
      encerrarTutorial();
      return;
    }
    const seletorAlvo =
      etapaTutorial === 0 && app.querySelector(".cronica--resultado")
        ? ".resultado"
        : etapaTutorial === 0 && app.querySelector(".cronica--decisao-culto")
          ? ".decisao-culto"
          : etapa.seletor;
    const alvo = app.querySelector(seletorAlvo);
    if (!alvo) {
      encerrarTutorial();
      return;
    }

    alvoTutorial = alvo;
    alvo.classList.add("tutorial-alvo");
    cronicaTutorial = app.querySelector(".cronica");
    cronicaInerteOriginal = Boolean(cronicaTutorial?.inert);
    if (cronicaTutorial) cronicaTutorial.inert = true;

    const camada = document.createElement("div");
    camada.className = "tutorial-camada";
    camada.innerHTML = `<div class="tutorial-escurecimento" aria-hidden="true"></div>
      <div class="tutorial-bloqueio" aria-hidden="true"></div>
      <section class="tutorial-painel" role="dialog" aria-modal="true" aria-labelledby="tutorial-titulo" aria-describedby="tutorial-texto" tabindex="-1">
        <p class="tutorial-contagem">Tutorial · ${etapaTutorial + 1} de ${etapasTutorial.length}</p>
        <div class="tutorial-progresso" aria-hidden="true">${etapasTutorial.map((_, indice) => `<span${indice <= etapaTutorial ? ' class="ativo"' : ""}></span>`).join("")}</div>
        <h2 id="tutorial-titulo">${esc(etapa.titulo)}</h2>
        <p id="tutorial-texto">${esc(etapa.texto)}</p>
        <div class="tutorial-acoes">
          <button class="botao" type="button" data-tutorial-combate>Ajuda de combate</button>
          <button class="botao tutorial-voltar" type="button" data-tutorial-voltar ${etapaTutorial === 0 ? "disabled" : ""}>Voltar</button>
          <button class="botao tutorial-pular" type="button" data-tutorial-pular>Pular tutorial</button>
          <button class="botao primario tutorial-avancar" type="button" data-tutorial-avancar>${etapaTutorial === etapasTutorial.length - 1 ? "Concluir" : "Próximo"}</button>
        </div>
      </section>`;
    camadaTutorial = camada;
    app.append(camada);

    const painel = camada.querySelector(".tutorial-painel");
    const posicionar = () => posicionarTutorial(painel, alvo);
    posicionar();
    window.requestAnimationFrame(posicionar);
    camada.addEventListener("click", (evento) => {
      evento.stopPropagation();
      const botao = evento.target.closest("button");
      if (!botao || botao.disabled) return;
      if (botao.hasAttribute("data-tutorial-combate")) {
        Jogo.ui.tutorialCombate?.();
        return;
      }
      if (botao.hasAttribute("data-tutorial-pular")) {
        encerrarTutorial();
        return;
      }
      if (botao.hasAttribute("data-tutorial-voltar")) etapaTutorial = Math.max(0, etapaTutorial - 1);
      else if (botao.hasAttribute("data-tutorial-avancar")) {
        if (etapaTutorial === etapasTutorial.length - 1) {
          encerrarTutorial();
          return;
        }
        etapaTutorial++;
      } else return;
      desenharEtapaTutorial();
    });
    camada.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        encerrarTutorial();
        return;
      }
      if (evento.key !== "Tab") return;
      const botoes = [...painel.querySelectorAll("button:not(:disabled)")];
      const primeiro = botoes[0];
      const ultimo = botoes[botoes.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    });
    painel.querySelector("[data-tutorial-avancar]").focus({ preventScroll: true });
  }

  function tutorial() {
    if (!app.querySelector(".cronica")) {
      tutorialForcado = true;
      return;
    }
    etapaTutorial = 0;
    desenharEtapaTutorial();
  }

  function descricaoDaCondicao(id, abracada) {
    if (!abracada) return condicaoDescricoes[id];
    return (
      {
        licantropia: "+4 Ataque · recupera 1 Vida por rodada",
        vampirismo: "+5 Ataque · +4 Escudo · não perde Vida por rodada nem recebe Sede de sangue",
        possessao: "+5 Ataque · +3 Escudo · revela a Honra das escolhas",
      }[id] || condicaoDescricoes[id]
    );
  }

  function mostrarDetalhesCondicao(run) {
    const id = run?.condicao?.ativa;
    if (!id || !condicaoDescricoes[id]) return;
    const abracada = Boolean(run.condicao.abracada);
    const dialogo = document.createElement("dialog");
    dialogo.className = "condicao-dialogo";
    dialogo.setAttribute("aria-labelledby", "titulo-detalhe-condicao");
    dialogo.innerHTML = `<div class="condicao-dialogo-cabecalho"><h2 id="titulo-detalhe-condicao">${esc(condicaoNomes[id])} ${abracada ? "abraçada" : "ativa"}</h2><button class="controle-honra" type="button" data-fechar-condicao aria-label="Fechar detalhes">×</button></div>
      <p>${esc(descricaoDaCondicao(id, abracada))}</p>
      <p class="condicao-dialogo-ajuda">Toque no retrato do herdeiro para consultar esta condição novamente.</p>`;
    document.body.append(dialogo);
    dialogo.addEventListener("click", (evento) => {
      if (evento.target === dialogo || evento.target.closest("[data-fechar-condicao]")) dialogo.close();
    });
    dialogo.addEventListener("close", () => dialogo.remove(), { once: true });
    dialogo.showModal();
  }

  function modoDebug() {
    return debugRevelado;
  }

  function alternarDebug() {
    debugRevelado = !debugRevelado;
    document.body.classList.toggle("debug-visivel", debugRevelado);
    return debugRevelado;
  }

  function menu(run, focarLegado = false) {
    mostrar(
      `
      <section class="abertura" aria-labelledby="titulo-inicio">
        <button type="button" class="abertura-arte" data-acao="debug-alternar" aria-pressed="${modoDebug()}" aria-label="Imagem da vila: clique para ${modoDebug() ? "ocultar" : "mostrar"} os controles de debug"><img src="assets/vila.webp" alt="Uma vila medieval sob a vigília de um castelo" width="1024" height="1024"></button>
        <div class="abertura-texto">
          <h1 id="titulo-inicio">A maldição do Herdeiro</h1>
          <div class="acoes-menu">
            <button class="botao primario" data-acao="iniciar">Iniciar</button>
            <button class="botao" data-acao="carregar" ${run ? "" : "disabled"}>Carregar${run ? ` <span>Rodada ${numero(run.rodada)}</span>` : ""}</button>
            <button id="abrir-legado" class="botao painel-legado-abrir" data-acao="abrir-legado">Conquistas</button>
            <button class="botao" data-acao="tutorial">Como jogar</button>
            <details class="painel-backup">
              <summary>Backup de progresso</summary>
              <div><button class="botao" data-acao="exportar-progresso">Exportar arquivo</button><button class="botao" data-acao="importar-progresso">Importar arquivo</button></div>
            </details>
            <input id="importar-progresso-arquivo" type="file" accept="application/json,.json" hidden>
            <button class="botao debug-druida-menu" data-acao="debug-liberar-personagens">Liberar personagens</button>
            <button class="botao debug-transformacoes-menu" data-acao="debug-transformacoes">Debug: ver transformações</button>
            <button class="botao debug-conquista-menu testes-debug" data-acao="debug-conquista">Debug: animação de conquista</button>
          </div>
          <p class="nota">${run ? "Há uma história esperando por você." : "Sua primeira história ainda não foi escrita."}</p>
        </div>
      </section>`,
      "inicio",
    );
    if (focarLegado) document.getElementById("abrir-legado")?.focus({ preventScroll: true });
  }

  function painelLegado(legado = Jogo.save.lerLegado()) {
    const conquistas = Jogo.conquistas?.lista || [];
    const idsConhecidos = new Set(conquistas.map((conquista) => conquista.id));
    const desbloqueadas = new Set(
      (legado.conquistasDesbloqueadas || []).filter((id) => idsConhecidos.has(id)),
    );
    const eventos = Jogo.eventos.filter((evento) => legado.eventos.includes(evento.id));
    const itens = Jogo.itens.filter((item) => legado.itens.includes(item.id));
    const melhoresRuns = legado.melhoresRuns || [];
    const percentual = conquistas.length ? Math.round((desbloqueadas.size / conquistas.length) * 100) : 0;
    const normalizarBusca = (texto) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .trim();
    const categorias = [
      { id: "cronicas", titulo: "Crônicas" },
      { id: "herdeiros", titulo: "Herdeiros" },
      { id: "historias", titulo: "Histórias e encontros" },
      { id: "pressagios", titulo: "Maus Presságios" },
      { id: "transformacoes", titulo: "Transformações" },
      { id: "vila", titulo: "Vila e recursos" },
      { id: "combate", titulo: "Combate" },
    ];
    const historias = new Set([
      "cronica_abissal",
      "entidade_resolvida",
      "resistir_entidade",
      "calice_concluido",
      "culto_concluido",
      "bosque_vivo",
      "menino_conselheiro",
      "todos_zodiacos",
      "todos_deuses_nordicos",
    ]);
    const daVila = new Set([
      "cinco_estruturas",
      "todas_estruturas",
      "cinco_compras_diferentes",
      "tres_raridades",
      "ponte_e_caravana",
      "ponte_sem_pedagio",
    ]);
    const dosHerdeiros = new Set([
      "fortuna_do_leste",
      "chamado_nordico",
      "culto_adaga_herdeiro",
      "leste_duas_estacoes",
      "nordico_duas_faces",
      "vitorias_com_todos_herdeiros",
      "companheiros_druida",
      "heroi_do_povo_chamado",
    ]);
    const categoriaDaConquista = (conquista) => {
      if (categorias.some((categoria) => categoria.id === conquista.categoria)) return conquista.categoria;
      const id = conquista.id;
      if (id.startsWith("condicao_") || ["primeira_transformacao", "todas_transformacoes"].includes(id))
        return "transformacoes";
      if (
        /^(ataque|escudo|batalhas_vencidas|d20_natural|vitoria_com_desvantagem|vitoria_com_rerrolagem)_/.test(
          id,
        )
      )
        return "combate";
      if (/^(gold|habitantes|seguidores)_/.test(id) || daVila.has(id)) return "vila";
      if (historias.has(id)) return "historias";
      if (
        dosHerdeiros.has(id) ||
        id.includes("_vitoria_") ||
        (id.startsWith("vitoria_") && id !== "vitoria_sem_condicao")
      )
        return "herdeiros";
      return "cronicas";
    };
    const grupos = categorias
      .map((categoria) => ({
        ...categoria,
        conquistas: conquistas.filter((conquista) => categoriaDaConquista(conquista) === categoria.id),
      }))
      .filter((categoria) => categoria.conquistas.length)
      .map((categoria) => ({
        ...categoria,
        conquistadas: categoria.conquistas.filter((conquista) => desbloqueadas.has(conquista.id)).length,
      }));
    const listaConquistas = grupos
      .map((categoria) => {
        return `<section class="legado-categoria" data-categoria-conquistas="${categoria.id}" aria-labelledby="titulo-categoria-${categoria.id}">
          <header><h2 id="titulo-categoria-${categoria.id}">${categoria.titulo}</h2><div class="legado-categoria-progresso"><span>${categoria.conquistadas} de ${categoria.conquistas.length}</span><progress max="${categoria.conquistas.length}" value="${categoria.conquistadas}" aria-label="${categoria.conquistadas} de ${categoria.conquistas.length} conquistas em ${categoria.titulo}"></progress></div></header>
          <ul>${categoria.conquistas
            .map((conquista) => {
              const conquistada = desbloqueadas.has(conquista.id);
              return `<li class="legado-conquista ${conquistada ? "conquista-desbloqueada" : "conquista-pendente"}" data-conquista-item="${esc(conquista.id)}" data-conquista-estado="${conquistada ? "conquistadas" : "pendentes"}" data-conquista-categoria="${categoria.id}" data-conquista-busca="${esc(normalizarBusca(`${conquista.nome} ${conquista.descricao}`))}">
                <span class="legado-conquista-selo" aria-hidden="true">${conquistada ? '<svg viewBox="0 0 24 24"><path d="M12 2 14.8 8.5 22 9l-5.5 4.8 1.7 7.2-6.2-3.8-6.2 3.8 1.7-7.2L2 9l7.2-.5L12 2Z"/></svg>' : '<svg class="legado-cadeado" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg>'}</span>
                <div><div class="legado-conquista-status">${conquistada ? "Conquistada" : "Por conquistar"}</div><strong>${esc(conquista.nome)}</strong><p>${esc(conquista.descricao)}</p></div>
              </li>`;
            })
            .join("")}</ul>
        </section>`;
      })
      .join("");
    const objetivos = Jogo.objetivosLegado
      .map((objetivo) => {
        const concluido = legado.objetivosConcluidos.includes(objetivo.id);
        return `<li class="legado-objetivo ${concluido ? "objetivo-concluido" : "objetivo-pendente"}">
          <span class="legado-objetivo-selo" aria-hidden="true">${concluido ? '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>' : "◇"}</span>
          <div><strong>${esc(objetivo.nome || objetivo.id)}</strong><p>${esc(objetivo.descricao || "Objetivo de legado")}</p></div>
          <small>${concluido ? "Concluído" : "Pendente"}</small>
        </li>`;
      })
      .join("");
    const painelRecordes = melhoresRuns.length
      ? `<ol class="legado-recordes-lista">${melhoresRuns
          .slice(0, 5)
          .map(
            (registro, indice) =>
              `<li><span class="legado-recorde-posicao">${String(indice + 1).padStart(2, "0")}</span><div><strong>${esc(rotuloHerdeiro(registro.traco))}</strong><span>${numero(registro.habitantes)} habitantes · ${numero(registro.gold)} Gold</span></div><strong class="legado-recorde-pontos">${numero(registro.pontuacao)} <small>pontos</small></strong></li>`,
          )
          .join("")}</ol>`
      : `<p class="legado-vazio">Nenhuma crônica vitoriosa foi registrada ainda.</p>`;
    mostrar(
      `<section id="painel-legado" class="legado-tela" tabindex="-1" aria-labelledby="titulo-legado">
        <header class="legado-cabecalho"><h1 id="titulo-legado">Conquistas e legado</h1><button class="botao" data-acao="voltar-legado" aria-label="Voltar ao início"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18"/></svg><span class="legado-voltar-texto">Voltar ao início</span></button></header>
        <div class="legado-abas" role="tablist" aria-label="Seções da memória da linhagem">
          <button id="aba-conquistas" class="legado-aba" type="button" role="tab" aria-selected="true" aria-controls="painel-conquistas" tabindex="0">Conquistas <span>${desbloqueadas.size}/${conquistas.length}</span></button>
          <button id="aba-jornada" class="legado-aba" type="button" role="tab" aria-selected="false" aria-controls="painel-jornada" tabindex="-1">Jornada</button>
          <button id="aba-recordes" class="legado-aba" type="button" role="tab" aria-selected="false" aria-controls="painel-recordes" tabindex="-1">Recordes</button>
        </div>
        <section id="painel-conquistas" class="legado-painel" role="tabpanel" tabindex="0" aria-labelledby="aba-conquistas">
          <div class="legado-progresso"><div><p class="nota">Conquistas registradas</p><strong>${desbloqueadas.size}<span> / ${conquistas.length}</span></strong></div><div class="legado-progresso-barra"><span>${percentual}% da coleção</span><progress max="${Math.max(1, conquistas.length)}" value="${desbloqueadas.size}" aria-label="${desbloqueadas.size} de ${conquistas.length} conquistas"></progress></div><p>${numero(conquistas.length - desbloqueadas.size)} por conquistar. O progresso permanece entre as crônicas.</p></div>
          <div class="legado-colecao">
            <nav class="legado-categorias-nav" aria-label="Categorias de conquistas"><p>Categorias</p><button type="button" data-filtro-categoria="todas" aria-pressed="true"><span>Todas</span><small>${desbloqueadas.size} / ${conquistas.length}</small></button>${grupos.map((categoria) => `<button type="button" data-filtro-categoria="${categoria.id}" aria-pressed="false"><span>${categoria.titulo}</span><small>${categoria.conquistadas} / ${categoria.conquistas.length}</small></button>`).join("")}</nav>
            <div class="legado-colecao-conteudo">
              <div class="legado-filtros">
                <label class="legado-busca">Buscar conquista<input type="search" data-busca-conquistas placeholder="Nome ou condição" autocomplete="off" aria-controls="lista-conquistas"></label>
                <label class="legado-categoria-mobile">Categoria<select data-categoria-mobile aria-controls="lista-conquistas"><option value="todas">Todas as categorias</option>${grupos.map((categoria) => `<option value="${categoria.id}">${categoria.titulo}</option>`).join("")}</select></label>
                <label>Exibir<select data-estado-conquistas aria-controls="lista-conquistas"><option value="todas">Todas</option><option value="pendentes">Por conquistar</option><option value="conquistadas">Conquistadas</option></select></label>
              </div>
              <div class="legado-resultados"><p data-resultados-conquistas role="status" aria-live="polite" aria-atomic="true">${conquistas.length} conquistas</p><button type="button" data-limpar-conquistas hidden>Limpar filtros</button></div>
              <div id="lista-conquistas" class="legado-categorias">${listaConquistas}</div>
              <div class="legado-busca-vazia" data-conquistas-vazio ${conquistas.length ? "hidden" : ""}><h2>${conquistas.length ? "Nenhuma conquista encontrada" : "Nenhuma conquista cadastrada"}</h2><p>${conquistas.length ? "Tente outro termo ou limpe os filtros." : "As conquistas aparecerão aqui quando forem definidas."}</p>${conquistas.length ? '<button class="botao" type="button" data-limpar-conquistas>Limpar filtros</button>' : ""}</div>
            </div>
          </div>
        </section>
        <section id="painel-jornada" class="legado-painel" role="tabpanel" tabindex="0" aria-labelledby="aba-jornada" hidden>
          <div class="legado-jornada-grade">
            <section class="legado-bloco"><header><div><p class="nota">Metas de linhagem</p><h2>Objetivos</h2></div><span>${legado.objetivosConcluidos.length}/${Jogo.objetivosLegado.length}</span></header><ul class="legado-objetivos">${objetivos || `<li class="legado-vazio">Nenhum objetivo cadastrado.</li>`}</ul></section>
            <section class="legado-bloco"><header><div><p class="nota">O que permanece</p><h2>Desbloqueios</h2></div><span>${eventos.length + itens.length} registros</span></header>
              <div class="legado-desbloqueios-resumo"><div><strong>${eventos.length}</strong><span>eventos</span></div><div><strong>${itens.length}</strong><span>itens</span></div><div><strong>${legado.flags.druida_herdeiro ? "Sim" : "Não"}</strong><span>Druida-Herdeiro</span></div></div>
              <div class="legado-desbloqueios-grade"><section><h3>Eventos</h3>${eventos.length ? `<ul>${eventos.map((evento) => `<li><span>Evento</span><strong>${esc(evento.titulo)}</strong></li>`).join("")}</ul>` : `<p class="legado-vazio">Nenhum evento desbloqueado.</p>`}</section><section><h3>Itens</h3>${itens.length ? `<ul>${itens.map((item) => `<li><span>Item</span><strong>${esc(item.nome)}</strong></li>`).join("")}</ul>` : `<p class="legado-vazio">Nenhum item desbloqueado.</p>`}</section></div>
            </section>
          </div>
        </section>
        <section id="painel-recordes" class="legado-painel" role="tabpanel" tabindex="0" aria-labelledby="aba-recordes" hidden><div class="legado-bloco legado-recordes"><header><div><p class="nota">As crônicas que chegaram mais longe</p><h2>Recordes</h2></div><span>Até 5 entradas</span></header>${painelRecordes}</div></section>
      </section>`,
      "legado",
    );
    const painel = document.getElementById("painel-legado");
    const abas = [...(painel?.querySelectorAll?.('[role="tab"]') || [])];
    const paineis = [...(painel?.querySelectorAll?.('[role="tabpanel"]') || [])];
    const selecionarAba = (aba, focar = false) => {
      for (const candidata of abas) {
        const selecionada = candidata === aba;
        candidata.setAttribute("aria-selected", String(selecionada));
        candidata.tabIndex = selecionada ? 0 : -1;
      }
      for (const conteudo of paineis) conteudo.hidden = conteudo.id !== aba?.getAttribute("aria-controls");
      if (focar) aba?.focus();
    };
    for (const aba of abas) {
      aba.addEventListener("click", () => selecionarAba(aba));
      aba.addEventListener("keydown", (evento) => {
        const indice = abas.indexOf(aba);
        const proximo =
          evento.key === "ArrowRight"
            ? (indice + 1) % abas.length
            : evento.key === "ArrowLeft"
              ? (indice - 1 + abas.length) % abas.length
              : evento.key === "Home"
                ? 0
                : evento.key === "End"
                  ? abas.length - 1
                  : -1;
        if (proximo < 0) return;
        evento.preventDefault();
        selecionarAba(abas[proximo], true);
      });
    }
    const busca = painel?.querySelector("[data-busca-conquistas]");
    const estado = painel?.querySelector("[data-estado-conquistas]");
    const categoriaMobile = painel?.querySelector("[data-categoria-mobile]");
    if (busca && estado && categoriaMobile) {
      let categoriaSelecionada = "todas";
      const cartoes = [...painel.querySelectorAll("[data-conquista-item]")];
      const secoes = [...painel.querySelectorAll("[data-categoria-conquistas]")];
      const botoesCategoria = [...painel.querySelectorAll("[data-filtro-categoria]")];
      const limpar = [...painel.querySelectorAll("[data-limpar-conquistas]")];
      const contador = painel.querySelector("[data-resultados-conquistas]");
      const vazio = painel.querySelector("[data-conquistas-vazio]");
      const filtrar = () => {
        const termos = normalizarBusca(busca.value).split(/\s+/).filter(Boolean);
        let total = 0;
        for (const cartao of cartoes) {
          const visivel =
            (categoriaSelecionada === "todas" ||
              cartao.dataset.conquistaCategoria === categoriaSelecionada) &&
            (estado.value === "todas" || cartao.dataset.conquistaEstado === estado.value) &&
            termos.every((termo) => cartao.dataset.conquistaBusca.includes(termo));
          cartao.hidden = !visivel;
          if (visivel) total++;
        }
        for (const secao of secoes)
          secao.hidden = !secao.querySelector("[data-conquista-item]:not([hidden])");
        for (const botao of botoesCategoria)
          botao.setAttribute("aria-pressed", String(botao.dataset.filtroCategoria === categoriaSelecionada));
        categoriaMobile.value = categoriaSelecionada;
        contador.textContent = `${numero(total)} ${total === 1 ? "conquista" : "conquistas"}`;
        vazio.hidden = total > 0;
        limpar[0].hidden = !termos.length && categoriaSelecionada === "todas" && estado.value === "todas";
      };
      busca.addEventListener("input", filtrar);
      estado.addEventListener("change", filtrar);
      categoriaMobile.addEventListener("change", () => {
        categoriaSelecionada = categoriaMobile.value;
        filtrar();
      });
      for (const botao of botoesCategoria)
        botao.addEventListener("click", () => {
          categoriaSelecionada = botao.dataset.filtroCategoria;
          filtrar();
          painel.scrollTop = 0;
        });
      for (const botao of limpar)
        botao.addEventListener("click", () => {
          busca.value = "";
          estado.value = "todas";
          categoriaSelecionada = "todas";
          filtrar();
          busca.focus({ preventScroll: true });
        });
      filtrar();
    }
    document.getElementById("painel-legado")?.focus({ preventScroll: true });
    window.scrollTo?.(0, 0);
  }
  function escolherHerdeiro(legado) {
    const disponiveis = new Set(Jogo.estado.tracosDisponiveis(legado));
    const opcoesHerdeiro = [
      {
        traco: "corajoso",
        nome: "A Herdeira Corajosa",
        descricao: "3 Ataque base e +2 nas rolagens de batalha.",
        imagem: "corajoso",
      },
      {
        traco: "avarento",
        nome: "O Herdeiro Avarento",
        descricao: "Começa com 10 Gold.",
        imagem: "avarento",
      },
      {
        traco: "doente",
        nome: "O Herdeiro Doente",
        descricao: "Começa com 90 Vida e 4 Escudo. Reduz a Defesa inimiga em 2.",
        imagem: "doente",
      },
      {
        traco: "druida_herdeiro",
        nome: "O Filho da Floresta",
        descricao:
          "Começa com 110 Vida, 4 Ataque, 2 Escudo e 3 Gold. O Cajado de Carvalho Vivo dá +2 Ataque e ganha +1 em cada primavera a partir do segundo ano, até +5. A cada rodada, um companheiro aleatório concede uma passiva: Lobo dá +2 Ataque em batalhas; Raposa dá +1 dado; Corvo revela o tipo do evento e a Honra de uma opção; Cervo recupera 3 Vida, ou 4 com a Máscara do Cervo.",
        imagem: "druida-herdeiro",
      },
      {
        traco: "menino_cronista",
        nome: "O Menino da Crônica",
        descricao:
          "Começa com 90 Vida, 3 Escudo e 30 Honra. A vila o acolheu quando chegou órfão; hoje, ele é seu conselheiro.",
        imagem: "menino-cronista",
      },
      {
        traco: "heroi_do_povo",
        nome: "A Heroína do povo",
        descricao: "Começa com 5 Ataque e 5 Escudo. Sua Honra não diminui nem fica abaixo de zero.",
        imagem: "heroi-do-povo",
      },
      ...Object.entries(Jogo.herdeiros.novos).map(([traco, h]) => ({
        traco,
        nome: h.nome,
        descricao: h.descricao,
        imagem: retratos[traco]?.placeholder || retratos[traco]?.arquivo || null,
      })),
    ];
    const dicasTraco = {
      ...Object.fromEntries(Object.entries(Jogo.herdeiros.novos).map(([id, h]) => [id, h.desbloqueio])),
      menino_cronista: "Acolha o órfão com Honra e permita que ele se torne conselheiro.",
      heroi_do_povo: "Alcance 400 de Honra em uma crônica.",
    };
    mostrar(
      `<section class="selecao-herdeiro" aria-labelledby="titulo-selecao-herdeiro">
        <div class="selecao-herdeiro-cabecalho"><p class="nota">A linhagem continua</p><h1 id="titulo-selecao-herdeiro">Quem herda a vila?</h1><p>Escolha um herdeiro disponível.</p></div>
        <div class="selecao-herdeiro-lista">${opcoesHerdeiro
          .map((herdeiro) => {
            const desbloqueado = disponiveis.has(herdeiro.traco);
            const nomeHerdeiro = herdeiro.nome;
            const descricaoHerdeiro = herdeiro.descricao;
            const dicaHerdeiro = desbloqueado
              ? "Disponível para escolher."
              : dicasTraco[herdeiro.traco] || "Poupe o cervo branco quando ele cruzar seu caminho.";
            const descricaoAcessivel = `${nomeHerdeiro}. ${descricaoHerdeiro} ${dicaHerdeiro}`;
            const imagemBase = herdeiro.imagem
              ? herdeiro.imagem.startsWith("assets/")
                ? herdeiro.imagem
                : `assets/herdeiros/${herdeiro.imagem}-neutra.webp`
              : "assets/selo.svg";
            const versaoImagem = window.JOGO_VERSAO_ASSETS
              ? `${imagemBase}?v=${encodeURIComponent(window.JOGO_VERSAO_ASSETS)}`
              : imagemBase;
            return `<button class="herdeiro-opcao${desbloqueado ? "" : " herdeiro-opcao--bloqueado"}" type="button" data-acao="selecionar-herdeiro" data-traco="${herdeiro.traco}" aria-disabled="${desbloqueado ? "false" : "true"}" aria-label="${esc(descricaoAcessivel)}">
              <img src="${esc(versaoImagem)}" width="600" height="600" alt="">
              <span class="herdeiro-opcao-info"><strong>${esc(nomeHerdeiro)}</strong><span>${esc(descricaoHerdeiro)}</span><small>${esc(dicaHerdeiro)}</small></span>
            </button>`;
          })
          .join("")}</div>
        <button class="botao discreto" data-acao="menu">Voltar ao início</button>
      </section>`,
      "inicio",
    );
  }

  function intro() {
    mostrar(
      `<section class="intro" aria-label="O início da crônica">
      <p class="intro-texto">Você não saberá o que afetou,<br>porém o povo irá lembrar…</p>
      <button class="botao botao-intro" data-acao="entrar-no-jogo">Iniciar</button>
    </section>`,
      "intro",
    );
  }

  function atributos(run, variacaoHonra = 0, descricaoRenda = "", danoRecebido = 0) {
    const icones = {
      hp: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
      escudo: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/>',
      ataque: '<path d="m14 4 6-1-1 6-9 9-4-4Zm-9 9 6 6m-3-3-5 5"/>',
      honra: '<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>',
      gold: '<circle cx="12" cy="12" r="8.5"/><path d="M15 8.5c-.5-.8-1.5-1.2-3-1.2-1.8 0-3 .9-3 2.2s1 2 3 2.4 3 1 3 2.4-1.2 2.4-3 2.4c-1.4 0-2.6-.6-3.2-1.5M12 6.5v11"/>',
    };
    const mudouHonra = variacaoHonra !== 0;
    return `<dl class="atributos">${["hp", "escudo", "ataque", "honra", "gold"]
      .map((id) => {
        const ehHonra = id === "honra";
        const ehGold = id === "gold";
        return `<div data-atributo="${id}" class="atributo ${ehHonra ? `honra-${Jogo.estado.faixaHonra(run.atributos.honra)}${mudouHonra ? " honra-mudou" : ""}` : ""}${ehGold ? " gold-contador" : ""}${id === "hp" && danoRecebido > 0 ? " vida-perdida" : ""}" ${id === "hp" && danoRecebido > 0 ? `data-dano="${numero(danoRecebido)}"` : ""} ${ehHonra && mudouHonra ? `data-mudanca-honra="${variacaoHonra > 0 ? "subiu" : "caiu"}"` : ""} ${ehHonra && variacaoHonra > 0 ? `data-ganho-honra="${numero(variacaoHonra)}"` : ""} ${ehGold ? `role="group" tabindex="0" aria-label="Gold: ${numero(run.atributos.gold)}" aria-describedby="descricao-renda-gold" data-tooltip="${esc(descricaoRenda)}"` : ""}>
      <dt><button class="atributo-consulta" type="button" data-acao="detalhes-atributo" data-atributo="${id}" aria-label="Consultar ${esc(nomes[id])}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icones[id]}</svg><span class="leitor-de-tela">${nomes[id]}</span></button></dt><dd>${ehHonra ? assinado(run.atributos[id]) : id === "hp" ? `<span class="vida-atual">${numero(run.atributos.hp)}</span><span class="vida-separador" aria-hidden="true">/</span><span class="vida-maxima">${numero(run.hpMax)}</span><span class="leitor-de-tela">${numero(run.atributos.hp)} de ${numero(run.hpMax)}</span>` : numero(run.atributos[id])}</dd>${ehGold ? `<span id="descricao-renda-gold" class="leitor-de-tela">${esc(descricaoRenda)}</span>` : ""}
    </div>`;
      })
      .join("")}</dl>`;
  }

  function efeitoDivinoHover(efeito) {
    const detalhes = [];
    for (const [atributo, valor] of Object.entries(efeito.modificadoresAplicados || {})) {
      if (valor)
        detalhes.push(`${assinado(valor)} ${nomesAtributosEfeito[atributo] || atributo} enquanto durar`);
    }
    if (efeito.porRodada?.efeitos) {
      const periodicos = Object.entries(efeito.porRodada.efeitos)
        .filter(([, valor]) => valor)
        .map(([atributo, valor]) => `${assinado(valor)} ${nomesAtributosEfeito[atributo] || atributo}`);
      if (periodicos.length)
        detalhes.push(
          efeito.eventoId
            ? `ao iniciar o dia: ${periodicos.join(", ")}`
            : efeito.porRodada.aCada
              ? `a cada ${numero(efeito.porRodada.aCada)} rodadas: ${periodicos.join(", ")}`
              : `por rodada: ${periodicos.join(", ")}`,
        );
    }
    if (efeito.reduzirCura) detalhes.push("reduz a cura de Vida pela metade");
    if (efeito.manutencaoGold) detalhes.push("cobra 1 Gold por dia");
    if (efeito.reducaoDano) detalhes.push(`reduz ${numero(efeito.reducaoDano)} de dano em batalha`);
    if (efeito.bonusDadosCombate)
      detalhes.push(`rola ${numero(efeito.bonusDadosCombate)} dado a mais em batalha`);
    if (efeito.reducaoGanhoGold) detalhes.push(`reduz em ${numero(efeito.reducaoGanhoGold)} o gold recebido`);
    if (efeito.revelarHonraRodadas) detalhes.push("revela sua Honra enquanto durar");
    if (efeito.revelarHabitantesRodadas) detalhes.push("revela o número de Habitantes enquanto durar");
    return detalhes.length ? detalhes.join(". ") + "." : "Efeito divino ativo nesta crônica.";
  }

  function alteracoes(resultado) {
    const mudancas = Object.entries(resultado.alteracoes).filter(
      ([id, valor]) =>
        valor !== 0 && !(resultado.combate && id === "hp" && valor === -resultado.combate.dano),
    );
    if (!mudancas.length) return "";
    return `<ul class="alteracoes" aria-label="Consequências da decisão">${mudancas.map(([id, valor]) => `<li><span>${resultado.combate && id === "hp" ? "Saldo de Vida" : nomes[id]}</span><strong>${assinado(valor)}</strong></li>`).join("")}</ul>`;
  }

  function bonusDivino(efeito, rotulo = "") {
    const valores = Object.entries(efeito.modificadoresAplicados || efeito.modificadores || {}).map(
      ([id, valor]) => `${assinado(valor)} ${nomes[id] || id}`,
    );
    if (efeito.reducaoDano) valores.push(`−${numero(efeito.reducaoDano)} dano`);
    if (efeito.bonusDadosCombate) valores.push(`+${numero(efeito.bonusDadosCombate)} dado`);
    if (efeito.porRodada?.efeitos) {
      const periodo = efeito.porRodada.aCada
        ? `a cada ${numero(efeito.porRodada.aCada)} rodadas`
        : "por rodada";
      for (const [id, valor] of Object.entries(efeito.porRodada.efeitos))
        valores.push(`${assinado(valor)} ${nomes[id] || id} ${periodo}`);
    }
    if (efeito.reduzirCura) valores.push("Cura pela metade");
    if (efeito.manutencaoGold) valores.push("−1 Gold por rodada");
    const eventoId =
      efeito.eventoId || Jogo.efeitosNordicos?.find((definicao) => definicao.nome === efeito.nome)?.eventoId;
    const imagem = Jogo.eventoPorId(eventoId)?.imagem;
    return `<details class="bonus-divino"><summary>${imagem ? `<img src="${esc(imagem)}" alt="" width="32" height="32">` : ""}<span>${esc(rotulo)}${esc(efeito.nome)}</span><strong>${esc(valores.join(" · "))}</strong>${efeito.restantes ? `<small>${numero(efeito.restantes)} rodadas</small>` : ""}</summary><p>${esc(efeitoDivinoHover(efeito))}</p></details>`;
  }

  function resultado(run) {
    const r = run.ultimoResultado;
    if (run.aguardaDecisaoCulto)
      return `<div class="resultado resultado-culto" role="status">
      <div class="decisao-culto" role="alert">
        <h2>O último habitante se foi</h2>
        <p class="chamado-tremendo">Há alguém à sua espera. A voz conhece seu nome.</p>
        <button class="botao" data-acao="juntar-culto">Continuar</button>
      </div>
    </div>`;
    const dueloDados = r.dueloDados
      ? `<section class="resultado-duelo-dados" aria-label="Resultado do duelo de dados"><div><span>${esc(tituloHerdeiro(run.traco))}</span>${facesDados([r.dueloDados.dadoHerdeiro], r.dueloDados.dadoHerdeiro, { cor: coresPrincipaisHerdeiros[run.traco] || "#8B673D", lado: "jogador", animar: false })}<strong>${numero(r.dueloDados.totalHerdeiro)}</strong></div><span aria-hidden="true">×</span><div><span>Velho cego</span>${facesDados([r.dueloDados.dadoOponente], r.dueloDados.dadoOponente, { cor: "#F9EEDD", lado: "inimigo", animar: false })}<strong>${numero(r.dueloDados.dadoOponente)}${r.dueloDados.bonusOponente ? ` + ${numero(r.dueloDados.bonusOponente)}` : ""}</strong></div></section>`
      : "";
    const testeDados = r.testeDados
      ? `<section class="resultado-duelo-dados" aria-label="Resultado do teste de dados"><div>${facesDados([r.testeDados.face], r.testeDados.face, { cor: coresPrincipaisHerdeiros[run.traco] || "#8B673D", lado: "jogador", animar: false })}<strong>${numero(r.testeDados.total)}</strong><small>Dado ${numero(r.testeDados.face)}${r.testeDados.bonus ? ` + ${numero(r.testeDados.bonus)}` : ""} · dificuldade ${numero(r.testeDados.dificuldade)} · ${r.testeDados.desfecho === "sucesso" ? "sucesso" : r.testeDados.desfecho === "sucessoComCusto" ? "sucesso com custo" : "falha"}</small></div></section>`
      : "";
    return `<div class="resultado" role="status">
      ${r.combate ? `<p class="desfecho-combate consequencia-principal">${r.combate.venceu ? "Vitória em batalha" : "Derrota em batalha"} · ${numero(r.combate.dano)} de dano recebido</p>` : ""}
      ${r.combate ? `<button class="botao ajuda-combate" type="button" data-acao="ajuda-combate" aria-label="Ajuda de combate">?</button>${r.combate.protecaoConsumida ? `<p class="efeito-consumido">${esc(r.combate.protecaoConsumida)}</p>` : ""}` : ""}${dueloDados}${testeDados}<p>${esc(r.texto)}</p>${r.informativoCulto ? `<p class="aviso-culto" role="status">${esc(r.informativoCulto)}</p>` : ""}${alteracoes(r)}
      <button class="botao primario" data-acao="continuar">Continuar</button>
    </div>`;
  }

  function ofertas(evento, run) {
    if (!evento.mercadorias) return "";
    const itens = [
      ...evento.mercadorias,
      ...(Jogo.engine.ofertaMercador(run, evento) ? [Jogo.engine.ofertaMercador(run, evento)] : []),
    ];
    return `<div class="escolhas mercadorias" aria-label="Mercadorias à venda">${itens
      .filter((item) => Jogo.engine.cumpre(item.requisitos, run))
      .map((item) => {
        const preco = Jogo.engine.precoMercadoria(run, item);
        const contexto = `${item.tipo === "uso" ? "Vai para a mochila" : "Efeito aplicado ao comprar"}${Jogo.sistemas?.pesoMercador(run, item) > 1 ? " · favorecido pelas necessidades atuais" : ""}`;
        if (!Jogo.engine.podePagar(run, item))
          return escolhaDesabilitada(
            `${item.texto} · ${numero(preco)} gold`,
            Jogo.sistemasUI?.requisitos(run, { goldMin: preco }) || "Gold insuficiente",
            contexto,
          );
        return `<button class="escolha mercadoria${item.raridade ? ` item-raridade-${esc(item.raridade)}` : ""}" data-mercadoria="${esc(item.id)}"><span>${esc(item.texto)}<small>${esc(contexto)}</small>${item.raridade ? `<small class="nome-raridade raridade-${esc(item.raridade)}"> (${esc(nomesRaridade[item.raridade])})</small>` : ""}</span><span class="preco">${numero(preco)} gold</span></button>`;
      })
      .join("")}</div>`;
  }

  function escolhaDesabilitada(texto, motivo, detalhe = "") {
    return Jogo.sistemasUI.escolhaIndisponivel(texto, motivo, detalhe);
  }

  function escolhaConstrucao(opcao) {
    const id = opcao.construcoes?.[0];
    const obra = nomesConstrucoes[id];
    if (!obra) return "";
    return `<details class="obra-opcao"><summary><strong>${esc(obra.nome)}</strong><span>${esc(beneficiosConstrucoes[id] || obra.bonus)}</span></summary><p>${esc(obra.bonus)}</p>${opcao.motivoBloqueio ? escolhaDesabilitada(opcao.texto, opcao.motivoBloqueio) : `<button class="escolha" data-opcao="${esc(opcao.id)}">${esc(opcao.texto)}</button>`}</details>`;
  }

  function leituraProbabilidades(run, opcao) {
    const chances = Jogo.engine.probabilidadesOpcao(run, opcao);
    if (!chances) return "";
    const rotulos = { sucesso: "Sucesso", sucessoComCusto: "Com custo", falha: "Falha" };
    return `<small class="destino-probabilidades">${opcao.testeSorte ? "Chance" : "Por rolagem"}: ${Object.entries(
      chances,
    )
      .filter(([, valor]) => valor > 0)
      .map(([id, valor]) => `${rotulos[id]} ${numero(Math.round(valor * 1000) / 10)}%`)
      .join(" · ")}</small>`;
  }

  function itensInventario(run, somenteCombate = false) {
    const contagem = run.inventario.reduce((grupos, id) => {
      grupos[id] = (grupos[id] || 0) + 1;
      return grupos;
    }, {});
    const idsConquistados = [...new Set([...(run.itensConquistados || []), ...Object.keys(contagem)])];
    return idsConquistados
      .map((id) => ({ item: Jogo.itens.find((item) => item.id === id), quantidade: contagem[id] || 0 }))
      .filter(
        ({ item, quantidade }) =>
          item &&
          !(
            item.tipo === "uso" &&
            quantidade === 0 &&
            Number.isSafeInteger(run.itensConsumidosEm?.[item.id]) &&
            run.itensConsumidosEm[item.id] < run.rodada
          ) &&
          (!somenteCombate || (quantidade > 0 && Jogo.engine.podeUsarItem(run, item.id))),
      );
  }

  function quantidadeItensInventario(run) {
    return itensInventario(run).reduce((total, { quantidade }) => total + Math.max(1, quantidade), 0);
  }

  function inventario(run, { somenteCombate = false, manterAberto = false } = {}) {
    const itens = itensInventario(run, somenteCombate);
    if (somenteCombate && !itens.length) return "";
    const efeitos = run.efeitosPreparados || {};
    const preparados = [
      efeitos.bonusDadosCombateProximaBatalha
        ? `Dados extras: +${numero(efeitos.bonusDadosCombateProximaBatalha)} na próxima batalha`
        : "",
      efeitos.bloquearDanoProximaBatalha ? "Amuleto: próximo dano de batalha anulado" : "",
      efeitos.bonusAtaqueProximaBatalha
        ? `Ataque: +${numero(efeitos.bonusAtaqueProximaBatalha)} na próxima batalha`
        : "",
      efeitos.bonusEscudoProximaBatalha
        ? `Elixir: +${numero(efeitos.bonusEscudoProximaBatalha)} Escudo na próxima batalha`
        : "",
      efeitos.bonusGoldProximaRecompensa
        ? `Moeda: +${numero(efeitos.bonusGoldProximaRecompensa)} gold na próxima recompensa`
        : "",
      efeitos.bacamarteBatalhas
        ? `Bacamarte: dano anulado por ${numero(efeitos.bacamarteBatalhas)} batalhas restantes`
        : "",
      efeitos.escudoFeCooldown ? `Escudo da fé: ${numero(efeitos.escudoFeCooldown)} rodadas de recarga` : "",
      run.lancaHeroiBatalhas ? `Lança do Herói: ${numero(run.lancaHeroiBatalhas)} batalhas restantes` : "",
      run.flags.cinto_vento_ativo ? "Cinto dos ventos: aguardando batalha" : "",
      efeitos.rerrolagensGratisProximaBatalha ? `Rerrolagem grátis: próxima batalha` : "",
      efeitos.desvantagemInimigaProximaBatalha ? "Inimigo com desvantagem na próxima batalha" : "",
    ].filter(Boolean);
    const testeDados =
      run.combatePendente?.ehTesteDados === true || run.combatePendente?.ehDueloDados === true;
    const preparadosVisiveis = testeDados
      ? [
          efeitos.bonusDadosCombateProximaBatalha
            ? `Dados extras neste teste: +${numero(efeitos.bonusDadosCombateProximaBatalha)}`
            : "",
          run.combatePendente.rerrolagensGratis
            ? `Rerrolagens gratuitas restantes: ${numero(run.combatePendente.rerrolagensGratis)}`
            : "",
        ].filter(Boolean)
      : preparados;
    const quantidadeItens = quantidadeItensInventario(run);
    return `<details id="painel-inventario" class="inventario" ${run.inventarioAberto || manterAberto ? "open" : ""}><summary><span class="painel-titulo">Inventário <span>${numero(quantidadeItens)} ${quantidadeItens === 1 ? "item" : "itens"}</span></span><span class="painel-voltar-link">← Voltar</span></summary>
      ${
        itens.length
          ? `<ul>${itens
              .map(({ item, quantidade }) => {
                const recarga = Jogo.engine.recargaItemRestante(run, item.id);
                const estado =
                  item.id === "marca_da_entidade_x" && run.flags.entidade_x_pacto
                    ? "Maldição ativa · −1 Vida por rodada"
                    : item.id === "lanca_do_heroi" && run.lancaHeroiBatalhas
                      ? `Ativa: ${numero(run.lancaHeroiBatalhas)} batalhas restantes`
                      : recarga
                        ? `Recarga: ${numero(recarga)} ${recarga === 1 ? "rodada" : "rodadas"}`
                        : item.uso?.sacrificarHabitantes && quantidade && run.atributos.hp >= run.hpMax
                          ? "Vida já está no máximo"
                          : item.uso?.sacrificarHabitantes &&
                              quantidade &&
                              run.atributos.habitantes <= item.uso.sacrificarHabitantes
                            ? "Habitantes insuficientes"
                            : item.guardarAposReceber && quantidade
                              ? "Bônus permanente aplicado · guardada para a cura"
                              : item.aoReceber && !run.itensConsumidosEm?.[item.id]
                                ? "Efeito permanente aplicado"
                                : quantidade
                                  ? `Disponível: ${numero(quantidade)}`
                                  : run.itensConsumidosEm?.[item.id] === run.rodada
                                    ? "Usado nesta rodada"
                                    : "Sem unidades disponíveis";
                const usoItem =
                  item.id === "adaga_cerimonial" && quantidade && Jogo.engine.podeUsarItem(run, item.id)
                    ? `<span class="acoes-item">${Jogo.engine.podeUsarItem(run, item.id, "habitantes") ? `<button class="botao usar-item" data-item-sacrificio="habitantes">Sacrificar ${run.traco === "herdeiro_culto" ? 5 : 10} habitantes</button>` : ""}${Jogo.engine.podeUsarItem(run, item.id, "culto") ? `<button class="botao usar-item" data-item-sacrificio="culto">Sacrificar ${run.traco === "herdeiro_culto" ? "5 seguidores · +10 Ataque e +5 Escudo" : "10 seguidores"}</button>` : ""}</span>`
                    : item.uso?.sacrificarHabitantes && quantidade && Jogo.engine.podeUsarItem(run, item.id)
                      ? `<button class="botao usar-item" data-usar-item="${esc(item.id)}">Matar 1 aldeão</button>`
                      : item.id === "calice_negro" && quantidade && Jogo.engine.podeUsarItem(run, item.id)
                        ? `<button class="botao usar-item" data-item-id="${esc(item.id)}" data-item-sacrificio="${run.cultoAtivo ? "culto" : "habitantes"}">Sacrificar 5 ${run.cultoAtivo ? "seguidores" : "habitantes"}</button>`
                        : item.uso &&
                            quantidade &&
                            item.id !== "adaga_cerimonial" &&
                            Jogo.engine.podeUsarItem(run, item.id)
                          ? `<button class="botao usar-item" data-usar-item="${esc(item.id)}">Usar</button>`
                          : "";
                const efeitoItem =
                  item.id === "adaga_cerimonial" && run.traco === "herdeiro_culto"
                    ? "Uso único: 5 seguidores por +10 Ataque e +5 Escudo, ou 5 habitantes por +10 Ataque."
                    : [item.texto, item.descricao].filter(Boolean).join(". ");
                return `<li><span class="item-descricao"><span class="item-efeito"><button type="button" class="item-efeito-acionar" aria-describedby="efeito-item-${esc(item.id)}"><strong>${esc(item.nome)}${item.raridade ? `<span class="nome-raridade raridade-${esc(item.raridade)}"> (${esc(nomesRaridade[item.raridade])})</span>` : ""}${quantidade > 1 ? ` ×${numero(quantidade)}` : ""}</strong></button><span class="item-efeito-tooltip" role="tooltip" id="efeito-item-${esc(item.id)}">${esc(efeitoItem)}</span></span><small>${esc(estado)} · ${esc(item.id === "adaga_cerimonial" && run.traco === "herdeiro_culto" ? "Uso único: 5 seguidores por +10 Ataque e +5 Escudo, ou 5 habitantes por +10 Ataque." : item.descricao)}${Jogo.sistemas?.animais.includes(item.id) ? ` ${esc(Jogo.sistemas.descricaoVinculo(run, item.id))}` : ""}</small></span>${usoItem}</li>`;
              })
              .join("")}</ul>`
          : somenteCombate
            ? "<p>Nenhum item pode ser usado nesta etapa.</p>"
            : "<p>Nenhum item conquistado nesta run.</p>"
      }
      ${run.avisoInventario ? `<p class="aviso-inventario" role="status">${esc(run.avisoInventario)}</p>` : ""}
      ${preparadosVisiveis.length ? `<p class="efeitos-preparados">${preparadosVisiveis.map(esc).join(" · ")}</p>` : ""}</details>
      <aside class="registro-itens" aria-label="Itens recebidos recentemente">
        <h3>Último item recebido</h3>
        ${
          run.logItens?.length
            ? `<ul>${run.logItens
                .slice(-1)
                .map((registro) => {
                  const item = Jogo.itens.find((candidato) => candidato.id === registro.id);
                  return item
                    ? `<li><strong>${esc(item.nome)}</strong><span>Rodada ${numero(registro.rodada)}</span></li>`
                    : "";
                })
                .join("")}</ul>`
            : `<p>Nenhum item recebido ainda.</p>`
        }
      </aside>`;
  }

  function historicoCronica(
    run,
    {
      id = "painel-progresso",
      titulo = "Crônica recente",
      recentesPrimeiro = true,
      expandido = run.historicoCronicaAberto,
    } = {},
  ) {
    const registros = (run.historicoCronica || []).slice();
    registros.sort((a, b) => (recentesPrimeiro ? b.rodada - a.rodada : a.rodada - b.rodada));
    return `<details id="${esc(id)}" class="historico-cronica" ${expandido ? "open" : ""}><summary><span class="painel-titulo">${esc(titulo)} <span>${registros.length} ${registros.length === 1 ? "escolha" : "escolhas"}</span></span><span class="painel-voltar-link">← Voltar</span></summary>
      ${
        registros.length
          ? `<ol>${registros
              .map(
                (registro) =>
                  `<li><small>Rodada ${numero(registro.rodada)}</small><h3>${esc(registro.evento)}</h3><strong>“${esc(registro.escolha)}”</strong><p>${esc(registro.desfecho)}</p></li>`,
              )
              .join("")}</ol>`
          : "<p>Nenhuma escolha registrada.</p>"
      }
    </details>`;
  }

  function efeitoHonraOpcao(opcao, run) {
    if (opcao.definir?.honra !== undefined) return opcao.definir.honra - run.atributos.honra;
    return opcao.efeitos?.honra || 0;
  }

  function honraRevelada(opcao, evento, run) {
    const detalhes = [];
    const posseRevela = run.condicao?.ativa === "possessao";
    const corvoRevelaOpcao = Jogo.druida?.ehDruida(run) && run.corvoRevelaOpcaoId === opcao.id;
    if (
      posseRevela ||
      corvoRevelaOpcao ||
      Jogo.herdeiros.valorEfeito(run, "revelarHonraRodadas") ||
      run.rodada <= run.honraReveladaAteRodada
    ) {
      if (opcao.combate && evento.batalha) {
        const vitoria = evento.batalha.vitoria.efeitos?.honra || 0;
        const falha =
          (evento.batalha.derrota.efeitos?.honra || 0) +
          (evento.batalha.penalidadeFalha?.efeitos?.honra || 0);
        detalhes.push(`Honra na vitória ${assinado(vitoria)} · na falha ${assinado(falha)}`);
      } else if (opcao.testeSorte) {
        const base = opcao.efeitos?.honra || 0;
        const sucesso = base + (opcao.testeSorte.sucesso?.efeitos?.honra || 0);
        const falha = base + (opcao.testeSorte.falha?.efeitos?.honra || 0);
        detalhes.push(`Honra ${assinado(sucesso)} no sucesso · ${assinado(falha)} na falha`);
      } else detalhes.push(`Honra ${assinado(efeitoHonraOpcao(opcao, run))}`);
      const ganhoDeHonra =
        opcao.combate && evento.batalha
          ? Math.max(
              evento.batalha.vitoria.efeitos?.honra || 0,
              (evento.batalha.derrota.efeitos?.honra || 0) +
                (evento.batalha.penalidadeFalha?.efeitos?.honra || 0),
            )
          : opcao.testeSorte
            ? Math.max(
                (opcao.efeitos?.honra || 0) + (opcao.testeSorte.sucesso?.efeitos?.honra || 0),
                (opcao.efeitos?.honra || 0) + (opcao.testeSorte.falha?.efeitos?.honra || 0),
              )
            : efeitoHonraOpcao(opcao, run);
      if (posseRevela && !run.condicao.abracada && ganhoDeHonra > 0) detalhes.push("a voz pode tirar 3 Vida");
    }
    const variacaoHabitantes =
      opcao.definir?.habitantes !== undefined
        ? opcao.definir.habitantes - run.atributos.habitantes
        : opcao.efeitos?.habitantes;
    if (
      (Jogo.herdeiros.valorEfeito(run, "revelarHabitantesRodadas") ||
        run.rodada <= run.habitantesReveladosAteRodada) &&
      Number.isSafeInteger(variacaoHabitantes)
    ) {
      detalhes.push(`Habitantes ${assinado(variacaoHabitantes)}`);
    }
    return detalhes.join(" · ");
  }

  function previsaoVisualOpcao(opcao, run) {
    const efeitosRamos = () => {
      const base = opcao.efeitos || {};
      if (!opcao.testeSorte) return [{ nome: "", efeitos: base }];
      return ["sucesso", "falha"].map((nome) => ({
        nome,
        efeitos: Object.fromEntries(
          [...new Set([...Object.keys(base), ...Object.keys(opcao.testeSorte[nome]?.efeitos || {})])].map(
            (atributo) => [
              atributo,
              (base[atributo] || 0) + (opcao.testeSorte[nome]?.efeitos?.[atributo] || 0),
            ],
          ),
        ),
      }));
    };
    const detalhes = [];
    if (run.flags?.olhos_mercurio_ativo) {
      const custos = efeitosRamos().map(({ nome, efeitos }) => {
        const partes = [`Gold ${assinado(efeitos.gold || 0)}`, `Vida ${assinado(efeitos.hp || 0)}`];
        return `${nome ? `${nome}: ` : ""}${partes.join(" · ")}`;
      });
      detalhes.push(custos.join(" · "));
    }
    if (run.flags?.olho_mil_nomes_ativo) {
      const habitantes = efeitosRamos().map(({ nome, efeitos }) => {
        let variacao = efeitos.habitantes || 0;
        if (opcao.definir?.habitantes !== undefined)
          variacao =
            opcao.definir.habitantes -
            run.atributos.habitantes +
            (opcao.testeSorte?.[nome]?.efeitos?.habitantes || 0);
        const texto = variacao > 0 ? `Habitantes ${assinado(variacao)}` : "sem ganho de Habitantes";
        return `${nome ? `${nome}: ` : ""}${texto}`;
      });
      detalhes.push(habitantes.join(" · "));
    }
    return detalhes.join(" · ");
  }

  function faixaRetrato(honra) {
    const altaIntermediaria = (Jogo.config.honraAlta + Jogo.config.honraExtremaAlta) / 2;
    const baixaIntermediaria = (Jogo.config.honraBaixa + Jogo.config.honraExtremaBaixa) / 2;
    if (honra >= Jogo.config.honraExtremaAlta) return "altissima";
    if (honra >= altaIntermediaria) return "alta-2";
    if (honra >= Jogo.config.honraAlta) return "alta";
    if (honra <= Jogo.config.honraExtremaBaixa) return "baixissima";
    if (honra <= baixaIntermediaria) return "baixa-2";
    if (honra <= Jogo.config.honraBaixa) return "baixa";
    return "neutra";
  }

  function caminhoRetrato(traco, faixa, cultoAtivo) {
    const personagem = retratos[traco];
    const versao = window.JOGO_VERSAO_ASSETS;
    const comVersao = (caminho) => (versao ? `${caminho}?v=${encodeURIComponent(versao)}` : caminho);
    if (personagem?.placeholder) return comVersao(personagem.placeholder);
    if (!personagem?.arquivo) return comVersao("assets/selo.svg");
    const faixaDisponivel = personagem.faixas && !personagem.faixas.includes(faixa) ? "neutra" : faixa;
    if (traco === "druida_herdeiro")
      return comVersao(`assets/herdeiros/druida-herdeiro-${cultoAtivo ? "culto" : faixa}.webp`);
    if (cultoAtivo) return comVersao("assets/herdeiros/" + personagem.arquivo + "-culto.webp");
    return comVersao("assets/herdeiros/" + personagem.arquivo + "-" + faixaDisponivel + ".webp");
  }

  function precarregarProximaCarta(src) {
    if (!src || src === imagemEventoPrecarregadaSrc) return;
    imagemEventoPrecarregadaSrc = src;
    imagemEventoPrecarregada = new Image();
    imagemEventoPrecarregada.decoding = "async";
    imagemEventoPrecarregada.fetchPriority = "high";
    imagemEventoPrecarregada.src = src;
    imagemEventoPrecarregada.decode?.().catch(() => {});
  }

  function precarregarProximoRetrato(traco, faixa, cultoAtivo, direcao) {
    const sequencia = ["baixissima", "baixa-2", "baixa", "neutra", "alta", "alta-2", "altissima"];
    const indice = sequencia.indexOf(faixa);
    const proximaFaixa = sequencia[indice + direcao];
    if (!proximaFaixa) return;
    const imagem = new Image();
    imagem.decoding = "async";
    imagem.src = caminhoRetrato(traco, proximaFaixa, cultoAtivo);
    imagem.decode?.().catch(() => {});
  }

  function retrato(traco, faixa, anterior, cultoAtivo) {
    const imagemAtual = caminhoRetrato(traco, faixa, cultoAtivo);
    const imagemAnterior = anterior
      ? caminhoRetrato(anterior.traco, anterior.faixa, anterior.cultoAtivo)
      : "";
    const personagem = retratos[traco];
    const descricao = personagem?.arquivo
      ? personagem.descricao + (cultoAtivo ? ", com vestes rituais do culto" : ", " + fasesRetrato[faixa])
      : personagem?.descricao || "Selo do herdeiro";
    return (
      '<div class="retrato-area' +
      (cultoAtivo ? " culto-ativo" : "") +
      (anterior ? " troca-retrato" : "") +
      '" data-honra="' +
      faixa +
      '">' +
      (anterior
        ? '<img class="retrato retrato-anterior' +
          (anterior.traco === "druida_herdeiro" ? " retrato--druida" : "") +
          '" src="' +
          imagemAnterior +
          '" width="1024" height="1024" alt="" aria-hidden="true">'
        : "") +
      '<img class="retrato retrato-atual' +
      (traco === "druida_herdeiro" ? " retrato--druida" : "") +
      '" src="' +
      imagemAtual +
      '" width="1024" height="1024" alt="' +
      descricao +
      '">' +
      "</div>"
    );
  }

  function faseLunar(run) {
    const rodada = Number.isSafeInteger(run?.rodada) ? Math.max(1, run.rodada) : 1;
    const progresso = rodada % 8 || 8;
    const fase =
      progresso === 8
        ? { id: "cheia", nome: "Lua cheia" }
        : progresso === 1
          ? { id: "nova", nome: "Lua nova" }
          : progresso <= 3
            ? { id: "crescente", nome: "Lua crescente" }
            : progresso === 4
              ? { id: "meia", nome: "Quarto crescente" }
              : progresso <= 6
                ? { id: "gibosa", nome: "Lua gibosa" }
                : { id: "quase-cheia", nome: "Quase cheia" };
    return { ...fase, progresso, restantes: 8 - progresso };
  }

  function descricaoCicloLunar(run) {
    if (run?.condicao?.abracada) return "O ciclo lunar está sob controle.";
    const fase = faseLunar(run);
    return `${fase.nome}. ${fase.restantes ? `Lua cheia em ${fase.restantes} rodadas.` : "A lua cheia chegou nesta rodada."}`;
  }

  function detalheMoldura(condicaoId, run = null) {
    const molduras = [];
    if (condicaoId === "olhos-mercurio" || run?.flags?.olhos_mercurio_ativo)
      molduras.push('<span class="moldura-mercurio" aria-hidden="true"><i></i></span>');
    if (condicaoId === "olho-mil-nomes" || run?.flags?.olho_mil_nomes_ativo)
      molduras.push('<span class="moldura-mil-nomes" aria-hidden="true"><i></i></span>');
    if (condicaoId === "vampirismo")
      molduras.push('<span class="moldura-presas" aria-hidden="true"><i></i><i></i></span>');
    if (condicaoId === "licantropia") {
      const ciclo = faseLunar(run);
      const domado = run?.condicao?.ativa === "licantropia" && run.condicao.abracada;
      const fase = domado ? { id: "domada", nome: "Ciclo domado" } : ciclo;
      const rotulo = domado ? fase.nome : ciclo.restantes ? `Cheia em ${ciclo.restantes} rod.` : "Lua cheia";
      const marcas = Array.from({ length: 8 }, (_, indice) =>
        indice < ciclo.progresso || domado ? '<i class="moldura-lunar-marca--acesa"></i>' : "<i></i>",
      ).join("");
      molduras.push(`<span class="moldura-lunar" data-fase-lunar="${fase.id}" aria-hidden="true">
        <span class="moldura-lunar-selo"><i class="moldura-lunar-orbe"></i><span>${rotulo}</span></span>
        <span class="moldura-lunar-ciclo">${marcas}</span>
      </span>`);
    }
    if (condicaoId === "possessao") molduras.push('<span class="moldura-veu" aria-hidden="true"></span>');
    return molduras.join("");
  }

  function preverTransformacoes(run) {
    const herdeiro = run || { traco: "corajoso", atributos: { honra: 0 }, cultoAtivo: false };
    const faixa = faixaRetrato(herdeiro.atributos.honra);
    const condicoes = [
      { id: "vampirismo", nome: "Vampirismo", detalhe: "Moldura vermelha com presas" },
      { id: "licantropia", nome: "Licantropia", detalhe: "Moldura lunar com ciclo de oito rodadas" },
      { id: "possessao", nome: "Possessão", detalhe: "Moldura fria envolta por um véu" },
      {
        id: "olhos-mercurio",
        classe: "transformacao-olhos-mercurio",
        nome: "Olhos de Mercúrio",
        detalhe: "Lentes prateadas nas bordas da carta",
      },
      {
        id: "olho-mil-nomes",
        classe: "transformacao-olho-mil-nomes",
        nome: "Olho dos Mil Nomes",
        detalhe: "Olho dourado em moldura de bronze",
      },
      {
        id: "mao-do-destino",
        classe: "transformacao-mao-do-destino",
        nome: "Mão do Destino",
        detalhe:
          "Mostra a chance de vitória antes de cada embate e concede uma rerrolagem grátis por batalha.",
      },
    ];
    const dialogo = document.createElement("dialog");
    dialogo.className = "previa-transformacoes";
    dialogo.setAttribute("aria-labelledby", "titulo-previa-transformacoes");
    dialogo.innerHTML = `
      <header class="previa-transformacoes-cabecalho">
        <div><p class="previa-transformacoes-sobretitulo">Debug visual</p><h2 id="titulo-previa-transformacoes">Transformações do herdeiro</h2></div>
        <button class="controle-honra" type="button" data-fechar-previa aria-label="Fechar prévia">Fechar</button>
      </header>
      <p class="previa-transformacoes-nota">Prévia visual. Não altera a partida; a chance da Mão do Destino aparece durante os embates quando ela está ativa.</p>
      <div class="previa-transformacoes-grade">
        ${condicoes
          .map((condicao) => {
            const runPrevia = {
              ...herdeiro,
              flags: {
                ...(herdeiro.flags || {}),
                olhos_mercurio_ativo: condicao.id === "olhos-mercurio",
                olho_mil_nomes_ativo: condicao.id === "olho-mil-nomes",
                mao_do_destino_ativa: condicao.id === "mao-do-destino",
              },
            };
            return `
          <section class="previa-transformacao" aria-label="Prévia de ${condicao.nome}">
            <article class="carta carta-herdeiro honra-${faixa} ${condicao.classe || `condicao-${condicao.id}`} previa-transformacao-carta">
              ${retrato(herdeiro.traco, faixa, null, Boolean(herdeiro.cultoAtivo))}
              ${detalheMoldura(condicao.id, runPrevia)}
              <div class="carta-titulo herdeiro-carta-titulo"><h2>${esc(tituloHerdeiro(herdeiro.traco))}</h2></div>
            </article>
            <div class="previa-transformacao-legenda"><h3>${condicao.nome}</h3><p>${condicao.detalhe}</p></div>
          </section>`;
          })
          .join("")}
      </div>`;
    document.body.append(dialogo);
    dialogo.addEventListener("click", (evento) => {
      if (evento.target === dialogo || evento.target.closest("[data-fechar-previa]")) dialogo.close();
    });
    dialogo.addEventListener("close", () => dialogo.remove(), { once: true });
    dialogo.showModal();
  }

  function animarRetrato() {
    const area = app.querySelector(".troca-retrato");
    if (!area) return;
    const atual = area.querySelector(".retrato-atual");
    const concluir = () => {
      area.querySelector(".retrato-anterior")?.remove();
      area.classList.remove("troca-retrato", "em-transicao");
    };
    const iniciar = () => {
      if (area.isConnected) area.classList.add("em-transicao");
    };
    // A imagem anterior fica visível até a próxima estar carregada.
    if (atual.complete && atual.naturalWidth > 0) iniciar();
    else atual.addEventListener("load", iniciar, { once: true });
    atual.addEventListener("animationend", concluir, { once: true });
    atual.addEventListener("error", concluir, { once: true });
  }

  function cenaPressagio(run) {
    const p = run.pressagios.atual,
      item = Jogo.pressagios.porId(p.id);
    const resultado = p.fase === "resultado";
    const alteracoes = resultado
      ? Object.entries(p.resultado.alteracoes)
          .filter(([, v]) => v !== 0)
          .map(([id, v]) => `${nomes[id] || id}: ${v > 0 ? "+" : ""}${v}`)
          .join(" · ")
      : "";
    mostrar(
      `<section class="pressagio-cena${resultado ? " pressagio-cena--resultado" : ""}" aria-labelledby="pressagio-titulo">
      <article class="pressagio-caixa">
        <h1 id="pressagio-titulo">${esc(item.nome)}</h1>
        <img src="${esc(item.imagem)}?v=${encodeURIComponent(window.JOGO_VERSAO_ASSETS || "1")}" alt="Ilustração de ${esc(item.nome)} em gravura" width="800" height="800">
        ${
          resultado
            ? `<p role="status">${p.resultado.sucesso ? "A preparação protegeu a vila." : "O mau presságio se cumpriu."}</p><p>${esc(p.resultado.sucesso ? item.sucesso : item.falha)}</p><p>${esc(alteracoes)}${p.resultado.nomeEfeito ? ` · ${esc(p.resultado.nomeEfeito)}` : ""}</p>`
            : `<p>${esc(item.texto)}</p><p class="pressagio-regra">${esc(item.regra)}</p><p class="pressagio-desfechos">Se conseguir: ${esc(item.sucesso)}<br>Se falhar: ${esc(item.falha)}</p>`
        }
        <button id="pressagio-responder" type="button" class="botao primario" data-acao="pressagio-confirmar">${resultado ? "Voltar à vila" : "Preparar para o presságio"}</button>
      </article>
    </section>`,
      "pressagio",
    );
    window.requestAnimationFrame(() =>
      app.querySelector("#pressagio-responder")?.focus({ preventScroll: true }),
    );
  }
  function detalhesPressagio(run) {
    const p = run?.pressagios?.atual;
    if (!p) return;
    const item = Jogo.pressagios.porId(p.id);
    mostrar(
      `<section class="pressagio-detalhes" aria-labelledby="pressagio-detalhe-titulo"><h1 id="pressagio-detalhe-titulo">${esc(item.nome)}</h1>
      <p>${esc(item.regra)}</p><p role="status">${esc(Jogo.pressagios.progresso(run))}</p>
      <p>Se conseguir: ${esc(item.sucesso)}</p><p>Se falhar: ${esc(item.falha)}</p>
      ${modoDebug() ? `<details><summary>Estado do presságio</summary><pre>${esc(JSON.stringify(run.pressagios, null, 2))}</pre></details>` : ""}
      <button class="botao" data-acao="entrar-no-jogo">Voltar à vila</button></section>`,
      "pressagio-detalhes",
    );
  }

  function marcadorDado(valor, classes, rotulo = "", cor = "#F9EEDD") {
    return `<span class="${classes.join(" ")}" style="--dado-cor:${cor}" data-valor="${esc(valor)}" data-cor="${cor}" ${rotulo ? `role="img" aria-label="${esc(rotulo)}"` : 'aria-hidden="true"'}>
      <svg class="dado-combate-svg" viewBox="0 0 84 84" aria-hidden="true" focusable="false">
        <path class="dado-combate-contorno" d="M42 4 76 28 63 72 21 72 8 28Z" />
        <path class="dado-combate-malha" d="M42 4 42 42 76 28M76 28 42 42 63 72M63 72 42 42 21 72M21 72 42 42 8 28M8 28 42 42 42 4" />
      </svg><span class="dado-combate-valor" aria-hidden="true">${valor}</span><canvas class="dado-combate-canvas" width="72" height="72" aria-hidden="true"></canvas></span>`;
  }

  function misturarCores(hexA, hexB, proporcao) {
    const parseHex = (hex) => [1, 3, 5].map((inicio) => Number.parseInt(hex.slice(inicio, inicio + 2), 16));
    const a = parseHex(hexA);
    const b = parseHex(hexB);
    return `#${a
      .map((canal, indice) =>
        Math.round(canal + (b[indice] - canal) * proporcao)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
  }

  function rodarPonto([x, y, z], angulos) {
    const cosY = Math.cos(angulos.y);
    const sinY = Math.sin(angulos.y);
    const giradoX = x * cosY + z * sinY;
    const giradoZ = -x * sinY + z * cosY;
    const cosX = Math.cos(angulos.x);
    const sinX = Math.sin(angulos.x);
    const giradoY = y * cosX - giradoZ * sinX;
    const profundidade = y * sinX + giradoZ * cosX;
    const cosZ = Math.cos(angulos.z);
    const sinZ = Math.sin(angulos.z);
    return [giradoX * cosZ - giradoY * sinZ, giradoX * sinZ + giradoY * cosZ, profundidade];
  }

  function angulosParaFace(indiceFace) {
    const normal = facesD20.faces[indiceFace]?.normal || facesD20.faces[0].normal;
    const y = Math.atan2(-normal[0], normal[2]);
    const zDepoisY = -normal[0] * Math.sin(y) + normal[2] * Math.cos(y);
    return { x: Math.atan2(normal[1], zDepoisY), y, z: 0 };
  }

  function desenharDado3D(canvas, corBase, indiceFace, angulos, destaque, escala = 1, mostrarValores = true) {
    const contextoDado = canvas.getContext("2d");
    if (!contextoDado) return false;
    const largura = canvas.clientWidth || 64;
    const altura = canvas.clientHeight || 64;
    const proporcaoPixel = Math.min(window.devicePixelRatio || 1, 2);
    const larguraPixel = Math.round(largura * proporcaoPixel);
    const alturaPixel = Math.round(altura * proporcaoPixel);
    if (canvas.width !== larguraPixel || canvas.height !== alturaPixel) {
      canvas.width = larguraPixel;
      canvas.height = alturaPixel;
    }
    contextoDado.setTransform(proporcaoPixel, 0, 0, proporcaoPixel, 0, 0);
    contextoDado.clearRect(0, 0, largura, altura);
    const raio = Math.min(largura, altura) * 0.41 * escala;
    const camera = 4.2;
    const transformados = facesD20.vertices.map((vertice) => rodarPonto(vertice, angulos));
    const projetados = transformados.map(([x, y, z]) => {
      const perspectiva = camera / (camera - z);
      return [largura / 2 + x * raio * perspectiva, altura / 2 - y * raio * perspectiva, z];
    });
    const luz = [0.38, 0.52, 0.76];
    const facesVisiveis = facesD20.faces
      .map((face, indice) => {
        const normal = rodarPonto(face.normal, angulos);
        const pontos = face.vertices.map((indiceVertice) => projetados[indiceVertice]);
        const profundidade = pontos.reduce((soma, ponto) => soma + ponto[2], 0) / pontos.length;
        const intensidade = normal.reduce((soma, canal, indiceCanal) => soma + canal * luz[indiceCanal], 0);
        return { ...face, indice, normal, pontos, profundidade, intensidade };
      })
      .sort((a, b) => a.profundidade - b.profundidade);
    for (const face of facesVisiveis) {
      const escolhida = face.indice === indiceFace;
      const baseEscura = corBase.toUpperCase() === "#000000";
      const sombra = Math.max(0, -face.intensidade) * 0.5;
      const luzMarfim = Math.max(0, face.intensidade) * 0.34 + 0.08;
      let corFace = misturarCores(corBase, "#17130F", sombra);
      corFace = misturarCores(corFace, "#F9EEDD", luzMarfim);
      contextoDado.beginPath();
      contextoDado.moveTo(face.pontos[0][0], face.pontos[0][1]);
      contextoDado.lineTo(face.pontos[1][0], face.pontos[1][1]);
      contextoDado.lineTo(face.pontos[2][0], face.pontos[2][1]);
      contextoDado.closePath();
      contextoDado.fillStyle = corFace;
      contextoDado.fill();
      contextoDado.strokeStyle = escolhida && destaque ? "#D8BD76" : baseEscura ? "#B8AA91" : "#241E17";
      contextoDado.lineWidth = escolhida && destaque ? 1.5 : 0.9;
      contextoDado.stroke();
      if (mostrarValores) {
        const centroX = face.pontos.reduce((soma, ponto) => soma + ponto[0], 0) / 3;
        const centroY = face.pontos.reduce((soma, ponto) => soma + ponto[1], 0) / 3;
        contextoDado.textAlign = "center";
        contextoDado.textBaseline = "middle";
        contextoDado.font = `${escolhida ? "700 11px" : "600 6px"} Georgia, serif`;
        contextoDado.lineWidth = escolhida ? 1.4 : 0.8;
        contextoDado.strokeStyle = corBase === "#F9EEDD" ? "#F9EEDD" : baseEscura ? "#000000" : "#241E17";
        contextoDado.fillStyle = corBase === "#F9EEDD" ? "#241E17" : "#F9EEDD";
        contextoDado.strokeText(String(face.valor), centroX, centroY);
        contextoDado.fillText(String(face.valor), centroX, centroY);
      }
    }
    return true;
  }

  function desenharDadosCombate(movimentoReduzido) {
    const animacoes = [];
    app.querySelectorAll?.(".dado-combate")?.forEach((dado) => {
      const destaque =
        dado.classList.contains("dado-combate-maior") ||
        dado.classList.contains("dado-combate-destaque-pendente");
      const revelarSelecao = () => {
        if (dado.classList.contains("dado-combate-destaque-pendente")) {
          dado.classList.remove("dado-combate-destaque-pendente");
          dado.classList.add("dado-combate-maior");
        }
        if (dado.classList.contains("dado-combate-descarte-pendente")) {
          dado.classList.remove("dado-combate-descarte-pendente");
          dado.classList.add("dado-combate-descartado");
        }
      };
      const canvas = dado.querySelector(".dado-combate-canvas");
      if (!canvas || !canvas.getContext("2d")) {
        revelarSelecao();
        return;
      }
      const valor = Number(dado.dataset.valor);
      const resultado = Number.isInteger(valor) && valor >= 1 && valor <= 20;
      if (dado.closest(".disputa-teste-dados") && !resultado) return;
      dado.classList.add("dado-combate--3d");
      const indiceFace = resultado ? valor - 1 : 0;
      const alvo = angulosParaFace(indiceFace);
      const cor = dado.dataset.cor || "#F9EEDD";
      const rolar =
        !movimentoReduzido &&
        resultado &&
        !dado.classList.contains("dado-combate-estatico") &&
        !dado.classList.contains("dado-combate-aguardando");
      if (!rolar) {
        revelarSelecao();
        desenharDado3D(canvas, cor, indiceFace, alvo, destaque);
        return;
      }
      const rotuloFinal = dado.getAttribute("aria-label");
      dado.setAttribute("aria-label", "Dado em rolagem");
      const volta = Math.PI * 2;
      const inicio = {
        x: (Math.random() - 0.5) * volta,
        y: (Math.random() - 0.5) * volta,
        z: (Math.random() - 0.5) * volta,
      };
      const completarVoltas = (atual, final) => {
        const diferenca = (((final - atual) % volta) + volta) % volta;
        return atual + diferenca + volta * 2;
      };
      const fim = {
        x: completarVoltas(inicio.x, alvo.x),
        y: completarVoltas(inicio.y, alvo.y),
        z: completarVoltas(inicio.z, alvo.z),
      };
      const comeco = performance.now();
      animacoes.push(
        new Promise((concluir) => {
          function quadro(agora) {
            if (!canvas.isConnected) {
              concluir();
              return;
            }
            const progresso = Math.min(1, (agora - comeco) / DURACAO_ANIMACAO_DADO);
            const desaceleracao = 1 - (1 - progresso) ** 3;
            const angulos = {
              x: inicio.x + (fim.x - inicio.x) * desaceleracao,
              y: inicio.y + (fim.y - inicio.y) * desaceleracao,
              z: inicio.z + (fim.z - inicio.z) * desaceleracao,
            };
            const balanço = 1 + Math.sin(progresso * Math.PI * 4) * 0.07 * (1 - progresso);
            desenharDado3D(canvas, cor, indiceFace, angulos, false, balanço, false);
            if (progresso < 1) window.requestAnimationFrame(quadro);
            else {
              revelarSelecao();
              if (rotuloFinal) dado.setAttribute("aria-label", rotuloFinal);
              desenharDado3D(canvas, cor, indiceFace, alvo, destaque);
              dado.classList.add("dado-combate-pulso");
              window.setTimeout(() => {
                dado.classList.remove("dado-combate-pulso");
                concluir();
              }, 520);
            }
          }
          window.requestAnimationFrame(quadro);
        }),
      );
    });
    return Promise.all(animacoes);
  }

  function facesDados(valores, escolhido, { cor, lado, animar = true, selecionaMenor = false }) {
    return `<div class="dados-combate" aria-label="Resultados dos dados">${valores
      .map((valor, indice) => {
        const classes = ["dado-combate", `dado-combate-${lado}`];
        const usado = indice === valores.indexOf(escolhido);
        classes.push(
          usado
            ? animar
              ? "dado-combate-destaque-pendente"
              : "dado-combate-maior"
            : animar
              ? "dado-combate-descarte-pendente"
              : "dado-combate-descartado",
        );
        if (valor === 20) classes.push("dado-combate-vinte");
        if (valor === 1) classes.push("dado-combate-um");
        if (!animar) classes.push("dado-combate-estatico");
        const rotulo = usado
          ? `${selecionaMenor ? "Menor" : "Maior"} resultado usado: ${valor}`
          : `Resultado descartado: ${valor}`;
        return marcadorDado(valor, classes, rotulo, cor);
      })
      .join("")}</div>`;
  }

  function telaDisputaDados(run, movimentoReduzido) {
    const evento = Jogo.eventoPorId(run.eventoId);
    const pendente = run.combatePendente;
    const opcao = Jogo.engine.opcaoCombatePendente(run);
    const duelo = pendente.ehDueloDados === true;
    const definicao = duelo ? opcao?.dueloDados : opcao?.testeDados;
    if (!evento || !pendente || !definicao) return;
    const resultado = pendente.etapa === "resultado";
    const rolagem = resultado ? (duelo ? pendente.rolagemDueloDados : pendente.rolagemTesteDados) : null;
    const desfecho = rolagem && definicao[rolagem.desfecho];
    if (resultado && (!rolagem || !desfecho)) return;
    const corDado = coresPrincipaisHerdeiros[run.traco] || "#8B673D";
    const quantidadeDados = resultado
      ? pendente.dadosHerdeiro.length
      : Jogo.engine.quantidadeDadosTesteDados(run);
    const dadosHerdeiro = resultado
      ? facesDados(pendente.dadosHerdeiro, rolagem.face, { cor: corDado, lado: "jogador" })
      : `<div class="dados-combate" aria-label="${numero(quantidadeDados)} ${quantidadeDados === 1 ? "dado" : "dados"} de vinte faces">${Array.from({ length: quantidadeDados }, () => marcadorDado("?", ["dado-combate", "dado-combate-jogador", "dado-combate-aguardando"], "", corDado)).join("")}</div>`;
    const faceOponente = pendente.dadosInimigo[0];
    const dadoOponente = !duelo
      ? ""
      : resultado
        ? facesDados([faceOponente], faceOponente, {
            cor: "#F9EEDD",
            lado: "inimigo",
            animar: pendente.rerrolagens === 0,
          })
        : `<div class="dados-combate" aria-label="Um dado do velho cego">${marcadorDado("?", ["dado-combate", "dado-combate-inimigo", "dado-combate-aguardando"], "", "#F9EEDD")}</div>`;
    const bonusOponente = duelo ? definicao.bonusOponente || 0 : 0;
    const veredito =
      rolagem?.face === 20
        ? "Sucesso crítico"
        : rolagem?.face === 1
          ? "Falha crítica"
          : duelo
            ? rolagem?.desfecho === "sucesso"
              ? "Vitória"
              : "Derrota"
            : rolagem?.desfecho === "sucessoComCusto"
              ? "Sucesso com custo"
              : rolagem?.desfecho === "sucesso"
                ? "Sucesso"
                : "Falha";
    const total = !resultado
      ? ""
      : duelo
        ? `<p class="disputa-totais"><span>${esc(tituloHerdeiro(run.traco))}<strong>${numero(rolagem.face)}</strong></span><span aria-hidden="true">×</span><span>Oponente<strong>${numero(rolagem.totalOponente)}</strong><small>${numero(rolagem.faceOponente)}${rolagem.bonusOponente ? ` + ${numero(rolagem.bonusOponente)}` : ""}</small></span></p>`
        : `<p class="disputa-teste-total"><strong>${numero(rolagem.face)} ${rolagem.bonus < 0 ? "−" : "+"} ${numero(Math.abs(rolagem.bonus))} = ${numero(rolagem.total)}</strong><span>Dificuldade ${numero(rolagem.dificuldade)}</span></p>`;
    const diferencaTeste = resultado
      ? duelo
        ? rolagem.face - rolagem.totalOponente
        : rolagem.total - rolagem.dificuldade
      : 0;
    const leituraTeste = !resultado
      ? ""
      : rolagem.face === 20
        ? "20 natural: sucesso crítico."
        : rolagem.face === 1
          ? "1 natural: falha crítica."
          : duelo
            ? diferencaTeste === 0
              ? "Empate: o oponente vence."
              : `Você ${diferencaTeste > 0 ? "venceu" : "perdeu"} por ${numero(Math.abs(diferencaTeste))} ${Math.abs(diferencaTeste) === 1 ? "ponto" : "pontos"}.`
            : diferencaTeste === 0
              ? "Você alcançou a dificuldade."
              : diferencaTeste > 0
                ? `Você superou a dificuldade por ${numero(diferencaTeste)} ${diferencaTeste === 1 ? "ponto" : "pontos"}.`
                : `${Math.abs(diferencaTeste) === 1 ? "Faltou 1 ponto" : `Faltaram ${numero(Math.abs(diferencaTeste))} pontos`} para o sucesso completo.`;
    const resumoResultado = resultado
      ? `<section class="resultado-disputa ${rolagem.desfecho === "falha" ? "resultado-disputa-derrota" : "resultado-disputa-vitoria"}${movimentoReduzido ? "" : ' data-aguardando-rolagem aria-hidden="true"'} aria-live="polite">
          <p class="disputa-veredito">${veredito}</p>
          ${total}
          <p class="disputa-margem">${leituraTeste}</p>
          <p class="disputa-texto-teste">${esc(desfecho.resultado)}</p>
        </section>`
      : "";
    const itensDisputa = inventario(run, { somenteCombate: true, manterAberto: true });
    const rerrolagemGratisDisponivel =
      resultado && (pendente.rerrolagensGratis > 0 || pendente.rerrolagemCoringa === 1);
    return `<section class="disputa-combate disputa-teste-dados${duelo ? " disputa-duelo-dados" : ""}" aria-labelledby="titulo-disputa-combate">
        <div class="disputa-combate-conteudo">
          <div class="disputa-titulo"><h1 id="titulo-disputa-combate">${esc(evento.titulo)}</h1><button type="button" class="botao ajuda-combate" data-acao="ajuda-combate" aria-label="Ajuda de combate">?</button></div>${leituraProbabilidades(run, opcao)}<p class="regra-empate">${esc(Jogo.sistemasUI?.regraEmpate(run) || "")}</p>
          <div class="disputa-participantes${duelo ? "" : " disputa-participantes-teste"}">
            <section class="disputa-lado disputa-herdeiro" aria-label="Rolagem do herdeiro">
              <h2>${esc(tituloHerdeiro(run.traco))}</h2>
              ${dadosHerdeiro}
              ${quantidadeDados > 1 ? `<p class="disputa-dados-teste-info">${resultado ? `Maior face entre ${numero(quantidadeDados)} dados` : `Role ${numero(quantidadeDados)} dados e fique com a maior face`}</p>` : ""}
              ${!duelo && !resultado ? `<p class="disputa-dados-teste-info disputa-dificuldade-previa">Dificuldade ${numero(definicao.dificuldade)}</p>` : ""}
            </section>
            ${duelo ? `<span class="disputa-versus" aria-hidden="true">×</span><section class="disputa-lado disputa-inimigo" aria-label="Rolagem do velho cego"><h2>Velho cego</h2>${dadoOponente}${bonusOponente ? `<p class="disputa-bonus"><span>Bônus <strong>+${numero(bonusOponente)}</strong></span></p>` : ""}</section>` : ""}
          </div>
          ${resumoResultado}
          ${itensDisputa ? `<section class="disputa-itens" aria-label="${resultado ? "Itens disponíveis para rerrolagem" : "Itens de dados"}"${resultado && !movimentoReduzido ? " inert" : ""}><h2>${resultado ? "Itens de rerrolagem" : "Itens de dados"}</h2>${itensDisputa}</section>` : ""}
          <div class="disputa-acoes">
            ${rerrolagemGratisDisponivel ? `<button type="button" class="botao disputa-acao-secundaria" data-acao="combate-rerrolar-livre" aria-label="${quantidadeDados === 1 ? "Rolar o dado novamente" : "Rolar todos os dados novamente"}" title="${quantidadeDados === 1 ? "Rolar o dado novamente" : "Rolar todos os dados novamente"}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5"/></svg></button>` : ""}
            ${resultado ? '<button class="botao primario" data-acao="combate-continuar">Continuar</button>' : '<button class="botao primario" data-acao="combate-rolar">Rolar dados</button>'}
          </div>
        </div>
      </section>`;
  }

  function telaCombate(run, movimentoReduzido) {
    const evento = Jogo.eventoPorId(run.eventoId);
    const pendente = run.combatePendente;
    if (pendente?.ehTesteDados || pendente?.ehDueloDados) return telaDisputaDados(run, movimentoReduzido);
    const perfil = Jogo.engine.perfilCombate(run);
    if (!evento?.batalha || !pendente || !perfil) return;
    const chanceDestino =
      run.flags?.mao_do_destino_ativa && pendente.etapa === "preparacao"
        ? Jogo.engine.chanceVitoriaCombate(run)
        : null;
    const previsaoDestino =
      chanceDestino === null
        ? ""
        : `<p class="mao-destino-chance" role="status"><span class="mao-destino-selo" aria-hidden="true">${iconesDisputa.dado}</span><span class="mao-destino-leitura"><span class="mao-destino-nome">A Mão do Destino</span><span class="mao-destino-rotulo">${pendente.ehBoss ? "Chance de derrotar o chefe" : "Chance de vencer este embate"}</span></span><strong><span>${numero(Math.round(chanceDestino * 1000) / 10)}</span><small>%</small></strong></p>`;
    const inimigo = evento.batalha.inimigo || "Inimigo";
    const resultado = ["resultado", "desfecho"].includes(pendente.etapa);
    const animarRolagem = pendente.etapa !== "desfecho";
    const corDadoHerdeiro = coresPrincipaisHerdeiros[run.traco] || "#8B673D";
    const corDadoInimigo = "#F9EEDD";
    const bonusAtaqueItem = run.efeitosPreparados?.bonusAtaqueProximaBatalha || 0;
    const bonusDadosItem =
      (run.efeitosPreparados?.bonusDadosCombateProximaBatalha || 0) + (run.dadosCombatePermanentes || 0);
    const marcaBonusAtaqueItem = bonusAtaqueItem
      ? `<span class="disputa-origem-item" role="img" aria-label="Bônus de item no ataque: ${assinado(bonusAtaqueItem)}" title="Bônus de item no ataque: ${assinado(bonusAtaqueItem)}">${iconesDisputa.dado}</span>`
      : "";
    const marcaBonusDadosItem = bonusDadosItem
      ? `<span class="disputa-origem-item" role="img" aria-label="${numero(bonusDadosItem)} dados extras de item" title="${numero(bonusDadosItem)} dados extras de item">${iconesDisputa.dado}</span>`
      : "";
    const maiorHerdeiro = resultado ? Math.max(...pendente.dadosHerdeiro) : null;
    const maiorInimigo = resultado
      ? perfil.inimigoEscolheMenor
        ? Math.min(...pendente.dadosInimigo)
        : Math.max(...pendente.dadosInimigo)
      : null;
    const totalHerdeiro = resultado ? maiorHerdeiro + perfil.ataque + perfil.bonusResultado : null;
    const totalInimigo = resultado ? maiorInimigo + perfil.defesa : null;
    const venceuNaRolagem =
      resultado &&
      (perfil.tracoInimigo === "veloz" ? totalHerdeiro > totalInimigo : totalHerdeiro >= totalInimigo);
    const lancaAtiva = !perfil.batalha.semOverrides && run.lancaHeroiBatalhas > 0;
    const adagaAtiva = !perfil.batalha.semOverrides && run.inventario.includes("adaga_amaldicoada");
    const venceu =
      resultado &&
      (pendente.ehBoss
        ? pendente.etapa === "desfecho" || (!perfil.batalha.forcarDerrota && venceuNaRolagem)
        : !perfil.batalha.forcarDerrota && (lancaAtiva || adagaAtiva || venceuNaRolagem));
    const leituraDano =
      resultado && !venceu ? Jogo.engine.calcularDanoDerrota(run, perfil, totalHerdeiro, totalInimigo) : null;
    if (leituraDano) {
      leituraDano.dano = Jogo.sistemas.proteger(run, leituraDano.dano);
    }
    const detalhesDano = !leituraDano
      ? ""
      : `<p class="disputa-dano-final">${leituraDano.danoAnulado ? "Golpe anulado" : `Dano recebido: <strong>${numero(leituraDano.dano)}</strong>`}</p>`;
    const posturas = resultado
      ? ""
      : `<fieldset class="disputa-posturas" aria-describedby="descricao-postura-combate"><legend>Postura de combate</legend><div class="disputa-posturas-opcoes">${Object.entries(
          Jogo.engine.posturasCombate,
        )
          .map(
            ([id, postura]) =>
              `<button type="button" data-acao="combate-postura" data-postura="${id}" aria-pressed="${(pendente.postura || "equilibrada") === id}">${esc(postura.nome)}</button>`,
          )
          .join(
            "",
          )}</div><p id="descricao-postura-combate">${esc(perfil.postura.descricao)}</p><details class="disputa-regra-margem"><summary>Dano nas derrotas</summary><p>Diferença de até 2 pontos: metade do dano. De 3 a 5: 75% do dano. Depois entram a postura, o Escudo e as proteções.</p></details></fieldset>`;
    const danoPorAcerto = Jogo.engine.danoAcertoChefe(run, perfil, totalHerdeiro || 0, totalInimigo || 0);
    const acertosRestantes = pendente.ehBoss ? Math.ceil(pendente.vidaChefe / danoPorAcerto) : 0;
    const objetivoChefe =
      pendente.ehBoss && pendente.etapa !== "desfecho"
        ? `<p class="disputa-objetivo-chefe">${["resiliente", "fragil"].includes(perfil.tracoInimigo) ? "Dano varia com a margem da vitória" : `${numero(danoPorAcerto)} de dano por acerto`} · ${["resiliente", "fragil", "sentinela", "tenaz"].includes(perfil.tracoInimigo) ? "Acertos dependem da característica" : `${numero(acertosRestantes)} ${acertosRestantes === 1 ? "acerto restante" : "acertos restantes"}`}</p>`
        : "";
    const derrotaFatal =
      !pendente.ehBoss && Boolean(evento.letal || perfil.batalha.letal || perfil.batalha.encerrarAoFalhar);
    const previsaoDano = leituraDano
      ? `${derrotaFatal ? '<p class="disputa-regra">A derrota neste confronto é fatal.</p>' : `<p class="disputa-vida-prevista">Vida após o golpe: ${numero(Math.max(0, run.atributos.hp - leituraDano.dano))} / ${numero(run.hpMax)}</p>`}${detalhesDano}`
      : pendente.ehBoss
        ? `<p class="disputa-dano-final">${pendente.etapa === "desfecho" ? "Vida do chefe: 0" : `Dano no chefe: <strong>${numero(Math.min(danoPorAcerto, pendente.vidaChefe))}</strong> Vida`}</p>`
        : "";
    const desfechoForcado = resultado
      ? perfil.batalha.forcarDerrota
        ? "Esta batalha determina a derrota, independentemente dos dados."
        : lancaAtiva
          ? "A Lança do Herói garante a vitória nesta batalha."
          : adagaAtiva && !venceuNaRolagem
            ? "A Adaga amaldiçoada garante a vitória nesta batalha."
            : venceuNaRolagem && totalHerdeiro === totalInimigo
              ? "Empate: o herdeiro vence."
              : ""
      : "";
    const dadoHeroi = resultado
      ? facesDados(pendente.dadosHerdeiro, maiorHerdeiro, {
          cor: corDadoHerdeiro,
          lado: "jogador",
          animar: animarRolagem,
        })
      : `<div class="dados-combate" aria-label="${perfil.dadosHerdeiro} dados do herdeiro">${Array.from({ length: perfil.dadosHerdeiro }, () => marcadorDado("?", ["dado-combate", "dado-combate-jogador", "dado-combate-aguardando"], "", corDadoHerdeiro)).join("")}</div>`;
    const dadoInimigo = resultado
      ? facesDados(pendente.dadosInimigo, maiorInimigo, {
          cor: corDadoInimigo,
          lado: "inimigo",
          animar: animarRolagem && pendente.rerrolagens === 0,
          selecionaMenor: perfil.inimigoEscolheMenor,
        })
      : `<div class="dados-combate" aria-label="${perfil.dadosInimigo} dados do inimigo">${Array.from({ length: perfil.dadosInimigo }, () => marcadorDado("?", ["dado-combate", "dado-combate-inimigo", "dado-combate-aguardando"], "", corDadoInimigo)).join("")}</div>`;
    const vereditoResultado = pendente.ehBoss
      ? pendente.etapa === "desfecho"
        ? "Chefe derrotado"
        : venceu
          ? "Acerto no chefe"
          : "Contra-ataque do chefe"
      : venceu
        ? "Vitória"
        : "Derrota";
    const resumoResultado = resultado
      ? `<section class="resultado-disputa ${venceu ? "resultado-disputa-vitoria" : "resultado-disputa-derrota"}"${movimentoReduzido || !animarRolagem ? "" : ' data-aguardando-rolagem aria-hidden="true"'} aria-live="polite">
          <p class="disputa-veredito">${vereditoResultado}</p>
          <p class="disputa-totais"><span>${esc(tituloHerdeiro(run.traco))}<strong>${numero(totalHerdeiro)}</strong><small>${numero(maiorHerdeiro)} ${perfil.ataque < 0 ? "−" : "+"} ${numero(Math.abs(perfil.ataque))}${perfil.bonusResultado ? ` + ${numero(perfil.bonusResultado)}` : ""}</small></span><span aria-hidden="true">×</span><span>${esc(inimigo)}<strong>${numero(totalInimigo)}</strong><small>${numero(maiorInimigo)} ${perfil.defesa < 0 ? "−" : "+"} ${numero(Math.abs(perfil.defesa))}</small></span></p>
          ${previsaoDano}
          ${desfechoForcado ? `<p class="disputa-regra">${esc(desfechoForcado)}</p>` : ""}
        </section>`
      : "";
    const resumoTrocaChefe =
      pendente.ehBoss && pendente.etapa === "preparacao" && pendente.ultimaTrocaChefe
        ? `<p class="resumo-troca-chefe" aria-live="polite">${esc(pendente.ultimaTrocaChefe)}</p>${pendente.protecaoConsumida ? `<p class="efeito-consumido">${esc(pendente.protecaoConsumida)}</p>` : ""}`
        : "";
    const itensCombate = inventario(run, { somenteCombate: true, manterAberto: true });
    const rerrolagemCoringaDisponivel =
      pendente.etapa === "resultado" &&
      (pendente.rerrolagemCoringa === 1 || pendente.rerrolagensGratis > 0) &&
      !perfil.batalha.forcarDerrota;
    const caracteristica = Jogo.engine.caracteristicasCombate[perfil.tracoInimigo];
    const nomeTracoInimigo = caracteristica?.nome;
    const premio = Jogo.itens.find((item) => item.id === pendente.premioItemId);
    const descricaoTracoInimigo =
      (caracteristica?.descricao || "") + (premio ? " Recompensa: " + premio.nome + "." : "");
    const efeitosCoringa = {
      1: "+1 dado",
      2: "+2 Ataque",
      3: "Inimigo com desvantagem",
      4: "Rerrolagem grátis",
      5: "Defesa inimiga −1",
      6: "Sem efeito",
    };
    const avisoCoringa =
      run.traco === "coringa" && pendente.coringa
        ? `<p class="disputa-efeito-coringa">D6 ${numero(pendente.coringa)} · ${esc(efeitosCoringa[pendente.coringa])}</p>`
        : "";
    const bonusTrevo = perfil.bonusResultado
      ? `<span class="disputa-origem-item" role="img" aria-label="Bônus do Trevo da sorte: +${numero(perfil.bonusResultado)} no total" title="Bônus do Trevo da sorte: +${numero(perfil.bonusResultado)} no total">${iconesDisputa.dado}</span>`
      : "";
    const itensDaDisputa = itensCombate
      ? `<section class="disputa-itens" aria-label="Itens disponíveis para este combate"${resultado && animarRolagem && !movimentoReduzido ? " inert" : ""}><h2>${resultado ? "Itens de rerrolagem" : "Itens de combate"}</h2>${itensCombate}</section>`
      : "";
    return `<section class="disputa-combate" aria-labelledby="titulo-disputa-combate">
        <div class="disputa-combate-conteudo">
          <div class="disputa-titulo"><h1 id="titulo-disputa-combate">${esc(evento.titulo)}</h1><button type="button" class="botao ajuda-combate" data-acao="ajuda-combate" aria-label="Ajuda de combate">?</button></div><p class="regra-empate">${esc(Jogo.sistemasUI?.regraEmpate(run) || "")}</p>
          ${objetivoChefe}
          ${previsaoDestino}
          ${avisoCoringa}
          <div class="disputa-participantes">
            <section class="disputa-lado disputa-herdeiro" aria-label="Rolagem do herdeiro">
              <h2>${esc(tituloHerdeiro(run.traco))}${marcaBonusDadosItem}${bonusTrevo}</h2>
              ${dadoHeroi}
              <p class="disputa-bonus"><span>Ataque <strong>${assinado(perfil.ataque)}</strong></span><span class="disputa-bonus-marcas"><span class="disputa-bonus-tipo" role="img" aria-label="Bônus de Ataque aplicado à rolagem" title="Bônus de Ataque aplicado à rolagem">${iconesDisputa.espada}</span>${marcaBonusAtaqueItem}</span></p>
            </section>
            <span class="disputa-versus" aria-hidden="true">×</span>
            <div class="disputa-inimigo-coluna">
              <section class="disputa-lado disputa-inimigo" aria-label="Rolagem do inimigo">
                <h2>${esc(inimigo)}${nomeTracoInimigo ? `<button type="button" class="disputa-traco-inimigo${descricaoTracoInimigo ? " traco-tooltip" : ""}"${descricaoTracoInimigo ? ` tabindex="0" aria-label="${esc(`${nomeTracoInimigo}: ${descricaoTracoInimigo}`)}" data-tooltip="${esc(descricaoTracoInimigo)}"` : ""} aria-expanded="false" aria-controls="resumo-caracteristica-combate" data-acao="combate-caracteristica">${nomeTracoInimigo}</button>` : ""}</h2>
                ${dadoInimigo}
                <p class="disputa-bonus"><span class="traco-tooltip" tabindex="0" aria-label="Defesa ${assinado(perfil.defesa)}: valor somado ao dado escolhido do inimigo" data-tooltip="Este valor é somado ao dado escolhido do inimigo.">Defesa <strong>${assinado(perfil.defesa)}</strong></span><span class="disputa-bonus-marcas"><span class="disputa-bonus-tipo" role="img" aria-label="Bônus de Defesa do inimigo aplicado à rolagem" title="Bônus de Defesa do inimigo aplicado à rolagem">${iconesDisputa.escudo}</span></span></p>
              </section>
            </div>
          </div>
          ${resumoTrocaChefe}
          ${posturas}
          ${!resultado && perfil.tracoInimigo === "distraido" ? `<button type="button" class="botao" data-acao="combate-distrair" ${pendente.distracaoPaga || run.atributos.gold < 1 ? "disabled" : ""}>${pendente.distracaoPaga ? "Distração paga: -3 Defesa" : "Distrair: 1 Gold por -3 Defesa"}</button>` : ""}
          <p id="resumo-caracteristica-combate" class="disputa-caracteristica-resumo" hidden>${esc(descricaoTracoInimigo)}</p>
          ${resumoResultado}
          ${itensDaDisputa}
          <div class="disputa-acoes">
            ${rerrolagemCoringaDisponivel ? '<button type="button" class="botao disputa-acao-secundaria" data-acao="combate-rerrolar-livre" aria-label="Rolar novamente todos os dados do duelo" title="Rolar novamente todos os dados do duelo"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5"/></svg></button>' : ""}
            ${resultado ? `<button class="botao primario" data-acao="combate-continuar">${pendente.ehBoss ? (pendente.etapa === "desfecho" ? "Concluir luta" : "Aplicar turno") : "Continuar"}</button>` : '<button class="botao primario" data-acao="combate-rolar">Rolar dados</button>'}
          </div>
        </div>
      </section>`;
  }

  function jogo(run, { textoCompleto = false } = {}) {
    if (Jogo.pressagios?.bloqueia(run) && !run.aguardaDecisaoCulto) {
      cenaPressagio(run);
      return;
    }
    Jogo.engine.sincronizarItemVampirismo(run);
    const eventoDaRun = Jogo.eventoPorId(run.eventoId);
    const eventoBase = run.aguardaDecisaoCulto ? Jogo.eventoPorId("ultimo_habitante") : eventoDaRun;
    const memoriaAnterior = run.legadoDaRun.memorias?.at(-1);
    const valoresMemoria = {
      rodada: memoriaAnterior?.rodada ?? "sem registro",
      honra: memoriaAnterior?.honra ?? "sem registro",
      motivo: memoriaAnterior?.motivo ?? "sem registro",
      herdeiro:
        nomeDoHerdeiro(memoriaAnterior?.traco) ||
        (["corajoso", "herdeira_leste"].includes(memoriaAnterior?.traco)
          ? "a herdeira anterior"
          : "o herdeiro anterior"),
      adocao: memoriaAnterior?.meninoAdotado
        ? "o menino que a linhagem acolheu"
        : "o herdeiro que veio antes",
    };
    const interpolarMemoria = (texto) =>
      texto?.replace(/\{\{(rodada|honra|motivo|herdeiro|adocao)\}\}/g, (_, campo) => valoresMemoria[campo]) ||
      "";
    const eventoComMemoria = eventoBase
      ? {
          ...eventoBase,
          texto: interpolarMemoria(eventoBase.texto),
          informacoes: interpolarMemoria(eventoBase.informacoes),
        }
      : eventoBase;
    const eventoComConselheiro =
      run.flags.menino_conselheiro && eventoBase?.conselheiroPadrao
        ? {
            ...eventoComMemoria,
            imagem: "assets/eventos-pessoas/menino-conselheiro.webp",
            imagemAlt: "O jovem conselheiro da vila apresenta seu parecer",
          }
        : eventoComMemoria;
    const evento = run.flags.entidade_x_pacto
      ? {
          ...eventoComConselheiro,
          informacoes: `${eventoComConselheiro.informacoes} A Marca da Entidade drena 1 ponto de Vida a cada rodada.`,
        }
      : eventoComConselheiro;
    const vidaChefeMaximaCarta = evento?.bossId ? Math.max(1, evento.batalha?.vidaMaxima || 100) : 0;
    const marcaChefeDerrotado = {
      barao: "barao_derrotado",
      culto: "lider_culto_derrotado",
      entidade: "entidade_derrotada",
      abissal: "senhor_do_abismo_derrotado",
    }[evento?.bossId];
    const vidaChefeAtualCarta = run.flags?.[marcaChefeDerrotado]
      ? 0
      : Math.max(0, Math.min(vidaChefeMaximaCarta, run.combatePendente?.vidaChefe ?? vidaChefeMaximaCarta));
    const vidaChefeAntesCarta = Math.max(
      0,
      Math.min(vidaChefeMaximaCarta, run.combatePendente?.vidaChefeAntes ?? vidaChefeAtualCarta),
    );
    const percentualVidaChefeCarta = vidaChefeMaximaCarta
      ? Math.round((vidaChefeAtualCarta / vidaChefeMaximaCarta) * 100)
      : 0;
    const percentualVidaChefeAntesCarta = vidaChefeMaximaCarta
      ? Math.round((vidaChefeAntesCarta / vidaChefeMaximaCarta) * 100)
      : 0;
    const chefeRecebeuDanoCarta = vidaChefeAtualCarta < vidaChefeAntesCarta;
    const indicadorVidaChefeCarta = evento?.bossId
      ? `<div class="vida-chefe-carta"><div class="barra-vida-chefe barra-vida-chefe--carta${chefeRecebeuDanoCarta ? " barra-vida-chefe-danificada" : ""}${vidaChefeAtualCarta === 0 ? " barra-vida-chefe-esgotada" : ""}" role="progressbar" aria-label="Vida de ${esc(evento.batalha.inimigo)}" aria-valuemin="0" aria-valuemax="${vidaChefeMaximaCarta}" aria-valuenow="${vidaChefeAtualCarta}" aria-valuetext="${vidaChefeAtualCarta} de ${vidaChefeMaximaCarta}" style="--vida-chefe-anterior:${percentualVidaChefeAntesCarta}%"><span style="--vida-chefe:${percentualVidaChefeCarta}%"></span></div><small class="barra-vida-chefe-valor barra-vida-chefe-valor--carta">VIDA ${numero(vidaChefeAtualCarta)} / ${numero(vidaChefeMaximaCarta)}</small></div>`
      : "";
    const descricaoRenda = textoDaRendaProxima(run);
    precarregarProximaCarta(evento?.imagem);
    const faixa = Jogo.estado.faixaHonra(run.atributos.honra);
    const condicaoId = run.condicao?.ativa;
    const nomesCondicoes = { licantropia: "Licantropia", vampirismo: "Vampirismo", possessao: "Possessão" };
    const descricaoCondicoes = {
      licantropia: "+2 Ataque · recupera 1 Vida por rodada",
      vampirismo:
        "+3 Ataque · +2 Escudo · perde 1 Vida por rodada; Sede de sangue: 1 aldeão por até 20 Vida, a cada 6 rodadas",
      possessao: "+2 Ataque · revela a Honra das escolhas",
    };
    const classeCondicao = condicaoId
      ? ` condicao-${condicaoId}${run.condicao.abracada ? " condicao-abracada" : ""}`
      : "";
    const transformacoesAtivas = [
      run.flags?.olhos_mercurio_ativo && {
        classe: "transformacao-olhos-mercurio",
        nome: "Olhos de Mercúrio",
        detalhe: "Mostra os efeitos em Gold e Vida antes da escolha.",
      },
      run.flags?.olho_mil_nomes_ativo && {
        classe: "transformacao-olho-mil-nomes",
        nome: "Olho dos Mil Nomes",
        detalhe: "Mostra ganhos positivos de Habitantes antes da escolha.",
      },
      run.flags?.mao_do_destino_ativa && {
        classe: "transformacao-mao-do-destino",
        nome: "Mão do Destino",
        detalhe: "Mostra a chance de vitória e concede uma rerrolagem grátis por batalha.",
      },
    ].filter(Boolean);
    const classeTransformacao = transformacoesAtivas
      .map((transformacao) => ` ${transformacao.classe}`)
      .join("");
    const statusTransformacoes = transformacoesAtivas
      .map(
        (transformacao) =>
          `<p class="transformacao-status ${transformacao.classe}" role="status"><strong>${transformacao.nome}</strong><span>${transformacao.detalhe}</span></p>`,
      )
      .join("");
    const molduraAtiva = detalheMoldura(condicaoId, run);
    const faixaDoRetrato = faixaRetrato(run.atributos.honra);
    const cultoAtivo = Boolean(run.cultoAtivo);
    const variacaoHonra =
      retratoExibido?.runId === run.id
        ? run.atributos.honra - (retratoExibido.honra ?? run.atributos.honra)
        : 0;
    const danoRecebido =
      retratoExibido?.runId === run.id
        ? Math.max(0, (retratoExibido.hp ?? run.atributos.hp) - run.atributos.hp)
        : 0;
    const transicaoCulto = retratoExibido?.runId === run.id && !retratoExibido.cultoAtivo && cultoAtivo;
    const anterior =
      retratoExibido?.runId === run.id &&
      (retratoExibido.traco !== run.traco ||
        (!cultoAtivo && retratoExibido.faixa !== faixaDoRetrato) ||
        retratoExibido.cultoAtivo !== cultoAtivo)
        ? retratoExibido
        : null;
    if (variacaoHonra !== 0 && !cultoAtivo)
      precarregarProximoRetrato(run.traco, faixaDoRetrato, cultoAtivo, Math.sign(variacaoHonra));
    const resolvido = run.fase === "resultado";
    const emCombate = run.fase === "combate";
    const categoriaEvento = categoriaVisualEvento(evento);
    const movimentoReduzido =
      !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderDisputa = ++renderDisputaAtual;
    const animarTexto =
      !resolvido &&
      !emCombate &&
      !textoCompleto &&
      !movimentoReduzido &&
      Jogo.ui.preferenciaTexto?.() !== "imediato";
    const escolhas = Jogo.engine.opcoes(evento, run);
    const escudoPrevisto =
      run.atributos.escudo +
      (run.efeitosPreparados.bonusEscudoProximaBatalha || 0) +
      (run.inventario.includes("manto_de_folhas") ? (run.estacao === "inverno" ? 4 : 3) : 0);
    const construcoesRun = [...new Set(run.construcoes || [])].map((id) => ({
      id,
      ...(Object.hasOwn(nomesConstrucoes, id)
        ? nomesConstrucoes[id]
        : { nome: id, bonus: "Bônus registrado nesta crônica" }),
    }));
    const totalItensInventario = quantidadeItensInventario(run);
    const passivaDruida = Jogo.druida?.passivas[run.druidaPassiva] || {
      nome: "Companheiro",
      descricao: "A floresta acompanha esta rodada.",
    };
    const statusDruida = Jogo.druida?.ehDruida(run)
      ? `<div class="druida-status" aria-label="Passiva atual e calendário do Druida-Herdeiro">
      <p><strong>${esc(passivaDruida.nome)} nesta rodada:</strong> ${esc(passivaDruida.descricao)}</p>
    </div>`
      : "";
    mostrar(
      `
      <section class="cronica${resolvido ? " cronica--resultado" : ""}${evento.bossId ? " cronica--chefe" : ""}${run.aguardaDecisaoCulto ? " cronica--decisao-culto" : ""}${evento.mercadorias ? " cronica--mercador" : ""}${evento.id === "construcoes_da_vila" ? " cronica--obras-vila" : ""}${!resolvido && escolhas.length > 3 ? " cronica--quatro-escolhas" : ""}${run.inventarioAberto ? " inventario-aberto" : ""}${run.historicoCronicaAberto ? " historico-aberto" : ""}${run.construcoesAbertas ? " construcoes-aberto" : ""}" aria-labelledby="titulo-jogo">
        <div class="titulo-run"><div class="titulo-run-identificacao"><div class="titulo-run-linha"><h1 id="titulo-jogo">A sua crônica</h1></div><p class="linha-calendario">Rodada ${numero(run.rodada)} · ${nomesEstacao[run.estacao]} <span class="marcador-estacoes" role="img" aria-label="Ciclo das estações. Atual: ${esc(nomesEstacao[run.estacao])}."><i class="marca-estacao marca-primavera${run.estacao === "primavera" ? " ativa" : ""}"></i><i class="marca-estacao marca-verao${run.estacao === "verao" ? " ativa" : ""}"></i><i class="marca-estacao marca-outono${run.estacao === "outono" ? " ativa" : ""}"></i><i class="marca-estacao marca-inverno${run.estacao === "inverno" ? " ativa" : ""}"></i></span> · Ano ${numero(Jogo.anoDaRodada(run.rodada))}</p></div>
          <dl class="recursos-vila" aria-label="Recursos da vila">
            <div class="recurso-contador vila-contador"><dt>Habitantes da vila</dt><dd>${numero(run.atributos.habitantes)}</dd></div>
            ${run.traco === "herdeiro_culto" && !run.cultoAtivo ? `<div class="recurso-contador"><dt>Seguidores em reserva</dt><dd>${numero(run.seguidoresCulto)}</dd><small>Disponíveis ao aderir ao culto</small></div>` : ""}
            ${run.cultoAtivo ? `<div class="recurso-contador culto-contador"><dt>${transicaoCulto ? `<svg class="chama-passagem" viewBox="0 0 24 32" aria-hidden="true"><path class="chama-externa" d="M12 1c1 5-1 7-3 10-2 2-4 4-4 8a7 7 0 0 0 14 0c0-4-2-7-5-10 0 3-1 5-2 6 1-5 0-9 0-14Z"/><path class="chama-interna" d="M12 15c0 2-1 3-2 5a3.5 3.5 0 1 0 7 0c0-2-1-4-3-5 0 2-1 3-2 4 1-2 0-3 0-4Z"/></svg>` : ""}Seguidores do culto</dt><dd>${numero(run.seguidoresCulto)}</dd>${run.cultoRendaPorRodada ? `<small>Templo: +${numero(run.cultoRendaPorRodada)} por rodada</small>` : ""}</div>` : ""}
            <div class="testes-honra testes-debug"><dt>Debug</dt><dd>
              <button class="controle-honra" data-acao="habitantes-menos" ${run.aguardaDecisaoCulto ? "disabled" : ""} aria-label="Diminuir habitantes em 50 para debug" title="Diminuir habitantes em 50 para debug">Hab. −50</button>
              <button class="controle-honra" data-acao="honra-mais" ${run.aguardaDecisaoCulto ? "disabled" : ""} aria-label="Ganhar 30 de honra para testes" title="Ganhar 30 de honra para testes">+30</button>
              <button class="controle-honra" data-acao="honra-menos" ${run.aguardaDecisaoCulto ? "disabled" : ""} aria-label="Perder 30 de honra para testes" title="Perder 30 de honra para testes">−30</button>
              <button class="controle-honra" data-acao="debug-transformacoes" aria-label="Ver prévia das transformações do herdeiro" title="Ver as transformações sem avançar a história">Transformações</button>
              <button class="controle-honra" data-acao="debug-mao-do-destino" aria-pressed="${Boolean(run.flags.mao_do_destino_ativa)}" title="Ativa ou desativa a Mão do Destino para testar os embates" ${run.aguardaDecisaoCulto || run.fase === "combate" ? "disabled" : ""}>Mão do Destino: ${run.flags.mao_do_destino_ativa ? "Ativa" : "Inativa"}</button>
              <button class="controle-honra" data-acao="debug-conquista" title="Ver a animação sem registrar uma conquista">Conquista</button>
              <button class="controle-honra" data-acao="debug-alternar-combates" aria-pressed="${Boolean(run.flags.debugSempreCombate)}" title="Força os sorteios comuns a escolher cartas de combate" ${run.aguardaDecisaoCulto || run.flags.debugApenasEventosD20 ? "disabled" : ""}>Forçar combate: ${run.flags.debugSempreCombate ? "Ativo" : "Inativo"}</button>
              <button class="controle-honra" data-acao="debug-alternar-eventos-d20" aria-pressed="${Boolean(run.flags.debugApenasEventosD20)}" aria-label="Limitar sorteios a eventos com testes ou duelos de dados" title="Os próximos sorteios comuns mostrarão apenas eventos com testes de d20 ou duelos de dados" ${run.aguardaDecisaoCulto || run.fase === "combate" ? "disabled" : ""}>Só eventos com dados: ${run.flags.debugApenasEventosD20 ? "Ativo" : "Inativo"}</button>
              <details class="debug-eventos">
                <summary class="controle-honra" aria-label="Ativar evento especial para debug" title="Ativar uma carta especial para debug">Especial</summary>
                <div class="debug-eventos-opcoes" aria-label="Cartas especiais para debug">
                  <details>
                    <summary class="controle-honra">Testar lutas de chefes</summary>
                    <button class="controle-honra" data-acao="debug-boss-barao" ${run.aguardaDecisaoCulto || run.fase === "combate" ? "disabled" : ""}>Embate com o Barão</button>
                    <button class="controle-honra" data-acao="debug-boss-culto" ${run.aguardaDecisaoCulto || run.fase === "combate" ? "disabled" : ""}>Líder do culto</button>
                    <button class="controle-honra" data-acao="debug-boss-entidade" ${run.aguardaDecisaoCulto || run.fase === "combate" ? "disabled" : ""}>Combate contra a Entidade</button>
                    <button class="controle-honra" data-acao="debug-boss-abissal" ${run.aguardaDecisaoCulto || run.fase === "combate" ? "disabled" : ""}>Senhor sob a lagoa</button>
                  </details>
                  <button class="controle-honra" data-acao="debug-especial-entidade" ${run.aguardaDecisaoCulto ? "disabled" : ""}>A Entidade</button>
                  <button class="controle-honra" data-acao="debug-especial-abissal" ${run.aguardaDecisaoCulto ? "disabled" : ""}>História abissal</button>
                  <button class="controle-honra" data-acao="debug-especial-zodiaco" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Zodíaco chinês</button>
                  <button class="controle-honra" data-acao="debug-especial-norte" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Deuses nórdicos</button>
                  <details><summary class="controle-honra">Maus Presságios</summary>
                    ${(Jogo.pressagios?.catalogo || []).map((p) => `<button class="controle-honra" data-acao="debug-pressagio" data-pressagio-id="${p.id}" ${run.aguardaDecisaoCulto || run.encontroLeste ? "disabled" : ""}>${esc(p.nome)}</button>`).join("")}
                    <button class="controle-honra" data-acao="debug-pressagio-sucesso" ${run.pressagios?.atual?.fase !== "ativo" ? "disabled" : ""}>Simular sucesso (aplica recompensa)</button>
                    <button class="controle-honra" data-acao="debug-pressagio-falha" ${run.pressagios?.atual?.fase !== "ativo" ? "disabled" : ""}>Simular falha (aplica penalidade)</button>
                    <button class="controle-honra" data-acao="debug-pressagio-limpar">Limpar presságio sem recompensa</button>
                  </details>
                  <details>
                    <summary class="controle-honra">Escolher evento nórdico</summary>
                    ${(Jogo.efeitosNordicos || [])
                      .map(
                        (efeito) =>
                          `<button class="controle-honra" data-acao="debug-especial-norte" data-evento-id="${efeito.eventoId}" ${run.aguardaDecisaoCulto ? "disabled" : ""}>${efeito.nome}: ${Jogo.eventoPorId(efeito.eventoId).titulo}</button>`,
                      )
                      .join("")}
                  </details>
                  <button class="controle-honra" data-acao="debug-contagio-uivos" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Evento: uivos</button>
                  <button class="controle-honra" data-acao="debug-contagio-hospede" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Evento: hóspede</button>
                  <button class="controle-honra" data-acao="debug-contagio-anel" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Evento: anel</button>
                  <button class="controle-honra" data-acao="debug-condicao-licantropia" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Forçar licantropia</button>
                  <button class="controle-honra" data-acao="debug-condicao-vampirismo" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Forçar vampirismo</button>
                  <button class="controle-honra" data-acao="debug-condicao-possessao" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Forçar possessão</button>
                  <button class="controle-honra" data-acao="debug-condicao-olhos-mercurio" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Forçar Olhos de Mercúrio</button>
                  <button class="controle-honra" data-acao="debug-condicao-olho-mil-nomes" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Forçar Olho dos Mil Nomes</button>
                  <button class="controle-honra" data-acao="debug-conselheiro" ${run.aguardaDecisaoCulto ? "disabled" : ""} title="Nomear o novo conselheiro e mostrar um conselho dele">Novo conselheiro</button>
                </div>
              </details>
            </dd></div>
          </dl>
          <nav class="titulo-run-acoes" aria-label="Ações da crônica"><button class="botao botao-icone velocidade-texto" type="button" data-acao="velocidade-texto" aria-label="${Jogo.ui.preferenciaTexto?.() === "imediato" ? "Texto direto na tela" : "Texto com animação de escrita"}" title="${Jogo.ui.preferenciaTexto?.() === "imediato" ? "Texto direto na tela" : "Texto com animação de escrita"}" aria-pressed="${Jogo.ui.preferenciaTexto?.() !== "imediato"}">Aa</button>
            ${run.pressagios?.atual ? `<button type="button" class="botao botao-icone pressagio-indicador" data-acao="pressagio-detalhes" aria-label="Mau presságio: ${esc(Jogo.pressagios.porId(run.pressagios.atual.id).nome)}. Ver condição e prazo" title="${esc(Jogo.pressagios.porId(run.pressagios.atual.id).nome)}"><span aria-hidden="true">☾</span><small>${Math.max(0, run.pressagios.atual.fim - run.rodada)}</small></button>` : ""}
            <button class="botao botao-icone botao-construcoes" data-acao="alternar-construcoes" aria-label="Ver ${numero(construcoesRun.length)} ${construcoesRun.length === 1 ? "construção" : "construções"} da vila" title="Construções da vila" aria-controls="painel-construcoes" aria-expanded="${Boolean(run.construcoesAbertas)}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m2.5 11 5.5-5 5.5 5v8.5H2.5V11Zm11 1.5 4.5-4 4.5 4v7H14"/><path d="M6 14h3v5.5H6zm11-1h2v2h-2zm-8-4h2v2H9z"/></svg><span aria-hidden="true">${numero(construcoesRun.length)}</span></button>
            <button class="botao botao-icone botao-inventario" data-acao="alternar-inventario" aria-label="Inventário: ${numero(totalItensInventario)} ${totalItensInventario === 1 ? "item" : "itens"}" title="Inventário: ${numero(totalItensInventario)} ${totalItensInventario === 1 ? "item" : "itens"}" aria-controls="painel-inventario" aria-expanded="${run.inventarioAberto}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7.5h16l1 13H3l1-13Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2M9 12v1m6-1v1"/></svg><span aria-hidden="true">${numero(totalItensInventario)}</span></button>
            <button class="botao botao-icone botao-cronicas" data-acao="alternar-progresso" aria-label="Ver crônicas" title="Crônicas" aria-controls="painel-progresso" aria-expanded="${run.historicoCronicaAberto}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 19.5h16M5 16l4-4 3 2 6-7"/><path d="M14.5 7H18v3.5"/></svg></button>
            <button class="botao botao-icone botao-tutorial" data-acao="tutorial" aria-label="Tutorial" title="Tutorial"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4.5c2.8-1.3 5.3-.4 7 1.1v14c-1.7-1.5-4.2-2.4-7-1.1zM19 4.5c-2.8-1.3-5.3-.4-7 1.1v14c1.7-1.5 4.2-2.4 7-1.1z"/><path d="M7.5 8h2M7.5 11h2M14.5 8h2M14.5 11h2"/></svg></button>
          </nav>
        </div>
        ${statusDruida}
        ${Jogo.sistemasUI?.companheiros(run) || ""}${run.sistemas?.transicao ? `<p class="transicao-estacao" role="status">${esc(run.sistemas.transicao)}</p>` : ""}
        ${run.passivaNordica ? bonusDivino(run.passivaNordica, "Hoje: ") : ""}
        ${run.encontroLeste ? `<p role="status">Visita do zodíaco: este encontro não passa o dia.</p>` : ""}
        ${run.efeitoDivino ? bonusDivino(run.efeitoDivino) : ""}
        <div class="mesa">
          <div class="coluna-herdeiro">
            <article class="carta carta-herdeiro honra-${faixa}${classeCondicao}${classeTransformacao}${danoRecebido > 0 ? " herdeiro-ferido" : ""}" aria-labelledby="titulo-herdeiro">
              ${retrato(run.traco, faixaDoRetrato, anterior, cultoAtivo)}
              ${danoRecebido > 0 ? '<span class="impacto-dano" aria-hidden="true"></span>' : ""}
              ${molduraAtiva}
              ${condicaoId ? `<button class="condicao-info-trigger condicao-${condicaoId}" type="button" data-acao="detalhes-condicao" aria-label="Ver detalhes de ${esc(condicaoNomes[condicaoId])}${condicaoId === "licantropia" ? `. ${esc(descricaoCicloLunar(run))}` : ""}" title="${esc(`${condicaoNomes[condicaoId]}: ${descricaoDaCondicao(condicaoId, run.condicao.abracada)}. ${condicaoId === "licantropia" ? `${descricaoCicloLunar(run)} ` : ""}Toque para ver os detalhes.`)}"><span>${esc(condicaoNomes[condicaoId])} <span aria-hidden="true">ⓘ</span></span></button>` : ""}
              <div class="carta-titulo herdeiro-carta-titulo"><h2 id="titulo-herdeiro">${esc(tituloHerdeiro(run.traco))}</h2><span class="traco-tooltip" tabindex="0" aria-label="${esc(descricoesTraco[run.traco] || "Traço do herdeiro")}" data-tooltip="${esc(descricoesTraco[run.traco] || "Traço do herdeiro")}">${esc(nomesTraco[run.traco] || "Herdeiro")}</span></div>
            </article>
            <div class="herdeiro-detalhes">
              ${condicaoId ? `<p class="condicao-status condicao-${condicaoId}" role="status"><strong>${esc(nomesCondicoes[condicaoId])}${run.condicao.abracada ? " abraçada" : " ativa"}</strong><span>${esc(descricaoCondicoes[condicaoId])}</span></p>` : ""}
              ${statusTransformacoes}
              ${atributos(run, variacaoHonra, descricaoRenda, danoRecebido)}
            </div>
          </div>
          <div class="coluna-evento">
            <article class="carta carta-evento honra-${faixa} tipo-evento-${categoriaEvento.classe}" ${evento.bossId ? `aria-label="${esc(evento.titulo)}"` : 'aria-labelledby="titulo-evento"'}>
              <span class="rotulo-tipo-evento">${esc(categoriaEvento.nome)}</span>
              <img class="imagem-evento${imagensComTomDaVila.has(evento.imagem) ? " imagem-evento--tom-vila" : ""}" src="${esc(evento.imagem)}" width="1024" height="1024" loading="lazy" decoding="async" alt="${esc(evento.imagemAlt)}">
              ${evento.bossId ? "" : '<button type="button" class="evento-detalhes-acionar" aria-label="Mostrar detalhes do evento" aria-controls="informacoes-evento" aria-expanded="false"></button>'}
            </article>
            <div class="evento-detalhes">
              ${indicadorVidaChefeCarta}
              ${evento.bossId ? "" : `<div class="evento-texto"><div class="carta-titulo evento-titulo"><h2 id="titulo-evento">${esc(evento.titulo)}</h2>${evento.entidadeX || evento.entidadeXInicio ? '<span class="marca-entidade">A Entidade</span>' : ""}</div><p>${esc(evento.texto)}</p></div>`}
              ${
                evento.bossId
                  ? ""
                  : `<aside id="informacoes-evento" class="informacoes" aria-label="Informações do evento"><p>${esc(evento.informacoes)}</p>${run.previsaoCorvo ? `<p class="previsao-corvo" role="status">Seu corvo prevê: ${esc(run.previsaoCorvo)}.</p>` : ""}
                ${evento.batalha && evento.batalha.mostrarLeitura !== false ? `<p class="batalha-escudo-lateral">Seu Escudo previsto: <strong>${numero(escudoPrevisto)}</strong>.</p>` : ""}
              </aside>`
              }
            </div>
          </div>
          <section class="coluna-escolhas" aria-label="${emCombate ? "Disputa de combate" : resolvido ? "Resultado da sua decisão" : "Sua decisão"}">
            ${emCombate ? telaCombate(run, movimentoReduzido) : ""}
            ${resolvido || emCombate ? "" : `<div class="evento-leitura"><div class="evento-leitura-titulo"><h2>${textoComNomesEspeciais(evento.titulo)}</h2>${evento.entidadeX || evento.entidadeXInicio ? '<span class="marca-entidade nome-especial-tremendo">A Entidade</span>' : ""}</div><p class="texto-evento-digitado" aria-live="off"><span class="leitor-de-tela">${esc(evento.texto)}</span><span data-texto-visual aria-hidden="true">${animarTexto ? "" : esc(evento.texto)}</span></p></div>`}
            ${
              emCombate
                ? ""
                : resolvido
                  ? resultado(run)
                  : `<div class="decisao-evento" data-decisao-evento ${animarTexto ? "hidden" : ""}><p class="leitor-de-tela" role="status" data-opcoes-disponiveis hidden>As opções estão disponíveis.</p><h2>${evento.mercadorias ? "O mercador oferece" : "Qual é a sua palavra?"}</h2>${ofertas(evento, run)}<div class="escolhas">${escolhas
                      .map((opcao, indice) => {
                        if (evento.id === "construcoes_da_vila" && opcao.construcoes?.length)
                          return escolhaConstrucao(opcao);
                        const previaHonra = [
                          honraRevelada(opcao, evento, run),
                          previsaoVisualOpcao(opcao, run),
                        ]
                          .filter(Boolean)
                          .join(" · ");
                        const itemPremio = Jogo.itens.find((item) => (opcao.itens || []).includes(item.id));
                        const raridadePremio = itemPremio?.raridade
                          ? `<small class="nome-raridade raridade-${esc(itemPremio.raridade)}"> (${esc(nomesRaridade[itemPremio.raridade])})</small>`
                          : "";
                        return `<button class="escolha${opcao.id === "juntar" && evento.id === "ultimo_habitante" ? " escolha-chamado" : ""}${itemPremio?.raridade ? ` item-raridade-${esc(itemPremio.raridade)}` : ""}" data-opcao="${esc(opcao.id)}" ${indice < 9 ? `aria-keyshortcuts="${indice + 1}"` : ""}><span class="escolha-conteudo">${opcao.combate ? iconesDisputa.espada : opcao.consumirItens?.length ? '<span class="acao-simbolo" aria-label="Uso de item">&#9671;</span> ' : ""}${textoComNomesEspeciais(opcao.texto)}${raridadePremio}${previaHonra ? `<small class="honra-revelada">${esc(previaHonra)}</small>` : ""}${leituraProbabilidades(run, opcao)}</span></button>`;
                      })
                      .join("")}${Jogo.sistemasUI.indisponiveis(evento, run)}</div></div>`
            }
            ${emCombate ? "" : inventario(run)}${emCombate ? "" : historicoCronica(run)}
            <section id="painel-construcoes" class="construcoes-painel" aria-labelledby="titulo-construcoes">
              <header class="construcoes-painel-cabecalho"><h2 id="titulo-construcoes">Construções da vila</h2><button class="painel-voltar-link construcoes-voltar" type="button" data-acao="fechar-construcoes" aria-label="Voltar à crônica">← Voltar</button></header>
              ${Jogo.sistemasUI.mapa(run)}
            </section>
          </section>
        </div>
      </section>`,
      "jogo",
      evento.bossId
        ? `chefe_${evento.bossId}`
        : cultoAtivo
          ? "culto"
          : evento.batalha
            ? "batalha"
            : run.estacao,
    );
    if (emCombate) app.querySelector(".cronica")?.classList.add("cronica--combate");
    if (emCombate) {
      const animacaoDados = desenharDadosCombate(movimentoReduzido);
      animacaoDisputaAtual = animacaoDados;
      const resultadoAguardando = app.querySelector(".resultado-disputa[data-aguardando-rolagem]");
      if (resultadoAguardando) {
        animacaoDados.then(() => {
          if (renderDisputa !== renderDisputaAtual || !resultadoAguardando.isConnected) return;
          resultadoAguardando.removeAttribute("data-aguardando-rolagem");
          resultadoAguardando.setAttribute("aria-hidden", "false");
          app.querySelector(".disputa-itens[inert]")?.removeAttribute("inert");
        });
      }
    } else {
      animacaoDisputaAtual = Promise.resolve();
      if (run.ultimoResultado?.dueloDados) desenharDadosCombate(true);
    }
    window.requestAnimationFrame(alinharIdentificacaoComMoldura);
    digitarTextoEvento(evento.texto, animarTexto);
    const acionadorDetalhesEvento = document.querySelector("#app .evento-detalhes-acionar");
    acionadorDetalhesEvento?.addEventListener("click", () => {
      const aberto = acionadorDetalhesEvento.closest(".cronica")?.classList.toggle("evento-detalhes-abertos");
      acionadorDetalhesEvento.setAttribute("aria-expanded", String(Boolean(aberto)));
      acionadorDetalhesEvento.setAttribute(
        "aria-label",
        aberto ? "Ocultar detalhes do evento" : "Mostrar detalhes do evento",
      );
    });
    Jogo.audio?.definirDucking(!evento.bossId && (resolvido || Boolean(evento.batalha)));
    if (
      tutorialForcado ||
      (etapaTutorial === null && !tutorialConcluidoNestaSessao && !tutorialFoiConcluido())
    ) {
      tutorialForcado = false;
      etapaTutorial = 0;
    }
    if (etapaTutorial !== null) desenharEtapaTutorial();
    const painelInventario = document.querySelector("#app .inventario");
    painelInventario?.addEventListener("toggle", () => {
      if (run.fase === "combate") {
        painelInventario.open = true;
        return;
      }
      const cronica = painelInventario.closest(".cronica");
      run.inventarioAberto = painelInventario.open;
      document
        .querySelector('#app [data-acao="alternar-inventario"]')
        ?.setAttribute("aria-expanded", String(painelInventario.open));
      if (painelInventario.open) {
        const historico = document.querySelector("#app .historico-cronica");
        run.construcoesAbertas = false;
        cronica?.classList.remove("construcoes-aberto");
        document
          .querySelector('#app [data-acao="alternar-construcoes"]')
          ?.setAttribute("aria-expanded", "false");
        run.historicoCronicaAberto = false;
        if (historico) historico.open = false;
        document
          .querySelector('#app [data-acao="alternar-progresso"]')
          ?.setAttribute("aria-expanded", "false");
        cronica?.classList.remove("historico-aberto");
      }
      cronica?.classList.toggle("inventario-aberto", painelInventario.open);
      ajustarTela();
    });
    const painelHistorico = document.querySelector("#app .historico-cronica");
    painelHistorico?.addEventListener("toggle", () => {
      const cronica = painelHistorico.closest(".cronica");
      run.historicoCronicaAberto = painelHistorico.open;
      document
        .querySelector('#app [data-acao="alternar-progresso"]')
        ?.setAttribute("aria-expanded", String(painelHistorico.open));
      if (painelHistorico.open) {
        const inventario = document.querySelector("#app .inventario");
        run.construcoesAbertas = false;
        cronica?.classList.remove("construcoes-aberto");
        document
          .querySelector('#app [data-acao="alternar-construcoes"]')
          ?.setAttribute("aria-expanded", "false");
        run.inventarioAberto = false;
        if (inventario) inventario.open = false;
        document
          .querySelector('#app [data-acao="alternar-inventario"]')
          ?.setAttribute("aria-expanded", "false");
        cronica?.classList.remove("inventario-aberto");
      }
      cronica?.classList.toggle("historico-aberto", painelHistorico.open);
      ajustarTela();
    });
    retratoExibido = {
      runId: run.id,
      traco: run.traco,
      faixa: faixaDoRetrato,
      cultoAtivo,
      honra: run.atributos.honra,
      hp: run.atributos.hp,
    };
    animarRetrato();
    notificarConquistas(run);
  }

  const titulosFim = {
    vitoria: "Uma crônica cumprida.",
    vitoria_culto: "A crônica do chamado.",
    vitoria_honra: "A crônica do povo.",
    vitoria_barao: "O Barão foi derrotado.",
    vitoria_abissal: "A crônica das profundezas.",
  };

  function fim(run, legadoSalvo) {
    const venceu = run.fim.tipo.startsWith("vitoria");
    const tituloFim = titulosFim[run.fim.tipo] || (venceu ? "Uma crônica cumprida." : "Um herdeiro se vai.");
    const melhoresRuns = Jogo.save.lerLegado().melhoresRuns || [];
    const trofeuId = { vitoria_barao: "estandarte_do_barao", vitoria_abissal: "lamina_da_lagoa" }[
      run.fim.tipo
    ];
    const trofeu = trofeuId && Jogo.itens.find((item) => item.id === trofeuId);
    mostrar(
      `<section class="fim fim--${esc(run.fim.tipo)}" aria-labelledby="titulo-fim">
      <div class="fim-retrato">${retrato(run.traco || "corajoso", faixaRetrato(run.atributos.honra || 0), null, Boolean(run.cultoAtivo))}</div>
      <h1 id="titulo-fim">${tituloFim}</h1>
      <h2 class="fim-nome">${esc(tituloHerdeiro(run.traco))}</h2>
      <p class="subtitulo">${esc(run.fim.motivo)}</p>
      ${legadoSalvo ? '<p class="fim-salvo" role="status">Esta crônica foi registrada no legado.</p>' : ""}
      ${trofeu ? `<section class="fim-recompensa"><h2>Troféu: ${esc(trofeu.nome)}</h2><p>${legadoSalvo ? "Encontro de obtenção desbloqueado para outra crônica." : "Ao salvar o legado, você desbloqueia seu encontro de obtenção."} O próximo herdeiro deverá conquistá-lo; não começa com o item.</p></section>` : ""}
      <dl class="resumo-fim"><div><dt>Rodadas</dt><dd>${numero(run.rodada)}</dd></div><div><dt>Habitantes</dt><dd>${numero(run.atributos.habitantes)}</dd></div></dl>
      ${historicoCronica(run, { id: "historico-fim", titulo: "Histórico da crônica", recentesPrimeiro: false, expandido: false })}
      ${
        venceu
          ? `<section class="recordes-fim"><h2>Melhores crônicas</h2><ol>${melhoresRuns
              .slice(0, 5)
              .map(
                (registro) =>
                  `<li><span>${esc(rotuloHerdeiro(registro.traco))}</span><strong>${numero(registro.pontuacao)} pontos</strong></li>`,
              )
              .join("")}</ol></section>`
          : ""
      }
      <p class="fim-memoria">Você não saberá o que afetou.<br>Porém o povo irá lembrar.</p>
      <div class="acoes-menu">${legadoSalvo ? `<button class="botao primario" data-acao="novo-herdeiro">Um novo herdeiro</button><button class="botao" data-acao="menu">Voltar ao início</button>` : `<p role="status">O encerramento ainda não pôde ser salvo. As conquistas ficam nesta sessão, mas podem se perder ao fechar a página.</p><button class="botao primario" data-acao="tentar-salvar">Tentar salvar novamente</button><button class="botao" data-acao="novo-herdeiro">Outro herdeiro sem salvar</button>`}</div>
    </section>`,
      "fim",
    );
    notificarConquistas(run, !legadoSalvo);
  }

  function confirmarImportacao() {
    const dialogo = document.createElement("dialog");
    dialogo.className = "confirmacao";
    dialogo.setAttribute("aria-labelledby", "titulo-confirmacao-importacao");
    dialogo.innerHTML = `<h2 id="titulo-confirmacao-importacao">Importar progresso?</h2><p>O arquivo substituirá a crônica e o legado guardados neste navegador. Exporte o progresso atual antes de trocar de arquivo.</p><form method="dialog"><button class="botao" value="cancelar" autofocus>Cancelar</button><button class="botao primario" value="importar">Escolher arquivo</button></form>`;
    document.body.append(dialogo);
    dialogo.addEventListener("click", (evento) => {
      if (evento.target === dialogo) dialogo.close("cancelar");
    });
    return new Promise((resolve) => {
      dialogo.addEventListener(
        "close",
        () => {
          resolve(dialogo.returnValue === "importar");
          dialogo.remove();
        },
        { once: true },
      );
      dialogo.showModal();
    });
  }

  function alternarConstrucoes(run, aberta = !run.construcoesAbertas) {
    run.construcoesAbertas = aberta;
    const cronica = document.querySelector("#app .cronica");
    if (aberta) {
      run.inventarioAberto = false;
      run.historicoCronicaAberto = false;
      const inventario = document.querySelector("#app .inventario");
      const historico = document.querySelector("#app .historico-cronica");
      if (inventario) inventario.open = false;
      if (historico) historico.open = false;
      cronica?.classList.remove("inventario-aberto", "historico-aberto");
      document
        .querySelector('#app [data-acao="alternar-inventario"]')
        ?.setAttribute("aria-expanded", "false");
      document.querySelector('#app [data-acao="alternar-progresso"]')?.setAttribute("aria-expanded", "false");
    }
    cronica?.classList.toggle("construcoes-aberto", aberta);
    document
      .querySelector('#app [data-acao="alternar-construcoes"]')
      ?.setAttribute("aria-expanded", String(aberta));
    if (aberta) document.querySelector('#painel-construcoes [data-acao="fechar-construcoes"]')?.focus();
    ajustarTela();
  }

  function aguardarAnimacaoDisputa() {
    return animacaoDisputaAtual;
  }

  window.addEventListener("jogo:aviso", (evento) => {
    const aviso = document.getElementById("aviso-save");
    aviso.textContent = evento.detail;
    aviso.hidden = false;
    ajustarTela();
  });

  function redimensionarTela() {
    ajustarTela();
    window.requestAnimationFrame(alinharIdentificacaoComMoldura);
    const painel = camadaTutorial?.querySelector(".tutorial-painel");
    const alvo = alvoTutorial;
    if (painel && alvo) window.requestAnimationFrame(() => posicionarTutorial(painel, alvo));
  }

  window.addEventListener("resize", redimensionarTela);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", redimensionarTela);

  Jogo.ui = {
    detalhesPressagio,
    alternarConstrucoes,
    modoDebug,
    menu,
    alternarDebug,
    painelLegado,
    escolherHerdeiro,
    intro,
    jogo,
    fim,
    confirmarImportacao,
    preverTransformacoes,
    preverConquista,
    mostrarDetalhesCondicao,
    aguardarAnimacaoDisputa,
    tutorial,
    completarTextoEvento,
    alternarTextoAutomatico,
    atualizarControleTexto,
  };
})();
