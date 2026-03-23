"use client";

import { logoutAction } from "@/app/actions/auth";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <button
      onClick={() => logoutAction()}
      className={`text-sm font-medium text-red-600 hover:text-red-800 transition-colors ${className}`}
    >
      Sair
    </button>
  );
}
