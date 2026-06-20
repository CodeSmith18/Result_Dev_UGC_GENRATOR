import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export function ensureGeneratedBeat(publicDir) {
  const audioDir = path.join(publicDir, "audio");
  const outputPath = path.join(audioDir, "generated-beat.wav");

  if (existsSync(outputPath)) {
    return outputPath;
  }

  mkdirSync(audioDir, { recursive: true });
  writeFileSync(outputPath, createBeatWav());
  return outputPath;
}

function createBeatWav() {
  const sampleRate = 44100;
  const durationSeconds = 8;
  const samples = sampleRate * durationSeconds;
  const bytesPerSample = 2;
  const dataSize = samples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    const beat = time % 0.5;
    const kick = Math.sin(2 * Math.PI * 76 * time) * Math.exp(-beat * 18);
    const click =
      beat < 0.035 ? Math.sin(2 * Math.PI * 1180 * time) * (1 - beat / 0.035) : 0;
    const hatPhase = time % 0.25;
    const hat =
      hatPhase < 0.018
        ? Math.sin(2 * Math.PI * 6200 * time) * (1 - hatPhase / 0.018)
        : 0;
    const sample = Math.max(-1, Math.min(1, kick * 0.78 + click * 0.18 + hat * 0.08));

    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * bytesPerSample);
  }

  return buffer;
}
