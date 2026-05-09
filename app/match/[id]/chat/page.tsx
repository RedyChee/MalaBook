"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, MapPin, Sparkles } from "lucide-react";
import users from "@/data/users.json";
import restaurants from "@/data/restaurants.json";
import {
  TIME_OPTIONS,
  bookingForUser,
  makeBookingId,
  saveBooking,
} from "@/lib/bookings";
import type { Booking } from "@/lib/bookings";
import type { Restaurant, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Reply = { reaction: string; accept: string; source?: string };

type ChatStage =
  | "loading-context"
  | "calling"
  | "reaction-shown"
  | "accept-shown"
  | "confirmed";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeId = searchParams.get("time") ?? "sat-7";
  const restaurantIdParam = searchParams.get("r");

  const allUsers = users as User[];
  const allRestaurants = restaurants as Restaurant[];
  const matched = allUsers.find((u) => u.id === id) ?? null;
  const time = TIME_OPTIONS.find((t) => t.id === timeId) ?? TIME_OPTIONS[1];

  const [me, setMe] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stage, setStage] = useState<ChatStage>("loading-context");
  const [reply, setReply] = useState<Reply | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Bootstrap: load currentUser + restaurant
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("currentUser");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setMe(JSON.parse(raw) as User);
    } catch {
      router.replace("/");
      return;
    }

    let r: Restaurant | null = null;
    if (restaurantIdParam) {
      r = allRestaurants.find((x) => x.id === restaurantIdParam) ?? null;
    }
    if (!r && matched) {
      // fallback for revisits — pull from existing booking or pick first
      const existing = bookingForUser(matched.id);
      if (existing) {
        r = allRestaurants.find((x) => x.id === existing.restaurantId) ?? null;
      }
    }
    setRestaurant(r);
  }, [router, restaurantIdParam, matched, allRestaurants]);

  // If revisiting and a booking exists, jump straight to confirmed state
  useEffect(() => {
    if (!matched || !me || !restaurant) return;
    const existing = bookingForUser(matched.id);
    if (existing && stage === "loading-context") {
      setReply({
        reaction: "Already locked in 🌶️",
        accept: `${existing.when} at ${restaurant.name} — see you there.`,
      });
      setStage("confirmed");
    }
  }, [matched, me, restaurant, stage]);

  // Kick off the Claude reply once we have everything and not revisiting
  useEffect(() => {
    if (!me || !matched || !restaurant) return;
    if (stage !== "loading-context") return;
    const existing = bookingForUser(matched.id);
    if (existing) return; // handled above

    setStage("calling");
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/chat-reply", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            me,
            matched,
            restaurant: {
              id: restaurant.id,
              name: restaurant.name,
              nameZh: restaurant.nameZh,
              neighborhood: restaurant.neighborhood,
            },
            when: time.label,
          }),
        });
        const json = (await res.json()) as Reply;
        if (cancelled) return;
        setReply(json);

        // Stagger: show reaction first, then accept ~700ms later
        setTimeout(() => {
          if (cancelled) return;
          setStage("reaction-shown");
          setTimeout(() => {
            if (cancelled) return;
            setStage("accept-shown");
          }, 900);
        }, 700);
      } catch {
        if (cancelled) return;
        setError("Couldn't reach them — try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [me, matched, restaurant, stage, time.label]);

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
  if (!me || !restaurant) {
    return (
      <main className="flex flex-col h-full min-h-screen items-center justify-center text-[var(--mala-charcoal)]/50">
        <Loader2 className="w-6 h-6 animate-spin" />
      </main>
    );
  }

  const onConfirm = () => {
    if (confirming) return;
    setConfirming(true);
    const booking: Booking = {
      id: makeBookingId("solo", [matched.id]),
      type: "solo",
      participantIds: [matched.id],
      restaurantId: restaurant.id,
      when: time.label,
      caption: time.caption,
      createdAt: Date.now(),
    };
    saveBooking(booking);
    setStage("confirmed");
    setConfirming(false);
  };

  const userMessage = `I'm thinking ${restaurant.name} — ${time.label}? 🌶️`;
  const showReaction = stage === "reaction-shown" || stage === "accept-shown" || stage === "confirmed";
  const showAccept = stage === "accept-shown" || stage === "confirmed";
  const showConfirm = stage === "accept-shown";
  const showTyping = stage === "calling";
  const showTypingForAccept = stage === "reaction-shown";

  return (
    <main className="flex flex-col h-full min-h-screen bg-[var(--mala-cream)]">
      <header className="sticky top-0 z-10 px-5 py-3 bg-[var(--mala-cream)]/95 backdrop-blur border-b border-[var(--border)] flex items-center gap-3">
        <Link
          href={`/match/${matched.id}`}
          aria-label="Back"
          className="text-[var(--mala-charcoal)]/60 hover:text-[var(--mala-red)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="relative w-9 h-9 rounded-2xl overflow-hidden bg-[var(--mala-cream)] border border-[var(--border)]">
            {matched.avatar?.startsWith("/") ? (
              <Image src={matched.avatar} alt={matched.name} fill sizes="36px" className="object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xl">{matched.avatar || "🌶️"}</span>
            )}
          </div>
          <div className="leading-tight">
            <div className="font-heading text-sm text-[var(--mala-charcoal)]">{matched.name}</div>
            <div className="text-[10px] text-[var(--mala-charcoal)]/55">
              {stage === "confirmed" ? "Date locked 🌶️" : "Active now"}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-2.5 overflow-y-auto">
        {/* Restaurant context card */}
        <div className="self-center mb-1 max-w-[260px] rounded-2xl bg-white border border-[var(--mala-orange)]/20 px-3 py-2 flex items-center gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[var(--mala-orange)] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[var(--mala-charcoal)] truncate">
              {restaurant.name}
            </div>
            <div className="text-[10px] text-[var(--mala-charcoal)]/55 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              {restaurant.neighborhood} · {time.label}
            </div>
          </div>
        </div>

        {/* User bubble (always visible) */}
        <Bubble side="me" text={userMessage} />

        {/* Typing indicator before reaction */}
        {showTyping && <TypingIndicator avatar={matched.avatar} name={matched.name} />}

        {/* Reaction bubble */}
        {showReaction && reply && (
          <Bubble side="them" avatar={matched.avatar} name={matched.name} text={reply.reaction} />
        )}

        {/* Typing indicator before accept */}
        {showTypingForAccept && <TypingIndicator avatar={matched.avatar} name={matched.name} />}

        {/* Accept bubble */}
        {showAccept && reply && (
          <Bubble side="them" avatar={matched.avatar} name={matched.name} text={reply.accept} />
        )}

        {error && (
          <div className="self-center mt-3 text-xs text-[var(--mala-charcoal)]/60">{error}</div>
        )}
      </div>

      {/* Confirmation footer */}
      <div className="sticky bottom-0 px-5 py-4 bg-[var(--mala-cream)]/95 backdrop-blur border-t border-[var(--border)]">
        {stage === "confirmed" ? (
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl bg-[var(--mala-red)]/10 border border-[var(--mala-red)]/30 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--mala-red)] flex items-center justify-center text-white shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-[var(--mala-red)]/70 font-semibold">
                  Date locked in
                </div>
                <div className="text-sm font-heading text-[var(--mala-charcoal)] leading-tight">
                  {restaurant.name} · {time.label}
                </div>
              </div>
            </div>
            <Button
              asChild
              variant="ghost"
              className="h-10 rounded-xl text-[var(--mala-charcoal)]/70"
            >
              <Link href="/matches">Back to matches</Link>
            </Button>
          </div>
        ) : showConfirm ? (
          <Button
            onClick={onConfirm}
            disabled={confirming}
            size="lg"
            className="w-full h-14 rounded-2xl bg-[var(--mala-red)] hover:bg-[var(--mala-red)]/90 text-[var(--mala-cream)] font-semibold shadow-lg shadow-[var(--mala-red)]/30"
          >
            Confirm Date 🌶️
          </Button>
        ) : (
          <div className="h-14 rounded-2xl bg-[var(--mala-charcoal)]/5 border border-dashed border-[var(--mala-charcoal)]/15 flex items-center justify-center text-xs text-[var(--mala-charcoal)]/40">
            Chat opens after the date is confirmed →
          </div>
        )}
      </div>
    </main>
  );
}

