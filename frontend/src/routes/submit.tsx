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
import { api } from "@/lib/api";
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
  const [submitting, setSubmitting] = useState(false);
  const [analyzedForText, setAnalyzedForText] = useState("");
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
    const complaint = text.trim();
    setSubmitting(true);
    try {
      let analyzed = result;
      if (!analyzed || analyzedForText !== complaint) {
        setAnalyzing(true);
        analyzed = await api.complaints.analyze({ complaint });
        setResult(analyzed);
        setAnalyzedForText(complaint);
      }

      const created = await complaintsStore.add({
        text: complaint,
        customer,
        source,
      });

      toast.success(`Complaint submitted for ${customer}`);
      setText("");
      setCustomer("");
      setSource("Email");
      setAnalyzedForText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit complaint");
    } finally {
      setAnalyzing(false);
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Submit Complaint
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            Our AI will instantly classify and recommend a resolution.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-border/80 glass-card shadow-soft p-6 md:p-8 space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="customer"
                className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
              >
                Customer name
              </Label>
              <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Aarav Sharma"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                Source
              </Label>
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
            <Label
              htmlFor="text"
              className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
            >
              Complaint description
            </Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => {
                const next = e.target.value;
                setText(next);
                if (result && analyzedForText && next.trim() !== analyzedForText) {
                  setResult(null);
                }
              }}
              placeholder="Describe the issue in detail..."
              rows={6}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="lg"
              disabled={analyzing || submitting}
              className="bg-gradient-primary hover:opacity-95 shadow-glow"
            >
              {submitting ? (
                <>
                  <Bot className="h-4 w-4 mr-2 animate-pulse" />
                  Submitting...
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
          <div className="rounded-3xl border border-primary/25 bg-linear-to-br from-primary/10 via-card/85 to-transparent p-6 md:p-8 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
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
              <div className="rounded-2xl bg-card/80 border border-border/80 p-4 shadow-soft">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Sparkles className="h-4 w-4" /> Priority
                </div>
                <PriorityBadge priority={result.priority} />
              </div>
              <InfoTile
                icon={<Lightbulb className="h-4 w-4" />}
                label="Recommendation"
                value={result.recommendation}
                className="md:col-span-3"
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function InfoTile({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-card/80 border border-border/80 p-4 shadow-soft ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {icon} {label}
      </div>
      <p className="text-sm font-medium leading-snug">{value}</p>
    </div>
  );
}
