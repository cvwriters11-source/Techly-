"use client";

import { Bell, BellOff, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { InboxAlertPulse } from "@/lib/inbox/store";

const STORAGE_KEY = "techly-admin-inbox-signature";
const VOLUME_KEY = "techly-admin-alert-volume";
const POLL_MS = 8000;
const DEFAULT_VOLUME = 0.75;

function clampVolume(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, value));
}

function readStoredVolume() {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  return clampVolume(Number(window.localStorage.getItem(VOLUME_KEY)));
}

function playChime(volume: number) {
  const level = clampVolume(volume);
  if (level <= 0) return;

  const AudioContextClass =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  void context.resume();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const peak = 0.04 + level * 0.42;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.setValueAtTime(1175, now + 0.14);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.6);
  oscillator.onended = () => {
    void context.close();
  };
}

function showDesktopNotice(alert: NonNullable<InboxAlertPulse["alert"]>) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const notice = new Notification(alert.title, {
    body: alert.body,
    icon: "/techly-badge.png",
    tag: "techly-admin-inbox",
  });
  notice.onclick = () => {
    window.focus();
    window.location.assign(alert.href);
    notice.close();
  };
}

export function AdminInboxAlerts() {
  const router = useRouter();
  const lastSignature = useRef<string | null>(null);
  const titleTimer = useRef<number>(0);
  const previewTimer = useRef<number>(0);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  volumeRef.current = volume;

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    setVolume(readStoredVolume());
  }, []);

  useEffect(() => {
    lastSignature.current = window.localStorage.getItem(STORAGE_KEY);

    const unlockAudio = () => {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      void context.resume().finally(() => void context.close());
    };
    window.addEventListener("pointerdown", unlockAudio, { once: true });

    let cancelled = false;
    const tick = async () => {
      try {
        const response = await fetch("/admin/inbox-pulse", {
          cache: "no-store",
        });
        if (response.status === 401 || cancelled) return;
        if (!response.ok) return;
        const pulse = (await response.json()) as InboxAlertPulse;
        if (cancelled || !pulse.signature) return;

        const previous = lastSignature.current;
        if (previous === null) {
          lastSignature.current = pulse.signature;
          window.localStorage.setItem(STORAGE_KEY, pulse.signature);
          return;
        }
        if (previous === pulse.signature) return;

        lastSignature.current = pulse.signature;
        window.localStorage.setItem(STORAGE_KEY, pulse.signature);
        if (pulse.alert) {
          playChime(volumeRef.current);
          showDesktopNotice(pulse.alert);
          const alertedTitle = `● ${pulse.alert.title}`;
          document.title = alertedTitle;
          window.clearInterval(titleTimer.current);
          titleTimer.current = window.setInterval(() => {
            if (document.visibilityState === "visible" && document.hasFocus()) {
              window.clearInterval(titleTimer.current);
              return;
            }
            if (!document.title.startsWith("●")) {
              document.title = alertedTitle;
            }
          }, 800);
        }
        router.refresh();
      } catch {
        // Keep polling even if one check fails.
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearInterval(titleTimer.current);
      window.clearTimeout(previewTimer.current);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pointerdown", unlockAudio);
    };
  }, [router]);

  async function enableAlerts() {
    playChime(volumeRef.current);
    if (!("Notification" in window)) return;
    const next = await Notification.requestPermission();
    setPermission(next);
  }

  function changeVolume(next: number) {
    const level = clampVolume(next);
    setVolume(level);
    volumeRef.current = level;
    window.localStorage.setItem(VOLUME_KEY, String(level));
    window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      playChime(level);
    }, 120);
  }

  const enabled = permission === "granted";
  const volumePercent = Math.round(volume * 100);

  return (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={() => void enableAlerts()}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 px-2 py-1.5 text-sm text-white/80 transition hover:border-white/30 hover:text-white sm:gap-2 sm:px-3"
        aria-pressed={enabled}
        title={
          enabled
            ? "Sound and desktop alerts are on, including when this tab is in the background"
            : "Turn on a sound and desktop alert when a client sends a message"
        }
      >
        {enabled ? (
          <Bell className="size-4 shrink-0 text-accent" />
        ) : (
          <BellOff className="size-4 shrink-0" />
        )}
        <span className="hidden min-[420px]:inline">
          {enabled ? "Alerts on" : "Enable alerts"}
        </span>
      </button>
      <label
        className="flex min-w-0 items-center gap-1 text-white/70 sm:gap-1.5"
        title={`Alert volume ${volumePercent}%`}
      >
        <Volume2 className="size-4 shrink-0" />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volumePercent}
          aria-label="Alert volume"
          onChange={(event) => changeVolume(Number(event.target.value) / 100)}
          className="h-1 w-12 max-w-full cursor-pointer accent-[#12c8b0] sm:w-20"
        />
        <span className="hidden w-8 text-xs tabular-nums sm:inline">
          {volumePercent}%
        </span>
      </label>
    </div>
  );
}
