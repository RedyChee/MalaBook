"use client";

import { Clock, Flame, MessageCircleQuestion, Utensils } from "lucide-react";
import type { DatePlan } from "@/lib/types";

export function DatePlanCard({
  plan,
  source,
}: {
  plan: DatePlan;
  source: "live" | "cache" | "generic";
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-red-700 via-red-600 to-orange-600 p-[1px] shadow-lg">
      <div className="rounded-2xl bg-zinc-950/95 p-5 text-orange-50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-orange-300/80">
            <Flame className="h-3.5 w-3.5" />
            Your date plan
          </div>
          <span className="text-[10px] uppercase tracking-wider text-orange-200/50">
            {source === "live" ? "live · sonnet" : source === "cache" ? "cached" : "default"}
          </span>
        </div>

        <h3 className="mt-2 text-xl font-semibold leading-snug text-orange-50">
          {plan.headline}
        </h3>

        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
            <span className="text-orange-50/95">{plan.timing}</span>
          </li>
          <li className="flex items-start gap-3">
            <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
            <span className="text-orange-50/95">{plan.order}</span>
          </li>
          <li className="flex items-start gap-3">
            <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
            <span className="italic text-orange-50/95">
              “{plan.conversationStarter}”
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
