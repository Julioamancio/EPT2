import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2, AlertCircle, ShieldCheck, Lock, User as UserIcon, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { storageService } from '../services/storageService';

interface LoginProps {
  onLogin: (email: string, level: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate network delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = await storageService.getUsers();
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        onLogin(user.email, user.purchasedLevel);
        if (user.examCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/prova');
        }
      } else {
        setError('Credentials do not match our records.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 flex flex-col items-center">
      <div className="w-full max-w-[440px]">
        {/* Portal Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-[2rem] mb-6 border border-indigo-100 shadow-sm">
            <Lock className="text-indigo-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Candidate Portal</h1>
          <p className="text-slate-500 mt-3 font-medium">Access your official evaluation area</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-800"></div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Access Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium placeholder-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  required
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium placeholder-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
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
              className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-slate-200 transition-all mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validating Access...</span>
                </>
              ) : (
                <>
                  <span>Enter Portal</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Footer inside Card */}
          <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">SSL Secure</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">24h Support</span>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
