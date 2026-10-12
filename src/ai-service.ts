import { requestUrl } from 'obsidian';
import { VaultOSSettings } from './types';

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content?: ClaudeContentBlock[];
}

interface OpenAIChoice {
  message?: {
    content?: string;
  };
}

interface OpenAIResponse {
  choices?: OpenAIChoice[];
}

interface OllamaResponse {
  response?: string;
}

export class AIService {
  private settings: VaultOSSettings;

  constructor(settings: VaultOSSettings) {
    this.settings = settings;
  }

  updateSettings(settings: VaultOSSettings) {
    this.settings = settings;
  }

  async askAI(prompt: string): Promise<string> {
    switch (this.settings.aiProvider) {
      case 'gemini':
        return this.queryGemini(prompt);
      case 'claude':
        return this.queryClaude(prompt);
      case 'openai':
        return this.queryOpenAI(prompt);
      case 'ollama':
        return this.queryOllama(prompt);
      default:
        return this.queryGemini(prompt);
    }
  }

  private async queryGemini(prompt: string): Promise<string> {
    const apiKey = this.settings.geminiApiKey.trim();
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please add your key in VaultOS settings.');
    }

    const model = this.settings.geminiModel || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await requestUrl({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Gemini API Error (${res.status}): ${res.text}`);
    }

    const data = res.json as GeminiResponse;
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini API.');
    }
    return text.trim();
  }

  private async queryClaude(prompt: string): Promise<string> {
    const apiKey = this.settings.claudeApiKey.trim();
    if (!apiKey) {
      throw new Error('Claude API key is not configured. Please add your key in VaultOS settings.');
    }

    const model = this.settings.claudeModel || 'claude-3-5-sonnet-20241022';
    const res = await requestUrl({
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Claude API Error (${res.status}): ${res.text}`);
    }

    const data = res.json as ClaudeResponse;
    const textPart = data.content?.find(p => p.type === 'text');
    return textPart?.text ? textPart.text.trim() : 'No response from Claude.';
  }

  private async queryOpenAI(prompt: string): Promise<string> {
    const apiKey = this.settings.openaiApiKey.trim();
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please add your key in VaultOS settings.');
    }

    const model = this.settings.openaiModel || 'gpt-4o-mini';
    const res = await requestUrl({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (res.status !== 200) {
      throw new Error(`OpenAI API Error (${res.status}): ${res.text}`);
    }

    const data = res.json as OpenAIResponse;
    return data.choices?.[0]?.message?.content?.trim() || 'No response from OpenAI.';
  }

  private async queryOllama(prompt: string): Promise<string> {
    const endpoint = (this.settings.ollamaEndpoint || 'http://localhost:11434').replace(/\/+$/, '');
    const model = this.settings.ollamaModel || 'llama3';

    const res = await requestUrl({
      url: `${endpoint}/api/generate`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Ollama Error (${res.status}): ${res.text}`);
    }

    const data = res.json as OllamaResponse;
    return data.response?.trim() || 'No response from Ollama.';
  }
}
