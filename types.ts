
export interface PlayerStats {
  name: string;
  totalPoints: number;
  unlockedLevels: number;
  mastery: Record<number, number>; // Table number -> Correct answers count
  totalQuestions: number;
  totalCorrect: number;
  collectedCards: string[]; // URLs of Pokémon card images
  mistakes: Record<string, number>; // "num1xnum2" -> failure count
  consecutivePlays: Record<number, number>; // levelId -> count of times played in a row
  temporarilyLockedLevels: number[]; // IDs of levels that are locked due to repetition
}

export interface Question {
  id: string;
  num1: number;
  num2: number;
  answer: number;
  options: number[];
}

export type View = 'welcome' | 'map' | 'game' | 'album' | 'stats' | 'levelComplete';

export interface LevelConfig {
  id: number;
  table: number | 'mixed' | 'refuerzo';
  title: string;
  emoji: string;
  color: string;
}
