/* =====================================================
   HPBDEB2026 - COMPLETE SCRIPT
   Phase 1: happybirthday (patrick-paul) GSAP flow
   Phase 2: Love Receipt (Hóa đơn tình yêu)
   Phase 3: ThatDay (Gurkirat-Singh-bit) authentic scroll
   ===================================================== */
"use strict";

// ── State & Variables ──
let loadedAssets = 0;
const TOTAL_ASSETS = 2; // Profile picture + original hbd.mpeg audio

const preloader       = document.getElementById("preloader");
const loadingProgress = document.getElementById("loadingProgress");
const loadingText     = document.getElementById("loadingText");
const cardOverlay     = document.getElementById("cardOverlay");
const card            = document.getElementById("birthdayCard");
const openBtn         = document.getElementById("openBtn");
const skipIntroBtn    = document.getElementById("skipIntroBtn");

const tlContainer     = document.getElementById("timelineContainer");
const blowInstruction = document.getElementById("blowInstruction");
const blownMessage    = document.getElementById("blownMessage");
const cakeEl          = document.getElementById("cake");

const receiptOverlay  = document.getElementById("receiptOverlay");
const receiptNextBtn  = document.getElementById("receiptNextBtn");

const thatDayApp      = document.getElementById("thatDayApp");
const musicControl    = document.getElementById("musicControl");
const musicIcon       = document.getElementById("musicIcon");

const bgMusic         = document.getElementById("bgMusic");       // hbd.mpeg (original)
const thatDayMusic    = document.getElementById("thatDayMusic");  // Perfect_Ed-Sheeran.mp3

let currentAudio      = bgMusic;
let isMusicPlaying    = false;
let candlesBlown      = false;
let candles           = [];
let audioCtx, analyser, micSrc, micStream, isListening = false;
let micRequestPending = false;
let micSessionId = 0;
let micFrameId = null;
let waitingForCandles = false;
let tl = null;
let lenisInstance = null;

// Thêm class ban đầu cho body
document.body.classList.add("phase-hbd");

// ══════════════════════════════════════════════════════
// 1. PRELOADER
// ══════════════════════════════════════════════════════
function updatePreloader() {
  loadedAssets++;
  const pct = Math.min(100, Math.round((loadedAssets / TOTAL_ASSETS) * 100));
  loadingProgress.style.width = pct + "%";
  loadingText.textContent = `Đang tải... ${pct}%`;

  if (loadedAssets >= TOTAL_ASSETS) {
    setTimeout(() => {
      preloader.classList.add("loaded");
      cardOverlay.classList.add("visible");
    }, 500);
  }
}

// Preload profile image
const preImg = new Image();
preImg.onload = preImg.onerror = updatePreloader;
preImg.src = "./images/embebecamchao.jpeg";

// Preload original audio (hbd.mpeg)
bgMusic.addEventListener("canplaythrough", updatePreloader, { once: true });
bgMusic.addEventListener("error", updatePreloader, { once: true });
bgMusic.load();

// ══════════════════════════════════════════════════════
// 2. CARD FLIP (Sửa lỗi lật mặt)
// ══════════════════════════════════════════════════════
card.addEventListener("click", () => {
  if (!card.classList.contains("opened")) {
    card.classList.add("opened");
  }
});

// ══════════════════════════════════════════════════════
// 3. START BUTTON -> GSAP TIMELINE
// ══════════════════════════════════════════════════════
openBtn.addEventListener("click", (e) => startBirthday(e));
skipIntroBtn.addEventListener("click", (e) => startBirthday(e, true));

function startBirthday(e, skipIntro = false) {
  e.stopPropagation();
  if (openBtn.disabled) return;
  openBtn.disabled = true;
  skipIntroBtn.disabled = true;
  cardOverlay.classList.add("hidden");

  setTimeout(() => {
    if (!skipIntro) tlContainer.classList.add("active");
    musicControl.style.display = "flex";

    // Phát đúng bài nhạc hbd.mpeg của repo gốc
    currentAudio = bgMusic;
    bgMusic.currentTime = 0;
    bgMusic
      .play()
      .then(() => {
        isMusicPlaying = true;
        musicIcon.textContent = "🔊";
      })
      .catch(() => {
        console.log("Audio autoplay prevented by browser");
      });

    if (skipIntro) {
      openReceiptOverlay();
      return;
    }

    // Ambient effects
    startCelebrationEffects();

    // Chạy GSAP animation timeline
    initGsapTimeline();
  }, 800);
}

// Music toggle
musicControl.addEventListener("click", () => {
  // Keep speaker audio out of the microphone throughout the candle step.
  if (waitingForCandles) return;
  if (isMusicPlaying) {
    currentAudio.pause();
    musicIcon.textContent = "🔇";
    isMusicPlaying = false;
  } else {
    currentAudio.play();
    musicIcon.textContent = "🔊";
    isMusicPlaying = true;
  }
});

