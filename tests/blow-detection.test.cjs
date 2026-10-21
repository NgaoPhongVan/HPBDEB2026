const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const detectorCode = fs.readFileSync(path.join(__dirname, '../js/blow-detector.js'), 'utf8');
const mainCode = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
const room = { rms: 0.004, lowPower: 0.00001, totalPower: 0.00003, peakLowPower: 0.000001 };
const breath = { rms: 0.12, lowPower: 0.02, totalPower: 0.025, peakLowPower: 0.002 };

function gate() {
  const context = vm.createContext({});
  vm.runInContext(detectorCode, context);
  const detector = vm.runInContext('createBlowDetector()', context);
  let now = 0;
  return {
    feed(signal, duration, step = 20) {
      let result;
      for (let elapsed = 0; elapsed < duration; elapsed += step) {
        now += step;
        result = detector.update({ now, ...signal });
        if (result.detected) return result;
      }
      return result;
    },
  };
}

test('silence, room noise, music, speech, hum and a clap do not extinguish candles', () => {
  const signals = [
    { rms: 0, lowPower: 0, totalPower: 0, peakLowPower: 0 },
    room,
    { rms: 0.08, lowPower: 0.003, totalPower: 0.015, peakLowPower: 0.0005 }, // music
    { rms: 0.09, lowPower: 0.002, totalPower: 0.012, peakLowPower: 0.0004 }, // speech
    { rms: 0.15, lowPower: 0.03, totalPower: 0.031, peakLowPower: 0.025 }, // bass/hum
  ];
  for (const signal of signals) {
    const detector = gate();
    detector.feed(room, 2000);
    assert.equal(detector.feed(signal, 10000).detected, false);
  }
  const detector = gate();
  detector.feed(room, 2000);
  assert.equal(detector.feed(breath, 80).detected, false); // even a loud low-frequency impulse
  assert.equal(detector.feed(room, 1000).progress, 0);
});

test('steady loud background is calibrated instead of treated as a breath', () => {
  const detector = gate();
  assert.equal(detector.feed(breath, 15000).detected, false);
});

test('breath during calibration cannot trigger; a later sustained breath can', () => {
  const detector = gate();
  assert.equal(detector.feed(breath, 200).calibrating, true);
  detector.feed(room, 2000);
  assert.equal(detector.feed(breath, 400).detected, false);
  assert.equal(detector.feed(breath, 100).detected, true);
});

test('separate short bursts never accumulate into a sustained breath', () => {
  const detector = gate();
  detector.feed(room, 2000);
  for (let i = 0; i < 20; i++) {
    assert.equal(detector.feed(breath, 300).detected, false);
    assert.equal(detector.feed(room, 20).progress, 0);
  }
});

test('confirmation uses elapsed time at 30, 60 and 144 fps; delayed frames reset it', () => {
  for (const step of [1000 / 30, 1000 / 60, 1000 / 144]) {
    const detector = gate();
    detector.feed(room, 2000, step);
    assert.equal(detector.feed(breath, 350, step).detected, false);
    assert.equal(detector.feed(breath, 200, step).detected, true);
  }
  const detector = gate();
  detector.feed(room, 2000);
  detector.feed(breath, 300);
  assert.equal(detector.feed(breath, 500, 500).progress, 0);
  assert.equal(detector.feed(breath, 200).detected, false);
});

