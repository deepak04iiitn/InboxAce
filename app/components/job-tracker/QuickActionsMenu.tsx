"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Trash2,
  Send,
  Calendar,
  Eye,
  Edit2,
  Layers,
  FileText,
} from "lucide-react";

interface QuickActionsMenuProps {
  x: number;
  y: number;
  jobId: string;
  onClose: () => void;
  onClone: () => void;
  onDelete: () => void;
  onSendNow: () => void;
}

export default function QuickActionsMenu({
  x,
  y,
  jobId,
  onClose,
  onClone,
  onDelete,
  onSendNow,
}: QuickActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to prevent menu from going off-screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  const menuItems = [
    {
      icon: Send,
      label: "Send Now",
      onClick: onSendNow,
      color: "text-green-400 hover:bg-green-900/30",
    },
    {
      icon: Copy,
      label: "Clone Row",
      onClick: onClone,
      color: "text-blue-400 hover:bg-blue-900/30",
    },
    {
      icon: Trash2,
      label: "Delete",
      onClick: onDelete,
      color: "text-red-400 hover:bg-red-900/30",
    },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden min-w-[200px]"
      style={{ left: x, top: y }}
    >
      <div className="py-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 text-sm transition ${item.color}`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
