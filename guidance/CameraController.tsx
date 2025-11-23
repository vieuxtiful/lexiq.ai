"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * CameraController Component
 * 
 * Implements glacial but purposeful camera movement:
 * - Slow dolly pushes (forward/backward)
 * - Mild rotational yaw (left/right)
 * - Smooth easing for cinematic feel
 */

interface CameraControllerProps {
  /** Enable/disable camera animation */
  enabled?: boolean;
  /** Speed multiplier for camera movement */
  speed?: number;
}

export function CameraController({
  enabled = true,
  speed = 1,
}: CameraControllerProps) {
  const { camera } = useThree();
  const initialPosition = useRef(new THREE.Vector3());
  const initialRotation = useRef(new THREE.Euler());

  // Store initial camera state
  useRef(() => {
    initialPosition.current.copy(camera.position);
    initialRotation.current.copy(camera.rotation);
  });

  useFrame((state) => {
    if (!enabled) return;

    const time = state.clock.getElapsedTime() * speed;

    // Slow dolly push (forward/backward)
    // Oscillates between closer and farther from the scene
    const dollyDistance = Math.sin(time * 0.08) * 1.5;
    const dollyZ = 5 + dollyDistance; // Base distance: 5 units

    // Mild rotational yaw (left/right)
    const yawAngle = Math.sin(time * 0.06) * 0.15; // ±0.15 radians (~8.6 degrees)

    // Subtle vertical drift
    const verticalDrift = Math.cos(time * 0.05) * 0.3;

    // Smooth horizontal drift
    const horizontalDrift = Math.sin(time * 0.07) * 0.5;

    // Apply camera transformations with smooth easing
    camera.position.lerp(
      new THREE.Vector3(horizontalDrift, verticalDrift, dollyZ),
      0.02 // Smooth interpolation factor
    );

    // Apply yaw rotation
    camera.rotation.y = THREE.MathUtils.lerp(
      camera.rotation.y,
      yawAngle,
      0.02
    );

    // Ensure camera always looks at the center of the scene
    const lookAtTarget = new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    
    // Smooth look-at transition
    const targetQuaternion = new THREE.Quaternion();
    const lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(camera.position, lookAtTarget, camera.up);
    targetQuaternion.setFromRotationMatrix(lookAtMatrix);
    
    camera.quaternion.slerp(targetQuaternion, 0.01);
  });

  return null;
}
