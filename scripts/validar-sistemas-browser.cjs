"use strict";
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const os = require("node:os");
const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");
const raiz = path.resolve(__dirname, "..");
const saida = path.join(raiz, ".taste-skill", "qa", "sistemas");
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "herdeiro-sistemas-"));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const tipos = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".wav": "audio/wav",
};
const servidor = http.createServer((req, res) => {
  const destino = path.resolve(raiz, `.${decodeURIComponent(new URL(req.url, "http://localhost").pathname)}`);
  if (!destino.startsWith(raiz + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(destino, (erro, conteudo) => {
    if (erro) res.writeHead(404).end();
    else {
      res.setHeader("Content-Type", tipos[path.extname(destino)] || "application/octet-stream");
      res.end(conteudo);
    }
  });
});
let browser, ws;
async function main() {
  fs.mkdirSync(saida, { recursive: true });
  await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
  browser = spawn(
    process.env.SISTEMAS_BROWSER || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--no-sandbox",
      "--remote-debugging-port=0",
      `--user-data-dir=${perfil}`,
      "about:blank",
    ],
    { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] },
  );
  let stderr = "";
  browser.stderr.on("data", (d) => {
    stderr = (stderr + d).slice(-6000);
  });
  browser.on("error", (e) => {
    stderr += e.message;
  });
  const arquivoPorta = path.join(perfil, "DevToolsActivePort");
  for (let n = 0; n < 80 && !fs.existsSync(arquivoPorta) && browser.exitCode === null; n++)
    await esperar(250);
  if (!fs.existsSync(arquivoPorta)) throw Error(`Edge não abriu CDP: ${stderr}`);
  const porta = fs.readFileSync(arquivoPorta, "utf8").split("\n")[0];
  const paginas = await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json();
  ws = new WebSocket(paginas.find((p) => p.type === "page").webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.onopen = r;
    ws.onerror = j;
  });
  const pendentes = new Map(),
    erros = [];
  let sequencia = 0;
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id) {
      const p = pendentes.get(m.id);
      if (p) {
        pendentes.delete(m.id);
        clearTimeout(p.timer);
        if (m.error) p.j(Error(JSON.stringify(m.error)));
        else p.r(m.result);
      }
    } else if (m.method === "Runtime.exceptionThrown") erros.push(m.params.exceptionDetails);
  };
  const cdp = (method, params = {}) =>
    new Promise((r, j) => {
      const id = ++sequencia;
      const timer = setTimeout(() => {
        pendentes.delete(id);
        j(Error(`CDP expirou: ${method}`));
      }, 12000);
      pendentes.set(id, { r, j, timer });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const avaliar = async (expression) => {
    const r = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const aguardar = async (expression) => {
    for (let n = 0; n < 60; n++) {
      if (await avaliar(expression)) return;
      await esperar(100);
    }
    throw Error(`Espera esgotada: ${expression}`);
  };
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp("Page.navigate", { url: `http://127.0.0.1:${servidor.address().port}/index.html` });
  await aguardar("!!window.Jogo?.ui?.tutorialCombate");
  await avaliar(
    `(() => {const J=window.Jogo; localStorage.setItem('herdeiro_tutorial_v1','concluido'); const r=J.estado.novo(J.legado.vazio(),'corajoso'); r.debugTracoInimigo='nenhum'; J.engine.registrarSorteio(r,J.eventoPorId('saqueadores')); J.engine.escolher(r,'combater'); J.save.gravarRun(r); return true;})()`,
  );
  await cdp("Page.reload");
  await aguardar("!!window.Jogo?.ui?.tutorialCombate && !!document.querySelector('[data-acao=carregar]')");
  await avaliar("document.querySelector('[data-acao=carregar]').click()");
  await aguardar("!!document.querySelector('dialog[open]')");
  const antes = await avaliar("JSON.stringify(Jogo.save.lerRun())");
  await avaliar(
    "document.querySelector('[data-ajuda-proxima]').click(); document.querySelector('[data-sistema-fechar]').click()",
  );
  assert.equal(await avaliar("JSON.stringify(Jogo.save.lerRun())"), antes);
  assert.equal(await avaliar("localStorage.getItem('tutorial_combate_concluido')"), "sim");
  assert.equal(await avaliar("document.activeElement.dataset.acao"), "combate-rolar");
  await avaliar(
    "document.querySelector('[data-acao=ajuda-combate]').focus(); document.querySelector('[data-acao=ajuda-combate]').click()",
  );
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
  assert.equal(await avaliar("!!document.querySelector('dialog[open]')"), false);
  assert.equal(await avaliar("document.activeElement.dataset.acao"), "ajuda-combate");
  const capturar = async (nome) => {
    await esperar(300);
    const r = await cdp("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: !/^(conquista|ajuda)/.test(nome),
    });
    fs.writeFileSync(path.join(saida, `${nome}.png`), Buffer.from(r.data, "base64"));
  };
  await capturar("combate-desktop");
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await cdp("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await avaliar("Jogo.ui.jogo(Jogo.save.lerRun(),{textoCompleto:true})");
  assert.equal(await avaliar("document.documentElement.scrollWidth <= innerWidth + 1"), true);
  await capturar("combate-mobile");
  await avaliar("Jogo.ui.tutorialCombate(Jogo.save.lerRun())");
  await capturar("ajuda-mobile");
  for (let etapa = 2; etapa <= 4; etapa++) {
    await avaliar("document.querySelector('[data-ajuda-proxima]').click()");
    assert.equal(await avaliar("document.querySelectorAll('.ajuda-etapas [aria-current=step]').length"), 1);
    assert.equal(
      await avaliar(
        "document.querySelector('dialog').scrollWidth <= document.querySelector('dialog').clientWidth + 1",
      ),
      true,
    );
    await capturar(`ajuda-mobile-${etapa}`);
  }
  await avaliar("document.querySelector('[data-sistema-fechar]').click()");
  await avaliar(`(() => {
    const J = window.Jogo, r = J.estado.novo(J.legado.vazio(), 'corajoso');
    r.construcoes = ['moinho', 'ponte', 'muralha']; r.atributos.gold = 20;
    J.engine.registrarSorteio(r, J.eventoPorId('colheita'));
    J.sistemas.vila(r); r.rodada = 7;
    return J.save.gravarRun(r);
  })()`);
  await cdp("Page.reload");
  await aguardar("!!document.querySelector('[data-acao=carregar]')");
  await avaliar("document.querySelector('[data-acao=carregar]').click()");
  await avaliar(
    "Jogo.ui.completarTextoEvento(); document.querySelector('[data-acao=alternar-construcoes]').click()",
  );
  await aguardar("!!document.querySelector('.mapa-vila')");
  assert.equal(await avaliar("document.querySelectorAll('[data-obra-id]').length"), 12);
  await avaliar(
    "document.querySelector('[data-obra-id=moinho]').open = true; document.querySelector('[data-obra=moinho][data-trabalho=melhorar]').click()",
  );
  assert.equal(await avaliar("Jogo.save.lerRun().vila.obras.moinho.nivel"), 2);
  assert.equal(await avaliar("Jogo.save.lerRun().atributos.gold"), 14);
  assert.equal(await avaliar("Jogo.save.lerRun().rodada"), 7);
  assert.equal(
    await avaliar("document.activeElement.tagName"),
    "SUMMARY",
    JSON.stringify(
      await avaliar(
        "({classe:document.querySelector('.cronica').className, painel:getComputedStyle(document.querySelector('#painel-construcoes')).display, detalhe:document.querySelector('[data-obra-id=moinho]').open})",
      ),
    ),
  );
  assert.equal(await avaliar("document.documentElement.scrollWidth <= innerWidth + 1"), true);
  const antesMapa = await avaliar("JSON.stringify(Jogo.save.lerRun())");
  await avaliar(
    "document.querySelector('[data-mapa-obra=celeiro]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))",
  );
  assert.equal(await avaliar("document.querySelectorAll('[data-obra-id]:not([hidden])').length"), 1);
  assert.equal(
    await avaliar("document.querySelector('[data-mapa-obra=celeiro]').getAttribute('aria-pressed')"),
    "true",
  );
  assert.equal(await avaliar("JSON.stringify(Jogo.save.lerRun())"), antesMapa);
  await avaliar(
    "document.querySelector('[data-mapa-obra=moinho]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))",
  );
  await capturar("mapa-mobile");
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
  assert.equal(await avaliar("document.activeElement.dataset.acao"), "alternar-construcoes");
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await avaliar("document.querySelector('[data-acao=alternar-construcoes]').click()");
  await capturar("mapa-desktop");
  await avaliar(`(() => {
    const J=window.Jogo, r=J.save.lerRun(); r.construcoesAbertas=false; r.atributos.gold=0;
    J.engine.registrarSorteio(r,J.eventoPorId('moinho_especializacao'));
    J.ui.jogo(r,{textoCompleto:true}); window.__consultaRun=r; return true;
  })()`);
  const antesConsulta = await avaliar("JSON.stringify(window.__consultaRun)");
  assert.equal(await avaliar("document.querySelectorAll('.escolha-desabilitada').length"), 2);
  await avaliar("document.querySelector('.requisito-consulta > summary').click()");
  assert.equal(await avaliar("document.querySelector('.requisito-consulta').open"), true);
  assert.equal(await avaliar("JSON.stringify(window.__consultaRun)"), antesConsulta);
  await capturar("requisitos-desktop");
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  assert.equal(await avaliar("document.documentElement.scrollWidth <= innerWidth + 1"), true);
  assert.equal(
    await avaliar(
      "[...document.querySelectorAll('.escolha-desabilitada')].every(e=>e.tagName==='DETAILS' && e.textContent.includes('Faltam 3 Gold') && !e.querySelector('[data-opcao]'))",
    ),
    true,
  );
  await capturar("requisitos-mobile");
  await avaliar(
    "document.querySelector('.requisito-consulta').open=false; document.querySelector('.requisito-consulta > summary').focus()",
  );
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r" });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter" });
  assert.equal(await avaliar("document.querySelector('.requisito-consulta').open"), true);
  assert.equal(await avaliar("JSON.stringify(window.__consultaRun)"), antesConsulta);
  await avaliar("document.querySelector('.requisito-consulta').open=false");
  const pontoConsulta = await avaliar(
    "(() => {const e=document.querySelector('.requisito-consulta > summary'); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()",
  );
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", ...pontoConsulta });
  assert.equal(
    await avaliar("getComputedStyle(document.querySelector('.requisito-hover')).display"),
    "block",
  );
  await cdp("Emulation.setTouchEmulationEnabled", { enabled: true });
  await cdp("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...pontoConsulta, radiusX: 1, radiusY: 1, force: 1 }],
  });
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await aguardar("document.querySelector('.requisito-consulta').open");
  assert.equal(await avaliar("JSON.stringify(window.__consultaRun)"), antesConsulta);
  await cdp("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await avaliar(`(() => {
    const J=window.Jogo, legado=J.legado.vazio();
    legado.conquistasDesbloqueadas=J.conquistas.lista.slice(0,8).map(c=>c.id);
    J.ui.painelLegado(legado); return true;
  })()`);
  await capturar("conquistas-desktop");
  const conquistasTotal = await avaliar("document.querySelectorAll('[data-conquista-item]').length");
  await avaliar(
    "(() => {const b=document.querySelector('[data-busca-conquistas]'); b.value=Jogo.conquistas.lista[0].nome; b.dispatchEvent(new Event('input',{bubbles:true}));})()",
  );
  const filtradas = await avaliar("document.querySelectorAll('[data-conquista-item]:not([hidden])').length");
  assert.ok(filtradas > 0 && filtradas < conquistasTotal);
  await avaliar("document.querySelector('[data-limpar-conquistas]').click()");
  assert.equal(
    await avaliar("document.querySelectorAll('[data-conquista-item]:not([hidden])').length"),
    conquistasTotal,
  );
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  assert.equal(await avaliar("document.documentElement.scrollWidth <= innerWidth + 1"), true);
  await capturar("conquistas-mobile");
  assert.equal(
    await avaliar("getComputedStyle(document.querySelector('[data-busca-conquistas]')).fontSize"),
    "16px",
  );
  await avaliar("if (!Jogo.ui.modoDebug()) Jogo.ui.alternarDebug(); Jogo.ui.preverConquista()");
  await aguardar("!!document.querySelector('.conquista-aviso')");
  await capturar("conquista-aviso-mobile");
  {
    // Exercita gestos reais no controlador combinado, incluindo a proteção contra clique duplo.
    await avaliar(`(() => {
    const J = window.Jogo;
    const r = J.estado.novo(J.legado.vazio(), 'corajoso');
    r.atributos.gold = 0;
    J.engine.registrarSorteio(r, J.eventoPorId('moinho_parado'));
    J.save.gravarRun(r);
    return true;
  })()`);
    await cdp("Page.reload");
    await aguardar("!!document.querySelector('[data-acao=carregar]')");
    await avaliar("document.querySelector('[data-acao=carregar]').click()");
    const clicar = async (seletor, clickCount = 1) => {
      const ponto = await avaliar(`(() => {
      const elemento = document.querySelector(${JSON.stringify(seletor)});
      elemento.scrollIntoView({block:'center'});
      const r = elemento.getBoundingClientRect();
      return {x:r.x+r.width/2,y:r.y+r.height/2};
    })()`);
      for (const type of ["mousePressed", "mouseReleased"])
        await cdp("Input.dispatchMouseEvent", { type, ...ponto, button: "left", clickCount });
    };
    await clicar('[data-opcao="canal"]');
    assert.equal(await avaliar("Jogo.save.lerRun().fase"), "resultado");
    const aposEscolha = await avaliar("JSON.stringify(Jogo.save.lerRun())");
    await clicar('[data-acao="continuar"]', 2);
    assert.equal(await avaliar("JSON.stringify(Jogo.save.lerRun())"), aposEscolha);
    await avaliar("Jogo.ui.escolherHerdeiro(Jogo.legado.vazio())");
    await esperar(220);
    await cdp("Emulation.setTouchEmulationEnabled", { enabled: true });
    const toque = await avaliar(`(() => {
    const elemento = document.querySelector('[data-traco="corajoso"]');
    elemento.scrollIntoView({block:'center'});
    const r = elemento.getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2};
  })()`);
    await cdp("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...toque, radiusX: 1, radiusY: 1, force: 1 }],
    });
    await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await aguardar("document.body.dataset.tela === 'intro'");
  }
  await cdp("Emulation.setTouchEmulationEnabled", { enabled: false });
  const conferirCena = async (width, estacao, nivel) => {
    await cdp("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width === 390,
    });
    await avaliar(`(() => {
      const J=window.Jogo,r=J.estado.novo(J.legado.vazio(),'corajoso');
      r.rodada=20;r.estacao=${JSON.stringify(estacao)};r.construcoes=Object.keys(J.sistemas.obras);J.sistemas.vila(r);
      for(const o of Object.values(r.vila.obras)){o.nivel=${nivel};}
      if(${nivel}===3){r.vila.obras.ponte.caminho='guarda';r.sistemas.especializacao='comercial';r.vila.obras.moinho.caminho='comercial';}
      r.vila.obras.forja.dano=1;r.vila.obras.celeiro.dano=2;r.vila.marcas=[{tipo:'festa',fim:25},{tipo:'destrocos',fim:25}];
      J.engine.registrarSorteio(r,J.eventoPorId('colheita'));r.construcoesAbertas=true;window.__mapaRun=r;
      J.ui.jogo(r,{textoCompleto:true});return true;
    })()`);
    assert.equal(await avaliar("document.querySelectorAll('[data-mapa-obra]').length"), 12);
    assert.equal(
      await avaliar("document.querySelectorAll('.mapa-obras,.mapa-relato,.mapa-legenda').length"),
      0,
    );
    assert.equal(await avaliar("document.querySelectorAll('[data-marca-visual]').length"), 2);
    assert.equal(await avaliar("document.documentElement.scrollWidth<=innerWidth+1"), true);
    const snapshot = await avaliar("JSON.stringify(window.__mapaRun)");
    await avaliar("document.querySelector('[data-mapa-obra=capela]').focus()");
    await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r" });
    await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter" });
    assert.equal(await avaliar("document.querySelector('[data-obra-id=capela]').open"), true);
    assert.equal(await avaliar("JSON.stringify(window.__mapaRun)"), snapshot);
    await avaliar(
      "document.querySelector('[data-mapa-obra=capela]').scrollIntoView({block:'nearest',inline:'center'})",
    );
    await capturar(`vila-${width}-${estacao}-nivel-${nivel}`);
  };
  await conferirCena(1440, "primavera", 1);
  await conferirCena(1440, "inverno", 3);
  await conferirCena(768, "outono", 3);
  await conferirCena(390, "verao", 2);
  await avaliar(
    "document.querySelector('[data-mapa-obra=moinho]').scrollIntoView({block:'nearest',inline:'center'})",
  );
  await cdp("Emulation.setTouchEmulationEnabled", { enabled: true });
  const casaToque = await avaliar(
    "(() => {const e=document.querySelector('[data-mapa-obra=moinho] .vila-alvo');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()",
  );
  await cdp("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...casaToque, radiusX: 1, radiusY: 1, force: 1 }],
  });
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await aguardar("document.querySelector('[data-obra-id=moinho]').open");
  await capturar("vila-mobile-final");
  await cdp("Emulation.setTouchEmulationEnabled", { enabled: false });
  // Largura CSS correspondente a 1440 px com ampliação de 150%.
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 960,
    height: 600,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  assert.equal(await avaliar("document.documentElement.scrollWidth<=innerWidth+1"), true);
  await capturar("vila-zoom-150");
  assert.equal(await avaliar("getComputedStyle(document.body,'::before').animationName"), "none");
  assert.equal(await avaliar("getComputedStyle(document.body,'::after').animationName"), "none");
  const fluxos = await avaliar(`(() => {
    const J=window.Jogo,r=J.estado.novo(J.legado.vazio(),'corajoso');
    r.flags.bardo_cantou=true;r.rodada=10;J.engine.registrarSorteio(r,J.eventoPorId('colheita'));J.sistemas.atualizar(r);J.save.gravarRun(r);
    const fila=J.save.lerRun();fila.rodada=22;
    const continua=J.sistemas.filtrar(fila,[J.eventoPorId('cancao_que_corre'),J.eventoPorId('colheita')])[0].id==='cancao_que_corre';
    J.engine.registrarSorteio(r,J.eventoPorId('mercador'));const oferta=J.engine.ofertaMercador(r,J.eventoPorId('mercador'));
    J.save.gravarRun(r);const recarga=J.save.lerRun();const mesmaOferta=oferta.id===J.engine.ofertaMercador(recarga,J.eventoPorId('mercador')).id;
    r.construcoes.push('moinho');r.atributos.gold=20;J.engine.registrarSorteio(r,J.eventoPorId('moinho_especializacao'));
    const especializou=J.engine.escolher(r,'comercial');J.save.gravarRun(r);
    const escolhaMantida=J.save.lerRun().sistemas.especializacao==='comercial';
    const animal=J.estado.novo(J.legado.vazio(),'corajoso');J.engine.concederItem(animal,'cao_companheiro');
    J.engine.registrarSorteio(animal,J.eventoPorId('vinculo_cao_companheiro'));
    const escolha=J.engine.opcoes(J.eventoPorId(animal.eventoId),animal).find(o=>o.sistemaVinculo);
    J.engine.escolher(animal,escolha.id);J.save.gravarRun(animal);
    const vinculo=J.save.lerRun().sistemas.vinculos.cao_companheiro==='ativo';
    return {fila:continua,oferta:mesmaOferta,especializacao:especializou&&escolhaMantida,vinculo};
  })()`);
  assert.ok(Object.values(fluxos).every(Boolean), JSON.stringify(fluxos));
  await avaliar("Jogo.ui.detalhesAtributo(window.__mapaRun,'ataque')");
  assert.ok(await avaliar("document.querySelector('dialog').textContent.includes('Permanente acumulado')"));
  await avaliar("document.querySelector('[data-sistema-fechar]').click()");
  // Extremos reais do catálogo: a página pode rolar verticalmente, mas não deve cortar escolhas.
  for (const longo of [false, true]) {
    await avaliar(`(() => {const J=window.Jogo;const r=J.estado.novo(J.legado.vazio(),'corajoso');
      const es=J.eventos.filter(e=>!e.bossId&&!e.especial&&!e.batalha&&e.texto&&e.opcoes?.length).sort((a,b)=>a.texto.length-b.texto.length);
      J.engine.registrarSorteio(r,${longo} ? es.at(-1):es[0]);J.ui.jogo(r,{textoCompleto:true});return true;})()`);
    assert.equal(await avaliar("document.documentElement.scrollWidth<=innerWidth+1"), true);
    await capturar(longo ? "carta-longa-zoom" : "carta-curta-zoom");
  }
  // Textos longos precisam caber na escolha, incluindo o espaço reservado ao preço.
  let cenariosRespostas = 0;
  for (const width of [1440, 1024, 768, 390, 320]) {
    await cdp("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width <= 390,
    });
    for (const id of ["a_viuva_do_moleiro", "celeiro_comunitario", "mercador"]) {
      const fora = await avaliar(`(() => {
        const J=window.Jogo,r=J.estado.novo(J.legado.vazio(),'corajoso');r.rodada=80;r.atributos.gold=100;r.atributos.habitantes=60;
        J.engine.registrarSorteio(r,J.eventoPorId(${JSON.stringify(id)}));J.ui.jogo(r,{textoCompleto:true});
        const fora=[];
        for(const e of document.querySelectorAll('button.escolha,.requisito-consulta > summary')) {
          const b=e.getBoundingClientRect();if(!b.width||!b.height)continue;
          const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
          while(walker.nextNode()) {
            const n=walker.currentNode;if(!n.textContent.trim()||n.parentElement.closest('.requisito-hover'))continue;
            const range=document.createRange();range.selectNodeContents(n);
            if([...range.getClientRects()].some(t=>t.width&&t.height&&(t.left<b.left-1||t.right>b.right+1||t.top<b.top-1||t.bottom>b.bottom+1)))fora.push(n.textContent.trim());
          }
        }
        return fora;
      })()`);
      assert.deepEqual(fora, [], JSON.stringify({ width, evento: id, textos: fora }));
      cenariosRespostas++;
    }
  }
  const chefe = await avaliar(`(() => {
    const J=window.Jogo,r=J.estado.novo(J.legado.vazio(),'corajoso');r.debugTracoInimigo='nenhum';r.atributos.ataque=100;
    const e=J.eventoPorId('embate_barao');J.engine.registrarSorteio(r,e);J.engine.escolher(r,e.opcoes.find(o=>o.combate).id);
    for(let i=0;i<4;i++){J.engine.rolarCombate(r);r.combatePendente.dadosHerdeiro.fill(20);r.combatePendente.dadosInimigo.fill(1);J.engine.continuarCombate(r);}
    J.engine.continuarCombate(r);window.__fimRun=r;J.ui.fim(r,true);return r.fim.tipo;
  })()`);
  assert.equal(chefe, "vitoria_barao");
  assert.ok(
    await avaliar("document.querySelector('.fim-recompensa').textContent.includes('Estandarte do Barão')"),
  );
  await capturar("fim-barao-trofeu");
  await avaliar("Jogo.ui.fim(window.__fimRun,false)");
  assert.ok(
    await avaliar("document.querySelector('.fim-recompensa').textContent.includes('Ao salvar o legado')"),
  );
  const encerramentos = await avaliar(`(() => {
    const rotas=['vitoria','vitoria_culto','vitoria_honra','vitoria_abissal','derrota'];
    return rotas.every(tipo=>{const r=JSON.parse(JSON.stringify(window.__fimRun));r.fim.tipo=tipo;Jogo.ui.fim(r,true);return document.querySelector('.fim').classList.contains('fim--'+tipo)&&!!document.querySelector('.fim-salvo');});
  })()`);
  assert.equal(encerramentos, true);
  assert.equal(erros.length, 0, JSON.stringify(erros));
  const relatorio = {
    data: "2026-11-12",
    base: "2f39e3c",
    incluiAlteracoesLocais: true,
    desktop: "1366x768",
    mobile: "390x844",
    ajudaAutomatica: true,
    persistenciaDaAjuda: true,
    focoRestaurado: true,
    escape: true,
    semRolagemOuConsumoDuranteAjuda: true,
    movimentoReduzido: true,
    escolhaNoPrimeiroClique: true,
    bloqueioDeCliqueDuplo: true,
    herdeiroNoPrimeiroToque: true,
    mapa: {
      obras: 12,
      pagamentoUnico: true,
      diaPreservado: true,
      focoRestaurado: true,
      selecaoSemEfeito: true,
      cenarios: ["1440 primavera nível 1", "1440 inverno nível 3", "768 outono nível 3", "390 verão nível 2"],
      tecladoEToque: true,
      listaERodapeRemovidos: true,
      zoomEquivalente150: true,
    },
    fluxos,
    respostas: { cenarios: cenariosRespostas, textoDentroDaEscolha: true },
    chefe: { vitoriaBarao: true, trofeu: true, estadoDoSalvamento: true, rotasRenderizadas: 5 },
    design: { etapasAjuda: 4, conquistas: true, buscaELimpeza: true, entradaMobile: "16px" },
    requisitos: {
      consultaSemEfeito: true,
      alternativas: 2,
      motivosVisiveis: true,
      clique: true,
      hover: true,
      teclado: true,
      toque: true,
    },
    erros: [],
  };
  fs.writeFileSync(path.join(saida, "relatorio.json"), JSON.stringify(relatorio, null, 2));
  console.log(JSON.stringify(relatorio));
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => {
    ws?.close();
    browser?.kill();
    servidor.close();
  });
