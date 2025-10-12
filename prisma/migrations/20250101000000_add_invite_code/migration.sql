-- Add invite code to workspace with default value
ALTER TABLE "Workspace" ADD COLUMN "inviteCode" TEXT DEFAULT 'WS-' || substr(md5(random()::text), 1, 8);

-- Generate unique invite codes for existing workspaces
UPDATE "Workspace" SET "inviteCode" = 'WS-' || substr(md5(random()::text), 1, 8) WHERE "inviteCode" IS NULL;

-- Make invite code unique and not null
ALTER TABLE "Workspace" ALTER COLUMN "inviteCode" SET NOT NULL;
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_inviteCode_key" UNIQUE ("inviteCode");
