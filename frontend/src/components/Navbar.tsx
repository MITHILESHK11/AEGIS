
"use client";

import * as React from "react";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Menu, X, Shield, BookOpen, Briefcase, FileText, TrendingUp, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

import { useRouter, usePathname } from "next/navigation";

// Helper Components for Active State
const DesktopNavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: any }) => {
    const pathname = usePathname();
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                isActive
                    ? "text-white bg-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
        >
            {Icon && <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400")} />}
            <span>{children}</span>
        </Link>
    );
};

const MobileNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                isActive ? "bg-primary/20 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
            )}
        >
            {children}
        </Link>
    );
};

const Navbar = () => {
    const { user, role, loading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setMobileMenuOpen(false);
            router.push('/login');
        } catch (error: any) {
            console.error("Error signing out", error);
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/85 backdrop-blur-md border-b border-white/10 shadow-lg transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="font-bold text-2xl tracking-tighter flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:to-primary/80 transition-all">AEGIS+</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-1 items-center">
                        {user && <DesktopNavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</DesktopNavLink>}

                        {role === 'student' && (
                            <>
                                <DesktopNavLink href="/grievances" icon={FileText}>Grievances</DesktopNavLink>
                                <DesktopNavLink href="/student/courses" icon={BookOpen}>Academics</DesktopNavLink>
                                <DesktopNavLink href="/resources" icon={BookOpen}>Resources</DesktopNavLink>
                                <DesktopNavLink href="/opportunities" icon={Briefcase}>Careers</DesktopNavLink>
                                <DesktopNavLink href="/student/ledger" icon={FileText}>Ledger</DesktopNavLink>
                            </>
                        )}

                        {role === 'faculty' && (
                            <>
                                <DesktopNavLink href="/faculty/upload" icon={BookOpen}>Upload</DesktopNavLink>
                                <DesktopNavLink href="/faculty/resources" icon={FileText}>Resources</DesktopNavLink>
                                <DesktopNavLink href="/faculty/opportunities" icon={Briefcase}>Post Job</DesktopNavLink>
                                <DesktopNavLink href="/faculty/my-opportunities" icon={Briefcase}>My Jobs</DesktopNavLink>
                                <DesktopNavLink href="/faculty/applications" icon={User}>Applicants</DesktopNavLink>
                            </>
                        )}

                        {role === 'authority' && (
                            <>
                                <DesktopNavLink href="/authority/grievances" icon={Shield}>Grievances</DesktopNavLink>
                            </>
                        )}

                        {role === 'admin' && (
                            <>
                                <DesktopNavLink href="/admin/users" icon={User}>Users</DesktopNavLink>
                                <DesktopNavLink href="/admin/analytics" icon={TrendingUp}>Analytics</DesktopNavLink>
                                <DesktopNavLink href="/admin/audit-logs" icon={FileText}>Audit Logs</DesktopNavLink>
                            </>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-medium leading-none text-white/90">
                                        {user.email ? user.email.split('@')[0] : 'User'}
                                    </span>
                                    <Badge variant="outline" className="mt-1 text-[10px] px-2 h-4 uppercase tracking-wider font-bold border-primary/50 text-primary bg-primary/10">
                                        {loading ? <span className="animate-pulse">...</span> : (role || 'guest')}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out" className="text-muted-foreground hover:text-red-400 hover:bg-red-950/30">
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white hover:bg-white/10">
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 p-4 space-y-4 shadow-2xl animate-in slide-in-from-top-5">
                    <div className="space-y-2">
                        {user && <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>}

                        {role === 'student' && (
                            <>
                                <MobileNavLink href="/grievances" onClick={() => setMobileMenuOpen(false)}>Grievances</MobileNavLink>
                                <MobileNavLink href="/student/courses" onClick={() => setMobileMenuOpen(false)}>Academics</MobileNavLink>
                                <MobileNavLink href="/resources" onClick={() => setMobileMenuOpen(false)}>Resources</MobileNavLink>
                                <MobileNavLink href="/opportunities" onClick={() => setMobileMenuOpen(false)}>Careers</MobileNavLink>
                                <MobileNavLink href="/student/ledger" onClick={() => setMobileMenuOpen(false)}>Ledger</MobileNavLink>
                            </>
                        )}
                        {role === 'faculty' && <MobileNavLink href="/faculty/upload" onClick={() => setMobileMenuOpen(false)}>Upload</MobileNavLink>}
                        {role === 'authority' && <MobileNavLink href="/authority/grievances" onClick={() => setMobileMenuOpen(false)}>Grievances</MobileNavLink>}
                        {role === 'admin' && <MobileNavLink href="/admin/users" onClick={() => setMobileMenuOpen(false)}>Users</MobileNavLink>}
                    </div>
                    <div className="pt-4 border-t border-white/10">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{user.email}</span>
                                    <span className="text-xs text-muted-foreground capitalize">{role}</span>
                                </div>
                                <Button variant="destructive" size="sm" onClick={handleSignOut}>Sign Out</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                <Link href="/login" className="w-full"><Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Login</Button></Link>
                                <Link href="/register" className="w-full"><Button className="w-full">Get Started</Button></Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
