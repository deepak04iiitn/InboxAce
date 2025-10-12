"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Table, Users } from "lucide-react";
import WorkspaceSpreadsheet from "@/app/components/workspace/WorkspaceSpreadsheet";
import WorkspaceDashboard from "@/app/components/workspace/WorkspaceDashboard";
import MemberManagement from "@/app/components/workspace/MemberManagement";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-[95vw] mx-auto mt-20">
        
        <Tabs defaultValue="spreadsheet" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-800/50 border-gray-700/50">
            <TabsTrigger value="spreadsheet" className="text-white flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Table className="h-4 w-4" />
              Sheet
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-white flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="members" className="text-white flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
          </TabsList>

        <TabsContent value="spreadsheet">
          <WorkspaceSpreadsheet workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="dashboard">
          <WorkspaceDashboard workspaceId={workspaceId} />
        </TabsContent>

          <TabsContent value="members">
            <MemberManagement workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
