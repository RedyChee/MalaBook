"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlavorCard, type FlavorCardProps } from "./flavor-card";

type FlavorCardModalProps = FlavorCardProps & {
  open: boolean;
  onClose: () => void;
};

function detectCanShare(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function") return false;
  try {
    const probe = new File(["x"], "probe.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export function FlavorCardModal({ open, onClose, ...cardProps }: FlavorCardModalProps) {
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const canShare = useMemo(() => detectCanShare(), []);

  if (!open) return null;

  const fileName = `malabook-${cardProps.me.name}-${cardProps.matched.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  async function snapshot(): Promise<string | null> {
    if (!captureRef.current) return null;
    const { toPng } = await import("html-to-image");
    return toPng(captureRef.current, {
      cacheBust: true,
      pixelRatio: 1,
      width: 1080,
      height: 1080,
    });
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const dataUrl = await snapshot();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${fileName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    try {
      const dataUrl = await snapshot();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${fileName}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Our MalaBook flavor card",
          text: `${cardProps.me.name} × ${cardProps.matched.name} · ${cardProps.score}% flavor sync 🌶️`,
          files: [file],
        });
      }
    } catch {
      /* user dismissed */
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[420px] bg-[var(--mala-cream)] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[var(--border)] shadow-2xl px-5 py-5 flex flex-col gap-4 animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] tracking-widest uppercase text-[var(--mala-charcoal)]/50">
              Your flavor card
            </div>
            <div className="font-heading text-base text-[var(--mala-charcoal)] mt-0.5">
              Share the spice 🌶️
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

        {/* Visible preview (scaled down) */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[var(--border)] shadow-inner bg-black">
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{ transform: "scale(0.352)", width: 1080, height: 1080 }}
          >
            <FlavorCard ref={captureRef} {...cardProps} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleDownload}
            disabled={busy !== null}
            className="h-12 rounded-2xl bg-[var(--mala-red)] hover:bg-[var(--mala-red)]/90 text-[var(--mala-cream)] font-semibold"
          >
            <Download className="w-4 h-4 mr-1" />
            {busy === "download" ? "Saving…" : "Download PNG"}
          </Button>
          {canShare && (
            <Button
              onClick={handleShare}
              disabled={busy !== null}
              variant="outline"
              className="h-12 rounded-2xl border-[var(--mala-red)]/40 text-[var(--mala-red)] font-semibold hover:bg-[var(--mala-red)]/5"
            >
              <Share2 className="w-4 h-4 mr-1" />
              {busy === "share" ? "Sharing…" : "Share to…"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
