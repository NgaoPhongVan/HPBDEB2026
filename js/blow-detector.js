/* Pure signal gate, kept independent of the microphone and animation frame rate. */
function createBlowDetector() {
  let lastTime = null;
  let elapsed = 0;
  let noiseRms = 0.001;
  let noiseLowPower = 1e-9;
  let blowDuration = 0;

  return {
    update({ now, rms, lowPower, totalPower, peakLowPower }) {
      const delta = lastTime === null ? 0 : now - lastTime;
      lastTime = now;
      // A delayed/background frame is not evidence of a continuous breath.
      const step = delta > 0 && delta <= 100 ? delta : 0;
      if (!step) blowDuration = 0;
      elapsed += step;

      // Let microphone processing settle, then measure the actual room noise.
      if (elapsed < 1800) {
        if (elapsed >= 300) {
          noiseRms = Math.max(noiseRms, rms);
          noiseLowPower = Math.max(noiseLowPower, lowPower);
        }
        return { calibrating: true, progress: 0, detected: false };
      }

      const strongBreath = rms >= Math.max(0.04, noiseRms * 3)
        && lowPower >= noiseLowPower * 9
        && lowPower / Math.max(totalPower, 1e-12) >= 0.55
        // Reject a single bass note / electrical hum rather than turbulent air.
        && peakLowPower / Math.max(lowPower, 1e-12) < 0.45;
      blowDuration = strongBreath ? blowDuration + step : 0;
      return {
        calibrating: false,
        progress: Math.min(1, blowDuration / 450),
        detected: blowDuration >= 450,
      };
    },
  };
}
