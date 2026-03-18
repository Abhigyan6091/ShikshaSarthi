import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface Option {
  optionText: string;
}

interface Question {
  questionText: string;
  options: Option[];
}

const toDateTimeLocalValue = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const CreateFeedbackForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const schoolId = currentUser.schoolId;
  const username = currentUser.username;

  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [startTime, setStartTime] = useState(toDateTimeLocalValue(new Date()));
  const [endTime, setEndTime] = useState(
    toDateTimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
  );
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: '', options: [{ optionText: '' }, { optionText: '' }] }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: [{ optionText: '' }, { optionText: '' }] }
    ]);
  };

  const removeQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== questionIndex));
    }
  };

  const updateQuestion = (questionIndex: number, questionText: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].questionText = questionText;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ optionText: '' });
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
        (_, index) => index !== optionIndex
      );
      setQuestions(updatedQuestions);
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, optionText: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex].optionText = optionText;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a form ID',
        variant: 'destructive'
      });
      return;
    }

    if (!formTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a form title',
        variant: 'destructive'
      });
      return;
    }

    if (!startTime || !endTime) {
      toast({
        title: 'Error',
        description: 'Please enter both start time and end time',
        variant: 'destructive'
      });
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast({
        title: 'Error',
        description: 'End time must be later than start time',
        variant: 'destructive'
      });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        toast({
          title: 'Error',
          description: `Please enter text for question ${i + 1}`,
          variant: 'destructive'
        });
        return;
      }

      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].optionText.trim()) {
          toast({
            title: 'Error',
            description: `Please enter text for question ${i + 1}, option ${j + 1}`,
            variant: 'destructive'
          });
          return;
        }
      }
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/feedback-forms/create`, {
        title: formTitle,
        formId: formId.trim(),
        startTime,
        endTime,
        schoolId,
        questions,
        createdBy: username
      });

      toast({
        title: 'Success',
        description: 'Feedback form created successfully',
        variant: 'default'
      });

      navigate('/schooladmin/feedback-management');
    } catch (error: any) {
      console.error('Error creating feedback form:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create feedback form',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/schooladmin/feedback-management')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feedback Management
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Feedback Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form ID */}
              <div className="space-y-2">
                <Label htmlFor="formId">Form ID *</Label>
                <Input
                  id="formId"
                  type="text"
                  placeholder="Enter form ID (e.g., FEEDBACK001)"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Enter a unique form ID. Teachers can use this ID to quickly find the form.
                </p>
              </div>

              {/* Form Title */}
              <div className="space-y-2">
                <Label htmlFor="formTitle">Form Title *</Label>
                <Input
                  id="formTitle"
                  type="text"
                  placeholder="Enter feedback form title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Questions</h3>
                  <Button type="button" onClick={addQuestion} size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {questions.map((question, questionIndex) => (
                  <Card key={questionIndex} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Label className="text-base font-medium">
                          Question {questionIndex + 1}
                        </Label>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeQuestion(questionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <Input
                        placeholder="Enter question text"
                        value={question.questionText}
                        onChange={(e) => updateQuestion(questionIndex, e.target.value)}
                        required
                      />

                      {/* Options */}
                      <div className="space-y-2 ml-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm">Options (Minimum 2)</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(questionIndex)}
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Add Option
                          </Button>
                        </div>

                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2 items-center">
                            <span className="text-sm text-gray-500 min-w-[60px]">
                              Option {optionIndex + 1}:
                            </span>
                            <Input
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option.optionText}
                              onChange={(e) =>
                                updateOption(questionIndex, optionIndex, e.target.value)
                              }
                              required
                            />
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Feedback Form'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/schooladmin/feedback-management')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateFeedbackForm;