// ══════════════════════════════════════════════════════
// 4. GSAP ANIMATION TIMELINE (patrick-paul/happybirthday)
// ══════════════════════════════════════════════════════
function initGsapTimeline() {
  // Chuẩn hóa text chatbox
  const chatbox = document.querySelector(".hbd-chatbox");
  if (chatbox && !chatbox.dataset.splited) {
    chatbox.dataset.splited = "true";
    chatbox.innerHTML = chatbox.innerHTML
      .split("")
      .map((ch) => `<span>${ch}</span>`)
      .join("");
  }

  // Chuẩn hóa text wish-hbd: Tách từng ký tự để lật chuẩn 3D, không bị méo ngược
  const wishHbd = document.querySelector(".wish-hbd");
  if (wishHbd && !wishHbd.dataset.splited) {
    wishHbd.dataset.splited = "true";
    const text = wishHbd.textContent.trim();
    wishHbd.innerHTML = text
      .split("")
      .map((ch) => (ch === " " ? `<span class="hbd-char space">&nbsp;</span>` : `<span class="hbd-char">${ch}</span>`))
      .join("");
  }

  const ideaIn  = { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" };
  const ideaOut = { opacity: 0, y:  20, rotationY: 5, skewX: "-15deg" };

  tl = gsap.timeline();

  tl
    .to(".timeline-container", 0.6, { visibility: "visible" })
    .from(".section-one",   0.7, { opacity: 0, y: 10 })
    .from(".section-two",   0.4, { opacity: 0, y: 10 })
    .to(".section-one",     0.7, { opacity: 0, y: 10 }, "+=3")
    .to(".section-two",     0.7, { opacity: 0, y: 10 }, "-=1")
    .from(".section-three", 0.7, { opacity: 0, y: 10 })
    .to(".section-three",   0.7, { opacity: 0, y: 10 }, "+=2.5")
    .from(".section-four",  0.7, { scale: 0.2, opacity: 0 })
    .from(".fake-btn",      0.3, { scale: 1, opacity: 1 })
    .staggerTo(".hbd-chatbox span", 1.5, { visibility: "visible" }, 0.05)
    .to(".fake-btn", 0.1, {
      background: "linear-gradient(135deg, #FFD54F 0%, #FF4DA6 100%)",
      scale: 0.95,
      y: 2,
      boxShadow: "0 2px 5px rgba(255, 77, 166, 0.4)",
      ease: "power2.inOut",
    }, "+=3.5")
    .to(".fake-btn", 0.2, {
      scale: 1,
      y: 0,
      boxShadow: "0 5px 15px rgba(255, 77, 166, 0.4)",
      ease: "back.out(1.7)",
    }, "+=0.1")
    .to(".section-four", 0.5, { scale: 0.2, opacity: 0, y: -150 }, "+=1")
    .from(".idea-1", 0.7, ideaIn)
    .to(".idea-1",   0.7, ideaOut, "+=2")
    .from(".idea-2", 0.7, ideaIn)
    .to(".idea-2",   0.7, ideaOut, "+=2")
    .from(".idea-3", 0.7, ideaIn)
    .to(".idea-3 strong", 0.5, { scale: 1.2, x: 10, boxShadow: "0 10px 30px rgba(255, 77, 166, 0.5)" })
    .to(".idea-3",   0.7, ideaOut, "+=2")
    .from(".idea-4", 0.7, ideaIn)
    .to(".idea-4",   0.7, ideaOut, "+=2")
    .from(".idea-5", 0.7, { rotationX: 15, rotationZ: -10, skewY: "-5deg", y: 50, z: 10, opacity: 0 }, "+=1")
    .to(".idea-5",   0.7, { scale: 0.2, opacity: 0 }, "+=2")
    .staggerFrom(".idea-6 span", 0.8, { scale: 3, opacity: 0, rotation: 15 }, 0.2)
    .staggerTo(".idea-6 span",   0.8, { scale: 3, opacity: 0, rotation: -15 }, 0.2, "+=1.5")
    .from(".section-six .profile-picture", 0.5, { scale: 3.5, opacity: 0, x: 25, y: -25, rotationZ: -45 })
    .from(".hat", 0.5, { x: -100, y: 350, rotation: -180, opacity: 0 })
    // Animation lật chữ 3D mượt mà, đồng đều, không bị ngược
    .staggerFromTo(
      ".wish-hbd .hbd-char",
      0.6,
      {
        opacity: 0,
        y: -30,
        rotationY: 90,
        scale: 0.7,
      },
      {
        opacity: 1,
        y: 0,
        rotationY: 0,
        scale: 1,
        color: "#FF4DA6",
        ease: "back.out(1.8)",
      },
      0.05
    )
    .from(".wish h5", 0.5, { opacity: 0, y: 10, skewX: "-15deg" }, "-=0.2")
    .to(".section-six", 0.5, { opacity: 0, y: 30 }, "+=2.5")
    // Cake
    .from(".section-cake", 0.7, { opacity: 0, scale: 0.5 })
    .add(() => {
      // 1. Dừng ngay nhạc từ lúc bắt đầu hiện bánh kem để mic không bị bắt tiếng nhạc từ loa
      pauseMusicForCake();
      // 2. Tạm dừng timeline GSAP để đợi người dùng ước và thổi nến
      tl.pause();
      // 3. Tạo nến và bắt đầu lắng nghe thổi nến
      createCandles();
      startMicrophoneDetection();
    });
}

// Register once. The invisible replay section must never intercept cake taps.
document.getElementById("replay").addEventListener("click", replayAll);

// ══════════════════════════════════════════════════════
// 5. CAKE & CANDLE BLOW (Mic or click)
// ══════════════════════════════════════════════════════
let wasPlayingBeforeCake = false;

function pauseMusicForCake() {
  waitingForCandles = true;
  wasPlayingBeforeCake = isMusicPlaying;
  if (currentAudio) {
    currentAudio.pause();
  }
  isMusicPlaying = false;
  musicIcon.textContent = "🔇";
}

function resumeMusicAfterCandles() {
  if (wasPlayingBeforeCake && currentAudio) {
    // Tiếp tục phát tiếp từ đoạn đã tạm dừng, TUYỆT ĐỐI KHÔNG BẮT ĐẦU LẠI
    currentAudio.play().then(() => {
      isMusicPlaying = true;
      musicIcon.textContent = "🔊";
    }).catch(() => {});
  }
}

function createCandles() {
  if (candles.length > 0) return;
  const positions = [
    { left: 80,  top: -20 },
    { left: 125, top: -20 },
    { left: 170, top: -20 },
  ];
  positions.forEach((pos) => {
    const c = document.createElement("div");
    c.className = "candle";
    c.style.left = pos.left + "px";
    c.style.top  = pos.top + "px";
    const flame = document.createElement("div");
    flame.className = "flame";
    c.appendChild(flame);
    cakeEl.appendChild(c);
    candles.push(c);
  });
}

function stopMicrophoneDetection() {
  const micLevel = document.getElementById("micLevel");
  if (micLevel) micLevel.hidden = true;
  micSessionId++;
  micRequestPending = false;
  isListening = false;
  if (micFrameId !== null) cancelAnimationFrame(micFrameId);
  micFrameId = null;
  if (micSrc) micSrc.disconnect();
  micSrc = null;
  analyser = null;
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}

function showMicrophonePrompt(message) {
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  blowInstruction.textContent = message || (supported
    ? "🎤 Nhấn vào đây để bật mic, rồi thổi nến (hoặc nhấn vào bánh)!"
    : "💡 Nhấn vào bánh kem để thổi tắt nến! 💡");
  blowInstruction.disabled = !supported;
  blowInstruction.onclick = supported ? requestMicPermission : null;
  blowInstruction.style.animation = "pulse 2s infinite";
}

function startMicrophoneDetection() {
  if (candlesBlown || isListening || micRequestPending) return;
  setupClickFallback();
  // Saved browser permission is not intent to blow. Always wait for a gesture.
  showMicrophonePrompt();
}

async function requestMicPermission() {
  if (candlesBlown || isListening || micRequestPending || !waitingForCandles) return;
  const sessionId = ++micSessionId;
  micRequestPending = true;
  blowInstruction.disabled = true;
  blowInstruction.textContent = "🎤 Đang kết nối mic...";
  try {
    // Create/resume inside the button gesture for browsers with autoplay rules.
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();
    if (sessionId !== micSessionId) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    // Permission can resolve after a cake click, replay, or tab suspension.
    if (sessionId !== micSessionId || candlesBlown || !waitingForCandles) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    micStream = stream;
    micRequestPending = false;
    setupAudioAnalysis(stream, sessionId);
  } catch {
    if (sessionId !== micSessionId) return;
    stopMicrophoneDetection();
    showMicrophonePrompt("🎤 Chưa bật được mic. Nhấn để thử lại, hoặc nhấn vào bánh kem!");
  }
}

function setupClickFallback() {
  cakeEl.onclick = () => {
    blowCandles();
  };
}

function setupAudioAnalysis(stream, sessionId) {
  analyser = audioCtx.createAnalyser();
  micSrc   = audioCtx.createMediaStreamSource(stream);
  analyser.smoothingTimeConstant = 0;
  analyser.fftSize = 2048;
  micSrc.connect(analyser);

  const waveform = new Float32Array(analyser.fftSize);
  const spectrum = new Float32Array(analyser.frequencyBinCount);
  const detector = new CandleBlowDetector(audioCtx.sampleRate, analyser.fftSize);
  detector.reset(performance.now());
  isListening = true;
  blowInstruction.disabled = false;
  blowInstruction.onclick = () => {
    stopMicrophoneDetection();
    return requestMicPermission();
  };
  const micLevel = document.getElementById("micLevel");
  if (micLevel) micLevel.hidden = false;
  blowInstruction.textContent = "🎤 Giữ yên lặng khoảng 2 giây để mic đo tiếng nền...";

  stream.getTracks().forEach((track) => {
    track.onended = () => {
      if (sessionId !== micSessionId) return;
      stopMicrophoneDetection();
      showMicrophonePrompt("🎤 Mic đã ngắt. Nhấn để bật lại, hoặc nhấn vào bánh kem!");
    };
  });

  function detectBlow(now) {
    if (sessionId !== micSessionId || !isListening || candlesBlown) return;
    if (audioCtx.state !== "running") {
      stopMicrophoneDetection();
      showMicrophonePrompt("🎤 Mic bị tạm dừng. Nhấn để bật lại, hoặc nhấn vào bánh kem!");
      return;
    }
    analyser.getFloatTimeDomainData(waveform);
    analyser.getFloatFrequencyData(spectrum);
    const result = detector.update(now, waveform, spectrum);
    const micLevelBar = document.getElementById("micLevelBar");
    if (micLevelBar) micLevelBar.style.width = Math.round((result.level || 0) * 100) + "%";
    const instruction = result.calibrating
      ? "🎤 Giữ yên lặng khoảng 2 giây để mic đo tiếng nền..."
      : "🌬️ Sẵn sàng! Thổi gần mic khoảng nửa giây. Nhấn đây để đo lại.";
    if (blowInstruction.textContent !== instruction) blowInstruction.textContent = instruction;
    if (result.blown) {
      blowCandles();
      return;
    }
    micFrameId = requestAnimationFrame(detectBlow);
  }

  micFrameId = requestAnimationFrame(detectBlow);
}

// Stop hidden-page capture and invalidate pending permission requests.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && waitingForCandles) {
    stopMicrophoneDetection();
    showMicrophonePrompt();
  }
  if (document.hidden) clearCelebrationEffects();
  else if (celebrationActive) startCelebrationEffects();
});
window.addEventListener("pagehide", () => {
  stopMicrophoneDetection();
  stopCelebrationEffects();
});

