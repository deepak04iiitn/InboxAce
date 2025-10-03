"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
  color: string;
}

interface FeaturesProps {
  features: Feature[];
  containerVariants: any;
  itemVariants: any;
}

export default function Features({ features, containerVariants, itemVariants }: FeaturesProps) {
  return (
    <section id="features" className="py-24 px-4 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-zinc-400">
            Powerful tools to automate, personalize, and optimize your job
            outreach campaigns.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <motion.div
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 300 },
                }}
              >
                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-blue-500/10 group h-full relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                  <CardHeader className="relative z-10">
                    <motion.div
                      className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-white text-xl">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-zinc-400 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}