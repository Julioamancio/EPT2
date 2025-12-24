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
              <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600" /> Official Proficiency Certification
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
              Validate your English for the<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-900">Global Market.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              B2 and C1 proficiency exams based on international academic rigor. 
              Instant results and real-time auditable certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/comprar" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-white bg-slate-900 hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all duration-300">
                Start Certification <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/verificar" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                Validate Document
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
                <GraduationCap className="w-5 h-5" /> Our Academic Standard
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Full Alignment with the Common European Framework (CEFR)
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our tests are not just assessments; they are precise linguistic audit tools. 
                By choosing between B2 and C1, you position yourself at the levels most required by multinationals and elite universities.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-bold">B2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Vantage / Upper Intermediate</h4>
                    <p className="text-xs text-slate-500 mt-1">Capacity to interact with fluency and spontaneity.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-bold">C1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Effective Operational Proficiency</h4>
                    <p className="text-xs text-slate-500 mt-1">Full command for complex academic and technical contexts.</p>
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
                title: "Evaluation Rigor", 
                desc: "Dynamic questions testing real language usage competencies in professional situations." 
              },
              { 
                icon: <CheckCircle className="w-6 h-6" />, 
                title: "Immediate Feedback", 
                desc: "The system instantly corrects your performance, issuing your score and area report." 
              },
              { 
                icon: <Award className="w-6 h-6" />, 
                title: "Authenticity Seal", 
                desc: "Digital certificates protected by encryption and publicly verifiable via QR Code." 
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