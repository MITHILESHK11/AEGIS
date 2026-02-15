
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle, TrendingUp, FileText, Filter, ChevronRight, Shield } from "lucide-react";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const AuthorityDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        highPriority: 0,
        byCategory: {} as Record<string, number>
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

                const response = await fetch(`${baseUrl}/grievances/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500 pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900 to-slate-900 p-8 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Shield className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Authority Command Center</h2>
                    <p className="text-slate-300 max-w-xl text-lg">Monitor campus grievances, prioritize critical issues, and manage resolution workflows.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Grievances"
                    value={loading ? "..." : stats.total}
                    icon={FileText}
                    color="text-blue-400"
                    bgColor="bg-blue-500/10"
                />
                <StatCard
                    title="Pending Review"
                    value={loading ? "..." : stats.pending}
                    icon={Clock}
                    color="text-amber-400"
                    bgColor="bg-amber-500/10"
                />
                <StatCard
                    title="In Progress"
                    value={loading ? "..." : stats.inProgress || 0}
                    icon={TrendingUp}
                    color="text-indigo-400"
                    bgColor="bg-indigo-500/10"
                />
                <StatCard
                    title="Resolved Cases"
                    value={loading ? "..." : stats.resolved}
                    icon={CheckCircle}
                    color="text-emerald-400"
                    bgColor="bg-emerald-500/10"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Resolution Center */}
                <div className="aegis-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                            <AlertCircle className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Resolution Center</h3>
                    </div>

                    <div className="space-y-4">
                        <Link href="/authority/grievances?status=Submitted" className="block group">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group-hover:translate-x-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Review Pending ({stats.pending})</h4>
                                        <p className="text-xs text-slate-400">Cases awaiting initial assessment</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        <Link href="/authority/grievances?priority=High" className="block group">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group-hover:translate-x-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">High Priority Issues</h4>
                                        <p className="text-xs text-slate-400">Critical grievances requiring immediate action</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        <Link href="/authority/grievances" className="block group">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group-hover:translate-x-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Full Case History</h4>
                                        <p className="text-xs text-slate-400">Access archive of all grievances</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Impact Areas */}
                <div className="aegis-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <Filter className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Impact Areas</h3>
                    </div>

                    <div className="space-y-2">
                        {stats.byCategory && Object.entries(stats.byCategory).length > 0 ? (
                            Object.entries(stats.byCategory).map(([category, count]) => (
                                <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                    <span className="text-sm font-medium text-slate-200">{category}</span>
                                    <Badge variant="outline" className="font-bold border-white/20 text-white bg-white/5">{count}</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No active grievances in categories</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Workflow Health */}
            <div className="aegis-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Workflow Health</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusOverviewCard
                        status="Pending"
                        count={stats.pending}
                        total={stats.total}
                        color="bg-amber-500"
                        trackColor="bg-amber-500/20"
                    />
                    <StatusOverviewCard
                        status="In Progress"
                        count={stats.inProgress || 0}
                        total={stats.total}
                        color="bg-indigo-500"
                        trackColor="bg-indigo-500/20"
                    />
                    <StatusOverviewCard
                        status="Resolved"
                        count={stats.resolved}
                        total={stats.total}
                        color="bg-emerald-500"
                        trackColor="bg-emerald-500/20"
                    />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <div className="aegis-card p-6 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColor} ${color} border border-white/5`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
        </div>
    </div>
);

const StatusOverviewCard = ({ status, count, total, color, trackColor }: any) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="p-5 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{status}</span>
                <span className="text-2xl font-black text-white">{count}</span>
            </div>
            <div className={`w-full ${trackColor || 'bg-white/10'} rounded-full h-2 overflow-hidden mb-2`}>
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-[10px] font-bold text-slate-500 text-right">{percentage}% of total</p>
        </div>
    );
};
