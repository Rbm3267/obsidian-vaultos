import { App, PluginSettingTab, Setting } from 'obsidian';
import type VaultOSPlugin from './main';
import { AIProvider } from './types';

export class VaultOSSettingTab extends PluginSettingTab {
  plugin: VaultOSPlugin;

  constructor(app: App, plugin: VaultOSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'VaultOS Configuration' });

    // ── General Settings ──────────────────────────────────
    new Setting(containerEl)
      .setName('Dashboard Title')
      .setDesc('Title displayed in the executive header.')
      .addText(text =>
        text
          .setPlaceholder('VaultOS')
          .setValue(this.plugin.settings.dashboardTitle)
          .onChange(async val => {
            this.plugin.settings.dashboardTitle = val;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Open on Startup')
      .setDesc('Automatically open the VaultOS Dashboard when Obsidian launches.')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.openOnStartup)
          .onChange(async val => {
            this.plugin.settings.openOnStartup = val;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Workstreams Folder')
      .setDesc('Folder containing your active project or account notes.')
      .addText(text =>
        text
          .setPlaceholder('Projects')
          .setValue(this.plugin.settings.workstreamsFolder)
          .onChange(async val => {
            this.plugin.settings.workstreamsFolder = val;
            await this.plugin.saveSettings();
          })
      );

    // ── AI Engine Provider ────────────────────────────────
    containerEl.createEl('h3', { text: 'AI Engine Settings' });

    new Setting(containerEl)
      .setName('Default AI Provider')
      .setDesc('Select which LLM provider powers the command bar and automated synthesis.')
      .addDropdown(drop =>
        drop
          .addOption('gemini', 'Google Gemini')
          .addOption('claude', 'Anthropic Claude')
          .addOption('openai', 'OpenAI')
          .addOption('ollama', 'Ollama (Local)')
          .setValue(this.plugin.settings.aiProvider)
          .onChange(async (val: AIProvider) => {
            this.plugin.settings.aiProvider = val;
            await this.plugin.saveSettings();
            this.display(); // re-render to update relevant fields
          })
      );

    // ── Gemini ───────────────────────────────────────────
    if (this.plugin.settings.aiProvider === 'gemini') {
      new Setting(containerEl)
        .setName('Gemini API Key')
        .setDesc('Your Google AI Studio API key.')
        .addText(text => {
          text.inputEl.type = 'password';
          text
            .setPlaceholder('AIzaSy...')
            .setValue(this.plugin.settings.geminiApiKey)
            .onChange(async val => {
              this.plugin.settings.geminiApiKey = val;
              await this.plugin.saveSettings();
            });
        });

      new Setting(containerEl)
        .setName('Gemini Model')
        .setDesc('Select Gemini model.')
        .addDropdown(drop =>
          drop
            .addOption('gemini-1.5-flash', 'Gemini 1.5 Flash (Fast & Efficient)')
            .addOption('gemini-1.5-pro', 'Gemini 1.5 Pro (Deep Reasoning)')
            .addOption('gemini-2.0-flash-exp', 'Gemini 2.0 Flash')
            .setValue(this.plugin.settings.geminiModel)
            .onChange(async val => {
              this.plugin.settings.geminiModel = val;
              await this.plugin.saveSettings();
            })
        );
    }

    // ── Claude ───────────────────────────────────────────
    if (this.plugin.settings.aiProvider === 'claude') {
      new Setting(containerEl)
        .setName('Anthropic API Key')
        .setDesc('Your Anthropic console API key.')
        .addText(text => {
          text.inputEl.type = 'password';
          text
            .setPlaceholder('sk-ant-...')
            .setValue(this.plugin.settings.claudeApiKey)
            .onChange(async val => {
              this.plugin.settings.claudeApiKey = val;
              await this.plugin.saveSettings();
            });
        });

      new Setting(containerEl)
        .setName('Claude Model')
        .setDesc('Select Claude model.')
        .addDropdown(drop =>
          drop
            .addOption('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet')
            .addOption('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku')
            .addOption('claude-3-opus-20240229', 'Claude 3 Opus')
            .setValue(this.plugin.settings.claudeModel)
            .onChange(async val => {
              this.plugin.settings.claudeModel = val;
              await this.plugin.saveSettings();
            })
        );
    }

    // ── OpenAI ───────────────────────────────────────────
    if (this.plugin.settings.aiProvider === 'openai') {
      new Setting(containerEl)
        .setName('OpenAI API Key')
        .setDesc('Your OpenAI API key.')
        .addText(text => {
          text.inputEl.type = 'password';
          text
            .setPlaceholder('sk-...')
            .setValue(this.plugin.settings.openaiApiKey)
            .onChange(async val => {
              this.plugin.settings.openaiApiKey = val;
              await this.plugin.saveSettings();
            });
        });

      new Setting(containerEl)
        .setName('OpenAI Model')
        .setDesc('Select OpenAI model.')
        .addDropdown(drop =>
          drop
            .addOption('gpt-4o-mini', 'GPT-4o Mini')
            .addOption('gpt-4o', 'GPT-4o')
            .addOption('o1-mini', 'o1-mini')
            .setValue(this.plugin.settings.openaiModel)
            .onChange(async val => {
              this.plugin.settings.openaiModel = val;
              await this.plugin.saveSettings();
            })
        );
    }

    // ── Ollama ───────────────────────────────────────────
    if (this.plugin.settings.aiProvider === 'ollama') {
      new Setting(containerEl)
        .setName('Ollama Endpoint')
        .setDesc('Base URL for local Ollama server.')
        .addText(text =>
          text
            .setPlaceholder('http://localhost:11434')
            .setValue(this.plugin.settings.ollamaEndpoint)
            .onChange(async val => {
              this.plugin.settings.ollamaEndpoint = val;
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName('Ollama Model')
        .setDesc('Model tag installed in Ollama (e.g. llama3, mistral, qwen2.5).')
        .addText(text =>
          text
            .setPlaceholder('llama3')
            .setValue(this.plugin.settings.ollamaModel)
            .onChange(async val => {
              this.plugin.settings.ollamaModel = val;
              await this.plugin.saveSettings();
            })
        );
    }
  }
}
