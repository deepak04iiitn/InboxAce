"use client";

import { motion } from "framer-motion";
import { X, Crown, Zap, Upload, CheckCircle } from "lucide-react";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export default function PremiumUpgradeModal({
  isOpen,
  onClose,
  feature,
}: PremiumUpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full overflow-hidden"
      >
        {/* Premium Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6 relative">
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gray-700 p-3 rounded-xl">
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Premium Feature</h2>
              <p className="text-gray-400 text-sm">Upgrade to unlock</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Feature Description */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature}</h3>
                    <p className="text-gray-400 text-sm">
                      This powerful feature is available for Plus and Pro subscribers.
                      Upgrade now to unlock unlimited potential!
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  What you'll get with Premium
                </h3>
                <div className="space-y-2">
                  {[
                    "Bulk CSV import for hundreds of jobs",
                    "Smart column auto-mapping",
                    "Unlimited email sending",
                    "Advanced scheduling options",
                    "Priority email delivery",
                    "Detailed analytics & insights",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing Options */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold mb-4">Choose Your Plan</h3>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-purple-500 transition cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-purple-400 font-semibold text-lg">Plus</div>
                    <div>
                      <div className="text-2xl font-bold text-white">₹99</div>
                      <div className="text-gray-400 text-xs text-right">per month</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Perfect for individuals and small teams</p>
                </div>

                <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-5 hover:border-purple-400 transition cursor-pointer relative">
                  <div className="absolute -top-3 left-4">
                    <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Popular
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-purple-400 font-semibold text-lg">Pro</div>
                    <div>
                      <div className="text-2xl font-bold text-white">₹199</div>
                      <div className="text-gray-400 text-xs text-right">per month</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">For professionals who need more power</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-semibold flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" />
                  Upgrade to Premium
                </button>
                <button
                  onClick={onClose}
                  className="cursor-pointer w-full bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-3 rounded-lg transition text-sm"
                >
                  Maybe Later
                </button>
              </div>

              {/* Trust Badge */}
              <div className="text-center text-xs text-gray-500">
                Cancel anytime • 30-day money-back guarantee
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}