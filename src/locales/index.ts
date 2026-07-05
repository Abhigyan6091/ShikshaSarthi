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

export function translate(key: string, language: Language): string {
  const entry = strings[key];
  if (!entry) return key;
  return entry[language] || entry.en;
}
