
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, User as UserIcon, ShieldCheck, Settings } from 'lucide-react';
import { AuthState } from '../types';

interface NavbarProps {
  authState: AuthState;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ authState, onLogout }) => {
  const logoUrl = "https://static.wixstatic.com/media/3f497e_17ecdccdd2ee436e91ba24ac31b73578~mv2.png/v1/crop/x_0,y_184,w_1563,h_1178/fill/w_129,h_96,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Blue%20and%20White%20Circle%20Surfing%20Club%20Logo.png";

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logoUrl} 
                alt="English Proficiency Certificates Logo" 
                className="h-10 w-auto group-hover:scale-105 transition-transform"
              />
              <span className="text-lg font-bold text-slate-900 tracking-tight leading-tight hidden sm:block">
                English Proficiency<br/><span className="text-indigo-600">Certificates</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/verificar" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden xs:block">
              Verify Certificate
            </Link>
            
            {!authState.user && !authState.isAdmin && (
              <div className="flex items-center gap-3">
                <Link to="/comprar" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden md:block">
                  Pricing
                </Link>
                <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                  Candidate Login
                </Link>
                <Link 
                  to="/admin/login" 
                  title="Administrative Access"
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                </Link>
              </div>
            )}

            {authState.user && (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="truncate max-w-[150px]">{authState.user.email}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 ml-2"
                >
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}

            {authState.isAdmin && (
              <div className="flex items-center gap-4">
                <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                  <LayoutDashboard className="w-4 h-4" /> Admin Console
                </Link>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
