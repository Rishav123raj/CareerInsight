
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Mail, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const signInFormSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInFormSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { control, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    // Simulate API call for sign-in
    await new Promise(resolve => setTimeout(resolve, 1500));

    // SIMULATED: In a real app, you'd verify credentials against a backend.
    // For this demo, any valid email/password will "work".
    console.log("Simulated sign-in with:", data);

    // Simulate successful login
    localStorage.setItem('isAuthenticated', 'true');
    // Optionally store user info if needed, e.g., localStorage.setItem('userEmail', data.email);
    // If user's name was captured during sign-up and you want to display it on the dashboard:
    // const userName = localStorage.getItem('tempUserName'); // Assuming name was stored temporarily
    // if (userName) {
    //   localStorage.setItem('userName', userName);
    //   localStorage.removeItem('tempUserName');
    // }


    toast({
      title: "Signed In Successfully!",
      description: "Welcome back! Redirecting you to your dashboard...",
    });
    router.push('/dashboard/student'); // Redirect to the new student dashboard
    // No need to setIsLoading(false) here as we are redirecting
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.24))] bg-muted/40 py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <LogIn className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your CareerInsight Dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className={cn(errors.email ? 'text-destructive' : '')}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      className={cn("pl-10", errors.email ? 'border-destructive' : '')}
                    />
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={cn(errors.password ? 'text-destructive' : '')}>Password</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className={cn("pl-10", errors.password ? 'border-destructive' : '')}
                    />
                  )}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
