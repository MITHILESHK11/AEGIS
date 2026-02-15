"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (!loading && user && allowedRoles && !allowedRoles.includes(role || 'student')) {
            // Redirect to unauthorized page if role doesn't match
            router.push("/unauthorized");
        }
    }, [user, loading, role, allowedRoles, router]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading authentication...</div>;
    }

    // If check fails, returing null prevents flash of content before redirect executes
    if (!user || (allowedRoles && !allowedRoles.includes(role || 'student'))) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