function blowCandles() {
  if (candlesBlown || !waitingForCandles) return;
  candlesBlown = true;
  waitingForCandles = false;
  blowInstruction.onclick = null;
  stopMicrophoneDetection();

  // Tắt lần lượt từng cây nến
  candles.forEach((c, i) => {
    setTimeout(() => c.classList.add("out"), i * 200);
  });

  // Sau khi các cây nến tắt -> CHO NHẠC TRỞ LẠI NGAY (tiếp tục bài nhạc, không bắt đầu lại)
  setTimeout(() => {
    resumeMusicAfterCandles();
  }, 400);

  setTimeout(() => {
    blowInstruction.style.display = "none";
    blownMessage.classList.add("show");

    for (let i = 0; i < (useLightEffects() ? 3 : 5); i++) {
      scheduleCelebration(() => {
        createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2));
      }, i * 450);
    }

    // Sau khi hiện lời chúc và pháo hoa 4 giây -> fade out bánh kem -> mở Hóa Đơn Tình Yêu
    setTimeout(() => {
      gsap.to(".section-cake", {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          openReceiptOverlay();
        },
      });
    }, 4000);
  }, 800);
}

// ══════════════════════════════════════════════════
// 6. LOVE RECEIPT (HÓA ĐƠN TÌNH YÊU)
// ══════════════════════════════════════════════════
function openReceiptOverlay() {
  stopCelebrationEffects();
  receiptOverlay.style.display = "flex";

  // Animate các dòng hóa đơn xuất hiện lần lượt
  const rows = receiptOverlay.querySelectorAll(".receipt-row");
  rows.forEach((row, i) => {
    setTimeout(() => {
      row.classList.add("visible");
    }, 250 + i * 140);
  });
}

