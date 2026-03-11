import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
interface Question {
  _id: string;
  subject: string;
  class: string;
  topic: string;
  question: string;
  options: string[];
  questionImage?: string;
}

export default function CreateQuiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
    question: "",
    questionImage: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    const teacherCookie = Cookies.get("teacher");
    if (teacherCookie) {
      const parsed = JSON.parse(teacherCookie);
      setTeacherId(parsed.teacher.teacherId);

      axios
        .get(`${API_URL}/questions/`)
        .then((res) => {
          const teacherQuestions = res.data.filter(
            (q: any) => !q.teacherId || q.teacherId === parsed.teacher.teacherId
          );
          setQuestions(teacherQuestions);
          setFilteredQuestions(teacherQuestions);
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to fetch questions",
            variant: "destructive",
          });
        });
    }
  }, []);

  const handleFilter = () => {
    const filtered = questions.filter(
      (q) =>
        (!subjectFilter || q.subject === subjectFilter) &&
        (!topicFilter || q.topic === topicFilter)
    );
    setFilteredQuestions(filtered);
  };

  const toggleSelect = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleCustomFormChange = (e: any, index?: number) => {
    if (index !== undefined) {
      const newOptions = [...customForm.options];
      newOptions[index] = e.target.value;
      setCustomForm({ ...customForm, options: newOptions });
    } else {
      setCustomForm({ ...customForm, [e.target.name]: e.target.value });
    }
    console.log("Correct Answer selected:", e.target.value);

  };

  const addCustomQuestionLocally = () => {
  const { question, questionImage, options, correctAnswer } = customForm;

  if (!question || !correctAnswer || options.includes("") || !options.includes(correctAnswer)) {
    return toast({
      title: "Error",
      description: "Please fill all fields and select a valid correct answer",
      variant: "destructive",
    });
  }

  const tempId = `custom-${Date.now()}`;
  const newQ = {
    _id: tempId,
    question,
    questionImage,
    options,
    correctAnswer, // ✅ Save correctAnswer correctly
    subject: "custom",
    class: "custom",
    topic: "custom",
    teacherId,
  };

  setCustomQuestions([...customQuestions, newQ]);
  setSelectedQuestions([...selectedQuestions, tempId]);
  setCustomForm({
    question: "",
    questionImage: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  setShowCustomForm(false);
};


  const handleSubmit = async () => {
    if (!teacherId || !quizId.trim()) {
      toast({
        title: "Error",
        description: "Please enter quiz ID and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, create the quiz without questions testing
      const quizRes = await axios.post(`${API_URL}/quizzes/`, {
        teacherId,
        quizId: quizId.trim(),
        questions: [],
      });

      const createdQuiz = quizRes.data;

      // Upload custom questions and collect their _ids
      const uploadedCustomIds = [];
      for (let q of customQuestions) {
        const res = await axios.post(
          `${API_URL}/quizzes/${quizId}/custom-question`,
          {
            question: q.question,
            questionImage: q.questionImage,
            options: q.options,
            correctAnswer: q.correctAnswer, // default fallback
            teacherId,
          }
        );
        uploadedCustomIds.push(res.data.question._id);
      }

      // Merge selectedQuestions (excluding custom temp IDs) + uploaded custom question _ids
      const realSelected = selectedQuestions.filter((id) => !id.startsWith("custom-"));
      const finalQuestionIds = [...realSelected, ...uploadedCustomIds];

      // Update quiz with all question IDs
      await axios.put(`${API_URL}/quizzes/${createdQuiz._id}`, {
        questions: finalQuestionIds,
      });

      toast({
        title: "Quiz Created",
        description: `Quiz "${quizId}" created with ${finalQuestionIds.length} questions.`,
      });

      setSelectedQuestions([]);
      setCustomQuestions([]);
      setQuizId("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to create quiz",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-3 sm:p-4">
      <h2 className="text-xl font-bold mb-4">Create Quiz</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by subject"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Filter by topic"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <Button onClick={handleFilter} className="w-full sm:w-auto">Filter</Button>
      </div>

      <input
        type="text"
        placeholder="Enter Quiz ID"
        value={quizId}
        onChange={(e) => setQuizId(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <Button onClick={() => setShowCustomForm(!showCustomForm)} className="mb-4">
        {showCustomForm ? "Cancel Custom Question" : "Add Custom Question"}
      </Button>

      {showCustomForm && (
        <div className="border p-4 mb-4 bg-gray-50 rounded">
          <input
            type="text"
            name="question"
            placeholder="Custom Question"
            value={customForm.question}
            onChange={handleCustomFormChange}
            className="w-full border p-2 mb-2 rounded"
          />
          <input
            type="text"
            name="questionImage"
            placeholder="Image URL (optional)"
            value={customForm.questionImage}
            onChange={handleCustomFormChange}
            className="w-full border p-2 mb-2 rounded"
          />
          {customForm.options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleCustomFormChange(e, i)}
              className="w-full border p-2 mb-2 rounded"
            />
          ))}
          <select
            name="correctAnswer"
            value={customForm.correctAnswer}
            onChange={handleCustomFormChange}
            className="w-full border p-2 mb-2 rounded bg-white"
          >
            <option value="">Select Correct Answer</option>
            {customForm.options
              .filter((opt) => opt.trim() !== "")
              .map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
          </select>

          <Button onClick={addCustomQuestionLocally}>Add to Quiz</Button>
        </div>
      )}

      <div className="grid gap-4">
        {filteredQuestions.concat(customQuestions).map((q) => (
          <div
            key={q._id}
            className={`p-4 border rounded shadow-sm ${
              selectedQuestions.includes(q._id) ? "bg-green-100" : "bg-white"
            }`}
            onClick={() => toggleSelect(q._id)}
          >
            <p className="font-semibold">{q.question}</p>
            {q.questionImage && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(q.questionImage, "_blank");
                }}
                className="text-sm mt-1"
              >
                View Image
              </Button>
            )}
            <ul className="list-disc pl-4">
              {q.options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
            <small className="text-gray-500">
              Subject: {q.subject} | Topic: {q.topic}
            </small>
          </div>
        ))}
      </div>

      <Button className="mt-4" onClick={handleSubmit}>
        Submit Quiz
      </Button>
    </div>
  );
}
