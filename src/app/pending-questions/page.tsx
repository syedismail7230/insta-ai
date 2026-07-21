"use client";

import { Header } from "@/components/layout/header";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Send,
  BookOpen,
  Sparkles,
  User,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function PendingQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editAnswers, setEditAnswers] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<{ [key: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingQuestions();
  }, []);

  async function loadPendingQuestions() {
    try {
      const res = await fetch("/api/pending-questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        // Pre-fill edit answers
        const initialAnswers: { [key: string]: string } = {};
        const initialCats: { [key: string]: string } = {};
        data.forEach((item: any) => {
          initialAnswers[item.id] = item.suggestedAnswer || "";
          initialCats[item.id] = "faq";
        });
        setEditAnswers(initialAnswers);
        setCategories(initialCats);
      }
    } catch (err) {
      console.error("Failed to load pending questions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setProcessingId(id);
    const answer = editAnswers[id];
    const category = categories[id] || "faq";

    try {
      const res = await fetch("/api/pending-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve", answer, category }),
      });

      if (res.ok) {
        loadPendingQuestions();
      }
    } catch (err) {
      console.error("Failed to approve question:", err);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch("/api/pending-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject" }),
      });

      if (res.ok) {
        loadPendingQuestions();
      }
    } catch (err) {
      console.error("Failed to reject question:", err);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRegenerate(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch("/api/pending-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "regenerate" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.answer) {
          setEditAnswers((prev) => ({ ...prev, [id]: data.answer }));
        }
      }
    } catch (err) {
      console.error("Failed to regenerate answer:", err);
    } finally {
      setProcessingId(null);
    }
  }

  const pendingQuestionsList = questions.filter((q) => q.status === "pending");
  const historyQuestionsList = questions.filter((q) => q.status !== "pending");

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Human-in-the-Loop (HITL) Queue"
        description="Review off-KB questions flagged by AI. Approve answers to send Instagram DMs and permanently learn into Knowledge Base."
      />

      <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* Banner */}
        <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Pending Questions Approval Queue</h2>
              <p className="text-xs text-zinc-400">
                When the AI encounters an unverified question, it pauses, notifies you, and awaits your approval before replying.
              </p>
            </div>
          </div>
          <button
            onClick={loadPendingQuestions}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Active Pending Queue */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Pending Questions ({pendingQuestionsList.length})
          </h3>

          {pendingQuestionsList.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#121215] border border-[#27272a] text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-semibold text-white">Queue Clear!</div>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No questions currently waiting for human approval. All Instagram DMs are answered accurately from the Knowledge Base.
              </p>
            </div>
          ) : (
            pendingQuestionsList.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-xl bg-[#121215] border border-amber-500/30 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-semibold text-white">
                      {item.customerName || item.customerUsername || "Instagram Prospect"}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">@{item.customerUsername}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-amber-300">Customer DM Question:</div>
                  <div className="mt-1 text-xs text-white p-3 rounded-lg bg-[#18181c] border border-zinc-800 font-medium">
                    "{item.question}"
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Knowledge Base Category</label>
                    <select
                      value={categories[item.id] || "faq"}
                      onChange={(e) => setCategories({ ...categories, [item.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                    >
                      <option value="faq">FAQ</option>
                      <option value="services">Services</option>
                      <option value="pricing">Pricing</option>
                      <option value="company">Company</option>
                      <option value="objections">Objections</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-zinc-400 font-medium mb-1">
                      Approved Answer (Will send on DM & save permanently to Knowledge Base)
                    </label>
                    <textarea
                      rows={3}
                      value={editAnswers[item.id] !== undefined ? editAnswers[item.id] : item.suggestedAnswer}
                      onChange={(e) => setEditAnswers({ ...editAnswers, [item.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181c] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => handleReject(item.id)}
                    disabled={processingId === item.id}
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => handleRegenerate(item.id)}
                    disabled={processingId === item.id}
                    className="px-4 py-2 rounded-lg bg-[#d97706]/10 text-[#f59e0b] border border-[#d97706]/20 text-xs font-semibold hover:bg-[#d97706]/20 hover:text-white transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{processingId === item.id ? "Regenerating..." : "Regenerate Response"}</span>
                  </button>

                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={processingId === item.id}
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{processingId === item.id ? "Approving & Sending..." : "Approve, Send DM & Save to KB"}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* History Log */}
        {historyQuestionsList.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#27272a]">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Resolution History ({historyQuestionsList.length})
            </h3>
            <div className="space-y-2">
              {historyQuestionsList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-[#121215] border border-[#27272a] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">"{item.question}"</span>
                    <span className="text-zinc-500 block text-[11px]">
                      Customer @{item.customerUsername} • Approved Answer: "{item.approvedAnswer || item.suggestedAnswer}"
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
