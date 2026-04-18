import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge } from "@/components/Badges";
import { type Category, type Priority, type Source } from "@/lib/mock-data";
import { complaintsStore } from "@/lib/complaints-store";
import { Bot, Send, Sparkles, Tag, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit Complaint – QuickResolveAI" },
      {
        name: "description",
        content: "Submit a customer complaint for instant AI classification and resolution.",
      },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const [text, setText] = useState("");
  const [source, setSource] = useState<Source>("Email");
  const [customer, setCustomer] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    category: Category;
    priority: Priority;
    recommendation: string;
  } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !customer.trim()) {
      toast.error("Please fill out all fields");
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const created = await complaintsStore.add({
        text,
        customer,
        source,
      });
      setResult({
        category: created.category,
        priority: created.priority,
        recommendation: created.recommendation,
      });
      toast.success(`Complaint submitted for ${customer}`);
      setText("");
      setCustomer("");
      setSource("Email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit complaint");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Submit Complaint</h1>
          <p className="text-muted-foreground mt-1">
            Our AI will instantly classify and recommend a resolution.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card shadow-soft p-6 md:p-8 space-y-5"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer name</Label>
              <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Aarav Sharma"
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={source} onValueChange={(v) => setSource(v as Source)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Complaint description</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={6}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={analyzing}
              className="bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              {analyzing ? (
                <>
                  <Bot className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit & Analyze
                </>
              )}
            </Button>
          </div>
        </form>

        {result && (
          <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 to-transparent p-6 md:p-8 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold">AI Analysis Result</h3>
                <p className="text-xs text-muted-foreground">Generated by QuickResolveAI engine</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <InfoTile
                icon={<Tag className="h-4 w-4" />}
                label="Category"
                value={result.category}
              />
              <div className="rounded-xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Sparkles className="h-4 w-4" /> Priority
                </div>
                <PriorityBadge priority={result.priority} />
              </div>
              <InfoTile
                icon={<Lightbulb className="h-4 w-4" />}
                label="Recommendation"
                value={result.recommendation}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {icon} {label}
      </div>
      <p className="text-sm font-medium leading-snug">{value}</p>
    </div>
  );
}
