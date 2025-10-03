"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  containerVariants: any;
  itemVariants: any;
}

export default function Hero({ containerVariants, itemVariants }: HeroProps) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const FloatingElement = ({ delay = 0, duration = 3 }: { delay?: number; duration?: number }) => (
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
  );
}