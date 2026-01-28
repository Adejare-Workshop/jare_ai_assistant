import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseCommand } from '../utils/nlp'; // Import the new logic

export const useStore = create(
  persist(
    (set) => ({
      user: { name: "Commander" },
      schedule: [], 
      status: "idle", 

      // UPDATED: addTask now uses NLP to sort items
      addTask: (input) => set((state) => {
        // 1. Use the NLP parser to get time/date
        const data = parseCommand(input);
        
        // 2. Create the new item
        const newItem = { 
            id: Date.now(), 
            text: data.text, 
            type: data.type,
            time: data.time || "TBD", // "09:00 AM" or "TBD"
            dateObj: data.dateObj // Actual Date object for sorting
        };

        // 3. Add AND Sort the schedule by time
        const newSchedule = [...state.schedule, newItem].sort((a, b) => {
            // Put TBDs at the bottom
            if (!a.dateObj && !b.dateObj) return 0;
            if (!a.dateObj) return 1;
            if (!b.dateObj) return -1;
            // Sort by earliest date/time
            return new Date(a.dateObj) - new Date(b.dateObj);
        });

        return { schedule: newSchedule };
      }),

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
