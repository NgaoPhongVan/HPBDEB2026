/* =====================================================
   HPBDEB2026 – script/index.js
   Dựa trên patrick-paul/happybirthday + mở rộng
   ===================================================== */

// ── Asset Preloader ──────────────────────────────────
let loadedAssets = 0;
const totalAssets = 2; // 1 image + 1 audio

function updateProgress() {
  loadedAssets++;
  const progress = (loadedAssets / totalAssets) * 100;
  document.getElementById("loadingProgress").style.width = progress + "%";
  document.getElementById("loadingText").textContent = `Đang tải... ${Math.round(progress)}%`;

  if (loadedAssets === totalAssets) {
    setTimeout(() => {
      document.getElementById("preloader").classList.add("loaded");
      document.getElementById("cardOverlay").classList.add("visible");
    }, 500);
  }
}

// Preload profile image
const preImg = new Image();
preImg.onload  = updateProgress;
preImg.onerror = updateProgress;
preImg.src = "./images/embebecamchao.jpeg";

// Preload audio
const audio = document.getElementById("bgMusic");
audio.addEventListener("canplaythrough", updateProgress, { once: true });
audio.addEventListener("error", updateProgress, { once: true });
audio.load();

// ── Main variables ────────────────────────────────────
const card           = document.getElementById("birthdayCard");
const cardOverlay    = document.getElementById("cardOverlay");
const openBtn        = document.getElementById("openBtn");
const timelineContainer = document.getElementById("timelineContainer");
const musicControl   = document.getElementById("musicControl");
const musicIcon      = document.getElementById("musicIcon");
const bgMusic        = audio;
const blowInstruction = document.getElementById("blowInstruction");
const blownMessage   = document.getElementById("blownMessage");
const cakeElement    = document.getElementById("cake");
const scrollWorld    = document.getElementById("scrollWorld");
const receiptNextBtn = document.getElementById("receiptNextBtn");

let musicPlaying = false;
let candlesBlown = false;
let candles = [];
let audioContext, analyser, microphone;
let tl = null;
let micStream = null;
let isListening = false;

// ── Card flip ─────────────────────────────────────────
card.addEventListener("click", function () {
  if (!card.classList.contains("opened")) {
    card.classList.add("opened");
  }
});

// ── Open button → start experience ───────────────────
openBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  cardOverlay.classList.add("hidden");

  setTimeout(() => {
    timelineContainer.classList.add("active");
    musicControl.style.display = "flex";

    bgMusic.currentTime = 0;
    bgMusic.play()
      .then(() => { musicPlaying = true; musicIcon.textContent = "🔊"; })
      .catch(() => console.log("Music autoplay blocked"));

    startBalloons();
    startConfetti();
    startFireworks();
    animationTimeline();
  }, 800);
});

// ── Music toggle ──────────────────────────────────────
musicControl.addEventListener("click", function () {
  if (musicPlaying) {
    bgMusic.pause();
    musicIcon.textContent = "🔇";
    musicPlaying = false;
  } else {
    bgMusic.play();
    musicIcon.textContent = "🔊";
    musicPlaying = true;
  }
});

// ── Create candles ────────────────────────────────────
function createCandles() {
  const positions = [
    { left: 80, top: -20 },
    { left: 125, top: -20 },
    { left: 170, top: -20 },
  ];
  positions.forEach((pos) => {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = pos.left + "px";
    candle.style.top  = pos.top + "px";
    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);
    cakeElement.appendChild(candle);
    candles.push(candle);
  });
}

