/**
 * MAIN.JS – Sinh Nhật Hạnh 2026
 * Birthday interactive experience
 */

/* =============================================
   GLOBAL STATE
   ============================================= */
const state = {
  musicPlaying: false,
  currentGalleryIndex: 0,
  candlesBlown: false,
  confettiRunning: false,
};

/* Audio */
let audio;

/* Candle & Mic blow state */
let micStream = null;
let micAudioContext = null;
let micAnalyser = null;
let micAnimFrame = null;
let micListening = false;
let micStarting = false;
let micSessionId = 0;
let micTimeData = null;
let micFrequencyData = null;
let micDetector = null;
let musicMutedBeforeMic = null;
let cakeClickable = false;

/* =============================================
   DOM READY
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initParticles();
  initScrollHandlers();
  initNavigation();
  buildReceipt();
  buildTimeline();
  buildGallery();
  initQuiz();
  initLoveCounter();
  animateHeroStats();
  initHamburger();
  initScrollTop();
  initClickHearts();
  initSectionObserver();
  handlePasswordEnter();
});

/* =============================================
   AUDIO
   ============================================= */
function initAudio() {
  audio = new Audio(CONFIG.music.src);
  audio.loop = true;
  audio.volume = 0.35;
}

function toggleMusic() {
  const btn = document.getElementById('music-btn');
  const icon = document.getElementById('music-icon');
  if (state.musicPlaying) {
    audio.pause();
    state.musicPlaying = false;
    btn.classList.remove('playing');
    icon.className = 'fas fa-music';
  } else {
    audio.play().catch(() => {});
    state.musicPlaying = true;
    btn.classList.add('playing');
    icon.className = 'fas fa-pause';
  }
}

/* =============================================
   SCREEN FLOW
   ============================================= */
function checkPassword() {
  const input = document.getElementById('password-input').value;
  const errEl = document.getElementById('password-error');

  if (input === CONFIG.password || input.toLowerCase() === CONFIG.nicknames[0]) {
    errEl.textContent = '';
    cakeClickable = false;
    transitionToScreen('screen-intro', 'screen-cake');
    setTimeout(() => {
      cakeClickable = true;
    }, 800);
    setTimeout(() => {
      audio.play().catch(() => {});
      state.musicPlaying = true;
      const musicBtn = document.getElementById('music-btn');
      if (musicBtn) musicBtn.classList.add('playing');
      const musicIcon = document.getElementById('music-icon');
      if (musicIcon) musicIcon.className = 'fas fa-pause';
    }, 800);
  } else {
    errEl.innerHTML = '<i class="fas fa-heart-crack"></i> Sai mật khẩu rồi em bé ơi! Thử lại nò 🥺';
    const input = document.getElementById('password-input');
    input.style.borderColor = '#f43f5e';
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
    shakeElement(document.getElementById('password-input'));
  }
}

function handlePasswordEnter() {
  const input = document.getElementById('password-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkPassword();
    });
  }
}

function transitionToScreen(fromId, toId) {
  const overlay = document.getElementById('page-transition');
  overlay.classList.add('closing');
  setTimeout(() => {
    document.getElementById(fromId).classList.remove('active');
    document.getElementById(fromId).style.display = 'none';
    const toEl = document.getElementById(toId);
    toEl.style.display = toId === 'app' ? 'block' : 'flex';
    toEl.classList.add('active');
    overlay.classList.remove('closing');
    overlay.classList.add('opening');
    setTimeout(() => overlay.classList.remove('opening'), 500);
  }, 500);
}

/* =============================================
   CANDLE BLOW / BIRTHDAY CAKE
   ============================================= */
