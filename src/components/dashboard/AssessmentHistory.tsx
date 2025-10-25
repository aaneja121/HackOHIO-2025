import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Assessment {
  id: string;
  image_url: string;
  risk_score: number;
  status: string;
  ai_analysis: string;
  recommendations: string;
  created_at: string;
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
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("wound_assessments")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
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
    <Card>
      <CardHeader>
        <CardTitle>Assessment History</CardTitle>
        <CardDescription>Your recent wound assessments</CardDescription>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No assessments yet. Upload your first wound photo to get started.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={assessment.image_url}
                        alt="Wound assessment"
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(assessment.status)}
                            <Badge variant={getStatusVariant(assessment.status)}>
                              {assessment.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Risk Score: {assessment.risk_score}/100
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(assessment.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{assessment.ai_analysis}</p>
                        {assessment.recommendations && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Recommendation:</strong> {assessment.recommendations}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};