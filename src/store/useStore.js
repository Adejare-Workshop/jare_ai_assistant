import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // DATA
      user: { name: "Commander" },
      schedule: [
        { id: 1, text: "System Initialization", type: "system", time: "08:00" },
        { id: 2, text: "Review Objectives", type: "work", time: "09:00" }
      ], 
      
      // STATE
      status: "idle", // 'idle', 'listening', 'processing'

      // ACTIONS
      addTask: (task) => set((state) => ({ 
        schedule: [...state.schedule, { 
            id: Date.now(), 
            text: task, 
            type: "manual",
            time: "TBD" 
        }] 
      })),

      removeTask: (id) => set((state) => ({
        schedule: state.schedule.filter(t => t.id !== id)
      })),

      setStatus: (status) => set({ status })
    }),
    {
      name: 'jarvis-storage', 
    }
  )
);
