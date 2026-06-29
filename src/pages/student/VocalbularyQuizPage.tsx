import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Chapter {
  _id: string;
  chapter: string;
  passage: string;
  questions: Question[];
}

const VocabularyQuizPage: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassage, setShowPassage] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  const [hover, setHover] = useState<string>("");

  // Fetch all chapters
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await axios.get(`/vocab`);
        setChapters(res.data);
      } catch (err) {
        console.error("Error fetching chapters:", err);
      }
    };
    fetchChapters();
  }, []);

  const handleSelectChapter = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/vocab/`);
      setSelectedChapter(res.data);
      setShowPassage(true);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chapter:", err);
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setShowPassage(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const handleSelectOption = (option: string) => {
    if (!selectedChapter) return;

    const currentQuestion = selectedChapter.questions[currentQuestionIndex];
    const existing = answers.find((a) => a.questionId === currentQuestion._id);

    let updatedAnswers;
    if (existing) {
      updatedAnswers = answers.map((a) =>
        a.questionId === currentQuestion._id ? { ...a, selectedAnswer: option } : a
      );
    } else {
      updatedAnswers = [...answers, { questionId: currentQuestion._id, selectedAnswer: option }];
    }

    setAnswers(updatedAnswers);
  };

  const handleNext = async () => {
    if (!selectedChapter) return;

    if (currentQuestionIndex < selectedChapter.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      try {
        const res = await axios.post(`/vocab/evaluate`, {
          chapterId: selectedChapter._id,
          answers,
        });
        setResult(res.data.result);
      } catch (err) {
        console.error("Error evaluating:", err);
      }
    }
  };

  const restartQuiz = () => {
    setSelectedChapter(null);
    setShowPassage(false);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📘 Vocabulary Practice</h1>

      {/* All Chapters */}
      {!selectedChapter && (
        <div style={styles.chapterList}>
          {chapters.map((ch) => (
            <div
              key={ch._id}
              style={{
                ...styles.chapterCard,
                ...(hover === ch._id ? styles.chapterCardHover : {}),
              }}
              onMouseEnter={() => setHover(ch._id)}
              onMouseLeave={() => setHover("")}
              onClick={() => handleSelectChapter(ch._id)}
            >
              <h3 style={styles.chapterTitle}>{ch.chapter}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Passage */}
      {showPassage && selectedChapter && (
        <div style={styles.passageBox}>
          <h2 style={styles.sectionTitle}>{selectedChapter.chapter}</h2>
          <p style={styles.passageText}>{selectedChapter.passage}</p>
          <button style={styles.button} onClick={startQuiz}>
            Start Quiz →
          </button>
        </div>
      )}

      {/* Questions */}
      {selectedChapter && !showPassage && !result && (
        <div style={styles.questionBox}>
          <h3 style={styles.questionHeader}>
            Question {currentQuestionIndex + 1} / {selectedChapter.questions.length}
          </h3>

          <p style={styles.questionText}>
            {selectedChapter.questions[currentQuestionIndex].question}
          </p>

          <div style={styles.optionsContainer}>
            {selectedChapter.questions[currentQuestionIndex].options.map((opt, idx) => {
              const isSelected =
                answers.find(
                  (a) =>
                    a.questionId === selectedChapter.questions[currentQuestionIndex]._id &&
                    a.selectedAnswer === opt
                ) !== undefined;

              return (
                <button
                  key={idx}
                  style={{
                    ...styles.optionButton,
                    backgroundColor: isSelected ? "#d9b3ff" : "#f3f0ff",
                  }}
                  onClick={() => handleSelectOption(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <button style={styles.button} onClick={handleNext}>
            {currentQuestionIndex === selectedChapter.questions.length - 1
              ? "Submit"
              : "Next →"}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={styles.resultBox}>
          <h2>🎉 Quiz Completed!</h2>
          <p>Correct: {result.totalCorrect}</p>
          <p>Incorrect: {result.totalIncorrect}</p>
          <p>Unattempted: {result.totalUnattempted}</p>

          <button style={styles.button} onClick={restartQuiz}>
            Back to Chapters
          </button>
        </div>
      )}
    </div>
  );
};

export default VocabularyQuizPage;

// =======================
// 🎨 Modern UI Styles
// =======================
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    fontFamily: "Poppins, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },

  title: {
    textAlign: "center",
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "20px",
  },

  // Chapters list
  chapterList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "25px",
  },

  chapterCard: {
    width: "100%",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "white",
    padding: "20px",
    borderRadius: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",
  },

  chapterCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
  },

  chapterTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
  },

  passageBox: {
    background: "#faf5ff",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
  },

  sectionTitle: {
    fontSize: "24px",
    fontWeight: 600,
  },

  passageText: {
    lineHeight: 1.6,
    fontSize: "16px",
    marginTop: "12px",
  },

  questionBox: {
    background: "#ffffff",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  questionHeader: {
    fontSize: "18px",
    fontWeight: 600,
  },

  questionText: {
    marginTop: "15px",
    fontSize: "17px",
  },

  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "15px",
  },

  optionButton: {
    border: "1px solid #d3c4ff",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    textAlign: "left",
    transition: "0.2s",
  },

  button: {
    backgroundColor: "#7c3aed",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    marginTop: "20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
  },

  resultBox: {
    marginTop: "25px",
    padding: "20px",
    background: "#eef7ee",
    borderRadius: "12px",
    textAlign: "center",
  },
};
