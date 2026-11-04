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
      && flags(valor.flags) && ids(valor.objetivosConcluidos);
  }

  function runValida(run) {
    if (!objeto(run) || run.versao !== Jogo.config.versao || typeof run.id !== "string" || !run.id) return false;
    if (!["ativa", "encerrada"].includes(run.status) || !["escolha", "resultado"].includes(run.fase)) return false;
    if (!inteiro(run.rodada) || run.rodada < 1 || !objeto(run.atributos)) return false;
    if (!Jogo.atributos.every(id => inteiro(run.atributos[id]) && (id === "honra" || run.atributos[id] >= 0))) return false;
    if (!ids(run.inventario) || !flags(run.flags) || !legadoValido(run.legadoDaRun) || !legadoValido(run.conquistas)) return false;
    if (run.ofertaMercador !== null && typeof run.ofertaMercador !== "string") return false;
    if (!objeto(run.efeitosPreparados)
      || typeof run.efeitosPreparados.bloquearDanoProximaBatalha !== "boolean"
      || !inteiro(run.efeitosPreparados.bonusAtaqueProximaBatalha) || run.efeitosPreparados.bonusAtaqueProximaBatalha < 0
      || !inteiro(run.efeitosPreparados.bonusEscudoProximaBatalha) || run.efeitosPreparados.bonusEscudoProximaBatalha < 0
      || !inteiro(run.efeitosPreparados.bonusGoldProximaRecompensa) || run.efeitosPreparados.bonusGoldProximaRecompensa < 0) return false;
    if (!ids(run.eventosRecentes) || run.eventosRecentes.length > Jogo.config.memoriaEventos) return false;
    if (!objeto(run.comprasMercador) || !Object.entries(run.comprasMercador)
      .every(([id, quantidade]) => id.length > 0 && inteiro(quantidade) && quantidade >= 0)) return false;
    if (!inteiro(run.honraReveladaAteRodada) || run.honraReveladaAteRodada < 0) return false;
    if (run.fase === "resultado") {
      const resultado = run.ultimoResultado;
      if (!objeto(resultado) || typeof resultado.texto !== "string" || typeof resultado.escolha !== "string") return false;
      if (!objeto(resultado.alteracoes) || !Jogo.atributos.every(id => inteiro(resultado.alteracoes[id]))) return false;
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
    const evento = Jogo.engine.pools(run).eventos.find(evento => evento.id === run.eventoId);
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
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "eventosRecentes")) dados.eventosRecentes = [];
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "honraReveladaAteRodada")) dados.honraReveladaAteRodada = 0;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "ofertaMercador")) dados.ofertaMercador = null;
      if (objeto(dados) && dados.versao === Jogo.config.versao && !Object.hasOwn(dados, "efeitosPreparados")) {
        dados.efeitosPreparados = { bloquearDanoProximaBatalha: false, bonusAtaqueProximaBatalha: 0, bonusEscudoProximaBatalha: 0, bonusGoldProximaRecompensa: 0 };
      }
      if (objeto(dados) && objeto(dados.efeitosPreparados)
        && !Object.hasOwn(dados.efeitosPreparados, "bonusEscudoProximaBatalha")) dados.efeitosPreparados.bonusEscudoProximaBatalha = 0;
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

  Jogo.save = {
    lerLegado, lerRun, runValida, apagarRun, finalizar,
    gravarRun: run => gravar(CHAVE_RUN, run)
  };
})();
