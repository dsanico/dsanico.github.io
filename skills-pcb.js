function initBayboardSkills() {
  const section = document.getElementById("skills");
  const workspace = section?.querySelector(".bayboard-workspace");
  const image = section?.querySelector(".bayboard-image-frame > img");
  const panel = section?.querySelector(".bayboard-skill-panel");
  const panelEmpty = panel?.querySelector(".bayboard-panel-empty");
  const panelContent = panel?.querySelector(".bayboard-panel-content");
  const summaryReset = section?.querySelector(".bayboard-summary-reset");
  const activeLine = section?.querySelector(".bayboard-active-line");
  const callouts = [...(section?.querySelectorAll(".bayboard-callout") ?? [])];

  if (!section || !workspace || !image || !panel || !panelEmpty || !panelContent || !summaryReset || !activeLine || !callouts.length) return;

  const categories = {
    hardware: {
      number: 1,
      kicker: "BOARD DEVELOPMENT",
      title: "Hardware Design",
      description: "I've taken hardware from requirements and architecture through schematic capture, layout, and assembly.",
      skills: ["Altium", "PCB schematics", "PCB layout", "Component selection"],
    },
    test: {
      number: 2,
      kicker: "VERIFICATION / VALIDATION",
      title: "Hardware Test",
      description: "I've used instrumentation and repeatable test methods to prove that hardware meets its requirements.",
      skills: ["Oscilloscope", "DMM", "VNA", "Bode plot analyzer", "MATLAB", "Pytest"],
    },
    digital: {
      number: 3,
      kicker: "DIGITAL SYSTEMS",
      title: "Digital Design",
      description: "I've designed logic and interfaces that move data between devices and board-level subsystems.",
      skills: ["MCUs", "SPI", "I2C", "Ethernet","Shift registers", "Digital Sensors", "VHDL", "Digital logic"],
    },
    analog: {
      number: 4,
      kicker: "ANALOG SYSTEMS",
      title: "Analog Design",
      description: "I've analyzed, simulated, and conditioned real-world signals in mixed-signal systems.",
      skills: ["Circuit analysis", "LTspice", "Signal conditioning", "Filtering", "Analog sensors", "Mixed-signal design"],
    },
    programming: {
      number: 5,
      kicker: "SOFTWARE / FIRMWARE",
      title: "Programming",
      description: "I've developed software and low-level firmware that controls, validates, and supports embedded hardware.",
      skills: ["C", "C++", "Python", "Assembly", "Embedded firmware", "Pytest", "Qiskit"],
    },
    other: {
      number: 6,
      kicker: "TOOLS / INTEGRATION",
      title: "Other Skills",
      description: "I've supported engineering work with practical development, collaboration, and system-integration tools.",
      skills: ["Linux", "Git", "Docker", "Azure", "Systems integration", "Hardware assembly"],
    },
  };

  const title = panel.querySelector(".bayboard-panel-title");
  const kicker = panel.querySelector(".bayboard-panel-kicker");
  const description = panel.querySelector(".bayboard-panel-description");
  const skillsList = panel.querySelector(".bayboard-panel-skills");
  const panelNumber = panelContent.querySelector(".bayboard-panel-number");
  const orderedCallouts = [...callouts].sort((a, b) => (
    categories[a.dataset.skillCategory].number - categories[b.dataset.skillCategory].number
  ));

  let activeCallout = null;
  let activePanelIndex = 0;
  let scrollLocked = false;
  let bypassingScroll = false;
  let wheelAccumulator = 0;
  let wheelDirection = 0;
  let lastWheelStep = 0;
  let touchStartY = 0;
  let touchStepped = false;

  function getPanelAnchorPercent(callout) {
    const value = getComputedStyle(callout).getPropertyValue("--panel-anchor-y");
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 50;
  }

  function updateActiveLine() {
    if (!activeCallout || window.matchMedia("(max-width: 800px)").matches) {
      activeLine.classList.remove("is-visible");
      return;
    }

    const workspaceRect = workspace.getBoundingClientRect();
    const pointRect = activeCallout.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const startX = pointRect.left + pointRect.width / 2 - workspaceRect.left;
    const startY = pointRect.top + pointRect.height / 2 - workspaceRect.top;
    const endX = panelRect.left - workspaceRect.left;
    const endY = panelRect.top - workspaceRect.top + panelRect.height * (getPanelAnchorPercent(activeCallout) / 100);
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const diagonalX = Math.abs(deltaY);
    const diagonalLength = Math.SQRT2 * diagonalX;
    const diagonalAngle = deltaY < 0 ? -45 : 45;
    const horizontalDelta = deltaX - diagonalX;

    activeLine.style.left = `${startX}px`;
    activeLine.style.top = `${startY}px`;
    activeLine.style.setProperty("--diagonal-length", `${diagonalLength}px`);
    activeLine.style.setProperty("--diagonal-angle", `${diagonalAngle}deg`);
    activeLine.style.setProperty("--elbow-x", `${diagonalX}px`);
    activeLine.style.setProperty("--elbow-y", `${deltaY}px`);
    activeLine.style.setProperty("--horizontal-length", `${Math.abs(horizontalDelta)}px`);
    activeLine.style.setProperty("--horizontal-angle", horizontalDelta < 0 ? "180deg" : "0deg");
    activeLine.classList.add("is-visible");
  }

  function selectCategory(callout) {
    const category = categories[callout.dataset.skillCategory];
    if (!category) return;

    activeCallout = callout;
    activePanelIndex = category.number;
    callouts.forEach((item) => {
      const isActive = item === callout;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    panel.classList.add("is-open");
    panelEmpty.hidden = true;
    panelContent.hidden = false;
    panelNumber.textContent = String(category.number).padStart(2, "0");
    kicker.textContent = category.kicker;
    title.textContent = category.title;
    description.textContent = category.description;
    skillsList.replaceChildren(...category.skills.map((skill) => {
      const item = document.createElement("li");
      item.textContent = skill;
      return item;
    }));
    summaryReset.hidden = false;

    requestAnimationFrame(updateActiveLine);
  }

  function showSummary() {
    activeCallout = null;
    activePanelIndex = 0;
    callouts.forEach((callout) => {
      callout.classList.remove("is-active");
      callout.setAttribute("aria-pressed", "false");
    });
    panel.classList.remove("is-open");
    panelEmpty.hidden = false;
    panelContent.hidden = true;
    panel.scrollTop = 0;
    summaryReset.hidden = true;
    activeLine.classList.remove("is-visible");
  }

  callouts.forEach((callout) => {
    callout.setAttribute("aria-pressed", "false");
    callout.addEventListener("click", () => selectCategory(callout));
  });

  summaryReset.addEventListener("click", showSummary);

  function showPanel(index) {
    const nextIndex = ((index % 7) + 7) % 7;
    if (nextIndex === activePanelIndex) return;
    if (nextIndex === 0) showSummary();
    else selectCategory(orderedCallouts[nextIndex - 1]);
  }

  function lockScroll() {
    if (scrollLocked || bypassingScroll) return;
    scrollLocked = true;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    window.siteLenis?.scrollTo(sectionTop, { immediate: true, force: true });
    window.scrollTo(0, sectionTop);
    window.siteLenis?.stop();
    document.documentElement.classList.add("skills-scroll-clamped");
  }

  function releaseScroll({ bypassSection = false } = {}) {
    if (bypassSection) bypassingScroll = true;
    if (!scrollLocked) return;
    scrollLocked = false;
    wheelAccumulator = 0;
    wheelDirection = 0;
    lastWheelStep = 0;
    document.documentElement.classList.remove("skills-scroll-clamped");
    window.siteLenis?.start();
  }

  function rearmScroll() {
    bypassingScroll = false;
  }

  function stepForDirection(direction) {
    showPanel(activePanelIndex + (direction > 0 ? 1 : -1));
  }

  function onWheel(event) {
    if (!scrollLocked) return;
    event.preventDefault();
    event.stopPropagation();
    const delta = event.deltaMode === 1 ? event.deltaY * 18 : event.deltaY;
    const nextDirection = Math.sign(delta);
    if (nextDirection && nextDirection !== wheelDirection) wheelAccumulator = 0;
    wheelDirection = nextDirection || wheelDirection;
    wheelAccumulator += delta;
    if (Math.abs(wheelAccumulator) < 70) return;
    const now = performance.now();
    if (now - lastWheelStep < 340) return;
    stepForDirection(wheelAccumulator);
    wheelAccumulator = 0;
    lastWheelStep = now;
  }

  function onTouchStart(event) {
    if (!scrollLocked) return;
    touchStartY = event.touches[0]?.clientY ?? 0;
    touchStepped = false;
  }

  function onTouchMove(event) {
    if (!scrollLocked) return;
    event.preventDefault();
    if (touchStepped) return;
    const currentY = event.touches[0]?.clientY ?? touchStartY;
    const delta = touchStartY - currentY;
    if (Math.abs(delta) < 55) return;
    stepForDirection(delta);
    touchStepped = true;
  }

  function onKeyDown(event) {
    if (!scrollLocked || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (["ArrowUp", "PageUp", "Home"].includes(event.key)) {
      event.preventDefault();
      showPanel(event.key === "Home" ? 0 : activePanelIndex - 1);
    } else if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) {
      event.preventDefault();
      showPanel(event.key === "End" ? 6 : activePanelIndex + 1);
    }
  }

  const clampTrigger = typeof ScrollTrigger !== "undefined" ? ScrollTrigger.create({
    trigger: section,
    start: "top 35%",
    end: "bottom 65%",
    onEnter: lockScroll,
    onEnterBack: lockScroll,
    onLeave: rearmScroll,
    onLeaveBack: rearmScroll,
  }) : null;

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.skillsScrollClamp = { lock: lockScroll, release: releaseScroll, rearm: rearmScroll, showPanel };

  section.querySelectorAll("[data-skills-exit]").forEach((button) => {
    button.addEventListener("click", () => {
      releaseScroll();
      const scene = document.getElementById("hero-about-scene");
      if (scene) {
        const aboutPosition = scene.offsetTop + window.innerHeight * 0.97;
        window.siteLenis?.scrollTo(aboutPosition, { duration: 1.2 });
      }
    });
  });

  section.querySelector("[data-skills-projects]")?.addEventListener("click", () => {
    releaseScroll();
    const projects = document.getElementById("projects");
    if (projects) window.siteLenis?.scrollTo(projects, { duration: 1.1, force: true });
  });

  const resizeObserver = new ResizeObserver(updateActiveLine);
  resizeObserver.observe(workspace);
  resizeObserver.observe(image);
  resizeObserver.observe(panel);
  window.addEventListener("load", updateActiveLine);
  window.addEventListener("resize", updateActiveLine);
  window.addEventListener("pagehide", () => {
    releaseScroll();
    clampTrigger?.kill();
    window.removeEventListener("wheel", onWheel, true);
    window.removeEventListener("touchstart", onTouchStart, true);
    window.removeEventListener("touchmove", onTouchMove, true);
    window.removeEventListener("keydown", onKeyDown, true);
  }, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBayboardSkills);
} else {
  initBayboardSkills();
}
