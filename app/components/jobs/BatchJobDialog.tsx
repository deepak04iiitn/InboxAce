"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Users, Calendar, Send, FileText, Edit } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

interface BatchJobDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchJobDialog({
  onClose,
  onSuccess,
}: BatchJobDialogProps) {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateId: "",
    batchSubject: "",
    batchBody: "",
    sendNow: true,
    scheduledFor: "",
    maxFollowUps: 0,
    daysBetweenFollowUps: 3,
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");

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
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        templateId,
        batchSubject: template.subject,
        batchBody: template.body,
      });
      setEditedSubject(template.subject);
      setEditedBody(template.body);
    }
  };

  const handleApplyEdits = () => {
    setFormData({
      ...formData,
      batchSubject: editedSubject,
      batchBody: editedBody,
    });
    setEditingTemplate(false);
    toast.success("Template edits applied (original template unchanged)");
  };

  const handleAddJob = () => {
    setJobs([
      ...jobs,
      {
        id: Date.now().toString(),
        recipientName: "",
        recipientGender: "NOT_SPECIFIED",
        position: "",
        company: "",
        recipientEmail: "",
        emailType: "APPLICATION",
      },
    ]);
  };

  const handleRemoveJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const handleJobChange = (id: string, field: string, value: any) => {
    setJobs(
      jobs.map((j) => (j.id === id ? { ...j, [field]: value } : j))
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || jobs.length === 0) {
      toast.error("Please fill batch name and add at least one job");
      return;
    }

    // Validate jobs
    for (const job of jobs) {
      if (
        !job.recipientName ||
        !job.recipientEmail ||
        !job.position ||
        !job.company
      ) {
        toast.error("All jobs must have complete information");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/jobs/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          jobs,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Batch created with ${jobs.length} jobs!`);
        onSuccess();
      } else {
        toast.error(data.error || "Failed to create batch");
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
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Create Batch Campaign
              </h2>
              <p className="text-gray-400 text-sm">
                Step {step} of 3: {step === 1 ? "Batch Details" : step === 2 ? "Select Template" : "Add Jobs"}
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

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Batch Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  placeholder="e.g., Tech Companies Outreach"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2">
                    Max Follow-ups
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.maxFollowUps}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxFollowUps: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">
                    Days Between Follow-ups
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={formData.daysBetweenFollowUps}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daysBetweenFollowUps: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.sendNow}
                    onChange={(e) =>
                      setFormData({ ...formData, sendNow: e.target.checked })
                    }
                    className="rounded"
                  />
                  Send immediately
                </label>
              </div>

              {!formData.sendNow && (
                <div>
                  <label className="block text-gray-400 mb-2">
                    Schedule For
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledFor: e.target.value })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">
                  Select Template (Optional)
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                >
                  <option value="">No Template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>
              </div>

              {formData.templateId && !editingTemplate && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Subject:</div>
                      <div className="text-white">{formData.batchSubject}</div>
                    </div>
                    <button
                      onClick={() => setEditingTemplate(true)}
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">Body:</div>
                  <div className="text-white text-sm whitespace-pre-wrap">
                    {formData.batchBody.substring(0, 200)}...
                  </div>
                </div>
              )}

              {editingTemplate && (
                <div className="space-y-4">
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-yellow-200 text-sm">
                    <strong>Note:</strong> Editing here will not modify the
                    original template. These changes apply only to this batch.
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
                    <label className="block text-gray-400 mb-2">Body</label>
                    <textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white font-mono text-sm"
                      rows={10}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleApplyEdits}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Apply Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingTemplate(false);
                        setEditedSubject(formData.batchSubject);
                        setEditedBody(formData.batchBody);
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!formData.templateId && (
                <div>
                  <label className="block text-gray-400 mb-2">
                    Or write your own email
                  </label>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={formData.batchSubject}
                    onChange={(e) =>
                      setFormData({ ...formData, batchSubject: e.target.value })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white mb-3"
                  />
                  <textarea
                    placeholder="Email body (use {{recipientName}}, {{company}}, {{position}} for dynamic content)"
                    value={formData.batchBody}
                    onChange={(e) =>
                      setFormData({ ...formData, batchBody: e.target.value })
                    }
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white"
                    rows={8}
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-gray-400">
                  {jobs.length} job{jobs.length !== 1 ? "s" : ""} added
                </div>
                <button
                  onClick={handleAddJob}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  + Add Job
                </button>
              </div>

              {jobs.map((job, index) => (
                <div
                  key={job.id}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-white font-medium">Job {index + 1}</div>
                    <button
                      onClick={() => handleRemoveJob(job.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Recipient Name *"
                      value={job.recipientName}
                      onChange={(e) =>
                        handleJobChange(job.id, "recipientName", e.target.value)
                      }
                      className="bg-gray-900/50 border border-gray-700/50 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="email"
                      placeholder="Recipient Email *"
                      value={job.recipientEmail}
                      onChange={(e) =>
                        handleJobChange(
                          job.id,
                          "recipientEmail",
                          e.target.value
                        )
                      }
                      className="bg-gray-900/50 border border-gray-700/50 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Position *"
                      value={job.position}
                      onChange={(e) =>
                        handleJobChange(job.id, "position", e.target.value)
                      }
                      className="bg-gray-900/50 border border-gray-700/50 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Company *"
                      value={job.company}
                      onChange={(e) =>
                        handleJobChange(job.id, "company", e.target.value)
                      }
                      className="bg-gray-900/50 border border-gray-700/50 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700/50 p-6 flex justify-between">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
          >
            {step > 1 ? "Back" : "Cancel"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Batch"}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
