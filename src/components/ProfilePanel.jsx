import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Activity, Save, Database } from 'lucide-react';

const ProfilePanel = ({ isOpen, onClose }) => {
  const { user, dailyAnswers, updateUser } = useStore((state) => ({
    user: state.user,
    dailyAnswers: state.dailyAnswers,
    updateUser: (data) => state.setState({ user: { ...state.user, ...data } }) // Helper to update user
  }));

  // Local state for the form
  const [formData, setFormData] = useState(user);

  // Filter only "Energy" related answers for the graph
  const energyData = dailyAnswers
    .filter(a => a.question.includes("energy"))
    .slice(-7); // Last 7 entries

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed inset-y-0 right-0 w-full md:w-96 bg-jarvis-panel border-l border-gray-800 shadow-2xl z-40 p-6 flex flex-col backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2 text-jarvis-cyan">
            <User className="w-5 h-5" />
            <span className="font-mono tracking-widest text-sm">IDENTITY_CORE</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
        </button>
      </div>

      {/* 1. DATA VISUALIZATION (Feature 12) */}
      <div className="mb-8">
        <h3 className="text-xs text-gray-500 font-mono mb-4 flex items-center gap-2">
            <Activity className="w-3 h-3" /> NEURAL METRICS (ENERGY)
        </h3>
        
        {/* CSS Bar Chart */}
        <div className="h-32 flex items-end justify-between gap-2 border-b border-gray-800 pb-2">
            {energyData.length === 0 && <div className="text-xs text-gray-700 w-full text-center">NO DATA LOGGED</div>}
            
            {energyData.map((entry, i) => {
                // Parse "8" or "8/10" to an integer
                const val = parseInt(entry.answer) || 0;
                const height = Math.min(val * 10, 100); // Cap at 100%
                
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            className={`w-full rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity ${val > 7 ? 'bg-jarvis-cyan' : val > 4 ? 'bg-yellow-500' : 'bg-jarvis-red'}`}
                        />
                    </div>
                );
            })}
        </div>
      </div>

      {/* 2. PERSONAL DATA FORM (Feature 4) */}
      <div className="flex-1 overflow-y-auto space-y-6">
        <div className="space-y-4">
             <h3 className="text-xs text-gray-500 font-mono flex items-center gap-2">
                <Database className="w-3 h-3" /> BIO-METRICS
            </h3>

            {/* Name Input */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">COMMANDER NAME</label>
                <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/50 border border-gray-700 p-2 text-sm text-white focus:border-jarvis-cyan focus:outline-none"
                />
            </div>

            {/* Sleep Goal */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">TARGET SLEEP (HRS)</label>
                <input 
                    type="number" 
                    value={formData.sleepGoal || ''}
                    onChange={(e) => setFormData({...formData, sleepGoal: e.target.value})}
                    className="w-full bg-black/50 border border-gray-700 p-2 text-sm text-white focus:border-jarvis-cyan focus:outline-none"
                />
            </div>
            
             {/* Focus Duration */}
             <div className="space-y-1">
                <label className="text-xs text-gray-400 font-mono">FOCUS BLOCK (MINS)</label>
                <input 
                    type="number" 
                    value={formData.focusBlock || 45}
                    onChange={(e) => setFormData({...formData, focusBlock: e.target.value})}
                    className="w-full bg-black/50 border border-gray-700 p-2 text-sm text-white focus:border-jarvis-cyan focus:outline-none"
                />
            </div>
        </div>
      </div>

      {/* Save Action */}
      <button 
        onClick={() => {
            // We need to access the store's setState directly or add an action. 
            // For now, let's assume we add an action in the next step.
            console.log("Saving...", formData);
            // Quick hack to force update:
            useStore.setState({ user: formData });
            onClose();
        }}
        className="mt-6 w-full py-3 bg-jarvis-cyan/10 border border-jarvis-cyan text-jarvis-cyan font-mono text-sm hover:bg-jarvis-cyan hover:text-black transition-all flex justify-center items-center gap-2"
      >
        <Save className="w-4 h-4" /> UPDATE SYSTEM
      </button>

    </motion.div>
  );
};

export default ProfilePanel;
