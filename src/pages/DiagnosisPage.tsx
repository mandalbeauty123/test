import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera, ArrowLeft, Trash2, CheckCircle2, AlertOctagon, Bug, Bot, User as UserIcon, Upload, Image as ImageIcon, Calendar, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { v4 as uuidv4 } from 'uuid';

// Disease Database
const DISEASE_DATABASE: Record<string, { diagnosis: string, advice: string }> = {
  "Apple___Apple_scab": { diagnosis: "Apple Scab", advice: "I have detected **Apple Scab**.\n\n**🔍 Analysis:**\nThis fungal disease causes olive-green to black velvety spots on leaves and corky lesions on the fruit.\n\n**💊 Treatment:**\nApply fungicides like Captan or Myclobutanil early in the season.\n\n**🛡️ Prevention:**\nRake and destroy fallen leaves to reduce spores. Prune the tree to improve airflow." },
  "Apple___Black_rot": { diagnosis: "Apple Black Rot", advice: "I have detected **Apple Black Rot**.\n\n**🔍 Analysis:**\nLook for purple spots on leaves (frog-eye) and rotting, mummified fruit on the branches.\n\n**💊 Treatment:**\nPrune out dead wood and cankers. Remove all mummified fruit immediately.\n\n**🛡️ Prevention:**\nKeep trees wound-free and apply sulfur-based fungicides." },
  "Apple___Cedar_apple_rust": { diagnosis: "Cedar Apple Rust", advice: "I have detected **Cedar Apple Rust**.\n\n**🔍 Analysis:**\nBright orange-yellow spots on leaves. This fungus cycles between apple trees and nearby junipers.\n\n**💊 Treatment:**\nApply fungicide (Myclobutanil) at the pink bud stage.\n\n**🛡️ Prevention:**\nRemove Eastern Red Cedar trees within a 2-mile radius." },
  "Apple___healthy": { diagnosis: "Healthy Apple Tree", advice: "Great news! Your **Apple Tree** looks healthy.\n\n**✅ Recommendation:**\nContinue your current watering and fertilization schedule. Monitor for pests regularly." },
  "Blueberry___healthy": { diagnosis: "Healthy Blueberry", advice: "Your **Blueberry** plant is healthy.\n\n**✅ Recommendation:**\nMaintain acidic soil pH (4.5-5.5) and keep the soil moist." },
  "Cherry_(including_sour)___Powdery_mildew": { diagnosis: "Cherry Powdery Mildew", advice: "I found **Powdery Mildew** on your Cherry tree.\n\n**🔍 Analysis:**\nWhite powdery fungal growth on leaves/stems.\n\n**💊 Treatment:**\nSpray with Potassium Bicarbonate or Sulfur.\n\n**🛡️ Prevention:**\nPrune the canopy to allow sunlight to penetrate." },
  "Cherry_(including_sour)___healthy": { diagnosis: "Healthy Cherry", advice: "Your **Cherry Tree** is healthy.\n\n**✅ Recommendation:**\nEnsure adequate water during fruit development." },
  "Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot": { diagnosis: "Corn Gray Leaf Spot", advice: "I detected **Gray Leaf Spot**.\n\n**🔍 Analysis:**\nRectangular gray/tan lesions running parallel to leaf veins.\n\n**💊 Treatment:**\nApply foliar fungicides if lesions appear before silking.\n\n**🛡️ Prevention:**\nRotate crops (2 years). Plant resistant hybrids." },
  "Corn_(maize)___Common_rust_": { diagnosis: "Corn Common Rust", advice: "I detected **Common Rust**.\n\n**🔍 Analysis:**\nCinnamon-brown pustules on leaf surfaces.\n\n**💊 Treatment:**\nUsually not required unless severe.\n\n**🛡️ Prevention:**\nPlant resistant corn varieties." },
  "Corn_(maize)___Northern_Leaf_Blight": { diagnosis: "Northern Leaf Blight", advice: "I detected **Northern Leaf Blight**.\n\n**🔍 Analysis:**\nLarge, cigar-shaped gray-green lesions.\n\n**💊 Treatment:**\nFungicides can be effective if applied early.\n\n**🛡️ Prevention:**\nTillage to bury residue." },
  "Corn_(maize)___healthy": { diagnosis: "Healthy Corn", advice: "Your **Corn** crop looks vigorous and healthy." },
  "Grape___Black_rot": { diagnosis: "Grape Black Rot", advice: "I found **Grape Black Rot**.\n\n**🔍 Analysis:**\nReddish-brown spots on leaves and shriveled black mummified berries.\n\n**💊 Treatment:**\nApply Mancozeb or Captan.\n\n**🛡️ Prevention:**\nRemove all mummified berries from the vine." },
  "Grape___Esca_(Black_Measles)": { diagnosis: "Grape Esca", advice: "I detected **Grape Esca (Black Measles)**.\n\n**🔍 Analysis:**\nTiger-stripe patterns on leaves.\n\n**💊 Treatment:**\nNo cure. Remove infected vines.\n\n**🛡️ Prevention:**\nProtect pruning wounds." },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": { diagnosis: "Grape Leaf Blight", advice: "I found **Grape Leaf Blight**.\n\n**🔍 Analysis:**\nLarge dark red/brown spots.\n\n**💊 Treatment:**\nApply fungicides.\n\n**🛡️ Prevention:**\nReduce vine stress." },
  "Grape___healthy": { diagnosis: "Healthy Grape", advice: "Your **Grapevine** is healthy." },
  "Orange___Haunglongbing_(Citrus_greening)": { diagnosis: "Citrus Greening", advice: "Warning: **Citrus Greening (HLB)** detected.\n\n**🔍 Analysis:**\nYellowing veins and uneven fruit ripening.\n\n**💊 Treatment:**\nNo cure. Tree removal is recommended.\n\n**🛡️ Prevention:**\nControl Psyllids." },
  "Peach___Bacterial_spot": { diagnosis: "Peach Bacterial Spot", advice: "I found **Bacterial Spot**.\n\n**🔍 Analysis:**\nShot-hole effect on leaves.\n\n**💊 Treatment:**\nCopper bactericides.\n\n**🛡️ Prevention:**\nPlant resistant varieties." },
  "Peach___healthy": { diagnosis: "Healthy Peach", advice: "Your **Peach Tree** is healthy." },
  "Pepper,_bell___Bacterial_spot": { diagnosis: "Pepper Bacterial Spot", advice: "I detected **Bacterial Spot** on your Pepper.\n\n**🔍 Analysis:**\nSmall brown spots causing leaf drop.\n\n**💊 Treatment:**\nCopper sprays.\n\n**🛡️ Prevention:**\nUse disease-free seeds." },
  "Pepper,_bell___healthy": { diagnosis: "Healthy Pepper", advice: "Your **Pepper Plant** is healthy." },
  "Potato___Early_blight": { diagnosis: "Potato Early Blight", advice: "I found **Early Blight**.\n\n**🔍 Analysis:**\nBullseye spots on lower leaves.\n\n**💊 Treatment:**\nChlorothalonil fungicide.\n\n**🛡️ Prevention:**\nMaintain nitrogen levels." },
  "Potato___Late_blight": { diagnosis: "Potato Late Blight", advice: "**CRITICAL:** **Late Blight** detected.\n\n**🔍 Analysis:**\nRapidly spreading dark lesions with white mold.\n\n**💊 Treatment:**\nDestroy infected plants immediately.\n\n**🛡️ Prevention:**\nAvoid overhead watering." },
  "Potato___healthy": { diagnosis: "Healthy Potato", advice: "Your **Potato Crop** is healthy." },
  "Raspberry___healthy": { diagnosis: "Healthy Raspberry", advice: "Your **Raspberry Canes** are healthy." },
  "Soybean___healthy": { diagnosis: "Healthy Soybean", advice: "Your **Soybean Crop** is healthy." },
  "Squash___Powdery_mildew": { diagnosis: "Squash Powdery Mildew", advice: "I detected **Powdery Mildew**.\n\n**🔍 Analysis:**\nWhite powder on leaves.\n\n**💊 Treatment:**\nNeem oil.\n\n**🛡️ Prevention:**\nPlant resistant varieties." },
  "Strawberry___Leaf_scorch": { diagnosis: "Strawberry Leaf Scorch", advice: "I found **Leaf Scorch**.\n\n**🔍 Analysis:**\nPurple spots turning brown.\n\n**💊 Treatment:**\nRemove old foliage.\n\n**🛡️ Prevention:**\nImprove drainage." },
  "Strawberry___healthy": { diagnosis: "Healthy Strawberry", advice: "Your **Strawberry Plants** are thriving." },
  "Tomato___Bacterial_spot": { diagnosis: "Tomato Bacterial Spot", advice: "I detected **Bacterial Spot**.\n\n**🔍 Analysis:**\nSmall dark spots on leaves/fruit.\n\n**💊 Treatment:**\nCopper spray.\n\n**🛡️ Prevention:**\nSanitize tools." },
  "Tomato___Early_blight": { diagnosis: "Tomato Early Blight", advice: "I found **Early Blight**.\n\n**🔍 Analysis:**\nBullseye spots on lower leaves.\n\n**💊 Treatment:**\nRemove lower leaves. Apply fungicide.\n\n**🛡️ Prevention:**\nStake plants." },
  "Tomato___Late_blight": { diagnosis: "Tomato Late Blight", advice: "**CRITICAL:** **Late Blight** detected.\n\n**🔍 Analysis:**\nDark greasy spots, white mold.\n\n**💊 Treatment:**\nRemove plant immediately.\n\n**🛡️ Prevention:**\nKeep foliage dry." },
  "Tomato___Leaf_Mold": { diagnosis: "Tomato Leaf Mold", advice: "I found **Leaf Mold**.\n\n**🔍 Analysis:**\nYellow spots on top, mold on bottom.\n\n**💊 Treatment:**\nReduce humidity.\n\n**🛡️ Prevention:**\nImprove airflow." },
  "Tomato___Septoria_leaf_spot": { diagnosis: "Tomato Septoria", advice: "I detected **Septoria Leaf Spot**.\n\n**🔍 Analysis:**\nSmall circular spots with dark borders.\n\n**💊 Treatment:**\nRemove infected leaves.\n\n**🛡️ Prevention:**\nRotate crops." },
  "Tomato___Spider_mites_Two-spotted_spider_mite": { diagnosis: "Spider Mites", advice: "I found **Two-Spotted Spider Mites**.\n\n**🔍 Analysis:**\nTiny yellow speckles and webbing.\n\n**💊 Treatment:**\nNeem oil or insecticidal soap.\n\n**🛡️ Prevention:**\nReduce dust." },
  "Tomato___Target_Spot": { diagnosis: "Tomato Target Spot", advice: "I found **Target Spot**.\n\n**🔍 Analysis:**\nBrown lesions with concentric rings.\n\n**💊 Treatment:**\nFungicides.\n\n**🛡️ Prevention:**\nImprove airflow." },
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": { diagnosis: "Yellow Leaf Curl Virus", advice: "I detected **Yellow Leaf Curl Virus**.\n\n**🔍 Analysis:**\nLeaves curl upward and turn yellow.\n\n**💊 Treatment:**\nRemove plant (No cure).\n\n**🛡️ Prevention:**\nControl Whiteflies." },
  "Tomato___Tomato_mosaic_virus": { diagnosis: "Tomato Mosaic Virus", advice: "I found **Mosaic Virus**.\n\n**🔍 Analysis:**\nMottled light/dark green leaves.\n\n**💊 Treatment:**\nRemove plant (No cure).\n\n**🛡️ Prevention:**\nWash hands often." },
  "Tomato___healthy": { diagnosis: "Healthy Tomato", advice: "Your **Tomato Plant** is healthy and vigorous." }
};

