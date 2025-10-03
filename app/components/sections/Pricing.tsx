"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface PricingPlan {
  title: string;
  description: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  isComingSoon?: boolean;
  buttonText: string;
  buttonVariant?: "default" | "outline";
}

interface PricingProps {
  containerVariants: any;
  itemVariants: any;
}

const TrialPlan: PricingPlan = {
  title: "7-Day Free Trial",
  description: "Try all features without limits",
  price: "Free",
  features: [
    "Full access to all features",
    "Unlimited emails, jobs, templates & campaigns",
    "Analytics, follow-ups, workspaces included",
    "Gamification & activity logs enabled",
  ],
  buttonText: "Start Free Trial",
  buttonVariant: "outline",
};

const FreePlan: PricingPlan = {
  title: "Free",
  description: "Ideal for casual users or students",
  price: "₹0",
  features: [
    "1 email account connection",
    "50 emails/day",
    "20 jobs, 1 batch",
    "System templates only",
    "1 active campaign (no follow-ups)",
    "Basic analytics (sent, opened, replied)",
    "Limited gamification (basic achievements)",
    "7-day activity logs",
    "Email support only",
  ],
  buttonText: "Get Started",
  buttonVariant: "outline",
};

const PlusPlan: PricingPlan = {
  title: "Plus",
  description: "For active users & small teams",
  price: "₹99/month",
  isPopular: true,
  features: [
    "Up to 3 email accounts",
    "200 emails/day each",
    "200 jobs, unlimited batches",
    "System + custom templates, can rate",
    "3 active campaigns, up to 2 follow-ups",
    "Full analytics + daily summaries",
    "Workspaces (3 max, 5 members each)",
    "Standard gamification + streak tracking",
    "30-day activity logs",
    "Bulk import up to 500 rows",
    "Email + chat support",
  ],
  buttonText: "Upgrade to Plus",
};

const ProPlan: PricingPlan = {
  title: "Pro",
  description: "For power users & large agencies",
  price: "₹199/month",
  features: [
    "Unlimited email accounts",
    "500 emails/day per account",
    "Unlimited jobs & batches",
    "All templates + Pro templates",
    "Unlimited campaigns + advanced follow-ups",
    "Advanced analytics (open, reply, follow-up stats)",
    "Unlimited workspaces & members",
    "Gamification: all badges, streaks, leaderboards",
    "Full activity history",
    "Unlimited bulk import",
    "Priority support + onboarding",
    "Extras: Thread management, multi-template campaigns",
  ],
  buttonText: "Go Pro",
  buttonVariant: "outline"
};

export default function Pricing({ containerVariants, itemVariants }: PricingProps) {
  const plans = [TrialPlan, FreePlan, PlusPlan, ProPlan];

  return (
    <section
      id="pricing"
      className="py-24 px-4 lg:px-8 bg-gradient-to-b from-black via-zinc-950 to-black"
    >
      <div className="container mx-auto">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-pink-600/20 text-pink-400 border-pink-500/30">
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Choose Your Plan
          </h2>
          <p className="text-xl text-zinc-400">
            Start with a free trial, grow with Plus, scale with Pro.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              variants={itemVariants}
              whileHover={{ y: -10, scale: plan.isPopular ? 1.02 : 1 }}
            >
              <Card
                className={`${
                  plan.isPopular
                    ? "bg-gradient-to-b from-blue-950/40 to-purple-950/40 border-blue-500/50 hover:border-blue-400/50"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                } transition-all h-full relative`}
              >
                {plan.isPopular && (
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Most Popular
                    </Badge>
                  </motion.div>
                )}
                <CardHeader>
                  <CardTitle className="text-white text-2xl">
                    {plan.title}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {plan.description}
                  </CardDescription>
                  <div className="pt-4">
                    <motion.div
                      className="text-4xl font-bold text-white"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {plan.price}
                    </motion.div>
                    <div className="text-zinc-400 text-sm">
                      {plan.title === "7-Day Free Trial"
                        ? "one-time"
                        : plan.price === "₹0"
                        ? "forever"
                        : "per month"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={plan.buttonVariant}
                      disabled={plan.isComingSoon}
                      className={`w-full ${
                        plan.isPopular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold"
                          : "border-zinc-700 text-black hover:bg-zinc-300"
                      } cursor-pointer`}
                    >
                      {plan.buttonText}
                    </Button>
                  </motion.div>
                  <ul className="space-y-3 pt-4">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-zinc-400"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: featureIndex * 0.05 }}
                      >
                        <Check
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            plan.isPopular ? "text-blue-400" : "text-zinc-600"
                          }`}
                        />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
