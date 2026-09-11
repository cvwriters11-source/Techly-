export const marketingAudienceOptions = [
  "all",
  "paid",
  "followup",
  "open",
] as const;

export type MarketingAudience = (typeof marketingAudienceOptions)[number];

export const marketingTemplates = [
  {
    id: "security_checkup",
    label: "CCTV security checkup",
    subject: "Is your site covered the way it should be?",
    heading: "A quick CCTV checkup from Techly",
    body: [
      "Whether you already have cameras or you are still planning coverage, we help homes and businesses get clear viewing, reliable recording, and practical install options — including solar and IP kits.",
      "Reply to this email if you would like a short site review or a fresh quotation.",
    ].join("\n\n"),
  },
  {
    id: "software_and_web",
    label: "Software & websites",
    subject: "Custom software and websites that match how you work",
    heading: "Build the next improvement with Techly",
    body: [
      "From booking and stock tools to client-facing websites, we design and build software around your real process — not a generic template.",
      "Tell us what is slowing your team down and we will outline a practical next step.",
    ].join("\n\n"),
  },
  {
    id: "it_support",
    label: "IT support & uptime",
    subject: "Keep your systems steady with Techly support",
    heading: "IT support when you need it",
    body: [
      "Downtime costs time. Our support covers troubleshooting, hosting help, and ongoing care so your business can stay online and productive.",
      "Reply when you want a support plan or a one-off fix.",
    ].join("\n\n"),
  },
  {
    id: "automation",
    label: "Automation & integrations",
    subject: "Automate the work that keeps repeating",
    heading: "Less manual work, clearer results",
    body: [
      "We connect the tools you already use and automate the steps that eat into your week — forms, follow-ups, reporting, and more.",
      "Share one process you want simplified and we will suggest a clear approach.",
    ].join("\n\n"),
  },
  {
    id: "seasonal_offer",
    label: "Seasonal Techly update",
    subject: "A short update from Techly",
    heading: "How Techly can help this season",
    body: [
      "Software, IT support, automation, and CCTV — we stay ready to quote clearly, install carefully, and support you after the work is done.",
      "If something on your list needs attention, reply to this email and we will get back to you.",
    ].join("\n\n"),
  },
  {
    id: "consultation",
    label: "Book a consultation",
    subject: "Ready for a free Techly consultation?",
    heading: "Let’s talk through your next project",
    body: [
      "No pressure — just a clear conversation about what you need, what it could cost, and how we would deliver it.",
      "Reply to this email or request a consultation on our website and we will set a time.",
    ].join("\n\n"),
  },
] as const;

export type MarketingTemplateId = (typeof marketingTemplates)[number]["id"];

export function getMarketingTemplate(id: string) {
  return marketingTemplates.find((template) => template.id === id) ?? null;
}

export function isMarketingAudience(value: string): value is MarketingAudience {
  return (marketingAudienceOptions as readonly string[]).includes(value);
}

export function isMarketingTemplateId(
  value: string,
): value is MarketingTemplateId {
  return marketingTemplates.some((template) => template.id === value);
}
