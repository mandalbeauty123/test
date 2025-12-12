import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cpu, Layers, Activity, Database, Network } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const GeoGemmaManifesto = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
          <Cpu className="w-4 h-4" />
          <span>How GeoGemma Works</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/10">
        
        {/* Header Section */}
        <div className="p-6 border-b bg-muted/30">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Activity className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">GeoGemma Architecture</DialogTitle>
                    <DialogDescription className="text-primary/80 font-medium mt-1">
                        Spatial Foundation Model (SFM) with VLM Core
                    </DialogDescription>
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200">Vision-Language Model</Badge>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">Sentinel-2 Ingestion</Badge>
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-200">Gemini 2.5 Flash</Badge>
            </div>
        </div>

        {/* Content Section */}
        <ScrollArea className="flex-1 p-8">
          <div className="grid gap-10 md:grid-cols-2">
            
            {/* Left Column: The Narrative */}
            <div className="space-y-8">
                <section>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-destructive">
                        <span className="w-1.5 h-6 bg-destructive rounded-full"/> The Problem Statement
                    </h3>
                    <p className="text-sm text-muted-foreground leading-7 text-justify">
                        The fundamental problem is the <span className="font-semibold text-foreground">systemic fragmentation</span> in conventional precision agriculture (PA). It struggles to integrate heterogeneous geospatial datasets—high-resolution satellite imagery, meteorological data, and localized tabular info. This complexity creates a high technical barrier, preventing non-expert farmers from accessing critical Earth Observation (EO) intelligence.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600">
                        <span className="w-1.5 h-6 bg-green-600 rounded-full"/> The GeoGemma Solution
                    </h3>
                    <p className="text-sm text-muted-foreground leading-7 text-justify">
                        GeoGemma is a software-centric <span className="font-semibold text-foreground">Spatial Foundation Model (SFM)</span> built on a VLM architecture. It transforms dense multi-modal satellite data into actionable guidance for yield optimization and pest detection. By automating GIS workflows via natural language, it empirically reduces task completion time by <span className="font-semibold text-foreground">~74%</span>.
                    </p>
                </section>
            </div>

            {/* Right Column: The Pipeline Visualization */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Working Principle Pipeline
                </h3>
                
                <div className="space-y-8 relative pl-2">
                    {/* Vertical Line */}
                    <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary/50 to-transparent"></div>
                    
                    <div className="relative pl-8 group">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                            <Network className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="font-semibold text-sm">1. Geospatial Location Embedding (GLE)</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Establishes a Spatial Vector Space (SVS) that embeds native spatial awareness directly into the LLM core.
                        </p>
                    </div>

                    <div className="relative pl-8 group">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                            <Database className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="font-semibold text-sm">2. Ingestion Pipeline</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Accesses raw multispectral satellite data (Sentinel-2), calculating indices like NDVI and LAI on-the-fly.
                        </p>
                    </div>

                    <div className="relative pl-8 group">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                            <Cpu className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="font-semibold text-sm">3. VLM Alignment Layer</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Bridges visual features with linguistic context to generate executable GIS analysis scripts from prompts.
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GeoGemmaManifesto;