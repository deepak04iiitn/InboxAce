"use client";

import Link from "next/link";
import { Mail, Github, Twitter, Linkedin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Footer() {
  const footerLinks = {
    product: ["Features", "Pricing", "ReachHub", "Templates", "Integrations"],
    resources: [
      "Documentation",
      "API Reference",
      "Blog",
      "Community",
      "Support",
    ],
    company: [
      "About Us",
      "Careers",
      "Privacy Policy",
      "Terms of Service",
      "Contact",
    ],
  };

  const socialLinks = [
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Github, label: "GitHub", href: "#" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Brand */}
          <motion.div className="space-y-4" variants={itemVariants}>
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
                        width={150}        
                        height={150}
                        className="group-hover:opacity-80 transition-opacity"
                    />
                </motion.div>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Revolutionize your job outreach with AI-powered automation, smart
              analytics, and collaborative workspaces.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="text-zinc-400 hover:text-blue-500 transition-colors"
                  aria-label={social.label}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Product */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <motion.li
                  key={link}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm transition-colors relative group inline-block"
                  >
                    {link}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <motion.li
                  key={link}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm transition-colors relative group inline-block"
                  >
                    {link}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <motion.li
                  key={link}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm transition-colors relative group inline-block"
                  >
                    {link}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="pt-8 border-t border-zinc-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-zinc-500 text-sm">
              © 2025 InboxAce. All rights reserved.
            </p>
            <motion.p
              className="text-zinc-500 text-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              Built with ❤️ for job seekers worldwide
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
