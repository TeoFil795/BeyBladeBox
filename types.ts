export interface BeyCombo {
  id: string;
  rank: number;
  points: number;
  blade: string;
  ratchet: string;
  bit: string;
  wins: number;
  description?: string;
  ragContent?: string; // The serialized string for the LLM context
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  relatedCombos?: BeyCombo[];
  timestamp: number;
}

export enum AppState {
  IDLE,
  SEARCHING,
  ANALYZING,
  RESPONDING,
  ERROR
}