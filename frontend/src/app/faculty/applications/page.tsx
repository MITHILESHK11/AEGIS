
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, User } from "lucide-react";

export default function FacultyApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/opportunities/applications`, {
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

        fetchApplications();
    }, [user]);

    const handleStatusUpdate = async (appId: string, status: string) => {
        if (!confirm(`Are you sure you want to mark this application as ${status}?`)) return;
        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/opportunities/application/${appId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update status');

            // Optimistic update
            setApplications(apps => apps.map(a => a.applicationId === appId ? { ...a, status } : a));
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Applications Review</h1>
                    <p className="text-muted-foreground">Review student applications for your posted opportunities.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                    </div>
                ) : applications.length === 0 ? (
                    <Card className="text-center p-12 border-dashed">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <User className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No applications yet</h3>
                            <p>When students apply to your opportunities, they will appear here.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {applications.map((app: any) => (
                            <Card key={app.applicationId} className="hover:border-primary/50 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-lg font-bold">{app.opportunityTitle || 'Unknown Opportunity'}</CardTitle>
                                        <p className="text-sm text-muted-foreground">Applicant ID: {app.studentId}</p>
                                    </div>
                                    <Badge variant={app.status === 'Submitted' ? 'default' : app.status === 'Shortlisted' ? 'secondary' : 'outline'}>{app.status}</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-muted/30 p-4 rounded-md">
                                            <h4 className="text-sm font-semibold mb-2">Cover Letter</h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{app.coverLetter || 'No cover letter provided.'}</p>
                                        </div>
                                        <div className="flex flex-col justify-center items-center bg-muted/30 p-4 rounded-md gap-4">
                                            <FileText className="w-8 h-8 text-primary" />
                                            <Button variant="outline" asChild>
                                                <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
                                            </Button>
                                        </div>
                                    </div>
                                    {app.status === 'Submitted' && (
                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                            <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(app.applicationId, 'Rejected')} className="text-destructive hover:bg-destructive/10 border-destructive/20">Reject</Button>
                                            <Button size="sm" onClick={() => handleStatusUpdate(app.applicationId, 'Shortlisted')}>Shortlist</Button>
                                        </div>
                                    )}
                                    {app.status === 'Shortlisted' && (
                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                            <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(app.applicationId, 'Rejected')} className="text-destructive">Reject</Button>
                                            <Button size="sm" onClick={() => handleStatusUpdate(app.applicationId, 'Accepted')} className="bg-green-600 hover:bg-green-700">Accept</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