// ── GSAP Main Timeline ────────────────────────────────
function animationTimeline() {
  const textBoxChars = document.querySelector(".hbd-chatbox");
  const hbd = document.querySelector(".wish-hbd");

  if (textBoxChars) {
    textBoxChars.innerHTML = `<span>${textBoxChars.innerHTML
      .split("").join("</span><span>")}</span>`;
  }
  if (hbd) {
    hbd.innerHTML = `<span>${hbd.innerHTML
      .split("").join("</span><span>")}</span>`;
  }

  const ideaIn  = { opacity: 0, y: -20, rotationX: 5,  skewX: "15deg" };
  const ideaOut = { opacity: 0, y:  20, rotationY: 5,  skewX: "-15deg" };

  tl = gsap.timeline();

  tl.to(".timeline-container", 0.6, { visibility: "visible" })
    .from(".section-one", 0.7, { opacity: 0, y: 10 })
    .from(".section-two", 0.4, { opacity: 0, y: 10 })
    .to(".section-one",  0.7, { opacity: 0, y: 10 }, "+=3")
    .to(".section-two",  0.7, { opacity: 0, y: 10 }, "-=1")
    .from(".section-three", 0.7, { opacity: 0, y: 10 })
    .to(".section-three",   0.7, { opacity: 0, y: 10 }, "+=2.5")
    .from(".section-four", 0.7, { scale: 0.2, opacity: 0 })
    .from(".fake-btn",     0.3, { scale: 1, opacity: 1 })
    .staggerTo(".hbd-chatbox span", 1.5, { visibility: "visible" }, 0.05)
    .to(".fake-btn", 0.1, {
      background: "linear-gradient(135deg, #FFD54F 0%, #FF4DA6 100%)",
      scale: 0.95, y: 2,
      boxShadow: "0 2px 5px rgba(255,77,166,0.4)",
      ease: "power2.inOut",
    }, "+=3.5")
    .to(".fake-btn", 0.2, {
      scale: 1, y: 0,
      boxShadow: "0 5px 15px rgba(255,77,166,0.4)",
      ease: "back.out(1.7)",
    }, "+=0.1")
    .to(".section-four", 0.5, { scale: 0.2, opacity: 0, y: -150 }, "+=1")
    .from(".idea-1", 0.7, ideaIn)
    .to(".idea-1",   0.7, ideaOut, "+=2")
    .from(".idea-2", 0.7, ideaIn)
    .to(".idea-2",   0.7, ideaOut, "+=2")
    .from(".idea-3", 0.7, ideaIn)
    .to(".idea-3 strong", 0.5, { scale: 1.2, x: 10, boxShadow: "0 10px 30px rgba(255,77,166,0.5)" })
    .to(".idea-3",   0.7, ideaOut, "+=2")
    .from(".idea-4", 0.7, ideaIn)
    .to(".idea-4",   0.7, ideaOut, "+=2")
    .from(".idea-5", 0.7, { rotationX: 15, rotationZ: -10, skewY: "-5deg", y: 50, z: 10, opacity: 0 }, "+=1")
    .to(".idea-5",   0.7, { scale: 0.2, opacity: 0 }, "+=2")
    .staggerFrom(".idea-6 span", 0.8, { scale: 3, opacity: 0, rotation: 15 }, 0.2)
    .staggerTo(".idea-6 span",   0.8, { scale: 3, opacity: 0, rotation: -15 }, 0.2, "+=1.5")
    .from(".section-six .profile-picture", 0.5, { scale: 3.5, opacity: 0, x: 25, y: -25, rotationZ: -45 })
    .from(".hat", 0.5, { x: -100, y: 350, rotation: -180, opacity: 0 })
    .staggerFrom(".wish-hbd span", 0.7, { opacity: 0, y: -50, rotation: 150, skewX: "30deg" }, 0.1)
    .staggerFromTo(".wish-hbd span", 0.7,
      { scale: 1.4, rotationY: 150 },
      { scale: 1,   rotationY: 0, color: "#FF4DA6" },
      0.1, "party"
    )
    .from(".wish h5", 0.5, { opacity: 0, y: 10, skewX: "-15deg" }, "party")
    .to(".section-six", 0.5, { opacity: 0, y: 30 }, "+=2")
    // ── Cake ──
    .from(".section-cake", 0.7, { opacity: 0, scale: 0.5 })
    .add(() => {
      createCandles();
      startMicrophoneDetection();
    })
    .to(".section-cake", 0.5, { opacity: 0 }, "+=8")
    // ── Love Receipt ──
    .add(() => showReceipt())
    // section-nine shown after receipt button click
  ;

  // Replay
  document.getElementById("replay").addEventListener("click", () => {
    candlesBlown = false;
    candles.forEach(c => c.classList.remove("out"));
    blowInstruction.style.display = "block";
    blownMessage.classList.remove("show");

    // Remove old candle elements
    candles = [];
    document.querySelectorAll(".candle").forEach(c => c.remove());

    // Reset section-nine
    gsap.set(".section-nine", { opacity: 0 });

    // Reset receipt
    const receiptSection = document.getElementById("sectionReceipt");
    receiptSection.style.display = "none";
    receiptSection.style.opacity = "1";
    receiptSection.style.transform = "";
    document.querySelectorAll(".receipt-item").forEach(el => el.classList.remove("visible"));

    // Reset section-six
    gsap.set(".section-six", { opacity: 1, y: 0 });

    // Hide scroll world, restore timeline mode
    scrollWorld.classList.remove("active");
    scrollWorld.style.display = "none";
    timelineContainer.style.display = "block";
    timelineContainer.style.opacity = "1";
    document.body.style.overflowY = "hidden";

    bgMusic.currentTime = 0;
    bgMusic.play()
      .then(() => { musicPlaying = true; musicIcon.textContent = "🔊"; })
      .catch(() => {});

    tl.restart();
  });
}

