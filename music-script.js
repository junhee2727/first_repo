/* ==========================================================
   music.html 전용 스크립트
   (네비게이션 바 스크립트는 music.html 내 별도 <script>에서
    이미 처리되므로 여기서는 다루지 않음 — 중복 작성 금지)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     1. 배경 오디오 비주얼라이저 캔버스
        (재생 중일 때 더 다이내믹한 파형으로 반응)
     ---------------------------------------------------------- */
  const canvas = document.getElementById('visualizer-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  let isPlaying = false;
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
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;

    const time = Date.now() * 0.003;

    for (let i = 0; i < numBars; i++) {
      const bar = bars[i];

      const distFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
      const bellMultiplier = Math.exp(-3.5 * distFromCenter * distFromCenter);

      if (isPlaying) {
        const primaryWave = Math.sin(i * 0.18 + time * 1.5) * 0.4 + 0.5;
        const rapidTurbulence = Math.cos(i * 0.35 - time * 2.8) * 0.25;
        const highFreqSpike = Math.sin(i * 0.7 + time * 4) * 0.15;

        const compositeWave = (primaryWave + rapidTurbulence + highFreqSpike + 0.3) * maxBarHeight;
        bar.targetHeight = Math.max(12, compositeWave * bellMultiplier);
      } else {
        const calmRipple = (Math.sin(i * 0.15 + time * 0.5) * 0.2 + 0.3) * (maxBarHeight * 0.18);
        bar.targetHeight = Math.max(4, calmRipple * bellMultiplier);
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

  if (canvas && ctx) {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initBars();
    renderVisualizer();
  }

  /* ----------------------------------------------------------
     2. 바이닐 턴테이블 재생/일시정지 토글
     ---------------------------------------------------------- */
  const vinyl = document.getElementById('vinyl');
  const tonearm = document.getElementById('tonearm');
  const toggleBtn = document.getElementById('vinyl-toggle');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');

  if (toggleBtn && vinyl && tonearm && playIcon && pauseIcon) {
    toggleBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;

      if (isPlaying) {
        vinyl.classList.remove('paused');
        tonearm.classList.add('is-playing');
        playIcon.classList.add('is-hidden');
        pauseIcon.classList.remove('is-hidden');
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.setAttribute('aria-label', '바이닐 일시정지');
      } else {
        vinyl.classList.add('paused');
        tonearm.classList.remove('is-playing');
        playIcon.classList.remove('is-hidden');
        pauseIcon.classList.add('is-hidden');
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.setAttribute('aria-label', '바이닐 재생');
      }
    });
  }
});
