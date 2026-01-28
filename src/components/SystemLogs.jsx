import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Terminal, X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const SystemLogs = ({ isOpen, onClose }) => {
  const { logs } = useStore();
  const bottomRef = useRef(null);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 h-64 bg-black/90 border border-gray-800 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden z-40 flex flex-col font-mono"
    >
      {/* Header */}
      <div className="bg-gray-900/50 p-2 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-gray-400">
            <Terminal className="w-3 h-3" />
            <span>SYSTEM_LOGS // ROOT_ACCESS</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
        </button>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {logs.length === 0 && <div className="text-gray-600 italic">System initialization complete. Awaiting events...</div>}
        
        {logs.map((log) => (
            <div key={log.id} className="flex gap-2 items-start">
                <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                <div className={`flex items-center gap-1 ${
                    log.type === 'warning' ? 'text-jarvis-red' : 
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'error' ? 'text-orange-500' : 'text-gray-300'
                }`}>
                    {log.type === 'warning' && <AlertCircle className="w-3 h-3" />}
                    {log.type === 'success' && <CheckCircle className="w-3 h-3" />}
                    {log.type === 'info' && <Info className="w-3 h-3" />}
                    <span>{log.message}</span>
                </div>
            </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
};

export default SystemLogs;
