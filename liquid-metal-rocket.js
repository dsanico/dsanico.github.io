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
  let activeBlobUrl;
  let requestId = 0;

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

  async function setIcon(maskUrl) {
    const currentRequest = ++requestId;
    try {
      const { pngBlob } = await toProcessedLiquidMetal(maskUrl);
      const nextBlobUrl = URL.createObjectURL(pngBlob);
      const processedImage = await loadImage(nextBlobUrl);
      if (currentRequest !== requestId) {
        URL.revokeObjectURL(nextBlobUrl);
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
          480 * 240,
          ["u_image"]
        );
      } else {
        shader.setUniforms({ u_image: processedImage });
      }

      if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl);
      activeBlobUrl = nextBlobUrl;
    } catch (error) {
      console.error("Paper Liquid Metal event icon could not be initialized.", error);
    }
  }

  window.addEventListener("orbitstagechange", ({ detail }) => {
    if (detail?.icon) setIcon(detail.icon);
  });
  reducedMotion.addEventListener("change", ({ matches }) => shader?.setSpeed(matches ? 0 : 1));
  setIcon("images/tl_animation/tower.svg");

  window.addEventListener("pagehide", () => {
    shader?.dispose();
    if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl);
  }, { once: true });
}
