document.addEventListener("DOMContentLoaded", () => {
  const videos = [
    { src: "./videos/مساعد ذكي.mp4", text: "مساعد ذكي" },
    { src: "./videos/تعزيز القيم.mp4", text: "تعزيز القيم" },
    { src: "./videos/رحلة رقمية متوازنة.mp4", text: "رحلة رقمية متوازنة" },
    { src: "./videos/test.mp4", text: "test" },
  ];

  let currentIndex = 0;
  const videoArea = document.getElementById("features-video");
  const mainBtn = document.getElementById("main-feature-btn");

  function loadVideo(index) {
    videoArea.innerHTML = `<button class="play-button" aria-label="تشغيل الفيديو"></button>`;
    mainBtn.textContent = videos[index].text;

    new VideoPlayer(videoArea, videos[index].src);
  }

  document.getElementById("prev-video").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + videos.length) % videos.length;
    loadVideo(currentIndex);
  });

  document.getElementById("next-video").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % videos.length;
    loadVideo(currentIndex);
  });

  loadVideo(currentIndex);

  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const menuIcon = menuToggle.querySelector("i");
  const startContainer = document.querySelector(".start-container");
  const headerBar = document.querySelector(".header-bar");

  const startPlaceholder = document.createElement("div");
  startPlaceholder.classList.add("start-placeholder");
  headerBar.appendChild(startPlaceholder);

  function moveStartButton() {
    if (window.innerWidth <= 768) {
      if (!navMenu.contains(startContainer)) {
        navMenu.appendChild(startContainer);
      }
    } else {
      if (!startPlaceholder.contains(startContainer)) {
        startPlaceholder.appendChild(startContainer);
      }
    }
  }

  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");

    if (navMenu.classList.contains("show")) {
      menuIcon.classList.remove("fa-bars");
      menuIcon.classList.add("fa-xmark");
    } else {
      menuIcon.classList.remove("fa-xmark");
      menuIcon.classList.add("fa-bars");
    }

    moveStartButton();
  });

  window.addEventListener("resize", moveStartButton);

  moveStartButton();
  document.querySelectorAll(".nav-center a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        navMenu.classList.remove("show");
        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");
      }
    });
  });
  (function () {
    const scrollBtn = document.getElementById("scroll-top-btn");
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

    scrollBtn.addEventListener(
      "click",
      () => {
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
      },
      { passive: true }
    );

    window.addEventListener("scroll", checkScroll, { passive: true });

    checkScroll();
  })();
  (function () {
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function smoothScrollTo(targetY, duration = 900) {
      const startY = window.scrollY || document.documentElement.scrollTop;
      const distance = targetY - startY;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, Math.round(startY + distance * eased));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href.length > 1) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            const targetY =
              targetEl.getBoundingClientRect().top + window.scrollY - 20;
            smoothScrollTo(targetY, 900);
          }
        }
      });
    });
  })();
  function revealOnScroll() {
    document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();
  window.addEventListener("load", () => {
    const preloader = document.querySelector(".preloader");
    preloader.classList.add("hidden");
  });
  window.addEventListener("load", () => {
    const preloader = document.querySelector(".preloader");
    preloader.classList.add("hidden");

    document.body.classList.remove("hide-scroll");
  });
});
