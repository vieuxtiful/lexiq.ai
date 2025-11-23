"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraControllerProps {
  enabled?: boolean;
  speed?: number;
}

export function CameraController({ enabled = true, speed = 1 }: CameraControllerProps) {
  const { camera } = useThree();
  const initialPosition = useRef(new THREE.Vector3());
  const initialRotation = useRef(new THREE.Euler());

  useRef(() => {
    initialPosition.current.copy(camera.position);
    initialRotation.current.copy(camera.rotation);
  });

  useFrame((state) => {
    if (!enabled) return;

    const time = state.clock.getElapsedTime() * speed;

    const dollyDistance = Math.sin(time * 0.08) * 1.5;
    const dollyZ = 5 + dollyDistance;

    const yawAngle = Math.sin(time * 0.06) * 0.15;
    const verticalDrift = Math.cos(time * 0.05) * 0.3;
    const horizontalDrift = Math.sin(time * 0.07) * 0.5;

    camera.position.lerp(new THREE.Vector3(horizontalDrift, verticalDrift, dollyZ), 0.02);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, yawAngle, 0.02);

    const lookAtTarget = new THREE.Vector3(0, 0, 0);
    const targetQuaternion = new THREE.Quaternion();
    const lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(camera.position, lookAtTarget, camera.up);
    targetQuaternion.setFromRotationMatrix(lookAtMatrix);
    camera.quaternion.slerp(targetQuaternion, 0.01);
  });

  return null;
}
