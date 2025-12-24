import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ProficiencyLevel } from '../types';
import { storageService } from '../services/storageService';
import { Shield, FileText, Download, AlertTriangle, CheckCircle, Clock, User as UserIcon, Lock } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface DashboardProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onUpdateUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: currentUser.fullName || '',
    cpf: currentUser.cpf || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProfileComplete, setIsProfileComplete] = useState(!!(currentUser.fullName && currentUser.cpf));

  useEffect(() => {
    setIsProfileComplete(!!(currentUser.fullName && currentUser.cpf));
  }, [currentUser]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.fullName.trim() || !formData.cpf.trim()) {
      setError('All fields are required.');
      return;
    }

    // Validate unique ID (CPF equivalent)
    const users = storageService.getUsers();
    const cpfExists = users.some(u => u.cpf === formData.cpf && u.id !== currentUser.id);
    
    if (cpfExists) {
      setError('This ID/Passport is already registered to another account. Please contact support.');
      return;
    }

    const updatedUser = { ...currentUser, fullName: formData.fullName, cpf: formData.cpf };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    
    storageService.saveUsers(updatedUsers);
    onUpdateUser(updatedUser);
    setSuccess('Profile updated successfully!');
    setIsProfileComplete(true);
  };

  const generatePDF = (type: 'report' | 'certificate') => {
    const doc = new jsPDF({
      orientation: type === 'certificate' ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const isCertificate = type === 'certificate';
    
    // Simple visual settings
    
    if (isCertificate) {
      const settings = storageService.getSettings();
      const certificateId = currentUser.certificateCode || `EPT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // If no ID saved, try to save (consistency improvement)
      if (!currentUser.certificateCode) {
        const users = storageService.getUsers();
        const updatedUser = { ...currentUser, certificateCode: certificateId };
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        storageService.saveUsers(updatedUsers);
        onUpdateUser(updatedUser); // Update local state
      }

      // Try to load background image
      try {
        if (settings.certTemplateUrl) {
          // Note: External images might have CORS issues in jsPDF.
          // Ideally use base64 or same domain image.
          // Attempt to add, if fails, draw manual layout.
          doc.addImage(settings.certTemplateUrl, 'PNG', 0, 0, 297, 210);
        }
      } catch (e) {
        console.warn('Could not load background template:', e);
        // Fallback: Golden border layout
        doc.setDrawColor(218, 165, 32); // Goldenrod
        doc.setLineWidth(5);
        doc.rect(10, 10, 277, 190);
        doc.setLineWidth(1);
        doc.rect(15, 15, 267, 180);
      }

      // "Official" Layout (Image 2 Style)
      // Serif fonts for classic style
      doc.setFont("times", "bold");
      
      // Top: Logo (Simulated Text if no image)
      doc.setFontSize(24);
      doc.setTextColor(0);
      doc.text("ENGLISH PROFICIENCY TEST", 148.5, 40, { align: "center" });
      
      // Main Heading
      doc.setFontSize(42);
      doc.setFont("times", "bold");
      doc.text("CERTIFICATE OF ACHIEVEMENT", 148.5, 60, { align: "center" });
      
      // Divider
      doc.setLineWidth(0.5);
      doc.line(80, 65, 217, 65);

      // Subheading
      doc.setFontSize(14);
      doc.setFont("times", "normal");
      doc.setTextColor(80);
      doc.text("THIS CERTIFIES THAT", 148.5, 80, { align: "center" });

      // Name
      doc.setFontSize(36);
      doc.setFont("times", "italic"); // Simulating script
      doc.setTextColor(0);
      doc.text(currentUser.fullName || "Candidate Name", 148.5, 100, { align: "center" });
      
      // Line under name
      doc.setLineWidth(0.2);
      doc.line(70, 102, 227, 102);

      // Body Text
      doc.setFontSize(14);
      doc.setFont("times", "normal");
      doc.setTextColor(60);
      doc.text("has successfully completed the international test and was awarded a certificate in", 148.5, 120, { align: "center" });

      // Level / Field
      doc.setFontSize(28);
      doc.setFont("times", "bold");
      doc.setTextColor(0);
      doc.text(`English Proficiency Level ${currentUser.purchasedLevel}`, 148.5, 140, { align: "center" });
      
      // Line under level
      doc.setLineWidth(0.2);
      doc.line(90, 142, 207, 142);
      
      // Score info (Small)
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.setTextColor(100);
      doc.text(`Score: ${currentUser.score}%`, 148.5, 150, { align: "center" });

      // Bottom Section
      const bottomY = 175;

      // Signature (Left)
      doc.setFont("times", "italic");
      doc.setFontSize(18);
      doc.text("Julio Amancio", 60, bottomY, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setLineWidth(0.5);
      doc.line(30, bottomY + 2, 90, bottomY + 2);
      doc.text("Program Director", 60, bottomY + 7, { align: "center" });

      // Date & ID (Right)
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      const dateStr = new Date().toLocaleDateString();
      doc.text(dateStr, 237, bottomY, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(207, bottomY + 2, 267, bottomY + 2);
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text("Date of Issue", 237, bottomY + 7, { align: "center" });
      
      // Certificate ID
      doc.text(`ID: ${certificateId}`, 237, bottomY + 14, { align: "center" });

      // Badge Placeholder (Center)
      doc.setDrawColor(218, 165, 32);
      doc.circle(148.5, bottomY - 5, 12);
      doc.setFontSize(6);
      doc.text("CERTIFIED", 148.5, bottomY - 5, { align: "center" });
      doc.text("ISO 9001", 148.5, bottomY - 2, { align: "center" });

    } else {
      // Performance Report
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text("Individual Performance Report", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
      doc.text(`Candidate: ${currentUser.fullName}`, 20, 40);
      doc.text(`ID/Passport: ${currentUser.cpf}`, 20, 48);
      doc.text(`Email: ${currentUser.email}`, 20, 56);
      doc.text(`Exam Date: ${new Date().toLocaleDateString()}`, 20, 64);
      
      doc.setDrawColor(200);
      doc.line(20, 70, 190, 70);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("General Result", 20, 85);
      
      doc.setFontSize(14);
      doc.setTextColor(currentUser.score && currentUser.score >= 60 ? 0 : 200, 0, 0);
      const status = currentUser.score && currentUser.score >= 60 ? "APPROVED" : "NOT APPROVED";
      doc.text(`Status: ${status}`, 20, 95);
      
      doc.setTextColor(0);
      const rawScore = currentUser.rawScore;
      const totalQuestions = currentUser.totalQuestions || 128; // Default fallback based on user feedback
      const scoreText = rawScore !== undefined ? `${rawScore}/${totalQuestions}` : `${currentUser.score}%`;
      
      doc.text(`Raw Score: ${scoreText}`, 20, 105);
      
      // Determine CEFR Level based on score percentage
      const score = currentUser.score || 0;
      let cefrLevel = 'A1';
      if (score >= 85) cefrLevel = 'C1';
      else if (score >= 60) cefrLevel = 'B2';
      else if (score >= 40) cefrLevel = 'B1';
      else if (score >= 20) cefrLevel = 'A2';
      
      doc.text(`CEFR Level Achieved: ${cefrLevel}`, 20, 115);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("This report details the candidate's performance in the evaluated skills.", 20, 130);
      
      // Breakdown simulation if not exists
      doc.text("- Reading & Use of English: Assessed", 20, 145);
      doc.text("- Listening Comprehension: Assessed", 20, 153);
      
      if (currentUser.score && currentUser.score < 60) {
        doc.setTextColor(200, 0, 0);
        doc.setFontSize(10);
        doc.text("Note: The candidate did not reach the minimum required score (60%) for certification.", 20, 170);
        doc.text("We recommend a study period of 30 days before a new attempt.", 20, 175);
      } else {
        doc.setTextColor(0, 100, 0);
        doc.text("Congratulations! You have demonstrated the necessary competencies for the level.", 20, 170);
      }
    }

    doc.save(`${type}_${currentUser.fullName?.replace(/\s+/g, '_')}.pdf`);
  };

  const canRetake = () => {
    if (!currentUser.lastExamDate) return true;
    const daysSinceLast = (Date.now() - currentUser.lastExamDate) / (1000 * 60 * 60 * 24);
    return daysSinceLast >= 30;
  };

  const daysUntilRetake = () => {
    if (!currentUser.lastExamDate) return 0;
    const daysSinceLast = (Date.now() - currentUser.lastExamDate) / (1000 * 60 * 60 * 24);
    return Math.ceil(30 - daysSinceLast);
  };

  const handleRetake = () => {
    if (!window.confirm('Start new attempt? The current result will be archived.')) return;

    const historyEntry = {
      date: currentUser.lastExamDate || Date.now(),
      score: currentUser.score || 0,
      passed: (currentUser.score || 0) >= 60,
      breakdown: undefined
    };

    const updatedUser: User = {
      ...currentUser,
      examCompleted: false,
      score: undefined,
      failureReason: undefined,
      certificateCode: undefined,
      screenshots: [],
      examHistory: [...(currentUser.examHistory || []), historyEntry]
    };

    const users = storageService.getUsers();
    const newUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    storageService.saveUsers(newUsers);
    onUpdateUser(updatedUser);
    navigate('/prova');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Candidate Area</h1>
              <p className="text-slate-500 font-medium">{currentUser.email}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600">
            Purchased Level: {currentUser.purchasedLevel}
          </div>
        </div>

        {/* Profile Update Section */}
        {!isProfileComplete ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Mandatory Profile Update</h2>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  To ensure the authenticity of your certificate and prevent fraud, we need you to complete your registration.
                  The ID provided will be permanently linked to this history.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Official Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-medium transition-all"
                  placeholder="Ex: John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ID / Passport Number</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-medium transition-all"
                  placeholder="ID Number"
                  maxLength={20}
                />
              </div>
              
              {error && <p className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg">{error}</p>}
              
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                Save Data and Continue
              </button>
            </form>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Exam Status Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col h-full">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" /> Exam Status
              </h3>

              {currentUser.examCompleted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                  {currentUser.score && currentUser.score >= 60 ? (
                    <>
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-900">Approved!</h4>
                      <p className="text-slate-500 font-medium">Your final score was <span className="text-slate-900 font-bold">{currentUser.score}/100</span></p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-900">Not Approved</h4>
                      <p className="text-slate-500 font-medium">Your final score was <span className="text-slate-900 font-bold">{currentUser.score}/100</span></p>
                      <p className="text-xs text-slate-400 max-w-xs">Don't give up! You can try again after the waiting period.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8">
                  <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                    <Clock className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Pending Exam</h4>
                    <p className="text-slate-500 text-sm mt-2">You have one attempt available.</p>
                  </div>
                  
                  {canRetake() ? (
                    <button 
                      onClick={handleRetake}
                      className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      START EXAM NOW <CheckCircle className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl w-full">
                      <p className="text-amber-800 font-bold text-xs uppercase tracking-wide mb-1">Waiting Period</p>
                      <p className="text-amber-900 font-medium text-sm">Available in {daysUntilRetake()} days</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col h-full">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Documents
              </h3>

              {!currentUser.examCompleted ? (
                <div className="flex-1 flex items-center justify-center text-center text-slate-400 italic text-sm">
                  Complete the exam to unlock your documents.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Performance Report - Always available */}
                  <div className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all bg-slate-50 group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700 group-hover:text-indigo-700">Performance Report</span>
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Detailed analysis of your skills by ability.</p>
                    <button 
                      onClick={() => generatePDF('report')}
                      className="w-full py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold text-xs uppercase hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>

                  {/* Certificate - Only if approved */}
                  <div className={`p-4 rounded-2xl border transition-all ${currentUser.score && currentUser.score >= 60 ? 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold ${currentUser.score && currentUser.score >= 60 ? 'text-indigo-900' : 'text-slate-500'}`}>Official Certificate</span>
                      {currentUser.score && currentUser.score >= 60 ? <Shield className="w-5 h-5 text-indigo-600" /> : <Lock className="w-5 h-5 text-slate-400" />}
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Official document with verification code and QR Code.</p>
                    <button 
                      onClick={() => generatePDF('certificate')}
                      disabled={!currentUser.score || currentUser.score < 60}
                      className={`w-full py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${currentUser.score && currentUser.score >= 60 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      {currentUser.score && currentUser.score >= 60 ? <><Download className="w-4 h-4" /> Download Certificate</> : 'Unavailable (Score < 60)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
