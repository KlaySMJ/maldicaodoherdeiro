(function () {
  "use strict";
  const Jogo = window.Jogo;
  const TRACO = "druida_herdeiro";
  const animais = {
    lobo: { nome: "Lobo", singular: "o lobo", imagem: "assets/lobo-pactuario.png" },
    corvo: { nome: "Corvo", singular: "o corvo", imagem: "assets/corvo.png" },
    cervo: { nome: "Cervo", singular: "o cervo", imagem: "assets/cervo-branco.png" }
  };
  const clamp = valor => Math.max(0, Math.min(10, valor));
  const ehDruida = run => run?.traco === TRACO;
  const temItem = (run, id) => run?.itensConquistados?.includes(id) || run?.inventario?.includes(id);
  const mascaraAtiva = run => Boolean(run?.flags?.mascara_cervo_ativa || temItem(run, "mascara_de_cervo"));

  function estacaoDaRodada(rodada) {
    return Jogo.estacoes[Math.floor((Math.max(1, rodada) - 1) / 25) % Jogo.estacoes.length];
  }

  function nivelNatural(rodada) {
    return Math.min(3, 1 + Math.floor(Math.max(0, rodada - 1) / 100));
  }

  function iniciar(run, primeira = false) {
    if (!ehDruida(run)) return {};
    run.animal ||= { tipo: "lobo", nivel: 1 };
    const esperado = nivelNatural(run.rodada);
    while (run.animal.nivel < esperado) {
      run.animal.nivel += 1;
      if (run.animal.tipo === "lobo") run.atributos.ataque += 1;
    }
    if (run.animal.nivel > 3) run.animal.nivel = 3;
    const estacao = estacaoDaRodada(run.rodada);
    const volta = ((run.rodada - 1) % 25) + 1;
    const inicioEstacao = volta === 1;
    const sintonia = run.sintonia;
    const recebeDons = sintonia >= 4;
    const sofreEncargos = sintonia <= 6 && !mascaraAtiva(run);
    const escudoAntes = run.atributos.escudo;
    const ataqueAntes = run.atributos.ataque;
    const vidaAntes = run.atributos.hp;
    const habitantesAntes = run.atributos.habitantes;
    let mensagem = "";

    if (inicioEstacao) {
      run.marcos.druidaEstacaoInicio = run.rodada;
      if (estacao === "primavera") {
        if (sofreEncargos) run.atributos.escudo = Math.max(0, run.atributos.escudo - 1);
        if (run.rodada > 1 && run.cajadoBonusAtaque < 5 && temItem(run, "cajado_de_carvalho_vivo")) {
          run.cajadoBonusAtaque += 1;
          run.atributos.ataque += 1;
        }
        mensagem = recebeDons ? "Na primavera, a floresta renova a vida e alimenta a vila." : "A primavera cobra um ponto de Escudo enquanto a Sintonia permanece baixa.";
      } else if (estacao === "verao") {
        if (recebeDons) run.atributos.ataque += 2;
        mensagem = recebeDons ? "O verão fortalece seu Ataque." : "O verão encarece as recompensas em moedas.";
      } else if (estacao === "outono") {
        if (recebeDons) run.atributos.escudo += 1;
        if (sofreEncargos) run.atributos.ataque = Math.max(0, run.atributos.ataque - 1);
        mensagem = recebeDons ? "O outono reforça o Escudo e melhora as recompensas em moedas." : "O outono reduz seu Ataque.";
      } else {
        if (recebeDons) run.atributos.escudo += 3;
        mensagem = recebeDons ? "O inverno fortalece seu Escudo." : "O inverno consome habitantes a cada quatro rodadas.";
      }
      if (mascaraAtiva(run)) mensagem += " A Máscara do Cervo afasta os encargos sazonais.";
    }

    if (estacao === "primavera" && recebeDons) run.atributos.hp = Math.min(run.hpMax, run.atributos.hp + 1);
    if (run.animal.tipo === "cervo") run.atributos.hp = Math.min(run.hpMax, run.atributos.hp + run.animal.nivel);
    if (estacao === "primavera" && volta % 5 === 0 && recebeDons) run.atributos.habitantes += 1;
    if (estacao === "inverno" && volta % 4 === 0 && sofreEncargos
      && !(run.animal.tipo === "cervo" && run.animal.nivel >= 3)) {
      run.atributos.habitantes = Math.max(0, run.atributos.habitantes - 1);
    }
    if (run.flags.bosque_sagrado && run.rodada % 5 === 0) run.atributos.habitantes += 1;

    if (inicioEstacao) run.avisoEstacao = mensagem;
    if (primeiraBorda(vidaAntes, run.atributos.hp) || escudoAntes !== run.atributos.escudo
      || ataqueAntes !== run.atributos.ataque || habitantesAntes !== run.atributos.habitantes) {
      run.druidaUltimasVariacoes = {
        hp: run.atributos.hp - vidaAntes, escudo: run.atributos.escudo - escudoAntes,
        ataque: run.atributos.ataque - ataqueAntes, habitantes: run.atributos.habitantes - habitantesAntes
      };
    }
    if (primeira) run.marcos.druidaEstacaoInicio = run.rodada;
    return run.druidaUltimasVariacoes || {};
  }

  function primeiraBorda(antes, depois) { return antes !== depois; }

  function ajustarRecompensa(run, gold) {
    if (!ehDruida(run) || gold <= 0) return gold;
    const dons = run.sintonia >= 4;
    const encargos = run.sintonia <= 6 && !mascaraAtiva(run);
    if (run.estacao === "verao" && encargos) return Math.max(0, gold - 1);
    if (run.estacao === "outono" && dons) return gold + 2;
    return gold;
  }

  function prepararEvento(run, evento) {
    run.corvoRevelaOpcaoId = null;
    if (!ehDruida(run) || run.animal?.tipo !== "corvo") return;
    const nivel = run.animal.nivel;
    if (nivel >= 1) run.previsaoCorvo = evento?.tipo || null;
    if (nivel < 2 || !evento) return;
    const opcoes = Jogo.engine.opcoes(evento, run);
    const escolhidas = opcoes.length ? opcoes : evento.opcoes || [];
    run.corvoRevelaOpcaoId = escolhidas[Math.floor(Math.random() * escolhidas.length)]?.id || null;
  }

  function honrasReveladas(run) {
    if (!ehDruida(run) || run.animal?.tipo !== "corvo") return false;
    if (run.animal.nivel >= 3) return ((run.rodada - 1) % 25) < 5;
    return run.animal.nivel >= 2;
  }

  function concederMascara(run) {
    if (!ehDruida(run) || !run.animal || run.flags.mascara_cervo_ativa) return false;
    run.flags.mascara_cervo_ativa = true;
    if (run.animal.nivel < 3) {
      run.animal.nivel += 1;
      if (run.animal.tipo === "lobo") run.atributos.ataque += 1;
    }
    return true;
  }

  function plantarBosque(run) {
    if (!ehDruida(run) || run.flags.bosque_sagrado) return false;
    run.flags.bosque_sagrado = true;
    return true;
  }

  function registrarAno(run) {
    if (!ehDruida(run) || run.rodada % 100 !== 0 || run.druidaAnoAvaliado === run.rodada) return;
    run.druidaAnoAvaliado = run.rodada;
    if (run.flags.bosque_sagrado) run.sintonia = clamp(run.sintonia + 1);
    run.druidaAnosAlta = run.sintonia >= 7 ? Math.min(3, run.druidaAnosAlta + 1) : 0;
  }

  function novaRun(run, animal = "lobo") {
    if (!animais[animal]) animal = "lobo";
    run.traco = TRACO;
    run.atributos = { hp: 110, escudo: 2, ataque: 4 + (animal === "lobo" ? 1 : 0), honra: 0, habitantes: 50, gold: 3 };
    run.hpMax = 110;
    run.sintonia = 5;
    run.animal = { tipo: animal, nivel: 1 };
    run.cajadoBonusAtaque = 2;
    run.druidaAnosAlta = 0;
    run.druidaAnoAvaliado = 0;
    run.inventario = [...new Set([...(run.inventario || []), "cajado_de_carvalho_vivo"])];
    run.itensConquistados = [...new Set([...(run.itensConquistados || []), "cajado_de_carvalho_vivo"])];
    run.logItens = [{ id: "cajado_de_carvalho_vivo", rodada: 1 }];
    run.comprasMercador.arma_melhor = Math.max(1, run.comprasMercador.arma_melhor || 0);
    iniciar(run, true);
    return run;
  }

  Jogo.druida = { traco: TRACO, animais, ehDruida, temItem, estacaoDaRodada, nivelNatural, iniciar,
    ajustarRecompensa, prepararEvento, honrasReveladas, concederMascara, plantarBosque, registrarAno, novaRun };
})();
