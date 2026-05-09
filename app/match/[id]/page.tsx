"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Flame, Loader2, MapPin, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import users from "@/data/users.json";
import restaurants from "@/data/restaurants.json";
import { cosineSimilarity } from "@/lib/match";
import { spiceBadge } from "@/lib/spice-badge";
import type { Restaurant, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateSpotResponse = {
  restaurantId: string;
  reason: string;
  source: "live" | "cache" | "generic";
};

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const allUsers = users as User[];
  const allRestaurants = restaurants as Restaurant[];

  const matched = allUsers.find((u) => u.id === id) ?? null;

  const [me, setMe] = useState<User | null>(null);
  const [dateSpot, setDateSpot] = useState<DateSpotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setMe(JSON.parse(raw) as User);
    } catch {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (!me || !matched) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/datespot", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userA: me, userB: matched }),
        });
        const json = (await res.json()) as DateSpotResponse;
        if (!cancelled) setDateSpot(json);
      } catch {
        if (!cancelled) setError("Couldn't fetch a date pick.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [me, matched]);

  if (!matched) {
    return (
      <main className="flex flex-col h-full min-h-screen items-center justify-center px-8 text-center gap-3">
        <p className="text-[var(--mala-charcoal)]/70">User not found.</p>
        <Button asChild variant="ghost">
          <Link href="/matches">Back to matches</Link>
        </Button>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="flex flex-col h-full min-h-screen items-center justify-center text-[var(--mala-charcoal)]/50">
        <Loader2 className="w-6 h-6 animate-spin" />
      </main>
    );
  }

  const score = Math.round(
    cosineSimilarity(me.flavorVector, matched.flavorVector) * 100,
  );
  const badge = spiceBadge(matched.flavorProfile.spiceLevel);
  const restaurant = dateSpot
    ? allRestaurants.find((r) => r.id === dateSpot.restaurantId) ?? null
    : null;

  return (
    <main className="flex flex-col h-full min-h-screen bg-[var(--mala-cream)]">
      <header className="sticky top-0 z-10 px-5 py-4 bg-[var(--mala-cream)]/90 backdrop-blur border-b border-[var(--border)] flex items-center gap-3">
        <Link
          href="/matches"
          aria-label="Back"
          className="text-[var(--mala-charcoal)]/60 hover:text-[var(--mala-red)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="text-[10px] tracking-widest uppercase text-[var(--mala-charcoal)]/50">
            {score}% match
          </div>
          <div className="font-heading text-base text-[var(--mala-charcoal)]">
            You & {matched.name}
          </div>
        </div>
        <Flame className="w-5 h-5 text-[var(--mala-red)]" />
      </header>

      <div className="flex-1 px-5 py-5 flex flex-col gap-5">
        {/* Profile hero */}
        <section className="flex flex-col items-center text-center gap-3">
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg shadow-[var(--mala-red)]/15 bg-[var(--mala-cream)]">
            {matched.avatar && (
              <Image
                src={matched.avatar}
                alt={matched.name}
                fill
                sizes="128px"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <div className="font-heading text-2xl text-[var(--mala-charcoal)]">
              {matched.name}, {matched.age}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10px] uppercase tracking-widest text-[var(--mala-red)]/70 font-semibold">
                {badge.title}
              </span>
              <span className="text-[var(--mala-charcoal)]/30">·</span>
              <span className="text-[10px] uppercase tracking-widest text-[var(--mala-charcoal)]/45">
                {matched.flavorProfile.style} pot · {matched.flavorProfile.brothPreference}
              </span>
            </div>
          </div>
          <p className="text-sm leading-snug text-[var(--mala-charcoal)]/75 italic max-w-[30ch]">
            &ldquo;{matched.bio}&rdquo;
          </p>
          <ChiliRow level={matched.flavorProfile.spiceLevel} />
        </section>

        {/* Top ingredients */}
        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--mala-charcoal)]/55 font-semibold">
            Their top ingredients
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {matched.flavorProfile.topIngredients.map((it) => (
              <span
                key={it}
                className="text-xs px-2.5 py-1 rounded-full bg-white border border-[var(--border)] text-[var(--mala-charcoal)]/80"
              >
                {it}
              </span>
            ))}
          </div>
        </section>

        {/* AI date pick */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--mala-orange)]" />
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--mala-charcoal)]/55 font-semibold">
              AI Picks Your Date Spot
            </h3>
          </div>
          <DateSpotCard restaurant={restaurant} reason={dateSpot?.reason ?? null} error={error} />
        </section>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-[var(--mala-cream)]/95 backdrop-blur border-t border-[var(--border)]">
        <Button
          onClick={() => {
            toast.success("Sent! 🌶️", {
              description: `${matched.name} will see your date suggestion.`,
            });
          }}
          disabled={!dateSpot}
          size="lg"
          className="w-full h-14 rounded-2xl bg-[var(--mala-red)] hover:bg-[var(--mala-red)]/90 text-[var(--mala-cream)] font-semibold disabled:bg-[var(--mala-charcoal)]/15 disabled:text-[var(--mala-charcoal)]/40 shadow-lg shadow-[var(--mala-red)]/30"
        >
          Suggest This Date
          <Send className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </main>
  );
}

function DateSpotCard({
  restaurant,
  reason,
  error,
}: {
  restaurant: Restaurant | null;
  reason: string | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--mala-charcoal)]/60">
        {error}
      </div>
    );
  }
  if (!restaurant || !reason) {
    return (
      <div className="rounded-2xl border border-[var(--mala-orange)]/15 bg-white p-4 flex flex-col gap-3 animate-pulse">
        <div className="h-3 w-1/2 rounded-full bg-[var(--mala-orange)]/15" />
        <div className="h-2.5 w-1/3 rounded-full bg-[var(--mala-orange)]/10" />
        <div className="space-y-1.5 mt-2">
          <div className="h-2.5 rounded-full bg-[var(--mala-orange)]/10 w-[92%]" />
          <div className="h-2.5 rounded-full bg-[var(--mala-orange)]/10 w-[80%]" />
          <div className="h-2.5 rounded-full bg-[var(--mala-orange)]/10 w-[55%]" />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[var(--mala-red)]/20 bg-white p-4 flex flex-col gap-3 shadow-sm">
      <div>
        <div className="font-heading text-lg leading-tight text-[var(--mala-charcoal)]">
          {restaurant.name}
        </div>
        <div className="text-xs text-[var(--mala-charcoal)]/50 leading-tight">
          {restaurant.nameZh}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-[var(--mala-charcoal)]/65">
        <MapPin className="w-3 h-3" />
        <span>{restaurant.neighborhood}</span>
        <span className="text-[var(--mala-charcoal)]/30">·</span>
        <span className="font-semibold">{restaurant.priceRange}</span>
        <span className="text-[var(--mala-charcoal)]/30">·</span>
        <span className="capitalize">{restaurant.style} pot</span>
      </div>
      <p className="text-sm leading-snug text-[var(--mala-charcoal)]/80">{reason}</p>
      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[var(--border)]/60">
        {restaurant.signature.slice(0, 3).map((sig) => (
          <span
            key={sig}
            className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--mala-orange)]/10 text-[var(--mala-orange)] font-medium"
          >
            {sig}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChiliRow({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "text-lg transition",
            i <= level ? "opacity-100" : "opacity-20 grayscale",
          )}
        >
          🌶️
        </span>
      ))}
    </div>
  );
}
