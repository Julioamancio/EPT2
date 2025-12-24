
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Loader2, ShieldCheck, FileWarning, XCircle, ChevronRight, GraduationCap, Printer } from 'lucide-react';
import { User, Certificate, ProficiencyLevel } from '../types';
import { storageService } from '../services/storageService';

interface ResultProps {
  currentUser: User;
}

const Result: React.FC<ResultProps> = ({ currentUser }) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [certTemplate, setCertTemplate] = useState('');
  
  const score = currentUser.score || 0;
  const finalLevel = score >= 85 ? ProficiencyLevel.C1 : ProficiencyLevel.B2;
  const isApproved = score >= 60;

  useEffect(() => {
    const settings = storageService.getSettings();
    setCertTemplate(settings.certTemplateUrl);

    if (!isApproved) return;

    const existingCerts = storageService.getCertificates();
    const userCert = existingCerts.find(c => c.userId === currentUser.id);
    
    if (!userCert) {
      const newCert: Certificate = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        fullName: currentUser.fullName || currentUser.email.split('@')[0].toUpperCase(),
        level: finalLevel,
        score,
        date: new Date().toLocaleDateString('pt-BR'),
        uniqueCode: Math.random().toString(36).substr(2, 10).toUpperCase(),
        isApproved: true
      };
      storageService.saveCertificates([...existingCerts, newCert]);
      setCertificate(newCert);
    } else {
      setCertificate(userCert);
    }
  }, [currentUser, isApproved, finalLevel]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen">
      <div className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] print:shadow-none print:border-none print:rounded-none">
        
        <div className={`p-16 text-center print:hidden ${isApproved ? (finalLevel === ProficiencyLevel.C1 ? 'bg-amber-50/40' : 'bg-indigo-50/40') : 'bg-red-50/40'}`}>
          <div className="mb-8 inline-block">
            {isApproved ? (
              <div className={`w-24 h-24 rounded-[2.2rem] flex items-center justify-center mx-auto shadow-2xl ${finalLevel === ProficiencyLevel.C1 ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}>
                <Award className="w-12 h-12" />
              </div>
            ) : (
              <div className="bg-red-500 text-white w-24 h-24 rounded-[2.2rem] flex items-center justify-center mx-auto shadow-2xl">
                <XCircle className="w-12 h-12" />
              </div>
            )}
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Avaliação Concluída</h1>
          <p className="text-xl text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            {isApproved 
              ? `Parabéns! Você foi certificado no nível internacional ${finalLevel}.`
              : `Resultado: Sua pontuação final foi de ${score}%, abaixo do mínimo para certificação.`}
          </p>
        </div>

        <div className="p-16 print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 print:hidden">
            <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Aproveitamento Final</p>
              <p className={`text-6xl font-black ${isApproved ? (finalLevel === ProficiencyLevel.C1 ? 'text-amber-500' : 'text-indigo-600') : 'text-red-500'}`}>{score}%</p>
            </div>
            <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Habilitação Obtida</p>
              <p className={`text-2xl font-black uppercase tracking-widest ${isApproved ? 'text-slate-900' : 'text-slate-300'}`}>
                {isApproved ? `Nível ${finalLevel}` : 'Não Habilitado'}
              </p>
              {isApproved && (
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Registro Auditado</span>
              )}
            </div>
          </div>

          {isApproved && certificate ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* ÁREA DO CERTIFICADO DINÂMICO COM FUNDO IMPORTADO */}
              <div className="relative group max-w-2xl mx-auto mb-16 print:max-w-none print:m-0 print:block overflow-hidden rounded-[2rem] print:rounded-none">
                <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity print:hidden"></div>
                
                <div className="relative w-full aspect-[1.414/1] bg-white shadow-2xl print:shadow-none overflow-hidden border border-slate-200">
                  {certTemplate ? (
                    <img src={certTemplate} className="w-full h-full object-contain" alt="Background" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center border-2 border-dashed">Aguardando Template...</div>
                  )}
                  
                  {/* OVERLAY DE DADOS DINÂMICOS - Posicionado centralmente para caber no modelo Oxford */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-[8%] text-center">
                    <div className="mt-[2%] space-y-[2vw] w-full">
                       <p className="text-[3vw] font-black text-slate-800 tracking-tight uppercase print:text-4xl">{certificate.fullName}</p>
                       <div className="space-y-[1vw]">
                         <p className="text-[1.2vw] font-medium text-slate-500 print:text-lg">concluiu com êxito o exame de proficiência nível</p>
                         <p className="text-[5vw] font-black text-slate-900 print:text-6xl leading-none">{certificate.level}</p>
                       </div>
                       
                       <div className="pt-[4vw] flex justify-center gap-[15%]">
                         <div className="text-center">
                            <p className="text-[0.7vw] font-black text-slate-400 uppercase tracking-widest print:text-[10px]">Data de Emissão</p>
                            <p className="text-[1.2vw] font-bold text-slate-700 print:text-lg">{certificate.date}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[0.7vw] font-black text-slate-400 uppercase tracking-widest print:text-[10px]">Autenticidade (Hash)</p>
                            <p className="text-[1.2vw] font-mono font-bold text-slate-700 print:text-lg">{certificate.uniqueCode}</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden print:hidden">
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                   <div>
                     <h3 className="text-2xl font-black flex items-center gap-3">
                       <GraduationCap className="text-indigo-400 w-6 h-6" /> Documento Pronto
                     </h3>
                     <p className="text-slate-400 font-medium mt-2 max-w-sm">Você pode imprimir agora ou salvar como PDF para o seu currículo.</p>
                   </div>
                   <div className="flex flex-col gap-4 w-full md:w-auto">
                      <button 
                        onClick={handlePrint} 
                        className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                      >
                        <Printer className="w-5 h-5" /> Imprimir / Salvar PDF
                      </button>
                      <div className="px-6 py-4 border border-slate-700 rounded-2xl text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-3 tracking-widest">
                        REGISTRO VÁLIDO: {certificate.uniqueCode}
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          ) : !isApproved && (
            <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center print:hidden">
              <div className="bg-red-100 text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileWarning className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Atenção Candidato</h3>
              <p className="text-red-700 text-sm leading-relaxed max-w-md mx-auto font-medium">
                Infelizmente, a pontuação obtida não é suficiente para a emissão da certificação de proficiência B2/C1. Recomendamos novos estudos e uma nova tentativa em 30 dias.
              </p>
            </div>
          )}
          
          <div className="mt-16 text-center print:hidden">
             <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all group">
               Retornar ao Portal Principal <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .max-w-4xl, .max-w-4xl * { visibility: visible; }
          .max-w-4xl { position: absolute; left: 0; top: 0; width: 100%; border: none !important; margin: 0 !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Result;
