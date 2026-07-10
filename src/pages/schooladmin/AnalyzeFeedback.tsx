import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Search, BarChart3, Users, FileText, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Header from '@/components/Header';

const API_URL = import.meta.env.VITE_API_URL;

interface FormSummary {
  formId: string;
  title: string;
  responseCount: number;
  questionCount: number;
}

interface OptionAnalysis {
  optionText: string;
  count: number;
  percentage: string;
}

interface QuestionAnalysis {
  questionText: string;
  totalResponses: number;
  options: OptionAnalysis[];
}

interface AnalysisData {
  formId: string;
  formTitle: string;
  totalResponses: number;
  analysis: QuestionAnalysis[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const AnalyzeFeedback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const schoolId = currentUser.schoolId;

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [searchFormId, setSearchFormId] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingForms, setFetchingForms] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/feedback-responses/school/${schoolId}/summary`);
      setForms(response.data.forms);
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch forms',
        variant: 'destructive'
      });
    } finally {
      setFetchingForms(false);
    }
  };

  const handleAnalyze = async (formId: string) => {
    if (!formId) {
      toast({
        title: 'Error',
        description: 'Please select a form',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/feedback-responses/analysis/${formId}`);
      setAnalysisData(response.data);
      setSelectedFormId(formId);
    } catch (error: any) {
      console.error('Error fetching analysis:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch analysis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchById = () => {
    if (!searchFormId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a form ID',
        variant: 'destructive'
      });
      return;
    }
    handleAnalyze(searchFormId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/schooladmin/feedback-management')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feedback Management
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Analyze Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select from dropdown */}
            <div className="space-y-2">
              <Label>Select Feedback Form</Label>
              {fetchingForms ? (
                <div className="flex items-center gap-2 p-3 border rounded">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading forms...</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={selectedFormId}
                    onValueChange={(value) => handleAnalyze(value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a form to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No forms available</div>
                      ) : (
                        forms.map((form) => (
                          <SelectItem key={form.formId} value={form.formId}>
                            {form.title} ({form.formId}) - {form.responseCount} responses
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Or search by ID */}
            <div className="space-y-2">
              <Label>Or Search by Form ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter form ID (e.g., FORM00001)"
                  value={searchFormId}
                  onChange={(e) => setSearchFormId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchById()}
                />
                <Button onClick={handleSearchById} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading analysis...</p>
          </div>
        )}

        {!loading && analysisData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Form Title</p>
                      <p className="text-xl font-bold">{analysisData.formTitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Responses</p>
                      <p className="text-xl font-bold">{analysisData.totalResponses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="text-xl font-bold">{analysisData.analysis.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Analysis */}
            {analysisData.analysis.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}: {question.questionText}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{question.totalResponses} responses</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={question.options}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="optionText"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" name="Responses">
                            {question.options.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Statistics Table */}
                    <div className="space-y-2">
                      <h4 className="font-semibold mb-3">Response Distribution</h4>
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{ borderLeftWidth: '4px', borderLeftColor: COLORS[optionIndex % COLORS.length] }}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{option.optionText}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold">{option.count}</p>
                              <p className="text-xs text-gray-600">responses</p>
                            </div>
                            <div className="text-right min-w-[60px]">
                              <p className="text-lg font-semibold" style={{ color: COLORS[optionIndex % COLORS.length] }}>
                                {option.percentage}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !analysisData && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a form to view its analysis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalyzeFeedback;
