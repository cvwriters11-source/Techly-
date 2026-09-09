"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  finishCareerSessionAction,
  submitCareerAnswerAction,
} from "@/app/career/actions";
import { Button } from "@/components/ui/button";
import { BrandSpinBackdrop } from "@/components/brand-spin-backdrop";
import {
  focusLabel,
  type CareerMessage,
  type CareerSession,
  type CareerVoice,
} from "@/lib/career/store";
import {
  parseCareerReview,
  scoreLabel,
  type CareerSessionReview,
} from "@/lib/career/interview-prep";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<
          ArrayLike<{ transcript: string }> & { isFinal?: boolean }
        >;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type Phase = "coach" | "your_turn" | "thinking" | "done";

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SessionReviewCard({
  summary,
  review,
}: {
  summary: string;
  review: CareerSessionReview | null;
}) {
  if (!review) {
    return (
      <div className="rounded-[1.4rem] border border-white/12 bg-[#111] p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-white">Session summary</h2>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-white/75">
          {summary}
        </p>
        <Link
          href="/career/app"
          className="mt-4 inline-flex text-sm text-accent hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.4rem] border border-white/12 bg-[#111] p-4 text-center sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-xs">
          Interview score
        </p>
        <p className="mt-3 text-5xl font-semibold text-white sm:text-6xl">
          {review.score}
          <span className="text-2xl text-white/45 sm:text-3xl">/100</span>
        </p>
        <p className="mt-2 text-sm font-medium text-accent">
          {review.grade || scoreLabel(review.score)}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
          {review.overview}
        </p>
      </div>

      {review.corrections.length > 0 ? (
        <div className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-white">
            Corrections — how to answer
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Review each answer and practise the stronger version in your own
            words.
          </p>
          <div className="mt-4 space-y-4">
            {review.corrections.map((item, index) => (
              <div
                key={`${item.question}-${index}`}
                className="rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">
                    {index + 1}. {item.question}
                  </p>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {item.score}/100
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                  Your answer
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/65">
                  {item.yourAnswer || "—"}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                  Coach feedback
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/80">
                  {item.feedback}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  Stronger answer
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white">
                  {item.betterAnswer}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {review.nextSteps.length > 0 ? (
        <div className="rounded-[1.4rem] border border-white/12 bg-[#111] p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-white">Next steps</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/75">
            {review.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        href="/career/app"
        className="inline-flex text-sm text-accent hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

function pickBrowserVoice(preferred: CareerVoice) {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const genderHints =
    preferred === "woman"
      ? ["female", "woman", "leah", "zira", "samantha", "victoria", "karen"]
      : ["male", "man", "luke", "david", "daniel", "mark", "george"];

  const scored = voices.map((voice) => {
    const hay = `${voice.name} ${voice.lang}`.toLowerCase();
    let score = 0;
    if (hay.includes("en-za") || hay.includes("af-za")) score += 40;
    if (hay.includes("south africa") || hay.includes("za")) score += 25;
    if (hay.startsWith("en")) score += 10;
    if (genderHints.some((hint) => hay.includes(hint))) score += 20;
    return { voice, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.voice ?? null;
}

function speakWithBrowser(text: string, preferred: CareerVoice) {
  return new Promise<void>((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-ZA";
    // Slower + lower pitch reads more like a real interviewer.
    utter.rate = preferred === "man" ? 0.88 : 0.9;
    utter.pitch = preferred === "man" ? 0.78 : 0.85;
    const voice = pickBrowserVoice(preferred);
    if (voice) utter.voice = voice;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(watchdog);
      resolve();
    };

    // Keep the conversation moving if the browser never fires onend.
    const estMs = Math.min(
      90_000,
      Math.max(3_500, (text.length / 11) * (1000 / utter.rate) + 1_200),
    );
    const watchdog = window.setTimeout(() => {
      window.speechSynthesis.cancel();
      finish();
    }, estMs);

    // If speech never starts (common in locked/automated tabs), advance quickly.
    window.setTimeout(() => {
      if (
        !settled &&
        !window.speechSynthesis.speaking &&
        !window.speechSynthesis.pending
      ) {
        window.speechSynthesis.cancel();
        finish();
      }
    }, 1_800);

    utter.onend = () => finish();
    utter.onerror = () => finish();

    const start = () => {
      try {
        window.speechSynthesis.speak(utter);
      } catch {
        finish();
      }
    };

    // Some browsers load voices async; retry once after voiceschanged.
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const late = pickBrowserVoice(preferred);
        if (late) utter.voice = late;
        start();
      };
      window.setTimeout(start, 250);
    } else {
      start();
    }
  });
}

async function uploadMessageAudio(
  sessionId: string,
  messageId: string,
  blob: Blob,
) {
  const form = new FormData();
  form.set("sessionId", sessionId);
  form.set("messageId", messageId);
  form.set(
    "audio",
    new File([blob], `${messageId}.webm`, {
      type: blob.type || "audio/webm",
    }),
  );
  await fetch("/api/career/audio", { method: "POST", body: form });
}

async function playCoachLine(
  text: string,
  voice: CareerVoice,
  sessionId: string,
  messageId?: string,
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch("/api/career/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, sessionId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Azure voice unavailable");
    }

    const blob = await response.blob();
    if (messageId) {
      void uploadMessageAudio(sessionId, messageId, blob);
    }
    const url = URL.createObjectURL(blob);
    await new Promise<void>((resolve, reject) => {
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not play audio."));
      };
      void audio.play().catch(reject);
    });
  } catch {
    await speakWithBrowser(text, voice);
  } finally {
    window.clearTimeout(timeout);
  }
}

export function CareerSessionRoom({
  session,
  initialMessages,
}: {
  session: CareerSession;
  initialMessages: CareerMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [phase, setPhase] = useState<Phase>(
    session.status === "active" ? "coach" : "done",
  );
  const [summary, setSummary] = useState(session.summary);
  const [status, setStatus] = useState(session.status);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pendingAudioRef = useRef<Blob | null>(null);
  const endedRef = useRef(false);
  const spokenCompletedRef = useRef<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const startListeningRef = useRef<(autoSubmit: boolean) => void>(() => {});
  const sessionActiveRef = useRef(true);

  const active = status === "active" && (remainingMs === null || remainingMs > 0);
  sessionActiveRef.current = active;
  const latestCoach = [...messages]
    .reverse()
    .find((message) => message.role === "coach");

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, liveTranscript, phase]);

  useEffect(() => {
    if (!session.endsAt || status !== "active") {
      setRemainingMs(
        session.status === "completed" || session.status === "abandoned"
          ? 0
          : session.durationMinutes * 60_000,
      );
      return;
    }
    const tick = () => {
      const left = Math.max(0, new Date(session.endsAt!).getTime() - Date.now());
      setRemainingMs(left);
      if (left <= 0 && !endedRef.current) {
        endedRef.current = true;
        stopListening();
        window.speechSynthesis?.cancel();
        startTransition(async () => {
          try {
            const completed = await finishCareerSessionAction(session.id);
            setStatus(completed.status);
            setSummary(completed.summary);
            setPhase("done");
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Could not end session.",
            );
          }
        });
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [session.endsAt, session.id, session.durationMinutes, session.status, status]);

  useEffect(() => {
    if (!latestCoach || spokenCompletedRef.current.has(latestCoach.id)) return;
    if (status !== "active") return;

    let cancelled = false;
    stopListening();
    setPhase("coach");
    setError("");
    setLiveTranscript("");

    void playCoachLine(
      latestCoach.text,
      session.voice,
      session.id,
      latestCoach.id,
    )
      .then(() => {
        if (cancelled || !sessionActiveRef.current) return;
        spokenCompletedRef.current.add(latestCoach.id);
        setPhase("your_turn");
        // Conversation turn: coach finished → open mic for the candidate.
        window.setTimeout(() => {
          if (!cancelled && sessionActiveRef.current) {
            startListeningRef.current(true);
          }
        }, 350);
      })
      .catch((err) => {
        if (cancelled) return;
        spokenCompletedRef.current.add(latestCoach.id);
        setError(
          err instanceof Error
            ? err.message
            : "Coach voice could not play. Allow sound, then continue.",
        );
        setPhase("your_turn");
        window.setTimeout(() => {
          if (!cancelled && sessionActiveRef.current) {
            startListeningRef.current(true);
          }
        }, 350);
      });

    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- listen helpers are stable enough for session turns
  }, [latestCoach?.id, session.id, session.voice, status]);

  function stopMediaCapture() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }

  function stopListening() {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        recognition.abort?.();
      }
      recognitionRef.current = null;
    }
    stopMediaCapture();
    setListening(false);
  }

  async function startMediaCapture() {
    pendingAudioRef.current = null;
    audioChunksRef.current = [];
    if (!navigator.mediaDevices?.getUserMedia) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      if (audioChunksRef.current.length > 0) {
        pendingAudioRef.current = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
      }
      audioChunksRef.current = [];
    };
    recorder.start(250);
  }

  function startListening(autoSubmit: boolean) {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError(
        "Microphone speech is not supported in this browser. Use Chrome or Edge for the voice interview.",
      );
      return;
    }

    stopListening();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-ZA";

    let finalText = "";
    let silenceTimer: number | null = null;

    const finishUtterance = () => {
      if (silenceTimer) window.clearTimeout(silenceTimer);
      const spoken = finalText.trim();

      const stopCapture = new Promise<Blob | null>((resolve) => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") {
          resolve(pendingAudioRef.current);
          return;
        }
        recorder.onstop = () => {
          const blob =
            audioChunksRef.current.length > 0
              ? new Blob(audioChunksRef.current, {
                  type: recorder.mimeType || "audio/webm",
                })
              : null;
          audioChunksRef.current = [];
          resolve(blob);
        };
        try {
          recorder.stop();
        } catch {
          resolve(null);
        }
      });

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;

      const recognitionHandle = recognitionRef.current;
      if (recognitionHandle) {
        recognitionHandle.onend = null;
        recognitionHandle.onresult = null;
        recognitionHandle.onerror = null;
        try {
          recognitionHandle.stop();
        } catch {
          recognitionHandle.abort?.();
        }
        recognitionRef.current = null;
      }
      setListening(false);

      void stopCapture.then((blob) => {
        pendingAudioRef.current = blob;
        if (spoken.length < 2) {
          setPhase("your_turn");
          return;
        }
        if (autoSubmit) {
          void submitSpokenAnswer(spoken);
        } else {
          setLiveTranscript(spoken);
          setPhase("your_turn");
        }
      });
    };

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const piece = result[0]?.transcript ?? "";
        if ((result as { isFinal?: boolean }).isFinal) {
          finalText = `${finalText} ${piece}`.trim();
        } else {
          interim += piece;
        }
      }
      setLiveTranscript(`${finalText} ${interim}`.trim());
      if (silenceTimer) window.clearTimeout(silenceTimer);
      silenceTimer = window.setTimeout(finishUtterance, 2200);
    };
    recognition.onerror = () => {
      if (silenceTimer) window.clearTimeout(silenceTimer);
      stopListening();
      setPhase("your_turn");
    };
    recognition.onend = () => {
      if (silenceTimer) window.clearTimeout(silenceTimer);
      setListening(false);
    };

    recognitionRef.current = recognition;
    void startMediaCapture()
      .catch(() => {
        /* speech can continue even if recording fails */
      })
      .finally(() => {
        try {
          recognition.start();
          setListening(true);
          setPhase("your_turn");
        } catch {
          setError(
            "Could not open the microphone. Allow mic access and try again.",
          );
          setPhase("your_turn");
        }
      });
  }

  startListeningRef.current = startListening;

  function submitSpokenAnswer(spoken: string) {
    const text = spoken.trim();
    if (text.length < 2 || !active || pending) return;

    const recorded = pendingAudioRef.current;
    pendingAudioRef.current = null;
    stopListening();
    setPhase("thinking");
    setLiveTranscript("");

    startTransition(async () => {
      setError("");
      try {
        const { candidateMessage, coachMessage } =
          await submitCareerAnswerAction(session.id, text);
        setMessages((prev) => [...prev, candidateMessage, coachMessage]);
        if (recorded) {
          void uploadMessageAudio(session.id, candidateMessage.id, recorded);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not send answer.");
        setLiveTranscript(text);
        setPhase("your_turn");
      }
    });
  }

  function endEarly() {
    if (pending) return;
    endedRef.current = true;
    stopListening();
    window.speechSynthesis?.cancel();
    startTransition(async () => {
      try {
        const completed = await finishCareerSessionAction(session.id);
        setStatus(completed.status);
        setSummary(completed.summary);
        setPhase("done");
        setRemainingMs(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not end session.");
      }
    });
  }

  const statusLabel =
    phase === "coach"
      ? "Coach speaking"
      : phase === "your_turn"
        ? listening
          ? "Your turn — speak"
          : "Your turn"
        : phase === "thinking"
          ? "Coach thinking…"
          : "Session complete";

  const review = summary ? parseCareerReview(summary) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent sm:text-xs">
            Voice interview
          </p>
          <h1 className="mt-1 truncate text-lg font-semibold text-white sm:mt-2 sm:text-3xl">
            {session.targetRole || "Mock interview"}
          </h1>
          <p className="mt-0.5 text-xs text-white/55 sm:mt-1 sm:text-sm">
            {focusLabel(session.focus)} · {session.voice} ·{" "}
            {session.durationMinutes} min
          </p>
        </div>
        <div
          className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-sm text-white sm:px-4 sm:py-2 sm:text-lg"
          suppressHydrationWarning
        >
          {remainingMs === null ? "--:--" : formatRemaining(remainingMs)}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100 sm:px-4 sm:py-3 sm:text-sm">
          {error}
        </p>
      ) : null}

      {!summary ? (
        <div className="relative flex max-h-[min(78dvh,640px)] flex-col items-center overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] px-4 py-5 text-center sm:max-h-none sm:rounded-[1.8rem] sm:px-6 sm:py-10">
          <BrandSpinBackdrop size="compact" />

          <p className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-xs">
            Techly
          </p>

          <div
            className={cn(
              "relative z-10 mt-3 flex size-16 items-center justify-center rounded-full border-2 transition sm:mt-6 sm:size-24",
              phase === "coach" &&
                "border-accent bg-accent/15 text-accent shadow-[0_0_28px_rgba(18,200,176,0.3)]",
              phase === "your_turn" &&
                listening &&
                "border-accent bg-accent text-black shadow-[0_0_28px_rgba(18,200,176,0.4)]",
              phase === "your_turn" &&
                !listening &&
                "border-white/25 bg-white/5 text-white",
              phase === "thinking" && "border-white/20 bg-white/5 text-white/70",
            )}
          >
            {phase === "coach" || phase === "thinking" ? (
              <Volume2 className="size-6 sm:size-9" />
            ) : listening ? (
              <Mic className="size-6 sm:size-9" />
            ) : (
              <MicOff className="size-6 sm:size-9" />
            )}
          </div>

          <p className="relative z-10 mt-3 text-base font-medium text-white sm:mt-5 sm:text-lg">
            {statusLabel}
          </p>
          <p className="relative z-10 mt-1 max-w-md px-1 text-xs text-white/55 sm:mt-2 sm:text-sm">
            {phase === "coach"
              ? "Listen — the coach will correct you, then your mic opens."
              : phase === "your_turn" && listening
                ? "Speak. Pause to send your answer."
                : phase === "your_turn"
                  ? "Tap Speak if the mic doesn’t open."
                  : "Please wait…"}
          </p>

          <div
            ref={listRef}
            className="relative z-10 mt-4 min-h-0 w-full max-w-xl flex-1 space-y-2 overflow-y-auto text-left sm:mt-6 sm:max-h-[36vh] sm:space-y-3"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "coach"
                    ? "rounded-2xl border border-accent/25 bg-black/45 px-3 py-2 text-[13px] text-white backdrop-blur-[2px] sm:px-4 sm:py-3 sm:text-sm"
                    : "ml-3 rounded-2xl border border-white/15 bg-black/35 px-3 py-2 text-[13px] text-white/90 backdrop-blur-[2px] sm:ml-4 sm:px-4 sm:py-3 sm:text-sm"
                }
              >
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45 sm:mb-1 sm:text-[11px]">
                  {message.role === "coach" ? "Coach" : "You"}
                </p>
                <p className="leading-snug whitespace-pre-wrap sm:leading-relaxed">
                  {message.text}
                </p>
              </div>
            ))}

            {phase === "your_turn" && liveTranscript ? (
              <div className="ml-3 rounded-2xl border border-accent/40 bg-accent/10 px-3 py-2 text-[13px] text-white sm:ml-4 sm:px-4 sm:py-3 sm:text-sm">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent sm:mb-1 sm:text-[11px]">
                  You · speaking
                </p>
                <p className="leading-snug whitespace-pre-wrap sm:leading-relaxed">
                  {liveTranscript}
                </p>
              </div>
            ) : null}

            {phase === "thinking" ? (
              <div className="rounded-2xl border border-white/12 bg-black/35 px-3 py-2 text-[13px] text-white/55 sm:px-4 sm:py-3 sm:text-sm">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40 sm:mb-1 sm:text-[11px]">
                  Coach
                </p>
                <p>Thinking of the next question…</p>
              </div>
            ) : null}
          </div>

          {active ? (
            <div className="relative z-10 mt-4 flex w-full max-w-xl shrink-0 flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-3 sm:mt-8 sm:gap-3 sm:border-0 sm:pt-0">
              {phase === "coach" || phase === "thinking" ? (
                <p className="w-full text-[11px] text-white/40 sm:text-xs">
                  {phase === "coach"
                    ? "Your turn starts when the coach finishes."
                    : "Next question coming…"}
                </p>
              ) : listening ? (
                <Button
                  type="button"
                  variant="solid"
                  className="min-h-10 px-4 text-sm"
                  onClick={stopListening}
                >
                  <MicOff className="size-4" /> Stop mic
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="solid"
                  className="min-h-10 px-4 text-sm"
                  disabled={pending}
                  onClick={() => startListening(true)}
                >
                  <Mic className="size-4" /> Speak answer
                </Button>
              )}
              {liveTranscript.trim().length > 1 &&
              !listening &&
              phase === "your_turn" ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-10 text-sm"
                  disabled={pending}
                  onClick={() => submitSpokenAnswer(liveTranscript)}
                >
                  Send
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                className="min-h-10 text-sm"
                disabled={pending || status !== "active"}
                onClick={endEarly}
              >
                End
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {summary ? <SessionReviewCard summary={summary} review={review} /> : null}
    </div>
  );
}
