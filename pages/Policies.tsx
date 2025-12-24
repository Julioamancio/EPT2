import React from 'react';
import { ShieldCheck, AlertTriangle, RefreshCcw, ScrollText, CheckCircle2, XCircle } from 'lucide-react';

const Policies: React.FC = () => {
  return (
    <div className="bg-[#F8FAFC] py-16 font-inter text-slate-600">
      <div className="max-w-4xl mx-auto px-6 space-y-16">
        
        {/* Intro */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">Terms & Conditions</h1>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto">
            To ensure the integrity of our certifications and candidate satisfaction, we have established clear rules of conduct and refund policies.
          </p>
        </div>

        {/* Section 1: Exam Integrity */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl border border-slate-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-indigo-600" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full mb-8">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Anti-Fraud Protocol</span>
            </div>
            
            <h2 className="text-2xl font-black text-[#0F172A] mb-6">Exam Conduct Rules</h2>
            <p className="mb-8 leading-relaxed">
              The English Proficiency Certificate is a globally accepted official document. To maintain its value, we apply zero tolerance to cheating attempts. Failure to comply with any rule below will result in the <strong>immediate annulment</strong> of the exam without the right to a refund.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h3 className="font-black text-[#0F172A] mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" /> Strict Prohibitions
                </h3>
                <ul className="space-y-3 text-sm font-medium">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    Use of AI (ChatGPT, Gemini) or translators.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    Leaving the browser tab (focus monitoring).
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    Presence of third parties in the room.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    Use of unauthorized headphones.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h3 className="font-black text-[#0F172A] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Best Practices
                </h3>
                <ul className="space-y-3 text-sm font-medium">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                    Keep webcam on and face visible.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                    Be in a quiet and well-lit environment.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                    Have ID document ready.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                    Use a stable internet connection.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Refund */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl border border-slate-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <RefreshCcw className="w-64 h-64 text-emerald-600" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full mb-8">
              <ScrollText className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Warranty Policy</span>
            </div>

            <h2 className="text-2xl font-black text-[#0F172A] mb-6">Refunds & Cancellations</h2>
            <div className="prose prose-slate max-w-none font-medium">
              <p>
                We understand that unforeseen events happen. Our refund policy adheres to consumer protection standards and our quality commitment.
              </p>
              
              <div className="my-8 space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 font-black">1</div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] mb-1">7-Day Guarantee</h4>
                    <p className="text-sm">You can request a full refund within 7 days of purchase, provided the exam <strong>has not been started</strong>.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 font-black">2</div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] mb-1">Technical Issues</h4>
                    <p className="text-sm">If there is a proven platform failure preventing exam completion, we offer a free reschedule or full refund.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 text-red-500 font-black">X</div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] mb-1">Exceptions (No Refund)</h4>
                    <p className="text-sm text-red-500/80">
                      - Exam already completed (pass or fail).<br/>
                      - Annulment due to fraud or conduct violation.<br/>
                      - No-show or withdrawal after starting the timer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-2xl text-center">
                <p className="text-sm mb-4">To request support or refund, please contact:</p>
                <a href="mailto:support@ept-cert.com" className="inline-block px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
                  support@ept-cert.com
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Policies;