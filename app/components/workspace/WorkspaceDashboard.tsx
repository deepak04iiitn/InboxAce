"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, MessageSquare, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";

interface DashboardData {
  workspace: {
    id: string;
    name: string;
    description: string | null;
  };
  stats: {
    totalJobs: number;
    totalEmailsSent: number;
    totalReplies: number;
    totalFollowUps: number;
    totalMembers: number;
    replyRate: string;
  };
  statusBreakdown: {
    NOT_SENT: number;
    SCHEDULED: number;
    SENT: number;
    REPLIED: number;
    FOLLOW_UP_SENT: number;
  };
  memberStats: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      profileImage: string | null;
    };
    role: string;
    leadsAdded: number;
    emailsSent: number;
    repliesReceived: number;
    joinedAt: string;
  }>;
  recentJobs: Array<{
    id: string;
    company: string;
    position: string;
    recipientName: string;
    status: string;
    createdAt: string;
    userId: string;
  }>;
}

export default function WorkspaceDashboard({ workspaceId }: { workspaceId: string }) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [workspaceId]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/dashboard`);
      const data = await response.json();

      if (response.ok) {
        setDashboard(data.dashboard);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboard) {
    return <div>Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-6 text-white">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboard.stats.totalEmailsSent}</div>
            <p className="text-xs text-gray-400">
              From {dashboard.stats.totalJobs} total jobs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Replies</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboard.stats.totalReplies}</div>
            <p className="text-xs text-gray-400">
              {dashboard.stats.replyRate}% reply rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Follow-ups Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboard.stats.totalFollowUps}</div>
            <p className="text-xs text-gray-400">
              Automated follow-up emails
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Team Members</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboard.stats.totalMembers}</div>
            <p className="text-xs text-gray-400">
              Active collaborators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Email Status Breakdown</CardTitle>
          <CardDescription className="text-gray-400">Current status of all jobs in workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <p className="text-sm font-medium text-gray-400">Not Sent</p>
              <p className="text-2xl font-bold text-white">{dashboard.statusBreakdown.NOT_SENT}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-white">{dashboard.statusBreakdown.SCHEDULED}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Sent</p>
              <p className="text-2xl font-bold text-white">{dashboard.statusBreakdown.SENT}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Replied</p>
              <p className="text-2xl font-bold text-white">{dashboard.statusBreakdown.REPLIED}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Follow-up Sent</p>
              <p className="text-2xl font-bold text-white">{dashboard.statusBreakdown.FOLLOW_UP_SENT}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Performance */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Member Performance</CardTitle>
          <CardDescription className="text-gray-400">Individual contributions to the workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard.memberStats.map((member) => (
              <div key={member.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.user.name}</p>
                    <p className="text-sm text-gray-400">{member.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-white">{member.leadsAdded}</p>
                    <p className="text-xs text-gray-400">Leads</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.emailsSent}</p>
                    <p className="text-xs text-gray-400">Sent</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.repliesReceived}</p>
                    <p className="text-xs text-gray-400">Replies</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-400">Latest jobs added to the workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboard.recentJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium text-white">{job.company}</p>
                  <p className="text-sm text-gray-400">
                    {job.position} • {job.recipientName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                    {job.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
