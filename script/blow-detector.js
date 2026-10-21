"use strict";

// Signal-only detector, shared by the browser and the Node regression tests.
class CandleBlowDetector {
  constructor(sampleRate, fftSize) {
    this.binWidth = sampleRate / fftSize;
    this.sampleRate = sampleRate;
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
    this.blowEvidence = 0;
    this.lastWindAt = null;
    this.lowerNoiseSince = null;
    this.tonalNoiseFrames = 0;
    this.tonalBackground = false;
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
    const step = Math.max(0, Math.min(gap, 100));
    if (gap > 250) {
      this.blowSince = null;
      this.blowEvidence = 0;
    }

    // Ignore mic startup, then learn the room rather than using byte FFT levels
    // as an absolute volume threshold. Never extinguish during calibration.
    if (this.noiseFloor === null) {
      if (now - this.startedAt >= 500) {
        this.noiseSamples.push(rms);
        if (this.isPeriodic(waveform, mean, 0.6)) this.tonalNoiseFrames++;
      }
      if (now - this.startedAt < 2000 || this.noiseSamples.length < 8) {
        return { calibrating: true, blown: false };
      }
      this.noiseSamples.sort((a, b) => a - b);
      // Include normal background fluctuations rather than just its pauses.
      this.noiseFloor = Math.max(0.001,
        this.noiseSamples[Math.floor(this.noiseSamples.length * 0.8)]);
      // Even brief pitched passages identify a musical/voiced background;
      // later pauses in that source must not erase its calibrated level.
      this.tonalBackground = this.tonalNoiseFrames > this.noiseSamples.length * 0.05;
      this.noiseSamples = [];
    }

    // Recover from blowing during calibration only after a sustained quiet
    // interval. Following every dip would learn pauses in music as silence.
    if (!this.tonalBackground && rms < this.noiseFloor * 0.2
      && !this.isPeriodic(waveform, mean, 0.55)) {
      if (this.lowerNoiseSince === null || gap > 250) this.lowerNoiseSince = now;
      if (now - this.lowerNoiseSince >= 300) {
        this.noiseFloor = Math.max(0.001, rms);
        this.lowerNoiseSince = null;
      }
    } else this.lowerNoiseSince = null;

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

    const threshold = Math.max(0.008, this.noiseFloor * 3, this.noiseFloor + 0.006);
    const loud = rms > threshold;
    let lowEnergy = 0;
    let totalEnergy = 0;
    let peakEnergy = 0;
    let lowBins = 0;
    let midEnergy = 0;
    let midLogPower = 0;
    let midBins = 0;
    let totalPeak = 0;
    let lowLogPower = 0;
    let lowBinCount = 0;
    // FFT values are dB, so convert to linear power before comparing bands.
    for (let i = 1; i < spectrum.length; i++) {
      const hz = i * this.binWidth;
      if (hz < 40 || hz > 8000) continue;
      const power = 10 ** (spectrum[i] / 10);
      totalEnergy += power;
      totalPeak = Math.max(totalPeak, power);
      if (hz >= 1000 && hz <= 4000) {
        midEnergy += power;
        midLogPower += Math.log(Math.max(power, 1e-12));
        midBins++;
      }
      if (hz <= 1000) {
        lowEnergy += power;
        peakEnergy = Math.max(peakEnergy, power);
        lowLogPower += Math.log(Math.max(power, 1e-12));
        lowBinCount++;
      }
    }
    for (let i = 1; i < spectrum.length && i * this.binWidth <= 1000; i++) {
      if (i * this.binWidth >= 40 && 10 ** (spectrum[i] / 10) >= peakEnergy * 0.03) lowBins++;
    }

    // Phone/headset processing can remove the bass from a real breath. Accept
    // either low wind or broadband air, while rejecting pitched sound.
    const lowFlatness = lowEnergy > 0 && lowBinCount > 0
      ? Math.exp(lowLogPower / lowBinCount) / (lowEnergy / lowBinCount) : 0;
    const lowWind = lowEnergy / totalEnergy >= 0.65 && lowFlatness >= 0.08
      && peakEnergy / lowEnergy < 0.35 && lowBins >= 6;
    const midFlatness = midEnergy > 0 && midBins > 0
      ? Math.exp(midLogPower / midBins) / (midEnergy / midBins) : 0;
    const broadbandAir = midFlatness >= 0.25 && midEnergy / totalEnergy >= 0.15
      && totalPeak / totalEnergy < 0.12;
    let periodic = false;
    if (loud && (lowWind || broadbandAir)) {
      // A broad spectrum alone can still be music or voiced speech. Look for
      // repeated waveform cycles (pitch), which turbulent breath does not have.
      periodic = this.isPeriodic(waveform, mean, lowWind ? 0.55 : 0.35);
    }
    const windLike = totalEnergy > 0 && (lowWind || broadbandAir) && !periodic;
    if (loud && windLike) {
      if (this.blowSince === null || now - this.blowSince > 800) {
        this.blowSince = now;
        this.blowEvidence = 0;
      } else {
        this.blowEvidence += step;
      }
      this.lastWindAt = now;
    } else {
      // Tolerate brief dips without combining isolated clicks/bursts or
      // crediting the dip itself as evidence of blowing.
      if (this.lastWindAt === null || now - this.lastWindAt > 100) {
        this.blowSince = null;
        this.blowEvidence = 0;
      }
      if (!loud && rms > this.noiseFloor) {
        const alpha = 1 - Math.exp(-step / 3000);
        this.noiseFloor = Math.max(0.001, this.noiseFloor + alpha * (rms - this.noiseFloor));
      }
    }

    // Milliseconds, not animation-frame counts: same behavior at 30/60/144 Hz.
    const duration = this.blowSince === null ? 0 : now - this.blowSince;
    return {
      calibrating: false,
      level: Math.min(1, rms / threshold),
      blown: loud && windLike && duration >= 350 && this.blowEvidence >= 300
        && this.blowEvidence / duration >= 0.75,
    };
  }

  isPeriodic(waveform, mean, threshold) {
    const stride = 4;
    const count = Math.floor(waveform.length / stride);
    const minLag = Math.max(1, Math.floor(this.sampleRate * 0.003 / stride));
    const maxLag = Math.min(Math.floor(count / 2), Math.ceil(this.sampleRate * 0.015 / stride));
    for (let lag = minLag; lag <= maxLag; lag += 2) {
      let cross = 0, aEnergy = 0, bEnergy = 0;
      for (let i = 0; i < count - lag; i++) {
        const a = waveform[i * stride] - mean;
        const b = waveform[(i + lag) * stride] - mean;
        cross += a * b; aEnergy += a * a; bEnergy += b * b;
      }
      if (cross / Math.max(1e-12, Math.sqrt(aEnergy * bEnergy)) > threshold) return true;
    }
    return false;
  }
}

if (typeof module !== "undefined" && module.exports) module.exports = CandleBlowDetector;
