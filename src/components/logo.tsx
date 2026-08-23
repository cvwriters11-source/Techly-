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
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Techly — Software Development and IT Support"
        width={compact ? 140 : 168}
        height={compact ? 56 : 68}
        className={cn("w-auto", compact ? "h-12" : "h-[68px]")}
        priority
      />
    </span>
  );
}
