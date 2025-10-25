import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      const imageBase64 = reader.result as string;

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("wound-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("wound-images")
        .getPublicUrl(fileName);

      setUploading(false);
      setAnalyzing(true);

      toast({
        title: "Analyzing wound...",
        description: "Our AI is examining your image for signs of infection.",
      });

      // Call analysis edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-wound",
        {
          body: { imageBase64, patientId: user.id },
        }
      );

      if (analysisError) throw analysisError;

      // Save assessment to database
      const { error: dbError } = await supabase.from("wound_assessments").insert({
        patient_id: user.id,
        image_url: publicUrl,
        risk_score: analysisData.riskScore,
        status: analysisData.status,
        ai_analysis: analysisData.analysis,
        recommendations: analysisData.recommendations,
      });

      if (dbError) throw dbError;

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
              capture="environment"
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