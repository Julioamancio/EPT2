
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, ChevronLeft, Loader2, Volume2, Shield, ShieldAlert } from 'lucide-react';
import { ProficiencyLevel, Question, SectionType, User } from '../types';
import { storageService } from '../services/storageService';

interface ExamProps {
  currentUser: User;
  onComplete: (score: number) => void;
}

const Exam: React.FC<ExamProps> = ({ currentUser, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(99999); // High initial value to avoid premature timeout
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [annulled, setAnnulled] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // New state for start control
  const [capturedScreenshots, setCapturedScreenshots] = useState<string[]>([]);
  const [setupTimeLeft, setSetupTimeLeft] = useState(120);
  const [setupExpired, setSetupExpired] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountTimeRef = useRef(Date.now());
  
  const navigate = useNavigate();
  const submissionRef = useRef(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) || window.innerWidth < 768) {
        setIsMobile(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Countdown to start full screen exam (Desktop only)
  useEffect(() => {
    if (hasStarted || setupExpired || isMobile) return;
    
    const timer = setInterval(() => {
      setSetupTimeLeft(prev => {
        // Protection: Do not expire in the first 5 seconds of loading
        // This prevents instant annulments due to render delay or state
        if (Date.now() - mountTimeRef.current < 5000) {
           return prev; 
        }

        if (prev <= 1) {
          setSetupExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, setupExpired, isMobile]);

  const getQuestionDuration = (q: Question) => {
    if (q.subQuestions && q.subQuestions.length > 0) {
      return q.subQuestions.length * 45; // 45s per item in Matching
    }
    switch (q.section) {
      case SectionType.READING: return 300; // 5 min
      case SectionType.LISTENING: return 300; // 5 min
      case SectionType.USE_OF_ENGLISH: return 90; // 1.5 min
      default: return 60; // 1 min (Grammar, etc)
    }
  };

  // Function to capture screenshot from stream
  const captureScreen = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Reduce resolution to save storage (max 640px width)
      const scale = 640 / videoRef.current.videoWidth;
      canvas.width = 640;
      canvas.height = videoRef.current.videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // JPEG compression 0.5
        const base64 = canvas.toDataURL('image/jpeg', 0.5);
        setCapturedScreenshots(prev => [...prev, base64]);
      }
    }
  }, []);

  // Start screen sharing and full screen
  const handleStartSecureSession = async () => {
    try {
      // 1. Try Full Screen
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(err => {
          console.warn("Full screen blocked or not supported:", err);
          // We don't block if it fails, but it's ideal to warn
        });
      }

      // 2. Request Sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      
      // Monitor if user manually stops sharing
      stream.getVideoTracks()[0].onended = () => {
         // Just warn, but allow continuing
         console.warn("Screen sharing stopped by user.");
      };

      setHasStarted(true);
    } catch (err) {
      alert("It is mandatory to grant permissions (Full Screen + Sharing) to take the exam. Please try again.");
    }
  };

  // Central submission function
  const processSubmit = useCallback((forcedScore?: number, failureReason?: string) => {
    if (submissionRef.current) return;
    submissionRef.current = true;
    setIsSubmitting(true);
    
    // Stop stream
    if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setTimeout(() => {
      const users = storageService.getUsers();
      let finalScore = 0;
      let correct = 0;
      let totalItems = 0;

      if (forcedScore !== undefined) {
        finalScore = forcedScore;
        // Recalculate total items just for record
        questions.forEach(q => {
          if (q.subQuestions && q.subQuestions.length > 0) totalItems += q.subQuestions.length;
          else totalItems += 1;
        });
        correct = Math.round((finalScore / 100) * totalItems);
      } else {
        questions.forEach(q => { 
          if (q.subQuestions && q.subQuestions.length > 0) {
            totalItems += q.subQuestions.length;
            q.subQuestions.forEach(sq => {
              if (answers[sq.id] === sq.correctAnswer) correct++;
            });
          } else {
            totalItems += 1;
            if (answers[q.id] === q.correctAnswer) correct++; 
          }
        });
        finalScore = Math.round((correct / (totalItems || 1)) * 100);
      }
      
      const passed = finalScore >= 60; // B2 approval limit
      let reason = failureReason;
      if (!passed && !reason) {
        reason = 'Insufficient Performance (< 60%)';
      }

      const updatedUsers = users.map(u => 
        u.email === currentUser.email ? { 
          ...u, 
          examCompleted: true, 
          score: finalScore,
          rawScore: correct,
          totalQuestions: totalItems,
          failureReason: reason,
          certificateCode: passed && !reason ? Math.random().toString(36).substr(2, 9).toUpperCase() : undefined,
          screenshots: capturedScreenshots, // Save evidence
          lastExamDate: Date.now() // Register exam date for 30-day block
        } : u
      );
      storageService.saveUsers(updatedUsers);
      
      onComplete(finalScore);
      navigate('/dashboard', { replace: true });
    }, 2000);
  }, [questions, answers, currentUser, onComplete, navigate, capturedScreenshots]);

  // Integrity System (Proctoring)
  useEffect(() => {
    if (!hasStarted) return; 
    // Strictness removed as requested:
    // No more annulment for tab switching or focus loss.
    // Only monitoring via screenshots.
  }, [hasStarted]);

  useEffect(() => {
    const allQuestions = storageService.getQuestions();
    setQuestions(allQuestions);
  }, []);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex] && hasStarted) {
      setTimeLeft(getQuestionDuration(questions[currentIndex]));
    }
  }, [currentIndex, questions, hasStarted]);

  const handleNext = useCallback((isTimeout = false) => {
    // Capture evidence when advancing
    captureScreen();

    if (isTimeout && questions[currentIndex]) {
       // If time ran out, remove answers for current question to count as "blank"
       const q = questions[currentIndex];
       setAnswers(prev => {
         const next = { ...prev };
         if (q.subQuestions) {
           q.subQuestions.forEach(sq => delete next[sq.id]);
         } else {
           delete next[q.id];
         }
         return next;
       });
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      processSubmit();
    }
  }, [currentIndex, questions, processSubmit]);

  useEffect(() => {
    if (!hasStarted) return; // Do not start question timer before setup
    
    if (timeLeft <= 0 && questions.length > 0) { 
      handleNext(true); 
      return; 
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleNext, questions.length, hasStarted]);

  const handleSubmitRequest = () => {
    if (window.confirm('Do you wish to finish the exam now? Unanswered questions will not be scored.')) {
      processSubmit();
    }
  };

  if (questions.length === 0) return (
    <div className="flex flex-col items-center py-40 gap-4">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      <p className="font-bold text-slate-400">Configuring secure environment...</p>
    </div>
  );

  if (!hasStarted) {
    if (setupExpired && !isMobile) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
           <div className="text-center space-y-6">
              <ShieldAlert className="w-24 h-24 text-red-600 mx-auto" />
              <h1 className="text-4xl font-black text-red-900">Exam Annulled</h1>
              <p className="text-red-700 font-bold max-w-md mx-auto">You did not start full screen mode within the 120-second limit.</p>
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest text-xs">
                Restart Process
              </button>
           </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white max-w-2xl w-full rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500 relative">
           {/* Timer Badge - Only for Desktop */}
           {!isMobile && (
             <div className="bg-red-50 border-b border-red-100 p-6 text-center animate-pulse">
                <p className="text-red-600 font-black uppercase tracking-widest text-xs mb-2">Time Remaining for Setup</p>
                <div className="text-5xl font-black text-red-600 tabular-nums tracking-tighter">
                  {Math.floor(setupTimeLeft / 60)}:{(setupTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-red-400 font-bold text-[10px] mt-2 uppercase tracking-wide">If this counter reaches zero, the exam will be annulled.</p>
             </div>
           )}

           <div className="p-8 lg:p-12 space-y-8">
              <div className="text-center space-y-4">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure Environment Required</h1>
                 <p className="text-slate-500 font-medium leading-relaxed">
                   {isMobile ? 'To start the exam, click the button below.' : 'You need to activate full screen mode to proceed.'}
                 </p>
              </div>

              {!isMobile && (
                <div className="space-y-4">
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                      <p className="text-slate-800 font-bold text-sm uppercase tracking-wide">
                        Press the button below or use the shortcut:
                      </p>
                      <div className="flex justify-center gap-4">
                         <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Windows</span>
                            <kbd className="px-4 py-2 bg-white rounded-lg border border-slate-300 font-mono font-black text-slate-700 shadow-[0_4px_0_0_rgba(203,213,225,1)] active:shadow-none active:translate-y-1 transition-all">F11</kbd>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mac</span>
                            <kbd className="px-4 py-2 bg-white rounded-lg border border-slate-300 font-mono font-black text-slate-700 shadow-[0_4px_0_0_rgba(203,213,225,1)] active:shadow-none active:translate-y-1 transition-all">Cmd + Ctrl + F</kbd>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              <div className="pt-2">
                 <button 
                   onClick={isMobile ? () => setHasStarted(true) : handleStartSecureSession}
                   className="w-full py-6 bg-[#0F172A] text-white font-black rounded-2xl uppercase tracking-[0.2em] text-sm hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                 >
                   <Shield className="w-6 h-6" /> {isMobile ? 'Start Now' : 'ACTIVATE FULL SCREEN AND START'}
                 </button>
                 {!isMobile && (
                   <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                     The system will attempt to activate automatically upon clicking.
                   </p>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 min-h-screen">
      {/* Hidden Video for Capture */}
      <video ref={videoRef} className="hidden" autoPlay playsInline muted />
      
      <div className="bg-white border-b border-slate-100 p-6 rounded-t-[2.5rem] shadow-sm flex items-center justify-between sticky top-20 z-40">
        <div>
          <h1 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest">
            <Shield className="w-4 h-4 text-indigo-600" /> Proctoring Active
          </h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1">{currentUser.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 px-5 py-2.5 rounded-2xl text-white font-mono font-bold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
          </div>
          <button 
            onClick={handleSubmitRequest} 
            disabled={isSubmitting || annulled}
            className="bg-red-500 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg disabled:opacity-50"
          >
            Finish Exam
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-b-[2.5rem] overflow-hidden shadow-2xl relative min-h-[500px]">
        {(isSubmitting || annulled) && (
           <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6">
             {annulled ? <ShieldAlert className="w-16 h-16 text-red-600 animate-bounce" /> : <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />}
             <div className="text-center">
               <h3 className={`text-2xl font-black ${annulled ? 'text-red-600' : 'text-slate-900'}`}>{annulled ? 'Exam Annulled' : 'Auditing Responses'}</h3>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">{annulled ? 'Focus loss detected' : 'Generating CEFR certificate...'}</p>
             </div>
           </div>
        )}
        
        <div className="p-10 lg:p-16">
          <div className="flex items-center gap-4 mb-10">
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">{q.level} • {q.section}</span>
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Question {currentIndex+1}/{questions.length}</span>
          </div>

          {q.section === SectionType.LISTENING && q.audioUrl && (
            <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <audio controls className="w-full h-8" key={q.audioUrl}>
                <source src={q.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}

          <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">{q.text}</h2>

          {q.subQuestions && q.subQuestions.length > 0 ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* LEGEND FOR MATCHING */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Available Options</h4>
                <div className="flex flex-wrap gap-3">
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white text-xs font-black rounded-lg">{String.fromCharCode(65+i)}</span>
                      <span className="text-sm font-bold text-slate-700">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUESTIONS LIST */}
              <div className="space-y-4">
                {q.subQuestions.map((sq, idx) => (
                  <div key={sq.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="bg-white text-slate-500 border border-slate-200 w-8 h-8 flex items-center justify-center rounded-full text-xs font-black shrink-0 shadow-sm">{idx + 1}</span>
                      <p className="font-bold text-slate-800 text-base leading-relaxed">{sq.text}</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0">
                      {q.options.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setAnswers({ ...answers, [sq.id]: i })}
                          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all shrink-0 ${answers[sq.id] === i ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        >
                          {String.fromCharCode(65 + i)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {q.options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => setAnswers({...answers, [q.id]: i})} 
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-5 group ${answers[q.id] === i ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}`}
                >
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 transition-colors ${answers[q.id] === i ? 'bg-indigo-600 text-white border-2 border-indigo-600' : 'bg-white text-slate-700 border-2 border-slate-200 group-hover:border-indigo-300 group-hover:text-indigo-600'}`}>
                    {String.fromCharCode(65+i)}
                  </span>
                  <span className={`text-base font-medium leading-relaxed ${answers[q.id] === i ? 'text-indigo-900 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>{opt}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-50/50 p-8 flex justify-end">
          <button 
             onClick={() => handleNext(false)} 
             className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
          >
            {currentIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Exam;
