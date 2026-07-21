"use client";

import { Header } from "@/components/layout/header";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit,
  Sparkles,
  Bot,
  CheckCircle2,
  HelpCircle,
  Tag,
  X,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    question: "",
    answer: "",
    category: "general",
    tags: "",
  });

  // Simulator State
  const [testPrompt, setTestPrompt] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const res = await fetch("/api/knowledge-base");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to load KB:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal(item?: any) {
    if (item) {
      setEditItem(item);
      setFormData({
        title: item.title,
        question: item.question,
        answer: item.answer,
        category: item.category,
        tags: item.tags || "",
      });
    } else {
      setEditItem(null);
      setFormData({ title: "", question: "", answer: "", category: "general", tags: "" });
    }
    setIsModalOpen(true);
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editItem ? editItem.id : undefined,
          ...formData,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadItems();
      }
    } catch (err) {
      console.error("Failed to save item:", err);
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Are you sure you want to delete this Knowledge Base entry?")) return;
    try {
      const res = await fetch(`/api/knowledge-base?id=${id}`, { method: "DELETE" });
      if (res.ok) loadItems();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const categories = [
    { id: "all", label: "All Items" },
    { id: "company", label: "Company" },
    { id: "services", label: "Services" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
    { id: "objections", label: "Objections" },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Knowledge Base & Truth Source"
        description="Manage verified facts, services, pricing, and answers used by the AI Instagram Sales Agent."
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Knowledge Base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#121215] border border-[#27272a] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Knowledge Item</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-zinc-800 text-white font-semibold border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Knowledge Base Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#121215] border border-[#27272a] hover:border-zinc-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-300 uppercase border border-zinc-700">
                    {item.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1 text-zinc-400 hover:text-white transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-zinc-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <div className="mt-2 text-xs font-medium text-zinc-300">
                  <span className="text-zinc-500">Q: </span> {item.question}
                </div>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed bg-[#18181c] p-3 rounded-lg border border-zinc-800/80">
                  <span className="text-zinc-500 font-semibold">Answer: </span>
                  {item.answer}
                </p>
              </div>

              {item.tags && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                  <Tag className="w-3 h-3" />
                  <span>{item.tags}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-[#27272a] rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {editItem ? "Edit Knowledge Item" : "Add Knowledge Base Entry"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. About Zawr Industries"
                  className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="general">General</option>
                  <option value="company">Company</option>
                  <option value="services">Services</option>
                  <option value="pricing">Pricing</option>
                  <option value="faq">FAQ</option>
                  <option value="objections">Objections</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Target Question / Inquiry</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What services do you offer?"
                  className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Verified Answer (Truth Source)</label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide the exact factual response the AI must use..."
                  className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. services, pricing, mvp"
                  className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
