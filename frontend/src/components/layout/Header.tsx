import { useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  ChevronDown,
  CircleUserRound,
  LogOut,
  MoonStar,
  Settings,
  SunMedium,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { authStore, useAuth } from "@/lib/auth-store";
import { themeStore, useTheme } from "@/lib/theme-store";

export function Header() {
  const router = useRouter();
  const auth = useAuth();
  const theme = useTheme();

  useEffect(() => {
    void authStore.bootstrap();
  }, []);

  const initials = auth.user?.name
    ? auth.user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "QR";

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/72 shadow-soft backdrop-blur-xl">
      <div className="h-16 px-4 md:px-8 flex items-center gap-4">
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold tracking-tight">QuickResolveAI</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative h-10 w-10 rounded-xl border border-border/80 bg-card/70 hover-lift flex items-center justify-center surface-ring"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-background)_65%,transparent)]" />
          </button>

          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => themeStore.toggle()}
            className="h-10 w-10 rounded-xl border border-border/80 bg-card/70 hover-lift flex items-center justify-center surface-ring"
          >
            {theme === "dark" ? (
              <SunMedium className="h-4 w-4" />
            ) : (
              <MoonStar className="h-4 w-4" />
            )}
          </button>

          {auth.user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Open profile menu"
                  className="group flex items-center gap-2 rounded-full border border-border/80 bg-card/70 pl-1 pr-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover-lift"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-primary/25 shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-3 rounded-3xl border-border/70 bg-card/70">
                <div className="space-y-3">
                  <div className="rounded-2xl glass-card border border-border/80 px-4 py-3 shadow-soft surface-ring">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 ring-1 ring-border">
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {auth.user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{auth.user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
                    >
                      <CircleUserRound className="h-4 w-4 text-muted-foreground" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        authStore.logout();
                        void router.navigate({ to: "/login" });
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
