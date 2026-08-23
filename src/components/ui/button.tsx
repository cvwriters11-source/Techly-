import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  variant?: "arrow" | "solid" | "ghost";
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function Button({
  href,
  variant = "arrow",
  className,
  children,
  type = "button",
  disabled,
}: ButtonProps) {
  if (variant === "arrow") {
    const classes = cn(
      "group inline-flex items-center gap-4 rounded-full border border-white/70 py-1.5 pl-5 pr-1.5 text-sm font-medium text-white transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-60",
      className,
    );
    const inner = (
      <>
        <span>{children}</span>
        <span className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-[#5ff5de] to-[#12c8b0] text-black transition group-hover:brightness-110">
          <ArrowRight className="size-4" />
        </span>
      </>
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {inner}
        </Link>
      );
    }

    return (
      <button type={type} disabled={disabled} className={classes}>
        {inner}
      </button>
    );
  }

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60",
    variant === "solid" &&
      "bg-accent text-black hover:bg-accent/90",
    variant === "ghost" && "text-white/70 hover:text-white",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
