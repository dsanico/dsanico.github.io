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

function moveAboutCardToSection() {
  const card = document.querySelector(".about-card--transition");
  const slot = document.querySelector(".about-card-slot");
  const stage = document.querySelector(".about-card-stage");

  if (!card || !slot || card.dataset.placed === "true") return;

  card.classList.remove("about-card--transition");
  card.classList.add("about-card--placed");
  card.dataset.placed = "true";
  slot.appendChild(card);

  if (stage) {
    stage.setAttribute("aria-hidden", "true");
    stage.style.visibility = "hidden";
  }

  gsap.set(card, { clearProps: "transform,opacity" });
  ScrollTrigger.refresh();
}

function moveAboutCardToStage() {
  const card = document.querySelector(".about-card-slot .about-card, .about-card--placed");
  const slot = document.querySelector(".about-card-slot");
  const stage = document.querySelector(".about-card-stage");

  if (!card || !stage || !slot || card.dataset.placed !== "true") return;

  card.classList.add("about-card--transition");
  card.classList.remove("about-card--placed");
  card.dataset.placed = "false";
  stage.appendChild(card);
  slot.innerHTML = "";

  stage.setAttribute("aria-hidden", "false");
  stage.style.visibility = "";

  ScrollTrigger.refresh();
}

function initHeroAboutTransition() {
  const scene = document.getElementById("hero-about-scene");
  const heroText = document.querySelector(".hero-text-animate");
  const aboutCard = document.querySelector(".about-card--transition");
  const sticky = document.querySelector(".hero-about-sticky");

  if (!scene || !heroText || !aboutCard || !sticky) return;

  gsap.set(heroText, {
    scale: 1,
    opacity: 1,
    transformOrigin: "center center",
  });

  gsap.set(aboutCard, {
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
      onLeave: moveAboutCardToSection,
      onEnterBack: moveAboutCardToStage,
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
    aboutCard,
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
