
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Briefcase, FileText, TrendingUp, Activity, AlertCircle, Download } from "lucide-react";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        users: {
            total: 0,
            students: 0,
            faculty: 0,
            authority: 0,
            admin: 0
        },
        grievances: {
            total: 0,
            pending: 0,
            resolved: 0
        },
        opportunities: {
            total: 0,
            applications: 0
        },
        resources: {
            total: 0,
            downloads: 0
        },
        dailyActiveUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

                const response = await fetch(`${baseUrl}/admin/stats`, {
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Activity className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-white border-white/20 bg-white/5 backdrop-blur-sm">System Administrator</Badge>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 backdrop-blur-sm flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            System Online
                        </Badge>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Overview</h2>
                    <p className="text-slate-300 max-w-xl text-lg">Monitor platform health, manage users, and review system-wide analytics in real-time.</p>
                </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={loading ? "..." : stats.users.total}
                    icon={Users}
                    color="text-blue-400"
                    bgColor="bg-blue-500/10"
                    subtitle={`${stats.users.students} students`}
                />
                <StatCard
                    title="Total Grievances"
                    value={loading ? "..." : stats.grievances.total}
                    icon={Shield}
                    color="text-orange-400"
                    bgColor="bg-orange-500/10"
                    subtitle={`${stats.grievances.pending} pending`}
                />
                <StatCard
                    title="Opportunities"
                    value={loading ? "..." : stats.opportunities.total}
                    icon={Briefcase}
                    color="text-purple-400"
                    bgColor="bg-purple-500/10"
                    subtitle={`${stats.opportunities.applications} applications`}
                />
                <StatCard
                    title="Resources"
                    value={loading ? "..." : stats.resources.total}
                    icon={FileText}
                    color="text-green-400"
                    bgColor="bg-green-500/10"
                    subtitle={`${stats.resources.downloads} downloads`}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Actions - Spans 2 cols */}
                <div className="md:col-span-2 space-y-6">
                    <div className="aegis-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                                <Activity className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/admin/users" className="group">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-semibold text-white">Manage Users</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 pl-[3.25rem]">Add, edit, or remove system users</p>
                                </div>
                            </Link>

                            <Link href="/admin/roles" className="group">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-semibold text-white">Assign Roles</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 pl-[3.25rem]">Configure user permissions</p>
                                </div>
                            </Link>

                            <Link href="/admin/analytics" className="group">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-semibold text-white">Analytics</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 pl-[3.25rem]">Deep dive into platform data</p>
                                </div>
                            </Link>

                            <Link href="/admin/audit-logs" className="group">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-semibold text-white">Audit Logs</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 pl-[3.25rem]">Review security events</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Platform Stats Details */}
                    <div className="aegis-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                <TrendingUp className="w-5 h-5 text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Platform Activity</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/5">
                                <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Grievances</h4>
                                <div className="space-y-3 mt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-300">Total</span>
                                        <span className="font-mono text-white">{stats.grievances.total}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-400 w-[60%]" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{stats.grievances.pending} pending</span>
                                        <span>{stats.grievances.resolved} resolved</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/5">
                                <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Opportunities</h4>
                                <div className="space-y-3 mt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-300">Active</span>
                                        <span className="font-mono text-white">{stats.opportunities.total}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-400 w-[40%]" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{stats.opportunities.applications} applications</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/5">
                                <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Resources</h4>
                                <div className="space-y-3 mt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-300">Uploaded</span>
                                        <span className="font-mono text-white">{stats.resources.total}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400 w-[75%]" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{stats.resources.downloads} downloads</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Stats & Health */}
                <div className="space-y-6">
                    {/* User Distribution */}
                    <div className="aegis-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">User Distribution</h3>
                        </div>
                        <div className="space-y-6">
                            <RoleDistributionBar
                                role="Students"
                                count={stats.users.students}
                                total={stats.users.total}
                                color="bg-blue-500"
                            />
                            <RoleDistributionBar
                                role="Faculty"
                                count={stats.users.faculty}
                                total={stats.users.total}
                                color="bg-purple-500"
                            />
                            <RoleDistributionBar
                                role="Authority"
                                count={stats.users.authority}
                                total={stats.users.total}
                                color="bg-orange-500"
                            />
                            <RoleDistributionBar
                                role="Admin"
                                count={stats.users.admin}
                                total={stats.users.total}
                                color="bg-green-500"
                            />
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="aegis-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Activity className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">System Status</h3>
                        </div>
                        <div className="space-y-3">
                            <StatusItem
                                label="API Status"
                                status="Operational"
                                color="text-emerald-400"
                                dotColor="bg-emerald-400"
                            />
                            <StatusItem
                                label="Database"
                                status="Healthy"
                                color="text-emerald-400"
                                dotColor="bg-emerald-400"
                            />
                            <StatusItem
                                label="Storage"
                                status="Normal"
                                color="text-emerald-400"
                                dotColor="bg-emerald-400"
                            />
                            <div className="pt-3 mt-3 border-t border-white/10">
                                <StatusItem
                                    label="Daily Active Users"
                                    status={`${stats.dailyActiveUsers} users`}
                                    color="text-blue-400"
                                    noDot
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle }: any) => (
    <div className="aegis-card p-6 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColor} ${color} border border-white/5`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">{value}</div>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
    </div>
);

const RoleDistributionBar = ({ role, count, total, color }: any) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">{role}</span>
                <span className="text-xs font-mono text-slate-500">{count} ({percentage}%)</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const StatusItem = ({ label, status, color, dotColor, noDot }: any) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
            {!noDot && <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />}
            <span className={`text-sm font-semibold ${color}`}>{status}</span>
        </div>
    </div>
);
