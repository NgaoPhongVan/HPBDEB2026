"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const detectorSource = fs.readFileSync(require.resolve("../script/blow-detector.js"), "utf8");
const source = fs.readFileSync(require.resolve("../script/index.js"), "utf8");

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function app({ getUserMedia = async () => stream(), supported = true } = {}) {
  const elements = new Map();
  const events = {};
  const frames = new Map();
  const timers = [];
  const contexts = [];
  let nextFrame = 0;
  function element() {
    const classes = new Set();
    return {
      style: {}, children: [], listeners: {}, currentTime: 42,
      classList: { add: (...names) => names.forEach(n => classes.add(n)),
        remove: (...names) => names.forEach(n => classes.delete(n)), contains: n => classes.has(n) },
      addEventListener(name, handler) { this.listeners[name] = handler; },
      appendChild(child) { this.children.push(child); },
      remove() {}, load() {},
      pause() { this.paused = true; },
      play() { this.paused = false; return Promise.resolve(); },
    };
  }
  const document = {
    hidden: false, body: element(), documentElement: element(),
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    createElement: element, querySelectorAll: () => [],
    addEventListener(name, handler) { events[name] = handler; },
  };
  class AudioContext {
    constructor() { this.sampleRate = 48000; this.state = "suspended"; contexts.push(this); }
    resume() { this.state = "running"; return Promise.resolve(); }
    close() { this.state = "closed"; return Promise.resolve(); }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createAnalyser() {
      this.analyser = {
        fftSize: 2048, frequencyBinCount: 1024, rms: 0.004,
        getFloatTimeDomainData(data) {
          data.forEach((_, i) => { data[i] = i % 2 ? this.rms : -this.rms; });
        },
        getFloatFrequencyData(data) {
          data.fill(-Infinity);
          for (let i = 2; i <= 42; i++) data[i] = -35;
        },
      };
      return this.analyser;
    }
  }
  const sandbox = vm.createContext({
    document, navigator: { mediaDevices: supported ? { getUserMedia } : undefined },
    window: { AudioContext, addEventListener(name, fn) { events[name] = fn; } },
    Image: class {}, console, performance: { now: () => 0 },
    requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(fn, delay) { timers.push({ fn, delay }); },
  });
  vm.runInContext(detectorSource, sandbox);
  vm.runInContext(source, sandbox);
  vm.runInContext(`globalThis.state = () => ({candlesBlown, isListening, micRequestPending,
    waitingForCandles, candles});`, sandbox);
  return {
    sandbox, elements, events, frames, timers, contexts, document,
    enterCake() { sandbox.pauseMusicForCake(); sandbox.createCandles(); sandbox.startMicrophoneDetection(); },
    frame(now) {
      const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn(now));
    },
  };
}

function stream() {
  const track = { stopped: false, stop() { this.stopped = true; } };
  return { getTracks: () => [track], track };
}

test("entering the cake step never automatically opens a previously permitted mic", () => {
  let requests = 0;
  const ui = app({ getUserMedia: async () => { requests++; return stream(); } });
  ui.enterCake();
  assert.equal(requests, 0);
  assert.equal(ui.contexts.length, 0);
  assert.equal(typeof ui.elements.get("blowInstruction").onclick, "function");
  assert.equal(ui.sandbox.state().candles.length, 3);
});

test("unsupported or denied mic still allows cake click; denied mic can be retried", async () => {
  for (const supported of [false, true]) {
    const ui = app({ supported, getUserMedia: async () => { throw Error("denied"); } });
    ui.enterCake();
    if (supported) {
      await ui.elements.get("blowInstruction").onclick();
      assert.equal(ui.sandbox.state().micRequestPending, false);
      assert.equal(ui.elements.get("blowInstruction").disabled, false);
    }
    ui.elements.get("cake").onclick();
    assert.equal(ui.sandbox.state().candlesBlown, true);
  }
});

