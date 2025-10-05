"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface ScheduleDialogProps {
  jobIds: string[];
  onClose: () => void;
  onSchedule: (jobIds: string[], scheduledFor: string) => void;
}

export default function ScheduleDialog({
  jobIds,
  onClose,
  onSchedule,
}: ScheduleDialogProps) {
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledFor) {
      toast.error("Please select a date and time");
      return;
    }

    const selectedDate = new Date(scheduledFor);
    const now = new Date();

    if (selectedDate <= now) {
      toast.error("Schedule time must be in the future");
      return;
    }

    setLoading(true);
    try {
      await onSchedule(jobIds, scheduledFor);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum datetime (current time + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Calendar className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Schedule Jobs</h2>
              <p className="text-sm text-gray-400">
                Scheduling {jobIds.length} {jobIds.length === 1 ? "job" : "jobs"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Schedule For
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                min={getMinDateTime()}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Emails will be sent at the specified time
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "In 1 hour", hours: 1 },
                { label: "In 4 hours", hours: 4 },
                { label: "Tomorrow 9 AM", hours: null, custom: true },
                { label: "Next Monday 9 AM", hours: null, custom: true },
              ].map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    const date = new Date();
                    if (option.hours) {
                      date.setHours(date.getHours() + option.hours);
                    } else if (option.label.includes("Tomorrow")) {
                      date.setDate(date.getDate() + 1);
                      date.setHours(9, 0, 0, 0);
                    } else if (option.label.includes("Monday")) {
                      const daysUntilMonday = (8 - date.getDay()) % 7 || 7;
                      date.setDate(date.getDate() + daysUntilMonday);
                      date.setHours(9, 0, 0, 0);
                    }
                    setScheduledFor(date.toISOString().slice(0, 16));
                  }}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !scheduledFor}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
