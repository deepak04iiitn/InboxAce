"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface GamificationProps {
  containerVariants: any;
  itemVariants: any;
}

export default function Gamification({ containerVariants, itemVariants }: GamificationProps) {
  const badges = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "First Reply",
      color: "blue",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "100 Applications",
      color: "purple",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "30 Day Streak",
      color: "yellow",
    },
  ];

  return (
    <section className="py-24 px-4 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          className="max-w-4xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
            <Award className="h-3 w-3 mr-1" />
            Gamification
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Stay Motivated with Achievements
          </h2>
          <p className="text-xl text-zinc-400">
            Earn badges, track streaks, and celebrate milestones as you progress
            toward your dream job.
          </p>

          <motion.div
            className="grid md:grid-cols-3 gap-6 pt-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {badges.map((badge, index) => (
              <motion.div
                key={badge.title}
                variants={itemVariants}
                whileHover={{ y: -10, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all p-6">
                  <motion.div
                    className={`h-16 w-16 rounded-full bg-${badge.color}-600/20 flex items-center justify-center text-${badge.color}-400 mx-auto mb-4`}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  >
                    {badge.icon}
                  </motion.div>
                  <h3 className="text-white font-semibold text-lg">
                    {badge.title}
                  </h3>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}