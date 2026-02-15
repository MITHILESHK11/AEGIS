
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Briefcase, Users, FileText, TrendingUp, Calendar, Bell, ChevronRight } from "lucide-react";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const FacultyDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalResources: 0,
        totalDownloads: 0,
        activeOpportunities: 0,
        totalApplicants: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

                // Fetch opportunities
                const oppRes = await fetch(`${baseUrl}/opportunities/list?facultyId=${user.uid}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const opportunities = await oppRes.json();

                // Fetch applications
                const appRes = await fetch(`${baseUrl}/opportunities/applications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const applications = await appRes.json();

                // Fetch resources
                const resRes = await fetch(`${baseUrl}/academic/list`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const resources = await resRes.json();
                const myResources = resources.filter((r: any) => r.uploadedBy === user.uid);

                setStats({
                    totalResources: myResources.length,
                    totalDownloads: myResources.reduce((sum: number, r: any) => sum + (r.downloadCount || 0), 0),
                    activeOpportunities: opportunities.filter((o: any) => o.status === 'Open').length,
                    totalApplicants: applications.length
                });
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 p-8 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Briefcase className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Faculty Command Center</h2>
                    <p className="text-slate-300 max-w-xl text-lg">Manage academic resources, research opportunities, and student engagement efficiently.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Resources Shared"
                    value={loading ? "..." : stats.totalResources}
                    icon={FileText}
                    color="text-blue-400"
                    bgColor="bg-blue-500/10"
                />
                <StatCard
                    title="Engagement"
                    value={loading ? "..." : stats.totalDownloads}
                    icon={TrendingUp}
                    color="text-emerald-400"
                    bgColor="bg-emerald-500/10"
                />
                <StatCard
                    title="Open Roles"
                    value={loading ? "..." : stats.activeOpportunities}
                    icon={Briefcase}
                    color="text-indigo-400"
                    bgColor="bg-indigo-500/10"
                />
                <StatCard
                    title="Total Applicants"
                    value={loading ? "..." : stats.totalApplicants}
                    icon={Users}
                    color="text-amber-400"
                    bgColor="bg-amber-500/10"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Operations Card */}
                <div className="aegis-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                            <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Academic Operations</h3>
                    </div>

                    <div className="space-y-4">
                        <Link href="/faculty/upload" className="block group">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group-hover:translate-x-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Upload Resource</h4>
                                        <p className="text-xs text-slate-400">Share materials with students</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        <Link href="/faculty/opportunities" className="block group">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group-hover:translate-x-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Post Opportunity</h4>
                                        <p className="text-xs text-slate-400">Create new research roles</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        <Link href="/faculty/applications" className="block group">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group-hover:translate-x-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Review Applicants</h4>
                                        <p className="text-xs text-slate-400">Manage student applications</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="aegis-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Bell className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Real-time Activity</h3>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">View All</Button>
                    </div>

                    <div className="space-y-3">
                        <ActivityItem
                            title="New Application Received"
                            subtitle="Research Assistant position"
                            time="2h ago"
                            icon={Users}
                            iconColor="text-blue-400"
                            iconBg="bg-blue-500/10"
                        />
                        <ActivityItem
                            title="Resource Downloaded"
                            subtitle="Week 5 Lecture Notes"
                            time="5h ago"
                            icon={FileText}
                            iconColor="text-emerald-400"
                            iconBg="bg-emerald-500/10"
                        />
                        <ActivityItem
                            title="Deadline Reminder"
                            subtitle="Internship applications close in 3 days"
                            time="1d ago"
                            icon={Calendar}
                            iconColor="text-indigo-400"
                            iconBg="bg-indigo-500/10"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityItem = ({ title, subtitle, time, icon: Icon, iconColor, iconBg }: any) => (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5">
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">{title}</p>
            <p className="text-xs text-slate-400 truncate">{subtitle}</p>
        </div>
        <span className="text-xs text-slate-500 font-medium shrink-0">{time}</span>
    </div>
);

const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <div className="aegis-card p-6 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColor} ${color} border border-white/5`}>
                <Icon className="w-6 h-6" />
            </div>
            {/* Optional trend indicator could go here */}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
        </div>
    </div>
);
