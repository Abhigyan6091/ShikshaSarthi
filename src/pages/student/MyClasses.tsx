import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Megaphone,
  FileText,
  ListChecks,
  CheckCircle2,
  Clock,
  Sparkles,
  GraduationCap,
  Download,
  Eye,
  PlayCircle,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/session';

const API_URL = import.meta.env.VITE_API_URL;

const SUBJECT_GRADIENTS: Record<string, string> = {
  maths: 'from-blue-500 to-indigo-600',
  mathematics: 'from-blue-500 to-indigo-600',
  science: 'from-emerald-500 to-teal-600',
  social: 'from-amber-500 to-orange-600',
  english: 'from-fuchsia-500 to-pink-600',
  hindi: 'from-rose-500 to-red-600',
  default: 'from-slate-500 to-slate-700',
};

const subjectGradient = (subject?: string) => {
  const key = String(subject || '').toLowerCase();
  const match = Object.keys(SUBJECT_GRADIENTS).find((k) => key.includes(k));
  return SUBJECT_GRADIENTS[match || 'default'];
};

const MyClasses: React.FC = () => {
  const [data, setData] = useState<any>({ classes: [], documents: [], announcements: [], quizzes: [] });
  const [attemptedQuizIds, setAttemptedQuizIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const studentId = getCurrentUser()?.studentId;

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    Promise.all([
      axios.get(`${API_URL}/classes/student/${studentId}`),
      axios.get(`${API_URL}/reports/student/${studentId}`).catch(() => ({ data: [] })),
    ])
      .then(([classesRes, reportsRes]) => {
        setData(classesRes.data);
        const ids = new Set<string>((reportsRes.data || []).map((r: any) => r.quizId));
        setAttemptedQuizIds(ids);
      })
      .catch((error) => console.error('Failed to load my classes:', error))
      .finally(() => setLoading(false));
  }, [studentId]);

  const byClass = useMemo(() => {
    const docs = data.documents || [];
    const announcements = data.announcements || [];
    const quizzes = data.quizzes || [];
    return (data.classes || []).map((classDoc: any) => {
      const classQuizzes = quizzes.filter(
        (quiz: any) => quiz.audience?.type === 'global' || quiz.audience?.classIds?.includes(classDoc.classId)
      );
      return {
        ...classDoc,
        documents: docs.filter((doc: any) => doc.classId === classDoc.classId),
        announcements: announcements.filter((item: any) => item.classId === classDoc.classId),
        quizzes: classQuizzes,
        completedCount: classQuizzes.filter((q: any) => attemptedQuizIds.has(q.quizId)).length,
      };
    });
  }, [data, attemptedQuizIds]);

  useEffect(() => {
    if (!activeClassId && byClass.length > 0) setActiveClassId(byClass[0].classId);
  }, [byClass, activeClassId]);

  const activeClass = byClass.find((c: any) => c.classId === activeClassId) || byClass[0];

  return (
    <div className="glass-page-bg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="edu-container">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
              <p className="text-muted-foreground">Everything your teachers have shared — announcements, materials, and quizzes.</p>
            </div>
          </div>

          {loading ? (
            <div className="glass-card p-12 text-center text-slate-600">Loading your classes...</div>
          ) : byClass.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-600">You are not enrolled in any class yet.</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Class picker rail */}
              <div className="space-y-3">
                {byClass.map((classDoc: any) => {
                  const isActive = classDoc.classId === activeClass?.classId;
                  return (
                    <button
                      key={classDoc.classId}
                      onClick={() => setActiveClassId(classDoc.classId)}
                      className={`glass-card w-full p-4 text-left ${isActive ? 'ring-2 ring-blue-400/70' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${subjectGradient(classDoc.subject)} text-sm font-bold text-white shadow-md`}>
                          {classDoc.className}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{classDoc.subject}</p>
                          <p className="text-xs text-slate-500">Class {classDoc.className}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <ListChecks className="h-3.5 w-3.5" />
                        <span>{classDoc.completedCount}/{classDoc.quizzes.length} quizzes done</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active class detail */}
              {activeClass && (
                <div className="space-y-6">
                  <div className="glass-card overflow-hidden">
                    <div className={`bg-gradient-to-r ${subjectGradient(activeClass.subject)} px-6 py-5 text-white`}>
                      <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <BookOpen className="h-4 w-4" /> Class {activeClass.className}
                      </div>
                      <h2 className="mt-1 text-2xl font-bold">{activeClass.subject}</h2>
                      {activeClass.description && <p className="mt-1 text-white/85">{activeClass.description}</p>}
                    </div>

                    <CardContent className="grid grid-cols-3 gap-4 p-5">
                      <div className="rounded-xl bg-white/60 p-3 text-center">
                        <p className="text-2xl font-bold text-slate-900">{activeClass.quizzes.length}</p>
                        <p className="text-xs text-slate-500">Quizzes</p>
                      </div>
                      <div className="rounded-xl bg-white/60 p-3 text-center">
                        <p className="text-2xl font-bold text-slate-900">{activeClass.documents.length}</p>
                        <p className="text-xs text-slate-500">Documents</p>
                      </div>
                      <div className="rounded-xl bg-white/60 p-3 text-center">
                        <p className="text-2xl font-bold text-slate-900">{activeClass.announcements.length}</p>
                        <p className="text-xs text-slate-500">Announcements</p>
                      </div>
                    </CardContent>
                  </div>

                  {/* Announcements */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Megaphone className="h-4 w-4 text-amber-600" /> Announcements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {activeClass.announcements.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No announcements yet.</p>
                      ) : (
                        activeClass.announcements.slice(0, 5).map((item: any) => (
                          <div key={item.announcementId} className="rounded-xl bg-white/70 p-3">
                            <p className="font-medium text-slate-900">{item.title}</p>
                            <p className="text-sm text-slate-600">{item.message}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-blue-600" /> Class Materials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {activeClass.documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents shared.</p>
                      ) : (
                        activeClass.documents.map((doc: any) => (
                          <a
                            key={doc.documentId}
                            href={`${API_URL}/classes/${encodeURIComponent(activeClass.classId)}/documents/${encodeURIComponent(doc.documentId)}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-xl bg-white/70 p-3 transition hover:bg-white"
                          >
                            <span className="font-medium text-slate-900">{doc.title}</span>
                            <Badge variant="outline" className="gap-1">
                              <Download className="h-3 w-3" /> {doc.originalName}
                            </Badge>
                          </a>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Quizzes */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ListChecks className="h-4 w-4 text-emerald-600" /> Quizzes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {activeClass.quizzes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No quizzes posted for this class yet.</p>
                      ) : (
                        activeClass.quizzes.map((quiz: any) => {
                          const isDone = attemptedQuizIds.has(quiz.quizId);
                          return (
                            <div key={quiz.quizId} className="flex items-center justify-between rounded-xl bg-white/70 p-3">
                              <div className="flex items-center gap-3">
                                {isDone ? (
                                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                                ) : (
                                  <Clock className="h-5 w-5 shrink-0 text-amber-500" />
                                )}
                                <div>
                                  <p className="font-medium text-slate-900">{quiz.quizId}</p>
                                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                    <Badge variant="outline" className="text-[10px]">
                                      {quiz.audience?.type === 'global' ? 'Global' : 'Class quiz'}
                                    </Badge>
                                    <span>{quiz.totalQuestions} questions &middot; {quiz.timeLimit} min</span>
                                  </div>
                                </div>
                              </div>
                              {isDone ? (
                                <Link to={`/singlequiz/${encodeURIComponent(quiz.quizId)}`}>
                                  <Button size="sm" variant="outline" className="gap-1">
                                    <Eye className="h-3.5 w-3.5" /> Review
                                  </Button>
                                </Link>
                              ) : (
                                <Link to={`/student/take-advanced-quiz?quizId=${encodeURIComponent(quiz.quizId)}`}>
                                  <Button size="sm" className="gap-1">
                                    <PlayCircle className="h-3.5 w-3.5" /> Take Quiz
                                  </Button>
                                </Link>
                              )}
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyClasses;
