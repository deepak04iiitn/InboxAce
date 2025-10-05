import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Mail, Sparkles, Edit, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

interface JobFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editJob?: any;
}

export default function JobForm({ onClose, onSuccess, editJob }: JobFormProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState<Template | null>(null);
  const [loadingDefaultTemplate, setLoadingDefaultTemplate] = useState(true);

  const [formData, setFormData] = useState({
    recipientName: editJob?.recipientName || "",
    recipientGender: editJob?.recipientGender || "NOT_SPECIFIED",
    position: editJob?.position || "",
    company: editJob?.company || "",
    recipientEmail: editJob?.recipientEmail || "",
    emailType: editJob?.emailType || "APPLICATION",
    customSubject: editJob?.customSubject || "",
    customBody: editJob?.customBody || "",
    customLinks: editJob?.customLinks || [],
    customSendNow: editJob?.customSendNow ?? true,
    customScheduledFor: editJob?.customScheduledFor || "",
    customMaxFollowUps: editJob?.customMaxFollowUps || 0,
    notes: editJob?.notes || "",
    tags: editJob?.tags || [],
    templateId: editJob?.templateId || "",
  });

  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align', 'link'
  ];

  useEffect(() => {
    fetchTemplates();
    fetchDefaultTemplate();
  }, []);

  const fetchDefaultTemplate = async () => {
    try {
      setLoadingDefaultTemplate(true);
      const response = await fetch("/api/user/default-template");
      const data = await response.json();
      
      if (data.success && data.defaultTemplate) {
        setDefaultTemplate(data.defaultTemplate);
        
        if (!editJob) {
          setFormData(prev => ({
            ...prev,
            customSubject: data.defaultTemplate.subject,
            customBody: data.defaultTemplate.body,
            templateId: data.defaultTemplate.id,
          }));
          setEditedSubject(data.defaultTemplate.subject);
          setEditedBody(data.defaultTemplate.body);
        }
      }
    } catch (error) {
      console.error("Failed to load default template:", error);
    } finally {
      setLoadingDefaultTemplate(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates/my-templates");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        templateId,
        customSubject: template.subject,
        customBody: template.body,
      });
      setEditedSubject(template.subject);
      setEditedBody(template.body);
      toast.success("Template loaded - you can customize it below");
    }
  };

  const handleApplyEdits = () => {
    setFormData({
      ...formData,
      customSubject: editedSubject,
      customBody: editedBody,
    });
    setEditingTemplate(false);
    toast.success("Template edits applied (original unchanged)");
  };

  const handleAIGenerate = async () => {
    if (!formData.recipientName || !formData.position || !formData.company) {
      toast.error("Please fill recipient name, position, and company first");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: formData.recipientName,
          position: formData.position,
          company: formData.company,
          emailType: formData.emailType,
          tone: "professional",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          ...formData,
          customSubject: data.subject,
          customBody: data.body,
        });
        toast.success("AI-generated email ready!");
      } else {
        toast.error(data.error || "Failed to generate email");
      }
    } catch (error) {
      toast.error("Failed to generate AI email");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setFormData({
        ...formData,
        customLinks: [...formData.customLinks, linkInput.trim()],
      });
      setLinkInput("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setFormData({
      ...formData,
      customLinks: formData.customLinks.filter((_, i) => i !== index),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.recipientName ||
      !formData.recipientEmail ||
      !formData.position ||
      !formData.company
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const url = editJob ? `/api/jobs/${editJob.id}` : "/api/jobs";
      const method = editJob ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editJob ? "Job updated successfully!" : "Job created successfully!"
        );
        onSuccess();
      } else {
        toast.error(data.error || "Failed to save job");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editJob ? "Edit Job" : "Add New Job"}
              </h2>
              <p className="text-gray-400 text-sm">
                {loadingDefaultTemplate 
                  ? "Loading default template..." 
                  : defaultTemplate && !editJob
                    ? `Using "${defaultTemplate.name}" template (you can customize it below)`
                    : "Fill in the details for the job application"
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loadingDefaultTemplate ? (
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {defaultTemplate && !editJob && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-purple-400 font-semibold mb-1">
                      Default Template Applied
                    </h4>
                    <p className="text-gray-400 text-sm mb-2">
                      Your default template "{defaultTemplate.name}" has been loaded. 
                      You can customize it below for this specific job without affecting the original.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditingTemplate(true)}
                      className="text-purple-400 hover:text-purple-300 text-sm underline flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Customize for this job
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Recipient Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientName: e.target.value })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Gender</label>
                  <select
                    value={formData.recipientGender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientGender: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="NOT_SPECIFIED">Not Specified</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientEmail: e.target.value })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                    placeholder="john@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Email Type</label>
                  <select
                    value={formData.emailType}
                    onChange={(e) =>
                      setFormData({ ...formData, emailType: e.target.value })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="APPLICATION">Job Application</option>
                    <option value="REFERRAL_REQUEST">Referral Request</option>
                    <option value="FOLLOW_UP_INTERVIEW">Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Position *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                    placeholder="Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                    placeholder="Tech Corp"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Email Content
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={aiLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiLoading ? "Generating..." : "AI Generate"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">
                  Override with Different Template (Optional)
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                >
                  <option value={defaultTemplate?.id || ""}>
                    {defaultTemplate ? `Keep Default: ${defaultTemplate.name}` : "No Template"}
                  </option>
                  {templates.filter(t => t.id !== defaultTemplate?.id).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>
              </div>

              {formData.templateId && !editingTemplate && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Subject:</div>
                      <div className="text-white">{formData.customSubject}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTemplate(true);
                        setEditedSubject(formData.customSubject);
                        setEditedBody(formData.customBody);
                      }}
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">Body Preview:</div>
                  <div 
                    className="text-white text-sm prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formData.customBody.substring(0, 300) + '...' 
                    }}
                  />
                </div>
              )}

              {editingTemplate && (
                <div className="space-y-4">
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-yellow-200 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Note:</strong> Changes here won't modify the original
                      template. They apply only to this job.
                    </span>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">Subject</label>
                    <input
                      type="text"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">
                      Body (Rich Text Editor)
                    </label>
                    <div className="bg-white rounded-lg overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={editedBody}
                        onChange={setEditedBody}
                        modules={modules}
                        formats={formats}
                        className="custom-quill-job"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Variables: {"{"}
                      {"{"}recipientName{"}"}, {"{"}
                      {"{"}company{"}"}, {"{"}
                      {"{"}position{"}"}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleApplyEdits}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Apply Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTemplate(false);
                        setEditedSubject(formData.customSubject);
                        setEditedBody(formData.customBody);
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!formData.templateId && !editingTemplate && (
                <>
                  <div>
                    <label className="block text-gray-400 mb-2">Subject</label>
                    <input
                      type="text"
                      value={formData.customSubject}
                      onChange={(e) =>
                        setFormData({ ...formData, customSubject: e.target.value })
                      }
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                      placeholder="Application for Software Engineer position"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">
                      Email Body (Rich Text Editor)
                      <span className="text-xs text-gray-500 ml-2">
                        All formatting will be preserved
                      </span>
                    </label>
                    <div className="bg-white rounded-lg overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={formData.customBody}
                        onChange={(content) => setFormData({ ...formData, customBody: content })}
                        modules={modules}
                        formats={formats}
                        className="custom-quill-job"
                        placeholder="Write your email content here with formatting..."
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Variables: {"{"}
                      {"{"}recipientName{"}"}, {"{"}
                      {"{"}company{"}"}, {"{"}
                      {"{"}position{"}"}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-gray-400 mb-2">
                  Portfolio Links
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
                    className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white"
                    placeholder="https://portfolio.com"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.customLinks.map((link, index) => (
                    <span
                      key={index}
                      className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {link}
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="hover:text-purple-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Scheduling & Follow-ups
              </h3>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.customSendNow}
                    onChange={(e) =>
                      setFormData({ ...formData, customSendNow: e.target.checked })
                    }
                    className="rounded"
                  />
                  Send immediately
                </label>
              </div>

              {!formData.customSendNow && (
                <div>
                  <label className="block text-gray-400 mb-2">Schedule For</label>
                  <input
                    type="datetime-local"
                    value={formData.customScheduledFor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customScheduledFor: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-2">
                  Maximum Follow-ups (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={formData.customMaxFollowUps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customMaxFollowUps: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Automatic follow-ups will be sent every 3 days if no reply
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  rows={3}
                  placeholder="Add any notes about this application..."
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editJob
                  ? "Update Job"
                  : "Create Job"}
              </button>
            </div>
          </form>
        )}

        <style jsx global>{`
          .custom-quill-job .ql-container {
            min-height: 250px;
            font-size: 14px;
          }
          
          .custom-quill-job .ql-editor {
            min-height: 250px;
          }
          
          .custom-quill-job .ql-toolbar {
            background: #f3f4f6;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
          }
          
          .custom-quill-job .ql-container {
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
}