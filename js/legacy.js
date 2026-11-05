(function () {
  "use strict";
  const Jogo = window.Jogo;
  const listaIds = valor => Array.isArray(valor)
    ? [...new Set(valor.filter(id => typeof id === "string" && id.length > 0))] : [];
  const flagsSeguras = valor => valor && typeof valor === "object" && !Array.isArray(valor)
    ? Object.fromEntries(Object.entries(valor).filter(([id, ativa]) => id.length > 0 && ativa === true)) : {};
  const memoriasSeguras = valor => Array.isArray(valor) ? valor.filter(registro => registro && typeof registro === "object"
    && typeof registro.id === "string" && Number.isSafeInteger(registro.rodada) && Number.isSafeInteger(registro.honra)
    && typeof registro.tipo === "string" && typeof registro.motivo === "string").map(registro => ({
      id: registro.id, rodada: registro.rodada, honra: registro.honra, tipo: registro.tipo, motivo: registro.motivo,
      ...( ["corajoso", "avarento", "doente", "druida_herdeiro"].includes(registro.traco) ? { traco: registro.traco } : {}),
      ...(registro.meninoAdotado === true ? { meninoAdotado: true } : {})
    })).slice(-20) : [];
  const rotacoesSeguras = valor => Array.isArray(valor) ? valor.filter(registro => registro && typeof registro === "object"
    && typeof registro.id === "string" && Array.isArray(registro.eventos))
    .map(registro => ({ id: registro.id, eventos: listaIds(registro.eventos).slice(0, 300) })).slice(-2) : [];

  // A lista inicial ficará vazia até os objetivos serem definidos pelo autor.
  // Formato: { id, condicao(run), desbloqueia: { eventos: [], itens: [], flags: [] } }.
  Jogo.objetivosLegado = [{
    id: "bosque_vivo",
    condicao: run => run.traco === "druida_herdeiro" && run.druidaAnosAlta >= 3,
    desbloqueia: { itens: ["mascara_de_cervo"] }
  }];

  function vazio() {
    return { versao: 1, eventos: [], itens: [], flags: {}, objetivosConcluidos: [], memorias: [], eventosRecentesRuns: [] };
  }

  function normalizar(dados) {
    if (!dados || typeof dados !== "object" || Array.isArray(dados) || dados.versao !== 1) return vazio();
    return {
      versao: 1, eventos: listaIds(dados.eventos), itens: listaIds(dados.itens),
      flags: flagsSeguras(dados.flags), objetivosConcluidos: listaIds(dados.objetivosConcluidos),
      memorias: memoriasSeguras(dados.memorias), eventosRecentesRuns: rotacoesSeguras(dados.eventosRecentesRuns)
    };
  }

  function mesclar(a, b) {
    a = normalizar(a);
    b = normalizar(b);
    return {
      versao: 1,
      eventos: listaIds([...a.eventos, ...b.eventos]),
      itens: listaIds([...a.itens, ...b.itens]),
      flags: { ...a.flags, ...b.flags },
      objetivosConcluidos: listaIds([...a.objetivosConcluidos, ...b.objetivosConcluidos]),
      memorias: memoriasSeguras([...a.memorias, ...b.memorias].filter((registro, indice, lista) =>
        lista.findIndex(candidato => candidato.id === registro.id) === indice)).slice(-20),
      eventosRecentesRuns: rotacoesSeguras([...a.eventosRecentesRuns, ...b.eventosRecentesRuns]
        .filter((registro, indice, lista) => lista.findIndex(candidato => candidato.id === registro.id) === indice))
    };
  }

  function conceder(run, desbloqueia) {
    if (!desbloqueia) return;
    run.conquistas = mesclar(run.conquistas, {
      versao: 1, eventos: desbloqueia.eventos, itens: desbloqueia.itens,
      flags: Object.fromEntries(listaIds(desbloqueia.flags).map(id => [id, true]))
    });
  }

  function avaliar(run) {
    Jogo.druida?.registrarAno(run);
    for (const objetivo of Jogo.objetivosLegado) {
      const jaCumpriu = run.conquistas.objetivosConcluidos.includes(objetivo.id)
        || run.legadoDaRun.objetivosConcluidos.includes(objetivo.id);
      if (jaCumpriu || !objetivo.condicao(run)) continue;
      conceder(run, objetivo.desbloqueia);
      run.conquistas.objetivosConcluidos.push(objetivo.id);
    }
  }

  function registrarRun(run) {
    const eventos = listaIds(run.eventosComunsRun);
    if (!eventos.length || !run.id) return;
    run.conquistas = mesclar(run.conquistas, {
      versao: 1, eventosRecentesRuns: [{ id: run.id, eventos }]
    });
  }

  function disponivel(conteudo, tipo, legado) {
    if (conteudo.requerDesbloqueio) {
      const id = conteudo.requerDesbloqueio;
      return legado[tipo].includes(id) || (Object.hasOwn(legado.flags, id) && legado.flags[id] === true)
        || legado.eventos.includes(id) || legado.itens.includes(id);
    }
    return !conteudo.bloqueado || legado[tipo].includes(conteudo.id);
  }

  Jogo.legado = { vazio, normalizar, mesclar, conceder, avaliar, registrarRun, disponivel };
})();
