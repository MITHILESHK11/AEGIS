
"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { FacultyDashboard } from '@/components/dashboards/FacultyDashboard';

export default function FacultyDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
                    <p className="text-muted-foreground">Manage your academic resources and opportunities.</p>
                </div>
                <FacultyDashboard />
            </div>
        </ProtectedRoute>
    );
}
