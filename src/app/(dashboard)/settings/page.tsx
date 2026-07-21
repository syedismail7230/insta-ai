"use client";

import { Header } from "@/components/layout/header";
import {
  Bot,
  Key,
  Sliders,
  Link2,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Globe,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"provider" | "personality" | "links" | "meta">("provider");
  const [settings, setSettings] = useState<any>({
    agentName: "Zawr AI Assistant",
    systemPrompt: "You are the executive AI Sales Representative for Zawr Industries.",
    tone: "consultative",
    activeProvider: "gemini",
    geminiModel: "gemini-1.5-flash",
    groqModel: "llama-3.3-70b-versatile",
    openaiModel: "gpt-4o-mini",
    openrouterModel: "anthropic/claude-3.5-haiku",
    fallbackMessage: "Thanks for reaching out to Zawr Industries! That's a specialized technical query—let me double-check the exact specifications with our senior solution architect and get right back to you here in DM!",
  });

  const [linksList, setLinksList] = useState<any[]>([]);
  const [newLink, setNewLink] = useState({ title: "", url: "", category: "booking", description: "" });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    loadSettings();
    loadLinks();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }

  async function loadLinks() {
    try {
      const res = await fetch("/api/links");
      if (res.ok) {
        const data = await res.json();
        setLinksList(data);
      }
    } catch (err) {
      console.error("Failed to load links:", err);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });
      if (res.ok) {
        setNewLink({ title: "", url: "", category: "booking", description: "" });
        loadLinks();
      }
    } catch (err) {
      console.error("Failed to add link:", err);
    }
  }

  async function handleDeleteLink(id: string) {
    try {
      const res = await fetch(`/api/links?id=${id}`, { method: "DELETE" });
      if (res.ok) loadLinks();
    } catch (err) {
      console.error("Failed to delete link:", err);
    }
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText("https://ai-social-media-nine.vercel.app/api/webhooks/instagram");
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="System & AI Settings"
        description="Configure AI providers, personality studio, link manager, and Meta Instagram webhooks."
      />

      <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3">
          {[
            { id: "provider", label: "AI Providers & Keys", icon: Bot },
            { id: "personality", label: "Personality & Prompt", icon: Sliders },
            { id: "links", label: "Link Manager", icon: Link2 },
            { id: "meta", label: "Meta Webhook & Credentials", icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
                  isActive
                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: AI Provider System */}
        {activeTab === "provider" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="p-6 rounded-xl bg-[#121215] border border-[#27272a] space-y-5">
              <h3 className="text-sm font-semibold text-white">Select Active AI Provider</h3>
              <p className="text-xs text-zinc-400">
                Choose the underlying LLM engine for processing incoming Instagram DMs. Gemini (Free) is the default.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {[
                  { id: "gemini", name: "Google Gemini", status: "Active (Free Key Configured)", isDefault: true },
                  { id: "groq", name: "Groq Llama 3.3", status: "Ultra-Fast (Key Configured)" },
                  { id: "openai", name: "OpenAI GPT-4o", status: "Extensible" },
                  { id: "openrouter", name: "OpenRouter AI", status: "Extensible Multi-Model" },
                ].map((prov) => {
                  const isSelected = settings.activeProvider === prov.id;
                  return (
                    <div
                      key={prov.id}
                      onClick={() => setSettings({ ...settings, activeProvider: prov.id })}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? "bg-zinc-800/80 border-white text-white shadow-md"
                          : "bg-[#18181c] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs">{prov.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-zinc-400">{prov.status}</div>
                    </div>
                  );
                })}
              </div>

              {/* Model Fine Tuning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-zinc-800">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Gemini Model</label>
                  <input
                    type="text"
                    value={settings.geminiModel}
                    onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Groq Model</label>
                  <input
                    type="text"
                    value={settings.groqModel}
                    onChange={(e) => setSettings({ ...settings, groqModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : savedSuccess ? "Settings Saved!" : "Save Provider Settings"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Personality & Prompt Studio */}
        {activeTab === "personality" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="p-6 rounded-xl bg-[#121215] border border-[#27272a] space-y-5">
              <h3 className="text-sm font-semibold text-white">AI Agent Personality Studio</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Agent Representative Name</label>
                  <input
                    type="text"
                    value={settings.agentName}
                    onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Tone of Voice</label>
                  <select
                    value={settings.tone}
                    onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none"
                  >
                    <option value="consultative">Consultative & Executive (Recommended)</option>
                    <option value="persuasive">Persuasive Sales</option>
                    <option value="professional">Strict Professional</option>
                    <option value="friendly">Friendly & Casual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 text-xs">
                  Core System Prompt (RAG & Qualification Rules)
                </label>
                <textarea
                  rows={7}
                  value={settings.systemPrompt}
                  onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#18181c] border border-zinc-800 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 text-xs">
                  Fallback DM Response (For Unknown / Off-KB Queries)
                </label>
                <input
                  type="text"
                  value={settings.fallbackMessage}
                  onChange={(e) => setSettings({ ...settings, fallbackMessage: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#18181c] border border-zinc-800 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : savedSuccess ? "Settings Saved!" : "Save Personality Settings"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Link Manager */}
        {activeTab === "links" && (
          <div className="space-y-6">
            <form onSubmit={handleAddLink} className="p-6 rounded-xl bg-[#121215] border border-[#27272a] space-y-4">
              <h3 className="text-sm font-semibold text-white">Add Verified Link for AI Responses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Link Title (e.g. Discovery Call)"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="Target URL (https://...)"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none"
                />
                <select
                  value={newLink.category}
                  onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none"
                >
                  <option value="booking">Booking / Call</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="pricing">Pricing</option>
                  <option value="case_study">Case Study</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Link</span>
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Links ({linksList.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linksList.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {link.title}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                          {link.category}
                        </span>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-white mt-1 block truncate max-w-xs font-mono text-[11px]"
                      >
                        {link.url}
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Meta Webhook Credentials */}
        {activeTab === "meta" && (
          <div className="p-6 rounded-xl bg-[#121215] border border-[#27272a] space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-semibold text-white">Meta Instagram Webhook Configuration</h3>
              <p className="text-zinc-400 mt-1">
                Configure your Meta Developer App with the verified Callback URL and Verify Token.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">Webhook Callback URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value="https://ai-social-media-nine.vercel.app/api/webhooks/instagram"
                    className="flex-1 px-3 py-2.5 rounded-lg bg-[#18181c] border border-zinc-800 font-mono text-zinc-300 focus:outline-none"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="px-3 py-2.5 rounded-lg bg-zinc-800 text-white font-semibold flex items-center gap-1 hover:bg-zinc-700 transition"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWebhook ? "Copied!" : "Copy URL"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Meta Verify Token</label>
                <input
                  type="text"
                  readOnly
                  value="zawr_verify_token_2026"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#18181c] border border-zinc-800 font-mono text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Meta Access Credentials Status
                </div>
                <div className="text-zinc-400 space-y-1 text-[11px]">
                  <div>• Instagram Page Access Token: Configured in environment</div>
                  <div>• Meta App Secret: Signature Verification Active</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
