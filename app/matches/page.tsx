"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Loader2, Send, X } from "lucide-react";
import users from "@/data/users.json";
import restaurants from "@/data/restaurants.json";
import { findTopMatches } from "@/lib/match";
import { sharedIngredients, spiceBadge } from "@/lib/spice-badge";
import { listBookings, makeGroupSessionId, TIME_OPTIONS } from "@/lib/bookings";
import type { Booking } from "@/lib/bookings";
import type { Restaurant, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOP_K = 3;
const GROUP_CAP = 3; // 3 matches + me = 4-person table

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
  const allRestaurants = restaurants as Restaurant[];
  const [me, setMe] = useState<User | null>(null);
  const [cards, setCards] = useState<Card[] | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [plansOpen, setPlansOpen] = useState(true);
  const [mode, setMode] = useState<"solo" | "group">("solo");
  const [selected, setSelected] = useState<string[]>([]);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);

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
    setBookings(listBookings());
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
        <Link
          href="/profile"
          aria-label="Your profile"
          className="w-9 h-9 rounded-2xl overflow-hidden bg-[var(--mala-cream)] border-2 border-[var(--mala-red)]/20 hover:border-[var(--mala-red)] flex items-center justify-center transition"
        >
          {me.avatar?.startsWith("/") ? (
            <Image src={me.avatar} alt={me.name} width={36} height={36} className="object-cover" />
          ) : (
            <span className="text-xl leading-none">{me.avatar || "🌶️"}</span>
          )}
        </Link>
      </header>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">
        {bookings.length > 0 && (
          <PlansStrip
            bookings={bookings}
            users={allUsers}
            restaurants={allRestaurants}
            open={plansOpen}
            onToggle={() => setPlansOpen((v) => !v)}
          />
        )}

        <ModeToggle
          mode={mode}
          onChange={(m) => {
            setMode(m);
            if (m === "solo") setSelected([]);
          }}
        />

        {cards.map((card, i) => (
          <MatchCard
            key={card.user.id}
            card={card}
            rank={i + 1}
            mode={mode}
            isSelected={selected.includes(card.user.id)}
            disabled={
              mode === "group" &&
              !selected.includes(card.user.id) &&
              selected.length >= GROUP_CAP
            }
            booking={bookings.find((b) => b.participantIds.includes(card.user.id)) ?? null}
            onToggleSelect={() => {
              setSelected((prev) =>
                prev.includes(card.user.id)
                  ? prev.filter((x) => x !== card.user.id)
                  : prev.length >= GROUP_CAP
                    ? prev
                    : [...prev, card.user.id],
              );
            }}
          />
        ))}

        <div className="text-center text-[10px] uppercase tracking-widest text-[var(--mala-charcoal)]/30 mt-4 pb-32">
          Matched by 14-dim flavor vector · Blurbs by Claude Haiku 4.5
        </div>
      </div>

      {mode === "group" && (
        <div className="sticky bottom-0 px-5 py-4 bg-[var(--mala-cream)]/95 backdrop-blur border-t border-[var(--border)]">
          <Button
            onClick={() => setGroupSheetOpen(true)}
            disabled={selected.length === 0}
            size="lg"
            className="w-full h-14 rounded-2xl bg-[var(--mala-red)] hover:bg-[var(--mala-red)]/90 text-[var(--mala-cream)] font-semibold disabled:bg-[var(--mala-charcoal)]/15 disabled:text-[var(--mala-charcoal)]/40 shadow-lg shadow-[var(--mala-red)]/30"
          >
            🍲 Plan group hotpot · {selected.length} of {GROUP_CAP} selected
          </Button>
        </div>
      )}

      {groupSheetOpen && (
        <GroupTimeSheet
          count={selected.length + 1}
          onClose={() => setGroupSheetOpen(false)}
          onPick={(timeId) => {
            const sessionId = makeGroupSessionId(selected, timeId);
            router.push(`/match/group/${sessionId}`);
          }}
        />
      )}
    </main>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "solo" | "group";
  onChange: (m: "solo" | "group") => void;
}) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-1 flex">
      <button
        type="button"
        onClick={() => onChange("solo")}
        className={cn(
          "flex-1 py-2 rounded-xl text-xs font-semibold transition",
          mode === "solo"
            ? "bg-[var(--mala-charcoal)] text-[var(--mala-cream)]"
            : "text-[var(--mala-charcoal)]/55 hover:text-[var(--mala-charcoal)]",
        )}
      >
        Solo dates
      </button>
      <button
        type="button"
        onClick={() => onChange("group")}
        className={cn(
          "flex-1 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5",
          mode === "group"
            ? "bg-[var(--mala-red)] text-[var(--mala-cream)]"
            : "text-[var(--mala-charcoal)]/55 hover:text-[var(--mala-charcoal)]",
        )}
      >
        Group hotpot 🍲
      </button>
    </div>
  );
}

