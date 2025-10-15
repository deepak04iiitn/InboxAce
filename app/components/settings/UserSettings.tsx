"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, RefreshCw } from "lucide-react";
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

export default function UserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    defaultFollowUpInterval: 1,
    customDefaultSubject: "",
    customDefaultBody: "",
    customDefaultFollowUpSubject: "",
    customDefaultFollowUpBody: "",
  });

  useEffect(() => {
    fetchSettings();
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
            Customize your default email templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultSubject" className="text-white">
              Default Subject Line
            </Label>
            <Input
              id="defaultSubject"
              value={formData.customDefaultSubject}
              onChange={(e) => handleInputChange("customDefaultSubject", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter default subject line..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultBody" className="text-white">
              Default Email Body
            </Label>
            <textarea
              id="defaultBody"
              value={formData.customDefaultBody}
              onChange={(e) => handleInputChange("customDefaultBody", e.target.value)}
              className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter default email body..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpSubject" className="text-white">
              Default Follow-up Subject Line
            </Label>
            <Input
              id="followUpSubject"
              value={formData.customDefaultFollowUpSubject}
              onChange={(e) => handleInputChange("customDefaultFollowUpSubject", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter default follow-up subject line..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpBody" className="text-white">
              Default Follow-up Email Body
            </Label>
            <textarea
              id="followUpBody"
              value={formData.customDefaultFollowUpBody}
              onChange={(e) => handleInputChange("customDefaultFollowUpBody", e.target.value)}
              className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter default follow-up email body..."
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
