import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubjectIcon from '@/components/SubjectIcon';

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

  // ⭐ NEW SUBJECT ADDED FOR VOCABULARY
  { 
    id: 'vocab', 
    name: 'शब्द ज्ञान (Vocabulary)', 
    description: 'अर्थ, प्रयायवाची, विलोम, पैसेज आधारित शब्द अभ्यास',
    color: 'from-indigo-500 to-fuchsia-500',
    bgColor: 'bg-indigo-50',
    iconBg: 'bg-indigo-100'
  }
];


const StudentPractice: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <Header />
      
      <main className="flex-1 py-6 md:py-8">
        <div className="edu-container">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Practice Makes Perfect
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              प्रश्न <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">अभ्यास</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              अपना विषय चुनें और हमारे व्यापक प्रश्न बैंक से अभ्यास शुरू करें
            </p>
          </div>

          {/* Subject Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {subjectData.map((subject, index) => (
              <Card 
                key={subject.id}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg overflow-hidden relative ${subject.bgColor}/30 backdrop-blur-sm`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start space-x-4">
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

                <CardContent className="pb-4 relative z-10"></CardContent>

                <CardFooter className="pt-0 relative z-10">
                  <Link to={`/student/practice/${subject.id}`} className="w-full">
                    <Button 
                      className={`w-full bg-gradient-to-r ${subject.color} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold py-2.5`}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      अभ्यास शुरू करें
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  क्या आप अपने प्रदर्शन को बेहतर बनाने के लिए तैयार हैं?
                </h2>
                <p className="text-blue-100 mb-6">
                  आपकी सफलता के लिए तैयार किए गए हमारे व्यापक प्रश्न बैंक से अभ्यास शुरू करें
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

export default StudentPractice;
