(function () {
  "use strict";
  const Jogo = window.Jogo;
  let run = Jogo.save.lerRun();
  let ocupado = false;

  function mostrarJogo() {
    if (run?.status === "ativa") Jogo.ui.jogo(run);
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
    if (!run) { Jogo.ui.menu(null); return; }
    if (run.status === "encerrada") mostrarFim(); else mostrarJogo();
  }

  function iniciar(personagem = null) {
    const legado = Jogo.save.lerLegado();
    const tracoForcado = personagem || (window.localStorage.getItem("debug_forcar_druida") === "1" ? "druida_herdeiro" : null);
    run = Jogo.estado.novo(legado, tracoForcado);
    Jogo.legado.avaliar(run);
    const evento = Jogo.engine.sortear(run);
    if (!evento) return;
    Jogo.engine.registrarSorteio(run, evento);
    Jogo.save.gravarRun(run);
    Jogo.ui.intro();
    return true;
  }

  async function acionar(acao, dados = {}) {
    switch (acao) {
      case "iniciar":
        if (run?.status === "ativa" && !await Jogo.ui.confirmarNovaRun()) return;
        if (run?.status === "ativa") Jogo.save.registrarRotacaoRun(run);
        iniciar();
        break;
      case "novo-herdeiro": iniciar(); break;
      case "debug-alternar-druida":
        window.localStorage.setItem("debug_forcar_druida", window.localStorage.getItem("debug_forcar_druida") === "1" ? "0" : "1");
        Jogo.ui.menu(run);
        break;
      case "carregar":
        carregar();
        break;
      case "entrar-no-jogo": mostrarJogo(); break;
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
          else { Jogo.save.gravarRun(run); mostrarJogo(); }
        }
        break;
      case "debug-transformacoes": Jogo.ui.preverTransformacoes(run); break;
      case "debug-especial-entidade": ativarEventoEspecialDebug("entidade"); break;
      case "debug-especial-abissal": ativarEventoEspecialDebug("abissal"); break;
      case "debug-especial-zodiaco": ativarEventoEspecialDebug("zodiaco"); break;
      case "debug-especial-norte": ativarEventoEspecialDebug("norte"); break;
      case "debug-contagio-uivos": ativarContagioDebug("uivos_no_bosque"); break;
      case "debug-contagio-hospede": ativarContagioDebug("hospede_palido"); break;
      case "debug-contagio-anel": ativarContagioDebug("anel_do_defunto"); break;
      case "debug-condicao-licantropia": forcarCondicaoDebug("licantropia"); break;
      case "debug-condicao-vampirismo": forcarCondicaoDebug("vampirismo"); break;
      case "debug-condicao-possessao": forcarCondicaoDebug("possessao"); break;
      case "continuar":
        if (Jogo.engine.avancar(run)) {
          if (run.status === "encerrada") mostrarFim();
          else { Jogo.save.gravarRun(run); Jogo.ui.jogo(run); }
        }
        break;
      case "juntar-culto":
        if (Jogo.engine.juntarCulto(run)) { Jogo.save.gravarRun(run); Jogo.ui.jogo(run); }
        break;
      case "encerrar-culto":
        if (Jogo.engine.encerrarSemCulto(run)) mostrarFim();
        break;
      case "menu":
        if (run?.status === "encerrada") run = null;
        Jogo.ui.menu(run);
        break;
      case "tentar-salvar": mostrarFim(); break;
    }
  }

  document.getElementById("app").addEventListener("click", async evento => {
    const botao = evento.target.closest("button");
    if (!botao || botao.disabled || ocupado) return;
    Jogo.audio?.interagir();
    ocupado = true;
    try {
      const itemSacrificio = botao.dataset.itemSacrificio;
      const itemUsadoId = itemSacrificio ? botao.dataset.itemId || "adaga_cerimonial" : botao.dataset.usarItem;
      if (run && itemUsadoId && Jogo.engine.usarItem(run, itemUsadoId, itemSacrificio)) {
        const item = Jogo.itens.find(candidato => candidato.id === itemUsadoId);
        run.inventarioAberto = true;
        run.avisoInventario = item ? `${item.nome}: ${item.descricao}` : "Item usado.";
        if (run.status === "encerrada") mostrarFim();
        else { Jogo.save.gravarRun(run); Jogo.ui.jogo(run); }
        return;
      }
      const resolvida = run && (botao.dataset.mercadoria
        ? Jogo.engine.comprar(run, botao.dataset.mercadoria)
        : botao.dataset.opcao && Jogo.engine.escolher(run, botao.dataset.opcao));
      if (resolvida) {
        if (run.status === "encerrada") mostrarFim();
        else { Jogo.save.gravarRun(run); Jogo.ui.jogo(run); }
      } else if (botao.dataset.acao) await acionar(botao.dataset.acao, { animal: botao.dataset.animal });
    } finally {
      ocupado = false;
    }
  });

  // Recupera um encerramento interrompido entre a gravação do legado e a remoção da run.
  if (run?.status === "encerrada") mostrarFim();
  else Jogo.ui.menu(run);
})();
