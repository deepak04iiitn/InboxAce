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
  UserX,
  Ban,
  Shield,
  ShieldOff,
  LogOut
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

interface BlockedUser {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
  blockedByUser: {
    id: string;
    name: string;
    email: string;
  };
  reason: string | null;
  blockedAt: string;
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
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBlockedUser, setSelectedBlockedUser] = useState<BlockedUser | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [unblockLoading, setUnblockLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | false>(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchWorkspace();
    fetchBlockedUsers();
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
        const isOwnerValue = data.workspace.user?.isOwner || false;
        setIsOwner(isOwnerValue);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching workspace:", error);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/blocked`);
      const data = await response.json();
      
      if (response.ok) {
        setBlockedUsers(data.blockedUsers);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching blocked users:", error);
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

  const handleBlockMember = async () => {
    if (!selectedMember) return;

    setBlockLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: selectedMember.user.id,
          reason: blockReason.trim() || null
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Member blocked successfully");
        setMembers(members.filter(m => m.id !== selectedMember.id));
        setShowBlockDialog(false);
        setSelectedMember(null);
        setBlockReason("");
        fetchBlockedUsers(); // Refresh blocked users list
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error blocking member:", error);
      toast.error(error.message || "Failed to block member");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedBlockedUser) return;

    setUnblockLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/block`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedBlockedUser.user.id }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("User unblocked successfully");
        setBlockedUsers(blockedUsers.filter(b => b.id !== selectedBlockedUser.id));
        setShowUnblockDialog(false);
        setSelectedBlockedUser(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      toast.error(error.message || "Failed to unblock user");
    } finally {
      setUnblockLoading(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    setLeaveLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Successfully left the workspace");
        // Redirect to workspace list or home page
        window.location.href = "/reachhub";
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error leaving workspace:", error);
      toast.error(error.message || "Failed to leave workspace");
    } finally {
      setLeaveLoading(false);
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
      setCopiedId(id);
      toast.success("Workspace ID copied to clipboard");
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      toast.error("Failed to copy workspace ID");
    }
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
            {isOwner 
              ? "Manage team members, workspace settings, and credentials"
              : "View team members and manage your participation"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Workspace Credentials - Only visible to owners */}
            {isOwner && (
              <>
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
              </>
            )}
            
            {/* Message for contributors about credentials */}
            {!isOwner && (
              <div className="md:col-span-2">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <h4 className="font-semibold text-blue-400">Access Information</h4>
                  </div>
                  <p className="text-sm text-blue-300">
                    Only workspace owners can view workspace credentials (invite codes, workspace ID, etc.). 
                    Contact the workspace owner if you need to invite someone.
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-white mb-2">Quick Actions</h4>
              <div className="space-y-2">
                {isOwner && (
                  <Button
                    onClick={() => setShowInviteDialog(true)}
                    className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite by Email
                  </Button>
                )}
                {!isOwner && (
                  <Button
                    onClick={() => setShowLeaveDialog(true)}
                    variant="destructive"
                    className="cursor-pointer w-full bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Workspace
                  </Button>
                )}
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
            {isOwner 
              ? "You have full control over all contributors. You can remove or block any team member."
              : "View team members and their activity"
            }
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
                      {workspace?.owner.id === member.user.id ? (
                        <span title="Workspace Owner">
                          <Crown className="h-4 w-4 text-yellow-500" />
                        </span>
                      ) : (
                        <UserCheck className="h-4 w-4 text-blue-500" />
                      )}
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
                  <Badge className={
                    workspace?.owner.id === member.user.id 
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }>
                    {workspace?.owner.id === member.user.id ? "OWNER" : "CONTRIBUTOR"}
                  </Badge>

                  {/* Actions - Only workspace owner can manage contributors */}
                  {isOwner && workspace?.owner.id !== member.user.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRemoveDialog(true);
                        }}
                        title="Remove member"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer bg-red-600 hover:bg-red-700"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowBlockDialog(true);
                        }}
                        title="Block member"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
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

      {/* Blocked Users List */}
      {blockedUsers.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              Blocked Users ({blockedUsers.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Users who have been blocked from this workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blockedUsers.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {blockedUser.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{blockedUser.user.name}</h4>
                        <Ban className="h-4 w-4 text-red-500" />
                        {workspace?.owner.id === blockedUser.user.id && (
                          <span title="Workspace Owner">
                            <Crown className="h-4 w-4 text-yellow-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{blockedUser.user.email}</p>
                      <p className="text-xs text-gray-500">
                        Blocked by {blockedUser.blockedByUser.name} on {new Date(blockedUser.blockedAt).toLocaleDateString()}
                      </p>
                      {blockedUser.reason && (
                        <p className="text-xs text-gray-500 mt-1">
                          Reason: {blockedUser.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      onClick={() => {
                        setSelectedBlockedUser(blockedUser);
                        setShowUnblockDialog(true);
                      }}
                      title="Unblock user"
                    >
                      <ShieldOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Block Member Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              Block Team Member
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Block <strong>{selectedMember?.user.name}</strong> from this workspace. 
              They will be removed and unable to rejoin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white">Reason (Optional)</label>
              <Input
                placeholder="Enter reason for blocking..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="bg-gray-900/50 border-gray-700/50 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBlockDialog(false);
                setBlockReason("");
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-700 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlockMember}
              disabled={blockLoading}
              className="cursor-pointer bg-red-600 hover:bg-red-700"
            >
              {blockLoading ? "Blocking..." : "Block Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock User Dialog */}
      <AlertDialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-green-500" />
              Unblock User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to unblock <strong>{selectedBlockedUser?.user.name}</strong>? 
              They will be able to rejoin this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblockUser}
              disabled={unblockLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {unblockLoading ? "Unblocking..." : "Unblock User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Workspace Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              Leave Workspace
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to leave <strong>{workspace?.name}</strong>? 
              You will lose access to all workspace data and will need to be re-invited to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveWorkspace}
              disabled={leaveLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {leaveLoading ? "Leaving..." : "Leave Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
