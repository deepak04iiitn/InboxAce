"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, Check, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface ReachHubProps {
  containerVariants: any;
  itemVariants: any;
}

export default function ReachHub({ containerVariants, itemVariants }: ReachHubProps) {
  return (
    <section
      id="reachhub"
      className="py-24 px-4 lg:px-8 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden"
    >
      <motion.div
        className="absolute top-1/4 left-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
              <Users className="h-3 w-3 mr-1" />
              Collaboration Feature
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Multiply Your Reach with{" "}
              <span className="text-green-400">ReachHub</span>
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Create shared workspaces where teams collaborate on outreach
              campaigns. Each member connects their email, multiplying your
              total reach exponentially.
            </p>
            <motion.ul
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                "Shared job tracker and spreadsheet",
                "Team-wide analytics dashboard",
                "Member-wise performance tracking",
                "Real-time notes and comments",
                "Admin controls and permissions",
              ].map((item, index) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3 text-zinc-300"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className="h-6 w-6 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="h-4 w-4 text-green-400" />
                  </motion.div>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-green-600 hover:bg-green-500 text-white cursor-pointer font-semibold">
                Explore ReachHub
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-8 hover:border-zinc-700 transition-all">
              <div className="space-y-6">
                <motion.div
                  className="flex items-center gap-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Users className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Marketing Team Hub
                    </h3>
                    <p className="text-zinc-400">5 active members</p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { value: "150", label: "Total Emails" },
                    { value: "42", label: "Replies", color: "green" },
                    { value: "28%", label: "Rate", color: "blue" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-zinc-800/50 rounded-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <div
                        className={`text-2xl font-bold ${
                          stat.color === "green"
                            ? "text-green-400"
                            : stat.color === "blue"
                            ? "text-blue-400"
                            : "text-white"
                        }`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="space-y-3 pt-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    { name: "Sarah Johnson", emails: 32 },
                    { name: "Mike Chen", emails: 28 },
                    { name: "Emily Davis", emails: 25 },
                  ].map((member, index) => (
                    <motion.div
                      key={member.name}
                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-zinc-800/50 transition-colors"
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-zinc-400">{member.name}</span>
                      <motion.span
                        className="text-white font-semibold"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        {member.emails} emails
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}