document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loading");

  const preloader = document.querySelector(".preloader");
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("hidden");
      document.body.classList.remove("loading");
    }, 800);
  });

  function revealOnScroll() {
    document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll, { passive: true });
  revealOnScroll();
  (function () {
    const scrollBtn = document.getElementById("scrollTopBtn");
    if (!scrollBtn) return;

    let isScrolling = false;

    function checkScroll() {
      if (window.scrollY > 100) {
        scrollBtn.classList.add("show");
        scrollBtn.setAttribute("aria-hidden", "false");
      } else {
        scrollBtn.classList.remove("show");
        scrollBtn.setAttribute("aria-hidden", "true");
      }
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function smoothScrollToTop(duration = 900) {
      if (isScrolling) return;
      isScrolling = true;
      const start = window.scrollY || document.documentElement.scrollTop;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, Math.round(start * (1 - eased)));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          isScrolling = false;
        }
      }
      requestAnimationFrame(step);
    }

    scrollBtn.addEventListener("click", () => {
      if (isScrolling) return;

      scrollBtn.classList.add("click-anim");
      scrollBtn.disabled = true;

      setTimeout(() => {
        scrollBtn.classList.remove("click-anim");
        smoothScrollToTop(900);

        setTimeout(() => {
          scrollBtn.disabled = false;
        }, 1100);
      }, 350);
    });

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
  })();
});
