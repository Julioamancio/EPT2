
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Purchase from './pages/Purchase';
import Success from './pages/Success';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Exam from './pages/Exam';
import Result from './pages/Result';
import Verify from './pages/Verify';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import { AuthState, ProficiencyLevel, User } from './types';
import { ADMIN_CREDENTIALS } from './constants';
import { storageService } from './services/storageService';
import { Shield } from 'lucide-react';

const ADMIN_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false
  });

  // Fixed: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to avoid "Cannot find namespace 'NodeJS'" error in browser environments.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUserLogin = (email: string, level: string) => {
    const users = storageService.getUsers();
    const user = users.find(u => u.email === email && u.purchasedLevel === level);
    if (user) {
      setAuthState({ user, isAdmin: false });
    }
  };

  const handleAdminLogin = (username: string, pwd: string) => {
    if (username === ADMIN_CREDENTIALS.username && pwd === ADMIN_CREDENTIALS.password) {
      setAuthState({ user: null, isAdmin: true });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuthState({ user: null, isAdmin: false });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const updateScore = (score: number) => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, examCompleted: true, score } : null
      }));
    }
  };

  // Lógica de Timeout para Admin
  useEffect(() => {
    const resetAdminTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      if (authState.isAdmin) {
        timeoutRef.current = setTimeout(() => {
          handleLogout();
          alert('Sessão administrativa expirada por inatividade para sua segurança.');
        }, ADMIN_TIMEOUT_MS);
      }
    };

    if (authState.isAdmin) {
      resetAdminTimer();
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      events.forEach(event => {
        document.addEventListener(event, resetAdminTimer);
      });

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        events.forEach(event => {
          document.removeEventListener(event, resetAdminTimer);
        });
      };
    }
  }, [authState.isAdmin]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar authState={authState} onLogout={handleLogout} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/comprar" element={<Purchase />} />
            <Route path="/sucesso" element={<Success />} />
            
            {/* Candidate Auth */}
            <Route 
              path="/login" 
              element={authState.user ? <Navigate to="/dashboard" /> : <Login onLogin={handleUserLogin} />} 
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard */}
            <Route 
              path="/dashboard" 
              element={authState.user ? <Dashboard currentUser={authState.user} onUpdateUser={(u) => setAuthState(prev => ({...prev, user: u}))} /> : <Navigate to="/login" />} 
            />
            
            {/* Exam Flow */}
            <Route 
              path="/prova" 
              element={
                authState.user ? (
                  authState.user.examCompleted ? <Navigate to="/dashboard" /> : <Exam currentUser={authState.user} onComplete={updateScore} />
                ) : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/resultado" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            <Route path="/verificar" element={<Verify />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={authState.isAdmin ? <Admin /> : <Navigate to="/admin/login" />} 
            />
            <Route 
              path="/admin/login" 
              element={authState.isAdmin ? <Navigate to="/admin" /> : <AdminLogin onLogin={handleAdminLogin} />} 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} English Proficiency Certificates. Todos os direitos reservados.
              </div>
              
              <div className="flex items-center gap-8">
                <Link to="/verificar" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                  Verificar Certificado
                </Link>
                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                <Link to="/admin/login" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors group">
                  <Shield className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  Portal Administrativo
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
