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
openBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  cardOverlay.classList.add("hidden");

  setTimeout(() => {
    tlContainer.classList.add("active");
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

    // Ambient effects
    startBalloons();
    startConfetti();
    startFireworks();

    // Chạy GSAP animation timeline
    initGsapTimeline();
  }, 800);
});

// Music toggle
musicControl.addEventListener("click", () => {
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

  // Replay
  document.getElementById("replay").addEventListener("click", replayAll);
}

// ══════════════════════════════════════════════════════
// 5. CAKE & CANDLE BLOW (Mic or click)
// ══════════════════════════════════════════════════════
let wasPlayingBeforeCake = false;

function pauseMusicForCake() {
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
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  isListening = false;
}

function startMicrophoneDetection() {
  if (candlesBlown || isListening) return;

  // Luôn luôn gắn click fallback vào bánh kem để click là thổi tắt nến
  setupClickFallback();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return;
  }

  // Nhạc đã dừng sẵn từ lúc bánh kem hiện ra, không gian yên tĩnh
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "microphone" })
      .then((perm) => {
        if (perm.state === "granted") {
          requestMicPermission();
        } else {
          blowInstruction.textContent = "🎤 Nhấn vào đây để bật mic thổi nến (hoặc click vào bánh)...";
          blowInstruction.style.animation = "pulse 2s infinite";
          blowInstruction.addEventListener("click", requestMicPermission, { once: true });
        }
      })
      .catch(() => {
        requestMicPermission();
      });
  } else {
    requestMicPermission();
  }
}

function requestMicPermission() {
  blowInstruction.textContent = "🎤 Đang kết nối mic...";
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      micStream = stream;
      setupAudioAnalysis(stream);
    })
    .catch(() => {
      blowInstruction.textContent = "💡 Nhấn vào bánh kem để thổi tắt nến! 💡";
    });
}

function setupClickFallback() {
  cakeEl.onclick = () => {
    blowCandles();
  };
}

function setupAudioAnalysis(stream) {
  blowInstruction.textContent = "🌬️ Thổi vào mic để thổi tắt nến nhé! 🌬️";
  blowInstruction.style.animation = "pulse 2s infinite";

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    micSrc   = audioCtx.createMediaStreamSource(stream);
    analyser.smoothingTimeConstant = 0.5;
    analyser.fftSize = 512;
    micSrc.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    isListening = true;

    // Đợi 500ms để mic ổn định, tránh tiếng pop/click lúc vừa kích hoạt mic
    let readyToDetect = false;
    setTimeout(() => { readyToDetect = true; }, 500);

    let consecutiveBlowCount = 0;

    function detectBlow() {
      if (!isListening || candlesBlown) {
        stopMicrophoneDetection();
        return;
      }

      if (readyToDetect) {
        analyser.getByteFrequencyData(dataArray);

        // Tiếng thổi hơi gió vào mic tạo ra dao động mạnh ở dải tần số thấp (low frequencies)
        let lowSum = 0;
        for (let i = 0; i < 15; i++) lowSum += dataArray[i];
        const lowAvg = lowSum / 15;

        let totalSum = 0;
        for (let i = 0; i < dataArray.length; i++) totalSum += dataArray[i];
        const totalAvg = totalSum / dataArray.length;

        // Ngưỡng phát hiện tiếng thổi: lowAvg > 50 hoặc totalAvg > 42
        if (lowAvg > 50 || totalAvg > 42) {
          consecutiveBlowCount++;
          // Cần liên tiếp 3 frame (khoảng 50ms) để chắc chắn là tiếng thổi thật, không phải click chuột
          if (consecutiveBlowCount >= 3) {
            stopMicrophoneDetection();
            blowCandles();
            return;
          }
        } else {
          consecutiveBlowCount = Math.max(0, consecutiveBlowCount - 1);
        }
      }

      requestAnimationFrame(detectBlow);
    }

    detectBlow();
  } catch {
    stopMicrophoneDetection();
  }
}

