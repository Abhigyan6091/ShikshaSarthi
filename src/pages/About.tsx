import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, GraduationCap, BookText } from 'lucide-react';

const About: React.FC = () => {
  const sections = [
    {
      title: "ShikshaSarthi क्या है?",
      icon: <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-edu-blue mb-4" />,
      content: `
        ShikshaSarthi एक व्यापक शिक्षण मंच है जो सरकारी स्कूल के छात्रों को राष्ट्रीय साधन-सह-मेधा छात्रवृत्ति (NMMS) जैसी छात्रवृत्ति परीक्षाओं की तैयारी में मदद करता है,
        ताकि कक्षा 8 में ड्रॉपआउट दर को कम किया जा सके और उन्हें माध्यमिक स्तर पर अपनी पढ़ाई जारी रखने के लिए प्रोत्साहित किया जा सके।
      `
    },
    {
      title: "पात्रता मानदंड",
      icon: <Award className="h-8 w-8 sm:h-10 sm:w-10 text-edu-purple mb-4" />,
      content: `
        • छात्र किसी सरकारी, स्थानीय निकाय या सरकारी सहायता प्राप्त स्कूल में कक्षा 8 में अध्ययनरत होना चाहिए।
        • माता-पिता की वार्षिक आय ₹3,50,000 से अधिक नहीं होनी चाहिए।
        • कक्षा 7 की वार्षिक परीक्षा में न्यूनतम 55% अंक (SC/ST के लिए 50%) प्राप्त करने चाहिए।
        • राज्य/संघ राज्य क्षेत्र द्वारा आयोजित दो-स्तरीय मेरिट परीक्षा में उत्तीर्ण होना आवश्यक है।
      `
    },
    {
      title: "परीक्षा पैटर्न",
      icon: <BookText className="h-8 w-8 sm:h-10 sm:w-10 text-edu-green mb-4" />,
      content: `
        NMMS परीक्षा दो भागों में होती है:

        1. मानसिक योग्यता परीक्षण (MAT):
           • 90 बहुविकल्पीय प्रश्न
           • तर्क शक्ति और विश्लेषणात्मक सोच की जांच

        2. शैक्षणिक अभिरुचि परीक्षण (SAT):
           • 90 बहुविकल्पीय प्रश्न
           • गणित, विज्ञान और सामाजिक विज्ञान पर आधारित

        समय: प्रत्येक परीक्षा के लिए 90 मिनट
        कुल अंक: 180 (प्रत्येक के लिए 90 अंक)
        न्यूनतम उत्तीर्ण अंक: सामान्य वर्ग - 40%, SC/ST/PH - 32%
      `
    },
    {
      title: "छात्रवृत्ति लाभ",
      icon: <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-edu-yellow mb-4" />,
      content: `
        • छात्रवृत्ति राशि: ₹12,000 प्रति वर्ष (₹1,000 प्रति माह)
        • अवधि: 4 वर्ष (कक्षा 9 से 12 तक)
        • सीधे छात्र के बैंक खाते में ट्रांसफर
        • शैक्षणिक खर्च को कवर करने और वित्तीय बोझ को कम करने में सहायता

        प्रतिवर्ष लगभग 1,00,000 छात्रवृत्तियाँ राष्ट्रीय स्तर पर प्रदान की जाती हैं।
      `
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-10 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 px-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              ShikshaSarthi और NMMS परीक्षा के बारे में
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              ShikshaSarthi छात्रों को राष्ट्रीय साधन-सह-मेधा छात्रवृत्ति (NMMS) योजना की तैयारी में मदद करता है — यह जानें कि यह योजना आर्थिक रूप से कमजोर वर्गों के मेधावी छात्रों की कैसे मदद करती है।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                  {section.icon}
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">{section.title}</h2>
                  <p className="text-sm sm:text-base whitespace-pre-line text-gray-700">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-12">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center sm:text-left">
                अक्सर पूछे जाने वाले प्रश्न
              </h2>
              <div className="space-y-6 text-sm sm:text-base">
                {[
                  {
                    q: "NMMS परीक्षा कब आयोजित की जाती है?",
                    a: "NMMS परीक्षा आमतौर पर हर साल नवंबर में आयोजित की जाती है। सटीक तारीख राज्य के अनुसार भिन्न हो सकती है।"
                  },
                  {
                    q: "NMMS परीक्षा की तैयारी कैसे करें?",
                    a: "कक्षा 6-8 की NCERT पुस्तकों का अध्ययन करें, पिछले वर्षों के प्रश्नपत्र हल करें और MAT सेक्शन के लिए तर्क शक्ति विकसित करें।"
                  },
                  {
                    q: "छात्रवृत्तियाँ कैसे वितरित की जाती हैं?",
                    a: "NMMS परीक्षा में योग्यता और राज्य-वार कोटा के आधार पर छात्रवृत्तियाँ वितरित की जाती हैं।"
                  },
                  {
                    q: "क्या प्राइवेट स्कूल के छात्र NMMS के लिए आवेदन कर सकते हैं?",
                    a: "नहीं, केवल सरकारी, स्थानीय निकाय या सरकारी सहायता प्राप्त स्कूलों में पढ़ने वाले छात्र ही पात्र हैं।"
                  },
                  {
                    q: "NMMS आवेदन के लिए कौन-कौन से दस्तावेज़ आवश्यक हैं?",
                    a: "स्कूल प्रमाणपत्र, माता-पिता की आय प्रमाणपत्र, जाति प्रमाणपत्र (यदि लागू हो), और छात्र के बैंक खाते का विवरण आवश्यक होता है।"
                  }
                ].map((faq, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-gray-800">{faq.q}</h3>
                    <p className="mt-1 text-gray-700">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;