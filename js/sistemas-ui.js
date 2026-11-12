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
  let velocidadeSessao = null;
  function preferenciaTexto() {
    if (velocidadeSessao) return velocidadeSessao;
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
        `${regraEmpate(runAtual)} Compare os totais: seu dado mais Ataque contra o dado inimigo mais Defesa.`,
      ],
      [
        "Antes da rolagem",
        "Escolha a postura antes de rolar. Agressiva favorece o Ataque; defensiva reduz o dano recebido. Os itens preparados indicam quando serão consumidos.",
      ],
      [
        "Vitória e dano",
        "Os dados decidem o vencedor; as proteções definem o dano. Vencer uma batalha comum evita o golpe, mas preserva as outras consequências da carta.",
      ],
      [
        "Recursos e chefes",
        "Rerrolagens gastam a carga indicada junto aos dados. Contra chefes, confirme cada turno para aplicar o acerto ou contra-ataque. A luta continua enquanto ambos tiverem Vida.",
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
      "Ajuda de combate",
      `<ol class="ajuda-etapas" aria-label="Etapas da ajuda">${textos.map(([nome], i) => `<li ${i === etapa ? 'aria-current="step"' : ""} class="${i < etapa ? "ajuda-etapa-concluida" : ""}"><span aria-hidden="true">${i < etapa ? "✓" : i + 1}</span><small>${esc(nome)}</small></li>`).join("")}</ol><div class="ajuda-conteudo"><h3>${esc(titulo)}</h3><p>${esc(texto)}</p><div class="ajuda-exemplo" aria-label="Exemplo ilustrativo">${exemplos[etapa]}</div></div><footer class="ajuda-rodape"><span>Seu turno está preservado.</span><div class="sistemas-acoes"><button class="botao discreto" type="button" data-ajuda-voltar ${etapa === 0 ? "disabled" : ""}>Voltar</button><button class="botao primario" type="button" data-ajuda-proxima>${etapa === 3 ? "Concluir ajuda" : "Próxima etapa"}</button></div></footer>`,
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
  function atributoPrincipal(resultado) {
    const ordem = ["hp", "habitantes", "gold", "ataque", "escudo", "honra", "hpMax"];
    return (
      ordem.find((id) => resultado.alteracoes?.[id] < 0) || ordem.find((id) => resultado.alteracoes?.[id])
    );
  }
  function principal(run) {
    const r = run.ultimoResultado;
    if (!r) return "";
    const chave =
      run.status === "encerrada"
        ? "Encerramento da crônica"
        : r.combate
          ? r.combate.venceu
            ? "Vitória no confronto"
            : "Derrota no confronto"
          : atributoPrincipal(r);
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
      .map((o) => escolhaIndisponivel(o.texto, requisitos(run, o.requisitos)))
      .join("");
  }
  function escolhaIndisponivel(texto, motivo, detalhe = "") {
    return `<details class="escolha escolha-desabilitada requisito-consulta"><summary><span class="escolha-conteudo"><span>${esc(texto)}</span>${detalhe ? `<small>${esc(detalhe)}</small>` : ""}<small>${esc(motivo)}</small></span><span class="requisito-hover" aria-hidden="true">${esc(motivo)}</span></summary><p class="requisito-dica">${esc(motivo)}. Esta escolha não pode ser executada agora.</p></details>`;
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
    const bloqueioGeral = (id) => {
      const o = v.obras[id];
      return S.faltaObra(run, id, o?.projeto ? "concluir" : o?.dano ? "mutirao" : "historia");
    };
    const botao = (id, acao, texto, caminho = null) => {
      const falta = S.faltaObra(run, id, acao);
      const comum = falta && falta === bloqueioGeral(id);
      const motivoId = comum ? `obra-bloqueio-${id}` : `obra-${id}-${acao}-${caminho || "padrao"}`;
      return `<div class="mapa-acao"><button type="button" class="botao" data-acao="obra-vila" data-obra="${id}" data-trabalho="${acao}" ${caminho ? `data-caminho="${caminho}"` : ""} ${falta ? `disabled aria-describedby="${motivoId}"` : ""}>${esc(texto)}</button>${falta && !comum ? `<small id="${motivoId}">${esc(falta)}</small>` : ""}</div>`;
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
        const historia = o?.projeto ? `<p class="mapa-historia">${esc(S.historiasObras[id])}</p>` : "";
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
          motivo = "";
          const escolhas = o.projeto.tipo === "melhorar" && o.nivel === 2 && ["ponte", "moinho"].includes(id);
          acoes = escolhas
            ? caminhos.map(([c, t]) => botao(id, "concluir", `Concluir · ${t}`, c)).join("")
            : botao(id, "concluir", "Concluir o trabalho");
        } else if (o.dano) {
          motivo = "Repare a construção para recuperar seus benefícios.";
          acoes =
            botao(id, "reparar", "Reparar · 4 Gold") +
            botao(id, "mutirao", "Organizar reparo comunitário · sem Gold; 3 dias de espera");
        } else if (o.nivel < 3) {
          motivo = "";
          acoes =
            o.nivel === 2 && ["ponte", "moinho"].includes(id)
              ? caminhos.map(([c, t]) => botao(id, "melhorar", `${t} · ${S.custoObra(o)} Gold`, c)).join("")
              : botao(id, "melhorar", `Melhorar para nível ${o.nivel + 1} · ${S.custoObra(o)} Gold`);
          acoes += botao(id, "historia", "Reunir os artesãos · sem Gold; 3 dias de espera");
        }
        return `<details id="obra-detalhe-${id}" data-obra-id="${id}" ${obraSelecionada === id ? "open" : "hidden"} class="mapa-obra mapa-obra--nivel-${o?.nivel || 0}${o ? " mapa-obra--erguida" : " mapa-obra--bloqueada"}${o?.dano ? " mapa-obra--dano" : ""}"><summary><strong>${esc(nome)}</strong><span class="mapa-estado">${estado}${o ? ` · nível ${o.nivel}` : ""}</span></summary>${o ? `<div class="mapa-efeito"><span>Efeito atual${o.dano === 1 ? ` · nível efetivo ${n}` : ""}</span><p>${esc(efeitoAtual(id))}</p></div>${o.caminho ? `<p class="mapa-caminho">Escolha definitiva: ${esc(o.caminho)}${o.dano === 2 ? " (suspenso até reparar)" : ""}.</p>` : ""}${o.nivel < 3 && !o.dano && !o.projeto ? `<div class="mapa-proxima"><span>Próxima melhoria · nível ${o.nivel + 1}</span><p>${esc(beneficio(id))}. Intervalo de 6 dias desde a última obra.</p></div>` : ""}${o.projeto ? `<p>Artesãos cuidando de ${o.projeto.tipo === "reparar" ? "reparos" : "melhorias"}. Conclua aqui quando o trabalho ficar pronto.</p>` : ""}` : `<p>${esc(base)}.</p>`}<p class="mapa-motivo" role="status">${esc(motivo)}</p>${o && bloqueioGeral(id) ? `<p id="obra-bloqueio-${id}" class="mapa-motivo">${esc(bloqueioGeral(id))}</p>` : ""}${historia}<div class="mapa-acoes">${acoes}</div></details>`;
      })
      .join("");
    return `<div class="mapa-vila mapa-vila--${esc(run.estacao)}" aria-label="Mapa da vila"><header class="mapa-cabecalho"><h3>A vila e suas obras</h3><span class="mapa-estacao">${esc({ primavera: "Primavera", verao: "Verão", outono: "Outono", inverno: "Inverno" }[run.estacao])} · ${run.construcoes.length} ${run.construcoes.length === 1 ? "obra" : "obras"}</span></header><div class="mapa-layout"><div class="mapa-territorio"><div class="mapa-planta" tabindex="0" aria-label="Mapa das construções; mova o mapa para explorar a vila">${cenaDaVila(run, obraSelecionada)}</div></div><aside class="mapa-inspecao" aria-label="Detalhes da construção">${detalhes}</aside></div></div>`;
  }
  // O cenário deriva somente do save: consultar nunca cria níveis, marcas ou caminhos.
  function cenaDaVila(run, selecionada) {
    const obras = J.sistemas.vila(run).obras;
    const posicoes = {
      moinho: [260, 180],
      celeiro: [470, 170],
      capela: [700, 140],
      torre_vigia: [880, 215],
      cisterna_comunitaria: [440, 340],
      praca_forca: [650, 320],
      muralha: [900, 365],
      mercado_coberto: [760, 465],
      ponte: [175, 410],
      entreposto_comercial: [320, 535],
      enfermaria_ervateira: [550, 520],
      forja: [835, 590],
    };
    const caminho = (id) => {
      const [x, y] = posicoes[id];
      return obras[id]
        ? `<path data-caminho-obra="${id}" class="vila-caminho" d="M650 335 Q${x + 35} ${y + 50} ${x} ${y + 12}"/>`
        : "";
    };
    const arvore = (x, y, i) =>
      `<g transform="translate(${x} ${y})" class="vila-arvore"><path d="M0 0 1-49m0 20-21-18m21 12 20-18M0-8l-13-16"/>${run.estacao === "inverno" ? '<path class="vila-neve" d="m-21-47 13 9m28-14-12 9"/>' : `<path class="vila-copa" d="M-24-43q-10-21 11-23 0-17 15-12 20-6 22 13 21 6 13 22-8 19-29 13-21 8-32-13Z"/>`}${run.estacao === "outono" ? `<path class="vila-folhas" d="m${i % 2 ? -24 : 15} 0 6-3 3 5-7 2ZM-11 6l5-5 7 3-6 6Z"/>` : ""}</g>`;
    const marcos = Object.entries(posicoes)
      .map(([id, [x, y]]) => {
        const o = obras[id];
        const nome = J.sistemas.obras[id][0];
        const estado = !o
          ? "Não construída"
          : o.dano === 2
            ? "Interrompida"
            : o.dano
              ? "Danificada"
              : `Nível ${o.nivel}`;
        return `<a href="#obra-detalhe-${id}" role="button" data-mapa-obra="${id}" data-nivel="${o?.nivel || 0}" data-dano="${o?.dano || 0}" aria-pressed="${selecionada === id}" aria-label="${esc(nome)}: ${estado}" aria-controls="obra-detalhe-${id}" class="vila-construcao${o ? " vila-construcao--erguida" : " vila-construcao--futura"}" transform="translate(${x} ${y})"><title>${esc(nome)} · ${estado}</title><rect class="vila-alvo" x="-66" y="-119" width="132" height="148" rx="5"/>${edificioDaVila(id, o?.nivel || 1, o?.dano || 0, run.estacao, o?.caminho)}${o?.projeto ? '<g class="vila-andaime"><path d="M-52 5V-65m108 70v-70M-55-35H60M-55-5H60m-108 10 108-70m-108 0L56 5"/></g>' : ""}<text class="vila-nome" text-anchor="middle" y="27">${esc(nome)}</text></a>`;
      })
      .join("");
    const marcas = (run.vila?.marcas || [])
      .filter((m) => m.fim >= run.rodada)
      .map((m) =>
        m.tipo === "festa"
          ? '<g class="vila-festa" data-marca-visual="festa"><path d="M570 252q75 40 155 0M570 252v67m155-67v67"/><path d="m585 259 8 22 12-15m20 6 9 23 11-20m20-1 10 19 10-25m20-4 7 16 5-21"/><path d="M606 344h58v9h-58Zm3 9v17m50-17v17"/></g>'
          : '<g class="vila-destrocos" data-marca-visual="destrocos"><path d="m465 406 29-10 10 8-28 10Zm35 12 14-10 12 7-17 11Zm-40 12 7-7 12 3-5 9Zm56 11 29-8-23 15m-57-33 39 29"/></g>',
      )
      .join("");
    const campos =
      run.estacao === "verao" || run.estacao === "outono"
        ? '<g class="vila-campos"><path d="m305 245 88-12 28 44-87 16Zm11 11 79-12m-74 22 79-12m-73 22 79-12m-72 22 79-12"/></g>'
        : run.estacao === "primavera"
          ? '<g class="vila-brotos"><path d="m331 277 2-12m-2 6-6-4m8 1 6-5m20 9 2-12m-2 6-5-3m7 0 5-5m18 10 2-12m-2 7-6-4m8 0 5-4"/></g>'
          : '<g class="vila-neve" data-estacao-visual="inverno"><path d="M330 281q30-12 63-7m-23-37 18-2M576 440q26-12 51-5M720 558l41-6"/></g>';
    return `<svg class="vila-cenario" viewBox="0 0 1000 680" role="group" aria-label="Vila no ${esc(run.estacao)}; selecione uma construção"><defs><pattern id="vila-hachura" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><path d="M0 0V7"/></pattern><pattern id="vila-pedra" width="20" height="13" patternUnits="userSpaceOnUse"><path d="M0 0H20M0 13V0m10 0v7m-10 0h20"/></pattern></defs><g class="vila-terreno"><path d="M75 125q159-80 380-47t470 17M39 568q124 65 299 63m271-9q179 51 330-6M334 82l64-11m382 31 53 7M398 625l71 8"/><path class="vila-rio" d="M142 16C35 164 231 232 144 355S139 542 225 659"/><path class="vila-agua" d="m99 112 29-5m-13 28 21-6m32 116 22-4m-20 28 15-5m-58 77 19-5m-29 31 20-6m15 128 25-5m-2 38 27-5m16 39 24-4"/>${[
      [43, 197],
      [74, 265],
      [88, 558],
      [298, 95],
      [525, 78],
      [841, 94],
      [950, 480],
      [693, 615],
    ]
      .map(([x, y], i) => arvore(x, y, i))
      .join(
        "",
      )}${campos}</g><g class="vila-rede-caminhos">${Object.keys(posicoes).map(caminho).join("")}</g>${marcos}${marcas}</svg>`;
  }
  function edificioDaVila(id, nivel, dano, estacao, caminho) {
    const path = (d, classe = "") => `<path${classe ? ` class="${classe}"` : ""} d="${d}"/>`;
    const casa = (altura = 48, largura = 40) =>
      `<g class="vila-paredes">${path(`M${-largura} 0V${-altura}L0 ${-altura - 28} ${largura} ${-altura}V0Z`)}${path(`M${-largura - 7} ${-altura} 0 ${-altura - 31} ${largura + 7} ${-altura}M0 ${-altura - 27}V0M${-largura} -10H${largura}`)}<path class="vila-telhado" d="M${-largura - 7} ${-altura} 0 ${-altura - 31} ${largura + 7} ${-altura}Z"/>${path(`M-12 0v-29q12-14 24 0V0M-29 -33h12v12h-12Zm46 0h12v12H17`)}${nivel >= 2 ? path(`M${-largura + 3} ${-altura + 5}H${largura - 3}M-30 -1V${-altura + 6}m60 0V-1M-30-13 30 ${-altura + 9}m-60 0 60 ${altura - 22}`) : ""}</g>`;
    if (dano === 2)
      return `<g class="vila-ruina" data-estado-visual="interrompida">${path("M-48 0v-39l14 6 8-18 11 17 15-13 12 18 17-5 14 34ZM-52 3l15-12 13 9-12 7Zm24-10 14-12 14 11-16 9Zm34 7 17-20 14 8-10 16Zm19-6 18-5 15 12-29 7ZM-28-28l46 35m-21-41 22 38")}</g>`;
    let desenho;
    if (id === "ponte") {
      desenho =
        nivel === 1
          ? path(
              "M-64-24 48-49 65-14-48 16Zm3 6L50-42m-102 33L56-30m-103 33L61-20M-47 11v20m96-63v23M-60-30v24m103-50v24M-61-22 44-46",
            )
          : `<g class="vila-paredes">${path("M-65-30 45-54 65-22-45 13l-20-5Zm10 35q0-36 26-31 18 8 19 20m15-8q0-39 25-32 18 6 23 18M-64-24 46-46l14 18-110 34Z")}${path("M-61-21 48-45l9 13-109 33Z", "vila-pedra")}${nivel === 3 ? path("M-65-30v-17l9-2v11l14-3v-11l9-2v11l14-3v-11l9-2v12l13-3v-12l9-2v12l14-3v-12l9-2v12l13-3v-11l9-2v18M-40 18v-16m24 8V-5m22 8v-16m24 9v-16") : ""}</g>`;
    } else if (id === "moinho") {
      desenho = `<g class="vila-paredes">${path(`M-29 0l8-${60 + nivel * 6}h42L33 0ZM-30-${60 + nivel * 6} 0-${85 + nivel * 6}l29 25Z`)}${path("M-9 0v-23q10-9 18 0V0m-25-42h12v12h-12m20-13h12v12H7")}</g><g class="vila-moinho-velas">${path("M0-59-39-99l-9 9 48 31 39 40 10-10ZM0-59l40-40 9 10L0-59l-39 40-10-10Z")}${path("M-38-92 40-26M-40-26 40-92")}</g>${nivel >= 2 ? `<g transform="translate(45 0) scale(.55)">${casa(42)}</g>` : ""}${nivel === 3 ? path("M-45 5v-20h10v20m16 0v-12h10V5m42-65v-35m0 0 22 5-22 6", "vila-acento") : ""}`;
    } else if (id === "torre_vigia" || id === "muralha") {
      const h = id === "torre_vigia" ? 67 + nivel * 12 : 45 + nivel * 7;
      desenho = `<g class="vila-paredes">${path(`M-34 0V-${h}h-7v-14h12v7h13v-7h12v7H9v-7h12v7h13v-7h10v14h-8V0Z`)}${path(`M-32-3v-${h - 4}h63v${h - 4}Z`, "vila-pedra")}${path(`M-9 0v-28q10-17 20 0V0M-17-${h - 15}v14m35-14v14`)}${nivel >= 2 ? path("M-36 0h-19v-31h12v8h9m70 23h19v-31H43v8h-9") : ""}${nivel === 3 ? path(`M0-${h + 14}v-30m0 0 28 7-28 7`, "vila-acento") : ""}</g>`;
    } else if (id === "cisterna_comunitaria") {
      desenho = `<g class="vila-paredes">${path("M-40-12q40-20 80 0v23q-40 22-80 0ZM-40-12q40 22 80 0M-36-31 0-62l36 31ZM-28-30v19m56-19v19M0-48v34m-4-3 8-2v10l-8 2Z")}${path("M-37 0h74m-57-10v19m21-20v28m19-26v25")}${nivel >= 2 ? path("M-58 12v-23h12v35m-12-9 12 3m-5-29 54-9") : ""}${nivel === 3 ? path("M-53 27 47 8m-88 14v12l78-11V11") : ""}</g>`;
    } else if (id === "praca_forca") {
      desenho = `<g class="vila-paredes">${path("M-51 6 19-7 55 9-16 25ZM-24 2v-79h57v8h-49v69M-17-55 8-71m24 0v31m0 0q-12 0-12 13 0 17 12 14 12-3 10-16-2-13-10-11M-45 10l65-13M-24 17 41 4")}${nivel >= 2 ? path("M-52-7h14v15m78-28h14v21M-49-7l92-13m-92 6 92-13") : ""}${nivel === 3 ? path("M-56 16h-13v-52h13m98 34h14v-52H42M-67-37l10-17 7 16m-8-11v-12m101 7 7-18 9 17m-9-10v-13") : ""}</g>`;
    } else {
      const altura = 35 + nivel * 10;
      desenho = casa(altura);
      if (id === "capela")
        desenho += `<g class="vila-paredes">${path(`M-13 0v-${altura + 44}l13-22 13 22V0M0-${altura + 66}v-18m-9 8h18M-9-49Q0-65 9-49v15H-9Z`)}${nivel >= 2 ? path("M-59 0v-35l18-16m82 0 18 16V0m-11-5v-19m-96 0v19") : ""}</g>`;
      if (id === "forja")
        desenho += `<g class="vila-paredes">${path(`M22-${altura}v-36h14v47m-18-47h22v-7H18Zm-53 80h-21l-7-7h37l-7 7v12m-14 0h21M33-90q-12-12 1-24m-4 3q18-6 6-18`, "vila-oficio")}</g>`;
      if (id === "mercado_coberto")
        desenho += `<g class="vila-paredes">${path("M-58-20h116L42-45h-85ZM-56-20q9 12 18 0 9 12 18 0 10 12 20 0 10 12 20 0 9 12 18 0 9 12 18 0M-52-20V9m104-29V9M-46-3h89v12h-89Z")}</g>`;
      if (id === "celeiro")
        desenho += path("M-22 0v-37h44V0Zm0-37L22 0m0-37L-22 0m-31 5-10-5v-19h13v19m94-13h12v17H44Z");
      if (id === "entreposto_comercial")
        desenho += path(
          "M-61 3v-22h17V3Zm5-24v-11h17v11M33 9l27-5-5-19-27 4ZM38 8a6 6 0 1 0 0 12 6 6 0 0 0 0-12m19-4a6 6 0 1 0 0 12 6 6 0 0 0 0-12",
        );
      if (id === "enfermaria_ervateira")
        desenho += path("M-54 8v-17m0 6-9-7m9 3 8-9M48 2v-13m0 7-7-5m7 3 9-8M-9-49H9m-9-9v18");
      if (nivel === 3)
        desenho += `<g transform="translate(-50 3) scale(.55)">${casa(39, 32)}</g>${path(`M37-${altura}v-21m0-1 19 5-19 7`, "vila-acento")}`;
    }
    const neve =
      estacao === "inverno"
        ? path(
            id === "ponte"
              ? "M-63-28 45-52m-88 60 103-32"
              : "M-41-57-7-78l10 4 17-10 23 20M-46 6q25-8 45-4m19 0 28-5",
            "vila-neve",
          )
        : "";
    const rachadura =
      dano === 1
        ? `<g class="vila-quebra" data-estado-visual="danificada">${path("M-39-59-11-51-20-37-7-24-18-4M24-18 14-36 23-43 17-59M-43 9l15-7 17 10-23 6Z")}</g>`
        : "";
    const especial = caminho
      ? path(
          caminho === "guarda"
            ? "M-19-55V-73l19-7 19 7v18Q0-31-19-55Z"
            : "M48 9v-17h18v17Zm-5-17h28m-18-4v-8h11v8",
          "vila-acento",
        )
      : "";
    return desenho + neve + rachadura + especial;
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
      e.preventDefault();
      selecionarObra(marco.dataset.mapaObra);
      if (window.matchMedia?.("(max-width: 900px)").matches)
        document.querySelector(".mapa-inspecao")?.scrollIntoView({
          block: "nearest",
          behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
    }
  });
  document.addEventListener("keydown", (e) => {
    const marco = e.target.closest?.("[data-mapa-obra]");
    if (marco && !e.repeat && ["Enter", " "].includes(e.key)) {
      e.preventDefault();
      selecionarObra(marco.dataset.mapaObra, true);
      document.querySelector(".mapa-inspecao")?.scrollIntoView({ block: "nearest" });
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
    const mapaAnterior = document.querySelector(".mapa-planta");
    const posicaoMapa = inventarioRun === run.id && mapaAnterior ? mapaAnterior.scrollLeft : 0;
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
    const mapaAtual = document.querySelector(".mapa-planta");
    if (mapaAtual) mapaAtual.scrollLeft = posicaoMapa;
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
    velocidadeSessao = valor;
    try {
      window.localStorage.setItem(chaveTexto, valor);
    } catch {
      /* A partida continua sem armazenamento. */
    }
    return valor;
  };
  J.sistemasUI = {
    companheiros,
    principal,
    atributoPrincipal,
    requisitos,
    regraEmpate,
    mapa,
    indisponiveis,
    escolhaIndisponivel,
    selecionarObra,
  };
})();