// ── Show Love Receipt ─────────────────────────────────
function showReceipt() {
  const receiptSection = document.getElementById("sectionReceipt");
  receiptSection.style.display = "flex";

  // Animate items in one by one
  const items = document.querySelectorAll(".receipt-item");
  items.forEach((item, i) => {
    setTimeout(() => item.classList.add("visible"), 200 + i * 120);
  });
}

// Receipt → proceed to section-nine (finale)
receiptNextBtn.addEventListener("click", () => {
  const receiptSection = document.getElementById("sectionReceipt");

  gsap.to(receiptSection, 0.5, {
    opacity: 0, y: -40,
    onComplete: () => {
      receiptSection.style.display = "none";
      // Show finale GSAP section
      gsap.to(".section-nine", 0.7, { opacity: 1 });
      gsap.from(".section-nine p", 0.7, {
        opacity: 0, y: 20, scale: 0.5,
        stagger: { amount: 1.2, from: "start" },
        clearProps: "all",
        onComplete: () => {
          // After reading finale, auto-transition to scroll world
          setTimeout(() => transitionToScrollWorld(), 4000);
        }
      });
    },
  });

  // Firework burst on click
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2));
    }, i * 350);
  }
});

// ── Transition to scroll world ────────────────────────
function transitionToScrollWorld() {
  gsap.to(".timeline-container", 1, {
    opacity: 0,
    onComplete: () => {
      timelineContainer.style.display = "none";
      document.body.style.overflowY = "hidden";
      scrollWorld.style.display = "block";
      scrollWorld.classList.add("active");
      document.body.style.overflowY = "auto";

      // Init scroll features
      initFloatingHearts();
      buildTimeline();
      buildGallery();
      buildQuiz();
      initScrollObserver();
    },
  });
}

// ══════════════════════════════════════════════════════
// SCROLL WORLD
// ══════════════════════════════════════════════════════

// ── Floating Hearts ───────────────────────────────────
function initFloatingHearts() {
  const container = document.getElementById("floatingHearts");
  const emojis = ["💕", "💖", "🌸", "✨", "💗", "💝", "🎀"];
  for (let i = 0; i < 16; i++) {
    const el = document.createElement("div");
    el.className = "fheart";
    el.textContent = emojis[i % emojis.length];
    el.style.left = Math.random() * 100 + "%";
    el.style.animationDelay = Math.random() * 8 + "s";
    el.style.animationDuration = (7 + Math.random() * 6) + "s";
    container.appendChild(el);
  }
}

