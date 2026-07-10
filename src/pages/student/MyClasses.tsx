import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Megaphone, FileText, ListChecks } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';

const API_URL = import.meta.env.VITE_API_URL;

const MyClasses: React.FC = () => {
  const [data, setData] = useState<any>({ classes: [], documents: [], announcements: [], quizzes: [] });
  const [loading, setLoading] = useState(true);
  const studentId = getCurrentUser()?.studentId;

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    axios.get(`${API_URL}/classes/student/${studentId}`)
      .then((response) => setData(response.data))
      .catch((error) => console.error('Failed to load my classes:', error))
      .finally(() => setLoading(false));
  }, [studentId]);

  const byClass = useMemo(() => {
    const docs = data.documents || [];
    const announcements = data.announcements || [];
    const quizzes = data.quizzes || [];
    return (data.classes || []).map((classDoc: any) => ({
      ...classDoc,
      documents: docs.filter((doc: any) => doc.classId === classDoc.classId),
      announcements: announcements.filter((item: any) => item.classId === classDoc.classId),
      quizzes: quizzes.filter((quiz: any) => quiz.audience?.type === 'global' || quiz.audience?.classIds?.includes(classDoc.classId)),
    }));
  }, [data]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="edu-container">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Classes</h1>
            <p className="text-muted-foreground">Class announcements, documents, and quizzes shared by your teachers.</p>
          </div>

          {loading ? (
            <Card><CardContent className="py-12 text-center">Loading classes...</CardContent></Card>
          ) : byClass.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">You are not enrolled in any class yet.</CardContent></Card>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {byClass.map((classDoc: any) => (
                <Card key={classDoc.classId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Class {classDoc.className} - {classDoc.subject}
                    </CardTitle>
                    <CardDescription>{classDoc.documents.length} documents, {classDoc.announcements.length} announcements, {classDoc.quizzes.length} quizzes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <section>
                      <h3 className="mb-2 flex items-center gap-2 font-semibold"><Megaphone className="h-4 w-4" /> Announcements</h3>
                      {classDoc.announcements.length === 0 ? <p className="text-sm text-muted-foreground">No announcements.</p> : (
                        <div className="space-y-2">
                          {classDoc.announcements.slice(0, 5).map((item: any) => (
                            <div key={item.announcementId} className="rounded-md border bg-white p-3">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    <section>
                      <h3 className="mb-2 flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" /> Documents</h3>
                      {classDoc.documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents shared.</p> : (
                        <div className="space-y-2">
                          {classDoc.documents.map((doc: any) => (
                            <a key={doc.documentId} href={`${API_URL}/classes/${encodeURIComponent(classDoc.classId)}/documents/${encodeURIComponent(doc.documentId)}/download`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border bg-white p-3 hover:bg-blue-50">
                              <span className="font-medium">{doc.title}</span>
                              <Badge variant="outline">{doc.originalName}</Badge>
                            </a>
                          ))}
                        </div>
                      )}
                    </section>

                    <section>
                      <h3 className="mb-2 flex items-center gap-2 font-semibold"><ListChecks className="h-4 w-4" /> Quizzes</h3>
                      {classDoc.quizzes.length === 0 ? <p className="text-sm text-muted-foreground">No quizzes posted.</p> : (
                        <div className="space-y-2">
                          {classDoc.quizzes.map((quiz: any) => (
                            <div key={quiz.quizId} className="flex items-center justify-between rounded-md border bg-white p-3">
                              <div>
                                <p className="font-medium">{quiz.quizId}</p>
                                <p className="text-xs text-muted-foreground">{quiz.audience?.type === 'global' ? 'Global' : 'Class quiz'}</p>
                              </div>
                              <Link to={`/student/take-advanced-quiz?quizId=${encodeURIComponent(quiz.quizId)}`}>
                                <Button size="sm">Open</Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyClasses;
