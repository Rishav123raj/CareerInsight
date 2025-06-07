
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Mail, KeyRound, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const signUpFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

type SignUpFormData = z.infer<typeof signUpFormSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { control, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    // Simulate API call for sign-up
    await new Promise(resolve => setTimeout(resolve, 1500));

    // SIMULATED: In a real app, you'd create a user in your backend.
    console.log("Simulated sign-up with:", data.name, data.email);

    toast({
      title: "Account Created!",
      description: "You can now sign in with your new account.",
    });
    router.push('/signin'); // Redirect to sign-in page after successful sign-up
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] bg-muted/40 py-8 px-4">
      <div className="w-full max-w-4xl lg:max-w-5xl rounded-xl shadow-2xl bg-card overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[70vh] lg:min-h-[auto]">
          {/* Left Column: Form */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <CardHeader className="text-center p-0 mb-6">
              <div className="mx-auto mb-4 flex justify-center">
                <UserPlus className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
              <CardDescription>Join CareerInsight to unlock your career potential.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                 <div className="space-y-1.5">
                  <Label htmlFor="name" className={cn(errors.name ? 'text-destructive' : '')}>Full Name</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="name"
                          placeholder="Your Name"
                          {...field}
                          className={cn("pl-10", errors.name ? 'border-destructive' : '')}
                        />
                      )}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className={cn(errors.confirmPassword ? 'text-destructive' : '')}>Confirm Password</Label>
                   <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className={cn("pl-10", errors.confirmPassword ? 'border-destructive' : '')}
                        />
                      )}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 mt-2">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/signin" className="font-medium text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </CardContent>
          </div>

          {/* Right Column: Image */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-background p-8 md:p-12 relative">
            <Image
              src="https://img.freepik.com/premium-vector/woman-with-laptop-showing_126609-931.jpg?semt=ais_hybrid&w=740"
              alt="Illustration of a person with a laptop creating an account"
              width={550}
              height={550}
              className="object-contain rounded-lg shadow-md"
              priority
              data-ai-hint="woman laptop illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
