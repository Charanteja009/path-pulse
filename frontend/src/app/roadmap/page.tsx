"use client";
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import PathNode from '../components/PathNode';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

export default function DiscoveryPage() {
  const [target, setTarget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);

  const generatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:3002/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, user_id: localStorage.getItem("pulse_userId") })
      });
      const result = await response.json();
      if (result.data) setRoadmap(result.data.weeks);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const initializePath = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3002/api/roadmap/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: localStorage.getItem("pulse_userId"), goal: target })
      });
      if (response.ok) window.location.href = "/my-roadmaps";
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-60 relative">
      <style jsx global>{`@keyframes moveGrid { from { background-position: 0 0; } to { background-position: 50px 50px; } } .moving-grid { background-size: 50px 50px; background-image: linear-gradient(to right, #f5f5f5 1px, transparent 1px), linear-gradient(to bottom, #f5f5f5 1px, transparent 1px); animation: moveGrid 5s linear infinite; }`}</style>
      <div className="fixed inset-0 moving-grid pointer-events-none opacity-70" />
      <Navbar />
      <main className="max-w-6xl mx-auto px-10 pt-44 relative z-10">
        <header className="mb-32">
          <form onSubmit={generatePath} className="flex items-center border-4 border-zinc-900 bg-white p-3 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <Search className="ml-6 text-zinc-300" size={28} />
            <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="ENTER TARGET ROLE..." className="flex-1 bg-transparent px-8 py-6 text-4xl md:text-6xl font-black uppercase tracking-tighter outline-none" />
            <button className="bg-zinc-900 text-white px-12 py-6 font-black uppercase text-xs tracking-widest">{isLoading ? "INIT..." : "GENERATE"}</button>
          </form>
        </header>

        {roadmap && (
          <div className="space-y-6">
            {roadmap.map((week: any, idx: number) => (
              <PathNode key={idx} index={idx} phase={week} isSelected={selectedIdx === idx} onSelect={() => setSelectedIdx(idx)} isLive={false} />
            ))}
            <div className="pt-32 flex justify-center">
              <button onClick={initializePath} className="px-20 py-8 bg-zinc-900 text-white text-xl font-black uppercase tracking-[0.3em] shadow-[15px_15px_0px_0px_rgba(16,185,129,1)] flex items-center gap-6 transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-none">
                <Sparkles size={24} /> Initialize_Project_Path
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}