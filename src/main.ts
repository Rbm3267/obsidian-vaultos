import { Plugin, WorkspaceLeaf } from 'obsidian';
import { VaultOSSettings, DEFAULT_SETTINGS } from './types';
import { AIService } from './ai-service';
import { VaultOSView, VIEW_TYPE_VAULTOS } from './view';
import { VaultOSSettingTab } from './settings';

export default class VaultOSPlugin extends Plugin {
  settings: VaultOSSettings;
  aiService: AIService;

  async onload() {
    await this.loadSettings();
    this.aiService = new AIService(this.settings);

    // Register custom view
    this.registerView(
      VIEW_TYPE_VAULTOS,
      (leaf: WorkspaceLeaf) => new VaultOSView(leaf, this.settings, this.aiService)
    );

    // Ribbon icon
    this.addRibbonIcon('layout-dashboard', 'Open VaultOS Dashboard', () => {
      this.activateView();
    });

    // Command palette
    this.addCommand({
      id: 'open-vaultos-dashboard',
      name: 'Open Dashboard',
      callback: () => {
        this.activateView();
      },
    });

    // Settings tab
    this.addSettingTab(new VaultOSSettingTab(this.app, this));

    // Optional open on startup
    if (this.settings.openOnStartup) {
      this.app.workspace.onLayoutReady(() => {
        this.activateView();
      });
    }
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_VAULTOS);
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_VAULTOS);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_VAULTOS,
        active: true,
      });
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.aiService?.updateSettings(this.settings);
    
    // Refresh open view
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VAULTOS);
    for (const leaf of leaves) {
      if (leaf.view instanceof VaultOSView) {
        leaf.view.updateSettings(this.settings);
      }
    }
  }
}
