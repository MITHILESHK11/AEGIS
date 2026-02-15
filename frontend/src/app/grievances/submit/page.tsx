"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TriangleAlert, Upload, Check, ChevronDown, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubmitGrievancePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        category: 'Infrastructure',
        priority: 'Medium',
        location: '',
        description: '',
        isAnonymous: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // @ts-ignore
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let photoUrl = '';

            if (file) {
                const storageRef = ref(storage, `grievances/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                photoUrl = await getDownloadURL(snapshot.ref);
            }

            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/grievances/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    photoUrl
                })
            });

            if (!response.ok) throw new Error('Failed to submit grievance');

            router.push('/grievances'); // Redirect to tracking page
        } catch (error) {
            console.error(error);
            alert('Error submitting grievance. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className="max-w-3xl mx-auto py-10 animate-in fade-in-50">
                <div className="mb-8 text-center space-y-4">
                    <div className="p-3 bg-gradient-to-br from-rose-50 to-orange-50 w-fit mx-auto rounded-2xl border border-rose-100 backdrop-blur-xl">
                        <TriangleAlert className="w-10 h-10 text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Submit a Grievance</h1>
                        <p className="text-slate-500 mt-2 max-w-lg mx-auto">Found an issue on campus? Report it here and we'll track it until resolution.</p>
                    </div>
                </div>

                <div className="aegis-card p-8 relative overflow-hidden bg-white border border-slate-200 shadow-sm rounded-xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500"></div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all cursor-pointer"
                                    >
                                        <option className="bg-white text-slate-900">Infrastructure</option>
                                        <option className="bg-white text-slate-900">Academic</option>
                                        <option className="bg-white text-slate-900">Administrative</option>
                                        <option className="bg-white text-slate-900">Hostel</option>
                                        <option className="bg-white text-slate-900">Transport</option>
                                        <option className="bg-white text-slate-900">Other</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">Priority</label>
                                <div className="relative">
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all cursor-pointer"
                                    >
                                        <option className="bg-white text-slate-900">Low</option>
                                        <option className="bg-white text-slate-900">Medium</option>
                                        <option className="bg-white text-slate-900">High</option>
                                        <option className="bg-white text-slate-900">Urgent</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Library 2nd Floor, Room 301"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">Description</label>
                            <textarea
                                name="description"
                                required
                                rows={5}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Please provide detailed information about the issue..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">Evidence (Optional)</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-rose-500/30 hover:bg-slate-50 transition-all cursor-pointer group relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="p-3 bg-slate-100 rounded-full text-slate-400 group-hover:text-rose-500 transition-colors">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {file ? (
                                            <span className="text-rose-500 font-medium">{file.name}</span>
                                        ) : (
                                            <>
                                                <span className="font-medium text-slate-700 group-hover:text-rose-600 transition-colors">Click to upload</span> or drag and drop
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    name="isAnonymous"
                                    id="isAnonymous"
                                    checked={formData.isAnonymous}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-rose-500 checked:bg-rose-500 transition-all"
                                />
                                <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                            </div>
                            <label htmlFor="isAnonymous" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                Submit Anonymously <span className="text-slate-500 font-normal ml-1">(Your name will be hidden from authorities)</span>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </div>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Submit Grievance <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
