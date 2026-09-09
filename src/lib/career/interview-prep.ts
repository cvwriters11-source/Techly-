export type InterviewPrepItem = {
  id: number;
  question: string;
  /** Themes the coach should listen for — not a script to read aloud. */
  answerGuide: string;
  tip?: string;
};

/** Top 20 general interview questions for Techly interview-prep sessions. */
export const INTERVIEW_PREP_BANK: InterviewPrepItem[] = [
  {
    id: 1,
    question: "Tell me about yourself.",
    answerGuide:
      "Motivated professional; communication, problem-solving, teamwork, pressure; reliable and keen to grow while contributing.",
  },
  {
    id: 2,
    question: "Why do you want to work for our company?",
    answerGuide:
      "Company reputation and work; professional development; skills add value; role offers growth and challenge.",
  },
  {
    id: 3,
    question: "Why should we hire you?",
    answerGuide:
      "Skills plus commitment and willingness to learn; dependable; results-focused; positive attitude and work ethic.",
  },
  {
    id: 4,
    question: "What are your strengths?",
    answerGuide:
      "Communication, organisation, problem-solving, reliability; prioritise; work with others; stay focused under challenge.",
  },
  {
    id: 5,
    question: "What is your biggest weakness?",
    answerGuide:
      "Honest growth area with improvement plan (e.g. balancing detail with deadlines). Never claim no weaknesses.",
    tip: "Never answer that you have no weaknesses.",
  },
  {
    id: 6,
    question: "Why are you leaving your current job?",
    answerGuide:
      "Grateful for experience; seeking new challenge and skill growth; do not criticise previous employer.",
  },
  {
    id: 7,
    question: "Where do you see yourself in five years?",
    answerGuide:
      "Developed skills, greater responsibility, reliable team member; keep learning and progressing with performance.",
  },
  {
    id: 8,
    question: "Tell me about a difficult situation you faced at work.",
    answerGuide:
      "STAR: competing priorities or tough deadline; assess, communicate, plan; stay organised and deliver on time.",
  },
  {
    id: 9,
    question: "How do you handle pressure?",
    answerGuide:
      "Stay calm and organised; prioritise urgency and importance; break work down; communicate early about risks.",
  },
  {
    id: 10,
    question: "How do you deal with conflict with a colleague?",
    answerGuide:
      "Professional and respectful; listen; clarify; focus on practical solution, not personal conflict.",
  },
  {
    id: 11,
    question: "Do you prefer working alone or as part of a team?",
    answerGuide:
      "Comfortable with both; independent ownership and collaborative teamwork for better results.",
  },
  {
    id: 12,
    question: "How do you prioritise your work?",
    answerGuide:
      "Deadlines, importance, business impact; urgent first; organise and re-check priorities as work changes.",
  },
  {
    id: 13,
    question: "Tell me about a mistake you made at work.",
    answerGuide:
      "Own it; correct it; prevent recurrence (e.g. verification process); show accountability and learning.",
  },
  {
    id: 14,
    question: "How do you handle criticism?",
    answerGuide:
      "Constructive feedback as improvement; listen; clarify; apply it; do not take professional feedback personally.",
  },
  {
    id: 15,
    question: "What motivates you?",
    answerGuide:
      "Results, learning, contributing to the organisation; challenges that grow you professionally.",
  },
  {
    id: 16,
    question: "What salary are you expecting?",
    answerGuide:
      "Competitive with market based on experience and role; open to discussing budget and full package.",
    tip: "Research market salary before the real interview.",
  },
  {
    id: 17,
    question: "Why should we choose you over other candidates?",
    answerGuide:
      "Relevant skills, reliability, adaptability, commitment; learn fast, deliver results, become valuable.",
  },
  {
    id: 18,
    question: "What would you do if you disagreed with your manager?",
    answerGuide:
      "Respectful facts-based concerns; accept final decision; stay professional and support the agreed direction.",
  },
  {
    id: 19,
    question: "Do you have any questions for us?",
    answerGuide:
      "Ask about success in first 3–6 months and biggest priorities or challenges. Never say you have no questions.",
    tip: "Never simply say you have no questions.",
  },
  {
    id: 20,
    question: "Why should we believe you will be successful in this role?",
    answerGuide:
      "Willing to learn, take responsibility, adapt; consistency, teamwork, and delivering results.",
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
      `${item.id}. Q: ${item.question}\n   Strong-answer themes: ${item.answerGuide}${
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
