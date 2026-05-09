"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Flame, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { encodeProfile } from "@/lib/flavor";
import {
  BROTH_OPTIONS,
  INGREDIENT_GROUPS,
  SPICE_LEVELS,
  STYLE_OPTIONS,
  VIBE_OPTIONS,
} from "@/lib/onboarding-options";
import type {
  BrothPreference,
  DiningVibe,
  FlavorProfile,
  FlavorStyle,
  SpiceLevel,
  User,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_INGREDIENTS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [style, setStyle] = useState<FlavorStyle | null>(null);
  const [spice, setSpice] = useState<SpiceLevel | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [broth, setBroth] = useState<BrothPreference | null>(null);
  const [vibe, setVibe] = useState<DiningVibe | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(
    () =>
      Boolean(
        name.trim() &&
          style &&
          spice !== null &&
          ingredients.length > 0 &&
          broth &&
          vibe,
      ),
    [name, style, spice, ingredients, broth, vibe],
  );

  function toggleIngredient(item: string) {
    setIngredients((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : prev.length >= MAX_INGREDIENTS
          ? prev
          : [...prev, item],
    );
  }

  function handleSubmit() {
    if (!isValid || !style || !spice || !broth || !vibe) return;
    setSubmitting(true);
    const profile: FlavorProfile = {
      style,
      spiceLevel: spice,
      topIngredients: ingredients,
      brothPreference: broth,
      vibe,
    };
    const me: User = {
      id: "u_self",
      name: name.trim(),
      age: 0,
      bio: "",
      flavorProfile: profile,
      avatar: "",
      flavorVector: encodeProfile(profile),
    };
    sessionStorage.setItem("currentUser", JSON.stringify(me));
    router.push("/matches");
  }

  return (
    <main className="flex flex-col h-full min-h-screen bg-[var(--mala-cream)]">
      {/* Header */}
      <header className="sticky top-0 z-10 px-5 py-4 bg-[var(--mala-cream)]/90 backdrop-blur border-b border-[var(--border)] flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back"
          className="text-[var(--mala-charcoal)]/60 hover:text-[var(--mala-red)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="text-[10px] tracking-widest uppercase text-[var(--mala-charcoal)]/50">
            Spice Quiz
          </div>
          <div className="font-heading text-base text-[var(--mala-charcoal)]">
            Tell us how you mala
          </div>
        </div>
        <Flame className="w-5 h-5 text-[var(--mala-red)]" />
      </header>

      <div className="flex-1 px-5 py-6 flex flex-col gap-8">
        {/* Name */}
        <Section index={0} title="What do they call you?">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name"
            maxLength={32}
            className="h-12 rounded-xl bg-white border-[var(--border)] text-base"
          />
        </Section>

        {/* Q1 — Style */}
        <Section index={1} title="Dry pot or soup?">
          <div className="grid grid-cols-3 gap-2">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStyle(opt.value)}
                className={cn(
                  "rounded-2xl border-2 p-3 text-left flex flex-col gap-1 transition active:scale-[0.97]",
                  style === opt.value
                    ? "border-[var(--mala-red)] bg-[var(--mala-red)]/10"
                    : "border-[var(--border)] bg-white hover:border-[var(--mala-red)]/40",
                )}
              >
                <div className="text-2xl">{opt.emoji}</div>
                <div className="font-semibold text-sm leading-tight">{opt.label}</div>
                <div className="text-[11px] text-[var(--mala-charcoal)]/55 leading-tight">
                  {opt.subtitle}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Q2 — Spice level */}
        <Section index={2} title="How spicy can you take it?">
          <div className="flex items-center justify-between gap-1.5">
            {SPICE_LEVELS.map((lvl) => {
              const active = spice !== null && lvl.value <= spice;
              const selected = spice === lvl.value;
              return (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setSpice(lvl.value)}
                  aria-label={`Spice level ${lvl.value} — ${lvl.label}`}
                  className={cn(
                    "flex-1 aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl transition active:scale-[0.94]",
                    active
                      ? "border-[var(--mala-red)] bg-[var(--mala-red)]/10"
                      : "border-[var(--border)] bg-white",
                    selected && "ring-2 ring-[var(--mala-red)] ring-offset-2 ring-offset-[var(--mala-cream)]",
                  )}
                >
                  <span
                    className={cn(
                      "transition",
                      active ? "opacity-100" : "opacity-25 grayscale",
                    )}
                  >
                    🌶️
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-center text-sm text-[var(--mala-charcoal)]/70">
            {spice ? (
              <span>
                Level {spice} —{" "}
                <span className="font-semibold text-[var(--mala-red)]">
                  {SPICE_LEVELS.find((l) => l.value === spice)?.label}
                </span>
              </span>
            ) : (
              <span className="text-[var(--mala-charcoal)]/40">Tap a chili</span>
            )}
          </div>
        </Section>

        {/* Q3 — Top ingredients */}
        <Section
          index={3}
          title="Pick your favorites"
          subtitle={`Up to ${MAX_INGREDIENTS} — ${ingredients.length}/${MAX_INGREDIENTS} selected`}
        >
          <div className="flex flex-col gap-4">
            {INGREDIENT_GROUPS.map((group) => (
              <div key={group.key}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mala-charcoal)]/50 mb-2 flex items-center gap-1.5">
                  <span>{group.emoji}</span>
                  <span>{group.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => {
                    const selected = ingredients.includes(item);
                    const disabled = !selected && ingredients.length >= MAX_INGREDIENTS;
                    return (
                      <button
                        key={item}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleIngredient(item)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs border transition active:scale-[0.96]",
                          selected
                            ? "bg-[var(--mala-red)] text-[var(--mala-cream)] border-[var(--mala-red)] shadow-sm shadow-[var(--mala-red)]/30"
                            : "bg-white border-[var(--border)] text-[var(--mala-charcoal)]/80 hover:border-[var(--mala-red)]/40",
                          disabled && "opacity-40 cursor-not-allowed",
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Q4 — Broth */}
        <Section index={4} title="Your broth of choice?">
          <div className="grid grid-cols-2 gap-2">
            {BROTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBroth(opt.value)}
                className={cn(
                  "rounded-2xl border-2 p-3 text-left flex items-start gap-2 transition active:scale-[0.97]",
                  broth === opt.value
                    ? "border-[var(--mala-red)] bg-[var(--mala-red)]/10"
                    : "border-[var(--border)] bg-white hover:border-[var(--mala-red)]/40",
                )}
              >
                <div className="text-xl shrink-0">{opt.emoji}</div>
                <div>
                  <div className="font-semibold text-sm leading-tight">{opt.label}</div>
                  <div className="text-[11px] text-[var(--mala-charcoal)]/55 leading-tight">
                    {opt.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Q5 — Vibe */}
        <Section index={5} title="Your dining vibe?">
          <div className="flex flex-col gap-2">
            {VIBE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVibe(opt.value)}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-left flex items-center gap-3 transition active:scale-[0.98]",
                  vibe === opt.value
                    ? "border-[var(--mala-red)] bg-[var(--mala-red)]/10"
                    : "border-[var(--border)] bg-white hover:border-[var(--mala-red)]/40",
                )}
              >
                <div className="text-2xl">{opt.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-[11px] text-[var(--mala-charcoal)]/55">
                    {opt.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 px-5 py-4 bg-[var(--mala-cream)]/95 backdrop-blur border-t border-[var(--border)]">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          size="lg"
          className="w-full h-14 rounded-2xl bg-[var(--mala-red)] hover:bg-[var(--mala-red)]/90 disabled:bg-[var(--mala-charcoal)]/15 disabled:text-[var(--mala-charcoal)]/40 text-[var(--mala-cream)] text-base font-semibold shadow-lg shadow-[var(--mala-red)]/30"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Find My Match
              <Flame className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </main>
  );
}

function Section({
  index,
  title,
  subtitle,
  children,
}: {
  index: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-mono text-[var(--mala-red)]/70">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="font-heading text-lg leading-tight text-[var(--mala-charcoal)]">{title}</h2>
      </div>
      {subtitle && (
        <p className="-mt-2 text-[11px] text-[var(--mala-charcoal)]/55">{subtitle}</p>
      )}
      {children}
    </section>
  );
}
