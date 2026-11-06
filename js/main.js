(function () {
  "use strict";
  const Jogo = window.Jogo;
  try {
    for (const chave of ["debug_jogo", "debug_forcar_druida", "debug_forcar_menino", "debug_forcar_heroi"])
      window.localStorage.removeItem(chave);
  } catch {
    /* O armazenamento pode estar bloqueado; os atalhos de debug são opcionais. */
  }
  let run = Jogo.save.lerRun();
  let ocupado = false;

  function mostrarJogo(textoCompleto = false) {
    if (run?.status === "ativa") Jogo.ui.jogo(run, { textoCompleto });
  }

  function mostrarFim() {
    const salvo = Jogo.save.finalizar(run);
    Jogo.ui.fim(run, salvo);
  }

  function ativarEventoEspecialDebug(categoria) {
    if (Jogo.engine.debugAtivarEventoEspecial(run, categoria)) {
      Jogo.save.gravarRun(run);
      mostrarJogo();
    }
  }

  function ativarContagioDebug(eventoId) {
    if (Jogo.engine.debugAtivarContagio(run, eventoId)) {
      Jogo.save.gravarRun(run);
      mostrarJogo();
    }
  }

  function ativarNovoConselheiroDebug() {
    if (Jogo.engine.debugAtivarNovoConselheiro(run)) {
      Jogo.save.gravarRun(run);
      mostrarJogo();
    }
  }

  function forcarCondicaoDebug(condicaoId) {
    if (Jogo.engine.debugForcarCondicao(run, condicaoId)) {
      Jogo.save.gravarRun(run);
      mostrarJogo();
    }
  }

  function carregar() {
    // O save pode ter mudado desde a abertura do menu. Recupera todos os campos
    // no clique; usa a sessão em memória somente se não houver um save legível.
    const salva = Jogo.save.lerRun();
    if (salva) run = salva;
    if (!run) {
      Jogo.ui.menu(null);
      return;
    }
    if (run.status === "encerrada") mostrarFim();
    else mostrarJogo(true);
  }

  function iniciar(personagem = null, pularIntro = false) {
    const legado = Jogo.save.lerLegado();
    if (personagem && !Jogo.estado.tracosDisponiveis(legado).includes(personagem)) return false;
    run = Jogo.estado.novo(legado, personagem);
    Jogo.legado.avaliar(run);
    const evento = Jogo.engine.sortear(run);
    if (!evento) return;
    Jogo.engine.registrarSorteio(run, evento);
    Jogo.save.gravarRun(run);
    if (pularIntro) mostrarJogo();
    else Jogo.ui.intro();
    return true;
  }

  async function acionar(acao, botao = null) {
    switch (acao) {
      case "debug-alternar":
        Jogo.ui.alternarDebug();
        Jogo.ui.menu(run);
        break;
      case "iniciar":
        if (run?.status === "ativa" && !(await Jogo.ui.confirmarNovaRun())) return;
        if (run?.status === "ativa") Jogo.save.registrarRotacaoRun(run);
        Jogo.ui.escolherHerdeiro(Jogo.save.lerLegado());
        break;
      case "tutorial":
        if (run?.status === "ativa") {
          if (document.body.dataset.tela === "jogo") Jogo.ui.tutorial();
          else {
            Jogo.ui.tutorial();
            mostrarJogo();
          }
        } else {
          Jogo.ui.tutorial();
          iniciar(null, true);
        }
        break;
      case "novo-herdeiro":
        Jogo.ui.escolherHerdeiro(Jogo.save.lerLegado());
        break;
      case "selecionar-herdeiro":
        iniciar(botao.dataset.traco);
        break;
      case "exportar-progresso": {
        const arquivo = new Blob([JSON.stringify(Jogo.save.exportar(), null, 2)], {
          type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(arquivo);
        link.download = "a-maldicao-do-herdeiro-progresso.json";
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        break;
      }
      case "importar-progresso":
        if (await Jogo.ui.confirmarImportacao()) {
          document.getElementById("importar-progresso-arquivo")?.click();
        }
        break;
      case "debug-liberar-personagens": {
        if (!Jogo.ui.modoDebug()) break;
        const salvo = Jogo.save.liberarPersonagens();
        Jogo.ui.menu(run);
        window.dispatchEvent(
          new CustomEvent("jogo:aviso", {
            detail: salvo
              ? "Personagens liberados para escolher."
              : "Não foi possível salvar a liberação. Tente novamente.",
          }),
        );
        break;
      }
      case "carregar":
        carregar();
        break;
      case "abrir-legado":
        Jogo.ui.painelLegado(Jogo.save.lerLegado());
        break;
      case "voltar-legado":
        Jogo.ui.menu(run, true);
        break;
      case "entrar-no-jogo":
        mostrarJogo();
        break;
      case "honra-mais":
      case "honra-menos":
        if (Jogo.engine.testarHonra(run, acao === "honra-mais" ? 30 : -30)) {
          Jogo.save.gravarRun(run);
          mostrarJogo();
        }
        break;
      case "habitantes-menos":
        if (Jogo.engine.debugDiminuirHabitantes(run)) {
          if (run.status === "encerrada") mostrarFim();
          else {
            Jogo.save.gravarRun(run);
            mostrarJogo();
          }
        }
        break;
      case "debug-transformacoes":
        Jogo.ui.preverTransformacoes(run);
        break;
      case "detalhes-condicao":
        Jogo.ui.mostrarDetalhesCondicao(run);
        break;
      case "debug-especial-entidade":
        ativarEventoEspecialDebug("entidade");
        break;
      case "debug-especial-abissal":
        ativarEventoEspecialDebug("abissal");
        break;
      case "debug-especial-zodiaco":
        ativarEventoEspecialDebug("zodiaco");
        break;
      case "debug-especial-norte":
        ativarEventoEspecialDebug("norte");
        break;
      case "debug-contagio-uivos":
        ativarContagioDebug("uivos_no_bosque");
        break;
      case "debug-contagio-hospede":
        ativarContagioDebug("hospede_palido");
        break;
      case "debug-contagio-anel":
        ativarContagioDebug("anel_do_defunto");
        break;
      case "debug-conselheiro":
        ativarNovoConselheiroDebug();
        break;
      case "debug-condicao-licantropia":
        forcarCondicaoDebug("licantropia");
        break;
      case "debug-condicao-vampirismo":
        forcarCondicaoDebug("vampirismo");
        break;
      case "debug-condicao-possessao":
        forcarCondicaoDebug("possessao");
        break;
      case "continuar":
        if (Jogo.engine.avancar(run)) {
          if (run.status === "encerrada") mostrarFim();
          else {
            Jogo.save.gravarRun(run);
            Jogo.ui.jogo(run);
          }
        }
        break;
      case "juntar-culto":
        if (Jogo.engine.juntarCulto(run)) {
          Jogo.save.gravarRun(run);
          Jogo.ui.jogo(run);
        }
        break;
      case "encerrar-culto":
        if (Jogo.engine.encerrarSemCulto(run)) mostrarFim();
        break;
      case "menu":
        if (run?.status === "encerrada") run = null;
        Jogo.ui.menu(run);
        break;
      case "alternar-inventario":
        document.querySelector("#app #painel-inventario > summary")?.click();
        break;
      case "alternar-progresso":
        document.querySelector("#app #painel-progresso > summary")?.click();
        break;
      case "tentar-salvar":
        mostrarFim();
        break;
    }
  }

  document.addEventListener(
    "click",
    (evento) => {
      if (Jogo.ui.completarTextoEvento()) {
        evento.preventDefault();
        evento.stopPropagation();
      }
    },
    true,
  );

  document.getElementById("app").addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button");
    if (!botao || botao.disabled || ocupado) return;
    const toqueSemHover = window.matchMedia?.("(hover: none)").matches && evento.detail > 0;
    if (
      botao.dataset.acao === "selecionar-herdeiro" &&
      toqueSemHover &&
      botao.dataset.infoRevelada !== "true"
    ) {
      botao.dataset.infoRevelada = "true";
      botao.focus({ preventScroll: true });
      return;
    }
    if (botao.getAttribute("aria-disabled") === "true" || botao.getAttribute("role") === "tab") return;
    const honraAntesDaEscolha = run?.atributos.honra;
    Jogo.audio?.interagir();
    if (botao.dataset.opcao) {
      const carta = Jogo.eventoPorId(run?.eventoId);
      Jogo.audio?.sfx(carta?.batalha ? "impacto" : "confirmacao");
    } else if (botao.dataset.mercadoria) Jogo.audio?.sfx("moedas");
    else if (botao.dataset.acao === "continuar") Jogo.audio?.sfx("carta");
    else if (botao.dataset.acao === "juntar-culto") Jogo.audio?.sfx("sino");
    ocupado = true;
    try {
      const itemSacrificio = botao.dataset.itemSacrificio;
      const itemUsadoId = itemSacrificio
        ? botao.dataset.itemId || "adaga_cerimonial"
        : botao.dataset.usarItem;
      if (run && itemUsadoId && Jogo.engine.usarItem(run, itemUsadoId, itemSacrificio)) {
        const item = Jogo.itens.find((candidato) => candidato.id === itemUsadoId);
        run.inventarioAberto = true;
        run.avisoInventario =
          itemUsadoId === "adaga_cerimonial" && run.flags.adaga_herdeiro_culto
            ? "Adaga cerimonial: 5 seguidores por +10 Ataque e +5 Escudo."
            : item
              ? `${item.nome}: ${item.descricao}`
              : "Item usado.";
        if (run.status === "encerrada") mostrarFim();
        else {
          Jogo.save.gravarRun(run);
          Jogo.ui.jogo(run);
        }
        return;
      }
      const resolvida =
        run &&
        (botao.dataset.mercadoria
          ? Jogo.engine.comprar(run, botao.dataset.mercadoria)
          : botao.dataset.opcao && Jogo.engine.escolher(run, botao.dataset.opcao));
      if (botao.dataset.opcao && resolvida && run.atributos.honra > honraAntesDaEscolha)
        Jogo.audio?.sfx("honra");
      if (resolvida) {
        if (run.status === "encerrada") mostrarFim();
        else {
          Jogo.save.gravarRun(run);
          Jogo.ui.jogo(run);
        }
      } else if (botao.dataset.acao) await acionar(botao.dataset.acao, botao);
    } finally {
      ocupado = false;
    }
  });

  document.getElementById("importar-progresso-arquivo")?.addEventListener("change", async (evento) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    try {
      const conteudo = JSON.parse(await arquivo.text());
      if (!Jogo.save.importar(conteudo))
        throw new Error("O arquivo não contém um progresso válido deste jogo.");
      run = Jogo.save.lerRun();
      Jogo.ui.menu(run);
    } catch (erro) {
      window.dispatchEvent(
        new CustomEvent("jogo:aviso", {
          detail: erro instanceof Error ? erro.message : "Não foi possível importar o progresso.",
        }),
      );
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (Jogo.ui.completarTextoEvento(evento.key)) {
      evento.preventDefault();
      return;
    }
    if (evento.key === "Escape" && document.body.dataset.tela === "legado") {
      evento.preventDefault();
      Jogo.ui.menu(run, true);
      return;
    }
    if (
      evento.defaultPrevented ||
      evento.repeat ||
      evento.altKey ||
      evento.ctrlKey ||
      evento.metaKey ||
      document.querySelector("dialog[open]") ||
      evento.target.closest?.("input, textarea, select, [contenteditable='true'], button, a, summary")
    )
      return;

    if (/^[1-9]$/.test(evento.key)) {
      const escolha = document.querySelectorAll("#app [data-opcao]")[Number(evento.key) - 1];
      if (!escolha || escolha.disabled || !run || run.aguardaDecisaoCulto) return;
      evento.preventDefault();
      escolha.click();
      return;
    }
    if (evento.key === "Enter") {
      const continuar = document.querySelector('#app [data-acao="continuar"]');
      if (continuar && !continuar.disabled) {
        evento.preventDefault();
        continuar.click();
      }
    }
  });

  // Recupera um encerramento interrompido entre a gravação do legado e a remoção da run.
  if (run?.status === "encerrada") mostrarFim();
  else Jogo.ui.menu(run);
})();
