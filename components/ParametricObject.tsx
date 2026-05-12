import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { useStore } from '../store';

const ParametricObject: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const grid = useStore(s => s.grid);
  const display = useStore(s => s.display);
  const compiledFunction = useStore(s => s.compiledFunction);
  const extraParams = useStore(s => s.extraParams);
  const outputs = useStore(s => s.outputs);
  const updateParam = useStore(s => s.updateExtraParam);
  const isInteracting = useStore(s => s.isInteracting);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertexCount = (grid.uSegs + 1) * (grid.vSegs + 1);
    
    // Allocate arrays
    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const indices: number[] = [];

    // Generate indices
    for (let i = 0; i < grid.vSegs; i++) {
      for (let j = 0; j < grid.uSegs; j++) {
        const a = i * (grid.uSegs + 1) + j;
        const b = i * (grid.uSegs + 1) + j + 1;
        const c = (i + 1) * (grid.uSegs + 1) + j;
        const d = (i + 1) * (grid.uSegs + 1) + j + 1;

        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setIndex(indices);

    return geo;
  }, [grid.uSegs, grid.vSegs]);

  // Initial Compile
  useEffect(() => {
    useStore.getState().compileSurface();
    
    // Set up STL exporter
    const exporter = new STLExporter();
    useStore.getState().setExportSTL(() => {
        if (meshRef.current) {
            const result = exporter.parse(meshRef.current);
            const blob = new Blob([result], { type: 'text/plain' });
            const link = document.createElement('a');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.href = URL.createObjectURL(blob);
            link.download = 'parametric_object.stl';
            link.click();
            document.body.removeChild(link);
        }
    });

    return () => useStore.getState().setExportSTL(null as any);
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !compiledFunction) return;

    const currentGeo = meshRef.current.geometry;
    if (!currentGeo) return;

    // 1. Animate Parameters
    const inputParams: Record<string, number> = {};
    extraParams.forEach((p) => {
      if (!p) return;
      inputParams[p.name] = p.value;
    });

    if (inputParams['t'] === undefined) {
        inputParams['t'] = state.clock.getElapsedTime();
    }

    // 2. Update Geometry
    const posAttr = currentGeo.attributes.position;
    const colAttr = currentGeo.attributes.color;
    
    if (!posAttr || !colAttr) return;

    const { uMin, uMax, vMin, vMax, uSegs, vSegs } = grid;
    let idx = 0;
    
    const isSpherical = outputs.coordConversion === 'spherical';
    const isCylindrical = outputs.coordConversion === 'cylindrical';

    const evalPoint = (u_val: number, v_val: number) => {
        const res = compiledFunction({ ...inputParams, u: u_val, v: v_val });
        let x = res ? res.x : 0;
        let y = res ? res.y : 0;
        let z = res ? res.z : 0;
        
        if (isSpherical) {
            const radius = x; const theta = y; const phi = z;
            x = radius * Math.sin(theta) * Math.cos(phi);
            y = radius * Math.sin(theta) * Math.sin(phi);
            z = radius * Math.cos(theta);
        } else if (isCylindrical) {
            const rho = x; const phi = y; const zVal = z;
            x = rho * Math.cos(phi);
            y = rho * Math.sin(phi);
            z = zVal;
        }
        return { x, y, z, r: res?.r || 1, g: res?.g || 1, b: res?.b || 1 };
    };

    const du = (uMax - uMin) * 0.001;
    const dv = (vMax - vMin) * 0.001;

    for (let i = 0; i <= vSegs; i++) {
        const v = i / vSegs;
        const v_norm = vMin + v * (vMax - vMin);

        for (let j = 0; j <= uSegs; j++) {
            const u = j / uSegs;
            const u_norm = uMin + u * (uMax - uMin);

            const pt = evalPoint(u_norm, v_norm);
            let { x, y, z, r, g, b } = pt;

            if (display.analysisMode !== 'none') {
                // Compute derivatives using central difference
                const pU1 = evalPoint(u_norm + du, v_norm);
                const pU2 = evalPoint(u_norm - du, v_norm);
                const pV1 = evalPoint(u_norm, v_norm + dv);
                const pV2 = evalPoint(u_norm, v_norm - dv);

                // First derivatives
                const Xu = new THREE.Vector3((pU1.x - pU2.x) / (2 * du), (pU1.y - pU2.y) / (2 * du), (pU1.z - pU2.z) / (2 * du));
                const Xv = new THREE.Vector3((pV1.x - pV2.x) / (2 * dv), (pV1.y - pV2.y) / (2 * dv), (pV1.z - pV2.z) / (2 * dv));

                // Normal
                const normal = new THREE.Vector3().crossVectors(Xu, Xv).normalize();

                // First fundamental form
                const E = Xu.dot(Xu);
                const F = Xu.dot(Xv);
                const G = Xv.dot(Xv);

                // Second derivatives
                const Xuu = new THREE.Vector3((pU1.x - 2 * pt.x + pU2.x) / (du * du), (pU1.y - 2 * pt.y + pU2.y) / (du * du), (pU1.z - 2 * pt.z + pU2.z) / (du * du));
                const Xvv = new THREE.Vector3((pV1.x - 2 * pt.x + pV2.x) / (dv * dv), (pV1.y - 2 * pt.y + pV2.y) / (dv * dv), (pV1.z - 2 * pt.z + pV2.z) / (dv * dv));
                
                const pUV1 = evalPoint(u_norm + du, v_norm + dv);
                const pUV2 = evalPoint(u_norm + du, v_norm - dv);
                const pUV3 = evalPoint(u_norm - du, v_norm + dv);
                const pUV4 = evalPoint(u_norm - du, v_norm - dv);
                const Xuv = new THREE.Vector3(
                    (pUV1.x - pUV2.x - pUV3.x + pUV4.x) / (4 * du * dv),
                    (pUV1.y - pUV2.y - pUV3.y + pUV4.y) / (4 * du * dv),
                    (pUV1.z - pUV2.z - pUV3.z + pUV4.z) / (4 * du * dv)
                );

                // Second fundamental form
                const L = Xuu.dot(normal);
                const M = Xuv.dot(normal);
                const N_form = Xvv.dot(normal);

                const den = E * G - F * F;
                const eps = 1e-8;

                if (display.analysisMode === 'gaussian') {
                    let K = (L * N_form - M * M) / (den + eps);
                    // Map K to color (e.g. positive = red, negative = blue, zero = white)
                    const clampK = Math.max(-2, Math.min(2, K));
                    if (clampK > 0) {
                        r = 1.0; g = 1.0 - clampK/2; b = 1.0 - clampK/2;
                    } else {
                        r = 1.0 + clampK/2; g = 1.0 + clampK/2; b = 1.0;
                    }
                } else if (display.analysisMode === 'mean') {
                    let H = (E * N_form + G * L - 2 * F * M) / (2 * (den + eps));
                    // Map H to color
                    const clampH = Math.max(-2, Math.min(2, H));
                    if (clampH > 0) {
                        r = 1.0 - clampH/2; g = 1.0; b = 1.0 - clampH/2;
                    } else {
                        r = 1.0 + clampH/2; g = 1.0; b = 1.0 + clampH/2;
                    }
                }
            } else {
                if (outputs.rgbToHsv) {
                    const h_val = r * 6;
                    const s = g;
                    const vVal = b;
                    const c = vVal * s;
                    const xVal = c * (1 - Math.abs((h_val % 2) - 1));
                    const m = vVal - c;
                    
                    if (h_val < 1) { r=c; g=xVal; b=0; }
                    else if (h_val < 2) { r=xVal; g=c; b=0; }
                    else if (h_val < 3) { r=0; g=c; b=xVal; }
                    else if (h_val < 4) { r=0; g=xVal; b=c; }
                    else if (h_val < 5) { r=xVal; g=0; b=c; }
                    else { r=c; g=0; b=xVal; }
                    r+=m; g+=m; b+=m;
                }

                if (display.globalSaturation !== 1.0) {
                    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    r = lum + (r - lum) * display.globalSaturation;
                    g = lum + (g - lum) * display.globalSaturation;
                    b = lum + (b - lum) * display.globalSaturation;
                }
            }

            posAttr.setXYZ(idx, x, y, z);
            colAttr.setXYZ(idx, r, g, b);
            idx++;
        }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    currentGeo.computeVertexNormals();

    if (display.analysisMode !== 'none') {
        let area = 0;
        const posArr = posAttr.array;
        const indices = currentGeo.getIndex()?.array;
        if (indices) {
            for(let i = 0; i < indices.length; i += 3) {
                const i1 = indices[i]*3, i2 = indices[i+1]*3, i3 = indices[i+2]*3;
                const abx = posArr[i2] - posArr[i1], aby = posArr[i2+1] - posArr[i1+1], abz = posArr[i2+2] - posArr[i1+2];
                const acx = posArr[i3] - posArr[i1], acy = posArr[i3+1] - posArr[i1+1], acz = posArr[i3+2] - posArr[i1+2];
                const crossx = aby * acz - abz * acy;
                const crossy = abz * acx - abx * acz;
                const crossz = abx * acy - aby * acx;
                area += 0.5 * Math.sqrt(crossx*crossx + crossy*crossy + crossz*crossz);
            }
        }
        useStore.getState().setAnalysisResults({ area, vertices: posAttr.count, faces: indices ? indices.length/3 : 0 });
    }
  });

  useFrame(() => {
      extraParams.forEach((p, i) => {
          if (!p) return;
          if (p.isAnimating && p.name !== 't') {
             let next = p.value + (p.step || 0.01);
             if (next > p.max) next = p.min;
             updateParam(i, { value: next });
          }
      });
  });

  return (
    <>
      <mesh 
        key={`${grid.uSegs}-${grid.vSegs}`}
        ref={meshRef} 
        visible={display.showSurface} 
        castShadow 
        receiveShadow
      >
        <primitive object={geometry} attach="geometry" />
        
        {/* High-Quality Glossy Plastic Material - Replaces the glitchy outline for edge definition */}
        <meshPhysicalMaterial 
            vertexColors 
            side={THREE.DoubleSide} 
            roughness={0.1}
            metalness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            flatShading={false}
            emissive={isInteracting ? "#22d3ee" : "#000000"}
            emissiveIntensity={isInteracting ? 0.4 : 0}
        />
      </mesh>

      {display.showWireframe && (
        <lineSegments>
             <wireframeGeometry args={[geometry]} /> 
             <lineBasicMaterial color="white" opacity={0.3} transparent />
        </lineSegments>
      )}
      
      {display.showAxes && <axesHelper args={[10]} />}
    </>
  );
};

export default ParametricObject;