/* =====================================================
   HPBDEB2026 – script/index.js   (complete rewrite)
   happybirthday GSAP flow + ThatDay scroll aesthetic
   ===================================================== */
"use strict";

// ══════════════════════════════════════════════════════
// ASSET PRELOADER
// ══════════════════════════════════════════════════════
let loadedAssets = 0;
const TOTAL_ASSETS = 2; // profile image + audio

function updateProgress() {
  loadedAssets++;
  const pct = (loadedAssets / TOTAL_ASSETS) * 100;
  document.getElementById("loadingProgress").style.width = pct + "%";
  document.getElementById("loadingText").textContent = `Đang tải... ${Math.round(pct)}%`;
  if (loadedAssets >= TOTAL_ASSETS) {
    setTimeout(() => {
      document.getElementById("preloader").classList.add("loaded");
      document.getElementById("cardOverlay").classList.add("visible");
    }, 500);
  }
}

const preImg = new Image();
preImg.onload = preImg.onerror = updateProgress;
preImg.src = "./images/embebecamchao.jpeg";

const bgMusic = document.getElementById("bgMusic");
bgMusic.addEventListener("canplaythrough", updateProgress, { once: true });
bgMusic.addEventListener("error", updateProgress, { once: true });
bgMusic.load();

// ══════════════════════════════════════════════════════
// DOM REFS
// ══════════════════════════════════════════════════════
const card            = document.getElementById("birthdayCard");
const cardOverlay     = document.getElementById("cardOverlay");
const openBtn         = document.getElementById("openBtn");
const tlContainer     = document.getElementById("timelineContainer");
const musicControl    = document.getElementById("musicControl");
const musicIcon       = document.getElementById("musicIcon");
const blowInstruction = document.getElementById("blowInstruction");
const blownMessage    = document.getElementById("blownMessage");
const cakeEl          = document.getElementById("cake");
const sectionReceipt  = document.getElementById("sectionReceipt");
const receiptNextBtn  = document.getElementById("receiptNextBtn");
const scrollWorld     = document.getElementById("scrollWorld");
const imgModal        = document.getElementById("imgModal");
const imgModalBg      = document.getElementById("imgModalBg");
const imgModalClose   = document.getElementById("imgModalClose");
const imgModalImg     = document.getElementById("imgModalImg");

// ── State ──
let musicPlaying = false;
let candlesBlown = false;
let candles = [];
let audioCtx, analyser, micSrc, micStream, isListening = false;
let tl = null;

// ══════════════════════════════════════════════════════
// CARD FLIP  (fix: check class before flipping)
// ══════════════════════════════════════════════════════
card.addEventListener("click", () => {
  if (!card.classList.contains("opened")) card.classList.add("opened");
});

// ══════════════════════════════════════════════════════
// OPEN BUTTON → start experience
// ══════════════════════════════════════════════════════
openBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  cardOverlay.classList.add("hidden");

  setTimeout(() => {
    tlContainer.classList.add("active");
    musicControl.style.display = "flex";

    // ── AUDIO: exactly like happybirthday ──
    // Play once from start, no loop on opening sequence
    bgMusic.loop = false;
    bgMusic.currentTime = 0;
    bgMusic.play()
      .then(() => { musicPlaying = true; musicIcon.textContent = "🔊"; })
      .catch(() => { /* autoplay blocked */ });

    // When song ends, replay softly (loop)
    bgMusic.addEventListener("ended", () => {
      bgMusic.currentTime = 0;
      bgMusic.play().catch(() => {});
    }, { once: false });

    startBalloons();
    startConfetti();
    startFireworks();
    runAnimationTimeline();
  }, 800);
});

