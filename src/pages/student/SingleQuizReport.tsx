import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import Header from "@/components/Header";
const API_URL = import.meta.env.VITE_API_URL;
interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint?: {
    text: string;
    visualLinks?: string[];
  };
  questionImage?: string;

}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

interface QuizAttempt {
  quizId: string;
  score: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  answers: Answer[];
  attemptedAt: string;
}

const SingleQuizReport: React.FC = () => {
  const { id } = useParams(); // This is the quizId
  const [quiz, setQuiz] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizReport = async () => {
      try {
        const cookieData = localStorage.getItem("student");
        if (!cookieData) throw new Error("No student cookie found");

        const student = JSON.parse(cookieData);
        const studentId = student.student.studentId;

        const [studentRes, quizRes] = await Promise.all([
          axios.get(`${API_URL}/students/${studentId}`),
          axios.get(`${API_URL}/quizzes/${id}`),
        ]);

        const studentData = studentRes.data;
        const quizAttempt: QuizAttempt | undefined =
          studentData.quizAttempted.find(
            (attempt: QuizAttempt) => attempt.quizId === id
          );

        if (!quizAttempt) throw new Error("Quiz not found");
        setQuiz(quizAttempt);

        const fullQuiz = quizRes.data;
        const fullQuestions = fullQuiz.questions;

        setQuestions(fullQuestions);
      } catch (err) {
        console.error("Error fetching quiz report:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuizReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading quiz report...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>No quiz data found for this quiz ID.</p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Quiz Report: {quiz.quizId}</h1>
      <p className="text-gray-600 mb-6">
        Attempted At: {new Date(quiz.attemptedAt).toLocaleString()}
      </p>

      {/* ✅ Score Summary (calculated live) */}
<div className="mb-6 bg-gray-100 p-4 rounded">
  <h2 className="text-lg font-semibold">Score Summary</h2>
  <p>
    Correct:{" "}
    {
      quiz.answers.filter((ans) => ans.isCorrect).length
    }
  </p>
  <p>
    Incorrect:{" "}
    {
      quiz.answers.filter((ans) => !ans.isCorrect).length
    }
  </p>
  <p>
    Unattempted: {questions.length - quiz.answers.length}
  </p>
</div>


      {questions.map((question, index) => {
        const answer = quiz.answers.find(
          (ans) => ans.questionId === question._id
        );

        const isCorrect = answer?.isCorrect ?? false;
        const selected = answer?.selectedAnswer ?? null;
        const attempted = !!answer;

        return (
          <div
            key={question._id}
            className="mb-6 p-4 border rounded shadow-sm bg-white"
          >
            <h3 className="font-semibold text-lg mb-2">
              Q{index + 1}. {question.question}
            </h3>

            <div className="space-y-1 mb-2">
              {question.options.map((option, idx) => {
                const isSelected = selected === option;
                const isAnswer = question.correctAnswer === option;

                let bgClass = "";
                if (isAnswer) bgClass = "bg-green-100";
                if (isSelected && !isAnswer) bgClass = "bg-red-100";

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border ${bgClass} ${
                      isSelected ? "border-black" : "border-gray-300"
                    }`}
                  >
                    {option}
                    {isAnswer && (
                      <span className="ml-2 text-green-600">(Correct)</span>
                    )}
                    {isSelected && !isAnswer && (
                      <span className="ml-2 text-red-600">(Your Answer)</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ✅ Show this only once per question */}
            {!attempted && (
              <p className="text-sm text-yellow-600 mt-2 font-medium">
                Question was not attempted.
              </p>
            )}
            {question.questionImage && (
  <div className="mt-3">
    <img
      src={question.questionImage}
      alt={`Q${index + 1} Illustration`}
      className="max-w-full h-auto rounded shadow"
    />
  </div>
)}


            {question.hint?.text && (
              <div className="text-sm text-gray-600 mt-2">
                <strong>Hint:</strong> {question.hint.text}
                {Array.isArray(question.hint.visualLinks) &&
                  question.hint.visualLinks.length > 0 && (
                    <div className="mt-1">
                      {question.hint.visualLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mr-2"
                        >
                          View Resource
                        </a>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default SingleQuizReport;