// ── Build Timeline Cards ──────────────────────────────
function buildTimeline() {
  const container = document.getElementById("scrollTimeline");
  CONFIG.timeline.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "timeline-card";

    const emojiWrap = `
      <div class="timeline-emoji-wrap">
        <div class="timeline-emoji-circle">${item.emoji}</div>
      </div>`;

    const imgHtml = item.image
      ? `<img src="${item.image}" alt="${item.title}" class="timeline-img" onerror="this.style.display='none'" />`
      : "";

    const content = `
      <div class="timeline-content">
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-desc">${item.description}</div>
        ${imgHtml}
      </div>`;

    if (idx % 2 === 0) {
      card.innerHTML = `<div class="timeline-card-left">${content}</div>${emojiWrap}<div class="timeline-card-right"></div>`;
    } else {
      card.innerHTML = `<div class="timeline-card-left"></div>${emojiWrap}<div class="timeline-card-right">${content}</div>`;
    }

    container.appendChild(card);
  });
}

// ── Build Gallery ─────────────────────────────────────
const galleryImages = [
  { src: "./images/ghephinhjpg.jpg",     alt: "Kỷ niệm cùng nhau" },
  { src: "./images/embebeban.jpeg",       alt: "Em bé dễ thương" },
  { src: "./images/embebebangoai.jpeg",   alt: "Đi dạo" },
  { src: "./images/embebecamchao.jpeg",   alt: "Em bé cam chào" },
  { src: "./images/embebeslay.jpeg",      alt: "Em bé slay" },
  { src: "./images/embebeliuliu.jpeg",    alt: "Em bé liu liu" },
  { src: "./images/embebemam.jpeg",       alt: "Em bé ăn" },
  { src: "./images/mall1.jpg",            alt: "Đi mall" },
  { src: "./images/mall2.jpg",            alt: "Đi mall 2" },
  { src: "./images/samson.jpg",           alt: "Samson" },
  { src: "./images/tet.jpg",              alt: "Tết" },
  { src: "./images/totnghiep.jpg",        alt: "Tốt nghiệp" },
];

function buildGallery() {
  const grid = document.getElementById("galleryGrid");
  galleryImages.forEach(({ src, alt }) => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    const img = document.createElement("img");
    img.src = src; img.alt = alt;
    img.onerror = () => div.style.display = "none";
    div.appendChild(img);
    grid.appendChild(div);
  });
}

// ── Build Quiz ────────────────────────────────────────
let quizScore = 0;
let currentQ  = 0;

function buildQuiz() {
  const container = document.getElementById("quizContainer");
  container.innerHTML = "";

  CONFIG.quiz.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "quiz-card" + (idx === 0 ? " active" : "");
    card.id = `quiz-card-${idx}`;

    const progress = idx + 1;
    const pct = ((idx) / CONFIG.quiz.length * 100);

    card.innerHTML = `
      <div class="quiz-progress">Câu ${progress} / ${CONFIG.quiz.length}</div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <div class="quiz-question-text">${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `<button class="quiz-opt-btn" data-q="${idx}" data-i="${i}">${opt}</button>`).join("")}
      </div>
      <div class="quiz-explanation" id="quiz-exp-${idx}">${q.explanation}</div>
      <button class="quiz-next-btn" id="quiz-next-${idx}">
        ${idx < CONFIG.quiz.length - 1 ? "Câu tiếp theo →" : "Xem kết quả 🎉"}
      </button>
    `;
    container.appendChild(card);
  });

  // Attach events
  document.querySelectorAll(".quiz-opt-btn").forEach(btn => {
    btn.addEventListener("click", handleQuizAnswer);
  });
  document.querySelectorAll(".quiz-next-btn").forEach(btn => {
    btn.addEventListener("click", handleQuizNext);
  });

  document.getElementById("quizRestartBtn").addEventListener("click", () => {
    quizScore = 0; currentQ = 0;
    buildQuiz();
    document.getElementById("quizResult").style.display = "none";
    document.getElementById("quizContainer").style.display = "block";
  });
}

