import BackofficeClient from "./BackofficeClient";
import { AuthProvider } from "@/providers/AuthProvider";

export default function BackofficePage() {
  return (
    <AuthProvider>
      <BackofficeClient />
    </AuthProvider>
  );
}