// Bấm nút chuyển sang phần ThatDay
receiptNextBtn.addEventListener("click", () => {
  // Fade out receipt overlay
  gsap.to(receiptOverlay, 0.6, {
    opacity: 0,
    y: -30,
    onComplete: () => {
      receiptOverlay.style.display = "none";
      transitionToThatDay();
    },
  });
});

// ══════════════════════════════════════════════════
// 7. TRANSITION SANG THATDAY (100% AUTHENTIC)
// ══════════════════════════════════════════════════
function transitionToThatDay() {
  stopCelebrationEffects();
  // Ẩn timeline container cũ
  tlContainer.style.display = "none";
  tlContainer.classList.remove("active");

  // Mở khóa thanh cuộn toàn bộ trang
  document.body.classList.remove("phase-hbd");
  document.body.classList.add("phase-thatday");
  document.documentElement.classList.add("phase-thatday");

  // Hiển thị ThatDay App
  thatDayApp.style.display = "block";
  window.scrollTo({ top: 0, behavior: "instant" });

  // Chuyển nhạc mượt mà sang Perfect (nếu user thích)
  if (isMusicPlaying) {
    // Fade out bgMusic
    gsap.to(bgMusic, {
      volume: 0,
      duration: 1.5,
      onComplete: () => {
        bgMusic.pause();
        currentAudio = thatDayMusic;
        thatDayMusic.volume = 1;
        thatDayMusic.currentTime = 0;
        thatDayMusic.play().catch(() => {});
      },
    });
  } else {
    currentAudio = thatDayMusic;
  }

  // Khởi tạo các thành phần ThatDay
  initLenisScroll();
  initThatDayParticles();
  initThatDayTimeline();
  initThatDayOrbitWords();
  initThatDayGallery();
  initThatDayQuiz();
  initThatDayModal();
  initThatDayScrollTriggers();
}