function GroupTimeSheet({
  count,
  onClose,
  onPick,
}: {
  count: number;
  onClose: () => void;
  onPick: (timeId: string) => void;
}) {
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
              Pick a time
            </div>
            <div className="font-heading text-base text-[var(--mala-charcoal)] mt-0.5">
              🍲 {count}-person hotpot
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
        <div className="flex flex-col gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPick(opt.id)}
              className="rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 text-left flex items-center gap-3 transition active:scale-[0.98] hover:border-[var(--mala-red)]/40"
            >
              <div className="text-2xl">{opt.emoji}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-[var(--mala-charcoal)]">{opt.label}</div>
                <div className="text-[11px] text-[var(--mala-charcoal)]/55">{opt.caption}</div>
              </div>
              <Send className="w-4 h-4 text-[var(--mala-red)]/60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlansStrip({
  bookings,
  users,
  restaurants,
  open,
  onToggle,
}: {
  bookings: Booking[];
  users: User[];
  restaurants: Restaurant[];
  open: boolean;
  onToggle: () => void;
}) {
  const sorted = [...bookings].sort((a, b) => a.createdAt - b.createdAt);
  const phrase = bookings.length === 1 ? "1 numbing pilgrimage queued up 🌶️" : `${bookings.length} mala plans on deck 🌶️`;
  return (
    <div className="bg-[var(--mala-red)]/5 border border-[var(--mala-red)]/20 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-2 text-left"
      >
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-[var(--mala-red)]/80 font-semibold">
            Your plans · {bookings.length} upcoming
          </div>
          <div className="text-xs text-[var(--mala-charcoal)]/70 italic">{phrase}</div>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--mala-red)]/60 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          {sorted.map((b) => {
            const r = restaurants.find((x) => x.id === b.restaurantId);
            const ppl = b.participantIds
              .map((id) => users.find((u) => u.id === id)?.name)
              .filter(Boolean)
              .join(" + ");
            return (
              <Link
                key={b.id}
                href={
                  b.type === "group"
                    ? `/match/group/${b.id}`
                    : `/match/${b.participantIds[0]}/chat?time=${b.id.split(":")[0]}&booked=1`
                }
                className="bg-white rounded-xl border border-[var(--mala-red)]/15 px-3 py-2 flex items-center gap-2 hover:border-[var(--mala-red)]/40 transition"
              >
                <div className="text-lg">{b.type === "group" ? "🍲" : "🌶️"}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[var(--mala-charcoal)] truncate">
                    {r?.name ?? "—"} · {b.when}
                  </div>
                  <div className="text-[10px] text-[var(--mala-charcoal)]/55 truncate">
                    {b.type === "group" ? `with ${ppl}` : `with ${ppl}`} · {b.caption}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--mala-red)]/40" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  card,
  rank,
  mode,
  isSelected,
  disabled,
  booking,
  onToggleSelect,
}: {
  card: Card;
  rank: number;
  mode: "solo" | "group";
  isSelected: boolean;
  disabled: boolean;
  booking: Booking | null;
  onToggleSelect: () => void;
}) {
  const badge = spiceBadge(card.user.flavorProfile.spiceLevel);
  const pct = Math.round(card.score * 100);
  const isGroup = mode === "group";

  return (
    <article
      onClick={isGroup && !disabled ? onToggleSelect : undefined}
      className={cn(
        "bg-white rounded-3xl border p-4 flex flex-col gap-3 shadow-sm transition",
        isGroup && isSelected && "border-[var(--mala-red)] ring-2 ring-[var(--mala-red)]/20",
        isGroup && !isSelected && !disabled && "border-[var(--border)] hover:border-[var(--mala-red)]/40 cursor-pointer",
        isGroup && disabled && "border-[var(--border)] opacity-50",
        !isGroup && "border-[var(--border)]",
      )}
    >
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

      {isGroup ? (
        <div
          className={cn(
            "h-11 rounded-xl flex items-center justify-center text-sm font-semibold transition",
            isSelected
              ? "bg-[var(--mala-red)] text-[var(--mala-cream)]"
              : "bg-[var(--mala-charcoal)]/5 text-[var(--mala-charcoal)]/55",
          )}
        >
          {isSelected ? "✓ Added to crew" : disabled ? "Crew full" : "Tap to add to crew"}
        </div>
      ) : booking ? (
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-xl border-[var(--mala-red)]/40 text-[var(--mala-red)] font-semibold hover:bg-[var(--mala-red)]/5"
        >
          <Link
            href={
              booking.type === "group"
                ? `/match/group/${booking.id}`
                : `/match/${card.user.id}/chat?booked=1&time=${booking.id.split(":")[0]}`
            }
          >
            {booking.type === "group" ? "🍲" : "🌶️"} Date booked · {booking.when}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      ) : (
        <Button
          asChild
          className="h-11 rounded-xl bg-[var(--mala-charcoal)] hover:bg-[var(--mala-red)] text-[var(--mala-cream)] font-semibold transition-colors"
        >
          <Link href={`/match/${card.user.id}`}>
            View Date Idea
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      )}
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
