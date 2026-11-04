(function () {
  "use strict";
  const Jogo = window.Jogo;
  const app = document.getElementById("app");
  const nomes = { hp: "Vida", escudo: "Escudo", ataque: "Ataque", honra: "Honra", habitantes: "Habitantes", gold: "Gold" };
  const tipos = { encontro: "Um encontro", achado: "Um achado", mandatorio: "O inevitável", desordem: "Desordem na vila", batalha: "Uma batalha", mercador: "Um mercador", especial: "Um encontro especial" };
  const esc = valor => String(valor).replace(/[&<>"']/g, letra => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[letra]));
  const numero = valor => new Intl.NumberFormat("pt-BR").format(valor);
  const assinado = valor => `${valor > 0 ? "+" : ""}${numero(valor)}`;
  const retratos = {
    neutra: { imagem: "assets/herdeiro.svg", descricao: "O jovem herdeiro original, desenhado em traços brancos sobre preto" },
    alta: { imagem: "assets/herdeiro-honra-alta.svg", descricao: "O mesmo herdeiro com postura firme, manto cuidado, selo do povo e mão aberta" },
    baixa: { imagem: "assets/herdeiro-honra-baixa.svg", descricao: "O mesmo herdeiro com olhar duro, manto remendado e rasgado e a mão no punho da espada" }
  };
  let retratoExibido = null;
  let ajustePendente = 0;

  function ajustarTela() {
    window.cancelAnimationFrame(ajustePendente);
    ajustePendente = window.requestAnimationFrame(() => {
      const cronica = app.querySelector(".cronica");
      if (!cronica) return;
      cronica.style.removeProperty("--altura-cartas");
      cronica.style.removeProperty("--fator-texto");
      const mesa = cronica.querySelector(".mesa");
      const limite = app.getBoundingClientRect().bottom;
      const excesso = () => Math.max(0, mesa.getBoundingClientRect().bottom - limite);
      let altura = cronica.querySelector(".carta").getBoundingClientRect().height;
      // Primeiro reduz somente as artes, mantendo ambas iguais e em 3:4.
      for (let tentativa = 0; tentativa < 8 && excesso() > 1 && altura > 36; tentativa++) {
        altura = Math.max(36, altura - excesso() - 2);
        cronica.style.setProperty("--altura-cartas", `${altura}px`);
      }
      // Em telas muito baixas, compacta o texto sem esconder informações da decisão.
      for (const fator of [.96, .92, .88]) {
        if (excesso() <= 1) break;
        cronica.style.setProperty("--fator-texto", fator);
      }
    });
  }

  function mostrar(html, tela) {
    if (tela !== "jogo") retratoExibido = null;
    app.innerHTML = html;
    document.body.dataset.tela = tela;
    app.focus({ preventScroll: true });
    ajustarTela();
  }

  function menu(run) {
    mostrar(`
      <section class="abertura" aria-labelledby="titulo-inicio">
        <div class="abertura-arte"><img src="assets/vila.svg" alt="Uma vila medieval sob a vigília de um castelo" width="640" height="480"></div>
        <div class="abertura-texto">
          <h1 id="titulo-inicio">A maldição do Herdeiro</h1>
          <p class="subtitulo">A terra será sua.<br>As consequências, de todos.</p>
          <p>Um jovem senhor. Uma vila distante. A cada decisão, uma história que o próximo herdeiro talvez nunca conheça.</p>
          <div class="acoes-menu">
            <button class="botao primario" data-acao="iniciar">Iniciar <span aria-hidden="true">→</span></button>
            <button class="botao" data-acao="carregar" ${run ? "" : "disabled"}>Carregar${run ? ` <span>Rodada ${numero(run.rodada)}</span>` : ""}</button>
          </div>
          <p class="nota">${run ? "Há uma história esperando por você." : "Sua primeira história ainda não foi escrita."}</p>
        </div>
      </section>`, "inicio");
  }

  function intro() {
    mostrar(`<section class="intro" aria-label="O início da crônica">
      <p class="intro-texto">Você não saberá o que afetou,<br>porém o povo irá lembrar…</p>
      <button class="botao botao-intro" data-acao="entrar-no-jogo">Iniciar <span aria-hidden="true">→</span></button>
    </section>`, "intro");
  }

  function atributos(run) {
    const icones = {
      hp: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
      escudo: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/>',
      ataque: '<path d="m14 4 6-1-1 6-9 9-4-4Zm-9 9 6 6m-3-3-5 5"/>',
      honra: '<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>'
    };
    return `<dl class="atributos">${["hp", "escudo", "ataque", "honra"].map(id => `<div data-atributo="${id}" class="atributo ${id === "honra" ? `honra-${Jogo.estado.faixaHonra(run.atributos.honra)}` : ""}">
      <dt><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icones[id]}</svg>${nomes[id]}</dt><dd>${id === "honra" ? assinado(run.atributos[id]) : numero(run.atributos[id])}</dd>
    </div>`).join("")}</dl>`;
  }

  function alteracoes(resultado) {
    const mudancas = Object.entries(resultado.alteracoes).filter(([, valor]) => valor !== 0);
    return `<ul class="alteracoes" aria-label="Consequências da decisão">${mudancas.map(([id, valor]) => `<li><span>${nomes[id]}</span><strong>${assinado(valor)}</strong></li>`).join("") || "<li>Nenhum atributo foi alterado.</li>"}</ul>`;
  }

  function resultado(run) {
    const r = run.ultimoResultado;
    const economia = r.economia;
    const movimento = economia ? [
      economia.gasto ? `Compra: −${numero(economia.gasto)} gold.` : "",
      economia.renda > 0 ? `Renda da vila: +${numero(economia.variacaoRenda)} gold.`
        : economia.renda < 0 ? `Manutenção da vila: ${assinado(economia.variacaoRenda)} gold.` : "Sem renda nesta rodada."
    ].filter(Boolean).join(" ") : "";
    return `<div class="resultado" role="status">
      <h2>Assim foi feito.</h2>
      <p class="escolha-feita">“${esc(r.escolha)}”</p>
      ${r.combate ? `<p class="desfecho-combate">${r.combate.venceu ? "Vitória em batalha" : "Ataque malsucedido"} · ${numero(r.combate.dano)} de dano após o escudo</p>` : ""}
      <p>${esc(r.texto)}</p>${movimento ? `<p class="movimento-gold">${esc(movimento)}</p>` : ""}${alteracoes(r)}
      <button class="botao primario" data-acao="continuar">Continuar <span aria-hidden="true">→</span></button>
    </div>`;
  }

  function ofertas(evento, run) {
    if (!evento.mercadorias) return "";
    const itens = [
      ...evento.mercadorias,
      ...(Jogo.engine.ofertaMercador(run, evento) ? [Jogo.engine.ofertaMercador(run, evento)] : [])
    ];
    return `<div class="escolhas mercadorias" aria-label="Mercadorias à venda">${itens
      .filter(item => Jogo.engine.cumpre(item.requisitos, run, "escolha"))
      .map(item => `<button class="escolha mercadoria" data-mercadoria="${esc(item.id)}" ${Jogo.engine.podePagar(run, item) ? "" : 'disabled title="Gold insuficiente"'}><span>${esc(item.texto)}</span><span class="preco">${numero(Jogo.engine.precoMercadoria(run, item))} gold</span></button>`).join("")}</div>`;
  }

  function inventario(run) {
    const contagem = run.inventario.reduce((grupos, id) => {
      grupos[id] = (grupos[id] || 0) + 1;
      return grupos;
    }, {});
    const itens = Object.keys(contagem).map(id => ({ item: Jogo.itens.find(item => item.id === id), quantidade: contagem[id] }))
      .filter(entrada => entrada.item);
    const efeitos = run.efeitosPreparados || {};
    const preparados = [
      efeitos.bloquearDanoProximaBatalha ? "Amuleto: próximo dano de batalha anulado" : "",
      efeitos.bonusAtaqueProximaBatalha ? `Óleo: +${numero(efeitos.bonusAtaqueProximaBatalha)} Ataque na próxima batalha` : "",
      efeitos.bonusEscudoProximaBatalha ? `Elixir: +${numero(efeitos.bonusEscudoProximaBatalha)} Escudo na próxima batalha` : "",
      efeitos.bonusGoldProximaRecompensa ? `Moeda: +${numero(efeitos.bonusGoldProximaRecompensa)} gold na próxima recompensa` : ""
    ].filter(Boolean);
    if (!itens.length && !preparados.length) return "";
    return `<aside class="inventario" aria-label="Inventário"><h3>Itens</h3>
      ${itens.length ? `<ul>${itens.map(({ item, quantidade }) => `<li><span class="item-descricao"><strong>${esc(item.nome)}${quantidade > 1 ? ` ×${numero(quantidade)}` : ""}</strong><small>${esc(item.descricao)}</small></span><button class="botao usar-item" data-usar-item="${esc(item.id)}">Usar</button></li>`).join("")}</ul>` : ""}
      ${preparados.length ? `<p class="efeitos-preparados">${preparados.map(esc).join(" · ")}</p>` : ""}</aside>`;
  }

  function efeitoHonraOpcao(opcao, run) {
    if (opcao.definir?.honra !== undefined) return opcao.definir.honra - run.atributos.honra;
    return opcao.efeitos?.honra || 0;
  }

  function honraRevelada(opcao, evento, run) {
    if (run.rodada > run.honraReveladaAteRodada) return "";
    if (opcao.combate && evento.batalha) {
      const vitoria = evento.batalha.vitoria.efeitos?.honra || 0;
      const falha = (evento.batalha.derrota.efeitos?.honra || 0) + (evento.batalha.penalidadeFalha?.efeitos?.honra || 0);
      return `Honra na vitória ${assinado(vitoria)} · na falha ${assinado(falha)}`;
    }
    return `Honra ${assinado(efeitoHonraOpcao(opcao, run))}`;
  }

  function retrato(faixa, anterior) {
    const atual = retratos[faixa];
    return `<div class="retrato-area${anterior ? " troca-retrato" : ""}" data-honra="${faixa}">
      ${anterior ? `<img class="retrato retrato-anterior" src="${retratos[anterior].imagem}" width="360" height="480" alt="" aria-hidden="true">` : ""}
      <img class="retrato retrato-atual" src="${atual.imagem}" width="360" height="480" alt="${atual.descricao}">
    </div>`;
  }

  function animarRetrato() {
    const area = app.querySelector(".troca-retrato");
    if (!area) return;
    const atual = area.querySelector(".retrato-atual");
    const concluir = () => {
      area.querySelector(".retrato-anterior")?.remove();
      area.classList.remove("troca-retrato", "em-transicao");
    };
    // Troca imediata para quem prefere movimento reduzido.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { concluir(); return; }
    const iniciar = () => {
      if (area.isConnected) area.classList.add("em-transicao");
    };
    // A imagem anterior fica visível até a próxima estar carregada.
    if (atual.complete && atual.naturalWidth > 0) iniciar();
    else atual.addEventListener("load", iniciar, { once: true });
    atual.addEventListener("animationend", concluir, { once: true });
    atual.addEventListener("error", concluir, { once: true });
  }

  function jogo(run) {
    const evento = Jogo.eventos.find(evento => evento.id === run.eventoId);
    const faixa = Jogo.estado.faixaHonra(run.atributos.honra);
    const anterior = retratoExibido?.runId === run.id && retratoExibido.faixa !== faixa ? retratoExibido.faixa : null;
    const resolvido = run.fase === "resultado";
    const escolhas = Jogo.engine.opcoes(evento, run);
    mostrar(`
      <section class="cronica${resolvido ? " cronica--resultado" : ""}${evento.mercadorias ? " cronica--mercador" : ""}${!resolvido && escolhas.length > 3 ? " cronica--quatro-escolhas" : ""}" aria-labelledby="titulo-jogo">
        <div class="titulo-run"><div><h1 id="titulo-jogo">A sua crônica</h1><p>Rodada ${numero(run.rodada)} · ${tipos[evento.tipo] || "Um acontecimento"}</p></div>
          <dl class="recursos-vila" aria-label="Recursos da vila">
            <div class="recurso-contador vila-contador"><dt>Habitantes da vila</dt><dd>${numero(run.atributos.habitantes)}</dd></div>
            <div class="testes-honra"><dt>Testar honra</dt><dd>
              <button class="controle-honra" data-acao="honra-mais" aria-label="Ganhar 30 de honra para testes" title="Ganhar 30 de honra para testes">+30</button>
              <button class="controle-honra" data-acao="honra-menos" aria-label="Perder 30 de honra para testes" title="Perder 30 de honra para testes">−30</button>
            </dd></div>
            <div class="recurso-contador gold-contador" data-atributo="gold"><dt>Gold</dt><dd>${numero(run.atributos.gold)}</dd></div>
          </dl>
          <button class="botao discreto" data-acao="menu">Voltar ao início</button>
        </div>
        <div class="mesa">
          <div class="coluna-herdeiro">
            <article class="carta carta-herdeiro honra-${faixa}" aria-labelledby="titulo-herdeiro">
              ${retrato(faixa, anterior)}
            </article>
            <div class="herdeiro-detalhes">
              <div class="carta-titulo"><h2 id="titulo-herdeiro">O herdeiro</h2><span>Senhor destas terras</span></div>
              ${atributos(run)}
              <p class="carta-legenda">A coroa pesa antes de tocar a cabeça.</p>
            </div>
          </div>
          <section class="coluna-escolhas" aria-label="${resolvido ? "Resultado da sua decisão" : "Sua decisão"}">
            ${resolvido ? resultado(run) : `<h2>${evento.mercadorias ? "O mercador oferece" : "Qual é a sua palavra?"}</h2>${ofertas(evento, run)}<div class="escolhas">${escolhas.map(opcao => {
              const previaHonra = honraRevelada(opcao, evento, run);
              return `<button class="escolha" data-opcao="${esc(opcao.id)}"><span class="escolha-conteudo">${esc(opcao.texto)}${previaHonra ? `<small class="honra-revelada">${esc(previaHonra)}</small>` : ""}</span><span aria-hidden="true">→</span></button>`;
            }).join("")}</div>${evento.mercadorias ? "" : '<p class="nota">Uma escolha basta para mudar o destino.</p>'}`}
            ${inventario(run)}
          </section>
          <div class="coluna-evento">
            <article class="carta carta-evento" aria-labelledby="titulo-evento">
              <img class="imagem-evento" src="${esc(evento.imagem)}" width="640" height="480" alt="${esc(evento.imagemAlt)}">
            </article>
            <div class="evento-detalhes">
              <div class="evento-texto"><h2 id="titulo-evento">${esc(evento.titulo)}</h2><p>${esc(evento.texto)}</p></div>
              <aside class="informacoes" aria-label="Informações do evento"><p>${esc(evento.informacoes)}</p>
                ${evento.batalha ? `<p class="batalha-leitura">Enfrenta <strong>${numero(evento.batalha.defesa)} de defesa</strong>. Recebe <strong>${numero(evento.batalha.vitoria.dano)} de dano na vitória</strong> ou <strong>${numero(evento.batalha.derrota.dano)} na derrota</strong>, antes do escudo.</p>` : ""}
              </aside>
            </div>
          </div>
        </div>
      </section>`, "jogo");
    retratoExibido = { runId: run.id, faixa };
    animarRetrato();
  }

  function fim(run, legadoSalvo) {
    const venceu = run.fim.tipo === "vitoria";
    mostrar(`<section class="fim" aria-labelledby="titulo-fim">
      <img class="fim-selo" src="assets/selo.svg" width="72" height="84" alt="">
      <h1 id="titulo-fim">${venceu ? "Uma crônica cumprida." : "Um herdeiro se vai."}</h1>
      <p class="subtitulo">${esc(run.fim.motivo)}</p>
      ${run.ultimoResultado ? `<p class="fim-relato">${esc(run.ultimoResultado.texto)}</p>${alteracoes(run.ultimoResultado)}` : ""}
      <dl class="resumo-fim"><div><dt>Rodada alcançada</dt><dd>${numero(run.rodada)}</dd></div><div><dt>Habitantes restantes</dt><dd>${numero(run.atributos.habitantes)}</dd></div></dl>
      <p class="fim-memoria">Você não saberá o que afetou.<br>Porém o povo irá lembrar.</p>
      <div class="acoes-menu">${legadoSalvo ? `<button class="botao primario" data-acao="novo-herdeiro">Um novo herdeiro <span aria-hidden="true">→</span></button><button class="botao" data-acao="menu">Voltar ao início</button>` : `<p role="status">O encerramento ainda não pôde ser salvo. As conquistas ficam nesta sessão, mas podem se perder ao fechar a página.</p><button class="botao primario" data-acao="tentar-salvar">Tentar salvar novamente</button><button class="botao" data-acao="novo-herdeiro">Outro herdeiro sem salvar</button>`}</div>
    </section>`, "fim");
  }

  function confirmarNovaRun() {
    const dialogo = document.createElement("dialog");
    dialogo.className = "confirmacao";
    dialogo.setAttribute("aria-labelledby", "titulo-confirmacao");
    dialogo.innerHTML = `<h2 id="titulo-confirmacao">Começar outra história?</h2><p>Há uma run em andamento. Iniciar outro herdeiro substitui essa run. As conquistas dela só entram no legado quando ela termina.</p><form method="dialog"><button class="botao" value="cancelar" autofocus>Continuar minha história</button><button class="botao primario" value="iniciar">Iniciar outro herdeiro</button></form>`;
    document.body.append(dialogo);
    dialogo.addEventListener("click", evento => {
      if (evento.target === dialogo) dialogo.close("cancelar");
    });
    return new Promise(resolve => {
      dialogo.addEventListener("close", () => { resolve(dialogo.returnValue === "iniciar"); dialogo.remove(); }, { once: true });
      dialogo.showModal();
    });
  }

  window.addEventListener("jogo:aviso", evento => {
    const aviso = document.getElementById("aviso-save");
    aviso.textContent = evento.detail;
    aviso.hidden = false;
    ajustarTela();
  });

  window.addEventListener("resize", ajustarTela);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", ajustarTela);

  Jogo.ui = { menu, intro, jogo, fim, confirmarNovaRun };
})();
