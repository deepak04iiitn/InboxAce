"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";

interface AnalyticsData {
  totals: {
    emailsSent: number;
    emailsOpened: number;
    emailsReplied: number;
    emailsFailed: number;
    followUpsSent: number;
  };
  rates: {
    openRate: string;
    replyRate: string;
  };
  jobStats: {
    total: number;
    sent: number;
    replied: number;
    notSent: number;
  };
  topCompanies: Array<{ company: string; count: number }>;
  emailTypes: { [key: string]: number };
  timeline: Array<any>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?days=${days}`);
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">Track your outreach performance</p>
          </div>

          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Emails Sent",
              value: data.totals.emailsSent,
              icon: Mail,
              color: "purple",
            },
            {
              label: "Emails Opened",
              value: data.totals.emailsOpened,
              icon: Eye,
              color: "blue",
            },
            {
              label: "Replies Received",
              value: data.totals.emailsReplied,
              icon: MessageSquare,
              color: "green",
            },
            {
              label: "Follow-ups Sent",
              value: data.totals.followUpsSent,
              icon: TrendingUp,
              color: "pink",
            },
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${metric.color}-500/20`}>
                  <metric.icon className={`w-6 h-6 text-${metric.color}-400`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {metric.value}
              </div>
              <div className="text-gray-400 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Open Rate</h3>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-blue-400">
                {data.rates.openRate}%
              </div>
              <div className="text-gray-400 mb-2">of emails opened</div>
            </div>
            <div className="mt-4 bg-gray-900/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                style={{ width: `${Math.min(parseFloat(data.rates.openRate), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Reply Rate</h3>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-green-400">
                {data.rates.replyRate}%
              </div>
              <div className="text-gray-400 mb-2">of emails replied</div>
            </div>
            <div className="mt-4 bg-gray-900/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                style={{ width: `${Math.min(parseFloat(data.rates.replyRate), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Job Stats */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">Job Applications</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total", value: data.jobStats.total, color: "purple" },
              { label: "Sent", value: data.jobStats.sent, color: "blue" },
              { label: "Replied", value: data.jobStats.replied, color: "green" },
              { label: "Pending", value: data.jobStats.notSent, color: "yellow" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">Top Companies</h3>
          <div className="space-y-3">
            {data.topCompanies.slice(0, 5).map((company, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-purple-400 font-bold">{index + 1}</div>
                  <div className="text-white">{company.company}</div>
                </div>
                <div className="text-gray-400">{company.count} applications</div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Types Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">
            Email Type Distribution
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(data.emailTypes).map(([type, count], index) => (
              <div
                key={index}
                className="bg-gray-900/50 rounded-lg p-4 text-center"
              >
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {count as number}
                </div>
                <div className="text-gray-400 text-sm">
                  {type.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
