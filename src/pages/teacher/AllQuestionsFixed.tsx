import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, ChevronDown, ChevronUp, Search, Upload } from 'lucide-react';

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
  hint?: { text?: string; image?: string; video?: string };
}

const emptyQuestion = {
  subject: '',
  class: '',
  topic: '',
  question: '',
  optionsText: '',
  correctAnswer: '',
  hintText: '',
};

const sampleJson = `[
  {
    "subject": "Mathematics",
    "class": "8",
    "topic": "Algebra",
    "question": "What is the value of x if x + 5 = 12?",
    "options": ["5", "6", "7", "8"],
    "correctAnswer": "7",
    "hint": { "text": "Subtract 5 from both sides." }
  }
]`;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const AllQuestionsFixed: React.FC = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [manualQuestion, setManualQuestion] = useState(emptyQuestion);
  const [jsonText, setJsonText] = useState(sampleJson);
  const [saving, setSaving] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/questions`);
      setQuestions(Array.isArray(response.data) ? response.data : []);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to fetch questions'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return questions;
    return questions.filter((question) =>
      [question.question, question.topic, question.subject, question.class]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value))
    );
  }, [questions, search]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Record<string, Question[]>>>((acc, question) => {
      const subject = question.subject || 'Unassigned';
      const topic = question.topic || 'General';
      if (!acc[subject]) acc[subject] = {};
      if (!acc[subject][topic]) acc[subject][topic] = [];
      acc[subject][topic].push(question);
      return acc;
    }, {});
  }, [filtered]);

  const handleManualSubmit = async () => {
    const options = manualQuestion.optionsText
      .split('\n')
      .map((option) => option.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      await axios.post(`${API_URL}/questions`, {
        subject: manualQuestion.subject,
        class: manualQuestion.class,
        topic: manualQuestion.topic,
        question: manualQuestion.question,
        options,
        correctAnswer: manualQuestion.correctAnswer,
        hint: { text: manualQuestion.hintText },
      });
      toast({ title: 'Question added', description: 'The question was saved to the question bank.' });
      setManualQuestion(emptyQuestion);
      fetchQuestions();
    } catch (error: unknown) {
      toast({
        title: 'Save failed',
        description: getErrorMessage(error, 'Could not save question'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleJsonUpload = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(jsonText);
      const questionsToUpload = Array.isArray(parsed) ? parsed : [parsed];
      const response = await axios.post(`${API_URL}/questions/bulk`, { questions: questionsToUpload });
      const failedCount = response.data.failed?.length || 0;
      toast({
        title: 'Upload complete',
        description: `${response.data.saved?.length || 0} saved${failedCount ? `, ${failedCount} failed` : ''}.`,
      });
      fetchQuestions();
    } catch (error: unknown) {
      toast({
        title: 'Upload failed',
        description: getErrorMessage(error, 'Invalid JSON'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const subjects = Object.keys(grouped).sort();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-6 md:py-8">
        <div className="edu-container">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Question Bank</h1>
            <p className="mt-1 text-muted-foreground">View, create, and upload synced questions.</p>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Question Manually</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Subject</Label>
                    <Input value={manualQuestion.subject} onChange={(event) => setManualQuestion((prev) => ({ ...prev, subject: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Class</Label>
                    <Input value={manualQuestion.class} onChange={(event) => setManualQuestion((prev) => ({ ...prev, class: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Topic</Label>
                    <Input value={manualQuestion.topic} onChange={(event) => setManualQuestion((prev) => ({ ...prev, topic: event.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Question</Label>
                  <Textarea value={manualQuestion.question} onChange={(event) => setManualQuestion((prev) => ({ ...prev, question: event.target.value }))} />
                </div>
                <div>
                  <Label>Options, one per line</Label>
                  <Textarea value={manualQuestion.optionsText} onChange={(event) => setManualQuestion((prev) => ({ ...prev, optionsText: event.target.value }))} />
                </div>
                <div>
                  <Label>Correct Answer</Label>
                  <Input value={manualQuestion.correctAnswer} onChange={(event) => setManualQuestion((prev) => ({ ...prev, correctAnswer: event.target.value }))} />
                </div>
                <div>
                  <Label>Hint</Label>
                  <Input value={manualQuestion.hintText} onChange={(event) => setManualQuestion((prev) => ({ ...prev, hintText: event.target.value }))} />
                </div>
                <Button onClick={handleManualSubmit} disabled={saving}>
                  Add Question
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload JSON</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={jsonText} onChange={(event) => setJsonText(event.target.value)} className="min-h-[292px] font-mono text-xs" />
                <Button onClick={handleJsonUpload} disabled={saving}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload JSON
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions, topics, subjects..." className="pl-10" />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">Loading questions...</CardContent>
            </Card>
          ) : subjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">No questions found</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{filtered.length} questions in {subjects.length} subjects</p>
              {subjects.map((subject) => {
                const topics = Object.keys(grouped[subject]).sort();
                const isSubjectOpen = expandedSubject === subject;
                return (
                  <Card key={subject}>
                    <button onClick={() => setExpandedSubject(isSubjectOpen ? null : subject)} className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50">
                      <span className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">{subject}</span>
                        <span className="text-sm text-muted-foreground">{topics.length} topics</span>
                      </span>
                      {isSubjectOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {isSubjectOpen && (
                      <div className="space-y-3 border-t bg-gray-50/50 px-6 py-4">
                        {topics.map((topic) => {
                          const topicKey = `${subject}:${topic}`;
                          const isTopicOpen = expandedTopic === topicKey;
                          return (
                            <div key={topicKey}>
                              <button onClick={() => setExpandedTopic(isTopicOpen ? null : topicKey)} className="flex w-full items-center justify-between rounded-md border bg-white px-4 py-2 text-left">
                                <span>{topic} <span className="text-sm text-muted-foreground">({grouped[subject][topic].length})</span></span>
                                {isTopicOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                              {isTopicOpen && (
                                <div className="mt-2 space-y-2">
                                  {grouped[subject][topic].map((question) => {
                                    const isOpen = expandedQuestion === question._id;
                                    return (
                                      <Card key={question._id} className="border-l-4 border-l-blue-300">
                                        <button onClick={() => setExpandedQuestion(isOpen ? null : question._id)} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left">
                                          <span>
                                            <span className="mb-1 inline-block rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">Class {question.class}</span>
                                            <span className="block font-medium">{question.question}</span>
                                          </span>
                                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                        {isOpen && (
                                          <CardContent className="border-t pt-3">
                                            <div className="grid gap-2 sm:grid-cols-2">
                                              {question.options.map((option, index) => (
                                                <div key={index} className={`rounded border px-3 py-2 text-sm ${option === question.correctAnswer ? 'border-green-400 bg-green-50 font-medium text-green-800' : 'bg-gray-50'}`}>
                                                  {index + 1}. {option}
                                                </div>
                                              ))}
                                            </div>
                                            {question.hint?.text && <p className="mt-3 rounded bg-yellow-50 px-3 py-2 text-sm text-gray-700">{question.hint.text}</p>}
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

export default AllQuestionsFixed;
