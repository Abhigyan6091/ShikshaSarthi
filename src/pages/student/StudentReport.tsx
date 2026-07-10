import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
const API_URL = import.meta.env.VITE_API_URL;
export default function StudentReport() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStudentAndQuestions() {
      try {
        setLoading(true);
        setError(null);

        // Fetch student data
        const resStudent = await fetch(`${API_URL}/students/${id}`);
        if (!resStudent.ok) throw new Error("Failed to fetch student data");
        const studentData = await resStudent.json();
        setStudent(studentData);

        // Collect all questionIds from all quiz attempts
        const questionIds = studentData.quizAttempted.flatMap((quiz) =>
          quiz.answers.map((answer) => answer.questionId)
        );

        // Remove duplicates (optional)
        const uniqueQuestionIds = [...new Set(questionIds)];

        // Fetch all questions in parallel
        const questionPromises = uniqueQuestionIds.map((qid) =>
          fetch(`${API_URL}/questions/${qid}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch question ${qid}`);
            return res.json();
          })
        );

        const questionsData = await Promise.all(questionPromises);

        // Store questions in an object with questionId keys for quick access
        const questionsMap = {};
        questionsData.forEach((q) => {
          questionsMap[q._id] = q;
        });

        setQuestions(questionsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchStudentAndQuestions();
    }
  }, [id]);

  if (loading) return <div>Loading student and questions data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!student) return <div>No student found</div>;

  return (
    <div>
      <Header />
      <div
      style={{
        maxWidth: 800,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
        lineHeight: 1.6,
      }}
    >
      <h1
        style={{ textAlign: "center", marginBottom: "2rem", color: "#2c3e50" }}
      >
        Student Report for{" "}
        <span style={{ color: "#2980b9" }}>{student.name}</span> (ID:{" "}
        <span style={{ fontWeight: "bold" }}>{id}</span>)
      </h1>

      {student.quizAttempted.map((quiz) => (
        <section
          key={quiz._id}
          style={{
            marginBottom: "3rem",
            padding: "1.5rem",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#34495e", marginBottom: "0.5rem" }}>
            Quiz ID: {quiz.quizId}
          </h2>
          <p style={{ marginBottom: "0.25rem", fontWeight: "600" }}>
            Score — Correct:{" "}
            <span style={{ color: "#27ae60" }}>{quiz.score.correct}</span>,
            Incorrect:{" "}
            <span style={{ color: "#e74c3c" }}>{quiz.score.incorrect}</span>,
            Unattempted:{" "}
            <span style={{ color: "#95a5a6" }}>{quiz.score.unattempted}</span>
          </p>
          <p
            style={{
              marginBottom: "1rem",
              fontStyle: "italic",
              color: "#7f8c8d",
            }}
          >
            Attempted At: {new Date(quiz.attemptedAt).toLocaleString()}
          </p>

          <h3
            style={{
              borderBottom: "2px solid #2980b9",
              paddingBottom: "0.3rem",
              marginBottom: "1rem",
              color: "#2980b9",
            }}
          >
            Answers:
          </h3>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {quiz.answers.map((answer) => {
              const question = questions[answer.questionId];

              if (!question) {
                return (
                  <li
                    key={answer._id}
                    style={{
                      marginBottom: "1rem",
                      fontStyle: "italic",
                      color: "#7f8c8d",
                    }}
                  >
                    Loading question {answer.questionId}...
                  </li>
                );
              }

              return (
                <li
                  key={answer._id}
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                  }}
                >
                  <p style={{ marginBottom: "0.5rem", fontWeight: "700" }}>
                    Q: {question.question}
                  </p>
                  <p style={{ marginBottom: "0.3rem" }}>
                    <strong>Options:</strong> {question.options.join(", ")}
                  </p>
                  <p style={{ marginBottom: "0.3rem" }}>
                    <strong>Your answer:</strong>{" "}
                    <span
                      style={{
                        color: answer.isCorrect ? "#27ae60" : "#e74c3c",
                      }}
                    >
                      {answer.selectedAnswer} {answer.isCorrect ? "✅" : "❌"}
                    </span>
                  </p>
                  <p style={{ marginBottom: "0.3rem" }}>
                    <strong>Correct answer:</strong> {question.correctAnswer}
                  </p>
                  <p style={{ marginBottom: "0.3rem" }}>
                    <strong>Hint:</strong>{" "}
                    {question.hint?.text || "No hint available"}
                  </p>

                  {question.hint?.visualLinks &&
                    question.hint.visualLinks.length > 0 && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <strong>Visual Hints:</strong>
                        <ul
                          style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}
                        >
                          {question.hint.visualLinks.map((link, idx) => (
                            <li key={idx}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#2980b9",
                                  textDecoration: "underline",
                                }}
                              >
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      </div>
    </div>
  );
}
