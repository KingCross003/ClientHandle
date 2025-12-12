import React, { forwardRef } from 'react';
import { ProjectData, PROJECT_TYPES, PROJECT_HANDLERS } from '../types';
import { 
  CheckCircle2, 
  Activity, 
  Briefcase, 
  PlayCircle, 
  User, 
  Palette, 
  Calendar, 
  AlertTriangle,
  Sparkles,
  Zap,
  Globe,
  Image as ImageIcon,
  Layout
} from 'lucide-react';

interface PreviewCardProps {
  data: ProjectData;
}

export const PreviewCard = forwardRef<HTMLDivElement, PreviewCardProps>(({ data }, ref) => {
  const typeInfo = PROJECT_TYPES[data.type];
  const progress = data.progress;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlerInfo = PROJECT_HANDLERS.find(h => h.name === data.projectHandler);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  const formattedDeadline = data.deadline ? new Date(data.deadline).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric'
  }) : 'TBD';

  return (
    <div 
      ref={ref} 
      className="w-full mx-auto overflow-hidden flex flex-col font-sans text-slate-900 bg-slate-50 relative"
      style={{ 
        maxWidth: '800px', 
        aspectRatio: '1 / 1.414',
        minHeight: '1000px',
      }} 
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-purple-700 to-indigo-800 rounded-b-[40px]"></div>
      
      <div className="p-8 flex-grow flex flex-col h-full relative z-10 gap-6">
        
        {/* 1. Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-900/10 flex justify-between items-start">
           <div>
             <div className="flex items-center gap-2 mb-3">
               <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
                  Project Status
               </span>
               {data.isDelayed && (
                   <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100 animate-pulse">
                      Attention Needed
                   </span>
               )}
             </div>
             <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
               {data.projectName || 'Project Name'}
             </h1>
             <p className="text-slate-500 font-medium text-xl">
                {data.clientName || 'Client Name'}
             </p>
           </div>
           
           <div className="flex flex-col items-end">
             {data.companyLogo ? (
                <div className="h-20 w-20 bg-slate-50 rounded-2xl p-2 border border-slate-100 mb-2 flex items-center justify-center">
                   <img src={data.companyLogo} alt="Client Logo" className="w-full h-full object-contain" />
                </div>
             ) : (
                <div className="h-20 w-20 bg-slate-50 rounded-2xl border border-slate-100 mb-2 flex items-center justify-center text-slate-300">
                   <Layout className="w-10 h-10" />
                </div>
             )}
             <div className="flex items-center gap-1.5 text-slate-400 text-sm font-bold uppercase tracking-wider">
               <Calendar className="w-4 h-4" />
               {currentDate}
             </div>
           </div>
        </div>

        {/* 2. Metrics Row (Cards) */}
        <div className="grid grid-cols-3 gap-4">
            {/* Type Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
               <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-2">
                  {data.type === 'LOGO' && <Activity className="w-7 h-7" />}
                  {data.type === 'PACKAGE' && <Briefcase className="w-7 h-7" />}
                  {data.type === 'ADS' && <PlayCircle className="w-7 h-7" />}
                  {data.type === 'WEBSITE' && <Globe className="w-7 h-7" />}
                  {data.type === 'POSTER' && <ImageIcon className="w-7 h-7" />}
               </div>
               <div>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Project Type</div>
                 <div className="text-lg font-bold text-slate-800 leading-tight">{typeInfo.label}</div>
               </div>
            </div>

            {/* Deadline Card */}
            <div className={`rounded-2xl p-6 shadow-sm border flex flex-col justify-between h-40 ${data.isDelayed ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${data.isDelayed ? 'bg-white text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
                  {data.isDelayed ? <AlertTriangle className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
               </div>
               <div>
                 <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${data.isDelayed ? 'text-red-400' : 'text-slate-400'}`}>Deadline</div>
                 <div className={`text-lg font-bold leading-tight ${data.isDelayed ? 'text-red-700' : 'text-slate-800'}`}>{formattedDeadline}</div>
               </div>
            </div>

            {/* Manager Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2">
                  <User className="w-7 h-7" />
               </div>
               <div>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Project Handled By</div>
                 <div className="text-lg font-bold text-slate-800 leading-tight">{data.projectHandler}</div>
               </div>
            </div>
        </div>

        {/* 3. Main Content Grid */}
        <div className="flex-grow grid grid-cols-12 gap-6">
            
            {/* Left: Progress Track (Vertical) */}
            <div className="col-span-5 bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-bold text-slate-800 text-xl">Milestones</h3>
                   <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-md">{progress}% Done</span>
                </div>
                
                <div className="space-y-2 relative flex-grow">
                   <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-100"></div>
                   
                   {typeInfo.steps.map((step, idx) => {
                      const isCompleted = data.completedSteps.includes(step.id);
                      return (
                         <div key={step.id} className="relative flex items-center gap-5 py-3 group">
                            <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                               isCompleted 
                               ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200' 
                               : 'bg-white border-slate-200 text-slate-300'
                            }`}>
                               {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>
                            <div className={`text-base font-bold leading-tight transition-colors ${
                               isCompleted ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                               {step.label}
                            </div>
                         </div>
                      )
                   })}
                </div>
            </div>

            {/* Right: AI Update & Details */}
            <div className="col-span-7 flex flex-col gap-4">
                {/* AI Summary Card */}
                <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden flex-grow">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                   
                   <div className="flex items-center gap-3 mb-6">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      <h3 className="font-bold text-xl">Team Update</h3>
                   </div>

                   {data.isDelayed && data.delayReason && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                       <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Delay Reason</p>
                       <p className="text-red-200 text-base">{data.delayReason}</p>
                    </div>
                   )}

                   <div className="text-slate-300 text-xl font-medium leading-relaxed">
                      {data.aiUpdateText ? (
                          data.aiUpdateText
                      ) : (
                          <span className="text-slate-600 italic text-lg">Generating update...</span>
                      )}
                   </div>
                </div>

                {/* Designer Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                      <Palette className="w-7 h-7" />
                   </div>
                   <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lead Designer</div>
                      <div className="text-lg font-bold text-slate-800">{data.designer}</div>
                   </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                 <span>Anexture TECH</span>
            </div>
            <div>Generated via Anexture</div>
        </footer>

      </div>
    </div>
  );
});

PreviewCard.displayName = 'PreviewCard';