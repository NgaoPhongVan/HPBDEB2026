/* Pure signal gate, kept independent of the microphone and animation frame rate. */
function createBlowDetector() {
  let lastTime = null;
  let elapsed = 0;
  let noiseRms = 0.001;
  let noiseLowPower = 1e-9;
  let quietSince = null;
  let armed = false;
  let blowStartedAt = null;

  return {
    update({ now, rms, lowPower, totalPower, peakLowPower }) {
      const delta = lastTime === null ? 0 : now - lastTime;
      lastTime = now;
      // A delayed/background frame is not evidence of a continuous breath.
      const step = delta > 0 && delta <= 100 ? delta : 0;
      if (!step) {
        quietSince = null;
        blowStartedAt = null;
      }
      elapsed += step;

      // Let microphone processing settle, then measure the actual room noise.
      if (elapsed < 1800) {
        if (elapsed >= 300) {
          noiseRms = Math.max(noiseRms, rms);
          noiseLowPower = Math.max(noiseLowPower, lowPower);
        }
        return { calibrating: true, progress: 0, detected: false };
      }

      // A sound may start just as calibration ends. Require an actual quiet
      // interval before accepting a NEW burst, rather than arming that sound.
      if (!armed) {
        const quiet = rms <= Math.max(0.008, noiseRms * 1.5)
          && lowPower <= Math.max(1e-9, noiseLowPower * 2.25);
        if (!quiet) quietSince = null;
        else if (quietSince === null) quietSince = now;
        if (quietSince !== null && now - quietSince >= 200) armed = true;
        return { calibrating: !armed, progress: 0, detected: false };
      }

      const strongBreath = rms >= Math.max(0.04, noiseRms * 3)
        && lowPower >= noiseLowPower * 9
        && lowPower / Math.max(totalPower, 1e-12) >= 0.55
        // Reject a single bass note / electrical hum rather than turbulent air.
        && peakLowPower / Math.max(lowPower, 1e-12) < 0.45;
      // Only count time between qualifying samples. The interval BEFORE the
      // first strong sample is not evidence of blowing, especially at low FPS.
      if (!strongBreath) blowStartedAt = null;
      else if (blowStartedAt === null) blowStartedAt = now;
      const blowDuration = blowStartedAt === null ? 0 : now - blowStartedAt;
      return {
        calibrating: false,
        progress: Math.min(1, blowDuration / 450),
        detected: blowDuration >= 450,
      };
    },
  };
}
