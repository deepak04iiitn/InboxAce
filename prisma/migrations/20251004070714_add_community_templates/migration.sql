-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "createdByName" TEXT,
ADD COLUMN     "downloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isCommunity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TemplateLike" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateLike_templateId_idx" ON "TemplateLike"("templateId");

-- CreateIndex
CREATE INDEX "TemplateLike_userId_idx" ON "TemplateLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateLike_templateId_userId_key" ON "TemplateLike"("templateId", "userId");

-- AddForeignKey
ALTER TABLE "TemplateLike" ADD CONSTRAINT "TemplateLike_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
