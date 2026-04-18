import { useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Bell, Bot, ChevronDown, LogOut, Settings, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { authStore, useAuth } from "@/lib/auth-store";

export function Header() {
  const router = useRouter();
  const auth = useAuth();

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
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="h-full px-4 md:px-8 flex items-center gap-4">
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">QuickResolveAI</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button className="relative h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          </button>
          {auth.user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Open profile menu"
                  className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20 shadow-sm transition-transform duration-200 hover:scale-[1.03]">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-3">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-secondary/50 px-4 py-3">
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
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
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
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
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