// ══════════════════════════════════════════════════
// 8. THATDAY: LENIS SMOOTH SCROLL
// ══════════════════════════════════════════════════
function initLenisScroll() {
  if (typeof Lenis === "undefined") {
    console.warn("Lenis library not loaded, using native scroll");
    return;
  }

  // Khởi tạo Lenis chuẩn xác như ThatDay
  const isTouch = "ontouchstart" in window || window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) {
    // Mobile dùng native momentum scroll mượt mà
    return;
  }

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Hỗ trợ anchor links cuộn êm
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          lenisInstance.scrollTo(targetEl, { offset: 0 });
        }
      }
    });
  });
}

// ══════════════════════════════════════════════════
// 9. THATDAY: FLOATING PARTICLES & TWINKLES
// ══════════════════════════════════════════════════
const TD_SYMBOLS = ["♥", "✦", "♡", "❋", "✧", "⋆", "❤", "✿", "❥"];
const TD_COLORS  = [
  "rgba(255, 170, 234, 0.16)",
  "rgba(99, 29, 118, 0.15)",
  "rgba(152, 193, 217, 0.14)",
  "rgba(234, 196, 53, 0.10)",
  "rgba(251, 77, 61, 0.10)",
];

function initThatDayParticles() {
  const container = document.getElementById("tdFloatingLayer");
  if (!container || container.children.length > 0) return;

  const isMobile = window.innerWidth < 640;
  const pCount = isMobile ? 8 : 16;
  const sCount = isMobile ? 12 : 24;

  for (let i = 0; i < pCount; i++) {
    const el = document.createElement("div");
    el.className = "td-particle-sym";
    el.textContent = TD_SYMBOLS[i % TD_SYMBOLS.length];
    el.style.left     = (2 + Math.random() * 96) + "%";
    el.style.fontSize = (9 + Math.random() * 14) + "px";
    el.style.color    = TD_COLORS[i % TD_COLORS.length];
    el.style.animationDuration = (14 + Math.random() * 12) + "s";
    el.style.animationDelay    = (Math.random() * 10) + "s";
    container.appendChild(el);
  }

  for (let i = 0; i < sCount; i++) {
    const s = document.createElement("div");
    s.className = "td-star-twinkle";
    const size = Math.random() > 0.5 ? 4 : 3;
    s.style.width  = size + "px";
    s.style.height = size + "px";
    s.style.left   = (2 + Math.random() * 96) + "%";
    s.style.top    = (2 + Math.random() * 96) + "%";
    s.style.animationDuration = (2.5 + Math.random() * 2.5) + "s";
    s.style.animationDelay    = (Math.random() * 6) + "s";
    container.appendChild(s);
  }
}

// ══════════════════════════════════════════════════
// 10. THATDAY: TIMELINE CARDS (FoldCard style)
// ══════════════════════════════════════════════════
function initThatDayTimeline() {
  const wrapper = document.getElementById("tdTimelineCards");
  if (!wrapper || wrapper.children.length > 0) return;

  CONFIG.timeline.forEach((item, index) => {
    const cardEl = document.createElement("div");
    const isLeft = index % 2 === 0;
    cardEl.className = `td-fold-card ${isLeft ? "card-left" : "card-right"}`;

    const imgBtn = item.image
      ? `<button type="button" class="td-card-img-btn" data-src="${item.image}" data-title="${item.title}">
           <img src="${item.image}" alt="${item.title}" class="td-card-img" loading="lazy" />
         </button>`
      : "";

    cardEl.innerHTML = `
      <div class="td-card-dot"></div>
      <div class="td-card-box">
        <div class="td-card-body">
          <div class="td-card-header">
            <span class="td-card-emoji">${item.emoji}</span>
            <span class="td-card-time">${item.date}</span>
            <span class="td-card-dot-sep">•</span>
            <span class="td-card-date">${item.date}</span>
          </div>
          <h3 class="td-card-title">${item.title}</h3>
          <p class="td-card-desc">${item.description}</p>
        </div>
        ${imgBtn}
      </div>
    `;

    // Click ảnh mở modal lightbox
    const btn = cardEl.querySelector(".td-card-img-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        openThatDayModal(btn.dataset.src, btn.dataset.title);
      });
    }

    wrapper.appendChild(cardEl);
  });
}

// ══════════════════════════════════════════════════
// 11. THATDAY: ORBIT WORDS (YOU & ME)
// ══════════════════════════════════════════════════
const TD_ORBIT_WORDS = [
  "forever",
  "em bé",
  "yêu em",
  "always",
  "together",
  "hạnh phúc",
  "yours",
  "trọn đời",
];

function initThatDayOrbitWords() {
  const container = document.getElementById("tdOrbitWords");
  if (!container || container.children.length > 0) return;

  const total = TD_ORBIT_WORDS.length;
  const radius = 42; // %

  TD_ORBIT_WORDS.forEach((word, i) => {
    const angle = (360 / total) * i;
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    const span = document.createElement("span");
    span.className = "td-orbit-word";
    span.textContent = word;
    span.style.transform = `translate(calc(-50% + ${x}%), calc(-50% + ${y}%))`;
    span.style.animationDuration = (4 + i * 0.5) + "s";
    span.style.animationDelay    = (i * 0.6) + "s";
    container.appendChild(span);
  });
}