function blowCandles() {
  if (!cakeClickable && !state.candlesBlown) return;
  if (state.candlesBlown) return;
  state.candlesBlown = true;
  stopMicBlow();

  const svgEl = document.getElementById('cake-svg');
  if (svgEl) svgEl.classList.add('flames-out');

  const meter = document.getElementById('blow-meter-container');
  if (meter) meter.style.display = 'none';
  const micBtnWrapper = document.getElementById('mic-btn-wrapper');
  if (micBtnWrapper) micBtnWrapper.style.display = 'none';

  const instruction = document.getElementById('blow-instruction');
  if (instruction) {
    instruction.innerHTML = '🎉 Chúc mừng sinh nhật em bé iu! 🎂';
    instruction.style.color = '#ec4899';
  }

  // Fireworks
  startFireworks();
  setTimeout(stopFireworks, 4000);

  // Show receipt after 3 seconds
  setTimeout(() => {
    transitionToScreen('screen-cake', 'screen-receipt');
    setTimeout(() => runConfetti(5000), 300);
  }, 3000);
}

/* =============================================
   MICROPHONE BLOW DETECTION
   ============================================= */
function requestMicPermission() {
  if (micListening || micStarting) {
    stopMicBlow();
    updateBlowInstruction('tap-only');
  } else {
    initMicBlow();
  }
}

async function initMicBlow() {
  if (state.candlesBlown || !cakeClickable || micListening || micStarting) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    updateBlowInstruction('tap-only');
    return;
  }

  const sessionId = ++micSessionId;
  micStarting = true;
  // Silence our own speaker output before calibrating, preserving the music toggle.
  if (audio) {
    musicMutedBeforeMic = audio.muted;
    audio.muted = true;
  }
  updateBlowInstruction('mic-starting');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      video: false,
    });
    if (sessionId !== micSessionId || state.candlesBlown) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    micStream = stream;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const context = new AudioCtx();
    micAudioContext = context;
    if (context.state === 'suspended') await context.resume();
    if (sessionId !== micSessionId || state.candlesBlown) return;
    if (context.state !== 'running') throw new Error('Microphone audio context is not running');
    const source = context.createMediaStreamSource(stream);
    micAnalyser = context.createAnalyser();
    micAnalyser.fftSize = 2048;
    micAnalyser.smoothingTimeConstant = 0;
    source.connect(micAnalyser);
    micTimeData = new Float32Array(micAnalyser.fftSize);
    micFrequencyData = new Float32Array(micAnalyser.frequencyBinCount);
    micDetector = createBlowDetector();
    stream.getAudioTracks().forEach(track => track.addEventListener('ended', () => {
      if (sessionId !== micSessionId) return;
      stopMicBlow();
      updateBlowInstruction('tap-only');
    }));
    micStarting = false;
    micListening = true;
    updateBlowInstruction('mic-calibrating');
    detectBlow();
  } catch (err) {
    if (sessionId !== micSessionId) return;
    console.log('Mic unavailable or permission denied:', err);
    stopMicBlow();
    updateBlowInstruction('tap-only');
  }
}

function detectBlow() {
  if (!micListening || state.candlesBlown) return;

  if (micAudioContext.state !== 'running') {
    stopMicBlow();
    updateBlowInstruction('tap-only');
    return;
  }
  micAnalyser.getFloatTimeDomainData(micTimeData);
  micAnalyser.getFloatFrequencyData(micFrequencyData);
  let squareSum = 0;
  let mean = 0;
  for (const value of micTimeData) mean += value;
  mean /= micTimeData.length;
  for (const value of micTimeData) squareSum += (value - mean) ** 2;

  let lowPower = 0;
  let totalPower = 0;
  let peakLowPower = 0;
  const binHz = micAudioContext.sampleRate / micAnalyser.fftSize;
  for (let i = 1; i < micFrequencyData.length; i++) {
    const hz = i * binHz;
    if (hz < 60 || hz > 8000) continue;
    const power = 10 ** (micFrequencyData[i] / 10);
    totalPower += power;
    if (hz <= 600) {
      lowPower += power;
      peakLowPower = Math.max(peakLowPower, power);
    }
  }
  const result = micDetector.update({
    now: performance.now(),
    rms: Math.sqrt(squareSum / micTimeData.length),
    lowPower,
    totalPower,
    peakLowPower,
  });
  updateBlowInstruction(result.calibrating ? 'mic-calibrating' : 'mic-active');
  const meterBar = document.getElementById('blow-meter-bar');
  if (meterBar) meterBar.style.width = Math.round(result.progress * 100) + '%';
  if (cakeClickable && result.detected) {
    blowCandles();
    return;
  }

  micAnimFrame = requestAnimationFrame(detectBlow);
}

