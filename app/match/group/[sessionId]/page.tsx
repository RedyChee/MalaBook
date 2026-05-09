"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, MapPin, Sparkles } from "lucide-react";
import users from "@/data/users.json";
import restaurants from "@/data/restaurants.json";
import {
  TIME_OPTIONS,
  bookingById,
  parseGroupSessionId,
  saveBooking,
} from "@/lib/bookings";
import type { Booking } from "@/lib/bookings";
import type { Restaurant, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Reply = { userId: string; reaction: string; accept: string };
type MemberState =
  | "waiting"
  | "typing-reaction"
  | "reaction-shown"
  | "typing-accept"
  | "accept-shown";

export default function GroupChatPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();

  const allUsers = users as User[];
  const allRestaurants = restaurants as Restaurant[];

  const parsed = useMemo(() => parseGroupSessionId(sessionId), [sessionId]);
  const time = useMemo(
    () => (parsed ? TIME_OPTIONS.find((t) => t.id === parsed.timeId) ?? TIME_OPTIONS[1] : null),
    [parsed],
  );
  const members = useMemo(() => {
    if (!parsed) return [];
    return parsed.memberIds
      .map((id) => allUsers.find((u) => u.id === id))
      .filter((u): u is User => Boolean(u));
  }, [parsed, allUsers]);

  const [me, setMe] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [memberStates, setMemberStates] = useState<MemberState[]>([]);
  const [allReplied, setAllReplied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fetchedRef = useRef(false);
  const playedRef = useRef(false);

  // Bootstrap me + initial states
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
  }, [router]);

  useEffect(() => {
    if (members.length === 0) return;
    setMemberStates(members.map(() => "waiting"));
  }, [members.length, members]);

  // Check for existing booking → jump to confirmed
  useEffect(() => {
    if (!parsed) return;
    const existing = bookingById(sessionId);
    if (existing && existing.type === "group") {
      const r = allRestaurants.find((x) => x.id === existing.restaurantId) ?? null;
      setRestaurant(r);
      setConfirmed(true);
      setAllReplied(true);
      setMemberStates(members.map(() => "accept-shown"));
      // Synthesize replies for display
      setReplies(
        members.map((m) => ({
          userId: m.id,
          reaction: "Already locked in 🌶️",
          accept: `${existing.when} at ${r?.name ?? "the spot"} — see you there.`,
        })),
      );
    }
  }, [parsed, sessionId, allRestaurants, members]);

  // Fetch restaurant + replies if not confirmed.
  // Ref-guarded to avoid the cleanup canceling our own in-flight fetch
  // when we call setRestaurant mid-stream.
  useEffect(() => {
    if (!me || !time || members.length === 0) return;
    if (confirmed) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const dsRes = await fetch("/api/group-datespot", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ me, members }),
        });
        const ds = (await dsRes.json()) as { restaurantId: string };
        const r = allRestaurants.find((x) => x.id === ds.restaurantId) ?? allRestaurants[0];
        setRestaurant(r);

        const repRes = await fetch("/api/group-chat-reply", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            me,
            members,
            restaurant: { id: r.id, name: r.name, nameZh: r.nameZh, neighborhood: r.neighborhood },
            when: time.label,
          }),
        });
        const rep = (await repRes.json()) as { replies: Reply[] };
        setReplies(rep.replies);
      } catch {
        setError("Couldn't reach the crew — try again.");
      }
    })();
  }, [me, time, members, confirmed, allRestaurants]);

  // Once replies arrive, sequentially play them out.
  // Ref-guarded so we never replay if memberStates updates trigger a deps change.
  useEffect(() => {
    if (!replies || confirmed || allReplied) return;
    if (playedRef.current) return;
    playedRef.current = true;

    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    (async () => {
      await sleep(400);
      for (let i = 0; i < members.length; i++) {
        setMemberStates((prev) => prev.map((s, idx) => (idx === i ? "typing-reaction" : s)));
        await sleep(900);
        setMemberStates((prev) => prev.map((s, idx) => (idx === i ? "reaction-shown" : s)));
        await sleep(700);
        setMemberStates((prev) => prev.map((s, idx) => (idx === i ? "typing-accept" : s)));
        await sleep(700);
        setMemberStates((prev) => prev.map((s, idx) => (idx === i ? "accept-shown" : s)));
        await sleep(900);
      }
      setAllReplied(true);
    })();
  }, [replies, members.length, confirmed, allReplied]);

  if (!parsed || members.length === 0) {
    return (
      <main className="flex flex-col h-full min-h-screen items-center justify-center px-8 text-center gap-3">
        <p className="text-[var(--mala-charcoal)]/70">Group not found.</p>
        <Button asChild variant="ghost">
          <Link href="/matches">Back to matches</Link>
        </Button>
      </main>
    );
  }
  if (!me || !time) {
    return (
      <main className="flex flex-col h-full min-h-screen items-center justify-center text-[var(--mala-charcoal)]/50">
        <Loader2 className="w-6 h-6 animate-spin" />
      </main>
    );
  }

  const onConfirm = () => {
    if (!restaurant || confirming) return;
    setConfirming(true);
    const booking: Booking = {
      id: sessionId,
      type: "group",
      participantIds: members.map((m) => m.id),
      restaurantId: restaurant.id,
      when: time.label,
      caption: time.caption,
      createdAt: Date.now(),
    };
    saveBooking(booking);
    setConfirmed(true);
    setConfirming(false);
  };

  const userMessage = restaurant
    ? `Group hotpot? I'm thinking ${restaurant.name} — ${time.label}. 🍲`
    : `Group hotpot? ${time.label} — picking the spot...`;

  return (
    <main className="flex flex-col h-full min-h-screen bg-[var(--mala-cream)]">
      <header className="sticky top-0 z-10 px-5 py-3 bg-[var(--mala-cream)]/95 backdrop-blur border-b border-[var(--border)] flex items-center gap-3">
        <Link
          href="/matches"
          aria-label="Back"
          className="text-[var(--mala-charcoal)]/60 hover:text-[var(--mala-red)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2.5 flex-1">
          <AvatarStack members={members} />
          <div className="leading-tight min-w-0">
            <div className="font-heading text-sm text-[var(--mala-charcoal)] truncate">
              {members.map((m) => m.name).join(" · ")}
            </div>
            <div className="text-[10px] text-[var(--mala-charcoal)]/55">
              {confirmed ? "🍲 Group date locked" : "🍲 Group hotpot · 4 people"}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-2.5 overflow-y-auto">
        {/* Restaurant context card */}
        {restaurant && (
          <div className="self-center mb-1 max-w-[280px] rounded-2xl bg-white border border-[var(--mala-orange)]/20 px-3 py-2 flex items-center gap-2 shadow-sm">
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
        )}

        {/* User bubble */}
        <Bubble side="me" text={userMessage} />

        {/* Picking spot indicator (before restaurant arrives) */}
        {!restaurant && !error && (
          <div className="self-center text-[11px] text-[var(--mala-charcoal)]/45 italic mt-1">
            🌶️ MalaBook is picking the spot…
          </div>
        )}

        {/* Per-member sequence */}
        {members.map((m, i) => {
          const state = memberStates[i] ?? "waiting";
          const reply = replies?.find((r) => r.userId === m.id);
          if (state === "waiting") return null;
          return (
            <div key={m.id} className="flex flex-col gap-2.5">
              {state === "typing-reaction" && <TypingIndicator avatar={m.avatar} name={m.name} />}
              {(state === "reaction-shown" || state === "typing-accept" || state === "accept-shown") &&
                reply && (
                  <Bubble side="them" avatar={m.avatar} name={m.name} text={reply.reaction} />
                )}
              {state === "typing-accept" && <TypingIndicator avatar={m.avatar} name={m.name} />}
              {state === "accept-shown" && reply && (
                <Bubble side="them" avatar={m.avatar} name={m.name} text={reply.accept} />
              )}
            </div>
          );
        })}

        {error && (
          <div className="self-center mt-3 text-xs text-[var(--mala-charcoal)]/60">{error}</div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 px-5 py-4 bg-[var(--mala-cream)]/95 backdrop-blur border-t border-[var(--border)]">
        {confirmed ? (
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl bg-[var(--mala-red)]/10 border border-[var(--mala-red)]/30 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--mala-red)] flex items-center justify-center text-white shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-[var(--mala-red)]/70 font-semibold">
                  🍲 Group hotpot locked in
                </div>
                <div className="text-sm font-heading text-[var(--mala-charcoal)] leading-tight truncate">
                  {restaurant?.name ?? "the spot"} · {time.label} · {members.length + 1} people
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
        ) : allReplied ? (
          <Button
            onClick={onConfirm}
            disabled={confirming}
            size="lg"
            className="w-full h-14 rounded-2xl bg-[var(--mala-red)] hover:bg-[var(--mala-red)]/90 text-[var(--mala-cream)] font-semibold shadow-lg shadow-[var(--mala-red)]/30"
          >
            🍲 Confirm Group Hotpot
          </Button>
        ) : (
          <div className="h-14 rounded-2xl bg-[var(--mala-charcoal)]/5 border border-dashed border-[var(--mala-charcoal)]/15 flex items-center justify-center text-xs text-[var(--mala-charcoal)]/40">
            Waiting on the crew to reply…
          </div>
        )}
      </div>
    </main>
  );
}

function AvatarStack({ members }: { members: User[] }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 3).map((m) => (
        <div
          key={m.id}
          className="relative w-8 h-8 rounded-full overflow-hidden bg-[var(--mala-cream)] border-2 border-[var(--mala-cream)] shadow-sm"
        >
          {m.avatar?.startsWith("/") ? (
            <Image src={m.avatar} alt={m.name} fill sizes="32px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-base">
              {m.avatar || "🌶️"}
            </span>
          )}
        </div>
      ))}
    </div>
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
      <div className="flex flex-col gap-0.5 min-w-0">
        {!isMe && name && (
          <span className="text-[10px] font-semibold text-[var(--mala-charcoal)]/55 ml-2">
            {name}
          </span>
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
