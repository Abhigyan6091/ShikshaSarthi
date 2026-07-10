import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpen, Users, FlaskConical, Calculator } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-edu-blue/10 to-white py-16">
          <div className="edu-container">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  ShikshaSarthi के साथ आत्मविश्वास से परीक्षा की तैयारी करें
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                  कक्षा 6 से 10 तक के सरकारी स्कूल के छात्रों के लिए विशेष रूप से डिज़ाइन किया गया एक व्यापक शिक्षण प्लेटफ़ॉर्म, जो NMMS जैसी छात्रवृत्ति परीक्षाओं में उत्कृष्ट प्रदर्शन करने में मदद करता है।
                </p>
                <div className="flex flex-wrap gap-4"></div>
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-edu-blue/20 rounded-full absolute top-4 left-4"></div>
                  <div className="w-64 h-64 bg-edu-yellow/20 rounded-full absolute top-8 left-8"></div>
                  <div className="bg-white p-6 rounded-lg shadow-lg z-10 relative">
                    <img 
                      src="https://img.freepik.com/free-vector/students-with-laptops-studying-online-course_74855-5293.jpg" 
                      alt="ऑनलाइन पढ़ाई करते छात्र" 
                      className="w-64 h-64 object-cover rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* What is ShikshaSarthi Section */}
        <section className="py-16 bg-white">
          <div className="edu-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">ShikshaSarthi क्या है?</h2>
              <p className="text-gray-700 max-w-3xl mx-auto">
                ShikshaSarthi एक व्यापक शिक्षण मंच है जो छात्रों को राष्ट्रीय साधन-सह-मेधा छात्रवृत्ति (NMMS) जैसी छात्रवृत्ति परीक्षाओं की तैयारी में मदद करता है,
                ताकि आर्थिक रूप से कमजोर वर्गों के मेधावी छात्रों को वित्तीय सहायता मिल सके और वे अपनी पढ़ाई जारी रख सकें।
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <BookOpen className="h-12 w-12 mb-4 text-edu-blue" />,
                  title: "शैक्षणिक उत्कृष्टता",
                  description: "यह छात्रवृत्ति शैक्षणिक उत्कृष्टता को बढ़ावा देती है और मेधावी छात्रों को पढ़ाई जारी रखने में मदद करती है।"
                },
                {
                  icon: <Users className="h-12 w-12 mb-4 text-edu-purple" />,
                  title: "वित्तीय सहायता",
                  description: "NMMS आर्थिक रूप से कमजोर वर्गों के छात्रों को वित्तीय सहायता प्रदान करता है।"
                },
                {
                  icon: <FlaskConical className="h-12 w-12 mb-4 text-edu-green" />,
                  title: "विषयों की व्यापकता",
                  description: "यह परीक्षा गणित, विज्ञान, सामाजिक विज्ञान और मानसिक योग्यता पर आधारित होती है।"
                },
                {
                  icon: <Calculator className="h-12 w-12 mb-4 text-edu-yellow" />,
                  title: "प्रतियोगी परीक्षा",
                  description: "NMMS कक्षा 8 के छात्रों के लिए राज्य स्तर पर आयोजित की जाने वाली एक प्रतियोगी छात्रवृत्ति परीक्षा है।"
                }
              ].map((item, index) => (
                <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="flex justify-center">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="edu-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">हमारी विशेषताएं</h2>
              <p className="text-gray-700 max-w-3xl mx-auto">
                हमारा प्लेटफॉर्म छात्रों को NMMS परीक्षा की प्रभावी तैयारी के लिए विभिन्न विशेषताएं प्रदान करता है।
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "प्रैक्टिस प्रश्न",
                  description: "गणित, विज्ञान, सामाजिक विज्ञान और मानसिक योग्यता के लिए एक विशाल प्रश्न बैंक तक पहुँच।",
                  image: "https://img.freepik.com/free-vector/tiny-students-sitting-near-books_74855-15547.jpg"
                },
                {
                  title: "शिक्षक द्वारा बनाए गए क्विज़",
                  description: "शिक्षक विशिष्ट विषयों या सुधार की आवश्यकता वाले क्षेत्रों के लिए कस्टम क्विज़ बना सकते हैं।",
                  image: "https://img.freepik.com/free-vector/teacher-concept-illustration_114360-1638.jpg"
                },
                {
                  title: "समूह क्विज़ मोड",
                  description: "मित्रों के साथ समूह में क्विज़ हल करके सहयोगात्मक रूप से सीखें।",
                  image: "https://img.freepik.com/free-vector/students-watching-webinar-computer-studying-online_74855-15522.jpg"
                },
                {
                  title: "विश्लेषण और प्रगति ट्रैकिंग",
                  description: "विभिन्न विषयों में अपने प्रदर्शन पर विस्तृत विश्लेषण के साथ प्रगति पर नज़र रखें।",
                  image: "https://img.freepik.com/free-vector/data-inform-illustration-concept_114360-864.jpg"
                }
              ].map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-6 items-center p-6 bg-white rounded-lg shadow-md">
                  <div className="md:w-1/3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <Link to="/register">
                      <Button variant="outline" size="sm">और जानें</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-edu-blue text-white">
          <div className="edu-container text-center">
            <h2 className="text-3xl font-bold mb-4">क्या आप NMMS की तैयारी शुरू करने के लिए तैयार हैं?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              हमारे प्लेटफॉर्म का उपयोग कर रहे हजारों छात्रों में शामिल हों और अपने सपनों को साकार करें।
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="secondary">
                  अभी पंजीकरण करें
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/20">
                  लॉगिन करें
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
