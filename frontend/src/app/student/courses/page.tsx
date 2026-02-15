
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, AlertTriangle, BookOpen, Clock, AlertCircle } from "lucide-react";

// Mock Data for UI Demonstration
const courses = [
    { code: "CS301", name: "Data Structures & Algorithms", credits: 4, type: "Major", attendance: 85, schedule: "Mon, Wed 10:00 AM" },
    { code: "CS302", name: "Database Management Systems", credits: 4, type: "Major", attendance: 72, schedule: "Tue, Thu 11:30 AM" },
    { code: "MA201", name: "Linear Algebra", credits: 3, type: "Minor", attendance: 90, schedule: "Fri 09:00 AM" },
    { code: "HU101", name: "Effective Communication", credits: 2, type: "Elective", attendance: 65, schedule: "Mon 02:00 PM" },
];

export default function CourseManagerPage() {
    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8 animate-in fade-in-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 p-8 shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <BookOpen className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Academic Mastery</h1>
                            <p className="text-slate-300 max-w-xl text-lg">Track your academic progress, attendance, and course details.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center min-w-[120px]">
                                <h3 className="text-2xl font-bold text-white">13</h3>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Credits</p>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm text-center min-w-[120px]">
                                <h3 className="text-2xl font-bold text-emerald-400">78%</h3>
                                <p className="text-xs text-emerald-500/80 uppercase tracking-wider">Avg Attendance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course List & Attendance */}
                <div className="aegis-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Enrolled Courses</h3>
                    </div>

                    <div className="rounded-xl border border-white/5 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-300 font-semibold">Code</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Course Name</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Type</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Schedule</TableHead>
                                    <TableHead className="w-[200px] text-slate-300 font-semibold">Attendance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((course) => (
                                    <TableRow key={course.code} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-white">{course.code}</TableCell>
                                        <TableCell className="text-slate-200">{course.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-white/20 text-slate-300 bg-white/5">
                                                {course.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-primary" />
                                                {course.schedule}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className={`font-bold ${course.attendance < 75 ? "text-rose-400" : "text-emerald-400"}`}>
                                                        {course.attendance}%
                                                    </span>
                                                    <span className="text-slate-500">Target: 75%</span>
                                                </div>
                                                <Progress
                                                    value={course.attendance}
                                                    className="h-1.5 bg-white/10"
                                                    indicatorClassName={course.attendance < 75 ? "bg-rose-500" : "bg-emerald-500"}
                                                />
                                                {course.attendance < 75 && (
                                                    <div className="flex items-center text-xs text-rose-400 mt-1">
                                                        <AlertTriangle className="w-3 h-3 mr-1" /> Low Attendance
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Academic Calendar Widget Placeholder */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="aegis-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Upcoming Exams</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white group-hover:text-primary transition-colors">DBMS Mid-Sem</span>
                                    <span className="text-xs text-slate-400">March 15, 2026</span>
                                </div>
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20 hover:bg-amber-500/30">Upcoming</Badge>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white group-hover:text-primary transition-colors">DSA Lab Eval</span>
                                    <span className="text-xs text-slate-400">March 18, 2026</span>
                                </div>
                                <Badge variant="secondary" className="bg-white/10 text-slate-300 border-white/10">Lab</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="aegis-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <AlertCircle className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Notifications</h3>
                        </div>
                        <div className="space-y-4 text-sm text-slate-400">
                            <div className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                                <p>Registration for Electives starts on <span className="text-white font-medium">Feb 20th</span>.</p>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                                <p>Library dues must be cleared before <span className="text-white font-medium">exams</span>.</p>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                <p>Hostel fees deadline extended to <span className="text-white font-medium">March 1st</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