function Bubble({
  side,
  text,
  avatar,
  name,
}: {
  side: "me" | "them";
  text: string;
  avatar?: string;
  name?: string;
}) {
  const isMe = side === "me";
  return (
    <div
      className={cn(
        "flex items-end gap-2 max-w-[88%] animate-in fade-in slide-in-from-bottom-2 duration-300",
        isMe ? "self-end flex-row-reverse" : "self-start",
      )}
    >
      {!isMe && (
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[var(--mala-cream)] border border-[var(--border)] shrink-0">
          {avatar?.startsWith("/") ? (
            <Image src={avatar} alt={name ?? ""} fill sizes="28px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-base">
              {avatar || "🌶️"}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "px-3.5 py-2 rounded-2xl text-sm leading-snug shadow-sm",
          isMe
            ? "bg-[var(--mala-red)] text-[var(--mala-cream)] rounded-br-md"
            : "bg-white text-[var(--mala-charcoal)] border border-[var(--border)] rounded-bl-md",
        )}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator({ avatar, name }: { avatar: string; name: string }) {
  return (
    <div className="flex items-end gap-2 self-start animate-in fade-in duration-300">
      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[var(--mala-cream)] border border-[var(--border)] shrink-0">
        {avatar?.startsWith("/") ? (
          <Image src={avatar} alt={name} fill sizes="28px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-base">
            {avatar || "🌶️"}
          </span>
        )}
      </div>
      <div className="bg-white border border-[var(--border)] rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--mala-charcoal)]/40 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--mala-charcoal)]/40 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--mala-charcoal)]/40 animate-bounce" />
      </div>
    </div>
  );
}
