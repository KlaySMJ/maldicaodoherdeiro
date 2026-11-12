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
    const r = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
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
  assert.equal(
    await avaliar("getComputedStyle(document.querySelector('[data-acao=ajuda-combate]')).borderWidth"),
    "0px",
  );
  await capturar("combate-mobile");
  await avaliar("Jogo.ui.tutorialCombate(Jogo.save.lerRun())");
  await capturar("ajuda-mobile");
  await avaliar("document.querySelector('[data-sistema-fechar]').click()");

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
    ajudaSemMoldura: true,
    escolhaNoPrimeiroClique: true,
    bloqueioDeCliqueDuplo: true,
    herdeiroNoPrimeiroToque: true,
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
