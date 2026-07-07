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
import TagSelect from '@/components/TagSelect';
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

const LETTERS = ['A', 'B', 'C', 'D'];

const emptyQuestion = {
  subject: '',
  class: '',
  topic: '',
  question: '',
  questionHindi: '',
  options: ['', '', '', ''],
  optionsHindi: ['', '', '', ''],
  correctIndex: -1,
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
  const [manualTopics, setManualTopics] = useState<string[]>([]);

  // Existing subjects/classes are derived from the already-loaded question bank.
  const bankSubjects = useMemo(
    () => [...new Set(questions.map((q) => q.subject).filter(Boolean))].sort(),
    [questions]
  );
  const bankClasses = useMemo(
    () => [...new Set(questions.map((q) => q.class).filter(Boolean))].sort(),
    [questions]
  );

  // Topics for the chosen subject, from the bank endpoint.
  useEffect(() => {
    const subject = manualQuestion.subject?.trim();
    if (!subject) { setManualTopics([]); return; }
    axios
      .get(`${API_URL}/questions/all/topics/${encodeURIComponent(subject)}`)
      .then((res) => setManualTopics((res.data?.topics || []).filter(Boolean).sort()))
      .catch(() => setManualTopics([]));
  }, [manualQuestion.subject]);

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
    const options = manualQuestion.options.map((o) => o.trim());
    if (!manualQuestion.subject || !manualQuestion.topic || !manualQuestion.question) {
      toast({ title: 'Missing details', description: 'Subject, topic and question are required.', variant: 'destructive' });
      return;
    }
    if (options.some((o) => !o)) {
      toast({ title: 'Fill all options', description: 'Please fill options A–D.', variant: 'destructive' });
      return;
    }
    if (manualQuestion.correctIndex < 0) {
      toast({ title: 'Select the correct answer', description: 'Choose which option (A–D) is correct.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_URL}/questions`, {
        subject: manualQuestion.subject,
        class: manualQuestion.class,
        topic: manualQuestion.topic,
        question: manualQuestion.question,
        questionHindi: manualQuestion.questionHindi.trim() || 'NA',
        options,
        optionsHindi: manualQuestion.optionsHindi.map((o) => o.trim() || 'NA'),
        correctAnswer: options[manualQuestion.correctIndex],
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
                  <TagSelect label="Subject" options={bankSubjects} value={manualQuestion.subject} onChange={(v) => setManualQuestion((prev) => ({ ...prev, subject: v, topic: '' }))} />
                  <TagSelect label="Class" options={bankClasses} value={manualQuestion.class} onChange={(v) => setManualQuestion((prev) => ({ ...prev, class: v }))} />
                  <TagSelect label="Topic" options={manualTopics} value={manualQuestion.topic} onChange={(v) => setManualQuestion((prev) => ({ ...prev, topic: v }))} disabled={!manualQuestion.subject} emptyHint="Pick a subject first" />
                </div>
                <div>
                  <Label>Question</Label>
                  <Textarea value={manualQuestion.question} onChange={(event) => setManualQuestion((prev) => ({ ...prev, question: event.target.value }))} />
                </div>
                <div>
                  <Label>Question — हिंदी <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Textarea value={manualQuestion.questionHindi} placeholder="प्रश्न (वैकल्पिक)" onChange={(event) => setManualQuestion((prev) => ({ ...prev, questionHindi: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Options <span className="text-gray-400 font-normal">(Hindi optional)</span></Label>
                  {manualQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center font-semibold text-gray-600">{LETTERS[idx]}</span>
                      <Input
                        value={opt}
                        placeholder={`Option ${LETTERS[idx]}`}
                        onChange={(event) => setManualQuestion((prev) => {
                          const options = [...prev.options];
                          options[idx] = event.target.value;
                          return { ...prev, options };
                        })}
                      />
                      <Input
                        value={manualQuestion.optionsHindi[idx]}
                        placeholder={`विकल्प ${LETTERS[idx]} (हिंदी)`}
                        onChange={(event) => setManualQuestion((prev) => {
                          const optionsHindi = [...prev.optionsHindi];
                          optionsHindi[idx] = event.target.value;
                          return { ...prev, optionsHindi };
                        })}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Correct Answer</Label>
                  <select
                    value={manualQuestion.correctIndex}
                    onChange={(event) => setManualQuestion((prev) => ({ ...prev, correctIndex: Number(event.target.value) }))}
                    className="w-full rounded-md border p-2 bg-white"
                  >
                    <option value={-1}>Choose correct option…</option>
                    {manualQuestion.options.map((opt, idx) => (
                      <option key={idx} value={idx}>{LETTERS[idx]}{opt ? ` — ${opt}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Hint (optional)</Label>
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
