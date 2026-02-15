
"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">System-wide overview and management.</p>
                </div>
                <AdminDashboard />
            </div>
        </ProtectedRoute>
    );
}
