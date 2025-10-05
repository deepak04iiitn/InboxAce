import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Search, Check, Eye, Edit3 } from "lucide-react";

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
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");

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
      
      // Get the selected template (which might be edited)
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      
      const response = await fetch("/api/user/default-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          templateId: selectedTemplateId,
          // If the template was edited, send the custom version
          customSubject: selectedTemplate?.subject,
          customBody: selectedTemplate?.body
        }),
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

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setEditedSubject(template.subject);
    setEditedBody(template.body);
  };

  const handleSaveEditedTemplate = () => {
    if (!editingTemplate) return;
    
    // Update the templates array with the edited version
    setTemplates(prev => prev.map(t => 
      t.id === editingTemplate.id 
        ? { ...t, subject: editedSubject, body: editedBody }
        : t
    ));
    
    // If this was the selected template, update the selection
    if (selectedTemplateId === editingTemplate.id) {
      // The edited template is now the selected one
    }
    
    setEditingTemplate(null);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditedSubject("");
    setEditedBody("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="main-modal"
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
                className="text-gray-400 hover:text-white transition cursor-pointer p-2 hover:bg-gray-800 rounded-lg"
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

                      {/* Stats and Actions */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{template.usageCount} uses</span>
                          <span>{template.likes} likes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTemplate(template);
                            }}
                            className="cursor-pointer p-1.5 hover:bg-blue-600/20 text-blue-400 rounded transition"
                            title="View Full Template"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTemplate(template);
                            }}
                            className="cursor-pointer p-1.5 hover:bg-purple-600/20 text-purple-400 rounded transition"
                            title="Edit Template"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
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
                className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSetDefault}
                disabled={!selectedTemplateId || submitting}
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Setting..." : "Set as Default"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <motion.div
          key="preview-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Gmail-style Header */}
            <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gmail</h3>
                  <p className="text-xs text-gray-600">Template Preview</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-600 hover:text-gray-900 cursor-pointer transition p-2 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Content */}
            <div className="p-6 bg-white overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">From:</span>
                  <span className="text-sm text-gray-600">Your Name &lt;your.email@example.com&gt;</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">To:</span>
                  <span className="text-sm text-gray-600">{`{{recipientName}} <{{recipientEmail}}>`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Subject:</span>
                  <span className="text-sm text-gray-900 font-medium">{previewTemplate.subject}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <div 
                  className="text-gray-900 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: previewTemplate.body.replace(/\n/g, '<br>') 
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Template Edit Modal */}
      {editingTemplate && (
        <motion.div
          key="edit-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          onClick={handleCancelEdit}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Edit3 className="w-6 h-6 text-purple-400" />
                    Edit Template: {editingTemplate.name}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Your changes will only affect this session. The original template remains unchanged.
                  </p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Edit Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Body
                  </label>
                  <textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={12}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Enter email body..."
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    Available variables: {`{{recipientName}}, {{recipientGender}}, {{position}}, {{company}}, {{yourName}}, {{yourEmail}}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 border-t border-gray-800 p-6 flex items-center justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-white px-6 py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedTemplate}
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg transition"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}