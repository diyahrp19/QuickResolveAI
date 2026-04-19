import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { themeStore } from "@/lib/theme-store";

import appCss from "../styles.css?url";

const projectFavicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='8' y1='8' x2='56' y2='56' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%230ea5e9'/%3E%3Cstop offset='1' stop-color='%2314b8a6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='4' y='4' width='56' height='56' rx='16' fill='url(%23g)'/%3E%3Cpath d='M32 20c4.4 0 8 3.6 8 8v6.5c0 4.4-3.6 8-8 8s-8-3.6-8-8V28c0-4.4 3.6-8 8-8Z' fill='white'/%3E%3Ccircle cx='29' cy='31' r='1.7' fill='%230f172a'/%3E%3Ccircle cx='35' cy='31' r='1.7' fill='%230f172a'/%3E%3Cpath d='M27.8 36.2h8.4' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M24 23v-2.5M40 23v-2.5' stroke='white' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "QuickResolveAI" },
      {
        name: "description",
        content: "AI-powered complaint classification, prioritization and resolution dashboard.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: projectFavicon },
      { rel: "shortcut icon", href: projectFavicon },
      { rel: "alternate icon", type: "image/svg+xml", href: "/quickresolve-favicon.svg?v=2" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(() => { const key = 'quickresolve-theme'; const saved = localStorage.getItem(key); const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.classList.toggle('dark', dark); })();",
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    themeStore.hydrate();
  }, []);

  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