// ── Music toggle ──
musicControl.addEventListener("click", () => {
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

// ══════════════════════════════════════════════════════
// GSAP ANIMATION TIMELINE (happybirthday flow)
// ══════════════════════════════════════════════════════
function runAnimationTimeline() {
  // Split chatbox + wish into spans for letter-by-letter
  const chatbox = document.querySelector(".hbd-chatbox");
  const wishHbd = document.querySelector(".wish-hbd");
  if (chatbox) {
    chatbox.innerHTML = "<span>" + chatbox.innerHTML.split("").join("</span><span>") + "</span>";
  }
  if (wishHbd) {
    wishHbd.innerHTML = "<span>" + wishHbd.innerHTML.split("").join("</span><span>") + "</span>";
  }

  const ideaIn  = { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" };
  const ideaOut = { opacity: 0, y:  20, rotationY: 5, skewX: "-15deg" };

  tl = gsap.timeline();

  tl
    .to(".timeline-container", 0.6, { visibility: "visible" })
    .from(".section-one",  0.7, { opacity: 0, y: 10 })
    .from(".section-two",  0.4, { opacity: 0, y: 10 })
    .to(".section-one",    0.7, { opacity: 0, y: 10 }, "+=3")
    .to(".section-two",    0.7, { opacity: 0, y: 10 }, "-=1")
    .from(".section-three",0.7, { opacity: 0, y: 10 })
    .to(".section-three",  0.7, { opacity: 0, y: 10 }, "+=2.5")
    .from(".section-four", 0.7, { scale: 0.2, opacity: 0 })
    .from(".fake-btn",     0.3, { scale: 1, opacity: 1 })
    .staggerTo(".hbd-chatbox span", 1.5, { visibility: "visible" }, 0.05)
    .to(".fake-btn", 0.1, {
      background: "linear-gradient(135deg,#FFD54F,#FF4DA6)",
      scale: 0.95, y: 2,
      boxShadow: "0 2px 5px rgba(255,77,166,.4)",
      ease: "power2.inOut",
    }, "+=3.5")
    .to(".fake-btn", 0.2, { scale: 1, y: 0, boxShadow: "0 5px 15px rgba(255,77,166,.4)", ease: "back.out(1.7)" }, "+=0.1")
    .to(".section-four", 0.5, { scale: 0.2, opacity: 0, y: -150 }, "+=1")
    .from(".idea-1", 0.7, ideaIn)
    .to(".idea-1",   0.7, ideaOut, "+=2")
    .from(".idea-2", 0.7, ideaIn)
    .to(".idea-2",   0.7, ideaOut, "+=2")
    .from(".idea-3", 0.7, ideaIn)
    .to(".idea-3 strong", 0.5, { scale: 1.2, x: 10, boxShadow: "0 10px 30px rgba(255,77,166,.5)" })
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
      { scale: 1, rotationY: 0, color: "#FF4DA6" },
      0.1, "party"
    )
    .from(".wish h5", 0.5, { opacity: 0, y: 10, skewX: "-15deg" }, "party")
    .to(".section-six", 0.5, { opacity: 0, y: 30 }, "+=2")
    // ── Cake ──
    .from(".section-cake", 0.7, { opacity: 0, scale: 0.5 })
    .add(() => { createCandles(); startMicDetection(); })
    .to(".section-cake", 0.5, { opacity: 0 }, "+=8")
    // ── Receipt ──
    .add(() => showReceipt());

  // Replay button
  document.getElementById("replay").addEventListener("click", replayAll);
}

// ══════════════════════════════════════════════════════
// CANDLES
// ══════════════════════════════════════════════════════
function createCandles() {
  [{ left: 80, top: -20 }, { left: 125, top: -20 }, { left: 170, top: -20 }].forEach(pos => {
    const c = document.createElement("div");
    c.className = "candle";
    c.style.left = pos.left + "px";
    c.style.top  = pos.top + "px";
    const f = document.createElement("div");
    f.className = "flame";
    c.appendChild(f);
    cakeEl.appendChild(c);
    candles.push(c);
  });
}

// ══════════════════════════════════════════════════════
// MICROPHONE DETECTION
// ══════════════════════════════════════════════════════
function stopMic() {
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
  if (audioCtx)  { audioCtx.close(); audioCtx = null; }
  isListening = false;
}

async function startMicDetection() {
  if (candlesBlown || isListening) return;
  if (!navigator.mediaDevices?.getUserMedia) { setupClickFallback(); return; }
  let granted = false;
  try { granted = (await navigator.permissions.query({ name: "microphone" })).state === "granted"; } catch {}
  if (granted) {
    requestMic();
  } else {
    pauseAll();
    blowInstruction.textContent = "🎤 Nhấn đây để bật mic nhé...";
    blowInstruction.style.animation = "pulse 2s infinite";
    blowInstruction.addEventListener("click", requestMic, { once: true });
  }
}

function pauseAll() {
  if (tl && !tl.paused()) tl.pause();
  if (musicPlaying) { bgMusic.pause(); musicIcon.textContent = "🔇"; }
}
function resumeAll() {
  if (tl && tl.paused()) tl.resume();
  if (musicPlaying) { bgMusic.play(); musicIcon.textContent = "🔊"; }
}

function requestMic() {
  blowInstruction.textContent = "🎤 Đang xin quyền mic...";
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => { micStream = stream; setupAudio(stream); resumeAll(); })
    .catch(() => { setupClickFallback(); resumeAll(); });
}

function setupClickFallback() {
  blowInstruction.textContent = "💡 Nhấn vào bánh để thổi nến! 💡";
  blowInstruction.style.animation = "pulse 2s infinite";
  cakeEl.addEventListener("click", blowCandles, { once: true });
}

function setupAudio(stream) {
  blowInstruction.textContent = "🌬️ Thổi vào mic để thổi nến nhé! 🌬️";
  blowInstruction.style.animation = "pulse 2s infinite";
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    micSrc   = audioCtx.createMediaStreamSource(stream);
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 512;
    micSrc.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    isListening = true;
    (function detect() {
      if (!isListening || candlesBlown) { stopMic(); return; }
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      if (avg > 35) { stopMic(); blowCandles(); return; }
      requestAnimationFrame(detect);
    })();
  } catch { stopMic(); setupClickFallback(); }
}

