import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Header from "@/components/Header";
import {
  Clock, Trophy, Target, Zap, X, Play, Sparkles, ArrowRight, ArrowLeft,
  Brain, Eye, RotateCcw, ListChecks, Crosshair, Gauge, Timer, BarChart3,
  LogOut, DoorOpen, Image, Puzzle, CheckCircle2, Grid3X3, ImageIcon,
  ChevronRight, Info, History
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_URL = import.meta.env.VITE_API_URL;

/* ============================================================
   TYPES
   ============================================================ */

type PieceType = {
  id: number;          // unique across all images
  imageIndex: number;  // which of the 3 images
  correctRow: number;  // 0-2
  correctCol: number;  // 0-2
  correctPosition: number; // 0-8 (row*3 + col)
};

type PlacedPiece = PieceType | null;

type ImageData = {
  src: string;
  label: string;
  description: string;
};

type PerImageResult = {
  imageIndex: number;
  correctPlacements: number;
  totalPieces: number;
  swapCount: number;
  moveCount: number;
  timeTakenMs: number;
};

type ExitType = "completed" | "exited" | "time_up" | null;
type GameScreen = "intro" | "game" | "results";

const SOLVE_TIME = 180; // 3 minutes combined

const getResponsivePieceSize = () => {
  if (typeof window === "undefined") return 72;
  if (window.innerWidth < 400) return 54;
  if (window.innerWidth < 640) return 62;
  if (window.innerWidth < 1024) return 72;
  return 86;
};

/* ============================================================
   IMAGE POOL  (21 memory images + descriptions)
   ============================================================ */

const ALL_PUZZLE_IMAGES: ImageData[] = [
  { src: "/images/memory_1.png",  label: "चित्र 1",  description: "यह एक रंगीन चित्र है — इसे ध्यान से देखें और टुकड़ों को सही जगह रखें।" },
  { src: "/images/memory_2.png",  label: "चित्र 2",  description: "इस चित्र के हर हिस्से को पहचानें और मूल छवि बनाएं।" },
  { src: "/images/memory_3.png",  label: "चित्र 3",  description: "इस चित्र को पूरा करने के लिए रंगों और आकारों पर ध्यान दें।" },
  { src: "/images/memory_4.png",  label: "चित्र 4",  description: "ध्यान से देखें — प्रत्येक टुकड़ा एक विशेष स्थान पर फिट होता है।" },
  { src: "/images/memory_5.png",  label: "चित्र 5",  description: "इस चित्र में पैटर्न को पहचानें और टुकड़ों को जोड़ें।" },
  { src: "/images/memory_6.png",  label: "चित्र 6",  description: "रंगों के क्रम पर ध्यान दें और सही चित्र बनाएं।" },
  { src: "/images/memory_7.png",  label: "चित्र 7",  description: "किनारों और कोनों को मिलाकर चित्र पूरा करें।" },
  { src: "/images/memory_8.png",  label: "चित्र 8",  description: "हर टुकड़े की स्थिति ध्यान से पहचानें।" },
  { src: "/images/memory_9.png",  label: "चित्र 9",  description: "इस चित्र को जोड़ने के लिए अपनी पहचान क्षमता का उपयोग करें।" },
  { src: "/images/memory_10.png", label: "चित्र 10", description: "इस रंगीन चित्र के टुकड़ों को सही क्रम में लगाएं।" },
  { src: "/images/memory_11.png", label: "चित्र 11", description: "हर हिस्से को ध्यान से देखें — कहाँ फिट होता है?" },
  { src: "/images/memory_12.png", label: "चित्र 12", description: "टुकड़ों के रंग और बनावट से मूल चित्र बनाएं।" },
  { src: "/images/memory_13.png", label: "चित्र 13", description: "इस पहेली को सुलझाने के लिए ध्यान केंद्रित करें।" },
  { src: "/images/memory_14.png", label: "चित्र 14", description: "चित्र के हर कोने को ध्यान से पहचानें।" },
  { src: "/images/memory_15.png", label: "चित्र 15", description: "रंगों और रेखाओं का मिलान करके चित्र बनाएं।" },
  { src: "/images/memory_16.png", label: "चित्र 16", description: "मूल चित्र से तुलना करें और टुकड़े जोड़ें।" },
  { src: "/images/memory_17.png", label: "चित्र 17", description: "यह एक चुनौतीपूर्ण चित्र है — ध्यान से जोड़ें।" },
  { src: "/images/memory_18.png", label: "चित्र 18", description: "हर टुकड़े की सही जगह खोजें।" },
  { src: "/images/memory_19.png", label: "चित्र 19", description: "इस पहेली में अपनी दृश्य पहचान क्षमता दिखाएं।" },
  { src: "/images/memory_20.png", label: "चित्र 20", description: "टुकड़ों को खींचकर ग्रिड में सही स्थान पर रखें।" },
  { src: "/images/memory_21.png", label: "चित्र 21", description: "इस अंतिम चित्र को पूरा करें और अपना स्कोर देखें।" },
];

/* ============================================================
   SHUFFLE HELPER
   ============================================================ */

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

const MatchPieces: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>("intro");

  // game data
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // pieces: scattered (left); grid (right 3x3)
  const [scatteredPieces, setScatteredPieces] = useState<PieceType[]>([]);
  const [grid, setGrid] = useState<PlacedPiece[]>(Array(9).fill(null));

  // timer
  const [solveTimer, setSolveTimer] = useState(SOLVE_TIME);
  const [startTime, setStartTime] = useState(0);

  // metrics
  const [swapCounts, setSwapCounts] = useState<number[]>([0, 0, 0]);
  const [perImageMoves, setPerImageMoves] = useState<number[]>([0, 0, 0]);
  const [perImageTimes, setPerImageTimes] = useState<number[]>([0, 0, 0]);
  const [imageStartTime, setImageStartTime] = useState(0);
  const [completedImages, setCompletedImages] = useState<boolean[]>([false, false, false]);
  const [perImageCorrect, setPerImageCorrect] = useState<number[]>([0, 0, 0]);
  const [totalMoves, setTotalMoves] = useState(0);

  // UI
  const [exitType, setExitType] = useState<ExitType>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<{ piece: PieceType; from: "scattered" | number } | null>(null);
  const [dragOverPos, setDragOverPos] = useState<number | null>(null);
  const [pieceSize, setPieceSize] = useState<number>(getResponsivePieceSize());

  // Student
  const [studentId, setStudentId] = useState<string>("");

  /* ---------- LOAD STUDENT & HISTORY ---------- */
  useEffect(() => {
    const studentData = localStorage.getItem("student");
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        if (parsed.student && parsed.student.studentId) {
          setStudentId(parsed.student.studentId);
        }
      } catch (e) {
        console.error("Error parsing student data:", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setPieceSize(getResponsivePieceSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------- PICK 3 RANDOM IMAGES & START ---------- */
  const startGame = () => {
    const picked = shuffle(ALL_PUZZLE_IMAGES).slice(0, 3);
    setImages(picked);
    setCurrentImageIdx(0);
    setCompletedImages([false, false, false]);
    setSwapCounts([0, 0, 0]);
    setPerImageMoves([0, 0, 0]);
    setPerImageTimes([0, 0, 0]);
    setPerImageCorrect([0, 0, 0]);
    setTotalMoves(0);
    setSolveTimer(SOLVE_TIME);
    setStartTime(Date.now());
    setImageStartTime(Date.now());
    setExitType(null);
    setAnalysis(null);
    setSubmitted(false);
    setScreen("game");

    // Generate pieces for first image
    setupPiecesForImage(0);
  };

  const setupPiecesForImage = (imgIdx: number) => {
    const pieces: PieceType[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        pieces.push({
          id: imgIdx * 9 + r * 3 + c,
          imageIndex: imgIdx,
          correctRow: r,
          correctCol: c,
          correctPosition: r * 3 + c,
        });
      }
    }
    setScatteredPieces(shuffle(pieces));
    setGrid(Array(9).fill(null));
  };

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (screen !== "game" || submitted) return;
    if (solveTimer === 0) {
      handleSubmit("time_up");
      return;
    }
    const t = setTimeout(() => setSolveTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [solveTimer, screen, submitted]);

  /* ---------- CHECK IMAGE COMPLETION ---------- */
  const checkCompletion = useCallback((currentGrid: PlacedPiece[]) => {
    // All 9 slots must be filled and in correct position
    for (let pos = 0; pos < 9; pos++) {
      const piece = currentGrid[pos];
      if (!piece || piece.correctPosition !== pos) return false;
    }
    return true;
  }, []);

  const countCorrectPlacements = useCallback((currentGrid: PlacedPiece[]) => {
    let count = 0;
    for (let pos = 0; pos < 9; pos++) {
      const piece = currentGrid[pos];
      if (piece && piece.correctPosition === pos) count++;
    }
    return count;
  }, []);

  /* ---------- HANDLE MOVE TO NEXT IMAGE ---------- */
  const moveToNextImage = useCallback(() => {
    // Record time for current image
    const elapsed = Date.now() - imageStartTime;
    setPerImageTimes(prev => {
      const n = [...prev];
      n[currentImageIdx] = elapsed;
      return n;
    });

    const nextIdx = currentImageIdx + 1;
    if (nextIdx < 3) {
      setCurrentImageIdx(nextIdx);
      setImageStartTime(Date.now());
      setupPiecesForImage(nextIdx);
    } else {
      // All 3 done!
      handleSubmit("completed");
    }
  }, [currentImageIdx, imageStartTime]);

  /* ---------- DRAG FROM SCATTERED ---------- */
  const handleDragStartScattered = (e: React.DragEvent, piece: PieceType) => {
    setDraggedPiece({ piece, from: "scattered" });
    e.dataTransfer.effectAllowed = "move";
  };

  /* ---------- DRAG FROM GRID ---------- */
  const handleDragStartGrid = (e: React.DragEvent, gridPos: number) => {
    const piece = grid[gridPos];
    if (!piece) return;
    setDraggedPiece({ piece, from: gridPos });
    e.dataTransfer.effectAllowed = "move";
  };

  /* ---------- DROP ON GRID SLOT ---------- */
  const handleDropOnGrid = (e: React.DragEvent, targetPos: number) => {
    e.preventDefault();
    if (!draggedPiece) return;
    setTotalMoves(m => m + 1);
    setPerImageMoves(prev => {
      const n = [...prev];
      n[currentImageIdx]++;
      return n;
    });

    const { piece, from } = draggedPiece;

    setGrid(prev => {
      const newGrid = [...prev];
      const existingPiece = newGrid[targetPos];

      if (from === "scattered") {
        // Place from scattered to grid
        newGrid[targetPos] = piece;
        setScatteredPieces(sp => {
          const remaining = sp.filter(p => p.id !== piece.id);
          // If there was already a piece in this slot, return it to scattered
          if (existingPiece) return [...remaining, existingPiece];
          return remaining;
        });
      } else {
        // Swap within grid
        const fromPos = from as number;
        newGrid[targetPos] = piece;
        newGrid[fromPos] = existingPiece;
        setSwapCounts(prev => {
          const n = [...prev];
          n[currentImageIdx]++;
          return n;
        });
      }

      // Check completion after state update
      setTimeout(() => {
        const correct = countCorrectPlacements(newGrid);
        setPerImageCorrect(prev => {
          const n = [...prev];
          n[currentImageIdx] = correct;
          return n;
        });

        if (checkCompletion(newGrid)) {
          setCompletedImages(prev => {
            const n = [...prev];
            n[currentImageIdx] = true;
            return n;
          });
          // Small delay before moving on
          setTimeout(() => moveToNextImage(), 800);
        }
      }, 0);

      return newGrid;
    });

    setDraggedPiece(null);
  };

  /* ---------- DROP BACK TO SCATTERED ---------- */
  const handleDropOnScattered = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPiece) return;
    const { piece, from } = draggedPiece;

    if (typeof from === "number") {
      // Removing from grid back to scattered
      setGrid(prev => {
        const newGrid = [...prev];
        newGrid[from] = null;
        return newGrid;
      });
      setScatteredPieces(prev => [...prev, piece]);
    }
    setDraggedPiece(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleGridDragEnter = (pos: number) => {
    setDragOverPos(pos);
  };

  const handleGridDragLeave = (e: React.DragEvent) => {
    // Only clear if actually leaving the cell (not entering a child)
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !e.currentTarget.contains(related)) {
      setDragOverPos(null);
    }
  };

  const handleGridDrop = (e: React.DragEvent, pos: number) => {
    setDragOverPos(null);
    handleDropOnGrid(e, pos);
  };

  /* ---------- CLICK-TO-SELECT (mobile-friendly alternative) ---------- */
  const [selectedPiece, setSelectedPiece] = useState<{ piece: PieceType; from: "scattered" | number } | null>(null);

  const handleClickScattered = (piece: PieceType) => {
    if (submitted) return;
    setSelectedPiece({ piece, from: "scattered" });
  };

  const handleClickGrid = (pos: number) => {
    if (submitted) return;

    if (selectedPiece) {
      // Place or swap
      const { piece, from } = selectedPiece;
      setTotalMoves(m => m + 1);
      setPerImageMoves(prev => {
        const n = [...prev];
        n[currentImageIdx]++;
        return n;
      });

      setGrid(prev => {
        const newGrid = [...prev];
        const existingPiece = newGrid[pos];

        if (from === "scattered") {
          newGrid[pos] = piece;
          setScatteredPieces(sp => {
            const remaining = sp.filter(p => p.id !== piece.id);
            if (existingPiece) return [...remaining, existingPiece];
            return remaining;
          });
        } else {
          const fromPos = from as number;
          newGrid[pos] = piece;
          newGrid[fromPos] = existingPiece;
          setSwapCounts(prev => {
            const n = [...prev];
            n[currentImageIdx]++;
            return n;
          });
        }

        setTimeout(() => {
          const correct = countCorrectPlacements(newGrid);
          setPerImageCorrect(prev => {
            const n = [...prev];
            n[currentImageIdx] = correct;
            return n;
          });

          if (checkCompletion(newGrid)) {
            setCompletedImages(prev => {
              const n = [...prev];
              n[currentImageIdx] = true;
              return n;
            });
            setTimeout(() => moveToNextImage(), 800);
          }
        }, 0);

        return newGrid;
      });

      setSelectedPiece(null);
    } else if (grid[pos]) {
      // Select piece from grid
      setSelectedPiece({ piece: grid[pos]!, from: pos });
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (type: ExitType) => {
    if (submitted) return;
    setSubmitted(true);
    setExitType(type);

    const endReason = type === "completed" ? "COMPLETED" : type === "exited" ? "EXITED" : "TIME_UP";
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const allCompleted = type === "completed";

    // Record final image time if not yet done
    const finalTimes = [...perImageTimes];
    if (!completedImages[currentImageIdx]) {
      finalTimes[currentImageIdx] = Date.now() - imageStartTime;
    }

    // Count correct for current grid state
    const finalCorrect = [...perImageCorrect];
    finalCorrect[currentImageIdx] = countCorrectPlacements(grid);

    const perImage: PerImageResult[] = images.map((_, i) => ({
      imageIndex: i,
      // If game was fully completed, all images are 9/9 correct
      correctPlacements: allCompleted ? 9 : (i < currentImageIdx ? 9 : (i === currentImageIdx ? finalCorrect[i] : 0)),
      totalPieces: 9,
      swapCount: swapCounts[i],
      moveCount: perImageMoves[i],
      timeTakenMs: finalTimes[i],
    }));

    try {
      const res = await axios.post(`${API_URL}/puzzles/evaluate-pieces`, {
        studentId: studentId || undefined,
        totalImages: 3,
        imagesCompleted: allCompleted ? 3 : completedImages.filter(Boolean).length,
        perImage,
        totalMoves,
        timeTaken,
        endReason,
      });
      setAnalysis(res.data);
      setScreen("results");
    } catch (error) {
      console.error("Evaluation error:", error);
      alert("मूल्यांकन विफल हुआ। कृपया पुनः प्रयास करें।");
      setSubmitted(false);
    }
  };

  /* ---------- EXIT ---------- */
  const handleExitClick = () => setShowExitAlert(true);
  const confirmExit = () => {
    setShowExitAlert(false);
    handleSubmit("exited");
  };

  /* ---------- RESET ---------- */
  const handleReset = () => {
    setScreen("intro");
    setImages([]);
    setCurrentImageIdx(0);
    setScatteredPieces([]);
    setGrid(Array(9).fill(null));
    setExitType(null);
    setAnalysis(null);
    setSubmitted(false);
    setSelectedPiece(null);
    setDragOverPos(null);
  };

  /* ---------- FORMAT ---------- */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ============================================================
     PIECE RENDERER — uses CSS background-position to show a slice
     ============================================================ */
  const PieceView: React.FC<{
    piece: PieceType;
    size: number;
    imageSrc: string;
    isSelected?: boolean;
    isCorrect?: boolean;
  }> = ({ piece, size, imageSrc, isSelected, isCorrect }) => {
    // background-position to show the correct 1/3 slice
    const bgX = -(piece.correctCol * size);
    const bgY = -(piece.correctRow * size);

    return (
      <div
        className={`rounded-lg overflow-hidden border-2 transition-all duration-200
          ${isSelected ? "border-cyan-500 ring-2 ring-cyan-300 shadow-lg scale-105" : "border-gray-300"}
          ${isCorrect ? "border-green-500 ring-1 ring-green-300" : ""}
        `}
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: `${size * 3}px ${size * 3}px`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Light grid line overlay for visual clarity */}
        {isCorrect && (
          <div className="w-full h-full flex items-center justify-center bg-green-400/20">
            <CheckCircle2 className="w-4 h-4 text-green-600 drop-shadow" />
          </div>
        )}
      </div>
    );
  };

  /* ===================== UI ===================== */
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      <Header />

      {/* EXIT ALERT */}
      <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-red-500" />
              क्या आप बाहर निकलना चाहते हैं?
            </AlertDialogTitle>
            <AlertDialogDescription>
              गेम अभी पूरा नहीं हुआ है। बाहर निकलने पर आपकी वर्तमान प्रगति के आधार पर मूल्यांकन किया जाएगा।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>रद्द करें</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="bg-red-500 hover:bg-red-600">
              <LogOut className="h-4 w-4 mr-1" />
              बाहर निकलें
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="flex-1 overflow-y-auto">

        {/* =============== INTRO SCREEN =============== */}
        {screen === "intro" && (
          <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-6">
            <div className="max-w-3xl w-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  चित्र पहेली
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  मैच <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">पीसेज़</span>
                </h1>
                <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  टुकड़ों को जोड़कर मूल चित्र बनाएं — अपनी पहचान क्षमता दिखाएं!
                </p>
              </div>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-cyan-600" />
                    कैसे खेलें
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="bg-cyan-50 rounded-xl p-4 space-y-2 mb-5">
                    <ul className="list-disc list-inside space-y-1.5 text-gray-700 ml-1">
                      <li><strong>3 चित्र:</strong> एक-एक करके 3 चित्र दिए जाएंगे</li>
                      <li><strong>9 टुकड़े:</strong> प्रत्येक चित्र 9 टुकड़ों (3×3) में बंटा है</li>
                      <li><strong>खींचें और रखें:</strong> बाएं से टुकड़े उठाकर दाएं ग्रिड में रखें</li>
                      <li><strong>मूल चित्र:</strong> ऊपर दाएं कोने में मूल चित्र दिखेगा (सहायता के लिए)</li>
                      <li><strong>समय:</strong> तीनों चित्रों के लिए कुल 3 मिनट</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-cyan-50 rounded-xl p-3 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <Puzzle className="h-6 w-6 text-cyan-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-cyan-600">3</p>
                      <p className="text-xs text-gray-500">चित्र</p>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-3 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <Grid3X3 className="h-6 w-6 text-teal-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-teal-600">9</p>
                      <p className="text-xs text-gray-500">टुकड़े प्रति चित्र</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <Clock className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-emerald-600">3:00</p>
                      <p className="text-xs text-gray-500">मिनट</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold py-3"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    खेल शुरू करें
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* =============== GAME SCREEN =============== */}
        {screen === "game" && images.length > 0 && (
          <div className="px-2 sm:px-3 py-3">
            {/* TOP BAR — image description + progress */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                <ImageIcon className="h-4 w-4" />
                चित्र {currentImageIdx + 1} / 3
              </div>
              <div className="w-full lg:flex-1 bg-white/70 rounded-lg px-3 py-1.5 text-sm text-gray-600 flex items-start sm:items-center gap-2">
                <Info className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                {images[currentImageIdx]?.description}
              </div>
              {/* Image dots showing completion */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${completedImages[i]
                        ? "bg-green-500 text-white"
                        : i === currentImageIdx
                          ? "bg-cyan-500 text-white animate-pulse"
                          : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {completedImages[i] ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* MAIN GAME AREA */}
            <div className="flex flex-col xl:flex-row gap-3">

              {/* LEFT: Scattered Pieces */}
              <div
                className="w-full xl:w-72 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-3 flex flex-col overflow-hidden min-h-[220px] xl:min-h-0"
                onDragOver={handleDragOver}
                onDrop={handleDropOnScattered}
              >
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Puzzle className="h-4 w-4 text-cyan-600" />
                  टुकड़े
                  <span className="ml-auto bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded-full font-semibold">{scatteredPieces.length}</span>
                </h3>

                <div className="flex-1 overflow-y-auto">
                  {scatteredPieces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <CheckCircle2 className="h-8 w-8 mb-2 text-green-400" />
                      <p className="text-sm text-center">सभी टुकड़े रख दिए!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 p-1 puzzle-fixed-3">
                      {scatteredPieces.map(piece => (
                        <div
                          key={piece.id}
                          draggable
                          onDragStart={(e) => handleDragStartScattered(e, piece)}
                          onClick={() => handleClickScattered(piece)}
                          className={`cursor-grab active:cursor-grabbing hover:scale-105 transition-transform
                            ${selectedPiece?.piece.id === piece.id ? "scale-105" : ""}`}
                        >
                            <PieceView
                              piece={piece}
                              size={pieceSize}
                              imageSrc={images[currentImageIdx].src}
                              isSelected={selectedPiece?.piece.id === piece.id}
                            />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER: 3×3 Grid */}
              <div className="xl:flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-3 flex flex-col overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                    <Grid3X3 className="h-3.5 w-3.5" />
                    पहेली ग्रिड
                  </div>
                  <span className="text-xs text-gray-500">
                    {countCorrectPlacements(grid)} / 9 सही
                  </span>
                </div>

                {/* Reference image */}
                <div className="self-end w-28 sm:w-36 mb-2">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-cyan-200 p-1.5">
                    <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1 mb-1 px-0.5">
                      <Eye className="h-3 w-3 text-cyan-600" />
                      मूल चित्र
                    </p>
                    <div className="rounded-lg overflow-hidden border border-cyan-100">
                      <img
                        src={images[currentImageIdx]?.src}
                        alt="Reference"
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/300/06b6d4/ffffff?text=Image";
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center overflow-auto">
                  <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-2 rounded-xl puzzle-fixed-3">
                    {Array.from({ length: 9 }).map((_, pos) => {
                      const piece = grid[pos];
                      const isCorrectPos = piece ? piece.correctPosition === pos : false;
                      const isDragTarget = dragOverPos === pos && draggedPiece !== null;

                      return (
                        <div
                          key={pos}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleGridDragEnter(pos)}
                          onDragLeave={handleGridDragLeave}
                          onDrop={(e) => handleGridDrop(e, pos)}
                          onClick={() => handleClickGrid(pos)}
                          className={`rounded-lg flex items-center justify-center transition-all duration-150 relative
                            ${!piece
                              ? "border-2 border-dashed border-gray-300 bg-gray-50 hover:border-cyan-400 hover:bg-cyan-50/50"
                              : ""
                            }
                            ${isDragTarget && !piece
                              ? "!border-cyan-500 !bg-cyan-100/70 ring-2 ring-cyan-400 scale-105 shadow-lg"
                              : ""
                            }
                            ${isDragTarget && piece
                              ? "ring-3 ring-amber-400 shadow-lg shadow-amber-200/50 scale-105"
                              : ""
                            }
                            ${selectedPiece && selectedPiece.from !== "scattered" && selectedPiece.from === pos
                              ? "ring-2 ring-cyan-400"
                              : ""
                            }`}
                          style={{ width: pieceSize, height: pieceSize }}
                        >
                          {/* Swap indicator overlay when dragging over an occupied slot */}
                          {isDragTarget && piece && (
                            <div className="absolute inset-0 z-10 rounded-lg bg-amber-400/30 border-2 border-amber-500 flex items-center justify-center pointer-events-none">
                              <div className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                                ↔ बदलें
                              </div>
                            </div>
                          )}
                          {isDragTarget && !piece && (
                            <div className="absolute inset-0 z-10 rounded-lg border-2 border-cyan-500 bg-cyan-200/30 flex items-center justify-center pointer-events-none">
                              <div className="bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                                ⬇ यहाँ रखें
                              </div>
                            </div>
                          )}
                          {piece ? (
                            <div
                              draggable
                              onDragStart={(e) => handleDragStartGrid(e, pos)}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <PieceView
                                piece={piece}
                                size={pieceSize}
                                imageSrc={images[currentImageIdx].src}
                                isCorrect={isCorrectPos}
                                isSelected={selectedPiece?.from === pos}
                              />
                            </div>
                          ) : (
                            <span className="text-gray-300 text-lg font-bold">{pos + 1}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Completion flash */}
                {completedImages[currentImageIdx] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-400/20 backdrop-blur-[1px] rounded-2xl z-10 pointer-events-none">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl text-center">
                      <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                      <p className="text-lg font-bold text-gray-800">चित्र पूरा हुआ! 🎉</p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Stats */}
              <div className="w-full xl:w-64 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex flex-col">
                <h3 className="text-sm font-bold text-center text-gray-800 mb-2 flex items-center justify-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyan-600" />
                  गेम स्टेटस
                </h3>

                {/* Timer */}
                <div className={`rounded-xl p-3 text-center shadow-md mb-2 ${
                  solveTimer <= 30
                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                    : "bg-gradient-to-br from-cyan-500 to-teal-600"
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className={`w-4 h-4 text-white ${solveTimer <= 30 ? "animate-pulse" : ""}`} />
                    <span className="text-white text-xs font-semibold">शेष समय</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{formatTime(solveTimer)}</div>
                </div>

                {/* Current Image Progress */}
                <div className="bg-cyan-50 rounded-xl p-3 flex items-center gap-3 shadow-sm mb-2">
                  <div className="bg-cyan-500 rounded-lg p-2">
                    <Grid3X3 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">सही स्थान</p>
                    <p className="text-lg font-bold text-cyan-600">{countCorrectPlacements(grid)} / 9</p>
                  </div>
                </div>

                {/* Images Completed */}
                <div className="bg-teal-50 rounded-xl p-3 flex items-center gap-3 shadow-sm mb-2">
                  <div className="bg-teal-500 rounded-lg p-2">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">चित्र पूरे</p>
                    <p className="text-lg font-bold text-teal-600">{completedImages.filter(Boolean).length} / 3</p>
                  </div>
                </div>

                {/* Total Moves */}
                <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3 shadow-sm mb-2">
                  <div className="bg-amber-500 rounded-lg p-2">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">कुल चालें</p>
                    <p className="text-lg font-bold text-amber-600">{totalMoves}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-gray-50 rounded-xl p-3 shadow-sm mb-2">
                  <p className="text-xs text-gray-600 font-medium mb-1.5">कुल प्रगति</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500 rounded-full"
                      style={{
                        width: `${((completedImages.filter(Boolean).length * 9 + countCorrectPlacements(grid)) / 27) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round(((completedImages.filter(Boolean).length * 9 + (completedImages[currentImageIdx] ? 0 : countCorrectPlacements(grid))) / 27) * 100)}% पूर्ण
                  </p>
                </div>

                <div className="flex-1" />

                <Button
                  onClick={handleExitClick}
                  variant="destructive"
                  className="w-full py-2.5 font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                  <X className="w-4 h-4" />
                  बाहर निकलें
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* =============== RESULTS SCREEN =============== */}
        {screen === "results" && analysis && (
          <div className="px-3 sm:px-4 py-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-8 max-w-5xl w-full mx-auto max-h-[calc(100vh-110px)] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-8">

                {/* LEFT: Score */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    मूल्यांकन पूर्ण
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                    <Trophy className="h-7 w-7 text-yellow-500" />
                    <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">परिणाम</span>
                  </h2>

                  {/* Score Circle */}
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-5">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="72" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle
                        cx="80" cy="80" r="72"
                        stroke="url(#piecesGrad)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 72}`}
                        strokeDashoffset={`${2 * Math.PI * 72 * (1 - analysis.score / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="piecesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-800">{analysis.score}</span>
                      <span className="text-sm text-gray-500">/ 100</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-4 w-full text-center mb-3">
                    <p className="text-xs text-gray-600 mb-1">पहचान स्तर</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                      {analysis.recognitionLevel}
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm text-center mb-2 px-2">{analysis.feedback}</p>
                  <p className="text-xs text-gray-400 text-center">
                    गेम समाप्ति: {analysis.endReason === "COMPLETED" ? "पूर्ण" : analysis.endReason === "EXITED" ? "बाहर निकले" : "समय समाप्त"}
                  </p>

                  {/* Per image results */}
                  {analysis.perImageSummary && (
                    <div className="mt-4 w-full space-y-2">
                      <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-cyan-500" />
                        प्रति चित्र विवरण
                      </h4>
                      {analysis.perImageSummary.map((img: any, i: number) => (
                        <div key={i} className={`flex items-center gap-3 rounded-lg p-2 text-xs ${
                          img.completed ? "bg-green-50" : "bg-gray-50"
                        }`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${
                            img.completed ? "bg-green-500" : "bg-gray-400"
                          }`}>
                            {i + 1}
                          </div>
                          <span className="flex-1 text-gray-700">
                            {img.correct}/9 सही
                          </span>
                          <span className="text-gray-500">{img.moves} चालें</span>
                          {img.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Tips & Actions */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      🧩 चित्र जोड़ने का खेल
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      आपने दृश्य पहचान और स्थानिक तर्क क्षमता का परीक्षण पूरा किया है।
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-5 mb-5">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-cyan-600" />
                      अगली बार के लिए सुझाव
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• चित्र के रंगों और किनारों पर ध्यान दें</p>
                      <p>• पहले कोने के टुकड़े ढूंढें और फिर बाकी</p>
                      <p>• मूल चित्र को देखते रहें जब तक याद न हो जाए</p>
                      <p>• धैर्य रखें और व्यवस्थित तरीके से काम करें</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <Button
                      onClick={startGame}
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      दोबारा खेलें
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      मुख्य मेनू
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MatchPieces;
