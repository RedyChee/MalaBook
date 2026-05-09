"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import users from "@/data/users.json";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

const SAMPLE_USER_ID = "u_001";

export default function Home() {
  const router = useRouter();

  const skipOnboarding = () => {
    const sample = (users as User[]).find((u) => u.id === SAMPLE_USER_ID);
    if (!sample) return;
    sessionStorage.setItem("currentUser", JSON.stringify(sample));
    router.push("/matches");
  };

  return (
    <main className="flex flex-col h-full min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--mala-cream)] via-[#FFE4C8] to-[#FFD0A1]" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[var(--mala-orange)] blur-3xl opacity-30 -z-10" />
      <div className="absolute top-32 -left-20 w-72 h-72 rounded-full bg-[var(--mala-red)] blur-3xl opacity-20 -z-10" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-7">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--mala-red)]/10 border border-[var(--mala-red)]/20">
          <Flame className="w-3.5 h-3.5 text-[var(--mala-red)]" />
          <span className="text-xs font-medium text-[var(--mala-red)] tracking-wider uppercase">
            Singapore · AI Hackathon
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-7xl">🌶️</div>
          <h1 className="font-heading text-5xl font-bold leading-tight">
            <span className="text-[var(--mala-red)]">Mala</span>
            <span className="text-[var(--mala-charcoal)]">Book</span>
          </h1>
          <p className="text-lg text-[var(--mala-charcoal)]/80 leading-snug max-w-[18ch]">
            Match by mala.
            <br />
            Meet over <em className="not-italic font-heading text-[var(--mala-orange)]">málà</em>.
          </p>
        </div>

        <p className="text-sm text-[var(--mala-charcoal)]/60 max-w-[28ch] leading-relaxed">
          Singapore&apos;s flavor-first dating app. Take the spice quiz and let
          AI match you over numbing fire.
        </p>

        <div className="w-full max-w-[280px] flex flex-col gap-3 mt-2">
          <Button
            asChild
            size="lg"
            className="h-14 rounded-2xl bg-[var(--mala-red)] hover:bg-[var(--mala-red)]/90 text-[var(--mala-cream)] text-base font-semibold shadow-lg shadow-[var(--mala-red)]/30"
          >
            <Link href="/onboarding">
              Take the Spice Quiz
              <Flame className="w-5 h-5 ml-1" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={skipOnboarding}
            className="h-12 rounded-2xl text-[var(--mala-charcoal)]/70 hover:bg-[var(--mala-charcoal)]/5"
          >
            Skip — try sample profile
          </Button>
        </div>
      </div>

      <footer className="px-8 pb-8 pt-4 text-center text-[10px] text-[var(--mala-charcoal)]/40 tracking-wider uppercase">
        Demo · 10 seed users · 20 SG mala spots · Claude Haiku 4.5
      </footer>
    </main>
  );
}
