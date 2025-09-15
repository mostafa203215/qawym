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
});
