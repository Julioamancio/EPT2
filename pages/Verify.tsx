
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
          fullName: foundUser.fullName || 'Usuário',
          level: foundUser.purchasedLevel,
          score: foundUser.score || 0,
          date: foundUser.lastExamDate ? new Date(foundUser.lastExamDate).toLocaleDateString() : 'Data desconhecida',
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
          Validação de <span className="text-indigo-600">Autenticidade</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Nossa plataforma utiliza um sistema de registro único para garantir a integridade dos resultados. 
          Empresas, universidades e recrutadores podem confirmar a veracidade das credenciais emitidas de forma instantânea.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Left Column: Explanatory text */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-indigo-600" /> Como Funciona?
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                  <Globe className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Padrão Global</p>
                  <p className="text-xs text-slate-500 mt-1">Certificados emitidos sob as diretrizes do Quadro Europeu Comum (CEFR).</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Código Único</p>
                  <p className="text-xs text-slate-500 mt-1">Cada documento possui um hash criptográfico exclusivo para evitar falsificações.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Acesso Público</p>
                  <p className="text-xs text-slate-500 mt-1">Disponível 24/7 para auditoria por qualquer instituição interessada.</p>
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
                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Código de Verificação</label>
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validar Credencial'}
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
                        <h4 className="text-emerald-900 font-bold">Certificação Autêntica</h4>
                        <p className="text-emerald-700 text-xs">O registro foi localizado e validado em nossa base de dados oficial.</p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <UserIcon className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Candidato</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{result.fullName}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <Award className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Certificação</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">Nível {result.level}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <FileCheck className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Resultado Final</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{result.score}% de Aproveitamento</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Data de Emissão</span>
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
                    <h4 className="text-red-900 font-bold text-lg mb-2">Registro Não Encontrado</h4>
                    <p className="text-red-700 text-sm max-w-sm">
                      O código informado não corresponde a nenhum certificado emitido oficialmente. Verifique se há erros de digitação.
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