function blowCandles() {
  if (candlesBlown) return;
  candlesBlown = true;
  stopMic();
  candles.forEach((c, i) => setTimeout(() => c.classList.add("out"), i * 200));
  setTimeout(() => {
    blowInstruction.style.display = "none";
    blownMessage.classList.add("show");
    for (let i = 0; i < 6; i++) {
      setTimeout(() => createFirework(
        Math.random() * window.innerWidth,
        Math.random() * (window.innerHeight / 2)
      ), i * 400);
    }
  }, 800);
}

// ══════════════════════════════════════════════════════
// LOVE RECEIPT
// ══════════════════════════════════════════════════════
function showReceipt() {
  sectionReceipt.style.display = "flex";
  // Animate items in
  const items = sectionReceipt.querySelectorAll(".receipt-item");
  items.forEach((el, i) => setTimeout(() => el.classList.add("visible"), 200 + i * 130));
}

receiptNextBtn.addEventListener("click", () => {
  gsap.to(sectionReceipt, 0.5, {
    opacity: 0, y: -40,
    onComplete: () => {
      sectionReceipt.style.display = "none";
      // Show section-nine
      gsap.to(".section-nine", 0.7, { opacity: 1 });
      gsap.from(".section-nine p", 0.7, {
        opacity: 0, y: 20, scale: 0.5,
        stagger: { amount: 1.2, from: "start" },
        clearProps: "all",
        onComplete: () => setTimeout(transitionToScrollWorld, 4000),
      });
    },
  });
  // Burst fireworks
  for (let i = 0; i < 6; i++) {
    setTimeout(() => createFirework(
      Math.random() * window.innerWidth,
      Math.random() * (window.innerHeight / 2)
    ), i * 350);
  }
});

// ══════════════════════════════════════════════════════
// TRANSITION → SCROLL WORLD
// ══════════════════════════════════════════════════════
function transitionToScrollWorld() {
  gsap.to(".timeline-container", 1, {
    opacity: 0,
    onComplete: () => {
      tlContainer.style.display = "none";
      document.body.style.overflow = "";
      scrollWorld.style.display = "block";
      scrollWorld.classList.add("active");

      initTdParticles();
      buildTdTimeline();
      buildTdGallery();
      buildTdQuiz();
      buildTdFloatingWords();
      initScrollObserver();
    },
  });
}

// ══════════════════════════════════════════════════════
// REPLAY
// ══════════════════════════════════════════════════════
function replayAll() {
  candlesBlown = false;
  candles.forEach(c => c.classList.remove("out"));
  blowInstruction.style.display = "block";
  blownMessage.classList.remove("show");
  candles = [];
  document.querySelectorAll(".candle").forEach(c => c.remove());

  gsap.set(".section-nine", { opacity: 0 });
  gsap.set(".section-six",  { opacity: 1, y: 0 });

  sectionReceipt.style.display = "none";
  sectionReceipt.style.opacity = "1";
  sectionReceipt.querySelectorAll(".receipt-item").forEach(el => el.classList.remove("visible"));

  scrollWorld.classList.remove("active");
  scrollWorld.style.display = "none";
  tlContainer.style.display = "block";
  tlContainer.style.opacity = "1";
  document.body.style.overflow = "hidden";

  bgMusic.currentTime = 0;
  bgMusic.play()
    .then(() => { musicPlaying = true; musicIcon.textContent = "🔊"; })
    .catch(() => {});

  tl.restart();
}

