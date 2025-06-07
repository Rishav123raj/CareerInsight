
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Mail, KeyRound, UserCircle, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { signUpUser } from '@/actions/auth';
import './signup-page-styles.css'; // Import the new CSS file

const signUpFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
    
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await signUpUser(formData);

    if (result.success) {
      toast({
        title: "Account Created!",
        description: result.message || "You can now sign in with your new account.",
      });
      router.push('/signin');
    } else {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: result.message || "An error occurred. Please try again.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-container">
        <div className="login-box"> {/* This class wraps both sections */}
          <div className="form-section">
            <div className="flex items-center justify-center mb-3 logo">
              <BrainCircuit size={28} className="mr-2" /> CareerInsight
            </div>
            <p className="welcome">Create your account to get started!</p>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-1"> {/* Reduced space-y for custom margins */}
              
              <div className="input-wrapper">
                <Label htmlFor="name" className={cn(errors.name ? 'text-destructive' : '')}>Full Name</Label>
                 <UserCircle className="h-5 w-5" />
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="name"
                      placeholder="Your Name"
                      {...field}
                      data-geist-input="true" 
                      className={cn(errors.name ? 'border-destructive' : '')}
                    />
                  )}
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>

              <div className="input-wrapper">
                <Label htmlFor="email" className={cn(errors.email ? 'text-destructive' : '')}>Email</Label>
                <Mail className="h-5 w-5" />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      data-geist-input="true"
                      className={cn(errors.email ? 'border-destructive' : '')}
                    />
                  )}
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>

              <div className="input-wrapper">
                <Label htmlFor="password" className={cn(errors.password ? 'text-destructive' : '')}>Password</Label>
                <KeyRound className="h-5 w-5" />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      {...field}
                      data-geist-input="true"
                      className={cn(errors.password ? 'border-destructive' : '')}
                    />
                  )}
                />
                {errors.password && <p className="error-message">{errors.password.message}</p>}
              </div>

              <div className="input-wrapper">
                <Label htmlFor="confirmPassword" className={cn(errors.confirmPassword ? 'text-destructive' : '')}>Confirm Password</Label>
                <KeyRound className="h-5 w-5" />
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      {...field}
                      data-geist-input="true"
                      className={cn(errors.confirmPassword ? 'border-destructive' : '')}
                    />
                  )}
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="signin-btn mt-4">
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
            <p className="login-prompt-text">
              Already have an account?{' '}
              <Link href="/signin">
                Sign In
              </Link>
            </p>
          </div>

          <div className="image-section">
            <Image
              src="https://img.freepik.com/premium-vector/woman-with-laptop-showing_126609-931.jpg?semt=ais_hybrid&w=740"
              alt="Illustration of a person with a laptop creating an account"
              width={550}
              height={550}
              className="object-contain" 
              priority
              data-ai-hint="woman laptop illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
