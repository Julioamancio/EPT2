
import { User, Certificate, Question } from '../types';
import { INITIAL_QUESTIONS } from '../constants';

const KEYS = {
  USERS: 'prof_eng_users',
  CERTIFICATES: 'prof_eng_certs',
  QUESTIONS: 'prof_eng_questions',
  SETTINGS: 'prof_eng_settings',
  COUPONS: 'prof_eng_coupons'
};

export const storageService = {
  getCoupons: (): Coupon[] => {
    const data = localStorage.getItem(KEYS.COUPONS);
    return data ? JSON.parse(data) : [];
  },
  saveCoupons: (coupons: Coupon[]) => {
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
  },
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  getCertificates: (): Certificate[] => {
    const data = localStorage.getItem(KEYS.CERTIFICATES);
    return data ? JSON.parse(data) : [];
  },
  saveCertificates: (certs: Certificate[]) => {
    localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(certs));
  },
  getQuestions: (): Question[] => {
    const data = localStorage.getItem(KEYS.QUESTIONS);
    return data ? JSON.parse(data) : INITIAL_QUESTIONS;
  },
  saveQuestions: (questions: Question[]) => {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },
  getQuestionsWithFallback: async (): Promise<Question[]> => {
    try {
      const localStr = localStorage.getItem(KEYS.QUESTIONS);
      const local = localStr ? JSON.parse(localStr) as Question[] : [];
      if (Array.isArray(local) && local.length > 0) return local;
      const fromScript = await (async () => {
        try { const r = await fetch('/questions.json'); if (!r.ok) return []; const j = await r.json(); return Array.isArray(j) ? j as Question[] : []; } catch { return []; }
      })();
      const chosen = (fromScript && fromScript.length > 0) ? fromScript : INITIAL_QUESTIONS as Question[];
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(chosen));
      return chosen;
    } catch {
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS as Question[];
    }
  },
  loadQuestionsFromScript: async (): Promise<Question[]> => {
    try {
      const res = await fetch('/questions.json');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data as Question[] : [];
    } catch {
      return [];
    }
  },
  saveQuestionsToScript: async (questions: Question[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/save-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions)
      });
      return res.ok;
    } catch {
      return false;
    }
  },
  getSettings: () => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      certTemplateUrl: "https://raw.githubusercontent.com/Julioamancio/certificado/main/static/img/certificado_modelo.png",
      nextQuestionNumber: 1
    };
  },
  saveSettings: (settings: { certTemplateUrl: string; nextQuestionNumber?: number }) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};
