import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Trophy,
  BookOpen,
  Dices,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Star,
  AlertTriangle,
  Zap,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Inline CSS for Custom Animations ─────────────────────────────────────────

const customStyles = `
@keyframes snakeBite {
  0% { transform: scale(0.5) translateY(-100px); opacity: 0; }
  50% { transform: scale(1.5) translateY(20px); opacity: 1; }
  70% { transform: scale(1.2) translateY(0); }
  80% { transform: scale(1.4) translateY(10px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes ladderClimb {
  0% { transform: translateY(100px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes diceRoll {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.2); }
  50% { transform: rotate(180deg) scale(0.9); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes playerBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.1); }
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes tokenGlow {
  0%, 100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0.2), 0 0 0 rgba(249, 115, 22, 0.1); }
  50% { box-shadow: 0 0 24px rgba(59, 130, 246, 0.4), 0 0 40px rgba(249, 115, 22, 0.2); }
}

@keyframes starShower {
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
}

.animate-snake-bite { animation: snakeBite 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
.animate-ladder-climb { animation: ladderClimb 1s ease-out forwards; }
.animate-dice-roll { animation: diceRoll 0.5s ease-in-out infinite; }
.animate-player-bounce { animation: playerBounce 0.4s ease-in-out; }
.animate-pop-in { animation: popIn 0.3s ease-out forwards; }
.animate-slide-up { animation: slideUp 0.4s ease-out forwards; }

.board-cell {
  transition: all 0.3s ease;
}
.board-cell:hover {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15);
}

.board-shell {
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.3), transparent 30%),
    radial-gradient(circle at bottom right, rgba(251,191,36,0.18), transparent 30%),
    linear-gradient(145deg, #1e293b, #0f172a 65%);
}

.token-glow {
  animation: tokenGlow 1.6s ease-in-out infinite;
}
`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  subject?: string;
  topicId?: string;
  questionHindi?: string;
  question: string;
  options: string[];
  optionsHindi?: string[];
  correct?: number;
  correctAnswerIndex?: number;
  explanation?: string;
  explanationHindi?: string;
  eloRating?: number;
}

interface JourneyReviewItem {
  question: Question;
  selectedOptionIndex: number;
  isCorrect: boolean;
  square: number;
  context: "ladder" | "snake" | "question" | null;
  timeSpentMs: number;
}

type SquareType = "normal" | "ladder-foot" | "ladder-top" | "snake-head" | "snake-tail" | "question";
type GamePhase = "intro" | "playing" | "question" | "result-feedback" | "won";

interface SpecialSquare {
  type: SquareType;
  connects?: number; // destination for ladder/snake
  label?: string;
}

// ─── Questions Bank ───────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  { id: "1", question: "Pi Day (π दिवस) किस तारीख को मनाया जाता है?", options: ["14 मार्च", "22 जुलाई", "28 फरवरी", "15 अप्रैल"], correct: 0, correctAnswerIndex: 0, explanation: "π ≈ 3.14 होने के कारण Pi Day 14 मार्च (3/14) को मनाया जाता है।" },
  { id: "2", question: "समान्तर चतुर्भुज (Parallelogram) का क्षेत्रफल क्या होता है?", options: ["आधार × ऊँचाई", "½ × आधार × ऊँचाई", "भुजा²", "π × r²"], correct: 0, correctAnswerIndex: 0, explanation: "समान्तर चतुर्भुज का क्षेत्रफल = आधार × ऊँचाई (Base × Height)" },
  { id: "3", question: "P=₹50,000, R=8% प्रतिवर्ष, T=2 वर्ष। साधारण ब्याज (SI) कितना होगा?", options: ["₹8,000", "₹6,500", "₹10,000", "₹7,200"], correct: 0, correctAnswerIndex: 0, explanation: "SI = P×R×T/100 = 50000×8×2/100 = ₹8,000" },
  { id: "4", question: "√144 का मान क्या है?", options: ["12", "14", "11", "13"], correct: 0, correctAnswerIndex: 0, explanation: "12 × 12 = 144, अतः √144 = 12" },
  { id: "5", question: "बेयज़ प्रमेय (Bayes' Theorem) का सूत्र क्या है?", options: ["P(A|B) = P(B|A)·P(A) / P(B)", "P(A|B) = P(A) + P(B)", "P(A∩B) = P(A) · P(B)", "P(A|B) = P(A) / P(B)"], correct: 0, correctAnswerIndex: 0, explanation: "बेयज़ प्रमेय: P(A|B) = [P(B|A) × P(A)] / P(B)" },
  { id: "6", question: "π (Pi) का लगभग मान क्या है?", options: ["3.14159", "2.71828", "1.61803", "1.41421"], correct: 0, correctAnswerIndex: 0, explanation: "π ≈ 3.14159 — यह एक अपरिमेय संख्या है।" },
  { id: "7", question: "एक गैर-लीप वर्ष (Non-leap year) में ठीक 53 रविवार होने की प्रायिकता क्या है?", options: ["1/7", "2/7", "3/7", "1/4"], correct: 0, correctAnswerIndex: 0, explanation: "गैर-लीप वर्ष में 365 दिन = 52 सप्ताह + 1 अतिरिक्त दिन। वह 1 दिन रविवार होने की P = 1/7" },
  { id: "8", question: "द्विघात समीकरण x² – 5x + 6 = 0 के मूलों का योग क्या होगा?", options: ["5", "6", "-5", "-6"], correct: 0, correctAnswerIndex: 0, explanation: "ax² + bx + c = 0 में मूलों का योग = -b/a = -(-5)/1 = 5" },
  { id: "9", question: "3 मुर्गियाँ 3 दिन में 3 अंडे देती हैं। 12 मुर्गियाँ 12 दिन में कितने अंडे देंगी?", options: ["48", "36", "12", "24"], correct: 0, correctAnswerIndex: 0, explanation: "1 मुर्गी 3 दिन में 1 अंडा देती है, अतः 12 मुर्गियाँ 12 दिन में = 12 × 4 = 48 अंडे" },
  { id: "10", question: "दो संख्याओं का योग 25 है और अंतर 13 है। उनका गुणनफल क्या होगा?", options: ["114", "112", "116", "120"], correct: 0, correctAnswerIndex: 0, explanation: "a+b=25, a-b=13 → a=19, b=6 → गुणनफल = 19×6 = 114" },
  { id: "11", question: "चक्रवृद्धि ब्याज (Compound Interest) का सूत्र क्या है?", options: ["A = P(1 + R/100)ⁿ", "SI = P×R×T/100", "A = P + P×R×T", "CI = P×R/100"], correct: 0, correctAnswerIndex: 0, explanation: "CI सूत्र: A = P(1 + R/100)ⁿ, जहाँ n वर्षों की संख्या है।" },
  { id: "12", question: "यदि कोई वस्तु ₹500 में खरीदी और 15% लाभ पर बेची जाए, तो विक्रय मूल्य क्या होगा?", options: ["₹575", "₹550", "₹600", "₹525"], correct: 0, correctAnswerIndex: 0, explanation: "विक्रय मूल्य = CP × (1 + Profit%/100) = 500 × 1.15 = ₹575" },
  { id: "13", question: "त्रिभुज की सर्वांगसमता (Congruence) की शर्त SSS का अर्थ क्या है?", options: ["तीनों भुजाएँ बराबर हों", "दो भुजाएँ और एक कोण बराबर हो", "दो कोण और एक भुजा बराबर हो", "तीनों कोण बराबर हों"], correct: 0, correctAnswerIndex: 0, explanation: "SSS (Side-Side-Side): यदि दोनों त्रिभुजों की तीनों भुजाएँ बराबर हों तो वे सर्वांगसम हैं।" },
  { id: "14", question: "यदि किसी घन (Cube) की भुजा 4 cm है, तो उसका आयतन कितना होगा?", options: ["64 cm³", "48 cm³", "32 cm³", "96 cm³"], correct: 0, correctAnswerIndex: 0, explanation: "घन का आयतन = भुजा³ = 4³ = 64 cm³" },
  { id: "15", question: "LCM(12, 18) का मान क्या है?", options: ["36", "72", "24", "54"], correct: 0, correctAnswerIndex: 0, explanation: "12 = 2²×3, 18 = 2×3². LCM = 2²×3² = 36" },
  { id: "16", question: "रैखिक समीकरण 2x + 3 = 11 में x का मान क्या है?", options: ["4", "3", "5", "2"], correct: 0, correctAnswerIndex: 0, explanation: "2x = 11 - 3 = 8, अतः x = 4" },
  { id: "17", question: "1 से 20 तक की सम संख्याओं का योग क्या है?", options: ["110", "100", "90", "120"], correct: 0, correctAnswerIndex: 0, explanation: "2+4+6+…+20 = 2(1+2+…+10) = 2×55 = 110" },
  { id: "18", question: "यदि किसी वृत्त की त्रिज्या 7 cm है, तो क्षेत्रफल क्या होगा? (π = 22/7)", options: ["154 cm²", "44 cm²", "78 cm²", "132 cm²"], correct: 0, correctAnswerIndex: 0, explanation: "क्षेत्रफल = πr² = (22/7) × 7² = 22 × 7 = 154 cm²" },
  { id: "19", question: "पाइथागोरस प्रमेय के अनुसार, कर्ण (Hypotenuse) का सूत्र क्या है?", options: ["c² = a² + b²", "c = a + b", "c² = a² - b²", "c = a² + b²"], correct: 0, correctAnswerIndex: 0, explanation: "पाइथागोरस: c² = a² + b², जहाँ c कर्ण और a, b अन्य दो भुजाएँ हैं।" },
  { id: "20", question: "100 का 15% कितना होगा?", options: ["15", "10", "20", "12"], correct: 0, correctAnswerIndex: 0, explanation: "15% of 100 = (15/100) × 100 = 15" },
];

