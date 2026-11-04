(function () {
  "use strict";
  const Jogo = window.Jogo;

  function cumpre(requisitos, run, contexto = "estado") {
    if (!requisitos) return true;
    const a = run.atributos;
    if (requisitos.rodadaMin !== undefined && run.rodada < requisitos.rodadaMin) return false;
    if (requisitos.rodadaMax !== undefined && run.rodada > requisitos.rodadaMax) return false;
    // A aparência e os pesos usam a faixa do estado; diálogos têm limites próprios.
    const alta = contexto === "escolha" ? Jogo.config.honraEscolhasAlta : Jogo.config.honraAlta;
    const baixa = contexto === "escolha" ? Jogo.config.honraEscolhasBaixa : Jogo.config.honraBaixa;
    if (requisitos.honra === "alta" && a.honra < alta) return false;
    if (requisitos.honra === "baixa" && a.honra > baixa) return false;
    if (requisitos.honra === "nao_baixa" && a.honra <= baixa) return false;
    for (const atributo of Jogo.atributos) {
      if (requisitos[`${atributo}Min`] !== undefined && a[atributo] < requisitos[`${atributo}Min`]) return false;
      if (requisitos[`${atributo}Max`] !== undefined && a[atributo] > requisitos[`${atributo}Max`]) return false;
    }
    if (requisitos.flags?.some(id => !Object.hasOwn(run.flags, id) || !run.flags[id])) return false;
    if (requisitos.flagsAusentes?.some(id => Object.hasOwn(run.flags, id) && run.flags[id])) return false;
    if (requisitos.flagsLegado?.some(id => !Object.hasOwn(run.legadoDaRun.flags, id) || run.legadoDaRun.flags[id] !== true)) return false;
    if (requisitos.itens?.some(id => !run.inventario.includes(id))) return false;
    return true;
  }

  function pools(run) {
    return {
      eventos: Jogo.eventos.filter(evento => Jogo.legado.disponivel(evento, "eventos", run.legadoDaRun)),
      itens: Jogo.itens.filter(item => Jogo.legado.disponivel(item, "itens", run.legadoDaRun))
    };
  }

  function opcoes(evento, run) {
    return evento.opcoes.filter(opcao => cumpre(opcao.requisitos, run, "escolha"));
  }

  function peso(evento, run) {
    const regra = evento.pesos?.find(regra => cumpre(regra.requisitos, run));
    return Math.max(0, regra?.valor ?? evento.peso ?? 1);
  }

  function sortear(run, aleatorio = Math.random) {
    let candidatos = pools(run).eventos.filter(evento => cumpre(evento.requisitos, run)
      && opcoes(evento, run).length > 0 && peso(evento, run) > 0);
    // Espaça as últimas cartas. Com uma pool pequena, libera primeiro a mais antiga.
    const recentes = [...run.eventosRecentes];
    if (run.eventoId && recentes.at(-1) !== run.eventoId) recentes.push(run.eventoId);
    while (recentes.length) {
      const diferentes = candidatos.filter(evento => !recentes.includes(evento.id));
      if (diferentes.length) { candidatos = diferentes; break; }
      recentes.shift();
    }
    const total = candidatos.reduce((soma, evento) => soma + peso(evento, run), 0);
    let sorteio = aleatorio() * total;
    for (const evento of candidatos) {
      sorteio -= peso(evento, run);
      if (sorteio < 0) return evento;
    }
    return candidatos.at(-1) || null;
  }

  function aplicarEfeitos(run, efeitos = {}, multiplicadores = {}) {
    for (const atributo of Jogo.atributos) {
      const antes = run.atributos[atributo];
      const valor = Math.floor((antes + (efeitos[atributo] || 0)) * (multiplicadores[atributo] ?? 1));
      run.atributos[atributo] = atributo === "honra" ? valor : Math.max(0, valor);
    }
  }

  function motivoDerrota(run) {
    if (run.atributos.hp <= 0) return "O herdeiro sucumbiu. A terra espera por quem virá depois.";
    if (run.atributos.habitantes <= 0) return "A última casa ficou vazia. Sem habitantes, o vilarejo chegou ao fim.";
    return null;
  }

  function encerrar(run, tipo, motivo) {
    // Vitória pode chamar a mesma função quando sua condição for definida.
    Jogo.legado.avaliar(run);
    run.status = "encerrada";
    run.fim = { tipo, motivo };
  }

  function resolverCombate(run, batalha) {
    const venceu = run.atributos.ataque >= batalha.defesa;
    const desfecho = venceu ? batalha.vitoria : batalha.derrota;
    const dano = Math.max(0, desfecho.dano - run.atributos.escudo);
    aplicarEfeitos(run, { ...desfecho.efeitos, hp: (desfecho.efeitos?.hp || 0) - dano });
    let texto = desfecho.resultado;
    if (!venceu && batalha.penalidadeFalha) {
      aplicarEfeitos(run, batalha.penalidadeFalha.efeitos, batalha.penalidadeFalha.multiplicadores);
      texto += ` ${batalha.penalidadeFalha.texto || ""}`;
    }
    return { texto: texto.trim(), combate: { venceu, dano, escudo: run.atributos.escudo } };
  }

  function rendaDaVila(habitantes) {
    const regra = Jogo.config.economia;
    return habitantes < regra.habitantesParaManutencao
      ? -regra.perdaPorRodada : Math.floor(habitantes / regra.habitantesPorGold);
  }

  function precoMercadoria(run, mercadoria) {
    const compras = Object.hasOwn(run.comprasMercador, mercadoria.id) ? run.comprasMercador[mercadoria.id] : 0;
    return mercadoria.preco + (mercadoria.aumentoPreco || 0) * compras;
  }

  function podePagar(run, mercadoria) {
    const preco = precoMercadoria(run, mercadoria);
    return Number.isSafeInteger(preco) && preco >= 0 && run.atributos.gold >= preco;
  }

  function resolverOpcao(run, evento, opcao, gasto = 0) {
    const antes = { ...run.atributos };
    run.atributos.gold -= gasto;
    let resultado = { texto: opcao.resultado || "", combate: null };
    if (opcao.combate && evento.batalha) resultado = resolverCombate(run, evento.batalha);
    aplicarEfeitos(run, opcao.efeitos, opcao.multiplicadores);
    run.flags = { ...run.flags, ...opcao.flags };
    run.eventosRecentes = [...run.eventosRecentes, evento.id].slice(-Jogo.config.memoriaEventos);
    // A renda usa a população após a decisão e só é aplicada nesta resolução.
    const rendaBase = rendaDaVila(run.atributos.habitantes);
    const renda = rendaBase > 0 && run.rodada % Jogo.config.economia.intervaloRenda !== 0 ? 0 : rendaBase;
    const saldoAntesDaRenda = run.atributos.gold;
    aplicarEfeitos(run, { gold: renda });
    Jogo.legado.conceder(run, opcao.desbloqueia);
    Jogo.legado.avaliar(run);
    run.fase = "resultado";
    run.ultimoResultado = {
      ...resultado, escolha: opcao.texto,
      economia: { renda, variacaoRenda: run.atributos.gold - saldoAntesDaRenda, gasto },
      alteracoes: Object.fromEntries(Jogo.atributos.map(id => [id, run.atributos[id] - antes[id]]))
    };
    const motivo = motivoDerrota(run);
    if (motivo) encerrar(run, "derrota", motivo);
    return true;
  }

  function escolher(run, opcaoId) {
    if (run.status !== "ativa" || run.fase !== "escolha") return false;
    const evento = Jogo.eventos.find(evento => evento.id === run.eventoId);
    const opcao = evento && opcoes(evento, run).find(opcao => opcao.id === opcaoId);
    return opcao ? resolverOpcao(run, evento, opcao) : false;
  }

  function comprar(run, mercadoriaId) {
    if (run.status !== "ativa" || run.fase !== "escolha") return false;
    const evento = Jogo.eventos.find(evento => evento.id === run.eventoId);
    const mercadoria = evento?.mercadorias?.find(item => item.id === mercadoriaId);
    if (!mercadoria || !cumpre(mercadoria.requisitos, run, "escolha") || !podePagar(run, mercadoria)) return false;
    const preco = precoMercadoria(run, mercadoria);
    const compras = Object.hasOwn(run.comprasMercador, mercadoria.id) ? run.comprasMercador[mercadoria.id] : 0;
    run.comprasMercador = { ...run.comprasMercador, [mercadoria.id]: compras + 1 };
    return resolverOpcao(run, evento, mercadoria, preco);
  }

  function testarHonra(run, variacao) {
    if (run?.status !== "ativa" || ![30, -30].includes(variacao)) return false;
    const honra = run.atributos.honra + variacao;
    if (!Number.isSafeInteger(honra)) return false;
    run.atributos.honra = honra;
    return true;
  }

  function avancar(run) {
    if (run.status !== "ativa" || run.fase !== "resultado") return false;
    const evento = sortear({ ...run, rodada: run.rodada + 1 });
    if (!evento) return false;
    run.rodada += 1;
    run.eventoId = evento.id;
    run.fase = "escolha";
    run.ultimoResultado = null;
    return true;
  }

  Jogo.engine = { cumpre, pools, opcoes, peso, sortear, escolher, comprar, precoMercadoria, podePagar, rendaDaVila, testarHonra, avancar, encerrar, motivoDerrota };
})();
