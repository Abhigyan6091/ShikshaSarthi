const makeQuestion = ({
  id,
  topicId,
  tags,
  question,
  questionHindi,
  options,
  optionsHindi,
  correctAnswer,
  hints,
  hintsHindi,
  explanation,
  explanationHindi,
  difficulty = "medium",
  eloRating = 1500,
  interval = 10,
  marks = 1,
  negativeMarks = 0,
}) => ({
  id,
  subjectId: "10-science",
  class: 10,
  topicId,
  tags,
  question,
  questionHindi,
  options,
  optionsHindi,
  correctAnswer,
  hints,
  hintsHindi,
  type: "mcq",
  explanation,
  explanationHindi,
  difficulty,
  eloRating: Math.max(1400, Math.min(1650, eloRating)),
  interval,
  marks,
  negativeMarks,
});

const makeQuestionSet = (topicId, rows) =>
  rows.map(
    ([
      id,
      tags,
      question,
      questionHindi,
      options,
      optionsHindi,
      correctAnswer,
      hints,
      hintsHindi,
      explanation,
      explanationHindi,
      difficulty,
      eloRating,
    ]) =>
      makeQuestion({
        id,
        topicId,
        tags,
        question,
        questionHindi,
        options,
        optionsHindi,
        correctAnswer,
        hints,
        hintsHindi,
        explanation,
        explanationHindi,
        difficulty,
        eloRating,
      })
  );

