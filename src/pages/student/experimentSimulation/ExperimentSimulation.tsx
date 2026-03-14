import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Atom, 
  FlaskConical, 
  Dna, 
  ArrowRight, 
  ArrowLeft,
  Microscope,
  BookOpen,
  CheckCircle2
} from "lucide-react";

const ExperimentSimulation: React.FC = () => {
    const navigate = useNavigate();

    const subjects = [
        {
            subject: 'Physics',
            hiSubject: 'भौतिक विज्ञान (Physics)',
            description: 'Explore mechanics, optics, and electricity with interactive simulations.',
            hiDescription: 'इंटरैक्टिव सिमुलेशन के साथ यांत्रिकी, प्रकाशिकी और बिजली का अन्वेषण करें।',
            icon: Atom,
            gradient: "from-blue-500 to-indigo-600",
            bgLight: "bg-blue-50",
            borderColor: "border-blue-200 hover:border-blue-400",
            buttonColor: "bg-blue-600 hover:bg-blue-700",
            path: '/student/experiments/physics',
            features: ["Mechanics", "Optics", "Electricity"]
        },
        {
            subject: 'Chemistry',
            hiSubject: 'रसायन विज्ञान (Chemistry)',
            description: 'Perform virtual reactions and explore molecular structures safely.',
            hiDescription: 'आभासी अभिक्रियाएं करें और सुरक्षित रूप से आणविक संरचनाओं का पता लगाएं।',
            icon: FlaskConical,
            gradient: "from-purple-500 to-pink-600",
            bgLight: "bg-purple-50",
            borderColor: "border-purple-200 hover:border-purple-400",
            buttonColor: "bg-purple-600 hover:bg-purple-700",
            path: '/student/experiments/chemistry',
            features: ["Reactions", "Organic", "Inorganic"]
        },
        {
            subject: 'Biology',
            hiSubject: 'जीव विज्ञान (Biology)',
            description: 'Understand life processes from cellular to ecosystem level visually.',
            hiDescription: 'सेलुलर से पारिस्थितिकी तंत्र स्तर तक जीवन प्रक्रियाओं को दृश्य रूप से समझें।',
            icon: Dna,
            gradient: "from-green-500 to-emerald-600",
            bgLight: "bg-green-50",
            borderColor: "border-green-200 hover:border-green-400",
            buttonColor: "bg-green-600 hover:bg-green-700",
            path: '/student/experiments/biology',
            features: ["Cell Biology", "Genetics", "Ecology"]
        }
    ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-sans">
      <Header />
      
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(-1)} 
                    className="mb-4 hover:bg-gray-100 text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    वापस जाएं (Back)
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                    <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Microscope className="h-7 w-7" />
                    </div>
                    <div>
                         <Badge className="mb-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 px-2 py-0.5 text-xs font-semibold">
                            Virtual Lab
                        </Badge>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Experiment Simulation (प्रयोग सिमुलेशन)
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base mt-1">
                            Select a subject to start your virtual learning journey.
                        </p>
                    </div>
                </div>
            </div>

            {/* Introduction Card to match Puzzles style */}
            <Card className="mb-8 border border-indigo-100 bg-white shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                        Features (विशेषताएं)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                            <Atom className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span>Interactive Learning (इंटरैक्टिव लर्निंग)</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <BookOpen className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span>Concept Clarity (अवधारणा स्पष्टता)</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Microscope className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span>Safe Virtual Environment (सुरक्षित वातावरण)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {subjects.map((item, index) => (
                <Card key={index} className={`border-2 ${item.borderColor} transition-all hover:shadow-xl group bg-white`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                             <div className={`h-12 w-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <Badge variant="outline" className="text-xs font-medium text-gray-600 border-gray-300">
                                Class 11-12
                            </Badge>
                        </div>
                        <CardTitle className="text-xl mt-3 font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                            {item.hiSubject}
                        </CardTitle>
                    </CardHeader>
                
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed min-h-[3rem]">
                            {item.hiDescription}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {item.features.map((feature, i) => (
                                <span key={i} className={`${item.bgLight} text-xs font-medium text-gray-700 rounded-full px-2 py-1`}>
                                    {feature}
                                </span>
                            ))}
                        </div>
                         <Link to={item.path} className="w-full block">
                            <Button className={`w-full ${item.buttonColor} text-white font-semibold shadow-md group-hover:shadow-lg transition-all`}>
                                Explore (अन्वेषण करें)
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ))}
            </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExperimentSimulation;
