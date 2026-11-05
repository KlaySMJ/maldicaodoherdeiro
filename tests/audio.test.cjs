"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function prepararAudio(preferencias = {}) {
  const valores = new Map(Object.entries(preferencias));
  const eventos = new Map();
  const timers = new Map();
  const audios = [];
  const documentoEventos = new Map();
  let proximoTimer = 1;
  let agora = 0;
  const controle = {
    textContent: "",
    atributos: {},
    addEventListener(tipo, callback) {
      eventos.set(`controle:${tipo}`, callback);
    },
    setAttribute(nome, valor) {
      this.atributos[nome] = valor;
    },
  };
  const volume = {
    value: "50",
    addEventListener(tipo, callback) {
      eventos.set(`volume:${tipo}`, callback);
    },
  };
  const volumeTexto = { value: "", textContent: "" };

  class AudioFake {
    constructor(src) {
      this.src = src;
      this.paused = true;
      this.volume = 1;
      audios.push(this);
    }
    play() {
      this.paused = false;
      return Promise.resolve();
    }
    addEventListener(tipo, callback) {
      this[tipo] = callback;
    }
    pause() {
      this.paused = true;
    }
    terminar() {
      this.paused = true;
      this.ended?.();
    }
  }

  const clearIntervalFake = (id) => {
    const timer = timers.get(id);
    if (timer) timer.cancelado = true;
  };
  const contexto = vm.createContext({
    window: {
      Jogo: {},
      setInterval(callback) {
        const id = proximoTimer++;
        timers.set(id, { callback, cancelado: false });
        return id;
      },
    },
    document: {
      addEventListener(tipo, callback) {
        documentoEventos.set(tipo, callback);
      },
      getElementById(id) {
        return (
          {
            "alternar-musica": controle,
            "volume-musica": volume,
            "volume-musica-valor": volumeTexto,
          }[id] || null
        );
      },
    },
    localStorage: {
      getItem(key) {
        return valores.has(key) ? valores.get(key) : null;
      },
      setItem(key, value) {
        valores.set(key, value);
      },
    },
    Audio: AudioFake,
    performance: { now: () => agora },
    clearInterval: clearIntervalFake,
  });

  const arquivo = fs.readFileSync(path.join(__dirname, "../js/audio.js"), "utf8");
  vm.runInContext(arquivo, contexto);

  return {
    J: contexto.window.Jogo,
    audios,
    documentoEventos,
    controle,
    volume,
    volumeTexto,
    valores,
    eventos,
    avancarTempo(milissegundos) {
      agora += milissegundos;
      for (const timer of timers.values()) if (!timer.cancelado) timer.callback();
    },
  };
}

test("áudio respeita preferências salvas e espera interação do jogador", () => {
  const { J, audios, controle, volume, volumeTexto, documentoEventos } = prepararAudio({
    musica_ambiente: "0",
    volume_musica: "73",
  });

  assert.equal(controle.textContent, "Retomar música");
  assert.equal(controle.atributos["aria-pressed"], "false");
  assert.equal(volume.value, "73");
  assert.equal(volumeTexto.textContent, "73%");
  assert.equal(documentoEventos.has("pointerdown"), true);
  assert.equal(documentoEventos.has("keydown"), true);
  J.audio.interagir();
  J.audio.definirContexto("culto");
  assert.equal(audios.length, 0);
});

test("efeitos de escolha usam OGG sem sobreposição e o ganho de honra entra depois", () => {
  const { J, audios } = prepararAudio();
  J.audio.sfx("confirmacao");
  J.audio.sfx("confirmacao");
  J.audio.sfx("honra");
  assert.equal(audios.length, 1);
  assert.equal(audios[0].src, "assets/musica/sfx-escolha.ogg");
  audios[0].terminar();
  assert.equal(audios.length, 2);
  assert.equal(audios[1].src, "assets/musica/sfx-honra.ogg");
  audios[1].terminar();
});

test("os efeitos OGG têm duração dentro dos limites e terminam com uma página EOS", () => {
  for (const [arquivo, limite] of [
    ["sfx-escolha.ogg", 0.3],
    ["sfx-honra.ogg", 1.2],
  ]) {
    const bytes = fs.readFileSync(path.join(__dirname, "../assets/musica", arquivo));
    assert.equal(bytes.toString("ascii", 0, 4), "OggS");
    let offset = 0;
    let ultimaGranulacao = 0n;
    let flagsPaginaFinal = 0;
    while (offset < bytes.length) {
      assert.equal(bytes.toString("ascii", offset, offset + 4), "OggS");
      const segmentos = bytes[offset + 26];
      const tamanhoCorpo = bytes
        .subarray(offset + 27, offset + 27 + segmentos)
        .reduce((soma, tamanho) => soma + tamanho, 0);
      ultimaGranulacao = bytes.readBigUInt64LE(offset + 6);
      flagsPaginaFinal = bytes[offset + 5];
      offset += 27 + segmentos + tamanhoCorpo;
    }
    assert.equal(offset, bytes.length);
    assert.ok(Number(ultimaGranulacao) / 48000 <= limite);
    assert.ok(Number(ultimaGranulacao) > 0);
    assert.equal(flagsPaginaFinal & 4, 4);
  }
});

test("áudio troca de contexto, aplica fades, pausa e salva as preferências", async () => {
  const { J, audios, controle, volume, valores, eventos, avancarTempo } = prepararAudio();

  J.audio.definirContexto("jogo");
  J.audio.interagir();
  await Promise.resolve();
  assert.equal(audios.length, 1);
  assert.equal(audios[0].src, "assets/musica/jogo-entre-decisoes.wav");
  avancarTempo(2500);
  assert.ok(Math.abs(audios[0].volume - 0.25) < 0.001);

  J.audio.definirContexto("culto");
  await Promise.resolve();
  assert.equal(audios.length, 2);
  assert.equal(audios[1].src, "assets/musica/culto-pacto.wav");
  avancarTempo(2500);
  assert.equal(audios[0].paused, true);
  assert.ok(Math.abs(audios[1].volume - 0.25) < 0.001);

  volume.value = "64";
  eventos.get("volume:input")();
  assert.equal(valores.get("volume_musica"), "64");
  controle && eventos.get("controle:click")();
  assert.equal(controle.textContent, "Retomar música");
  assert.equal(valores.get("musica_ambiente"), "0");
  avancarTempo(600);
  assert.equal(audios[1].paused, true);
});
