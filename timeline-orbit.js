(() => {
  const scene = document.querySelector(".orbital-timeline");
  const stage = document.querySelector(".orbital-stage");
  const legacyItems = [...document.querySelectorAll(".timeline-legacy .timeline-item")];
  if (!scene || !stage || !legacyItems.length || typeof gsap === "undefined") return;

  const panel = document.querySelector(".orbit-event-panel");
  const eventImage = panel.querySelector(".orbit-event-image");
  const eventDate = panel.querySelector(".orbit-event-date");
  const eventTitle = panel.querySelector(".orbit-event-title");
  const eventDescription = panel.querySelector(".orbit-event-description");
  const eventIndex = panel.querySelector(".orbit-event-index");
  let activeIndex = -1;

  const events = legacyItems.map((item) => ({
    image: item.querySelector(".timeline-image img")?.getAttribute("src") || "",
    imageAlt: item.querySelector(".timeline-image img")?.getAttribute("alt") || "",
    title: item.querySelector(".item-tag-1")?.textContent.trim() || "Mission milestone",
    date: item.querySelector(".timeline-date")?.textContent.replace(/^\|\s*/, "").trim() || "",
    description: item.querySelector(".timeline-content p")?.textContent.trim().replace(/\s+/g, " ") || ""
  }));

  function showEvent(index, animate = true) {
    if (index === activeIndex || !events[index]) return;
    activeIndex = index;
    const event = events[index];

    eventImage.src = event.image;
    eventImage.alt = event.imageAlt;
    eventDate.textContent = event.date;
    eventTitle.textContent = event.title;
    eventDescription.textContent = event.description;
    eventIndex.textContent = String(index + 1).padStart(2, "0");

    if (animate) {
      gsap.fromTo(panel, { autoAlpha: 0.45, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35, overwrite: true });
    }
  }

  showEvent(0, false);

  const motion = gsap.timeline({ defaults: { ease: "none" } });
  motion
    .to(".orbit-tower", { y: "28vh", autoAlpha: 0, duration: 0.14 }, 0.08)
    .to(".liquid-metal-rocket", { y: "-28vh", rotation: 2, duration: 0.22 }, 0.04)
    .to(".orbit-earth", { scale: 0.86, yPercent: 16, duration: 0.35 }, 0.08)
    .to(".orbit-cloud--1", { y: "80vh", x: "-12vw", duration: 0.36 }, 0.12)
    .to(".orbit-cloud--2", { y: "92vh", x: "9vw", duration: 0.4 }, 0.14)
    .to(".orbit-cloud--3", { y: "72vh", x: "16vw", duration: 0.34 }, 0.18)
    .to(".orbit-cloud--4", { y: "105vh", duration: 0.42 }, 0.1)
    .to(".orbit-cloud--5", { y: "96vh", duration: 0.4 }, 0.16)
    .to(".orbit-atmosphere", { autoAlpha: 1, duration: 0.28 }, 0.34)
    .to(stage, { backgroundColor: "#03050a", duration: 0.28 }, 0.34)
    .to(".orbit-stars", { autoAlpha: 1, duration: 0.22 }, 0.42)
    .to(".orbit-earth", { scale: 0.62, yPercent: 34, duration: 0.36 }, 0.42)
    .to(".liquid-metal-rocket", { y: "-56vh", x: "12vw", rotation: 35, duration: 0.28 }, 0.28)
    .to(".orbit-trajectory", { autoAlpha: 1, scaleX: 1, duration: 0.3 }, 0.58)
    .to(".liquid-metal-rocket", { x: "34vw", y: "-63vh", rotation: 92, scale: 0.82, duration: 0.3 }, 0.58)
    .to(".orbit-satellite", { x: "-24vw", autoAlpha: 0.82, rotation: -12, duration: 0.3 }, 0.7)
    .to(".orbit-star", { rotation: 90, stagger: 0.035, duration: 0.24 }, 0.72);

  motion.pause(0);

  let locked = false;
  let targetProgress = 0;
  let touchY = 0;
  const progressStep = 1 / Math.max(events.length - 1, 1);

  function renderProgress(progress, animate = true) {
    targetProgress = gsap.utils.clamp(0, 1, progress);
    gsap.to(motion, {
      progress: targetProgress,
      duration: animate ? 0.38 : 0,
      ease: "power2.out",
      overwrite: true
    });
    showEvent(Math.min(events.length - 1, Math.round(targetProgress * (events.length - 1))));
    gsap.to(".orbit-progress-track i", {
      scaleX: targetProgress,
      duration: animate ? 0.28 : 0,
      overwrite: true
    });
  }

  function lock() {
    if (locked) return;
    locked = true;
    const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
    window.siteLenis?.scrollTo(sceneTop, { immediate: true, force: true });
    window.scrollTo(0, sceneTop);
    window.siteLenis?.stop();
    document.documentElement.classList.add("orbit-scroll-clamped");
  }

  function release() {
    if (!locked) return;
    locked = false;
    document.documentElement.classList.remove("orbit-scroll-clamped");
    window.siteLenis?.start();
  }

  function moveBy(delta) {
    renderProgress(targetProgress + delta);
  }

  function onWheel(event) {
    if (!locked) return;
    event.preventDefault();
    event.stopPropagation();
    const pixels = event.deltaMode === 1 ? event.deltaY * 18 : event.deltaY;
    moveBy(pixels / (window.innerHeight * 3.2));
  }

  function onTouchStart(event) {
    if (!locked) return;
    touchY = event.touches[0]?.clientY ?? 0;
  }

  function onTouchMove(event) {
    if (!locked) return;
    const nextY = event.touches[0]?.clientY ?? touchY;
    const delta = touchY - nextY;
    touchY = nextY;
    event.preventDefault();
    moveBy(delta / (window.innerHeight * 1.8));
  }

  function onKeyDown(event) {
    if (!locked || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const forward = ["ArrowDown", "PageDown", " "];
    const backward = ["ArrowUp", "PageUp"];
    if (forward.includes(event.key)) {
      event.preventDefault();
      moveBy(progressStep);
    } else if (backward.includes(event.key)) {
      event.preventDefault();
      moveBy(-progressStep);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      renderProgress(event.key === "Home" ? 0 : 1);
    }
  }

  const clampTrigger = ScrollTrigger.create({
    trigger: scene,
    start: "top top",
    end: "bottom top",
    onEnter: lock,
    onEnterBack: lock
  });

  document.querySelector(".orbit-step--previous")?.addEventListener("click", () => moveBy(-progressStep));
  document.querySelector(".orbit-step--next")?.addEventListener("click", () => moveBy(progressStep));
  document.querySelector(".orbit-back-projects")?.addEventListener("click", () => {
    release();
    const projects = document.getElementById("projects");
    if (projects) window.siteLenis?.scrollTo(projects, { duration: 1.1, force: true });
  });

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });

  window.orbitTimelineClamp = { lock, release, setProgress: renderProgress };
  renderProgress(0, false);

  window.addEventListener("pagehide", () => {
    release();
    clampTrigger.kill();
    window.removeEventListener("wheel", onWheel, true);
    window.removeEventListener("touchstart", onTouchStart, true);
    window.removeEventListener("touchmove", onTouchMove, true);
    window.removeEventListener("keydown", onKeyDown, true);
  }, { once: true });
})();
