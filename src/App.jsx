import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { useScheduler } from './hooks/useScheduler'; 
import { useProactive } from './hooks/useProactive';
import { useVoiceInput } from './hooks/useVoiceInput';
import { useConnectivity } from './hooks/useConnectivity';
import { useSound } from './hooks/useSound'; // Feature 19
import DailyBriefing from './components/DailyBriefing';
import ProfilePanel from './components/ProfilePanel';
import SystemLogs from './components/SystemLogs';
import PriorityMatrix from './components/PriorityMatrix';
import FocusOverlay from './components/FocusOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Trash2, Activity, Disc, Brain, User, AlertTriangle, Terminal, Check, X, Wifi, WifiOff, MessageSquare, LayoutGrid, Crosshair, Star } from 'lucide-react';

function App() {
  const { 
      user, schedule, suggestions, addTask, removeTask, completeTask, // completeTask added
      acceptSuggestion, rejectSuggestion,
      status, setStatus, setAnalysisMode,
      personality, togglePersonality,
      enterFocusMode 
  } = useStore();
  
  const [input, setInput] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  // --- BACKGROUND SYSTEMS ---
  useScheduler(); 
  useProactive();
  const isOnline = useConnectivity();
  const { playHover, playClick, playSuccess, playError } = useSound(); // Feature 19 Sound

  // --- VOICE LOGIC ---
  const handleVoiceEnd = () => {};
  const { isListening, transcript, startListening, stopListening } = useVoiceInput(handleVoiceEnd);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleCommand = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    playClick(); // Sound
    setStatus("processing");
    
    const delay = personality === 'deep' ? 1200 : 600;

    setTimeout(() => {
      if (input.toLowerCase().includes("delete")) {
        const lastTask = schedule[schedule.length - 1];
        if (lastTask) removeTask(lastTask.id);
        playError(); // Sound
      } else {
        addTask(input);
        playSuccess(); // Sound
      }
      setStatus("idle");
      setInput("");
    }, delay);
  };

  // Helper wrapper for sounds
  const withSound = (action) => () => {
    playClick();
    action();
  };

  return (
    <div className="min-h-screen bg-jarvis-bg text-jarvis-text p-4 pb-32 max-w-lg mx-auto flex flex-col font-mono selection:bg-jarvis-cyan selection:text-black relative overflow-hidden">
      
      {/* --- OVERLAYS --- */}
      <FocusOverlay />
      <AnimatePresence>
        {isProfileOpen && <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isLogsOpen && <SystemLogs isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isMatrixOpen && <PriorityMatrix isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />}
      </AnimatePresence>
      <DailyBriefing />

      {/* --- HEADER --- */}
      <header className="flex justify-between items-center py-6 border-b border-gray-900 mb-8 sticky top-0 bg-jarvis-bg/90 backdrop-blur-sm z-10">
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${!isOnline ? 'bg-jarvis-red' : status === 'processing' ? 'bg-jarvis-red animate-ping' : 'bg-jarvis-cyan'}`}></div>
                <h1 className="text-xl font-bold tracking-[0.2em] text-jarvis-cyan">JARVIS.OS</h1>
            </div>
            {/* FEATURE 7: LEVEL INDICATOR */}
            <div className="flex items-center gap-2 mt-1 opacity-50 text-[10px]">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>LVL {user.level}</span>
                <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${user.xp % 100}%` }}></div>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button onMouseEnter={playHover} onClick={withSound(() => setIsMatrixOpen(true))} className="p-2 border border-gray-800 rounded-full hover:border-jarvis-cyan hover:text-jarvis-cyan transition-colors text-gray-500" title="Tactical Mode">
                <LayoutGrid className="w-4 h-4" />
            </button>

            <button onMouseEnter={playHover} onClick={withSound(togglePersonality)} className={`p-2 border rounded-full transition-colors ${personality === 'deep' ? 'border-jarvis-cyan text-jarvis-cyan bg-jarvis-cyan/10' : 'border-gray-800 text-gray-500 hover:text-white'}`}>
                <MessageSquare className="w-4 h-4" />
            </button>

            <button onMouseEnter={playHover} onClick={withSound(() => setIsLogsOpen(!isLogsOpen))} className={`p-2 border rounded-full transition-colors ${isLogsOpen ? 'border-jarvis-cyan text-jarvis-cyan bg-jarvis-cyan/10' : 'border-gray-800 text-gray-500 hover:text-white'}`}>
                <Terminal className="w-4 h-4" />
            </button>
            <button onMouseEnter={playHover} onClick={withSound(() => setIsProfileOpen(true))} className="p-2 border border-gray-800 rounded-full hover:border-gray-500 transition-colors text-gray-500 hover:text-white">
                <User className="w-4 h-4" />
            </button>
            
            <div className={`hidden md:flex items-center gap-2 text-xs border px-3 py-1 rounded-full transition-colors ${!isOnline ? 'border-jarvis-red text-jarvis-red bg-jarvis-red/10' : 'border-gray-800 text-gray-500'}`}>
                {!isOnline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
            </div>
        </div>
      </header>

      {/* --- VOICE ORB --- */}
      <div className="flex justify-center mb-8 relative">
        <div className={`relative w-24 h-24 rounded-full border border-gray-800 flex items-center justify-center transition-all duration-300 
            ${isListening ? 'shadow-[0_0_80px_rgba(0,243,255,0.6)] border-jarvis-cyan scale-110' : ''}
            ${status === 'processing' ? 'shadow-[0_0_50px_rgba(112,0,255,0.5)] border-purple-500' : ''}
        `}>
            {isListening ? <Mic className="w-10 h-10 text-white animate-pulse" /> : <Disc className={`w-12 h-12 text-gray-800 ${status === 'processing' ? 'animate-spin text-purple-500' : ''}`} />}
        </div>
        <div className="absolute -bottom-6 text-[10px] tracking-widest text-gray-600 font-mono uppercase">
            MODE: {personality}
        </div>
      </div>

      {/* --- TIMELINE --- */}
      <div className="flex-1 space-y-4">
        {schedule.length === 0 && suggestions.length === 0 && (
          <div className="text-center text-gray-600 mt-10 tracking-widest text-xs">NO ACTIVE PROTOCOLS</div>
        )}

        {/* GHOST TASKS */}
        <AnimatePresence>
            {suggestions.map((item) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-jarvis-bg border border-dashed border-jarvis-cyan/50 p-4 rounded-md flex justify-between items-center"
                >
                    <div>
                        <div className="text-[10px] text-jarvis-cyan mb-1 animate-pulse tracking-widest">
                            SUGGESTION // {item.time}
                        </div>
                        <div className="text-sm font-bold text-gray-400 italic">
                            {item.text}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={withSound(() => acceptSuggestion(item.id))} className="p-2 bg-jarvis-cyan/10 hover:bg-jarvis-cyan text-jarvis-cyan hover:text-black rounded transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={withSound(() => rejectSuggestion(item.id))} className="p-2 hover:bg-jarvis-red/20 text-gray-500 hover:text-jarvis-red rounded transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>

        {/* REAL TASKS */}
        <AnimatePresence>
          {schedule.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`group relative bg-jarvis-panel border-l-2 p-4 pr-12 transition-all 
                ${item.type === 'conflict' ? 'border-jarvis-red shadow-[0_0_15px_rgba(255,0,60,0.2)] bg-jarvis-red/5' : 'border-gray-700 hover:border-jarvis-cyan'}
              `}
            >
               <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                   {item.time || "PENDING"} // {item.type?.toUpperCase()}
                   {item.type === 'conflict' && <AlertTriangle className="w-3 h-3 text-jarvis-red animate-pulse"/>}
                   {item.isUrgent && <span className="text-[10px] bg-jarvis-red/20 text-jarvis-red px-1 rounded">URGENT</span>}
               </div>
               
               <div className={`text-sm font-bold ${item.type === 'conflict' ? 'text-jarvis-red' : 'text-gray-200'}`}>
                   {item.text}
               </div>
               
               {item.type === 'conflict' && (<div className="text-[10px] text-jarvis-red mt-1 font-mono uppercase tracking-wider">Warning: Schedule Overlap Detected</div>)}
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* QUICK COMPLETE */}
                <button 
                    onClick={() => { playSuccess(); completeTask(item.id); }} 
                    className="text-gray-600 hover:text-green-400 transition-colors" 
                    title="Complete & Earn XP"
                >
                    <Check className="w-4 h-4" />
                </button>
                <button onClick={withSound(() => enterFocusMode(item.id))} className="text-gray-600 hover:text-jarvis-cyan transition-colors" title="Focus Mode">
                    <Crosshair className="w-4 h-4" />
                </button>
                <button onClick={() => { playError(); removeTask(item.id); }} className="text-gray-600 hover:text-jarvis-red transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- INPUT --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-gray-900 p-4 z-30">
        <form onSubmit={handleCommand} className="max-w-lg mx-auto flex gap-3 items-center">
          <button type="button" onMouseDown={startListening} onMouseUp={stopListening} onTouchStart={startListening} onTouchEnd={stopListening} className={`p-3 rounded-full transition-all duration-200 ${isListening ? 'bg-jarvis-cyan text-black scale-110' : 'bg-gray-900 text-jarvis-cyan border border-gray-800'}`}>
            <Mic className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={isListening ? "Listening..." : "Awaiting command..."} className="w-full bg-transparent border-b border-gray-800 py-2 px-4 text-sm focus:outline-none focus:border-jarvis-cyan text-white placeholder-gray-700 font-mono" />
          </div>
          <button type="submit" className="p-2 text-gray-500 hover:text-jarvis-cyan transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
