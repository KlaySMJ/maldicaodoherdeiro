(function () {
  "use strict";
  const Jogo = window.Jogo = window.Jogo || {};

  // Regras e valores de balanceamento ficam juntos para facilitar ajustes.
  Jogo.config = {
    versao: 2,
    iniciais: { hp: 100, escudo: 5, ataque: 2, honra: 0, habitantes: 50, gold: 5 },
    hpMaxInicial: 100,
    economia: { habitantesPorGold: 50, intervaloRenda: 3, habitantesParaManutencao: 20, perdaPorRodada: 1 },
    memoriaEventos: 10,
    honraAlta: 30,
    honraBaixa: -30,
    honraExtremaAlta: 90,
    honraExtremaBaixa: -90,
    honraEscolhasAlta: 50,
    honraEscolhasBaixa: -50
  };
  Jogo.atributos = ["hp", "escudo", "ataque", "honra", "habitantes", "gold"];
  Jogo.estacoes = ["primavera", "verao", "outono", "inverno"];
  Jogo.estacaoDaRodada = rodada => Jogo.estacoes[Math.floor((Math.max(1, rodada) - 1) / 25) % Jogo.estacoes.length];

  Jogo.estado = {
    novo(legado) {
      const traco = ["corajoso", "avarento", "doente"][Math.floor(Math.random() * 3)];
      const iniciaisTraco = {
        corajoso: { ...Jogo.config.iniciais, hp: 100, ataque: 3 },
        avarento: { ...Jogo.config.iniciais, gold: 10 },
        doente: { ...Jogo.config.iniciais, hp: 70, escudo: 4 }
      }[traco];
      return {
        versao: Jogo.config.versao,
        id: window.crypto?.randomUUID?.() || `run-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        status: "ativa",
        fase: "escolha",
        rodada: 1,
        atributos: iniciaisTraco,
        traco,
        estacao: Jogo.estacaoDaRodada(1),
        hpMax: iniciaisTraco.hp,
        construcoes: [],
        cultoRendaPorRodada: 0,
        inventario: [],
        itensConquistados: [],
        cultoAtivo: false,
        seguidoresCulto: 0,
        aguardaDecisaoCulto: false,
        comprasMercador: {},
        ofertaMercador: null,
        efeitosPreparados: { bloquearDanoProximaBatalha: false, bonusAtaqueProximaBatalha: 0, bonusEscudoProximaBatalha: 0, bonusGoldProximaRecompensa: 0, bacamarteBatalhas: 0, escudoFeCooldown: 0 },
        lancaHeroiBatalhas: 0,
        eventosRecentes: [],
        conselhosRecentes: [],
        honraNeutraSequencia: 0,
        marcos: {},
        honraReveladaAteRodada: 0,
        habitantesReveladosAteRodada: 0,
        opcoesSorteadas: [],
        janelaZodiaco: null,
        efeitoDivino: null,
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
      if (honra >= Jogo.config.honraExtremaAlta) return "altissima";
      if (honra <= Jogo.config.honraExtremaBaixa) return "baixissima";
      if (honra >= Jogo.config.honraAlta) return "alta";
      if (honra <= Jogo.config.honraBaixa) return "baixa";
      return "neutra";
    }
  };
})();
