import * as chrono from 'chrono-node';

export const parseCommand = (input) => {
  // 1. Try to find a date/time in the sentence
  const results = chrono.parse(input);

  if (results.length === 0) {
    return {
      text: input,
      time: null,
      dateObj: null,
      type: 'note'
    };
  }

  // 2. Extract the first date found
  const parsed = results[0];
  const dateObj = parsed.start.date();
  
  // 3. Remove the date text from the command to clean it up
  // E.g., "Call Mom tomorrow at 5pm" -> "Call Mom"
  // We remove the text match found by chrono
  const cleanText = input.replace(parsed.text, '').trim().replace(/\s+/, ' ');

  return {
    text: cleanText || input, // Fallback if removing date removes everything
    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateObj: dateObj, // We save the full Date object for sorting later
    type: 'task'
  };
};
