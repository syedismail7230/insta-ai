"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Users,
  BarChart3,
  Settings,
  Bot,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [activeProvider, setActiveProvider] = useState<string>("Gemini");

  useEffect(() => {
    async function fetchStats() {
      try {
        const [pqRes, setRes] = await Promise.all([
          fetch("/api/pending-questions"),
          fetch("/api/settings"),
        ]);
        if (pqRes.ok) {
          const pqs = await pqRes.json();
          const pending = pqs.filter((q: any) => q.status === "pending").length;
          setPendingCount(pending);
        }
        if (setRes.ok) {
          const s = await setRes.json();
          if (s.activeProvider) {
            setActiveProvider(s.activeProvider.charAt(0).toUpperCase() + s.activeProvider.slice(1));
          }
        }
      } catch (err) {
        console.error("Sidebar sync error:", err);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Instagram Inbox", href: "/inbox", icon: MessageSquare },
    { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
    {
      name: "Pending Questions",
      href: "/pending-questions",
      icon: HelpCircle,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { name: "Customers / CRM", href: "/customers", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0c0c0e] border-r border-[#27272a] flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm shadow-md">
            Z
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide text-white flex items-center gap-1.5">
              ZAWR AI
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                v1.0
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">Instagram Sales Agent</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-zinc-800/80 text-white font-semibold shadow-sm border border-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3.5 m-3 rounded-lg bg-[#141417] border border-[#27272a] space-y-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Meta Webhook
          </span>
          <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/60">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Bot className="w-3 h-3 text-zinc-300" />
            AI Provider
          </span>
          <span className="text-zinc-200 font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
            {activeProvider}
          </span>
        </div>
      </div>
    </aside>
  );
}
