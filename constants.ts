import { Preset } from './types';

export const DEFAULT_FUNCTION = `function surface(input) {
    const u = input.u;
    const v = input.v;
    // Simple ripples
    const t = input.t || 0;
    const r = 1 + 0.2 * Math.sin(u * 5 + t);
    
    const x = r * Math.sin(u) * Math.cos(v);
    const y = r * Math.sin(u) * Math.sin(v);
    const z = r * Math.cos(u);

    return { x, y, z, r: u/Math.PI, g: v/Math.PI, b: 0.5, a: 1 };
}`;

export const PRESETS: Preset[] = [
  {
      name: "Donut (Classic)",
      config: {
          display: { shininess: 40, dirIntensity: 0.9, globalSaturation: 1.0, showWireframe: false, backgroundColor: "#050505" },
          parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 150, vSegs: 100 },
          extraParameters: [],
          surface: {
              code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    
    const R = 3.5; 
    const r = 1.6; 
    
    let x = (R + r * Math.cos(v)) * Math.cos(u);
    let y = (R + r * Math.cos(v)) * Math.sin(u);
    let z = r * Math.sin(v);
    
    // Frosting logic
    const dripFrequency = 12;
    const dripAmplitude = 0.6;
    
    let isFrosting = false;
    // Wavy edges for frosting
    const edge1 = 0.1 + 0.3 * Math.sin(u * dripFrequency) + 0.1 * Math.sin(u * 30);
    const edge2 = 3.0 + 0.3 * Math.sin(u * dripFrequency + 2) + 0.1 * Math.sin(u * 30);
    
    if (v > edge1 && v < edge2) {
        isFrosting = true;
        const thick = 0.15;
        let taper = 1;
        // Smooth transition at edges
        const edgeDist = Math.min(Math.abs(v - edge1), Math.abs(v - edge2));
        if (edgeDist < 0.2) taper = edgeDist / 0.2; 
        
        const frostingThick = thick * taper;
        x += frostingThick * Math.cos(v) * Math.cos(u);
        y += frostingThick * Math.cos(v) * Math.sin(u);
        z += frostingThick * Math.sin(v);
    }
    
    // Sprinkles
    let isSprinkle = false;
    if (isFrosting) {
        const su = u * 40;
        const sv = v * 20;
        // Noise function for random placement
        const noise = Math.sin(su) * Math.cos(sv) + Math.sin(su*2.3 + sv*1.7);
        if (noise > 1.8) {
            isSprinkle = true;
            const sprinkleHeight = 0.08;
            x += sprinkleHeight * Math.cos(v) * Math.cos(u);
            y += sprinkleHeight * Math.cos(v) * Math.sin(u);
            z += sprinkleHeight * Math.sin(v);
        }
    }

    let r_out = 0.85, g_out = 0.65, b_out = 0.35; // Dough color
    
    if (isSprinkle) {
        // Rainbow sprinkles
        const hue = Math.abs(Math.sin(u * 5)) * 6;
        if (hue < 1) { r_out=1; g_out=0; b_out=0; }
        else if (hue < 2) { r_out=1; g_out=1; b_out=0; }
        else if (hue < 3) { r_out=0; g_out=1; b_out=0; }
        else if (hue < 4) { r_out=0; g_out=1; b_out=1; }
        else if (hue < 5) { r_out=0; g_out=0; b_out=1; }
        else { r_out=1; g_out=0; b_out=1; }
    } else if (isFrosting) {
        // Pink Frosting
        r_out = 1.0; g_out = 0.6; b_out = 0.75;
        r_out += 0.05 * Math.sin(u*10); // Slight texture
    }

    return { x, y, z, r: r_out, g: g_out, b: b_out, a: 1 };
}`
          }
      }
  },
  {
    name: "Donut (Old Fashioned)",
    config: {
      display: { shininess: 80, dirIntensity: 0.7, ambientIntensity: 0.5, globalSaturation: 0.9 },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 80 },
      extraParameters: [
        { name: "ridges", value: 12, min: 4, max: 20, step: 1 },
        { name: "depth", value: 0.15, min: 0.05, max: 0.5, step: 0.01 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const ridges = input.ridges || 12;
    const depth = input.depth || 0.15;
    
    const R = 3.5;
    
    // Cruller shape: The minor radius oscillates to create ridges
    // We add a twist by adding u to the v calculation
    const rBase = 1.6;
    const rVar = depth * Math.cos(v * ridges + u * 3); 
    const r = rBase + rVar;
    
    // Imperfect surface noise
    const bump = 0.02 * Math.sin(u * 50) * Math.sin(v * 50);

    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v) + bump;
    
    // Glaze Color Logic
    // High points (ridges) get more glaze (white/sugar), low points get oily dough color
    const height = rVar; // -depth to +depth
    const normH = (height + depth) / (2 * depth); // 0 to 1
    
    // Base dough: Golden Brown
    let r_out = 0.8;
    let g_out = 0.5; 
    let b_out = 0.2;
    
    // Glaze accumulation in crevices or on top? 
    // Let's make the whole thing shiny glaze, but crevices darker
    
    r_out += normH * 0.2;
    g_out += normH * 0.2;
    b_out += normH * 0.1;

    return { x, y, z, r: r_out, g: g_out, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Toxic Waste)",
    config: {
      display: { shininess: 100, dirIntensity: 0.4, ambientIntensity: 0.2, backgroundColor: "#001000", globalSaturation: 1.5 },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 150, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 50 },
        { name: "ooze", value: 0.5, min: 0, max: 2, step: 0.1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    const oozeSpeed = input.ooze || 0.5;
    
    const R = 3.5;
    const rBase = 1.6;
    
    // Bubbling surface
    const bubble = 0.15 * Math.sin(u * 10 + t * 2) * Math.sin(v * 8 + t);
    
    // Dripping goo effect
    const drip = 0.4 * Math.sin(u * 6) * Math.exp(-Math.pow(v - 2, 2));
    
    const r = rBase + bubble;
    
    let x = (R + r * Math.cos(v)) * Math.cos(u);
    let y = (R + r * Math.cos(v)) * Math.sin(u);
    let z = r * Math.sin(v);
    
    // Slime dropping down (gravity simulation on Z)
    if (z < 0) {
        z += drip * Math.sin(t * oozeSpeed);
    }
    
    // Radioactive coloring
    // Dark black/green base, bright neon veins
    
    const pulse = Math.abs(Math.sin(u * 5 + t));
    let r_c = 0.1;
    let g_c = 0.8 + 0.2 * pulse;
    let b_c = 0.1;
    
    // Dark spots
    if (bubble < -0.05) {
        r_c = 0; g_c = 0.2; b_c = 0;
    }
    
    // Glowing veins
    if (drip > 0.1) {
        r_c = 0.2; g_c = 1.0; b_c = 0.2;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Cyberpunk)",
    config: {
      display: { shininess: 150, dirIntensity: 1.0, ambientIntensity: 0.1, backgroundColor: "#000510", showWireframe: true },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 150, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 60 },
        { name: "glitch", value: 1.0, min: 0, max: 2, step: 0.1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    const glitchIntensity = input.glitch || 1.0;
    
    const R = 3.5;
    const rBase = 1.5;
    
    // Create digital stepping
    const steps = 16;
    const uStep = Math.floor(u * steps) / steps;
    const vStep = Math.floor(v * steps) / steps;
    
    // Random-ish hash based on steps and time
    const hash = Math.sin(uStep * 12.9898 + vStep * 78.233 + t) * 43758.5453;
    const noise = hash - Math.floor(hash);
    
    let disp = 0;
    if (noise > 0.8) {
        disp = 0.4 * glitchIntensity;
    } else if (noise < 0.2) {
        disp = -0.2 * glitchIntensity;
    }
    
    const r = rBase + disp;
    
    const x = (R + r * Math.cos(vStep)) * Math.cos(uStep); // Faceted look via vStep/uStep
    const y = (R + r * Math.cos(vStep)) * Math.sin(uStep);
    const z = r * Math.sin(vStep);
    
    // Neon Grid Colors
    let r_c = 0, g_c = 0.1, b_c = 0.2; // Dark Blue Base
    
    if (disp > 0) {
        r_c = 0; g_c = 1.0; b_c = 1.0; // Cyan High
    } else if (disp < 0) {
        r_c = 1.0; g_c = 0.0; b_c = 0.5; // Magenta Low
    }
    
    // Edges
    const uEdge = Math.abs(u * steps - Math.floor(u * steps + 0.5)) < 0.1;
    const vEdge = Math.abs(v * steps - Math.floor(v * steps + 0.5)) < 0.1;
    
    if (uEdge || vEdge) {
        r_c += 0.5; g_c += 0.5; b_c += 0.5;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Magma)",
    config: {
      display: { shininess: 30, dirIntensity: 0.5, ambientIntensity: 0.2, backgroundColor: "#1a0500" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 30 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    const rBase = 1.6;
    
    // Perlin-ish noise function
    const noise = Math.sin(u * 6 + t * 0.2) * Math.cos(v * 6) + 
                  0.5 * Math.sin(u * 12 + t * 0.5) * Math.sin(v * 12);
    
    // Crust Displacement
    // Positive noise = crust, Negative noise = cracks (lava)
    const displacement = Math.max(0, noise * 0.4);
    
    const r = rBase + displacement;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Color Logic
    let r_c, g_c, b_c;
    
    if (noise < 0.1) {
        // Lava (Glows)
        const heat = Math.abs(noise - 0.1); // deeper is hotter
        r_c = 1.0; 
        g_c = 0.8 * (1 - heat); 
        b_c = 0.0;
    } else {
        // Crust (Black rock)
        r_c = 0.1; g_c = 0.05; b_c = 0.05;
        // Specular highlight edge
        if (noise < 0.15) {
             r_c = 0.3; g_c = 0.1; b_c = 0.0;
        }
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Rope Braided)",
    config: {
      display: { shininess: 60, dirIntensity: 0.8, ambientIntensity: 0.4, backgroundColor: "#050505" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 300, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 50 },
        { name: "twist", value: 12, min: 0, max: 20, step: 1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    const twists = input.twist || 12;
    const strands = 3;
    
    const R = 3.5;
    const rBase = 1.2;
    
    // Twist calculation
    const angle = v * strands + u * twists + t;
    
    // Shape of the cross section (3 lobes)
    // Use power function to make lobes rounder and gaps sharper
    const shape = Math.pow(0.5 * (Math.cos(angle) + 1), 0.8);
    
    // Modulate radius
    const r = rBase * (0.8 + 0.6 * shape);
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Color strands differently
    // We can use the angle phase to determine which strand we are on roughly
    
    let r_c = 0.8, g_c = 0.6, b_c = 0.4; // Base Rope
    
    // Darken crevices
    if (shape < 0.2) {
        r_c *= 0.2; g_c *= 0.2; b_c *= 0.2;
    } else {
        // Slight color variation per strand could be added here if desired
        r_c += 0.1 * Math.sin(u * 5);
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Multiverse)",
    config: {
      display: { shininess: 80, dirIntensity: 1.2, ambientIntensity: 0.4, backgroundColor: "#1e0030" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 40 },
        { name: "split", value: 3, min: 1, max: 8, step: 1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    const k = input.split || 3;
    
    // Multiple intertwined rings
    // We modulate the major radius R based on u to create a trefoil-like knot structure
    // But we keep it torus-topology
    
    const R_base = 3.5;
    const r_base = 1.0;
    
    // The "multiverse" split: modulate position based on discrete cosine waves
    const splitMod = Math.cos(u * k + t);
    
    // Twist the tube center
    const R = R_base + 0.8 * splitMod;
    const zOffset = 1.5 * Math.sin(u * k + t);
    
    // Tube radius fluctuates
    const r = r_base * (0.8 + 0.3 * Math.sin(v * 3 + u * k));
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = zOffset + r * Math.sin(v);
    
    // Psychedelic coloring
    // Map normal direction or position to hue
    const hue = (u / (2*Math.PI) + t * 0.1) % 1;
    
    // We need RGB from Hue (simple approximation)
    let r_c = Math.abs(Math.sin(hue * 6));
    let g_c = Math.abs(Math.sin(hue * 6 + 2));
    let b_c = Math.abs(Math.sin(hue * 6 + 4));

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Matrix Glitch)",
    config: {
      display: { shininess: 10, dirIntensity: 1.0, ambientIntensity: 0.8, backgroundColor: "#000000", showWireframe: true },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 120, vSegs: 80 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 60 },
        { name: "res", value: 8, min: 2, max: 32, step: 1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    const res = input.res || 8;
    
    const R = 3.5;
    const r = 1.5;
    
    // Quantize u and v to create blocks
    // Add time-based shifting to "glitch" blocks
    
    const noise = Math.sin(u * 10 + v * 10 + t * 5);
    const isGlitch = noise > 0.8;
    
    // Quantization
    let uQ = Math.floor(u * res) / res;
    let vQ = Math.floor(v * res) / res;
    
    if (isGlitch) {
        // Shift random blocks out massively
        uQ += 0.1 * Math.sin(t * 20);
    }
    
    const x = (R + r * Math.cos(vQ)) * Math.cos(uQ);
    const y = (R + r * Math.cos(vQ)) * Math.sin(uQ);
    let z = r * Math.sin(vQ);
    
    if (isGlitch) {
       z *= 3.0; // Spike
    }
    
    // Matrix Green colors
    let r_c = 0; 
    let g_c = 0.8; 
    let b_c = 0;
    
    if (isGlitch) {
        r_c = 1.0; g_c = 1.0; b_c = 1.0; // White flashes
    } else {
        // Gradient
        g_c = 0.4 + 0.6 * Math.sin(u * 5);
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Sea Urchin)",
    config: {
      display: { shininess: 60, dirIntensity: 0.8, ambientIntensity: 0.2, backgroundColor: "#001e30" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 30 },
        { name: "spikes", value: 20, min: 5, max: 50, step: 1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    const spikes = input.spikes || 20;
    
    const R = 3.5;
    const rBase = 1.4;
    
    // Spikes based on spherical harmonics feel
    // High frequency sin waves
    
    const spikeH = Math.pow(Math.sin(u * spikes) * Math.sin(v * (spikes/2)), 4);
    
    // Breathing effect
    const breath = 1 + 0.5 * Math.sin(t * 2);
    
    const r = rBase + 1.5 * spikeH * breath;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Color: Tips are dangerous (Red), Base is safe (Blue)
    let r_c = spikeH; 
    let g_c = 0.2 * spikeH; 
    let b_c = 1.0 - spikeH;

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Superformula)",
    config: {
      display: { shininess: 120, dirIntensity: 1.0, ambientIntensity: 0.3, backgroundColor: "#222" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "m", value: 6, min: 0, max: 20, step: 1, runtime: 100 }, // Number of points
        { name: "n1", value: 1, min: 0.1, max: 10, step: 0.1 },
        { name: "n2", value: 1, min: 0.1, max: 10, step: 0.1 },
        { name: "n3", value: 1, min: 0.1, max: 10, step: 0.1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u; // Angle around torus
    const v = input.v; // Angle of cross section
    
    // Superformula params
    const m = input.m || 6;
    const n1 = input.n1 || 1;
    const n2 = input.n2 || 1;
    const n3 = input.n3 || 1;
    const a = 1;
    const b = 1;
    
    // Helper function for superformula radius
    function superShaper(angle, m, n1, n2, n3) {
        const t1 = Math.abs(Math.cos(m * angle / 4) / a);
        const t2 = Math.abs(Math.sin(m * angle / 4) / b);
        return Math.pow(Math.pow(t1, n2) + Math.pow(t2, n3), -1 / n1);
    }
    
    const R = 3.5;
    
    // Modulate the cross-section radius 'r' using superformula on 'v'
    const rScale = superShaper(v, m, n1, n2, n3);
    const r = 1.5 * rScale;
    
    // Optionally modulate the main ring shape too?
    // Let's keep main ring circular for now so it's a donut
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Color based on curvature/radius
    const intensity = rScale; // 0 to >1
    let r_c = 1.0; 
    let g_c = 0.5 * intensity; 
    let b_c = 0.2;
    
    // Gold/Metallic look
    if (intensity > 1.2) { r_c = 1; g_c = 1; b_c = 0.8; }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Black Hole)",
    config: {
      display: { shininess: 150, dirIntensity: 1.5, ambientIntensity: 0.1, backgroundColor: "#000000", showWireframe: false },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 50 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 4.0;
    
    // Spiral distortion for accretion disk look
    const twist = u * 2 + t * 4;
    
    // Radius streaks
    const streak = Math.sin(u * 20 + twist) + Math.sin(u * 5 - t);
    const rBase = 2.0;
    const r = rBase + 0.1 * streak;
    
    // Flatten Z heavily to make it disk-like, thicker in middle
    const zScale = 0.05 + 0.2 * Math.exp(-Math.pow(Math.sin(v), 2));
    
    let x = (R + r * Math.cos(v)) * Math.cos(u);
    let y = (R + r * Math.cos(v)) * Math.sin(u);
    let z = r * Math.sin(v) * zScale;
    
    // Doppler effect coloring
    const doppler = Math.cos(u);
    let r_c = 1.0, g_c = 0.6, b_c = 0.2;
    
    if (doppler > 0) {
        // Approaching (Hotter/Blue)
        b_c += 0.5 * doppler;
        g_c += 0.2 * doppler;
    } else {
        // Receding (Cooler/Red)
        g_c *= 0.5;
        b_c *= 0.2;
    }
    
    // Bright streaks
    if (streak > 1.0) {
        r_c = 1; g_c = 1; b_c = 1;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Quantum Cloud)",
    config: {
      display: { shininess: 50, dirIntensity: 0.8, ambientIntensity: 0.2, backgroundColor: "#050010", showWireframe: true },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 120 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 80 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    // Probability density function approximation
    const prob = Math.sin(u * 30 + t) * Math.sin(v * 30 - t) * Math.sin(u * 15 + v * 15);
    
    const R = 3.5;
    // Vibrating surface
    const r = 1.5 + 0.4 * prob;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Electron coloring
    let r_c = 0, g_c = 0, b_c = 0;
    
    if (prob > 0.5) {
        // High density (Nucleus/Energy)
        r_c = 0.1; g_c = 0.8; b_c = 1.0;
    } else if (prob < -0.5) {
        // Void / Dark Matter
        r_c = 0.1; g_c = 0.0; b_c = 0.2;
    } else {
        // Cloud
        r_c = 0; g_c = 0.1; b_c = 0.3;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Alpine Ring)",
    config: {
      display: { shininess: 20, dirIntensity: 1.2, ambientIntensity: 0.6, backgroundColor: "#87CEEB", globalSaturation: 1.2 },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 10 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    
    const R = 4.0;
    const rBase = 1.2;
    
    // Simple terrain noise (sum of sines)
    const noise1 = Math.sin(u * 8) * Math.cos(v * 4);
    const noise2 = 0.5 * Math.sin(u * 16 + 1) * Math.cos(v * 8 + 2);
    const noise3 = 0.25 * Math.sin(u * 32 + 2) * Math.cos(v * 16 + 1);
    
    let h = noise1 + noise2 + noise3;
    
    // Water level logic
    let isWater = false;
    if (h < -0.2) {
        h = -0.2;
        isWater = true;
    }
    
    const r = rBase + 0.6 * h;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    let r_c, g_c, b_c;
    
    if (isWater) {
        // Deep Blue
        r_c = 0.0; g_c = 0.3; b_c = 0.8;
    } else {
        if (h > 0.8) {
            // Snow Peak
            r_c = 1.0; g_c = 1.0; b_c = 1.0;
        } else if (h > 0.3) {
            // Grey Rock
            r_c = 0.5; g_c = 0.45; b_c = 0.4;
        } else {
            // Green Grass
            r_c = 0.2; g_c = 0.6; b_c = 0.1;
        }
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Cthulhu)",
    config: {
      display: { shininess: 80, dirIntensity: 0.6, ambientIntensity: 0.3, backgroundColor: "#0f172a" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 180, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 40 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    
    // Undulating tentacles
    const tentacles = 8;
    const writhe = Math.sin(u * tentacles + Math.sin(v * 4) + t);
    
    // Sucker pods
    const suckers = Math.cos(u * 40) * Math.cos(v * 10);
    
    const rBase = 1.5;
    const r = rBase + 0.3 * writhe + (suckers > 0.8 ? 0.2 : 0);
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Swampy colors
    let r_c = 0.2, g_c = 0.3, b_c = 0.1; 
    
    // Purple suckers
    if (suckers > 0.8) {
        r_c = 0.6; g_c = 0.2; b_c = 0.8;
    }
    
    // Dark crevices in the folds
    if (writhe < -0.5) {
        r_c = 0.05; g_c = 0.1; b_c = 0.05;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Fractal Reef)",
    config: {
      display: { shininess: 60, dirIntensity: 1.0, ambientIntensity: 0.3, backgroundColor: "#001020" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 20 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    let r = 1.5;
    
    // Fractal summation (FBM)
    // We warp the domain slightly to make it look organic
    let freq = 3.0;
    let amp = 0.4;
    let sum = 0;
    
    for(let i=0; i<5; i++) {
        // Rotate coords slightly for complexity
        const u2 = u + Math.sin(v*0.5);
        const v2 = v + Math.cos(u*0.5);
        
        sum += Math.sin(u2 * freq + t * (0.1*i)) * Math.cos(v2 * freq) * amp;
        freq *= 2.0;
        amp *= 0.5;
    }
    
    r += sum;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Color based on height/depth of fractal
    // Deep crevices = dark purple, tips = neon cyan
    const norm = (sum + 0.4) / 0.8; // approx 0-1
    
    let r_c = 0.1 + 0.1 * norm;
    let g_c = 0.2 * norm;
    let b_c = 0.5 + 0.5 * norm;
    
    if (norm > 0.8) { // Tips
        g_c = 1.0; b_c = 1.0;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Ferrofluid)",
    config: {
      display: { shininess: 200, dirIntensity: 1.8, ambientIntensity: 0.1, backgroundColor: "#111", showWireframe: false },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 50 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    const rBase = 1.4;
    
    // Magnetic spikes
    // We want sharp spikes that react to a "field"
    
    // Dynamic field moving through the torus
    const fieldPhase = Math.sin(u * 3 + t) * Math.sin(v * 2 + t * 0.5);
    
    // High frequency spikes
    const spikes = Math.pow(Math.abs(Math.sin(u * 30) * Math.sin(v * 15)), 2);
    
    // Modulate spike height by field
    const h = 1.2 * spikes * (0.5 + 0.5 * fieldPhase);
    
    const r = rBase + h;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Ferrofluid is usually black and shiny
    // We simulate iridescence on the tips
    
    let r_c = 0.05, g_c = 0.05, b_c = 0.05; // Black oil
    
    // Tips get oily sheen
    if (h > 0.8) {
        // Rainbow oil slick
        r_c = 0.5 + 0.5 * Math.sin(u * 10);
        g_c = 0.5 + 0.5 * Math.sin(u * 10 + 2);
        b_c = 0.5 + 0.5 * Math.sin(u * 10 + 4);
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Space Station)",
    config: {
      display: { shininess: 50, dirIntensity: 1.0, ambientIntensity: 0.2, backgroundColor: "#000515", showWireframe: false },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 160, vSegs: 80 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 30 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.8;
    const rBase = 1.5;
    
    // Discretize for paneling
    const uSegs = 24;
    const vSegs = 12;
    
    const uStep = Math.floor(u * uSegs);
    const vStep = Math.floor(v * vSegs);
    
    // Pseudo-random deterministic noise based on panel ID
    const panelId = uStep * 100 + vStep;
    const rand = Math.sin(panelId * 12.9898); // -1 to 1
    
    let h = 0;
    
    if (rand > 0.8) h = 0.3;       // Tall habitation module
    else if (rand > 0.4) h = 0.1;  // Low machinery
    else if (rand > -0.2) h = 0;   // Deck
    else h = -0.1;                 // Trench
    
    // Equatorial Trench
    const vNorm = v / (2*Math.PI); // 0 to 1
    if (Math.abs(vNorm - 0.5) < 0.05) h = -0.4;
    
    const r = rBase + h;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Tech Colors
    let r_c = 0.7, g_c = 0.7, b_c = 0.75; // Hull Grey
    
    if (h > 0.2) { // Habitation
        r_c = 0.9; g_c = 0.9; b_c = 0.9; // White
    } else if (h < -0.3) { // Trench core
        r_c = 0.1; g_c = 0.1; b_c = 0.2; // Dark
        // Engine lights
        if (Math.sin(u * 50 + t * 5) > 0.9) {
            r_c = 0.2; g_c = 0.8; b_c = 1.0; // Blue pulsars
        }
    } else if (rand > 0.9) {
        // Windows
        r_c = 1.0; g_c = 0.6; b_c = 0.0; // Orange light
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Biotissue)",
    config: {
      display: { shininess: 80, dirIntensity: 0.6, ambientIntensity: 0.4, backgroundColor: "#200505" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 180, vSegs: 90 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 40 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    const rBase = 1.4;
    
    // Organic noise (sum of sines)
    const noise = Math.sin(u * 5) * Math.cos(v * 4 + t * 0.5) + 
                  0.5 * Math.sin(u * 10 + t) * Math.sin(v * 10);
                  
    // Veins / Arteries - sharp ridges
    const vascular = Math.pow(Math.sin(u * 15 + Math.sin(v * 5)), 20); // Very thin lines
    
    // Pustules / Boils
    const boilFreq = 12;
    const boils = Math.max(0, Math.sin(u * boilFreq) * Math.sin(v * boilFreq) - 0.5);
    
    // Breathing motion
    const breath = 0.1 * Math.sin(t * 2);
    
    const r = rBase + 0.3 * noise + 0.2 * vascular + 0.6 * boils * Math.sin(t * 5 + u*10) + breath;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Flesh Colors
    let r_c = 0.8, g_c = 0.5, b_c = 0.4; // Skin tone
    
    if (vascular > 0.1) {
        r_c = 0.8; g_c = 0.1; b_c = 0.1; // Blood red veins
    }
    
    if (boils > 0.1) {
        r_c = 0.9; g_c = 0.9; b_c = 0.2; // Yellow pus
    }
    
    // Bruising in low noise areas
    if (noise < -0.5) {
        r_c = 0.4; g_c = 0.2; b_c = 0.4; // Purple bruise
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Reality Glitch)",
    config: {
      display: { shininess: 80, dirIntensity: 1.0, ambientIntensity: 0.5, backgroundColor: "#000" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 50 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    
    // The Glitch: Tangent function creates asymptotes (tearing)
    // We animate the frequency and offset
    const tear = Math.tan(u * 3 + Math.sin(t) * 2);
    
    // Clamp the infinite values to create solid "walls" of glitch
    const dist = Math.max(-1.5, Math.min(1.5, tear));
    
    const r = 1.5 + 0.4 * dist;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // RGB Split / Chromatic Aberration effect based on position
    let r_c = Math.sin(u * 10 + t * 5);
    let g_c = Math.sin(v * 10 - t * 5);
    let b_c = dist; // The glitch wall is blue
    
    // Strobing
    if (Math.random() > 0.95) { r_c = 1; g_c = 1; b_c = 1; }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Bitwise Hell)",
    config: {
      display: { shininess: 20, dirIntensity: 0.8, ambientIntensity: 0.2, backgroundColor: "#001100" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 150, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 60 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    
    // Discrete Grid
    const scale = 20;
    const iu = Math.floor(u * scale + t);
    const iv = Math.floor(v * scale);
    
    // Bitwise Logic Visualizer
    // (u & v) creates fractal triangles (Sierpinski)
    // (u ^ v) creates XOR texture
    const logic = (iu & iv) ^ Math.floor(t * 5);
    
    const h = (logic % 5) / 5; // Normalize 0-1
    
    const r = 1.2 + 0.8 * h;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Terminal Colors
    let r_c = 0.0;
    let g_c = 1.0;
    let b_c = 0.0;
    
    if (h < 0.2) { r_c=0; g_c=0.1; b_c=0; } // Background
    else if (h > 0.8) { r_c=0.5; g_c=1.0; b_c=0.5; } // High
    
    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Spaghetti Monster)",
    config: {
      display: { shininess: 60, dirIntensity: 1.0, ambientIntensity: 0.5, backgroundColor: "#200" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 200, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 40 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    
    // Domain Warping: Feed sine waves into other sine waves
    // This creates a tangled, chaotic mess
    const warp = Math.sin(u * 4 + 2 * Math.sin(v * 4 + t));
    const warp2 = Math.cos(v * 4 + 2 * Math.cos(u * 4 + t));
    
    const r = 1.5 + 0.5 * (warp + warp2);
    
    // Twist coordinates for the tube
    const x = (R + r * Math.cos(v)) * Math.cos(u + warp * 0.5);
    const y = (R + r * Math.cos(v)) * Math.sin(u + warp * 0.5);
    const z = r * Math.sin(v + warp2 * 0.5);
    
    // Color: Tomato Sauce & Pasta
    let r_c = 1.0;
    let g_c = 0.8; 
    let b_c = 0.6; // Pasta
    
    // Deep crevices are red sauce
    if (warp * warp2 < -0.5) {
        r_c = 0.8; g_c = 0.1; b_c = 0.0;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Polygon Shredder)",
    config: {
      display: { shininess: 40, dirIntensity: 1.2, ambientIntensity: 0.3, backgroundColor: "#111" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 180, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 60 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    
    // High frequency noise to simulate explosion
    const jitter = Math.sin(u * 100) * Math.cos(v * 100);
    
    // Exploding pulse
    const pulse = Math.sin(t * 3);
    
    // If pulse is high, displace vertices heavily along normal
    let disp = 0;
    if (Math.abs(jitter) > 0.5) {
        disp = jitter * pulse * 2.0;
    }
    
    const r = 1.5 + disp;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Color: Warning stripes
    // Use u to create stripes
    const stripe = Math.sin(u * 20 + t * 5);
    let r_c = 1.0; 
    let g_c = 0.8; 
    let b_c = 0.0; // Yellow
    
    if (stripe > 0) {
        r_c = 0.1; g_c = 0.1; b_c = 0.1; // Black
    }
    
    // Exploded parts are white hot
    if (Math.abs(disp) > 1.0) {
        r_c = 1.0; g_c = 1.0; b_c = 1.0;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Celtic Knot)",
    config: {
      display: { shininess: 120, dirIntensity: 1.2, ambientIntensity: 0.4, backgroundColor: "#0f172a" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 300, vSegs: 100 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 40 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    const rBase = 1.5;
    
    // Weave pattern logic
    // We want strands to go over and under
    // Create a 2D weave based on u and v
    
    const strands = 6;
    const weaveX = Math.cos(u * strands + v);
    const weaveY = Math.sin(u * strands - v);
    
    // Depth of the weave
    const depth = 0.3 * weaveX * weaveY;
    
    const r = rBase + depth;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Color based on height to emphasize the weave
    let r_c = 0.6, g_c = 0.4, b_c = 0.2; // Bronze
    
    if (depth > 0.05) {
        r_c = 0.8; g_c = 0.7; b_c = 0.4; // Gold highlights
    } else if (depth < -0.05) {
        r_c = 0.3; g_c = 0.2; b_c = 0.1; // Shadow
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (8-Bit)",
    config: {
      display: { shininess: 20, dirIntensity: 1.0, ambientIntensity: 0.8, backgroundColor: "#1e1b4b", showWireframe: true },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 100, vSegs: 60 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 50 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    const rBase = 1.5;
    
    // Quantize resolution to create voxels
    const res = 16;
    const uQ = Math.floor(u * res) / res;
    const vQ = Math.floor(v * res) / res;
    
    // Height map based on noise
    const noise = Math.sin(uQ * 5 + t) * Math.cos(vQ * 5);
    const h = 0.4 * Math.floor(noise * 4) / 4; // Stepped height
    
    const r = rBase + h;
    
    // We use the quantized angles for coordinates to make it look like blocks
    // NOTE: This actually separates the mesh, creating gaps (glitchy cool look)
    const x = (R + r * Math.cos(vQ)) * Math.cos(uQ);
    const y = (R + r * Math.cos(vQ)) * Math.sin(uQ);
    const z = r * Math.sin(vQ);
    
    // Voxel Colors
    let r_c = 0.0, g_c = 0.8, b_c = 0.2; // Green
    
    if (h > 0.2) {
        r_c = 0.8; g_c = 0.8; b_c = 0.8; // Snow
    } else if (h < -0.2) {
        r_c = 0.0; g_c = 0.2; b_c = 0.8; // Water
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Equalizer)",
    config: {
      display: { shininess: 50, dirIntensity: 1.0, ambientIntensity: 0.0, backgroundColor: "#000000" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 180, vSegs: 80 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 100 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    const rBase = 1.2;
    
    // Frequency bands around the ring (u)
    // Audio visualization simulation
    const freq = 20;
    const band = Math.floor(u * freq);
    
    // Random height for each band, animated
    // Pseudo-random based on band index and time
    const amp = Math.abs(Math.sin(band * 13.5 + t * 5) * Math.sin(band * 2.3 - t));
    
    // Bar shape in cross section (v)
    // Flat top bars
    let barHeight = 0;
    if (v > 0 && v < Math.PI) {
        barHeight = amp * 1.5 * Math.sin(v); 
    }
    
    const r = rBase + barHeight;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // LED Colors
    // Gradient from Green to Red based on height
    let r_c = 0, g_c = 1, b_c = 0;
    
    if (amp > 0.5) {
        r_c = 1.0; g_c = 1.0 - (amp-0.5)*2; b_c = 0;
    }
    
    // Black gaps between bands
    const uGap = (u * freq) - Math.floor(u * freq);
    if (uGap > 0.8) {
        r_c = 0.1; g_c = 0.1; b_c = 0.1;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Donut (Amethyst)",
    config: {
      display: { shininess: 200, dirIntensity: 1.5, ambientIntensity: 0.2, backgroundColor: "#1a0b2e" },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 120, vSegs: 80 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 40 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u;
    const v = input.v;
    const t = input.t || 0;
    
    const R = 3.5;
    const rBase = 1.6;
    
    // Faceted Crystal Look
    // Use low frequency, high amplitude noise with sharp transitions
    const facets = Math.sin(u * 8) * Math.cos(v * 5 + t * 0.2) + 
                   Math.sin(u * 14 + 2) * Math.cos(v * 9);
    
    // Sharp ridges using power function or absolute value
    const sharp = Math.pow(Math.abs(facets), 1.5);
    
    // Some spikes pointing in
    const spike = (facets < 0) ? -0.5 * sharp : 0.2 * sharp;
    
    const r = rBase + spike;
    
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    
    // Crystal Purple Color
    let r_c = 0.4, g_c = 0.0, b_c = 0.6;
    
    // Lighter edges
    if (sharp > 0.8) {
        r_c = 0.7; g_c = 0.4; b_c = 0.9;
    }
    // Deep internal refraction simulation
    if (spike < -0.3) {
        r_c = 0.2; g_c = 0.0; b_c = 0.3;
    }

    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Math: Klein Bottle (Fig-8)",
    config: {
      display: { shininess: 80, dirIntensity: 1.0, ambientIntensity: 0.5, backgroundColor: "#1e1e24", showWireframe: false },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 150, vSegs: 150 },
      extraParameters: [
        { name: "scale", value: 2.0, min: 0.5, max: 5.0, step: 0.1 },
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 20 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u; 
    const v = input.v; 
    const scale = input.scale || 2.0;
    const t = input.t || 0;
    
    // Figure-8 Klein Bottle
    const r = 1 + 0.5 * Math.cos(u/2) * Math.sin(v) - 0.5 * Math.sin(u/2) * Math.sin(2*v);
    
    let x = scale * (r * Math.cos(u));
    let y = scale * (r * Math.sin(u));
    let z = scale * (0.5 * Math.sin(u/2) * Math.sin(v) + 0.5 * Math.cos(u/2) * Math.sin(2*v));
    
    // Map colors to highlight non-orientability
    const hue = (u / (2 * Math.PI) + v / (2 * Math.PI) + t) % 1;
    // HSV to RGB conversion
    const c = 0.8;
    const x_val = c * (1 - Math.abs((hue * 6) % 2 - 1));
    let r_c, g_c, b_c;
    if (hue * 6 < 1) { r_c = c; g_c = x_val; b_c = 0; }
    else if (hue * 6 < 2) { r_c = x_val; g_c = c; b_c = 0; }
    else if (hue * 6 < 3) { r_c = 0; g_c = c; b_c = x_val; }
    else if (hue * 6 < 4) { r_c = 0; g_c = x_val; b_c = c; }
    else if (hue * 6 < 5) { r_c = x_val; g_c = 0; b_c = c; }
    else { r_c = c; g_c = 0; b_c = x_val; }
    
    return { x, y, z, r: r_c + 0.2, g: g_c + 0.2, b: b_c + 0.2, a: 1 };
}`
      }
    }
  },
  {
    name: "Math: Enneper Surface",
    config: {
      display: { shininess: 120, dirIntensity: 1.2, ambientIntensity: 0.3, backgroundColor: "#001a1a", showWireframe: false },
      parameters: { uMin: -2, uMax: 2, vMin: -2, vMax: 2, uSegs: 150, vSegs: 150 },
      extraParameters: [
        { name: "radius", value: 1.0, min: 0.1, max: 2.0, step: 0.1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u; 
    const v = input.v; 
    const R = input.radius || 1.0;
    
    // Minimal surface
    let x = R * (u - (u*u*u)/3 + u*v*v);
    let y = R * (-v + (v*v*v)/3 - v*u*u);
    let z = R * (u*u - v*v);
    
    // Smooth dual-color gradient based on normal magnitude approximation
    const dist = Math.sqrt(x*x + y*y + z*z);
    const intense = Math.min(1.0, dist / 5.0);
    
    let r_c = intense;
    let g_c = 0.5 + 0.5 * Math.sin(u*v);
    let b_c = 1.0 - intense;
    
    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Math: Breather Surface",
    config: {
      display: { shininess: 100, dirIntensity: 0.8, ambientIntensity: 0.5, backgroundColor: "#2e0f1a", showWireframe: false },
      parameters: { uMin: -14, uMax: 14, vMin: -37.4, vMax: 37.4, uSegs: 200, vSegs: 200 },
      extraParameters: [
        { name: "aa", value: 0.4, min: 0.1, max: 0.9, step: 0.05 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u; 
    const v = input.v; 
    const aa = input.aa || 0.4;
    
    // A surface of constant negative Gaussian curvature
    const w = Math.sqrt(1 - aa*aa);
    const denom = aa * (Math.pow(w*Math.cosh(aa*u), 2) + Math.pow(aa*Math.sin(w*v), 2));
    
    let x = -u + (2 * (1 - aa*aa) * Math.cosh(aa*u) * Math.sinh(aa*u)) / denom;
    let y = (2 * w * Math.cosh(aa*u) * (-(w*Math.cos(v)*Math.cos(w*v)) - Math.sin(v)*Math.sin(w*v))) / denom;
    let z = (2 * w * Math.cosh(aa*u) * (-(w*Math.sin(v)*Math.cos(w*v)) + Math.cos(v)*Math.sin(w*v))) / denom;
    
    // Scale down
    x *= 0.5; y *= 0.5; z *= 0.5;
    
    // Elegant rose gold logic
    const thickness = denom;
    let r_c = 0.9;
    let g_c = 0.5 + 0.2 * Math.cos(thickness);
    let b_c = 0.4 + 0.1 * Math.sin(thickness);
    
    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Math: Gyroid Variant",
    config: {
      display: { shininess: 180, dirIntensity: 1.1, ambientIntensity: 0.3, backgroundColor: "#02020a", showWireframe: false },
      parameters: { uMin: -3.1415, uMax: 3.1415, vMin: -3.1415, vMax: 3.1415, uSegs: 200, vSegs: 200 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 20 },
        { name: "k", value: 2.0, min: 0.5, max: 4.0, step: 0.1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u; 
    const v = input.v; 
    const t = input.t || 0;
    const k = input.k || 2.0;
    
    // Map standard sphere 
    const rho = 3.0;
    let px = rho * Math.cos(v) * Math.cos(u);
    let py = rho * Math.cos(v) * Math.sin(u);
    let pz = rho * Math.sin(v);
    
    // Displacement field approximating triply periodic minimal
    const disp = Math.sin(k*px + t)*Math.cos(k*py + t) + Math.sin(k*py + t)*Math.cos(k*pz + t) + Math.sin(k*pz + t)*Math.cos(k*px + t);
    
    const x = px + disp * Math.cos(v) * Math.cos(u);
    const y = py + disp * Math.cos(v) * Math.sin(u);
    const z = pz + disp * Math.sin(v);
    
    // Iridescent colors base on displacement
    let r_c = 0.5 + 0.5 * Math.sin(disp * 3.0);
    let g_c = 0.5 + 0.5 * Math.sin(disp * 3.0 + 2.0);
    let b_c = 0.5 + 0.5 * Math.sin(disp * 3.0 + 4.0);
    
    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Math: Boy's Surface",
    config: {
      display: { shininess: 90, dirIntensity: 1.3, ambientIntensity: 0.4, backgroundColor: "#1e293b", showWireframe: false },
      parameters: { uMin: 0, uMax: 3.14159, vMin: 0, vMax: 3.14159, uSegs: 200, vSegs: 200 },
      extraParameters: [
        { name: "scale", value: 3.0, min: 0.5, max: 5.0, step: 0.1 },
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 10 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u; 
    const v = input.v; 
    const scale = input.scale || 3.0;
    const t = input.t || 0;
    
    // Apéry's explicit algebraic coordinates approximation:
    const g1 = -3/2 * Math.sin(2*v) * Math.cos(u);
    const g2 = -3/2 * Math.sin(2*v) * Math.sin(u);
    const g3 = Math.cos(2*v);
    
    const den = Math.sqrt(2) - Math.sin(2*v)*Math.sin(3*u);
    
    let x = scale * (g1 / den);
    let y = scale * (g2 / den);
    let z = scale * (g3 / den);
    
    x += 0.1 * Math.sin(u*10 + t);
    y += 0.1 * Math.sin(v*10 + t);
    z += 0.1 * Math.cos(u*5 + v*5 + t);
    
    let r_c = 0.3 + 0.7 * Math.abs(Math.sin(u));
    let g_c = 0.5 + 0.5 * Math.abs(Math.cos(v));
    let b_c = 0.6 + 0.4 * Math.abs(Math.sin(u*v));
    
    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
} `
      }
    }
  },
  {
    name: "Math: Riemann Zeta Surface",
    config: {
      display: { shininess: 80, dirIntensity: 1.0, ambientIntensity: 0.2, backgroundColor: "#000000", showWireframe: false },
      parameters: { uMin: 0.1, uMax: 2.5, vMin: 0.0, vMax: 50.0, uSegs: 150, vSegs: 400 },
      extraParameters: [
        { name: "N", value: 30, min: 1, max: 100, step: 1 },
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 5 }
      ],
      surface: {
        code: `function surface(input) {
    // Riemann Zeta Function Approximation (Dirichlet Eta series)
    // s = u + i*v
    // Z(s) ~ Sum_{n=1}^N 1 / n^s
    const u = input.u; // Real part (Critical line at u=0.5)
    const v = input.v; // Imaginary part
    const N = Math.floor(input.N || 30);
    const t = input.t || 0;
    
    let re = 0;
    let im = 0;
    
    // We use the alternating Dirichlet Eta function to converge better for 0 < Re(s) < 1
    // eta(s) = Sum_{n=1}^N (-1)^{n-1} / n^s
    // Z(s) = eta(s) / (1 - 2^{1-s})
    let eta_re = 0;
    let eta_im = 0;
    
    for (let n = 1; n <= N; n++) {
        // n^(-s) = exp(-s * ln(n)) = exp(-u * ln(n)) * exp(-i * v * ln(n))
        const r = Math.pow(n, -u);
        const theta = -v * Math.log(n);
        const sign = (n % 2 === 1) ? 1 : -1;
        
        eta_re += sign * r * Math.cos(theta);
        eta_im += sign * r * Math.sin(theta);
    }
    
    // factor = 1 - 2^{1-s} = 1 - 2^{1-u} * exp(-i * v * ln(2))
    const f_r = 1 - Math.pow(2, 1 - u) * Math.cos(-v * Math.LN2);
    const f_i = - Math.pow(2, 1 - u) * Math.sin(-v * Math.LN2);
    const f_mag2 = f_r*f_r + f_i*f_i;
    
    // Z = eta / factor
    if (f_mag2 > 0.0001) {
        re = (eta_re * f_r + eta_im * f_i) / f_mag2;
        im = (eta_im * f_r - eta_re * f_i) / f_mag2;
    }
    
    const magnitude = Math.sqrt(re*re + im*im);
    const phase = Math.atan2(im, re);
    
    // Map to 3D space
    // Emphasize the critical line at u=0.5
    const x = (u - 0.5) * 20.0;
    const y = v * 0.5 - 12.5; 
    // Animate the height
    const z = Math.min(15.0, magnitude * 4.0) * Math.cos(t); 
    
    // Color mapping by complex phase (Domain coloring)
    // Map phase (-pi to pi) to hue
    const r_c = 0.5 + 0.5 * Math.cos(phase);
    const g_c = 0.5 + 0.5 * Math.cos(phase - 2.094); // -120 deg
    const b_c = 0.5 + 0.5 * Math.cos(phase + 2.094); // +120 deg

    // Make the poles bright and zeros dark
    const lum = Math.min(1.0, magnitude / 2.0) + 0.1;

    return { 
        x, y, z, 
        r: r_c * lum, 
        g: g_c * lum, 
        b: b_c * lum, 
        a: 1 
    };
}`
      }
    }
  },
  {
    name: "Math: 4D Hopf Torus (StereoProj)",
    config: {
      display: { shininess: 150, dirIntensity: 1.4, ambientIntensity: 0.3, backgroundColor: "#010014", showWireframe: false },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 6.28318, uSegs: 250, vSegs: 250 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 20 },
        { name: "fold", value: 0.4, min: 0.0, max: 1.2, step: 0.01 },
        { name: "k", value: 3.0, min: 1.0, max: 8.0, step: 1.0 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u; 
    const v = input.v; 
    const t = input.t || 0;
    const k = input.k || 3.0;
    const fold = input.fold || 0.4;
    
    // Animate the base 4D angle to turn the torus inside out
    const baseAlpha = Math.PI / 4 + Math.sin(t * 0.2) * 0.2;
    
    // Add non-linear 4D topological folds
    const alpha = baseAlpha + fold * Math.sin(k * u) * Math.cos(k * v + t * 2.0);
    
    // 4D Coordinates of the warped Clifford Torus mapped via Hopf Fibration
    const x1 = Math.cos(alpha) * Math.cos(u);
    const x2 = Math.cos(alpha) * Math.sin(u);
    const x3 = Math.sin(alpha) * Math.cos(v);
    const x4 = Math.sin(alpha) * Math.sin(v);
    
    // Stereographic projection from 4S hypersphere onto 3D space
    // Pole is at (0,0,0,1). The denominator prevents singularities unless fold is extreme.
    const den = Math.max(0.0001, 1.0 - x4);
    
    let x = (x1 / den) * 2.0;
    let y = (x2 / den) * 2.0;
    let z = (x3 / den) * 2.0;
    
    // Deep spatial chromatic dispersion based on the 4D coordinate
    const dist = x*x + y*y + z*z;
    let r_c = 0.5 + 0.5 * Math.sin(dist * 0.1 - t);
    let g_c = 0.5 + 0.5 * Math.cos(u * k + t);
    let b_c = 0.5 + 0.5 * Math.sin(v * k - x4 * 5.0);
    
    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  },
  {
    name: "Math: Hyperbolic Coral (Fractal)",
    config: {
      display: { shininess: 30, dirIntensity: 1.0, ambientIntensity: 0.8, backgroundColor: "#021114", showWireframe: false },
      parameters: { uMin: 0, uMax: 6.28318, vMin: 0, vMax: 4.0, uSegs: 300, vSegs: 150 },
      extraParameters: [
        { name: "t", value: 0, min: 0, max: 100, step: 0.01, runtime: 15 },
        { name: "buckle", value: 0.5, min: 0.0, max: 1.0, step: 0.01 },
        { name: "harmonics", value: 5, min: 1, max: 7, step: 1 }
      ],
      surface: {
        code: `function surface(input) {
    const u = input.u; // angle 0 to 2pi
    const v = input.v; // radius 0 to 4
    const t = input.t || 0;
    const buckle = input.buckle || 0.5;
    const maxH = Math.floor(input.harmonics || 5);
    
    // Base exponential disk (Hyperbolic growth)
    let x = v * Math.cos(u) * 1.5;
    let y = v * Math.sin(u) * 1.5;
    let z = -(v * v) * 0.2; // Slight bowl shape
    
    // Add successive integer harmonics to simulate hyperbolic buckling
    // As radius (v) increases, higher frequency waves emerge
    let perturbX = 0, perturbY = 0;
    
    for (let i = 1; i <= maxH; i++) {
        const freq = Math.pow(2, i); // 2, 4, 8, 16, 32...
        const threshold = i * 0.6; // Higher frequencies only appear at outer radii
        
        if (v > threshold) {
            const growth = Math.pow(v - threshold, 1.5);
            const amp = buckle * growth * (1.0 / i);
            
            z += amp * Math.sin(freq * u + t * i);
            
            // Allow the waves to fold over themselves (creating overhangs)
            perturbX += amp * 0.5 * Math.cos(freq * u - t) * Math.cos(u);
            perturbY += amp * 0.5 * Math.cos(freq * u - t) * Math.sin(u);
        }
    }
    
    x += perturbX;
    y += perturbY;
    
    // Bioluminescent gradient logic based on depth and folding
    const slope = Math.abs(z / v);
    let r_c = 0.05 + 0.9 * Math.max(0, Math.sin(v * 2.0 - t));
    let g_c = 0.8 * slope;
    let b_c = 0.9 - 0.5 * slope + 0.5 * Math.sin(u * 3 + t);
    
    return { x, y, z, r: r_c, g: g_c, b: b_c, a: 1 };
}`
      }
    }
  }
];