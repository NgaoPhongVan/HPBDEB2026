"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require.resolve("../script/index.js"), "utf8");

function app({ width = 390, touch = true, reducedMotion = false } = {}) {
  let clock = 0;
  let nextTimer = 0;
  const timers = new Map();
  const nodes = new Set();
  const elements = new Map();
  const events = {};
  function element() {
    const classes = new Set();
    return {
      style: { setProperty(name, value) { this[name] = value; } },
      children: [],
      classList: {
        add: (...names) => names.forEach(n => classes.add(n)),
        remove: (...names) => names.forEach(n => classes.delete(n)),
        contains: name => classes.has(name),
      },
      addEventListener() {}, querySelectorAll: () => [],
      appendChild(node) { nodes.add(node); },
      remove() { nodes.delete(this); },
      load() {}, pause() {}, play: () => Promise.resolve(),
    };
  }
  const document = {
    hidden: false, body: element(), documentElement: element(),
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    createElement: element, querySelectorAll: () => [],
    addEventListener(name, fn) { events[name] = fn; },
  };
  const sandbox = vm.createContext({
    document, navigator: {}, Image: class {}, console,
    window: {
      innerWidth: width, innerHeight: 844,
      matchMedia: query => ({ matches: query.includes("reduced-motion") ? reducedMotion : touch }),
      addEventListener(name, fn) { events[name] = fn; },
    },
    setTimeout(fn, delay) {
      const id = ++nextTimer;
      timers.set(id, { fn, due: clock + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    setInterval() { assert.fail("Particles must not create recurring JS frame timers"); },
  });
  vm.runInContext(source, sandbox);
  function advance(ms, stalled = false) {
    const until = clock + ms;
    if (stalled) clock = until;
    for (;;) {
      const entry = [...timers].sort((a, b) => a[1].due - b[1].due)[0];
      if (!entry || entry[1].due > until) break;
      timers.delete(entry[0]);
      if (!stalled) clock = entry[1].due;
      entry[1].fn();
    }
    clock = until;
  }
  return { sandbox, document, nodes, timers, events, advance };
}

test("a burst expires by elapsed time even after a long main-thread stall", () => {
  for (const touch of [true, false]) {
    const ui = app({ width: 1024, touch });
    vm.runInContext("celebrationActive = true; createFirework(100, 100)", ui.sandbox);
    assert.equal(ui.nodes.size, touch ? 14 : 28);
    ui.advance(10000, true);
    assert.equal(ui.nodes.size, 0);
    assert.equal(ui.timers.size, 0);
  }
});

test("mobile effects stay bounded through a long birthday sequence and burst spam", () => {
  const ui = app();
  for (let second = 0; second < 300; second++) {
    // Calling start repeatedly must not multiply the three emitters.
    ui.sandbox.startCelebrationEffects();
    for (let burst = 0; burst < 5; burst++) ui.sandbox.createFirework(100, 100);
    assert.ok(ui.nodes.size <= 56);
    assert.ok(ui.timers.size <= 59);
    ui.advance(1000);
  }
  ui.sandbox.openReceiptOverlay();
  assert.equal(ui.nodes.size, 0);
  assert.equal(ui.timers.size, 0);
  ui.advance(60000);
  ui.sandbox.createFirework(100, 100);
  assert.equal(ui.nodes.size, 0, "old celebration cannot leak into later chapters");
});

test("hidden pages release effects and resume only during the birthday phase", () => {
  const ui = app();
  ui.sandbox.startCelebrationEffects();
  ui.advance(5000);
  assert.ok(ui.nodes.size > 0);
  ui.document.hidden = true;
  ui.events.visibilitychange();
  assert.equal(ui.nodes.size, 0);
  assert.equal(ui.timers.size, 0);
  ui.advance(30000);
  ui.document.hidden = false;
  ui.events.visibilitychange();
  assert.equal(ui.timers.size, 3);
  ui.sandbox.openReceiptOverlay();
  ui.document.hidden = true; ui.events.visibilitychange();
  ui.document.hidden = false; ui.events.visibilitychange();
  assert.equal(ui.timers.size, 0);
});

test("replay restarts emitters once; leaving the page cancels all work", () => {
  const ui = app();
  ui.sandbox.startCelebrationEffects();
  ui.advance(1000);
  ui.sandbox.openReceiptOverlay();
  ui.sandbox.replayAll();
  assert.equal(ui.timers.size, 3);
  ui.advance(5000);
  assert.ok(ui.nodes.size > 0);
  ui.events.pagehide();
  assert.equal(ui.nodes.size, 0);
  assert.equal(ui.timers.size, 0);
});

test("reduced motion skips emitters and celebration bursts", () => {
  const ui = app({ reducedMotion: true });
  ui.sandbox.startCelebrationEffects();
  ui.sandbox.createFirework(100, 100);
  ui.advance(60000);
  assert.equal(ui.nodes.size, 0);
  assert.equal(ui.timers.size, 0);
});
