import { Bell, Bot, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="h-full px-4 md:px-8 flex items-center gap-4">
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">QuickResolveAI</span>
        </div>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search complaints, customers..." className="pl-9 bg-secondary/60 border-transparent" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
            <Bot className="h-3.5 w-3.5" />
            AI Online
          </div>
          <button className="relative h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">AR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
