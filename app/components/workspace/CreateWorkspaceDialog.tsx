"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users, Lock, FileText } from "lucide-react";
import { toast } from "sonner";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkspaceCreated: () => void;
}

export default function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onWorkspaceCreated,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/workspaces/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          password,
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create workspace");
      }

      toast.success("Workspace created successfully!");
      toast.info(`Workspace ID: ${data.workspace.id}`, {
        description: "Share this ID with your team members",
        duration: 8000,
      });

      // Reset form
      setName("");
      setPassword("");
      setDescription("");
      onWorkspaceCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      toast.error(error.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create ReachHub Workspace
          </DialogTitle>
          <DialogDescription>
            Create a collaborative workspace to manage cold emails with your team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Workspace Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., Sales Team Q4 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Members will need this password to join
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What is this workspace for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              How it works:
            </p>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs list-disc list-inside">
              <li>You'll be the admin of this workspace</li>
              <li>Share the Workspace ID with team members</li>
              <li>Everyone uses their own email accounts</li>
              <li>Track team performance and collaborate on leads</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading} className="cursor-pointer">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
