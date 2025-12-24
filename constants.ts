
import { Question, ProficiencyLevel, SectionType } from './types';

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    level: ProficiencyLevel.B2,
    section: SectionType.GRAMMAR,
    text: 'By the time the sun sets, we ______ our work for the day.',
    options: ['will finish', 'will have finished', 'finish', 'are finishing'],
    correctAnswer: 1
  },
  {
    id: '2',
    level: ProficiencyLevel.B2,
    section: SectionType.READING,
    text: 'What is the main purpose of a topic sentence in a paragraph?',
    options: ['To provide a transition', 'To summarize the paragraph', 'To introduce the main idea', 'To provide evidence'],
    correctAnswer: 2
  },
  {
    id: '3',
    level: ProficiencyLevel.C1,
    section: SectionType.USE_OF_ENGLISH,
    text: 'Had I known about the traffic, I ______ another route.',
    options: ['would take', 'will take', 'would have taken', 'should take'],
    correctAnswer: 2
  },
  {
    id: '4',
    level: ProficiencyLevel.C1,
    section: SectionType.LISTENING,
    text: 'Listen to the audio. What does the speaker imply about the future of renewable energy?',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    options: ['It is a lost cause', 'It requires more investment than expected', 'It will eventually replace all fossil fuels', 'It is currently at its peak'],
    correctAnswer: 2
  }
];

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123*'
};

export const UNIFIED_EXAM_PRICE = 49.99;

export const PRICING = {
  [ProficiencyLevel.B2]: 49.99,
  [ProficiencyLevel.C1]: 49.99
};
