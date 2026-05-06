import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, ContactShadows, Environment, Sparkles, Stars } from '@react-three/drei';
import ParametricObject from './ParametricObject';
import { useStore } from '../store';

const Viewport: React.FC = () => {
  const display = useStore(s => s.display);
  const setIsInteracting = useStore(s => s.setIsInteracting);

  return (
    <div 
        className="w-full h-full relative"
        style={{ backgroundColor: display.backgroundColor }}
    >
      <Canvas 
        shadows 
        dpr={[1, window.devicePixelRatio]} /* Uncap DPR for crisp edges */
        gl={{ 
            antialias: true, 
            powerPreference: "high-performance",
            alpha: false
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
          <OrbitControls 
            autoRotate={display.autoRotate} 
            autoRotateSpeed={1}
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 1.5}
            onStart={() => setIsInteracting(true)}
            onEnd={() => setIsInteracting(false)}
          />
          
          <color attach="background" args={[display.backgroundColor]} />
          <fog attach="fog" args={[display.backgroundColor, 15, 50]} />

          {/* === FUN PARTY LIGHTING === */}
          
          <ambientLight intensity={display.ambientIntensity} /> 
          
          <directionalLight 
            position={[10, 15, 10]} 
            intensity={display.dirIntensity} 
            color="#fff7ed"
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          >
            <orthographicCamera attach="shadow-camera" args={[-15, 15, 15, -15]} />
          </directionalLight>

          <pointLight position={[-10, 5, 10]} intensity={2.5} color="#d946ef" distance={30} decay={2} />
          <pointLight position={[10, 0, -10]} intensity={2.5} color="#22d3ee" distance={30} decay={2} />

          <Environment preset="sunset" />

          {/* === THE STAGE === */}
          <group position={[0, -4, 0]}>
             <Grid 
                infiniteGrid 
                fadeDistance={40} 
                sectionColor="#f0abfc"
                cellColor="#818cf8"
                sectionSize={4} 
                cellSize={1} 
                sectionThickness={1.5}
                cellThickness={1}
            />
            <ContactShadows resolution={1024} scale={40} blur={2.5} opacity={0.5} far={10} color="#312e81" />
          </group>

          {/* === ATMOSPHERE === */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
          <Sparkles count={50} scale={12} size={6} speed={0.4} opacity={0.8} color="#FCD34D" />
          <Sparkles count={40} scale={15} size={4} speed={0.6} opacity={0.5} color="#FFFFFF" />

          <ParametricObject />
        </Suspense>
      </Canvas>
      
      {/* Pop Art Overlay Corners */}
      <div className="absolute top-4 left-4 pointer-events-none">
         <div className="w-16 h-16 border-t-[6px] border-l-[6px] border-black rounded-tl-xl drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"></div>
         <div className="absolute top-0 left-0 w-16 h-16 border-t-[4px] border-l-[4px] border-white rounded-tl-lg"></div>
      </div>
      
      <div className="absolute bottom-4 right-4 pointer-events-none">
         <div className="w-16 h-16 border-b-[6px] border-r-[6px] border-black rounded-br-xl drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"></div>
         <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[4px] border-r-[4px] border-white rounded-br-lg"></div>
      </div>
    </div>
  );
};

export default Viewport;