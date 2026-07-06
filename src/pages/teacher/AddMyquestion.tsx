import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast"; // adjust path if needed
const API_URL = import.meta.env.VITE_API_URL;
export default function AddMyQuestion() {
  const [formData, setFormData] = useState({
    subject: "",
    class: "",
    topic: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    hintText: "",
  });

  const [teacherId, setTeacherId] = useState("");
  const[quizId,setquizId]=useState("");
  const { toast } = useToast();

  // Subject/Topic can either be picked from the registered ones in the question
  // bank, or typed fresh. These toggles + lists drive that choice.
  const [subjectMode, setSubjectMode] = useState<"existing" | "new">("existing");
  const [topicMode, setTopicMode] = useState<"existing" | "new">("existing");
  const [subjects, setSubjects] = useState<string[]>([]);
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

    // Load the registered subjects from the question bank for the dropdown.
    axios
      .get(`${API_URL}/questions`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setSubjects([...new Set(list.map((q: any) => q?.subject).filter(Boolean))].sort() as string[]);
      })
      .catch(() => setSubjects([]));
  }, []);

  // Whenever the chosen subject changes, refresh the topic dropdown for it.
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    if (e.target.name === "option" && index !== undefined) {
      const newOptions = [...formData.options];
      newOptions[index] = e.target.value;
      setFormData({ ...formData, options: newOptions });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID not found in cookies",
        variant: "destructive",
      });
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
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          hint: {
            text: formData.hintText,
          },
        },
      };

      const response = await axios.post(
       `${API_URL}/questions/teacher`,
        payload
      );

      toast({
        title: "Success",
        description: "Question added successfully",
      });

      // Optional: reset form
      setFormData({
        subject: "",
        class: "",
        topic: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        hintText: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 space-y-4 bg-white rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4">Add a Question</h2>

      {/* Subject: pick a registered one or add new */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium">Subject</label>
          <div className="inline-flex overflow-hidden rounded border text-xs">
            <button type="button" onClick={() => setSubjectMode("existing")} className={`px-2 py-1 ${subjectMode === "existing" ? "bg-blue-500 text-white" : "bg-white text-gray-600"}`}>Choose existing</button>
            <button type="button" onClick={() => setSubjectMode("new")} className={`px-2 py-1 ${subjectMode === "new" ? "bg-blue-500 text-white" : "bg-white text-gray-600"}`}>Add new</button>
          </div>
        </div>
        {subjectMode === "existing" ? (
          <select
            name="subject"
            value={formData.subject}
            onChange={(e) => { setFormData({ ...formData, subject: e.target.value, topic: "" }); }}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="">Select a subject…</option>
            {subjects.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        ) : (
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="New subject" className="w-full p-2 border rounded" />
        )}
      </div>

      <input
        type="text"
        name="class"
        value={formData.class}
        onChange={handleChange}
        placeholder="Class (optional)"
        className="w-full p-2 border rounded"
      />

      {/* Topic: pick a registered one (for the chosen subject) or add new */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium">Topic</label>
          <div className="inline-flex overflow-hidden rounded border text-xs">
            <button type="button" onClick={() => setTopicMode("existing")} className={`px-2 py-1 ${topicMode === "existing" ? "bg-blue-500 text-white" : "bg-white text-gray-600"}`}>Choose existing</button>
            <button type="button" onClick={() => setTopicMode("new")} className={`px-2 py-1 ${topicMode === "new" ? "bg-blue-500 text-white" : "bg-white text-gray-600"}`}>Add new</button>
          </div>
        </div>
        {topicMode === "existing" ? (
          <select
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            disabled={!formData.subject}
            className="w-full p-2 border rounded bg-white disabled:bg-gray-100"
          >
            <option value="">{formData.subject ? "Select a topic…" : "Pick a subject first"}</option>
            {topics.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        ) : (
          <input type="text" name="topic" value={formData.topic} onChange={handleChange} placeholder="New topic" className="w-full p-2 border rounded" />
        )}
      </div>
      <textarea
        name="question"
        value={formData.question}
        onChange={handleChange}
        placeholder="Question"
        className="w-full p-2 border rounded"
      />

      {formData.options.map((opt, idx) => (
        <input
          key={idx}
          type="text"
          name="option"
          value={opt}
          onChange={(e) => handleChange(e, idx)}
          placeholder={`Option ${idx + 1}`}
          className="w-full p-2 border rounded"
        />
      ))}

      <input
        type="text"
        name="correctAnswer"
        value={formData.correctAnswer}
        onChange={handleChange}
        placeholder="Correct Answer"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="hintText"
        value={formData.hintText}
        onChange={handleChange}
        placeholder="Hint (text)"
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Question
      </button>
    </form>
  );
}
