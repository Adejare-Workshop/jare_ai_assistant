import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseCommand } from '../utils/nlp';

export const useStore = create(
  persist(
    (set, get) => ({
      // --- IDENTITY CORE ---
      user: { 
        name: "Commander",
        sleepGoal: 8,
        focusBlock: 45
      },
      
      // --- OPERATIONAL DATA ---
      schedule: [],
      suggestions: [], // Ghost Tasks
      status: "idle", 
      logs: [], // System Terminal Data
      
      // --- PERSONALITY CORE (Feature 20) ---
      personality: 'brief', // 'brief' or 'deep'

      // --- ANALYSIS MODE STATE ---
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

      // Toggle Personality
      togglePersonality: () => set((state) => {
        const newMode = state.personality === 'brief' ? 'deep' : 'brief';
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: `Voice synthesis switched to ${newMode.toUpperCase()} mode.`,
            type: 'info'
        };
        return { 
            personality: newMode,
            logs: [newLog, ...state.logs].slice(0, 50)
        };
      }),

      updateUser: (userData) => set((state) => {
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: `User profile updated`,
            type: 'success'
        };
        return { 
            user: { ...state.user, ...userData },
            logs: [newLog, ...state.logs].slice(0, 50)
        };
      }),

      setAnalysisMode: (active) => set({ isAnalysisMode: active }),
      
      submitAnswer: (answer) => set((state) => {
        const newAnswers = [...state.dailyAnswers, { 
            question: state.questions[state.currentQuestionIndex], 
            answer, 
            timestamp: new Date().toISOString() 
        }];
        
        const nextIndex = state.currentQuestionIndex + 1;
        const isFinished = nextIndex >= state.questions.length;

        let newSchedule = state.schedule;
        let logMsg = null;

        if (isFinished) {
            const reviewTask = {
                id: Date.now(),
                text: "Review Daily Analysis Data",
                type: "system",
                time: "NOW",
                dateObj: new Date(),
                notified: false
            };
            newSchedule = [...state.schedule, reviewTask].sort((a, b) => {
                 if (!a.dateObj && !b.dateObj) return 0;
                 if (!a.dateObj) return 1;
                 if (!b.dateObj) return -1;
                 return new Date(a.dateObj) - new Date(b.dateObj);
            });
            logMsg = "Daily Neural Alignment complete.";
        }

        const newLog = logMsg ? {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: logMsg,
            type: 'success'
        } : null;

        return {
            dailyAnswers: newAnswers,
            currentQuestionIndex: isFinished ? 0 : nextIndex,
            isAnalysisMode: !isFinished,
            schedule: newSchedule,
            logs: newLog ? [newLog, ...state.logs].slice(0, 50) : state.logs
        };
      }),

      markAsNotified: (id) => set((state) => ({
        schedule: state.schedule.map(t => 
            t.id === id ? { ...t, notified: true } : t
        )
      })),

      // --- SUGGESTION LOGIC (Feature 10) ---
      addSuggestion: (text, time) => set((state) => {
        const exists = state.schedule.find(t => t.text === text) || 
                       state.suggestions.find(s => s.text === text);
        if (exists) return {};

        const newSuggestion = {
            id: Date.now(),
            text,
            time,
            type: 'suggestion',
            dateObj: new Date()
        };
        return { suggestions: [...state.suggestions, newSuggestion] };
      }),

      acceptSuggestion: (id) => set((state) => {
        const suggestion = state.suggestions.find(s => s.id === id);
        if (!suggestion) return {};

        const newTask = { 
            ...suggestion, 
            id: Date.now(), 
            type: 'task',
            notified: false 
        };

        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: `Suggestion accepted: ${suggestion.text}`,
            type: 'success'
        };

        return {
            schedule: [...state.schedule, newTask].sort((a, b) => new Date(a.dateObj) - new Date(b.dateObj)),
            suggestions: state.suggestions.filter(s => s.id !== id),
            logs: [newLog, ...state.logs].slice(0, 50)
        };
      }),

      rejectSuggestion: (id) => set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== id)
      })),

      // --- MAIN TASK LOGIC ---
      addTask: (input) => set((state) => {
        const data = parseCommand(input);
        
        let conflictWarning = false;
        if (data.dateObj) {
            const newTime = new Date(data.dateObj).getTime();
            conflictWarning = state.schedule.some(t => {
                if (!t.dateObj) return false;
                const diff = Math.abs(newTime - new Date(t.dateObj).getTime());
                return diff < 30 * 60000;
            });
            
            if (conflictWarning && 'speechSynthesis' in window) {
                   const utterance = new SpeechSynthesisUtterance("Warning. Schedule conflict detected.");
                   window.speechSynthesis.speak(utterance);
            }
        }

        const newItem = { 
            id: Date.now(), 
            text: data.text, 
            type: conflictWarning ? "conflict" : (data.type || "task"), 
            time: data.time || "TBD",
            dateObj: data.dateObj,
            notified: false 
        };

        const newLog = {
            id: Date.now() + 1,
            timestamp: new Date().toLocaleTimeString(),
            message: conflictWarning 
                ? `CONFLICT: ${data.text} overlaps existing protocol.`
                : `Protocol created: ${data.text}`,
            type: conflictWarning ? 'warning' : 'info'
        };

        const newSchedule = [...state.schedule, newItem].sort((a, b) => {
            if (!a.dateObj && !b.dateObj) return 0;
            if (!a.dateObj) return 1;
            if (!b.dateObj) return -1;
            return new Date(a.dateObj) - new Date(b.dateObj);
        });

        return { 
            schedule: newSchedule,
            logs: [newLog, ...state.logs].slice(0, 50) 
        };
      }),

      removeTask: (id) => set((state) => {
        const task = state.schedule.find(t => t.id === id);
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: `Protocol "${task ? task.text : id}" deleted.`,
            type: 'error'
        };

        return {
            schedule: state.schedule.filter(t => t.id !== id),
            logs: [newLog, ...state.logs].slice(0, 50)
        };
      }),

    }),
    {
      name: 'jarvis-storage', 
    }
  )
);
