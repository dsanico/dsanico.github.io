(() => {
  const scene = document.querySelector(".orbital-timeline");
  const diagram = document.querySelector(".orbit-diagram");
  const legacyItems = [...document.querySelectorAll(".timeline-legacy .timeline-item")];
  if (!scene || !diagram || !legacyItems.length || typeof gsap === "undefined") return;

  const panel = document.querySelector(".orbit-event-panel");
  const eventDate = panel.querySelector(".orbit-event-date");
  const eventTitle = panel.querySelector(".orbit-event-title");
  const eventRole = panel.querySelector(".orbit-event-role");
  const eventPhoto = panel.querySelector(".orbit-event-photo");
  const eventDescription = panel.querySelector(".orbit-event-description");
  const eventIndex = panel.querySelector(".orbit-event-index");
  const eventPhase = panel.querySelector(".orbit-event-phase");
  const world = document.querySelector(".orbit-world");
  const trajectory = document.querySelector(".orbit-trajectory-main");
  const rocket = document.querySelector(".orbit-spacecraft-marker");

  const events = legacyItems.reverse().map((item, index, list) => {
    const middleCount = Math.max(list.length - 2, 0);
    const skyCount = Math.ceil(middleCount / 2);
    let icon = "images/tl_animation/satellite.svg";
    if (index === 0) icon = "images/tl_animation/tower.svg";
    else if (index === list.length - 1) icon = "images/tl_animation/earth.svg";
    else if (index <= skyCount) icon = `images/tl_animation/cloud_0${(index % 5) + 1}.svg`;
    else if (index % 2) icon = "images/tl_animation/atom.svg";

    const sourceTitle = item.querySelector(".item-tag-1")?.textContent.trim() || "Mission milestone";
    const separatorIndex = sourceTitle.lastIndexOf(" @ ");
    const sourceImage = item.querySelector(".timeline-image img");
    return {
      organization: separatorIndex >= 0 ? sourceTitle.slice(separatorIndex + 3) : sourceTitle,
      role: separatorIndex >= 0 ? sourceTitle.slice(0, separatorIndex) : "",
      date: item.querySelector(".timeline-date")?.textContent.replace(/^\|\s*/, "").trim() || "",
      description: item.querySelector(".timeline-content p")?.textContent.trim().replace(/\s+/g, " ") || "",
      image: sourceImage?.getAttribute("src") || "",
      imageAlt: sourceImage?.getAttribute("alt") || "",
      icon
    };
  });

  let activeIndex = -1;
  let locked = false;
  let bypassingScroll = false;
  let targetProgress = 0;
  let touchY = 0;
  let iconUpdateTimer;
  const motion = { progress: 0 };
  const finalIndex = Math.max(events.length - 1, 1);

  function updateEvent(index, animate = true) {
    if (activeIndex === index || !events[index]) return;
    activeIndex = index;
    const event = events[index];
    eventTitle.textContent = event.organization;
    eventRole.textContent = event.role;
    eventRole.hidden = !event.role;
    eventPhoto.src = event.image;
    eventPhoto.alt = event.imageAlt;
    eventDate.textContent = event.date;
    eventDescription.textContent = event.description;
    eventIndex.textContent = String(index + 1).padStart(2, "0");
    eventPhase.textContent = `EVENT NODE / ${String(index + 1).padStart(2, "0")} / ${Math.round((index / finalIndex) * 36000)} KM`;
    window.clearTimeout(iconUpdateTimer);
    iconUpdateTimer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("orbitstagechange", { detail: { icon: event.icon } }));
    }, 90);

    if (animate) {
      gsap.fromTo(panel, { autoAlpha: 0.72, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.18, ease: "power1.out" });
    }
  }

  function plotRocket(progress) {
    const pathPoint = trajectory.getPointAtLength(trajectory.getTotalLength() * progress);
    const viewBox = trajectory.ownerSVGElement.viewBox.baseVal;
    const pathX = (pathPoint.x - viewBox.x) / viewBox.width * world.clientWidth;
    const pathY = (pathPoint.y - viewBox.y) / viewBox.height * world.clientHeight;
    gsap.set(rocket, { x: pathX, y: pathY });
  }

  function displayProgress(progress) {
    const index = Math.min(events.length - 1, Math.round(progress * finalIndex));
    updateEvent(index, true);
    plotRocket(progress);
    gsap.set(".orbit-progress-track i", { scaleX: progress });
  }

  function renderProgress(progress) {
    targetProgress = gsap.utils.clamp(0, 1, progress);
    gsap.killTweensOf(motion);
    motion.progress = targetProgress;
    displayProgress(targetProgress);
  }

  function goToStage(index) {
    const stageIndex = gsap.utils.clamp(0, events.length - 1, index);
    targetProgress = stageIndex / finalIndex;
    updateEvent(stageIndex, true);
    gsap.killTweensOf(motion);
    gsap.to(motion, {
      progress: targetProgress,
      duration: 0.72,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => {
        plotRocket(motion.progress);
        gsap.set(".orbit-progress-track i", { scaleX: motion.progress });
      }
    });
  }

  function lock() {
    if (locked || bypassingScroll) return;
    locked = true;
    const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
    window.siteLenis?.scrollTo(sceneTop, { immediate: true, force: true });
    window.scrollTo(0, sceneTop);
    window.siteLenis?.stop();
    document.documentElement.classList.add("orbit-scroll-clamped");
  }

  function release({ bypassSection = false } = {}) {
    if (bypassSection) bypassingScroll = true;
    if (!locked) return;
    locked = false;
    document.documentElement.classList.remove("orbit-scroll-clamped");
    window.siteLenis?.start();
  }

  function rearm() {
    bypassingScroll = false;
  }

  function onWheel(event) {
    if (!locked) return;
    event.preventDefault();
    event.stopPropagation();
    const pixels = event.deltaMode === 1 ? event.deltaY * 18 : event.deltaY;
    renderProgress(targetProgress + pixels / (window.innerHeight * 7.5));
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
    renderProgress(targetProgress + delta / (window.innerHeight * 3.8));
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
      goToStage(event.key === "Home" ? 0 : events.length - 1);
    }
  }

  const clampTrigger = ScrollTrigger.create({
    trigger: scene,
    start: "top top",
    end: "bottom top",
    onEnter: lock,
    onEnterBack: lock,
    onLeave: rearm,
    onLeaveBack: rearm
  });
  document.querySelector(".orbit-step--previous")?.addEventListener("click", () => goToStage(activeIndex - 1));
  document.querySelector(".orbit-step--next")?.addEventListener("click", () => goToStage(activeIndex + 1));
  document.querySelector(".orbit-back-projects")?.addEventListener("click", () => {
    release({ bypassSection: true });
    const projects = document.getElementById("projects");
    if (projects) window.siteLenis?.scrollTo(projects, { duration: 1.1, force: true, onComplete: rearm });
  });
  document.querySelector(".orbit-go-contact")?.addEventListener("click", () => {
    release({ bypassSection: true });
    const contact = document.getElementById("contact");
    if (contact) window.siteLenis?.scrollTo(contact, { duration: 1.1, force: true, onComplete: rearm });
  });

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("resize", () => plotRocket(motion.progress), { passive: true });
  window.orbitTimelineClamp = { lock, release, rearm, setProgress: renderProgress, goToStage };
  renderProgress(0);

  window.addEventListener("pagehide", () => {
    window.clearTimeout(iconUpdateTimer);
    release();
    clampTrigger.kill();
    window.removeEventListener("wheel", onWheel, true);
    window.removeEventListener("touchstart", onTouchStart, true);
    window.removeEventListener("touchmove", onTouchMove, true);
    window.removeEventListener("keydown", onKeyDown, true);
  }, { once: true });
})();
