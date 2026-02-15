
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from 'next/link';

export default function StudentApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/opportunities/my-applications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch applications');

                const data = await response.json();
                setApplications(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchApps();
    }, [user]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Submitted': return <div className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Submitted</div>;
            case 'Shortlisted': return <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Shortlisted</div>;
            case 'Accepted': return <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Accepted</div>;
            case 'Rejected': return <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5"><XCircle className="w-3 h-3" /> Rejected</div>;
            default: return <Badge variant="outline" className="border-white/10 text-slate-400">{status}</Badge>;
        }
    };

    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-900 p-8 shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Briefcase className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                                    <Briefcase className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">My Applications</h1>
                            </div>
                            <p className="text-slate-300 max-w-xl text-lg">Track the status of your internship and research applications.</p>
                        </div>

                        <Link href="/opportunities">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 text-lg py-6 px-8 rounded-xl w-full md:w-auto">
                                Browse More
                            </Button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-2xl" />)}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center aegis-card">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                            <Briefcase className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No applications yet</h3>
                        <p className="text-slate-400 mb-6 max-w-sm">Start applying to opportunities to see them here.</p>
                        <Link href="/opportunities">
                            <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                                Browse Opportunities
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {applications.map((app: any) => (
                            <div key={app.applicationId} className="aegis-card p-6 group hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between md:justify-start gap-4 mb-1">
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                {app.opportunityTitle}
                                            </h3>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            Applied on: {app.appliedAt?._seconds ? new Date(app.appliedAt._seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </p>

                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm mt-3">
                                            <p className="font-semibold text-slate-300 mb-1">Cover Letter Note:</p>
                                            <p className="text-slate-400 line-clamp-2 italic">
                                                "{app.coverLetter || 'No cover letter submitted.'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
