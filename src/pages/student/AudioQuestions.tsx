import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  ArrowLeft,
  Play,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Headphones
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubjectIcon from "@/components/SubjectIcon";

const subjectData = [
  { 
    id: 'गणित', 
    name: 'गणित', 
    description: 'गणना, बीजगणित, ज्यामिति आदि',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100'
  },
  { 
    id: 'विज्ञान', 
    name: 'विज्ञान', 
    description: 'भौतिकी, रसायन, जीव विज्ञान',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100'
  },
  { 
    id: 'सामाजिक%20विज्ञान', 
    name: 'सामाजिक विज्ञान', 
    description: 'इतिहास, भूगोल, नागरिकशास्त्र',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100'
  },
  { 
    id: 'मानसिक%20क्षमता%20परीक्षण', 
    name: 'मानसिक क्षमता परीक्षण', 
    description: 'तर्क, विश्लेषण, गणितीय क्षमता',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    iconBg: 'bg-orange-100'
  },
];

const AudioQuestions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header />

      <main className="flex-1 py-6 md:py-8">
        <div className="edu-container">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/student/multimedia-assessment')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Multimedia Assessment
          </Button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Learn with Audio
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              ऑडियो <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">प्रश्न</span> 🎧
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              ऑडियो सुनें और प्रश्नों के उत्तर दें - श्रवण कौशल विकसित करें
            </p>
          </div>

          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-6 w-6 text-blue-600" />
                ऑडियो प्रश्न कैसे हल करें
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>प्रत्येक प्रश्न में ऑडियो बटन दिया जाएगा</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>ऑडियो को जितनी बार चाहें उतनी बार सुन सकते हैं</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>ऑडियो सुनने के बाद सही उत्तर चुनें</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>आवश्यकता होने पर नोट्स बनाएं</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {subjectData.map((subject) => (
              <Card 
                key={subject.id}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg overflow-hidden relative ${subject.bgColor}/30 backdrop-blur-sm`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className={`${subject.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <SubjectIcon subject={subject.id} size={32} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-2">
                        {subject.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm leading-relaxed">
                        {subject.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4 relative z-10">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Volume2 className="h-4 w-4 text-blue-600" />
                    <span>ऑडियो के साथ सीखें</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 relative z-10">
                  <Link to={`/student/audio-questions/${subject.id}`} className="w-full">
                    <Button 
                      className={`w-full bg-gradient-to-r ${subject.color} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold py-2.5`}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      प्रश्न देखें
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  ऑडियो के माध्यम से सीखने के लिए तैयार हैं?
                </h2>
                <p className="text-blue-100 mb-6">
                  सुनकर सीखें और अपने श्रवण कौशल को बेहतर बनाएं
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AudioQuestions;
