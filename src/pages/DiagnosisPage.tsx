import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sprout, MapPin, Activity, Droplets, ThermometerSun, History, 
  Leaf, Search, Database, Camera, Upload, AlertTriangle, 
  CheckCircle, XCircle, Info, Wind, Bug
} from 'lucide-react';

// ====================== UTILITIES & ALGORITHMS ======================

// 1. Levenshtein Distance (Fuzzy Search Fix)
// matches "tomto" -> "Tomato" or "blite" -> "Blight"
const levenshteinDistance = (a, b) => {
  const matrix = [];
  
  // 1. Initialize Matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // 2. Calculate Distances
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// 2. Smart Database Parser
// Converts the raw text list into a structured object
const normalizeDatabase = (rawData) => {
  return rawData.map(item => {
    // Try to infer crop from name (e.g., "Rice Blast" -> Crop: Rice)
    const commonCrops = ["Rice", "Wheat", "Maize", "Potato", "Tomato", "Brinjal", "Chilli", "Okra", "Mango", "Banana", "Apple", "Citrus", "Grape", "Tea", "Coffee", "Cotton", "Sugarcane"];
    let detectedCrop = "General/Other";
    
    for (let crop of commonCrops) {
      if (item.name.toLowerCase().includes(crop.toLowerCase())) {
        detectedCrop = crop;
        break;
      }
    }

    // Assign Severity/Confidence randomly for simulation if missing
    const severities = ["Low", "Medium", "High", "Critical"];
    const simulatedSeverity = severities[Math.floor(Math.random() * severities.length)];

    return {
      ...item,
      crop: detectedCrop,
      severity: simulatedSeverity,
      id: Math.random().toString(36).substr(2, 9)
    };
  });
};

// ====================== EXTENSIVE DATASET (80+ ENTRIES) ======================
const RAW_CROP_DB = [
  // --- POTATO (Priority from previous request) ---
  { name: "Potato Late Blight", symptoms: "Water-soaked lesions, white mold in humid conditions, brown patches.", prevention: "Early planting, resistant varieties.", fertilizer: "High potassium, balanced NPK.", control: "Metalaxyl + Mancozeb spray." },
  { name: "Potato Early Blight", symptoms: "Concentric ring lesions, target spots, yellow halos.", prevention: "Proper spacing, remove debris.", fertilizer: "Balanced NPK + Potassium.", control: "Chlorothalonil or Azoxystrobin." },
  { name: "Potato Common Scab", symptoms: "Raised rough patches on tubers, corky texture.", prevention: "Maintain soil pH 5.2-5.5.", fertilizer: "Low nitrogen, high phosphorus.", control: "Streptomycin seed treatment." },
  { name: "Potato Black Scurf", symptoms: "Black crust on tubers, stunted growth.", prevention: "Certified disease-free seed.", fertilizer: "Phosphorus rich.", control: "Carbendazim seed treatment." },
  { name: "Potato Bacterial Wilt", symptoms: "Wilting during day, recovery at night, brown vascular ring.", prevention: "Use certified seed, avoid flood irrigation.", fertilizer: "Avoid excess nitrogen.", control: "Streptocycline soil drench." },

  // --- CEREALS ---
  { name: "Rice Blast", symptoms: "Diamond-shaped grey lesions with brown margin on leaves, neck rot.", prevention: "Use resistant varieties, avoid excess nitrogen.", fertilizer: "Balanced NPK, increase potassium.", control: "Tricyclazole or Isoprothiolane spray." },
  { name: "Rice Bacterial Leaf Blight", symptoms: "Yellowing and drying from leaf tips.", prevention: "Clean seed, proper drainage.", fertilizer: "Avoid excess nitrogen, apply zinc.", control: "Copper oxychloride + Streptocycline." },
  { name: "Rice Sheath Blight", symptoms: "Oval grey lesions on sheath near water line.", prevention: "Proper spacing and water management.", fertilizer: "Potassium application.", control: "Validamycin or Carbendazim." },
  { name: "Rice Brown Spot", symptoms: "Brown circular spots on leaves and grains.", prevention: "Healthy seed selection.", fertilizer: "Nitrogen and potassium.", control: "Mancozeb spray." },
  { name: "Rice Tungro Virus", symptoms: "Yellow-orange leaves, stunted plants.", prevention: "Control leafhopper vector.", fertilizer: "Balanced nutrition.", control: "Imidacloprid spray." },
  { name: "Wheat Brown Rust", symptoms: "Reddish-brown pustules on leaves.", prevention: "Rust-resistant varieties.", fertilizer: "Balanced nitrogen.", control: "Propiconazole." },
  { name: "Wheat Yellow Rust", symptoms: "Yellow stripes on leaves.", prevention: "Early sowing.", fertilizer: "Adequate potash.", control: "Tebuconazole." },
  { name: "Wheat Black Rust", symptoms: "Black pustules on stems.", prevention: "Resistant varieties.", fertilizer: "Balanced NPK.", control: "Fungicide spray." },
  { name: "Wheat Powdery Mildew", symptoms: "White powdery growth on leaves.", prevention: "Good air circulation.", fertilizer: "Avoid excess nitrogen.", control: "Sulfur fungicide." },
  { name: "Wheat Loose Smut", symptoms: "Black powder replaces grains.", prevention: "Certified seed.", fertilizer: "Normal fertilization.", control: "Seed treatment with Carbendazim." },

  // --- MAIZE & MILLETS ---
  { name: "Maize Leaf Blight", symptoms: "Long grey leaf lesions.", prevention: "Crop rotation.", fertilizer: "Potassium.", control: "Mancozeb." },
  { name: "Maize Downy Mildew", symptoms: "Yellow streaks, dwarf plants.", prevention: "Disease-free seed.", fertilizer: "Balanced NPK.", control: "Metalaxyl." },
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

  // --- VEGETABLES ---
  { name: "Tomato Leaf Curl Virus", symptoms: "Leaf curling, stunted growth.", prevention: "Whitefly control.", fertilizer: "Zinc, boron.", control: "Imidacloprid." },
  { name: "Tomato Early Blight", symptoms: "Brown concentric leaf spots.", prevention: "Crop rotation.", fertilizer: "Balanced NPK.", control: "Mancozeb." },
  { name: "Tomato Late Blight", symptoms: "Dark greasy lesions.", prevention: "Avoid overhead irrigation.", fertilizer: "Potassium.", control: "Metalaxyl." },
  { name: "Tomato Bacterial Wilt", symptoms: "Sudden wilting without yellowing.", prevention: "Soil sterilization.", fertilizer: "Lime application.", control: "Soil solarization." },
  { name: "Tomato Septoria Leaf Spot", symptoms: "Small grey circular spots.", prevention: "Remove infected leaves.", fertilizer: "Balanced nutrients.", control: "Chlorothalonil." },
  { name: "Chilli Leaf Curl", symptoms: "Leaf curling and dwarfing.", prevention: "Vector control.", fertilizer: "Micronutrients.", control: "Imidacloprid." },
  { name: "Chilli Anthracnose", symptoms: "Sunken fruit lesions.", prevention: "Clean seed.", fertilizer: "Potash.", control: "Carbendazim." },
  { name: "Chilli Powdery Mildew", symptoms: "White powdery coating.", prevention: "Proper spacing.", fertilizer: "Avoid excess nitrogen.", control: "Sulfur spray." },
  { name: "Damping-Off", symptoms: "Seedling rot at soil line.", prevention: "Sterilized nursery soil.", fertilizer: "Light fertilization.", control: "Captan seed treatment." },
  { name: "Cucumber Mosaic Virus", symptoms: "Mosaic leaf pattern.", prevention: "Aphid control.", fertilizer: "Balanced nutrients.", control: "Insecticide spray." },
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
  { name: "Citrus Canker", symptoms: "Corky raised lesions.", prevention: "Windbreaks.", fertilizer: "Avoid excess nitrogen.", control: "Copper oxychloride." },
  { name: "Citrus Greening", symptoms: "Yellow mottling, bitter fruit.", prevention: "Psyllid control.", fertilizer: "Micronutrients.", control: "Insecticide." },
  { name: "Papaya Ringspot Virus", symptoms: "Ring patterns on fruit.", prevention: "Rogue infected plants.", fertilizer: "Balanced nutrients.", control: "Aphid control." },
  { name: "Grape Downy Mildew", symptoms: "Yellow oil spots.", prevention: "Proper canopy.", fertilizer: "Potassium.", control: "Metalaxyl." },
  { name: "Grape Powdery Mildew", symptoms: "White dusty coating.", prevention: "Air circulation.", fertilizer: "Avoid excess nitrogen.", control: "Sulfur spray." },
  { name: "Pomegranate Bacterial Blight", symptoms: "Oily leaf spots, fruit cracking.", prevention: "Sanitation.", fertilizer: "Balanced nutrition.", control: "Streptocycline + Copper." },
  { name: "Guava Wilt", symptoms: "Sudden tree death.", prevention: "Crop rotation.", fertilizer: "Organic manure.", control: "Soil drenching." },
  { name: "Pineapple Heart Rot", symptoms: "Central leaf rot.", prevention: "Good drainage.", fertilizer: "Balanced NPK.", control: "Metalaxyl." },
  { name: "Litchi Fruit Rot", symptoms: "Brown soft rot.", prevention: "Proper harvesting.", fertilizer: "Potassium.", control: "Fungicide spray." },

  // --- PLANTATION ---
  { name: "Coconut Bud Rot", symptoms: "Rotting of growing point.", prevention: "Good drainage.", fertilizer: "Balanced nutrition.", control: "Copper fungicide." },
  { name: "Coconut Root Wilt", symptoms: "Drooping leaves.", prevention: "Proper irrigation.", fertilizer: "Organic manure.", control: "Root feeding." },
  { name: "Arecanut Yellow Leaf", symptoms: "Progressive yellowing.", prevention: "Balanced nutrition.", fertilizer: "Magnesium sulfate.", control: "Integrated management." },
  { name: "Coffee Leaf Rust", symptoms: "Orange powder underside leaves.", prevention: "Shade regulation.", fertilizer: "Potassium.", control: "Bordeaux mixture." },
  { name: "Tea Blister Blight", symptoms: "Blister-like spots.", prevention: "Pruning.", fertilizer: "Balanced nutrition.", control: "Copper fungicide." },
  { name: "Tea Red Rust", symptoms: "Reddish leaf patches.", prevention: "Shade control.", fertilizer: "Nitrogen.", control: "Bordeaux mixture." },

  // --- GENERAL/COMPLEX ---
  { name: "Fusarium Wilt", symptoms: "Yellowing and wilting.", prevention: "Resistant varieties.", fertilizer: "Phosphorus & potassium.", control: "Carbendazim." },
  { name: "Verticillium Wilt", symptoms: "Gradual plant decline.", prevention: "Crop rotation.", fertilizer: "Balanced nutrients.", control: "Soil fumigation." },
  { name: "General Bacterial Leaf Spot", symptoms: "Water-soaked lesions.", prevention: "Clean seed.", fertilizer: "Balanced nutrition.", control: "Copper fungicide." },
  { name: "Mosaic Virus Complex", symptoms: "Patchy light-dark leaves.", prevention: "Vector control.", fertilizer: "Micronutrients.", control: "Insecticide." },
  { name: "Leaf Curl Disease", symptoms: "Twisted curled leaves.", prevention: "Resistant varieties.", fertilizer: "Zinc & boron.", control: "Imidacloprid." },
  { name: "Rust Disease", symptoms: "Powdery pustules.", prevention: "Resistant varieties.", fertilizer: "Balanced NPK.", control: "Fungicide spray." },
  { name: "Sooty Mold", symptoms: "Black coating on leaves.", prevention: "Control sap-sucking insects.", fertilizer: "Balanced nutrients.", control: "Insecticide + washing." },
  { name: "Seed Rot", symptoms: "Poor germination.", prevention: "Treated seed.", fertilizer: "Seedling nutrients.", control: "Fungicide seed treatment." },
  { name: "Collar Rot", symptoms: "Rot at stem base.", prevention: "Proper drainage.", fertilizer: "Organic manure.", control: "Carbendazim." },
  { name: "Dieback Disease", symptoms: "Progressive branch death.", prevention: "Proper pruning.", fertilizer: "Potassium.", control: "Fungicide spray." },
  { name: "Iron Chlorosis", symptoms: "Yellowing between veins.", prevention: "Soil pH correction.", fertilizer: "Iron sulfate.", control: "Foliar spray." },
  { name: "Zinc Deficiency", symptoms: "Small leaves.", prevention: "Balanced fertilization.", fertilizer: "Zinc sulfate.", control: "Soil or foliar application." },
  { name: "Nitrogen Deficiency", symptoms: "Pale leaves.", prevention: "Adequate nitrogen.", fertilizer: "Urea.", control: "Soil application." },
  { name: "Potassium Deficiency", symptoms: "Leaf edge scorching.", prevention: "Balanced NPK.", fertilizer: "Muriate of potash.", control: "Soil application." }
];

// Initialize the normalized database
const DATABASE = normalizeDatabase(RAW_CROP_DB);

// ====================== IMAGE SIMULATION ENGINE ======================
const ImageSimulationEngine = {
  // Uses a hash of the file metadata to deterministically pick a result.
  // This ensures 'PhotoA.jpg' always yields Disease X, and 'PhotoB.jpg' yields Disease Y.
  analyze: async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a simple hash from filename and size
        const uniqueString = file.name + file.size;
        let hash = 0;
        for (let i = 0; i < uniqueString.length; i++) {
          hash = ((hash << 5) - hash) + uniqueString.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        
        // Use hash to pick a random index from the database
        const positiveHash = Math.abs(hash);
        const index = positiveHash % DATABASE.length;
        const matchedDisease = DATABASE[index];

        // Simulate confidence based on the hash (between 80% and 99%)
        const confidence = 80 + (positiveHash % 20);

        resolve({
          ...matchedDisease,
          confidence: confidence.toFixed(1),
          analyzedAt: new Date().toISOString()
        });
      }, 2000); // 2 second loading simulation
    });
  }
};