// ══════════════════════════════════════════════════
// 12. THATDAY: GALLERY
// ══════════════════════════════════════════════════
const GALLERY_ITEMS = [
  { src: "./images/be.jpg",        	    title: "Ủa ai chòi" },
  { src: "./images/embebeban.jpeg",         title: "Gì bắn" },
  { src: "./images/embebebangoai.jpeg",     title: "Hehe" },
  { src: "./images/embebecamchao.jpeg",     title: "Oánh ta" },
  { src: "./images/embebeslay.jpeg",        title: "Gì mà sì lay" },
  { src: "./images/liuliu.jpg",             title: "Plè" },
  { src: "./images/embebemam.jpeg",         title: "Măm 3 tô cơm i chòi" },
  { src: "./images/nhinta.jpg",             title: "Gì nhìn ta" },
  { src: "./images/Cú Đấm Điện Quang Anime.png", title: "Bít cú đấm sấm sét của ta chưa" },
  { src: "./images/Nắm đấm điện lực dễ thương anime.png",           title: "Bít chưa" },
  { src: "./images/ngo.jpg",                title: "Gì mà ngó" },
  { src: "./images/nhinchamcham.jpg",       title: "Mắt to tròn nhìn chi" },
  { src: "./images/mattotron.jpg",    	    title: "Mắt to tròn đáng iu lun" },
  { src: "./images/acha.jpeg",    	    title: "À chá" },
  { src: "./images/mabanhbao.jpg",    	    title: "Má bánh bao của ai ta" },
  { src: "./images/ansuachua.jpeg",    	    title: "Ehehe phải mới ăn sữa chua hong" },
  { src: "./images/toctraitym.png",    	    title: "Tóc trái tym iu iu lun" },
  { src: "./images/yetso.jpg",              title: "Yét sơ" },
  { src: "./images/mungi.jpeg",             title: "Gì mún gì" },
  { src: "./images/matto.jpg",              title: "Mắt to miệng to chòi" },
  { src: "./images/dangiu.jpg",             title: "Ủa đáng iu em iu" },
];

function initThatDayGallery() {
  const grid = document.getElementById("tdGalleryGrid");
  if (!grid || grid.children.length > 0) return;

  GALLERY_ITEMS.forEach((item) => {
    const card = document.createElement("div");
    card.className = "td-gallery-item td-reveal";

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.title;
    img.loading = "lazy";
    img.onerror = () => { card.style.display = "none"; };

    card.appendChild(img);
    card.addEventListener("click", () => {
      openThatDayModal(item.src, item.title);
    });

    grid.appendChild(card);
  });
}

// ══════════════════════════════════════════════════
// 13. THATDAY: QUIZ SECTION
// ══════════════════════════════════════════════════
let quizIndex = 0;
let quizScore = 0;

function initThatDayQuiz() {
  quizIndex = 0;
  quizScore = 0;
  const box = document.getElementById("tdQuizBox");
  const resultBox = document.getElementById("tdQuizResult");
  box.innerHTML = "";
  box.style.display = "block";
  resultBox.style.display = "none";

  CONFIG.quiz.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "td-quiz-card" + (i === 0 ? " active" : "");
    card.id = `tdQuizCard-${i}`;

    const progressPct = ((i + 1) / CONFIG.quiz.length) * 100;

    const optionsHtml = q.options
      .map((opt, optIdx) => `<button type="button" class="td-quiz-opt" data-q="${i}" data-opt="${optIdx}">${opt}</button>`)
      .join("");

    card.innerHTML = `
      <div class="td-quiz-progress">CÂU HỎI ${i + 1} / ${CONFIG.quiz.length}</div>
      <div class="td-quiz-bar">
        <div class="td-quiz-bar-fill" style="width: ${progressPct}%"></div>
      </div>
      <h3 class="td-quiz-q">${q.question}</h3>
      <div class="td-quiz-options">
        ${optionsHtml}
      </div>
      <div class="td-quiz-exp" id="tdQuizExp-${i}">${q.explanation}</div>
      <button type="button" class="td-quiz-next" id="tdQuizNext-${i}">
        ${i < CONFIG.quiz.length - 1 ? "Câu tiếp theo →" : "Xem kết quả 🎉"}
      </button>
    `;
    box.appendChild(card);
  });

  // Attach event handlers
  box.querySelectorAll(".td-quiz-opt").forEach((btn) => {
    btn.addEventListener("click", handleQuizOptionClick);
  });
  box.querySelectorAll(".td-quiz-next").forEach((btn) => {
    btn.addEventListener("click", handleQuizNextClick);
  });
}

