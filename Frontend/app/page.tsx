'use client'

import { useEffect, useState } from "react";

// Supabase removed - using demo/local stubs
import { AuthForm } from "@/components/auth/AuthForm";
import { WoundUpload } from "@/components/dashboard/WoundUpload";
import { AssessmentHistory } from "@/components/dashboard/AssessmentHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, LogOut, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [user, setUser] = useState<any>({ id: 'demo', name: 'Demo User' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Demo app: no external auth. Keep effect for parity with previous behavior.
    return () => {};
  }, []);

  const handleLogout = async () => {
    // Demo mode - logout is a no-op
    toast({
      title: "Demo Mode",
      description: "Logout is disabled in demo mode.",
    });
  };

  const handleAnalysisComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Aegis</h1>
            </div>
            <p className="text-muted-foreground">AI-Powered Post-Surgical Recovery Assistant</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Aegis</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Welcome to Your Recovery Dashboard
              </CardTitle>
              <CardDescription>
                Monitor your post-surgical recovery with AI-powered wound analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <WoundUpload onAnalysisComplete={handleAnalysisComplete} />
          <AssessmentHistory refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}

