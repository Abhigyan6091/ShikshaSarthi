import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import { Clock, Trophy, Target, Zap, X, Play, Sparkles, ArrowRight, ArrowLeft, Brain, Eye, RotateCcw, ListChecks, Crosshair, Gauge, Timer, BarChart3, LogOut, DoorOpen, History } from "lucide-react";
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
import { getMemoryImages } from "./imageUtils";

const API_URL = import.meta.env.VITE_API_URL;

type CardType = {
  id: number;
  image: string;
  matched: boolean;
  index: number;
};

type ExitType = "completed" | "exited" | "time_up" | null;
type GameScreen = "intro" | "mode-select" | "game" | "results";

const PREVIEW_TIME = 15;   // seconds
const SOLVE_TIME = 180;   // 3 minutes

const MemoryMatchGrid: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>("intro");
  const [mode, setMode] = useState<"individual" | "group" | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flipped, setFlipped] = useState<CardType[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  // Student
  const [studentId, setStudentId] = useState<string>("");

  // timers
  const [previewTimer, setPreviewTimer] = useState(PREVIEW_TIME);
  const [solveTimer, setSolveTimer] = useState(SOLVE_TIME);
  const [previewPhase, setPreviewPhase] = useState(true);

  // metrics
  const [totalClicks, setTotalClicks] = useState(0);
  const [incorrectClicks, setIncorrectClicks] = useState(0);
  const [nearbyClicks, setNearbyClicks] = useState(0);
  const [exitType, setExitType] = useState<ExitType>(null);

  const [analysis, setAnalysis] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);

  const pairCount = mode === "individual" ? 10 : 20;
  const gridCols = mode === "individual" ? 5 : 8;
  const gridRows = mode === "individual" ? 4 : 5;

  /* ---------------- LOAD STUDENT & HISTORY ---------------- */
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

  /* ---------------- START GAME ---------------- */
  const startGame = (selectedMode: "individual" | "group") => {
    setMode(selectedMode);
    setScreen("game");
    setCards([]);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setTotalClicks(0);
    setIncorrectClicks(0);
    setNearbyClicks(0);
    setExitType(null);
    setAnalysis(null);
    setSubmitted(false);

    setPreviewPhase(true);
    setPreviewTimer(PREVIEW_TIME);
    setSolveTimer(SOLVE_TIME);
    setStartTime(Date.now());

    const allImages = getMemoryImages();
    const pairsNeeded = selectedMode === "individual" ? 10 : 20;
    const images = allImages.slice(0, pairsNeeded);

    const shuffled = [...images, ...images]
      .map((img, i) => ({
        id: i,
        image: img,
        matched: false,
        index: i,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
  };

  /* ---------------- PREVIEW TIMER ---------------- */
  useEffect(() => {
    if (!mode || !previewPhase) return;
    if (previewTimer === 0) {
      setPreviewPhase(false);
      return;
    }
    const t = setTimeout(() => setPreviewTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [previewTimer, previewPhase, mode]);

  /* ---------------- SOLVE TIMER ---------------- */
  useEffect(() => {
    if (!mode || previewPhase || analysis) return;
    if (solveTimer === 0) {
      handleSubmit("time_up");
      return;
    }
    const t = setTimeout(() => setSolveTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [solveTimer, previewPhase, mode]);

  /* ---------------- HANDLE FLIP ---------------- */
  const handleFlip = (card: CardType) => {
    if (previewPhase || flipped.length === 2 || card.matched || flipped.includes(card)) return;
    setTotalClicks(c => c + 1);
    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (newFlipped[0].image === newFlipped[1].image) {
        setCards(prev => prev.map(c => (c.image === card.image ? { ...c, matched: true } : c)));
        setMatches(m => m + 1);
        setFlipped([]);
      } else {
        setIncorrectClicks(i => i + 1);
        if (Math.abs(newFlipped[0].index - newFlipped[1].index) <= 2) {
          setNearbyClicks(n => n + 1);
        }
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  /* ---------------- AUTO COMPLETE ---------------- */
  useEffect(() => {
    if (mode && matches === pairCount && !submitted) {
      handleSubmit("completed");
    }
  }, [matches]);

  /* ---------------- SUBMIT RESULT ---------------- */
  const handleSubmit = async (type: ExitType) => {
    if (submitted) return;
    setSubmitted(true);
    setExitType(type);

    const endReason = type === "completed" ? "COMPLETED" : type === "exited" ? "EXITED" : "TIME_UP";

    try {
      const res = await axios.post(`${API_URL}/puzzles/evaluate`, {
        studentId: studentId || undefined,
        mode,
        totalPairs: pairCount,
        totalClicks,
        incorrectClicks,
        nearbyClicks,
        correctPairs: matches,
        timeTaken: Math.floor((Date.now() - startTime) / 1000),
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

  /* ---------------- EXIT BUTTON (with alert) ---------------- */
  const handleExitClick = () => setShowExitAlert(true);
  const confirmExit = () => {
    setShowExitAlert(false);
    handleSubmit("exited");
  };

  /* ---------------- RESET GAME ---------------- */
  const handleReset = () => {
    setScreen("intro");
    setMode(null);
    setCards([]);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setTotalClicks(0);
    setIncorrectClicks(0);
    setNearbyClicks(0);
    setExitType(null);
    setAnalysis(null);
    setSubmitted(false);
  };

  /* ---------------- TIMER DISPLAY ---------------- */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ===================== UI ===================== */
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <Header />

      {/* EXIT CONFIRMATION ALERT DIALOG */}
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
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  याददाश्त का खेल
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  मेमोरी मैच <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">चैलेंज</span>
                </h1>
                <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  कार्ड्स की स्थिति याद करें और समय से पहले सभी जोड़ियाँ ढूँढें!
                </p>
              </div>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-indigo-600" />
                    कैसे खेलें
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="bg-indigo-50 rounded-xl p-4 space-y-2 mb-5">
                    <ul className="list-disc list-inside space-y-1.5 text-gray-700 ml-1">
                      <li><strong>प्रीव्यू चरण:</strong> कार्ड्स की स्थिति याद करें (15 सेकंड)</li>
                      <li><strong>गेम चरण:</strong> 3 मिनट के अंदर सभी जोड़ियाँ मिलाएं</li>
                      <li><strong>कार्ड पर क्लिक करें</strong> और मिलती-जुलती जोड़ियाँ ढूँढें</li>
                      <li><strong>प्रदर्शन ट्रैक करें:</strong> चालें, मैच और समय</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-3 text-center group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <p className="text-sm text-gray-600">व्यक्तिगत मोड</p>
                      <p className="text-2xl font-bold text-blue-600">20 कार्ड</p>
                      <p className="text-xs text-gray-500">10 जोड़ियाँ मिलाएं</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <p className="text-sm text-gray-600">समूह मोड</p>
                      <p className="text-2xl font-bold text-purple-600">30 कार्ड</p>
                      <p className="text-xs text-gray-500">15 जोड़ियाँ मिलाएं</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => setScreen("mode-select")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold py-3"
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

        {/* =============== MODE SELECTION SCREEN =============== */}
        {screen === "mode-select" && (
          <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-6">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  अपना मोड चुनें
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  मोड <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">चयन</span>
                </h1>
                <p className="text-base sm:text-xl text-gray-600">अपनी पसंद का मोड चुनें और खेल शुरू करें</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Individual Mode Card */}
                <Card
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg overflow-hidden relative bg-blue-50/30 backdrop-blur-sm cursor-pointer"
                  onClick={() => startGame("individual")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Target className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-2">
                          व्यक्तिगत मोड
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm leading-relaxed">
                          एकाग्र अभ्यास के लिए उपयुक्त
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 relative z-10">
                    <div className="bg-white/60 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">20 कार्ड</p>
                      <p className="text-sm text-gray-500 mt-1">10 जोड़ियाँ मिलाएं</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 relative z-10">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold py-2.5">
                      <Play className="h-4 w-4 mr-2" />
                      खेलना शुरू करें
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Group Mode Card */}
                <Card
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg overflow-hidden relative bg-purple-50/30 backdrop-blur-sm cursor-pointer"
                  onClick={() => startGame("group")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Zap className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-2">
                          समूह मोड
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm leading-relaxed">
                          दोस्तों के साथ चुनौती पूरी करें
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 relative z-10">
                    <div className="bg-white/60 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-purple-600">40 कार्ड</p>
                      <p className="text-sm text-gray-500 mt-1">20 जोड़ियाँ मिलाएं</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 relative z-10">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold py-2.5">
                      <Play className="h-4 w-4 mr-2" />
                      खेलना शुरू करें
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => setScreen("intro")}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  वापस जाएं
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =============== GAME SCREEN =============== */}
        {screen === "game" && mode && (
          <div className="py-3 px-2 sm:px-3">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 w-full max-w-7xl mx-auto lg:h-[calc(100vh-120px)]">

              {/* LEFT: Cards Grid */}
              <div className="order-2 lg:order-1 flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 sm:p-3 flex flex-col overflow-hidden min-h-[380px] sm:min-h-[520px] lg:min-h-0">
                {/* Phase Banner */}
                <div className="flex items-center justify-center mb-2">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    previewPhase
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {previewPhase ? (
                      <><Eye className="h-4 w-4" /> स्थिति याद करें!</>
                    ) : (
                      <><Target className="h-4 w-4" /> जोड़ियाँ ढूँढें!</>
                    )}
                  </div>
                </div>

                {/* Card Grid */}
                <div className="flex-1 flex items-center justify-center overflow-auto">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                      gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                      width: 'fit-content',
                      height: 'fit-content',
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  >
                    {cards.map(card => {
                      const visible = previewPhase || flipped.includes(card) || card.matched;
                      const cardSize = mode === "individual"
                        ? "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-24 lg:h-24"
                        : "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-20 lg:h-20";

                      return (
                        <div
                          key={card.id}
                          onClick={() => handleFlip(card)}
                          className={`${cardSize} relative cursor-pointer rounded-xl overflow-hidden shadow-md
                            transform transition-all duration-200
                            ${!visible && !card.matched ? 'hover:scale-105 hover:shadow-xl active:scale-95' : ''}
                            ${card.matched ? 'opacity-50 scale-90' : ''}`}
                        >
                          <div className={`w-full h-full ${
                            visible
                              ? 'bg-white border-2 border-indigo-200'
                              : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-500'
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
                                <span className="text-white text-lg sm:text-xl lg:text-3xl font-bold drop-shadow-lg">?</span>
                              </div>
                            )}
                          </div>
                          {card.matched && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-400/40 backdrop-blur-[1px]">
                              <div className="bg-white rounded-full p-1.5 shadow-lg">
                                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: Stats Sidebar */}
              <div className="order-1 lg:order-2 w-full lg:w-72 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col">
                <h3 className="text-lg font-bold text-center text-gray-800 mb-3 flex items-center justify-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  गेम स्टेटस
                </h3>

                {/* Timer */}
                <div className={`rounded-xl p-4 text-center shadow-md mb-3 ${
                  previewPhase
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    : solveTimer <= 30
                      ? 'bg-gradient-to-br from-red-500 to-orange-500'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className={`w-5 h-5 text-white ${!previewPhase && solveTimer <= 30 ? 'animate-pulse' : ''}`} />
                    <span className="text-white text-sm font-semibold">
                      {previewPhase ? "याद करें" : "शेष समय"}
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {previewPhase ? formatTime(previewTimer) : formatTime(solveTimer)}
                  </div>
                </div>

                {/* Matches */}
                <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3 shadow-sm mb-2">
                  <div className="bg-green-500 rounded-lg p-2">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">मिलान</p>
                    <p className="text-xl font-bold text-green-600">{matches} / {pairCount}</p>
                  </div>
                </div>

                {/* Moves */}
                <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-3 shadow-sm mb-2">
                  <div className="bg-purple-500 rounded-lg p-2">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">चालें</p>
                    <p className="text-xl font-bold text-purple-600">{moves}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-50 rounded-xl p-3 shadow-sm mb-3">
                  <p className="text-xs text-gray-600 font-medium mb-1.5">प्रगति</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 rounded-full"
                      style={{ width: `${(matches / pairCount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 text-center">
                    {Math.round((matches / pairCount) * 100)}% पूर्ण
                  </p>
                </div>

                {/* Spacer to push exit button to bottom inside the box */}
                <div className="flex-1" />

                {/* Exit Button — inside the box */}
                <Button
                  onClick={handleExitClick}
                  variant="destructive"
                  className="w-full py-3 font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                  <X className="w-5 h-5" />
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

                {/* LEFT: Score Display */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    मूल्यांकन पूर्ण
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                    <Trophy className="h-7 w-7 text-yellow-500" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">परिणाम</span>
                  </h2>

                  {/* Score Circle */}
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-5">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="72" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle
                        cx="80" cy="80" r="72"
                        stroke="url(#scoreGrad)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 72}`}
                        strokeDashoffset={`${2 * Math.PI * 72 * (1 - analysis.score / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-800">{analysis.score}</span>
                      <span className="text-sm text-gray-500">/ 100</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 w-full text-center mb-3">
                    <p className="text-xs text-gray-600 mb-1">याददाश्त स्तर</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {analysis.memoryLevel}
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm text-center mb-2 px-2">{analysis.feedback}</p>
                  <p className="text-xs text-gray-400 text-center">
                    गेम समाप्ति: {analysis.endReason === 'COMPLETED' ? 'पूर्ण' : analysis.endReason === 'EXITED' ? 'बाहर निकले' : 'समय समाप्त'}
                  </p>
                </div>

                {/* RIGHT: Performance Breakdown */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    प्रदर्शन विश्लेषण
                  </h3>

                  {analysis.breakdown && (
                    <div className="space-y-4">
                      {/* Accuracy */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-medium text-gray-700 text-sm flex items-center gap-1.5"><Crosshair className="h-3.5 w-3.5 text-blue-500" />सटीकता</span>
                          <span className="font-bold text-blue-600 text-sm">{Math.min(100, Math.max(0, Math.round(analysis.breakdown.accuracy * 100)))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, analysis.breakdown.accuracy * 100))}%` }} />
                        </div>
                      </div>

                      {/* Efficiency */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-medium text-gray-700 text-sm flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-green-500" />कार्यक्षमता</span>
                          <span className="font-bold text-green-600 text-sm">{Math.min(100, Math.max(0, Math.round(analysis.breakdown.efficiency * 100)))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, analysis.breakdown.efficiency * 100))}%` }} />
                        </div>
                      </div>

                      {/* Speed */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-medium text-gray-700 text-sm flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-purple-500" />गति</span>
                          <span className="font-bold text-purple-600 text-sm">{Math.min(100, Math.max(0, Math.round(analysis.breakdown.speed * 100)))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, analysis.breakdown.speed * 100))}%` }} />
                        </div>
                      </div>

                      {/* Control */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-medium text-gray-700 text-sm flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-orange-500" />नियंत्रण</span>
                          <span className="font-bold text-orange-600 text-sm">{Math.min(100, Math.max(0, Math.round(analysis.breakdown.control * 100)))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, analysis.breakdown.control * 100))}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <Button
                      onClick={() => setScreen("mode-select")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold"
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

export default MemoryMatchGrid;
