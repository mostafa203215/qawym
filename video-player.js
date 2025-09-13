class VideoPlayer {
  constructor(container, videoSrc) {
    this.videoContainer = container;
    this.playButton = container.querySelector(".play-button");
    this.videoSrc = videoSrc;
    this.init();
  }

  init() {
    this.playButton.addEventListener("click", () => {
      this.playVideo();
    });

    this.videoContainer.addEventListener("click", (e) => {
      if (e.target === this.videoContainer) {
        this.playVideo();
      }
    });
  }

  playVideo() {
    this.playButton.style.display = "none";

    const video = document.createElement("video");
    video.src = this.videoSrc;
    video.controls = true;
    video.autoplay = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.borderRadius = "15px";

    this.videoContainer.innerHTML = "";
    this.videoContainer.appendChild(video);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new VideoPlayer(
    document.querySelector(".hero .video-content-area"),
    "./videos/قويم.mp4"
  );
});
