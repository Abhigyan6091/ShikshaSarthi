import React, { useState } from 'react';
import experiments from './experimentList.json';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Beaker, ChevronDown, ChevronUp, Play, FlaskConical, Atom, Dna } from "lucide-react";

interface Experiment {
  class: string;
  subject: string;
  section: string;
  experiment_name: string;
  description: string;
  simulation_link: string;
}

const ExperimentList: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  // Use "11" as default open class if available, or just null
  const [openClass, setOpenClass] = useState<string | null>("11"); 
  const navigate = useNavigate();

  // Helper to generate distinct colors for different sections
  const getSectionMetadata = (section: string) => {
    // A palette of clean, professional colors for badges/accents
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
      { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
      { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
      { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
      { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
      { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
    ];
    
    // Simple hash to consistently pick a color based on section name
    let hash = 0;
    for (let i = 0; i < section.length; i++) {
      hash = section.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getSubjectStyles = (subject: string | undefined) => {
    switch (subject?.toLowerCase()) {
      case 'physics':
        return {
          icon: Atom,
          gradient: "from-blue-600 to-indigo-700",
          buttonGradient: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
          badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
          iconColor: "text-blue-600",
          activeClass: "bg-blue-50 text-blue-900 border-l-4 border-l-blue-600",
          containerBorder: "border-blue-100"
        };
      case 'chemistry':
        return {
          icon: FlaskConical,
          gradient: "from-purple-600 to-fuchsia-700",
          buttonGradient: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
          badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
          iconColor: "text-purple-600",
          activeClass: "bg-purple-50 text-purple-900 border-l-4 border-l-purple-600",
          containerBorder: "border-purple-100"
        };
      case 'biology':
        return {
          icon: Dna,
          gradient: "from-emerald-600 to-teal-700",
          buttonGradient: "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconColor: "text-emerald-600",
          activeClass: "bg-emerald-50 text-emerald-900 border-l-4 border-l-emerald-600",
          containerBorder: "border-emerald-100"
        };
      default:
        return {
          icon: Beaker,
          gradient: "from-indigo-600 to-violet-700",
          buttonGradient: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
          iconColor: "text-indigo-600",
          activeClass: "bg-indigo-50 text-indigo-900 border-l-4 border-l-indigo-600",
          containerBorder: "border-indigo-100"
        };
    }
  };

  const styles = getSubjectStyles(subject);
  const SubjectIcon = styles.icon;

  const subjectExperiments = experiments.filter(
    (exp) => exp.subject.toLowerCase() === subject?.toLowerCase()
  );

  const experimentsByClass: { [key: string]: Experiment[] } = subjectExperiments.reduce(
    (acc, exp) => {
      if (!acc[exp.class]) {
        acc[exp.class] = [];
      }
      acc[exp.class].push(exp);
      return acc;
    },
    {} as { [key: string]: Experiment[] }
  );

  const toggleClass = (classNum: string) => {
    if (openClass === classNum) {
      setOpenClass(null);
    } else {
      setOpenClass(classNum);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-10">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(-1)} 
                    className="mb-6 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    वापस जाएं (Back)
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-5">
                      <div className={`h-16 w-16 bg-gradient-to-br ${styles.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-3`}>
                          <SubjectIcon className="h-8 w-8" />
                      </div>
                      <div>
                          <Badge className={`mb-2 ${styles.badgeColor} border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider`}>
                              {subject} Lab
                          </Badge>
                          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 capitalize tracking-tight">
                                {subject} Experiments
                          </h1>
                          <p className="text-slate-500 mt-1 max-w-lg">
                                Explore interactive simulations to master concepts.
                                (अवधारणाओं में महारत हासिल करने के लिए सिमुलेशन का अन्वेषण करें।)
                          </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <Link to={`/student/experiments/analytics`}>
                             <Button size="lg" className="w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-semibold shadow-sm text-base h-12 px-6">
                                My Analytics
                             </Button>
                        </Link>
                        <Link to={`/student/experiments/${subject}/quiz`}>
                          <Button size="lg" className="w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-semibold shadow-sm text-base h-12 px-6">
                              <Beaker className="mr-2 h-5 w-5 text-slate-500" />
                              Take Lab Quiz
                          </Button>
                      </Link>
                    </div>
                </div>
            </div>

        {Object.keys(experimentsByClass).length === 0 ? (
           <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-slate-200">
              <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                <Beaker className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No experiments found</h3>
              <p className="text-slate-500 mt-2">We're adding new experiments soon.</p>
           </div>
        ) : (
            <div className="space-y-8">
            {Object.keys(experimentsByClass).map((classNum) => (
                <div key={classNum} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${styles.containerBorder} transition-all duration-300`}>
                <button
                    onClick={() => toggleClass(classNum)}
                    className={`w-full text-left p-5 md:p-6 text-lg font-bold flex justify-between items-center transition-all duration-300 border-b border-transparent
                        ${openClass === classNum ? `${styles.activeClass} border-slate-100` : 'hover:bg-slate-50 text-slate-700'}`}
                >
                    <div className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-bold">
                           {classNum}
                        </span>
                        <span className="text-xl">Class {classNum} (कक्षा {classNum})</span>
                    </div>
                    <div className={`p-2 rounded-full ${openClass === classNum ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                       {openClass === classNum ? 
                           <ChevronUp className={`h-5 w-5 ${styles.iconColor}`} /> : 
                           <ChevronDown className="h-5 w-5 text-slate-400" />
                       }
                    </div>
                </button>
                
                {openClass === classNum && (
                    <div className="p-6 md:p-8 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {experimentsByClass[classNum].map((exp, index) => {
                          const sectionStyle = getSectionMetadata(exp.section);
                          return (
                            <Card key={index} className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 bg-white group overflow-hidden">
                              {/* Colorful top accent bar based on section */}
                              <div className={`h-1.5 w-full ${sectionStyle.bg.replace('bg-', 'bg-gradient-to-r from-')}-400 to-${sectionStyle.text.split('-')[1]}-500`} />
                              
                              <CardHeader className="pb-3 pt-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="secondary" className={`${sectionStyle.bg} ${sectionStyle.text} ${sectionStyle.border} border hover:opacity-90 transition-opacity`}>
                                            {exp.section}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-black transition-colors min-h-[3.5rem] leading-snug">
                                        {exp.experiment_name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow pb-4">
                                    <CardDescription className="text-slate-500 line-clamp-3 text-sm leading-relaxed">
                                        {exp.description}
                                    </CardDescription>
                                </CardContent>
                                <CardFooter className="pt-2 pb-6 px-6">
                                    <Link
                                        to={`/student/experiment/${encodeURIComponent(exp.experiment_name)}`}
                                        className="w-full"
                                    >
                                        <Button className={`w-full ${styles.buttonGradient} text-white shadow-md group-hover:shadow-lg transition-all font-semibold py-5 rounded-xl`}>
                                            <Play className="mr-2 h-4 w-4 fill-current" />
                                            Start Simulation
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                          );
                        })}
                    </div>
                    </div>
                )}
                </div>
            ))}
            </div>
        )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExperimentList;
