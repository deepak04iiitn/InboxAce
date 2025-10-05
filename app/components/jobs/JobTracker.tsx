"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Upload,
  Users,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  AlertCircle,
  TrendingUp,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import JobForm from "./JobForm";
import JobDetailsDialog from "./JobDetailsDialog";
import BulkImportDialog from "./BulkImportDialog";
import BatchJobDialog from "./BatchJobDialog";
import EmailAccountStatus from "./EmailAccountStatus";

interface Job {
  id: string;
  recipientName: string;
  position: string;
  company: string;
  recipientEmail: string;
  status: string;
  sentAt: string | null;
  gotReply: boolean;
  followUpsSent: number;
  createdAt: string;
  notes: string | null;
  tags: string[];
}

export default function JobTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showJobForm, setShowJobForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [hasEmailAccount, setHasEmailAccount] = useState(false);

  useEffect(() => {
    fetchJobs();
    checkEmailStatus();
  }, [statusFilter]);

  const checkEmailStatus = async () => {
    try {
      const response = await fetch('/api/email-account/connect');
      const data = await response.json();
      setHasEmailAccount(data.hasEmailAccount);
    } catch (error) {
      console.error('Failed to check email status:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = () => {
    if (!hasEmailAccount) {
      toast.error("Please connect your email account first");
      return;
    }
    setShowJobForm(true);
  };

  const handleBulkImport = () => {
    if (!hasEmailAccount) {
      toast.error("Please connect your email account first");
      return;
    }
    setShowBulkImport(true);
  };

  const handleBatchDialog = () => {
    if (!hasEmailAccount) {
      toast.error("Please connect your email account first");
      return;
    }
    setShowBatchDialog(true);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: jobs.length,
    notSent: jobs.filter((j) => j.status === "NOT_SENT").length,
    sent: jobs.filter((j) => j.status === "SENT" || j.status === "FOLLOW_UP_SENT").length,
    replied: jobs.filter((j) => j.gotReply).length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "NOT_SENT":
        return <Clock className="w-4 h-4" />;
      case "SENT":
      case "FOLLOW_UP_SENT":
        return <Mail className="w-4 h-4" />;
      case "REPLIED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_SENT":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "SENT":
      case "FOLLOW_UP_SENT":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "REPLIED":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  // Calculate analytics
  const replyRate = stats.total > 0 ? ((stats.replied / stats.sent) * 100 || 0).toFixed(1) : 0;
  const sendRate = stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Job Tracker
                </span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg">
                Manage and track all your job applications
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkImport}
                disabled={!hasEmailAccount}
                className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-4 py-2.5 rounded-xl border border-purple-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Import</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBatchDialog}
                disabled={!hasEmailAccount}
                className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl border border-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Create Batch</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddJob}
                disabled={!hasEmailAccount}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl transition shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Job
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* LEFT COLUMN - Job Table */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition" />
                <input
                  type="text"
                  placeholder="Search jobs by name, company, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition backdrop-blur-xl"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition backdrop-blur-xl cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="NOT_SENT">Not Sent</option>
                <option value="SENT">Sent</option>
                <option value="FOLLOW_UP_SENT">Follow-up Sent</option>
                <option value="REPLIED">Replied</option>
              </select>
            </motion.div>

            {/* Jobs Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
                  </div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4 text-lg">No jobs found</p>
                  <button
                    onClick={handleAddJob}
                    disabled={!hasEmailAccount}
                    className="text-purple-400 hover:text-purple-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hasEmailAccount ? "Add your first job" : "Connect email to add jobs"}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/70 backdrop-blur-xl">
                      <tr>
                        <th className="text-left px-4 sm:px-6 py-4 text-gray-400 font-semibold text-xs sm:text-sm">
                          Recipient
                        </th>
                        <th className="text-left px-4 sm:px-6 py-4 text-gray-400 font-semibold text-xs sm:text-sm hidden md:table-cell">
                          Position
                        </th>
                        <th className="text-left px-4 sm:px-6 py-4 text-gray-400 font-semibold text-xs sm:text-sm hidden lg:table-cell">
                          Company
                        </th>
                        <th className="text-left px-4 sm:px-6 py-4 text-gray-400 font-semibold text-xs sm:text-sm">
                          Status
                        </th>
                        <th className="text-left px-4 sm:px-6 py-4 text-gray-400 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                          Follow-ups
                        </th>
                        <th className="text-left px-4 sm:px-6 py-4 text-gray-400 font-semibold text-xs sm:text-sm hidden xl:table-cell">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job, index) => (
                        <motion.tr
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedJob(job)}
                          className="border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 group"
                        >
                          <td className="px-4 sm:px-6 py-4">
                            <div className="text-white font-medium text-sm sm:text-base group-hover:text-purple-400 transition">
                              {job.recipientName}
                            </div>
                            <div className="text-gray-500 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">
                              {job.recipientEmail}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-white text-sm sm:text-base hidden md:table-cell">
                            {job.position}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-white text-sm sm:text-base hidden lg:table-cell">
                            {job.company}
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium ${getStatusColor(
                                job.status
                              )}`}
                            >
                              {getStatusIcon(job.status)}
                              <span className="hidden sm:inline">{job.status.replace("_", " ")}</span>
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-white text-sm sm:text-base hidden sm:table-cell">
                            <span className="inline-flex items-center justify-center bg-gray-800 rounded-full w-8 h-8 text-sm font-semibold">
                              {job.followUpsSent}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs sm:text-sm hidden xl:table-cell">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN - Analytics & Email Status */}
          <div className="space-y-6">
            {/* Email Connection Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <EmailAccountStatus onStatusChange={setHasEmailAccount} />
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Total Jobs */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">Total Jobs</span>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stats.total}
                  </div>
                </div>
              </div>

              {/* Not Sent */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 hover:border-yellow-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">Not Sent</span>
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {stats.notSent}
                  </div>
                </div>
              </div>

              {/* Sent */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">Sent</span>
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {stats.sent}
                  </div>
                </div>
              </div>

              {/* Replied */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 hover:border-green-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">Replied</span>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {stats.replied}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analytics Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Analytics</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Reply Rate</span>
                      <span className="text-green-400 font-bold">{replyRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${replyRate}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Send Rate</span>
                      <span className="text-blue-400 font-bold">{sendRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sendRate}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Average Follow-ups</span>
                      <span className="text-purple-400 font-bold">
                        {stats.total > 0 ? (jobs.reduce((acc, job) => acc + job.followUpsSent, 0) / stats.total).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AnimatePresence>
        {showJobForm && (
          <JobForm
            onClose={() => setShowJobForm(false)}
            onSuccess={() => {
              setShowJobForm(false);
              fetchJobs();
            }}
          />
        )}

        {showBulkImport && (
          <BulkImportDialog
            onClose={() => setShowBulkImport(false)}
            onSuccess={() => {
              setShowBulkImport(false);
              fetchJobs();
            }}
          />
        )}

        {showBatchDialog && (
          <BatchJobDialog
            onClose={() => setShowBatchDialog(false)}
            onSuccess={() => {
              setShowBatchDialog(false);
              fetchJobs();
            }}
          />
        )}

        {selectedJob && (
          <JobDetailsDialog
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onUpdate={fetchJobs}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
