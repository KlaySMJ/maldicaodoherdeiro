"use strict";

// Gera quatro loops instrumentais originais usando apenas osciladores e PCM.
// O WAV sem compressão pode ser tocado direto pelo navegador, inclusive em file://.
const fs = require("node:fs");
const path = require("node:path");

const sampleRate = 22050;
const outputDir = path.join(__dirname, "..", "assets", "musica");
fs.mkdirSync(outputDir, { recursive: true });

function frequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function note(buffer, pitch, start, duration, volume, voice = "lyra") {
  const first = Math.max(0, Math.floor(start * sampleRate));
  const last = Math.min(buffer.length, Math.floor((start + duration) * sampleRate));
  const hz = frequency(pitch);
  const attack = voice === "lyra" || voice === "sino" ? 0.018 : voice === "flauta" ? 0.28 : 0.85;
  const release = voice === "pad" || voice === "cordas" ? 0.75 : 0.2;
  const length = duration;

  for (let index = first; index < last; index++) {
    const t = index / sampleRate - start;
    const inNote = Math.min(1, t / attack);
    const outNote = Math.min(1, Math.max(0, (length - t) / release));
    let envelope = inNote * outNote;
    let sample = 0;

    if (voice === "lyra") {
      envelope *= Math.exp(-2.6 * t);
      sample = Math.sin(2 * Math.PI * hz * t)
        + 0.48 * Math.sin(2 * Math.PI * hz * 2.01 * t + 0.1)
        + 0.21 * Math.sin(2 * Math.PI * hz * 3.98 * t + 0.4)
        + 0.08 * Math.sin(2 * Math.PI * hz * 6.1 * t);
    } else if (voice === "sino") {
      sample = Math.sin(2 * Math.PI * hz * t) * Math.exp(-2.2 * t)
        + 0.52 * Math.sin(2 * Math.PI * hz * 2.72 * t) * Math.exp(-4.1 * t)
        + 0.3 * Math.sin(2 * Math.PI * hz * 4.18 * t + 0.4) * Math.exp(-6.4 * t)
        + 0.12 * Math.sin(2 * Math.PI * hz * 6.4 * t) * Math.exp(-8.4 * t);
    } else if (voice === "flauta") {
      const vibrato = Math.sin(2 * Math.PI * 4.5 * t) * 0.0035;
      sample = Math.sin(2 * Math.PI * hz * (1 + vibrato) * t)
        + 0.18 * Math.sin(2 * Math.PI * hz * 2 * t + 0.2);
    } else if (voice === "cordas") {
      const vibrato = Math.sin(2 * Math.PI * 0.23 * t) * 0.0025;
      sample = Math.sin(2 * Math.PI * hz * (1 + vibrato) * t)
        + 0.78 * Math.sin(2 * Math.PI * hz * (0.997 + vibrato) * t + 0.2)
        + 0.28 * Math.sin(2 * Math.PI * hz * 2.003 * t + 0.5)
        + 0.1 * Math.sin(2 * Math.PI * hz * 3.01 * t);
    } else {
      const ondulacao = 0.86 + 0.14 * Math.sin(2 * Math.PI * 0.09 * t);
      sample = ondulacao * (
        Math.sin(2 * Math.PI * hz * t)
        + 0.38 * Math.sin(2 * Math.PI * hz * 1.002 * t + 0.3)
        + 0.2 * Math.sin(2 * Math.PI * hz * 2 * t)
        + 0.07 * Math.sin(2 * Math.PI * hz * 3.01 * t + 0.5)
      );
    }
    buffer[index] += sample * envelope * volume;
  }
}

function pulso(buffer, start, volume) {
  const duration = 0.52;
  const first = Math.floor(start * sampleRate);
  const last = Math.min(buffer.length, first + Math.floor(duration * sampleRate));
  for (let index = first; index < last; index++) {
    const t = (index - first) / sampleRate;
    const hz = 61 * Math.exp(-3.7 * t) + 35;
    const envelope = Math.exp(-5.6 * t);
    buffer[index] += Math.sin(2 * Math.PI * hz * t) * envelope * volume;
  }
}

function delayRoom(buffer) {
  const dry = Float32Array.from(buffer);
  for (const [seconds, amount] of [[0.12, 0.19], [0.23, 0.12], [0.37, 0.075]]) {
    const delay = Math.floor(seconds * sampleRate);
    for (let index = delay; index < buffer.length; index++) buffer[index] += dry[index - delay] * amount;
  }
}

