"use client";

import { motion } from "framer-motion";
import { Calendar, Trash2, Layers, X, Send } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onSchedule: () => void;
  onDelete: () => void;
  onCreateBatch: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onSchedule,
  onDelete,
  onCreateBatch,
  onClearSelection,
}: BulkActionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-white font-semibold">
            {selectedCount} {selectedCount === 1 ? "job" : "jobs"} selected
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSchedule}
              className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Calendar size={18} />
              Schedule
            </button>

            <button
              onClick={onCreateBatch}
              className="cursor-pointer flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Layers size={18} />
              Create Batch
            </button>

            <button
              onClick={onDelete}
              className="cursor-pointer flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="cursor-pointer p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition"
          title="Clear selection"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
}
