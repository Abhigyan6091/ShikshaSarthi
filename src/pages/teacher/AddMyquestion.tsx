import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import TagSelect from "@/components/TagSelect";

const API_URL = import.meta.env.VITE_API_URL;
const LETTERS = ["A", "B", "C", "D"];

export default function AddMyQuestion() {
  const [formData, setFormData] = useState({
    subject: "",
    class: "",
    topic: "",
    question: "",
    options: ["", "", "", ""],
    correctIndex: -1, // which option (0-3) is correct
    hintText: "",
  });

  const [teacherId, setTeacherId] = useState("");
  const { toast } = useToast();

  // Existing tags from the question bank.
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const teacherCookie = Cookies.get("teacher");
    if (teacherCookie) {
      try {
        const parsed = JSON.parse(teacherCookie);
        setTeacherId(parsed.teacher?.teacherId || parsed.teacherId || "");
      } catch {
        /* ignore malformed cookie */
      }
    }

    // Registered subjects + classes from the bank for the dropdowns.
    axios
      .get(`${API_URL}/questions`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setSubjects([...new Set(list.map((q: any) => q?.subject).filter(Boolean))].sort() as string[]);
        setClasses([...new Set(list.map((q: any) => q?.class).filter(Boolean))].sort() as string[]);
      })
      .catch(() => {
        setSubjects([]);
        setClasses([]);
      });
  }, []);

  // Refresh topics whenever the chosen subject changes.
  useEffect(() => {
    const subject = formData.subject?.trim();
    if (!subject) {
      setTopics([]);
      return;
    }
    axios
      .get(`${API_URL}/questions/all/topics/${encodeURIComponent(subject)}`)
      .then((res) => setTopics((res.data?.topics || []).filter(Boolean).sort()))
      .catch(() => setTopics([]));
  }, [formData.subject]);

  const setField = (name: string, value: any) => setFormData((prev) => ({ ...prev, [name]: value }));

  const setOption = (index: number, value: string) => {
    setFormData((prev) => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherId) {
      toast({ title: "Error", description: "Teacher not found — please log in again.", variant: "destructive" });
      return;
    }
    if (!formData.subject || !formData.topic || !formData.question) {
      toast({ title: "Missing details", description: "Subject, topic and question are required.", variant: "destructive" });
      return;
    }
    const options = formData.options.map((o) => o.trim());
    if (options.some((o) => !o)) {
      toast({ title: "Fill all options", description: "Please fill options A–D.", variant: "destructive" });
      return;
    }
    if (formData.correctIndex < 0) {
      toast({ title: "Select the correct answer", description: "Choose which option (A–D) is correct.", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        teacherId,
        questionData: {
          subject: formData.subject,
          class: formData.class,
          topic: formData.topic,
          question: formData.question,
          options,
          correctAnswer: options[formData.correctIndex], // store the option text (matches how quizzes grade)
          hint: { text: formData.hintText },
        },
      };

      await axios.post(`${API_URL}/questions/teacher`, payload);
      toast({ title: "Success", description: "Question added successfully" });

      setFormData({ subject: "", class: "", topic: "", question: "", options: ["", "", "", ""], correctIndex: -1, hintText: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add a Question</h2>

      <TagSelect label="Subject" options={subjects} value={formData.subject} onChange={(v) => setFormData((p) => ({ ...p, subject: v, topic: "" }))} />
      <TagSelect label="Class" options={classes} value={formData.class} onChange={(v) => setField("class", v)} />
      <TagSelect
        label="Topic"
        options={topics}
        value={formData.topic}
        onChange={(v) => setField("topic", v)}
        disabled={!formData.subject}
        emptyHint="Pick a subject first"
      />

      <div>
        <label className="text-sm font-medium">Question</label>
        <textarea name="question" value={formData.question} onChange={(e) => setField("question", e.target.value)} placeholder="Question" className="w-full p-2 border rounded" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        {formData.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-6 text-center font-semibold text-gray-600">{LETTERS[idx]}</span>
            <input type="text" value={opt} onChange={(e) => setOption(idx, e.target.value)} placeholder={`Option ${LETTERS[idx]}`} className="flex-1 p-2 border rounded" />
          </div>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium">Correct Answer</label>
        <select value={formData.correctIndex} onChange={(e) => setField("correctIndex", Number(e.target.value))} className="w-full p-2 border rounded bg-white">
          <option value={-1}>Choose correct option…</option>
          {formData.options.map((opt, idx) => (
            <option key={idx} value={idx}>{LETTERS[idx]}{opt ? ` — ${opt}` : ""}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Hint (optional)</label>
        <input type="text" value={formData.hintText} onChange={(e) => setField("hintText", e.target.value)} placeholder="Hint (text)" className="w-full p-2 border rounded" />
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit Question</button>
    </form>
  );
}
