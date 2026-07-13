/* ==========================================================
   football.html 전용 스크립트
   (네비게이션 바 스크립트는 football.html 내 별도 <script>에서
    이미 처리되므로 여기서는 다루지 않음 — 중복 작성 금지)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     1. 배경 오디오 비주얼라이저 캔버스 (앰비언트 파동 + 클릭 시 폭발)
     ---------------------------------------------------------- */
  const canvas = document.getElementById('visualizer-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  let burstEnergy = 0;
  const numBars = 80;
  let bars = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initBars() {
    bars = [];
    for (let i = 0; i < numBars; i++) {
      bars.push({ currentHeight: 0, targetHeight: 0 });
    }
  }

  function renderVisualizer() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / numBars;
    const centerY = canvas.height / 2;
    const maxBarHeight = canvas.height * 0.48;

    const grad = ctx.createLinearGradient(0, centerY - maxBarHeight / 2, 0, centerY + maxBarHeight / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;

    const time = Date.now() * 0.003;

    if (burstEnergy > 0) {
      burstEnergy *= 0.94;
      if (burstEnergy < 0.01) burstEnergy = 0;
    }

    for (let i = 0; i < numBars; i++) {
      const bar = bars[i];

      const distFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
      const bellMultiplier = Math.exp(-3.5 * distFromCenter * distFromCenter);

      const calmRipple = (Math.sin(i * 0.15 + time * 0.5) * 0.2 + 0.3) * (maxBarHeight * 0.18);
      bar.targetHeight = Math.max(4, calmRipple * bellMultiplier);

      if (burstEnergy > 0) {
        const shockWave = Math.sin(i * 0.25 - time * 8) * (maxBarHeight * 0.95);
        const heavyStatic = (Math.random() * 0.3 + 0.7) * (maxBarHeight * 0.7);
        bar.targetHeight += Math.abs(shockWave + heavyStatic) * burstEnergy * bellMultiplier;
      }

      bar.currentHeight += (bar.targetHeight - bar.currentHeight) * 0.12;

      const x = i * barWidth;
      const height = bar.currentHeight;
      const y = centerY - height / 2;
      const width = barWidth - 4;

      if (width > 0 && height > 1) {
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x + 2, y, width, height, 4);
        } else {
          ctx.rect(x + 2, y, width, height);
        }
        ctx.fill();
      }
    }

    requestAnimationFrame(renderVisualizer);
  }

  function triggerVisualizerBurst() {
    burstEnergy = 1.0;
    bars.forEach((bar) => {
      bar.currentHeight = Math.random() * window.innerHeight * 0.6 + 100;
    });
  }

  if (canvas && ctx) {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initBars();
    renderVisualizer();
  }

  /* ----------------------------------------------------------
     2. 뉴캐슬 카드 클릭 시 가상 경기장 함성 오디오 ("와!!!")
     ---------------------------------------------------------- */
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playStadiumCheer() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // 스타디움 관중의 웅장한 공기 밀도감을 시뮬레이션하기 위한 백색 소음 버퍼 생성
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(800, now);
      bandpass.frequency.exponentialRampToValueAtTime(1600, now + 0.2);
      bandpass.frequency.exponentialRampToValueAtTime(500, now + 0.9);
      bandpass.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.2);
      osc1.frequency.exponentialRampToValueAtTime(95, now + 0.8);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(165, now);
      osc2.frequency.exponentialRampToValueAtTime(330, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(130, now + 0.8);

      const vocalFilter = ctx.createBiquadFilter();
      vocalFilter.type = 'lowpass';
      vocalFilter.frequency.setValueAtTime(650, now);

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.28, now + 0.15);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

      osc1.connect(vocalFilter);
      osc2.connect(vocalFilter);
      vocalFilter.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc1.start(now);
      osc2.start(now);

      noise.stop(now + 1.5);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
    } catch (err) {
      console.warn('이 브라우저에서는 Web Audio API가 차단되었거나 작동을 지원하지 않습니다: ', err);
    }

    triggerVisualizerBurst();
  }

  /* ----------------------------------------------------------
     3. 클릭/터치 위치에서 떠오르는 응원 텍스트 파티클 ("와!!!")
     ---------------------------------------------------------- */
  function createFloatingText(e) {
    const text = document.createElement('div');

    const cheerPhrases = ['와!!! 📣⚽️🔥', 'HOWAY THE LADS! 🦓', '골!!! ⚽️🏁', '뉴캐슬!!! 📣🏁'];
    const randomPhrase = cheerPhrases[Math.floor(Math.random() * cheerPhrases.length)];

    text.innerText = randomPhrase;
    text.style.position = 'fixed';
    text.style.zIndex = '2000';
    text.style.pointerEvents = 'none';
    text.style.fontWeight = '900';
    text.style.fontSize = 'clamp(20px, 4vw, 34px)';
    text.style.color = 'var(--color-text-primary)';
    text.style.userSelect = 'none';
    text.style.transition = 'top 1.2s ease-out, opacity 1.2s ease-out, transform 1.2s ease-out';
    text.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.9), 0 0 30px rgba(0,0,0,0.8)';

    const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || window.innerWidth / 2;
    const y = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || window.innerHeight / 2;

    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    text.style.transform = 'translate(-50%, -50%) scale(0.6)';
    text.style.opacity = '1';

    document.body.appendChild(text);

    requestAnimationFrame(() => {
      text.style.top = `${y - 180}px`;
      text.style.opacity = '0';
      text.style.transform = `translate(-50%, -50%) scale(1.4) rotate(${Math.random() * 40 - 20}deg)`;
    });

    setTimeout(() => {
      text.remove();
    }, 1200);
  }

  /* ----------------------------------------------------------
     4. 뉴캐슬 카드 인터랙션 이벤트 바인딩
     ---------------------------------------------------------- */
  const nufcCard = document.getElementById('nufc-card');

  if (nufcCard) {
    nufcCard.addEventListener('click', (e) => {
      playStadiumCheer();
      createFloatingText(e);
    });

    nufcCard.addEventListener('touchstart', (e) => {
      if (e.cancelable) {
        playStadiumCheer();
        createFloatingText(e);
      }
    }, { passive: true });

    // 키보드 접근성: Enter/Space로도 동일하게 트리거
    nufcCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playStadiumCheer();
        createFloatingText({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
      }
    });
  }
});
