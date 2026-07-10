import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  PlusCircle,
  Edit,
  Trash2,
  BarChart3,
  FileText,
  Users,
  Calendar,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Header from '@/components/Header';

const API_URL = import.meta.env.VITE_API_URL;

interface FormSummary {
  formId: string;
  title: string;
  responseCount: number;
  questionCount: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

const FeedbackManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const schoolId = currentUser.schoolId;

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/feedback-responses/school/${schoolId}/summary`
      );
      setForms(response.data.forms);
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch feedback forms',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this feedback form?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/feedback-forms/${formId}`);
      toast({
        title: 'Success',
        description: 'Feedback form deleted successfully',
        variant: 'default'
      });
      fetchForms();
    } catch (error: any) {
      console.error('Error deleting form:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete form',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/schooladmin')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
            <p className="text-gray-600 mt-1">Create, manage, and analyze feedback forms</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50"
            onClick={() => navigate('/schooladmin/create-feedback-form')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <PlusCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Create New Form</p>
                  <p className="text-sm text-gray-600">Add a new feedback form</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200 bg-green-50"
            onClick={() => navigate('/schooladmin/analyze-feedback')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Analyze Feedback</p>
                  <p className="text-sm text-gray-600">View feedback analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Total Forms</p>
                  <p className="text-2xl font-bold">{forms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">All Feedback Forms</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading forms...</p>
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No feedback forms yet</p>
                <p className="text-sm mb-4">Create your first feedback form to get started</p>
                <Button onClick={() => navigate('/schooladmin/create-feedback-form')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {forms.map((form) => (
                  <Card key={form.formId} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{form.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Form ID: {form.formId}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{form.questionCount} questions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{form.responseCount} responses</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {formatDate(form.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Starts: {formatDate(form.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Ends: {formatDate(form.endTime)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/schooladmin/analyze-feedback`)}
                          >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analyze
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/schooladmin/edit-feedback-form/${form.formId}`)}
                            disabled={form.responseCount > 0}
                            title={
                              form.responseCount > 0
                                ? 'Cannot edit form with responses'
                                : 'Edit form'
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(form.formId)}
                            disabled={form.responseCount > 0}
                            title={
                              form.responseCount > 0
                                ? 'Cannot delete form with responses'
                                : 'Delete form'
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackManagement;
