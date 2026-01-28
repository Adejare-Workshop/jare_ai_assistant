import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseCommand } from '../utils/nlp';

export const useStore = create(
  persist(
    (set, get) => ({
      // --- CORE IDENTITY ---
      user: { 
        name: "Commander",
        sleepGoal: 8,
        focusBlock: 45
      },
      
      // --- OPERATIONAL DATA ---
      schedule: [],
      status: "idle", // 'idle', 'listening', 'processing'
      
      // --- ANALYSIS MODE STATE (Feature 3) ---
      isAnalysisMode: false,
      currentQuestionIndex: 0,
      dailyAnswers: [],
      questions: [
        "What is the single most critical objective for today?",
        "On a scale of 1-10, what is your current energy level?",
        "Are there any lingering conflicts from yesterday?",
        "Who do you need to contact to unblock your progress?",
        "What habit do you want to strictly enforce today?"
      ],

      // --- ACTIONS ---

      setStatus: (status) => set({ status }),

      // Feature 4: Update Profile Data
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),

      // Feature 3: Analysis Logic
      setAnalysisMode: (active) => set({ isAnalysisMode: active }),
      
      submitAnswer: (answer) => set((state) => {
        // Save the answer
        const newAnswers = [...state.dailyAnswers, { 
            question: state.questions[state.currentQuestionIndex], 
            answer, 
            timestamp: new Date().toISOString() 
        }];
        
        // Move to next question
        const nextIndex = state.currentQuestionIndex + 1;
        const isFinished = nextIndex >= state.questions.length;

        // If finished, close mode and add a review task
        let newSchedule = state.schedule;
        if (isFinished) {
            const reviewTask = {
                id: Date.now(),
                text: "Review Daily Analysis Data",
                type: "system",
                time: "NOW",
                dateObj: new Date(),
                notified: false
            };
            newSchedule = [...state.schedule, reviewTask]; 
            // We re-sort schedule just in case
            newSchedule.sort((a, b) => {
                 if (!a.dateObj) return 1;
                 if (!b.dateObj) return -1;
                 return new Date(a.dateObj) - new Date(b.dateObj);
            });
        }

        return {
            dailyAnswers: newAnswers,
            currentQuestionIndex: isFinished ? 0 : nextIndex,
            isAnalysisMode: !isFinished,
            schedule: newSchedule
        };
      }),

      // Feature 17: Notification Tracker
      markAsNotified: (id) => set((state) => ({
        schedule: state.schedule.map(t => 
            t.id === id ? { ...t, notified: true } : t
        )
      })),

      // Feature 1 & 14: Add Task + Conflict Detection
      addTask: (input) => set((state) => {
        // 1. Parse the input (NLP)
        const data = parseCommand(input);
        
        // 2. Conflict Detection Logic (Feature 14)
        let conflictWarning = false;
        
        if (data.dateObj) {
            const newTime = new Date(data.dateObj).getTime();
            
            // Check against existing tasks (look for overlap within 30 mins)
            conflictWarning = state.schedule.some(t => {
                if (!t.dateObj) return false;
                const existingTime = new Date(t.dateObj).getTime();
                const diff = Math.abs(newTime - existingTime);
                return diff < 30 * 60000; // 30 minutes in milliseconds
            });
            
            if (conflictWarning) {
                // Audio Warning
                if ('speechSynthesis' in window) {
                   const utterance = new SpeechSynthesisUtterance("Warning. Schedule conflict detected.");
                   window.speechSynthesis.speak(utterance);
                }
            }
        }

        // 3. Construct the new item
        const newItem = { 
            id: Date.now(), 
            text: data.text, 
            type: conflictWarning ? "conflict" : (data.type || "task"), // Mark as conflict if needed
            time: data.time || "TBD",
            dateObj: data.dateObj,
            notified: false 
        };

        // 4. Add & Sort the Schedule
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

    }),
    {
      name: 'jarvis-storage', // Saves to LocalStorage
    }
  )
);
