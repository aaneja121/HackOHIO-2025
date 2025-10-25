import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2 } from "lucide-react";

interface WoundUploadProps {
  onAnalysisComplete: () => void;
}

export const WoundUpload = ({ onAnalysisComplete }: WoundUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Create a local URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      
      setUploading(false);
      setAnalyzing(true);

      toast({
        title: "Analyzing wound...",
        description: "Processing your image (demo mode)...",
      });

      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo analysis response
      const analysisData = {
        riskScore: 25,
        status: 'healthy',
        analysis: 'No obvious signs of infection detected. The wound appears to be healing normally.',
        recommendations: 'Continue following standard wound care instructions. Keep the area clean and dry.',
      };

      // Store analysis in localStorage for demo persistence
      const assessments = JSON.parse(localStorage.getItem('wound_assessments') || '[]');
      assessments.push({
        id: Date.now(),
        created_at: new Date().toISOString(),
        image_url: imageUrl,
        risk_score: analysisData.riskScore,
        status: analysisData.status,
        ai_analysis: analysisData.analysis,
        recommendations: analysisData.recommendations,
      });
      localStorage.setItem('wound_assessments', JSON.stringify(assessments));

      toast({
        title: "Analysis complete!",
        description: `Status: ${analysisData.status.toUpperCase()}`,
        variant: analysisData.status === "critical" ? "destructive" : "default",
      });

      onAnalysisComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      handleFileUpload(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Wound Photo
        </CardTitle>
        <CardDescription>
          Take a clear photo of your surgical wound for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              id="wound-upload"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading || analyzing}
              className="hidden"
            />
            <label htmlFor="wound-upload" className="cursor-pointer">
              {uploading || analyzing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Analyzing with AI..."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload or take photo</p>
                  <p className="text-xs text-muted-foreground">
                    Supported: JPG, PNG, WEBP
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};