// ─── Board Configuration ──────────────────────────────────────────────────────

const LADDERS: Record<number, number> = {
  7: 28, 11: 32, 17: 38, 21: 42, 34: 46, 44: 95, 48: 74, 59: 61, 69: 90, 79: 98
};

const SNAKES: Record<number, number> = {
  22: 3, 26: 5, 49: 30, 55: 25, 63: 37, 75: 54, 84: 43, 92: 72, 99: 39
};

const QUESTION_BOXES = new Set([4, 14, 19, 24, 29, 36, 51, 56, 60, 66, 70, 71, 77, 81, 87, 96]);

const SUBJECT_OPTIONS = [
  { id: "maths", label: "Mathematics", labelHindi: "गणित" },
  { id: "science", label: "Science", labelHindi: "विज्ञान" },
  { id: "social", label: "Social Science", labelHindi: "सामाजिक विज्ञान" },
];

const batchToClass = (batch?: string) => {
  const n = Number.parseInt(String(batch || "").replace(/\D/g, ""), 10);
  const derived = Number.isFinite(n) && n >= 2026 && n <= 2037 ? 2038 - n : 0;
  return derived >= 6 && derived <= 10 ? derived : 0;
};

const resolveClassNumber = (student?: { class?: string; batch?: string }) => {
  const parsed = Number.parseInt(String(student?.class || "").replace(/\D/g, ""), 10);
  if (Number.isFinite(parsed) && parsed >= 6 && parsed <= 10) return parsed;
  return batchToClass(student?.batch) || 10;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const buildSpecialSquares = (): Record<number, SpecialSquare> => {
  const map: Record<number, SpecialSquare> = {};
  Object.entries(LADDERS).forEach(([from, to]) => {
    map[Number(from)] = { type: "ladder-foot", connects: Number(to), label: `🪜 →${to}` };
    map[Number(to)] = { type: "ladder-top" };
  });
  Object.entries(SNAKES).forEach(([from, to]) => {
    map[Number(from)] = { type: "snake-head", connects: Number(to), label: `🐍 →${to}` };
    map[Number(to)] = { type: "snake-tail" };
  });
  QUESTION_BOXES.forEach((sq) => {
    if (!map[sq]) map[sq] = { type: "question", label: "❓" };
  });
  return map;
};

const SPECIAL_SQUARES = buildSpecialSquares();

const getSquareFlavor = (num: number, type: SquareType) => {
  if (num === 100) {
    return {
      className: "from-yellow-300 via-amber-200 to-orange-200 border-yellow-500 text-amber-950",
      badge: "🏆",
    };
  }

  if (num === 1) {
    return {
      className: "from-sky-200 via-cyan-100 to-white border-sky-400 text-sky-950",
      badge: "🚩",
    };
  }

  if (type === "ladder-foot" || type === "ladder-top") {
    return {
      className: "from-emerald-100 via-lime-50 to-emerald-200 border-emerald-400 text-emerald-950",
      badge: type === "ladder-foot" ? "🪜" : "✨",
    };
  }

  if (type === "snake-head" || type === "snake-tail") {
    return {
      className: "from-rose-100 via-orange-50 to-rose-200 border-rose-400 text-rose-950",
      badge: type === "snake-head" ? "🐍" : "↘",
    };
  }

  if (type === "question") {
    return {
      className: "from-amber-100 via-yellow-50 to-orange-100 border-amber-400 text-amber-950",
      badge: "❓",
    };
  }

  const isEvenBand = (Math.floor((num - 1) / 10) + ((num - 1) % 10)) % 2 === 0;
  return {
    className: isEvenBand
      ? "from-white via-slate-50 to-sky-50 border-slate-200 text-slate-700"
      : "from-orange-50 via-white to-amber-50 border-orange-100 text-slate-700",
    badge: "",
  };
};

// Helper to get relative coordinates for drawing snakes and ladders on the board overlay
const getCoords = (num: number) => {
  const row = Math.floor((num - 1) / 10);
  const col = row % 2 === 0 ? (num - 1) % 10 : 9 - ((num - 1) % 10);
  return {
    x: (col + 0.5) * 10,
    y: 100 - (row + 0.5) * 10,
  };
};

const BoardOverlay = () => {
  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-10" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      style={{ filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.4))' }}
    >
      {/* Ladders */}
      {Object.entries(LADDERS).map(([start, end]) => {
        const s = getCoords(Number(start));
        const e = getCoords(Number(end));
        
        const dx = e.x - s.x;
        const dy = e.y - s.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / len;
        const ny = dy / len;
        
        const px = -ny * 2.5; 
        const py = nx * 2.5;
        
        const rungsCount = Math.floor(len / 4.5);
        const rungs = Array.from({ length: rungsCount }).map((_, i) => {
          const t = (i + 1) / (rungsCount + 1);
          const cx = s.x + dx * t;
          const cy = s.y + dy * t;
          return {
            x1: cx - px * 0.9, y1: cy - py * 0.9,
            x2: cx + px * 0.9, y2: cy + py * 0.9
          };
        });

        return (
          <g key={`ladder-${start}`} opacity="1">
            <line x1={s.x - px} y1={s.y - py} x2={e.x - px} y2={e.y - py} stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
            <line x1={s.x + px} y1={s.y + py} x2={e.x + px} y2={e.y + py} stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
            <line x1={s.x - px} y1={s.y - py} x2={e.x - px} y2={e.y - py} stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
            <line x1={s.x + px} y1={s.y + py} x2={e.x + px} y2={e.y + py} stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
            
            {rungs.map((rung, i) => (
              <g key={i}>
                <line x1={rung.x1} y1={rung.y1} x2={rung.x2} y2={rung.y2} stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
                <line x1={rung.x1} y1={rung.y1} x2={rung.x2} y2={rung.y2} stroke="#d97706" strokeWidth="0.5" strokeLinecap="round" />
              </g>
            ))}
          </g>
        );
      })}

      {/* Snakes */}
      {Object.entries(SNAKES).map(([head, tail], idx) => {
        const h = getCoords(Number(head));
        const t = getCoords(Number(tail));
        
        const dx = t.x - h.x;
        const dy = t.y - h.y;
        
        const curveFactor = idx % 2 === 0 ? 1 : -1;
        
        const cx1 = h.x + dx * 0.3 + curveFactor * 12;
        const cy1 = h.y + dy * 0.3 - 5;
        
        const cx2 = h.x + dx * 0.7 - curveFactor * 12;
        const cy2 = h.y + dy * 0.7 + 5;

        const snakeColors = [
          { stroke: "#064e3b", inner: "#10b981", dots: "#34d399" }, // Emerald
          { stroke: "#7f1d1d", inner: "#ef4444", dots: "#fca5a5" }, // Red
          { stroke: "#4c1d95", inner: "#8b5cf6", dots: "#c4b5fd" }, // Purple
          { stroke: "#1e3a8a", inner: "#3b82f6", dots: "#93c5fd" }, // Blue
          { stroke: "#78350f", inner: "#f59e0b", dots: "#fcd34d" }, // Amber
        ];
        const color = snakeColors[idx % snakeColors.length];
        
        const faceAngle = Math.atan2(-(cy1 - h.y), -(cx1 - h.x)) * 180 / Math.PI + 90;

        return (
          <g key={`snake-${head}`} opacity="1">
            <path
              d={`M ${h.x} ${h.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.x} ${t.y}`}
              fill="none"
              stroke={color.stroke}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${h.x} ${h.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.x} ${t.y}`}
              fill="none"
              stroke={color.inner}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${h.x} ${h.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.x} ${t.y}`}
              fill="none"
              stroke={color.dots}
              strokeWidth="1.5"
              strokeDasharray="2 4"
              strokeLinecap="round"
            />
            
            <g transform={`translate(${h.x}, ${h.y}) rotate(${faceAngle})`}>
              {/* Snake Head */}
              <path d="M 0 -3.5 C 3.5 -3.5, 3.5 2.5, 0 4.5 C -3.5 2.5, -3.5 -3.5, 0 -3.5 Z" fill={color.inner} stroke={color.stroke} strokeWidth="0.8" />
              {/* Eyes */}
              <circle cx="-1.2" cy="-0.5" r="0.8" fill="#fff" />
              <circle cx="1.2" cy="-0.5" r="0.8" fill="#fff" />
              <circle cx="-1.2" cy="-0.5" r="0.4" fill="#000" />
              <circle cx="1.2" cy="-0.5" r="0.4" fill="#000" />
              {/* Tongue */}
              <path d="M 0 -3.5 Q -1 -6 -2 -7 M 0 -3.5 Q 1 -6 2 -7" fill="none" stroke="#ef4444" strokeWidth="0.5" />
            </g>
          </g>
        );
      })}
    </svg>
  );
};


