import {
  getMarketingProfile,
  listDueMarketingPosts,
  listActiveMarketingProfiles,
  listMarketingSocials,
  updateMarketingPost,
} from "@/lib/marketing/store";
import { publishMarketingPost } from "@/lib/marketing/publish";
import { refillMarketingQueue } from "@/lib/marketing/queue";
import { sendEmail, isEmailConfigured } from "@/lib/email";

async function notifyCompanyPosted(input: {
  to: string;
  company: string;
  body: string;
}) {
  if (!isEmailConfigured()) return;
  await sendEmail({
    to: input.to,
    subject: `${input.company} — your sales ad went live`,
    text: `Your Techly Business marketing ad was posted:\n\n${input.body}\n`,
    html: `<p>Your Techly Business marketing ad was posted:</p><p style="white-space:pre-wrap">${input.body
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")}</p>`,
  });
}

export async function runMarketingScheduler() {
  const due = await listDueMarketingPosts();
  let posted = 0;
  let failed = 0;
  let generated = 0;

  for (const post of due) {
    const profile = await getMarketingProfile(post.profileId);
    if (!profile?.active) continue;

    const socials = await listMarketingSocials(profile.id);
    const platforms = socials
      .filter((social) => social.connected)
      .map((social) => social.platform);

    if (platforms.length === 0) {
      await updateMarketingPost(post.id, {
        status: "failed",
        error: "No connected social platforms.",
      });
      failed += 1;
      continue;
    }

    const result = await publishMarketingPost({
      profile,
      body: post.body,
      platforms,
    });

    if (!result.ok) {
      await updateMarketingPost(post.id, {
        status: "failed",
        error: result.error,
        platformResults: result.results,
      });
      failed += 1;
      continue;
    }

    await updateMarketingPost(post.id, {
      status: "posted",
      error: "",
      platformResults: result.results,
    });
    posted += 1;

    try {
      await notifyCompanyPosted({
        to: profile.email,
        company: profile.company,
        body: post.body,
      });
    } catch {
      // Posting succeeded even if the notification email fails.
    }
  }

  const active = await listActiveMarketingProfiles();
  for (const profile of active) {
    try {
      const refill = await refillMarketingQueue(profile.id);
      generated += refill.created;
    } catch {
      // Keep publishing other profiles if one generation fails.
    }
  }

  return { posted, failed, generated, due: due.length };
}
