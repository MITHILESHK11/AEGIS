
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Calendar, DollarSign, Clock, Upload, Loader2, CheckCircle } from "lucide-react";

export default function OpportunitiesPage() {
    const { user } = useAuth();
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingTo, setApplyingTo] = useState<string | null>(null); // ID of opp being applied to
    const [resume, setResume] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchOpportunities = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/opportunities/list?status=Open`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to fetch opportunities');
                }
                const data = await response.json();
                setOpportunities(data);
            } catch (error: any) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunities();
    }, [user]);

    const handleApply = async () => {
        if (!resume) {
            alert('Please upload a resume.');
            return;
        }
        if (!applyingTo) return;

        setSubmitting(true);
        try {
            // 1. Upload Resume
            const storageRef = ref(storage, `resumes/${user?.uid}_${applyingTo}_${resume.name}`);
            const snapshot = await uploadBytes(storageRef, resume);
            const resumeUrl = await getDownloadURL(snapshot.ref);

            // 2. Submit Application
            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/opportunities/${applyingTo}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    resumeUrl,
                    coverLetter
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to apply');
            }

            setSuccessMessage('Application submitted successfully!');
            setTimeout(() => {
                setApplyingTo(null);
                setResume(null);
                setCoverLetter('');
                setSuccessMessage('');
            }, 2000);
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
                    <p className="text-muted-foreground">Find and apply for internships and research positions.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <Card key={i} className="p-6">
                                <Skeleton className="h-8 w-1/3 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </Card>
                        ))}
                    </div>
                ) : opportunities.length === 0 ? (
                    <Card className="text-center p-12 border-dashed">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No opportunities available</h3>
                            <p className="mb-6">Check back later for new openings.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {opportunities.map((opp: any) => (
                            <Card key={opp.opportunityId} className={`overflow-hidden transition-all ${applyingTo === opp.opportunityId ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}>
                                <div className="p-6">
                                    <div className="flex justify-between items-start flex-col md:flex-row gap-4 mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold">{opp.title}</h2>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {opp.duration}</span>
                                                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {opp.stipend}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Deadline: {opp.applicationDeadline?._seconds ? new Date(opp.applicationDeadline._seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                        {applyingTo !== opp.opportunityId && (
                                            <Button onClick={() => setApplyingTo(opp.opportunityId)}>
                                                Apply Now
                                            </Button>
                                        )}
                                    </div>

                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-4 whitespace-pre-wrap">
                                        {opp.description}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {opp.requiredSkills?.map((skill: string) => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Application Form */}
                                {applyingTo === opp.opportunityId && (
                                    <div className="bg-muted/30 border-t border-border p-6 animate-in slide-in-from-top-2">
                                        {successMessage ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-green-600">
                                                <CheckCircle className="w-12 h-12 mb-4" />
                                                <h3 className="text-lg font-semibold">{successMessage}</h3>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-w-2xl mx-auto">
                                                <h3 className="text-lg font-semibold">Submit Application</h3>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Resume (PDF)</label>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                                                        className="cursor-pointer"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Cover Letter / Note</label>
                                                    <Textarea
                                                        rows={4}
                                                        value={coverLetter}
                                                        onChange={(e) => setCoverLetter(e.target.value)}
                                                        placeholder="Why are you a good fit for this role?"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-3 pt-2">
                                                    <Button variant="outline" onClick={() => { setApplyingTo(null); setResume(null); }}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleApply} disabled={submitting || !resume}>
                                                        {submitting ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="mr-2 h-4 w-4" /> Submit Application
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
