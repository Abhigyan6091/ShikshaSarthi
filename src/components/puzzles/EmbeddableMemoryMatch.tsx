/**
 * EmbeddableMemoryMatch — A self-contained Memory Match game
 * designed to be embedded inside the AdvancedQuizPlayer (quiz window).
 *
 * Props:
 *   onComplete(result)  — called when the game finishes (completed / time_up)
 *   puzzleType           — "memory_match"
 *
 * The component skips intro/mode-select screens and immediately goes into
 * "individual" mode (10 pairs, 20 cards) so it fits within the quiz flow.
 * It does NOT call the backend /puzzles/evaluate endpoint;
 * instead it returns the raw game data via onComplete for the quiz to store.
 */
import React, { useEffect, useState } from "react";
import { Clock, Trophy, Target, Zap, Eye, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMemoryImages } from "./memoryMatchGrid/imageUtils";

type CardType = {
  id: number;
  image: string;
  matched: boolean;
  index: number;
};

type ExitType = "completed" | "time_up" | null;

const PREVIEW_TIME = 15;
const SOLVE_TIME = 180;

interface EmbeddableMemoryMatchProps {
  onComplete: (result: {
    puzzleType: string;
    mode: string;
    totalPairs: number;
    totalClicks: number;
    incorrectClicks: number;
    nearbyClicks: number;
    correctPairs: number;
    timeTaken: number;
    endReason: string;
    score: number; // 0-100 computed locally
    clickTimestamps: number[]; // Array of click timestamps for cognitive analysis
    sequentialPatterns: any[]; // Pattern analysis data
  }) => void;
}

