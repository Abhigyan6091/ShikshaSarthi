import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  History,
  Brain,
  Grid3X3,
  Clock,
  Trophy,
  Target,
  Zap,
  Calendar,
  TrendingUp,
  Award,
  ChevronDown,
  BarChart3,
  Activity
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const PuzzleHistory: React.FC = () => {
  const navigate = useNavigate();
  const [pastResults, setPastResults] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [loadingHistory, setLoadingHistory] = useState(false);

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
    if (!studentId) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await axios.get(`${API_URL}/puzzles/history/${studentId}`);
        setPastResults(res.data);
      } catch (err) {
        console.error("Error fetching puzzle history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [studentId]);

  const getResultLabel = (endReason: string) => {
    switch (endReason) {
      case "COMPLETED": return "पूर्ण";
      case "EXITED": return "बाहर निकले";
      case "TIME_UP": return "समय समाप्त";
      default: return endReason;
    }
  };

  const getResultColor = (endReason: string) => {
    switch (endReason) {
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "EXITED": return "bg-red-100 text-red-700";
      case "TIME_UP": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPuzzleIcon = (puzzleType: string) => {
    switch (puzzleType) {
      case "memory_match": return Brain;
      case "match_pieces": return Grid3X3;
      default: return Target;
    }
  };

  const getPuzzleTitle = (puzzleType: string) => {
    switch (puzzleType) {
      case "memory_match": return "मेमोरी मैच";
      case "match_pieces": return "मैच पीसेज़";
      default: return puzzleType;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate overall stats
  const totalAttempts = pastResults.length;
  const completedGames = pastResults.filter(r => r.endReason === "COMPLETED").length;
  const averageScore = pastResults.length > 0 
    ? Math.round(pastResults.reduce((sum, r) => sum + r.score, 0) / pastResults.length) 
    : 0;
  const bestScore = pastResults.length > 0 
    ? Math.max(...pastResults.map(r => r.score)) 
    : 0;

  // Calculate per-puzzle stats
  const memoryMatchResults = pastResults.filter(r => r.puzzleType === "memory_match");
  const matchPiecesResults = pastResults.filter(r => r.puzzleType === "match_pieces");

  const calculatePuzzleStats = (results: any[]) => {
    if (results.length === 0) return null;
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    const bestScore = Math.max(...results.map(r => r.score));
    const completed = results.filter(r => r.endReason === "COMPLETED").length;
    const avgTime = Math.round(results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length);
    return { avgScore, bestScore, completed, total: results.length, avgTime };
  };

  const memoryMatchStats = calculatePuzzleStats(memoryMatchResults);
  const matchPiecesStats = calculatePuzzleStats(matchPiecesResults);

  const getAnalysisText = (stats: any, puzzleName: string) => {
    if (!stats) return `अभी तक ${puzzleName} नहीं खेला गया।`;
    
    let performance = "औसत";
    if (stats.avgScore >= 85) performance = "उत्कृष्ट";
    else if (stats.avgScore >= 70) performance = "अच्छा";
    else if (stats.avgScore < 55) performance = "सुधार की आवश्यकता";

    const completionRate = Math.round((stats.completed / stats.total) * 100);
    
    return `आपने ${stats.total} बार ${puzzleName} खेला है। आपका औसत स्कोर ${stats.avgScore} है जो ${performance} प्रदर्शन दर्शाता है। आपकी पूर्णता दर ${completionRate}% है और औसत समय ${Math.floor(stats.avgTime / 60)} मिनट ${stats.avgTime % 60} सेकंड है।`;
  };

  const getCombinedAnalysis = () => {
    if (totalAttempts === 0) return "अभी तक कोई पहेली नहीं खेली गई।";
    
    let overallPerformance = "औसत";
    if (averageScore >= 85) overallPerformance = "उत्कृष्ट";
    else if (averageScore >= 70) overallPerformance = "अच्छा";
    else if (averageScore < 55) overallPerformance = "सुधार की आवश्यकता";

    const completionRate = Math.round((completedGames / totalAttempts) * 100);
    
    let strengthArea = "";
    if (memoryMatchStats && matchPiecesStats) {
      strengthArea = memoryMatchStats.avgScore > matchPiecesStats.avgScore 
        ? " आप मेमोरी मैच में बेहतर प्रदर्शन कर रहे हैं।"
        : matchPiecesStats.avgScore > memoryMatchStats.avgScore
        ? " आप मैच पीसेज़ में बेहतर प्रदर्शन कर रहे हैं।"
        : " आप दोनों पहेलियों में समान रूप से अच्छा प्रदर्शन कर रहे हैं।";
    }

    return `कुल मिलाकर आपका औसत स्कोर ${averageScore} है जो ${overallPerformance} प्रदर्शन है। आपकी पूर्णता दर ${completionRate}% है।${strengthArea} निरंतर अभ्यास से और सुधार हो सकता है।`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Header />

      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/student/multimedia-assessment')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              मल्टीमीडिया मूल्यांकन पर वापस जाएं
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <History className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  पहेली गेम्स इतिहास
                </h1>
                <p className="text-gray-600">
                  आपके सभी पहेली गेम के परिणाम और प्रगति
                </p>
              </div>
            </div>
          </div>

          {/* Puzzle Analysis Accordion */}
          {totalAttempts > 0 && (
            <Accordion type="single" collapsible className="mb-8">
              <AccordionItem value="analysis" className="border border-indigo-200 rounded-lg px-4 bg-white shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">पहेली विश्लेषण</h3>
                      <p className="text-sm text-gray-600">व्यक्तिगत और संयुक्त स्कोर देखें</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-6 mt-2">
                    {/* Individual Puzzle Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Memory Match */}
                      <Card className="border-2 border-indigo-100 bg-indigo-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-5 w-5 text-indigo-600" />
                            <CardTitle className="text-base">मेमोरी मैच</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {memoryMatchStats ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">औसत स्कोर:</span>
                                <span className={`text-xl font-bold ${getScoreColor(memoryMatchStats.avgScore)}`}>
                                  {memoryMatchStats.avgScore}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">सर्वोत्तम स्कोर:</span>
                                <span className="text-lg font-semibold text-green-600">{memoryMatchStats.bestScore}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">पूर्ण खेल:</span>
                                <span className="text-sm font-medium">{memoryMatchStats.completed}/{memoryMatchStats.total}</span>
                              </div>
                              <div className="pt-2 mt-2 border-t border-indigo-200">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {getAnalysisText(memoryMatchStats, "मेमोरी मैच")}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">अभी तक कोई डेटा उपलब्ध नहीं</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Match Pieces */}
                      <Card className="border-2 border-cyan-100 bg-cyan-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Grid3X3 className="h-5 w-5 text-cyan-600" />
                            <CardTitle className="text-base">मैच पीसेज़</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {matchPiecesStats ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">औसत स्कोर:</span>
                                <span className={`text-xl font-bold ${getScoreColor(matchPiecesStats.avgScore)}`}>
                                  {matchPiecesStats.avgScore}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">सर्वोत्तम स्कोर:</span>
                                <span className="text-lg font-semibold text-green-600">{matchPiecesStats.bestScore}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">पूर्ण खेल:</span>
                                <span className="text-sm font-medium">{matchPiecesStats.completed}/{matchPiecesStats.total}</span>
                              </div>
                              <div className="pt-2 mt-2 border-t border-cyan-200">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {getAnalysisText(matchPiecesStats, "मैच पीसेज़")}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">अभी तक कोई डेटा उपलब्ध नहीं</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Combined Analysis */}
                    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-purple-600" />
                          <CardTitle className="text-base">संयुक्त विश्लेषण</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">कुल औसत स्कोर:</span>
                            <span className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                              {averageScore}
                            </span>
                          </div>
                          <div className="pt-3 border-t border-purple-200">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {getCombinedAnalysis()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Statistics Cards */}
          {totalAttempts > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalAttempts}</div>
                  <div className="text-sm text-gray-600">कुल प्रयास</div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{completedGames}</div>
                  <div className="text-sm text-gray-600">पूर्ण गेम्स</div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{averageScore}</div>
                  <div className="text-sm text-gray-600">औसत स्कोर</div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{bestScore}</div>
                  <div className="text-sm text-gray-600">सर्वोत्तम स्कोर</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History List */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="h-5 w-5 text-green-600" />
                गेम इतिहास
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">डेटा लोड हो रहा है...</div>
                </div>
              ) : pastResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">अभी तक कोई गेम नहीं खेला गया</div>
                  <Button onClick={() => navigate('/student/multimedia/puzzles')}>
                    पहला गेम खेलें
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pastResults.map((result: any, index: number) => {
                    const IconComponent = getPuzzleIcon(result.puzzleType);
                    return (
                      <div 
                        key={result._id || index} 
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">
                              {getPuzzleTitle(result.puzzleType)}
                            </div>
                            <div className="text-sm text-gray-500 flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(result.attemptedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(result.timeTaken)}
                              </span>
                              {result.mode && (
                                <span className="text-gray-600">
                                  {result.mode === "individual" ? "व्यक्तिगत" : "समूह"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <div className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                              {result.score}
                            </div>
                            <div className="text-xs text-gray-500">स्कोर</div>
                          </div>
                          <Badge className={getResultColor(result.endReason)}>
                            {getResultLabel(result.endReason)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PuzzleHistory;
