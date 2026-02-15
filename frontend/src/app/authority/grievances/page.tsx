"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertCircle, Clock, Eye, RefreshCw } from "lucide-react";

export default function AuthorityGrievancesPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [grievances, setGrievances] = useState<any[]>([]);
    const [filteredGrievances, setFilteredGrievances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    // Filters
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'All');
    const [filterPriority, setFilterPriority] = useState(searchParams.get('priority') || 'All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchGrievances = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/grievances/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch grievances');
            const data = await response.json();
            setGrievances(data);
            setFilteredGrievances(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrievances();
    }, [user]);

    // Apply filters
    useEffect(() => {
        let filtered = [...grievances];

        // Status filter
        if (filterStatus !== 'All') {
            filtered = filtered.filter(g => g.status === filterStatus);
        }

        // Priority filter
        if (filterPriority !== 'All') {
            filtered = filtered.filter(g => g.priority === filterPriority);
        }

        // Category filter
        if (filterCategory !== 'All') {
            filtered = filtered.filter(g => g.category === filterCategory);
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(g =>
                g.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.grievanceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredGrievances(filtered);
    }, [filterStatus, filterPriority, filterCategory, searchQuery, grievances]);

    const handleUpdateStatus = async (grievanceId: string, newStatus: string) => {
        const remark = prompt(`Enter remark for updating status to ${newStatus}:`);
        if (!remark || remark.trim() === '') {
            alert('Remark is required for status updates.');
            return;
        }

        setUpdating(grievanceId);
        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/grievances/${grievanceId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, remark })
            });

            if (!response.ok) throw new Error('Failed to update status');

            alert('Status updated successfully');
            fetchGrievances();
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'In Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Under Review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Submitted': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'Urgent': return 'bg-red-600/10 text-red-500 border-red-600/20 animate-pulse';
            case 'Medium': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'Low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const categories = ['All', ...Array.from(new Set(grievances.map(g => g.category)))];

    return (
        <ProtectedRoute allowedRoles={['authority', 'admin']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-8 shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <AlertCircle className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/20 backdrop-blur-sm">
                                    <AlertCircle className="w-6 h-6 text-rose-400" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">Grievance Management</h1>
                            </div>
                            <p className="text-slate-300 max-w-xl text-lg">Review, track, and resolve campus-wide issues reported by students and faculty.</p>
                        </div>
                        <Button onClick={fetchGrievances} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="aegis-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <Filter className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Filters & Search</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-hover:text-primary" />
                            <Input
                                placeholder="Search by ID, description, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 transition-all text-lg h-12 rounded-xl"
                            />
                        </div>

                        {/* Filter Pills */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Status</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                        <SelectItem value="All">All Statuses</SelectItem>
                                        <SelectItem value="Submitted">Submitted</SelectItem>
                                        <SelectItem value="Under Review">Under Review</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Priority</label>
                                <Select value={filterPriority} onValueChange={setFilterPriority}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                        <SelectItem value="All">All Priorities</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Category</label>
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat === 'All' ? 'All Categories' : cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-400 rounded-lg px-3 py-1">
                                    Total: {grievances.length}
                                </Badge>
                                <p className="text-sm text-slate-500">
                                    Displaying {filteredGrievances.length} grievances
                                </p>
                            </div>
                            {(filterStatus !== 'All' || filterPriority !== 'All' || filterCategory !== 'All' || searchQuery) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFilterStatus('All');
                                        setFilterPriority('All');
                                        setFilterCategory('All');
                                        setSearchQuery('');
                                    }}
                                    className="text-slate-400 hover:text-white hover:bg-white/5"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grievances List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-2xl" />)}
                    </div>
                ) : filteredGrievances.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center aegis-card">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No grievances found</h3>
                        <p className="text-slate-400 max-w-sm">
                            No grievances match your current filters. Try adjusting your search query or clearing filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredGrievances.map((grievance: any) => (
                            <div key={grievance.grievanceId} className="aegis-card p-6 group hover:border-slate-500/30 transition-all duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="flex-1 space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <Badge variant="outline" className={`${getStatusColor(grievance.status)} px-3 py-1`}>
                                                {grievance.status}
                                            </Badge>
                                            <Badge variant="outline" className={`${getPriorityColor(grievance.priority)} px-3 py-1`}>
                                                {grievance.priority} Priority
                                            </Badge>
                                            <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                ID: {grievance.grievanceId.slice(0, 8)}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {grievance.createdAt?._seconds
                                                    ? new Date(grievance.createdAt._seconds * 1000).toLocaleDateString()
                                                    : 'N/A'}
                                            </span>
                                            {grievance.isAnonymous && (
                                                <Badge variant="outline" className="text-xs border-slate-700 bg-slate-800 text-slate-400">
                                                    Anonymous
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                                                {grievance.category} <span className="text-slate-500 text-sm font-normal mx-2">•</span> {grievance.location}
                                            </h3>
                                            <p className="text-sm text-slate-300 line-clamp-2 max-w-4xl">
                                                {grievance.description}
                                            </p>
                                        </div>

                                        {/* View Details Link */}
                                        <Link href={`/grievances/${grievance.grievanceId}`}>
                                            <Button variant="link" className="p-0 h-auto text-blue-400 hover:text-blue-300">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Full Details
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col gap-2 min-w-[140px] w-full md:w-auto">
                                        {grievance.status === 'Submitted' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUpdateStatus(grievance.grievanceId, 'Under Review')}
                                                disabled={!!updating}
                                                className="w-full border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                            >
                                                <Clock className="w-3 h-3 mr-1" />
                                                Review
                                            </Button>
                                        )}
                                        {(grievance.status === 'Submitted' || grievance.status === 'Under Review') && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUpdateStatus(grievance.grievanceId, 'In Progress')}
                                                disabled={!!updating}
                                                className="w-full border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
                                            >
                                                In Progress
                                            </Button>
                                        )}
                                        {grievance.status !== 'Resolved' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(grievance.grievanceId, 'Resolved')}
                                                disabled={!!updating}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                                            >
                                                Resolve
                                            </Button>
                                        )}
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
