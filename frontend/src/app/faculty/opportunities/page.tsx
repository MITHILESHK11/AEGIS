"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react";

export default function PostOpportunityPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: '',
        duration: '',
        stipend: '',
        applicationDeadline: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/opportunities/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    requiredSkills: formData.requiredSkills.split(',').map(s => s.trim())
                })
            });

            if (!response.ok) throw new Error('Failed to post opportunity');

            alert('Opportunity posted successfully!');
            router.push('/faculty/my-opportunities');
        } catch (error) {
            console.error(error);
            alert('Error posting opportunity.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-8 shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Briefcase className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                                <Briefcase className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Post New Opportunity</h1>
                        </div>
                        <p className="text-slate-300 max-w-xl text-lg">Create a new research or internship opportunity for students.</p>
                    </div>
                </div>

                <div className="aegis-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Opportunity Title</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="pl-4 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all h-12 text-lg rounded-xl"
                                        placeholder="e.g. Research Assistant - AI Lab"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <Textarea
                                    name="description"
                                    required
                                    rows={6}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-base rounded-xl resize-none"
                                    placeholder="Detailed description of the role, responsibilities, and learning outcomes..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Required Skills (comma separated)</label>
                                <Input
                                    type="text"
                                    name="requiredSkills"
                                    required
                                    value={formData.requiredSkills}
                                    onChange={handleChange}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all h-12 rounded-xl"
                                    placeholder="e.g. Python, PyTorch, React, Data Analysis"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-400" /> Duration
                                    </label>
                                    <Input
                                        type="text"
                                        name="duration"
                                        required
                                        value={formData.duration}
                                        onChange={handleChange}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all h-12 rounded-xl"
                                        placeholder="e.g. 3 months"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-400" /> Stipend
                                    </label>
                                    <Input
                                        type="text"
                                        name="stipend"
                                        required
                                        value={formData.stipend}
                                        onChange={handleChange}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all h-12 rounded-xl"
                                        placeholder="e.g. $500/month or Unpaid"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-400" /> Deadline
                                    </label>
                                    <Input
                                        type="date"
                                        name="applicationDeadline"
                                        required
                                        value={formData.applicationDeadline}
                                        onChange={handleChange}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all h-12 rounded-xl [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-4 border-t border-white/5">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="text-slate-400 hover:text-white hover:bg-white/5"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 py-6 px-8 text-lg rounded-xl min-w-[200px]"
                            >
                                {loading ? 'Posting...' : 'Post Opportunity'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
