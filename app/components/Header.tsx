"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Layout, LogOut, User, MailCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };
    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Templates", href: "/templates/community", icon: Layout },
    { name: "Dashboard", href: "/dashboard/jobs-tracker", icon: MailCheck },
    { name: "ReachHub", href: "/reachhub/workspace" },
    { name: "InboxAce CLI", href: "#cli", badge: "Soon" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname?.startsWith(href);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-50 pointer-events-none" />
      
      <header
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-black/80 border-b border-white/10 shadow-2xl shadow-black/40"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center group relative z-10">
              <Image
                src="/InboxAce.png"
                alt="InboxAce Logo"
                width={100}
                height={100}
                className="rounded-lg"
              />
            </Link>

            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl group ${
                    isActive(item.href) ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.name}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl border border-blue-400/40 shadow-lg shadow-blue-500/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/20 group-hover:to-purple-600/20 rounded-xl transition-all duration-300" />
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {status === "loading" ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse" />
                  <div className="hidden lg:block space-y-2">
                    <div className="w-24 h-3 bg-gray-800 rounded animate-pulse" />
                    <div className="w-32 h-2 bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 hover:from-gray-800/80 hover:to-gray-700/80 border border-white/10 hover:border-blue-400/40 transition-all duration-300 group backdrop-blur-sm shadow-lg hover:shadow-blue-500/20"
                  >
                    {session.user?.profileImage ? (
                      <div className="relative">
                        <Image
                          src={session.user.profileImage}
                          alt="Profile"
                          width={36}
                          height={36}
                          className="rounded-full ring-2 ring-white/10 group-hover:ring-blue-400/50 transition-all duration-300"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {session.user?.name?.[0] || session.user?.email?.[0]}
                      </div>
                    )}
                    <div className="hidden lg:block text-left max-w-[150px]">
                      <p className="text-sm font-semibold text-white leading-none truncate">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 leading-none truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                      >
                        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                          <p className="text-sm font-semibold text-white truncate">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {session.user?.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/dashboard/jobs-tracker"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group"
                          >
                            <User className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/templates/my-templates"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group"
                          >
                            <Layout className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                            <span>My Templates</span>
                          </Link>
                          <div className="h-px bg-white/10 my-2" />
                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                          >
                            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => signIn("google", { prompt: "consent" })}
                    className="text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 rounded-xl px-5"
                  >
                    Sign In
                  </Button>
                  <Link href="#pricing">
                    <Button className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 rounded-xl overflow-hidden group">
                      <span className="relative z-10">Get Started</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-gradient-to-b from-gray-950 via-gray-900 to-black border-l border-white/10 shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/InboxAce.png"
                      alt="InboxAce"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      InboxAce
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                  >
                    <X size={24} />
                  </button>
                </div>

                <nav className="space-y-2 mb-8">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-400/40 text-white shadow-lg shadow-blue-500/20"
                            : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && <item.icon className="w-5 h-5" />}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="border-t border-white/10 pt-6">
                  {status === "loading" ? (
                    <div className="space-y-3">
                      <div className="h-14 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl animate-pulse" />
                      <div className="h-14 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl animate-pulse" />
                    </div>
                  ) : session ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl border border-white/10 mb-4 backdrop-blur-sm">
                        {session.user?.profileImage ? (
                          <div className="relative">
                            <Image
                              src={session.user.profileImage}
                              alt="Profile"
                              width={48}
                              height={48}
                              className="rounded-full ring-2 ring-white/20"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {session.user?.name?.[0] || session.user?.email?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Link
                          href="/dashboard/jobs-tracker"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group"
                        >
                          <User className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/templates/my-templates"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group"
                        >
                          <Layout className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                          <span>My Templates</span>
                        </Link>
                        <div className="h-px bg-white/10 my-2" />
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
                        >
                          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsMenuOpen(false);
                          signIn("google", { prompt: "consent" });
                        }}
                        className="w-full border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-xl py-6"
                      >
                        Sign In
                      </Button>
                      <Link href="#pricing">
                        <Button
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/30 rounded-xl py-6 relative overflow-hidden group"
                        >
                          <span className="relative z-10">Get Started</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}