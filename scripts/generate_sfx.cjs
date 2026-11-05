"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const edgeCandidates = [
  path.join(process.env["PROGRAMFILES(X86)"] || "C:/Program Files (x86)", "Microsoft/Edge/Application/msedge.exe"),
  path.join(process.env.ProgramFiles || "C:/Program Files", "Microsoft/Edge/Application/msedge.exe"),
];
const edge = edgeCandidates.find((candidate) => fs.existsSync(candidate));
if (!edge) throw new Error("Microsoft Edge não foi encontrado para gravar os efeitos Opus.");

const page = `<!doctype html><meta charset="utf-8"><body><script>
document.body.textContent = "starting";
const outputs = {};
function note(context, destination, frequency, start, duration, volume, type = "sine") {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.01);
}
async function encode(name, duration, play) {
  const context = new AudioContext({ sampleRate: 48000 });
  await context.resume();
  document.body.textContent = "resumed:" + name;
  const destination = context.createMediaStreamDestination();
  const recorder = new MediaRecorder(destination.stream, { mimeType: "audio/webm;codecs=opus" });
  const chunks = [];
  recorder.addEventListener("dataavailable", (event) => { if (event.data.size) chunks.push(event.data); });
  const stopped = new Promise((resolve) => recorder.addEventListener("stop", resolve, { once: true }));
  recorder.start();
  play(context, destination, context.currentTime + 0.04);
  setTimeout(() => recorder.stop(), duration * 1000 + 140);
  await stopped;
  const blob = new Blob(chunks, { type: "audio/webm;codecs=opus" });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  outputs[name] = btoa(binary);
  await context.close();
}
(async () => {
  await encode("choice", 0.23, (context, destination, start) => {
    note(context, destination, 420, start, 0.20, 0.16, "triangle");
    note(context, destination, 630, start + 0.015, 0.16, 0.08);
  });
  await encode("honor", 0.86, (context, destination, start) => {
    note(context, destination, 523.25, start, 0.38, 0.15, "triangle");
    note(context, destination, 659.25, start + 0.16, 0.42, 0.13, "triangle");
    note(context, destination, 783.99, start + 0.34, 0.46, 0.09, "sine");
  });
  document.body.innerHTML = '<pre id="choice">' + outputs.choice + '</pre><pre id="honor">' + outputs.honor + '</pre>';
})().catch((error) => { document.body.textContent = 'GENERATION_ERROR:' + String(error); });
</script></body>`;

function vint(buffer, offset, id = false) {
  const first = buffer[offset];
  let mask = 0x80;
  let length = 1;
  while (length <= 8 && !(first & mask)) {
    mask >>= 1;
    length += 1;
  }
  if (length > 8 || offset + length > buffer.length)
    throw new Error(`VINT EBML inválido no deslocamento ${offset}/${buffer.length}: ${buffer[offset]}`);
  let value = id ? first : first & (mask - 1);
  for (let index = 1; index < length; index += 1) value = value * 256 + buffer[offset + index];
  const unknown = !id && value === 2 ** (7 * length) - 1;
  return { value, length, unknown };
}

function elements(buffer, inicio, fim) {
  const lista = [];
  let offset = inicio;
  while (offset < fim) {
    const id = vint(buffer, offset, true);
    const tamanho = vint(buffer, offset + id.length);
    const conteudo = offset + id.length + tamanho.length;
    const fimElemento = tamanho.unknown ? fim : Math.min(fim, conteudo + tamanho.value);
    if (fimElemento < conteudo) throw new Error("Elemento EBML truncado.");
    lista.push({ id: id.value, inicio: conteudo, fim: fimElemento });
    offset = fimElemento;
  }
  return lista;
}

function inteiro(buffer, inicio, fim, assinado = false) {
  let valor = 0;
  for (let index = inicio; index < fim; index += 1) valor = valor * 256 + buffer[index];
  if (assinado && buffer[inicio] & 0x80) valor -= 2 ** ((fim - inicio) * 8);
  return valor;
}

function quadrosDeBloco(bloco) {
  const trilha = vint(bloco, 0);
  const flags = bloco[trilha.length + 2];
  const modoLacing = (flags >> 1) & 3;
  const inicio = trilha.length + 3;
  if (modoLacing === 0) return [bloco.subarray(inicio)];
  const quantidade = bloco[inicio] + 1;
  let cursor = inicio + 1;
  const tamanhos = [];
  if (modoLacing === 1) {
    for (let indice = 0; indice < quantidade - 1; indice += 1) {
      let tamanho = 0;
      while (bloco[cursor] === 255) {
        tamanho += 255;
        cursor += 1;
      }
      tamanho += bloco[cursor++];
      tamanhos.push(tamanho);
    }
  } else if (modoLacing === 2) {
    const tamanho = (bloco.length - cursor) / quantidade;
    return Array.from({ length: quantidade }, (_, indice) => bloco.subarray(cursor + indice * tamanho, cursor + (indice + 1) * tamanho));
  } else {
    const primeiro = vint(bloco, cursor);
    cursor += primeiro.length;
    tamanhos.push(primeiro.value);
    let anterior = primeiro.value;
    for (let indice = 1; indice < quantidade - 1; indice += 1) {
      const delta = vint(bloco, cursor);
      cursor += delta.length;
      const deslocamento = delta.value - (2 ** (7 * delta.length - 1) - 1);
      anterior += deslocamento;
      tamanhos.push(anterior);
    }
  }
  const totalQuadros = tamanhos.reduce((soma, tamanho) => soma + tamanho, 0);
  tamanhos.push(bloco.length - cursor - totalQuadros);
  const quadros = [];
  for (const tamanho of tamanhos) {
    quadros.push(bloco.subarray(cursor, cursor + tamanho));
    cursor += tamanho;
  }
  return quadros;
}

