import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import Dashboard from "@/components/custom/dashboard/Dashboard";
import { isTokenExpired } from "@/lib/checkToken";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || isTokenExpired(session.accessToken)) {
    redirect("/login");
  }
  if (!session) {
    redirect("/login");
  }


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-1 p-6 overflow-auto">
        <Dashboard user={session.user} />
      </main>
    </div>
  );
}
