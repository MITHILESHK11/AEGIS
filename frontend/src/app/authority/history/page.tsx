
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';

export default function GrievanceHistoryPage() {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                // Fetch only resolved
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/grievances/list?status=Resolved`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch history');

                const data = await response.json();
                setGrievances(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    return (
        <ProtectedRoute allowedRoles={['authority', 'admin']}>
            <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resolved History</h1>
                    <p className="text-muted-foreground">Archive of resolved grievances and actions taken.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                    </div>
                ) : grievances.length === 0 ? (
                    <Card className="text-center p-12 text-muted-foreground">
                        No resolved grievances found.
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {grievances.map((g: any) => (
                            <Card key={g.grievanceId}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base font-semibold">#{g.grievanceId.slice(0, 8)} - {g.category} Issue</CardTitle>
                                            <p className="text-sm text-muted-foreground">{new Date(g.createdAt._seconds * 1000).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 border-green-200">Resolved</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{g.description}</p>
                                    <div className="mt-4 pt-4 border-t text-sm bg-muted/40 p-2 rounded">
                                        <span className="font-semibold">Resolution: </span>
                                        {g.timeline?.find((t: any) => t.status === 'Resolved')?.remark || 'No remarks provided.'}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
