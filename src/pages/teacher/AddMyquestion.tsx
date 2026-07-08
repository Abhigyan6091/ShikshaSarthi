import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import TagSelect from "@/components/TagSelect";

const API_URL = import.meta.env.VITE_API_URL;
const LETTERS = ["A", "B", "C", "D"];
const sortLabels = (values: string[]) =>
  values
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }));

export default function AddMyQuestion() {
  const [formData, setFormData] = useState({
    subject: "",
    class: "",
    topic: "",
    question: "",
    questionHindi: "",
    options: ["", "", "", ""],
    optionsHindi: ["", "", "", ""],
    correctIndex: -1, // which option (0-3) is correct
    hintText: "",
  });

  const [teacherId, setTeacherId] = useState("");
  const { toast } = useToast();

  // Existing tags from the question bank.
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allSubjects, setAllSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);

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
        setBankQuestions(list);
        setAllSubjects(sortLabels([...new Set(list.map((q: any) => q?.subject).filter(Boolean))] as string[]));
        setClasses(sortLabels([...new Set(list.map((q: any) => q?.class).filter(Boolean))] as string[]));
      })
      .catch(() => {
        setBankQuestions([]);
        setAllSubjects([]);
        setSubjects([]);
        setClasses([]);
      });
  }, []);

  // Class -> Subject -> Topic.
  useEffect(() => {
    const className = formData.class?.trim();
    if (!className) {
      setSubjects([]);
      setTopics([]);
      return;
    }
    setSubjects(sortLabels([...new Set(
      bankQuestions
        .filter((q: any) => q?.class === className)
        .map((q: any) => q?.subject)
        .filter(Boolean)
    )] as string[]));
  }, [bankQuestions, formData.class]);

  useEffect(() => {
    const className = formData.class?.trim();
    const subject = formData.subject?.trim();
    if (!className || !subject) {
      setTopics([]);
      return;
    }
    setTopics(sortLabels([...new Set(
      bankQuestions
        .filter((q: any) => q?.class === className && q?.subject === subject)
        .map((q: any) => q?.topic)
        .filter(Boolean)
    )] as string[]));
  }, [bankQuestions, formData.class, formData.subject]);

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
      const optionsHindi = formData.optionsHindi.map((o) => o.trim());
      const payload = {
        teacherId,
        questionData: {
          subject: formData.subject,
          class: formData.class,
          topic: formData.topic,
          question: formData.question,
          questionHindi: formData.questionHindi.trim() || "NA",
          options,
          optionsHindi: optionsHindi.map((o) => o || "NA"),
          correctAnswer: options[formData.correctIndex], // store the option text (matches how quizzes grade)
          hint: { text: formData.hintText },
        },
      };

      await axios.post(`${API_URL}/questions/teacher`, payload);
      toast({ title: "Success", description: "Question added successfully" });

      setFormData({ subject: "", class: "", topic: "", question: "", questionHindi: "", options: ["", "", "", ""], optionsHindi: ["", "", "", ""], correctIndex: -1, hintText: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add a Question</h2>

      <TagSelect label="Class" options={classes} value={formData.class} onChange={(v) => setFormData((p) => ({ ...p, class: v, subject: "", topic: "" }))} />
      <TagSelect label="Subject" options={formData.class ? subjects : allSubjects} value={formData.subject} onChange={(v) => setFormData((p) => ({ ...p, subject: v, topic: "" }))} disabled={!formData.class} emptyHint="Pick a class first" />
      <TagSelect
        label="Topic"
        options={topics}
        value={formData.topic}
        onChange={(v) => setField("topic", v)}
        disabled={!formData.class || !formData.subject}
        emptyHint="Pick class and subject first"
      />

      <div>
        <label className="text-sm font-medium">Question</label>
        <textarea name="question" value={formData.question} onChange={(e) => setField("question", e.target.value)} placeholder="Question" className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="text-sm font-medium">Question — हिंदी <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea value={formData.questionHindi} onChange={(e) => setField("questionHindi", e.target.value)} placeholder="प्रश्न (वैकल्पिक)" className="w-full p-2 border rounded" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Options <span className="text-gray-400 font-normal">(Hindi optional)</span></label>
        {formData.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-6 text-center font-semibold text-gray-600">{LETTERS[idx]}</span>
            <input type="text" value={opt} onChange={(e) => setOption(idx, e.target.value)} placeholder={`Option ${LETTERS[idx]}`} className="flex-1 p-2 border rounded" />
            <input
              type="text"
              value={formData.optionsHindi[idx]}
              onChange={(e) => setFormData((prev) => { const oh = [...prev.optionsHindi]; oh[idx] = e.target.value; return { ...prev, optionsHindi: oh }; })}
              placeholder={`विकल्प ${LETTERS[idx]} (हिंदी)`}
              className="flex-1 p-2 border rounded"
            />
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
