
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-6 animate-in fade-in zoom-in-50">
            <div className="bg-destructive/10 p-6 rounded-full text-destructive">
                <ShieldAlert className="w-16 h-16" />
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Access Denied</h1>
                <p className="text-muted-foreground max-w-[500px] text-lg">
                    You do not have the necessary permissions to access this resource. Please contact your administrator if you believe this is an error.
                </p>
            </div>

            <div className="flex gap-4">
                <Link href="/dashboard">
                    <Button size="lg">Return to Dashboard</Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" size="lg">Go Home</Button>
                </Link>
            </div>
        </div>
    );
}