function stopMicBlow() {
  ++micSessionId; // Invalidate permission/resume promises from an earlier attempt.
  micStarting = false;
  micListening = false;
  if (micAnimFrame !== null) cancelAnimationFrame(micAnimFrame);
  micAnimFrame = null;
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
  if (micAudioContext && micAudioContext.state !== 'closed') micAudioContext.close().catch(() => {});
  micAudioContext = null;
  micAnalyser = null;
  micTimeData = null;
  micFrequencyData = null;
  micDetector = null;
  if (audio && musicMutedBeforeMic !== null) {
    audio.muted = musicMutedBeforeMic;
    musicMutedBeforeMic = null;
  }
}

window.addEventListener('pagehide', stopMicBlow);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (micListening || micStarting)) {
    stopMicBlow();
    if (!state.candlesBlown) updateBlowInstruction('tap-only');
  }
});

function updateBlowInstruction(mode) {
  const instr = document.getElementById('blow-instruction');
  const meter = document.getElementById('blow-meter-container');
  const micBtnWrapper = document.getElementById('mic-btn-wrapper');
  const micBtn = document.getElementById('enable-mic-btn');
  if (!instr) return;

  const messages = {
    'mic-starting': '🎤 Đang mở micro… Em cho phép dùng micro nhé!',
    'mic-calibrating': '🤫 Giữ yên khoảng 2 giây để đo tiếng nền, rồi hãy thổi nhé!',
    'mic-active': '🌬️ <strong>Thổi gần micro khoảng nửa giây</strong> hoặc 👆 <strong>chạm bánh</strong> nhé!',
    'tap-only': '👆 <strong>Chạm bánh</strong> hoặc <strong>bật micro</strong> để thổi nến nhé! 🕯️',
  };
  const message = messages[mode] || messages['tap-only'];
  if (instr.innerHTML !== message) instr.innerHTML = message;
  if (meter) meter.style.display = mode === 'mic-active' || mode === 'mic-calibrating' ? 'block' : 'none';
  if (micBtnWrapper) micBtnWrapper.style.display = 'block';
  if (micBtn) {
    const label = mode === 'tap-only'
      ? '<i class="fas fa-microphone"></i> Bật micro để thổi nến'
      : '<i class="fas fa-microphone-slash"></i> Tắt micro';
    if (micBtn.innerHTML !== label) micBtn.innerHTML = label;
  }
}

/* =============================================
   RECEIPT BUILD
   ============================================= */
function buildReceipt() {
  const r = CONFIG.receipt;
  document.getElementById('receipt-title').textContent = r.title;
  document.getElementById('receipt-subtitle').textContent = r.subtitle;

  const listEl = document.getElementById('receipt-items');
  r.items.forEach(item => {
    const li = document.createElement('div');
    li.className = 'receipt-item';
    li.innerHTML = `<span class="receipt-item-label">${item.label}:</span>
                    <span class="receipt-item-value">${item.value}</span>`;
    listEl.appendChild(li);
  });

  document.getElementById('receipt-total-label').textContent = r.totalLabel;
  document.getElementById('receipt-total-value').textContent = r.total;
  document.getElementById('receipt-signature').textContent = r.signature;
  document.getElementById('receipt-footer').textContent = r.footer;
}

function goToMainApp() {
  transitionToScreen('screen-receipt', 'app');
  setTimeout(() => {
    initAppAnimations();
    initSectionObserver();
  }, 600);
}

