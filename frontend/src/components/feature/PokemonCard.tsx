import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface PokemonCardProps {
  tokenId: bigint;
}

const Card3D: React.FC<{ tokenId: bigint }> = ({ tokenId }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.3;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
  });

  const frontTexture = new THREE.TextureLoader().load(
    "https://via.placeholder.com/200x300.png?text=Yapmon+" + tokenId
  );
  const backTexture = new THREE.TextureLoader().load(
    "https://via.placeholder.com/200x300.png?text=Back"
  );

  return (
    <group ref={groupRef}>
      <Box args={[2, 3, 0.05]} position={[0, 0, 0]}>
        <mesh>
          <planeGeometry args={[2, 3]} />
          <meshPhysicalMaterial
            map={frontTexture}
            metalness={0.7}
            roughness={0.3}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
            side={THREE.FrontSide}
          />
        </mesh>
        <mesh rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2, 3]} />
          <meshPhysicalMaterial
            map={backTexture}
            metalness={0.7}
            roughness={0.3}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
            side={THREE.BackSide}
          />
        </mesh>
      </Box>
    </group>
  );
};

export const PokemonCard: React.FC<PokemonCardProps> = ({ tokenId }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Newly Minted Yapmon Card #{1}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.3}
              penumbra={1}
              intensity={2}
              castShadow
            />
            <pointLight position={[-10, -10, -10]} intensity={1} />
            <Card3D tokenId={tokenId} />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              autoRotate
              autoRotateSpeed={2}
            />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
};
