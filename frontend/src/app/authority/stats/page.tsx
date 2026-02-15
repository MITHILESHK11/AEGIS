
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, PieChart, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function AuthorityStatsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/grievances/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch stats');

                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    return (
        <ProtectedRoute allowedRoles={['authority', 'admin']}>
            <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Department Statistics</h1>
                    <p className="text-muted-foreground">Overview of grievance resolution performance.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                    </div>
                ) : !stats ? (
                    <Card className="text-center p-12 text-muted-foreground">No data available.</Card>
                ) : (
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Grievances"
                                value={stats.total}
                                icon={Activity}
                                color="text-blue-600"
                                subtext="All time reports"
                            />
                            <StatCard
                                title="Pending Review"
                                value={stats.pending}
                                icon={Clock}
                                color="text-yellow-600"
                                subtext="Awaiting action"
                            />
                            <StatCard
                                title="Resolved"
                                value={stats.resolved}
                                icon={CheckCircle}
                                color="text-green-600"
                                subtext="Successfully closed"
                            />
                            <StatCard
                                title="Resolution Rate"
                                value={stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%'}
                                icon={BarChart}
                                color="text-purple-600"
                                subtext="Success metric"
                            />
                        </div>

                        {/* Category Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Issues by Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(stats.byCategory || {}).map(([cat, count]: any) => (
                                            <div key={cat} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                    <span className="font-medium">{cat}</span>
                                                </div>
                                                <Badge variant="secondary">{count}</Badge>
                                            </div>
                                        ))}
                                        {Object.keys(stats.byCategory || {}).length === 0 && (
                                            <p className="text-muted-foreground text-center py-4">No data to display.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="h-full bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                                <CardHeader>
                                    <CardTitle>Performance Insights</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-muted-foreground">
                                    <p>
                                        Your department's resolution rate is currently tracking at
                                        <span className="font-bold text-foreground"> {stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%'}</span>.
                                    </p>
                                    <p>
                                        The most common issue category is <span className="font-bold text-foreground">{
                                            Object.entries(stats.byCategory || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'None'
                                        }</span>.
                                    </p>
                                    <div className="mt-4 p-4 bg-background rounded-lg border shadow-sm">
                                        <h4 className="font-semibold text-foreground mb-1">Recommendation</h4>
                                        <p>Focus on resolving pending tickets in the high-volume categories to improve student satisfaction.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <Card>
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <div className="text-3xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            </div>
            <div className={`p-3 rounded-full bg-muted ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </CardContent>
    </Card>
)
