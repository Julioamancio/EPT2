
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PartyPopper, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [displayData, setDisplayData] = React.useState({
    email: searchParams.get('email') || '',
    pwd: searchParams.get('pwd') || '',
    level: searchParams.get('level') || 'Unified B2/C1'
  });

  React.useEffect(() => {
    // Check for pending user from Stripe redirect flow
    const pendingStr = localStorage.getItem('pending_payment_user');
    if (pendingStr) {
      try {
        const pendingUser = JSON.parse(pendingStr);
        
        // Save to permanent storage if not already there
        // Note: In a real app, this would happen via webhook
        import('../services/storageService').then(({ storageService }) => {
            const users = storageService.getUsers();
            const exists = users.find(u => u.email === pendingUser.email);
            
            if (!exists) {
                storageService.saveUsers([...users, pendingUser]);
            }
        });

        setDisplayData({
            email: pendingUser.email,
            pwd: pendingUser.password,
            level: 'Unified B2/C1'
        });
        
        // Clear pending data to prevent re-processing? 
        // Better to keep it briefly or rely on 'exists' check to prevent duplicates.
        // We will keep it so the user can see it if they refresh the success page.
      } catch (e) {
        console.error('Error processing pending user', e);
      }
    }
  }, []);

  const { email, pwd, level } = displayData;

  if (!email || !pwd) {
     return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Awaiting Confirmation...</h1>
            <p className="text-slate-600">If you just made the payment, please wait a moment or check your email.</p>
            <Link to="/" className="mt-8 inline-block text-indigo-600 font-bold hover:underline">Back to Home</Link>
        </div>
     );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
        <PartyPopper className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Payment Confirmed!</h1>
      <p className="text-lg text-slate-600 mb-12">Your journey towards {level} certification has begun. We have also sent the details to your email.</p>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-left mb-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" /> Your Access Credentials
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-500 uppercase">Email</span>
            <span className="text-lg font-mono font-semibold text-slate-900">{email}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-500 uppercase">Temporary Password</span>
            <span className="text-lg font-mono font-semibold text-slate-900">{pwd}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400 italic">* Keep this information safe. You will need it to take the test.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
          Go to Login <LogIn className="ml-2 w-5 h-5" />
        </Link>
        <Link to="/" className="inline-flex items-center justify-center px-8 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Success;
