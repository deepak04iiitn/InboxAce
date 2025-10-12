"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Trash2, 
  Copy, 
  Check,
  AlertTriangle,
  UserCheck,
  UserX
} from "lucide-react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
  role: "ADMIN" | "CONTRIBUTOR";
  leadsAdded: number;
  emailsSent: number;
  repliesReceived: number;
  joinedAt: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  inviteCode: string;
}

export default function MemberManagement({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchWorkspace();
  }, [workspaceId]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`);
      const data = await response.json();
      
      if (response.ok) {
        setMembers(data.members);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspace = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`);
      const data = await response.json();
      
      if (response.ok) {
        setWorkspace(data.workspace);
        setIsOwner(data.workspace.owner.id === data.user?.id);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching workspace:", error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviteLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Invitation sent successfully");
        setInviteEmail("");
        setShowInviteDialog(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error inviting member:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setRemoveLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMember.id }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Member removed successfully");
        setMembers(members.filter(m => m.id !== selectedMember.id));
        setShowRemoveDialog(false);
        setSelectedMember(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(error.message || "Failed to remove member");
    } finally {
      setRemoveLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (!workspace?.inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(workspace.inviteCode);
      setCopied(true);
      toast.success("Invite code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy invite code");
    }
  };

  const copyWorkspaceId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);
      toast.success("Workspace ID copied to clipboard");
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      toast.error("Failed to copy workspace ID");
    }
  };

  const getRoleIcon = (role: string) => {
    return role === "ADMIN" ? <Crown className="h-4 w-4 text-yellow-500" /> : <UserCheck className="h-4 w-4 text-blue-500" />;
  };

  const getRoleColor = (role: string) => {
    return role === "ADMIN" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Workspace Info */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            {workspace?.name} - Team Management
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage team members and workspace settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">Workspace Invite Code</h4>
              <div className="flex items-center gap-2">
                <Input
                  value={workspace?.inviteCode || ""}
                  readOnly
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                />
                <Button
                  size="sm"
                  onClick={copyInviteCode}
                  className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Share this code with team members to let them join
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Workspace ID</h4>
              <div className="flex items-center gap-2">
                <Input
                  value={workspaceId}
                  readOnly
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                />
                <Button
                  size="sm"
                  onClick={() => copyWorkspaceId(workspaceId)}
                  className="bg-gray-600 hover:bg-gray-700 cursor-pointer"
                >
                  {copiedId === workspaceId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Use this ID with password for traditional joining
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite by Email
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Team Members ({members.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Manage permissions and view member activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{member.user.name}</h4>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-sm text-gray-400">{member.user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-white">{member.leadsAdded}</p>
                      <p className="text-xs text-gray-400">Leads</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">{member.emailsSent}</p>
                      <p className="text-xs text-gray-400">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">{member.repliesReceived}</p>
                      <p className="text-xs text-gray-400">Replies</p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <Badge className={getRoleColor(member.role)}>
                    {member.role}
                  </Badge>

                  {/* Actions */}
                  {isOwner && member.role !== "ADMIN" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedMember(member);
                        setShowRemoveDialog(true);
                      }}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No members found</p>
                <p className="text-sm">Invite team members to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Invite Team Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Send an email invitation to join this workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white">Email Address</label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-gray-900/50 border-gray-700/50 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-700 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteMember}
              disabled={inviteLoading}
              className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {inviteLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Remove Team Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to remove <strong>{selectedMember?.user.name}</strong> from this workspace? 
              This action cannot be undone and they will lose access to all workspace data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removeLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeLoading ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
