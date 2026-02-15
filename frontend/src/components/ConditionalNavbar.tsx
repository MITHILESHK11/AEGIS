"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';

interface ConditionalNavbarProps {
    children: React.ReactNode;
}

export default function ConditionalNavbar({ children }: ConditionalNavbarProps) {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    // Hide navbar on landing page for unauthenticated users
    const isLandingPage = pathname === '/';
    const shouldHideNavbar = isLandingPage && !user && !loading;

    // Also hide padding on landing page
    const shouldHidePadding = isLandingPage && !user;

    if (shouldHideNavbar) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main className={shouldHidePadding ? "min-h-screen" : "pt-20 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
                {children}
            </main>
        </>
    );
}
