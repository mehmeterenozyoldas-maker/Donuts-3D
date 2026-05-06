import { create } from 'zustand';
import { ParamDefinition, SurfaceConfig, DisplaySettings, GridSettings, OutputSettings, Preset } from './types';
import { DEFAULT_FUNCTION } from './constants';

interface AppState {
  grid: GridSettings;
  display: DisplaySettings;
  surface: SurfaceConfig;
  outputs: OutputSettings;
  extraParams: ParamDefinition[];
  compiledFunction: ((input: any) => any) | null;
  error: string | null;
  isInteracting: boolean;
  analysisResults: { area: number; vertices: number; faces: number } | null;

  // Actions
  setGrid: (grid: Partial<GridSettings>) => void;
  setDisplay: (display: Partial<DisplaySettings>) => void;
  setSurfaceCode: (code: string) => void;
  compileSurface: () => void;
  setOutputs: (outputs: Partial<OutputSettings>) => void;
  addExtraParam: (param: ParamDefinition) => void;
  updateExtraParam: (index: number, changes: Partial<ParamDefinition>) => void;
  removeExtraParam: (index: number) => void;
  loadPreset: (preset: Preset) => void;
  setIsInteracting: (isInteracting: boolean) => void;
  setAnalysisResults: (results: { area: number; vertices: number; faces: number }) => void;
}

export const useStore = create<AppState>((set, get) => ({
  grid: {
    uMin: 0,
    uMax: 6.283,
    vMin: 0,
    vMax: 3.14159,
    uSegs: 100, // Reduced from 150 for performance
    vSegs: 100, // Reduced from 150 for performance
  },
  display: {
    autoRotate: true,
    showAxes: false,
    showSurface: true,
    showWireframe: false,
    dirIntensity: 1.5,
    ambientIntensity: 0.8,
    shininess: 100,
    globalSaturation: 1.5,
    backgroundColor: '#4c1d95',
    analysisMode: 'none',
  },
  surface: {
    code: DEFAULT_FUNCTION,
  },
  outputs: {
    coordConversion: 'none',
    rgbToHsv: false,
  },
  extraParams: [
    { name: 't', value: 0, min: 0, max: 100, step: 0.01, runtime: 100, isAnimating: true }
  ],
  compiledFunction: null,
  error: null,
  isInteracting: false,
  analysisResults: null,

  setGrid: (changes) => set((state) => ({ grid: { ...state.grid, ...changes } })),
  setDisplay: (changes) => set((state) => ({ display: { ...state.display, ...changes } })),
  setSurfaceCode: (code) => set((state) => ({ surface: { ...state.surface, code } })),
  setOutputs: (changes) => set((state) => ({ outputs: { ...state.outputs, ...changes } })),
  
  compileSurface: () => {
    const { surface } = get();
    try {
      // eslint-disable-next-line no-new-func
      const factory = new Function(surface.code + '; return surface;');
      const fn = factory();
      if (typeof fn !== 'function') throw new Error('Code must return a function named "surface"');
      
      // Test run
      fn({ u: 0, v: 0, t: 0 });
      
      set({ compiledFunction: fn, error: null });
    } catch (e: any) {
      set({ error: e.message || 'Compilation error' });
    }
  },

  addExtraParam: (param) => set((state) => ({ extraParams: [...state.extraParams, param] })),
  
  updateExtraParam: (index, changes) => set((state) => {
    if (!state.extraParams[index]) return {};
    const newParams = [...state.extraParams];
    newParams[index] = { ...newParams[index], ...changes };
    return { extraParams: newParams };
  }),
  
  removeExtraParam: (index) => set((state) => ({
    extraParams: state.extraParams.filter((_, i) => i !== index)
  })),

  loadPreset: (preset) => {
    if (!preset || !preset.config) return;
    set({
      grid: { ...get().grid, ...preset.config.parameters },
      display: { ...get().display, ...preset.config.display },
      extraParams: (preset.config.extraParameters || []).map(p => ({...p, isAnimating: !!p.runtime})),
      surface: preset.config.surface,
      outputs: preset.config.outputs || { coordConversion: 'none', rgbToHsv: false },
    });
    get().compileSurface();
  },

  setIsInteracting: (isInteracting) => set({ isInteracting }),
  setAnalysisResults: (analysisResults) => set({ analysisResults }),
}));