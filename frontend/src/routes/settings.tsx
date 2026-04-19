import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ name: "description", content: "Account settings and preferences." }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">Account preferences and application options.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-sm text-muted-foreground">
            Settings are ready for future preferences like notifications, profile updates, and
            security controls.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => void router.navigate({ to: "/" })}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
