import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/techly-badge.png"
        alt="Techly — Software Development and IT Support"
        width={compact ? 56 : 72}
        height={compact ? 56 : 72}
        className={cn(
          "shrink-0 rounded-full bg-white object-contain",
          compact ? "size-14" : "size-[72px]",
        )}
        priority
      />
    </span>
  );
}
