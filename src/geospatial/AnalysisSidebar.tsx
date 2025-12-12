import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Flame, Droplets, Thermometer, TreePine, Sprout, TrendingUp, Bug, Activity } from "lucide-react";
import DatasetCatalog from "./DatasetCatalog";
import GeoGemmaManifesto from "./GeoGemmaManifesto";

const AnalysisSidebar = () => {
  return (
    <Card className="h-full border-none shadow-none rounded-none bg-transparent flex flex-col">
        {/* Header Section */}
        <div className="p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 text-primary mb-1">
                <Globe className="w-5 h-5" />
                <h2 className="font-bold text-lg tracking-tight">GeoGemma</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3 font-medium">Planetary-Scale Analysis Platform</p>
            <GeoGemmaManifesto />
        </div>

      <Tabs defaultValue="modules" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modules">Analysis</TabsTrigger>
                <TabsTrigger value="data">Catalog</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="modules" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full px-4 py-2">
            <Accordion type="single" collapsible className="w-full space-y-3 pb-6">
              
              {/* --- NEW: Farm Advisory Module --- */}
              <AccordionItem value="advisory" className="border rounded-xl px-3 bg-card/40 shadow-sm data-[state=open]:border-primary/50 transition-all">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Sprout className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Farm Advisory</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">Geospatial crop suitability and sowing windows.</p>
                  <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8">Crop Suitability</Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">Sowing Map</Button>
                      <Button variant="default" size="sm" className="col-span-2 h-8 text-xs">Generate Advisory</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* --- NEW: Market Linkage Module --- */}
              <AccordionItem value="market" className="border rounded-xl px-3 bg-card/40 shadow-sm data-[state=open]:border-indigo-500/50 transition-all">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Market Linkage</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">Analyze market proximity and price heatmaps.</p>
                  <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8">Price Heatmap</Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">Mandi Catchment</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* --- NEW: Crop Diagnosis Module --- */}
              <AccordionItem value="diagnosis" className="border rounded-xl px-3 bg-card/40 shadow-sm data-[state=open]:border-rose-500/50 transition-all">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg text-rose-600 dark:text-rose-400">
                        <Bug className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Crop Diagnosis</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">Pest risk modeling and disease hotspot detection.</p>
                  <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8">Pest Risk Layer</Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">Disease Hotspots</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Existing Modules */}
              <AccordionItem value="vegetation" className="border rounded-xl px-3 bg-card/40 shadow-sm data-[state=open]:border-green-500/50 transition-all">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                        <TreePine className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Vegetation Health</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">Analyze crop health using remote sensing indices.</p>
                  <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8">NDVI Analysis</Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">EVI Index</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="water" className="border rounded-xl px-3 bg-card/40 shadow-sm data-[state=open]:border-blue-500/50 transition-all">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                        <Droplets className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Water Resources</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">Surface water mapping and flood risk detection.</p>
                  <Button variant="default" size="sm" className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700">Run Flood Mapping</Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fire" className="border rounded-xl px-3 bg-card/40 shadow-sm data-[state=open]:border-orange-500/50 transition-all">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                        <Flame className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Active Fire</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">Real-time FIRMS data & Burn Area Index.</p>
                  <Button variant="destructive" size="sm" className="w-full h-8 text-xs">Load Fire Hotspots</Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="temp" className="border rounded-xl px-3 bg-card/40 shadow-sm data-[state=open]:border-red-500/50 transition-all">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                        <Thermometer className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-3">
                    <p className="text-xs text-muted-foreground mb-3">Land Surface Temperature (LST) monitoring.</p>
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs">View Thermal Map</Button>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="data" className="flex-1 overflow-hidden mt-0 p-4 pt-2">
          <DatasetCatalog />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AnalysisSidebar;