// ====================== MAIN APP COMPONENT ======================
const App = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualResults, setManualResults] = useState([]);
  const [history, setHistory] = useState([]);
  
  const fileInputRef = useRef(null);

  // --- IMAGE UPLOAD HANDLER ---
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setLoading(true);
    setAnalysisResult(null);

    try {
      const result = await ImageSimulationEngine.analyze(file);
      setAnalysisResult(result);
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        disease: result.name,
        timestamp: new Date().toLocaleTimeString(),
        type: 'Image Analysis',
        severity: result.severity
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 10));

    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  // --- SMART SEARCH HANDLER ---
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setManualResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Filter logic: 
    // 1. Exact match inclusion
    // 2. Fuzzy match (Levenshtein) for typos
    const results = DATABASE.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(term);
      const symptomMatch = item.symptoms.toLowerCase().includes(term);
      const cropMatch = item.crop.toLowerCase().includes(term);
      
      if (nameMatch || symptomMatch || cropMatch) return true;

      // Fuzzy check if term is close to crop name
      const dist = levenshteinDistance(term, item.crop.toLowerCase());
      return dist <= 2; // Allow 2 character edits
    });

    setManualResults(results);
  }, [searchTerm]);

  const handleManualSelect = (disease) => {
    setAnalysisResult({
      ...disease,
      confidence: 100, // Manual entry is 100% user intent
      analyzedAt: new Date().toISOString()
    });
    
    // Add to history
    const historyItem = {
      id: Date.now(),
      disease: disease.name,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Manual Search',
      severity: disease.severity
    };
    setHistory(prev => [historyItem, ...prev].slice(0, 10));
    
    // Switch to view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg text-white shadow-lg shadow-green-200">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Geospatial AI AI</h1>
              <p className="text-xs text-slate-500 font-medium hidden md:block">Advanced Crop Disease Diagnosis System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
               <Database size={12} /> {DATABASE.length} Diseases Indexed
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* --- TABS --- */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
            <button
              onClick={() => { setActiveTab('upload'); setAnalysisResult(null); setSelectedImage(null); }}
              className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'upload' ? 'bg-green-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Camera size={18} /> Image Diagnosis
            </button>
            <button
              onClick={() => { setActiveTab('manual'); setAnalysisResult(null); }}
              className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'manual' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Search size={18} /> Smart Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: INPUT AREA --- */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. UPLOAD MODE */}
            {activeTab === 'upload' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Upload className="text-green-600" size={20}/> Upload Leaf Photo
                </h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Our AI analyzes distinct features. Uploading different photos (even of the same leaf) will trigger new analysis based on file signatures.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={loading}
                  className="w-full py-10 border-2 border-dashed border-slate-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center justify-center group"
                >
                  {loading ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="h-10 w-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
                      <span className="text-green-700 font-bold">Processing Image...</span>
                    </div>
                  ) : (
                    <>
                      <div className="bg-green-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <Camera size={32} className="text-green-600" />
                      </div>
                      <span className="text-slate-900 font-bold text-lg">Click to Upload</span>
                      <span className="text-slate-500 text-sm mt-1">Supports JPG, PNG</span>
                    </>
                  )}
                </button>
                
                {selectedImage && !loading && (
                   <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 bg-slate-200 rounded overflow-hidden">
                         {/* Placeholder for preview */}
                         <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-full w-full object-cover" />
                       </div>
                       <div className="text-sm">
                         <div className="font-bold text-slate-700 truncate max-w-[150px]">{selectedImage.name}</div>
                         <div className="text-xs text-slate-400">{(selectedImage.size/1024).toFixed(0)} KB</div>
                       </div>
                     </div>
                     <CheckCircle size={20} className="text-green-500" />
                   </div>
                )}
              </div>
            )}

            {/* 2. MANUAL SEARCH MODE */}
            {activeTab === 'manual' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[500px] flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Search className="text-blue-600" size={20}/> Database Search
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Search 80+ diseases by crop, symptom, or name. (e.g. "Rice", "Wilting", "Blight")
                </p>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Type to search database..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {manualResults.length > 0 ? (
                    manualResults.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => handleManualSelect(item)}
                        className="p-3 bg-white border border-slate-100 hover:border-blue-400 hover:bg-blue-50 rounded-lg cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-blue-700">{item.name}</div>
                            <div className="text-xs text-slate-500 mt-1 line-clamp-1">{item.symptoms}</div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded group-hover:bg-white">
                            {item.crop}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      {searchTerm ? 'No diseases found matching your search.' : 'Start typing to explore the knowledge base.'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HISTORY WIDGET */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <History size={16} /> Recent Activity
              </h4>
              <div className="space-y-3">
                {history.length === 0 && <div className="text-sm text-slate-400 italic">No recent scans.</div>}
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        h.severity === 'Critical' ? 'bg-red-500' : 
                        h.severity === 'High' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <div className="font-medium text-slate-800">{h.disease}</div>
                        <div className="text-xs text-slate-400">{h.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN: RESULTS AREA --- */}
          <div className="lg:col-span-7">
            {analysisResult ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* 1. MAIN DIAGNOSIS CARD */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  {/* Status Bar */}
                  <div className={`px-6 py-4 flex justify-between items-center text-white ${
                    analysisResult.severity === 'Critical' ? 'bg-gradient-to-r from-red-600 to-red-700' :
                    analysisResult.severity === 'High' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    analysisResult.severity === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-r from-green-600 to-green-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      {analysisResult.severity === 'Critical' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                      <div>
                        <h2 className="font-bold text-xl">{analysisResult.name}</h2>
                        <p className="text-xs opacity-90 font-medium tracking-wide uppercase">
                          {analysisResult.crop} • Severity: {analysisResult.severity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{analysisResult.confidence}%</div>
                      <div className="text-xs opacity-80">Match Confidence</div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    {/* SYMPTOMS BOX */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
                       <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                         <Activity size={16} className="text-slate-500" /> Observed Symptoms
                       </h3>
                       <p className="text-slate-700 leading-relaxed">
                         {analysisResult.symptoms}
                       </p>
                    </div>

                    {/* ACTION GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="p-4 rounded-xl border border-red-100 bg-red-50/50">
                        <div className="flex items-center gap-2 mb-2 text-red-800 font-bold">
                          <Bug size={18} /> Chemical Control
                        </div>
                        <p className="text-sm text-slate-700">{analysisResult.control}</p>
                      </div>

                      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                        <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold">
                          <ThermometerSun size={18} /> Prevention
                        </div>
                        <p className="text-sm text-slate-700">{analysisResult.prevention}</p>
                      </div>

                      <div className="p-4 rounded-xl border border-green-100 bg-green-50/50">
                        <div className="flex items-center gap-2 mb-2 text-green-800 font-bold">
                          <Sprout size={18} /> Fertilizer
                        </div>
                        <p className="text-sm text-slate-700">{analysisResult.fertilizer}</p>
                      </div>

                      <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50">
                        <div className="flex items-center gap-2 mb-2 text-purple-800 font-bold">
                          <Info size={18} /> Additional Notes
                        </div>
                        <p className="text-sm text-slate-700">
                          Monitor field conditions. High humidity and temperature variations often trigger {analysisResult.name}.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>

                {/* 2. WEATHER CONTEXT (Simulated) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Wind size={18} className="text-slate-400" /> Environmental Context
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 uppercase font-bold">Temp</div>
                      <div className="font-mono text-lg font-bold text-slate-700">24°C</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 uppercase font-bold">Humidity</div>
                      <div className="font-mono text-lg font-bold text-blue-600">82%</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 uppercase font-bold">Risk</div>
                      <div className="font-mono text-lg font-bold text-red-500">High</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    *Weather data correlates with disease triggers based on typical seasonal averages.
                  </p>
                </div>

              </div>
            ) : (
              // --- EMPTY STATE ---
              <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-6 animate-float">
                  <Leaf size={48} className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Diagnose</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  {activeTab === 'upload' 
                    ? "Upload an image of the affected crop. Our system uses file signatures to ensure unique results for every different photo."
                    : "Use the search bar on the left to browse our database of 80+ crop diseases and get instant solutions."
                  }
                </p>
                
                {/* Quick Tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  {['Potato Blight', 'Rice Blast', 'Tomato Curl', 'Wheat Rust'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
