
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Video, Maximize2, Minimize2, ExternalLink,
  History, Upload, Play, StopCircle, RefreshCw, Download,
  CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp,
  Volume2, Clock, Info, Filter, FileText, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE = '/vqg/api';

interface Question {
  id: string;
  question_text: string;
  mc_options: string[];
  correct_option: number;
  explanation: string;
  category: string;
  difficulty: string;
  difficulty_score?: number;
  novelty_score?: number;
  audio_path?: string;
}

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptData {
  text: string;
  segments: TranscriptSegment[];
  status?: string;
}

interface VideoHistoryItem {
  id: string;
  filename: string;
  status: string;
  created_at: string;
  language?: string;
  duration?: number;
}

const CATEGORY_INFO: Record<string, { color: string; icon: string; label: string }> = {
  temporal: { color: 'bg-blue-100 text-blue-700', icon: '⏱️', label: 'Temporal' },
  causal: { color: 'bg-purple-100 text-purple-700', icon: '🔗', label: 'Causal' },
  counterfactual: { color: 'bg-pink-100 text-pink-700', icon: '🔀', label: 'Counterfactual' },
  contradiction: { color: 'bg-orange-100 text-orange-700', icon: '⚡', label: 'Contradiction' },
  emotion: { color: 'bg-amber-100 text-amber-700', icon: '💭', label: 'Emotion' },
  multi_scene: { color: 'bg-teal-100 text-teal-700', icon: '🎬', label: 'Multi-Scene' },
  symbolic: { color: 'bg-indigo-100 text-indigo-700', icon: '🔮', label: 'Symbolic' },
  other: { color: 'bg-slate-100 text-slate-700', icon: '❓', label: 'Other' },
};

const STEP_LABELS: Record<string, string> = {
  audio_processing: 'Audio Processing',
  question_generation: 'Question Generation',
  quality_filter: 'Quality Filtering',
  difficulty_estimation: 'Difficulty Estimation',
  uniqueness_filter: 'Uniqueness Filter',
  saving: 'Saving Results',
  completed: 'Completed',
  error: 'Error',
};

const QuestionGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoHistoryItem | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);

  // UI States
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'configured'>('idle');
  const [processingState, setProcessingState] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Config States
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');
  const [style, setStyle] = useState('mixed');
  const [customPrompt, setCustomPrompt] = useState('');

  // Progress States
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressSteps, setProgressSteps] = useState<{ step: string; detail: string; status: 'active' | 'done' | 'error' }[]>([]);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(true);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Audio state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadHistory();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const loadHistory = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/videos`);
      setHistory(resp.data.videos || []);
    } catch (err) {
      console.error('History load failed:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.mp4')) {
      toast.error('Please select an MP4 file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error('File too large. Max: 500 MB');
      return;
    }

    setUploadFile(file);
    setUploadState('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resp = await axios.post(`${API_BASE}/upload`, formData);
      const videoId = resp.data.video.id;

      setCurrentVideo({
        id: videoId,
        filename: file.name,
        status: 'idle',
        created_at: new Date().toISOString()
      });
      setUploadState('configured');
      toast.success('Video uploaded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed');
      setUploadState('idle');
      setUploadFile(null);
    }
  };

  const startProcessing = async () => {
    if (!currentVideo) return;

    setProcessingState('running');
    setProgressPercent(0);
    setProgressSteps([]);
    setQuestions([]);
    setTranscript(null);

    try {
      // 1. Save config
      await axios.post(`${API_BASE}/upload-config/${currentVideo.id}`, {
        language,
        custom_prompt: customPrompt,
        question_style: style
      });

      // 2. Start processing
      await axios.post(`${API_BASE}/process/${currentVideo.id}`);

      // 3. Listen for progress
      listenProgress(currentVideo.id);
    } catch (err: any) {
      toast.error('Failed to start processing');
      setProcessingState('idle');
    }
  };

  const listenProgress = (videoId: string) => {
    const evtSource = new EventSource(`${API_BASE}/progress/${videoId}`);

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { step, percent, detail } = data;

      if (percent >= 0) setProgressPercent(percent);

      setProgressSteps(prev => {
        const lastStep = prev[prev.length - 1];
        if (lastStep && lastStep.step === step && step !== 'completed' && step !== 'error') {
          // Update last step detail
          const newSteps = [...prev];
          newSteps[newSteps.length - 1] = { ...lastStep, detail };
          return newSteps;
        }

        // Add new step
        const newStepStatus: 'active' | 'done' | 'error' =
          (step === 'completed' || step === 'cancelled') ? 'done' :
            (step === 'error' ? 'error' : 'active');

        // Mark previous steps as done
        const updatedPrev = prev.map(s => s.status === 'active' ? { ...s, status: 'done' as const } : s);

        return [...updatedPrev, { step, detail, status: newStepStatus }];
      });

      if (step === 'completed') {
        evtSource.close();
        setProcessingState('completed');
        loadResults(videoId);
        loadHistory();
      }

      if (step === 'error') {
        evtSource.close();
        setProcessingState('error');
        toast.error(`Processing failed: ${detail}`);
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      // Wait a bit and check if it completed
      setTimeout(() => checkResultsStatus(videoId), 2000);
    };
  };

  const checkResultsStatus = async (videoId: string) => {
    try {
      const resp = await axios.get(`${API_BASE}/videos/${videoId}`);
      if (resp.data.video.status === 'completed') {
        setProcessingState('completed');
        loadResults(videoId);
      }
    } catch (e) { }
  };

  const loadResults = async (videoId: string) => {
    try {
      const [questionsResp, transcriptResp] = await Promise.all([
        axios.get(`${API_BASE}/questions/${videoId}`),
        axios.get(`${API_BASE}/transcript/${videoId}`).catch(() => ({ data: null })),
      ]);

      setQuestions(questionsResp.data.questions || []);
      setTranscript(transcriptResp.data?.transcript || null);

      // Update current video if needed
      if (!currentVideo || currentVideo.id !== videoId) {
        const v = history.find(h => h.id === videoId);
        if (v) setCurrentVideo(v);
      }
    } catch (err) {
      toast.error('Failed to load results');
    }
  };

  const playAudio = (path: string, id: string) => {
    if (playingAudioId === id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Construct the correct path if it doesn't have the prefix
    const fullPath = path.startsWith('/explanations/') ? `/vqg/explanations${path.substring('/explanations'.length)}` : path;

    const audio = new Audio(fullPath);
    audioRef.current = audio;
    audio.play()
      .then(() => setPlayingAudioId(id))
      .catch(() => toast.error('Audio playback failed'));

    audio.onended = () => setPlayingAudioId(null);
  };

  const formatTime = (seconds: number) => {
    if (seconds == null) return '0:00';
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filteredQuestions = questions.filter(q => {
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && q.difficulty.toLowerCase() !== filterDifficulty.toLowerCase()) return false;
    return true;
  });

  const stopProcessing = async () => {
    if (!currentVideo) return;
    try {
      await axios.post(`${API_BASE}/cancel/${currentVideo.id}`);
      setProcessingState('idle');
      toast.info('Processing cancelled');
    } catch (e) {
      toast.error('Failed to stop processing');
    }
  };

  const exportData = (format: 'csv' | 'json') => {
    if (!currentVideo) return;
    const url = `${API_BASE}/export/${currentVideo.id}?format=${format}${filterCategory !== 'all' ? `&category=${filterCategory}` : ''}${filterDifficulty !== 'all' ? `&difficulty=${filterDifficulty}` : ''}`;
    window.open(url, '_blank');
  };

  const selectFromHistory = (video: VideoHistoryItem) => {
    if (video.status === 'processing') {
      toast.error('Video is currently processing');
      return;
    }

    setCurrentVideo(video);
    setIsHistoryOpen(false);

    if (video.status === 'completed') {
      setProcessingState('completed');
      loadResults(video.id);
    } else {
      setProcessingState('idle');
      setUploadState('configured');
      setUploadFile(null);
      setLanguage(video.language as any || 'english');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/teacher')}
                className="bg-white hover:bg-slate-100 border border-slate-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                  <Video className="h-8 w-8 text-blue-600" />
                  Video Question Generator
                </h1>
                <p className="text-slate-500 mt-1">Transform educational videos into intelligent assessments with AI</p>
              </div>
            </div>

            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white">
                  <History className="h-4 w-4" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    Video History
                  </SheetTitle>
                  <SheetDescription>Previously processed videos and drafts</SheetDescription>
                </SheetHeader>
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-150px)] pr-2">
                  {history.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No video history found</p>
                    </div>
                  ) : (
                    history.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => selectFromHistory(video)}
                        className={`group flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${currentVideo?.id === video.id
                          ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Video className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-slate-900">{video.filename}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 capitalize">{video.language}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(video.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant={
                          video.status === 'completed' ? 'default' :
                            video.status === 'processing' ? 'secondary' :
                              video.status === 'failed' ? 'destructive' : 'outline'
                        } className="capitalize py-0 h-6 shrink-0">
                          {video.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Upload & Config */}
            <div className="lg:col-span-4 space-y-6">

              <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white/70 backdrop-blur-sm">
                <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Upload Video</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {uploadState === 'idle' || uploadState === 'uploading' ? (
                    <div
                      className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${uploadState === 'uploading'
                        ? 'border-blue-400 bg-blue-50/30'
                        : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                      onClick={() => document.getElementById('native-file-input')?.click()}
                    >
                      <input
                        type="file"
                        id="native-file-input"
                        className="hidden"
                        accept=".mp4"
                        onChange={handleFileUpload}
                        disabled={uploadState === 'uploading'}
                      />
                      <div className={`p-4 rounded-full mb-4 transition-transform group-hover:scale-110 ${uploadState === 'uploading' ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'
                        }`}>
                        {uploadState === 'uploading' ? (
                          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        ) : (
                          <Video className="h-8 w-8 text-slate-400 group-hover:text-blue-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">
                        {uploadState === 'uploading' ? 'Uploading your video...' : 'Drop your video here'}
                      </h3>
                      <p className="text-xs text-slate-500">Supports .mp4 files up to 500 MB</p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col items-center text-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
                      <h3 className="font-bold text-emerald-900 truncate w-full px-4">{currentVideo?.filename}</h3>
                      <p className="text-xs text-emerald-600 mt-1">Ready for processing</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-emerald-700 hover:text-emerald-900 mt-2"
                        onClick={() => {
                          setUploadState('idle');
                          setUploadFile(null);
                        }}
                      >
                        Replace File
                      </Button>
                    </div>
                  )}

                  {uploadState === 'configured' && processingState !== 'running' && (
                    <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-semibold flex items-center gap-2">
                          Output Language
                        </Label>
                        <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                          <SelectTrigger className="bg-slate-100 border-none h-11">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="hindi">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-slate-700 font-semibold flex items-center gap-2">
                          Question Style
                        </Label>
                        <Select value={style} onValueChange={setStyle}>
                          <SelectTrigger className="bg-slate-100 border-none h-11">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mixed">Mixed (Standard + Logic)</SelectItem>
                            <SelectItem value="standard">Standard (Knowledge-based)</SelectItem>
                            <SelectItem value="example_based">Example-based Reasoning</SelectItem>
                            <SelectItem value="mathematical">Mathematical & Analytical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-slate-700 font-semibold flex items-center gap-2">
                          Custom Instructions <span className="font-normal text-slate-400 text-[10px] uppercase tracking-wider">(Optional)</span>
                        </Label>
                        <Textarea
                          placeholder="e.g. Focus on physics concepts, Ask deep reasoning questions..."
                          className="bg-slate-100 border-none min-h-[100px] text-slate-700 placeholder:text-slate-400"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95"
                        onClick={startProcessing}
                      >
                        <Play className="h-5 w-5 mr-2 fill-current" />
                        Start AI Generation
                      </Button>
                    </div>
                  )}

                  {processingState === 'running' && (
                    <div className="mt-8 space-y-6">
                      <div className="bg-blue-600 rounded-2xl p-6 text-white overflow-hidden relative">
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-100">AI Engine Working</span>
                            <span className="text-2xl font-black">{progressPercent}%</span>
                          </div>
                          <Progress value={progressPercent} className="bg-blue-400/50 h-2" indicatorColor="bg-white" />
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      </div>

                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                        {progressSteps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            {step.status === 'active' ? (
                              <Loader2 className="h-3 w-3 mt-0.5 text-blue-600 animate-spin" />
                            ) : step.status === 'error' ? (
                              <AlertCircle className="h-3 w-3 mt-0.5 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-500" />
                            )}
                            <div className="flex-1">
                              <span className="font-bold text-slate-700 mr-2">{STEP_LABELS[step.step] || step.step}:</span>
                              <span className="text-slate-500">{step.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="destructive"
                        variant-ghost
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={stopProcessing}
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Stop Processing
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {processingState === 'completed' && transcript && (
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white overflow-hidden">
                  <CardHeader
                    className="border-b bg-slate-50/50 px-6 py-4 flex flex-row items-center justify-between cursor-pointer"
                    onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Video Transcript</CardTitle>
                    </div>
                    {isTranscriptExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </CardHeader>
                  {isTranscriptExpanded && (
                    <CardContent className="p-0">
                      <div className="max-h-[300px] overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                        {transcript.segments.length > 0 ? (
                          transcript.segments.map((seg, i) => (
                            <div key={i} className="flex gap-4 group">
                              <span className="text-[10px] font-mono text-slate-400 mt-1 min-w-[32px] group-hover:text-blue-500 transition-colors">
                                {formatTime(seg.start)}
                              </span>
                              <p className="text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                                {seg.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 italic p-4 text-center">No segments found</p>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 border-t flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold" onClick={() => window.open(`${API_BASE}/export-transcript/${currentVideo?.id}?format=txt`)}>
                          .TXT
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold" onClick={() => window.open(`${API_BASE}/export-transcript/${currentVideo?.id}?format=json`)}>
                          .JSON
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>

            {/* Right Column: Questions Grid */}
            <div className="lg:col-span-8 space-y-6">

              {processingState === 'completed' && questions.length > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="h-9 w-[160px] bg-slate-50">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                              <SelectItem key={key} value={key}>{info.icon} {info.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                        <SelectTrigger className="h-9 w-[130px] bg-slate-50">
                          <SelectValue placeholder="All Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Difficulty</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => exportData('csv')}>
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => exportData('json')}>
                        <Download className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                      <Button variant="secondary" size="sm" className="h-9 text-xs" onClick={startProcessing}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredQuestions.length > 0 ? (
                      filteredQuestions.map((q, i) => (
                        <Card key={q.id || i} className="group border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-200/30 transition-all bg-white flex flex-col overflow-hidden border-l-4 border-l-blue-600">
                          <CardHeader className="pb-3 px-6 pt-6">
                            <div className="flex items-start justify-between">
                              <Badge className={`uppercase text-[9px] tracking-widest font-bold py-0.5 px-2 rounded-full ${q.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                q.difficulty.toLowerCase() === 'hard' ? 'bg-orange-100 text-orange-700' :
                                  q.difficulty.toLowerCase() === 'expert' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {q.difficulty}
                              </Badge>
                              <div className="flex items-center gap-2">
                                {q.difficulty_score && <span className="text-[10px] text-slate-400 font-bold">LVL {q.difficulty_score}</span>}
                                {CATEGORY_INFO[q.category] && (
                                  <span className="text-lg opacity-40 group-hover:opacity-100 transition-opacity" title={CATEGORY_INFO[q.category].label}>
                                    {CATEGORY_INFO[q.category].icon}
                                  </span>
                                )}
                              </div>
                            </div>
                            <CardTitle className="text-base leading-snug font-bold text-slate-800 mt-2 line-clamp-3 group-hover:text-blue-900 transition-colors">
                              {q.question_text}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-6 pb-4 flex-1">
                            <div className="space-y-2 mt-4">
                              {q.mc_options.map((option, idx) => (
                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${idx === q.correct_option
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                                  : 'bg-slate-50 border-slate-100 text-slate-600'
                                  }`}>
                                  <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${idx === q.correct_option ? 'bg-emerald-200 text-emerald-800' : 'bg-white text-slate-400'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  {option}
                                  {idx === q.correct_option && <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto" />}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="px-6 py-4 bg-slate-50/50 border-t flex flex-col items-start gap-4">
                            <div className="w-full">
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                                <Info className="h-3 w-3" />
                                AI Insight & Explanation
                              </p>
                              <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                                {q.explanation}
                              </p>
                            </div>
                            {q.audio_path && (
                              <Button
                                variant={playingAudioId === q.id ? "default" : "secondary"}
                                size="sm"
                                className={`h-9 gap-2 rounded-full px-4 transition-all ${playingAudioId === q.id ? 'bg-blue-600' : ''}`}
                                onClick={() => playAudio(q.audio_path!, q.id)}
                              >
                                {playingAudioId === q.id ? (
                                  <><Loader2 className="h-4 w-4 animate-spin" /> Playing...</>
                                ) : (
                                  <><Volume2 className="h-4 w-4" /> Listen to AI Tutor</>
                                )}
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed text-center flex flex-col items-center">
                        <History className="h-12 w-12 text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No questions match filters</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your category or difficulty selection</p>
                      </div>
                    )}
                  </div>
                </>
              ) : processingState === 'idle' && !currentVideo ? (
                <div className="h-full min-h-[600px] bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-12">
                  <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <Video className="h-16 w-16 text-slate-200" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome to Video Assessment</h2>
                  <p className="text-slate-500 max-w-sm mb-8">
                    Upload a video or select one from history to start generating intelligent questions using AI.
                  </p>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => document.getElementById('native-file-input')?.click()}
                  >
                    Get Started Now
                  </Button>
                </div>
              ) : processingState === 'running' ? (
                <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-8 animate-pulse">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Video Content</h3>
                    <p className="text-slate-500">Extracting audio, transcribing speech, and generating reasoning questions...</p>
                  </div>
                  <div className="flex gap-3">
                    {[1, 2, 3].map(i => <div key={i} className={`h-2 w-2 rounded-full bg-blue-600 animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuestionGenerator;
