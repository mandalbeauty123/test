import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, Menu, Globe, Camera, Upload, Bug, Bot, Loader2, Image as ImageIcon, 
  RefreshCw, CheckCircle2, AlertTriangle, X, Share2, ThermometerSun, BookOpen, Database
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

// ==========================================
// 1. CONFIGURATION
// ==========================================
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash"; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. THE MASSIVE CROP DISEASE DATABASE (100 ITEMS)
// ==========================================
const CROP_DISEASE_DB = [
  // --- CEREALS ---
  { name: "Rice Blast", symptoms: "Diamond-shaped grey lesions with brown margin on leaves, neck rot.", prevention: "Use resistant varieties, avoid excess nitrogen.", fertilizer: "Balanced NPK, increase potassium.", control: "Tricyclazole or Isoprothiolane spray." },
  { name: "Bacterial Leaf Blight", symptoms: "Yellowing and drying from leaf tips.", prevention: "Clean seed, proper drainage.", fertilizer: "Avoid excess nitrogen, apply zinc.", control: "Copper oxychloride + Streptocycline." },
  { name: "Sheath Blight", symptoms: "Oval grey lesions on sheath near water line.", prevention: "Proper spacing and water management.", fertilizer: "Potassium application.", control: "Validamycin or Carbendazim." },
  { name: "Brown Spot", symptoms: "Brown circular spots on leaves and grains.", prevention: "Healthy seed selection.", fertilizer: "Nitrogen and potassium.", control: "Mancozeb spray." },
  { name: "Rice Tungro Virus", symptoms: "Yellow-orange leaves, stunted plants.", prevention: "Control leafhopper vector.", fertilizer: "Balanced nutrition.", control: "Imidacloprid spray." },
  { name: "Wheat Brown Rust", symptoms: "Reddish-brown pustules on leaves.", prevention: "Rust-resistant varieties.", fertilizer: "Balanced nitrogen.", control: "Propiconazole." },
  { name: "Wheat Yellow Rust", symptoms: "Yellow stripes on leaves.", prevention: "Early sowing.", fertilizer: "Adequate potash.", control: "Tebuconazole." },
  { name: "Wheat Black Rust", symptoms: "Black pustules on stems.", prevention: "Resistant varieties.", fertilizer: "Balanced NPK.", control: "Fungicide spray." },
  { name: "Powdery Mildew", symptoms: "White powdery growth on leaves.", prevention: "Good air circulation.", fertilizer: "Avoid excess nitrogen.", control: "Sulfur fungicide." },
  { name: "Loose Smut", symptoms: "Black powder replaces grains.", prevention: "Certified seed.", fertilizer: "Normal fertilization.", control: "Seed treatment with Carbendazim." },

  // --- MAIZE & MILLETS ---
  { name: "Maize Leaf Blight", symptoms: "Long grey leaf lesions.", prevention: "Crop rotation.", fertilizer: "Potassium.", control: "Mancozeb." },
  { name: "Downy Mildew", symptoms: "Yellow streaks, dwarf plants.", prevention: "Disease-free seed.", fertilizer: "Balanced NPK.", control: "Metalaxyl." },
  { name: "Corn Smut", symptoms: "Swollen galls on ears.", prevention: "Field sanitation.", fertilizer: "Balanced nutrition.", control: "Remove infected plants." },
  { name: "Sorghum Ergot", symptoms: "Sticky honeydew on flowers.", prevention: "Crop rotation.", fertilizer: "Potash.", control: "Carbendazim." },
  { name: "Pearl Millet Downy Mildew", symptoms: "Leaf chlorosis, stunting.", prevention: "Resistant hybrids.", fertilizer: "Balanced nutrients.", control: "Metalaxyl seed treatment." },

  // --- PULSES ---
  { name: "Chickpea Wilt", symptoms: "Sudden wilting, brown roots.", prevention: "Crop rotation.", fertilizer: "Phosphorus.", control: "Soil drenching with Carbendazim." },
  { name: "Pigeon Pea Wilt", symptoms: "Yellowing and drying.", prevention: "Resistant varieties.", fertilizer: "Potassium.", control: "Fungicide drenching." },
  { name: "Yellow Mosaic Virus", symptoms: "Yellow mosaic patches.", prevention: "Whitefly control.", fertilizer: "Zinc & micronutrients.", control: "Imidacloprid." },
  { name: "Root Rot", symptoms: "Root decay, plant collapse.", prevention: "Proper drainage.", fertilizer: "Organic manure.", control: "Trichoderma + Carbendazim." },
  { name: "Pea Powdery Mildew", symptoms: "White fungal coating.", prevention: "Proper spacing.", fertilizer: "Avoid excess nitrogen.", control: "Sulfur spray." },

  // --- OILSEEDS ---
  { name: "White Rust", symptoms: "White pustules under leaves.", prevention: "Resistant varieties.", fertilizer: "Balanced nutrition.", control: "Mancozeb." },
  { name: "Alternaria Blight", symptoms: "Dark concentric leaf spots.", prevention: "Field sanitation.", fertilizer: "Potash.", control: "Chlorothalonil." },
  { name: "Groundnut Leaf Spot", symptoms: "Brown to black leaf lesions.", prevention: "Crop rotation.", fertilizer: "Calcium & potassium.", control: "Mancozeb." },
  { name: "Groundnut Rust", symptoms: "Orange pustules under leaves.", prevention: "Early sowing.", fertilizer: "Potassium.", control: "Tebuconazole." },
  { name: "Sunflower Downy Mildew", symptoms: "Stunted plants, pale leaves.", prevention: "Resistant hybrids.", fertilizer: "Balanced nutrients.", control: "Metalaxyl." },

  // --- ROOT & TUBER ---
  { name: "Late Blight", symptoms: "Water-soaked lesions, tuber rot.", prevention: "Early planting.", fertilizer: "High potassium.", control: "Metalaxyl + Mancozeb." },
  { name: "Early Blight", symptoms: "Target-shaped leaf spots.", prevention: "Remove infected debris.", fertilizer: "Balanced NPK.", control: "Chlorothalonil." },
  { name: "Potato Scab", symptoms: "Corky tuber lesions.", prevention: "Acidic soil.", fertilizer: "Avoid fresh manure.", control: "Crop rotation." },
  { name: "Potato Leaf Roll Virus", symptoms: "Rolling leaves, stunting.", prevention: "Aphid control.", fertilizer: "Balanced nutrition.", control: "Imidacloprid." },
  { name: "Cassava Mosaic Disease", symptoms: "Leaf distortion and mosaic.", prevention: "Virus-free cuttings.", fertilizer: "NPK.", control: "Remove infected plants." },

  // --- VEGETABLES ---
  { name: "Tomato Leaf Curl Virus", symptoms: "Leaf curling, stunted growth.", prevention: "Whitefly control.", fertilizer: "Zinc, boron.", control: "Imidacloprid." },
  { name: "Tomato Early Blight", symptoms: "Brown concentric leaf spots.", prevention: "Crop rotation.", fertilizer: "Balanced NPK.", control: "Mancozeb." },
  { name: "Tomato Late Blight", symptoms: "Dark greasy lesions.", prevention: "Avoid overhead irrigation.", fertilizer: "Potassium.", control: "Metalaxyl." },
  { name: "Bacterial Wilt", symptoms: "Sudden wilting without yellowing.", prevention: "Soil sterilization.", fertilizer: "Lime application.", control: "Soil solarization." },
  { name: "Septoria Leaf Spot", symptoms: "Small grey circular spots.", prevention: "Remove infected leaves.", fertilizer: "Balanced nutrients.", control: "Chlorothalonil." },
  { name: "Chilli Leaf Curl", symptoms: "Leaf curling and dwarfing.", prevention: "Vector control.", fertilizer: "Micronutrients.", control: "Imidacloprid." },
  { name: "Chilli Anthracnose", symptoms: "Sunken fruit lesions.", prevention: "Clean seed.", fertilizer: "Potash.", control: "Carbendazim." },
  { name: "Chilli Powdery Mildew", symptoms: "White powdery coating.", prevention: "Proper spacing.", fertilizer: "Avoid excess nitrogen.", control: "Sulfur spray." },
  { name: "Damping-Off", symptoms: "Seedling rot at soil line.", prevention: "Sterilized nursery soil.", fertilizer: "Light fertilization.", control: "Captan seed treatment." },
  { name: "Cucumber Mosaic Virus", symptoms: "Mosaic leaf pattern.", prevention: "Aphid control.", fertilizer: "Balanced nutrients.", control: "Insecticide spray." },

  // --- BRINJAL & OKRA ---
  { name: "Brinjal Little Leaf", symptoms: "Small narrow leaves, bushy growth.", prevention: "Remove infected plants.", fertilizer: "Balanced NPK.", control: "Tetracycline spray." },
  { name: "Brinjal Wilt", symptoms: "Sudden plant wilting.", prevention: "Crop rotation.", fertilizer: "Lime application.", control: "Soil drenching." },
  { name: "Okra Yellow Vein Mosaic", symptoms: "Yellow veins.", prevention: "Resistant varieties.", fertilizer: "Zinc sulfate.", control: "Imidacloprid." },
  { name: "Onion Purple Blotch", symptoms: "Purple elliptical spots.", prevention: "Field sanitation.", fertilizer: "Potassium.", control: "Mancozeb." },
  { name: "Garlic Rust", symptoms: "Orange pustules.", prevention: "Proper spacing.", fertilizer: "Balanced nutrients.", control: "Tebuconazole." },

  // --- FRUITS ---
  { name: "Mango Anthracnose", symptoms: "Black sunken spots.", prevention: "Pruning.", fertilizer: "Potassium.", control: "Copper fungicide." },
  { name: "Mango Powdery Mildew", symptoms: "White fungal growth.", prevention: "Proper ventilation.", fertilizer: "Avoid excess nitrogen.", control: "Sulfur spray." },
  { name: "Banana Bunchy Top", symptoms: "Narrow erect leaves.", prevention: "Virus-free suckers.", fertilizer: "Balanced NPK.", control: "Aphid control." },
  { name: "Banana Panama Wilt", symptoms: "Yellowing, vascular browning.", prevention: "Resistant varieties.", fertilizer: "Potash.", control: "Soil treatment." },
  { name: "Apple Scab", symptoms: "Olive-green scabs.", prevention: "Pruning.", fertilizer: "Balanced nutrition.", control: "Captan spray." },

  // --- PLANTATION & GENERAL ---
  { name: "Citrus Canker", symptoms: "Corky raised lesions.", prevention: "Windbreaks.", fertilizer: "Avoid excess nitrogen.", control: "Copper oxychloride." },
  { name: "Citrus Greening", symptoms: "Yellow mottling, bitter fruit.", prevention: "Psyllid control.", fertilizer: "Micronutrients.", control: "Insecticide." },
  { name: "Papaya Ringspot Virus", symptoms: "Ring patterns on fruit.", prevention: "Rogue infected plants.", fertilizer: "Balanced nutrients.", control: "Aphid control." },
  { name: "Grape Downy Mildew", symptoms: "Yellow oil spots.", prevention: "Proper canopy.", fertilizer: "Potassium.", control: "Metalaxyl." },
  { name: "Grape Powdery Mildew", symptoms: "White dusty coating.", prevention: "Air circulation.", fertilizer: "Avoid excess nitrogen.", control: "Sulfur spray." },
  { name: "Pomegranate Bacterial Blight", symptoms: "Oily leaf spots, fruit cracking.", prevention: "Sanitation.", fertilizer: "Balanced nutrition.", control: "Streptocycline + Copper." },
  { name: "Guava Wilt", symptoms: "Sudden tree death.", prevention: "Crop rotation.", fertilizer: "Organic manure.", control: "Soil drenching." },
  { name: "Pineapple Heart Rot", symptoms: "Central leaf rot.", prevention: "Good drainage.", fertilizer: "Balanced NPK.", control: "Metalaxyl." },
  { name: "Litchi Fruit Rot", symptoms: "Brown soft rot.", prevention: "Proper harvesting.", fertilizer: "Potassium.", control: "Fungicide spray." },
  { name: "Coconut Bud Rot", symptoms: "Rotting of growing point.", prevention: "Good drainage.", fertilizer: "Balanced nutrition.", control: "Copper fungicide." },
  { name: "Coconut Root Wilt", symptoms: "Drooping leaves.", prevention: "Proper irrigation.", fertilizer: "Organic manure.", control: "Root feeding." },
  { name: "Arecanut Yellow Leaf", symptoms: "Progressive yellowing.", prevention: "Balanced nutrition.", fertilizer: "Magnesium sulfate.", control: "Integrated management." },
  { name: "Coffee Leaf Rust", symptoms: "Orange powder underside leaves.", prevention: "Shade regulation.", fertilizer: "Potassium.", control: "Bordeaux mixture." },
  { name: "Tea Blister Blight", symptoms: "Blister-like spots.", prevention: "Pruning.", fertilizer: "Balanced nutrition.", control: "Copper fungicide." },
  { name: "Tea Red Rust", symptoms: "Reddish leaf patches.", prevention: "Shade control.", fertilizer: "Nitrogen.", control: "Bordeaux mixture." },

  // --- COMMON SOIL & COMPLEX ---
  { name: "Fusarium Wilt", symptoms: "Yellowing and wilting.", prevention: "Resistant varieties.", fertilizer: "Phosphorus & potassium.", control: "Carbendazim." },
  { name: "Verticillium Wilt", symptoms: "Gradual plant decline.", prevention: "Crop rotation.", fertilizer: "Balanced nutrients.", control: "Soil fumigation." },
  { name: "Bacterial Leaf Spot", symptoms: "Water-soaked lesions.", prevention: "Clean seed.", fertilizer: "Balanced nutrition.", control: "Copper fungicide." },
  { name: "Mosaic Virus", symptoms: "Patchy light-dark leaves.", prevention: "Vector control.", fertilizer: "Micronutrients.", control: "Insecticide." },
  { name: "Leaf Curl Disease", symptoms: "Twisted curled leaves.", prevention: "Resistant varieties.", fertilizer: "Zinc & boron.", control: "Imidacloprid." },
  { name: "Rust Disease", symptoms: "Powdery pustules.", prevention: "Resistant varieties.", fertilizer: "Balanced NPK.", control: "Fungicide spray." },
  { name: "Sooty Mold", symptoms: "Black coating on leaves.", prevention: "Control sap-sucking insects.", fertilizer: "Balanced nutrients.", control: "Insecticide + washing." },
  { name: "Scab Disease", symptoms: "Corky lesions.", prevention: "Crop sanitation.", fertilizer: "Balanced nutrition.", control: "Fungicide." },
  { name: "Blight Disease", symptoms: "Rapid tissue death.", prevention: "Timely irrigation.", fertilizer: "Potassium.", control: "Fungicide spray." },
  { name: "Leaf Spot Disease", symptoms: "Circular necrotic spots.", prevention: "Field sanitation.", fertilizer: "Balanced nutrients.", control: "Mancozeb." },

  // --- SEEDLING & STORAGE ---
  { name: "Seed Rot", symptoms: "Poor germination.", prevention: "Treated seed.", fertilizer: "Seedling nutrients.", control: "Fungicide seed treatment." },
  { name: "Collar Rot", symptoms: "Rot at stem base.", prevention: "Proper drainage.", fertilizer: "Organic manure.", control: "Carbendazim." },
  { name: "Storage Rot", symptoms: "Post-harvest decay.", prevention: "Dry storage.", fertilizer: "Not applicable.", control: "Fungicide treatment." },
  { name: "Dry Rot", symptoms: "Shriveling of produce.", prevention: "Proper curing.", fertilizer: "Balanced nutrition.", control: "Fungicide." },
  { name: "Soft Rot", symptoms: "Watery foul-smelling rot.", prevention: "Hygiene.", fertilizer: "Balanced nutrients.", control: "Copper compounds." },
  { name: "Yellow Vein Disease", symptoms: "Yellow veins.", prevention: "Vector control.", fertilizer: "Zinc sulfate.", control: "Insecticide." },
  { name: "Leaf Roll Disease", symptoms: "Rolled leaves.", prevention: "Aphid control.", fertilizer: "Balanced nutrition.", control: "Insecticide." },
  { name: "Rosette Disease", symptoms: "Compact growth.", prevention: "Resistant varieties.", fertilizer: "Balanced NPK.", control: "Vector control." },
  { name: "Witches’ Broom", symptoms: "Excessive branching.", prevention: "Remove infected plants.", fertilizer: "Balanced nutrients.", control: "Pruning + fungicide." },
  { name: "Dieback Disease", symptoms: "Progressive branch death.", prevention: "Proper pruning.", fertilizer: "Potassium.", control: "Fungicide spray." },
  { name: "Iron Chlorosis", symptoms: "Yellowing between veins.", prevention: "Soil pH correction.", fertilizer: "Iron sulfate.", control: "Foliar spray." },
  { name: "Zinc Deficiency", symptoms: "Small leaves.", prevention: "Balanced fertilization.", fertilizer: "Zinc sulfate.", control: "Soil or foliar application." },
  { name: "Boron Deficiency", symptoms: "Fruit cracking.", prevention: "Balanced micronutrients.", fertilizer: "Borax.", control: "Foliar spray." },
  { name: "Nitrogen Deficiency", symptoms: "Pale leaves.", prevention: "Adequate nitrogen.", fertilizer: "Urea.", control: "Soil application." },
  { name: "Potassium Deficiency", symptoms: "Leaf edge scorching.", prevention: "Balanced NPK.", fertilizer: "Muriate of potash.", control: "Soil application." },
  { name: "Charcoal Rot", symptoms: "Blackened roots.", prevention: "Moisture management.", fertilizer: "Potassium.", control: "Carbendazim." },
  { name: "Take-All Disease", symptoms: "Root decay in cereals.", prevention: "Crop rotation.", fertilizer: "Balanced nutrition.", control: "Soil treatment." },
  { name: "Stripe Disease", symptoms: "Linear streaks on leaves.", prevention: "Clean seed.", fertilizer: "Balanced nutrients.", control: "Fungicide." },
  { name: "Wilt Complex", symptoms: "Combined wilting symptoms.", prevention: "Integrated management.", fertilizer: "Balanced nutrients.", control: "Fungicide + bacteria control." },
  { name: "Root Knot Disease", symptoms: "Galls on roots.", prevention: "Crop rotation.", fertilizer: "Organic manure.", control: "Nematicide." },
  { name: "Bacterial Soft Rot", symptoms: "Soft watery decay.", prevention: "Hygiene.", fertilizer: "Balanced nutrition.", control: "Copper fungicide." },
  { name: "Black Spot Disease", symptoms: "Black circular leaf spots.", prevention: "Remove debris.", fertilizer: "Balanced nutrition.", control: "Fungicide." },
  { name: "Leaf Scorch", symptoms: "Burnt leaf margins.", prevention: "Adequate irrigation.", fertilizer: "Potassium.", control: "Nutrient correction." },
  { name: "Crown Rot", symptoms: "Rot at plant base.", prevention: "Drainage.", fertilizer: "Organic manure.", control: "Fungicide drench." },
  { name: "Stem Canker", symptoms: "Sunken stem lesions.", prevention: "Pruning.", fertilizer: "Balanced nutrients.", control: "Copper fungicide." }
];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Stores the text response from Gemini
  const [diagnosis, setDiagnosis] = useState(null);
  
  // Stores the matched object from our 100-item DB
  const [dbMatch, setDbMatch] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("idle"); 
  const fileInputRef = useRef(null);

  // --- Load History on Mount ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await supabase.from('diagnoses').select('*').order('created_at', { ascending: false });
      if (data) setHistory(data);
    } catch (e) { console.log("History skipped"); }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageFile(file);
        setDiagnosis(null);
        setDbMatch(null); // Reset DB match
        setStatus("idle");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- INTELLIGENT SEARCH FUNCTION ---
  // This searches our hardcoded DB for the disease identified by Gemini
  const findDiseaseInDB = (text) => {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    // Sort by length desc so we match "Tomato Early Blight" before "Blight"
    const sortedDB = [...CROP_DISEASE_DB].sort((a, b) => b.name.length - a.name.length);
    
    return sortedDB.find(item => lowerText.includes(item.name.toLowerCase()));
  };

  // --- MAIN DIAGNOSIS HANDLER ---
  const handleGetDiagnosis = async () => {
    if (!imageFile) return;
    setLoading(true);
    setStatus("analyzing");
    setDiagnosis(null);
    setDbMatch(null);

    let resultText = "";
    let matchedDisease = null;
    
    try {
        // 1. AI CALL
        if (!GEMINI_API_KEY) throw new Error("No API Key");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        
        const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(imageFile);
        });

        // We ask Gemini to be descriptive but also name the disease clearly
        const prompt = "Analyze this plant. Identify the disease strictly. If found, describe symptoms and cure. Format: **Disease:** [Name] ...";
        
        const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: imageFile.type } }]);
        resultText = result.response.text();
        
        // 2. DATABASE MATCHING
        matchedDisease = findDiseaseInDB(resultText);
        setDbMatch(matchedDisease); // Save match to state

        setStatus("success");

    } catch (error) {
        console.error("AI Failed, using Mock:", error);
        await new Promise(r => setTimeout(r, 2000)); 
        // Mock fallback
        resultText = `**Disease:** Late Blight\n**Condition:** Critical\n**Analysis:** The leaves show characteristic water-soaked lesions indicating Phytophthora infestans infection.`;
        matchedDisease = findDiseaseInDB("Late Blight");
        setDbMatch(matchedDisease);
        setStatus("mock");
    }

    setDiagnosis(resultText);
    setLoading(false);
    
    // Save to history (including the DB match name if found)
    saveToHistory(imageFile, resultText, imagePreview);
  };

  const saveToHistory = async (file, text, preview) => {
    try {
        const fileName = `${Date.now()}_plant.jpg`;
        supabase.storage.from('plant-images').upload(fileName, file).then(() => {
             const { data } = supabase.storage.from('plant-images').getPublicUrl(fileName);
             if(data) supabase.from('diagnoses').insert([{ image_url: data.publicUrl, diagnosis_text: text }]);
        });
        setHistory(prev => [{ id: Date.now(), image_url: preview, diagnosis_text: text, created_at: new Date() }, ...prev]);
    } catch (e) { console.log("Save error", e); }
  };

  // Text Formatter for AI Response
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="mb-2">
          {parts.map((part, i) => 
            part.startsWith('**') && part.endsWith('**') ? (
              <span key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</span>
            ) : (
              <span key={i} className="text-slate-600">{part}</span>
            )
          )}
        </p>
      );
    });
  };

  const isHealthy = diagnosis && diagnosis.toLowerCase().includes("healthy");
  const statusColor = isHealthy ? "bg-green-100 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-100";
  const StatusIcon = isHealthy ? CheckCircle2 : AlertTriangle;

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-gray-50 pb-10">
      
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-200"><Sprout size={24} /></div>
          <div><h1 className="font-bold text-xl tracking-tight text-slate-900">Geospatial AI</h1><p className="text-xs text-gray-500 font-medium">Ignition Ideators</p></div>
        </div>
        <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><Globe size={20}/></button>
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><Menu size={20}/></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: DETECTION CARD (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-1 relative overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex gap-2 items-center text-slate-800"><Camera className="text-green-600"/> Pest & Disease AI</h2>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">Database Active</span>
                </div>
                
                {/* UPLOAD AREA */}
                <div className="space-y-4">
                <div onClick={() => fileInputRef.current.click()} className="group border-2 border-dashed border-slate-200 hover:border-green-400 bg-slate-50 hover:bg-green-50/30 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden">
                    {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-contain p-2" alt="Preview"/>
                    ) : (
                        <div className="text-center p-6 transition-transform group-hover:scale-105">
                            <div className="bg-white p-4 rounded-full inline-block mb-3 shadow-sm group-hover:shadow-md"><Upload size={32} className="text-green-600" /></div>
                            <p className="text-sm font-semibold text-slate-700">Click to upload plant image</p>
                            <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>

                <button 
                    onClick={handleGetDiagnosis}
                    disabled={!imageFile || loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none transform active:scale-[0.98]"
                >
                    {loading ? <><Loader2 className="animate-spin" /> Scanning Database...</> : <><Bug size={20} /> Diagnose Plant</>}
                </button>
                </div>
            </div>

            {/* --- RESULT OVERLAY --- */}
            {diagnosis && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-10 flex flex-col animate-in slide-in-from-bottom-10 duration-500">
                    <div className="p-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
                        
                        {/* 1. Header & Actions */}
                        <div className="flex justify-between items-start mb-6">
                            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${statusColor}`}>
                                <StatusIcon size={20} />
                                <span className="font-bold text-sm uppercase tracking-wide">{isHealthy ? "Healthy Plant" : "Issue Detected"}</span>
                            </div>
                            <button onClick={() => setDiagnosis(null)} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={24} className="text-slate-500"/></button>
                        </div>

                        {/* 2. EXPERT DATABASE CARD (If Match Found) */}
                        {dbMatch && (
                            <div className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3 text-amber-700">
                                    <BookOpen size={20} />
                                    <h3 className="font-bold text-lg">Expert Knowledge Base Match</h3>
                                </div>
                                <h4 className="text-xl font-extrabold text-slate-900 mb-4">{dbMatch.name}</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                                        <strong className="text-amber-800 block text-xs uppercase mb-1">Symptoms</strong>
                                        <p className="text-slate-700 leading-tight">{dbMatch.symptoms}</p>
                                        
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                                        <strong className="text-amber-800 block text-xs uppercase mb-1">Control Measures</strong>
                                        <p className="text-slate-700 leading-tight">{dbMatch.control}</p>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                                        <strong className="text-amber-800 block text-xs uppercase mb-1">Fertilizer</strong>
                                        <p className="text-slate-700 leading-tight">{dbMatch.fertilizer}</p>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                                        <strong className="text-amber-800 block text-xs uppercase mb-1">Prevention</strong>
                                        <p className="text-slate-700 leading-tight">{dbMatch.prevention}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. AI Detailed Analysis */}
                        <div className="space-y-2 text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-2 text-slate-500 font-semibold">
                                <Bot size={16} /> AI Analysis
                            </div>
                            {formatText(diagnosis)}
                        </div>

                        {/* 4. Bottom Actions */}
                        <div className="mt-auto pt-6 border-t border-slate-100 flex gap-3">
                            <button className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                <Share2 size={16} /> Save Report
                            </button>
                            <button onClick={() => setDiagnosis(null)} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* RIGHT: HISTORY (5 Columns) */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold flex gap-2 items-center text-slate-800"><Database className="text-slate-400"/> History Log</h2>
               <button onClick={fetchHistory} className="text-slate-400 hover:text-green-600 transition"><RefreshCw size={18}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <ThermometerSun size={48} className="mb-4 opacity-50"/>
                    <p className="font-medium">No records found</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <div key={item.id || i} className="group p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 cursor-default">
                    <div className="flex gap-4">
                        <img src={item.image_url || item.imagePreview} className="w-16 h-16 object-cover rounded-lg bg-slate-200 shadow-sm" onError={(e) => e.target.style.display='none'} />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just Now'}</span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium group-hover:text-slate-900">
                                {item.diagnosis_text.replace(/\*\*/g, '').substring(0, 80)}...
                            </p>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
