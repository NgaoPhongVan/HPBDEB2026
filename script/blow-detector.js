"use strict";

// Signal-only detector, shared by the browser and the Node regression tests.
class CandleBlowDetector {
  constructor(sampleRate, fftSize) {
    this.binWidth = sampleRate / fftSize;
    this.reset(0);
  }

  reset(now) {
    this.startedAt = now;
    this.lastAt = null;
    this.noiseSamples = [];
    this.noiseFloor = null;
    this.quietSince = null;
    this.armed = false;
    this.blowSince = null;
  }

  update(now, waveform, spectrum) {
    // Remove DC offset before measuring actual waveform amplitude (RMS).
    let mean = 0;
    for (const value of waveform) mean += value;
    mean /= waveform.length;
    let energy = 0;
    for (const value of waveform) energy += (value - mean) ** 2;
    const rms = Math.sqrt(energy / waveform.length);

    const gap = this.lastAt === null ? 0 : now - this.lastAt;
    this.lastAt = now;
    if (gap > 250) this.blowSince = null;

    // Ignore mic startup, then learn the room rather than using byte FFT levels
    // as an absolute volume threshold. Never extinguish during calibration.
    if (this.noiseFloor === null) {
      if (now - this.startedAt >= 500) this.noiseSamples.push(rms);
      if (now - this.startedAt < 2000 || this.noiseSamples.length < 8) {
        return { calibrating: true, blown: false };
      }
      this.noiseSamples.sort((a, b) => a - b);
      this.noiseFloor = Math.max(0.004,
        this.noiseSamples[Math.floor(this.noiseSamples.length * 0.8)]);
      this.noiseSamples = [];
    }

    // Require quiet after calibration, so an ongoing sound cannot arm itself.
    if (!this.armed) {
      if (rms <= this.noiseFloor * 1.5 + 0.005) {
        if (this.quietSince === null || gap > 250) this.quietSince = now;
        if (now - this.quietSince >= 200) this.armed = true;
      } else {
        this.quietSince = null;
      }
      return { calibrating: true, blown: false };
    }

    const loud = rms > Math.max(0.025, this.noiseFloor * 3.5, this.noiseFloor + 0.02);
    let lowEnergy = 0;
    let totalEnergy = 0;
    let peakEnergy = 0;
    let lowBins = 0;
    // FFT values are dB, so convert to linear power before comparing bands.
    for (let i = 1; i < spectrum.length; i++) {
      const hz = i * this.binWidth;
      if (hz < 40 || hz > 8000) continue;
      const power = 10 ** (spectrum[i] / 10);
      totalEnergy += power;
      if (hz <= 1000) {
        lowEnergy += power;
        peakEnergy = Math.max(peakEnergy, power);
      }
    }
    for (let i = 1; i < spectrum.length && i * this.binWidth <= 1000; i++) {
      if (i * this.binWidth >= 40 && 10 ** (spectrum[i] / 10) >= peakEnergy * 0.03) lowBins++;
    }

    // Close mic wind is a broad low-frequency burst. Reject tonal hum, speech
    // dominated by higher bands, isolated clicks, and steady calibrated noise.
    const windLike = totalEnergy > 0 && lowEnergy / totalEnergy >= 0.65
      && peakEnergy / lowEnergy < 0.35 && lowBins >= 6;
    if (loud && windLike) {
      if (this.blowSince === null) this.blowSince = now;
    } else {
      this.blowSince = null;
      if (!loud) {
        const alpha = 1 - Math.exp(-Math.min(gap, 100) / 3000);
        this.noiseFloor = Math.max(0.004, this.noiseFloor + alpha * (rms - this.noiseFloor));
      }
    }

    // Milliseconds, not animation-frame counts: same behavior at 30/60/144 Hz.
    return { calibrating: false, blown: this.blowSince !== null && now - this.blowSince >= 350 };
  }
}

if (typeof module !== "undefined" && module.exports) module.exports = CandleBlowDetector;