// ─── Dice Component ───────────────────────────────────────────────────────────

const DiceFace: React.FC<{ value: number; rolling: boolean }> = ({ value, rolling }) => {
  const dots = [
    [],
    [[50, 50]],
    [[25, 25], [75, 75]],
    [[25, 25], [50, 50], [75, 75]],
    [[25, 25], [75, 25], [25, 75], [75, 75]],
    [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  ];

  return (
    <div
      className={`w-20 h-20 bg-gradient-to-br from-white to-gray-100 border-2 border-gray-300 rounded-2xl shadow-xl flex items-center justify-center relative transform transition-all ${
        rolling ? "animate-dice-roll" : "hover:scale-105 hover:shadow-2xl"
      }`}
      style={{
        boxShadow: rolling ? "0 0 20px rgba(245, 158, 11, 0.4)" : "0 10px 25px rgba(0,0,0,0.1)",
      }}
    >
      <svg width="72" height="72" viewBox="0 0 100 100">
        {dots[value]?.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="10" fill="#334155" className="animate-pop-in" />
        ))}
      </svg>
    </div>
  );
};

// ─── Board Cell ───────────────────────────────────────────────────────────────

interface BoardCellProps {
  num: number;
  isPlayer: boolean;
  special?: SpecialSquare;
  isBouncing: boolean;
  isDestination: boolean;
}

