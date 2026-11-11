(function () {
  "use strict";
  const Jogo = (window.Jogo = window.Jogo || {});

  // Regras e valores de balanceamento ficam juntos para facilitar ajustes.
  Jogo.config = {
    versao: 2,
    iniciais: { hp: 120, escudo: 5, ataque: 2, honra: 0, habitantes: 50, gold: 5 },
    hpMaxInicial: 120,
    curaCritica: { limiarVida: 0.3, proporcaoCura: 0.15, curaMaxima: 20, intervaloRodadas: 25 },
    economia: { habitantesPorGold: 50, intervaloRenda: 3, habitantesParaManutencao: 20, perdaPorRodada: 1 },
    progressaoCombate: {
      defesaPorAno: 3,
      danoPorAno: 2,
      ataqueLivre: 5,
      proporcaoAtaque: 0.2,
    },
    memoriaEventos: 25,
    memoriaCronica: 15,
    rodadasVitoria: 300,
    intervaloEntidade: 24,
    honraAlta: 30,
    honraBaixa: -30,
    honraExtremaAlta: 90,
    honraExtremaBaixa: -90,
  };
  Jogo.eventos = [];
  Jogo.eventosPorId = new Map();
  Jogo.criarOpcao = (opcao) => {
    if (
      !opcao ||
      typeof opcao !== "object" ||
      Array.isArray(opcao) ||
      typeof opcao.id !== "string" ||
      !opcao.id.trim()
    ) {
      throw new TypeError("Opção inválida: cada escolha precisa de um ID.");
    }
    return opcao;
  };
  Jogo.criarEvento = (evento) => {
    if (
      !evento ||
      typeof evento !== "object" ||
      Array.isArray(evento) ||
      typeof evento.id !== "string" ||
      !evento.id.trim() ||
      typeof evento.titulo !== "string" ||
      !evento.titulo.trim() ||
      typeof evento.tipo !== "string" ||
      !evento.tipo.trim() ||
      !(Array.isArray(evento.opcoes) || Array.isArray(evento.poolOpcoes))
    ) {
      throw new TypeError("Evento inválido: cada carta precisa de id, título, tipo e opções.");
    }
    (evento.poolOpcoes || evento.opcoes).forEach(Jogo.criarOpcao);
    return evento;
  };
  Jogo.registrarEventos = (...lotes) => {
    const eventos = lotes.flat().map(Jogo.criarEvento);
    const idsNovos = new Set();
    for (const evento of eventos) {
      if (Jogo.eventosPorId.has(evento.id) || idsNovos.has(evento.id)) {
        throw new Error(`ID de evento duplicado: ${evento.id}`);
      }
      idsNovos.add(evento.id);
    }
    for (const evento of eventos) {
      Jogo.eventos.push(evento);
      Jogo.eventosPorId.set(evento.id, evento);
    }
  };
  Jogo.eventoPorId = (id) => Jogo.eventosPorId.get(id) || null;
  Jogo.validarCatalogoEventos = () => {
    if (Jogo.eventosPorId.size !== Jogo.eventos.length) {
      throw new Error("O array e o índice de eventos têm tamanhos diferentes.");
    }
    const idsEventos = new Set();
    for (const evento of Jogo.eventos) {
      Jogo.criarEvento(evento);
      if (idsEventos.has(evento.id) || Jogo.eventosPorId.get(evento.id) !== evento) {
        throw new Error(`Índice inconsistente para o evento: ${evento.id}`);
      }
      idsEventos.add(evento.id);
      const idsOpcoes = new Set();
      for (const opcao of evento.poolOpcoes || evento.opcoes) {
        if (!opcao || typeof opcao.id !== "string" || !opcao.id.trim()) {
          throw new TypeError(`Opção sem ID no evento ${evento.id}.`);
        }
        if (idsOpcoes.has(opcao.id)) throw new Error(`Opção duplicada no evento ${evento.id}: ${opcao.id}`);
        idsOpcoes.add(opcao.id);
        const destino = opcao.consequenciaTardia?.eventoId;
        if (destino && !Jogo.eventosPorId.has(destino)) {
          throw new Error(`Evento ${evento.id} agenda um ID inexistente: ${destino}`);
        }
      }
    }
    return true;
  };
  Jogo.atributos = ["hp", "escudo", "ataque", "honra", "habitantes", "gold"];
  Jogo.estacoes = ["primavera", "verao", "outono", "inverno"];
  // Quatro estações de 25 rodadas formam cada ano da crônica.
  Jogo.anoDaRodada = (rodada) => Math.floor((Math.max(1, rodada) - 1) / 100) + 1;
  Jogo.estacaoDaRodada = (rodada, personagem = null) => {
    const traco = typeof personagem === "string" ? personagem : personagem?.traco;
    return traco === "druida_herdeiro" && Jogo.druida
      ? Jogo.druida.estacaoDaRodada(rodada)
      : Jogo.estacoes[Math.floor((Math.max(1, rodada) - 1) / 25) % Jogo.estacoes.length];
  };

  Jogo.estado = {
    tracosDisponiveis(legado) {
      const pool = ["corajoso", "avarento", "doente"];
      const flags = Jogo.legado.normalizar(legado).flags;
      for (const id of Jogo.herdeiros.desbloqueaveis) if (flags[id] === true) pool.push(id);
      return pool;
    },
    novo(legado, personagem = null) {
      const legadoDaRun = Jogo.legado.normalizar(legado);
      const poolTracos = Jogo.estado.tracosDisponiveis(legadoDaRun);
      const traco = Jogo.herdeiros.todos.includes(personagem)
        ? personagem
        : poolTracos[Math.floor(Math.random() * poolTracos.length)];
      const iniciaisTraco = {
        corajoso: { ...Jogo.config.iniciais, hp: 120, ataque: 3 },
        avarento: { ...Jogo.config.iniciais, gold: 10 },
        doente: { ...Jogo.config.iniciais, hp: 90, escudo: 4 },
        druida_herdeiro: { ...Jogo.config.iniciais, hp: 120, escudo: 2, ataque: 2, habitantes: 50, gold: 3 },
        menino_cronista: { ...Jogo.config.iniciais, hp: 90, escudo: 3, honra: 30 },
        // A Heroína do povo é a guarda da vila: ataque e escudo altos, honra imune à perda.
        heroi_do_povo: { ...Jogo.config.iniciais, escudo: 5, ataque: 5 },
      }[traco] || { ...Jogo.config.iniciais, ...Jogo.herdeiros.novos[traco].iniciais };
      const memoriaAnterior = legadoDaRun.memorias.at(-1);
      const derrotasMemoria = legadoDaRun.memorias.filter((memoria) => memoria.tipo === "derrota").length;
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
        batalhasVencidas: 0,
        ultimaBatalhaRodada: 0,
        debugFaceCoringa: 0,
        debugTracoInimigo: "aleatorio",
        dadosNaturais20Combate: 0,
        dadosNaturais1Combate: 0,
        vitoriasComDesvantagem: 0,
        vitoriasComRerrolagem: 0,
        dadosCombatePermanentes: 0,
        combatePendente: null,
        inventario: [],
        itensConquistados: [],
        logItens: [],
        itensConsumidosEm: {},
        cultoAtivo: false,
        seguidoresCulto: 0,
        aguardaDecisaoCulto: false,
        comprasMercador: {},
        mercadoriasCompradas: [],
        ofertaMercador: null,
        efeitosPreparados: {
          bloquearDanoProximaBatalha: false,
          bonusAtaqueProximaBatalha: 0,
          bonusDadosCombateProximaBatalha: 0,
          rerrolagensGratisProximaBatalha: 0,
          desvantagemInimigaProximaBatalha: false,
          bonusEscudoProximaBatalha: 0,
          bonusGoldProximaRecompensa: 0,
          bacamarteBatalhas: 0,
          escudoFeCooldown: 0,
        },
        lancaHeroiBatalhas: 0,
        eventosRecentes: [],
        historicoCronica: [],
        historicoCronicaAberto: false,
        vampirismoHabitantesConsumidos: 0,
        vampirismoBonusAtaque: 0,
        consequenciasAgendadas: [],
        nemesis:
          memoriaAnterior?.tipo === "derrota"
            ? {
                motivo: memoriaAnterior.motivo,
                traco: memoriaAnterior.traco || null,
                meninoAdotado: memoriaAnterior.meninoAdotado === true,
                nivel: Math.min(4, Math.max(1, derrotasMemoria)),
                enfrentado: false,
              }
            : null,
        eventosComunsRun: [],
        conselhosRecentes: [],
        honraNeutraSequencia: 0,
        honraSempreNeutra: iniciaisTraco.honra >= -29 && iniciaisTraco.honra <= 29,
        avisosConquistas: [],
        marcos: {},
        honraReveladaAteRodada: 0,
        habitantesReveladosAteRodada: 0,
        opcoesSorteadas: [],
        janelaZodiaco: null,
        efeitoDivino: null,
        pressagios: Jogo.pressagios?.vazio(),
        flags: { debugApenasEventosD20: false },
        condicao: {
          ativa: null,
          rodada: null,
          abracada: false,
          curada: false,
          bonusAbraco: { ataque: 0, escudo: 0 },
        },
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
        fim: null,
      };
      if (traco === "druida_herdeiro") {
        Jogo.druida?.novaRun(run);
      }
      Jogo.herdeiros.novaRun(run);
      Jogo.sistemas?.estado(run);
      return run;
    },
    faixaHonra(honra) {
      if (honra >= Jogo.config.honraExtremaAlta) return "altissima";
      if (honra <= Jogo.config.honraExtremaBaixa) return "baixissima";
      if (honra >= Jogo.config.honraAlta) return "alta";
      if (honra <= Jogo.config.honraBaixa) return "baixa";
      return "neutra";
    },
  };
})();
