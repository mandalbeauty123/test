import React, { useState } from 'react';
import { Sprout, MapPin, Activity, Droplets, ThermometerSun, History, Leaf, Search, Navigation } from 'lucide-react';

const App = () => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    crop: 'Wheat',
    placeName: '', // Auto-fills via API
    lat: '',       // Auto-fills via GPS
    lon: '',       // Auto-fills via GPS
    stage: 'Vegetative',
    ph: '6.5' 
  });

  const [currentAdvisory, setCurrentAdvisory] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); 

  // --- 1. ROBUST AUTO-LOCATE FUNCTION ---
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      setStatusMsg("Geolocation is not supported by your browser.");
      return;
    }

    setStatusMsg("📍 Detecting location...");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);

        // Update coordinates immediately so user sees progress
        setFormData(prev => ({ 
            ...prev, 
            lat: lat, 
            lon: lon,
            placeName: "Fetching city name..." 
        }));

        try {
          // Reverse Geocode (Get City Name)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          
          if (!response.ok) throw new Error("Location API failed");
          
          const data = await response.json();
          
          // Logic to find the best available name
          const city = data.city || data.locality || data.principalSubdivision || "Unknown Location";
          const region = data.principalSubdivision || data.countryName || "";
          const fullName = region ? `${city}, ${region}` : city;
          
          // Update State with Name
          setFormData(prev => ({ ...prev, placeName: fullName }));
          setStatusMsg("✅ Location found! Analyzing...");
          
          // Immediately Run Analysis
          generateAdvisory(lat, lon, fullName);

        } catch (error) {
          console.error("Geocoding failed", error);
          const fallbackName = `Lat: ${lat}, Lon: ${lon}`;
          setFormData(prev => ({ ...prev, placeName: fallbackName }));
          generateAdvisory(lat, lon, fallbackName);
        }
      },
      (error) => {
        let errorMsg = "❌ Unable to retrieve location.";
        if (error.code === 1) errorMsg = "❌ Location permission denied.";
        setStatusMsg(errorMsg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- 2. AI & WEATHER ENGINE ---
  const generateAdvisory = async (manualLat, manualLon, manualPlace) => {
    setLoading(true);
    const lat = manualLat || formData.lat;
    const lon = manualLon || formData.lon;
    const place = manualPlace || formData.placeName;

    if(!lat || !lon) {
        setStatusMsg("❌ Please enter Latitude and Longitude.");
        setLoading(false);
        return;
    }

    try {
        // A. FETCH LIVE WEATHER (Open-Meteo)
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`
        );
        const weatherData = await weatherResponse.json();
        
        // Extract Real Data
        const realTemp = weatherData.current_weather.temperature;
        const realWind = weatherData.current_weather.windspeed;
        const currentHour = new Date().getHours();
        const realHumidity = weatherData.hourly.relativehumidity_2m[currentHour] || 60;

        // B. SIMULATE NDVI (Vegetation Index)
        // Context: Higher NDVI in favorable weather
        const randomFactor = (parseFloat(lat) + parseFloat(lon)) % 1; 
        const simulatedNDVI = 0.70 + (randomFactor * 0.15); 
        const simulatedNDWI = 0.20 + (randomFactor * 0.1);

        // C. AI LOGIC LAYERS
        
        // Yield Predictor
        let yieldPred = simulatedNDVI * 12; 
        if (formData.crop.toLowerCase().includes('wheat')) yieldPred *= 1.25;
        
        // Fertilizer Calculator
        const ph = parseFloat(formData.ph);
        let fertRec = "Balanced NPK (20-20-20)";
        if (ph < 6.0) fertRec = "Lime + Nitrogen (Urea)";
        if (ph > 7.5) fertRec = "Gypsum + Phosphorus (DAP)";

        // Water Stress Detector
        let stressStatus = { label: "Optimal", color: "text-green-600", bg: "bg-green-100" };
        if (realTemp > 30 || simulatedNDWI < 0.2) {
            stressStatus = { label: "High Stress", color: "text-red-600", bg: "bg-red-100" };
        } else if (realTemp > 25 && simulatedNDWI < 0.3) {
             stressStatus = { label: "Moderate", color: "text-orange-600", bg: "bg-orange-100" };
        }

        // Disease Risk Forecaster
        let diseaseRisk = "Low Risk";
        if (realHumidity > 85 && realTemp > 18 && realTemp < 28) diseaseRisk = "High (Fungal)";
        else if (realHumidity > 70) diseaseRisk = "Moderate Risk";

        // Construct Final Object
        const newAdvisory = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            place: place,
            crop: formData.crop,
            yield: yieldPred.toFixed(1) + " t/ha",
            fertilizer: fertRec,
            waterStress: stressStatus,
            disease: diseaseRisk,
            metrics: {
                temp: realTemp,
                humidity: realHumidity,
                ndvi: simulatedNDVI,
                wind: realWind
            }
        };

        setCurrentAdvisory(newAdvisory);
        setHistory(prev => [newAdvisory, ...prev]);
        setStatusMsg(""); 

    } catch (err) {
        console.error(err);
        setStatusMsg("❌ Error connecting to satellite data.");
    } finally {
        setLoading(false);
    }
  };

  // --- UI RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center gap-3">
         <div className="bg-green-600 p-2 rounded-lg shadow-md">
            <MapPin className="text-white" size={24} />
         </div>
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">GeoGemma AI</h1>
            <p className="text-xs text-slate-500 font-medium">Secure backend powered advisory</p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INPUT FORM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Search size={18} className="text-slate-400"/> Parameters
                </h2>
                <button 
                    onClick={handleAutoLocate}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-100"
                >
                    <Navigation size={12} /> Auto-Locate
                </button>
            </div>

            <div className="space-y-4">
              <InputField 
                label="Crop Type" 
                value={formData.crop} 
                onChange={(e) => setFormData({...formData, crop: e.target.value})} 
              />
              
              <InputField 
                label="Place Name" 
                placeholder="Auto-fills on locate..."
                value={formData.placeName} 
                onChange={(e) => setFormData({...formData, placeName: e.target.value})} 
              />

              <div className="grid grid-cols-2 gap-4">
                 <InputField 
                    label="Latitude" 
                    type="number"
                    value={formData.lat} 
                    onChange={(e) => setFormData({...formData, lat: e.target.value})} 
                 />
                 <InputField 
                    label="Longitude" 
                    type="number"
                    value={formData.lon} 
                    onChange={(e) => setFormData({...formData, lon: e.target.value})} 
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="Growth Stage" 
                    value={formData.stage} 
                    onChange={(e) => setFormData({...formData, stage: e.target.value})} 
                />
                <InputField 
                    label="Soil pH" 
                    type="number"
                    value={formData.ph} 
                    onChange={(e) => setFormData({...formData, ph: e.target.value})} 
                />
              </div>

              {statusMsg && <p className="text-blue-600 text-xs font-medium text-center animate-pulse">{statusMsg}</p>}

              <button 
                onClick={() => generateAdvisory()}
                disabled={loading}
                className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md flex justify-center items-center gap-2"
              >
                {loading ? "Processing..." : "Generate Advisory"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ADVISORY RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          
          {currentAdvisory ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Result Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-lg flex items-center gap-2">
                    <Leaf size={18} className="text-green-400" /> Advisory Report
                    </h2>
                    <p className="text-xs text-slate-400">Location: {currentAdvisory.place}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-mono text-slate-300">LIVE</span>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <ResultItem 
                    icon={<Activity className="text-blue-600" size={20}/>}
                    label="Predicted Yield"
                    value={currentAdvisory.yield}
                />

                <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-slate-50 rounded-md"><Droplets className="text-cyan-600" size={20}/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Water Stress</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-sm font-bold ${currentAdvisory.waterStress.color} ${currentAdvisory.waterStress.bg}`}>
                            {currentAdvisory.waterStress.label}
                        </span>
                    </div>
                </div>

                <ResultItem 
                    icon={<Sprout className="text-purple-600" size={20}/>}
                    label="Fertilizer Rec."
                    value={currentAdvisory.fertilizer}
                />

                <ResultItem 
                    icon={<ThermometerSun className="text-orange-600" size={20}/>}
                    label="Disease Risk"
                    value={currentAdvisory.disease}
                />
              </div>

              {/* Live Metrics Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-xs text-slate-500 grid grid-cols-4 gap-2">
                <div className="text-center border-r border-slate-200">
                    <span className="block font-bold text-slate-700 text-lg">{currentAdvisory.metrics.temp}°C</span>
                    Live Temp
                </div>
                <div className="text-center border-r border-slate-200">
                    <span className="block font-bold text-slate-700 text-lg">{currentAdvisory.metrics.humidity}%</span>
                    Humidity
                </div>
                <div className="text-center border-r border-slate-200">
                    <span className="block font-bold text-slate-700 text-lg">{currentAdvisory.metrics.wind} km/h</span>
                    Wind Speed
                </div>
                <div className="text-center">
                    <span className="block font-bold text-slate-700 text-lg">{currentAdvisory.metrics.ndvi.toFixed(2)}</span>
                    Est. NDVI
                </div>
              </div>
            </div>
          ) : (
            // EMPTY STATE (Start Screen)
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center h-64">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <History className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Ready to Analyze</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    Click <b>Auto-Locate</b> to fetch live environmental data for your farm.
                </p>
            </div>
          )}

          {/* HISTORY LIST */}
          {history.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Recent Scans</h3>
                <div className="space-y-2">
                    {history.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all cursor-pointer" onClick={() => setCurrentAdvisory(item)}>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <div>
                                    <p className="font-bold text-sm text-slate-700">{item.place}</p>
                                    <p className="text-xs text-slate-500">{item.crop} • {item.timestamp}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm text-slate-800"
    />
  </div>
);

const ResultItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 p-1.5 bg-slate-50 rounded-md">{icon}</div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="font-semibold text-slate-800 text-sm mt-0.5 leading-snug">{value}</p>
        </div>
    </div>
);

export default App;