test("duplicate mic requests are ignored and late permission after cake click is released", async () => {
  const pending = deferred();
  let requests = 0;
  const ui = app({ getUserMedia: () => { requests++; return pending.promise; } });
  ui.enterCake();
  const request = ui.sandbox.requestMicPermission();
  await Promise.resolve();
  await ui.sandbox.requestMicPermission();
  assert.equal(requests, 1);
  ui.elements.get("cake").onclick();
  const mic = stream(); pending.resolve(mic); await request;
  assert.equal(mic.track.stopped, true);
  assert.equal(ui.contexts[0].state, "closed");
  assert.equal(ui.frames.size, 0);
});

test("calibrated background leaves all candles lit; a sustained blow extinguishes all three", async () => {
  const mic = stream();
  const ui = app({ getUserMedia: async () => mic });
  vm.runInContext("isMusicPlaying = true", ui.sandbox);
  ui.enterCake();
  await ui.sandbox.requestMicPermission();
  for (let now = 0; now <= 6000; now += 20) ui.frame(now);
  assert.equal(ui.sandbox.state().candlesBlown, false);
  assert.equal(ui.sandbox.state().candles.every(c => !c.classList.contains("out")), true);
  ui.contexts[0].analyser.rms = 0.15;
  for (let now = 6020; now <= 6500; now += 20) ui.frame(now);
  assert.equal(ui.sandbox.state().candlesBlown, true);
  assert.equal(mic.track.stopped, true);
  assert.equal(ui.frames.size, 0);
  for (const timer of ui.timers.filter(t => t.delay <= 400)) timer.fn();
  assert.equal(ui.sandbox.state().candles.every(c => c.classList.contains("out")), true);
  assert.equal(ui.elements.get("bgMusic").currentTime, 42);
  assert.equal(ui.elements.get("bgMusic").paused, false);
});

test("music cannot be restarted through the music button while waiting for candles", () => {
  const ui = app(); ui.enterCake();
  ui.elements.get("musicControl").listeners.click();
  assert.equal(ui.elements.get("bgMusic").paused, true);
});

test("hiding the page closes active mic and requires another deliberate activation", async () => {
  const mic = stream(); const ui = app({ getUserMedia: async () => mic });
  ui.enterCake(); await ui.sandbox.requestMicPermission();
  ui.document.hidden = true; ui.events.visibilitychange();
  assert.equal(mic.track.stopped, true);
  assert.equal(ui.frames.size, 0);
  assert.equal(ui.sandbox.state().isListening, false);
  assert.equal(ui.elements.get("blowInstruction").disabled, false);
  assert.equal(ui.sandbox.state().candlesBlown, false);
});

test("permission resolving after replay cannot capture audio in the restarted page", async () => {
  const pending = deferred(); const requested = deferred();
  const ui = app({ getUserMedia: () => { requested.resolve(); return pending.promise; } });
  ui.enterCake(); const request = ui.sandbox.requestMicPermission();
  await requested.promise; ui.sandbox.replayAll();
  const mic = stream(); pending.resolve(mic); await request;
  assert.equal(mic.track.stopped, true);
  assert.equal(ui.sandbox.state().isListening, false);
  assert.equal(ui.sandbox.state().waitingForCandles, false);
});

test("unplugged mic stops analysis and restores the retry prompt", async () => {
  const mic = stream(); const ui = app({ getUserMedia: async () => mic });
  ui.enterCake(); await ui.sandbox.requestMicPermission(); mic.track.onended();
  assert.equal(ui.frames.size, 0);
  assert.equal(ui.sandbox.state().isListening, false);
  assert.equal(ui.elements.get("blowInstruction").disabled, false);
});

test("audio interruption stops analysis instead of reusing stale microphone samples", async () => {
  const mic = stream(); const ui = app({ getUserMedia: async () => mic });
  ui.enterCake(); await ui.sandbox.requestMicPermission();
  ui.contexts[0].state = "suspended"; ui.frame(20);
  assert.equal(mic.track.stopped, true);
  assert.equal(ui.frames.size, 0);
  assert.equal(ui.sandbox.state().candlesBlown, false);
  assert.equal(ui.elements.get("blowInstruction").disabled, false);
});
