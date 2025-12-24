
import React from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle, Globe, FileCheck, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

const Home: React.FC = () => {
  const cefrImageUrl = "https://static.wixstatic.com/media/3f497e_bffb42df2be845cdabba2fb468fc1050~mv2.jpg/v1/fill/w_983,h_829,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/CEFR-Design_28_07_20.jpg";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section - Ultra Clean */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
              <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600" /> Certificação Oficial de Proficiência
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
              Valide seu Inglês para o<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-900">Mercado Global.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Exames de proficiência B2 e C1 baseados no rigor acadêmico internacional. 
              Resultados instantâneos e certificados auditáveis em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/comprar" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-white bg-slate-900 hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all duration-300">
                Iniciar Certificação <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/verificar" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                Validar Documento
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CEFR Educational Section - Building Trust */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-600/5 rounded-[2.5rem] blur-2xl"></div>
                <img 
                  src={cefrImageUrl} 
                  alt="CEFR Framework Levels" 
                  className="relative rounded-3xl shadow-2xl border border-white"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-4">
                <GraduationCap className="w-5 h-5" /> Nosso Padrão Acadêmico
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Alinhamento Total ao Quadro Comum Europeu (CEFR)
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Nossos testes não são apenas avaliações; são ferramentas de auditoria linguística precisas. 
                Ao escolher entre B2 e C1, você está se posicionando nos níveis mais exigidos por multinacionais e universidades de elite.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-bold">B2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Vantage / Upper Intermediate</h4>
                    <p className="text-xs text-slate-500 mt-1">Capacidade de interagir com fluência e espontaneidade.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-bold">C1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Effective Operational Proficiency</h4>
                    <p className="text-xs text-slate-500 mt-1">Domínio pleno para contextos acadêmicos e técnicos complexos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Minimalist */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: <FileCheck className="w-6 h-6" />, 
                title: "Rigor Avaliativo", 
                desc: "Questões dinâmicas que testam competências reais de uso da língua em situações profissionais." 
              },
              { 
                icon: <CheckCircle className="w-6 h-6" />, 
                title: "Feedback Imediato", 
                desc: "O sistema corrige seu desempenho instantaneamente, emitindo sua nota e relatório de áreas." 
              },
              { 
                icon: <Award className="w-6 h-6" />, 
                title: "Selo de Autenticidade", 
                desc: "Certificados digitais protegidos por criptografia e verificáveis publicamente via QR Code." 
              }
            ].map((f, i) => (
              <div key={i} className="group">
                <div className="w-14 h-14 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
