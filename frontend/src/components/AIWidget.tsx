"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Sparkles, X, MessageSquare, Send, Bot, User, Minimize2, Maximize2, Loader2, Wand2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    toolCalls?: any[];
}

export const AIWidget = () => {
    const { user, role, loading: authLoading } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const token = await user.getIdToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            const limitedHistory = messages.slice(-10).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            const response = await fetch(`${baseUrl}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: input,
                    history: limitedHistory,
                    context: {
                        location: pathname
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.content,
                toolCalls: data.toolCalls
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("AI Widget Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting to the AEGIS intelligence systems right now. Please try again later."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    if (authLoading || !user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[400px] h-[600px] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#0F172A]/95 backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between text-white border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg backdrop-blur-sm border border-primary/20">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-sm tracking-wide">AEGIS Copilot</h3>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{role} Intelligence</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 transition-colors" onClick={clearChat} title="Clear conversation">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 transition-colors" onClick={() => setIsMinimized(true)}>
                                    <Minimize2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 transition-colors" onClick={() => setIsOpen(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide bg-gradient-to-b from-transparent to-black/20"
                        >
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-5 p-6 opacity-90">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                        <Wand2 className="w-10 h-10 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-lg text-white">Welcome, {role === 'student' ? 'Scholar' : role}!</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                                            {role === 'student' && "Report grievances, explore academic paths, or refine your professional profile."}
                                            {role === 'faculty' && "Manage research opportunities and evaluate incoming applications."}
                                            {role === 'authority' && "Resolve grievances and prioritize institutional actions."}
                                            {role === 'admin' && "Monitor system health and analyze platform metrics."}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                                        {role === 'student' && ["Report issue", "Find internships", "Resume help"].map(suggestion => (
                                            <Button
                                                key={suggestion}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs rounded-full h-8 border-white/10 bg-white/5 text-slate-300 hover:bg-primary/20 hover:text-white hover:border-primary/50 transition-all font-normal"
                                                onClick={() => setInput(suggestion)}
                                            >
                                                {suggestion}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${message.role === 'user'
                                                ? 'bg-primary text-white ring-2 ring-primary/30'
                                                : 'bg-slate-800 border border-white/10 text-primary'
                                            }`}>
                                            {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-md backdrop-blur-sm ${message.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-sm'
                                            : 'bg-[#1E293B]/80 border border-white/10 text-slate-200 rounded-tl-sm'
                                            }`}>
                                            <div className="markdown-content">
                                                <ReactMarkdown
                                                    components={{
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1 leading-normal pl-1" {...props} />,
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-blue-400 underline underline-offset-2 hover:text-blue-300 font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/40 pl-4 italic my-2 text-slate-400 bg-white/5 py-1 pr-2 rounded-r" {...props} />,
                                                        code: ({ node, ...props }) => <code className="bg-black/30 px-1.5 py-0.5 rounded text-[12px] font-mono text-emerald-400 border border-white/5" {...props} />,
                                                        // @ts-ignore
                                                        pre: ({ node, ...props }) => <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto my-2 border border-white/10" {...props} />
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>

                                            {message.toolCalls && message.toolCalls.length > 0 && (
                                                <div className="mt-3 pt-2 border-t border-white/10">
                                                    {message.toolCalls.map((tc, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-1.5 rounded border border-emerald-500/20">
                                                            <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                                                            Processing: {tc.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="bg-[#1E293B]/80 border border-white/10 p-4 rounded-2xl rounded-tl-sm shadow-md">
                                            <div className="flex gap-1.5">
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900/80 border-t border-white/10 backdrop-blur-md">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Message ${role === 'student' ? 'Copilot' : 'AI'}...`}
                                    className="pr-12 bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-12 rounded-xl shadow-inner transition-all"
                                    disabled={loading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg shadow-lg bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105"
                                    disabled={loading || !input.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                            <div className="flex items-center justify-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
                                <Sparkles className="w-3 h-3 text-primary" />
                                <p className="text-[10px] text-center text-slate-500 font-medium">
                                    Powered by Vertex AI • Secure Context
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button / Floating Action Button */}
            <div className="flex items-center gap-3">
                <AnimatePresence>
                    {isMinimized && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={() => setIsMinimized(false)}
                            className="bg-primary text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 border-2 border-white/10 hover:bg-primary/90 transition-all"
                        >
                            <Maximize2 className="w-4 h-4" />
                            Expand Copilot
                        </motion.button>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                        boxShadow: isOpen ? "0 0 0 0px rgba(99, 102, 241, 0)" : ["0 0 0 0px rgba(99, 102, 241, 0.4)", "0 0 0 10px rgba(99, 102, 241, 0)"]
                    }}
                    transition={{
                        boxShadow: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut"
                        }
                    }}
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setIsMinimized(false);
                    }}
                    className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 border-white/20 ${isOpen
                        ? 'bg-rose-500 text-white rotate-90 scale-90'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                </motion.button>
            </div>
        </div>
    );
};
