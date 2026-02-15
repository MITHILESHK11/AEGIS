
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Trash2, Edit, Eye } from "lucide-react";

export default function ManageResourcesPage() {
    const { user } = useAuth();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResources = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/academic/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch resources');
            const data = await response.json();

            // Filter only resources uploaded by this faculty
            const myResources = data.filter((r: any) => r.uploadedBy === user.uid);
            setResources(myResources);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [user]);

    const handleDelete = async (resourceId: string) => {
        if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return;

        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/academic/delete/${resourceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete resource');

            // Optimistic update
            setResources(resources.filter(r => r.resourceId !== resourceId));
        } catch (error) {
            console.error(error);
            alert('Failed to delete resource');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Notes': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'Paper': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'Slides': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Assignment': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Resources</h1>
                        <p className="text-muted-foreground">View and manage your uploaded academic resources.</p>
                    </div>
                    <Button onClick={fetchResources}>Refresh</Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>My Uploaded Resources ({resources.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : resources.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No resources uploaded yet.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead>Downloads</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resources.map((resource) => (
                                        <TableRow key={resource.resourceId}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{resource.title}</span>
                                                    {resource.description && (
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            {resource.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{resource.courseId}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getTypeColor(resource.resourceType)}>
                                                    {resource.resourceType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {resource.createdAt?._seconds
                                                    ? new Date(resource.createdAt._seconds * 1000).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Download className="w-3 h-3" />
                                                    <span className="text-sm">{resource.downloadCount || 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        title="View File"
                                                    >
                                                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(resource.resourceId)}
                                                        className="text-destructive hover:text-destructive"
                                                        title="Delete Resource"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
