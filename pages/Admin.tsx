import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, X, 
  CheckCircle2, Sparkles, BrainCircuit, 
  Loader2, ImageIcon,
  ChevronDown, Music, Link as LinkIcon,
  AlertTriangle, Search, Copy,
  ArrowUpDown, Award, Clock, Download, BarChart2
} from 'lucide-react';
import { Question, ProficiencyLevel, SectionType, User } from '../types';
import { storageService } from '../services/storageService';
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { UNIFIED_EXAM_PRICE } from '../constants';

type AdminTab = 'questions' | 'sales' | 'settings' | 'ai-import' | 'finance';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [settings, setSettings] = useState({ certTemplateUrl: '', nextQuestionNumber: 1 });
  const [showModal, setShowModal] = useState(false);
  const [showAiGeneratorModal, setShowAiGeneratorModal] = useState(false);
  const [financialPeriod, setFinancialPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly');
  const [aiGenConfig, setAiGenConfig] = useState({
    level: ProficiencyLevel.B2,
    section: SectionType.GRAMMAR,
    topic: '',
    count: 1
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [rawContent, setRawContent] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');
  const [importProcessed, setImportProcessed] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importAdded, setImportAdded] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC' | 'LEVEL_ASC' | 'LEVEL_DESC'>('ASC');

  const [formData, setFormData] = useState<Partial<Question>>({
    level: ProficiencyLevel.B2,
    section: SectionType.GRAMMAR,
    text: '',
    audioUrl: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const users = await storageService.getUsers();
    setCandidates(users);
    const s = await storageService.getSettings();
    setSettings(s);
    storageService.getQuestionsWithFallback().then(list => {
      setQuestions(list);
      const maxN = Math.max(...list.map(q => q.number || 0));
      const next = Math.max(1, (isFinite(maxN) ? maxN : 0) + 1);
      const s2 = { ...s, nextQuestionNumber: next };
      setSettings(s2);
      storageService.saveSettings(s2);
    });
  };

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'A1': return { sqBg: 'bg-emerald-100', sqText: 'text-emerald-700', sqBorder: 'border-emerald-300' };
      case 'A2': return { sqBg: 'bg-cyan-100', sqText: 'text-cyan-700', sqBorder: 'border-cyan-300' };
      case 'B1': return { sqBg: 'bg-blue-100', sqText: 'text-blue-700', sqBorder: 'border-blue-300' };
      case 'B2': return { sqBg: 'bg-indigo-100', sqText: 'text-indigo-700', sqBorder: 'border-indigo-300' };
      case 'C1': return { sqBg: 'bg-amber-100', sqText: 'text-amber-700', sqBorder: 'border-amber-300' };
      case 'C2': return { sqBg: 'bg-rose-100', sqText: 'text-rose-700', sqBorder: 'border-rose-300' };
      default: return { sqBg: 'bg-slate-100', sqText: 'text-slate-700', sqBorder: 'border-slate-300' };
    }
  };

  const saveToCloud = async (updatedQuestions: Question[]) => {
    // Single source of truth: Storage Service (which uses Supabase)
    await storageService.saveQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('DELETE RECORD? This action will permanently remove the question from the database.')) {
      setQuestions(prev => {
        const updated = prev.filter(q => q.id !== id);
        storageService.deleteQuestion(id); 
        return updated;
      });
    }
  };

  const handleDuplicateQuestion = (q: Question) => {
    setQuestions(prev => {
      const next = (settings.nextQuestionNumber || 1);
      const copyQ: Question = { 
        ...q, 
        id: Math.random().toString(36).substr(2,9),
        number: next
      };
      const updated = [copyQ, ...prev];
      const s = { ...settings, nextQuestionNumber: next + 1 };
      setSettings(s);
      storageService.saveSettings(s);
      saveToCloud(updated);
      return updated;
    });
  };

  const handleDeleteSelected = () => {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} questions?`)) return;
    
    // Delete one by one in DB (could be optimized with deleteMany but keeping it simple)
    ids.forEach(id => storageService.deleteQuestion(id));
    
    setQuestions(prev => {
      const updated = prev.filter(q => !ids.includes(q.id));
      setSelected({});
      return updated;
    });
  };

  const handleDeleteAll = () => {
    if (!window.confirm('Delete ALL questions?')) return;
    // In a real app we might not want to allow this easily on DB
    questions.forEach(q => storageService.deleteQuestion(q.id));
    
    setQuestions([]);
    const s = { ...settings, nextQuestionNumber: 1 };
    setSettings(s);
    storageService.saveSettings(s);
    setSelected({});
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedQuestions: Question[] = [];
    
    if (editingQuestion) {
      updatedQuestions = questions.map(q => q.id === editingQuestion.id ? { ...q, ...formData } as Question : q);
    } else {
      const newQuestion = { 
        ...formData, 
        id: Math.random().toString(36).substr(2, 9),
        number: settings.nextQuestionNumber
      } as Question;
      updatedQuestions = [newQuestion, ...questions];
      
      const next = (settings.nextQuestionNumber || 1) + 1;
      const s = { ...settings, nextQuestionNumber: next };
      setSettings(s);
      storageService.saveSettings(s);
    }
    
    setQuestions(updatedQuestions);
    await saveToCloud(updatedQuestions);

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ level: ProficiencyLevel.B2, section: SectionType.GRAMMAR, text: '', audioUrl: '', options: ['', '', '', ''], correctAnswer: 0 });
    setEditingQuestion(null);
  };

  const handleSmartImport = async () => {
    if (!rawContent.trim()) return;
    setIsAiProcessing(true);
    try {
      const chunkSize = 6000;
      const chunks: string[] = [];
      for (let i = 0; i < rawContent.length; i += chunkSize) {
        chunks.push(rawContent.slice(i, i + chunkSize));
      }
      setImportTotal(chunks.length);
      setImportProcessed(0);
      const aggregator: Question[] = [];
      for (let c = 0; c < chunks.length; c++) {
        let parsed: Question[] = [];
        if (aiProvider === 'gemini') {
          const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze the text and extract exam questions in JSON format.
            IMPORTANT:
            1. Classify each question into the appropriate CEFR level (A1-C2).
            2. If you identify a MATCHING task, create A SINGLE question where:
               - 'text' is the main instruction.
               - 'options' are the target options (e.g., Professions A-K).
               - 'subQuestions' is an array of items to be matched (each with 'text' and 'correctAnswerIndex' pointing to 'options').
            3. For standard questions, 'subQuestions' should not exist.
            4. Ensure all content is in ENGLISH.
            Text: "${chunks[c]}"`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.STRING, enum: Object.values(ProficiencyLevel) },
                    section: { type: Type.STRING, enum: Object.values(SectionType) },
                    text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.INTEGER },
                    correctAnswerIndex: { type: Type.INTEGER },
                    answerText: { type: Type.STRING },
                    subQuestions: { 
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          correctAnswerIndex: { type: Type.INTEGER }
                        }
                      }
                    }
                  },
                  required: ["level", "section", "text", "options"]
                }
              }
            }
          });
          parsed = JSON.parse(response.text || "[]") as Question[];
        } else {
          const client = new OpenAI({ apiKey: (import.meta as any).env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
          const prompt = `Generate CEFR questions (A1-C2) from the text. Respond ONLY with JSON.
          If it's a Matching task, create an object with 'subQuestions' (array of {text, correctAnswerIndex}) and 'options' (list of choices).
          Otherwise, use standard format. Ensure all output is in ENGLISH.
          Text: \n\n${chunks[c]}`;
          const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Respond only with valid JSON.' },
              { role: 'user', content: prompt }
            ]
          });
          const jsonText = completion.choices?.[0]?.message?.content || '[]';
          parsed = JSON.parse(jsonText) as Question[];
        }
        for (const q of parsed) {
          const level = Object.values(ProficiencyLevel).includes(q.level as any) ? q.level : ProficiencyLevel.B2;
          const section = Object.values(SectionType).includes(q.section as any) ? q.section : SectionType.GRAMMAR;
          
          if (q.subQuestions && Array.isArray(q.subQuestions) && q.subQuestions.length > 0) {
             aggregator.push({
               id: Math.random().toString(36).substr(2, 9),
               level: level as ProficiencyLevel,
               section: section as SectionType,
               text: q.text,
               options: q.options,
               correctAnswer: 0,
               subQuestions: q.subQuestions.map(sq => ({
                 id: Math.random().toString(36).substr(2, 9),
                 text: sq.text,
                 correctAnswer: typeof (sq as any).correctAnswerIndex === 'number' ? (sq as any).correctAnswerIndex : 0
               }))
             });
          } else {
            const opts = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
            while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
            let idx = typeof (q as any).correctAnswerIndex === 'number' ? (q as any).correctAnswerIndex : (typeof (q as any).correctAnswer === 'number' ? (q as any).correctAnswer : 0);
            if (typeof (q as any).correctAnswer === 'string') {
              const m = String((q as any).correctAnswer).trim().toUpperCase();
              if (['A','B','C','D'].includes(m)) idx = 'ABCD'.indexOf(m);
            }
            if (typeof (q as any).answerText === 'string') {
              const i = opts.findIndex(o => o.trim().toLowerCase() === (q as any).answerText.trim().toLowerCase());
              if (i >= 0) idx = i;
            }
            if (idx < 0) idx = 0;
            if (idx > 3) idx = 3;
            if (q.text) {
              aggregator.push({ id: Math.random().toString(36).substr(2, 9), level: level as ProficiencyLevel, section: section as SectionType, text: q.text, options: opts, correctAnswer: idx });
            }
          }
        }
        setImportProcessed(c + 1);
        setImportAdded(aggregator.length);
      }
      const start = settings.nextQuestionNumber || 1;
      const newQuestions = aggregator.map((q, i) => ({ ...q, number: start + i }));
      const next = start + newQuestions.length;
      const s = { ...settings, nextQuestionNumber: next };
      setSettings(s);
      storageService.saveSettings(s);
      
      setQuestions(prev => {
        const updated = [...newQuestions, ...prev];
        saveToCloud(updated);
        return updated;
      });
      
      setRawContent('');
      setActiveTab('questions');
    } catch (err) { 
      alert('AI Error'); 
    } finally { 
      setIsAiProcessing(false); 
      setImportTotal(0);
      setImportProcessed(0);
      setImportAdded(0);
    }
  };

  const handleAiGeneration = async () => {
    setIsAiProcessing(true);
    try {
      const { level, section, topic, count } = aiGenConfig;
      let prompt = '';
      
      if (section === SectionType.READING) {
         prompt = `Generate ${count} READING questions for CEFR level ${level}.
         IMPORTANT:
         - Include an academic or professional base text suitable for level ${level} (150-250 words).
         - The question must be about the provided text.
         - The 'text' field must contain THE FULL TEXT followed by the QUESTION. Use \n\n to separate.
         - Example format for 'text': "TEXT...\n\nQUESTION..."
         - Return ONLY a JSON Array of Question objects. Ensure content is in ENGLISH.`;
      } else if (section === SectionType.USE_OF_ENGLISH) {
         prompt = `Generate ${count} USE OF ENGLISH questions for CEFR level ${level}.
         Topic: ${topic || 'Business & Technology'}.
         Focus on: Advanced Grammar, Collocations, Phrasal Verbs, and Sentence Transformation.
         The instruction must be clear and professional.
         Return ONLY a JSON Array. Ensure content is in ENGLISH.`;
      } else if (section === SectionType.LISTENING) {
         prompt = `Generate ${count} LISTENING questions for CEFR level ${level}.
         - Since we cannot generate real audio, create questions based on "transcripts" of short dialogues.
         - Include the transcript at the beginning of the 'text' field (e.g., "Speaker A: ... Speaker B: ... \n\nQuestion: ...").
         - Return ONLY a JSON Array. Ensure content is in ENGLISH.`;
      } else {
         prompt = `Generate ${count} ${section} questions for CEFR level ${level}.
         Topic: ${topic || 'Varied'}.
         Rigor level: High (Oxford/Cambridge style).
         Return ONLY a JSON Array. Ensure content is in ENGLISH.`;
      }

      prompt += `
      Mandatory JSON Structure:
      [
        {
          "level": "${level}",
          "section": "${section}",
          "text": "Instruction or Text + Question",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": 0, // 0-3
          "subQuestions": [] // Optional, only for Matching
        }
      ]
      `;

      let parsed: Question[] = [];
      if (aiProvider === 'gemini') {
          const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          parsed = JSON.parse(response.text || "[]");
      } else {
          const client = new OpenAI({ apiKey: (import.meta as any).env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
          const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a professional CEFR exam creator. Output JSON only.' },
              { role: 'user', content: prompt }
            ]
          });
          parsed = JSON.parse(completion.choices?.[0]?.message?.content || '[]');
      }

      const aggregator: Question[] = [];
      for (const q of parsed) {
         const opts = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
         while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
         
         let idx = typeof (q as any).correctAnswerIndex === 'number' ? (q as any).correctAnswerIndex : 0;
         if (idx < 0) idx = 0; if (idx > 3) idx = 3;

         const finalQ: Question = {
           id: Math.random().toString(36).substr(2, 9),
           level: (Object.values(ProficiencyLevel).includes(q.level as any) ? q.level : level) as ProficiencyLevel,
           section: (Object.values(SectionType).includes(q.section as any) ? q.section : section) as SectionType,
           text: q.text,
           options: opts,
           correctAnswer: idx,
           subQuestions: q.subQuestions?.map((sq: any) => ({
             id: Math.random().toString(36).substr(2, 9),
             text: sq.text,
             correctAnswer: typeof sq.correctAnswerIndex === 'number' ? sq.correctAnswerIndex : 0
           }))
         };
         aggregator.push(finalQ);
      }

      if (aggregator.length > 0) {
        setQuestions(prev => {
          const start = settings.nextQuestionNumber || 1;
          const newQs = aggregator.map((q, i) => ({ ...q, number: start + i }));
          const updated = [...newQs, ...prev];
          saveToCloud(updated);
          return updated;
        });
        const next = (settings.nextQuestionNumber || 1) + aggregator.length;
        const s = { ...settings, nextQuestionNumber: next };
        setSettings(s);
        storageService.saveSettings(s);
        
        setShowAiGeneratorModal(false);
        setAiGenConfig({ ...aiGenConfig, topic: '' }); 
        alert(`${aggregator.length} questions generated and saved successfully!`);
      } else {
        alert('No questions generated. Please try again.');
      }

    } catch (error) {
      console.error(error);
      alert('Error generating questions. Check API Key.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const getFinancialData = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (financialPeriod) {
      case 'weekly': startDate.setDate(now.getDate() - 7); break;
      case 'monthly': startDate.setMonth(now.getMonth() - 1); break;
      case 'quarterly': startDate.setMonth(now.getMonth() - 3); break;
      case 'semiannual': startDate.setMonth(now.getMonth() - 6); break;
      case 'annual': startDate.setFullYear(now.getFullYear() - 1); break;
    }

    const filtered = candidates.filter(c => {
      const pDate = c.purchaseDate || Date.now();
      return pDate >= startDate.getTime();
    });
    
    const totalRevenue = filtered.length * UNIFIED_EXAM_PRICE;
    
    const chartData: Record<string, number> = {};
    filtered.forEach(c => {
      const date = new Date(c.purchaseDate || Date.now());
      const key = financialPeriod === 'weekly' ? date.toLocaleDateString() : `${date.getMonth()+1}/${date.getFullYear()}`;
      chartData[key] = (chartData[key] || 0) + UNIFIED_EXAM_PRICE;
    });

    return { filtered, totalRevenue, chartData };
  };

  const handleUnlockCandidate = async (email: string) => {
    if (!window.confirm(`UNLOCK CANDIDATE?\n\nThis will allow ${email} to retake the exam immediately, bypassing the waiting period.\n\nPrevious history (score/failure) will be cleared.`)) return;

    const updated = candidates.map(u => {
      if (u.email === email) {
        return {
          ...u,
          examCompleted: false,
          score: undefined,
          failureReason: undefined,
          certificateCode: undefined
        };
      }
      return u;
    });
    
    setCandidates(updated);
    await storageService.saveUsers(updated);
    alert('Candidate unlocked successfully!');
  };

  const handleResetSales = async () => {
    if (!window.confirm('WARNING: FACTORY RESET\n\nThis will PERMANENTLY DELETE all registered candidates and financial history.\n\nThe system will return to initial state (no students).\n\nDo you want to continue?')) return;

    const updated: User[] = [];
    setCandidates(updated);
    await storageService.saveUsers(updated);
    window.location.reload();
  };

  const exportFinancialReport = () => {
    const { filtered, totalRevenue } = getFinancialData();
    const csvContent = [
      ['Date', 'Candidate', 'Email', 'Value', 'Status'],
      ...filtered.map(c => [
        new Date(c.purchaseDate!).toLocaleDateString(),
        c.fullName || 'N/A',
        c.email,
        UNIFIED_EXAM_PRICE.toFixed(2),
        'Paid'
      ]),
      ['', '', 'TOTAL', totalRevenue.toFixed(2), '']
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${financialPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredQuestions = (
    filterLevel === 'ALL' ? questions : questions.filter(q => q.level === filterLevel)
  ).filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase()))
   .sort((a, b) => {
      if (sortOrder === 'ASC') return (a.number || 0) - (b.number || 0);
      if (sortOrder === 'DESC') return (b.number || 0) - (a.number || 0);
      if (sortOrder === 'LEVEL_ASC') return a.level.localeCompare(b.level);
      if (sortOrder === 'LEVEL_DESC') return b.level.localeCompare(a.level);
      return 0;
   });

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 font-inter">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* HEADER MODERNO */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-16">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 w-full lg:w-auto">
            <h1 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">Management Portal</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">CEFR Exam Repository</p>
          </div>
          <div className="flex bg-white p-1 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto w-full lg:w-auto animate-in fade-in slide-in-from-right-4 duration-500 scrollbar-hide">
            <div className="flex min-w-max">
              <button onClick={() => setActiveTab('questions')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'questions' ? 'bg-[#0F172A] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Questions</button>
              <button onClick={() => setActiveTab('ai-import')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'ai-import' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>AI Import</button>
              <button onClick={() => setActiveTab('sales')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'sales' ? 'bg-[#0F172A] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Students</button>
              <button onClick={() => setActiveTab('finance')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'finance' ? 'bg-[#0F172A] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Finance</button>
              <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#0F172A] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Layout</button>
            </div>
          </div>
        </div>

        {activeTab === 'questions' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* BARRA DE FILTROS & AÇÃO */}
            <div className="flex flex-col gap-6">
              {/* ROW 1: ACTIONS (Aligned Right) */}
              <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3 w-full">
                <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#0F172A] text-white px-6 py-3 lg:py-2 rounded-[1rem] font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 group w-full sm:w-auto">
                  <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" /> Add Record
                </button>
                <button onClick={() => setShowAiGeneratorModal(true)} className="bg-indigo-600 text-white px-6 py-3 lg:py-2 rounded-[1rem] font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
                  <Sparkles className="w-3.5 h-3.5" /> Generate with AI
                </button>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                  <button onClick={() => { const all = Object.fromEntries(questions.map(q => [q.id, true])); setSelected(all); }} className="px-4 py-2 rounded-[1rem] border border-slate-200 bg-white text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 whitespace-nowrap">Select All</button>
                  <button onClick={handleDeleteSelected} className="px-4 py-2 rounded-[1rem] border border-red-200 bg-white text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 whitespace-nowrap">Delete Selected</button>
                  <button onClick={handleDeleteAll} className="px-4 py-2 rounded-[1rem] border border-red-200 bg-white text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 whitespace-nowrap">Delete All</button>
                </div>
              </div>

              {/* ROW 2: FILTERS & SEARCH (Full Width) */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-2 lg:p-0.5 rounded-[1.5rem] border border-slate-200 shadow-sm w-full">
                <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 scrollbar-hide w-full lg:w-auto">
                 <button onClick={() => setFilterLevel('ALL')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${filterLevel === 'ALL' ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>All</button>
                 {Object.values(ProficiencyLevel).map(lvl => {
                   const styles = getLevelStyles(lvl);
                   return (
                     <button 
                       key={lvl} 
                       onClick={() => setFilterLevel(lvl)} 
                       className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-transparent shrink-0 ${filterLevel === lvl ? `${styles.sqBg} ${styles.sqText} border-current shadow-sm` : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        {lvl}
                      </button>
                   );
                 })}
                </div>
                <div className="flex items-center gap-2 px-4 border-t lg:border-t-0 lg:border-l border-slate-100 h-12 lg:h-8 w-full lg:w-auto pt-2 lg:pt-0">
                  <div className="relative group shrink-0">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">
                      <ArrowUpDown className="w-3 h-3" />
                      <span className="hidden sm:inline">{sortOrder === 'ASC' ? '1-9' : sortOrder === 'DESC' ? '9-1' : sortOrder === 'LEVEL_ASC' ? 'A-C' : 'C-A'}</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-50">
                      <button onClick={() => setSortOrder('ASC')} className={`w-full text-left px-3 py-2 rounded-xl text-[9px] font-black uppercase ${sortOrder === 'ASC' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>Ascending (1-9)</button>
                      <button onClick={() => setSortOrder('DESC')} className={`w-full text-left px-3 py-2 rounded-xl text-[9px] font-black uppercase ${sortOrder === 'DESC' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>Descending (9-1)</button>
                      <button onClick={() => setSortOrder('LEVEL_ASC')} className={`w-full text-left px-3 py-2 rounded-xl text-[9px] font-black uppercase ${sortOrder === 'LEVEL_ASC' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>Level (A-C)</button>
                      <button onClick={() => setSortOrder('LEVEL_DESC')} className={`w-full text-left px-3 py-2 rounded-xl text-[9px] font-black uppercase ${sortOrder === 'LEVEL_DESC' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>Level (C-A)</button>
                    </div>
                  </div>
                  <div className="w-px h-4 bg-slate-200 mx-2"></div>
                  <Search className="w-4 h-4 text-slate-300 shrink-0" />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-slate-700 font-medium w-full lg:w-48" />
                </div>
              </div>
            </div>

            {/* LISTAGEM PREMIUM */}
            <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] overflow-hidden">
               {/* Header - Hidden on Mobile */}
               <div className="hidden lg:grid grid-cols-12 gap-6 px-12 py-8 border-b border-slate-50 bg-slate-50/30">
                  <div className="col-span-2 flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <input type="checkbox" onChange={e => setSelected(Object.fromEntries(questions.map(q => [q.id, e.target.checked])))} className="w-4 h-4 border border-slate-300 rounded" />
                    Level/Section
                  </div>
                  <div className="col-span-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exam Prompt</div>
                  <div className="col-span-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Answer</div>
                  <div className="col-span-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</div>
               </div>
               
               <div className="divide-y divide-slate-50">
                  {filteredQuestions.map(q => {
                    const styles = getLevelStyles(q.level);
                    return (
                      <div key={q.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 p-6 lg:px-12 lg:py-10 items-start lg:items-center hover:bg-slate-50/50 transition-all group animate-in slide-in-from-left-2 duration-300">
                        
                        {/* Mobile Top Row: Checkbox + Level + ID */}
                        <div className="col-span-2 flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={!!selected[q.id]} onChange={e => setSelected(prev => ({ ...prev, [q.id]: e.target.checked }))} className="w-5 h-5 border border-slate-300 rounded" />
                            <span className="px-3 py-1 rounded-md border border-rose-300 bg-rose-100 text-rose-700 font-black text-xs">#{q.number ?? '-'}</span>
                            <span className={`w-12 h-12 lg:w-16 lg:h-16 aspect-square inline-flex items-center justify-center rounded-md font-black text-xs lg:text-sm border ${styles.sqBg} ${styles.sqText} ${styles.sqBorder} group-hover:scale-110 transition-transform`}>
                              {q.level}
                            </span>
                          </div>
                          {/* Section shown on mobile right side */}
                          <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                            {q.section}
                          </span>
                        </div>

                        {/* Desktop Section Label (Hidden on mobile as it's moved up) */}
                        <div className="hidden lg:block absolute left-[120px] mt-12 pointer-events-none">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                            {q.section}
                            {((q.section === 'LISTENING' && !q.audioUrl) || q.section !== 'LISTENING') && (
                              <Sparkles className="w-3 h-3 text-slate-300" />
                            )}
                          </span>
                        </div>

                        {/* Text Content */}
                        <div className="col-span-7 w-full">
                          <p className="text-sm lg:text-[15px] font-bold text-slate-800 leading-relaxed lg:pl-16 lg:pr-12 line-clamp-3 lg:line-clamp-2">{q.text}</p>
                        </div>

                        {/* Bottom Row on Mobile: Answer + Actions */}
                        <div className="flex items-center justify-between w-full lg:contents">
                            {/* Answer */}
                            <div className="col-span-1">
                              <div className="flex items-center gap-2 justify-start">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 lg:hidden">Answer:</span>
                                <span className="px-3 py-1 rounded-md bg-emerald-600 text-white font-black text-xs">
                                  {String.fromCharCode(65 + (typeof q.correctAnswer === 'number' ? q.correctAnswer : 0))}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex justify-end gap-2 lg:gap-3">
                              <button 
                                onClick={() => { setEditingQuestion(q); setFormData(q); setShowModal(true); }} 
                                className="p-2 lg:p-3.5 bg-white border border-slate-100 rounded-xl lg:rounded-2xl text-slate-300 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDuplicateQuestion(q)} 
                                className="p-2 lg:p-3.5 bg-white border border-slate-100 rounded-xl lg:rounded-2xl text-slate-300 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteQuestion(q.id)} 
                                className="p-2 lg:p-3.5 bg-white border border-slate-100 rounded-xl lg:rounded-2xl text-slate-300 hover:text-red-600 hover:border-red-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredQuestions.length === 0 && (
                    <div className="py-40 flex flex-col items-center opacity-30">
                       <Search className="w-12 h-12 mb-4" />
                       <p className="font-black uppercase text-[10px] tracking-widest">No questions found</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* AI IMPORT TAB */}
        {activeTab === 'ai-import' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5">
                  <BrainCircuit className="w-64 h-64 text-indigo-600" />
                </div>
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-50 rounded-full text-indigo-600 mb-10">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Engine</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <button onClick={() => setAiProvider('gemini')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${aiProvider==='gemini' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>Gemini</button>
                    <button onClick={() => setAiProvider('openai')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${aiProvider==='openai' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>OpenAI</button>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Neural Importer</h2>
                  <p className="text-slate-400 font-medium mb-12 max-w-lg mx-auto leading-relaxed">Save curation time. Our AI analyzes raw texts and generates structured questions instantly.</p>
                  
                  <textarea 
                    value={rawContent} 
                    onChange={e => setRawContent(e.target.value)} 
                    placeholder="Paste your teaching material or article here..." 
                    className="w-full h-80 p-10 bg-slate-50 border border-slate-200 rounded-[3rem] outline-none focus:ring-[12px] focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium text-slate-700 mb-10 resize-none shadow-inner" 
                  />
                  
                  <button 
                    onClick={handleSmartImport} 
                    disabled={isAiProcessing || !rawContent.trim()} 
                    className="w-full py-7 bg-[#0F172A] text-white font-black rounded-[2rem] hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-5 uppercase tracking-[0.3em] text-xs disabled:opacity-50 active:scale-95"
                  >
                    {isAiProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
                    {isAiProcessing ? 'Auditing Text...' : `Generate Questions via ${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'}`}
                  </button>
                  
                  {importTotal > 0 && (
                    <div className="mt-6 text-center">
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-indigo-600 h-3" style={{ width: `${Math.round((importProcessed / importTotal) * 100)}%` }}></div>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3">{importProcessed}/{importTotal} blocks • {importAdded} questions</p>
                    </div>
                  )}
                </div>
            </div>
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in duration-500">
             <div className="px-6 lg:px-12 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Financial Report</h3>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                   Total: {candidates.length} students
                </div>
             </div>
             
             {/* Desktop Table */}
             <div className="hidden lg:block overflow-x-auto">
               <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Certification</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CEFR Level</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Breakdown (R/L/U)</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Performance</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {candidates.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-12 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                {c.fullName ? c.fullName.charAt(0) : c.email.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-900">{c.fullName || 'User'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{c.email}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-12 py-6">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                             <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        </td>
                        <td className="px-12 py-6">
                          {c.certificateCode ? (
                             <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-widest">
                                <Award className="w-3 h-3" /> Issued
                             </span>
                          ) : c.examCompleted ? (
                             <div className="flex flex-col items-start gap-2">
                               <div className="flex items-center gap-2">
                                 <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-widest">
                                    <AlertTriangle className="w-3 h-3" /> Failed
                                 </span>
                                 <button 
                                   onClick={() => handleUnlockCandidate(c.email)}
                                   className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                   title="Unlock for retake"
                                 >
                                    <Sparkles className="w-3 h-3" />
                                 </button>
                               </div>
                               {c.failureReason && (
                                 <span className="text-[9px] font-bold text-red-400 uppercase tracking-tight max-w-[150px] leading-tight">
                                   {c.failureReason}
                                 </span>
                               )}
                             </div>
                          ) : (
                             <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold uppercase tracking-widest">
                                <Clock className="w-3 h-3" /> Pending
                             </span>
                          )}
                        </td>
                        <td className="px-12 py-6 text-center">
                          {c.score !== undefined ? (
                             <span className={`px-3 py-1 rounded-lg font-black text-xs ${c.score >= 85 ? 'bg-amber-100 text-amber-700' : c.score >= 60 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                               {c.score >= 85 ? 'C1' : c.score >= 60 ? 'B2' : 'Below B2'}
                             </span>
                          ) : '--'}
                        </td>
                        <td className="px-12 py-6 text-center">
                          {c.examHistory && c.examHistory.length > 0 && c.examHistory[c.examHistory.length - 1].breakdown ? (
                             <div className="flex justify-center gap-2">
                               <div title="Reading" className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                                 R: {c.examHistory[c.examHistory.length - 1].breakdown?.reading}%
                               </div>
                               <div title="Listening" className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-100">
                                 L: {c.examHistory[c.examHistory.length - 1].breakdown?.listening}%
                               </div>
                               <div title="Use of English" className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-[10px] font-bold border border-teal-100">
                                 U: {c.examHistory[c.examHistory.length - 1].breakdown?.useOfEnglish}%
                               </div>
                             </div>
                          ) : (
                             <span className="text-[10px] font-bold text-slate-300">N/A</span>
                          )}
                        </td>
                        <td className="px-12 py-6 text-right">
                          {c.score !== undefined ? (
                             <span className="text-xl font-black text-slate-900">{c.score}%</span>
                          ) : (
                             <span className="text-slate-300 font-bold text-xs">--</span>
                          )}
                        </td>
                        <td className="px-12 py-6 text-right">
                          {c.screenshots && c.screenshots.length > 0 ? (
                            <div className="flex justify-end gap-1">
                              {c.screenshots.slice(0, 3).map((shot, i) => (
                                <img key={i} src={shot} alt="Evidence" className="w-12 h-8 object-cover rounded border border-slate-200 hover:scale-150 transition-transform cursor-zoom-in" onClick={() => window.open(shot, '_blank')} />
                              ))}
                              {c.screenshots.length > 3 && (
                                <span className="w-8 h-8 flex items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-500 rounded border border-slate-200">+{c.screenshots.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No Records</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>

             {/* Mobile Cards for Sales */}
             <div className="lg:hidden flex flex-col divide-y divide-slate-100">
                {candidates.map(c => (
                  <div key={c.id} className="p-6 space-y-4">
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                              {c.fullName ? c.fullName.charAt(0) : c.email.charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{c.fullName || 'User'}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{c.email}</p>
                           </div>
                        </div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                           <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                     </div>

                     <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Score</span>
                        <div className="flex items-center gap-3">
                           {c.score !== undefined ? (
                              <>
                                 <span className="text-lg font-black text-slate-900">{c.score}%</span>
                                 <span className={`px-2 py-0.5 rounded-lg font-black text-[10px] ${c.score >= 85 ? 'bg-amber-100 text-amber-700' : c.score >= 60 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {c.score >= 85 ? 'C1' : c.score >= 60 ? 'B2' : 'Fail'}
                                 </span>
                              </>
                           ) : <span className="text-slate-300 font-bold text-xs">--</span>}
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</span>
                        {c.certificateCode ? (
                           <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-widest">
                              <Award className="w-3 h-3" /> Issued
                           </span>
                        ) : c.examCompleted ? (
                           <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-widest">
                                 <AlertTriangle className="w-3 h-3" /> Failed
                              </span>
                              <button onClick={() => handleUnlockCandidate(c.email)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                 <Sparkles className="w-3 h-3" />
                              </button>
                           </div>
                        ) : (
                           <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold uppercase tracking-widest">
                              <Clock className="w-3 h-3" /> Pending
                           </span>
                        )}
                     </div>

                     {c.examHistory && c.examHistory.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                           <div className="bg-blue-50 text-blue-700 p-2 rounded-lg text-center border border-blue-100">
                              <span className="block text-[8px] font-black uppercase opacity-60">Reading</span>
                              <span className="font-bold text-xs">{c.examHistory[c.examHistory.length - 1].breakdown?.reading}%</span>
                           </div>
                           <div className="bg-purple-50 text-purple-700 p-2 rounded-lg text-center border border-purple-100">
                              <span className="block text-[8px] font-black uppercase opacity-60">Listening</span>
                              <span className="font-bold text-xs">{c.examHistory[c.examHistory.length - 1].breakdown?.listening}%</span>
                           </div>
                           <div className="bg-teal-50 text-teal-700 p-2 rounded-lg text-center border border-teal-100">
                              <span className="block text-[8px] font-black uppercase opacity-60">Use of Eng</span>
                              <span className="font-bold text-xs">{c.examHistory[c.examHistory.length - 1].breakdown?.useOfEnglish}%</span>
                           </div>
                        </div>
                     )}
                  </div>
                ))}
                {candidates.length === 0 && (
                   <div className="p-12 text-center opacity-30">
                      <p className="font-black uppercase text-[10px] tracking-widest">No candidates yet</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             {/* Controls */}
             <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                   {['weekly', 'monthly', 'quarterly', 'semiannual', 'annual'].map((p) => (
                      <button 
                        key={p}
                        onClick={() => setFinancialPeriod(p as any)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${financialPeriod === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : p === 'quarterly' ? 'Quarterly' : p === 'semiannual' ? 'Semiannual' : 'Annual'}
                      </button>
                   ))}
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                  <button 
                    onClick={exportFinancialReport}
                    className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                  >
                     <Download className="w-4 h-4" /> Export CSV
                  </button>
                  <button 
                    onClick={handleResetSales}
                    className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95"
                    title="Clear sales data (testing only)"
                  >
                     <Trash2 className="w-4 h-4" /> Reset Sales
                  </button>
                </div>
             </div>

             {/* Stats Cards */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total Revenue</p>
                   <p className="text-4xl font-black text-slate-900">${getFinancialData().totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Sales</p>
                   <p className="text-4xl font-black text-slate-900">{getFinancialData().filtered.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Average Ticket</p>
                   <p className="text-4xl font-black text-slate-900">${getFinancialData().filtered.length ? UNIFIED_EXAM_PRICE.toFixed(2) : '0.00'}</p>
                </div>
             </div>

             {/* Chart Area */}
             <div className="bg-white p-6 lg:p-12 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-8 lg:mb-12">
                   <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <BarChart2 className="w-6 h-6 text-indigo-600" /> Financial Balance
                   </h3>
                </div>
                
                <div className="overflow-x-auto pb-4">
                  <div className="h-64 flex items-end justify-between gap-4 min-w-[600px] lg:min-w-0">
                     {Object.entries(getFinancialData().chartData).length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase text-xs tracking-widest">
                           No data for period
                        </div>
                     ) : (
                        Object.entries(getFinancialData().chartData).map(([label, value], i) => {
                           const maxVal = Math.max(...Object.values(getFinancialData().chartData));
                           const height = (value / maxVal) * 100;
                           return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-3 group min-w-[40px]">
                                 <div className="w-full bg-indigo-50 rounded-t-2xl relative overflow-hidden group-hover:bg-indigo-100 transition-all" style={{ height: `${height}%` }}>
                                    <div className="absolute bottom-0 w-full bg-indigo-600 h-2 opacity-20"></div>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg transition-all whitespace-nowrap">
                                       ${value.toFixed(2)}
                                    </div>
                                 </div>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{label}</span>
                              </div>
                           );
                        })
                     )}
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl animate-in fade-in duration-500">
             <h2 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-5">
               <ImageIcon className="w-10 h-10 text-indigo-600" /> Certificate Design
             </h2>
             <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Background Image Endpoint (Oxford Template)</label>
                  <input 
                    type="url" 
                    value={settings.certTemplateUrl} 
                    onChange={e => setSettings({...settings, certTemplateUrl: e.target.value})} 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold text-slate-700 transition-all" 
                    placeholder="https://example.com/background.png" 
                  />
                </div>
                <button 
                  onClick={() => { storageService.saveSettings(settings); alert('Settings saved!'); }} 
                  className="bg-[#0F172A] text-white px-14 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 shadow-2xl transition-all active:scale-95"
                >
                  Confirm Changes
                </button>
                <div className="aspect-[1.414/1] bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem] overflow-hidden flex items-center justify-center relative shadow-inner">
                   {settings.certTemplateUrl ? (
                     <img src={settings.certTemplateUrl} className="w-full h-full object-contain" alt="Certificate Preview" />
                   ) : (
                     <p className="text-slate-300 font-black uppercase text-xs tracking-[0.4em]">Waiting for Media</p>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO / CRIAÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] w-full max-w-3xl shadow-2xl p-12 lg:p-16 my-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-16">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {editingQuestion ? 'Configure Question' : 'New Record'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">CEFR Evaluation Infrastructure</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 hover:bg-slate-100 rounded-full transition-all active:scale-90">
                <X className="w-7 h-7 text-slate-300" />
              </button>
            </div>
            
            <form onSubmit={handleSaveQuestion} className="space-y-12">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Difficulty Level</label>
                  <div className="relative">
                    <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as ProficiencyLevel})} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-900 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all appearance-none cursor-pointer">
                      {Object.values(ProficiencyLevel).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Target Competency</label>
                  <div className="relative">
                    <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value as SectionType})} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-900 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all appearance-none cursor-pointer">
                      {Object.values(SectionType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {(formData.section === SectionType.LISTENING) && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">
                    <Music className="w-4 h-4 text-indigo-600" /> Audio Resource (Direct URL)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input type="url" value={formData.audioUrl} onChange={e => { setFormData({...formData, audioUrl: e.target.value}); }} className="w-full p-6 pl-16 bg-slate-50 border border-slate-200 rounded-3xl font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all" placeholder="https://cdn.example.com/audio.mp3" />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Prompt Body</label>
                <textarea required value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] h-48 font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all leading-relaxed shadow-inner" placeholder="Write the question or exam context..." />
              </div>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Answer Key & Alternatives</label>
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> Select official answer</span>
                </div>
                
                {formData.options?.map((opt, i) => (
                  <div key={i} className="flex gap-6 items-center">
                    <div 
                      onClick={() => setFormData({...formData, correctAnswer: i})}
                      className={`flex-grow cursor-pointer p-6 rounded-3xl border-2 transition-all flex items-center gap-6 relative overflow-hidden active:scale-[0.98] ${formData.correctAnswer === i ? 'border-emerald-500 bg-emerald-50/20 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-[1rem] flex items-center justify-center font-black text-xs transition-all ${formData.correctAnswer === i ? 'bg-emerald-600 text-white shadow-xl' : 'bg-slate-50 text-slate-300'}`}>
                        {String.fromCharCode(65+i)}
                      </div>
                      <input 
                        required 
                        value={opt} 
                        onClick={e => e.stopPropagation()}
                        onChange={e => { const n = [...formData.options!]; n[i] = e.target.value; setFormData({...formData, options: n}); }} 
                        className="flex-grow bg-transparent outline-none font-black text-slate-800" 
                        placeholder={`Option ${String.fromCharCode(65+i)}`}
                      />
                      {formData.correctAnswer === i && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                           <CheckCircle2 className="w-7 h-7 text-emerald-600 fill-emerald-100" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12 flex flex-col sm:flex-row gap-6">
                <button type="submit" className="flex-grow py-7 bg-[#0F172A] text-white font-black rounded-[2rem] uppercase tracking-[0.3em] text-xs hover:bg-indigo-600 transition-all shadow-2xl active:scale-95">Save to Database</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-14 py-7 border border-slate-200 text-slate-400 font-bold rounded-[2rem] uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-colors">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE GERAÇÃO IA */}
      {showAiGeneratorModal && (
        <div className="fixed inset-0 bg-[#0F172A]/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl p-12 lg:p-16 my-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Generative AI</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  Question Generator
                </h3>
                <p className="text-slate-400 font-medium mt-2 leading-relaxed">Define parameters and let AI create fresh content for your exams.</p>
              </div>
              <button onClick={() => setShowAiGeneratorModal(false)} className="p-4 hover:bg-slate-100 rounded-full transition-all active:scale-90">
                <X className="w-7 h-7 text-slate-300" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Target Level</label>
                  <div className="relative">
                    <select 
                      value={aiGenConfig.level} 
                      onChange={e => setAiGenConfig({...aiGenConfig, level: e.target.value as ProficiencyLevel})} 
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                    >
                      {Object.values(ProficiencyLevel).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Question Type</label>
                  <div className="relative">
                    <select 
                      value={aiGenConfig.section} 
                      onChange={e => setAiGenConfig({...aiGenConfig, section: e.target.value as SectionType})} 
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                    >
                      {Object.values(SectionType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Topic or Context (Optional)</label>
                <input 
                  value={aiGenConfig.topic} 
                  onChange={e => setAiGenConfig({...aiGenConfig, topic: e.target.value})} 
                  placeholder="e.g. Business Meetings, Environment, Travel..." 
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Quantity</label>
                <div className="flex items-center gap-4">
                  {[1, 3, 5, 10].map(n => (
                    <button 
                      key={n}
                      onClick={() => setAiGenConfig({...aiGenConfig, count: n})}
                      className={`flex-1 py-4 rounded-2xl font-black text-sm border transition-all ${aiGenConfig.count === n ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAiGeneration} 
                  disabled={isAiProcessing}
                  className="flex-grow py-6 bg-[#0F172A] text-white font-black rounded-[2rem] uppercase tracking-[0.3em] text-xs hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isAiProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isAiProcessing ? 'Creating Content...' : 'Generate Questions'}
                </button>
                <button onClick={() => setShowAiGeneratorModal(false)} className="px-10 py-6 border border-slate-200 text-slate-400 font-bold rounded-[2rem] uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;