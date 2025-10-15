import UserSettings from "@/components/settings/UserSettings";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <UserSettings />
      </div>
    </div>
  );
}
