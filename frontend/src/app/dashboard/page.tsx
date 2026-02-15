"use client";
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { StudentDashboard } from '@/components/dashboards/StudentDashboard';
import { FacultyDashboard } from '@/components/dashboards/FacultyDashboard';
import { AuthorityDashboard } from '@/components/dashboards/AuthorityDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';

export default function DashboardPage() {
    const { user, role } = useAuth();

    return (
        <ProtectedRoute>
            <div className="py-6">
                {role === 'student' && <StudentDashboard />}
                {role === 'faculty' && <FacultyDashboard />}
                {role === 'authority' && <AuthorityDashboard />}
                {role === 'admin' && <AdminDashboard />}
                {!role && (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                        <p className="text-muted-foreground font-medium">Initializing your workspace...</p>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
