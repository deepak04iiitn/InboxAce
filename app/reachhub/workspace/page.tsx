"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import WorkspaceList from "@/app/components/workspace/WorkspaceList";
import CreateWorkspaceDialog from "@/app/components/workspace/CreateWorkspaceDialog";
import JoinWorkspaceDialog from "@/app/components/workspace/JoinWorkspaceDialog";


export default function WorkspacePage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-[95vw] mx-auto mt-20 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">ReachHub Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with your team on cold email outreach
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setJoinDialogOpen(true)} variant="outline" className="cursor-pointer">
            <Users className="h-4 w-4 mr-2" />
            Join Workspace
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>
        </div>

        {/* Info Card */}
        <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">How ReachHub Works</CardTitle>
          <CardDescription className="text-gray-400">Multiply your outreach with team collaboration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-white">1. Create or Join</h3>
              <p className="text-sm text-gray-400">
                Create a workspace as admin or join an existing one with a workspace ID
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-white">2. Shared Sheet</h3>
              <p className="text-sm text-gray-400">
                All members add jobs to one shared sheet. Each uses their own email account
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-white">3. Track Together</h3>
              <p className="text-sm text-gray-400">
                Monitor team stats, add comments, and achieve goals collaboratively
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Workspace List */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Your Workspaces</h2>
          <WorkspaceList refresh={refreshKey} />
        </div>
      </div>

        {/* Dialogs */}
        <CreateWorkspaceDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onWorkspaceCreated={handleRefresh}
        />
        <JoinWorkspaceDialog
          open={joinDialogOpen}
          onOpenChange={setJoinDialogOpen}
          onWorkspaceJoined={handleRefresh}
        />
      </div>
  );
}
