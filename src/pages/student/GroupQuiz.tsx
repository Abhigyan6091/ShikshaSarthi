import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, ChevronLeft, ChevronRight, Languages, Lightbulb, Loader2, SkipForward, Trophy, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const API_URL = import.meta.env.VITE_API_URL;

type Step = "students" | "quiz" | "playing" | "results";

interface Student {
  studentId: string;
  name: string;
  class?: string;
  batch?: string;
}

interface Question {
  _id: string;
  question: string;
  questionHindi?: string;
  options: string[];
  optionsHindi?: string[];
  correctAnswer: string;
  hint?: { text?: string };
  topic?: string;
  subject?: string;
}

interface Quiz {
  quizId: string;
  mode?: "quiz" | "group";
  questions: Array<string | Question>;
  totalQuestions?: number;
  timeLimit?: number;
}

const studentColors = [
  { bg: "bg-blue-500", soft: "bg-blue-50", text: "text-blue-700", border: "border-blue-500", ring: "ring-blue-200" },
  { bg: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-500", ring: "ring-emerald-200" },
  { bg: "bg-orange-500", soft: "bg-orange-50", text: "text-orange-700", border: "border-orange-500", ring: "ring-orange-200" },
];
const SKIPPED_ANSWER = "__SKIPPED__";

const normalizeQuestion = (raw: any): Question | null => {
  if (!raw || typeof raw === "string") return null;
  const options = Array.isArray(raw.options) ? raw.options.filter(Boolean).map(String) : [];
  const correctAnswer = String(raw.correctAnswer || raw.options?.[raw.correctAnswerIndex] || "").trim();
  const question = String(raw.question || raw.questionText || "").trim();
  const id = String(raw._id || raw.id || "").trim();
  if (!id || !question || options.length < 2 || !correctAnswer) return null;
  return {
    _id: id,
    question,
    questionHindi: raw.questionHindi,
    options,
    optionsHindi: Array.isArray(raw.optionsHindi) ? raw.optionsHindi.filter(Boolean).map(String) : [],
    correctAnswer,
    hint: typeof raw.hint === "string" ? { text: raw.hint } : raw.hint,
    topic: raw.topic,
    subject: raw.subject,
  };
};

const GroupQuiz: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("students");
  const [studentIds, setStudentIds] = useState(["", "", ""]);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizId, setQuizId] = useState(() => searchParams.get("quizId") || "");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStudentId, setActiveStudentId] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("appLanguage") || "hi");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentIndex];
  const activeStudentIndex = students.findIndex((student) => student.studentId === activeStudentId);
  const activeStudent = activeStudentIndex >= 0 ? students[activeStudentIndex] : null;

  useEffect(() => {
    const incomingQuizId = searchParams.get("quizId");
    if (incomingQuizId) setQuizId(incomingQuizId);
  }, [searchParams]);

  useEffect(() => {
    if (!activeStudentId && students.length > 0) {
      setActiveStudentId(students[0].studentId);
    }
  }, [activeStudentId, students]);

  const scores = useMemo(() => {
    return students.map((student, index) => {
      const correct = questions.reduce((sum, question) => {
        return sum + (answers[question._id]?.[student.studentId] === question.correctAnswer ? 1 : 0);
      }, 0);
      const attempted = questions.reduce((sum, question) => {
        const answer = answers[question._id]?.[student.studentId];
        return sum + (answer && answer !== SKIPPED_ANSWER ? 1 : 0);
      }, 0);
      return {
        student,
        color: studentColors[index],
        correct,
        attempted,
        total: questions.length,
      };
    });
  }, [answers, questions, students]);

  const updateStudentId = (index: number, value: string) => {
    setStudentIds((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const validateStudents = async (event: React.FormEvent) => {
    event.preventDefault();
    const ids = studentIds.map((id) => id.trim()).filter(Boolean);
    if (ids.length !== 3) {
      toast({ title: "Enter all three student IDs", variant: "destructive" });
      return;
    }
    if (new Set(ids).size !== 3) {
      toast({ title: "Student IDs must be different", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const responses = await Promise.all(ids.map((id) => axios.get(`${API_URL}/students/${encodeURIComponent(id)}`)));
      setStudents(responses.map((res) => res.data));
      setActiveStudentId(responses[0]?.data?.studentId || "");
      setStep("quiz");
    } catch (error) {
      toast({
        title: "Student not found",
        description: "Please check all three registered student IDs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionDocs = async (rawQuestions: Array<string | Question>) => {
    const resolved = await Promise.all(
      rawQuestions.map(async (item) => {
        const embedded = normalizeQuestion(item);
        if (embedded) return embedded;
        const id = String(item || "").trim();
        if (!id) return null;
        try {
          const response = await axios.get(`${API_URL}/questions/${encodeURIComponent(id)}`);
          return normalizeQuestion(response.data);
        } catch {
          return null;
        }
      })
    );
    return resolved.filter((question): question is Question => Boolean(question));
  };

  const startQuiz = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuizId = quizId.trim();
    if (!trimmedQuizId) {
      toast({ title: "Enter quiz ID", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/quizzes/by-id/${encodeURIComponent(trimmedQuizId)}`);
      const quizData = response.data as Quiz;
      if ((quizData.mode || "quiz") !== "group") {
        toast({
          title: "Not a group quiz",
          description: "This quiz was created as an individual quiz. Please use Take Quiz.",
          variant: "destructive",
        });
        return;
      }

      const alreadySubmitted = await Promise.all(
        students.map(async (student) => {
          try {
            await axios.get(`${API_URL}/reports/student/${encodeURIComponent(student.studentId)}/quiz/${encodeURIComponent(trimmedQuizId)}`);
            return student.studentId;
          } catch (error: any) {
            return error.response?.status === 404 ? null : student.studentId;
          }
        })
      );
      const submittedStudents = alreadySubmitted.filter(Boolean);
      if (submittedStudents.length > 0) {
        toast({
          title: "Already submitted",
          description: `This quiz is already completed for: ${submittedStudents.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      const questionDocs = await loadQuestionDocs(quizData.questions || []);
      if (questionDocs.length === 0) {
        toast({
          title: "No MCQ questions found",
          description: "This group mode needs quiz questions with options and one correct answer.",
          variant: "destructive",
        });
        return;
      }
      setQuiz(quizData);
      setQuestions(questionDocs);
      setAnswers({});
      setCurrentIndex(0);
      setActiveStudentId(students[0]?.studentId || "");
      setStartedAt(Date.now());
      setStep("playing");
    } catch (error) {
      toast({ title: "Quiz not found", description: "Please check the quiz ID.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const chooseOption = (option: string) => {
    if (!currentQuestion) return;
    if (!activeStudentId) {
      toast({ title: "Select a student first", variant: "destructive" });
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        ...(prev[currentQuestion._id] || {}),
        [activeStudentId]: option,
      },
    }));
  };

  const skipForActiveStudent = () => {
    if (!currentQuestion || !activeStudentId) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        ...(prev[currentQuestion._id] || {}),
        [activeStudentId]: SKIPPED_ANSWER,
      },
    }));
  };

  const finishQuiz = async () => {
    if (!quiz || questions.length === 0) return;
    try {
      setSubmitting(true);
      const answersByStudent = students.reduce<Record<string, Record<string, string>>>((acc, student) => {
        acc[student.studentId] = questions.reduce<Record<string, string>>((questionAcc, question) => {
          questionAcc[question._id] = answers[question._id]?.[student.studentId] || "";
          return questionAcc;
        }, {});
        return acc;
      }, {});

      await axios.post(`${API_URL}/quizzes/submit-group`, {
        quizId: quiz.quizId,
        students: students.map((student, index) => ({
          studentId: student.studentId,
          name: student.name,
          color: studentColors[index].bg.replace("bg-", ""),
        })),
        questions: questions.map((question) => ({
          _id: question._id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
        })),
        answersByStudent,
        timeTaken: startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 0,
      });
      toast({ title: "Group quiz submitted", description: "Marks were saved for all three students." });
      setStep("results");
    } catch (error: any) {
      toast({
        title: "Could not submit group quiz",
        description: error.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setStep("students");
    setStudentIds(["", "", ""]);
    setStudents([]);
    setQuizId("");
    setQuiz(null);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setActiveStudentId("");
    setStartedAt(null);
  };

  const optionMarkers = (option: string) =>
    students
      .map((student, index) => ({ student, color: studentColors[index] }))
      .filter(({ student }) => answers[currentQuestion?._id || ""]?.[student.studentId] === option);

  const selectedLabel = (selected: string) => {
    if (!currentQuestion || !selected) return "";
    if (selected === SKIPPED_ANSWER) return "Skipped";
    const selectedIndex = currentQuestion.options.findIndex((option) => option === selected);
    return selectedIndex >= 0 ? displayOptions[selectedIndex] || selected : selected;
  };

  const switchLanguage = () => {
    const next = language === "hi" ? "en" : "hi";
    setLanguage(next);
    localStorage.setItem("appLanguage", next);
    window.dispatchEvent(new CustomEvent("appLanguageChanged", { detail: { language: next } }));
  };

  const isHindi = language === "hi";
  const questionText = currentQuestion
    ? isHindi
      ? currentQuestion.questionHindi || currentQuestion.question
      : currentQuestion.question
    : "";
  const displayOptions =
    currentQuestion && isHindi && currentQuestion.optionsHindi?.length === currentQuestion.options.length
      ? currentQuestion.optionsHindi
      : currentQuestion?.options || [];
  const selectedByActive = currentQuestion && activeStudentId ? answers[currentQuestion._id]?.[activeStudentId] : "";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="edu-container max-w-5xl">
          <div className="mb-8 flex items-center">
            <Link to="/student" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Group Quiz</h1>
              <p className="text-sm text-gray-600">Three students answer the same quiz, each with a separate color and score.</p>
            </div>
          </div>

          {step === "students" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-edu-purple" />
                  <CardTitle>Register Group Members</CardTitle>
                </div>
                <CardDescription>Enter three registered student IDs. This group quiz runs on this one system.</CardDescription>
              </CardHeader>
              <form onSubmit={validateStudents}>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {studentIds.map((value, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`student-${index}`}>Student {index + 1} ID</Label>
                      <Input
                        id={`student-${index}`}
                        value={value}
                        onChange={(event) => updateStudentId(index, event.target.value)}
                        placeholder={`Student ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {step === "quiz" && (
            <Card>
              <CardHeader>
                <CardTitle>Enter Quiz ID</CardTitle>
                <CardDescription>All three students are verified. Now enter the teacher-provided group quiz ID.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid gap-3 md:grid-cols-3">
                  {students.map((student, index) => (
                    <div key={student.studentId} className={`rounded-lg border p-3 ${studentColors[index].soft}`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${studentColors[index].bg}`} />
                        <p className={`font-semibold ${studentColors[index].text}`}>{student.name}</p>
                      </div>
                      <p className="text-xs text-gray-500">{student.studentId}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={startQuiz} className="flex flex-col gap-3 sm:flex-row">
                  <Input value={quizId} onChange={(event) => setQuizId(event.target.value)} placeholder="Quiz ID" required />
                  <Button type="submit" disabled={loading} className="sm:w-40">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Start
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "playing" && currentQuestion && (
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>
                        Question {currentIndex + 1} of {questions.length}
                      </CardTitle>
                      <CardDescription>
                        Quiz {quiz?.quizId}
                        {currentQuestion.topic ? ` · ${currentQuestion.topic}` : ""}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={switchLanguage} className="gap-1">
                        <Languages className="h-4 w-4" /> {isHindi ? "English" : "हिंदी"}
                      </Button>
                      <Badge variant="outline">MSQ view · one correct answer</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-lg font-semibold leading-8 text-gray-900">{questionText}</p>
                  {currentQuestion.hint?.text && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{currentQuestion.hint.text}</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const markers = optionMarkers(option);
                      const displayOption = displayOptions[optionIndex] || option;
                      const activeSelected = selectedByActive === option;
                      return (
                        <button
                          key={`${currentQuestion._id}-${optionIndex}`}
                          type="button"
                          onClick={() => chooseOption(option)}
                          className={`w-full rounded-lg border bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 ${
                            activeSelected && activeStudentIndex >= 0
                              ? `${studentColors[activeStudentIndex].border} ${studentColors[activeStudentIndex].soft} ring-2 ${studentColors[activeStudentIndex].ring}`
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium text-gray-900">
                              {String.fromCharCode(65 + optionIndex)}. {displayOption}
                            </p>
                            <div className="flex -space-x-1">
                              {markers.map(({ student, color }) => (
                                <span
                                  key={student.studentId}
                                  title={`${student.name} selected this option`}
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white ${color.bg}`}
                                >
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-3">
                  <Button variant="outline" onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} disabled={currentIndex === 0}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  {currentIndex < questions.length - 1 ? (
                    <Button onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={finishQuiz} disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Finish Quiz
                    </Button>
                  )}
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Selector</CardTitle>
                  <CardDescription>Click a student name first, then click an option on the left.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Labels</p>
                    <p className="mt-1">1. Select student</p>
                    <p>2. Select option</p>
                    <p>3. Use Skip if the selected student does not want to answer.</p>
                  </div>
                  <div className="space-y-2">
                    {students.map((student, index) => {
                      const color = studentColors[index];
                      const active = activeStudentId === student.studentId;
                      const selected = currentQuestion ? answers[currentQuestion._id]?.[student.studentId] : "";
                      return (
                        <button
                          key={student.studentId}
                          type="button"
                          onClick={() => setActiveStudentId(student.studentId)}
                          className={`w-full rounded-lg border p-3 text-left transition ${
                            active ? `${color.border} ${color.soft} ring-2 ${color.ring}` : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${color.bg}`} />
                            <p className={`font-semibold ${color.text}`}>{student.name}</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{student.studentId}</p>
                          <p className="mt-2 text-xs font-medium text-gray-700">
                            {selected ? `Selected: ${selectedLabel(selected)}` : "No answer selected"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <Button type="button" variant="outline" className="w-full gap-2" disabled={!activeStudent} onClick={skipForActiveStudent}>
                    <SkipForward className="h-4 w-4" />
                    Skip for {activeStudent?.name || "student"}
                  </Button>
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-sm font-semibold text-gray-900">Progress</p>
                    <div className="mt-2 space-y-1">
                      {students.map((student, index) => {
                        const answered = questions.filter((question) => answers[question._id]?.[student.studentId] !== undefined).length;
                        return (
                          <div key={student.studentId} className="flex items-center justify-between text-xs text-gray-600">
                            <span className={studentColors[index].text}>{student.name}</span>
                            <span>{answered}/{questions.length}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === "results" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <CardTitle>Group Quiz Results</CardTitle>
                </div>
                <CardDescription>Quiz {quiz?.quizId} completed with separate marks for each student.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {scores.map((score) => (
                  <div key={score.student.studentId} className={`rounded-lg border p-5 text-center ${score.color.soft}`}>
                    <div className={`mx-auto mb-3 h-5 w-5 rounded-full ${score.color.bg}`} />
                    <p className={`font-bold ${score.color.text}`}>{score.student.name}</p>
                    <p className="text-xs text-gray-500">{score.student.studentId}</p>
                    <p className="mt-4 text-3xl font-black text-gray-900">
                      {score.correct}/{score.total}
                    </p>
                    <p className="text-sm text-gray-600">{score.attempted} attempted</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setStep("playing")}>Review Answers</Button>
                <Button onClick={resetAll}>Start New Group Quiz</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GroupQuiz;