function writeWave(file, buffer) {
  const edge = Math.floor(sampleRate * 0.13);
  let peak = 0;
  for (let index = 0; index < buffer.length; index++) {
    const fade = Math.min(1, index / edge, (buffer.length - 1 - index) / edge);
    buffer[index] *= Math.max(0, fade);
    peak = Math.max(peak, Math.abs(buffer[index]));
  }
  const gain = peak > 0 ? 0.62 / peak : 1;
  const dataBytes = buffer.length * 2;
  const wave = Buffer.alloc(44 + dataBytes);
  wave.write("RIFF", 0);
  wave.writeUInt32LE(36 + dataBytes, 4);
  wave.write("WAVE", 8);
  wave.write("fmt ", 12);
  wave.writeUInt32LE(16, 16);
  wave.writeUInt16LE(1, 20);
  wave.writeUInt16LE(1, 22);
  wave.writeUInt32LE(sampleRate, 24);
  wave.writeUInt32LE(sampleRate * 2, 28);
  wave.writeUInt16LE(2, 32);
  wave.writeUInt16LE(16, 34);
  wave.write("data", 36);
  wave.writeUInt32LE(dataBytes, 40);
  for (let index = 0; index < buffer.length; index++) {
    wave.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buffer[index] * gain)) * 32767), 44 + index * 2);
  }
  fs.writeFileSync(file, wave);
  console.log(`${path.basename(file)} · ${(wave.length / 1048576).toFixed(2)} MB · ${(buffer.length / sampleRate).toFixed(1)} s`);
}