function blowCandles() {
  if (candlesBlown) return;
  candlesBlown = true;
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

    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2));
      }, i * 350);
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

  // Pháo hoa ăn mừng
  for (let i = 0; i < 7; i++) {
    setTimeout(() => {
      createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight * 0.5));
    }, i * 300);
  }
});

// ══════════════════════════════════════════════════
// 7. TRANSITION SANG THATDAY (100% AUTHENTIC)
// ══════════════════════════════════════════════════
function transitionToThatDay() {
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
  { src: "./images/ghephinhjpg.jpg",       title: "Bức hình kỷ niệm ngọt ngào" },
  { src: "./images/embebeban.jpeg",         title: "Em bé lúc nào cũng đáng yêu" },
  { src: "./images/embebebangoai.jpeg",     title: "Đi chơi dạo mát cùng em bé" },
  { src: "./images/embebecamchao.jpeg",     title: "Em bé cầm chảo cute xỉu" },
  { src: "./images/embebeslay.jpeg",        title: "Em bé slay hết nấc ✨" },
  { src: "./images/embebeliuliu.jpeg",      title: "Em bé liu liu nghịch ngợm" },
  { src: "./images/embebemam.jpeg",         title: "Em bé măm măm ngon miệng" },
  { src: "./images/mall1.jpg",              title: "Buổi đi mall đầu tiên" },
  { src: "./images/mall2.jpg",              title: "Hẹn hò dạo phố cùng nhau" },
  { src: "./images/samson.jpg",             title: "Bé mèo Samson dễ thương" },
  { src: "./images/tet.jpg",                title: "Tết ấm áp bên em bé" },
  { src: "./images/totnghiep.jpg",          title: "Tự hào ngày em tốt nghiệp" },
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
    msg = `Không sai câu nào cả (${quizScore}/${total})! Em bé iu nhớ rõ từng kỷ niệm của hai đứa, anh thương em lắm! 🥺`;
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
function replayAll() {
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
  if (tl) {
    tl.restart();
  }
}

// ══════════════════════════════════════════════════
// 17. AMBIENT EFFECTS (Balloons, Confetti, Fireworks)
// ══════════════════════════════════════════════════
function startBalloons() {
  const emojis = ["🎈", "🎀", "💕", "🌸"];
  setInterval(() => {
    const b = document.createElement("div");
    b.className = "balloon";
    b.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    b.style.left = Math.random() * 100 + "%";
    b.style.animationDuration = 12 + Math.random() * 8 + "s";
    b.style.animationDelay    = Math.random() * 2 + "s";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 16000);
  }, 1400);
}

function startConfetti() {
  const colors = ["#FF4DA6", "#FFD54F", "#00E5FF", "#a855f7", "#48c774", "#FFAAEA", "#EAC435"];
  setInterval(() => {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "%";
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = 3 + Math.random() * 2 + "s";
    c.style.animationDelay    = Math.random() + "s";
    c.style.borderRadius     = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }, 160);
}

function createFirework(x, y) {
  const colors = ["#FF4DA6", "#FFD54F", "#00E5FF", "#a855f7", "#FFAAEA", "#EAC435", "#FB4D3D"];
  for (let i = 0; i < 36; i++) {
    const f = document.createElement("div");
    f.className = "firework";
    f.style.left = x + "px";
    f.style.top  = y + "px";
    f.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    const angle = (Math.PI * 2 * i) / 36;
    const vel   = 2 + Math.random() * 3.5;
    document.body.appendChild(f);

    let px = x;
    let py = y;
    let vx = Math.cos(angle) * vel;
    let vy = Math.sin(angle) * vel;

    const anim = setInterval(() => {
      vy += 0.14;
      px += vx;
      py += vy;
      f.style.left = px + "px";
      f.style.top  = py + "px";

      if (py > window.innerHeight) {
        clearInterval(anim);
        f.remove();
      }
    }, 16);
  }
}

function startFireworks() {
  setInterval(() => {
    createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2));
  }, 2600);
}
