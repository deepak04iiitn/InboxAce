"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Mail, 
  RefreshCw, 
  Star, 
  Check, 
  X,
  Info,
  Zap,
  Target,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  templateType: string;
  description?: string;
  difficultyLevel?: string;
  targetAudience?: string;
  isPublic: boolean;
  isCommunity: boolean;
  usageCount: number;
  rating: number;
  createdAt: string;
}

interface TemplateSettingsProps {
  userId: string;
}

export default function TemplateSettings({ userId }: TemplateSettingsProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDefault, setSelectedDefault] = useState<string | null>(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState({
    defaultTemplateId: null as string | null,
    defaultFollowUpTemplateId: null as string | null,
  });

  useEffect(() => {
    fetchTemplates();
    fetchUserSettings();
  }, [userId]);

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

  const fetchUserSettings = async () => {
    try {
      const response = await fetch("/api/user/default-template");
      if (response.ok) {
        const data = await response.json();
        setUserSettings({
          defaultTemplateId: data.defaultTemplateId,
          defaultFollowUpTemplateId: data.defaultFollowUpTemplateId,
        });
        setSelectedDefault(data.defaultTemplateId);
        setSelectedFollowUp(data.defaultFollowUpTemplateId);
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  const saveDefaultTemplate = async (templateId: string | null, type: 'default' | 'followUp') => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/default-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'default') {
          setSelectedDefault(templateId);
          setUserSettings(prev => ({ ...prev, defaultTemplateId: templateId }));
        } else {
          setSelectedFollowUp(templateId);
          setUserSettings(prev => ({ ...prev, defaultFollowUpTemplateId: templateId }));
        }
        toast.success(`${type === 'default' ? 'Default' : 'Follow-up'} template updated successfully!`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const clearDefaultTemplate = async (type: 'default' | 'followUp') => {
    await saveDefaultTemplate(null, type);
  };

  const getTemplateTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      APPLICATION: "📝",
      REFERRAL_REQUEST: "🤝",
      FOLLOW_UP: "🔄",
      THANK_YOU: "🙏",
      REJECTION_FOLLOW_UP: "💪",
      INTERVIEW_FOLLOW_UP: "🎯",
      NETWORKING: "🌐",
      COLD_OUTREACH: "❄️",
      PARTNERSHIP: "🤝",
      COLLABORATION: "👥",
      CUSTOM: "⚙️",
    };
    return icons[type] || "📧";
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "EASY": return "text-green-400 bg-green-400/20";
      case "MEDIUM": return "text-yellow-400 bg-yellow-400/20";
      case "ADVANCED": return "text-red-400 bg-red-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
          Template Settings
        </h1>
        <p className="text-gray-400">
          Configure your default email templates for applications and follow-ups
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Template Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Default Template</h2>
              <p className="text-sm text-gray-400">Primary template for job applications</p>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-4">No templates available</p>
              <a
                href="/templates/create"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Zap className="w-4 h-4" />
                Create Your First Template
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">
                  Select your preferred template for new job applications
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg border transition cursor-pointer ${
                      selectedDefault === template.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                    }`}
                    onClick={() => saveDefaultTemplate(template.id, 'default')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {getTemplateTypeIcon(template.templateType)}
                          </span>
                          <h3 className="font-semibold text-white">{template.name}</h3>
                          {selectedDefault === template.id && (
                            <Check className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {template.description || template.subject}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {template.templateType.replace('_', ' ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {template.usageCount} uses
                          </span>
                          {template.difficultyLevel && (
                            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(template.difficultyLevel)}`}>
                              {template.difficultyLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedDefault && (
                <button
                  onClick={() => clearDefaultTemplate('default')}
                  className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 px-4 border border-red-400/30 hover:border-red-400/50 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                  Clear Default Template
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Follow-up Template Selection */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <RefreshCw className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Follow-up Template</h2>
              <p className="text-sm text-gray-400">Template for follow-up emails</p>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-4">No templates available</p>
              <a
                href="/templates/create"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Zap className="w-4 h-4" />
                Create Your First Template
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">
                  Select your preferred template for follow-up emails
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {templates
                  .filter(template => 
                    template.templateType === 'FOLLOW_UP' || 
                    template.templateType === 'THANK_YOU' ||
                    template.templateType === 'REJECTION_FOLLOW_UP' ||
                    template.templateType === 'INTERVIEW_FOLLOW_UP'
                  )
                  .map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border transition cursor-pointer ${
                        selectedFollowUp === template.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                      }`}
                      onClick={() => saveDefaultTemplate(template.id, 'followUp')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {getTemplateTypeIcon(template.templateType)}
                            </span>
                            <h3 className="font-semibold text-white">{template.name}</h3>
                            {selectedFollowUp === template.id && (
                              <Check className="w-4 h-4 text-purple-400" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {template.description || template.subject}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {template.templateType.replace('_', ' ')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {template.usageCount} uses
                            </span>
                            {template.difficultyLevel && (
                              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(template.difficultyLevel)}`}>
                                {template.difficultyLevel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {selectedFollowUp && (
                <button
                  onClick={() => clearDefaultTemplate('followUp')}
                  className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 px-4 border border-red-400/30 hover:border-red-400/50 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                  Clear Follow-up Template
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Current Settings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Current Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">Default Template:</span>
            <span className="text-white font-medium">
              {selectedDefault 
                ? templates.find(t => t.id === selectedDefault)?.name || "Not found"
                : "None selected"
              }
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-400">Follow-up Template:</span>
            <span className="text-white font-medium">
              {selectedFollowUp 
                ? templates.find(t => t.id === selectedFollowUp)?.name || "Not found"
                : "None selected"
              }
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