function makeLoop({ file, bpm, bars, root, chords, melody, voice, mood }) {
  const secondsPerBeat = 60 / bpm;
  const bar = secondsPerBeat * 4;
  const seconds = bar * bars;
  const buffer = new Float32Array(Math.ceil(seconds * sampleRate));
  const chordBars = mood === "intro" ? 1 : 2;

  note(buffer, root - 12, 0.1, seconds - 0.25, 0.035, "pad");
  note(buffer, root - 5, 0.6, seconds - 1.1, 0.022, "cordas");

  for (let progression = 0; progression < chords.length; progression++) {
    const startBar = progression * chordBars;
    const start = startBar * bar + 0.05;
    const duration = chordBars * bar - 0.1;
    for (let tone = 0; tone < chords[progression].length; tone++) {
      const volume = mood === "culto" ? 0.04 : mood === "intro" ? 0.036 : 0.031;
      note(buffer, chords[progression][tone], start, duration, volume, mood === "culto" ? "cordas" : "pad");
    }
  }

  for (let index = 0; index < melody.length; index++) {
    const barIndex = index % bars;
    const [pitch, beat = 0.3, length = 0.72, strength = 0.07] = melody[index];
    const fadeIn = mood === "intro" ? 0.35 + barIndex / bars * 0.65 : 0.95;
    note(buffer, pitch, barIndex * bar + beat * secondsPerBeat, length * secondsPerBeat, strength * fadeIn, voice);
  }

  if (mood === "intro") {
    const subida = [0.42, 0.62, 0.83, 1];
    const frase = [50, 57, 62, 65, 69, 72, 74, 77];
    for (let currentBar = 0; currentBar < bars; currentBar++) {
      const energia = subida[currentBar];
      for (let i = 0; i < 4; i++) {
        const beat = 0.35 + i * 0.85;
        const pitch = frase[currentBar * 2 + i] || frase.at(-1);
        note(buffer, pitch, currentBar * bar + beat * secondsPerBeat, 0.58 * secondsPerBeat, 0.033 * energia, "sino");
      }
      if (currentBar > 0) pulso(buffer, currentBar * bar + 2 * secondsPerBeat, 0.018 * energia);
      if (currentBar >= 2) {
        note(buffer, 74 + currentBar, currentBar * bar + 1.45 * secondsPerBeat, 2.1 * secondsPerBeat, 0.022 * energia, "flauta");
      }
    }
  }

  if (mood === "menu") {
    const frases = [
      [62, 69, 74, 69], [60, 67, 72, 67], [58, 65, 70, 65], [57, 64, 69, 64],
      [62, 69, 74, 77], [58, 65, 70, 74], [57, 64, 69, 72], [62, 67, 69, 74]
    ];
    const energia = [0.52, 0.64, 0.78, 0.9, 1, 0.88, 0.72, 0.56];
    for (let currentBar = 0; currentBar < bars; currentBar++) {
      for (let i = 0; i < frases[currentBar].length; i++) {
        note(buffer, frases[currentBar][i], currentBar * bar + (0.2 + i * 0.88) * secondsPerBeat, 0.56 * secondsPerBeat, 0.038 * energia[currentBar], "lyra");
      }
      pulso(buffer, currentBar * bar + 0.04, 0.012 * energia[currentBar]);
      if (currentBar % 2 === 1) pulso(buffer, currentBar * bar + 2 * secondsPerBeat, 0.009 * energia[currentBar]);
      if (currentBar === 3 || currentBar === 6) note(buffer, 76, currentBar * bar + 2.45 * secondsPerBeat, 1.1 * secondsPerBeat, 0.025, "flauta");
    }
  }
  if (mood === "jogo") {
    const acompanhamento = [
      [50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [48, 55, 60, 64],
      [50, 57, 62, 67], [46, 53, 58, 62], [41, 48, 53, 60], [48, 55, 60, 64]
    ];
    const energia = [0.62, 0.78, 0.94, 0.74, 0.67, 0.85, 1, 0.7];
    for (let currentBar = 0; currentBar < bars; currentBar++) {
      for (let i = 0; i < 4; i++) {
        const beat = i * 0.94 + 0.12;
        note(buffer, acompanhamento[currentBar][i], currentBar * bar + beat * secondsPerBeat, 0.48 * secondsPerBeat, 0.035 * energia[currentBar], "lyra");
      }
      pulso(buffer, currentBar * bar + 0.03, 0.02 * energia[currentBar]);
      pulso(buffer, currentBar * bar + 2 * secondsPerBeat, 0.014 * energia[currentBar]);
      if (currentBar === 3 || currentBar === 7) {
        const resposta = currentBar === 3 ? [72, 74, 77, 74] : [69, 72, 76, 74];
        for (let i = 0; i < resposta.length; i++) {
          note(buffer, resposta[i], currentBar * bar + (i * 0.9 + 0.3) * secondsPerBeat, 0.72 * secondsPerBeat, 0.029, "flauta");
        }
      }
    }
  }
  if (mood === "culto") {
    for (let currentBar = 0; currentBar < bars; currentBar++) {
      pulso(buffer, currentBar * bar + 0.04, 0.045);
      pulso(buffer, currentBar * bar + 2 * secondsPerBeat, 0.032);
    }
  }

  delayRoom(buffer);
  writeWave(path.join(outputDir, file), buffer);
}

const loops = [
  {
    file: "menu-cronicas.wav", bpm: 56, bars: 8, root: 38, mood: "menu", voice: "sino",
    chords: [[50, 57, 62, 64], [48, 55, 60, 62], [46, 53, 58, 60], [45, 52, 57, 59]],
    melody: [[74, 0.2, 1.0, 0.055], [69, 2.2, 0.95, 0.05], [72, 1.2, 0.8, 0.05], [76, 2.6, 1.1, 0.045], [74, 0.4, 0.8, 0.05], [72, 2.1, 1.2, 0.055], [69, 0.6, 1.1, 0.05], [71, 2.4, 1.1, 0.042]]
  },
  {
    file: "intro-chamado.wav", bpm: 52, bars: 4, root: 38, mood: "intro", voice: "flauta",
    chords: [[50, 57, 64, 69], [53, 60, 65, 69], [55, 62, 67, 71], [50, 57, 62, 64]],
    melody: [[69, 1.2, 2.5, 0.035], [74, 0.6, 2.7, 0.04], [72, 1.5, 2.1, 0.042], [76, 0.35, 3.0, 0.045]]
  },
  {
    file: "jogo-entre-decisoes.wav", bpm: 62, bars: 8, root: 38, mood: "jogo", voice: "lyra",
    chords: [[50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [48, 55, 60, 64]],
    melody: [[74, 0.25, 0.85, 0.06], [69, 1.45, 0.75, 0.048], [67, 2.7, 1.0, 0.05], [64, 0.35, 0.8, 0.046], [69, 2.2, 0.9, 0.05], [72, 0.65, 0.9, 0.05], [67, 2.6, 1.05, 0.048], [71, 1.7, 0.9, 0.045]]
  },
  {
    file: "culto-pacto.wav", bpm: 58, bars: 8, root: 38, mood: "culto", voice: "cordas",
    chords: [[50, 56, 62, 65], [51, 58, 63, 66], [46, 53, 58, 61], [49, 56, 61, 65]],
    melody: [[74, 0.3, 1.3, 0.045], [68, 1.8, 1.2, 0.05], [66, 0.5, 1.0, 0.05], [63, 2.1, 1.5, 0.052], [74, 0.2, 1.5, 0.042], [68, 1.6, 1.3, 0.052], [66, 0.4, 1.2, 0.05], [63, 2.0, 1.7, 0.055]]
  }
];

for (const loop of loops) makeLoop(loop);
