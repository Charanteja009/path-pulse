"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { ArrowRight, Map, Code2, Sparkles, Compass } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#fdfdfd] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* HERO SECTION */}
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6"
          >
            <Sparkles size={12} className="text-amber-500" /> Neural Link Active
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8 leading-[0.9]"
          >
            Architecture for the <span className="italic">Next Generation</span> of Developers.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-zinc-500 max-w-xl leading-relaxed mb-10"
          >
            Welcome to Path-Pulse. Your centralized hub for generating AI-powered learning paths and deconstructing complex codebases in seconds.
          </motion.p>
        </div>

        {/* ACCESS CARDS */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link href="/roadmap">
            <motion.div 
              whileHover={{ y: -5 }}
              className="group p-8 rounded-[2.5rem] bg-white border border-zinc-200 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <Map className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Roadmap Generator</h3>
              <p className="text-zinc-500 mb-6 text-sm leading-relaxed">
                Define your goal and let our AI architect a step-by-step learning journey customized to your current skill level.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all">
                Initialize Path <ArrowRight size={14} />
              </div>
            </motion.div>
          </Link>

          <Link href="/repo-explainer">
            <motion.div 
              whileHover={{ y: -5 }}
              className="group p-8 rounded-[2.5rem] bg-zinc-900 text-white shadow-sm hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <Code2 className="text-zinc-900" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Repo Explainer</h3>
              <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
                Connect any GitHub repository and get an instant, deep-dive explanation of the architecture, logic, and patterns.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all">
                Deconstruct Code <ArrowRight size={14} />
              </div>
            </motion.div>
          </Link>
        </div>
      </main>

      {/* BACKGROUND DECOR */}
      <div className="fixed bottom-0 right-0 p-10 opacity-10 pointer-events-none">
        <Compass size={400} strokeWidth={0.5} />
      </div>
    </div>
  );
}