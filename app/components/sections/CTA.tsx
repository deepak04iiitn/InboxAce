"use client";

import { Button } from "@/components/ui/button";
import { Shield, Clock, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CTAProps {
  containerVariants: any;
  itemVariants: any;
}

export default function CTA({ containerVariants, itemVariants }: CTAProps) {
  return (
    <section className="py-24 px-4 lg:px-8 bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-pink-950/40 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="container mx-auto relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Ready to Land Your Dream Job?
          </motion.h2>
          <motion.p
            className="text-xl text-zinc-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Join thousands of job seekers who have transformed their outreach
            strategy with InboxAce.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-white text-black hover:bg-zinc-200 cursor-pointer font-semibold px-8 text-lg h-12"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-600 text-black hover:bg-zinc-300/50 cursor-pointer px-8 text-lg h-12"
              >
                See Demo
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex items-center justify-center gap-6 pt-6 text-sm text-zinc-400"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Shield, text: "Secure & Private" },
              { icon: Clock, text: "Setup in 5 minutes" },
              { icon: Globe, text: "Used worldwide" },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <item.icon className="h-4 w-4" />
                {item.text}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}