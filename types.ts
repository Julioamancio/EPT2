
export enum ProficiencyLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export enum SectionType {
  READING = 'Reading',
  GRAMMAR = 'Grammar',
  USE_OF_ENGLISH = 'Use of English',
  LISTENING = 'Listening'
}

export interface Question {
  id: string;
  number?: number;
  level: ProficiencyLevel;
  section: SectionType;
  text: string;
  context?: string;
  audioUrl?: string;
  options: string[];
  correctAnswer: number;
  subQuestions?: {
    id: string;
    text: string;
    correctAnswer: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  password?: string;
  purchasedLevel: ProficiencyLevel;
  examCompleted: boolean;
  score?: number;
  certificateCode?: string;
  fullName?: string;
  failureReason?: string;
  purchaseDate?: number; // timestamp
  screenshots?: string[]; // base64 images
  cpf?: string;
  lastExamDate?: number; // timestamp
  rawScore?: number; // Pontuação bruta (número de acertos)
  totalQuestions?: number; // Total de questões da prova
  examHistory?: {
    date: number;
    score: number;
    passed: boolean;
    breakdown?: {
      reading: number;
      listening: number;
      useOfEnglish: number;
    }
  }[];
}

export interface Certificate {
  id: string;
  userId: string;
  fullName: string;
  level: ProficiencyLevel;
  score: number;
  date: string;
  uniqueCode: string;
  isApproved: boolean;
}

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
}


