import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ArrowLeft, FileText, Loader2, Search, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL;

interface FeedbackOption {
  _id?: string;
  optionText: string;
}

interface FeedbackQuestion {
  _id: string;
  questionText: string;
  options: FeedbackOption[];
}

interface FeedbackForm {
  _id: string;
  formId: string;
  title: string;
  startTime: string;
  endTime: string;
  questions: FeedbackQuestion[];
}

const unwrapTeacher = (raw: string | null) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.teacher || parsed;
  } catch {
    return null;
  }
};

const resolveTeacherId = () => {
  const fromCookie = unwrapTeacher(Cookies.get('teacher') || null);
  const fromTeacherStorage = unwrapTeacher(localStorage.getItem('teacher'));
  const fromCurrentUser = unwrapTeacher(localStorage.getItem('currentUser'));
  const teacher = fromCookie || fromTeacherStorage || fromCurrentUser;
  return teacher?.teacherId || '';
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const GiveFeedbackFixed: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<FeedbackForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [teacherId, setTeacherId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAvailableForms = useCallback(async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/feedback-forms/available/${id}`);
      setForms(Array.isArray(response.data.forms) ? response.data.forms : []);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to fetch available forms'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const id = resolveTeacherId();
    if (!id) {
      setLoading(false);
      toast({ title: 'Error', description: 'Teacher information not found', variant: 'destructive' });
      return;
    }
    setTeacherId(id);
    fetchAvailableForms(id);
  }, [fetchAvailableForms, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedForm) return;

    const unanswered = selectedForm.questions.filter((question) => answers[question._id] === undefined);
    if (unanswered.length) {
      toast({ title: 'Incomplete feedback', description: 'Please answer all questions before submitting.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/feedback-responses/submit`, {
        formId: selectedForm.formId,
        teacherId,
        answers: selectedForm.questions.map((question) => ({
          questionId: question._id,
          selectedOption: answers[question._id],
        })),
      });

      toast({ title: 'Feedback submitted', description: 'Thank you for your feedback.' });
      setSelectedForm(null);
      setAnswers({});
      fetchAvailableForms(teacherId);
    } catch (error: unknown) {
      toast({
        title: 'Submit failed',
        description: getErrorMessage(error, 'Failed to submit feedback'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredForms = forms.filter((form) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return form.formId.toLowerCase().includes(search) || form.title.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/teacher')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Give Feedback</h1>
        <p className="mb-6 text-gray-600">Select a form and provide your feedback</p>

        {!selectedForm ? (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by form ID or title"
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {filteredForms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                  <p className="text-lg text-gray-600">No feedback forms available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredForms.map((form) => (
                  <Card key={form.formId} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedForm(form)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-3">
                        <span>{form.title}</span>
                        <span className="rounded bg-blue-50 px-2 py-1 font-mono text-xs text-blue-700">{form.formId}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{form.questions.length} questions</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{selectedForm.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedForm.questions.map((question, index) => (
                  <div key={question._id} className="rounded-lg border p-4">
                    <p className="mb-3 font-medium">
                      {index + 1}. {question.questionText}
                    </p>
                    <RadioGroup
                      value={answers[question._id]?.toString() || ''}
                      onValueChange={(value) => setAnswers((prev) => ({ ...prev, [question._id]: Number(value) }))}
                    >
                      {question.options.map((option, optionIndex) => (
                        <div key={option._id || optionIndex} className="flex items-center space-x-2 py-1">
                          <RadioGroupItem value={optionIndex.toString()} id={`${question._id}-${optionIndex}`} />
                          <Label htmlFor={`${question._id}-${optionIndex}`}>{option.optionText}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => setSelectedForm(null)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default GiveFeedbackFixed;
