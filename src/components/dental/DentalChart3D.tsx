import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ToothCondition {
  id: number;
  name: string;
  color: string;
}

interface ToothData {
  conditionId: number;
  diagnosis: string;
  treatmentPlan: string;
  history: string[];
}

interface DentalChart3DProps {
  teeth: { [toothNumber: string]: ToothData };
  onToothSelect: (toothNumber: number) => void;
  selectedTooth: number | null;
  toothConditions: ToothCondition[];
}

// مكون السن الفردي ثلاثي الأبعاد
const Tooth3D: React.FC<{
  position: [number, number, number];
  toothNumber: number;
  condition: ToothCondition;
  isSelected: boolean;
  onClick: () => void;
}> = ({ position, toothNumber, condition, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // حركة طفيفة للسن عند التمرير
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + toothNumber * 0.5) * 0.1;
      if (isSelected) {
        meshRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      } else {
        meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
      }
    }
  });

  // تحديد نوع السن بناءً على الرقم
  const isMolar = toothNumber >= 16 && toothNumber <= 18 || toothNumber >= 26 && toothNumber <= 28 || 
                  toothNumber >= 36 && toothNumber <= 38 || toothNumber >= 46 && toothNumber <= 48;
  const isPremolar = toothNumber >= 14 && toothNumber <= 15 || toothNumber >= 24 && toothNumber <= 25 ||
                     toothNumber >= 34 && toothNumber <= 35 || toothNumber >= 44 && toothNumber <= 45;
  const isCanine = toothNumber === 13 || toothNumber === 23 || toothNumber === 33 || toothNumber === 43;
  const isIncisor = toothNumber >= 11 && toothNumber <= 12 || toothNumber >= 21 && toothNumber <= 22 ||
                    toothNumber >= 31 && toothNumber <= 32 || toothNumber >= 41 && toothNumber <= 42;

  // اختيار الشكل المناسب للسن
  let geometry;
  if (isMolar) {
    geometry = <boxGeometry args={[0.6, 0.8, 0.5]} />;
  } else if (isPremolar) {
    geometry = <cylinderGeometry args={[0.25, 0.2, 0.7, 8]} />;
  } else if (isCanine) {
    geometry = <coneGeometry args={[0.2, 0.8, 8]} />;
  } else if (isIncisor) {
    geometry = <boxGeometry args={[0.3, 0.6, 0.2]} />;
  } else {
    geometry = <boxGeometry args={[0.4, 0.7, 0.3]} />;
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {geometry}
        <meshStandardMaterial
          color={condition.color}
          metalness={0.1}
          roughness={0.2}
          emissive={isSelected ? '#444444' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {/* رقم السن */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.15}
        color={isSelected ? '#ffffff' : '#333333'}
        anchorX="center"
        anchorY="middle"
      >
        {toothNumber}
      </Text>
      
      {/* تأثير الإضاءة عند التحديد */}
      {isSelected && (
        <pointLight
          position={[0, 0, 0]}
          intensity={0.5}
          color={condition.color}
          distance={2}
        />
      )}
    </group>
  );
};

// مكون الفك العلوي
const UpperJaw: React.FC<{
  teeth: { [toothNumber: string]: ToothData };
  onToothSelect: (toothNumber: number) => void;
  selectedTooth: number | null;
  toothConditions: ToothCondition[];
}> = ({ teeth, onToothSelect, selectedTooth, toothConditions }) => {
  const jawRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (jawRef.current) {
      // حركة طفيفة للفك
      jawRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

  return (
    <group ref={jawRef} position={[0, 1.5, 0]}>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        Upper Jaw
      </Text>
      
      {upperTeeth.map((toothNumber, index) => {
        const toothData = teeth[toothNumber.toString()];
        const condition = toothConditions.find(c => c.id === toothData?.conditionId) || toothConditions[0];
        const x = (index - 7.5) * 0.8; // توزيع الأسنان
        const z = index < 8 ? 0.3 : -0.3; // الأسنان الأمامية والخلفية
        
        return (
          <Tooth3D
            key={toothNumber}
            position={[x, 0, z]}
            toothNumber={toothNumber}
            condition={condition}
            isSelected={selectedTooth === toothNumber}
            onClick={() => onToothSelect(toothNumber)}
          />
        );
      })}
    </group>
  );
};

// مكون الفك السفلي
const LowerJaw: React.FC<{
  teeth: { [toothNumber: string]: ToothData };
  onToothSelect: (toothNumber: number) => void;
  selectedTooth: number | null;
  toothConditions: ToothCondition[];
}> = ({ teeth, onToothSelect, selectedTooth, toothConditions }) => {
  const jawRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (jawRef.current) {
      // حركة طفيفة للفك
      jawRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + Math.PI) * 0.05;
    }
  });

  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <group ref={jawRef} position={[0, -1.5, 0]}>
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.2}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        Lower Jaw
      </Text>
      
      {lowerTeeth.map((toothNumber, index) => {
        const toothData = teeth[toothNumber.toString()];
        const condition = toothConditions.find(c => c.id === toothData?.conditionId) || toothConditions[0];
        const x = (index - 7.5) * 0.8; // توزيع الأسنان
        const z = index < 8 ? -0.3 : 0.3; // الأسنان الأمامية والخلفية
        
        return (
          <Tooth3D
            key={toothNumber}
            position={[x, 0, z]}
            toothNumber={toothNumber}
            condition={condition}
            isSelected={selectedTooth === toothNumber}
            onClick={() => onToothSelect(toothNumber)}
          />
        );
      })}
    </group>
  );
};

// المكون الرئيسي للـ Dental Chart 3D
const DentalChart3D: React.FC<DentalChart3DProps> = ({
  teeth,
  onToothSelect,
  selectedTooth,
  toothConditions
}) => {
  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-gray-200 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* الإضاءة المحسنة */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ffffff" />
        <pointLight position={[5, -5, -5]} intensity={0.3} color="#f0f8ff" />
        
        {/* التحكم في الكاميرا */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={-Math.PI / 2}
        />
        
        {/* الفكين */}
        <UpperJaw
          teeth={teeth}
          onToothSelect={onToothSelect}
          selectedTooth={selectedTooth}
          toothConditions={toothConditions}
        />
        
        <LowerJaw
          teeth={teeth}
          onToothSelect={onToothSelect}
          selectedTooth={selectedTooth}
          toothConditions={toothConditions}
        />
        
        {/* خلفية دائرية */}
        <mesh position={[0, 0, -5]} rotation={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.3} />
        </mesh>
      </Canvas>
      
      {/* معلومات التحكم */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
        <div>🖱️ Drag to rotate • Scroll to zoom • Click tooth to select</div>
      </div>
      
      {/* مؤشر السن المحدد */}
      {selectedTooth && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-3 py-1 rounded-full animate-pulse">
          Tooth {selectedTooth} Selected
        </div>
      )}
    </div>
  );
};

export default DentalChart3D;