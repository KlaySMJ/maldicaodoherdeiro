(function () {
  "use strict";
  const Jogo = window.Jogo;
  const listaIds = (valor) =>
    Array.isArray(valor) ? [...new Set(valor.filter((id) => typeof id === "string" && id.length > 0))] : [];
  const flagsSeguras = (valor) =>
    valor && typeof valor === "object" && !Array.isArray(valor)
      ? Object.fromEntries(Object.entries(valor).filter(([id, ativa]) => id.length > 0 && ativa === true))
      : {};
  const memoriasSeguras = (valor) =>
    Array.isArray(valor)
      ? valor
          .filter(
            (registro) =>
              registro &&
              typeof registro === "object" &&
              typeof registro.id === "string" &&
              Number.isSafeInteger(registro.rodada) &&
              Number.isSafeInteger(registro.honra) &&
              typeof registro.tipo === "string" &&
              typeof registro.motivo === "string",
          )
          .map((registro) => ({
            id: registro.id,
            rodada: registro.rodada,
            honra: registro.honra,
            tipo: registro.tipo,
            motivo: registro.motivo,
            ...([
              "corajoso",
              "avarento",
              "doente",
              "druida_herdeiro",
              "menino_cronista",
              "heroi_do_povo",
            ].includes(registro.traco)
              ? { traco: registro.traco }
              : {}),
            ...(registro.meninoAdotado === true ? { meninoAdotado: true } : {}),
          }))
          .slice(-20)
      : [];
  const rotacoesSeguras = (valor) =>
    Array.isArray(valor)
      ? valor
          .filter(
            (registro) =>
              registro &&
              typeof registro === "object" &&
              typeof registro.id === "string" &&
              Array.isArray(registro.eventos),
          )
          .map((registro) => ({ id: registro.id, eventos: listaIds(registro.eventos).slice(0, 300) }))
          .slice(-2)
      : [];
  const melhoresRunsSeguras = (valor) =>
    Array.isArray(valor)
      ? valor
          .filter(
            (registro) =>
              registro &&
              typeof registro === "object" &&
              typeof registro.id === "string" &&
              Number.isSafeInteger(registro.pontuacao) &&
              Number.isSafeInteger(registro.rodada) &&
              Number.isSafeInteger(registro.habitantes) &&
              Number.isSafeInteger(registro.gold) &&
              [
                "corajoso",
                "avarento",
                "doente",
                "druida_herdeiro",
                "menino_cronista",
                "heroi_do_povo",
              ].includes(registro.traco),
          )
          .map(({ id, pontuacao, rodada, habitantes, gold, traco }) => ({
            id,
            pontuacao,
            rodada,
            habitantes,
            gold,
            traco,
          }))
          .filter((registro, indice, lista) => lista.findIndex((item) => item.id === registro.id) === indice)
          .sort((a, b) => b.pontuacao - a.pontuacao)
          .slice(0, 10)
      : [];

  // Formato: { id, nome, descricao, condicao(run), desbloqueia: { eventos: [], itens: [], flags: [] } }.
  Jogo.objetivosLegado = [
    {
      id: "bosque_vivo",
      nome: "O bosque que permanece",
      descricao: "Conclua um ano de honra alta como Druida-Herdeiro.",
      condicao: (run) => run.traco === "druida_herdeiro" && run.druidaAnosAlta >= 1,
      desbloqueia: { itens: ["mascara_de_cervo"], eventos: ["assembleia_das_raizes"] },
    },
    {
      id: "menino_cronista",
      nome: "A memória da vila",
      descricao: "Acolha o órfão com honra e permita que ele se torne conselheiro.",
      condicao: (run) =>
        run.flags?.menino_adotado_com_honra === true && run.flags?.menino_conselheiro === true,
      desbloqueia: { flags: ["menino_cronista"] },
    },
    {
      id: "heroi_do_povo",
      nome: "A voz do povo",
      // 400 de honra ≈ 60% do teto otimista de ~657 em 300 rodadas; dispara assim que a honra chega lá.
      descricao: "Alcance 400 de Honra em uma crônica.",
      condicao: (run) => Number.isSafeInteger(run.atributos?.honra) && run.atributos.honra >= 400,
      desbloqueia: { flags: ["heroi_do_povo"] },
    },
  ];

  function vazio() {
    return {
      versao: 1,
      eventos: [],
      itens: [],
      flags: {},
      objetivosConcluidos: [],
      conquistasDesbloqueadas: [],
      memorias: [],
      eventosRecentesRuns: [],
      melhoresRuns: [],
    };
  }

  function normalizar(dados) {
    if (!dados || typeof dados !== "object" || Array.isArray(dados) || dados.versao !== 1) return vazio();
    return {
      versao: 1,
      eventos: listaIds(dados.eventos),
      itens: listaIds(dados.itens),
      flags: flagsSeguras(dados.flags),
      objetivosConcluidos: listaIds(dados.objetivosConcluidos),
      conquistasDesbloqueadas: listaIds(dados.conquistasDesbloqueadas),
      memorias: memoriasSeguras(dados.memorias),
      eventosRecentesRuns: rotacoesSeguras(dados.eventosRecentesRuns),
      melhoresRuns: melhoresRunsSeguras(dados.melhoresRuns),
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
      conquistasDesbloqueadas: listaIds([...a.conquistasDesbloqueadas, ...b.conquistasDesbloqueadas]),
      memorias: memoriasSeguras(
        [...a.memorias, ...b.memorias].filter(
          (registro, indice, lista) =>
            lista.findIndex((candidato) => candidato.id === registro.id) === indice,
        ),
      ).slice(-20),
      eventosRecentesRuns: rotacoesSeguras(
        [...a.eventosRecentesRuns, ...b.eventosRecentesRuns].filter(
          (registro, indice, lista) =>
            lista.findIndex((candidato) => candidato.id === registro.id) === indice,
        ),
      ),
      melhoresRuns: melhoresRunsSeguras([...a.melhoresRuns, ...b.melhoresRuns]),
    };
  }

  function conceder(run, desbloqueia) {
    if (!desbloqueia) return;
    run.conquistas = mesclar(run.conquistas, {
      versao: 1,
      eventos: desbloqueia.eventos,
      itens: desbloqueia.itens,
      flags: Object.fromEntries(listaIds(desbloqueia.flags).map((id) => [id, true])),
    });
  }

  function avaliar(run) {
    Jogo.druida?.registrarAno(run);
    for (const objetivo of Jogo.objetivosLegado) {
      const jaCumpriu =
        run.conquistas.objetivosConcluidos.includes(objetivo.id) ||
        run.legadoDaRun.objetivosConcluidos.includes(objetivo.id);
      if (jaCumpriu || !objetivo.condicao(run)) continue;
      conceder(run, objetivo.desbloqueia);
      run.conquistas.objetivosConcluidos.push(objetivo.id);
    }
    Jogo.conquistas?.avaliar(run);
  }

  function registrarRun(run) {
    const eventos = listaIds(run.eventosComunsRun);
    if (!eventos.length || !run.id) return;
    run.conquistas = mesclar(run.conquistas, {
      versao: 1,
      eventosRecentesRuns: [{ id: run.id, eventos }],
    });
  }

  function disponivel(conteudo, tipo, legado) {
    if (conteudo.requerDesbloqueio) {
      const id = conteudo.requerDesbloqueio;
      return (
        legado[tipo].includes(id) ||
        (Object.hasOwn(legado.flags, id) && legado.flags[id] === true) ||
        legado.eventos.includes(id) ||
        legado.itens.includes(id)
      );
    }
    return !conteudo.bloqueado || legado[tipo].includes(conteudo.id);
  }

  Jogo.legado = { vazio, normalizar, mesclar, conceder, avaliar, registrarRun, disponivel };
})();
