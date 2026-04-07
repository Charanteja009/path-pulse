"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, Map, Code2, User, LogOut, LayoutGrid } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Generator', href: '/roadmap', icon: Map },
    { name: 'Explainer', href: '/explainer', icon: Code2 },
    { name: 'My Paths', href: '/my-roadmaps', icon: Compass },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 border-b border-zinc-100 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="bg-zinc-900 p-1.5 rounded-lg rotate-[-10deg] shadow-lg shadow-zinc-200">
            <Compass className="text-white" size={18} />
          </div>
          <span className="font-black text-xl tracking-tighter text-zinc-900 uppercase">
            PATH<span className="text-zinc-400 italic">PULSE</span>
          </span>
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 
                  ${isActive ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
              >
                <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* LOGOUT */}
        <button 
          onClick={handleLogout}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Exit
        </button>
      </div>
    </nav>
  );
}