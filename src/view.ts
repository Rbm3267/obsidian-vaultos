import { ItemView, WorkspaceLeaf, TFile, setIcon } from 'obsidian';
import { VaultOSSettings, TaskItem, WorkstreamItem } from './types';
import { AIService } from './ai-service';
import { getMarkdownFilesUnderFolder, countMarkdownNotes } from './vault-utils';

export const VIEW_TYPE_VAULTOS = 'vaultos-dashboard';

export class VaultOSView extends ItemView {
  private aiService: AIService;
  private settings: VaultOSSettings;

  constructor(leaf: WorkspaceLeaf, settings: VaultOSSettings, aiService: AIService) {
    super(leaf);
    this.settings = settings;
    this.aiService = aiService;
  }

  getViewType(): string {
    return VIEW_TYPE_VAULTOS;
  }

  getDisplayText(): string {
    return this.settings.dashboardTitle || 'VaultOS';
  }

  getIcon(): string {
    return 'layout-dashboard';
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  updateSettings(settings: VaultOSSettings) {
    this.settings = settings;
    this.aiService.updateSettings(settings);
    void this.render();
  }

  async render(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('vaultos-dashboard');

    const [notesCount, tasks, workstreams] = await Promise.all([
      this.getNotesCount(),
      this.getOpenTasks(),
      this.getWorkstreams(),
    ]);

    // ── Header ──────────────────────────────────────────
    const header = container.createDiv({ cls: 'vaultos-header' });
    const titleGroup = header.createDiv({ cls: 'vaultos-title-group' });
    titleGroup.createEl('h1', { text: this.settings.dashboardTitle || 'VaultOS' });
    
    const now = new Date();
    const dateFormatted = now.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    titleGroup.createSpan({ cls: 'vaultos-subtitle', text: dateFormatted });

    const headerRight = header.createDiv({ cls: 'vaultos-header-right' });
    const aiBadge = headerRight.createDiv({ cls: 'vaultos-badge vaultos-badge-accent' });
    const badgeIcon = aiBadge.createSpan({ cls: 'vaultos-icon-wrap' });
    setIcon(badgeIcon, 'sparkles');
    aiBadge.createSpan({ text: this.getProviderLabel() });

    // ── AI Command Bar ───────────────────────────────────
    const aiSection = container.createDiv({ cls: 'vaultos-card vaultos-ai-bar' });
    const aiRow = aiSection.createDiv({ cls: 'vaultos-ai-input-row' });
    const promptInput = aiRow.createEl('input', {
      type: 'text',
      cls: 'vaultos-ai-input',
      placeholder: `Ask ${this.getProviderLabel()} anything or prompt vault synthesis...`,
    });
    const sendBtn = aiRow.createEl('button', { cls: 'vaultos-btn vaultos-btn-primary' });
    const sendBtnIcon = sendBtn.createSpan({ cls: 'vaultos-icon-wrap' });
    setIcon(sendBtnIcon, 'send');
    const sendBtnLabel = sendBtn.createSpan({ text: 'Send' });

    const aiResponseContainer = aiSection.createDiv({ cls: 'vaultos-ai-response' });
    aiResponseContainer.hide();

    const runAI = async () => {
      const prompt = promptInput.value.trim();
      if (!prompt) return;

      sendBtn.disabled = true;
      setIcon(sendBtnIcon, 'loader-2');
      sendBtnLabel.setText('Thinking...');
      aiResponseContainer.show();
      aiResponseContainer.empty();
      aiResponseContainer.createDiv({ cls: 'vaultos-ai-loading', text: 'Generating response...' });

      try {
        const result = await this.aiService.askAI(prompt);
        aiResponseContainer.empty();
        
        const respText = aiResponseContainer.createDiv({ cls: 'vaultos-ai-text' });
        respText.setText(result);

        const actionsRow = aiResponseContainer.createDiv({ cls: 'vaultos-ai-actions' });
        const copyBtn = actionsRow.createEl('button', { cls: 'vaultos-btn-sm', text: 'Copy' });
        copyBtn.addEventListener('click', () => {
          void navigator.clipboard.writeText(result).then(() => {
            copyBtn.setText('Copied!');
            window.setTimeout(() => copyBtn.setText('Copy'), 1500);
          });
        });

        const insertBtn = actionsRow.createEl('button', { cls: 'vaultos-btn-sm', text: 'Insert into active note' });
        insertBtn.addEventListener('click', () => {
          void (async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
              await this.app.vault.append(activeFile, `\n\n${result}`);
              insertBtn.setText('Inserted!');
              window.setTimeout(() => insertBtn.setText('Insert into active note'), 1500);
            } else {
              insertBtn.setText('No active note');
              window.setTimeout(() => insertBtn.setText('Insert into active note'), 1500);
            }
          })();
        });
      } catch (err: unknown) {
        aiResponseContainer.empty();
        const errorEl = aiResponseContainer.createDiv({ cls: 'vaultos-ai-error' });
        errorEl.setText(err instanceof Error ? err.message : String(err));
      } finally {
        sendBtn.disabled = false;
        setIcon(sendBtnIcon, 'send');
        sendBtnLabel.setText('Send');
      }
    };

