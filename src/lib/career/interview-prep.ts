import type { CareerMessage } from "@/lib/career/store";

export type InterviewPrepItem = {
  id: number;
  question: string;
  /** Themes the coach should listen for. */
  answerGuide: string;
  /** Strong sample answer the coach can teach from. */
  sampleAnswer: string;
  tip?: string;
};

export type CareerAnswerCorrection = {
  question: string;
  yourAnswer: string;
  score: number;
  feedback: string;
  betterAnswer: string;
};

export type CareerSessionReview = {
  version: 1;
  score: number;
  grade: string;
  overview: string;
  corrections: CareerAnswerCorrection[];
  nextSteps: string[];
};

/** Top 20 general interview questions for Techly interview-prep sessions. */
export const INTERVIEW_PREP_BANK: InterviewPrepItem[] = [
  {
    id: 1,
    question: "Tell me about yourself.",
    answerGuide:
      "Motivated professional; communication, problem-solving, teamwork, pressure; reliable and keen to grow while contributing.",
    sampleAnswer:
      "I am a motivated and results-driven professional with experience in my field. I have developed strong skills in communication, problem-solving, teamwork and working under pressure. I take pride in being reliable, learning quickly and delivering quality work. I am now looking for an opportunity where I can contribute my skills while continuing to grow professionally.",
  },
  {
    id: 2,
    question: "Why do you want to work for our company?",
    answerGuide:
      "Company reputation and work; professional development; skills add value; role offers growth and challenge.",
    sampleAnswer:
      "I am interested in your company because of its reputation, the work you do and the opportunities for professional development. I believe my skills and experience can add value to the organisation, while this role would also allow me to grow and take on new challenges.",
  },
  {
    id: 3,
    question: "Why should we hire you?",
    answerGuide:
      "Skills plus commitment and willingness to learn; dependable; results-focused; positive attitude and work ethic.",
    sampleAnswer:
      "You should hire me because I bring the right combination of skills, commitment and a willingness to learn. I am dependable, take responsibility for my work and focus on achieving results. I would also bring a positive attitude and a strong work ethic to the team.",
  },
  {
    id: 4,
    question: "What are your strengths?",
    answerGuide:
      "Communication, organisation, problem-solving, reliability; prioritise; work with others; stay focused under challenge.",
    sampleAnswer:
      "My key strengths are communication, organisation, problem-solving and reliability. I am able to prioritise my responsibilities, work effectively with others and remain focused when dealing with challenging situations.",
  },
  {
    id: 5,
    question: "What is your biggest weakness?",
    answerGuide:
      "Honest growth area with improvement plan (e.g. balancing detail with deadlines). Never claim no weaknesses.",
    tip: "Never answer that you have no weaknesses.",
    sampleAnswer:
      "One area I have been working on is being overly detail-focused. While attention to detail is important, I have learned to balance it with deadlines and the bigger objectives of the organisation.",
  },
  {
    id: 6,
    question: "Why are you leaving your current job?",
    answerGuide:
      "Grateful for experience; seeking new challenge and skill growth; do not criticise previous employer.",
    sampleAnswer:
      "I am grateful for the experience I have gained in my current role, but I am looking for a new challenge and an opportunity to further develop my skills. I believe this position offers the type of growth and responsibility I am looking for.",
  },
  {
    id: 7,
    question: "Where do you see yourself in five years?",
    answerGuide:
      "Developed skills, greater responsibility, reliable team member; keep learning and progressing with performance.",
    sampleAnswer:
      "In five years, I would like to have developed significantly within my career, taken on greater responsibilities and become someone the organisation can rely on. My goal is to continue learning and progressing based on my performance.",
  },
  {
    id: 8,
    question: "Tell me about a difficult situation you faced at work.",
    answerGuide:
      "STAR: competing priorities or tough deadline; assess, communicate, plan; stay organised and deliver on time.",
    sampleAnswer:
      "In a previous situation, I had to deal with a challenging deadline and several competing priorities. I assessed what needed to be completed first, communicated with the relevant people and created a clear plan. By staying organised and focused, I was able to complete the important tasks on time.",
  },
  {
    id: 9,
    question: "How do you handle pressure?",
    answerGuide:
      "Stay calm and organised; prioritise urgency and importance; break work down; communicate early about risks.",
    sampleAnswer:
      "I handle pressure by remaining calm and organised. I prioritise my tasks according to urgency and importance, break larger tasks into manageable steps and communicate early if I identify a potential problem.",
  },
  {
    id: 10,
    question: "How do you deal with conflict with a colleague?",
    answerGuide:
      "Professional and respectful; listen; clarify; focus on practical solution, not personal conflict.",
    sampleAnswer:
      "I believe conflict should be handled professionally and respectfully. I would first listen to the other person's perspective, clarify the issue and focus on finding a practical solution rather than making the situation personal.",
  },
  {
    id: 11,
    question: "Do you prefer working alone or as part of a team?",
    answerGuide:
      "Comfortable with both; independent ownership and collaborative teamwork for better results.",
    sampleAnswer:
      "I am comfortable with both. I can work independently and take responsibility for my own tasks, but I also enjoy collaborating with colleagues because teamwork often produces better results.",
  },
  {
    id: 12,
    question: "How do you prioritise your work?",
    answerGuide:
      "Deadlines, importance, business impact; urgent first; organise and re-check priorities as work changes.",
    sampleAnswer:
      "I prioritise work based on deadlines, importance and the impact on the business. I normally identify urgent tasks first, organise my workload and regularly review my priorities as new responsibilities arise.",
  },
  {
    id: 13,
    question: "Tell me about a mistake you made at work.",
    answerGuide:
      "Own it; correct it; prevent recurrence (e.g. verification process); show accountability and learning.",
    sampleAnswer:
      "Earlier in my career, I made a mistake because I did not fully verify some information before completing a task. I took responsibility, corrected it and introduced a checking process to prevent it from happening again. It taught me the importance of verification and accountability.",
  },
  {
    id: 14,
    question: "How do you handle criticism?",
    answerGuide:
      "Constructive feedback as improvement; listen; clarify; apply it; do not take professional feedback personally.",
    sampleAnswer:
      "I see constructive criticism as an opportunity to improve. I listen carefully, ask questions if I need clarification and then apply the feedback to my work. I don't take professional feedback personally.",
  },
  {
    id: 15,
    question: "What motivates you?",
    answerGuide:
      "Results, learning, contributing to the organisation; challenges that grow you professionally.",
    sampleAnswer:
      "I am motivated by achieving results, learning new skills and knowing that my work contributes to the success of the organisation. I also enjoy taking on challenges that allow me to improve professionally.",
  },
  {
    id: 16,
    question: "What salary are you expecting?",
    answerGuide:
      "Competitive with market based on experience and role; open to discussing budget and full package.",
    tip: "Research market salary before the real interview.",
    sampleAnswer:
      "Based on my experience, qualifications and the responsibilities of the position, I would expect a salary that is competitive with the market. However, I am open to discussing the company's budget and the overall package.",
  },
  {
    id: 17,
    question: "Why should we choose you over other candidates?",
    answerGuide:
      "Relevant skills, reliability, adaptability, commitment; learn fast, deliver results, become valuable.",
    sampleAnswer:
      "I understand that you have several strong candidates, but I believe I offer a combination of relevant skills, reliability, adaptability and commitment. If given the opportunity, I would focus on learning quickly, delivering results and becoming a valuable member of the team.",
  },
  {
    id: 18,
    question: "What would you do if you disagreed with your manager?",
    answerGuide:
      "Respectful facts-based concerns; accept final decision; stay professional and support the agreed direction.",
    sampleAnswer:
      "I would approach the situation respectfully and explain my concerns using facts and relevant information. Ultimately, I understand that the manager is responsible for the final decision, and I would remain professional and support the agreed direction.",
  },
  {
    id: 19,
    question: "Do you have any questions for us?",
    answerGuide:
      "Ask about success in first 3–6 months and biggest priorities or challenges. Never say you have no questions.",
    tip: "Never simply say you have no questions.",
    sampleAnswer:
      "Yes. I would like to understand what success would look like in this position during the first three to six months. I would also like to know what the biggest priorities or challenges are for the person joining the role.",
  },
  {
    id: 20,
    question: "Why should we believe you will be successful in this role?",
    answerGuide:
      "Willing to learn, take responsibility, adapt; consistency, teamwork, and delivering results.",
    sampleAnswer:
      "I believe I will be successful because I am willing to learn, take responsibility and adapt to the organisation's expectations. I understand that success requires consistency, teamwork and delivering results, and those are qualities I bring to my work.",
  },
];

