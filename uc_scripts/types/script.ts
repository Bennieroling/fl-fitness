export interface InputConfig {
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  default?: string;
}

export interface Script {
  id: number;
  name: string;
  file: string;
  description: string;
  category: string;
  inputs?: InputConfig[];
}

export interface ScriptCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  scriptCount: number;
}

export interface LogEntry {
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  files?: any[];
  output?: string;
}

export interface UserPreferences {
  favorites: number[];
  recentSearches: string[];
}