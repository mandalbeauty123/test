import { LucideIcon } from "lucide-react";

export interface Dataset {
  id: number;
  title: string;
  tags: string[];
  desc: string;
  source: string;
}

export interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export interface AnalysisModule {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  actions: string[];
}