import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic2, Square, Keyboard, Settings, AudioWaveform as Waveform, Activity, Layers, Sliders, Info, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import { useSiteSettings } from '../lib/useSiteSettings';

export default function AudioLab() {
  const { settings } = useSiteSettings();
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'controls' | 'about'>('visualizer');
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const freqCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // States for Controls
  const [filterFreq, setFilterFreq] = useState(2000);
  const [filterQ, setFilterQ] = useState(1);
  const [gain, setGain] = useState(1);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      filterRef.current = audioContextRef.current.createBiquadFilter();
      
      // Configure Analyser
      analyserRef.current.fftSize = 256;
      
      // Configure Filter
      filterRef.current.type = 'lowpass';
      filterRef.current.frequency.value = filterFreq;
      filterRef.current.Q.value = filterQ;
      
      // Chain: Source -> Filter -> Analyser -> Destination (optional, we'll keep it off to avoid feedback)
      // Note: We don't connect to destination to avoid loops, only for visualization here.
      // If user wants to hear themselves, they'd need headphones.
      sourceRef.current.connect(filterRef.current);
      filterRef.current.connect(analyserRef.current);
      
      setIsActive(true);
      setError(null);
      draw();
    } catch (err) {
      console.error("Audio Start Error:", err);
      setError("Permissão para microfone negada ou erro técnico.");
    }
  };

  const stopAudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    setIsActive(false);
  };

  useEffect(() => {
    if (filterRef.current && isActive) {
      filterRef.current.frequency.setTargetAtTime(filterFreq, audioContextRef.current!.currentTime, 0.1);
      filterRef.current.Q.setTargetAtTime(filterQ, audioContextRef.current!.currentTime, 0.1);
    }
  }, [filterFreq, filterQ, isActive]);

  const draw = () => {
    if (!analyserRef.current || !canvasRef.current || !freqCanvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const freqCanvas = freqCanvasRef.current;
    const freqCtx = freqCanvas.getContext('2d')!;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyserRef.current!.getByteFrequencyData(dataArray);
      analyserRef.current!.getByteTimeDomainData(timeDataArray);

      // Draw Waveform (Oscilloscope)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = timeDataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      // Draw Frequency Spectrum
      freqCtx.clearRect(0, 0, freqCanvas.width, freqCanvas.height);
      const barWidth = (freqCanvas.width / bufferLength) * 2.5;
      let barX = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * freqCanvas.height;
        const r = 50 + (i * (255 / bufferLength));
        const g = 100;
        const b = 255 - (i * (255 / bufferLength));
        freqCtx.fillStyle = `rgb(${r},${g},${b})`;
        freqCtx.fillRect(barX, freqCanvas.height - barHeight, barWidth, barHeight);
        barX += barWidth + 1;
      }
    };

    renderFrame();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-blue-500 selection:text-white">
      <SEO 
        title={`Audio Engineering Lab | ${settings.agency_name || 'Diffuse'}`}
        description="Processamento de sinal em tempo real e visualização técnica de áudio."
      />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-[1600px] mx-auto h-screen flex flex-col p-4 md:p-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-blue-500 font-bold">Lab Module 01 // Signals</span>
            </div>
            <h1 className="text-5xl font-display font-light italic tracking-tighter">Audio Engineering Lab</h1>
          </div>

          <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('visualizer')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${activeTab === 'visualizer' ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              <Activity size={14} /> Scope
            </button>
            <button 
              onClick={() => setActiveTab('controls')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${activeTab === 'controls' ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              <Sliders size={14} /> DSP Controls
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${activeTab === 'about' ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              <Info size={14} /> Abstract
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 grid lg:grid-cols-12 gap-8 min-h-0">
          
          {/* Visualizers / Main Stage */}
          <div className="lg:col-span-8 flex flex-col gap-8 h-full">
            <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-[40px] p-8 flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <Waveform className="text-blue-500" size={18} />
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 italic">Oscilloscope // Time Domain</span>
                 </div>
                 {isActive && (
                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Live Signal</span>
                    </div>
                 )}
              </div>
              
              <div className="flex-1 relative">
                {!isActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Mic2 size={40} className="text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-light italic mb-4">Initialize Engine</h2>
                    <p className="text-white/30 text-xs text-center max-w-xs mb-8 uppercase tracking-widest leading-loose">
                        Authorize microphone access to begin real-time signal analysis and DSP processing.
                    </p>
                    <button 
                      onClick={startAudio}
                      className="px-12 py-5 bg-white text-black rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-blue-500 hover:text-white transition-all shadow-2xl shadow-white/5"
                    >
                      Start Processing
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} className="w-full h-full opacity-80" width={1000} height={500} />
              </div>

               {/* Noise/Grain Layer */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            </div>

            <div className="h-48 bg-white/[0.02] border border-white/10 rounded-[40px] p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                 <Layers className="text-purple-500" size={18} />
                 <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 italic">Spectrum // Frequency Domain</span>
              </div>
              <div className="flex-1">
                <canvas ref={freqCanvasRef} className="w-full h-full opacity-60" width={1000} height={200} />
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 flex flex-col gap-8 h-full">
             <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-[40px] p-8 overflow-y-auto scrollbar-hide">
                <AnimatePresence mode="wait">
                  {activeTab === 'visualizer' && (
                    <motion.div
                      key="v"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Metadata</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[8px] text-white/40 uppercase mb-1">Sample Rate</p>
                              <p className="text-xl font-mono">48.0k</p>
                           </div>
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[8px] text-white/40 uppercase mb-1">FFT Size</p>
                              <p className="text-xl font-mono">256</p>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Signal Stats</h4>
                        <div className="p-6 bg-white/[0.03] rounded-[32px] border border-white/5 space-y-4">
                           <div className="flex justify-between items-end border-b border-white/5 pb-4">
                              <span className="text-[10px] uppercase text-white/40">Latency</span>
                              <span className="font-mono text-green-500">&lt; 12ms</span>
                           </div>
                           <div className="flex justify-between items-end border-b border-white/5 pb-4">
                              <span className="text-[10px] uppercase text-white/40">Bit Depth</span>
                              <span className="font-mono">32-bit</span>
                           </div>
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] uppercase text-white/40">Mode</span>
                              <span className="font-mono">Mono Source</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="pt-8 block">
                         <div className="p-6 bg-blue-900/20 border border-blue-500/20 rounded-[32px] flex items-center gap-4">
                            <Zap className="text-blue-500 shrink-0" size={20} />
                            <p className="text-[10px] leading-relaxed text-blue-200 uppercase tracking-wider font-bold">
                                Engineered for high-performance audio interfaces and precision telemetry.
                            </p>
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'controls' && (
                    <motion.div
                      key="c"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-12"
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter Cutoff</label>
                            <span className="font-mono text-xs text-blue-500">{filterFreq}Hz</span>
                        </div>
                        <input 
                          type="range" 
                          min="20" 
                          max="15000" 
                          step="1"
                          value={filterFreq}
                          onChange={(e) => setFilterFreq(parseInt(e.target.value))}
                          className="w-full accent-blue-500 opacity-80"
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resonance (Q)</label>
                            <span className="font-mono text-xs text-purple-500">{filterQ.toFixed(1)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          step="0.1"
                          value={filterQ}
                          onChange={(e) => setFilterQ(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 opacity-80"
                        />
                      </div>

                      <div className="pt-12 border-t border-white/5">
                         <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-white/40">Biquad Type</span>
                            <span className="bg-blue-500 text-white text-[8px] font-bold px-2 py-1 rounded uppercase tracking-tighter">Low Pass</span>
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'about' && (
                    <motion.div
                      key="a"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <h3 className="text-3xl font-display font-light italic leading-tight">Architecture of Sound.</h3>
                      <p className="text-sm font-light text-white/40 leading-relaxed uppercase tracking-widest">
                        This module serves as a demonstration of technical expertise in low-latency digital signal processing (DSP).
                      </p>
                      <p className="text-sm font-light text-white/40 leading-relaxed uppercase tracking-widest">
                        By utilizing the Web Audio API, we can achieve real-time telemetry and manipulation of incoming audio streams with minimal cognitive and browser load.
                      </p>
                      <div className="pt-8">
                         <div className="w-12 h-1 bg-blue-500 mb-8" />
                         <span className="text-[10px] font-mono text-white/20 italic">DIFFUSE ENGINEERING V1.0.4</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {isActive && (
               <motion.button 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 onClick={stopAudio}
                 className="w-full py-6 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[40px] font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
               >
                 <Square size={14} fill="currentColor" /> Terminate Session
               </motion.button>
             )}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-[10px] uppercase tracking-[0.4em] font-mono">
            <span>Diffuse Lab // Digital Signal Division</span>
            <div className="flex gap-8">
                <span>Buffer: 1024</span>
                <span>DSP Alpha: Stable</span>
            </div>
        </div>
      </div>
    </div>
  );
}