function opusStream(webm) {
  const raiz = elements(webm, 0, webm.length);
  const segmento = raiz.find((elemento) => elemento.id === 0x18538067);
  if (!segmento) throw new Error("O gravador não retornou um segmento WebM.");
  const elementosSegmento = elements(webm, segmento.inicio, segmento.fim);
  const trilhas = elementosSegmento.find((elemento) => elemento.id === 0x1654ae6b);
  if (!trilhas) throw new Error("O fluxo WebM não contém trilhas.");
  const entrada = elements(webm, trilhas.inicio, trilhas.fim).find((elemento) => elemento.id === 0xae);
  if (!entrada) throw new Error("A trilha Opus não foi encontrada.");
  const campos = elements(webm, entrada.inicio, entrada.fim);
  const numeroTrilha = inteiro(webm, campos.find((elemento) => elemento.id === 0xd7).inicio, campos.find((elemento) => elemento.id === 0xd7).fim);
  const codec = campos.find((elemento) => elemento.id === 0x86);
  const identificacao = campos.find((elemento) => elemento.id === 0x63a2);
  if (!codec || webm.toString("ascii", codec.inicio, codec.fim) !== "A_OPUS" || !identificacao)
    throw new Error("A trilha gravada não contém Opus compatível.");
  const opusHead = webm.subarray(identificacao.inicio, identificacao.fim);
  if (opusHead.toString("ascii", 0, 8) !== "OpusHead") throw new Error("O cabeçalho Opus está inválido.");
  const pacotes = [];
  for (const elemento of elementosSegmento.filter((item) => item.id === 0x1f43b675)) {
    for (const filho of elements(webm, elemento.inicio, elemento.fim)) {
      if (filho.id !== 0xa3) continue;
      const bloco = webm.subarray(filho.inicio, filho.fim);
      if (vint(bloco, 0).value !== numeroTrilha) continue;
      pacotes.push(...quadrosDeBloco(bloco));
    }
  }
  if (!pacotes.length) throw new Error("O gravador não produziu quadros de áudio Opus.");
  return { opusHead, pacotes };
}

function duracaoPacoteOpus(pacote) {
  const configuracao = pacote[0] >> 3;
  const tipoQuadro = pacote[0] & 3;
  const amostrasPorQuadro =
    configuracao < 12
      ? [480, 960, 1920, 2880][configuracao % 4]
      : configuracao < 16
        ? [480, 960][configuracao % 2]
        : [120, 240, 480, 960][configuracao % 4];
  const quantidade = tipoQuadro === 0 ? 1 : tipoQuadro < 3 ? 2 : pacote[1] & 0x3f;
  return amostrasPorQuadro * quantidade;
}

const crcTabela = Array.from({ length: 256 }, (_, indice) => {
  let valor = indice << 24;
  for (let bit = 0; bit < 8; bit += 1) valor = (valor & 0x80000000 ? (valor << 1) ^ 0x04c11db7 : valor << 1) >>> 0;
  return valor >>> 0;
});

function crcOgg(buffer) {
  let crc = 0;
  for (const byte of buffer) crc = ((crc << 8) ^ crcTabela[((crc >>> 24) & 0xff) ^ byte]) >>> 0;
  return crc;
}

function oggPage(packet, sequence, serial, granule, flags) {
  const segments = [];
  for (let offset = 0; offset < packet.length; offset += 255) segments.push(Math.min(255, packet.length - offset));
  if (!segments.length || packet.length % 255 === 0) segments.push(0);
  if (segments.length > 255) throw new Error("Um pacote Opus excedeu o limite de página Ogg.");
  const header = Buffer.alloc(27 + segments.length);
  header.write("OggS", 0, "ascii");
  header[4] = 0;
  header[5] = flags;
  header.writeBigUInt64LE(BigInt(granule), 6);
  header.writeUInt32LE(serial, 14);
  header.writeUInt32LE(sequence, 18);
  header[26] = segments.length;
  segments.forEach((tamanho, indice) => { header[27 + indice] = tamanho; });
  const pagina = Buffer.concat([header, packet]);
  pagina.writeUInt32LE(crcOgg(pagina), 22);
  return pagina;
}

