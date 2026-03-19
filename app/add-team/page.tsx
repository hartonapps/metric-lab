// app/add-team/page.tsx
import TeamForm from "@/components/TeamForm";

export const metadata = { title: "Add Team Member" };

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <TeamForm />
      </div>
    </main>
  );
}
