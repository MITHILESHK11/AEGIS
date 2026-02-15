
"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthorityDashboard } from '@/components/dashboards/AuthorityDashboard';

export default function AuthorityDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['authority', 'admin']}>
            <div className="max-w-7xl mx-auto py-10 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Authority Dashboard</h1>
                    <p className="text-muted-foreground">Manage and oversee all campus grievances.</p>
                </div>
                <AuthorityDashboard />
            </div>
        </ProtectedRoute>
    );
}
