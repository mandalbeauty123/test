import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, X, Maximize2, Minimize2, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "./types";

const EarthAgentChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'agent', 
      text: 'Geospatial Location Embedding (GLE) Initialized. \n\nI am GeoGemma. I can transform multi-modal satellite data into actionable guidance. \n\nTry asking: "Analyze vegetation health (NDVI) for my field in Bihar."',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const userQuery = input;
    setInput("");
    setIsTyping(true);
    
    // Simulate GeoGemma Processing Pipeline steps
    setTimeout(() => {
        setIsTyping(false);
        const responseText = `Analysis Complete for "${userQuery}".\n\n1. GLE: Coordinates locked.\n2. Ingestion: Retrieved Sentinel-2 MSI data.\n3. VLM: Detected 15% drop in chlorophyll content (NDVI < 0.3) in the northern sector compared to historical average.\n\nI have generated a GIS analysis layer on the map.`;
        
        setMessages(prev => [...prev, { 
            role: 'agent', 
            text: responseText,
            timestamp: new Date()
        }]);
    }, 2500);
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)} 
        className="rounded-full h-14 w-14 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 hover:scale-105"
      >
        <Sparkles className="h-7 w-7 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`flex flex-col shadow-2xl border-primary/20 transition-all duration-300 bg-background/95 backdrop-blur-md ${isMinimized ? 'w-72 h-14' : 'w-[24rem] h-[34rem]'}`}>
      
      {/* Header */}
      <CardHeader className="p-3 border-b flex flex-row justify-between items-center bg-primary/5 cursor-pointer" onClick={() => !isMinimized && setIsMinimized(true)}>
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                {!isMinimized && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>}
            </div>
            <div>
                <span className="font-bold text-sm block">GeoGemma AI</span>
                {!isMinimized && <span className="text-[10px] text-muted-foreground block">VLM Core Active</span>}
            </div>
        </div>
        <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                <X className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <>
            {/* Messages Area */}
            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role === 'agent' && (
                                    <Avatar className="h-8 w-8 mt-1 border">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px]"><Bot className="w-4 h-4"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`
                                    max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed
                                    ${m.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                                        : 'bg-muted/80 text-foreground border rounded-tl-sm whitespace-pre-wrap'}
                                `}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3 justify-start">
                                <Avatar className="h-8 w-8 mt-1 border">
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px]"><Bot className="w-4 h-4"/></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted/80 border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <CardFooter className="p-3 pt-0 border-t bg-background mt-auto">
                <div className="flex w-full gap-2 mt-3">
                    <Input 
                        placeholder="Ask about Earth data..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="focus-visible:ring-indigo-500 h-10 bg-secondary/50"
                    />
                    <Button size="icon" onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </>
      )}
    </Card>
  );
};

export default EarthAgentChat;