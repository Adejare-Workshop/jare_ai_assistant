import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { useVoiceInput } from './hooks/useVoiceInput';
import DailyBriefing from './components/DailyBriefing';
import ProfilePanel from './components/ProfilePanel'; // FEATURE 4 IMPORT
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Trash2, Activity, Disc, Brain, User } from 'lucide-react'; // Added User icon

function App() {
  const { schedule, addTask, removeTask, status, setStatus, setAnalysisMode } = useStore();
  const [input, setInput] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false); // FEATURE 4 STATE

  // --- VOICE LOGIC START ---
  const handleVoiceEnd = () => {
    // Optional: Auto-send logic can go here
  };

  const { isListening, transcript, startListening, stopListening } = useVoiceInput(handleVoiceEnd);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);
  // --- VOICE LOGIC END ---

  const handleCommand = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    setStatus("processing");
    
    setTimeout(() => {
      if (input.toLowerCase().includes("delete")) {
        const lastTask = schedule[schedule.length - 1];
        if (lastTask) removeTask(lastTask.id);
      } else {
        addTask(input);
      }
      setStatus("idle");
      setInput("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-jarvis-bg text-jarvis-text p-4 pb-32 max-w-lg mx-auto flex flex-col font-mono selection:bg-jarvis-cyan selection:text-black relative overflow-hidden">
      
      {/* FEATURE 4: PROFILE PANEL */}
      <AnimatePresence>
        {isProfileOpen && <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
      </AnimatePresence>

      {/* FEATURE 3: DAILY BRIEFING OVERLAY */}
      <DailyBriefing />

      {/* HEADER */}
      <header className="flex justify-between items-center py-6 border-b border-gray-900 mb-8 sticky top-0 bg-jarvis-bg/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'processing' ? 'bg-jarvis-red animate-ping' : 'bg-jarvis-cyan'}`}></div>
            <h1 className="text-xl font-bold tracking-[0.2em] text-jarvis-cyan">JARVIS.OS</h1>
        </div>
        
        <div className="flex items-center gap-3">
            {/* PROFILE BUTTON */}
            <button 
                onClick={() => setIsProfileOpen(true)}
                className="p-2 border border-gray-800 rounded-full hover:border-gray-500 transition-colors text-gray-500 hover:text-white"
                title="Identity Core"
            >
                <User className="w-4 h-4" />
            </button>

            {/* DAILY BRIEFING BUTTON */}
            <button 
                onClick={() => setAnalysisMode(true)}
                className="p-2 border border-gray-800 rounded-full hover:border-jarvis-cyan hover:bg-jarvis-cyan/10 transition-colors text-gray-500 hover:text-jarvis-cyan"
                title="Start Daily Analysis"
            >
                <Brain className="w-4 h-4" />
            </button>

            {/* STATUS INDICATOR */}
            <div className="flex items-center gap-2 text-xs text-gray-500 border border-gray-800 px-3 py-1 rounded-full">
                <Activity className={`w-3 h-3 ${status === 'processing' ? 'animate-spin text-jarvis-cyan' : ''}`} />
                <span>{status.toUpperCase()}</span>
            </div>
        </div>
      </header>

      {/* ORB (Visual Feedback) */}
      <div className="flex justify-center mb-8 relative">
        <div className={`relative w-24 h-24 rounded-full border border-gray-800 flex items-center justify-center transition-all duration-300 
            ${isListening ? 'shadow-[0_0_80px_rgba(0,243,255,0.6)] border-jarvis-cyan scale-110' : ''}
            ${status === 'processing' ? 'shadow-[0_0_50px_rgba(112,0,255,0.5)] border-purple-500' : ''}
        `}>
            {isListening ? (
                <Mic className="w-10 h-10 text-white animate-pulse" />
            ) : (
                <Disc className={`w-12 h-12 text-gray-800 ${status === 'processing' ? 'animate-spin text-purple-500' : ''}`} />
            )}
        </div>
      </div>

      {/* TIMELINE */}
      <div className="flex-1 space-y-4">
        {schedule.length === 0 && (
          <div className="text-center text-gray-600 mt-10 tracking-widest text-xs">NO ACTIVE PROTOCOLS</div>
        )}

        <AnimatePresence>
          {schedule.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="group relative bg-jarvis-panel border-l-2 border-gray-700 hover:border-jarvis-cyan p-4 pr-12 transition-all"
            >
               <div className="text-xs text-gray-500 mb-1">{item.time || "PENDING"} // {item.type?.toUpperCase()}</div>
               <div className="text-sm font-bold text-gray-200">{item.text}</div>
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => removeTask(item.id)} className="text-gray-600 hover:text-jarvis-red transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* INPUT CONSOLE */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-gray-900 p-4 z-30">
        <form onSubmit={handleCommand} className="max-w-lg mx-auto flex gap-3 items-center">
          
          <button 
            type="button" 
            onMouseDown={startListening} 
            onMouseUp={stopListening}
            onTouchStart={startListening} 
            onTouchEnd={stopListening}    
            className={`p-3 rounded-full transition-all duration-200 ${
                isListening ? 'bg-jarvis-cyan text-black scale-110' : 'bg-gray-900 text-jarvis-cyan border border-gray-800'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Awaiting command..."}
              className="w-full bg-transparent border-b border-gray-800 py-2 px-4 text-sm focus:outline-none focus:border-jarvis-cyan text-white placeholder-gray-700 font-mono"
            />
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
