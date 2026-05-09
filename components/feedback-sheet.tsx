"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitFeedback, type Rating } from "@/lib/feedback";
import { cn } from "@/lib/utils";

type FeedbackSheetProps = {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  restaurantId: string;
  restaurantName: string;
  matchedName: string;
  onSubmitted: () => void;
};

export function FeedbackSheet({
  open,
  onClose,
  bookingId,
  restaurantId,
  restaurantName,
  matchedName,
  onSubmitted,
}: FeedbackSheetProps) {
  const [spiceFit, setSpiceFit] = useState<number>(0);
  const [chemistry, setChemistry] = useState<number>(0);
  const [wouldAgain, setWouldAgain] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const ready = spiceFit > 0 && chemistry > 0 && wouldAgain !== null;

  const onSubmit = () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    const rating: Rating = {
      spiceFit,
      chemistry,
      wouldMalaAgain: wouldAgain === true,
    };
    submitFeedback(bookingId, restaurantId, rating);
    setSubmitting(false);
    onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[420px] bg-[var(--mala-cream)] rounded-t-3xl border-t border-[var(--border)] shadow-2xl px-5 py-5 flex flex-col gap-4 animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] tracking-widest uppercase text-[var(--mala-charcoal)]/50">
              Post-date feedback
            </div>
            <div className="font-heading text-base text-[var(--mala-charcoal)] mt-0.5">
              {restaurantName} with {matchedName}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--mala-charcoal)]/40 hover:text-[var(--mala-charcoal)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <RatingRow
          label="Spice fit"
          caption="Did the food hit right for both of you?"
          emoji="🌶️"
          value={spiceFit}
          onChange={setSpiceFit}
        />
        <RatingRow
          label="Chemistry"
          caption="Did you actually click?"
          emoji="💕"
          value={chemistry}
          onChange={setChemistry}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[var(--mala-charcoal)]">
            🔁 Mala again?
          </span>
          <div className="flex gap-2">
            {[
              { v: true, label: "Yes, please" },
              { v: false, label: "Pass" },
            ].map((opt) => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => setWouldAgain(opt.v)}
                className={cn(
                  "flex-1 h-11 rounded-2xl text-sm font-semibold border-2 transition",
                  wouldAgain === opt.v
                    ? "bg-[var(--mala-red)] border-[var(--mala-red)] text-[var(--mala-cream)]"
                    : "bg-white border-[var(--border)] text-[var(--mala-charcoal)]/70 hover:border-[var(--mala-red)]/40",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={onSubmit}
          disabled={!ready || submitting}
          size="lg"
          className="h-12 rounded-2xl bg-[var(--mala-red)] hover:bg-[var(--mala-red)]/90 text-[var(--mala-cream)] font-semibold disabled:bg-[var(--mala-charcoal)]/15 disabled:text-[var(--mala-charcoal)]/40"
        >
          {submitting ? "Logging…" : "Log it 🌶️"}
        </Button>
      </div>
    </div>
  );
}

function RatingRow({
  label,
  caption,
  emoji,
  value,
  onChange,
}: {
  label: string;
  caption: string;
  emoji: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-[var(--mala-charcoal)]">
          {emoji} {label}
        </span>
        <span className="text-[10px] font-mono text-[var(--mala-charcoal)]/45">
          {value > 0 ? `${value}/5` : "—"}
        </span>
      </div>
      <p className="text-[11px] text-[var(--mala-charcoal)]/55 -mt-1">{caption}</p>
      <div className="flex gap-1.5 mt-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 h-11 rounded-xl text-base font-semibold border-2 transition",
              n <= value
                ? "bg-[var(--mala-orange)]/15 border-[var(--mala-orange)] text-[var(--mala-orange)]"
                : "bg-white border-[var(--border)] text-[var(--mala-charcoal)]/30 hover:border-[var(--mala-orange)]/40",
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
