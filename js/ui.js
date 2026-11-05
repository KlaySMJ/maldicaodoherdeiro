(function () {
  "use strict";
  const Jogo = window.Jogo;
  const app = document.getElementById("app");
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
    gold: "Gold",
  };
  const esc = (valor) =>
    String(valor).replace(
      /[&<>"']/g,
      (letra) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[letra],
    );
  const numero = (valor) => new Intl.NumberFormat("pt-BR").format(valor);
  const assinado = (valor) => `${valor > 0 ? "+" : ""}${numero(valor)}`;
  const nomesRaridade = {
    comum: "Comum",
    raro: "Raro",
    epico: "Épico",
    lendario: "Lendário",
    pacto: "Pacto",
  };
  const nomesTraco = {
    corajoso: "Corajosa",
    avarento: "Avarento",
    doente: "Doente",
    druida_herdeiro: "Filho da Floresta",
    menino_cronista: "Menino da Crônica",
  };
  const condicaoNomes = { licantropia: "Licantropia", vampirismo: "Vampirismo", possessao: "Possessão" };
  const condicaoDescricoes = {
    licantropia: "+2 Ataque · recupera 1 Vida por rodada",
    vampirismo:
      "+3 Ataque · +2 Escudo · perde 1 Vida por rodada; Sede de sangue: 1 aldeão por até 20 Vida, a cada 6 rodadas",
    possessao: "+2 Ataque · revela a Honra das escolhas",
  };
  const descricoesTraco = {
    corajoso: "Corajosa: começa com +1 Ataque.",
    avarento: "Avarento: começa com 10 Gold.",
    doente: "Doente: começa com 70 Vida e 4 Escudo. Vida máxima inicial: 70.",
    druida_herdeiro:
      "Druida-Herdeiro: começa com o Cajado de carvalho vivo e recebe a passiva de um companheiro aleatório a cada rodada. As quatro estações seguem o ciclo de 25 rodadas.",
    menino_cronista:
      "Menino da Crônica: começa com 70 Vida e 3 Escudo. Acolheu a vila quando chegou órfão e voltou para ajudar a registrar sua história.",
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
  const nomesConstrucoes = {
    ponte: { nome: "Ponte", bonus: "+1 gold na renda a cada 3 rodadas, com pelo menos 20 habitantes" },
    moinho: { nome: "Moinho", bonus: "+1 HP ao iniciar cada rodada" },
    capela: { nome: "Capela", bonus: "+1 Escudo ao ser erguida" },
    forja: { nome: "Forja", bonus: "−2 gold na arma melhorada" },
    muralha: { nome: "Muralha", bonus: "−2 de dano sofrido em batalhas" },
    mercado_coberto: { nome: "Mercado coberto", bonus: "+1 Gold a cada 5 rodadas" },
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
    gold: "Gold",
  };
  const chaveTutorial = "herdeiro_tutorial_v1";
  const etapasTutorial = [
    {
      seletor: ".evento-leitura",
      titulo: "Leia antes de escolher",
      texto:
        "O título e a situação ficam no centro antes das opções. Em batalhas, confira à direita o ataque, a defesa, o dano e o Escudo previstos.",
    },
    {
      seletor: ".coluna-escolhas",
      titulo: "Faça uma escolha",
      texto:
        "Escolha uma opção para resolver o evento. Depois, veja o resultado e avance para a próxima rodada.",
    },
    {
      seletor: ".atributos",
      titulo: "Cuide do herdeiro",
      texto: "Vida mantém o herdeiro vivo; Escudo reduz o dano recebido; Ataque ajuda a vencer confrontos.",
    },
    {
      seletor: '[data-atributo="honra"]',
      titulo: "A Honra deixa marcas",
      texto:
        "Suas decisões mudam a Honra. Ela altera o retrato do herdeiro e pode liberar escolhas em alguns eventos.",
    },
    {
      seletor: ".recursos-vila",
      titulo: "Administre a vila",
      texto:
        "Habitantes representam a população. Gold paga compras e construções; muitas escolhas podem alterar esses recursos.",
    },
    {
      seletor: ".inventario > summary",
      titulo: "Use o inventário",
      texto:
        "Os itens conquistados ficam guardados aqui. Alguns dão efeitos passivos; outros têm um botão para serem usados.",
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

  function ajustarTela() {
    window.cancelAnimationFrame(ajustePendente);
    ajustePendente = window.requestAnimationFrame(() => {
      const cronica = app.querySelector(".cronica");
      if (!cronica) return;
      cronica.style.removeProperty("--altura-cartas");
      cronica.style.removeProperty("--fator-texto");
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

  function mostrar(html, tela, contextoMusica = tela === "intro" ? "intro" : "menu") {
    if (tela !== "jogo") retratoExibido = null;
    app.innerHTML = html;
    document.body.dataset.tela = tela;
    if (tela !== "jogo") Jogo.audio?.definirDucking(false);
    Jogo.audio?.definirContexto(contextoMusica);
    app.focus({ preventScroll: true });
    ajustarTela();
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
          <button class="botao tutorial-voltar" type="button" data-tutorial-voltar ${etapaTutorial === 0 ? "disabled" : ""}>Voltar</button>
          <button class="botao tutorial-pular" type="button" data-tutorial-pular>Pular tutorial</button>
          <button class="botao primario tutorial-avancar" type="button" data-tutorial-avancar>${etapaTutorial === etapasTutorial.length - 1 ? "Concluir" : "Próximo"}<span aria-hidden="true">→</span></button>
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

  function menu(run) {
    const forcarDruida = window.localStorage.getItem("debug_forcar_druida") === "1";
    const legado = Jogo.save.lerLegado();
    const objetivos = Jogo.objetivosLegado
      .map((objetivo) => {
        const concluido = legado.objetivosConcluidos.includes(objetivo.id);
        return `<li><strong>${esc(objetivo.nome || objetivo.id)}</strong><span>${esc(objetivo.descricao || "Objetivo de legado")}</span><small>${concluido ? "Concluído" : "Ainda por cumprir"}</small></li>`;
      })
      .join("");
    const eventosDesbloqueados = Jogo.eventos.filter((evento) => legado.eventos.includes(evento.id));
    const itensDesbloqueados = Jogo.itens.filter((item) => legado.itens.includes(item.id));
    const melhoresRuns = legado.melhoresRuns || [];
    mostrar(
      `
      <section class="abertura" aria-labelledby="titulo-inicio">
        <div class="abertura-arte"><img src="assets/vila.webp" alt="Uma vila medieval sob a vigília de um castelo" width="1024" height="1024"></div>
        <div class="abertura-texto">
          <h1 id="titulo-inicio">A maldição do Herdeiro</h1>
          <p class="subtitulo">A terra será sua.<br>As consequências, de todos.</p>
          <p>Um jovem senhor. Uma vila distante. A cada decisão, uma história que o próximo herdeiro talvez nunca conheça.</p>
          <div class="acoes-menu">
            <button class="botao primario" data-acao="iniciar">Escolher herdeiro <span aria-hidden="true">→</span></button>
            <button class="botao" data-acao="tutorial">Como jogar</button>
            <button class="botao" data-acao="carregar" ${run ? "" : "disabled"}>Carregar${run ? ` <span>Rodada ${numero(run.rodada)}</span>` : ""}</button>
            <details class="painel-legado">
              <summary>Legado e recordes</summary>
              <div class="painel-legado-conteudo">
                <h2>Objetivos</h2>
                <ul>${objetivos || "<li>Nenhum objetivo de legado cadastrado.</li>"}</ul>
                <h2>Desbloqueios</h2>
                <p>${eventosDesbloqueados.length} eventos · ${itensDesbloqueados.length} itens · ${legado.flags.druida_herdeiro ? "Filho da Floresta disponível" : "Filho da Floresta ainda não encontrado"}</p>
                ${eventosDesbloqueados.length || itensDesbloqueados.length ? `<ul>${eventosDesbloqueados.map((evento) => `<li><strong>${esc(evento.titulo)}</strong><span>Evento</span></li>`).join("")}${itensDesbloqueados.map((item) => `<li><strong>${esc(item.nome)}</strong><span>Item</span></li>`).join("")}</ul>` : ""}
                <h2>Melhores crônicas</h2>
                ${melhoresRuns.length ? `<ol>${melhoresRuns.slice(0, 5).map((registro) => `<li><strong>${esc(nomesTraco[registro.traco] || "Herdeiro")}</strong><span>${numero(registro.pontuacao)} pontos · ${numero(registro.habitantes)} habitantes · ${numero(registro.gold)} gold</span></li>`).join("")}</ol>` : `<p>Nenhuma vitória registrada. Sobreviva às ${numero(Jogo.config.rodadasVitoria)} rodadas de um ano para cumprir a crônica.</p>`}
              </div>
            </details>
            <details class="painel-backup">
              <summary>Backup de progresso</summary>
              <div><button class="botao" data-acao="exportar-progresso">Exportar arquivo</button><button class="botao" data-acao="importar-progresso">Importar arquivo</button></div>
            </details>
            <input id="importar-progresso-arquivo" type="file" accept="application/json,.json" hidden>
            <button class="botao debug-transformacoes-menu" data-acao="debug-transformacoes">Debug: ver transformações</button>
            <button class="botao debug-druida-menu" data-acao="debug-alternar-druida" aria-pressed="${forcarDruida}">Debug: sempre iniciar como Druida · ${forcarDruida ? "ativo" : "inativo"}</button>
          </div>
          <p class="nota">${run ? "Há uma história esperando por você." : "Sua primeira história ainda não foi escrita."}</p>
        </div>
      </section>`,
      "inicio",
    );
  }

  function escolherHerdeiro(legado) {
    const disponiveis = new Set(Jogo.estado.tracosDisponiveis(legado));
    const opcoesHerdeiro = [
      { traco: "corajoso", nome: "A Herdeira Corajosa", descricao: "+1 Ataque no início.", imagem: "corajoso" },
      { traco: "avarento", nome: "O Herdeiro Avarento", descricao: "Começa com 10 Gold.", imagem: "avarento" },
      { traco: "doente", nome: "O Herdeiro Doente", descricao: "70 Vida e 4 Escudo; aguenta menos golpes.", imagem: "doente" },
      { traco: "druida_herdeiro", nome: "O Filho da Floresta", descricao: "Cajado vivo e um companheiro da floresta.", imagem: "druida-herdeiro" },
      { traco: "menino_cronista", nome: "O Menino da Crônica", descricao: "70 Vida e 3 Escudo; acolhido e feito conselheiro da vila.", imagem: "menino-cronista" },
    ];
    mostrar(
      `<section class="selecao-herdeiro" aria-labelledby="titulo-selecao-herdeiro">
        <div class="selecao-herdeiro-cabecalho"><p class="nota">A linhagem continua</p><h1 id="titulo-selecao-herdeiro">Quem herda a vila?</h1><p>Cada traço muda os primeiros passos desta crônica.</p></div>
        <div class="selecao-herdeiro-lista">${opcoesHerdeiro
          .map((herdeiro) => {
            const desbloqueado = disponiveis.has(herdeiro.traco);
            return `<button class="herdeiro-opcao" data-acao="selecionar-herdeiro" data-traco="${herdeiro.traco}" ${desbloqueado ? "" : "disabled"}>
              <img src="assets/herdeiros/${herdeiro.imagem}-neutra.png" width="96" height="128" alt="">
              <span class="herdeiro-opcao-texto"><strong>${esc(herdeiro.nome)}</strong><span>${esc(herdeiro.descricao)}</span><small>${desbloqueado ? "Disponível" : herdeiro.traco === "menino_cronista" ? "Acolha o órfão com honra e torne-o conselheiro." : "Poupe o cervo branco para encontrar este herdeiro."}</small></span><span class="herdeiro-opcao-seta" aria-hidden="true">→</span>
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
      <button class="botao botao-intro" data-acao="entrar-no-jogo">Iniciar <span aria-hidden="true">→</span></button>
    </section>`,
      "intro",
    );
  }

  function atributos(run, variacaoHonra = 0) {
    const icones = {
      hp: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
      escudo: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/>',
      ataque: '<path d="m14 4 6-1-1 6-9 9-4-4Zm-9 9 6 6m-3-3-5 5"/>',
      honra: '<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>',
    };
    const mudouHonra = variacaoHonra !== 0;
    return `<dl class="atributos">${["hp", "escudo", "ataque", "honra"]
      .map(
        (
          id,
        ) => `<div data-atributo="${id}" class="atributo ${id === "honra" ? `honra-${Jogo.estado.faixaHonra(run.atributos.honra)}${mudouHonra ? " honra-mudou" : ""}` : ""}" ${id === "honra" && mudouHonra ? `data-mudanca-honra="${variacaoHonra > 0 ? "subiu" : "caiu"}"` : ""} ${id === "honra" && variacaoHonra > 0 ? `data-ganho-honra="${numero(variacaoHonra)}"` : ""}>
      <dt><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icones[id]}</svg>${nomes[id]}</dt><dd>${id === "honra" ? assinado(run.atributos[id]) : id === "hp" ? `${numero(run.atributos.hp)} / ${numero(run.hpMax)}` : numero(run.atributos[id])}</dd>
    </div>`,
      )
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
          efeito.porRodada.aCada
            ? `a cada ${numero(efeito.porRodada.aCada)} rodadas: ${periodicos.join(", ")}`
            : `por rodada: ${periodicos.join(", ")}`,
        );
    }
    if (efeito.reducaoDano) detalhes.push(`reduz ${numero(efeito.reducaoDano)} de dano em batalha`);
    if (efeito.reducaoGanhoGold) detalhes.push(`reduz em ${numero(efeito.reducaoGanhoGold)} o gold recebido`);
    if (efeito.revelarHonraRodadas) detalhes.push("revela sua Honra enquanto durar");
    if (efeito.revelarHabitantesRodadas) detalhes.push("revela o número de Habitantes enquanto durar");
    return detalhes.length ? detalhes.join(". ") + "." : "Efeito divino ativo nesta crônica.";
  }

  function alteracoes(resultado) {
    const mudancas = Object.entries(resultado.alteracoes).filter(([, valor]) => valor !== 0);
    return `<ul class="alteracoes" aria-label="Consequências da decisão">${mudancas.map(([id, valor]) => `<li><span>${nomes[id]}</span><strong>${assinado(valor)}</strong></li>`).join("") || "<li>Nenhum atributo foi alterado.</li>"}</ul>`;
  }

  function resultado(run) {
    const r = run.ultimoResultado;
    if (run.aguardaDecisaoCulto)
      return `<div class="resultado resultado-culto" role="status">
      <div class="decisao-culto" role="alert">
        <h2>O último habitante se foi</h2>
        <button class="botao aceitar-culto" data-acao="juntar-culto">Aceitar o chamado</button>
      </div>
    </div>`;
    const economia = r.economia;
    const movimento = economia
      ? [
          economia.gasto ? `Compra: −${numero(economia.gasto)} gold.` : "",
          economia.renda > 0
            ? `Renda da vila: +${numero(economia.variacaoRenda)} gold.`
            : economia.renda < 0
              ? `Manutenção da vila: ${assinado(economia.variacaoRenda)} gold.`
              : "Sem renda nesta rodada.",
        ]
          .filter(Boolean)
          .join(" ")
      : "";
    return `<div class="resultado" role="status">
      <h2>Assim foi feito.</h2>
      <p class="escolha-feita">“${esc(r.escolha)}”</p>
      ${r.combate ? `<p class="desfecho-combate">${r.combate.venceu ? "Vitória em batalha" : "Ataque malsucedido"} · ${numero(r.combate.dano)} de dano após o escudo</p>` : ""}
      <p>${esc(r.texto)}</p>${r.informativoCulto ? `<p class="aviso-culto" role="status">${esc(r.informativoCulto)}</p>` : ""}${movimento ? `<p class="movimento-gold">${esc(movimento)}</p>` : ""}${alteracoes(r)}
      <button class="botao primario" data-acao="continuar">Continuar <span aria-hidden="true">→</span></button>
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
      .map(
        (item) =>
          `<button class="escolha mercadoria${item.raridade ? ` item-raridade-${esc(item.raridade)}` : ""}" data-mercadoria="${esc(item.id)}" ${Jogo.engine.podePagar(run, item) ? "" : 'disabled title="Gold insuficiente"'}><span>${esc(item.texto)}${item.raridade ? `<small class="nome-raridade raridade-${esc(item.raridade)}"> (${esc(nomesRaridade[item.raridade])})</small>` : ""}</span><span class="preco">${numero(Jogo.engine.precoMercadoria(run, item))} gold</span></button>`,
      )
      .join("")}</div>`;
  }

  function inventario(run) {
    const contagem = run.inventario.reduce((grupos, id) => {
      grupos[id] = (grupos[id] || 0) + 1;
      return grupos;
    }, {});
    const idsConquistados = [...new Set([...(run.itensConquistados || []), ...Object.keys(contagem)])];
    const itens = idsConquistados
      .map((id) => ({ item: Jogo.itens.find((item) => item.id === id), quantidade: contagem[id] || 0 }))
      .filter(
        ({ item, quantidade }) =>
          item &&
          !(
            item.tipo === "uso" &&
            quantidade === 0 &&
            Number.isSafeInteger(run.itensConsumidosEm?.[item.id]) &&
            run.itensConsumidosEm[item.id] < run.rodada
          ),
      );
    const efeitos = run.efeitosPreparados || {};
    const preparados = [
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
    ].filter(Boolean);
    return `<details class="inventario" ${run.inventarioAberto ? "open" : ""}><summary>Inventário <span>${numero(itens.length)} ${itens.length === 1 ? "item" : "itens"} conquistados</span></summary>
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
                    ? `<span class="acoes-item">${Jogo.engine.podeUsarItem(run, item.id, "habitantes") ? `<button class="botao usar-item" data-item-sacrificio="habitantes">Sacrificar 10 habitantes</button>` : ""}${Jogo.engine.podeUsarItem(run, item.id, "culto") ? `<button class="botao usar-item" data-item-sacrificio="culto">Sacrificar 10 seguidores</button>` : ""}</span>`
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
                return `<li><span class="item-descricao"><strong>${esc(item.nome)}${item.raridade ? `<span class="nome-raridade raridade-${esc(item.raridade)}"> (${esc(nomesRaridade[item.raridade])})</span>` : ""}${quantidade > 1 ? ` ×${numero(quantidade)}` : ""}</strong><small>${esc(estado)} · ${esc(item.descricao)}</small></span>${usoItem}</li>`;
              })
              .join("")}</ul>`
          : "<p>Nenhum item conquistado nesta run.</p>"
      }
      ${run.avisoInventario ? `<p class="aviso-inventario" role="status">${esc(run.avisoInventario)}</p>` : ""}
      ${preparados.length ? `<p class="efeitos-preparados">${preparados.map(esc).join(" · ")}</p>` : ""}</details>
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

  function historicoCronica(run) {
    const registros = (run.historicoCronica || []).slice().reverse();
    return `<details class="historico-cronica"><summary>Crônica recente <span>${registros.length} ${registros.length === 1 ? "escolha" : "escolhas"}</span></summary>
      ${registros.length ? `<ol>${registros
        .map(
          (registro) =>
            `<li><small>Rodada ${numero(registro.rodada)} · ${esc(registro.evento)}</small><strong>“${esc(registro.escolha)}”</strong><p>${esc(registro.desfecho)}</p></li>`,
        )
        .join("")}</ol>` : "<p>As escolhas desta run aparecerão aqui.</p>"}
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
    if (posseRevela || corvoRevelaOpcao || run.rodada <= run.honraReveladaAteRodada) {
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
    if (run.rodada <= run.habitantesReveladosAteRodada && Number.isSafeInteger(variacaoHabitantes)) {
      detalhes.push(`Habitantes ${assinado(variacaoHabitantes)}`);
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
    const personagem = retratos[traco] || retratos.corajoso;
    if (traco === "druida_herdeiro")
      return `assets/herdeiros/druida-herdeiro-${cultoAtivo ? "culto" : faixa}.png`;
    if (cultoAtivo) return "assets/herdeiros/" + personagem.arquivo + "-culto.png";
    return "assets/herdeiros/" + personagem.arquivo + "-" + faixa + ".png";
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

  function retrato(traco, faixa, anterior, cultoAtivo) {
    const imagemAtual = caminhoRetrato(traco, faixa, cultoAtivo);
    const imagemAnterior = anterior
      ? caminhoRetrato(anterior.traco, anterior.faixa, anterior.cultoAtivo)
      : "";
    const descricao =
      (retratos[traco] || retratos.corajoso).descricao +
      (cultoAtivo ? ", com vestes rituais do culto" : ", " + fasesRetrato[faixa]);
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

  function detalheMoldura(condicaoId) {
    return condicaoId === "vampirismo"
      ? '<span class="moldura-presas" aria-hidden="true"><i></i><i></i></span>'
      : condicaoId === "licantropia"
        ? '<span class="moldura-arranhoes" aria-hidden="true"><i></i><i></i><i></i></span>'
        : condicaoId === "possessao"
          ? '<span class="moldura-veu" aria-hidden="true"></span>'
          : "";
  }

  function preverTransformacoes(run) {
    const herdeiro = run || { traco: "corajoso", atributos: { honra: 0 }, cultoAtivo: false };
    const faixa = faixaRetrato(herdeiro.atributos.honra);
    const condicoes = [
      { id: "vampirismo", nome: "Vampirismo", detalhe: "Moldura vermelha com presas" },
      { id: "licantropia", nome: "Licantropia", detalhe: "Moldura pálida com arranhões" },
      { id: "possessao", nome: "Possessão", detalhe: "Moldura fria envolta por um véu" },
    ];
    const dialogo = document.createElement("dialog");
    dialogo.className = "previa-transformacoes";
    dialogo.setAttribute("aria-labelledby", "titulo-previa-transformacoes");
    dialogo.innerHTML = `
      <header class="previa-transformacoes-cabecalho">
        <div><p class="previa-transformacoes-sobretitulo">Debug visual</p><h2 id="titulo-previa-transformacoes">Transformações do herdeiro</h2></div>
        <button class="controle-honra" type="button" data-fechar-previa aria-label="Fechar prévia">Fechar</button>
      </header>
      <p class="previa-transformacoes-nota">Prévia cosmética. Não altera a partida nem avança a história.</p>
      <div class="previa-transformacoes-grade">
        ${condicoes
          .map(
            (condicao) => `
          <section class="previa-transformacao" aria-label="Prévia de ${condicao.nome}">
            <article class="carta carta-herdeiro honra-${faixa} condicao-${condicao.id} previa-transformacao-carta">
              ${retrato(herdeiro.traco, faixa, null, Boolean(herdeiro.cultoAtivo))}
              ${detalheMoldura(condicao.id)}
              <div class="carta-titulo herdeiro-carta-titulo"><h2>${herdeiro.traco === "corajoso" ? "A herdeira" : "O herdeiro"}</h2></div>
            </article>
            <div class="previa-transformacao-legenda"><h3>${condicao.nome}</h3><p>${condicao.detalhe}</p></div>
          </section>`,
          )
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
    // Troca imediata para quem prefere movimento reduzido.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      concluir();
      return;
    }
    const iniciar = () => {
      if (area.isConnected) area.classList.add("em-transicao");
    };
    // A imagem anterior fica visível até a próxima estar carregada.
    if (atual.complete && atual.naturalWidth > 0) iniciar();
    else atual.addEventListener("load", iniciar, { once: true });
    atual.addEventListener("animationend", concluir, { once: true });
    atual.addEventListener("error", concluir, { once: true });
  }

  function jogo(run) {
    Jogo.engine.sincronizarItemVampirismo(run);
    const eventoDaRun = Jogo.eventoPorId(run.eventoId);
    const eventoBase = run.aguardaDecisaoCulto ? Jogo.eventoPorId("ultimo_habitante") : eventoDaRun;
    const memoriaAnterior = run.legadoDaRun.memorias?.at(-1);
    const valoresMemoria = {
      rodada: memoriaAnterior?.rodada ?? "sem registro",
      honra: memoriaAnterior?.honra ?? "sem registro",
      motivo: memoriaAnterior?.motivo ?? "sem registro",
      herdeiro: memoriaAnterior?.traco === "corajoso" ? "a herdeira anterior" : "o herdeiro anterior",
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
    const molduraAtiva = detalheMoldura(condicaoId);
    const faixaDoRetrato = faixaRetrato(run.atributos.honra);
    const cultoAtivo = Boolean(run.cultoAtivo);
    const variacaoHonra =
      retratoExibido?.runId === run.id
        ? run.atributos.honra - (retratoExibido.honra ?? run.atributos.honra)
        : 0;
    const transicaoCulto = retratoExibido?.runId === run.id && !retratoExibido.cultoAtivo && cultoAtivo;
    const anterior =
      retratoExibido?.runId === run.id &&
      (retratoExibido.traco !== run.traco ||
        (!cultoAtivo && retratoExibido.faixa !== faixaDoRetrato) ||
        retratoExibido.cultoAtivo !== cultoAtivo)
        ? retratoExibido
        : null;
    const resolvido = run.fase === "resultado";
    const escolhas = Jogo.engine.opcoes(evento, run);
    const batalhaLeitura = evento.batalha ? Jogo.engine.batalhaAjustada(run, evento.batalha) : null;
    const leituraBatalha =
      batalhaLeitura && evento.batalha.mostrarLeitura !== false
        ? `<p class="batalha-leitura">Seu Ataque: <strong>${numero(run.atributos.ataque + (run.efeitosPreparados.bonusAtaqueProximaBatalha || 0) + (Jogo.druida?.bonusAtaqueCombate(run) || 0))}</strong>. Defesa inimiga: <strong>${numero(batalhaLeitura.defesa)}</strong>. Dano antes das reduções: <strong>${numero(batalhaLeitura.vitoria.dano)} na vitória</strong> ou <strong>${numero(batalhaLeitura.derrota.dano)} na derrota</strong>. ${run.efeitoDivino?.reducaoDano ? `O efeito de ${esc(run.efeitoDivino.nome)} reduz mais ${numero(run.efeitoDivino.reducaoDano)} de dano.` : ""} ${batalhaLeitura.estagio ? `A dificuldade aumentou ${numero(batalhaLeitura.estagio)} ${batalhaLeitura.estagio === 1 ? "estágio" : "estágios"}.` : ""}</p>`
        : "";
    const leituraBatalhaLateral = leituraBatalha.replace(
      'class="batalha-leitura"',
      'class="batalha-leitura-lateral"',
    );
    const escudoPrevisto =
      run.atributos.escudo +
      (run.efeitosPreparados.bonusEscudoProximaBatalha || 0) +
      (run.inventario.includes("manto_de_folhas") ? (run.estacao === "inverno" ? 4 : 3) : 0);
    const combateResultado = resolvido ? run.ultimoResultado?.combate : null;
    const resumoCombateResultado = combateResultado
      ? `<p class="batalha-resultado-lateral"><strong>${combateResultado.danoAnulado ? "Dano anulado" : "Dano recebido após o Escudo"}:</strong> ${numero(combateResultado.dano)} · <strong>Escudo considerado:</strong> ${numero(combateResultado.escudo)}</p>`
      : "";
    const construcoesRun = [...new Set(run.construcoes || [])].map((id) => ({
      id,
      ...(Object.hasOwn(nomesConstrucoes, id)
        ? nomesConstrucoes[id]
        : { nome: id, bonus: "Bônus registrado nesta crônica" }),
    }));
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
      <section class="cronica${resolvido ? " cronica--resultado" : ""}${run.aguardaDecisaoCulto ? " cronica--decisao-culto" : ""}${evento.mercadorias ? " cronica--mercador" : ""}${evento.id === "construcoes_da_vila" ? " cronica--obras-vila" : ""}${!resolvido && escolhas.length > 3 ? " cronica--quatro-escolhas" : ""}${run.inventarioAberto ? " inventario-aberto" : ""}" aria-labelledby="titulo-jogo">
        <div class="titulo-run"><div class="titulo-run-identificacao"><div class="titulo-run-linha"><h1 id="titulo-jogo">A sua crônica</h1>
          <details class="construcoes-resumo">
            <summary aria-label="Ver ${numero(construcoesRun.length)} ${construcoesRun.length === 1 ? "construção" : "construções"} da vila e seus bônus" title="Construções da vila: ver o que foi feito e seus bônus">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m2.5 11 5.5-5 5.5 5v8.5H2.5V11Zm11 1.5 4.5-4 4.5 4v7H14"/><path d="M6 14h3v5.5H6zm11-1h2v2h-2zm-8-4h2v2H9z"/></svg>
              <span>${numero(construcoesRun.length)}</span>
            </summary>
            <div class="construcoes-resumo-painel">
              <h2>Construções da vila</h2>
              ${construcoesRun.length ? `<ul>${construcoesRun.map((construcao) => `<li><strong>${esc(construcao.nome)}</strong><span>${esc(construcao.bonus)}</span></li>`).join("")}</ul>` : `<p>Nenhuma construção feita ainda.</p>`}
            </div>
          </details>
        </div><p>Rodada ${numero(run.rodada)} · ${nomesEstacao[run.estacao]} · Ano ${numero(Jogo.anoDaRodada(run.rodada))} · ${numero(Math.min(100, Math.round((run.rodada / Jogo.config.rodadasVitoria) * 100)))}% do primeiro ano</p></div>
          <dl class="recursos-vila" aria-label="Recursos da vila">
            <div class="recurso-contador vila-contador"><dt>Habitantes da vila</dt><dd>${numero(run.atributos.habitantes)}</dd></div>
            ${run.cultoAtivo ? `<div class="recurso-contador culto-contador"><dt>${transicaoCulto ? `<svg class="chama-passagem" viewBox="0 0 24 32" aria-hidden="true"><path class="chama-externa" d="M12 1c1 5-1 7-3 10-2 2-4 4-4 8a7 7 0 0 0 14 0c0-4-2-7-5-10 0 3-1 5-2 6 1-5 0-9 0-14Z"/><path class="chama-interna" d="M12 15c0 2-1 3-2 5a3.5 3.5 0 1 0 7 0c0-2-1-4-3-5 0 2-1 3-2 4 1-2 0-3 0-4Z"/></svg>` : ""}Seguidores do culto</dt><dd>${numero(run.seguidoresCulto)}</dd>${run.cultoRendaPorRodada ? `<small>Templo: +${numero(run.cultoRendaPorRodada)} por rodada</small>` : ""}</div>` : ""}
            <div class="testes-honra testes-debug"><dt>Debug</dt><dd>
              <button class="controle-honra" data-acao="habitantes-menos" ${run.aguardaDecisaoCulto ? "disabled" : ""} aria-label="Diminuir habitantes em 50 para debug" title="Diminuir habitantes em 50 para debug">Hab. −50</button>
              <button class="controle-honra" data-acao="honra-mais" ${run.aguardaDecisaoCulto ? "disabled" : ""} aria-label="Ganhar 30 de honra para testes" title="Ganhar 30 de honra para testes">+30</button>
              <button class="controle-honra" data-acao="honra-menos" ${run.aguardaDecisaoCulto ? "disabled" : ""} aria-label="Perder 30 de honra para testes" title="Perder 30 de honra para testes">−30</button>
              <button class="controle-honra" data-acao="debug-transformacoes" aria-label="Ver prévia das transformações do herdeiro" title="Ver as transformações sem avançar a história">Transformações</button>
              <details class="debug-eventos">
                <summary class="controle-honra" aria-label="Ativar evento especial para debug" title="Ativar uma carta especial para debug">Especial</summary>
                <div class="debug-eventos-opcoes" aria-label="Cartas especiais para debug">
                  <button class="controle-honra" data-acao="debug-especial-entidade" ${run.aguardaDecisaoCulto ? "disabled" : ""}>A Entidade</button>
                  <button class="controle-honra" data-acao="debug-especial-abissal" ${run.aguardaDecisaoCulto ? "disabled" : ""}>História abissal</button>
                  <button class="controle-honra" data-acao="debug-especial-zodiaco" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Zodíaco chinês</button>
                  <button class="controle-honra" data-acao="debug-especial-norte" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Deuses nórdicos</button>
                  <button class="controle-honra" data-acao="debug-contagio-uivos" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Evento: uivos</button>
                  <button class="controle-honra" data-acao="debug-contagio-hospede" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Evento: hóspede</button>
                  <button class="controle-honra" data-acao="debug-contagio-anel" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Evento: anel</button>
                  <button class="controle-honra" data-acao="debug-condicao-licantropia" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Forçar licantropia</button>
                  <button class="controle-honra" data-acao="debug-condicao-vampirismo" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Forçar vampirismo</button>
                  <button class="controle-honra" data-acao="debug-condicao-possessao" ${run.aguardaDecisaoCulto ? "disabled" : ""}>Forçar possessão</button>
                  <button class="controle-honra" data-acao="debug-conselheiro" ${run.aguardaDecisaoCulto ? "disabled" : ""} title="Nomear o novo conselheiro e mostrar um conselho dele">Novo conselheiro</button>
                </div>
              </details>
            </dd></div>
            <div class="recurso-contador gold-contador" data-atributo="gold"><dt>Gold</dt><dd>${numero(run.atributos.gold)}</dd></div>
          </dl>
          <div class="titulo-run-acoes"><button class="botao" data-acao="tutorial">Tutorial</button><button class="botao discreto" data-acao="menu" aria-label="Voltar ao início" title="Voltar ao início">Início</button></div>
        </div>
        ${statusDruida}
        ${run.efeitoDivino ? `<p class="efeito-divino-status" role="status"><span aria-hidden="true">✦</span> ${esc(run.efeitoDivino.nome)} · ${numero(run.efeitoDivino.restantes)} ${run.efeitoDivino.restantes === 1 ? "rodada restante" : "rodadas restantes"} <span class="info-hover" tabindex="0" role="img" aria-label="Informações sobre o efeito de ${esc(run.efeitoDivino.nome)}" title="${esc(efeitoDivinoHover(run.efeitoDivino))}" data-tooltip="${esc(efeitoDivinoHover(run.efeitoDivino))}">i</span></p>` : ""}
        <div class="mesa">
          <div class="coluna-herdeiro">
            <article class="carta carta-herdeiro honra-${faixa}${classeCondicao}" aria-labelledby="titulo-herdeiro">
              ${retrato(run.traco, faixaDoRetrato, anterior, cultoAtivo)}
              ${molduraAtiva}
              ${condicaoId ? `<button class="condicao-info-trigger condicao-${condicaoId}" type="button" data-acao="detalhes-condicao" aria-label="Ver detalhes de ${esc(condicaoNomes[condicaoId])}" title="${esc(`${condicaoNomes[condicaoId]}: ${descricaoDaCondicao(condicaoId, run.condicao.abracada)}. Toque para ver os detalhes.`)}"><span>${esc(condicaoNomes[condicaoId])} <span aria-hidden="true">ⓘ</span></span></button>` : ""}
              <div class="carta-titulo herdeiro-carta-titulo"><h2 id="titulo-herdeiro">${run.traco === "corajoso" ? "A herdeira" : "O herdeiro"}</h2><span class="traco-tooltip" tabindex="0" aria-label="${esc(descricoesTraco[run.traco] || "Traço do herdeiro")}" data-tooltip="${esc(descricoesTraco[run.traco] || "Traço do herdeiro")}">${esc(nomesTraco[run.traco] || "Herdeiro")}</span></div>
            </article>
            <div class="herdeiro-detalhes">
              ${condicaoId ? `<p class="condicao-status condicao-${condicaoId}" role="status"><strong>${esc(nomesCondicoes[condicaoId])}${run.condicao.abracada ? " abraçada" : " ativa"}</strong><span>${esc(descricaoCondicoes[condicaoId])}</span></p>` : ""}
              ${atributos(run, variacaoHonra)}
            </div>
          </div>
          <section class="coluna-escolhas" aria-label="${resolvido ? "Resultado da sua decisão" : "Sua decisão"}">
            ${resolvido ? "" : `<div class="evento-leitura"><div class="evento-leitura-titulo"><h2>${esc(evento.titulo)}</h2>${evento.entidadeX || evento.entidadeXInicio ? '<span class="marca-entidade">A Entidade</span>' : ""}</div><p>${esc(evento.texto)}</p>${leituraBatalha}</div>`}
            ${
              resolvido
                ? resultado(run)
                : `<h2>${evento.mercadorias ? "O mercador oferece" : "Qual é a sua palavra?"}</h2>${ofertas(evento, run)}<div class="escolhas">${escolhas
                    .map((opcao, indice) => {
                      const previaHonra = honraRevelada(opcao, evento, run);
                      const itemPremio = Jogo.itens.find((item) => (opcao.itens || []).includes(item.id));
                      const raridadePremio = itemPremio?.raridade
                        ? `<small class="nome-raridade raridade-${esc(itemPremio.raridade)}"> (${esc(nomesRaridade[itemPremio.raridade])})</small>`
                        : "";
                      return `<button class="escolha${itemPremio?.raridade ? ` item-raridade-${esc(itemPremio.raridade)}` : ""}" data-opcao="${esc(opcao.id)}" ${indice < 4 ? `aria-keyshortcuts="${indice + 1}"` : ""}>${indice < 4 ? `<kbd>${indice + 1}</kbd>` : ""}<span class="escolha-conteudo">${esc(opcao.texto)}${raridadePremio}${previaHonra ? `<small class="honra-revelada">${esc(previaHonra)}</small>` : ""}</span><span aria-hidden="true">→</span></button>`;
                    })
                    .join(
                      "",
                    )}</div>${evento.mercadorias ? "" : '<p class="nota">Atalhos: 1–4 escolhem · Enter continua após o desfecho.</p>'}`
            }
            ${inventario(run)}${historicoCronica(run)}
          </section>
          <div class="coluna-evento">
            <article class="carta carta-evento honra-${faixa}" aria-labelledby="titulo-evento">
              <img class="imagem-evento${imagensComTomDaVila.has(evento.imagem) ? " imagem-evento--tom-vila" : ""}" src="${esc(evento.imagem)}" width="1024" height="1024" loading="lazy" decoding="async" alt="${esc(evento.imagemAlt)}">
            </article>
            <div class="evento-detalhes">
              <div class="evento-texto"><div class="carta-titulo evento-titulo"><h2 id="titulo-evento">${esc(evento.titulo)}</h2>${evento.entidadeX || evento.entidadeXInicio ? '<span class="marca-entidade">A Entidade</span>' : ""}</div><p>${esc(evento.texto)}</p></div>
              <aside class="informacoes" aria-label="Informações do evento"><p>${esc(evento.informacoes)}</p>${run.previsaoCorvo ? `<p class="previsao-corvo" role="status">Seu corvo prevê: ${esc(run.previsaoCorvo)}.</p>` : ""}
                ${batalhaLeitura && evento.batalha.mostrarLeitura !== false ? `<p class="batalha-leitura">Seu Ataque: <strong>${numero(run.atributos.ataque + (run.efeitosPreparados.bonusAtaqueProximaBatalha || 0) + (Jogo.druida?.bonusAtaqueCombate(run) || 0))}</strong>. Defesa inimiga: <strong>${numero(batalhaLeitura.defesa)}</strong>. Dano antes das reduções: <strong>${numero(batalhaLeitura.vitoria.dano)} na vitória</strong> ou <strong>${numero(batalhaLeitura.derrota.dano)} na derrota</strong>. ${run.efeitoDivino?.reducaoDano ? `O efeito de ${esc(run.efeitoDivino.nome)} reduz mais ${numero(run.efeitoDivino.reducaoDano)} de dano.` : ""} ${batalhaLeitura.estagio ? `A dificuldade aumentou ${numero(batalhaLeitura.estagio)} ${batalhaLeitura.estagio === 1 ? "estágio" : "estágios"}.` : ""}</p>` : ""}
                ${leituraBatalhaLateral ? `<p class="batalha-escudo-lateral">Seu Escudo previsto: <strong>${numero(escudoPrevisto)}</strong>.</p>` : ""}
              </aside>
              ${resumoCombateResultado}
            </div>
          </div>
        </div>
      </section>`,
      "jogo",
      cultoAtivo ? "culto" : evento.batalha ? "batalha" : run.estacao,
    );
    Jogo.audio?.definirDucking(resolvido || Boolean(evento.batalha));
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
      const cronica = painelInventario.closest(".cronica");
      run.inventarioAberto = painelInventario.open;
      cronica?.classList.toggle("inventario-aberto", painelInventario.open);
      ajustarTela();
    });
    retratoExibido = {
      runId: run.id,
      traco: run.traco,
      faixa: faixaDoRetrato,
      cultoAtivo,
      honra: run.atributos.honra,
    };
    animarRetrato();
  }

  function fim(run, legadoSalvo) {
    const venceu = run.fim.tipo === "vitoria";
    const melhoresRuns = Jogo.save.lerLegado().melhoresRuns || [];
    mostrar(
      `<section class="fim" aria-labelledby="titulo-fim">
      <img class="fim-selo" src="assets/selo.svg" width="72" height="84" alt="">
      <h1 id="titulo-fim">${venceu ? "Uma crônica cumprida." : "Um herdeiro se vai."}</h1>
      <p class="subtitulo">${esc(run.fim.motivo)}</p>
      ${run.ultimoResultado ? `<p class="fim-relato">${esc(run.ultimoResultado.texto)}</p>${alteracoes(run.ultimoResultado)}` : ""}
      <dl class="resumo-fim"><div><dt>Rodada alcançada</dt><dd>${numero(run.rodada)}</dd></div><div><dt>Habitantes restantes</dt><dd>${numero(run.atributos.habitantes)}</dd></div></dl>
      ${venceu ? `<section class="recordes-fim"><h2>Melhores crônicas</h2><ol>${melhoresRuns.slice(0, 5).map((registro) => `<li><span>${esc(nomesTraco[registro.traco] || "Herdeiro")}</span><strong>${numero(registro.pontuacao)} pontos</strong></li>`).join("")}</ol></section>` : ""}
      <p class="fim-memoria">Você não saberá o que afetou.<br>Porém o povo irá lembrar.</p>
      <div class="acoes-menu">${legadoSalvo ? `<button class="botao primario" data-acao="novo-herdeiro">Um novo herdeiro <span aria-hidden="true">→</span></button><button class="botao" data-acao="menu">Voltar ao início</button>` : `<p role="status">O encerramento ainda não pôde ser salvo. As conquistas ficam nesta sessão, mas podem se perder ao fechar a página.</p><button class="botao primario" data-acao="tentar-salvar">Tentar salvar novamente</button><button class="botao" data-acao="novo-herdeiro">Outro herdeiro sem salvar</button>`}</div>
    </section>`,
      "fim",
    );
  }

  function confirmarNovaRun() {
    const dialogo = document.createElement("dialog");
    dialogo.className = "confirmacao";
    dialogo.setAttribute("aria-labelledby", "titulo-confirmacao");
    dialogo.innerHTML = `<h2 id="titulo-confirmacao">Começar outra história?</h2><p>Há uma run em andamento. Iniciar outro herdeiro substitui essa run. As conquistas dela só entram no legado quando ela termina.</p><form method="dialog"><button class="botao" value="cancelar" autofocus>Continuar minha história</button><button class="botao primario" value="iniciar">Iniciar outro herdeiro</button></form>`;
    document.body.append(dialogo);
    dialogo.addEventListener("click", (evento) => {
      if (evento.target === dialogo) dialogo.close("cancelar");
    });
    return new Promise((resolve) => {
      dialogo.addEventListener(
        "close",
        () => {
          resolve(dialogo.returnValue === "iniciar");
          dialogo.remove();
        },
        { once: true },
      );
      dialogo.showModal();
    });
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

  window.addEventListener("jogo:aviso", (evento) => {
    const aviso = document.getElementById("aviso-save");
    aviso.textContent = evento.detail;
    aviso.hidden = false;
    ajustarTela();
  });

  function redimensionarTela() {
    ajustarTela();
    const painel = camadaTutorial?.querySelector(".tutorial-painel");
    const alvo = alvoTutorial;
    if (painel && alvo) window.requestAnimationFrame(() => posicionarTutorial(painel, alvo));
  }

  window.addEventListener("resize", redimensionarTela);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", redimensionarTela);

  Jogo.ui = {
    menu,
    escolherHerdeiro,
    intro,
    jogo,
    fim,
    confirmarNovaRun,
    confirmarImportacao,
    preverTransformacoes,
    mostrarDetalhesCondicao,
    tutorial,
  };
})();
