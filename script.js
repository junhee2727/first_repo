/* ==========================================================
   landing.html 전용 스크립트
   (네비게이션 바 스크립트는 landing.html 내 별도 <script>에서
    이미 처리되므로 여기서는 다루지 않음 — 중복 작성 금지)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     1. 마우스 위치 반응형 백그라운드 글로우 이펙트
     ---------------------------------------------------------- */
  const bgGlow = document.getElementById('bg-glow');
  const heroSection = document.getElementById('hero');

  if (bgGlow && heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left - 300;
      const y = e.clientY - rect.top - 300;
      bgGlow.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ----------------------------------------------------------
     2. 배경 오디오 비주얼라이저 캔버스 (잔잔한 앰비언트 파동)
     ---------------------------------------------------------- */
  const canvas = document.getElementById('visualizer-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const numBars = 80;
  let bars = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  for (let i = 0; i < numBars; i++) {
    bars.push({ currentHeight: 0, targetHeight: 0 });
  }

  function renderVisualizer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / numBars;
    const centerY = canvas.height / 2;
    const maxBarHeight = canvas.height * 0.48;

    const grad = ctx.createLinearGradient(0, centerY - maxBarHeight / 2, 0, centerY + maxBarHeight / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.75)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;

    const time = Date.now() * 0.003;

    for (let i = 0; i < numBars; i++) {
      const bar = bars[i];

      const distFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
      const bellMultiplier = Math.exp(-3.5 * distFromCenter * distFromCenter);

      // 잔잔한 엠비언트 파동 (랜딩 페이지는 재생 상태가 없으므로 항상 calm)
      const calmRipple = (Math.sin(i * 0.15 + time * 0.5) * 0.2 + 0.3) * (maxBarHeight * 0.18);
      bar.targetHeight = Math.max(4, calmRipple * bellMultiplier);

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

  renderVisualizer();
});
