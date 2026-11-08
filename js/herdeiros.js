(function () {
  "use strict";
  const Jogo = window.Jogo;
  const novos = {
    herdeiro_culto: {
      nome: "O Herdeiro do Culto",
      descricao:
        "120 Vida, 4 Ataque e 4 Escudo. Reserva 30 seguidores; perde metade dos habitantes e fortalece a Adaga cerimonial.",
      desbloqueio: "Vença os três anos como cultista.",
      iniciais: { ataque: 4, escudo: 4 },
    },
    herdeira_leste: {
      nome: "A Herdeira do Leste",
      descricao:
        "120 Vida, 2 Ataque, 7 Escudo, 60 habitantes e 3 Gold. Recebe duas visitas zodiacais por ano, sem gastar dias.",
      desbloqueio: "Ative o ano novo e receba uma bênção zodiacal na mesma crônica.",
      iniciais: { ataque: 2, escudo: 7, habitantes: 60, gold: 3 },
    },
    herdeiro_nordico: {
      nome: "O Herdeiro Nórdico",
      descricao: "120 Vida, 9 Ataque e 1 Escudo. Recebe um efeito nórdico aleatório a cada dia.",
      desbloqueio: "Receba uma bênção ou maldição de uma carta nórdica.",
      iniciais: { ataque: 9, escudo: 1 },
    },
    coringa: {
      nome: "Bobo da Corte",
      descricao: "120 Vida, 2 Ataque e 5 Escudo. Cada batalha começa com um efeito aleatório de d6.",
      desbloqueio: "Role um 20 natural em qualquer dado de uma disputa, em uma crônica.",
      iniciais: {},
    },
    bruxo: {
      nome: "Bruxa dos Dados",
      descricao: "70 Vida, 2 Ataque e −1 Escudo. O inimigo rola um d20 extra e fica com o menor resultado.",
      desbloqueio: "Vença 8 batalhas em uma mesma crônica.",
      iniciais: { hp: 70, escudo: -1 },
    },
  };
  const nomes = {
    corajoso: "Hilda",
    avarento: "Dário",
    doente: "Miro",
    druida_herdeiro: "Faelan",
    menino_cronista: "Cedric",
    heroi_do_povo: "Ndidi",
    herdeiro_culto: "Baltazar",
    herdeira_leste: "Xinyue",
    herdeiro_nordico: "Sigurd",
    coringa: "O Bufão",
    bruxo: "A Bruxa",
  };
  const desbloqueaveis = ["druida_herdeiro", "menino_cronista", "heroi_do_povo", ...Object.keys(novos)];
  const todos = ["corajoso", "avarento", "doente", ...desbloqueaveis];
  const condicoes = {
    herdeiro_culto: (run) => run.fim?.tipo === "vitoria_culto",
    herdeira_leste: (run) => run.flags.ano_novo_ativo === true && run.flags.bencao_zodiacal_recebida === true,
    herdeiro_nordico: (run) => run.flags.efeito_nordico_recebido === true,
    coringa: (run) => run.dadosNaturais20Combate >= 1,
    bruxo: (run) => run.batalhasVencidas >= 8,
  };
  function calendario(run) {
    if (run.traco !== "herdeira_leste") return;
    run.calendarioLeste ||= [];
    const ano = Jogo.anoDaRodada(run.rodada);
    if (run.calendarioLeste.some((visita) => visita.ano === ano)) return;
    const primeira = Math.floor(Math.random() * 2);
    const segunda = primeira === 0 ? 2 + Math.floor(Math.random() * 2) : 3;
    const usados = new Set(run.calendarioLeste.map((visita) => visita.eventoId));
    for (const estacao of [primeira, segunda]) {
      const animais = Jogo.eventos.filter(
        (evento) => evento.zodiaco && !usados.has(evento.id) && !run.flags[`${evento.id}_visto`],
      );
      const animal = animais[Math.floor(Math.random() * animais.length)];
      if (!animal) continue;
      usados.add(animal.id);
      run.calendarioLeste.push({
        ano,
        rodada: (ano - 1) * 100 + estacao * 25 + 1 + Math.floor(Math.random() * 25),
        eventoId: animal.id,
        resolvida: false,
      });
    }
  }
  function visitaDevida(run) {
    calendario(run);
    return run.calendarioLeste?.find((visita) => !visita.resolvida && visita.rodada <= run.rodada);
  }
  function efeitos(run) {
    return [run.efeitoDivino, run.passivaNordica, run.pressagios?.efeito].filter(Boolean);
  }
  function valorEfeito(run, campo) {
    return efeitos(run).reduce((soma, efeito) => soma + (efeito[campo] || 0), 0);
  }
  function iniciarCulto(run) {
    run.cultoAtivo = true;
    run.flags.culto_ativo = true;
    const reserva =
      run.traco === "herdeiro_culto" && !run.flags.reserva_culto_usada ? run.seguidoresCulto : 0;
    run.seguidoresCulto = reserva + 50;
    run.flags.reserva_culto_usada = true;
  }
  function perdaHabitantes(run, antes, depois) {
    if (run.traco !== "herdeiro_culto" || depois >= antes) return depois;
    return Math.max(0, antes - Math.max(1, Math.floor((antes - depois) / 2)));
  }
  function novaRun(run) {
    run.calendarioLeste = [];
    run.encontroLeste = null;
    run.passivaNordica = null;
    if (run.traco === "herdeiro_culto") run.seguidoresCulto = 30;
    if (run.traco === "herdeira_leste") {
      run.flags.ano_novo_ativo = true;
      calendario(run);
    }
    Jogo.engine?.iniciarPassivaNordica(run);
  }
  function camposValidos(run) {
    if (!Array.isArray(run.calendarioLeste) || run.calendarioLeste.length > 6) return false;
    const ids = new Set();
    for (const visita of run.calendarioLeste) {
      if (
        !visita ||
        !Number.isSafeInteger(visita.ano) ||
        visita.ano < 1 ||
        visita.ano > 3 ||
        !Number.isSafeInteger(visita.rodada) ||
        visita.rodada < 1 ||
        visita.rodada > Jogo.config.rodadasVitoria ||
        Jogo.anoDaRodada(visita.rodada) !== visita.ano ||
        typeof visita.resolvida !== "boolean" ||
        !Jogo.eventoPorId(visita.eventoId)?.zodiaco ||
        ids.has(visita.eventoId)
      )
        return false;
      ids.add(visita.eventoId);
    }
    if (run.encontroLeste !== null) {
      const encontro = run.encontroLeste;
      const transicao =
        encontro?.transicaoCulto === true &&
        run.eventoId === "ultimo_habitante" &&
        run.fase === "resultado" &&
        (run.cultoAtivo || run.status === "encerrada");
      if (
        !encontro ||
        run.traco !== "herdeira_leste" ||
        !Jogo.eventoPorId(encontro.eventoId) ||
        !Array.isArray(encontro.opcoesSorteadas) ||
        !encontro.opcoesSorteadas.every((id) => typeof id === "string") ||
        (!Jogo.eventoPorId(run.eventoId)?.zodiaco && !transicao) ||
        (encontro.resultadoConcluido !== undefined && typeof encontro.resultadoConcluido !== "boolean") ||
        (!transicao && !run.calendarioLeste.some((visita) => visita.eventoId === run.eventoId))
      )
        return false;
    }
    const efeito = run.passivaNordica;
    if (
      efeito !== null &&
      (!efeito ||
        run.traco !== "herdeiro_nordico" ||
        !Jogo.eventoPorId(efeito.eventoId)?.divino ||
        !Number.isSafeInteger(efeito.inicio) ||
        efeito.inicio < 1 ||
        efeito.inicio > run.rodada ||
        !efeito.modificadoresAplicados ||
        Object.entries(efeito.modificadoresAplicados).some(
          ([campo, valor]) => !Jogo.atributos.includes(campo) || !Number.isSafeInteger(valor),
        ))
    )
      return false;
    if (efeito) {
      const definicao = Jogo.efeitosNordicos?.find((item) => item.eventoId === efeito.eventoId);
      if (!definicao) return false;
      for (const campo of [
        "nome",
        "tipo",
        "reducaoDano",
        "reducaoGanhoGold",
        "reduzirCura",
        "manutencaoGold",
        "revelarHonraRodadas",
        "revelarHabitantesRodadas",
        "bonusDadosCombate",
        "porRodada",
        "modificadores",
      ]) {
        if (JSON.stringify(efeito[campo]) !== JSON.stringify(definicao[campo])) return false;
      }
      for (const [campo, valor] of Object.entries(efeito.modificadoresAplicados)) {
        const previsto = definicao.modificadores?.[campo];
        if (previsto === undefined || (previsto >= 0 ? valor !== previsto : valor > 0 || valor < previsto))
          return false;
      }
      if (
        Object.keys(efeito.modificadoresAplicados).length !==
        Object.keys(definicao.modificadores || {}).length
      )
        return false;
    }
    return true;
  }
  Jogo.herdeiros = {
    novos,
    nomes,
    todos,
    desbloqueaveis,
    condicoes,
    calendario,
    visitaDevida,
    efeitos,
    valorEfeito,
    iniciarCulto,
    perdaHabitantes,
    novaRun,
    camposValidos,
  };
})();
