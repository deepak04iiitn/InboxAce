"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Heart,
  Star,
  TrendingUp,
  Clock,
  Sparkles,
  X,
  Mail,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  tags: string[];
  usageCount: number;
  rating: number;
  ratingCount: number;
  likes: number;
  downloads: number;
  createdByName: string;
  createdAt: string;
  user: {
    name: string;
    profileImage: string;
  };
}

export default function CommunityTemplates() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    "ALL",
    "GENERAL",
    "TECH",
    "FINANCE",
    "MARKETING",
    "SALES",
    "DESIGN",
    "CONSULTING",
    "OTHER",
  ];

  const sortOptions = [
    { value: "recent", label: "Most Recent", icon: Clock },
    { value: "popular", label: "Most Popular", icon: TrendingUp },
    { value: "rating", label: "Highest Rated", icon: Star },
    { value: "likes", label: "Most Liked", icon: Heart },
  ];

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, sortBy, page, searchQuery]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        sortBy,
        page: page.toString(),
        limit: "12",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/templates/community?${params}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (templateId: string) => {
    if (!session) {
      toast.error("Please sign in to like templates");
      router.push(`/api/auth/signin?callbackUrl=/templates/community`);
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}/like`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(
          templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  likes: data.liked ? t.likes + 1 : t.likes - 1,
                }
              : t
          )
        );
      }
    } catch (error) {
      toast.error("Failed to like template");
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    if (!session) {
      toast.error("Please sign in to use templates");
      router.push(`/api/auth/signin?callbackUrl=/templates/community`);
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}/use`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Template added to your collection!");
        fetchTemplates();
      }
    } catch (error) {
      toast.error("Failed to use template");
    }
  };

  const openModal = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTemplate(null), 300);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 mt-20"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-500" />
            Community Templates
          </h1>
          <p className="text-gray-400">
            Discover and use templates created by the community
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search templates by name, subject, or tags..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex gap-2 overflow-x-auto">
            {sortOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setSortBy(value);
                  setPage(1);
                }}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  sortBy === value
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Templates Grid */}
        {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {[...Array(4)].map((_, i) => (
            <div
                key={i}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-700 animate-pulse"
            >
                <div className="h-8 bg-gray-800 rounded mb-6"></div>
                <div className="h-6 bg-gray-800 rounded mb-4"></div>
                <div className="h-24 bg-gray-800 rounded mb-6"></div>
                <div className="h-12 bg-gray-800 rounded"></div>
            </div>
            ))}
        </div>
        ) : templates.length === 0 ? (
        <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No templates found</p>
        </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {templates.map((template, index) => (
            <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/20 group"
            >
                {/* Header Section */}
                <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition mb-2">
                        {template.name}
                    </h3>
                    </div>
                    <span className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-full border border-blue-600/30 font-medium whitespace-nowrap">
                    {template.category}
                    </span>
                </div>
                
                {/* Subject Line */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Subject</p>
                        <p className="text-sm text-gray-200 font-medium break-words">
                        {template.subject}
                        </p>
                    </div>
                    </div>
                </div>
                
                {/* Body Preview */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Preview</p>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                    {template.body}
                    </p>
                </div>
                </div>

                {/* Stats Section */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="bg-pink-600/20 p-2 rounded-lg">
                    <Heart className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                    <p className="text-xs text-gray-500">Likes</p>
                    <p className="text-sm font-bold text-white">{template.likes}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600/20 p-2 rounded-lg">
                    <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                    <p className="text-xs text-gray-500">Uses</p>
                    <p className="text-sm font-bold text-white">{template.usageCount}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-yellow-600/20 p-2 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-sm font-bold text-white">{template.rating.toFixed(1)}</p>
                    </div>
                </div>
                </div>

                {/* Tags Section */}
                {template.tags.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-3 font-medium">Tags</p>
                    <div className="flex flex-wrap gap-2">
                    {template.tags.slice(0, 5).map((tag) => (
                        <span
                        key={tag}
                        className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1.5 rounded-full border border-gray-600"
                        >
                        {tag}
                        </span>
                    ))}
                    {template.tags.length > 5 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                        +{template.tags.length - 5} more
                        </span>
                    )}
                    </div>
                </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {template.createdByName?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                    {template.createdByName || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                    </p>
                </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleLike(template.id)}
                    className="bg-gray-700/50 cursor-pointer hover:bg-gray-700 border border-gray-600 hover:border-gray-500 px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                >
                    <Heart className="w-4 h-4" />
                    Like
                </button>
                <button
                    onClick={() => openModal(template)}
                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-sm"
                >
                    <Eye className="w-4 h-4" />
                    View Full
                </button>
                </div>
            </motion.div>
            ))}
        </div>
        )}


        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg transition ${
                    page === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Gmail-Style Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl"
            >
              {/* Modal Header - Gmail Style */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedTemplate.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs">
                        {selectedTemplate.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{selectedTemplate.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span>{selectedTemplate.likes}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white cursor-pointer transition p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {selectedTemplate.createdByName?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {selectedTemplate.createdByName || "Anonymous"}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Created {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body - Gmail Email Style */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {/* Email Preview Container */}
                <div className="bg-white text-black rounded-lg shadow-lg overflow-hidden">
                  {/* Email Header */}
                  <div className="bg-gray-50 border-b border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600 font-medium">
                        Email Preview
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Subject: {selectedTemplate.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>From: {selectedTemplate.createdByName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(selectedTemplate.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 bg-white">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                        {selectedTemplate.body}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedTemplate.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-800 p-6 border-t border-gray-700 flex gap-3">
                <button
                  onClick={() => handleLike(selectedTemplate.id)}
                  className="cursor-pointer flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Like Template
                </button>
                <button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate.id);
                    closeModal();
                  }}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Use This Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
