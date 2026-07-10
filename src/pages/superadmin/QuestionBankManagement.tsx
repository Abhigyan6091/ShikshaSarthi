import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  _id: string;
  class?: string;
  subject?: string;
  topic?: string;
  question?: string;
  questionHindi?: string;
  options?: string[];
  correctAnswer?: string;
}

const enc = (value: string) => encodeURIComponent(value || 'Unassigned');

const SuperadminQuestionBankManagement: React.FC = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/questions`);
      setQuestions(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      toast({ title: 'Could not load question bank', description: error?.response?.data?.error || error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return questions;
    return questions.filter((question) =>
      [question.class, question.subject, question.topic, question.question, question.questionHindi]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [questions, query]);

  const grouped = useMemo(() => {
    const next: Record<string, Record<string, Record<string, Question[]>>> = {};
    filtered.forEach((question) => {
      const className = question.class || 'Unassigned';
      const subject = question.subject || 'Unassigned';
      const topic = question.topic || 'Unassigned';
      next[className] = next[className] || {};
      next[className][subject] = next[className][subject] || {};
      next[className][subject][topic] = next[className][subject][topic] || [];
      next[className][subject][topic].push(question);
    });
    return next;
  }, [filtered]);

  const deleteQuestion = async (question: Question) => {
    if (!window.confirm('Delete this question from the synced question bank?')) return;
    await axios.delete(`${API_URL}/questions/${question._id}`);
    toast({ title: 'Question deleted', description: 'The deletion will sync as a tombstone.' });
    fetchQuestions();
  };

  const deleteTopic = async (className: string, subject: string, topic: string) => {
    if (!window.confirm(`Delete all questions in ${className} / ${subject} / ${topic}?`)) return;
    const response = await axios.delete(`${API_URL}/questions/topic/${enc(className)}/${enc(subject)}/${enc(topic)}`);
    toast({ title: 'Topic deleted', description: `${response.data?.modifiedCount || 0} questions marked deleted.` });
    fetchQuestions();
  };

  const deleteSubject = async (className: string, subject: string) => {
    if (!window.confirm(`Delete all questions in ${className} / ${subject}?`)) return;
    const response = await axios.delete(`${API_URL}/questions/subject/${enc(className)}/${enc(subject)}`);
    toast({ title: 'Subject deleted', description: `${response.data?.modifiedCount || 0} questions marked deleted.` });
    fetchQuestions();
  };

  const countClassQuestions = (className: string) =>
    Object.values(grouped[className] || {}).reduce(
      (subjectTotal, topics) => subjectTotal + Object.values(topics).reduce((topicTotal, items) => topicTotal + items.length, 0),
      0
    );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="edu-container">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link to="/superadmin">
                <Button variant="ghost" size="sm" className="mb-2 px-0">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Superadmin Question Bank</h1>
              <p className="text-muted-foreground">View and delete synced questions, topics, and subjects.</p>
            </div>
            <Badge variant="outline" className="w-fit">{filtered.length} questions</Badge>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by class, subject, topic, or text" className="pl-10" />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card><CardContent className="py-12 text-center">Loading question bank...</CardContent></Card>
          ) : Object.keys(grouped).length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No questions found.</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map((className) => {
                const isClassOpen = expandedClass === className;
                return (
                  <Card key={className}>
                    <button onClick={() => setExpandedClass(isClassOpen ? null : className)} className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50">
                      <span className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Class {className}</span>
                        <span className="text-sm text-muted-foreground">{Object.keys(grouped[className]).length} subjects • {countClassQuestions(className)} questions</span>
                      </span>
                      {isClassOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {isClassOpen && (
                      <CardContent className="space-y-3 border-t bg-gray-50/50 pt-4">
                        {Object.keys(grouped[className]).sort().map((subject) => {
                          const subjectKey = `${className}:${subject}`;
                          const isSubjectOpen = expandedSubject === subjectKey;
                          return (
                            <section key={subjectKey} className="rounded-md border bg-white">
                              <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                                <button onClick={() => setExpandedSubject(isSubjectOpen ? null : subjectKey)} className="flex flex-1 items-center justify-between text-left">
                                  <span>
                                    <span className="font-semibold">{subject}</span>
                                    <span className="ml-2 text-sm text-muted-foreground">{Object.keys(grouped[className][subject]).length} topics</span>
                                  </span>
                                  {isSubjectOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => deleteSubject(className, subject)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete subject
                                </Button>
                              </div>
                              {isSubjectOpen && (
                                <div className="space-y-2 border-t p-3">
                                  {Object.keys(grouped[className][subject]).sort().map((topic) => {
                                    const topicKey = `${className}:${subject}:${topic}`;
                                    const isTopicOpen = expandedTopic === topicKey;
                                    return (
                                      <div key={topicKey} className="rounded-md border bg-gray-50">
                                        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                                          <button onClick={() => setExpandedTopic(isTopicOpen ? null : topicKey)} className="flex flex-1 items-center justify-between text-left">
                                            <span className="font-medium">{topic} <span className="text-sm text-muted-foreground">({grouped[className][subject][topic].length})</span></span>
                                            {isTopicOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                          </button>
                                          <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => deleteTopic(className, subject, topic)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete topic
                                          </Button>
                                        </div>
                                        {isTopicOpen && (
                                          <div className="space-y-2 border-t p-3">
                                            {grouped[className][subject][topic].map((question) => (
                                              <div key={question._id} className="flex flex-col gap-2 rounded border bg-white p-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                  <p className="font-medium">{question.question || 'Question'}</p>
                                                  {question.questionHindi && question.questionHindi !== 'NA' && (
                                                    <p className="mt-1 text-sm text-muted-foreground">{question.questionHindi}</p>
                                                  )}
                                                  <p className="mt-1 text-xs text-muted-foreground">Answer: {question.correctAnswer || 'N/A'}</p>
                                                </div>
                                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => deleteQuestion(question)}>
                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                  Delete
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </section>
                          );
                        })}
                      </CardContent>
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

export default SuperadminQuestionBankManagement;
