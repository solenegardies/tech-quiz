import { SignupForm } from "@/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <SignupForm />
      </div>
    </div>
  );
}
