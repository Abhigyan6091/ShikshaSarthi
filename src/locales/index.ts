// Curated EN/HI dictionary for common UI chrome. Content (questions, options,
// hints, explanations) is translated via the data-driven *Hindi fields already
// present on records — this dictionary covers the surrounding interface only.
// Add keys here; components read them via the useLanguage() hook's t().

export type Language = "en" | "hi";

type Dict = Record<string, { en: string; hi: string }>;

export const strings: Dict = {
  // Header / nav
  "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "nav.logout": { en: "Logout", hi: "लॉग आउट" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स" },
  "nav.profile": { en: "Profile", hi: "प्रोफ़ाइल" },
  "lang.toggle": { en: "हिंदी", hi: "English" }, // label shows the OTHER language

  // Common actions
  "action.submit": { en: "Submit", hi: "जमा करें" },
  "action.cancel": { en: "Cancel", hi: "रद्द करें" },
  "action.save": { en: "Save", hi: "सहेजें" },
  "action.back": { en: "Back", hi: "वापस" },
  "action.next": { en: "Next", hi: "अगला" },
  "action.start": { en: "Start", hi: "शुरू करें" },
  "action.loading": { en: "Loading…", hi: "लोड हो रहा है…" },

  // Student dashboard
  "student.welcome": { en: "Welcome", hi: "स्वागत है" },
  "student.practice": { en: "Practice Quiz", hi: "अभ्यास प्रश्नोत्तरी" },
  "student.adaptiveTest": { en: "Adaptive Test", hi: "अनुकूली परीक्षण" },
  "student.giveFeedback": { en: "Give Feedback", hi: "प्रतिक्रिया दें" },
  "student.experiments": { en: "Experiment Simulation", hi: "प्रयोग सिमुलेशन" },
  "student.reports": { en: "Reports", hi: "रिपोर्ट" },

  // Quiz / practice chrome
  "quiz.question": { en: "Question", hi: "प्रश्न" },
  "quiz.score": { en: "Score", hi: "स्कोर" },
  "quiz.correct": { en: "Correct!", hi: "सही!" },
  "quiz.incorrect": { en: "Incorrect", hi: "गलत" },
  "quiz.showHint": { en: "Show Hint", hi: "संकेत दिखाएं" },
  "quiz.hideHint": { en: "Hide Hint", hi: "संकेत छिपाएं" },
  "quiz.previous": { en: "Previous", hi: "पिछला" },
  "quiz.skip": { en: "Skip", hi: "छोड़ें" },
  "quiz.finish": { en: "Finish", hi: "समाप्त करें" },
  "quiz.subject": { en: "Subject", hi: "विषय" },
  "quiz.topic": { en: "Topic", hi: "विषयवस्तु" },
  "quiz.leaderboard": { en: "Leaderboard", hi: "लीडरबोर्ड" },
  "quiz.testHistory": { en: "Test History", hi: "परीक्षण इतिहास" },

  // Feedback
  "feedback.destination": {
    en: "Your feedback is sent directly to your school administrator.",
    hi: "आपकी प्रतिक्रिया सीधे आपके स्कूल प्रशासक को भेजी जाती है।",
  },
  "feedback.submitted": {
    en: "Your feedback has been sent to your school administrator.",
    hi: "आपकी प्रतिक्रिया आपके स्कूल प्रशासक को भेज दी गई है।",
  },
  "feedback.none": {
    en: "No feedback forms are active right now. Check back later.",
    hi: "अभी कोई प्रतिक्रिया फ़ॉर्म सक्रिय नहीं है। बाद में देखें।",
  },
};

// Subject tags are a small, fixed vocabulary stored in English (or a Hindi
// alias) on question records. This maps the common ones to a display label so
// the subject chips translate even though the stored value stays constant.
const SUBJECT_LABELS: Dict = {
  science: { en: "Science", hi: "विज्ञान" },
  maths: { en: "Maths", hi: "गणित" },
  mathematics: { en: "Mathematics", hi: "गणित" },
  math: { en: "Math", hi: "गणित" },
  social: { en: "Social Science", hi: "सामाजिक विज्ञान" },
  "social science": { en: "Social Science", hi: "सामाजिक विज्ञान" },
  english: { en: "English", hi: "अंग्रेज़ी" },
  hindi: { en: "Hindi", hi: "हिंदी" },
  physics: { en: "Physics", hi: "भौतिक विज्ञान" },
  chemistry: { en: "Chemistry", hi: "रसायन विज्ञान" },
  biology: { en: "Biology", hi: "जीव विज्ञान" },
};

export function translate(key: string, language: Language): string {
  const entry = strings[key];
  if (!entry) return key;
  return entry[language] || entry.en;
}

// Translate a subject tag if it's in the known vocabulary; otherwise return the
// tag unchanged (topics and unknown subjects are shown as authored).
export function translateSubject(subject: string, language: Language): string {
  const entry = SUBJECT_LABELS[String(subject || "").trim().toLowerCase()];
  return entry ? entry[language] || entry.en : subject;
}
