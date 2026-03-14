import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import experiments from './experimentList.json';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CheckCircle, XCircle, BarChart2, HelpCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const LabQuiz: React.FC = () => {
    const { subject } = useParams<{ subject: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState<{[key: number]: string}>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);

    const subjectExperiments = experiments.filter(
      (exp) => exp.subject.toLowerCase() === subject?.toLowerCase()
    );

    useEffect(() => {
        if (selectedExperiment) {
            fetchQuestions(selectedExperiment);
             setAnswers({});
             setShowResults(false);
             setScore(0);
        } else {
            setQuestions([]);
        }
    }, [selectedExperiment]);

    const fetchQuestions = async (expName: string) => {
        setLoading(true);
        try {
            console.log(`Fetching questions for: ${expName}`);
            const response = await axios.get(`${API_URL}/api/experiments/questions/${encodeURIComponent(expName)}`);
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex: number, answer: string) => {
      setAnswers({
        ...answers,
        [questionIndex]: answer
      });
    };

    const calculateScore = () => {
      let currentScore = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          currentScore++;
        }
      });
      return currentScore;
    };

    const handleSubmit = async () => {
      setSubmitLoading(true);
      const calculatedScore = calculateScore();
      setScore(calculatedScore);

      const expDetails = experiments.find(e => e.experiment_name === selectedExperiment);

      const attemptData = {
          studentId: user?.id || "guest",
          studentName: user?.name || "Guest User",
          experimentName: selectedExperiment,
          subject: subject || "Unknown",
          class: expDetails?.class || "11",
          score: calculatedScore,
          totalQuestions: questions.length,
          correctAnswers: calculatedScore,
          wrongAnswers: questions.length - calculatedScore,
          timeTaken: 120,
          questionAnalytics: questions.map((q, index) => ({
              questionId: q._id,
              questionText: q.question,
              selectedAnswer: answers[index] || "",
              correctAnswer: q.correctAnswer,
              isCorrect: answers[index] === q.correctAnswer,
              timeTaken: 0
          }))
      };

      try {
          const response = await axios.post(`${API_URL}/api/experiments/attempt`, attemptData);
          toast({
            title: "Quiz Result Saved",
            description: "Your performance has been recorded.",
            variant: "default",
          });
      } catch (error) {
          console.error("Error submitting attempt:", error);
           toast({
            title: "Error Saving Result",
            description: "Could not save your quiz result. Please try again later.",
            variant: "destructive",
          });
      }
      setShowResults(true);
      setSubmitLoading(false);
    };

    if (showResults) {
      const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
      
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" className="mb-6" onClick={() => {setShowResults(false); setSelectedExperiment(null);}}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Experiments
            </Button>
            
            <Card className="border-t-4 border-t-indigo-500 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-bold text-slate-800">Quiz Results</CardTitle>
                    <CardDescription>{selectedExperiment}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="text-5xl font-extrabold text-indigo-600 mb-2">{percentage}%</div>
                        <p className="text-slate-500 font-medium">You scored {score} out of {questions.length}</p>
                        <Progress value={percentage} className="w-full max-w-md mt-4 h-3" />
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, index) => {
                            const isCorrect = answers[index] === q.correctAnswer;
                            return (
                                <div key={index} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800 mb-2">{index + 1}. {q.question}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                                                <div className={`p-2 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800 font-medium' : 'bg-red-100 text-red-800 line-through'}`}>
                                                    Your Answer: {answers[index] || "Skipped"}
                                                </div>
                                                {!isCorrect && (
                                                    <div className="p-2 rounded-lg bg-green-100 text-green-800 font-medium">
                                                        Correct Answer: {q.correctAnswer}
                                                    </div>
                                                )}
                                            </div>

                                            {q.explanation && (
                                                <div className="mt-3 text-sm text-slate-600 bg-white/50 p-3 rounded-lg">
                                                    <strong>Explanation:</strong> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4 bg-slate-50 p-6">
                    <Button onClick={() => {setShowResults(false); setAnswers({}); setScore(0);}} variant="outline">
                        Retry Quiz
                    </Button>
                    <Button onClick={() => {setSelectedExperiment(null); setShowResults(false);}} className="bg-indigo-600 hover:bg-indigo-700">
                        Try Another Experiment
                    </Button>
                    <Button onClick={() => navigate('/student/experiments/analytics')} variant="secondary">
                         Analytics
                    </Button>
                </CardFooter>
            </Card>
          </main>
          <Footer />
        </div>
      )
    }

    if (selectedExperiment) {
      if (loading) {
          return (
              <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                  <Header />
                  <main className="flex-grow flex items-center justify-center">
                      <div className="animate-pulse text-indigo-600 font-semibold">Loading questions...</div>
                  </main>
                  <Footer />
              </div>
          );
      }

      if (questions.length === 0) {
          return (
              <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                       <Button variant="ghost" className="mb-6" onClick={() => setSelectedExperiment(null)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Questions Found</AlertTitle>
                        <AlertDescription>
                          There are currently no quiz questions available for this experiment.
                        </AlertDescription>
                      </Alert>
                  </main>
                  <Footer />
              </div>
          );
      }

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" className="mb-6" onClick={() => setSelectedExperiment(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Quit Quiz
            </Button>
            
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-indigo-600 text-white rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold">{selectedExperiment}</CardTitle>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            {questions.length} Questions
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {questions.map((q, index) => (
                    <div key={q._id} className="mb-8 last:mb-0 border-b last:border-0 pb-8 last:pb-0 border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-start gap-2">
                             <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                                {index + 1}
                             </span>
                             {q.question}
                        </h3>
                        <div className="space-y-3 pl-10">
                        {q.options.map((option, optIndex) => (
                            <label key={optIndex} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all hover:bg-slate-50 ${answers[index] === option ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200'}`}>
                            <input 
                                type="radio" 
                                name={`question-${index}`} 
                                value={option} 
                                checked={answers[index] === option}
                                onChange={() => handleAnswerChange(index, option)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-3"
                            />
                            <span className={`${answers[index] === option ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>{option}</span>
                            </label>
                        ))}
                        </div>
                    </div>
                    ))}
                </CardContent>
                <CardFooter className="bg-slate-50 p-6 flex justify-end rounded-b-xl border-t border-slate-100">
                    <Button 
                        onClick={handleSubmit} 
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                        disabled={submitLoading || Object.keys(answers).length < questions.length}
                    >
                        {submitLoading ? "Submitting..." : "Submit Quiz"}
                    </Button>
                </CardFooter>
            </Card>
          </main>
          <Footer />
        </div>
      )
    }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 capitalize mb-3">
                {subject} Lab Quizzes
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
                Test your knowledge of experiments and simulations. Select an experiment below to start the quiz.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectExperiments.map((exp, index) => (
            <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-slate-200 overflow-hidden"
                onClick={() => setSelectedExperiment(exp.experiment_name)}
            >
                <div className={`h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:h-3 transition-all duration-300`} />
                <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                            {exp.section}
                        </Badge>
                        <HelpCircle className="h-5 w-5 text-indigo-100 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {exp.experiment_name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 line-clamp-2">
                        {exp.description}
                    </p>
                </CardContent>
                <CardFooter className="bg-slate-50 group-hover:bg-indigo-50/50 transition-colors pt-4 pb-4">
                    <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-transparent p-0 flex items-center justify-between font-medium">
                        Start Quiz <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabQuiz;
