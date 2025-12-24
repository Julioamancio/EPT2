
import React, { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Loader2, Award, Calendar, User as UserIcon, FileCheck, Globe, Fingerprint } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Certificate } from '../types';

const Verify: React.FC = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setSearched(false);
    
    setTimeout(() => {
      const users = storageService.getUsers();
      // Search across all users
      const foundUser = users.find(u => u.certificateCode && u.certificateCode.toUpperCase() === code.toUpperCase());
      
      if (foundUser) {
        setResult({
          id: foundUser.certificateCode!,
          userId: foundUser.id,
          fullName: foundUser.fullName || 'User',
          level: foundUser.purchasedLevel,
          score: foundUser.score || 0,
          date: foundUser.lastExamDate ? new Date(foundUser.lastExamDate).toLocaleDateString('en-US') : 'Unknown Date',
          uniqueCode: foundUser.certificateCode!,
          isApproved: (foundUser.score || 0) >= 60
        });
      } else {
        // Fallback to legacy certificates table if needed (though now we use users mostly)
        const certificates = storageService.getCertificates();
        const foundCert = certificates.find(c => c.uniqueCode === code.toUpperCase());
        setResult(foundCert || null);
      }

      setSearched(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:py-24">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
          Authenticity <span className="text-indigo-600">Validation</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Our platform uses a unique registration system to ensure the integrity of results.
          Companies, universities, and recruiters can confirm the veracity of issued credentials instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Left Column: Explanatory text */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-indigo-600" /> How It Works?
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                  <Globe className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Global Standard</p>
                  <p className="text-xs text-slate-500 mt-1">Certificates issued under the guidelines of the Common European Framework (CEFR).</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Unique Code</p>
                  <p className="text-xs text-slate-500 mt-1">Each document has a unique cryptographic hash to prevent forgery.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Public Access</p>
                  <p className="text-xs text-slate-500 mt-1">Available 24/7 for auditing by any interested institution.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Search and Results */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Verification Code</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input 
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: XH89K2J4L9"
                    className="block w-full pl-11 pr-4 py-4 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono tracking-widest uppercase"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading || !code}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validate Credential'}
              </button>
            </form>

            {searched && (
              <div className="mt-10 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                {result ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="bg-emerald-500 text-white p-2 rounded-full">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-emerald-900 font-bold">Authentic Certification</h4>
                        <p className="text-emerald-700 text-xs">The record was located and validated in our official database.</p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <UserIcon className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Candidate</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{result.fullName}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <Award className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Certification</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">Level {result.level}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <FileCheck className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Final Result</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{result.score}% Achievement</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Date of Issue</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{result.date}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-8 bg-red-50 rounded-2xl border border-red-100">
                    <div className="bg-red-100 text-red-600 p-3 rounded-full mb-4">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h4 className="text-red-900 font-bold text-lg mb-2">Record Not Found</h4>
                    <p className="text-red-700 text-sm max-w-sm">
                      The code provided does not correspond to any officially issued certificate. Please check for typing errors.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
