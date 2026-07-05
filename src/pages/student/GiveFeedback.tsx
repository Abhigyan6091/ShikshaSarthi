import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2, FileText, Send, Info } from 'lucide-react';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/session';

const API_URL = import.meta.env.VITE_API_URL;

interface Option { _id: string; optionText: string; }
interface Question { _id: string; questionText: string; options: Option[]; }
interface FeedbackForm {
  _id: string;
  formId: string;
  title: string;
  startTime: string;
  endTime: string;
  questions: Question[];
}

const StudentGiveFeedback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = useMemo(() => getCurrentUser(), []);
  const studentId = user?.studentId || user?.id || user?._id || '';
  const schoolId = user?.schoolId || '';

  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<FeedbackForm | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchForms = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/feedback-forms/school/${schoolId}`);
        const all: FeedbackForm[] = response.data.forms || response.data || [];
        const now = Date.now();
        // Only show forms that are currently active.
        setForms(all.filter((f) => new Date(f.startTime).getTime() <= now && now <= new Date(f.endTime).getTime()));
      } catch (error) {
        console.error('Error fetching feedback forms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [schoolId]);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    const unanswered = selectedForm.questions.filter((q) => answers[q._id] === undefined);
    if (unanswered.length > 0) {
      toast({ title: 'Please answer all questions', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = selectedForm.questions.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id],
      }));

      const res = await axios.post(`${API_URL}/api/feedback-responses/submit-student`, {
        formId: selectedForm.formId,
        studentId,
        answers: formattedAnswers,
      });

      toast({
        title: 'Feedback submitted',
        description: res.data?.message || 'Your feedback has been sent to your school administrator.',
      });
      setSelectedForm(null);
      setAnswers({});
      setForms((prev) => prev.filter((f) => f.formId !== selectedForm.formId));
    } catch (error: any) {
      toast({
        title: 'Could not submit',
        description: error.response?.data?.message || 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {/* Destination banner — makes clear where the feedback goes. */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-900">
            Your feedback is anonymous to other students and is sent directly to your
            <strong> school administrator</strong>. They use it to improve teaching and facilities.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Loading feedback forms…</p>
          </div>
        ) : !schoolId ? (
          <p className="text-center text-gray-600 py-16">We couldn't find your school. Please log out and log in again.</p>
        ) : selectedForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> {selectedForm.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {selectedForm.questions.map((q, qi) => (
                  <div key={q._id} className="space-y-2">
                    <p className="font-medium">{qi + 1}. {q.questionText}</p>
                    <RadioGroup
                      value={answers[q._id] !== undefined ? String(answers[q._id]) : ''}
                      onValueChange={(v) => handleAnswerChange(q._id, Number(v))}
                    >
                      {q.options.map((opt, oi) => (
                        <div key={opt._id || oi} className="flex items-center gap-2">
                          <RadioGroupItem value={String(oi)} id={`${q._id}-${oi}`} />
                          <Label htmlFor={`${q._id}-${oi}`}>{opt.optionText}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Submit feedback
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedForm(null)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : forms.length === 0 ? (
          <p className="text-center text-gray-600 py-16">No feedback forms are active right now. Check back later.</p>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <Card key={form.formId} className="hover:border-blue-300 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{form.title}</p>
                    <p className="text-sm text-gray-500">Open until {new Date(form.endTime).toLocaleString()}</p>
                  </div>
                  <Button onClick={() => { setSelectedForm(form); setAnswers({}); }}>Give feedback</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGiveFeedback;
