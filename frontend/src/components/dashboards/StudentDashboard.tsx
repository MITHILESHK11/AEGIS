
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, BookOpen, Briefcase, ChevronRight, AlertCircle, Clock, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StudentDashboard = () => (
    <div className="space-y-8 animate-in fade-in-50 duration-500 pb-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20">
                <div className="h-64 w-64 rounded-full bg-white blur-3xl"></div>
            </div>
            <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Student Command Center</h2>
                <p className="text-blue-100 max-w-xl text-lg">Manage your campus life, academics, and career growth securely and efficiently.</p>
                <div className="mt-6 flex gap-3">
                    <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm">
                        View Schedule
                    </Button>
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                        Profile Settings
                    </Button>
                </div>
            </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
                title="Support & Feedback"
                link="/grievances"
                icon={FileText}
                color="text-rose-400"
                bgColor="bg-rose-500/10"
                description="Track status & file new grievances"
            />
            <DashboardCard
                title="Learning Resources"
                link="/resources"
                icon={BookOpen}
                color="text-blue-400"
                bgColor="bg-blue-500/10"
                description="Access study materials & papers"
            />
            <DashboardCard
                title="Career Portal"
                link="/opportunities"
                icon={Briefcase}
                color="text-emerald-400"
                bgColor="bg-emerald-500/10"
                description="Internships & research roles"
            />
            <DashboardCard
                title="Academic Manager"
                link="/student/courses"
                icon={BookOpen}
                color="text-indigo-400"
                bgColor="bg-indigo-500/10"
                description="Monitor attendance & course credits"
            />
            <DashboardCard
                title="My Applications"
                link="/student/applications"
                icon={Briefcase}
                color="text-amber-400"
                bgColor="bg-amber-500/10"
                description="Review your active applications"
            />
            <DashboardCard
                title="Fiscal Insights"
                link="/student/ledger"
                icon={Clock}
                color="text-slate-400"
                bgColor="bg-slate-500/10"
                description="Track transactions & deadlines"
            />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aegis-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Recent Updates</h3>
                    <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-400 hover:text-white">View All</Button>
                </div>
                <div className="space-y-4">
                    <ActivityItem
                        title="Grievance #1234 Resolved"
                        description="Your request regarding WiFi has been addressed."
                        time="2h ago"
                        icon={CheckCircle}
                        iconColor="text-green-400"
                        iconBg="bg-green-500/10"
                    />
                    <ActivityItem
                        title="New Resource Added"
                        description="Prof. Smith uploaded 'Week 5 Slides'."
                        time="5h ago"
                        icon={BookOpen}
                        iconColor="text-blue-400"
                        iconBg="bg-blue-500/10"
                    />
                    <ActivityItem
                        title="Internship Application Update"
                        description="Your application for 'AI Research' was viewed."
                        time="1d ago"
                        icon={Briefcase}
                        iconColor="text-amber-400"
                        iconBg="bg-amber-500/10"
                    />
                </div>
            </div>

            <div className="aegis-card p-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/20 p-2 rounded-lg backdrop-blur-md">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Campus Support</h3>
                        </div>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Need assistance with your account or campus services? Our support team is available 24/7 to help you resolve any technical or administrative issues.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none">
                            Get Help
                        </Button>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            Documentation
                        </Button>
                    </div>
                </div>
                {/* Decorative Background Icon */}
                <Shield className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
            </div>
        </div>
    </div>
);

const ActivityItem = ({ title, description, time, icon: Icon, iconColor, iconBg }: any) => (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 group">
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{title}</h4>
            <p className="text-xs text-slate-400 truncate">{description}</p>
        </div>
        <span className="text-xs text-slate-500 font-medium shrink-0">{time}</span>
    </div>
);

const DashboardCard = ({ title, link, icon: Icon, color, bgColor, description }: any) => {
    return (
        <Link href={link} className="block h-full">
            <div className="aegis-card h-full p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="w-5 h-5 text-white/30" />
                </div>

                <div className="flex flex-col h-full justify-between relative z-10">
                    <div>
                        <div className={`w-12 h-12 rounded-2xl ${bgColor} ${color} flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">{description}</p>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
            </div>
        </Link>
    )
}
