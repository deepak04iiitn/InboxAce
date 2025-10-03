"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "ReachHub", href: "#reachhub" },
    { name: "Analytics", href: "#analytics" },
  ];

  return (
    <header
      className={`fixed w-full z-30 transition-all ${
        scrolled
          ? "backdrop-blur bg-black/80 border-b border-zinc-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>InboxAce</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-zinc-300 hover:text-white transition font-medium"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth & CTA */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-zinc-400">Loading...</span>
          ) : session ? (
            <div className="flex items-center gap-2">
              {session.user?.profileImage && (
                <Image
                  src={session.user.profileImage}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full border border-zinc-700"
                />
              )}
              <span className="text-zinc-200 text-sm hidden sm:block">
                {session.user?.email}
              </span>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white ml-2"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  signIn("google", {
                    prompt: "consent", // ensures correct scopes requested
                  })
                }
                className="border-blue-600 text-blue-500 hover:bg-blue-50"
              >
                Sign In with Google
              </Button>
              <Link href="#pricing">
                <Button className="bg-blue-600 text-white font-semibold ml-2">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-zinc-300 hover:text-white transition-colors ml-2"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed inset-y-0 right-0 w-64 bg-zinc-900 border-l border-zinc-800 shadow-lg z-50 p-7 flex flex-col gap-5"
          >
            <button
              className="self-end mb-3 text-zinc-400 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={24} />
            </button>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="py-2 text-zinc-100 font-medium text-lg hover:text-blue-400 transition"
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              {status === "loading" ? (
                <span className="text-zinc-400">Loading...</span>
              ) : session ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    {session.user?.profileImage && (
                      <Image
                        src={session.user.profileImage}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full border border-zinc-700"
                      />
                    )}
                    <span className="text-zinc-200 text-sm">
                      {session.user?.email}
                    </span>
                  </div>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsMenuOpen(false);
                      signIn("google", { prompt: "consent" });
                    }}
                    className="border-blue-600 text-blue-500"
                  >
                    Sign In with Google
                  </Button>
                  <Link href="#pricing">
                    <Button
                      className="bg-blue-600 text-white font-semibold mt-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