function initAppAnimations() {
  // Animate hero elements via GSAP if available, else CSS
  if (window.gsap) {
    gsap.from('.hero-badge', { opacity: 0, y: 20, duration: .6, ease: 'power2.out' });
    gsap.from('.hero-title', { opacity: 0, y: 30, duration: .7, delay: .2, ease: 'power2.out' });
    gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: .6, delay: .4, ease: 'power2.out' });
    gsap.from('.hero-stats', { opacity: 0, y: 20, duration: .6, delay: .6, ease: 'power2.out' });
    gsap.from('.stat-box', { opacity: 0, scale: .8, duration: .5, delay: .8, stagger: .1, ease: 'back.out(1.7)' });
    gsap.from('.hero-message', { opacity: 0, y: 15, duration: .6, delay: 1.2, ease: 'power2.out' });
  }
}

/* =============================================
   TIMELINE BUILD
   ============================================= */
function buildTimeline() {
  const container = document.getElementById('timeline-items');
  if (!container) return;

  CONFIG.timeline.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `
      <div class="timeline-dot">${item.emoji}</div>
      <div class="card timeline-card">
        <div class="timeline-date">📅 ${item.date}</div>
        <h3 class="timeline-title">${item.title}</h3>
        <p class="timeline-desc">${item.desc}</p>
        ${item.img ? `<img src="${item.img}" alt="${item.title}" class="timeline-img" loading="lazy" onerror="this.style.display='none'">` : ''}
      </div>`;
    container.appendChild(el);
  });
}

/* =============================================
   GALLERY BUILD
   ============================================= */
function buildGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  CONFIG.gallery.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.style.animationDelay = `${i * 0.07}s`;
    div.onclick = () => openLightbox(i);
    div.innerHTML = `
      <img src="${item.src}" alt="${item.caption}" loading="lazy" onerror="this.parentElement.style.display='none'">
      <div class="gallery-caption">${item.caption}</div>`;
    grid.appendChild(div);
  });
}

/* Lightbox */
function openLightbox(index) {
  state.currentGalleryIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const item = CONFIG.gallery[state.currentGalleryIndex];
  document.getElementById('lightbox-img').src = item.src;
  document.getElementById('lightbox-caption').textContent = item.caption;
}

function prevImage() {
  state.currentGalleryIndex = (state.currentGalleryIndex - 1 + CONFIG.gallery.length) % CONFIG.gallery.length;
  updateLightbox();
}

function nextImage() {
  state.currentGalleryIndex = (state.currentGalleryIndex + 1) % CONFIG.gallery.length;
  updateLightbox();
}

// Keyboard nav for lightbox
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  prevImage();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'Escape')     closeLightbox();
});

/* =============================================
   LOVE COUNTER
   ============================================= */
function initLoveCounter() {
  const togetherDate = CONFIG.dates.together;

  function updateCounter() {
    const now = new Date();
    const diff = now - togetherDate;
    if (diff < 0) return;

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('counter-days',    days.toLocaleString());
    el('counter-hours',   String(hours).padStart(2, '0'));
    el('counter-minutes', String(minutes).padStart(2, '0'));
    el('counter-seconds', String(seconds).padStart(2, '0'));
  }

  updateCounter();
  setInterval(updateCounter, 1000);
}

/* =============================================
   HERO STATS ANIMATION
   ============================================= */
