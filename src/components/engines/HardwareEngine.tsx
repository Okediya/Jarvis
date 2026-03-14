'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneData, SceneObject } from '@/lib/types';

interface MeshObjectProps {
  data: SceneObject;
}

function MeshObject({ data }: MeshObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    switch (data.geometry) {
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
        return new THREE.SphereGeometry(0.5, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      case 'torus':
        return new THREE.TorusGeometry(0.4, 0.15, 16, 48);
      case 'cone':
        return new THREE.ConeGeometry(0.5, 1, 32);
      case 'plane':
        return new THREE.PlaneGeometry(2, 2);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [data.geometry]);

  useFrame((state) => {
    if (!meshRef.current || !data.animate) return;
    const t = state.clock.elapsedTime;
    const speed = data.animate.speed || 1;

    switch (data.animate.type) {
      case 'rotate': {
        const axis = data.animate.axis || 'y';
        if (axis === 'x') meshRef.current.rotation.x = t * speed;
        else if (axis === 'y') meshRef.current.rotation.y = t * speed;
        else meshRef.current.rotation.z = t * speed;
        break;
      }
      case 'float': {
        meshRef.current.position.y =
          (data.position?.[1] || 0) + Math.sin(t * speed) * 0.3;
        break;
      }
      case 'pulse': {
        const s = 1 + Math.sin(t * speed * 2) * 0.1;
        meshRef.current.scale.setScalar(s);
        break;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={data.position || [0, 0, 0]}
      rotation={data.rotation ? data.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number] : [0, 0, 0]}
      scale={data.scale || [1, 1, 1]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={data.color || '#E63939'}
        metalness={data.metalness ?? 0.3}
        roughness={data.roughness ?? 0.4}
      />
      {data.children?.map((child) => (
        <MeshObject key={child.id} data={child} />
      ))}
    </mesh>
  );
}

interface HardwareEngineProps {
  scene: SceneData;
}

export default function HardwareEngine({ scene }: HardwareEngineProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{
          position: scene.camera?.position || [5, 5, 5],
          fov: 50,
        }}
        style={{ background: scene.background || '#111' }}
      >
        <ambientLight intensity={scene.ambientLight ?? 0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#E63939" />

        {scene.objects.map((obj) => (
          <MeshObject key={obj.id} data={obj} />
        ))}

        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        <Environment preset="city" />
      </Canvas>

      {/* Overlay label */}
      <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
        <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">
          3D Hardware Prototype
        </span>
      </div>
    </div>
  );
}
