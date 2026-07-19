'use client'

import { useState } from "react";
import Link from "next/link";
import { WoundUpload } from "@/components/dashboard/WoundUpload";
import { AssessmentHistory } from "@/components/dashboard/AssessmentHistory";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAnalysisComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight">Healios</h1>
                <p className="text-xs text-muted-foreground">Post-Surgical Recovery Assistant</p>
              </div>
            </div>
            <Link href="/patient/dashboard">
              <Button>
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Upload */}
          <div className="lg:col-span-1 space-y-6">
            {/* Welcome Card */}
            <Card className="border-0 bg-white/60 backdrop-blur-md shadow-sm dark:bg-gray-950/60">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Monitor Recovery</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">
                      Upload photos of your surgical wound for instant AI-powered analysis and personalized recommendations.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Upload Section */}
            <WoundUpload onAnalysisComplete={handleAnalysisComplete} />
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-2">
            <AssessmentHistory refreshTrigger={refreshTrigger} />
          </div>

        </div>
      </main>
    </div>
  );
}

