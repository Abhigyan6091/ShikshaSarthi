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
  explanation,
  explanationHindi,
  difficulty = "easy",
  eloRating = 900,
  interval = 10,
  marks = 1,
  negativeMarks = 0,
}) => ({
  id,
  subjectId: "7-science",
  class: 7,
  topicId,
  tags,
  question,
  questionHindi,
  options,
  optionsHindi,
  correctAnswer,
  hints,
  type: "mcq",
  explanation,
  explanationHindi,
  difficulty,
  eloRating: Math.max(800, Math.min(1050, eloRating)),
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
        explanation,
        explanationHindi,
        difficulty,
        eloRating,
      })
  );

const makeQuestionSetFromConcepts = (topicId, concepts) =>
  concepts.flatMap(
    ([
      id,
      tags,
      question,
      questionHindi,
      options,
      optionsHindi,
      correctAnswer,
      hints,
      explanation,
      explanationHindi,
      difficulty,
      eloRating,
    ]) => {
      const variantPrompts = [
        [question, questionHindi, difficulty, eloRating],
        ["Which of the following is correct?", "निम्न में से कौन-सा सही है?", difficulty, eloRating + 5],
        ["Choose the best answer.", "सबसे सही उत्तर चुनिए।", "medium", eloRating + 10],
        ["Select the right example or statement.", "सही उदाहरण या कथन चुनिए।", "medium", eloRating + 15],
      ];

      return variantPrompts.map(([variantQuestion, variantQuestionHindi, variantDifficulty, variantElo], index) =>
        makeQuestion({
          id: `${id}-${String(index + 1).padStart(2, "0")}`,
          topicId,
          tags,
          question: variantQuestion,
          questionHindi: variantQuestionHindi,
          options,
          optionsHindi,
          correctAnswer,
          hints,
          explanation,
          explanationHindi,
          difficulty: variantDifficulty,
          eloRating: variantElo,
        })
      );
    }
  );

