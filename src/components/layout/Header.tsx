
"use client";

import { useState, useEffect } from 'react';
import { BrainCircuit, LogIn, UserPlus, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth'; // Import User type

export function Header() {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);


  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null); // Update state immediately
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/'); // Redirect to home after sign out
    } catch (error) {
      console.error("Sign out error", error);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "An error occurred while signing out.",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode, onClick?: () => void }) => (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        className="w-full justify-start text-base py-3 hover:bg-primary/80 text-primary-foreground md:w-auto md:justify-center md:text-sm md:py-2"
        onClick={() => {
          setIsMobileMenuOpen(false);
          if (onClick) onClick();
        }}
      >
        {children}
      </Button>
    </Link>
  );

  const AuthButton = ({ children, onClick, isPrimary = false }: { children: React.ReactNode, onClick?: () => void, isPrimary?: boolean }) => (
    <Button
      variant={isPrimary ? "secondary" : "ghost"}
      onClick={() => {
        setIsMobileMenuOpen(false);
        if (onClick) onClick();
      }}
      className={cn(
        "w-full justify-start text-base py-3 md:w-auto md:justify-center md:text-sm md:py-2",
        isPrimary ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "hover:bg-primary/80 text-primary-foreground"
      )}
    >
      {children}
    </Button>
  );


  if (!isMounted) {
    return (
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BrainCircuit size={28} className="sm:h-7 sm:w-7" />
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">CareerInsight</h1>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 rounded-md bg-primary/50 animate-pulse md:h-10 md:w-24"></div>
            <div className="h-8 w-20 rounded-md bg-primary/50 animate-pulse md:h-10 md:w-24"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <BrainCircuit size={28} className="sm:h-7 sm:w-7" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">CareerInsight</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {currentUser ? (
            <>
              <NavLink href="/dashboard/student">
                <LayoutDashboard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Dashboard
              </NavLink>
              <AuthButton onClick={handleSignOut} isPrimary>
                <LogOut className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Sign Out
              </AuthButton>
            </>
          ) : (
            <>
              <Link href="/signin" passHref>
                <AuthButton>
                  <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Sign In
                </AuthButton>
              </Link>
              <Link href="/signup" passHref>
                 <AuthButton isPrimary>
                   <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Sign Up
                 </AuthButton>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-primary text-primary-foreground p-0 flex flex-col">
              <SheetHeader className="flex flex-row items-center justify-between p-4 border-b border-primary/50">
                 <SheetTitle asChild>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 hover:opacity-90 transition-opacity text-primary-foreground">
                        <BrainCircuit size={24} />
                        <span className="text-lg font-semibold tracking-tight">CareerInsight</span>
                    </Link>
                </SheetTitle>
                <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col gap-2 p-4">
                {currentUser ? (
                  <>
                    <NavLink href="/dashboard/student">
                      <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                    </NavLink>
                    <AuthButton onClick={handleSignOut} isPrimary>
                      <LogOut className="mr-2 h-5 w-5" /> Sign Out
                    </AuthButton>
                  </>
                ) : (
                  <>
                    <Link href="/signin" passHref>
                      <AuthButton>
                         <LogIn className="mr-2 h-5 w-5" /> Sign In
                      </AuthButton>
                    </Link>
                    <Link href="/signup" passHref>
                      <AuthButton isPrimary>
                        <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                      </AuthButton>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
