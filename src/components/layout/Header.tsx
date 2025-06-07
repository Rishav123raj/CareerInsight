
"use client";

import { useState, useEffect } from 'react';
import { BrainCircuit, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isAuthenticated') {
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(authStatus);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName'); 
    setIsAuthenticated(false);
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    router.push('/');
  };

  if (!isMounted) {
    return (
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BrainCircuit size={32} />
            <h1 className="text-2xl font-semibold tracking-tight">CareerInsight</h1>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 rounded-md bg-primary/50 animate-pulse"></div>
            <div className="h-10 w-24 rounded-md bg-primary/50 animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <BrainCircuit size={32} />
          <h1 className="text-2xl font-semibold tracking-tight">CareerInsight</h1>
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard/student">
                <Button variant="ghost" className="hover:bg-primary/80 text-primary-foreground">
                  <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleSignOut} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <LogOut className="mr-2 h-5 w-5" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" className="hover:bg-primary/80 text-primary-foreground">
                  <LogIn className="mr-2 h-5 w-5" /> Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                 <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
