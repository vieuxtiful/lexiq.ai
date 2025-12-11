"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  ax: number;
  ay: number;
  az: number;
  rotX: number;
  rotZ: number;
  projX: number;
  projY: number;
  radiusCurrent: number;
  framesAlive: number;
  angle: number;
  force: number;
  alpha: number;
  growDuration: number;
  waitDuration: number;
  shrinkDuration: number;
  isDead: boolean;
};

/**
 * Master configuration describing how the particle shell behaves.
 * - sphereRadius: physical radius of the virtual globe in px; larger = bigger sphere.
 * - framesToRotate: how many animation frames for a full revolution.
 * - perspective: camera distance emulation; higher -> stronger depth foreshortening.
 * - newParticlesPerFrame: emission rate per animation frame.
 * - grow/wait/shrinkDuration: phases (in frames) for fade-in, idle, fade-out.
 * - color: RGB for each particle draw call.
 * - maxAcceleration/startVelocity: control how far particles drift from the sphere.
 *   Smaller values keep orbits tighter and limit dispersion.
 */
const CONFIG = {
  sphereRadius: 290,
  framesToRotate: 800,
  perspective: 797,
  newParticlesPerFrame: 20,
  growDuration: 83,
  waitDuration: 10,
  shrinkDuration: 456,
  color: [0x06, 0xcf, 0xbb],
  maxAcceleration: { x: 0.028, y: 0.028, z: 0.028 },
  startVelocity: { x: 0.0007, y: 0.0007, z: 0.0007 },
};

// Additional tuning knobs for drift damping + safety bounds.
const VELOCITY_DAMPING = 0.965; // < 1 => gradual slowdown, giving softer drifts.
const MAX_RADIUS_MULTIPLIER = 1.08; // clamp keeps particles w/in ~8% of sphere radius.

export function AboutParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    const particles: Particle[] = [];
    let angle = 0;
    const { sphereRadius } = CONFIG;
    let width = 0;
    let height = 0;

    /**
     * Resize handler keeps the canvas pixel-perfect with its parent while
     * honoring devicePixelRatio so the glow stays crisp.
     */
    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

    /**
     * Seeds a single particle at the surface of the sphere with randomized
     * polar coordinates so the shell coverage stays uniform.
     */
    const initParticle = (p: Particle) => {
      p.angle = Math.random() * Math.PI * 2;
      p.force = Math.acos(randomRange(-1, 1));
      p.alpha = 0;
      p.isDead = false;
      p.framesAlive = 0;

      p.x = sphereRadius * Math.sin(p.force) * Math.cos(p.angle);
      p.y = sphereRadius * Math.sin(p.force) * Math.sin(p.angle);
      p.z = sphereRadius * Math.cos(p.force);

      p.vx = CONFIG.startVelocity.x * p.x;
      p.vy = CONFIG.startVelocity.y * p.y;
      p.vz = CONFIG.startVelocity.z * p.z;

      p.growDuration = CONFIG.growDuration + randomRange(-CONFIG.growDuration / 4, CONFIG.growDuration / 4);
      p.waitDuration = CONFIG.waitDuration + randomRange(-CONFIG.waitDuration / 4, CONFIG.waitDuration / 4);
      p.shrinkDuration = CONFIG.shrinkDuration + randomRange(-CONFIG.shrinkDuration / 4, CONFIG.shrinkDuration / 4);

      p.ax = 0;
      p.ay = 0;
      p.az = 0;
    };

    /**
     * Factory that spawns a new particle object and immediately initializes it.
     */
    const createParticle = () => {
      const particle: Particle = {
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        ax: 0,
        ay: 0,
        az: 0,
        rotX: 0,
        rotZ: 0,
        projX: 0,
        projY: 0,
        radiusCurrent: 0,
        framesAlive: 0,
        angle: 0,
        force: 0,
        alpha: 0,
        growDuration: CONFIG.growDuration,
        waitDuration: CONFIG.waitDuration,
        shrinkDuration: CONFIG.shrinkDuration,
        isDead: false,
      };
      initParticle(particle);
      particles.push(particle);
    };

    /**
     * Core physics loop for each particle:
     * - Applies rotation to mimic the sphere spinning.
     * - Manages the alpha lifecycle (grow -> wait -> shrink).
     * - Adds gentle acceleration once the shrink phase begins, keeping motion subtle.
     */
    const updateParticle = (p: Particle, cosAngle: number, sinAngle: number) => {
      if (p.framesAlive > p.growDuration + p.waitDuration) {
        p.vx = (p.vx + p.ax + CONFIG.maxAcceleration.x * (Math.random() * 2 - 1)) * VELOCITY_DAMPING;
        p.vy = (p.vy + p.ay + CONFIG.maxAcceleration.y * (Math.random() * 2 - 1)) * VELOCITY_DAMPING;
        p.vz = (p.vz + p.az + CONFIG.maxAcceleration.z * (Math.random() * 2 - 1)) * VELOCITY_DAMPING;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Clamp radial distance so particles hover close to the sphere surface.
        const radius = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        const maxRadius = sphereRadius * MAX_RADIUS_MULTIPLIER;
        if (radius > maxRadius) {
          const scale = maxRadius / radius;
          p.x *= scale;
          p.y *= scale;
          p.z *= scale;
        }
      }

      p.rotX = cosAngle * p.x + sinAngle * p.z;
      p.rotZ = -sinAngle * p.x + cosAngle * p.z;
      p.radiusCurrent = Math.max(0.01, CONFIG.perspective / (CONFIG.perspective - p.rotZ));
      const projX = p.rotX * p.radiusCurrent + width / 2;
      const projY = p.y * p.radiusCurrent + height / 2;
      p.projX = projX;
      p.projY = projY;

      p.framesAlive += 1;

      if (p.framesAlive < p.growDuration) {
        p.alpha = p.framesAlive / p.growDuration;
      } else if (p.framesAlive < p.growDuration + p.waitDuration) {
        p.alpha = 1;
      } else if (p.framesAlive < p.growDuration + p.waitDuration + p.shrinkDuration) {
        p.alpha =
          (p.growDuration + p.waitDuration + p.shrinkDuration - p.framesAlive) / p.shrinkDuration;
      } else {
        p.isDead = true;
      }

      p.alpha *= Math.min(0.92, Math.max(0.55, p.rotZ / sphereRadius));
      p.alpha = Math.min(1, Math.max(0, p.alpha));

      if (p.isDead) {
        initParticle(p);
      }
    };

    /**
     * Pure rendering pass: clears canvas, sets additive blending, then draws
     * each particle as a radial gradient-style disc.
     */
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(${CONFIG.color[0]}, ${CONFIG.color[1]}, ${CONFIG.color[2]}, ${p.alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.projX, p.projY, p.radiusCurrent, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      });
    };

    /**
     * Master animation loop: spins the globe, emits particles, advances physics,
     * and schedules the next frame.
     */
    const step = () => {
      angle = (angle + (2 * Math.PI) / CONFIG.framesToRotate) % (2 * Math.PI);
      const sinAngle = Math.sin(angle);
      const cosAngle = Math.cos(angle);

      for (let i = 0; i < CONFIG.newParticlesPerFrame; i++) {
        if (particles.length < 1000) {
          createParticle();
        }
      }

      particles.forEach((p) => updateParticle(p, cosAngle, sinAngle));
      render();

      animationFrame = window.requestAnimationFrame(step);
    };

    setSize();
    window.addEventListener("resize", setSize);
    step();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
