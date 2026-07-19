'use client'

import { useState } from "react";
import Link from "next/link";
import { WoundUpload } from "@/components/dashboard/WoundUpload";
import { AssessmentHistory } from "@/components/dashboard/AssessmentHistory";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Shield, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAnalysisComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-black/5 dark:border-white/5 bg-white/60 backdrop-blur-xl dark:bg-black/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Healios</h1>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest">Recovery Assistant</p>
              </div>
            </div>
            <Link href="/patient/dashboard">
              <Button className="rounded-full h-10 px-6 font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                Dashboard
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Hero Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-2 bg-primary/10 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1 inline" /> Powered by Advanced AI
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Smart Recovery <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Monitoring</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Upload photos of your surgical wound for instant AI-powered analysis, risk assessment, and personalized care recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload (Takes up 5 columns on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            <WoundUpload onAnalysisComplete={handleAnalysisComplete} />
          </div>

          {/* Right Column: History (Takes up 7 columns on large screens) */}
          <div className="lg:col-span-7">
            <AssessmentHistory refreshTrigger={refreshTrigger} />
          </div>

        </div>
      </main>
    </div>
  );
}

// Inline badge component since it wasn't imported in original file to avoid breaking
function Badge({ className, variant, children }: any) {
  return (
    <span className={`inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  )
}

