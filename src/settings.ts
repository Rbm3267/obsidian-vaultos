import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import type VaultOSPlugin from './main';

export class VaultOSSettingTab extends PluginSettingTab {
  plugin: VaultOSPlugin;

  constructor(app: App, plugin: VaultOSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      // ── Dashboard options ─────────────────────────────────
      {
        type: 'group',
        heading: 'Dashboard options',
        items: [
          {
            name: 'Dashboard title',
            desc: 'Title displayed in the dashboard header.',
            control: {
              type: 'text',
              key: 'dashboardTitle',
              placeholder: 'VaultOS',
            },
          },
          {
            name: 'Open on startup',
            desc: 'Automatically open the VaultOS Dashboard when Obsidian launches.',
            control: {
              type: 'toggle',
              key: 'openOnStartup',
            },
          },
          {
            name: 'Workstreams folder',
            desc: 'Folder containing your active project or account notes.',
            control: {
              type: 'folder',
              key: 'workstreamsFolder',
              placeholder: 'Projects',
            },
          },
        ],
      },

      // ── AI engine ────────────────────────────────────────
      {
        type: 'group',
        heading: 'AI engine',
        items: [
          {
            name: 'Default AI provider',
            desc: 'Select which LLM provider powers the command bar and automated synthesis.',
            control: {
              type: 'dropdown',
              key: 'aiProvider',
              options: {
                gemini: 'Google Gemini',
                claude: 'Anthropic Claude',
                openai: 'OpenAI',
                ollama: 'Ollama (Local)',
              },
            },
          },

          // ── Gemini ───────────────────────────────────────
          {
            name: 'Gemini API key',
            desc: 'Your Google AI Studio API key.',
            visible: () => this.plugin.settings.aiProvider === 'gemini',
            control: {
              type: 'text',
              key: 'geminiApiKey',
              placeholder: 'AIzaSy...',
            },
          },
          {
            name: 'Gemini model',
            desc: 'Select Gemini model.',
            visible: () => this.plugin.settings.aiProvider === 'gemini',
            control: {
              type: 'dropdown',
              key: 'geminiModel',
              options: {
                'gemini-1.5-flash': 'Gemini 1.5 Flash (Fast & Efficient)',
                'gemini-1.5-pro': 'Gemini 1.5 Pro (Deep Reasoning)',
                'gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
              },
            },
          },

          // ── Claude ───────────────────────────────────────
          {
            name: 'Anthropic API key',
            desc: 'Your Anthropic console API key.',
            visible: () => this.plugin.settings.aiProvider === 'claude',
            control: {
              type: 'text',
              key: 'claudeApiKey',
              placeholder: 'sk-ant-...',
            },
          },
          {
            name: 'Claude model',
            desc: 'Select Claude model.',
            visible: () => this.plugin.settings.aiProvider === 'claude',
            control: {
              type: 'dropdown',
              key: 'claudeModel',
              options: {
                'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
                'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
                'claude-3-opus-20240229': 'Claude 3 Opus',
              },
            },
          },

          // ── OpenAI ───────────────────────────────────────
          {
            name: 'OpenAI API key',
            desc: 'Your OpenAI API key.',
            visible: () => this.plugin.settings.aiProvider === 'openai',
            control: {
              type: 'text',
              key: 'openaiApiKey',
              placeholder: 'sk-...',
            },
          },
          {
            name: 'OpenAI model',
            desc: 'Select OpenAI model.',
            visible: () => this.plugin.settings.aiProvider === 'openai',
            control: {
              type: 'dropdown',
              key: 'openaiModel',
              options: {
                'gpt-4o-mini': 'GPT-4o Mini',
                'gpt-4o': 'GPT-4o',
                'o1-mini': 'o1-mini',
              },
            },
          },

          // ── Ollama ───────────────────────────────────────
          {
            name: 'Ollama endpoint',
            desc: 'Base URL for local Ollama server.',
            visible: () => this.plugin.settings.aiProvider === 'ollama',
            control: {
              type: 'text',
              key: 'ollamaEndpoint',
              placeholder: 'http://localhost:11434',
            },
          },
          {
            name: 'Ollama model',
            desc: 'Model tag installed in Ollama (e.g. llama3, mistral, qwen2.5).',
            visible: () => this.plugin.settings.aiProvider === 'ollama',
            control: {
              type: 'text',
              key: 'ollamaModel',
              placeholder: 'llama3',
            },
          },
        ],
      },
    ];
  }
}
