"use client";
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Box, ArrowRight, ExternalLink, Activity, Target, Zap } from 'lucide-react';

export default function ArchitectRoadmap() {
  const [target, setTarget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  const generatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:3002/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, user_id: localStorage.getItem("pulse_userId") || "guest" })
      });
      const result = await response.json();
      if (result.data) setRoadmap(result.data.weeks);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] font-sans selection:bg-[#000000] selection:text-white">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-8 pt-32 pb-40">
        {/* HEADER: COMMAND INPUT */}
        <div className="mb-32">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-4 w-1 bg-black" />
            <span className="text-[12px] font-black uppercase tracking-[0.4em]">Initialize_System_Path</span>
          </div>
          
          <form onSubmit={generatePath} className="flex flex-col md:flex-row items-stretch gap-0 border-2 border-black rounded-none overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <input 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="SPECIFY YOUR CAREER OBJECTIVE..."
              className="flex-1 px-8 py-6 text-xl font-bold uppercase tracking-tight outline-none placeholder:text-zinc-300"
            />
            <button 
              disabled={isLoading}
              className="bg-black text-white px-12 py-6 text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 active:translate-x-1 active:translate-y-1"
            >
              {isLoading ? "ANALYZING..." : "GENERATE_PATH"}
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </form>
        </div>

        {/* THE ROADMAP: BLOCK STRUCTURE */}
        <div className="relative">
          <AnimatePresence>
            {roadmap && (
              <div className="space-y-1">
                {roadmap.map((week: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row border-b-2 border-black group"
                  >
                    {/* LEFT SIDE: LARGE WEEK BOX */}
                    <div className="md:w-[280px] bg-black text-white p-10 flex flex-col justify-between shrink-0 transition-all group-hover:bg-[#111111]">
                      <div>
                        <span className="block text-[14px] font-black opacity-40 mb-2 uppercase tracking-widest">Phase</span>
                        <span className="text-8xl font-black leading-none tracking-tighter">0{week.week}</span>
                      </div>
                      <div className="mt-10 flex items-center gap-2">
                        <Activity size={18} className="text-white animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">System_Active</span>
                      </div>
                    </div>

                    {/* RIGHT SIDE: DATA GRID */}
                    <div className="flex-1 p-10 md:p-14 bg-white hover:bg-[#FAFAFA] transition-colors">
                      <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12 leading-none">
                        {week.topic}
                      </h3>

                      <div className="grid lg:grid-cols-2 gap-16">
                        {/* Technical Syllabus */}
                        <div className="space-y-8">
                          <div className="flex items-center gap-3 border-b-2 border-black pb-3">
                            <Terminal size={18} strokeWidth={3} />
                            <span className="text-[12px] font-black uppercase tracking-widest">Technical_Requirements</span>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {week.subtopics.map((s: string, i: number) => (
                              <div key={i} className="flex items-center gap-4 bg-zinc-100 p-4 border-l-4 border-black">
                                <span className="text-[10px] font-black opacity-30">0{i+1}</span>
                                <span className="text-[13px] font-black uppercase tracking-tight">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Execution & Resources */}
                        <div className="space-y-12">
                          {/* Resources */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b-2 border-black pb-3">
                              <Box size={18} strokeWidth={3} />
                              <span className="text-[12px] font-black uppercase tracking-widest">Documentation_Assets</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {week.resources.map((r: string, i: number) => (
                                <a 
                                  key={i} 
                                  href={r.startsWith('http') ? r : "#"} 
                                  className="px-4 py-2 bg-white border-2 border-black text-[11px] font-black uppercase tracking-tight hover:bg-black hover:text-white transition-all flex items-center gap-2"
                                >
                                  {r.includes('github') ? 'REPO_LINK' : 'DOC_REF'}
                                  <ExternalLink size={12} strokeWidth={3} />
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Final Objective */}
                          <div className="bg-black text-white p-8">
                            <div className="flex items-center gap-3 mb-4">
                              <Target size={18} strokeWidth={3} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Target_Milestone</span>
                            </div>
                            {week.projects.map((p: string, i: number) => (
                              <p key={i} className="text-lg font-black uppercase leading-tight tracking-tight">
                                "{p}"
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}