import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <BrainCircuit size={32} />
          <h1 className="text-2xl font-semibold tracking-tight">EmployableAI</h1>
        </Link>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
}
