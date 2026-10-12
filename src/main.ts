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
      void this.activateView();
    });

    // Command palette (ID should not duplicate plugin name)
    this.addCommand({
      id: 'open-dashboard',
      name: 'Open Dashboard',
      callback: () => {
        void this.activateView();
      },
    });

    // Settings tab
    this.addSettingTab(new VaultOSSettingTab(this.app, this));

    // Optional open on startup
    if (this.settings.openOnStartup) {
      this.app.workspace.onLayoutReady(() => {
        void this.activateView();
      });
    }
  }

  onunload() {
    // Leave leaves in place to preserve layout location when reloaded
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
      workspace.setActiveLeaf(leaf, { focus: true });
    }
  }

  async loadSettings() {
    const loaded = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (loaded && typeof loaded === 'object') ? loaded : {});
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.aiService?.updateSettings(this.settings);
    
    // Refresh open views
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VAULTOS);
    for (const leaf of leaves) {
      if (leaf.view instanceof VaultOSView) {
        leaf.view.updateSettings(this.settings);
      }
    }
  }
}
