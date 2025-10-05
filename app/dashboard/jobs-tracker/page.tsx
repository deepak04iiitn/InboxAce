import JobSpreadsheet from "@/app/components/job-tracker/JobSpreadsheet";
import JobTrackerSpreadsheet from "@/app/components/job-tracker/JobTrackerSpreadsheet";
// import JobTracker from "@/app/components/jobs/JobTracker";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CreateTemplatePage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/jobs-tracker");
  }

  return <JobTrackerSpreadsheet />;
}
