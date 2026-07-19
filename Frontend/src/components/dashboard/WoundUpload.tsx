import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, RefreshCw, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const API_URL = "http://127.0.0.1:8000/predict";
const API_KEY = "demo-key-123";

interface WoundUploadProps {
  onAnalysisComplete: () => void;
}

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
  let status = 'warning';
  let analysis = "";
  let recommendations = "";

  const normalProbability = predictions[6] || 0;
  const riskScore = Math.round((1.0 - normalProbability) * 100);

  switch (predictedClass) {
    case 'Normal':
      status = 'healthy';
      analysis = "AI analysis: The area appears to be normal, healthy skin or a well-healed wound.";
      recommendations = "Continue to monitor the area as instructed by your doctor.";
      break;
    case 'Surgical Wounds':
      status = 'warning';
      analysis = "AI analysis: A surgical wound has been identified. It appears to be in a standard healing phase.";
      recommendations = "Keep the area clean and dry. Watch for any changes, such as increased redness, swelling, or discharge.";
      break;
    case 'Abrasions':
    case 'Bruises':
    case 'Burns':
    case 'Cut':
    case 'Laseration':
      status = 'warning';
      analysis = `AI analysis: An injury identified as '${predictedClass}' has been detected.`;
      recommendations = "Please follow standard first-aid for this type of injury. If this is near your surgical site, monitor it closely.";
      break;
    case 'Diabetic Wounds':
    case 'Pressure Wounds':
    case 'Venous Wounds':
      status = 'critical';
      analysis = `AI analysis: A high-risk wound type ('${predictedClass}') has been detected. This requires attention.`;
      recommendations = "Contact your healthcare provider immediately for evaluation, especially if this is near your surgical site.";
      break;
    default:
      status = 'warning';
      analysis = "AI analysis: Unable to clearly classify the image.";
      recommendations = "Please try taking a clearer photo. If concerned, contact your provider.";
  }

  return {
    riskScore: Math.min(100, riskScore),
    status,
    analysis,
    recommendations,
  };
};

export const WoundUpload = ({ onAnalysisComplete }: WoundUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultData(null); // Reset previous results
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultData(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setAnalyzing(true);
      
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "X-API-Key": API_KEY },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Analysis failed");
      }

      const result = await response.json();
      const analysisData = interpretPredictions(result.predictions);
      
      setResultData(analysisData);

      const assessments = JSON.parse(localStorage.getItem('wound_assessments') || '[]');
      assessments.push({
        id: Date.now(),
        created_at: new Date().toISOString(),
        image_url: previewUrl,
        risk_score: analysisData.riskScore,
        status: analysisData.status,
        ai_analysis: analysisData.analysis,
        recommendations: analysisData.recommendations,
      });
      localStorage.setItem('wound_assessments', JSON.stringify(assessments));

      onAnalysisComplete();
      setShowResultDialog(true);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process image. Make sure the backend is running.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <Card className="border-0 bg-white/60 backdrop-blur-md shadow-sm dark:bg-gray-950/60 transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            Upload Wound Photo
          </CardTitle>
          <CardDescription className="mt-2">
            Select a clear photo of your surgical wound for AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!previewUrl ? (
            <div className="border-2 border-dashed rounded-xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <input type="file" id="wound-upload" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <label htmlFor="wound-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">JPG, PNG, or WEBP (max 10MB)</p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/20 bg-black/5">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                
                {/* Sci-fi Scanning Animation Overlay */}
                {analyzing && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                    <div className="w-full h-1 bg-primary shadow-[0_0_15px_3px_rgba(13,148,136,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="w-full" onClick={handleClearSelection} disabled={analyzing}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Retake
                </Button>
                <Button className="w-full relative overflow-hidden bg-primary hover:bg-primary/90 text-white" onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    "Analyze Wound"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Analysis Complete</DialogTitle>
            <DialogDescription>
              AI assessment of your uploaded wound photo.
            </DialogDescription>
          </DialogHeader>
          
          {resultData && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Detected Status</p>
                  <div className="flex items-center gap-2">
                    {resultData.status === 'healthy' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {resultData.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    {resultData.status === 'critical' && <AlertCircle className="h-5 w-5 text-red-500" />}
                    <span className="text-lg font-bold capitalize">{resultData.status}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                  <p className="text-2xl font-bold text-primary">{resultData.riskScore}%</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">AI Diagnosis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{resultData.analysis}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Recommendations</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{resultData.recommendations}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => {
              setShowResultDialog(false);
              handleClearSelection();
            }} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};