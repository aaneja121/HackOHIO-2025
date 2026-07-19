import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, CheckCircle, AlertTriangle, History } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface Assessment {
  id: string;
  image_url: string;
  risk_score: number | null;
  status: string;
  ai_analysis: string | null;
  recommendations: string | null;
  created_at: string | null;
}

interface AssessmentHistoryProps {
  refreshTrigger: number;
}

export const AssessmentHistory = ({ refreshTrigger }: AssessmentHistoryProps) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, [refreshTrigger]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const storedAssessments = localStorage.getItem('wound_assessments');
      const data = storedAssessments ? JSON.parse(storedAssessments) : [];
      
      data.sort((a: Assessment, b: Assessment) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      });
      
      setAssessments(data);
    } catch (error) {
      console.error("Error loading assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500 drop-shadow-sm" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500 drop-shadow-sm" />;
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500 drop-shadow-sm" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "healthy":
        return "secondary";
      case "warning":
        return "default";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg dark:bg-gray-950/40 ring-1 ring-black/5 dark:ring-white/10 h-full flex flex-col justify-center items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4 animate-pulse">Loading assessments...</p>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg dark:bg-gray-950/40 ring-1 ring-black/5 dark:ring-white/10 h-full">
      <CardHeader className="border-b border-black/5 dark:border-white/5 pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 shadow-inner ring-1 ring-primary/20">
            <History className="h-6 w-6 text-primary" />
          </div>
          Assessment History
        </CardTitle>
        <CardDescription className="text-base mt-2">Track your recovery progress over time</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-primary/5 p-6 rounded-full mb-4">
              <History className="h-12 w-12 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Assessments Yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Upload your first wound photo using the AI scanner to begin tracking your recovery journey.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 p-6">
              {assessments.map((assessment) => {
                const isCritical = assessment.status === 'critical';
                const isWarning = assessment.status === 'warning';
                const isHealthy = assessment.status === 'healthy';
                const riskScore = assessment.risk_score || 0;
                
                return (
                  <Card 
                    key={assessment.id} 
                    className={`border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white/60 dark:bg-black/40 ring-1 
                      ${isCritical ? 'ring-red-500/50 shadow-red-500/10' : ''}
                      ${isWarning ? 'ring-yellow-500/50 shadow-yellow-500/10' : ''}
                      ${isHealthy ? 'ring-green-500/50 shadow-green-500/10' : ''}
                      ${!isCritical && !isWarning && !isHealthy ? 'ring-black/5 dark:ring-white/10' : ''}
                    `}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image Section */}
                        <div className="relative w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 bg-black/5">
                          <Image
                            src={assessment.image_url}
                            alt="Wound assessment"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:hidden" />
                          <span className="absolute bottom-2 left-2 text-white text-xs font-medium sm:hidden">
                            {assessment.created_at ? format(new Date(assessment.created_at), "MMM d, yyyy") : "Unknown"}
                          </span>
                        </div>
                        
                        {/* Content Section */}
                        <div className="flex-1 p-5 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5">
                              {getStatusIcon(assessment.status)}
                              <Badge variant={getStatusVariant(assessment.status)} className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                                {assessment.status}
                              </Badge>
                            </div>
                            <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground bg-primary/5 px-2.5 py-1 rounded-md">
                              {assessment.created_at ? format(new Date(assessment.created_at), "MMM d, h:mm a") : "Unknown"}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Score</span>
                                <span className="text-sm font-bold">{riskScore}%</span>
                              </div>
                              <Progress value={riskScore} className="h-1.5 bg-primary/10" indicatorColor={riskScore > 75 ? "bg-red-500" : riskScore > 30 ? "bg-yellow-500" : "bg-green-500"} />
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                              <span className="font-semibold text-foreground">Analysis: </span>
                              {assessment.ai_analysis || "No analysis available."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};