import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import EnhancedTemplateBuilder from "@/app/components/templates/EnhancedTemplateBuilder";

export default async function CreateTemplatePage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/templates/create");
  }

  return <EnhancedTemplateBuilder />;
}
