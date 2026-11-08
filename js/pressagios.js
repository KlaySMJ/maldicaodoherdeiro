(function () {
  "use strict";
  const Jogo = window.Jogo;
  const regras = { primeiraRodada: 25, chance: 0.02, intervalo: 50, limite: 3 };
  const catalogo = [
    {
      id: "lua_vermelha",
      nome: "A Lua Vermelha",
      duracao: 25,
      texto:
        "A lua nasce vermelha sobre os campos. Dentro do salão, as sombras dos moradores continuam voltadas para ela, mesmo depois que fecham as portas.",
      regra:
        "Ao fim de 25 rodadas, tenha perdido menos de 40 de Vida em relação ao anúncio. Curar pode evitar a queda.",
      sucesso: "+2 Gold.",
      falha: "Perda de 20 habitantes.",
    },
    {
      id: "cometa_cinzas",
      nome: "O Cometa de Cinzas",
      duracao: 50,
      texto:
        "Uma estrela deixa um rastro sobre a vila. Todas as manhãs, cinzas cobrem os telhados, embora ninguém encontre fogo.",
      regra: "Termine as próximas 50 rodadas com pelo menos 30 Gold. A reserva não será descontada.",
      sucesso: "Recupera 5 de Vida.",
      falha: "Perda de 20 de Vida e 10 habitantes.",
    },
    {
      id: "nuvem_faminta",
      nome: "A Nuvem Faminta",
      duracao: 50,
      texto:
        "Um lavrador chega com um gafanhoto preso no punho. Outros cobrem as cercas e os telhados; além dos campos, uma nuvem avança contra o vento.",
      regra:
        "Invista 15 Gold em escolhas de auxílio à vila durante 50 rodadas. Compras pessoais e renda automática não contam.",
      sucesso: "+5 habitantes.",
      falha: "Perda de 15 habitantes e 10 de Vida.",
    },
    {
      id: "ferrugem_negra",
      nome: "A Ferrugem Negra",
      duracao: 50,
      texto:
        "O ferreiro aperta uma fivela entre os dedos, e o metal se desfaz. Na manhã seguinte, o mesmo pó negro cobre as armaduras dos guardas.",
      regra:
        "Em 50 rodadas, aumente o Escudo do anúncio em 50%, com aumento mínimo de 2. Os percentuais arredondam para cima.",
      sucesso: "+20% do Escudo final, permanente.",
      falha: "Perda de 40% da Vida atual, preservando pelo menos 1 de Vida.",
    },
    {
      id: "corvos",
      nome: "Os corvos",
      duracao: 50,
      texto:
        "Dois corvos ocupam os telhados da praça e acompanham o vilarejo em silêncio. Quando você volta ao salão, encontra uma pena negra sobre a sua cadeira.",
      regra:
        "Some 50 pontos positivos de Honra por decisões em 50 rodadas. Perdas posteriores não apagam o progresso; passivas não contam.",
      sucesso: "Olhar de Odin por 20 rodadas: revela sua Honra e os habitantes.",
      falha: "Uma maldição nórdica aleatória por 10 rodadas.",
    },
    {
      id: "noite_lamento",
      nome: "A Noite do Lamento",
      duracao: 100,
      texto:
        "Um viajante conta que, na aldeia além do rio, os primogênitos morreram na mesma noite. Outras famílias chegam atrás dele, carregando os filhos e trazendo nas roupas o sangue com que marcaram suas portas.",
      regra:
        "Ao fim de 100 rodadas, tenha 20 habitantes a mais do que no anúncio. Novas chegadas precisam compensar as perdas.",
      sucesso: "+10 habitantes adicionais.",
      falha: "Perda de 20 habitantes.",
    },
    {
      id: "procissao",
      nome: "A Procissão sem Rostos",
      duracao: 50,
      texto:
        "Uma procissão atravessa a estrada com velas apagadas. Quando os vigias se aproximam, as figuras erguem a cabeça; sob os capuzes, não há olhos nem boca. A cada noite, param diante das casas de quem pediu ajuda e não recebeu.",
      regra:
        "Faça 12 escolhas de auxílio aos moradores em 50 rodadas. Auxílios sem custo também contam, uma vez por decisão.",
      sucesso: "+10 de Vida máxima permanente e recupera 10 de Vida.",
      falha: "Perda de 20 de Vida e 5 habitantes.",
    },
    {
      id: "vinda_barao",
      nome: "A Vinda do Barão",
      duracao: 50,
      texto:
        "Um mensageiro de estandarte cinzento entrega uma carta selada. O barão virá à vila, e os soldados que o acompanham já recolhem provisões nas aldeias do caminho.",
      regra:
        "Conquiste 40 Gold por decisões durante 50 rodadas. A renda automática não conta; gastar os ganhos não apaga o progresso.",
      sucesso: "Os comerciantes retornam: +10 Gold.",
      falha: "Os soldados levam metade do Gold disponível e causam 10 de dano.",
    },
    {
      id: "sombra_coroada",
      nome: "A Sombra Coroada",
      duracao: 25,
      honraMax: -30,
      texto:
        "Sua sombra deixa de acompanhar seus passos e permanece junto à cadeira do salão. Sobre a cabeça dela, uma coroa de pontas compridas se move quando alguém pede clemência.",
      regra:
        "Durante 25 rodadas, evite decisões que concedam Honra. Uma violação fica registrada, mesmo se perder Honra depois. A intenção da escolha conta antes das proteções; passivas não contam.",
      sucesso: "+15% de Ataque permanente.",
      falha: "Perda permanente de 20% do Ataque.",
    },
    {
      id: "testemunha_pedra",
      nome: "A Testemunha de Pedra",
      duracao: 25,
      honraMin: 30,
      texto:
        "Uma estátua aparece na praça durante a noite, com as mãos cobrindo o rosto. Pela manhã, lágrimas escuras escorrem entre os dedos, e o chão à sua volta guarda marcas de joelhos.",
      regra:
        "Durante 25 rodadas, evite decisões que retirem Honra. Recuperar Honra não apaga uma violação. A intenção da escolha conta antes das proteções; passivas não contam.",
      sucesso: "+15% de Escudo permanente.",
      falha: "Perda permanente de 20% do Escudo.",
    },
  ];
  for (const item of catalogo) item.imagem = `assets/eventos-pressagios/${item.id}.webp`;
  const porId = (id) => catalogo.find((item) => item.id === id);
  const auxilios = new Set([
    "ponte_partida:madeira",
    "poco_turvo:consertar",
    "febre_do_poco:remedios",
    "pedreira:alimentar",
    "orfao:pao",
    "orfao_cresce:ferreiro",
    "moinho_parado:consertar",
    "bardo:abrigar",
    "mercador_de_gente:libertar",
    "ratos:gatos",
    "sino_rachado:fundir",
    "sino_rachado:remendar",
    "pao_contado:abrir",
    "culto_do_poco:cavar",
    "viuva:pensao",
    "boticario:quarto",
    "oleiro:financiar",
    "criancas_floresta:guardas",
    "enfermaria_sem_lenha:aquecer_enfermaria",
    "enfermaria_sem_lenha:desmontar_enfermaria",
    "poco_duas_aldeias:dividir_poco",
    "carroca_atolada:pagar_carroca",
    "livro_das_racoes:conferir_racoes",
    "livro_das_racoes:repartir_racoes",
    "casa_muda_de_dono:acolher_casa_vazia",
    "casa_muda_de_dono:cozinha_comum",
    "caravana_da_ponte:abrigo_sem_pedagio",
    "cinzas_no_abrigo:reconstruir_lareira",
    "aviso_recebido:abrigo_caravana",
    "primeira_distribuicao:construir_cisterna",
    "primeira_distribuicao:reservar_cisterna_enfermaria",
    "fila_no_portao:acolher_familia_olho",
    "pressagio_preparativos:pagar",
    "pressagio_preparativos:trabalhar",
  ]);
  function vazio() {
    return { atual: null, efeito: null, historico: [], ultimaTentativa: 0, ultimaResolucao: 0, naturais: 0 };
  }
  const estado = (run) => (run.pressagios ||= vazio());
  const bloqueia = (run) => ["anuncio", "resultado"].includes(run?.pressagios?.atual?.fase);
  const emPrazo = (run) => {
    const p = run.pressagios?.atual;
    return p?.fase === "ativo" && run.rodada > p.anuncio && run.rodada <= p.fim;
  };
  const metaEscudo = (p) => p.referencias.escudo + Math.max(2, Math.ceil(p.referencias.escudo * 0.5));
  function disponivel(run, item) {
    return (
      run.rodada + item.duracao <= Jogo.config.rodadasVitoria &&
      (item.honraMin === undefined || run.atributos.honra >= item.honraMin) &&
      (item.honraMax === undefined || run.atributos.honra <= item.honraMax) &&
      !(run.cultoAtivo && item.id === "noite_lamento")
    );
  }
  function anunciar(run, id, debug = false) {
    if (run?.status !== "ativa" || run.aguardaDecisaoCulto || run.encontroLeste) return false;
    const s = estado(run),
      item = porId(id);
    if (!item || s.atual || (!debug && !disponivel(run, item))) return false;
    s.atual = {
      id,
      fase: "anuncio",
      anuncio: run.rodada,
      fim: run.rodada + item.duracao,
      referencias: {
        hp: run.atributos.hp,
        escudo: run.atributos.escudo,
        habitantes: run.atributos.habitantes,
      },
      progresso: { honra: 0, gold: 0, gasto: 0, auxilios: 0, violacoes: 0 },
      ultimaAuxilio: run.rodada,
      retomarAvanco: !debug,
      debug,
      resultado: null,
    };
    if (!debug) s.naturais += 1;
    return true;
  }
  function confirmar(run) {
    const p = run?.pressagios?.atual;
    if (run?.status !== "ativa" || !p || !["anuncio", "resultado"].includes(p.fase)) return null;
    const retomar = p.retomarAvanco;
    if (p.fase === "anuncio") p.fase = "ativo";
    else run.pressagios.atual = null;
    return { retomar };
  }
  function cumpriu(run, p) {
    const a = run.atributos,
      g = p.progresso;
    switch (p.id) {
      case "lua_vermelha":
        return p.referencias.hp - a.hp < 40;
      case "cometa_cinzas":
        return a.gold >= 30;
      case "nuvem_faminta":
        return g.gasto >= 15;
      case "ferrugem_negra":
        return a.escudo >= metaEscudo(p);
      case "corvos":
        return g.honra >= 50;
      case "noite_lamento":
        return a.habitantes >= p.referencias.habitantes + 20;
      case "procissao":
        return g.auxilios >= 12;
      case "vinda_barao":
        return g.gold >= 40;
      default:
        return g.violacoes === 0;
    }
  }
  function removerEfeito(run) {
    const s = estado(run),
      e = s.efeito;
    if (!e) return;
    for (const [atributo, valor] of Object.entries(e.modificadoresAplicados))
      run.atributos[atributo] = Math.max(0, run.atributos[atributo] - valor);
    s.efeito = null;
  }
  function efeitoNordico(run, sucesso, aleatorio) {
    const s = estado(run);
    removerEfeito(run);
    const maldicoes = Jogo.efeitosNordicos.filter((item) => item.tipo === "maldicao");
    const definicao = sucesso
      ? Jogo.eventoPorId("bencao_odin").opcoes.find((o) => o.id === "sacrificio").efeitoDivino
      : maldicoes[Math.min(maldicoes.length - 1, Math.floor(aleatorio() * maldicoes.length))];
    const aplicados = {};
    for (const [atributo, valor] of Object.entries(definicao.modificadores || {})) {
      const antes = run.atributos[atributo];
      Jogo.engine.aplicarEfeitos(run, { [atributo]: valor });
      aplicados[atributo] = run.atributos[atributo] - antes;
    }
    s.efeito = {
      eventoId: sucesso ? "bencao_odin" : definicao.eventoId,
      nome: definicao.nome,
      inicio: run.rodada,
      fim: run.rodada + (sucesso ? 20 : 10),
      ultimaRodada: run.rodada,
      modificadoresAplicados: aplicados,
      porRodada: definicao.porRodada || null,
      reducaoDano: definicao.reducaoDano || 0,
      reducaoGanhoGold: definicao.reducaoGanhoGold || 0,
      reduzirCura: Boolean(definicao.reduzirCura),
      manutencaoGold: definicao.manutencaoGold || 0,
      revelarHonraRodadas: definicao.revelarHonraRodadas || 0,
      revelarHabitantesRodadas: definicao.revelarHabitantesRodadas || 0,
    };
    return definicao.nome;
  }
  function resolver(run, forcar, aleatorio = Math.random) {
    const s = estado(run),
      p = s.atual;
    if (run.status !== "ativa" || p?.fase !== "ativo" || run.aguardaDecisaoCulto || run.encontroLeste)
      return false;
    if (forcar === undefined && run.rodada < p.fim) return false;
    const sucesso = forcar ?? cumpriu(run, p);
    const antes = { ...run.atributos, hpMax: run.hpMax };
    let efeitos = {},
      nomeEfeito = null;
    switch (p.id) {
      case "lua_vermelha":
        efeitos = sucesso ? { gold: 2 } : { habitantes: -20 };
        break;
      case "cometa_cinzas":
        efeitos = sucesso ? { hp: 5 } : { hp: -20, habitantes: -10 };
        break;
      case "nuvem_faminta":
        efeitos = sucesso ? { habitantes: 5 } : { hp: -10, habitantes: -15 };
        break;
      case "ferrugem_negra":
        efeitos = sucesso
          ? { escudo: Math.ceil(antes.escudo * 0.2) }
          : { hp: -Math.min(Math.max(0, antes.hp - 1), Math.ceil(antes.hp * 0.4)) };
        break;
      case "corvos":
        nomeEfeito = efeitoNordico(run, sucesso, aleatorio);
        break;
      case "noite_lamento":
        efeitos = sucesso ? { habitantes: 10 } : { habitantes: -20 };
        break;
      case "procissao":
        efeitos = sucesso ? { hpMax: 10, hp: 10 } : { hp: -20, habitantes: -5 };
        break;
      case "vinda_barao":
        efeitos = sucesso ? { gold: 10 } : { gold: -Math.ceil(antes.gold / 2), hp: -10 };
        break;
      case "sombra_coroada":
        efeitos = { ataque: Math.ceil(antes.ataque * (sucesso ? 0.15 : 0.2)) * (sucesso ? 1 : -1) };
        break;
      case "testemunha_pedra":
        efeitos = { escudo: Math.ceil(antes.escudo * (sucesso ? 0.15 : 0.2)) * (sucesso ? 1 : -1) };
        break;
    }
    Jogo.engine.aplicarEfeitos(run, efeitos, {}, { protecaoCeleiro: run.construcoes.includes("celeiro") });
    const alteracoes = Object.fromEntries(
      [...Jogo.atributos, "hpMax"].map((id) => [
        id,
        (id === "hpMax" ? run.hpMax : run.atributos[id]) - antes[id],
      ]),
    );
    p.fase = "resultado";
    p.resultado = { sucesso, alteracoes, nomeEfeito };
    s.ultimaResolucao = run.rodada;
    s.historico.push({ id: p.id, rodada: run.rodada, sucesso, debug: p.debug });
    s.historico = s.historico.slice(-20);
    Jogo.engine.avaliarConsequenciaPressagio(run);
    if (run.status === "ativa") Jogo.legado.avaliar(run);
    return true;
  }
  function passagem(run, aleatorio = Math.random) {
    const s = estado(run);
    if (bloqueia(run)) return true;
    if (run.aguardaDecisaoCulto || run.encontroLeste) return false;
    if (s.efeito && run.rodada >= s.efeito.fim) removerEfeito(run);
    if (s.atual?.id === "noite_lamento" && run.cultoAtivo) {
      s.historico.push({ id: s.atual.id, rodada: run.rodada, sucesso: null, debug: s.atual.debug });
      s.historico = s.historico.slice(-20);
      s.ultimaResolucao = run.rodada;
      s.atual = null;
      return false;
    }
    if (s.atual) return resolver(run);
    if (
      run.rodada < regras.primeiraRodada ||
      run.rodada >= Jogo.config.rodadasVitoria ||
      s.naturais >= regras.limite ||
      s.ultimaTentativa === run.rodada ||
      (s.ultimaResolucao > 0 && run.rodada - s.ultimaResolucao < regras.intervalo)
    )
      return false;
    const candidatos = catalogo.filter(
      (item) =>
        disponivel(run, item) && !s.historico.some((registro) => registro.id === item.id && !registro.debug),
    );
    s.ultimaTentativa = run.rodada;
    if (!candidatos.length || aleatorio() >= regras.chance) return false;
    const item = candidatos[Math.min(candidatos.length - 1, Math.floor(aleatorio() * candidatos.length))];
    return anunciar(run, item.id);
  }
  function iniciarRodada(run) {
    const e = run.pressagios?.efeito;
    if (!e || run.rodada <= e.ultimaRodada || run.rodada > e.fim) return;
    e.ultimaRodada = run.rodada;
    if (e.manutencaoGold) Jogo.engine.aplicarEfeitos(run, { gold: -e.manutencaoGold });
    if (e.porRodada && (!e.porRodada.aCada || (run.rodada - e.inicio) % e.porRodada.aCada === 0))
      Jogo.engine.aplicarEfeitos(run, e.porRodada.efeitos);
  }
  function registrarDecisao(c) {
    const { run, evento, opcao, antes } = c;
    if (!emPrazo(run)) return;
    const p = run.pressagios.atual,
      g = p.progresso;
    const deltaGold = run.atributos.gold - antes.gold;
    g.gold += Math.max(0, deltaGold);
    g.honra += Math.max(0, run.atributos.honra - antes.honra);
    if (auxilios.has(`${evento.id}:${opcao.id}`)) {
      g.auxilios += 1;
      g.gasto += Math.max(0, -deltaGold);
    }
    const honra = honraDaEscolha(evento, opcao, run, c);
    const haviaAlternativa = Jogo.engine
      .opcoes(evento, { ...run, atributos: antes }, false)
      .some((o) => escolhaCompativel(run, evento, o));
    if (
      haviaAlternativa &&
      ((p.id === "sombra_coroada" && honra > 0) || (p.id === "testemunha_pedra" && honra < 0))
    )
      g.violacoes += 1;
  }
  function honraDaEscolha(evento, opcao, run, contexto) {
    let valor = (contexto?.efeitosEscolha || opcao.efeitos)?.honra || 0;
    if (opcao.definir?.honra !== undefined)
      valor += opcao.definir.honra - (contexto?.antes.honra ?? run.atributos.honra);
    if (opcao.combate) {
      const combate = contexto?.resultado.combate;
      if (combate) {
        const d = combate.venceu ? evento.batalha.vitoria : evento.batalha.derrota;
        valor +=
          (d?.efeitos?.honra || 0) +
          (!combate.venceu ? evento.batalha.penalidadeFalha?.efeitos?.honra || 0 : 0);
      } else {
        const valores = [evento.batalha?.vitoria, evento.batalha?.derrota].map((d) => d?.efeitos?.honra || 0);
        return run.pressagios?.atual?.id === "sombra_coroada"
          ? Math.max(valor, ...valores)
          : Math.min(valor, ...valores);
      }
    }
    if (!contexto && opcao.testeSorte) {
      const valores = [opcao.testeSorte.sucesso, opcao.testeSorte.falha].map(
        (d) => d?.efeitos?.honra ?? valor,
      );
      return run.pressagios?.atual?.id === "sombra_coroada" ? Math.max(...valores) : Math.min(...valores);
    }
    return valor;
  }
  function escolhaCompativel(run, evento, opcao) {
    if (!emPrazo(run)) return true;
    const id = run.pressagios.atual.id,
      h = honraDaEscolha(evento, opcao, run);
    return id === "sombra_coroada" ? h <= 0 : id === "testemunha_pedra" ? h >= 0 : true;
  }
  function eventoCompativel(run, evento) {
    if (run.pressagios?.atual?.id === "vinda_barao" && ["barao", "volta_do_barao"].includes(evento.id))
      return false;
    if (!emPrazo(run)) return true;
    return Jogo.engine.opcoes(evento, run, false).some((opcao) => escolhaCompativel(run, evento, opcao));
  }
  function eventoAuxilio(run) {
    const p = run.pressagios?.atual;
    if (!emPrazo(run) || !["nuvem_faminta", "procissao"].includes(p.id)) return null;
    const intervaloAuxilio = 10;
    if (
      (p.id === "nuvem_faminta" ? p.progresso.gasto >= 15 : p.progresso.auxilios >= 12) ||
      run.rodada - p.ultimaAuxilio < intervaloAuxilio
    )
      return null;
    return Jogo.eventoPorId("pressagio_preparativos");
  }
  function progresso(run) {
    const p = run.pressagios?.atual;
    if (!p) return "Nenhum presságio ativo.";
    const a = run.atributos,
      g = p.progresso;
    const valores = {
      lua_vermelha: `Queda de Vida: ${Math.max(0, p.referencias.hp - a.hp)}/40; referência: ${p.referencias.hp}.`,
      cometa_cinzas: `Reserva: ${a.gold}/30 Gold.`,
      nuvem_faminta: `Auxílio: ${g.gasto}/15 Gold.`,
      ferrugem_negra: `Escudo: ${a.escudo}/${metaEscudo(p)}; referência: ${p.referencias.escudo}.`,
      corvos: `Honra conquistada: ${g.honra}/50.`,
      noite_lamento: `Habitantes: ${a.habitantes}/${p.referencias.habitantes + 20}.`,
      procissao: `Auxílios: ${g.auxilios}/12.`,
      vinda_barao: `Gold conquistado: ${g.gold}/40.`,
      sombra_coroada: `Violações: ${g.violacoes}.`,
      testemunha_pedra: `Violações: ${g.violacoes}.`,
    };
    return `${valores[p.id]} Prazo: ${Math.max(0, p.fim - run.rodada)} rodadas; termina ao concluir a rodada ${p.fim}.`;
  }
  function limpar(run) {
    if (run?.status !== "ativa") return false;
    const s = estado(run);
    if (!s.atual && !s.efeito) return false;
    s.atual = null;
    removerEfeito(run);
    return true;
  }
  function camposValidos(run) {
    const s = run.pressagios,
      obj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
    const nat = (v) => Number.isSafeInteger(v) && v >= 0;
    if (
      !obj(s) ||
      ![s.ultimaTentativa, s.ultimaResolucao, s.naturais].every(nat) ||
      s.ultimaTentativa > run.rodada ||
      s.ultimaResolucao > run.rodada ||
      s.naturais > 3 ||
      !Array.isArray(s.historico) ||
      s.historico.length > 20 ||
      !s.historico.every(
        (h) =>
          obj(h) &&
          porId(h.id) &&
          nat(h.rodada) &&
          h.rodada <= run.rodada &&
          [true, false, null].includes(h.sucesso) &&
          typeof h.debug === "boolean",
      )
    )
      return false;
    const p = s.atual;
    if (p !== null) {
      const def = obj(p) && porId(p.id);
      if (
        !def ||
        !["anuncio", "ativo", "resultado"].includes(p.fase) ||
        !nat(p.anuncio) ||
        p.anuncio < 1 ||
        p.anuncio > run.rodada ||
        p.fim !== p.anuncio + def.duracao ||
        typeof p.debug !== "boolean" ||
        typeof p.retomarAvanco !== "boolean" ||
        !obj(p.referencias) ||
        !["hp", "escudo", "habitantes"].every((k) => nat(p.referencias[k])) ||
        !obj(p.progresso) ||
        !["honra", "gold", "gasto", "auxilios", "violacoes"].every((k) => nat(p.progresso[k])) ||
        !nat(p.ultimaAuxilio) ||
        p.ultimaAuxilio < p.anuncio ||
        p.ultimaAuxilio > run.rodada ||
        (!p.debug && p.fim > Jogo.config.rodadasVitoria)
      )
        return false;
      if (p.fase === "resultado") {
        if (
          !obj(p.resultado) ||
          typeof p.resultado.sucesso !== "boolean" ||
          !obj(p.resultado.alteracoes) ||
          ![...Jogo.atributos, "hpMax"].every((k) => Number.isSafeInteger(p.resultado.alteracoes[k])) ||
          !(p.resultado.nomeEfeito === null || typeof p.resultado.nomeEfeito === "string")
        )
          return false;
      } else if (p.resultado !== null) return false;
    }
    const e = s.efeito;
    if (e !== null) {
      const def =
        obj(e) &&
        (e.eventoId === "bencao_odin"
          ? Jogo.eventoPorId("bencao_odin").opcoes.find((o) => o.id === "sacrificio").efeitoDivino
          : Jogo.efeitosNordicos.find((d) => d.eventoId === e.eventoId && d.tipo === "maldicao"));
      if (
        !def ||
        !nat(e.inicio) ||
        e.inicio > run.rodada ||
        e.fim !== e.inicio + (e.eventoId === "bencao_odin" ? 20 : 10) ||
        !nat(e.ultimaRodada) ||
        e.ultimaRodada < e.inicio ||
        e.ultimaRodada > run.rodada ||
        !obj(e.modificadoresAplicados)
      )
        return false;
      for (const k of [
        "nome",
        "reducaoDano",
        "reducaoGanhoGold",
        "reduzirCura",
        "manutencaoGold",
        "revelarHonraRodadas",
        "revelarHabitantesRodadas",
        "porRodada",
      ]) {
        const padrao = k === "porRodada" ? null : k === "reduzirCura" ? false : 0;
        if (JSON.stringify(e[k]) !== JSON.stringify(def[k] || padrao)) return false;
      }
      if (Object.keys(e.modificadoresAplicados).length !== Object.keys(def.modificadores || {}).length)
        return false;
      for (const [k, v] of Object.entries(e.modificadoresAplicados)) {
        const d = def.modificadores?.[k];
        if (!Number.isSafeInteger(v) || d === undefined || (d >= 0 ? v !== d : v > 0 || v < d)) return false;
      }
    }
    return true;
  }
  Jogo.registrarEventos({
    id: "pressagio_preparativos",
    titulo: "Proteção dos moradores",
    tipo: "comum",
    disparadoPelaEngine: true,
    imagem: "assets/eventos-especificos/uma-noite-sem-fome.webp",
    imagemAlt: "Moradores repartem pão e colheita à mesa",
    texto: "Moradores pedem ajuda para proteger as casas e repartir os mantimentos.",
    informacoes:
      "Há trabalho para quem pode carregar provisões e despesas que a vila não consegue pagar sozinha.",
    opcoes: [
      {
        id: "pagar",
        texto: "Comprar provisões para os moradores · 1 Gold",
        requisitos: { goldMin: 1 },
        efeitos: { gold: -1, honra: 1 },
        resultado: "As provisões chegam às casas que precisavam delas.",
      },
      {
        id: "trabalhar",
        texto: "Carregar provisões e ajudar nos reparos · 2 de Vida",
        efeitos: { hp: -2, honra: 1 },
        resultado: "Você termina o trabalho com o corpo dolorido. Os moradores dividem o que sobrou.",
      },
      {
        id: "adiar",
        texto: "Adiar o auxílio.",
        efeitos: {},
        resultado: "Os moradores voltam para casa sem a ajuda que pediram.",
      },
    ],
  });
  Jogo.pressagios = {
    catalogo,
    regras,
    porId,
    vazio,
    bloqueia,
    anunciar,
    confirmar,
    resolver,
    passagem,
    iniciarRodada,
    registrarDecisao,
    eventoCompativel,
    escolhaCompativel,
    eventoAuxilio,
    progresso,
    limpar,
    camposValidos,
    auxilios,
  };
})();
