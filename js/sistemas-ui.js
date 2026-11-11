(function () {
  "use strict";
  const J = window.Jogo;
  const esc = (v) =>
    String(v).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  let runAtual = null,
    ajuda = null,
    focoOrigem = null,
    ajudaVista = false;
  let etapa = 0,
    modoAjuda = false;
  let inventarioRun = null,
    posicao = 0,
    itemFocado = null;
  let observador = null;
  const efeitosVistos = new Set();
  const transicoesVistas = new Set();
  const chaveAjuda = "tutorial_combate_concluido";
  const chaveTexto = "velocidade_texto";
  function preferenciaTexto() {
    try {
      return ["imediato", "rapido", "normal"].includes(window.localStorage.getItem(chaveTexto))
        ? window.localStorage.getItem(chaveTexto)
        : "normal";
    } catch {
      return "normal";
    }
  }
  function foiVista() {
    try {
      return ajudaVista || window.localStorage.getItem(chaveAjuda) === "sim";
    } catch {
      return ajudaVista;
    }
  }
  function fechar() {
    if (!ajuda) return false;
    if (modoAjuda) {
      ajudaVista = true;
      try {
        window.localStorage.setItem(chaveAjuda, "sim");
      } catch {
        /* Mantém a preferência nesta sessão. */
      }
    }
    ajuda.close();
    ajuda.remove();
    ajuda = null;
    if (focoOrigem?.isConnected) focoOrigem.focus({ preventScroll: true });
    else
      document
        .querySelector('#app [data-acao="combate-rolar"], #app [data-acao="combate-continuar"], #app')
        ?.focus({ preventScroll: true });
    return true;
  }
  function abrir(titulo, conteudo) {
    if (!document.createElement) return false;
    if (ajuda) fechar();
    focoOrigem = document.activeElement;
    ajuda = document.createElement("dialog");
    ajuda.className = "sistemas-dialogo";
    ajuda.setAttribute("aria-label", titulo);
    ajuda.innerHTML = `<h2>${esc(titulo)}</h2>${conteudo}<button type="button" class="botao" data-sistema-fechar>Fechar</button>`;
    document.body.append(ajuda);
    ajuda.addEventListener("cancel", (e) => {
      e.preventDefault();
      fechar();
    });
    ajuda.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.closest("[data-sistema-fechar]")) fechar();
      else if (e.target.closest("[data-ajuda-proxima]")) {
        if (etapa === 3) fechar();
        else {
          etapa++;
          desenharAjuda();
        }
      } else if (e.target.closest("[data-ajuda-voltar]")) {
        etapa = Math.max(0, etapa - 1);
        desenharAjuda();
      }
    });
    ajuda.showModal();
    return true;
  }
  function regraEmpate(run) {
    const p = run.combatePendente || run.ultimoResultado?.combate;
    if (p?.ehTesteDados || (run.fase === "resultado" && run.ultimoResultado?.testeDados))
      return "Atingir a dificuldade dá sucesso; o limite intermediário dá sucesso com custo. Um 20 natural garante sucesso e um 1 natural causa falha.";
    if (p?.ehDueloDados) {
      const o = J.engine.opcaoCombatePendente(run);
      return o?.dueloDados?.empateVence ? "O empate favorece o herdeiro." : "O empate favorece o oponente.";
    }
    return p?.tracoInimigo === "veloz"
      ? "O inimigo Veloz vence o empate nos totais."
      : "O herdeiro vence o empate nos totais.";
  }
  function desenharAjuda() {
    const textos = [
      [
        "A disputa",
        `${regraEmpate(runAtual)} Em batalhas, compare o dado escolhido mais Ataque com o dado inimigo mais Defesa. O quadro de cada lado mostra esses valores.`,
      ],
      [
        "Antes da rolagem",
        "A postura fica nos controles de preparação: equilibrada mantém os valores; agressiva dá +2 Ataque e aumenta o dano em 25%; defensiva tira 2 Ataque e reduz o dano em 35%. Itens preparados informam quando serão consumidos.",
      ],
      [
        "Vitória e dano",
        "O quadro da rolagem mostra o vencedor. A seção de dano mostra a consequência: primeiro a margem da derrota, depois a postura, o Escudo e as reduções. Vencer uma batalha comum não causa dano de combate; outras consequências da carta continuam valendo.",
      ],
      [
        "Recursos e chefes",
        "Rerrolagens ficam junto aos dados e gastam a carga indicada. Chefes possuem Vida própria: confirmar um acerto retira Vida do chefe; um contra-ataque fere o herdeiro. A última troca permanece no painel. Fechar esta ajuda preserva o turno e todos os recursos.",
      ],
    ];
    const [titulo, texto] = textos[etapa];
    // A navegação troca apenas o conteúdo do diálogo; nenhum método da engine roda aqui.
    const origem = focoOrigem;
    modoAjuda = false;
    abrir(
      `Ajuda de combate · ${etapa + 1}/4`,
      `<h3>${esc(titulo)}</h3><p>${esc(texto)}</p><div class="sistemas-acoes"><button class="botao" type="button" data-ajuda-voltar ${etapa === 0 ? "disabled" : ""}>Voltar</button><button class="botao" type="button" data-ajuda-proxima>${etapa === 3 ? "Concluir" : "Próximo"}</button></div>`,
    );
    modoAjuda = true;
    if (origem) focoOrigem = origem;
  }
  function tutorialCombate(run = runAtual, automatico = false) {
    if (!run) return false;
    runAtual = run;
    etapa = 0;
    focoOrigem = document.activeElement;
    desenharAjuda();
    if (automatico)
      focoOrigem = document.querySelector(
        '#app [data-acao="combate-rolar"], #app [data-acao="combate-continuar"]',
      );
    return true;
  }
  function detalhesAtributo(run, atributo) {
    modoAjuda = false;
    return abrir("Origem dos valores", `<p>${esc(J.sistemas.fontes(run, atributo))}</p>`);
  }
  function companheiros(run) {
    const presentes = J.sistemas.animais.filter(
      (id) => run.itensConquistados.includes(id) || run.inventario.includes(id),
    );
    return presentes.length
      ? `<details class="companheiros-status"><summary>Companheiros · ${presentes.length}</summary>${presentes
          .map((id) => {
            const i = J.itens.find((i) => i.id === id);
            return `<p><strong>${esc(i.nome)}</strong>: ${esc(i.descricao)} ${esc(J.sistemas.descricaoVinculo(run, id))}</p>`;
          })
          .join("")}</details>`
      : "";
  }
  function principal(run) {
    const r = run.ultimoResultado;
    if (!r) return "";
    const ordem = ["hp", "habitantes", "gold", "ataque", "escudo", "honra", "hpMax"];
    const chave =
      run.status === "encerrada"
        ? "Encerramento da crônica"
        : r.combate
          ? r.combate.venceu
            ? "Vitória no confronto"
            : "Derrota no confronto"
          : ordem.find((id) => r.alteracoes?.[id] < 0) || ordem.find((id) => r.alteracoes?.[id]);
    const nomes = {
      hp: "Vida",
      habitantes: "Habitantes",
      gold: "Gold",
      ataque: "Ataque",
      escudo: "Escudo",
      honra: "Honra",
      hpMax: "Vida máxima",
    };
    return chave
      ? `<p class="consequencia-principal">${esc(nomes[chave] ? `${nomes[chave]}: ${r.alteracoes[chave] > 0 ? "+" : ""}${r.alteracoes[chave]}` : chave)}</p>`
      : "";
  }
  function requisitos(run, requisitos) {
    if (!requisitos) return "";
    if (requisitos.qualquer)
      return requisitos.qualquer
        .map((r) => requisitosTexto(run, r))
        .filter(Boolean)
        .join(" ou ");
    return requisitosTexto(run, requisitos);
  }
  function requisitosTexto(run, r) {
    const falta = [];
    for (const id of J.atributos) {
      const minimo = r[`${id}Min`];
      if (minimo !== undefined && minimo > run.atributos[id])
        falta.push(
          `Faltam ${minimo - run.atributos[id]} ${id === "gold" ? "Gold" : id === "hp" ? "Vida" : id}`,
        );
    }
    return falta.join("; ");
  }
  function fecharPainel(run) {
    if (fechar()) return true;
    if (run?.construcoesAbertas) {
      J.ui.alternarConstrucoes(run, false);
      document.querySelector('[data-acao="alternar-construcoes"]')?.focus();
      return true;
    }
    for (const [seletor, acao] of [
      ["#painel-progresso", "alternar-progresso"],
      ["#painel-inventario", "alternar-inventario"],
    ]) {
      const painel = document.querySelector(seletor);
      if (painel?.open && !(seletor === "#painel-inventario" && run?.fase === "combate")) {
        painel.open = false;
        document.querySelector(`[data-acao="${acao}"]`)?.focus();
        return true;
      }
    }
    return false;
  }
  const jogoOriginal = J.ui.jogo;
  J.ui.jogo = function (run, opcoes) {
    const painelAnterior = document.querySelector("#painel-inventario ul");
    if (inventarioRun === run.id && painelAnterior) {
      posicao = painelAnterior.scrollTop;
      itemFocado = document.activeElement?.closest?.("[data-usar-item]")?.dataset.usarItem || null;
    } else if (inventarioRun !== run.id) {
      posicao = 0;
      itemFocado = null;
    }
    inventarioRun = run.id;
    runAtual = run;
    observador?.disconnect();
    jogoOriginal(run, opcoes);
    const painel = document.querySelector("#painel-inventario ul");
    if (painel) {
      painel.scrollTop = posicao;
      painel.addEventListener(
        "scroll",
        () => {
          posicao = painel.scrollTop;
        },
        { passive: true },
      );
      document.querySelector("#painel-inventario")?.addEventListener("toggle", (e) => {
        if (e.target.open) {
          painel.scrollTop = posicao;
          if (itemFocado)
            [...painel.querySelectorAll("[data-usar-item]")]
              .find((b) => b.dataset.usarItem === itemFocado)
              ?.focus({ preventScroll: true });
        }
      });
    }
    const podeEnsinar = () =>
      runAtual === run &&
      run.fase === "combate" &&
      !run.combatePendente?.ehTesteDados &&
      !run.combatePendente?.ehDueloDados &&
      !foiVista() &&
      !ajuda &&
      !document.querySelector(".tutorial-camada") &&
      document.querySelector(".cronica");
    if (podeEnsinar()) tutorialCombate(run, true);
    else if (run.fase === "combate" && !foiVista() && window.MutationObserver) {
      observador = new window.MutationObserver(() => {
        if (podeEnsinar()) {
          observador.disconnect();
          tutorialCombate(run, true);
        }
      });
      observador.observe(document.getElementById("app"), { childList: true, subtree: true });
    }
    const avisoEfeito = document.querySelector(".efeito-consumido");
    const chaveEfeito = `${run.id}:${run.rodada}:${run.eventoId}:${run.combatePendente?.turnosChefe || 0}`;
    if (avisoEfeito) {
      avisoEfeito.classList.toggle(
        "efeito-consumido--novo",
        !opcoes?.textoCompleto && !efeitosVistos.has(chaveEfeito),
      );
      efeitosVistos.add(chaveEfeito);
    }
    const transicao = document.querySelector(".transicao-estacao");
    const chaveEstacao = `${run.id}:${run.sistemas?.estacaoVista}`;
    if (transicao) {
      transicao.classList.toggle(
        "transicao-estacao--nova",
        !opcoes?.textoCompleto && !transicoesVistas.has(chaveEstacao),
      );
      transicoesVistas.add(chaveEstacao);
    }
  };
  // Captura antes dos atalhos do controlador, inclusive enquanto o diálogo estiver aberto.
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.repeat && ["Enter", " "].includes(e.key)) {
        e.preventDefault();
        return;
      }
      if (ajuda && !ajuda.contains(e.target)) {
        e.preventDefault();
        e.stopImmediatePropagation?.();
        return;
      }
      if (e.key === "Escape" && fecharPainel(runAtual)) {
        e.preventDefault();
        e.stopImmediatePropagation?.();
      }
    },
    true,
  );
  J.ui.tutorialCombate = tutorialCombate;
  J.ui.ajudaCombateAberta = () => Boolean(ajuda);
  J.ui.detalhesAtributo = detalhesAtributo;
  J.ui.preferenciaTexto = preferenciaTexto;
  J.ui.alternarVelocidadeTexto = () => {
    const valor = { normal: "rapido", rapido: "imediato", imediato: "normal" }[preferenciaTexto()];
    try {
      window.localStorage.setItem(chaveTexto, valor);
    } catch {
      /* A partida continua sem armazenamento. */
    }
    return valor;
  };
  J.sistemasUI = { companheiros, principal, requisitos, regraEmpate };
})();
