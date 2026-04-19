import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authStore, useAuth } from "@/lib/auth-store";
import { Bot, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login – QuickResolveAI" },
      { name: "description", content: "Sign in to QuickResolveAI." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.user) {
      void router.navigate({ to: "/" });
    }
  }, [auth.user, router]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      await authStore.login({ email, password });
      toast.success("Welcome back");
      void router.navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 flex items-center justify-center">
      <div className="ambient-orb -left-25 top-20 h-64 w-64 bg-primary/18" />
      <div className="ambient-orb -right-22.5 bottom-7.5 h-72 w-72 bg-accent/22" />
      <div className="relative w-full max-w-md rounded-3xl border border-border/80 section-panel p-8 shadow-soft">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/55 to-transparent" />
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <p className="title-kicker">Welcome Back</p>
          <h1 className="font-display text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Access your QuickResolveAI profile.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-9"
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pl-9"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary shadow-glow"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