const class7ScienceQuestionBank = [
  {
    chapterNumber: 1,
    topicId: "science-nutrition-in-plants",
    chapterTitle: "Nutrition in Plants",
    chapterTitleHindi: "पौधों में पोषण",
    questions: makeQuestionSet("science-nutrition-in-plants", [
      ["7-science-np-01", ["nutrition", "plants"], "Plants that make their own food are called:", "जो पौधे अपना भोजन स्वयं बनाते हैं, उन्हें क्या कहते हैं?", ["Heterotrophs", "Autotrophs", "Consumers", "Parasites"], ["परपोषी", "स्वपोषी", "उपभोक्ता", "परजीवी"], 1, ["Self-feeding organisms use sunlight to make food.", "स्वपोषी सूर्यप्रकाश से भोजन बनाते हैं।"], "Plants that make their own food are autotrophs.", "जो पौधे अपना भोजन स्वयं बनाते हैं वे स्वपोषी कहलाते हैं।", "easy", 820],
      ["7-science-np-02", ["chlorophyll"], "The green pigment in leaves is called:", "पत्तियों का हरा रंजक क्या कहलाता है?", ["Starch", "Chlorophyll", "Protein", "Cell wall"], ["स्टार्च", "हरितलवक", "प्रोटीन", "कोशिका भित्ति"], 1, ["It traps sunlight.", "यह सूर्यप्रकाश को पकड़ता है।"], "Chlorophyll is the green pigment that helps in photosynthesis.", "हरितलवक हरा रंजक है जो प्रकाश संश्लेषण में मदद करता है।", "easy", 825],
      ["7-science-np-03", ["photosynthesis"], "Photosynthesis mainly needs sunlight, carbon dioxide, water and:", "प्रकाश संश्लेषण के लिए मुख्यतः सूर्यप्रकाश, कार्बन डाइऑक्साइड, पानी और क्या चाहिए?", ["Salt", "Chlorophyll", "Sugar", "Oxygen"], ["नमक", "हरितलवक", "चीनी", "ऑक्सीजन"], 1, ["The green pigment is essential.", "हरा रंजक आवश्यक है।"], "Photosynthesis needs chlorophyll.", "प्रकाश संश्लेषण के लिए हरितलवक आवश्यक है।", "easy", 830],
      ["7-science-np-04", ["gas-exchange"], "The tiny pores on leaves are called:", "पत्तियों पर छोटे छिद्र क्या कहलाते हैं?", ["Villi", "Stomata", "Alveoli", "Pores of skin"], ["विलाई", "रंध्र", "अल्वियोली", "त्वचा के छिद्र"], 1, ["They help exchange gases.", "वे गैसों के आदान-प्रदान में मदद करते हैं।"], "Leaves have stomata for gas exchange.", "पत्तियों में गैसों के आदान-प्रदान के लिए रंध्र होते हैं।", "easy", 835],
      ["7-science-np-05", ["photosynthesis"], "During photosynthesis, plants release:", "प्रकाश संश्लेषण के दौरान पौधे क्या छोड़ते हैं?", ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], ["कार्बन डाइऑक्साइड", "ऑक्सीजन", "नाइट्रोजन", "हाइड्रोजन"], 1, ["It is the gas we breathe.", "यह वही गैस है जिसे हम श्वास में लेते हैं।"], "Plants release oxygen during photosynthesis.", "प्रकाश संश्लेषण के दौरान पौधे ऑक्सीजन छोड़ते हैं।", "easy", 840],
      ["7-science-np-06", ["roots"], "Water and minerals are absorbed by:", "पानी और खनिज किससे अवशोषित होते हैं?", ["Leaves", "Roots", "Flowers", "Fruits"], ["पत्तियाँ", "जड़ें", "फूल", "फल"], 1, ["This part is below the soil.", "यह भाग मिट्टी के नीचे होता है।"], "Roots absorb water and minerals from the soil.", "जड़ें मिट्टी से पानी और खनिज अवशोषित करती हैं।", "easy", 845],
      ["7-science-np-07", ["raw-materials"], "Which of these is a raw material for photosynthesis?", "इनमें से प्रकाश संश्लेषण का कच्चा पदार्थ कौन-सा है?", ["Carbon dioxide", "Starch", "Protein", "Fat"], ["कार्बन डाइऑक्साइड", "स्टार्च", "प्रोटीन", "वसा"], 0, ["It comes from the air.", "यह हवा से मिलता है।"], "Carbon dioxide is a raw material for photosynthesis.", "कार्बन डाइऑक्साइड प्रकाश संश्लेषण का कच्चा पदार्थ है।", "easy", 850],
      ["7-science-np-08", ["raw-materials"], "Which of these is also needed for photosynthesis?", "प्रकाश संश्लेषण के लिए इनमें से क्या भी आवश्यक है?", ["Water", "Salt", "Oil", "Ash"], ["पानी", "नमक", "तेल", "राख"], 0, ["Roots supply this from the soil.", "जड़ें इसे मिट्टी से देती हैं।"], "Water is needed for photosynthesis.", "प्रकाश संश्लेषण के लिए पानी आवश्यक है।", "easy", 855],
      ["7-science-np-09", ["stored-food"], "The food prepared by plants is stored mainly as:", "पौधों द्वारा बनाया गया भोजन मुख्यतः किस रूप में संग्रहित होता है?", ["Protein", "Starch", "Sugar crystals", "Fat"], ["प्रोटीन", "स्टार्च", "चीनी के कण", "वसा"], 1, ["Iodine test shows it.", "आयोडीन जाँच इसे दिखाती है।"], "Plants store prepared food mainly as starch.", "पौधे बनाया गया भोजन मुख्यतः स्टार्च के रूप में संग्रहित करते हैं।", "easy", 860],
      ["7-science-np-10", ["test"], "Iodine solution is used to test the presence of:", "आयोडीन विलयन किसकी जाँच के लिए उपयोग होता है?", ["Protein", "Starch", "Fat", "Water"], ["प्रोटीन", "स्टार्च", "वसा", "पानी"], 1, ["It turns blue-black with it.", "इसके साथ यह नीला-काला हो जाता है।"], "Iodine solution tests for starch.", "आयोडीन विलयन स्टार्च की जाँच करता है।", "easy", 865],
      ["7-science-np-11", ["parasite"], "Cuscuta is an example of a:", "अमरबेल किसका उदाहरण है?", ["Autotroph", "Parasite", "Herbivore", "Decomposer"], ["स्वपोषी", "परजीवी", "शाकाहारी", "अपघटक"], 1, ["It depends on another plant.", "यह दूसरे पौधे पर निर्भर रहती है।"], "Cuscuta is a parasitic plant.", "अमरबेल परजीवी पौधा है।", "easy", 870],
      ["7-science-np-12", ["saprotroph"], "Fungi that feed on dead and decaying matter are called:", "मृत और सड़ते पदार्थों पर भोजन करने वाले कवक क्या कहलाते हैं?", ["Autotrophs", "Saprotrophs", "Herbivores", "Carnivores"], ["स्वपोषी", "मृतोपजीवी", "शाकाहारी", "मांसाहारी"], 1, ["They absorb nutrients from dead matter.", "वे मृत पदार्थों से पोषक तत्त्व लेते हैं।"], "Fungi are saprotrophs.", "कवक मृतोपजीवी होते हैं।", "medium", 930],
      ["7-science-np-13", ["insectivorous"], "Pitcher plants trap insects mainly because they grow in:", "घटपर्णी पौधे कीटों को इसलिए पकड़ते हैं क्योंकि वे मुख्यतः कहाँ उगते हैं?", ["Waterlogged soil", "Nitrogen-poor soil", "Very salty soil", "Frozen soil"], ["पानी भरी मिट्टी", "नाइट्रोजन-गरीब मिट्टी", "बहुत खारी मिट्टी", "जमी हुई मिट्टी"], 1, ["They need extra nitrogen.", "उन्हें अतिरिक्त नाइट्रोजन चाहिए।"], "Pitcher plants grow in nitrogen-poor soil.", "घटपर्णी पौधे नाइट्रोजन-गरीब मिट्टी में उगते हैं।", "medium", 935],
      ["7-science-np-14", ["nitrogen"], "Plants need nitrogen mainly to make:", "पौधों को नाइट्रोजन मुख्यतः किसके निर्माण के लिए चाहिए?", ["Proteins", "Glass", "Rocks", "Water"], ["प्रोटीन", "काँच", "चट्टानें", "पानी"], 0, ["It is an important nutrient.", "यह एक आवश्यक पोषक तत्त्व है।"], "Plants need nitrogen to make proteins.", "पौधों को प्रोटीन बनाने के लिए नाइट्रोजन चाहिए।", "easy", 875],
      ["7-science-np-15", ["symbiosis"], "Rhizobium bacteria help plants by:", "राइजोबियम जीवाणु पौधों की किस प्रकार मदद करते हैं?", ["Making flowers", "Fixing nitrogen", "Removing leaves", "Producing sunlight"], ["फूल बनाकर", "नाइट्रोजन स्थिर करके", "पत्तियाँ हटाकर", "सूर्यप्रकाश बनाकर"], 1, ["They live in root nodules of legumes.", "वे दलहनी पौधों की जड़ों की ग्रंथियों में रहते हैं।"], "Rhizobium fixes nitrogen in the soil for plants.", "राइजोबियम पौधों के लिए मिट्टी में नाइट्रोजन स्थिर करता है।", "medium", 940],
      ["7-science-np-16", ["leaf"], "Food is mainly prepared in the:", "भोजन मुख्यतः कहाँ बनता है?", ["Root", "Leaf", "Stem", "Flower"], ["जड़", "पत्ती", "तना", "फूल"], 1, ["Green leaves are food factories.", "हरी पत्तियाँ भोजन की फैक्ट्री हैं।"], "Food is mainly prepared in the leaves.", "भोजन मुख्यतः पत्तियों में बनता है।", "easy", 880],
      ["7-science-np-17", ["producer"], "Green plants are called producers because they:", "हरे पौधों को उत्पादक इसलिए कहते हैं क्योंकि वे:", ["Eat other plants", "Make their own food", "Only need animals", "Cannot store food"], ["दूसरे पौधे खाते हैं", "अपना भोजन स्वयं बनाते हैं", "केवल जानवरों की आवश्यकता होती है", "भोजन संग्रह नहीं कर सकते"], 1, ["They are the base of food chains.", "वे खाद्य शृंखला का आधार हैं।"], "Green plants are producers because they make their own food.", "हरे पौधे उत्पादक हैं क्योंकि वे अपना भोजन स्वयं बनाते हैं।", "easy", 885],
      ["7-science-np-18", ["gas-exchange"], "Plants take in carbon dioxide mainly through:", "पौधे कार्बन डाइऑक्साइड मुख्यतः किससे लेते हैं?", ["Roots", "Stomata", "Flowers", "Seeds"], ["जड़ें", "रंध्र", "फूल", "बीज"], 1, ["These are on the leaf surface.", "ये पत्ती की सतह पर होते हैं।"], "Plants take in carbon dioxide through stomata.", "पौधे कार्बन डाइऑक्साइड रंध्रों के माध्यम से लेते हैं।", "easy", 890],
      ["7-science-np-19", ["food-chain"], "A food chain in nature begins with:", "प्रकृति में खाद्य शृंखला किससे शुरू होती है?", ["Consumers", "Producers", "Carnivores", "Decomposers"], ["उपभोक्ता", "उत्पादक", "मांसाहारी", "अपघटक"], 1, ["Green plants are the first link.", "हरे पौधे पहली कड़ी होते हैं।"], "A food chain begins with producers.", "खाद्य शृंखला उत्पादकों से शुरू होती है।", "hard", 945],
      ["7-science-np-20", ["summary"], "Photosynthesis is important because it provides:", "प्रकाश संश्लेषण महत्त्वपूर्ण है क्योंकि यह प्रदान करता है:", ["Only water", "Food and oxygen", "Only salt", "Only shade"], ["केवल पानी", "भोजन और ऑक्सीजन", "केवल नमक", "केवल छाया"], 1, ["It supports life on Earth.", "यह पृथ्वी पर जीवन को सहारा देता है।"], "Photosynthesis provides food and oxygen.", "प्रकाश संश्लेषण भोजन और ऑक्सीजन प्रदान करता है।", "medium", 900],
    ]),
  },
  {
    chapterNumber: 2,
    topicId: "science-nutrition-in-animals",
    chapterTitle: "Nutrition in Animals",
    chapterTitleHindi: "जानवरों में पोषण",
    questions: makeQuestionSet("science-nutrition-in-animals", [
      ["7-science-na-01", ["nutrition", "animals"], "The process of taking food into the body is called:", "शरीर में भोजन लेने की प्रक्रिया क्या कहलाती है?", ["Digestion", "Ingestion", "Absorption", "Egestion"], ["पाचन", "अंतर्ग्रहण", "अवशोषण", "बहिर्गमन"], 1, ["It is the first step in nutrition.", "यह पोषण का पहला चरण है।"], "Taking food into the body is called ingestion.", "शरीर में भोजन लेने की प्रक्रिया अंतर्ग्रहण कहलाती है।", "easy", 820],
      ["7-science-na-02", ["teeth"], "The teeth used for cutting food are:", "भोजन काटने वाले दाँत कौन-से हैं?", ["Canines", "Incisors", "Molars", "Premolars"], ["कैनाइन", "कृंतक", "दाढ़", "अग्रदाढ़"], 1, ["They are in the front.", "वे आगे होते हैं।"], "Incisors are used for cutting food.", "कृंतक दाँत भोजन काटने के लिए होते हैं।", "easy", 825],
      ["7-science-na-03", ["teeth"], "The teeth used for tearing food are:", "भोजन फाड़ने वाले दाँत कौन-से हैं?", ["Incisors", "Canines", "Molars", "Premolars"], ["कृंतक", "कैनाइन", "दाढ़", "अग्रदाढ़"], 1, ["They are pointed.", "वे नुकीले होते हैं।"], "Canines are used for tearing food.", "कैनाइन भोजन फाड़ने के लिए होते हैं।", "easy", 830],
      ["7-science-na-04", ["saliva"], "Saliva begins the digestion of:", "लार किसके पाचन की शुरुआत करती है?", ["Fats", "Starch", "Proteins", "Water"], ["वसा", "स्टार्च", "प्रोटीन", "पानी"], 1, ["It acts in the mouth.", "यह मुँह में काम करती है।"], "Saliva begins the digestion of starch.", "लार स्टार्च के पाचन की शुरुआत करती है।", "easy", 835],
      ["7-science-na-05", ["food-pipe"], "Food passes from the mouth to the stomach through the:", "भोजन मुँह से पेट तक किससे जाता है?", ["Windpipe", "Food pipe", "Liver", "Large intestine"], ["श्वासनली", "भोजन नली", "यकृत", "बड़ी आँत"], 1, ["It carries swallowed food.", "यह निगले गए भोजन को ले जाती है।"], "Food passes through the food pipe (oesophagus).", "भोजन भोजन नली (ग्रासनली) से गुजरता है।", "easy", 840],
      ["7-science-na-06", ["stomach"], "The stomach mainly:", "आमाशय मुख्यतः क्या करता है?", ["Stores oxygen", "Churns food and mixes it with juices", "Makes bones", "Creates blood cells"], ["ऑक्सीजन संचित करता है", "भोजन को मथता है और रसों के साथ मिलाता है", "हड्डियाँ बनाता है", "रक्त कोशिकाएँ बनाता है"], 1, ["It helps chemical digestion.", "यह रासायनिक पाचन में मदद करता है।"], "The stomach churns food and mixes it with digestive juices.", "आमाशय भोजन को मथता है और पाचक रसों से मिलाता है।", "easy", 845],
      ["7-science-na-07", ["small-intestine"], "Digestion is completed mainly in the:", "पाचन मुख्यतः कहाँ पूरा होता है?", ["Mouth", "Small intestine", "Large intestine", "Esophagus"], ["मुँह", "छोटी आँत", "बड़ी आँत", "ग्रासनली"], 1, ["Digestive juices act strongly here.", "यहाँ पाचक रस प्रभावी होते हैं।"], "Digestion is completed mainly in the small intestine.", "पाचन मुख्यतः छोटी आँत में पूरा होता है।", "easy", 850],
      ["7-science-na-08", ["villi"], "The finger-like projections in the small intestine are called:", "छोटी आँत में उँगली जैसी संरचनाएँ क्या कहलाती हैं?", ["Alveoli", "Villi", "Stomata", "Nephrons"], ["अल्वियोली", "विलाई", "रंध्र", "नेफ्रॉन"], 1, ["They increase surface area.", "वे सतह क्षेत्र बढ़ाते हैं।"], "Finger-like projections in the small intestine are called villi.", "छोटी आँत की उँगली जैसी संरचनाएँ विलाई कहलाती हैं।", "easy", 855],
      ["7-science-na-09", ["absorption"], "Villi help in:", "विलाई किसमें मदद करते हैं?", ["Digestion only", "Absorption of nutrients", "Chewing food", "Making saliva"], ["केवल पाचन", "पोषक तत्त्वों के अवशोषण", "भोजन चबाना", "लार बनाना"], 1, ["They take nutrients into blood.", "वे पोषक तत्त्वों को रक्त में ले जाते हैं।"], "Villi help in absorption of nutrients.", "विलाई पोषक तत्त्वों के अवशोषण में मदद करते हैं।", "easy", 860],
      ["7-science-na-10", ["ruminants"], "Cow is called a ruminant because it:", "गाय को जुगाली करने वाला जानवर क्यों कहते हैं?", ["Has no teeth", "Chews cud", "Lives in water", "Has no stomach"], ["दाँत नहीं होते", "जुगाली करती है", "पानी में रहती है", "पेट नहीं होता"], 1, ["It regurgitates partially digested food.", "यह आंशिक रूप से पचा भोजन फिर मुँह में लाती है।"], "Cow is a ruminant because it chews cud.", "गाय जुगाली करती है इसलिए रुमिनेंट कहलाती है।", "easy", 865],
      ["7-science-na-11", ["amoeba"], "Amoeba takes in food by using:", "अमीबा भोजन लेने के लिए क्या उपयोग करता है?", ["Cilia", "Pseudopodia", "Wings", "Teeth"], ["सिलिया", "कूटपाद", "पंख", "दाँत"], 1, ["It surrounds the food particle.", "यह भोजन कण को घेर लेता है।"], "Amoeba takes in food using pseudopodia.", "अमीबा कूटपादों से भोजन लेता है।", "easy", 870],
      ["7-science-na-12", ["digestion"], "The breakdown of complex food into simpler substances is called:", "जटिल भोजन का सरल पदार्थों में टूटना क्या कहलाता है?", ["Respiration", "Digestion", "Transpiration", "Excretion"], ["श्वसन", "पाचन", "वाष्पोत्सर्जन", "उत्सर्जन"], 1, ["It makes nutrients usable.", "यह पोषक तत्त्वों को उपयोगी बनाता है।"], "The breakdown of food is called digestion.", "भोजन का टूटना पाचन कहलाता है।", "easy", 875],
      ["7-science-na-13", ["bile"], "Bile helps in the digestion of:", "पित्त किसके पाचन में मदद करता है?", ["Starch", "Fats", "Proteins", "Water"], ["स्टार्च", "वसा", "प्रोटीन", "पानी"], 1, ["It helps break fats into tiny droplets.", "यह वसा को छोटे कणों में तोड़ता है।"], "Bile helps in digestion of fats.", "पित्त वसा के पाचन में मदद करता है।", "medium", 930],
      ["7-science-na-14", ["large-intestine"], "The large intestine mainly absorbs:", "बड़ी आँत मुख्यतः क्या अवशोषित करती है?", ["Oxygen", "Water", "Starch", "Protein"], ["ऑक्सीजन", "पानी", "स्टार्च", "प्रोटीन"], 1, ["It removes extra water from waste.", "यह अपशिष्ट से अतिरिक्त पानी निकालती है।"], "The large intestine mainly absorbs water.", "बड़ी आँत मुख्यतः पानी अवशोषित करती है।", "easy", 880],
      ["7-science-na-15", ["egestion"], "The removal of undigested food from the body is called:", "अपचित भोजन को शरीर से बाहर निकालना क्या कहलाता है?", ["Ingestion", "Absorption", "Egestion", "Assimilation"], ["अंतर्ग्रहण", "अवशोषण", "बहिर्गमन", "आत्मसात"], 2, ["It happens at the end of digestion.", "यह पाचन के अंत में होता है।"], "Removal of undigested food is called egestion.", "अपचित भोजन का निष्कासन बहिर्गमन कहलाता है।", "easy", 885],
      ["7-science-na-16", ["nutrition-types"], "Animals that eat both plants and animals are called:", "जो जानवर पौधे और पशु दोनों खाते हैं, उन्हें क्या कहते हैं?", ["Herbivores", "Carnivores", "Omnivores", "Parasites"], ["शाकाहारी", "मांसाहारी", "सर्वाहारी", "परजीवी"], 2, ["Humans are examples.", "मनुष्य इसका उदाहरण हैं।"], "Animals that eat both plants and animals are omnivores.", "जो जानवर पौधे और पशु दोनों खाते हैं वे सर्वाहारी कहलाते हैं।", "easy", 890],
      ["7-science-na-17", ["nutrition-types"], "Lions are called carnivores because they eat:", "शेर मांसाहारी इसलिए कहलाते हैं क्योंकि वे क्या खाते हैं?", ["Fruits", "Flesh", "Grass", "Seeds"], ["फल", "मांस", "घास", "बीज"], 1, ["They feed on other animals.", "वे अन्य जानवरों पर निर्भर होते हैं।"], "Lions eat flesh, so they are carnivores.", "शेर मांस खाते हैं, इसलिए वे मांसाहारी हैं।", "easy", 895],
      ["7-science-na-18", ["digestion"], "The tongue helps in:", "जीभ किसमें मदद करती है?", ["Mixing food with saliva", "Pumping blood", "Making urine", "Absorbing nutrients"], ["भोजन को लार के साथ मिलाना", "रक्त पंप करना", "मूत्र बनाना", "पोषक तत्त्वों का अवशोषण"], 0, ["It moves food around in the mouth.", "यह मुँह में भोजन को घुमाती है।"], "The tongue helps mix food with saliva.", "जीभ भोजन को लार के साथ मिलाने में मदद करती है।", "easy", 900],
      ["7-science-na-19", ["teeth-care"], "We should brush our teeth twice a day to:", "हमें दिन में दो बार दाँत क्यों साफ करने चाहिए?", ["Make them larger", "Keep them healthy and prevent decay", "Change their color", "Make food salty"], ["उन्हें बड़ा बनाने के लिए", "उन्हें स्वस्थ रखने और सड़न से बचाने के लिए", "रंग बदलने के लिए", "भोजन को नमकीन बनाने के लिए"], 1, ["Hygiene keeps teeth strong.", "स्वच्छता दाँतों को मजबूत रखती है।"], "Brushing helps keep teeth healthy and prevent decay.", "ब्रश करने से दाँत स्वस्थ रहते हैं और सड़न से बचते हैं।", "easy", 905],
      ["7-science-na-20", ["summary"], "Digestion helps the body by:", "पाचन शरीर की किस प्रकार मदद करता है?", ["Turning food into usable nutrients", "Turning water into stone", "Making clothes", "Stopping breathing"], ["भोजन को उपयोगी पोषक तत्त्वों में बदलकर", "पानी को पत्थर में बदलकर", "कपड़े बनाकर", "श्वास रोककर"], 0, ["Nutrients are needed for energy and growth.", "ऊर्जा और वृद्धि के लिए पोषक तत्त्व चाहिए।"], "Digestion turns food into usable nutrients.", "पाचन भोजन को उपयोगी पोषक तत्त्वों में बदलता है।", "medium", 910],
    ]),
  },
  {
    chapterNumber: 3,
    topicId: "science-fibre-to-fabric",
    chapterTitle: "Fibre to Fabric",
    chapterTitleHindi: "रेशे से वस्त्र तक",
    questions: makeQuestionSet("science-fibre-to-fabric", [
      ["7-science-ff-01", ["fibres"], "Cotton fibre comes from the:", "कपास का रेशा किससे प्राप्त होता है?", ["Stem", "Fruit of cotton plant", "Leaves", "Roots"], ["तना", "कपास के पौधे का फल", "पत्तियाँ", "जड़ें"], 1, ["Cotton bolls open to show fibres.", "कपास की टिंडियाँ खुलकर रेशे दिखाती हैं।"], "Cotton fibre comes from the fruit of the cotton plant.", "कपास का रेशा कपास के पौधे के फल से प्राप्त होता है।", "easy", 820],
      ["7-science-ff-02", ["jute"], "Jute fibre is obtained from the:", "जूट का रेशा किससे प्राप्त होता है?", ["Stem", "Root", "Flower", "Leaf"], ["तना", "जड़", "फूल", "पत्ती"], 0, ["The stem is soaked to remove fibres.", "तने को भिगोकर रेशे निकाले जाते हैं।"], "Jute fibre is obtained from the stem.", "जूट का रेशा तने से प्राप्त होता है।", "easy", 825],
      ["7-science-ff-03", ["wool"], "Wool is obtained from the hair of:", "ऊन किसके बालों से प्राप्त होता है?", ["Sheep", "Cow", "Hen", "Fish"], ["भेड़", "गाय", "मुर्गी", "मछली"], 0, ["Some other animals also provide wool.", "कुछ अन्य जानवर भी ऊन देते हैं।"], "Wool is obtained from sheep hair.", "ऊन भेड़ के बालों से प्राप्त होता है।", "easy", 830],
      ["7-science-ff-04", ["silk"], "Silk is obtained from the cocoon of the:", "रेशम किसके कोकून से प्राप्त होता है?", ["Spider", "Silkworm", "Bee", "Ant"], ["मकड़ी", "रेशमकीट", "मधुमक्खी", "चींटी"], 1, ["The larva spins the cocoon.", "लार्वा कोकून बनाता है।"], "Silk is obtained from the cocoon of the silkworm.", "रेशम रेशमकीट के कोकून से प्राप्त होता है।", "easy", 835],
      ["7-science-ff-05", ["spinning"], "The process of making yarn from fibres is called:", "रेशों से धागा बनाने की प्रक्रिया क्या कहलाती है?", ["Ginning", "Spinning", "Weaving", "Dyeing"], ["जिनिंग", "कताई", "बुनाई", "रंगाई"], 1, ["Fibres are twisted into yarn.", "रेशों को मरोड़कर धागा बनाया जाता है।"], "Making yarn from fibres is called spinning.", "रेशों से धागा बनाने की प्रक्रिया कताई कहलाती है।", "easy", 840],
      ["7-science-ff-06", ["weaving"], "The process of making fabric by interlacing two sets of yarn is:", "धागों के दो समूहों को आपस में उलझाकर वस्त्र बनाने की प्रक्रिया क्या है?", ["Weaving", "Shearing", "Scouring", "Sorting"], ["बुनाई", "कतरना", "सफाई", "छँटाई"], 0, ["Warp and weft are interlaced.", "ताना और बाना आपस में फँसाए जाते हैं।"], "Fabric made by interlacing yarns is created by weaving.", "धागों को आपस में उलझाकर वस्त्र बनाने की प्रक्रिया बुनाई है।", "easy", 845],
      ["7-science-ff-07", ["knitting"], "Knitting uses:", "निटिंग में क्या उपयोग होता है?", ["A single yarn", "Only glue", "Only metal wire", "Two stones"], ["एक धागा", "केवल गोंद", "केवल धातु की तार", "दो पत्थर"], 0, ["It makes sweaters and socks.", "इससे स्वेटर और मौजे बनते हैं।"], "Knitting uses a single yarn to make fabric.", "निटिंग में एक धागे से वस्त्र बनाया जाता है।", "easy", 850],
      ["7-science-ff-08", ["ginning"], "Separating cotton fibres from seeds is called:", "कपास के बीजों से रेशे अलग करना क्या कहलाता है?", ["Ginning", "Bleaching", "Dyeing", "Carding"], ["जिनिंग", "विरंजन", "रंगाई", "धुनाई"], 0, ["This is done before spinning.", "यह कताई से पहले किया जाता है।"], "Separating cotton fibres from seeds is called ginning.", "कपास के रेशों को बीजों से अलग करना जिनिंग कहलाता है।", "easy", 855],
      ["7-science-ff-09", ["sericulture"], "Rearing silkworms for silk is called:", "रेशम के लिए रेशमकीट पालन क्या कहलाता है?", ["Pisciculture", "Sericulture", "Apiculture", "Horticulture"], ["मत्स्य पालन", "रेशमकीट पालन", "मधुमक्खी पालन", "बागवानी"], 1, ["It deals with silk production.", "यह रेशम उत्पादन से जुड़ा है।"], "Rearing silkworms for silk is called sericulture.", "रेशम उत्पादन के लिए रेशमकीट पालन सेरिकल्चर कहलाता है।", "easy", 860],
      ["7-science-ff-10", ["shearing"], "Removing the fleece of sheep is called:", "भेड़ों का ऊन उतारना क्या कहलाता है?", ["Shearing", "Spinning", "Weaving", "Dyeing"], ["कतरना", "कताई", "बुनाई", "रंगाई"], 0, ["It is the first step in wool processing.", "यह ऊन प्रसंस्करण का पहला चरण है।"], "Removing the fleece of sheep is called shearing.", "भेड़ों का ऊन उतारना शीयरिंग कहलाता है।", "easy", 865],
      ["7-science-ff-11", ["wool-processing"], "The process of cleaning wool after shearing is called:", "ऊँन कतरने के बाद उसकी सफाई क्या कहलाती है?", ["Scouring", "Casting", "Sorting by rain", "Smoking"], ["सफाई", "ढलाई", "वर्षा से छँटाई", "धूम्रकरण"], 0, ["Impurities and grease are removed.", "अशुद्धियाँ और चिकनाई हटाई जाती हैं।"], "Cleaning wool after shearing is called scouring.", "ऊँन कतरने के बाद उसकी सफाई को स्काउरिंग कहते हैं।", "medium", 930],
      ["7-science-ff-12", ["natural-fibres"], "Cotton and jute are:", "कपास और जूट क्या हैं?", ["Synthetic fibres", "Natural plant fibres", "Animal fibres", "Metal fibres"], ["कृत्रिम रेशे", "प्राकृतिक पादप रेशे", "जंतु रेशे", "धातु रेशे"], 1, ["They come from plants.", "ये पौधों से मिलते हैं।"], "Cotton and jute are natural plant fibres.", "कपास और जूट प्राकृतिक पादप रेशे हैं।", "easy", 870],
      ["7-science-ff-13", ["animal-fibres"], "Which of these is an animal fibre?", "इनमें से कौन-सा जंतु रेशा है?", ["Cotton", "Jute", "Wool", "Linen"], ["कपास", "जूट", "ऊन", "लिनन"], 2, ["It comes from animals.", "यह जानवरों से मिलता है।"], "Wool is an animal fibre.", "ऊन एक जंतु रेशा है।", "easy", 875],
      ["7-science-ff-14", ["silk"], "The larva of silkworm is fed on:", "रेशमकीट के लार्वा को किससे खिलाया जाता है?", ["Rice grains", "Mulberry leaves", "Wheat flour", "Grass"], ["चावल के दाने", "शहतूत की पत्तियाँ", "गेहूँ का आटा", "घास"], 1, ["Silkworms eat leaves.", "रेशमकीट पत्तियाँ खाते हैं।"], "Silkworm larvae are fed on mulberry leaves.", "रेशमकीट के लार्वा को शहतूत की पत्तियाँ खिलाई जाती हैं।", "easy", 880],
      ["7-science-ff-15", ["fabric"], "Fabric is made from:", "वस्त्र किससे बनता है?", ["Yarn", "Leaves", "Seeds", "Mud"], ["धागे से", "पत्तियाँ", "बीज", "मिट्टी"], 0, ["Yarn is woven or knitted.", "धागे को बुनकर या निटिंग करके वस्त्र बनता है।"], "Fabric is made from yarn.", "वस्त्र धागे से बनता है।", "easy", 885],
      ["7-science-ff-16", ["cotton"], "Cotton clothes are preferred in summer because they:", "गर्मी में कपास के कपड़े क्यों पसंद किए जाते हैं?", ["Trap sweat and keep us cool", "Make us hotter", "Do not absorb sweat", "Are heavy and warm"], ["पसीना सोखकर ठंडा रखते हैं", "हमें अधिक गर्म करते हैं", "पसीना नहीं सोखते", "भारी और गरम होते हैं"], 0, ["They absorb sweat.", "वे पसीना सोखते हैं।"], "Cotton clothes absorb sweat and help keep the body cool.", "कपास के कपड़े पसीना सोखते हैं और शरीर को ठंडा रखने में मदद करते हैं।", "easy", 890],
      ["7-science-ff-17", ["weaving"], "Warp and weft are related to:", "ताना और बाना किससे संबंधित हैं?", ["Weaving", "Shearing", "Dyeing", "Ginning"], ["बुनाई", "कतरना", "रंगाई", "जिनिंग"], 0, ["They are the two sets of yarn.", "ये धागों के दो समूह हैं।"], "Warp and weft are part of weaving.", "ताना और बाना बुनाई का भाग हैं।", "medium", 930],
      ["7-science-ff-18", ["knitting"], "Sweaters are usually made by:", "स्वेटर सामान्यतः किससे बनाए जाते हैं?", ["Knitting", "Ginning", "Scouring", "Shearing"], ["निटिंग", "जिनिंग", "सफाई", "कतरना"], 0, ["Knitting forms loops.", "निटिंग में लूप बनते हैं।"], "Sweaters are usually made by knitting.", "स्वेटर सामान्यतः निटिंग से बनाए जाते हैं।", "easy", 895],
      ["7-science-ff-19", ["processing"], "Cotton balls are packed after:", "कपास की गेंदों को किसके बाद पैक किया जाता है?", ["Ginning and cleaning", "Boiling and freezing", "Painting and drying", "Melting and casting"], ["जिनिंग और सफाई", "उबालना और जमाना", "रंगना और सुखाना", "पिघलाना और ढालना"], 0, ["Impurities must be removed first.", "पहले अशुद्धियाँ हटाई जाती हैं।"], "Cotton is packed after ginning and cleaning.", "कपास को जिनिंग और सफाई के बाद पैक किया जाता है।", "medium", 900],
      ["7-science-ff-20", ["summary"], "Yarn is made from fibres, and fabric is made from:", "धागा रेशों से बनता है और वस्त्र किससे बनता है?", ["Seeds", "Yarn", "Roots", "Leaves"], ["बीज", "धागा", "जड़ें", "पत्तियाँ"], 1, ["This is the main sequence.", "यही मुख्य क्रम है।"], "Fabric is made from yarn.", "वस्त्र धागे से बनता है।", "easy", 905],
    ]),
  },
  {
    chapterNumber: 4,
    topicId: "science-heat",
    chapterTitle: "Heat",
    chapterTitleHindi: "ऊष्मा",
    questions: makeQuestionSet("science-heat", [
      ["7-science-ht-01", ["heat"], "Heat flows from a:", "ऊष्मा किससे किसकी ओर बहती है?", ["Cold body to hot body", "Hot body to cold body", "Wet body to dry body", "Large body to small body"], ["ठंडी वस्तु से गर्म वस्तु की ओर", "गर्म वस्तु से ठंडी वस्तु की ओर", "गीली वस्तु से सूखी वस्तु की ओर", "बड़ी वस्तु से छोटी वस्तु की ओर"], 1, ["Heat moves to balance temperature.", "ऊष्मा तापमान संतुलित करने के लिए चलती है।"], "Heat flows from a hot body to a cold body.", "ऊष्मा गर्म वस्तु से ठंडी वस्तु की ओर बहती है।", "easy", 820],
      ["7-science-ht-02", ["temperature"], "Temperature is measured using a:", "तापमान किससे मापा जाता है?", ["Barometer", "Thermometer", "Rain gauge", "Compass"], ["बैरोमीटर", "थर्मामीटर", "वर्षामापी", "कंपास"], 1, ["It shows how hot or cold something is.", "यह बताता है कि वस्तु कितनी गर्म या ठंडी है।"], "Temperature is measured using a thermometer.", "तापमान थर्मामीटर से मापा जाता है।", "easy", 825],
      ["7-science-ht-03", ["clinical-thermometer"], "A clinical thermometer is used to measure:", "क्लिनिकल थर्मामीटर किसे मापता है?", ["Weather", "Human body temperature", "Soil moisture", "Wind speed"], ["मौसम", "मानव शरीर का तापमान", "मिट्टी की नमी", "पवन वेग"], 1, ["It is for medical use.", "यह चिकित्सा उपयोग के लिए होता है।"], "A clinical thermometer measures human body temperature.", "क्लिनिकल थर्मामीटर मानव शरीर का तापमान मापता है।", "easy", 830],
      ["7-science-ht-04", ["laboratory-thermometer"], "A laboratory thermometer is used for:", "प्रयोगशाला थर्मामीटर किसके लिए उपयोग होता है?", ["Measuring body temperature", "Measuring temperatures of substances in experiments", "Finding directions", "Measuring rainfall"], ["शरीर का तापमान", "प्रयोगों में पदार्थों का तापमान", "दिशा ज्ञात करना", "वर्षा मापना"], 1, ["It is used in science experiments.", "यह विज्ञान प्रयोगों में उपयोग होता है।"], "A laboratory thermometer measures temperatures in experiments.", "प्रयोगशाला थर्मामीटर प्रयोगों में तापमान मापता है।", "easy", 835],
      ["7-science-ht-05", ["conduction"], "Heat transfer through solids is mainly by:", "ठोसों में ऊष्मा का स्थानांतरण मुख्यतः किससे होता है?", ["Conduction", "Evaporation", "Condensation", "Freezing"], ["चालन", "वाष्पीकरण", "संघनन", "जमना"], 0, ["Particles pass energy to neighbors.", "कण अपने पड़ोसी कणों को ऊर्जा देते हैं।"], "Heat transfer through solids mainly occurs by conduction.", "ठोसों में ऊष्मा का स्थानांतरण मुख्यतः चालन से होता है।", "easy", 840],
      ["7-science-ht-06", ["conductors"], "Which of the following is a good conductor of heat?", "इनमें से कौन ऊष्मा का अच्छा चालक है?", ["Wood", "Plastic", "Copper", "Rubber"], ["लकड़ी", "प्लास्टिक", "ताँबा", "रबर"], 2, ["Metals are good conductors.", "धातुएँ अच्छे चालक होती हैं।"], "Copper is a good conductor of heat.", "ताँबा ऊष्मा का अच्छा चालक है।", "easy", 845],
      ["7-science-ht-07", ["insulators"], "Which material is a poor conductor of heat?", "कौन-सा पदार्थ ऊष्मा का खराब चालक है?", ["Copper", "Aluminium", "Wood", "Iron"], ["ताँबा", "एल्युमिनियम", "लकड़ी", "लोहा"], 2, ["It slows heat transfer.", "यह ऊष्मा के प्रवाह को धीमा करता है।"], "Wood is a poor conductor of heat.", "लकड़ी ऊष्मा की खराब चालक है।", "easy", 850],
      ["7-science-ht-08", ["convection"], "Heat transfer in liquids and gases mainly occurs by:", "द्रव और गैसों में ऊष्मा का स्थानांतरण मुख्यतः किससे होता है?", ["Conduction", "Convection", "Fusion", "Sublimation"], ["चालन", "संवहन", "गलन", "उर्ध्वपातन"], 1, ["Warm fluid rises and cool fluid sinks.", "गरम द्रव ऊपर उठता है और ठंडा नीचे जाता है।"], "Heat transfer in liquids and gases mainly occurs by convection.", "द्रव और गैसों में ऊष्मा का स्थानांतरण मुख्यतः संवहन से होता है।", "easy", 855],
      ["7-science-ht-09", ["radiation"], "Heat from the Sun reaches us by:", "सूर्य की ऊष्मा हम तक किससे पहुँचती है?", ["Conduction", "Convection", "Radiation", "Evaporation"], ["चालन", "संवहन", "विकिरण", "वाष्पीकरण"], 2, ["It can travel through empty space.", "यह रिक्त स्थान से भी गुजर सकती है।"], "Heat from the Sun reaches us by radiation.", "सूर्य की ऊष्मा हम तक विकिरण से पहुँचती है।", "easy", 860],
      ["7-science-ht-10", ["thermometer"], "The normal body temperature is about:", "सामान्य शरीर तापमान लगभग कितना होता है?", ["35°C", "37°C", "40°C", "42°C"], ["35°C", "37°C", "40°C", "42°C"], 1, ["It is the usual healthy value.", "यह सामान्य स्वस्थ मान है।"], "Normal human body temperature is about 37°C.", "सामान्य मानव शरीर तापमान लगभग 37°C होता है।", "easy", 865],
      ["7-science-ht-11", ["scales"], "On a Celsius scale, water freezes at:", "सेल्सियस पैमाने पर पानी किस तापमान पर जमता है?", ["0°C", "10°C", "37°C", "100°C"], ["0°C", "10°C", "37°C", "100°C"], 0, ["Ice melts at the same point.", "बर्फ इसी तापमान पर पिघलती भी है।"], "Water freezes at 0°C on the Celsius scale.", "सेल्सियस पैमाने पर पानी 0°C पर जमता है।", "easy", 870],
      ["7-science-ht-12", ["scales"], "On a Celsius scale, water boils at:", "सेल्सियस पैमाने पर पानी किस तापमान पर उबलता है?", ["0°C", "25°C", "50°C", "100°C"], ["0°C", "25°C", "50°C", "100°C"], 3, ["This is the boiling point at sea level.", "यह समुद्र तल पर उबलने का बिंदु है।"], "Water boils at 100°C on the Celsius scale.", "सेल्सियस पैमाने पर पानी 100°C पर उबलता है।", "easy", 875],
      ["7-science-ht-13", ["clinical-thermometer"], "A clinical thermometer usually has a range of:", "क्लिनिकल थर्मामीटर की सामान्य सीमा क्या होती है?", ["0°C to 100°C", "35°C to 42°C", "-10°C to 110°C", "10°C to 60°C"], ["0°C से 100°C", "35°C से 42°C", "-10°C से 110°C", "10°C से 60°C"], 1, ["It is meant for body temperature only.", "यह केवल शरीर के तापमान के लिए होता है।"], "A clinical thermometer usually has a range of 35°C to 42°C.", "क्लिनिकल थर्मामीटर की सामान्य सीमा 35°C से 42°C होती है।", "medium", 930],
      ["7-science-ht-14", ["insulation"], "Woollen clothes keep us warm because they:", "ऊन के कपड़े हमें गर्म क्यों रखते हैं?", ["Absorb sunlight only", "Trap air and reduce heat loss", "Make heat stronger", "Turn cold to hot"], ["केवल सूर्यप्रकाश सोखते हैं", "हवा फँसाकर ऊष्मा हानि कम करते हैं", "ऊष्मा को अधिक करते हैं", "ठंड को गर्म बनाते हैं"], 1, ["Trapped air is a poor conductor.", "फँसी हुई हवा खराब चालक होती है।"], "Woollen clothes trap air and reduce heat loss.", "ऊन के कपड़े हवा फँसाकर ऊष्मा हानि कम करते हैं।", "easy", 880],
      ["7-science-ht-15", ["dark-clothes"], "Dark-coloured clothes are better in winter because they:", "सर्दियों में गहरे रंग के कपड़े बेहतर क्यों होते हैं?", ["Reflect more heat", "Absorb more heat", "Absorb more water", "Stop breathing"], ["अधिक ऊष्मा परावर्तित करते हैं", "अधिक ऊष्मा अवशोषित करते हैं", "अधिक पानी सोखते हैं", "श्वास रोकते हैं"], 1, ["They take in more radiant heat.", "वे अधिक विकिरण ऊष्मा सोखते हैं।"], "Dark-coloured clothes absorb more heat.", "गहरे रंग के कपड़े अधिक ऊष्मा अवशोषित करते हैं।", "easy", 885],
      ["7-science-ht-16", ["conduction"], "A metal spoon in hot tea becomes hot because of:", "गर्म चाय में रखी धातु की चम्मच गर्म क्यों हो जाती है?", ["Conduction", "Evaporation", "Reflection", "Freezing"], ["चालन", "वाष्पीकरण", "परावर्तन", "जमना"], 0, ["Heat travels along the spoon.", "ऊष्मा चम्मच के साथ आगे बढ़ती है।"], "The spoon becomes hot due to conduction.", "चम्मच चालन के कारण गर्म होती है।", "easy", 890],
      ["7-science-ht-17", ["temperature"], "Heat and temperature are the same thing.", "ऊष्मा और तापमान एक ही चीज़ हैं।", ["True", "False", "Only in winter", "Only in metals"], ["सत्य", "असत्य", "केवल सर्दियों में", "केवल धातुओं में"], 1, ["Temperature is a measure of hotness.", "तापमान गर्मी का माप है।"], "Heat and temperature are not the same.", "ऊष्मा और तापमान एक समान नहीं हैं।", "easy", 895],
      ["7-science-ht-18", ["insulator"], "Handles of cooking utensils are often made of plastic or wood because these are:", "रसोई के बर्तनों के हत्थे अक्सर प्लास्टिक या लकड़ी के क्यों होते हैं?", ["Good conductors", "Poor conductors", "Very heavy metals", "Always hot"], ["अच्छे चालक", "खराब चालक", "बहुत भारी धातु", "हमेशा गर्म"], 1, ["They protect our hands.", "वे हमारे हाथों की रक्षा करते हैं।"], "Plastic and wood are poor conductors of heat.", "प्लास्टिक और लकड़ी ऊष्मा के खराब चालक हैं।", "easy", 900],
      ["7-science-ht-19", ["sea-breeze"], "Convection currents in air help create:", "हवा में संवहन धाराएँ किसे बनाने में मदद करती हैं?", ["Sea breeze and land breeze", "Rainbows", "Earthquakes", "Rocks"], ["समुद्री समीर और स्थलीय समीर", "इंद्रधनुष", "भूकंप", "चट्टानें"], 0, ["Warm air rises, cool air moves in.", "गरम हवा ऊपर उठती है, ठंडी हवा आती है।"], "Convection currents help create sea breeze and land breeze.", "संवहन धाराएँ समुद्री समीर और स्थलीय समीर बनाने में मदद करती हैं।", "medium", 930],
      ["7-science-ht-20", ["summary"], "The main ways heat is transferred are:", "ऊष्मा के स्थानांतरण के मुख्य तरीके हैं:", ["Conduction, convection and radiation", "Boiling, freezing and melting", "Cutting, bending and mixing", "Sound, light and motion"], ["चालन, संवहन और विकिरण", "उबालना, जमना और पिघलना", "काटना, मोड़ना और मिलाना", "ध्वनि, प्रकाश और गति"], 0, ["These are the three modes of heat transfer.", "ये ऊष्मा स्थानांतरण की तीन विधियाँ हैं।"], "Heat is transferred by conduction, convection and radiation.", "ऊष्मा का स्थानांतरण चालन, संवहन और विकिरण से होता है।", "easy", 905],
    ]),
  },
  {
    chapterNumber: 5,
    topicId: "science-acids-bases-salts",
    chapterTitle: "Acids, Bases and Salts",
    chapterTitleHindi: "अम्ल, क्षार और लवण",
    questions: makeQuestionSet("science-acids-bases-salts", [
      ["7-science-abs-01", ["acids"], "Which substance is an acid?", "कौन-सा पदार्थ अम्ल है?", ["Lemon juice", "Soap solution", "Sugar water", "Pure water"], ["नींबू का रस", "साबुन का घोल", "चीनी का पानी", "सादा पानी"], 0, ["Acids are usually sour.", "अम्ल सामान्यतः खट्टे होते हैं।"], "Lemon juice is acidic.", "नींबू का रस अम्लीय है।", "easy", 820],
      ["7-science-abs-02", ["bases"], "Which substance is a base?", "कौन-सा पदार्थ क्षार है?", ["Vinegar", "Soap solution", "Lemon juice", "Orange juice"], ["सिरका", "साबुन का घोल", "नींबू का रस", "संतरे का रस"], 1, ["Bases are often slippery or soapy.", "क्षार प्रायः फिसलनदार या साबुन जैसे होते हैं।"], "Soap solution is a base.", "साबुन का घोल क्षार है।", "easy", 825],
      ["7-science-abs-03", ["litmus"], "Blue litmus paper turns red in the presence of:", "नीला लिटमस पत्र किसकी उपस्थिति में लाल हो जाता है?", ["An acid", "A base", "Water only", "Salt only"], ["अम्ल", "क्षार", "केवल पानी", "केवल नमक"], 0, ["This is a common test for acids.", "यह अम्लों की सामान्य जाँच है।"], "Blue litmus turns red in an acid.", "नीला लिटमस अम्ल में लाल हो जाता है।", "easy", 830],
      ["7-science-abs-04", ["litmus"], "Red litmus paper turns blue in the presence of:", "लाल लिटमस पत्र किसकी उपस्थिति में नीला हो जाता है?", ["An acid", "A base", "Sugar solution", "Milk only"], ["अम्ल", "क्षार", "चीनी का घोल", "केवल दूध"], 1, ["This shows a basic solution.", "यह क्षारीय घोल को दिखाता है।"], "Red litmus turns blue in a base.", "लाल लिटमस क्षार में नीला हो जाता है।", "easy", 835],
      ["7-science-abs-05", ["neutralization"], "When an acid reacts with a base, it forms:", "जब अम्ल और क्षार अभिक्रिया करते हैं तो क्या बनता है?", ["Salt and water", "Only gas", "Only metal", "Only fire"], ["लवण और पानी", "केवल गैस", "केवल धातु", "केवल आग"], 0, ["This is called neutralization.", "इसे उदासीनीकरण कहा जाता है।"], "Neutralization produces salt and water.", "उदासीनीकरण से लवण और पानी बनते हैं।", "medium", 930],
      ["7-science-abs-06", ["indicators", "litmus"], "Litmus is obtained from which natural source?", "लिटमस किस प्राकृतिक स्रोत से प्राप्त होता है?", ["Lichens", "Rose petals", "Turmeric roots", "Tea leaves"], ["लाइकेन", "गुलाब की पंखुड़ियाँ", "हल्दी की जड़ें", "चाय की पत्तियाँ"], 0, ["It is a symbiotic organism.", "यह एक सहजीवी जीव है।"], "Litmus is a natural dye extracted from lichens.", "लिटमस लाइकेन से निकाला गया प्राकृतिक रंजक है।", "easy", 850],
      ["7-science-abs-07", ["indicators", "turmeric"], "What happens when a basic solution is added to turmeric paste?", "हल्दी के लेप में क्षारीय विलयन मिलाने पर क्या होता है?", ["It turns red", "It turns blue", "It becomes colourless", "It remains yellow"], ["यह लाल हो जाता है", "यह नीला हो जाता है", "यह रंगहीन हो जाता है", "यह पीला ही रहता है"], 0, ["Turmeric detects bases.", "हल्दी क्षारकों की पहचान करती है।"], "Turmeric changes from yellow to red-brown in a basic solution.", "क्षारीय विलयन में हल्दी पीले से लाल-भूरी हो जाती है।", "medium", 900],
      ["7-science-abs-08", ["indicators", "china-rose"], "China rose indicator turns an acidic solution:", "गुड़हल सूचक अम्लीय विलयन को किस रंग का कर देता है?", ["Dark pink", "Green", "Blue", "Yellow"], ["गहरा गुलाबी", "हरा", "नीला", "पीला"], 0, ["Recall the colour in an acid.", "अम्ल में बनने वाला रंग याद करें।"], "China rose indicator gives a dark pink colour in acids.", "गुड़हल सूचक अम्ल में गहरा गुलाबी रंग देता है।", "easy", 855],
      ["7-science-abs-09", ["indicators", "china-rose"], "China rose indicator turns a basic solution:", "गुड़हल सूचक क्षारीय विलयन को किस रंग का करता है?", ["Green", "Dark pink", "Orange", "Black"], ["हरा", "गहरा गुलाबी", "नारंगी", "काला"], 0, ["The colour differs from its colour in acid.", "यह रंग अम्ल वाले रंग से अलग है।"], "China rose indicator turns basic solutions green.", "गुड़हल सूचक क्षारीय विलयन को हरा कर देता है।", "easy", 860],
      ["7-science-abs-10", ["neutral", "litmus"], "A solution changes neither red nor blue litmus. It is most likely:", "एक विलयन लाल या नीले लिटमस में कोई बदलाव नहीं करता। वह संभवतः क्या है?", ["Neutral", "Strongly acidic", "Strongly basic", "Always salty"], ["उदासीन", "अत्यधिक अम्लीय", "अत्यधिक क्षारीय", "हमेशा लवणीय"], 0, ["Neutral solutions do not affect litmus.", "उदासीन विलयन लिटमस को नहीं बदलते।"], "A neutral solution changes neither red nor blue litmus.", "उदासीन विलयन न लाल लिटमस बदलता है, न नीला।", "medium", 910],
      ["7-science-abs-11", ["neutralization", "heat"], "Besides salt and water, neutralisation usually produces:", "लवण और जल के अतिरिक्त उदासीनीकरण में सामान्यतः क्या उत्पन्न होता है?", ["Heat", "Light only", "Oxygen", "Ice"], ["ऊष्मा", "केवल प्रकाश", "ऑक्सीजन", "बर्फ"], 0, ["The reaction is exothermic.", "यह अभिक्रिया ऊष्माक्षेपी होती है।"], "Neutralisation releases heat along with forming salt and water.", "उदासीनीकरण में लवण और जल के साथ ऊष्मा निकलती है।", "medium", 920],
      ["7-science-abs-12", ["daily-life", "indigestion"], "Why is an antacid taken during acidity or indigestion?", "अम्लता या अपच के समय प्रतिअम्ल क्यों लिया जाता है?", ["It neutralises excess stomach acid", "It increases stomach acid", "It stops digestion permanently", "It adds sugar to blood"], ["यह पेट के अतिरिक्त अम्ल को उदासीन करता है", "यह पेट का अम्ल बढ़ाता है", "यह पाचन हमेशा के लिए रोकता है", "यह रक्त में शर्करा मिलाता है"], 0, ["Antacids are mild bases.", "प्रतिअम्ल हल्के क्षारक होते हैं।"], "A mild basic antacid neutralises excess acid in the stomach.", "हल्का क्षारीय प्रतिअम्ल पेट के अतिरिक्त अम्ल को उदासीन करता है।", "medium", 935],
      ["7-science-abs-13", ["daily-life", "ant-sting"], "An ant sting injects formic acid. Which substance can provide relief?", "चींटी का डंक फॉर्मिक अम्ल छोड़ता है। किस पदार्थ से राहत मिल सकती है?", ["Baking soda paste", "Vinegar", "Lemon juice", "Orange juice"], ["बेकिंग सोडा का लेप", "सिरका", "नींबू का रस", "संतरे का रस"], 0, ["Use a mild base against an acid.", "अम्ल के विरुद्ध हल्के क्षारक का उपयोग करें।"], "Basic baking soda neutralises the formic acid in an ant sting.", "क्षारीय बेकिंग सोडा चींटी के डंक के फॉर्मिक अम्ल को उदासीन करता है।", "medium", 945],
      ["7-science-abs-14", ["daily-life", "soil"], "A farmer finds that the soil is too acidic. What should be added?", "किसान को मिट्टी अत्यधिक अम्लीय मिलती है। उसमें क्या मिलाना चाहिए?", ["Quicklime or slaked lime", "Vinegar", "Lemon juice", "More acid"], ["चूना या बुझा हुआ चूना", "सिरका", "नींबू का रस", "अधिक अम्ल"], 0, ["Acidic soil needs a basic material.", "अम्लीय मिट्टी को क्षारीय पदार्थ चाहिए।"], "Basic quicklime or slaked lime neutralises acidic soil.", "क्षारीय चूना या बुझा चूना अम्लीय मिट्टी को उदासीन करता है।", "hard", 990],
      ["7-science-abs-15", ["daily-life", "soil"], "Which material can improve soil that is too basic?", "अत्यधिक क्षारीय मिट्टी को सुधारने के लिए क्या मिलाया जा सकता है?", ["Organic matter", "Quicklime", "Baking soda", "Soap solution"], ["जैविक पदार्थ", "चूना", "बेकिंग सोडा", "साबुन का घोल"], 0, ["Decomposition releases acids.", "अपघटन से अम्ल निकलते हैं।"], "Organic matter releases acids on decomposition and neutralises basic soil.", "जैविक पदार्थ अपघटन पर अम्ल छोड़कर क्षारीय मिट्टी को उदासीन करता है।", "hard", 1000],
      ["7-science-abs-16", ["environment", "factory-waste"], "Why must acidic factory waste be treated before entering rivers?", "अम्लीय औद्योगिक अपशिष्ट को नदियों में छोड़ने से पहले उपचारित क्यों करना चाहिए?", ["It can harm aquatic life", "It makes water sweeter", "It increases oxygen safely", "It produces drinking water"], ["यह जलीय जीवों को हानि पहुँचा सकता है", "यह पानी को मीठा बनाता है", "यह सुरक्षित रूप से ऑक्सीजन बढ़ाता है", "यह पेयजल बनाता है"], 0, ["Consider the effect of extreme pH.", "अत्यधिक अम्लता के प्रभाव पर विचार करें।"], "Acidic waste can kill aquatic organisms, so bases are used to neutralise it.", "अम्लीय अपशिष्ट जलीय जीवों को मार सकता है, इसलिए उसे क्षारक से उदासीन किया जाता है।", "hard", 1010],
      ["7-science-abs-17", ["experiment", "litmus"], "A liquid turns red litmus blue and turmeric red-brown. The liquid is:", "एक द्रव लाल लिटमस को नीला और हल्दी को लाल-भूरा करता है। वह द्रव है:", ["Basic", "Acidic", "Neutral", "Pure water"], ["क्षारीय", "अम्लीय", "उदासीन", "शुद्ध जल"], 0, ["Both observations indicate the same nature.", "दोनों प्रेक्षण एक ही प्रकृति बताते हैं।"], "Both tests identify the liquid as basic.", "दोनों परीक्षण द्रव को क्षारीय बताते हैं।", "hard", 1020],
      ["7-science-abs-18", ["experiment", "indicators"], "Which test best distinguishes lemon juice from soap solution?", "नींबू के रस और साबुन के घोल में अंतर करने के लिए कौन-सा परीक्षण सर्वोत्तम है?", ["Use blue and red litmus", "Smell both closely", "Taste both", "Measure their volume"], ["नीले और लाल लिटमस का उपयोग", "दोनों को पास से सूँघना", "दोनों को चखना", "उनका आयतन मापना"], 0, ["Indicators are safer than tasting.", "सूचक चखने से अधिक सुरक्षित हैं।"], "Lemon juice turns blue litmus red, while soap turns red litmus blue.", "नींबू नीले लिटमस को लाल करता है, जबकि साबुन लाल लिटमस को नीला करता है।", "medium", 950],
      ["7-science-abs-19", ["reasoning", "neutralization"], "If equal suitable amounts of an acid and a base completely neutralise, the final solution should be:", "यदि अम्ल और क्षार की उपयुक्त समान मात्राएँ पूर्णतः उदासीन हो जाएँ, तो अंतिम विलयन कैसा होगा?", ["Neutral", "Always acidic", "Always basic", "A metal"], ["उदासीन", "हमेशा अम्लीय", "हमेशा क्षारीय", "एक धातु"], 0, ["Neither reactant remains in excess.", "कोई भी अभिकारक अधिक मात्रा में नहीं बचता।"], "Complete neutralisation leaves salt and water and produces a neutral mixture.", "पूर्ण उदासीनीकरण से लवण और जल बनते हैं तथा मिश्रण उदासीन होता है।", "hard", 1030],
      ["7-science-abs-20", ["safety", "laboratory"], "Why should unknown laboratory liquids never be tasted to identify acids or bases?", "अज्ञात प्रयोगशाला द्रवों को अम्ल या क्षार पहचानने के लिए कभी चखना क्यों नहीं चाहिए?", ["They may be corrosive or poisonous", "All are colourless", "Taste changes litmus", "They contain only water"], ["वे संक्षारक या विषैले हो सकते हैं", "सभी रंगहीन होते हैं", "स्वाद लिटमस बदल देता है", "उनमें केवल जल होता है"], 0, ["Use indicators instead.", "इसके स्थान पर सूचकों का उपयोग करें।"], "Indicators identify acids and bases safely without direct contact or tasting.", "सूचक सीधे संपर्क या चखने के बिना अम्ल और क्षार की सुरक्षित पहचान करते हैं।", "medium", 960],
    ]),
  },
  {
    chapterNumber: 6,
    topicId: "science-physical-chemical-changes",
    chapterTitle: "Physical and Chemical Changes",
    chapterTitleHindi: "भौतिक और रासायनिक परिवर्तन",
    questions: makeQuestionSet("science-physical-chemical-changes", [
      ["7-science-pcc-01", ["physical-change"], "Melting of ice is a:", "बर्फ का पिघलना कैसा परिवर्तन है?", ["Physical change", "Chemical change", "Biological change", "Nuclear change"], ["भौतिक परिवर्तन", "रासायनिक परिवर्तन", "जैविक परिवर्तन", "नाभिकीय परिवर्तन"], 0, ["Only the state changes.", "केवल अवस्था बदलती है।"], "Melting of ice is a physical change.", "बर्फ का पिघलना भौतिक परिवर्तन है।", "easy", 830],
      ["7-science-pcc-02", ["chemical-change"], "Rusting of iron is a:", "लोहे में जंग लगना कैसा परिवर्तन है?", ["Physical change", "Chemical change", "Temporary change", "No change"], ["भौतिक परिवर्तन", "रासायनिक परिवर्तन", "अस्थायी परिवर्तन", "कोई परिवर्तन नहीं"], 1, ["A new substance is formed.", "एक नया पदार्थ बनता है।"], "Rusting of iron is a chemical change.", "लोहे में जंग लगना रासायनिक परिवर्तन है।", "easy", 835],
      ["7-science-pcc-03", ["burning"], "Burning of paper is a:", "कागज का जलना कैसा परिवर्तन है?", ["Physical change", "Chemical change", "Reversible change", "Simple mixing"], ["भौतिक परिवर्तन", "रासायनिक परिवर्तन", "उलट सकने वाला परिवर्तन", "साधारण मिश्रण"], 1, ["Ash and gases are formed.", "राख और गैसें बनती हैं।"], "Burning of paper is a chemical change.", "कागज का जलना रासायनिक परिवर्तन है।", "easy", 840],
      ["7-science-pcc-04", ["reversible-change"], "Dissolving sugar in water is generally a:", "पानी में चीनी घोलना सामान्यतः कैसा परिवर्तन है?", ["Physical change", "Chemical change", "Explosive change", "Permanent change only"], ["भौतिक परिवर्तन", "रासायनिक परिवर्तन", "विस्फोटक परिवर्तन", "केवल स्थायी परिवर्तन"], 0, ["Sugar can be recovered by evaporation.", "वाष्पन से चीनी वापस मिल सकती है।"], "Dissolving sugar in water is a physical change.", "पानी में चीनी घोलना भौतिक परिवर्तन है।", "medium", 930],
      ["7-science-pcc-05", ["crystallization"], "Crystallization is used to obtain:", "क्रिस्टलीकरण का उपयोग किसके लिए किया जाता है?", ["Pure crystals", "Smoke", "Mud", "Heat"], ["शुद्ध क्रिस्टल", "धुआँ", "कीचड़", "ऊष्मा"], 0, ["It helps separate a dissolved solid.", "यह घुले हुए ठोस को अलग करने में मदद करता है।"], "Crystallization helps obtain pure crystals.", "क्रिस्टलीकरण से शुद्ध क्रिस्टल प्राप्त किए जाते हैं।", "medium", 935],
      ["7-science-pcc-06", ["physical-change", "shape"], "Cutting a sheet of paper into pieces is a physical change because:", "कागज की शीट को टुकड़ों में काटना भौतिक परिवर्तन क्यों है?", ["No new substance forms", "Ash is formed", "A gas is released", "Its composition changes"], ["कोई नया पदार्थ नहीं बनता", "राख बनती है", "गैस निकलती है", "उसका संघटन बदलता है"], 0, ["Only size and shape change.", "केवल आकार और माप बदलते हैं।"], "Cutting changes size and shape but not the substance.", "काटने से आकार और माप बदलते हैं, पदार्थ नहीं।", "easy", 850],
      ["7-science-pcc-07", ["chemical-change", "new-substance"], "The clearest sign of a chemical change is:", "रासायनिक परिवर्तन का सबसे स्पष्ट संकेत क्या है?", ["Formation of a new substance", "Change of position", "Change of size only", "Breaking into pieces"], ["नए पदार्थ का बनना", "स्थान बदलना", "केवल आकार बदलना", "टुकड़ों में टूटना"], 0, ["Chemical composition changes.", "रासायनिक संघटन बदलता है।"], "A chemical change produces one or more new substances.", "रासायनिक परिवर्तन में एक या अधिक नए पदार्थ बनते हैं।", "easy", 855],
      ["7-science-pcc-08", ["burning", "magnesium"], "Magnesium ribbon burns with a brilliant white light and forms:", "मैग्नीशियम रिबन चमकीली सफेद लौ के साथ जलकर क्या बनाता है?", ["Magnesium oxide", "Iron oxide", "Copper sulphate", "Magnesium metal again"], ["मैग्नीशियम ऑक्साइड", "आयरन ऑक्साइड", "कॉपर सल्फेट", "फिर से मैग्नीशियम धातु"], 0, ["The ash is an oxide.", "राख एक ऑक्साइड है।"], "Burning magnesium combines it with oxygen to form magnesium oxide.", "मैग्नीशियम जलकर ऑक्सीजन से मिलकर मैग्नीशियम ऑक्साइड बनाता है।", "medium", 900],
      ["7-science-pcc-09", ["chemical-change", "limewater"], "When magnesium oxide ash is mixed with water, the solution is:", "मैग्नीशियम ऑक्साइड की राख को जल में मिलाने पर विलयन कैसा होता है?", ["Basic", "Acidic", "Always neutral", "Salty only"], ["क्षारीय", "अम्लीय", "हमेशा उदासीन", "केवल लवणीय"], 0, ["Test it with red litmus.", "इसे लाल लिटमस से जाँचें।"], "Magnesium oxide with water forms basic magnesium hydroxide.", "मैग्नीशियम ऑक्साइड जल के साथ क्षारीय मैग्नीशियम हाइड्रॉक्साइड बनाता है।", "hard", 990],
      ["7-science-pcc-10", ["rusting", "conditions"], "Iron rusts when it is exposed to:", "लोहे पर जंग कब लगती है?", ["Both oxygen and water", "Oxygen only", "Water only", "Sunlight only"], ["ऑक्सीजन और जल दोनों", "केवल ऑक्सीजन", "केवल जल", "केवल सूर्यप्रकाश"], 0, ["Moist air supplies both.", "नम हवा दोनों उपलब्ध कराती है।"], "Both oxygen and moisture are necessary for rusting.", "जंग लगने के लिए ऑक्सीजन और नमी दोनों आवश्यक हैं।", "medium", 910],
      ["7-science-pcc-11", ["rusting", "prevention"], "Painting an iron gate prevents rust mainly by:", "लोहे के फाटक पर पेंट जंग को मुख्यतः कैसे रोकता है?", ["Blocking air and moisture", "Making iron heavier", "Cooling the iron", "Removing all carbon"], ["हवा और नमी को रोककर", "लोहे को भारी बनाकर", "लोहे को ठंडा करके", "सारा कार्बन हटाकर"], 0, ["Paint forms a protective layer.", "पेंट सुरक्षात्मक परत बनाता है।"], "Paint separates iron from oxygen and moisture.", "पेंट लोहे को ऑक्सीजन और नमी से अलग रखता है।", "medium", 920],
      ["7-science-pcc-12", ["galvanisation", "rusting"], "Coating iron with zinc to prevent rusting is called:", "जंग रोकने के लिए लोहे पर जस्ता चढ़ाने की प्रक्रिया क्या कहलाती है?", ["Galvanisation", "Crystallisation", "Condensation", "Sublimation"], ["यशदलेपन", "क्रिस्टलीकरण", "संघनन", "उर्ध्वपातन"], 0, ["Zinc protects the iron surface.", "जस्ता लोहे की सतह की रक्षा करता है।"], "Galvanisation is the protective coating of zinc on iron.", "यशदलेपन में लोहे पर जस्ते की सुरक्षात्मक परत चढ़ाई जाती है।", "medium", 930],
      ["7-science-pcc-13", ["displacement", "copper-sulphate"], "An iron nail placed in copper sulphate solution gets a brown coating of:", "कॉपर सल्फेट विलयन में रखी लोहे की कील पर किसकी भूरी परत जमती है?", ["Copper", "Iron", "Sulphur", "Zinc"], ["ताँबा", "लोहा", "गंधक", "जस्ता"], 0, ["Iron displaces a less reactive metal.", "लोहा कम अभिक्रियाशील धातु को विस्थापित करता है।"], "Iron displaces copper, which deposits on the nail.", "लोहा ताँबे को विस्थापित करता है और ताँबा कील पर जमता है।", "hard", 1000],
      ["7-science-pcc-14", ["displacement", "observation"], "During the iron nail and copper sulphate experiment, the blue solution turns:", "लोहे की कील और कॉपर सल्फेट के प्रयोग में नीला विलयन किस रंग का हो जाता है?", ["Green", "Red", "Black", "Colourless"], ["हरा", "लाल", "काला", "रंगहीन"], 0, ["Iron sulphate forms.", "आयरन सल्फेट बनता है।"], "Green iron sulphate forms when iron displaces copper.", "लोहा ताँबे को विस्थापित करता है और हरा आयरन सल्फेट बनता है।", "hard", 1010],
      ["7-science-pcc-15", ["crystallization", "purification"], "Why is crystallisation preferred to simply evaporating a salt solution to dryness?", "नमक के विलयन को पूरी तरह वाष्पित करने की अपेक्षा क्रिस्टलीकरण क्यों बेहतर है?", ["It yields purer crystals", "It destroys the salt", "It adds impurities", "It always forms a gas"], ["इससे अधिक शुद्ध क्रिस्टल मिलते हैं", "यह नमक नष्ट करता है", "यह अशुद्धियाँ मिलाता है", "यह हमेशा गैस बनाता है"], 0, ["Some solids decompose on strong heating.", "कुछ ठोस तेज गर्म करने पर अपघटित होते हैं।"], "Crystallisation separates a pure solid without excessive heating.", "क्रिस्टलीकरण अधिक गर्म किए बिना शुद्ध ठोस अलग करता है।", "hard", 1020],
      ["7-science-pcc-16", ["reversible", "physical-change"], "Which change is reversible?", "कौन-सा परिवर्तन उत्क्रमणीय है?", ["Freezing melted wax", "Burning wax", "Rusting iron", "Curdling milk"], ["पिघले मोम का जमना", "मोम का जलना", "लोहे पर जंग लगना", "दूध का दही बनना"], 0, ["The original material can be recovered.", "मूल पदार्थ वापस पाया जा सकता है।"], "Melted wax can solidify again without forming a new substance.", "पिघला मोम बिना नया पदार्थ बनाए फिर ठोस हो सकता है।", "medium", 940],
      ["7-science-pcc-17", ["chemical-change", "energy"], "A chemical change may be accompanied by:", "रासायनिक परिवर्तन के साथ क्या हो सकता है?", ["Heat, light, sound or gas", "Only change in position", "Only cutting", "No observable effect ever"], ["ऊष्मा, प्रकाश, ध्वनि या गैस", "केवल स्थान परिवर्तन", "केवल काटना", "कभी कोई दिखाई देने वाला प्रभाव नहीं"], 0, ["Reactions may release energy or gas.", "अभिक्रियाएँ ऊर्जा या गैस छोड़ सकती हैं।"], "Chemical reactions often show energy change, gas, precipitate or colour change.", "रासायनिक अभिक्रियाओं में ऊर्जा, गैस, अवक्षेप या रंग परिवर्तन दिख सकता है।", "medium", 950],
      ["7-science-pcc-18", ["reasoning", "candle"], "A burning candle shows both physical and chemical changes because:", "जलती मोमबत्ती भौतिक और रासायनिक दोनों परिवर्तन क्यों दिखाती है?", ["Wax melts and wax vapour burns", "Only its colour changes", "The wick only shortens", "No new substance forms"], ["मोम पिघलता है और मोम-वाष्प जलती है", "केवल रंग बदलता है", "केवल बत्ती छोटी होती है", "कोई नया पदार्थ नहीं बनता"], 0, ["Separate melting from combustion.", "पिघलने और दहन को अलग समझें।"], "Melting wax is physical, while combustion forms new substances.", "मोम का पिघलना भौतिक है, जबकि दहन नए पदार्थ बनाता है।", "hard", 1030],
      ["7-science-pcc-19", ["experiment", "evidence"], "Fizzing begins when two colourless solutions are mixed. This most strongly suggests:", "दो रंगहीन विलयनों को मिलाने पर बुलबुले बनते हैं। यह किसका प्रबल संकेत है?", ["A gas-forming chemical change", "Only a size change", "Freezing", "Simple filtration"], ["गैस बनाने वाला रासायनिक परिवर्तन", "केवल आकार परिवर्तन", "जमना", "साधारण निस्यंदन"], 0, ["Bubbles can indicate a new gas.", "बुलबुले नई गैस का संकेत हो सकते हैं।"], "Formation of a new gas is evidence of a chemical reaction.", "नई गैस का बनना रासायनिक अभिक्रिया का प्रमाण है।", "hard", 1040],
      ["7-science-pcc-20", ["classification", "reasoning"], "Which pair contains only chemical changes?", "किस युग्म में केवल रासायनिक परिवर्तन हैं?", ["Rusting iron and burning paper", "Melting ice and boiling water", "Cutting wood and folding paper", "Dissolving sugar and melting wax"], ["लोहे पर जंग और कागज जलना", "बर्फ पिघलना और जल उबलना", "लकड़ी काटना और कागज मोड़ना", "चीनी घोलना और मोम पिघलना"], 0, ["Both must form new substances.", "दोनों में नए पदार्थ बनने चाहिए।"], "Rusting and burning both form substances with new compositions.", "जंग लगने और जलने दोनों में नए संघटन वाले पदार्थ बनते हैं।", "hard", 1050],
    ]),
  },
  {
    chapterNumber: 7,
    topicId: "science-weather-climate-adaptations",
    chapterTitle: "Weather, Climate and Adaptations of Animals to Climate",
    chapterTitleHindi: "मौसम, जलवायु और जलवायु के अनुसार जानवरों के अनुकूलन",
    questions: makeQuestionSet("science-weather-climate-adaptations", [
      ["7-science-wca-01", ["weather"], "Weather changes from day to day.", "मौसम दिन-प्रतिदिन बदलता है।", ["True", "False", "Only in winter", "Only in deserts"], ["सत्य", "असत्य", "केवल सर्दियों में", "केवल रेगिस्तान में"], 0, ["Weather is short-term.", "मौसम अल्पकालिक होता है।"], "Weather changes day to day.", "मौसम दिन-प्रतिदिन बदलता है।", "easy", 840],
      ["7-science-wca-02", ["climate"], "Climate means:", "जलवायु का अर्थ है:", ["Daily rain only", "Average weather over a long period", "Wind speed at one moment", "Temperature of a room"], ["केवल दैनिक वर्षा", "लंबी अवधि का औसत मौसम", "एक समय की पवन गति", "किसी कमरे का तापमान"], 1, ["It describes a place over years.", "यह किसी स्थान को वर्षों के आधार पर बताता है।"], "Climate is the average weather pattern over a long period.", "जलवायु लंबे समय की औसत मौसम स्थिति है।", "easy", 845],
      ["7-science-wca-03", ["adaptation"], "Polar bears have thick fur mainly to:", "ध्रुवीय भालू के घने बाल मुख्यतः किसलिए होते हैं?", ["Trap heat", "Catch fish only", "Fly in air", "Change colour"], ["ऊष्मा रोकने के लिए", "केवल मछली पकड़ने के लिए", "हवा में उड़ने के लिए", "रंग बदलने के लिए"], 0, ["It helps them survive in cold regions.", "यह उन्हें ठंडे क्षेत्रों में जीवित रहने में मदद करता है।"], "Thick fur helps polar bears trap heat.", "घने बाल ध्रुवीय भालू की ऊष्मा को रोकते हैं।", "easy", 850],
      ["7-science-wca-04", ["desert"], "Camels are well adapted to the desert because they:", "ऊँट रेगिस्तान के लिए अनुकूल होते हैं क्योंकि वे:", ["Need lots of water every hour", "Can store fat in the hump", "Cannot walk on sand", "Sleep only in water"], ["हर घंटे बहुत पानी चाहते हैं", "कूबड़ में वसा जमा कर सकते हैं", "रेत पर चल नहीं सकते", "केवल पानी में सोते हैं"], 1, ["The hump helps them survive.", "कूबड़ उन्हें जीवित रहने में मदद करता है।"], "Camels store fat in their hump.", "ऊँट अपने कूबड़ में वसा जमा करते हैं।", "easy", 855],
      ["7-science-wca-05", ["migration"], "Migration helps some birds:", "प्रवासन कुछ पक्षियों की कैसे मदद करता है?", ["Find food and better climate", "Grow roots", "Make salt", "Produce light"], ["भोजन और बेहतर जलवायु पाने में", "जड़ें बनाने में", "नमक बनाने में", "प्रकाश बनाने में"], 0, ["They move to suitable places.", "वे अनुकूल स्थानों पर चले जाते हैं।"], "Migration helps birds find food and suitable climate.", "प्रवासन पक्षियों को भोजन और उपयुक्त जलवायु खोजने में मदद करता है।", "medium", 930],
      ["7-science-wca-06", ["weather", "elements"], "Which set contains only elements of weather?", "किस समूह में केवल मौसम के तत्त्व हैं?", ["Temperature, humidity and rainfall", "Soil, rocks and minerals", "Roots, stems and leaves", "Latitude, longitude and altitude"], ["तापमान, आर्द्रता और वर्षा", "मिट्टी, चट्टान और खनिज", "जड़, तना और पत्ती", "अक्षांश, देशांतर और ऊँचाई"], 0, ["Think of daily atmospheric conditions.", "दैनिक वायुमंडलीय दशाओं को सोचें।"], "Temperature, humidity and rainfall are major weather elements.", "तापमान, आर्द्रता और वर्षा मौसम के प्रमुख तत्त्व हैं।", "easy", 860],
      ["7-science-wca-07", ["temperature", "instrument"], "Maximum and minimum temperatures are measured using a:", "अधिकतम और न्यूनतम तापमान किस यंत्र से मापे जाते हैं?", ["Maximum-minimum thermometer", "Rain gauge", "Wind vane", "Barometer only"], ["अधिकतम-न्यूनतम तापमापी", "वर्षामापी", "पवनदर्शी", "केवल वायुदाबमापी"], 0, ["Weather reports list both values.", "मौसम रिपोर्ट में दोनों मान होते हैं।"], "A maximum-minimum thermometer records the day's temperature extremes.", "अधिकतम-न्यूनतम तापमापी दिन के तापमान की चरम सीमाएँ दर्ज करता है।", "medium", 900],
      ["7-science-wca-08", ["rainfall", "instrument"], "The amount of rainfall is measured by a:", "वर्षा की मात्रा किससे मापी जाती है?", ["Rain gauge", "Thermometer", "Stethoscope", "Speedometer"], ["वर्षामापी", "तापमापी", "स्टेथोस्कोप", "गतिमापी"], 0, ["It collects rainwater.", "यह वर्षाजल एकत्र करता है।"], "A rain gauge measures rainfall at a place.", "वर्षामापी किसी स्थान की वर्षा मापता है।", "easy", 865],
      ["7-science-wca-09", ["weather", "temperature"], "The maximum temperature of a day usually occurs during the:", "दिन का अधिकतम तापमान सामान्यतः कब होता है?", ["Afternoon", "Early morning", "Midnight", "Just before sunrise"], ["दोपहर बाद", "सुबह जल्दी", "आधी रात", "सूर्योदय से ठीक पहले"], 0, ["Land keeps warming after noon.", "दोपहर के बाद भी भूमि गर्म होती रहती है।"], "Daily maximum temperature generally occurs in the afternoon.", "दैनिक अधिकतम तापमान सामान्यतः दोपहर बाद होता है।", "medium", 910],
      ["7-science-wca-10", ["climate", "data"], "To determine a region's climate, scientists study weather records for about:", "किसी क्षेत्र की जलवायु जानने के लिए वैज्ञानिक लगभग कितने समय के मौसम अभिलेख देखते हैं?", ["25 years or more", "One day", "One week", "One month"], ["25 वर्ष या अधिक", "एक दिन", "एक सप्ताह", "एक महीना"], 0, ["Climate is a long-term pattern.", "जलवायु दीर्घकालीन प्रतिरूप है।"], "Long-term weather records are needed to describe climate reliably.", "जलवायु के विश्वसनीय वर्णन के लिए दीर्घकालीन मौसम अभिलेख चाहिए।", "hard", 990],
      ["7-science-wca-11", ["polar-region", "adaptation"], "Which combination best helps a polar bear survive?", "कौन-सा संयोजन ध्रुवीय भालू को जीवित रहने में सबसे अधिक मदद करता है?", ["White fur, fat layer and wide paws", "Thin skin and narrow paws", "Long ears and little fat", "Scales and gills"], ["सफेद फर, वसा की परत और चौड़े पंजे", "पतली त्वचा और संकरे पंजे", "लंबे कान और कम वसा", "शल्क और गलफड़े"], 0, ["Consider warmth, camouflage and walking on snow.", "गर्मी, छद्मावरण और बर्फ पर चलने को सोचें।"], "These adaptations provide insulation, camouflage and support on snow.", "ये अनुकूलन ऊष्मारोधन, छद्मावरण और बर्फ पर सहारा देते हैं।", "hard", 1000],
      ["7-science-wca-12", ["polar-region", "penguin"], "Penguins huddle together mainly to:", "पेंगुइन मुख्यतः एक साथ झुंड बनाकर क्यों खड़े होते हैं?", ["Reduce heat loss", "Find plants", "Increase rainfall", "Change feather colour"], ["ऊष्मा हानि घटाने", "पौधे खोजने", "वर्षा बढ़ाने", "पंखों का रंग बदलने"], 0, ["The group shelters individuals from cold winds.", "समूह उन्हें ठंडी हवा से बचाता है।"], "Huddling conserves body heat in extreme cold.", "समूह में सटकर रहने से अत्यधिक ठंड में शरीर की ऊष्मा बचती है।", "medium", 920],
      ["7-science-wca-13", ["tropical-rainforest", "climate"], "Tropical rainforests are generally:", "उष्णकटिबंधीय वर्षावन सामान्यतः कैसे होते हैं?", ["Hot and wet", "Cold and dry", "Cold and snowy", "Dry with little rainfall"], ["गर्म और नम", "ठंडे और शुष्क", "ठंडे और बर्फीले", "बहुत कम वर्षा वाले शुष्क"], 0, ["They lie near the equator.", "वे भूमध्य रेखा के पास होते हैं।"], "Tropical rainforests receive abundant rain and remain warm.", "उष्णकटिबंधीय वर्षावनों में अधिक वर्षा होती है और गर्मी रहती है।", "easy", 870],
      ["7-science-wca-14", ["tropical-rainforest", "competition"], "Why do rainforest animals show many specialised adaptations?", "वर्षावन के जंतुओं में अनेक विशेष अनुकूलन क्यों होते हैं?", ["Intense competition for food and shelter", "There are no trees", "The region is always frozen", "No other animals live there"], ["भोजन और आश्रय के लिए तीव्र प्रतिस्पर्धा", "वहाँ पेड़ नहीं होते", "क्षेत्र हमेशा जमा रहता है", "वहाँ अन्य जंतु नहीं रहते"], 0, ["Many species share the same habitat.", "कई प्रजातियाँ एक ही आवास साझा करती हैं।"], "High biodiversity creates competition and favours specialised adaptations.", "अधिक जैव विविधता प्रतिस्पर्धा बढ़ाती है और विशेष अनुकूलनों को बढ़ावा देती है।", "hard", 1010],
      ["7-science-wca-15", ["adaptation", "elephant"], "An elephant's large ears help it to:", "हाथी के बड़े कान किसमें सहायता करते हैं?", ["Lose excess body heat", "Breathe underwater", "Climb thin branches", "Store food"], ["शरीर की अतिरिक्त ऊष्मा निकालने", "पानी के भीतर साँस लेने", "पतली डालियों पर चढ़ने", "भोजन जमा करने"], 0, ["Large surfaces release heat.", "बड़ी सतह ऊष्मा बाहर निकालती है।"], "Blood vessels in large ears help elephants cool their bodies.", "बड़े कानों की रक्त वाहिकाएँ हाथी के शरीर को ठंडा रखने में मदद करती हैं।", "medium", 930],
      ["7-science-wca-16", ["adaptation", "toucan"], "A toucan's large strong beak helps it to:", "टूकन की बड़ी मजबूत चोंच किसमें मदद करती है?", ["Reach fruit on weak branches", "Dig through ice", "Swim under polar ice", "Store water for months"], ["कमजोर डालियों के फल तक पहुँचने", "बर्फ खोदने", "ध्रुवीय बर्फ के नीचे तैरने", "महीनों तक पानी जमा करने"], 0, ["Its body need not move onto a thin branch.", "उसे पतली डाल पर शरीर ले जाने की जरूरत नहीं होती।"], "The beak lets a toucan reach distant fruit while remaining supported.", "चोंच टूकन को सहारा बनाए रखते हुए दूर के फल तक पहुँचाती है।", "medium", 940],
      ["7-science-wca-17", ["camouflage", "lion"], "The tawny colour of a lion is useful because it:", "शेर का पीला-भूरा रंग उपयोगी क्यों है?", ["Camouflages it in grass", "Keeps it underwater", "Produces food", "Measures temperature"], ["घास में छद्मावरण देता है", "पानी के भीतर रखता है", "भोजन बनाता है", "तापमान मापता है"], 0, ["It becomes less visible to prey.", "वह शिकार को कम दिखाई देता है।"], "Camouflage helps a lion approach prey without being noticed.", "छद्मावरण शेर को बिना दिखे शिकार के पास पहुँचने में मदद करता है।", "medium", 950],
      ["7-science-wca-18", ["adaptation", "monkey"], "Long tails and strong limbs help rainforest monkeys to:", "लंबी पूँछ और मजबूत अंग वर्षावन के बंदरों को किसमें मदद करते हैं?", ["Move among trees", "Live under sea ice", "Dig desert wells", "Make their own food"], ["पेड़ों के बीच चलने", "समुद्री बर्फ के नीचे रहने", "रेगिस्तान में कुएँ खोदने", "अपना भोजन बनाने"], 0, ["Their habitat has a dense canopy.", "उनके आवास में घना वृक्ष-वितान होता है।"], "These features support climbing, balancing and swinging through trees.", "ये विशेषताएँ पेड़ों पर चढ़ने, संतुलन और झूलने में सहायक हैं।", "easy", 875],
      ["7-science-wca-19", ["reasoning", "weather-climate"], "A city has one unusually cold day. What can be concluded?", "किसी शहर में एक दिन असामान्य ठंड पड़ती है। क्या निष्कर्ष निकाला जा सकता है?", ["It is a weather event, not proof of climate change", "Its climate has certainly changed", "The city has a polar climate", "No temperature was measured"], ["यह मौसम की घटना है, जलवायु परिवर्तन का प्रमाण नहीं", "उसकी जलवायु निश्चित रूप से बदल गई", "शहर की जलवायु ध्रुवीय है", "कोई तापमान नहीं मापा गया"], 0, ["Climate requires long-term evidence.", "जलवायु के लिए दीर्घकालीन प्रमाण चाहिए।"], "One day's condition describes weather; climate needs many years of data.", "एक दिन की दशा मौसम बताती है; जलवायु के लिए कई वर्षों के आँकड़े चाहिए।", "hard", 1030],
      ["7-science-wca-20", ["reasoning", "adaptation"], "If Arctic snow cover declined greatly, a white polar bear would first lose which advantage?", "यदि आर्कटिक की बर्फ बहुत घट जाए, तो सफेद ध्रुवीय भालू सबसे पहले कौन-सा लाभ खोएगा?", ["Camouflage", "Thick fat", "Sharp claws", "Sense of smell"], ["छद्मावरण", "मोटी वसा", "तीखे पंजे", "सूँघने की शक्ति"], 0, ["Compare white fur with the background.", "सफेद फर की पृष्ठभूमि से तुलना करें।"], "White fur conceals the bear against snow, so reduced snow weakens camouflage.", "सफेद फर बर्फ में भालू को छिपाता है, इसलिए बर्फ घटने पर छद्मावरण कमजोर होगा।", "hard", 1050],
    ]),
  },
  {
    chapterNumber: 8,
    topicId: "science-winds-storms-cyclones",
    chapterTitle: "Winds, Storms and Cyclones",
    chapterTitleHindi: "पवन, तूफान और चक्रवात",
    questions: makeQuestionSetFromConcepts("science-winds-storms-cyclones", [
      [
        "7-science-wsc-01",
        ["wind", "air-pressure"],
        "While flying a kite on a sunny afternoon, Aarav notices that the wind becomes stronger as the day progresses. Which scientific explanation best describes this observation?",
        "धूप वाले दिन पतंग उड़ाते समय आरव देखता है कि दिन बढ़ने के साथ हवा तेज हो जाती है। इसका सबसे उपयुक्त वैज्ञानिक कारण क्या है?",
        [
          "The Sun directly pushes the air towards Earth",
          "Uneven heating creates pressure differences that produce wind",
          "Clouds generate wind by rotating in the sky",
          "Trees release air that becomes wind"
        ],
        [
          "सूर्य सीधे हवा को पृथ्वी की ओर धकेलता है",
          "असमान ऊष्मन से दाब में अंतर बनता है जिससे पवन उत्पन्न होती है",
          "बादल घूमकर हवा बनाते हैं",
          "पेड़ हवा छोड़ते हैं जो पवन बन जाती है"
        ],
        1,
        ["Think about air pressure.", "Wind is linked to unequal heating."],
        "Unequal heating of land and air creates pressure differences, causing wind.",
        "असमान ऊष्मन दाब में अंतर उत्पन्न करता है जिससे पवन चलती है।",
        "medium",
        900
      ],

      [
        "7-science-wsc-02",
        ["pressure", "experiment"],
        "A student crushes an empty plastic bottle after pouring hot water into it and then cooling it rapidly. What does this experiment primarily demonstrate?",
        "एक विद्यार्थी गर्म पानी डालकर बोतल को गर्म करता है और फिर उसे तेजी से ठंडा कर देता है, जिससे बोतल दब जाती है। यह प्रयोग मुख्यतः क्या दर्शाता है?",
        [
          "Water expands permanently",
          "Air exerts pressure",
          "Plastic becomes weak",
          "Hot water removes oxygen"
        ],
        [
          "पानी स्थायी रूप से फैल जाता है",
          "वायु दाब डालती है",
          "प्लास्टिक कमजोर हो जाता है",
          "गर्म पानी ऑक्सीजन हटा देता है"
        ],
        1,
        ["Think about the role of air inside and outside the bottle."],
        "The experiment demonstrates atmospheric pressure exerted by air.",
        "यह प्रयोग वायुमंडलीय दाब को दर्शाता है।",
        "medium",
        910
      ],

      [
        "7-science-wsc-03",
        ["sea-breeze", "application"],
        "During summer afternoons, people living near the coast often experience cool winds blowing from the sea toward the land. This phenomenon is called:",
        "गर्मियों की दोपहर में समुद्र तट के पास रहने वाले लोग समुद्र से भूमि की ओर ठंडी हवा महसूस करते हैं। इस घटना को क्या कहते हैं?",
        [
          "Land breeze",
          "Sea breeze",
          "Cyclonic wind",
          "Jet stream"
        ],
        [
          "स्थलीय समीर",
          "समुद्री समीर",
          "चक्रवाती पवन",
          "जेट धारा"
        ],
        1,
        ["Land heats faster than water."],
        "Sea breeze occurs because land becomes hotter than sea during daytime.",
        "दिन में भूमि समुद्र से अधिक गर्म हो जाती है, इसलिए समुद्री समीर चलती है।",
        "easy",
        860
      ],

      [
        "7-science-wsc-04",
        ["land-breeze"],
        "A fisherman notices that at night the wind direction reverses and blows from land toward the sea. What is the most likely reason?",
        "एक मछुआरा देखता है कि रात में हवा भूमि से समुद्र की ओर चलती है। इसका सबसे संभावित कारण क्या है?",
        [
          "Sea cools faster than land",
          "Land cools faster than sea",
          "Moon attracts air",
          "Clouds block the wind"
        ],
        [
          "समुद्र भूमि से जल्दी ठंडा होता है",
          "भूमि समुद्र से जल्दी ठंडी होती है",
          "चंद्रमा हवा को आकर्षित करता है",
          "बादल हवा को रोकते हैं"
        ],
        1,
        ["Compare heating and cooling rates."],
        "At night, land cools faster, creating pressure differences that cause land breeze.",
        "रात में भूमि तेजी से ठंडी होती है, जिससे स्थलीय समीर उत्पन्न होती है।",
        "medium",
        905
      ],

      [
        "7-science-wsc-05",
        ["cyclone", "formation"],
        "Meteorologists closely monitor regions over warm oceans where large amounts of moist air are rising continuously. Why are such regions important?",
        "मौसम वैज्ञानिक गर्म समुद्रों के ऊपर उठती नम हवा वाले क्षेत्रों पर विशेष ध्यान देते हैं। क्यों?",
        [
          "These areas often develop cyclones",
          "These areas stop rainfall",
          "These areas produce earthquakes",
          "These areas prevent cloud formation"
        ],
        [
          "ये क्षेत्र अक्सर चक्रवात विकसित करते हैं",
          "ये क्षेत्र वर्षा रोकते हैं",
          "ये क्षेत्र भूकंप उत्पन्न करते हैं",
          "ये क्षेत्र बादल बनने से रोकते हैं"
        ],
        0,
        ["Warm oceans provide energy."],
        "Warm oceans supply energy required for cyclone formation.",
        "गर्म समुद्र चक्रवात बनने के लिए ऊर्जा प्रदान करते हैं।",
        "medium",
        940
      ],

      [
        "7-science-wsc-06",
        ["cyclone-eye"],
        "Satellite images show a nearly circular cyclone with a calm region at its centre. This calm central region is known as:",
        "उपग्रह चित्र में चक्रवात के केंद्र में एक शांत क्षेत्र दिखाई देता है। इसे क्या कहा जाता है?",
        [
          "Eye",
          "Ring",
          "Core wall",
          "Centre vortex"
        ],
        [
          "आंख",
          "वलय",
          "मुख्य दीवार",
          "केंद्रीय भंवर"
        ],
        0,
        ["It is surprisingly calm despite the surrounding storm."],
        "The calm central part of a cyclone is called the eye.",
        "चक्रवात के शांत केंद्रीय भाग को आंख कहते हैं।",
        "easy",
        920
      ],

      [
        "7-science-wsc-07",
        ["anemometer"],
        "A weather station needs to measure how fast the wind is blowing every hour. Which instrument would be most appropriate?",
        "एक मौसम केंद्र को प्रति घंटे हवा की गति मापनी है। इसके लिए कौन-सा उपकरण सबसे उपयुक्त होगा?",
        [
          "Anemometer",
          "Thermometer",
          "Barometer",
          "Hygrometer"
        ],
        [
          "एनीमोमीटर",
          "थर्मामीटर",
          "बैरोमीटर",
          "हाइग्रोमीटर"
        ],
        0,
        ["It specifically measures wind speed."],
        "An anemometer is used to measure wind speed.",
        "एनीमोमीटर पवन वेग मापता है।",
        "easy",
        875
      ],

      [
        "7-science-wsc-08",
        ["storm-safety"],
        "During a thunderstorm, Meera is standing in an open playground. Which action is the safest?",
        "गरज-चमक वाले तूफान के दौरान मीरा खुले मैदान में खड़ी है। सबसे सुरक्षित कार्य क्या होगा?",
        [
          "Stand under the tallest tree",
          "Move to a strong building immediately",
          "Hold a metal rod",
          "Stand near electric poles"
        ],
        [
          "सबसे ऊँचे पेड़ के नीचे खड़ी हो जाए",
          "तुरंत किसी मजबूत भवन में चली जाए",
          "धातु की छड़ पकड़ ले",
          "बिजली के खंभे के पास खड़ी रहे"
        ],
        1,
        ["Lightning often strikes tall conductive objects."],
        "The safest place during a thunderstorm is inside a strong building.",
        "गरज-चमक वाले तूफान में मजबूत भवन के अंदर रहना सबसे सुरक्षित है।",
        "easy",
        890
      ],

      [
        "7-science-wsc-09",
        ["pressure", "reasoning"],
        "If the atmospheric pressure at a coastal city suddenly decreases significantly while temperature remains high, what weather event becomes more likely?",
        "यदि किसी तटीय शहर में वायुदाब अचानक बहुत कम हो जाए और तापमान ऊँचा बना रहे, तो कौन-सी घटना की संभावना बढ़ जाती है?",
        [
          "Cyclone formation",
          "Snowfall",
          "Drought",
          "Solar eclipse"
        ],
        [
          "चक्रवात का निर्माण",
          "हिमपात",
          "सूखा",
          "सूर्य ग्रहण"
        ],
        0,
        ["Low pressure systems are important."],
        "Strong low-pressure systems over warm regions can develop into cyclones.",
        "गर्म क्षेत्रों में शक्तिशाली निम्न दाब प्रणाली चक्रवात में विकसित हो सकती है।",
        "hard",
        995
      ],

      [
        "7-science-wsc-10",
        ["air-expansion", "heat"],
        "A balloon partially filled with air is placed in sunlight for several minutes. Which observation is most likely and why?",
        "हवा से आंशिक रूप से भरा गुब्बारा कुछ मिनटों तक धूप में रखा जाता है। कौन-सा अवलोकन सबसे संभावित है और क्यों?",
        [
          "The balloon shrinks because air escapes",
          "The balloon expands because heated air occupies more space",
          "The balloon becomes heavier",
          "The balloon changes colour due to pressure"
        ],
        [
          "गुब्बारा सिकुड़ जाता है क्योंकि हवा निकल जाती है",
          "गुब्बारा फैलता है क्योंकि गर्म हवा अधिक स्थान घेरती है",
          "गुब्बारा भारी हो जाता है",
          "दाब के कारण गुब्बारे का रंग बदल जाता है"
        ],
        1,
        ["Heating causes gases to expand."],
        "Air expands when heated, causing the balloon to enlarge.",
        "गर्म होने पर वायु फैलती है जिससे गुब्बारा बड़ा हो जाता है।",
        "medium",
        930
      ],
      [
      "7-science-wsc-11",
      ["cyclone", "warning-system"],
      "A coastal village receives an official cyclone warning stating that the storm is expected to make landfall within 24 hours. Which action should be given the highest priority by local authorities?",
      "एक तटीय गाँव को आधिकारिक चक्रवात चेतावनी मिलती है कि तूफान अगले 24 घंटों में तट से टकरा सकता है। स्थानीय प्रशासन को सबसे पहले क्या करना चाहिए?",
      [
        "Organise outdoor cultural events",
        "Evacuate people from vulnerable areas to safe shelters",
        "Encourage fishing activities before the storm",
        "Wait until the cyclone arrives before taking action"
      ],
      [
        "खुले में सांस्कृतिक कार्यक्रम आयोजित करना",
        "संवेदनशील क्षेत्रों के लोगों को सुरक्षित आश्रयों में पहुँचाना",
        "तूफान से पहले मछली पकड़ने को बढ़ावा देना",
        "चक्रवात आने तक प्रतीक्षा करना"
      ],
      1,
      ["Think about disaster preparedness.", "Human safety comes first."],
      "Evacuation to cyclone shelters is the most important immediate action.",
      "लोगों को सुरक्षित आश्रयों में पहुँचाना सबसे महत्वपूर्ण प्राथमिक कदम है।",
      "medium",
      945
    ],

    [
      "7-science-wsc-12",
      ["air-pressure", "reasoning"],
      "A weather map shows a region where air pressure is continuously decreasing over several days. What does this most likely indicate?",
      "मौसम मानचित्र में किसी क्षेत्र का वायुदाब कई दिनों तक लगातार घटता दिख रहा है। यह सबसे अधिक किसका संकेत है?",
      [
        "Development of a low-pressure weather system",
        "Permanent clear skies",
        "End of all wind movement",
        "Formation of mountains"
      ],
      [
        "निम्न दाब प्रणाली का विकास",
        "स्थायी साफ मौसम",
        "हवा का पूरी तरह रुक जाना",
        "पर्वतों का निर्माण"
      ],
      0,
      ["Low pressure is associated with unstable weather."],
      "Falling air pressure usually indicates the formation of a low-pressure system and possible storms.",
      "घटता वायुदाब सामान्यतः निम्न दाब प्रणाली और संभावित तूफानों का संकेत देता है।",
      "hard",
      980
    ],

    [
      "7-science-wsc-13",
      ["thunderstorm", "lightning"],
      "During a thunderstorm, which location would generally be the most dangerous for a person seeking shelter?",
      "गरज-चमक वाले तूफान के दौरान आश्रय खोज रहे व्यक्ति के लिए कौन-सा स्थान सबसे अधिक खतरनाक होगा?",
      [
        "Inside a concrete building",
        "Inside a closed vehicle",
        "Under an isolated tall tree",
        "Inside a cyclone shelter"
      ],
      [
        "कंक्रीट भवन के अंदर",
        "बंद वाहन के अंदर",
        "अकेले खड़े ऊँचे पेड़ के नीचे",
        "चक्रवात आश्रय के अंदर"
      ],
      2,
      ["Lightning often strikes tall isolated objects."],
      "Standing under an isolated tall tree is highly dangerous during lightning.",
      "बिजली गिरने के समय अकेले ऊँचे पेड़ के नीचे खड़ा होना अत्यंत खतरनाक है।",
      "medium",
      950
    ],

    [
      "7-science-wsc-14",
      ["cyclone", "eye-wall"],
      "Scientists observe that the strongest winds and heaviest rainfall occur not in the eye but around it. This surrounding region is known as:",
      "वैज्ञानिक देखते हैं कि सबसे तेज हवाएँ और भारी वर्षा चक्रवात की आँख में नहीं बल्कि उसके चारों ओर होती है। इस क्षेत्र को क्या कहते हैं?",
      [
        "Eye wall",
        "Pressure ring",
        "Core zone",
        "Storm boundary"
      ],
      [
        "आई वॉल",
        "दाब वलय",
        "मुख्य क्षेत्र",
        "तूफान सीमा"
      ],
      0,
      ["It surrounds the eye of the cyclone."],
      "The eye wall contains the strongest winds and intense rainfall.",
      "आई वॉल में सबसे तेज हवाएँ और भारी वर्षा होती है।",
      "hard",
      1000
    ],

    [
      "7-science-wsc-15",
      ["wind-speed", "measurement"],
      "Two nearby weather stations report different wind speeds during the same storm. Which factor could most reasonably explain the difference?",
      "एक ही तूफान के दौरान दो पास के मौसम केंद्र अलग-अलग पवन वेग बताते हैं। इसका सबसे उचित कारण क्या हो सकता है?",
      [
        "Local terrain and obstacles affecting wind flow",
        "Wind speed is identical everywhere",
        "Air pressure has no effect on wind",
        "Weather stations cannot measure wind speed"
      ],
      [
        "स्थानीय भू-आकृति और अवरोध",
        "पवन वेग हर जगह समान होता है",
        "वायुदाब का पवन पर कोई प्रभाव नहीं",
        "मौसम केंद्र पवन वेग नहीं माप सकते"
      ],
      0,
      ["Think about buildings, hills and trees."],
      "Local geographical features can significantly influence wind speed.",
      "स्थानीय भू-आकृतियाँ और अवरोध पवन वेग को प्रभावित कर सकते हैं।",
      "hard",
      990
    ],

    [
      "7-science-wsc-16",
      ["storm-safety", "application"],
      "A family is indoors during a severe lightning storm. Which of the following activities should they avoid?",
      "एक परिवार तेज बिजली वाले तूफान के दौरान घर के अंदर है। उन्हें कौन-सी गतिविधि नहीं करनी चाहिए?",
      [
        "Staying away from windows",
        "Using wired electrical appliances",
        "Remaining inside the building",
        "Following weather updates"
      ],
      [
        "खिड़कियों से दूर रहना",
        "तार वाले विद्युत उपकरणों का उपयोग करना",
        "भवन के अंदर रहना",
        "मौसम संबंधी जानकारी लेते रहना"
      ],
      1,
      ["Lightning can travel through electrical wiring."],
      "Using wired electrical appliances during lightning storms can be dangerous.",
      "बिजली कड़कने के दौरान तार वाले विद्युत उपकरणों का उपयोग खतरनाक हो सकता है।",
      "medium",
      955
    ],

    [
      "7-science-wsc-17",
      ["air", "temperature"],
      "A bottle fitted with a balloon at its mouth is placed in hot water. The balloon inflates gradually. Which conclusion is best supported by this observation?",
      "मुंह पर गुब्बारा लगी बोतल को गर्म पानी में रखा जाता है और गुब्बारा धीरे-धीरे फूल जाता है। यह किस निष्कर्ष का समर्थन करता है?",
      [
        "Air contracts when heated",
        "Air expands when heated",
        "Hot water enters the balloon",
        "Pressure disappears on heating"
      ],
      [
        "गर्म होने पर वायु सिकुड़ती है",
        "गर्म होने पर वायु फैलती है",
        "गर्म पानी गुब्बारे में चला जाता है",
        "गर्म करने पर दाब समाप्त हो जाता है"
      ],
      1,
      ["Heating affects gas volume."],
      "The experiment demonstrates that air expands on heating.",
      "यह प्रयोग दर्शाता है कि गर्म करने पर वायु फैलती है।",
      "medium",
      935
    ],

    [
      "7-science-wsc-18",
      ["cyclone", "ocean"],
      "Why do powerful tropical cyclones generally weaken after moving over land?",
      "शक्तिशाली उष्णकटिबंधीय चक्रवात भूमि पर आने के बाद सामान्यतः कमजोर क्यों पड़ जाते हैं?",
      [
        "They lose access to warm ocean water that supplies energy",
        "Land increases wind speed everywhere",
        "Clouds disappear immediately",
        "Air pressure becomes zero"
      ],
      [
        "उन्हें गर्म समुद्री जल से मिलने वाली ऊर्जा नहीं मिलती",
        "भूमि हर जगह हवा की गति बढ़ा देती है",
        "बादल तुरंत समाप्त हो जाते हैं",
        "वायुदाब शून्य हो जाता है"
      ],
      0,
      ["Cyclones need a continuous energy source."],
      "Warm ocean water provides the energy required to sustain cyclones.",
      "गर्म समुद्री जल चक्रवात को ऊर्जा प्रदान करता है, इसलिए भूमि पर आने पर वे कमजोर पड़ जाते हैं।",
      "hard",
      1020
    ],

    [
      "7-science-wsc-19",
      ["weather", "forecasting"],
      "Modern weather forecasting relies heavily on satellites. Which information can satellites provide most effectively?",
      "आधुनिक मौसम पूर्वानुमान में उपग्रहों की महत्वपूर्ण भूमिका होती है। उपग्रह सबसे प्रभावी रूप से कौन-सी जानकारी प्रदान करते हैं?",
      [
        "Movement of clouds and developing storms",
        "Taste of rainwater",
        "Mineral content of soil only",
        "Underground water level only"
      ],
      [
        "बादलों और विकसित होते तूफानों की गति",
        "वर्षा जल का स्वाद",
        "केवल मिट्टी का खनिज स्तर",
        "केवल भूमिगत जल स्तर"
      ],
      0,
      ["Think about what satellites observe from space."],
      "Satellites track cloud patterns and storm development over large areas.",
      "उपग्रह बड़े क्षेत्रों में बादलों और तूफानों की गतिविधियों का पता लगाते हैं।",
      "medium",
      965
    ],

    [
      "7-science-wsc-20",
      ["cyclone", "multi-concept"],
      "A warm ocean, high humidity, rising air and a rapidly developing low-pressure region are observed together. What is the most scientifically reasonable prediction?",
      "गर्म समुद्र, अधिक आर्द्रता, ऊपर उठती हवा और तेजी से बनता निम्न दाब क्षेत्र एक साथ देखे जाते हैं। सबसे वैज्ञानिक पूर्वानुमान क्या होगा?",
      [
        "A cyclone may develop if conditions continue",
        "A solar eclipse is likely",
        "The ocean will freeze",
        "All winds will stop immediately"
      ],
      [
        "यदि परिस्थितियाँ बनी रहीं तो चक्रवात विकसित हो सकता है",
        "सूर्य ग्रहण होने की संभावना है",
        "समुद्र जम जाएगा",
        "सभी हवाएँ तुरंत रुक जाएँगी"
      ],
      0,
      ["Combine all the clues together."],
      "These are classic conditions favourable for cyclone formation.",
      "ये सभी परिस्थितियाँ चक्रवात निर्माण के लिए अनुकूल मानी जाती हैं।",
      "hard",
      1050
    ]

    ])
  },
    {
    chapterNumber: 9,
    topicId: "science-soil",
    chapterTitle: "Soil",
    chapterTitleHindi: "मिट्टी",
    questions: makeQuestionSetFromConcepts("science-soil", [

      [
        "7-science-soil-01",
        ["soil-formation"],
        "A rocky hill has been exposed to sunlight, rain, and wind for thousands of years. Over time, a thin layer of soil begins to form. Which process is mainly responsible for this change?",
        "एक चट्टानी पहाड़ी हजारों वर्षों तक सूर्य, वर्षा और हवा के संपर्क में रहती है। समय के साथ उस पर मिट्टी की पतली परत बन जाती है। इसका मुख्य कारण क्या है?",
        ["Weathering of rocks", "Photosynthesis", "Evaporation", "Condensation"],
        ["चट्टानों का अपक्षय", "प्रकाश संश्लेषण", "वाष्पीकरण", "संघनन"],
        0,
        ["Soil originates from rocks.", "Natural forces break rocks down."],
        "Soil forms through the gradual weathering of rocks by wind, water, temperature changes and living organisms.",
        "मिट्टी चट्टानों के अपक्षय से बनती है।",
        "easy",
        850
      ],

      [
        "7-science-soil-02",
        ["soil-profile"],
        "A student digs a deep pit and observes different layers of soil. Which layer generally contains the maximum amount of humus and living organisms?",
        "एक विद्यार्थी गड्ढा खोदकर मिट्टी की विभिन्न परतें देखता है। किस परत में सामान्यतः सबसे अधिक ह्यूमस और जीव पाए जाते हैं?",
        ["Topsoil", "Subsoil", "Parent rock", "Bedrock"],
        ["ऊपरी मिट्टी", "अधोमृदा", "मूल चट्टान", "आधार शिला"],
        0,
        ["Plants grow mostly in this layer."],
        "Topsoil contains humus, nutrients and most living organisms.",
        "ऊपरी मिट्टी में ह्यूमस, पोषक तत्व और अधिकांश जीव पाए जाते हैं।",
        "easy",
        860
      ],

      [
        "7-science-soil-03",
        ["humus"],
        "A farmer adds large amounts of decomposed leaves and plant remains to his field. Which property of the soil is most likely to improve?",
        "एक किसान अपने खेत में सड़ी हुई पत्तियाँ और पौधों के अवशेष मिलाता है। इससे मिट्टी का कौन-सा गुण सबसे अधिक सुधरेगा?",
        ["Fertility", "Colour of rocks", "Wind speed", "Air temperature"],
        ["उर्वरता", "चट्टानों का रंग", "पवन वेग", "वायु तापमान"],
        0,
        ["Humus enriches soil."],
        "Humus improves soil fertility and water-holding capacity.",
        "ह्यूमस मिट्टी की उर्वरता और जल धारण क्षमता बढ़ाता है।",
        "easy",
        870
      ],

      [
        "7-science-soil-04",
        ["percolation"],
        "Three soil samples are tested for water percolation. Sample A allows water to pass through very quickly. Which type of soil is Sample A most likely to be?",
        "तीन मिट्टी के नमूनों का जल रिसाव परीक्षण किया गया। नमूना A में पानी सबसे तेजी से नीचे जाता है। यह किस प्रकार की मिट्टी हो सकती है?",
        ["Sandy soil", "Clayey soil", "Loamy soil", "Humus only"],
        ["रेतीली मिट्टी", "चिकनी मिट्टी", "दोमट मिट्टी", "केवल ह्यूमस"],
        0,
        ["Think about particle size."],
        "Sandy soil has large particles and high percolation rate.",
        "रेतीली मिट्टी में बड़े कण होने के कारण जल तेजी से रिसता है।",
        "medium",
        900
      ],

      [
        "7-science-soil-05",
        ["water-retention"],
        "A gardener wants a soil that can hold a large amount of water for a long time. Which soil type would best meet this requirement?",
        "एक माली ऐसी मिट्टी चाहता है जो लंबे समय तक अधिक पानी रोक सके। कौन-सी मिट्टी सबसे उपयुक्त होगी?",
        ["Clayey soil", "Sandy soil", "Gravel", "Dry leaves"],
        ["चिकनी मिट्टी", "रेतीली मिट्टी", "कंकड़", "सूखी पत्तियाँ"],
        0,
        ["Smaller particles hold more water."],
        "Clayey soil has high water-holding capacity.",
        "चिकनी मिट्टी की जल धारण क्षमता अधिक होती है।",
        "medium",
        910
      ],

      [
        "7-science-soil-06",
        ["loamy-soil", "agriculture"],
        "Why is loamy soil considered ideal for growing many crops?",
        "अनेक फसलों की खेती के लिए दोमट मिट्टी को आदर्श क्यों माना जाता है?",
        [
          "It balances water retention, aeration and nutrients",
          "It contains no minerals",
          "It never dries",
          "It prevents root growth"
        ],
        [
          "इसमें जल धारण, वायु संचार और पोषक तत्वों का संतुलन होता है",
          "इसमें कोई खनिज नहीं होता",
          "यह कभी नहीं सूखती",
          "यह जड़ों की वृद्धि रोकती है"
        ],
        0,
        ["Think about crop requirements."],
        "Loamy soil provides a good balance of moisture, air and nutrients.",
        "दोमट मिट्टी में नमी, वायु और पोषक तत्वों का अच्छा संतुलन होता है।",
        "medium",
        920
      ],

      [
        "7-science-soil-07",
        ["soil-erosion"],
        "Heavy rainfall washes away the fertile upper layer of soil from a hillside. This process is called:",
        "भारी वर्षा पहाड़ी क्षेत्र की उपजाऊ ऊपरी मिट्टी को बहा ले जाती है। इस प्रक्रिया को क्या कहते हैं?",
        ["Soil erosion", "Soil formation", "Composting", "Germination"],
        ["मृदा अपरदन", "मृदा निर्माण", "कम्पोस्ट बनना", "अंकुरण"],
        0,
        ["Topsoil is being removed."],
        "The removal of topsoil by water or wind is called soil erosion.",
        "ऊपरी मिट्टी का हटना मृदा अपरदन कहलाता है।",
        "easy",
        875
      ],

      [
        "7-science-soil-08",
        ["soil-conservation"],
        "Which practice is most effective in reducing soil erosion on sloping land?",
        "ढलान वाली भूमि पर मृदा अपरदन कम करने के लिए कौन-सी विधि सबसे प्रभावी है?",
        ["Planting vegetation", "Removing all plants", "Overgrazing", "Burning grass"],
        ["वनस्पति लगाना", "सभी पौधों को हटाना", "अत्यधिक चराई", "घास जलाना"],
        0,
        ["Roots hold soil together."],
        "Plant roots bind soil particles and reduce erosion.",
        "पौधों की जड़ें मिट्टी को बाँधे रखती हैं और अपरदन कम करती हैं।",
        "medium",
        925
      ],

      [
        "7-science-soil-09",
        ["crop-selection"],
        "A farmer has land with high water retention and poor drainage. Which soil is most likely present?",
        "एक किसान की भूमि में पानी लंबे समय तक रुकता है और जल निकास कम है। वहाँ कौन-सी मिट्टी होने की संभावना है?",
        ["Clayey soil", "Sandy soil", "Rocky soil", "Gravel soil"],
        ["चिकनी मिट्टी", "रेतीली मिट्टी", "पथरीली मिट्टी", "कंकरीली मिट्टी"],
        0,
        ["Drainage is poor."],
        "Clayey soil retains water and drains slowly.",
        "चिकनी मिट्टी पानी को लंबे समय तक रोकती है।",
        "medium",
        930
      ],

      [
        "7-science-soil-10",
        ["soil-profile", "reasoning"],
        "Which soil layer is mainly made up of partially weathered rock fragments and lies below the subsoil?",
        "मिट्टी की कौन-सी परत मुख्यतः आंशिक रूप से अपक्षयित चट्टानों से बनी होती है और अधोमृदा के नीचे स्थित होती है?",
        ["Parent material", "Topsoil", "Humus", "Leaf litter"],
        ["मूल पदार्थ", "ऊपरी मिट्टी", "ह्यूमस", "पत्ती अवशेष"],
        0,
        ["It lies above bedrock."],
        "Parent material consists of weathered rock fragments.",
        "मूल पदार्थ अपक्षयित चट्टानों के टुकड़ों से बना होता है।",
        "medium",
        940
      ],

      [
        "7-science-soil-11",
        ["soil-organisms"],
        "Earthworms are often called the 'friends of farmers' because they:",
        "केंचुओं को 'किसानों का मित्र' क्यों कहा जाता है?",
        [
          "Improve soil aeration and fertility",
          "Prevent rainfall",
          "Destroy all microorganisms",
          "Reduce sunlight"
        ],
        [
          "मिट्टी में वायु संचार और उर्वरता बढ़ाते हैं",
          "वर्षा रोकते हैं",
          "सभी सूक्ष्मजीव नष्ट कर देते हैं",
          "सूर्यप्रकाश कम कर देते हैं"
        ],
        0,
        ["Earthworms loosen soil."],
        "Earthworms improve soil structure and fertility.",
        "केंचुए मिट्टी की संरचना और उर्वरता सुधारते हैं।",
        "easy",
        890
      ],

      [
        "7-science-soil-12",
        ["water-retention", "comparison"],
        "Two pots contain equal masses of sandy soil and clayey soil. After watering both equally, which pot is expected to retain more water after one day?",
        "दो गमलों में समान मात्रा में रेतीली और चिकनी मिट्टी है। दोनों में समान पानी देने के बाद एक दिन बाद किसमें अधिक पानी रहेगा?",
        ["Clayey soil pot", "Sandy soil pot", "Both equal", "Cannot be predicted"],
        ["चिकनी मिट्टी वाला गमला", "रेतीली मिट्टी वाला गमला", "दोनों समान", "नहीं बताया जा सकता"],
        0,
        ["Think about water-holding capacity."],
        "Clayey soil retains more water than sandy soil.",
        "चिकनी मिट्टी रेतीली मिट्टी की तुलना में अधिक पानी रोकती है।",
        "medium",
        945
      ],

      [
        "7-science-soil-13",
        ["soil-texture"],
        "Which property of soil is mainly determined by the relative proportions of sand, silt and clay?",
        "मिट्टी का कौन-सा गुण मुख्यतः रेत, गाद और चिकनी मिट्टी के अनुपात पर निर्भर करता है?",
        ["Texture", "Colour only", "Temperature only", "Humidity"],
        ["बनावट", "केवल रंग", "केवल तापमान", "आर्द्रता"],
        0,
        ["Texture depends on particle composition."],
        "Soil texture depends on the proportion of sand, silt and clay.",
        "मिट्टी की बनावट रेत, गाद और चिकनी मिट्टी के अनुपात पर निर्भर करती है।",
        "hard",
        970
      ],

      [
        "7-science-soil-14",
        ["erosion", "application"],
        "After a forest is cleared from a hillside, heavy rain causes large amounts of soil to be washed away. Which factor contributed most directly to this problem?",
        "पहाड़ी क्षेत्र से जंगल हटाने के बाद भारी वर्षा में बहुत-सी मिट्टी बह जाती है। इसका सबसे प्रत्यक्ष कारण क्या है?",
        [
          "Loss of roots that held the soil",
          "Increase in soil fertility",
          "Increase in humus",
          "Decrease in sunlight"
        ],
        [
          "मिट्टी को बाँधने वाली जड़ों का हटना",
          "उर्वरता बढ़ना",
          "ह्यूमस बढ़ना",
          "सूर्यप्रकाश कम होना"
        ],
        0,
        ["Roots prevent erosion."],
        "Tree roots help hold soil together and prevent erosion.",
        "पेड़ों की जड़ें मिट्टी को बाँधे रखती हैं।",
        "hard",
        980
      ],

      [
        "7-science-soil-15",
        ["soil-air"],
        "Why is the presence of air in soil important for healthy plant growth?",
        "स्वस्थ पौधों की वृद्धि के लिए मिट्टी में वायु का होना क्यों आवश्यक है?",
        [
          "Roots require oxygen for respiration",
          "Air increases soil colour",
          "Air produces sunlight",
          "Air prevents photosynthesis"
        ],
        [
          "जड़ों को श्वसन के लिए ऑक्सीजन चाहिए",
          "वायु मिट्टी का रंग बढ़ाती है",
          "वायु सूर्यप्रकाश बनाती है",
          "वायु प्रकाश संश्लेषण रोकती है"
        ],
        0,
        ["Roots are living tissues."],
        "Roots need oxygen from soil air for respiration.",
        "जड़ों को श्वसन के लिए ऑक्सीजन की आवश्यकता होती है।",
        "medium",
        950
      ],

      [
        "7-science-soil-16",
        ["agriculture", "reasoning"],
        "A crop requires both good drainage and sufficient water retention. Which soil would most likely maximize yield?",
        "एक फसल को अच्छा जल निकास और पर्याप्त जल धारण दोनों चाहिए। अधिक उत्पादन के लिए कौन-सी मिट्टी सबसे उपयुक्त होगी?",
        ["Loamy soil", "Pure sand", "Pure clay", "Solid rock"],
        ["दोमट मिट्टी", "शुद्ध रेत", "शुद्ध चिकनी मिट्टी", "ठोस चट्टान"],
        0,
        ["Think about balance."],
        "Loamy soil offers the best balance for most crops.",
        "अधिकांश फसलों के लिए दोमट मिट्टी सबसे संतुलित होती है।",
        "hard",
        990
      ],

      [
        "7-science-soil-17",
        ["percolation", "data-interpretation"],
        "Three soils have percolation rates of 3 mL/min, 12 mL/min and 20 mL/min respectively. Which soil is most likely sandy?",
        "तीन मिट्टियों की जल रिसाव दर क्रमशः 3, 12 और 20 mL/min है। इनमें से कौन-सी सबसे अधिक रेतीली होगी?",
        ["20 mL/min", "12 mL/min", "3 mL/min", "All equal"],
        ["20 mL/min", "12 mL/min", "3 mL/min", "सभी समान"],
        0,
        ["Higher percolation means larger particles."],
        "Sandy soil has the highest percolation rate.",
        "रेतीली मिट्टी में जल रिसाव दर सबसे अधिक होती है।",
        "hard",
        1000
      ],

      [
        "7-science-soil-18",
        ["soil-profile", "olympiad"],
        "A scientist discovers a soil layer rich in minerals leached from the upper layers but containing less humus. Which layer is this most likely to be?",
        "एक वैज्ञानिक ऐसी परत पाता है जिसमें ऊपर की परतों से आए खनिज अधिक हैं लेकिन ह्यूमस कम है। यह कौन-सी परत हो सकती है?",
        ["Subsoil", "Topsoil", "Leaf litter", "Bedrock"],
        ["अधोमृदा", "ऊपरी मिट्टी", "पत्ती अवशेष", "आधार शिला"],
        0,
        ["Below topsoil, minerals accumulate."],
        "Subsoil contains minerals washed down from upper layers.",
        "अधोमृदा में ऊपर से आए खनिज जमा होते हैं।",
        "hard",
        1010
      ],

      [
        "7-science-soil-19",
        ["soil-conservation", "multi-concept"],
        "Which combination would be most effective in reducing soil erosion and improving soil quality simultaneously?",
        "मृदा अपरदन कम करने और मिट्टी की गुणवत्ता बढ़ाने के लिए कौन-सा संयोजन सबसे प्रभावी होगा?",
        [
          "Planting trees and adding compost",
          "Removing vegetation and overgrazing",
          "Burning crop residues",
          "Frequent ploughing on steep slopes"
        ],
        [
          "पेड़ लगाना और कम्पोस्ट मिलाना",
          "वनस्पति हटाना और अत्यधिक चराई",
          "फसल अवशेष जलाना",
          "ढलानों पर बार-बार जुताई"
        ],
        0,
        ["Think about conservation and fertility together."],
        "Trees reduce erosion while compost improves soil quality.",
        "पेड़ अपरदन कम करते हैं और कम्पोस्ट मिट्टी की गुणवत्ता बढ़ाता है।",
        "hard",
        1025
      ],

      [
        "7-science-soil-20",
        ["soil", "olympiad", "reasoning"],
        "A region experiences rapid loss of fertile soil, decreasing crop yield, reduced vegetation and increased runoff after rains. Which explanation best connects all these observations?",
        "किसी क्षेत्र में उपजाऊ मिट्टी तेजी से कम हो रही है, फसल उत्पादन घट रहा है, वनस्पति कम हो रही है और वर्षा के बाद बहाव बढ़ रहा है। इन सभी का सबसे उपयुक्त कारण क्या है?",
        [
          "Severe soil erosion",
          "Increased humus formation",
          "Improved soil conservation",
          "Higher groundwater recharge"
        ],
        [
          "गंभीर मृदा अपरदन",
          "ह्यूमस निर्माण में वृद्धि",
          "बेहतर मृदा संरक्षण",
          "भूजल पुनर्भरण में वृद्धि"
        ],
        0,
        ["One process explains all observations."],
        "Severe soil erosion removes fertile topsoil and damages ecosystems.",
        "गंभीर मृदा अपरदन उपजाऊ ऊपरी मिट्टी को हटा देता है और पारिस्थितिकी तंत्र को प्रभावित करता है।",
        "hard",
        1050
      ]

    ])
  },
    {
    chapterNumber: 10,
    topicId: "science-respiration-in-organisms",
    chapterTitle: "Respiration in Organisms",
    chapterTitleHindi: "जीवों में श्वसन",
    questions: makeQuestionSetFromConcepts("science-respiration-in-organisms", [

      [
        "7-science-resp-01",
        ["respiration", "energy"],
        "A student believes that breathing and respiration are exactly the same process. Which statement best corrects this misconception?",
        "एक विद्यार्थी मानता है कि श्वास लेना और श्वसन बिल्कुल एक ही प्रक्रिया हैं। कौन-सा कथन इस गलतफहमी को सबसे अच्छी तरह दूर करता है?",
        [
          "Breathing is only the exchange of gases, while respiration releases energy from food inside cells",
          "Breathing and respiration are identical",
          "Respiration occurs only in lungs",
          "Breathing releases energy from food"
        ],
        [
          "श्वास लेना केवल गैसों का आदान-प्रदान है, जबकि श्वसन कोशिकाओं में भोजन से ऊर्जा मुक्त करता है",
          "श्वास और श्वसन समान हैं",
          "श्वसन केवल फेफड़ों में होता है",
          "श्वास भोजन से ऊर्जा मुक्त करता है"
        ],
        0,
        ["Think about cellular processes."],
        "Respiration is a cellular process that releases energy from food.",
        "श्वसन कोशिकाओं में होने वाली ऊर्जा मुक्त करने की प्रक्रिया है।",
        "medium",
        900
      ],

      [
        "7-science-resp-02",
        ["aerobic-respiration"],
        "During a long-distance race, the body requires a continuous supply of energy. Which process provides most of this energy under normal conditions?",
        "लंबी दौड़ के दौरान शरीर को लगातार ऊर्जा की आवश्यकता होती है। सामान्य परिस्थितियों में यह ऊर्जा मुख्यतः किस प्रक्रिया से प्राप्त होती है?",
        [
          "Aerobic respiration",
          "Photosynthesis",
          "Digestion only",
          "Transpiration"
        ],
        [
          "वायवीय श्वसन",
          "प्रकाश संश्लेषण",
          "केवल पाचन",
          "वाष्पोत्सर्जन"
        ],
        0,
        ["Oxygen is available."],
        "Aerobic respiration releases large amounts of energy in the presence of oxygen.",
        "ऑक्सीजन की उपस्थिति में वायवीय श्वसन अधिक ऊर्जा प्रदान करता है।",
        "easy",
        870
      ],

      [
        "7-science-resp-03",
        ["breathing-rate"],
        "After climbing several flights of stairs, Rohan notices that his breathing rate increases significantly. What is the primary reason?",
        "कई मंजिल सीढ़ियाँ चढ़ने के बाद रोहन की श्वास दर बढ़ जाती है। इसका मुख्य कारण क्या है?",
        [
          "Muscles require more oxygen and energy",
          "Lungs become larger",
          "Blood stops flowing normally",
          "The body produces less carbon dioxide"
        ],
        [
          "मांसपेशियों को अधिक ऑक्सीजन और ऊर्जा चाहिए",
          "फेफड़े बड़े हो जाते हैं",
          "रक्त प्रवाह रुक जाता है",
          "शरीर कम कार्बन डाइऑक्साइड बनाता है"
        ],
        0,
        ["Exercise increases energy demand."],
        "Physical activity increases the need for oxygen and energy.",
        "व्यायाम के दौरान शरीर को अधिक ऑक्सीजन और ऊर्जा की आवश्यकता होती है।",
        "easy",
        880
      ],

      [
        "7-science-resp-04",
        ["gas-exchange"],
        "Which structure in the human respiratory system provides the largest surface area for exchange of oxygen and carbon dioxide?",
        "मानव श्वसन तंत्र में कौन-सी संरचना ऑक्सीजन और कार्बन डाइऑक्साइड के आदान-प्रदान के लिए सबसे अधिक सतह क्षेत्र प्रदान करती है?",
        [
          "Alveoli",
          "Nostrils",
          "Trachea",
          "Diaphragm"
        ],
        [
          "वायुकोष",
          "नासाछिद्र",
          "श्वासनली",
          "डायाफ्राम"
        ],
        0,
        ["Tiny air sacs in the lungs."],
        "Alveoli provide a large surface area for efficient gas exchange.",
        "वायुकोष गैसों के आदान-प्रदान के लिए बड़ा सतह क्षेत्र प्रदान करते हैं।",
        "medium",
        910
      ],

      [
        "7-science-resp-05",
        ["anaerobic-respiration"],
        "A sprinter experiences muscle cramps after an intense race. Which explanation is most appropriate?",
        "तेज दौड़ के बाद एक धावक को मांसपेशियों में ऐंठन होती है। इसका सबसे उचित कारण क्या है?",
        [
          "Lactic acid accumulates due to anaerobic respiration",
          "Photosynthesis increases",
          "Muscles stop working permanently",
          "Blood contains too much oxygen"
        ],
        [
          "अवायवीय श्वसन के कारण लैक्टिक अम्ल जमा होता है",
          "प्रकाश संश्लेषण बढ़ जाता है",
          "मांसपेशियाँ स्थायी रूप से काम करना बंद कर देती हैं",
          "रक्त में बहुत अधिक ऑक्सीजन होती है"
        ],
        0,
        ["Think about oxygen shortage during intense exercise."],
        "Anaerobic respiration in muscles can produce lactic acid, causing cramps.",
        "तीव्र व्यायाम के दौरान अवायवीय श्वसन से लैक्टिक अम्ल बन सकता है।",
        "medium",
        930
      ],

      [
        "7-science-resp-06",
        ["yeast", "fermentation"],
        "A baker adds yeast to dough and observes that the dough rises after some time. What causes this increase in volume?",
        "एक बेकर आटे में यीस्ट मिलाता है और कुछ समय बाद आटा फूल जाता है। इसका कारण क्या है?",
        [
          "Carbon dioxide produced during anaerobic respiration",
          "Oxygen released by yeast",
          "Nitrogen production",
          "Water evaporation"
        ],
        [
          "अवायवीय श्वसन के दौरान बनी कार्बन डाइऑक्साइड",
          "यीस्ट द्वारा छोड़ी गई ऑक्सीजन",
          "नाइट्रोजन का निर्माण",
          "पानी का वाष्पीकरण"
        ],
        0,
        ["Gas bubbles make the dough expand."],
        "Yeast produces carbon dioxide during fermentation, making the dough rise.",
        "यीस्ट किण्वन के दौरान कार्बन डाइऑक्साइड बनाता है जिससे आटा फूलता है।",
        "medium",
        920
      ],

      [
        "7-science-resp-07",
        ["respiration-equation"],
        "Which combination correctly represents the products of aerobic respiration?",
        "वायवीय श्वसन के उत्पादों का सही संयोजन कौन-सा है?",
        [
          "Carbon dioxide, water and energy",
          "Glucose and oxygen",
          "Water and minerals only",
          "Protein and oxygen"
        ],
        [
          "कार्बन डाइऑक्साइड, पानी और ऊर्जा",
          "ग्लूकोज और ऑक्सीजन",
          "केवल पानी और खनिज",
          "प्रोटीन और ऑक्सीजन"
        ],
        0,
        ["Energy is released from food."],
        "Aerobic respiration produces carbon dioxide, water and energy.",
        "वायवीय श्वसन से कार्बन डाइऑक्साइड, पानी और ऊर्जा बनते हैं।",
        "easy",
        890
      ],

      [
        "7-science-resp-08",
        ["earthworm"],
        "Earthworms live underground where oxygen levels may be lower than on the surface. How do they obtain oxygen?",
        "केंचुए मिट्टी के अंदर रहते हैं जहाँ ऑक्सीजन कम हो सकती है। वे ऑक्सीजन कैसे प्राप्त करते हैं?",
        [
          "Through their moist skin",
          "Through lungs",
          "Through gills",
          "Through leaves"
        ],
        [
          "नम त्वचा के माध्यम से",
          "फेफड़ों द्वारा",
          "गलफड़ों द्वारा",
          "पत्तियों द्वारा"
        ],
        0,
        ["Earthworms breathe through their body surface."],
        "Earthworms exchange gases through moist skin.",
        "केंचुए नम त्वचा के माध्यम से गैसों का आदान-प्रदान करते हैं।",
        "medium",
        915
      ],

      [
        "7-science-resp-09",
        ["fish", "gills"],
        "Why would a fish struggle to survive if removed from water for a long time?",
        "यदि मछली को लंबे समय तक पानी से बाहर रखा जाए तो उसे जीवित रहने में कठिनाई क्यों होगी?",
        [
          "Its gills cannot efficiently absorb oxygen from air",
          "Its heart stops immediately",
          "Its blood disappears",
          "Its fins stop functioning"
        ],
        [
          "उसके गलफड़े हवा से प्रभावी रूप से ऑक्सीजन नहीं ले पाते",
          "उसका हृदय तुरंत रुक जाता है",
          "उसका रक्त समाप्त हो जाता है",
          "उसके पंख काम करना बंद कर देते हैं"
        ],
        0,
        ["Fish are adapted for aquatic respiration."],
        "Fish gills are specialized for extracting oxygen dissolved in water.",
        "मछलियों के गलफड़े पानी में घुली ऑक्सीजन लेने के लिए अनुकूलित होते हैं।",
        "medium",
        925
      ],

      [
        "7-science-resp-10",
        ["plants"],
        "Many students think only animals respire. Which statement is scientifically correct?",
        "कई विद्यार्थी सोचते हैं कि केवल जानवर ही श्वसन करते हैं। कौन-सा कथन वैज्ञानिक रूप से सही है?",
        [
          "Both plants and animals respire continuously",
          "Only animals respire",
          "Plants respire only at night",
          "Plants never require oxygen"
        ],
        [
          "पौधे और जानवर दोनों लगातार श्वसन करते हैं",
          "केवल जानवर श्वसन करते हैं",
          "पौधे केवल रात में श्वसन करते हैं",
          "पौधों को कभी ऑक्सीजन की आवश्यकता नहीं होती"
        ],
        0,
        ["Respiration occurs in all living cells."],
        "Plants respire throughout the day and night.",
        "पौधे दिन और रात दोनों समय श्वसन करते हैं।",
        "medium",
        940
      ],

      [
        "7-science-resp-11",
        ["stomata", "plants"],
        "Which structure is mainly responsible for gaseous exchange in plant leaves?",
        "पौधों की पत्तियों में गैसों के आदान-प्रदान के लिए मुख्यतः कौन-सी संरचना उत्तरदायी है?",
        ["Stomata", "Roots", "Flowers", "Seeds"],
        ["रंध्र", "जड़ें", "फूल", "बीज"],
        0,
        ["Tiny pores on leaves."],
        "Stomata allow gases to move in and out of leaves.",
        "रंध्र पत्तियों में गैसों के आदान-प्रदान में सहायता करते हैं।",
        "easy",
        900
      ],

      [
        "7-science-resp-12",
        ["lung-capacity"],
        "Why do trained athletes often have greater lung efficiency than non-athletes?",
        "प्रशिक्षित खिलाड़ियों की फेफड़ों की दक्षता सामान्य लोगों से अधिक क्यों होती है?",
        [
          "Regular exercise improves respiratory performance",
          "They do not respire",
          "They have fewer alveoli",
          "Their blood needs no oxygen"
        ],
        [
          "नियमित व्यायाम श्वसन क्षमता बढ़ाता है",
          "वे श्वसन नहीं करते",
          "उनके वायुकोष कम होते हैं",
          "उनके रक्त को ऑक्सीजन की आवश्यकता नहीं होती"
        ],
        0,
        ["Training improves oxygen utilization."],
        "Exercise strengthens respiratory efficiency and oxygen delivery.",
        "व्यायाम श्वसन दक्षता और ऑक्सीजन उपयोग को बेहतर बनाता है।",
        "medium",
        950
      ],

      [
        "7-science-resp-13",
        ["experiment", "carbon-dioxide"],
        "A student exhales air through lime water, causing it to turn milky. This demonstrates the presence of:",
        "एक विद्यार्थी चूने के पानी में साँस छोड़ता है और वह दूधिया हो जाता है। यह किसकी उपस्थिति दर्शाता है?",
        [
          "Carbon dioxide",
          "Nitrogen",
          "Hydrogen",
          "Oxygen"
        ],
        [
          "कार्बन डाइऑक्साइड",
          "नाइट्रोजन",
          "हाइड्रोजन",
          "ऑक्सीजन"
        ],
        0,
        ["Lime water test."],
        "Exhaled air contains carbon dioxide produced during respiration.",
        "श्वसन के दौरान बनी कार्बन डाइऑक्साइड साँस के साथ बाहर निकलती है।",
        "medium",
        955
      ],

      [
        "7-science-resp-14",
        ["cellular-respiration"],
        "Which statement best explains why respiration is essential even during sleep?",
        "नींद के दौरान भी श्वसन आवश्यक क्यों है?",
        [
          "Cells continuously require energy for life processes",
          "Food is digested only during sleep",
          "Oxygen is not needed while awake",
          "Respiration occurs only at night"
        ],
        [
          "कोशिकाओं को लगातार ऊर्जा की आवश्यकता होती है",
          "भोजन केवल नींद में पचता है",
          "जागते समय ऑक्सीजन की आवश्यकता नहीं होती",
          "श्वसन केवल रात में होता है"
        ],
        0,
        ["Life processes never stop completely."],
        "Cells require energy continuously, even during rest.",
        "कोशिकाओं को विश्राम के समय भी ऊर्जा की आवश्यकता होती है।",
        "hard",
        970
      ],

      [
        "7-science-resp-15",
        ["cockroach"],
        "Unlike humans, cockroaches do not use lungs for respiration. Which structures help them breathe?",
        "मनुष्यों के विपरीत तिलचट्टे फेफड़ों का उपयोग नहीं करते। वे किस संरचना से श्वसन करते हैं?",
        [
          "Spiracles and tracheal tubes",
          "Alveoli",
          "Gills",
          "Roots"
        ],
        [
          "स्पाइरिकल और श्वासनलिकाएँ",
          "वायुकोष",
          "गलफड़े",
          "जड़ें"
        ],
        0,
        ["Insects have a different respiratory system."],
        "Cockroaches respire through spiracles connected to tracheal tubes.",
        "तिलचट्टे स्पाइरिकल और श्वासनलिकाओं द्वारा श्वसन करते हैं।",
        "hard",
        980
      ],

      [
        "7-science-resp-16",
        ["anaerobic-vs-aerobic"],
        "Which statement correctly compares aerobic and anaerobic respiration?",
        "वायवीय और अवायवीय श्वसन की सही तुलना कौन-सी है?",
        [
          "Aerobic respiration releases more energy than anaerobic respiration",
          "Both release exactly the same energy",
          "Anaerobic respiration requires more oxygen",
          "Aerobic respiration occurs without oxygen"
        ],
        [
          "वायवीय श्वसन अवायवीय श्वसन से अधिक ऊर्जा देता है",
          "दोनों समान ऊर्जा देते हैं",
          "अवायवीय श्वसन को अधिक ऑक्सीजन चाहिए",
          "वायवीय श्वसन ऑक्सीजन के बिना होता है"
        ],
        0,
        ["Think about efficiency."],
        "Aerobic respiration is more efficient and releases more energy.",
        "वायवीय श्वसन अधिक ऊर्जा प्रदान करता है।",
        "hard",
        990
      ],

      [
        "7-science-resp-17",
        ["multi-concept"],
        "A person exercises intensely, breathes faster, produces more carbon dioxide and consumes more oxygen. What is the most logical explanation?",
        "एक व्यक्ति तीव्र व्यायाम करता है, तेजी से साँस लेता है, अधिक कार्बन डाइऑक्साइड बनाता है और अधिक ऑक्सीजन उपयोग करता है। इसका सबसे तार्किक कारण क्या है?",
        [
          "Cellular respiration has increased to meet energy demands",
          "Respiration has stopped",
          "Photosynthesis has started",
          "Blood circulation has ceased"
        ],
        [
          "ऊर्जा की आवश्यकता पूरी करने हेतु कोशिकीय श्वसन बढ़ गया है",
          "श्वसन रुक गया है",
          "प्रकाश संश्लेषण शुरू हो गया है",
          "रक्त संचार बंद हो गया है"
        ],
        0,
        ["Energy demand rises during exercise."],
        "Increased activity requires greater cellular respiration.",
        "अधिक गतिविधि के लिए अधिक कोशिकीय श्वसन आवश्यक होता है।",
        "hard",
        1000
      ],

      [
        "7-science-resp-18",
        ["data-interpretation"],
        "A student records breathing rates of 14, 18 and 30 breaths per minute during rest, walking and running respectively. Which conclusion is best supported?",
        "एक विद्यार्थी विश्राम, चलने और दौड़ने के दौरान क्रमशः 14, 18 और 30 श्वास प्रति मिनट दर्ज करता है। कौन-सा निष्कर्ष सही है?",
        [
          "Breathing rate increases with physical activity",
          "Breathing rate decreases during exercise",
          "Respiration stops while running",
          "Oxygen demand falls during activity"
        ],
        [
          "शारीरिक गतिविधि के साथ श्वास दर बढ़ती है",
          "व्यायाम के दौरान श्वास दर घटती है",
          "दौड़ते समय श्वसन रुक जाता है",
          "गतिविधि के दौरान ऑक्सीजन की आवश्यकता घटती है"
        ],
        0,
        ["Interpret the trend."],
        "Greater activity requires more oxygen, increasing breathing rate.",
        "अधिक गतिविधि पर ऑक्सीजन की आवश्यकता बढ़ती है।",
        "hard",
        1010
      ],

      [
        "7-science-resp-19",
        ["respiration", "olympiad"],
        "Which observation provides the strongest evidence that respiration is occurring inside living cells?",
        "कौन-सा अवलोकन यह सबसे मजबूत प्रमाण देता है कि जीवित कोशिकाओं में श्वसन हो रहा है?",
        [
          "Energy is continuously released for life processes",
          "Leaves appear green",
          "Water evaporates",
          "Plants grow toward light"
        ],
        [
          "जीवन प्रक्रियाओं के लिए लगातार ऊर्जा मुक्त होती है",
          "पत्तियाँ हरी दिखाई देती हैं",
          "पानी वाष्पित होता है",
          "पौधे प्रकाश की ओर बढ़ते हैं"
        ],
        0,
        ["Respiration's primary function."],
        "The release of usable energy is the defining outcome of respiration.",
        "ऊर्जा का मुक्त होना श्वसन की मुख्य विशेषता है।",
        "hard",
        1030
      ],

      [
        "7-science-resp-20",
        ["respiration", "reasoning", "olympiad"],
        "A living organism suddenly loses its ability to perform cellular respiration. Which consequence would occur first?",
        "यदि कोई जीव अचानक कोशिकीय श्वसन करने की क्षमता खो दे, तो सबसे पहले क्या होगा?",
        [
          "Energy supply for essential life processes would fail",
          "Photosynthesis would increase",
          "Body temperature would become infinite",
          "Water would stop existing in cells"
        ],
        [
          "जीवन प्रक्रियाओं के लिए ऊर्जा की आपूर्ति रुक जाएगी",
          "प्रकाश संश्लेषण बढ़ जाएगा",
          "शरीर का तापमान अनंत हो जाएगा",
          "कोशिकाओं में पानी समाप्त हो जाएगा"
        ],
        0,
        ["Think about the role of respiration."],
        "Without respiration, cells cannot obtain the energy needed for survival.",
        "श्वसन के बिना कोशिकाएँ आवश्यक ऊर्जा प्राप्त नहीं कर सकतीं।",
        "hard",
        1050
      ]

    ])
  },
    {
    chapterNumber: 11,
    topicId: "science-transportation-in-animals-and-plants",
    chapterTitle: "Transportation in Animals and Plants",
    chapterTitleHindi: "जंतुओं और पौधों में परिवहन",
    questions: makeQuestionSetFromConcepts("science-transportation-in-animals-and-plants", [

      [
        "7-science-tap-01",
        ["circulatory-system"],
        "A student says that food, oxygen and wastes can reach every cell of the body without any transport system. Which observation best proves that a transport system is necessary?",
        "एक विद्यार्थी कहता है कि भोजन, ऑक्सीजन और अपशिष्ट बिना किसी परिवहन तंत्र के शरीर की सभी कोशिकाओं तक पहुँच सकते हैं। कौन-सा तथ्य सिद्ध करता है कि परिवहन तंत्र आवश्यक है?",
        [
          "Human bodies contain billions of cells located far from food sources",
          "The body has skin",
          "Humans can walk",
          "Bones are hard"
        ],
        [
          "मानव शरीर में अरबों कोशिकाएँ होती हैं जो भोजन स्रोतों से दूर होती हैं",
          "शरीर में त्वचा होती है",
          "मनुष्य चल सकता है",
          "हड्डियाँ कठोर होती हैं"
        ],
        0,
        ["Think about distance inside the body."],
        "The transport system delivers materials efficiently to all body cells.",
        "परिवहन तंत्र शरीर की सभी कोशिकाओं तक पदार्थ पहुँचाता है।",
        "medium",
        900
      ],

      [
        "7-science-tap-02",
        ["blood"],
        "A doctor explains that blood is often called the transport medium of the body. Which substance is NOT primarily transported by blood?",
        "एक डॉक्टर बताता है कि रक्त को शरीर का परिवहन माध्यम कहा जाता है। इनमें से कौन-सा पदार्थ मुख्यतः रक्त द्वारा परिवाहित नहीं होता?",
        [
          "Food nutrients",
          "Oxygen",
          "Carbon dioxide",
          "Sunlight"
        ],
        [
          "पोषक तत्व",
          "ऑक्सीजन",
          "कार्बन डाइऑक्साइड",
          "सूर्यप्रकाश"
        ],
        3,
        ["Blood carries materials dissolved or suspended in it."],
        "Blood transports nutrients, gases and wastes but not sunlight.",
        "रक्त पोषक तत्व, गैसें और अपशिष्ट ले जाता है, सूर्यप्रकाश नहीं।",
        "easy",
        880
      ],

      [
        "7-science-tap-03",
        ["heart"],
        "The human heart beats continuously throughout life. What is the main purpose of these rhythmic contractions?",
        "मानव हृदय जीवनभर लगातार धड़कता रहता है। इन धड़कनों का मुख्य उद्देश्य क्या है?",
        [
          "To pump blood throughout the body",
          "To digest food",
          "To produce oxygen",
          "To remove bones"
        ],
        [
          "पूरे शरीर में रक्त पंप करना",
          "भोजन पचाना",
          "ऑक्सीजन बनाना",
          "हड्डियाँ हटाना"
        ],
        0,
        ["Think of the heart as a pump."],
        "The heart pumps blood to all parts of the body.",
        "हृदय पूरे शरीर में रक्त पंप करता है।",
        "easy",
        890
      ],

      [
        "7-science-tap-04",
        ["blood-components"],
        "A patient has a severe bacterial infection. Which blood component is most directly involved in defending the body?",
        "एक रोगी को गंभीर जीवाणु संक्रमण है। शरीर की रक्षा में कौन-सा रक्त घटक सबसे अधिक सीधे रूप से कार्य करता है?",
        [
          "Red blood cells",
          "White blood cells",
          "Platelets",
          "Plasma only"
        ],
        [
          "लाल रक्त कणिकाएँ",
          "श्वेत रक्त कणिकाएँ",
          "प्लेटलेट्स",
          "केवल प्लाज्मा"
        ],
        1,
        ["These cells fight disease-causing organisms."],
        "White blood cells protect the body against infections.",
        "श्वेत रक्त कणिकाएँ संक्रमण से रक्षा करती हैं।",
        "medium",
        920
      ],

      [
        "7-science-tap-05",
        ["rbc", "oxygen"],
        "A mountain climber requires efficient oxygen transport at high altitudes. Which blood component plays the most important role?",
        "एक पर्वतारोही को ऊँचाई पर प्रभावी ऑक्सीजन परिवहन की आवश्यकता होती है। कौन-सा रक्त घटक सबसे महत्वपूर्ण भूमिका निभाता है?",
        [
          "Red blood cells",
          "White blood cells",
          "Platelets",
          "Plasma proteins"
        ],
        [
          "लाल रक्त कणिकाएँ",
          "श्वेत रक्त कणिकाएँ",
          "प्लेटलेट्स",
          "प्लाज्मा प्रोटीन"
        ],
        0,
        ["Hemoglobin is important."],
        "Red blood cells transport oxygen using hemoglobin.",
        "लाल रक्त कणिकाएँ हीमोग्लोबिन की सहायता से ऑक्सीजन ले जाती हैं।",
        "medium",
        930
      ],

      [
        "7-science-tap-06",
        ["platelets"],
        "After accidentally cutting a finger, bleeding stops after some time. Which blood component is mainly responsible for this?",
        "उंगली कटने पर कुछ समय बाद रक्तस्राव रुक जाता है। इसके लिए मुख्यतः कौन-सा रक्त घटक जिम्मेदार है?",
        [
          "Platelets",
          "Red blood cells",
          "White blood cells",
          "Plasma water"
        ],
        [
          "प्लेटलेट्स",
          "लाल रक्त कणिकाएँ",
          "श्वेत रक्त कणिकाएँ",
          "प्लाज्मा जल"
        ],
        0,
        ["Think about clotting."],
        "Platelets help in blood clotting and prevent excessive bleeding.",
        "प्लेटलेट्स रक्त का थक्का बनाने में सहायता करते हैं।",
        "easy",
        900
      ],

      [
        "7-science-tap-07",
        ["pulse-rate"],
        "A student's pulse rate increases from 75 to 120 beats per minute after running. What is the most likely reason?",
        "दौड़ने के बाद एक विद्यार्थी की नाड़ी दर 75 से बढ़कर 120 प्रति मिनट हो जाती है। इसका सबसे संभावित कारण क्या है?",
        [
          "The body requires faster transport of oxygen and nutrients",
          "The heart becomes weaker",
          "Blood stops circulating",
          "Oxygen demand decreases"
        ],
        [
          "शरीर को ऑक्सीजन और पोषक तत्वों का तेज परिवहन चाहिए",
          "हृदय कमजोर हो जाता है",
          "रक्त संचार रुक जाता है",
          "ऑक्सीजन की आवश्यकता घट जाती है"
        ],
        0,
        ["Exercise increases demand."],
        "The heart pumps faster during physical activity.",
        "व्यायाम के दौरान हृदय तेजी से रक्त पंप करता है।",
        "medium",
        940
      ],

      [
        "7-science-tap-08",
        ["arteries-veins"],
        "Which statement correctly compares arteries and veins?",
        "धमनियों और शिराओं की सही तुलना कौन-सी है?",
        [
          "Arteries carry blood away from the heart; veins carry blood towards the heart",
          "Both always carry oxygen-rich blood",
          "Both always carry oxygen-poor blood",
          "Veins pump blood while arteries collect it"
        ],
        [
          "धमनियाँ रक्त को हृदय से दूर ले जाती हैं; शिराएँ रक्त को हृदय की ओर लाती हैं",
          "दोनों हमेशा ऑक्सीजन युक्त रक्त ले जाती हैं",
          "दोनों हमेशा ऑक्सीजन रहित रक्त ले जाती हैं",
          "शिराएँ रक्त पंप करती हैं"
        ],
        0,
        ["Focus on direction of blood flow."],
        "Arteries carry blood away from the heart, veins return it.",
        "धमनियाँ रक्त को हृदय से दूर और शिराएँ हृदय की ओर ले जाती हैं।",
        "hard",
        960
      ],

      [
        "7-science-tap-09",
        ["excretion"],
        "Cells continuously produce waste substances. Which organs remove many of these wastes from the blood?",
        "कोशिकाएँ लगातार अपशिष्ट पदार्थ बनाती हैं। रक्त से इन अपशिष्टों को हटाने का मुख्य कार्य कौन-से अंग करते हैं?",
        [
          "Kidneys",
          "Eyes",
          "Bones",
          "Teeth"
        ],
        [
          "गुर्दे",
          "आँखें",
          "हड्डियाँ",
          "दाँत"
        ],
        0,
        ["They filter blood."],
        "Kidneys remove wastes and excess water from blood.",
        "गुर्दे रक्त से अपशिष्ट पदार्थ हटाते हैं।",
        "easy",
        910
      ],

      [
        "7-science-tap-10",
        ["urine-formation"],
        "A doctor explains that urine is produced when kidneys filter blood. Which substance is normally useful and therefore largely retained by the body?",
        "एक डॉक्टर बताता है कि गुर्दे रक्त को छानकर मूत्र बनाते हैं। कौन-सा पदार्थ सामान्यतः उपयोगी होने के कारण शरीर में रखा जाता है?",
        [
          "Nutrients like glucose",
          "Urea",
          "Excess salts",
          "Toxic wastes"
        ],
        [
          "ग्लूकोज जैसे पोषक तत्व",
          "यूरिया",
          "अधिक लवण",
          "विषैले अपशिष्ट"
        ],
        0,
        ["Useful substances are reabsorbed."],
        "The body retains essential nutrients while removing wastes.",
        "शरीर आवश्यक पोषक तत्वों को सुरक्षित रखता है।",
        "medium",
        930
      ],

      [
        "7-science-tap-11",
        ["xylem"],
        "A tall tree transports water from roots to leaves several metres above the ground. Which tissue performs this function?",
        "एक ऊँचा पेड़ जड़ों से पत्तियों तक कई मीटर ऊपर पानी पहुँचाता है। यह कार्य कौन-सा ऊतक करता है?",
        [
          "Xylem",
          "Phloem",
          "Epidermis",
          "Cambium"
        ],
        [
          "जाइलम",
          "फ्लोएम",
          "एपिडर्मिस",
          "कैंबियम"
        ],
        0,
        ["Think about water transport."],
        "Xylem transports water and minerals upward.",
        "जाइलम पानी और खनिजों का परिवहन करता है।",
        "easy",
        920
      ],

      [
        "7-science-tap-12",
        ["phloem"],
        "Food prepared in leaves must reach roots, fruits and growing shoots. Which tissue carries this food?",
        "पत्तियों में बना भोजन जड़ों, फलों और बढ़ते भागों तक पहुँचना चाहिए। यह कार्य कौन-सा ऊतक करता है?",
        [
          "Phloem",
          "Xylem",
          "Cortex",
          "Root hair"
        ],
        [
          "फ्लोएम",
          "जाइलम",
          "कॉर्टेक्स",
          "मूल रोम"
        ],
        0,
        ["Food transport tissue."],
        "Phloem transports prepared food throughout the plant.",
        "फ्लोएम पौधे में भोजन का परिवहन करता है।",
        "easy",
        925
      ],

      [
        "7-science-tap-13",
        ["root-hairs"],
        "Which plant structure greatly increases the surface area for absorbing water and minerals from the soil?",
        "मिट्टी से पानी और खनिजों के अवशोषण के लिए सतह क्षेत्र बढ़ाने वाली संरचना कौन-सी है?",
        [
          "Root hairs",
          "Flowers",
          "Seeds",
          "Fruits"
        ],
        [
          "मूल रोम",
          "फूल",
          "बीज",
          "फल"
        ],
        0,
        ["Tiny projections on roots."],
        "Root hairs increase absorption efficiency.",
        "मूल रोम अवशोषण क्षमता बढ़ाते हैं।",
        "medium",
        935
      ],

      [
        "7-science-tap-14",
        ["transpiration"],
        "On a hot day, a plant loses water vapour through tiny pores in its leaves. This process is called:",
        "गर्म दिन में पौधा अपनी पत्तियों के छोटे छिद्रों से जलवाष्प खोता है। इस प्रक्रिया को क्या कहते हैं?",
        [
          "Transpiration",
          "Respiration",
          "Photosynthesis",
          "Germination"
        ],
        [
          "वाष्पोत्सर्जन",
          "श्वसन",
          "प्रकाश संश्लेषण",
          "अंकुरण"
        ],
        0,
        ["Water leaves the plant."],
        "Loss of water vapour from leaves is called transpiration.",
        "पत्तियों से जलवाष्प का निकलना वाष्पोत्सर्जन कहलाता है।",
        "easy",
        900
      ],

      [
        "7-science-tap-15",
        ["transpiration", "reasoning"],
        "How does transpiration help in the upward movement of water inside plants?",
        "वाष्पोत्सर्जन पौधों में पानी के ऊपर की ओर जाने में कैसे सहायता करता है?",
        [
          "It creates a pulling force in xylem vessels",
          "It destroys xylem tissue",
          "It blocks water absorption",
          "It converts water into food"
        ],
        [
          "यह जाइलम में खिंचाव बल उत्पन्न करता है",
          "यह जाइलम को नष्ट करता है",
          "यह जल अवशोषण रोकता है",
          "यह पानी को भोजन में बदलता है"
        ],
        0,
        ["Water loss creates tension."],
        "Transpiration pull helps draw water upward.",
        "वाष्पोत्सर्जन खिंचाव पानी को ऊपर खींचने में मदद करता है।",
        "hard",
        980
      ],

      [
        "7-science-tap-16",
        ["multi-concept"],
        "A plant's xylem tissue becomes severely damaged. Which consequence is most likely to occur first?",
        "यदि किसी पौधे का जाइलम ऊतक गंभीर रूप से क्षतिग्रस्त हो जाए, तो सबसे पहले क्या प्रभाव दिखाई देगा?",
        [
          "Reduced transport of water and minerals to leaves",
          "Food transport immediately increases",
          "Flowers turn into roots",
          "Photosynthesis becomes impossible instantly"
        ],
        [
          "पत्तियों तक पानी और खनिजों का परिवहन कम हो जाएगा",
          "भोजन परिवहन बढ़ जाएगा",
          "फूल जड़ों में बदल जाएँगे",
          "प्रकाश संश्लेषण तुरंत असंभव हो जाएगा"
        ],
        0,
        ["Xylem carries water."],
        "Damage to xylem disrupts water transport.",
        "जाइलम की क्षति जल परिवहन को बाधित करती है।",
        "hard",
        995
      ],

      [
        "7-science-tap-17",
        ["blood-circulation", "olympiad"],
        "Why must blood continuously circulate instead of remaining stationary in blood vessels?",
        "रक्त को लगातार परिसंचरण क्यों करना पड़ता है?",
        [
          "Cells continuously require oxygen, nutrients and waste removal",
          "Blood enjoys movement",
          "The heart cannot stop beating",
          "Bones require circulation only"
        ],
        [
          "कोशिकाओं को लगातार ऑक्सीजन, पोषक तत्व और अपशिष्ट निष्कासन चाहिए",
          "रक्त को चलना पसंद है",
          "हृदय रुक नहीं सकता",
          "केवल हड्डियों को परिसंचरण चाहिए"
        ],
        0,
        ["Think about cellular needs."],
        "Continuous circulation supports all living cells.",
        "निरंतर परिसंचरण सभी कोशिकाओं की आवश्यकताओं को पूरा करता है।",
        "hard",
        1000
      ],

      [
        "7-science-tap-18",
        ["kidneys", "data-interpretation"],
        "A person drinks a large quantity of water in a short time. Which organ will play the greatest role in maintaining water balance?",
        "कोई व्यक्ति कम समय में बहुत अधिक पानी पी लेता है। जल संतुलन बनाए रखने में कौन-सा अंग सबसे महत्वपूर्ण भूमिका निभाएगा?",
        [
          "Kidneys",
          "Heart",
          "Lungs",
          "Bones"
        ],
        [
          "गुर्दे",
          "हृदय",
          "फेफड़े",
          "हड्डियाँ"
        ],
        0,
        ["Water balance is regulated through urine."],
        "Kidneys adjust water excretion to maintain balance.",
        "गुर्दे जल संतुलन बनाए रखने में मदद करते हैं।",
        "hard",
        1010
      ],

      [
        "7-science-tap-19",
        ["plants", "comparison"],
        "Which statement correctly compares xylem and phloem?",
        "जाइलम और फ्लोएम की सही तुलना कौन-सी है?",
        [
          "Xylem transports water and minerals, while phloem transports food",
          "Both transport only water",
          "Both transport only food",
          "Phloem transports minerals and xylem transports sugar"
        ],
        [
          "जाइलम पानी और खनिज ले जाता है, जबकि फ्लोएम भोजन ले जाता है",
          "दोनों केवल पानी ले जाते हैं",
          "दोनों केवल भोजन ले जाते हैं",
          "फ्लोएम खनिज और जाइलम शर्करा ले जाता है"
        ],
        0,
        ["Know the functions of both tissues."],
        "Xylem and phloem perform different transport functions.",
        "जाइलम और फ्लोएम अलग-अलग परिवहन कार्य करते हैं।",
        "hard",
        1025
      ],

      [
        "7-science-tap-20",
        ["transport-system", "reasoning", "olympiad"],
        "A multicellular organism suddenly loses its ability to transport oxygen, nutrients and wastes between cells. Which outcome is most likely?",
        "यदि किसी बहुकोशिकीय जीव की कोशिकाओं के बीच ऑक्सीजन, पोषक तत्व और अपशिष्ट का परिवहन रुक जाए, तो सबसे संभावित परिणाम क्या होगा?",
        [
          "Essential life processes would rapidly fail",
          "Growth would increase dramatically",
          "Photosynthesis would begin",
          "The organism would become stronger"
        ],
        [
          "आवश्यक जीवन प्रक्रियाएँ तेजी से विफल हो जाएँगी",
          "वृद्धि बहुत बढ़ जाएगी",
          "प्रकाश संश्लेषण शुरू हो जाएगा",
          "जीव अधिक शक्तिशाली हो जाएगा"
        ],
        0,
        ["Transport is essential for survival."],
        "Without transport, cells cannot obtain resources or remove wastes.",
        "परिवहन के बिना कोशिकाएँ संसाधन प्राप्त या अपशिष्ट हटाने में असमर्थ होंगी।",
        "hard",
        1050
      ]

    ])
  },
    {
    chapterNumber: 12,
    topicId: "science-reproduction-in-plants",
    chapterTitle: "Reproduction in Plants",
    chapterTitleHindi: "पौधों में जनन",
    questions: makeQuestionSetFromConcepts("science-reproduction-in-plants", [

      [
        "7-science-rip-01",
        ["reproduction"],
        "A gardener notices that even after an old plant dies, new plants of the same kind continue to appear every year. Which biological process makes this possible?",
        "एक माली देखता है कि पुराना पौधा मर जाने के बाद भी उसी प्रकार के नए पौधे हर वर्ष उगते रहते हैं। यह किस जैविक प्रक्रिया के कारण संभव है?",
        ["Reproduction", "Respiration", "Transpiration", "Photosynthesis"],
        ["जनन", "श्वसन", "वाष्पोत्सर्जन", "प्रकाश संश्लेषण"],
        0,
        ["Living organisms produce new individuals."],
        "Reproduction ensures the continuity of a species.",
        "जनन किसी प्रजाति की निरंतरता बनाए रखता है।",
        "easy",
        870
      ],

      [
        "7-science-rip-02",
        ["asexual-reproduction", "budding"],
        "A biology student observes a small outgrowth developing on the body of a yeast cell. After some time, it separates and becomes an independent organism. This process is called:",
        "एक विद्यार्थी यीस्ट कोशिका पर एक छोटी उभार जैसी संरचना बनते हुए देखता है, जो बाद में अलग होकर नया जीव बन जाती है। इस प्रक्रिया को क्या कहते हैं?",
        ["Budding", "Fragmentation", "Spore formation", "Pollination"],
        ["मुकुलन", "खंडन", "बीजाणु निर्माण", "परागण"],
        0,
        ["A small bud develops on the parent."],
        "Yeast commonly reproduces by budding.",
        "यीस्ट सामान्यतः मुकुलन द्वारा जनन करता है।",
        "easy",
        890
      ],

      [
        "7-science-rip-03",
        ["fragmentation"],
        "A filament of Spirogyra accidentally breaks into several pieces in a pond. After a few days, each piece grows into a complete organism. This type of reproduction is known as:",
        "तालाब में स्पाइरोजाइरा का तंतु कई टुकड़ों में टूट जाता है। कुछ दिनों बाद प्रत्येक टुकड़ा पूर्ण जीव बन जाता है। इसे क्या कहते हैं?",
        ["Fragmentation", "Budding", "Pollination", "Germination"],
        ["खंडन", "मुकुलन", "परागण", "अंकुरण"],
        0,
        ["The parent breaks into fragments."],
        "Fragmentation occurs when each fragment develops into a new organism.",
        "खंडन में प्रत्येक भाग नया जीव बन जाता है।",
        "medium",
        910
      ],

      [
        "7-science-rip-04",
        ["spore-formation"],
        "Fungi can reproduce successfully even when conditions become unfavorable. Which adaptation helps many fungi survive and reproduce?",
        "कवक प्रतिकूल परिस्थितियों में भी सफलतापूर्वक जनन कर सकते हैं। इनमें कौन-सा अनुकूलन उनकी सहायता करता है?",
        ["Spore formation", "Flower formation", "Fruit formation", "Leaf fall"],
        ["बीजाणु निर्माण", "फूल बनना", "फल बनना", "पत्तियों का गिरना"],
        0,
        ["Spores are lightweight and resistant."],
        "Spores can survive harsh conditions and later develop into new organisms.",
        "बीजाणु कठिन परिस्थितियों में जीवित रह सकते हैं।",
        "medium",
        920
      ],

      [
        "7-science-rip-05",
        ["vegetative-propagation"],
        "A farmer plants pieces of potato tubers, and each piece develops into a new plant. This is an example of:",
        "एक किसान आलू के कंद के टुकड़े लगाता है और प्रत्येक टुकड़े से नया पौधा विकसित हो जाता है। यह किसका उदाहरण है?",
        [
          "Vegetative propagation",
          "Seed dispersal",
          "Pollination",
          "Fertilization"
        ],
        [
          "वानस्पतिक प्रवर्धन",
          "बीज प्रसार",
          "परागण",
          "निषेचन"
        ],
        0,
        ["New plants arise from vegetative parts."],
        "Potato reproduces through vegetative propagation using tubers.",
        "आलू कंदों द्वारा वानस्पतिक प्रवर्धन करता है।",
        "easy",
        900
      ],

      [
        "7-science-rip-06",
        ["vegetative-propagation", "stem"],
        "Which of the following plants is commonly propagated through stem cuttings rather than seeds?",
        "निम्नलिखित में से किस पौधे का प्रवर्धन सामान्यतः बीजों के बजाय तने की कलम द्वारा किया जाता है?",
        ["Rose", "Rice", "Wheat", "Maize"],
        ["गुलाब", "चावल", "गेहूँ", "मक्का"],
        0,
        ["Gardeners often use stem cuttings."],
        "Rose is commonly propagated through stem cuttings.",
        "गुलाब का प्रवर्धन प्रायः तने की कलम से किया जाता है।",
        "medium",
        910
      ],

      [
        "7-science-rip-07",
        ["flower"],
        "Why is the flower often called the reproductive organ of a plant?",
        "फूल को पौधे का जनन अंग क्यों कहा जाता है?",
        [
          "It contains structures involved in reproduction",
          "It absorbs water",
          "It stores food",
          "It transports minerals"
        ],
        [
          "इसमें जनन से संबंधित संरचनाएँ होती हैं",
          "यह पानी अवशोषित करता है",
          "यह भोजन संग्रहित करता है",
          "यह खनिजों का परिवहन करता है"
        ],
        0,
        ["Think about stamens and pistils."],
        "Flowers contain male and female reproductive parts.",
        "फूलों में नर और मादा जनन अंग होते हैं।",
        "easy",
        900
      ],

      [
        "7-science-rip-08",
        ["stamen"],
        "A scientist studies pollen grains produced in a flower. These pollen grains are formed in which floral structure?",
        "एक वैज्ञानिक फूल में बनने वाले परागकणों का अध्ययन करता है। ये परागकण किस संरचना में बनते हैं?",
        ["Anther", "Ovary", "Sepal", "Petal"],
        ["परागकोष", "अंडाशय", "बाह्यदल", "पंखुड़ी"],
        0,
        ["Part of the stamen."],
        "Pollen grains are produced in the anther.",
        "परागकण परागकोष में बनते हैं।",
        "medium",
        920
      ],

      [
        "7-science-rip-09",
        ["pistil"],
        "Which part of the pistil contains ovules that later develop into seeds after fertilization?",
        "वर्तिकाग्र के किस भाग में बीजांड होते हैं जो निषेचन के बाद बीज बनते हैं?",
        ["Ovary", "Stigma", "Style", "Petal"],
        ["अंडाशय", "वर्तिकाग्र", "वर्तिका", "पंखुड़ी"],
        0,
        ["Seeds originate from ovules."],
        "Ovules are present inside the ovary.",
        "बीजांड अंडाशय के भीतर पाए जाते हैं।",
        "medium",
        930
      ],

      [
        "7-science-rip-10",
        ["pollination"],
        "A bee visits several flowers while collecting nectar. Which important biological process does the bee help accomplish?",
        "एक मधुमक्खी मकरंद एकत्र करते समय कई फूलों पर जाती है। वह किस महत्वपूर्ण जैविक प्रक्रिया में सहायता करती है?",
        ["Pollination", "Respiration", "Germination", "Fragmentation"],
        ["परागण", "श्वसन", "अंकुरण", "खंडन"],
        0,
        ["Transfer of pollen grains."],
        "Bees help transfer pollen from one flower to another.",
        "मधुमक्खियाँ परागकणों के स्थानांतरण में सहायता करती हैं।",
        "easy",
        910
      ],

      [
        "7-science-rip-11",
        ["self-pollination"],
        "When pollen from the anther reaches the stigma of the same flower, the process is known as:",
        "जब परागकण उसी फूल के वर्तिकाग्र पर पहुँचते हैं, तो इसे क्या कहते हैं?",
        ["Self-pollination", "Cross-pollination", "Fertilization", "Budding"],
        ["स्वपरागण", "परपरागण", "निषेचन", "मुकुलन"],
        0,
        ["Same flower involved."],
        "Self-pollination occurs within the same flower or plant.",
        "स्वपरागण उसी फूल या पौधे में होता है।",
        "medium",
        935
      ],

      [
        "7-science-rip-12",
        ["cross-pollination"],
        "Why is cross-pollination often considered advantageous compared to self-pollination?",
        "परपरागण को स्वपरागण की तुलना में अधिक लाभदायक क्यों माना जाता है?",
        [
          "It increases genetic variation",
          "It prevents seed formation",
          "It stops reproduction",
          "It reduces survival"
        ],
        [
          "यह आनुवंशिक विविधता बढ़ाता है",
          "यह बीज निर्माण रोकता है",
          "यह जनन रोकता है",
          "यह जीवित रहने की क्षमता घटाता है"
        ],
        0,
        ["Variation improves adaptability."],
        "Cross-pollination promotes genetic diversity.",
        "परपरागण आनुवंशिक विविधता को बढ़ावा देता है।",
        "hard",
        970
      ],

      [
        "7-science-rip-13",
        ["fertilization"],
        "What happens during fertilization in flowering plants?",
        "पुष्पीय पौधों में निषेचन के दौरान क्या होता है?",
        [
          "Male and female gametes fuse",
          "Seeds break open",
          "Leaves produce food",
          "Roots absorb water"
        ],
        [
          "नर और मादा युग्मकों का संलयन होता है",
          "बीज टूट जाते हैं",
          "पत्तियाँ भोजन बनाती हैं",
          "जड़ें पानी अवशोषित करती हैं"
        ],
        0,
        ["Fusion of reproductive cells."],
        "Fertilization involves fusion of male and female gametes.",
        "निषेचन में नर और मादा युग्मकों का संलयन होता है।",
        "medium",
        940
      ],

      [
        "7-science-rip-14",
        ["seed-formation"],
        "After successful fertilization, which structure develops into a seed?",
        "सफल निषेचन के बाद कौन-सी संरचना बीज में विकसित होती है?",
        ["Ovule", "Petal", "Sepal", "Stigma"],
        ["बीजांड", "पंखुड़ी", "बाह्यदल", "वर्तिकाग्र"],
        0,
        ["Future seed."],
        "The ovule develops into a seed after fertilization.",
        "निषेचन के बाद बीजांड बीज में विकसित होता है।",
        "easy",
        920
      ],

      [
        "7-science-rip-15",
        ["fruit-formation"],
        "A student notices that after fertilization, the ovary enlarges and changes significantly. What does it eventually become?",
        "एक विद्यार्थी देखता है कि निषेचन के बाद अंडाशय बड़ा हो जाता है। यह अंततः किसमें बदलता है?",
        ["Fruit", "Root", "Leaf", "Stem"],
        ["फल", "जड़", "पत्ती", "तना"],
        0,
        ["Protects seeds."],
        "The ovary develops into a fruit.",
        "अंडाशय फल में विकसित होता है।",
        "medium",
        930
      ],

      [
        "7-science-rip-16",
        ["seed-dispersal"],
        "Why is seed dispersal important for plants growing in crowded environments?",
        "घने क्षेत्रों में उगने वाले पौधों के लिए बीज प्रसार क्यों महत्वपूर्ण है?",
        [
          "It reduces competition among seedlings",
          "It prevents reproduction",
          "It stops germination",
          "It destroys seeds"
        ],
        [
          "यह पौधों के बीच प्रतिस्पर्धा कम करता है",
          "यह जनन रोकता है",
          "यह अंकुरण रोकता है",
          "यह बीज नष्ट करता है"
        ],
        0,
        ["Seeds spread to new places."],
        "Seed dispersal helps plants avoid overcrowding and competition.",
        "बीज प्रसार प्रतिस्पर्धा कम करता है।",
        "hard",
        980
      ],

      [
        "7-science-rip-17",
        ["seed-dispersal", "wind"],
        "Which characteristic would most help a seed get dispersed by wind over long distances?",
        "कौन-सी विशेषता किसी बीज को हवा द्वारा दूर तक फैलने में सबसे अधिक सहायता करेगी?",
        [
          "Being light and having wing-like structures",
          "Being heavy and dense",
          "Having a thick shell only",
          "Growing underground"
        ],
        [
          "हल्का होना और पंख जैसी संरचनाएँ होना",
          "भारी और सघन होना",
          "केवल मोटा आवरण होना",
          "भूमिगत बढ़ना"
        ],
        0,
        ["Think about aerodynamic movement."],
        "Lightweight seeds with wings are easily carried by wind.",
        "हल्के और पंखदार बीज हवा द्वारा आसानी से फैलते हैं।",
        "hard",
        990
      ],

      [
        "7-science-rip-18",
        ["germination"],
        "A seed is provided with water, oxygen and suitable temperature but no light. What is most likely to happen?",
        "एक बीज को पानी, ऑक्सीजन और उपयुक्त तापमान दिया जाता है लेकिन प्रकाश नहीं। क्या होगा?",
        [
          "It can still germinate",
          "It cannot germinate",
          "It becomes a fruit immediately",
          "It turns into a flower"
        ],
        [
          "यह फिर भी अंकुरित हो सकता है",
          "यह अंकुरित नहीं होगा",
          "यह तुरंत फल बन जाएगा",
          "यह फूल बन जाएगा"
        ],
        0,
        ["Light is usually not essential for germination."],
        "Most seeds can germinate without light if other conditions are suitable.",
        "अधिकांश बीज प्रकाश के बिना भी अंकुरित हो सकते हैं।",
        "hard",
        1000
      ],

      [
        "7-science-rip-19",
        ["germination", "reasoning"],
        "A farmer stores seeds in an airtight container with no moisture. Even after months, the seeds do not germinate. Which factor is mainly missing?",
        "एक किसान बीजों को नमी रहित वायुरुद्ध पात्र में रखता है। कई महीनों बाद भी वे अंकुरित नहीं होते। मुख्यतः कौन-सा कारक अनुपस्थित है?",
        ["Water", "Sunlight", "Soil", "Flowers"],
        ["पानी", "सूर्यप्रकाश", "मिट्टी", "फूल"],
        0,
        ["Germination requires moisture."],
        "Water is essential to initiate germination.",
        "अंकुरण प्रारंभ करने के लिए पानी आवश्यक है।",
        "hard",
        1010
      ],

      [
        "7-science-rip-20",
        ["reproduction", "olympiad", "multi-concept"],
        "A plant species suddenly loses its ability to form flowers but can still reproduce vegetatively. Which statement is most likely correct?",
        "किसी पौधे की प्रजाति फूल बनाना बंद कर देती है लेकिन वानस्पतिक जनन कर सकती है। कौन-सा कथन सबसे सही होगा?",
        [
          "The species can still reproduce, but genetic variation may decrease",
          "The species cannot reproduce at all",
          "Seed formation will increase",
          "Pollination will become more common"
        ],
        [
          "प्रजाति फिर भी जनन कर सकती है, लेकिन आनुवंशिक विविधता कम हो सकती है",
          "प्रजाति बिल्कुल जनन नहीं कर सकती",
          "बीज निर्माण बढ़ जाएगा",
          "परागण अधिक होगा"
        ],
        0,
        ["Vegetative propagation produces genetically similar offspring."],
        "Asexual reproduction can continue, but variation is generally lower than sexual reproduction.",
        "अलैंगिक जनन जारी रह सकता है, पर आनुवंशिक विविधता सामान्यतः कम होती है।",
        "hard",
        1050
      ]

    ])
  },
    {
    chapterNumber: 13,
    topicId: "science-motion-and-time",
    chapterTitle: "Motion and Time",
    chapterTitleHindi: "गति और समय",
    questions: makeQuestionSetFromConcepts("science-motion-and-time", [

      [
        "7-science-mt-01",
        ["motion"],
        "A student sitting inside a moving bus says that he is at rest. Another student standing on the roadside says that the same student is moving. How can both statements be correct?",
        "चलती बस में बैठा एक विद्यार्थी कहता है कि वह विराम अवस्था में है, जबकि सड़क किनारे खड़ा दूसरा विद्यार्थी कहता है कि वह गतिमान है। दोनों कथन सही कैसे हो सकते हैं?",
        [
          "Motion depends on the observer's frame of reference",
          "One of the students must be wrong",
          "Objects cannot be both at rest and in motion",
          "The bus is actually not moving"
        ],
        [
          "गति पर्यवेक्षक के संदर्भ बिंदु पर निर्भर करती है",
          "एक विद्यार्थी गलत है",
          "कोई वस्तु एक साथ विराम और गति में नहीं हो सकती",
          "बस वास्तव में नहीं चल रही"
        ],
        0,
        ["Think relative motion."],
        "Motion is relative to the observer's frame of reference.",
        "गति पर्यवेक्षक के संदर्भ बिंदु पर निर्भर करती है।",
        "medium",
        900
      ],

      [
        "7-science-mt-02",
        ["speed"],
        "Two cyclists travel the same distance. One completes the journey in half the time taken by the other. What can be concluded?",
        "दो साइकिल चालक समान दूरी तय करते हैं। उनमें से एक दूसरे की तुलना में आधे समय में दूरी पूरी करता है। क्या निष्कर्ष निकाला जा सकता है?",
        [
          "The first cyclist has a higher speed",
          "Both have the same speed",
          "The first cyclist traveled a shorter distance",
          "Speed cannot be compared"
        ],
        [
          "पहले साइकिल चालक की चाल अधिक है",
          "दोनों की चाल समान है",
          "पहले ने कम दूरी तय की",
          "चाल की तुलना नहीं की जा सकती"
        ],
        0,
        ["Speed = Distance ÷ Time"],
        "For the same distance, less time means greater speed.",
        "समान दूरी के लिए कम समय का अर्थ अधिक चाल है।",
        "easy",
        870
      ],

      [
        "7-science-mt-03",
        ["speed-formula"],
        "A car covers 180 km in 3 hours. What is its average speed?",
        "एक कार 3 घंटे में 180 किमी की दूरी तय करती है। उसकी औसत चाल क्या होगी?",
        [
          "60 km/h",
          "90 km/h",
          "30 km/h",
          "45 km/h"
        ],
        [
          "60 किमी/घंटा",
          "90 किमी/घंटा",
          "30 किमी/घंटा",
          "45 किमी/घंटा"
        ],
        0,
        ["Use Speed = Distance ÷ Time"],
        "180 ÷ 3 = 60 km/h.",
        "180 ÷ 3 = 60 किमी/घंटा।",
        "easy",
        880
      ],

      [
        "7-science-mt-04",
        ["uniform-motion"],
        "A train covers 50 km every hour for 5 consecutive hours. This is an example of:",
        "एक ट्रेन लगातार 5 घंटों तक हर घंटे 50 किमी की दूरी तय करती है। यह किसका उदाहरण है?",
        [
          "Uniform motion",
          "Non-uniform motion",
          "Oscillatory motion",
          "Random motion"
        ],
        [
          "समान गति",
          "असमान गति",
          "दोलन गति",
          "यादृच्छिक गति"
        ],
        0,
        ["Equal distances in equal intervals."],
        "Uniform motion occurs when equal distances are covered in equal intervals of time.",
        "समान समयांतराल में समान दूरी तय करना समान गति कहलाता है।",
        "easy",
        890
      ],

      [
        "7-science-mt-05",
        ["non-uniform-motion"],
        "A runner covers 100 m in the first minute, 80 m in the second minute and 120 m in the third minute. This motion is:",
        "एक धावक पहले मिनट में 100 मीटर, दूसरे में 80 मीटर और तीसरे में 120 मीटर दौड़ता है। यह कैसी गति है?",
        [
          "Non-uniform motion",
          "Uniform motion",
          "Periodic motion",
          "Circular motion"
        ],
        [
          "असमान गति",
          "समान गति",
          "आवर्ती गति",
          "वृत्तीय गति"
        ],
        0,
        ["Distances are unequal in equal time intervals."],
        "Unequal distances covered in equal intervals indicate non-uniform motion.",
        "समान समय में असमान दूरी तय करना असमान गति कहलाता है।",
        "medium",
        910
      ],

      [
        "7-science-mt-06",
        ["measurement"],
        "Before standard units were developed, people often used body parts such as hand spans and footsteps to measure distance. What was a major disadvantage of this method?",
        "मानक इकाइयों के विकास से पहले लोग हाथ की चौड़ाई और कदमों से दूरी मापते थे। इस विधि की सबसे बड़ी समस्या क्या थी?",
        [
          "Measurements varied from person to person",
          "It was too accurate",
          "It required expensive equipment",
          "It could measure only time"
        ],
        [
          "माप व्यक्ति के अनुसार बदल जाता था",
          "यह बहुत सटीक था",
          "इसके लिए महंगे उपकरण चाहिए थे",
          "यह केवल समय माप सकता था"
        ],
        0,
        ["Different people have different body sizes."],
        "Non-standard units are inconsistent and unreliable.",
        "गैर-मानक इकाइयाँ असंगत होती हैं।",
        "medium",
        920
      ],

      [
        "7-science-mt-07",
        ["time"],
        "Which instrument is most suitable for measuring a time interval of 100 meters sprint race?",
        "100 मीटर दौड़ की समयावधि मापने के लिए कौन-सा उपकरण सबसे उपयुक्त है?",
        [
          "Stopwatch",
          "Thermometer",
          "Barometer",
          "Spring balance"
        ],
        [
          "स्टॉपवॉच",
          "थर्मामीटर",
          "बैरोमीटर",
          "स्प्रिंग बैलेंस"
        ],
        0,
        ["Used in sports timing."],
        "A stopwatch accurately measures short time intervals.",
        "स्टॉपवॉच कम समयांतराल मापने के लिए उपयुक्त है।",
        "easy",
        890
      ],

      [
        "7-science-mt-08",
        ["pendulum"],
        "A simple pendulum takes 2 seconds to complete one oscillation. How much time will it take to complete 15 oscillations?",
        "एक सरल लोलक एक दोलन पूरा करने में 2 सेकंड लेता है। 15 दोलन पूरे करने में कितना समय लगेगा?",
        [
          "30 seconds",
          "15 seconds",
          "20 seconds",
          "25 seconds"
        ],
        [
          "30 सेकंड",
          "15 सेकंड",
          "20 सेकंड",
          "25 सेकंड"
        ],
        0,
        ["Time = Number of oscillations × Time period"],
        "15 × 2 = 30 seconds.",
        "15 × 2 = 30 सेकंड।",
        "medium",
        930
      ],

      [
        "7-science-mt-09",
        ["pendulum"],
        "Which factor primarily determines the time period of a simple pendulum in school-level experiments?",
        "विद्यालय स्तर के प्रयोगों में सरल लोलक का आवर्तकाल मुख्यतः किस पर निर्भर करता है?",
        [
          "Length of the pendulum",
          "Color of the bob",
          "Material of the string",
          "Temperature of the room"
        ],
        [
          "लोलक की लंबाई",
          "गोले का रंग",
          "धागे की सामग्री",
          "कमरे का तापमान"
        ],
        0,
        ["Longer pendulum swings more slowly."],
        "The time period mainly depends on the length of the pendulum.",
        "आवर्तकाल मुख्यतः लोलक की लंबाई पर निर्भर करता है।",
        "hard",
        950
      ],

      [
        "7-science-mt-10",
        ["distance-time"],
        "A student walks 4 km in 1 hour and then 6 km in the next hour. What is the total distance covered?",
        "एक विद्यार्थी पहले घंटे में 4 किमी और अगले घंटे में 6 किमी चलता है। कुल दूरी कितनी हुई?",
        [
          "10 km",
          "5 km",
          "12 km",
          "8 km"
        ],
        [
          "10 किमी",
          "5 किमी",
          "12 किमी",
          "8 किमी"
        ],
        0,
        ["Add the distances."],
        "Total distance = 4 + 6 = 10 km.",
        "कुल दूरी = 4 + 6 = 10 किमी।",
        "easy",
        880
      ],

      [
        "7-science-mt-11",
        ["graph"],
        "On a distance-time graph, a horizontal line indicates that the object is:",
        "दूरी-समय ग्राफ में क्षैतिज रेखा यह दर्शाती है कि वस्तु:",
        [
          "At rest",
          "Moving with high speed",
          "Accelerating",
          "Moving in a circle"
        ],
        [
          "विराम अवस्था में है",
          "बहुत तेज चल रही है",
          "त्वरण कर रही है",
          "वृत्तीय गति कर रही है"
        ],
        0,
        ["Distance does not change."],
        "A horizontal line means no change in distance with time.",
        "क्षैतिज रेखा का अर्थ है दूरी में कोई परिवर्तन नहीं।",
        "hard",
        960
      ],

      [
        "7-science-mt-12",
        ["graph"],
        "Two distance-time graphs are drawn. Graph A is steeper than Graph B. What does this imply?",
        "दो दूरी-समय ग्राफ बनाए गए हैं। ग्राफ A, ग्राफ B से अधिक ढलानदार है। इसका क्या अर्थ है?",
        [
          "Object A has greater speed",
          "Object B has greater speed",
          "Both have equal speed",
          "No conclusion can be drawn"
        ],
        [
          "वस्तु A की चाल अधिक है",
          "वस्तु B की चाल अधिक है",
          "दोनों की चाल समान है",
          "कोई निष्कर्ष नहीं निकाला जा सकता"
        ],
        0,
        ["Slope represents speed."],
        "A steeper distance-time graph indicates higher speed.",
        "अधिक ढलानदार ग्राफ अधिक चाल को दर्शाता है।",
        "hard",
        970
      ],

      [
        "7-science-mt-13",
        ["average-speed"],
        "A bus travels 120 km in 2 hours and then 180 km in 3 hours. What is its average speed for the entire journey?",
        "एक बस 2 घंटे में 120 किमी और फिर 3 घंटे में 180 किमी चलती है। पूरी यात्रा की औसत चाल क्या होगी?",
        [
          "60 km/h",
          "50 km/h",
          "75 km/h",
          "90 km/h"
        ],
        [
          "60 किमी/घंटा",
          "50 किमी/घंटा",
          "75 किमी/घंटा",
          "90 किमी/घंटा"
        ],
        0,
        ["Average speed = Total distance ÷ Total time"],
        "300 km ÷ 5 h = 60 km/h.",
        "300 किमी ÷ 5 घंटा = 60 किमी/घंटा।",
        "medium",
        940
      ],

      [
        "7-science-mt-14",
        ["periodic-motion"],
        "Which of the following is the best example of periodic motion?",
        "निम्नलिखित में से आवर्ती गति का सबसे अच्छा उदाहरण कौन-सा है?",
        [
          "The oscillation of a pendulum",
          "A falling stone",
          "A moving train",
          "A flying bird"
        ],
        [
          "लोलक का दोलन",
          "गिरता हुआ पत्थर",
          "चलती ट्रेन",
          "उड़ता हुआ पक्षी"
        ],
        0,
        ["Repeats at regular intervals."],
        "Periodic motion repeats after equal intervals of time.",
        "आवर्ती गति समान समयांतराल के बाद दोहराई जाती है।",
        "easy",
        900
      ],

      [
        "7-science-mt-15",
        ["speed", "reasoning"],
        "Two students start walking together. After 30 minutes, one is much farther ahead. What is the most reasonable explanation?",
        "दो विद्यार्थी एक साथ चलना शुरू करते हैं। 30 मिनट बाद एक बहुत आगे निकल जाता है। सबसे उचित कारण क्या है?",
        [
          "He walked with greater speed",
          "He walked a shorter distance",
          "Time moved differently for him",
          "His watch was incorrect"
        ],
        [
          "उसकी चाल अधिक थी",
          "उसने कम दूरी तय की",
          "उसके लिए समय अलग चला",
          "उसकी घड़ी गलत थी"
        ],
        0,
        ["Distance covered depends on speed."],
        "Higher speed results in greater distance covered in the same time.",
        "अधिक चाल समान समय में अधिक दूरी तय कराती है।",
        "medium",
        930
      ],

      [
        "7-science-mt-16",
        ["units"],
        "Which SI unit is used to measure speed?",
        "चाल मापने के लिए SI इकाई कौन-सी है?",
        [
          "m/s",
          "km",
          "s",
          "kg"
        ],
        [
          "मी/से",
          "किमी",
          "सेकंड",
          "किग्रा"
        ],
        0,
        ["Distance per unit time."],
        "The SI unit of speed is metre per second (m/s).",
        "चाल की SI इकाई मीटर प्रति सेकंड (m/s) है।",
        "easy",
        880
      ],

      [
        "7-science-mt-17",
        ["olympiad", "data-interpretation"],
        "A cyclist covers 10 km in the first 20 minutes and another 10 km in the next 10 minutes. What can be concluded?",
        "एक साइकिल चालक पहले 20 मिनट में 10 किमी और अगले 10 मिनट में 10 किमी चलता है। क्या निष्कर्ष निकाला जा सकता है?",
        [
          "His speed increased during the second interval",
          "His speed remained constant",
          "His speed decreased",
          "Distance decreased"
        ],
        [
          "दूसरे अंतराल में उसकी चाल बढ़ी",
          "उसकी चाल स्थिर रही",
          "उसकी चाल घटी",
          "दूरी घट गई"
        ],
        0,
        ["Same distance in less time."],
        "Covering the same distance in less time means higher speed.",
        "समान दूरी कम समय में तय करने का अर्थ अधिक चाल है।",
        "hard",
        990
      ],

      [
        "7-science-mt-18",
        ["motion", "olympiad"],
        "A satellite moves around Earth in a fixed path and returns to the same position after a regular interval. Its motion can best be described as:",
        "एक उपग्रह पृथ्वी के चारों ओर निश्चित पथ में घूमता है और नियमित समय बाद उसी स्थिति में लौट आता है। इसकी गति कैसी है?",
        [
          "Both circular and periodic",
          "Only linear",
          "Only random",
          "At rest"
        ],
        [
          "वृत्तीय और आवर्ती दोनों",
          "केवल रेखीय",
          "केवल यादृच्छिक",
          "विराम अवस्था"
        ],
        0,
        ["Think about orbit and repetition."],
        "Satellite motion is both circular and periodic.",
        "उपग्रह की गति वृत्तीय तथा आवर्ती दोनों होती है।",
        "hard",
        1000
      ],

      [
        "7-science-mt-19",
        ["multi-concept"],
        "If the time taken for a journey remains unchanged but the distance covered doubles, what happens to the average speed?",
        "यदि यात्रा का समय समान रहे लेकिन दूरी दोगुनी हो जाए, तो औसत चाल पर क्या प्रभाव पड़ेगा?",
        [
          "It doubles",
          "It halves",
          "It remains unchanged",
          "It becomes zero"
        ],
        [
          "यह दोगुनी हो जाती है",
          "यह आधी हो जाती है",
          "यह अपरिवर्तित रहती है",
          "यह शून्य हो जाती है"
        ],
        0,
        ["Use the speed formula."],
        "Speed is directly proportional to distance when time is constant.",
        "समय स्थिर होने पर चाल दूरी के समानुपाती होती है।",
        "hard",
        1020
      ],

      [
        "7-science-mt-20",
        ["motion", "reasoning", "olympiad"],
        "A scientist discovers a clock that loses exactly 5 minutes every hour. Which statement is most accurate?",
        "एक वैज्ञानिक ऐसी घड़ी खोजता है जो हर घंटे ठीक 5 मिनट पीछे रह जाती है। कौन-सा कथन सबसे सही है?",
        [
          "The clock cannot be relied upon for accurate time measurement",
          "The clock is perfectly accurate",
          "The clock measures speed",
          "The clock measures distance"
        ],
        [
          "यह घड़ी सटीक समय मापन के लिए विश्वसनीय नहीं है",
          "यह घड़ी पूरी तरह सटीक है",
          "यह चाल मापती है",
          "यह दूरी मापती है"
        ],
        0,
        ["Accurate measurement requires reliability."],
        "Scientific measurements require accurate and reliable instruments.",
        "वैज्ञानिक मापन के लिए सटीक और विश्वसनीय उपकरण आवश्यक हैं।",
        "hard",
        1050
      ]

    ])
  },
    {
    chapterNumber: 14,
    topicId: "science-electric-current-and-its-effects",
    chapterTitle: "Electric Current and its Effects",
    chapterTitleHindi: "विद्युत धारा और उसके प्रभाव",
    questions: makeQuestionSetFromConcepts("science-electric-current-and-its-effects", [

      [
        "7-science-ece-01",
        ["electric-current"],
        "Riya connects a bulb, a cell, and wires in a closed circuit. The bulb glows immediately. What does this observation prove?",
        "रिया एक बल्ब, एक सेल और तारों को बंद परिपथ में जोड़ती है। बल्ब तुरंत जल उठता है। यह क्या सिद्ध करता है?",
        [
          "Electric current is flowing through the circuit",
          "The bulb is producing electricity",
          "The wires are storing electricity",
          "The cell is empty"
        ],
        [
          "परिपथ में विद्युत धारा प्रवाहित हो रही है",
          "बल्ब बिजली उत्पन्न कर रहा है",
          "तार बिजली संग्रहित कर रहे हैं",
          "सेल खाली है"
        ],
        0,
        ["A bulb glows only when current flows."],
        "The glowing bulb indicates the flow of electric current.",
        "बल्ब का जलना विद्युत धारा के प्रवाह को दर्शाता है।",
        "easy",
        880
      ],

      [
        "7-science-ece-02",
        ["closed-circuit"],
        "A torch stops working even though the batteries are new. Which reason is most likely?",
        "नई बैटरियाँ होने के बावजूद टॉर्च काम नहीं करती। सबसे संभावित कारण क्या है?",
        [
          "The circuit is open somewhere",
          "The batteries are producing too much current",
          "The bulb is too bright",
          "The torch contains oxygen"
        ],
        [
          "परिपथ कहीं से खुला हुआ है",
          "बैटरियाँ बहुत अधिक धारा दे रही हैं",
          "बल्ब बहुत चमकीला है",
          "टॉर्च में ऑक्सीजन है"
        ],
        0,
        ["Current requires a complete path."],
        "An open circuit prevents current flow.",
        "खुला परिपथ धारा के प्रवाह को रोक देता है।",
        "easy",
        890
      ],

      [
        "7-science-ece-03",
        ["heating-effect"],
        "An electric iron becomes hot when connected to a power source. Which effect of electric current is mainly responsible?",
        "विद्युत इस्त्री बिजली से जोड़ने पर गर्म हो जाती है। इसके लिए मुख्यतः कौन-सा प्रभाव जिम्मेदार है?",
        [
          "Heating effect of current",
          "Magnetic effect of current",
          "Chemical effect of current",
          "Cooling effect of current"
        ],
        [
          "धारा का ऊष्मीय प्रभाव",
          "धारा का चुंबकीय प्रभाव",
          "धारा का रासायनिक प्रभाव",
          "धारा का शीतलन प्रभाव"
        ],
        0,
        ["Electrical energy converts into heat."],
        "Electric irons work using the heating effect of current.",
        "विद्युत इस्त्री धारा के ऊष्मीय प्रभाव पर कार्य करती है।",
        "easy",
        900
      ],

      [
        "7-science-ece-04",
        ["heating-effect", "application"],
        "Which household appliance mainly works because of the heating effect of electric current?",
        "निम्न में से कौन-सा घरेलू उपकरण मुख्यतः धारा के ऊष्मीय प्रभाव पर कार्य करता है?",
        [
          "Electric heater",
          "Electric bell",
          "Compass",
          "Magnet"
        ],
        [
          "विद्युत हीटर",
          "विद्युत घंटी",
          "कम्पास",
          "चुंबक"
        ],
        0,
        ["Produces heat intentionally."],
        "Electric heaters convert electrical energy into heat.",
        "विद्युत हीटर विद्युत ऊर्जा को ऊष्मा में बदलते हैं।",
        "easy",
        910
      ],

      [
        "7-science-ece-05",
        ["fuse"],
        "A sudden increase in current causes a fuse wire to melt. Why is this considered a safety feature?",
        "धारा अचानक बढ़ने पर फ्यूज तार पिघल जाता है। इसे सुरक्षा उपाय क्यों माना जाता है?",
        [
          "It breaks the circuit and prevents damage",
          "It increases current further",
          "It stores extra electricity",
          "It strengthens appliances"
        ],
        [
          "यह परिपथ तोड़कर नुकसान से बचाता है",
          "यह धारा को और बढ़ा देता है",
          "यह अतिरिक्त बिजली संग्रहित करता है",
          "यह उपकरणों को मजबूत बनाता है"
        ],
        0,
        ["The fuse sacrifices itself."],
        "A fuse protects appliances by interrupting excessive current.",
        "फ्यूज अत्यधिक धारा से उपकरणों की रक्षा करता है।",
        "medium",
        930
      ],

      [
        "7-science-ece-06",
        ["fuse-wire"],
        "Why is fuse wire usually made of a material with a relatively low melting point?",
        "फ्यूज तार सामान्यतः कम गलनांक वाले पदार्थ से क्यों बनाया जाता है?",
        [
          "It melts quickly during excess current",
          "It conducts no electricity",
          "It becomes a permanent switch",
          "It increases voltage"
        ],
        [
          "अधिक धारा पर यह जल्दी पिघल जाता है",
          "यह बिजली का संचालन नहीं करता",
          "यह स्थायी स्विच बन जाता है",
          "यह वोल्टेज बढ़ाता है"
        ],
        0,
        ["Protection requires quick melting."],
        "Fuse wire melts before appliances are damaged.",
        "फ्यूज तार उपकरणों के क्षतिग्रस्त होने से पहले पिघल जाता है।",
        "medium",
        940
      ],

      [
        "7-science-ece-07",
        ["magnetic-effect"],
        "A student wraps insulated wire around an iron nail and passes electric current through it. The nail begins attracting pins. Why?",
        "एक विद्यार्थी लोहे की कील पर तार लपेटकर उसमें धारा प्रवाहित करता है। कील पिनों को आकर्षित करने लगती है। क्यों?",
        [
          "Current produces a magnetic effect",
          "Current creates gravity",
          "Current reduces mass",
          "Current creates light only"
        ],
        [
          "धारा चुंबकीय प्रभाव उत्पन्न करती है",
          "धारा गुरुत्वाकर्षण बनाती है",
          "धारा द्रव्यमान कम करती है",
          "धारा केवल प्रकाश उत्पन्न करती है"
        ],
        0,
        ["The nail becomes an electromagnet."],
        "Electric current can produce magnetism.",
        "विद्युत धारा चुंबकत्व उत्पन्न कर सकती है।",
        "medium",
        950
      ],

      [
        "7-science-ece-08",
        ["electromagnet"],
        "Unlike a permanent magnet, an electromagnet can be switched on and off. What allows this?",
        "स्थायी चुंबक के विपरीत विद्युत चुंबक को चालू और बंद किया जा सकता है। ऐसा क्यों संभव है?",
        [
          "Its magnetism depends on electric current",
          "It contains no iron",
          "It uses sunlight",
          "It loses all magnetic properties permanently"
        ],
        [
          "उसका चुंबकत्व विद्युत धारा पर निर्भर करता है",
          "उसमें लोहा नहीं होता",
          "वह सूर्यप्रकाश का उपयोग करता है",
          "वह स्थायी रूप से चुंबकत्व खो देता है"
        ],
        0,
        ["No current means no electromagnet."],
        "Electromagnets work only when current flows.",
        "विद्युत चुंबक केवल धारा प्रवाहित होने पर कार्य करता है।",
        "medium",
        960
      ],

      [
        "7-science-ece-09",
        ["electric-bell"],
        "An electric bell rings because a temporary electromagnet repeatedly attracts and releases an iron strip. Which effect of current is being used?",
        "विद्युत घंटी में अस्थायी विद्युत चुंबक लोहे की पट्टी को बार-बार आकर्षित और छोड़ता है। इसमें धारा का कौन-सा प्रभाव उपयोग होता है?",
        [
          "Magnetic effect",
          "Heating effect",
          "Chemical effect",
          "Cooling effect"
        ],
        [
          "चुंबकीय प्रभाव",
          "ऊष्मीय प्रभाव",
          "रासायनिक प्रभाव",
          "शीतलन प्रभाव"
        ],
        0,
        ["Electric bells use electromagnets."],
        "Electric bells work on the magnetic effect of current.",
        "विद्युत घंटी धारा के चुंबकीय प्रभाव पर कार्य करती है।",
        "medium",
        970
      ],

      [
        "7-science-ece-10",
        ["battery"],
        "Why are cells often connected together to form a battery in powerful devices?",
        "शक्तिशाली उपकरणों में कई सेल मिलाकर बैटरी क्यों बनाई जाती है?",
        [
          "To provide greater electrical energy",
          "To reduce current to zero",
          "To stop the circuit",
          "To eliminate wires"
        ],
        [
          "अधिक विद्युत ऊर्जा प्रदान करने के लिए",
          "धारा को शून्य करने के लिए",
          "परिपथ रोकने के लिए",
          "तारों को हटाने के लिए"
        ],
        0,
        ["Multiple cells provide more power."],
        "Batteries can provide higher voltage and energy.",
        "बैटरियाँ अधिक ऊर्जा और वोल्टेज प्रदान कर सकती हैं।",
        "easy",
        920
      ],

      [
        "7-science-ece-11",
        ["switch"],
        "What is the main purpose of a switch in an electric circuit?",
        "विद्युत परिपथ में स्विच का मुख्य कार्य क्या है?",
        [
          "To open or close the circuit",
          "To generate electricity",
          "To store current",
          "To increase resistance"
        ],
        [
          "परिपथ को खोलना या बंद करना",
          "बिजली उत्पन्न करना",
          "धारा संग्रहित करना",
          "प्रतिरोध बढ़ाना"
        ],
        0,
        ["Control the flow of current."],
        "A switch controls whether current can flow through a circuit.",
        "स्विच धारा के प्रवाह को नियंत्रित करता है।",
        "easy",
        900
      ],

      [
        "7-science-ece-12",
        ["conductors"],
        "Which material would be the best choice for connecting electrical components in a circuit?",
        "परिपथ में विद्युत घटकों को जोड़ने के लिए कौन-सा पदार्थ सबसे उपयुक्त होगा?",
        [
          "Copper",
          "Rubber",
          "Plastic",
          "Wood"
        ],
        [
          "तांबा",
          "रबर",
          "प्लास्टिक",
          "लकड़ी"
        ],
        0,
        ["Good conductors are preferred."],
        "Copper is an excellent conductor of electricity.",
        "तांबा विद्युत का अच्छा चालक है।",
        "easy",
        910
      ],

      [
        "7-science-ece-13",
        ["insulators"],
        "Electricians often cover wires with plastic or rubber. Why?",
        "बिजली के तारों को अक्सर प्लास्टिक या रबर से ढका जाता है। क्यों?",
        [
          "They are electrical insulators",
          "They conduct electricity better than copper",
          "They increase voltage",
          "They produce electricity"
        ],
        [
          "वे विद्युत कुचालक होते हैं",
          "वे तांबे से बेहतर चालक हैं",
          "वे वोल्टेज बढ़ाते हैं",
          "वे बिजली उत्पन्न करते हैं"
        ],
        0,
        ["Safety is important."],
        "Insulators prevent accidental electric shocks.",
        "कुचालक विद्युत आघात से सुरक्षा प्रदान करते हैं।",
        "medium",
        930
      ],

      [
        "7-science-ece-14",
        ["electromagnet", "application"],
        "Which device relies heavily on electromagnets for its operation?",
        "निम्न में से कौन-सा उपकरण अपने कार्य के लिए विद्युत चुंबकों पर अत्यधिक निर्भर करता है?",
        [
          "Electric crane used in scrap yards",
          "Wooden ruler",
          "Glass bottle",
          "Paper notebook"
        ],
        [
          "कबाड़खाने में प्रयुक्त विद्युत क्रेन",
          "लकड़ी की पट्टी",
          "काँच की बोतल",
          "कागज़ की नोटबुक"
        ],
        0,
        ["Heavy iron objects are lifted."],
        "Electric cranes use electromagnets to lift heavy iron objects.",
        "विद्युत क्रेन भारी लोहे की वस्तुओं को उठाने के लिए विद्युत चुंबकों का उपयोग करती हैं।",
        "medium",
        950
      ],

      [
        "7-science-ece-15",
        ["heating-effect", "reasoning"],
        "Why does the filament of an incandescent bulb glow when current passes through it?",
        "तप्तदीप्त बल्ब का फिलामेंट धारा प्रवाहित होने पर क्यों चमकता है?",
        [
          "It becomes extremely hot due to the heating effect of current",
          "It becomes magnetic",
          "It starts producing oxygen",
          "It absorbs light"
        ],
        [
          "धारा के ऊष्मीय प्रभाव से यह अत्यधिक गर्म हो जाता है",
          "यह चुंबकीय बन जाता है",
          "यह ऑक्सीजन बनाने लगता है",
          "यह प्रकाश अवशोषित करता है"
        ],
        0,
        ["Heat produces light."],
        "The filament glows because it becomes very hot.",
        "फिलामेंट अत्यधिक गर्म होकर चमकता है।",
        "hard",
        980
      ],

      [
        "7-science-ece-16",
        ["electrical-safety"],
        "A person notices a damaged wire with exposed metal. What is the safest action?",
        "किसी व्यक्ति को खुली धातु वाला क्षतिग्रस्त तार दिखाई देता है। सबसे सुरक्षित कदम क्या होगा?",
        [
          "Avoid touching it and switch off the power supply",
          "Touch it with bare hands",
          "Pour water on it",
          "Wrap it with wet cloth"
        ],
        [
          "उसे न छुए और बिजली बंद कर दे",
          "नंगे हाथों से छुए",
          "उस पर पानी डाले",
          "गीले कपड़े से लपेटे"
        ],
        0,
        ["Think electrical safety."],
        "Damaged wires can cause electric shock.",
        "क्षतिग्रस्त तार विद्युत आघात का कारण बन सकते हैं।",
        "medium",
        970
      ],

      [
        "7-science-ece-17",
        ["olympiad", "circuit-analysis"],
        "A bulb is connected to a cell through a switch. If the switch remains open, which statement is correct?",
        "एक बल्ब को सेल से स्विच के माध्यम से जोड़ा गया है। यदि स्विच खुला रहे तो कौन-सा कथन सही है?",
        [
          "No current flows and the bulb remains off",
          "Current flows normally",
          "The bulb glows dimly",
          "The cell becomes brighter"
        ],
        [
          "धारा प्रवाहित नहीं होगी और बल्ब नहीं जलेगा",
          "धारा सामान्य रूप से बहेगी",
          "बल्ब हल्का जलेगा",
          "सेल अधिक चमकीला हो जाएगा"
        ],
        0,
        ["Open circuit."],
        "An open switch breaks the circuit.",
        "खुला स्विच परिपथ को तोड़ देता है।",
        "hard",
        990
      ],

      [
        "7-science-ece-18",
        ["electromagnet", "multi-concept"],
        "An electromagnet suddenly stops attracting iron pins even though its coil remains intact. What is the most likely reason?",
        "विद्युत चुंबक की कुंडली सही होने पर भी वह लोहे की पिनों को आकर्षित करना बंद कर देता है। सबसे संभावित कारण क्या है?",
        [
          "Current is no longer flowing through the coil",
          "The iron pins disappeared",
          "The coil became longer",
          "The room became brighter"
        ],
        [
          "कुंडली में धारा प्रवाहित नहीं हो रही",
          "लोहे की पिन गायब हो गईं",
          "कुंडली लंबी हो गई",
          "कमरा अधिक उज्ज्वल हो गया"
        ],
        0,
        ["Electromagnets need current."],
        "Without current, the magnetic field disappears.",
        "धारा बंद होने पर चुंबकीय क्षेत्र समाप्त हो जाता है।",
        "hard",
        1010
      ],

      [
        "7-science-ece-19",
        ["fuse", "olympiad"],
        "A circuit contains a fuse rated for 5 A. What is most likely to happen if a current of 10 A flows for some time?",
        "एक परिपथ में 5 A रेटिंग का फ्यूज लगा है। यदि कुछ समय तक 10 A धारा प्रवाहित हो तो क्या होगा?",
        [
          "The fuse will melt and break the circuit",
          "The fuse will become stronger",
          "Current will stop permanently everywhere",
          "The battery will disappear"
        ],
        [
          "फ्यूज पिघलकर परिपथ तोड़ देगा",
          "फ्यूज अधिक मजबूत हो जाएगा",
          "धारा हर जगह स्थायी रूप से रुक जाएगी",
          "बैटरी गायब हो जाएगी"
        ],
        0,
        ["Excess current protection."],
        "The fuse melts when current exceeds its safe limit.",
        "सुरक्षित सीमा से अधिक धारा होने पर फ्यूज पिघल जाता है।",
        "hard",
        1030
      ],

      [
        "7-science-ece-20",
        ["electric-current", "reasoning", "olympiad"],
        "A city suddenly loses the ability to generate and distribute electric current. Which consequence would appear first in everyday life?",
        "यदि किसी शहर में अचानक विद्युत धारा का उत्पादन और वितरण बंद हो जाए, तो दैनिक जीवन में सबसे पहले कौन-सा प्रभाव दिखाई देगा?",
        [
          "Electrical devices dependent on current would stop functioning",
          "All magnets would disappear",
          "Gravity would stop acting",
          "Water would instantly freeze"
        ],
        [
          "विद्युत धारा पर निर्भर उपकरण काम करना बंद कर देंगे",
          "सभी चुंबक गायब हो जाएँगे",
          "गुरुत्वाकर्षण समाप्त हो जाएगा",
          "पानी तुरंत जम जाएगा"
        ],
        0,
        ["Think about the role of electricity."],
        "Most modern devices require electric current to operate.",
        "अधिकांश आधुनिक उपकरणों को कार्य करने के लिए विद्युत धारा की आवश्यकता होती है।",
        "hard",
        1050
      ]

    ])
  },
    {
    chapterNumber: 15,
    topicId: "science-light",
    chapterTitle: "Light",
    chapterTitleHindi: "प्रकाश",
    questions: makeQuestionSetFromConcepts("science-light", [

      [
        "7-science-light-01",
        ["light-source"],
        "During a power outage, Aarav notices that the Moon appears bright in the night sky. Which statement correctly explains why the Moon shines?",
        "बिजली जाने के दौरान आरव देखता है कि चंद्रमा रात में चमक रहा है। इसका सही कारण क्या है?",
        [
          "The Moon reflects sunlight",
          "The Moon produces its own light",
          "The Moon stores electricity",
          "The Moon contains fire"
        ],
        [
          "चंद्रमा सूर्य के प्रकाश को परावर्तित करता है",
          "चंद्रमा स्वयं प्रकाश उत्पन्न करता है",
          "चंद्रमा बिजली संग्रहित करता है",
          "चंद्रमा में आग होती है"
        ],
        0,
        ["Is the Moon a luminous object?"],
        "The Moon is a non-luminous object that reflects sunlight.",
        "चंद्रमा स्वयं प्रकाश नहीं देता, बल्कि सूर्य के प्रकाश को परावर्तित करता है।",
        "easy",
        880
      ],

      [
        "7-science-light-02",
        ["luminous-objects"],
        "Which of the following is a luminous object?",
        "निम्नलिखित में से कौन-सी वस्तु स्वयं प्रकाश उत्सर्जित करती है?",
        [
          "Electric bulb",
          "Moon",
          "Mirror",
          "Planet Earth"
        ],
        [
          "विद्युत बल्ब",
          "चंद्रमा",
          "दर्पण",
          "पृथ्वी"
        ],
        0,
        ["Luminous objects produce their own light."],
        "An electric bulb emits its own light and is therefore luminous.",
        "विद्युत बल्ब स्वयं प्रकाश उत्पन्न करता है।",
        "easy",
        890
      ],

      [
        "7-science-light-03",
        ["reflection"],
        "A student shines a torch on a plane mirror and notices that the light bounces back. This phenomenon is called:",
        "एक विद्यार्थी समतल दर्पण पर टॉर्च का प्रकाश डालता है और देखता है कि प्रकाश वापस लौट जाता है। इसे क्या कहते हैं?",
        [
          "Reflection",
          "Refraction",
          "Dispersion",
          "Absorption"
        ],
        [
          "परावर्तन",
          "अपवर्तन",
          "विक्षेपण",
          "अवशोषण"
        ],
        0,
        ["Light returns from a surface."],
        "Reflection occurs when light bounces back from a surface.",
        "जब प्रकाश किसी सतह से वापस लौटता है तो उसे परावर्तन कहते हैं।",
        "easy",
        900
      ],

      [
        "7-science-light-04",
        ["laws-of-reflection"],
        "If a ray of light strikes a plane mirror at an angle of 35°, what will be the angle of reflection?",
        "यदि प्रकाश किरण समतल दर्पण पर 35° के कोण से गिरती है, तो परावर्तन कोण कितना होगा?",
        [
          "35°",
          "70°",
          "45°",
          "90°"
        ],
        [
          "35°",
          "70°",
          "45°",
          "90°"
        ],
        0,
        ["Angle of incidence equals angle of reflection."],
        "According to the law of reflection, the angle of reflection equals the angle of incidence.",
        "परावर्तन के नियम के अनुसार आपतन कोण और परावर्तन कोण बराबर होते हैं।",
        "medium",
        930
      ],

      [
        "7-science-light-05",
        ["plane-mirror"],
        "Why does a person see their image in a plane mirror?",
        "व्यक्ति समतल दर्पण में अपनी छवि क्यों देखता है?",
        [
          "The mirror reflects light coming from the person",
          "The mirror produces a new image",
          "The mirror stores light permanently",
          "The mirror absorbs all light"
        ],
        [
          "दर्पण व्यक्ति से आने वाले प्रकाश को परावर्तित करता है",
          "दर्पण नई छवि बनाता है",
          "दर्पण प्रकाश को स्थायी रूप से संग्रहित करता है",
          "दर्पण सारा प्रकाश अवशोषित कर लेता है"
        ],
        0,
        ["Reflection forms images."],
        "The mirror reflects light rays from the object to the eyes.",
        "दर्पण वस्तु से आने वाले प्रकाश को परावर्तित करके छवि बनाता है।",
        "easy",
        910
      ],

      [
        "7-science-light-06",
        ["image-characteristics"],
        "A girl raises her right hand while standing before a mirror. In the image, which hand appears raised?",
        "एक लड़की दर्पण के सामने अपना दायाँ हाथ उठाती है। उसकी छवि में कौन-सा हाथ उठा हुआ दिखाई देगा?",
        [
          "Left hand",
          "Right hand",
          "Both hands",
          "No hand"
        ],
        [
          "बायाँ हाथ",
          "दायाँ हाथ",
          "दोनों हाथ",
          "कोई हाथ नहीं"
        ],
        0,
        ["Think about lateral inversion."],
        "Plane mirrors produce laterally inverted images.",
        "समतल दर्पण पार्श्व परिवर्तन (lateral inversion) दर्शाते हैं।",
        "medium",
        940
      ],

      [
        "7-science-light-07",
        ["multiple-reflection"],
        "Two mirrors are placed facing each other. A small object is kept between them. Why are many images seen?",
        "दो दर्पण आमने-सामने रखे गए हैं और उनके बीच एक वस्तु रखी गई है। अनेक छवियाँ क्यों दिखाई देती हैं?",
        [
          "Repeated reflections occur between the mirrors",
          "The object splits into many objects",
          "The mirrors create light",
          "The mirrors absorb images"
        ],
        [
          "दर्पणों के बीच बार-बार परावर्तन होता है",
          "वस्तु कई भागों में विभाजित हो जाती है",
          "दर्पण प्रकाश उत्पन्न करते हैं",
          "दर्पण छवियों को अवशोषित कर लेते हैं"
        ],
        0,
        ["Light reflects repeatedly."],
        "Multiple reflections produce several images.",
        "बार-बार परावर्तन होने से अनेक छवियाँ बनती हैं।",
        "medium",
        950
      ],

      [
        "7-science-light-08",
        ["periscope"],
        "A submarine uses a periscope to observe objects above the water surface. Which principle makes a periscope work?",
        "पनडुब्बी पानी की सतह के ऊपर की वस्तुओं को देखने के लिए पेरिस्कोप का उपयोग करती है। यह किस सिद्धांत पर कार्य करता है?",
        [
          "Multiple reflection of light",
          "Absorption of light",
          "Dispersion of light",
          "Production of light"
        ],
        [
          "प्रकाश का बहु-परावर्तन",
          "प्रकाश का अवशोषण",
          "प्रकाश का विक्षेपण",
          "प्रकाश का उत्पादन"
        ],
        0,
        ["Mirrors are used inside."],
        "Periscopes work using multiple reflections from mirrors.",
        "पेरिस्कोप दर्पणों द्वारा होने वाले बहु-परावर्तन पर कार्य करता है।",
        "medium",
        960
      ],

      [
        "7-science-light-09",
        ["sunlight"],
        "Why should a person never look directly at the Sun, even for a short time?",
        "किसी व्यक्ति को सीधे सूर्य की ओर क्यों नहीं देखना चाहिए?",
        [
          "Intense light can damage the eyes",
          "The Sun absorbs vision",
          "The Sun becomes dimmer",
          "Eyes become magnets"
        ],
        [
          "तीव्र प्रकाश आँखों को नुकसान पहुँचा सकता है",
          "सूर्य दृष्टि को अवशोषित कर लेता है",
          "सूर्य मंद हो जाता है",
          "आँखें चुंबक बन जाती हैं"
        ],
        0,
        ["Think about eye safety."],
        "The Sun's intense light can permanently damage the retina.",
        "सूर्य का तीव्र प्रकाश आँखों को स्थायी क्षति पहुँचा सकता है।",
        "easy",
        920
      ],

      [
        "7-science-light-10",
        ["transparent-objects"],
        "Which material allows most light to pass through it and enables objects behind it to be seen clearly?",
        "कौन-सा पदार्थ अधिकांश प्रकाश को अपने आर-पार जाने देता है और पीछे की वस्तुओं को स्पष्ट दिखाता है?",
        [
          "Transparent glass",
          "Wood",
          "Cardboard",
          "Metal sheet"
        ],
        [
          "पारदर्शी काँच",
          "लकड़ी",
          "गत्ता",
          "धातु की चादर"
        ],
        0,
        ["Transparent materials transmit light."],
        "Transparent materials allow light to pass through them.",
        "पारदर्शी पदार्थ प्रकाश को अपने आर-पार जाने देते हैं।",
        "easy",
        900
      ],

      [
        "7-science-light-11",
        ["opaque-objects"],
        "Why does a solid wall cast a dark shadow when illuminated by a bright light source?",
        "तेज प्रकाश स्रोत से प्रकाशित होने पर ठोस दीवार गहरी छाया क्यों बनाती है?",
        [
          "It is opaque and blocks light",
          "It produces darkness",
          "It bends all light",
          "It absorbs shadows"
        ],
        [
          "यह अपारदर्शी है और प्रकाश को रोकती है",
          "यह अंधकार उत्पन्न करती है",
          "यह सभी प्रकाश को मोड़ देती है",
          "यह छाया को अवशोषित करती है"
        ],
        0,
        ["Opaque objects block light."],
        "Shadows form when opaque objects block light.",
        "अपारदर्शी वस्तुएँ प्रकाश को रोककर छाया बनाती हैं।",
        "easy",
        910
      ],

      [
        "7-science-light-12",
        ["shadow"],
        "A student observes that the length of a tree's shadow changes throughout the day. What is the primary reason?",
        "एक विद्यार्थी देखता है कि पेड़ की छाया की लंबाई दिन भर बदलती रहती है। इसका मुख्य कारण क्या है?",
        [
          "The Sun's position changes in the sky",
          "The tree changes height",
          "The Earth stops rotating",
          "The shadow moves independently"
        ],
        [
          "आकाश में सूर्य की स्थिति बदलती है",
          "पेड़ की ऊँचाई बदलती है",
          "पृथ्वी घूमना बंद कर देती है",
          "छाया स्वतंत्र रूप से चलती है"
        ],
        0,
        ["Shadow depends on light direction."],
        "The changing position of the Sun changes shadow length.",
        "सूर्य की स्थिति बदलने से छाया की लंबाई बदलती है।",
        "medium",
        940
      ],

      [
        "7-science-light-13",
        ["reflection", "reasoning"],
        "A rough wall reflects light in many directions instead of one direction. What is this called?",
        "एक खुरदरी दीवार प्रकाश को एक दिशा के बजाय कई दिशाओं में परावर्तित करती है। इसे क्या कहते हैं?",
        [
          "Irregular reflection",
          "Regular reflection",
          "Refraction",
          "Dispersion"
        ],
        [
          "अनियमित परावर्तन",
          "नियमित परावर्तन",
          "अपवर्तन",
          "विक्षेपण"
        ],
        0,
        ["Surface roughness matters."],
        "Rough surfaces produce irregular reflection.",
        "खुरदरी सतहें अनियमित परावर्तन उत्पन्न करती हैं।",
        "hard",
        970
      ],

      [
        "7-science-light-14",
        ["mirror-writing"],
        "Why does the word 'AMBULANCE' appear reversed on the front of emergency vehicles?",
        "आपातकालीन वाहनों के सामने 'AMBULANCE' उल्टा क्यों लिखा जाता है?",
        [
          "So drivers can read it correctly in rear-view mirrors",
          "To make it decorative",
          "To reduce light reflection",
          "To increase speed"
        ],
        [
          "ताकि चालक इसे रियर-व्यू दर्पण में सही पढ़ सकें",
          "इसे सजावटी बनाने के लिए",
          "परावर्तन कम करने के लिए",
          "गति बढ़ाने के लिए"
        ],
        0,
        ["Think about lateral inversion."],
        "Mirror images reverse left and right.",
        "दर्पण में बाएँ और दाएँ का परिवर्तन होता है।",
        "medium",
        960
      ],

      [
        "7-science-light-15",
        ["olympiad", "multiple-concept"],
        "A beam of light strikes a mirror at 50° to the normal. What will be the angle between the incident and reflected rays?",
        "एक प्रकाश किरण दर्पण पर अभिलंब से 50° के कोण पर गिरती है। आपतित और परावर्तित किरणों के बीच का कोण कितना होगा?",
        [
          "100°",
          "50°",
          "25°",
          "150°"
        ],
        [
          "100°",
          "50°",
          "25°",
          "150°"
        ],
        0,
        ["Angle of incidence equals angle of reflection."],
        "The angle between incident and reflected rays is twice the angle of incidence.",
        "आपतित और परावर्तित किरणों के बीच का कोण आपतन कोण का दोगुना होता है।",
        "hard",
        990
      ],

      [
        "7-science-light-16",
        ["image-formation"],
        "A child moves one step closer to a plane mirror. What happens to the distance between the child and the image?",
        "एक बच्चा समतल दर्पण के एक कदम पास आता है। बच्चे और उसकी छवि के बीच की दूरी पर क्या प्रभाव पड़ेगा?",
        [
          "It decreases by twice the distance moved",
          "It remains unchanged",
          "It doubles",
          "It becomes zero instantly"
        ],
        [
          "यह चली गई दूरी के दुगुने से कम हो जाती है",
          "यह अपरिवर्तित रहती है",
          "यह दोगुनी हो जाती है",
          "यह तुरंत शून्य हो जाती है"
        ],
        0,
        ["Image forms behind the mirror at equal distance."],
        "The image moves closer by the same amount, reducing the separation by twice the movement.",
        "छवि भी उतनी ही दूरी से पास आती है, इसलिए कुल दूरी दुगुनी मात्रा से घटती है।",
        "hard",
        1000
      ],

      [
        "7-science-light-17",
        ["shadow", "olympiad"],
        "Which condition is essential for the formation of a shadow?",
        "छाया बनने के लिए कौन-सी शर्त आवश्यक है?",
        [
          "A light source, an opaque object, and a screen",
          "Only a light source",
          "Only an object",
          "Only a mirror"
        ],
        [
          "प्रकाश स्रोत, अपारदर्शी वस्तु और स्क्रीन",
          "केवल प्रकाश स्रोत",
          "केवल वस्तु",
          "केवल दर्पण"
        ],
        0,
        ["All three are needed."],
        "A shadow forms when an opaque object blocks light from reaching a surface.",
        "जब अपारदर्शी वस्तु प्रकाश को रोकती है तो छाया बनती है।",
        "medium",
        950
      ],

      [
        "7-science-light-18",
        ["data-interpretation"],
        "At noon, a flagpole casts the shortest shadow of the day. What can be inferred about the Sun's position?",
        "दोपहर में ध्वजदंड की छाया दिन की सबसे छोटी होती है। सूर्य की स्थिति के बारे में क्या निष्कर्ष निकाला जा सकता है?",
        [
          "The Sun is highest in the sky",
          "The Sun is setting",
          "The Sun is below the horizon",
          "The Sun has stopped moving"
        ],
        [
          "सूर्य आकाश में सबसे ऊँचा है",
          "सूर्य अस्त हो रहा है",
          "सूर्य क्षितिज के नीचे है",
          "सूर्य चलना बंद कर चुका है"
        ],
        0,
        ["Shortest shadow means highest Sun."],
        "The Sun appears highest around noon, producing the shortest shadows.",
        "दोपहर में सूर्य सबसे ऊँचा दिखाई देता है।",
        "hard",
        1010
      ],

      [
        "7-science-light-19",
        ["reflection", "olympiad"],
        "A scientist wants maximum reflection of light from a surface. Which surface should be chosen?",
        "एक वैज्ञानिक किसी सतह से अधिकतम प्रकाश परावर्तन चाहता है। कौन-सी सतह सबसे उपयुक्त होगी?",
        [
          "A smooth polished mirror",
          "A rough wall",
          "A black cloth",
          "A wooden board"
        ],
        [
          "चिकना पॉलिश किया हुआ दर्पण",
          "खुरदरी दीवार",
          "काला कपड़ा",
          "लकड़ी का तख्ता"
        ],
        0,
        ["Smooth surfaces reflect efficiently."],
        "Polished mirrors provide strong regular reflection.",
        "पॉलिश किए हुए दर्पण नियमित और अधिक परावर्तन देते हैं।",
        "hard",
        1025
      ],

      [
        "7-science-light-20",
        ["light", "reasoning", "olympiad"],
        "If light suddenly stopped reflecting from all objects, what would be the most immediate consequence?",
        "यदि सभी वस्तुएँ अचानक प्रकाश को परावर्तित करना बंद कर दें, तो सबसे तत्काल प्रभाव क्या होगा?",
        [
          "Objects would become invisible to our eyes",
          "The Sun would stop shining",
          "Shadows would disappear but objects remain visible",
          "Gravity would stop acting"
        ],
        [
          "वस्तुएँ हमारी आँखों को दिखाई नहीं देंगी",
          "सूर्य चमकना बंद कर देगा",
          "छायाएँ गायब हो जाएँगी लेकिन वस्तुएँ दिखेंगी",
          "गुरुत्वाकर्षण समाप्त हो जाएगा"
        ],
        0,
        ["We see objects because reflected light enters our eyes."],
        "Vision depends on light reflected from objects reaching our eyes.",
        "हम वस्तुओं को इसलिए देखते हैं क्योंकि उनसे परावर्तित प्रकाश हमारी आँखों तक पहुँचता है।",
        "hard",
        1050
      ]

    ])
  },
    {
    chapterNumber: 16,
    topicId: "science-water-a-precious-resource",
    chapterTitle: "Water: A Precious Resource",
    chapterTitleHindi: "जल: एक बहुमूल्य संसाधन",
    questions: makeQuestionSetFromConcepts("science-water-a-precious-resource", [

      [
        "7-science-water-01",
        ["water-resource"],
        "A city receives abundant rainfall every year, yet faces severe water shortages during summer. Which explanation best accounts for this situation?",
        "एक शहर में हर वर्ष पर्याप्त वर्षा होती है, फिर भी गर्मियों में गंभीर जल संकट हो जाता है। इसका सबसे उचित कारण क्या हो सकता है?",
        [
          "Rainwater is not stored or managed properly",
          "Rainwater disappears completely",
          "Groundwater cannot exist in cities",
          "Only rivers provide usable water"
        ],
        [
          "वर्षा जल का उचित संचयन और प्रबंधन नहीं किया जाता",
          "वर्षा जल पूरी तरह गायब हो जाता है",
          "शहरों में भूजल नहीं होता",
          "केवल नदियाँ ही उपयोगी जल देती हैं"
        ],
        0,
        ["Think about water conservation."],
        "Poor water management can cause shortages even in regions with good rainfall.",
        "अपर्याप्त जल प्रबंधन के कारण पर्याप्त वर्षा वाले क्षेत्रों में भी जल संकट हो सकता है।",
        "medium",
        900
      ],

      [
        "7-science-water-02",
        ["fresh-water"],
        "Although Earth appears blue from space, only a small fraction of its water is directly available for human use. Why?",
        "पृथ्वी अंतरिक्ष से नीली दिखाई देती है, फिर भी इसका बहुत कम जल मानव उपयोग के लिए उपलब्ध है। क्यों?",
        [
          "Most water is salty or frozen",
          "All water is underground",
          "Rivers contain no water",
          "Fresh water evaporates permanently"
        ],
        [
          "अधिकांश जल खारा या बर्फ के रूप में है",
          "सारा जल भूमिगत है",
          "नदियों में जल नहीं होता",
          "मीठा जल स्थायी रूप से वाष्पित हो जाता है"
        ],
        0,
        ["Consider the distribution of water."],
        "Most of Earth's water is found in oceans and glaciers.",
        "पृथ्वी का अधिकांश जल महासागरों और हिमनदों में है।",
        "easy",
        880
      ],

      [
        "7-science-water-03",
        ["groundwater"],
        "A farmer notices that wells in his village are becoming deeper every year. What is the most likely reason?",
        "एक किसान देखता है कि उसके गाँव के कुएँ हर वर्ष अधिक गहरे होते जा रहे हैं। इसका सबसे संभावित कारण क्या है?",
        [
          "Groundwater level is falling",
          "Groundwater is increasing",
          "Rainfall has doubled",
          "Water is becoming heavier"
        ],
        [
          "भूजल स्तर गिर रहा है",
          "भूजल स्तर बढ़ रहा है",
          "वर्षा दोगुनी हो गई है",
          "जल भारी हो रहा है"
        ],
        0,
        ["Think about water table changes."],
        "Overuse of groundwater can lower the water table.",
        "भूजल के अत्यधिक उपयोग से जल स्तर नीचे चला जाता है।",
        "easy",
        890
      ],

      [
        "7-science-water-04",
        ["water-table"],
        "Which activity is most likely to cause a rapid decline in the groundwater table of a region?",
        "निम्न में से कौन-सी गतिविधि किसी क्षेत्र के भूजल स्तर को तेजी से कम कर सकती है?",
        [
          "Excessive pumping of groundwater",
          "Planting trees",
          "Rainwater harvesting",
          "Building ponds"
        ],
        [
          "भूजल का अत्यधिक दोहन",
          "पेड़ लगाना",
          "वर्षा जल संचयन",
          "तालाब बनाना"
        ],
        0,
        ["Removing water faster than it is replenished."],
        "Excessive extraction lowers groundwater reserves.",
        "अत्यधिक दोहन भूजल भंडार को कम करता है।",
        "medium",
        910
      ],

      [
        "7-science-water-05",
        ["infiltration"],
        "After a heavy rainfall, part of the water enters the soil and replenishes groundwater. This process is known as:",
        "भारी वर्षा के बाद जल का एक भाग मिट्टी में प्रवेश कर भूजल को पुनर्भरित करता है। इस प्रक्रिया को क्या कहते हैं?",
        [
          "Infiltration",
          "Condensation",
          "Evaporation",
          "Filtration"
        ],
        [
          "अंतःस्रवण",
          "संघनन",
          "वाष्पीकरण",
          "निस्पंदन"
        ],
        0,
        ["Water seeps into the ground."],
        "Infiltration is the movement of water into the soil.",
        "अंतःस्रवण मिट्टी में जल के प्रवेश की प्रक्रिया है।",
        "medium",
        920
      ],

      [
        "7-science-water-06",
        ["water-cycle"],
        "Which stage of the water cycle directly returns water vapour to the atmosphere from oceans, lakes and rivers?",
        "जल चक्र का कौन-सा चरण महासागरों, झीलों और नदियों से जलवाष्प को सीधे वायुमंडल में भेजता है?",
        [
          "Evaporation",
          "Precipitation",
          "Condensation",
          "Infiltration"
        ],
        [
          "वाष्पीकरण",
          "वर्षण",
          "संघनन",
          "अंतःस्रवण"
        ],
        0,
        ["Liquid water changes into vapour."],
        "Evaporation transfers water from Earth's surface to the atmosphere.",
        "वाष्पीकरण पृथ्वी की सतह से जल को वायुमंडल में पहुँचाता है।",
        "easy",
        900
      ],

      [
        "7-science-water-07",
        ["water-conservation"],
        "Which practice would save the greatest amount of water in a household over a year?",
        "निम्न में से कौन-सी आदत एक वर्ष में सबसे अधिक जल बचा सकती है?",
        [
          "Repairing leaking taps immediately",
          "Using decorative fountains",
          "Keeping taps running unnecessarily",
          "Washing vehicles daily with a hose"
        ],
        [
          "लीक हो रहे नलों की तुरंत मरम्मत",
          "सजावटी फव्वारों का उपयोग",
          "नल को अनावश्यक रूप से खुला छोड़ना",
          "रोज़ पाइप से वाहन धोना"
        ],
        0,
        ["Small leaks waste large amounts over time."],
        "Repairing leaks prevents continuous water loss.",
        "रिसाव रोकने से लंबे समय में बहुत जल बचता है।",
        "easy",
        910
      ],

      [
        "7-science-water-08",
        ["rainwater-harvesting"],
        "A school installs pipes that collect rainwater from rooftops and direct it into underground storage tanks. This method is called:",
        "एक विद्यालय छतों से वर्षा जल एकत्र कर भूमिगत टैंकों में भेजता है। इस विधि को क्या कहते हैं?",
        [
          "Rainwater harvesting",
          "Desalination",
          "Filtration",
          "Chlorination"
        ],
        [
          "वर्षा जल संचयन",
          "लवण हटाना",
          "निस्पंदन",
          "क्लोरीनीकरण"
        ],
        0,
        ["Collecting rainwater for future use."],
        "Rainwater harvesting helps conserve and recharge water resources.",
        "वर्षा जल संचयन जल संरक्षण में सहायता करता है।",
        "easy",
        920
      ],

      [
        "7-science-water-09",
        ["drought"],
        "A region experiences several years of below-average rainfall. Which environmental problem is most likely to occur?",
        "किसी क्षेत्र में लगातार कई वर्षों तक सामान्य से कम वर्षा होती है। कौन-सी समस्या सबसे अधिक संभावित है?",
        [
          "Drought",
          "Flood",
          "Tsunami",
          "Cyclone"
        ],
        [
          "सूखा",
          "बाढ़",
          "सुनामी",
          "चक्रवात"
        ],
        0,
        ["Long-term water shortage."],
        "Prolonged low rainfall often leads to drought conditions.",
        "लंबे समय तक कम वर्षा होने पर सूखा पड़ सकता है।",
        "easy",
        900
      ],

      [
        "7-science-water-10",
        ["distribution-of-water"],
        "Which source contains the largest percentage of Earth's total water?",
        "पृथ्वी के कुल जल का सबसे बड़ा भाग किस स्रोत में पाया जाता है?",
        [
          "Oceans",
          "Rivers",
          "Lakes",
          "Groundwater"
        ],
        [
          "महासागर",
          "नदियाँ",
          "झीलें",
          "भूजल"
        ],
        0,
        ["Think about salt water."],
        "Oceans contain about 97% of Earth's water.",
        "पृथ्वी का लगभग 97% जल महासागरों में है।",
        "medium",
        930
      ],

      [
        "7-science-water-11",
        ["groundwater", "reasoning"],
        "Why do concrete roads and buildings often reduce groundwater recharge in urban areas?",
        "कंक्रीट की सड़कें और इमारतें शहरों में भूजल पुनर्भरण को क्यों कम कर देती हैं?",
        [
          "They prevent rainwater from infiltrating into the soil",
          "They increase evaporation only",
          "They create new rivers",
          "They produce groundwater"
        ],
        [
          "वे वर्षा जल को मिट्टी में जाने से रोकती हैं",
          "वे केवल वाष्पीकरण बढ़ाती हैं",
          "वे नई नदियाँ बनाती हैं",
          "वे भूजल उत्पन्न करती हैं"
        ],
        0,
        ["Water cannot easily seep through concrete."],
        "Impermeable surfaces reduce groundwater recharge.",
        "अभेद्य सतहें भूजल पुनर्भरण को कम करती हैं।",
        "hard",
        960
      ],

      [
        "7-science-water-12",
        ["water-pollution"],
        "A factory releases untreated waste into a nearby river. What is the most immediate environmental consequence?",
        "एक कारखाना बिना उपचारित अपशिष्ट नदी में छोड़ता है। इसका सबसे तात्कालिक प्रभाव क्या होगा?",
        [
          "Water pollution",
          "Increase in groundwater",
          "Formation of glaciers",
          "More rainfall"
        ],
        [
          "जल प्रदूषण",
          "भूजल में वृद्धि",
          "हिमनदों का निर्माण",
          "अधिक वर्षा"
        ],
        0,
        ["Waste contaminates water."],
        "Untreated waste degrades water quality and harms ecosystems.",
        "बिना उपचारित अपशिष्ट जल की गुणवत्ता को खराब करता है।",
        "medium",
        940
      ],

      [
        "7-science-water-13",
        ["water-management"],
        "Which strategy best balances human needs and long-term sustainability of water resources?",
        "मानव आवश्यकताओं और जल संसाधनों की दीर्घकालिक स्थिरता के बीच संतुलन के लिए कौन-सी रणनीति सबसे उपयुक्त है?",
        [
          "Conservation, recycling and rainwater harvesting",
          "Using water without restrictions",
          "Pumping all available groundwater",
          "Ignoring water shortages"
        ],
        [
          "संरक्षण, पुनर्चक्रण और वर्षा जल संचयन",
          "बिना सीमा के जल उपयोग",
          "सारा भूजल निकाल लेना",
          "जल संकट की अनदेखी"
        ],
        0,
        ["Think sustainable use."],
        "Sustainable water management combines conservation and replenishment.",
        "सतत जल प्रबंधन संरक्षण और पुनर्भरण दोनों पर आधारित है।",
        "hard",
        970
      ],

      [
        "7-science-water-14",
        ["water-cycle", "application"],
        "If evaporation suddenly stopped worldwide, which stage of the water cycle would be affected first?",
        "यदि पूरी दुनिया में वाष्पीकरण अचानक बंद हो जाए, तो जल चक्र का कौन-सा चरण सबसे पहले प्रभावित होगा?",
        [
          "Cloud formation through condensation",
          "Groundwater recharge",
          "River flow",
          "Water storage in oceans"
        ],
        [
          "संघनन द्वारा बादल निर्माण",
          "भूजल पुनर्भरण",
          "नदी प्रवाह",
          "महासागरों में जल संग्रह"
        ],
        0,
        ["No water vapour means fewer clouds."],
        "Without evaporation, condensation and cloud formation would decline.",
        "वाष्पीकरण के बिना बादल बनना प्रभावित होगा।",
        "hard",
        980
      ],

      [
        "7-science-water-15",
        ["water-conservation", "olympiad"],
        "A leaking tap loses one drop every second. Why should such a small leak still be repaired?",
        "एक नल से प्रति सेकंड एक बूंद जल टपकती है। इतनी छोटी समस्या को भी क्यों ठीक करना चाहिए?",
        [
          "Tiny losses accumulate into large wastage over time",
          "Drops increase rainfall",
          "Leaks improve water quality",
          "Drops recharge oceans"
        ],
        [
          "छोटी-छोटी हानियाँ समय के साथ बड़ी बर्बादी बन जाती हैं",
          "बूंदें वर्षा बढ़ाती हैं",
          "रिसाव जल गुणवत्ता सुधारता है",
          "बूंदें महासागरों को पुनर्भरित करती हैं"
        ],
        0,
        ["Think long-term impact."],
        "Continuous leaks can waste thousands of litres annually.",
        "लगातार रिसाव से वर्षभर में हजारों लीटर जल व्यर्थ हो सकता है।",
        "hard",
        990
      ],

      [
        "7-science-water-16",
        ["water-table", "data-interpretation"],
        "A village records groundwater depths of 8 m, 11 m, 15 m and 19 m over four consecutive years. What trend does this indicate?",
        "एक गाँव में लगातार चार वर्षों तक भूजल गहराई 8 मीटर, 11 मीटर, 15 मीटर और 19 मीटर दर्ज की जाती है। यह क्या दर्शाता है?",
        [
          "The water table is falling",
          "The water table is rising",
          "Groundwater is unchanged",
          "Rainfall is increasing"
        ],
        [
          "भूजल स्तर नीचे जा रहा है",
          "भूजल स्तर ऊपर आ रहा है",
          "भूजल अपरिवर्तित है",
          "वर्षा बढ़ रही है"
        ],
        0,
        ["Greater depth means lower water table."],
        "Increasing well depth indicates declining groundwater levels.",
        "गहराई बढ़ना भूजल स्तर गिरने का संकेत है।",
        "hard",
        1000
      ],

      [
        "7-science-water-17",
        ["drought", "multi-concept"],
        "Which combination of factors is most likely to worsen drought conditions?",
        "निम्न में से कौन-सा संयोजन सूखे की स्थिति को और गंभीर बना सकता है?",
        [
          "Low rainfall, deforestation and excessive groundwater use",
          "Heavy rainfall and afforestation",
          "Rainwater harvesting and conservation",
          "Efficient irrigation methods"
        ],
        [
          "कम वर्षा, वनों की कटाई और अत्यधिक भूजल दोहन",
          "अधिक वर्षा और वनीकरण",
          "वर्षा जल संचयन और संरक्षण",
          "कुशल सिंचाई तकनीकें"
        ],
        0,
        ["Several negative factors act together."],
        "These factors reduce water availability and recharge.",
        "ये कारक जल उपलब्धता और पुनर्भरण दोनों को कम करते हैं।",
        "hard",
        1010
      ],

      [
        "7-science-water-18",
        ["water-scarcity"],
        "Why is water often called a 'precious resource' despite covering most of Earth's surface?",
        "पृथ्वी का अधिकांश भाग जल से ढका होने के बावजूद जल को 'बहुमूल्य संसाधन' क्यों कहा जाता है?",
        [
          "Usable fresh water is limited and essential for life",
          "Water is made of rare elements",
          "Water cannot be recycled naturally",
          "Oceans contain drinking water"
        ],
        [
          "उपयोग योग्य मीठा जल सीमित है और जीवन के लिए आवश्यक है",
          "जल दुर्लभ तत्वों से बना है",
          "जल का प्राकृतिक पुनर्चक्रण नहीं होता",
          "महासागरों का जल पीने योग्य है"
        ],
        0,
        ["Think about availability and importance."],
        "Freshwater resources are limited compared to total water on Earth.",
        "पृथ्वी पर उपयोग योग्य मीठा जल सीमित मात्रा में उपलब्ध है।",
        "hard",
        1020
      ],

      [
        "7-science-water-19",
        ["rainwater-harvesting", "reasoning"],
        "Which outcome is most likely if rainwater harvesting is widely adopted in a city?",
        "यदि किसी शहर में बड़े पैमाने पर वर्षा जल संचयन अपनाया जाए, तो कौन-सा परिणाम सबसे संभावित है?",
        [
          "Improved groundwater recharge and reduced water shortages",
          "Complete elimination of rainfall",
          "Increase in water pollution",
          "Disappearance of rivers"
        ],
        [
          "बेहतर भूजल पुनर्भरण और कम जल संकट",
          "वर्षा का पूर्ण समाप्त होना",
          "जल प्रदूषण में वृद्धि",
          "नदियों का गायब होना"
        ],
        0,
        ["Stored rainwater can replenish resources."],
        "Rainwater harvesting supports sustainable water availability.",
        "वर्षा जल संचयन जल संसाधनों को टिकाऊ बनाता है।",
        "hard",
        1035
      ],

      [
        "7-science-water-20",
        ["water-resource", "olympiad", "reasoning"],
        "A region continues wasting water while its population rapidly increases. Which long-term consequence is most likely?",
        "यदि किसी क्षेत्र में जल की बर्बादी जारी रहे और जनसंख्या तेजी से बढ़े, तो दीर्घकाल में क्या होने की संभावना है?",
        [
          "Severe water scarcity and environmental stress",
          "Unlimited water availability",
          "Permanent increase in rainfall",
          "Groundwater levels will always rise"
        ],
        [
          "गंभीर जल संकट और पर्यावरणीय दबाव",
          "असीमित जल उपलब्धता",
          "वर्षा में स्थायी वृद्धि",
          "भूजल स्तर हमेशा बढ़ेगा"
        ],
        0,
        ["Demand rises while resources decline."],
        "Unsustainable use eventually leads to shortages and ecological problems.",
        "असतत उपयोग अंततः जल संकट और पर्यावरणीय समस्याओं को जन्म देता है।",
        "hard",
        1050
      ]

    ])
  },
  {
  chapterNumber: 17,
  topicId: "science-forests-our-lifeline",
  chapterTitle: "Forests: Our Lifeline",
  chapterTitleHindi: "वन: हमारी जीवन रेखा",
  questions: makeQuestionSetFromConcepts("science-forests-our-lifeline", [

    [
      "7-science-forest-01",
      ["forest-ecosystem"],
      "A student describes a forest as 'just a collection of trees'. Which statement best explains why this description is incomplete?",
      "एक विद्यार्थी वन को 'केवल पेड़ों का समूह' बताता है। यह वर्णन अधूरा क्यों है?",
      [
        "A forest is a complex ecosystem of plants, animals, microorganisms and non-living components",
        "Forests contain only trees and soil",
        "Forests are created only by humans",
        "Animals do not depend on forests"
      ],
      [
        "वन पौधों, जानवरों, सूक्ष्मजीवों और निर्जीव घटकों से बना जटिल पारितंत्र है",
        "वनों में केवल पेड़ और मिट्टी होते हैं",
        "वन केवल मनुष्यों द्वारा बनाए जाते हैं",
        "जानवर वन पर निर्भर नहीं होते"
      ],
      0,
      ["Think about ecosystem interactions."],
      "Forests are self-sustaining ecosystems containing living and non-living components.",
      "वन एक जटिल पारितंत्र हैं जिनमें जीवित और निर्जीव दोनों घटक शामिल होते हैं।",
      "medium",
      900
    ],

    [
      "7-science-forest-02",
      ["producers"],
      "In a forest food chain, why are green plants called producers?",
      "वन खाद्य शृंखला में हरे पौधों को उत्पादक क्यों कहा जाता है?",
      [
        "They prepare their own food using sunlight",
        "They consume animals",
        "They decompose dead organisms",
        "They store all forest energy"
      ],
      [
        "वे सूर्यप्रकाश की सहायता से अपना भोजन स्वयं बनाते हैं",
        "वे जानवरों को खाते हैं",
        "वे मृत जीवों का अपघटन करते हैं",
        "वे सारी ऊर्जा संग्रहित करते हैं"
      ],
      0,
      ["Photosynthesis is important."],
      "Green plants produce food and form the base of food chains.",
      "हरे पौधे भोजन बनाते हैं और खाद्य शृंखला का आधार होते हैं।",
      "easy",
      880
    ],

    [
      "7-science-forest-03",
      ["consumers"],
      "A deer feeds on grass and leaves in a forest. It is classified as:",
      "एक हिरण वन में घास और पत्तियाँ खाता है। इसे किस श्रेणी में रखा जाएगा?",
      [
        "Primary consumer",
        "Producer",
        "Decomposer",
        "Secondary consumer"
      ],
      [
        "प्राथमिक उपभोक्ता",
        "उत्पादक",
        "अपघटक",
        "द्वितीयक उपभोक्ता"
      ],
      0,
      ["It feeds directly on plants."],
      "Herbivores that feed on plants are primary consumers.",
      "पौधों को खाने वाले शाकाहारी जीव प्राथमिक उपभोक्ता कहलाते हैं।",
      "easy",
      890
    ],

    [
      "7-science-forest-04",
      ["decomposers"],
      "Dead leaves and animal remains gradually disappear from the forest floor. Which organisms are mainly responsible for this process?",
      "मृत पत्तियाँ और जानवरों के अवशेष धीरे-धीरे वन भूमि से गायब हो जाते हैं। इसके लिए मुख्यतः कौन जिम्मेदार है?",
      [
        "Decomposers such as fungi and bacteria",
        "Herbivores",
        "Carnivores",
        "Producers"
      ],
      [
        "कवक और जीवाणु जैसे अपघटक",
        "शाकाहारी",
        "मांसाहारी",
        "उत्पादक"
      ],
      0,
      ["They recycle nutrients."],
      "Decomposers break down dead matter and return nutrients to the soil.",
      "अपघटक मृत पदार्थों को विघटित कर पोषक तत्व मिट्टी में लौटाते हैं।",
      "easy",
      900
    ],

    [
      "7-science-forest-05",
      ["food-chain"],
      "Which sequence correctly represents a simple forest food chain?",
      "निम्न में से कौन-सी एक सरल वन खाद्य शृंखला को सही दर्शाती है?",
      [
        "Grass → Deer → Tiger",
        "Tiger → Deer → Grass",
        "Grass → Tiger → Deer",
        "Deer → Grass → Tiger"
      ],
      [
        "घास → हिरण → बाघ",
        "बाघ → हिरण → घास",
        "घास → बाघ → हिरण",
        "हिरण → घास → बाघ"
      ],
      0,
      ["Energy flows from producers to consumers."],
      "Food chains begin with producers and move to consumers.",
      "खाद्य शृंखला उत्पादकों से शुरू होकर उपभोक्ताओं तक जाती है।",
      "easy",
      910
    ],

    [
      "7-science-forest-06",
      ["food-web"],
      "Why is a food web considered more realistic than a single food chain in a forest?",
      "वन में खाद्य जाल को एकल खाद्य शृंखला से अधिक यथार्थवादी क्यों माना जाता है?",
      [
        "Most organisms feed on and are eaten by multiple species",
        "Food chains do not exist",
        "Only plants form food webs",
        "Energy moves randomly"
      ],
      [
        "अधिकांश जीव कई प्रजातियों से जुड़े होते हैं",
        "खाद्य शृंखलाएँ अस्तित्व में नहीं हैं",
        "केवल पौधे खाद्य जाल बनाते हैं",
        "ऊर्जा यादृच्छिक रूप से चलती है"
      ],
      0,
      ["Many feeding relationships exist."],
      "Food webs show interconnected food chains in ecosystems.",
      "खाद्य जाल पारितंत्र में कई खाद्य शृंखलाओं के आपसी संबंध दर्शाता है।",
      "medium",
      930
    ],

    [
      "7-science-forest-07",
      ["soil-fertility"],
      "How do decomposers contribute directly to the fertility of forest soil?",
      "अपघटक वन की मिट्टी की उर्वरता बढ़ाने में सीधे कैसे योगदान देते हैं?",
      [
        "They convert dead matter into nutrients",
        "They remove all minerals",
        "They stop plant growth",
        "They reduce humus formation"
      ],
      [
        "वे मृत पदार्थों को पोषक तत्वों में बदलते हैं",
        "वे सभी खनिज हटा देते हैं",
        "वे पौधों की वृद्धि रोकते हैं",
        "वे ह्यूमस निर्माण कम करते हैं"
      ],
      0,
      ["Nutrient recycling."],
      "Decomposers enrich soil through nutrient recycling.",
      "अपघटक पोषक तत्वों का पुनर्चक्रण कर मिट्टी को उर्वर बनाते हैं।",
      "medium",
      940
    ],

    [
      "7-science-forest-08",
      ["forest-layers"],
      "Tall trees in a dense forest receive more sunlight than smaller plants below them. Which forest layer do these trees form?",
      "घने वन में ऊँचे पेड़ नीचे के पौधों की तुलना में अधिक सूर्यप्रकाश प्राप्त करते हैं। वे कौन-सी परत बनाते हैं?",
      [
        "Canopy",
        "Forest floor",
        "Humus layer",
        "Root zone"
      ],
      [
        "वृक्ष-छत्र (कैनोपी)",
        "वन तल",
        "ह्यूमस परत",
        "जड़ क्षेत्र"
      ],
      0,
      ["Uppermost leafy layer."],
      "The canopy forms the upper layer of a forest.",
      "कैनोपी वन की ऊपरी परत बनाती है।",
      "medium",
      950
    ],

    [
      "7-science-forest-09",
      ["forest-benefits"],
      "Which forest function is most directly related to maintaining atmospheric oxygen levels?",
      "वायुमंडलीय ऑक्सीजन स्तर बनाए रखने से सबसे सीधे जुड़ा वन का कौन-सा कार्य है?",
      [
        "Photosynthesis by green plants",
        "Decomposition",
        "Predation",
        "Soil erosion"
      ],
      [
        "हरे पौधों द्वारा प्रकाश संश्लेषण",
        "अपघटन",
        "शिकार",
        "मृदा अपरदन"
      ],
      0,
      ["Plants release oxygen."],
      "Forests contribute oxygen through photosynthesis.",
      "वन प्रकाश संश्लेषण द्वारा ऑक्सीजन प्रदान करते हैं।",
      "easy",
      920
    ],

    [
      "7-science-forest-10",
      ["water-cycle"],
      "How do forests help in maintaining the water cycle?",
      "वन जल चक्र को बनाए रखने में कैसे सहायता करते हैं?",
      [
        "Through transpiration and moisture release",
        "By preventing evaporation completely",
        "By stopping rainfall",
        "By removing clouds"
      ],
      [
        "वाष्पोत्सर्जन और नमी छोड़कर",
        "वाष्पीकरण पूरी तरह रोककर",
        "वर्षा रोककर",
        "बादलों को हटाकर"
      ],
      0,
      ["Plants release water vapour."],
      "Forests contribute moisture to the atmosphere through transpiration.",
      "वन वाष्पोत्सर्जन के माध्यम से वायुमंडल में नमी पहुँचाते हैं।",
      "medium",
      940
    ],

    [
      "7-science-forest-11",
      ["deforestation"],
      "Large-scale cutting of trees without adequate replacement is known as:",
      "पर्याप्त पुनर्वनीकरण के बिना बड़े पैमाने पर पेड़ों की कटाई को क्या कहते हैं?",
      [
        "Deforestation",
        "Afforestation",
        "Conservation",
        "Pollination"
      ],
      [
        "वनों की कटाई",
        "वनीकरण",
        "संरक्षण",
        "परागण"
      ],
      0,
      ["Loss of forest cover."],
      "Deforestation refers to the removal of forests.",
      "वनों को हटाने की प्रक्रिया वनों की कटाई कहलाती है।",
      "easy",
      910
    ],

    [
      "7-science-forest-12",
      ["deforestation-effects"],
      "Which problem is most likely to increase immediately after large-scale deforestation on hill slopes?",
      "पहाड़ी ढलानों पर बड़े पैमाने पर वनों की कटाई के बाद कौन-सी समस्या सबसे पहले बढ़ सकती है?",
      [
        "Soil erosion",
        "Groundwater recharge",
        "Biodiversity increase",
        "Rainfall increase"
      ],
      [
        "मृदा अपरदन",
        "भूजल पुनर्भरण",
        "जैव विविधता में वृद्धि",
        "वर्षा में वृद्धि"
      ],
      0,
      ["Roots hold soil together."],
      "Tree roots help prevent soil erosion.",
      "पेड़ों की जड़ें मिट्टी को बाँधे रखती हैं और अपरदन रोकती हैं।",
      "medium",
      950
    ],

    [
      "7-science-forest-13",
      ["biodiversity"],
      "Why are forests often described as reservoirs of biodiversity?",
      "वनों को जैव विविधता का भंडार क्यों कहा जाता है?",
      [
        "They support a large variety of living organisms",
        "They contain only trees",
        "They have no microorganisms",
        "They support one dominant species"
      ],
      [
        "वे जीवों की अनेक प्रजातियों का समर्थन करते हैं",
        "उनमें केवल पेड़ होते हैं",
        "उनमें सूक्ष्मजीव नहीं होते",
        "वे केवल एक प्रजाति का समर्थन करते हैं"
      ],
      0,
      ["Think about species diversity."],
      "Forests provide habitats for numerous species.",
      "वन अनेक प्रकार की प्रजातियों को आश्रय प्रदान करते हैं।",
      "medium",
      960
    ],

    [
      "7-science-forest-14",
      ["wildlife"],
      "If a forest habitat disappears, what is the most likely effect on animals living there?",
      "यदि वन आवास नष्ट हो जाए, तो वहाँ रहने वाले जानवरों पर सबसे संभावित प्रभाव क्या होगा?",
      [
        "Loss of shelter, food and breeding sites",
        "Unlimited food availability",
        "Increase in habitat space",
        "Instant adaptation of all species"
      ],
      [
        "आश्रय, भोजन और प्रजनन स्थलों का नुकसान",
        "असीमित भोजन उपलब्धता",
        "आवास क्षेत्र में वृद्धि",
        "सभी प्रजातियों का तुरंत अनुकूलन"
      ],
      0,
      ["Animals depend on habitats."],
      "Habitat loss threatens wildlife survival.",
      "आवास की हानि वन्यजीवों के अस्तित्व को खतरे में डालती है।",
      "medium",
      970
    ],

    [
      "7-science-forest-15",
      ["olympiad", "food-web"],
      "If all decomposers in a forest suddenly disappeared, what would happen first?",
      "यदि वन के सभी अपघटक अचानक समाप्त हो जाएँ, तो सबसे पहले क्या होगा?",
      [
        "Dead organic matter would begin accumulating rapidly",
        "Photosynthesis would stop immediately",
        "All herbivores would vanish instantly",
        "Rainfall would cease"
      ],
      [
        "मृत जैविक पदार्थ तेजी से जमा होने लगेगा",
        "प्रकाश संश्लेषण तुरंत रुक जाएगा",
        "सभी शाकाहारी तुरंत गायब हो जाएँगे",
        "वर्षा बंद हो जाएगी"
      ],
      0,
      ["Think about decomposition."],
      "Without decomposers, nutrient recycling would stop and dead matter would accumulate.",
      "अपघटकों के बिना मृत पदार्थ जमा होने लगेंगे और पोषक तत्वों का पुनर्चक्रण रुक जाएगा।",
      "hard",
      990
    ],

    [
      "7-science-forest-16",
      ["nutrient-cycle"],
      "Why is the nutrient cycle essential for the long-term survival of forests?",
      "वनों के दीर्घकालिक अस्तित्व के लिए पोषक तत्व चक्र क्यों आवश्यक है?",
      [
        "It continuously returns nutrients to the ecosystem",
        "It removes all nutrients permanently",
        "It prevents plant growth",
        "It stops decomposition"
      ],
      [
        "यह लगातार पोषक तत्वों को पारितंत्र में लौटाता है",
        "यह सभी पोषक तत्व स्थायी रूप से हटा देता है",
        "यह पौधों की वृद्धि रोकता है",
        "यह अपघटन रोकता है"
      ],
      0,
      ["Recycling maintains fertility."],
      "Nutrient cycling keeps ecosystems productive.",
      "पोषक तत्वों का पुनर्चक्रण पारितंत्र को उत्पादक बनाए रखता है।",
      "hard",
      1000
    ],

    [
      "7-science-forest-17",
      ["forest-conservation"],
      "Which action would contribute most directly to sustainable forest management?",
      "सतत वन प्रबंधन में सबसे प्रत्यक्ष योगदान कौन-सी गतिविधि देगी?",
      [
        "Planting new trees along with controlled harvesting",
        "Cutting all mature trees",
        "Removing wildlife",
        "Preventing all plant growth"
      ],
      [
        "नियंत्रित कटाई के साथ नए पेड़ लगाना",
        "सभी परिपक्व पेड़ों को काट देना",
        "वन्यजीवों को हटाना",
        "सभी पौधों की वृद्धि रोकना"
      ],
      0,
      ["Balance use and regeneration."],
      "Sustainable forestry requires both utilization and renewal.",
      "सतत वानिकी में उपयोग और पुनर्जनन दोनों आवश्यक हैं।",
      "hard",
      1010
    ],

    [
      "7-science-forest-18",
      ["data-interpretation"],
      "A forest area supports 500 plant species, 120 bird species and 60 mammal species. What ecological feature does this primarily indicate?",
      "एक वन क्षेत्र में 500 पौधों की, 120 पक्षियों की और 60 स्तनधारियों की प्रजातियाँ पाई जाती हैं। यह मुख्यतः किसका संकेत है?",
      [
        "High biodiversity",
        "Low productivity",
        "Poor ecosystem health",
        "Absence of food chains"
      ],
      [
        "उच्च जैव विविधता",
        "कम उत्पादकता",
        "खराब पारितंत्र स्वास्थ्य",
        "खाद्य शृंखलाओं का अभाव"
      ],
      0,
      ["Many species are present."],
      "A large number of species indicates rich biodiversity.",
      "अनेक प्रजातियों की उपस्थिति उच्च जैव विविधता को दर्शाती है।",
      "hard",
      1020
    ],

    [
      "7-science-forest-19",
      ["multi-concept"],
      "Which combination of forest functions provides the greatest benefit to both humans and wildlife?",
      "वनों के कौन-से कार्य मनुष्यों और वन्यजीवों दोनों को सबसे अधिक लाभ पहुँचाते हैं?",
      [
        "Habitat provision, oxygen production and soil conservation",
        "Deforestation and mining",
        "Habitat destruction and pollution",
        "Overgrazing and excessive logging"
      ],
      [
        "आवास प्रदान करना, ऑक्सीजन उत्पादन और मृदा संरक्षण",
        "वनों की कटाई और खनन",
        "आवास विनाश और प्रदूषण",
        "अत्यधिक चराई और कटाई"
      ],
      0,
      ["Think ecosystem services."],
      "Forests provide multiple ecological services simultaneously.",
      "वन एक साथ अनेक पारिस्थितिक सेवाएँ प्रदान करते हैं।",
      "hard",
      1035
    ],

    [
      "7-science-forest-20",
      ["olympiad", "reasoning"],
      "A forest ecosystem loses most of its tree cover over several decades. Which long-term consequence is most likely?",
      "कई दशकों में किसी वन पारितंत्र का अधिकांश वृक्ष आवरण नष्ट हो जाता है। दीर्घकाल में सबसे संभावित परिणाम क्या होगा?",
      [
        "Reduced biodiversity, soil degradation and ecological imbalance",
        "Unlimited growth of all species",
        "Permanent increase in soil fertility",
        "No effect on the ecosystem"
      ],
      [
        "जैव विविधता में कमी, मृदा क्षरण और पारिस्थितिक असंतुलन",
        "सभी प्रजातियों की असीमित वृद्धि",
        "मिट्टी की उर्वरता में स्थायी वृद्धि",
        "पारितंत्र पर कोई प्रभाव नहीं"
      ],
      0,
      ["Forests support entire ecosystems."],
      "Loss of forests disrupts biodiversity, nutrient cycles and ecosystem stability.",
      "वनों की हानि जैव विविधता, पोषक चक्र और पारिस्थितिक संतुलन को प्रभावित करती है।",
      "hard",
      1050
    ]

  ])
},
  {
  chapterNumber: 18,
  topicId: "science-wastewater-story",
  chapterTitle: "Wastewater Story",
  chapterTitleHindi: "अपशिष्ट जल की कहानी",
  questions: makeQuestionSetFromConcepts("science-wastewater-story", [

    [
      "7-science-wws-01",
      ["wastewater"],
      "A household uses water for bathing, washing clothes, cleaning utensils and flushing toilets. What is the term used for the used water that flows out afterward?",
      "एक घर में स्नान, कपड़े धोने, बर्तन साफ करने और शौचालय उपयोग के बाद निकलने वाले जल को क्या कहते हैं?",
      [
        "Wastewater",
        "Groundwater",
        "Drinking water",
        "Distilled water"
      ],
      [
        "अपशिष्ट जल",
        "भूजल",
        "पेयजल",
        "आसुत जल"
      ],
      0,
      ["Used water contains impurities."],
      "Water that has been used and contains contaminants is called wastewater.",
      "उपयोग के बाद अशुद्धियों युक्त जल को अपशिष्ट जल कहते हैं।",
      "easy",
      880
    ],

    [
      "7-science-wws-02",
      ["sewage"],
      "A city collects wastewater from homes, schools, hospitals and industries through underground pipes. This mixture is known as:",
      "एक शहर घरों, विद्यालयों, अस्पतालों और उद्योगों से निकलने वाले अपशिष्ट जल को भूमिगत पाइपों से एकत्र करता है। इस मिश्रण को क्या कहते हैं?",
      [
        "Sewage",
        "Rainwater",
        "Groundwater",
        "Mineral water"
      ],
      [
        "मलजल",
        "वर्षा जल",
        "भूजल",
        "खनिज जल"
      ],
      0,
      ["Contains wastewater and other wastes."],
      "Sewage is wastewater carrying dissolved and suspended impurities.",
      "मलजल अशुद्धियों से युक्त अपशिष्ट जल होता है।",
      "easy",
      890
    ],

    [
      "7-science-wws-03",
      ["contaminants"],
      "Which of the following is most likely to contaminate water and make it unsafe for drinking?",
      "निम्न में से कौन-सी वस्तु जल को प्रदूषित कर पीने योग्य नहीं रहने देती है?",
      [
        "Human and animal waste",
        "Pure oxygen",
        "Clean sand only",
        "Sunlight"
      ],
      [
        "मानव और पशु अपशिष्ट",
        "शुद्ध ऑक्सीजन",
        "केवल स्वच्छ रेत",
        "सूर्यप्रकाश"
      ],
      0,
      ["Disease-causing organisms may be present."],
      "Human and animal wastes often contain harmful microbes.",
      "मानव और पशु अपशिष्ट में हानिकारक सूक्ष्मजीव हो सकते हैं।",
      "easy",
      900
    ],

    [
      "7-science-wws-04",
      ["water-pollution"],
      "A factory releases untreated wastewater into a river. Which consequence is most likely?",
      "एक कारखाना बिना उपचारित अपशिष्ट जल नदी में छोड़ देता है। इसका सबसे संभावित परिणाम क्या होगा?",
      [
        "Water pollution increases",
        "Water becomes cleaner",
        "Fish population immediately doubles",
        "Groundwater rises instantly"
      ],
      [
        "जल प्रदूषण बढ़ेगा",
        "जल अधिक स्वच्छ हो जाएगा",
        "मछलियों की संख्या दोगुनी हो जाएगी",
        "भूजल तुरंत बढ़ जाएगा"
      ],
      0,
      ["Untreated waste harms ecosystems."],
      "Industrial wastewater can pollute rivers and harm aquatic life.",
      "औद्योगिक अपशिष्ट जल नदियों को प्रदूषित कर सकता है।",
      "easy",
      910
    ],

    [
      "7-science-wws-05",
      ["sewer-system"],
      "Why are sewer systems important in modern cities?",
      "आधुनिक शहरों में सीवर प्रणाली क्यों महत्वपूर्ण है?",
      [
        "They safely transport sewage away from populated areas",
        "They store drinking water",
        "They increase air pollution",
        "They produce electricity"
      ],
      [
        "वे मलजल को सुरक्षित रूप से दूर ले जाती हैं",
        "वे पेयजल संग्रहित करती हैं",
        "वे वायु प्रदूषण बढ़ाती हैं",
        "वे बिजली उत्पन्न करती हैं"
      ],
      0,
      ["Think public health."],
      "Sewer systems reduce disease risk by carrying away wastewater.",
      "सीवर प्रणाली अपशिष्ट जल को दूर ले जाकर रोगों के खतरे को कम करती है।",
      "medium",
      920
    ],

    [
      "7-science-wws-06",
      ["wwtp"],
      "What is the main purpose of a wastewater treatment plant (WWTP)?",
      "अपशिष्ट जल शोधन संयंत्र (WWTP) का मुख्य उद्देश्य क्या है?",
      [
        "To remove contaminants before releasing water",
        "To create sewage",
        "To increase pollution",
        "To evaporate all water"
      ],
      [
        "जल छोड़ने से पहले अशुद्धियाँ हटाना",
        "मलजल बनाना",
        "प्रदूषण बढ़ाना",
        "सारा जल वाष्पित करना"
      ],
      0,
      ["Treatment improves water quality."],
      "Wastewater treatment plants clean sewage before discharge.",
      "अपशिष्ट जल शोधन संयंत्र मलजल को साफ करते हैं।",
      "easy",
      930
    ],

    [
      "7-science-wws-07",
      ["bar-screen"],
      "At the beginning of wastewater treatment, sewage passes through bar screens. What is their function?",
      "अपशिष्ट जल शोधन के प्रारंभ में मलजल बार स्क्रीन से गुजरता है। उनका कार्य क्या है?",
      [
        "Remove large objects like plastic, sticks and rags",
        "Kill bacteria",
        "Add chemicals",
        "Produce oxygen"
      ],
      [
        "प्लास्टिक, लकड़ी और कपड़े जैसी बड़ी वस्तुएँ हटाना",
        "जीवाणुओं को मारना",
        "रसायन मिलाना",
        "ऑक्सीजन उत्पन्न करना"
      ],
      0,
      ["First step removes large debris."],
      "Bar screens trap large solid materials.",
      "बार स्क्रीन बड़े ठोस पदार्थों को रोकती हैं।",
      "medium",
      940
    ],

    [
      "7-science-wws-08",
      ["sedimentation"],
      "During sedimentation, sewage is allowed to stand undisturbed. Why?",
      "अवसादन प्रक्रिया में मलजल को कुछ समय तक स्थिर रखा जाता है। क्यों?",
      [
        "Heavier solids settle at the bottom",
        "Water turns into steam",
        "Bacteria disappear instantly",
        "Oxygen becomes solid"
      ],
      [
        "भारी ठोस पदार्थ नीचे बैठ जाते हैं",
        "जल भाप बन जाता है",
        "जीवाणु तुरंत गायब हो जाते हैं",
        "ऑक्सीजन ठोस बन जाती है"
      ],
      0,
      ["Gravity separates particles."],
      "Sedimentation allows suspended solids to settle.",
      "अवसादन में भारी कण नीचे बैठ जाते हैं।",
      "medium",
      950
    ],

    [
      "7-science-wws-09",
      ["sludge"],
      "What is the name given to the solid material that settles at the bottom of sedimentation tanks?",
      "अवसादन टैंक के तल में जमा ठोस पदार्थ को क्या कहते हैं?",
      [
        "Sludge",
        "Scum",
        "Humus",
        "Filtrate"
      ],
      [
        "अवमल (Sludge)",
        "स्कम",
        "ह्यूमस",
        "निस्यंद"
      ],
      0,
      ["Settled solids."],
      "The settled solid material is called sludge.",
      "नीचे बैठने वाले ठोस पदार्थ को अवमल कहते हैं।",
      "easy",
      940
    ],

    [
      "7-science-wws-10",
      ["scum"],
      "Fats and oils in sewage often float on the surface during treatment. This floating layer is called:",
      "मलजल में वसा और तेल ऊपर तैरने लगते हैं। इस तैरती हुई परत को क्या कहते हैं?",
      [
        "Scum",
        "Sludge",
        "Humus",
        "Sediment"
      ],
      [
        "स्कम",
        "अवमल",
        "ह्यूमस",
        "अवसाद"
      ],
      0,
      ["Floating impurities."],
      "Floating oils and grease form scum.",
      "तेल और वसा की तैरती परत को स्कम कहते हैं।",
      "easy",
      950
    ],

    [
      "7-science-wws-11",
      ["aeration"],
      "Why is air pumped into wastewater during the aeration stage?",
      "वातन चरण में अपशिष्ट जल में हवा क्यों प्रवाहित की जाती है?",
      [
        "To help microorganisms break down organic matter",
        "To freeze the water",
        "To increase sludge formation only",
        "To remove all oxygen"
      ],
      [
        "सूक्ष्मजीवों को कार्बनिक पदार्थ विघटित करने में सहायता के लिए",
        "जल को जमाने के लिए",
        "केवल अवमल बढ़ाने के लिए",
        "सारी ऑक्सीजन हटाने के लिए"
      ],
      0,
      ["Microorganisms need oxygen."],
      "Aeration supports aerobic microorganisms that clean wastewater.",
      "वातन से सूक्ष्मजीवों को अपशिष्ट पदार्थ विघटित करने में सहायता मिलती है।",
      "medium",
      970
    ],

    [
      "7-science-wws-12",
      ["microorganisms"],
      "Why are microorganisms often called the 'workers' of a wastewater treatment plant?",
      "सूक्ष्मजीवों को अपशिष्ट जल शोधन संयंत्र के 'कार्यकर्ता' क्यों कहा जाता है?",
      [
        "They decompose organic pollutants",
        "They produce plastic",
        "They increase contamination",
        "They stop water flow"
      ],
      [
        "वे कार्बनिक प्रदूषकों का विघटन करते हैं",
        "वे प्लास्टिक बनाते हैं",
        "वे प्रदूषण बढ़ाते हैं",
        "वे जल प्रवाह रोकते हैं"
      ],
      0,
      ["Biological treatment."],
      "Microorganisms help remove organic waste naturally.",
      "सूक्ष्मजीव जैविक अपशिष्टों को विघटित करते हैं।",
      "medium",
      980
    ],

    [
      "7-science-wws-13",
      ["sanitation"],
      "How does proper sanitation improve public health?",
      "उचित स्वच्छता सार्वजनिक स्वास्थ्य को कैसे बेहतर बनाती है?",
      [
        "By reducing the spread of disease-causing organisms",
        "By increasing water pollution",
        "By reducing oxygen levels",
        "By creating more waste"
      ],
      [
        "रोग फैलाने वाले सूक्ष्मजीवों का प्रसार कम करके",
        "जल प्रदूषण बढ़ाकर",
        "ऑक्सीजन स्तर घटाकर",
        "अधिक कचरा उत्पन्न करके"
      ],
      0,
      ["Think disease prevention."],
      "Good sanitation reduces waterborne diseases.",
      "उचित स्वच्छता जलजनित रोगों को कम करती है।",
      "medium",
      960
    ],

    [
      "7-science-wws-14",
      ["waterborne-diseases"],
      "Which disease is most commonly associated with contaminated drinking water?",
      "दूषित पेयजल से सामान्यतः कौन-सा रोग जुड़ा होता है?",
      [
        "Cholera",
        "Diabetes",
        "Asthma",
        "Arthritis"
      ],
      [
        "हैजा",
        "मधुमेह",
        "अस्थमा",
        "गठिया"
      ],
      0,
      ["Waterborne infection."],
      "Cholera spreads through contaminated water and food.",
      "हैजा दूषित जल के माध्यम से फैल सकता है।",
      "medium",
      970
    ],

    [
      "7-science-wws-15",
      ["household-practices"],
      "Which practice helps prevent blockage of sewer pipes?",
      "सीवर पाइपों में रुकावट रोकने के लिए कौन-सी आदत सबसे अच्छी है?",
      [
        "Avoid disposing oils, plastics and solids into drains",
        "Throw cooking oil into sinks",
        "Flush plastic bags down toilets",
        "Dump garbage into drains"
      ],
      [
        "तेल, प्लास्टिक और ठोस कचरा नालियों में न डालना",
        "खाना पकाने का तेल सिंक में डालना",
        "प्लास्टिक बैग शौचालय में बहाना",
        "कचरा नालियों में फेंकना"
      ],
      0,
      ["Think responsible waste disposal."],
      "Proper disposal prevents sewer blockages.",
      "उचित निपटान सीवर जाम होने से बचाता है।",
      "hard",
      990
    ],

    [
      "7-science-wws-16",
      ["olympiad", "reasoning"],
      "A city stops treating its sewage before releasing it into rivers. Which long-term effect is most likely?",
      "यदि कोई शहर बिना शोधन के मलजल नदियों में छोड़ना शुरू कर दे, तो दीर्घकाल में क्या होगा?",
      [
        "Water quality will decline and aquatic ecosystems will be harmed",
        "River water will become cleaner",
        "Fish populations will always increase",
        "Waterborne diseases will disappear"
      ],
      [
        "जल गुणवत्ता घटेगी और जलीय पारितंत्र प्रभावित होंगे",
        "नदी का जल अधिक स्वच्छ हो जाएगा",
        "मछलियों की संख्या हमेशा बढ़ेगी",
        "जलजनित रोग समाप्त हो जाएँगे"
      ],
      0,
      ["Think environmental impact."],
      "Untreated sewage damages ecosystems and public health.",
      "बिना उपचारित मलजल पर्यावरण और स्वास्थ्य दोनों को प्रभावित करता है।",
      "hard",
      1000
    ],

    [
      "7-science-wws-17",
      ["resource-recovery"],
      "Why can treated wastewater be considered a valuable resource?",
      "उपचारित अपशिष्ट जल को मूल्यवान संसाधन क्यों माना जा सकता है?",
      [
        "It can be reused for irrigation and other non-drinking purposes",
        "It becomes solid rock",
        "It creates unlimited fresh water",
        "It no longer contains water"
      ],
      [
        "इसे सिंचाई और अन्य कार्यों में पुनः उपयोग किया जा सकता है",
        "यह ठोस चट्टान बन जाता है",
        "यह असीमित मीठा जल बना देता है",
        "इसमें जल नहीं बचता"
      ],
      0,
      ["Reuse conserves water."],
      "Treated wastewater can reduce pressure on freshwater resources.",
      "उपचारित जल का पुनः उपयोग मीठे जल की बचत करता है।",
      "hard",
      1010
    ],

    [
      "7-science-wws-18",
      ["data-interpretation"],
      "A treatment plant removes 95% of suspended solids from sewage. What does this indicate?",
      "एक शोधन संयंत्र मलजल से 95% निलंबित ठोस पदार्थ हटा देता है। यह क्या दर्शाता है?",
      [
        "The treatment process is highly effective",
        "No treatment occurred",
        "Pollution increased",
        "Water became unusable"
      ],
      [
        "शोधन प्रक्रिया अत्यधिक प्रभावी है",
        "कोई शोधन नहीं हुआ",
        "प्रदूषण बढ़ गया",
        "जल अनुपयोगी हो गया"
      ],
      0,
      ["High removal efficiency."],
      "Removing most contaminants indicates successful treatment.",
      "अधिकांश अशुद्धियों का हटना प्रभावी शोधन का संकेत है।",
      "hard",
      1020
    ],

    [
      "7-science-wws-19",
      ["multi-concept"],
      "Which combination contributes most to cleaner water bodies and healthier communities?",
      "स्वच्छ जल स्रोतों और स्वस्थ समुदायों के लिए कौन-सा संयोजन सबसे अधिक योगदान देता है?",
      [
        "Proper sanitation, sewage treatment and responsible waste disposal",
        "Open dumping and untreated discharge",
        "Plastic disposal into drains",
        "Ignoring wastewater management"
      ],
      [
        "उचित स्वच्छता, मलजल शोधन और जिम्मेदार अपशिष्ट निपटान",
        "खुला कचरा फेंकना और बिना उपचारित जल छोड़ना",
        "नालियों में प्लास्टिक फेंकना",
        "अपशिष्ट जल प्रबंधन की अनदेखी"
      ],
      0,
      ["Think integrated management."],
      "These practices reduce pollution and disease transmission.",
      "ये उपाय प्रदूषण और रोग प्रसार दोनों को कम करते हैं।",
      "hard",
      1035
    ],

    [
      "7-science-wws-20",
      ["olympiad", "reasoning"],
      "A growing city doubles its population but does not improve its wastewater management system. Which challenge is most likely to become severe?",
      "एक बढ़ते शहर की जनसंख्या दोगुनी हो जाती है लेकिन उसकी अपशिष्ट जल प्रबंधन प्रणाली में सुधार नहीं होता। कौन-सी समस्या सबसे गंभीर हो सकती है?",
      [
        "Water pollution and public health risks",
        "Decrease in sewage generation",
        "Unlimited clean water supply",
        "Complete elimination of waste"
      ],
      [
        "जल प्रदूषण और सार्वजनिक स्वास्थ्य जोखिम",
        "मलजल उत्पादन में कमी",
        "असीमित स्वच्छ जल आपूर्ति",
        "अपशिष्ट का पूर्ण समाप्त होना"
      ],
      0,
      ["More people generate more wastewater."],
      "Growing populations require stronger wastewater infrastructure.",
      "बढ़ती जनसंख्या के साथ बेहतर अपशिष्ट जल प्रबंधन आवश्यक होता है।",
      "hard",
      1050
    ]

  ])
},
];

export { class7ScienceQuestionBank };
