import { LoginForm } from "@/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <LoginForm />
      </div>
    </div>
  );
}