function app({ permission, sampleRate = 48000, resumeError = false } = {}) {
  let now = 0;
  let requests = 0;
  let amplitude = 0.004;
  let blowing = false;
  let stopped = 0;
  const frames = new Map();
  const timers = [];
  const events = {};
  const elements = new Map();
  const contexts = [];
  const track = { stop() { stopped++; }, addEventListener() {} };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  const context = vm.createContext({
    console: { log() {} },
    CONFIG: { password: 'test', nicknames: ['test'] },
    document: {
      hidden: false,
      addEventListener(name, fn) { events[name] = fn; },
      createElement: () => ({}),
      head: { appendChild() {} },
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, {
          style: {}, innerHTML: '', value: 'test', className: '',
          classList: { add() {}, remove() {} },
        });
        return elements.get(id);
      },
    },
    navigator: { mediaDevices: { getUserMedia() { requests++; return permission ? permission(stream) : Promise.resolve(stream); } } },
    window: { addEventListener() {}, AudioContext: class {
      constructor() { this.state = resumeError ? 'suspended' : 'running'; this.sampleRate = sampleRate; contexts.push(this); }
      resume() { return Promise.reject(new Error('resume failed')); }
      close() { this.state = 'closed'; return Promise.resolve(); }
      createMediaStreamSource() { return { connect() {} }; }
      createAnalyser() {
        return {
          fftSize: 2048, frequencyBinCount: 1024,
          getFloatTimeDomainData(data) { data.forEach((_, i) => { data[i] = i % 2 ? amplitude : -amplitude; }); },
          getFloatFrequencyData(data) {
            data.fill(-100);
            for (let i = 1; i < data.length; i++) {
              const hz = i * sampleRate / 2048;
              if (hz >= 60 && hz <= 600) data[i] = blowing ? -30 : -70;
              else if (hz > 600 && hz <= 8000) data[i] = blowing ? -55 : -75;
            }
          },
        };
      }
    } },
    performance: { now: () => now },
    requestAnimationFrame(fn) { const id = now + 1; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(fn) { timers.push(fn); },
  });
  vm.runInContext(detectorCode + '\n' + mainCode, context);
  const run = code => vm.runInContext(code, context);
  run('audio = { muted: false, play: () => Promise.resolve() }; cakeClickable = true; startFireworks = () => {}; stopFireworks = () => {}; transitionToScreen = () => {};');
  return {
    run, contexts, frames, events, timers,
    get requests() { return requests; },
    get stopped() { return stopped; },
    advance(duration, breathOn = false) {
      blowing = breathOn;
      amplitude = breathOn ? 0.12 : 0.004;
      for (let ms = 0; ms < duration; ms += 20) {
        now += 20;
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach(fn => fn());
      }
    },
  };
}

test('entering the cake screen never requests microphone permission automatically', () => {
  const page = app();
  page.run('checkPassword()');
  page.timers.splice(0).forEach(fn => fn());
  assert.equal(page.requests, 0);
  assert.equal(page.run('state.candlesBlown'), false);
});

for (const sampleRate of [44100, 48000]) {
  test(`microphone flow at ${sampleRate} Hz: ambient stays lit, sustained breath extinguishes and cleans up`, async () => {
    const page = app({ sampleRate });
    await page.run('initMicBlow()');
    assert.equal(page.run('audio.muted'), true);
    page.advance(6000);
    assert.equal(page.run('state.candlesBlown'), false);
    page.advance(300, true);
    assert.equal(page.run('state.candlesBlown'), false);
    page.advance(300, true);
    assert.equal(page.run('state.candlesBlown'), true);
    assert.equal(page.run('audio.muted'), false);
    assert.equal(page.stopped, 1);
    assert.equal(page.contexts[0].state, 'closed');
    assert.equal(page.frames.size, 0);
  });
}

test('duplicate starts share one request; cancelling a pending request stops its late stream', async () => {
  let resolve;
  const page = app({ permission: stream => new Promise(done => { resolve = () => done(stream); }) });
  const pending = page.run('initMicBlow()');
  await page.run('initMicBlow()');
  assert.equal(page.requests, 1);
  page.run('requestMicPermission()');
  resolve();
  await pending;
  assert.equal(page.stopped, 1);
  assert.equal(page.contexts.length, 0);
  assert.equal(page.run('audio.muted'), false);
});

test('clicking the cake while permission is pending remains valid and releases the late stream', async () => {
  let resolve;
  const page = app({ permission: stream => new Promise(done => { resolve = () => done(stream); }) });
  const pending = page.run('initMicBlow()');
  page.run('blowCandles()');
  resolve();
  await pending;
  assert.equal(page.run('state.candlesBlown'), true);
  assert.equal(page.stopped, 1);
  assert.equal(page.run('audio.muted'), false);
});

test('permission rejection and AudioContext resume failure restore music and keep click fallback', async () => {
  for (const options of [{ permission: () => Promise.reject(new Error('denied')) }, { resumeError: true }]) {
    const page = app(options);
    await page.run('initMicBlow()');
    assert.equal(page.run('audio.muted'), false);
    assert.equal(page.run('micListening || micStarting'), false);
    page.run('blowCandles()');
    assert.equal(page.run('state.candlesBlown'), true);
    if (options.resumeError) assert.equal(page.stopped, 1);
  }
});

test('hiding the page stops listening; restarting recalibrates and preserves preexisting mute', async () => {
  const page = app();
  page.run('audio.muted = true');
  await page.run('initMicBlow()');
  page.advance(2000);
  page.advance(300, true);
  page.run('document.hidden = true');
  page.events.visibilitychange();
  assert.equal(page.run('audio.muted'), true);
  assert.equal(page.frames.size, 0);
  page.run('document.hidden = false');
  await page.run('initMicBlow()');
  page.advance(500, true);
  assert.equal(page.run('state.candlesBlown'), false);
  page.run('stopMicBlow()');
  assert.equal(page.contexts.every(context => context.state === 'closed'), true);
});
