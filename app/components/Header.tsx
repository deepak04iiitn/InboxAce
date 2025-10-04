"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Layout, LogOut, User as UserIcon } from "lucide-react";
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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };
    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  // Navigation links
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Templates", href: "/templates/community", icon: Layout },
    { name: "Pricing", href: "#pricing" },
    { name: "ReachHub", href: "#reachhub" },
    { name: "Analytics", href: "#analytics" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname?.startsWith(href);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-lg bg-black/90 border-b border-gray-800/50 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              <Image
                src="/InboxAce.png"
                alt="InboxAce Logo"
                width={42}
                height={42}
                className="relative rounded-full ring-2 ring-gray-800 group-hover:ring-blue-500/50 transition-all"
              />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:block">
              InboxAce
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg group ${
                  isActive(item.href)
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.name}
                </span>
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          {/* Auth & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
                <div className="w-20 h-4 bg-gray-800 rounded animate-pulse" />
              </div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 hover:border-gray-600 transition-all group"
                >
                  {session.user?.profileImage ? (
                    <Image
                      src={session.user.profileImage}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-gray-700 group-hover:ring-blue-500/50 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {session.user?.name?.[0] || session.user?.email?.[0]}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white leading-none">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-none">
                      {session.user?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-gray-800 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                        <p className="text-sm font-medium text-white">
                          {session.user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                        >
                          <UserIcon className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/templates/my-templates"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                        >
                          <Layout className="w-4 h-4" />
                          My Templates
                        </Link>
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => signIn("google", { prompt: "consent" })}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-all"
                >
                  Sign In
                </Button>
                <Link href="#pricing">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-gradient-to-b from-gray-900 to-black border-l border-gray-800 shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="space-y-2 mb-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth Section */}
                <div className="border-t border-gray-800 pt-6">
                  {status === "loading" ? (
                    <div className="space-y-3">
                      <div className="h-12 bg-gray-800 rounded-lg animate-pulse" />
                      <div className="h-12 bg-gray-800 rounded-lg animate-pulse" />
                    </div>
                  ) : session ? (
                    <>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 mb-4">
                        {session.user?.profileImage ? (
                          <Image
                            src={session.user.profileImage}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="rounded-full ring-2 ring-gray-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {session.user?.name?.[0] || session.user?.email?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                        >
                          <UserIcon className="w-5 h-5" />
                          Dashboard
                        </Link>
                        <Link
                          href="/templates/my-templates"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                        >
                          <Layout className="w-5 h-5" />
                          My Templates
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-all"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsMenuOpen(false);
                          signIn("google", { prompt: "consent" });
                        }}
                        className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                      >
                        Sign In
                      </Button>
                      <Link href="#pricing">
                        <Button
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30"
                        >
                          Get Started
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
    </header>
  );
}
