import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import TagSelect from '@/components/TagSelect';
import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, FolderOpen, Languages, Loader2, Plus, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const LETTERS = ['A', 'B', 'C', 'D'];

type SlotType = 'mcq' | 'audio' | 'video' | 'puzzle';
type CountField = 'timeLimit' | 'mcqCount' | 'audioCount' | 'videoCount' | 'puzzleCount';
type ApiRecord = Record<string, unknown>;
type McqStep = 'class' | 'subject' | 'topic' | 'questions';

interface QuestionChoice {
  _id: string;
  question: string;
  questionHindi?: string;
  subject?: string;
  class?: string;
  topic?: string;
  type: SlotType | 'custom';
  options?: string[];
  optionsHindi?: string[];
  correctAnswer?: string;
  parentVideoId?: string;
  questionIndex?: number;
}

interface QuestionSlot {
  index: number;
  type: SlotType;
  question: QuestionChoice | null;
}

const unwrapTeacher = (raw: string | null) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.teacher || parsed;
  } catch {
    return null;
  }
};

const resolveTeacherId = () => {
  const fromCookie = unwrapTeacher(Cookies.get('teacher') || null);
  const fromTeacherStorage = unwrapTeacher(localStorage.getItem('teacher'));
  const fromCurrentUser = unwrapTeacher(localStorage.getItem('currentUser'));
  const teacher = fromCookie || fromTeacherStorage || fromCurrentUser;
  return teacher?.teacherId || teacher?._id || '';
};

const resolveTeacherSession = () => {
  const fromCookie = unwrapTeacher(Cookies.get('teacher') || null);
  const fromTeacherStorage = unwrapTeacher(localStorage.getItem('teacher'));
  const fromCurrentUser = unwrapTeacher(localStorage.getItem('currentUser'));
  return fromCookie || fromTeacherStorage || fromCurrentUser;
};

const asString = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;

const cleanText = (value: unknown) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text && text.toUpperCase() !== 'NA' ? text : '';
};

const asRecordArray = (value: unknown): ApiRecord[] => Array.isArray(value)
  ? value.filter((item): item is ApiRecord => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
  : [];

const sortLabels = (values: string[]) =>
  values
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }));

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const emptyCustom = {
  subject: '',
  class: '',
  topic: '',
  question: '',
  questionHindi: '',
  options: ['', '', '', ''],
  optionsHindi: ['', '', '', ''],
  correctIndex: -1,
  hintText: '',
};

