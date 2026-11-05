(function () {
  "use strict";
  const Jogo = window.Jogo;
  const TRACO = "druida_herdeiro";
  const animais = {
    lobo: { nome: "Lobo", singular: "o lobo", imagem: "assets/lobo-pactuario.png" },
    corvo: { nome: "Corvo", singular: "o corvo", imagem: "assets/corvo.png" },
    cervo: { nome: "Cervo", singular: "o cervo", imagem: "assets/cervo-branco.png" }
  };
  const passivas = {
    lobo: { nome: "Lobo", descricao: "+2 Ataque em batalhas nesta rodada." },
    corvo: { nome: "Corvo", descricao: "Revela o tipo do evento e a Honra de uma opção." },
    cervo: { nome: "Cervo", descricao: "Recupera 3 Vida ao iniciar a rodada; 4 com a Máscara do Cervo." }
  };
  const ehDruida = run => run?.traco === TRACO;
  const temItem = (run, id) => run?.itensConquistados?.includes(id) || run?.inventario?.includes(id);

  function estacaoDaRodada(rodada) {
    return Jogo.estacoes[Math.floor((Math.max(1, rodada) - 1) / 25) % Jogo.estacoes.length];
  }

  function iniciar(run) {
    if (!ehDruida(run)) return;
    const tipos = Object.keys(passivas);
    run.druidaPassiva = tipos[Math.floor(Math.random() * tipos.length)];
    run.previsaoCorvo = null;
    run.corvoRevelaOpcaoId = null;

    const volta = ((run.rodada - 1) % 25) + 1;
    if (run.estacao === "primavera" && volta === 1 && run.rodada > 1
      && run.cajadoBonusAtaque < 5 && temItem(run, "cajado_de_carvalho_vivo")) {
      run.cajadoBonusAtaque += 1;
      run.atributos.ataque += 1;
    }
    if (run.druidaPassiva === "cervo") {
      const cura = temItem(run, "mascara_de_cervo") ? 4 : 3;
      run.atributos.hp = Math.min(run.hpMax, run.atributos.hp + cura);
    }
    if (run.flags.bosque_sagrado && run.rodada % 5 === 0) run.atributos.habitantes += 1;
  }

  function bonusAtaqueCombate(run) {
    return ehDruida(run) && run.druidaPassiva === "lobo" ? 2 : 0;
  }

  function prepararEvento(run, evento) {
    run.corvoRevelaOpcaoId = null;
    run.previsaoCorvo = null;
    if (!ehDruida(run) || run.druidaPassiva !== "corvo" || !evento) return;
    run.previsaoCorvo = evento.tipo || null;
    const opcoes = Jogo.engine.opcoes(evento, run);
    run.corvoRevelaOpcaoId = opcoes[Math.floor(Math.random() * opcoes.length)]?.id || null;
  }

  function plantarBosque(run) {
    if (!ehDruida(run) || run.flags.bosque_sagrado) return false;
    run.flags.bosque_sagrado = true;
    return true;
  }

  function registrarAno(run) {
    if (!ehDruida(run) || run.rodada % 100 !== 0 || run.druidaAnoAvaliado === run.rodada) return;
    run.druidaAnoAvaliado = run.rodada;
    run.druidaAnosAlta = run.atributos.honra >= Jogo.config.honraAlta
      ? Math.min(3, run.druidaAnosAlta + 1) : 0;
  }

  function novaRun(run) {
    run.traco = TRACO;
    run.atributos = { hp: 110, escudo: 2, ataque: 4, honra: 0, habitantes: 50, gold: 3 };
    run.hpMax = 110;
    run.druidaPassiva = null;
    run.cajadoBonusAtaque = 2;
    run.druidaAnosAlta = 0;
    run.druidaAnoAvaliado = 0;
    run.inventario = [...new Set([...(run.inventario || []), "cajado_de_carvalho_vivo"])];
    run.itensConquistados = [...new Set([...(run.itensConquistados || []), "cajado_de_carvalho_vivo"])];
    run.logItens = [{ id: "cajado_de_carvalho_vivo", rodada: 1 }];
    run.comprasMercador.arma_melhor = Math.max(1, run.comprasMercador.arma_melhor || 0);
    iniciar(run);
    return run;
  }

  Jogo.druida = { traco: TRACO, animais, passivas, ehDruida, temItem, estacaoDaRodada, iniciar,
    bonusAtaqueCombate, prepararEvento, plantarBosque, registrarAno, novaRun };
})();
