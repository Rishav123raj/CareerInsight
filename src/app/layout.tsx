
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'CareerInsight',
  description: 'Analyze academic and non-academic performance to predict and improve employability with AI-driven insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} font-sans antialiased bg-background text-foreground`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow"> {/* Removed container and padding here, apply per-page */}
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
