'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Heart,
  Menu,
  Home,
  Pill,
  User,
  Activity,
  Zap,
  FileText,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: Home },
  { href: '/patient/wound_check', label: 'Wound Check', icon: Zap },
  { href: '/patient/medication', label: 'Medication', icon: Pill },
  { href: '/patient/vitals', label: 'Vitals', icon: Activity },
  { href: '/patient/symptom-log', label: 'Symptoms', icon: FileText },
  { href: '/patient/therapy', label: 'Therapy', icon: Heart },
  { href: '/patient/profile', label: 'Profile', icon: User },
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-black/5 dark:border-white/5 bg-white/60 backdrop-blur-xl dark:bg-black/60 sticky top-0 z-40 transition-all duration-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight text-foreground">Healios</h1>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Dashboard</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-white dark:bg-gray-800 shadow-sm text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-l-0">
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 rounded-xl h-12 transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'}`}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
