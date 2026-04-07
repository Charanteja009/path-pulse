"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Mail, Lock, ArrowRight, User, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// API Configuration - Pointing to your Nginx Gateway
const GATEWAY_URL = "http://127.0.0.1:3001/api/auth";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });

  useEffect(() => { setMounted(true); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthError("");
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔐 THE REAL UPLINK LOGIC
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    const endpoint = isLogin ? "/login" : "/signup";
    
    try {
      const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
          // Note: Backend currently only destructures email/pass. 
          // If you add 'name' to your User model, include fullName here.
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Protocol connection failed");
      }

      // ✅ SUCCESS: Node Synchronized
      console.log(`✅ [PROTOCOL] ${isLogin ? 'Login' : 'Signup'} Successful`);
      
      // Store JWT and UserID from your controller
      localStorage.setItem("pulse_token", data.token);
      localStorage.setItem("pulse_userId", data.userId);
      localStorage.setItem("pulse_session", "authorized");

      // Redirect to your roadmap dashboard
      router.push("/dashboard");
      
    } catch (err: any) {
      console.error("❌ [PROTOCOL] Handshake Failed:", err.message);
      setAuthError(err.message);
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 font-sans bg-[#fdfdfd] overflow-hidden">
      
      {/* 🏗️ ARCHITECTURAL GRID (Blueprint Matrix) */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px), radial-gradient(circle at 0px 0px, #000 1.5px, transparent 1.5px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-zinc-200/50 shadow-2xl shadow-zinc-200/20">
          
          {/* BRANDING */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 shadow-xl">
              <Compass className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 italic uppercase">Neural_Hub</h1>
            <p className="mt-1 text-xs text-zinc-500 font-bold tracking-[0.1em] uppercase">
              {isLogin ? "Neural Handshake Required" : "Initialize New Node"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleAuthSubmit}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1 overflow-hidden">
                  <label className="ml-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Identity</label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400" size={18} />
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Architect Name" className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-12 pr-4 text-sm outline-none focus:border-zinc-900 transition-all" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="ml-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Access Email</label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400" size={18} />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="admin@pulse.ai" className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-12 pr-4 text-sm outline-none focus:border-zinc-900 transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="ml-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Cipher Key</label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400" size={18} />
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-12 pr-4 text-sm outline-none focus:border-zinc-900 transition-all" />
              </div>
            </div>

            {authError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-tighter">
                <AlertCircle size={14} />
                {authError}
              </motion.div>
            )}

            <button type="submit" disabled={isLoading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 font-medium text-white shadow-lg hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-[0.98]">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>{isLogin ? "Sign In" : "Register Node"} <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            {isLogin ? "Need a neural path?" : "Already synchronized?"}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-semibold text-zinc-900 decoration-zinc-300 underline-offset-4 hover:underline">
              {isLogin ? "Create account" : "Log in"}
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-center text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
          <ShieldCheck className="text-cyan-500" size={14} />
          Uplink: Connected // Protocol: Optimal
        </div>
      </motion.div>
    </div>
  );
}