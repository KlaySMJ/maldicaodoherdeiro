(function () {
  "use strict";
  const Jogo = window.Jogo = window.Jogo || {};

  // Regras e valores de balanceamento ficam juntos para facilitar ajustes.
  Jogo.config = {
    versao: 2,
    iniciais: { hp: 100, escudo: 5, ataque: 2, honra: 0, habitantes: 50, gold: 5 },
    economia: { habitantesPorGold: 50, intervaloRenda: 3, habitantesParaManutencao: 20, perdaPorRodada: 1 },
    memoriaEventos: 5,
    honraAlta: 30,
    honraBaixa: -30,
    honraEscolhasAlta: 50,
    honraEscolhasBaixa: -50
  };
  Jogo.atributos = ["hp", "escudo", "ataque", "honra", "habitantes", "gold"];

  Jogo.estado = {
    novo(legado) {
      return {
        versao: Jogo.config.versao,
        id: window.crypto?.randomUUID?.() || `run-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        status: "ativa",
        fase: "escolha",
        rodada: 1,
        atributos: { ...Jogo.config.iniciais },
        inventario: [],
        comprasMercador: {},
        ofertaMercador: null,
        efeitosPreparados: { bloquearDanoProximaBatalha: false, bonusAtaqueProximaBatalha: 0, bonusEscudoProximaBatalha: 0, bonusGoldProximaRecompensa: 0 },
        eventosRecentes: [],
        honraReveladaAteRodada: 0,
        flags: {},
        // A fotografia do legado impede que novidades entrem na run em andamento.
        legadoDaRun: Jogo.legado.normalizar(legado),
        conquistas: Jogo.legado.vazio(),
        eventoId: null,
        ultimoResultado: null,
        fim: null
      };
    },
    faixaHonra(honra) {
      if (honra >= Jogo.config.honraAlta) return "alta";
      if (honra <= Jogo.config.honraBaixa) return "baixa";
      return "neutra";
    }
  };
})();
