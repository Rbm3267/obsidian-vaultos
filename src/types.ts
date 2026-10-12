export type AIProvider = 'gemini' | 'claude' | 'openai' | 'ollama';

export interface VaultOSSettings {
  aiProvider: AIProvider;
  geminiApiKey: string;
  geminiModel: string;
  claudeApiKey: string;
  claudeModel: string;
  claudeCliPath: string;
  claudeUseCli: boolean;
  openaiApiKey: string;
  openaiModel: string;
  ollamaEndpoint: string;
  ollamaModel: string;
  openOnStartup: boolean;
  dashboardTitle: string;
  workstreamsFolder: string;
  tasksFolder: string;
  pinnedLinks: { title: string; path: string; category: string }[];
}

export const DEFAULT_SETTINGS: VaultOSSettings = {
  aiProvider: 'gemini',
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  claudeApiKey: '',
  claudeModel: 'claude-3-5-sonnet-20241022',
  claudeCliPath: 'claude',
  claudeUseCli: false,
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3',
  openOnStartup: false,
  dashboardTitle: 'VaultOS',
  workstreamsFolder: 'Projects',
  tasksFolder: '',
  pinnedLinks: [
    { title: 'Daily Notes', path: 'Daily Notes', category: 'Core' },
    { title: 'Knowledge Base', path: 'wiki', category: 'Reference' },
    { title: 'Projects', path: 'Projects', category: 'Work' },
  ],
};

export interface TaskItem {
  text: string;
  path: string;
  completed: boolean;
  line: number;
}

export interface WorkstreamItem {
  title: string;
  path: string;
  status: string;
  updated: string;
}
