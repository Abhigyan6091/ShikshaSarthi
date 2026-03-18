import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2, FileText, Send, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface Option {
  _id: string;
  optionText: string;
}

interface Question {
  _id: string;
  questionText: string;
  options: Option[];
}

interface FeedbackForm {
  _id: string;
  formId: string;
  title: string;
  startTime: string;
  endTime: string;
  questions: Question[];
}

interface TeacherCookieData {
  teacherId?: string;
  schoolId?: string;
  teacher?: {
    teacherId?: string;
    schoolId?: string;
  };
}

const GiveFeedback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<FeedbackForm | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getTeacherInfoFromCookie = (): { teacherId: string; schoolId: string } | null => {
    const teacherCookie = Cookies.get('teacher');
    if (!teacherCookie) {
      return null;
    }

    try {
      const parsedTeacher = JSON.parse(teacherCookie) as TeacherCookieData;
      const teacherInfo = parsedTeacher.teacher ?? parsedTeacher;
      const resolvedTeacherId = teacherInfo.teacherId?.trim() || '';
      const resolvedSchoolId = teacherInfo.schoolId?.trim() || '';

      if (!resolvedTeacherId) {
        return null;
      }

      return {
        teacherId: resolvedTeacherId,
        schoolId: resolvedSchoolId
      };
    } catch (error) {
      console.error('Error parsing teacher cookie:', error);
      return null;
    }
  };

  useEffect(() => {
    const teacherInfo = getTeacherInfoFromCookie();
    if (!teacherInfo) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to load teacher information',
        variant: 'destructive'
      });
      return;
    }

    setTeacherId(teacherInfo.teacherId);
    fetchAvailableForms(teacherInfo.teacherId);
  }, []);

  const fetchAvailableForms = async (tid: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/feedback-forms/available/${tid}`);
      setForms(response.data.forms);
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available forms',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSelect = (form: FeedbackForm) => {
    setSelectedForm(form);
    setAnswers({});
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredForms = forms.filter((form) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return true;
    }

    return (
      form.formId.toLowerCase().includes(normalizedSearch) ||
      form.title.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedForm) {
      return;
    }

    // Check if all questions are answered
    const unansweredQuestions = selectedForm.questions.filter(
      (q) => answers[q._id] === undefined
    );

    if (unansweredQuestions.length > 0) {
      toast({
        title: 'Error',
        description: 'Please answer all questions before submitting',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = selectedForm.questions.map((question) => ({
        questionId: question._id,
        selectedOption: answers[question._id]
      }));

      await axios.post(`${API_URL}/api/feedback-responses/submit`, {
        formId: selectedForm.formId,
        teacherId,
        answers: formattedAnswers
      });

      toast({
        title: 'Success!',
        description: 'Feedback submitted successfully',
        variant: 'default'
      });

      // Refresh available forms
      fetchAvailableForms(teacherId);
      setSelectedForm(null);
      setAnswers({});
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit feedback',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading available forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/teacher')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Give Feedback</h1>
        <p className="text-gray-600 mb-6">Select a form and provide your feedback</p>

        {!selectedForm ? (
          <div>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search available forms by form ID or title"
                    className="pl-10"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Search by form ID to quickly open the correct feedback form.
                </p>
              </CardContent>
            </Card>

            {forms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg text-gray-600 mb-2">No feedback forms available</p>
                  <p className="text-sm text-gray-500">
                    Either you have already submitted all available forms, or no forms have been created yet.
                  </p>
                </CardContent>
              </Card>
            ) : filteredForms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg text-gray-600 mb-2">No matching feedback forms</p>
                  <p className="text-sm text-gray-500">
                    Try another form ID or clear the search to see all forms from your school.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredForms.map((form) => (
                  <Card
                    key={form.formId}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-400"
                    onClick={() => handleFormSelect(form)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{form.title}</h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Form ID: {form.formId}</span>
                            <span>{form.questions.length} questions</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500 space-y-1">
                            <p>Available from: {formatDateTime(form.startTime)}</p>
                            <p>Available until: {formatDateTime(form.endTime)}</p>
                          </div>
                        </div>
                        <Button>Start</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{selectedForm.title}</CardTitle>
              <p className="text-sm text-gray-600">Form ID: {selectedForm.formId}</p>
              <p className="text-sm text-gray-600">
                Valid from {formatDateTime(selectedForm.startTime)} to {formatDateTime(selectedForm.endTime)}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {selectedForm.questions.map((question, index) => (
                  <Card key={question._id} className="p-4">
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        {index + 1}. {question.questionText}
                      </Label>

                      <RadioGroup
                        value={answers[question._id]?.toString()}
                        onValueChange={(value) =>
                          handleAnswerChange(question._id, parseInt(value))
                        }
                      >
                        <div className="space-y-3 ml-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <RadioGroupItem
                                value={optionIndex.toString()}
                                id={`${question._id}-${optionIndex}`}
                              />
                              <Label
                                htmlFor={`${question._id}-${optionIndex}`}
                                className="flex-1 cursor-pointer font-normal"
                              >
                                {option.optionText}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </Card>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedForm(null);
                      setAnswers({});
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GiveFeedback;
