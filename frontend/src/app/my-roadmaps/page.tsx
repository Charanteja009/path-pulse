"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { Calendar, Trash2, ArrowRight, Rocket, Layout } from 'lucide-react';

export default function MyPathsGallery() {
  const [collection, setCollection] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      const userId = localStorage.getItem("pulse_userId");
      try {
        const res = await fetch(`http://127.0.0.1:3002/api/roadmap/my-collection/${userId}`);
        const data = await res.json();
        setCollection(data);
      } catch (err) {
        console.error("Gallery Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative selection:bg-zinc-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-10 pt-44 pb-40">
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Layout size={16} className="text-zinc-900" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">User_Registry_v4</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none">
              MY<span className="text-zinc-200">_PATHS</span>
            </h1>
          </div>
          
          <Link href="/roadmap" className="px-10 py-5 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
            <Rocket size={18} /> New Trajectory
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {collection.map((path) => {
            // Logic to calculate progress percentage for the bar
            const doneCount = path.completed_steps?.length || 0;
            return (
              <div key={path.id} className="group relative bg-white border-[4px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex flex-col h-[400px]">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                    <Calendar size={12} /> {new Date(path.created_at).toLocaleDateString()}
                  </div>
                  <button className="text-zinc-200 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>

                <h3 className="text-4xl font-black uppercase tracking-tighter leading-tight mb-auto group-hover:text-emerald-600 transition-colors">
                  {path.goal}
                </h3>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Progress</span>
                    <span className="text-zinc-900">{doneCount} Units Done</span>
                  </div>
                  <div className="h-4 bg-zinc-100 border-2 border-black overflow-hidden">
                    <div 
                      className="h-full bg-black transition-all duration-1000" 
                      style={{ width: `${Math.min((doneCount / 20) * 100, 100)}%` }} 
                    />
                  </div>
                </div>

                <Link 
                  href={`/my-roadmaps/${path.id}`}
                  className="w-full flex items-center justify-between py-5 border-t-4 border-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white px-2 transition-all"
                >
                  Resume Execution <ArrowRight size={18} />
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}