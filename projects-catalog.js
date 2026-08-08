function initProjectCatalog() {
  const section = document.getElementById("projects");
  const carousel = section?.querySelector(".project-carousel");
  // Flickity may already have moved the cells into `.flickity-slider` by the
  // time this script runs, so do not require the cards to be direct children.
  const cards = [...(carousel?.querySelectorAll(".project-card, .project-card-alt") ?? [])];

  if (!section || !carousel || !cards.length) return;

  // Standardize every detailed project subsection on the same tag structure
  // used by the catalog preview. Timeline item tags intentionally stay intact.
  cards.forEach((card) => {
    card.querySelectorAll(".project-card-item-tags").forEach((tagRow) => {
      tagRow.classList.replace("project-card-item-tags", "catalog-card-tags");
      tagRow.querySelectorAll(".item-tag-1, .item-tag-2").forEach((tag) => {
        tag.classList.remove("item-tag-1", "item-tag-2");
      });
    });
  });

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

    const thumbnailVariables = {
      thumbnailFit: "--thumbnail-fit",
      thumbnailPosition: "--thumbnail-position",
      thumbnailPadding: "--thumbnail-padding",
      thumbnailBackground: "--thumbnail-background",
      thumbnailScale: "--thumbnail-scale",
      thumbnailHoverScale: "--thumbnail-hover-scale",
    };
    Object.entries(thumbnailVariables).forEach(([dataKey, cssVariable]) => {
      if (card.dataset[dataKey]) preview.style.setProperty(cssVariable, card.dataset[dataKey]);
    });

    const media = document.createElement("div");
    media.className = "catalog-card-media";
    const sourceImage = card.querySelector("img");
    const thumbnailSrc = card.dataset.thumbnailSrc;

    const appendFallback = () => {
      const fallback = document.createElement("img");
      fallback.className = "catalog-card-fallback";
      fallback.src = "images/computer.gif";
      fallback.alt = "Animated computer icon";
      fallback.loading = "lazy";

      const fallbackNumber = document.createElement("span");
      fallbackNumber.className = "catalog-card-fallback-number";
      fallbackNumber.textContent = String(index + 1).padStart(2, "0");
      fallbackNumber.setAttribute("aria-hidden", "true");

      media.replaceChildren(fallback, fallbackNumber);
    };

    const forceFallback = card.dataset.thumbnailFallback === "true";
    if (!forceFallback && (thumbnailSrc || sourceImage)) {
      const image = document.createElement("img");
      image.src = thumbnailSrc || sourceImage.currentSrc || sourceImage.src;
      image.alt = card.dataset.thumbnailAlt || sourceImage?.alt || "";
      image.loading = "lazy";
      image.addEventListener("error", appendFallback, { once: true });
      media.appendChild(image);
    } else {
      appendFallback();
    }

    const body = document.createElement("div");
    body.className = "catalog-card-body";

    const number = document.createElement("p");
    number.className = "catalog-card-number";
    number.textContent = `CATALOG / ${String(index + 1).padStart(2, "0")}`;

    const title = document.createElement("h2");
    title.className = "catalog-card-title";
    title.textContent = getCardTitle(card, index);

    const tagRow = card.querySelector(":scope > .catalog-card-tags");

    const button = document.createElement("button");
    button.className = "catalog-view-button";
    button.type = "button";
    button.textContent = "View project";

    body.append(number, title);
    if (tagRow) body.appendChild(tagRow);
    body.appendChild(button);
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