// ══════════════════════════════════════════════════════
// THATDAY: PARTICLES
// ══════════════════════════════════════════════════════
const TD_SYMBOLS = ["♥","✦","♡","❋","✧","⋆","❤","✿","❥"];
const TD_COLORS  = ["rgba(255,170,234,.15)","rgba(99,29,118,.12)","rgba(152,193,217,.12)","rgba(234,196,53,.08)","rgba(251,77,61,.08)","rgba(255,170,234,.2)","rgba(99,29,118,.15)"];

function initTdParticles() {
  const pContainer = document.getElementById("tdParticles");
  const sContainer = document.getElementById("tdStars");
  const isMobile   = window.innerWidth < 640;
  const pCount     = isMobile ? 8 : 16;
  const sCount     = isMobile ? 10 : 25;

  for (let i = 0; i < pCount; i++) {
    const el = document.createElement("div");
    el.className = "td-particle";
    el.textContent = TD_SYMBOLS[i % TD_SYMBOLS.length];
    el.style.left     = (2 + Math.random() * 96) + "%";
    el.style.fontSize = (8 + Math.random() * 12) + "px";
    el.style.color    = TD_COLORS[i % TD_COLORS.length];
    el.style.animationDuration = (14 + Math.random() * 12) + "s";
    el.style.animationDelay   = (Math.random() * 12) + "s";
    pContainer.appendChild(el);
  }
  for (let i = 0; i < sCount; i++) {
    const el = document.createElement("div");
    el.className = "td-star";
    const sz = Math.random() > 0.5 ? 4 : 3;
    el.style.left   = (2 + Math.random() * 96) + "%";
    el.style.top    = (2 + Math.random() * 96) + "%";
    el.style.width  = sz + "px";
    el.style.height = sz + "px";
    el.style.animationDuration = (2.5 + Math.random() * 2.5) + "s";
    el.style.animationDelay   = (Math.random() * 6) + "s";
    sContainer.appendChild(el);
  }
}

// ══════════════════════════════════════════════════════
// THATDAY: FLOATING WORDS
// ══════════════════════════════════════════════════════
const FLOATING_WORDS = ["mãi mãi","chúng mình","yêu em","của nhau","home","forever","together","always"];

function buildTdFloatingWords() {
  const wrap = document.getElementById("tdFloatingWords");
  FLOATING_WORDS.forEach((word, i) => {
    const angle  = (360 / FLOATING_WORDS.length) * i;
    const radius = 38;
    const el = document.createElement("span");
    el.className = "td-fw-word";
    el.textContent = word;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    el.style.transform = `translate(calc(-50% + ${x}%), calc(-50% + ${y}%))`;
    el.style.animationDuration = (4 + i * 0.5) + "s";
    el.style.animationDelay   = (i * 0.6) + "s";
    wrap.appendChild(el);
  });
}

// ══════════════════════════════════════════════════════
// THATDAY: TIMELINE CARDS
// ══════════════════════════════════════════════════════
function buildTdTimeline() {
  const list = document.getElementById("tdTimelineList");
  CONFIG.timeline.forEach((item, i) => {
    const wrap = document.createElement("div");
    wrap.className = "td-tl-card";

    const isEven = i % 2 === 0;
    const imgHtml = item.image
      ? `<img class="td-tl-img" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'" data-src="${item.image}" />`
      : "";

    const contentHtml = `
      <div class="td-tl-card-inner">
        <div class="td-tl-card-body">
          <div class="td-tl-meta">
            <div class="td-tl-emoji">${item.emoji}</div>
            <div>
              <time class="td-tl-time">${item.date}</time>
            </div>
          </div>
          <h3 class="td-tl-title">${item.title}</h3>
          <p class="td-tl-desc">${item.description}</p>
        </div>
        ${imgHtml}
      </div>`;

    wrap.innerHTML = `
      <div class="td-tl-dot"><div class="td-tl-dot-inner"></div></div>
      <div class="td-tl-flex ${isEven ? "even" : "odd"}">
        <div class="td-tl-side">${isEven ? contentHtml : ""}</div>
        <div class="td-tl-side">${isEven ? "" : contentHtml}</div>
      </div>`;

    // Image click → modal
    const img = wrap.querySelector(".td-tl-img");
    if (img) img.addEventListener("click", () => openModal(img.src, item.title));

    list.appendChild(wrap);
  });
}

