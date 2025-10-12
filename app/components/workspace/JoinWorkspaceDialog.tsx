"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, Key, Lock, Hash } from "lucide-react";
import { toast } from "sonner";

interface JoinWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkspaceJoined: () => void;
}

export default function JoinWorkspaceDialog({
  open,
  onOpenChange,
  onWorkspaceJoined,
}: JoinWorkspaceDialogProps) {
  const [workspaceId, setWorkspaceId] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinMethod, setJoinMethod] = useState<"id" | "code">("id");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (joinMethod === "id") {
      if (!workspaceId.trim()) {
        toast.error("Please enter a workspace ID");
        return;
      }

      if (!password) {
        toast.error("Please enter the workspace password");
        return;
      }
    } else {
      if (!inviteCode.trim()) {
        toast.error("Please enter an invite code");
        return;
      }
    }

    setLoading(true);

    try {
      const response = joinMethod === "id" 
        ? await fetch("/api/workspaces/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId: workspaceId.trim(),
              password,
            }),
          })
        : await fetch("/api/workspaces/join-by-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inviteCode: inviteCode.trim(),
            }),
          });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join workspace");
      }

      if (data.success) {
        toast.success(`Successfully joined "${data.workspace.name}"!`);
        onWorkspaceJoined();
        onOpenChange(false);
        setWorkspaceId("");
        setPassword("");
        setInviteCode("");
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error joining workspace:", error);
      toast.error(error.message || "Failed to join workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Join Workspace
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose how you'd like to join a workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Join Method Selection */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={joinMethod === "id" ? "default" : "outline"}
              onClick={() => setJoinMethod("id")}
              className={joinMethod === "id" ? "bg-purple-600 hover:bg-purple-700 cursor-pointer" : "border-gray-700 cursor-pointer text-gray-300 hover:bg-gray-700"}
            >
              <Key className="h-4 w-4 mr-2" />
              Workspace ID
            </Button>
            <Button
              type="button"
              variant={joinMethod === "code" ? "default" : "outline"}
              onClick={() => setJoinMethod("code")}
              className={joinMethod === "code" ? "bg-purple-600 cursor-pointer hover:bg-purple-700" : "border-gray-700 cursor-pointer text-gray-300 hover:bg-gray-700"}
            >
              <Hash className="h-4 w-4 mr-2" />
              Invite Code
            </Button>
          </div>

          {joinMethod === "id" ? (
            <>
              <div>
                <Label htmlFor="workspaceId" className="text-white">Workspace ID</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="workspaceId"
                    type="text"
                    placeholder="Enter workspace ID"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700/50 text-white"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter workspace password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700/50 text-white"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor="inviteCode" className="text-white">Invite Code</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter invite code (e.g., WS-ABC12345)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="pl-10 bg-gray-900/50 border-gray-700/50 text-white"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Get this code from a workspace admin
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-700 cursor-pointer"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleJoin} 
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cursor-pointer"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}