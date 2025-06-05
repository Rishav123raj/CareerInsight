
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, UserPlus, BrainCircuit, BarChartBig, SparklesIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import careerInsightImage from './image/careerinsight.png'; // Import the image

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]"> {/* Adjust for header height */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                    Unlock Your Career Potential with
                    <span className="text-primary"> CareerInsight</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Get personalized, AI-driven insights into your employability, discover tailored career paths, and receive actionable recommendations to boost your professional journey.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full min-[400px]:w-auto group">
                      Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">
                      Sign In <LogIn className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src={careerInsightImage} // Use the imported image
                alt="Career Dashboard Preview"
                width={400}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-xl"
                data-ai-hint="career dashboard abstract"
                priority // Add priority if it's a Large Contentful Paint (LCP) element
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
                  Why Choose CareerInsight?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform analyzes your unique profile to deliver insights that truly matter for your career growth.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <FeatureCard
                icon={<BrainCircuit className="h-8 w-8 text-primary" />}
                title="AI-Powered Employability Score"
                description="Receive a dynamic score based on your academics, skills, projects, and extracurriculars, with AI-driven feedback."
              />
              <FeatureCard
                icon={<SparklesIcon className="h-8 w-8 text-primary" />}
                title="Personalized Recommendations"
                description="Get actionable advice and tailored suggestions to enhance your profile and improve your job prospects."
              />
              <FeatureCard
                icon={<BarChartBig className="h-8 w-8 text-primary" />}
                title="Career Pathway Insights"
                description="Explore potential career paths and job roles that align with your strengths and aspirations, complete with resource suggestions."
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-foreground">
                Ready to Supercharge Your Career?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up today and take the first step towards a more informed and successful professional future.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <div className="flex gap-3 justify-center">
                 <Link href="/signup">
                    <Button size="lg" className="group">
                      Sign Up Now <UserPlus className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} CareerInsight. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-start space-y-2 p-6 rounded-lg bg-card shadow-lg hover:shadow-xl transition-shadow">
      <div className="p-3 rounded-md bg-primary/10 flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