// ══════════════════════════════════════════════════════
// THATDAY: GALLERY
// ══════════════════════════════════════════════════════
const GALLERY_IMGS = [
  { src: "./images/ghephinhjpg.jpg",      alt: "Kỷ niệm" },
  { src: "./images/embebeban.jpeg",        alt: "Em bé dễ thương" },
  { src: "./images/embebebangoai.jpeg",    alt: "Đi dạo" },
  { src: "./images/embebecamchao.jpeg",    alt: "Em bé" },
  { src: "./images/embebeslay.jpeg",       alt: "Em bé slay" },
  { src: "./images/embebeliuliu.jpeg",     alt: "Em bé liu liu" },
  { src: "./images/embebemam.jpeg",        alt: "Em bé ăn" },
  { src: "./images/mall1.jpg",             alt: "Đi mall" },
  { src: "./images/mall2.jpg",             alt: "Đi mall 2" },
  { src: "./images/samson.jpg",            alt: "Samson" },
  { src: "./images/tet.jpg",               alt: "Tết" },
  { src: "./images/totnghiep.jpg",         alt: "Tốt nghiệp" },
  { src: "./images/embebeoanhbangchao.jpeg", alt: "Em bé" },
  { src: "./images/part1.jpg",             alt: "Kỷ niệm 1" },
];

function buildTdGallery() {
  const grid = document.getElementById("tdGalleryGrid");
  GALLERY_IMGS.forEach(({ src, alt }) => {
    const div = document.createElement("div");
    div.className = "td-gallery-item";
    const img = document.createElement("img");
    img.src = src; img.alt = alt; img.loading = "lazy";
    img.onerror = () => { div.style.display = "none"; };
    img.addEventListener("click", () => openModal(src, alt));
    div.appendChild(img);
    grid.appendChild(div);
  });
}

// ══════════════════════════════════════════════════════
// THATDAY: QUIZ
// ══════════════════════════════════════════════════════
let quizScore = 0;
let quizCurrent = 0;

function buildTdQuiz() {
  quizScore = 0; quizCurrent = 0;
  const container = document.getElementById("tdQuizContainer");
  container.innerHTML = "";
  document.getElementById("tdQuizResult").style.display = "none";
  document.getElementById("tdQuizContainer").style.display = "block";

  CONFIG.quiz.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "td-quiz-card" + (idx === 0 ? " active" : "");
    card.id = `tdq-${idx}`;
    const pct = (idx / CONFIG.quiz.length) * 100;
    card.innerHTML = `
      <div class="td-quiz-progress">Câu ${idx+1} / ${CONFIG.quiz.length}</div>
      <div class="td-quiz-bar"><div class="td-quiz-bar-fill" style="width:${pct}%"></div></div>
      <div class="td-quiz-q">${q.question}</div>
      <div class="td-quiz-opts">
        ${q.options.map((opt, i) => `<button class="td-quiz-opt" data-q="${idx}" data-i="${i}">${opt}</button>`).join("")}
      </div>
      <div class="td-quiz-exp" id="tdqe-${idx}">${q.explanation}</div>
      <button class="td-quiz-next" id="tdqn-${idx}">
        ${idx < CONFIG.quiz.length - 1 ? "Câu tiếp theo →" : "Xem kết quả 🎉"}
      </button>`;
    container.appendChild(card);
  });

  container.querySelectorAll(".td-quiz-opt").forEach(btn => btn.addEventListener("click", handleQuizAnswer));
  container.querySelectorAll(".td-quiz-next").forEach(btn => btn.addEventListener("click", handleQuizNext));
}

function handleQuizAnswer(e) {
  const btn  = e.currentTarget;
  const qIdx = +btn.dataset.q;
  const iIdx = +btn.dataset.i;
  const correct = CONFIG.quiz[qIdx].correct;

  document.querySelectorAll(`.td-quiz-opt[data-q="${qIdx}"]`).forEach(b => {
    b.disabled = true;
    if (+b.dataset.i === correct) b.classList.add("correct");
  });
  if (iIdx === correct) { quizScore++; btn.classList.add("correct"); }
  else btn.classList.add("wrong");

  const exp  = document.getElementById(`tdqe-${qIdx}`);
  const next = document.getElementById(`tdqn-${qIdx}`);
  if (exp)  exp.style.display  = "block";
  if (next) next.style.display = "block";
}

function handleQuizNext(e) {
  const idx = +e.currentTarget.id.split("-").pop();
  document.getElementById(`tdq-${idx}`).classList.remove("active");
  quizCurrent = idx + 1;
  if (quizCurrent < CONFIG.quiz.length) {
    document.getElementById(`tdq-${quizCurrent}`).classList.add("active");
  } else {
    document.getElementById("tdQuizContainer").style.display = "none";
    showQuizResult();
  }
}

