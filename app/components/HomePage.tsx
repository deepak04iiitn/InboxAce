"use client";

import { Mail, Brain, FileText, Zap, BarChart3, Users, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import Hero from "./sections/Hero";
import Stats from "./sections/Stats";
import Features from "./sections/Features";
import ReachHub from "./sections/ReachHub";
import Analytics from "./sections/Analytics";
import Pricing from "./sections/Pricing";
import Gamification from "./sections/Gamification";
import CTA from "./sections/CTA";


export default function HomePage() {
  const features = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Automation",
      description:
        "Send personalized cold emails automatically through your Gmail or Outlook account.",
      color: "blue",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Personalization",
      description:
        "Leverage AI to customize emails with company-specific insights and adjustable tones.",
      color: "purple",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Job Tracker",
      description:
        "Built-in spreadsheet to manage applications with real-time sync and smart filters.",
      color: "green",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Smart Follow-Ups",
      description:
        "Automated follow-up sequences triggered by opens or time-based conditions.",
      color: "yellow",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description:
        "Track open rates, replies, and campaign performance with visual insights.",
      color: "orange",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "ReachHub Collaboration",
      description:
        "Team workspaces to multiply outreach through shared campaigns and tracking.",
      color: "pink",
    },
  ];

  const stats = [
    {
      label: "Emails Sent",
      value: "1M+",
      icon: <Mail className="h-5 w-5" />,
      color: "blue",
    },
    {
      label: "Success Rate",
      value: "87%",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "green",
    },
    {
      label: "Active Users",
      value: "10K+",
      icon: <Users className="h-5 w-5" />,
      color: "purple",
    },
    {
      label: "Jobs Landed",
      value: "5K+",
      icon: <Award className="h-5 w-5" />,
      color: "yellow",
    },
  ];

  const benefits = [
    "Unlimited email campaigns",
    "AI-powered email generation",
    "Advanced analytics & insights",
    "Gmail & Outlook integration",
    "Smart follow-up automation",
    "Template library access",
    "Resume management",
    "Priority support",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-black">
      <Hero containerVariants={containerVariants} itemVariants={itemVariants} />
      <Stats stats={stats} containerVariants={containerVariants} itemVariants={itemVariants} />
      <Features features={features} containerVariants={containerVariants} itemVariants={itemVariants} />
      <ReachHub containerVariants={containerVariants} itemVariants={itemVariants} />
      <Analytics containerVariants={containerVariants} itemVariants={itemVariants} />
      <Pricing benefits={benefits} containerVariants={containerVariants} itemVariants={itemVariants} />
      <Gamification containerVariants={containerVariants} itemVariants={itemVariants} />
      <CTA containerVariants={containerVariants} itemVariants={itemVariants} />
    </div>
  );
}