/* eslint-disable react/no-unknown-property */
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  BallCollider,
  CuboidCollider,
  CylinderCollider,
  Debug,
  Physics,
  RigidBody,
  InstancedRigidBodies,
} from '@react-three/rapier';
import { Perf } from 'r3f-perf';
import { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Group } from 'three';

export default function Experience() {
  const [hitSound] = useState(() => new Audio('/hit.mp3'));
  const [punchSound] = useState(() => new Audio('/punch.mp3'));
  const [bulletSound] = useState(() => new Audio('/bullet-hit.mp3'));

  const astronaut = useGLTF('/T7KBO05GF594P1IHQI3QEN7FC.gltf');

  const cube = useRef();
  const twister = useRef();
  const cubeJump = () => {
    const mass = cube.current.mass();
    console.log(mass);
    cube.current.applyImpulse({ x: 0, y: 5 * mass, z: 0 });
    cube.current.applyTorqueImpulse({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
    });
  };

  const hitEnter = () => {
    hitSound.currentTime = 0;
    hitSound.volume = Math.random();
    hitSound.play();
  };

  const punchEnter = () => {
    punchSound.currentTime = 0;
    punchSound.volume = Math.random();
    punchSound.play();
  };
  const bulletEnter = () => {
    bulletSound.currentTime = 0;
    bulletSound.volume = Math.random();
    bulletSound.play();
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const eulerRotation = new THREE.Euler(0, time, 0);
    const quaternionRotation = new THREE.Quaternion();
    quaternionRotation.setFromEuler(eulerRotation);
    twister.current.setNextKinematicRotation(quaternionRotation);

    const angle = time * 0.5;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    twister.current.setNextKinematicTranslation({ x: x, y: -0.8, z: z });
  });

  const sphere = useRef();

  const sphereJump = () => {
    const mass = ballsRef.current.mass();
    console.log(mass);
    ballsRef.current.applyImpulse({ x: 0, y: 5, z: 0 });
    ballsRef.current.applyTorqueImpulse({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
    });
  };

  const meter = useGLTF('/parking_meter_-_3d_scan_quixel_megascans.glb');

  const ballCount = 30;
  const ballsRef = useRef();

  useEffect(() => {
    for (let i = 0; i < ballCount; i++) {
      const matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3(i * 2, 0, 0),
        new THREE.Quaternion(),
        new THREE.Vector3(0.2, 0.2, 0.2)
      );
      ballsRef.current.setMatrixAt(i, matrix);
    }
  }, []);

  const ballTransforms = useMemo(() => {
    const positions = [];
    const rotations = [];
    const scales = [];
    for (let i = 0; i < ballCount; i++) {
      positions.push([
        (Math.random() - 0.5) * 8,
        6 + i * 0.2,
        (Math.random() - 0.5) * 8,
      ]);
      rotations.push([0, 0, 0]);
      scales.push([0, 0, 0]);
    }
    return { positions, rotations, scales };
  }, []);

  return (
    <>
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <directionalLight castShadow position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.5} />

      <Physics gravity={[0, -9.08, 0]}>
        <Debug />

        {/* instanced spheres */}
        <InstancedRigidBodies
          colliders="ball"
          position={ballTransforms.positions}
          rotation={ballTransforms.rotations}
          scale={ballTransforms.scales}
          onClick={sphereJump}
          mass={1}
          gravityScale={1.1}
        >
          <instancedMesh castShadow ref={ballsRef} args={[null, null, ballCount]}>
            <sphereGeometry />
            <meshStandardMaterial color="green" />
          </instancedMesh>
        </InstancedRigidBodies>

        {/* astronaut */}
        <RigidBody colliders="hull">
          <primitive
            object={astronaut.scene}
            scale={4}
            position={[-2, 1.5, -2]}
            rotation={[0, Math.PI * -0.5, 0]}
          />
        </RigidBody>

        {/* orange sphere */}
        <RigidBody
        //   ref={sphere}
        //   onClick={sphereJump}
          position={[0, 2, 0]}
          colliders="ball"
          gravityScale={0.2}
          restitution={0.5}
          //   onCollisionEnter={hitEnter}
          //   onCollisionExit={bulletEnter}
        >
          <mesh castShadow position={[0, 2, 0]}>
            <sphereGeometry />
            <meshStandardMaterial color="#FD5200" />
          </mesh>
        </RigidBody>

        {/* lavender box */}
        <RigidBody
          onClick={cubeJump}
          ref={cube}
          mass={0.5}
          position={[1.5, 2, 0]}
          //   onCollisionEnter={hitEnter}
          //   onCollisionExit={bulletEnter}
        >
          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#C589E8" />
          </mesh>
        </RigidBody>

        {/* purple box */}
        <RigidBody>
          <mesh castShadow position={[1, 2, -2]}>
            <boxGeometry />
            <meshStandardMaterial color="#00FFE7" />
            <CuboidCollider args={[0.5, 0.5, 0.5]} mass={0.5} />
          </mesh>
        </RigidBody>

        {/* red bar */}
        <RigidBody
          ref={twister}
          position={[0, -0.8, 0]}
          friction={0}
          type="kinematicPosition"
          //   onCollisionEnter={hitEnter}
          //   onCollisionExit={bulletEnter}
        >
          <mesh castShadow scale={[0.4, 0.4, 3]}>
            <boxGeometry />
            <meshStandardMaterial color="#7D1128" />
          </mesh>
        </RigidBody>

        {/* green floor */}
        <RigidBody type="fixed" friction={0.5}>
          <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="#01BAEF" />
          </mesh>
        </RigidBody>

        {/* parking meter */}
        <RigidBody colliders="hull" position={[0, 4, 0]} mass={5} restitution={0.01} friction={1}>
          <primitive object={meter.scene} scale={5} />
          {/* <CylinderCollider args={[1.25, 1]} /> */}
        </RigidBody>

        {/* bounding walls */}
        <RigidBody type="fixed" includeInvisible>
          <CuboidCollider
            args={[5, 32, 0.5]}
            position={[0, 1, 5.5]}
            rotation={[0, Math.PI / 0.5, 0]}
          />
          <CuboidCollider
            args={[5, 32, 0.5]}
            position={[0, 1, -5.5]}
            rotation={[0, Math.PI / 0.5, 0]}
          />
          <CuboidCollider
            args={[0.5, 32, 5]}
            position={[5.5, 1, 0]}
            rotation={[0, Math.PI / 0.5, 0]}
          />
          <CuboidCollider
            args={[0.5, 32, 5]}
            position={[-5.5, 1, 0]}
            rotation={[0, Math.PI / 0.5, 0]}
          />
        </RigidBody>
      </Physics>
    </>
  );
}
