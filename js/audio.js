(function () {
  "use strict";
  const janela = typeof window === "undefined" ? globalThis : window;
  const documento = typeof document === "undefined" ? null : document;
  const Jogo = (janela.Jogo = janela.Jogo || {});
  const arquivos = {
    menu: "assets/musica/menu-cronicas.wav",
    intro: "assets/musica/intro-chamado.wav",
    jogo: "assets/musica/jogo-entre-decisoes.wav",
    culto: "assets/musica/culto-pacto.wav",
    batalha: "assets/musica/batalha.wav",
    chefe_barao: "assets/musica/chefe-barao.wav",
    chefe_culto: "assets/musica/chefe-culto.wav",
    chefe_entidade: "assets/musica/chefe-entidade.wav",
    chefe_abissal: "assets/musica/chefe-abissal.wav",
    primavera: "assets/musica/primavera.wav",
    verao: "assets/musica/verao.wav",
    outono: "assets/musica/outono.wav",
    inverno: "assets/musica/inverno.wav",
  };
  const controle = documento?.getElementById?.("alternar-musica") || null;
  const volume = documento?.getElementById?.("volume-musica") || null;
  const volumeTexto = documento?.getElementById?.("volume-musica-valor") || null;
  const volumeEfeitos = documento?.getElementById?.("volume-efeitos") || null;
  const volumeEfeitosTexto = documento?.getElementById?.("volume-efeitos-valor") || null;
  const armazenamento = (() => {
    try {
      return typeof localStorage === "undefined" ? null : localStorage;
    } catch {
      return null;
    }
  })();
  const sons = new Set();
  const efeitosAtivos = new Set();
  const fades = new Map();
  const efeitos = {
    carta: "assets/musica/sfx-virada-carta.wav",
    confirmacao: "assets/musica/sfx-escolha.ogg",
    honra: "assets/musica/sfx-honra.ogg",
    impacto: "assets/musica/sfx-impacto.wav",
    moedas: "assets/musica/sfx-moedas.wav",
    sino: "assets/musica/sfx-sino-culto.wav",
    dados: "assets/musica/sfx-dados-wood-3.flac",
  };
  let contexto = "menu";
  let habilitada = true;
  let volumeAtual = 50;
  let volumeEfeitosAtual = 65;
  let desbloqueada = false;
  let falhaAoIniciar = false;
  let reduzida = false;
  let atual = null;
  let efeitoEmReproducao = null;
  const filaEfeitos = [];

  try {
    habilitada = armazenamento?.getItem("musica_ambiente") !== "0";
    const volumeArmazenado = armazenamento?.getItem("volume_musica");
    const volumeSalvo = Number(volumeArmazenado);
    if (volumeArmazenado !== null && Number.isFinite(volumeSalvo) && volumeSalvo >= 0 && volumeSalvo <= 100)
      volumeAtual = volumeSalvo;
    const efeitosArmazenados = armazenamento?.getItem("volume_efeitos");
    const efeitosSalvos = Number(efeitosArmazenados);
    if (
      efeitosArmazenados !== null &&
      Number.isFinite(efeitosSalvos) &&
      efeitosSalvos >= 0 &&
      efeitosSalvos <= 100
    )
      volumeEfeitosAtual = efeitosSalvos;
  } catch {
    // O áudio segue com os valores padrão quando o navegador bloqueia o armazenamento.
  }

  function atualizarControle() {
    if (controle) {
      const texto = habilitada ? (falhaAoIniciar ? "Ativar som" : "Pausar música") : "Retomar música";
      controle.setAttribute("aria-pressed", String(habilitada));
      controle.textContent = texto;
    }
    if (volume) volume.value = String(volumeAtual);
    if (volumeTexto) {
      volumeTexto.value = `${volumeAtual}%`;
      volumeTexto.textContent = `${volumeAtual}%`;
    }
    if (volumeEfeitos) volumeEfeitos.value = String(volumeEfeitosAtual);
    if (volumeEfeitosTexto) {
      volumeEfeitosTexto.value = `${volumeEfeitosAtual}%`;
      volumeEfeitosTexto.textContent = `${volumeEfeitosAtual}%`;
    }
  }

  function volumeDaMusica() {
    return (volumeAtual / 100) * 0.5 * (reduzida ? 0.35 : 1);
  }

  function transicionar(som, proximoVolume, segundos, pararNoFim = false) {
    const anterior = fades.get(som);
    if (anterior) clearInterval(anterior.timer);
    const inicio = som.volume;
    const comeco = performance.now();
    const fade = { timer: 0 };
    fade.timer = janela.setInterval(() => {
      const progresso = Math.min(1, (performance.now() - comeco) / (segundos * 1000));
      const curva = progresso * progresso * (3 - 2 * progresso);
      som.volume = inicio + (proximoVolume - inicio) * curva;
      if (progresso < 1) return;
      clearInterval(fade.timer);
      fades.delete(som);
      if (pararNoFim) {
        som.pause();
        sons.delete(som);
      }
    }, 40);
    fades.set(som, fade);
  }

  function iniciarFaixa() {
    if (!desbloqueada || !habilitada || !arquivos[contexto] || typeof Audio === "undefined") return;
    const proxima = new Audio(arquivos[contexto]);
    proxima.loop = true;
    proxima.preload = "auto";
    proxima.volume = 0;
    sons.add(proxima);
    const anterior = atual;
    atual = proxima;
    proxima
      .play()
      .then(() => {
        if (!habilitada || atual !== proxima) {
          transicionar(proxima, 0, 0.3, true);
          return;
        }
        falhaAoIniciar = false;
        atualizarControle();
        transicionar(proxima, volumeDaMusica(), 2.2);
        if (anterior && anterior !== proxima) transicionar(anterior, 0, 1.8, true);
      })
      .catch(() => {
        sons.delete(proxima);
        if (atual === proxima) atual = anterior || null;
        falhaAoIniciar = true;
        atualizarControle();
      });
  }

  function definirContexto(novoContexto) {
    if (!arquivos[novoContexto] || novoContexto === contexto) return;
    contexto = novoContexto;
    if (desbloqueada && habilitada) iniciarFaixa();
  }

  function definirDucking(ativo) {
    reduzida = Boolean(ativo);
    if (atual && !atual.paused && habilitada) transicionar(atual, volumeDaMusica(), 0.35);
  }

  function interagir() {
    desbloqueada = true;
    if (habilitada && (!atual || atual.paused)) iniciarFaixa();
  }

  function tocarSomDados() {
    if (typeof Audio === "undefined") return;
    const som = new Audio(efeitos.dados);
    som.preload = "auto";
    som.volume = (volumeEfeitosAtual / 100) * 0.8;
    efeitosAtivos.add(som);
    som.addEventListener?.("ended", () => efeitosAtivos.delete(som), { once: true });
    som.addEventListener?.("error", () => efeitosAtivos.delete(som), { once: true });
    som.play().catch(() => efeitosAtivos.delete(som));
  }

  function tocarEfeito(nome) {
    if (volumeEfeitosAtual === 0) return;
    if (nome === "dados") {
      tocarSomDados();
      return;
    }
    if (!efeitos[nome] || typeof Audio === "undefined") return;
    if (efeitoEmReproducao && !efeitoEmReproducao.paused) {
      if (nome === "honra" && !filaEfeitos.includes(nome)) filaEfeitos.push(nome);
      return;
    }
    const som = new Audio(efeitos[nome]);
    som.preload = "auto";
    som.volume = (volumeEfeitosAtual / 100) * 0.8;
    efeitosAtivos.add(som);
    efeitoEmReproducao = som;
    som.addEventListener?.(
      "ended",
      () => {
        efeitosAtivos.delete(som);
        if (efeitoEmReproducao === som) efeitoEmReproducao = null;
        const proximo = filaEfeitos.shift();
        if (proximo) tocarEfeito(proximo);
      },
      { once: true },
    );
    som.play().catch(() => {
      efeitosAtivos.delete(som);
      if (efeitoEmReproducao === som) efeitoEmReproducao = null;
      const proximo = filaEfeitos.shift();
      if (proximo) tocarEfeito(proximo);
    });
  }

  function alternar() {
    if (habilitada && falhaAoIniciar) {
      falhaAoIniciar = false;
      desbloqueada = true;
      iniciarFaixa();
      atualizarControle();
      return;
    }
    habilitada = !habilitada;
    try {
      armazenamento?.setItem("musica_ambiente", habilitada ? "1" : "0");
    } catch {
      // A preferência permanece válida durante esta sessão.
    }
    atualizarControle();
    if (habilitada) {
      desbloqueada = true;
      iniciarFaixa();
      return;
    }
    atual = null;
    for (const som of sons) transicionar(som, 0, 0.5, true);
  }

  controle?.addEventListener("click", alternar);
  documento?.addEventListener?.("pointerdown", interagir, { once: true, capture: true });
  documento?.addEventListener?.("keydown", interagir, { once: true, capture: true });
  volume?.addEventListener("input", () => {
    volumeAtual = Number(volume.value);
    atualizarControle();
    try {
      armazenamento?.setItem("volume_musica", String(volumeAtual));
    } catch {
      // O volume continua ajustado durante esta sessão.
    }
    desbloqueada = true;
    if (!habilitada) return;
    if (!atual || atual.paused) iniciarFaixa();
    else transicionar(atual, volumeDaMusica(), 0.18);
  });
  volumeEfeitos?.addEventListener("input", () => {
    volumeEfeitosAtual = Number(volumeEfeitos.value);
    atualizarControle();
    if (volumeEfeitosAtual === 0) {
      for (const efeito of efeitosAtivos) efeito.pause();
      efeitosAtivos.clear();
      efeitoEmReproducao = null;
      filaEfeitos.length = 0;
    } else {
      for (const efeito of efeitosAtivos) efeito.volume = (volumeEfeitosAtual / 100) * 0.8;
    }
    try {
      armazenamento?.setItem("volume_efeitos", String(volumeEfeitosAtual));
    } catch {
      // O volume continua ajustado durante esta sessão.
    }
  });

  documento?.addEventListener?.("visibilitychange", () => {
    if (documento.visibilityState === "hidden") {
      if (atual) {
        const faixaPausada = atual;
        atual = null;
        const fade = fades.get(faixaPausada);
        if (fade) clearInterval(fade.timer);
        fades.delete(faixaPausada);
        faixaPausada.pause();
        sons.delete(faixaPausada);
      }
      for (const efeito of efeitosAtivos) efeito.pause();
      efeitosAtivos.clear();
      efeitoEmReproducao = null;
      filaEfeitos.length = 0;
      return;
    }
    if (desbloqueada && habilitada) iniciarFaixa();
  });

  atualizarControle();
  Jogo.audio = { definirContexto, definirDucking, interagir, sfx: tocarEfeito };
})();
