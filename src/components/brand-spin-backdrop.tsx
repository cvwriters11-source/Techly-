import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandSpinBackdrop({
  tone = "accent",
}: {
  tone?: "accent" | "warning";
}) {
  const glow =
    tone === "warning" ? "bg-amber-400/25" : "bg-accent/25";
  const ring =
    tone === "warning" ? "border-amber-300/35" : "border-accent/30";
  const shadow =
    tone === "warning"
      ? "drop-shadow-[0_0_36px_rgba(251,191,36,0.4)]"
      : "drop-shadow-[0_0_36px_rgba(18,200,176,0.45)]";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute left-1/2 top-[46%] size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
          glow,
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 top-[46%] size-[21rem] -translate-x-1/2 -translate-y-1/2 animate-[spin_28s_linear_infinite_reverse] rounded-full border border-dashed",
          ring,
        )}
      />
      <Image
        src="/techly-badge.png"
        alt=""
        width={400}
        height={400}
        className={cn(
          "absolute left-1/2 top-[46%] size-[19rem] max-w-none -translate-x-1/2 -translate-y-1/2 animate-[spin_18s_linear_infinite] rounded-full object-contain opacity-40",
          shadow,
        )}
      />
    </div>
  );
}