interface Diagnostic {
  id: string;
  user_id: string;
  image_url: string | null;
  diagnosis: string;
  advice: string;
  confidence: number;
  created_at: string;
}

const DiagnosisPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | 'all' | null>(null);

  // File to Base64 conversion
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Authentication check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  // Fetch diagnostics
  const fetchDiagnostics = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("crop_diagnostics").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setDiagnostics(data);
  }, [user]);

  useEffect(() => { 
    if (user) fetchDiagnostics(); 
  }, [user, fetchDiagnostics]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clear image selection
  const clearImageSelection = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  // Delete requests
  const handleDeleteRequest = (id: string | 'all') => { 
    setItemToDelete(id); 
    setDialogOpen(true); 
  };

  // Delete image from storage
  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('crop-diagnosis-images')
        .remove([filePath]);
      
      if (error) console.warn('Failed to delete image:', error.message);
    } catch (err) {
      console.warn('Error deleting image:', err);
    }
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      if (itemToDelete === 'all') {
        const imageUrls = diagnostics.map(d => d.image_url).filter(url => url !== null) as string[];
        for (const url of imageUrls) {
          await deleteImageFromStorage(url);
        }
        await supabase.from("crop_diagnostics").delete().eq("user_id", user.id);
      } else {
        const diagnosticToDelete = diagnostics.find(d => d.id === itemToDelete);
        if (diagnosticToDelete?.image_url) {
          await deleteImageFromStorage(diagnosticToDelete.image_url);
        }
        await supabase.from("crop_diagnostics").delete().eq("id", itemToDelete);
      }
      toast({ title: "Deleted successfully" });
      fetchDiagnostics();
    } catch (e: any) { 
      toast({ variant: "destructive", title: "Error", description: e.message }); 
    } finally { 
      setDialogOpen(false); 
      setItemToDelete(null); 
    }
  };

  // Test diagnosis
  const handleTestDiagnosis = async () => {
    if (!user) return;
    const info = DISEASE_DATABASE["Tomato___Early_blight"];
    await supabase.from("crop_diagnostics").insert({
      user_id: user.id, 
      image_url: null, 
      diagnosis: info.diagnosis, 
      advice: info.advice, 
      confidence: 100
    });
    fetchDiagnostics();
    toast({ title: "Test Result Added" });
  };

  // Main image upload and analysis
  const handleImageUpload = async () => {
    if (!imageFile || !user) return;
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      toast({ variant: "destructive", title: "API Key Error", description: "Please configure your Gemini API key" });
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('crop-diagnosis-images')
        .upload(fileName, imageFile);
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      
      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('crop-diagnosis-images')
        .getPublicUrl(fileName);
      
      // 3. Convert to Base64 for Gemini
      const base64Image = await fileToBase64(imageFile);
      const imageBase64Data = base64Image.split(',')[1];
      
      // 4. Try Gemini models
      const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"];
      let resultJSON = null;
      let lastError = "";

      for (const model of modelsToTry) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: `Analyze this plant disease image. Classify into EXACTLY ONE: [${Object.keys(DISEASE_DATABASE).join(", ")}]. Return JSON: { "dataset_key": "Exact_Key", "confidence": 95 }` },
                    { inlineData: { mimeType: imageFile.type, data: imageBase64Data } }
                  ]
                }]
              })
            }
          );

          if (!response.ok) throw new Error(`Model ${model}: ${response.status}`);
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resultJSON = JSON.parse(jsonMatch[0]);
            break;
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }

      if (!resultJSON) throw new Error("AI analysis failed. Please try again.");

      // 5. Match result
      let resultData = { 
        diagnosis: "Unknown Plant Issue", 
        advice: "Could not identify. Please try with a clearer image.", 
        confidence: 0 
      };
      let matchFound = false;
      
      const matchedKey = Object.keys(DISEASE_DATABASE).find(k => 
        k.toLowerCase() === resultJSON.dataset_key?.toLowerCase().trim()
      );

      if (matchedKey) {
        const info = DISEASE_DATABASE[matchedKey];
        resultData = { 
          diagnosis: info.diagnosis, 
          advice: info.advice, 
          confidence: resultJSON.confidence || 85 
        };
        matchFound = true;
      }

      // 6. Save to database
      await supabase.from("crop_diagnostics").insert({
        user_id: user.id, 
        image_url: publicUrl,
        diagnosis: resultData.diagnosis, 
        advice: resultData.advice, 
        confidence: resultData.confidence
      });

      toast({
        title: matchFound ? "✅ Diagnosis Complete" : "⚠️ Analysis Inconclusive",
        description: resultData.diagnosis,
        className: matchFound ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
      });
      
      clearImageSelection();
      fetchDiagnostics();

    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Failed to process image" 
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('dashboard')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Diagnosis Card */}
          <Card className="h-fit shadow-md border-t-4 border-t-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-accent" /> {t('cropDiagnosis')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Plant Image
                </label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              
              {imagePreview && (
                <div className="relative">
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <img 
                      src={imagePreview} 
                      alt="Plant preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearImageSelection}
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleImageUpload} 
                  disabled={!imageFile || uploading}
                  className="w-full font-bold shadow-sm bg-accent hover:bg-accent/90"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Get Diagnosis
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestDiagnosis}
                  title="Add test diagnosis"
                >
                  <Bug className="w-4 h-4" />
                </Button>
              </div>
              
              {!imagePreview && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No image selected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat History Card */}
          <Card className="shadow-md border-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bot className="w-6 h-6 text-primary" /> Diagnosis History
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                {diagnostics.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-dashed">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No diagnosis history yet</p>
                  </div>
                ) : (
                  diagnostics.map((d) => (
                    <div key={d.id} className="flex flex-col gap-3">
                      {/* User Bubble */}
                      <div className="self-end bg-primary/10 text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-none text-xs font-medium flex items-center gap-2 w-fit">
                        <UserIcon className="w-3 h-3 text-primary" />
                        <span className="text-primary">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(new Date(d.created_at), "PP")} at {format(new Date(d.created_at), "p")}
                        </span>
                        <button 
                          onClick={() => handleDeleteRequest(d.id)}
                          className="ml-2 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* AI Diagnosis Bubble */}
                      <div className="self-start bg-card border shadow-sm rounded-2xl rounded-tl-none p-5 max-w-[95%]">
                        {/* Display image */}
                        {d.image_url && (
                          <div className="mb-4 border rounded-lg overflow-hidden bg-gray-100">
                            <img 
                              src={d.image_url} 
                              alt="Diagnosed plant" 
                              className="w-full h-48 object-contain"
                            />
                          </div>
                        )}

                        {/* Diagnosis Header */}
                        <div className="flex items-center gap-3 mb-3 border-b pb-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            d.confidence > 80 ? 'bg-green-100 text-green-600' : 
                            d.confidence > 60 ? 'bg-yellow-100 text-yellow-600' : 
                            'bg-red-100 text-red-600'
                          }`}>
                            {d.confidence > 80 ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : (
                              <AlertOctagon className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-foreground">{d.diagnosis}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                d.confidence > 80 ? 'bg-green-100 text-green-700' :
                                d.confidence > 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {d.confidence}% Confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Diagnosis Advice */}
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap space-y-3">
                          {d.advice?.split('\n\n').map((paragraph, i) => (
                            <div key={i} className="space-y-1">
                              {paragraph.split('\n').map((line, j) => {
                                const isBold = line.includes('**') || 
                                              line.startsWith('🔍') || 
                                              line.startsWith('💊') || 
                                              line.startsWith('🛡️');
                                return (
                                  <p 
                                    key={j} 
                                    className={`min-h-[1.2em] ${isBold ? "text-foreground font-medium" : ""}`}
                                  >
                                    {line.replace(/\*\*/g, '')}
                                  </p>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete === 'all' ? 'Clear All History?' : 'Delete This Diagnosis?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete === 'all' 
                ? 'This will remove all your diagnosis records and uploaded images.'
                : 'This will remove this diagnosis record and its image.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DiagnosisPage;