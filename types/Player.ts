export interface Player {
  id: string;
  userId: string;
  name: string;
  avatar: string; // يمكن أن يكون emoji أو base64 image
  createdAt: string;
  lastPlayed: string;
  totalScore: number;
  gamesCompleted: number;
  storiesCompleted: number;
  achievements: string[];
  gameProgress: Record<string, {
    level: number;
    score: number;
    completedLevels: number;
    bestTime?: number;
  }>;
  storyProgress: Record<string, {
    completed: boolean;
    score: number;
    choices: string[];
  }>;
  preferences: {
    language: 'ar' | 'en';
    soundEnabled: boolean;
    musicEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface PlayerStats {
  totalPlayTime: number;
  averageScore: number;
  favoriteGame: string;
  streakDays: number;
  totalStars: number;
}