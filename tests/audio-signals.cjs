"use strict";

// Coherent PCM + FFT fixtures. A waveform and its spectrum must describe the
// same sound; unrelated RMS/spectrum arrays cannot test periodicity rejection.
function fft(real, imag, inverse = false) {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }
  for (let size = 2; size <= n; size *= 2) {
    for (let start = 0; start < n; start += size) {
      for (let j = 0; j < size / 2; j++) {
        const angle = (inverse ? 2 : -2) * Math.PI * j / size;
        const a = start + j, b = a + size / 2;
        const r = real[b] * Math.cos(angle) - imag[b] * Math.sin(angle);
        const im = real[b] * Math.sin(angle) + imag[b] * Math.cos(angle);
        real[b] = real[a] - r; imag[b] = imag[a] - im;
        real[a] += r; imag[a] += im;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { real[i] /= n; imag[i] /= n; }
}

function signal(rms, kind = "wind", sampleRate = 48000) {
  const n = 2048;
  const real = new Float64Array(n), imag = new Float64Array(n);
  let seed = 2026;
  for (let i = 0; i < n; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    real[i] = seed / 0x100000000 - 0.5;
  }
  fft(real, imag);
  for (let i = 0; i < n; i++) {
    const hz = Math.min(i, n - i) * sampleRate / n;
    const keep = kind === "wind" ? hz >= 40 && hz <= 1000
      : hz >= (kind === "filtered-air" ? 400 : 40) && hz <= 8000;
    if (!keep) { real[i] = 0; imag[i] = 0; }
  }
  fft(real, imag, true);
  if (kind === "hum" || kind === "voice") {
    real.fill(0);
    for (let i = 0; i < n; i++) {
      for (let h = 1; h <= (kind === "hum" ? 1 : 20); h++) {
        real[i] += Math.sin(2 * Math.PI * (kind === "hum" ? 120 : 180) * h * i / sampleRate) / h;
      }
    }
  }
  const mean = real.reduce((sum, x) => sum + x, 0) / n;
  const actualRms = Math.sqrt(real.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n);
  const waveform = Float32Array.from(real, x => (x - mean) * rms / actualRms);
  return { waveform, spectrum: analyse(waveform) };
}

function analyse(waveform) {
  const n = waveform.length;
  const windowed = Float64Array.from(waveform, (x, i) => x
    * (0.42 - 0.5 * Math.cos(2 * Math.PI * i / n) + 0.08 * Math.cos(4 * Math.PI * i / n)));
  const imag = new Float64Array(n);
  fft(windowed, imag);
  const spectrum = Float32Array.from({ length: n / 2 }, (_, i) =>
    20 * Math.log10(Math.max(1e-12, Math.hypot(windowed[i], imag[i]) / n)));
  return spectrum;
}

module.exports = { signal, analyse };
