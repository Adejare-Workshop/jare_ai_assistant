import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, BrainCircuit } from 'lucide-react';

const DailyBriefing = () => {
  const { isAnalysisMode, setAnalysisMode, questions, currentQuestionIndex, submitAnswer } = useStore();
  const [input, setInput] = useState("");

  if (!isAnalysisMode) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    submitAnswer(input);
    setInput("");
  };

  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl"
      >
        {/* Close Button */}
        <button 
            onClick={() => setAnalysisMode(false)} 
            className="absolute top-6 right-6 text-gray-500 hover:text-white"
        >
            <X className="w-8 h-8" />
        </button>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl h-1 bg-gray-800 mb-12 relative rounded-full overflow-hidden">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-jarvis-cyan shadow-[0_0_20px_#00f3ff]" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
            />
        </div>

        {/* Main Interface */}
        <div className="max-w-2xl w-full space-y-8">
            <div className="flex items-center gap-3 text-jarvis-cyan mb-4 opacity-80">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
                <span className="font-mono tracking-widest text-sm">NEURAL ALIGNMENT PROTOCOL</span>
            </div>

            <motion.h2 
                key={currentQuestionIndex} // Triggers animation on change
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl md:text-4xl font-bold text-white leading-relaxed"
            >
                {questions[currentQuestionIndex]}
            </motion.h2>

            <form onSubmit={handleSubmit} className="relative mt-8">
                <input 
                    autoFocus
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full bg-transparent border-b-2 border-gray-700 text-xl py-4 focus:outline-none focus:border-jarvis-cyan transition-colors text-jarvis-text font-mono"
                />
                <button 
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-jarvis-cyan hover:scale-110 transition-transform"
                >
                    <ArrowRight className="w-8 h-8" />
                </button>
            </form>

            <div className="text-gray-500 font-mono text-xs mt-4">
                QUESTION {currentQuestionIndex + 1} / {questions.length}
            </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyBriefing;
