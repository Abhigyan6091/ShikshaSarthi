const RATING_BANDS = {
  6: { min: 600, max: 850 },
  7: { min: 800, max: 1050 },
  8: { min: 1000, max: 1250 },
  9: { min: 1200, max: 1450 },
  10: { min: 1400, max: 1650 },
};

const MARS_CONFIG = {
  kMax: 45,
  kMin: 12,
  provisionalAttempts: 30,
  decay: 0.06,
  sigma0: 100,
  betaMin: 0.0687,
  betaMax: 0.1237,
  velocityMax: 17.2544,
  targetAccuracy: 0.7,
  weakTopicThreshold: 0.4,
  maxTargetShift: 195.6223,
  rapidThreshold: 0.25,
  rapidCapMultiplier: 0.65,
  failureFloor: 0.05,
};

function getClassNumber(className) {
  const parsed = Number.parseInt(String(className || "").replace(/\D/g, ""), 10);
  if (!Number.isFinite(parsed)) return 6;
  if (parsed < 6) return 6;
  if (parsed > 10) return 10;
  return parsed;
}

function getRatingBand(className) {
  return RATING_BANDS[getClassNumber(className)] || RATING_BANDS[6];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getInitialRating(className) {
  const band = getRatingBand(className);
  return Math.round((band.min + band.max) / 2);
}

function expectedSuccess(learnerRating, itemRating) {
  return 1 / (1 + Math.pow(10, (itemRating - learnerRating) / 400));
}

function estimateReferenceTime(question) {
  const stemLength = String(question.question || question.questionHindi || "").length;
  const optionLength = (question.options || []).join(" ").length;
  const complexity = question.difficulty === "hard" ? 16 : question.difficulty === "medium" ? 8 : 0;
  return clamp(18 + stemLength * 0.12 + optionLength * 0.05 + complexity, 25, 120);
}

function calculateDynamicK(attempts, variance = MARS_CONFIG.sigma0) {
  if (attempts < MARS_CONFIG.provisionalAttempts) return MARS_CONFIG.kMax;

  const decayed =
    MARS_CONFIG.kMin +
    (MARS_CONFIG.kMax - MARS_CONFIG.kMin) *
      Math.exp(-MARS_CONFIG.decay * (attempts - MARS_CONFIG.provisionalAttempts));
  const volatilityScale = variance / (variance + MARS_CONFIG.sigma0);

  return clamp(decayed * volatilityScale, MARS_CONFIG.kMin, MARS_CONFIG.kMax);
}

function calculateResponseQuality({ isCorrect, timeSpentMs, hintUsed, streak, question }) {
  if (!isCorrect) return MARS_CONFIG.failureFloor;

  const referenceMs = estimateReferenceTime(question) * 1000;
  const timeQuality = clamp((referenceMs - timeSpentMs + referenceMs * 0.2) / referenceMs, 0, 1);
  const hintQuality = hintUsed ? 0.65 : 1;
  const streakQuality = 0.5 * (1 + clamp(streak, -5, 5) / 5);

  return clamp(0.45 * timeQuality + 0.35 * hintQuality + 0.2 * streakQuality, 0, 1);
}

function getMomentumLabel(streak, recentAccuracy) {
  if (streak >= 5 && recentAccuracy >= 0.8) return "hot";
  if (streak <= -3 && recentAccuracy < 0.4) return "cold";
  return "steady";
}

function updateAdaptiveState(previousState, response) {
  const band = getRatingBand(response.className);
  const priorRating = clamp(previousState.rating ?? getInitialRating(response.className), band.min, band.max);
  const velocity = previousState.velocity || 0;
  const attempts = previousState.attempts || 0;
  const recentOutcomes = previousState.recentOutcomes || [];
  const previousStreak = previousState.streak || 0;
  const isCorrect = Boolean(response.isCorrect);
  const streak = isCorrect ? Math.max(1, previousStreak + 1) : Math.min(-1, previousStreak - 1);
  const itemRating = clamp(response.question.eloRating || priorRating, band.min, band.max);
  const expected = expectedSuccess(priorRating, itemRating);
  const quality = calculateResponseQuality({
    isCorrect,
    timeSpentMs: response.timeSpentMs || estimateReferenceTime(response.question) * 1000,
    hintUsed: response.hintUsed,
    streak,
    question: response.question,
  });
  const variance = previousState.variance || MARS_CONFIG.sigma0;
  const dynamicK = calculateDynamicK(attempts, variance);
  let rawUpdate = dynamicK * (quality - expected);
  const referenceMs = estimateReferenceTime(response.question) * 1000;

  if (isCorrect && response.timeSpentMs > 0 && response.timeSpentMs < MARS_CONFIG.rapidThreshold * referenceMs) {
    rawUpdate = Math.min(rawUpdate, MARS_CONFIG.rapidCapMultiplier * MARS_CONFIG.kMin);
  }

  const varianceRatio = variance / (variance + MARS_CONFIG.sigma0);
  const beta = MARS_CONFIG.betaMin + (MARS_CONFIG.betaMax - MARS_CONFIG.betaMin) * (1 - varianceRatio);
  const nextVelocity = beta * velocity + (1 - beta) * rawUpdate;
  const ratingChange = clamp(nextVelocity, -MARS_CONFIG.velocityMax, MARS_CONFIG.velocityMax);
  const nextRating = clamp(Math.round(priorRating + ratingChange), band.min, band.max);
  const nextOutcomes = [...recentOutcomes.slice(-9), isCorrect ? 1 : 0];
  const recentAccuracy = nextOutcomes.reduce((sum, value) => sum + value, 0) / nextOutcomes.length;
  const nextVariance = clamp(0.8 * variance + 0.2 * Math.abs(rawUpdate) * 10, 20, 400);

  return {
    rating: nextRating,
    ratingBefore: priorRating,
    ratingChange: nextRating - priorRating,
    velocity: nextVelocity,
    attempts: attempts + 1,
    streak,
    recentOutcomes: nextOutcomes,
    recentAccuracy,
    variance: nextVariance,
    momentum: getMomentumLabel(streak, recentAccuracy),
    expectedProbability: expected,
    responseQuality: quality,
  };
}

function calculateTargetRating(state, className) {
  const band = getRatingBand(className);
  const variance = state.variance || MARS_CONFIG.sigma0;
  const volatilityTerm = variance / (variance + MARS_CONFIG.sigma0);
  const shift = clamp(
    2.783 * (state.velocity || 0) +
      54.3184 * ((state.recentAccuracy ?? MARS_CONFIG.targetAccuracy) - MARS_CONFIG.targetAccuracy) -
      26.3128 * volatilityTerm,
    -MARS_CONFIG.maxTargetShift,
    MARS_CONFIG.maxTargetShift
  );

  return clamp((state.rating || getInitialRating(className)) + shift, band.min, band.max);
}

function normalizeQuestion(raw, subject) {
  const correctIndex = Number.isInteger(raw.correctAnswer)
    ? raw.correctAnswer
    : (raw.options || []).findIndex((option) => option === raw.correctAnswer);
  const options = raw.options || [];

  return {
    id: raw.id,
    class: raw.class,
    subjectId: raw.subjectId || subject,
    subject,
    topicId: raw.topicId || "general",
    chapterTitle: raw.chapterTitle || raw.topicId || "General",
    chapterTitleHindi: raw.chapterTitleHindi || raw.chapterTitle || raw.topicId || "सामान्य",
    tags: raw.tags || [],
    question: raw.question,
    questionHindi: raw.questionHindi,
    options,
    optionsHindi: raw.optionsHindi || [],
    correctAnswerIndex: Math.max(0, correctIndex),
    correctAnswer: options[Math.max(0, correctIndex)] || "",
    hints: raw.hints || [],
    hintsHindi: raw.hintsHindi || [],
    explanation: raw.explanation || "",
    explanationHindi: raw.explanationHindi || "",
    difficulty: raw.difficulty || "easy",
    eloRating: raw.eloRating || getInitialRating(raw.class),
    interval: raw.interval || estimateReferenceTime(raw),
    marks: raw.marks || 1,
    negativeMarks: raw.negativeMarks || 0,
  };
}

function flattenQuestionBank(bankModule, className) {
  const classNumber = getClassNumber(className);
  const exportsByClass = {
    6: [
      ["maths", bankModule.class6MathsQuestionBank],
      ["science", bankModule.class6ScienceQuestionBank],
      ["social", bankModule.class6SocialQuestionBank],
    ],
    7: [
      ["maths", bankModule.class7MathematicsQuestionBank],
      ["science", bankModule.class7ScienceQuestionBank],
      ["social", bankModule.class7SocialQuestionBank],
    ],
    8: [
      ["maths", bankModule.class8MathsQuestionBank],
      ["science", bankModule.class8ScienceQuestionBank],
      ["social", bankModule.class8SocialQuestionBank],
    ],
    9: [
      ["maths", bankModule.class9MathsQuestionBank],
      ["science", bankModule.class9ScienceQuestionBank],
      ["social", bankModule.class9SocialQuestionBank],
    ],
    10: [
      ["maths", bankModule.class10MathsQuestionBank],
      ["science", bankModule.class10ScienceQuestionBank],
      ["social", bankModule.class10SocialQuestionBank],
    ],
  };

  return (exportsByClass[classNumber] || [])
    .flatMap(([subject, chapters]) =>
      (chapters || []).flatMap((chapter) =>
        (chapter.questions || []).map((question) =>
          normalizeQuestion(
            {
              ...question,
              chapterNumber: chapter.chapterNumber,
              chapterTitle: chapter.chapterTitle,
              chapterTitleHindi: chapter.chapterTitleHindi,
            },
            subject
          )
        )
      )
    )
    .sort((a, b) => a.eloRating - b.eloRating || a.id.localeCompare(b.id));
}

function selectNextQuestion(questions, state, servedIds, weakTopics = []) {
  const served = new Set(servedIds);
  const candidates = questions.filter((question) => !served.has(question.id));
  if (candidates.length === 0) return null;

  const targetRating = calculateTargetRating(state, state.className);
  const recentTopics = new Set((state.recentTopics || []).slice(-5));
  const weakTopicSet = new Set(weakTopics);

  const scoredCandidates = candidates
    .map((question) => {
      const difficultyFit = 1 - Math.min(1, Math.abs(question.eloRating - targetRating) / 250);
      const weakTopicBonus = weakTopicSet.has(question.topicId) ? 0.2 : 0;
      const wrongBonus = weakTopicSet.has(question.id) ? 0.3 : 0;
      const diversityBonus = recentTopics.has(question.topicId) ? -0.12 : 0.08;
      const timePenalty = estimateReferenceTime(question) / 300;
      const randomJitter = Math.random() * 0.05;
      return {
        question,
        score: 1.98 * difficultyFit + weakTopicBonus + wrongBonus + diversityBonus - timePenalty + randomJitter,
      };
    })
    .sort((a, b) => b.score - a.score);

  const topN = Math.min(3, scoredCandidates.length);
  const randomIndex = Math.floor(Math.random() * topN);
  return scoredCandidates[randomIndex].question;
}

module.exports = {
  RATING_BANDS,
  MARS_CONFIG,
  calculateTargetRating,
  expectedSuccess,
  flattenQuestionBank,
  getClassNumber,
  getInitialRating,
  getRatingBand,
  selectNextQuestion,
  updateAdaptiveState,
};
