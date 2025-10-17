-- CreateTable
CREATE TABLE "WorkspaceBlockedUser" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockedBy" TEXT NOT NULL,
    "reason" TEXT,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceBlockedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceBlockedUser_workspaceId_idx" ON "WorkspaceBlockedUser"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceBlockedUser_userId_idx" ON "WorkspaceBlockedUser"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceBlockedUser_blockedBy_idx" ON "WorkspaceBlockedUser"("blockedBy");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceBlockedUser_workspaceId_userId_key" ON "WorkspaceBlockedUser"("workspaceId", "userId");

-- AddForeignKey
ALTER TABLE "WorkspaceBlockedUser" ADD CONSTRAINT "WorkspaceBlockedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceBlockedUser" ADD CONSTRAINT "WorkspaceBlockedUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceBlockedUser" ADD CONSTRAINT "WorkspaceBlockedUser_blockedBy_fkey" FOREIGN KEY ("blockedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
