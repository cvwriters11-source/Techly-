import { generateText } from "ai";
import type { MarketingProfile, MarketingSocial } from "@/lib/marketing/store";

function modelId() {
  return process.env.AI_GATEWAY_MODEL?.trim() || "openai/gpt-5.4-mini";
}

function templateAd(profile: MarketingProfile) {
  return `${profile.company} — ${profile.services}

Ready to get started? Call or WhatsApp ${profile.phone}
Visit ${profile.website}`;
}

export async function generateMarketingAdCopy(input: {
  profile: MarketingProfile;
  socials: MarketingSocial[];
  recentBodies?: string[];
}) {
  const { profile, socials, recentBodies = [] } = input;

  if (
    !process.env.AI_GATEWAY_API_KEY?.trim() &&
    !process.env.VERCEL_OIDC_TOKEN?.trim()
  ) {
    return templateAd(profile);
  }

  const socialLines = socials
    .filter((social) => social.profileUrl.trim())
    .map((social) => `${social.platform}: ${social.profileUrl}`)
    .join("\n");

  const recent =
    recentBodies.length > 0
      ? `Avoid repeating these recent posts:\n${recentBodies
          .slice(0, 5)
          .map((body, index) => `${index + 1}. ${body}`)
          .join("\n")}`
      : "";

  try {
    const { text } = await generateText({
      model: modelId(),
      prompt: `Write one short social media sales advertisement for a South African business.

Rules:
- Lead with the company name "${profile.company}".
- Focus on the services they offer: ${profile.services}.
- Drive through-sales: push the reader to call, WhatsApp, or visit the website.
- Always include the website (${profile.website}) and phone number (${profile.phone}).
- Do not mention Techly, AI, or that this was generated.
- Keep it under 280 characters if possible, max 450 characters.
- Use a confident, practical tone. No hashtag spam (max 2 hashtags).
- Return only the post text, nothing else.

Company contact name: ${profile.contactName || "Owner"}
Social profiles:
${socialLines || "None provided"}
${recent}`,
    });

    const body = text.trim();
    if (!body) return templateAd(profile);
    if (!body.includes(profile.phone) && !body.includes(profile.website)) {
      return `${body}\n\nCall ${profile.phone} · ${profile.website}`;
    }
    return body;
  } catch {
    return templateAd(profile);
  }
}
