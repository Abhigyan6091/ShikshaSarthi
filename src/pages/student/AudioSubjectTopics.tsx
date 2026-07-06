import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Headphones, Play, AlertCircle, Loader2, BookOpen, ArrowLeft, Volume2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

const AudioSubjectTopics: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!subject) {
          setError("विषय निर्दिष्ट नहीं है।");
          setTopics([]);
          return;
        }

        const decodedSubject = decodeURIComponent(subject);

        // Class-agnostic: all students can access every audio topic in a subject.
        const res = await axios.get(
          `${API_URL}/audio-questions/all/topics/${encodeURIComponent(decodedSubject)}`
        );

        console.log("Audio topics response:", res.data);

        if (res.data && Array.isArray(res.data.topics)) {
          setTopics(res.data.topics);
        } else {
          setError("सर्वर से अमान्य डेटा प्राप्त हुआ।");
          setTopics([]);
        }
      } catch (err) {
        console.error("Error fetching audio topics:", err);
        setError("विषय लोड करने में विफल। कृपया बाद में पुनः प्रयास करें।");
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subject]);

  const getSubjectIcon = (subjectName: string) => {
    const icons: { [key: string]: string } = {
      'गणित': '📐',
      'विज्ञान': '🔬',
      'सामाजिक विज्ञान': '🏛️',
      'मानसिक क्षमता परीक्षण': '🧠',
    };
    return icons[subjectName] || '🎧';
  };

  const getSubjectColor = (subjectName: string) => {
    const colors: { [key: string]: string } = {
      'गणित': 'from-blue-500 to-cyan-500',
      'विज्ञान': 'from-green-500 to-emerald-500',
      'सामाजिक विज्ञान': 'from-purple-500 to-pink-500',
      'मानसिक क्षमता परीक्षण': 'from-orange-500 to-red-500',
    };
    return colors[subjectName] || 'from-blue-500 to-cyan-500';
  };

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 font-medium">ऑडियो विषय लोड हो रहे हैं...</p>
      <p className="text-gray-500 text-sm mt-2">कृपया प्रतीक्षा करें</p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">कुछ गलत हो गया</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          पुनः प्रयास करें
        </Button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md text-center">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          कोई विषय उपलब्ध नहीं
        </h3>
        <p className="text-gray-600 mb-6">
          इस विषय के लिए अभी कोई ऑडियो प्रश्न उपलब्ध नहीं हैं।
        </p>
        <Link to="/student/multimedia/audio-questions">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            वापस जाएं
          </Button>
        </Link>
      </div>
    </div>
  );

  const decodedSubject = subject ? decodeURIComponent(subject) : '';
  const subjectColor = getSubjectColor(decodedSubject);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="edu-container">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/student/multimedia/audio-questions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ऑडियो प्रश्नों पर वापस जाएं
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`h-16 w-16 bg-gradient-to-br ${subjectColor} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                {getSubjectIcon(decodedSubject)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {decodedSubject} - ऑडियो प्रश्न 🎧
                </h1>
                <p className="text-gray-600 mt-1">
                  विषय चुनें और ऑडियो सुनकर प्रश्नों का उत्तर दें
                </p>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Headphones className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">ऑडियो प्रश्नों के बारे में:</p>
                    <p>प्रत्येक विषय में ऑडियो आधारित प्रश्न हैं। ऑडियो को ध्यान से सुनें और सही उत्तर चुनें।</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {loading && <LoadingState />}
          {error && !loading && <ErrorState />}
          {!loading && !error && topics.length === 0 && <EmptyState />}

          {!loading && !error && topics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, index) => (
                <Card 
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-100 hover:border-blue-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {topic}
                        </CardTitle>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        <Volume2 className="h-3 w-3 mr-1" />
                        ऑडियो
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Headphones className="h-4 w-4 text-blue-600" />
                      <span>ऑडियो सुनें और उत्तर दें</span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link 
                      to={`/student/multimedia/audio-quiz/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(topic)}`}
                      className="w-full"
                    >
                      <Button 
                        className={`w-full bg-gradient-to-r ${subjectColor} hover:shadow-lg transition-all duration-300`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        शुरू करें
                      </Button>
                    </Link>
                  </CardFooter>
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

export default AudioSubjectTopics;
