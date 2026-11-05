(function () {
  "use strict";
  const Jogo = window.Jogo;
  const modificadoresCondicao = {
    licantropia: { ataque: 2 },
    vampirismo: { ataque: 3, escudo: 2 },
    possessao: { ataque: 2 }
  };

  function garantirCondicao(run) {
    run.condicao ||= { ativa: null, rodada: null, abracada: false, curada: false, bonusAbraco: { ataque: 0, escudo: 0 } };
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
    const bonus = condicao.ativa === "licantropia" ? { ataque: 2, escudo: 0 }
      : condicao.ativa === "vampirismo" ? { ataque: 2, escudo: 2 }
        : { ataque: 3, escudo: 3 };
    condicao.bonusAbraco = bonus;
    condicao.abracada = true;
    run.flags.condicao_abracada = true;
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
      possessao: desdeContagio > 0 && desdeContagio % 7 === 0 ? "a_voz" : null
    };
    const id = eventos[condicao.ativa];
    return id ? Jogo.eventos.find(evento => evento.id === id) || null : null;
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

  function cumpre(requisitos, run, contexto = "estado") {
    if (!requisitos) return true;
    const a = run.atributos;
    if (requisitos.rodadaMin !== undefined && run.rodada < requisitos.rodadaMin) return false;
    if (requisitos.rodadaMax !== undefined && run.rodada > requisitos.rodadaMax) return false;
    if (requisitos.estacao && run.estacao !== requisitos.estacao) return false;
    if (requisitos.estacoes && !requisitos.estacoes.includes(run.estacao)) return false;
    if (requisitos.tracos && !(Array.isArray(requisitos.tracos) ? requisitos.tracos.includes(run.traco) : requisitos.tracos === run.traco)) return false;
    if (requisitos.rodadasDesde && Object.entries(requisitos.rodadasDesde)
      .some(([id, minimo]) => !Number.isSafeInteger(run.marcos?.[id]) || run.rodada - run.marcos[id] < minimo)) return false;
    if (requisitos.condicaoAtiva && run.condicao?.ativa !== requisitos.condicaoAtiva) return false;
    // A aparência e os pesos usam a faixa do estado; diálogos têm limites próprios.
    const alta = contexto === "escolha" ? Jogo.config.honraEscolhasAlta : Jogo.config.honraAlta;
    const baixa = contexto === "escolha" ? Jogo.config.honraEscolhasBaixa : Jogo.config.honraBaixa;
    if (requisitos.honra === "alta" && a.honra < alta) return false;
    if (requisitos.honra === "baixa" && a.honra > baixa) return false;
    if (requisitos.honra === "decidida" && a.honra < alta && a.honra > baixa) return false;
    if (requisitos.honra === "nao_baixa" && a.honra <= baixa) return false;
    for (const atributo of Jogo.atributos) {
      if (requisitos[`${atributo}Min`] !== undefined && a[atributo] < requisitos[`${atributo}Min`]) return false;
      if (requisitos[`${atributo}Max`] !== undefined && a[atributo] > requisitos[`${atributo}Max`]) return false;
    }
    if (requisitos.flags?.some(id => !Object.hasOwn(run.flags, id) || !run.flags[id])) return false;
    if (requisitos.flagsAusentes?.some(id => Object.hasOwn(run.flags, id) && run.flags[id])) return false;
    if (requisitos.flagsLegado?.some(id => !Object.hasOwn(run.legadoDaRun.flags, id) || run.legadoDaRun.flags[id] !== true)) return false;
    if (requisitos.itensLegado?.some(id => !run.legadoDaRun.itens.includes(id))) return false;
    if (requisitos.cultoAtivo !== undefined && Boolean(run.cultoAtivo) !== requisitos.cultoAtivo) return false;
    if (requisitos.itens?.some(id => !run.inventario.includes(id))) return false;
    if (requisitos.itensProntos?.some(id => !run.inventario.includes(id) || recargaItemRestante(run, id) > 0)) return false;
    if (requisitos.populacaoMinimo !== undefined) {
      const populacao = run.cultoAtivo ? run.seguidoresCulto : a.habitantes;
      if (populacao < requisitos.populacaoMinimo) return false;
    }
    if (requisitos.seguidoresMin !== undefined && run.seguidoresCulto < requisitos.seguidoresMin) return false;
    if (requisitos.seguidoresMax !== undefined && run.seguidoresCulto > requisitos.seguidoresMax) return false;
    if (requisitos.memoriaAnterior && !(run.legadoDaRun.memorias || []).length) return false;
    return true;
  }

  function pools(run) {
    return {
      eventos: Jogo.eventos.filter(evento => !evento.disparadoPelaEngine && Jogo.legado.disponivel(evento, "eventos", run.legadoDaRun)),
      itens: Jogo.itens.filter(item => Jogo.legado.disponivel(item, "itens", run.legadoDaRun))
    };
  }

  function catalogoOpcoes(evento, run) {
    if (run.recompensasBau?.eventoId === evento.id) return run.recompensasBau.opcoes;
    return evento.poolOpcoes || evento.opcoes;
  }

  function opcoes(evento, run, usarOpcoesSorteadas = true) {
    const catalogo = catalogoOpcoes(evento, run);
    const selecionadas = usarOpcoesSorteadas && run.opcoesSorteadas?.length
      ? run.opcoesSorteadas.map(id => catalogo.find(opcao => opcao.id === id)).filter(Boolean) : catalogo;
    return selecionadas.filter(opcao => cumpre(opcao.requisitos, run, "escolha")
      && (!opcao.recompensaItemGenerico || Jogo.itens.some(item => item.generico
        && !run.itensConquistados.includes(item.id) && Jogo.legado.disponivel(item, "itens", run.legadoDaRun)))
      && (!opcao.recompensaItemEspecial || Jogo.itens.some(item => item.especialSorteavel
        && !run.itensConquistados.includes(item.id) && cumpre(item.requisitos, run)
        && Jogo.legado.disponivel(item, "itens", run.legadoDaRun))));
  }

  function eventoDisponivel(evento, run, aleatorio = Math.random) {
    if (evento.letal && run.rodada < 6) return false;
    if ((evento.letal || evento.oncePerRun) && run.flags[`${evento.id}_visto`]) return false;
    if (evento.oncePerYear && run.flags[`${evento.id}_ano_${Jogo.anoDaRodada(run.rodada)}_visto`]) return false;
    if (evento.especial && run.flags[`especial_${evento.id}`] === true) return false;
    if (evento.pacto && run.flags.pacto_feito === true) return false;
    if (evento.nemesis && (!run.nemesis || run.nemesis.enfrentado)) return false;
    const entidadeAtiva = run.flags.entidade_x_ativa === true;
    const abissalAtivo = run.flags.abissal_1 === true && run.flags.abissal_5 !== true;
    if (evento.entidadeXInicio && (entidadeAtiva || run.flags.entidade_x_imune || abissalAtivo || run.rodada < 8)) return false;
    if (evento.entidadeX && !entidadeAtiva) return false;
    if (evento.entidadeXAparicoesMin && (run.marcos.entidadeXAparicoes || 0) < evento.entidadeXAparicoesMin) return false;
    if (evento.abissal && entidadeAtiva) return false;
    if (evento.abissal && !run.flags.entidades_maiores_liberadas) return false;
    const anteriorId = run.eventosRecentes.at(-1);
    const anterior = Jogo.eventos.find(candidato => candidato.id === anteriorId);
    if (evento.apenasAposTipo && anterior?.tipo !== evento.apenasAposTipo) return false;
    if (evento.apenasAposIds && !evento.apenasAposIds.includes(anteriorId)) return false;
    if (evento.chanceAposAnterior && aleatorio() >= evento.chanceAposAnterior) return false;
    if (evento.zodiaco) {
      const base = run.marcos.anoNovoBase;
      const marco = run.janelaZodiaco?.marco;
      const inicio = Number.isSafeInteger(base) && Number.isSafeInteger(marco) ? base + marco * 50 : Infinity;
      if (!run.flags.ano_novo_ativo || run.janelaZodiaco?.eventoId !== evento.id
        || run.rodada < inicio || run.rodada >= inicio + 10) return false;
    }
    if (evento.divino) {
      const ultimaOferta = run.marcos.norteUltimaOferta ?? run.marcos.norteAtivado;
      if (!run.flags.bencao_norte_ativa || !Number.isSafeInteger(ultimaOferta) || run.rodada - ultimaOferta < 40) return false;
    }
    return true;
  }

  function peso(evento, run) {
    const regra = evento.pesos?.find(regra => cumpre(regra.requisitos, run));
    const base = Math.max(0, regra?.valor ?? evento.peso ?? 1);
    return evento.abissal && temItem(run, "martelo_dos_afogados") ? base * 2 : base;
  }

  function eventoComum(evento) {
    return Boolean(evento && !evento.especial && !evento.entidadeX && !evento.entidadeXInicio
      && !evento.abissal && !evento.divino && !evento.zodiaco && evento.tipo !== "culto");
  }

  function batalhaAjustada(run, batalha) {
    if (batalha.semAjuste) return batalha;
    const estagio = Math.floor(Math.max(0, run.rodada - 1) / 10);
    const nivelNemesis = run.eventoId === "nemesis_da_memoria" ? Math.max(1, run.nemesis?.nivel || 1) : 0;
    if (!estagio && !nivelNemesis) return batalha;
    return {
      ...batalha,
      defesa: batalha.defesa + estagio + nivelNemesis * 2,
      vitoria: { ...batalha.vitoria, dano: batalha.vitoria.dano + estagio * 2 + nivelNemesis * 2 },
      derrota: { ...batalha.derrota, dano: batalha.derrota.dano + estagio * 2 + nivelNemesis * 5 },
      estagio
    };
  }

  function prepararBau(run, evento) {
    if (!evento.bauAleatorio) return null;
    const elegiveis = Jogo.itens.filter(item => ["comum", "raro", "epico"].includes(item.raridade)
      && !item.especialSorteavel && !run.itensConquistados.includes(item.id)
      && !run.inventario.includes(item.id) && Jogo.legado.disponivel(item, "itens", run.legadoDaRun));
    for (let i = elegiveis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [elegiveis[i], elegiveis[j]] = [elegiveis[j], elegiveis[i]];
    }
    const escolhidos = elegiveis.slice(0, evento.bauAleatorio);
    const opcoesBau = escolhidos.map(item => ({
      id: `recompensa_${item.id}`,
      texto: `${evento.id === "bau_mimico" ? "Pegar" : "Levar"} ${item.nome}.`,
      itens: [item.id],
      resultado: `Você escolhe ${item.nome} entre os objetos do baú.`,
      ...(evento.id === "bau_mimico" ? { armadilha: { chance: 1 / 6, danoHp: 10, perderItem: true } } : {})
    }));
    if (evento.id === "bau_mimico") opcoesBau.push({
      id: "deixar", texto: "Seguir sem mexer no baú.", resultado: "Você deixa os objetos onde estão e retoma a estrada."
    });
    if (!opcoesBau.length) opcoesBau.push({ id: "ouro", texto: "Vasculhar o fundo vazio · +3 Gold.", efeitos: { gold: 3 }, resultado: "Só restam algumas moedas no fundo do baú." });
    run.recompensasBau = { eventoId: evento.id, opcoes: opcoesBau };
    return opcoesBau;
  }

  function temItem(run, id) {
    return run.itensConquistados?.includes(id) || run.inventario?.includes(id);
  }

  function sortearItemGenerico(run, aleatorio = Math.random) {
    const itens = Jogo.itens.filter(item => item.generico && !run.itensConquistados.includes(item.id)
      && Jogo.legado.disponivel(item, "itens", run.legadoDaRun));
    const raridades = [{ id: "comum", peso: 10 }, { id: "raro", peso: 4 }, { id: "epico", peso: 1 }]
      .filter(raridade => itens.some(item => item.raridade === raridade.id));
    const total = raridades.reduce((soma, raridade) => soma + raridade.peso, 0);
    if (!total) return null;
    let valor = aleatorio() * total;
    let raridade = raridades.at(-1)?.id;
    for (const candidata of raridades) {
      valor -= candidata.peso;
      if (valor < 0) { raridade = candidata.id; break; }
    }
    const disponiveis = itens.filter(item => item.raridade === raridade);
    return disponiveis[Math.floor(aleatorio() * disponiveis.length)] || null;
  }

  function sortearItemEspecial(run, aleatorio = Math.random) {
    const itens = Jogo.itens.filter(item => item.especialSorteavel && cumpre(item.requisitos, run)
      && !run.itensConquistados.includes(item.id)
      && Jogo.legado.disponivel(item, "itens", run.legadoDaRun));
    if (!itens.length) return null;
    return itens[Math.floor(aleatorio() * itens.length)];
  }

  function sortear(run, aleatorio = Math.random) {
    run.consequenciasAgendadas ||= [];
    const agendada = run.consequenciasAgendadas
      .filter(item => Number.isSafeInteger(item.rodada) && item.rodada <= run.rodada)
      .sort((a, b) => a.rodada - b.rodada)[0];
    if (agendada) {
      const eventoAgendado = Jogo.eventos.find(evento => evento.id === agendada.eventoId && evento.consequenciaAgendada);
      if (eventoAgendado) return eventoAgendado;
      run.consequenciasAgendadas = run.consequenciasAgendadas.filter(item => item !== agendada);
    }
    const recorrenteCondicao = eventoCondicaoDevido(run);
    if (recorrenteCondicao) return recorrenteCondicao;
    if (run.nemesis && !run.nemesis.enfrentado && run.rodada >= 5) {
      const inimigo = Jogo.eventos.find(evento => evento.nemesis);
      if (inimigo) return inimigo;
    }
    let candidatos = pools(run).eventos.filter(evento => eventoDisponivel(evento, run, aleatorio)
      && cumpre(evento.requisitos, run)
      && !(evento.conselheiro && (run.conselhosRecentes || []).includes(evento.id))
      // O sorteio roda antes de registrar a nova carta. Ignore os IDs da carta anterior.
      && opcoes(evento, run, false).length > 0 && peso(evento, run) > 0);
    const eventosProgramados = candidatos.filter(evento => evento.forcarSorteioQuandoElegivel);
    if (eventosProgramados.length) candidatos = eventosProgramados;
    const anuaisDevidos = candidatos.filter(evento => Number.isSafeInteger(evento.intervaloRodadas)
      && evento.intervaloRodadas > 0 && run.rodada % evento.intervaloRodadas === 0);
    if (anuaisDevidos.length) candidatos = anuaisDevidos;
    const chegadaEntidade = candidatos.find(evento => evento.entidadeXInicio);
    if (chegadaEntidade) {
      const chegou = aleatorio() < 0.08;
      candidatos = candidatos.filter(evento => !evento.entidadeXInicio);
      if (chegou) candidatos = [chegadaEntidade];
    }
    if (run.flags.entidade_x_ativa) {
      const intervalo = 20;
      const ultima = run.marcos.entidadeXUltimoEvento ?? run.rodada;
      if (run.rodada - ultima < intervalo) candidatos = candidatos.filter(evento => !evento.entidadeX);
    }
    const eventosRecentesRuns = run.legadoDaRun?.eventosRecentesRuns || [];
    const repetidosEntreRuns = new Set(eventosRecentesRuns.flatMap(registro => registro.eventos || []));
    const comunsNovos = candidatos.filter(evento => eventoComum(evento) && !repetidosEntreRuns.has(evento.id));
    if (comunsNovos.length) {
      candidatos = candidatos.filter(evento => !eventoComum(evento) || !repetidosEntreRuns.has(evento.id));
    }
    // Espaça as últimas cartas. Com uma pool pequena, libera primeiro a mais antiga.
    const recentes = [...run.eventosRecentes];
    if (run.eventoId && recentes.at(-1) !== run.eventoId) recentes.push(run.eventoId);
    while (recentes.length) {
      const gruposRecentes = new Set(recentes.map(id => {
        const recente = Jogo.eventos.find(candidato => candidato.id === id);
        return recente?.grupoRecorrencia || id;
      }));
      const diferentes = candidatos.filter(evento => !gruposRecentes.has(evento.grupoRecorrencia || evento.id));
      if (diferentes.length) { candidatos = diferentes; break; }
      recentes.shift();
    }
    const total = candidatos.reduce((soma, evento) => soma + peso(evento, run), 0);
    let sorteio = aleatorio() * total;
    let escolhido = null;
    for (const evento of candidatos) {
      sorteio -= peso(evento, run);
      if (sorteio < 0) { escolhido = evento; break; }
    }
    escolhido ||= candidatos.at(-1) || null;
    if (run.flags.cinto_vento_ativo && escolhido?.tipo !== "batalha") {
      return Jogo.eventos.find(evento => evento.id === "correu_mais_rapido_que_a_luz") || escolhido;
    }
    return escolhido;
  }

  function aplicarEfeitos(run, efeitos = {}, multiplicadores = {}, contexto = {}) {
    if (Number.isSafeInteger(efeitos.seguidores) && run.cultoAtivo) {
      const multiplicadorSeguidores = !contexto.semBonusSeguidores && temItem(run, "afogados_abencoados") && run.atributos.honra <= -90 ? 2 : 1;
      run.seguidoresCulto = Math.max(0, run.seguidoresCulto + efeitos.seguidores * multiplicadorSeguidores);
    }
    if (Number.isSafeInteger(efeitos.hpMax)) {
      run.hpMax = Math.max(1, run.hpMax + efeitos.hpMax);
    }
    for (const atributo of Jogo.atributos) {
      if (atributo === "honra" && temItem(run, "espada_da_verdade")) { run.atributos.honra = 0; continue; }
      const antes = run.atributos[atributo];
      let efeito = efeitos[atributo] || 0;
      if (atributo === "gold" && efeito > 0 && run.efeitoDivino?.reducaoGanhoGold) {
        efeito = Math.max(0, efeito - run.efeitoDivino.reducaoGanhoGold);
      }
      let valor = Math.floor((antes + efeito) * (multiplicadores[atributo] ?? 1));
      if (atributo === "habitantes" && contexto.protecaoCeleiro && valor < antes) {
        valor = antes - Math.floor((antes - valor) / 2);
      }
      run.atributos[atributo] = atributo === "honra" ? valor
        : atributo === "hp" ? Math.min(run.hpMax, Math.max(0, valor)) : Math.max(0, valor);
    }
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

  function motivoDerrota(run) {
    if (run.atributos.hp <= 0) return "O herdeiro sucumbiu. A terra espera por quem virá depois.";
    if (run.aguardaDecisaoCulto) return null;
    if (run.cultoAtivo) return run.seguidoresCulto <= 0 ? "O culto se dispersou, e a crônica chegou ao fim." : null;
    if (run.atributos.habitantes <= 0) return "A última casa ficou vazia. Sem habitantes, o vilarejo chegou ao fim.";
    return null;
  }

  function aguardarDecisaoCulto(run) {
    run.aguardaDecisaoCulto = true;
    const carta = Jogo.eventos.find(evento => evento.id === "ultimo_habitante");
    const ordem = [...(carta?.opcoes || [])];
    for (let i = ordem.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    }
    run.opcoesSorteadas = ordem.map(opcao => opcao.id);
  }

  function juntarCulto(run) {
    if (run?.status !== "ativa" || run.fase !== "resultado" || !run.aguardaDecisaoCulto) return false;
    run.cultoAtivo = true;
    run.flags = { ...run.flags, culto_ativo: true };
    run.seguidoresCulto = 50;
    run.atributos.honra -= 5;
    run.aguardaDecisaoCulto = false;
    run.marcos.cultoAdesao = run.rodada;
    run.marcos.culto_entrada_rodada = run.rodada;
    run.opcoesSorteadas = [];
    Jogo.legado.conceder(run, { flags: ["culto_conhecido"] });
    concederItem(run, "adaga_cerimonial");
    run.flags.ultimo_habitante_visto = true;
    run.eventoId = "ultimo_habitante";
    run.ultimoResultado.escolha = "Aceitar o chamado.";
    run.ultimoResultado.alteracoes.honra -= 5;
    run.ultimoResultado.texto = `${Jogo.eventos.find(evento => evento.id === "ultimo_habitante").opcoes.find(opcao => opcao.id === "juntar").resultado} A Adaga cerimonial é guardada no inventário.`;
    return true;
  }

  function encerrarSemCulto(run) {
    if (run?.status !== "ativa" || run.fase !== "resultado" || !run.aguardaDecisaoCulto) return false;
    run.aguardaDecisaoCulto = false;
    run.opcoesSorteadas = [];
    run.flags.ultimo_habitante_visto = true;
    run.eventoId = "ultimo_habitante";
    run.ultimoResultado.escolha = "Encerrar a linhagem.";
    run.ultimoResultado.texto = Jogo.eventos.find(evento => evento.id === "ultimo_habitante").opcoes.find(opcao => opcao.id === "encerrar").resultado;
    encerrar(run, "derrota", "Sem habitantes, você decide não seguir com o culto. A crônica termina.");
    return true;
  }

  function atualizarCulto(run, antes) {
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
    const adesao = run.marcos.cultoAdesao;
    const seguidoresAntesDoRecrutamento = run.seguidoresCulto;
    const recrutamentoDeRecuperacao = seguidoresAntesDoRecrutamento < 30;
    const chegadaAcelerada = recrutamentoDeRecuperacao
      || (temItem(run, "honra_dos_caidos") && run.atributos.honra <= -50);
    const intervalo = chegadaAcelerada ? 5 : 10;
    const chegadaBase = seguidoresAntesDoRecrutamento < 15 ? 8 : 5;
    if (run.seguidoresCulto > 0 && Number.isSafeInteger(adesao) && run.rodada > adesao && (run.rodada - adesao) % intervalo === 0) {
      const chegada = chegadaBase * dobraSeguidores;
      run.seguidoresCulto += chegada;
      if (run.ultimoResultado) run.ultimoResultado.texto += ` ${chegada} novos seguidores chegam ao culto.`;
    }
  }

  function numeroSeguidores(valor) { return new Intl.NumberFormat("pt-BR").format(valor); }

  function encerrar(run, tipo, motivo) {
    // Vitória pode chamar a mesma função quando sua condição for definida.
    Jogo.legado.avaliar(run);
    run.status = "encerrada";
    run.fim = { tipo, motivo };
    run.conquistas = Jogo.legado.mesclar(run.conquistas, { memorias: [{
      id: run.id, rodada: run.rodada, honra: run.atributos.honra, tipo, motivo,
      traco: run.traco, meninoAdotado: Boolean(run.flags.orfao_acolhido)
    }] });
  }

  function resolverCombate(run, batalha) {
    batalha = batalhaAjustada(run, batalha);
    const preparados = run.efeitosPreparados || {};
    const bonusAtaque = preparados.bonusAtaqueProximaBatalha || 0;
    const bonusAtaqueDruida = Jogo.druida?.bonusAtaqueCombate(run) || 0;
    const bonusEscudo = preparados.bonusEscudoProximaBatalha || 0;
    const lancaAtiva = !batalha.semOverrides && run.lancaHeroiBatalhas > 0;
    const adagaAtiva = !batalha.semOverrides && temItem(run, "adaga_amaldicoada");
    const venceu = !batalha.forcarDerrota && (lancaAtiva || adagaAtiva || run.atributos.ataque + bonusAtaque + bonusAtaqueDruida >= batalha.defesa);
    const desfecho = venceu ? batalha.vitoria : batalha.derrota;
    const danoBase = adagaAtiva && !lancaAtiva && !batalha.forcarDerrota ? batalha.derrota.dano : desfecho.dano;
    const manto = temItem(run, "manto_de_folhas") ? (run.estacao === "inverno" ? 4 : 3) : 0;
    const escudoUsado = run.atributos.escudo + bonusEscudo + manto;
    const danoAnulado = lancaAtiva || preparados.bloquearDanoProximaBatalha || (preparados.bacamarteBatalhas || 0) > 0;
    const reducaoDivina = batalha.somenteEscudo ? 0 : run.efeitoDivino?.reducaoDano || 0;
    const reducaoPassiva = batalha.somenteEscudo ? 0 : (temItem(run, "cao_companheiro") ? 2 : 0)
      + (run.construcoes?.includes("muralha") ? 2 : 0)
      + (run.construcoes?.includes("torre_vigia") ? 3 : 0);
    const dano = danoAnulado ? 0 : Math.max(0, danoBase - escudoUsado - reducaoDivina - reducaoPassiva);
    let efeitos = aplicarBonusDeRecompensa(run, desfecho.efeitos || {});
    if (danoAnulado && efeitos.hp < 0) efeitos = { ...efeitos, hp: 0 };
    let explosaoBacamarte = false;
    if (lancaAtiva && efeitos.honra < 0) efeitos = { ...efeitos, honra: 0 };
    let texto = desfecho.resultado;
    if (lancaAtiva) {
      run.lancaHeroiBatalhas -= 1;
      texto += " A presença da Lança do Herói encerra o confronto sem ferimentos.";
    } else if (adagaAtiva && venceu) texto += danoAnulado
      ? " A Adaga amaldiçoada garante a vitória; a proteção ativa também anula o dano da derrota."
      : " A Adaga amaldiçoada garante a vitória, mas você recebe o dano de uma derrota.";
    if (preparados.bacamarteBatalhas > 0) {
      preparados.bacamarteBatalhas -= 1;
      texto += " A pólvora do bacamarte impede que você sofra dano.";
      if (preparados.bacamarteBatalhas === 0) {
        if (lancaAtiva || preparados.bloquearDanoProximaBatalha) {
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
      aplicarEfeitos(run, { ...efeitos, hp: 0 });
      if (curaDeVitoria !== 0) aplicarEfeitos(run, { hp: curaDeVitoria });
      aplicarEfeitos(run, { hp: -dano });
    } else {
      const hpDoDesfecho = efeitos.hp || 0;
      const hpDoDesfechoSemDanoBloqueado = danoAnulado && hpDoDesfecho < 0 ? 0 : hpDoDesfecho;
      aplicarEfeitos(run, { ...efeitos, hp: hpDoDesfechoSemDanoBloqueado - dano });
    }
    if (explosaoBacamarte) aplicarEfeitos(run, { hp: -15 });
    run.efeitosPreparados = {
      ...run.efeitosPreparados,
      bloquearDanoProximaBatalha: false,
      bonusAtaqueProximaBatalha: 0,
      bonusEscudoProximaBatalha: 0,
      bonusGoldProximaRecompensa: run.efeitosPreparados.bonusGoldProximaRecompensa || 0
    };
    if (bonusAtaque) texto += ` Um bônus preparado aumenta seu Ataque em ${bonusAtaque} nesta batalha.`;
    if (bonusEscudo) texto += ` O elixir aumenta seu escudo em ${bonusEscudo} nesta batalha.`;
    if (preparados.bloquearDanoProximaBatalha) texto += " O amuleto anula o dano desta batalha.";
    if (!venceu && batalha.penalidadeFalha) {
      const efeitosFalha = { ...(run.cultoAtivo
        ? batalha.penalidadeFalha.efeitosCulto || batalha.penalidadeFalha.efeitos || {}
        : batalha.penalidadeFalha.efeitos || {}) };
      if (danoAnulado && efeitosFalha.hp < 0) efeitosFalha.hp = 0;
      aplicarEfeitos(run, efeitosFalha, batalha.penalidadeFalha.multiplicadores, { semBonusSeguidores: true });
      texto += ` ${batalha.penalidadeFalha.texto || ""}`;
    }
    return { texto: texto.trim(), combate: {
      venceu, dano, escudo: escudoUsado, bonusAtaque, bonusEscudo,
      danoAnulado: Boolean(danoAnulado),
      encerrarRun: !venceu && Boolean(batalha.encerrarAoFalhar),
      motivoFim: batalha.motivoFim || null
    } };
  }

  function rendaDaVila(habitantes) {
    const regra = Jogo.config.economia;
    return habitantes < regra.habitantesParaManutencao
      ? -regra.perdaPorRodada : Math.floor(habitantes / regra.habitantesPorGold);
  }

  function precoMercadoria(run, mercadoria) {
    const compras = Object.hasOwn(run.comprasMercador, mercadoria.id) ? run.comprasMercador[mercadoria.id] : 0;
    const descontoForja = run.construcoes?.includes("forja") && mercadoria.id === "arma_melhor" ? 2 : 0;
    return Math.max(0, mercadoria.preco + (mercadoria.aumentoPreco || 0) * compras - descontoForja);
  }

  function podePagar(run, mercadoria) {
    const preco = precoMercadoria(run, mercadoria);
    return Number.isSafeInteger(preco) && preco >= 0 && run.atributos.gold >= preco;
  }

  function agendarConsequencia(run, agenda, evento, opcao) {
    if (!agenda?.eventoId) return;
    const minimo = Math.max(10, Math.floor(agenda.atrasoMin || 10));
    const maximo = Math.max(minimo, Math.floor(agenda.atrasoMax || 20));
    const atraso = minimo + Math.floor(Math.random() * (maximo - minimo + 1));
    run.consequenciasAgendadas ||= [];
    run.consequenciasAgendadas.push({
      id: `${run.id}:${evento.id}:${opcao.id}:${run.rodada}:${run.consequenciasAgendadas.length}`,
      eventoId: agenda.eventoId, rodada: run.rodada + atraso, origem: evento.id
    });
  }

  function resolverOpcao(run, evento, opcao, gasto = 0) {
    run.inventarioAberto = false;
    run.avisoInventario = null;
    const antes = { ...run.atributos, hpMax: run.hpMax };
    run.atributos.gold -= gasto;
    let efeitosEscolha = opcao.efeitos || {};
    let resultado = { texto: (run.cultoAtivo && opcao.resultadoCulto) || opcao.resultado || "", combate: null };
    let desfechoEscolhido = null;
    if (opcao.testeSorte) {
      const chance = opcao.testeSorte.fatalidadeAleatoria
        ? (run.marcos.entidadeXRecusaFatalId === evento.id ? opcao.testeSorte.chance : 100)
        : opcao.testeSorte.chance;
      const sucesso = Math.random() * 100 < chance;
      const desfecho = sucesso ? opcao.testeSorte.sucesso : opcao.testeSorte.falha;
      desfechoEscolhido = desfecho;
      efeitosEscolha = { ...efeitosEscolha, ...(desfecho.efeitos || {}) };
      resultado.texto = desfecho.resultado;
    }
    let vozPuneHonra = false;
    if (opcao.combate && evento.batalha) {
      resultado = resolverCombate(run, evento.batalha);
      const desfechoCombate = resultado.combate?.venceu ? evento.batalha.vitoria : evento.batalha.derrota;
      const honraCombate = (desfechoCombate?.efeitos?.honra || 0)
        + (!resultado.combate?.venceu ? (evento.batalha.penalidadeFalha?.efeitos?.honra || 0) : 0);
      vozPuneHonra = run.condicao?.ativa === "possessao" && !run.condicao.abracada && honraCombate > 0;
      if (vozPuneHonra) aplicarEfeitos(run, { hp: -3 });
    } else {
      const honraEscolhida = (efeitosEscolha.honra || 0)
        + (opcao.definir?.honra !== undefined ? opcao.definir.honra - run.atributos.honra : 0);
      vozPuneHonra = run.condicao?.ativa === "possessao" && !run.condicao.abracada && honraEscolhida > 0;
      if (vozPuneHonra) efeitosEscolha = { ...efeitosEscolha, hp: (efeitosEscolha.hp || 0) - 3 };
    }
    const efeitosOpcao = aplicarBonusDeRecompensa(run, efeitosEscolha);
    const protecaoCeleiro = evento.protecaoCeleiro && run.construcoes?.includes("celeiro");
    aplicarEfeitos(run, efeitosOpcao, opcao.multiplicadores, { protecaoCeleiro });
    if (Number.isSafeInteger(opcao.sacrificarPopulacao) && opcao.sacrificarPopulacao > 0) {
      aplicarEfeitos(run, run.cultoAtivo
        ? { seguidores: -opcao.sacrificarPopulacao }
        : { habitantes: -opcao.sacrificarPopulacao }, {}, { semBonusSeguidores: true });
    }
    for (const [atributo, valor] of Object.entries(opcao.definir || {})) {
      if (!Jogo.atributos.includes(atributo) || !Number.isSafeInteger(valor)) continue;
      run.atributos[atributo] = atributo === "honra" ? (temItem(run, "espada_da_verdade") ? 0 : valor) : Math.max(0, valor);
    }
    if (opcao.efeitoContinuo?.revelarHonraRodadas > 0) {
      run.honraReveladaAteRodada = Math.max(run.honraReveladaAteRodada || 0,
        run.rodada + Math.floor(opcao.efeitoContinuo.revelarHonraRodadas));
    }
    if (opcao.efeitoDivino?.revelarHonraRodadas > 0) {
      run.honraReveladaAteRodada = Math.max(run.honraReveladaAteRodada || 0,
        run.rodada + Math.max(0, Math.floor(opcao.efeitoDivino.revelarHonraRodadas) - 1));
    }
    if (opcao.efeitoContinuo?.revelarHabitantesRodadas > 0) {
      run.habitantesReveladosAteRodada = Math.max(run.habitantesReveladosAteRodada || 0,
        run.rodada + Math.floor(opcao.efeitoContinuo.revelarHabitantesRodadas));
    }
    if (opcao.efeitoDivino?.revelarHabitantesRodadas > 0) {
      run.habitantesReveladosAteRodada = Math.max(run.habitantesReveladosAteRodada || 0,
        run.rodada + Math.max(0, Math.floor(opcao.efeitoDivino.revelarHabitantesRodadas) - 1));
    }
    if (opcao.efeitoDivino) ativarEfeitoDivino(run, opcao.efeitoDivino);
    if (opcao.efeitoContinuo?.seguidoresPorRodada > 0 && run.cultoAtivo) {
      run.cultoRendaPorRodada = Math.max(run.cultoRendaPorRodada || 0, opcao.efeitoContinuo.seguidoresPorRodada);
    }
    if (opcao.dissolverCulto && run.cultoAtivo) {
      run.atributos.habitantes = run.seguidoresCulto;
      run.seguidoresCulto = 0;
      run.cultoAtivo = false;
      run.flags = { ...run.flags, culto_ativo: false };
      run.cultoRendaPorRodada = 0;
    }
    run.flags = { ...run.flags, ...opcao.flags, ...desfechoEscolhido?.flags };
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
    if (opcao.efeitoTemporario && Jogo.atributos.includes(opcao.efeitoTemporario.atributo)
      && Number.isSafeInteger(opcao.efeitoTemporario.valor) && Number.isSafeInteger(opcao.efeitoTemporario.rodadas)) {
      run.efeitosTemporarios ||= [];
      run.efeitosTemporarios.push({
        atributo: opcao.efeitoTemporario.atributo, valor: opcao.efeitoTemporario.valor,
        inicioRodada: run.rodada + 1,
        fimRodada: run.rodada + Math.max(1, opcao.efeitoTemporario.rodadas),
        aplicado: false
      });
    }
    if (vozPuneHonra) resultado.texto += " A voz lhe tira 3 de Vida pela honra que sua escolha demonstra.";
    if (opcao.consequenciaTardia) agendarConsequencia(run, opcao.consequenciaTardia, evento, opcao);
    if (opcao.entidadeXCeder || desfechoEscolhido?.entidadeXCeder) {
      run.flags = { ...run.flags, entidade_x_ativa: false, entidade_x_resolvida: true, entidade_x_pacto: true };
      concederItem(run, "marca_da_entidade_x");
      resultado.texto += " Você foi enganado; achou que seguir alguém assim iria te dar algo de bom. A Marca cobrará 1 ponto de Vida a cada rodada.";
    }
    if (desfechoEscolhido?.entidadeXResistiu) {
      run.flags = { ...run.flags, entidade_x_ativa: false, entidade_x_resolvida: true, entidade_x_imune: true, entidades_maiores_liberadas: true };
      concederItem(run, "selo_da_recusa");
      resultado.texto += " Você resistiu. A Entidade não poderá voltar nesta crônica. Um selo lendário permanece em sua mão.";
    }
    if (Array.isArray(opcao.construcoes)) run.construcoes = [...new Set([...(run.construcoes || []), ...opcao.construcoes])];
    if (opcao.flags?.ponte_reparada) run.construcoes = [...new Set([...run.construcoes, "ponte"] )];
    if (opcao.flags?.moinho_reparado) run.construcoes = [...new Set([...run.construcoes, "moinho"] )];
    if (opcao.flags?.capela_erguida && !run.construcoes.includes("capela")) {
      run.construcoes.push("capela");
      aplicarEfeitos(run, { escudo: 1 });
    }
    if (evento.nemesis && run.nemesis) run.nemesis.enfrentado = true;
    if (evento.consequenciaAgendada) {
      const agendamentoIndex = (run.consequenciasAgendadas || []).findIndex(item =>
        item.eventoId === evento.id && item.rodada <= run.rodada);
      if (agendamentoIndex >= 0) run.consequenciasAgendadas.splice(agendamentoIndex, 1);
    }
    if (evento.oncePerYear) run.flags[`${evento.id}_ano_${Jogo.anoDaRodada(run.rodada)}_visto`] = true;
    if (evento.letal || evento.oncePerRun) run.flags[`${evento.id}_visto`] = true;
    if (opcao.flags?.ano_novo_ativo) run.marcos.anoNovoBase = run.rodada;
    if (opcao.flags?.bencao_norte_ativa) run.marcos.norteAtivado = run.rodada;
    const marcos = Array.isArray(opcao.marcoRodada) ? opcao.marcoRodada : opcao.marcoRodada ? [opcao.marcoRodada] : [];
    for (const marco of marcos) {
      if (!marco.id || (marco.honraMin !== undefined && antes.honra < marco.honraMin)) continue;
      run.marcos = { ...run.marcos, [marco.id]: run.rodada };
      if (marco.flag) run.flags = { ...run.flags, [marco.flag]: true };
    }
    if (opcao.armadilha && Math.random() < opcao.armadilha.chance) {
      const itensRoubaveis = run.inventario.filter(itemId =>
        !Jogo.itens.find(item => item.id === itemId)?.imuneMimico);
      const roubado = opcao.armadilha.perderItem && itensRoubaveis.length
        ? itensRoubaveis[Math.floor(Math.random() * itensRoubaveis.length)] : null;
      if (roubado) consumirItem(run, roubado, run.inventario.indexOf(roubado));
      aplicarEfeitos(run, { hp: -(opcao.armadilha.danoHp || 0) });
      const nomeRoubado = roubado ? Jogo.itens.find(item => item.id === roubado)?.nome || "um item" : null;
      resultado.texto += ` O baú se revela uma criatura e morde sua mão: você perde ${opcao.armadilha.danoHp || 0} HP${nomeRoubado ? ` e ele engole ${nomeRoubado}` : ""}.`;
    }
    const desfechoCombate = resultado.combate
      ? (resultado.combate.venceu ? evento.batalha.vitoria : evento.batalha.derrota) : null;
    const itensRecompensa = [...new Set([...(opcao.itens || []), ...(desfechoEscolhido?.itens || []), ...(desfechoCombate?.itens || [])])];
    for (const id of itensRecompensa) {
      if (id === "calice_sagrado" && run.inventario.includes(id)) {
        resultado.texto += " Você já carrega um Cálice Sagrado; não leva outro da capela.";
        continue;
      }
      if (!concederItem(run, id)) continue;
      const item = Jogo.itens.find(candidato => candidato.id === id);
      if (item) resultado.texto = `${resultado.texto} Você recebe: ${item.nome}.`.trim();
    }
    if (opcao.recompensaItemGenerico) {
      const item = sortearItemGenerico(run);
      if (item && concederItem(run, item.id)) resultado.texto = `${resultado.texto} Entre os objetos, você encontra ${item.nome}; ${item.descricao.toLowerCase()}`.trim();
    }
    if (opcao.recompensaItemEspecial) {
      const item = sortearItemEspecial(run);
      if (item && concederItem(run, item.id)) resultado.texto = `${resultado.texto} Você recebe: ${item.nome}.`.trim();
    }
    run.honraNeutraSequencia = run.atributos.honra >= -30 && run.atributos.honra <= 30
      ? Math.min(200, (run.honraNeutraSequencia || 0) + 1) : 0;
    if (run.honraNeutraSequencia >= 200 && !run.legadoDaRun.itens.includes("espada_da_verdade")) {
      Jogo.legado.conceder(run, { itens: ["espada_da_verdade"] });
    }
    run.eventosRecentes = [...run.eventosRecentes, evento.id].slice(-Jogo.config.memoriaEventos);
    if (eventoComum(evento)) {
      run.eventosComunsRun ||= [];
      if (!run.eventosComunsRun.includes(evento.id)) run.eventosComunsRun.push(evento.id);
    }
    if (evento.conselheiro) run.conselhosRecentes = [...(run.conselhosRecentes || []), evento.id].slice(-5);
    // A renda usa a população após a decisão e só é aplicada nesta resolução.
    const rendaBase = rendaDaVila(run.atributos.habitantes) + (run.construcoes.includes("ponte") && run.atributos.habitantes >= 20 ? 1 : 0);
    const rendaRegular = rendaBase > 0 && run.rodada % Jogo.config.economia.intervaloRenda !== 0 ? 0 : rendaBase;
    const rendaMercado = run.construcoes.includes("mercado_coberto") && run.rodada % 5 === 0 ? 1 : 0;
    const rendaPraca = run.construcoes.includes("praca_forca") && run.rodada % 6 === 0 ? 1 : 0;
    const renda = rendaRegular + rendaMercado + rendaPraca;
    const saldoAntesDaRenda = run.atributos.gold;
    aplicarEfeitos(run, { gold: renda });
    if (rendaMercado) resultado.texto += " O Mercado coberto rende 1 Gold.";
    if (rendaPraca) resultado.texto += " A Praça da Forca rende 1 Gold.";
    if (run.construcoes.includes("praca_forca") && run.rodada % 10 === 0) {
      if (!temItem(run, "espada_da_verdade")) {
        aplicarEfeitos(run, { honra: -1 });
        resultado.texto += " A Praça da Forca reduz sua Honra em 1.";
      }
      if (run.cultoAtivo) {
        aplicarEfeitos(run, { seguidores: 2 });
        resultado.texto += ` A Praça da Forca atrai ${temItem(run, "afogados_abencoados") && run.atributos.honra <= -90 ? 4 : 2} Seguidores para o culto.`;
      }
    }
    Jogo.druida?.registrarAno(run);
    Jogo.legado.conceder(run, opcao.desbloqueia);
    Jogo.legado.avaliar(run);
    run.fase = "resultado";
    run.ultimoResultado = {
      ...resultado, escolha: opcao.texto,
      economia: { renda, variacaoRenda: run.atributos.gold - saldoAntesDaRenda, gasto },
      alteracoes: Object.fromEntries([...Jogo.atributos, "hpMax"].map(id => [id,
        id === "hpMax" ? run.hpMax - antes.hpMax : run.atributos[id] - antes[id]]))
    };
    if (!run.cultoAtivo && run.atributos.hp > 0 && run.atributos.habitantes <= 0 && run.atributos.honra <= -30) {
      aguardarDecisaoCulto(run);
    }
    atualizarCulto(run, antes);
    concluirRodadaEfeitoDivino(run);
    const motivo = motivoDerrota(run);
    if (resultado.combate?.encerrarRun) encerrar(run, "derrota", resultado.combate.motivoFim || motivo || "A crônica chegou ao fim.");
    else if (opcao.encerramento) encerrar(run, opcao.encerramento.tipo || "derrota", opcao.encerramento.motivo || "A crônica chegou ao fim.");
    else if (motivo) encerrar(run, "derrota", motivo);
    return true;
  }

  function escolher(run, opcaoId) {
    if (run?.status !== "ativa") return false;
    if (run.aguardaDecisaoCulto && run.fase === "resultado") {
      if (opcaoId === "juntar") return juntarCulto(run);
      if (opcaoId === "encerrar") return encerrarSemCulto(run);
      return false;
    }
    if (run.fase !== "escolha") return false;
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
      registrarItemConquistado(run, item.id);
      run.inventario.push(item.id);
      registrarItemRecebido(run, item.id);
      return resolverOpcao(run, evento, {
        texto: `Comprar ${item.nome}.`, resultado: `${item.nome} guardado no inventário. Você poderá usá-lo quando decidir.`
      }, preco);
    }
    return resolverOpcao(run, evento, mercadoria, preco);
  }

  function usarItem(run, itemId, alvoSacrificio = null) {
    if (run?.status !== "ativa" || !Array.isArray(run.inventario)) return false;
    const item = Jogo.itens.find(item => item.id === itemId);
    const indice = run.inventario.indexOf(itemId);
    if (!item || indice < 0 || !item.uso || !podeUsarItem(run, itemId, alvoSacrificio)) return false;
    const uso = item.uso;
    const escudoDaFe = itemId !== "adaga_cerimonial" && temItem(run, "escudo_da_fe")
      && !uso.umaVezPorRun && !uso.ignorarEscudoDaFe;
    if (uso.bosqueSagrado) {
      if (!Jogo.druida?.plantarBosque(run)) return false;
      consumirItem(run, itemId, indice);
      run.flags[`usou_${itemId}`] = true;
      if (run.ultimoResultado) run.ultimoResultado.texto += " Você planta a semente. O bosque sagrado permanecerá nesta crônica.";
      return true;
    }
    if (uso.curarCondicao) {
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
      const motivo = motivoDerrota(run);
      if (motivo) encerrar(run, "derrota", motivo);
      return true;
    }
    if (itemId === "adaga_cerimonial") {
      if (!["habitantes", "culto"].includes(alvoSacrificio)) return false;
      const antes = { ...run.atributos };
      consumirItem(run, itemId, indice);
      if (alvoSacrificio === "culto") run.seguidoresCulto -= 10;
      else aplicarEfeitos(run, { habitantes: -10 });
      aplicarEfeitos(run, { ataque: 10 });
      run.flags.adaga_cerimonial_usada = true;
      const textoUso = alvoSacrificio === "culto"
        ? "A Adaga cerimonial consome dez seguidores; seu Ataque aumenta em 10."
        : "A Adaga cerimonial consome dez habitantes; seu Ataque aumenta em 10.";
      if (run.fase === "resultado" && run.ultimoResultado) {
        run.ultimoResultado.texto += ` ${textoUso}`;
        for (const atributo of Jogo.atributos) {
          run.ultimoResultado.alteracoes[atributo] += run.atributos[atributo] - antes[atributo];
        }
      }
      if (!run.cultoAtivo && run.atributos.habitantes <= 0 && run.atributos.honra <= -30 && run.atributos.hp > 0) {
        if (run.fase === "escolha") {
          run.fase = "resultado";
          run.ultimoResultado = {
            texto: textoUso, escolha: "Usar a Adaga cerimonial.", combate: null,
            alteracoes: Object.fromEntries(Jogo.atributos.map(atributo => [atributo, run.atributos[atributo] - antes[atributo]]))
          };
        }
        aguardarDecisaoCulto(run);
        if (run.ultimoResultado) run.ultimoResultado.texto = "O último habitante se foi.";
      }
      const motivo = motivoDerrota(run);
      if (motivo) encerrar(run, "derrota", motivo);
      return true;
    }
    if (uso.tomoEsquecimento) {
      consumirItem(run, itemId, indice);
      run.flags = { ...run.flags, usou_tomo_do_esquecimento: true };
      aplicarEfeitos(run, { habitantes: 10, honra: -10, hp: -10 });
      if (run.ultimoResultado) run.ultimoResultado.texto += " O Tomo converte dez soldados inimigos; dez habitantes se juntam à vila, mas você perde 10 de Honra e 10 de Vida.";
      const motivo = motivoDerrota(run);
      if (motivo) encerrar(run, "derrota", motivo);
      return true;
    }
    if (uso.cajadoDaDor) {
      consumirItem(run, itemId, indice);
      run.flags = { ...run.flags, usou_cajado_da_dor: true };
      const metade = Math.ceil(run.atributos.hp / 2);
      aplicarEfeitos(run, { hp: -metade, hpMax: 20 });
      if (run.ultimoResultado) run.ultimoResultado.texto += ` O Cajado consome metade da sua Vida atual (${metade}) e aumenta sua Vida máxima em 20.`;
      const motivo = motivoDerrota(run);
      if (motivo) encerrar(run, "derrota", motivo);
      return true;
    }
    if (uso.bacamarte) {
      consumirItem(run, itemId, indice);
      run.flags = { ...run.flags, usou_bacamarte: true };
      run.efeitosPreparados.bacamarteBatalhas = 3;
      return true;
    }
    if (uso.cintoDosVentos) {
      consumirItem(run, itemId, indice);
      run.flags = { ...run.flags, cinto_vento_ativo: true, usou_cinto_dos_ventos: true };
      run.efeitosPreparados.bonusAtaqueProximaBatalha += 100;
      return true;
    }
    if (uso.sacrificarHabitantes) {
      const antes = { ...run.atributos };
      registrarUsoComRecarga(run, item, indice, escudoDaFe);
      aplicarEfeitos(run, { habitantes: -uso.sacrificarHabitantes });
      if (uso.efeitos) aplicarEfeitos(run, uso.efeitos);
      if (run.fase === "resultado" && run.ultimoResultado) {
        run.ultimoResultado.texto += ` A mordida mata ${uso.sacrificarHabitantes === 1 ? "um aldeão" : `${uso.sacrificarHabitantes} aldeões`} e recupera ${uso.efeitos?.hp || 0} de Vida.`;
        for (const atributo of Jogo.atributos) run.ultimoResultado.alteracoes[atributo] += run.atributos[atributo] - antes[atributo];
      }
      const motivo = motivoDerrota(run);
      if (motivo) encerrar(run, "derrota", motivo);
      return true;
    }
    if (uso.sacrificarPopulacao) {
      registrarUsoComRecarga(run, item, indice, escudoDaFe);
      aplicarEfeitos(run, run.cultoAtivo
        ? { seguidores: -uso.sacrificarPopulacao }
        : { habitantes: -uso.sacrificarPopulacao }, {}, { semBonusSeguidores: true });
      if (uso.efeitos) aplicarEfeitos(run, uso.efeitos);
      run.efeitosPreparados.bonusAtaqueProximaBatalha += uso.bonusAtaqueProximaBatalha || 0;
      const motivo = motivoDerrota(run);
      if (motivo) encerrar(run, "derrota", motivo);
      return true;
    }
    if (uso.umaVezPorRun) {
      consumirItem(run, itemId, indice);
      run.flags = { ...run.flags, [`usou_${itemId}`]: true };
    } else registrarUsoComRecarga(run, item, indice, escudoDaFe);
    if (uso.efeitos) aplicarEfeitos(run, uso.efeitos);
    const preparados = run.efeitosPreparados || {};
    run.efeitosPreparados = {
      bloquearDanoProximaBatalha: preparados.bloquearDanoProximaBatalha || Boolean(uso.bloquearDanoProximaBatalha),
      bonusAtaqueProximaBatalha: (preparados.bonusAtaqueProximaBatalha || 0) + (uso.bonusAtaqueProximaBatalha || 0),
      bonusEscudoProximaBatalha: (preparados.bonusEscudoProximaBatalha || 0) + (uso.bonusEscudoProximaBatalha || 0),
      bonusGoldProximaRecompensa: (preparados.bonusGoldProximaRecompensa || 0) + (uso.bonusGoldProximaRecompensa || 0),
      bacamarteBatalhas: preparados.bacamarteBatalhas || 0,
      escudoFeCooldown: preparados.escudoFeCooldown || 0
    };
    const motivo = motivoDerrota(run);
    if (motivo) encerrar(run, "derrota", motivo);
    return true;
  }

  function podeUsarItem(run, itemId, alvoSacrificio = null) {
    if (run?.status !== "ativa" || !["escolha", "resultado"].includes(run.fase)) return false;
    const item = Jogo.itens.find(item => item.id === itemId);
    if (!item?.uso || !run?.inventario?.includes(itemId)) return false;
    if (item.uso.condicaoAtiva && run.condicao?.ativa !== item.uso.condicaoAtiva) return false;
    if (item.uso.bloquearSeAbracada && run.condicao?.abracada) return false;
    if (itemId === "adaga_cerimonial") {
      if (run.aguardaDecisaoCulto || run.flags.adaga_cerimonial_usada) return false;
      const habitantes = run.atributos.habitantes >= 10;
      const seguidores = run.cultoAtivo && run.seguidoresCulto >= 10;
      if (alvoSacrificio === "habitantes") return habitantes;
      if (alvoSacrificio === "culto") return seguidores;
      return alvoSacrificio === null && (habitantes || seguidores);
    }
    if (item.uso.bosqueSagrado && (!Jogo.druida?.ehDruida(run) || run.flags.bosque_sagrado)) return false;
    if (item.uso.umaVezPorRun && run.flags[`usou_${itemId}`]) return false;
    if (item.uso.curarCondicao && (!run.condicao?.ativa || (run.condicao.abracada && !item.uso.curaUniversal))) return false;
    if (item.uso.sacrificarHabitantes
      && (run.atributos.habitantes <= item.uso.sacrificarHabitantes
        || (item.uso.efeitos?.hp > 0 && run.atributos.hp >= run.hpMax))) return false;
    if (item.uso.sacrificarPopulacao) {
      const alvo = run.cultoAtivo ? "culto" : "habitantes";
      const populacao = run.cultoAtivo ? run.seguidoresCulto : run.atributos.habitantes;
      if ((alvoSacrificio && alvoSacrificio !== alvo) || populacao <= item.uso.sacrificarPopulacao) return false;
    }
    if (recargaItemRestante(run, itemId) > 0) return false;
    if (item.uso.tomoEsquecimento) {
      const evento = Jogo.eventos.find(carta => carta.id === run.eventoId);
      if (run.fase !== "escolha" || !evento?.batalha) return false;
    }
    if (item.uso.cintoDosVentos && run.flags.cinto_vento_ativo) return false;
    return !(temItem(run, "escudo_da_fe") && !item.uso.umaVezPorRun && run.efeitosPreparados.escudoFeCooldown > 0);
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
    const item = Jogo.itens.find(candidato => candidato.id === itemId);
    if (item?.aoConsumir) aplicarEfeitos(run, item.aoConsumir);
  }

  function recargaItemRestante(run, itemId) {
    const item = Jogo.itens.find(candidato => candidato.id === itemId);
    const recarga = item?.uso?.recargaRodadas;
    if (!Number.isSafeInteger(recarga) || recarga < 1) return 0;
    const usadoEm = run.itensConsumidosEm?.[itemId];
    const recargaPropria = Number.isSafeInteger(usadoEm)
      ? Math.max(0, recarga - (run.rodada - usadoEm)) : 0;
    const recargaEscudo = !item?.uso?.ignorarEscudoDaFe && temItem(run, "escudo_da_fe")
      ? run.efeitosPreparados?.escudoFeCooldown || 0 : 0;
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
    const item = Jogo.itens.find(item => item.id === itemId);
    if (!item) return false;
    if (itemId === "mascara_de_cervo" && temItem(run, itemId)) return false;
    registrarItemConquistado(run, itemId);
    registrarItemRecebido(run, itemId);
    if (item.aoReceber) {
      aplicarEfeitos(run, item.aoReceber);
      if (item.aoReceber.lancaHeroiBatalhas) run.lancaHeroiBatalhas = item.aoReceber.lancaHeroiBatalhas;
      if (itemId === "espada_da_verdade") run.atributos.honra = 0;
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
    return Jogo.itens.find(item => item.id === run.ofertaMercador && item.mercador
      && Jogo.legado.disponivel(item, "itens", run.legadoDaRun)) || null;
  }

  function testarHonra(run, variacao) {
    if (run?.status !== "ativa" || ![30, -30].includes(variacao)) return false;
    if (temItem(run, "espada_da_verdade")) { run.atributos.honra = 0; return false; }
    const honra = run.atributos.honra + variacao;
    if (!Number.isSafeInteger(honra)) return false;
    run.atributos.honra = honra;
    return true;
  }

  function debugDiminuirHabitantes(run) {
    if (run?.status !== "ativa") return false;
    const antes = run.atributos.habitantes;
    if (antes <= 0) return false;
    run.atributos.habitantes = Math.max(0, antes - 50);
    if (run.fase === "resultado" && !run.cultoAtivo && run.atributos.hp > 0 && run.atributos.habitantes <= 0) {
      if (run.atributos.honra <= -30) aguardarDecisaoCulto(run);
      else encerrar(run, "derrota", "A última casa ficou vazia. Sem habitantes, o vilarejo chegou ao fim.");
    }
    return true;
  }

  function limparCondicaoDebug(run) {
    if (run.condicao?.ativa) removerCondicao(run, false);
    run.condicao = { ativa: null, rodada: null, abracada: false, curada: false, bonusAbraco: { ataque: 0, escudo: 0 } };
    delete run.flags.condicao_decidida;
    delete run.flags.condicao_abracada;
    delete run.flags.condicao_curada;
    delete run.marcos.condicao;
  }

  function debugAtivarContagio(run, eventoId) {
    if (run?.status !== "ativa" || run.aguardaDecisaoCulto) return false;
    const evento = Jogo.eventos.find(candidato => candidato.id === eventoId
      && ["uivos_no_bosque", "hospede_palido", "anel_do_defunto"].includes(candidato.id));
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

  function debugForcarCondicao(run, id) {
    if (run?.status !== "ativa" || run.aguardaDecisaoCulto || !modificadoresCondicao[id]) return false;
    const antes = { ...run.atributos };
    const eventoAtual = Jogo.eventos.find(evento => evento.id === run.eventoId);
    limparCondicaoDebug(run);
    if (!ativarCondicao(run, id)) return false;
    if (run.fase === "escolha" && eventoAtual?.marcaCondicaoDecidida) {
      run.fase = "resultado";
      run.ultimoResultado = {
        texto: `Debug: ${id === "licantropia" ? "licantropia" : id === "vampirismo" ? "vampirismo" : "possessão"} ativada.`,
        escolha: "Forçar condição sobrenatural", combate: null,
        alteracoes: Object.fromEntries(Jogo.atributos.map(atributo => [atributo, run.atributos[atributo] - antes[atributo]]))
      };
    }
    return true;
  }

  function debugAtivarEventoEspecial(run, categoria) {
    if (run?.status !== "ativa" || run.aguardaDecisaoCulto) return false;
    const limparFlags = predicado => {
      for (const id of Object.keys(run.flags)) if (predicado(id)) delete run.flags[id];
    };
    const eventosEntidade = Jogo.eventos.filter(evento => evento.entidadeX || evento.entidadeXInicio);
    const eventosAbissais = Jogo.eventos.filter(evento => evento.abissal);
    let evento = null;

    if (categoria === "entidade") {
      evento = Jogo.eventos.find(candidato => candidato.id === "entidade_x_chegada");
      if (!evento) return false;
      run.rodada = Math.max(8, run.rodada);
      run.estacao = Jogo.estacaoDaRodada(run.rodada, run);
      limparFlags(id => id.startsWith("entidade_x_") || id.startsWith("abissal_")
        || id === "mare_selada" || id === "palavras_lembradas" || id === "senhor_do_abismo"
        || eventosEntidade.some(candidato => id === `especial_${candidato.id}`)
        || eventosAbissais.some(candidato => id === `especial_${candidato.id}`));
      delete run.marcos.entidadeXAparicoes;
      delete run.marcos.entidadeXUltimoEvento;
      delete run.marcos.entidadeXRecusaFatalId;
    } else if (categoria === "abissal") {
      evento = Jogo.eventos.find(candidato => candidato.id === "sonhos_umidos");
      if (!evento) return false;
      run.rodada = Math.max(8, run.rodada);
      run.estacao = Jogo.estacaoDaRodada(run.rodada, run);
      limparFlags(id => id.startsWith("entidade_x_") || id.startsWith("abissal_")
        || id === "mare_selada" || id === "palavras_lembradas" || id === "senhor_do_abismo"
        || eventosEntidade.some(candidato => id === `especial_${candidato.id}`)
        || eventosAbissais.some(candidato => id === `especial_${candidato.id}`));
      run.flags.entidades_maiores_liberadas = true;
    } else if (categoria === "zodiaco") {
      const eventos = Jogo.eventos.filter(candidato => candidato.zodiaco);
      if (!eventos.length) return false;
      evento = eventos.find(candidato => !run.flags[`especial_${candidato.id}`] && !run.flags[`${candidato.id}_visto`]);
      if (!evento) {
        for (const candidato of eventos) {
          delete run.flags[`especial_${candidato.id}`];
          delete run.flags[`${candidato.id}_visto`];
        }
        evento = eventos[0];
      }
      run.flags.ano_novo_ativo = true;
      delete run.flags.ano_novo_recusado;
      run.marcos.anoNovoBase = run.rodada;
      run.janelaZodiaco = { marco: 0, eventoId: evento.id };
    } else if (categoria === "norte") {
      const eventos = Jogo.eventos.filter(candidato => candidato.divino);
      if (!eventos.length) return false;
      evento = eventos.find(candidato => !run.flags[`especial_${candidato.id}`]);
      if (!evento) {
        for (const candidato of eventos) delete run.flags[`especial_${candidato.id}`];
        evento = eventos[0];
      }
      run.flags.bencao_norte_ativa = true;
      delete run.flags.bencao_norte_recusada;
      run.marcos.norteAtivado = run.rodada;
    } else return false;

    run.fase = "escolha";
    run.ultimoResultado = null;
    run.aguardaDecisaoCulto = false;
    run.inventarioAberto = false;
    run.avisoInventario = null;
    return registrarSorteio(run, evento);
  }

  function avancar(run) {
    if (run.status !== "ativa" || run.fase !== "resultado") return false;
    const proximaRodada = run.rodada + 1;
    const antesDoEfeito = { ...run.atributos };
    run.rodada = proximaRodada;
    run.estacao = Jogo.estacaoDaRodada(run.rodada, run);
    Jogo.druida?.iniciar(run);
    aplicarEfeitosTemporarios(run);
    aplicarEfeitoCondicaoRodada(run);
    const curaEnfermaria = run.construcoes.includes("enfermaria_ervateira") && run.atributos.hp < 60 ? 1 : 0;
    aplicarEfeitos(run, { hp: (temItem(run, "gato_companheiro") ? 1 : 0) + (run.construcoes.includes("moinho") ? 1 : 0) + curaEnfermaria });
    if (run.cultoAtivo && run.cultoRendaPorRodada > 0) {
      const dobro = temItem(run, "afogados_abencoados") && run.atributos.honra <= -90 ? 2 : 1;
      run.seguidoresCulto += run.cultoRendaPorRodada * dobro;
    }
    if (run.efeitosPreparados.escudoFeCooldown > 0) run.efeitosPreparados.escudoFeCooldown -= 1;
    aplicarRodadaEfeitoDivino(run);
    if (run.flags.entidade_x_pacto) aplicarEfeitos(run, { hp: -1 });
    if (!run.cultoAtivo && run.atributos.hp > 0 && run.atributos.habitantes <= 0 && run.atributos.honra <= -30) {
      concluirRodadaEfeitoDivino(run);
      aguardarDecisaoCulto(run);
      run.ultimoResultado = {
        texto: "O último habitante se foi.",
        escolha: "A passagem de mais uma rodada", combate: null,
        alteracoes: Object.fromEntries(Jogo.atributos.map(id => [id, run.atributos[id] - antesDoEfeito[id]]))
      };
      return true;
    }
    const motivo = motivoDerrota(run);
    if (motivo) { encerrar(run, "derrota", motivo); return true; }
    prepararJanelaZodiaco(run, proximaRodada);
    const evento = sortear(run);
    if (!evento) {
      encerrar(run, "vitoria", "A crônica chegou ao fim: não há mais acontecimentos elegíveis.");
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
    if (!run.flags.ano_novo_ativo || !Number.isSafeInteger(base)) { run.janelaZodiaco = null; return; }
    const desdeBase = rodada - base;
    const marco = desdeBase < 50 ? 0 : Math.floor((desdeBase - 50) / 50) + 1;
    const inicio = base + 50 * marco;
    const dentroDaJanela = marco > 0 && rodada >= inicio && rodada < inicio + 10;
    if (!dentroDaJanela) {
      run.janelaZodiaco = null;
      return;
    }
    if (run.janelaZodiaco?.marco === marco) return;
    const disponiveis = Jogo.eventos.filter(evento => evento.zodiaco && !run.flags[`${evento.id}_visto`]);
    const evento = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    run.janelaZodiaco = evento ? { marco, eventoId: evento.id } : null;
  }

  function ativarEfeitoDivino(run, definicao) {
    const duracao = Math.max(1, Math.min(10, Math.floor(definicao.duracao || 10)));
    const modificadoresAplicados = {};
    for (const [atributo, valor] of Object.entries(definicao.modificadores || {})) {
      if (!Jogo.atributos.includes(atributo) || !Number.isSafeInteger(valor)) continue;
      const antes = run.atributos[atributo];
      aplicarEfeitos(run, { [atributo]: valor });
      modificadoresAplicados[atributo] = run.atributos[atributo] - antes;
    }
    run.efeitoDivino = {
      nome: definicao.nome, restantes: duracao, inicio: run.rodada,
      modificadoresAplicados,
      porRodada: definicao.porRodada || null,
      reducaoDano: definicao.reducaoDano || 0,
      reducaoGanhoGold: definicao.reducaoGanhoGold || 0,
      revelarHonraRodadas: definicao.revelarHonraRodadas || 0,
      revelarHabitantesRodadas: definicao.revelarHabitantesRodadas || 0
    };
  }

  function aplicarRodadaEfeitoDivino(run) {
    const efeito = run.efeitoDivino;
    if (!efeito || run.rodada <= efeito.inicio || efeito.ultimaRodada === run.rodada) return;
    efeito.ultimaRodada = run.rodada;
    const rodada = run.rodada - efeito.inicio;
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
    if (!efeito || run.rodada <= efeito.inicio || !efeito.ultimaRodada || efeito.ultimaRodada !== run.rodada) return;
    efeito.restantes -= 1;
    if (efeito.restantes > 0) return;
    for (const [atributo, valor] of Object.entries(efeito.modificadoresAplicados || {})) {
      aplicarEfeitos(run, { [atributo]: -valor });
    }
    run.efeitoDivino = null;
    if (run.ultimoResultado) run.ultimoResultado.texto += " O efeito divino termina.";
  }

  function registrarSorteio(run, evento) {
    if (!run || !evento) return false;
    run.eventoId = evento.id;
    if (evento.entidadeXInicio) {
      run.flags = { ...run.flags, entidade_x_ativa: true };
      run.marcos.entidadeXAparicoes = (run.marcos.entidadeXAparicoes || 0) + 1;
      run.marcos.entidadeXUltimoEvento = run.rodada;
      const recusasArriscadas = Jogo.eventos.filter(carta => carta.entidadeX
        && carta.opcoes?.some(opcao => opcao.testeSorte?.fatalidadeAleatoria));
      run.marcos.entidadeXRecusaFatalId = recusasArriscadas[Math.floor(Math.random() * recusasArriscadas.length)]?.id || null;
    } else if (evento.entidadeX) {
      run.marcos.entidadeXAparicoes = (run.marcos.entidadeXAparicoes || 0) + 1;
      run.marcos.entidadeXUltimoEvento = run.rodada;
    }
    run.ofertaMercador = null;
    run.recompensasBau = null;
    run.opcoesSorteadas = [];
    const opcoesBau = prepararBau(run, evento);
    if (evento.poolOpcoes) {
      const correta = evento.poolOpcoes.find(opcao => opcao.id === evento.opcaoCorreta);
      const restantes = evento.poolOpcoes.filter(opcao => opcao.id !== evento.opcaoCorreta
        && cumpre(opcao.requisitos, run, "escolha"));
      for (let i = restantes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [restantes[i], restantes[j]] = [restantes[j], restantes[i]];
      }
      const sorteadas = [correta, ...restantes.slice(0, 2)];
      for (let i = sorteadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorteadas[i], sorteadas[j]] = [sorteadas[j], sorteadas[i]];
      }
      run.opcoesSorteadas = sorteadas.filter(Boolean).map(opcao => opcao.id);
    } else if (opcoesBau) {
      const sorteadas = [...opcoesBau];
      for (let i = sorteadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorteadas[i], sorteadas[j]] = [sorteadas[j], sorteadas[i]];
      }
      run.opcoesSorteadas = sorteadas.map(opcao => opcao.id);
    } else if (evento.tipo !== "mercador" && evento.opcoes?.length > 1) {
      const ordem = evento.opcoes.filter(opcao => cumpre(opcao.requisitos, run, "escolha"));
      for (let i = ordem.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
      }
      run.opcoesSorteadas = ordem.map(opcao => opcao.id);
    }
    if (evento.divino) run.marcos.norteUltimaOferta = run.rodada;
    if (evento.id === "mercador_chines" && run.flags.ano_novo_ativo) run.marcos.anoNovoBase = run.rodada;
    if (evento.id === "emissario_do_norte" && run.flags.bencao_norte_ativa) run.marcos.norteAtivado = run.rodada;
    if (evento.tipo === "mercador") {
      const ofertas = Jogo.itens.filter(item => item.mercador && Jogo.legado.disponivel(item, "itens", run.legadoDaRun));
      if (ofertas.length) run.ofertaMercador = ofertas[Math.floor(Math.random() * ofertas.length)].id;
    }
    Jogo.druida?.prepararEvento(run, evento);
    if (evento.especial) run.flags = { ...run.flags, [`especial_${evento.id}`]: true };
    return true;
  }

  Jogo.engine = { cumpre, pools, opcoes, peso, sortear, escolher, comprar, usarItem, podeUsarItem, recargaItemRestante, concederItem, sortearItemGenerico, batalhaAjustada, juntarCulto, encerrarSemCulto, ofertaMercador, precoMercadoria, podePagar, rendaDaVila, testarHonra, debugDiminuirHabitantes, debugAtivarContagio, debugForcarCondicao, debugAtivarEventoEspecial, eventoCondicaoDevido, curarCondicao, sincronizarItemVampirismo, avancar, registrarSorteio, encerrar, motivoDerrota };
})();
