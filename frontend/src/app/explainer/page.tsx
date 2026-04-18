"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Send, Terminal, Code2, History, ChevronRight, GitBranch, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RepoExplainer() {
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const fetchHistory = async () => {
        let userId = localStorage.getItem("pulse_userId");
        if (!userId) {
            userId = "user_" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("pulse_userId", userId);
        }

        try {
            const res = await fetch(`http://localhost:5002/api/repo/history/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setChatHistory(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("History fetch failed");
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const startNewAnalysis = async () => {
  if (!repoUrl) return;
  setIsAnalyzing(true);
  
  try {
    const res = await fetch(`http://localhost:5002/api/repo/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        repo_url: repoUrl, 
        user_id: localStorage.getItem("pulse_userId")
      })
    });
    const data = await res.json();
    
    // Instead of just setting the AI message, re-fetch history 
    // to get the correct array from the DB
    await fetchHistory();
    
    // Find the current repo in the newly fetched history to update the messages view
    if (data.response) {
        setMessages([{ role: 'ai', content: data.response }]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setIsAnalyzing(false);
  }
};
    const sendMessage = async () => {
        if (!input.trim() || !repoUrl) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);

        const currentInput = input;
        const currentRepo = repoUrl; // Freeze URL for this request context
        setInput("");

        try {
            const res = await fetch(`http://localhost:5002/api/repo/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: currentInput,
                    repo_url: currentRepo,
                    user_id: localStorage.getItem("pulse_userId")
                })
            });
            const data = await res.json();

            if (data.response) {
                setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
            }
        } catch (err) {
            console.error("Chat failed", err);
        }
    };

    return (
        <div className="h-screen bg-white flex flex-col overflow-hidden text-zinc-900">
            <Navbar />

            <div className="flex flex-1 pt-20 overflow-hidden">
                {/* SIDEBAR */}
                <aside className="w-72 border-r border-zinc-100 bg-zinc-50/50 flex flex-col p-6 hidden lg:flex">
                    <button
                        onClick={() => { setMessages([]); setRepoUrl(""); setActiveChatId(null); }}
                        className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all mb-8 shadow-md"
                    >
                        <Plus size={14} /> NEW_SESSION
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-4">Past_Analyses</p>
                        {chatHistory.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => {
                                    console.log("Full Chat Object from DB:", chat);
                                    setActiveChatId(chat.id);
                                    setRepoUrl(chat.repo_url);

                                    // ✅ ENHANCED: Load full conversation history
                                    if (chat.chat_messages && Array.isArray(chat.chat_messages)) {
                                        setMessages(chat.chat_messages);
                                    } else if (chat.full_messages && Array.isArray(chat.full_messages)) {
                                        // Fallback if your controller uses 'full_messages' key
                                        const formatted = chat.full_messages.map((m: any) => ({
                                            role: m.role === 'assistant' ? 'ai' : 'user',
                                            content: m.content
                                        }));
                                        setMessages(formatted);
                                    } else {
                                        // Final fallback to summary
                                        const fallback = chat.summary?.text || chat.summary || "No history found.";
                                        setMessages([{ role: 'ai', content: fallback }]);
                                    }
                                }}
                                className={`w-full text-left px-4 py-4 rounded-xl transition-all border group ${activeChatId === chat.id ? 'bg-white border-zinc-200 shadow-sm' : 'border-transparent hover:bg-white/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-[9px] font-mono font-bold uppercase ${activeChatId === chat.id ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                        {new Date(chat.createdAt).toLocaleDateString()}
                                    </p>
                                    <ChevronRight size={12} className={`transition-transform ${activeChatId === chat.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                                </div>

                                <p className={`text-xs font-black truncate uppercase tracking-tighter ${activeChatId === chat.id ? 'text-black' : 'text-zinc-600'}`}>
                                    {chat.repo_name || chat.repo_url.split('/').pop()}
                                </p>

                                {/* ✅ Show the "last_query" for better UX */}
                                {chat.last_query && (
                                    <p className="text-[9px] text-zinc-400 truncate mt-1 italic">
                                        {chat.last_query}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* MAIN CONSOLE */}
                <main className="flex-1 flex flex-col relative bg-white">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

                    <div className="flex-1 overflow-y-auto p-12 space-y-8 z-10 custom-scrollbar" ref={chatContainerRef}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="p-6 bg-zinc-50 rounded-full mb-6 border border-zinc-100 shadow-sm">
                                    <Code2 size={40} className="text-zinc-300" />
                                </div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-zinc-200 italic">System_Idle</h2>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-2">Ready for code ingestion</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-8 rounded-3xl ${msg.role === 'user'
                                            ? 'bg-zinc-900 text-white shadow-xl rounded-tr-none'
                                            : 'bg-zinc-50 border border-zinc-100 text-zinc-900 rounded-tl-none shadow-sm'
                                        }`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40 flex items-center gap-2">
                                            {msg.role === 'user' ? <ChevronRight size={10} /> : <Terminal size={10} />}
                                            {msg.role === 'user' ? 'INPUT_SIGNAL' : 'AGENT_OUTPUT'}
                                        </p>
                                        <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* INPUT HUB */}
                    <div className="p-10 z-20 bg-white/80 backdrop-blur-md border-t border-zinc-100">
                        <div className="max-w-4xl mx-auto space-y-4">
                            {messages.length === 0 && (
                                <div className="relative group">
                                    <GitBranch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={18} />
                                    <input
                                        type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
                                        placeholder="PASTE_GITHUB_URL_HERE..."
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 pl-14 pr-40 py-5 rounded-2xl font-bold text-xs text-zinc-900 uppercase tracking-widest focus:border-black outline-none transition-all shadow-inner"
                                    />
                                    <button onClick={startNewAnalysis} disabled={isAnalyzing || !repoUrl} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50">
                                        {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : 'INIT_SCAN'}
                                    </button>
                                </div>
                            )}

                            <div className="relative">
                                <textarea
                                    value={input} onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                    placeholder={messages.length === 0 ? "Please scan a repository first..." : "EXECUTE_QUERY_ON_CODEBASE..."}
                                    disabled={messages.length === 0 || isAnalyzing}
                                    className="w-full bg-white border-2 border-zinc-100 px-6 py-5 rounded-2xl font-bold text-sm text-zinc-900 focus:border-black outline-none transition-all min-h-[70px] max-h-32 resize-none shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                                <button onClick={sendMessage} disabled={!input.trim() || messages.length === 0} className="absolute right-4 bottom-4 p-4 bg-zinc-900 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg disabled:bg-zinc-200">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}