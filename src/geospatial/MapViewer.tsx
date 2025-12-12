import { useEffect, useState } from "react";
import { MapContainer, TileLayer, LayersControl, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { useTheme } from "@/contexts/ThemeContext";

// Fix Leaflet's default icon path issues in Vite/React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const MapViewer = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-muted/20 animate-pulse" />;

  // Dark Matter tiles for Dark Mode, Positron for Light Mode
  const tileUrl = theme === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[20.5937, 78.9629]} // Center of India
        zoom={5} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Base Map">
            <TileLayer
              url={tileUrl}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
      </MapContainer>
      
      {/* GIS Legend / Scale Overlay */}
      <div className="absolute bottom-8 left-6 z-[400] bg-background/80 backdrop-blur-md border border-border/50 p-4 rounded-xl shadow-xl w-56">
        <h4 className="font-semibold text-xs uppercase tracking-wider mb-2 text-muted-foreground">Analysis Index</h4>
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 mb-1"></div>
        <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
          <span>Critical</span>
          <span>Optimal</span>
        </div>
      </div>
    </div>
  );
};

export default MapViewer;