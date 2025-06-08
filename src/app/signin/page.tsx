
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
import Image from 'next/image';
import { signInUser } from '@/actions/auth'; 

const signInFormSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"), 
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
    
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await signInUser(formData);

    if (result.success && result.user) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', result.user.name); 
      
      toast({
        title: "Signed In Successfully!",
        description: result.message || "Welcome back! Redirecting you to your dashboard...",
      });
      router.push('/dashboard/student'); 
    } else {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: result.message || "Invalid credentials or an error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] bg-muted/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-5xl rounded-xl shadow-2xl bg-card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] lg:min-h-[auto]">
          {/* Form Section */}
          <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12">
            <Card className="w-full shadow-none border-none"> 
              <CardHeader className="text-center p-0 mb-6">
                <div className="mx-auto mb-4">
                  <LogIn className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold">Welcome Back!</CardTitle>
                <CardDescription className="text-sm sm:text-base">Sign in to access your CareerInsight Dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="email" className={cn("text-sm", errors.email ? 'text-destructive' : '')}>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            className={cn("pl-10 text-sm sm:text-base", errors.email ? 'border-destructive' : '')}
                          />
                        )}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="password" className={cn("text-sm", errors.password ? 'text-destructive' : '')}>Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className={cn("pl-10 text-sm sm:text-base", errors.password ? 'border-destructive' : '')}
                          />
                        )}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full text-base sm:text-lg py-3 sm:py-6">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
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

          {/* Image Section */}
          <div className="flex order-first lg:order-last items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-background p-6 sm:p-8 md:p-12 relative">
            <Image
              src="https://media.istockphoto.com/id/1178763127/vector/man-with-laptop-sitting-on-the-chair-freelance-or-studying-concept-cute-illustration-in-flat.jpg?s=612x612&w=0&k=20&c=gzk5c0q1DkndI2IFHIBCHIapEiFHm6JuG0-6C3xL-3I="
              alt="Illustration of a person signing in"
              width={500} 
              height={500} 
              className="w-full max-w-[280px] h-auto sm:max-w-[320px] md:max-w-[380px] lg:max-w-[450px] object-contain rounded-lg"
              priority
              data-ai-hint="man laptop illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