    sendBtn.addEventListener('click', () => {
      void runAI();
    });
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        void runAI();
      }
    });

    // ── Metrics Grid ─────────────────────────────────────
    const metricsRow = container.createDiv({ cls: 'vaultos-metrics-grid' });
    
    this.createMetricCard(metricsRow, 'Total Notes', String(notesCount), 'file-text');
    this.createMetricCard(metricsRow, 'Workstreams', String(workstreams.length), 'folder');
    this.createMetricCard(metricsRow, 'Open Tasks', String(tasks.length), 'check-circle');
    this.createMetricCard(metricsRow, 'Model Engine', this.getProviderLabel(), 'sparkles');

    // ── Bento Main Content ───────────────────────────────
    const bentoGrid = container.createDiv({ cls: 'vaultos-bento-grid' });

    // Left Column: Workstreams
    const leftCard = bentoGrid.createDiv({ cls: 'vaultos-card' });
    const leftHead = leftCard.createDiv({ cls: 'vaultos-card-header' });
    leftHead.createEl('h2', { text: 'Active Workstreams' });
    leftHead.createSpan({ cls: 'vaultos-badge', text: `${workstreams.length} in-flight` });

    const workstreamList = leftCard.createDiv({ cls: 'vaultos-list' });
    if (workstreams.length === 0) {
      workstreamList.createDiv({ cls: 'vaultos-empty-state', text: 'No active workstreams found.' });
    } else {
      for (const item of workstreams.slice(0, 8)) {
        const row = workstreamList.createDiv({ cls: 'vaultos-list-row' });
        row.createDiv({ cls: 'vaultos-item-title', text: item.title });
        row.createDiv({ cls: 'vaultos-item-meta', text: item.status });
        row.addEventListener('click', () => {
          void this.app.workspace.openLinkText(item.path, '', false);
        });
      }
    }

    // Middle Column: Action Items
    const midCard = bentoGrid.createDiv({ cls: 'vaultos-card' });
    const midHead = midCard.createDiv({ cls: 'vaultos-card-header' });
    midHead.createEl('h2', { text: 'Action Items' });
    midHead.createSpan({ cls: 'vaultos-badge', text: `${tasks.length} pending` });

    const taskList = midCard.createDiv({ cls: 'vaultos-list' });
    if (tasks.length === 0) {
      taskList.createDiv({ cls: 'vaultos-empty-state', text: 'Zero pending action items. All caught up!' });
    } else {
      for (const t of tasks.slice(0, 8)) {
        const row = taskList.createDiv({ cls: 'vaultos-list-row vaultos-task-row' });
        const checkBtn = row.createEl('button', { cls: 'vaultos-check-btn' });
        setIcon(checkBtn, 'circle');
        
        row.createSpan({ cls: 'vaultos-task-text', text: t.text });
        
        checkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          void (async () => {
            await this.completeTask(t);
            row.addClass('vaultos-task-completed');
            window.setTimeout(() => {
              void this.render();
            }, 600);
          })();
        });

        row.addEventListener('click', () => {
          void this.app.workspace.openLinkText(t.path, '', false);
        });
      }
    }

    // Right Column: Quick Launch Navigation
    const rightCard = bentoGrid.createDiv({ cls: 'vaultos-card' });
    const rightHead = rightCard.createDiv({ cls: 'vaultos-card-header' });
    rightHead.createEl('h2', { text: 'Quick Launch' });

    const pinnedList = rightCard.createDiv({ cls: 'vaultos-pinned-grid' });
    for (const link of this.settings.pinnedLinks) {
      const tile = pinnedList.createDiv({ cls: 'vaultos-pinned-tile' });
      tile.createDiv({ cls: 'vaultos-pinned-title', text: link.title });
      tile.createDiv({ cls: 'vaultos-pinned-cat', text: link.category });
      tile.addEventListener('click', () => {
        void this.app.workspace.openLinkText(link.path, '', false);
      });
    }
  }

  private createMetricCard(container: HTMLElement, label: string, value: string, iconId: string) {
    const card = container.createDiv({ cls: 'vaultos-card vaultos-metric-card' });
    const top = card.createDiv({ cls: 'vaultos-metric-top' });
    top.createSpan({ cls: 'vaultos-metric-label', text: label });
    const iconEl = top.createDiv({ cls: 'vaultos-metric-icon' });
    setIcon(iconEl, iconId);
    card.createDiv({ cls: 'vaultos-metric-val', text: value });
  }

  private getProviderLabel(): string {
    switch (this.settings.aiProvider) {
      case 'gemini': return `Gemini (${this.settings.geminiModel || 'Flash'})`;
      case 'claude': return `Claude (${this.settings.claudeModel || 'Sonnet'})`;
      case 'openai': return `OpenAI (${this.settings.openaiModel || 'GPT-4o'})`;
      case 'ollama': return `Ollama (${this.settings.ollamaModel || 'Local'})`;
      default: return 'AI Engine';
    }
  }

  private async getNotesCount(): Promise<number> {
    return countMarkdownNotes(this.app.vault);
  }

  private async getOpenTasks(): Promise<TaskItem[]> {
    const targetFolders = [
      this.settings.workstreamsFolder || 'Projects',
      'Accounts',
      'Daily',
      '00_Inbox',
    ];
    const candidateFiles: TFile[] = [];
    for (const f of targetFolders) {
      candidateFiles.push(...getMarkdownFilesUnderFolder(this.app.vault, f));
    }

    const tasks: TaskItem[] = [];

    for (const file of candidateFiles) {
      if (file.path.startsWith('.') || file.path.includes('archive/')) continue;
      const content = await this.app.vault.cachedRead(file);
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^(\s*)[-*+]\s+\[\s\]\s+(.+)$/)) {
          const text = line.replace(/^(\s*)[-*+]\s+\[\s\]\s+/, '').trim();
          tasks.push({
            text,
            path: file.path,
            completed: false,
            line: i,
          });
          if (tasks.length >= 25) return tasks;
        }
      }
    }
    return tasks;
  }

  private async completeTask(task: TaskItem): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(task.path);
    if (file instanceof TFile) {
      const content = await this.app.vault.read(file);
      const lines = content.split('\n');
      if (lines[task.line] && lines[task.line].includes('- [ ]')) {
        lines[task.line] = lines[task.line].replace('- [ ]', '- [x]');
        await this.app.vault.modify(file, lines.join('\n'));
      }
    }
  }

  private async getWorkstreams(): Promise<WorkstreamItem[]> {
    const folder = this.settings.workstreamsFolder || 'Projects';
    const projectFiles = getMarkdownFilesUnderFolder(this.app.vault, folder);
    const accountFiles = getMarkdownFilesUnderFolder(this.app.vault, 'Accounts');
    const files = [...projectFiles, ...accountFiles];
    
    return files.slice(0, 10).map(f => {
      return {
        title: f.basename,
        path: f.path,
        status: 'Active',
        updated: new Date(f.stat.mtime).toLocaleDateString(),
      };
    });
  }
}
