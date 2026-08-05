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
  const eventPhase = panel.querySelector(".orbit-event-phase");
  const clouds = gsap.utils.toArray(".orbit-cloud");
  const stars = gsap.utils.toArray(".orbit-star");
  const satellites = gsap.utils.toArray(".orbit-satellite");

  // The legacy list is newest-first. The flight begins with the oldest event
  // on the ground and ends with the newest event in the final orbital view.
  const events = legacyItems.reverse().map((item) => ({
    image: item.querySelector(".timeline-image img")?.getAttribute("src") || "",
    imageAlt: item.querySelector(".timeline-image img")?.getAttribute("alt") || "",
    title: item.querySelector(".item-tag-1")?.textContent.trim() || "Mission milestone",
    date: item.querySelector(".timeline-date")?.textContent.replace(/^\|\s*/, "").trim() || "",
    description: item.querySelector(".timeline-content p")?.textContent.trim().replace(/\s+/g, " ") || ""
  }));

  const middleCount = Math.max(events.length - 2, 0);
  const skyCount = Math.ceil(middleCount / 2);
  const spaceCount = middleCount - skyCount;
  const skyPalette = ["#5eadd8", "#719bc7", "#917eaf", "#bd7488", "#dc7d67"];
  const spacePalette = ["#101d38", "#091329", "#050a18"];

  const samplePalette = (palette, progress) => {
    if (palette.length === 1) return palette[0];
    const scaled = gsap.utils.clamp(0, 1, progress) * (palette.length - 1);
    const left = Math.floor(scaled);
    const right = Math.min(left + 1, palette.length - 1);
    return gsap.utils.interpolate(palette[left], palette[right], scaled - left);
  };

  const stages = events.map((event, index) => {
    if (index === 0) return { ...event, phase: "ground", phaseIndex: 0, color: "#78bce1" };
    if (index === events.length - 1) return { ...event, phase: "final", phaseIndex: 0, color: "#02040b" };
    if (index <= skyCount) {
      const phaseIndex = index - 1;
      return {
        ...event,
        phase: "sky",
        phaseIndex,
        color: samplePalette(skyPalette, skyCount <= 1 ? 0 : phaseIndex / (skyCount - 1))
      };
    }
    const phaseIndex = index - skyCount - 1;
    return {
      ...event,
      phase: "space",
      phaseIndex,
      color: samplePalette(spacePalette, spaceCount <= 1 ? 0.5 : phaseIndex / (spaceCount - 1))
    };
  });

  let activeIndex = -1;
  let locked = false;
  let targetProgress = 0;
  let touchY = 0;
  let sceneTransition;
  const progressStep = 1 / Math.max(stages.length - 1, 1);

  function phaseLabel(stageData) {
    if (stageData.phase === "ground") return "GROUND / T−00";
    if (stageData.phase === "sky") return `ATMOSPHERE / STAGE ${stageData.phaseIndex + 1}`;
    if (stageData.phase === "space") return `ORBIT / PASS ${stageData.phaseIndex + 1}`;
    return "FINAL ORBIT / MISSION CURRENT";
  }

  function updateCard(index, animate = true) {
    const stageData = stages[index];
    if (!stageData) return;
    eventImage.src = stageData.image;
    eventImage.alt = stageData.imageAlt;
    eventDate.textContent = stageData.date;
    eventTitle.textContent = stageData.title;
    eventDescription.textContent = stageData.description;
    eventIndex.textContent = String(index + 1).padStart(2, "0");
    eventPhase.textContent = phaseLabel(stageData);

    if (animate) {
      gsap.fromTo(panel, { autoAlpha: 0.35, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.48, ease: "power2.out" });
    }
  }

  function transitionTo(index, animate = true) {
    if (index === activeIndex || !stages[index]) return;
    const previousIndex = activeIndex;
    const stageData = stages[index];
    const direction = index >= previousIndex ? 1 : -1;
    activeIndex = index;
    updateCard(index, animate);
    scene.dataset.phase = stageData.phase;

    sceneTransition?.kill();
    sceneTransition = gsap.timeline({ defaults: { overwrite: "auto" } });
    const duration = animate ? 0.65 : 0;
    const isSky = stageData.phase === "sky";
    const isSpace = stageData.phase === "space" || stageData.phase === "final";
    const isGround = stageData.phase === "ground";
    const isFinal = stageData.phase === "final";

    sceneTransition
      .to(stage, { backgroundColor: stageData.color, duration }, 0)
      .to(".orbit-atmosphere", { autoAlpha: isSpace ? 1 : 0, duration }, 0)
      .to(".orbit-ground", { y: isGround ? 0 : "28vh", autoAlpha: isGround ? 1 : 0, duration }, 0)
      .to(".orbit-tower", { y: isGround ? 0 : "34vh", autoAlpha: isGround ? 0.42 : 0, duration }, 0)
      .to(".orbit-earth", {
        autoAlpha: isFinal ? 0.9 : 0,
        scale: isFinal ? 1 : 1.2,
        yPercent: isFinal ? 0 : 18,
        duration
      }, 0)
      .to(".liquid-metal-rocket", {
        scale: isFinal ? 0.6 : 1,
        rotation: 0,
        y: isGround ? "5vh" : 0,
        duration,
        ease: "power2.inOut"
      }, 0)
      .to(".orbit-stars", { autoAlpha: isSpace ? 1 : 0, rotation: index * 24, duration }, 0)
      .to(stars, { autoAlpha: isSpace ? 0.35 : 0, rotation: index * 70, stagger: 0.04, duration }, 0)
      .to(satellites, { autoAlpha: 0, duration: duration * 0.35 }, 0);

    // Every sky stage gets a fresh cloud field. The outgoing field parts to
    // both sides, then the next field settles around the stationary rocket.
    sceneTransition
      .to(clouds, {
        x: (cloudIndex) => `${(cloudIndex % 2 ? 1 : -1) * 34 * direction}vw`,
        y: `${-8 * direction}vh`,
        autoAlpha: 0,
        stagger: 0.025,
        duration: duration * 0.48,
        ease: "power2.in"
      }, 0)
      .set(clouds, {
        x: (cloudIndex) => `${(cloudIndex % 2 ? -1 : 1) * 12}vw`,
        y: "9vh"
      }, duration * 0.5)
      .to(clouds, {
        x: 0,
        y: 0,
        autoAlpha: isSky ? 0.62 : 0,
        stagger: 0.035,
        duration: duration * 0.5,
        ease: "power2.out"
      }, duration * 0.5);

    if (isSpace && !isFinal) {
      const satellite = satellites[index % satellites.length];
      sceneTransition.fromTo(satellite, {
        x: index % 2 ? "-42vw" : "42vw",
        y: index % 2 ? "8vh" : "-6vh",
        rotation: index % 2 ? -16 : 14,
        autoAlpha: 0
      }, {
        x: index % 2 ? "18vw" : "-18vw",
        y: index % 2 ? "-4vh" : "7vh",
        autoAlpha: 0.52,
        duration: Math.max(duration, 0.9),
        ease: "power1.inOut"
      }, 0.08);

      const shootingStar = document.querySelector(".orbit-star--4");
      sceneTransition.fromTo(shootingStar, {
        x: index % 2 ? "-24vw" : "22vw",
        y: "-20vh",
        autoAlpha: 0
      }, {
        x: index % 2 ? "30vw" : "-32vw",
        y: "28vh",
        autoAlpha: 0.75,
        duration: 0.52,
        ease: "power1.in",
        repeat: 1,
        yoyo: true
      }, 0.14);
    }
  }

  function renderProgress(progress, animate = true) {
    targetProgress = gsap.utils.clamp(0, 1, progress);
    const index = Math.min(stages.length - 1, Math.round(targetProgress * (stages.length - 1)));
    transitionTo(index, animate);
    gsap.to(".orbit-progress-track i", { scaleX: targetProgress, duration: animate ? 0.25 : 0, overwrite: true });
  }

  function goToStage(index) {
    const nextIndex = gsap.utils.clamp(0, stages.length - 1, index);
    renderProgress(nextIndex / Math.max(stages.length - 1, 1));
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
    moveBy(pixels / (window.innerHeight * 3.5));
  }

  function onTouchStart(event) {
    if (locked) touchY = event.touches[0]?.clientY ?? 0;
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
    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      goToStage(activeIndex + 1);
    } else if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goToStage(activeIndex - 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      goToStage(event.key === "Home" ? 0 : stages.length - 1);
    }
  }

  const clampTrigger = ScrollTrigger.create({ trigger: scene, start: "top top", end: "bottom top", onEnter: lock, onEnterBack: lock });
  document.querySelector(".orbit-step--previous")?.addEventListener("click", () => goToStage(activeIndex - 1));
  document.querySelector(".orbit-step--next")?.addEventListener("click", () => goToStage(activeIndex + 1));
  document.querySelector(".orbit-back-projects")?.addEventListener("click", () => {
    release();
    const projects = document.getElementById("projects");
    if (projects) window.siteLenis?.scrollTo(projects, { duration: 1.1, force: true });
  });

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.orbitTimelineClamp = { lock, release, setProgress: renderProgress, goToStage };
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