const BoardCell: React.FC<BoardCellProps> = ({ num, isPlayer, special, isBouncing, isDestination }) => {
  const type = special?.type ?? "normal";
  const flavor = getSquareFlavor(num, type);
  const isSpecial = type !== "normal" && type !== "ladder-top" && type !== "snake-tail";

  return (
    <div
      className={`
        board-cell relative flex flex-col items-center justify-center overflow-hidden
        border text-xs font-semibold select-none
        bg-gradient-to-br ${flavor.className}
        ${isPlayer ? "token-glow ring-4 ring-sky-400 z-20 scale-[1.08] shadow-[0_0_20px_rgba(59,130,246,0.4)] rounded-md" : "rounded-sm"}
        ${isDestination ? "ring-2 ring-offset-1 ring-orange-300 z-10" : ""}
      `}
      style={{ aspectRatio: "1" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_55%)] pointer-events-none" />
      <span className="absolute top-1 left-1 text-[10px] font-black opacity-70 leading-none">{num}</span>
      
      {isSpecial && !isPlayer && (
        <span className="text-2xl opacity-20 absolute z-0 pointer-events-none">
          {type === "snake-head" ? "🐍" : type === "ladder-foot" ? "🪜" : "❓"}
        </span>
      )}

      {!isPlayer && flavor.badge && (
        <span className="absolute top-1 right-1 text-xs z-10 drop-shadow-sm">{flavor.badge}</span>
      )}

      {isPlayer && (
        <div className={`relative z-10 ${isBouncing ? "animate-player-bounce" : ""}`} title="आपकी स्थिति">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-lg">
            🎓
          </div>
        </div>
      )}
      {!isPlayer && special?.label && (
        <span className="text-[9px] font-bold mt-4 leading-none text-center bg-white/90 px-1.5 py-0.5 rounded shadow-sm z-10">{special.label}</span>
      )}
    </div>
  );
};

// ─── Main Game Component ──────────────────────────────────────────────────────

