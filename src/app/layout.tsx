import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Using GeistSans from its own package
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster"

// The GeistSans object from 'geist/font/sans' directly provides the .variable property
// which sets up the CSS variable (e.g., --font-geist-sans)

export const metadata: Metadata = {
  title: 'EmployableAI - Your Career Insight Partner',
  description: 'Analyze academic and non-academic performance to predict and improve employability with AI-driven insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
