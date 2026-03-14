import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart2, Calendar, Clock, Trophy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ExperimentAttempt {
    _id: string;
    experimentName: string;
    subject: string;
    score: number;
    totalQuestions: number;
    attemptedAt: string;
}

const ExperimentAnalytics: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState<ExperimentAttempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchAnalytics();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/experiments/analytics/${user?.id}`);
            setAttempts(response.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="animate-pulse text-indigo-600 font-semibold">Loading analytics...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl flex flex-col items-center justify-center">
                     <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Login Required</h2>
                        <p className="text-slate-600 mb-6">Please log in to view your experiment analytics and history.</p>
                        <Button onClick={() => navigate('/login')} className="bg-indigo-600 hover:bg-indigo-700">
                            Go to Login
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Calculate stats
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
    const totalPossible = attempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    const avgScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const uniqueExperiments = new Set(attempts.map(a => a.experimentName)).size;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <Button variant="ghost" className="mb-6" onClick={() => navigate('/student/experiments')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Experiments
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <BarChart2 className="h-8 w-8 text-indigo-600" />
                            Experiment Analytics
                        </h1>
                        <p className="text-slate-500 mt-1">Track your performance in virtual lab quizzes</p>
                    </div>
                    {/* <Button className="bg-indigo-600 hover:bg-indigo-700">Download Report</Button> */}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Average Score</p>
                                <h3 className="text-2xl font-bold text-slate-800">{avgScore}%</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Attempts</p>
                                <h3 className="text-2xl font-bold text-slate-800">{totalAttempts}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 bg-green-50 text-green-600 rounded-full">
                                <Beaker className="h-6 w-6" /> {/* Beaker icon needs import from lucide-react? No, assume available */}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Experiments Covered</p>
                                <h3 className="text-2xl font-bold text-slate-800">{uniqueExperiments}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-4 text-lg font-semibold text-slate-800">Recent Activity</div>

                {attempts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No quizzes attempted yet. Start an experiment to take a quiz!</p>
                        <Button onClick={() => navigate('/student/experiments')} variant="link" className="mt-2 text-indigo-600">
                            View Experiments
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attempts.map((attempt) => (
                            <Card key={attempt._id} className="hover:shadow-md transition-shadow cursor-default">
                                <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">
                                                {attempt.subject}
                                            </Badge>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(attempt.attemptedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">{attempt.experimentName}</h3>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Score</span>
                                            <span className={`text-xl font-bold ${(attempt.score / attempt.totalQuestions) >= 0.7 ? 'text-green-600' : 'text-orange-500'}`}>
                                                {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Questions</span>
                                            <span className="text-lg font-semibold text-slate-700">
                                                {attempt.score}/{attempt.totalQuestions}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

// Simple Beaker Icon locally since I missed importing it in the component top-level code block above
const Beaker = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4.5 3h15" />
      <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
      <path d="M6 14h12" />
    </svg>
);

export default ExperimentAnalytics;
