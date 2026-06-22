import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  Info,
} from "lucide-react";

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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
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
  { id: 1, question: "Pi Day (π दिवस) किस तारीख को मनाया जाता है?", options: ["14 मार्च", "22 जुलाई", "28 फरवरी", "15 अप्रैल"], correct: 0, explanation: "π ≈ 3.14 होने के कारण Pi Day 14 मार्च (3/14) को मनाया जाता है।" },
  { id: 2, question: "समान्तर चतुर्भुज (Parallelogram) का क्षेत्रफल क्या होता है?", options: ["आधार × ऊँचाई", "½ × आधार × ऊँचाई", "भुजा²", "π × r²"], correct: 0, explanation: "समान्तर चतुर्भुज का क्षेत्रफल = आधार × ऊँचाई (Base × Height)" },
  { id: 3, question: "P=₹50,000, R=8% प्रतिवर्ष, T=2 वर्ष। साधारण ब्याज (SI) कितना होगा?", options: ["₹8,000", "₹6,500", "₹10,000", "₹7,200"], correct: 0, explanation: "SI = P×R×T/100 = 50000×8×2/100 = ₹8,000" },
  { id: 4, question: "√144 का मान क्या है?", options: ["12", "14", "11", "13"], correct: 0, explanation: "12 × 12 = 144, अतः √144 = 12" },
  { id: 5, question: "बेयज़ प्रमेय (Bayes' Theorem) का सूत्र क्या है?", options: ["P(A|B) = P(B|A)·P(A) / P(B)", "P(A|B) = P(A) + P(B)", "P(A∩B) = P(A) · P(B)", "P(A|B) = P(A) / P(B)"], correct: 0, explanation: "बेयज़ प्रमेय: P(A|B) = [P(B|A) × P(A)] / P(B)" },
  { id: 6, question: "π (Pi) का लगभग मान क्या है?", options: ["3.14159", "2.71828", "1.61803", "1.41421"], correct: 0, explanation: "π ≈ 3.14159 — यह एक अपरिमेय संख्या है।" },
  { id: 7, question: "एक गैर-लीप वर्ष (Non-leap year) में ठीक 53 रविवार होने की प्रायिकता क्या है?", options: ["1/7", "2/7", "3/7", "1/4"], correct: 0, explanation: "गैर-लीप वर्ष में 365 दिन = 52 सप्ताह + 1 अतिरिक्त दिन। वह 1 दिन रविवार होने की P = 1/7" },
  { id: 8, question: "द्विघात समीकरण x² – 5x + 6 = 0 के मूलों का योग क्या होगा?", options: ["5", "6", "-5", "-6"], correct: 0, explanation: "ax² + bx + c = 0 में मूलों का योग = -b/a = -(-5)/1 = 5" },
  { id: 9, question: "3 मुर्गियाँ 3 दिन में 3 अंडे देती हैं। 12 मुर्गियाँ 12 दिन में कितने अंडे देंगी?", options: ["48", "36", "12", "24"], correct: 0, explanation: "1 मुर्गी 3 दिन में 1 अंडा देती है, अतः 12 मुर्गियाँ 12 दिन में = 12 × 4 = 48 अंडे" },
  { id: 10, question: "दो संख्याओं का योग 25 है और अंतर 13 है। उनका गुणनफल क्या होगा?", options: ["114", "112", "116", "120"], correct: 0, explanation: "a+b=25, a-b=13 → a=19, b=6 → गुणनफल = 19×6 = 114" },
  { id: 11, question: "चक्रवृद्धि ब्याज (Compound Interest) का सूत्र क्या है?", options: ["A = P(1 + R/100)ⁿ", "SI = P×R×T/100", "A = P + P×R×T", "CI = P×R/100"], correct: 0, explanation: "CI सूत्र: A = P(1 + R/100)ⁿ, जहाँ n वर्षों की संख्या है।" },
  { id: 12, question: "यदि कोई वस्तु ₹500 में खरीदी और 15% लाभ पर बेची जाए, तो विक्रय मूल्य क्या होगा?", options: ["₹575", "₹550", "₹600", "₹525"], correct: 0, explanation: "विक्रय मूल्य = CP × (1 + Profit%/100) = 500 × 1.15 = ₹575" },
  { id: 13, question: "त्रिभुज की सर्वांगसमता (Congruence) की शर्त SSS का अर्थ क्या है?", options: ["तीनों भुजाएँ बराबर हों", "दो भुजाएँ और एक कोण बराबर हो", "दो कोण और एक भुजा बराबर हो", "तीनों कोण बराबर हों"], correct: 0, explanation: "SSS (Side-Side-Side): यदि दोनों त्रिभुजों की तीनों भुजाएँ बराबर हों तो वे सर्वांगसम हैं।" },
  { id: 14, question: "यदि किसी घन (Cube) की भुजा 4 cm है, तो उसका आयतन कितना होगा?", options: ["64 cm³", "48 cm³", "32 cm³", "96 cm³"], correct: 0, explanation: "घन का आयतन = भुजा³ = 4³ = 64 cm³" },
  { id: 15, question: "LCM(12, 18) का मान क्या है?", options: ["36", "72", "24", "54"], correct: 0, explanation: "12 = 2²×3, 18 = 2×3². LCM = 2²×3² = 36" },
  { id: 16, question: "रैखिक समीकरण 2x + 3 = 11 में x का मान क्या है?", options: ["4", "3", "5", "2"], correct: 0, explanation: "2x = 11 - 3 = 8, अतः x = 4" },
  { id: 17, question: "1 से 20 तक की सम संख्याओं का योग क्या है?", options: ["110", "100", "90", "120"], correct: 0, explanation: "2+4+6+…+20 = 2(1+2+…+10) = 2×55 = 110" },
  { id: 18, question: "यदि किसी वृत्त की त्रिज्या 7 cm है, तो उसका क्षेत्रफल क्या होगा? (π = 22/7)", options: ["154 cm²", "44 cm²", "78 cm²", "132 cm²"], correct: 0, explanation: "क्षेत्रफल = πr² = (22/7) × 7² = 22 × 7 = 154 cm²" },
  { id: 19, question: "पाइथागोरस प्रमेय के अनुसार, कर्ण (Hypotenuse) का सूत्र क्या है?", options: ["c² = a² + b²", "c = a + b", "c² = a² - b²", "c = a² + b²"], correct: 0, explanation: "पाइथागोरस: c² = a² + b², जहाँ c कर्ण और a, b अन्य दो भुजाएँ हैं।" },
  { id: 20, question: "100 का 15% कितना होगा?", options: ["15", "10", "20", "12"], correct: 0, explanation: "15% of 100 = (15/100) × 100 = 15" },
];

