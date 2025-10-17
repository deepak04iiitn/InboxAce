"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, RefreshCw, Mail, Check, X } from "lucide-react";
import { toast } from "sonner";

interface UserSettings {
  id: string;
  name: string;
  email: string;
  defaultFollowUpInterval: number;
  defaultTemplateId?: string;
  defaultFollowUpTemplateId?: string;
  customDefaultSubject?: string;
  customDefaultBody?: string;
  customDefaultFollowUpSubject?: string;
  customDefaultFollowUpBody?: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  templateType: string;
  description?: string;
}

export default function UserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    defaultFollowUpInterval: 1,
    customDefaultSubject: "",
    customDefaultBody: "",
    customDefaultFollowUpSubject: "",
    customDefaultFollowUpBody: "",
  });
  const [selectedDefaultTemplate, setSelectedDefaultTemplate] = useState<string | null>(null);
  const [selectedFollowUpTemplate, setSelectedFollowUpTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setFormData({
          defaultFollowUpInterval: data.settings.defaultFollowUpInterval || 1,
          customDefaultSubject: data.settings.customDefaultSubject || "",
          customDefaultBody: data.settings.customDefaultBody || "",
          customDefaultFollowUpSubject: data.settings.customDefaultFollowUpSubject || "",
          customDefaultFollowUpBody: data.settings.customDefaultFollowUpBody || "",
        });
        setSelectedDefaultTemplate(data.settings.defaultTemplateId || null);
        setSelectedFollowUpTemplate(data.settings.defaultFollowUpTemplateId || null);
      } else {
        toast.error(data.error || "Failed to load settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates/my-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          defaultTemplateId: selectedDefaultTemplate,
          defaultFollowUpTemplateId: selectedFollowUpTemplate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        toast.success("Settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateSelect = async (templateId: string | null, type: 'default' | 'followUp') => {
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
        if (type === 'default') {
          setSelectedDefaultTemplate(templateId);
        } else {
          setSelectedFollowUpTemplate(templateId);
        }
        toast.success(`${type === 'default' ? 'Default' : 'Follow-up'} template updated successfully!`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("An error occurred while saving");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">User Settings</h2>
        <p className="text-zinc-400 mt-1">
          Configure your default settings for email campaigns and follow-ups
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Follow-up Settings</CardTitle>
          <CardDescription className="text-zinc-400">
            Set your default follow-up interval for email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="followUpInterval" className="text-white">
              Default Follow-up Interval (Days)
            </Label>
            <Input
              id="followUpInterval"
              type="number"
              min="1"
              max="30"
              value={formData.defaultFollowUpInterval}
              onChange={(e) => handleInputChange("defaultFollowUpInterval", parseInt(e.target.value) || 1)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="1"
            />
            <p className="text-sm text-zinc-500">
              How many days to wait before sending follow-up emails (1-30 days)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Default Email Templates</CardTitle>
          <CardDescription className="text-zinc-400">
            Select your default email templates for applications and follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Default Application Template</h3>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-zinc-400 mb-4">No templates available</p>
                <a
                  href="/templates/create"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Your First Template
                </a>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {templates
                  .filter(template => 
                    template.templateType === 'APPLICATION' || 
                    template.templateType === 'REFERRAL_REQUEST' ||
                    template.templateType === 'COLD_OUTREACH'
                  )
                  .map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border transition cursor-pointer ${
                        selectedDefaultTemplate === template.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
                      }`}
                      onClick={() => handleTemplateSelect(template.id, 'default')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {getTemplateTypeIcon(template.templateType)}
                            </span>
                            <h4 className="font-semibold text-white">{template.name}</h4>
                            {selectedDefaultTemplate === template.id && (
                              <Check className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                            {template.description || template.subject}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>{template.templateType.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {selectedDefaultTemplate && (
              <button
                onClick={() => handleTemplateSelect(null, 'default')}
                className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 px-4 border border-red-400/30 hover:border-red-400/50 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                Clear Default Template
              </button>
            )}
          </div>

          {/* Follow-up Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Default Follow-up Template</h3>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-zinc-400 mb-4">No templates available</p>
                <a
                  href="/templates/create"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Your First Template
                </a>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
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
                        selectedFollowUpTemplate === template.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
                      }`}
                      onClick={() => handleTemplateSelect(template.id, 'followUp')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {getTemplateTypeIcon(template.templateType)}
                            </span>
                            <h4 className="font-semibold text-white">{template.name}</h4>
                            {selectedFollowUpTemplate === template.id && (
                              <Check className="w-4 h-4 text-purple-400" />
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                            {template.description || template.subject}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>{template.templateType.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {selectedFollowUpTemplate && (
              <button
                onClick={() => handleTemplateSelect(null, 'followUp')}
                className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 px-4 border border-red-400/30 hover:border-red-400/50 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                Clear Follow-up Template
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Custom Template Content</CardTitle>
          <CardDescription className="text-zinc-400">
            Override template content with your custom text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultSubject" className="text-white">
              Custom Default Subject Line
            </Label>
            <Input
              id="defaultSubject"
              value={formData.customDefaultSubject}
              onChange={(e) => handleInputChange("customDefaultSubject", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter custom subject line (overrides template)..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultBody" className="text-white">
              Custom Default Email Body
            </Label>
            <textarea
              id="defaultBody"
              value={formData.customDefaultBody}
              onChange={(e) => handleInputChange("customDefaultBody", e.target.value)}
              className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter custom email body (overrides template)..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpSubject" className="text-white">
              Custom Follow-up Subject Line
            </Label>
            <Input
              id="followUpSubject"
              value={formData.customDefaultFollowUpSubject}
              onChange={(e) => handleInputChange("customDefaultFollowUpSubject", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter custom follow-up subject line (overrides template)..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpBody" className="text-white">
              Custom Follow-up Email Body
            </Label>
            <textarea
              id="followUpBody"
              value={formData.customDefaultFollowUpBody}
              onChange={(e) => handleInputChange("customDefaultFollowUpBody", e.target.value)}
              className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter custom follow-up email body (overrides template)..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
