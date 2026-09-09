import { generateText } from "ai";
import {
  INTERVIEW_PREP_BANK,
  INTERVIEW_PREP_REMINDERS,
  INTERVIEW_PREP_STAR,
  buildFallbackSessionReview,
  interviewPrepAskedCount,
  interviewPrepBankForPrompt,
  interviewPrepItemAt,
  serializeCareerReview,
  type CareerSessionReview,
} from "@/lib/career/interview-prep";
import {
  addCareerMessage,
  focusLabel,
  getCareerProfile,
  getCareerSession,
  listCareerMessages,
  updateCareerSession,
  type CareerFocus,
  type CareerMessage,
  type CareerSession,
} from "@/lib/career/store";

function modelId() {
  return process.env.AI_GATEWAY_MODEL?.trim() || "openai/gpt-5.4-mini";
}

function aiConfigured() {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

function remainingMinutes(session: CareerSession) {
  if (!session.endsAt) return session.durationMinutes;
  const ms = new Date(session.endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 60_000));
}

function isInterviewPrep(session: CareerSession) {
  return session.focus === "interview";
}

function systemPrompt(session: CareerSession, candidateName: string) {
  const mins = remainingMinutes(session);
  const base = `You are Techly's Career Coach — a warm, professional South African interview coach speaking aloud to a job seeker.

Candidate name: ${candidateName || "the candidate"}
Target role: ${session.targetRole || "a professional role"}
Session focus: ${focusLabel(session.focus as CareerFocus)}
Session length: ${session.durationMinutes} minutes (${mins} minutes left)

Rules:
- Speak in clear, supportive South African English. Keep each reply short enough to say aloud (about 4–7 sentences).
- Run an interactive mock interview. Ask one clear question at a time.
- After every candidate answer you MUST correct them: say what worked, what was missing, then give a short stronger way to answer (adapted from the model answer, in their voice / role — not a robotic copy).
- Stay on the chosen focus (${focusLabel(session.focus as CareerFocus)}).
- Do not use markdown, bullet lists, or stage directions. Plain spoken sentences only.
- Never invent that you can see their CV unless they describe it.
- If time is almost up (under 3 minutes), wrap up with encouragement and one final tip.`;

  if (!isInterviewPrep(session)) {
    return `${base}

For non-interview focuses, still correct weak answers with a clearer sample response before asking the next coaching question.`;
  }

  return `${base}

INTERVIEW PREPARATION MODE — use Techly's Top 20 general interview bank:
${interviewPrepBankForPrompt()}

${INTERVIEW_PREP_STAR}

Coaching style for interview prep:
- Work through the Top 20 in order unless time is short; then pick the highest-value remaining questions.
- Ask the question in natural spoken wording (you may lightly tailor it to ${session.targetRole || "their target role"}).
- After EACH answer: 1) brief praise, 2) clear correction, 3) a stronger sample answer they can practise, 4) the next question.
- Teach them to sound professional, confident, and natural — not memorised.
- Remind them when useful: ${INTERVIEW_PREP_REMINDERS.join(" ")}
- For salary questions, keep coaching high-level and encourage market research.
- Near the end, practise "Do you have any questions for us?" and stress they must never say they have no questions.`;
}

function fallbackOpening(session: CareerSession, name: string) {
  const who = name || "there";
  const role = session.targetRole || "your target role";
  if (isInterviewPrep(session)) {
    const first = INTERVIEW_PREP_BANK[0];
    return `Hi ${who}, welcome to your Techly interview preparation session for ${role}. Over the next ${session.durationMinutes} minutes we will practise the most important general interview questions. After each answer I will correct you and show you a stronger way to say it. First question: ${first.question}`;
  }
  return `Hi ${who}, welcome to your Techly career coaching session. I'm your interview coach for the next ${session.durationMinutes} minutes, focused on ${focusLabel(session.focus)}. I'll correct your answers as we go so you know how to improve. Let's start with ${role}: tell me briefly about yourself and why you want this kind of work.`;
}

function fallbackReply(
  session: CareerSession,
  answer: string,
  history: CareerMessage[],
) {
  if (!isInterviewPrep(session)) {
    const snippet = answer.trim().slice(0, 80);
    return `Thanks for sharing that${snippet ? ` about "${snippet}${answer.trim().length > 80 ? "…" : ""}"` : ""}. A stronger answer would be more specific: describe the situation, what you did, and the result. Can you try again with a concrete example of a challenge you faced and how you handled it?`;
  }

  const coachTexts = history
    .filter((message) => message.role === "coach")
    .map((message) => message.text);
  const asked = interviewPrepAskedCount(coachTexts);

  if (asked >= INTERVIEW_PREP_BANK.length) {
    return `Strong finish. Remember STAR — Situation, Task, Action, Result — and prepare real examples that match your CV. Also research the company and the job description before the real interview. Would you like one more practice on any of those Top 20 questions?`;
  }

  const current = interviewPrepItemAt(Math.max(0, asked - 1));
  const next = interviewPrepItemAt(asked);
  const tip = current.tip ? ` ${current.tip}` : "";

  return `Good try. Here is a stronger way to answer: ${current.sampleAnswer}${tip} Now practise that idea in your own words for the next question: ${next.question}`;
}

