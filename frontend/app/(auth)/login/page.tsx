import { LoginForm } from "@/components/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Carteira Digital</h1>
          <p className="mt-2 text-gray-600">Faça login para continuar</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
