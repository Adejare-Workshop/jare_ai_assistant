import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { X, Activity, CheckCircle, Zap, Trophy, Clock } from 'lucide-react';

const AnalyticsPanel = ({ isOpen, onClose }) => {
  const { history, user, focusStats } = useStore();

  if (!isOpen) return null;

  // 1. Calculate Weekly Stats
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i)); // Go back 6 days
    return {
        label: days[d.getDay()],
        date: d.toLocaleDateString(),
        count: history.filter(h => new Date(h.completedAt).toLocaleDateString() === d.toLocaleDateString()).length
    };
  });

  const maxCount = Math.max(...last7Days.map(d => d.count), 1); // Avoid div by zero

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <div className="bg-jarvis-panel border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl relative flex flex-col md:flex-row">
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10"><X /></button>

        {/* LEFT: METRICS */}
        <div className="p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-3 text-jarvis-cyan mb-8">
                <Activity className="w-6 h-6" />
                <h2 className="text-xl font-mono tracking-widest">PERFORMANCE</h2>
            </div>

            <div className="space-y-6">
                <div className="bg-black/40 p-4 rounded border border-gray-800">
                    <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Neural Level</div>
                    <div className="text-3xl font-bold text-white flex items-center gap-2">
                        {user.level} <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">Total XP: {user.xp}</div>
                </div>

                <div className="bg-black/40 p-4 rounded border border-gray-800">
                    <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Focus Depth</div>
                    <div className="text-3xl font-bold text-white flex items-center gap-2">
                        {focusStats.totalMinutes} <span className="text-sm font-normal text-gray-500">mins</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">{focusStats.sessions} Deep Work Sessions</div>
                </div>

                <div className="bg-black/40 p-4 rounded border border-gray-800">
                    <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Task Velocity</div>
                    <div className="text-3xl font-bold text-white flex items-center gap-2">
                        {history.length} <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">Total Archives</div>
                </div>
            </div>
        </div>

        {/* RIGHT: CHARTS & LOGS */}
        <div className="p-8 md:w-2/3">
            
            {/* CHART */}
            <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-widest">OUTPUT VELOCITY (7 DAYS)</h3>
            <div className="h-40 flex items-end justify-between gap-2 mb-8">
                {last7Days.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                            className="w-full bg-jarvis-cyan/20 border-t-2 border-jarvis-cyan transition-all duration-500 group-hover:bg-jarvis-cyan/40"
                            style={{ height: `${(day.count / maxCount) * 100}%` }}
                        ></div>
                        <div className="text-[10px] text-gray-600 font-mono">{day.label}</div>
                    </div>
                ))}
            </div>

            {/* HISTORY LIST */}
            <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> ARCHIVE LOG
            </h3>
            <div className="space-y-2 h-64 overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 && <div className="text-gray-700 italic text-sm">No data recorded.</div>}
                
                {history.map((h) => (
                    <div key={h.id} className="flex justify-between items-center p-3 bg-gray-900/30 border-l-2 border-gray-700 hover:border-jarvis-cyan transition-colors text-sm">
                        <div>
                            <div className="text-gray-300">{h.text}</div>
                            <div className="text-[10px] text-gray-600">{new Date(h.completedAt).toLocaleString()}</div>
                        </div>
                        <div className="text-xs font-mono text-jarvis-cyan">+{h.xpEarned} XP</div>
                    </div>
                ))}
            </div>

        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsPanel;
