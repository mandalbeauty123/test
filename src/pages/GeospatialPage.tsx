// GeospatialPage.tsx
// Full updated file with fixed LineGraph and robust Popup/ClinicalReport handling

import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import {
  Search,
  Loader2,
  Activity,
  MapPin,
  Send,
  Sun,
  Moon,
  LocateFixed,
  Layers,
  Play,
  TrendingUp,
  CheckCircle,
  X,
  Ruler,
  Box,
  Download,
  Leaf,
  Thermometer,
  Sprout,
  AlertTriangle,
  Trash2,
  Maximize2,
  FileText,
  BarChart3,
  Bug,
} from "lucide-react";

/* -------------------- Leaflet icon patch -------------------- */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* -------------------- GeoBackend (simulated APIs & knowledge base) -------------------- */
const GeoBackend = {
  searchLocations: async (query: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`
      );
      return await res.json();
    } catch {
      return [];
    }
  },

  reverseGeocode: async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      return data?.display_name ?? `Lat:${lat.toFixed(4)}, Lng:${lng.toFixed(4)}`;
    } catch {
      return `Lat:${lat.toFixed(4)}, Lng:${lng.toFixed(4)}`;
    }
  },

  analyzeWithGemini: async (location: any, type: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const base: any = {
      location,
      category: "GENERAL",
      data: {
        title: "Area Analysis",
        diagnosis: { status: "Stable", risk: "Low", message: "No anomalies detected." },
        metrics: { Population: "Moderate", Traffic: "Moderate", Temp: "25°C" },
        graph: [50, 52, 51, 53, 50],
      },
    };

    if (type === "CROP_DOCTOR") {
      const lat = location?.lat || 0;
      const lng = location?.lng || 0;
      const seed = Math.abs(Math.sin(lat * 123.456 + lng * 789.012) * 10000);
      const rand = (offset: number) => ((seed + offset) * 9301 + 49297) % 233280 / 233280;
      const prob = Math.floor(rand(1) * 100);
      const hasDisease = prob > 25;
      const riskLevel = prob > 75 ? "Critical" : prob > 50 ? "High" : "Moderate";
      const yieldPred = (3.0 + rand(2) * 5.0).toFixed(1);
      const marketPrice = Math.floor(40 + rand(3) * 60);
      const historyData = Array.from({ length: 5 }, (_, i) => Number((parseFloat(yieldPred) + (rand(i + 4) * 1.5 - 0.75)).toFixed(1)));

      base.category = "AGRICULTURE";
      base.data = {
        title: "Crop Health Doctor",
        tabs: ["Health", "Soil", "Yield"],
        diagnosis: {
          status: hasDisease ? "Action Required" : "Healthy",
          risk: hasDisease ? riskLevel : "Low",
          message: hasDisease ? `Pathogen activity detected. Probability: ${prob}%.` : "Crop health appears stable. Optimal growth conditions detected.",
          details: hasDisease ? "Spectral analysis indicates stress signatures consistent with fungal infection." : "NDVI values are within healthy range for this growth stage.",
        },
        metrics: {
          pH: (5.5 + rand(5) * 3.0).toFixed(1),
          Moisture: Math.floor(30 + rand(6) * 50) + "%",
          NDVI: (0.5 + rand(7) * 0.4).toFixed(2),
        },
        alerts: hasDisease ? [{ type: "disease", name: "Apple Scab", risk: riskLevel, action: "Fungicide App." }] : [],
        graph: Array.from({ length: 7 }, (_, i) => Math.floor(40 + rand(i + 10) * 40)),
        yieldData: {
          prediction: `${yieldPred} T/Ha`,
          history: historyData,
          diseaseRisk: hasDisease ? "Apple Scab (Venturia inaequalis)" : null,
          diseaseProb: hasDisease ? `${prob}%` : "0%",
          riskLevel: riskLevel,
          marketPrice: `₹${marketPrice}/kg`,
        },
      };
    }

    if (type === "SHIP_DETECTION") {
      base.category = "MARITIME";
      base.data.title = "Maritime Surveillance";
      base.data.diagnosis = { status: "Active", risk: "Low", message: "3 Vessels detected in range." };
    }

    return base;
  },

  getSoilPH: (lat: number, lng: number) => {
    const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233));
    const ph = 4.5 + (seed % 1) * 4.0;
    return Number(ph.toFixed(2));
  },

  cropCatalog: [
    { name: "Rice", minPH: 5.0, maxPH: 7.0, pricePerKg: 25, avgYieldKgPerHa: 4000, planting: "Kharif (Monsoon)", saleStatus: "Profitable", profit: 45000, tips: "Maintain standing water." },
    { name: "Wheat", minPH: 6.0, maxPH: 7.8, pricePerKg: 22, avgYieldKgPerHa: 3500, planting: "Rabi (Winter)", saleStatus: "Stable", profit: 38000, tips: "Irrigate at crown root initiation." },
    { name: "Maize", minPH: 5.5, maxPH: 7.5, pricePerKg: 18, avgYieldKgPerHa: 3000, planting: "Kharif/Rabi", saleStatus: "Variable", profit: 25000, tips: "Ensure good drainage." },
    { name: "Potato", minPH: 5.0, maxPH: 6.5, pricePerKg: 15, avgYieldKgPerHa: 25000, planting: "Winter", saleStatus: "High Risk/Reward", profit: 80000, tips: "Earthing up is crucial." },
    { name: "Sugarcane", minPH: 6.0, maxPH: 7.5, pricePerKg: 4, avgYieldKgPerHa: 90000, planting: "Spring/Autumn", saleStatus: "Long Term", profit: 120000, tips: "High water requirement." },
    { name: "Mustard", minPH: 5.8, maxPH: 7.5, pricePerKg: 50, avgYieldKgPerHa: 1500, planting: "Rabi", saleStatus: "Profitable", profit: 40000, tips: "Sulfur application helps oil content." },
  ],

  cropsForPH: (ph: number) => {
    const list = GeoBackend.cropCatalog
      .filter((c) => ph >= c.minPH && ph <= c.maxPH)
      .map((c) => {
        const variation = 0.9 + Math.random() * 0.2;
        return { ...c, profit: Math.floor(c.profit * variation) };
      });
    if (list.length === 0) {
      return GeoBackend.cropCatalog.slice(0, 3).map((c) => ({ ...c, profit: Math.floor(c.profit * 0.8), saleStatus: "Adaptation Needed" }));
    }
    return list;
  },

  cropInfo: (name: string) => {
    if (!name) return null;
    const key = name.trim().toLowerCase();
    return GeoBackend.cropCatalog.find((c) => c.name.toLowerCase() === key) ?? null;
  },

  processNaturalLanguageQuery: (query: string) => {
    return { action: "CHAT_REPLY", text: "Command processed." };
  },

  startAsyncJob: (type: string) => ({ id: Math.random().toString(36).substr(2, 9), type, progress: 0 }),
};

/* -------------------- Fixed LineGraph (proportional, robust, typed) -------------------- */

type LineGraphProps = {
  data: number[];
  color?: string;
  showLabels?: boolean;
  height?: number | string;
  padding?: number;
};

const LineGraph: React.FC<LineGraphProps> = ({ data, color = "#22c55e", showLabels = false, height = "100%", padding = 8 }) => {
  const safeData = Array.isArray(data) && data.length > 0 ? data.slice() : [0];
  const count = safeData.length;
  const minVal = Math.min(...safeData);
  const maxVal = Math.max(...safeData);
  const range = maxVal - minVal || 1;
  const vbW = 100;
  const vbH = 100;
  const pad = Math.max(0, Math.min(20, padding));
  const padX = pad * (vbW / 100);
  const padY = pad * (vbH / 100);

  const points = safeData.map((val, i) => {
    const x = padX + (i / Math.max(1, count - 1)) * (vbW - padX * 2);
    const y = padY + (1 - (val - minVal) / range) * (vbH - padY * 2);
    return { x, y, val };
  });

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const fillPath = `M ${padX},${vbH - padY} L ${polyPoints} L ${vbW - padX},${vbH - padY} Z`;
  const strokePath = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
  const gradId = `lg-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div style={{ width: "100%", height }} className="relative font-sans">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path d={fillPath} fill={`url(#${gradId})`} stroke="none" />
        <path d={strokePath} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r={2.6} fill="#fff" stroke={color} strokeWidth={1.6} />
            {showLabels && (
              <text x={p.x} y={p.y - 6} fontSize={3.8} textAnchor="middle" fontWeight={700} fill={color}>
                {String(p.val)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

/* -------------------- ClinicalReport (compact + robust) -------------------- */

const ClinicalReport: React.FC<{ data: any; onClose: () => void; isDarkMode: boolean; soilPH?: number; crops?: any[] }> = ({ data, onClose, isDarkMode, soilPH, crops }) => {
  if (!data) return null;
  const d = data.data;
  const cat = data.category || "GENERAL";
  const graphColor = cat === "FUTURISTIC" ? "#3b82f6" : cat === "AGRICULTURE" ? "#22c55e" : "#f59e0b";
  const [activeReportTab, setActiveReportTab] = useState(d.tabs ? d.tabs[0] : "Overview");

  return (
    <div className={`absolute bottom-0 left-0 w-full z-[5000] border-t shadow-[0_-10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 h-[42vh] rounded-t-3xl flex flex-col ${isDarkMode ? "bg-[#0b0b0c] text-gray-100" : "bg-white text-gray-900"}`}>
      <div className="px-6 py-3 border-b flex justify-between items-center sticky top-0 z-10 bg-inherit rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: `${graphColor}20`, color: graphColor }} className="p-2 rounded-xl">
            {cat === "AGRICULTURE" ? <Sprout className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {d.title}
              {cat === "AGRICULTURE" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">AI Active</span>}
            </h2>
            <div className="text-xs opacity-60 flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              {data.location
                ? (data.location.name ? `${data.location.name.split(',')[0]} (Lat: ${data.location.lat.toFixed(3)})` : `Lat: ${data.location.lat.toFixed(3)}, Lng: ${data.location.lng.toFixed(3)}`)
                : "Unknown Location"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-200/20"><Maximize2 className="w-4 h-4 opacity-60" /></button>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/20 bg-gray-100/10">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {d.tabs && (
          <div className="flex gap-4 mb-4 border-b pb-1">
            {d.tabs.map((tab: string) => (
              <button key={tab} onClick={() => setActiveReportTab(tab)} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeReportTab === tab ? "border-blue-500 text-blue-600" : "border-transparent opacity-50 hover:opacity-100"}`}>
                {tab}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {(activeReportTab === "Health" || activeReportTab === "Overview") && (
            <>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-green-50 border-green-100"}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold uppercase opacity-50 tracking-wider">Diagnosis</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${d.diagnosis?.risk === "Low" ? "bg-green-200 text-green-800" : "bg-red-100 text-red-600"}`}>
                    {d.diagnosis?.risk !== "Low" && <AlertTriangle className="w-3 h-3" />}
                    Risk: {d.diagnosis?.risk ?? "N/A"}
                  </span>
                </div>
                <div className="text-md font-medium leading-relaxed">{d.diagnosis?.message ?? "-"}</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(d.metrics || {}).map(([key, val]: any) => (
                  <div key={key} className={`p-3 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
                    <div className="text-[10px] uppercase opacity-50 font-bold mb-1">{key}</div>
                    <div className="text-lg font-bold">{key === 'NDVI' ? Number(val).toFixed(2) : val}</div>
                  </div>
                ))}
              </div>

              {d.graph && (
                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <div className="text-xs font-bold uppercase opacity-50 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> {d.metrics?.NDVI ? "NDVI Trend" : "Temporal Trend"}
                  </div>
                  <div className="h-20">
                    <LineGraph data={d.graph} color={graphColor} showLabels={false} height={"100%"} />
                  </div>
                </div>
              )}
            </>
          )}

          {(activeReportTab === "Soil" || (!d.tabs && soilPH !== undefined)) && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700">
                <div className="p-3 bg-white dark:bg-black rounded-full shadow-sm">
                  <Thermometer className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm opacity-60 font-bold uppercase">Soil pH Level</div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">{soilPH}</div>
                </div>
                <div className="ml-auto text-right text-xs opacity-70 max-w-[150px]">
                  {soilPH && soilPH < 5.5 ? "Acidic" : soilPH && soilPH > 7.5 ? "Alkaline" : "Neutral - Optimal"}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase opacity-50 mb-2">Compatible Crops (₹ Profit/Ha)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(crops || []).map((c: any) => (
                    <div key={c.name} className={`p-3 rounded-xl border flex justify-between items-center group hover:border-green-400 transition-all ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
                      <div>
                        <div className="font-bold text-md">{c.name}</div>
                        <div className="text-xs opacity-60">Avg. Yield: {c.avgYieldKgPerHa} kg/ha</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-md">₹{c.profit.toLocaleString()}</div>
                        <div className="text-[10px] opacity-50 uppercase">Est. Profit</div>
                      </div>
                    </div>
                  ))}
                </div>
                {(!crops || crops.length === 0) && <div className="text-center p-4 opacity-50 italic">No specific crops found for this pH range.</div>}
              </div>
            </div>
          )}

          {activeReportTab === "Yield" && d.yieldData ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-blue-50 border-blue-100"}`}>
                  <div className="text-xs font-bold uppercase opacity-50 mb-1">Predicted Yield</div>
                  <div className="text-2xl font-bold text-blue-600">{d.yieldData.prediction}</div>
                  <div className="text-[10px] opacity-60 mt-1">Confidence: High</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-green-50 border-green-100"}`}>
                  <div className="text-xs font-bold uppercase opacity-50 mb-1">Market Price</div>
                  <div className="text-2xl font-bold text-green-600">{d.yieldData.marketPrice}</div>
                  <div className="text-[10px] opacity-60 mt-1">Regional Mandi Avg.</div>
                </div>
              </div>

              {d.yieldData.diseaseRisk && (
                <div className={`p-4 rounded-xl border-l-4 flex items-center gap-4 shadow-sm bg-white dark:bg-gray-800 ${d.yieldData.riskLevel === 'Critical' ? "border-red-500" : "border-orange-500"}`}>
                  <div className={`p-2.5 rounded-full ${d.yieldData.riskLevel === 'Critical' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                    <Bug className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase text-gray-500 tracking-wide">Pathogen Detected</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${d.yieldData.riskLevel === 'Critical' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                        {d.yieldData.diseaseProb} Risk
                      </span>
                    </div>
                    <div className="font-bold text-base text-gray-800 dark:text-gray-100">{d.yieldData.diseaseRisk}</div>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-bold uppercase opacity-50 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Historical Yield (T/Ha)
                  </div>
                  <div className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Last 5 Seasons</div>
                </div>

                <div className="h-28 w-full max-w-md mx-auto bg-gray-50 dark:bg-black/20 rounded-lg p-3 border border-dashed border-gray-300 dark:border-gray-700">
                  <LineGraph data={d.yieldData.history} color="#8b5cf6" showLabels={false} height={"100%"} />
                </div>
              </div>
            </div>
          ) : activeReportTab === "Yield" && (
            <div className="text-center p-10 opacity-60">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-500" />
              <div>Loading Yield Models...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------- MissionControl (right panel) -------------------- */

const MissionControl: React.FC<any> = (props) => {
  const { isDarkMode, activeTab, setActiveTab, activeMode, setActiveMode, layers, onToggleLayer, jobs, onStartJob, onExport, extraLayers, setExtraLayers } = props;
  const tabs = [{ id: "layers", label: "Layers" }, { id: "analysis", label: "AI Tools" }, { id: "export", label: "Export" }];
  const btnClass = isDarkMode ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-100";
  const toggleExtra = (key: string) => setExtraLayers({ ...extraLayers, [key]: !extraLayers[key] });
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = (fmt: string) => {
    setDownloading(fmt);
    setTimeout(() => {
      setDownloading(null);
      onExport(`Generated ${fmt} successfully.`);
    }, 1500);
  };

  return (
    <div className={`w-96 border-l flex flex-col z-[100] ${isDarkMode ? "bg-[#18181b] border-gray-800 text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}>
      <div className="flex border-b">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 border-b-2 transition-colors ${activeTab === t.id ? "border-blue-500 text-blue-500" : "border-transparent opacity-50 hover:opacity-100"}`}>
            <span className="text-[12px] font-bold uppercase">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "layers" && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold uppercase opacity-50 mb-2">Map Data Layers</div>
              <div className="space-y-2">
                {["Terrain", "Zoning Borders", "Street View"].map((l) => (
                  <button key={l} onClick={() => toggleExtra(l)} className={`w-full flex justify-between items-center p-3 rounded-lg border text-sm font-bold ${extraLayers[l] ? "border-blue-500 bg-blue-50 text-blue-600" : btnClass}`}>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" /> {l}
                    </div>
                    {extraLayers[l] && <CheckCircle className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase opacity-50 mb-2">Killer Features (Modes)</div>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: "time_travel", l: "Time Travel" }, { id: "air_trace", l: "Air Trace" }, { id: "insar", l: "InSAR X-Ray" }, { id: "enrich", l: "Enrichment" }, { id: "shadow", l: "Shadow Sim" }].map((f) => (
                  <button key={f.id} onClick={() => setActiveMode(activeMode === f.id ? "standard" : f.id)} className={`p-2 rounded-lg border text-left text-[11px] font-bold ${activeMode === f.id ? "bg-blue-600 text-white" : btnClass}`}>
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase opacity-50 mb-2">Analysis Result Layers</div>
              {layers.length === 0 && <div className="text-xs italic opacity-40">No active layers.</div>}
              {layers.map((l: any) => (
                <div key={l.id} className={`p-3 mb-2 rounded-lg border flex justify-between items-center ${isDarkMode ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <span className="text-sm font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} /> {l.title}
                  </span>
                  <button onClick={() => onToggleLayer(l.id)}>
                    <MapPin className={`w-4 h-4 ${l.visible ? "text-blue-500" : "opacity-30"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold uppercase opacity-50 mb-2">One-Click Models</div>
              <div className="space-y-2">
                {[{ id: "CROP_DOCTOR", l: "Auto-Crop Doctor" }, { id: "SHIP_DETECTION", l: "Ship Detection" }, { id: "BUILDING_FOOTPRINTS", l: "Building Footprints" }].map((m) => (
                  <button key={m.id} onClick={() => onStartJob(m.id)} className={`w-full p-3 rounded-lg border text-left flex justify-between items-center group ${btnClass}`}>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-500" /> <span className="text-sm font-bold">{m.l}</span>
                    </div>
                    <Play className="w-4 h-4 text-blue-500 opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase opacity-50 mb-2">Job Queue</div>
              {jobs.map((j: any) => (
                <div key={j.id} className="p-2 mb-2 rounded bg-blue-500/10 border border-blue-500/20">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{j.type}</span>
                    <span>{j.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-500/20 rounded-full">
                    <div style={{ width: `${j.progress}%` }} className="h-full bg-blue-500 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "export" && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase opacity-50 mb-2">Download Data</div>
            {["GeoTIFF", "Shapefile", "CSV", "PDF Report"].map((fmt) => (
              <button key={fmt} onClick={() => handleExport(fmt)} disabled={!!downloading} className={`w-full p-3 rounded-lg border text-left flex items-center justify-between gap-2 hover:bg-blue-500 hover:text-white transition-colors ${btnClass}`}>
                <div className="flex items-center gap-2">
                  {fmt === "PDF Report" ? <FileText className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  Export as {fmt}
                </div>
                {downloading === fmt && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------- Map helpers -------------------- */

const MapFlyTo: React.FC<{ center: any }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], 16, { duration: 1.4 });
    }
  }, [center, map]);
  return null;
};

const MapEvents: React.FC<{ onClick: (lat: number, lng: number) => void; cursor: string }> = ({ onClick, cursor }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  const map = useMap();
  useEffect(() => {
    const c = map.getContainer();
    if (c) c.style.cursor = cursor;
    return () => { if (c) c.style.cursor = ""; };
  }, [map, cursor]);
  return null;
};

/* -------------------- Main Page -------------------- */

const GeospatialPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");
  const [activeMode, setActiveMode] = useState("standard");
  const [selectedLoc, setSelectedLoc] = useState<any | null>(null);
  const [layers, setLayers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [analysisReport, setAnalysisReport] = useState<any | null>(null);
  const [pollutionTrace, setPollutionTrace] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [extraLayers, setExtraLayers] = useState<any>({});
  const [fieldPins, setFieldPins] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState("synced");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(() => {
    try {
      const raw = localStorage.getItem("geo_chat_msgs");
      return raw ? JSON.parse(raw) : [{ role: "agent", text: "Hello — I'm Geospatial AI. Click a point on the map to get live soil data." }];
    } catch {
      return [{ role: "agent", text: "Hello — I'm Geospatial AI. Click a point on the map to get live soil data." }];
    }
  });
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const [isTyping, setIsTyping] = useState(false);
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  const [soilPH, setSoilPH] = useState<number | undefined>(undefined);
  const [recommendedCrops, setRecommendedCrops] = useState<any[]>([]);

  const chatListRef = useRef<HTMLDivElement | null>(null);
  const searchTimerRef = useRef<number | null>(null);
  const prevMessagesRef = useRef<{ role: string; text: string }[] | null>(null);

  useEffect(() => {
    if (fieldPins.length > 0) {
      setSyncStatus("syncing");
      const t = setTimeout(() => setSyncStatus("synced"), 1200);
      return () => clearTimeout(t);
    }
  }, [fieldPins]);

  useEffect(() => { try { localStorage.setItem("geo_chat_msgs", JSON.stringify(messages)); } catch {} }, [messages]);

  useEffect(() => { try { const el = chatListRef.current; if (el) { setTimeout(() => { el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, 100); } } catch {} }, [messages, isTyping]);

  const handleRunAnalysis = async (modelId: string) => {
    const job = GeoBackend.startAsyncJob(modelId);
    setJobs((p) => [...p, job]);
    let pval = 0;
    const interval = setInterval(() => {
      pval += 20;
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, progress: pval } : j)));
      if (pval >= 100) {
        clearInterval(interval);
        setJobs((prev) => prev.filter((j) => j.id !== job.id));
        const newLayer = { id: Date.now().toString(), title: modelId.replace("_", " "), color: modelId === "SHIP_DETECTION" ? "#3b82f6" : "#22c55e", visible: true };
        setLayers((prev) => [newLayer, ...prev]);
        GeoBackend.analyzeWithGemini(selectedLoc || { lat: 23.6, lng: 85.5 }, modelId).then((data) => {
          setAnalysisReport(data);
          setActiveTab("layers");
          (async () => {
            setIsTyping(true);
            await new Promise((r) => setTimeout(r, 400));
            setMessages((m) => [...m, { role: "agent", text: `${modelId} finished. Report ready.` }]);
            setIsTyping(false);
          })();
        });
      }
    }, 300);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const phNow = GeoBackend.getSoilPH(lat, lng);
      const shortName = `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      const lastAgent = messagesRef.current.slice().reverse().find((m) => m.role === "agent");
      if (lastAgent && lastAgent.text && lastAgent.text.includes(`Lat: ${lat.toFixed(4)}`) && lastAgent.text.includes(`Soil pH: ${phNow}`)) {
        const name = await GeoBackend.reverseGeocode(lat, lng);
        setSelectedLoc({ lat, lng, name });
        setSoilPH(phNow);
        const crops = GeoBackend.cropsForPH(phNow);
        setRecommendedCrops(crops);
        setAnalysisReport({ data: { title: "Area Snapshot", diagnosis: { status: "Stable", risk: "Low", message: "Snapshot captured." }, metrics: { pH: phNow.toString(), Temp: "24°C", Moisture: "40%" }, graph: [10, 20, 30, 25, 30] }, location: { lat, lng, name } });
        return;
      }

      setMessages((p) => [...p, { role: "user", text: `Clicked location ${shortName}` }]);
      setIsTyping(true);

      if (activeMode === "buffer_tool") {
        const newLayer = { id: Date.now().toString(), title: "Buffer Zone (500m)", color: "#f59e0b", visible: true, type: "circle", center: [lat, lng] };
        setLayers((p) => [newLayer, ...p]);
        const name = await GeoBackend.reverseGeocode(lat, lng);
        const report = { data: { title: "Spatial Buffer (500m)", diagnosis: { status: "Zone Analyzed", risk: "Low", message: `Simulated structures found.` }, metrics: { Area: "78.5 Ha", Buildings: "32", Water: "None" }, graph: null }, location: { lat, lng, name } };
        setAnalysisReport(report);
        setSelectedLoc({ lat, lng, name });
        setSoilPH(phNow);
        setRecommendedCrops(GeoBackend.cropsForPH(phNow));

        await new Promise((r) => setTimeout(r, 200));
        setMessages((m) => [...m, { role: "agent", text: `Buffer created at ${name}. Soil pH ~ ${phNow}. ${GeoBackend.cropsForPH(phNow).slice(0, 3).map((c) => `${c.name} (${c.saleStatus})`).join(", ")}.` }]);
        setIsTyping(false);
        return;
      }

      if (activeMode === "field_ops") {
        const pin = { id: Date.now().toString(), lat, lng, note: "Field Observation" };
        setFieldPins((p) => [...p, pin]);
        setToast("Field observation saved");
        setTimeout(() => setToast(null), 1800);
        setIsTyping(false);
        setMessages((m) => [...m, { role: "agent", text: `Field observation saved at ${shortName}` }]);
        return;
      }

      if (activeMode !== "standard") {
        const data = await GeoBackend.analyzeWithGemini({ lat, lng }, activeMode);
        setAnalysisReport(data);
        setSelectedLoc({ lat, lng });
        if (activeMode === "air_trace") {
          setPollutionTrace({ sourceLat: lat + 0.02, sourceLng: lng - 0.02 });
        }
        setSoilPH(phNow);
        setRecommendedCrops(GeoBackend.cropsForPH(phNow));
        setMessages((m) => [...m, { role: "agent", text: `${data.data.title} — ${data.data.diagnosis?.message || "Analysis ready."} Soil pH: ${phNow}. Recommended: ${GeoBackend.cropsForPH(phNow).slice(0, 3).map((c) => `${c.name} (${c.saleStatus})`).join(", ")}.` }]);
        setIsTyping(false);
        return;
      }

      const name = await GeoBackend.reverseGeocode(lat, lng);
      setSelectedLoc({ lat, lng, name });
      setSoilPH(phNow);
      const crops = GeoBackend.cropsForPH(phNow);
      setRecommendedCrops(crops);
      setAnalysisReport({ data: { title: "Area Snapshot", diagnosis: { status: "Stable", risk: "Low", message: "Snapshot captured." }, metrics: { pH: phNow.toString(), Temp: "24°C", Moisture: "40%" }, graph: [10, 20, 30, 25, 30] }, location: { lat, lng, name } });

      const cropSummary = crops.length ? crops.slice(0, 3).map((c) => `${c.name} (${c.saleStatus}, profit ₹${c.profit})`).join("; ") : "No strong crop recommendations for this pH.";

      await new Promise((r) => setTimeout(r, 200));
      setMessages((m) => [...m, { role: "agent", text: `Location: ${name}.\nSoil pH: ${phNow}.\nTop recommendations: ${cropSummary}.\nTip: open the report for details.` }]);

      setIsTyping(false);
    } catch (err) {
      setIsTyping(false);
      setMessages((p) => [...p, { role: "agent", text: "Sorry — something failed while fetching live info. Try again." }]);
      console.error("map-click error:", err);
    }
  };

  const handleSearchChange = (e: any) => {
    const v = e.target.value;
    setSearchQuery(v);
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    if (v.length > 2) {
      searchTimerRef.current = window.setTimeout(async () => {
        try {
          const res = await GeoBackend.searchLocations(v);
          setSearchResults(res || []);
          setShowDropdown(true);
        } catch {
          setSearchResults([]);
          setShowDropdown(false);
        }
      }, 400);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const selectSearchResult = (r: any) => {
    const loc = { lat: parseFloat(r.lat), lng: parseFloat(r.lon), name: r.display_name };
    setSelectedLoc(loc);
    setSearchQuery(r.display_name.split(",")[0]);
    setShowDropdown(false);
    const ph = GeoBackend.getSoilPH(loc.lat, loc.lng);
    setSoilPH(ph);
    setRecommendedCrops(GeoBackend.cropsForPH(ph));
    setAnalysisReport({ data: { title: "Search Location Snapshot", diagnosis: { status: "Stable", risk: "Low", message: "Location loaded from search." }, metrics: { pH: ph.toString(), Temp: "24°C" } }, location: loc });
    setMessages((p) => [...p, { role: "agent", text: `Loaded ${r.display_name.split(",")[0]} — Soil pH: ${ph}.` }]);
  };

  const handleChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inputText = chatInput.trim();
    if (!inputText) return;
    setChatInput("");
    setIsTyping(true);
    setIsChatDisabled(true);

    // Local simple reply for demo
    setMessages((m) => [...m, { role: "user", text: inputText }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "agent", text: "Command processed." }]);
      setIsTyping(false);
      setIsChatDisabled(false);
    }, 400);
  };

  const showToast = (msg: string | null = null) => {
    setToast(msg || "Download Started...");
    setTimeout(() => setToast(null), 2500);
  };

  const onToggleLayer = (id: string) => setLayers((p) => p.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));

  const clearChat = () => {
    prevMessagesRef.current = messagesRef.current.slice();
    setMessages([{ role: "agent", text: "Chat cleared. Say 'hello' to start." }]);
    try { localStorage.removeItem("geo_chat_msgs"); } catch {}
    setToast("Chat cleared — Click to Undo");
    setTimeout(() => { setToast(null); prevMessagesRef.current = null; }, 6000);
  };

  const undoClearChat = () => {
    if (prevMessagesRef.current) {
      setMessages(prevMessagesRef.current);
      prevMessagesRef.current = null;
      setToast("Chat restored");
      setTimeout(() => setToast(null), 1800);
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? "bg-[#09090b] text-gray-100" : "bg-gray-100 text-gray-900"} font-sans overflow-hidden`}>
      <header className={`h-16 px-6 border-b flex items-center justify-between ${isDarkMode ? "border-gray-800 bg-[#18181b]" : "border-gray-200 bg-white"}`}>
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-full text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sprout text-white" aria-hidden="true"><path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"></path><path d="M4 9a5 5 0 0 1 8 4a5 5 0 0 1-8-4"></path><path d="M5 21h14"></path></svg>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-green-700">Geospatial AI</span>
            <span className="text-sm text-gray-500">Ramgarh Engineering College – Ignition Ideators</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-96">
            <div className={`relative rounded-xl flex items-center p-2 border shadow-sm ${isDarkMode ? "bg-[#09090b] border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <Search className="w-4 h-4 opacity-50 ml-2" />
              <input className="w-full bg-transparent border-none outline-none text-xs px-3" placeholder="Search Planet..." value={searchQuery} onChange={handleSearchChange} />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); }}>
                  <X className="w-4 h-4 opacity-50 hover:opacity-100 mr-1" />
                </button>
              )}
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 w-full mt-2 rounded-xl border shadow-2xl z-[10001] max-h-80 overflow-y-auto ${isDarkMode ? "bg-[#18181b] border-gray-700" : "bg-white border-gray-200"}`}>
                {searchResults.map((res, i) => (
                  <button key={i} onClick={() => selectSearchResult(res)} className={`w-full text-left p-3 text-xs border-b last:border-0 hover:bg-blue-500/10 transition-colors flex items-start gap-3 ${isDarkMode ? "border-gray-700 text-gray-300" : "border-gray-100 text-gray-700"}`}>
                    <MapPin className="w-4 h-4 mt-0.5 text-blue-500" />
                    <div>
                      <div className="font-bold">{res.display_name?.split(",")[0] ?? res.display_name}</div>
                      <div className="opacity-60 truncate w-64">{res.display_name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setIsDarkMode((s) => !s)} className="p-2 rounded-full border opacity-60 hover:opacity-100">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        <aside className={`w-80 border-r hidden md:flex flex-col ${isDarkMode ? "border-gray-800 bg-[#18181b]" : "border-gray-200 bg-white"}`}>
          <div className="flex-1 overflow-y-auto p-4" ref={chatListRef}>
            {messages.map((m, i) => (
              <div key={i} className={`mb-3 ${m.role === "agent" ? "text-left" : "text-right ml-auto"}`}>
                <div className={`inline-block max-w-[85%] rounded-2xl p-3 text-sm ${m.role === "agent" ? (isDarkMode ? "bg-gray-800 rounded-tl-none" : "bg-blue-50 rounded-tl-none") : "bg-blue-600 text-white rounded-tr-none"}`}>
                  {m.text.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>{line}{idx < m.text.split('\n').length - 1 && <br />}</React.Fragment>
                  ))}
                </div>
                <div className={`text-[10px] mt-1 px-1 ${m.role === "agent" ? "text-left" : "text-right"}`}>{m.role === "agent" ? "AI Assistant" : "You"}</div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs opacity-70 p-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>Analyzing...</span>
              </div>
            )}
          </div>

          <div className="p-2 flex gap-2 items-center border-t">
            <button onClick={() => { setAnalysisReport((prev) => { if (prev) return prev; if (selectedLoc) { return { data: { title: "Snapshot (from Chat)", diagnosis: { status: "Snapshot", risk: "Unknown", message: "Quick snapshot generated from chat." }, metrics: { pH: soilPH !== undefined ? soilPH.toString() : "N/A", Temp: "N/A" }, graph: null }, location: { ...selectedLoc } }; } return prev; }); if (!analysisReport && !selectedLoc) { setToast("No report to open"); setTimeout(() => setToast(null), 1200); } }} className="text-xs px-3 py-2 border rounded-lg hover:bg-gray-100 flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> Open Report
            </button>

            <button onClick={clearChat} className="text-xs px-3 py-2 border rounded-lg hover:bg-red-50 text-red-600 ml-auto flex items-center gap-1" title="Clear all messages">
              <Trash2 className="w-3 h-3" /> Clear
            </button>

            <div className="text-xs opacity-50 pr-1">{syncStatus === "syncing" ? "Syncing..." : "Synced"}</div>
          </div>

          <div className="p-3 border-t">
            <form onSubmit={handleChat} className={`flex items-center gap-2 p-2 rounded-lg border ${isDarkMode ? "bg-black/20 border-gray-700" : "bg-white border-gray-200"}`}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about crops, soil, or locations..." className="w-full bg-transparent text-xs outline-none" disabled={isChatDisabled} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }} />
              <button type="submit" disabled={isChatDisabled || !chatInput.trim()} className={`p-2 rounded ${isChatDisabled || !chatInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}>
                <Send className="w-4 h-4 text-blue-500" />
              </button>
            </form>
          </div>
        </aside>

        <main className={`flex-1 relative ${isDarkMode ? "bg-[#09090b]" : "bg-gray-100"}`}>
          <div className={`absolute top-4 left-4 z-[500] flex flex-col gap-2 p-2 rounded-xl border ${isDarkMode ? "bg-[#18181b] border-gray-700" : "bg-white border-gray-200"}`}>
            <button title="Field Collection" onClick={() => setActiveMode((m) => (m === "field_ops" ? "standard" : "field_ops"))} className={`p-2 rounded-lg ${activeMode === "field_ops" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}><MapPin className="w-5 h-5" /></button>
            <button title="Buffer Tool (500m)" onClick={() => setActiveMode((m) => (m === "buffer_tool" ? "standard" : "buffer_tool"))} className={`p-2 rounded-lg ${activeMode === "buffer_tool" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}><Ruler className="w-5 h-5" /></button>
            <button title="3D View" onClick={() => setIs3DMode((s) => !s)} className={`p-2 rounded-lg ${is3DMode ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}><Box className="w-5 h-5" /></button>
          </div>

          <div className="absolute top-4 right-4 z-[500]">
            <button onClick={() => { navigator.geolocation.getCurrentPosition(async (p) => { const name = await GeoBackend.reverseGeocode(p.coords.latitude, p.coords.longitude); const loc = { lat: p.coords.latitude, lng: p.coords.longitude, name }; setSelectedLoc(loc); const ph = GeoBackend.getSoilPH(loc.lat, loc.lng); setSoilPH(ph); setRecommendedCrops(GeoBackend.cropsForPH(ph)); setMessages((m) => [...m, { role: "agent", text: `Located at ${name} — pH ${ph}` }]); }, () => { showToast("Geolocation denied"); }); }} className={`w-10 h-10 border rounded-xl flex items-center justify-center shadow-lg ${isDarkMode ? "bg-[#18181b] text-white" : "bg-white text-black"}`}><LocateFixed className="w-5 h-5" /></button>
          </div>

          {toast && (
            <div onClick={() => { if (toast?.toLowerCase().includes("undo")) undoClearChat(); }} className="absolute top-20 left-1/2 -translate-x-1/2 z-[6000] bg-black/80 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-4 h-4 text-green-400" /> {toast}
            </div>
          )}

          <MapContainer center={[23.6, 85.5]} zoom={10} style={{ height: "100%", width: "100%", background: isDarkMode ? "#09090b" : "#e5e7eb", zIndex: 0, transform: is3DMode ? "perspective(1000px) rotateX(20deg) scale(1.05)" : "none", transition: "transform 1s ease-in-out", }} zoomControl={false}>
            <ZoomControl position="bottomright" />
            <MapEvents onClick={handleMapClick} cursor={activeMode !== "standard" ? "crosshair" : "grab"} />
            <MapFlyTo center={selectedLoc} />
            <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"} attribution="&copy; CARTO" />
            {extraLayers["Street View"] && <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.6} />}
            {extraLayers["Terrain"] && <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" opacity={0.5} />}
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" opacity={0.6} />

            {selectedLoc && (
              <Marker position={[selectedLoc.lat, selectedLoc.lng]}>
                <Popup className="custom-popup">
                  <div className="w-56">
                    <div className="flex items-start justify-between border-b pb-2 mb-2">
                      <div>
                        <div className="font-bold text-sm text-gray-800">{selectedLoc?.name ? selectedLoc.name.split(',')[0] : `Lat: ${selectedLoc.lat.toFixed(3)}, Lng: ${selectedLoc.lng.toFixed(3)}`}</div>
                        <div className="text-[10px] text-gray-500">Lat: {selectedLoc.lat.toFixed(3)}</div>
                      </div>
                      {soilPH !== undefined && (
                        <div className={`px-2 py-1 rounded text-xs font-bold ${soilPH < 6 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                          pH {soilPH}
                        </div>
                      )}
                    </div>

                    {recommendedCrops.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Top Suggestion</div>
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-sm">{recommendedCrops[0].name}</span>
                          <span className="text-[10px] text-gray-500">(₹{recommendedCrops[0].profit}/ha)</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { const ph = soilPH ?? GeoBackend.getSoilPH(selectedLoc.lat, selectedLoc.lng); setAnalysisReport({ category: "AGRICULTURE", data: { title: "Crop Health Doctor", diagnosis: { status: "Scanning...", risk: "Low", message: "Analyzing satellite data..." }, metrics: { pH: ph.toString() } }, location: selectedLoc }); handleRunAnalysis("CROP_DOCTOR"); }} className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded-md font-medium hover:bg-blue-700 transition-colors text-center">Run Diagnosis</button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {fieldPins.map((pin) => (
              <Marker key={pin.id} position={[pin.lat, pin.lng]}>
                <Popup>
                  <div>
                    <b>Field Observation</b>
                    <div className="text-[12px] opacity-60">{pin.note}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {layers.map((l) => l.type === "circle" ? (
              <Circle key={l.id} center={l.center} radius={500} pathOptions={{ color: l.color, fillColor: l.color, fillOpacity: 0.3 }} />
            ) : (
              <Circle key={l.id} center={[selectedLoc?.lat ?? 23.6, selectedLoc?.lng ?? 85.5]} radius={5000} pathOptions={{ fillColor: l.color, fillOpacity: 0.3, color: l.color, weight: 1 }} />
            ))}
          </MapContainer>
        </main>

        <MissionControl isDarkMode={isDarkMode} activeTab={activeTab} setActiveTab={setActiveTab} activeMode={activeMode} setActiveMode={setActiveMode} layers={layers} onToggleLayer={onToggleLayer} jobs={jobs} onStartJob={handleRunAnalysis} onExport={showToast} extraLayers={extraLayers} setExtraLayers={setExtraLayers} />
      </div>

      <ClinicalReport data={analysisReport} onClose={() => setAnalysisReport(null)} isDarkMode={isDarkMode} soilPH={soilPH} crops={recommendedCrops} />
    </div>
  );
};

export default GeospatialPage;