function handleQuizOptionClick(e) {
  const btn = e.currentTarget;
  const qIdx = parseInt(btn.dataset.q);
  const optIdx = parseInt(btn.dataset.opt);
  const qData = CONFIG.quiz[qIdx];

  const parent = document.getElementById(`tdQuizCard-${qIdx}`);
  const allBtns = parent.querySelectorAll(".td-quiz-opt");
  allBtns.forEach((b) => {
    b.disabled = true;
    if (parseInt(b.dataset.opt) === qData.correct) {
      b.classList.add("correct");
    }
  });

  if (optIdx === qData.correct) {
    btn.classList.add("correct");
    quizScore++;
  } else {
    btn.classList.add("wrong");
  }

  const exp = document.getElementById(`tdQuizExp-${qIdx}`);
  if (exp) exp.style.display = "block";

  const nextBtn = document.getElementById(`tdQuizNext-${qIdx}`);
  if (nextBtn) nextBtn.style.display = "block";
}

function handleQuizNextClick(e) {
  const btn = e.currentTarget;
  const qIdx = parseInt(btn.id.split("-").pop());
  const currentCard = document.getElementById(`tdQuizCard-${qIdx}`);
  currentCard.classList.remove("active");

  quizIndex = qIdx + 1;
  if (quizIndex < CONFIG.quiz.length) {
    const nextCard = document.getElementById(`tdQuizCard-${quizIndex}`);
    nextCard.classList.add("active");
  } else {
    // Show results
    showQuizResult();
  }
}

function showQuizResult() {
  const box = document.getElementById("tdQuizBox");
  const res = document.getElementById("tdQuizResult");
  box.style.display = "none";

  const total = CONFIG.quiz.length;
  let emoji = "💕";
  let title = "Em bé giỏi lắm!";
  let msg = `Em trả lời đúng ${quizScore}/${total} câu. Chúng mình thật sự hiểu nhau rất nhiều! 🥰`;

  if (quizScore === total) {
    emoji = "🏆 💖";
    title = "Tuyệt đối 100%!";
    msg = `Không sai câu nào cả (${quizScore}/${total})! Em bé iu nhớ rõ từng kỷ niệm của hai đứa, iu quá chòi! 🥺`;
  } else if (quizScore < 3) {
    emoji = "✨ 🌸";
    title = "Không sao hết nè!";
    msg = `Đúng ${quizScore}/${total} câu. Mỗi ngày bên nhau chúng mình sẽ cùng viết thêm thật nhiều kỷ niệm mới nha!`;
  }

  res.innerHTML = `
    <div class="td-result-emoji">${emoji}</div>
    <h3 class="td-result-title">${title}</h3>
    <p class="td-result-msg">${msg}</p>
    <button type="button" class="td-result-btn" id="tdQuizRestartBtn">Thử lại lần nữa 🔄</button>
  `;
  res.style.display = "block";

  document.getElementById("tdQuizRestartBtn").addEventListener("click", () => {
    initThatDayQuiz();
  });
}

// ══════════════════════════════════════════════════
// 14. THATDAY: IMAGE LIGHTBOX MODAL
// ══════════════════════════════════════════════════
const tdModal         = document.getElementById("tdModal");
const tdModalBackdrop = document.getElementById("tdModalBackdrop");
const tdModalImg      = document.getElementById("tdModalImg");
const tdModalCaption  = document.getElementById("tdModalCaption");

function initThatDayModal() {
  tdModalBackdrop.addEventListener("click", closeThatDayModal);
  tdModal.addEventListener("click", (e) => {
    if (e.target === tdModal || e.target === tdModalBackdrop) {
      closeThatDayModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tdModal.style.display !== "none") {
      closeThatDayModal();
    }
  });
}

function openThatDayModal(src, title) {
  tdModalImg.src = src;
  tdModalCaption.textContent = title || "";
  tdModal.style.display = "flex";
}

function closeThatDayModal() {
  tdModal.style.display = "none";
}

// ══════════════════════════════════════════════════
// 15. THATDAY: SCROLL TRIGGERS & PARALLAX
// ══════════════════════════════════════════════════
function initThatDayScrollTriggers() {
  const heroContent = document.getElementById("tdHeroContent");

  // Hero Parallax on Scroll (Framer Motion equivalent)
  window.addEventListener(
    "scroll",
    () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;

      if (scrollY <= windowHeight) {
        const progress = Math.min(1, Math.max(0, scrollY / (windowHeight * 0.8)));
        const opacity = 1 - progress;
        const scale   = 1 - progress * 0.05;
        const transY  = progress * 130;

        heroContent.style.opacity   = opacity;
        heroContent.style.transform = `translateY(${transY}px) scale(${scale})`;
      }
    },
    { passive: true }
  );

  // IntersectionObserver for FoldCards & Section Reveals
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");

          // Kích hoạt animated underline nếu có
          const underlines = entry.target.querySelectorAll(".td-underline");
          underlines.forEach((u) => u.classList.add("visible"));
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  document.querySelectorAll(".td-fold-card, .td-reveal").forEach((el) => {
    observer.observe(el);
  });
}

