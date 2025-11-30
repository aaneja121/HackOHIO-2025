import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface RiskScoreDisplayProps {
  score: number;
  status: 'Healthy' | 'At-Risk' | 'Critical';
}

export const RiskScoreDisplay = ({ score, status }: RiskScoreDisplayProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'At-Risk':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'At-Risk':
        return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      case 'Critical':
        return <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const riskPercentage = Math.max(0, Math.min(100, score));

  return (
    <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            {getStatusIcon(status)}
          </div>
          Recovery Status
        </CardTitle>
        <CardDescription>Your current healing progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Risk Score</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{score}</span>
              <Badge className={`${getStatusColor(status)}`}>
                {status}
              </Badge>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  status === 'Healthy' ? 'bg-green-500' :
                  status === 'At-Risk' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                // eslint-disable-next-line react/no-unknown-property
                style={{ width: `${riskPercentage}%` } as React.CSSProperties}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {status === 'Healthy' && 'Your recovery is progressing well. Continue following your care plan.'}
              {status === 'At-Risk' && 'Monitor your recovery closely. Contact your doctor if symptoms worsen.'}
              {status === 'Critical' && 'Contact your healthcare provider immediately.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
