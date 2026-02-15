
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, BookOpen, Briefcase, ChevronRight, Sparkles, TrendingUp, Users, Award } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show landing page to unauthenticated users
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center max-w-7xl mx-auto">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium rounded-full border bg-background/50 backdrop-blur">
            <Sparkles className="w-3 h-3 mr-1 inline" />
            New: Opportunity Portal is live!
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent"
        >
          The Campus OS <br /> for <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Modern Education</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AEGIS+ unifies grievances, academic resources, and career opportunities into one seamless, transparent platform. Built for students, faculty, and administrators.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto"
        >
          <Link href="/login" className="w-full">
            <Button size="lg" className="w-full text-lg h-12 shadow-lg hover:shadow-primary/25 transition-all group">
              Login to Portal
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button size="lg" variant="outline" className="w-full text-lg h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all">
              Create Account
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          Join 1,200+ students and faculty already using AEGIS+
        </motion.p>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need, One Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Streamline campus operations with powerful tools designed for the modern educational ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Voice & Governance"
              description="Transparent grievance redressal system with real-time tracking and authority escalations."
              delay={0.1}
            />
            <FeatureCard
              icon={BookOpen}
              title="Academic Mastery"
              description="Centralized repository for notes, papers, and assignments. Upload and share resources seamlessly."
              delay={0.2}
            />
            <FeatureCard
              icon={Briefcase}
              title="Future Opportunities"
              description="Exclusive internship and research listings. Apply directly with one click."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-24 max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Trusted by the Campus Community</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          Real results from real students and faculty members using AEGIS+ every day.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat icon={Users} number="1,200+" label="Active Students" />
          <Stat icon={TrendingUp} number="98%" label="Resolution Rate" />
          <Stat icon={BookOpen} number="500+" label="Resources Shared" />
          <Stat icon={Award} number="50+" label="Partner Companies" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Campus Experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students and faculty already benefiting from a unified campus platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg h-12 px-8 shadow-lg hover:shadow-primary/25">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg h-12 px-8 border-primary/20">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 AEGIS+. Built for modern education. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group p-8 bg-card border border-border rounded-xl shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

function Stat({ icon: Icon, number, label }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center p-4 group"
    >
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-4xl font-extrabold text-primary mb-2">{number}</span>
      <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
    </motion.div>
  )
}
