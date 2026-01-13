"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  FiMessageSquare,
  FiUsers,
  FiHash,
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw
} from "react-icons/fi";

export default function Dashboard() {
  const [stats, setStats] = useState({
    messages: 0,
    newMessages: 0,
    channels: 0,
    participants: 0,
    lastSync: "Never",
    status: "Unknown"
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // 🔒 Auth Check & Data Fetch
  useEffect(() => {
    const init = async () => {
      // 1. Get User & Session
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession(); 

      if (!user || !session) {
        router.push("/login");
        return;
      }

      // 2. Fetch Real Stats (With Auth & Timezone)
      try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const res = await fetch("/api/dashboard/stats", {
            headers: {
                "x-timezone": userTimezone,
                "Authorization": `Bearer ${session.access_token}` // <--- PASS THE KEY
            }
        });
        
        if (res.status === 401) {
            console.error("Unauthorized access");
            return;
        }

        const realData = await res.json();
        
        // Only update if we got valid data back
        if (realData.messages !== undefined) {
            setStats({
                messages: realData.messages,
                newMessages: realData.newMessages,
                channels: realData.channels,
                participants: realData.participants,
                lastSync: realData.lastSync ? new Date(realData.lastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Never",
                status: "OPTIMAL"
            });
        }
      } catch (e) {
        console.error("Stats fetch failed", e);
      }

      setLoading(false);
    };
    init();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading Headquarters...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex justify-between items-end border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-gray-900">
              Operations Center
            </h1>
            <p className="text-sm text-gray-500 mt-2 tracking-wide uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <FiActivity className="text-emerald-500" />
            <span>SYSTEM: {stats.status}</span>
          </div>
        </header>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Messages */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <FiMessageSquare className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                +{stats.newMessages} today
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-semibold text-gray-900">{stats.messages}</h3>
              <p className="text-sm text-gray-500">Total Messages</p>
            </div>
          </div>

          {/* Card 2: Channels */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <FiHash className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-semibold text-gray-900">{stats.channels}</h3>
              <p className="text-sm text-gray-500">Active Channels</p>
            </div>
          </div>

          {/* Card 3: Team */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <FiUsers className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-semibold text-gray-900">{stats.participants}</h3>
              <p className="text-sm text-gray-500">Team Members</p>
            </div>
          </div>

          {/* Card 4: Last Sync */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <FiClock className="w-5 h-5 text-gray-600" />
              </div>
              <FiRefreshCw className="w-3 h-3 text-gray-400 animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-gray-900">{stats.lastSync}</h3>
              <p className="text-sm text-gray-500">Last Ingestion</p>
            </div>
          </div>
        </div>

        {/* AI INSIGHTS SECTION (PLACEHOLDERS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed: Daily Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Executive Briefing</h2>
                <span className="text-xs text-gray-400 font-mono">AI-GENERATED</span>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-4">
                  <div className="w-1 h-16 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Project Alpha Update</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      The engineering team has resolved the critical API latency issue. 
                      Deployment is scheduled for 2:00 PM EST. Marketing is preparing the 
                      announcement for tomorrow morning.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 h-16 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Q1 Planning</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Strategy meeting confirmed for Thursday. Key discussion points: 
                      budget allocation for the new hiring round and selecting the 
                      vendor for the cloud migration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Action Items & Blockers */}
          <div className="space-y-6">
            
            {/* Needs Attention */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FiAlertCircle className="text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Needs Attention</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-900">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  Approve final design mocks by 5 PM
                </li>
                <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-900">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  Review contract updates from Legal
                </li>
              </ul>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FiCheckCircle className="text-emerald-500" />
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Resolved Today</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-500 line-through">
                  <div className="w-1.5 h-1.5 bg-emerald-200 rounded-full flex-shrink-0"></div>
                  Server migration complete
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-500 line-through">
                  <div className="w-1.5 h-1.5 bg-emerald-200 rounded-full flex-shrink-0"></div>
                  Client onboarded successfully
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
