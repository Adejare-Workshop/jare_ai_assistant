import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseCommand } from '../utils/nlp';
import { processWithGemini } from '../utils/ai';

export const useStore = create(
  persist(
    (set, get) => ({
      // --- IDENTITY CORE ---
      user: { 
        name: "Commander",
        sleepGoal: 8,
        focusBlock: 45,
        xp: 0,
        level: 1
      },
      
      // --- OPERATIONAL DATA ---
      schedule: [],
      suggestions: [], 
      status: "idle", 
      logs: [],
      personality: 'brief', 
      apiKey: "AIzaSyBfSZWEa-QZvclte8Z_YyyfFq0bXwOT2BQ", 

      // --- ANALYTICS CORE (Feature 23) ---
      history: [], // Stores archived tasks
      focusStats: { totalMinutes: 0, sessions: 0 },

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
      setApiKey: (key) => set({ apiKey: key }),

      // --- SMART INPUT PROCESSOR ---
      processInput: async (input) => {
        const state = get();
        set({ status: 'processing' });

        let aiData = null;

        if (state.apiKey) {
            try {
                aiData = await processWithGemini(state.apiKey, input);
            } catch (e) {
                console.log("AI Failed, falling back to basic");
            }
        }

        if (aiData) {
            if (aiData.response && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(aiData.response);
                utterance.rate = state.personality === 'brief' ? 1.2 : 0.9;
                window.speechSynthesis.speak(utterance);
            }

            if (aiData.intent === 'delete') {
                const last = state.schedule[state.schedule.length - 1];
                if (last) get().removeTask(last.id);
            } 
            else if (aiData.intent === 'task') {
                get().addTaskDirectly({
                    text: aiData.text,
                    time: aiData.time || "TBD",
                    dateObj: aiData.dateObj,
                    isUrgent: aiData.isUrgent,
                    isImportant: aiData.isImportant
                });
            }
        } else {
            get().addTask(input); 
        }

        set({ status: 'idle' });
      },

      addTaskDirectly: (taskData) => set((state) => {
         const newItem = { 
            id: Date.now(), 
            type: 'task',
            notified: false,
            ...taskData 
        };
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: `AI Protocol created: ${taskData.text}`,
            type: 'info'
        };
        return { 
            schedule: [...state.schedule, newItem].sort((a, b) => {
                if (!a.dateObj && !b.dateObj) return 0;
                if (!a.dateObj) return 1;
                if (!b.dateObj) return -1;
                return new Date(a.dateObj) - new Date(b.dateObj);
            }),
            logs: [newLog, ...state.logs].slice(0, 50)
        };
      }),

      // --- SYSTEM ACTIONS ---
      hardReset: () => {
        localStorage.removeItem('jarvis-storage');
        window.location.reload(); 
      },

      importData: (jsonData) => set((state) => {
        try {
            const parsed = JSON.parse(jsonData);
            if (!parsed.user || !parsed.schedule) throw new Error("Invalid format");
            return {
                ...parsed,
                logs: [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), message: "System state restored.", type: 'success' }, ...state.logs].slice(0, 50)
            };
        } catch (e) {
            return { logs: [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), message: "Import failed.", type: 'error' }, ...state.logs].slice(0, 50) };
        }
      }),

      // --- GAMIFICATION & TASK COMPLETION ---
      addXp: (amount) => set((state) => {
        const newXp = state.user.xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1; 
        let logMsg = `Gained ${amount} XP.`;
        if (newLevel > state.user.level) logMsg = `LEVEL UP! Promotion to Level ${newLevel}.`;
        
        return { 
            user: { ...state.user, xp: newXp, level: newLevel }, 
            logs: [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), message: logMsg, type: 'success' }, ...state.logs].slice(0, 50) 
        };
      }),

      completeTask: (id) => {
        const state = get();
        const task = state.schedule.find(t => t.id === id);
        if (!task) return;
        
        // 1. Calculate XP
        let xpGain = 10;
        if (task.isUrgent) xpGain += 5;
        if (task.isImportant) xpGain += 10;

        // 2. Archive Task
        const archivedTask = {
            ...task,
            completedAt: new Date(),
            xpEarned: xpGain
        };

        // 3. Update State
        set((state) => ({
            schedule: state.schedule.filter(t => t.id !== id),
            history: [archivedTask, ...state.history].slice(0, 100), // Keep last 100
            user: { 
                ...state.user, 
                xp: state.user.xp + xpGain,
                level: Math.floor((state.user.xp + xpGain) / 100) + 1
            },
            logs: [{
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                message: `Objective "${task.text}" archived. +${xpGain} XP.`,
                type: 'success'
            }, ...state.logs].slice(0, 50)
        }));
      },

      // --- FOCUS MODE ---
      enterFocusMode: (taskId) => set((state) => {
        const task = state.schedule.find(t => t.id === taskId);
        return { 
            isFocusMode: true, 
            activeTaskId: taskId, 
            logs: [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), message: `Focus Protocol: ${task ? task.text : 'Unknown'}`, type: 'warning' }, ...state.logs].slice(0, 50) 
        };
      }),

      exitFocusMode: (completed = false) => {
        const state = get();
        
        // Track Focus Stats
        if (completed) {
            set(s => ({
                focusStats: {
                    totalMinutes: s.focusStats.totalMinutes + 25, // Assume 25m block
                    sessions: s.focusStats.sessions + 1
                }
            }));
            if (state.activeTaskId) get().completeTask(state.activeTaskId);
        }

        set((state) => ({
            isFocusMode: false,
            activeTaskId: null,
            logs: [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), message: completed ? "Focus Complete." : "Focus Aborted.", type: completed ? 'success' : 'error' }, ...state.logs].slice(0, 50)
        }));
      },

      // --- OTHER ACTIONS ---
      togglePersonality: () => set((state) => ({ personality: state.personality === 'brief' ? 'deep' : 'brief' })),
      
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

      setAnalysisMode: (active) => set({ isAnalysisMode: active }),
      
      submitAnswer: (answer) => set((state) => {
        const newAnswers = [...state.dailyAnswers, { question: state.questions[state.currentQuestionIndex], answer, timestamp: new Date().toISOString() }];
        const nextIndex = state.currentQuestionIndex + 1;
        const isFinished = nextIndex >= state.questions.length;
        let newSchedule = state.schedule;
        if (isFinished) {
            newSchedule = [...state.schedule, { id: Date.now(), text: "Review Daily Analysis Data", type: "system", time: "NOW", dateObj: new Date(), notified: false, isUrgent: true, isImportant: true }];
        }
        return { dailyAnswers: newAnswers, currentQuestionIndex: isFinished ? 0 : nextIndex, isAnalysisMode: !isFinished, schedule: newSchedule };
      }),

      markAsNotified: (id) => set((state) => ({ schedule: state.schedule.map(t => t.id === id ? { ...t, notified: true } : t) })),

      addSuggestion: (text, time) => set((state) => {
        const exists = state.schedule.find(t => t.text === text) || state.suggestions.find(s => s.text === text);
        if (exists) return {};
        return { suggestions: [...state.suggestions, { id: Date.now(), text, time, type: 'suggestion', dateObj: new Date() }] };
      }),

      acceptSuggestion: (id) => set((state) => {
        const suggestion = state.suggestions.find(s => s.id === id);
        if (!suggestion) return {};
        return { schedule: [...state.schedule, { ...suggestion, id: Date.now(), type: 'task', notified: false }].sort((a, b) => new Date(a.dateObj) - new Date(b.dateObj)), suggestions: state.suggestions.filter(s => s.id !== id) };
      }),

      rejectSuggestion: (id) => set((state) => ({ suggestions: state.suggestions.filter(s => s.id !== id) })),

      addTask: (input) => set((state) => {
        const data = parseCommand(input);
        const textLower = data.text.toLowerCase();
        const isUrgent = textLower.includes("now") || textLower.includes("asap") || textLower.includes("urgent");
        const isImportant = textLower.includes("critical") || textLower.includes("boss") || textLower.includes("project");
        return { schedule: [...state.schedule, { id: Date.now(), text: data.text, type: "task", time: data.time || "TBD", dateObj: data.dateObj, notified: false, isUrgent, isImportant }].sort((a, b) => new Date(a.dateObj) - new Date(b.dateObj)) };
      }),

      removeTask: (id) => set((state) => ({ schedule: state.schedule.filter(t => t.id !== id) })),
    }),
    { name: 'jarvis-storage' }
  )
);
