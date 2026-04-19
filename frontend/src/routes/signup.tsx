import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authStore, useAuth } from "@/lib/auth-store";
import { Bot, CircleUserRound, Mail, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up – QuickResolveAI" },
      { name: "description", content: "Create your QuickResolveAI account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const [name, setName] = useState("");
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
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill out all fields");
      return;
    }

    setLoading(true);
    try {
      await authStore.signup({ name, email, password });
      toast.success("Account created. Please sign in.");
      void router.navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 flex items-center justify-center">
      <div className="auth-glow" />
      <div className="auth-bubble auth-bubble-accent -left-14 bottom-7 h-58 w-58" />
      <div className="auth-bubble auth-bubble-primary auth-delay-1 -right-14 top-12 h-72 w-72" />
      <div className="auth-bubble auth-bubble-accent auth-bubble-soft auth-delay-2 left-18 top-16 h-22 w-22" />
      <div className="auth-bubble auth-bubble-primary auth-bubble-soft auth-delay-3 right-24 bottom-14 h-20 w-20" />
      <div className="auth-bubble auth-bubble-blush auth-bubble-soft auth-delay-1 left-34 bottom-24 h-14 w-14" />
      <div className="auth-bubble auth-bubble-sky auth-bubble-soft auth-delay-2 right-38 top-30 h-16 w-16" />
      <div className="auth-bubble auth-bubble-primary auth-bubble-soft auth-delay-3 left-1/2 bottom-8 h-12 w-12 -translate-x-1/2" />
      <div className="auth-bubble auth-bubble-blush auth-delay-2 right-12 bottom-32 h-20 w-20" />
      <div className="auth-bubble auth-bubble-sky auth-bubble-soft auth-delay-1 left-12 top-30 h-12 w-12" />
      <div className="auth-ring left-8 bottom-6 h-72 w-72" />
      <div className="auth-ring auth-delay-2 right-10 top-8 h-80 w-80" />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/80 section-panel p-8 shadow-soft">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/55 to-transparent" />
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <p className="title-kicker">Get Started</p>
          <h1 className="font-display text-3xl font-bold">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register to access your profile and session.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <CircleUserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="pl-9"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          </div>

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
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary shadow-glow"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
