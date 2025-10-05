import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailAccount {
  email: string;
  provider: string;
  dailyLimit: number;
  sentToday: number;
}

interface EmailStatusResponse {
  success: boolean;
  hasEmailAccount: boolean;
  primaryAccount?: {
    email: string;
    provider: string;
  };
  emailAccounts?: EmailAccount[];
  message?: string;
  error?: string;
  code?: string;
}

interface EmailAccountStatusProps {
  onStatusChange?: (hasAccount: boolean) => void;
}

export default function EmailAccountStatus({ onStatusChange }: EmailAccountStatusProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [status, setStatus] = useState<EmailStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkEmailAccountStatus();
  }, []);

  useEffect(() => {
    if (status && onStatusChange) {
      onStatusChange(status.hasEmailAccount);
    }
  }, [status, onStatusChange]);

  const checkEmailAccountStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-account/connect');
      const data: EmailStatusResponse = await response.json();
      
      if (data.success) {
        setStatus(data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to check email status:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectEmailAccount = async (): Promise<void> => {
    try {
      setConnecting(true);
      setError(null);
      
      const response = await fetch('/api/email-account/connect', {
        method: 'POST',
      });
      
      const data: EmailStatusResponse = await response.json();
      
      if (data.success) {
        setStatus(prev => prev ? { ...prev, hasEmailAccount: true } : null);
        alert(data.message);
        checkEmailAccountStatus();
      } else {
        setError(data.error || 'Failed to connect email account');
        
        if (data.code === 'NO_GOOGLE_ACCOUNT') {
          alert('Please sign out and sign in again with Google to grant email permissions.');
        }
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect email account. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-xl"></div>
        <div className="relative flex items-center justify-center p-6 bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-800">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400 mr-3" />
          <span className="text-gray-300 font-medium">Checking email connection status...</span>
        </div>
      </motion.div>
    );
  }

  if (status?.hasEmailAccount) {
    const account = status.emailAccounts?.[0];
    const usagePercentage = account ? (account.sentToday / account.dailyLimit) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden group"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-green-400 font-bold text-lg">
                  Email Connected
                </h3>
                <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                  Active
                </span>
              </div>

              {status.primaryAccount && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-medium">{status.primaryAccount.email}</span>
                    <span className="px-2 py-0.5 bg-gray-800 rounded-md text-gray-400 text-xs">
                      {status.primaryAccount.provider}
                    </span>
                  </div>

                  {account && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Daily Usage</span>
                        <span className="text-white font-semibold">
                          {account.sentToday} / {account.dailyLimit}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${usagePercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={checkEmailAccountStatus}
                className="mt-4 flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition group"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Refresh Status
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-yellow-500/5 blur-xl animate-pulse"></div>
      
      <div className="relative p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-lg rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-yellow-400 font-bold text-lg">
                Connect Email Account
              </h3>
              <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-semibold">
                Required
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Connect your Gmail account to unlock email automation, tracking, and analytics features.
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={connectEmailAccount}
              disabled={connecting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition font-semibold shadow-lg shadow-purple-500/25"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Connect Gmail Account
                </>
              )}
            </motion.button>

            <div className="mt-4 flex items-start gap-2 text-gray-500 text-xs">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Secure OAuth 2.0 authentication. We never store your password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
