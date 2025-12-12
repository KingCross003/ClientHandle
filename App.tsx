import React, { useState, useRef, useCallback } from 'react';
import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { 
  Briefcase, 
  PenTool, 
  Video, 
  Check, 
  Download, 
  Sparkles, 
  Loader2,
  ChevronRight,
  Upload,
  User,
  Clock,
  Palette,
  Calendar,
  Image as ImageIcon,
  FileText,
  Globe,
  Share2
} from 'lucide-react';
import { ProjectType, ProjectData, PROJECT_TYPES, PROJECT_HANDLERS, DESIGNERS } from './types';
import { generateClientUpdate } from './services/geminiService';
import { PreviewCard } from './components/PreviewCard';
import { ProgressBar } from './components/ProgressBar';

const App: React.FC = () => {
  const [data, setData] = useState<ProjectData>({
    clientName: '',
    projectName: '',
    type: ProjectType.LOGO,
    completedSteps: [],
    progress: 0,
    customNotes: '',
    aiUpdateText: '',
    companyLogo: null,
    workingTime: '',
    projectHandler: PROJECT_HANDLERS[0].name,
    designer: 'Somnath Chowdhury',
    deadline: '',
    isDelayed: false,
    delayReason: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeSelect = (type: ProjectType) => {
    setData(prev => ({ 
      ...prev, 
      type, 
      completedSteps: [], 
      progress: 0,
      aiUpdateText: '' 
    }));
  };

  const toggleStep = (stepId: string) => {
    setData(prev => {
      const typeInfo = PROJECT_TYPES[prev.type];
      const exists = prev.completedSteps.includes(stepId);
      const newSteps = exists
        ? prev.completedSteps.filter(id => id !== stepId)
        : [...prev.completedSteps, stepId];
      
      const newProgress = Math.round((newSteps.length / typeInfo.steps.length) * 100);

      return { ...prev, completedSteps: newSteps, progress: newProgress };
    });
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value, 10);
    const typeInfo = PROJECT_TYPES[data.type];
    
    // Auto-calculate completed steps based on percentage for visual consistency
    const totalSteps = typeInfo.steps.length;
    const newCompletedSteps: string[] = [];
    
    if (totalSteps > 0) {
       typeInfo.steps.forEach((step, index) => {
         // Mark step as complete if progress covers it (simple threshold)
        if (newVal >= ((index + 1) / totalSteps) * 100) {
            newCompletedSteps.push(step.id);
        }
       });
    }

    setData(prev => ({ ...prev, progress: newVal, completedSteps: newCompletedSteps }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const text = await generateClientUpdate(data);
    setData(prev => ({ ...prev, aiUpdateText: text }));
    setIsGenerating(false);
  };

  const handleDownload = useCallback(async () => {
    if (cardRef.current === null) {
      return;
    }

    try {
      const element = cardRef.current;
      // Capture full height and width explicitly to avoid clipping
      const dataUrl = await toJpeg(element, { 
        quality: 0.95, 
        pixelRatio: 2, 
        backgroundColor: '#f8fafc', // Match bg-slate-50
        width: element.offsetWidth,
        height: element.scrollHeight // Uses scrollHeight to capture everything
      });
      
      const link = document.createElement('a');
      link.download = `${data.projectName || 'project'}-update.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  }, [data.projectName]);

  const handleDownloadPDF = useCallback(async () => {
    if (cardRef.current === null) {
      return;
    }

    try {
      const element = cardRef.current;
      // Use PNG for better quality in PDF
      const imgData = await toPng(element, { 
        quality: 1.0, 
        pixelRatio: 2, 
        backgroundColor: '#f8fafc', // Match bg-slate-50
        width: element.offsetWidth,
        height: element.scrollHeight 
      });

      // A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 0; // Full bleed
      const availableWidth = pdfWidth - (margin * 2);
      
      const ratio = availableWidth / imgProps.width;
      const imgHeight = imgProps.height * ratio;
      
      pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);
      pdf.save(`${data.projectName || 'project'}-update.pdf`);

    } catch (err) {
      console.error('Failed to download PDF', err);
    }
  }, [data.projectName]);

  const handleShareWhatsApp = async () => {
    if (cardRef.current === null) return;

    const typeLabel = PROJECT_TYPES[data.type].label;
    // Construct a nice summary message
    const text = `*Project Update: ${data.projectName || 'New Project'}*\n` +
                 `Client: ${data.clientName || 'Client'}\n` +
                 `Type: ${typeLabel}\n` +
                 `Status: ${data.progress}% Complete\n` +
                 `Deadline: ${data.deadline ? new Date(data.deadline).toLocaleDateString() : 'TBD'}\n\n` +
                 `*Latest Update:*\n${data.aiUpdateText || 'No detailed update generated yet.'}\n\n` +
                 `_Generated via Anexture TECH_`;

    try {
      // 1. Try Native Share (Mobile - supports images)
      if (navigator.share) {
        const element = cardRef.current;
        const dataUrl = await toJpeg(element, { 
            quality: 0.95, 
            pixelRatio: 2, 
            backgroundColor: '#f8fafc',
            width: element.offsetWidth,
            height: element.scrollHeight 
        });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${data.projectName || 'update'}.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
           await navigator.share({
             title: 'Project Update',
             text: text,
             files: [file]
           });
           return; 
        }
      }

      // 2. Fallback to WhatsApp Web (Text Only) if image share not supported
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error("Share failed", error);
      // Fallback if something goes wrong
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const currentTypeInfo = PROJECT_TYPES[data.type];

  // Helper to get icon component
  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'PenTool': return PenTool;
      case 'Package': return Briefcase; 
      case 'Video': return Video;
      case 'Globe': return Globe;
      case 'Image': return ImageIcon;
      default: return PenTool;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Controls */}
        <div className="space-y-6 animate-fade-in-up max-w-2xl mx-auto xl:mx-0 w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Anexture
              </span>
              <span className="text-sm font-medium text-slate-500 tracking-normal ml-2">Project Tracker</span>
            </h1>
            <p className="text-slate-500 mt-2">Design smart, professional updates for your clients in seconds.</p>
          </header>

          {/* Project Details */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
              Project Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Client Name</label>
                  <input
                    type="text"
                    value={data.clientName}
                    onChange={(e) => setData({ ...data, clientName: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Project Name</label>
                  <input
                    type="text"
                    value={data.projectName}
                    onChange={(e) => setData({ ...data, projectName: e.target.value })}
                    placeholder="e.g. Summer Campaign"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

               {/* Agency Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Project Handled By</label>
                   <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select 
                        value={data.projectHandler}
                        onChange={(e) => setData({...data, projectHandler: e.target.value})}
                        className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none text-sm"
                      >
                        {PROJECT_HANDLERS.map(handler => (
                          <option key={handler.name} value={handler.name}>{handler.name}</option>
                        ))}
                      </select>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lead Designer</label>
                   <div className="relative">
                      <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select 
                        value={data.designer}
                        onChange={(e) => setData({...data, designer: e.target.value})}
                        className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none text-sm"
                      >
                        {DESIGNERS.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Working Time / Duration</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={data.workingTime}
                      onChange={(e) => setData({ ...data, workingTime: e.target.value })}
                      placeholder="e.g. 2 Weeks"
                      className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                 <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Deadline Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={data.deadline}
                      onChange={(e) => setData({ ...data, deadline: e.target.value })}
                      className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

               {/* Delay Logic */}
               <div className="pt-2">
                 <div className="flex items-center gap-3 mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Delayed?</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={data.isDelayed}
                        onChange={(e) => setData({...data, isDelayed: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                 </div>
                 
                 {data.isDelayed && (
                   <div className="animate-fade-in-up">
                      <label className="block text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Reason for Delay / Comments</label>
                      <textarea 
                        className="w-full p-3 bg-red-50 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-sm min-h-[60px]"
                        placeholder="e.g. Waiting for high-res assets from client..."
                        value={data.delayReason}
                        onChange={(e) => setData({...data, delayReason: e.target.value})}
                      />
                   </div>
                 )}
               </div>

               {/* Logo Upload */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Logo</label>
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload} 
                  />
                  {data.companyLogo ? (
                    <div className="flex items-center justify-center gap-3">
                      <img src={data.companyLogo} alt="Logo" className="h-10 object-contain" />
                      <span className="text-xs text-indigo-600 font-medium">Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-xs text-slate-500">Upload your logo (Optional)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Project Type */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
              Project Type
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { type: ProjectType.LOGO, iconName: 'PenTool', label: 'Logo' },
                { type: ProjectType.PACKAGE, iconName: 'Package', label: 'Package' },
                { type: ProjectType.ADS, iconName: 'Video', label: 'Ads' },
                { type: ProjectType.WEBSITE, iconName: 'Globe', label: 'Website' },
                { type: ProjectType.POSTER, iconName: 'Image', label: 'Poster' },
              ].map((item) => {
                  const Icon = getIcon(item.iconName);
                  return (
                    <button
                    key={item.type}
                    onClick={() => handleTypeSelect(item.type)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                        data.type === item.type
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-105'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-200 hover:bg-white'
                    }`}
                    >
                    <Icon className={`w-5 h-5 mb-2 ${data.type === item.type ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-[10px] sm:text-xs font-bold text-center">{item.label}</span>
                    </button>
                  );
              })}
            </div>
          </section>

          {/* Progress Tracking */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">3</span>
                Track Progress
              </h2>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{data.progress}%</span>
            </div>
            
            <div className="mb-6">
              {data.type === ProjectType.LOGO ? (
                 <div className="px-2 py-4">
                    <label htmlFor="progress-slider" className="block text-sm font-medium text-slate-700 mb-2">
                      Work Completion Percentage
                    </label>
                    <div className="flex items-center gap-4">
                      <input 
                        id="progress-slider"
                        type="range" 
                        min="0" 
                        max="100" 
                        value={data.progress} 
                        onChange={handleProgressChange}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="w-16 text-right">
                         <span className="text-lg font-bold text-indigo-600">{data.progress}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Adjust the slider to reflect the current status of the logo design.</p>
                 </div>
              ) : (
                <div className="space-y-2">
                  {currentTypeInfo.steps.map((step) => (
                    <label key={step.id} className="flex items-center p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={data.completedSteps.includes(step.id)}
                          onChange={() => toggleStep(step.id)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-indigo-600 checked:bg-indigo-600"
                        />
                        <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className={`ml-3 text-sm font-medium transition-colors ${data.completedSteps.includes(step.id) ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Add more details (Optional)</label>
               <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm min-h-[80px]"
                  placeholder="e.g. Waiting for client feedback on color palette..."
                  value={data.customNotes}
                  onChange={(e) => setData({...data, customNotes: e.target.value})}
               />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {data.aiUpdateText ? 'Regenerate Update' : 'Generate Update'}
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 rounded-xl font-bold shadow-sm transform hover:-translate-y-0.5 transition-all"
              >
                <ImageIcon className="w-5 h-5" />
                Download JPG
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-white border-2 border-slate-200 text-slate-700 hover:border-red-600 hover:text-red-600 rounded-xl font-bold shadow-sm transform hover:-translate-y-0.5 transition-all"
              >
                <FileText className="w-5 h-5" />
                Download PDF
              </button>
            </div>

            <button
              onClick={handleShareWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold shadow-sm transform hover:-translate-y-0.5 transition-all"
            >
              <Share2 className="w-5 h-5" />
              Share to WhatsApp
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview & Output */}
        <div className="xl:sticky xl:top-8 h-fit space-y-6 animate-fade-in-up delay-100 flex flex-col items-center xl:items-start">
          <div className="bg-slate-200/50 p-6 rounded-3xl border border-slate-200/60 backdrop-blur-xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                Live Document Preview
                <ChevronRight className="w-4 h-4" />
              </h2>
               {/* Small header buttons */}
               <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-all shadow-sm"
                    title="Download JPG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="p-2 bg-white text-slate-500 border border-slate-200 hover:border-red-300 hover:text-red-600 rounded-lg transition-all shadow-sm"
                    title="Download PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="p-2 bg-[#25D366] text-white border border-transparent hover:bg-[#128C7E] rounded-lg transition-all shadow-sm"
                    title="Share to WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
            
            {/* The Actual Card Component - Rendered with a transform scale for better fit if needed, but here we just let it be big and scrollable if needed or scale down via CSS */}
            <div className="overflow-x-auto pb-4 w-full flex justify-center">
               <div className="origin-top transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-100 transition-transform">
                  <PreviewCard ref={cardRef} data={data} />
               </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-2">
              Preview is scaled to fit screen. Final output is full A4 quality.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;