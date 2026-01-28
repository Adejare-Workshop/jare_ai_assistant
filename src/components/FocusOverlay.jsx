import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Target } from 'lucide-react';

const FocusOverlay = () => {
  const { isFocusMode, activeTaskId, schedule, exitFocusMode } = useStore();
  const [elapsed, setElapsed] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (isFocusMode) {
        interval = setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);
    } else {
        setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isFocusMode]);

  if (!isFocusMode) return null;

  const task = schedule.find(t => t.id === activeTaskId);
  if (!task) return null; // Should ideally exit mode if task missing

  // Format time MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Pulse Animation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-jarvis-cyan/5 rounded-full animate-pulse blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-12 max-w-2xl w-full">
        
        <div className="flex flex-col items-center gap-4">
            <Target className="w-12 h-12 text-jarvis-cyan animate-spin-slow" />
            <div className="text-jarvis-cyan font-mono tracking-[0.3em] text-sm uppercase">
                Focus Protocol Active
            </div>
        </div>

        {/* The Task */}
        <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl md:text-5xl font-bold text-white leading-tight"
        >
            {task.text}
        </motion.h1>

        {/* The Timer */}
        <div className="font-mono text-6xl text-gray-500 font-thin flex justify-center items-center gap-4">
            <Clock className="w-8 h-8 opacity-50" />
            {formatTime(elapsed)}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-8 pt-10">
            <button 
                onClick={() => exitFocusMode(true)} // Complete
                className="group flex flex-col items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
            >
                <div className="p-4 rounded-full border border-gray-700 group-hover:border-green-400 group-hover:bg-green-400/10 transition-all">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <span className="text-xs tracking-widest uppercase">Complete</span>
            </button>

            <button 
                onClick={() => exitFocusMode(false)} // Abort
                className="group flex flex-col items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
            >
                <div className="p-4 rounded-full border border-gray-700 group-hover:border-red-400 group-hover:bg-red-400/10 transition-all">
                    <XCircle className="w-8 h-8" />
                </div>
                <span className="text-xs tracking-widest uppercase">Abort</span>
            </button>
        </div>

      </div>
    </motion.div>
  );
};

export default FocusOverlay;
