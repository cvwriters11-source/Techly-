import { cn } from "@/lib/utils";

export function StatusBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full rounded-full border px-2.5 py-0.5 text-left text-xs font-medium leading-snug whitespace-normal break-words",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function DetailList({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="divide-y divide-white/8 overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6"
        >
          <dt className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            {item.label}
          </dt>
          <dd className="text-sm leading-relaxed text-white">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
