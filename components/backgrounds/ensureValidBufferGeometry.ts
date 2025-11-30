"use client";

import * as THREE from "three";

let patched = false;
const MAX_SAFE_COORDINATE = 1e4;

export function ensureValidBufferGeometry() {
  if (patched || typeof window === "undefined") {
    return;
  }
  patched = true;

  const originalComputeBoundingSphere = THREE.BufferGeometry.prototype.computeBoundingSphere;

  THREE.BufferGeometry.prototype.computeBoundingSphere = function computeBoundingSpherePatched() {
    const position = this.getAttribute("position");

    if (position?.array) {
      const array = position.array as Float32Array | number[];
      let sanitized = false;

      for (let i = 0; i < array.length; i++) {
        const value = array[i];
        if (!Number.isFinite(value) || Math.abs(value) > MAX_SAFE_COORDINATE) {
          array[i] = 0;
          sanitized = true;
        }
      }

      if (sanitized && "needsUpdate" in position) {
        position.needsUpdate = true;
        if (process.env.NODE_ENV !== "production") {
          console.warn("BufferGeometry contained invalid vertex positions. Values were reset to 0 before computing bounding spheres.", this);
        }
      }
    }

    originalComputeBoundingSphere.call(this);

    if (this.boundingSphere && Number.isNaN(this.boundingSphere.radius)) {
      this.boundingSphere.radius = 0;
      if (process.env.NODE_ENV !== "production") {
        console.warn("BufferGeometry produced a NaN bounding sphere radius. Radius was clamped to 0.", this);
      }
    }
  };
}
