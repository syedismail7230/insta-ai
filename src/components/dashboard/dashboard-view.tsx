"use client";

import { Header } from "@/components/layout/header";
import {
  Users,
  HelpCircle,
  TrendingUp,
  ArrowUpRight,
  Zap,
  BookOpen,
  MessageSquare,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DashboardView() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    qualifiedLeads: 0,
    pendingQuestions: 0,
    activeKbCount: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [custRes, pqRes, kbRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/pending-questions"),
          fetch("/api/knowledge-base"),
        ]);

        if (custRes.ok) {
          const custs = await custRes.json();
          setRecentCustomers(custs.slice(0, 5));
          const qual = custs.filter((c: any) => c.stage === "qualified" || c.leadScore >= 70).length;
          setStats((prev) => ({ ...prev, totalCustomers: custs.length, qualifiedLeads: qual }));
        }

        if (pqRes.ok) {
          const pqs = await pqRes.json();
          setStats((prev) => ({ ...prev, pendingQuestions: pqs.filter((q: any) => q.status === "pending").length }));
        }

        if (kbRes.ok) {
          const kbs = await kbRes.json();
          setStats((prev) => ({ ...prev, activeKbCount: kbs.length }));
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Executive Overview"
        description="Real-time Instagram DM sales metrics & AI agent activity for Zawr Industries."
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a] hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Total Instagram Leads</span>
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">
              {loading ? "..." : stats.totalCustomers}
            </div>
            <div className="mt-2 flex items-center text-[11px] text-emerald-400 gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+18% this week</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a] hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Qualified Prospects</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">
              {loading ? "..." : stats.qualifiedLeads}
            </div>
            <div className="mt-2 text-[11px] text-zinc-400">
              Budget & Timeline captured
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a] hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Pending Human Queue</span>
              <HelpCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-amber-400 tracking-tight">
              {loading ? "..." : stats.pendingQuestions}
            </div>
            <div className="mt-2 text-[11px] text-amber-400/80">
              {stats.pendingQuestions > 0 ? "Requires review & approval" : "Queue clear"}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a] hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Knowledge Base Records</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">
              {loading ? "..." : stats.activeKbCount}
            </div>
            <div className="mt-2 text-[11px] text-zinc-400">
              Zero-hallucination truth source
            </div>
          </div>
        </div>

        {/* Action Banner for Pending HITL Questions */}
        {stats.pendingQuestions > 0 && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-300">
                  {stats.pendingQuestions} Question{stats.pendingQuestions > 1 ? "s" : ""} waiting for your review
                </h3>
                <p className="text-xs text-amber-200/70">
                  The AI encountered off-KB questions and notified you. Review and approve answers to send DM and auto-learn into Knowledge Base.
                </p>
              </div>
            </div>
            <Link
              href="/pending-questions"
              className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 shrink-0"
            >
              <span>Review Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Prospects List */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-[#121215] border border-[#27272a] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Instagram Leads</h3>
                <p className="text-xs text-zinc-400">Latest DMs & qualified customer profiles</p>
              </div>
              <Link href="/customers" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                <span>View all CRM</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-3.5 rounded-lg bg-[#18181c] border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={cust.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={cust.username}
                      className="w-9 h-9 rounded-full border border-zinc-700 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{cust.fullName || cust.username}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          @{cust.username}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-sm mt-0.5">
                        {cust.requirements || "Inquired about custom software engineering"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Score {cust.leadScore}/100
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {cust.budget || "$15k+"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick System Controls */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#27272a] space-y-4">
            <h3 className="text-sm font-semibold text-white">Agent Operations</h3>
            <div className="space-y-3 text-xs">
              <Link
                href="/inbox"
                className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between hover:bg-zinc-800/60 transition block"
              >
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Live Inbox</div>
                    <div className="text-zinc-400 text-[11px]">Chat stream & human takeover</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>

              <Link
                href="/knowledge-base"
                className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between hover:bg-zinc-800/60 transition block"
              >
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Knowledge Base</div>
                    <div className="text-zinc-400 text-[11px]">Add services, pricing & FAQs</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>

              <Link
                href="/settings"
                className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between hover:bg-zinc-800/60 transition block"
              >
                <div className="flex items-center space-x-2.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">AI Config & Providers</div>
                    <div className="text-zinc-400 text-[11px]">Switch between Gemini, Groq, OpenAI</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
