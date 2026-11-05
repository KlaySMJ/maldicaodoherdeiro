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
  // Quatro estações de 25 rodadas formam cada ano da crônica.
  Jogo.anoDaRodada = rodada => Math.floor((Math.max(1, rodada) - 1) / 100) + 1;
  Jogo.estacaoDaRodada = (rodada, personagem = null) => {
    const traco = typeof personagem === "string" ? personagem : personagem?.traco;
    return traco === "druida_herdeiro" && Jogo.druida
      ? Jogo.druida.estacaoDaRodada(rodada)
      : Jogo.estacoes[Math.floor((Math.max(1, rodada) - 1) / 25) % Jogo.estacoes.length];
  };

  Jogo.estado = {
    novo(legado, personagem = null) {
      const legadoDaRun = Jogo.legado.normalizar(legado);
      const poolTracos = ["corajoso", "avarento", "doente"];
      if (legadoDaRun.flags.druida_herdeiro === true) poolTracos.push("druida_herdeiro");
      const traco = personagem === "druida_herdeiro" ? "druida_herdeiro"
        : poolTracos[Math.floor(Math.random() * poolTracos.length)];
      const iniciaisTraco = {
        corajoso: { ...Jogo.config.iniciais, hp: 100, ataque: 3 },
        avarento: { ...Jogo.config.iniciais, gold: 10 },
        doente: { ...Jogo.config.iniciais, hp: 70, escudo: 4 },
        druida_herdeiro: { ...Jogo.config.iniciais, hp: 110, escudo: 2, ataque: 2, habitantes: 50, gold: 3 }
      }[traco];
      const memoriaAnterior = legadoDaRun.memorias.at(-1);
      const derrotasMemoria = legadoDaRun.memorias.filter(memoria => memoria.tipo === "derrota").length;
      const run = {
        versao: Jogo.config.versao,
        id: window.crypto?.randomUUID?.() || `run-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        status: "ativa",
        fase: "escolha",
        rodada: 1,
        atributos: iniciaisTraco,
        traco,
        estacao: Jogo.estacaoDaRodada(1, traco),
        hpMax: iniciaisTraco.hp,
        construcoes: [],
        cultoRendaPorRodada: 0,
        inventario: [],
        itensConquistados: [],
        logItens: [],
        itensConsumidosEm: {},
        cultoAtivo: false,
        seguidoresCulto: 0,
        aguardaDecisaoCulto: false,
        comprasMercador: {},
        ofertaMercador: null,
        efeitosPreparados: { bloquearDanoProximaBatalha: false, bonusAtaqueProximaBatalha: 0, bonusEscudoProximaBatalha: 0, bonusGoldProximaRecompensa: 0, bacamarteBatalhas: 0, escudoFeCooldown: 0 },
        lancaHeroiBatalhas: 0,
        eventosRecentes: [],
        consequenciasAgendadas: [],
        nemesis: memoriaAnterior?.tipo === "derrota" ? {
          motivo: memoriaAnterior.motivo,
          traco: memoriaAnterior.traco || null,
          meninoAdotado: memoriaAnterior.meninoAdotado === true,
          nivel: Math.min(4, Math.max(1, derrotasMemoria)),
          enfrentado: false
        } : null,
        eventosComunsRun: [],
        conselhosRecentes: [],
        honraNeutraSequencia: 0,
        marcos: {},
        honraReveladaAteRodada: 0,
        habitantesReveladosAteRodada: 0,
        opcoesSorteadas: [],
        janelaZodiaco: null,
        efeitoDivino: null,
        flags: {},
        condicao: { ativa: null, rodada: null, abracada: false, curada: false, bonusAbraco: { ataque: 0, escudo: 0 } },
        efeitosTemporarios: [],
        druidaPassiva: traco === "druida_herdeiro" ? null : undefined,
        cajadoBonusAtaque: traco === "druida_herdeiro" ? 2 : undefined,
        druidaAnosAlta: traco === "druida_herdeiro" ? 0 : undefined,
        druidaAnoAvaliado: traco === "druida_herdeiro" ? 0 : undefined,
        previsaoCorvo: null,
        corvoRevelaOpcaoId: null,
        // A fotografia do legado impede que novidades entrem na run em andamento.
        legadoDaRun,
        conquistas: Jogo.legado.vazio(),
        eventoId: null,
        ultimoResultado: null,
        fim: null
      };
      if (traco === "druida_herdeiro") {
        Jogo.druida?.novaRun(run);
      }
      return run;
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