export const INTERVIEW_PREP_STAR = `Use the STAR method for experience questions: Situation, Task, Action, Result. Prefer concrete examples over vague claims. CV and spoken answers must tell the same story.`;

export const INTERVIEW_PREP_REMINDERS = [
  "Research the company.",
  "Understand the job description.",
  "Prepare 3–5 real examples from your experience.",
  "Know your CV extremely well.",
  "Speak confidently, but don't exaggerate your experience.",
];

export function interviewPrepBankForPrompt() {
  return INTERVIEW_PREP_BANK.map(
    (item) =>
      `${item.id}. Q: ${item.question}\n   Strong-answer themes: ${item.answerGuide}\n   Model answer: ${item.sampleAnswer}${
        item.tip ? `\n   Tip: ${item.tip}` : ""
      }`,
  ).join("\n");
}

/** How many bank questions (in order from the start) already appear in coach turns. */
export function interviewPrepAskedCount(coachTexts: string[]) {
  const haystack = coachTexts.join("\n").toLowerCase();
  let asked = 0;
  for (const item of INTERVIEW_PREP_BANK) {
    const needle = item.question.toLowerCase().replace(/\?$/, "");
    if (haystack.includes(needle)) asked += 1;
    else break;
  }
  return asked;
}

export function interviewPrepItemAt(index: number) {
  return INTERVIEW_PREP_BANK[
    Math.max(0, Math.min(index, INTERVIEW_PREP_BANK.length - 1))
  ];
}

