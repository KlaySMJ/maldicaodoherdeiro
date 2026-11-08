(function () {
  "use strict";
  const Jogo = window.Jogo;
  const modificadoresCondicao = {
    licantropia: { ataque: 2 },
    vampirismo: { ataque: 3, escudo: 2 },
    possessao: { ataque: 2 },
  };

  function garantirCondicao(run) {
    run.condicao ||= {
      ativa: null,
      rodada: null,
      abracada: false,
      curada: false,
      bonusAbraco: { ataque: 0, escudo: 0 },
    };
    run.condicao.bonusAbraco ||= { ataque: 0, escudo: 0 };
    return run.condicao;
  }

  function sincronizarItemVampirismo(run) {
    if (!Array.isArray(run?.inventario)) return false;
    const itemId = "sede_de_sangue";
    const deveTer = run.condicao?.ativa === "vampirismo" && !run.condicao.abracada;
    const indice = run.inventario.indexOf(itemId);
    if (deveTer && indice < 0) {
      run.inventario.push(itemId);
      delete run.itensConsumidosEm?.[itemId];
      return true;
    }
    if (!deveTer && indice >= 0) {
      while (run.inventario.includes(itemId)) run.inventario.splice(run.inventario.indexOf(itemId), 1);
      return true;
    }
    return false;
  }

  function ativarCondicao(run, id) {
    if (!modificadoresCondicao[id]) return false;
    const condicao = garantirCondicao(run);
    if (condicao.ativa || condicao.curada || condicao.abracada) return false;
    condicao.ativa = id;
    condicao.rodada = run.rodada;
    condicao.abracada = false;
    condicao.curada = false;
    condicao.bonusAbraco = { ataque: 0, escudo: 0 };
    run.marcos.condicao = run.rodada;
    run.flags.condicao_decidida = true;
    sincronizarItemVampirismo(run);
    aplicarEfeitos(run, modificadoresCondicao[id]);
    return true;
  }

  function removerCondicao(run, marcadaComoCura = true) {
    const condicao = garantirCondicao(run);
    if (!condicao.ativa) return false;
    const efeitos = { ...(modificadoresCondicao[condicao.ativa] || {}) };
    for (const [atributo, valor] of Object.entries(condicao.bonusAbraco || {})) {
      efeitos[atributo] = (efeitos[atributo] || 0) + valor;
    }
    for (const [atributo, valor] of Object.entries(efeitos)) efeitos[atributo] = -valor;
    aplicarEfeitos(run, efeitos);
    condicao.ativa = null;
    sincronizarItemVampirismo(run);
    if (marcadaComoCura) {
      condicao.abracada = false;
      condicao.curada = true;
      run.flags.condicao_curada = true;
      run.flags[`condicao_curada_${condicao.ativa}`] = true;
    }
    run.flags.condicao_decidida = true;
    return true;
  }

  function curarCondicao(run, permitirAbracada = false) {
    if (!run || (garantirCondicao(run).abracada && !permitirAbracada)) return false;
    return removerCondicao(run, true);
  }

  function abracarCondicao(run) {
    const condicao = garantirCondicao(run);
    if (!condicao.ativa || condicao.abracada) return false;
    const bonus =
      condicao.ativa === "licantropia"
        ? { ataque: 2, escudo: 0 }
        : condicao.ativa === "vampirismo"
          ? { ataque: 2, escudo: 2 }
          : { ataque: 3, escudo: 3 };
    condicao.bonusAbraco = bonus;
    condicao.abracada = true;
    run.flags.condicao_abracada = true;
    run.flags[`condicao_abracada_${condicao.ativa}`] = true;
    sincronizarItemVampirismo(run);
    aplicarEfeitos(run, bonus);
    return true;
  }

  function eventoCondicaoDevido(run) {
    const condicao = garantirCondicao(run);
    if (!condicao.ativa || condicao.abracada || !Number.isSafeInteger(condicao.rodada)) return null;
    const desdeContagio = run.rodada - condicao.rodada;
    const eventos = {
      licantropia: run.rodada % 8 === 0 ? "lua_cheia" : null,
      vampirismo: desdeContagio > 0 && desdeContagio % 6 === 0 ? "a_sede" : null,
      possessao: desdeContagio > 0 && desdeContagio % 7 === 0 ? "a_voz" : null,
    };
    const id = eventos[condicao.ativa];
    return id ? Jogo.eventoPorId(id) : null;
  }

  function aplicarEfeitoCondicaoRodada(run) {
    const condicao = garantirCondicao(run);
    if (condicao.ativa === "licantropia") aplicarEfeitos(run, { hp: 1 });
    if (condicao.ativa === "vampirismo" && !condicao.abracada) aplicarEfeitos(run, { hp: -1 });
  }

  function aplicarEfeitosTemporarios(run) {
    const ativos = [];
    for (const efeito of run.efeitosTemporarios || []) {
      if (efeito.aplicado && run.rodada > efeito.fimRodada) {
        aplicarEfeitos(run, { [efeito.atributo]: -efeito.valor });
        continue;
      }
      if (!efeito.aplicado && run.rodada >= efeito.inicioRodada) {
        aplicarEfeitos(run, { [efeito.atributo]: efeito.valor });
        efeito.aplicado = true;
      }
      ativos.push(efeito);
    }
    run.efeitosTemporarios = ativos;
  }

  function cumpre(requisitos, run) {
    if (!requisitos) return true;
    if (requisitos.qualquer && !requisitos.qualquer.some((alternativa) => cumpre(alternativa, run)))
      return false;
    const a = run.atributos;
    if (requisitos.rodadaMin !== undefined && run.rodada < requisitos.rodadaMin) return false;
    if (requisitos.rodadaMax !== undefined && run.rodada > requisitos.rodadaMax) return false;
    if (requisitos.ano !== undefined && Jogo.anoDaRodada(run.rodada) !== requisitos.ano) return false;
    if (requisitos.anos && !requisitos.anos.includes(Jogo.anoDaRodada(run.rodada))) return false;
    if (requisitos.estacao && run.estacao !== requisitos.estacao) return false;
    if (requisitos.estacoes && !requisitos.estacoes.includes(run.estacao)) return false;
    if (
      requisitos.tracos &&
      !(Array.isArray(requisitos.tracos)
        ? requisitos.tracos.includes(run.traco)
        : requisitos.tracos === run.traco)
    )
      return false;
    if (requisitos.tracosAusentes?.includes(run.traco)) return false;
    if (
      requisitos.rodadasDesde &&
      Object.entries(requisitos.rodadasDesde).some(
        ([id, minimo]) => !Number.isSafeInteger(run.marcos?.[id]) || run.rodada - run.marcos[id] < minimo,
      )
    )
      return false;
    if (requisitos.condicaoAtiva && run.condicao?.ativa !== requisitos.condicaoAtiva) return false;
    for (const atributo of Jogo.atributos) {
      if (requisitos[`${atributo}Min`] !== undefined && a[atributo] < requisitos[`${atributo}Min`])
        return false;
      if (requisitos[`${atributo}Max`] !== undefined && a[atributo] > requisitos[`${atributo}Max`])
        return false;
    }
    if (requisitos.flags?.some((id) => !Object.hasOwn(run.flags, id) || !run.flags[id])) return false;
    if (requisitos.flagsAusentes?.some((id) => Object.hasOwn(run.flags, id) && run.flags[id])) return false;
    if (
      requisitos.flagsLegado?.some(
        (id) => !Object.hasOwn(run.legadoDaRun.flags, id) || run.legadoDaRun.flags[id] !== true,
      )
    )
      return false;
    if (requisitos.itensLegado?.some((id) => !run.legadoDaRun.itens.includes(id))) return false;
    if (requisitos.cultoAtivo !== undefined && Boolean(run.cultoAtivo) !== requisitos.cultoAtivo)
      return false;
    if (requisitos.itens?.some((id) => !run.inventario.includes(id))) return false;
    if (
      requisitos.itensProntos?.some((id) => !run.inventario.includes(id) || recargaItemRestante(run, id) > 0)
    )
      return false;
    if (requisitos.populacaoMinimo !== undefined) {
      const populacao = run.cultoAtivo ? run.seguidoresCulto : a.habitantes;
      if (populacao < requisitos.populacaoMinimo) return false;
    }
    if (requisitos.seguidoresMin !== undefined && run.seguidoresCulto < requisitos.seguidoresMin)
      return false;
    if (requisitos.seguidoresMax !== undefined && run.seguidoresCulto > requisitos.seguidoresMax)
      return false;
    if (requisitos.memoriaAnterior && !(run.legadoDaRun.memorias || []).length) return false;
    return true;
  }

  function pools(run) {
    return {
      eventos: Jogo.eventos.filter(
        (evento) => !evento.disparadoPelaEngine && Jogo.legado.disponivel(evento, "eventos", run.legadoDaRun),
      ),
      itens: Jogo.itens.filter((item) => Jogo.legado.disponivel(item, "itens", run.legadoDaRun)),
    };
  }

  function catalogoOpcoes(evento, run) {
    if (run.recompensasBau?.eventoId === evento.id) return run.recompensasBau.opcoes;
    return evento.poolOpcoes || evento.opcoes;
  }

  function opcoes(evento, run, usarOpcoesSorteadas = true) {
    const catalogo = catalogoOpcoes(evento, run);
    const selecionadas =
      usarOpcoesSorteadas && run.opcoesSorteadas?.length
        ? run.opcoesSorteadas.map((id) => catalogo.find((opcao) => opcao.id === id)).filter(Boolean)
        : catalogo;
    return selecionadas.filter(
      (opcao) =>
        cumpre(opcao.requisitos, run) &&
        (!opcao.recompensaItemGenerico ||
          Jogo.itens.some(
            (item) =>
              item.generico &&
              !run.itensConquistados.includes(item.id) &&
              Jogo.legado.disponivel(item, "itens", run.legadoDaRun),
          )) &&
        (!opcao.recompensaItemEspecial ||
          Jogo.itens.some(
            (item) =>
              item.especialSorteavel &&
              !run.itensConquistados.includes(item.id) &&
              cumpre(item.requisitos, run) &&
              Jogo.legado.disponivel(item, "itens", run.legadoDaRun),
          )),
    );
  }

  function eventoDisponivel(evento, run, aleatorio = Math.random) {
    if (evento.letal && run.rodada < 6) return false;
    if (run.traco === "menino_cronista" && evento.conselheiro) return false;
    if (run.flags.menino_conselheiro && evento.conselheiroPadrao && evento.conselhoNegativo) return false;
    const marcadoresAnuais = Object.keys(run.flags).some(
      (id) => id.startsWith(`${evento.id}_ano_`) && id.endsWith("_visto") && run.flags[id],
    );
    if ((evento.letal || evento.oncePerRun) && (run.flags[`${evento.id}_visto`] || marcadoresAnuais))
      return false;
    if (
      evento.oncePerYear &&
      (run.flags[`${evento.id}_visto`] ||
        marcadoresAnuais ||
        run.flags[`${evento.id}_ano_${Jogo.anoDaRodada(run.rodada)}_visto`])
    )
      return false;
    if (evento.id === "colheita" && Number.isSafeInteger(run.marcos.colheitaUltimaRodada)) {
      const estacaoAtual = Math.floor((run.rodada - 1) / 25);
      const estacaoAnterior = Math.floor((run.marcos.colheitaUltimaRodada - 1) / 25);
      if (estacaoAtual - estacaoAnterior < 2) return false;
    }
    if (evento.especial && run.flags[`especial_${evento.id}`] === true) return false;
    if (evento.pacto && run.flags.pacto_feito === true) return false;
    if (evento.nemesis && (!run.nemesis || run.nemesis.enfrentado)) return false;
    const entidadeAtiva = run.flags.entidade_x_ativa === true;
    const abissalAtivo = run.flags.abissal_1 === true && run.flags.abissal_5 !== true;
    if (
      evento.entidadeXInicio &&
      (entidadeAtiva || run.flags.entidade_x_imune || abissalAtivo || run.rodada < 8)
    )
      return false;
    if (evento.entidadeX && !entidadeAtiva) return false;
    if (evento.entidadeXAparicoesMin && (run.marcos.entidadeXAparicoes || 0) < evento.entidadeXAparicoesMin)
      return false;
    if (evento.abissal && entidadeAtiva) return false;
    if (evento.abissal && !run.flags.entidades_maiores_liberadas) return false;
    const anteriorId = run.eventosRecentes.at(-1);
    const anterior = Jogo.eventoPorId(anteriorId);
    if (evento.apenasAposTipo && anterior?.tipo !== evento.apenasAposTipo) return false;
    if (evento.apenasAposIds && !evento.apenasAposIds.includes(anteriorId)) return false;
    if (evento.chanceAposAnterior && aleatorio() >= evento.chanceAposAnterior) return false;
    if (evento.zodiaco && run.traco === "herdeira_leste") return false;
    if (evento.zodiaco) {
      const base = run.marcos.anoNovoBase;
      const marco = run.janelaZodiaco?.marco;
      const inicio = Number.isSafeInteger(base) && Number.isSafeInteger(marco) ? base + marco * 50 : Infinity;
      if (
        !run.flags.ano_novo_ativo ||
        run.janelaZodiaco?.eventoId !== evento.id ||
        run.rodada < inicio ||
        run.rodada >= inicio + 10
      )
        return false;
    }
    if (evento.divino) {
      const ultimaOferta = run.marcos.norteUltimaOferta ?? run.marcos.norteAtivado;
      if (
        !run.flags.bencao_norte_ativa ||
        !Number.isSafeInteger(ultimaOferta) ||
        run.rodada - ultimaOferta < 40
      )
        return false;
    }
    return true;
  }

  function peso(evento, run) {
    const regra = evento.multiplicadoresPeso?.find((regra) => cumpre(regra.requisitos, run));
    const base = Math.max(0, evento.peso ?? 1);
    const multiplicador = Math.max(0, regra?.multiplicador ?? 1);
    const ajusteAbissal = evento.abissal && temItem(run, "martelo_dos_afogados") ? 2 : 1;
    const culto =
      run.traco === "herdeiro_culto" &&
      (evento.tipo === "culto" ||
        evento.requisitos?.flags?.includes("culto_ativo") ||
        evento.opcoes?.some((opcao) => opcao.entrarNoCulto) ||
        evento.id === "ultimo_habitante")
        ? 2
        : 1;
    return base * multiplicador * ajusteAbissal * culto;
  }

  function eventoComum(evento) {
    return Boolean(
      evento &&
      !evento.especial &&
      !evento.entidadeX &&
      !evento.entidadeXInicio &&
      !evento.abissal &&
      !evento.divino &&
      !evento.zodiaco &&
      evento.tipo !== "culto",
    );
  }

  function batalhaAjustada(run, batalha) {
    if (!batalha) return batalha;
    const penalidadeDoente = run.traco === "doente" ? 1 : 0;
    if (batalha.semAjuste)
      return {
        ...batalha,
        defesa: Math.max(0, batalha.defesa - penalidadeDoente),
        vitoria: { ...batalha.vitoria, dano: 0 },
      };
    const estagioBase = Math.floor(Math.max(0, run.rodada - 1) / 10);
    const estagioTardio = Math.floor(Math.max(0, run.rodada - 30) / 20);
    const estagio = estagioBase + estagioTardio;
    const nivelNemesis = run.eventoId === "nemesis_da_memoria" ? Math.max(1, run.nemesis?.nivel || 1) : 0;
    if (!estagio && !nivelNemesis)
      return {
        ...batalha,
        defesa: Math.max(0, batalha.defesa - penalidadeDoente),
        vitoria: { ...batalha.vitoria, dano: 0 },
      };
    const estagioDefesa = Math.min(estagio, 4);
    const bonusDano = Math.min(estagio * 2, 8);
    return {
      ...batalha,
      defesa: Math.max(0, batalha.defesa + estagioDefesa + nivelNemesis * 2 - penalidadeDoente),
      vitoria: { ...batalha.vitoria, dano: 0 },
      derrota: { ...batalha.derrota, dano: batalha.derrota.dano + bonusDano + nivelNemesis * 5 },
      estagio,
    };
  }

  function prepararBau(run, evento) {
    if (!evento.bauAleatorio) return null;
    const elegiveis = Jogo.itens.filter(
      (item) =>
        ["comum", "raro", "epico"].includes(item.raridade) &&
        !item.especialSorteavel &&
        !run.itensConquistados.includes(item.id) &&
        !run.inventario.includes(item.id) &&
        Jogo.legado.disponivel(item, "itens", run.legadoDaRun),
    );
    for (let i = elegiveis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [elegiveis[i], elegiveis[j]] = [elegiveis[j], elegiveis[i]];
    }
    const escolhidos = elegiveis.slice(0, evento.bauAleatorio);
    const opcoesBau = escolhidos.map((item) => ({
      id: `recompensa_${item.id}`,
      texto: `${evento.id === "bau_mimico" ? "Pegar" : "Levar"} ${item.nome}.`,
      itens: [item.id],
      resultado: `Você escolhe ${item.nome} entre os objetos do baú.`,
      ...(evento.id === "bau_mimico" ? { armadilha: { chance: 1 / 6, danoHp: 10, perderItem: true } } : {}),
    }));
    if (evento.id === "bau_mimico")
      opcoesBau.push({
        id: "deixar",
        texto: "Seguir sem mexer no baú.",
        resultado: "Você deixa os objetos onde estão e retoma a estrada.",
      });
    if (!opcoesBau.length)
      opcoesBau.push({
        id: "ouro",
        texto: "Vasculhar o fundo vazio · +3 Gold.",
        efeitos: { gold: 3 },
        resultado: "Só restam algumas moedas no fundo do baú.",
      });
    run.recompensasBau = { eventoId: evento.id, opcoes: opcoesBau };
    return opcoesBau;
  }

  function temItem(run, id) {
    return run.itensConquistados?.includes(id) || run.inventario?.includes(id);
  }

  function sortearItemGenerico(run, aleatorio = Math.random) {
    const itens = Jogo.itens.filter(
      (item) =>
        item.generico &&
        !run.itensConquistados.includes(item.id) &&
        Jogo.legado.disponivel(item, "itens", run.legadoDaRun),
    );
    const raridades = [
      { id: "comum", peso: 10 },
      { id: "raro", peso: 4 },
      { id: "epico", peso: 1 },
    ].filter((raridade) => itens.some((item) => item.raridade === raridade.id));
    const total = raridades.reduce((soma, raridade) => soma + raridade.peso, 0);
    if (!total) return null;
    let valor = aleatorio() * total;
    let raridade = raridades.at(-1)?.id;
    for (const candidata of raridades) {
      valor -= candidata.peso;
      if (valor < 0) {
        raridade = candidata.id;
        break;
      }
    }
    const disponiveis = itens.filter((item) => item.raridade === raridade);
    return disponiveis[Math.floor(aleatorio() * disponiveis.length)] || null;
  }

  function sortearItemEspecial(run, aleatorio = Math.random) {
    const itens = Jogo.itens.filter(
      (item) =>
        item.especialSorteavel &&
        cumpre(item.requisitos, run) &&
        !run.itensConquistados.includes(item.id) &&
        Jogo.legado.disponivel(item, "itens", run.legadoDaRun),
    );
    if (!itens.length) return null;
    return itens[Math.floor(aleatorio() * itens.length)];
  }

  function sortear(run, aleatorio = Math.random) {
    if (run.atributos.hp > run.hpMax * 0.3) run.flags.cura_critica_oferecida = false;
    const apenasEventosD20 = run.flags.debugApenasEventosD20 === true;
    if (
      !apenasEventosD20 &&
      run.atributos.hp > 0 &&
      run.atributos.hp <= run.hpMax * 0.3 &&
      !run.flags.cura_critica_oferecida
    ) {
      const curaCritica = Jogo.eventoPorId("cura_critica");
      if (curaCritica) return curaCritica;
    }
    run.consequenciasAgendadas ||= [];
    run.consequenciasAgendadas = run.consequenciasAgendadas.filter(
      (item) =>
        item.eventoId !== "retorno_do_menino" ||
        (run.flags?.orfao_acolhido && !run.flags?.retorno_do_menino_visto),
    );
    const agendada = run.consequenciasAgendadas
      .filter((item) => Number.isSafeInteger(item.rodada) && item.rodada <= run.rodada)
      .sort((a, b) => a.rodada - b.rodada)[0];
    if (agendada) {
      const eventoAgendado = Jogo.eventoPorId(agendada.eventoId);
      if (eventoAgendado) {
        if (!apenasEventosD20) return eventoAgendado;
      } else run.consequenciasAgendadas = run.consequenciasAgendadas.filter((item) => item !== agendada);
    }
    const recorrenteCondicao = apenasEventosD20 ? null : eventoCondicaoDevido(run);
    if (recorrenteCondicao) return recorrenteCondicao;
    const auxilioPressagio = apenasEventosD20 ? null : Jogo.pressagios?.eventoAuxilio(run);
    if (auxilioPressagio) return auxilioPressagio;
    if (!apenasEventosD20 && run.nemesis && !run.nemesis.enfrentado && run.rodada >= 5) {
      const inimigo = Jogo.eventos.find((evento) => evento.nemesis);
      if (inimigo) return inimigo;
    }
    let candidatos = pools(run).eventos.filter(
      (evento) =>
        eventoDisponivel(evento, run, aleatorio) &&
        !(run.flags.lider_culto_derrotado && evento.cartaCulto) &&
        (!Jogo.pressagios || Jogo.pressagios.eventoCompativel(run, evento)) &&
        cumpre(evento.requisitos, run) &&
        !(evento.conselheiro && (run.conselhosRecentes || []).includes(evento.id)) &&
        // O sorteio roda antes de registrar a nova carta. Ignore os IDs da carta anterior.
        opcoes(evento, run, false).length > 0 &&
        (!apenasEventosD20 ||
          opcoes(evento, run, false).some(
            (opcao) => (opcao.testeDados || opcao.dueloDados) && !(opcao.combate && evento.batalha),
          )) &&
        peso(evento, run) > 0,
    );
    if (apenasEventosD20 && !candidatos.length) {
      run.flags.debugApenasEventosD20 = false;
      return sortear(run, aleatorio);
    }
    if (
      !apenasEventosD20 &&
      !run.flags.debugSempreCombate &&
      run.ultimaBatalhaRodada > 0 &&
      run.rodada - run.ultimaBatalhaRodada < 4
    )
      candidatos = candidatos.filter((evento) => !evento.batalha);
    if (run.flags.debugSempreCombate && !apenasEventosD20) {
      const cartasDeCombate = candidatos.filter(
        (evento) =>
          evento.batalha &&
          !evento.batalha.forcarDerrota &&
          opcoes(evento, run, false).some((opcao) => opcao.combate),
      );
      candidatos = cartasDeCombate.length
        ? cartasDeCombate
        : [Jogo.eventoPorId("saqueadores")].filter(Boolean);
    }
    const eventosProgramados = candidatos.filter((evento) => evento.forcarSorteioQuandoElegivel);
    if (eventosProgramados.length) candidatos = eventosProgramados;
    const anuaisDevidos = candidatos.filter(
      (evento) =>
        Number.isSafeInteger(evento.intervaloRodadas) &&
        evento.intervaloRodadas > 0 &&
        run.rodada % evento.intervaloRodadas === 0,
    );
    if (anuaisDevidos.length) candidatos = anuaisDevidos;
    if (run.flags.entidade_x_ativa) {
      const intervalo = Jogo.config.intervaloEntidade;
      const ultima = run.marcos.entidadeXUltimoEvento ?? run.rodada;
      if (run.rodada - ultima < intervalo) candidatos = candidatos.filter((evento) => !evento.entidadeX);
    }
    const eventosRecentesRuns = run.legadoDaRun?.eventosRecentesRuns || [];
    const repetidosEntreRuns = new Set(eventosRecentesRuns.flatMap((registro) => registro.eventos || []));
    const comunsNovos = candidatos.filter(
      (evento) => eventoComum(evento) && !repetidosEntreRuns.has(evento.id),
    );
    if (comunsNovos.length) {
      candidatos = candidatos.filter((evento) => !eventoComum(evento) || !repetidosEntreRuns.has(evento.id));
    }
    // Espaça as últimas cartas. Com uma pool pequena, libera primeiro a mais antiga.
    const recentes = [...run.eventosRecentes];
    if (run.eventoId && recentes.at(-1) !== run.eventoId) recentes.push(run.eventoId);
    while (recentes.length) {
      const gruposRecentes = new Set(
        recentes.map((id) => {
          const recente = Jogo.eventoPorId(id);
          return recente?.grupoRecorrencia || id;
        }),
      );
      const diferentes = candidatos.filter(
        (evento) => !gruposRecentes.has(evento.grupoRecorrencia || evento.id),
      );
      if (diferentes.length) {
        candidatos = diferentes;
        break;
      }
      recentes.shift();
    }
    const total = candidatos.reduce((soma, evento) => soma + peso(evento, run), 0);
    let sorteio = aleatorio() * total;
    let escolhido = null;
    for (const evento of candidatos) {
      sorteio -= peso(evento, run);
      if (sorteio < 0) {
        escolhido = evento;
        break;
      }
    }
    escolhido ||= candidatos.at(-1) || null;
    if (!apenasEventosD20 && run.flags.cinto_vento_ativo && escolhido?.tipo !== "batalha") {
      return Jogo.eventoPorId("correu_mais_rapido_que_a_luz") || escolhido;
    }
    return escolhido;
  }

  // A Heroína do povo tem honra imune: nunca diminui e nunca fica negativa.
  // Centralizado aqui para valer em efeitos, definições, itens, testeSorte e culto.
  function honraImune(run) {
    return run?.traco === "heroi_do_povo";
  }

  function aplicarEfeitos(run, efeitos = {}, multiplicadores = {}, contexto = {}) {
    let danoHonraCulto = 0;
    if (run?.traco === "herdeiro_culto" && Number.isSafeInteger(efeitos.honra) && efeitos.honra > 0) {
      danoHonraCulto = contexto.anularDanoHp ? 0 : efeitos.honra;
      efeitos = { ...efeitos, hp: (efeitos.hp || 0) - danoHonraCulto };
      delete efeitos.honra;
      multiplicadores = { ...multiplicadores, honra: 1 };
    }
    if (Number.isSafeInteger(efeitos.seguidores) && run.cultoAtivo) {
      const multiplicadorSeguidores =
        !contexto.semBonusSeguidores && temItem(run, "afogados_abencoados") && run.atributos.honra <= -90
          ? 2
          : 1;
      run.seguidoresCulto = Math.max(0, run.seguidoresCulto + efeitos.seguidores * multiplicadorSeguidores);
    }
    if (Number.isSafeInteger(efeitos.hpMax)) {
      run.hpMax = Math.max(1, run.hpMax + efeitos.hpMax);
    }
    for (const atributo of Jogo.atributos) {
      if (atributo === "honra" && !honraImune(run) && temItem(run, "espada_da_verdade")) {
        run.atributos.honra = 0;
        continue;
      }
      const antes = run.atributos[atributo];
      let efeito = efeitos[atributo] || 0;
      if (atributo === "hp" && contexto.anularDanoHp && efeito < 0) efeito = 0;
      if (atributo === "gold" && efeito > 0)
        efeito = Math.max(0, efeito - Jogo.herdeiros.valorEfeito(run, "reducaoGanhoGold"));
      let valor = Math.floor((antes + efeito) * (multiplicadores[atributo] ?? 1));
      if (atributo === "hp" && valor > antes && Jogo.herdeiros.efeitos(run).some((e) => e.reduzirCura))
        valor = antes + Math.floor((valor - antes) / 2);
      if (atributo === "habitantes" && contexto.protecaoCeleiro && valor < antes) {
        valor = antes - Math.floor((antes - valor) / 2);
      }
      if (atributo === "habitantes") {
        valor = Jogo.herdeiros.perdaHabitantes(run, antes, valor);
        if (
          run.traco === "herdeiro_culto" &&
          (efeitos.habitantes < 0 || (multiplicadores.habitantes ?? 1) < 1) &&
          valor >= antes &&
          antes > 0
        )
          valor = antes - 1;
      }
      run.atributos[atributo] =
        atributo === "honra"
          ? honraImune(run)
            ? Math.max(antes, Math.max(0, valor))
            : run.traco === "herdeiro_culto"
              ? Math.min(0, valor)
              : valor
          : atributo === "hp"
            ? Math.min(run.hpMax, Math.max(0, valor))
            : Math.max(atributo === "escudo" && run.traco === "bruxo" ? -1 : 0, valor);
    }
    run.honraSempreNeutra =
      run.honraSempreNeutra !== false && run.atributos.honra >= -29 && run.atributos.honra <= 29;
    return danoHonraCulto;
  }

  function aplicarBonusDeRecompensa(run, efeitos = {}) {
    const preparados = run.efeitosPreparados || {};
    const ouroBase = efeitos.gold ?? 0;
    const bonus = ouroBase > 0 ? preparados.bonusGoldProximaRecompensa || 0 : 0;
    const companhia = temItem(run, "corvo_companheiro") && ouroBase > 0 ? 1 : 0;
    if (bonus) run.efeitosPreparados = { ...preparados, bonusGoldProximaRecompensa: 0 };
    const gold = ouroBase + bonus + companhia;
    return efeitos.gold !== undefined && gold !== efeitos.gold ? { ...efeitos, gold } : efeitos;
  }

  function registrarConsumoVampirismo(run, quantidade) {
    if (run.condicao?.ativa !== "vampirismo" || !Number.isSafeInteger(quantidade) || quantidade < 1) return;
    const total = (run.vampirismoHabitantesConsumidos || 0) + quantidade;
    const jaConcedidos = run.vampirismoBonusAtaque || 0;
    const novosBonus = Math.max(0, Math.floor(total / 5) - jaConcedidos);
    run.vampirismoHabitantesConsumidos = total;
    if (!novosBonus) return;
    run.vampirismoBonusAtaque = jaConcedidos + novosBonus;
    aplicarEfeitos(run, { ataque: novosBonus });
  }

  function motivoDerrota(run) {
    if (run.atributos.hp <= 0) return "O herdeiro sucumbiu. A terra espera por quem virá depois.";
    if (run.aguardaDecisaoCulto) return null;
    if (run.cultoAtivo)
      return run.seguidoresCulto <= 0 ? "O culto se dispersou, e a crônica chegou ao fim." : null;
    if (run.atributos.habitantes <= 0)
      return "A última casa ficou vazia. Sem habitantes, o vilarejo chegou ao fim.";
    return null;
  }

  function aguardarDecisaoCulto(run) {
    run.aguardaDecisaoCulto = true;
    const carta = Jogo.eventoPorId("ultimo_habitante");
    const ordem = [...(carta?.opcoes || [])];
    for (let i = ordem.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    }
    run.opcoesSorteadas = ordem.map((opcao) => opcao.id);
  }

  function juntarCulto(run) {
    if (run?.status !== "ativa" || run.fase !== "resultado" || !run.aguardaDecisaoCulto) return false;
    Jogo.herdeiros.iniciarCulto(run);
    if (!honraImune(run)) run.atributos.honra -= 5;
    run.aguardaDecisaoCulto = false;
    run.marcos.cultoAdesao = run.rodada;
    run.marcos.culto_entrada_rodada = run.rodada;
    run.opcoesSorteadas = [];
    Jogo.legado.conceder(run, { flags: ["culto_conhecido"] });
    concederItem(run, "adaga_cerimonial");
    run.flags.ultimo_habitante_visto = true;
    if (run.encontroLeste) run.encontroLeste.transicaoCulto = true;
    run.eventoId = "ultimo_habitante";
    run.ultimoResultado.escolha = "Aceitar o chamado.";
    if (!honraImune(run)) run.ultimoResultado.alteracoes.honra -= 5;
    run.ultimoResultado.texto = `${Jogo.eventoPorId("ultimo_habitante").opcoes.find((opcao) => opcao.id === "juntar").resultado} A Adaga cerimonial é guardada no inventário.`;
    registrarEscolhaNaCronica(run, Jogo.eventoPorId("ultimo_habitante"), { texto: "Aceitar o chamado." });
    return true;
  }

  function encerrarSemCulto(run) {
    if (run?.status !== "ativa" || run.fase !== "resultado" || !run.aguardaDecisaoCulto) return false;
    run.aguardaDecisaoCulto = false;
    run.opcoesSorteadas = [];
    run.flags.ultimo_habitante_visto = true;
    if (run.encontroLeste) run.encontroLeste.transicaoCulto = true;
    run.eventoId = "ultimo_habitante";
    run.ultimoResultado.escolha = "Encerrar a linhagem.";
    run.ultimoResultado.texto = Jogo.eventoPorId("ultimo_habitante").opcoes.find(
      (opcao) => opcao.id === "encerrar",
    ).resultado;
    registrarEscolhaNaCronica(run, Jogo.eventoPorId("ultimo_habitante"), { texto: "Encerrar a linhagem." });
    encerrar(run, "derrota", "Sem habitantes, você decide não seguir com o culto. A crônica termina.");
    return true;
  }

  function atualizarCulto(run, antes, semRecrutamento = false) {
    if (!run.cultoAtivo) return;
    const dobraSeguidores = temItem(run, "afogados_abencoados") && run.atributos.honra <= -90 ? 2 : 1;
    const ganhouHabitantes = run.atributos.habitantes - antes.habitantes;
    if (ganhouHabitantes > 0) run.seguidoresCulto += (1 + Math.floor(Math.random() * 5)) * dobraSeguidores;
    const honraGanha = run.atributos.honra - antes.honra;
    if (honraGanha > 0) {
      const debandadaCalculada = honraGanha * (1 + Math.floor(Math.random() * 2));
      const debandada = Math.min(run.seguidoresCulto, debandadaCalculada);
      run.seguidoresCulto -= debandada;
      if (debandada && run.ultimoResultado) {
        run.ultimoResultado.informativoCulto = `${numeroSeguidores(debandada)} ${debandada === 1 ? "seguidor deixou" : "seguidores deixaram"} o culto quando sua honra aumentou.`;
      }
    }
    if (semRecrutamento) return;
    const adesao = run.marcos.cultoAdesao;
    const seguidoresAntesDoRecrutamento = run.seguidoresCulto;
    const recrutamentoDeRecuperacao = seguidoresAntesDoRecrutamento < 30;
    const chegadaAcelerada =
      recrutamentoDeRecuperacao || (temItem(run, "honra_dos_caidos") && run.atributos.honra <= -50);
    const intervalo = chegadaAcelerada ? 5 : 10;
    const chegadaBase = seguidoresAntesDoRecrutamento < 15 ? 8 : 5;
    if (
      run.seguidoresCulto > 0 &&
      Number.isSafeInteger(adesao) &&
      run.rodada > adesao &&
      (run.rodada - adesao) % intervalo === 0
    ) {
      const chegada = chegadaBase * dobraSeguidores;
      run.seguidoresCulto += chegada;
      if (run.ultimoResultado) run.ultimoResultado.texto += ` ${chegada} novos seguidores chegam ao culto.`;
    }
  }

  function numeroSeguidores(valor) {
    return new Intl.NumberFormat("pt-BR").format(valor);
  }

  function encerrar(run, tipo, motivo) {
    // Vitória pode chamar a mesma função quando sua condição for definida.
    run.status = "encerrada";
    run.fim = { tipo, motivo };
    Jogo.legado.avaliar(run);
    run.conquistas = Jogo.legado.mesclar(run.conquistas, {
      // mesclar normaliza só payloads com versao 1; sem isso a memória é descartada.
      versao: 1,
      memorias: [
        {
          id: run.id,
          rodada: run.rodada,
          honra: run.atributos.honra,
          tipo,
          motivo,
          traco: run.traco,
          meninoAdotado: Boolean(run.flags.orfao_acolhido),
        },
      ],
    });
    if (tipo.startsWith("vitoria") && run.rodada >= Jogo.config.rodadasVitoria) {
      run.conquistas = Jogo.legado.mesclar(run.conquistas, {
        versao: 1,
        melhoresRuns: [
          {
            id: run.id,
            pontuacao: run.rodada * 100 + run.atributos.habitantes * 5 + run.atributos.gold,
            rodada: run.rodada,
            habitantes: run.atributos.habitantes,
            gold: run.atributos.gold,
            traco: run.traco,
          },
        ],
      });
    }
  }

  // A crônica pode terminar de mais de uma forma após três anos: a vila sobrevive,
  // o povo reconhece o herdeiro ou o chamado do culto atravessa os anos com a vila.
  function finalDeVitoria(run) {
    const ano = `${Jogo.config.rodadasVitoria} rodadas de escolhas e consequências`;
    if (run.cultoAtivo)
      return [
        "vitoria_culto",
        `A vila atravessou três anos sob o chamado: ${ano}, e o culto saiu dela intacto.`,
      ];
    if (run.atributos.honra >= Jogo.config.honraExtremaAlta)
      return [
        "vitoria_honra",
        `A vila atravessou três anos ao lado de quem a povo: ${ano}, e a Honra terminou bem acima do resto.`,
      ];
    return ["vitoria", `A vila atravessou três anos sob este herdeiro: ${ano}.`];
  }

  function rolarDado20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  function calcularTesteDados(definicao, face) {
    const bonus = definicao.bonus || 0;
    const total = face + bonus;
    const desfecho =
      face === 20
        ? "sucesso"
        : face === 1
          ? "falha"
          : total >= definicao.dificuldade
            ? "sucesso"
            : total >= definicao.limiteCusto
              ? "sucessoComCusto"
              : "falha";
    return {
      face,
      bonus,
      total,
      dificuldade: definicao.dificuldade,
      limiteCusto: definicao.limiteCusto,
      desfecho,
    };
  }

  function calcularDueloDados(definicao, face, faceOponente) {
    const bonusOponente = definicao.bonusOponente || 0;
    const totalOponente = faceOponente + bonusOponente;
    const desfecho = face === 20 ? "sucesso" : face === 1 ? "falha" : face > totalOponente ? "sucesso" : "falha";
    return { face, faceOponente, bonusOponente, totalOponente, desfecho };
  }

  function rolarDadoHerdeiro(run) {
    const minimo = temItem(run, "dado_viciado") ? 5 : 1;
    return Math.floor(Math.random() * (21 - minimo)) + minimo;
  }

  function rolarConjuntoDados(quantidade) {
    return Array.from({ length: quantidade }, rolarDado20);
  }

  function rolarConjuntoHerdeiro(run, quantidade) {
    return Array.from({ length: quantidade }, () => rolarDadoHerdeiro(run));
  }

  function quantidadeDadosTesteDados(run) {
    const preparados = run.efeitosPreparados || {};
    const bonusDadosVantagem = Math.max(
      run.efeitoDivino?.bonusDadosCombate || 0,
      run.passivaNordica?.bonusDadosCombate || 0,
    );
    return Math.min(
      20,
      1 +
        (run.dadosCombatePermanentes || 0) +
        (preparados.bonusDadosCombateProximaBatalha || 0) +
        bonusDadosVantagem +
        (Jogo.druida?.bonusDadosCombate(run) || 0),
    );
  }

  function registrarDadosNaturais(run, dados) {
    run.dadosNaturais20Combate =
      (run.dadosNaturais20Combate || 0) + dados.filter((dado) => dado === 20).length;
    run.dadosNaturais1Combate = (run.dadosNaturais1Combate || 0) + dados.filter((dado) => dado === 1).length;
  }

  function fontesDesvantagemInimiga(run, pendente = run.combatePendente) {
    return (
      Number(run.traco === "bruxo") +
      Number(pendente?.tracoInimigo === "cego") +
      Number(run.traco === "coringa" && pendente?.coringa === 3) +
      Number(run.efeitosPreparados?.desvantagemInimigaProximaBatalha === true)
    );
  }

  function perfilCombate(run) {
    const evento = Jogo.eventoPorId(run?.eventoId);
    const batalha = evento?.batalha;
    if (!batalha) return null;
    const ajustada = batalhaAjustada(run, batalha);
    const preparados = run.efeitosPreparados || {};
    const pendente = run.combatePendente;
    const fontesDesvantagem = fontesDesvantagemInimiga(run, pendente);
    const fonteTerceiraDesvantagem = fontesDesvantagem >= 3 ? 1 : 0;
    const bonusCoringaAtaque = run.traco === "coringa" && pendente?.coringa === 2 ? 2 : 0;
    const bonusCoringaDado = run.traco === "coringa" && pendente?.coringa === 1 ? 1 : 0;
    const bonusDadosVantagem = Math.max(
      run.efeitoDivino?.bonusDadosCombate || 0,
      run.passivaNordica?.bonusDadosCombate || 0,
    );
    return {
      ataque:
        run.atributos.ataque +
        (preparados.bonusAtaqueProximaBatalha || 0) +
        (Jogo.druida?.bonusAtaqueCombate(run) || 0) +
        bonusCoringaAtaque,
      bonusResultado: temItem(run, "trevo_da_sorte") ? 5 : 0,
      defesa: Math.max(
        0,
        ajustada.defesa -
          (run.traco === "coringa" && pendente?.coringa === 5 ? 1 : 0) -
          fonteTerceiraDesvantagem,
      ),
      dadosHerdeiro: Math.min(
        20,
        1 +
          (run.dadosCombatePermanentes || 0) +
          (preparados.bonusDadosCombateProximaBatalha || 0) +
          bonusDadosVantagem +
          (Jogo.druida?.bonusDadosCombate(run) || 0) +
          bonusCoringaDado,
      ),
      dadosInimigo: Math.min(20, Math.max(1, ajustada.dadosInimigo || 1) + Math.min(2, fontesDesvantagem)),
      inimigoEscolheMenor: fontesDesvantagem > 0,
      tracoInimigo: pendente?.tracoInimigo || "",
      coringa: pendente?.coringa || 0,
      batalha: ajustada,
    };
  }

  function distribuicaoDadoExtremo(quantidade, minimo, maximo, escolheMenor = false) {
    const lados = maximo - minimo + 1;
    return Array.from({ length: lados }, (_, indice) => {
      const face = minimo + indice;
      const chance = escolheMenor
        ? Math.pow((maximo - face + 1) / lados, quantidade) - Math.pow((maximo - face) / lados, quantidade)
        : Math.pow((face - minimo + 1) / lados, quantidade) - Math.pow((face - minimo) / lados, quantidade);
      return { face, chance };
    });
  }

  function chanceVitoriaContraFace(perfil, faceInimigo, minimoHerdeiro = 1) {
    const empateVence = perfil.tracoInimigo !== "veloz";
    const distribuicaoHerdeiro = distribuicaoDadoExtremo(
      perfil.dadosHerdeiro,
      minimoHerdeiro,
      20,
    );
    const totalInimigo = faceInimigo + perfil.defesa;
    return distribuicaoHerdeiro.reduce((chance, resultado) => {
      const totalHerdeiro = resultado.face + perfil.ataque + perfil.bonusResultado;
      const venceu = empateVence ? totalHerdeiro >= totalInimigo : totalHerdeiro > totalInimigo;
      return chance + (venceu ? resultado.chance : 0);
    }, 0);
  }

  function chanceVitoriaCombate(run) {
    const evento = Jogo.eventoPorId(run?.eventoId);
    const perfil = perfilCombate(run);
    if (!evento?.batalha || !perfil || perfil.batalha.forcarDerrota) return 0;
    const pendente = run.combatePendente;
    const rerrolagens = Math.max(
      0,
      Math.min(11, (pendente?.rerrolagensGratis || 0) + Number(pendente?.rerrolagemCoringa === 1)),
    );
    const minimoHerdeiro = temItem(run, "dado_viciado") ? 5 : 1;
    const distribuicaoInimigo = distribuicaoDadoExtremo(
      perfil.dadosInimigo,
      1,
      20,
      perfil.inimigoEscolheMenor,
    );
    const chancePorFace = new Map(
      distribuicaoInimigo.map(({ face }) => [face, chanceVitoriaContraFace(perfil, face, minimoHerdeiro)]),
    );

    if (!evento.bossId) {
      const lancaAtiva = !perfil.batalha.semOverrides && run.lancaHeroiBatalhas > 0;
      const adagaAtiva = !perfil.batalha.semOverrides && temItem(run, "adaga_amaldicoada");
      if (lancaAtiva || adagaAtiva) return 1;
      return distribuicaoInimigo.reduce((total, { face, chance }) => {
        const chanceRolagem = chancePorFace.get(face) || 0;
        return total + chance * (1 - Math.pow(1 - chanceRolagem, rerrolagens + 1));
      }, 0);
    }

    const danoChefe = Math.max(1, perfil.batalha.danoPorAcerto || evento.batalha.danoPorAcerto || 25);
    const vidaChefeInicial = Math.max(
      1,
      pendente?.vidaChefe ?? evento.batalha.vidaMaxima ?? 100,
    );
    const vidaHerdeiroInicial = Math.max(0, run.atributos?.hp || 0);
    const preparados = run.efeitosPreparados || {};
    const tracoInimigo = pendente?.tracoInimigo || "";
    const danoBase = perfil.batalha.derrota.dano + (tracoInimigo === "feroz" ? 6 : 0);
    const manto = temItem(run, "manto_de_folhas") ? (run.estacao === "inverno" ? 4 : 3) : 0;
    const escudo = (run.atributos?.escudo || 0) + (preparados.bonusEscudoProximaBatalha || 0) + manto;
    const somenteEscudo = Boolean(perfil.batalha.somenteEscudo);
    const reducaoDivina = somenteEscudo ? 0 : Jogo.herdeiros.valorEfeito(run, "reducaoDano");
    const reducaoPassiva = somenteEscudo
      ? 0
      : (temItem(run, "cao_companheiro") ? 2 : 0) +
        (run.construcoes?.includes("muralha") ? 2 : 0) +
        (run.construcoes?.includes("torre_vigia") ? 3 : 0);
    const danoHerdeiro = Math.max(0, danoBase - escudo - reducaoDivina - reducaoPassiva);
    const protecaoInicial = Boolean(
      (preparados.bloquearDanoProximaBatalha && !pendente?.bloqueioChefeUsado) ||
        ((preparados.bacamarteBatalhas || 0) > 0 && !pendente?.bacamarteChefeUsado),
    );
    const memo = new Map();
    const memoFalha = new Map();

    const chanceEstado = (vidaChefe, vidaHerdeiro, protecao, rerrolagensRestantes) => {
      if (vidaChefe <= 0) return 1;
      if (vidaHerdeiro <= 0) return 0;
      const chave = `${vidaChefe}|${vidaHerdeiro}|${Number(protecao)}|${rerrolagensRestantes}`;
      if (memo.has(chave)) return memo.get(chave);

      const aposAcerto = chanceEstado(
        vidaChefe - danoChefe,
        vidaHerdeiro,
        protecao,
        rerrolagensRestantes,
      );
      const vidaAposFalha = vidaHerdeiro - (protecao ? 0 : danoHerdeiro);
      const aposFalha = vidaAposFalha <= 0
        ? 0
        : chanceEstado(vidaChefe, vidaAposFalha, false, rerrolagensRestantes);
      const chance = distribuicaoInimigo.reduce((total, { face, chance: peso }) => {
        const chanceRolagem = chancePorFace.get(face) || 0;
        const aposFalhaComEscolha =
          chanceRolagem > 0 && rerrolagensRestantes > 0
            ? Math.max(
                aposFalha,
                valorFalhaRerrolando(
                  face,
                  vidaChefe,
                  vidaHerdeiro,
                  protecao,
                  rerrolagensRestantes,
                  chanceRolagem,
                ),
              )
            : aposFalha;
        return total + peso * (chanceRolagem * aposAcerto + (1 - chanceRolagem) * aposFalhaComEscolha);
      }, 0);
      memo.set(chave, chance);
      return chance;
    };

    const valorFalhaRerrolando = (
      faceInimigo,
      vidaChefe,
      vidaHerdeiro,
      protecao,
      rerrolagensRestantes,
      chanceRolagem,
    ) => {
      const chave = `${faceInimigo}|${vidaChefe}|${vidaHerdeiro}|${Number(protecao)}|${rerrolagensRestantes}`;
      if (memoFalha.has(chave)) return memoFalha.get(chave);
      const vidaAposFalha = vidaHerdeiro - (protecao ? 0 : danoHerdeiro);
      const aposFalha = vidaAposFalha <= 0
        ? 0
        : chanceEstado(vidaChefe, vidaAposFalha, false, rerrolagensRestantes);
      const aposAcerto = chanceEstado(
        vidaChefe - danoChefe,
        vidaHerdeiro,
        protecao,
        rerrolagensRestantes - 1,
      );
      const continuar = rerrolagensRestantes > 1
        ? valorFalhaRerrolando(
            faceInimigo,
            vidaChefe,
            vidaHerdeiro,
            protecao,
            rerrolagensRestantes - 1,
            chanceRolagem,
          )
        : vidaAposFalha <= 0
          ? 0
          : chanceEstado(vidaChefe, vidaAposFalha, false, rerrolagensRestantes - 1);
      const valor = Math.max(aposFalha, chanceRolagem * aposAcerto + (1 - chanceRolagem) * continuar);
      memoFalha.set(chave, valor);
      return valor;
    };

    if (danoHerdeiro === 0) {
      const chanceAcerto = distribuicaoInimigo.reduce(
        (total, { face, chance }) => total + chance * (chancePorFace.get(face) || 0),
        0,
      );
      return chanceAcerto > 0 ? 1 : 0;
    }
    return chanceEstado(vidaChefeInicial, vidaHerdeiroInicial, protecaoInicial, rerrolagens);
  }

  function resolverCombate(run, batalha, rolagem) {
    batalha = batalhaAjustada(run, batalha);
    const preparados = run.efeitosPreparados || {};
    const bonusAtaque = preparados.bonusAtaqueProximaBatalha || 0;
    const bonusAtaqueDruida = Jogo.druida?.bonusAtaqueCombate(run) || 0;
    const bonusEscudo = preparados.bonusEscudoProximaBatalha || 0;
    const perfil = perfilCombate(run);
    const dadosHerdeiro =
      Array.isArray(rolagem?.dadosHerdeiro) && rolagem.dadosHerdeiro.length
        ? [...rolagem.dadosHerdeiro]
        : rolarConjuntoHerdeiro(run, perfil?.dadosHerdeiro || 1);
    const dadosInimigo =
      Array.isArray(rolagem?.dadosInimigo) && rolagem.dadosInimigo.length
        ? [...rolagem.dadosInimigo]
        : rolarConjuntoDados(perfil?.dadosInimigo || batalha.dadosInimigo || 1);
    const dadoHerdeiro = Math.max(...dadosHerdeiro);
    const fontesDesvantagem = fontesDesvantagemInimiga(run);
    const dadoInimigo = fontesDesvantagem ? Math.min(...dadosInimigo) : Math.max(...dadosInimigo);
    const bonusCoringaAtaque = run.traco === "coringa" && run.combatePendente?.coringa === 2 ? 2 : 0;
    const ataqueTotal = run.atributos.ataque + bonusAtaque + bonusAtaqueDruida + bonusCoringaAtaque;
    const bonusResultado = temItem(run, "trevo_da_sorte") ? 5 : 0;
    const defesaInimiga = perfil?.defesa ?? batalha.defesa;
    const totalHerdeiro = dadoHerdeiro + ataqueTotal + bonusResultado;
    const totalInimigo = dadoInimigo + defesaInimiga;
    const empateVence = run.combatePendente?.tracoInimigo !== "veloz";
    const venceuNaRolagem = empateVence ? totalHerdeiro >= totalInimigo : totalHerdeiro > totalInimigo;
    const rerrolagens = rolagem?.rerrolagens || 0;
    const lancaAtiva = !batalha.semOverrides && run.lancaHeroiBatalhas > 0;
    const adagaAtiva = !batalha.semOverrides && temItem(run, "adaga_amaldicoada");
    const venceu = !batalha.forcarDerrota && (lancaAtiva || adagaAtiva || venceuNaRolagem);
    if (venceuNaRolagem && !batalha.forcarDerrota && ataqueTotal < batalha.defesa) {
      run.vitoriasComDesvantagem = (run.vitoriasComDesvantagem || 0) + 1;
    }
    if (venceuNaRolagem && !batalha.forcarDerrota && rerrolagens > 0) {
      run.vitoriasComRerrolagem = (run.vitoriasComRerrolagem || 0) + 1;
    }
    if (venceu) run.batalhasVencidas = (run.batalhasVencidas || 0) + 1;
    run.ultimaBatalhaRodada = run.rodada;
    const desfecho = venceu ? batalha.vitoria : batalha.derrota;
    const danoBase = venceu
      ? 0
      : batalha.derrota.dano + (run.combatePendente?.tracoInimigo === "feroz" ? 6 : 0);
    const manto = temItem(run, "manto_de_folhas") ? (run.estacao === "inverno" ? 4 : 3) : 0;
    const escudoUsado = run.atributos.escudo + bonusEscudo + manto;
    const pendente = run.combatePendente;
    const bloqueioPreparadoAtivo =
      preparados.bloquearDanoProximaBatalha && !(pendente?.ehBoss && pendente.bloqueioChefeUsado);
    const bacamarteAtivo =
      (preparados.bacamarteBatalhas || 0) > 0 && !(pendente?.ehBoss && pendente.bacamarteChefeUsado);
    const danoAnulado = lancaAtiva || bloqueioPreparadoAtivo || bacamarteAtivo;
    const reducaoDivina = batalha.somenteEscudo ? 0 : Jogo.herdeiros.valorEfeito(run, "reducaoDano");
    const reducaoPassiva = batalha.somenteEscudo
      ? 0
      : (temItem(run, "cao_companheiro") ? 2 : 0) +
        (run.construcoes?.includes("muralha") ? 2 : 0) +
        (run.construcoes?.includes("torre_vigia") ? 3 : 0);
    const dano = danoAnulado ? 0 : Math.max(0, danoBase - escudoUsado - reducaoDivina - reducaoPassiva);
    let efeitos = aplicarBonusDeRecompensa(run, desfecho.efeitos || {});
    let danoHonraCulto = 0;
    if (danoAnulado && efeitos.hp < 0) efeitos = { ...efeitos, hp: 0 };
    let explosaoBacamarte = false;
    if (lancaAtiva && efeitos.honra < 0) efeitos = { ...efeitos, honra: 0 };
    let texto = desfecho.resultado;
    if (pendente?.ehBoss && pendente.turnosChefe > 0)
      texto += ` O confronto durou ${pendente.turnosChefe} turnos.`;
    if (lancaAtiva) {
      run.lancaHeroiBatalhas -= 1;
      texto += " A presença da Lança do Herói encerra o confronto sem ferimentos.";
    } else if (adagaAtiva && venceu) texto += " A Adaga amaldiçoada garante a vitória sem ferimentos.";
    if (preparados.bacamarteBatalhas > 0) {
      preparados.bacamarteBatalhas -= 1;
      texto +=
        pendente?.ehBoss && pendente.bacamarteChefeUsado
          ? " A carga preparada do bacamarte se esgota."
          : " A pólvora do bacamarte impede que você sofra dano.";
      if (preparados.bacamarteBatalhas === 0) {
        if (lancaAtiva || bloqueioPreparadoAtivo) {
          texto += " A última carga explode, mas a proteção ativa também impede esse ferimento.";
        } else {
          explosaoBacamarte = true;
          texto += " A última carga explode na sua mão: você perde 15 de Vida.";
        }
      }
    }
    if (run.flags.cinto_vento_ativo) {
      run.flags = { ...run.flags, cinto_vento_ativo: false };
      texto += " O Cinto dos ventos se desfaz depois de cumprir sua corrida.";
    }
    if (adagaAtiva && venceu && !lancaAtiva) {
      const curaDeVitoria = efeitos.hp || 0;
      danoHonraCulto += aplicarEfeitos(run, { ...efeitos, hp: 0 });
      if (curaDeVitoria !== 0) aplicarEfeitos(run, { hp: curaDeVitoria });
      aplicarEfeitos(run, { hp: -dano });
    } else {
      const hpDoDesfecho = efeitos.hp || 0;
      const hpDoDesfechoSemDanoBloqueado = danoAnulado && hpDoDesfecho < 0 ? 0 : hpDoDesfecho;
      danoHonraCulto += aplicarEfeitos(run, {
        ...efeitos,
        hp: hpDoDesfechoSemDanoBloqueado - dano,
      });
    }
    if (explosaoBacamarte) aplicarEfeitos(run, { hp: -15 });
    if (!venceu && !pendente?.ehBoss && (Jogo.eventoPorId(run.eventoId)?.letal || batalha.letal)) {
      run.atributos.hp = 0;
      texto += " A derrota neste confronto é fatal.";
    }
    run.efeitosPreparados = {
      ...run.efeitosPreparados,
      bloquearDanoProximaBatalha: false,
      bonusAtaqueProximaBatalha: 0,
      bonusDadosCombateProximaBatalha: 0,
      rerrolagensGratisProximaBatalha: 0,
      desvantagemInimigaProximaBatalha: false,
      bonusEscudoProximaBatalha: 0,
      bonusGoldProximaRecompensa: run.efeitosPreparados.bonusGoldProximaRecompensa || 0,
    };
    if (bonusAtaque) texto += ` Um bônus preparado aumenta seu Ataque em ${bonusAtaque} nesta batalha.`;
    if (bonusEscudo) texto += ` O elixir aumenta seu escudo em ${bonusEscudo} nesta batalha.`;
    if (bloqueioPreparadoAtivo) texto += " O amuleto anula o dano desta batalha.";
    if (!venceu && batalha.penalidadeFalha) {
      const efeitosFalha = {
        ...(run.cultoAtivo
          ? batalha.penalidadeFalha.efeitosCulto || batalha.penalidadeFalha.efeitos || {}
          : batalha.penalidadeFalha.efeitos || {}),
      };
      if (danoAnulado && efeitosFalha.hp < 0) efeitosFalha.hp = 0;
      danoHonraCulto += aplicarEfeitos(run, efeitosFalha, batalha.penalidadeFalha.multiplicadores, {
        semBonusSeguidores: true,
      });
      texto += ` ${batalha.penalidadeFalha.texto || ""}`;
    }
    return {
      texto: texto.trim(),
      danoHonraCulto,
      combate: {
        venceu,
        dano,
        escudo: escudoUsado,
        bonusAtaque,
        bonusEscudo,
        dadosHerdeiro,
        dadoHerdeiro,
        ataque: ataqueTotal,
        totalHerdeiro,
        dadosInimigo,
        dadoInimigo,
        defesa: defesaInimiga,
        totalInimigo,
        venceuNaRolagem,
        bonusResultado,
        tracoInimigo: run.combatePendente?.tracoInimigo || "",
        rerrolagens,
        danoAnulado: Boolean(danoAnulado),
        encerrarRun: !venceu && Boolean(batalha.encerrarAoFalhar),
        tipoVitoria: venceu ? batalha.tipoVitoria || null : null,
        motivoVitoria: venceu ? batalha.motivoVitoria || null : null,
        motivoFim: batalha.motivoFim || null,
      },
    };
  }

  function rendaDaVila(habitantes) {
    const regra = Jogo.config.economia;
    return habitantes < regra.habitantesParaManutencao
      ? -regra.perdaPorRodada
      : Math.floor(habitantes / regra.habitantesPorGold);
  }

  function rendaNaRodada(run, rodada) {
    const habitantes = run.atributos.habitantes;
    const rendaHabitantes = rendaDaVila(habitantes);
    const rendaPonte = run.construcoes.includes("ponte") && habitantes >= 20 ? 1 : 0;
    const base = rendaHabitantes + rendaPonte;
    const rendaRegular = base > 0 && rodada % Jogo.config.economia.intervaloRenda !== 0 ? 0 : base;
    const fontes = [];
    if (rendaRegular && rendaHabitantes)
      fontes.push({
        nome: rendaHabitantes < 0 ? "Manutenção dos habitantes" : "Renda dos habitantes",
        valor: rendaHabitantes,
      });
    if (rendaRegular && rendaPonte) fontes.push({ nome: "Ponte", valor: rendaPonte });
    if (run.construcoes.includes("mercado_coberto") && rodada % 5 === 0)
      fontes.push({ nome: "Mercado coberto", valor: 1 });
    if (run.construcoes.includes("praca_forca") && rodada % 6 === 0)
      fontes.push({ nome: "Praça da Forca", valor: 1 });
    const rodadaEntreposto = run.marcos?.entrepostoComercialRodada;
    if (
      run.construcoes.includes("entreposto_comercial") &&
      Number.isSafeInteger(rodadaEntreposto) &&
      rodada - rodadaEntreposto >= 2 &&
      (rodada - rodadaEntreposto) % 2 === 0
    )
      fontes.push({ nome: "Entreposto comercial", valor: 1 });
    return { rodada, fontes, total: fontes.reduce((total, fonte) => total + fonte.valor, 0) };
  }

  function preverRenda(run) {
    if (!run?.atributos || !Array.isArray(run.construcoes)) return { rodada: null, fontes: [], total: 0 };
    const inicio = run.rodada + (run.fase === "resultado" ? 1 : 0);
    for (let rodada = inicio; rodada < inicio + 31; rodada += 1) {
      const previsao = rendaNaRodada(run, rodada);
      if (previsao.fontes.length) return previsao;
    }
    return { rodada: null, fontes: [], total: 0 };
  }

  function precoMercadoria(run, mercadoria) {
    const compras = Object.hasOwn(run.comprasMercador, mercadoria.id)
      ? run.comprasMercador[mercadoria.id]
      : 0;
    const descontoForja = run.construcoes?.includes("forja") && mercadoria.id === "arma_melhor" ? 2 : 0;
    return Math.max(0, mercadoria.preco + (mercadoria.aumentoPreco || 0) * compras - descontoForja);
  }

  function podePagar(run, mercadoria) {
    const preco = precoMercadoria(run, mercadoria);
    return Number.isSafeInteger(preco) && preco >= 0 && run.atributos.gold >= preco;
  }

  function agendarConsequencia(run, agenda, evento, opcao) {
    if (!agenda?.eventoId) return;
    if (
      agenda.eventoId === "retorno_do_menino" &&
      (!run.flags?.orfao_acolhido ||
        run.flags?.retorno_do_menino_visto ||
        run.consequenciasAgendadas?.some((item) => item.eventoId === agenda.eventoId))
    )
      return;
    const minimo = Math.max(10, Math.floor(agenda.atrasoMin || 10));
    const maximo = Math.max(minimo, Math.floor(agenda.atrasoMax || 20));
    const atraso = minimo + Math.floor(Math.random() * (maximo - minimo + 1));
    run.consequenciasAgendadas ||= [];
    run.consequenciasAgendadas.push({
      id: `${run.id}:${evento.id}:${opcao.id}:${run.rodada}:${run.consequenciasAgendadas.length}`,
      eventoId: agenda.eventoId,
      rodada: run.rodada + atraso,
      origem: evento.id,
    });
  }

  function prepararResolucaoOpcao(run, evento, opcao, gasto = 0, rolagemCombate = null) {
    run.inventarioAberto = false;
    run.avisoInventario = null;
    const antes = { ...run.atributos, hpMax: run.hpMax };
    run.atributos.gold -= gasto;
    let efeitosEscolha = opcao.efeitos || {};
    let resultado = {
      texto: (run.cultoAtivo && opcao.resultadoCulto) || opcao.resultado || "",
      combate: null,
    };
    let desfechoEscolhido = null;
    let danoHonraCulto = 0;
    let sucessoCriticoDados = false;
    if (opcao.dueloDados) {
      const rolagemDuelo = rolagemCombate?.dueloDados || calcularDueloDados(opcao.dueloDados, rolarDado20(), rolarDado20());
      sucessoCriticoDados = rolagemDuelo.face === 20;
      const sucesso = rolagemDuelo.desfecho === "sucesso";
      const desfecho = sucesso ? opcao.dueloDados.sucesso : opcao.dueloDados.falha;
      desfechoEscolhido = desfecho;
      efeitosEscolha = { ...efeitosEscolha, ...(desfecho.efeitos || {}) };
      resultado = {
        texto: desfecho.resultado,
        combate: null,
        dueloDados: {
          dadoHerdeiro: rolagemDuelo.face,
          dadoOponente: rolagemDuelo.faceOponente,
          bonusOponente: rolagemDuelo.bonusOponente,
          totalHerdeiro: rolagemDuelo.face,
          totalOponente: rolagemDuelo.totalOponente,
          vencedor: sucesso ? "herdeiro" : "oponente",
        },
      };
    } else if (opcao.testeDados) {
      const rolagemTeste =
        rolagemCombate?.testeDados || calcularTesteDados(opcao.testeDados, rolarDado20());
      sucessoCriticoDados = rolagemTeste.face === 20;
      const desfecho = opcao.testeDados[rolagemTeste.desfecho];
      desfechoEscolhido = desfecho;
      efeitosEscolha = { ...efeitosEscolha, ...(desfecho.efeitos || {}) };
      resultado = {
        texto: desfecho.resultado,
        combate: null,
        testeDados: { ...rolagemTeste },
      };
    } else if (opcao.testeSorte) {
      const chance = opcao.testeSorte.fatalidadeAleatoria ? 100 : opcao.testeSorte.chance;
      const sucesso = Math.random() * 100 < chance;
      const desfecho = sucesso ? opcao.testeSorte.sucesso : opcao.testeSorte.falha;
      desfechoEscolhido = desfecho;
      efeitosEscolha = { ...efeitosEscolha, ...(desfecho.efeitos || {}) };
      resultado.texto = desfecho.resultado;
    }
    let vozPuneHonra;
    if (opcao.combate && evento.batalha) {
      resultado = resolverCombate(run, evento.batalha, rolagemCombate);
      danoHonraCulto = resultado.danoHonraCulto || 0;
      delete resultado.danoHonraCulto;
      const desfechoCombate = resultado.combate?.venceu ? evento.batalha.vitoria : evento.batalha.derrota;
      const honraCombate =
        (desfechoCombate?.efeitos?.honra || 0) +
        (!resultado.combate?.venceu ? evento.batalha.penalidadeFalha?.efeitos?.honra || 0 : 0);
      vozPuneHonra = run.condicao?.ativa === "possessao" && !run.condicao.abracada && honraCombate > 0;
      if (vozPuneHonra) aplicarEfeitos(run, { hp: -3 });
    } else {
      const honraEscolhida =
        (efeitosEscolha.honra || 0) +
        (opcao.definir?.honra !== undefined ? opcao.definir.honra - run.atributos.honra : 0);
      vozPuneHonra = run.condicao?.ativa === "possessao" && !run.condicao.abracada && honraEscolhida > 0;
      if (vozPuneHonra && !sucessoCriticoDados)
        efeitosEscolha = { ...efeitosEscolha, hp: (efeitosEscolha.hp || 0) - 3 };
    }

    return {
      run,
      evento,
      opcao,
      gasto,
      antes,
      efeitosEscolha,
      resultado,
      desfechoEscolhido,
      vozPuneHonra,
      danoHonraCulto,
      sucessoCriticoDados,
    };
  }

  function aplicarEfeitosBase(contexto) {
    const { run, evento, opcao, efeitosEscolha, desfechoEscolhido, resultado } = contexto;
    const efeitosOpcao = { ...aplicarBonusDeRecompensa(run, efeitosEscolha) };
    if (evento.id === "cura_critica") {
      efeitosOpcao.hp = Math.max(0, Math.ceil(run.hpMax * 0.7) - run.atributos.hp);
    }
    const populacaoAntesDoConsumo = run.cultoAtivo ? run.seguidoresCulto : run.atributos.habitantes;
    if (opcao.consumoVampirismo && run.cultoAtivo && (efeitosOpcao.habitantes || 0) < 0) {
      const perda = Math.min(opcao.consumoVampirismo, -efeitosOpcao.habitantes);
      efeitosOpcao.habitantes += perda;
      efeitosOpcao.seguidores = (efeitosOpcao.seguidores || 0) - perda;
      if (efeitosOpcao.habitantes === 0) delete efeitosOpcao.habitantes;
    }
    const protecaoCeleiro = evento.protecaoCeleiro && run.construcoes?.includes("celeiro");
    if (run.traco === "herdeiro_culto" && Number.isSafeInteger(opcao.definir?.honra)) {
      delete efeitosOpcao.honra;
    }
    contexto.danoHonraCulto =
      (contexto.danoHonraCulto || 0) +
      aplicarEfeitos(run, efeitosOpcao, opcao.multiplicadores, {
        protecaoCeleiro,
        anularDanoHp: contexto.sucessoCriticoDados,
      });
    if (opcao.consumoVampirismo) {
      const populacaoAtual = run.cultoAtivo ? run.seguidoresCulto : run.atributos.habitantes;
      registrarConsumoVampirismo(run, Math.max(0, populacaoAntesDoConsumo - populacaoAtual));
    }
    if (Number.isSafeInteger(opcao.sacrificarPopulacao) && opcao.sacrificarPopulacao > 0) {
      aplicarEfeitos(
        run,
        run.cultoAtivo
          ? { seguidores: -opcao.sacrificarPopulacao }
          : { habitantes: -opcao.sacrificarPopulacao },
        {},
        { semBonusSeguidores: true },
      );
    }
    for (const [atributo, valor] of Object.entries(opcao.definir || {})) {
      if (!Jogo.atributos.includes(atributo) || !Number.isSafeInteger(valor)) continue;
      if (atributo === "hp") {
        if (contexto.sucessoCriticoDados && valor < run.atributos.hp) continue;
        aplicarEfeitos(run, { hp: valor - run.atributos.hp });
        continue;
      }
      if (atributo === "honra") {
        const atual = run.atributos.honra;
        if (run.traco === "herdeiro_culto") {
          const ganhoHonra = Math.max(0, valor - atual);
          if (ganhoHonra > 0 && !contexto.sucessoCriticoDados) {
            aplicarEfeitos(run, { hp: -ganhoHonra });
            contexto.danoHonraCulto = (contexto.danoHonraCulto || 0) + ganhoHonra;
          }
          run.atributos.honra = Math.min(atual, valor, 0);
          run.honraSempreNeutra =
            run.honraSempreNeutra !== false && run.atributos.honra >= -29 && run.atributos.honra <= 29;
          continue;
        }
        // Definir honra também não pode derrubar a Heroína do povo nem levá-la a negativo.
        run.atributos.honra = honraImune(run)
          ? Math.max(atual, Math.max(0, valor))
          : temItem(run, "espada_da_verdade")
            ? 0
            : valor;
        continue;
      }
      run.atributos[atributo] =
        atributo === "habitantes"
          ? Jogo.herdeiros.perdaHabitantes(run, run.atributos.habitantes, Math.max(0, valor))
          : Math.max(0, valor);
    }
    if (opcao.efeitoContinuo?.revelarHonraRodadas > 0) {
      run.honraReveladaAteRodada = Math.max(
        run.honraReveladaAteRodada || 0,
        run.rodada + Math.floor(opcao.efeitoContinuo.revelarHonraRodadas),
      );
    }
    if (opcao.efeitoDivino?.revelarHonraRodadas > 0) {
      run.honraReveladaAteRodada = Math.max(
        run.honraReveladaAteRodada || 0,
        run.rodada + Math.max(0, Math.floor(opcao.efeitoDivino.revelarHonraRodadas) - 1),
      );
    }
    if (opcao.efeitoContinuo?.revelarHabitantesRodadas > 0) {
      run.habitantesReveladosAteRodada = Math.max(
        run.habitantesReveladosAteRodada || 0,
        run.rodada + Math.floor(opcao.efeitoContinuo.revelarHabitantesRodadas),
      );
    }
    if (opcao.efeitoDivino?.revelarHabitantesRodadas > 0) {
      run.habitantesReveladosAteRodada = Math.max(
        run.habitantesReveladosAteRodada || 0,
        run.rodada + Math.max(0, Math.floor(opcao.efeitoDivino.revelarHabitantesRodadas) - 1),
      );
    }
    if (opcao.efeitoDivino) {
      ativarEfeitoDivino(run, opcao.efeitoDivino);
      if (evento.divino) run.flags.efeito_nordico_recebido = true;
    }
    if (evento.zodiaco && ["aceitar", "oferenda"].includes(opcao.id))
      run.flags.bencao_zodiacal_recebida = true;
    if (run.encontroLeste && evento.zodiaco) {
      const visita = run.calendarioLeste.find((v) => v.eventoId === evento.id && !v.resolvida);
      if (visita) visita.resolvida = true;
    }
    if (opcao.efeitoContinuo?.seguidoresPorRodada > 0 && run.cultoAtivo) {
      run.cultoRendaPorRodada = Math.max(
        run.cultoRendaPorRodada || 0,
        opcao.efeitoContinuo.seguidoresPorRodada,
      );
    }
    if (opcao.dissolverCulto && run.cultoAtivo) {
      run.atributos.habitantes = Jogo.herdeiros.perdaHabitantes(
        run,
        run.atributos.habitantes,
        run.seguidoresCulto,
      );
      run.seguidoresCulto = 0;
      run.cultoAtivo = false;
      run.flags = { ...run.flags, culto_ativo: false };
      run.cultoRendaPorRodada = 0;
    }
    // Convite direto ao culto (o caminho da Heroína do povo, cuja honra nunca cai
    // o suficiente para acordar os gatilhos normais de `honra <= -30`).
    if (opcao.entrarNoCulto && !run.cultoAtivo && run.status === "ativa") {
      Jogo.herdeiros.iniciarCulto(run);
      aplicarEfeitos(run, { honra: -5 });
      run.marcos.cultoAdesao = run.rodada;
      run.marcos.culto_entrada_rodada = run.rodada;
      Jogo.legado.conceder(run, { flags: ["culto_conhecido"] });
      concederItem(run, "adaga_cerimonial");
    }
    run.flags = { ...run.flags, ...opcao.flags, ...desfechoEscolhido?.flags };
    aplicarPreparoCombate(run, opcao.prepararCombate);
    aplicarPreparoCombate(run, desfechoEscolhido?.prepararCombate);
    const preparosAleatorios = opcao.prepararCombateAleatorio || desfechoEscolhido?.prepararCombateAleatorio;
    if (Array.isArray(preparosAleatorios) && preparosAleatorios.length) {
      const escolhido = preparosAleatorios[Math.floor(Math.random() * preparosAleatorios.length)];
      aplicarPreparoCombate(run, escolhido?.efeitos);
      if (escolhido?.resultado) resultado.texto += ` ${escolhido.resultado}`;
    }
    if (opcao.iniciarRecargaItens?.length) {
      run.itensConsumidosEm ||= {};
      for (const itemId of opcao.iniciarRecargaItens) run.itensConsumidosEm[itemId] = run.rodada;
    }
    if (evento.marcaCondicaoDecidida) run.flags.condicao_decidida = true;
    const contagio = desfechoEscolhido?.condicaoAtivar || opcao.condicaoAtivar;
    if (contagio) ativarCondicao(run, contagio);
    for (const itemId of opcao.consumirItens || []) {
      const indice = run.inventario.indexOf(itemId);
      if (indice >= 0) consumirItem(run, itemId, indice);
    }
    if (opcao.abracarCondicao) abracarCondicao(run);
    if (opcao.curarCondicao || desfechoEscolhido?.curarCondicao) {
      curarCondicao(run, Boolean(opcao.curaUniversal || desfechoEscolhido?.curaUniversal));
    }
    if (
      opcao.efeitoTemporario &&
      Jogo.atributos.includes(opcao.efeitoTemporario.atributo) &&
      Number.isSafeInteger(opcao.efeitoTemporario.valor) &&
      Number.isSafeInteger(opcao.efeitoTemporario.rodadas)
    ) {
      run.efeitosTemporarios ||= [];
      run.efeitosTemporarios.push({
        atributo: opcao.efeitoTemporario.atributo,
        valor: opcao.efeitoTemporario.valor,
        inicioRodada: run.rodada + 1,
        fimRodada: run.rodada + Math.max(1, opcao.efeitoTemporario.rodadas),
        aplicado: false,
      });
    }
  }

  function aplicarPreparoCombate(run, efeitos) {
    if (!efeitos || typeof efeitos !== "object") return;
    const preparados = { ...(run.efeitosPreparados || {}) };
    for (const campo of [
      "bonusAtaqueProximaBatalha",
      "bonusDadosCombateProximaBatalha",
      "bonusEscudoProximaBatalha",
      "rerrolagensGratisProximaBatalha",
    ]) {
      if (!Number.isSafeInteger(efeitos[campo]) || efeitos[campo] < 1) continue;
      const limite =
        campo === "bonusDadosCombateProximaBatalha"
          ? 19
          : campo === "rerrolagensGratisProximaBatalha"
            ? 10
            : 100;
      preparados[campo] = Math.min(limite, (preparados[campo] || 0) + efeitos[campo]);
    }
    if (efeitos.desvantagemInimigaProximaBatalha === true)
      preparados.desvantagemInimigaProximaBatalha = true;
    run.efeitosPreparados = preparados;
  }

  function aplicarEfeitosEspeciais(contexto) {
    const { run, evento, opcao, antes, resultado, desfechoEscolhido, vozPuneHonra } = contexto;
    if (vozPuneHonra && !contexto.sucessoCriticoDados)
      resultado.texto += " A voz lhe tira 3 de Vida pela honra que sua escolha demonstra.";
    if (contexto.danoHonraCulto > 0 && !contexto.sucessoCriticoDados)
      resultado.texto += " A Honra que chega até você abre uma ferida.";
    if (evento.bossId && resultado.combate?.venceu) {
      const marca = {
        barao: "barao_derrotado",
        culto: "lider_culto_derrotado",
        entidade: "entidade_derrotada",
        abissal: "senhor_do_abismo_derrotado",
      }[evento.bossId];
      if (marca && !run.flags[marca]) {
        run.flags[marca] = true;
        Jogo.legado.conceder(run, { flags: [marca] });
        if (evento.bossId === "culto") {
          aplicarEfeitos(run, { gold: 10, honra: 5 });
          resultado.texto += " As cartas do culto deixam de aparecer. Você recebe 10 Gold.";
        } else if (evento.bossId === "entidade") {
          run.flags = {
            ...run.flags,
            entidade_x_ativa: false,
            entidade_x_resolvida: true,
            entidade_x_imune: true,
            entidades_maiores_liberadas: true,
          };
          concederItem(run, "selo_da_recusa");
          resultado.texto += " A Entidade não voltará a perseguir este herdeiro.";
        }
      }
    }
    if (opcao.consequenciaTardia) agendarConsequencia(run, opcao.consequenciaTardia, evento, opcao);
    if (opcao.entidadeXCeder || desfechoEscolhido?.entidadeXCeder) {
      run.flags = {
        ...run.flags,
        entidade_x_ativa: false,
        entidade_x_resolvida: true,
        entidade_x_pacto: true,
      };
      concederItem(run, "marca_da_entidade_x");
      resultado.texto +=
        " Você foi enganado; achou que seguir alguém assim iria te dar algo de bom. A Marca cobrará 1 ponto de Vida a cada rodada.";
    }
    if (desfechoEscolhido?.entidadeXResistiu) {
      run.flags = {
        ...run.flags,
        entidade_x_ativa: false,
        entidade_x_resolvida: true,
        entidade_x_imune: true,
        entidades_maiores_liberadas: true,
      };
      concederItem(run, "selo_da_recusa");
      resultado.texto +=
        " Você resistiu. A Entidade não poderá voltar nesta crônica. Um selo lendário permanece em sua mão.";
    }
    if (Array.isArray(opcao.construcoes))
      run.construcoes = [...new Set([...(run.construcoes || []), ...opcao.construcoes])];
    if (opcao.flags?.ponte_reparada) run.construcoes = [...new Set([...run.construcoes, "ponte"])];
    if (opcao.flags?.moinho_reparado) run.construcoes = [...new Set([...run.construcoes, "moinho"])];
    if (opcao.flags?.capela_erguida && !run.construcoes.includes("capela")) {
      run.construcoes.push("capela");
      aplicarEfeitos(run, { escudo: 1 });
    }
    if (evento.nemesis && run.nemesis) {
      run.nemesis.enfrentado = true;
      if (opcao.combate && run.atributos.hp > 0) {
        run.flags = { ...run.flags, nemesis_enfrentada_e_sobrevivida: true };
      }
    }
    if (evento.id === "volta_do_barao" && run.atributos.hp > 0) {
      run.flags = { ...run.flags, volta_barao_sobreviveu: true };
    }
    if (evento.consequenciaAgendada) {
      const agendamentoIndex = (run.consequenciasAgendadas || []).findIndex(
        (item) => item.eventoId === evento.id && item.rodada <= run.rodada,
      );
      if (agendamentoIndex >= 0) run.consequenciasAgendadas.splice(agendamentoIndex, 1);
    }
    if (evento.oncePerYear) {
      run.flags[`${evento.id}_ano_${Jogo.anoDaRodada(run.rodada)}_visto`] = true;
      run.flags[`${evento.id}_visto`] = true;
    }
    if (evento.letal || evento.oncePerRun) run.flags[`${evento.id}_visto`] = true;
    if (opcao.flags?.ano_novo_ativo) run.marcos.anoNovoBase = run.rodada;
    if (opcao.flags?.bencao_norte_ativa) run.marcos.norteAtivado = run.rodada;
    const marcos = Array.isArray(opcao.marcoRodada)
      ? opcao.marcoRodada
      : opcao.marcoRodada
        ? [opcao.marcoRodada]
        : [];
    for (const marco of marcos) {
      if (!marco.id || (marco.honraMin !== undefined && antes.honra < marco.honraMin)) continue;
      run.marcos = { ...run.marcos, [marco.id]: run.rodada };
      if (marco.flag) run.flags = { ...run.flags, [marco.flag]: true };
    }
    if (opcao.armadilha && Math.random() < opcao.armadilha.chance) {
      const itensRoubaveis = run.inventario.filter(
        (itemId) => !Jogo.itens.find((item) => item.id === itemId)?.imuneMimico,
      );
      const roubado =
        opcao.armadilha.perderItem && itensRoubaveis.length
          ? itensRoubaveis[Math.floor(Math.random() * itensRoubaveis.length)]
          : null;
      if (roubado) consumirItem(run, roubado, run.inventario.indexOf(roubado));
      if (!contexto.sucessoCriticoDados) aplicarEfeitos(run, { hp: -(opcao.armadilha.danoHp || 0) });
      const nomeRoubado = roubado ? Jogo.itens.find((item) => item.id === roubado)?.nome || "um item" : null;
      resultado.texto += contexto.sucessoCriticoDados
        ? ` O baú se revela uma criatura, mas você escapa da mordida${nomeRoubado ? `; ela engole ${nomeRoubado}` : ""}.`
        : ` O baú se revela uma criatura e morde sua mão: você perde ${opcao.armadilha.danoHp || 0} HP${nomeRoubado ? ` e ele engole ${nomeRoubado}` : ""}.`;
    }
    const desfechoCombate = resultado.combate
      ? resultado.combate.venceu
        ? evento.batalha.vitoria
        : evento.batalha.derrota
      : null;
    const itensRecompensa = [
      ...new Set([
        ...(opcao.itens || []),
        ...(desfechoEscolhido?.itens || []),
        ...(desfechoCombate?.itens || []),
      ]),
    ];
    for (const id of itensRecompensa) {
      if (id === "calice_sagrado" && run.inventario.includes(id)) {
        resultado.texto += " Você já carrega um Cálice Sagrado; não leva outro da capela.";
        continue;
      }
      if (!concederItem(run, id)) continue;
      const item = Jogo.itens.find((candidato) => candidato.id === id);
      if (item) resultado.texto = `${resultado.texto} Você recebe: ${item.nome}.`.trim();
    }
    if (opcao.recompensaItemGenerico) {
      const item = sortearItemGenerico(run);
      if (item && concederItem(run, item.id))
        resultado.texto =
          `${resultado.texto} Entre os objetos, você encontra ${item.nome}; ${item.descricao.toLowerCase()}`.trim();
    }
    if (opcao.recompensaItemEspecial) {
      const item = sortearItemEspecial(run);
      if (item && concederItem(run, item.id))
        resultado.texto = `${resultado.texto} Você recebe: ${item.nome}.`.trim();
    }
    if (!run.encontroLeste)
      run.honraNeutraSequencia =
        run.atributos.honra >= -30 && run.atributos.honra <= 30
          ? Math.min(200, (run.honraNeutraSequencia || 0) + 1)
          : 0;
    if (run.honraNeutraSequencia >= 200 && !run.legadoDaRun.itens.includes("espada_da_verdade")) {
      Jogo.legado.conceder(run, { itens: ["espada_da_verdade"] });
    }
    run.eventosRecentes = [...run.eventosRecentes, evento.id].slice(-Jogo.config.memoriaEventos);
    if (eventoComum(evento)) {
      run.eventosComunsRun ||= [];
      if (!run.eventosComunsRun.includes(evento.id)) run.eventosComunsRun.push(evento.id);
    }
    if (evento.conselheiro) run.conselhosRecentes = [...(run.conselhosRecentes || []), evento.id].slice(-5);
  }

  function calcularEconomia(contexto) {
    const { run, opcao, gasto, antes, resultado } = contexto;
    // A renda usa a população após a decisão e só é aplicada nesta resolução.
    const rendaBase =
      rendaDaVila(run.atributos.habitantes) +
      (run.construcoes.includes("ponte") && run.atributos.habitantes >= 20 ? 1 : 0);
    const rendaRegular =
      rendaBase > 0 && run.rodada % Jogo.config.economia.intervaloRenda !== 0 ? 0 : rendaBase;
    const rendaMercado = run.construcoes.includes("mercado_coberto") && run.rodada % 5 === 0 ? 1 : 0;
    const rendaPraca = run.construcoes.includes("praca_forca") && run.rodada % 6 === 0 ? 1 : 0;
    const rodadaEntreposto = run.marcos?.entrepostoComercialRodada;
    const rendaEntreposto =
      run.construcoes.includes("entreposto_comercial") &&
      Number.isSafeInteger(rodadaEntreposto) &&
      run.rodada - rodadaEntreposto >= 2 &&
      (run.rodada - rodadaEntreposto) % 2 === 0
        ? 1
        : 0;
    const extra = Boolean(run.encontroLeste);
    const renda = extra ? 0 : rendaRegular + rendaMercado + rendaPraca + rendaEntreposto;
    const saldoAntesDaRenda = run.atributos.gold;
    aplicarEfeitos(run, { gold: renda });
    if (!extra && rendaMercado) resultado.texto += " O Mercado coberto rende 1 Gold.";
    if (!extra && rendaPraca) resultado.texto += " A Praça da Forca rende 1 Gold.";
    if (!extra && rendaEntreposto) resultado.texto += " O Entreposto comercial rende 1 Gold.";
    const rodadaCisterna = run.marcos?.cisternaConstruidaRodada;
    const habitanteCisterna =
      run.construcoes.includes("cisterna_comunitaria") &&
      Number.isSafeInteger(rodadaCisterna) &&
      run.rodada - rodadaCisterna >= 3 &&
      (run.rodada - rodadaCisterna) % 3 === 0
        ? 1
        : 0;
    if (!extra && habitanteCisterna) {
      aplicarEfeitos(run, { habitantes: habitanteCisterna });
      resultado.texto += " A Cisterna comunitária acrescenta 1 Habitante.";
    }
    if (!extra && run.construcoes.includes("praca_forca") && run.rodada % 10 === 0) {
      if (!temItem(run, "espada_da_verdade")) {
        aplicarEfeitos(run, { honra: -1 });
        resultado.texto += " A Praça da Forca reduz sua Honra em 1.";
      }
      if (run.cultoAtivo) {
        aplicarEfeitos(run, { seguidores: 2 });
        resultado.texto += ` A Praça da Forca atrai ${temItem(run, "afogados_abencoados") && run.atributos.honra <= -90 ? 4 : 2} Seguidores para o culto.`;
      }
    }
    if (!extra) Jogo.druida?.registrarAno(run);
    Jogo.legado.conceder(run, opcao.desbloqueia);
    Jogo.legado.avaliar(run);
    run.fase = "resultado";
    run.ultimoResultado = {
      ...resultado,
      escolha: opcao.texto,
      economia: { renda, variacaoRenda: run.atributos.gold - saldoAntesDaRenda, gasto },
      alteracoes: Object.fromEntries(
        [...Jogo.atributos, "hpMax"].map((id) => [
          id,
          id === "hpMax" ? run.hpMax - antes.hpMax : run.atributos[id] - antes[id],
        ]),
      ),
    };
  }

  function verificarEncerramento(contexto) {
    const { run, opcao, antes, resultado, desfechoEscolhido } = contexto;
    if (
      !run.cultoAtivo &&
      run.atributos.hp > 0 &&
      run.atributos.habitantes <= 0 &&
      run.atributos.honra <= -30
    ) {
      aguardarDecisaoCulto(run);
    }
    atualizarCulto(run, antes, Boolean(run.encontroLeste));
    if (!run.encontroLeste) concluirRodadaEfeitoDivino(run);
    const motivo = motivoDerrota(run);
    // Um desfecho de sorte pode encerrar a run; senão, a própria opção pode fazer isso.
    const encerramento = desfechoEscolhido?.encerramento || opcao.encerramento;
    if (resultado.combate?.encerrarRun)
      encerrar(run, "derrota", resultado.combate.motivoFim || motivo || "A crônica chegou ao fim.");
    else if (resultado.combate?.venceu && resultado.combate.tipoVitoria)
      encerrar(
        run,
        resultado.combate.tipoVitoria,
        resultado.combate.motivoVitoria || "O herdeiro venceu um confronto decisivo.",
      );
    else if (encerramento)
      encerrar(run, encerramento.tipo || "derrota", encerramento.motivo || "A crônica chegou ao fim.");
    else if (motivo) encerrar(run, "derrota", motivo);
    return true;
  }

  function registrarEscolhaNaCronica(run, evento, opcao) {
    if (!run || !evento || !opcao || !run.ultimoResultado) return;
    run.historicoCronica ||= [];
    run.historicoCronica.push({
      rodada: run.rodada,
      eventoId: evento.id,
      evento: evento.titulo,
      escolha: opcao.texto,
      desfecho: run.ultimoResultado.texto,
    });
    run.historicoCronica = run.historicoCronica.slice(-Jogo.config.memoriaCronica);
  }

  function resolverOpcao(run, evento, opcao, gasto = 0, rolagemCombate = null) {
    const contexto = prepararResolucaoOpcao(run, evento, opcao, gasto, rolagemCombate);
    aplicarEfeitosBase(contexto);
    aplicarEfeitosEspeciais(contexto);
    Jogo.pressagios?.registrarDecisao(contexto);
    calcularEconomia(contexto);
    if (contexto.sucessoCriticoDados && run.atributos.hp < contexto.antes.hp) {
      run.atributos.hp = Math.min(run.hpMax, contexto.antes.hp);
      if (run.ultimoResultado)
        run.ultimoResultado.alteracoes.hp = run.atributos.hp - contexto.antes.hp;
    }
    const resolvida = verificarEncerramento(contexto);
    if (resolvida) registrarEscolhaNaCronica(run, evento, opcao);
    return resolvida;
  }

  function iniciarCombate(run, evento, opcao) {
    if (run.status !== "ativa" || run.fase !== "escolha" || !evento?.batalha || !opcao?.combate) return false;
    const coringa =
      run.traco === "coringa"
        ? Number.isInteger(run.debugFaceCoringa) && run.debugFaceCoringa >= 1 && run.debugFaceCoringa <= 6
          ? run.debugFaceCoringa
          : Math.floor(Math.random() * 6) + 1
        : 0;
    const tracoInimigo = evento.batalha.forcarDerrota
      ? ""
      : ["nenhum", "veloz", "cego", "feroz"].includes(run.debugTracoInimigo)
        ? run.debugTracoInimigo === "nenhum"
          ? ""
          : run.debugTracoInimigo
        : (() => {
            const sorteio = Math.random();
            return sorteio < 0.15 ? "veloz" : sorteio < 0.3 ? "cego" : sorteio < 0.4 ? "feroz" : "";
          })();
    run.fase = "combate";
    run.combatePendente = {
      eventoId: evento.id,
      opcaoId: opcao.id,
      etapa: "preparacao",
      dadosHerdeiro: [],
      dadosInimigo: [],
      rerrolagens: 0,
      rerrolagensGratis: Math.min(
        10,
        (run.efeitosPreparados?.rerrolagensGratisProximaBatalha || 0) +
          Number(run.flags.mao_do_destino_ativa === true),
      ),
      coringa,
      rerrolagemCoringa: coringa === 4 ? 1 : 0,
      tracoInimigo,
      dadoLascadoUsado: false,
      ...(evento.bossId
        ? {
            ehBoss: true,
            vidaChefe: evento.batalha.vidaMaxima || 100,
            vidaChefeMaxima: evento.batalha.vidaMaxima || 100,
            turnosChefe: 0,
            ultimaTrocaChefe: "",
            vidaChefeAntes: evento.batalha.vidaMaxima || 100,
            bloqueioChefeUsado: false,
            bacamarteChefeUsado: false,
          }
        : {}),
    };
    run.inventarioAberto = false;
    run.avisoInventario = null;
    run.ultimoResultado = null;
    return true;
  }

  function iniciarTesteDados(run, evento, opcao) {
    const ehTesteDados = Boolean(opcao?.testeDados);
    const ehDueloDados = Boolean(opcao?.dueloDados);
    if (
      run.status !== "ativa" ||
      run.fase !== "escolha" ||
      !evento ||
      ehTesteDados === ehDueloDados ||
      opcao.combate
    )
      return false;
    run.fase = "combate";
    run.combatePendente = {
      eventoId: evento.id,
      opcaoId: opcao.id,
      etapa: "preparacao",
      ehTesteDados,
      ehDueloDados,
      dadosHerdeiro: [],
      dadosInimigo: [],
      rerrolagens: 0,
      rerrolagensGratis: Math.min(
        10,
        (run.efeitosPreparados?.rerrolagensGratisProximaBatalha || 0) +
          Number(run.flags.mao_do_destino_ativa === true),
      ),
      coringa: 0,
      rerrolagemCoringa: 0,
      tracoInimigo: "",
      dadoLascadoUsado: false,
      rolagemTesteDados: null,
      rolagemDueloDados: null,
    };
    run.inventarioAberto = false;
    run.avisoInventario = null;
    run.ultimoResultado = null;
    return true;
  }

  function rolarCombate(run) {
    const pendente = run?.combatePendente;
    if (pendente?.ehTesteDados || pendente?.ehDueloDados) {
      const opcao = opcaoCombatePendente(run);
      const ehDueloDados = pendente.ehDueloDados === true;
      if (
        run?.status !== "ativa" ||
        run.fase !== "combate" ||
        pendente.etapa !== "preparacao" ||
        (ehDueloDados ? !opcao?.dueloDados : !opcao?.testeDados)
      )
        return false;
      const dados = rolarConjuntoHerdeiro(run, quantidadeDadosTesteDados(run));
      const face = Math.max(...dados);
      pendente.dadosHerdeiro = dados;
      if (ehDueloDados) {
        const faceOponente = rolarDado20();
        pendente.dadosInimigo = [faceOponente];
        pendente.rolagemDueloDados = calcularDueloDados(opcao.dueloDados, face, faceOponente);
      } else {
        pendente.dadosInimigo = [];
        pendente.rolagemTesteDados = calcularTesteDados(opcao.testeDados, face);
      }
      pendente.etapa = "resultado";
      pendente.rerrolagens = 0;
      registrarDadosNaturais(run, dados);
      return true;
    }
    const perfil = perfilCombate(run);
    if (run?.status !== "ativa" || run.fase !== "combate" || pendente?.etapa !== "preparacao" || !perfil)
      return false;
    if (pendente.ehBoss) pendente.vidaChefeAntes = pendente.vidaChefe;
    pendente.dadosHerdeiro = rolarConjuntoHerdeiro(run, perfil.dadosHerdeiro);
    pendente.dadosInimigo = rolarConjuntoDados(perfil.dadosInimigo);
    registrarDadosNaturais(run, pendente.dadosHerdeiro);
    pendente.etapa = "resultado";
    pendente.rerrolagens = 0;
    return true;
  }

  function rerrolarCombate(run) {
    const pendente = run?.combatePendente;
    const evento = Jogo.eventoPorId(run?.eventoId);
    if (pendente?.ehTesteDados || pendente?.ehDueloDados) {
      const opcao = opcaoCombatePendente(run);
      const ehDueloDados = pendente.ehDueloDados === true;
      if (
        run?.status !== "ativa" ||
        run.fase !== "combate" ||
        pendente.etapa !== "resultado" ||
        !pendente.dadosHerdeiro.length ||
        (ehDueloDados ? !opcao?.dueloDados || pendente.dadosInimigo.length !== 1 : !opcao?.testeDados)
      )
        return false;
      const dados = rolarConjuntoHerdeiro(run, pendente.dadosHerdeiro.length);
      const face = Math.max(...dados);
      pendente.dadosHerdeiro = dados;
      if (ehDueloDados)
        pendente.rolagemDueloDados = calcularDueloDados(opcao.dueloDados, face, pendente.dadosInimigo[0]);
      else pendente.rolagemTesteDados = calcularTesteDados(opcao.testeDados, face);
      pendente.rerrolagens = (pendente.rerrolagens || 0) + 1;
      registrarDadosNaturais(run, dados);
      return true;
    }
    const perfil = perfilCombate(run);
    if (
      run?.status !== "ativa" ||
      run.fase !== "combate" ||
      pendente?.etapa !== "resultado" ||
      !perfil ||
      evento?.batalha?.forcarDerrota
    )
      return false;
    pendente.dadosHerdeiro = rolarConjuntoHerdeiro(run, perfil.dadosHerdeiro);
    registrarDadosNaturais(run, pendente.dadosHerdeiro);
    pendente.rerrolagens = (pendente.rerrolagens || 0) + 1;
    return true;
  }

  function opcaoCombatePendente(run) {
    const evento = Jogo.eventoPorId(run?.eventoId);
    const catalogo = evento && catalogoOpcoes(evento, run);
    return catalogo?.find((opcao) => opcao.id === run.combatePendente?.opcaoId);
  }

  function resolverTurnoChefe(run, evento, opcao, rolagem) {
    const pendente = run.combatePendente;
    const batalha = evento.batalha;
    const perfil = perfilCombate(run);
    const dadoHerdeiro = Math.max(...rolagem.dadosHerdeiro);
    const dadoInimigo = perfil.inimigoEscolheMenor
      ? Math.min(...rolagem.dadosInimigo)
      : Math.max(...rolagem.dadosInimigo);
    const totalHerdeiro = dadoHerdeiro + perfil.ataque + perfil.bonusResultado;
    const totalInimigo = dadoInimigo + perfil.defesa;
    const venceuNaRolagem =
      perfil.tracoInimigo === "veloz" ? totalHerdeiro > totalInimigo : totalHerdeiro >= totalInimigo;
    const venceu = !perfil.batalha.forcarDerrota && venceuNaRolagem;
    const vidaChefeAntes = pendente.vidaChefe;
    pendente.turnosChefe += 1;

    if (venceu) {
      const danoChefe = Math.max(1, perfil.batalha.danoPorAcerto || batalha.danoPorAcerto || 25);
      pendente.vidaChefe = Math.max(0, pendente.vidaChefe - danoChefe);
      pendente.vidaChefeAntes = vidaChefeAntes;
      pendente.ultimaTrocaChefe = `Acerto: ${danoChefe} de dano ao chefe. Vida do chefe: ${pendente.vidaChefe}/${pendente.vidaChefeMaxima}.`;
      if (pendente.vidaChefe === 0) pendente.etapa = "desfecho";
      else {
        pendente.etapa = "preparacao";
        pendente.dadosHerdeiro = [];
        pendente.dadosInimigo = [];
        pendente.rerrolagens = 0;
      }
      return true;
    }

    const preparados = run.efeitosPreparados || {};
    const danoBase =
      perfil.batalha.derrota.dano + (pendente.tracoInimigo === "feroz" ? 6 : 0);
    const manto = temItem(run, "manto_de_folhas") ? (run.estacao === "inverno" ? 4 : 3) : 0;
    const escudo = run.atributos.escudo + (preparados.bonusEscudoProximaBatalha || 0) + manto;
    const reducaoDivina = perfil.batalha.somenteEscudo
      ? 0
      : Jogo.herdeiros.valorEfeito(run, "reducaoDano");
    const reducaoPassiva = perfil.batalha.somenteEscudo
      ? 0
      : (temItem(run, "cao_companheiro") ? 2 : 0) +
        (run.construcoes?.includes("muralha") ? 2 : 0) +
        (run.construcoes?.includes("torre_vigia") ? 3 : 0);
    const bloqueioDisponivel =
      preparados.bloquearDanoProximaBatalha && !pendente.bloqueioChefeUsado;
    const bacamarteDisponivel =
      (preparados.bacamarteBatalhas || 0) > 0 && !pendente.bacamarteChefeUsado;
    const dano = bloqueioDisponivel || bacamarteDisponivel
      ? 0
      : Math.max(0, danoBase - escudo - reducaoDivina - reducaoPassiva);
    if (bloqueioDisponivel) pendente.bloqueioChefeUsado = true;
    if (bacamarteDisponivel) pendente.bacamarteChefeUsado = true;
    const hpAntes = run.atributos.hp;
    if (hpAntes - dano <= 0) {
      run.fase = "escolha";
      const resolvida = resolverOpcao(run, evento, opcao, 0, rolagem);
      run.combatePendente = null;
      return resolvida;
    }

    aplicarEfeitos(run, { hp: -dano });
    const danoTexto = dano
      ? `Você sofre ${dano} de dano; sua Vida fica em ${run.atributos.hp}.`
      : bloqueioDisponivel || bacamarteDisponivel
        ? "Sua proteção anula o golpe do chefe."
        : "O golpe do chefe não atravessa sua defesa.";
    pendente.vidaChefeAntes = vidaChefeAntes;
    pendente.ultimaTrocaChefe = `Contra-ataque: ${danoTexto}`;
    pendente.etapa = "preparacao";
    pendente.dadosHerdeiro = [];
    pendente.dadosInimigo = [];
    pendente.rerrolagens = 0;
    return true;
  }

  function continuarCombate(run) {
    const pendente = run?.combatePendente;
    if (
      run?.status !== "ativa" ||
      run.fase !== "combate" ||
      !["resultado", "desfecho"].includes(pendente?.etapa) ||
      pendente.eventoId !== run.eventoId
    )
      return false;
    const evento = Jogo.eventoPorId(run.eventoId);
    const opcao = opcaoCombatePendente(run);
    if (pendente.ehTesteDados || pendente.ehDueloDados) {
      const ehDueloDados = pendente.ehDueloDados === true;
      if (
        pendente.etapa !== "resultado" ||
        (ehDueloDados ? !opcao?.dueloDados || !pendente.rolagemDueloDados || pendente.dadosInimigo.length !== 1 : !opcao?.testeDados || !pendente.rolagemTesteDados) ||
        !pendente.dadosHerdeiro.length ||
        (ehDueloDados ? pendente.rolagemDueloDados.face : pendente.rolagemTesteDados.face) !==
          Math.max(...pendente.dadosHerdeiro)
      )
        return false;
      const rolagem = ehDueloDados
        ? { dueloDados: { ...pendente.rolagemDueloDados } }
        : { testeDados: { ...pendente.rolagemTesteDados } };
      run.fase = "escolha";
      run.inventarioAberto = false;
      run.avisoInventario = null;
      const resolvida = resolverOpcao(run, evento, opcao, 0, rolagem);
      run.combatePendente = null;
      if (!resolvida) return false;
      if (run.status !== "encerrada" && !run.aguardaDecisaoCulto) avancar(run);
      return true;
    }
    if (!evento?.batalha || !opcao?.combate) return false;
    if (pendente.ehBoss && pendente.etapa === "resultado") {
      const rolagem = {
        dadosHerdeiro: [...pendente.dadosHerdeiro],
        dadosInimigo: [...pendente.dadosInimigo],
        rerrolagens: pendente.rerrolagens || 0,
      };
      return resolverTurnoChefe(run, evento, opcao, rolagem);
    }
    const rolagem = {
      dadosHerdeiro: [...pendente.dadosHerdeiro],
      dadosInimigo: [...pendente.dadosInimigo],
      rerrolagens: pendente.rerrolagens || 0,
    };
    run.fase = "escolha";
    run.inventarioAberto = false;
    run.avisoInventario = null;
    const resolvida = resolverOpcao(run, evento, opcao, 0, rolagem);
    run.combatePendente = null;
    return resolvida;
  }

  function rerrolarCombateGratuito(run) {
    const pendente = run?.combatePendente;
    const ehDisputaDados = pendente?.ehTesteDados === true || pendente?.ehDueloDados === true;
    if (
      run.status !== "ativa" ||
      run.fase !== "combate" ||
      pendente?.etapa !== "resultado" ||
      !(pendente.rerrolagensGratis > 0 || pendente.rerrolagemCoringa === 1) ||
      (!ehDisputaDados && Jogo.eventoPorId(run.eventoId)?.batalha?.forcarDerrota)
    )
      return false;
    if (ehDisputaDados) {
      const opcao = opcaoCombatePendente(run);
      const ehDueloDados = pendente.ehDueloDados === true;
      if (
        (ehDueloDados ? !opcao?.dueloDados || pendente.dadosInimigo.length !== 1 : !opcao?.testeDados) ||
        !pendente.dadosHerdeiro.length
      )
        return false;
      const dados = rolarConjuntoHerdeiro(run, pendente.dadosHerdeiro.length);
      const face = Math.max(...dados);
      pendente.dadosHerdeiro = dados;
      if (ehDueloDados)
        pendente.rolagemDueloDados = calcularDueloDados(opcao.dueloDados, face, pendente.dadosInimigo[0]);
      else pendente.rolagemTesteDados = calcularTesteDados(opcao.testeDados, face);
      registrarDadosNaturais(run, dados);
      if (pendente.rerrolagensGratis > 0) pendente.rerrolagensGratis -= 1;
      else pendente.rerrolagemCoringa = 0;
      pendente.rerrolagens += 1;
      return true;
    }
    pendente.dadosHerdeiro = rolarConjuntoHerdeiro(run, pendente.dadosHerdeiro.length);
    registrarDadosNaturais(run, pendente.dadosHerdeiro);
    if (pendente.rerrolagensGratis > 0) pendente.rerrolagensGratis -= 1;
    else pendente.rerrolagemCoringa = 0;
    pendente.rerrolagens += 1;
    return true;
  }

  function rerrolarMenorDadoCombate(run) {
    const pendente = run?.combatePendente;
    if (
      run?.status !== "ativa" ||
      run.fase !== "combate" ||
      pendente?.etapa !== "resultado" ||
      pendente.dadoLascadoUsado ||
      !temItem(run, "dado_lascado") ||
      Jogo.eventoPorId(run.eventoId)?.batalha?.forcarDerrota
    )
      return false;
    const ehDisputaDados = pendente.ehTesteDados === true || pendente.ehDueloDados === true;
    const ehDueloDados = pendente.ehDueloDados === true;
    const opcao = ehDisputaDados ? opcaoCombatePendente(run) : null;
    if (
      ehDisputaDados &&
      ((ehDueloDados ? !opcao?.dueloDados || pendente.dadosInimigo.length !== 1 : !opcao?.testeDados) ||
        !pendente.dadosHerdeiro.length)
    )
      return false;
    const indiceMenor = pendente.dadosHerdeiro.indexOf(Math.min(...pendente.dadosHerdeiro));
    pendente.dadosHerdeiro[indiceMenor] = rolarDadoHerdeiro(run);
    if (ehDueloDados)
      pendente.rolagemDueloDados = calcularDueloDados(
        opcao.dueloDados,
        Math.max(...pendente.dadosHerdeiro),
        pendente.dadosInimigo[0],
      );
    else if (pendente.ehTesteDados)
      pendente.rolagemTesteDados = calcularTesteDados(opcao.testeDados, Math.max(...pendente.dadosHerdeiro));
    registrarDadosNaturais(run, [pendente.dadosHerdeiro[indiceMenor]]);
    pendente.dadoLascadoUsado = true;
    pendente.rerrolagens += 1;
    return true;
  }

  function escolher(run, opcaoId) {
    if (run?.status !== "ativa") return false;
    if (Jogo.pressagios?.bloqueia(run)) return false;
    if (run.aguardaDecisaoCulto && run.fase === "resultado") {
      if (opcaoId === "juntar") return juntarCulto(run);
      if (opcaoId === "encerrar") return encerrarSemCulto(run);
      return false;
    }
    if (run.fase !== "escolha") return false;
    const evento = Jogo.eventoPorId(run.eventoId);
    const opcao = evento && opcoes(evento, run).find((opcao) => opcao.id === opcaoId);
    if (opcao?.entidadeXRecusa && evento.id === run.marcos.entidadeXRecusaFatalId) {
      const confronto = Jogo.eventoPorId("entidade_x_confronto");
      if (!confronto) return false;
      registrarSorteio(run, confronto);
      return iniciarCombate(run, confronto, confronto.opcoes[0]);
    }
    if (opcao?.combate && evento?.batalha) return iniciarCombate(run, evento, opcao);
    if (opcao?.testeDados || opcao?.dueloDados) return iniciarTesteDados(run, evento, opcao);
    return opcao ? resolverOpcao(run, evento, opcao) : false;
  }

  function comprar(run, mercadoriaId) {
    if (Jogo.pressagios?.bloqueia(run)) return false;
    if (run.status !== "ativa" || run.fase !== "escolha") return false;
    const evento = Jogo.eventoPorId(run.eventoId);
    const mercadoria = evento?.mercadorias?.find((item) => item.id === mercadoriaId);
    const item =
      !mercadoria && run.ofertaMercador === mercadoriaId
        ? Jogo.itens.find((item) => item.id === mercadoriaId && item.mercador)
        : null;
    const oferta = mercadoria || item;
    if (!oferta || !cumpre(oferta.requisitos, run) || !podePagar(run, oferta)) return false;
    const preco = precoMercadoria(run, oferta);
    const compras = Object.hasOwn(run.comprasMercador, oferta.id) ? run.comprasMercador[oferta.id] : 0;
    run.comprasMercador = { ...run.comprasMercador, [oferta.id]: compras + 1 };
    run.mercadoriasCompradas ||= [];
    if (!run.mercadoriasCompradas.includes(oferta.id)) run.mercadoriasCompradas.push(oferta.id);
    if (item) {
      registrarItemConquistado(run, item.id);
      run.inventario.push(item.id);
      registrarItemRecebido(run, item.id);
      return resolverOpcao(
        run,
        evento,
        {
          texto: `Comprar ${item.nome}.`,
          resultado: `${item.nome} guardado no inventário. Você poderá usá-lo quando decidir.`,
        },
        preco,
      );
    }
    return resolverOpcao(run, evento, mercadoria, preco);
  }

  function concluirUsoDeItem(run) {
    const motivo = motivoDerrota(run);
    if (motivo) {
      encerrar(run, "derrota", motivo);
      if (run.fase === "combate") {
        run.fase = "escolha";
        run.combatePendente = null;
      }
    }
    return true;
  }

  function usarItemBosqueSagrado({ run, itemId, indice }) {
    if (!Jogo.druida?.plantarBosque(run)) return false;
    consumirItem(run, itemId, indice);
    run.flags[`usou_${itemId}`] = true;
    if (run.ultimoResultado)
      run.ultimoResultado.texto += " Você planta a semente. O bosque sagrado permanecerá nesta crônica.";
    return true;
  }

  function usarItemCurarCondicao({ run, item, indice, escudoDaFe, uso }) {
    const antes = { ...run.atributos };
    registrarUsoComRecarga(run, item, indice, escudoDaFe);
    if (uso.efeitos) aplicarEfeitos(run, uso.efeitos);
    const curou = curarCondicao(run, Boolean(uso.curaUniversal));
    if (run.fase === "resultado" && run.ultimoResultado) {
      const recuperacao = uso.efeitos?.hp ? `recupera ${uso.efeitos.hp} de Vida` : "";
      const cura = curou ? "remove a condição sobrenatural" : "";
      const descricao = [recuperacao, cura].filter(Boolean).join(" e ");
      if (descricao) run.ultimoResultado.texto += ` ${item.nome} ${descricao}.`;
      for (const atributo of Jogo.atributos) {
        run.ultimoResultado.alteracoes[atributo] += run.atributos[atributo] - antes[atributo];
      }
    }
    return concluirUsoDeItem(run);
  }

  function usarAdagaCerimonial({ run, itemId, indice, alvoSacrificio }) {
    if (!["habitantes", "culto"].includes(alvoSacrificio)) return false;
    const antes = { ...run.atributos };
    consumirItem(run, itemId, indice);
    const especial = run.traco === "herdeiro_culto" && alvoSacrificio === "culto";
    if (alvoSacrificio === "culto") run.seguidoresCulto -= especial ? 5 : 10;
    else aplicarEfeitos(run, { habitantes: -10 });
    aplicarEfeitos(run, { ataque: 10, escudo: especial ? 5 : 0 });
    if (especial) run.flags.adaga_herdeiro_culto = true;
    run.flags.adaga_cerimonial_usada = true;
    Jogo.legado.avaliar(run);
    const textoUso = especial
      ? "A Adaga cerimonial consome 5 seguidores; seu Ataque aumenta em 10 e seu Escudo em 5."
      : alvoSacrificio === "culto"
        ? "A Adaga cerimonial consome dez seguidores; seu Ataque aumenta em 10."
        : run.traco === "herdeiro_culto"
          ? "A Adaga cerimonial consome cinco habitantes; seu Ataque aumenta em 10."
          : "A Adaga cerimonial consome dez habitantes; seu Ataque aumenta em 10.";
    if (run.fase === "resultado" && run.ultimoResultado) {
      run.ultimoResultado.texto += ` ${textoUso}`;
      for (const atributo of Jogo.atributos) {
        run.ultimoResultado.alteracoes[atributo] += run.atributos[atributo] - antes[atributo];
      }
    }
    if (
      !run.cultoAtivo &&
      run.atributos.habitantes <= 0 &&
      run.atributos.honra <= -30 &&
      run.atributos.hp > 0
    ) {
      if (run.fase === "escolha") {
        run.fase = "resultado";
        run.ultimoResultado = {
          texto: textoUso,
          escolha: "Usar a Adaga cerimonial.",
          combate: null,
          alteracoes: Object.fromEntries(
            Jogo.atributos.map((atributo) => [atributo, run.atributos[atributo] - antes[atributo]]),
          ),
        };
      }
      aguardarDecisaoCulto(run);
      if (run.ultimoResultado) run.ultimoResultado.texto = "O último habitante se foi.";
    }
    return concluirUsoDeItem(run);
  }

  function usarTomoEsquecimento({ run, itemId, indice }) {
    consumirItem(run, itemId, indice);
    run.flags = { ...run.flags, usou_tomo_do_esquecimento: true };
    aplicarEfeitos(run, { habitantes: 10, honra: -10, hp: -10 });
    if (run.ultimoResultado)
      run.ultimoResultado.texto +=
        " O Tomo converte dez soldados inimigos; dez habitantes se juntam à vila, mas você perde 10 de Honra e 10 de Vida.";
    return concluirUsoDeItem(run);
  }

  function usarCajadoDaDor({ run, itemId, indice }) {
    consumirItem(run, itemId, indice);
    run.flags = { ...run.flags, usou_cajado_da_dor: true };
    const metade = Math.ceil(run.atributos.hp / 2);
    aplicarEfeitos(run, { hp: -metade, hpMax: 20 });
    if (run.ultimoResultado)
      run.ultimoResultado.texto += ` O Cajado consome metade da sua Vida atual (${metade}) e aumenta sua Vida máxima em 20.`;
    return concluirUsoDeItem(run);
  }

  function usarBacamarte({ run, itemId, indice }) {
    consumirItem(run, itemId, indice);
    run.flags = { ...run.flags, usou_bacamarte: true };
    run.efeitosPreparados.bacamarteBatalhas = 3;
    return true;
  }

  function usarCintoDosVentos({ run, itemId, indice }) {
    consumirItem(run, itemId, indice);
    run.flags = { ...run.flags, cinto_vento_ativo: true, usou_cinto_dos_ventos: true };
    run.efeitosPreparados.bonusAtaqueProximaBatalha += 100;
    return true;
  }

  function usarItemComSacrificioDeHabitantes({ run, item, indice, escudoDaFe, uso }) {
    const antes = { ...run.atributos };
    registrarUsoComRecarga(run, item, indice, escudoDaFe);
    aplicarEfeitos(run, { habitantes: -uso.sacrificarHabitantes });
    if (uso.efeitos) aplicarEfeitos(run, uso.efeitos);
    if (run.fase === "resultado" && run.ultimoResultado) {
      run.ultimoResultado.texto += ` A mordida mata ${uso.sacrificarHabitantes === 1 ? "um aldeão" : `${uso.sacrificarHabitantes} aldeões`} e recupera ${uso.efeitos?.hp || 0} de Vida.`;
      for (const atributo of Jogo.atributos)
        run.ultimoResultado.alteracoes[atributo] += run.atributos[atributo] - antes[atributo];
    }
    return concluirUsoDeItem(run);
  }

  function usarItemComSacrificioDePopulacao({ run, item, _itemId, indice, escudoDaFe, uso }) {
    const populacaoAntesDoConsumo = run.cultoAtivo ? run.seguidoresCulto : run.atributos.habitantes;
    registrarUsoComRecarga(run, item, indice, escudoDaFe);
    aplicarEfeitos(
      run,
      run.cultoAtivo ? { seguidores: -uso.sacrificarPopulacao } : { habitantes: -uso.sacrificarPopulacao },
      {},
      { semBonusSeguidores: true },
    );
    if (uso.consumoVampirismo) {
      const populacaoAtual = run.cultoAtivo ? run.seguidoresCulto : run.atributos.habitantes;
      registrarConsumoVampirismo(run, Math.max(0, populacaoAntesDoConsumo - populacaoAtual));
    }
    if (uso.efeitos) aplicarEfeitos(run, uso.efeitos);
    run.efeitosPreparados.bonusAtaqueProximaBatalha += uso.bonusAtaqueProximaBatalha || 0;
    return concluirUsoDeItem(run);
  }

  function usarItemPadrao({ run, item, itemId, indice, escudoDaFe, uso }) {
    if (uso.umaVezPorRun) {
      consumirItem(run, itemId, indice);
      run.flags = { ...run.flags, [`usou_${itemId}`]: true };
    } else registrarUsoComRecarga(run, item, indice, escudoDaFe);
    if (uso.efeitos) aplicarEfeitos(run, uso.efeitos);
    const preparados = run.efeitosPreparados || {};
    run.efeitosPreparados = {
      bloquearDanoProximaBatalha:
        preparados.bloquearDanoProximaBatalha || Boolean(uso.bloquearDanoProximaBatalha),
      bonusAtaqueProximaBatalha:
        (preparados.bonusAtaqueProximaBatalha || 0) + (uso.bonusAtaqueProximaBatalha || 0),
      bonusDadosCombateProximaBatalha: Math.min(
        19,
        (preparados.bonusDadosCombateProximaBatalha || 0) + (uso.bonusDadosCombateProximaBatalha || 0),
      ),
      rerrolagensGratisProximaBatalha: preparados.rerrolagensGratisProximaBatalha || 0,
      desvantagemInimigaProximaBatalha: preparados.desvantagemInimigaProximaBatalha === true,
      bonusEscudoProximaBatalha:
        (preparados.bonusEscudoProximaBatalha || 0) + (uso.bonusEscudoProximaBatalha || 0),
      bonusGoldProximaRecompensa:
        (preparados.bonusGoldProximaRecompensa || 0) + (uso.bonusGoldProximaRecompensa || 0),
      bacamarteBatalhas: preparados.bacamarteBatalhas || 0,
      escudoFeCooldown: preparados.escudoFeCooldown || 0,
    };
    return concluirUsoDeItem(run);
  }

  function usarRerrolagemCombate({ run, item, indice, escudoDaFe, uso }) {
    if (!rerrolarCombate(run)) return false;
    if (uso.umaVezPorRun) {
      consumirItem(run, item.id, indice);
      run.flags = { ...run.flags, [`usou_${item.id}`]: true };
    } else registrarUsoComRecarga(run, item, indice, escudoDaFe);
    run.avisoInventario = `${item.nome}: o novo conjunto substitui a rolagem anterior.`;
    return concluirUsoDeItem(run);
  }

  function usarRerrolagemMenorDado({ run, item }) {
    if (!rerrolarMenorDadoCombate(run)) return false;
    run.avisoInventario = `${item.nome}: a menor face foi rolada novamente.`;
    return true;
  }

  function usarItem(run, itemId, alvoSacrificio = null) {
    if (run?.status !== "ativa" || !Array.isArray(run.inventario)) return false;
    const item = Jogo.itens.find((item) => item.id === itemId);
    const indice = run.inventario.indexOf(itemId);
    if (!item || indice < 0 || !item.uso || !podeUsarItem(run, itemId, alvoSacrificio)) return false;
    const uso = item.uso;
    const escudoDaFe =
      itemId !== "adaga_cerimonial" &&
      temItem(run, "escudo_da_fe") &&
      !uso.umaVezPorRun &&
      !uso.ignorarEscudoDaFe;
    const contexto = { run, item, itemId, indice, alvoSacrificio, uso, escudoDaFe };
    const handlers = [
      [uso.rerrolarCombate, usarRerrolagemCombate],
      [uso.rerrolarMenorDadoCombate, usarRerrolagemMenorDado],
      [uso.bosqueSagrado, usarItemBosqueSagrado],
      [uso.curarCondicao, usarItemCurarCondicao],
      [itemId === "adaga_cerimonial", usarAdagaCerimonial],
      [uso.tomoEsquecimento, usarTomoEsquecimento],
      [uso.cajadoDaDor, usarCajadoDaDor],
      [uso.bacamarte, usarBacamarte],
      [uso.cintoDosVentos, usarCintoDosVentos],
      [uso.sacrificarHabitantes, usarItemComSacrificioDeHabitantes],
      [uso.sacrificarPopulacao, usarItemComSacrificioDePopulacao],
    ];
    const handler = handlers.find(([corresponde]) => corresponde)?.[1] || usarItemPadrao;
    return handler(contexto);
  }

  function podeUsarItem(run, itemId, alvoSacrificio = null) {
    if (Jogo.pressagios?.bloqueia(run)) return false;
    if (run?.status !== "ativa" || !["escolha", "resultado", "combate"].includes(run.fase)) return false;
    const item = Jogo.itens.find((item) => item.id === itemId);
    if (!item?.uso || !run?.inventario?.includes(itemId)) return false;
    if (item.uso.rerrolarCombate && !(run.fase === "combate" && run.combatePendente?.etapa === "resultado"))
      return false;
    if (
      item.uso.rerrolarMenorDadoCombate &&
      (run.fase !== "combate" ||
        run.combatePendente?.etapa !== "resultado" ||
        run.combatePendente.dadoLascadoUsado)
    )
      return false;
    if (run.fase === "combate") {
      const batalhaAtual = Jogo.eventoPorId(run.eventoId)?.batalha;
      const etapa = run.combatePendente?.etapa;
      const itemDePreparacao =
        etapa === "preparacao" &&
        !batalhaAtual?.forcarDerrota &&
        (run.combatePendente?.ehTesteDados || run.combatePendente?.ehDueloDados
          ? Boolean(item.uso.bonusDadosCombateProximaBatalha)
          : itemId === "adaga_cerimonial" ||
            item.uso.tomoEsquecimento ||
            item.uso.bacamarte ||
            item.uso.bonusAtaqueProximaBatalha ||
            item.uso.bonusDadosCombateProximaBatalha ||
            item.uso.bonusEscudoProximaBatalha ||
            item.uso.bloquearDanoProximaBatalha);
      const itemDeRerrolagem =
        etapa === "resultado" &&
        !batalhaAtual?.forcarDerrota &&
        Boolean(item.uso.rerrolarCombate || item.uso.rerrolarMenorDadoCombate);
      if (!itemDePreparacao && !itemDeRerrolagem) return false;
    }
    if (item.uso.condicaoAtiva && run.condicao?.ativa !== item.uso.condicaoAtiva) return false;
    if (item.uso.bloquearSeAbracada && run.condicao?.abracada) return false;
    if (itemId === "adaga_cerimonial") {
      if (run.aguardaDecisaoCulto || run.flags.adaga_cerimonial_usada) return false;
      const habitantes = run.atributos.habitantes >= (run.traco === "herdeiro_culto" ? 5 : 10);
      const seguidores = run.cultoAtivo && run.seguidoresCulto >= (run.traco === "herdeiro_culto" ? 5 : 10);
      const iniciaCultoNoFimDaPopulacao =
        run.fase === "combate" &&
        alvoSacrificio === "habitantes" &&
        run.atributos.habitantes <= 10 &&
        run.atributos.honra <= -30 &&
        run.atributos.hp > 0;
      if (alvoSacrificio === "habitantes") return habitantes && !iniciaCultoNoFimDaPopulacao;
      if (alvoSacrificio === "culto") return seguidores;
      return alvoSacrificio === null && ((habitantes && !iniciaCultoNoFimDaPopulacao) || seguidores);
    }
    if (item.uso.bosqueSagrado && (!Jogo.druida?.ehDruida(run) || run.flags.bosque_sagrado)) return false;
    if (item.uso.umaVezPorRun && run.flags[`usou_${itemId}`]) return false;
    if (
      item.uso.curarCondicao &&
      (!run.condicao?.ativa || (run.condicao.abracada && !item.uso.curaUniversal))
    )
      return false;
    if (
      item.uso.sacrificarHabitantes &&
      (run.atributos.habitantes <= item.uso.sacrificarHabitantes ||
        (item.uso.efeitos?.hp > 0 && run.atributos.hp >= run.hpMax))
    )
      return false;
    if (item.uso.sacrificarPopulacao) {
      const alvo = run.cultoAtivo ? "culto" : "habitantes";
      const populacao = run.cultoAtivo ? run.seguidoresCulto : run.atributos.habitantes;
      if ((alvoSacrificio && alvoSacrificio !== alvo) || populacao <= item.uso.sacrificarPopulacao)
        return false;
    }
    if (recargaItemRestante(run, itemId) > 0) return false;
    if (item.uso.tomoEsquecimento) {
      const evento = Jogo.eventoPorId(run.eventoId);
      if (
        !(
          run.fase === "escolha" ||
          (run.fase === "combate" && run.combatePendente?.etapa === "preparacao")
        ) ||
        !evento?.batalha
      )
        return false;
    }
    if (item.uso.cintoDosVentos && run.flags.cinto_vento_ativo) return false;
    return !(
      temItem(run, "escudo_da_fe") &&
      !item.uso.umaVezPorRun &&
      run.efeitosPreparados.escudoFeCooldown > 0
    );
  }

  function registrarItemConquistado(run, itemId) {
    run.itensConquistados ||= [];
    if (!run.itensConquistados.includes(itemId)) run.itensConquistados.push(itemId);
  }

  function registrarItemRecebido(run, itemId) {
    run.logItens = [{ id: itemId, rodada: run.rodada }];
  }

  function consumirItem(run, itemId, indice) {
    run.inventario.splice(indice, 1);
    run.itensConsumidosEm ||= {};
    run.itensConsumidosEm[itemId] = run.rodada;
    const item = Jogo.itens.find((candidato) => candidato.id === itemId);
    if (item?.aoConsumir) aplicarEfeitos(run, item.aoConsumir);
  }

  function recargaItemRestante(run, itemId) {
    const item = Jogo.itens.find((candidato) => candidato.id === itemId);
    const recarga = item?.uso?.recargaRodadas;
    if (!Number.isSafeInteger(recarga) || recarga < 1) return 0;
    const usadoEm = run.itensConsumidosEm?.[itemId];
    const recargaPropria = Number.isSafeInteger(usadoEm) ? Math.max(0, recarga - (run.rodada - usadoEm)) : 0;
    const recargaEscudo =
      !item?.uso?.ignorarEscudoDaFe && temItem(run, "escudo_da_fe")
        ? run.efeitosPreparados?.escudoFeCooldown || 0
        : 0;
    return Math.max(recargaPropria, recargaEscudo);
  }

  function registrarUsoComRecarga(run, item, indice, escudoDaFe) {
    if (item.uso.recargaRodadas) {
      if (escudoDaFe) {
        delete run.itensConsumidosEm?.[item.id];
        run.efeitosPreparados.escudoFeCooldown = 10;
      } else {
        run.itensConsumidosEm ||= {};
        run.itensConsumidosEm[item.id] = run.rodada;
      }
    } else if (escudoDaFe) run.efeitosPreparados.escudoFeCooldown = 10;
    else consumirItem(run, item.id, indice);
  }

  function concederItem(run, itemId) {
    const item = Jogo.itens.find((item) => item.id === itemId);
    if (!item) return false;
    if (itemId === "mascara_de_cervo" && temItem(run, itemId)) return false;
    if (item.dadosCombatePermanentes && temItem(run, itemId)) return false;
    registrarItemConquistado(run, itemId);
    registrarItemRecebido(run, itemId);
    if (item.aoReceber) {
      aplicarEfeitos(run, item.aoReceber);
      if (item.dadosCombatePermanentes)
        run.dadosCombatePermanentes = (run.dadosCombatePermanentes || 0) + item.dadosCombatePermanentes;
      if (item.aoReceber.lancaHeroiBatalhas) run.lancaHeroiBatalhas = item.aoReceber.lancaHeroiBatalhas;
      if (itemId === "espada_da_verdade" && !honraImune(run)) run.atributos.honra = 0;
      if (item.encarece) {
        const compras = run.comprasMercador[item.encarece] || 0;
        run.comprasMercador = { ...run.comprasMercador, [item.encarece]: compras + 1 };
      }
      if (item.guardarAposReceber && !run.inventario.includes(item.id)) run.inventario.push(item.id);
      return true;
    }
    run.inventario.push(item.id);
    return true;
  }

  function ofertaMercador(run, evento) {
    if (evento?.tipo !== "mercador" || !run.ofertaMercador) return null;
    return (
      Jogo.itens.find(
        (item) =>
          item.id === run.ofertaMercador &&
          item.mercador &&
          Jogo.legado.disponivel(item, "itens", run.legadoDaRun),
      ) || null
    );
  }

  function testarHonra(run, variacao) {
    if (run?.status !== "ativa" || ![30, -30].includes(variacao)) return false;
    if (honraImune(run)) {
      // Só perdas são imunizadas; ganhos continuam valendo.
      if (variacao < 0) return false;
      run.atributos.honra += variacao;
      return true;
    }
    if (temItem(run, "espada_da_verdade")) {
      run.atributos.honra = 0;
      return false;
    }
    const honra = run.atributos.honra + variacao;
    if (!Number.isSafeInteger(honra)) return false;
    run.atributos.honra = honra;
    run.honraSempreNeutra = run.honraSempreNeutra !== false && honra >= -29 && honra <= 29;
    return true;
  }

  function debugDiminuirHabitantes(run) {
    if (run?.status !== "ativa") return false;
    const antes = run.atributos.habitantes;
    if (antes <= 0) return false;
    run.atributos.habitantes = Jogo.herdeiros.perdaHabitantes(run, antes, Math.max(0, antes - 50));
    if (
      run.fase === "resultado" &&
      !run.cultoAtivo &&
      run.atributos.hp > 0 &&
      run.atributos.habitantes <= 0
    ) {
      if (run.atributos.honra <= -30) aguardarDecisaoCulto(run);
      else encerrar(run, "derrota", "A última casa ficou vazia. Sem habitantes, o vilarejo chegou ao fim.");
    }
    return true;
  }

  function limparCondicaoDebug(run) {
    if (run.condicao?.ativa) removerCondicao(run, false);
    run.condicao = {
      ativa: null,
      rodada: null,
      abracada: false,
      curada: false,
      bonusAbraco: { ataque: 0, escudo: 0 },
    };
    delete run.flags.condicao_decidida;
    delete run.flags.condicao_abracada;
    delete run.flags.condicao_curada;
    delete run.marcos.condicao;
  }

  function debugAtivarContagio(run, eventoId) {
    if (run?.status !== "ativa" || run.aguardaDecisaoCulto) return false;
    const evento = ["uivos_no_bosque", "hospede_palido", "anel_do_defunto"].includes(eventoId)
      ? Jogo.eventoPorId(eventoId)
      : null;
    if (!evento) return false;
    limparCondicaoDebug(run);
    run.rodada = Math.max(run.rodada, evento.requisitos?.rodadaMin || 1);
    run.estacao = Jogo.estacaoDaRodada(run.rodada, run);
    run.fase = "escolha";
    run.ultimoResultado = null;
    run.aguardaDecisaoCulto = false;
    run.inventarioAberto = false;
    run.avisoInventario = null;
    return registrarSorteio(run, evento);
  }

  function debugAtivarNovoConselheiro(run) {
    if (run?.status !== "ativa" || run.aguardaDecisaoCulto) return false;
    const evento = Jogo.eventoPorId("conselheiro_menino_armazem");
    if (!evento) return false;

    run.flags = {
      ...run.flags,
      menino_conselheiro: true,
      mao_do_rei_resolvida: true,
      primeiro_conselho_resolvido: true,
    };
    run.consequenciasAgendadas = (run.consequenciasAgendadas || []).filter(
      (item) => ![evento.id, "primeiro_conselho_do_menino"].includes(item.eventoId),
    );
    run.fase = "escolha";
    run.ultimoResultado = null;
    run.aguardaDecisaoCulto = false;
    run.inventarioAberto = false;
    run.avisoInventario = null;
    return registrarSorteio(run, evento);
  }

  function debugForcarCondicao(run, id) {
    const transformacoes = {
      olhos_mercurio: { marco: "olhosMercurioInicio", eventoId: "primeira_conta" },
      olho_mil_nomes: { marco: "olhoMilNomesInicio", eventoId: "fila_no_portao" },
    };
    const transformacao = transformacoes[id];
    if (transformacao) {
      if (run?.status !== "ativa" || run.aguardaDecisaoCulto) return false;
      const evento = Jogo.eventoPorId(transformacao.eventoId);
      if (!evento) return false;
      for (const flag of Object.keys(run.flags)) if (flag.startsWith(`${id}_`)) delete run.flags[flag];
      run.flags[`${id}_ativo`] = true;
      run.flags[`${id}_etapa2`] = true;
      run.flags[`${id}_etapa3`] = true;
      run.marcos[transformacao.marco] = run.rodada;
      run.encontroLeste = null;
      run.fase = "escolha";
      run.ultimoResultado = null;
      run.inventarioAberto = false;
      run.avisoInventario = null;
      return registrarSorteio(run, evento);
    }
    if (run?.status !== "ativa" || run.aguardaDecisaoCulto || !modificadoresCondicao[id]) return false;
    const antes = { ...run.atributos };
    const eventoAtual = Jogo.eventoPorId(run.eventoId);
    limparCondicaoDebug(run);
    if (!ativarCondicao(run, id)) return false;
    if (run.fase === "escolha" && eventoAtual?.marcaCondicaoDecidida) {
      run.fase = "resultado";
      run.ultimoResultado = {
        texto: `Debug: ${id === "licantropia" ? "licantropia" : id === "vampirismo" ? "vampirismo" : "possessão"} ativada.`,
        escolha: "Forçar condição sobrenatural",
        combate: null,
        alteracoes: Object.fromEntries(
          Jogo.atributos.map((atributo) => [atributo, run.atributos[atributo] - antes[atributo]]),
        ),
      };
    }
    return true;
  }

  function debugAtivarEventoEspecial(run, categoria, eventoId) {
    if (run?.status !== "ativa" || run.aguardaDecisaoCulto) return false;
    const limparFlags = (predicado) => {
      for (const id of Object.keys(run.flags)) if (predicado(id)) delete run.flags[id];
    };
    const eventosEntidade = Jogo.eventos.filter((evento) => evento.entidadeX || evento.entidadeXInicio);
    const eventosAbissais = Jogo.eventos.filter((evento) => evento.abissal);
    let evento;

    if (categoria === "entidade") {
      evento = Jogo.eventoPorId("entidade_x_chegada");
      if (!evento) return false;
      run.rodada = Math.max(8, run.rodada);
      run.estacao = Jogo.estacaoDaRodada(run.rodada, run);
      limparFlags(
        (id) =>
          id.startsWith("entidade_x_") ||
          id.startsWith("abissal_") ||
          id === "mare_selada" ||
          id === "palavras_lembradas" ||
          id === "senhor_do_abismo" ||
          eventosEntidade.some((candidato) => id === `especial_${candidato.id}`) ||
          eventosAbissais.some((candidato) => id === `especial_${candidato.id}`),
      );
      delete run.marcos.entidadeXAparicoes;
      delete run.marcos.entidadeXUltimoEvento;
      delete run.marcos.entidadeXRecusaFatalId;
    } else if (categoria === "abissal") {
      evento = Jogo.eventoPorId("sonhos_umidos");
      if (!evento) return false;
      run.rodada = Math.max(8, run.rodada);
      run.estacao = Jogo.estacaoDaRodada(run.rodada, run);
      limparFlags(
        (id) =>
          id.startsWith("entidade_x_") ||
          id.startsWith("abissal_") ||
          id === "mare_selada" ||
          id === "palavras_lembradas" ||
          id === "senhor_do_abismo" ||
          eventosEntidade.some((candidato) => id === `especial_${candidato.id}`) ||
          eventosAbissais.some((candidato) => id === `especial_${candidato.id}`),
      );
      run.flags.entidades_maiores_liberadas = true;
    } else if (categoria === "zodiaco") {
      const eventos = Jogo.eventos.filter((candidato) => candidato.zodiaco);
      if (!eventos.length) return false;
      evento = eventos.find(
        (candidato) => !run.flags[`especial_${candidato.id}`] && !run.flags[`${candidato.id}_visto`],
      );
      if (!evento) {
        for (const candidato of eventos) {
          delete run.flags[`especial_${candidato.id}`];
          delete run.flags[`${candidato.id}_visto`];
        }
        evento = eventos[0];
      }
      run.flags.ano_novo_ativo = true;
      run.marcos.anoNovoBase = run.rodada;
      run.janelaZodiaco = { marco: 0, eventoId: evento.id };
    } else if (categoria === "norte") {
      const eventos = Jogo.eventos.filter((candidato) => candidato.divino);
      if (!eventos.length) return false;
      if (eventoId && !eventos.some((candidato) => candidato.id === eventoId)) return false;
      evento = eventoId
        ? eventos.find((candidato) => candidato.id === eventoId)
        : eventos.find((candidato) => !run.flags[`especial_${candidato.id}`]);
      if (!evento) {
        for (const candidato of eventos) delete run.flags[`especial_${candidato.id}`];
        evento = eventos[0];
      }
      run.flags.bencao_norte_ativa = true;
      run.marcos.norteAtivado = run.rodada;
    } else return false;

    run.fase = "escolha";
    run.ultimoResultado = null;
    run.aguardaDecisaoCulto = false;
    run.inventarioAberto = false;
    run.avisoInventario = null;
    return registrarSorteio(run, evento);
  }

  function debugAtivarChefe(run, eventoId) {
    const chefes = new Set([
      "embate_barao",
      "lider_culto",
      "entidade_x_confronto",
      "senhor_do_abismo_confronto",
    ]);
    if (
      run?.status !== "ativa" ||
      !["escolha", "resultado"].includes(run.fase) ||
      run.aguardaDecisaoCulto ||
      !chefes.has(eventoId)
    )
      return false;
    const evento = Jogo.eventoPorId(eventoId);
    if (!evento?.bossId) return false;
    run.consequenciasAgendadas = (run.consequenciasAgendadas || []).filter(
      (consequencia) => consequencia.eventoId !== eventoId,
    );
    if (eventoId === "lider_culto") run.atributos.honra = Math.max(30, run.atributos.honra);
    if (eventoId === "senhor_do_abismo_confronto") {
      run.flags.abissal_5 = true;
      run.flags.entidades_maiores_liberadas = true;
    }
    run.fase = "escolha";
    run.ultimoResultado = null;
    run.combatePendente = null;
    run.aguardaDecisaoCulto = false;
    run.inventarioAberto = false;
    run.avisoInventario = null;
    return registrarSorteio(run, evento);
  }

  function debugAlternarCombates(run) {
    if (
      run?.status !== "ativa" ||
      !["escolha", "resultado"].includes(run.fase) ||
      run.aguardaDecisaoCulto ||
      run.flags.debugApenasEventosD20
    )
      return false;
    run.flags.debugSempreCombate = !run.flags.debugSempreCombate;
    return true;
  }

  function debugAlternarEventosD20(run) {
    if (run?.status !== "ativa" || !["escolha", "resultado"].includes(run.fase) || run.aguardaDecisaoCulto)
      return false;
    run.flags.debugApenasEventosD20 = !run.flags.debugApenasEventosD20;
    if (run.flags.debugApenasEventosD20) run.flags.debugSempreCombate = false;
    return true;
  }

  function debugAlternarMaoDoDestino(run) {
    if (
      run?.status !== "ativa" ||
      !["escolha", "resultado"].includes(run.fase) ||
      run.aguardaDecisaoCulto
    )
      return false;
    run.flags ||= {};
    run.flags.mao_do_destino_ativa = !run.flags.mao_do_destino_ativa;
    return true;
  }

  function debugDefinirDisputa(run, face, traco) {
    if (run?.status !== "ativa" || run.fase === "combate" || run.aguardaDecisaoCulto) return false;
    if (face !== null) {
      if (!Number.isInteger(face) || face < 0 || face > 6) return false;
      run.debugFaceCoringa = face;
    }
    if (traco !== null) {
      if (!["aleatorio", "nenhum", "veloz", "cego", "feroz"].includes(traco)) return false;
      run.debugTracoInimigo = traco;
    }
    return true;
  }

  function avancar(run) {
    if (run.status !== "ativa" || run.fase !== "resultado") return false;
    if (Jogo.pressagios?.bloqueia(run)) return false;
    run.avisosConquistas = [];
    const visitaPendente = !run.encontroLeste && !run.aguardaDecisaoCulto && Jogo.herdeiros.visitaDevida(run);
    if (visitaPendente) {
      run.encontroLeste = {
        eventoId: run.eventoId,
        opcoesSorteadas: [...run.opcoesSorteadas],
        ultimoResultado: run.ultimoResultado,
        resultadoConcluido: true,
      };
      registrarSorteio(run, Jogo.eventoPorId(visitaPendente.eventoId));
      run.fase = "escolha";
      run.ultimoResultado = null;
      return true;
    }
    if (run.encontroLeste && !run.aguardaDecisaoCulto) {
      const suspenso = run.encontroLeste;
      run.encontroLeste = null;
      run.eventoId = suspenso.eventoId;
      run.opcoesSorteadas = suspenso.opcoesSorteadas;
      run.ofertaMercador = suspenso.ofertaMercador ?? null;
      run.recompensasBau = suspenso.recompensasBau ?? null;
      run.fase = suspenso.resultadoConcluido ? "resultado" : "escolha";
      run.ultimoResultado = suspenso.resultadoConcluido
        ? suspenso.ultimoResultado || {
            escolha: "A visita termina.",
            texto: "A vila retoma seus afazeres.",
            combate: null,
            alteracoes: Object.fromEntries(Jogo.atributos.map((id) => [id, 0])),
          }
        : null;
      if (suspenso.resultadoConcluido) return avancar(run);
      return true;
    }
    if (Jogo.pressagios?.passagem(run)) return true;
    if (run.rodada >= Jogo.config.rodadasVitoria) {
      encerrar(run, ...finalDeVitoria(run));
      return true;
    }
    const proximaRodada = run.rodada + 1;
    const antesDoEfeito = { ...run.atributos };
    run.rodada = proximaRodada;
    run.estacao = Jogo.estacaoDaRodada(run.rodada, run);
    Jogo.druida?.iniciar(run);
    iniciarPassivaNordica(run);
    aplicarEfeitosTemporarios(run);
    aplicarEfeitoCondicaoRodada(run);
    const curaEnfermaria = run.construcoes.includes("enfermaria_ervateira") && run.atributos.hp < 60 ? 1 : 0;
    aplicarEfeitos(run, {
      hp:
        (temItem(run, "gato_companheiro") ? 1 : 0) +
        (run.construcoes.includes("moinho") ? 1 : 0) +
        curaEnfermaria,
    });
    if (run.cultoAtivo && run.cultoRendaPorRodada > 0) {
      const dobro = temItem(run, "afogados_abencoados") && run.atributos.honra <= -90 ? 2 : 1;
      run.seguidoresCulto += run.cultoRendaPorRodada * dobro;
    }
    if (run.efeitosPreparados.escudoFeCooldown > 0) run.efeitosPreparados.escudoFeCooldown -= 1;
    aplicarRodadaEfeitoDivino(run);
    Jogo.pressagios?.iniciarRodada(run);
    if (run.flags.entidade_x_pacto) aplicarEfeitos(run, { hp: -1 });
    if (
      !run.cultoAtivo &&
      run.atributos.hp > 0 &&
      run.atributos.habitantes <= 0 &&
      run.atributos.honra <= -30
    ) {
      concluirRodadaEfeitoDivino(run);
      aguardarDecisaoCulto(run);
      run.ultimoResultado = {
        texto: "O último habitante se foi.",
        escolha: "A passagem de mais uma rodada",
        combate: null,
        alteracoes: Object.fromEntries(
          Jogo.atributos.map((id) => [id, run.atributos[id] - antesDoEfeito[id]]),
        ),
      };
      return true;
    }
    const motivo = motivoDerrota(run);
    if (motivo) {
      encerrar(run, "derrota", motivo);
      return true;
    }
    prepararJanelaZodiaco(run, proximaRodada);
    const evento = sortear(run);
    if (!evento) {
      encerrar(run, "derrota", "Os acontecimentos cessaram antes de a vila completar três anos.");
      return true;
    }
    run.eventoId = evento.id;
    registrarSorteio(run, evento);
    run.fase = "escolha";
    run.ultimoResultado = null;
    return true;
  }

  function prepararJanelaZodiaco(run, rodada) {
    const base = run.marcos.anoNovoBase;
    if (run.traco === "herdeira_leste" || !run.flags.ano_novo_ativo || !Number.isSafeInteger(base)) {
      run.janelaZodiaco = null;
      return;
    }
    const desdeBase = rodada - base;
    const marco = desdeBase < 50 ? 0 : Math.floor((desdeBase - 50) / 50) + 1;
    const inicio = base + 50 * marco;
    const dentroDaJanela = marco > 0 && rodada >= inicio && rodada < inicio + 10;
    if (!dentroDaJanela) {
      run.janelaZodiaco = null;
      return;
    }
    if (run.janelaZodiaco?.marco === marco) return;
    const disponiveis = Jogo.eventos.filter((evento) => evento.zodiaco && !run.flags[`${evento.id}_visto`]);
    const evento = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    run.janelaZodiaco = evento ? { marco, eventoId: evento.id } : null;
  }

  function ativarEfeitoDivino(run, definicao) {
    if (run.efeitoDivino) removerModificadores(run, run.efeitoDivino);
    const duracao = Math.max(1, Math.min(20, Math.floor(definicao.duracao || 10)));
    const modificadoresAplicados = {};
    for (const [atributo, valor] of Object.entries(definicao.modificadores || {})) {
      if (!Jogo.atributos.includes(atributo) || !Number.isSafeInteger(valor)) continue;
      const antes = run.atributos[atributo];
      aplicarEfeitos(run, { [atributo]: valor });
      modificadoresAplicados[atributo] = run.atributos[atributo] - antes;
    }
    run.efeitoDivino = {
      nome: definicao.nome,
      restantes: duracao,
      inicio: run.rodada,
      modificadoresAplicados,
      porRodada: definicao.porRodada || null,
      reducaoDano: definicao.reducaoDano || 0,
      reducaoGanhoGold: definicao.reducaoGanhoGold || 0,
      reduzirCura: Boolean(definicao.reduzirCura),
      manutencaoGold: definicao.manutencaoGold || 0,
      revelarHonraRodadas: definicao.revelarHonraRodadas || 0,
      revelarHabitantesRodadas: definicao.revelarHabitantesRodadas || 0,
      bonusDadosCombate: definicao.bonusDadosCombate || 0,
    };
  }

  function aplicarRodadaEfeitoDivino(run) {
    const efeito = run.efeitoDivino;
    if (!efeito || run.rodada <= efeito.inicio || efeito.ultimaRodada === run.rodada) return;
    efeito.ultimaRodada = run.rodada;
    const rodada = run.rodada - efeito.inicio;
    if (efeito.manutencaoGold) aplicarEfeitos(run, { gold: -efeito.manutencaoGold });
    const periodico = efeito.porRodada;
    if (periodico && (!periodico.aCada || rodada % periodico.aCada === 0)) {
      const antes = run.atributos.habitantes;
      aplicarEfeitos(run, periodico.efeitos || {});
      const ganhou = run.atributos.habitantes - antes;
      if (ganhou > 0 && run.cultoAtivo) {
        const dobro = temItem(run, "afogados_abencoados") && run.atributos.honra <= -90 ? 2 : 1;
        run.seguidoresCulto += (1 + Math.floor(Math.random() * 5)) * dobro;
      }
    }
  }

  function concluirRodadaEfeitoDivino(run) {
    const efeito = run.efeitoDivino;
    if (!efeito || run.rodada <= efeito.inicio || !efeito.ultimaRodada || efeito.ultimaRodada !== run.rodada)
      return;
    efeito.restantes -= 1;
    if (efeito.restantes > 0) return;
    removerModificadores(run, efeito);
    run.efeitoDivino = null;
    if (run.ultimoResultado) run.ultimoResultado.texto += " O efeito divino termina.";
  }

  function removerModificadores(run, efeito) {
    for (const [atributo, valor] of Object.entries(efeito.modificadoresAplicados || {})) {
      run.atributos[atributo] = Math.max(0, run.atributos[atributo] - valor);
    }
  }

  function iniciarPassivaNordica(run) {
    if (run.traco !== "herdeiro_nordico" || run.passivaNordica?.inicio === run.rodada) return;
    if (run.passivaNordica) removerModificadores(run, run.passivaNordica);
    const catalogo = Jogo.efeitosNordicos || [];
    if (!catalogo.length) return;
    const definicao = catalogo[Math.floor(Math.random() * catalogo.length)];
    const aplicados = {};
    for (const [atributo, valor] of Object.entries(definicao.modificadores || {})) {
      const antes = run.atributos[atributo];
      run.atributos[atributo] = Math.max(0, antes + valor);
      aplicados[atributo] = run.atributos[atributo] - antes;
    }
    run.passivaNordica = { ...definicao, inicio: run.rodada, modificadoresAplicados: aplicados };
    run.flags["passiva_" + definicao.tipo] = true;
    if (definicao.porRodada) aplicarEfeitos(run, definicao.porRodada.efeitos);
    if (definicao.manutencaoGold) aplicarEfeitos(run, { gold: -definicao.manutencaoGold });
  }

  function registrarSorteio(run, evento) {
    if (!run || !evento) return false;
    if (evento.id === "pressagio_preparativos" && run.pressagios?.atual)
      run.pressagios.atual.ultimaAuxilio = run.rodada;
    run.eventoId = evento.id;
    if (evento.id === "colheita") run.marcos.colheitaUltimaRodada = run.rodada;
    if (evento.id === "cura_critica") run.flags.cura_critica_oferecida = true;
    if (evento.entidadeXInicio) {
      run.flags = { ...run.flags, entidade_x_ativa: true };
      run.marcos.entidadeXAparicoes = (run.marcos.entidadeXAparicoes || 0) + 1;
      run.marcos.entidadeXUltimoEvento = run.rodada;
      const recusasArriscadas = Jogo.eventos.filter(
        (carta) => carta.entidadeX && carta.opcoes?.some((opcao) => opcao.testeSorte?.fatalidadeAleatoria),
      );
      run.marcos.entidadeXRecusaFatalId =
        recusasArriscadas[Math.floor(Math.random() * recusasArriscadas.length)]?.id || null;
    } else if (evento.entidadeX) {
      run.marcos.entidadeXAparicoes = (run.marcos.entidadeXAparicoes || 0) + 1;
      run.marcos.entidadeXUltimoEvento = run.rodada;
    }
    run.ofertaMercador = null;
    run.recompensasBau = null;
    run.opcoesSorteadas = [];
    const opcoesBau = prepararBau(run, evento);
    if (evento.poolOpcoes) {
      const correta = evento.poolOpcoes.find((opcao) => opcao.id === evento.opcaoCorreta);
      const restantes = evento.poolOpcoes.filter(
        (opcao) => opcao.id !== evento.opcaoCorreta && cumpre(opcao.requisitos, run),
      );
      for (let i = restantes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [restantes[i], restantes[j]] = [restantes[j], restantes[i]];
      }
      const sorteadas = [correta, ...restantes.slice(0, 2)];
      for (let i = sorteadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorteadas[i], sorteadas[j]] = [sorteadas[j], sorteadas[i]];
      }
      run.opcoesSorteadas = sorteadas.filter(Boolean).map((opcao) => opcao.id);
    } else if (opcoesBau) {
      const sorteadas = [...opcoesBau];
      for (let i = sorteadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorteadas[i], sorteadas[j]] = [sorteadas[j], sorteadas[i]];
      }
      run.opcoesSorteadas = sorteadas.map((opcao) => opcao.id);
    } else if (evento.tipo !== "mercador" && evento.opcoes?.length > 1) {
      const ordem = evento.opcoes.filter((opcao) => cumpre(opcao.requisitos, run));
      for (let i = ordem.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
      }
      run.opcoesSorteadas = ordem.map((opcao) => opcao.id);
    }
    if (evento.divino) run.marcos.norteUltimaOferta = run.rodada;
    if (evento.id === "mercador_chines" && run.flags.ano_novo_ativo) run.marcos.anoNovoBase = run.rodada;
    if (evento.id === "emissario_do_norte" && run.flags.bencao_norte_ativa)
      run.marcos.norteAtivado = run.rodada;
    if (evento.tipo === "mercador") {
      const ofertas = Jogo.itens.filter(
        (item) => item.mercador && Jogo.legado.disponivel(item, "itens", run.legadoDaRun),
      );
      if (ofertas.length) run.ofertaMercador = ofertas[Math.floor(Math.random() * ofertas.length)].id;
    }
    Jogo.druida?.prepararEvento(run, evento);
    if (evento.especial) run.flags = { ...run.flags, [`especial_${evento.id}`]: true };
    if (evento.zodiaco || evento.divino) {
      Jogo.legado.conceder(run, { flags: [`visto_${evento.id}`] });
    }
    const visita = !run.encontroLeste && Jogo.herdeiros.visitaDevida(run);
    if (
      visita &&
      !evento.bossId &&
      !evento.zodiaco &&
      evento.id !== "ultimo_habitante" &&
      !run.aguardaDecisaoCulto &&
      !evento.consequenciaAgendada &&
      !evento.forcarSorteioQuandoElegivel &&
      !evento.disparadoPelaEngine &&
      !evento.marcaCondicaoDecidida
    ) {
      run.encontroLeste = {
        eventoId: evento.id,
        opcoesSorteadas: [...run.opcoesSorteadas],
        ofertaMercador: run.ofertaMercador,
        recompensasBau: run.recompensasBau,
      };
      registrarSorteio(run, Jogo.eventoPorId(visita.eventoId));
    }
    return true;
  }

  function avaliarConsequenciaPressagio(run) {
    if (
      !run.cultoAtivo &&
      run.atributos.hp > 0 &&
      run.atributos.habitantes <= 0 &&
      run.atributos.honra <= -30
    ) {
      aguardarDecisaoCulto(run);
      run.fase = "resultado";
      run.ultimoResultado ||= {
        escolha: "O presságio se cumpre.",
        texto: "A última casa ficou vazia.",
        combate: null,
        alteracoes: Object.fromEntries(Jogo.atributos.map((id) => [id, 0])),
      };
      return;
    }
    const motivo = motivoDerrota(run);
    if (motivo) encerrar(run, "derrota", motivo);
  }

  Jogo.engine = {
    avaliarConsequenciaPressagio,
    iniciarPassivaNordica,
    debugDefinirDisputa,
    aplicarEfeitos,
    cumpre,
    pools,
    eventoDisponivel,
    opcoes,
    peso,
    sortear,
    escolher,
    perfilCombate,
    quantidadeDadosTesteDados,
    chanceVitoriaCombate,
    opcaoCombatePendente,
    rolarCombate,
    rerrolarCombate,
    rerrolarCombateGratuito,
    rerrolarMenorDadoCombate,
    continuarCombate,
    comprar,
    usarItem,
    podeUsarItem,
    recargaItemRestante,
    concederItem,
    sortearItemGenerico,
    batalhaAjustada,
    juntarCulto,
    encerrarSemCulto,
    ofertaMercador,
    precoMercadoria,
    podePagar,
    rendaDaVila,
    preverRenda,
    testarHonra,
    debugDiminuirHabitantes,
    debugAtivarContagio,
    debugAtivarNovoConselheiro,
    debugForcarCondicao,
    debugAtivarEventoEspecial,
    debugAtivarChefe,
    debugAlternarCombates,
    debugAlternarEventosD20,
    debugAlternarMaoDoDestino,
    eventoCondicaoDevido,
    curarCondicao,
    sincronizarItemVampirismo,
    avancar,
    registrarSorteio,
    encerrar,
    motivoDerrota,
  };
})();
