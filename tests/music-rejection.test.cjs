"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const CandleBlowDetector = require("../script/blow-detector.js");
const { analyse } = require("./audio-signals.cjs");
const ffmpegAvailable = spawnSync("ffmpeg", ["-version"], { windowsHide: true }).status === 0;

// Optional recording regressions: no browser or audio hardware required.
// Check actual PCM and spectra of music present while room noise is measured.
for (const [file, offsets] of [["hbd.mpeg", [0, 30, 60]], ["Perfect_Ed-Sheeran.mp3", [0, 60, 120]]]) {
  for (const offset of offsets) {
    test(`music stays lit: ${file}, ${offset}..${offset + 20}s`, { skip: !ffmpegAvailable }, () => {
      const decoded = spawnSync("ffmpeg", ["-v", "error", "-ss", String(offset),
        "-i", path.join(__dirname, "../music", file), "-t", "20", "-ac", "1", "-ar", "48000",
        "-f", "f32le", "-"], { windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
      assert.equal(decoded.status, 0, decoded.stderr?.toString());
      const pcm = Float32Array.from({ length: decoded.stdout.length / 4 }, (_, i) => decoded.stdout.readFloatLE(i * 4));
      const calibrated = new CandleBlowDetector(48000, 2048);
      for (let start = 0; start + 2048 <= pcm.length; start += 960) {
        const waveform = pcm.subarray(start, start + 2048);
        const spectrum = analyse(waveform);
        const now = start / 48;
        assert.equal(calibrated.update(now, waveform, spectrum).blown, false, `calibrated at ${now} ms`);
      }
    });
  }
}