export function scoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 45) return "Developing";
  return "Needs practice";
}

function themeTokens(guide: string) {
  return guide
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((token) => token.length > 3);
}

export function scoreAnswerAgainstItem(
  answer: string,
  item: InterviewPrepItem,
) {
  const text = answer.trim().toLowerCase();
  if (text.length < 8) return 28;

  const tokens = themeTokens(item.answerGuide);
  const hits = tokens.filter((token) => text.includes(token)).length;
  const coverage = tokens.length ? hits / tokens.length : 0;
  const lengthScore = Math.min(30, Math.floor(text.length / 8));
  const themeScore = Math.round(coverage * 55);
  let score = Math.min(96, 15 + lengthScore + themeScore);

  if (
    item.id === 5 &&
    (text.includes("no weakness") || text.includes("don't have a weakness"))
  ) {
    score = Math.min(score, 35);
  }
  if (
    item.id === 19 &&
    (text === "no" || text.includes("no questions") || text.includes("i don't"))
  ) {
    score = Math.min(score, 30);
  }

  return score;
}

function pairQaFromHistory(history: CareerMessage[]) {
  const pairs: Array<{ question: string; answer: string; item?: InterviewPrepItem }> =
    [];
  let pendingQuestion: string | null = null;
  let pendingItem: InterviewPrepItem | undefined;

  for (const message of history) {
    if (message.role === "coach") {
      const matched = INTERVIEW_PREP_BANK.find((item) =>
        message.text.toLowerCase().includes(
          item.question.toLowerCase().replace(/\?$/, ""),
        ),
      );
      pendingQuestion = matched?.question ?? message.text;
      pendingItem = matched;
      continue;
    }
    if (message.role === "candidate" && pendingQuestion) {
      pairs.push({
        question: pendingQuestion,
        answer: message.text,
        item: pendingItem,
      });
      pendingQuestion = null;
      pendingItem = undefined;
    }
  }
  return pairs;
}

export function buildFallbackSessionReview(
  history: CareerMessage[],
  targetRole: string,
): CareerSessionReview {
  const pairs = pairQaFromHistory(history);
  const corrections: CareerAnswerCorrection[] = pairs.map((pair, index) => {
    const item =
      pair.item ??
      interviewPrepItemAt(Math.min(index, INTERVIEW_PREP_BANK.length - 1));
    const score = scoreAnswerAgainstItem(pair.answer, item);
    const feedback =
      score >= 75
        ? "Solid answer. Keep it natural and add one concrete example where you can."
        : score >= 55
          ? "Partly there. Cover more of the strong themes and sound more specific."
          : "This needs work. Use a clearer structure and the model answer below as your guide.";

    return {
      question: item.question,
      yourAnswer: pair.answer,
      score,
      feedback,
      betterAnswer: item.sampleAnswer,
    };
  });

  const score =
    corrections.length === 0
      ? 50
      : Math.round(
          corrections.reduce((sum, row) => sum + row.score, 0) /
            corrections.length,
        );

  return {
    version: 1,
    score,
    grade: scoreLabel(score),
    overview:
      corrections.length === 0
        ? `You finished the session for ${targetRole || "your target role"}, but there were not enough spoken answers to score in detail. Practise the Top 20 questions out loud next time.`
        : `You scored ${score}/100 (${scoreLabel(score)}) for ${targetRole || "your target role"}. Review each correction below and practise saying the stronger answers in your own words.`,
    corrections,
    nextSteps: [
      "Practise each weaker answer out loud until it sounds natural, not memorised.",
      "Prepare 3–5 real STAR examples that match your CV.",
      "Research the company and always have questions ready for the interviewer.",
    ],
  };
}

export function serializeCareerReview(review: CareerSessionReview) {
  return JSON.stringify(review);
}

export function parseCareerReview(summary: string): CareerSessionReview | null {
  const raw = summary.trim();
  if (!raw.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(raw) as CareerSessionReview;
    if (
      parsed?.version === 1 &&
      typeof parsed.score === "number" &&
      Array.isArray(parsed.corrections)
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}
