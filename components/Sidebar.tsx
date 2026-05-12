import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Play, Pause, Zap, FolderOpen, Plus, Trash2, Settings, Code, Sparkles, Eye, Dna } from 'lucide-react';
import { useStore } from '../store';
import { PRESETS } from '../constants';
import clsx from 'clsx';

// Pop Art Panel Component
const PopPanel: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: string;
  textColor?: string;
  defaultOpen?: boolean;
}> = ({ title, icon, children, color, textColor = "text-black", defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`mb-6 relative transition-all duration-200 ${isOpen ? 'translate-y-0' : ''}`}>
      {/* Hard Shadow Block */}
      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-xl" />
      
      <div className={`relative bg-white border-[3px] border-black rounded-xl overflow-hidden`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-3 ${color} border-b-[3px] border-black hover:brightness-110 transition-all`}
        >
          <div className={`flex items-center gap-3 font-['Bangers'] text-xl tracking-wide ${textColor}`}>
            <div className="bg-white border-2 border-black rounded-full p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {icon}
            </div>
            {title}
          </div>
          <div className={`bg-white border-2 border-black rounded p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
            {isOpen ? <ChevronDown size={20} className="text-black" /> : <ChevronRight size={20} className="text-black" />}
          </div>
        </button>
        
        {isOpen && (
          <div className="p-4 bg-white/95 space-y-4 font-['Fredoka']">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color?: string;
  onChange: (val: number) => void;
}> = ({ label, value, min, max, step, color = "bg-green-400", onChange }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-end">
      <label className="font-bold text-black text-sm uppercase">{label}</label>
      <span className="font-mono text-xs bg-black text-white px-2 py-0.5 rounded-full">{value.toFixed(2)}</span>
    </div>
    <div className="relative pt-1">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  </div>
);

const Sidebar: React.FC = () => {
  const store = useStore();
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="w-[380px] h-full flex flex-col pointer-events-none p-4 z-20">
      
      {/* Brand Header */}
      <div className="pointer-events-auto mb-4 bg-yellow-400 border-[3px] border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] hover:rotate-0 transition-transform">
        <h1 className="font-['Bangers'] text-4xl text-center text-black leading-none drop-shadow-sm">
           MATH <span className="text-pink-500">MUSEUM</span>
        </h1>
        <div className="text-center font-['Fredoka'] font-bold text-xs mt-1 uppercase tracking-widest text-black">
          Hyperdimensional Playground
        </div>
      </div>

      {/* Scrollable Controls */}
      <div className="flex-1 overflow-y-auto pointer-events-auto pr-2 pb-10">
        
        {/* Presets - PINK */}
        <PopPanel title="COOL SHAPES" icon={<Sparkles size={18} className="text-pink-500"/>} color="bg-pink-300" defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            {(PRESETS || []).map(preset => (
              <button
                key={preset.name}
                onClick={() => store.loadPreset(preset)}
                className="relative group h-12"
              >
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-lg group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform" />
                <div className="absolute inset-0 bg-white border-[3px] border-black rounded-lg flex items-center justify-center p-1 group-active:translate-x-1 group-active:translate-y-1 transition-transform">
                    <span className="font-bold text-xs text-center leading-tight uppercase group-hover:text-pink-600">
                        {preset.name}
                    </span>
                </div>
              </button>
            ))}
          </div>
        </PopPanel>

        {/* Display - CYAN */}
        <PopPanel title="LOOK & FEEL" icon={<Eye size={18} className="text-cyan-600"/>} color="bg-cyan-300">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={store.display.autoRotate} onChange={e => store.setDisplay({ autoRotate: e.target.checked })} />
                        <span className="font-bold text-sm group-hover:text-cyan-600">Spin It!</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={store.display.showWireframe} onChange={e => store.setDisplay({ showWireframe: e.target.checked })} />
                        <span className="font-bold text-sm group-hover:text-cyan-600">Net Mode</span>
                    </label>
                </div>
                
                <div className="p-3 bg-cyan-50 border-2 border-cyan-200 rounded-lg border-dashed">
                    <SliderControl label="Shininess" value={store.display.shininess} min={0} max={200} step={1} onChange={v => store.setDisplay({ shininess: v })} />
                    <div className="h-2" />
                    <SliderControl label="Color Pop" value={store.display.globalSaturation} min={0} max={2} step={0.1} onChange={v => store.setDisplay({ globalSaturation: v })} />
                </div>
            </div>
        </PopPanel>

        {/* Parameters - LIME */}
        <PopPanel title="TWEAK IT!" icon={<Dna size={18} className="text-lime-700"/>} color="bg-lime-300" defaultOpen>
            <div className="space-y-4">
                {store.extraParams.map((param, idx) => {
                    if (!param) return null;
                    const isT = param.name === 't';
                    return (
                    <div key={idx} className="bg-lime-50 p-3 rounded-xl border-2 border-black relative">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                             <div className="bg-black text-lime-400 font-mono font-bold px-2 py-0.5 rounded text-sm uppercase">
                                {param.name}
                             </div>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => store.updateExtraParam(idx, { isAnimating: !param.isAnimating })}
                                    className={clsx(
                                        "p-1.5 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all", 
                                        param.isAnimating ? "bg-red-400 text-white" : "bg-green-400 text-black"
                                    )}
                                    title={param.isAnimating ? "Stop Animation" : "Play Animation"}
                                >
                                    {param.isAnimating ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                </button>
                                {!isT && (
                                    <button onClick={() => store.removeExtraParam(idx)} className="p-1.5 bg-gray-200 hover:bg-red-200 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 text-black">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                             </div>
                        </div>
                        <SliderControl 
                            label="" 
                            value={param.value} 
                            min={param.min} 
                            max={param.max} 
                            step={param.step} 
                            onChange={(v) => store.updateExtraParam(idx, { value: v })}
                        />
                    </div>
                )})}
                
                <button 
                    onClick={() => store.addExtraParam({ name: `p${store.extraParams.length}`, value: 0, min: 0, max: 1, step: 0.1 })}
                    className="w-full py-3 bg-white border-2 border-dashed border-black hover:bg-lime-100 rounded-xl font-bold text-black uppercase flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Add New Slider
                </button>
            </div>
        </PopPanel>

        {/* Analysis - PURPLE */}
        <PopPanel title="SURFACE ANALYSIS" icon={<Zap size={18} className="text-purple-700"/>} color="bg-purple-300">
            <div className="space-y-4">
                <p className="text-xs font-bold text-black/60">Differential Geometry (Phase 2)</p>
                <div className="grid grid-cols-1 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="analysis" checked={store.display.analysisMode === 'none'} onChange={() => store.setDisplay({ analysisMode: 'none' })} />
                        <span className="font-bold text-sm group-hover:text-purple-600">Standard Rendering</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="analysis" checked={store.display.analysisMode === 'gaussian'} onChange={() => store.setDisplay({ analysisMode: 'gaussian' })} />
                        <span className="font-bold text-sm group-hover:text-purple-600">Gaussian Curvature (K)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="analysis" checked={store.display.analysisMode === 'mean'} onChange={() => store.setDisplay({ analysisMode: 'mean' })} />
                        <span className="font-bold text-sm group-hover:text-purple-600">Mean Curvature (H)</span>
                    </label>
                </div>
                {store.display.analysisMode !== 'none' && store.analysisResults && (
                    <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg text-sm text-purple-900 font-mono">
                        <div className="flex justify-between font-bold border-b border-purple-200 pb-1 mb-1">
                            <span>SURFACE AREA:</span>
                            <span>{store.analysisResults.area.toFixed(2)} unit²</span>
                        </div>
                        <div className="flex justify-between border-b border-purple-200 pb-1 mb-1">
                            <span>VERTICES:</span>
                            <span>{(store.analysisResults.vertices / 1000).toFixed(1)}k</span>
                        </div>
                        <div className="flex justify-between">
                            <span>FACES:</span>
                            <span>{(store.analysisResults.faces / 1000).toFixed(1)}k</span>
                        </div>
                    </div>
                )}
                <button 
                  onClick={() => store.exportSTL()}
                  className="w-full mt-2 py-2 bg-black text-white hover:bg-gray-800 rounded-lg flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <FolderOpen size={16} /> DOWNLOAD STL
                </button>
            </div>
        </PopPanel>

        {/* Code - ORANGE */}
        <PopPanel title="SECRET LAB" icon={<Code size={18} className="text-orange-700"/>} color="bg-orange-300">
             <div className="space-y-3">
                <p className="text-xs font-bold text-black/60">Warning: Advanced Math Magic Inside!</p>
                <textarea 
                    value={store.surface.code}
                    onChange={(e) => store.setSurfaceCode(e.target.value)}
                    className="w-full h-48 bg-black text-green-400 font-mono text-xs p-3 rounded-lg border-2 border-orange-500 focus:outline-none focus:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    spellCheck={false}
                />
                <button 
                    onClick={() => store.compileSurface()}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:translate-x-1 active:shadow-none font-['Bangers'] text-xl tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                    <Zap size={20} fill="currentColor" />
                    RE-ENERGIZE!
                </button>
                {store.error && (
                    <div className="p-3 bg-red-100 border-2 border-red-500 text-red-600 rounded-lg text-xs font-bold">
                        OOPS! {store.error}
                    </div>
                )}
            </div>
        </PopPanel>

      </div>
    </div>
  );
};

export default Sidebar;