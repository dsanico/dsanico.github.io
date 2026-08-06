(() => {
  const indicator = document.querySelector(".asset-loading-indicator");
  if (!indicator) return;

  const tasks = new Map();
  let nextId = 0;
  let revealTimer;

  function refresh() {
    window.clearTimeout(revealTimer);
    const now = performance.now();
    const pending = [...tasks.values()];
    const overdue = pending.some((task) => now - task.startedAt >= 500);
    indicator.classList.toggle("is-visible", overdue);
    indicator.setAttribute("aria-hidden", String(!overdue));

    if (!overdue && pending.length) {
      const remaining = Math.min(...pending.map((task) => 500 - (now - task.startedAt)));
      revealTimer = window.setTimeout(refresh, Math.max(0, remaining));
    }
  }

  window.assetLoader = {
    begin() {
      const id = ++nextId;
      tasks.set(id, { startedAt: performance.now() });
      refresh();
      return id;
    },
    end(id) {
      tasks.delete(id);
      refresh();
    }
  };

  const heroVideo = document.querySelector(".bgimage-video video");
  if (heroVideo && heroVideo.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
    const videoTask = window.assetLoader.begin();
    const finishVideoTask = () => window.assetLoader.end(videoTask);
    heroVideo.addEventListener("canplay", finishVideoTask, { once: true });
    heroVideo.addEventListener("error", finishVideoTask, { once: true });
  }
})();
