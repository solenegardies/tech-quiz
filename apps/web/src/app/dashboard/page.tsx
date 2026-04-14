import DashboardClient from "./DashboardClient";
import { AuthProvider } from "@/providers/AuthProvider";

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardClient />
    </AuthProvider>
  );
}
