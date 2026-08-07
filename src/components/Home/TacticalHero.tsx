import { useEffect, useRef } from "react";

// Palette pulled from tailwind.config.js so the canvas matches the rest of
// the app instead of drifting out of sync with it.
const GRID_COLOR = "90, 109, 69"; // primary-light
const SWEEP_COLOR = "232, 184, 92"; // one warm accent, spent only here
const GRID_SPACING = 44;
const RING_INTERVAL_MS = 3200;
const RING_LIFETIME_MS = 2200;
const RING_SPEED_PX_PER_MS = 0.15;

interface Ring {
  bornAt: number;
}

/**
 * Sonar-style scan animation: concentric rings expand from the hero's focal
 * point and brighten the grid points they pass over. The motif is
 * deliberate, not decorative — this app's job is scanning doctrine for an
 * answer, so the hero performs that idea instead of just glowing.
 */
export default function TacticalHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let originX = 0;
    let originY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let hasPointer = false;
    let rings: Ring[] = [];
    let lastRingAt = 0;
    let rafId = 0;

    function resize() {
      if (!canvas || !container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      originX = width / 2;
      originY = height * 0.42;
    }

    function drawFrame(now: number) {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        if (now - lastRingAt > RING_INTERVAL_MS) {
          rings.push({ bornAt: now });
          lastRingAt = now;
        }
        rings = rings.filter((ring) => now - ring.bornAt < RING_LIFETIME_MS);
      }

      const cols = Math.ceil(width / GRID_SPACING) + 1;
      const rows = Math.ceil(height / GRID_SPACING) + 1;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * GRID_SPACING;
          const y = row * GRID_SPACING;
          const dx = x - originX;
          const dy = y - originY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let brightness = 0.05;

          for (const ring of prefersReducedMotion ? [] : rings) {
            const age = now - ring.bornAt;
            const radius = age * RING_SPEED_PX_PER_MS;
            const delta = Math.abs(dist - radius);
            if (delta < 55) {
              const proximity = 1 - delta / 55;
              const fade = 1 - age / RING_LIFETIME_MS;
              brightness = Math.max(brightness, proximity * fade * 0.75);
            }
          }

          if (hasPointer && !prefersReducedMotion) {
            const pdx = x - pointerX;
            const pdy = y - pointerY;
            const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pDist < 150) {
              brightness = Math.max(brightness, (1 - pDist / 150) * 0.45);
            }
          }

          const isSweepLit = brightness > 0.12;
          ctx.fillStyle = isSweepLit
            ? `rgba(${SWEEP_COLOR}, ${Math.min(brightness, 0.8)})`
            : `rgba(${GRID_COLOR}, 0.14)`;
          ctx.beginPath();
          ctx.arc(x, y, isSweepLit ? 1.6 : 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(drawFrame);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      hasPointer = true;
    }

    function handlePointerLeave() {
      hasPointer = false;
    }

    resize();
    drawFrame(0);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(drawFrame);
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerleave", handlePointerLeave);
    }

    return () => {
      resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 85%)",
        }}
      />
    </div>
  );
}
