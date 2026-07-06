import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Play, AlertCircle, Loader2, BookOpen, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

const VideoSubjectTopics: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState("भौतिकी");

  // Science sub-categories (same as Practice page)
  const chemistryTopics = [
    "अम्ल, क्षारक एवं लवण",
    "कार्बन, कोयला एवं पेट्रोलियम",
    "कृत्रिम रेशे और प्लास्टिक",
    "धातुएं और अधातुएं",
    "रासायनिक अभिक्रिया",
    "हवा"
  ];

  const biologyTopics = [
    "किशोरावस्था",
    "कोशिका",
    "चित्रण",
    "सूक्ष्मजीव",
    "फसल प्रबंधन"
  ];

  const physicsTopics = [
    "चुंबक",
    "ताप संचरण",
    "घर्षण",
    "ध्वनि",
    "प्रकाश",
    "प्रकाश संश्लेषण",
    "बल और दाब",
    "विद्युत धारा"
  ];

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!subject) {
          setError("Subject is not specified.");
          setTopics([]);
          return;
        }

        // Decode the subject URL parameter for Hindi characters
        const decodedSubject = decodeURIComponent(subject);

        // Class-agnostic: all students can access every video topic in a subject.
        const res = await axios.get(
          `${API_URL}/video-questions/all/topics/${encodeURIComponent(decodedSubject)}`
        );

        console.log("Video topics response:", res.data);

        if (res.data && Array.isArray(res.data.topics)) {
          console.log("Topics found:", res.data.topics);
          setTopics(res.data.topics);
        } else {
          console.error("Invalid response format:", res.data);
          setError("Invalid topics data received from server.");
          setTopics([]);
        }
      } catch (err: any) {
        console.error("Error fetching video topics:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError("Failed to load topics. Please try again later.");
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
    return icons[subjectName] || '🎬';
  };

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 font-medium">Loading video topics...</p>
      <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the topics</p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md text-center">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Video Topics Available</h3>
        <p className="text-gray-600 mb-4">
          कोई वीडियो टॉपिक नहीं मिला। कृपया बाद में फिर से कोशिश करें।
        </p>
        <Link to="/student/video-questions">
          <Button variant="outline">
            Back to Video Subjects
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderTopicCards = (displayTopics: string[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayTopics.map((topic, index) => (
        <Card 
          key={topic} 
          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2">
                {topic}
              </CardTitle>
              <Badge 
                variant="outline" 
                className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 text-purple-700"
              >
                #{index + 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Video className="h-4 w-4" />
              <span>वीडियो प्रश्न</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link to={`/student/video-quiz/${subject}/${topic}`} className="w-full">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const scienceCategories = ["भौतिकी", "रसायन", "जीवविज्ञान"];

  const getFilteredScienceTopics = () => {
    if (subject !== "विज्ञान") return topics;

    const map: Record<string, string[]> = {
      भौतिकी: physicsTopics,
      रसायन: chemistryTopics,
      जीवविज्ञान: biologyTopics,
    };

    const allowedTopics = map[selectedSub] || [];
    return allowedTopics.filter(topic => topics.includes(topic));
  };

  const filteredTopics = getFilteredScienceTopics();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="edu-container">
          {/* Back Button */}
          <Link to="/student/video-questions">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Button>
          </Link>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white p-3 rounded-full shadow-sm border">
                <span className="text-2xl">{getSubjectIcon(subject || '')}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {subject} <span className="text-gray-600">के वीडियो टॉपिक</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  वीडियो देखने के लिए एक टॉपिक चुनें
                </p>
              </div>
            </div>

            {!loading && !error && topics.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {topics.length} उपलब्ध टॉपिक
                </Badge>
              </div>
            )}
          </div>

          {/* Science Subject Tabs */}
          {subject === "विज्ञान" && (
            <div className="flex gap-4 mb-6">
              {scienceCategories.map((sub) => (
                <Button
                  key={sub}
                  variant={selectedSub === sub ? "default" : "outline"}
                  onClick={() => setSelectedSub(sub)}
                >
                  {sub}
                </Button>
              ))}
            </div>
          )}

          {/* Content */}
          {loading && <LoadingState />}
          {error && <ErrorState />}
          {!loading && !error && topics.length === 0 && <EmptyState />}
          {!loading && !error && topics.length > 0 && renderTopicCards(filteredTopics)}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VideoSubjectTopics;