/* ---- Enhanced scoring functions matching backend ---- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const calculateWorkingMemoryScore = (correctPairs: number, totalPairs: number) => {
  return clamp01(correctPairs / totalPairs);
};

const calculateAttentionControlScore = (incorrectClicks: number, nearbyClicks: number, totalPairs: number) => {
  const effectiveErrors = Math.max(0, incorrectClicks - 0.3 * nearbyClicks);
  const errorRate = effectiveErrors / totalPairs;
  return clamp01(1 - errorRate);
};

const calculateProcessingSpeedScore = (timeTaken: number, maxTime: number = 180) => {
  return clamp01(1 - timeTaken / maxTime);
};

const calculateStrategicEfficiencyScore = (totalClicks: number, correctPairs: number, totalPairs: number) => {
  const optimalClicks = 2 * correctPairs;
  const excessClicks = Math.max(0, totalClicks - optimalClicks);
  const maxExcessClicks = 4 * totalPairs;
  return clamp01(1 - excessClicks / maxExcessClicks);
};

const calculateTerminationPenalty = (endReason: string, correctPairs: number, totalPairs: number) => {
  switch (endReason) {
    case "EXITED":
      const completionRatio = correctPairs / totalPairs;
      return 0.25 * (1 - completionRatio);
    case "TIME_UP":
      return 0.08;
    default:
      return 0;
  }
};

const computeEnhancedScore = (
  totalPairs: number,
  totalClicks: number,
  incorrectClicks: number,
  nearbyClicks: number,
  correctPairs: number,
  timeTaken: number,
  endReason: string,
  clickTimestamps: number[]
) => {
  const workingMemory = calculateWorkingMemoryScore(correctPairs, totalPairs);
  const attentionControl = calculateAttentionControlScore(incorrectClicks, nearbyClicks, totalPairs);
  const processingSpeed = calculateProcessingSpeedScore(timeTaken, 180);
  const strategicEfficiency = calculateStrategicEfficiencyScore(totalClicks, correctPairs, totalPairs);
  
  // Weighted cognitive score
  let cognitiveScore = 
    0.40 * workingMemory +
    0.25 * attentionControl +
    0.20 * processingSpeed +
    0.15 * strategicEfficiency;

  const terminationPenalty = calculateTerminationPenalty(endReason, correctPairs, totalPairs);
  cognitiveScore = clamp01(cognitiveScore - terminationPenalty);
  
  return Math.round(cognitiveScore * 100);
};

const EmbeddableMemoryMatch: React.FC<EmbeddableMemoryMatchProps> = ({ onComplete }) => {
  const mode = "individual";
  const pairCount = 10;
  const gridCols = 5;
  const gridRows = 4;

  const [cards, setCards] = useState<CardType[]>([]);
  const [flipped, setFlipped] = useState<CardType[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const [previewTimer, setPreviewTimer] = useState(PREVIEW_TIME);
  const [solveTimer, setSolveTimer] = useState(SOLVE_TIME);
  const [previewPhase, setPreviewPhase] = useState(true);

  const [totalClicks, setTotalClicks] = useState(0);
  const [incorrectClicks, setIncorrectClicks] = useState(0);
  const [nearbyClicks, setNearbyClicks] = useState(0);
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]); // Enhanced tracking
  const [sequentialPatterns, setSequentialPatterns] = useState<any[]>([]); // Pattern data

  const [submitted, setSubmitted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  /* ---- Auto-start game on mount ---- */
  useEffect(() => {
    const allImages = getMemoryImages();
    const images = allImages.slice(0, pairCount);
    const shuffled = [...images, ...images]
      .map((img, i) => ({ id: i, image: img, matched: false, index: i }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setStartTime(Date.now());
    setGameStarted(true);
  }, []);

  /* ---- Preview timer ---- */
  useEffect(() => {
    if (!gameStarted || !previewPhase) return;
    if (previewTimer === 0) { setPreviewPhase(false); return; }
    const t = setTimeout(() => setPreviewTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [previewTimer, previewPhase, gameStarted]);

  /* ---- Solve timer ---- */
  useEffect(() => {
    if (!gameStarted || previewPhase || submitted) return;
    if (solveTimer === 0) { finishGame("time_up"); return; }
    const t = setTimeout(() => setSolveTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [solveTimer, previewPhase, gameStarted, submitted]);

  /* ---- Auto complete ---- */
  useEffect(() => {
    if (gameStarted && matches === pairCount && !submitted) {
      finishGame("completed");
    }
  }, [matches]);

  const handleFlip = (card: CardType) => {
    if (previewPhase || flipped.length === 2 || card.matched || flipped.includes(card) || submitted) return;
    
    // Enhanced tracking: record click timestamp
    const timestamp = Date.now();
    setClickTimestamps(prev => [...prev, timestamp]);
    setTotalClicks(c => c + 1);
    
    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (newFlipped[0].image === newFlipped[1].image) {
        // Successful match
        setCards(prev => prev.map(c => (c.image === card.image ? { ...c, matched: true } : c)));
        setMatches(m => m + 1);
        setFlipped([]);
      } else {
        // Incorrect match - track error patterns
        setIncorrectClicks(i => i + 1);
        
        // Check if cards are spatially nearby (indicates partial memory)
        if (Math.abs(newFlipped[0].index - newFlipped[1].index) <= 2) {
          setNearbyClicks(n => n + 1);
        }
        
        // Record pattern for cognitive analysis
        setSequentialPatterns(prev => [...prev, {
          timestamp,
          cardIndices: [newFlipped[0].index, newFlipped[1].index],
          type: 'incorrect_match'
        }]);
        
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const finishGame = (type: ExitType) => {
    if (submitted) return;
    setSubmitted(true);
    const endReason = type === "completed" ? "COMPLETED" : "TIME_UP";
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    // Compute enhanced score using new cognitive assessment
    const score = computeEnhancedScore(
      pairCount, 
      totalClicks, 
      incorrectClicks, 
      nearbyClicks, 
      matches, 
      timeTaken, 
      endReason,
      clickTimestamps
    );

    onComplete({
      puzzleType: "memory_match",
      mode,
      totalPairs: pairCount,
      totalClicks,
      incorrectClicks,
      nearbyClicks,
      correctPairs: matches,
      timeTaken,
      endReason,
      score,
      clickTimestamps,
      sequentialPatterns,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-xl p-2 sm:p-3 relative">
      {/* Completion Overlay */}
      {submitted && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">पहेली पूर्ण! 🎉</h3>
            <p className="text-gray-600 text-sm">आपका स्कोर क्विज़ परिणाम में दिखाया जाएगा</p>
          </div>
        </div>
      )}

      {/* Phase banner + timer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${
          previewPhase ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
        }`}>
          {previewPhase ? <><Eye className="h-3.5 w-3.5" /> स्थिति याद करें!</> : <><Target className="h-3.5 w-3.5" /> जोड़ियाँ ढूँढें!</>}
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Matches */}
          <div className="flex items-center gap-1.5 text-sm">
            <Target className="h-4 w-4 text-green-600" />
            <span className="font-bold text-green-600">{matches}/{pairCount}</span>
          </div>
          {/* Moves */}
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="font-bold text-purple-600">{moves}</span>
          </div>
          {/* Timer */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold text-white ${
            previewPhase ? "bg-blue-500" : solveTimer <= 30 ? "bg-red-500 animate-pulse" : "bg-indigo-600"
          }`}>
            <Clock className="h-3.5 w-3.5" />
            {previewPhase ? formatTime(previewTimer) : formatTime(solveTimer)}
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex items-center justify-center overflow-auto">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            width: "fit-content",
          }}
        >
          {cards.map((card) => {
            const visible = previewPhase || flipped.includes(card) || card.matched;
            return (
              <div
                key={card.id}
                onClick={() => handleFlip(card)}
                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 relative cursor-pointer rounded-xl overflow-hidden shadow-md
                  transform transition-all duration-200
                  ${!visible && !card.matched ? "hover:scale-105 hover:shadow-xl active:scale-95" : ""}
                  ${card.matched ? "opacity-50 scale-90" : ""}`}
              >
                <div className={`w-full h-full ${
                  visible ? "bg-white border-2 border-indigo-200" : "bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-500"
                }`}>
                  {visible ? (
                    <img
                      src={card.image}
                      alt="card"
                      className="w-full h-full object-cover p-1 rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/150/6366f1/ffffff?text=${card.index + 1}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-base sm:text-lg md:text-2xl font-bold drop-shadow-lg">?</span>
                    </div>
                  )}
                </div>
                {card.matched && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-400/40">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 rounded-full"
            style={{ width: `${(matches / pairCount) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">{Math.round((matches / pairCount) * 100)}% पूर्ण</p>
      </div>
    </div>
  );
};

export default EmbeddableMemoryMatch;