function oggOpus(webm, duracaoSegundos) {
  const { opusHead, pacotes } = opusStream(webm);
  const preSkip = opusHead.readUInt16LE(10);
  const fornecedor = Buffer.from("A Maldição do Herdeiro", "utf8");
  const tags = Buffer.alloc(8 + 4 + fornecedor.length + 4);
  tags.write("OpusTags", 0, "ascii");
  tags.writeUInt32LE(fornecedor.length, 8);
  fornecedor.copy(tags, 12);
  tags.writeUInt32LE(0, 12 + fornecedor.length);
  const serial = require("node:crypto").randomBytes(4).readUInt32LE(0);
  const paginas = [oggPage(opusHead, 0, serial, 0, 2), oggPage(tags, 1, serial, 0, 0)];
  let amostras = 0;
  for (let indice = 0; indice < pacotes.length; indice += 1) {
    amostras += duracaoPacoteOpus(pacotes[indice]);
    const ultima = indice === pacotes.length - 1;
    const alvo = preSkip + Math.round(duracaoSegundos * 48000);
    const granule = ultima ? Math.min(amostras, alvo) : amostras;
    paginas.push(oggPage(pacotes[indice], indice + 2, serial, granule, ultima ? 4 : 0));
  }
  return Buffer.concat(paginas);
}

(async () => {
const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "herdeiro-sfx-"));
const html = path.join(temporario, "gerar.html");
const perfil = path.join(temporario, "perfil");
fs.writeFileSync(html, page);
let browser;
try {
  browser = spawn(
    edge,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-extensions",
      "--no-first-run",
      "--disable-component-update",
      "--disable-background-timer-throttling",
      "--autoplay-policy=no-user-gesture-required",
      "--enable-media-stream",
      "--remote-debugging-port=0",
      `--user-data-dir=${perfil}`,
      "about:blank",
    ],
    { windowsHide: true, stdio: "ignore" },
  );
  const portaAtiva = path.join(perfil, "DevToolsActivePort");
  for (let tentativa = 0; tentativa < 100 && !fs.existsSync(portaAtiva); tentativa += 1)
    await new Promise((resolve) => setTimeout(resolve, 100));
  if (!fs.existsSync(portaAtiva)) throw new Error("Edge não abriu a conexão local de automação.");
  const porta = Number(fs.readFileSync(portaAtiva, "utf8").split(/\r?\n/)[0]);
  const paginas = await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json();
  const alvo = paginas.find((item) => item.type === "page");
  if (!alvo) throw new Error("Edge não criou uma página para gravar os efeitos.");
  const socket = new WebSocket(alvo.webSocketDebuggerUrl);
  const respostas = new Map();
  let proximoId = 0;
  socket.onmessage = (evento) => {
    const mensagem = JSON.parse(evento.data);
    if (mensagem.id) respostas.get(mensagem.id)?.(mensagem);
  };
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  const chamar = (metodo, parametros = {}) =>
    new Promise((resolve) => {
      const id = ++proximoId;
      respostas.set(id, resolve);
      socket.send(JSON.stringify({ id, method: metodo, params: parametros }));
    });
  await chamar("Page.enable");
  await chamar("Runtime.enable");
  await chamar("Page.navigate", { url: pathToFileURL(html).href });
  let resultadoPagina = "";
  for (let tentativa = 0; tentativa < 200; tentativa += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const resposta = await chamar("Runtime.evaluate", {
      expression: 'document.body.querySelectorAll("pre").length === 2 ? document.body.innerHTML : document.body.textContent',
      returnByValue: true,
    });
    resultadoPagina = resposta.result?.result?.value || "";
    if (resultadoPagina.includes('id="honor"') || resultadoPagina.includes("GENERATION_ERROR")) break;
  }
  socket.close();
  const escolha = resultadoPagina.match(/<pre id="choice">([A-Za-z0-9+/=]+)<\/pre>/);
  const honra = resultadoPagina.match(/<pre id="honor">([A-Za-z0-9+/=]+)<\/pre>/);
  if (!escolha || !honra) throw new Error(`Edge não terminou a gravação Opus: ${resultadoPagina.slice(-500)}`);
  const pastaSaida = path.join(__dirname, "..", "assets", "musica");
  fs.writeFileSync(path.join(pastaSaida, "sfx-escolha.ogg"), oggOpus(Buffer.from(escolha[1], "base64"), 0.23));
  fs.writeFileSync(path.join(pastaSaida, "sfx-honra.ogg"), oggOpus(Buffer.from(honra[1], "base64"), 0.86));
} finally {
  if (browser?.pid) {
    try {
      execFileSync("taskkill.exe", ["/PID", String(browser.pid), "/T", "/F"], { stdio: "ignore" });
    } catch {
      browser.kill();
    }
  }
  const tempResolvido = path.resolve(temporario);
  const raizTemp = path.resolve(os.tmpdir()) + path.sep;
  if (!tempResolvido.startsWith(raizTemp)) throw new Error("Diretório temporário fora da área esperada.");
  try {
    fs.rmSync(tempResolvido, { recursive: true, force: true });
  } catch {
    // O Windows pode manter o perfil aberto por alguns milissegundos após taskkill.
  }
}
console.log("Gerados assets/musica/sfx-escolha.ogg (até 230 ms) e sfx-honra.ogg (até 860 ms).");
})();
