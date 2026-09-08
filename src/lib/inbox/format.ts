export function formatOrderNumber(id: string) {
  const match = id.trim().match(/^TECHLYPC[-\s]+(\d+)$/i);
  if (!match) return id;
  return `TECHLYPC ${match[1].padStart(3, "0")}`;
}

function localeSafe(value: string) {
  return value.replace(/\u00a0|\u202f/g, " ");
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return localeSafe(
    new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date),
  );
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return localeSafe(
    new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(date),
  );
}

export function formatZar(amount: number) {
  const negative = amount < 0;
  const [whole, cents] = Math.abs(amount).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${negative ? "-" : ""}R ${grouped},${cents}`;
}

export function ticketStatusLabel(status: string) {
  if (status === "in_progress") return "In progress";
  if (status === "resolved") return "Resolved";
  return "New";
}

export function contactStatusLabel(status: string) {
  if (status === "contacted") return "Contacted";
  if (status === "closed") return "Closed";
  return "New";
}

export function urgencyTone(urgency: string) {
  if (urgency.toLowerCase().includes("urgent")) {
    return "border-red-400/30 bg-red-400/10 text-red-200";
  }
  if (urgency.toLowerCase().includes("soon")) {
    return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  }
  return "border-white/12 bg-white/5 text-white/80";
}

export function statusTone(status: string) {
  if (status === "new") return "border-accent/30 bg-accent/10 text-accent";
  if (status === "in_progress" || status === "contacted") {
    return "border-sky-400/30 bg-sky-400/10 text-sky-100";
  }
  return "border-white/12 bg-white/5 text-white/70";
}
