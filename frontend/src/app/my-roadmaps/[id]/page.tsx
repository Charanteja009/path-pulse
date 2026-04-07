"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import PathNode from '../../components/PathNode';

export default function ExecutionView() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);

  useEffect(() => {
    fetch(`http://127.0.0.1:3002/api/roadmap/single/${id}`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setCompletedSteps(result.completed_steps || []);
      });
  }, [id]);

  const toggleStep = async (stepTitle: string) => {
    const newList = completedSteps.includes(stepTitle) 
      ? completedSteps.filter(s => s !== stepTitle) 
      : [...completedSteps, stepTitle];
    
    setCompletedSteps(newList);
    fetch(`http://127.0.0.1:3002/api/roadmap/update-progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roadmap_id: id, completed_steps: newList })
    });
  };

  if (!data) return <div className="bg-white min-h-screen" />;

  const totalSteps = data.roadmap_data.weeks.reduce((acc: number, w: any) => acc + w.subtopics.length, 0);
  const progress = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-white text-zinc-900 relative">
      {/* 🟢 MOVING DESIGNS */}
      <div className="moving-blueprint" />
      <div className="sensor-scan" />
      
      <Navbar />
      
      {/* 🛰️ NEUBRUTALIST HUD */}
      <div className="fixed top-24 left-0 right-0 z-50 px-10">
        <div className="max-w-6xl mx-auto bg-white border-[3px] border-black p-8 rounded-2xl flex items-center justify-between neo-shadow">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-xl font-black text-2xl italic">
              {progress}%
            </div>
            <div>
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2 italic">
                 {data.goal}
               </h2>
               <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-[0.3em]">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> EXECUTION_SYNC_ACTIVE
               </div>
            </div>
          </div>
          <div className="hidden md:block w-72 h-4 bg-zinc-100 border-2 border-black overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-80 pb-40 relative z-10">
        <div className="space-y-10">
          {data.roadmap_data.weeks.map((week: any, idx: number) => (
            <PathNode 
              key={idx} index={idx} phase={week} 
              isSelected={selectedIdx === idx} onSelect={() => setSelectedIdx(idx)} 
              isLive={true} completedSteps={completedSteps} onToggleStep={toggleStep} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}