// ─── Board Configuration ──────────────────────────────────────────────────────

const LADDERS: Record<number, number> = {
  7: 28, 11: 32, 17: 38, 21: 42, 34: 46, 44: 95, 48: 74, 59: 61, 69: 90, 79: 98
};

const SNAKES: Record<number, number> = {
  22: 3, 26: 5, 49: 30, 55: 25, 63: 37, 75: 54, 84: 43, 92: 72, 99: 39
};

const QUESTION_BOXES = new Set([4, 14, 19, 24, 29, 36, 51, 56, 60, 66, 70, 71, 77, 81, 87, 96]);

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
      style={{ filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.7))' }}
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
        
        const px = -ny * 1.5; 
        const py = nx * 1.5;
        
        return (
          <g key={`ladder-${start}`} opacity="0.85">
            <line x1={s.x - px} y1={s.y - py} x2={e.x - px} y2={e.y - py} stroke="#34d399" strokeWidth="0.8" strokeLinecap="round" />
            <line x1={s.x + px} y1={s.y + py} x2={e.x + px} y2={e.y + py} stroke="#34d399" strokeWidth="0.8" strokeLinecap="round" />
            <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#10b981" strokeWidth="2.5" strokeDasharray="1.5 2" />
          </g>
        );
      })}

      {/* Snakes */}
      {Object.entries(SNAKES).map(([head, tail]) => {
        const h = getCoords(Number(head));
        const t = getCoords(Number(tail));
        
        const cx1 = h.x + (t.x - h.x) * 0.3 + (h.y > t.y ? 12 : -12);
        const cy1 = h.y + (t.y - h.y) * 0.3 - 5;
        
        const cx2 = h.x + (t.x - h.x) * 0.7 - (h.y > t.y ? 12 : -12);
        const cy2 = h.y + (t.y - h.y) * 0.7 + 5;

        return (
          <g key={`snake-${head}`} opacity="0.9">
            <path
              d={`M ${h.x} ${h.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.x} ${t.y}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${h.x} ${h.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.x} ${t.y}`}
              fill="none"
              stroke="#7f1d1d"
              strokeWidth="1"
              strokeDasharray="1 1.5"
              strokeLinecap="round"
            />
            <circle cx={h.x} cy={h.y} r="1.5" fill="#ef4444" />
            <circle cx={h.x - 0.5} cy={h.y - 0.3} r="0.3" fill="#fff" />
            <circle cx={h.x + 0.5} cy={h.y - 0.3} r="0.3" fill="#fff" />
            <circle cx={h.x - 0.5} cy={h.y - 0.3} r="0.1" fill="#000" />
            <circle cx={h.x + 0.5} cy={h.y - 0.3} r="0.1" fill="#000" />
            {/* snake tongue */}
            <path d={`M ${h.x} ${h.y + 1.5} Q ${h.x - 0.5} ${h.y + 2.5} ${h.x - 1} ${h.y + 3}`} fill="none" stroke="#fca5a5" strokeWidth="0.2" />
            <path d={`M ${h.x} ${h.y + 1.5} Q ${h.x + 0.5} ${h.y + 2.5} ${h.x + 1} ${h.y + 3}`} fill="none" stroke="#fca5a5" strokeWidth="0.2" />
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
      className={`w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-300 border-4 border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center relative transform transition-all ${
        rolling ? "animate-dice-roll" : "hover:scale-105"
      }`}
      style={{
        boxShadow: rolling ? "0 0 20px rgba(245, 158, 11, 0.6)" : "0 10px 25px rgba(0,0,0,0.3)",
      }}
    >
      <svg width="72" height="72" viewBox="0 0 100 100">
        {dots[value]?.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="10" fill="#1e293b" className="animate-pop-in" />
        ))}
      </svg>
    </div>
  );
};

