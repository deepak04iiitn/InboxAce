"use client";

import { useState, useRef, memo, useEffect } from "react";
import { Send, Copy, Trash2, MoreHorizontal, Clock, Check, Mail, Edit2, AlertCircle, Repeat } from "lucide-react";

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
  customScheduledFor: string;
  customMaxFollowUps: number;
  followUpsSent: number;
  templateId: string;
  notes: string;
  tags: string[];
  customLinks: string[];
  batchId?: string;
  batchName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

interface SpreadsheetRowProps {
  job: Job;
  templates: Template[];
  defaultTemplate: Template | null;
  isSelected: boolean;
  editingCell: { jobId: string; field: string } | null;
  onSelect: (selected: boolean) => void;
  onCellUpdate: (jobId: string, field: string, value: any) => void;
  onStartEdit: (field: string) => void;
  onEndEdit: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onClone: () => void;
  onDelete: () => void;
  onSendNow: () => void;
}

// Inline editable cell component
const InlineCell = memo(({ 
  value, 
  field,
  jobId,
  placeholder = "Click to edit",
  type = "text",
  isEditing,
  onUpdate,
  onStartEdit,
  onEndEdit
}: {
  value: string;
  field: string;
  jobId: string;
  placeholder?: string;
  type?: string;
  isEditing: boolean;
  onUpdate: (value: string) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value when prop changes (only when not editing)
  if (!isEditing && localValue !== value) {
    setLocalValue(value);
  }

  const handleSave = () => {
    if (localValue !== value) {
      onUpdate(localValue);
    }
    onEndEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setLocalValue(value);
      onEndEdit();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full bg-gray-900 border-2 border-purple-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={onStartEdit}
      className="cursor-text hover:bg-gray-700/30 rounded px-2 py-1 text-sm text-white min-h-[28px] flex items-center"
    >
      {localValue || <span className="text-gray-500">{placeholder}</span>}
    </div>
  );
});

InlineCell.displayName = "InlineCell";

// Follow-up Cell Component
const FollowUpCell = memo(({ 
  maxFollowUps,
  followUpsSent,
  isEditing,
  onUpdate,
  onStartEdit,
  onEndEdit
}: {
  maxFollowUps: number;
  followUpsSent: number;
  isEditing: boolean;
  onUpdate: (value: number) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
}) => {
  const safeMaxFollowUps = maxFollowUps ?? 0;
  const safeFollowUpsSent = followUpsSent ?? 0;
  const [localValue, setLocalValue] = useState(safeMaxFollowUps.toString());
  
  const handleSave = () => {
    const numValue = parseInt(localValue) || 0;
    const clampedValue = Math.min(Math.max(numValue, 0), 5); // 0-5 range
    if (clampedValue !== safeMaxFollowUps) {
      onUpdate(clampedValue);
    }
    onEndEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setLocalValue(safeMaxFollowUps.toString());
      onEndEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="5"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-16 bg-gray-900 border-2 border-purple-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
        />
        <span className="text-xs text-gray-500">max</span>
      </div>
    );
  }

  const hasFollowUps = safeMaxFollowUps > 0;
  const allSent = safeFollowUpsSent >= safeMaxFollowUps && safeMaxFollowUps > 0;

  return (
    <div
      onClick={onStartEdit}
      className="cursor-pointer hover:bg-gray-700/30 rounded px-2 py-1 min-h-[28px] flex items-center gap-2"
    >
      <Repeat 
        size={14} 
        className={hasFollowUps ? "text-blue-400" : "text-gray-500"} 
      />
      <div className="flex items-center gap-1">
        <span className={`text-sm font-medium ${
          allSent ? "text-yellow-400" : 
          safeFollowUpsSent > 0 ? "text-blue-400" : 
          hasFollowUps ? "text-gray-400" : "text-gray-500"
        }`}>
          {safeFollowUpsSent}/{safeMaxFollowUps}
        </span>
        {allSent && (
          <div title="All follow-ups sent">
            <AlertCircle size={12} className="text-yellow-400" />
          </div>
        )}
      </div>
    </div>
  );
});

FollowUpCell.displayName = "FollowUpCell";

