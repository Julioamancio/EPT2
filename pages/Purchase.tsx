
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Mail, Sparkles, Award, ShieldCheck, Search, ShieldAlert, AlertTriangle, CheckCircle2, Lock, Smartphone } from 'lucide-react';
import { ProficiencyLevel } from '../types';
import { UNIFIED_EXAM_PRICE } from '../constants';
import { storageService } from '../services/storageService';
import { stripePromise, STRIPE_CONFIG } from '../services/stripe';

const Purchase: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'info' | 'payment'>('info');
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const navigate = useNavigate();

  const handlePurchaseInit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Por favor, insira um e-mail válido para a auditoria.');
      return;
    }
    setPaymentStep('payment');
  };

  const handleCompletePayment = async () => {
    // Check if Stripe Payment Link is configured
    if (STRIPE_CONFIG.paymentUrl && STRIPE_CONFIG.paymentUrl.includes('http')) {
       setIsProcessing(true);
       setTransactionStatus('Iniciando Pagamento Seguro...');

       // Create pending user
       const pendingUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          password: Math.random().toString(36).substr(2, 8),
          purchasedLevel: ProficiencyLevel.B2, 
          examCompleted: false,
          purchaseDate: Date.now()
        };
        localStorage.setItem('pending_payment_user', JSON.stringify(pendingUser));

       const finalUrl = STRIPE_CONFIG.paymentUrl.trim();
       
       console.log('Redirecting to Stripe:', finalUrl);
       
       // Small delay to show the secure connection animation
       setTimeout(() => {
           window.location.href = finalUrl;
       }, 1500);
       return;
    }

    alert('ERRO CRÍTICO: Link de Pagamento não configurado. Contate o administrador.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-white min-h-screen relative">
      {/* GATEWAY OVERLAY - A PARTE FINANCEIRA REALISTA */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[300] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="max-w-md w-full text-center">
              <div className="relative mb-12">
                 <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full"></div>
                 <Loader2 className="w-20 h-20 text-indigo-600 animate-spin mx-auto relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Processando Pagamento</h3>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.3em] h-4">{transactionStatus}</p>
              
              <div className="mt-16 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600 animate-[loading_4.5s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
              </div>
              <p className="mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" /> Conexão Segura AES-256
              </p>
           </div>
        </div>
      )}

      <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6">Exame de Proficiência Unificado</h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed mb-8">
          Adquira seu acesso oficial. Nossa tecnologia de avaliação adapta-se ao seu desempenho, certificando você em B2 ou C1 automaticamente.
        </p>
        <button 
           onClick={() => setShowGuidelines(true)}
           className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-600 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
        >
           <ShieldAlert className="w-4 h-4 text-indigo-600" /> Ver Regulamento do Exame
        </button>
      </div>

      {/* MODAL DE DIRETRIZES */}
      {showGuidelines && (
        <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-xl z-[250] flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white max-w-2xl w-full rounded-[2.5rem] p-12 lg:p-16 relative shadow-2xl animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setShowGuidelines(false)}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-100 transition-colors"
              >
                <AlertTriangle className="w-6 h-6 text-slate-300" />
              </button>

              <div className="text-center mb-10">
                 <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                    <ShieldCheck className="w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Diretrizes de Auditoria</h2>
                 <p className="text-slate-500 font-medium mt-3">Regras mandatórias para a validação do seu certificado.</p>
              </div>

              <div className="space-y-6">
                 <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black text-lg shrink-0">1</div>
                    <div>
                       <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Foco na Aba</h4>
                       <p className="text-sm text-slate-600 leading-relaxed">O sistema monitora a janela do exame. <strong className="text-red-600">Alternar abas ou minimizar o navegador</strong> resultará em anulação imediata.</p>
                    </div>
                 </div>

                 <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shrink-0">2</div>
                    <div>
                       <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Ambiente Controlado</h4>
                       <p className="text-sm text-slate-600 leading-relaxed">Você deve estar sozinho em um ambiente silencioso. Ruídos excessivos ou múltiplas vozes podem ser flagrados pela auditoria de áudio (se ativada).</p>
                    </div>
                 </div>

                 <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg shrink-0">3</div>
                    <div>
                       <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Conectividade</h4>
                       <p className="text-sm text-slate-600 leading-relaxed">Garanta uma conexão estável. O cronômetro do servidor não para em caso de queda de internet local.</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setShowGuidelines(false)}
                className="w-full mt-12 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-indigo-600 transition-all shadow-xl"
              >
                Entendi as Regras
              </button>
           </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-[4rem] border border-slate-100 shadow-[0_50px_150px_-30px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col items-stretch lg:flex-row min-h-[700px]">
        {/* LADO VISUAL / INFORMAÇÕES */}
        <div className="lg:w-1/2 bg-[#F8FAFC] flex flex-col items-center justify-center p-12 lg:p-20 border-r border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
             <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-600 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-600 rounded-full blur-[100px]"></div>
          </div>

          <div className="w-full max-w-md bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 relative group mb-12">
            <div className="absolute -top-4 left-10 px-6 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl z-20">
              Certificação C1 Profissional
            </div>
            <div className="aspect-[1.414/1] rounded-[2rem] overflow-hidden mb-6 border border-slate-50 bg-slate-50 relative">
              <img 
                src="https://static.wixstatic.com/media/3f497e_0aa63bf19d684ef0abf36f8c13ad9f52~mv2.png/v1/fill/w_600,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/EPT%20CERTIFICATE%20(5).png" 
                alt="Template Certificado" 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
              />
            </div>
            <div className="flex items-center justify-between px-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Audit Verified</span>
               <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                 <CheckCircle2 className="w-4 h-4" /> Autenticidade Digital
               </div>
            </div>
          </div>

          <div className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] w-full max-w-md shadow-sm animate-pulse">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em]">Protocolo de Integridade</p>
            </div>
            <p className="text-[11px] text-red-700 leading-relaxed font-bold">
              ATENÇÃO: Este teste exige foco exclusivo. A detecção de saída da aba ou perda de foco do navegador anula a sessão imediatamente sem direito a reestorno.
            </p>
          </div>
        </div>

        {/* LADO DO CHECKOUT (A PARTE FINANCEIRA) */}
        <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col bg-white">
          {paymentStep === 'info' ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full">
              <div className="mb-12">
                <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
                  <span className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full"><Sparkles className="w-4 h-4" /> Acesso Imediato</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4">Escolha sua Vantagem</h2>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-7xl font-black text-slate-900">R$ {UNIFIED_EXAM_PRICE.toFixed(2)}</span>
                  <span className="text-slate-400 font-bold text-sm">Taxa Única</span>
                </div>
              </div>

              <div className="space-y-8 mb-16">
                <div className="flex items-start gap-6">
                  <div className="bg-emerald-50 p-4 rounded-2xl shrink-0 border border-emerald-100"><Award className="w-7 h-7 text-emerald-600" /></div>
                  <div>
                    <p className="font-black text-slate-800 text-sm uppercase tracking-tight">Avaliação Progressiva</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Sua nota define o selo final: 60-84% (B2) ou 85-100% (C1).</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="bg-amber-50 p-4 rounded-2xl shrink-0 border border-amber-100"><Smartphone className="w-7 h-7 text-amber-600" /></div>
                  <div>
                    <p className="font-black text-slate-800 text-sm uppercase tracking-tight">Mobile Optimized</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Realize o teste de qualquer dispositivo com estabilidade total.</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">E-mail para Credenciais</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.nome@institucional.com"
                      className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
                <button 
                  onClick={handlePurchaseInit}
                  className="w-full py-7 bg-[#0F172A] text-white font-black rounded-[2rem] hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-5 uppercase tracking-[0.3em] text-xs active:scale-95"
                >
                  Ir para Pagamento <CreditCard className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full">
               <button onClick={() => setPaymentStep('info')} className="mb-10 text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors">
                 &larr; Voltar para detalhes
               </button>
               
               <h2 className="text-3xl font-black text-slate-900 mb-2">Checkout Seguro</h2>
               <p className="text-slate-400 font-medium mb-10 text-sm">Escolha seu processador de pagamento preferido.</p>
               
               <div className="space-y-6">
                  {/* STRIPE OPTION */}
                  <div className="p-8 border-2 border-indigo-600 bg-indigo-50/10 rounded-[2.5rem] relative cursor-pointer transition-all group" onClick={handleCompletePayment}>
                     <div className="flex items-center justify-between mb-4">
                        <span className="font-black text-slate-900 text-lg tracking-tight">Stripe</span>
                        <div className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest">Internacional</div>
                     </div>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Padrão global de segurança. Aceita Apple Pay, Google Pay e cartões internacionais.</p>
                     <div className="flex gap-2 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                        <div className="h-6 w-10 bg-slate-800 rounded"></div>
                        <div className="h-6 w-10 bg-slate-800 rounded"></div>
                        <div className="h-6 w-10 bg-slate-800 rounded"></div>
                     </div>
                  </div>

                  <div className="bg-emerald-50 p-6 rounded-2xl flex items-start gap-4 border border-emerald-100 mt-8">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800 leading-tight uppercase tracking-tight mb-1">
                        Pagamento 100% Seguro
                      </p>
                      <p className="text-[10px] text-emerald-700 leading-relaxed">
                        Seus dados são criptografados e processados diretamente pelo Stripe. Não armazenamos informações de cartão.
                      </p>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Purchase;