// ─── Board Cell ───────────────────────────────────────────────────────────────

const cellColors: Record<SquareType, string> = {
  normal: "bg-slate-800 from-slate-800 to-slate-900 text-slate-300 border-slate-700",
  "ladder-foot": "bg-emerald-950 from-emerald-900 to-emerald-950 text-emerald-300 border-emerald-800",
  "ladder-top": "bg-emerald-900 from-emerald-800 to-emerald-900 text-emerald-300 border-emerald-700",
  "snake-head": "bg-rose-950 from-rose-900 to-rose-950 text-rose-300 border-rose-800",
  "snake-tail": "bg-rose-900 from-rose-800 to-rose-900 text-rose-300 border-rose-700",
  question: "bg-amber-950 from-amber-900 to-amber-950 text-amber-300 border-amber-800",
};

interface BoardCellProps {
  num: number;
  isPlayer: boolean;
  special?: SpecialSquare;
  isBouncing: boolean;
}

const BoardCell: React.FC<BoardCellProps> = ({ num, isPlayer, special, isBouncing }) => {
  const type = special?.type ?? "normal";
  const base = cellColors[type];
  const isSpecial = type !== "normal" && type !== "ladder-top" && type !== "snake-tail";

  return (
    <div
      className={`
        board-cell relative flex flex-col items-center justify-center
        border text-xs font-semibold select-none
        bg-gradient-to-br ${base}
        ${isPlayer ? "ring-4 ring-blue-500 z-20 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.8)] rounded-md" : "rounded-sm"}
      `}
      style={{ aspectRatio: "1" }}
    >
      <span className="absolute top-1 left-1 text-[10px] text-slate-400 font-bold opacity-70 leading-none">{num}</span>
      
      {isSpecial && !isPlayer && (
        <span className="text-2xl opacity-10 absolute z-0 pointer-events-none filter grayscale">
          {type === "snake-head" ? "🐍" : type === "ladder-foot" ? "🪜" : "❓"}
        </span>
      )}

      {isPlayer && (
        <div className={`relative z-10 text-3xl drop-shadow-lg filter ${isBouncing ? "animate-player-bounce" : ""}`} title="आपकी स्थिति">
          🧑‍🚀
        </div>
      )}
      {!isPlayer && special?.label && (
        <span className="text-[9px] font-bold mt-4 leading-none text-center bg-slate-900/80 px-1.5 py-0.5 rounded z-10 text-white/90">{special.label}</span>
      )}
    </div>
  );
};

