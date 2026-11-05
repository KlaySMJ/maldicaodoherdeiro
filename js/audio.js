(function () {
  "use strict";
  const Jogo = window.Jogo;
  const arquivos = {
    menu: "assets/musica/menu-cronicas.wav",
    intro: "assets/musica/intro-chamado.wav",
    jogo: "assets/musica/jogo-entre-decisoes.wav",
    culto: "assets/musica/culto-pacto.wav"
  };
  const controle = document.getElementById("alternar-musica");
  const volume = document.getElementById("volume-musica");
  const volumeTexto = document.getElementById("volume-musica-valor");
  const sons = new Set();
  const fades = new Map();
  let contexto = "menu";
  let habilitada = true;
  let volumeAtual = 50;
  let desbloqueada = false;
  let atual = null;

  try {
    habilitada = localStorage.getItem("musica_ambiente") !== "0";
    const volumeArmazenado = localStorage.getItem("volume_musica");
    const volumeSalvo = Number(volumeArmazenado);
    if (volumeArmazenado !== null && Number.isFinite(volumeSalvo) && volumeSalvo >= 0 && volumeSalvo <= 100) volumeAtual = volumeSalvo;
  } catch {}

  function atualizarControle() {
    if (!controle) return;
    const texto = habilitada ? "Pausar música" : "Retomar música";
    controle.setAttribute("aria-pressed", String(habilitada));
    controle.textContent = texto;
    volume.value = String(volumeAtual);
    volumeTexto.value = `${volumeAtual}%`;
    volumeTexto.textContent = `${volumeAtual}%`;
  }

  function transicionar(som, volume, segundos, pararNoFim = false) {
    const anterior = fades.get(som);
    if (anterior) clearInterval(anterior.timer);
    const inicio = som.volume;
    const comeco = performance.now();
    const fade = { timer: 0 };
    fade.timer = window.setInterval(() => {
      const progresso = Math.min(1, (performance.now() - comeco) / (segundos * 1000));
      const curva = progresso * progresso * (3 - 2 * progresso);
      som.volume = inicio + (volume - inicio) * curva;
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
    if (!desbloqueada || !habilitada || !arquivos[contexto]) return;
    const proxima = new Audio(arquivos[contexto]);
    proxima.loop = true;
    proxima.preload = "auto";
    proxima.volume = 0;
    sons.add(proxima);
    const anterior = atual;
    atual = proxima;
    proxima.play().then(() => {
      if (!habilitada || atual !== proxima) {
        transicionar(proxima, 0, 0.3, true);
        return;
      }
      transicionar(proxima, volumeAtual / 100 * 0.5, 2.2);
      if (anterior && anterior !== proxima) transicionar(anterior, 0, 1.8, true);
    }).catch(() => {
      sons.delete(proxima);
      if (atual === proxima) atual = anterior || null;
    });
  }

  function definirContexto(novoContexto) {
    if (!arquivos[novoContexto] || novoContexto === contexto) return;
    contexto = novoContexto;
    if (desbloqueada && habilitada) iniciarFaixa();
  }

  function interagir() {
    desbloqueada = true;
    if (habilitada && (!atual || atual.paused)) iniciarFaixa();
  }

  function alternar() {
    habilitada = !habilitada;
    try { localStorage.setItem("musica_ambiente", habilitada ? "1" : "0"); } catch {}
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
  volume?.addEventListener("input", () => {
    volumeAtual = Number(volume.value);
    volumeTexto.value = `${volumeAtual}%`;
    volumeTexto.textContent = `${volumeAtual}%`;
    try { localStorage.setItem("volume_musica", String(volumeAtual)); } catch {}
    desbloqueada = true;
    if (!habilitada) return;
    if (!atual || atual.paused) iniciarFaixa();
    else transicionar(atual, volumeAtual / 100 * 0.5, 0.18);
  });
  atualizarControle();
  Jogo.audio = { definirContexto, interagir };
})();
