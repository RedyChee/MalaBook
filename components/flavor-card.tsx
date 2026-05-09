"use client";

import Image from "next/image";
import { forwardRef } from "react";
import type { Restaurant, User } from "@/lib/types";

export type FlavorCardProps = {
  me: User;
  matched: User;
  score: number;
  blurb: string | null;
  restaurant: Restaurant | null;
  shared: string[];
};

export const FlavorCard = forwardRef<HTMLDivElement, FlavorCardProps>(function FlavorCard(
  { me, matched, score, blurb, restaurant, shared },
  ref,
) {
  return (
    <div
      ref={ref}
      id="flavor-card-capture"
      className="relative w-[1080px] h-[1080px] flex flex-col items-center justify-between p-20 text-[#FFF7ED]"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, #EA580C 0%, #B91C1C 45%, #7B1010 80%, #1A1A1A 100%)",
        fontFamily: "var(--font-zcool, system-ui), system-ui, sans-serif",
      }}
    >
      {/* Top mark */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="text-3xl tracking-[0.4em] font-semibold"
          style={{ opacity: 0.85 }}
        >
          🌶️ MALABOOK
        </div>
        <div className="text-xl tracking-[0.3em] uppercase opacity-70">
          Flavor Card · {score}% sync
        </div>
      </div>

      {/* Avatars + names */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-12">
          <CardAvatar user={me} ring="#FFF7ED" />
          <div className="text-7xl">💕</div>
          <CardAvatar user={matched} ring="#FFF7ED" />
        </div>
        <div className="flex items-baseline gap-6 text-5xl font-bold">
          <span>{me.name}</span>
          <span style={{ opacity: 0.6 }}>×</span>
          <span>{matched.name}</span>
        </div>
        {blurb && (
          <p
            className="text-3xl italic text-center max-w-[920px] leading-snug"
            style={{ opacity: 0.92 }}
          >
            &ldquo;{blurb}&rdquo;
          </p>
        )}
      </div>

      {/* Restaurant + shared */}
      <div className="flex flex-col items-center gap-5 w-full">
        {restaurant && (
          <div className="flex items-center gap-4 text-3xl font-semibold">
            <span>🍲</span>
            <span>{restaurant.name}</span>
            <span style={{ opacity: 0.55 }}>·</span>
            <span style={{ opacity: 0.85 }}>{restaurant.neighborhood}</span>
          </div>
        )}
        {shared.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-[900px]">
            <span className="text-2xl uppercase tracking-[0.25em] opacity-70">
              Both love
            </span>
            {shared.slice(0, 6).map((s) => (
              <span
                key={s}
                className="text-2xl px-5 py-2 rounded-full font-semibold"
                style={{
                  background: "rgba(255, 247, 237, 0.15)",
                  border: "2px solid rgba(255, 247, 237, 0.35)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="text-xl uppercase tracking-[0.4em] mt-3" style={{ opacity: 0.6 }}>
          malabook.vercel.app
        </div>
      </div>
    </div>
  );
});

function CardAvatar({ user, ring }: { user: User; ring: string }) {
  const isImage = user.avatar?.startsWith("/");
  return (
    <div
      className="relative w-64 h-64 rounded-[40px] overflow-hidden flex items-center justify-center"
      style={{
        border: `8px solid ${ring}`,
        background: "rgba(255, 247, 237, 0.12)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      }}
    >
      {isImage ? (
        <Image src={user.avatar} alt={user.name} fill sizes="256px" className="object-cover" />
      ) : (
        <span className="text-[140px] leading-none">{user.avatar || "🌶️"}</span>
      )}
    </div>
  );
}
