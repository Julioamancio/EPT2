import { User, Certificate, Question, Coupon } from '../types';
import { INITIAL_QUESTIONS } from '../constants';
import { supabase } from '../src/lib/supabase';

const KEYS = {
  USERS: 'prof_eng_users',
  CERTIFICATES: 'prof_eng_certs',
  QUESTIONS: 'prof_eng_questions',
  SETTINGS: 'prof_eng_settings',
  COUPONS: 'prof_eng_coupons'
};

const isSupabaseConfigured = () => !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export const storageService = {
  getCoupons: (): Coupon[] => {
    const data = localStorage.getItem(KEYS.COUPONS);
    return data ? JSON.parse(data) : [];
  },
  saveCoupons: (coupons: Coupon[]) => {
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
  },
  getUsers: async (): Promise<User[]> => {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('users').select('*');
      return data || [];
    }
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: async (users: User[]) => {
    if (isSupabaseConfigured()) {
      // Sync strategy: Upsert all (inefficient but safe for this transition)
      // In a real app, you would only upsert the changed user.
      const { error } = await supabase.from('users').upsert(users);
      if (error) console.error('Supabase Save Error:', error);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  getCertificates: (): Certificate[] => {
    const data = localStorage.getItem(KEYS.CERTIFICATES);
    return data ? JSON.parse(data) : [];
  },
  saveCertificates: (certs: Certificate[]) => {
    localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(certs));
  },
  
  // --- QUESTIONS ---
  
  deleteQuestion: async (id: string) => {
    // 1. Local Cache
    const current = localStorage.getItem(KEYS.QUESTIONS);
    if (current) {
        const parsed = JSON.parse(current) as Question[];
        const updated = parsed.filter(q => q.id !== id);
        localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(updated));
    }

    // 2. Database Sync
    if (isSupabaseConfigured()) {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) console.error('DB Delete Error:', error);
    }
  },

  saveQuestions: async (questions: Question[]) => {
    // 1. Local Cache (Immediate UI update)
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));

    // 2. Database Sync (Async)
    if (isSupabaseConfigured()) {
      // NOTE: This uses upsert, so it adds or updates. It does NOT delete.
      // Use deleteQuestion() for removals.
      const { error } = await supabase.from('questions').upsert(questions.map(q => ({
        ...q,
        options: JSON.stringify(q.options),
        sub_questions: q.subQuestions ? JSON.stringify(q.subQuestions) : null
      })));
      
      if (error) console.error('DB Sync Error:', error);
    }
  },

  getQuestionsWithFallback: async (): Promise<Question[]> => {
    try {
      // 1. Database is the ONLY Source of Truth for production
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('questions').select('*').order('number', { ascending: true });
        if (!error && data) {
          const mapped = data.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            subQuestions: q.sub_questions ? (typeof q.sub_questions === 'string' ? JSON.parse(q.sub_questions) : q.sub_questions) : undefined
          })) as Question[];
          
          // Update Local Cache for offline resilience/speed
          localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(mapped));
          return mapped;
        }
      }

      // 2. Fallback to LocalStorage if DB connection fails or not configured
      const localStr = localStorage.getItem(KEYS.QUESTIONS);
      const local = localStr ? JSON.parse(localStr) as Question[] : [];
      if (Array.isArray(local) && local.length > 0) return local;

      return INITIAL_QUESTIONS as Question[];
    } catch {
      return INITIAL_QUESTIONS as Question[];
    }
  },

  // Deprecated: No longer needed for Supabase workflow
  saveQuestionsToScript: async (questions: Question[]): Promise<boolean> => {
     return true; // No-op
  },

  getSettings: async () => {
    if (isSupabaseConfigured()) {
        const { data } = await supabase.from('settings').select('*').single();
        if (data) return data;
    }
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      certTemplateUrl: "https://raw.githubusercontent.com/Julioamancio/certificado/main/static/img/certificado_modelo.png",
      nextQuestionNumber: 1
    };
  },
  
  saveSettings: async (settings: { certTemplateUrl: string; nextQuestionNumber?: number }) => {
    if (isSupabaseConfigured()) {
        await supabase.from('settings').upsert({ id: 1, ...settings });
    }
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};
