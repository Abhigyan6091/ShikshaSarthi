import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Lightbulb, BookOpen } from 'lucide-react';

interface AnimationFrame {
  html: string;
  css: string;
  javascript: string;
  description: string;
  duration?: number;
}

interface MATQuestionAnimation {
  enabled: boolean;
  frames: AnimationFrame[];
  autoPlaySpeed: number;
}

interface MATQuestionViewerProps {
  question: {
    questionId: string;
    module: string;
    subModule: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    hint: string;
    difficulty: string;
    animation?: MATQuestionAnimation;
  };
  onAnswer?: (selectedOption: number) => void;
  showCorrectAnswer?: boolean;
  selectedAnswer?: number;
}

const MATQuestionViewer: React.FC<MATQuestionViewerProps> = ({
  question,
  onAnswer,
  showCorrectAnswer = false,
  selectedAnswer
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<number | null>(null);

  const hasAnimation = question.animation?.enabled && question.animation?.frames.length > 0;
  const frames = question.animation?.frames || [];
  const totalFrames = frames.length;

  useEffect(() => {
    if (hasAnimation && animationRef.current && frames[currentFrame]) {
      const frame = frames[currentFrame];
      animationRef.current.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'frame-container w-full h-full flex items-center justify-center p-8';
      container.innerHTML = frame.html;
      if (frame.css) {
        const style = document.createElement('style');
        style.textContent = frame.css;
        container.appendChild(style);
      }
      animationRef.current.appendChild(container);
    }
  }, [currentFrame, hasAnimation, frames]);

  useEffect(() => {
    if (isPlaying && hasAnimation) {
      const speed = frames[currentFrame]?.duration || question.animation?.autoPlaySpeed || 2000;
      playIntervalRef.current = window.setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= totalFrames - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
      return () => {
        if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      };
    }
  }, [isPlaying, currentFrame, hasAnimation, frames, totalFrames, question.animation?.autoPlaySpeed]);

  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => Math.min(totalFrames - 1, prev + 1));
  };

  const handlePlay = () => {
    if (currentFrame >= totalFrames - 1) setCurrentFrame(0);
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getOptionStyle = (index: number) => {
    if (showCorrectAnswer) {
      if (index === question.correctAnswer) return 'border-green-500 bg-green-50 border-2';
      if (selectedAnswer === index && index !== question.correctAnswer) return 'border-red-500 bg-red-50 border-2';
    } else if (selectedAnswer === index) {
      return 'border-blue-500 bg-blue-50 border-2';
    }
    return 'border-gray-300 hover:border-blue-400 hover:bg-blue-50';
  };

  return (
    <div className="mat-question-viewer space-y-6">
      <style>{`
        .animation-display-area .frame-container {
          width: 100%;
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .animation-display-area .pattern-box {
          padding: 1.5rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .animation-display-area .number-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          height: 60px;
          margin: 0.5rem;
          padding: 1rem;
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .animation-display-area .direction-path {
          min-width: 300px;
          min-height: 300px;
        }
        .animation-display-area svg {
          max-width: 100%;
          height: auto;
        }
        .animation-display-area .step-label {
          font-size: 1rem;
          font-weight: 600;
          color: #4a5568;
          margin: 0.5rem 0;
        }
        .animation-display-area .formula {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
          padding: 1rem;
          background: rgba(255,255,255,0.9);
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{question.module}</Badge>
              {question.subModule && <Badge variant="secondary">{question.subModule}</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
              <Badge variant="outline">{question.questionId}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-medium whitespace-pre-wrap mb-4">{question.question}</div>
          {question.hint && (
            <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} className="mb-4">
              <Lightbulb className="h-4 w-4 mr-2" />
              {showHint ? 'संकेत छिपाएं' : 'संकेत देखें'}
            </Button>
          )}
          {showHint && question.hint && (
            <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm text-gray-700"><strong>💡 संकेत:</strong> {question.hint}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {hasAnimation && (
        <Card className="border-2 border-purple-200 bg-white shadow-lg">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center justify-between">
              <span className="text-purple-700">📊 एनिमेशन व्याख्या</span>
              <Badge variant="outline" className="bg-white">फ्रेम {currentFrame + 1} / {totalFrames}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              ref={animationRef} 
              className="animation-display-area min-h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-purple-200 overflow-auto mb-6 shadow-inner" 
            />
            {frames[currentFrame]?.description && (
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm font-medium text-gray-700">{frames[currentFrame].description}</p>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={currentFrame === 0 && !isPlaying}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentFrame === 0 || isPlaying}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {isPlaying ? (
                <Button variant="default" size="sm" onClick={handlePause} className="min-w-[100px]">
                  <Pause className="h-4 w-4 mr-2" />रोकें
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={handlePlay} className="min-w-[100px]" disabled={currentFrame >= totalFrames - 1}>
                  <Play className="h-4 w-4 mr-2" />चलाएं
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleNext} disabled={currentFrame >= totalFrames - 1 || isPlaying}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentFrame + 1) / totalFrames) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>विकल्प चुनें</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button key={index} onClick={() => !showCorrectAnswer && onAnswer?.(index)} disabled={showCorrectAnswer}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(index)} ${showCorrectAnswer ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="flex-1">{option}</div>
                  {showCorrectAnswer && index === question.correctAnswer && <div className="flex-shrink-0 text-green-600 font-bold">✓</div>}
                  {showCorrectAnswer && selectedAnswer === index && index !== question.correctAnswer && <div className="flex-shrink-0 text-red-600 font-bold">✗</div>}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showCorrectAnswer && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />व्याख्या</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{question.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MATQuestionViewer;
