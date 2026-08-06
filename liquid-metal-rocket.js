import { ShaderMount } from "./vendor/paper-shaders/shader-mount.js";
import { ShaderFitOptions } from "./vendor/paper-shaders/shader-sizing.js";
import {
  LiquidMetalShapes,
  liquidMetalFragmentShader,
  toProcessedLiquidMetal
} from "./vendor/paper-shaders/shaders/liquid-metal.js";

const mountElement = document.getElementById("liquid-metal-event-icon-canvas");

if (mountElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let shader;
  let requestId = 0;
  let iconVisible = false;
  const processedIcons = new Map();
  const iconUrls = [
    "images/tl_animation/tower.svg",
    "images/tl_animation/earth.svg",
    "images/tl_animation/satellite.svg",
    "images/tl_animation/star_03.svg",
    ...Array.from({ length: 5 }, (_, index) => `images/tl_animation/cloud_0${index + 1}.svg`)
  ];

  const loadImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

  const baseUniforms = {
    u_colorBack: [0, 0, 0, 0],
    u_colorTint: [1, 1, 1, 1],
    u_contour: 0.42,
    u_distortion: 0.08,
    u_softness: 0.12,
    u_repetition: 2,
    u_shiftRed: 0.22,
    u_shiftBlue: 0.22,
    u_angle: 72,
    u_isImage: true,
    u_shape: LiquidMetalShapes.none,
    u_fit: ShaderFitOptions.contain,
    u_scale: 0.72,
    u_rotation: 0,
    u_offsetX: 0,
    u_offsetY: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0
  };

  function prepareIcon(maskUrl) {
    if (!processedIcons.has(maskUrl)) {
      processedIcons.set(maskUrl, (async () => {
      const { pngBlob } = await toProcessedLiquidMetal(maskUrl);
        const blobUrl = URL.createObjectURL(pngBlob);
        const image = await loadImage(blobUrl);
        return { image, blobUrl };
      })());
    }
    return processedIcons.get(maskUrl);
  }

  async function setIcon(maskUrl) {
    const currentRequest = ++requestId;
    const loadingTask = window.assetLoader?.begin();
    try {
      const { image: processedImage } = await prepareIcon(maskUrl);
      if (currentRequest !== requestId) {
        return;
      }

      if (!shader) {
        shader = new ShaderMount(
          mountElement,
          liquidMetalFragmentShader,
          { ...baseUniforms, u_image: processedImage },
          { alpha: true, antialias: true, premultipliedAlpha: true },
          reducedMotion.matches ? 0 : 1,
          0,
          1,
          256 * 144,
          ["u_image"]
        );
      } else {
        shader.setUniforms({ u_image: processedImage });
      }
      shader.setSpeed(reducedMotion.matches || !iconVisible ? 0 : 1);
    } catch (error) {
      console.error("Paper Liquid Metal event icon could not be initialized.", error);
    } finally {
      window.assetLoader?.end(loadingTask);
    }
  }

  window.addEventListener("orbitstagechange", ({ detail }) => {
    if (detail?.icon) setIcon(detail.icon);
  });
  reducedMotion.addEventListener("change", ({ matches }) => shader?.setSpeed(matches || !iconVisible ? 0 : 1));

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    iconVisible = entry.isIntersecting;
    shader?.setSpeed(reducedMotion.matches || !iconVisible ? 0 : 1);
  }, { rootMargin: "120px" });
  visibilityObserver.observe(mountElement);

  setIcon("images/tl_animation/tower.svg");

  const warmIconCache = async () => {
    const pendingIcons = iconUrls.filter((iconUrl) => !processedIcons.has(iconUrl));
    const workers = Array.from({ length: 2 }, async () => {
      while (pendingIcons.length) {
        const iconUrl = pendingIcons.shift();
        try {
          await prepareIcon(iconUrl);
        } catch {}
      }
    });
    await Promise.all(workers);
  };
  window.setTimeout(warmIconCache, 150);

  window.addEventListener("pagehide", () => {
    visibilityObserver.disconnect();
    shader?.dispose();
    processedIcons.forEach(async (preparedIcon) => {
      try {
        URL.revokeObjectURL((await preparedIcon).blobUrl);
      } catch {}
    });
  }, { once: true });
}

const earthMountElement = document.getElementById("liquid-metal-earth-canvas");

if (earthMountElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let earthShader;
  let earthBlobUrl;
  let earthVisible = false;

  const loadEarthImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

  (async () => {
    const loadingTask = window.assetLoader?.begin();
    try {
      const { pngBlob } = await toProcessedLiquidMetal("images/tl_animation/earth.svg");
      earthBlobUrl = URL.createObjectURL(pngBlob);
      const earthImage = await loadEarthImage(earthBlobUrl);
      earthShader = new ShaderMount(
        earthMountElement,
        liquidMetalFragmentShader,
        {
          u_colorBack: [0, 0, 0, 0],
          u_colorTint: [1, 1, 1, 1],
          u_contour: 0.48,
          u_distortion: 0.07,
          u_softness: 0.1,
          u_repetition: 2,
          u_shiftRed: 0.18,
          u_shiftBlue: 0.2,
          u_angle: 65,
          u_isImage: true,
          u_shape: LiquidMetalShapes.none,
          u_fit: ShaderFitOptions.contain,
          u_scale: 0.88,
          u_rotation: 0,
          u_offsetX: 0,
          u_offsetY: 0,
          u_originX: 0.5,
          u_originY: 0.5,
          u_worldWidth: 0,
          u_worldHeight: 0,
          u_image: earthImage
        },
        { alpha: true, antialias: false, premultipliedAlpha: true },
        0,
        0,
        1,
        160 * 160,
        ["u_image"]
      );
      earthShader.setSpeed(reducedMotion.matches || !earthVisible ? 0 : 0.72);
    } catch (error) {
      console.error("Paper Liquid Metal Earth could not be initialized.", error);
    } finally {
      window.assetLoader?.end(loadingTask);
    }
  })();

  const earthObserver = new IntersectionObserver(([entry]) => {
    earthVisible = entry.isIntersecting;
    earthShader?.setSpeed(reducedMotion.matches || !earthVisible ? 0 : 0.72);
  }, { rootMargin: "80px" });
  earthObserver.observe(earthMountElement);
  reducedMotion.addEventListener("change", ({ matches }) => {
    earthShader?.setSpeed(matches || !earthVisible ? 0 : 0.72);
  });

  window.addEventListener("pagehide", () => {
    earthObserver.disconnect();
    earthShader?.dispose();
    if (earthBlobUrl) URL.revokeObjectURL(earthBlobUrl);
  }, { once: true });
}
