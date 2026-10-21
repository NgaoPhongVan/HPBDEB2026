"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const CandleBlowDetector = require("../script/blow-detector.js");
const { signal } = require("./audio-signals.cjs");

function feed(detector, from, to, input, step = 20) {
  let result;
  for (let now = from; now <= to; now += step) {
    result = detector.update(now, input.waveform, input.spectrum);
    assert.equal(result.blown, false, `unexpected extinguish at ${now} ms`);
  }
  return result;
}

function calibrated(rms = 0.004, sampleRate = 48000) {
  const detector = new CandleBlowDetector(sampleRate, 2048);
  const result = feed(detector, 0, 2400, signal(rms, "wind", sampleRate));
  assert.equal(result.calibrating, false);
  return detector;
}

test("silence and steady fan/background noise never extinguish candles", () => {
  for (const rms of [0, 0.004, 0.02, 0.08, 0.2]) {
    const detector = calibrated(rms);
    feed(detector, 2420, 15000, signal(rms));
  }
});

test("startup pop is ignored and sustained startup noise is calibrated", () => {
  const detector = new CandleBlowDetector(48000, 2048);
  feed(detector, 0, 400, signal(0.5));
  feed(detector, 420, 2400, signal(0.004));
  feed(detector, 2420, 5000, signal(0.004));
});

test("clicks and separated short bursts cannot accumulate into a blow", () => {
  const detector = calibrated();
  for (let now = 2500; now < 10000; now += 200) {
    feed(detector, now, now + 100, signal(0.3));
    feed(detector, now + 120, now + 180, signal(0.004));
  }
});

test("loud tonal hum and pitched voice are rejected", () => {
  for (const kind of ["hum", "voice"]) {
    feed(calibrated(), 2420, 10000, signal(0.3, kind));
  }
});

test("broadband and bass-filtered breaths are detected on phone/headset-like inputs", () => {
  for (const kind of ["air", "filtered-air"]) {
    const detector = calibrated();
    const blow = signal(0.08, kind);
    feed(detector, 2500, 2820, blow);
    assert.equal(detector.update(2860, blow.waveform, blow.spectrum).blown, true);
  }
});

test("a low-gain mic can detect breath below the old fixed amplitude threshold", () => {
  const detector = calibrated(0.001);
  const blow = signal(0.012, "filtered-air");
  feed(detector, 2500, 2820, blow);
  assert.equal(detector.update(2860, blow.waveform, blow.spectrum).blown, true);
});

test("brief dips in a real breath do not continually reset confirmation", () => {
  const detector = calibrated();
  const blow = signal(0.08, "filtered-air");
  const quiet = signal(0.004);
  let detected = false;
  for (let now = 2500; now <= 3100; now += 20) {
    const input = (now - 2500) % 120 === 100 ? quiet : blow;
    if (detector.update(now, input.waveform, input.spectrum).blown) { detected = true; break; }
  }
  assert.equal(detected, true);
});

test("blowing throughout calibration does not permanently deafen later attempts", () => {
  const detector = calibrated(0.2);
  feed(detector, 2420, 3000, signal(0.004));
  const blow = signal(0.08, "filtered-air");
  feed(detector, 3020, 3340, blow);
  assert.equal(detector.update(3380, blow.waveform, blow.spectrum).blown, true);
});

test("DC offset is not mistaken for microphone volume", () => {
  const input = signal(0);
  input.waveform.fill(0.5);
  feed(calibrated(), 2420, 6000, input);
});

test("a blow must rise well above the measured room noise", () => {
  const detector = calibrated(0.025);
  feed(detector, 2420, 3500, signal(0.05));
  const blow = signal(0.2);
  feed(detector, 3600, 3920, blow);
  assert.equal(detector.update(3960, blow.waveform, blow.spectrum).blown, true);
});

test("sustained wind is detected in milliseconds at different display/sample rates", () => {
  for (const sampleRate of [44100, 48000, 96000]) {
    for (const fps of [30, 60, 144]) {
      const detector = calibrated(0.004, sampleRate);
      const blow = signal(0.15, "wind", sampleRate);
      let detectedAt;
      for (let now = 2500; now < 3000; now += 1000 / fps) {
        const result = detector.update(now, blow.waveform, blow.spectrum);
        if (result.blown) { detectedAt = now; break; }
      }
      assert.ok(detectedAt >= 2850 && detectedAt <= 2850 + 1000 / fps + 1,
        `sample rate ${sampleRate}, FPS ${fps}, detection ${detectedAt}`);
    }
  }
});

test("a suspended animation loop cannot count the gap as sustained blowing", () => {
  const detector = calibrated();
  const blow = signal(0.15);
  feed(detector, 2500, 2700, blow);
  assert.equal(detector.update(6000, blow.waveform, blow.spectrum).blown, false);
  feed(detector, 6020, 6320, blow);
  assert.equal(detector.update(6360, blow.waveform, blow.spectrum).blown, true);
});

test("sound starting at the end of calibration needs quiet before arming", () => {
  const detector = new CandleBlowDetector(48000, 2048);
  feed(detector, 0, 1980, signal(0.004));
  feed(detector, 2000, 5000, signal(0.2));
  feed(detector, 5020, 5400, signal(0.004));
  const blow = signal(0.2);
  feed(detector, 5420, 5740, blow);
  assert.equal(detector.update(5780, blow.waveform, blow.spectrum).blown, true);
});
