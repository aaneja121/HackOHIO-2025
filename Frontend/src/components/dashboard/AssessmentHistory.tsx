import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

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
      // Load from localStorage in demo mode
      const storedAssessments = localStorage.getItem('wound_assessments');
      const data = storedAssessments ? JSON.parse(storedAssessments) : [];
      
      // Sort by created_at date descending (handle nulls)
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "healthy":
        return "secondary";
      case "warning":
        return "default";
      case "critical":
        return "destructive";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          Assessment History
        </CardTitle>
        <CardDescription className="mt-2">Your recent wound assessments</CardDescription>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No assessments yet. Upload your first wound photo to get started.
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {assessments.map((assessment) => {
                const isCritical = assessment.status === 'critical';
                const isWarning = assessment.status === 'warning';
                const isHealthy = assessment.status === 'healthy';
                
                return (
                  <Card 
                    key={assessment.id} 
                    className={`border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md bg-white dark:bg-gray-950
                      ${isCritical ? 'border-l-4 border-l-red-500' : ''}
                      ${isWarning ? 'border-l-4 border-l-yellow-500' : ''}
                      ${isHealthy ? 'border-l-4 border-l-green-500' : ''}
                    `}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={assessment.image_url}
                            alt="Wound assessment"
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(assessment.status)}
                              <Badge variant={getStatusVariant(assessment.status)} className="text-xs">
                                {assessment.status.toUpperCase()}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {assessment.created_at ? format(new Date(assessment.created_at), "MMM d") : "Unknown"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Risk Score: <span className="font-semibold text-foreground">{assessment.risk_score || 0}%</span>
                            </p>
                            <p className="text-sm line-clamp-1 text-muted-foreground">{assessment.ai_analysis || "No analysis"}</p>
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