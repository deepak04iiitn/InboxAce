import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Search, Check, Star } from "lucide-react";

interface DefaultTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelected: () => void;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  rating: number;
  usageCount: number;
  likes: number;
}

export default function DefaultTemplateModal({ isOpen, onClose, onTemplateSelected }: DefaultTemplateModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/templates/community?sortBy=popular&limit=50");
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetDefault = async () => {
    if (!selectedTemplateId) {
      alert("Please select a template");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/user/default-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplateId }),
      });

      const data = await response.json();

      if (data.success) {
        onTemplateSelected();
        onClose();
      } else {
        alert(data.error || "Failed to set default template");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-7 h-7 text-purple-400" />
                  Select Your Default Template
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  This template will be automatically applied to all your job applications. You can customize it for each job.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search templates by name, subject, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/50 rounded-xl p-4 animate-pulse"
                  >
                    <div className="h-5 bg-gray-700 rounded mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No templates found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`group relative cursor-pointer bg-gray-800/50 hover:bg-gray-800 border-2 rounded-xl p-4 transition-all duration-200 ${
                      selectedTemplateId === template.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className="absolute top-3 right-3">
                      {selectedTemplateId === template.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-purple-500 rounded-full p-1"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="pr-8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-600/30">
                          {template.category}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{template.rating?.toFixed(1) || "0.0"}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                        {template.name}
                      </h3>

                      <div className="bg-gray-900/50 rounded-lg p-2 mb-2">
                        <p className="text-xs text-gray-400 mb-1">Subject:</p>
                        <p className="text-sm text-white font-medium line-clamp-1">
                          {template.subject}
                        </p>
                      </div>

                      <div className="bg-gray-900/30 rounded-lg p-2">
                        <p className="text-xs text-gray-400 mb-1">Preview:</p>
                        <p className="text-xs text-gray-300 line-clamp-2">
                          {template.body}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                        <span>{template.usageCount} uses</span>
                        <span>{template.likes} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-900 border-t border-gray-800 p-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {selectedTemplateId && (
                <span className="text-purple-400 font-medium">
                  Template selected! You can customize it for each job.
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSetDefault}
                disabled={!selectedTemplateId || submitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Setting..." : "Set as Default"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}