import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { X, Download, Upload, Trash, Power, Key } from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose }) => {
  const { hardReset, importData, apiKey, setApiKey } = useStore();
  const [localKey, setLocalKey] = useState(apiKey);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const data = useStore.getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JARVIS_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        importData(event.target.result);
        onClose();
    };
    reader.readAsText(file);
  };

  const saveKey = () => {
    setApiKey(localKey);
    alert("Neural Link Established (Key Saved)");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
    >
        <div className="bg-jarvis-panel border border-gray-800 w-full max-w-md p-6 rounded-lg shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
            
            <div className="flex items-center gap-3 mb-8 text-jarvis-cyan">
                <Power className="w-6 h-6" />
                <h2 className="text-xl font-mono tracking-widest">SYSTEM CORE</h2>
            </div>

            <div className="space-y-4">
                {/* API KEY INPUT */}
                <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
                    <div className="flex items-center gap-2 text-jarvis-cyan mb-2">
                        <Key className="w-4 h-4" />
                        <span className="text-sm font-bold">NEURAL LINK (GEMINI API)</span>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="password" 
                            value={localKey}
                            onChange={(e) => setLocalKey(e.target.value)}
                            placeholder="Paste Google Gemini Key Here"
                            className="flex-1 bg-black border border-gray-600 rounded p-2 text-xs text-white focus:border-jarvis-cyan outline-none"
                        />
                        <button onClick={saveKey} className="px-3 py-1 bg-gray-800 hover:bg-jarvis-cyan hover:text-black rounded text-xs transition-colors">
                            LINK
                        </button>
                    </div>
                </div>

                <button onClick={handleExport} className="w-full p-4 border border-gray-700 hover:border-jarvis-cyan hover:bg-jarvis-cyan/5 rounded flex items-center gap-4 transition-all group">
                    <div className="p-2 bg-gray-800 rounded group-hover:bg-jarvis-cyan group-hover:text-black transition-colors"><Download className="w-5 h-5" /></div>
                    <div className="text-left"><div className="text-sm font-bold text-gray-200">Export Neural Memory</div><div className="text-xs text-gray-500">Save tasks, XP, and settings</div></div>
                </button>

                <button onClick={() => fileInputRef.current.click()} className="w-full p-4 border border-gray-700 hover:border-green-400 hover:bg-green-400/5 rounded flex items-center gap-4 transition-all group">
                    <div className="p-2 bg-gray-800 rounded group-hover:bg-green-400 group-hover:text-black transition-colors"><Upload className="w-5 h-5" /></div>
                    <div className="text-left"><div className="text-sm font-bold text-gray-200">Import Data</div><div className="text-xs text-gray-500">Restore from backup</div></div>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                </button>

                <div className="h-px bg-gray-800 my-4" />

                <button onClick={() => { if(window.confirm("WARNING: This will wipe all data. Are you sure?")) hardReset(); }} className="w-full p-4 border border-red-900/50 hover:border-red-500 hover:bg-red-500/10 rounded flex items-center gap-4 transition-all group">
                    <div className="p-2 bg-red-900/20 rounded group-hover:bg-red-500 group-hover:text-black transition-colors text-red-500"><Trash className="w-5 h-5" /></div>
                    <div className="text-left"><div className="text-sm font-bold text-red-500">Factory Reset</div><div className="text-xs text-red-400/50">Wipe memory and reboot</div></div>
                </button>
            </div>
        </div>
    </motion.div>
  );
};

export default SettingsPanel;
