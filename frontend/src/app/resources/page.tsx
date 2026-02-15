
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Download, FileText, File, FileCode } from "lucide-react";

export default function ResourceBrowserPage() {
    const { user } = useAuth();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        const fetchResources = async () => {
            // In a real app, I'd move this fetch logic to a service/hook
            if (!user) return;
            // ... existing fetch logic ...
            // Simulating fetch for now to show structure (using same logic as before)
            // But re-implementing it properly:
            try {
                const token = await user.getIdToken();
                let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/academic/list`;
                const params = new URLSearchParams();

                if (filterType !== 'All') params.append('type', filterType);
                if (searchQuery.match(/^[A-Z]{2,4}\d{3,4}$/i)) params.append('courseId', searchQuery.toUpperCase());

                if (params.toString()) url += `?${params.toString()}`;

                const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Failed to fetch resources');

                let data = await response.json();

                // Client-side filtering fallback
                if (searchQuery && !params.has('courseId')) {
                    const q = searchQuery.toLowerCase();
                    data = data.filter((r: any) =>
                        r.title.toLowerCase().includes(q) ||
                        r.description.toLowerCase().includes(q) ||
                        r.courseId.toLowerCase().includes(q) ||
                        (r.tags && r.tags.some((t: string) => t.toLowerCase().includes(q)))
                    );
                }
                setResources(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchResources, 500);
        return () => clearTimeout(timeout);
    }, [user, searchQuery, filterType]);

    const getIconForType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'slides': return <FileText className="w-5 h-5 text-orange-500" />;
            case 'paper': return <File className="w-5 h-5 text-blue-500" />;
            case 'assignment': return <FileCode className="w-5 h-5 text-purple-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
            <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Academic Resources</h1>
                        <p className="text-muted-foreground">Access course materials, notes, and past papers.</p>
                    </div>
                    {/* Add Upload button if faculty? (Already handled in dashboard, but could be here too) */}
                </div>

                {/* Search & Filter Bar */}
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by title, course code (e.g. CS101), or tags..."
                                className="pl-9 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="h-9 w-full md:w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="All">All Types</option>
                                <option value="Notes">Notes</option>
                                <option value="Paper">Papers</option>
                                <option value="Slides">Slides</option>
                                <option value="Assignment">Assignments</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="h-[250px] flex flex-col justify-between">
                                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                                <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No resources found</h3>
                        <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource: any) => (
                            <Card key={resource.resourceId} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="font-mono">{resource.courseId}</Badge>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                                            {getIconForType(resource.resourceType)} {resource.resourceType}
                                        </div>
                                    </div>
                                    <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 pb-3">
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{resource.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {resource.tags?.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">#{tag}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 border-t bg-muted/20">
                                    <Button className="w-full" variant="secondary" asChild>
                                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2 w-4 h-4" /> Download
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
