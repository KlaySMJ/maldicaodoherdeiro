(function () {
  "use strict";
  const Jogo = window.Jogo;
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
    } catch (_) {
      avisar(`Não foi possível acessar ${chave === CHAVE_LEGADO ? "o legado" : "a run salva"}. O jogo usará dados seguros.`);
      return LEITURA_INDISPONIVEL;
    }
    try {
      return texto === null ? null : JSON.parse(texto);
    } catch (_) {
      avisar(`Não foi possível ler ${chave === CHAVE_LEGADO ? "o legado" : "a run salva"}. O jogo usará dados seguros.`);
      return null;
    }
  }

  function gravar(chave, dados) {
    try {
      window.localStorage.setItem(chave, JSON.stringify(dados));
      return true;
    } catch (_) {
      avisar("O navegador não permitiu salvar. Você pode continuar, mas este progresso pode se perder ao fechar a página.");
      return false;
    }
  }

  function apagarRun() {
    try {
      // Esta operação nunca toca na chave do legado.
      window.localStorage.removeItem(CHAVE_RUN);
      return true;
    } catch (_) {
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

  const objeto = valor => valor !== null && typeof valor === "object" && !Array.isArray(valor);
  const inteiro = valor => Number.isSafeInteger(valor);
  const ids = valor => Array.isArray(valor) && valor.every(id => typeof id === "string");
  const flags = valor => objeto(valor) && Object.values(valor).every(ativa => typeof ativa === "boolean");
  function legadoValido(valor) {
    return objeto(valor) && valor.versao === 1 && ids(valor.eventos) && ids(valor.itens)
      && flags(valor.flags) && ids(valor.objetivosConcluidos)
      && (valor.memorias === undefined || (Array.isArray(valor.memorias) && valor.memorias.every(registro => objeto(registro)
        && typeof registro.id === "string" && inteiro(registro.rodada) && inteiro(registro.honra)
        && typeof registro.tipo === "string" && typeof registro.motivo === "string")))
      && (valor.eventosRecentesRuns === undefined || (Array.isArray(valor.eventosRecentesRuns)
        && valor.eventosRecentesRuns.length <= 2 && valor.eventosRecentesRuns.every(registro => objeto(registro)
          && typeof registro.id === "string" && ids(registro.eventos) && registro.eventos.length <= 300)));
  }

  function runValida(run) {
    if (!objeto(run) || run.versao !== Jogo.config.versao || typeof run.id !== "string" || !run.id) return false;
    if (!["ativa", "encerrada"].includes(run.status) || !["escolha", "resultado"].includes(run.fase)) return false;
    if (!inteiro(run.rodada) || run.rodada < 1 || !objeto(run.atributos)) return false;
    if (!(["corajoso", "avarento", "doente", "druida_herdeiro"].includes(run.traco))
      || !Jogo.estacoes.includes(run.estacao) || !ids(run.construcoes)
      || !inteiro(run.cultoRendaPorRodada) || run.cultoRendaPorRodada < 0 || run.cultoRendaPorRodada > 2) return false;
    if (run.traco === "druida_herdeiro" && (!Object.hasOwn(Jogo.druida.passivas, run.druidaPassiva)
      || !inteiro(run.cajadoBonusAtaque) || run.cajadoBonusAtaque < 2 || run.cajadoBonusAtaque > 5
      || !inteiro(run.druidaAnosAlta) || run.druidaAnosAlta < 0 || run.druidaAnosAlta > 3
      || !inteiro(run.druidaAnoAvaliado) || run.druidaAnoAvaliado < 0 || run.druidaAnoAvaliado > run.rodada
      || (run.druidaAnoAvaliado !== 0 && run.druidaAnoAvaliado % 100 !== 0)
      || !(run.previsaoCorvo === null || typeof run.previsaoCorvo === "string")
      || !(run.corvoRevelaOpcaoId === null || typeof run.corvoRevelaOpcaoId === "string"))) return false;
    if (!inteiro(run.hpMax) || run.hpMax < 1 || run.atributos.hp > run.hpMax
      || !inteiro(run.honraNeutraSequencia) || run.honraNeutraSequencia < 0 || run.honraNeutraSequencia > 200
      || !inteiro(run.lancaHeroiBatalhas) || run.lancaHeroiBatalhas < 0 || run.lancaHeroiBatalhas > 10) return false;
    if (typeof run.cultoAtivo !== "boolean" || !inteiro(run.seguidoresCulto) || run.seguidoresCulto < 0
      || typeof run.aguardaDecisaoCulto !== "boolean") return false;
    if (run.cultoAtivo && (!Number.isSafeInteger(run.marcos?.cultoAdesao)
      || (run.seguidoresCulto <= 0 && run.status !== "encerrada"))) return false;
    if (run.aguardaDecisaoCulto && (run.status !== "ativa" || run.fase !== "resultado"
      || run.atributos.habitantes !== 0 || run.atributos.honra > -30 || run.atributos.hp <= 0)) return false;
    if (!Jogo.atributos.every(id => inteiro(run.atributos[id]) && (id === "honra" || run.atributos[id] >= 0))) return false;
    if (!objeto(run.condicao) || ![null, "licantropia", "vampirismo", "possessao"].includes(run.condicao.ativa)
      || !(run.condicao.rodada === null || (inteiro(run.condicao.rodada) && run.condicao.rodada >= 1 && run.condicao.rodada <= run.rodada))
      || typeof run.condicao.abracada !== "boolean" || typeof run.condicao.curada !== "boolean"
      || !objeto(run.condicao.bonusAbraco)
      || !["ataque", "escudo"].every(id => inteiro(run.condicao.bonusAbraco[id]) && run.condicao.bonusAbraco[id] >= 0)
      || (run.condicao.ativa && run.condicao.curada) || (run.condicao.abracada && !run.condicao.ativa)) return false;
    if (!Array.isArray(run.efeitosTemporarios) || run.efeitosTemporarios.some(efeito => !objeto(efeito)
      || !Jogo.atributos.includes(efeito.atributo) || !inteiro(efeito.valor)
      || !inteiro(efeito.inicioRodada) || !inteiro(efeito.fimRodada) || efeito.inicioRodada < 1
      || efeito.fimRodada < efeito.inicioRodada || typeof efeito.aplicado !== "boolean")) return false;
    if (!objeto(run.marcos) || !Object.entries(run.marcos).every(([id, rodada]) => id.length > 0
      && (id === "entidadeXRecusaFatalId"
        ? rodada === null || Jogo.eventos.some(evento => evento.id === rodada && evento.entidadeX)
        : inteiro(rodada) && rodada >= 1 && rodada <= run.rodada))) return false;
    if (!ids(run.inventario) || !ids(run.itensConquistados) || !flags(run.flags) || !legadoValido(run.legadoDaRun) || !legadoValido(run.conquistas)) return false;
    if (!ids(run.eventosComunsRun) || run.eventosComunsRun.length > 300) return false;
    if (run.ofertaMercador !== null && typeof run.ofertaMercador !== "string") return false;
    if (!objeto(run.efeitosPreparados)
      || typeof run.efeitosPreparados.bloquearDanoProximaBatalha !== "boolean"
      || !inteiro(run.efeitosPreparados.bonusAtaqueProximaBatalha) || run.efeitosPreparados.bonusAtaqueProximaBatalha < 0
      || !inteiro(run.efeitosPreparados.bonusEscudoProximaBatalha) || run.efeitosPreparados.bonusEscudoProximaBatalha < 0
      || !inteiro(run.efeitosPreparados.bonusGoldProximaRecompensa) || run.efeitosPreparados.bonusGoldProximaRecompensa < 0
      || !inteiro(run.efeitosPreparados.bacamarteBatalhas) || run.efeitosPreparados.bacamarteBatalhas < 0 || run.efeitosPreparados.bacamarteBatalhas > 3
      || !inteiro(run.efeitosPreparados.escudoFeCooldown) || run.efeitosPreparados.escudoFeCooldown < 0 || run.efeitosPreparados.escudoFeCooldown > 10) return false;
    if (!ids(run.eventosRecentes) || run.eventosRecentes.length > Jogo.config.memoriaEventos) return false;
    if (!ids(run.conselhosRecentes) || run.conselhosRecentes.length > 5
      || new Set(run.conselhosRecentes).size !== run.conselhosRecentes.length) return false;
    if (!objeto(run.comprasMercador) || !Object.entries(run.comprasMercador)
      .every(([id, quantidade]) => id.length > 0 && inteiro(quantidade) && quantidade >= 0)) return false;
    if (!inteiro(run.honraReveladaAteRodada) || run.honraReveladaAteRodada < 0) return false;
    if (!inteiro(run.habitantesReveladosAteRodada) || run.habitantesReveladosAteRodada < 0
      || !ids(run.opcoesSorteadas) || run.opcoesSorteadas.length > 300
      || (run.janelaZodiaco !== null && (!objeto(run.janelaZodiaco) || !inteiro(run.janelaZodiaco.marco) || typeof run.janelaZodiaco.eventoId !== "string"))
      || (run.efeitoDivino !== null && (!objeto(run.efeitoDivino) || typeof run.efeitoDivino.nome !== "string"
        || !inteiro(run.efeitoDivino.restantes) || run.efeitoDivino.restantes < 1 || run.efeitoDivino.restantes > 10))) return false;
    if (run.fase === "resultado") {
      const resultado = run.ultimoResultado;
      if (!objeto(resultado) || typeof resultado.texto !== "string" || typeof resultado.escolha !== "string") return false;
      if (!objeto(resultado.alteracoes) || !Jogo.atributos.every(id => inteiro(resultado.alteracoes[id]))) return false;
      if (Object.hasOwn(resultado.alteracoes, "hpMax") && !inteiro(resultado.alteracoes.hpMax)) return false;
      if (resultado.economia !== undefined && (!objeto(resultado.economia)
        || !inteiro(resultado.economia.renda) || !inteiro(resultado.economia.variacaoRenda)
        || !inteiro(resultado.economia.gasto) || resultado.economia.gasto < 0)) return false;
      if (resultado.combate !== null && (!objeto(resultado.combate) || typeof resultado.combate.venceu !== "boolean"
        || !inteiro(resultado.combate.dano) || resultado.combate.dano < 0)) return false;
    } else if (run.ultimoResultado !== null) return false;
    if (run.status === "encerrada") {
      return objeto(run.fim) && ["derrota", "vitoria"].includes(run.fim.tipo) && typeof run.fim.motivo === "string";
    }
    if (Jogo.engine.motivoDerrota(run) || run.fim !== null) return false;
    const evento = Jogo.engine.pools(run).eventos.find(evento => evento.id === run.eventoId)
      || Jogo.eventos.find(evento => evento.id === run.eventoId && evento.disparadoPelaEngine
        && (run.fase === "resultado" || Jogo.engine.eventoCondicaoDevido(run)?.id === evento.id));
    // A honra determina o sorteio; os controles de teste podem mudá-la depois
    // sem descartar a carta já aberta. Os demais requisitos continuam validados.
    const requisitosSalvos = { ...evento?.requisitos };
    delete requisitosSalvos.honra;
    delete requisitosSalvos.honraMin;
    delete requisitosSalvos.honraMax;
    return Boolean(evento && (run.fase === "resultado" || (Jogo.engine.cumpre(requisitosSalvos, run)
      && Jogo.engine.opcoes(evento, run).length > 0)));
  }

  function lerRun() {
    const dados = ler(CHAVE_RUN);
    if (dados === null || dados === LEITURA_INDISPONIVEL) return null;
    try {
      // Saves anteriores à economia recebem o saldo inicial, sem repetir renda
      // ou decisões. O legado tem sua própria versão e permanece separado.
      if (objeto(dados) && dados.versao === 1 && objeto(dados.atributos)) {
        dados.versao = Jogo.config.versao;
        if (!Object.hasOwn(dados.atributos, "gold")) dados.atributos.gold = Jogo.config.iniciais.gold;
        if (objeto(dados.ultimoResultado) && objeto(dados.ultimoResultado.alteracoes)
          && !Object.hasOwn(dados.ultimoResultado.alteracoes, "gold")) dados.ultimoResultado.alteracoes.gold = 0;
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "comprasMercador")) dados.comprasMercador = {};
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "hpMax")) dados.hpMax = Math.max(Jogo.config.hpMaxInicial, dados.atributos?.hp || 0);
      if (objeto(dados) && dados.versao === Jogo.config.versao && dados.traco === "doente") {
        const adquiridos = new Set([...(dados.itensConquistados || []), ...(dados.inventario || [])]);
        const bonusDeItens = Jogo.itens.reduce((total, item) => total
          + (adquiridos.has(item.id) ? item.aoReceber?.hpMax || 0 : 0), 0);
        const bonusDoCajado = dados.flags?.usou_cajado_da_dor ? 20 : 0;
        // Saves feitos antes desta correção podem ter registrado os itens, mas
        // a regra antiga impedia que eles elevassem o máximo acima de 70.
        dados.hpMax = Math.max(dados.hpMax, 70 + bonusDeItens + bonusDoCajado);
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "honraNeutraSequencia")) dados.honraNeutraSequencia = 0;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "lancaHeroiBatalhas")) dados.lancaHeroiBatalhas = 0;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "eventosRecentes")) dados.eventosRecentes = [];
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "eventosComunsRun")) {
        dados.eventosComunsRun = (dados.eventosRecentes || []).filter(id => Jogo.eventos.some(evento => evento.id === id
          && !evento.especial && !evento.entidadeX && !evento.entidadeXInicio && !evento.abissal && !evento.divino && !evento.zodiaco && evento.tipo !== "culto"));
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao) {
        for (const legado of [dados.legadoDaRun, dados.conquistas]) {
          if (objeto(legado) && !Object.hasOwn(legado, "eventosRecentesRuns")) legado.eventosRecentesRuns = [];
        }
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "conselhosRecentes")) {
        dados.conselhosRecentes = (dados.eventosRecentes || [])
          .filter(id => Jogo.eventos.some(evento => evento.id === id && evento.conselheiro)).slice(-5);
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "honraReveladaAteRodada")) dados.honraReveladaAteRodada = 0;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "habitantesReveladosAteRodada")) dados.habitantesReveladosAteRodada = 0;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "opcoesSorteadas")) dados.opcoesSorteadas = [];
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "janelaZodiaco")) dados.janelaZodiaco = null;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "efeitoDivino")) dados.efeitoDivino = null;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "ofertaMercador")) dados.ofertaMercador = null;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "efeitosPreparados")) {
        dados.efeitosPreparados = { bloquearDanoProximaBatalha: false, bonusAtaqueProximaBatalha: 0, bonusEscudoProximaBatalha: 0, bonusGoldProximaRecompensa: 0 };
      }
      if (objeto(dados) && objeto(dados.efeitosPreparados)
        && !Object.hasOwn(dados.efeitosPreparados, "bonusEscudoProximaBatalha")) dados.efeitosPreparados.bonusEscudoProximaBatalha = 0;
      if (objeto(dados) && objeto(dados.efeitosPreparados) && !Object.hasOwn(dados.efeitosPreparados, "bacamarteBatalhas")) dados.efeitosPreparados.bacamarteBatalhas = 0;
      if (objeto(dados) && objeto(dados.efeitosPreparados) && !Object.hasOwn(dados.efeitosPreparados, "escudoFeCooldown")) dados.efeitosPreparados.escudoFeCooldown = 0;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "itensConquistados")) {
        dados.itensConquistados = Array.isArray(dados.inventario) ? [...new Set(dados.inventario)] : [];
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "marcos")) dados.marcos = {};
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "condicao")) {
        dados.condicao = { ativa: null, rodada: null, abracada: false, curada: false, bonusAbraco: { ataque: 0, escudo: 0 } };
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && objeto(dados.condicao)
        && !Object.hasOwn(dados.condicao, "bonusAbraco")) dados.condicao.bonusAbraco = { ataque: 0, escudo: 0 };
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "efeitosTemporarios")) dados.efeitosTemporarios = [];
      if (objeto(dados) && dados.versao === Jogo.config.versao && objeto(dados.marcos) && !Object.hasOwn(dados.marcos, "entidadeXAparicoes")) {
        const flagsEntidade = dados.flags || {};
        const entidadeAtiva = flagsEntidade.entidade_x_ativa === true
          || Jogo.eventos.some(evento => (evento.entidadeX || evento.entidadeXInicio) && evento.id === dados.eventoId);
        if (entidadeAtiva) {
          let aparicoes = 1;
          for (const flag of ["entidade_x_espelho_visto", "entidade_x_balanca_vista", "entidade_x_porta_vista", "entidade_x_nome_visto"]) {
            if (flagsEntidade[flag] === true) aparicoes += 1;
          }
          if (flagsEntidade.entidade_x_tier2) aparicoes = Math.max(aparicoes, 2);
          if (flagsEntidade.entidade_x_nome_visto) aparicoes = Math.max(aparicoes, 5);
          if (flagsEntidade.entidade_x_tier3) aparicoes = Math.max(aparicoes, 6);
          dados.marcos.entidadeXAparicoes = aparicoes;
        }
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "traco")) dados.traco = "corajoso";
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "estacao")) dados.estacao = Jogo.estacaoDaRodada(dados.rodada || 1, dados);
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "previsaoCorvo")) dados.previsaoCorvo = null;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "corvoRevelaOpcaoId")) dados.corvoRevelaOpcaoId = null;
      if (objeto(dados) && dados.versao === Jogo.config.versao && dados.traco === "druida_herdeiro") {
        if (!Object.hasOwn(dados, "druidaPassiva") || !Object.hasOwn(Jogo.druida.passivas, dados.druidaPassiva)) {
          const tipoAntigo = dados.animal?.tipo;
          dados.druidaPassiva = Object.hasOwn(Jogo.druida.passivas, tipoAntigo)
            ? tipoAntigo : Object.keys(Jogo.druida.passivas)[Math.floor(Math.random() * Object.keys(Jogo.druida.passivas).length)];
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
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "construcoes")) dados.construcoes = [];
      if (objeto(dados) && dados.versao === Jogo.config.versao && Array.isArray(dados.construcoes)) {
        for (const [flag, id] of [["ponte_reparada", "ponte"], ["moinho_reparado", "moinho"]]) {
          if (dados.flags?.[flag] && !dados.construcoes.includes(id)) dados.construcoes.push(id);
        }
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "cultoRendaPorRodada")) dados.cultoRendaPorRodada = 0;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "cultoAtivo")) dados.cultoAtivo = false;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "seguidoresCulto")) dados.seguidoresCulto = 0;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "aguardaDecisaoCulto")) dados.aguardaDecisaoCulto = false;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "logItens")) dados.logItens = [];
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "consequenciasAgendadas")) dados.consequenciasAgendadas = [];
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "itensConsumidosEm")) {
        dados.itensConsumidosEm = {};
        for (const id of dados.itensConquistados || []) {
          const item = Jogo.itens.find(candidato => candidato.id === id);
          if (item?.tipo === "uso" && !(dados.inventario || []).includes(id)) {
            dados.itensConsumidosEm[id] = Math.max(0, (dados.rodada || 1) - 1);
          }
        }
      }
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "nemesis")) {
        const memorias = Jogo.legado.normalizar(dados.legadoDaRun).memorias;
        const memoriaAnterior = memorias.at(-1);
        dados.nemesis = memoriaAnterior?.tipo === "derrota" ? {
          motivo: memoriaAnterior.motivo, traco: memoriaAnterior.traco || null,
          meninoAdotado: memoriaAnterior.meninoAdotado === true,
          nivel: Math.min(4, Math.max(1, memorias.filter(memoria => memoria.tipo === "derrota").length)),
          enfrentado: false
        } : null;
      }
      if (!runValida(dados)) throw new Error("Run inválida");
      return dados;
    } catch (_) {
      avisar("A run salva está corrompida ou é incompatível. Inicie outro herdeiro; o legado permanece separado.");
      return null;
    }
  }

  function finalizar(run) {
    // Mantém as conquistas desta sessão utilizáveis mesmo sem armazenamento.
    // Elas só entram aqui depois do encerramento, nunca durante uma run ativa.
    Jogo.legado.registrarRun(run);
    legadoDaSessao = Jogo.legado.mesclar(legadoDaSessao,
      Jogo.legado.mesclar(run.legadoDaRun, run.conquistas));
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

  function registrarRotacaoRun(run) {
    const eventos = Array.isArray(run?.eventosComunsRun) ? run.eventosComunsRun : [];
    if (!run?.id || !eventos.length) return true;
    const rotacao = { versao: 1, eventosRecentesRuns: [{ id: run.id, eventos }] };
    legadoDaSessao = Jogo.legado.mesclar(legadoDaSessao, rotacao);
    const anterior = ler(CHAVE_LEGADO);
    if (anterior === LEITURA_INDISPONIVEL) return false;
    return gravar(CHAVE_LEGADO, Jogo.legado.mesclar(anterior, rotacao));
  }

  Jogo.save = {
    lerLegado, lerRun, runValida, apagarRun, finalizar, registrarRotacaoRun,
    gravarRun: run => gravar(CHAVE_RUN, run)
  };
})();