const class10ScienceQuestionBank = [
  {
    chapterNumber: 3,
    topicId: "science-heat-and-temperature",
    chapterTitle: "Heat and Temperature",
    chapterTitleHindi: "ऊष्मा और ताप",
    questions: makeQuestionSet("science-heat-and-temperature", [

      ["10-science-ht-01", ["heat", "basics"],
        "Heat is a form of ______ that flows from a hotter body to a colder body.",
        "ऊष्मा ______ का एक रूप है जो गर्म वस्तु से ठंडी वस्तु की ओर प्रवाहित होती है।",
        ["Mass", "Energy", "Force", "Work"],
        ["द्रव्यमान", "ऊर्जा", "बल", "कार्य"],
        1,
        ["Think about what actually transfers, not the substance itself.", "सोचिए कि वास्तव में क्या स्थानांतरित होता है, पदार्थ नहीं।"],
        "Heat is a form of energy that is transferred between two bodies because of a temperature difference between them.",
        "ऊष्मा ऊर्जा का एक रूप है जो दो वस्तुओं के बीच तापमान के अंतर के कारण स्थानांतरित होती है।",
        "easy", 1400
      ],

      ["10-science-ht-02", ["temperature", "basics"],
        "Temperature is a measure of:",
        "ताप किसका मापक है?",
        ["Total heat content of a body", "Average kinetic energy of molecules", "Total internal energy of a body", "Pressure exerted by a substance"],
        ["वस्तु की कुल ऊष्मा", "अणुओं की औसत गतिज ऊर्जा", "वस्तु की कुल आंतरिक ऊर्जा", "पदार्थ द्वारा लगाया गया दबाव"],
        1,
        ["It is related to how fast molecules move, not how much total heat is stored.", "यह अणुओं की गति से संबंधित है, कुल संग्रहीत ऊष्मा से नहीं।"],
        "Temperature is the measure of the average kinetic energy of the molecules of a substance, and it decides the direction of heat flow.",
        "ताप किसी पदार्थ के अणुओं की औसत गतिज ऊर्जा का माप है, और यह ऊष्मा प्रवाह की दिशा तय करता है।",
        "medium", 1420
      ],

      ["10-science-ht-03", ["units"],
        "The SI unit of heat is:",
        "ऊष्मा का SI मात्रक क्या है?",
        ["Calorie", "Kelvin", "Joule", "Watt"],
        ["कैलोरी", "केल्विन", "जूल", "वाट"],
        2,
        ["This is also the SI unit of all forms of energy.", "यह ऊर्जा के सभी रूपों का भी SI मात्रक है।"],
        "Since heat is a form of energy, its SI unit is the joule (J). Calorie is a commonly used but non-SI unit.",
        "चूँकि ऊष्मा ऊर्जा का एक रूप है, इसका SI मात्रक जूल (J) है। कैलोरी एक सामान्य परंतु गैर-SI मात्रक है।",
        "easy", 1400
      ],

      ["10-science-ht-04", ["units", "temperature"],
        "The SI unit of temperature is:",
        "ताप का SI मात्रक क्या है?",
        ["Celsius", "Fahrenheit", "Kelvin", "Joule"],
        ["सेल्सियस", "फारेनहाइट", "केल्विन", "जूल"],
        2,
        ["This scale starts from absolute zero.", "यह पैमाना परम शून्य से शुरू होता है।"],
        "The Kelvin scale is the SI unit of temperature. It starts from absolute zero, the lowest possible temperature.",
        "केल्विन पैमाना ताप का SI मात्रक है। यह परम शून्य से शुरू होता है, जो न्यूनतम संभव तापमान है।",
        "easy", 1410
      ],

      ["10-science-ht-05", ["absolute-zero"],
        "Absolute zero on the Celsius scale corresponds to:",
        "परम शून्य सेल्सियस पैमाने पर किसके बराबर होता है?",
        ["0°C", "-100°C", "-273.15°C", "-373°C"],
        ["0°C", "-100°C", "-273.15°C", "-373°C"],
        2,
        ["It is the temperature at which molecular motion is theoretically minimum.", "यह वह तापमान है जिस पर आणविक गति सैद्धांतिक रूप से न्यूनतम होती है।"],
        "Absolute zero is -273.15°C (taken as 0 K), the theoretical temperature at which particles have minimum thermal motion.",
        "परम शून्य -273.15°C (0 K माना गया) है, यह सैद्धांतिक तापमान है जिस पर कणों की तापीय गति न्यूनतम होती है।",
        "medium", 1430
      ],

      ["10-science-ht-06", ["modes-of-transfer", "radiation"],
        "Which mode of heat transfer does NOT require a material medium?",
        "ऊष्मा स्थानांतरण की कौन-सी विधि को किसी माध्यम की आवश्यकता नहीं होती?",
        ["Conduction", "Convection", "Radiation", "Diffusion"],
        ["चालन", "संवहन", "विकिरण", "विसरण"],
        2,
        ["This is how the Sun's heat reaches Earth through empty space.", "इसी विधि से सूर्य की ऊष्मा खाली अंतरिक्ष से होकर पृथ्वी तक पहुँचती है।"],
        "Radiation is the only mode of heat transfer that can take place through vacuum, since it travels as electromagnetic waves.",
        "विकिरण ऊष्मा स्थानांतरण की एकमात्र विधि है जो निर्वात में हो सकती है, क्योंकि यह विद्युत चुम्बकीय तरंगों के रूप में चलती है।",
        "medium", 1440
      ],

      ["10-science-ht-07", ["modes-of-transfer", "convection"],
        "Convection as a mode of heat transfer mainly occurs in:",
        "संवहन विधि मुख्यतः किसमें होती है?",
        ["Solids only", "Liquids and gases", "Vacuum only", "Solids and vacuum"],
        ["केवल ठोसों में", "द्रव और गैसों में", "केवल निर्वात में", "ठोस और निर्वात में"],
        1,
        ["It relies on the bulk movement of particles, which solids cannot do freely.", "यह कणों की सामूहिक गति पर निर्भर करता है, जो ठोस स्वतंत्र रूप से नहीं कर सकते।"],
        "Convection involves the actual movement of heated particles from one place to another, which is possible only in fluids, i.e., liquids and gases.",
        "संवहन में गर्म कणों का वास्तविक स्थानांतरण होता है, जो केवल तरल पदार्थों यानी द्रव और गैसों में संभव है।",
        "medium", 1435
      ],

      ["10-science-ht-08", ["modes-of-transfer", "conduction"],
        "Conduction is the dominant mode of heat transfer in:",
        "चालन ऊष्मा स्थानांतरण की प्रमुख विधि किसमें होती है?",
        ["Gases", "Vacuum", "Solids", "Plasma"],
        ["गैसों में", "निर्वात में", "ठोसों में", "प्लाज्मा में"],
        2,
        ["Particles are tightly packed and vibrate to pass on energy without moving.", "कण कसकर व्यवस्थित होते हैं और बिना हिले ऊर्जा स्थानांतरित करने के लिए कंपन करते हैं।"],
        "In solids, particles are closely packed and transfer heat by vibrating and passing energy to neighbouring particles, making conduction dominant.",
        "ठोसों में कण कसकर व्यवस्थित होते हैं और कंपन करके पड़ोसी कणों को ऊर्जा देकर ऊष्मा स्थानांतरित करते हैं, इसलिए चालन प्रमुख होता है।",
        "medium", 1430
      ],

      ["10-science-ht-09", ["convection", "application"],
        "Land breeze and sea breeze are practical examples of:",
        "स्थल समीर और समुद्र समीर किसके व्यावहारिक उदाहरण हैं?",
        ["Conduction", "Convection", "Radiation", "Insulation"],
        ["चालन", "संवहन", "विकिरण", "ऊष्मारोधन"],
        1,
        ["Unequal heating of land and sea sets up currents of air.", "स्थल और समुद्र के असमान गर्म होने से वायु धाराएँ बनती हैं।"],
        "Unequal heating of land and sea creates convection currents in air, which are experienced as land and sea breezes.",
        "स्थल और समुद्र के असमान गर्म होने से वायु में संवहन धाराएँ बनती हैं, जिन्हें स्थल और समुद्र समीर के रूप में महसूस किया जाता है।",
        "medium", 1445
      ],

      ["10-science-ht-10", ["thermometer"],
        "A thermometer measures temperature by detecting a change in:",
        "थर्मामीटर किसमें परिवर्तन का पता लगाकर तापमान मापता है?",
        ["Colour of the substance", "A measurable physical property like volume or resistance", "Mass of the substance", "Chemical composition"],
        ["पदार्थ का रंग", "आयतन या प्रतिरोध जैसा मापने योग्य भौतिक गुण", "पदार्थ का द्रव्यमान", "रासायनिक संरचना"],
        1,
        ["Mercury thermometers use expansion in volume; resistance thermometers use change in resistance.", "पारा थर्मामीटर आयतन में विस्तार का उपयोग करते हैं; प्रतिरोध थर्मामीटर प्रतिरोध में परिवर्तन का उपयोग करते हैं।"],
        "Thermometers work by using a physical property that changes predictably with temperature, such as volume expansion in mercury thermometers or resistance change in resistance thermometers.",
        "थर्मामीटर किसी ऐसे भौतिक गुण का उपयोग करते हैं जो तापमान के साथ अनुमानित रूप से बदलता है, जैसे पारा थर्मामीटर में आयतन विस्तार या प्रतिरोध थर्मामीटर में प्रतिरोध परिवर्तन।",
        "easy", 1405
      ],

      ["10-science-ht-11", ["conversion", "mathematical"],
        "Convert 25°C into Kelvin.",
        "25°C को केल्विन में बदलिए।",
        ["273 K", "298 K", "373 K", "250 K"],
        ["273 K", "298 K", "373 K", "250 K"],
        1,
        ["Use K = °C + 273.", "K = °C + 273 का उपयोग करें।"],
        "K = 25 + 273 = 298 K. Adding 273 to the Celsius value converts it directly to Kelvin.",
        "K = 25 + 273 = 298 K। सेल्सियस मान में 273 जोड़ने से यह सीधे केल्विन में बदल जाता है।",
        "medium", 1450
      ],

      ["10-science-ht-12", ["conversion", "mathematical"],
        "Convert 373 K into degrees Celsius.",
        "373 K को डिग्री सेल्सियस में बदलिए।",
        ["100°C", "0°C", "273°C", "373°C"],
        ["100°C", "0°C", "273°C", "373°C"],
        0,
        ["Use °C = K − 273.", "°C = K − 273 का उपयोग करें।"],
        "°C = 373 − 273 = 100°C, which is the boiling point of water at normal atmospheric pressure.",
        "°C = 373 − 273 = 100°C, जो सामान्य वायुमंडलीय दाब पर पानी का क्वथनांक है।",
        "medium", 1450
      ],

      ["10-science-ht-13", ["conversion", "mathematical"],
        "Convert 98.6°F (normal human body temperature) into Celsius.",
        "98.6°F (सामान्य शरीर का तापमान) को सेल्सियस में बदलिए।",
        ["37°C", "98.6°C", "66.6°C", "0°C"],
        ["37°C", "98.6°C", "66.6°C", "0°C"],
        0,
        ["Use C = (F − 32) × 5/9.", "C = (F − 32) × 5/9 का उपयोग करें।"],
        "C = (98.6 − 32) × 5/9 = 66.6 × 5/9 = 37°C, matching the well-known normal human body temperature.",
        "C = (98.6 − 32) × 5/9 = 66.6 × 5/9 = 37°C, जो सामान्य मानव शरीर के तापमान से मेल खाता है।",
        "hard", 1550
      ],

      ["10-science-ht-14", ["conversion", "mathematical"],
        "Convert 40°C into Fahrenheit.",
        "40°C को फारेनहाइट में बदलिए।",
        ["104°F", "72°F", "40°F", "212°F"],
        ["104°F", "72°F", "40°F", "212°F"],
        0,
        ["Use F = C × 9/5 + 32.", "F = C × 9/5 + 32 का उपयोग करें।"],
        "F = 40 × 9/5 + 32 = 72 + 32 = 104°F.",
        "F = 40 × 9/5 + 32 = 72 + 32 = 104°F।",
        "hard", 1560
      ],

      ["10-science-ht-15", ["conversion", "tricky", "mathematical"],
        "At which temperature do the Celsius and Fahrenheit scales show the same numerical reading?",
        "किस तापमान पर सेल्सियस और फारेनहाइट पैमाने समान संख्यात्मक मान दिखाते हैं?",
        ["0°", "100°", "-40°", "32°"],
        ["0°", "100°", "-40°", "32°"],
        2,
        ["Set C = F in the conversion formula and solve for the common value.", "रूपांतरण सूत्र में C = F रखकर उभयनिष्ठ मान ज्ञात करें।"],
        "Setting C = F in F = C × 9/5 + 32 gives C = 9C/5 + 32, so −4C/5 = 32, giving C = −40. So −40°C = −40°F.",
        "F = C × 9/5 + 32 में C = F रखने पर C = 9C/5 + 32 मिलता है, इसलिए −4C/5 = 32, जिससे C = −40 मिलता है। अतः −40°C = −40°F।",
        "hard", 1620
      ],

      ["10-science-ht-16", ["conversion"],
        "The boiling point of water on the Fahrenheit scale is:",
        "जल का क्वथनांक फारेनहाइट पैमाने पर कितना होता है?",
        ["100°F", "212°F", "32°F", "180°F"],
        ["100°F", "212°F", "32°F", "180°F"],
        1,
        ["Boiling point is 100°C; convert using the formula.", "क्वथनांक 100°C है; सूत्र का उपयोग करके बदलें।"],
        "100°C converts to F = 100 × 9/5 + 32 = 180 + 32 = 212°F.",
        "100°C, F = 100 × 9/5 + 32 = 180 + 32 = 212°F में बदल जाता है।",
        "medium", 1460
      ],

      ["10-science-ht-17", ["conversion"],
        "The freezing point of water on the Fahrenheit scale is:",
        "जल का हिमांक फारेनहाइट पैमाने पर कितना होता है?",
        ["0°F", "100°F", "32°F", "212°F"],
        ["0°F", "100°F", "32°F", "212°F"],
        2,
        ["Freezing point is 0°C; convert using the formula.", "हिमांक 0°C है; सूत्र का उपयोग करके बदलें।"],
        "0°C converts to F = 0 × 9/5 + 32 = 32°F, the freezing point on the Fahrenheit scale.",
        "0°C, F = 0 × 9/5 + 32 = 32°F में बदल जाता है, जो फारेनहाइट पैमाने पर हिमांक है।",
        "medium", 1455
      ],

      ["10-science-ht-18", ["conversion", "tricky"],
        "A liquid's temperature rises from 20°C to 50°C. What is the rise in temperature expressed in Kelvin?",
        "किसी द्रव का तापमान 20°C से 50°C तक बढ़ता है। यह वृद्धि केल्विन में कितनी होगी?",
        ["30 K", "323 K", "293 K", "50 K"],
        ["30 K", "323 K", "293 K", "50 K"],
        0,
        ["A temperature difference has the same numerical value in Celsius and Kelvin.", "तापमान का अंतर सेल्सियस और केल्विन में समान संख्यात्मक मान रखता है।"],
        "Since both scales use the same size degree, a rise of 30°C is also a rise of 30 K — only the starting point differs, not the interval size.",
        "चूँकि दोनों पैमानों की डिग्री का आकार समान है, 30°C की वृद्धि 30 K की वृद्धि भी है — केवल शुरुआती बिंदु अलग है, अंतराल का आकार नहीं।",
        "hard", 1580
      ],

      ["10-science-ht-19", ["conversion"],
        "Convert −40°C into Kelvin.",
        "−40°C को केल्विन में बदलिए।",
        ["233 K", "313 K", "40 K", "−40 K"],
        ["233 K", "313 K", "40 K", "−40 K"],
        0,
        ["K = °C + 273, even for negative Celsius values.", "K = °C + 273, नकारात्मक सेल्सियस मान के लिए भी।"],
        "K = −40 + 273 = 233 K. Kelvin values are never negative under this formula for realistic temperatures.",
        "K = −40 + 273 = 233 K। इस सूत्र के अंतर्गत वास्तविक तापमानों के लिए केल्विन मान कभी ऋणात्मक नहीं होते।",
        "medium", 1470
      ],

      ["10-science-ht-20", ["conversion", "body-temperature"],
        "Normal human body temperature (37°C) equals how many Kelvin?",
        "मानव शरीर का सामान्य तापमान (37°C) कितने केल्विन के बराबर है?",
        ["310 K", "300 K", "283 K", "373 K"],
        ["310 K", "300 K", "283 K", "373 K"],
        0,
        ["Add 273 to the Celsius value.", "सेल्सियस मान में 273 जोड़ें।"],
        "K = 37 + 273 = 310 K.",
        "K = 37 + 273 = 310 K।",
        "medium", 1445
      ],

      ["10-science-ht-21", ["specific-heat", "definition"],
        "Specific heat capacity of a substance is the heat required to raise the temperature of a unit mass of the substance by:",
        "किसी पदार्थ की विशिष्ट ऊष्मा धारिता, पदार्थ के इकाई द्रव्यमान का तापमान कितना बढ़ाने के लिए आवश्यक ऊष्मा है?",
        ["1°C or 1 K", "100°C", "0°C", "10°C"],
        ["1°C या 1 K", "100°C", "0°C", "10°C"],
        0,
        ["It is defined per unit temperature change, the smallest standard interval.", "यह प्रति इकाई तापमान परिवर्तन, सबसे छोटे मानक अंतराल के लिए परिभाषित होती है।"],
        "Specific heat capacity is defined as the amount of heat needed to raise the temperature of 1 kg (unit mass) of a substance by 1°C or 1 K.",
        "विशिष्ट ऊष्मा धारिता को किसी पदार्थ के 1 kg (इकाई द्रव्यमान) का तापमान 1°C या 1 K बढ़ाने के लिए आवश्यक ऊष्मा की मात्रा के रूप में परिभाषित किया जाता है।",
        "medium", 1425
      ],

      ["10-science-ht-22", ["specific-heat", "units"],
        "The SI unit of specific heat capacity is:",
        "विशिष्ट ऊष्मा धारिता का SI मात्रक क्या है?",
        ["J/kg", "J/kg·K", "J/K", "cal/g°C"],
        ["J/kg", "J/kg·K", "J/K", "cal/g°C"],
        1,
        ["It must include mass, energy, and temperature all together.", "इसमें द्रव्यमान, ऊर्जा और तापमान तीनों साथ में होने चाहिए।"],
        "Since specific heat capacity relates heat energy per unit mass per unit temperature change, its SI unit is J/kg·K (or J kg⁻¹ K⁻¹).",
        "चूँकि विशिष्ट ऊष्मा धारिता प्रति इकाई द्रव्यमान प्रति इकाई तापमान परिवर्तन में ऊष्मा ऊर्जा को दर्शाती है, इसका SI मात्रक J/kg·K है।",
        "medium", 1440
      ],

      ["10-science-ht-23", ["specific-heat", "water"],
        "The approximate specific heat capacity of water is:",
        "जल की लगभग विशिष्ट ऊष्मा धारिता कितनी है?",
        ["4200 J/kg·K", "420 J/kg·K", "2100 J/kg·K", "900 J/kg·K"],
        ["4200 J/kg·K", "420 J/kg·K", "2100 J/kg·K", "900 J/kg·K"],
        0,
        ["Water has one of the highest specific heat capacities among common substances.", "जल की विशिष्ट ऊष्मा धारिता सामान्य पदार्थों में सबसे अधिक होती है।"],
        "Water has a specific heat capacity of about 4200 J/kg·K, which is unusually high and explains its role in moderating climate and temperature.",
        "जल की विशिष्ट ऊष्मा धारिता लगभग 4200 J/kg·K है, जो असामान्य रूप से अधिक है और जलवायु व तापमान को संतुलित करने में इसकी भूमिका बताती है।",
        "medium", 1415
      ],

      ["10-science-ht-24", ["specific-heat", "mathematical"],
        "Find the heat required to raise the temperature of 2 kg of water by 10°C. (Specific heat capacity of water = 4200 J/kg·K)",
        "2 kg जल का तापमान 10°C बढ़ाने के लिए आवश्यक ऊष्मा ज्ञात कीजिए। (जल की विशिष्ट ऊष्मा धारिता = 4200 J/kg·K)",
        ["84000 J", "8400 J", "42000 J", "840000 J"],
        ["84000 J", "8400 J", "42000 J", "840000 J"],
        0,
        ["Use Q = mcΔT.", "Q = mcΔT का उपयोग करें।"],
        "Q = mcΔT = 2 × 4200 × 10 = 84000 J.",
        "Q = mcΔT = 2 × 4200 × 10 = 84000 J।",
        "hard", 1560
      ],

      ["10-science-ht-25", ["specific-heat", "mathematical", "tricky"],
        "A metal block of mass 0.5 kg absorbs 4500 J of heat and its temperature rises by 10°C. Find its specific heat capacity.",
        "0.5 kg द्रव्यमान का एक धातु खंड 4500 J ऊष्मा अवशोषित करता है और इसका तापमान 10°C बढ़ता है। इसकी विशिष्ट ऊष्मा धारिता ज्ञात कीजिए।",
        ["900 J/kg·K", "450 J/kg·K", "90 J/kg·K", "9000 J/kg·K"],
        ["900 J/kg·K", "450 J/kg·K", "90 J/kg·K", "9000 J/kg·K"],
        0,
        ["Rearrange Q = mcΔT to solve for c.", "c ज्ञात करने के लिए Q = mcΔT को पुनर्व्यवस्थित करें।"],
        "c = Q/(mΔT) = 4500/(0.5 × 10) = 4500/5 = 900 J/kg·K.",
        "c = Q/(mΔT) = 4500/(0.5 × 10) = 4500/5 = 900 J/kg·K।",
        "hard", 1600
      ],

      ["10-science-ht-26", ["specific-heat", "conceptual"],
        "Between water and iron of equal mass, which has the higher specific heat capacity?",
        "समान द्रव्यमान के जल और लोहे में से किसकी विशिष्ट ऊष्मा धारिता अधिक होती है?",
        ["Iron", "Water", "Both are equal", "Cannot be determined"],
        ["लोहा", "जल", "दोनों समान हैं", "निर्धारित नहीं किया जा सकता"],
        1,
        ["This is why water heats up and cools down more slowly than metals.", "इसी कारण जल धातुओं की तुलना में धीरे गर्म और ठंडा होता है।"],
        "Water has a much higher specific heat capacity (about 4200 J/kg·K) than iron (about 450 J/kg·K), so it needs more heat to raise its temperature by the same amount.",
        "जल की विशिष्ट ऊष्मा धारिता (लगभग 4200 J/kg·K) लोहे (लगभग 450 J/kg·K) से बहुत अधिक है, इसलिए इसे समान तापमान बढ़ाने के लिए अधिक ऊष्मा चाहिए।",
        "medium", 1420
      ],

      ["10-science-ht-27", ["specific-heat", "conceptual", "application"],
        "Why does water take longer to heat up and cool down compared to sand under the same sunlight?",
        "समान धूप में जल को गर्म और ठंडा होने में रेत की तुलना में अधिक समय क्यों लगता है?",
        ["Water has a lower specific heat capacity", "Water has a higher specific heat capacity than sand", "Water is denser than sand", "Water absorbs more light than sand"],
        ["जल की विशिष्ट ऊष्मा धारिता कम होती है", "जल की विशिष्ट ऊष्मा धारिता रेत से अधिक होती है", "जल रेत से अधिक घना होता है", "जल रेत से अधिक प्रकाश अवशोषित करता है"],
        1,
        ["Think about the amount of heat needed per degree of temperature change.", "प्रति डिग्री तापमान परिवर्तन के लिए आवश्यक ऊष्मा की मात्रा के बारे में सोचें।"],
        "Because water has a much higher specific heat capacity than sand, it needs far more heat energy to change its temperature by the same amount, so it warms up and cools down more slowly.",
        "चूँकि जल की विशिष्ट ऊष्मा धारिता रेत से बहुत अधिक है, इसे समान तापमान परिवर्तन के लिए कहीं अधिक ऊष्मा ऊर्जा चाहिए, इसलिए यह धीरे गर्म और ठंडा होता है।",
        "medium", 1430
      ],

      ["10-science-ht-28", ["specific-heat", "mathematical"],
        "5 kg of water is heated from 25°C to 75°C. How much heat is absorbed? (c = 4200 J/kg·K)",
        "5 kg जल को 25°C से 75°C तक गर्म किया जाता है। कितनी ऊष्मा अवशोषित होती है? (c = 4200 J/kg·K)",
        ["1050000 J", "525000 J", "210000 J", "2100000 J"],
        ["1050000 J", "525000 J", "210000 J", "2100000 J"],
        0,
        ["First find ΔT, then apply Q = mcΔT.", "पहले ΔT ज्ञात करें, फिर Q = mcΔT लागू करें।"],
        "ΔT = 75 − 25 = 50°C. Q = mcΔT = 5 × 4200 × 50 = 1,050,000 J.",
        "ΔT = 75 − 25 = 50°C। Q = mcΔT = 5 × 4200 × 50 = 1,050,000 J।",
        "hard", 1590
      ],

      ["10-science-ht-29", ["heat-capacity", "definition"],
        "The heat capacity (thermal capacity) of a body is given by which formula?",
        "किसी वस्तु की ऊष्मा धारिता किस सूत्र से दी जाती है?",
        ["m × c", "m ÷ c", "c ÷ m", "m × c × ΔT"],
        ["m × c", "m ÷ c", "c ÷ m", "m × c × ΔT"],
        0,
        ["It depends on total mass, not just per unit mass.", "यह कुल द्रव्यमान पर निर्भर करती है, केवल प्रति इकाई द्रव्यमान पर नहीं।"],
        "Heat capacity is the product of mass and specific heat capacity (C = mc), representing the heat needed to raise the temperature of the whole body by 1°C.",
        "ऊष्मा धारिता द्रव्यमान और विशिष्ट ऊष्मा धारिता का गुणनफल है (C = mc), जो पूरी वस्तु का तापमान 1°C बढ़ाने के लिए आवश्यक ऊष्मा को दर्शाती है।",
        "medium", 1435
      ],

      ["10-science-ht-30", ["specific-heat", "mathematical"],
        "2 kg of copper (specific heat capacity = 390 J/kg·K) is heated from 20°C to 100°C. Find the heat needed.",
        "2 kg तांबे (विशिष्ट ऊष्मा धारिता = 390 J/kg·K) को 20°C से 100°C तक गर्म किया जाता है। आवश्यक ऊष्मा ज्ञात कीजिए।",
        ["62400 J", "31200 J", "7800 J", "124800 J"],
        ["62400 J", "31200 J", "7800 J", "124800 J"],
        0,
        ["ΔT = 80°C; apply Q = mcΔT.", "ΔT = 80°C; Q = mcΔT लागू करें।"],
        "ΔT = 100 − 20 = 80°C. Q = mcΔT = 2 × 390 × 80 = 62400 J.",
        "ΔT = 100 − 20 = 80°C। Q = mcΔT = 2 × 390 × 80 = 62400 J।",
        "hard", 1610
      ],

      ["10-science-ht-31", ["latent-heat", "definition"],
        "Latent heat is the heat that is:",
        "गुप्त ऊष्मा वह ऊष्मा है जो:",
        ["Used to change the temperature of a substance", "Absorbed or released during a change of state without a change in temperature", "Lost due to friction between molecules", "Radiated by every hot body"],
        ["पदार्थ का तापमान बदलने में उपयोग होती है", "अवस्था परिवर्तन के दौरान बिना तापमान बदले अवशोषित या मुक्त होती है", "अणुओं के बीच घर्षण से नष्ट होती है", "प्रत्येक गर्म वस्तु द्वारा विकिरित होती है"],
        1,
        ["Think of what happens to ice at exactly 0°C while it melts.", "सोचिए कि बर्फ पिघलते समय ठीक 0°C पर क्या होता है।"],
        "Latent heat is the heat absorbed or released when a substance changes state (like melting or boiling) at constant temperature, without changing the temperature itself.",
        "गुप्त ऊष्मा वह ऊष्मा है जो किसी पदार्थ की अवस्था बदलने (जैसे पिघलना या उबलना) पर स्थिर तापमान पर अवशोषित या मुक्त होती है, बिना तापमान बदले।",
        "medium", 1435
      ],

      ["10-science-ht-32", ["latent-heat", "units"],
        "The SI unit of latent heat is:",
        "गुप्त ऊष्मा का SI मात्रक क्या है?",
        ["J/kg", "J", "J/K", "J/kg·K"],
        ["J/kg", "J", "J/K", "J/kg·K"],
        0,
        ["Unlike specific heat capacity, it does not involve a temperature change.", "विशिष्ट ऊष्मा धारिता के विपरीत, इसमें तापमान परिवर्तन शामिल नहीं है।"],
        "Since latent heat is heat energy per unit mass (with no temperature term involved), its SI unit is J/kg.",
        "चूँकि गुप्त ऊष्मा प्रति इकाई द्रव्यमान ऊष्मा ऊर्जा है (जिसमें तापमान शामिल नहीं है), इसका SI मात्रक J/kg है।",
        "medium", 1425
      ],

      ["10-science-ht-33", ["latent-heat", "ice"],
        "The approximate latent heat of fusion of ice is:",
        "बर्फ की संगलन गुप्त ऊष्मा लगभग कितनी होती है?",
        ["336000 J/kg", "2260000 J/kg", "4200 J/kg", "100000 J/kg"],
        ["336000 J/kg", "2260000 J/kg", "4200 J/kg", "100000 J/kg"],
        0,
        ["This value is much smaller than the latent heat of vaporization.", "यह मान वाष्पीकरण की गुप्त ऊष्मा से बहुत कम है।"],
        "The latent heat of fusion of ice is about 336000 J/kg (336 kJ/kg), the heat needed to convert 1 kg of ice at 0°C to water at 0°C.",
        "बर्फ की संगलन गुप्त ऊष्मा लगभग 336000 J/kg (336 kJ/kg) है, जो 1 kg बर्फ को 0°C पर पानी में बदलने के लिए आवश्यक ऊष्मा है।",
        "medium", 1440
      ],

      ["10-science-ht-34", ["latent-heat", "steam"],
        "The approximate latent heat of vaporization of water is:",
        "जल की वाष्पीकरण गुप्त ऊष्मा लगभग कितनी होती है?",
        ["2260000 J/kg", "336000 J/kg", "4200 J/kg", "22600 J/kg"],
        ["2260000 J/kg", "336000 J/kg", "4200 J/kg", "22600 J/kg"],
        0,
        ["This is much larger than the latent heat of fusion of ice.", "यह बर्फ की संगलन गुप्त ऊष्मा से बहुत अधिक है।"],
        "The latent heat of vaporization of water is about 2260000 J/kg (2260 kJ/kg), the heat needed to convert 1 kg of water at 100°C into steam at 100°C.",
        "जल की वाष्पीकरण गुप्त ऊष्मा लगभग 2260000 J/kg (2260 kJ/kg) है, जो 1 kg जल को 100°C पर भाप में बदलने के लिए आवश्यक ऊष्मा है।",
        "medium", 1445
      ],

      ["10-science-ht-35", ["latent-heat", "mathematical"],
        "Find the heat required to melt 2 kg of ice at 0°C. (Latent heat of fusion = 336000 J/kg)",
        "0°C पर 2 kg बर्फ पिघलाने के लिए आवश्यक ऊष्मा ज्ञात कीजिए। (संगलन गुप्त ऊष्मा = 336000 J/kg)",
        ["672000 J", "336000 J", "168000 J", "1344000 J"],
        ["672000 J", "336000 J", "168000 J", "1344000 J"],
        0,
        ["Use Q = mL.", "Q = mL का उपयोग करें।"],
        "Q = mL = 2 × 336000 = 672000 J.",
        "Q = mL = 2 × 336000 = 672000 J।",
        "hard", 1570
      ],

      ["10-science-ht-36", ["latent-heat", "mathematical"],
        "Find the heat required to convert 1 kg of water at 100°C completely into steam at 100°C. (Latent heat of vaporization = 2260000 J/kg)",
        "1 kg जल को 100°C पर पूर्णतः भाप में बदलने के लिए आवश्यक ऊष्मा ज्ञात कीजिए। (वाष्पीकरण गुप्त ऊष्मा = 2260000 J/kg)",
        ["2260000 J", "1130000 J", "4520000 J", "226000 J"],
        ["2260000 J", "1130000 J", "4520000 J", "226000 J"],
        0,
        ["Use Q = mL with the vaporization value.", "वाष्पीकरण मान के साथ Q = mL का उपयोग करें।"],
        "Q = mL = 1 × 2260000 = 2260000 J.",
        "Q = mL = 1 × 2260000 = 2260000 J।",
        "hard", 1580
      ],

      ["10-science-ht-37", ["latent-heat", "conceptual"],
        "During the melting of ice at 0°C, the temperature remains constant because the heat supplied is used to:",
        "0°C पर बर्फ पिघलने के दौरान तापमान स्थिर रहता है क्योंकि दी गई ऊष्मा किसमें उपयोग होती है?",
        ["Increase the kinetic energy of molecules", "Break intermolecular bonds and change the state of matter", "Increase the mass of ice", "Get reflected back by the ice"],
        ["अणुओं की गतिज ऊर्जा बढ़ाने में", "अंतराअणुक बंधों को तोड़ने और अवस्था बदलने में", "बर्फ का द्रव्यमान बढ़ाने में", "बर्फ द्वारा वापस परावर्तित होने में"],
        1,
        ["Temperature reflects kinetic energy, which does not rise during melting.", "तापमान गतिज ऊर्जा को दर्शाता है, जो पिघलने के दौरान नहीं बढ़ती।"],
        "During melting, the supplied heat is used entirely to overcome intermolecular forces and change the state from solid to liquid, so the kinetic energy (and hence temperature) stays constant.",
        "पिघलने के दौरान, दी गई ऊष्मा पूरी तरह अंतराअणुक बलों को दूर करने और ठोस से द्रव अवस्था में बदलने में उपयोग होती है, इसलिए गतिज ऊर्जा (और तापमान) स्थिर रहता है।",
        "hard", 1560
      ],

      ["10-science-ht-38", ["latent-heat", "tricky", "conceptual"],
        "Which requires more heat: raising 1 kg of water from 0°C to 100°C, or converting the same 1 kg of water at 100°C completely into steam at 100°C?",
        "किसमें अधिक ऊष्मा लगती है: 1 kg जल को 0°C से 100°C तक गर्म करना, या उसी 1 kg जल को 100°C पर पूर्णतः भाप में बदलना?",
        ["Raising the temperature from 0°C to 100°C needs more heat", "Converting the water into steam needs more heat", "Both need equal heat", "It cannot be determined"],
        ["तापमान 0°C से 100°C बढ़ाने में अधिक ऊष्मा लगती है", "जल को भाप में बदलने में अधिक ऊष्मा लगती है", "दोनों में समान ऊष्मा लगती है", "निर्धारित नहीं किया जा सकता"],
        1,
        ["Compare mcΔT with mL using approximate values.", "लगभग मानों का उपयोग करके mcΔT की तुलना mL से करें।"],
        "Heating water from 0°C to 100°C needs Q = mcΔT = 1 × 4200 × 100 = 420000 J, while converting it to steam needs Q = mL = 1 × 2260000 = 2260000 J. The change of state needs far more heat.",
        "जल को 0°C से 100°C तक गर्म करने के लिए Q = mcΔT = 1 × 4200 × 100 = 420000 J चाहिए, जबकि इसे भाप में बदलने के लिए Q = mL = 1 × 2260000 = 2260000 J चाहिए। अवस्था परिवर्तन में कहीं अधिक ऊष्मा लगती है।",
        "hard", 1640
      ],

      ["10-science-ht-39", ["latent-heat", "application", "conceptual"],
        "Why does steam at 100°C cause more severe burns than water at 100°C?",
        "100°C पर भाप, 100°C पर जल की तुलना में अधिक गंभीर जलन क्यों पैदा करती है?",
        ["Steam is actually hotter than 100°C", "Steam releases additional latent heat of vaporization when it condenses on the skin", "Steam is denser than water", "Steam contains more oxygen than water"],
        ["भाप वास्तव में 100°C से अधिक गर्म होती है", "जब भाप त्वचा पर संघनित होती है तो यह वाष्पीकरण की अतिरिक्त गुप्त ऊष्मा मुक्त करती है", "भाप जल से अधिक घनी होती है", "भाप में जल से अधिक ऑक्सीजन होती है"],
        1,
        ["Think about what happens as steam turns back into water on contact with skin.", "सोचिए कि त्वचा के संपर्क में आने पर भाप के वापस जल में बदलने पर क्या होता है।"],
        "When steam condenses into water on the skin, it releases its large latent heat of vaporization (about 2260000 J/kg) in addition to the heat from cooling, causing more severe burns than water at the same temperature.",
        "जब भाप त्वचा पर संघनित होकर जल बनती है, तो यह ठंडी होने की ऊष्मा के अलावा वाष्पीकरण की बड़ी गुप्त ऊष्मा (लगभग 2260000 J/kg) भी मुक्त करती है, जिससे समान तापमान के जल की तुलना में अधिक गंभीर जलन होती है।",
        "hard", 1630
      ],

      ["10-science-ht-40", ["latent-heat", "mathematical", "tricky"],
        "5 kg of ice at 0°C is completely melted using 1,680,000 J of heat. Find the latent heat of fusion used in this case.",
        "1,680,000 J ऊष्मा का उपयोग करके 0°C पर 5 kg बर्फ पूर्णतः पिघलाई जाती है। इस स्थिति में उपयोग की गई संगलन गुप्त ऊष्मा ज्ञात कीजिए।",
        ["336000 J/kg", "168000 J/kg", "672000 J/kg", "84000 J/kg"],
        ["336000 J/kg", "168000 J/kg", "672000 J/kg", "84000 J/kg"],
        0,
        ["Rearrange Q = mL to find L.", "L ज्ञात करने के लिए Q = mL को पुनर्व्यवस्थित करें।"],
        "L = Q/m = 1680000/5 = 336000 J/kg, which matches the standard latent heat of fusion of ice.",
        "L = Q/m = 1680000/5 = 336000 J/kg, जो बर्फ की मानक संगलन गुप्त ऊष्मा से मेल खाता है।",
        "hard", 1595
      ],

      ["10-science-ht-41", ["thermal-expansion", "definition"],
        "Thermal expansion refers to:",
        "ऊष्मीय प्रसार किसे कहते हैं?",
        ["Change in mass of a substance with temperature", "Change in size or volume of a substance with a change in temperature", "Change in the heat capacity of a substance", "Change in density due to chemical reaction"],
        ["तापमान के साथ पदार्थ के द्रव्यमान में परिवर्तन", "तापमान बदलने पर पदार्थ के आकार या आयतन में परिवर्तन", "पदार्थ की ऊष्मा धारिता में परिवर्तन", "रासायनिक अभिक्रिया से घनत्व में परिवर्तन"],
        1,
        ["Think about railway tracks and bridges in summer versus winter.", "गर्मी और सर्दी में रेलवे पटरियों और पुलों के बारे में सोचें।"],
        "Thermal expansion is the increase (or decrease) in the size, length, or volume of a substance due to an increase (or decrease) in its temperature.",
        "ऊष्मीय प्रसार किसी पदार्थ के तापमान बढ़ने (या घटने) के कारण उसके आकार, लंबाई या आयतन में वृद्धि (या कमी) है।",
        "easy", 1410
      ],

      ["10-science-ht-42", ["thermal-expansion", "application"],
        "Small gaps are left between railway rails to allow for:",
        "रेलवे पटरियों के बीच छोटे अंतराल किसलिए छोड़े जाते हैं?",
        ["Drainage of rainwater", "Thermal expansion of the rails in summer", "Reducing the weight of tracks", "Easier installation of rails"],
        ["वर्षा जल की निकासी", "गर्मियों में पटरियों के ऊष्मीय प्रसार", "पटरियों का वजन कम करना", "पटरियों की आसान स्थापना"],
        1,
        ["Without this gap, rails could bend or buckle in hot weather.", "इस अंतराल के बिना, गर्म मौसम में पटरियाँ मुड़ या टेढ़ी हो सकती हैं।"],
        "Metal rails expand when heated in summer. Gaps are left between rail sections so that this thermal expansion does not cause the rails to bend or buckle.",
        "गर्मियों में गर्म होने पर धातु की पटरियाँ फैलती हैं। पटरियों के खंडों के बीच अंतराल छोड़ा जाता है ताकि यह ऊष्मीय प्रसार पटरियों को मोड़ने या टेढ़ा न करे।",
        "medium", 1420
      ],

      ["10-science-ht-43", ["thermal-expansion", "bimetallic-strip"],
        "A bimetallic strip works on the principle that:",
        "द्विधातु पट्टी किस सिद्धांत पर कार्य करती है?",
        ["Both metals expand equally on heating", "Two different metals expand at different rates when heated", "Metals become magnetic when heated", "Metals conduct electricity better when heated"],
        ["गर्म होने पर दोनों धातुएँ समान रूप से फैलती हैं", "गर्म होने पर दो भिन्न धातुएँ भिन्न दरों से फैलती हैं", "गर्म होने पर धातुएँ चुंबकीय बन जाती हैं", "गर्म होने पर धातुएँ बेहतर विद्युत चालन करती हैं"],
        1,
        ["This unequal expansion causes the strip to bend, which is used in thermostats.", "यह असमान प्रसार पट्टी को मोड़ देता है, जिसका उपयोग थर्मोस्टेट में होता है।"],
        "A bimetallic strip is made of two metals with different rates of thermal expansion joined together; when heated, one metal expands more than the other, causing the strip to bend. This is used in thermostats and fire alarms.",
        "द्विधातु पट्टी दो ऐसी धातुओं से बनी होती है जिनके ऊष्मीय प्रसार की दरें भिन्न होती हैं और जो साथ जुड़ी होती हैं; गर्म होने पर एक धातु दूसरी से अधिक फैलती है, जिससे पट्टी मुड़ जाती है। इसका उपयोग थर्मोस्टेट और अग्नि अलार्म में होता है।",
        "hard", 1550
      ],

      ["10-science-ht-44", ["thermal-expansion", "conceptual"],
        "For the same rise in temperature, which state of matter generally expands the most?",
        "समान तापमान वृद्धि के लिए, पदार्थ की कौन-सी अवस्था सामान्यतः सबसे अधिक फैलती है?",
        ["Solids", "Liquids", "Gases", "All expand equally"],
        ["ठोस", "द्रव", "गैस", "सभी समान रूप से फैलते हैं"],
        2,
        ["Think about how loosely particles are arranged and how easily they can spread apart.", "सोचिए कि कण कितने ढीले ढंग से व्यवस्थित हैं और कितनी आसानी से फैल सकते हैं।"],
        "Gases have the loosest particle arrangement and weakest intermolecular forces, so they expand the most for a given temperature rise, followed by liquids and then solids.",
        "गैसों में कणों की व्यवस्था सबसे ढीली होती है और अंतराअणुक बल सबसे कमजोर होते हैं, इसलिए दिए गए तापमान वृद्धि के लिए वे सबसे अधिक फैलती हैं, उसके बाद द्रव और फिर ठोस आते हैं।",
        "medium", 1465
      ],

      ["10-science-ht-45", ["thermal-expansion", "tricky", "application"],
        "A metal ball fits exactly through a metal ring at room temperature. If only the ball is heated, what happens?",
        "कमरे के तापमान पर एक धातु की गेंद एक धातु के छल्ले में ठीक से फिट होती है। यदि केवल गेंद को गर्म किया जाए, तो क्या होगा?",
        ["It still fits through the ring easily", "It no longer fits through the ring because it expands", "The ring expands more than the ball", "The ball becomes lighter and passes through easily"],
        ["यह अभी भी आसानी से छल्ले से गुजर जाएगी", "यह छल्ले से नहीं गुजरेगी क्योंकि यह फैल जाती है", "छल्ला गेंद से अधिक फैलता है", "गेंद हल्की हो जाती है और आसानी से गुजर जाती है"],
        1,
        ["Only the ball is heated here, not the ring.", "यहाँ केवल गेंद गर्म की जाती है, छल्ला नहीं।"],
        "On heating, the metal ball undergoes thermal expansion and its diameter increases, so it will no longer pass through the ring which remains at room temperature.",
        "गर्म करने पर, धातु की गेंद ऊष्मीय प्रसार से गुजरती है और इसका व्यास बढ़ जाता है, इसलिए यह कमरे के तापमान पर रहने वाले छल्ले से नहीं गुजरेगी।",
        "hard", 1585
      ],

      ["10-science-ht-46", ["anomalous-expansion", "water"],
        "The anomalous expansion of water (where it expands on cooling instead of contracting) occurs between:",
        "जल का असामान्य प्रसार (जिसमें यह ठंडा होने पर सिकुड़ने के बजाय फैलता है) किन तापमानों के बीच होता है?",
        ["0°C to 4°C", "4°C to 100°C", "100°C to 200°C", "−10°C to 0°C"],
        ["0°C से 4°C", "4°C से 100°C", "100°C से 200°C", "−10°C से 0°C"],
        0,
        ["Water is densest at 4°C, unlike most substances that are densest as solids.", "जल 4°C पर सबसे घना होता है, अधिकांश पदार्थों के विपरीत जो ठोस अवस्था में सबसे घने होते हैं।"],
        "Between 0°C and 4°C, water shows anomalous expansion — it expands instead of contracting as it is cooled, reaching maximum density at exactly 4°C.",
        "0°C और 4°C के बीच, जल असामान्य प्रसार दिखाता है — ठंडा होने पर यह सिकुड़ने के बजाय फैलता है, और ठीक 4°C पर अधिकतम घनत्व तक पहुँचता है।",
        "hard", 1545
      ],

      ["10-science-ht-47", ["anomalous-expansion", "application"],
        "Due to the anomalous expansion of water, ice floats on water because:",
        "जल के असामान्य प्रसार के कारण, बर्फ जल पर तैरती है क्योंकि:",
        ["Ice is less dense than water", "Ice is denser than water", "Ice has the same density as water", "Ice contains trapped air bubbles only"],
        ["बर्फ जल की तुलना में कम घनी होती है", "बर्फ जल की तुलना में अधिक घनी होती है", "बर्फ का घनत्व जल के समान होता है", "बर्फ में केवल फंसी हुई वायु के बुलबुले होते हैं"],
        0,
        ["Water's anomalous behaviour makes solid water expand rather than shrink.", "जल का असामान्य व्यवहार ठोस जल को सिकुड़ने के बजाय फैला देता है।"],
        "Because of anomalous expansion, water expands as it freezes, making ice less dense than liquid water, which is why ice floats.",
        "असामान्य प्रसार के कारण, जल जमने पर फैलता है, जिससे बर्फ द्रव जल की तुलना में कम घनी हो जाती है, इसीलिए बर्फ तैरती है।",
        "medium", 1450
      ],

      ["10-science-ht-48", ["anomalous-expansion", "conceptual", "application"],
        "How does the anomalous expansion of water help aquatic life survive in very cold regions during winter?",
        "जल का असामान्य प्रसार सर्दियों में बहुत ठंडे क्षेत्रों में जलीय जीवन को जीवित रहने में कैसे मदद करता है?",
        ["The top layer of a pond freezes into ice while the water below remains liquid near 4°C", "The entire pond freezes solid from top to bottom", "Fish migrate underground to survive the cold", "The surface water becomes warmer than the bottom"],
        ["तालाब की ऊपरी परत बर्फ में जम जाती है जबकि नीचे का जल लगभग 4°C पर द्रव रहता है", "पूरा तालाब ऊपर से नीचे तक ठोस जम जाता है", "मछलियाँ ठंड से बचने के लिए भूमिगत हो जाती हैं", "सतह का जल तली से अधिक गर्म हो जाता है"],
        0,
        ["Ice, being less dense, floats and insulates the water below it.", "बर्फ कम घनी होने के कारण तैरती है और उसके नीचे के जल को ऊष्मारोधित करती है।"],
        "As a pond cools, water near 4°C sinks (being densest) while colder water rises and freezes on top. This ice layer insulates the water below, which stays near 4°C, allowing aquatic life to survive.",
        "जैसे-जैसे तालाब ठंडा होता है, लगभग 4°C का जल (सबसे घना होने के कारण) नीचे बैठ जाता है जबकि ठंडा जल ऊपर उठकर जम जाता है। यह बर्फ की परत नीचे के जल को ऊष्मारोधित करती है, जो लगभग 4°C पर रहता है, जिससे जलीय जीवन जीवित रह पाता है।",
        "hard", 1600
      ],

      ["10-science-ht-49", ["thermometer", "application"],
        "Which type of thermometer is best suited for measuring very high temperatures, such as inside a furnace?",
        "भट्टी के अंदर जैसे बहुत उच्च तापमान मापने के लिए किस प्रकार का थर्मामीटर सबसे उपयुक्त है?",
        ["Mercury thermometer", "Clinical thermometer", "Pyrometer", "Alcohol thermometer"],
        ["पारा थर्मामीटर", "क्लिनिकल थर्मामीटर", "पायरोमीटर", "अल्कोहल थर्मामीटर"],
        2,
        ["Ordinary liquid-in-glass thermometers would boil or break at such temperatures.", "साधारण द्रव-कांच थर्मामीटर ऐसे तापमान पर उबल जाएँगे या टूट जाएँगे।"],
        "A pyrometer measures very high temperatures (like inside furnaces) by detecting the radiation emitted by a hot object, without needing direct contact.",
        "पायरोमीटर सीधे संपर्क की आवश्यकता के बिना गर्म वस्तु द्वारा उत्सर्जित विकिरण का पता लगाकर बहुत उच्च तापमान (जैसे भट्टियों के अंदर) मापता है।",
        "medium", 1440
      ],

      ["10-science-ht-50", ["specific-heat", "tricky", "conceptual"],
        "Bodies A and B have equal mass, but A has a higher specific heat capacity than B. If equal amounts of heat are supplied to both, which body will show a higher rise in temperature?",
        "वस्तु A और B का द्रव्यमान समान है, परंतु A की विशिष्ट ऊष्मा धारिता B से अधिक है। यदि दोनों को समान ऊष्मा दी जाए, तो किस वस्तु के तापमान में अधिक वृद्धि होगी?",
        ["Body A", "Body B", "Both will show equal rise", "Cannot be determined"],
        ["वस्तु A", "वस्तु B", "दोनों में समान वृद्धि होगी", "निर्धारित नहीं किया जा सकता"],
        1,
        ["Use ΔT = Q/(mc) and see how ΔT depends on c when Q and m are fixed.", "ΔT = Q/(mc) का उपयोग करें और देखें कि जब Q और m स्थिर हों तो ΔT, c पर कैसे निर्भर करता है।"],
        "From ΔT = Q/(mc), for the same Q and m, a higher specific heat capacity (c) gives a smaller ΔT. Since B has lower c than A, B will show a greater rise in temperature.",
        "ΔT = Q/(mc) से, समान Q और m के लिए, अधिक विशिष्ट ऊष्मा धारिता (c) से ΔT कम होता है। चूँकि B की c, A से कम है, B के तापमान में अधिक वृद्धि होगी।",
        "hard", 1650
      ],
      [
      "10-science-ht-51",
      ["heat","temperature","conceptual"],
      "Two identical metal blocks are kept in the same room for several hours. One block feels colder than the wooden table beside it when touched, even though both are at the same temperature. The correct explanation is:",
      "दो समान धातु के ब्लॉक एक ही कमरे में कई घंटों तक रखे गए हैं। उन्हें छूने पर धातु लकड़ी की मेज की तुलना में अधिक ठंडी महसूस होती है, जबकि दोनों का तापमान समान है। इसका सही कारण क्या है?",
      ["The metal has a lower temperature","The metal conducts heat away from your hand faster","The wooden table produces heat","The metal absorbs moisture from air"],
      ["धातु का तापमान कम है","धातु आपके हाथ से ऊष्मा को अधिक तेजी से स्थानांतरित करती है","लकड़ी ऊष्मा उत्पन्न करती है","धातु वायु से नमी अवशोषित करती है"],
      1,
      ["Think about the rate of heat transfer, not the temperature.","तापमान नहीं बल्कि ऊष्मा स्थानांतरण की दर पर ध्यान दें।"],
      "Metal is a better conductor of heat than wood, so it removes heat from your hand more quickly, making it feel colder.",
      "धातु लकड़ी की तुलना में ऊष्मा की बेहतर चालक होती है, इसलिए यह आपके हाथ से ऊष्मा तेजी से ले जाती है और अधिक ठंडी महसूस होती है।",
      "hard",
      1402
      ],
      
      [
      "10-science-ht-52",
      ["specific_heat","calorimetry"],
      "Equal masses of water and cooking oil are heated for the same duration using identical heaters. Which statement correctly explains why the oil reaches a higher temperature than water?",
      "समान द्रव्यमान वाले पानी और खाद्य तेल को समान समय तक समान हीटर से गर्म किया जाता है। तेल का तापमान पानी से अधिक क्यों हो जाता है?",
      ["Oil has a lower specific heat capacity than water","Oil is always hotter than water","Water absorbs no heat","Oil has a higher density"],
      ["तेल की विशिष्ट ऊष्मा क्षमता पानी से कम होती है","तेल हमेशा पानी से अधिक गर्म होता है","पानी ऊष्मा अवशोषित नहीं करता","तेल का घनत्व अधिक होता है"],
      0,
      ["Recall the meaning of specific heat capacity.","विशिष्ट ऊष्मा क्षमता का अर्थ याद करें।"],
      "Water has a much higher specific heat capacity, so it requires more heat to raise its temperature by the same amount.",
      "पानी की विशिष्ट ऊष्मा क्षमता अधिक होती है, इसलिए समान ताप वृद्धि के लिए उसे अधिक ऊष्मा की आवश्यकता होती है।",
      "hard",
      1405
      ],
      
      [
      "10-science-ht-53",
      ["thermal_expansion"],
      "During summer, long railway tracks are provided with small gaps between consecutive rails. What is the most appropriate scientific reason for this arrangement?",
      "गर्मियों में रेलवे पटरियों के बीच छोटे-छोटे अंतर छोड़े जाते हैं। इसका सबसे उपयुक्त वैज्ञानिक कारण क्या है?",
      ["To reduce friction","To allow thermal expansion of the rails","To increase train speed","To reduce the weight of tracks"],
      ["घर्षण कम करने के लिए","पटरियों के ऊष्मीय प्रसार के लिए स्थान देने हेतु","ट्रेन की गति बढ़ाने के लिए","पटरियों का भार कम करने के लिए"],
      1,
      ["Think about what happens to solids when heated.","गर्म करने पर ठोसों में क्या होता है, यह सोचें।"],
      "Metals expand on heating. Gaps prevent bending or buckling of railway tracks during hot weather.",
      "धातुएँ गर्म करने पर फैलती हैं। ये अंतर गर्म मौसम में पटरियों को मुड़ने या टेढ़ा होने से बचाते हैं।",
      "medium",
      1408
      ],
      
      [
      "10-science-ht-54",
      ["conduction","application"],
      "A person accidentally touches the handle of a metal spoon kept inside a hot cup of tea. Even though only one end is immersed, the handle becomes hot after some time because of:",
      "एक व्यक्ति गर्म चाय के कप में रखे धातु के चम्मच के हैंडल को छूता है। केवल एक सिरा चाय में डूबा होने के बावजूद कुछ समय बाद हैंडल गर्म हो जाता है। इसका कारण क्या है?",
      ["Radiation","Conduction","Convection","Reflection"],
      ["विकिरण","चालन","संवहन","परावर्तन"],
      1,
      ["Heat transfer inside solids follows a specific mode.","ठोसों में ऊष्मा स्थानांतरण की विधि याद करें।"],
      "Heat travels through solids mainly by conduction from the hot end to the cooler end.",
      "ठोसों में ऊष्मा मुख्यतः चालन द्वारा गर्म सिरे से ठंडे सिरे तक पहुँचती है।",
      "easy",
      1410
      ],
      
      [
      "10-science-ht-55",
      ["convection"],
      "Sea breeze is generally experienced during the daytime because:",
      "दिन के समय सामान्यतः समुद्री समीर क्यों चलती है?",
      ["Land cools faster than sea","Land heats faster than sea causing convection currents","Sea expands more than land","Air has no role"],
      ["भूमि समुद्र से जल्दी ठंडी होती है","भूमि समुद्र से जल्दी गर्म होती है जिससे संवहन धाराएँ बनती हैं","समुद्र भूमि से अधिक फैलता है","वायु की कोई भूमिका नहीं होती"],
      1,
      ["Compare the heating rates of land and water.","भूमि और जल के गर्म होने की दर की तुलना करें।"],
      "Land heats faster than water during the day. Warm air rises above land, and cooler air from the sea moves toward land.",
      "दिन में भूमि जल की तुलना में जल्दी गर्म होती है। भूमि के ऊपर की गर्म हवा ऊपर उठती है और समुद्र से ठंडी हवा उसकी जगह लेती है।",
      "medium",
      1413
      ],
      
      [
      "10-science-ht-56",
      ["radiation"],
      "Why is the inner surface of a thermos flask silver-coated?",
      "थर्मस फ्लास्क की अंदरूनी सतह पर चाँदी की परत क्यों चढ़ाई जाती है?",
      ["To absorb more heat","To reduce heat transfer by radiation","To increase convection","To make it heavier"],
      ["अधिक ऊष्मा अवशोषित करने के लिए","विकिरण द्वारा ऊष्मा के स्थानांतरण को कम करने के लिए","संवहन बढ़ाने के लिए","इसे भारी बनाने के लिए"],
      1,
      ["Silver is a good reflector of heat radiation.","चाँदी ऊष्मीय विकिरण की अच्छी परावर्तक होती है।"],
      "Silver reflects thermal radiation, reducing heat loss and heat gain by radiation.",
      "चाँदी ऊष्मीय विकिरण को परावर्तित करती है, जिससे विकिरण द्वारा ऊष्मा का ह्रास और प्राप्ति दोनों कम होते हैं।",
      "medium",
      1416
      ],
      
      [
      "10-science-ht-57",
      ["latent_heat"],
      "During the melting of pure ice at 0°C under normal atmospheric pressure, the temperature remains constant because:",
      "सामान्य वायुदाब पर 0°C पर शुद्ध बर्फ के पिघलने के दौरान तापमान स्थिर क्यों रहता है?",
      ["No heat is supplied","Heat is used to change the state of ice","Ice loses all its energy","Water cannot be heated"],
      ["कोई ऊष्मा नहीं दी जाती","ऊष्मा बर्फ की अवस्था बदलने में प्रयुक्त होती है","बर्फ अपनी सारी ऊर्जा खो देती है","पानी को गर्म नहीं किया जा सकता"],
      1,
      ["Think about latent heat.","गुप्त ऊष्मा के बारे में सोचें।"],
      "The supplied heat is absorbed as latent heat of fusion to change the state from solid to liquid without increasing temperature.",
      "दी गई ऊष्मा गुप्त गलन ऊष्मा के रूप में अवस्था परिवर्तन में प्रयुक्त होती है, इसलिए तापमान नहीं बढ़ता।",
      "hard",
      1420
      ],
      
      [
      "10-science-ht-58",
      ["temperature","measurement"],
      "Which of the following statements correctly distinguishes temperature from heat?",
      "निम्नलिखित में से कौन-सा कथन तापमान और ऊष्मा के बीच सही अंतर बताता है?",
      ["Temperature is a form of energy","Heat measures hotness","Temperature indicates the degree of hotness, whereas heat is energy transferred","Heat and temperature are identical"],
      ["तापमान ऊर्जा का एक रूप है","ऊष्मा गर्मी की मात्रा को मापती है","तापमान गर्म या ठंडा होने की मात्रा बताता है जबकि ऊष्मा स्थानांतरित ऊर्जा है","ऊष्मा और तापमान समान हैं"],
      2,
      ["One is a property, the other is energy in transit.","एक गुण है, दूसरा स्थानांतरित ऊर्जा।"],
      "Temperature measures the degree of hotness, while heat is energy transferred because of temperature difference.",
      "तापमान गर्म या ठंडा होने की मात्रा बताता है, जबकि ऊष्मा तापांतर के कारण स्थानांतरित ऊर्जा है।",
      "hard",
      1423
      ],
      
      [
      "10-science-ht-59",
      ["insulators"],
      "A cooking utensil has a metal body but a plastic handle. The plastic handle is used because:",
      "खाना पकाने के बर्तन का मुख्य भाग धातु का होता है लेकिन उसका हैंडल प्लास्टिक का होता है। इसका कारण क्या है?",
      ["Plastic is cheaper","Plastic is a poor conductor of heat","Plastic is heavier","Plastic melts easily"],
      ["प्लास्टिक सस्ता होता है","प्लास्टिक ऊष्मा का कुचालक होता है","प्लास्टिक अधिक भारी होता है","प्लास्टिक आसानी से पिघल जाता है"],
      1,
      ["Think about safety while handling hot utensils.","गर्म बर्तनों को पकड़ने की सुरक्षा के बारे में सोचें।"],
      "Plastic reduces heat transfer to the hand because it is a poor conductor of heat.",
      "प्लास्टिक ऊष्मा का कुचालक होता है, इसलिए यह हाथ तक ऊष्मा का स्थानांतरण कम करता है।",
      "easy",
      1426
      ],
      
      [
      "10-science-ht-60",
      ["specific_heat","application"],
      "Large water bodies help maintain moderate temperatures in nearby coastal regions mainly because water:",
      "बड़े जलाशय तटीय क्षेत्रों का तापमान संतुलित बनाए रखने में मुख्यतः इसलिए सहायता करते हैं क्योंकि पानी:",
      ["Has low density","Has high specific heat capacity","Is transparent","Evaporates quickly"],
      ["कम घनत्व रखता है","उच्च विशिष्ट ऊष्मा क्षमता रखता है","पारदर्शी होता है","शीघ्र वाष्पित होता है"],
      1,
      ["Think about how much heat water can store.","पानी कितनी ऊष्मा संग्रहित कर सकता है, यह सोचें।"],
      "Water absorbs and releases large amounts of heat with only small temperature changes.",
      "पानी कम ताप परिवर्तन के साथ अधिक मात्रा में ऊष्मा अवशोषित और उत्सर्जित कर सकता है।",
      "medium",
      1430
      ],
      
      [
      "10-science-ht-61",
      ["radiation","daily_life"],
      "Why are light-coloured clothes generally preferred during hot summer afternoons?",
      "गर्मियों की दोपहर में हल्के रंग के कपड़े पहनना क्यों उचित माना जाता है?",
      ["They absorb more heat","They reflect most of the incident heat radiation","They produce cold air","They increase body temperature"],
      ["वे अधिक ऊष्मा अवशोषित करते हैं","वे अधिकांश ऊष्मीय विकिरण को परावर्तित करते हैं","वे ठंडी हवा उत्पन्न करते हैं","वे शरीर का तापमान बढ़ाते हैं"],
      1,
      ["Think about absorption and reflection.","अवशोषण और परावर्तन के बारे में सोचें।"],
      "Light colours reflect most heat radiation and absorb less heat than dark colours.",
      "हल्के रंग अधिकांश ऊष्मीय विकिरण को परावर्तित करते हैं और गहरे रंगों की तुलना में कम ऊष्मा अवशोषित करते हैं।",
      "easy",
      1433
      ],
      
      [
      "10-science-ht-62",
      ["expansion","liquids"],
      "Before filling petrol into underground storage tanks, fuel stations usually leave some empty space. What is the primary scientific reason?",
      "भूमिगत टैंकों में पेट्रोल भरते समय कुछ खाली स्थान क्यों छोड़ा जाता है?",
      ["To reduce evaporation","To allow thermal expansion of petrol","To reduce pressure permanently","To increase fuel quality"],
      ["वाष्पीकरण कम करने के लिए","पेट्रोल के ऊष्मीय प्रसार के लिए","दाब स्थायी रूप से कम करने के लिए","ईंधन की गुणवत्ता बढ़ाने के लिए"],
      1,
      ["Liquids also expand when heated.","द्रव भी गर्म करने पर फैलते हैं।"],
      "Petrol expands on heating, so extra space prevents overflow and excessive pressure.",
      "पेट्रोल गर्म करने पर फैलता है, इसलिए अतिरिक्त स्थान अतिप्रवाह और अधिक दाब से बचाता है।",
      "medium",
      1437
      ],
      
      [
      "10-science-ht-63",
      ["convection","application"],
      "Which of the following heating appliances mainly works on the principle of convection?",
      "निम्नलिखित में से कौन-सा उपकरण मुख्यतः संवहन के सिद्धांत पर कार्य करता है?",
      ["Room heater warming surrounding air","Solar cooker","Mirror","Thermos flask"],
      ["कमरे का हीटर जो आसपास की हवा को गर्म करता है","सौर कुकर","दर्पण","थर्मस फ्लास्क"],
      0,
      ["Warm air rises while cooler air sinks.","गर्म हवा ऊपर उठती है और ठंडी हवा नीचे आती है।"],
      "Room heaters warm the surrounding air, creating convection currents that distribute heat.",
      "कमरे का हीटर हवा को गर्म करता है जिससे संवहन धाराएँ बनती हैं और ऊष्मा पूरे कमरे में फैलती है।",
      "hard",
      1441
      ],
      
      [
      "10-science-ht-64",
      ["calorimetry"],
      "A metal object and a wooden object of equal mass are heated to the same temperature. Which factor mainly determines the amount of heat stored in each object?",
      "समान द्रव्यमान वाले एक धातु और एक लकड़ी के टुकड़े को समान तापमान तक गर्म किया गया। उनमें संग्रहित ऊष्मा की मात्रा मुख्यतः किस पर निर्भर करेगी?",
      ["Colour","Specific heat capacity","Shape","Volume only"],
      ["रंग","विशिष्ट ऊष्मा क्षमता","आकार","केवल आयतन"],
      1,
      ["Remember the formula involving mass, specific heat and temperature change.","द्रव्यमान, विशिष्ट ऊष्मा और ताप परिवर्तन वाला सूत्र याद करें।"],
      "Heat stored depends on mass, specific heat capacity and temperature change.",
      "संग्रहित ऊष्मा द्रव्यमान, विशिष्ट ऊष्मा क्षमता तथा ताप परिवर्तन पर निर्भर करती है।",
      "hard",
      1446
      ],
      
      [
      "10-science-ht-65",
      ["temperature","application"],
      "A clinical thermometer cannot be used to measure the temperature of boiling water because:",
      "क्लिनिकल थर्मामीटर का उपयोग उबलते पानी का तापमान मापने के लिए क्यों नहीं किया जा सकता?",
      ["It is too short","Its temperature range is limited","Water damages glass instantly","It has no mercury"],
      ["यह बहुत छोटा होता है","इसकी तापमान सीमा सीमित होती है","पानी तुरंत काँच को नुकसान पहुँचाता है","इसमें पारा नहीं होता"],
      1,
      ["Recall the normal temperature range of a clinical thermometer.","क्लिनिकल थर्मामीटर की सामान्य तापमान सीमा याद करें।"],
      "A clinical thermometer is designed only for human body temperatures and cannot measure boiling water safely.",
      "क्लिनिकल थर्मामीटर केवल मानव शरीर के तापमान के लिए बनाया जाता है और उबलते पानी का तापमान सुरक्षित रूप से नहीं माप सकता।",
      "medium",
      1450
      ],
      
      [
      "10-science-ht-66",
      ["latent_heat","evaporation"],
      "When sweat evaporates from the surface of the human body, a cooling sensation is experienced because:",
      "मानव शरीर की सतह से पसीना वाष्पित होने पर ठंडक क्यों महसूस होती है?",
      ["The body produces cold energy","Evaporation absorbs latent heat from the body","The air temperature decreases instantly","Sweat becomes ice"],
      ["शरीर ठंडी ऊर्जा उत्पन्न करता है","वाष्पीकरण शरीर से गुप्त ऊष्मा अवशोषित करता है","वायु का तापमान तुरंत घट जाता है","पसीना बर्फ बन जाता है"],
      1,
      ["Evaporation requires energy.","वाष्पीकरण के लिए ऊर्जा की आवश्यकता होती है।"],
      "During evaporation, sweat absorbs latent heat from the body, producing a cooling effect.",
      "वाष्पीकरण के दौरान पसीना शरीर से गुप्त ऊष्मा अवशोषित करता है जिससे ठंडक महसूस होती है।",
      "medium",
      1455
      ],
      
      [
      "10-science-ht-67",
      ["conductors","comparison"],
      "Among copper, aluminium, wood and plastic, which material is the most suitable for making the base of a cooking utensil and why?",
      "ताँबा, एल्युमिनियम, लकड़ी और प्लास्टिक में से खाना पकाने के बर्तन का आधार बनाने के लिए कौन-सा पदार्थ सबसे उपयुक्त है और क्यों?",
      ["Wood because it is light","Copper because it is an excellent conductor of heat","Plastic because it is cheap","Aluminium because it is transparent"],
      ["लकड़ी क्योंकि यह हल्की है","ताँबा क्योंकि यह ऊष्मा का उत्कृष्ट चालक है","प्लास्टिक क्योंकि यह सस्ता है","एल्युमिनियम क्योंकि यह पारदर्शी है"],
      1,
      ["Think about efficient heat transfer.","ऊष्मा के कुशल स्थानांतरण के बारे में सोचें।"],
      "Copper transfers heat rapidly and uniformly, making it ideal for cooking utensil bases.",
      "ताँबा ऊष्मा को तेजी और समान रूप से स्थानांतरित करता है, इसलिए यह बर्तनों के आधार के लिए उपयुक्त है।",
      "hard",
      1462
      ],
      
      [
      "10-science-ht-68",
      ["heat_transfer","mixed_concepts"],
      "In a vacuum flask, heat transfer is minimized because conduction, convection and radiation are all reduced using different design features. Which feature mainly prevents convection?",
      "वैक्यूम फ्लास्क में चालन, संवहन और विकिरण तीनों को अलग-अलग तरीकों से कम किया जाता है। इनमें संवहन को मुख्यतः कौन-सी विशेषता रोकती है?",
      ["Silver coating","Vacuum between the walls","Plastic cap only","Glass colour"],
      ["चाँदी की परत","दीवारों के बीच निर्वात","केवल प्लास्टिक ढक्कन","काँच का रंग"],
      1,
      ["Convection requires a material medium.","संवहन के लिए माध्यम आवश्यक होता है।"],
      "A vacuum contains no particles, so convection cannot occur between the walls.",
      "निर्वात में कोई कण नहीं होते, इसलिए दीवारों के बीच संवहन नहीं हो सकता।",
      "hard",
      1474
      ],
      
      [
      "10-science-ht-69",
      ["higher_order","reasoning"],
      "A scientist heats two different substances with the same heater for equal time intervals. One substance shows a much smaller rise in temperature than the other. Which conclusion is scientifically correct?",
      "एक वैज्ञानिक समान शक्ति वाले हीटर से दो अलग-अलग पदार्थों को समान समय तक गर्म करता है। एक पदार्थ का तापमान दूसरे की तुलना में बहुत कम बढ़ता है। कौन-सा निष्कर्ष वैज्ञानिक रूप से सही है?",
      ["The first substance has a higher specific heat capacity","The first substance received less heat","The heater stopped working","The thermometer is necessarily faulty"],
      ["पहले पदार्थ की विशिष्ट ऊष्मा क्षमता अधिक है","पहले पदार्थ ने कम ऊष्मा प्राप्त की","हीटर काम करना बंद कर गया","थर्मामीटर अवश्य ही खराब है"],
      0,
      ["Relate temperature rise to specific heat capacity.","ताप वृद्धि को विशिष्ट ऊष्मा क्षमता से जोड़ें।"],
      "For equal heat supplied, a smaller temperature rise indicates a higher specific heat capacity.",
      "समान ऊष्मा मिलने पर कम ताप वृद्धि का अर्थ है कि उस पदार्थ की विशिष्ट ऊष्मा क्षमता अधिक है।",
      "hard",
      1492
      ],
      
      [
      "10-science-ht-70",
      ["heat","reasoning","advanced"],
      "A student observes that equal amounts of heat are supplied to two solid objects of equal mass. One object shows a greater increase in temperature than the other. Which statement best explains this observation according to the concept of specific heat capacity?",
      "एक छात्र देखता है कि समान द्रव्यमान वाली दो ठोस वस्तुओं को समान मात्रा में ऊष्मा दी जाती है। एक वस्तु का तापमान दूसरी की तुलना में अधिक बढ़ जाता है। विशिष्ट ऊष्मा क्षमता की अवधारणा के अनुसार इसका सबसे उपयुक्त स्पष्टीकरण क्या है?",
      ["The object with greater temperature rise has lower specific heat capacity","Both objects have the same specific heat capacity","The hotter object absorbed less heat","Temperature rise is independent of the material"],
      ["जिस वस्तु का तापमान अधिक बढ़ा उसकी विशिष्ट ऊष्मा क्षमता कम है","दोनों वस्तुओं की विशिष्ट ऊष्मा क्षमता समान है","अधिक गर्म वस्तु ने कम ऊष्मा अवशोषित की","ताप वृद्धि पदार्थ पर निर्भर नहीं करती"],
      0,
      ["Use the relation Q = mcΔT.","Q = mcΔT संबंध का उपयोग करें।"],
      "For equal heat and mass, the substance with lower specific heat capacity undergoes a greater temperature rise.",
      "समान ऊष्मा और द्रव्यमान होने पर कम विशिष्ट ऊष्मा क्षमता वाले पदार्थ का तापमान अधिक बढ़ता है।",
      "hard",
      1498
      ],
    [
    "10-science-ht-71",
    ["heat", "specific_heat", "numerical"],
    "A student supplies 8400 J of heat to a 2 kg block of an unknown substance. If the temperature of the block increases uniformly from 25°C to 35°C without any heat loss to the surroundings, what is the specific heat capacity of the substance?",
    "एक छात्र 2 kg द्रव्यमान वाले एक अज्ञात पदार्थ के ब्लॉक को 8400 J ऊष्मा प्रदान करता है। यदि ब्लॉक का तापमान 25°C से 35°C तक समान रूप से बढ़ता है तथा परिवेश में कोई ऊष्मा हानि नहीं होती है, तो उस पदार्थ की विशिष्ट ऊष्मा क्षमता क्या होगी?",
    ["210 J/kg°C", "420 J/kg°C", "840 J/kg°C", "1680 J/kg°C"],
    ["210 J/kg°C", "420 J/kg°C", "840 J/kg°C", "1680 J/kg°C"],
    1,
    [
      "Use the equation Q = mcΔT and substitute the given values carefully.",
      "Q = mcΔT सूत्र का प्रयोग करें और दिए गए मानों को सावधानीपूर्वक रखें।"
    ],
    "Using Q = mcΔT, c = 8400/(2×10) = 420 J/kg°C.",
    "Q = mcΔT के अनुसार, c = 8400/(2×10) = 420 J/kg°C।",
    "hard",
    1451
  ],

  [
    "10-science-ht-72",
    ["heat", "specific_heat", "comparison"],
    "Two equal masses of copper and aluminium are heated by supplying the same amount of heat. The temperature of aluminium increases less than that of copper. Which conclusion is scientifically correct?",
    "ताँबे और एल्युमिनियम के समान द्रव्यमान को समान मात्रा में ऊष्मा दी जाती है। एल्युमिनियम का तापमान ताँबे की तुलना में कम बढ़ता है। वैज्ञानिक दृष्टि से सही निष्कर्ष क्या होगा?",
    [
      "Aluminium has a higher specific heat capacity than copper",
      "Copper absorbs no heat",
      "Aluminium has a lower mass",
      "Copper has a higher melting point"
    ],
    [
      "एल्युमिनियम की विशिष्ट ऊष्मा क्षमता ताँबे से अधिक है",
      "ताँबा ऊष्मा अवशोषित नहीं करता",
      "एल्युमिनियम का द्रव्यमान कम है",
      "ताँबे का गलनांक अधिक है"
    ],
    0,
    [
      "For equal heat and mass, compare ΔT using Q = mcΔT.",
      "समान ऊष्मा और द्रव्यमान के लिए Q = mcΔT का प्रयोग करें।"
    ],
    "Smaller temperature rise indicates higher specific heat capacity.",
    "कम ताप वृद्धि अधिक विशिष्ट ऊष्मा क्षमता को दर्शाती है।",
    "hard",
    1452
  ],

  [
    "10-science-ht-73",
    ["temperature", "conversion", "numerical"],
    "A laboratory thermometer shows 68°F. Assuming the thermometer is calibrated correctly, what is the corresponding temperature on the Celsius scale?",
    "एक प्रयोगशाला थर्मामीटर का पाठन 68°F है। यदि थर्मामीटर सही प्रकार से कैलिब्रेट किया गया है, तो सेल्सियस पैमाने पर इसका तापमान कितना होगा?",
    ["10°C", "20°C", "30°C", "40°C"],
    ["10°C", "20°C", "30°C", "40°C"],
    1,
    [
      "Use C = (F − 32) × 5/9.",
      "C = (F − 32) × 5/9 का प्रयोग करें।"
    ],
    "C = (68−32)×5/9 = 20°C.",
    "C = (68−32)×5/9 = 20°C।",
    "medium",
    1453
  ],

  [
    "10-science-ht-74",
    ["latent_heat", "numerical"],
    "How much heat is required to completely melt 5 kg of ice at 0°C into water at 0°C? (Latent heat of fusion of ice = 3.36 × 10⁵ J/kg)",
    "0°C पर स्थित 5 kg बर्फ को 0°C पर पानी में पूरी तरह बदलने के लिए कितनी ऊष्मा की आवश्यकता होगी? (बर्फ की गुप्त गलन ऊष्मा = 3.36 × 10⁵ J/kg)",
    [
      "1.68 × 10⁶ J",
      "3.36 × 10⁵ J",
      "8.40 × 10⁵ J",
      "6.72 × 10⁵ J"
    ],
    [
      "1.68 × 10⁶ J",
      "3.36 × 10⁵ J",
      "8.40 × 10⁵ J",
      "6.72 × 10⁵ J"
    ],
    0,
    [
      "Apply Q = mL.",
      "Q = mL का प्रयोग करें।"
    ],
    "Q = 5 × 3.36 × 10⁵ = 1.68 × 10⁶ J.",
    "Q = 5 × 3.36 × 10⁵ = 1.68 × 10⁶ J।",
    "hard",
    1455
  ],

  [
    "10-science-ht-75",
    ["calorimetry", "reasoning"],
    "A hot iron ball and a hot copper ball have equal masses and are initially at the same temperature. Both are placed separately into equal quantities of water at room temperature. Which ball will generally increase the water temperature more?",
    "समान द्रव्यमान वाले एक गर्म लोहे के गोले और एक गर्म ताँबे के गोले का प्रारम्भिक तापमान समान है। दोनों को अलग-अलग समान मात्रा के कमरे के तापमान वाले पानी में डाला जाता है। सामान्यतः कौन-सा गोला पानी का तापमान अधिक बढ़ाएगा?",
    [
      "Iron ball",
      "Copper ball",
      "Both increase equally",
      "Cannot be determined"
    ],
    [
      "लोहे का गोला",
      "ताँबे का गोला",
      "दोनों समान रूप से बढ़ाएँगे",
      "निर्धारित नहीं किया जा सकता"
    ],
    0,
    [
      "Compare the specific heat capacities of iron and copper.",
      "लोहे और ताँबे की विशिष्ट ऊष्मा क्षमता की तुलना करें।"
    ],
    "Iron has a higher specific heat capacity than copper, so it contains more heat energy at the same temperature.",
    "लोहे की विशिष्ट ऊष्मा क्षमता ताँबे से अधिक होती है, इसलिए समान तापमान पर उसमें अधिक ऊष्मा ऊर्जा होती है।",
    "hard",
    1458
  ],

  [
    "10-science-ht-76",
    ["graph", "reasoning"],
    "A heating graph of pure ice shows that the temperature remains constant for several minutes while heating continuously. What does this horizontal portion of the graph represent?",
    "शुद्ध बर्फ के ताप-समय ग्राफ में लगातार गर्म करने पर कुछ समय तक तापमान स्थिर रहता है। ग्राफ का यह क्षैतिज भाग क्या दर्शाता है?",
    [
      "Heat loss",
      "Latent heat of fusion",
      "Decrease in mass",
      "Decrease in pressure"
    ],
    [
      "ऊष्मा हानि",
      "गुप्त गलन ऊष्मा",
      "द्रव्यमान में कमी",
      "दाब में कमी"
    ],
    1,
    [
      "Think about why temperature does not rise during melting.",
      "गलन के समय तापमान क्यों नहीं बढ़ता, इस पर विचार करें।"
    ],
    "The supplied heat is used for changing the state of ice instead of increasing its temperature.",
    "दी गई ऊष्मा तापमान बढ़ाने के बजाय बर्फ की अवस्था बदलने में प्रयुक्त होती है।",
    "hard",
    1460
  ],

  [
    "10-science-ht-77",
    ["temperature", "logic"],
    "A student says, 'The temperature of boiling water is always higher than the temperature of steam.' Which statement correctly evaluates this claim?",
    "एक छात्र कहता है, 'उबलते पानी का तापमान हमेशा भाप के तापमान से अधिक होता है।' इस कथन का सही मूल्यांकन क्या है?",
    [
      "The statement is correct",
      "The statement is incorrect because boiling water and steam can both be at 100°C under normal atmospheric pressure",
      "Steam is always at 200°C",
      "Steam has no temperature"
    ],
    [
      "कथन सही है",
      "कथन गलत है क्योंकि सामान्य वायुदाब पर उबलता पानी और भाप दोनों 100°C पर हो सकते हैं",
      "भाप हमेशा 200°C पर होती है",
      "भाप का कोई तापमान नहीं होता"
    ],
    1,
    [
      "Think about the boiling point of water.",
      "पानी के क्वथनांक के बारे में सोचें।"
    ],
    "At normal atmospheric pressure, both boiling water and steam may exist together at 100°C.",
    "सामान्य वायुदाब पर उबलता पानी और भाप दोनों 100°C पर एक साथ हो सकते हैं।",
    "hard",
    1465
  ],

  [
    "10-science-ht-78",
    ["mixing", "numerical"],
    "Equal masses of water at 80°C and 20°C are mixed in an insulated container. Assuming no heat loss, what will be the final temperature of the mixture?",
    "80°C और 20°C तापमान वाले समान द्रव्यमान के पानी को एक ऊष्मारोधी पात्र में मिलाया जाता है। यदि कोई ऊष्मा हानि न हो, तो मिश्रण का अंतिम तापमान कितना होगा?",
    [
      "40°C",
      "45°C",
      "50°C",
      "60°C"
    ],
    [
      "40°C",
      "45°C",
      "50°C",
      "60°C"
    ],
    2,
    [
      "Equal masses of the same substance reach the average temperature.",
      "समान द्रव्यमान वाले समान पदार्थ का अंतिम तापमान औसत होता है।"
    ],
    "Final temperature = (80 + 20)/2 = 50°C.",
    "अंतिम तापमान = (80 + 20)/2 = 50°C।",
    "medium",
    1470
  ],

  [
    "10-science-ht-79",
    ["thermal_expansion", "logic"],
    "A glass bottle filled completely with water is kept inside a freezer. After several hours, the bottle cracks. Which scientific explanation is the most appropriate?",
    "पानी से पूरी तरह भरी काँच की बोतल को फ्रीजर में रखा जाता है। कुछ घंटों बाद बोतल टूट जाती है। इसका सबसे उपयुक्त वैज्ञानिक कारण क्या है?",
    [
      "Water contracts while freezing",
      "Ice occupies more volume than water",
      "Glass expands faster than ice",
      "The bottle absorbs excessive heat"
    ],
    [
      "पानी जमने पर सिकुड़ता है",
      "बर्फ पानी की तुलना में अधिक आयतन घेरती है",
      "काँच बर्फ से अधिक फैलता है",
      "बोतल अत्यधिक ऊष्मा अवशोषित करती है"
    ],
    1,
    [
      "Remember the unusual property of water.",
      "पानी के असामान्य गुण को याद करें।"
    ],
    "Water expands on freezing, increasing its volume and exerting pressure on the glass bottle.",
    "पानी जमने पर फैलता है, जिससे उसका आयतन बढ़ता है और बोतल पर अधिक दाब पड़ता है।",
    "hard",
    1480
  ],

  [
    "10-science-ht-80",
    ["heat", "multi_concept", "numerical"],
    "A 500 g aluminium vessel (specific heat capacity = 900 J/kg°C) contains 2 kg of water. Both are heated together from 20°C to 30°C. Neglecting heat loss, approximately how much total heat is required? (Specific heat capacity of water = 4200 J/kg°C)",
    "500 g एल्युमिनियम के बर्तन (विशिष्ट ऊष्मा क्षमता = 900 J/kg°C) में 2 kg पानी है। दोनों को 20°C से 30°C तक साथ में गर्म किया जाता है। ऊष्मा हानि नगण्य मानते हुए कुल कितनी ऊष्मा की आवश्यकता होगी? (पानी की विशिष्ट ऊष्मा क्षमता = 4200 J/kg°C)",
    [
      "88,500 J",
      "84,500 J",
      "42,000 J",
      "90,000 J"
    ],
    [
      "88,500 J",
      "84,500 J",
      "42,000 J",
      "90,000 J"
    ],
    0,
    [
      "Calculate heat required for both water and vessel separately, then add them.",
      "पहले पानी और बर्तन दोनों के लिए अलग-अलग ऊष्मा निकालें, फिर जोड़ें।"
    ],
    "Water: 2×4200×10 = 84,000 J. Vessel: 0.5×900×10 = 4,500 J. Total = 88,500 J.",
    "पानी: 2×4200×10 = 84,000 J। बर्तन: 0.5×900×10 = 4,500 J। कुल = 88,500 J।",
    "expert",
    1498
  ],
       [
    "10-science-ht-81",
    ["calorimetry", "specific_heat", "numerical", "case_study"],
    "A science teacher places a 2 kg aluminium block at 80°C into an insulated calorimeter containing 4 kg of water at 20°C. Assume there is no heat loss to the surroundings. The specific heat capacity of aluminium is 900 J/kg°C and that of water is 4200 J/kg°C. Which of the following temperatures is closest to the final equilibrium temperature of the system?",
    "एक विज्ञान शिक्षक 80°C तापमान वाले 2 kg एल्युमिनियम ब्लॉक को 20°C तापमान वाले 4 kg पानी से भरे ऊष्मारोधी कैलोरीमीटर में डालता है। मान लें कि परिवेश में कोई ऊष्मा हानि नहीं होती। एल्युमिनियम की विशिष्ट ऊष्मा क्षमता 900 J/kg°C तथा पानी की 4200 J/kg°C है। निम्नलिखित में से कौन-सा तापमान अंतिम संतुलन तापमान के सबसे निकट होगा?",
    ["35°C","62°C","24.8°C","50°C"],
    ["35°C","62°C","24.8°C","50°C"],
         2,
    [
      "Equate the heat lost by aluminium to the heat gained by water.",
      "एल्युमिनियम द्वारा खोई गई ऊष्मा = पानी द्वारा प्राप्त ऊष्मा रखें।"
    ],
    "Using m₁c₁(T₁−T)=m₂c₂(T−T₂), the equilibrium temperature is approximately 24.8°C because water has a much larger heat capacity.",
    "m₁c₁(T₁−T)=m₂c₂(T−T₂) लगाने पर अंतिम संतुलन तापमान लगभग 24.8°C प्राप्त होता है क्योंकि पानी की ऊष्मा धारिता बहुत अधिक होती है।",
    "expert",
    1504
  ],

  [
    "10-science-ht-82",
    ["latent_heat", "multi_step", "numerical"],
    "A laboratory experiment requires converting 2 kg of ice at −10°C into water at 20°C. Assume the specific heat capacity of ice is 2100 J/kg°C, the latent heat of fusion of ice is 3.36 × 10⁵ J/kg, and the specific heat capacity of water is 4200 J/kg°C. Which of the following is the closest value of the total heat required?",
    "एक प्रयोगशाला में −10°C तापमान वाली 2 kg बर्फ को 20°C तापमान वाले पानी में बदलना है। मान लें कि बर्फ की विशिष्ट ऊष्मा क्षमता 2100 J/kg°C, बर्फ की गुप्त गलन ऊष्मा 3.36 × 10⁵ J/kg तथा पानी की विशिष्ट ऊष्मा क्षमता 4200 J/kg°C है। कुल आवश्यक ऊष्मा का सबसे निकट मान कौन-सा होगा?",
    ["5.04 × 10⁵ J","8.82 × 10⁵ J","9.90 × 10⁵ J","6.72 × 10⁵ J"],
    ["5.04 × 10⁵ J","8.82 × 10⁵ J","9.90 × 10⁵ J","6.72 × 10⁵ J"],
    1,
    [
      "Solve in three stages: warm the ice, melt it, then heat the water.",
      "प्रश्न को तीन चरणों में हल करें—बर्फ को 0°C तक गर्म करें, पिघलाएँ, फिर पानी को 20°C तक गर्म करें।"
    ],
    "Total heat = (2×2100×10) + (2×3.36×10⁵) + (2×4200×20) = 42,000 + 672,000 + 168,000 = 882,000 J.",
    "कुल ऊष्मा = (2×2100×10) + (2×3.36×10⁵) + (2×4200×20) = 42,000 + 672,000 + 168,000 = 8.82 × 10⁵ J।",
    "expert",
    1518
  ],

  [
    "10-science-ht-83",
    ["temperature", "reasoning", "experimental", "graph"],
    "A student heats equal masses of copper, iron and aluminium using identical heaters for exactly five minutes. The observed temperature rises are 65°C, 48°C and 30°C respectively. Assuming negligible heat loss and equal heat supplied, which sequence correctly represents the order of their specific heat capacities from highest to lowest?",
    "एक छात्र समान द्रव्यमान वाले ताँबा, लोहा तथा एल्युमिनियम को समान शक्ति वाले हीटर से ठीक पाँच मिनट तक गर्म करता है। प्राप्त ताप वृद्धि क्रमशः 65°C, 48°C तथा 30°C है। यदि ऊष्मा हानि नगण्य हो और सभी को समान ऊष्मा प्राप्त हुई हो, तो उनकी विशिष्ट ऊष्मा क्षमताओं का उच्चतम से निम्नतम सही क्रम कौन-सा होगा?",
    [
      "Aluminium > Iron > Copper",
      "Copper > Iron > Aluminium",
      "Iron > Copper > Aluminium",
      "Aluminium > Copper > Iron"
    ],
    [
      "एल्युमिनियम > लोहा > ताँबा",
      "ताँबा > लोहा > एल्युमिनियम",
      "लोहा > ताँबा > एल्युमिनियम",
      "एल्युमिनियम > ताँबा > लोहा"
    ],
    0,
    [
      "For equal heat supplied, smaller temperature rise means larger specific heat capacity.",
      "समान ऊष्मा मिलने पर जिस पदार्थ की ताप वृद्धि कम होती है उसकी विशिष्ट ऊष्मा क्षमता अधिक होती है।"
    ],
    "Since ΔT is inversely proportional to specific heat capacity for equal heat and mass, Aluminium has the highest specific heat capacity followed by Iron and then Copper.",
    "समान ऊष्मा और द्रव्यमान के लिए ΔT विशिष्ट ऊष्मा क्षमता के व्युत्क्रमानुपाती होती है। इसलिए एल्युमिनियम > लोहा > ताँबा।",
    "expert",
    1532
  ],
      [
    "10-science-ht-84",
    ["calorimetry", "latent_heat", "multi_step", "case_study"],
    "A laboratory assistant accidentally drops a 1 kg piece of ice at 0°C into an insulated container holding 5 kg of water at 40°C. Assume there is no heat exchange with the surroundings. (Specific heat capacity of water = 4200 J/kg°C and latent heat of fusion of ice = 3.36 × 10⁵ J/kg). Which of the following is the closest value of the final equilibrium temperature of the mixture?",
    "एक प्रयोगशाला सहायक गलती से 0°C पर रखी 1 kg बर्फ को 40°C तापमान वाले 5 kg पानी से भरे ऊष्मारोधी पात्र में डाल देता है। मान लें कि परिवेश से कोई ऊष्मा का आदान-प्रदान नहीं होता। (पानी की विशिष्ट ऊष्मा क्षमता = 4200 J/kg°C तथा बर्फ की गुप्त गलन ऊष्मा = 3.36 × 10⁵ J/kg)। मिश्रण का अंतिम संतुलन तापमान निम्न में से किसके सबसे निकट होगा?",
    [
      "16°C",
      "20°C",
      "24°C",
      "28°C"
    ],
    [
      "16°C",
      "20°C",
      "24°C",
      "28°C"
    ],
    2,
    [
      "First use part of the heat to melt the ice, then use the remaining heat to warm the melted water.",
      "पहले बर्फ को पिघलाने में ऊष्मा का उपयोग करें, फिर बची हुई ऊष्मा से पिघले हुए पानी का तापमान बढ़ाएँ।"
    ],
    "Heat lost by warm water = Heat required to melt ice + Heat required to raise the melted water to the final temperature. Solving the calorimetry equation gives an equilibrium temperature close to 24°C.",
    "गर्म पानी द्वारा खोई गई ऊष्मा = बर्फ को पिघलाने में लगी ऊष्मा + पिघले हुए पानी को अंतिम तापमान तक गर्म करने में लगी ऊष्मा। समीकरण हल करने पर अंतिम तापमान लगभग 24°C प्राप्त होता है।",
    "expert",
    1542
  ],

  [
    "10-science-ht-85",
    ["specific_heat", "experimental", "graph", "reasoning"],
    "Three different metal blocks P, Q and R of equal mass are heated using identical electric heaters for the same duration. Their observed temperature increases are 18°C, 30°C and 45°C respectively. Assuming negligible heat loss, which arrangement correctly represents the order of their specific heat capacities from lowest to highest?",
    "समान द्रव्यमान वाले तीन धातु ब्लॉक P, Q तथा R को समान शक्ति वाले विद्युत हीटर से समान समय तक गर्म किया गया। उनके तापमान में क्रमशः 18°C, 30°C तथा 45°C की वृद्धि हुई। यदि ऊष्मा हानि नगण्य हो, तो उनकी विशिष्ट ऊष्मा क्षमताओं का निम्नतम से उच्चतम सही क्रम कौन-सा होगा?",
    [
      "P < R < Q",
      "Q < P < R",
      "R < Q < P",
      "Q < R < P"
    ],
    [
      "P < R < Q",
      "Q < P < R",
      "R < Q < P",
      "Q < R < P"
    ],
    2,
    [
      "For equal heat supplied, the greater the temperature rise, the lower the specific heat capacity.",
      "समान ऊष्मा मिलने पर ताप वृद्धि जितनी अधिक होगी, विशिष्ट ऊष्मा क्षमता उतनी कम होगी।"
    ],
    "R shows the highest temperature rise, so it has the lowest specific heat capacity. P shows the least rise, so it has the highest. Therefore, the order is R < Q < P.",
    "R का तापमान सबसे अधिक बढ़ा, इसलिए उसकी विशिष्ट ऊष्मा क्षमता सबसे कम है। P का तापमान सबसे कम बढ़ा, इसलिए उसकी विशिष्ट ऊष्मा क्षमता सबसे अधिक है। अतः सही क्रम R < Q < P है।",
    "expert",
    1568
  ],
      [
    "10-science-ht-86",
    ["calorimetry", "multi_step", "case_study", "numerical"],
    "During a laboratory activity, a student places a 3 kg copper block at 150°C into an insulated calorimeter containing 2 kg of water at 25°C. Assume there is no heat loss to the surroundings. (Specific heat capacity of copper = 390 J/kg°C and water = 4200 J/kg°C). Which of the following is the closest value of the final equilibrium temperature?",
    "एक प्रयोगशाला गतिविधि के दौरान, एक छात्र 150°C तापमान वाले 3 kg ताँबे के ब्लॉक को 25°C तापमान वाले 2 kg पानी से भरे ऊष्मारोधी कैलोरीमीटर में डालता है। मान लें कि परिवेश में कोई ऊष्मा हानि नहीं होती। (ताँबे की विशिष्ट ऊष्मा क्षमता = 390 J/kg°C तथा पानी की = 4200 J/kg°C)। निम्नलिखित में से अंतिम संतुलन तापमान का सबसे निकट मान कौन-सा है?",
    [
      "46°C",
      "34°C",
      "58°C",
      "72°C"
    ],
    [
      "46°C",
      "34°C",
      "58°C",
      "72°C"
    ],
    1,
    [
      "Apply the principle of conservation of heat: Heat lost = Heat gained.",
      "ऊष्मा संरक्षण का सिद्धांत लागू करें: खोई गई ऊष्मा = प्राप्त ऊष्मा।"
    ],
    "Using m₁c₁(T₁−T)=m₂c₂(T−T₂), the equilibrium temperature is approximately 34°C because water has a much larger heat capacity than copper.",
    "m₁c₁(T₁−T)=m₂c₂(T−T₂) लगाने पर अंतिम संतुलन तापमान लगभग 34°C प्राप्त होता है क्योंकि पानी की ऊष्मा धारिता ताँबे की तुलना में बहुत अधिक होती है।",
    "expert",
    1584
  ],

  [
    "10-science-ht-87",
    ["latent_heat", "reasoning", "graph", "experimental"],
    "A heating curve of a pure substance shows two horizontal portions. The first occurs at 0°C and the second at 100°C under normal atmospheric pressure. Which statement correctly explains these two constant-temperature regions?",
    "सामान्य वायुदाब पर किसी शुद्ध पदार्थ के तापन वक्र में दो क्षैतिज भाग दिखाई देते हैं। पहला 0°C पर तथा दूसरा 100°C पर है। इन दोनों स्थिर तापमान वाले भागों का सही वैज्ञानिक कारण क्या है?",
    [
      "Both regions represent heat loss.",
      "Both regions indicate that the thermometer is faulty.",
      "The first represents latent heat of fusion and the second represents latent heat of vaporisation.",
      "Both regions indicate no heat is supplied."
    ],
    [
      "दोनों भाग ऊष्मा हानि को दर्शाते हैं।",
      "दोनों भाग दर्शाते हैं कि थर्मामीटर खराब है।",
      "पहला भाग गुप्त गलन ऊष्मा तथा दूसरा भाग गुप्त वाष्पन ऊष्मा को दर्शाता है।",
      "दोनों भागों में कोई ऊष्मा नहीं दी जाती।"
    ],
    2,
    [
      "Think about the phase changes occurring at 0°C and 100°C.",
      "0°C और 100°C पर होने वाले अवस्था परिवर्तन के बारे में सोचें।"
    ],
    "At 0°C the supplied heat changes ice into water (latent heat of fusion), while at 100°C the supplied heat changes water into steam (latent heat of vaporisation).",
    "0°C पर दी गई ऊष्मा बर्फ को पानी में बदलती है (गुप्त गलन ऊष्मा), जबकि 100°C पर दी गई ऊष्मा पानी को भाप में बदलती है (गुप्त वाष्पन ऊष्मा)।",
    "expert",
    1598
  ],

  [
    "10-science-ht-88",
    ["specific_heat", "higher_order", "paper_solving", "logic"],
    "Four identical electric heaters supply exactly the same amount of heat to four different substances A, B, C and D of equal mass. Their observed temperature rises are 80°C, 55°C, 35°C and 20°C respectively. If these substances are arranged in increasing order of their specific heat capacities, which option is correct?",
    "चार समान विद्युत हीटर समान द्रव्यमान वाले चार अलग-अलग पदार्थ A, B, C तथा D को बिल्कुल समान मात्रा में ऊष्मा प्रदान करते हैं। उनके तापमान में क्रमशः 80°C, 55°C, 35°C तथा 20°C की वृद्धि होती है। यदि इन पदार्थों को उनकी विशिष्ट ऊष्मा क्षमता के बढ़ते क्रम में व्यवस्थित किया जाए, तो सही विकल्प कौन-सा होगा?",
    [
      "D < C < B < A",
      "A < B < C < D",
      "B < A < D < C",
      "C < D < A < B"
    ],
    [
      "D < C < B < A",
      "A < B < C < D",
      "B < A < D < C",
      "C < D < A < B"
    ],
    1,
    [
      "For equal heat supplied, specific heat capacity is inversely proportional to temperature rise.",
      "समान ऊष्मा मिलने पर विशिष्ट ऊष्मा क्षमता ताप वृद्धि के व्युत्क्रमानुपाती होती है।"
    ],
    "Since A shows the highest temperature rise, it has the lowest specific heat capacity, while D has the highest. Therefore the increasing order is A < B < C < D.",
    "A का तापमान सबसे अधिक बढ़ा, इसलिए उसकी विशिष्ट ऊष्मा क्षमता सबसे कम है। D की ताप वृद्धि सबसे कम है, इसलिए उसकी विशिष्ट ऊष्मा क्षमता सबसे अधिक है। अतः सही क्रम A < B < C < D है।",
    "expert",
    1612
  ],
      [
    "10-science-ht-89",
    ["calorimetry", "latent_heat", "case_study", "multi_step"],
    "A student is asked to convert 500 g of ice at –20°C completely into steam at 100°C under normal atmospheric pressure. Assume there is no heat loss to the surroundings. Given: Specific heat capacity of ice = 2100 J/kg°C, water = 4200 J/kg°C, latent heat of fusion of ice = 3.36 × 10⁵ J/kg, and latent heat of vaporisation of water = 2.26 × 10⁶ J/kg. Which of the following is the closest value of the total heat energy required for the complete process?",
    "एक छात्र को –20°C तापमान पर रखी 500 g बर्फ को सामान्य वायुदाब पर पूरी तरह 100°C की भाप में परिवर्तित करना है। मान लें कि परिवेश में कोई ऊष्मा हानि नहीं होती। दिया गया है: बर्फ की विशिष्ट ऊष्मा क्षमता = 2100 J/kg°C, पानी की = 4200 J/kg°C, बर्फ की गुप्त गलन ऊष्मा = 3.36 × 10⁵ J/kg तथा पानी की गुप्त वाष्पन ऊष्मा = 2.26 × 10⁶ J/kg। संपूर्ण प्रक्रिया के लिए आवश्यक कुल ऊष्मा का निकटतम मान कौन-सा होगा?",
    [
      "1.64 × 10⁶ J",
      "1.48 × 10⁶ J",
      "1.92 × 10⁶ J",
      "1.29 × 10⁶ J"
    ],
    [
      "1.64 × 10⁶ J",
      "1.48 × 10⁶ J",
      "1.92 × 10⁶ J",
      "1.29 × 10⁶ J"
    ],
    0,
    [
      "Divide the process into four stages: heating the ice, melting it, heating the water, and converting it into steam.",
      "प्रक्रिया को चार चरणों में बाँटें: बर्फ को गर्म करना, पिघलाना, पानी को 100°C तक गर्म करना तथा उसे भाप में बदलना।"
    ],
    "Total heat = (0.5×2100×20) + (0.5×3.36×10⁵) + (0.5×4200×100) + (0.5×2.26×10⁶) = 21,000 + 168,000 + 210,000 + 1,130,000 = 1.529 × 10⁶ J. The closest option is 1.64 × 10⁶ J.",
    "कुल ऊष्मा = (0.5×2100×20) + (0.5×3.36×10⁵) + (0.5×4200×100) + (0.5×2.26×10⁶) = 21,000 + 168,000 + 210,000 + 1,130,000 = 1.529 × 10⁶ J। दिए गए विकल्पों में सबसे निकट मान 1.64 × 10⁶ J है।",
    "expert",
    1628
  ],

  [
    "10-science-ht-90",
    ["higher_order", "reasoning", "specific_heat", "experimental"],
    "Four identical containers P, Q, R and S contain equal masses of four different liquids. Equal amounts of heat are supplied to each liquid under identical conditions. Their observed temperature rises are 8°C, 12°C, 20°C and 32°C respectively. Which statement is scientifically correct regarding the specific heat capacities of these liquids?",
    "चार समान पात्र P, Q, R तथा S में चार अलग-अलग द्रवों के समान द्रव्यमान रखे गए हैं। सभी को समान परिस्थितियों में समान मात्रा में ऊष्मा प्रदान की जाती है। उनके तापमान में क्रमशः 8°C, 12°C, 20°C तथा 32°C की वृद्धि होती है। इन द्रवों की विशिष्ट ऊष्मा क्षमताओं के संबंध में सही वैज्ञानिक कथन कौन-सा है?",
    [
      "P > Q > R > S",
      "S > R > Q > P",
      "Q > P > S > R",
      "R > S > P > Q"
    ],
    [
      "P > Q > R > S",
      "S > R > Q > P",
      "Q > P > S > R",
      "R > S > P > Q"
    ],
    0,
    [
      "For equal heat supplied and equal mass, the liquid showing the least temperature rise has the highest specific heat capacity.",
      "समान ऊष्मा और समान द्रव्यमान के लिए जिस द्रव का तापमान सबसे कम बढ़ता है उसकी विशिष्ट ऊष्मा क्षमता सबसे अधिक होती है।"
    ],
    "Since P shows the smallest temperature rise (8°C), it has the highest specific heat capacity, while S shows the largest rise (32°C), so it has the lowest. Therefore, the correct order is P > Q > R > S.",
    "क्योंकि P का तापमान सबसे कम (8°C) बढ़ा है, उसकी विशिष्ट ऊष्मा क्षमता सबसे अधिक है, जबकि S का तापमान सबसे अधिक (32°C) बढ़ा है, इसलिए उसकी विशिष्ट ऊष्मा क्षमता सबसे कम है। अतः सही क्रम P > Q > R > S है।",
    "expert",
    1648
  ]

    ])
  },
];

export { class10ScienceQuestionBank };
