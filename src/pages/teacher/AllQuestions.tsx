import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  _id: string;
  subject: string;
  class: string;
  topic: string;
  question: string;
  questionImage?: string;
  options: string[];
  correctAnswer: string;
  hint?: {
    text?: string;
    image?: string;
    video?: string;
  };
}

interface GroupedData {
  [subject: string]: {
    [topic: string]: Question[];
  };
}

const AllQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_URL}/questions`);
        if (!res.ok) throw new Error('Failed to fetch questions');
        const data = await res.json();
        setQuestions(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return questions;
    const s = search.toLowerCase();
    return questions.filter(q =>
      q.question.toLowerCase().includes(s) ||
      q.topic.toLowerCase().includes(s) ||
      q.subject.toLowerCase().includes(s)
    );
  }, [questions, search]);

  const grouped = useMemo(() => {
    const map: GroupedData = {};
    for (const q of filtered) {
      if (!map[q.subject]) map[q.subject] = {};
      if (!map[q.subject][q.topic]) map[q.subject][q.topic] = [];
      map[q.subject][q.topic].push(q);
    }
    const sorted: GroupedData = {};
    for (const subj of Object.keys(map).sort()) {
      const topics = Object.keys(map[subj]).sort();
      sorted[subj] = {};
      for (const topic of topics) {
        sorted[subj][topic] = map[subj][topic];
      }
    }
    return sorted;
  }, [filtered]);

  const subjects = Object.keys(grouped);

  const toggleSubject = (s: string) => {
    setExpandedSubject(expandedSubject === s ? null : s);
    setExpandedTopic(null);
    setExpandedQuestion(null);
  };

  const toggleTopic = (key: string) => {
    setExpandedTopic(expandedTopic === key ? null : key);
    setExpandedQuestion(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 md:py-8 bg-gray-50">
        <div className="edu-container">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Questions</h1>
            <p className="text-muted-foreground mt-1">View all questions grouped by subject and topic (read-only)</p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions, topics, subjects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading questions...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-red-500">
                  <p>Error: {error}</p>
                  <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
                </div>
              </CardContent>
            </Card>
          ) : subjects.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p>No questions found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {filtered.length} question{filtered.length !== 1 ? 's' : ''} in {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
              </p>
              {subjects.map((subject) => {
                const topics = Object.keys(grouped[subject]);
                const topicCount = topics.length;
                const qCount = topics.reduce((sum, t) => sum + grouped[subject][t].length, 0);
                const isSubjOpen = expandedSubject === subject;

                return (
                  <Card key={subject} className="overflow-hidden">
                    <button
                      onClick={() => toggleSubject(subject)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                          <span className="font-semibold text-gray-900">{subject}</span>
                          <span className="ml-3 text-sm text-muted-foreground">
                            {topicCount} topic{topicCount !== 1 ? 's' : ''} · {qCount} question{qCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      {isSubjOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </button>

                    {isSubjOpen && (
                      <div className="border-t px-6 py-4 space-y-3 bg-gray-50/50">
                        {topics.map((topic) => {
                          const questionsInTopic = grouped[subject][topic];
                          const topicKey = `${subject}::${topic}`;
                          const isTopicOpen = expandedTopic === topicKey;

                          return (
                            <div key={topicKey}>
                              <button
                                onClick={() => toggleTopic(topicKey)}
                                className="w-full text-left px-4 py-2.5 flex items-center justify-between bg-white rounded-lg border hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                    {topic}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {questionsInTopic.length} question{questionsInTopic.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                {isTopicOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                              </button>

                              {isTopicOpen && (
                                <div className="mt-2 space-y-2 ml-2">
                                  {questionsInTopic.map((q) => {
                                    const isQOpen = expandedQuestion === q._id;
                                    return (
                                      <Card key={q._id} className="border-l-4 border-l-blue-300">
                                        <CardHeader className="py-3 px-4">
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                  Class {q.class}
                                                </span>
                                              </div>
                                              <p className="text-sm font-medium text-gray-900">{q.question}</p>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setExpandedQuestion(isQOpen ? null : q._id)}
                                              className="shrink-0"
                                            >
                                              {isQOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                          </div>
                                        </CardHeader>
                                        {isQOpen && (
                                          <CardContent className="pt-0 pb-3 px-4 border-t">
                                            <div className="mt-3 space-y-3">
                                              <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Options:</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                  {q.options.map((opt, idx) => (
                                                    <div
                                                      key={idx}
                                                      className={`px-3 py-2 rounded-md text-sm border ${
                                                        opt === q.correctAnswer
                                                          ? 'border-green-400 bg-green-50 text-green-800 font-medium'
                                                          : 'border-gray-200 bg-gray-50'
                                                      }`}
                                                    >
                                                      <span className="text-xs text-gray-400 mr-2">{idx + 1}.</span>
                                                      {opt}
                                                      {opt === q.correctAnswer && (
                                                        <span className="ml-2 text-xs text-green-600 font-bold">✓ Correct</span>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                              {q.questionImage && (
                                                <div>
                                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question Image:</p>
                                                  <img src={q.questionImage} alt="Question" className="max-h-48 rounded border" />
                                                </div>
                                              )}
                                              {q.hint?.text && (
                                                <div>
                                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hint:</p>
                                                  <p className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-md border border-yellow-200">
                                                    {q.hint.text}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </CardContent>
                                        )}
                                      </Card>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllQuestions;
