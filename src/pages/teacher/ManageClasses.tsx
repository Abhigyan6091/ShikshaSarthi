import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpen, FileText, Megaphone, PlusCircle, Trash2, Upload, Users } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'History', 'Geography', 'Civics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
const DOC_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const unwrapTeacher = (raw: string | undefined | null) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.teacher || parsed;
  } catch {
    return null;
  }
};

const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ManageClasses: React.FC = () => {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [saving, setSaving] = useState(false);
  const [newClass, setNewClass] = useState({ className: '', subject: '', description: '' });
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [documentDraft, setDocumentDraft] = useState({ title: '', description: '', file: null as File | null });

  const selectedClass = classes.find((classDoc) => classDoc.classId === selectedClassId) || classes[0];
  const activeClassId = selectedClass?.classId || '';

  const loadWorkspace = async (id: string) => {
    const response = await axios.get(`${API_URL}/classes/teacher/${id}/workspace`);
    setClasses(response.data.classes || []);
    setDocuments(response.data.documents || []);
    setAnnouncements(response.data.announcements || []);
    setQuizzes(response.data.quizzes || []);
    if (!selectedClassId && response.data.classes?.[0]?.classId) {
      setSelectedClassId(response.data.classes[0].classId);
    }
  };

  useEffect(() => {
    const teacher = unwrapTeacher(Cookies.get('teacher')) || unwrapTeacher(localStorage.getItem('teacher')) || unwrapTeacher(localStorage.getItem('currentUser'));
    if (!teacher?.teacherId) {
      toast({ title: 'Not logged in', description: 'Please login as a teacher.', variant: 'destructive' });
      return;
    }
    setTeacherId(teacher.teacherId);
    setSchoolId(teacher.schoolId || '');
    loadWorkspace(teacher.teacherId).catch((error) => {
      console.error('Failed to load classes:', error);
      toast({ title: 'Error', description: 'Failed to load classes.', variant: 'destructive' });
    });
  }, []);

  const classContent = useMemo(() => ({
    documents: documents.filter((doc) => doc.classId === activeClassId),
    announcements: announcements.filter((item) => item.classId === activeClassId),
    quizzes: quizzes.filter((quiz) => quiz.audience?.type === 'global' || quiz.audience?.classIds?.includes(activeClassId)),
  }), [activeClassId, documents, announcements, quizzes]);

  const handleCreateClass = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newClass.className || !newClass.subject || !teacherId || !schoolId) {
      toast({ title: 'Missing information', description: 'Class, subject, teacher and school are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_URL}/classes`, { ...newClass, teacherId, schoolId });
      setNewClass({ className: '', subject: '', description: '' });
      await loadWorkspace(teacherId);
      toast({ title: 'Class created' });
    } catch (error: any) {
      toast({ title: 'Could not create class', description: error?.response?.data?.error || error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const postAnnouncement = async () => {
    if (!activeClassId || !announcement.title.trim() || !announcement.message.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${API_URL}/classes/${activeClassId}/announcements`, { ...announcement, teacherId });
      setAnnouncement({ title: '', message: '' });
      await loadWorkspace(teacherId);
      toast({ title: 'Announcement posted' });
    } catch (error: any) {
      toast({ title: 'Could not post announcement', description: error?.response?.data?.error || error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const uploadDocument = async () => {
    if (!activeClassId || !documentDraft.file) return;
    if (!DOC_TYPES.has(documentDraft.file.type)) {
      toast({ title: 'Unsupported file', description: 'Upload PDF, Word, or PowerPoint files only.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const base64Data = await fileToBase64(documentDraft.file);
      await axios.post(`${API_URL}/classes/${activeClassId}/documents`, {
        teacherId,
        title: documentDraft.title || documentDraft.file.name,
        description: documentDraft.description,
        fileName: documentDraft.file.name,
        mimeType: documentDraft.file.type,
        base64Data,
      });
      setDocumentDraft({ title: '', description: '', file: null });
      await loadWorkspace(teacherId);
      toast({ title: 'Document uploaded', description: 'Saved locally and queued for sync.' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error?.response?.data?.error || error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    await axios.delete(`${API_URL}/classes/${activeClassId}/announcements/${announcementId}?teacherId=${encodeURIComponent(teacherId)}`);
    await loadWorkspace(teacherId);
  };

  const deleteDocument = async (documentId: string) => {
    await axios.delete(`${API_URL}/classes/${activeClassId}/documents/${documentId}?teacherId=${encodeURIComponent(teacherId)}`);
    await loadWorkspace(teacherId);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="edu-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
            <p className="text-gray-600">Create classes, enroll students, post announcements, and share local-first documents.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" /> Create New Class</CardTitle>
                  <CardDescription>Add a classroom for your subject.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateClass} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Class Number</Label>
                      <Select value={newClass.className} onValueChange={(value) => setNewClass((prev) => ({ ...prev, className: value }))}>
                        <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => <SelectItem key={num} value={String(num)}>Class {num}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select value={newClass.subject} onValueChange={(value) => setNewClass((prev) => ({ ...prev, subject: value }))}>
                        <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                        <SelectContent>{SUBJECTS.map((subject) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newClass.description} onChange={(event) => setNewClass((prev) => ({ ...prev, description: event.target.value }))} />
                    </div>
                    <Button type="submit" disabled={saving} className="w-full">Create Class</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> My Classes</CardTitle>
                  <CardDescription>{classes.length} classes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {classes.length === 0 ? <p className="text-sm text-muted-foreground">No classes yet.</p> : classes.map((classDoc) => (
                    <button key={classDoc.classId} onClick={() => setSelectedClassId(classDoc.classId)} className={`w-full rounded-md border p-3 text-left hover:bg-blue-50 ${activeClassId === classDoc.classId ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}>
                      <p className="font-medium">Class {classDoc.className} - {classDoc.subject}</p>
                      <p className="text-sm text-muted-foreground">{classDoc.students?.length || 0} students</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {!selectedClass ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">Select or create a class.</CardContent></Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle>Class {selectedClass.className} - {selectedClass.subject}</CardTitle>
                          <CardDescription>{selectedClass.description || 'Classroom workspace'}</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => navigate(`/teacher/class/${selectedClass.classId}/students`)}>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Students
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md bg-blue-50 p-3"><p className="text-sm text-blue-700">Students</p><p className="text-2xl font-bold">{selectedClass.students?.length || 0}</p></div>
                      <div className="rounded-md bg-green-50 p-3"><p className="text-sm text-green-700">Documents</p><p className="text-2xl font-bold">{classContent.documents.length}</p></div>
                      <div className="rounded-md bg-purple-50 p-3"><p className="text-sm text-purple-700">Announcements</p><p className="text-2xl font-bold">{classContent.announcements.length}</p></div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Announcements</CardTitle>
                        <CardDescription>Visible only to enrolled students.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input placeholder="Announcement title" value={announcement.title} onChange={(event) => setAnnouncement((prev) => ({ ...prev, title: event.target.value }))} />
                        <Textarea placeholder="Write announcement..." value={announcement.message} onChange={(event) => setAnnouncement((prev) => ({ ...prev, message: event.target.value }))} />
                        <Button onClick={postAnnouncement} disabled={saving || !announcement.title || !announcement.message}>Post Announcement</Button>
                        <div className="space-y-2">
                          {classContent.announcements.map((item) => (
                            <div key={item.announcementId} className="rounded-md border bg-white p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.message}</p></div>
                                <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(item.announcementId)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Documents</CardTitle>
                        <CardDescription>PDF, Word, or slides stored locally first.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input placeholder="Document title" value={documentDraft.title} onChange={(event) => setDocumentDraft((prev) => ({ ...prev, title: event.target.value }))} />
                        <Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(event) => setDocumentDraft((prev) => ({ ...prev, file: event.target.files?.[0] || null }))} />
                        <Textarea placeholder="Description (optional)" value={documentDraft.description} onChange={(event) => setDocumentDraft((prev) => ({ ...prev, description: event.target.value }))} />
                        <Button onClick={uploadDocument} disabled={saving || !documentDraft.file}>Upload Document</Button>
                        <div className="space-y-2">
                          {classContent.documents.map((doc) => (
                            <div key={doc.documentId} className="flex items-center justify-between gap-3 rounded-md border bg-white p-3">
                              <a href={`${API_URL}/classes/${encodeURIComponent(activeClassId)}/documents/${encodeURIComponent(doc.documentId)}/download`} target="_blank" rel="noreferrer" className="min-w-0 flex-1 hover:text-blue-700">
                                <p className="truncate font-medium">{doc.title}</p>
                                <p className="truncate text-xs text-muted-foreground">{doc.originalName}</p>
                              </a>
                              <Button variant="ghost" size="icon" onClick={() => deleteDocument(doc.documentId)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Class Quizzes</CardTitle>
                      <CardDescription>Global quizzes and quizzes targeted to this class.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {classContent.quizzes.length === 0 ? <p className="text-sm text-muted-foreground">No quizzes for this class yet.</p> : (
                        <div className="grid gap-3 md:grid-cols-2">
                          {classContent.quizzes.map((quiz) => (
                            <div key={quiz.quizId} className="rounded-md border bg-white p-3">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{quiz.quizId}</p>
                                <Badge variant="outline">{quiz.audience?.type === 'global' ? 'Global' : 'Class'}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{quiz.totalQuestions || quiz.questions?.length || 0} questions</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageClasses;