function animateHeroStats() {
  // Will run once app is shown
  const togetherDate = CONFIG.dates.together;
  const now = new Date();
  const diffDays = Math.floor((now - togetherDate) / 86400000);

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    animateNumber(el, 0, val, 1500);
  };

  setTimeout(() => {
    setVal('stat-days',   diffDays);
    setVal('stat-months', Math.floor(diffDays / 30));
    setVal('stat-smiles', 9999);
    setVal('stat-hearts', 99999);
  }, 800);
}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  const range = to - from;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(from + range * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* =============================================
   QUIZ
   ============================================= */
const quizData = [
  {
    question: '💕 Điều anh thích nhất ở em là gì?',
    options: ['Nụ cười của em 😊', 'Giọng nói của em 🎵', 'Sự dịu dàng của em 🌸', 'Tất cả những điều trên ❤️'],
    answer: 3,
    feedback: 'Đúng rồi! Tất cả mọi thứ ở em đều làm anh thích mà! 💖'
  },
  {
    question: '🎂 Hôm nay em mấy tuổi?',
    options: ['21 tuổi', '22 tuổi', '23 tuổi 🎉', '24 tuổi'],
    answer: 2,
    feedback: '23 tuổi rồi, em bé iu của anh lớn thêm một tuổi nữa rồi! 🥹'
  },
  {
    question: '💑 Chúng mình bắt đầu yêu nhau khi nào?',
    options: ['Tháng 4/2023', '09/01/2024 ✨', 'Tháng 3/2024', 'Tháng 6/2023'],
    answer: 1,
    feedback: 'Ngày 09/01/2024 – ngày đẹp nhất trong cuộc đời anh! 💝'
  },
  {
    question: '🌊 Chúng mình đã đi đâu chơi cùng nhau?',
    options: ['Hà Giang', 'Đà Nẵng', 'Sầm Sơn 🏖️', 'Nha Trang'],
    answer: 2,
    feedback: 'Sầm Sơn với những kỷ niệm không bao giờ quên! 🌅'
  },
  {
    question: '❤️ Anh gọi em là gì?',
    options: ['Em yêu', 'Em bé iu 🥰', 'Bé', 'Honey'],
    answer: 1,
    feedback: 'Em bé iu – cái tên dễ thương nhất thế giới! 💕'
  },
];

let quizState = { current: 0, score: 0, answered: false };

function initQuiz() {
  renderQuestion();
}

function renderQuestion() {
  const q = quizData[quizState.current];
  if (!q) return;

  const questionEl   = document.getElementById('quiz-question');
  const optionsEl    = document.getElementById('quiz-options');
  const progressEl   = document.getElementById('quiz-progress');
  const progressBar  = document.getElementById('quiz-progress-bar');
  const feedbackEl   = document.getElementById('quiz-feedback');

  if (!questionEl) return;

  questionEl.textContent = q.question;
  optionsEl.innerHTML = '';
  if (feedbackEl) feedbackEl.textContent = '';
  quizState.answered = false;

  const pct = ((quizState.current + 1) / quizData.length) * 100;
  if (progressEl)  progressEl.textContent = `Câu ${quizState.current + 1} / ${quizData.length}`;
  if (progressBar) progressBar.style.width = pct + '%';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `<span class="quiz-radio"></span>${opt}`;
    btn.onclick = () => selectAnswer(i, btn);
    optionsEl.appendChild(btn);
  });

  const nextBtn = document.getElementById('quiz-next');
  if (nextBtn) nextBtn.style.display = 'none';
}

function selectAnswer(idx, btnEl) {
  if (quizState.answered) return;
  quizState.answered = true;

  const q = quizData[quizState.current];
  const allBtns = document.querySelectorAll('#quiz-options .quiz-option');
  const feedbackEl = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next');

  allBtns.forEach((b, i) => {
    b.style.pointerEvents = 'none';
    if (i === q.answer)  b.classList.add('correct');
    else if (i === idx)  b.classList.add('wrong');
  });

  if (idx === q.answer) {
    quizState.score++;
    if (feedbackEl) { feedbackEl.textContent = '✅ ' + q.feedback; feedbackEl.style.color = '#059669'; }
    createHeartBurst();
  } else {
    if (feedbackEl) { feedbackEl.textContent = '💡 ' + q.feedback; feedbackEl.style.color = '#d97706'; }
  }

  if (nextBtn) nextBtn.style.display = 'inline-flex';
}

function nextQuestion() {
  quizState.current++;
  if (quizState.current >= quizData.length) {
    showQuizResult();
  } else {
    renderQuestion();
  }
}

