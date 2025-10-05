"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Layers, Users } from "lucide-react";
import { toast } from "sonner";

interface BatchCreationDialogProps {
  jobIds: string[];
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export default function BatchCreationDialog({
  jobIds,
  onClose,
  onCreate,
}: BatchCreationDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a batch name");
      return;
    }

    setLoading(true);
    try {
      await onCreate(name, description);
    } finally {
      setLoading(false);
    }
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
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <Layers className="text-orange-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Batch</h2>
              <p className="text-sm text-gray-400">
                Group {jobIds.length} {jobIds.length === 1 ? "job" : "jobs"} into a batch
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
          {/* Batch Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Batch Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q1 2025 Outreach"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              maxLength={100}
            />
          </div>

          {/* Batch Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this batch..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-400">
              {description.length}/500 characters
            </p>
          </div>

          {/* Job Count Info */}
          <div className="mb-6 p-4 bg-orange-900/20 border border-orange-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="text-orange-400" size={20} />
              <div>
                <p className="text-sm font-medium text-white">
                  {jobIds.length} Jobs Selected
                </p>
                <p className="text-xs text-gray-400">
                  All selected jobs will be added to this batch
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
