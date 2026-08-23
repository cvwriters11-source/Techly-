export function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle_at_50%_0%,rgba(46,233,200,0.16),transparent_55%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080d18] shadow-[0_40px_80px_-32px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex-1 rounded-md border border-white/8 bg-white/[0.03] px-3 py-1 font-mono text-[10px] text-muted">
            app.techly.systems / operations
          </div>
        </div>

        <div className="grid grid-cols-[76px_1fr] sm:grid-cols-[168px_1fr]">
          <aside className="hidden border-r border-white/8 p-4 sm:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Workspace
            </p>
            <ul className="mt-4 space-y-2 text-xs text-muted">
              {["Overview", "Projects", "Automation", "Support", "Reports"].map(
                (item, index) => (
                  <li
                    key={item}
                    className={`rounded-lg px-2.5 py-1.5 ${
                      index === 0
                        ? "bg-accent/10 text-accent"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </aside>

          <div className="space-y-4 p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Active systems", value: "24", delta: "+3" },
                { label: "Automations", value: "86%", delta: "uptime" },
                { label: "Tickets closed", value: "142", delta: "this month" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <p className="font-mono text-[9px] uppercase tracking-wider text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-display text-lg text-foreground sm:text-xl">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-accent">{stat.delta}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">
                  Operational load
                </p>
                <p className="font-mono text-[10px] text-muted">Live</p>
              </div>
              <div className="flex h-28 items-end gap-1.5 sm:gap-2">
                {[40, 55, 38, 72, 64, 88, 52, 79, 93, 70, 84, 61].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-sm bg-linear-to-t from-accent-2/40 to-accent"
                      style={{ height: `${height}%`, opacity: 0.55 + (index % 4) * 0.1 }}
                    />
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-2">
              {[
                "CRM sync completed for 312 records",
                "Backup verified · production database",
                "WhatsApp workflow deployed to sales",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-white/6 bg-[#0b1220] px-3 py-2 text-[11px] text-muted"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
