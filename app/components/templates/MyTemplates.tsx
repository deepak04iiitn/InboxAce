"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Edit, Trash, Eye, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  tags: string[];
  usageCount: number;
  rating: number;
  isPublic: boolean;
  isCommunity: boolean;
  createdAt: string;
}

export default function MyTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates/my-templates");
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Template deleted");
        setTemplates(templates.filter((t) => t.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
            My Templates
          </h1>
          <p className="text-gray-400">Manage your custom email templates</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">No templates yet</p>
            <a
              href="/templates/create"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Create Your First Template
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition mb-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {template.isPublic && (
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                        Public
                      </span>
                    )}
                    {template.isCommunity && (
                      <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                        Community
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {template.subject}
                </p>

                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <div>Category: {template.category}</div>
                  <div>Used: {template.usageCount}×</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Trash className="w-4 h-4" />
                    Delete
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
