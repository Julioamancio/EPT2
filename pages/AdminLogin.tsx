import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, Key, User as UserIcon, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (u: string, p: string) => boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (onLogin(username, password)) {
        navigate('/admin');
      } else {
        setError('Access denied. Invalid administrative credentials.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all text-sm font-bold mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Public Portal
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
          <div className="p-10 lg:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-2xl mb-6 shadow-xl shadow-slate-200">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console</h1>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Restricted Area / Academic Management</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Master User</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input 
                    required
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all"
                    placeholder="admin_root"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input 
                    required
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 transition-all mt-4 uppercase tracking-widest text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Enter System</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Session protected by end-to-end encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;