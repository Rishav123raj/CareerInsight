
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ArrowRight, UserCircle } from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/signin');
    } else {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }
      setIsAuthenticating(false);
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
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center space-y-8">
        <UserCircle className="h-24 w-24 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome to Your Dashboard{userName ? `, ${userName}` : ''}!
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          This is your personal space to manage your profile and gain insights into your career potential.
          Get started by exploring our AI-powered career prediction tools.
        </p>

        <Card className="w-full max-w-md shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Sparkles className="h-7 w-7 text-primary" />
              Career Predictor
            </CardTitle>
            <CardDescription className="text-center">
              Analyze your profile and get AI-driven career insights, recommendations, and pathway suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/dashboard/career-predictor">
              <Button size="lg" className="group text-base py-6 px-8">
                Predict Your Career Potential
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
