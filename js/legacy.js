(function () {
  "use strict";
  const Jogo = window.Jogo;
  const listaIds = valor => Array.isArray(valor)
    ? [...new Set(valor.filter(id => typeof id === "string" && id.length > 0))] : [];
  const flagsSeguras = valor => valor && typeof valor === "object" && !Array.isArray(valor)
    ? Object.fromEntries(Object.entries(valor).filter(([id, ativa]) => id.length > 0 && ativa === true)) : {};

  // A lista inicial ficará vazia até os objetivos serem definidos pelo autor.
  // Formato: { id, condicao(run), desbloqueia: { eventos: [], itens: [], flags: [] } }.
  Jogo.objetivosLegado = [];

  function vazio() {
    return { versao: 1, eventos: [], itens: [], flags: {}, objetivosConcluidos: [] };
  }

  function normalizar(dados) {
    if (!dados || typeof dados !== "object" || Array.isArray(dados) || dados.versao !== 1) return vazio();
    return {
      versao: 1, eventos: listaIds(dados.eventos), itens: listaIds(dados.itens),
      flags: flagsSeguras(dados.flags), objetivosConcluidos: listaIds(dados.objetivosConcluidos)
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
      objetivosConcluidos: listaIds([...a.objetivosConcluidos, ...b.objetivosConcluidos])
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
    for (const objetivo of Jogo.objetivosLegado) {
      const jaCumpriu = run.conquistas.objetivosConcluidos.includes(objetivo.id)
        || run.legadoDaRun.objetivosConcluidos.includes(objetivo.id);
      if (jaCumpriu || !objetivo.condicao(run)) continue;
      conceder(run, objetivo.desbloqueia);
      run.conquistas.objetivosConcluidos.push(objetivo.id);
    }
  }

  function disponivel(conteudo, tipo, legado) {
    if (conteudo.requerDesbloqueio) {
      const id = conteudo.requerDesbloqueio;
      return legado[tipo].includes(id) || (Object.hasOwn(legado.flags, id) && legado.flags[id] === true)
        || legado.eventos.includes(id) || legado.itens.includes(id);
    }
    return !conteudo.bloqueado || legado[tipo].includes(conteudo.id);
  }

  Jogo.legado = { vazio, normalizar, mesclar, conceder, avaliar, disponivel };
})();
