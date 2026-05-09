"use client";

import { useMemo } from "react";
import { selfFlavorBars, type SelfBar } from "@/lib/compatibility";
import type { CompatBreakdown } from "@/lib/compatibility";
import type { User } from "@/lib/types";

const SIZE = 220;
const CENTER = SIZE / 2;
const PAD = 32;
const RADIUS = SIZE / 2 - PAD;

// 5 axes, starting at top (-90deg), then clockwise at 72deg increments.
const AXES: SelfBar["key"][] = ["numbing", "broth", "adventurous", "communal", "intensity"];
const AXIS_LABEL: Record<SelfBar["key"], string> = {
  numbing: "Numbing",
  broth: "Broth",
  adventurous: "Adventure",
  communal: "Communal",
  intensity: "Intensity",
};

function angleFor(i: number): number {
  return -Math.PI / 2 + (i * 2 * Math.PI) / 5;
}

function pointAt(i: number, value: number): [number, number] {
  const a = angleFor(i);
  return [CENTER + Math.cos(a) * RADIUS * value, CENTER + Math.sin(a) * RADIUS * value];
}

function pathFromBars(bars: SelfBar[]): string {
  const byKey = new Map(bars.map((b) => [b.key, b.score]));
  const pts = AXES.map((k, i) => pointAt(i, Math.max(0.06, byKey.get(k) ?? 0)));
  return (
    pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ") + " Z"
  );
}

function gridRing(level: number): string {
  const pts = AXES.map((_, i) => pointAt(i, level));
  return (
    pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ") + " Z"
  );
}

export function CompatRadar({
  me,
  matched,
  breakdown,
}: {
  me: User;
  matched: User;
  breakdown: CompatBreakdown;
}) {
  const myBars = useMemo(() => selfFlavorBars(me.flavorProfile), [me]);
  const theirBars = useMemo(() => selfFlavorBars(matched.flavorProfile), [matched]);

  const myPath = useMemo(() => pathFromBars(myBars), [myBars]);
  const theirPath = useMemo(() => pathFromBars(theirBars), [theirBars]);

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-4 flex flex-col items-center gap-3">
      <style>{`
        @keyframes radar-grow {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .radar-shape {
          transform-origin: ${CENTER}px ${CENTER}px;
          animation: radar-grow 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div className="flex items-center gap-3 self-stretch text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--mala-red)]" />
          <span className="text-[var(--mala-charcoal)]/70 font-semibold">{me.name}</span>
        </div>
        <span className="text-[var(--mala-charcoal)]/30">vs</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--mala-orange)]" />
          <span className="text-[var(--mala-charcoal)]/70 font-semibold">{matched.name}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[260px] h-auto"
        aria-label={`Flavor radar comparing ${me.name} and ${matched.name}`}
      >
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((lvl) => (
          <path
            key={lvl}
            d={gridRing(lvl)}
            fill="none"
            stroke="var(--mala-charcoal)"
            strokeOpacity={lvl === 1 ? 0.18 : 0.08}
            strokeWidth={lvl === 1 ? 1 : 0.75}
          />
        ))}
        {/* Axis lines */}
        {AXES.map((k, i) => {
          const [x, y] = pointAt(i, 1);
          return (
            <line
              key={k}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="var(--mala-charcoal)"
              strokeOpacity={0.1}
              strokeWidth={0.75}
            />
          );
        })}

        {/* Their shape (orange, behind) */}
        <path
          d={theirPath}
          fill="#EA580C"
          fillOpacity={0.32}
          stroke="#EA580C"
          strokeWidth={2}
          strokeLinejoin="round"
          className="radar-shape"
          style={{ animationDelay: "120ms" }}
        />
        {/* My shape (red, in front) */}
        <path
          d={myPath}
          fill="#B91C1C"
          fillOpacity={0.32}
          stroke="#B91C1C"
          strokeWidth={2}
          strokeLinejoin="round"
          className="radar-shape"
        />

        {/* Axis labels */}
        {AXES.map((k, i) => {
          const labelRadius = RADIUS + 18;
          const a = angleFor(i);
          const x = CENTER + Math.cos(a) * labelRadius;
          const y = CENTER + Math.sin(a) * labelRadius;
          return (
            <text
              key={k}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[var(--mala-charcoal)]"
              fontSize="9"
              fontWeight="700"
              style={{ letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.7 }}
            >
              {AXIS_LABEL[k]}
            </text>
          );
        })}
      </svg>

      <div className="grid grid-cols-2 gap-2 self-stretch text-[11px] mt-1">
        <div className="flex flex-col gap-0.5 rounded-xl bg-[var(--mala-red)]/8 border border-[var(--mala-red)]/20 px-2.5 py-1.5">
          <span className="text-[9px] uppercase tracking-widest text-[var(--mala-red)]/70 font-bold">
            Strongest
          </span>
          <span className="text-[var(--mala-charcoal)] font-semibold leading-tight">
            {breakdown.strongest.label}
          </span>
          <span className="text-[10px] text-[var(--mala-charcoal)]/65 leading-tight">
            {breakdown.strongest.caption}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-[var(--mala-orange)]/8 border border-[var(--mala-orange)]/20 px-2.5 py-1.5">
          <span className="text-[9px] uppercase tracking-widest text-[var(--mala-orange)]/80 font-bold">
            Stretch
          </span>
          <span className="text-[var(--mala-charcoal)] font-semibold leading-tight">
            {breakdown.weakest.label}
          </span>
          <span className="text-[10px] text-[var(--mala-charcoal)]/65 leading-tight">
            {breakdown.weakest.caption}
          </span>
        </div>
      </div>

      {breakdown.axes.find((a) => a.key === "ingredients")?.shared?.length ? (
        <div className="flex flex-wrap gap-1 self-stretch pt-2 border-t border-[var(--border)]">
          <span className="text-[9px] uppercase tracking-widest text-[var(--mala-charcoal)]/45 font-bold mr-0.5">
            Both love
          </span>
          {(breakdown.axes.find((a) => a.key === "ingredients")?.shared ?? [])
            .slice(0, 5)
            .map((s) => (
              <span
                key={s}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--mala-orange)]/10 text-[var(--mala-orange)] font-medium"
              >
                {s}
              </span>
            ))}
        </div>
      ) : null}
    </div>
  );
}
