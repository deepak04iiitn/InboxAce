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
import {
  Mail,
  Zap,
  BarChart3,
  Users,
  Brain,
  FileText,
  Target,
  Award,
  TrendingUp,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
  Clock,
  Globe,
} from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

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

  const FloatingElement = ({ delay = 0, duration = 3 }) => (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
      className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
    />
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-6 pb-20 px-4 lg:px-8 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-black to-black" />
        <FloatingElement delay={0} duration={4} />
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="container mx-auto relative z-10"
          style={{ opacity, scale }}
        >

        <Link href="/" className="flex items-center justify-center space-x-2 group">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2 
                }}
                whileHover={{ scale: 1.1 }}
            >
                <Image
                    src="/InboxAce.png"  
                    alt="InboxAce Logo"
                    width={300}        
                    height={300}
                    className="group-hover:opacity-80 transition-opacity"
                />
            </motion.div>
          </Link>
          <motion.div
            className="max-w-4xl mx-auto text-center space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >

            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white leading-tight -mt-6"
              variants={itemVariants}
            >
              More Emails, More Chances,{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text inline-block"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                More Wins
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Automate your job outreach with InboxAce. Send personalized cold
              emails, track applications, and collaborate with teams to land your
              dream role faster.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 text-lg h-12 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Start Free Trial
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-zinc-700 text-black hover:bg-blue-500 cursor-pointer px-8 text-lg h-12 transition-all duration-300"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-8 pt-8 text-sm text-zinc-500"
              variants={itemVariants}
            >
              {[
                "No credit card required",
                "14-day free trial",
                "Cancel anytime",
              ].map((text, index) => (
                <motion.div
                  key={text}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Check className="h-4 w-4 text-green-500" />
                  {text}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
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

      {/* Features Section */}
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

      {/* ReachHub Section */}
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

      {/* Analytics Section */}
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

      {/* Pricing Section */}
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
              Start free, upgrade when you need more power.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Free Plan */}
            <motion.div variants={itemVariants} whileHover={{ y: -10 }}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all h-full">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Free</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Perfect for getting started
                  </CardDescription>
                  <div className="pt-4">
                    <motion.div
                      className="text-4xl font-bold text-white"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      $0
                    </motion.div>
                    <div className="text-zinc-400 text-sm">forever</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-zinc-700 text-black cursor-pointer hover:bg-zinc-300"
                    >
                      Start Free
                    </Button>
                  </motion.div>
                  <ul className="space-y-3 pt-4">
                    {[
                      "50 emails per month",
                      "Basic job tracker",
                      "3 email templates",
                      "Gmail/Outlook integration",
                      "Basic analytics",
                    ].map((feature, index) => (
                      <motion.li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-zinc-400"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Check className="h-4 w-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="bg-gradient-to-b from-blue-950/40 to-purple-950/40 border-blue-500/50 hover:border-blue-400/50 transition-all relative h-full">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Most Popular
                  </Badge>
                </motion.div>
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Pro</CardTitle>
                  <CardDescription className="text-zinc-300">
                    For serious job seekers
                  </CardDescription>
                  <div className="pt-4">
                    <motion.div
                      className="text-4xl font-bold text-white"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      $29
                    </motion.div>
                    <div className="text-zinc-300 text-sm">per month</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold">
                      Upgrade
                    </Button>
                  </motion.div>
                  <ul className="space-y-3 pt-4">
                    {benefits.map((feature, index) => (
                      <motion.li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-zinc-300"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Check className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Teams Plan */}
            <motion.div variants={itemVariants} whileHover={{ y: -10 }}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all h-full">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Teams</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Collaborate with your team
                  </CardDescription>
                  <div className="pt-4">
                    <motion.div
                      className="text-4xl font-bold text-white"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      $99
                    </motion.div>
                    <div className="text-zinc-400 text-sm">per month</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      disabled={true}
                      className="cursor-pointer w-full border-zinc-700 text-black hover:bg-zinc-300"
                    >
                      Coming Soon
                    </Button>
                  </motion.div>
                  <ul className="space-y-3 pt-4">
                    {[
                      "Everything in Pro",
                      "ReachHub workspaces",
                      "Up to 10 team members",
                      "Shared templates & analytics",
                      "Priority support",
                      "Custom integrations",
                    ].map((feature, index) => (
                      <motion.li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-zinc-400"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Check className="h-4 w-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Gamification Section */}
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
              {[
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
              ].map((badge, index) => (
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

      {/* CTA Section */}
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
    </div>
  );
}
