import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full bg-transparent">
      <div className="mesh-overlay" />
      <div className="ambient-orb -left-35 top-30 h-72 w-72 bg-primary/20" />
      <div
        className="ambient-orb -right-30 top-[56%] h-80 w-80 bg-accent/22"
        style={{ animationDelay: "-2.8s" }}
      />
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
