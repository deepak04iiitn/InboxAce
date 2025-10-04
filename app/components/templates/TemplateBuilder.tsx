"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Eye, Sparkles, Tag, Folder, Send } from "lucide-react";
import { toast } from "sonner";

interface TemplateBuilderProps {
  onTemplateCreated?: () => void;
}

export default function TemplateBuilder({ onTemplateCreated }: TemplateBuilderProps) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    category: "GENERAL",
    tags: [] as string[],
    isPublic: false,
    isCommunity: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    "GENERAL",
    "TECH",
    "FINANCE",
    "MARKETING",
    "SALES",
    "DESIGN",
    "CONSULTING",
    "OTHER",
  ];

  const commonVariables = [
    "{{recipientName}}",
    "{{recipientGender}}",
    "{{position}}",
    "{{company}}",
    "{{yourName}}",
    "{{yourTitle}}",
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form Data:", formData);
    
    setLoading(true);

    try {
      console.log("Sending POST request to /api/templates/create");
      
      const response = await fetch("/api/templates/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        toast.success("Template created successfully!");
        console.log("✅ Template created:", data.template);
        
        // Reset form
        setFormData({
          name: "",
          subject: "",
          body: "",
          category: "GENERAL",
          tags: [],
          isPublic: false,
          isCommunity: false,
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
      console.log("=== FORM SUBMISSION ENDED ===");
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
            Create Email Template
          </h1>
          <p className="text-gray-400">
            Build custom templates with dynamic variables and share with the community
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
                  placeholder="e.g., Software Engineer Cold Email"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
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
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="e.g., {{recipientName}} - Collaboration Opportunity at {{company}}"
                  required
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonVariables.slice(0, 4).map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(variable, "subject")}
                      className="cursor-pointer text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2 py-1 rounded border border-blue-600/30 transition"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Body
                </label>
                <textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[300px] font-mono text-sm"
                  placeholder="Hi {{recipientName}},&#10;&#10;I noticed your work at {{company}} and would love to connect..."
                  required
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonVariables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(variable, "body")}
                      className="cursor-pointer text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-2 py-1 rounded border border-purple-600/30 transition"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
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

          {/* Preview Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl sticky top-6 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700 px-6 py-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  {isPreview ? "Email Preview" : "Quick Guide"}
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
                            YN
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Your Name</p>
                            <p className="text-xs text-gray-500">your.email@company.com</p>
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
                    {formData.tags.length > 0 && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Template Tags</p>
                        <div className="flex flex-wrap gap-2">
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
                ) : (
                  <div className="space-y-5">
                    <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-5">
                      <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Available Variables
                      </h4>
                      <ul className="space-y-2">
                        {commonVariables.map((v) => (
                          <li key={v} className="text-xs font-mono text-gray-300 bg-gray-800/50 px-3 py-2 rounded">
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-purple-600/10 border border-purple-600/30 rounded-xl p-5">
                      <h4 className="text-purple-400 font-semibold mb-3">Pro Tips</h4>
                      <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Use variables to personalize emails automatically</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Format text with the rich editor toolbar</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Add relevant tags for easy discovery</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Preview your template before saving</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Share with community to help others</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-5">
                      <h4 className="text-green-400 font-semibold mb-2">Template Categories</h4>
                      <p className="text-xs text-gray-400">
                        Choose the right category to help others find your template easily
                      </p>
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