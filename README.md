# VaultOS

> Executive workspace operating system, customizable bento dashboard, telemetry, and non-blocking multi-model AI assistant for Obsidian.

[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-7C3AED?logo=obsidian&logoColor=white)](https://obsidian.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

VaultOS turns your Obsidian vault into an executive command center. Built with modern Bento design principles, seamless Light/Dark theme compatibility, and plug-and-play AI support for Google Gemini, Anthropic Claude, OpenAI, and local Ollama models.

---

## ✨ Features

- **Executive Bento Dashboard**: Instant visibility into total notes, active workstreams, open action items, and knowledge growth.
- **Plug-and-Play Multi-LLM Engine**:
  - **Google Gemini** (Gemini 1.5 Flash, 1.5 Pro, 2.0)
  - **Anthropic Claude** (Claude 3.5 Sonnet, Haiku, Opus)
  - **OpenAI** (GPT-4o, GPT-4o-mini, o1-mini)
  - **Ollama** (Local air-gapped inference: Llama 3, Mistral, Qwen)
- **Universal Theme Harmony**: Fully adaptive to Obsidian's CSS variable system — zero CSS bleeding, zero theme overrides, perfect in both Light and Dark mode.
- **Interactive Action Items**: Check off tasks directly from the dashboard and immediately update your underlying markdown notes.
- **Quick Launch Workspace**: Fast-travel to daily notes, project directories, and key reference hubs.

---

## 🚀 Installation

### From Obsidian Community Plugins (Recommended)
1. In Obsidian, open **Settings** → **Community plugins**.
2. Ensure **Restricted mode** is turned off.
3. Click **Browse** and search for **VaultOS**.
4. Click **Install**, then click **Enable**.

### Beta Testing via BRAT
To receive early pre-release builds before directory updates:
1. Install and enable the **BRAT** community plugin in Obsidian.
2. Open BRAT settings and click **Add Beta plugin**.
3. Enter `Rbm3267/obsidian-vaultos`.
4. Enable **VaultOS** under Community Plugins.

### Manual Installation
1. Download `manifest.json`, `main.js`, and `styles.css` from the latest [Release](https://github.com/Rbm3267/obsidian-vaultos/releases).
2. Create a folder named `vaultos` inside your vault's `.obsidian/plugins/` directory.
3. Copy the downloaded files into `.obsidian/plugins/vaultos/`.
4. Reload Obsidian and enable **VaultOS** in Settings > Community Plugins.

---

## ⚙️ Configuration

Open **Settings > VaultOS**:
- Choose your **Default AI Provider** (Gemini, Claude, OpenAI, or Ollama).
- Enter your API Key or local endpoint.
- Customize your Workstreams folder and startup behavior.

---

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/Rbm3267/obsidian-vaultos.git
cd obsidian-vaultos

# Install dependencies
npm install

# Start development build with hot reload
npm run dev

# Production build
npm run build
```

---

## 📄 License

MIT License © 2026 [XD Labs](https://xdlabs.io) / Bennett Moore.
