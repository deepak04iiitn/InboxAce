"use client";

import { Mail, TrendingUp, Users, Award } from "lucide-react";
import { motion } from "framer-motion";

interface StatsProps {
  stats: Array<{
    label: string;
    value: string;
    icon: JSX.Element;
    color: string;
  }>;
  containerVariants: any;
  itemVariants: any;
}

export default function Stats({ stats, containerVariants, itemVariants }: StatsProps) {
  return (
    <section className="py-16 px-4 lg:px-8 border-y border-zinc-800 bg-zinc-950/50">
      <div className="container mx-auto">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center space-y-2"
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="flex items-center justify-center text-blue-500 mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              >
                {stat.icon}
              </motion.div>
              <motion.div
                className="text-4xl md:text-5xl font-bold text-white"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                {stat.value}
              </motion.div>
              <div className="text-zinc-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}