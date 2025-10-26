import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2 } from "lucide-react";

// --- NEW: Define API constants ---
// Your backend is running on port 8000
const API_URL = "http://127.0.0.1:8000/predict"; 
// This is the key from your Backend/.env file
const API_KEY = "demo-key-123";
// ---

interface WoundUploadProps {
  onAnalysisComplete: () => void;
}

// --- NEW: Helper function to interpret model output ---
/**
 * Translates the raw prediction array from the AI model into human-readable data
 * for the UI.
 * * !!! IMPORTANT !!!
 * You MUST update this logic to match your model's classes.
 * We are ASSUMING:
 * - predictions[0] = "Healthy" probability
 * - predictions[1] = "At-Risk" probability
 * - predictions[2] = "Critical" probability
 */
const interpretPredictions = (predictions: number[]) => {
  const classNames = [
    'Abrasions', 'Bruises', 'Burns', 'Cut', 'Diabetic Wounds',
    'Laseration', 'Normal', 'Pressure Wounds', 'Surgical Wounds', 'Venous Wounds'
  ];

  let maxProb = -1;
  let maxIndex = -1;

  predictions.forEach((prob, index) => {
    if (prob > maxProb) {
      maxProb = prob;
      maxIndex = index;
    }
  });

  const predictedClass = classNames[maxIndex] || "unknown";
  let status = 'at-risk'; // Default to at-risk
  let analysis = "";
  let recommendations = "";

  // Logic to determine risk. We'll set it as (100 - % chance of "Normal")
  // This is a simple heuristic: the less "normal" it is, the higher the risk.
  const normalProbability = predictions[6] || 0;
  const riskScore = Math.round((1.0 - normalProbability) * 100);

  // --- This is the key logic mapping 10 classes to 3 statuses ---
  switch (predictedClass) {
    case 'Normal':
      status = 'healthy';
      analysis = "AI analysis: The area appears to be normal, healthy skin or a well-healed wound.";
      recommendations = "Continue to monitor the area as instructed by your doctor.";
      break;

    case 'Surgical Wounds':
      status = 'at-risk'; // This is the class we are most interested in monitoring
      analysis = "AI analysis: A surgical wound has been identified. It appears to be in a standard healing phase.";
      recommendations = "Keep the area clean and dry. Watch for any changes, such as increased redness, swelling, or discharge.";
      break;

    case 'Abrasions':
    case 'Bruises':
    case 'Burns':
    case 'Cut':
    case 'Laseration':
      status = 'at-risk'; // These are other wound types, not "normal"
      analysis = `AI analysis: An injury identified as '${predictedClass}' has been detected.`;
      recommendations = "Please follow standard first-aid for this type of injury. If this is near your surgical site, monitor it closely.";
      break;

    case 'Diabetic Wounds':
    case 'Pressure Wounds':
    case 'Venous Wounds':
      status = 'critical'; // These are high-risk wound types
      analysis = `AI analysis: A high-risk wound type ('${predictedClass}') has been detected. This requires attention.`;
      recommendations = "Contact your healthcare provider immediately for evaluation, especially if this is near your surgical site.";
      break;

    default:
      status = 'at-risk';
      analysis = "AI analysis: Unable to clearly classify the image.";
      recommendations = "Please try taking a clearer photo. If concerned, contact your provider.";
  }

  return {
    riskScore: Math.min(100, riskScore), // Cap at 100
    status,
    analysis,
    recommendations,
  };
};

// ---

export const WoundUpload = ({ onAnalysisComplete }: WoundUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  // --- UPDATED: This function now makes a real API call ---
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Create a local URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      
      // --- Prepare data for the API ---
      const formData = new FormData();
      formData.append("file", file); // The key "file" must match the backend File(...)

      setUploading(false);
      setAnalyzing(true);

      toast({
        title: "Analyzing wound...",
        description: "Sending image to AI model...",
      });

      // --- DELETED: Mock analysis delay ---
      // await new Promise(resolve => setTimeout(resolve, 1500));

      // --- NEW: Make the actual API call ---
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          // The backend auth.py expects this header
          "X-API-Key": API_KEY, 
        },
        body: formData,
      });

      if (!response.ok) {
        // Try to get a nice error message from the backend
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      // Get the JSON response, which looks like:
      // { "filename": "...", "content_type": "...", "predictions": [0.1, 0.8, 0.1] }
      const result = await response.json();

      // --- UPDATED: Use the new helper function ---
      // This replaces the old mock analysisData object
      const analysisData = interpretPredictions(result.predictions);

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
      console.error("Analysis error:", error);
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