(function () {
  "use strict";
  const J = window.Jogo;
  const esc = (v) =>
    String(v).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  let runAtual = null,
    ajuda = null,
    focoOrigem = null,
    ajudaVista = false;
  let etapa = 0,
    modoAjuda = false;
  let inventarioRun = null,
    posicao = 0,
    itemFocado = null;
  let observador = null;
  let mapaRun = null,
    obraSelecionada = null;
  const efeitosVistos = new Set();
  const transicoesVistas = new Set();
  const chaveAjuda = "tutorial_combate_concluido";
  const chaveTexto = "velocidade_texto";
  function preferenciaTexto() {
    try {
      return ["imediato", "rapido", "normal"].includes(window.localStorage.getItem(chaveTexto))
        ? window.localStorage.getItem(chaveTexto)
        : "normal";
    } catch {
      return "normal";
    }
  }
  function foiVista() {
    try {
      return ajudaVista || window.localStorage.getItem(chaveAjuda) === "sim";
    } catch {
      return ajudaVista;
    }
  }
  function fechar() {
    if (!ajuda) return false;
    if (modoAjuda) {
      ajudaVista = true;
      try {
        window.localStorage.setItem(chaveAjuda, "sim");
      } catch {
        /* Mantém a preferência nesta sessão. */
      }
    }
    ajuda.close();
    ajuda.remove();
    ajuda = null;
    if (focoOrigem?.isConnected) focoOrigem.focus({ preventScroll: true });
    else
      document
        .querySelector('#app [data-acao="combate-rolar"], #app [data-acao="combate-continuar"], #app')
        ?.focus({ preventScroll: true });
    return true;
  }
  function abrir(titulo, conteudo) {
    if (!document.createElement) return false;
    if (ajuda) fechar();
    focoOrigem = document.activeElement;
    ajuda = document.createElement("dialog");
    ajuda.className = "sistemas-dialogo";
    ajuda.setAttribute("aria-label", titulo);
    ajuda.innerHTML = `<header class="sistemas-dialogo-cabecalho"><h2>${esc(titulo)}</h2><button type="button" class="dialogo-fechar" data-sistema-fechar aria-label="Fechar consulta">×</button></header>${conteudo}`;
    document.body.append(ajuda);
    ajuda.addEventListener("cancel", (e) => {
      e.preventDefault();
      fechar();
    });
    ajuda.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.closest("[data-sistema-fechar]")) fechar();
      else if (e.target.closest("[data-ajuda-proxima]")) {
        if (etapa === 3) fechar();
        else {
          etapa++;
          desenharAjuda();
        }
      } else if (e.target.closest("[data-ajuda-voltar]")) {
        etapa = Math.max(0, etapa - 1);
        desenharAjuda();
      }
    });
    ajuda.showModal();
    return true;
  }
  function regraEmpate(run) {
    const p = run.combatePendente || run.ultimoResultado?.combate;
    if (p?.ehTesteDados || (run.fase === "resultado" && run.ultimoResultado?.testeDados))
      return "Atingir a dificuldade dá sucesso; o limite intermediário dá sucesso com custo. Um 20 natural garante sucesso e um 1 natural causa falha.";
    if (p?.ehDueloDados) {
      const o = J.engine.opcaoCombatePendente(run);
      return o?.dueloDados?.empateVence ? "O empate favorece o herdeiro." : "O empate favorece o oponente.";
    }
    return p?.tracoInimigo === "veloz"
      ? "O inimigo Veloz vence o empate nos totais."
      : "O herdeiro vence o empate nos totais.";
  }
  function desenharAjuda() {
    const textos = [
      [
        "A disputa",
        `${regraEmpate(runAtual)} Em batalhas, compare o dado escolhido mais Ataque com o dado inimigo mais Defesa. O quadro de cada lado mostra esses valores.`,
      ],
      [
        "Antes da rolagem",
        "A postura fica nos controles de preparação: equilibrada mantém os valores; agressiva dá +2 Ataque e aumenta o dano em 25%; defensiva tira 2 Ataque e reduz o dano em 35%. Itens preparados informam quando serão consumidos.",
      ],
      [
        "Vitória e dano",
        "O quadro da rolagem mostra o vencedor. A seção de dano mostra a consequência: primeiro a margem da derrota, depois a postura, o Escudo e as reduções. Vencer uma batalha comum não causa dano de combate; outras consequências da carta continuam valendo.",
      ],
      [
        "Recursos e chefes",
        "Rerrolagens ficam junto aos dados e gastam a carga indicada. Chefes possuem Vida própria: confirmar um acerto retira Vida do chefe; um contra-ataque fere o herdeiro. A última troca permanece no painel. Fechar esta ajuda preserva o turno e todos os recursos.",
      ],
    ];
    const [titulo, texto] = textos[etapa];
    const exemplos = [
      `<div class="ajuda-duelo"><div><span>Herdeiro</span><strong>12 <small>+ 5 Ataque</small></strong><b>17</b></div><span class="ajuda-versus">contra</span><div><span>Inimigo</span><strong>9 <small>+ 6 Defesa</small></strong><b>15</b></div></div><p class="ajuda-exemplo-nota">Exemplo: 17 vence 15. Compare os totais, não só os dados.</p>`,
      `<div class="ajuda-posturas"><div><span>Equilibrada</span><strong>Sem ajuste</strong><small>Mantém Ataque e dano</small></div><div><span>Agressiva</span><strong>+2 Ataque</strong><small>Recebe 25% mais dano</small></div><div><span>Defensiva</span><strong>−2 Ataque</strong><small>Recebe 35% menos dano</small></div></div>`,
      `<ol class="ajuda-ordem"><li><span>01</span>Margem da derrota</li><li><span>02</span>Postura</li><li><span>03</span>Escudo</li><li><span>04</span>Outras proteções</li></ol><p class="ajuda-exemplo-nota">A rolagem decide a disputa. O cálculo de dano vem depois.</p>`,
      `<div class="ajuda-chefe"><span>Exemplo de chefe</span><div><strong>Vida do adversário</strong><span>25 / 50</span></div><meter min="0" max="50" value="25" aria-label="Exemplo: chefe com 25 de 50 Vida"></meter><p>Acerto confirmado → Vida do chefe diminui</p><p>Contra-ataque → suas proteções entram no cálculo</p></div>`,
    ];
    // A navegação troca apenas o conteúdo do diálogo; nenhum método da engine roda aqui.
    const origem = focoOrigem;
    modoAjuda = false;
    abrir(
      `Ajuda de combate · ${etapa + 1}/4`,
      `<ol class="ajuda-etapas" aria-label="Etapas da ajuda">${textos.map(([nome], i) => `<li ${i === etapa ? 'aria-current="step"' : ""} class="${i < etapa ? "ajuda-etapa-concluida" : ""}"><span>${i < etapa ? "✓" : String(i + 1).padStart(2, "0")}</span><small>${esc(nome)}</small></li>`).join("")}</ol><div class="ajuda-conteudo"><p class="ajuda-sobretitulo">Aprenda a resolver o confronto</p><h3>${esc(titulo)}</h3><p>${esc(texto)}</p><div class="ajuda-exemplo" aria-label="Exemplo ilustrativo">${exemplos[etapa]}</div></div><footer class="ajuda-rodape"><span>Esta consulta preserva seu turno.</span><div class="sistemas-acoes"><button class="botao discreto" type="button" data-ajuda-voltar ${etapa === 0 ? "disabled" : ""}>Voltar</button><button class="botao primario" type="button" data-ajuda-proxima>${etapa === 3 ? "Concluir ajuda" : "Próxima etapa"} <span aria-hidden="true">→</span></button></div></footer>`,
    );
    ajuda?.classList.add("sistemas-dialogo--combate");
    ajuda?.querySelector("[data-ajuda-proxima]")?.focus();
    modoAjuda = true;
    if (origem) focoOrigem = origem;
  }
  function tutorialCombate(run = runAtual, automatico = false) {
    if (!run) return false;
    runAtual = run;
    etapa = 0;
    focoOrigem = document.activeElement;
    desenharAjuda();
    if (automatico)
      focoOrigem = document.querySelector(
        '#app [data-acao="combate-rolar"], #app [data-acao="combate-continuar"]',
      );
    return true;
  }
  function detalhesAtributo(run, atributo) {
    modoAjuda = false;
    return abrir("Origem dos valores", `<p>${esc(J.sistemas.fontes(run, atributo))}</p>`);
  }
  function companheiros(run) {
    const presentes = J.sistemas.animais.filter(
      (id) => run.itensConquistados.includes(id) || run.inventario.includes(id),
    );
    return presentes.length
      ? `<details class="companheiros-status"><summary>Companheiros · ${presentes.length}</summary>${presentes
          .map((id) => {
            const i = J.itens.find((i) => i.id === id);
            return `<p><strong>${esc(i.nome)}</strong>: ${esc(i.descricao)} ${esc(J.sistemas.descricaoVinculo(run, id))}</p>`;
          })
          .join("")}</details>`
      : "";
  }
  function principal(run) {
    const r = run.ultimoResultado;
    if (!r) return "";
    const ordem = ["hp", "habitantes", "gold", "ataque", "escudo", "honra", "hpMax"];
    const chave =
      run.status === "encerrada"
        ? "Encerramento da crônica"
        : r.combate
          ? r.combate.venceu
            ? "Vitória no confronto"
            : "Derrota no confronto"
          : ordem.find((id) => r.alteracoes?.[id] < 0) || ordem.find((id) => r.alteracoes?.[id]);
    const nomes = {
      hp: "Vida",
      habitantes: "Habitantes",
      gold: "Gold",
      ataque: "Ataque",
      escudo: "Escudo",
      honra: "Honra",
      hpMax: "Vida máxima",
    };
    return chave
      ? `<p class="consequencia-principal">${esc(nomes[chave] ? `${nomes[chave]}: ${r.alteracoes[chave] > 0 ? "+" : ""}${r.alteracoes[chave]}` : chave)}</p>`
      : "";
  }
  function requisitos(run, requisitos) {
    if (!requisitos) return "";
    return requisitosTexto(run, requisitos);
  }
  function requisitosTexto(run, r) {
    const falta = [];
    const nomes = {
      hp: "Vida",
      habitantes: "Habitantes",
      gold: "Gold",
      ataque: "Ataque",
      escudo: "Escudo",
      honra: "Honra",
    };
    if (r.qualquer && !r.qualquer.some((q) => J.engine.cumpre(q, run)))
      falta.push(`Uma das alternativas: ${r.qualquer.map((q) => requisitosTexto(run, q)).join(" ou ")}`);
    for (const id of J.atributos) {
      const minimo = r[`${id}Min`];
      if (minimo !== undefined && minimo > run.atributos[id])
        falta.push(`Faltam ${minimo - run.atributos[id]} ${nomes[id] || id}`);
      const maximo = r[`${id}Max`];
      if (maximo !== undefined && run.atributos[id] > maximo)
        falta.push(`${nomes[id] || id}: exige no máximo ${maximo}; atual ${run.atributos[id]}`);
    }
    if (r.rodadaMin > run.rodada) falta.push(`Faltam ${r.rodadaMin - run.rodada} dias`);
    if (r.rodadaMax < run.rodada) falta.push(`Disponível somente até o dia ${r.rodadaMax}`);
    const estacoes = r.estacoes || (r.estacao ? [r.estacao] : null);
    if (estacoes && !estacoes.includes(run.estacao)) falta.push(`Exige estação: ${estacoes.join(" ou ")}`);
    for (const chave of ["itens", "itensPermanentes", "itensProntos"])
      for (const id of r[chave] || []) {
        if (!J.engine.cumpre({ [chave]: [id] }, run))
          falta.push(
            `Exige ${J.itens.find((i) => i.id === id)?.nome || "item"}${chave === "itensProntos" ? " pronto para uso" : ""}`,
          );
      }
    const populacao = run.cultoAtivo ? run.seguidoresCulto : run.atributos.habitantes;
    if (r.populacaoMinimo > populacao)
      falta.push(`Faltam ${r.populacaoMinimo - populacao} ${run.cultoAtivo ? "Seguidores" : "Habitantes"}`);
    if (r.seguidoresMin > run.seguidoresCulto)
      falta.push(`Faltam ${r.seguidoresMin - run.seguidoresCulto} Seguidores`);
    if (r.seguidoresMax < run.seguidoresCulto) falta.push(`Exige no máximo ${r.seguidoresMax} Seguidores`);
    return falta.join("; ");
  }
  function indisponiveis(evento, run) {
    return J.engine
      .opcoesIndisponiveis(evento, run)
      .map(
        (o) =>
          `<details class="requisito-consulta"><summary aria-describedby="requisito-${esc(o.id)}">${esc(o.texto)} · Indisponível<span class="requisito-hover" aria-hidden="true">${esc(requisitos(run, o.requisitos))}</span></summary><p class="requisito-dica" id="requisito-${esc(o.id)}">${esc(requisitos(run, o.requisitos))}</p></details>`,
      )
      .join("");
  }
  function mapa(run) {
    const S = J.sistemas,
      v = S.vila(run);
    if (mapaRun !== run.id) {
      mapaRun = run.id;
      obraSelecionada = null;
    }
    obraSelecionada ||= run.construcoes.find((id) => Object.hasOwn(S.obras, id)) || "ponte";
    const beneficio = (id) =>
      ({
        ponte: "+1 Gold por nível acima do primeiro a cada 3 dias, com 20 habitantes",
        moinho: "+1 Vida diária por nível acima do primeiro",
        capela: "+1 Vida diária por nível acima do primeiro; o Escudo recebido permanece",
        forja: "+1 Gold de desconto por nível acima do primeiro na arma melhorada",
        muralha: "Evita mais 1 de dano por nível acima do primeiro",
        torre_vigia: "Evita mais 1 de dano por nível acima do primeiro",
        celeiro: "Evita 1 de dano de combate por nível acima do primeiro",
        mercado_coberto: "+1 Gold por nível acima do primeiro a cada 5 dias",
        entreposto_comercial: "+1 Gold por nível acima do primeiro a cada 2 dias",
        cisterna_comunitaria: "+1 Habitante por nível acima do primeiro a cada 3 dias",
        enfermaria_ervateira: "+1 Vida diária por nível acima do primeiro, abaixo de 60 Vida",
        praca_forca: "+1 Gold por nível acima do primeiro a cada 6 dias",
      })[id];
    const efeitoAtual = (id, nivel = S.nivelObra(run, id)) => {
      if (!nivel) return "Os benefícios recorrentes estão suspensos até o reparo.";
      const extra = nivel - 1;
      return {
        ponte: `+${nivel} Gold a cada 3 dias, com pelo menos 20 habitantes.${v.obras.ponte?.caminho === "comercio" ? " Comércio: mais 1 Gold a cada 3 dias." : v.obras.ponte?.caminho === "guarda" ? " Guarda: evita 2 de dano de combate." : ""}`,
        moinho: `+${nivel + (run.sistemas?.especializacao === "comunitario" ? 1 : 0)} Vida por dia${run.sistemas?.especializacao === "comercial" ? "; +1 Gold a cada 5 dias" : ""}.`,
        capela: `+${extra} Vida por dia. O Escudo recebido na construção permanece.`,
        forja: `Desconto de ${2 + extra} Gold na arma melhorada.`,
        muralha: `Evita ${2 + extra} de dano de combate.`,
        torre_vigia: `Evita ${3 + extra} de dano de combate.`,
        celeiro: `Reduz pela metade as perdas de habitantes na fome e seca; evita ${extra} de dano de combate.`,
        mercado_coberto: `+${nivel} Gold a cada 5 dias.`,
        praca_forca: `+${nivel} Gold a cada 6 dias. Mantém as cobranças de Honra e os efeitos do culto.`,
        enfermaria_ervateira: `+${nivel} Vida por dia enquanto sua Vida estiver abaixo de 60.`,
        entreposto_comercial: `+1 Gold a cada 2 dias desde a construção${extra ? `; melhorias: +${extra} Gold nos dias pares` : ""}.`,
        cisterna_comunitaria: `+1 Habitante a cada 3 dias desde a construção${extra ? `; melhorias: +${extra} Habitante nos dias múltiplos de 3` : ""}.`,
      }[id];
    };
    const botao = (id, acao, texto, caminho = null) => {
      const falta = S.faltaObra(run, id, acao);
      return `<button type="button" class="botao" data-acao="obra-vila" data-obra="${id}" data-trabalho="${acao}" ${caminho ? `data-caminho="${caminho}"` : ""} ${falta ? `disabled aria-describedby="obra-motivo-${id}"` : ""}>${esc(texto)}</button>`;
    };
    const detalhes = Object.entries(S.obras)
      .map(([id, [nome, base]]) => {
        const o = v.obras[id];
        const estado = !o
          ? "Não construída"
          : o.dano === 2
            ? "Interrompida"
            : o.dano
              ? "Danificada"
              : "Em uso";
        const n = S.nivelObra(run, id);
        let acoes = "";
        let motivo = "";
        const caminhos = (
          id === "ponte"
            ? [
                ["comercio", "Comércio: +1 Gold a cada 3 dias"],
                ["guarda", "Guarda: evita 2 de dano"],
              ]
            : [
                ["comunitario", "Comunitário: +1 Vida por dia"],
                ["comercial", "Comercial: +1 Gold a cada 5 dias"],
              ]
        ).filter(([c]) => !o?.caminho || o.caminho === c);
        if (!o) motivo = S.faltaObra(run, id, "melhorar");
        else if (o.projeto) {
          motivo = S.faltaObra(run, id, "concluir");
          const escolhas = o.projeto.tipo === "melhorar" && o.nivel === 2 && ["ponte", "moinho"].includes(id);
          acoes = escolhas
            ? caminhos.map(([c, t]) => botao(id, "concluir", `Concluir · ${t}`, c)).join("")
            : botao(id, "concluir", "Concluir o trabalho");
        } else if (o.dano) {
          motivo = S.faltaObra(run, id, "reparar");
          acoes =
            botao(id, "reparar", "Reparar · 4 Gold") +
            botao(id, "mutirao", "Organizar reparo comunitário · sem Gold; 3 dias de espera");
        } else if (o.nivel < 3) {
          motivo = S.faltaObra(run, id, "melhorar");
          acoes =
            o.nivel === 2 && ["ponte", "moinho"].includes(id)
              ? caminhos.map(([c, t]) => botao(id, "melhorar", `${t} · ${S.custoObra(o)} Gold`, c)).join("")
              : botao(id, "melhorar", `Melhorar para nível ${o.nivel + 1} · ${S.custoObra(o)} Gold`);
          acoes += botao(id, "historia", "Reunir os artesãos · sem Gold; 3 dias de espera");
        }
        return `<details id="obra-detalhe-${id}" data-obra-id="${id}" ${obraSelecionada === id ? "open" : "hidden"} class="mapa-obra mapa-obra--nivel-${o?.nivel || 0}${o ? " mapa-obra--erguida" : " mapa-obra--bloqueada"}${o?.dano ? " mapa-obra--dano" : ""}"><summary><span class="mapa-casa" aria-hidden="true">${iconeObra(id)}</span><strong>${esc(nome)}</strong><span class="mapa-estado">${estado}${o ? ` · nível ${o.nivel}` : ""}</span></summary><div class="mapa-efeito"><span>Benefício original</span><p>${esc(base)}.</p></div>${o ? `<div class="mapa-efeito"><span>Efeito atual · nível ${n}</span><p>${esc(efeitoAtual(id))}${o.dano === 1 ? " O dano reduz a melhoria em um nível." : ""}</p></div>${o.caminho ? `<p class="mapa-caminho">Escolha definitiva: ${esc(o.caminho)}${o.dano === 2 ? " (suspensa durante o dano)" : ""}.</p>` : ""}${o.nivel < 3 ? `<div class="mapa-proxima"><span>Próxima melhoria</span><strong>Nível ${o.nivel + 1}</strong><p>${esc(beneficio(id))}. Intervalo de 6 dias desde a última obra.</p></div>` : ""}${o.projeto ? `<p>Artesãos cuidando de ${o.projeto.tipo === "reparar" ? "reparos" : "melhorias"}. A conclusão não passa o dia.</p>` : ""}` : ""}<p id="obra-motivo-${id}" class="mapa-motivo" role="status">${esc(motivo)}</p><div class="mapa-acoes">${acoes}</div></details>`;
      })
      .join("");
    const posicoes = {
      celeiro: [14, 19],
      moinho: [38, 19],
      capela: [62, 19],
      torre_vigia: [86, 19],
      cisterna_comunitaria: [14, 47],
      praca_forca: [38, 47],
      mercado_coberto: [62, 47],
      enfermaria_ervateira: [86, 47],
      ponte: [14, 77],
      entreposto_comercial: [38, 77],
      forja: [62, 77],
      muralha: [86, 77],
    };
    const marcadores = Object.entries(S.obras)
      .map(([id, [nome]]) => {
        const o = v.obras[id],
          [x, y] = posicoes[id];
        const situacao = !o
          ? "Não construída"
          : o.dano
            ? o.dano === 2
              ? "Interrompida"
              : "Danificada"
            : o.projeto
              ? "Em obras"
              : "Em uso";
        return `<button type="button" class="mapa-marco ${!o ? "mapa-marco--bloqueado" : o.dano ? "mapa-marco--dano" : "mapa-marco--ativo"}" style="--x:${x}%;--y:${y}%" data-mapa-obra="${id}" aria-pressed="${obraSelecionada === id}" aria-controls="obra-detalhe-${id}" aria-label="${esc(nome)}: ${situacao}${o ? `, nível ${o.nivel}` : ""}"><span class="mapa-marco-desenho" aria-hidden="true">${iconeObra(id)}</span><strong>${esc(nome)}</strong><span class="mapa-marco-estado">${situacao}</span>${o ? `<span class="mapa-niveis" aria-hidden="true">${[1, 2, 3].map((n) => `<i class="${n <= o.nivel ? "preenchido" : ""}"></i>`).join("")}</span>` : ""}</button>`;
      })
      .join("");
    return `<div class="mapa-vila mapa-vila--${esc(run.estacao)}" aria-label="Mapa da vila"><header class="mapa-cabecalho"><div><p class="mapa-sobretitulo">Terras da sua crônica</p><h3>A vila e suas obras</h3></div><span class="mapa-estacao">${esc({ primavera: "Primavera", verao: "Verão", outono: "Outono", inverno: "Inverno" }[run.estacao])}</span></header><div class="mapa-resumo"><span><strong>${run.construcoes.length}</strong> obras erguidas</span><span><strong>${Object.values(v.obras).filter((o) => o.dano).length}</strong> com danos</span><span>Selecione uma obra no mapa</span></div><div class="mapa-layout"><div class="mapa-planta" role="group" aria-label="Construções da vila"><svg class="mapa-caminhos" viewBox="0 0 600 480" preserveAspectRatio="none" aria-hidden="true"><path class="mapa-rio" d="M15 0C110 80 5 165 80 250S30 410 120 480"/><path d="M84 92H516M84 226H516M84 370H516M228 92V370M372 92V370M516 92V370"/><path class="mapa-contorno" d="M40 45Q300 5 560 45L580 425Q300 475 40 430Z"/></svg><span class="mapa-norte" aria-hidden="true">N<span>↑</span></span>${marcadores}<span class="mapa-planta-nota">Caminhos da vila</span></div><aside class="mapa-inspecao" aria-label="Detalhes da construção">${detalhes}</aside></div>${v.marcas.map((m) => `<p class="mapa-marca">${m.tipo === "festa" ? "Enfeites da colheita" : "Destroços após o ataque"} · até o dia ${m.fim}</p>`).join("")}${v.relato ? `<p class="mapa-relato" role="status">${esc(v.relato)}</p>` : ""}<p class="mapa-legenda">Consultar o mapa não consome dias. As obras não construídas dependem de encontros da vila.</p></div>`;
  }
  function iconeObra(id) {
    const formas = {
      ponte: "M3 18h26M5 18V9h3v9m16 0V9h3v9M8 12q8-9 16 0M4 24q4-4 8 0t8 0t8 0",
      moinho: "M11 27l2-13h6l2 13ZM16 14V3m0 11L5 7m11 7 11-7m-11 7v12M10 5l6 9 6-9",
      capela: "M8 27V13l8-7 8 7v14ZM16 6V1m-3 3h6M13 27v-8h6v8",
      forja: "M5 14h23l-5 5H9Zm8 5v5m-4 3h14M16 10q-4-4 0-7 4 4 0 7",
      muralha: "M4 27V8h5v4h5V8h5v4h5V8h4v19ZM4 20h24M10 12v8m11-8v8m-6 0v7",
      mercado_coberto: "M4 13l4-8h16l4 8M5 13v14h22V13M3 13h26M11 5l-2 8m12-8 2 8M10 27v-9h12v9",
      cisterna_comunitaria: "M7 14h18v13H7ZM4 14 16 5l12 9M16 6v16m-4 0h8M3 29h26",
      entreposto_comercial: "M4 27V12l12-7 12 7v15ZM11 27V16h10v11M8 10h16m-8-5V2",
      torre_vigia: "M9 27l2-16H8V5h5v4h6V5h5v6h-3l2 16ZM14 17h4v5h-4",
      enfermaria_ervateira: "M5 27V13l11-8 11 8v14ZM12 16h8m-4-4v8M12 27v-5h8v5",
      praca_forca: "M5 27h23M10 27V5h14M10 10l5-5m9 0v10m0 0q-5 3 0 7 5-4 0-7",
      celeiro: "M5 27V12l11-8 11 8v15ZM11 27V15h10v12m-10-12 10 12m0-12L11 27",
    };
    return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${formas[id]}"/></svg>`;
  }
  function selecionarObra(id, focar = false) {
    const detalhe = document.querySelector(`[data-obra-id="${id}"]`);
    if (!detalhe) return;
    obraSelecionada = id;
    document.querySelectorAll("[data-obra-id]").forEach((el) => {
      el.hidden = el !== detalhe;
      el.open = el === detalhe;
    });
    document
      .querySelectorAll("[data-mapa-obra]")
      .forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.mapaObra === id)));
    if (focar) detalhe.querySelector("summary")?.focus({ preventScroll: true });
  }
  document.addEventListener("click", (e) => {
    const marco = e.target.closest?.("[data-mapa-obra]");
    if (marco) {
      selecionarObra(marco.dataset.mapaObra);
      if (window.matchMedia?.("(max-width: 900px)").matches)
        document.querySelector(".mapa-inspecao")?.scrollIntoView({
          block: "nearest",
          behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
    }
  });
  function fecharPainel(run) {
    if (fechar()) return true;
    if (run?.construcoesAbertas) {
      J.ui.alternarConstrucoes(run, false);
      document.querySelector('[data-acao="alternar-construcoes"]')?.focus();
      return true;
    }
    for (const [seletor, acao] of [
      ["#painel-progresso", "alternar-progresso"],
      ["#painel-inventario", "alternar-inventario"],
    ]) {
      const painel = document.querySelector(seletor);
      if (painel?.open && !(seletor === "#painel-inventario" && run?.fase === "combate")) {
        painel.open = false;
        document.querySelector(`[data-acao="${acao}"]`)?.focus();
        return true;
      }
    }
    return false;
  }
  const jogoOriginal = J.ui.jogo;
  J.ui.jogo = function (run, opcoes) {
    const painelAnterior = document.querySelector("#painel-inventario ul");
    if (inventarioRun === run.id && painelAnterior) {
      posicao = painelAnterior.scrollTop;
      itemFocado = document.activeElement?.closest?.("[data-usar-item]")?.dataset.usarItem || null;
    } else if (inventarioRun !== run.id) {
      posicao = 0;
      itemFocado = null;
    }
    inventarioRun = run.id;
    runAtual = run;
    observador?.disconnect();
    jogoOriginal(run, opcoes);
    const painel = document.querySelector("#painel-inventario ul");
    if (painel) {
      painel.scrollTop = posicao;
      painel.addEventListener(
        "scroll",
        () => {
          posicao = painel.scrollTop;
        },
        { passive: true },
      );
      document.querySelector("#painel-inventario")?.addEventListener("toggle", (e) => {
        if (e.target.open) {
          painel.scrollTop = posicao;
          if (itemFocado)
            [...painel.querySelectorAll("[data-usar-item]")]
              .find((b) => b.dataset.usarItem === itemFocado)
              ?.focus({ preventScroll: true });
        }
      });
    }
    const podeEnsinar = () =>
      runAtual === run &&
      run.fase === "combate" &&
      !run.combatePendente?.ehTesteDados &&
      !run.combatePendente?.ehDueloDados &&
      !foiVista() &&
      !ajuda &&
      !document.querySelector(".tutorial-camada") &&
      document.querySelector(".cronica");
    if (podeEnsinar()) tutorialCombate(run, true);
    else if (run.fase === "combate" && !foiVista() && window.MutationObserver) {
      observador = new window.MutationObserver(() => {
        if (podeEnsinar()) {
          observador.disconnect();
          tutorialCombate(run, true);
        }
      });
      observador.observe(document.getElementById("app"), { childList: true, subtree: true });
    }
    const avisoEfeito = document.querySelector(".efeito-consumido");
    const chaveEfeito = `${run.id}:${run.rodada}:${run.eventoId}:${run.combatePendente?.turnosChefe || 0}`;
    if (avisoEfeito) {
      avisoEfeito.classList.toggle(
        "efeito-consumido--novo",
        !opcoes?.textoCompleto && !efeitosVistos.has(chaveEfeito),
      );
      efeitosVistos.add(chaveEfeito);
    }
    const transicao = document.querySelector(".transicao-estacao");
    const chaveEstacao = `${run.id}:${run.sistemas?.estacaoVista}`;
    if (transicao) {
      transicao.classList.toggle(
        "transicao-estacao--nova",
        !opcoes?.textoCompleto && !transicoesVistas.has(chaveEstacao),
      );
      transicoesVistas.add(chaveEstacao);
    }
  };
  // Captura antes dos atalhos do controlador, inclusive enquanto o diálogo estiver aberto.
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.repeat && ["Enter", " "].includes(e.key)) {
        e.preventDefault();
        return;
      }
      if (ajuda && !ajuda.contains(e.target)) {
        e.preventDefault();
        e.stopImmediatePropagation?.();
        return;
      }
      if (e.key === "Escape" && fecharPainel(runAtual)) {
        e.preventDefault();
        e.stopImmediatePropagation?.();
      }
    },
    true,
  );
  J.ui.tutorialCombate = tutorialCombate;
  J.ui.ajudaCombateAberta = () => Boolean(ajuda);
  J.ui.detalhesAtributo = detalhesAtributo;
  J.ui.consultarRequisito = (texto) => {
    modoAjuda = false;
    return abrir("Requisito da compra", `<p>${esc(texto)}</p>`);
  };
  J.ui.preferenciaTexto = preferenciaTexto;
  J.ui.alternarVelocidadeTexto = () => {
    const valor = { normal: "rapido", rapido: "imediato", imediato: "normal" }[preferenciaTexto()];
    try {
      window.localStorage.setItem(chaveTexto, valor);
    } catch {
      /* A partida continua sem armazenamento. */
    }
    return valor;
  };
  J.sistemasUI = { companheiros, principal, requisitos, regraEmpate, mapa, indisponiveis, selecionarObra };
})();
