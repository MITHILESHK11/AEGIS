"use client";
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, RefreshCw, Download, Filter, Shield } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function AdminAuditLogsContent() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('All');

    const fetchLogs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/audit-logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            setLogs(data);
            setFilteredLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [user]);

    // Apply filters
    useEffect(() => {
        let filtered = [...logs];

        if (filterAction !== 'All') {
            filtered = filtered.filter(log => log.action === filterAction);
        }

        if (searchQuery) {
            filtered = filtered.filter(log =>
                log.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.resourceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.details?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredLogs(filtered);
    }, [filterAction, searchQuery, logs]);

    const getActionBadge = (action: string) => {
        const colors = {
            'ROLE_CHANGE': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            'USER_DEACTIVATE': 'bg-red-500/10 text-red-600 border-red-500/20',
            'USER_ACTIVATE': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            'STATUS_UPDATE': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
            'FILE_UPLOAD': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
            'LOGIN': 'bg-slate-500/10 text-slate-600 border-slate-500/20'
        };
        return colors[action as keyof typeof colors] || 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    };

    const actionTypes = ['All', ...Array.from(new Set(logs.map(log => log.action)))];

    const exportLogs = () => {
        const csv = [
            ['Timestamp', 'User ID', 'Action', 'Resource', 'Details'].join(','),
            ...filteredLogs.map(log => [
                new Date(log.timestamp?._seconds * 1000 || Date.now()).toISOString(),
                log.userId || 'N/A',
                log.action || 'N/A',
                log.resourceId || 'N/A',
                log.details || 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString()}.csv`;
        a.click();
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-50 p-8 shadow-2xl border border-slate-200">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <FileText className="w-64 h-64 text-slate-900" />
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-200 backdrop-blur-sm">
                                    <Shield className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Audit Logs</h1>
                            </div>
                            <p className="text-slate-600 max-w-xl text-lg">Detailed record of all system activities, security events, and user actions.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={fetchLogs} variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                            <Button onClick={exportLogs} disabled={filteredLogs.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20">
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="aegis-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-200">
                            <Filter className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Search Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-hover:text-primary" />
                            <Input
                                placeholder="Search by user ID, resource ID, or details..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all text-lg h-12 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Select value={filterAction} onValueChange={setFilterAction}>
                                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl">
                                    <SelectValue placeholder="Filter by Action" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-900">
                                    {actionTypes.map(action => (
                                        <SelectItem key={action} value={action} className="focus:bg-slate-100">
                                            {action === 'All' ? 'All Actions' : action}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 rounded-lg px-3 py-1">
                                Total: {logs.length}
                            </Badge>
                            <p className="text-sm text-slate-500">
                                Displaying {filteredLogs.length} logs
                            </p>
                        </div>
                        {(filterAction !== 'All' || searchQuery) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFilterAction('All');
                                    setSearchQuery('');
                                }}
                                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Logs Table */}
                <div className="aegis-card overflow-hidden bg-white border border-slate-200 shadow-sm rounded-xl">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full bg-slate-100 rounded-xl" />)}
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-900 mb-2">No audit logs found</h3>
                            <p className="text-slate-500 max-w-sm">No records match your current search criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-200">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="text-slate-600 font-semibold pl-6">Timestamp</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">User ID</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Action</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Resource</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log: any, index: number) => (
                                        <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                            <TableCell className="pl-6 text-sm text-slate-500 font-mono">
                                                {log.timestamp?._seconds
                                                    ? new Date(log.timestamp._seconds * 1000).toLocaleString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-indigo-600">
                                                {log.userId?.slice(0, 12) || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${getActionBadge(log.action)} px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider`}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                                                {log.resourceId?.slice(0, 12) || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 max-w-md truncate" title={log.details}>
                                                {log.details || 'No details'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default function AdminAuditLogsPage() {
    return (
        <Suspense fallback={<div className="text-slate-900 p-8 text-center">Loading...</div>}>
            <AdminAuditLogsContent />
        </Suspense>
    );
}
