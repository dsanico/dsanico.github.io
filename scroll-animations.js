gsap.registerPlugin(ScrollTrigger);

let lenis;

function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

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
        window.heroAboutScrollLock?.release();
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

  const release = () => {
    released = true;
    sticky.classList.remove("is-terminal-complete");
    lenis.start();
  };

  window.heroAboutScrollLock = { release };

  const shouldBlockDownwardScroll = () => terminalComplete && !released;

  window.addEventListener("wheel", (event) => {
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

        if (self.progress < 0.98) released = false;
        sticky.classList.toggle("is-terminal-complete", terminalComplete && !released);
        if (terminalComplete && !released) lenis.stop();
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
