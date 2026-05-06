export interface ParamDefinition {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  runtime?: number; // For auto-animation
  isAnimating?: boolean;
}

export interface SurfaceConfig {
  code: string;
}

export interface DisplaySettings {
  autoRotate: boolean;
  showAxes: boolean;
  showSurface: boolean;
  showWireframe: boolean;
  dirIntensity: number;
  ambientIntensity: number;
  shininess: number;
  globalSaturation: number;
  backgroundColor: string;
  analysisMode: 'none' | 'gaussian' | 'mean';
}

export interface GridSettings {
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
  uSegs: number;
  vSegs: number;
}

export interface OutputSettings {
  coordConversion: 'none' | 'spherical' | 'cylindrical';
  rgbToHsv: boolean;
}

export interface Preset {
  name: string;
  config: {
    display: Partial<DisplaySettings>;
    parameters: GridSettings;
    extraParameters: ParamDefinition[];
    surface: SurfaceConfig;
    outputs?: OutputSettings;
  };
}