// ══════════════════════════════════════════════════
// 16. REPLAY ALL (Reset về Phase 1)
// ══════════════════════════════════════════════════
function replayAll(event) {
  if (event && (waitingForCandles || !candlesBlown)) return;
  stopMicrophoneDetection();
  waitingForCandles = false;
  blowInstruction.onclick = null;
  candlesBlown = false;
  candles.forEach((c) => c.classList.remove("out"));
  blowInstruction.style.display = "block";
  blownMessage.classList.remove("show");
  candles = [];
  document.querySelectorAll(".candle").forEach((c) => c.remove());

  // Reset Phase classes
  document.documentElement.classList.remove("phase-thatday");
  document.body.classList.remove("phase-thatday");
  document.body.classList.add("phase-hbd");

  // Reset overlays & containers
  thatDayApp.style.display = "none";
  receiptOverlay.style.display = "none";
  tlContainer.style.display = "block";
  tlContainer.classList.add("active");

  // Reset audio về hbd.mpeg
  if (thatDayMusic) thatDayMusic.pause();
  currentAudio = bgMusic;
  bgMusic.currentTime = 0;
  bgMusic.volume = 1;
  bgMusic.play().catch(() => {});
  isMusicPlaying = true;
  musicIcon.textContent = "🔊";

  // Restart GSAP timeline
  startCelebrationEffects();
  if (tl) {
    tl.restart();
  }
}

// ══════════════════════════════════════════════════
// 17. AMBIENT EFFECTS (Balloons, Confetti, Fireworks)
// ══════════════════════════════════════════════════
// One timer per emitter; particles use finite CSS animations, never JS frame loops.
let celebrationActive = false;
const celebrationTimers = new Set();
const celebrationEmitters = new Map();
const celebrationNodes = new Set();

function useLightEffects() {
  return window.innerWidth < 768 || !!window.matchMedia?.("(pointer: coarse)").matches;
}

function scheduleCelebration(callback, delay) {
  const id = setTimeout(() => {
    celebrationTimers.delete(id);
    if (celebrationActive && !document.hidden) callback();
  }, delay);
  celebrationTimers.add(id);
  return id;
}

function clearCelebrationEffects() {
  celebrationTimers.forEach((id) => clearTimeout(id));
  celebrationTimers.clear();
  celebrationEmitters.clear();
  celebrationNodes.forEach((node) => node.remove());
  celebrationNodes.clear();
}

function stopCelebrationEffects() {
  celebrationActive = false;
  clearCelebrationEffects();
}

function startCelebrationEffects() {
  celebrationActive = true;
  if (document.hidden || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  startBalloons();
  startConfetti();
  startFireworks();
}

function startCelebrationEmitter(name, delay, emit) {
  if (celebrationEmitters.has(name)) return;
  function tick() {
    emit();
    celebrationEmitters.set(name, scheduleCelebration(tick, delay));
  }
  celebrationEmitters.set(name, scheduleCelebration(tick, delay));
}

function addCelebrationNode(node, lifetime) {
  if (!celebrationActive || document.hidden ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      celebrationNodes.size >= (useLightEffects() ? 56 : 140)) return;
  celebrationNodes.add(node);
  document.body.appendChild(node);
  scheduleCelebration(() => {
    node.remove();
    celebrationNodes.delete(node);
  }, lifetime);
}

function startBalloons() {
  const emojis = ["🎈", "🎀", "💕", "🌸"];
  startCelebrationEmitter("balloons", useLightEffects() ? 3200 : 1800, () => {
    const b = document.createElement("div");
    b.className = "balloon";
    b.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    b.style.left = Math.random() * 100 + "%";
    const duration = 8000 + Math.random() * 2000;
    b.style.animationDuration = duration + "ms";
    addCelebrationNode(b, duration);
  });
}

function startConfetti() {
  const colors = ["#FF4DA6", "#FFD54F", "#00E5FF", "#a855f7", "#48c774", "#FFAAEA", "#EAC435"];
  startCelebrationEmitter("confetti", useLightEffects() ? 500 : 220, () => {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "%";
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    const duration = 2500 + Math.random() * 1000;
    c.style.animationDuration = duration + "ms";
    c.style.borderRadius     = Math.random() > 0.5 ? "50%" : "2px";
    addCelebrationNode(c, duration);
  });
}

function createFirework(x, y) {
  if (!celebrationActive || document.hidden ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#FF4DA6", "#FFD54F", "#00E5FF", "#a855f7", "#FFAAEA", "#EAC435", "#FB4D3D"];
  const count = useLightEffects() ? 14 : 28;
  const radius = useLightEffects() ? 90 : 150;
  for (let i = 0; i < count; i++) {
    const f = document.createElement("div");
    f.className = "firework";
    f.style.left = x + "px";
    f.style.top  = y + "px";
    f.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    const angle = (Math.PI * 2 * i) / count;
    const distance = radius * (0.5 + Math.random() * 0.5);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    f.style.setProperty("--burst-x-mid", dx * 0.6 + "px");
    f.style.setProperty("--burst-y-mid", dy * 0.6 + 12 + "px");
    f.style.setProperty("--burst-x", dx + "px");
    f.style.setProperty("--burst-y", dy + 65 + "px");
    addCelebrationNode(f, 1200);
  }
}

function startFireworks() {
  startCelebrationEmitter("fireworks", useLightEffects() ? 4000 : 2800, () => {
    createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2));
  });
}
