import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useScheduler = () => {
  const { schedule } = useStore();

  useEffect(() => {
    // 1. Request Permission on load
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // 2. The "Heartbeat" (Checks every 30 seconds)
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      schedule.forEach(task => {
        if (!task.dateObj) return; // Skip TBD tasks
        
        const taskTime = new Date(task.dateObj);
        
        // Check if task is NOW (within the last minute)
        if (taskTime.getHours() === currentHour && 
            taskTime.getMinutes() === currentMinute &&
            !task.notified) {
            
            // TRIGGER SYSTEM NOTIFICATION
            new Notification("JARVIS.OS PROTOCOL", {
                body: `EXECUTING: ${task.text}`,
                icon: '/vite.svg' // You can replace this with a Jarvis icon later
            });

            // Mark as notified in store (we'll need to add this action)
            useStore.getState().markAsNotified(task.id);
            
            // Speak it out (Text-to-Speech)
            const utterance = new SpeechSynthesisUtterance(`Sir, it is time for: ${task.text}`);
            window.speechSynthesis.speak(utterance);
        }
      });

    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [schedule]);
};
