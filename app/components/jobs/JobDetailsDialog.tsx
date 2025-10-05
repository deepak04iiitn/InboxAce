"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Mail,
  Clock,
  CheckCircle,
  Send,
  MessageSquare,
  Eye,
  Edit,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

interface JobDetailsDialogProps {
  job: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function JobDetailsDialog({
  job,
  onClose,
  onUpdate,
}: JobDetailsDialogProps) {
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [job.id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`);
      const data = await response.json();
      if (data.success) {
        setJobDetails(data.job);
      }
    } catch (error) {
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  // Update the handleSendEmail function in JobDetailsDialog.tsx

const handleSendEmail = async () => {
    if (!jobDetails) return;
  
    // Validate email content
    if (!jobDetails.customSubject && !jobDetails.template?.subject) {
      toast.error("No email subject found. Please add a template or custom subject.");
      return;
    }
  
    if (!jobDetails.customBody && !jobDetails.template?.body) {
      toast.error("No email body found. Please add a template or custom body.");
      return;
    }
  
    setSending(true);
    try {
      let subject = jobDetails.customSubject || jobDetails.template?.subject || "";
      let body = jobDetails.customBody || jobDetails.template?.body || "";
  
      // Replace variables
      subject = subject
        .replace(/{{recipientName}}/g, jobDetails.recipientName)
        .replace(/{{position}}/g, jobDetails.position)
        .replace(/{{company}}/g, jobDetails.company);
  
      body = body
        .replace(/{{recipientName}}/g, jobDetails.recipientName)
        .replace(/{{position}}/g, jobDetails.position)
        .replace(/{{company}}/g, jobDetails.company)
        .replace(/{{recipientGender}}/g, 
          jobDetails.recipientGender === "MALE" ? "Mr." : 
          jobDetails.recipientGender === "FEMALE" ? "Ms." : ""
        );
  
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: jobDetails.id,
          subject: subject,
          htmlBody: body,
          isFollowUp: false,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        toast.success(data.message || "Email sent successfully!");
        fetchJobDetails();
        onUpdate();
      } else {
        // Handle specific error codes
        if (data.code === "NO_EMAIL_ACCOUNT") {
          toast.error(
            <div>
              <p className="font-semibold">No Email Account Connected</p>
              <p className="text-sm">Please connect your Gmail or Outlook account in settings.</p>
            </div>,
            { duration: 5000 }
          );
        } else if (data.code === "DAILY_LIMIT_REACHED") {
          toast.error(data.error, { duration: 5000 });
        } else if (data.code === "AUTH_FAILED") {
          toast.error(
            <div>
              <p className="font-semibold">Authentication Failed</p>
              <p className="text-sm">Please reconnect your email account.</p>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.error(data.error || "Failed to send email");
        }
      }
    } catch (error: any) {
      console.error("Send email error:", error);
      toast.error("Network error. Please check your connection.");
    } finally {
      setSending(false);
    }
  };
  

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setAddingComment(true);
    try {
      const response = await fetch("/api/jobs/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          comment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Comment added");
        setComment("");
        fetchJobDetails();
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Job deleted");
        onUpdate();
        onClose();
      } else {
        toast.error("Failed to delete job");
      }
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_SENT":
        return "bg-yellow-500/20 text-yellow-400";
      case "SENT":
      case "FOLLOW_UP_SENT":
        return "bg-blue-500/20 text-blue-400";
      case "REPLIED":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </motion.div>
    );
  }

  if (!jobDetails) return null;

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
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {jobDetails.position} at {jobDetails.company}
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getStatusColor(
                  jobDetails.status
                )}`}
              >
                {jobDetails.status.replace("_", " ")}
              </span>
              {jobDetails.followUpsSent > 0 && (
                <span className="text-sm text-gray-400">
                  {jobDetails.followUpsSent} follow-ups sent
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
            >
              <Trash className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Recipient Info */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">
              Recipient Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Name</div>
                <div className="text-white">{jobDetails.recipientName}</div>
              </div>
              <div>
                <div className="text-gray-400">Email</div>
                <div className="text-white">{jobDetails.recipientEmail}</div>
              </div>
              <div>
                <div className="text-gray-400">Position</div>
                <div className="text-white">{jobDetails.position}</div>
              </div>
              <div>
                <div className="text-gray-400">Company</div>
                <div className="text-white">{jobDetails.company}</div>
              </div>
            </div>
          </div>

          {/* Email Content */}
          {(jobDetails.customSubject || jobDetails.template) && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Email Content</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Subject:</div>
                  <div className="text-white">
                    {jobDetails.customSubject || jobDetails.template?.subject}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Body:</div>
                  <div className="text-white text-sm whitespace-pre-wrap bg-gray-900/50 rounded p-3 max-h-60 overflow-y-auto">
                    {jobDetails.customBody || jobDetails.template?.body}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email History */}
          {jobDetails.emails && jobDetails.emails.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Email History</h3>
              <div className="space-y-3">
                {jobDetails.emails.map((email: any) => (
                  <div
                    key={email.id}
                    className="bg-gray-900/50 rounded p-3 text-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          email.status === "SENT"
                            ? "bg-green-500/20 text-green-400"
                            : email.status === "FAILED"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {email.status}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(email.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-white font-medium">{email.subject}</div>
                    {email.isFollowUp && (
                      <span className="text-purple-400 text-xs">
                        Follow-up #{email.followUpSequence}
                      </span>
                    )}
                    {email.openCount > 0 && (
                      <div className="text-green-400 text-xs mt-1">
                        Opened {email.openCount} times
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {jobDetails.notes && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Notes</h3>
              <p className="text-gray-300 text-sm">{jobDetails.notes}</p>
            </div>
          )}

          {/* Tags */}
          {jobDetails.tags && jobDetails.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {jobDetails.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Comments</h3>
            
            {/* Add Comment */}
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white text-sm mb-2"
                rows={2}
              />
              <button
                onClick={handleAddComment}
                disabled={addingComment || !comment.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
              >
                {addingComment ? "Adding..." : "Add Comment"}
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {jobDetails.comments?.map((comment: any) => (
                <div key={comment.id} className="bg-gray-900/50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">
                      {comment.userName}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{comment.comment}</p>
                </div>
              ))}
              {(!jobDetails.comments || jobDetails.comments.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No comments yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700/50 p-6 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
          >
            Close
          </button>

          {jobDetails.status === "NOT_SENT" && (
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Email Now"}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
