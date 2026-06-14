export type DailyQuestion = {
  id: string;
  text: string;
  category: 'deep' | 'fun' | 'future' | 'gratitude';
};

export type GamePrompt = {
  id: string;
  text: string;
};

export const DAILY_QUESTIONS: DailyQuestion[] = [
  { id: 'd1', text: 'What is one small thing your partner did recently that made you feel loved?', category: 'gratitude' },
  { id: 'd2', text: 'If you could relive one day together, which would it be and why?', category: 'deep' },
  { id: 'd3', text: 'What adventure do you want to plan in the next three months?', category: 'future' },
  { id: 'd4', text: 'What song best describes your relationship right now?', category: 'fun' },
  { id: 'd5', text: 'When do you feel most connected to each other?', category: 'deep' },
  { id: 'd6', text: 'What habit of yours do you think your partner secretly appreciates?', category: 'fun' },
  { id: 'd7', text: 'What is a dream you have never said out loud to them?', category: 'future' },
  { id: 'd8', text: 'What does “home” mean to you when you are together?', category: 'deep' },
  { id: 'd9', text: 'What is your favorite inside joke between you two?', category: 'fun' },
  { id: 'd10', text: 'What are you most proud of as a couple this year?', category: 'gratitude' },
];

export const NEVER_HAVE_I_EVER: GamePrompt[] = [
  { id: 'n1', text: 'Never have I ever stayed up all night talking on the phone.' },
  { id: 'n2', text: 'Never have I ever written a love letter by hand.' },
  { id: 'n3', text: 'Never have I ever surprised my partner with breakfast in bed.' },
  { id: 'n4', text: 'Never have I ever gotten lost on purpose just to extend a date.' },
  { id: 'n5', text: 'Never have I ever cried during a movie we watched together.' },
  { id: 'n6', text: 'Never have I ever saved a screenshot of a sweet text.' },
  { id: 'n7', text: 'Never have I ever danced in the kitchen for no reason.' },
  { id: 'n8', text: 'Never have I ever pretended to like a gift at first.' },
];

export const WOULD_YOU_RATHER: GamePrompt[] = [
  { id: 'w1', text: 'Would you rather have a cozy night in every week or one big adventure each month?' },
  { id: 'w2', text: 'Would you rather receive a handwritten note or a spontaneous voice memo?' },
  { id: 'w3', text: 'Would you rather travel back to your first date or skip ahead to your dream vacation?' },
  { id: 'w4', text: 'Would you rather cook together or order takeout and play a game?' },
  { id: 'w5', text: 'Would you rather always know what they are thinking or never argue again?' },
  { id: 'w6', text: 'Would you rather relive your best kiss or your funniest moment?' },
  { id: 'w7', text: 'Would you rather share one phone for a day or swap playlists for a week?' },
  { id: 'w8', text: 'Would you rather live by the ocean or in a cabin in the woods together?' },
];

/** Picks a stable “question of the day” from the bank using the calendar date. */
export function getDailyQuestionForDate(date = new Date()): DailyQuestion {
  const dayIndex =
    date.getFullYear() * 366 + date.getMonth() * 31 + date.getDate();
  return DAILY_QUESTIONS[dayIndex % DAILY_QUESTIONS.length];
}

export function pickRandomPrompt<T extends { id: string }>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