function handleQuizAnswer(e) {
  const btn  = e.currentTarget;
  const qIdx = parseInt(btn.dataset.q);
  const iIdx = parseInt(btn.dataset.i);
  const q    = CONFIG.quiz[qIdx];

  // Disable all options for this question
  document.querySelectorAll(`.quiz-opt-btn[data-q="${qIdx}"]`).forEach(b => {
    b.disabled = true;
    if (parseInt(b.dataset.i) === q.correct) b.classList.add("correct");
  });

  if (iIdx === q.correct) {
    btn.classList.add("correct");
    quizScore++;
  } else {
    btn.classList.add("wrong");
  }

  // Show explanation
  const exp = document.getElementById(`quiz-exp-${qIdx}`);
  if (exp) { exp.style.display = "block"; }

  // Show next button
  const nextBtn = document.getElementById(`quiz-next-${qIdx}`);
  if (nextBtn) { nextBtn.style.display = "block"; }
}

function handleQuizNext(e) {
  const nextBtn = e.currentTarget;
  const idx = parseInt(nextBtn.id.split("-").pop());

  // Hide current
  document.getElementById(`quiz-card-${idx}`).classList.remove("active");
  currentQ = idx + 1;

  if (currentQ < CONFIG.quiz.length) {
    document.getElementById(`quiz-card-${currentQ}`).classList.add("active");
  } else {
    // Show result
    document.getElementById("quizContainer").style.display = "none";
    showQuizResult();
  }
}

function showQuizResult() {
  const resultEl   = document.getElementById("quizResult");
  const emojiEl    = document.getElementById("quizResultEmoji");
  const titleEl    = document.getElementById("quizResultTitle");
  const msgEl      = document.getElementById("quizResultMsg");
  const total      = CONFIG.quiz.length;
  const pct        = Math.round((quizScore / total) * 100);

  let emoji, title, msg;
  if (pct === 100) {
    emoji = "🏆"; title = "Hoàn hảo tuyệt đối!";
    msg = `Em trả lời đúng hết ${total}/${total} câu! Em bé iu hiểu anh quá rồi nè 🥺💕`;
  } else if (pct >= 60) {
    emoji = "💕"; title = "Em bé giỏi lắm!";
    msg = `Em trả lời đúng ${quizScore}/${total} câu. Chúng mình hiểu nhau nhiều lắm rồi! 🌸`;
  } else {
    emoji = "😄"; title = "Thử lại nhé em bé!";
    msg = `Em trả lời đúng ${quizScore}/${total} câu. Chưa sao, chúng mình sẽ còn tạo thêm nhiều kỷ niệm! 💖`;
  }

  emojiEl.textContent = emoji;
  titleEl.textContent = title;
  msgEl.textContent   = msg;
  resultEl.style.display = "block";

  // Celebratory fireworks
  if (pct >= 80) {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createFirework(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.5
      ), i * 300);
    }
  }
}

// ── Intersection Observer (reveal on scroll) ──────────
function initScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".timeline-card, .gallery-item, .reveal-section").forEach(el => {
    observer.observe(el);
  });
}

// ══════════════════════════════════════════════════════
// MICROPHONE DETECTION
// ══════════════════════════════════════════════════════
function stopMicrophoneDetection() {
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
  if (audioContext) { audioContext.close(); audioContext = null; }
  isListening = false;
}

async function checkMicrophonePermission() {
  try {
    const p = await navigator.permissions.query({ name: "microphone" });
    return p.state === "granted";
  } catch { return false; }
}

async function startMicrophoneDetection() {
  if (candlesBlown || isListening) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setupClickFallback(); return;
  }
  const hasPerm = await checkMicrophonePermission();
  if (hasPerm) {
    requestMicPermission();
  } else {
    pauseExperience();
    showPermissionRequest();
  }
}

