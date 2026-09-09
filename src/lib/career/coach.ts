import { generateText } from "ai";
import {
  INTERVIEW_PREP_BANK,
  INTERVIEW_PREP_REMINDERS,
  INTERVIEW_PREP_STAR,
  interviewPrepAskedCount,
  interviewPrepBankForPrompt,
  interviewPrepItemAt,
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
- Speak in clear, supportive South African English. Keep each reply short enough to say aloud (2–5 sentences).
- Run an interactive mock interview / coaching dialogue. Ask one clear question at a time, then react to their answer with brief feedback and a follow-up.
- Stay on the chosen focus (${focusLabel(session.focus as CareerFocus)}) while still practising interview-style Q&A.
- Do not use markdown, bullet lists, or stage directions. Plain spoken sentences only.
- Never invent that you can see their CV unless they describe it.
- If time is almost up (under 3 minutes), wrap up with encouragement and one final tip.`;

  if (!isInterviewPrep(session)) return base;

  return `${base}

INTERVIEW PREPARATION MODE — use Techly's Top 20 general interview bank:
${interviewPrepBankForPrompt()}

${INTERVIEW_PREP_STAR}

Coaching style for interview prep:
- Work through the Top 20 in order unless time is short; then pick the highest-value remaining questions.
- Ask the question in natural spoken wording (you may lightly tailor it to ${session.targetRole || "their target role"}).
- After each answer: give brief, specific feedback against the strong-answer themes — praise what worked, then one clear improvement (often STAR for experience questions).
- Do not read sample answers word-for-word as a script. Coach them to sound professional, confident, and natural — not memorised.
- Remind them when useful: ${INTERVIEW_PREP_REMINDERS.join(" ")}
- For salary questions, keep coaching high-level and encourage market research.
- Near the end, practise "Do you have any questions for us?" and stress they must never say they have no questions.`;
}

function fallbackOpening(session: CareerSession, name: string) {
  const who = name || "there";
  const role = session.targetRole || "your target role";
  if (isInterviewPrep(session)) {
    const first = INTERVIEW_PREP_BANK[0];
    return `Hi ${who}, welcome to your Techly interview preparation session for ${role}. Over the next ${session.durationMinutes} minutes we will practise the most important general interview questions. Answer naturally — I will give short feedback and tips like the STAR method. First question: ${first.question}`;
  }
  return `Hi ${who}, welcome to your Techly career coaching session. I'm your interview coach for the next ${session.durationMinutes} minutes, focused on ${focusLabel(session.focus)}. Let's start with ${role}: tell me briefly about yourself and why you want this kind of work.`;
}

function fallbackReply(session: CareerSession, answer: string, history: CareerMessage[]) {
  if (!isInterviewPrep(session)) {
    const snippet = answer.trim().slice(0, 80);
    return `Thanks for sharing that${snippet ? ` about "${snippet}${answer.trim().length > 80 ? "…" : ""}"` : ""}. That shows useful experience. Can you give a concrete example of a challenge you faced and how you handled it?`;
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
  const tip =
    current.id === 8 || current.id === 13
      ? " For stories like that, use STAR: situation, task, action, and result."
      : current.tip
        ? ` ${current.tip}`
        : " Aim to sound confident and natural, not memorised.";

  return `Good effort on that one.${tip} Next: ${next.question}`;
}

function fallbackSummary(session: CareerSession) {
  if (isInterviewPrep(session)) {
    return `You completed a ${session.durationMinutes}-minute interview preparation session for ${session.targetRole || "your target role"}. Keep practising the Top 20 general interview questions with natural, professional answers — not memorised scripts. Use STAR for experience stories, prepare 3–5 real examples that match your CV, research the company, and always have thoughtful questions ready for the interviewer.`;
  }
  return `You completed a ${session.durationMinutes}-minute ${focusLabel(session.focus)} session for ${session.targetRole || "your career goal"}. Keep practising clear stories with Situation, Task, Action, and Result, and prepare two thoughtful questions for the interviewer.`;
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
        ? fallbackSummary(input.session)
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
        ? `The session time is up. Write a short written summary (3–5 sentences) of how they did and 2–3 concrete next steps. This summary is for reading, not speaking.${
            isInterviewPrep(input.session)
              ? " Mention the Top 20 practice, STAR, and preparing questions for the interviewer."
              : ""
          }\n\nTranscript:\n${transcript || "(no messages)"}`
        : `The candidate just answered:\n"""${input.candidateAnswer}"""\n\nContinue the mock interview with brief feedback and the next question.${interviewExtra}\n\nTranscript so far:\n${transcript}`;

  try {
    const { text } = await generateText({
      model: modelId(),
      system: systemPrompt(input.session, input.candidateName),
      prompt: userPrompt,
    });
    return text.trim() || fallback;
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
  await addCareerMessage({
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

  return addCareerMessage({
    sessionId,
    role: "coach",
    text,
  });
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
