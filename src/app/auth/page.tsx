"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SignInButton from "@/components/auth/SignInButton";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (user && !loading) {
      router.push("/play");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center pb-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-16">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold">SwipeTrade</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Sign in to save your progress, compete on leaderboards, and sync
          across devices.
        </p>

        <div className="mt-8">
          <SignInButton size="lg" className="w-full" />
        </div>

        <p className="mt-6 text-xs text-text-muted">
          You can play without signing in — your data is saved locally.
        </p>
      </div>
    </main>
  );
}