const GyanKiYatra: React.FC = () => {
  const navigate = useNavigate();
  const storedStudent = (() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "{}")?.student || getCurrentUser() || {};
    } catch {
      return getCurrentUser() || {};
    }
  })();
  const classNumber = resolveClassNumber(storedStudent);
  const [language, setLanguage] = useState(() => localStorage.getItem("appLanguage") || "hi");

  // Game state
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [position, setPosition] = useState(0); 
  const [displayPosition, setDisplayPosition] = useState(0); // For smooth walking
  const [targetPosition, setTargetPosition] = useState(0);
  
  const [diceValue, setDiceValue] = useState<number>(1);
  const [rolling, setRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);
  const [skipTurns, setSkipTurns] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [currentDestination, setCurrentDestination] = useState<number | null>(null);

  // Animations
  const [showSnakeAnimation, setShowSnakeAnimation] = useState(false);
  const [showLadderAnimation, setShowLadderAnimation] = useState(false);
  const [playerBouncing, setPlayerBouncing] = useState(false);

  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionContext, setQuestionContext] = useState<"ladder" | "snake" | "question" | null>(null);
  const [landedSquare, setLandedSquare] = useState<number>(0);

  // Score / log
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Question pool tracking
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("maths");
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState("");
  const [usedQIds, setUsedQIds] = useState<Set<string>>(new Set());
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [gameStartedAt, setGameStartedAt] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [reviewAnswers, setReviewAnswers] = useState<JourneyReviewItem[]>([]);

  // Confetti for win
  const [stars, setStars] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [log]);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLanguage(detail?.language || localStorage.getItem("appLanguage") || "hi");
    };

    window.addEventListener("appLanguageChanged", handleLanguageChange);
    return () => window.removeEventListener("appLanguageChanged", handleLanguageChange);
  }, []);

  useEffect(() => {
    let active = true;

    const loadQuestions = async () => {
      try {
        setLoadingQuestions(true);
        setQuestionError("");
        const res = await axios.get(`${API_URL}/quizzes/adaptive-test/questions/${classNumber}`, {
          params: { studentId: storedStudent?.studentId },
        });
        if (!active) return;
        setQuestionBank(Array.isArray(res.data.questions) ? res.data.questions : []);
      } catch (error) {
        console.error("Failed to load Gyan Ki Yatra questions:", error);
        if (active) setQuestionError("Question bank could not be loaded right now.");
      } finally {
        if (active) setLoadingQuestions(false);
      }
    };

    loadQuestions();
    return () => {
      active = false;
    };
  }, [classNumber, storedStudent?.studentId]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev, msg].slice(-10)); // Keep last 10
  }, []);

  const subjectQuestions = questionBank
    .filter((question) => question.subject === selectedSubject)
    .sort((a, b) => (a.eloRating || 0) - (b.eloRating || 0));

  const pickQuestion = useCallback((square: number): Question | null => {
    const subjectPool = questionBank
      .filter((question) => question.subject === selectedSubject)
      .sort((a, b) => (a.eloRating || 0) - (b.eloRating || 0));
    const available = subjectPool.filter((q) => !usedQIds.has(String(q.id)));
    const pool = available.length > 0 ? available : subjectPool;
    if (pool.length === 0) return null;

    const progress = clamp(square / 100, 0, 1);
    const targetIndex = Math.round(progress * (pool.length - 1));
    const windowSize = Math.max(4, Math.ceil(pool.length * 0.08));
    const start = Math.max(0, targetIndex - windowSize);
    const end = Math.min(pool.length, targetIndex + windowSize + 1);
    const difficultyWindow = pool.slice(start, end);
    const q = difficultyWindow[Math.floor(Math.random() * difficultyWindow.length)];
    setUsedQIds((prev) => new Set([...prev, q.id]));
    return q;
  }, [questionBank, selectedSubject, usedQIds]);

  const triggerWin = useCallback(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${3 + Math.random() * 2}s`
    }));
    setStars(newStars);
    setCompletedAt(Date.now());
    setPhase("won");

    // Record the answered questions against the student's real adaptive
    // rating/history, same endpoint the Adaptive Test page submits to, so
    // progress made during the game isn't silently lost.
    if (storedStudent?.studentId && reviewAnswers.length > 0) {
      axios
        .post(`${API_URL}/quizzes/adaptive-test/submit`, {
          studentId: storedStudent.studentId,
          className: String(classNumber),
          startedAt: gameStartedAt ? new Date(gameStartedAt).toISOString() : undefined,
          answers: reviewAnswers.map((item) => ({
            question: item.question,
            selectedOptionIndex: item.selectedOptionIndex,
            hintUsed: false,
            timeSpentMs: item.timeSpentMs,
          })),
        })
        .catch((error) => console.error("Failed to save Gyan Ki Yatra progress:", error));
    }
  }, [reviewAnswers, storedStudent?.studentId, classNumber, gameStartedAt]);

  const openQuestion = useCallback((square: number, context: "ladder" | "snake" | "question") => {
    const question = pickQuestion(square);
    if (!question) {
      addLog("⚠️ इस विषय के प्रश्न उपलब्ध नहीं हैं। दूसरा विषय चुनें।");
      setCanRoll(true);
      return;
    }

    setLandedSquare(square);
    setCurrentQuestion(question);
    setQuestionContext(context);
    setQuestionStartedAt(Date.now());
    setSelectedOption(null);
    setPhase("question");
  }, [addLog, pickQuestion]);

  const handleArrivalAtSquare = useCallback((newPos: number) => {
    addLog(`📍 घर ${newPos} पर पहुँचे`);
    
    if (newPos === 100) {
      triggerWin();
      return;
    }

    const special = SPECIAL_SQUARES[newPos];
    if (special) {
      if (special.type === "ladder-foot") {
        openQuestion(newPos, "ladder");
      } else if (special.type === "snake-head") {
        setShowSnakeAnimation(true);
        setTimeout(() => {
          setShowSnakeAnimation(false);
          openQuestion(newPos, "snake");
        }, 1800);
      } else if (special.type === "question") {
        openQuestion(newPos, "question");
      } else {
        setCanRoll(true);
      }
    } else {
      setCanRoll(true);
    }
  }, [addLog, triggerWin, openQuestion]);

  // Player walking effect
  useEffect(() => {
    if (displayPosition < targetPosition) {
      setIsWalking(true);
      const timer = setTimeout(() => {
        setDisplayPosition(prev => prev + 1);
        setPlayerBouncing(true);
        setTimeout(() => setPlayerBouncing(false), 200);
      }, 300);
      return () => clearTimeout(timer);
    } else if (displayPosition > targetPosition) {
       // walking backwards (penalty)
       setIsWalking(true);
       const timer = setTimeout(() => {
         setDisplayPosition(prev => prev - 1);
         setPlayerBouncing(true);
         setTimeout(() => setPlayerBouncing(false), 200);
       }, 300);
       return () => clearTimeout(timer);
    } else if (isWalking && displayPosition === targetPosition) {
      setIsWalking(false);
      setCurrentDestination(null);
      handleArrivalAtSquare(targetPosition);
    }
  }, [displayPosition, targetPosition, isWalking, handleArrivalAtSquare]);

  const movePlayerInstantly = useCallback((destination: number) => {
    setPosition(destination);
    setDisplayPosition(destination);
    setTargetPosition(destination);
    setCurrentDestination(null);
    setIsWalking(false);
  }, []);

  // ── Roll dice ──────────────────────────────────────────────────────────────
  const rollDice = useCallback(() => {
    if (!canRoll || rolling || phase !== "playing" || isWalking) return;

    if (skipTurns > 0) {
      setSkipTurns((s) => s - 1);
      addLog(`⏭️ आपकी बारी छोड़ी गई। (${skipTurns - 1} बारी और छूटेगी)`);
      return;
    }

    setRolling(true);
    setCanRoll(false);

    const roll = Math.ceil(Math.random() * 6);

    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6));
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setDiceValue(roll);
        setRolling(false);
        const newPos = position + roll;
        
        if (newPos > 100) {
          addLog(`🎲 पासा: ${roll} — आगे नहीं बढ़ सकते (100 से आगे)`);
          setMoves((m) => m + 1);
          setCanRoll(true);
        } else {
          setMoves((m) => m + 1);
          setPosition(newPos);
          setTargetPosition(newPos);
          setCurrentDestination(newPos);
          addLog(`🎲 पासा: ${roll} → आगे बढ़ रहे हैं...`);
        }
      }
    }, 60);
  }, [canRoll, rolling, phase, skipTurns, position, isWalking, addLog]);

  // ── Answer a question ──────────────────────────────────────────────────────
  const handleAnswer = useCallback((idx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(idx);

    const correctIndex = Number.isInteger(currentQuestion.correctAnswerIndex)
      ? Number(currentQuestion.correctAnswerIndex)
      : Number(currentQuestion.correct || 0);
    const isCorrect = idx === correctIndex;
    setReviewAnswers((answers) => [
      ...answers,
      {
        question: currentQuestion,
        selectedOptionIndex: idx,
        isCorrect,
        square: landedSquare,
        context: questionContext,
        timeSpentMs: Date.now() - questionStartedAt,
      },
    ]);

    if (isCorrect) {
      setScore((s) => s + 10);
    }

    if (questionContext === "ladder") {
      const dest = SPECIAL_SQUARES[landedSquare]?.connects ?? landedSquare;
      if (isCorrect) {
        setShowLadderAnimation(true);
        setTimeout(() => setShowLadderAnimation(false), 1200);
        setTimeout(() => {
          movePlayerInstantly(dest);
          if (dest === 100) {
            triggerWin();
          }
        }, 350);
        addLog(`✅ सही! सीढ़ी चढ़ गए → घर ${dest}`);
      } else {
        movePlayerInstantly(landedSquare);
        addLog(`❌ गलत! सीढ़ी के नीचे रहे → घर ${landedSquare}`);
      }
    } else if (questionContext === "snake") {
      if (isCorrect) {
        movePlayerInstantly(landedSquare);
        addLog(`✅ सही! साँप से बच गए → घर ${landedSquare} पर रहे`);
      } else {
        const dest = SPECIAL_SQUARES[landedSquare]?.connects ?? landedSquare;
        movePlayerInstantly(dest);
        addLog(`❌ गलत! साँप ने नीचे गिराया → घर ${dest} पर गए`);
      }
    } else {
      // Question box
      if (isCorrect) {
        const bonus = 2;
        const newPos = Math.min(position + bonus, 100);
        setPosition(newPos);
        setTargetPosition(newPos);
        setCurrentDestination(newPos);
        addLog(`✅ सही! +${bonus} कदम आगे → घर ${newPos}`);
        if (newPos === 100) setTimeout(triggerWin, 1500);
      } else {
        const penalty = 2;
        const newPos = Math.max(position - penalty, 1);
        setPosition(newPos);
        setTargetPosition(newPos);
        setCurrentDestination(newPos);
        setSkipTurns(1);
        addLog(`❌ गलत! -${penalty} कदम पीछे और अगली बारी छूटेगी`);
      }
    }

    setTimeout(() => {
      setPhase("result-feedback");
    }, 500);
  }, [selectedOption, currentQuestion, questionContext, landedSquare, position, addLog, movePlayerInstantly, triggerWin, questionStartedAt]);

  const dismissFeedback = useCallback(() => {
    setPhase("playing");
    setCurrentQuestion(null);
    setSelectedOption(null);
    setQuestionContext(null);
    if (displayPosition === targetPosition) {
      setCanRoll(true);
    }
  }, [displayPosition, targetPosition]);

  const resetGame = useCallback(() => {
    setPhase("playing");
    setPosition(0);
    setDisplayPosition(0);
    setTargetPosition(0);
    setCurrentDestination(null);
    setDiceValue(1);
    setRolling(false);
    setCanRoll(true);
    setSkipTurns(0);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setQuestionContext(null);
    setLandedSquare(0);
    setScore(0);
    setMoves(0);
    setLog([]);
    setUsedQIds(new Set());
    setReviewAnswers([]);
    setGameStartedAt(Date.now());
    setCompletedAt(null);
    setStars([]);
  }, []);

  const startGame = useCallback(() => {
    if (loadingQuestions || subjectQuestions.length === 0) return;
    setPhase("playing");
    setPosition(0);
    setDisplayPosition(0);
    setTargetPosition(0);
    setCurrentDestination(null);
    setDiceValue(1);
    setRolling(false);
    setCanRoll(true);
    setSkipTurns(0);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setQuestionContext(null);
    setLandedSquare(0);
    setScore(0);
    setMoves(0);
    setLog([]);
    setUsedQIds(new Set());
    setReviewAnswers([]);
    setGameStartedAt(Date.now());
    setCompletedAt(null);
    setStars([]);
  }, [loadingQuestions, subjectQuestions.length]);

  const selectedSubjectMeta = SUBJECT_OPTIONS.find((subject) => subject.id === selectedSubject) || SUBJECT_OPTIONS[0];
  const isHindi = language === "hi";
  const questionText = (question: Question) =>
    isHindi ? (question.questionHindi || question.question) : question.question;
  const questionOptions = (question: Question) =>
    isHindi && question.optionsHindi?.length === question.options.length ? question.optionsHindi : question.options;
  const questionExplanation = (question: Question) =>
    isHindi ? (question.explanationHindi || question.explanation || "") : (question.explanation || question.explanationHindi || "");
  const correctIndexFor = (question: Question) =>
    Number.isInteger(question.correctAnswerIndex) ? Number(question.correctAnswerIndex) : Number(question.correct || 0);
  const correctAnswers = reviewAnswers.filter((item) => item.isCorrect).length;
  const incorrectAnswers = reviewAnswers.length - correctAnswers;
  const journeySeconds = gameStartedAt && completedAt ? Math.max(1, Math.round((completedAt - gameStartedAt) / 1000)) : 0;
  const accuracyRate = reviewAnswers.length ? correctAnswers / reviewAnswers.length : 0;
  const stepEfficiency = moves > 0 ? clamp(45 / moves, 0, 1) : 0;
  const timeEfficiency = journeySeconds > 0 ? clamp(900 / journeySeconds, 0, 1) : 0;
  const marsJourneyScore = Math.round(400 + 600 * (0.6 * accuracyRate + 0.25 * stepEfficiency + 0.15 * timeEfficiency));

  // ── Build board rows (top to bottom visually) ──────────────────────────────
  const boardRows: number[][] = [];
  for (let row = 9; row >= 0; row--) {
    const cells: number[] = [];
    for (let col = 0; col < 10; col++) {
      const visualCol = row % 2 === 0 ? col : 9 - col;
      const num = row * 10 + visualCol + 1;
      cells.push(num);
    }
    boardRows.push(cells);
  }

  const legend = [
    { color: "bg-emerald-400 border-emerald-500", label: "सीढ़ी: सही उत्तर पर सीधे ऊपर" },
    { color: "bg-rose-400 border-rose-500", label: "साँप: गलत उत्तर पर सीधे नीचे" },
    { color: "bg-amber-400 border-amber-500", label: "प्रश्न बॉक्स: +2 / -2" },
    { color: "bg-sky-500 border-sky-600", label: "आपका टोकन" },
  ];

  // ─── Render Helper functions ──────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-800 overflow-x-hidden selection:bg-orange-200 selection:text-orange-900">
      <style>{customStyles}</style>
      <Header />

      {/* ─── INTRO SCREEN ───────────────────────────────────────────────────── */}
      {phase === "intro" && (
        <main className="flex-1 py-12 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
          {/* Background decoration */}
          <div className="absolute top-10 left-10 text-8xl opacity-10 animate-pulse">🐍</div>
          <div className="absolute bottom-10 right-10 text-8xl opacity-10 animate-bounce">🪜</div>
          <div className="absolute top-1/2 left-1/4 text-6xl opacity-10 animate-dice-roll">🎲</div>

          <div className="container mx-auto px-4 max-w-2xl relative z-10">
            <div className="text-center mb-10 animate-slide-up">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl shadow-xl mb-6 transform hover:scale-105 transition-transform border border-white">
                <span className="text-6xl animate-player-bounce">🎲</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600 mb-2 drop-shadow-sm">
                ज्ञान की यात्रा
              </h1>
              <p className="text-xl text-orange-800 font-medium">Gyan Ki Yatra</p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 mb-8 animate-pop-in border border-orange-100 shadow-xl" style={{ animationDelay: '0.2s' }}>
              <h2 className="font-bold text-slate-800 text-xl flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-blue-500" />
                विषय चुनें
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {SUBJECT_OPTIONS.map((subject) => {
                  const count = questionBank.filter((question) => question.subject === subject.id).length;
                  const active = selectedSubject === subject.id;
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      className={`rounded-2xl border-2 p-4 text-left transition-all ${
                        active
                          ? "border-orange-500 bg-orange-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50"
                      }`}
                      onClick={() => setSelectedSubject(subject.id)}
                    >
                      <p className="font-black text-slate-900">{isHindi ? subject.labelHindi : subject.label}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {loadingQuestions ? "Loading..." : `${count} questions`}
                      </p>
                    </button>
                  );
                })}
              </div>
              {questionError && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {questionError}
                </div>
              )}
              {!loadingQuestions && subjectQuestions.length === 0 && !questionError && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  इस विषय के लिए आपकी कक्षा में प्रश्न उपलब्ध नहीं हैं।
                </div>
              )}

              <h2 className="font-bold text-slate-800 text-xl flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-orange-500" />
                खेल के नियम
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors border border-emerald-100">
                  <span className="text-3xl">🪜</span>
                  <div>
                    <p className="font-bold text-emerald-700 text-base">सीढ़ी</p>
                    <p>सही उत्तर पर सीढ़ी चढ़ें।</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors border border-rose-100">
                  <span className="text-3xl">🐍</span>
                  <div>
                    <p className="font-bold text-rose-700 text-base">साँप</p>
                    <p>सही उत्तर देकर साँप से बचें।</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors border border-amber-100">
                  <span className="text-3xl">❓</span>
                  <div>
                    <p className="font-bold text-amber-700 text-base">प्रश्न बॉक्स</p>
                    <p>सही: +2 कदम, गलत: -2 कदम।</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-100">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <p className="font-bold text-blue-700 text-base">लक्ष्य</p>
                    <p>घर 100 तक पहुँचें और जीतें!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Button
                variant="outline"
                className="flex-1 py-6 text-lg rounded-2xl border-orange-200 text-orange-700 bg-white hover:bg-orange-50"
                onClick={() => navigate("/student/multimedia/puzzles")}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                वापस जाएं
              </Button>
              <Button
                className="flex-[2] bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xl py-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                onClick={startGame}
                disabled={loadingQuestions || subjectQuestions.length === 0}
              >
                <Play className="h-6 w-6 mr-2" />
                {loadingQuestions ? "प्रश्न लोड हो रहे हैं..." : "खेल शुरू करें"}
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* ─── WON SCREEN ──────────────────────────────────────────────────────── */}
      {phase === "won" && (
        <main className="flex-1 py-12 relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
          {/* Confetti / Stars Background */}
          {stars.map((star) => (
             <div 
               key={star.id} 
               className="absolute top-0 text-orange-400 animate-star-shower text-2xl"
               style={{ 
                 left: star.left, 
                 animationDelay: star.delay, 
                 animationDuration: star.duration,
                 animationName: 'starShower',
                 animationIterationCount: 'infinite',
                 animationTimingFunction: 'linear'
               }}
             >
               ⭐
             </div>
          ))}

          <div className="container mx-auto px-4 max-w-lg text-center relative z-10">
            <div className="mb-8 animate-slide-up">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-6 border-4 border-white">
                <Trophy className="h-16 w-16 text-white animate-pulse" />
              </div>
              <h1 className="text-6xl font-extrabold text-slate-800 mb-4 drop-shadow-sm">अद्भुत!</h1>
              <p className="text-2xl text-orange-600 font-bold">आपने ज्ञान की यात्रा पूरी कर ली!</p>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 mb-10 animate-pop-in border border-orange-200 shadow-xl" style={{ animationDelay: '0.2s' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <p className="text-5xl font-black text-amber-600 mb-2">{score}</p>
                  <p className="text-sm text-amber-800 uppercase tracking-wider font-bold">कुल अंक</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <p className="text-5xl font-black text-blue-600 mb-2">{moves}</p>
                  <p className="text-sm text-blue-800 uppercase tracking-wider font-bold">कुल चालें</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                  <p className="text-4xl font-black text-emerald-600 mb-2">{correctAnswers}/{reviewAnswers.length}</p>
                  <p className="text-sm text-emerald-800 uppercase tracking-wider font-bold">सही उत्तर</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                  <p className="text-4xl font-black text-purple-600 mb-2">{marsJourneyScore}</p>
                  <p className="text-sm text-purple-800 uppercase tracking-wider font-bold">MARS Score</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                <p>{isHindi ? selectedSubjectMeta.labelHindi : selectedSubjectMeta.label} • {journeySeconds}s • {incorrectAnswers} गलत</p>
                <p className="mt-1 text-xs text-slate-500">Score combines correct answers, steps taken, and completion time.</p>
              </div>
              {reviewAnswers.length > 0 && (
                <div className="mt-6 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white text-left">
                  <div className="sticky top-0 bg-white px-4 py-3 border-b border-slate-100 font-black text-slate-800">
                    Review Questions
                  </div>
                  <div className="divide-y divide-slate-100">
                    {reviewAnswers.map((item, index) => {
                      const options = questionOptions(item.question);
                      const correctIndex = correctIndexFor(item.question);
                      return (
                        <div key={`${item.question.id}-${index}`} className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-bold text-slate-900">{index + 1}. {questionText(item.question)}</p>
                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                              {item.isCorrect ? "Correct" : "Wrong"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">Your answer: {options[item.selectedOptionIndex] || "Not answered"}</p>
                          <p className="text-sm text-emerald-700">Correct answer: {options[correctIndex]}</p>
                          {questionExplanation(item.question) && (
                            <p className="mt-2 text-sm text-slate-600">{questionExplanation(item.question)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Button
                variant="outline"
                className="flex-1 py-6 text-lg rounded-2xl border-orange-200 text-orange-700 bg-white hover:bg-orange-50"
                onClick={() => navigate("/student/multimedia/puzzles")}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                बाहर निकलें
              </Button>
              <Button
                className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xl py-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
                onClick={resetGame}
              >
                <RotateCcw className="h-6 w-6 mr-2" />
                फिर से खेलें
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* ─── FULL SCREEN ANIMATIONS (Snake / Ladder) ───────────────────────── */}
      {showSnakeAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center animate-snake-bite">
            <span className="text-[150px] drop-shadow-2xl">🐍</span>
            <h2 className="text-rose-500 font-black text-6xl mt-6 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              साँप!
            </h2>
            <p className="text-white text-xl mt-4 font-semibold">प्रश्न का सही उत्तर देकर बचें!</p>
          </div>
        </div>
      )}

      {showLadderAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-900/70 backdrop-blur-sm">
          <div className="flex flex-col items-center animate-ladder-climb">
            <span className="text-[120px] drop-shadow-2xl">🪜</span>
            <span className="text-[80px] -mt-10 animate-player-bounce z-10">🧑‍🚀</span>
            <h2 className="text-emerald-300 font-black text-5xl mt-8 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
              शानदार!
            </h2>
          </div>
        </div>
      )}

      {/* ─── PLAYING SCREEN ──────────────────────────────────────────────────── */}
      {(phase === "playing" || phase === "question" || phase === "result-feedback") && (
        <main className="flex-1 py-6 relative overflow-hidden bg-[radial-gradient(circle_at_top,#fff7ed,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
          <div className="absolute inset-0 pointer-events-none opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            {/* Top Stats Bar */}
            <div className="bg-white/85 backdrop-blur-md rounded-[28px] shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)] border border-white/70 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="ghost"
                className="text-slate-600 hover:bg-slate-100 rounded-xl"
                onClick={() => navigate("/student/multimedia/puzzles")}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                पीछे
              </Button>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                <div className="bg-gradient-to-br from-orange-400 via-amber-400 to-rose-500 text-white p-2 rounded-xl shadow-md text-sm border border-orange-200">
                  🐍
                </div>
                ज्ञान की यात्रा
              </h1>
              <div className="flex gap-3">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold shadow-sm">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  {score} अंक
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold shadow-sm">
                  <Zap className="h-5 w-5 text-blue-500 fill-blue-500" />
                  {moves} चाल
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
              {/* ── Board ─────────────────────────────────────────────────── */}
              <div className="flex-[2] flex flex-col items-center relative">
                <div className="mb-5 w-full max-w-[650px] rounded-[28px] border border-white/60 bg-white/75 backdrop-blur-md px-5 py-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-500">Real Snake & Ladder</p>
                      <p className="text-xl font-black text-slate-900">Dice walk, instant snake and ladder jump</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                      <span className="text-lg">🎯</span>
                      <span>{displayPosition === 0 ? "Start" : `House ${displayPosition}`}</span>
                    </div>
                  </div>
                </div>
                <div
                  className="board-shell relative grid border-[10px] border-slate-900 rounded-[32px] overflow-hidden shadow-[0_30px_90px_-30px_rgba(15,23,42,0.8)]"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(10, 1fr)",
                    width: "100%",
                    maxWidth: "650px",
                    gap: "2px",
                    padding: "6px",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_30%)] pointer-events-none z-[1]" />
                  <BoardOverlay />
                  {boardRows.map((row) =>
                    row.map((num) => (
                      <BoardCell
                        key={num}
                        num={num}
                        isPlayer={num === displayPosition}
                        special={SPECIAL_SQUARES[num]}
                        isBouncing={num === displayPosition && playerBouncing}
                        isDestination={num === currentDestination}
                      />
                    ))
                  )}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap justify-center gap-4 bg-white/85 backdrop-blur-md px-6 py-4 rounded-[24px] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.8)] border border-white/70">
                  {legend.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <div className={`w-4 h-4 rounded-full border ${l.color}`} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Side Panel ────────────────────────────────────────────── */}
              <div className="flex-1 space-y-6 max-w-md mx-auto xl:mx-0 w-full">
                {/* Dice Area */}
                <div className="bg-white/85 backdrop-blur-md rounded-[30px] border border-white/70 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.75)] p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-bl-full pointer-events-none opacity-70" />
                  <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-sky-100 to-transparent rounded-tr-full pointer-events-none opacity-60" />
                  
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">पासा फेंकें</h3>
                  
                  <div className="flex justify-center mb-8">
                    <DiceFace value={diceValue} rolling={rolling} />
                  </div>
                  
                  <Button
                    className={`w-full text-lg font-bold py-6 rounded-2xl shadow-md transition-all ${
                      canRoll && !rolling && phase === "playing" && !isWalking
                        ? "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 hover:scale-[1.02] text-white"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    }`}
                    onClick={rollDice}
                    disabled={!canRoll || rolling || phase !== "playing" || isWalking}
                  >
                    {rolling || isWalking
                      ? "चल रहे हैं..."
                      : skipTurns > 0
                      ? `बारी छोड़ें (${skipTurns})`
                      : "पासा फेंकें (Roll)"}
                  </Button>
                </div>

                {/* Status & Log Combined */}
                <div className="bg-white/85 backdrop-blur-md rounded-[30px] border border-white/70 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.75)] p-6">
                  <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-100">
                     <div>
                       <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">स्थिति</p>
                       <p className="text-3xl font-black text-slate-800">
                         {displayPosition === 0 ? "प्रारंभ" : `घर ${displayPosition}`}
                       </p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">लक्ष्य</p>
                       <p className="text-xl font-bold text-emerald-600">100</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 mb-1">Next Climb</p>
                      <p className="text-sm font-semibold text-emerald-900">Correct answer on a ladder moves you instantly.</p>
                    </div>
                    <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 mb-1">Snake Risk</p>
                      <p className="text-sm font-semibold text-rose-900">Wrong answer on a snake drops you instantly.</p>
                    </div>
                  </div>

                  {skipTurns > 0 && (
                    <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 font-semibold animate-pulse">
                      <AlertTriangle className="h-5 w-5" />
                      <span>{skipTurns} बारी छूटेगी</span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-400" />
                      गतिविधि (Activity)
                    </h3>
                    <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
                      {log.length === 0 && (
                        <p className="text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-slate-100">खेल शुरू करने के लिए पासा फेंकें!</p>
                      )}
                      {log.map((entry, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-xl ${i === log.length - 1 ? "bg-orange-50 text-orange-800 font-semibold border border-orange-200 animate-slide-up" : "text-slate-600 bg-slate-50 border border-slate-100"}`}
                        >
                          {entry}
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── Question Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={phase === "question" || phase === "result-feedback"}
        onOpenChange={() => {}}
      >
        <DialogContent
          className="max-w-xl p-0 overflow-hidden border-0 rounded-3xl shadow-2xl bg-white"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Dialog Header with contextual gradient */}
          <div className={`px-6 py-5 text-white ${
              questionContext === "ladder" ? "bg-gradient-to-r from-emerald-500 to-teal-600" :
              questionContext === "snake" ? "bg-gradient-to-r from-rose-500 to-pink-600" :
              "bg-gradient-to-r from-amber-500 to-orange-600"
            }`}
          >
            <DialogTitle className="flex items-center gap-3 text-2xl font-black">
              {questionContext === "ladder" && <>🪜 सीढ़ी का प्रश्न</>}
              {questionContext === "snake" && <>🐍 साँप का प्रश्न</>}
              {questionContext === "question" && <>❓ बोनस प्रश्न</>}
            </DialogTitle>
            <p className="text-white/90 text-sm mt-1 font-medium">
              {questionContext === "ladder" && "सही उत्तर दें और सीढ़ी चढ़ें!"}
              {questionContext === "snake" && "सही उत्तर दें और साँप से बचें!"}
              {questionContext === "question" && "सही उत्तर पर +2 कदम आगे!"}
            </p>
          </div>

          <div className="p-6">
            {currentQuestion && (
              <div className="space-y-6">
                {/* Question Text */}
                <p className="font-bold text-slate-800 text-lg sm:text-xl leading-relaxed">
                  {questionText(currentQuestion)}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  {questionOptions(currentQuestion).map((opt, idx) => {
                    let btnClass = "w-full text-left px-5 py-4 rounded-2xl border-2 text-base font-semibold transition-all flex items-center justify-between ";
                    const correctIndex = correctIndexFor(currentQuestion);

                    if (selectedOption === null) {
                      btnClass += "border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 hover:shadow-sm cursor-pointer text-slate-700";
                    } else if (idx === correctIndex) {
                      btnClass += "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
                    } else if (idx === selectedOption) {
                      btnClass += "border-rose-400 bg-rose-50 text-rose-800";
                    } else {
                      btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
                    }

                    const labels = ["A", "B", "C", "D"];

                    return (
                      <button
                        key={idx}
                        className={btnClass}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedOption !== null}
                      >
                        <div className="flex items-center">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm border-2 ${
                            selectedOption === null ? "border-slate-200 text-slate-500 bg-slate-100" : 
                            idx === currentQuestion.correct ? "border-emerald-500 bg-emerald-100 text-emerald-700" :
                            idx === selectedOption ? "border-rose-400 bg-rose-100 text-rose-700" : "border-slate-200 bg-slate-100 text-slate-400"
                          }`}>
                            {labels[idx]}
                          </span>
                          {opt}
                        </div>
                        {selectedOption !== null && idx === correctIndex && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 animate-pop-in" />
                        )}
                        {selectedOption === idx && idx !== correctIndex && (
                          <XCircle className="h-6 w-6 text-rose-500 animate-pop-in" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation + Continue */}
                {selectedOption !== null && (
                  <div className="space-y-4 animate-slide-up mt-6">
                    <div
                      className={`p-5 rounded-2xl text-sm border ${
                        selectedOption === correctIndexFor(currentQuestion)
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-rose-50 border-rose-200 text-rose-900"
                      }`}
                    >
                      <p className="font-bold text-lg mb-2 flex items-center gap-2">
                        {selectedOption === correctIndexFor(currentQuestion)
                          ? <><CheckCircle2 className="h-5 w-5 text-emerald-500"/> शाबाश! सही उत्तर</>
                          : <><XCircle className="h-5 w-5 text-rose-500"/> गलत उत्तर</>}
                      </p>
                      <p className="text-base opacity-90">{questionExplanation(currentQuestion)}</p>
                    </div>
                    <Button
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-lg py-6 rounded-2xl shadow-md"
                      onClick={dismissFeedback}
                    >
                      आगे बढ़ें →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer only if not in playing phase (to maximize board space) */}
      {phase !== "playing" && phase !== "question" && phase !== "result-feedback" && <Footer />}
    </div>
  );
};

export default GyanKiYatra;
