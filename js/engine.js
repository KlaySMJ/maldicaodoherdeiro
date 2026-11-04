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

  function eventoDisponivel(evento, run) {
    if (evento.especial && run.flags[`especial_${evento.id}`] === true) return false;
    if (evento.pacto && run.flags.pacto_feito === true) return false;
    return true;
  }

  function peso(evento, run) {
    const regra = evento.pesos?.find(regra => cumpre(regra.requisitos, run));
    return Math.max(0, regra?.valor ?? evento.peso ?? 1);
  }

  function sortear(run, aleatorio = Math.random) {
    let candidatos = pools(run).eventos.filter(evento => eventoDisponivel(evento, run)
      && cumpre(evento.requisitos, run)
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

  function aplicarBonusDeRecompensa(run, efeitos = {}) {
    const preparados = run.efeitosPreparados || {};
    const bonus = efeitos.gold > 0 ? preparados.bonusGoldProximaRecompensa || 0 : 0;
    if (!bonus) return efeitos;
    run.efeitosPreparados = { ...preparados, bonusGoldProximaRecompensa: 0 };
    return { ...efeitos, gold: efeitos.gold + bonus };
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
    const preparados = run.efeitosPreparados || {};
    const bonusAtaque = preparados.bonusAtaqueProximaBatalha || 0;
    const bonusEscudo = preparados.bonusEscudoProximaBatalha || 0;
    const venceu = run.atributos.ataque + bonusAtaque >= batalha.defesa;
    const desfecho = venceu ? batalha.vitoria : batalha.derrota;
    const escudoUsado = run.atributos.escudo + bonusEscudo;
    const dano = preparados.bloquearDanoProximaBatalha
      ? 0 : Math.max(0, desfecho.dano - escudoUsado);
    const efeitos = aplicarBonusDeRecompensa(run, desfecho.efeitos || {});
    aplicarEfeitos(run, { ...efeitos, hp: (efeitos.hp || 0) - dano });
    run.efeitosPreparados = {
      ...run.efeitosPreparados,
      bloquearDanoProximaBatalha: false,
      bonusAtaqueProximaBatalha: 0,
      bonusEscudoProximaBatalha: 0
    };
    let texto = desfecho.resultado;
    if (bonusAtaque) texto += ` O óleo aumenta seu ataque em ${bonusAtaque} nesta batalha.`;
    if (bonusEscudo) texto += ` O elixir aumenta seu escudo em ${bonusEscudo} nesta batalha.`;
    if (preparados.bloquearDanoProximaBatalha) texto += " O amuleto anula o dano desta batalha.";
    if (!venceu && batalha.penalidadeFalha) {
      aplicarEfeitos(run, batalha.penalidadeFalha.efeitos, batalha.penalidadeFalha.multiplicadores);
      texto += ` ${batalha.penalidadeFalha.texto || ""}`;
    }
    return { texto: texto.trim(), combate: { venceu, dano, escudo: escudoUsado, bonusAtaque, bonusEscudo, danoAnulado: Boolean(preparados.bloquearDanoProximaBatalha) } };
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
    const efeitosOpcao = aplicarBonusDeRecompensa(run, opcao.efeitos || {});
    aplicarEfeitos(run, efeitosOpcao, opcao.multiplicadores);
    for (const [atributo, valor] of Object.entries(opcao.definir || {})) {
      if (!Jogo.atributos.includes(atributo) || !Number.isSafeInteger(valor)) continue;
      run.atributos[atributo] = atributo === "honra" ? valor : Math.max(0, valor);
    }
    if (opcao.efeitoContinuo?.revelarHonraRodadas > 0) {
      run.honraReveladaAteRodada = Math.max(run.honraReveladaAteRodada || 0,
        run.rodada + Math.floor(opcao.efeitoContinuo.revelarHonraRodadas));
    }
    run.flags = { ...run.flags, ...opcao.flags };
    if (opcao.armadilha && Math.random() < opcao.armadilha.chance) {
      const roubado = opcao.armadilha.perderItem && run.inventario.length
        ? run.inventario.splice(Math.floor(Math.random() * run.inventario.length), 1)[0] : null;
      aplicarEfeitos(run, { hp: -(opcao.armadilha.danoHp || 0) });
      const nomeRoubado = roubado ? Jogo.itens.find(item => item.id === roubado)?.nome || "um item" : null;
      resultado.texto += ` O baú se revela uma criatura e morde sua mão: você perde ${opcao.armadilha.danoHp || 0} HP${nomeRoubado ? ` e ele engole ${nomeRoubado}` : ""}.`;
    }
    for (const id of opcao.itens || []) concederItem(run, id);
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
    const item = !mercadoria && run.ofertaMercador === mercadoriaId
      ? Jogo.itens.find(item => item.id === mercadoriaId && item.mercador) : null;
    const oferta = mercadoria || item;
    if (!oferta || !cumpre(oferta.requisitos, run, "escolha") || !podePagar(run, oferta)) return false;
    const preco = precoMercadoria(run, oferta);
    const compras = Object.hasOwn(run.comprasMercador, oferta.id) ? run.comprasMercador[oferta.id] : 0;
    run.comprasMercador = { ...run.comprasMercador, [oferta.id]: compras + 1 };
    if (item) {
      run.inventario.push(item.id);
      return resolverOpcao(run, evento, {
        texto: `Comprar ${item.nome}.`, resultado: `${item.nome} guardado no inventário. Você poderá usá-lo quando decidir.`
      }, preco);
    }
    return resolverOpcao(run, evento, mercadoria, preco);
  }

  function usarItem(run, itemId) {
    if (run?.status !== "ativa" || !Array.isArray(run.inventario)) return false;
    const item = Jogo.itens.find(item => item.id === itemId);
    const indice = run.inventario.indexOf(itemId);
    if (!item || indice < 0 || !item.uso) return false;
    run.inventario.splice(indice, 1);
    const uso = item.uso;
    if (uso.efeitos) aplicarEfeitos(run, uso.efeitos);
    const preparados = run.efeitosPreparados || {};
    run.efeitosPreparados = {
      bloquearDanoProximaBatalha: preparados.bloquearDanoProximaBatalha || Boolean(uso.bloquearDanoProximaBatalha),
      bonusAtaqueProximaBatalha: (preparados.bonusAtaqueProximaBatalha || 0) + (uso.bonusAtaqueProximaBatalha || 0),
      bonusEscudoProximaBatalha: (preparados.bonusEscudoProximaBatalha || 0) + (uso.bonusEscudoProximaBatalha || 0),
      bonusGoldProximaRecompensa: (preparados.bonusGoldProximaRecompensa || 0) + (uso.bonusGoldProximaRecompensa || 0)
    };
    return true;
  }

  function concederItem(run, itemId) {
    const item = Jogo.itens.find(item => item.id === itemId);
    if (!item) return false;
    if (item.aoReceber) {
      aplicarEfeitos(run, item.aoReceber);
      if (item.encarece) {
        const compras = run.comprasMercador[item.encarece] || 0;
        run.comprasMercador = { ...run.comprasMercador, [item.encarece]: compras + 1 };
      }
      return true;
    }
    run.inventario.push(item.id);
    return true;
  }

  function ofertaMercador(run, evento) {
    if (evento?.tipo !== "mercador" || !run.ofertaMercador) return null;
    return Jogo.itens.find(item => item.id === run.ofertaMercador && item.mercador
      && Jogo.legado.disponivel(item, "itens", run.legadoDaRun)) || null;
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
    registrarSorteio(run, evento);
    run.fase = "escolha";
    run.ultimoResultado = null;
    return true;
  }

  function registrarSorteio(run, evento) {
    if (!run || !evento) return false;
    run.eventoId = evento.id;
    run.ofertaMercador = null;
    if (evento.tipo === "mercador") {
      const ofertas = Jogo.itens.filter(item => item.mercador && Jogo.legado.disponivel(item, "itens", run.legadoDaRun));
      if (ofertas.length) run.ofertaMercador = ofertas[Math.floor(Math.random() * ofertas.length)].id;
    }
    if (evento.especial) run.flags = { ...run.flags, [`especial_${evento.id}`]: true };
    return true;
  }

  Jogo.engine = { cumpre, pools, opcoes, peso, sortear, escolher, comprar, usarItem, concederItem, ofertaMercador, precoMercadoria, podePagar, rendaDaVila, testarHonra, avancar, registrarSorteio, encerrar, motivoDerrota };
})();
