"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { CircleAlert, CheckCircle, Activity, Clock, ArrowLeft, Calendar, MapPin, FileText, Image as ImageIcon, History } from "lucide-react";

export default function GrievanceDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const [grievance, setGrievance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGrievance = async () => {
            if (!user) return;
            // Handle params safely whether it's a promise or object
            const unwrappedParams = await params;
            const grievanceId = unwrappedParams.id;

            try {
                const token = await user.getIdToken();
                // Ideally, we should have a GET /:id endpoint. 
                // Using List for now as per current backend architecture.
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/grievances/list`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch grievance');

                const data = await response.json();
                const found = data.find((g: any) => g.grievanceId === grievanceId);

                if (found) {
                    setGrievance(found);
                } else {
                    setError('Grievance not found or access denied.');
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGrievance();
    }, [user, params]);

    if (loading) return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-5xl mx-auto py-10 px-4 text-center">
            <div className="aegis-card p-10 border-red-500/20 bg-red-500/5 rounded-xl">
                <CircleAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Grievance</h2>
                <p className="text-red-500">{error}</p>
                <Button onClick={() => router.back()} variant="ghost" className="mt-6 text-slate-500 hover:text-slate-900">
                    Go Back
                </Button>
            </div>
        </div>
    );

    if (!grievance) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'In Progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'Review': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Resolved': return <CheckCircle className="w-4 h-4 ml-2" />;
            case 'In Progress': return <Activity className="w-4 h-4 ml-2 animate-pulse" />;
            case 'Review': return <CircleAlert className="w-4 h-4 ml-2" />;
            default: return <Clock className="w-4 h-4 ml-2" />;
        }
    };

    return (
        <ProtectedRoute allowedRoles={['student', 'authority', 'admin']}>
            <div className="max-w-5xl mx-auto py-10 px-4 space-y-6 animate-in fade-in-50">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-500 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Grievances
                </button>

                <div className="aegis-card overflow-hidden relative bg-white border border-slate-200 shadow-sm rounded-xl">
                    {/* Header Banner */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                    <div className="p-8 md:p-10 space-y-8">
                        {/* Header Content */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border flex items-center ${getStatusColor(grievance.status)}`}>
                                        {grievance.status.toUpperCase()}
                                        {getStatusIcon(grievance.status)}
                                    </div>
                                    <span className="text-slate-500 text-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {grievance.createdAt?._seconds ? new Date(grievance.createdAt._seconds * 1000).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </span>
                                    <span className="text-slate-500 text-sm flex items-center gap-2 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                        #{grievance.grievanceId.slice(0, 8)}
                                    </span>
                                </div>

                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                                        {grievance.category} Issue
                                    </h1>
                                    <div className="flex items-center text-slate-500 text-lg">
                                        <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                                        {grievance.location}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1.5 rounded-lg text-sm font-medium border ${grievance.priority === 'Urgent' ? 'bg-red-500/10 text-red-600 border-red-500/20 animate-pulse' :
                                    grievance.priority === 'High' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                        grievance.priority === 'Medium' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    }`}>
                                    {grievance.priority} Priority
                                </span>
                                {grievance.isAnonymous && (
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        Submitted Anonymously
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Main Body */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Description
                                    </h3>
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 leading-relaxed text-slate-700 text-lg">
                                        {grievance.description}
                                    </div>
                                </div>

                                {grievance.photoUrl && (
                                    <div>
                                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center">
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Evidence
                                        </h3>
                                        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 max-w-md bg-slate-50">
                                            <img
                                                src={grievance.photoUrl}
                                                alt="Grievance Evidence"
                                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timeline Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-full">
                                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-6 flex items-center">
                                        <History className="w-4 h-4 mr-2" />
                                        Timeline
                                    </h3>

                                    <div className="space-y-0 relative">
                                        {/* Vertical Line */}
                                        <div className="absolute left-3.5 top-2 bottom-4 w-0.5 bg-slate-200"></div>

                                        {grievance.timeline && grievance.timeline.length > 0 ? (
                                            grievance.timeline.map((event: any, index: number) => (
                                                <div key={index} className="relative pl-10 pb-8 last:pb-0 group">
                                                    {/* Dot */}
                                                    <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border-4 border-white z-10 flex items-center justify-center transition-colors shadow-sm ${index === 0 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-300 group-hover:bg-slate-400'
                                                        }`}>
                                                        {index === 0 && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span className="text-slate-900 font-medium text-base mb-0.5">{event.status}</span>
                                                        <span className="text-xs text-slate-500 mb-2">
                                                            {event.timestamp ? new Date(event.timestamp).toLocaleString(undefined, {
                                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            }) : 'Date not available'}
                                                        </span>
                                                        {event.remark && (
                                                            <div className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 italic shadow-sm">
                                                                "{event.remark}"
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-slate-500 text-sm italic pl-4">No timeline events recorded properly.</div>
                                        )}
                                        {/* Implicit Submitted Event if timeline empty or just for clarity */}
                                        {(!grievance.timeline || grievance.timeline.length === 0) && (
                                            <div className="relative pl-10 pb-0">
                                                <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-slate-300 border-4 border-white z-10"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 font-medium">Ticket Created</span>
                                                    <span className="text-xs text-slate-500">
                                                        {grievance.createdAt?._seconds ? new Date(grievance.createdAt._seconds * 1000).toLocaleString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
