import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { X, AlertOctagon, Calendar, Users, Trash } from 'lucide-react';

const Quadrant = ({ title, tasks, color, icon: Icon, onRemove }) => (
  <div className={`flex flex-col h-full bg-jarvis-panel border border-gray-800 rounded-lg overflow-hidden ${tasks.length > 0 ? 'border-opacity-100' : 'border-opacity-30'}`}>
    <div className={`p-2 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 border-b border-gray-800 ${color}`}>
        <Icon className="w-4 h-4" /> {title}
    </div>
    <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {tasks.map(task => (
            <motion.div 
                layoutId={task.id}
                key={task.id} 
                className="bg-black/40 p-2 rounded text-sm border-l-2 border-gray-700 flex justify-between group"
            >
                <span className="truncate">{task.text}</span>
                <button onClick={() => onRemove(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-jarvis-red">
                    <X className="w-3 h-3" />
                </button>
            </motion.div>
        ))}
        {tasks.length === 0 && <div className="text-gray-700 text-xs italic p-2 text-center">Empty Sector</div>}
    </div>
  </div>
);

const PriorityMatrix = ({ isOpen, onClose }) => {
  const { schedule, removeTask } = useStore();

  if (!isOpen) return null;

  // Filter tasks into quadrants
  const doFirst = schedule.filter(t => t.isUrgent && t.isImportant);
  const scheduleIt = schedule.filter(t => !t.isUrgent && t.isImportant);
  const delegate = schedule.filter(t => t.isUrgent && !t.isImportant);
  const eliminate = schedule.filter(t => !t.isUrgent && !t.isImportant);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl p-4 md:p-10 flex flex-col"
    >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-mono text-jarvis-cyan tracking-widest">TACTICAL OVERVIEW // EISENHOWER_MATRIX</h2>
            <button onClick={onClose} className="p-2 border border-gray-700 rounded hover:bg-white/10"><X /></button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4">
            <Quadrant title="DO FIRST (Critical)" tasks={doFirst} color="text-jarvis-red" icon={AlertOctagon} onRemove={removeTask} />
            <Quadrant title="SCHEDULE (Strategic)" tasks={scheduleIt} color="text-jarvis-cyan" icon={Calendar} onRemove={removeTask} />
            <Quadrant title="DELEGATE (Interruptions)" tasks={delegate} color="text-orange-400" icon={Users} onRemove={removeTask} />
            <Quadrant title="ELIMINATE (Distractions)" tasks={eliminate} color="text-gray-500" icon={Trash} onRemove={removeTask} />
        </div>
    </motion.div>
  );
};

export default PriorityMatrix;