function fallbackSummaryText(session: CareerSession, history: CareerMessage[]) {
  const review = buildFallbackSessionReview(
    history,
    session.targetRole || "your target role",
  );
  return serializeCareerReview(review);
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as CareerSessionReview;
  } catch {
    return null;
  }
}

async function generateCoachText(input: {
  session: CareerSession;
  candidateName: string;
  history: CareerMessage[];
  mode: "opening" | "reply" | "summary";
  candidateAnswer?: string;
}) {
  const fallback =
    input.mode === "opening"
      ? fallbackOpening(input.session, input.candidateName)
      : input.mode === "summary"
        ? fallbackSummaryText(input.session, input.history)
        : fallbackReply(
            input.session,
            input.candidateAnswer ?? "",
            input.history,
          );

  if (!aiConfigured()) {
    return fallback;
  }

  const transcript = input.history
    .map((message) =>
      message.role === "coach"
        ? `Coach: ${message.text}`
        : `Candidate: ${message.text}`,
    )
    .join("\n");

  const interviewExtra = isInterviewPrep(input.session)
    ? " Stay inside the Top 20 interview bank and coaching style above."
    : "";

  const userPrompt =
    input.mode === "opening"
      ? `Start the session. Greet the candidate and ask your first interview question.${interviewExtra}`
      : input.mode === "summary"
        ? `The session is finished. Return ONLY valid JSON (no markdown) matching this shape:
{"version":1,"score":0,"grade":"","overview":"","corrections":[{"question":"","yourAnswer":"","score":0,"feedback":"","betterAnswer":""}],"nextSteps":[""]}
Rules for the JSON:
- score is 0-100 overall interview performance.
- grade is a short label like Excellent, Strong, Good, Developing, or Needs practice.
- overview is 2-4 sentences for the candidate to read.
- corrections: one object per candidate answer you can identify from the transcript; include the question, their answer, a 0-100 score, specific feedback, and a betterAnswer they should practise (professional, natural, not overly long).
- nextSteps: 3 concrete actions.
Transcript:
${transcript || "(no messages)"}`
        : `The candidate just answered:
"""${input.candidateAnswer}"""

Correct them clearly, give a stronger sample answer to practise, then ask the next question.${interviewExtra}

Transcript so far:
${transcript}`;

  try {
    const { text } = await generateText({
      model: modelId(),
      system: systemPrompt(input.session, input.candidateName),
      prompt: userPrompt,
    });
    const trimmed = text.trim();
    if (!trimmed) return fallback;

    if (input.mode === "summary") {
      const parsed = extractJsonObject(trimmed);
      if (parsed?.version === 1 && typeof parsed.score === "number") {
        return serializeCareerReview({
          version: 1,
          score: Math.max(0, Math.min(100, Math.round(parsed.score))),
          grade: parsed.grade || "Good",
          overview: parsed.overview || "",
          corrections: Array.isArray(parsed.corrections)
            ? parsed.corrections
            : [],
          nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
        });
      }
      return fallback;
    }

    return trimmed;
  } catch {
    return fallback;
  }
}

export async function startCareerCoachTurn(sessionId: string) {
  const session = await getCareerSession(sessionId);
  if (!session) throw new Error("Session not found.");

  const profile = await getCareerProfile(session.profileId);
  const history = await listCareerMessages(sessionId);
  const existingCoach = history.find((message) => message.role === "coach");
  if (existingCoach) return existingCoach;

  const text = await generateCoachText({
    session,
    candidateName: profile?.name ?? "",
    history,
    mode: "opening",
  });

  // Re-check after slow AI/fallback work to avoid duplicate openings.
  const again = await listCareerMessages(sessionId);
  const raced = again.find((message) => message.role === "coach");
  if (raced) return raced;

  return addCareerMessage({
    sessionId,
    role: "coach",
    text,
  });
}

export async function continueCareerCoachTurn(
  sessionId: string,
  candidateAnswer: string,
) {
  const answer = candidateAnswer.trim();
  if (answer.length < 2) throw new Error("Please share a short answer first.");

  const session = await getCareerSession(sessionId);
  if (!session) throw new Error("Session not found.");
  if (session.status !== "active") {
    throw new Error("This session is no longer active.");
  }

  const profile = await getCareerProfile(session.profileId);
  const candidateMessage = await addCareerMessage({
    sessionId,
    role: "candidate",
    text: answer,
  });

  const history = await listCareerMessages(sessionId);
  const text = await generateCoachText({
    session,
    candidateName: profile?.name ?? "",
    history,
    mode: "reply",
    candidateAnswer: answer,
  });

  const coachMessage = await addCareerMessage({
    sessionId,
    role: "coach",
    text,
  });

  return { candidateMessage, coachMessage };
}

export async function completeCareerSession(sessionId: string) {
  const session = await getCareerSession(sessionId);
  if (!session) throw new Error("Session not found.");

  if (session.status === "completed" && session.summary) {
    return session;
  }

  const profile = await getCareerProfile(session.profileId);
  const history = await listCareerMessages(sessionId);
  const summary = await generateCoachText({
    session,
    candidateName: profile?.name ?? "",
    history,
    mode: "summary",
  });

  const updated = await updateCareerSession(sessionId, {
    status: "completed",
    summary,
  });

  if (!updated) throw new Error("Could not complete session.");
  return updated;
}
