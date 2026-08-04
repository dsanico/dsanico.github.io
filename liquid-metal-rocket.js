import { ShaderMount } from "./vendor/paper-shaders/shader-mount.js";
import { ShaderFitOptions } from "./vendor/paper-shaders/shader-sizing.js";
import {
  LiquidMetalShapes,
  liquidMetalFragmentShader,
  toProcessedLiquidMetal
} from "./vendor/paper-shaders/shaders/liquid-metal.js";

const mountElement = document.getElementById("liquid-metal-rocket-canvas");

if (mountElement) {
  const maskUrl = "images/tl_animation/rocket-svgrepo-com.svg";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let shader;
  let processedMaskUrl;

  const loadImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

  try {
    // Paper preprocesses the SVG mask to calculate the edge field used by its
    // contour distortion. The resulting image is then supplied to WebGL.
    const { pngBlob } = await toProcessedLiquidMetal(maskUrl);
    processedMaskUrl = URL.createObjectURL(pngBlob);
    const processedMask = await loadImage(processedMaskUrl);

    const uniforms = {
      // Paper composites this color behind the mask. Alpha 0 keeps the
      // WebGL canvas transparent outside the rocket silhouette.
      u_colorBack: [0.67, 0.67, 0.68, 0],
      u_colorTint: [1, 1, 1, 1],
      u_image: processedMask,
      u_contour: 0.4,
      u_distortion: 0.07,
      u_softness: 0.1,
      u_repetition: 2,
      u_shiftRed: 0.3,
      u_shiftBlue: 0.3,
      u_angle: 70,
      u_isImage: true,
      u_shape: LiquidMetalShapes.none,
      u_fit: ShaderFitOptions.contain,
      u_scale: 0.82,
      u_rotation: 0,
      u_offsetX: 0,
      u_offsetY: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_worldWidth: 0,
      u_worldHeight: 0
    };

    shader = new ShaderMount(
      mountElement,
      liquidMetalFragmentShader,
      uniforms,
      { alpha: true, antialias: true, premultipliedAlpha: true },
      prefersReducedMotion.matches ? 0 : 1,
      0,
      1,
      512 * 512,
      ["u_image"]
    );

    prefersReducedMotion.addEventListener("change", ({ matches }) => {
      shader?.setSpeed(matches ? 0 : 1);
    });
  } catch (error) {
    console.error("Paper Liquid Metal rocket could not be initialized.", error);
    mountElement.classList.add("liquid-metal-fallback");
  }

  window.addEventListener("pagehide", () => {
    shader?.dispose();
    if (processedMaskUrl) URL.revokeObjectURL(processedMaskUrl);
  }, { once: true });
}
