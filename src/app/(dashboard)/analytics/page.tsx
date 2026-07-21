"use client";

import { Header } from "@/components/layout/header";
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Globe,
  Mail,
  Zap,
} from "lucide-react";

export default function AnalyticsPage() {
  const channelMatrix = [
    { name: "Instagram DMs", status: "Active", connected: true, color: "text-pink-500" },
    { name: "WhatsApp Business", status: "Extensible Ready", connected: false, color: "text-emerald-500" },
    { name: "Facebook Messenger", status: "Extensible Ready", connected: false, color: "text-blue-500" },
    { name: "Website Live Chat", status: "Extensible Ready", connected: false, color: "text-cyan-500" },
    { name: "Email Inbox", status: "Extensible Ready", connected: false, color: "text-purple-500" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Analytics & Channel Matrix"
        description="Conversion metrics, response speeds, and multi-channel expansion capabilities."
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a]">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Avg AI Response Time</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">1.8s</div>
            <div className="mt-2 text-[11px] text-emerald-400 font-medium">Ultra-fast Instagram auto-reply</div>
          </div>

          <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a]">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Truth Source Accuracy</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">100%</div>
            <div className="mt-2 text-[11px] text-zinc-400">Zero-hallucination HITL protected</div>
          </div>

          <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a]">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Discovery Call Booking Rate</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">34.2%</div>
            <div className="mt-2 text-[11px] text-emerald-400 font-medium">+8.5% higher than manual DMs</div>
          </div>

          <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a]">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Automated DM Resolution</span>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">92.4%</div>
            <div className="mt-2 text-[11px] text-zinc-400">Resolved without human escalation</div>
          </div>
        </div>

        {/* Funnel & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#27272a] space-y-4">
            <h3 className="text-sm font-semibold text-white">Instagram DM Sales Conversion Funnel</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>1. Incoming DMs Received</span>
                  <span className="font-mono text-white">100% (142 DMs)</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>2. Qualified Prospects (Budget & Requirements)</span>
                  <span className="font-mono text-white">68% (96 leads)</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: "68%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>3. Discovery Call Link Shared</span>
                  <span className="font-mono text-white">45% (64 leads)</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>4. Call Booked & Closed Deals</span>
                  <span className="font-mono text-white">34% (48 booked)</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: "34%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Channel Scalability Matrix */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#27272a] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Multi-Channel Architecture Readiness</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                The architecture is designed to support additional channels seamlessly without breaking changes.
              </p>
            </div>

            <div className="space-y-2.5">
              {channelMatrix.map((ch) => (
                <div
                  key={ch.name}
                  className="p-3.5 rounded-lg bg-[#18181c] border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className={`w-4 h-4 ${ch.color}`} />
                    <span className="font-semibold text-white">{ch.name}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ch.connected
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {ch.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
