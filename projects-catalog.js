function initProjectCatalog() {
  const section = document.getElementById("projects");
  const carousel = section?.querySelector(".project-carousel");
  // Flickity may already have moved the cells into `.flickity-slider` by the
  // time this script runs, so do not require the cards to be direct children.
  const cards = [...(carousel?.querySelectorAll(".project-card, .project-card-alt") ?? [])];

  if (!section || !carousel || !cards.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeCard = null;
  let overlay = null;

  function getCardTitle(card, index) {
    return card.querySelector(".project-title, .project-cards-header, .project-card-item-title")?.textContent.trim()
      || `Project ${String(index + 1).padStart(2, "0")}`;
  }

  function buildPreview(card, index) {
    const preview = document.createElement("div");
    preview.className = "catalog-card-preview";

    const media = document.createElement("div");
    media.className = "catalog-card-media";
    const sourceImage = card.querySelector("img");
    if (sourceImage) {
      const image = document.createElement("img");
      image.src = sourceImage.currentSrc || sourceImage.src;
      image.alt = sourceImage.alt || "";
      image.loading = "lazy";
      media.appendChild(image);
    } else {
      const fallback = document.createElement("span");
      fallback.className = "catalog-card-fallback";
      fallback.textContent = String(index + 1).padStart(2, "0");
      media.appendChild(fallback);
    }

    const body = document.createElement("div");
    body.className = "catalog-card-body";

    const number = document.createElement("p");
    number.className = "catalog-card-number";
    number.textContent = `CATALOG / ${String(index + 1).padStart(2, "0")}`;

    const title = document.createElement("h2");
    title.className = "catalog-card-title";
    title.textContent = getCardTitle(card, index);

    const tagRow = document.createElement("div");
    tagRow.className = "catalog-card-tags";
    [...card.querySelectorAll(".project-card-item-tags span")].slice(0, 3).forEach((sourceTag) => {
      const tag = document.createElement("span");
      tag.textContent = sourceTag.textContent.trim();
      tagRow.appendChild(tag);
    });

    const button = document.createElement("button");
    button.className = "catalog-view-button";
    button.type = "button";
    button.textContent = "View project";

    body.append(number, title, tagRow, button);
    preview.append(media, body);
    card.appendChild(preview);
    card.classList.add("catalog-card");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${title.textContent}`);
    card.setAttribute("aria-expanded", "false");
  }

  function closeDetail() {
    if (!overlay) return;
    const currentOverlay = overlay;
    const dialog = currentOverlay.querySelector(".project-detail-dialog");
    activeCard?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("project-detail-open");
    window.siteLenis?.start();

    const finish = () => {
      currentOverlay.remove();
      overlay = null;
      activeCard?.focus({ preventScroll: true });
      activeCard = null;
    };

    if (reducedMotion) {
      finish();
      return;
    }

    gsap.timeline({ onComplete: finish })
      .to(dialog, { scale: 0.94, y: 24, opacity: 0, duration: 0.22, ease: "power2.in" }, 0)
      .to(currentOverlay, { opacity: 0, duration: 0.24, ease: "power1.in" }, 0);
  }

  function openDetail(card) {
    if (overlay) return;
    activeCard = card;
    activeCard.setAttribute("aria-expanded", "true");

    overlay = document.createElement("div");
    overlay.className = "project-detail-overlay";
    overlay.setAttribute("role", "presentation");

    const dialog = document.createElement("div");
    dialog.className = "project-detail-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", getCardTitle(card, cards.indexOf(card)));
    dialog.setAttribute("data-lenis-prevent", "");

    const closeButton = document.createElement("button");
    closeButton.className = "project-detail-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close project details");
    closeButton.textContent = "×";

    const clone = card.cloneNode(true);
    clone.classList.remove("catalog-card");
    clone.classList.add("project-detail-card");
    clone.removeAttribute("style");
    clone.removeAttribute("role");
    clone.removeAttribute("tabindex");
    clone.removeAttribute("aria-label");
    clone.removeAttribute("aria-expanded");
    clone.removeAttribute("aria-hidden");
    clone.querySelector(".catalog-card-preview")?.remove();

    dialog.append(closeButton, clone);
    overlay.appendChild(dialog);
    section.appendChild(overlay);
    document.body.classList.add("project-detail-open");
    window.siteLenis?.stop();

    closeButton.addEventListener("click", closeDetail);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeDetail();
    });

    if (!reducedMotion) {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: "power1.out" });
      gsap.fromTo(dialog, { opacity: 0, scale: 0.9, y: 36 }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: "power3.out" });
    }
    closeButton.focus({ preventScroll: true });
  }

  cards.forEach((card, index) => {
    buildPreview(card, index);
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      openDetail(card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail(card);
      }
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay) closeDetail();
  });

  section.classList.add("catalog-ready");

  function resizeCarousel(attempt = 0) {
    const flickity = Flickity.data(carousel);
    if (!flickity) {
      if (attempt < 12) requestAnimationFrame(() => resizeCarousel(attempt + 1));
      return;
    }

    flickity.resize();
  }

  requestAnimationFrame(() => resizeCarousel());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectCatalog);
} else {
  initProjectCatalog();
}
