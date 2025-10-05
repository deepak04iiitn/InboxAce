"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Lock, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  earned: boolean;
  earnedAt?: string;
}

export default function BadgesDisplay() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch("/api/gamification/badges");
      const data = await response.json();
      if (data.success) {
        setBadges(data.badges);
        setStats(data.stats);
      }
    } catch (error) {
      toast.error("Failed to load badges");
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

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Achievements</h1>
          <p className="text-gray-400">
            Unlock badges by completing challenges
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-6 h-6 text-purple-400" />
                <div className="text-gray-400">Emails Sent</div>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.totalEmailsSent}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-6 h-6 text-green-400" />
                <div className="text-gray-400">Replies</div>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.totalReplies}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-yellow-400" />
                <div className="text-gray-400">Badges Earned</div>
              </div>
              <div className="text-3xl font-bold text-white">
                {earnedBadges.length} / {badges.length}
              </div>
            </div>
          </div>
        )}

        {/* Earned Badges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Earned Badges ({earnedBadges.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 rounded-xl p-6"
              >
                <div className="text-5xl mb-3">{badge.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {badge.name}
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {badge.description}
                </p>
                {badge.earnedAt && (
                  <div className="text-xs text-purple-300">
                    Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Locked Badges */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Locked Badges ({lockedBadges.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 relative opacity-60"
              >
                <Lock className="absolute top-4 right-4 w-5 h-5 text-gray-500" />
                <div className="text-5xl mb-3 grayscale">{badge.icon}</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  {badge.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3">
                  {badge.description}
                </p>
                <div className="text-xs text-gray-500">
                  Requirement: {badge.requirement}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
