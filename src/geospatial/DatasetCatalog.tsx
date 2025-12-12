import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Database, ExternalLink, Satellite, CloudRain, Flame, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dataset } from "./types";

const DatasetCatalog = () => {
    const [query, setQuery] = useState("");

    const datasets: Dataset[] = [
        { id: 1, title: "Sentinel-2 MSI: MultiSpectral", tags: ["Optical", "10m", "ESA"], desc: "Global high-resolution optical imagery for vegetation monitoring.", source: "Copernicus" },
        { id: 2, title: "MOD11A1: Land Surface Temp", tags: ["Thermal", "Daily", "NASA"], desc: "Global daily land surface temperature (LST) and emissivity.", source: "NASA LP DAAC" },
        { id: 3, title: "Landsat 9 Collection 2", tags: ["Optical", "30m", "USGS"], desc: "Longest continuous space-based record of Earth's land in existence.", source: "USGS" },
        { id: 4, title: "CHIRPS Pentad: Precipitation", tags: ["Weather", "Rain", "UCSB"], desc: "30+ year quasi-global rainfall dataset for trend analysis.", source: "CHC/UCSB" },
        { id: 5, title: "FIRMS: Active Fire Data", tags: ["Fire", "Real-time"], desc: "Near real-time active fire data from MODIS and VIIRS.", source: "NASA FIRMS" },
    ];

    const getIcon = (title: string) => {
        if (title.includes("Sentinel") || title.includes("Landsat")) return <Satellite className="w-4 h-4 text-blue-500" />;
        if (title.includes("Precipitation")) return <CloudRain className="w-4 h-4 text-cyan-500" />;
        if (title.includes("Fire")) return <Flame className="w-4 h-4 text-orange-500" />;
        return <Database className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search Earth Engine Catalog..." 
                    className="pl-9 bg-secondary/50 border-secondary focus-visible:ring-primary/20"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            
            <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="space-y-3 pb-4">
                    {datasets.filter(d => d.title.toLowerCase().includes(query.toLowerCase())).map((ds) => (
                        <Card key={ds.id} className="p-4 hover:bg-accent/40 cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-primary group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-center">
                                    {getIcon(ds.title)}
                                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{ds.title}</h4>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent side="left" className="max-w-[200px] text-xs">{ds.desc}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 pl-6">{ds.desc}</p>
                            
                            <div className="flex justify-between items-center pl-6">
                                <div className="flex gap-1.5 flex-wrap">
                                    {ds.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-secondary/50">{tag}</Badge>
                                    ))}
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {datasets.length === 0 && <div className="text-center text-sm text-muted-foreground mt-8">No datasets found.</div>}
                </div>
            </ScrollArea>
        </div>
    );
};

export default DatasetCatalog;