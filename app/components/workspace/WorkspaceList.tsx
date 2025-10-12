"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, MessageSquare, Calendar, Crown, UserPlus, LogOut, Trash2, ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  isOwner: boolean;
  userRole: string;
  totalEmailsSent: number;
  totalReplies: number;
  totalOpportunities: number;
  memberCount: number;
  jobCount: number;
  createdAt: string;
}

export default function WorkspaceList({ refresh }: { refresh: number }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, [refresh]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces/list");
      const data = await response.json();

      if (response.ok) {
        setWorkspaces(data.workspaces);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkspace) return;

    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Workspace deleted successfully");
        fetchWorkspaces();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      toast.error(error.message || "Failed to delete workspace");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedWorkspace(null);
    }
  };

  const handleLeave = async () => {
    if (!selectedWorkspace) return;

    try {
      const response = await fetch("/api/workspaces/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: selectedWorkspace.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Left workspace successfully");
        fetchWorkspaces();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error leaving workspace:", error);
      toast.error(error.message || "Failed to leave workspace");
    } finally {
      setLeaveDialogOpen(false);
      setSelectedWorkspace(null);
    }
  };

  const copyWorkspaceId = async (workspaceId: string) => {
    try {
      await navigator.clipboard.writeText(workspaceId);
      setCopiedId(workspaceId);
      toast.success("Workspace ID copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy workspace ID");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Workspaces Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create or join a workspace to start collaborating
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-white">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="hover:shadow-lg transition-shadow bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-white">
                    {workspace.name}
                    {workspace.isOwner && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1 text-gray-400">
                    {workspace.description || "No description"}
                  </CardDescription>
                </div>
                <Badge variant={workspace.userRole === "ADMIN" ? "default" : "secondary"}>
                  {workspace.userRole}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">{workspace.totalEmailsSent}</p>
                    <p className="text-xs text-gray-400">Emails Sent</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">{workspace.totalReplies}</p>
                    <p className="text-xs text-gray-400">Replies</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">{workspace.memberCount}</p>
                    <p className="text-xs text-gray-400">Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">{workspace.jobCount}</p>
                    <p className="text-xs text-gray-400">Jobs</p>
                  </div>
                </div>
              </div>

              {/* Owner info and Workspace ID */}
              <div className="space-y-1">
                <div className="text-xs text-gray-400">
                  Owner: {workspace.owner.name}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">ID: {workspace.id}</span>
                  <button
                    onClick={() => copyWorkspaceId(workspace.id)}
                    className="text-gray-500 hover:text-gray-300 transition cursor-pointer"
                    title="Copy workspace ID"
                  >
                    {copiedId === workspace.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 cursor-pointer"
                  onClick={() => router.push(`/reachhub/workspace/${workspace.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>

                {workspace.isOwner ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedWorkspace(workspace);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedWorkspace(workspace);
                      setLeaveDialogOpen(true);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedWorkspace?.name}" and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave "{selectedWorkspace?.name}"? You'll need the workspace ID and password to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave}>
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}