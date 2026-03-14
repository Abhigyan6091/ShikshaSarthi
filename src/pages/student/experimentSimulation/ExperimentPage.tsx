import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import experiments from './experimentList.json';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Info, BookOpen, FlaskConical, Microscope, ArrowUp, ArrowDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Experiment {
  class: string;
  subject: string;
  section: string;
  experiment_name: string;
  description: string;
  simulation_link: string;
}

const ExperimentPage: React.FC = () => {
  const { experimentName } = useParams<{ experimentName: string }>();
  const navigate = useNavigate();
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  
  const experiment = experiments.find(
    (exp) => exp.experiment_name === decodeURIComponent(experimentName || '')
  ) as Experiment | undefined;

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollButtons(true);
      } else {
        setShowScrollButtons(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const getSubjectStyles = (subject: string | undefined) => {
    switch (subject?.toLowerCase()) {
      case 'physics':
        return {
          gradient: "from-blue-600 to-blue-800",
          iconColor: "text-blue-600",
          bgLight: "bg-blue-50",
          border: "border-blue-100",
          accentColor: "bg-blue-600 hover:bg-blue-700"
        };
      case 'chemistry':
        return {
          gradient: "from-purple-600 to-purple-800",
          iconColor: "text-purple-600",
          bgLight: "bg-purple-50",
          border: "border-purple-100",
          accentColor: "bg-purple-600 hover:bg-purple-700"
        };
      case 'biology':
        return {
          gradient: "from-green-600 to-green-800",
          iconColor: "text-green-600",
          bgLight: "bg-green-50",
          border: "border-green-100",
          accentColor: "bg-green-600 hover:bg-green-700"
        };
      default:
        return {
          gradient: "from-indigo-600 to-indigo-800",
          iconColor: "text-indigo-600",
          bgLight: "bg-indigo-50",
          border: "border-indigo-100",
          accentColor: "bg-indigo-600 hover:bg-indigo-700"
        };
    }
  };

  const styles = getSubjectStyles(experiment?.subject);

  if (!experiment) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center text-red-500 font-semibold text-xl mb-4">
            प्रयोग नहीं मिला! (Experiment not found!)
          </div>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> वापस जाएं (Back)
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 font-sans relative">
      <Header />
      
      {/* Scroll Controls */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 transition-opacity duration-300">
        <Button
          onClick={scrollToTop}
          className={`${styles.accentColor} text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300`}
          size="icon"
          title="Scroll to Top"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
        <Button
          onClick={scrollToBottom}
          className={`${styles.accentColor} text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300`}
          size="icon"
          title="Scroll to Bottom"
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
      </div>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl animate-in fade-in duration-500">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          वापस जाएं (Back)
        </Button>

        {/* Title Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8 transform transition-all hover:scale-[1.01] duration-300">
            <div className={`bg-gradient-to-r ${styles.gradient} p-6 sm:p-10 text-white relative overflow-hidden`}>
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Class {experiment.class}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30 flex items-center gap-1">
                            <FlaskConical className="h-3 w-3" /> {experiment.subject}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                            {experiment.section}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3 leading-tight">
                        {experiment.experiment_name}
                    </h1>
                </div>
                 {/* Decorative background icon */}
                <Microscope className="absolute -right-6 -bottom-6 h-48 w-48 text-white opacity-10 rotate-12" />
            </div>
        </div>

        {/* Description & Study Section - MOVED TO TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-3 border-l-4 border-l-blue-500 shadow-md bg-white">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                     <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        About this Experiment (इस प्रयोग के बारे में)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="prose max-w-none">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {experiment.description}
                        </p>
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-800 text-sm">
                            <strong>Note:</strong> Read the instructions within the simulation carefully. Use the controls to interact with the virtual lab equipment.
                            (<strong>नोट:</strong> सिमुलेशन के भीतर दिए गए निर्देशों को ध्यान से पढ़ें। वर्चुअल लैब उपकरणों के साथ बातचीत करने के लिए नियंत्रणों का उपयोग करें।)
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Simulation Container */}
        <Card className="overflow-hidden border-2 border-gray-200 shadow-xl bg-white mb-12">
            <div className="bg-gray-900 border-b border-gray-800 p-3 flex justify-between items-center text-gray-300 text-sm">
                <span className="flex items-center gap-2"><Play className="h-4 w-4 text-green-500" /> Interactive Simulation</span>
                <span>Virtual Lab v1.0</span>
            </div>
            
            <div className="w-full h-[60vh] sm:h-[70vh] lg:h-[85vh] bg-gray-100 relative group">
                {/* Loader placeholder could go here */}
                <iframe
                    src={experiment.simulation_link}
                    title={experiment.experiment_name}
                    className="w-full h-full border-0 absolute inset-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
            </div>
        </Card>

      </main>
      <Footer />
    </div>
  );
};

export default ExperimentPage;
