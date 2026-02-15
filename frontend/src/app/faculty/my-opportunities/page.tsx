
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, Calendar, Edit, Trash2, Plus } from "lucide-react";

export default function MyOpportunitiesPage() {
    const { user } = useAuth();
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOpportunities = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/opportunities/list?facultyId=${user.uid}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch opportunities');
            const data = await response.json();
            setOpportunities(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpportunities();
    }, [user]);

    const getStatusColor = (status: string) => {
        return status === 'Open'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    const isDeadlinePassed = (deadline: any) => {
        if (!deadline?._seconds) return false;
        return new Date(deadline._seconds * 1000) < new Date();
    };

    return (
        <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 p-8 shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Briefcase className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                                    <Briefcase className="w-6 h-6 text-blue-400" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">My Opportunities</h1>
                            </div>
                            <p className="text-slate-300 max-w-xl text-lg">Manage the research and internship opportunities you've posted.</p>
                        </div>
                        <Link href="/faculty/opportunities">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20">
                                <Plus className="w-4 h-4 mr-2" />
                                Post New Opportunity
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="aegis-card overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                            Posted Opportunities
                        </h3>
                        <Badge variant="outline" className="border-white/10 text-slate-400">
                            Total: {opportunities.length}
                        </Badge>
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />)}
                            </div>
                        ) : opportunities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Briefcase className="w-8 h-8 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">No opportunities posted yet</h3>
                                <p className="text-slate-400 max-w-sm mb-6">Create your first opportunity to start accepting applications.</p>
                                <Link href="/faculty/opportunities">
                                    <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                                        Post Your First Opportunity
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-white/5 border-b border-white/10">
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="text-slate-300 font-semibold pl-6">Title</TableHead>
                                            <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                                            <TableHead className="text-slate-300 font-semibold">Applicants</TableHead>
                                            <TableHead className="text-slate-300 font-semibold">Deadline</TableHead>
                                            <TableHead className="text-slate-300 font-semibold">Posted On</TableHead>
                                            <TableHead className="text-right text-slate-300 font-semibold pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {opportunities.map((opp) => (
                                            <TableRow key={opp.opportunityId} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <TableCell className="pl-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white group-hover:text-blue-300 transition-colors">{opp.title}</span>
                                                        <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">
                                                            {opp.description}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`${getStatusColor(opp.status)} px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider`}>
                                                        {opp.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-slate-300">
                                                        <Users className="w-4 h-4 text-slate-500" />
                                                        <span className="font-medium">{opp.applicantCount || 0}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm ${isDeadlinePassed(opp.applicationDeadline) ? 'text-red-400' : 'text-slate-300'}`}>
                                                            {opp.applicationDeadline?._seconds
                                                                ? new Date(opp.applicationDeadline._seconds * 1000).toLocaleDateString()
                                                                : 'N/A'}
                                                        </span>
                                                        {isDeadlinePassed(opp.applicationDeadline) && (
                                                            <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wide">Expired</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500">
                                                    {opp.createdAt?._seconds
                                                        ? new Date(opp.createdAt._seconds * 1000).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/faculty/applications?opportunityId=${opp.opportunityId}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-slate-400 hover:text-white hover:bg-white/10"
                                                                title="View Applications"
                                                            >
                                                                <Users className="w-4 h-4 mr-2" />
                                                                Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
