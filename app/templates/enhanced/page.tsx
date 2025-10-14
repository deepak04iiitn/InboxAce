"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Download,
  Share2,
  Zap,
  Target,
  Clock,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import EnhancedTemplateBuilder from "@/components/templates/EnhancedTemplateBuilder";
import TemplateSettings from "@/components/settings/TemplateSettings";
import { TEMPLATE_TYPES, TEMPLATE_CATEGORIES } from "@/lib/template-variables";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  description?: string;
  category: string;
  templateType: string;
  tags: string[];
  isPublic: boolean;
  isCommunity: boolean;
  usageCount: number;
  rating: number;
  ratingCount: number;
  difficultyLevel?: string;
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  likes: number;
  downloads: number;
}

export default function EnhancedTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showBuilder, setShowBuilder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates/my-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesType = selectedType === "All" || template.templateType === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Template];
    let bValue: any = b[sortBy as keyof Template];
    
    if (sortBy === "createdAt" || sortBy === "updatedAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getTemplateTypeIcon = (type: string) => {
    const typeConfig = TEMPLATE_TYPES.find(t => t.value === type);
    return typeConfig?.icon || "📧";
  };

  const getCategoryIcon = (category: string) => {
    const categoryConfig = TEMPLATE_CATEGORIES.find(c => c.value === category);
    return categoryConfig?.icon || "📋";
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "EASY": return "text-green-400 bg-green-400/20";
      case "MEDIUM": return "text-yellow-400 bg-yellow-400/20";
      case "ADVANCED": return "text-red-400 bg-red-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
        toast.success("Template deleted successfully");
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("An error occurred while deleting the template");
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const response = await fetch("/api/templates/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...template,
          name: `${template.name} (Copy)`,
          isPublic: false,
          isCommunity: false,
        }),
      });
      
      if (response.ok) {
        await fetchTemplates();
        toast.success("Template duplicated successfully");
      } else {
        toast.error("Failed to duplicate template");
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("An error occurred while duplicating the template");
    }
  };

  if (showBuilder) {
    return (
      <EnhancedTemplateBuilder 
        onTemplateCreated={() => {
          setShowBuilder(false);
          fetchTemplates();
        }} 
      />
    );
  }

  if (showSettings) {
    return (
      <TemplateSettings 
        userId="current-user"
        onBack={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
                Enhanced Template Library
              </h1>
              <p className="text-gray-400">
                Manage your dynamic email templates with 50+ variables across multiple categories
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => setShowBuilder(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Template
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{templates.length}</p>
                  <p className="text-sm text-gray-400">Total Templates</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {templates.reduce((acc, t) => acc + t.usageCount, 0)}
                  </p>
                  <p className="text-sm text-gray-400">Total Uses</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {templates.filter(t => t.isPublic || t.isCommunity).length}
                  </p>
                  <p className="text-sm text-gray-400">Public Templates</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {templates.length > 0 
                      ? (templates.reduce((acc, t) => acc + t.rating, 0) / templates.length).toFixed(1)
                      : "0.0"
                    }
                  </p>
                  <p className="text-sm text-gray-400">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="All">All Categories</option>
              {TEMPLATE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="All">All Types</option>
              {TEMPLATE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="usageCount-desc">Most Used</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))
          ) : sortedTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || selectedCategory !== "All" || selectedType !== "All"
                  ? "Try adjusting your filters or search terms"
                  : "Create your first template to get started"
                }
              </p>
              <button
                onClick={() => setShowBuilder(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg transition flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Template
              </button>
            </div>
          ) : (
            sortedTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getTemplateTypeIcon(template.templateType)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{getCategoryIcon(template.category)}</span>
                        <span>{TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                    >
                      {expandedTemplate === template.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {template.description || template.subject}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.usageCount} uses
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {template.rating.toFixed(1)}
                  </span>
                  {template.difficultyLevel && (
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(template.difficultyLevel)}`}>
                      {template.difficultyLevel}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-600/30"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{template.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="p-2 hover:bg-gray-700 rounded transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="p-2 hover:bg-gray-700 rounded transition"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 hover:bg-gray-700 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {template.isPublic && (
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-600/30">
                        Public
                      </span>
                    )}
                    {template.isCommunity && (
                      <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30">
                        Community
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTemplate === template.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-1">Subject:</h4>
                        <p className="text-sm text-gray-400">{template.subject}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-1">Body Preview:</h4>
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {template.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      </div>
                      
                      {template.targetAudience && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-1">Target Audience:</h4>
                          <p className="text-sm text-gray-400">{template.targetAudience}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
