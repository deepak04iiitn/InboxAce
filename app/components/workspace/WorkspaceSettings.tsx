"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, RefreshCw, Settings } from "lucide-react";
import { toast } from "sonner";

interface WorkspaceSettings {
  id: string;
  name: string;
  description?: string;
  defaultFollowUpInterval: number;
  totalEmailsSent: number;
  totalReplies: number;
  totalOpportunities: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceSettingsProps {
  workspaceId: string;
}

export default function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultFollowUpInterval: 1,
  });

  useEffect(() => {
    fetchSettings();
  }, [workspaceId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/settings`);
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setFormData({
          name: data.settings.name || "",
          description: data.settings.description || "",
          defaultFollowUpInterval: data.settings.defaultFollowUpInterval || 1,
        });
      } else {
        toast.error(data.error || "Failed to load workspace settings");
      }
    } catch (error) {
      console.error("Error fetching workspace settings:", error);
      toast.error("Failed to load workspace settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        toast.success("Workspace settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save workspace settings");
      }
    } catch (error) {
      console.error("Error saving workspace settings:", error);
      toast.error("Failed to save workspace settings");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading workspace settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-8">
        <Settings className="h-12 w-12 mx-auto text-zinc-500 mb-4" />
        <p className="text-zinc-400">Failed to load workspace settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Workspace Settings</h2>
        <p className="text-zinc-400 mt-1">
          Configure settings for this workspace
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">General Settings</CardTitle>
          <CardDescription className="text-zinc-400">
            Basic workspace information and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspaceName" className="text-white">
              Workspace Name
            </Label>
            <Input
              id="workspaceName"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter workspace name..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspaceDescription" className="text-white">
              Description
            </Label>
            <textarea
              id="workspaceDescription"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workspace description..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Follow-up Settings</CardTitle>
          <CardDescription className="text-zinc-400">
            Set the default follow-up interval for all jobs in this workspace
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
              How many days to wait before sending follow-up emails for workspace jobs (1-30 days)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Workspace Statistics</CardTitle>
          <CardDescription className="text-zinc-400">
            Current workspace performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-zinc-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {settings.totalEmailsSent}
              </div>
              <div className="text-sm text-zinc-400">Emails Sent</div>
            </div>
            <div className="text-center p-4 bg-zinc-800 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {settings.totalReplies}
              </div>
              <div className="text-sm text-zinc-400">Replies Received</div>
            </div>
            <div className="text-center p-4 bg-zinc-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {settings.totalOpportunities}
              </div>
              <div className="text-sm text-zinc-400">Opportunities</div>
            </div>
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
