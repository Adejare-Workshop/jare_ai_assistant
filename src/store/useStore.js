import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseCommand } from '../utils/nlp';

export const useStore = create(
  persist(
    (set, get) => ({
      // --- IDENTITY CORE (Now with XP) ---
      user: { 
        name: "Commander",
        sleepGoal: 8,
        focusBlock: 45,
        xp: 0,     // Feature 7
        level: 1   // Feature 7
      },
      
      // --- OPERATIONAL DATA ---
      schedule: [],
      suggestions: [], 
      status: "idle", 
      logs: [],
      personality: 'brief', 

      // --- FOCUS PROTOCOL STATE ---
      isFocusMode: false,
      activeTaskId: null,

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

      // --- GAMIFICATION ACTIONS (Feature 7) ---
      addXp: (amount) => set((state) => {
        const newXp = state.user.xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1; // Level up every 100 XP
        
        let logMsg = `Gained ${amount} XP.`;
        if (newLevel > state.user.level) {
            logMsg = `LEVEL UP! Promotion to Level ${newLevel}.`;
        }

        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: logMsg,
            type: 'success'
        };

        return {
            user: { ...state.user, xp: newXp, level: newLevel },
            logs: [newLog, ...state.logs].slice(0, 50)
        };
      }),

      completeTask: (id) => {
        const state = get();
        const task = state.schedule.find(t => t.id === id);
        
        // Calculate XP based on difficulty
        let xpGain = 10; // Base XP
        if (task?.isUrgent) xpGain += 5;
        if (task?.isImportant) xpGain += 10;

        get().addXp(xpGain); // Award XP
        get().removeTask(id); // Remove task
      },

      // --- FOCUS MODE ACTIONS ---
      enterFocusMode: (taskId) => set((state) => {
        const task = state.schedule.find(t => t.id === taskId);
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: `Focus Protocol initiated for: ${task ? task.text : 'Unknown'}`,
            type: 'warning'
        };
        return {
            isFocusMode: true,
            activeTaskId: taskId,
            logs: [newLog, ...state.logs].slice(0, 50)
        };
      }),

      exitFocusMode: (completed = false) => {
        const state = get();
        
        if (completed && state.activeTaskId) {
            get().completeTask(state.activeTaskId); // Use new complete action
        }

        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: completed 
                ? "Objective complete. XP Awarded." 
                : "Focus Protocol aborted.",
            type: completed ? 'success' : 'error'
        };

        set((state) => ({
            isFocusMode: false,
            activeTaskId: null,
            logs: [newLog, ...state.logs].slice(0, 50)
        }));
      },

      // --- PERSONALITY ACTIONS ---
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
                notified: false,
                isUrgent: true,
                isImportant: true
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

      // --- SUGGESTION ACTIONS ---
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
            notified: false,
            isUrgent: false,
            isImportant: false
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

      // --- TASK ACTIONS ---
      addTask: (input) => set((state) => {
        const data = parseCommand(input);
        
        const textLower = data.text.toLowerCase();
        const isUrgent = textLower.includes("now") || textLower.includes("asap") || textLower.includes("urgent") || textLower.includes("today") || data.time === "NOW";
        const isImportant = textLower.includes("critical") || textLower.includes("boss") || textLower.includes("deadline") || textLower.includes("project") || textLower.includes("meeting");

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
            notified: false,
            isUrgent,
            isImportant
        };

        const newLog = {
            id: Date.now() + 1,
            timestamp: new Date().toLocaleTimeString(),
            message: `Protocol created: ${data.text} [P:${isUrgent ? 'U' : '-'}${isImportant ? 'I' : '-'}]`,
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