function showQuizResult() {
  const res   = document.getElementById("tdQuizResult");
  const total = CONFIG.quiz.length;
  const pct   = Math.round((quizScore / total) * 100);
  let emoji, title, msg;
  if (pct === 100) {
    emoji = "🏆"; title = "Hoàn hảo tuyệt đối!";
    msg = `Em trả lời đúng hết ${total}/${total} câu! Em bé iu hiểu anh quá rồi nè 🥺💕`;
  } else if (pct >= 60) {
    emoji = "💕"; title = "Em bé giỏi lắm!";
    msg = `Em trả lời đúng ${quizScore}/${total} câu. Chúng mình hiểu nhau nhiều lắm rồi! 🌸`;
  } else {
    emoji = "😄"; title = "Thử lại nhé em bé!";
    msg = `Em trả lời đúng ${quizScore}/${total} câu. Chúng mình sẽ còn tạo thêm nhiều kỷ niệm! 💖`;
  }
  res.innerHTML = `
    <div class="td-quiz-result-inner">
      <div class="r-emoji">${emoji}</div>
      <h3>${title}</h3>
      <p>${msg}</p>
      <button class="td-quiz-restart" id="tdQuizRestart">Làm lại 🔄</button>
    </div>`;
  res.style.display = "block";
  document.getElementById("tdQuizRestart").addEventListener("click", buildTdQuiz);

  if (pct >= 80) {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createFirework(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.5
      ), i * 300);
    }
  }
}

// ══════════════════════════════════════════════════════
// IMAGE MODAL
// ══════════════════════════════════════════════════════
function openModal(src, alt) {
  imgModalImg.src = src;
  imgModalImg.alt = alt;
  imgModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeModal() {
  imgModal.style.display = "none";
  document.body.style.overflow = "";
}
imgModalBg.addEventListener("click", closeModal);
imgModalClose.addEventListener("click", closeModal);

// ══════════════════════════════════════════════════════
// INTERSECTION OBSERVER (fold / reveal)
// ══════════════════════════════════════════════════════
function initScrollObserver() {
  // Timeline vertical line animation
  const line = document.querySelector(".td-timeline-list::before");

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  const targets = document.querySelectorAll(
    ".td-tl-card, .td-gallery-item, .fold-item, .td-underline-anim, .td-underline-anim-red"
  );
  targets.forEach(el => obs.observe(el));
}

// ══════════════════════════════════════════════════════
// AMBIENT EFFECTS (happybirthday style)
// ══════════════════════════════════════════════════════
function startBalloons() {
  const EMOJIS = ["🎈","🎀","💕","🌸"];
  setInterval(() => {
    const b = document.createElement("div");
    b.className = "balloon";
    b.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    b.style.left = Math.random() * 100 + "%";
    b.style.animationDuration = (12 + Math.random() * 8) + "s";
    b.style.animationDelay   = Math.random() * 3 + "s";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 16000);
  }, 1400);
}

function startConfetti() {
  const COLS = ["#FF4DA6","#FFD54F","#00E5FF","#a855f7","#48c774","#FFAAEA","#EAC435"];
  setInterval(() => {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "%";
    c.style.backgroundColor = COLS[Math.floor(Math.random() * COLS.length)];
    c.style.animationDuration = (3 + Math.random() * 2) + "s";
    c.style.animationDelay   = Math.random() + "s";
    c.style.borderRadius     = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }, 150);
}

function createFirework(x, y) {
  const COLS = ["#FF4DA6","#FFD54F","#00E5FF","#a855f7","#FFAAEA","#EAC435"];
  for (let i = 0; i < 40; i++) {
    const f = document.createElement("div");
    f.className = "firework";
    f.style.left = x + "px"; f.style.top = y + "px";
    f.style.backgroundColor = COLS[Math.floor(Math.random() * COLS.length)];
    const angle = (Math.PI * 2 * i) / 40;
    const vel   = 2 + Math.random() * 3;
    document.body.appendChild(f);
    let px = x, py = y, vx = Math.cos(angle) * vel, vy = Math.sin(angle) * vel;
    const anim = setInterval(() => {
      vy += 0.15; px += vx; py += vy;
      f.style.left = px + "px"; f.style.top = py + "px";
      if (py > window.innerHeight) { clearInterval(anim); f.remove(); }
    }, 16);
  }
}

function startFireworks() {
  setInterval(() => {
    createFirework(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2));
  }, 2500);
}
