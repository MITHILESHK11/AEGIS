
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Calendar as CalendarIcon, Flag, BookOpen, CheckCircle2 } from "lucide-react";

export default function ScholarsLedgerPage() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Complete DSA Assignment 3', date: '2026-02-20', priority: 'High', completed: false },
        { id: 2, title: 'Apply for Summer Internships', date: '2026-02-25', priority: 'Medium', completed: true },
        { id: 3, title: 'Prepare for Linear Algebra Quiz', date: '2026-02-18', priority: 'High', completed: false },
    ]);
    const [newTask, setNewTask] = useState('');

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, {
            id: Date.now(),
            title: newTask,
            date: new Date().toISOString().split('T')[0],
            priority: 'Medium',
            completed: false
        }]);
        setNewTask('');
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const getPriorityColor = (p: string) => {
        if (p === 'High') return 'text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-xs border border-rose-500/20';
        if (p === 'Medium') return 'text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-xs border border-amber-500/20';
        return 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs border border-emerald-500/20';
    };

    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 p-8 shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <BookOpen className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                                    <BookOpen className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">Scholar's Ledger</h1>
                            </div>
                            <p className="text-slate-300 max-w-xl text-lg">Manage your personal tasks, academic deadlines, and research milestones.</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="text-center px-4 border-r border-white/10">
                                <p className="text-2xl font-bold text-white">{tasks.filter(t => !t.completed).length}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">Pending</p>
                            </div>
                            <div className="text-center px-4">
                                <p className="text-2xl font-bold text-emerald-400">{tasks.filter(t => t.completed).length}</p>
                                <p className="text-xs text-emerald-500/80 uppercase tracking-wide">Done</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="aegis-card overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Add a new task..."
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                    className="pl-4 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all rounded-xl text-lg"
                                />
                            </div>
                            <Button onClick={addTask} className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl shadow-lg shadow-indigo-500/20">
                                <Plus className="w-5 h-5 mr-1" /> Add
                            </Button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-3">
                            {tasks.length === 0 && (
                                <div className="text-center py-16">
                                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-slate-600 opacity-50" />
                                    <h3 className="text-xl font-medium text-white mb-2">All Caught Up!</h3>
                                    <p className="text-slate-400">No pending tasks. Enjoy your free time or add a new goal.</p>
                                </div>
                            )}

                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group
                                        ${task.completed
                                            ? 'bg-emerald-900/10 border-emerald-500/10 opacity-70'
                                            : 'bg-white/5 border-white/5 hover:border-indigo-500/30 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Checkbox
                                            checked={task.completed}
                                            onCheckedChange={() => toggleTask(task.id)}
                                            className={`w-6 h-6 border-2 transition-all ${task.completed
                                                    ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500'
                                                    : 'border-slate-500 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500'
                                                }`}
                                        />
                                        <div className={task.completed ? 'line-through text-slate-500 transition-colors' : 'text-white transition-colors'}>
                                            <p className="font-medium text-lg">{task.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                                                <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                    <CalendarIcon className="w-3 h-3 text-indigo-400" /> {task.date}
                                                </span>
                                                <span className={`flex items-center gap-1 font-semibold ${getPriorityColor(task.priority)}`}>
                                                    <Flag className="w-3 h-3" /> {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteTask(task.id)}
                                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
