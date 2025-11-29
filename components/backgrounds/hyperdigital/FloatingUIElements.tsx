"use client";

import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import earthColorImage from "@/guidance/earth-blue-marble.jpg";
import earthBumpImage from "@/guidance/earth-topology.png";
import cloudsImage from "@/guidance/clouds.png";

interface UIElement {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  color: THREE.Color;
  opacity: number;
  driftSpeed: THREE.Vector3;
  flickerPhase: number;
  flickerSpeed: number;
  rotationSpeed: THREE.Vector3;
  globeRadius: number;
  cloudAltitude: number;
  globeRotationSpeed: number;
  cloudRotationSpeed: number;
}

interface FloatingUIElementsProps {
  count?: number;
}

export function FloatingUIElements({ count = 1 }: FloatingUIElementsProps) {
  const meshRefs = useRef<(THREE.Group | null)[]>([]);

  const textureUrls = useMemo(() => [earthColorImage.src, earthBumpImage.src, cloudsImage.src], []);
  const [earthTexture, bumpTexture, cloudTexture] = useLoader(THREE.TextureLoader, textureUrls);
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  cloudTexture.colorSpace = THREE.SRGBColorSpace;

  const elements = useMemo<UIElement[]>(() => {
    const list: UIElement[] = [];
    const total = 1;
    const globeColor = new THREE.Color("#00E5FF");

    for (let i = 0; i < total; i++) {
      list.push({
        position: new THREE.Vector3(0, 0, -2),
        scale: new THREE.Vector3(1, 1, 1),
        color: globeColor.clone(),
        opacity: 0.35,
        driftSpeed: new THREE.Vector3(0.08, 0.05, 0.07),
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.4 + Math.random() * 0.6,
        rotationSpeed: new THREE.Vector3(0.01, 0.02, 0.005),
        globeRadius: 1.3,
        cloudAltitude: 0.05,
        globeRotationSpeed: THREE.MathUtils.degToRad(3),
        cloudRotationSpeed: THREE.MathUtils.degToRad(-1),
      });
    }

    return list;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const delta = state.clock.getDelta();

    meshRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const element = elements[index];

      const driftX = Math.sin(time * element.driftSpeed.x + element.flickerPhase) * 0.3;
      const driftY = Math.cos(time * element.driftSpeed.y + element.flickerPhase * 1.3) * 0.2;
      const driftZ = Math.sin(time * element.driftSpeed.z + element.flickerPhase * 0.7) * 0.4;

      mesh.position.set(element.position.x + driftX, element.position.y + driftY, element.position.z + driftZ);

      mesh.rotation.x += element.rotationSpeed.x * 0.01;
      mesh.rotation.y += element.rotationSpeed.y * 0.01;
      mesh.rotation.z += element.rotationSpeed.z * 0.01;

      const globeMesh = mesh.children[0] as THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial> | undefined;
      const cloudMesh = mesh.children[1] as THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial> | undefined;
      const atmosphereMesh = mesh.children[2] as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | undefined;

      if (globeMesh) {
        globeMesh.rotation.y += element.globeRotationSpeed * delta;
      }

      if (cloudMesh) {
        cloudMesh.rotation.y += element.cloudRotationSpeed * delta;
      }

      if (atmosphereMesh) {
        const flicker = Math.sin(time * element.flickerSpeed + element.flickerPhase);
        const flickerAmount = 0.2;
        const baseOpacity = element.opacity + flicker * flickerAmount;
        const fadePhase = (time + element.flickerPhase) % 8;
        let adjustedOpacity = baseOpacity;
        if (fadePhase < 0.5) {
          adjustedOpacity *= fadePhase * 2;
        } else if (fadePhase > 7.5) {
          adjustedOpacity *= (8 - fadePhase) * 2;
        }
        atmosphereMesh.material.opacity = THREE.MathUtils.clamp(adjustedOpacity, 0.08, 0.5);
      }
    });
  });

  return (
    <group>
      {elements.map((element, index) => (
        <group
          key={index}
          ref={(el) => (meshRefs.current[index] = el)}
          position={[element.position.x, element.position.y, element.position.z]}
        >
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[element.globeRadius, 128, 128]} />
            <meshPhongMaterial
              map={earthTexture}
              bumpMap={bumpTexture}
              bumpScale={0.02}
              emissive={element.color}
              emissiveIntensity={0.45}
              shininess={35}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[element.globeRadius * (1 + element.cloudAltitude), 96, 96]} />
            <meshPhongMaterial map={cloudTexture} transparent opacity={0.5} depthWrite={false} />
          </mesh>

          <mesh>
            <sphereGeometry args={[element.globeRadius * 1.08, 64, 64]} />
            <meshBasicMaterial color={element.color} transparent opacity={element.opacity} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
