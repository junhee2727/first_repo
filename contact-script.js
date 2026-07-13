/* ==========================================================
   contact.html 전용 스크립트
   (네비게이션 바 스크립트는 contact.html 내 별도 <script>에서
    이미 처리되므로 여기서는 다루지 않음 — 중복 작성 금지)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     1. 배경 오디오 비주얼라이저 캔버스 (잔잔한 앰비언트 파동)
     ---------------------------------------------------------- */
  const canvas = document.getElementById('visualizer-canvas');
  if (canvas) {
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
  }

  /* ----------------------------------------------------------
     2. 이메일 주소 클립보드 복사
     ---------------------------------------------------------- */
  const copyBtn = document.getElementById('copy-btn');
  const emailTextEl = document.getElementById('email-text');
  const copyToast = document.getElementById('copy-toast');

  if (copyBtn && emailTextEl && copyToast) {
    copyBtn.addEventListener('click', async () => {
      const emailText = emailTextEl.innerText;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(emailText);
        } else {
          // 클립보드 API를 사용할 수 없는 환경을 위한 폴백
          const tempInput = document.createElement('input');
          tempInput.value = emailText;
          tempInput.style.position = 'fixed';
          tempInput.style.opacity = '0';
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        copyToast.classList.remove('is-hidden');
        copyBtn.innerText = 'Copied!';

        setTimeout(() => {
          copyToast.classList.add('is-hidden');
          copyBtn.innerText = 'Copy';
        }, 3000);
      } catch (err) {
        console.warn('클립보드 복사에 실패했습니다: ', err);
      }
    });
  }

  /* ----------------------------------------------------------
     3. 메시지 수신 폼 발송 시뮬레이터
     ---------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formSuccess.classList.remove('is-hidden');
      contactForm.reset();

      setTimeout(() => {
        formSuccess.classList.add('is-hidden');
      }, 6000);
    });
  }
});
