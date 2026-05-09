"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChefHat, Loader2, MapPin, Sparkles, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentTraceStep } from "@/lib/types";

const ICON_BY_TOOL: Record<string, typeof MapPin> = {
  get_restaurant_details: MapPin,
  get_match_compatibility: Sparkles,
  pick_signature_dish: Utensils,
};

const STEP_INTERVAL_MS = 450;

export function AgentTrace({
  steps,
  running,
  onComplete,
}: {
  steps: AgentTraceStep[];
  running: boolean;
  onComplete?: () => void;
}) {
  const [revealed, setRevealed] = useState(0);
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (steps.length === 0) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= steps.length) {
        window.clearInterval(id);
        onCompleteRef.current?.();
      }
    }, STEP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [steps]);

  if (steps.length === 0 && !running) return null;

  return (
    <div className="rounded-2xl border border-[var(--mala-orange)]/25 bg-white p-4 space-y-2.5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--mala-orange)]">
        <ChefHat className="h-3.5 w-3.5" />
        Agent at work
      </div>
      <ol className="space-y-2">
        {steps.slice(0, revealed).map((step, idx) => {
          const Icon = ICON_BY_TOOL[step.name] ?? CheckCircle2;
          return (
            <li
              key={`${step.name}-${idx}`}
              className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--mala-orange)]/10 text-[var(--mala-orange)]">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[var(--mala-charcoal)]">
                  {step.label}
                </div>
                <div className="text-xs text-[var(--mala-charcoal)]/65">
                  → {step.summary}
                </div>
              </div>
              <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
            </li>
          );
        })}
        {running && steps.length > 0 && revealed >= steps.length && (
          <li className="flex items-center gap-3 text-sm text-[var(--mala-orange)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Drafting your plan…</span>
          </li>
        )}
        {running && steps.length === 0 && (
          <li className="flex items-center gap-3 text-sm text-[var(--mala-orange)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Calling the planner…</span>
          </li>
        )}
      </ol>
      <div className={cn("h-px bg-[var(--mala-orange)]/15")} />
      <div className="text-[10px] uppercase tracking-widest text-[var(--mala-charcoal)]/40">
        {revealed} of {steps.length || "…"} tool calls
      </div>
    </div>
  );
}
