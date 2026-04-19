import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full bg-transparent">
      <div className="mesh-overlay" />
      <Sidebar />
      <div className="relative flex-1 flex flex-col min-w-0 md:pl-1">
        <Header />
        <main className="relative flex-1 px-4 pb-5 pt-4 md:px-7 md:pb-8 md:pt-6 lg:px-9">
          <div className="mx-auto w-full max-w-425 animate-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
