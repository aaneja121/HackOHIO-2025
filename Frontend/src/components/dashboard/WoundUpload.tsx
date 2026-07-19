import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, RefreshCw, AlertCircle, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/predict` 
  : "http://127.0.0.1:8000/predict";


interface WoundUploadProps {
  onAnalysisComplete: () => void;
}

const interpretPredictions = (predictions: number[]) => {
  const classNames = [
    'Abrasions', 'Bruises', 'Burns', 'Cut', 'Diabetic Wounds',
    'Laceration', 'Normal', 'Pressure Wounds', 'Surgical Wounds', 'Venous Wounds'
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
      analysis = "AI analysis indicates the area appears to be normal, healthy skin or a well-healed wound.";
      recommendations = "Continue to monitor the area as instructed by your healthcare provider. Keep it clean and dry.";
      break;
    case 'Surgical Wounds':
      status = 'warning';
      analysis = "AI analysis detected a surgical wound. It appears to be in a standard healing phase.";
      recommendations = "Follow your post-operative care instructions. Watch for any changes, such as increased redness, swelling, or discharge.";
      break;
    case 'Abrasions':
    case 'Bruises':
    case 'Burns':
    case 'Cut':
    case 'Laceration':
      status = 'warning';
      analysis = `AI analysis identified an injury classified as '${predictedClass}'.`;
      recommendations = "Please follow standard first-aid for this type of injury. If this is near your surgical site, monitor it closely and contact your doctor if you experience increased pain or swelling.";
      break;
    case 'Diabetic Wounds':
    case 'Pressure Wounds':
    case 'Venous Wounds':
      status = 'critical';
      analysis = `AI analysis detected a high-risk wound type ('${predictedClass}'). This requires professional medical attention.`;
      recommendations = "Contact your healthcare provider immediately for a proper medical evaluation and treatment plan.";
      break;
    default:
      status = 'warning';
      analysis = "AI analysis was unable to clearly classify the image with high confidence.";
      recommendations = "Please try taking a clearer, well-lit photo. If you have any medical concerns, contact your provider.";
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
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg dark:bg-gray-950/40 transition-all hover:shadow-xl ring-1 ring-black/5 dark:ring-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 shadow-inner ring-1 ring-primary/20">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            Analyze Wound
          </CardTitle>
          <CardDescription className="mt-2 text-base">
            Upload a clear photo for an instant AI-powered assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {!previewUrl ? (
            <div className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group/upload bg-white/50 dark:bg-black/20">
              <input type="file" id="wound-upload" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <label htmlFor="wound-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-5">
                  <div className="rounded-full bg-primary/10 p-5 group-hover/upload:scale-110 group-hover/upload:bg-primary/20 transition-all duration-300 shadow-sm animate-float">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">High-resolution JPG, PNG (max 10MB)</p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary/20 bg-black shadow-inner">
                <Image src={previewUrl} alt="Preview" fill className="object-cover opacity-90 transition-opacity duration-300" />
                
                {/* Premium Sci-fi Scanning Animation Overlay */}
                {analyzing && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute inset-0 bg-primary/20 animate-pulse-glow mix-blend-overlay" />
                    <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                    <div className="w-full h-1.5 bg-primary shadow-[0_0_20px_5px_rgba(var(--primary),0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                    
                    {/* Scanning UI Elements */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 text-white text-xs font-mono">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ANALYZING TISSUE...
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12 rounded-xl text-base font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors" onClick={handleClearSelection} disabled={analyzing}>
                  <RefreshCw className="h-5 w-5 mr-2" /> Retake
                </Button>
                <Button className="flex-1 h-12 rounded-xl relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5" onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing AI...
                    </>
                  ) : (
                    "Run AI Analysis"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-0 bg-white/90 backdrop-blur-2xl shadow-2xl dark:bg-gray-950/90 ring-1 ring-black/5 dark:ring-white/10">
          <DialogHeader className="space-y-3 pb-4 border-b border-primary/10">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-inner">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center font-bold">Analysis Complete</DialogTitle>
            <DialogDescription className="text-center text-base">
              The Healios AI has finished reviewing your wound photo.
            </DialogDescription>
          </DialogHeader>
          
          {resultData && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border border-black/5 dark:border-white/5 shadow-sm">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detected Status</p>
                  <div className="flex items-center gap-2.5">
                    {resultData.status === 'healthy' && <CheckCircle className="h-6 w-6 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />}
                    {resultData.status === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />}
                    {resultData.status === 'critical' && <AlertCircle className="h-6 w-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />}
                    <span className="text-xl font-bold capitalize text-foreground tracking-tight">{resultData.status}</span>
                  </div>
                </div>
                <div className="text-right space-y-1.5 w-1/3">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Score</p>
                    <p className="text-3xl font-black text-primary leading-none">{resultData.riskScore}%</p>
                  </div>
                  <Progress value={resultData.riskScore} className="h-2 bg-primary/20" indicatorColor={resultData.riskScore > 75 ? "bg-red-500" : resultData.riskScore > 30 ? "bg-yellow-500" : "bg-green-500"} />
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  AI Diagnosis
                </h4>
                <p className="text-base text-muted-foreground leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">{resultData.analysis}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Recommendations
                </h4>
                <p className="text-base text-muted-foreground leading-relaxed bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">{resultData.recommendations}</p>
              </div>
              
              <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" /> This is an AI tool and not a substitute for professional medical advice.
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-2">
            <Button onClick={() => {
              setShowResultDialog(false);
              handleClearSelection();
            }} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20">
              Close Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};