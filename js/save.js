(function () {
  "use strict";
  const Jogo = window.Jogo;
  const TRACOS_VALIDOS = Jogo.herdeiros.todos;
  const CHAVE_RUN = "run_atual";
  const CHAVE_LEGADO = "legado";
  const LEITURA_INDISPONIVEL = Symbol("leitura indisponível");
  let legadoDaSessao = Jogo.legado.vazio();

  function avisar(texto) {
    window.dispatchEvent(new CustomEvent("jogo:aviso", { detail: texto }));
  }

  function ler(chave) {
    let texto;
    try {
      texto = window.localStorage.getItem(chave);
    } catch {
      avisar(
        `Não foi possível acessar ${chave === CHAVE_LEGADO ? "o legado" : "a run salva"}. O jogo usará dados seguros.`,
      );
      return LEITURA_INDISPONIVEL;
    }
    try {
      return texto === null ? null : JSON.parse(texto);
    } catch {
      avisar(
        `Não foi possível ler ${chave === CHAVE_LEGADO ? "o legado" : "a run salva"}. O jogo usará dados seguros.`,
      );
      return null;
    }
  }

  function gravar(chave, dados) {
    try {
      window.localStorage.setItem(chave, JSON.stringify(dados));
      return true;
    } catch {
      avisar(
        "O navegador não permitiu salvar. Você pode continuar, mas este progresso pode se perder ao fechar a página.",
      );
      return false;
    }
  }

  function apagarRun() {
    try {
      // Esta operação nunca toca na chave do legado.
      window.localStorage.removeItem(CHAVE_RUN);
      return true;
    } catch {
      avisar("Não foi possível apagar a run encerrada. O jogo tentará novamente ao carregar.");
      return false;
    }
  }

  function lerLegado() {
    const dados = ler(CHAVE_LEGADO);
    if (dados === LEITURA_INDISPONIVEL) return Jogo.legado.mesclar(null, legadoDaSessao);
    if (dados !== null && (dados.versao !== 1 || typeof dados !== "object" || Array.isArray(dados))) {
      avisar("O legado salvo é incompatível ou está corrompido. Será usado um legado vazio.");
    }
    return Jogo.legado.mesclar(dados, legadoDaSessao);
  }

  const objeto = (valor) => valor !== null && typeof valor === "object" && !Array.isArray(valor);
  const inteiro = (valor) => Number.isSafeInteger(valor);
  const ids = (valor) => Array.isArray(valor) && valor.every((id) => typeof id === "string");
  const flags = (valor) => objeto(valor) && Object.values(valor).every((ativa) => typeof ativa === "boolean");
  function legadoValido(valor) {
    return (
      objeto(valor) &&
      valor.versao === 1 &&
      ids(valor.eventos) &&
      ids(valor.itens) &&
      flags(valor.flags) &&
      ids(valor.objetivosConcluidos) &&
      (valor.conquistasDesbloqueadas === undefined || ids(valor.conquistasDesbloqueadas)) &&
      (valor.memorias === undefined ||
        (Array.isArray(valor.memorias) &&
          valor.memorias.every(
            (registro) =>
              objeto(registro) &&
              typeof registro.id === "string" &&
              inteiro(registro.rodada) &&
              inteiro(registro.honra) &&
              typeof registro.tipo === "string" &&
              typeof registro.motivo === "string",
          ))) &&
      (valor.eventosRecentesRuns === undefined ||
        (Array.isArray(valor.eventosRecentesRuns) &&
          valor.eventosRecentesRuns.length <= 2 &&
          valor.eventosRecentesRuns.every(
            (registro) =>
              objeto(registro) &&
              typeof registro.id === "string" &&
              ids(registro.eventos) &&
              registro.eventos.length <= 300,
          ))) &&
      (valor.melhoresRuns === undefined ||
        (Array.isArray(valor.melhoresRuns) &&
          valor.melhoresRuns.length <= 10 &&
          valor.melhoresRuns.every(
            (registro) =>
              objeto(registro) &&
              typeof registro.id === "string" &&
              inteiro(registro.pontuacao) &&
              inteiro(registro.rodada) &&
              inteiro(registro.habitantes) &&
              inteiro(registro.gold) &&
              TRACOS_VALIDOS.includes(registro.traco),
          )))
    );
  }

  function runValida(run) {
    if (!objeto(run) || run.versao !== Jogo.config.versao || typeof run.id !== "string" || !run.id)
      return false;
    if (
      !["ativa", "encerrada"].includes(run.status) ||
      !["escolha", "combate", "resultado"].includes(run.fase)
    )
      return false;
    if (!Jogo.herdeiros.camposValidos(run)) return false;
    if (Jogo.pressagios && !Jogo.pressagios.camposValidos(run)) return false;
    if (!inteiro(run.rodada) || run.rodada < 1 || !objeto(run.atributos)) return false;
    if (
      !TRACOS_VALIDOS.includes(run.traco) ||
      !Jogo.estacoes.includes(run.estacao) ||
      !ids(run.construcoes) ||
      !inteiro(run.cultoRendaPorRodada) ||
      run.cultoRendaPorRodada < 0 ||
      run.cultoRendaPorRodada > 2 ||
      !inteiro(run.batalhasVencidas) ||
      run.batalhasVencidas < 0 ||
      !inteiro(run.ultimaBatalhaRodada) ||
      run.ultimaBatalhaRodada < 0 ||
      run.ultimaBatalhaRodada > run.rodada ||
      !inteiro(run.debugFaceCoringa) ||
      run.debugFaceCoringa < 0 ||
      run.debugFaceCoringa > 6 ||
      !["aleatorio", "nenhum", "veloz", "cego", "feroz"].includes(run.debugTracoInimigo) ||
      !inteiro(run.dadosNaturais20Combate) ||
      run.dadosNaturais20Combate < 0 ||
      !inteiro(run.dadosNaturais1Combate) ||
      run.dadosNaturais1Combate < 0 ||
      !inteiro(run.vitoriasComDesvantagem) ||
      run.vitoriasComDesvantagem < 0 ||
      !inteiro(run.vitoriasComRerrolagem) ||
      run.vitoriasComRerrolagem < 0 ||
      !inteiro(run.dadosCombatePermanentes) ||
      run.dadosCombatePermanentes < 0 ||
      run.dadosCombatePermanentes > 19
    )
      return false;
    if (
      run.traco === "druida_herdeiro" &&
      (!Object.hasOwn(Jogo.druida.passivas, run.druidaPassiva) ||
        !inteiro(run.cajadoBonusAtaque) ||
        run.cajadoBonusAtaque < 2 ||
        run.cajadoBonusAtaque > 5 ||
        !inteiro(run.druidaAnosAlta) ||
        run.druidaAnosAlta < 0 ||
        run.druidaAnosAlta > 3 ||
        !inteiro(run.druidaAnoAvaliado) ||
        run.druidaAnoAvaliado < 0 ||
        run.druidaAnoAvaliado > run.rodada ||
        (run.druidaAnoAvaliado !== 0 && run.druidaAnoAvaliado % 100 !== 0) ||
        !(run.previsaoCorvo === null || typeof run.previsaoCorvo === "string") ||
        !(run.corvoRevelaOpcaoId === null || typeof run.corvoRevelaOpcaoId === "string"))
    )
      return false;
    if (
      !inteiro(run.hpMax) ||
      run.hpMax < 1 ||
      run.atributos.hp > run.hpMax ||
      !inteiro(run.honraNeutraSequencia) ||
      run.honraNeutraSequencia < 0 ||
      run.honraNeutraSequencia > 200 ||
      typeof run.honraSempreNeutra !== "boolean" ||
      !ids(run.avisosConquistas) ||
      !inteiro(run.lancaHeroiBatalhas) ||
      run.lancaHeroiBatalhas < 0 ||
      run.lancaHeroiBatalhas > 10
    )
      return false;
    if (
      typeof run.cultoAtivo !== "boolean" ||
      !inteiro(run.seguidoresCulto) ||
      run.seguidoresCulto < 0 ||
      typeof run.aguardaDecisaoCulto !== "boolean"
    )
      return false;
    if (
      run.cultoAtivo &&
      (!Number.isSafeInteger(run.marcos?.cultoAdesao) ||
        (run.seguidoresCulto <= 0 && run.status !== "encerrada"))
    )
      return false;
    if (
      run.aguardaDecisaoCulto &&
      (run.status !== "ativa" ||
        run.fase !== "resultado" ||
        run.atributos.habitantes !== 0 ||
        run.atributos.honra > -30 ||
        run.atributos.hp <= 0)
    )
      return false;
    if (
      !Jogo.atributos.every((id) => inteiro(run.atributos[id]) && (id === "honra" || run.atributos[id] >= 0))
    )
      return false;
    if (
      !objeto(run.condicao) ||
      ![null, "licantropia", "vampirismo", "possessao"].includes(run.condicao.ativa) ||
      !(
        run.condicao.rodada === null ||
        (inteiro(run.condicao.rodada) && run.condicao.rodada >= 1 && run.condicao.rodada <= run.rodada)
      ) ||
      typeof run.condicao.abracada !== "boolean" ||
      typeof run.condicao.curada !== "boolean" ||
      !objeto(run.condicao.bonusAbraco) ||
      !["ataque", "escudo"].every(
        (id) => inteiro(run.condicao.bonusAbraco[id]) && run.condicao.bonusAbraco[id] >= 0,
      ) ||
      (run.condicao.ativa && run.condicao.curada) ||
      (run.condicao.abracada && !run.condicao.ativa)
    )
      return false;
    if (
      !Array.isArray(run.efeitosTemporarios) ||
      run.efeitosTemporarios.some(
        (efeito) =>
          !objeto(efeito) ||
          !Jogo.atributos.includes(efeito.atributo) ||
          !inteiro(efeito.valor) ||
          !inteiro(efeito.inicioRodada) ||
          !inteiro(efeito.fimRodada) ||
          efeito.inicioRodada < 1 ||
          efeito.fimRodada < efeito.inicioRodada ||
          typeof efeito.aplicado !== "boolean",
      )
    )
      return false;
    if (
      !objeto(run.marcos) ||
      !Object.entries(run.marcos).every(
        ([id, rodada]) =>
          id.length > 0 &&
          (id === "entidadeXRecusaFatalId"
            ? rodada === null || Boolean(Jogo.eventoPorId(rodada)?.entidadeX)
            : inteiro(rodada) && rodada >= 1 && rodada <= run.rodada),
      )
    )
      return false;
    if (
      !ids(run.inventario) ||
      !ids(run.itensConquistados) ||
      !flags(run.flags) ||
      !legadoValido(run.legadoDaRun) ||
      !legadoValido(run.conquistas)
    )
      return false;
    if (!ids(run.eventosComunsRun) || run.eventosComunsRun.length > 300) return false;
    if (
      !ids(run.mercadoriasCompradas) ||
      run.mercadoriasCompradas.length > 200 ||
      new Set(run.mercadoriasCompradas).size !== run.mercadoriasCompradas.length
    )
      return false;
    if (
      !inteiro(run.vampirismoHabitantesConsumidos) ||
      run.vampirismoHabitantesConsumidos < 0 ||
      !inteiro(run.vampirismoBonusAtaque) ||
      run.vampirismoBonusAtaque < 0 ||
      run.vampirismoBonusAtaque > Math.floor(run.vampirismoHabitantesConsumidos / 5)
    )
      return false;
    if (run.ofertaMercador !== null && typeof run.ofertaMercador !== "string") return false;
    if (
      !objeto(run.efeitosPreparados) ||
      typeof run.efeitosPreparados.bloquearDanoProximaBatalha !== "boolean" ||
      !inteiro(run.efeitosPreparados.bonusAtaqueProximaBatalha) ||
      run.efeitosPreparados.bonusAtaqueProximaBatalha < 0 ||
      !inteiro(run.efeitosPreparados.bonusDadosCombateProximaBatalha) ||
      run.efeitosPreparados.bonusDadosCombateProximaBatalha < 0 ||
      run.efeitosPreparados.bonusDadosCombateProximaBatalha > 19 ||
      !inteiro(run.efeitosPreparados.rerrolagensGratisProximaBatalha) ||
      run.efeitosPreparados.rerrolagensGratisProximaBatalha < 0 ||
      run.efeitosPreparados.rerrolagensGratisProximaBatalha > 10 ||
      typeof run.efeitosPreparados.desvantagemInimigaProximaBatalha !== "boolean" ||
      !inteiro(run.efeitosPreparados.bonusEscudoProximaBatalha) ||
      run.efeitosPreparados.bonusEscudoProximaBatalha < 0 ||
      !inteiro(run.efeitosPreparados.bonusGoldProximaRecompensa) ||
      run.efeitosPreparados.bonusGoldProximaRecompensa < 0 ||
      !inteiro(run.efeitosPreparados.bacamarteBatalhas) ||
      run.efeitosPreparados.bacamarteBatalhas < 0 ||
      run.efeitosPreparados.bacamarteBatalhas > 3 ||
      !inteiro(run.efeitosPreparados.escudoFeCooldown) ||
      run.efeitosPreparados.escudoFeCooldown < 0 ||
      run.efeitosPreparados.escudoFeCooldown > 10
    )
      return false;
    if (run.fase === "combate") {
      const pendente = run.combatePendente;
      const opcaoCombate = Jogo.engine.opcaoCombatePendente(run);
      const perfil = Jogo.engine.perfilCombate(run);
      const eventoChefe = Jogo.eventoPorId(run.eventoId);
      const ehBoss = Boolean(eventoChefe?.bossId);
      const valoresValidos = (dados, quantidade) =>
        Array.isArray(dados) &&
        dados.length === quantidade &&
        dados.every((dado) => inteiro(dado) && dado >= 1 && dado <= 20);
      if (
        run.status !== "ativa" ||
        run.ultimoResultado !== null ||
        !objeto(pendente) ||
        pendente.eventoId !== run.eventoId ||
        !opcaoCombate?.combate ||
        !perfil ||
        !["preparacao", "resultado", "desfecho"].includes(pendente.etapa) ||
        !Array.isArray(pendente.dadosHerdeiro) ||
        !Array.isArray(pendente.dadosInimigo) ||
        !inteiro(pendente.rerrolagens) ||
        pendente.rerrolagens < 0 ||
        pendente.rerrolagens > 100 ||
        !inteiro(pendente.rerrolagensGratis) ||
        pendente.rerrolagensGratis < 0 ||
        pendente.rerrolagensGratis > 10 ||
        !inteiro(pendente.coringa) ||
        pendente.coringa < 0 ||
        pendente.coringa > 6 ||
        !inteiro(pendente.rerrolagemCoringa) ||
        pendente.rerrolagemCoringa < 0 ||
        pendente.rerrolagemCoringa > 1 ||
        !["", "veloz", "cego", "feroz"].includes(pendente.tracoInimigo) ||
        typeof pendente.dadoLascadoUsado !== "boolean" ||
        (pendente.etapa === "preparacao" &&
          (pendente.dadosHerdeiro.length !== 0 ||
            pendente.dadosInimigo.length !== 0 ||
            pendente.rerrolagens !== 0)) ||
        ((pendente.etapa === "resultado" || pendente.etapa === "desfecho") &&
          (!valoresValidos(pendente.dadosHerdeiro, perfil.dadosHerdeiro) ||
            !valoresValidos(pendente.dadosInimigo, perfil.dadosInimigo))) ||
        (!ehBoss && pendente.ehBoss === true) ||
        (ehBoss &&
          (pendente.ehBoss !== true ||
            !inteiro(pendente.vidaChefe) ||
            pendente.vidaChefe < 0 ||
            pendente.vidaChefe > (eventoChefe.batalha.vidaMaxima || 100) ||
            pendente.vidaChefeMaxima !== (eventoChefe.batalha.vidaMaxima || 100) ||
            !inteiro(pendente.turnosChefe) ||
            pendente.turnosChefe < 0 ||
            pendente.turnosChefe > 100000 ||
            typeof pendente.ultimaTrocaChefe !== "string" ||
            pendente.ultimaTrocaChefe.length > 200 ||
            !inteiro(pendente.vidaChefeAntes) ||
            pendente.vidaChefeAntes < pendente.vidaChefe ||
            pendente.vidaChefeAntes > (eventoChefe.batalha.vidaMaxima || 100) ||
            typeof pendente.bloqueioChefeUsado !== "boolean" ||
            typeof pendente.bacamarteChefeUsado !== "boolean")) ||
        (pendente.etapa === "desfecho" && (!ehBoss || pendente.vidaChefe !== 0))
      )
        return false;
    } else if (run.combatePendente !== null) return false;
    if (!ids(run.eventosRecentes) || run.eventosRecentes.length > Jogo.config.memoriaEventos) return false;
    if (
      run.historicoCronica !== undefined &&
      (!Array.isArray(run.historicoCronica) ||
        run.historicoCronica.length > Jogo.config.memoriaCronica ||
        run.historicoCronica.some(
          (registro) =>
            !objeto(registro) ||
            !inteiro(registro.rodada) ||
            registro.rodada < 1 ||
            typeof registro.eventoId !== "string" ||
            typeof registro.evento !== "string" ||
            typeof registro.escolha !== "string" ||
            typeof registro.desfecho !== "string",
        ))
    )
      return false;
    if (
      !ids(run.conselhosRecentes) ||
      run.conselhosRecentes.length > 5 ||
      new Set(run.conselhosRecentes).size !== run.conselhosRecentes.length
    )
      return false;
    if (
      !objeto(run.comprasMercador) ||
      !Object.entries(run.comprasMercador).every(
        ([id, quantidade]) => id.length > 0 && inteiro(quantidade) && quantidade >= 0,
      )
    )
      return false;
    if (!inteiro(run.honraReveladaAteRodada) || run.honraReveladaAteRodada < 0) return false;
    if (
      !inteiro(run.habitantesReveladosAteRodada) ||
      run.habitantesReveladosAteRodada < 0 ||
      !ids(run.opcoesSorteadas) ||
      run.opcoesSorteadas.length > 300 ||
      (run.janelaZodiaco !== null &&
        (!objeto(run.janelaZodiaco) ||
          !inteiro(run.janelaZodiaco.marco) ||
          typeof run.janelaZodiaco.eventoId !== "string")) ||
      (run.efeitoDivino !== null &&
        (!objeto(run.efeitoDivino) ||
          typeof run.efeitoDivino.nome !== "string" ||
          !inteiro(run.efeitoDivino.restantes) ||
          run.efeitoDivino.restantes < 1 ||
          run.efeitoDivino.restantes > 20 ||
          (run.efeitoDivino.bonusDadosCombate !== undefined &&
            (!inteiro(run.efeitoDivino.bonusDadosCombate) ||
              run.efeitoDivino.bonusDadosCombate < 0 ||
              run.efeitoDivino.bonusDadosCombate > 19))))
    )
      return false;
    if (run.fase === "resultado") {
      const resultado = run.ultimoResultado;
      if (!objeto(resultado) || typeof resultado.texto !== "string" || typeof resultado.escolha !== "string")
        return false;
      if (!objeto(resultado.alteracoes) || !Jogo.atributos.every((id) => inteiro(resultado.alteracoes[id])))
        return false;
      if (Object.hasOwn(resultado.alteracoes, "hpMax") && !inteiro(resultado.alteracoes.hpMax)) return false;
      if (
        resultado.economia !== undefined &&
        (!objeto(resultado.economia) ||
          !inteiro(resultado.economia.renda) ||
          !inteiro(resultado.economia.variacaoRenda) ||
          !inteiro(resultado.economia.gasto) ||
          resultado.economia.gasto < 0)
      )
        return false;
      if (
        resultado.combate !== null &&
        (!objeto(resultado.combate) ||
          typeof resultado.combate.venceu !== "boolean" ||
          !inteiro(resultado.combate.dano) ||
          resultado.combate.dano < 0)
      )
        return false;
      if (
        resultado.dueloDados !== undefined &&
        (!objeto(resultado.dueloDados) ||
          !inteiro(resultado.dueloDados.dadoHerdeiro) ||
          resultado.dueloDados.dadoHerdeiro < 1 ||
          resultado.dueloDados.dadoHerdeiro > 20 ||
          !inteiro(resultado.dueloDados.dadoOponente) ||
          resultado.dueloDados.dadoOponente < 1 ||
          resultado.dueloDados.dadoOponente > 20 ||
          !inteiro(resultado.dueloDados.bonusOponente) ||
          resultado.dueloDados.bonusOponente < 0 ||
          resultado.dueloDados.bonusOponente > 1 ||
          resultado.dueloDados.totalHerdeiro !== resultado.dueloDados.dadoHerdeiro ||
          resultado.dueloDados.totalOponente !==
            resultado.dueloDados.dadoOponente + resultado.dueloDados.bonusOponente ||
          !["herdeiro", "oponente"].includes(resultado.dueloDados.vencedor))
      )
        return false;
      if (
        resultado.testeDados !== undefined &&
        (!objeto(resultado.testeDados) ||
          !inteiro(resultado.testeDados.face) ||
          resultado.testeDados.face < 1 ||
          resultado.testeDados.face > 20 ||
          !inteiro(resultado.testeDados.bonus) ||
          !inteiro(resultado.testeDados.total) ||
          resultado.testeDados.total !== resultado.testeDados.face + resultado.testeDados.bonus ||
          !inteiro(resultado.testeDados.dificuldade) ||
          !inteiro(resultado.testeDados.limiteCusto) ||
          !["sucesso", "sucessoComCusto", "falha"].includes(resultado.testeDados.desfecho))
      )
        return false;
    } else if (run.ultimoResultado !== null) return false;
    if (run.status === "encerrada") {
      return (
        objeto(run.fim) &&
        ["derrota", "vitoria", "vitoria_culto", "vitoria_honra", "vitoria_barao", "vitoria_abissal"].includes(run.fim.tipo) &&
        typeof run.fim.motivo === "string"
      );
    }
    if (Jogo.engine.motivoDerrota(run) || run.fim !== null) return false;
    const evento = Jogo.eventoPorId(run.eventoId);
    const disponivel =
      run.fase === "combate" ||
      Jogo.engine.pools(run).eventos.includes(evento) ||
      (evento?.disparadoPelaEngine &&
        (run.fase === "resultado" ||
          run.fase === "combate" ||
          Jogo.engine.eventoCondicaoDevido(run)?.id === evento.id));
    // A honra determina o sorteio; os controles de teste podem mudá-la depois
    // sem descartar a carta já aberta. Os demais requisitos continuam validados.
    const requisitosSalvos = { ...evento?.requisitos };
    delete requisitosSalvos.honra;
    delete requisitosSalvos.honraMin;
    delete requisitosSalvos.honraMax;
    return Boolean(
      evento &&
      disponivel &&
      (run.fase === "resultado" ||
        run.fase === "combate" ||
        (Jogo.engine.cumpre(requisitosSalvos, run) && Jogo.engine.opcoes(evento, run).length > 0)),
    );
  }

  function migrarRunV1(dados) {
    // Saves anteriores à economia ganham o saldo inicial, sem repetir efeitos.
    if (!objeto(dados.atributos)) return null;
    if (!Object.hasOwn(dados.atributos, "gold")) dados.atributos.gold = Jogo.config.iniciais.gold;
    if (
      objeto(dados.ultimoResultado) &&
      objeto(dados.ultimoResultado.alteracoes) &&
      !Object.hasOwn(dados.ultimoResultado.alteracoes, "gold")
    )
      dados.ultimoResultado.alteracoes.gold = 0;
    return 2;
  }

  function normalizarRunV2(dados) {
    if (!Object.hasOwn(dados, "comprasMercador")) dados.comprasMercador = {};
    if (!Number.isSafeInteger(dados.batalhasVencidas) || dados.batalhasVencidas < 0)
      dados.batalhasVencidas = 0;
    if (!Number.isSafeInteger(dados.ultimaBatalhaRodada) || dados.ultimaBatalhaRodada < 0)
      dados.ultimaBatalhaRodada = 0;
    if (
      !Number.isSafeInteger(dados.debugFaceCoringa) ||
      dados.debugFaceCoringa < 0 ||
      dados.debugFaceCoringa > 6
    )
      dados.debugFaceCoringa = 0;
    if (!["aleatorio", "nenhum", "veloz", "cego", "feroz"].includes(dados.debugTracoInimigo))
      dados.debugTracoInimigo = "aleatorio";
    for (const campo of [
      "dadosNaturais20Combate",
      "dadosNaturais1Combate",
      "vitoriasComDesvantagem",
      "vitoriasComRerrolagem",
      "dadosCombatePermanentes",
    ]) {
      if (!Number.isSafeInteger(dados[campo]) || dados[campo] < 0) dados[campo] = 0;
    }
    if (!Object.hasOwn(dados, "combatePendente")) dados.combatePendente = null;
    if (objeto(dados.combatePendente)) {
      if (!Number.isSafeInteger(dados.combatePendente.coringa)) dados.combatePendente.coringa = 0;
      if (!Number.isSafeInteger(dados.combatePendente.rerrolagemCoringa))
        dados.combatePendente.rerrolagemCoringa = 0;
      if (!Number.isSafeInteger(dados.combatePendente.rerrolagensGratis))
        dados.combatePendente.rerrolagensGratis = 0;
      if (typeof dados.combatePendente.tracoInimigo !== "string") dados.combatePendente.tracoInimigo = "";
      if (typeof dados.combatePendente.dadoLascadoUsado !== "boolean")
        dados.combatePendente.dadoLascadoUsado = false;
      const eventoChefe = Jogo.eventoPorId(dados.combatePendente.eventoId);
      if (eventoChefe?.bossId) {
        const vidaMaxima = eventoChefe.batalha.vidaMaxima || 100;
        dados.combatePendente.ehBoss = true;
        if (
          !Number.isSafeInteger(dados.combatePendente.vidaChefe) ||
          dados.combatePendente.vidaChefe < 0 ||
          dados.combatePendente.vidaChefe > vidaMaxima
        )
          dados.combatePendente.vidaChefe =
            dados.combatePendente.etapa === "desfecho" ? 0 : vidaMaxima;
        dados.combatePendente.vidaChefeMaxima = vidaMaxima;
        if (!Number.isSafeInteger(dados.combatePendente.turnosChefe) || dados.combatePendente.turnosChefe < 0)
          dados.combatePendente.turnosChefe = 0;
        if (typeof dados.combatePendente.ultimaTrocaChefe !== "string")
          dados.combatePendente.ultimaTrocaChefe = "";
        if (
          !Number.isSafeInteger(dados.combatePendente.vidaChefeAntes) ||
          dados.combatePendente.vidaChefeAntes < (dados.combatePendente.vidaChefe || 0) ||
          dados.combatePendente.vidaChefeAntes > vidaMaxima
        )
          dados.combatePendente.vidaChefeAntes =
            dados.combatePendente.etapa === "desfecho" ? vidaMaxima : dados.combatePendente.vidaChefe;
        if (typeof dados.combatePendente.bloqueioChefeUsado !== "boolean")
          dados.combatePendente.bloqueioChefeUsado = false;
        if (typeof dados.combatePendente.bacamarteChefeUsado !== "boolean")
          dados.combatePendente.bacamarteChefeUsado = false;
      }
    }
    if (!Array.isArray(dados.mercadoriasCompradas)) dados.mercadoriasCompradas = [];
    dados.mercadoriasCompradas = [
      ...new Set(dados.mercadoriasCompradas.filter((id) => typeof id === "string")),
    ];
    if (!Array.isArray(dados.historicoCronica)) dados.historicoCronica = [];
    dados.historicoCronica = dados.historicoCronica.slice(-Jogo.config.memoriaCronica);
    if (typeof dados.historicoCronicaAberto !== "boolean") dados.historicoCronicaAberto = false;
    if (!Number.isSafeInteger(dados.vampirismoHabitantesConsumidos)) dados.vampirismoHabitantesConsumidos = 0;
    if (!Number.isSafeInteger(dados.vampirismoBonusAtaque)) dados.vampirismoBonusAtaque = 0;
    if (!Object.hasOwn(dados, "hpMax"))
      dados.hpMax = Math.max(Jogo.config.hpMaxInicial, dados.atributos?.hp || 0);
    if (dados.traco === "doente") {
      const adquiridos = new Set([...(dados.itensConquistados || []), ...(dados.inventario || [])]);
      const bonusDeItens = Jogo.itens.reduce(
        (total, item) => total + (adquiridos.has(item.id) ? item.aoReceber?.hpMax || 0 : 0),
        0,
      );
      const bonusDoCajado = dados.flags?.usou_cajado_da_dor ? 20 : 0;
      // Saves feitos antes desta correção podem ter registrado os itens, mas
      // a regra antiga impedia que eles elevassem o máximo acima de 70.
      dados.hpMax = Math.max(dados.hpMax, 70 + bonusDeItens + bonusDoCajado);
    }
    if (!Object.hasOwn(dados, "honraNeutraSequencia")) dados.honraNeutraSequencia = 0;
    if (!Object.hasOwn(dados, "honraSempreNeutra")) dados.honraSempreNeutra = false;
    if (!Array.isArray(dados.avisosConquistas)) dados.avisosConquistas = [];
    if (!Object.hasOwn(dados, "lancaHeroiBatalhas")) dados.lancaHeroiBatalhas = 0;
    if (!Object.hasOwn(dados, "eventosRecentes")) dados.eventosRecentes = [];
    if (!Object.hasOwn(dados, "eventosComunsRun")) {
      dados.eventosComunsRun = (dados.eventosRecentes || []).filter((id) => {
        const evento = Jogo.eventoPorId(id);
        return (
          evento &&
          !evento.especial &&
          !evento.entidadeX &&
          !evento.entidadeXInicio &&
          !evento.abissal &&
          !evento.divino &&
          !evento.zodiaco &&
          evento.tipo !== "culto"
        );
      });
    }
    for (const legado of [dados.legadoDaRun, dados.conquistas]) {
      if (objeto(legado) && !Object.hasOwn(legado, "eventosRecentesRuns")) legado.eventosRecentesRuns = [];
      if (objeto(legado) && !Object.hasOwn(legado, "conquistasDesbloqueadas"))
        legado.conquistasDesbloqueadas = [];
    }
    if (!Object.hasOwn(dados, "conselhosRecentes")) {
      dados.conselhosRecentes = (dados.eventosRecentes || [])
        .filter((id) => Jogo.eventoPorId(id)?.conselheiro)
        .slice(-5);
    }
    if (!Object.hasOwn(dados, "honraReveladaAteRodada")) dados.honraReveladaAteRodada = 0;
    if (!Object.hasOwn(dados, "habitantesReveladosAteRodada")) dados.habitantesReveladosAteRodada = 0;
    if (!Object.hasOwn(dados, "opcoesSorteadas")) dados.opcoesSorteadas = [];
    if (!Object.hasOwn(dados, "janelaZodiaco")) dados.janelaZodiaco = null;
    if (!Object.hasOwn(dados, "efeitoDivino")) dados.efeitoDivino = null;
    if (!Object.hasOwn(dados, "ofertaMercador")) dados.ofertaMercador = null;
    if (!Object.hasOwn(dados, "efeitosPreparados")) {
      dados.efeitosPreparados = {
        bloquearDanoProximaBatalha: false,
        bonusAtaqueProximaBatalha: 0,
        bonusDadosCombateProximaBatalha: 0,
        rerrolagensGratisProximaBatalha: 0,
        desvantagemInimigaProximaBatalha: false,
        bonusEscudoProximaBatalha: 0,
        bonusGoldProximaRecompensa: 0,
      };
    }
    if (
      objeto(dados.efeitosPreparados) &&
      !Object.hasOwn(dados.efeitosPreparados, "bonusEscudoProximaBatalha")
    )
      dados.efeitosPreparados.bonusEscudoProximaBatalha = 0;
    if (
      objeto(dados.efeitosPreparados) &&
      !Object.hasOwn(dados.efeitosPreparados, "bonusDadosCombateProximaBatalha")
    )
      dados.efeitosPreparados.bonusDadosCombateProximaBatalha = 0;
    if (
      objeto(dados.efeitosPreparados) &&
      !Object.hasOwn(dados.efeitosPreparados, "rerrolagensGratisProximaBatalha")
    )
      dados.efeitosPreparados.rerrolagensGratisProximaBatalha = 0;
    if (
      objeto(dados.efeitosPreparados) &&
      !Object.hasOwn(dados.efeitosPreparados, "desvantagemInimigaProximaBatalha")
    )
      dados.efeitosPreparados.desvantagemInimigaProximaBatalha = false;
    if (objeto(dados.efeitosPreparados) && !Object.hasOwn(dados.efeitosPreparados, "bacamarteBatalhas"))
      dados.efeitosPreparados.bacamarteBatalhas = 0;
    if (objeto(dados.efeitosPreparados) && !Object.hasOwn(dados.efeitosPreparados, "escudoFeCooldown"))
      dados.efeitosPreparados.escudoFeCooldown = 0;
    if (!Object.hasOwn(dados, "itensConquistados")) {
      dados.itensConquistados = Array.isArray(dados.inventario) ? [...new Set(dados.inventario)] : [];
    }
    if (!Object.hasOwn(dados, "marcos")) dados.marcos = {};
    if (
      !Object.hasOwn(dados.marcos, "colheitaUltimaRodada") &&
      (dados.eventoId === "colheita" || dados.eventosRecentes?.includes("colheita"))
    ) {
      dados.marcos.colheitaUltimaRodada = dados.rodada;
    }
    if (!Object.hasOwn(dados, "condicao")) {
      dados.condicao = {
        ativa: null,
        rodada: null,
        abracada: false,
        curada: false,
        bonusAbraco: { ataque: 0, escudo: 0 },
      };
    }
    if (objeto(dados.condicao) && !Object.hasOwn(dados.condicao, "bonusAbraco"))
      dados.condicao.bonusAbraco = { ataque: 0, escudo: 0 };
    if (!Object.hasOwn(dados, "efeitosTemporarios")) dados.efeitosTemporarios = [];
    if (objeto(dados.marcos) && !Object.hasOwn(dados.marcos, "entidadeXAparicoes")) {
      const flagsEntidade = dados.flags || {};
      const entidadeAtiva =
        flagsEntidade.entidade_x_ativa === true ||
        Boolean(
          Jogo.eventoPorId(dados.eventoId)?.entidadeX || Jogo.eventoPorId(dados.eventoId)?.entidadeXInicio,
        );
      if (entidadeAtiva) {
        let aparicoes = 1;
        for (const flag of [
          "entidade_x_espelho_visto",
          "entidade_x_balanca_vista",
          "entidade_x_porta_vista",
          "entidade_x_nome_visto",
        ]) {
          if (flagsEntidade[flag] === true) aparicoes += 1;
        }
        if (flagsEntidade.entidade_x_tier2) aparicoes = Math.max(aparicoes, 2);
        if (flagsEntidade.entidade_x_nome_visto) aparicoes = Math.max(aparicoes, 5);
        if (flagsEntidade.entidade_x_tier3) aparicoes = Math.max(aparicoes, 6);
        dados.marcos.entidadeXAparicoes = aparicoes;
      }
    }
    if (!TRACOS_VALIDOS.includes(dados.traco)) dados.traco = "corajoso";
    if (!Object.hasOwn(dados, "estacao")) dados.estacao = Jogo.estacaoDaRodada(dados.rodada || 1, dados);
    if (!Object.hasOwn(dados, "previsaoCorvo")) dados.previsaoCorvo = null;
    if (!Object.hasOwn(dados, "corvoRevelaOpcaoId")) dados.corvoRevelaOpcaoId = null;
    if (dados.traco === "druida_herdeiro") {
      if (
        !Object.hasOwn(dados, "druidaPassiva") ||
        !Object.hasOwn(Jogo.druida.passivas, dados.druidaPassiva)
      ) {
        const tipoAntigo = dados.animal?.tipo;
        dados.druidaPassiva = Object.hasOwn(Jogo.druida.passivas, tipoAntigo)
          ? tipoAntigo
          : Object.keys(Jogo.druida.passivas)[
              Math.floor(Math.random() * Object.keys(Jogo.druida.passivas).length)
            ];
      }
      if (Object.hasOwn(dados, "sintonia")) dados.druidaAnosAlta = 0;
      delete dados.sintonia;
      delete dados.animal;
      delete dados.avisoEstacao;
      if (objeto(dados.ultimoResultado?.alteracoes)) delete dados.ultimoResultado.alteracoes.sintonia;
      if (!Object.hasOwn(dados, "cajadoBonusAtaque")) dados.cajadoBonusAtaque = 2;
      if (!Object.hasOwn(dados, "druidaAnosAlta")) dados.druidaAnosAlta = 0;
      if (!Object.hasOwn(dados, "druidaAnoAvaliado")) dados.druidaAnoAvaliado = 0;
    }
    if (!Object.hasOwn(dados, "construcoes")) dados.construcoes = [];
    if (Array.isArray(dados.construcoes)) {
      for (const [flag, id] of [
        ["ponte_reparada", "ponte"],
        ["moinho_reparado", "moinho"],
      ]) {
        if (dados.flags?.[flag] && !dados.construcoes.includes(id)) dados.construcoes.push(id);
      }
    }
    if (!Object.hasOwn(dados, "cultoRendaPorRodada")) dados.cultoRendaPorRodada = 0;
    if (!Object.hasOwn(dados, "cultoAtivo")) dados.cultoAtivo = false;
    if (!Object.hasOwn(dados, "seguidoresCulto")) dados.seguidoresCulto = 0;
    if (!Object.hasOwn(dados, "aguardaDecisaoCulto")) dados.aguardaDecisaoCulto = false;
    if (!Object.hasOwn(dados, "logItens")) dados.logItens = [];
    if (!Object.hasOwn(dados, "consequenciasAgendadas")) dados.consequenciasAgendadas = [];
    if (!Object.hasOwn(dados, "itensConsumidosEm")) {
      dados.itensConsumidosEm = {};
      for (const id of dados.itensConquistados || []) {
        const item = Jogo.itens.find((candidato) => candidato.id === id);
        if (item?.tipo === "uso" && !(dados.inventario || []).includes(id)) {
          dados.itensConsumidosEm[id] = Math.max(0, (dados.rodada || 1) - 1);
        }
      }
    }
    if (!Object.hasOwn(dados, "nemesis")) {
      const memorias = Jogo.legado.normalizar(dados.legadoDaRun).memorias;
      const memoriaAnterior = memorias.at(-1);
      dados.nemesis =
        memoriaAnterior?.tipo === "derrota"
          ? {
              motivo: memoriaAnterior.motivo,
              traco: memoriaAnterior.traco || null,
              meninoAdotado: memoriaAnterior.meninoAdotado === true,
              nivel: Math.min(
                4,
                Math.max(1, memorias.filter((memoria) => memoria.tipo === "derrota").length),
              ),
              enfrentado: false,
            }
          : null;
    }
  }

  const migracoesRun = {
    1: migrarRunV1,
    2: (dados) => {
      normalizarRunV2(dados);
      return null;
    },
  };

  function migrarRun(dados) {
    if (!objeto(dados)) return;
    if (!Object.hasOwn(dados, "pressagios") && Jogo.pressagios) dados.pressagios = Jogo.pressagios.vazio();
    if (!Object.hasOwn(dados, "calendarioLeste")) dados.calendarioLeste = [];
    if (!Object.hasOwn(dados, "encontroLeste")) dados.encontroLeste = null;
    if (!Object.hasOwn(dados, "passivaNordica")) dados.passivaNordica = null;
    if (objeto(dados.passivaNordica)) {
      const definicao = Jogo.efeitosNordicos?.find((efeito) => efeito.eventoId === dados.passivaNordica.eventoId);
      if (
        definicao &&
        Object.hasOwn(definicao, "bonusDadosCombate") &&
        !Object.hasOwn(dados.passivaNordica, "bonusDadosCombate")
      )
        dados.passivaNordica.bonusDadosCombate = definicao.bonusDadosCombate;
    }
    while (Number.isSafeInteger(dados.versao)) {
      const migracao = migracoesRun[dados.versao];
      if (!migracao) return;
      const versaoAtual = dados.versao;
      const proximaVersao = migracao(dados);
      if (proximaVersao === null || proximaVersao === undefined) return;
      if (!Number.isSafeInteger(proximaVersao) || proximaVersao <= versaoAtual) {
        throw new Error("Invalid run migration: " + versaoAtual + " -> " + proximaVersao);
      }
      dados.versao = proximaVersao;
    }
  }

  function lerRun() {
    const dados = ler(CHAVE_RUN);
    if (dados === null || dados === LEITURA_INDISPONIVEL) return null;
    try {
      migrarRun(dados);
      if (!runValida(dados)) throw new Error("Run inválida");
      return dados;
    } catch {
      avisar(
        "A run salva está corrompida ou é incompatível. Inicie outro herdeiro; o legado permanece separado.",
      );
      return null;
    }
  }

  function finalizar(run) {
    // Consolida o restante do progresso da run; conquistas já registradas no
    // desbloqueio permanecem seguras por serem mescladas de forma idempotente.
    Jogo.legado.registrarRun(run);
    legadoDaSessao = Jogo.legado.mesclar(
      legadoDaSessao,
      Jogo.legado.mesclar(run.legadoDaRun, run.conquistas),
    );
    // Primeiro deixa um registro recuperável. A união é idempotente: recarregar
    // após uma falha entre as gravações não duplica desbloqueios.
    gravar(CHAVE_RUN, run);
    const anterior = ler(CHAVE_LEGADO);
    // Se o armazenamento está inacessível, não substitui um legado que não pôde ler.
    if (anterior === LEITURA_INDISPONIVEL) return false;
    const legado = Jogo.legado.mesclar(anterior, legadoDaSessao);
    if (!gravar(CHAVE_LEGADO, legado)) return false;
    return apagarRun();
  }

  function registrarConquistas(run, desbloqueadas = run?.conquistas?.conquistasDesbloqueadas) {
    if (!Array.isArray(desbloqueadas) || !desbloqueadas.length) return true;
    const permissoes = Object.fromEntries(
      Jogo.herdeiros.desbloqueaveis.filter((id) => run?.conquistas?.flags?.[id]).map((id) => [id, true]),
    );
    const progresso = { versao: 1, conquistasDesbloqueadas: desbloqueadas, flags: permissoes };
    legadoDaSessao = Jogo.legado.mesclar(legadoDaSessao, progresso);
    const anterior = ler(CHAVE_LEGADO);
    if (anterior === LEITURA_INDISPONIVEL) return false;
    return gravar(CHAVE_LEGADO, Jogo.legado.mesclar(anterior, progresso));
  }

  function registrarRotacaoRun(run) {
    const eventos = Array.isArray(run?.eventosComunsRun) ? run.eventosComunsRun : [];
    if (!run?.id || !eventos.length) return true;
    const rotacao = { versao: 1, eventosRecentesRuns: [{ id: run.id, eventos }] };
    legadoDaSessao = Jogo.legado.mesclar(legadoDaSessao, rotacao);
    const anterior = ler(CHAVE_LEGADO);
    if (anterior === LEITURA_INDISPONIVEL) return false;
    return gravar(CHAVE_LEGADO, Jogo.legado.mesclar(anterior, rotacao));
  }

  function exportar() {
    return {
      produto: "a-maldicao-do-herdeiro",
      versao: 1,
      exportadoEm: new Date().toISOString(),
      legado: lerLegado(),
      run: lerRun(),
    };
  }

  function importar(arquivo) {
    if (
      !objeto(arquivo) ||
      arquivo.produto !== "a-maldicao-do-herdeiro" ||
      arquivo.versao !== 1 ||
      !legadoValido(arquivo.legado) ||
      !(arquivo.run === null || objeto(arquivo.run))
    )
      return false;

    const legadoImportado = Jogo.legado.normalizar(arquivo.legado);
    const runImportada = arquivo.run;
    if (runImportada) {
      migrarRun(runImportada);
      if (!runValida(runImportada)) return false;
    }

    let legadoAnterior;
    let runAnterior;
    try {
      legadoAnterior = window.localStorage.getItem(CHAVE_LEGADO);
      runAnterior = window.localStorage.getItem(CHAVE_RUN);
      window.localStorage.setItem(CHAVE_LEGADO, JSON.stringify(legadoImportado));
      if (runImportada) window.localStorage.setItem(CHAVE_RUN, JSON.stringify(runImportada));
      else window.localStorage.removeItem(CHAVE_RUN);
      legadoDaSessao = Jogo.legado.vazio();
      return true;
    } catch {
      try {
        if (legadoAnterior === null) window.localStorage.removeItem(CHAVE_LEGADO);
        else if (legadoAnterior !== undefined) window.localStorage.setItem(CHAVE_LEGADO, legadoAnterior);
        if (runAnterior === null) window.localStorage.removeItem(CHAVE_RUN);
        else if (runAnterior !== undefined) window.localStorage.setItem(CHAVE_RUN, runAnterior);
      } catch {
        // Mantém o aviso principal caso o navegador também bloqueie a restauração.
      }
      return false;
    }
  }

  function liberarPersonagens() {
    const anterior = ler(CHAVE_LEGADO);
    if (anterior === LEITURA_INDISPONIVEL) return false;
    const progresso = {
      versao: 1,
      flags: Object.fromEntries(Jogo.herdeiros.desbloqueaveis.map((id) => [id, true])),
    };
    const legado = Jogo.legado.mesclar(Jogo.legado.mesclar(anterior, legadoDaSessao), progresso);
    if (!gravar(CHAVE_LEGADO, legado)) return false;
    legadoDaSessao = legado;
    return true;
  }

  Jogo.save = {
    liberarPersonagens,
    lerLegado,
    lerRun,
    runValida,
    apagarRun,
    finalizar,
    registrarConquistas,
    registrarRotacaoRun,
    exportar,
    importar,
    gravarRun: (run) => gravar(CHAVE_RUN, run),
  };
})();
