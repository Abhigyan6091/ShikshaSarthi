import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MATQuestionViewer from '@/components/MATQuestionViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const MATAnimatedDemo: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimatedQuestions();
  }, []);

  const fetchAnimatedQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mat/questions?animated=true`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load questions');
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(undefined);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(undefined);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <p className="text-lg">एनिमेटेड प्रश्न लोड हो रहे हैं...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">त्रुटि</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={fetchAnimatedQuestions}>पुनः प्रयास करें</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>कोई प्रश्न नहीं</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">एनिमेटेड MAT प्रश्न उपलब्ध नहीं हैं।</p>
            <Button onClick={() => navigate('/student/dashboard')}>डैशबोर्ड पर वापस जाएं</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            वापस जाएं
          </Button>
          <div className="text-lg font-semibold text-purple-700">
            प्रश्न {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>

        <MATQuestionViewer
          question={currentQuestion}
          onAnswer={handleAnswer}
          showCorrectAnswer={showAnswer}
          selectedAnswer={selectedAnswer}
        />

        <div className="mt-6 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            पिछला प्रश्न
          </Button>
          {showAnswer && currentQuestionIndex < questions.length - 1 && (
            <Button onClick={handleNext}>अगला प्रश्न</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MATAnimatedDemo;
