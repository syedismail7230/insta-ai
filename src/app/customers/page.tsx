"use client";

import { Header } from "@/components/layout/header";
import {
  Users,
  Search,
  Zap,
  Clock,
  DollarSign,
  FileText,
  UserCheck,
  Bot,
  MessageSquare,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateCustomerStage(id: string, stage: string) {
    try {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stage }),
      });
      if (res.ok) loadCustomers();
    } catch (err) {
      console.error("Failed to update stage:", err);
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const matchesStage = selectedStage === "all" || c.stage === selectedStage;
    const matchesSearch =
      (c.fullName && c.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.requirements && c.requirements.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStage && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Customers & CRM Memory"
        description="Comprehensive lead profiles, score analysis, budget & timeline memory captured from Instagram DMs."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search leads by name, username, requirements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#121215] border border-[#27272a] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {["all", "lead", "qualified", "proposal", "closed_won"].map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase transition ${
                  selectedStage === stage
                    ? "bg-zinc-800 text-white font-semibold border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {stage.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Table */}
        <div className="rounded-xl bg-[#121215] border border-[#27272a] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181c] border-b border-[#27272a] text-zinc-400 font-medium">
              <tr>
                <th className="py-3 px-4">Prospect</th>
                <th className="py-3 px-4">Lead Score</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Timeline</th>
                <th className="py-3 px-4">Last Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#18181c]/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={cust.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                        alt={cust.username}
                        className="w-9 h-9 rounded-full border border-zinc-700 object-cover"
                      />
                      <div>
                        <div className="font-semibold text-white">{cust.fullName || cust.username}</div>
                        <div className="text-zinc-500 text-[11px]">@{cust.username}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${cust.leadScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-emerald-400 text-[11px]">{cust.leadScore}/100</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={cust.stage}
                      onChange={(e) => updateCustomerStage(cust.id, e.target.value)}
                      className="px-2 py-1 rounded bg-[#18181c] border border-zinc-700 text-[11px] text-zinc-200 font-semibold focus:outline-none"
                    >
                      <option value="lead">Lead</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-zinc-300">{cust.budget || "Not set"}</td>

                  <td className="py-3.5 px-4 font-mono text-zinc-300">{cust.timeline || "Not set"}</td>

                  <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                    {new Date(cust.lastContactAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition text-[11px]"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-[#121215] border-l border-[#27272a] w-full max-w-md h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-sm font-semibold text-white">Prospect Profile & Memory</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-zinc-400 hover:text-white text-xs">
                Close
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src={selectedCustomer.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                alt={selectedCustomer.username}
                className="w-14 h-14 rounded-full border border-zinc-700 object-cover"
              />
              <div>
                <h4 className="text-base font-bold text-white">{selectedCustomer.fullName}</h4>
                <p className="text-xs text-zinc-400">@{selectedCustomer.username}</p>
                <div className="mt-1 text-[11px] text-zinc-500">Instagram ID: {selectedCustomer.instagramId}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#18181c] border border-zinc-800 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Lead Score</span>
                <span className="font-bold text-emerald-400">{selectedCustomer.leadScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Sales Stage</span>
                <span className="font-semibold text-white uppercase">{selectedCustomer.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Human Takeover</span>
                <span className="font-semibold text-amber-400">
                  {selectedCustomer.isHumanTakeover ? "Active" : "Disabled (AI auto-replies)"}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">Budget Memory</label>
                <div className="p-2.5 rounded bg-[#18181c] border border-zinc-800 text-white font-mono">
                  {selectedCustomer.budget || "None specified"}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Timeline Memory</label>
                <div className="p-2.5 rounded bg-[#18181c] border border-zinc-800 text-white font-mono">
                  {selectedCustomer.timeline || "None specified"}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Technical Requirements Summary</label>
                <div className="p-3 rounded bg-[#18181c] border border-zinc-800 text-zinc-300 leading-relaxed">
                  {selectedCustomer.requirements || "Inquired about custom software development."}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Internal Notes</label>
                <div className="p-3 rounded bg-[#18181c] border border-zinc-800 text-zinc-400 italic">
                  {selectedCustomer.notes || "No notes added yet."}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Link
                href="/inbox"
                className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open in Live Inbox</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
