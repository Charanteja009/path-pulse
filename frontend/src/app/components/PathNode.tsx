"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Circle, Zap, Target, ArrowUpRight } from 'lucide-react';

export default function PathNode({ phase, isSelected, onSelect, index, isLive = false, completedSteps = [], onToggleStep }: any) {
  const subtopics = phase?.subtopics || [];
  const projects = phase?.projects || [];
  const resources = phase?.resources || [];

  const phaseDoneCount = subtopics.filter((s: string) => completedSteps.includes(s)).length;
  const isPhaseComplete = subtopics.length > 0 && phaseDoneCount === subtopics.length;

  return (
    <div className={`w-full relative transition-all duration-500 ${isLive && !isSelected && !isPhaseComplete ? 'opacity-60' : 'opacity-100'}`}>
      <button 
        onClick={onSelect}
        className={`w-full flex items-center justify-between p-10 transition-all border-[3px] ${
          isSelected 
            ? 'bg-zinc-900 border-zinc-900 text-white translate-x-[-4px] translate-y-[-4px] shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]' 
            : 'bg-white border-zinc-200 text-zinc-900 hover:border-black'
        }`}
      >
        <div className="flex items-center gap-10 text-left">
          <span className={`text-4xl md:text-6xl font-black italic tracking-tighter ${isSelected ? 'text-white' : 'text-zinc-100'}`}>
            0{index + 1}
          </span>
          <div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.4em] mb-1 block ${isSelected ? 'text-emerald-400' : 'text-zinc-300'}`}>
              {isLive ? 'MODULE_SYNC' : 'PREVIEW_ONLY'}
            </span>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
              {phase?.topic || "Loading..."}
            </h3>
          </div>
        </div>
        <ChevronDown size={32} strokeWidth={4} className={`transition-transform duration-500 ${isSelected ? 'rotate-180 text-emerald-500' : 'text-zinc-200'}`} />
      </button>

      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden border-x-[3px] border-b-[3px] border-zinc-900 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 py-20 px-10">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-10 pb-4 border-b-2 border-zinc-900">
                  <span className="text-emerald-600 font-mono font-bold text-sm leading-none">{'>'}</span>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-900">
                    TERMINAL::SYLLABUS_STACK
                  </span>
                </div>
                
                <div className="space-y-4">
                  {subtopics.map((s: string, i: number) => {
                    const isDone = completedSteps.includes(s);
                    return (
                      <div key={i} onClick={() => isLive && onToggleStep?.(s)} 
                        className={`flex items-center gap-8 p-8 border-2 transition-all group ${
                          isLive ? isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50/30 hover:border-black cursor-pointer' : 'border-zinc-100'
                        }`}>
                        {isLive ? (
                            isDone ? <CheckCircle2 className="text-emerald-500" size={34} /> : <Circle className="text-zinc-200 group-hover:text-black" size={34} />
                        ) : <span className="text-3xl font-black text-zinc-100">0{i+1}</span>}
                        <span className={`text-2xl font-bold uppercase tracking-tight leading-none ${isDone ? 'text-emerald-900 line-through opacity-40' : 'text-zinc-800'}`}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-12">
                <div className="bg-black text-white p-10 border-l-[12px] border-emerald-500 neo-shadow">
                   <div className="flex items-center gap-2 mb-4 opacity-50 font-mono text-[10px] font-bold tracking-widest">
                      <Target size={14} /> MILESTONE_PROJECT
                   </div>
                   <p className="text-3xl font-black uppercase tracking-tighter italic leading-none">"{projects[0] || "TBD"}"</p>
                </div>
                <div className="space-y-4">
                  {resources.map((r: string, i: number) => (
                    <a key={i} href={r} target="_blank" className="flex items-center justify-between py-5 border-b-2 border-zinc-100 text-[11px] font-black uppercase hover:text-emerald-600 transition-all">
                      <span className="truncate w-44">{r.includes('github') ? 'REPO_LINK' : 'DOC_SPEC'}</span>
                      <ArrowUpRight size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}