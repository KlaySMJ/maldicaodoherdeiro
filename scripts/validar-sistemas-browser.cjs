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
  await avaliar("document.querySelector('[data-mapa-obra=celeiro]').click()");
  assert.equal(await avaliar("document.querySelectorAll('[data-obra-id]:not([hidden])').length"), 1);
  assert.equal(
    await avaliar("document.querySelector('[data-mapa-obra=celeiro]').getAttribute('aria-pressed')"),
    "true",
  );
  assert.equal(await avaliar("JSON.stringify(Jogo.save.lerRun())"), antesMapa);
  await avaliar("document.querySelector('[data-mapa-obra=moinho]').click()");
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
  assert.equal(await avaliar("document.querySelectorAll('.requisito-consulta').length"), 2);
  const alvo = await avaliar(
    "(() => {const e=document.querySelector('.requisito-consulta summary');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()",
  );
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: alvo.x, y: alvo.y });
  assert.equal(
    await avaliar("getComputedStyle(document.querySelector('.requisito-hover')).display"),
    "block",
  );
  await avaliar("document.querySelector('.requisito-consulta summary').click()");
  assert.equal(await avaliar("JSON.stringify(window.__consultaRun)"), antesConsulta);
  await avaliar("document.querySelector('.requisito-consulta summary').focus()");
  await cdp("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await cdp("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  assert.equal(await avaliar("JSON.stringify(window.__consultaRun)"), antesConsulta);
  await capturar("requisitos-desktop");
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  assert.equal(await avaliar("document.documentElement.scrollWidth <= innerWidth + 1"), true);
  const toque = await avaliar(
    "(() => {const d=document.querySelector('.requisito-consulta');d.open=false;const e=d.querySelector('summary');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()",
  );
  await cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: toque.x, y: toque.y }] });
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await aguardar("document.querySelector('.requisito-consulta').open");
  assert.equal(await avaliar("JSON.stringify(window.__consultaRun)"), antesConsulta);
  await capturar("requisitos-mobile");
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
  assert.equal(erros.length, 0, JSON.stringify(erros));
  const relatorio = {
    desktop: "1366x768",
    mobile: "390x844",
    ajudaAutomatica: true,
    persistenciaDaAjuda: true,
    focoRestaurado: true,
    escape: true,
    semRolagemOuConsumoDuranteAjuda: true,
    movimentoReduzido: true,
    mapa: {
      obras: 12,
      pagamentoUnico: true,
      diaPreservado: true,
      focoRestaurado: true,
      selecaoSemEfeito: true,
    },
    design: { etapasAjuda: 4, conquistas: true, buscaELimpeza: true, entradaMobile: "16px" },
    requisitos: { consultaSemEfeito: true, alternativas: 2, hover: true, teclado: true, toque: true },
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