function showQuizResult() {
  const resultEl = document.getElementById('quiz-result');
  const questionArea = document.getElementById('quiz-question-area');
  if (!resultEl) return;

  if (questionArea) questionArea.style.display = 'none';
  resultEl.style.display = 'block';

  const pct = Math.round(quizState.score / quizData.length * 100);
  const resultEmoji = document.getElementById('quiz-result-emoji');
  const resultTitle = document.getElementById('quiz-result-title');
  const resultMsg   = document.getElementById('quiz-result-msg');

  if (pct === 100) {
    if (resultEmoji) resultEmoji.textContent = '🏆💕';
    if (resultTitle) resultTitle.textContent = 'Hoàn hảo tuyệt đối!';
    if (resultMsg)   resultMsg.textContent   = 'Em biết rõ chúng mình lắm! Anh iu em nhiều lắm lắm lắm! 💝';
    startFireworks(); setTimeout(stopFireworks, 3000);
  } else if (pct >= 60) {
    if (resultEmoji) resultEmoji.textContent = '💖😊';
    if (resultTitle) resultTitle.textContent = 'Giỏi lắm em bé!';
    if (resultMsg)   resultMsg.textContent   = `Em đạt ${quizState.score}/${quizData.length} câu đúng! Nhưng trong tim anh em luôn là 100% hoàn hảo! 💕`;
  } else {
    if (resultEmoji) resultEmoji.textContent = '😄💕';
    if (resultTitle) resultTitle.textContent = 'Em bé dễ thương!';
    if (resultMsg)   resultMsg.textContent   = `Em đạt ${quizState.score}/${quizData.length} – Không sao, anh iu em dù thế nào đi nữa! 💗`;
  }
}

function restartQuiz() {
  quizState = { current: 0, score: 0, answered: false };
  const resultEl = document.getElementById('quiz-result');
  const questionArea = document.getElementById('quiz-question-area');
  if (resultEl) resultEl.style.display = 'none';
  if (questionArea) questionArea.style.display = 'block';
  renderQuestion();
}

/* =============================================
   RANDOM MESSAGES
   ============================================= */
function showRandomMessage() {
  const msgs = CONFIG.randomMessages;
  const msg  = msgs[Math.floor(Math.random() * msgs.length)];
  const box  = document.getElementById('random-msg-box');
  if (!box) return;

  box.style.display = 'none';
  box.textContent = msg;
  box.style.display = 'block';
  box.style.animation = 'none';
  requestAnimationFrame(() => {
    box.style.animation = 'fadeSlide .4s ease';
  });
  createHeartBurst();
}

/* =============================================
   PARTICLES (floating background elements)
   ============================================= */
function initParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const symbols = ['💕', '🌸', '✨', '💖', '🌷', '💗', '🎀', '⭐'];
  let count = 0;

  function spawnParticle() {
    if (count > 30) return;
    count++;
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.fontSize = (Math.random() * 12 + 10) + 'px';
    const duration = Math.random() * 8 + 8;
    p.style.animationDuration = duration + 's';
    p.style.opacity = (Math.random() * 0.4 + 0.3).toString();
    container.appendChild(p);

    setTimeout(() => {
      p.remove();
      count--;
    }, duration * 1000);
  }

  setInterval(spawnParticle, 1200);
  for (let i = 0; i < 6; i++) spawnParticle();
}

/* =============================================
   CLICK HEARTS
   ============================================= */
function initClickHearts() {
  document.addEventListener('click', e => {
    // Only in app screen
    if (!document.getElementById('app').classList.contains('active')) return;
    if (e.target.closest('button, a, input, .gallery-item, .quiz-option')) return;

    for (let i = 0; i < 3; i++) {
      createFloatingHeart(e.clientX + (Math.random() - .5) * 40, e.clientY + (Math.random() - .5) * 20);
    }
  });
}

function createFloatingHeart(x, y) {
  const h = document.createElement('div');
  h.className = 'floating-heart';
  h.textContent = ['💕', '💖', '💗', '❤️', '💝'][Math.floor(Math.random() * 5)];
  h.style.left = x + 'px';
  h.style.top  = y + 'px';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 1500);
}

function createHeartBurst() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  for (let i = 0; i < 8; i++) {
    setTimeout(() => createFloatingHeart(cx + (Math.random()-0.5)*200, cy + (Math.random()-0.5)*150), i * 80);
  }
}

/* =============================================
   CONFETTI
   ============================================= */
