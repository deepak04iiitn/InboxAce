"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Check } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsProps {
  containerVariants: any;
  itemVariants: any;
}

export default function Analytics({ containerVariants, itemVariants }: AnalyticsProps) {
  return (
    <section id="analytics" className="py-24 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 p-8 hover:border-zinc-700 transition-all">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    Campaign Performance
                  </h3>
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                    Last 30 Days
                  </Badge>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Open Rate",
                      value: 68,
                      color: "from-blue-600 to-purple-600",
                    },
                    {
                      label: "Reply Rate",
                      value: 42,
                      color: "from-green-600 to-emerald-600",
                    },
                    {
                      label: "Follow-up Success",
                      value: 55,
                      color: "from-purple-600 to-pink-600",
                    },
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">{metric.label}</span>
                        <motion.span
                          className="text-white font-semibold"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          {metric.value}%
                        </motion.span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${metric.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${metric.value}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: 0.2 + index * 0.1,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { label: "Best Time", value: "10:00 AM" },
                    { label: "Top Industry", value: "Tech" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="p-4 bg-zinc-800/50 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-sm text-zinc-400 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-lg font-bold text-white">
                        {stat.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="space-y-6 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-orange-600/20 text-orange-400 border-orange-500/30">
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Data-Driven Insights for Better Results
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Track every aspect of your outreach campaigns with comprehensive
              analytics. Identify what works and optimize your strategy for
              maximum impact.
            </p>
            <motion.ul
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                "Real-time open and reply tracking",
                "Company and industry performance",
                "Email timing optimization",
                "Template effectiveness analysis",
                "Follow-up sequence insights",
              ].map((item, index) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3 text-zinc-300"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className="h-6 w-6 rounded-full bg-orange-600/20 flex items-center justify-center flex-shrink-0 mt-0.5"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="h-4 w-4 text-orange-400" />
                  </motion.div>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}