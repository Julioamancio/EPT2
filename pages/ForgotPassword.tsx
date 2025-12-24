
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const users = await storageService.getUsers();
      const user = users.find(u => u.email === email);

      if (user) {
        setMessage({
          type: 'success',
          text: `Success! We have sent instructions to ${email}. (Simulation: Your current password is: ${user.password})`
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Email not found in our database.'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="text-indigo-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Recover Password</h1>
          <p className="text-slate-500 mt-2">Enter your email to receive access credentials.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Registered Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="example@email.com"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Recover Access'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
