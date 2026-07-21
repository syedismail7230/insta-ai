"use client";

import { Header } from "@/components/layout/header";
import {
  MessageSquare,
  Send,
  UserCheck,
  Zap,
  Clock,
  DollarSign,
  FileText,
  UserX,
  Bot,
  User,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function InboxPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        if (data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(data[0].id);
          loadConversation(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadConversation(customerId: string) {
    setSelectedCustomerId(customerId);
    // Fetch mock/real conversation messages for selected customer
    // For sample customer cust_sample_101
    setMessages([
      {
        id: "msg_1",
        senderType: "customer",
        content: "Hi Zawr team! Do you build custom Instagram AI Sales Bots with CRM integration?",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: "msg_2",
        senderType: "ai",
        content: "Hello Alex! Yes absolutely. At Zawr Industries, we specialize in high-performance AI Sales Agents for Instagram DMs connected directly to PostgreSQL databases and custom dashboards.",
        createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      },
      {
        id: "msg_3",
        senderType: "customer",
        content: "Great! What is your estimated timeline and budget for a project like that?",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        id: "msg_4",
        senderType: "ai",
        content: "Our MVP sprints start at $5,000 with a 1 to 3 week turnaround. Full custom enterprise AI platforms range between $15,000 and $35,000. Would you like to schedule a quick 1-on-1 technical discovery call?",
        createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
      },
      {
        id: "msg_5",
        senderType: "customer",
        content: "Can we book a discovery call for this Thursday?",
        createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      },
    ]);
  }

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  async function toggleHumanTakeover() {
    if (!selectedCustomer) return;
    const updatedStatus = !selectedCustomer.isHumanTakeover;
    try {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedCustomer.id, isHumanTakeover: updatedStatus }),
      });
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === selectedCustomer.id ? { ...c, isHumanTakeover: updatedStatus } : c))
        );
      }
    } catch (err) {
      console.error("Failed to toggle takeover:", err);
    }
  }

  async function handleSendManualMessage() {
    if (!inputMessage.trim() || !selectedCustomer) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedCustomer.id, text: inputMessage }),
      });
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_human_${Date.now()}`,
            senderType: "human",
            content: inputMessage,
            createdAt: new Date().toISOString(),
          },
        ]);
        setInputMessage("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header
        title="Instagram Live Inbox"
        description="Monitor real-time DM conversations, toggle human takeover, and inspect lead memory."
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversations List */}
        <div className="w-80 bg-[#0c0c0e] border-r border-[#27272a] flex flex-col h-full">
          <div className="p-3.5 border-b border-[#27272a] flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Active Conversations ({customers.length})</span>
            <button onClick={loadCustomers} className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
            {customers.map((cust) => {
              const isSelected = cust.id === selectedCustomerId;
              return (
                <div
                  key={cust.id}
                  onClick={() => loadConversation(cust.id)}
                  className={`p-3.5 cursor-pointer transition flex items-start space-x-3 ${
                    isSelected ? "bg-[#18181c] border-l-2 border-white" : "hover:bg-[#121215]"
                  }`}
                >
                  <img
                    src={cust.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={cust.username}
                    className="w-9 h-9 rounded-full border border-zinc-700 object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">{cust.fullName || cust.username}</span>
                      {cust.isHumanTakeover && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          HUMAN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      @{cust.username}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Score {cust.leadScore}/100
                      </span>
                      <span className="text-zinc-500">Instagram DM</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Chat Window */}
        <div className="flex-1 bg-[#09090b] flex flex-col h-full border-r border-[#27272a]">
          {selectedCustomer ? (
            <>
              {/* Chat Top Header */}
              <div className="h-14 px-6 border-b border-[#27272a] bg-[#0c0c0e] flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedCustomer.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={selectedCustomer.username}
                    className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      {selectedCustomer.fullName}
                      <span className="text-[11px] text-zinc-400 font-mono">@{selectedCustomer.username}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">ID: {selectedCustomer.instagramId}</div>
                  </div>
                </div>

                {/* Human Takeover Toggle Switch */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-zinc-400">
                    {selectedCustomer.isHumanTakeover ? "Human Control Active" : "AI Auto-Reply Active"}
                  </span>
                  <button
                    onClick={toggleHumanTakeover}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                      selectedCustomer.isHumanTakeover
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white"
                    }`}
                  >
                    {selectedCustomer.isHumanTakeover ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    <span>{selectedCustomer.isHumanTakeover ? "Takeover Active" : "Takeover Control"}</span>
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isCust = msg.senderType === "customer";
                  const isAI = msg.senderType === "ai";
                  const isHuman = msg.senderType === "human";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCust ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {isCust ? selectedCustomer.username : isAI ? "Zawr AI Agent" : "Zawr Admin (Human)"}
                        </span>
                        <span className="text-[9px] text-zinc-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div
                        className={`max-w-md p-3.5 rounded-xl text-xs leading-relaxed ${
                          isCust
                            ? "bg-[#18181c] border border-zinc-800 text-zinc-200"
                            : isAI
                            ? "bg-zinc-800/90 border border-zinc-700 text-white shadow-sm"
                            : "bg-emerald-950/80 border border-emerald-800/60 text-emerald-200"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <div className="p-4 border-t border-[#27272a] bg-[#0c0c0e]">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendManualMessage()}
                    placeholder={
                      selectedCustomer.isHumanTakeover
                        ? "Type a manual Instagram DM response..."
                        : "Type manual DM (sending will trigger human takeover)..."
                    }
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#141417] border border-[#27272a] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    onClick={handleSendManualMessage}
                    disabled={sending || !inputMessage.trim()}
                    className="px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send DM</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-500">
              Select a conversation to start viewing Instagram DMs
            </div>
          )}
        </div>

        {/* Right Column: Customer Lead Memory Drawer */}
        {selectedCustomer && (
          <div className="w-72 bg-[#0c0c0e] flex flex-col h-full p-5 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer Memory</h3>
              <div className="mt-3 flex items-center space-x-3">
                <img
                  src={selectedCustomer.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={selectedCustomer.username}
                  className="w-12 h-12 rounded-full border border-zinc-700 object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-white">{selectedCustomer.fullName}</div>
                  <div className="text-xs text-zinc-400">@{selectedCustomer.username}</div>
                </div>
              </div>
            </div>

            {/* Lead Score & Stage */}
            <div className="p-3.5 rounded-lg bg-[#121215] border border-[#27272a] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Lead Score</span>
                <span className="font-bold text-emerald-400">{selectedCustomer.leadScore}/100</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Sales Stage</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-zinc-800 text-zinc-300 uppercase">
                  {selectedCustomer.stage}
                </span>
              </div>
            </div>

            {/* Business Memory Details */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Estimated Budget
                </span>
                <div className="font-mono text-white p-2 rounded bg-[#141417] border border-zinc-800/80">
                  {selectedCustomer.budget || "Not specified yet"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Target Timeline
                </span>
                <div className="font-mono text-white p-2 rounded bg-[#141417] border border-zinc-800/80">
                  {selectedCustomer.timeline || "Not specified yet"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Technical Requirements
                </span>
                <div className="text-zinc-300 p-2.5 rounded bg-[#141417] border border-zinc-800/80 leading-relaxed text-[11px]">
                  {selectedCustomer.requirements || "Inquired about custom software solution."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
