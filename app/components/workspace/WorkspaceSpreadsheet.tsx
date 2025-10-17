"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  FileText,
  Crown,
  Send,
  Clock,
  Copy,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import SpreadsheetRow from "../job-tracker/SpreadsheetRow";
import QuickActionsMenu from "../job-tracker/QuickActionsMenu";
import BulkActionsBar from "../job-tracker/BulkActionsBar";
import ScheduleDialog from "../job-tracker/ScheduleDialog";
import BatchCreationDialog from "../job-tracker/BatchCreationDialog";
import EmailAccountStatus from "../jobs/EmailAccountStatus";
import BulkImportDialog from "../jobs/BulkImportDialog";
import DefaultTemplateModal from "../jobs/DefaultTemplateModal";
import { getProcessedEmailContent, preserveHtmlFormatting } from "@/lib/email-utils";
import PremiumUpgradeModal from "../job-tracker/PremiumUpgradeModal";

interface Job {
  id: string;
  recipientName: string;
  recipientEmail: string;
  recipientGender: string;
  position: string;
  company: string;
  emailType: string;
  customSubject: string;
  customBody: string;
  status: string;
  customSendNow: boolean;
  customScheduledFor: string | null;
  customMaxFollowUps: number;
  customFollowUpInterval?: number;
  followUpsSent: number;
  templateId: string;
  template?: {
    id: string;
    subject: string;
    body: string;
  };
  notes: string;
  tags: string[];
  customLinks: string[];
  batchId?: string;
  batchName?: string;
  lastSavedAt?: string;
  isDirty?: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Template {
    id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

export default function WorkspaceSpreadsheet({ workspaceId }: { workspaceId: string }) {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasEmailAccount, setHasEmailAccount] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingCell, setEditingCell] = useState<{ jobId: string; field: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; jobId: string } | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDefaultTemplateModal, setShowDefaultTemplateModal] = useState(false);
  const [defaultTemplateModalType, setDefaultTemplateModalType] = useState<'default' | 'followUp'>('default');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [hasDefaultTemplate, setHasDefaultTemplate] = useState(false);
  const [checkingDefaultTemplate, setCheckingDefaultTemplate] = useState(true);
  const [userSettings, setUserSettings] = useState<{
    defaultFollowUpInterval?: number;
    defaultFollowUpTemplateId?: string;
  } | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});
  
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkDefaultTemplate();
    fetchTemplates();
    checkPremiumStatus();
    fetchUserSettings();
  }, []);

  useEffect(() => {
    if (templates.length > 0 || defaultTemplate) {
    fetchJobs();
    }
  }, [templates, defaultTemplate]);

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (data.success) {
        setIsPremium(data.user.pricingTier !== 'FREE');
      }
    } catch (error) {
      console.error('Failed to check premium status:', error);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      const data = await response.json();
      if (data.success) {
        setUserSettings({
          defaultFollowUpInterval: data.settings.defaultFollowUpInterval,
          defaultFollowUpTemplateId: data.settings.defaultFollowUpTemplateId,
        });
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
    }
  };

  const checkDefaultTemplate = async () => {
    try {
      const response = await fetch('/api/user/default-template');
      const data = await response.json();
      
      console.log('Default template API response (workspace):', data);
      
      if (data.success) {
        setHasDefaultTemplate(data.hasDefaultTemplate);
        
        if (data.defaultTemplate) {
          setDefaultTemplate(data.defaultTemplate);
        } else {
          console.log('No default template found in API response (workspace)');
        }
        
        if (!data.hasDefaultTemplate && hasEmailAccount) {
          setShowDefaultTemplateModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to check default template:', error);
    } finally {
      setCheckingDefaultTemplate(false);
    }
  };

  const handleDefaultTemplateSelected = async () => {
    setHasDefaultTemplate(true);
    await checkDefaultTemplate();
    toast.success("Default template set! New rows will use this template.");
  };

  const handleImportClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setShowImportDialog(true);
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/jobs`);
      const data = await response.json();
      if (data.success) {
        const processedJobs = data.jobs.map((job: any) => {
          const template = templates.find(t => t.id === job.templateId) || 
                          (defaultTemplate?.id === job.templateId ? defaultTemplate : null);
          return {
            ...job,
            template: template
          };
        });
        setJobs(processedJobs);
      }
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates/community");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleAddRow = () => {
    console.log("Add row clicked (workspace)", { hasEmailAccount, hasDefaultTemplate, defaultTemplate });
    
    if (!hasEmailAccount) {
      toast.error("Please connect your email account first");
      return;
    }

    if (!hasDefaultTemplate) {
      toast.error("Please select a default template first");
      setShowDefaultTemplateModal(true);
      return;
    }

    // If we have a default template ID but no template object, try to use the first available template
    let templateToUse = defaultTemplate;
    if (!templateToUse && templates.length > 0) {
      templateToUse = templates[0];
      console.log("Using first available template as fallback (workspace):", templateToUse);
    }

    if (!templateToUse) {
      toast.error("No template available. Please create or select a template first.");
      return;
    }

    const newJob: Partial<Job> = {
      id: `temp-${Date.now()}`,
      recipientName: "",
      recipientEmail: "",
      recipientGender: "NOT_SPECIFIED",
      position: "",
      company: "",
      emailType: "APPLICATION",
      customSubject: templateToUse.subject || "",
      customBody: templateToUse.body || "",
      status: "DRAFT",
      customSendNow: true,
      customScheduledFor: null, // Use null for no scheduled time
      customMaxFollowUps: 0,
      customFollowUpInterval: userSettings?.defaultFollowUpInterval || 3,
      followUpsSent: 0,
      templateId: templateToUse.id,
      notes: "",
      tags: [],
      customLinks: [],
      isDirty: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: session?.user?.id || "",
        name: session?.user?.name || "",
        email: session?.user?.email || "",
      },
    };
    
    console.log("New job object created:", newJob);
    
    setJobs([newJob as Job, ...jobs]);
    setTimeout(() => {
      setEditingCell({ jobId: newJob.id!, field: "recipientName" });
    }, 100);
  };

  const handleCellUpdate = useCallback((jobId: string, field: string, value: any) => {
    setJobs(prevJobs => {
      const jobIndex = prevJobs.findIndex((j) => j.id === jobId);
      if (jobIndex === -1) return prevJobs;

      const updatedJobs = [...prevJobs];
      updatedJobs[jobIndex] = { ...updatedJobs[jobIndex], [field]: value, isDirty: true } as Job;

      return updatedJobs;
    });
  }, []);

  const saveJob = async (job: Job) => {
    try {
      setAutoSaveStatus(prev => ({ ...prev, [job.id]: 'saving' }));

      // For temp jobs, validate and create
      if (job.id.startsWith('temp-')) {
        if (!job.recipientName?.trim() || !job.recipientEmail?.trim() || !job.position?.trim() || !job.company?.trim()) {
          toast.error('Please fill recipient name, email, position, and company');
          setAutoSaveStatus(prev => ({ ...prev, [job.id]: 'error' }));
          return;
        }
        await createJob(job);
        return;
      }

      // Existing job: update via auto-save endpoint to set lastSavedAt/isDirty
      const response = await fetch('/api/jobs/auto-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          updates: {
            recipientName: job.recipientName,
            recipientEmail: job.recipientEmail,
            position: job.position,
            company: job.company,
            recipientGender: job.recipientGender,
            emailType: job.emailType,
            customSubject: job.customSubject,
            customBody: job.customBody,
            customLinks: job.customLinks,
            customSendNow: job.customSendNow,
            customScheduledFor: job.customScheduledFor,
            customMaxFollowUps: job.customMaxFollowUps,
            customFollowUpInterval: job.customFollowUpInterval,
            notes: job.notes,
            tags: job.tags,
          },
          isDraft: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isDirty: false, lastSavedAt: data.savedAt } : j));
        setAutoSaveStatus(prev => ({ ...prev, [job.id]: 'saved' }));
        toast.success('Job saved', { duration: 1500 });
      } else {
        throw new Error(data.error || 'Failed to save job');
      }
    } catch (error) {
      console.error('Workspace save failed:', error);
      setAutoSaveStatus(prev => ({ ...prev, [job.id]: 'error' }));
      toast.error('Failed to save job');
    }
  };

  const createJob = async (job: Job) => {
    try {
      // Remove the user field before sending to API - it's only for display
      const { user, ...jobData } = job;
      // Validate required fields
      if (!jobData.recipientName?.trim() || !jobData.recipientEmail?.trim() || !jobData.position?.trim() || !jobData.company?.trim()) {
        console.log('Workspace job creation blocked - missing required fields:', {
          recipientName: jobData.recipientName,
          recipientEmail: jobData.recipientEmail,
          position: jobData.position,
          company: jobData.company,
        });
        toast.error('Please fill recipient name, email, position, and company');
        setAutoSaveStatus(prev => ({ ...prev, [job.id]: 'error' }));
        return;
      }

      // Force DRAFT on creation from workspace
      const payload = { ...jobData, status: jobData.status || 'DRAFT' };
      console.log("Workspace job creation request data:", payload);
      
      const response = await fetch(`/api/workspaces/${workspaceId}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      console.log("Workspace job creation response status:", response.status);
      console.log("Workspace job creation response headers:", Object.fromEntries(response.headers.entries()));
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        console.error("Response not ok:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check if response has content
      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.error("Empty response body received");
        throw new Error("Empty response from server");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        console.error("Response text that failed to parse:", responseText);
        throw new Error("Invalid JSON response from server");
      }
      
      console.log("Workspace job creation response data:", data);
      
      if (data.success) {
        // Update the job with the new ID from the server
        setJobs(prevJobs => prevJobs.map((j) => 
          j.id === job.id ? { ...j, id: data.job.id, isDirty: false } : j
        ));
        setAutoSaveStatus(prev => ({ ...prev, [data.job.id]: 'saved' }));
        toast.success("Job created", { duration: 1500 });
      } else {
        console.error("Job creation failed - Full error response:", data);
        console.error("Error details:", {
          error: data.error,
          message: data.message,
          details: data.details,
          status: response.status
        });
        toast.error(data.error || data.message || "Failed to create job");
        // Remove the temporary job from the list if creation failed
        setJobs(prevJobs => prevJobs.filter(j => j.id !== job.id));
      }
    } catch (error) {
      console.error("Failed to create job:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to create job"}`);
      // Remove the temporary job from the list if creation failed
      setJobs(prevJobs => prevJobs.filter(j => j.id !== job.id));
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  };

  const handleCloneRow = (jobId: string) => {
    const originalJob = jobs.find((j) => j.id === jobId);
    if (!originalJob) return;

    const clonedJob: Job = {
      ...originalJob,
      id: `temp-${Date.now()}`,
      recipientName: `${originalJob.recipientName} (Copy)`,
      status: "DRAFT",
      followUpsSent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setJobs([clonedJob, ...jobs]);
    toast.success("Row cloned");
  };

  const handleDeleteRow = async (jobId: string) => {
    if (jobId.startsWith("temp-")) {
      setJobs(jobs.filter((j) => j.id !== jobId));
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setJobs(jobs.filter((j) => j.id !== jobId));
        toast.success("Job deleted");
      }
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const handleSendNow = async (jobId: string) => {
    if (!hasEmailAccount) {
      toast.error("Please connect your email account first");
      return;
    }

    if (!session?.user) {
      toast.error("Please sign in to send emails");
      return;
    }
  
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      toast.error("Job not found");
      return;
    }
  
    if (!job.recipientEmail || !job.recipientName) {
      toast.error("Please fill in recipient email and name");
      return;
    }
  
    if (!job.customSubject && !job.template?.subject) {
      toast.error("Please fill in email subject or select a template");
      return;
    }

    if (!job.customBody && !job.template?.body) {
      toast.error("Please fill in email body or select a template");
      return;
    }
  
    try {
      const { subject, body } = getProcessedEmailContent(job, session.user);
      const formattedBody = preserveHtmlFormatting(body);

      const response = await fetch(`/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          subject: subject,
          htmlBody: formattedBody,
          isFollowUp: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchJobs();
        toast.success("Email sent successfully!");
      } else {
        if (data.code === "NO_EMAIL_ACCOUNT") {
          toast.error("Please reconnect your email account");
        } else if (data.code === "DAILY_LIMIT_REACHED") {
          toast.error(data.error);
      } else {
          toast.error(data.error || "Failed to send email");
        }
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Network error: Failed to send email");
    }
  };

  const handleSchedule = async (jobIds: string[], scheduledFor: string) => {
    try {
      const updates = jobIds.map(id => ({
        jobId: id,
        customSendNow: false,
        customScheduledFor: scheduledFor,
        status: "SCHEDULED"
      }));

      await Promise.all(
        updates.map(update =>
          fetch(`/api/jobs/${update.jobId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customSendNow: update.customSendNow,
              customScheduledFor: update.customScheduledFor,
              status: update.status
            }),
          })
        )
      );

      await fetchJobs();
      toast.success(`Scheduled ${jobIds.length} job(s)`);
      setShowScheduleDialog(false);
    } catch (error) {
      toast.error("Failed to schedule jobs");
    }
  };

  const handleBulkDelete = async () => {
    const jobIds = Array.from(selectedJobs);
    try {
      await Promise.all(
        jobIds.map((id) =>
          fetch(`/api/jobs/${id}`, { method: "DELETE" })
        )
      );
      setJobs(jobs.filter((j) => !selectedJobs.has(j.id)));
      setSelectedJobs(new Set());
      toast.success(`Deleted ${jobIds.length} job(s)`);
    } catch (error) {
      toast.error("Failed to delete jobs");
    }
  };

  const handleExport = () => {
    const csvHeaders = [
      "Recipient Name",
      "Email",
      "Position",
      "Company",
      "Status",
      "Template",
      "Subject",
      "Scheduled For",
      "Max Follow-ups",
      "Follow-ups Sent",
      "Added By",
      "Created At"
    ];

    const csvRows = filteredJobs.map(job => {
      const template = templates.find(t => t.id === job.templateId);
      return [
        job.recipientName,
        job.recipientEmail,
        job.position,
        job.company,
        job.status,
        template?.name || "No Template",
        job.customSubject,
        job.customScheduledFor || "Send Now",
        job.customMaxFollowUps,
        job.followUpsSent,
        job.user.name,
        new Date(job.createdAt).toLocaleDateString()
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workspace_jobs_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Jobs exported successfully!");
  };

  const handleSelectJob = (jobId: string, selected: boolean) => {
    const newSelected = new Set(selectedJobs);
    if (selected) {
      newSelected.add(jobId);
    } else {
      newSelected.delete(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedJobs(new Set(filteredJobs.map((j) => j.id)));
    } else {
      setSelectedJobs(new Set());
    }
  };

  const handleContextMenu = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, jobId });
  };

  const handleCreateBatch = async (batchName: string, batchDescription: string) => {
    const jobIds = Array.from(selectedJobs);
    try {
      const response = await fetch("/api/jobs/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: batchName,
          description: batchDescription,
          jobIds,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchJobs();
        setSelectedJobs(new Set());
        setShowBatchDialog(false);
        toast.success(`Batch created with ${jobIds.length} job(s)`);
      }
    } catch (error) {
      toast.error("Failed to create batch");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || job.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-[95vw] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Workspace Job Tracker</h1>
          <p className="text-gray-400">Collaborate with your team on cold email outreach</p>
        </div>

        <div className="mb-6">
          <EmailAccountStatus onStatusChange={setHasEmailAccount} />
        </div>

        {/* {!checkingDefaultTemplate && !hasDefaultTemplate && hasEmailAccount && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-yellow-400" />
                <div>
                  <h4 className="text-yellow-400 font-semibold">No Default Template Set</h4>
                  <p className="text-gray-400 text-sm">Select a default template to start creating jobs</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDefaultTemplateModalType('default');
                  setShowDefaultTemplateModal(true);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer text-white px-4 py-2 rounded-lg transition"
              >
                Select Template
              </button>
            </div>
          </div>
        )} */}

        {/* Default Templates Settings */}
        <div className="mb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-purple-400 font-semibold">Default Templates</h4>
                <p className="text-gray-400 text-sm">
                  {hasDefaultTemplate && defaultTemplate 
                    ? `Application: ${defaultTemplate.name}${userSettings?.defaultFollowUpTemplateId ? ' • Follow-up: Set' : ''}`
                    : 'Set your default templates for applications and follow-ups'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setDefaultTemplateModalType('default');
                setShowDefaultTemplateModal(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white cursor-pointer px-4 py-2 rounded-lg transition"
            >
              {hasDefaultTemplate || userSettings?.defaultFollowUpTemplateId ? 'Change Templates' : 'Set Templates'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={handleAddRow} className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition">
              <Plus size={20} />
              Add Row
            </button>

            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, email, company, position, or team member..." className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-purple-500" />
            </div>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-gray-900/50 cursor-pointer border border-gray-700/50 rounded-lg px-4 py-2 text-white">
              <option value="all" className="cursor-pointer">All Status</option>
              <option value="DRAFT" className="cursor-pointer">Draft</option>
              <option value="SCHEDULED" className="cursor-pointer">Scheduled</option>
              <option value="SENT" className="cursor-pointer">Sent</option>
              <option value="FAILED" className="cursor-pointer">Failed</option>
              <option value="REPLIED" className="cursor-pointer">Replied</option>
            </select>

            <button 
              onClick={handleImportClick} 
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg transition relative ${
                isPremium 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/50 text-purple-300'
              }`}
            >
              <Upload size={20} />
              Import
              {!isPremium && (
                <Crown size={14} className="text-yellow-400" />
              )}
            </button>
            <button onClick={handleExport} className="cursor-pointer flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
              <Download size={20} />
              Export
            </button>
            </div>
          </div>

        {selectedJobs.size > 0 && (
          <BulkActionsBar selectedCount={selectedJobs.size} onSchedule={() => setShowScheduleDialog(true)} onDelete={handleBulkDelete} onCreateBatch={() => setShowBatchDialog(true)} onClearSelection={() => setSelectedJobs(new Set())} />
        )}

        <div ref={tableRef} className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left"><input type="checkbox" checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} className="rounded" /></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Recipient Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Template</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Follow-ups</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Interval</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Added By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={13} className="text-center py-12 text-gray-400">Loading jobs...</td></tr>
                ) : filteredJobs.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-12 text-gray-400">No jobs found. Click "Add Row" to create your first job.</td></tr>
                ) : (
                  filteredJobs.map((job) => (
                    <SpreadsheetRow key={job.id} job={job} templates={templates} defaultTemplate={defaultTemplate} isSelected={selectedJobs.has(job.id)} editingCell={editingCell} onSelect={(selected) => handleSelectJob(job.id, selected)} onCellUpdate={handleCellUpdate} onStartEdit={(field) => setEditingCell({ jobId: job.id, field })} onEndEdit={() => setEditingCell(null)} onContextMenu={(e) => handleContextMenu(e, job.id)} onClone={() => handleCloneRow(job.id)} onDelete={() => handleDeleteRow(job.id)} onSendNow={() => handleSendNow(job.id)} onSave={() => saveJob(job)} autoSaveStatus={autoSaveStatus[job.id] || 'idle'} isDirty={job.isDirty || false} />
                  ))
                )}
              </tbody>
            </table>
                </div>
            </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <div>Showing {filteredJobs.length} of {jobs.length} jobs</div>
          {selectedJobs.size > 0 && <div>{selectedJobs.size} selected</div>}
            </div>
          </div>

      {contextMenu && (
        <QuickActionsMenu x={contextMenu.x} y={contextMenu.y} jobId={contextMenu.jobId} onClose={() => setContextMenu(null)} onClone={() => { handleCloneRow(contextMenu.jobId); setContextMenu(null); }} onDelete={() => { handleDeleteRow(contextMenu.jobId); setContextMenu(null); }} onSendNow={() => { handleSendNow(contextMenu.jobId); setContextMenu(null); }} />
      )}

      {showScheduleDialog && (
        <ScheduleDialog jobIds={Array.from(selectedJobs)} onClose={() => setShowScheduleDialog(false)} onSchedule={handleSchedule} />
      )}

      {showBatchDialog && (
        <BatchCreationDialog jobIds={Array.from(selectedJobs)} onClose={() => setShowBatchDialog(false)} onCreate={handleCreateBatch} />
      )}

      {showImportDialog && (
        <BulkImportDialog onClose={() => setShowImportDialog(false)} onSuccess={() => { setShowImportDialog(false); fetchJobs(); }} />
      )}

      <AnimatePresence>
        {showDefaultTemplateModal && (
          <DefaultTemplateModal
            isOpen={showDefaultTemplateModal}
            onClose={() => setShowDefaultTemplateModal(false)}
            onTemplateSelected={handleDefaultTemplateSelected}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPremiumModal && (
          <PremiumUpgradeModal
            isOpen={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
            feature="Bulk CSV Import"
          />
        )}
      </AnimatePresence>
    </div>
  );
}