import JobTracker from "@/app/components/jobs/JobTracker";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CreateTemplatePage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/jobs-tracker");
  }

  return <JobTracker />;
}
