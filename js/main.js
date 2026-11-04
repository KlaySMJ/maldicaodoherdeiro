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

  function carregar() {
    // O save pode ter mudado desde a abertura do menu. Recupera todos os campos
    // no clique; usa a sessão em memória somente se não houver um save legível.
    const salva = Jogo.save.lerRun();
    if (salva) run = salva;
    if (!run) { Jogo.ui.menu(null); return; }
    if (run.status === "encerrada") mostrarFim(); else mostrarJogo();
  }

  function iniciar() {
    run = Jogo.estado.novo(Jogo.save.lerLegado());
    Jogo.legado.avaliar(run);
    const evento = Jogo.engine.sortear(run);
    if (!evento) return;
    Jogo.engine.registrarSorteio(run, evento);
    Jogo.save.gravarRun(run);
    Jogo.ui.intro();
  }

  async function acionar(acao) {
    switch (acao) {
      case "iniciar":
        if (run?.status === "ativa" && !await Jogo.ui.confirmarNovaRun()) return;
        iniciar();
        break;
      case "novo-herdeiro": iniciar(); break;
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
      case "continuar":
        if (Jogo.engine.avancar(run)) { Jogo.save.gravarRun(run); Jogo.ui.jogo(run); }
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
    ocupado = true;
    try {
      const resolvida = run && (botao.dataset.mercadoria
        ? Jogo.engine.comprar(run, botao.dataset.mercadoria)
        : botao.dataset.opcao && Jogo.engine.escolher(run, botao.dataset.opcao));
      if (run && botao.dataset.usarItem && Jogo.engine.usarItem(run, botao.dataset.usarItem)) {
        Jogo.save.gravarRun(run);
        Jogo.ui.jogo(run);
      } else if (resolvida) {
        if (run.status === "encerrada") mostrarFim();
        else { Jogo.save.gravarRun(run); Jogo.ui.jogo(run); }
      } else if (botao.dataset.acao) await acionar(botao.dataset.acao);
    } finally {
      ocupado = false;
    }
  });

  // Recupera um encerramento interrompido entre a gravação do legado e a remoção da run.
  if (run?.status === "encerrada") mostrarFim();
  else Jogo.ui.menu(run);
})();
