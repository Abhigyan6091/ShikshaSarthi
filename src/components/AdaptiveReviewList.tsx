import React from 'react';
import { CheckCircle, Lightbulb, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type AdaptiveReviewItem = {
  questionId: string;
  question: string;
  questionHindi?: string;
  options: string[];
  optionsHindi?: string[];
  selectedOptionIndex: number | null;
  correctAnswerIndex: number;
  isCorrect: boolean;
  hintUsed: boolean;
  hints?: string[];
  hintsHindi?: string[];
  explanation?: string;
  explanationHindi?: string;
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
};

// Shared "Review Answers" list used both right after a student finishes an
// adaptive test and when reopening a past attempt from Adaptive Test History.
// Shows only the CURRENT language (never both at once, per exam-integrity ask)
// and — post-submission only — the hint text and explanation for every
// question, regardless of whether the student opened the hint during the test.
const AdaptiveReviewList: React.FC<{ items: AdaptiveReviewItem[]; isHindi: boolean }> = ({ items, isHindi }) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const questionText = isHindi ? (item.questionHindi || item.question) : (item.question || item.questionHindi);
        const hintText = isHindi
          ? item.hintsHindi?.[0] || item.hints?.[0]
          : item.hints?.[0] || item.hintsHindi?.[0];

        return (
          <div key={`${item.questionId}-${index}`} className="rounded-lg border bg-white p-4">
            <div className="mb-3 flex items-start gap-2">
              {item.isCorrect ? (
                <CheckCircle className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="mt-1 h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <p className="font-semibold text-slate-900">
                <span className="mr-1 text-blue-600">Q{index + 1}.</span>
                {questionText}
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {item.options.map((option, optionIndex) => {
                const label = isHindi
                  ? item.optionsHindi?.[optionIndex] || option
                  : option || item.optionsHindi?.[optionIndex];
                const isSelected = item.selectedOptionIndex === optionIndex;
                const isCorrectOption = item.correctAnswerIndex === optionIndex;
                return (
                  <div
                    key={`${item.questionId}-${optionIndex}`}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      isCorrectOption
                        ? 'border-green-300 bg-green-50 text-green-800'
                        : isSelected
                          ? 'border-red-300 bg-red-50 text-red-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + optionIndex)}. {label}
                  </div>
                );
              })}
            </div>

            {hintText && (
              <div className="mt-3 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>{hintText}</p>
              </div>
            )}

            {(item.explanationHindi || item.explanation) && (
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                {isHindi ? (item.explanationHindi || item.explanation) : (item.explanation || item.explanationHindi)}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <Badge variant="outline">Rating {item.ratingBefore} → {item.ratingAfter}</Badge>
              {item.hintUsed && <Badge variant="outline">{isHindi ? 'संकेत इस्तेमाल किया' : 'Hint used'}</Badge>}
              {item.selectedOptionIndex === null && (
                <Badge variant="outline" className="border-orange-300 text-orange-600">
                  {isHindi ? 'छोड़ा गया' : 'Skipped'}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdaptiveReviewList;
