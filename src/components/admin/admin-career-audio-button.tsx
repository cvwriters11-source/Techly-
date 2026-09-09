"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CareerMessage } from "@/lib/career/store";
import { Volume2 } from "lucide-react";

export function AdminCareerAudioButton({
  message,
}: {
  message: CareerMessage;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canPlay =
    Boolean(message.audioPath) || message.role === "coach";

  if (!canPlay) {
    return (
      <span className="text-[11px] text-white/35">No recording saved</span>
    );
  }

  async function play() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/career/audio?messageId=${encodeURIComponent(message.id)}`,
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || "Could not load audio.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      await new Promise<void>((resolve, reject) => {
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Playback failed."));
        };
        void audio.play().catch(reject);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playback failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        className="min-h-8 px-3 text-xs"
        disabled={busy}
        onClick={() => void play()}
      >
        <Volume2 className="size-3.5" />
        {busy ? "Playing…" : "Listen"}
      </Button>
      {error ? <span className="text-[11px] text-amber-200">{error}</span> : null}
    </div>
  );
}
