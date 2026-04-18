import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { authStore, useAuth } from "@/lib/auth-store";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import { UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !window.localStorage.getItem(AUTH_TOKEN_KEY)) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Profile – QuickResolveAI" },
      { name: "description", content: "View the authenticated user profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    void authStore.bootstrap();
  }, []);

  useEffect(() => {
    if (auth.hydrated && !auth.loading && !auth.user) {
      void router.navigate({ to: "/login" });
    }
  }, [auth.hydrated, auth.loading, auth.user, router]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Profile</h1>
          <p className="mt-1 text-muted-foreground">Your authenticated account details.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
              <UserCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                {auth.user?.name ?? "Loading profile..."}
              </h2>
              <p className="text-sm text-muted-foreground">
                {auth.user?.email ?? "Fetching account data"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <ProfileRow label="Name" value={auth.user?.name ?? "-"} />
            <ProfileRow label="Email" value={auth.user?.email ?? "-"} />
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => {
                authStore.logout();
                void router.navigate({ to: "/login" });
              }}
            >
              Logout
            </Button>
            <Button variant="outline" onClick={() => void router.navigate({ to: "/" })}>
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