function pauseExperience() {
  if (tl && !tl.paused()) tl.pause();
  if (musicPlaying) { bgMusic.pause(); musicIcon.textContent = "🔇"; }
}

function resumeExperience() {
  if (tl && tl.paused()) tl.resume();
  if (musicPlaying) { bgMusic.play(); musicIcon.textContent = "🔊"; }
}

function showPermissionRequest() {
  blowInstruction.textContent = "🎤 Nhấn đây để bật mic nhé...";
  blowInstruction.style.animation = "pulse 2s infinite";
  blowInstruction.addEventListener("click", requestMicPermission, { once: true });
}

function requestMicPermission() {
  blowInstruction.textContent = "🎤 Đang xin quyền mic...";
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => { micStream = stream; setupAudioAnalysis(stream); resumeExperience(); })
    .catch(() => { setupClickFallback(); resumeExperience(); });
}

function setupClickFallback() {
  blowInstruction.textContent = "💡 Nhấn vào bánh để thổi nến! 💡";
  blowInstruction.style.animation = "pulse 2s infinite";
  cakeElement.addEventListener("click", blowCandles, { once: true });
}

function setupAudioAnalysis(stream) {
  blowInstruction.textContent = "🌬️ Thổi vào mic để thổi nến nhé! 🌬️";
  blowInstruction.style.animation = "pulse 2s infinite";
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 512;
    microphone.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    isListening = true;
    function detectBlow() {
      if (!isListening || candlesBlown) { stopMicrophoneDetection(); return; }
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      if ((sum / dataArray.length) > 35) { stopMicrophoneDetection(); blowCandles(); return; }
      requestAnimationFrame(detectBlow);
    }
    detectBlow();
  } catch (err) {
    stopMicrophoneDetection();
    setupClickFallback();
  }
}

function blowCandles() {
  if (candlesBlown) return;
  candlesBlown = true;
  stopMicrophoneDetection();
  candles.forEach((candle, i) => setTimeout(() => candle.classList.add("out"), i * 200));
  setTimeout(() => {
    blowInstruction.style.display = "none";
    blownMessage.classList.add("show");
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2));
      }, i * 400);
    }
  }, 800);
}

// ══════════════════════════════════════════════════════
// AMBIENT EFFECTS
// ══════════════════════════════════════════════════════

// Balloons
function startBalloons() {
  setInterval(() => {
    const b = document.createElement("div");
    b.className = "balloon";
    b.textContent = ["🎈", "🎀", "💕"][Math.floor(Math.random() * 3)];
    b.style.left = Math.random() * 100 + "%";
    b.style.animationDuration = (12 + Math.random() * 8) + "s";
    b.style.animationDelay = Math.random() * 3 + "s";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 15000);
  }, 1200);
}

// Confetti
function startConfetti() {
  const colors = ["#FF4DA6", "#FFD54F", "#00E5FF", "#a855f7", "#48c774"];
  setInterval(() => {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "%";
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = (3 + Math.random() * 2) + "s";
    c.style.animationDelay = Math.random() + "s";
    c.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }, 150);
}

// Fireworks
function createFirework(x, y) {
  const colors = ["#FF4DA6", "#FFD54F", "#00E5FF", "#a855f7"];
  for (let i = 0; i < 40; i++) {
    const f = document.createElement("div");
    f.className = "firework";
    f.style.left = x + "px";
    f.style.top  = y + "px";
    f.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / 40;
    const vel   = 2 + Math.random() * 3;
    document.body.appendChild(f);
    let px = x, py = y;
    let vx = Math.cos(angle) * vel;
    let vy = Math.sin(angle) * vel;
    const anim = setInterval(() => {
      vy += 0.15; px += vx; py += vy;
      f.style.left = px + "px";
      f.style.top  = py + "px";
      if (py > window.innerHeight) { clearInterval(anim); f.remove(); }
    }, 16);
  }
}

function startFireworks() {
  setInterval(() => {
    createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2));
  }, 2500);
}
