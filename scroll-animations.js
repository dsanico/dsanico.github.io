gsap.registerPlugin(ScrollTrigger);

let lenis;

function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  window.siteLenis = lenis;

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('.navbar-nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      if (target.offsetTop > document.getElementById("hero-about-scene")?.offsetTop) {
        window.heroAboutScrollLock?.release({ bypassScene: true });
      }
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    });
  });
}

function initNavbarScroll() {
  const header = document.querySelector(".navbar");
  if (!header) return;

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const scrollY = self.scroll();
      if (scrollY >= 100) {
        header.classList.add("navbarDark");
      } else {
        header.classList.remove("navbarDark");
      }
    },
  });
}

function initNavHighlight() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".navbar-nav a");

  function changeLinkState() {
    const scrollY = lenis ? lenis.scroll : window.scrollY;
    let index = sections.length;

    while (--index && scrollY + 50 < sections[index].offsetTop) {}

    navLinks.forEach((link) => link.classList.remove("active"));
    navLinks[index] && navLinks[index].classList.add("active");
  }

  changeLinkState();
  lenis.on("scroll", changeLinkState);
}

function initHeroAboutTransition() {
  const scene = document.getElementById("hero-about-scene");
  const heroText = document.querySelector(".hero-text-animate");
  const terminalCard = document.querySelector(".terminal-card--transition");
  const sticky = document.querySelector(".hero-about-sticky");
  const continueButton = document.querySelector(".skills-continue-button");
  const skills = document.getElementById("skills");

  if (!scene || !heroText || !terminalCard || !sticky || !continueButton || !skills) return;

  let terminalComplete = false;
  let released = false;
  let touchStartY = 0;
  let settleTimer = 0;
  let settlingToTerminal = false;
  let correctingTerminalOvershoot = false;
  let bypassingScene = false;

  const cancelSettleTimer = () => {
    window.clearTimeout(settleTimer);
    settleTimer = 0;
  };

  const release = ({ bypassScene = false } = {}) => {
    cancelSettleTimer();
    settlingToTerminal = false;
    const sceneBottom = scene.offsetTop + scene.offsetHeight;
    bypassingScene = bypassScene && lenis.scroll < sceneBottom;
    released = true;
    sticky.classList.remove("is-terminal-complete");
    lenis.start();
  };

  const lockAtTerminal = (trigger) => {
    cancelSettleTimer();
    settlingToTerminal = false;
    terminalComplete = true;
    window.portfolioTerminal?.start();

    const lockPosition = trigger.end - 1;
    if (trigger.scroll() > lockPosition && !correctingTerminalOvershoot) {
      correctingTerminalOvershoot = true;
      lenis.scrollTo(lockPosition, { immediate: true, force: true });
      correctingTerminalOvershoot = false;
    }

    // Apply the visible locked state after any backward overshoot correction,
    // so that correction cannot be mistaken for intentional upward scrolling.
    sticky.classList.add("is-terminal-complete");
    lenis.stop();
  };

  window.heroAboutScrollLock = { release };

  const shouldBlockDownwardScroll = () => terminalComplete && !released;
  const isTerminalInteraction = (target) =>
    target instanceof Element && Boolean(target.closest("#portfolio-terminal"));

  window.addEventListener("wheel", (event) => {
    if (isTerminalInteraction(event.target)) return;
    if (!shouldBlockDownwardScroll()) return;
    if (event.deltaY > 0) {
      event.preventDefault();
    } else if (event.deltaY < 0) {
      lenis.start();
    }
  }, { passive: false, capture: true });

  window.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0]?.clientY ?? 0;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    if (isTerminalInteraction(event.target)) return;
    const currentY = event.touches[0]?.clientY ?? touchStartY;
    if (!shouldBlockDownwardScroll()) return;
    if (currentY < touchStartY) {
      event.preventDefault();
    } else if (currentY > touchStartY) {
      lenis.start();
    }
  }, { passive: false, capture: true });

  window.addEventListener("keydown", (event) => {
    const downwardKeys = ["ArrowDown", "PageDown", "End", " "];
    const upwardKeys = ["ArrowUp", "PageUp", "Home"];
    const isTyping = event.target instanceof Element && event.target.matches("input, textarea, [contenteditable='true']");
    if (isTyping) return;
    if (!shouldBlockDownwardScroll()) return;
    if (downwardKeys.includes(event.key)) {
      event.preventDefault();
    } else if (upwardKeys.includes(event.key)) {
      lenis.start();
    }
  }, { capture: true });

  continueButton.addEventListener("click", () => {
    release();
    lenis.scrollTo(skills, { offset: 0, duration: 1.2 });
  });

  gsap.set(heroText, {
    scale: 1,
    opacity: 1,
    transformOrigin: "center center",
  });

  gsap.set(terminalCard, {
    scale: 0.5,
    opacity: 0,
    transformOrigin: "center center",
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: "+=100%",
      pin: sticky,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        terminalComplete = self.progress >= 0.995;
        const movingDown = self.direction >= 0;

        if (terminalComplete) window.portfolioTerminal?.start();

        if (self.progress < 0.98 && !bypassingScene) released = false;
        // Once a downward transition has started, finish it after the user
        // pauses instead of leaving the terminal stranded at a partial scale.
        if (movingDown && self.progress > 0.001 && !terminalComplete && !released && !settlingToTerminal) {
          cancelSettleTimer();
          settleTimer = window.setTimeout(() => {
            settlingToTerminal = true;
            lenis.start();
            lenis.scrollTo(self.end - 1, {
              duration: 0.65,
              force: true,
              onComplete: () => {
                settlingToTerminal = false;
              },
            });
          }, 140);
        } else if (!movingDown) {
          cancelSettleTimer();
        }

        // The terminal gate only applies while progressing from Hero toward
        // Skills. Re-entering this boundary from below must remain scrollable.
        if (terminalComplete && !movingDown && !correctingTerminalOvershoot) {
          settlingToTerminal = false;
          sticky.classList.remove("is-terminal-complete");
          lenis.start();
        } else if (terminalComplete && !released) {
          lockAtTerminal(self);
        } else {
          sticky.classList.remove("is-terminal-complete");
        }
      },
      onLeave: (self) => {
        if (!released) {
          lockAtTerminal(self);
          return;
        }

        // A navbar jump has safely cleared the scene; normal Hero locking can
        // be armed again the next time the user scrolls back into it.
        bypassingScene = false;
      },
    },
  });

  tl.to(
    heroText,
    {
      scale: 0.5,
      opacity: 0,
      duration: 0.5,
      ease: "none",
    },
    0
  ).to(
    terminalCard,
    {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: "none",
    },
    0.5
  );
}

function initScrollAnimations() {
  initLenis();
  initNavbarScroll();
  initNavHighlight();
  initHeroAboutTransition();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScrollAnimations);
} else {
  initScrollAnimations();
}