function SpreadsheetRow({
  job,
  templates,
  defaultTemplate,
  isSelected,
  editingCell,
  onSelect,
  onCellUpdate,
  onStartEdit,
  onEndEdit,
  onContextMenu,
  onClone,
  onDelete,
  onSendNow,
}: SpreadsheetRowProps) {

  const isEditingField = (field: string) => 
    editingCell?.jobId === job.id && editingCell?.field === field;

  const handleCellUpdate = (field: string, value: string) => {
    onCellUpdate(job.id, field, value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      DRAFT: { bg: "bg-gray-700", text: "text-gray-300", icon: Edit2 },
      SCHEDULED: { bg: "bg-blue-700/30", text: "text-blue-400", icon: Clock },
      SENT: { bg: "bg-green-700/30", text: "text-green-400", icon: Check },
      FAILED: { bg: "bg-red-700/30", text: "text-red-400", icon: AlertCircle },
      REPLIED: { bg: "bg-purple-700/30", text: "text-purple-400", icon: Mail },
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {status}
      </div>
    );
  };

  const TemplateCell = () => {
    // Find the selected template - prioritize defaultTemplate if IDs match
    let selectedTemplate = null;
    if (job.templateId && job.templateId.trim() !== "") {
      if (defaultTemplate && job.templateId === defaultTemplate.id) {
        selectedTemplate = defaultTemplate;
      } else {
        selectedTemplate = templates.find((t) => t.id === job.templateId);
      }
    } else if (defaultTemplate) {
      // If no templateId is set but we have a default template, use it
      selectedTemplate = defaultTemplate;
    }
    
    if (isEditingField("templateId")) {
      return (
        <select
          value={job.templateId && job.templateId.trim() !== "" ? job.templateId : (defaultTemplate?.id || "")}
          onChange={(e) => {
            const newTemplateId = e.target.value;
            const template = templates.find((t) => t.id === newTemplateId) || 
                           (defaultTemplate?.id === newTemplateId ? defaultTemplate : null);
            onCellUpdate(job.id, "templateId", newTemplateId);
            if (template) {
              onCellUpdate(job.id, "customSubject", template.subject);
              onCellUpdate(job.id, "customBody", template.body);
            }
            onEndEdit();
          }}
          onBlur={onEndEdit}
          autoFocus
          className="w-full bg-gray-900 border-2 border-purple-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
        >
          {defaultTemplate && (
            <option value={defaultTemplate.id}>
              {defaultTemplate.name} (Default)
            </option>
          )}
          {templates
            .filter(t => t.id !== defaultTemplate?.id)
            .map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
        </select>
      );
    }

    return (
      <div
        onClick={() => onStartEdit("templateId")}
        className="cursor-pointer hover:bg-gray-700/30 rounded px-2 py-1 text-sm text-white min-h-[28px] flex items-center"
      >
        {selectedTemplate ? (
          <span className={selectedTemplate.id === defaultTemplate?.id ? "text-purple-400" : "text-blue-400"}>
            {selectedTemplate.name}
            {selectedTemplate.id === defaultTemplate?.id && " ✓"}
          </span>
        ) : (
          <span className="text-gray-500">Select template</span>
        )}
      </div>
    );
  };

  const ScheduleCell = () => {
    if (job.customSendNow && !job.customScheduledFor) {
      return (
        <div
          onClick={() => onStartEdit("customScheduledFor")}
          className="cursor-pointer hover:bg-gray-700/30 rounded px-2 py-1 text-sm text-gray-500 min-h-[28px] flex items-center"
        >
          Send Now
        </div>
      );
    }

    if (isEditingField("customScheduledFor")) {
      return (
        <input
          type="datetime-local"
          value={job.customScheduledFor || ""}
          onChange={(e) => {
            onCellUpdate(job.id, "customSendNow", false);
            onCellUpdate(job.id, "customScheduledFor", e.target.value);
          }}
          onBlur={onEndEdit}
          autoFocus
          className="w-full bg-gray-900 border-2 border-purple-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
        />
      );
    }

    return (
      <div
        onClick={() => onStartEdit("customScheduledFor")}
        className="cursor-pointer hover:bg-gray-700/30 rounded px-2 py-1 text-sm text-white min-h-[28px] flex items-center"
      >
        {job.customScheduledFor ? (
          <span className="text-blue-400">
            {new Date(job.customScheduledFor).toLocaleString()}
          </span>
        ) : (
          <span className="text-gray-500">Set schedule</span>
        )}
      </div>
    );
  };

  return (
    <tr
      className={`border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors ${
        isSelected ? "bg-purple-900/20" : ""
      }`}
      onContextMenu={onContextMenu}
    >
      {/* Checkbox */}
      <td className="px-4 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded cursor-pointer"
        />
      </td>

      {/* Recipient Name */}
      <td className="px-4 py-2">
        <InlineCell
          value={job.recipientName}
          field="recipientName"
          jobId={job.id}
          placeholder="Recipient name"
          isEditing={isEditingField("recipientName")}
          onUpdate={(val) => handleCellUpdate("recipientName", val)}
          onStartEdit={() => onStartEdit("recipientName")}
          onEndEdit={onEndEdit}
        />
      </td>

      {/* Email */}
      <td className="px-4 py-2">
        <InlineCell
          value={job.recipientEmail}
          field="recipientEmail"
          jobId={job.id}
          placeholder="email@company.com"
          type="email"
          isEditing={isEditingField("recipientEmail")}
          onUpdate={(val) => handleCellUpdate("recipientEmail", val)}
          onStartEdit={() => onStartEdit("recipientEmail")}
          onEndEdit={onEndEdit}
        />
      </td>

      {/* Position */}
      <td className="px-4 py-2">
        <InlineCell
          value={job.position}
          field="position"
          jobId={job.id}
          placeholder="Position"
          isEditing={isEditingField("position")}
          onUpdate={(val) => handleCellUpdate("position", val)}
          onStartEdit={() => onStartEdit("position")}
          onEndEdit={onEndEdit}
        />
      </td>

      {/* Company */}
      <td className="px-4 py-2">
        <InlineCell
          value={job.company}
          field="company"
          jobId={job.id}
          placeholder="Company"
          isEditing={isEditingField("company")}
          onUpdate={(val) => handleCellUpdate("company", val)}
          onStartEdit={() => onStartEdit("company")}
          onEndEdit={onEndEdit}
        />
      </td>

      {/* Template */}
      <td className="px-4 py-2">
        <TemplateCell />
      </td>

      {/* Status */}
      <td className="px-4 py-2">
        {getStatusBadge(job.status)}
      </td>

      {/* Schedule */}
      <td className="px-4 py-2">
        <ScheduleCell />
      </td>

      {/* Follow-ups */}
      <td className="px-4 py-2">
        <FollowUpCell
          maxFollowUps={job.customMaxFollowUps}
          followUpsSent={job.followUpsSent}
          isEditing={isEditingField("customMaxFollowUps")}
          onUpdate={(val) => onCellUpdate(job.id, "customMaxFollowUps", val)}
          onStartEdit={() => onStartEdit("customMaxFollowUps")}
          onEndEdit={onEndEdit}
        />
      </td>

      {/* Batch */}
      <td className="px-4 py-2">
        {job.batchName ? (
          <div className="px-2 py-1 bg-orange-700/30 text-orange-400 rounded text-xs truncate max-w-[120px]" title={job.batchName}>
            {job.batchName}
          </div>
        ) : (
          <span className="text-gray-500 text-sm">-</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onSendNow}
            className="cursor-pointer p-1 hover:bg-green-700/30 text-green-400 rounded transition"
            title="Send Now"
          >
            <Send size={16} />
          </button>
          <button
            onClick={onClone}
            className="cursor-pointer p-1 hover:bg-blue-700/30 text-blue-400 rounded transition"
            title="Clone"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onDelete}
            className="cursor-pointer p-1 hover:bg-red-700/30 text-red-400 rounded transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={(e) => onContextMenu(e as any)}
            className="cursor-pointer p-1 hover:bg-gray-700 text-gray-400 rounded transition"
            title="More"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default memo(SpreadsheetRow, (prev, next) => {
  // Only re-render if these specific props change
  return (
    prev.job.id === next.job.id &&
    prev.job.recipientName === next.job.recipientName &&
    prev.job.recipientEmail === next.job.recipientEmail &&
    prev.job.position === next.job.position &&
    prev.job.company === next.job.company &&
    prev.job.templateId === next.job.templateId &&
    prev.job.status === next.job.status &&
    prev.job.customScheduledFor === next.job.customScheduledFor &&
    prev.job.customMaxFollowUps === next.job.customMaxFollowUps &&
    prev.job.followUpsSent === next.job.followUpsSent &&
    prev.job.batchName === next.job.batchName &&
    prev.isSelected === next.isSelected &&
    prev.editingCell?.jobId === next.editingCell?.jobId &&
    prev.editingCell?.field === next.editingCell?.field &&
    prev.defaultTemplate?.id === next.defaultTemplate?.id &&
    prev.defaultTemplate?.name === next.defaultTemplate?.name
  );
});