const CreateQuizNewFixed: React.FC = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'hi');
  const [config, setConfig] = useState({
    quizId: '',
    timeLimit: 60,
    mcqCount: 0,
    audioCount: 0,
    videoCount: 0,
    puzzleCount: 0,
    startTime: '',
    endTime: '',
  });
  const [slots, setSlots] = useState<QuestionSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [choices, setChoices] = useState<QuestionChoice[]>([]);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingChoices, setLoadingChoices] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customDraft, setCustomDraft] = useState(emptyCustom);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // MCQ tree-picker state (Subject -> Topic -> Questions).
  const [mcqStep, setMcqStep] = useState<McqStep>('class');
  const [mcqRecords, setMcqRecords] = useState<ApiRecord[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [customTopics, setCustomTopics] = useState<string[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<ApiRecord[]>([]);
  const [audienceType, setAudienceType] = useState<'global' | 'classes'>('global');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const isHindi = language === 'hi';
  const getPrimaryText = (english?: unknown, hindi?: unknown, fallback = '') =>
    isHindi ? cleanText(hindi) || cleanText(english) || fallback : cleanText(english) || cleanText(hindi) || fallback;
  const getSecondaryText = (english?: unknown, hindi?: unknown) =>
    isHindi ? cleanText(english) : cleanText(hindi);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLanguage(detail?.language || localStorage.getItem('appLanguage') || 'hi');
    };
    window.addEventListener('appLanguageChanged', handleLanguageChange);
    return () => window.removeEventListener('appLanguageChanged', handleLanguageChange);
  }, []);

  const toggleLanguage = () => {
    const nextLanguage = isHindi ? 'en' : 'hi';
    setLanguage(nextLanguage);
    localStorage.setItem('appLanguage', nextLanguage);
    window.dispatchEvent(new CustomEvent('appLanguageChanged', { detail: { language: nextLanguage } }));
  };

  const renderChoiceText = (choice: Pick<QuestionChoice, 'question' | 'questionHindi'> | null | undefined, fallback = 'Select question') => {
    const primary = getPrimaryText(choice?.question, choice?.questionHindi, fallback);
    const secondary = getSecondaryText(choice?.question, choice?.questionHindi);
    return (
      <>
        <span className="block">{primary}</span>
        {secondary && secondary !== primary && (
          <span className="mt-1 block text-xs font-normal text-muted-foreground">{secondary}</span>
        )}
      </>
    );
  };

  // Class -> Subject -> Topic options for the inline custom-question form.
  useEffect(() => {
    const className = customDraft.class?.trim();
    if (!className) {
      setCustomSubjects([]);
      setCustomTopics([]);
      return;
    }
    setCustomSubjects(sortLabels([
      ...new Set(
        mcqRecords
          .filter((q) => asString(q.class, 'Unassigned') === className)
          .map((q) => asString(q.subject))
      ),
    ]));
  }, [customDraft.class, mcqRecords]);

  useEffect(() => {
    const className = customDraft.class?.trim();
    const subject = customDraft.subject?.trim();
    if (!className || !subject) { setCustomTopics([]); return; }
    setCustomTopics(sortLabels([
      ...new Set(
        mcqRecords
          .filter((q) => asString(q.class, 'Unassigned') === className && asString(q.subject) === subject)
          .map((q) => asString(q.topic))
      ),
    ]));
  }, [customDraft.class, customDraft.subject, mcqRecords]);

  const totalQuestions = config.mcqCount + config.audioCount + config.videoCount + config.puzzleCount;

  useEffect(() => {
    const teacher = resolveTeacherSession();
    const teacherId = teacher?.teacherId || teacher?._id || '';
    if (!teacherId) return;
    axios.get(`${API_URL}/classes/teacher/${teacherId}`)
      .then((response) => setTeacherClasses(asRecordArray(response.data)))
      .catch((error) => console.error('Could not load teacher classes:', error));
  }, []);

  const updateCount = (field: CountField, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: Math.max(0, value || 0) }));
  };

  const generateSlots = () => {
    if (!config.quizId.trim() || !config.startTime || !config.endTime || totalQuestions <= 0) {
      toast({ title: 'Missing details', description: 'Quiz ID, timing, and at least one question are required.', variant: 'destructive' });
      return;
    }

    const next: QuestionSlot[] = [];
    const pushSlots = (type: SlotType, count: number) => {
      for (let i = 0; i < count; i += 1) {
        next.push({ index: next.length, type, question: null });
      }
    };

    pushSlots('mcq', config.mcqCount);
    pushSlots('audio', config.audioCount);
    pushSlots('video', config.videoCount);
    pushSlots('puzzle', config.puzzleCount);
    setSlots(next);
  };

  const mapMcq = (question: ApiRecord): QuestionChoice => ({
    _id: asString(question._id),
    question: asString(question.question, 'MCQ question'),
    questionHindi: asString(question.questionHindi),
    subject: asString(question.subject),
    class: asString(question.class),
    topic: asString(question.topic),
    type: 'mcq',
    options: Array.isArray(question.options) ? question.options.map(String) : [],
    optionsHindi: Array.isArray(question.optionsHindi) ? question.optionsHindi.map(String) : [],
    correctAnswer: asString(question.correctAnswer),
  });

  const openSlot = async (slotIndex: number) => {
    const slot = slots[slotIndex];
    setSelectedSlot(slotIndex);
    setQuery('');
    setChoices([]);
    setShowCustomForm(false);
    setDialogOpen(true);

    if (slot.type === 'mcq') {
      // Enter the Class -> Subject -> Topic -> Question tree.
      setMcqStep('class');
      setSelectedClassName('');
      setSelectedSubject('');
      setSelectedTopic('');
      setSubjects([]);
      setTopics([]);
      setLoadingChoices(true);
      try {
        const response = await axios.get(`${API_URL}/questions`);
        const records = asRecordArray(response.data);
        setMcqRecords(records);
        setClasses(sortLabels([...new Set(records.map((q) => asString(q.class, 'Unassigned')))]));
      } catch (error: unknown) {
        toast({ title: 'Could not load classes', description: getErrorMessage(error, 'Try again'), variant: 'destructive' });
      } finally {
        setLoadingChoices(false);
      }
      return;
    }

    // Audio / video / puzzle keep the flat searchable list.
    setLoadingChoices(true);
    try {
      let mapped: QuestionChoice[] = [];
      if (slot.type === 'audio') {
        const response = await axios.get(`${API_URL}/audio-questions/`);
        mapped = asRecordArray(response.data).map((question) => ({
          _id: asString(question._id),
          question: asString(question.question) || asString(question.title, 'Audio question'),
          questionHindi: asString(question.questionHindi),
          subject: asString(question.subject),
          class: asString(question.class),
          topic: asString(question.topic),
          type: 'audio',
          options: Array.isArray(question.options) ? question.options.map(String) : [],
          optionsHindi: Array.isArray(question.optionsHindi) ? question.optionsHindi.map(String) : [],
          correctAnswer: asString(question.correctAnswer),
        }));
      } else if (slot.type === 'video') {
        const response = await axios.get(`${API_URL}/video-questions/`);
        mapped = asRecordArray(response.data).flatMap((video) => {
          const videoQuestions = asRecordArray(video.questions);
          if (videoQuestions.length) {
            return videoQuestions.map((question, index) => ({
              _id: `${asString(video._id)}_q${index}`,
              parentVideoId: asString(video._id),
              questionIndex: index,
              question: asString(question.question) || asString(video.videoTitle, 'Video question'),
              questionHindi: asString(question.questionHindi),
              subject: asString(video.subject),
              class: asString(video.class),
              topic: asString(video.topic),
              type: 'video' as SlotType,
              options: Array.isArray(question.options) ? question.options.map(String) : [],
              optionsHindi: Array.isArray(question.optionsHindi) ? question.optionsHindi.map(String) : [],
              correctAnswer: asString(question.correctAnswer),
            }));
          }
          return [{
            _id: asString(video._id),
            parentVideoId: asString(video._id),
            question: asString(video.videoTitle, 'Video question'),
            subject: asString(video.subject),
            class: asString(video.class),
            topic: asString(video.topic),
            type: 'video' as SlotType,
          }];
        });
      } else if (slot.type === 'puzzle') {
        const response = await axios.get(`${API_URL}/puzzles/`);
        mapped = asRecordArray(response.data).map((puzzle) => ({
          _id: asString(puzzle._id),
          question: asString(puzzle.title, 'Puzzle'),
          subject: asString(puzzle.subject, 'Puzzle'),
          class: asString(puzzle.class, 'All'),
          topic: asString(puzzle.topic, 'Puzzle'),
          type: 'puzzle',
        }));
      }
      setChoices(mapped);
    } catch (error: unknown) {
      toast({ title: 'Could not load questions', description: getErrorMessage(error, 'Try again'), variant: 'destructive' });
    } finally {
      setLoadingChoices(false);
    }
  };

  const handleClassSelect = (className: string) => {
    setSelectedClassName(className);
    setSelectedSubject('');
    setSelectedTopic('');
    setTopics([]);
    setSubjects(sortLabels([
      ...new Set(
        mcqRecords
          .filter((q) => asString(q.class, 'Unassigned') === className)
          .map((q) => asString(q.subject))
      ),
    ]));
    setMcqStep('subject');
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedTopic('');
    setMcqStep('topic');
    setTopics(sortLabels([
      ...new Set(
        mcqRecords
          .filter((q) => asString(q.class, 'Unassigned') === selectedClassName && asString(q.subject) === subject)
          .map((q) => asString(q.topic))
      ),
    ]));
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setMcqStep('questions');
    setQuery('');
    setChoices(
      mcqRecords
        .filter((q) =>
          asString(q.class, 'Unassigned') === selectedClassName &&
          asString(q.subject) === selectedSubject &&
          asString(q.topic) === topic
        )
        .map(mapMcq)
    );
  };

  const mcqBack = () => {
    if (showCustomForm) { setShowCustomForm(false); return; }
    if (mcqStep === 'questions') { setMcqStep('topic'); setChoices([]); return; }
    if (mcqStep === 'topic') { setMcqStep('subject'); setSelectedSubject(''); setTopics([]); return; }
    if (mcqStep === 'subject') { setMcqStep('class'); setSelectedClassName(''); setSubjects([]); return; }
  };

  const openCustomForm = () => {
    // Prefill from the current tree position so the new question lands in the
    // subject/topic the teacher is browsing.
    setCustomDraft({ ...emptyCustom, class: selectedClassName, subject: selectedSubject, topic: selectedTopic });
    setShowCustomForm(true);
  };

  const selectChoice = (choice: QuestionChoice) => {
    if (selectedSlot === null) return;
    setSlots((prev) => prev.map((slot, index) => index === selectedSlot ? { ...slot, question: choice } : slot));
    setDialogOpen(false);
  };

  const saveCustomQuestion = async () => {
    if (selectedSlot === null) return;
    const options = customDraft.options.map((o) => o.trim());
    if (!customDraft.subject || !customDraft.topic || !customDraft.question) {
      toast({ title: 'Missing details', description: 'Subject, topic and question are required.', variant: 'destructive' });
      return;
    }
    if (options.some((o) => !o)) {
      toast({ title: 'Fill all options', description: 'Please fill options A–D.', variant: 'destructive' });
      return;
    }
    if (customDraft.correctIndex < 0) {
      toast({ title: 'Select the correct answer', description: 'Choose which option (A–D) is correct.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const response = await axios.post(`${API_URL}/questions`, {
        subject: customDraft.subject,
        class: customDraft.class,
        topic: customDraft.topic,
        question: customDraft.question,
        questionHindi: customDraft.questionHindi.trim() || 'NA',
        options,
        optionsHindi: customDraft.optionsHindi.map((o) => o.trim() || 'NA'),
        correctAnswer: options[customDraft.correctIndex], // option text (matches grading)
        hint: { text: customDraft.hintText },
      });
      selectChoice({ ...response.data, type: 'custom' });
      toast({ title: 'Custom question saved', description: 'It was added to the question bank and selected for this quiz.' });
    } catch (error: unknown) {
      toast({ title: 'Custom question failed', description: getErrorMessage(error, 'Check the fields and correct answer.'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filteredChoices = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return choices;
    return choices.filter((choice) =>
      [
        choice.question,
        choice.questionHindi,
        choice.subject,
        choice.topic,
        choice.class,
        ...(choice.options || []),
        ...(choice.optionsHindi || []),
      ].filter(Boolean).some((field) => String(field).toLowerCase().includes(value))
    );
  }, [choices, query]);

  const handleCreateQuiz = async () => {
    const teacherId = resolveTeacherId();
    if (!teacherId) {
      toast({ title: 'Teacher not found', description: 'Please login again.', variant: 'destructive' });
      return;
    }
    if (audienceType === 'classes' && selectedClassIds.length === 0) {
      toast({ title: 'Select classes', description: 'Choose at least one class or switch availability to Global.', variant: 'destructive' });
      return;
    }
    const missing = slots.filter((slot) => !slot.question);
    if (!slots.length || missing.length) {
      toast({ title: 'Incomplete quiz', description: `${missing.length || totalQuestions} slots still need questions.`, variant: 'destructive' });
      return;
    }

    const questionIds = slots.map((slot) => {
      if (slot.type === 'video' && slot.question?.parentVideoId) return slot.question.parentVideoId;
      return slot.question!._id;
    });

    const videoQuestionMetadata = slots
      .filter((slot) => slot.type === 'video' && slot.question?.parentVideoId)
      .map((slot) => ({
        slotIndex: slot.index,
        parentVideoId: slot.question!.parentVideoId,
        questionIndex: slot.question!.questionIndex,
        questionText: slot.question!.question,
      }));

    setSaving(true);
    try {
      await axios.post(`${API_URL}/quizzes/create`, {
        quizId: config.quizId.trim(),
        teacherId,
        questions: questionIds,
        videoQuestionMetadata,
        timeLimit: config.timeLimit,
        totalQuestions: questionIds.length,
        questionTypes: {
          mcq: slots.filter((slot) => slot.type === 'mcq').length,
          audio: slots.filter((slot) => slot.type === 'audio').length,
          video: slots.filter((slot) => slot.type === 'video').length,
          puzzle: slots.filter((slot) => slot.type === 'puzzle').length,
        },
        audience: {
          type: audienceType,
          classIds: audienceType === 'classes' ? selectedClassIds : [],
        },
        startTime: config.startTime,
        endTime: config.endTime,
      });
      toast({ title: 'Quiz created', description: `${config.quizId} was created successfully.` });
      setSlots([]);
      setConfig({ quizId: '', timeLimit: 60, mcqCount: 0, audioCount: 0, videoCount: 0, puzzleCount: 0, startTime: '', endTime: '' });
      setAudienceType('global');
      setSelectedClassIds([]);
    } catch (error: unknown) {
      toast({ title: 'Quiz creation failed', description: getErrorMessage(error, 'Could not create quiz.'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const selectedSlotType = selectedSlot !== null ? slots[selectedSlot]?.type : null;
  const isMcq = selectedSlotType === 'mcq';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-6 md:py-8">
        <div className="edu-container">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Advanced Quiz Creator</h1>
            <p className="mt-1 text-muted-foreground">Pick questions from the bank by subject &amp; topic, or add a custom one with the + button.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Configuration</CardTitle>
                <CardDescription>Custom questions you add are saved to the question bank.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Quiz ID</Label>
                  <Input value={config.quizId} onChange={(event) => setConfig((prev) => ({ ...prev, quizId: event.target.value }))} />
                </div>
                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input type="number" value={config.timeLimit} onChange={(event) => updateCount('timeLimit', Number(event.target.value))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>MCQ</Label><Input type="number" value={config.mcqCount} onChange={(event) => updateCount('mcqCount', Number(event.target.value))} /></div>
                  <div><Label>Audio</Label><Input type="number" value={config.audioCount} onChange={(event) => updateCount('audioCount', Number(event.target.value))} /></div>
                  <div><Label>Video</Label><Input type="number" value={config.videoCount} onChange={(event) => updateCount('videoCount', Number(event.target.value))} /></div>
                  <div><Label>Puzzle</Label><Input type="number" value={config.puzzleCount} onChange={(event) => updateCount('puzzleCount', Number(event.target.value))} /></div>
                  <div><Label>Total</Label><Input value={totalQuestions} disabled className="bg-gray-50 font-bold" /></div>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={config.startTime} onChange={(event) => setConfig((prev) => ({ ...prev, startTime: event.target.value }))} />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="datetime-local" value={config.endTime} onChange={(event) => setConfig((prev) => ({ ...prev, endTime: event.target.value }))} />
                </div>
                <div className="space-y-3 rounded-md border bg-white p-3">
                  <Label>Quiz Availability</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={audienceType === 'global' ? 'default' : 'outline'} onClick={() => setAudienceType('global')}>Global</Button>
                    <Button type="button" variant={audienceType === 'classes' ? 'default' : 'outline'} onClick={() => setAudienceType('classes')}>Select Class</Button>
                  </div>
                  {audienceType === 'classes' && (
                    <div className="max-h-44 space-y-2 overflow-y-auto rounded border bg-gray-50 p-2">
                      {teacherClasses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No classes found. Create classes first.</p>
                      ) : teacherClasses.map((classDoc) => {
                        const classId = asString(classDoc.classId);
                        const checked = selectedClassIds.includes(classId);
                        return (
                          <label key={classId} className="flex cursor-pointer items-center gap-2 rounded bg-white p-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                setSelectedClassIds((prev) => event.target.checked
                                  ? [...new Set([...prev, classId])]
                                  : prev.filter((id) => id !== classId));
                              }}
                            />
                            <span>Class {asString(classDoc.className)} - {asString(classDoc.subject)}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={generateSlots} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Slots
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Question Slots</CardTitle>
                <CardDescription>{slots.length ? `${slots.filter((slot) => slot.question).length}/${slots.length} selected` : 'Create slots from the configuration first.'}</CardDescription>
              </CardHeader>
              <CardContent>
                {slots.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-40" />
                    No slots yet
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {slots.map((slot) => (
                      <button key={slot.index} onClick={() => openSlot(slot.index)} className="rounded-lg border bg-white p-4 text-left hover:shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold uppercase text-blue-700">{slot.type}</span>
                          {slot.question ? <CheckCircle className="h-5 w-5 text-green-600" /> : null}
                        </div>
                        <p className="line-clamp-4 text-sm font-medium">{renderChoiceText(slot.question)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
              {slots.length > 0 && (
                <CardFooter>
                  <Button onClick={handleCreateQuiz} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Quiz
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3 pr-6">
              <DialogTitle>
                {showCustomForm
                  ? 'Add Custom Question'
                  : isMcq
                    ? 'Select MCQ Question'
                    : `Select ${selectedSlotType} Question`}
              </DialogTitle>
              <div className="flex flex-wrap justify-end gap-2">
                <Button size="sm" variant="outline" onClick={toggleLanguage}>
                  <Languages className="mr-1 h-4 w-4" /> {isHindi ? 'English' : 'हिंदी'}
                </Button>
                {isMcq && !showCustomForm && (
                  <Button size="sm" variant="outline" onClick={openCustomForm}>
                    <Plus className="mr-1 h-4 w-4" /> Add custom question
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Inline custom-question form (reachable via the + button on MCQ). */}
          {showCustomForm ? (
            <div className="space-y-3">
              <Button size="sm" variant="ghost" onClick={mcqBack} className="mb-1 h-8 px-2">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to questions
              </Button>
              <div className="grid gap-3 sm:grid-cols-3">
                <TagSelect label="Class" options={classes} value={customDraft.class} onChange={(v) => setCustomDraft((prev) => ({ ...prev, class: v, subject: '', topic: '' }))} />
                <TagSelect label="Subject" options={customDraft.class ? customSubjects : subjects} value={customDraft.subject} onChange={(v) => setCustomDraft((prev) => ({ ...prev, subject: v, topic: '' }))} disabled={!customDraft.class} emptyHint="Pick a class first" />
                <TagSelect label="Topic" options={customTopics} value={customDraft.topic} onChange={(v) => setCustomDraft((prev) => ({ ...prev, topic: v }))} disabled={!customDraft.class || !customDraft.subject} emptyHint="Pick class and subject first" />
              </div>
              <div><Label>Question</Label><Textarea value={customDraft.question} onChange={(event) => setCustomDraft((prev) => ({ ...prev, question: event.target.value }))} /></div>
              <div><Label>Question — हिंदी <span className="text-gray-400 font-normal">(optional)</span></Label><Textarea value={customDraft.questionHindi} placeholder="प्रश्न (वैकल्पिक)" onChange={(event) => setCustomDraft((prev) => ({ ...prev, questionHindi: event.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Options <span className="text-gray-400 font-normal">(Hindi optional)</span></Label>
                {customDraft.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-center font-semibold text-gray-600">{LETTERS[idx]}</span>
                    <Input
                      value={opt}
                      placeholder={`Option ${LETTERS[idx]}`}
                      onChange={(event) => setCustomDraft((prev) => {
                        const options = [...prev.options];
                        options[idx] = event.target.value;
                        return { ...prev, options };
                      })}
                    />
                    <Input
                      value={customDraft.optionsHindi[idx]}
                      placeholder={`विकल्प ${LETTERS[idx]} (हिंदी)`}
                      onChange={(event) => setCustomDraft((prev) => {
                        const optionsHindi = [...prev.optionsHindi];
                        optionsHindi[idx] = event.target.value;
                        return { ...prev, optionsHindi };
                      })}
                    />
                  </div>
                ))}
              </div>
              <div>
                <Label>Correct Answer</Label>
                <select
                  value={customDraft.correctIndex}
                  onChange={(event) => setCustomDraft((prev) => ({ ...prev, correctIndex: Number(event.target.value) }))}
                  className="w-full rounded-md border p-2 bg-white"
                >
                  <option value={-1}>Choose correct option…</option>
                  {customDraft.options.map((opt, idx) => (
                    <option key={idx} value={idx}>{LETTERS[idx]}{opt ? ` — ${opt}` : ''}</option>
                  ))}
                </select>
              </div>
              <div><Label>Hint (optional)</Label><Input value={customDraft.hintText} onChange={(event) => setCustomDraft((prev) => ({ ...prev, hintText: event.target.value }))} /></div>
              <Button onClick={saveCustomQuestion} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save &amp; add to quiz
              </Button>
            </div>
          ) : isMcq ? (
            /* Class -> Subject -> Topic -> Question tree */
            <div className="space-y-4">
              {/* Breadcrumb */}
              <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <button onClick={() => { setMcqStep('class'); setSelectedClassName(''); setSelectedSubject(''); setSelectedTopic(''); }} className="hover:text-blue-600">Classes</button>
                {selectedClassName && (<><ChevronRight className="h-4 w-4" /><button onClick={() => handleClassSelect(selectedClassName)} className="hover:text-blue-600">Class {selectedClassName}</button></>)}
                {selectedSubject && (<><ChevronRight className="h-4 w-4" /><button onClick={() => handleSubjectSelect(selectedSubject)} className="hover:text-blue-600">{selectedSubject}</button></>)}
                {selectedTopic && (<><ChevronRight className="h-4 w-4" /><span className="text-gray-900">{selectedTopic}</span></>)}
              </div>

              {mcqStep !== 'class' && (
                <Button size="sm" variant="ghost" onClick={mcqBack} className="h-8 px-2">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              )}

              {loadingChoices ? (
                <div className="py-12 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
              ) : mcqStep === 'class' ? (
                classes.length === 0 ? <p className="py-8 text-center text-muted-foreground">No classes in the question bank yet.</p> : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {classes.map((className) => (
                      <button key={className} onClick={() => handleClassSelect(className)} className="flex items-center justify-between rounded-md border bg-white p-3 text-left hover:bg-blue-50">
                        <span className="flex items-center gap-2 font-medium"><FolderOpen className="h-4 w-4 text-blue-600" />Class {className}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )
              ) : mcqStep === 'subject' ? (
                subjects.length === 0 ? <p className="py-8 text-center text-muted-foreground">No subjects found for Class {selectedClassName}.</p> : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {subjects.map((subject) => (
                      <button key={subject} onClick={() => handleSubjectSelect(subject)} className="flex items-center justify-between rounded-md border bg-white p-3 text-left hover:bg-blue-50">
                        <span className="flex items-center gap-2 font-medium"><FolderOpen className="h-4 w-4 text-blue-600" />{subject}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )
              ) : mcqStep === 'topic' ? (
                topics.length === 0 ? <p className="py-8 text-center text-muted-foreground">No topics found for {selectedSubject}.</p> : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {topics.map((topic) => (
                      <button key={topic} onClick={() => handleTopicSelect(topic)} className="flex items-center justify-between rounded-md border bg-white p-3 text-left hover:bg-blue-50">
                        <span className="font-medium">{topic}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search within this topic..." className="pl-10" />
                  </div>
                  {filteredChoices.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No questions in this topic. Use “Add custom question”.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredChoices.slice(0, 300).map((choice) => (
                        <button key={choice._id} onClick={() => selectChoice(choice)} className="w-full rounded-md border bg-white p-3 text-left hover:bg-blue-50">
                          <p className="font-medium">{renderChoiceText(choice, 'Question')}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[choice.subject, choice.class ? `Class ${choice.class}` : '', choice.topic].filter(Boolean).join(' | ')}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Flat searchable list for audio / video / puzzle */
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions..." className="pl-10" />
              </div>
              {loadingChoices ? (
                <div className="py-12 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
              ) : filteredChoices.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No questions found.</p>
              ) : (
                <div className="space-y-2">
                  {filteredChoices.slice(0, 200).map((choice) => (
                    <button key={choice._id} onClick={() => selectChoice(choice)} className="w-full rounded-md border bg-white p-3 text-left hover:bg-blue-50">
                      <p className="font-medium">{renderChoiceText(choice, 'Question')}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[choice.subject, choice.class ? `Class ${choice.class}` : '', choice.topic].filter(Boolean).join(' | ')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateQuizNewFixed;
