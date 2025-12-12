import React from "react";
import { MapContainer, TileLayer, LayersControl, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "@/components/Header";

export default function GeoOne() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          GeoOne – Geospatial AI
        </h1>

        <p className="text-muted-foreground mb-6">
          Satellite map viewer · NDVI overlays · Change detection
        </p>

        <div className="bg-white rounded-xl shadow p-4 border border-border">
          <div className="w-full h-[600px] rounded-lg overflow-hidden">
            <MapContainer center={[22.5726, 88.3639]} zoom={6} style={{ height: "100%", width: "100%" }}>
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="Satellite (Esri)">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Esri"
                  />
                </LayersControl.BaseLayer>

                {/* NDVI Overlay Example (Add your tile server URL here) */}
                {/* <LayersControl.Overlay name="NDVI Layer">
                  <TileLayer url="YOUR_NDVI_SERVER/{z}/{x}/{y}.png" />
                </LayersControl.Overlay> */}
              </LayersControl>

              <Marker position={[22.5726, 88.3639]}>
                <Popup>Kolkata – Example Marker</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          Replace NDVI overlay URLs with real Sentinel/Planet tile servers for production.
        </div>
      </main>
    </div>
  );
}
