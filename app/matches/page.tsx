"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Flame, Loader2 } from "lucide-react";
import users from "@/data/users.json";
import { findTopMatches } from "@/lib/match";
import { sharedIngredients, spiceBadge } from "@/lib/spice-badge";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOP_K = 3;

type Card = {
  user: User;
  score: number;
  shared: string[];
  blurb: string | null;
  source: "live" | "cache" | "generic" | null;
};

export default function MatchesPage() {
  const router = useRouter();
  const allUsers = users as User[];
  const [me, setMe] = useState<User | null>(null);
  const [cards, setCards] = useState<Card[] | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as User;
      setMe(parsed);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const matches = useMemo(() => {
    if (!me) return null;
    return findTopMatches(me, allUsers, TOP_K);
  }, [me, allUsers]);

  useEffect(() => {
    if (!me || !matches) return;
    setCards(
      matches.map((m) => ({
        user: m.user,
        score: m.score,
        shared: sharedIngredients(
          me.flavorProfile.topIngredients,
          m.user.flavorProfile.topIngredients,
        ),
        blurb: null,
        source: null,
      })),
    );

    let cancelled = false;
    matches.forEach(async (m, idx) => {
      try {
        const res = await fetch("/api/blurb", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userA: me, userB: m.user }),
        });
        const json = (await res.json()) as { blurb: string; source: "live" | "cache" | "generic" };
        if (cancelled) return;
        setCards((prev) =>
          prev
            ? prev.map((c, i) =>
                i === idx ? { ...c, blurb: json.blurb, source: json.source } : c,
              )
            : prev,
        );
      } catch {
        if (cancelled) return;
        setCards((prev) =>
          prev
            ? prev.map((c, i) =>
                i === idx
                  ? {
                      ...c,
                      blurb:
                        "A flavor pairing the kitchen would happily plate up — your mala instincts rhyme.",
                      source: "generic",
                    }
                  : c,
              )
            : prev,
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [me, matches]);

  if (!me || !cards) {
    return (
      <main className="flex flex-col h-full min-h-screen items-center justify-center text-[var(--mala-charcoal)]/50">
        <Loader2 className="w-6 h-6 animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex flex-col h-full min-h-screen bg-[var(--mala-cream)]">
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
            Hi {me.name || "there"}
          </div>
          <div className="font-heading text-base text-[var(--mala-charcoal)]">
            Your top {cards.length} flavor matches
          </div>
        </div>
        <Flame className="w-5 h-5 text-[var(--mala-red)]" />
      </header>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">
        {cards.map((card, i) => (
          <MatchCard key={card.user.id} card={card} rank={i + 1} />
        ))}

        <div className="text-center text-[10px] uppercase tracking-widest text-[var(--mala-charcoal)]/30 mt-4 pb-4">
          Matched by 14-dim flavor vector · Blurbs by Claude Haiku 4.5
        </div>
      </div>
    </main>
  );
}

function MatchCard({ card, rank }: { card: Card; rank: number }) {
  const badge = spiceBadge(card.user.flavorProfile.spiceLevel);
  const pct = Math.round(card.score * 100);

  return (
    <article className="bg-white rounded-3xl border border-[var(--border)] p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[var(--mala-cream)] shrink-0">
          {card.user.avatar && (
            <Image
              src={card.user.avatar}
              alt={card.user.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--mala-red)]/70">
              #{rank}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--mala-red)]/10 text-[var(--mala-red)]">
              {pct}% match
            </span>
          </div>
          <div className="font-heading text-lg leading-tight mt-1">
            {card.user.name}
            <span className="text-sm font-normal text-[var(--mala-charcoal)]/50 ml-1">
              · {card.user.age}
            </span>
          </div>
          <div className="text-[11px] text-[var(--mala-charcoal)]/55 leading-tight">
            {card.user.flavorProfile.style} · {card.user.flavorProfile.brothPreference} broth
          </div>
        </div>
        <SpiceBadge level={card.user.flavorProfile.spiceLevel} />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-[var(--mala-charcoal)]/45">
          {badge.title}
        </span>
        {card.shared.length > 0 && (
          <>
            <span className="text-[var(--mala-charcoal)]/30">·</span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--mala-charcoal)]/45">
              Both love
            </span>
            {card.shared.map((s) => (
              <span
                key={s}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--mala-orange)]/10 text-[var(--mala-orange)] font-medium"
              >
                {s}
              </span>
            ))}
          </>
        )}
      </div>

      <div className="rounded-2xl bg-[var(--mala-cream)] border border-[var(--mala-orange)]/15 px-3.5 py-3 min-h-[68px] flex items-center">
        {card.blurb ? (
          <p className="text-sm leading-snug text-[var(--mala-charcoal)]/85 italic">
            &ldquo;{card.blurb}&rdquo;
          </p>
        ) : (
          <BlurbSkeleton />
        )}
      </div>

      <Button
        asChild
        className="h-11 rounded-xl bg-[var(--mala-charcoal)] hover:bg-[var(--mala-red)] text-[var(--mala-cream)] font-semibold transition-colors"
      >
        <Link href={`/match/${card.user.id}`}>
          View Date Idea
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </Button>
    </article>
  );
}

function SpiceBadge({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn(
              "text-base leading-none transition",
              i <= level ? "opacity-100" : "opacity-20 grayscale",
            )}
          >
            🌶️
          </span>
        ))}
      </div>
      <span className="text-[9px] uppercase tracking-wider text-[var(--mala-charcoal)]/40">
        Lvl {level}
      </span>
    </div>
  );
}

function BlurbSkeleton() {
  return (
    <div className="w-full flex flex-col gap-1.5 animate-pulse">
      <div className="h-2.5 bg-[var(--mala-orange)]/15 rounded-full w-[92%]" />
      <div className="h-2.5 bg-[var(--mala-orange)]/15 rounded-full w-[80%]" />
      <div className="h-2.5 bg-[var(--mala-orange)]/15 rounded-full w-[55%]" />
    </div>
  );
}
