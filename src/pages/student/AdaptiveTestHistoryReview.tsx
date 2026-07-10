import axios from 'axios';
import { AlertCircle, ArrowLeft, Languages, Trophy } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdaptiveReviewList, { AdaptiveReviewItem } from '@/components/AdaptiveReviewList';

const API_URL = import.meta.env.VITE_API_URL;

type Attempt = {
  className?: string;
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  correct: number;
  incorrect: number;
  total: number;
  weakTopics?: string[];
  completedAt?: string;
  answers: AdaptiveReviewItem[];
};

// Opened from the Adaptive Test History list on the student dashboard — shows
// the same review-answers paper (with hints + explanations) the student saw
// right after submitting, for any past attempt.
const AdaptiveTestHistoryReview: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'hi');
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const studentId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('student') || '{}')?.student?.studentId || '';
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLanguage(detail?.language || localStorage.getItem('appLanguage') || 'hi');
    };
    window.addEventListener('appLanguageChanged', handleLanguageChange);
    return () => window.removeEventListener('appLanguageChanged', handleLanguageChange);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!studentId || !attemptId) {
        setError('Missing student or attempt reference.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/quizzes/adaptive-test/attempt/${studentId}/${attemptId}`);
        setAttempt(res.data.attempt);
      } catch (loadError) {
        console.error(loadError);
        setError('Could not load this test attempt.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, attemptId]);

  const isHindi = language === 'hi';
  const toggleLanguage = () => {
    const nextLanguage = isHindi ? 'en' : 'hi';
    setLanguage(nextLanguage);
    localStorage.setItem('appLanguage', nextLanguage);
    window.dispatchEvent(new CustomEvent('appLanguageChanged', { detail: { language: nextLanguage } }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md text-center">
            <CardHeader>
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <CardTitle>{isHindi ? 'लोड नहीं हो सका' : 'Could not load attempt'}</CardTitle>
              <CardDescription>{error || 'Unknown error'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/student/dashboard">
                <Button variant="outline">{isHindi ? 'डैशबोर्ड पर वापस' : 'Back to Dashboard'}</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const accuracy = attempt.total > 0 ? Math.round((attempt.correct / attempt.total) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-6 md:py-8">
        <div className="mx-auto max-w-5xl px-4 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              {isHindi ? 'डैशबोर्ड' : 'Dashboard'}
            </Link>
            <Button type="button" variant="outline" size="sm" onClick={toggleLanguage} className="gap-2">
              <Languages className="h-4 w-4" />
              {isHindi ? 'English' : 'हिंदी'}
            </Button>
          </div>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
              <CardTitle className="text-2xl">
                {isHindi ? 'अनुकूली परीक्षण समीक्षा' : 'Adaptive Test Review'}
              </CardTitle>
              <CardDescription>
                {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                {attempt.className ? ` · ${isHindi ? 'कक्षा' : 'Class'} ${attempt.className}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-sm text-green-700">{isHindi ? 'सही' : 'Correct'}</p>
                  <p className="text-3xl font-bold text-green-700">{attempt.correct}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <p className="text-sm text-red-700">{isHindi ? 'गलत' : 'Incorrect'}</p>
                  <p className="text-3xl font-bold text-red-700">{attempt.incorrect}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <p className="text-sm text-blue-700">{isHindi ? 'सटीकता' : 'Accuracy'}</p>
                  <p className="text-3xl font-bold text-blue-700">{accuracy}%</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-4 text-center">
                  <p className="text-sm text-slate-700">{isHindi ? 'रेटिंग बदलाव' : 'Rating Change'}</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {attempt.ratingChange >= 0 ? '+' : ''}{attempt.ratingChange}
                  </p>
                </div>
              </div>
              {attempt.weakTopics && attempt.weakTopics.length > 0 && (
                <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <p className="text-sm font-semibold text-orange-800 mb-2">{isHindi ? 'कमज़ोर टॉपिक:' : 'Weak Topics:'}</p>
                  <div className="flex flex-wrap gap-2">
                    {attempt.weakTopics.map((topic) => (
                      <Badge key={topic} variant="outline" className="border-orange-400 text-orange-700">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isHindi ? 'उत्तर समीक्षा' : 'Review Answers'}</CardTitle>
              <CardDescription>
                {isHindi ? 'सही उत्तर, हिंट, व्याख्या और रेटिंग बदलाव देखें।' : 'Check the correct answers, hints, explanations, and rating movement.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdaptiveReviewList items={attempt.answers || []} isHindi={isHindi} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdaptiveTestHistoryReview;
