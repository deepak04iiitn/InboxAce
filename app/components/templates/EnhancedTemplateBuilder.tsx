"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Eye, 
  Sparkles, 
  Tag, 
  Folder, 
  Send, 
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  Clock,
  Users,
  Target,
  Zap,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { 
  VARIABLE_CATEGORIES, 
  TEMPLATE_TYPES, 
  TEMPLATE_CATEGORIES,
  searchVariables,
  getVariablesByCategory 
} from "@/lib/template-variables";

interface EnhancedTemplateBuilderProps {
  onTemplateCreated?: () => void;
}

export default function EnhancedTemplateBuilder({ onTemplateCreated }: EnhancedTemplateBuilderProps) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    description: "",
    category: "GENERAL",
    templateType: "APPLICATION",
    tags: [] as string[],
    isPublic: false,
    isCommunity: false,
    difficultyLevel: "EASY",
    targetAudience: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedVariables, setCopiedVariables] = useState<Set<string>>(new Set());
  const [showSubjectSearch, setShowSubjectSearch] = useState(false);
  const [showBodySearch, setShowBodySearch] = useState(false);
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  const [activeField, setActiveField] = useState<"subject" | "body" | null>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-dropdown') && !target.closest('button[title="Search variables"]')) {
        closeFieldSearch();
      }
    };

    if (showSubjectSearch || showBodySearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSubjectSearch, showBodySearch]);

  // Filter variables based on search and category
  const filteredVariables = searchQuery 
    ? searchVariables(searchQuery)
    : selectedCategory === "All" 
      ? VARIABLE_CATEGORIES.flatMap(cat => cat.variables)
      : getVariablesByCategory(selectedCategory);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim().toLowerCase()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const insertVariable = (variable: string, field: "subject" | "body") => {
    const textarea = document.getElementById(field) as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData[field];
    const newText = text.substring(0, start) + variable + text.substring(end);
    
    setFormData({ ...formData, [field]: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const copyVariable = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable);
      setCopiedVariables(prev => new Set([...prev, variable]));
      toast.success(`Copied ${variable} to clipboard`);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedVariables(prev => {
          const newSet = new Set(prev);
          newSet.delete(variable);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy variable:', error);
      toast.error('Failed to copy variable');
    }
  };

  // Field search functionality
  const fieldSearchVariables = fieldSearchQuery 
    ? searchVariables(fieldSearchQuery)
    : VARIABLE_CATEGORIES.flatMap(cat => cat.variables).slice(0, 8); // Show top 8 most common variables

  const toggleFieldSearch = (field: "subject" | "body") => {
    if (field === "subject") {
      setShowSubjectSearch(!showSubjectSearch);
      setShowBodySearch(false); // Close body search if open
    } else {
      setShowBodySearch(!showBodySearch);
      setShowSubjectSearch(false); // Close subject search if open
    }
    setActiveField(showSubjectSearch || showBodySearch ? null : field);
    if (!showSubjectSearch && !showBodySearch) {
      setFieldSearchQuery("");
    }
  };

  const closeFieldSearch = () => {
    setShowSubjectSearch(false);
    setShowBodySearch(false);
    setActiveField(null);
    setFieldSearchQuery("");
  };

  const handleFieldVariableClick = (variable: string, field: "subject" | "body") => {
    insertVariable(variable, field);
    closeFieldSearch();
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== ENHANCED TEMPLATE SUBMISSION STARTED ===");
    console.log("Form Data:", formData);
    
    setLoading(true);

    try {
      const response = await fetch("/api/templates/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Template created successfully!");
        console.log("✅ Template created:", data.template);
        
        // Reset form
        setFormData({
          name: "",
          subject: "",
          body: "",
          description: "",
          category: "GENERAL",
          templateType: "APPLICATION",
          tags: [],
          isPublic: false,
          isCommunity: false,
          difficultyLevel: "EASY",
          targetAudience: "",
        });
        
        onTemplateCreated?.();
      } else {
        console.error("❌ Error:", data.error);
        toast.error(data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("❌ Exception:", error);
      toast.error("An error occurred while creating the template");
    } finally {
      setLoading(false);
      console.log("=== ENHANCED TEMPLATE SUBMISSION ENDED ===");
    }
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Enhanced Template Builder
          </h1>
          <p className="text-gray-400">
            Create dynamic, adaptable email templates with 50+ variables across multiple categories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-16">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl"
            >
              {/* Template Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="e.g., Senior Software Engineer Application"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[80px] resize-none"
                  placeholder="Brief description of this template's purpose and use case..."
                />
              </div>

              {/* Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Template Type
                  </label>
                  <select
                    value={formData.templateType}
                    onChange={(e) =>
                      setFormData({ ...formData, templateType: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-6 relative">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Subject
                </label>
                <div className="relative">
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="e.g., {{recipientName}} - {{position}} Application at {{company}}"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleFieldSearch("subject")}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition ${
                      showSubjectSearch 
                        ? 'text-blue-400 bg-blue-400/20' 
                        : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                    }`}
                    title="Search variables"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Subject Variable Search Dropdown */}
                <AnimatePresence>
                  {showSubjectSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="search-dropdown absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                    >
                    <div className="p-3 border-b border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search variables..."
                          value={fieldSearchQuery}
                          onChange={(e) => setFieldSearchQuery(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {fieldSearchVariables.slice(0, 10).map((variable) => (
                        <button
                          key={variable.key}
                          type="button"
                          onClick={() => handleFieldVariableClick(variable.key, "subject")}
                          className="w-full text-left p-2 hover:bg-gray-700 rounded-lg transition flex items-center justify-between group"
                        >
                          <div className="flex-1">
                            <code className="text-blue-400 text-sm font-mono">{variable.key}</code>
                            <p className="text-xs text-gray-400 mt-1">{variable.displayName}</p>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition" />
                        </button>
                      ))}
                      {fieldSearchVariables.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          No variables found
                        </div>
                      )}
                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Body */}
              <div className="mb-6 relative">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Body
                </label>
                <div className="relative">
                  <textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({ ...formData, body: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[300px] font-mono text-sm resize-none"
                    placeholder="Hi {{recipientName}},&#10;&#10;I am writing to express my interest in the {{position}} position at {{company}}..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleFieldSearch("body")}
                    className={`absolute right-3 top-3 p-1 rounded transition ${
                      showBodySearch 
                        ? 'text-blue-400 bg-blue-400/20' 
                        : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                    }`}
                    title="Search variables"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Body Variable Search Dropdown */}
                <AnimatePresence>
                  {showBodySearch && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="search-dropdown absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                    >
                    <div className="p-3 border-b border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search variables..."
                          value={fieldSearchQuery}
                          onChange={(e) => setFieldSearchQuery(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {fieldSearchVariables.slice(0, 10).map((variable) => (
                        <button
                          key={variable.key}
                          type="button"
                          onClick={() => handleFieldVariableClick(variable.key, "body")}
                          className="w-full text-left p-2 hover:bg-gray-700 rounded-lg transition flex items-center justify-between group"
                        >
                          <div className="flex-1">
                            <code className="text-blue-400 text-sm font-mono">{variable.key}</code>
                            <p className="text-xs text-gray-400 mt-1">{variable.displayName}</p>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition" />
                        </button>
                      ))}
                      {fieldSearchVariables.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          No variables found
                        </div>
                      )}
                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Advanced Options */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition"
                >
                  <Zap className="w-4 h-4" />
                  Advanced Options
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Difficulty Level
                          </label>
                          <select
                            value={formData.difficultyLevel}
                            onChange={(e) =>
                              setFormData({ ...formData, difficultyLevel: e.target.value })
                            }
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          >
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="ADVANCED">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Target Audience
                          </label>
                          <input
                            type="text"
                            value={formData.targetAudience}
                            onChange={(e) =>
                              setFormData({ ...formData, targetAudience: e.target.value })
                            }
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="e.g., Entry-level developers"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Add tags (press Enter)"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer px-4 py-2 rounded-lg transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Visibility Options */}
              <div className="mb-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Make this template public</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCommunity}
                    onChange={(e) =>
                      setFormData({ ...formData, isCommunity: e.target.checked })
                    }
                    className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Share with community
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsPreview(!isPreview)}
                  className="cursor-pointer flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  {isPreview ? "Edit" : "Preview"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Template
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>

          {/* Variables Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl sticky top-6 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700 px-6 py-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  {isPreview ? "Email Preview" : "Template Variables"}
                </h3>
              </div>
              
              <div className="p-6">
                {isPreview ? (
                  <div className="space-y-6">
                    {/* Email Preview Card */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                      {/* Email Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {formData.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{formData.name}</p>
                            <p className="text-xs text-gray-500">{TEMPLATE_TYPES.find(t => t.value === formData.templateType)?.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Send className="w-3 h-3" />
                          <span>To: recipient@company.com</span>
                        </div>
                      </div>
                      
                      {/* Email Subject */}
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Subject</p>
                        <p className="text-base font-semibold text-gray-800">
                          {formData.subject || "Your email subject will appear here"}
                        </p>
                      </div>
                      
                      {/* Email Body */}
                      <div className="px-6 py-6 bg-white">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                          {formData.body || <span className="text-gray-400 italic">Your email body will appear here...</span>}
                        </div>
                      </div>
                      
                      {/* Email Footer */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Best regards,<br />
                          <span className="font-semibold text-gray-700">Your Name</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Template Info */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-blue-400" />
                        <p className="text-sm font-semibold text-gray-300">Template Details</p>
                      </div>
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="text-white">{TEMPLATE_CATEGORIES.find(c => c.value === formData.category)?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="text-white">{TEMPLATE_TYPES.find(t => t.value === formData.templateType)?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Difficulty:</span>
                          <span className="text-white">{formData.difficultyLevel}</span>
                        </div>
                        {formData.tags.length > 0 && (
                          <div>
                            <span className="block mb-1">Tags:</span>
                            <div className="flex flex-wrap gap-1">
                              {formData.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-600/30"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search and Filter */}
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search variables..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                        >
                          <option value="All">All Categories</option>
                          {VARIABLE_CATEGORIES.map((category) => (
                            <option key={category.name} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Variables List */}
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {searchQuery ? (
                        <div className="space-y-2">
                          {filteredVariables.map((variable) => (
                            <div
                              key={variable.key}
                              className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:bg-gray-800 transition"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <code className="text-blue-400 text-sm font-mono">{variable.key}</code>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => copyVariable(variable.key)}
                                    className={`text-xs px-2 py-1 rounded border transition flex items-center gap-1 ${
                                      copiedVariables.has(variable.key)
                                        ? 'bg-green-600/20 text-green-400 border-green-600/30'
                                        : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 border-gray-600/30'
                                    }`}
                                  >
                                    {copiedVariables.has(variable.key) ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    {copiedVariables.has(variable.key) ? 'Copied' : 'Copy'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => insertVariable(variable.key, "body")}
                                    className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2 py-1 rounded border border-blue-600/30 transition flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Insert
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-300 mb-1">{variable.displayName}</p>
                              <p className="text-xs text-gray-500">{variable.description}</p>
                              <p className="text-xs text-gray-600 mt-1">Example: {variable.example}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        VARIABLE_CATEGORIES.map((category) => (
                          <div key={category.name} className="border border-gray-700 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => toggleCategory(category.name)}
                              className="w-full bg-gray-800/50 hover:bg-gray-800 px-4 py-3 flex items-center justify-between transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-300">{category.name}</span>
                                <span className="text-xs text-gray-500">({category.variables.length})</span>
                              </div>
                              {expandedCategories.includes(category.name) ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            
                            <AnimatePresence>
                              {expandedCategories.includes(category.name) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="border-t border-gray-700"
                                >
                                  <div className="p-3 space-y-2">
                                    <p className="text-xs text-gray-400 mb-2">{category.description}</p>
                                    {category.variables.map((variable) => (
                                      <div
                                        key={variable.key}
                                        className="bg-gray-800/30 border border-gray-700 rounded p-2 hover:bg-gray-800/50 transition"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <code className="text-blue-400 text-xs font-mono">{variable.key}</code>
                                          <div className="flex gap-1">
                                            <button
                                              type="button"
                                              onClick={() => copyVariable(variable.key)}
                                              className={`text-xs px-2 py-1 rounded border transition flex items-center gap-1 ${
                                                copiedVariables.has(variable.key)
                                                  ? 'bg-green-600/20 text-green-400 border-green-600/30'
                                                  : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 border-gray-600/30'
                                              }`}
                                              title="Copy variable"
                                            >
                                              {copiedVariables.has(variable.key) ? (
                                                <Check className="w-3 h-3" />
                                              ) : (
                                                <Copy className="w-3 h-3" />
                                              )}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => insertVariable(variable.key, "body")}
                                              className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2 py-1 rounded border border-blue-600/30 transition flex items-center gap-1"
                                              title="Insert variable"
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-xs text-gray-300">{variable.displayName}</p>
                                        <p className="text-xs text-gray-500">{variable.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-400">Template Stats</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Total Variables:</span>
                          <span className="text-white font-mono">{VARIABLE_CATEGORIES.reduce((acc, cat) => acc + cat.variables.length, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Categories:</span>
                          <span className="text-white font-mono">{VARIABLE_CATEGORIES.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Template Types:</span>
                          <span className="text-white font-mono">{TEMPLATE_TYPES.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Industries:</span>
                          <span className="text-white font-mono">{TEMPLATE_CATEGORIES.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
