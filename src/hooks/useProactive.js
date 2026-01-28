import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useProactive = () => {
  const { schedule, addSuggestion } = useStore();

  useEffect(() => {
    const checkContext = () => {
      const now = new Date();
      const hour = now.getHours();

      // RULE 1: Morning Protocol (6AM - 9AM)
      if (hour >= 6 && hour < 9) {
        // If schedule is empty for the next hour, suggest routine
        const hasMorningTask = schedule.some(t => {
            if (!t.dateObj) return false;
            const tHour = new Date(t.dateObj).getHours();
            return tHour === hour;
        });

        if (!hasMorningTask) {
            addSuggestion("Execute Morning Protocol", "NOW");
        }
      }

      // RULE 2: Deep Work Block (10AM - 11AM)
      if (hour >= 10 && hour < 11) {
         addSuggestion("Initiate Deep Work Session", "10:00 AM");
      }

      // RULE 3: Daily Review (8PM - 10PM)
      if (hour >= 20 && hour < 22) {
         addSuggestion("Perform Daily System Review", "8:00 PM");
      }
    };

    // Run check on load
    checkContext();

    // Run check every 10 minutes
    const interval = setInterval(checkContext, 600000);
    return () => clearInterval(interval);

  }, [schedule]);
};
