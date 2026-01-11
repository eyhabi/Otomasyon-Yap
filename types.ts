export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum ModelType {
  GEMINI_PRO = 'gemini-3-pro-preview',
}

export interface AppSettings {
  allowPaidTools: boolean;
  outputFormat: 'json' | 'node';
}
