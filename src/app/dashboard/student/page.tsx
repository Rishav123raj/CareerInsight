
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Sparkles,
  ArrowRight,
  UserCircle,
  UserCheck,
  Edit3,
  Zap,
  BookOpen,
  Briefcase,
  Lightbulb
} from 'lucide-react';

interface UserData {
  displayName: string | null;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userName = localStorage.getItem('userName');

    if (isAuthenticated) {
      setCurrentUser({ displayName: userName });
      setIsAuthenticating(false);
    } else {
      router.push('/signin');
    }
  }, [router]);

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.32))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-16">
      <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
        <UserCircle className="h-20 w-20 sm:h-24 sm:w-24 text-primary" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Welcome to Your Dashboard{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}!
        </h1>
        <p className="max-w-xl sm:max-w-2xl text-base sm:text-lg text-muted-foreground">
          This is your personal space to manage your profile and gain insights into your career potential.
          Get started by exploring our AI-powered career prediction tools.
        </p>

        <Card className="w-full max-w-sm sm:max-w-md shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              Career Predictor
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Analyze your profile and get AI-driven career insights, recommendations, and pathway suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/dashboard/career-predictor">
              <Button size="lg" className="group text-sm sm:text-base py-3 px-6 sm:py-6 sm:px-8">
                Predict Your Career Potential
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-8 sm:mb-10 text-foreground">
          Explore & Enhance Your Journey
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl gap-2">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                A complete and up-to-date profile in the Career Predictor helps us provide you with the most accurate and personalized insights.
              </p>
              <Button variant="outline" className="w-full group text-sm" asChild>
                <Link href="/dashboard/career-predictor">
                  <Edit3 className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  Update Profile & Get Insights
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl gap-2">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Button variant="ghost" className="w-full justify-start p-2 sm:p-3 text-sm hover:bg-secondary group" asChild>
                <Link href="/dashboard/career-predictor">
                  <Sparkles className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-accent transition-colors" />
                  Re-run AI Career Analysis
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-2 sm:p-3 text-sm hover:bg-secondary group" asChild>
                <Link href="#">
                  <BookOpen className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-accent transition-colors" />
                  Explore Learning Resources
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-2 sm:p-3 text-sm hover:bg-secondary group" disabled>
                <Link href="#">
                  <Briefcase className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  Browse Job Openings (Soon)
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl gap-2">
                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Food for Thought
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-sm italic text-muted-foreground border-l-4 border-primary pl-3 sm:pl-4 py-2 bg-secondary/30 rounded-r-md">
                "The best way to predict the future is to create it."
              </blockquote>
              <p className="text-xs text-muted-foreground mt-2 text-right">- Peter Drucker</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
