-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultTemplateId" TEXT;

-- CreateIndex
CREATE INDEX "EmailTemplate_userId_idx" ON "EmailTemplate"("userId");

-- CreateIndex
CREATE INDEX "EmailTemplate_category_idx" ON "EmailTemplate"("category");

-- CreateIndex
CREATE INDEX "EmailTemplate_isPublic_idx" ON "EmailTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "EmailTemplate_isCommunity_idx" ON "EmailTemplate"("isCommunity");

-- CreateIndex
CREATE INDEX "Job_templateId_idx" ON "Job"("templateId");

-- CreateIndex
CREATE INDEX "JobBatch_userId_idx" ON "JobBatch"("userId");

-- CreateIndex
CREATE INDEX "JobBatch_templateId_idx" ON "JobBatch"("templateId");

-- CreateIndex
CREATE INDEX "User_defaultTemplateId_idx" ON "User"("defaultTemplateId");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultTemplateId_fkey" FOREIGN KEY ("defaultTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
