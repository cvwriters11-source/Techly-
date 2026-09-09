import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandSpinBackdrop({
  tone = "accent",
  size = "default",
}: {
  tone?: "accent" | "warning";
  size?: "default" | "compact";
}) {
  const glow =
    tone === "warning" ? "bg-amber-400/25" : "bg-accent/25";
  const ring =
    tone === "warning" ? "border-amber-300/35" : "border-accent/30";
  const shadow =
    tone === "warning"
      ? "drop-shadow-[0_0_36px_rgba(251,191,36,0.4)]"
      : "drop-shadow-[0_0_36px_rgba(18,200,176,0.45)]";
  const compact = size === "compact";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:top-[46%]",
          compact
            ? "size-[11rem] sm:size-[16rem]"
            : "size-[14rem] sm:size-[22rem]",
          glow,
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 animate-[spin_28s_linear_infinite_reverse] rounded-full border border-dashed sm:top-[46%]",
          compact
            ? "size-[10.5rem] sm:size-[15rem]"
            : "size-[13.5rem] sm:size-[21rem]",
          ring,
        )}
      />
      <Image
        src="/techly-badge.png"
        alt=""
        width={400}
        height={400}
        className={cn(
          "absolute left-1/2 top-[42%] max-w-none -translate-x-1/2 -translate-y-1/2 animate-[spin_18s_linear_infinite] rounded-full object-contain opacity-35 sm:top-[46%] sm:opacity-40",
          compact
            ? "size-[9.5rem] sm:size-[14rem]"
            : "size-[12rem] sm:size-[19rem]",
          shadow,
        )}
      />
    </div>
  );
}
