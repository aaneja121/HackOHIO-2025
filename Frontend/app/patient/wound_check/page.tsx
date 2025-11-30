'use client'

import { WoundUpload } from '@/components/dashboard/WoundUpload';
import { AssessmentHistory } from '@/components/dashboard/AssessmentHistory';
import { useState } from 'react';

export default function WoundCheckPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAnalysisComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Daily Wound Check</h1>
        <p className="text-muted-foreground">
          Upload a photo of your surgical wound for AI-powered analysis
        </p>
      </div>

      <WoundUpload onAnalysisComplete={handleAnalysisComplete} />
      <AssessmentHistory refreshTrigger={refreshTrigger} />
    </div>
  );
}
