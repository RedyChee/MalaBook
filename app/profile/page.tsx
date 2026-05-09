"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selfFlavorBars, heatColor } from "@/lib/compatibility";
import { GENDER_OPTIONS, INTERESTED_IN_OPTIONS } from "@/lib/onboarding-options";
import { deriveTitle } from "@/lib/title";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);

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

  const bars = useMemo(() => (me ? selfFlavorBars(me.flavorProfile) : null), [me]);
  const title = useMemo(() => (me ? deriveTitle(me.flavorProfile) : null), [me]);

  if (!me || !bars || !title) {
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
          href="/matches"
          aria-label="Back"
          className="text-[var(--mala-charcoal)]/60 hover:text-[var(--mala-red)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="text-[10px] tracking-widest uppercase text-[var(--mala-charcoal)]/50">
            Your profile
          </div>
          <div className="font-heading text-base text-[var(--mala-charcoal)]">
            How you mala
          </div>
        </div>
      </header>

      <div className="flex-1 px-5 py-6 flex flex-col gap-6">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-3">
          <SelfAvatar avatar={me.avatar} name={me.name} />
          <div>
            <div className="font-heading text-2xl text-[var(--mala-charcoal)]">
              {me.name}
              {me.age > 0 && (
                <span className="text-base font-normal text-[var(--mala-charcoal)]/55 ml-1.5">
                  · {me.age}
                </span>
              )}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--mala-red)]/10 border border-[var(--mala-red)]/20">
              <span className="text-[10px] font-mono text-[var(--mala-red)]/70">·</span>
              <span className="text-xs font-semibold text-[var(--mala-red)] tracking-wide">
                {title.title}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[var(--mala-charcoal)]/55 italic">
              {title.sub}
            </p>
          </div>
          {me.bio && (
            <p className="text-sm leading-snug text-[var(--mala-charcoal)]/75 max-w-[30ch]">
              {me.bio}
            </p>
          )}
          <GenderChip gender={me.gender} interestedIn={me.interestedIn} />
          <ChiliRow level={me.flavorProfile.spiceLevel} />
        </section>

        {/* Flavor bars */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--mala-charcoal)]/55 font-semibold">
            Your flavor signature
          </h3>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-4 flex flex-col gap-3.5">
            {bars.map((bar) => (
              <FlavorBar key={bar.key} label={bar.label} caption={bar.caption} score={bar.score} />
            ))}
          </div>
        </section>

        {/* Top ingredients */}
        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--mala-charcoal)]/55 font-semibold">
            Your top ingredients
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {me.flavorProfile.topIngredients.map((it) => (
              <span
                key={it}
                className="text-xs px-2.5 py-1 rounded-full bg-white border border-[var(--border)] text-[var(--mala-charcoal)]/80"
              >
                {it}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-[var(--mala-cream)]/95 backdrop-blur border-t border-[var(--border)]">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full h-12 rounded-2xl border-[var(--mala-charcoal)]/20 text-[var(--mala-charcoal)]/80 hover:bg-[var(--mala-red)]/5 hover:border-[var(--mala-red)]/30"
        >
          <Link href="/onboarding">
            <Pencil className="w-4 h-4 mr-1" />
            Re-take the spice quiz
          </Link>
        </Button>
      </div>
    </main>
  );
}

function SelfAvatar({ avatar, name }: { avatar: string; name: string }) {
  const isImage = avatar?.startsWith("/");
  return (
    <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg shadow-[var(--mala-red)]/15 bg-[var(--mala-cream)] flex items-center justify-center">
      {isImage ? (
        <Image src={avatar} alt={name} fill sizes="128px" className="object-cover" />
      ) : (
        <span className="text-7xl leading-none">{avatar || "🌶️"}</span>
      )}
    </div>
  );
}

function FlavorBar({ label, caption, score }: { label: string; caption: string; score: number }) {
  const pct = Math.round(score * 100);
  const color = heatColor(score);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--mala-charcoal)]">{label}</span>
        <span className="text-[10px] font-mono text-[var(--mala-charcoal)]/45">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--mala-charcoal)]/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-[11px] text-[var(--mala-charcoal)]/60 leading-tight">{caption}</p>
    </div>
  );
}

function GenderChip({
  gender,
  interestedIn,
}: {
  gender: User["gender"];
  interestedIn: User["interestedIn"];
}) {
  const g = GENDER_OPTIONS.find((o) => o.value === gender);
  const i = INTERESTED_IN_OPTIONS.find((o) => o.value === interestedIn);
  if (!g || !i) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--border)]">
      <span className="text-xs text-[var(--mala-charcoal)]/80 font-medium">
        {g.emoji} {g.label}
      </span>
      <span className="text-[var(--mala-charcoal)]/30">·</span>
      <span className="text-xs text-[var(--mala-charcoal)]/55">
        seeking {i.label.toLowerCase()}
      </span>
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
