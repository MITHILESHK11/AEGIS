
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
import { Search, UserPlus, RefreshCw, Edit, Ban, CheckCircle, Users } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function AdminUsersContent() {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchUsers = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error(error);
            // Demo data fallback
            const demoUsers = [
                { uid: '1', displayName: 'John Doe', email: 'john@example.com', role: 'student', disabled: false, metadata: { creationTime: new Date().toISOString() } },
                { uid: '2', displayName: 'Jane Smith', email: 'jane@example.com', role: 'faculty', disabled: false, metadata: { creationTime: new Date().toISOString() } },
                { uid: '3', displayName: 'Admin User', email: 'admin@example.com', role: 'admin', disabled: false, metadata: { creationTime: new Date().toISOString() } }
            ];
            setUsers(demoUsers);
            setFilteredUsers(demoUsers);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user]);

    // Apply filters
    useEffect(() => {
        let filtered = [...users];

        if (filterRole !== 'All') {
            filtered = filtered.filter(u => u.role === filterRole);
        }

        if (filterStatus !== 'All') {
            filtered = filtered.filter(u =>
                filterStatus === 'Active' ? !u.disabled : u.disabled
            );
        }

        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.uid?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [filterRole, filterStatus, searchQuery, users]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        const confirmed = confirm(`Are you sure you want to change this user's role to ${newRole}?`);
        if (!confirmed) return;

        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) throw new Error('Failed to update role');

            alert('Role updated successfully');
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Error updating role');
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'activate' : 'deactivate';
        const confirmed = confirm(`Are you sure you want to ${action} this user?`);
        if (!confirmed) return;

        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ disabled: !currentStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            alert(`User ${action}d successfully`);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            student: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            faculty: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            authority: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
        return colors[role as keyof typeof colors] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 p-8 shadow-2xl border border-slate-200">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <UserPlus className="w-64 h-64 text-slate-900" />
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                            </div>
                            <p className="text-slate-600 max-w-xl text-lg">Manage all platform users, assign roles, and control access permissions.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={fetchUsers} variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="aegis-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Search className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Search & Filter</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-hover:text-primary" />
                            <Input
                                placeholder="Search by name, email, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white transition-all text-lg h-12 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">Role</label>
                                <Select value={filterRole} onValueChange={setFilterRole}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        <SelectItem value="All">All Roles</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="faculty">Faculty</SelectItem>
                                        <SelectItem value="authority">Authority</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">Status</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        <SelectItem value="All">All Status</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 rounded-lg px-3 py-1">
                                    Total: {users.length}
                                </Badge>
                                <p className="text-sm text-slate-500">
                                    Displaying {filteredUsers.length} users
                                </p>
                            </div>
                            {(filterRole !== 'All' || filterStatus !== 'All' || searchQuery) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFilterRole('All');
                                        setFilterStatus('All');
                                        setSearchQuery('');
                                    }}
                                    className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="aegis-card p-0 overflow-hidden bg-white border border-slate-200 shadow-sm rounded-xl">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5" />)}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-900 mb-2">No users found</h3>
                            <p className="text-slate-500 max-w-sm">
                                We couldn't find any users matching your current filters. Try adjusting your search query or clearing filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-200">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="text-slate-700 font-semibold pl-6 h-12">User</TableHead>
                                        <TableHead className="text-slate-700 font-semibold h-12">Email</TableHead>
                                        <TableHead className="text-slate-700 font-semibold h-12">Role</TableHead>
                                        <TableHead className="text-slate-700 font-semibold h-12">Status</TableHead>
                                        <TableHead className="text-slate-700 font-semibold h-12">Created</TableHead>
                                        <TableHead className="text-slate-700 font-semibold text-right pr-6 h-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((u: any, idx: number) => (
                                        <TableRow key={u.uid || idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                                            <TableCell className="font-medium text-slate-900 pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        u.role === 'faculty' ? 'bg-purple-500/20 text-purple-400' :
                                                            u.role === 'authority' ? 'bg-orange-500/20 text-orange-400' :
                                                                'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {u.displayName ? u.displayName.substring(0, 2).toUpperCase() : 'U'}
                                                    </div>
                                                    {u.displayName || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 py-4">{u.email}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className={getRoleBadge(u.role)}>
                                                    {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {u.disabled ? (
                                                    <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-600 flex w-fit items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        Inactive
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 flex w-fit items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Active
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500 py-4">
                                                {u.metadata?.creationTime
                                                    ? new Date(u.metadata.creationTime).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                                                        onClick={() => {
                                                            const newRole = prompt('Enter new role (student, faculty, authority, admin):');
                                                            if (newRole && ['student', 'faculty', 'authority', 'admin'].includes(newRole)) {
                                                                handleRoleChange(u.uid, newRole);
                                                            }
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        <span className="sr-only">Edit Role</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className={`h-8 w-8 p-0 ${u.disabled ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"}`}
                                                        onClick={() => handleToggleStatus(u.uid, u.disabled)}
                                                    >
                                                        {u.disabled ? (
                                                            <CheckCircle className="w-4 h-4" />
                                                        ) : (
                                                            <Ban className="w-4 h-4" />
                                                        )}
                                                        <span className="sr-only">{u.disabled ? 'Activate' : 'Deactivate'}</span>
                                                    </Button>
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
        </ProtectedRoute>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div className="text-white">Loading...</div>}>
            <AdminUsersContent />
        </Suspense>
    );
}