// ─── Main Game Component ──────────────────────────────────────────────────────

const GyanKiYatra: React.FC = () => {
  const navigate = useNavigate();

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
  const [usedQIds, setUsedQIds] = useState<Set<number>>(new Set());

  // Confetti for win
  const [stars, setStars] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [log]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev, msg].slice(-10)); // Keep last 10
  }, []);

  const pickQuestion = useCallback((): Question => {
    const available = QUESTIONS.filter((q) => !usedQIds.has(q.id));
    const pool = available.length > 0 ? available : QUESTIONS;
    const q = pool[Math.floor(Math.random() * pool.length)];
    setUsedQIds((prev) => new Set([...prev, q.id]));
    return q;
  }, [usedQIds]);

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
      handleArrivalAtSquare(targetPosition);
    }
  }, [displayPosition, targetPosition, isWalking]);

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
          addLog(`🎲 पासा: ${roll} → आगे बढ़ रहे हैं...`);
        }
      }
    }, 60);
  }, [canRoll, rolling, phase, skipTurns, position, isWalking, addLog]);

  const triggerWin = () => {
    // Generate stars
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${3 + Math.random() * 2}s`
    }));
    setStars(newStars);
    setPhase("won");
  };

  const handleArrivalAtSquare = useCallback((newPos: number) => {
    addLog(`📍 घर ${newPos} पर पहुँचे`);
    
    if (newPos === 100) {
      triggerWin();
      return;
    }

    const special = SPECIAL_SQUARES[newPos];
    if (special) {
      if (special.type === "ladder-foot") {
        setLandedSquare(newPos);
        setCurrentQuestion(pickQuestion());
        setQuestionContext("ladder");
        setSelectedOption(null);
        setPhase("question");
      } else if (special.type === "snake-head") {
        // Snake Animation before question
        setShowSnakeAnimation(true);
        setTimeout(() => {
          setShowSnakeAnimation(false);
          setLandedSquare(newPos);
          setCurrentQuestion(pickQuestion());
          setQuestionContext("snake");
          setSelectedOption(null);
          setPhase("question");
        }, 1800); // Wait for snake animation to finish
      } else if (special.type === "question") {
        setLandedSquare(newPos);
        setCurrentQuestion(pickQuestion());
        setQuestionContext("question");
        setSelectedOption(null);
        setPhase("question");
      } else {
        setCanRoll(true);
      }
    } else {
      setCanRoll(true);
    }
  }, [pickQuestion, addLog]);

  // ── Answer a question ──────────────────────────────────────────────────────
  const handleAnswer = useCallback((idx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(idx);

    const isCorrect = idx === currentQuestion.correct;

    if (isCorrect) {
      setScore((s) => s + 10);
    }

    if (questionContext === "ladder") {
      const dest = SPECIAL_SQUARES[landedSquare]?.connects ?? landedSquare;
      if (isCorrect) {
        setShowLadderAnimation(true);
        setTimeout(() => setShowLadderAnimation(false), 1200);
        setPosition(dest);
        setTargetPosition(dest);
        addLog(`✅ सही! सीढ़ी चढ़ गए → घर ${dest}`);
        if (dest === 100) setTimeout(triggerWin, 1500);
      } else {
        addLog(`❌ गलत! सीढ़ी के नीचे रहे → घर ${landedSquare}`);
      }
    } else if (questionContext === "snake") {
      if (isCorrect) {
        addLog(`✅ सही! साँप से बच गए → घर ${landedSquare} पर रहे`);
      } else {
        const dest = SPECIAL_SQUARES[landedSquare]?.connects ?? landedSquare;
        setPosition(dest);
        setDisplayPosition(dest); // instant drop
        addLog(`❌ गलत! साँप ने नीचे गिराया → घर ${dest} पर गए`);
      }
    } else {
      // Question box
      if (isCorrect) {
        const bonus = 2;
        const newPos = Math.min(position + bonus, 100);
        setPosition(newPos);
        setTargetPosition(newPos);
        addLog(`✅ सही! +${bonus} कदम आगे → घर ${newPos}`);
        if (newPos === 100) setTimeout(triggerWin, 1500);
      } else {
        const penalty = 2;
        const newPos = Math.max(position - penalty, 1);
        setPosition(newPos);
        setTargetPosition(newPos);
        setSkipTurns(1);
        addLog(`❌ गलत! -${penalty} कदम पीछे और अगली बारी छूटेगी`);
      }
    }

    setTimeout(() => {
      setPhase("result-feedback");
    }, 500);
  }, [selectedOption, currentQuestion, questionContext, landedSquare, position, addLog]);

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
    setStars([]);
  }, []);

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
    { color: "bg-emerald-500", label: "सीढ़ी (Ladder) — ऊपर जाएं" },
    { color: "bg-rose-500", label: "साँप (Snake) — नीचे जाएं" },
    { color: "bg-amber-500", label: "प्रश्न (Question)" },
    { color: "bg-blue-500", label: "आपकी स्थिति" },
  ];

  // ─── Render Helper functions ──────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-900 text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <style>{customStyles}</style>
      <Header />

      {/* ─── INTRO SCREEN ───────────────────────────────────────────────────── */}
      {phase === "intro" && (
        <main className="flex-1 py-12 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950">
          {/* Background decoration */}
          <div className="absolute top-10 left-10 text-8xl opacity-5 animate-pulse filter grayscale">🐍</div>
          <div className="absolute bottom-10 right-10 text-8xl opacity-5 animate-bounce filter grayscale">🪜</div>
          <div className="absolute top-1/2 left-1/4 text-6xl opacity-5 animate-dice-roll filter grayscale">🎲</div>

          <div className="container mx-auto px-4 max-w-2xl relative z-10">
            <div className="text-center mb-10 animate-slide-up">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-transform border border-indigo-400">
                <span className="text-6xl animate-player-bounce">🎲</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-400 mb-2 drop-shadow-sm">
                ज्ञान की यात्रा
              </h1>
              <p className="text-xl text-indigo-300 font-medium">Gyan Ki Yatra</p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 mb-8 animate-pop-in border border-slate-700 shadow-2xl" style={{ animationDelay: '0.2s' }}>
              <h2 className="font-bold text-white text-xl flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-indigo-400" />
                खेल के नियम
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-2xl hover:bg-slate-700 transition-colors border border-slate-700/50">
                  <span className="text-3xl filter saturate-50">🪜</span>
                  <div>
                    <p className="font-bold text-emerald-400 text-base">सीढ़ी</p>
                    <p>सही उत्तर पर सीढ़ी चढ़ें।</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-2xl hover:bg-slate-700 transition-colors border border-slate-700/50">
                  <span className="text-3xl filter saturate-50">🐍</span>
                  <div>
                    <p className="font-bold text-rose-400 text-base">साँप</p>
                    <p>सही उत्तर देकर साँप से बचें।</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-2xl hover:bg-slate-700 transition-colors border border-slate-700/50">
                  <span className="text-3xl filter saturate-50">❓</span>
                  <div>
                    <p className="font-bold text-amber-400 text-base">प्रश्न बॉक्स</p>
                    <p>सही: +2 कदम, गलत: -2 कदम।</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-2xl hover:bg-slate-700 transition-colors border border-slate-700/50">
                  <span className="text-3xl filter saturate-50">🎯</span>
                  <div>
                    <p className="font-bold text-blue-400 text-base">लक्ष्य</p>
                    <p>घर 100 तक पहुँचें और जीतें!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Button
                variant="outline"
                className="flex-1 py-6 text-lg rounded-2xl border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white"
                onClick={() => navigate("/student/multimedia/puzzles")}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                वापस जाएं
              </Button>
              <Button
                className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xl py-6 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.02] transition-all"
                onClick={() => setPhase("playing")}
              >
                <Play className="h-6 w-6 mr-2" />
                खेल शुरू करें
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* ─── WON SCREEN ──────────────────────────────────────────────────────── */}
      {phase === "won" && (
        <main className="flex-1 py-12 relative overflow-hidden bg-gradient-to-b from-indigo-950 to-slate-900 flex items-center justify-center">
          {/* Confetti / Stars Background */}
          {stars.map((star) => (
             <div 
               key={star.id} 
               className="absolute top-0 text-yellow-300 animate-star-shower"
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
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.6)] mb-6 border-4 border-slate-800">
                <Trophy className="h-16 w-16 text-slate-900 animate-pulse" />
              </div>
              <h1 className="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">अद्भुत!</h1>
              <p className="text-2xl text-amber-400 font-bold">आपने ज्ञान की यात्रा पूरी कर ली!</p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 mb-10 animate-pop-in border border-slate-700 shadow-2xl" style={{ animationDelay: '0.2s' }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700">
                  <p className="text-5xl font-black text-amber-400 mb-2 drop-shadow-md">{score}</p>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">कुल अंक</p>
                </div>
                <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700">
                  <p className="text-5xl font-black text-indigo-400 mb-2 drop-shadow-md">{moves}</p>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">कुल चालें</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Button
                variant="outline"
                className="flex-1 py-6 text-lg rounded-2xl border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white"
                onClick={() => navigate("/student/multimedia/puzzles")}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                बाहर निकलें
              </Button>
              <Button
                className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xl py-6 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-transform"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="flex flex-col items-center animate-snake-bite">
            <span className="text-[150px] drop-shadow-2xl filter saturate-150">🐍</span>
            <h2 className="text-rose-500 font-black text-6xl mt-6 uppercase tracking-widest drop-shadow-[0_0_25px_rgba(244,63,94,0.8)]">
              साँप!
            </h2>
            <p className="text-slate-300 text-xl mt-4 font-semibold">प्रश्न का सही उत्तर देकर बचें!</p>
          </div>
        </div>
      )}

      {showLadderAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/90 backdrop-blur-md">
          <div className="flex flex-col items-center animate-ladder-climb">
            <span className="text-[120px] drop-shadow-2xl">🪜</span>
            <span className="text-[80px] -mt-10 animate-player-bounce z-10">🧑‍🚀</span>
            <h2 className="text-emerald-400 font-black text-5xl mt-8 uppercase tracking-widest drop-shadow-[0_0_25px_rgba(52,211,153,0.8)]">
              शानदार!
            </h2>
          </div>
        </div>
      )}

      {/* ─── PLAYING SCREEN ──────────────────────────────────────────────────── */}
      {(phase === "playing" || phase === "question" || phase === "result-feedback") && (
        <main className="flex-1 py-6 bg-slate-900 relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            {/* Top Stats Bar */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="ghost"
                className="text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl"
                onClick={() => navigate("/student/multimedia/puzzles")}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                पीछे
              </Button>
              <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-inner text-sm border border-indigo-400/50">
                  🎲
                </div>
                ज्ञान की यात्रा
              </h1>
              <div className="flex gap-3">
                <div className="bg-slate-900 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-inner">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  {score} अंक
                </div>
                <div className="bg-slate-900 border border-indigo-500/30 text-indigo-400 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-inner">
                  <Zap className="h-5 w-5 text-indigo-500 fill-indigo-500" />
                  {moves} चाल
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
              {/* ── Board ─────────────────────────────────────────────────── */}
              <div className="flex-[2] flex flex-col items-center relative">
                <div
                  className="relative grid border-8 border-slate-950 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-slate-950"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(10, 1fr)",
                    width: "100%",
                    maxWidth: "650px",
                    gap: "2px"
                  }}
                >
                  <BoardOverlay />
                  {boardRows.map((row) =>
                    row.map((num) => (
                      <BoardCell
                        key={num}
                        num={num}
                        isPlayer={num === displayPosition}
                        special={SPECIAL_SQUARES[num]}
                        isBouncing={num === displayPosition && playerBouncing}
                      />
                    ))
                  )}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap justify-center gap-4 bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-slate-700">
                  {legend.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <div className={`w-4 h-4 rounded-full shadow-inner ${l.color}`} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Side Panel ────────────────────────────────────────────── */}
              <div className="flex-1 space-y-6 max-w-md mx-auto xl:mx-0 w-full">
                {/* Dice Area */}
                <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">पासा फेंकें</h3>
                  
                  <div className="flex justify-center mb-8">
                    <DiceFace value={diceValue} rolling={rolling} />
                  </div>
                  
                  <Button
                    className={`w-full text-lg font-bold py-6 rounded-2xl shadow-lg transition-all ${
                      canRoll && !rolling && phase === "playing" && !isWalking
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 hover:scale-[1.02] text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600"
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
                <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl p-6">
                  <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-700">
                     <div>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">स्थिति</p>
                       <p className="text-3xl font-black text-white drop-shadow-md">
                         {displayPosition === 0 ? "प्रारंभ" : `घर ${displayPosition}`}
                       </p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">लक्ष्य</p>
                       <p className="text-xl font-bold text-emerald-400">100</p>
                     </div>
                  </div>

                  {skipTurns > 0 && (
                    <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-950/50 border border-amber-500/30 rounded-xl px-4 py-3 mb-6 font-semibold animate-pulse">
                      <AlertTriangle className="h-5 w-5" />
                      <span>{skipTurns} बारी छूटेगी</span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      गतिविधि (Activity)
                    </h3>
                    <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600">
                      {log.length === 0 && (
                        <p className="text-slate-500 italic text-center py-4 bg-slate-900/50 rounded-xl border border-slate-800">खेल शुरू करने के लिए पासा फेंकें!</p>
                      )}
                      {log.map((entry, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-xl ${i === log.length - 1 ? "bg-indigo-950/50 text-indigo-300 font-semibold border border-indigo-500/30 animate-slide-up" : "text-slate-400 bg-slate-900/30 border border-slate-800"}`}
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
          className="max-w-xl p-0 overflow-hidden border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900 text-slate-100"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Dialog Header with contextual gradient */}
          <div className={`px-6 py-5 text-white ${
              questionContext === "ladder" ? "bg-gradient-to-r from-emerald-600 to-teal-700" :
              questionContext === "snake" ? "bg-gradient-to-r from-rose-600 to-pink-700" :
              "bg-gradient-to-r from-amber-600 to-orange-700"
            }`}
          >
            <DialogTitle className="flex items-center gap-3 text-2xl font-black">
              {questionContext === "ladder" && <><span className="filter saturate-50">🪜</span> सीढ़ी का प्रश्न</>}
              {questionContext === "snake" && <><span className="filter saturate-50">🐍</span> साँप का प्रश्न</>}
              {questionContext === "question" && <><span className="filter saturate-50">❓</span> बोनस प्रश्न</>}
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
                <p className="font-bold text-white text-lg sm:text-xl leading-relaxed drop-shadow-sm">
                  {currentQuestion.question}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((opt, idx) => {
                    let btnClass = "w-full text-left px-5 py-4 rounded-2xl border-2 text-base font-semibold transition-all flex items-center justify-between ";

                    if (selectedOption === null) {
                      btnClass += "border-slate-700 bg-slate-800 hover:border-indigo-500 hover:bg-slate-700 hover:shadow-md cursor-pointer text-slate-200";
                    } else if (idx === currentQuestion.correct) {
                      btnClass += "border-emerald-500 bg-emerald-950/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                    } else if (idx === selectedOption) {
                      btnClass += "border-rose-500 bg-rose-950/50 text-rose-300";
                    } else {
                      btnClass += "border-slate-800 bg-slate-900 text-slate-500 opacity-50";
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
                            selectedOption === null ? "border-slate-600 text-slate-400 bg-slate-800" : 
                            idx === currentQuestion.correct ? "border-emerald-500 bg-emerald-900 text-emerald-200" :
                            idx === selectedOption ? "border-rose-500 bg-rose-900 text-rose-200" : "border-slate-700 bg-slate-800"
                          }`}>
                            {labels[idx]}
                          </span>
                          {opt}
                        </div>
                        {selectedOption !== null && idx === currentQuestion.correct && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-400 animate-pop-in drop-shadow-md" />
                        )}
                        {selectedOption === idx && idx !== currentQuestion.correct && (
                          <XCircle className="h-6 w-6 text-rose-400 animate-pop-in drop-shadow-md" />
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
                        selectedOption === currentQuestion.correct
                          ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                          : "bg-rose-950/30 border-rose-500/30 text-rose-200"
                      }`}
                    >
                      <p className="font-bold text-lg mb-2 flex items-center gap-2">
                        {selectedOption === currentQuestion.correct
                          ? <><CheckCircle2 className="h-5 w-5 text-emerald-400"/> शाबाश! सही उत्तर</>
                          : <><XCircle className="h-5 w-5 text-rose-400"/> गलत उत्तर</>}
                      </p>
                      <p className="text-base opacity-90">{currentQuestion.explanation}</p>
                    </div>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg py-6 rounded-2xl shadow-[0_0_15px_rgba(79,70,229,0.4)]"
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