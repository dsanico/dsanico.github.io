(() => {
  const canvas = document.getElementById("hydrogen-wavefunction");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: false });
  const cards = [...document.querySelectorAll(".quantum-stage-card")];
  const previous = document.querySelector(".quantum-step--previous");
  const next = document.querySelector(".quantum-step--next");
  const progress = document.querySelector(".quantum-controls b");
  const progressFill = document.querySelector(".quantum-controls i");
  const headingState = document.querySelector(".quantum-heading span");
  if (!context || !previous || !next) return;

  const renderSize = 320;
  const fitFill = 0.68;
  const buffer = document.createElement("canvas");
  buffer.width = renderSize;
  buffer.height = renderSize;
  const bufferContext = buffer.getContext("2d");
  const image = bufferContext.createImageData(renderSize, renderSize);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Dimensionless, normalization-free real cross-sections in the x-z plane.
  // Their relative shape, signs, radial nodes, and angular nodes are preserved.
  const states = [
    {
      label: "3S ORBITAL",
      numbers: "n = 3 / l = 0 / m = 0",
      wave: (x, z) => {
        const r = Math.hypot(x, z);
        return (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3) / 27;
      }
    },
    {
      label: "2Pₕ ORBITAL",
      numbers: "n = 2 / l = 1 / m = 0",
      wave: (x, z) => z * Math.exp(-Math.hypot(x, z) / 2) / 2.25
    },
    {
      label: "3Dᴢ² ORBITAL",
      numbers: "n = 3 / l = 2 / m = 0",
      wave: (x, z) => (2 * z * z - x * x) * Math.exp(-Math.hypot(x, z) / 3) / 18
    }
  ];

  // Cache every state once. Transitions only blend these arrays, keeping the
  // interaction cheap even while the timeline's liquid-metal canvases exist.
  function findFittedSpan(wave) {
    const sampleSize = 160;
    const searchSpan = 72;
    const samples = new Float32Array(sampleSize * sampleSize);
    let maximum = 0;

    for (let py = 0; py < sampleSize; py += 1) {
      const z = (0.5 - py / (sampleSize - 1)) * searchSpan;
      for (let px = 0; px < sampleSize; px += 1) {
        const x = (px / (sampleSize - 1) - 0.5) * searchSpan;
        const offset = py * sampleSize + px;
        samples[offset] = Math.abs(wave(x, z));
        maximum = Math.max(maximum, samples[offset]);
      }
    }

    const visibleThreshold = maximum * 0.018;
    let visibleRadius = 1;
    for (let py = 0; py < sampleSize; py += 1) {
      const z = (0.5 - py / (sampleSize - 1)) * searchSpan;
      for (let px = 0; px < sampleSize; px += 1) {
        if (samples[py * sampleSize + px] < visibleThreshold) continue;
        const x = (px / (sampleSize - 1) - 0.5) * searchSpan;
        visibleRadius = Math.max(visibleRadius, Math.abs(x), Math.abs(z));
      }
    }

    return Math.min(searchSpan, Math.max(12, (visibleRadius * 2) / fitFill));
  }

  const fields = states.map(({ wave }) => {
    const plotSpan = findFittedSpan(wave);
    const field = new Float32Array(renderSize * renderSize);
    for (let py = 0; py < renderSize; py += 1) {
      const z = (0.5 - py / (renderSize - 1)) * plotSpan;
      for (let px = 0; px < renderSize; px += 1) {
        const x = (px / (renderSize - 1) - 0.5) * plotSpan;
        field[py * renderSize + px] = wave(x, z);
      }
    }
    return field;
  });

  let activeIndex = 0;
  let animationFrame = 0;

  function render(fromIndex, toIndex, mix) {
    const data = image.data;
    const from = fields[fromIndex];
    const to = fields[toIndex];
    const theta = mix * Math.PI * 0.5;
    const fromWeight = Math.cos(theta);
    const toWeight = Math.sin(theta);
    let maximum = 0;
    const values = new Float32Array(renderSize * renderSize);

    for (let offset = 0; offset < values.length; offset += 1) {
      const value = fromWeight * from[offset] + toWeight * to[offset];
      values[offset] = value;
      maximum = Math.max(maximum, Math.abs(value));
    }

    for (let offset = 0; offset < values.length; offset += 1) {
      const signed = values[offset] / Math.max(maximum, 0.001);
      // Suppress the near-zero tail so the cloud naturally dissolves into black.
      const density = Math.max(0, (Math.abs(signed) - 0.012) / 0.988);
      const intensity = Math.pow(density, 0.62);
      const glow = Math.pow(intensity, 2.35);
      const positive = signed >= 0;
      const pixel = offset * 4;
      data[pixel] = Math.round((positive ? 255 : 116) * intensity + 255 * glow * 0.35);
      data[pixel + 1] = Math.round((positive ? 116 : 33) * intensity + 210 * glow * 0.28);
      data[pixel + 2] = Math.round((positive ? 7 : 196) * intensity + 255 * glow * 0.3);
      data[pixel + 3] = 255;
    }

    bufferContext.putImageData(image, 0, 0);
    context.imageSmoothingEnabled = true;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(buffer, 0, 0, canvas.width, canvas.height);
  }

  function updateInterface(index) {
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === index;
      card.classList.toggle("is-active", isActive);
      card.querySelectorAll("a, button").forEach((control) => {
        if (isActive) {
          control.removeAttribute("aria-disabled");
          control.removeAttribute("tabindex");
        } else {
          control.setAttribute("aria-disabled", "true");
          control.setAttribute("tabindex", "-1");
        }
      });
    });
    progress.textContent = `${String(index + 1).padStart(2, "0")} / 03`;
    progressFill.style.width = `${((index + 1) / states.length) * 100}%`;
    headingState.textContent = `CONTACT / QUANTUM STATE ${String(index + 1).padStart(2, "0")}`;
    previous.disabled = index === 0;
    next.disabled = index === states.length - 1;
  }

  function goTo(nextIndex) {
    if (nextIndex < 0 || nextIndex >= states.length || nextIndex === activeIndex) return;
    cancelAnimationFrame(animationFrame);
    const fromIndex = activeIndex;
    const duration = reducedMotion.matches ? 1 : 900;
    const started = performance.now();
    activeIndex = nextIndex;
    updateInterface(nextIndex);

    function animate(now) {
      const elapsed = Math.min(1, (now - started) / duration);
      const eased = elapsed < 0.5
        ? 4 * elapsed * elapsed * elapsed
        : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
      render(fromIndex, nextIndex, eased);
      if (elapsed < 1) animationFrame = requestAnimationFrame(animate);
    }
    animationFrame = requestAnimationFrame(animate);
  }

  previous.addEventListener("click", () => goTo(activeIndex - 1));
  next.addEventListener("click", () => goTo(activeIndex + 1));
  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (!card.classList.contains("is-active") && event.target.closest("a, button")) {
        event.preventDefault();
      }
    });
  });
  updateInterface(0);
  render(0, 0, 0);
})();
