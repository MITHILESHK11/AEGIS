
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, SlidersHorizontal, CircleAlert, Clock, CheckCircle, FileText, ChevronRight, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GrievanceListPage() {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchGrievances = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const query = filterStatus !== 'All' ? `?status=${filterStatus}` : '';
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/grievances/list${query}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch grievances');

                const data = await response.json();
                setGrievances(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrievances();
    }, [user, filterStatus]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Resolved':
                return (
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" />
                        Resolved
                    </Badge>
                );
            case 'In Progress':
                return (
                    <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-400 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 animate-pulse" />
                        In Progress
                    </Badge>
                );
            case 'Review':
                return (
                    <Badge variant="outline" className="border-yellow-500/20 bg-yellow-500/10 text-yellow-400 flex items-center gap-1.5">
                        <CircleAlert className="w-3 h-3" />
                        Review
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="border-slate-500/20 bg-slate-500/10 text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Submitted
                    </Badge>
                );
        }
    };

    return (
        <ProtectedRoute allowedRoles={['student', 'authority', 'admin']}>
            <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 to-slate-50 p-8 shadow-2xl border border-slate-200">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <FileText className="w-64 h-64 text-slate-900" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-200 backdrop-blur-sm">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Grievances</h1>
                            </div>
                            <p className="text-slate-600 max-w-xl text-lg">Track the status of your reported issues and view resolution updates.</p>
                        </div>

                        <Link href="/grievances/submit">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 text-lg py-6 px-8 rounded-xl w-full md:w-auto">
                                <Plus className="mr-2 w-5 h-5" />
                                New Grievance
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="p-2 bg-slate-100 rounded-full border border-slate-200 mr-2">
                        <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                    </div>
                    {['All', 'Submitted', 'Review', 'In Progress', 'Resolved'].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                            className={`rounded-full px-4 border transition-all duration-300 ${filterStatus === status
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {status}
                        </Button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aegis-card p-6 h-32 animate-pulse flex flex-col justify-center gap-3 bg-white border border-slate-200 shadow-sm rounded-xl">
                                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : grievances.length === 0 ? (
                    <div className="aegis-card p-12 text-center border-dashed border-2 border-slate-200 bg-transparent shadow-none rounded-xl">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                <FileText className="w-8 h-8 opacity-50 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-900 mb-2">No grievances found</h3>
                            <p className="mb-6 max-w-sm mx-auto text-slate-500">You haven't submitted any grievances yet. If you're facing an issue on campus, let us know.</p>
                            <Link href="/grievances/submit">
                                <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                                    Submit your first grievance
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {grievances.map((grievance: any) => (
                            <Link key={grievance.grievanceId} href={`/grievances/${grievance.grievanceId}`}>
                                <div className="aegis-card p-6 group hover:border-indigo-300 transition-all duration-300 relative overflow-hidden bg-white border border-slate-200 shadow-sm rounded-xl">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-3 text-xs md:text-sm text-slate-500">
                                                <span className="font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-600">#{grievance.grievanceId.slice(0, 8)}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                                <span>{grievance.createdAt?._seconds ? new Date(grievance.createdAt._seconds * 100).toLocaleDateString() : 'Just now'}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg md:text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                                                    {grievance.category} Issue at {grievance.location}
                                                </h3>
                                                <p className="text-slate-600 line-clamp-1 max-w-3xl">
                                                    {grievance.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                            {getStatusBadge(grievance.status)}
                                            <div className="bg-slate-50 p-2 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-slate-100">
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
