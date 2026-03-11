import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Calendar, Clock, Plus, Edit, Save, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  _id: string;
  questionId?: string;
  subject: string;
  class: string;
  topic: string;
  subtopic?: string;
  question?: string; // Optional for video questions
  options?: string[]; // Optional for video questions
  correctAnswer?: string;
  questionImage?: string;
  difficulty?: string;
  type?: 'mcq' | 'audio' | 'video' | 'puzzle';
  
  // Audio question specific fields
  audio?: string;
  
  // Video question specific fields
  videoUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoDuration?: string;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    hint?: {
      text?: string;
      image?: string;
    };
  }>;
  
  // Individual video question fields (for hierarchical selection)
  parentVideoId?: string;
  questionIndex?: number;
  hint?: {
    text?: string;
    image?: string;
  };
}

interface QuizConfig {
  quizId: string;
  timeLimit: number;
  totalQuestions: number;
  mcqCount: number;
  audioCount: number;
  videoCount: number;
  puzzleCount: number;
  startTime: string;
  endTime: string; // This will be auto-calculated
}

interface QuestionSlot {
  index: number;
  type: 'mcq' | 'audio' | 'video' | 'puzzle';
  question: Question | null;
}

export default function CreateQuizNew() {
  // YouTube URL helper functions
  const isYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };
  
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };
  
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const [showQuestionPalette, setShowQuestionPalette] = useState(false);
  const [config, setConfig] = useState<QuizConfig>({
    quizId: '',
    timeLimit: 60,
    totalQuestions: 0,
    mcqCount: 0,
    audioCount: 0,
    videoCount: 0,
    puzzleCount: 0,
    startTime: '',
    endTime: ''
  });
  
  const [questionSlots, setQuestionSlots] = useState<QuestionSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Filter states
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    subtopic: '',
    class: '',
    difficulty: ''
  });
  
  // Video question hierarchical selection states
  const [videoSelectionStep, setVideoSelectionStep] = useState<'subject' | 'topic' | 'questions'>('subject');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [videoQuestionSets, setVideoQuestionSets] = useState<any[]>([]);
  
  // MCQ and Audio question hierarchical selection states
  const [mcqAudioSelectionStep, setMcqAudioSelectionStep] = useState<'subject' | 'topic' | 'questions'>('subject');
  const [mcqAudioAvailableSubjects, setMcqAudioAvailableSubjects] = useState<string[]>([]);
  const [mcqAudioAvailableTopics, setMcqAudioAvailableTopics] = useState<string[]>([]);
  const [mcqAudioSelectedSubject, setMcqAudioSelectedSubject] = useState<string>('');
  const [mcqAudioSelectedTopic, setMcqAudioSelectedTopic] = useState<string>('');
  const [currentQuestionType, setCurrentQuestionType] = useState<'mcq' | 'audio' | null>(null);
  
  const [teacherId, setTeacherId] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [quizToUpdate, setQuizToUpdate] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    // Get teacher info from localStorage and cookies
    const currentUser = localStorage.getItem('currentUser');
    const teacherCookie = Cookies.get('teacher');
    
    let teacherData = null;
    
    console.log('=== TEACHER ID DEBUG ===');
    console.log('Raw currentUser:', currentUser);
    console.log('Raw teacherCookie:', teacherCookie);
    
    // Try to get from localStorage first
    if (currentUser) {
      try {
        teacherData = JSON.parse(currentUser);
        console.log('Parsed currentUser:', teacherData);
      } catch (e) {
        console.error('Error parsing currentUser', e);
      }
    }
    
    // Fallback to cookie if needed
    if (teacherCookie && (!teacherData || !teacherData.teacherId)) {
      try {
        const cookieData = JSON.parse(teacherCookie);
        console.log('Parsed cookie data:', cookieData);
        // The cookie structure is { teacher: {...} }
        teacherData = cookieData.teacher || cookieData;
        console.log('Extracted teacher data from cookie:', teacherData);
      } catch (e) {
        console.error('Error parsing teacher cookie', e);
      }
    }
    
    if (teacherData) {
      // Use teacherId first, fallback to _id, then username
      const id = teacherData.teacherId || teacherData._id || teacherData.username || '';
      console.log('Teacher data found:', teacherData);
      console.log('Available fields:', Object.keys(teacherData));
      console.log('Teacher ID extracted:', id);
      console.log('Teacher ID type:', typeof id);
      console.log('Teacher ID length:', id.length);
      
      if (!id || id.trim() === '') {
        console.error('❌ Teacher ID is empty!');
        toast({
          title: "Error",
          description: "Teacher ID not found. Please log out and log in again.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Teacher ID set successfully:', id);
        setTeacherId(id);
      }
    } else {
      console.error('❌ No teacher data found in localStorage or cookies');
      toast({
        title: "Error",
        description: "No teacher session found. Please log in.",
        variant: "destructive"
      });
    }
    console.log('========================');
  }, [toast]);

  // Auto-calculate end time when start time or time limit changes
  useEffect(() => {
    if (config.startTime && config.timeLimit > 0) {
      // Parse the datetime-local value which is already in local timezone
      const startDate = new Date(config.startTime);
      
      // Add time limit in minutes
      const endDate = new Date(startDate.getTime() + config.timeLimit * 60000);
      
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const endDateIST = new Date(endDate.getTime());
      
      // Format for datetime-local input (YYYY-MM-DDTHH:mm) in local timezone
      const year = endDateIST.getFullYear();
      const month = String(endDateIST.getMonth() + 1).padStart(2, '0');
      const day = String(endDateIST.getDate()).padStart(2, '0');
      const hours = String(endDateIST.getHours()).padStart(2, '0');
      const minutes = String(endDateIST.getMinutes()).padStart(2, '0');
      
      const endTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
      setConfig(prev => ({ ...prev, endTime: endTimeString }));
    }
  }, [config.startTime, config.timeLimit]);

  // Validate quiz configuration
  const validateConfig = () => {
    const { quizId, timeLimit, totalQuestions, mcqCount, audioCount, videoCount, puzzleCount, startTime } = config;
    
    if (!quizId.trim()) {
      toast({ title: "Error", description: "Quiz ID is required", variant: "destructive" });
      return false;
    }
    
    if (timeLimit <= 0) {
      toast({ title: "Error", description: "Time limit must be greater than 0", variant: "destructive" });
      return false;
    }
    
    // Calculate total from individual counts (1 video = 1 question slot)
    const calculatedTotal = mcqCount + audioCount + puzzleCount + videoCount;
    
    if (totalQuestions !== calculatedTotal) {
      toast({ 
        title: "Error", 
        description: `Total questions (${totalQuestions}) must equal MCQ + Audio + Puzzles + Videos = ${calculatedTotal}`,
        variant: "destructive" 
      });
      return false;
    }
    
    if (!startTime) {
      toast({ title: "Error", description: "Start time is required", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  // Check if quiz ID exists
  const checkQuizIdExists = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/quizzes/check/${id}`);
      return response.data.exists;
    } catch (error) {
      return false;
    }
  };

  // Initialize question slots based on config
  const initializeSlots = () => {
    const slots: QuestionSlot[] = [];
    let index = 0;
    
    // First: MCQ questions
    for (let i = 0; i < config.mcqCount; i++) {
      slots.push({ index: index++, type: 'mcq', question: null });
    }
    
    // Second: Audio questions
    for (let i = 0; i < config.audioCount; i++) {
      slots.push({ index: index++, type: 'audio', question: null });
    }
    
    // Third: Video questions (1 video = 1 question slot)
    for (let i = 0; i < config.videoCount; i++) {
      slots.push({ index: index++, type: 'video', question: null });
    }
    
    // Fourth: Puzzle questions
    for (let i = 0; i < config.puzzleCount; i++) {
      slots.push({ index: index++, type: 'puzzle', question: null });
    }
    
    setQuestionSlots(slots);
  };

  const handleConfigSubmit = async () => {
    if (!validateConfig()) return;
    
    // Check if quiz ID already exists (unless in update mode)
    if (!isUpdateMode) {
      const exists = await checkQuizIdExists(config.quizId);
      if (exists) {
        toast({ 
          title: "Error", 
          description: "Quiz ID already exists. Please use a unique ID or use Update mode.",
          variant: "destructive" 
        });
        return;
      }
    }
    
    initializeSlots();
    setShowQuestionPalette(true);
    
    toast({
      title: "Configuration Saved",
      description: `Now select questions for your quiz (${config.totalQuestions} questions needed)`
    });
  };

  // Load questions based on type and filters
  const loadQuestionsForSlot = async (slotIndex: number) => {
    const slot = questionSlots[slotIndex];
    setSelectedSlot(slotIndex);
    
    try {
      switch (slot.type) {
        case 'mcq': {
          setCurrentQuestionType('mcq');
          // For MCQ questions, load all subjects first (similar to video questions)
          const subjectsResponse = await axios.get(`${API_URL}/questions/`);
          const allQuestions = subjectsResponse.data;
          
          // Extract unique subjects
          const subjects = [...new Set(allQuestions.map((q: any) => q.subject))].filter(Boolean) as string[];
          setMcqAudioAvailableSubjects(subjects);
          
          // Reset selection state
          setMcqAudioSelectionStep('subject');
          setMcqAudioSelectedSubject('');
          setMcqAudioSelectedTopic('');
          setMcqAudioAvailableTopics([]);
          setFilteredQuestions([]);
          
          setIsFilterDialogOpen(true);
          console.log('MCQ subjects loaded:', subjects);
          break;
        }
          
        case 'audio': {
          setCurrentQuestionType('audio');
          // For audio questions, load all subjects first (similar to video questions)
          const subjectsResponse = await axios.get(`${API_URL}/audio-questions/`);
          const allQuestions = subjectsResponse.data;
          
          // Extract unique subjects
          const subjects = [...new Set(allQuestions.map((q: any) => q.subject))].filter(Boolean) as string[];
          setMcqAudioAvailableSubjects(subjects);
          
          // Reset selection state
          setMcqAudioSelectionStep('subject');
          setMcqAudioSelectedSubject('');
          setMcqAudioSelectedTopic('');
          setMcqAudioAvailableTopics([]);
          setFilteredQuestions([]);
          
          setIsFilterDialogOpen(true);
          console.log('Audio subjects loaded:', subjects);
          break;
        }
          
        case 'video': {
          // For video questions, load all data and start hierarchical selection
          const endpoint = `${API_URL}/video-questions/`;
          const videoResponse = await axios.get(endpoint);
          
          // Store all video question sets
          setVideoQuestionSets(videoResponse.data);
          
          // Extract unique subjects
          const subjects = [...new Set(videoResponse.data.map((vq: any) => vq.subject))].filter(Boolean) as string[];
          setAvailableSubjects(subjects);
          
          // Reset selection state
          setVideoSelectionStep('subject');
          setSelectedSubject('');
          setSelectedTopic('');
          setAvailableTopics([]);
          setFilteredQuestions([]);
          
          setIsFilterDialogOpen(true);
          console.log('Video subjects loaded:', subjects);
          break;
        }
          
        case 'puzzle': {
          const endpoint = `${API_URL}/puzzles/`;
          const puzzleResponse = await axios.get(endpoint);
          const questions = puzzleResponse.data.map((q: any) => ({
            _id: q._id,
            questionId: q._id,
            subject: q.subject || 'संज्ञानात्मक',
            class: q.class || 'सभी',
            topic: q.topic || 'पहेली',
            subtopic: '',
            question: q.title || 'Puzzle Game',
            options: [],
            correctAnswer: '',
            questionImage: '',
            difficulty: '',
            type: 'puzzle' as const,
            // puzzle-specific fields
            puzzleType: q.puzzleType,
            puzzleTitle: q.title,
            puzzleDescription: q.description,
            puzzleRoute: q.route,
            puzzleDuration: q.duration,
            puzzleModes: q.modes,
          }));
          setAvailableQuestions(questions);
          setFilteredQuestions(questions);
          setIsFilterDialogOpen(true);
          break;
        }
      }
      
      console.log(`Started loading ${slot.type} questions`);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load questions",
        variant: "destructive"
      });
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...availableQuestions];
    
    if (filters.subject && filters.subject !== '') {
      filtered = filtered.filter(q => q.subject && q.subject.toLowerCase().includes(filters.subject.toLowerCase()));
    }
    if (filters.topic && filters.topic !== '') {
      filtered = filtered.filter(q => q.topic && q.topic.toLowerCase().includes(filters.topic.toLowerCase()));
    }
    if (filters.subtopic && filters.subtopic !== '') {
      filtered = filtered.filter(q => q.subtopic && q.subtopic.toLowerCase().includes(filters.subtopic.toLowerCase()));
    }
    if (filters.class && filters.class !== '') {
      filtered = filtered.filter(q => q.class && q.class.toString() === filters.class);
    }
    if (filters.difficulty && filters.difficulty !== '') {
      filtered = filtered.filter(q => q.difficulty && q.difficulty.toLowerCase().includes(filters.difficulty.toLowerCase()));
    }
    
    setFilteredQuestions(filtered);
  };

  // Handle subject selection for video questions
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    
    // Get topics for this subject
    const topics = [...new Set(
      videoQuestionSets
        .filter((vq: any) => vq.subject === subject)
        .map((vq: any) => vq.topic)
    )].filter(Boolean);
    
    setAvailableTopics(topics);
    setVideoSelectionStep('topic');
    console.log('Topics for subject', subject, ':', topics);
  };
  
  // Handle topic selection for video questions
  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    
    // Get the video question set for this subject + topic
    const videoSet = videoQuestionSets.find(
      (vq: any) => vq.subject === selectedSubject && vq.topic === topic
    );
    
    if (videoSet && videoSet.questions) {
      // Flatten individual questions for selection
      const individualQuestions = videoSet.questions.map((q: any, idx: number) => ({
        _id: `${videoSet._id}_q${idx}`, // Unique ID for each question
        parentVideoId: videoSet._id,
        questionIndex: idx,
        subject: videoSet.subject,
        class: videoSet.class,
        topic: videoSet.topic,
        videoUrl: videoSet.videoUrl,
        videoTitle: videoSet.videoTitle,
        videoDescription: videoSet.videoDescription,
        videoDuration: videoSet.videoDuration,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        hint: q.hint,
        type: 'video'
      }));
      
      setFilteredQuestions(individualQuestions);
      setVideoSelectionStep('questions');
      console.log('Individual questions loaded:', individualQuestions.length);
    }
  };
  
  // Go back in video selection hierarchy
  const handleVideoSelectionBack = () => {
    if (videoSelectionStep === 'questions') {
      setVideoSelectionStep('topic');
      setSelectedTopic('');
      setFilteredQuestions([]);
    } else if (videoSelectionStep === 'topic') {
      setVideoSelectionStep('subject');
      setSelectedSubject('');
      setAvailableTopics([]);
    }
  };

  // Handle subject selection for MCQ/Audio questions
  const handleMcqAudioSubjectSelect = async (subject: string) => {
    console.log('handleMcqAudioSubjectSelect called with:', subject, 'type:', currentQuestionType);
    setMcqAudioSelectedSubject(subject);
    
    try {
      let topics: string[] = [];
      
      if (currentQuestionType === 'mcq') {
        // Get topics for MCQ questions - use NMMS class as default
        const apiUrl = `${API_URL}/questions/topics/NMMS/${encodeURIComponent(subject)}`;
        console.log('Calling MCQ API:', apiUrl);
        const topicsResponse = await axios.get(apiUrl);
        console.log('MCQ API response:', topicsResponse.data);
        topics = topicsResponse.data.topics || [];
      } else if (currentQuestionType === 'audio') {
        // Get topics for audio questions - use NMMS class
        const apiUrl = `${API_URL}/audio-questions/topics/NMMS/${encodeURIComponent(subject)}`;
        console.log('Calling Audio API:', apiUrl);
        const topicsResponse = await axios.get(apiUrl);
        console.log('Audio API response:', topicsResponse.data);
        topics = topicsResponse.data.topics || [];
      }
      
      console.log('Setting topics:', topics);
      setMcqAudioAvailableTopics(topics);
      setMcqAudioSelectionStep('topic');
      console.log('Topics loaded successfully');
    } catch (error: any) {
      console.error('Error loading topics:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast({
        title: "Error",
        description: "Failed to load topics for the selected subject",
        variant: "destructive"
      });
    }
  };
  
  // Handle topic selection for MCQ/Audio questions
  const handleMcqAudioTopicSelect = async (topic: string) => {
    setMcqAudioSelectedTopic(topic);
    
    try {
      let questions: Question[] = [];
      
      if (currentQuestionType === 'mcq') {
        // Get questions for MCQ - use NMMS class
        const questionsResponse = await axios.get(`${API_URL}/questions/NMMS/${encodeURIComponent(mcqAudioSelectedSubject)}/${encodeURIComponent(topic)}`);
        questions = questionsResponse.data.map((q: any) => ({
          _id: q._id || q.id,
          questionId: q.questionId || q.id,
          subject: q.subject || 'N/A',
          class: q.class || 'N/A',
          topic: q.topic || 'N/A',
          subtopic: q.subtopic || '',
          question: q.question || q.questionText || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || q.answer || '',
          questionImage: q.questionImage || q.image || '',
          difficulty: q.difficulty || '',
          type: 'mcq'
        }));
      } else if (currentQuestionType === 'audio') {
        // Get questions for audio - use NMMS class
        const questionsResponse = await axios.get(`${API_URL}/audio-questions/NMMS/${encodeURIComponent(mcqAudioSelectedSubject)}/${encodeURIComponent(topic)}`);
        questions = questionsResponse.data.map((q: any) => ({
          _id: q._id || q.id,
          questionId: q.questionId || q.id,
          subject: q.subject || 'N/A',
          class: q.class || 'N/A',
          topic: q.topic || 'N/A',
          subtopic: q.subtopic || '',
          question: q.question || q.questionText || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || q.answer || '',
          audio: q.audio || q.audioUrl || '',
          questionImage: q.questionImage || q.image || '',
          difficulty: q.difficulty || '',
          type: 'audio'
        }));
      }
      
      setFilteredQuestions(questions);
      setMcqAudioSelectionStep('questions');
      console.log('Questions loaded:', questions.length);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions for the selected topic",
        variant: "destructive"
      });
    }
  };

  // Handle back navigation for MCQ/Audio selection
  const handleMcqAudioSelectionBack = () => {
    if (mcqAudioSelectionStep === 'questions') {
      setMcqAudioSelectionStep('topic');
      setMcqAudioSelectedTopic('');
      setFilteredQuestions([]);
    } else if (mcqAudioSelectionStep === 'topic') {
      setMcqAudioSelectionStep('subject');
      setMcqAudioSelectedSubject('');
      setMcqAudioSelectedTopic('');
      setMcqAudioAvailableTopics([]);
      setFilteredQuestions([]);
    }
  };
  
  // Select question for a slot
  const selectQuestion = (question: Question) => {
    if (selectedSlot === null) return;
    
    const newSlots = [...questionSlots];
    newSlots[selectedSlot].question = question;
    setQuestionSlots(newSlots);
    
    setIsFilterDialogOpen(false);
    setSelectedSlot(null);
    setFilters({ subject: '', topic: '', subtopic: '', class: '', difficulty: '' });
    
    // Reset video selection states
    setVideoSelectionStep('subject');
    setSelectedSubject('');
    setSelectedTopic('');
    setAvailableSubjects([]);
    setAvailableTopics([]);
    setVideoQuestionSets([]);
    
    // Reset MCQ/Audio selection states
    setMcqAudioSelectionStep('subject');
    setMcqAudioSelectedSubject('');
    setMcqAudioSelectedTopic('');
    setMcqAudioAvailableSubjects([]);
    setMcqAudioAvailableTopics([]);
    setCurrentQuestionType(null);
    
    toast({
      title: "Question Selected",
      description: `Question assigned to slot ${selectedSlot + 1}`
    });
  };

  // Create or update quiz
  const handleCreateQuiz = async () => {
    // Check if teacherId is set
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Creating/Updating quiz with teacherId:', teacherId);
    
    // For update mode, allow partial slots to be filled
    // For create mode, all slots must be filled
    const filledSlots = questionSlots.filter(slot => slot.question);
    const unfilledSlots = questionSlots.filter(slot => !slot.question);
    
    if (!isUpdateMode && unfilledSlots.length > 0) {
      toast({
        title: "Error",
        description: `Please fill all question slots. ${unfilledSlots.length} slots remaining.`,
        variant: "destructive"
      });
      return;
    }
    
    // In update mode, warn but allow submission with only filled slots
    if (isUpdateMode && unfilledSlots.length > 0) {
      console.log(`Update mode: ${filledSlots.length} slots filled, ${unfilledSlots.length} slots empty`);
    }
    
    try {
      // Process questions - for video questions, use parent ID
      const questionIds = filledSlots.map(slot => {
        const q = slot.question!;
        // For video questions from hierarchical selection, use parent video ID
        if (slot.type === 'video' && q.parentVideoId) {
          return q.parentVideoId;
        }
        return q._id;
      });
      
      // Store question metadata for video questions (to know which specific question was selected)
      const videoQuestionMetadata = filledSlots
        .filter(slot => slot.type === 'video' && slot.question?.parentVideoId)
        .map(slot => ({
          slotIndex: slot.index,
          parentVideoId: slot.question!.parentVideoId,
          questionIndex: slot.question!.questionIndex,
          questionText: slot.question!.question
        }));
      
      const quizData = {
        quizId: config.quizId,
        teacherId,
        questions: questionIds,
        videoQuestionMetadata, // Include metadata for video questions
        timeLimit: config.timeLimit,
        totalQuestions: questionIds.length, // Use actual filled count
        questionTypes: {
          mcq: filledSlots.filter(s => s.type === 'mcq').length,
          audio: filledSlots.filter(s => s.type === 'audio').length,
          video: filledSlots.filter(s => s.type === 'video').length,
          puzzle: filledSlots.filter(s => s.type === 'puzzle').length
        },
        startTime: config.startTime, // Send as ISO string, backend will parse
        endTime: config.endTime
      };
      
      console.log('Quiz data being sent:', quizData);
      console.log('Video question metadata:', videoQuestionMetadata);
      
      if (isUpdateMode && quizToUpdate) {
        await axios.put(`${API_URL}/quizzes/update/${quizToUpdate}`, quizData);
        toast({
          title: "Quiz Updated",
          description: `Quiz "${config.quizId}" has been updated successfully`
        });
      } else {
        await axios.post(`${API_URL}/quizzes/create`, quizData);
        toast({
          title: "Quiz Created",
          description: `Quiz "${config.quizId}" created with ${config.totalQuestions} questions`
        });
      }
      
      // Reset form
      setConfig({
        quizId: '',
        timeLimit: 60,
        totalQuestions: 0,
        mcqCount: 0,
        audioCount: 0,
        videoCount: 0,
        puzzleCount: 0,
        startTime: '',
        endTime: ''
      });
      setQuestionSlots([]);
      setShowQuestionPalette(false);
      setIsUpdateMode(false);
      setQuizToUpdate('');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create quiz",
        variant: "destructive"
      });
    }
  };

  // Load existing quiz for update
  const loadQuizForUpdate = async () => {
    if (!quizToUpdate.trim()) {
      toast({ title: "Error", description: "Please enter a quiz ID", variant: "destructive" });
      return;
    }
    
    try {
      console.log('Loading quiz with ID:', quizToUpdate);
      const response = await axios.get(`${API_URL}/quizzes/by-id/${quizToUpdate}`);
      const quiz = response.data;
      
      console.log('Quiz loaded:', quiz);
      console.log('Questions in quiz:', quiz.questions);
      console.log('Question types:', quiz.questionTypes);
      
      // Format dates for datetime-local input
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      setConfig({
        quizId: quiz.quizId,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.totalQuestions,
        mcqCount: quiz.questionTypes.mcq,
        audioCount: quiz.questionTypes.audio,
        videoCount: quiz.questionTypes.video,
        puzzleCount: quiz.questionTypes.puzzle,
        startTime: formatDateForInput(quiz.startTime),
        endTime: formatDateForInput(quiz.endTime)
      });
      
      // Initialize slots based on question types
      const slots: QuestionSlot[] = [];
      let slotIndex = 0;
      
      // Add MCQ slots
      for (let i = 0; i < quiz.questionTypes.mcq; i++) {
        slots.push({ index: slotIndex++, type: 'mcq', question: null });
      }
      
      // Add Audio slots
      for (let i = 0; i < quiz.questionTypes.audio; i++) {
        slots.push({ index: slotIndex++, type: 'audio', question: null });
      }
      
      // Add Video slots
      for (let i = 0; i < quiz.questionTypes.video; i++) {
        slots.push({ index: slotIndex++, type: 'video', question: null });
      }
      
      // Add Puzzle slots
      for (let i = 0; i < quiz.questionTypes.puzzle; i++) {
        slots.push({ index: slotIndex++, type: 'puzzle', question: null });
      }
      
      console.log('Created slots:', slots);
      
      // Load existing questions into slots
      if (quiz.questions && quiz.questions.length > 0) {
        console.log('Loading questions into slots...');
        const loadedSlots = await Promise.all(
          slots.map(async (slot) => {
            const questionId = quiz.questions[slot.index];
            console.log(`Slot ${slot.index} (${slot.type}): Loading question ${questionId}`);
            
            if (!questionId) {
              console.log(`Slot ${slot.index}: No question ID`);
              return slot;
            }
            
            let endpoint = '';
            switch (slot.type) {
              case 'mcq':
                endpoint = `${API_URL}/questions/${questionId}`;
                break;
              case 'audio':
                endpoint = `${API_URL}/audio-questions/question/${questionId}`;
                break;
              case 'video':
                endpoint = `${API_URL}/video-questions/single/${questionId}`;
                break;
              case 'puzzle':
                endpoint = `${API_URL}/puzzles/single/${questionId}`;
                break;
            }

            console.log(`Fetching from: ${endpoint}`);
            
            try {
              const qResponse = await axios.get(endpoint);
              console.log(`Successfully loaded question ${questionId}:`, qResponse.data);
              return {
                ...slot,
                question: {
                  _id: questionId,
                  questionId: questionId,
                  type: slot.type,
                  ...qResponse.data
                }
              };
            } catch (err: any) {
              console.error(`Error loading ${slot.type} question ${questionId}:`, err.response?.data || err.message);
              return slot;
            }
          })
        );
        
        console.log('All slots loaded:', loadedSlots);
        setQuestionSlots(loadedSlots);
      } else {
        console.log('No questions to load, using empty slots');
        setQuestionSlots(slots);
      }
      
      setIsUpdateMode(true);
      setShowQuestionPalette(true); // Show question palette
      
      toast({
        title: "Quiz Loaded",
        description: `Loaded ${quiz.questions?.length || 0} existing questions. You can modify them now.`
      });
      
    } catch (error: any) {
      console.error('Error loading quiz:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Quiz not found or failed to load",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mcq': return 'bg-blue-500';
      case 'audio': return 'bg-green-500';
      case 'video': return 'bg-purple-500';
      case 'puzzle': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq': return 'MCQ';
      case 'audio': return 'Audio';
      case 'video': return 'Video';
      case 'puzzle': return 'Puzzle';
      default: return type;
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Create Quiz</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Input
            placeholder="Enter Quiz ID to Update"
            value={quizToUpdate}
            onChange={(e) => setQuizToUpdate(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={loadQuizForUpdate} variant="outline" className="w-full sm:w-auto">
            <Edit className="mr-2 h-4 w-4" />
            Load Quiz
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quizId">Quiz ID *</Label>
                <Input
                  id="quizId"
                  value={config.quizId}
                  onChange={(e) => setConfig({ ...config, quizId: e.target.value })}
                  placeholder="e.g., QUIZ001"
                  disabled={showQuestionPalette && !isUpdateMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (min) *</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={config.timeLimit}
                  onChange={(e) => setConfig({ ...config, timeLimit: parseInt(e.target.value) || 0 })}
                  disabled={showQuestionPalette && !isUpdateMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mcqCount">MCQ Questions</Label>
                <Input
                  id="mcqCount"
                  type="number"
                  value={config.mcqCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setConfig(prev => ({
                      ...prev,
                      mcqCount: value,
                      totalQuestions: value + prev.audioCount + prev.videoCount + prev.puzzleCount
                    }));
                  }}
                  disabled={showQuestionPalette && !isUpdateMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioCount">Audio Questions</Label>
                <Input
                  id="audioCount"
                  type="number"
                  value={config.audioCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setConfig(prev => ({
                      ...prev,
                      audioCount: value,
                      totalQuestions: prev.mcqCount + value + prev.videoCount + prev.puzzleCount
                    }));
                  }}
                  disabled={showQuestionPalette && !isUpdateMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoCount">Video Questions</Label>
                <Input
                  id="videoCount"
                  type="number"
                  value={config.videoCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setConfig(prev => ({
                      ...prev,
                      videoCount: value,
                      totalQuestions: prev.mcqCount + prev.audioCount + value + prev.puzzleCount
                    }));
                  }}
                  disabled={showQuestionPalette && !isUpdateMode}
                />
                <p className="text-sm text-gray-500">Each video contains multiple questions</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="puzzleCount">Puzzle Questions</Label>
                <Input
                  id="puzzleCount"
                  type="number"
                  value={config.puzzleCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setConfig(prev => ({
                      ...prev,
                      puzzleCount: value,
                      totalQuestions: prev.mcqCount + prev.audioCount + prev.videoCount + value
                    }));
                  }}
                  disabled={showQuestionPalette && !isUpdateMode}
                />
              </div>

              <div className="space-y-2">
                <Label>Total Questions</Label>
                <Input value={config.totalQuestions} disabled className="bg-gray-100 font-bold" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">
                  <Calendar className="inline mr-2 h-4 w-4" />
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={config.startTime}
                  onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">
                  <Clock className="inline mr-2 h-4 w-4" />
                  End Time (Auto)
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={config.endTime}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {!showQuestionPalette && (
                <Button onClick={handleConfigSubmit} className="w-full" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Continue to Question Selection
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Question Palette */}
        {showQuestionPalette && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Question Selection</CardTitle>
                <div className="text-sm text-gray-600">
                  Click on a question slot to select a question
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 mb-6">
                  {questionSlots.map((slot) => (
                    <Button
                      key={slot.index}
                      variant={slot.question ? "default" : "outline"}
                      className={`relative h-auto py-2 px-1 sm:px-2 ${!slot.question ? 'border-2 border-dashed' : ''}`}
                      onClick={() => loadQuestionsForSlot(slot.index)}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{slot.index + 1}</span>
                        <Badge className={`mt-1 text-xs ${getTypeColor(slot.type)}`}>
                          {getTypeLabel(slot.type)}
                        </Badge>
                        {slot.question && (
                          <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleCreateQuiz} className="flex-1 w-full" size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdateMode ? 'Update Quiz' : 'Create Quiz'}
                  </Button>
                </div>
              </CardContent>
            </Card>

          {/* Question Filter Dialog */}
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>
                  Select Question for Slot {selectedSlot !== null ? selectedSlot + 1 : ''} 
                  {selectedSlot !== null && (
                    <Badge className={`ml-2 ${getTypeColor(questionSlots[selectedSlot].type)}`}>
                      {getTypeLabel(questionSlots[selectedSlot].type)}
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Puzzle Question Selection */}
                {selectedSlot !== null && questionSlots[selectedSlot].type === 'puzzle' ? (
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-orange-700">पहेली गेम चुनें</h3>
                    <p className="text-sm text-gray-600 mb-4">क्विज़ में जोड़ने के लिए एक पहेली गेम चुनें। छात्र क्विज़ के दौरान यह गेम खेलेंगे।</p>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredQuestions.map((puzzle: any) => (
                        <Card
                          key={puzzle._id}
                          className="cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition-all border-2"
                          onClick={() => selectQuestion(puzzle)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                puzzle.puzzleType === 'memory_match'
                                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                                  : 'bg-gradient-to-br from-cyan-500 to-teal-500'
                              }`}>
                                <span className="text-white text-xl font-bold">
                                  {puzzle.puzzleType === 'memory_match' ? 'MM' : 'MP'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-base sm:text-lg text-gray-900">{puzzle.puzzleTitle || puzzle.question}</h4>
                                  <Badge className="bg-orange-100 text-orange-700 text-xs">{puzzle.puzzleDuration}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{puzzle.puzzleDescription}</p>
                                
                                {/* Modes */}
                                {puzzle.puzzleModes && (
                                  <div className="flex flex-wrap gap-2">
                                    {puzzle.puzzleModes.map((mode: any) => (
                                      <div key={mode.id} className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs">
                                        <span className="font-medium text-gray-700">{mode.label}</span>
                                        {mode.pairs && <span className="text-gray-500 ml-1">({mode.pairs} जोड़ियाँ)</span>}
                                        {mode.images && <span className="text-gray-500 ml-1">({mode.images} चित्र)</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {filteredQuestions.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        कोई पहेली गेम उपलब्ध नहीं है।
                      </div>
                    )}
                  </div>
                ) : selectedSlot !== null && (questionSlots[selectedSlot].type === 'mcq' || questionSlots[selectedSlot].type === 'audio') ? (
                  <>
                    {/* Breadcrumb for MCQ/Audio */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span className="cursor-pointer hover:text-blue-600" onClick={() => {
                        if (mcqAudioSelectionStep !== 'subject') handleMcqAudioSelectionBack();
                      }}>
                        📚 Subject
                      </span>
                      {mcqAudioSelectionStep !== 'subject' && (
                        <>
                          <span>→</span>
                          <span className={`${mcqAudioSelectionStep === 'topic' ? 'font-bold text-blue-700' : 'cursor-pointer hover:text-blue-600'}`}
                                onClick={() => {
                                  if (mcqAudioSelectionStep === 'questions') handleMcqAudioSelectionBack();
                                }}>
                            📖 {mcqAudioSelectedSubject || 'Topic'}
                          </span>
                        </>
                      )}
                      {mcqAudioSelectionStep === 'questions' && (
                        <>
                          <span>→</span>
                          <span className="font-bold text-blue-700">📝 {mcqAudioSelectedTopic}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Step 1: Subject Selection for MCQ/Audio */}
                    {mcqAudioSelectionStep === 'subject' && (
                      <div className="space-y-3">
                        <h3 className="text-base sm:text-lg font-semibold text-blue-700">Select Subject</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mcqAudioAvailableSubjects.map((subject) => (
                            <Card 
                              key={subject}
                              className="cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
                              onClick={() => handleMcqAudioSubjectSelect(subject)}
                            >
                              <CardContent className="p-6 text-center">
                                <div className="text-2xl mb-2">📚</div>
                                <div className="font-bold text-lg">{subject}</div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: Topic Selection for MCQ/Audio */}
                    {mcqAudioSelectionStep === 'topic' && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-blue-700">Select Topic from {mcqAudioSelectedSubject}</h3>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleMcqAudioSelectionBack}>← Back</Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {mcqAudioAvailableTopics.map((topic) => (
                            <Card 
                              key={topic}
                              className="cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
                              onClick={() => handleMcqAudioTopicSelect(topic)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">📖</span>
                                  <span className="font-bold text-lg">{topic}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Step 3: Question Selection for MCQ/Audio */}
                    {mcqAudioSelectionStep === 'questions' && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-blue-700">
                            Select {questionSlots[selectedSlot].type.toUpperCase()} Question from {mcqAudioSelectedTopic}
                          </h3>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleMcqAudioSelectionBack}>← Back</Button>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {filteredQuestions.map((question) => (
                            <Card 
                              key={question._id}
                              className="cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
                              onClick={() => selectQuestion(question)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    {/* Question Text */}
                                    <div className="font-medium text-gray-900 mb-2">
                                      {question.question || 'No question text'}
                                    </div>
                                    
                                    {/* Audio for audio questions */}
                                    {question.type === 'audio' && question.audio && (
                                      <div className="mb-2">
                                        <audio controls className="w-full">
                                          <source src={question.audio} type="audio/mpeg" />
                                          <source src={question.audio} type="audio/mp3" />
                                          Your browser does not support audio playback.
                                        </audio>
                                      </div>
                                    )}
                                    
                                    {/* Options */}
                                    {question.options && question.options.length > 0 && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-2">
                                        {question.options.map((opt, optIdx) => (
                                          <div
                                            key={optIdx} 
                                            className={`text-sm px-3 py-2 rounded-md flex items-center gap-2 ${
                                              opt === question.correctAnswer 
                                                ? 'bg-green-100 text-green-900 font-semibold border-2 border-green-400' 
                                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                                            }`}
                                          >
                                            <span className="font-bold bg-white px-2 py-0.5 rounded">
                                              {String.fromCharCode(65 + optIdx)}
                                            </span>
                                            <span>{opt}</span>
                                            {opt === question.correctAnswer && (
                                              <span className="ml-auto text-green-700">✓</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Hint */}
                                    {question.hint && (question.hint as any).text && (
                                      <div className="mt-2 p-2 bg-amber-50 border-l-3 border-amber-400 rounded">
                                        <p className="text-xs text-amber-900">
                                          <span className="font-semibold">💡 Hint:</span> {(question.hint as any).text}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : selectedSlot !== null && questionSlots[selectedSlot].type === 'video' ? (
                  <>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span className="cursor-pointer hover:text-purple-600" onClick={() => {
                        if (videoSelectionStep !== 'subject') handleVideoSelectionBack();
                      }}>
                        📚 Subject
                      </span>
                      {videoSelectionStep !== 'subject' && (
                        <>
                          <span>→</span>
                          <span className={`${videoSelectionStep === 'topic' ? 'font-bold text-purple-700' : 'cursor-pointer hover:text-purple-600'}`}
                                onClick={() => {
                                  if (videoSelectionStep === 'questions') handleVideoSelectionBack();
                                }}>
                            📖 {selectedSubject || 'Topic'}
                          </span>
                        </>
                      )}
                      {videoSelectionStep === 'questions' && (
                        <>
                          <span>→</span>
                          <span className="font-bold text-purple-700">📝 {selectedTopic}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Step 1: Subject Selection */}
                    {videoSelectionStep === 'subject' && (
                      <div className="space-y-3">
                        <h3 className="text-base sm:text-lg font-semibold text-purple-700">Select Subject</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableSubjects.map((subject) => (
                            <Card 
                              key={subject}
                              className="cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all"
                              onClick={() => handleSubjectSelect(subject)}
                            >
                              <CardContent className="p-6 text-center">
                                <div className="text-2xl mb-2">📚</div>
                                <div className="font-bold text-lg">{subject}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {videoQuestionSets.filter((vq: any) => vq.subject === subject).length} topics
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: Topic Selection */}
                    {videoSelectionStep === 'topic' && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-purple-700">Select Topic from {selectedSubject}</h3>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleVideoSelectionBack}>← Back</Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {availableTopics.map((topic) => {
                            const videoSet = videoQuestionSets.find(
                              (vq: any) => vq.subject === selectedSubject && vq.topic === topic
                            );
                            return (
                              <Card 
                                key={topic}
                                className="cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all"
                                onClick={() => handleTopicSelect(topic)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">📖</span>
                                        <span className="font-bold text-lg">{topic}</span>
                                      </div>
                                      {videoSet?.videoTitle && (
                                        <div className="text-sm text-gray-600">📹 {videoSet.videoTitle}</div>
                                      )}
                                      {videoSet?.videoDuration && (
                                        <div className="text-xs text-gray-500">⏱️ {videoSet.videoDuration}</div>
                                      )}
                                    </div>
                                    <div className="text-left sm:text-right">
                                      <Badge className="bg-purple-500 text-white text-lg px-3 py-1">
                                        {videoSet?.questions?.length || 0} Questions
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Step 3: Individual Question Selection */}
                    {videoSelectionStep === 'questions' && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-purple-700">
                            Select Question from {selectedTopic}
                          </h3>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleVideoSelectionBack}>← Back to Topics</Button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {filteredQuestions.map((question, qIdx) => (
                            <Card 
                              key={question._id}
                              className="cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all"
                              onClick={() => selectQuestion(question)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 font-bold px-3 py-1 text-base">
                                    Q{qIdx + 1}
                                  </Badge>
                                  <div className="flex-1">
                                    <p className="font-medium text-base mb-3 text-gray-800 leading-relaxed">
                                      {question.question}
                                    </p>
                                    
                                    {/* Options */}
                                    {question.options && question.options.length > 0 && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                        {question.options.map((opt: string, optIdx: number) => (
                                          <div 
                                            key={optIdx} 
                                            className={`text-sm px-3 py-2 rounded-md flex items-center gap-2 ${
                                              opt === question.correctAnswer 
                                                ? 'bg-green-100 text-green-900 font-semibold border-2 border-green-400' 
                                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                                            }`}
                                          >
                                            <span className="font-bold bg-white px-2 py-0.5 rounded">
                                              {String.fromCharCode(65 + optIdx)}
                                            </span>
                                            <span>{opt}</span>
                                            {opt === question.correctAnswer && (
                                              <span className="ml-auto text-green-700">✓</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Hint */}
                                    {question.hint && (question.hint as any).text && (
                                      <div className="mt-2 p-2 bg-amber-50 border-l-3 border-amber-400 rounded">
                                        <p className="text-xs text-amber-900">
                                          <span className="font-semibold">💡 Hint:</span> {(question.hint as any).text}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Regular Filters for MCQ, Audio, Puzzle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                      <Input
                        placeholder="Subject"
                        value={filters.subject}
                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                      />
                      <Input
                        placeholder="Topic"
                        value={filters.topic}
                        onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                      />
                      <Input
                        placeholder="Subtopic"
                        value={filters.subtopic}
                        onChange={(e) => setFilters({ ...filters, subtopic: e.target.value })}
                      />
                      <Input
                        placeholder="Class"
                        value={filters.class}
                        onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                      />
                      <Button onClick={applyFilters}>Apply Filters</Button>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredQuestions.map((question) => {
                        // Determine question type and render accordingly
                        const isVideoQuestion = question.type === 'video' || question.videoUrl;
                        const isAudioQuestion = question.type === 'audio' || question.audio;
                        
                        return (
                          <Card 
                            key={question._id} 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => selectQuestion(question)}
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                <div className="flex-1">
                                  {/* Audio Question Display */}
                                  {isAudioQuestion && (
                                <>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-purple-500 text-white">📹 Video Set</Badge>
                                    <p className="font-bold text-lg">{question.videoTitle || 'Video Question Set'}</p>
                                  </div>
                                  
                                  {/* Video Preview */}
                                  {question.videoUrl && (
                                    <div className="mb-3">
                                      {isYouTubeUrl(question.videoUrl) ? (
                                        <div className="relative w-full rounded-lg overflow-hidden mb-3" style={{ paddingBottom: '56.25%' }}>
                                          <iframe
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                            src={getYouTubeEmbedUrl(question.videoUrl)}
                                            title={question.videoTitle || 'Video Question'}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      ) : (
                                        <video controls className="w-full rounded-lg mb-3">
                                          <source src={question.videoUrl} type="video/mp4" />
                                          Your browser does not support the video tag.
                                        </video>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Video Metadata */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="text-sm">
                                      <span className="font-semibold text-purple-700">Duration:</span> 
                                      <span className="ml-1">{question.videoDuration || 'N/A'}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold text-purple-700">Total Questions:</span> 
                                      <span className="ml-1 font-bold text-purple-900">{question.questions?.length || 0}</span>
                                    </div>
                                  </div>
                                  
                                  {question.videoDescription && (
                                    <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                      <p className="text-sm text-gray-700 italic">
                                        📝 {question.videoDescription}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* All Questions in this Video Set */}
                                  {question.questions && question.questions.length > 0 && (
                                    <div className="mt-4 border-2 border-purple-300 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-white">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                        <p className="text-sm font-bold text-purple-800 flex items-center gap-2">
                                          <span className="bg-purple-200 px-2 py-1 rounded">
                                            📚 All {question.questions.length} Questions in this Video
                                          </span>
                                        </p>
                                      </div>
                                      
                                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                        {question.questions.map((q: any, idx: number) => (
                                          <div 
                                            key={idx} 
                                            className="border-l-4 border-purple-500 pl-4 py-3 bg-white rounded-r-lg shadow-sm hover:shadow-md transition-shadow"
                                          >
                                            <div className="flex items-start gap-3">
                                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 font-bold px-3 py-1">
                                                Q{idx + 1}
                                              </Badge>
                                              <div className="flex-1">
                                                <p className="font-medium text-sm mb-2 text-gray-800 leading-relaxed">
                                                  {q.question}
                                                </p>
                                                
                                                {/* Options */}
                                                {q.options && q.options.length > 0 && (
                                                  <div className="grid grid-cols-1 gap-2 mt-3">
                                                    {q.options.map((opt: string, optIdx: number) => (
                                                      <div 
                                                        key={optIdx} 
                                                        className={`text-xs px-3 py-2 rounded-md flex items-center gap-2 ${
                                                          opt === q.correctAnswer 
                                                            ? 'bg-green-100 text-green-900 font-semibold border-2 border-green-400' 
                                                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                                                        }`}
                                                      >
                                                        <span className="font-bold bg-white px-2 py-0.5 rounded">
                                                          {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        <span>{opt}</span>
                                                        {opt === q.correctAnswer && (
                                                          <span className="ml-auto text-green-700">✓ Correct</span>
                                                        )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                                
                                                {/* Hint if available */}
                                                {q.hint && q.hint.text && (
                                                  <div className="mt-3 p-2 bg-amber-50 border-l-3 border-amber-400 rounded">
                                                    <p className="text-xs text-amber-900">
                                                      <span className="font-semibold">💡 Hint:</span> {q.hint.text}
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg">
                                    <p className="text-sm text-yellow-900 flex items-start gap-2">
                                      <span className="font-bold text-lg">⚠️</span>
                                      <span>
                                        <span className="font-semibold">Important:</span> Selecting this video will include 
                                        <span className="font-bold text-yellow-900"> all {question.questions?.length || 0} questions</span> in your quiz.
                                        Students will watch the video first, then answer these questions.
                                      </span>
                                    </p>
                                  </div>
                                </>
                              )}
                              
                              {/* Audio Question Display */}
                              {isAudioQuestion && !isVideoQuestion && (
                                <>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-green-500">Audio</Badge>
                                  </div>
                                  <p className="font-medium">{question.question || 'Audio Question'}</p>
                                  {question.audio && (
                                    <div className="text-xs text-green-600 mb-2 flex items-center gap-1">
                                      🔊 Audio file attached
                                    </div>
                                  )}
                                  {question.questionImage && (
                                    <img src={question.questionImage} alt="Question" className="mt-2 w-full sm:max-w-xs rounded" />
                                  )}
                                  {question.options && question.options.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {question.options.map((opt: string, i: number) => (
                                        <div key={i} className="text-sm text-gray-600">
                                          {String.fromCharCode(65 + i)}. {opt}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                              
                                  {/* MCQ/Regular Question Display */}
                                  {!isVideoQuestion && !isAudioQuestion && (
                                <>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-blue-500">MCQ</Badge>
                                  </div>
                                  <p className="font-medium">{question.question || 'No question text'}</p>
                                  {question.questionImage && (
                                    <img src={question.questionImage} alt="Question" className="mt-2 w-full sm:max-w-xs rounded" />
                                  )}
                                  {question.options && question.options.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {question.options.map((opt: string, i: number) => (
                                        <div key={i} className="text-sm text-gray-600">
                                          {String.fromCharCode(65 + i)}. {opt}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                    </>
                                  )}
                                </div>
                                <div className="sm:ml-4 text-left sm:text-right text-sm text-gray-500">
                                  <div>Subject: {question.subject || 'N/A'}</div>
                                  <div>Topic: {question.topic || 'N/A'}</div>
                                  <div>Class: {question.class || 'N/A'}</div>
                                  {question.subtopic && <div>Subtopic: {question.subtopic}</div>}
                                  {question.difficulty && <div>Difficulty: {question.difficulty}</div>}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      
                      {filteredQuestions.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          No questions found. Try adjusting your filters.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