function runConfetti(duration = 3000) {
  const canvas  = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ec4899', '#f472b6', '#f97316', '#fbbf24', '#a855f7', '#06b6d4', '#10b981'];
  const pieces = [];

  for (let i = 0; i < 200; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 5,
    });
  }

  let start = null;

  function draw(ts) {
    if (!start) start = ts;
    if (ts - start > duration) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* =============================================
   FIREWORKS
   ============================================= */
let fireworksRunning = false;

function startFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  fireworksRunning = true;

  const rockets = [];

  function launchRocket() {
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    const tx = Math.random() * canvas.width;
    const ty = Math.random() * canvas.height * 0.5;
    rockets.push({ x, y, tx, ty, particles: [], exploded: false,
      speed: { x: (tx - x) / 50, y: (ty - y) / 50 }, trail: [] });
  }

  function explode(r) {
    r.exploded = true;
    const colors = ['#ec4899', '#f472b6', '#f97316', '#fbbf24', '#a855f7', '#06b6d4'];
    const c = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 / 80) * i;
      const speed = Math.random() * 4 + 2;
      r.particles.push({
        x: r.x, y: r.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        alpha: 1, color: c, size: Math.random() * 3 + 1
      });
    }
  }

  let frameId;

  function loop() {
    if (!fireworksRunning) { ctx.clearRect(0,0,canvas.width,canvas.height); return; }

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rockets.forEach((r, ri) => {
      if (!r.exploded) {
        r.x += r.speed.x;
        r.y += r.speed.y;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        const dx = r.tx - r.x, dy = r.ty - r.y;
        if (Math.sqrt(dx*dx + dy*dy) < 15) explode(r);
      } else {
        r.particles = r.particles.filter(p => p.alpha > 0.01);
        r.particles.forEach(p => {
          p.x  += p.vx;
          p.y  += p.vy;
          p.vy += 0.08;
          p.vx *= 0.98;
          p.alpha *= 0.97;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        if (r.particles.length === 0) rockets.splice(ri, 1);
      }
    });

    frameId = requestAnimationFrame(loop);
  }

  setInterval(() => { if (fireworksRunning) launchRocket(); }, 600);
  launchRocket();
  launchRocket();
  loop();
}

function stopFireworks() {
  fireworksRunning = false;
  const canvas = document.getElementById('fireworksCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* =============================================
   SCROLL
   ============================================= */
function initScrollHandlers() {
  window.addEventListener('scroll', () => {
    // Scroll top button
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
      if (window.scrollY > 400) scrollTopBtn.classList.add('visible');
      else scrollTopBtn.classList.remove('visible');
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (btn) btn.addEventListener('click', scrollToTop);
}

/* =============================================
   NAVIGATION
   ============================================= */
function initNavigation() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileNav();
      }
    });
  });
}

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.getElementById('mobile-nav').classList.toggle('open');
    });
  }
}

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.remove('open');
}

/* =============================================
   SECTION OBSERVER (intersection)
   ============================================= */
function initSectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));

  // Timeline items
  const tlObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.timeline-item').forEach(el => tlObserver.observe(el));
}

/* =============================================
   UTILITIES
   ============================================= */
function shakeElement(el) {
  el.style.animation = 'none';
  requestAnimationFrame(() => {
    el.style.animation = 'shake .4s ease';
  });
}

/* Shake keyframe (injected) */
const style = document.createElement('style');
style.textContent = `@keyframes shake {
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-6px)}
  40%{transform:translateX(6px)}
  60%{transform:translateX(-4px)}
  80%{transform:translateX(4px)}
}`;
document.head.appendChild(style);

/* Window resize */
window.addEventListener('resize', () => {
  const canvas1 = document.getElementById('fireworksCanvas');
  const canvas2 = document.getElementById('confettiCanvas');
  if (canvas1) { canvas1.width = window.innerWidth; canvas1.height = window.innerHeight; }
  if (canvas2) { canvas2.width = window.innerWidth; canvas2.height = window.innerHeight; }
});
