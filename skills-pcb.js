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

  let activeCallout = null;
  let locked = false;
  let released = false;

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

  function lock() {
    if (released) return;
    locked = true;
    section.classList.add("is-scroll-locked");
    window.siteLenis?.scrollTo(section, { immediate: true, force: true });
    window.siteLenis?.stop();
  }

  function release() {
    released = true;
    locked = false;
    section.classList.remove("is-scroll-locked");
    window.siteLenis?.start();
  }

  window.skillsScrollLock = { release };

  callouts.forEach((callout) => {
    callout.setAttribute("aria-pressed", "false");
    callout.addEventListener("click", () => selectCategory(callout));
  });

  summaryReset.addEventListener("click", showSummary);

  section.querySelectorAll("[data-skills-exit]").forEach((button) => {
    button.addEventListener("click", () => {
      release();

      if (button.dataset.skillsExit === "projects") {
        window.siteLenis?.scrollTo(document.getElementById("projects"), { duration: 1.2 });
        return;
      }

      const scene = document.getElementById("hero-about-scene");
      if (scene) {
        const aboutPosition = scene.offsetTop + window.innerHeight * 0.97;
        window.siteLenis?.scrollTo(aboutPosition, { duration: 1.2 });
      }
    });
  });

  function panelCanScroll(deltaY) {
    if (panel.scrollHeight <= panel.clientHeight) return false;
    if (deltaY < 0) return panel.scrollTop > 1;
    return panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1;
  }

  window.addEventListener("wheel", (event) => {
    if (!locked) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".bayboard-skill-panel") && panelCanScroll(event.deltaY)) return;
    event.preventDefault();
  }, { passive: false, capture: true });

  window.addEventListener("touchmove", (event) => {
    if (!locked) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".bayboard-skill-panel")) return;
    event.preventDefault();
  }, { passive: false, capture: true });

  window.addEventListener("keydown", (event) => {
    if (!locked) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.matches("input, textarea, button, [contenteditable='true']")) return;
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      event.preventDefault();
    }
  }, { capture: true });

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom top",
    onEnter: () => { released = false; requestAnimationFrame(lock); },
    onEnterBack: () => { released = false; requestAnimationFrame(lock); },
    onLeave: () => { locked = false; section.classList.remove("is-scroll-locked"); },
    onLeaveBack: () => { locked = false; section.classList.remove("is-scroll-locked"); },
  });

  const resizeObserver = new ResizeObserver(updateActiveLine);
  resizeObserver.observe(workspace);
  resizeObserver.observe(image);
  resizeObserver.observe(panel);
  window.addEventListener("load", updateActiveLine);
  window.addEventListener("resize", updateActiveLine);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBayboardSkills);
} else {
  initBayboardSkills();
}
