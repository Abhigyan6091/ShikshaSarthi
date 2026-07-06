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
  chapterNumber: 1,
  topicId: "science-chemical-reactions-equations",
  chapterTitle: "Chemical Reactions and Equations",
  chapterTitleHindi: "रासायनिक अभिक्रियाएं एवं समीकरण",
  questions: makeQuestionSet("science-chemical-reactions-equations", [

    ["10-sc-cr-01", ["magnesium-ribbon", "oxidation", "basics"],
      "Why is a magnesium ribbon rubbed with sandpaper before burning it in air?",
      "वायु में जलाने से पहले मैग्नीशियम रिबन को रेगमाल (रेतपत्र) से क्यों रगड़ा जाता है?",
      ["To make its surface shiny", "To remove the protective layer of basic magnesium carbonate", "To reduce its ignition temperature", "To remove moisture from its surface"],
      ["इसकी सतह को चमकदार बनाने के लिए", "बेसिक मैग्नीशियम कार्बोनेट की सुरक्षात्मक परत को हटाने के लिए", "इसके ज्वलन ताप को कम करने के लिए", "इसकी सतह से नमी हटाने के लिए"],
      1,
      ["Magnesium reacts with moist air to form a stable passive layer on its surface.", "मैग्नीशियम नम वायु के साथ अभिक्रिया करके अपनी सतह पर एक स्थायी निष्क्रिय परत बना लेता है।"],
      "Magnesium ribbon forms a protective layer of basic magnesium carbonate on its surface due to reaction with moist air. This layer must be removed to allow it to burn effectively.",
      "नम वायु के साथ अभिक्रिया के कारण मैग्नीशियम रिबन की सतह पर बेसिक मैग्नीशियम कार्बोनेट की एक सुरक्षात्मक परत बन जाती है। इसे प्रभावी ढंग से जलाने के लिए इस परत को हटाना आवश्यक है।",
      "easy", 1410
    ],

    ["10-sc-cr-02", ["combination-reaction", "exothermic", "slaked-lime"],
      "When water is added to quicklime, a large amount of heat is evolved along with a hissing sound. Identify the type of reaction and the product formed.",
      "जब बिना बुझे चूने में पानी मिलाया जाता है, तो फुसफुसाहट की आवाज के साथ अत्यधिक मात्रा में ऊष्मा उत्पन्न होती है। अभिक्रिया के प्रकार और बनने वाले उत्पाद की पहचान कीजिए।",
      ["Decomposition, Calcium hydroxide", "Combination, Calcium hydroxide", "Displacement, Calcium carbonate", "Combination, Calcium carbonate"],
      ["अपघटन, कैल्शियम हाइड्रोक्साइड", "संयोजन, कैल्शियम हाइड्रोक्साइड", "विस्थापन, कैल्शियम कार्बोनेट", "संयोजन, कैल्शियम कार्बोनेट"],
      1,
      ["Two reactants combine to form a single product, releasing energy.", "दो अभिकारक मिलकर एक एकल उत्पाद बनाते हैं और ऊर्जा मुक्त करते हैं।"],
      "Quicklime (CaO) reacts vigorously with water to form slaked lime [Ca(OH)2], releasing a large amount of heat. Hence, it is an exothermic combination reaction.",
      "बिना बुझा चूना (CaO) जल के साथ तेजी से अभिक्रिया करके बुझा हुआ चूना [Ca(OH)2] बनाता है और अत्यधिक मात्रा में ऊष्मा मुक्त करता है। इसलिए, यह एक ऊष्माक्षेपी संयोजन अभिक्रिया है।",
      "easy", 1430
    ],

    ["10-sc-cr-03", ["decomposition", "ferrous-sulfate", "color-change"],
      "On heating green ferrous sulfate crystals strongly, what are the primary gaseous products evolved?",
      "हरे रंग के फेरस सल्फेट क्रिस्टल को तेजी से गर्म करने पर मुख्य गैसीय उत्पाद कौन से निकलते हैं?",
      ["SO2 and O2", "SO2 and SO3", "SO3 and O2", "SO2 and H2O"],
      ["SO2 और O2", "SO2 और SO3", "SO3 और O2", "SO2 और H2O"],
      1,
      ["The gases have a characteristic suffocating smell of burning sulfur.", "इन गैसों में जलते हुए सल्फर जैसी दम घोटने वाली विशिष्ट गंध होती है।"],
      "Thermal decomposition of ferrous sulfate crystals yields solid ferric oxide (Fe2O3) and two gases: sulfur dioxide (SO2) and sulfur trioxide (SO3).",
      "फेरस सल्फेट क्रिस्टल के ऊष्मीय अपघटन से ठोस फेरिक ऑक्साइड (Fe2O3) और दो गैसें: सल्फर डाइऑक्साइड (SO2) और सल्फर ट्राईऑक्साइड (SO3) प्राप्त होती हैं।",
      "medium", 1460
    ],

    ["10-sc-cr-04", ["lead-nitrate", "thermal-decomposition", "brown-fumes"],
      "During the heating of lead nitrate powder in a test tube, brown fumes are observed. These brown fumes belong to which gas?",
      "एक परखनली में लेड नाइट्रेट पाउडर को गर्म करने के दौरान भूरा धुआं दिखाई देता है। यह भूरा धुआं किस गैस का होता है?",
      ["Nitric oxide (NO)", "Nitrogen dioxide (NO2)", "Nitrous oxide (N2O)", "Oxygen (O2)"],
      ["नाइट्रिक ऑक्साइड (NO)", "नाइट्रोजन डाइऑक्साइड (NO2)", "नाइट्रस ऑक्साइड (N2O)", "ऑक्सीजन (O2)"],
      1,
      ["This gas is a toxic oxide of nitrogen responsible for air pollution.", "यह गैस नाइट्रोजन का एक विषैला ऑक्साइड है जो वायु प्रदूषण के लिए उत्तरदायी है।"],
      "Lead nitrate decomposes on heating to produce lead oxide, oxygen, and nitrogen dioxide (NO2). The NO2 gas is emitted as distinct brown fumes.",
      "लेड नाइट्रेट गर्म करने पर अपघटित होकर लेड ऑक्साइड, ऑक्सीजन और नाइट्रोजन डाइऑक्साइड (NO2) बनाता है। NO2 गैस विशिष्ट भूरे धुएं के रूप में निकलती है।",
      "medium", 1480
    ],

    ["10-sc-cr-05", ["electrolysis-of-water", "decomposition", "stoichiometry"],
      "During the electrolysis of water, why is the volume of gas collected at one electrode double that of the other?",
      "जल के वैद्युत अपघटन के दौरान, एक इलेक्ट्रोड पर एकत्रित गैस का आयतन दूसरे इलेक्ट्रोड से दोगुना क्यों होता है?",
      ["Oxygen is twice as heavy as hydrogen", "Water contains hydrogen and oxygen in a 2:1 ratio by volume", "Hydrogen is twice as dense as oxygen", "Cathode attracts double the ions than anode"],
      ["ऑक्सीजन, हाइड्रोजन से दोगुनी भारी होती है", "जल में आयतन के अनुसार हाइड्रोजन और ऑक्सीजन 2:1 के अनुपात में होते हैं", "हाइड्रोजन का घनत्व ऑक्सीजन से दोगुना होता है", "कैथोड एनोड की तुलना में दोगुने आयनों को आकर्षित करता है"],
      1,
      ["Consider the chemical formula of water and its decomposition equation.", "जल के रासायनिक सूत्र और उसके अपघटन के समीकरण पर विचार करें।"],
      "The chemical formula of water is H2O. Stoichiometrically, 2 molecules of water decompose to give 2 molecules of Hydrogen gas and 1 molecule of Oxygen gas (2H2O -> 2H2 + O2).",
      "जल का रासायनिक सूत्र H2O है। रससमीकरणमिति (Stoichiometry) के अनुसार, जल के 2 अणु अपघटित होकर हाइड्रोजन गैस के 2 अणु और ऑक्सीजन गैस का 1 अणु देते हैं (2H2O -> 2H2 + O2)।",
      "hard", 1540
    ],

    ["10-sc-cr-06", ["electrolysis", "electrodes", "gases"],
      "In the electrolysis of water, identify the respective electrodes where Hydrogen and Oxygen gases are liberated.",
      "जल के वैद्युत अपघटन में, उन संबंधित इलेक्ट्रोडों की पहचान कीजिए जहाँ हाइड्रोजन और ऑक्सीजन गैसें मुक्त होती हैं।",
      ["Hydrogen at Cathode, Oxygen at Anode", "Hydrogen at Anode, Oxygen at Cathode", "Both gases are liberated at Cathode", "Both gases are liberated at Anode"],
      ["कैथोड पर हाइड्रोजन, एनोड पर ऑक्सीजन", "एनोड पर हाइड्रोजन, कैथोड पर ऑक्सीजन", "दोनों गैसें कैथोड पर मुक्त होती हैं", "दोनों गैसें एनोड पर मुक्त होती हैं"],
      0,
      ["Hydrogen ions are positive (H+), so they migrate towards the negative electrode.", "हाइड्रोजन आयन धनावेशित (H+) होते हैं, इसलिए वे ऋणात्मक इलेक्ट्रोड की ओर जाते हैं।"],
      "Hydrogen ions (H+) gain electrons at the negative electrode (Cathode) to form H2 gas. Hydroxide or oxygen-containing species lose electrons at the positive electrode (Anode) to form O2 gas.",
      "हाइड्रोजन आयन (H+) ऋणात्मक इलेक्ट्रोड (कैथोड) पर इलेक्ट्रॉन ग्रहण करके H2 गैस बनाते हैं। ऑक्सीजन वाले घटक धनात्मक इलेक्ट्रोड (एनोड) पर इलेक्ट्रॉन खोकर O2 गैस बनाते हैं।",
      "medium", 1510
    ],

    ["10-sc-cr-07", ["photolytic-decomposition", "silver-chloride", "color-change"],
      "White silver chloride turns grey when kept in sunlight. This is an example of which type of reaction?",
      "सफेद रंग का सिल्वर क्लोराइड सूर्य के प्रकाश में रखने पर धूसर (ग्रे) रंग का हो जाता है। यह किस प्रकार की अभिक्रिया का उदाहरण है?",
      ["Thermal decomposition", "Photolytic decomposition", "Displacement reaction", "Combination reaction"],
      ["ऊष्मीय अपघटन", "प्रकाशीय अपघटन", "विस्थापन अभिक्रिया", "संयोजन अभिक्रिया"],
      1,
      ["The reaction is driven by light energy from the sun.", "यह अभिक्रिया सूर्य से मिलने वाली प्रकाश ऊर्जा द्वारा संचालित होती है।"],
      "Silver chloride decomposes into silver metal (grey) and chlorine gas in the presence of sunlight. Because light energy breaks the bond, it is photolytic decomposition.",
      "सूर्य के प्रकाश की उपस्थिति में सिल्वर क्लोराइड, सिल्वर धातु (धूसर) और क्लोरीन गैस में अपघटित हो जाता है। क्योंकि प्रकाश ऊर्जा बंध को तोड़ती है, इसलिए यह प्रकाशीय अपघटन है।",
      "easy", 1420
    ],

    ["10-sc-cr-08", ["photography", "silver-bromide", "application"],
      "Which of the following compounds are used in black and white photography?",
      "निम्नलिखित में से कौन से यौगिकों का उपयोग श्वेत-श्याम (ब्लैक एंड व्हाइट) फोटोग्राफी में किया जाता है?",
      ["AgCl and AgBr", "AgCl and AgNO3", "AgBr and Ag2O", "FeSO4 and CaCO3"],
      ["AgCl और AgBr", "AgCl और AgNO3", "AgBr और Ag2O", "FeSO4 और CaCO3"],
      0,
      ["These are light-sensitive silver halides that undergo decomposition under light.", "ये प्रकाश-संवेदी सिल्वर हैलाइड हैं जो प्रकाश के संपर्क में आने पर अपघटित हो जाते हैं।"],
      "Both Silver chloride (AgCl) and Silver bromide (AgBr) undergo photolytic decomposition and have historically been used in black and white photographic films.",
      "सिल्वर क्लोराइड (AgCl) और सिल्वर ब्रोमाइड (AgBr) दोनों का प्रकाशीय अपघटन होता है और ऐतिहासिक रूप से इनका उपयोग श्वेत-श्याम फोटोग्राफिक फिल्मों में किया जाता रहा है।",
      "easy", 1440
    ],

    ["10-sc-cr-09", ["displacement", "reactivity-series", "iron-copper"],
      "When iron nails are placed in a copper sulfate solution, the blue color of the solution fades and turns light green. Why does this happen?",
      "जब लोहे की कीलों को कॉपर सल्फेट के विलयन में रखा जाता है, तो विलयन का नीला रंग फीका पड़ जाता है और हल्का हरा हो जाता है। ऐसा क्यों होता है?",
      ["Iron is less reactive than copper", "Iron is more reactive than copper and displaces it", "Copper displaces iron from its solution", "A double displacement reaction occurs"],
      ["लोहा, कॉपर की तुलना में कम अभिक्रियाशील है", "लोहा, कॉपर की तुलना में अधिक अभिक्रियाशील है और इसे विस्थापित कर देता है", "कॉपर, लोहे को उसके विलयन से विस्थापित कर देता है", "एक द्विविस्थापन अभिक्रिया होती है"],
      1,
      ["Think about the position of Iron (Fe) relative to Copper (Cu) in the reactivity series.", "सक्रियता श्रेणी में कॉपर (Cu) के सापेक्ष लोहे (Fe) की स्थिति के बारे में सोचें।"],
      "Iron is more reactive than copper. It displaces copper from CuSO4 solution to form iron sulfate (FeSO4), which is light green in color, depositing brown copper on the nail.",
      "लोहा कॉपर से अधिक अभिक्रियाशील होता है। यह CuSO4 विलयन से कॉपर को विस्थापित करके आयरन सल्फेट (FeSO4) बनाता है, जिसका रंग हल्का हरा होता है, और कील पर भूरा कॉपर जमा हो जाता है।",
      "easy", 1415
    ],

    ["10-sc-cr-10", ["displacement", "reactivity", "no-reaction"],
      "What will happen if a strip of copper metal is placed in an aqueous solution of ferrous sulfate?",
      "यदि कॉपर धातु की एक पट्टी को फेरस सल्फेट के जलीय विलयन में रखा जाए तो क्या होगा?",
      ["Copper will displace iron, turning the solution blue", "Iron will deposit on the copper strip", "No chemical reaction will take place", "The solution will turn colorless with evolution of gas"],
      ["कॉपर लोहे को विस्थापित कर देगा, जिससे विलयन नीला हो जाएगा", "लोहा कॉपर की पट्टी पर जमा हो जाएगा", "कोई रासायनिक अभिक्रिया नहीं होगी", "गैस निकलने के साथ विलयन रंगहीन हो जाएगा"],
      2,
      ["Check whether copper is higher or lower than iron in the reactivity series.", "जांचें कि सक्रियता श्रेणी में कॉपर लोहे से ऊपर है या नीचे।"],
      "Copper is less reactive than iron and is placed lower in the reactivity series. Therefore, it cannot displace iron from a ferrous sulfate solution, resulting in no reaction.",
      "कॉपर लोहे की तुलना में कम अभिक्रियाशील है और सक्रियता श्रेणी में नीचे स्थित है। इसलिए, यह फेरस सल्फेट विलयन से लोहे को विस्थापित नहीं कर सकता, जिसके परिणामस्वरूप कोई अभिक्रिया नहीं होती है।",
      "medium", 1470
    ],

    ["10-sc-cr-11", ["double-displacement", "precipitation", "barium-sulfate"],
      "When sodium sulfate solution is mixed with barium chloride solution, a white precipitate is formed immediately. Name the white precipitate compound.",
      "जब सोडियम सल्फेट विलयन को बेरियम क्लोराइड विलयन के साथ मिलाया जाता है, तो तुरंत एक सफेद अवक्षेप बनता है। उस सफेद अवक्षेप यौगिक का नाम बताइए।",
      ["Sodium chloride", "Barium sulfate", "Barium sulfite", "Sodium sulfate"],
      ["सोडियम क्लोराइड", "बेरियम सल्फेट", "बेरियम सल्फाइट", "सोडियम सल्फेट"],
      1,
      ["The precipitate is an insoluble salt formed by the exchange of anions between the two salts.", "यह अवक्षेप दोनों लवणों के बीच ऋणायनों के आदान-प्रदान से बनने वाला एक अघुलनशील लवण है।"],
      "The reaction is Na2SO4 + BaCl2 -> BaSO4 + 2NaCl. The white precipitate is caused by the formation of insoluble barium sulfate (BaSO4).",
      "यह अभिक्रिया Na2SO4 + BaCl2 -> BaSO4 + 2NaCl है। सफेद अवक्षेप अघुलनशील बेरियम सल्फेट (BaSO4) के बनने के कारण होता है।",
      "easy", 1450
    ],

    ["10-sc-cr-12", ["precipitation", "lead-iodide", "color"],
      "On mixing aqueous solutions of lead nitrate and potassium iodide, a precipitation reaction occurs. What is the color of the precipitate formed?",
      "लेड नाइट्रेट और पोटेशियम आयोडाइड के जलीय विलयनों को मिलाने पर एक अवक्षेपण अभिक्रिया होती है। बनने वाले अवक्षेप का रंग कैसा होता है?",
      ["White", "Yellow", "Black", "Brown"],
      ["सफेद", "पीला", "काला", "भूरा"],
      1,
      ["The product formed is lead iodide, which has a very bright, distinct color.", "बनने वाला उत्पाद लेड आयोडाइड है, जिसका रंग बहुत चमकीला और विशिष्ट होता है।"],
      "Lead nitrate reacts with potassium iodide to form a bright yellow precipitate of lead iodide (PbI2) along with soluble potassium nitrate.",
      "लेड नाइट्रेट पोटेशियम आयोडाइड के साथ अभिक्रिया करके घुलनशील पोटेशियम नाइट्रेट के साथ लेड आयोडाइड (PbI2) का चमकीला पीला अवक्षेप बनाता है।",
      "medium", 1490
    ],

    ["10-sc-cr-13", ["redox", "oxidation-reduction", "basics"],
      "In the chemical reaction: CuO + H2 -> Cu + H2O, identify the substances that are oxidized and reduced respectively.",
      "रासायनिक अभिक्रिया: CuO + H2 -> Cu + H2O में, क्रमशः ऑक्सीकृत (उपचयित) और अपचयित होने वाले पदार्थों की पहचान कीजिए।",
      ["H2 is oxidized, CuO is reduced", "CuO is oxidized, H2 is reduced", "Cu is oxidized, H2O is reduced", "H2 is oxidized, H2O is reduced"],
      ["H2 ऑक्सीकृत होता है, CuO अपचयित होता है", "CuO ऑक्सीकृत होता है, H2 अपचयित होता है", "Cu ऑक्सीकृत होता है, H2O अपचयित होता है", "H2 ऑक्सीकृत होता है, H2O अपचयित होता है"],
      0,
      ["Oxidation involves gain of oxygen, while reduction involves loss of oxygen.", "ऑक्सीकरण में ऑक्सीजन की वृद्धि शामिल है, जबकि अपचयन में ऑक्सीजन का ह्रास शामिल है।"],
      "Hydrogen gas (H2) gains oxygen to become H2O (oxidation). Copper oxide (CuO) loses oxygen to become Cu metal (reduction).",
      "हाइड्रोजन गैस (H2) ऑक्सीजन प्राप्त करके H2O बनाती है (ऑक्सीकरण)। कॉपर ऑक्साइड (CuO) ऑक्सीजन खोकर Cu धातु बनाता है (अपचयन)।",
      "easy", 1445
    ],

    ["10-sc-cr-14", ["redox", "oxidizing-agent", "advanced"],
      "In the reaction: MnO2 + 4HCl -> MnCl2 + 2H2O + Cl2, which substance acts as the reducing agent?",
      "अभिक्रिया: MnO2 + 4HCl -> MnCl2 + 2H2O + Cl2 में, कौन सा पदार्थ अपचायक के रूप में कार्य करता है?",
      ["MnO2", "HCl", "MnCl2", "Cl2"],
      ["MnO2", "HCl", "MnCl2", "Cl2"],
      1,
      ["The reducing agent is the substance that itself gets oxidized by losing hydrogen or gaining chlorine/oxygen.", "अपचायक वह पदार्थ है जो स्वयं हाइड्रोजन खोकर या क्लोरीन/ऑक्सीजन प्राप्त करके ऑक्सीकृत हो जाता है।"],
      "HCl loses hydrogen and forms Cl2 gas, meaning HCl is oxidized. The substance that is oxidized acts as the reducing agent, so HCl is the reducing agent.",
      "HCl हाइड्रोजन खोकर Cl2 गैस बनाता है, जिसका अर्थ है कि HCl ऑक्सीकृत होता है। जो पदार्थ ऑक्सीकृत होता है वह अपचायक के रूप में कार्य करता है, इसलिए HCl अपचायक है।",
      "hard", 1580
    ],

    ["10-sc-cr-15", ["balancing-equations", "stoichiometry", "coefficients"],
      "Balance the following chemical equation: a Fe + b H2O -> c Fe3O4 + d H2. Find the correct values of the coefficients a, b, c, and d.",
      "निम्नलिखित रासायनिक समीकरण को संतुलित कीजिए: a Fe + b H2O -> c Fe3O4 + d H2। गुणांक a, b, c और d के सही मान ज्ञात कीजिए।",
      ["a=1, b=4, c=1, d=4", ["a=3, b=4, c=1, d=4"], "a=3, b=2, c=1, d=2", "a=3, b=4, c=3, d=4"],
      ["a=1, b=4, c=1, d=4", ["a=3, b=4, c=1, d=4"], "a=3, b=2, c=1, d=2", "a=3, b=4, c=3, d=4"],
      1,
      ["Count the number of iron and oxygen atoms on the product side first.", "सबसे पहले उत्पाद की ओर आयरन और ऑक्सीजन के परमाणुओं की संख्या गिनें।"],
      "On balancing the atoms on both sides: 3 Fe atoms combine with 4 water molecules to yield 1 Fe3O4 molecule and 4 molecules of hydrogen gas (3Fe + 4H2O -> Fe3O4 + 4H2).",
      "दोनों ओर के परमाणुओं को संतुलित करने पर: 3 Fe परमाणु 4 जल के अणुओं के साथ मिलकर 1 Fe3O4 अणु और हाइड्रोजन गैस के 4 अणु बनाते हैं (3Fe + 4H2O -> Fe3O4 + 4H2)।",
      "medium", 1520
    ],

    ["10-sc-cr-16", ["law-of-conservation", "theory", "balancing"],
      "What fundamental law forms the basis for balancing every chemical equation?",
      "कौन सा मूलभूत नियम प्रत्येक रासायनिक समीकरण को संतुलित करने का आधार बनता है?",
      ["Law of Constant Proportions", "Law of Conservation of Mass", "Law of Multiple Proportions", "Avogadro's Law"],
      ["स्थिर अनुपात का नियम", "द्रव्यमान संरक्षण का नियम", "गुणित अनुपात का नियम", "एवोगाड्रो का नियम"],
      1,
      ["This law states that matter can neither be created nor destroyed in a chemical reaction.", "यह नियम बताता है कि किसी रासायनिक अभिक्रिया में पदार्थ का न तो निर्माण किया जा सकता है और न ही विनाश।"],
      "The Law of Conservation of Mass states that the total mass of reactants must equal the total mass of products, requiring the number of atoms of each element to remain equal on both sides.",
      "द्रव्यमान संरक्षण के नियम के अनुसार अभिकारकों का कुल द्रव्यमान उत्पादों के कुल द्रव्यमान के बराबर होना चाहिए, जिसके लिए दोनों पक्षों में प्रत्येक तत्व के परमाणुओं की संख्या समान होना आवश्यक है।",
      "easy", 1405
    ],

    ["10-sc-cr-17", ["exothermic", "respiration", "biology-link"],
      "Why is the process of respiration considered an exothermic reaction?",
      "श्वसन की प्रक्रिया को एक ऊष्माक्षेपी अभिक्रिया क्यों माना जाता है?",
      ["It requires energy input to break down glucose", "Glucose combines with oxygen in cells to release energy", "It absorbs heat from the surroundings", "It produces oxygen inside the lungs"],
      ["ग्लूकोज को तोड़ने के लिए ऊर्जा की आवश्यकता होती है", "कोशिकाओं में ग्लूकोज ऑक्सीजन के साथ मिलकर ऊर्जा मुक्त करता है", "यह परिवेश से ऊष्मा अवशोषित करता है", "यह फेफड़ों के अंदर ऑक्सीजन का निर्माण करता है"],
      1,
      ["Think about what happens to food during cellular digestion and energy production.", "कोशिकीय पाचन और ऊर्जा उत्पादन के दौरान भोजन का क्या होता है, इस बारे में सोचें।"],
      "During respiration, glucose derived from food undergoes oxidation inside tissue cells, producing carbon dioxide, water, and releasing significant energy (ATP/heat).",
      "श्वसन के दौरान, भोजन से प्राप्त ग्लूकोज ऊतक कोशिकाओं के भीतर ऑक्सीकरण से गुजरता है, जिससे कार्बन डाइऑक्साइड, जल बनता है और महत्वपूर्ण ऊर्जा (ATP/ऊष्मा) मुक्त होती है।",
      "medium", 1465
    ],

    ["10-sc-cr-18", ["decomposition", "compost", "exothermic"],
      "The decomposition of vegetable matter into compost is an example of which type of reaction?",
      "शाक-सब्जियों का विघटित होकर कंपोस्ट बनना किस प्रकार की अभिक्रिया का उदाहरण है?",
      ["Endothermic reaction", "Exothermic reaction", "Displacement reaction", "Combination reaction"],
      ["ऊष्माशोषी अभिक्रिया", "ऊष्माक्षेपी अभिक्रिया", "विस्थापन अभिक्रिया", "संयोजन अभिक्रिया"],
      1,
      ["Microbial degradation of organic bonds typically generates warmth or heat.", "कार्बनिक बंधों के सूक्ष्मजीवी क्षरण से आमतौर पर गर्मी या ऊष्मा उत्पन्न होती है।"],
      "The breakdown of organic debris by microbes releases energy in the form of heat, making composting an exothermic process.",
      "सूक्ष्मजीवों द्वारा कार्बनिक कचरे के टूटने से ऊष्मा के रूप में ऊर्जा मुक्त होती है, जिससे कंपोस्ट बनना एक ऊष्माक्षेपी प्रक्रिया बन जाती है।",
      "easy", 1425
    ],

    ["10-sc-cr-19", ["rancidity", "food-preservation", "nitrogen"],
      "Why are potato chip packets flushed with an inert gas like nitrogen?",
      "आलू के चिप्स के पैकेटों में नाइट्रोजन जैसी अक्रिय गैस क्यों भरी जाती है?",
      ["To prevent the chips from breaking during transport", "To prevent the oxidation of fats and oils in chips", "To enhance the taste and flavor of chips", "To keep the inside environment cool"],
      ["परिवहन के दौरान चिप्स को टूटने से बचाने के लिए", "चिप्स में वसा और तेलों के ऑक्सीकरण को रोकने के लिए", "चिप्स के स्वाद और सुगंध को बढ़ाने के लिए", "अंदर के वातावरण को ठंडा रखने के लिए"],
      1,
      ["Fats and oils turn foul-smelling when they react with atmospheric oxygen.", "वसा और तेल वायुमंडलीय ऑक्सीजन के साथ अभिक्रिया करने पर दुर्गंधयुक्त हो जाते हैं।"],
      "Flushing with Nitrogen prevents oxygen exposure, stopping the fats/oils from undergoing oxidation, which causes rancidity (unpleasant smell and bad taste).",
      "नाइट्रोजन भरने से ऑक्सीजन का संपर्क रुक जाता है, जिससे वसा/तेलों का ऑक्सीकरण नहीं हो पाता। ऑक्सीकरण के कारण ही विकृतगंधिता (अप्रिय गंध और खराब स्वाद) होती है।",
      "easy", 1415
    ],

    ["10-sc-cr-20", ["corrosion", "copper", "color-change"],
      "When copper vessels are exposed to moist air for a long time, they acquire a dull green coating. What is the chemical composition of this green coating?",
      "जब तांबे के बर्तनों को लंबे समय तक नम हवा के संपर्क में रखा जाता है, तो उन पर एक हल्की हरी परत जमा हो जाती है। इस हरी परत का रासायनिक संघटन क्या है?",
      ["Copper oxide (CuO)", "Basic copper carbonate [CuCO3.Cu(OH)2]", "Copper sulfate (CuSO4)", "Copper sulfide (CuS)"],
      ["कॉपर ऑक्साइड (CuO)", "बेसिक कॉपर कार्बोनेट [CuCO3.Cu(OH)2]", "कॉपर सल्फेट (CuSO4)", "कॉपर सल्फाइड (CuS)"],
      1,
      ["This compound forms due to a reaction with moist carbon dioxide and oxygen in the air.", "यह यौगिक हवा में मौजूद नम कार्बन डाइऑक्साइड और ऑक्सीजन के साथ अभिक्रिया के कारण बनता है।"],
      "Copper corrodes in moist air by reacting with carbon dioxide and water to form a green coating of basic copper carbonate, which is a mixture of copper carbonate and copper hydroxide.",
      "तांबा नम हवा में कार्बन डाइऑक्साइड और पानी के साथ अभिक्रिया करके बेसिक कॉपर कार्बोनेट की एक हरी परत बनाता है, जो कॉपर कार्बोनेट और कॉपर हाइड्रोक्साइड का मिश्रण है।",
      "hard", 1590
    ],

    ["10-sc-cr-21", ["silver-tarnishing", "corrosion", "compounds"],
      "Silver articles become black after some time when exposed to air. This black layer is formed due to reaction with which atmospheric gas substance?",
      "चांदी की वस्तुएं हवा के संपर्क में आने के कुछ समय बाद काली पड़ जाती हैं। यह काली परत वायुमंडल के किस गैसीय पदार्थ के साथ अभिक्रिया के कारण बनती है?",
      ["Oxygen", "Hydrogen sulfide (H2S)", "Carbon dioxide", "Nitrogen"],
      ["ऑक्सीजन", "हाइड्रोजन सल्फाइड (H2S)", "कार्बन डाइऑक्साइड", "नाइट्रोजन"],
      1,
      ["The black layer is composed of silver sulfide.", "काली परत सिल्वर सल्फाइड से बनी होती है।"],
      "Silver reacts with traces of hydrogen sulfide (H2S) gas present in the air to form a black coating of silver sulfide (Ag2S).",
      "चांदी हवा में मौजूद हाइड्रोजन सल्फाइड (H2S) गैस की सूक्ष्म मात्रा के साथ अभिक्रिया करके सिल्वर सल्फाइड (Ag2S) की एक काली परत बनाती है।",
      "medium", 1515
    ],

    ["10-sc-cr-22", ["copper-oxidation", "combustion", "observation"],
      "When a small amount of brown copper powder is heated in a china dish, its surface becomes coated with a black substance. What is this black substance?",
      "जब एक चाइना डिश में थोड़ी मात्रा में भूरे रंग के कॉपर पाउडर को गर्म किया जाता है, तो इसकी सतह पर एक काले पदार्थ की परत चढ़ जाती है। यह काला पदार्थ क्या है?",
      ["Copper carbonate", "Copper oxide (CuO)", "Copper sulfide", "Cupric chloride"],
      ["कॉपर कार्बोनेट", "कॉपर ऑक्साइड (CuO)", "कॉपर सल्फाइड", "क्यूप्रिक क्लोराइड"],
      1,
      ["The reaction is a direct combination of copper with oxygen at high temperatures.", "यह अभिक्रिया उच्च तापमान पर कॉपर के ऑक्सीजन के साथ सीधे संयोजन की है।"],
      "Heating copper powder in air causes it to combine with oxygen to form copper(II) oxide (CuO), which is black in color.",
      "कॉपर पाउडर को हवा में गर्म करने से यह ऑक्सीजन के साथ जुड़कर कॉपर(II) ऑक्साइड (CuO) बनाता है, जो काले रंग का होता है।",
      "easy", 1435
    ],

    ["10-sc-cr-23", ["indicators", "reaction-signals", "gas-evolution"],
      "Which of the following observations can help determine whether a chemical reaction has taken place?",
      "निम्नलिखित में से कौन सा प्रेक्षण यह निर्धारित करने में मदद कर सकता है कि कोई रासायनिक अभिक्रिया हुई है या नहीं?",
      ["Change in state and color", "Evolution of a gas", "Change in temperature", "All of the above"],
      ["अवस्था और रंग में परिवर्तन", "गैस का निकलना", "तापमान में परिवर्तन", "उपरोक्त सभी"],
      3,
      ["Chemical reactions involve structural changes that reveal themselves in multiple physical alterations.", "रासायनिक अभिक्रियाओं में संरचनात्मक परिवर्तन शामिल होते हैं जो कई भौतिक परिवर्तनों के रूप में प्रकट होते हैं।"],
      "A chemical reaction is characterized by noticeable indicators such as change in state, color change, evolution of a gas, or a shift in temperature.",
      "एक रासायनिक अभिक्रिया को कई स्पष्ट संकेतकों द्वारा पहचाना जाता है जैसे अवस्था में परिवर्तन, रंग में परिवर्तन, गैस का निकलना या तापमान में बदलाव।",
      "easy", 1400
    ],

    ["10-sc-cr-24", ["zinc-acid", "gas-test", "observations"],
      "When zinc granules are treated with dilute sulfuric acid in a conical flask, a gas is evolved. What is the correct test and sound observed for this gas?",
      "जब एक शंक्वाकार फ्लास्क में जिंक के दानों की तनु सल्फ्यूरिक अम्ल के साथ अभिक्रिया कराई जाती है, तो एक गैस निकलती है। इस गैस के लिए सही परीक्षण और ध्वनि क्या है?",
      ["Oxygen gas - burns with a popping sound", "Hydrogen gas - burns with a popping sound", "Carbon dioxide - turns lime water milky", "Sulfur dioxide - suffocating smell"],
      ["ऑक्सीजन गैस - पॉप ध्वनि के साथ जलती है", "हाइड्रोजन गैस - पॉप ध्वनि के साथ जलती है", "कार्बन डाइऑक्साइड - चूने के पानी को दूधिया कर देती है", "सल्फर डाइऑक्साइड - दम घोटने वाली गंध"],
      1,
      ["Zinc displaces hydrogen from acids, producing a highly combustible element.", "जिंक अम्लों से हाइड्रोजन को विस्थापित करता है, जिससे एक अत्यधिक ज्वलनशील तत्व उत्पन्न होता है।"],
      "Zn + H2SO4 -> ZnSO4 + H2. Hydrogen gas is evolved, which burns with a characteristic 'pop' sound when a burning matchstick is brought near it.",
      "Zn + H2SO4 -> ZnSO4 + H2। हाइड्रोजन गैस निकलती है, जो पास में जलती हुई माचिस की तीली लाने पर एक विशिष्ट 'पॉप' ध्वनि के साथ जलती है।",
      "easy", 1420
    ],

    ["10-sc-cr-25", ["chemical-equations", "symbols", "precipitate"],
      "In a balanced chemical equation, what do the symbols (aq) and (s) written next to formulas signify?",
      "एक संतुलित रासायनिक समीकरण में, सूत्रों के आगे लिखे प्रतीक (aq) और (s) क्या दर्शाते हैं?",
      ["Acidic solution and Solvent", "Aqueous solution and Solid state", "Aqua-regia and Saturated solution", "Air-quenched and Soluble state"],
      ["अम्लीय विलयन और विलायक", "जलीय विलयन और ठोस अवस्था", "अम्लराज और संतृप्त विलयन", "वायु-शमित और घुलनशील अवस्था"],
      1,
      ["These letters identify the physical states or mediums of the reactants and products.", "ये अक्षर अभिकारकों और उत्पादों की भौतिक अवस्थाओं या माध्यमों की पहचान करते हैं।"],
      "The symbol (aq) denotes that the substance is dissolved in water as an aqueous solution, and (s) means it exists in a solid state.",
      "प्रतीक (aq) दर्शाता है कि पदार्थ जलीय विलयन के रूप में पानी में घुला हुआ है, और (s) का अर्थ है कि यह ठोस अवस्था में मौजूद है।",
      "easy", 1405
    ],

    ["10-sc-cr-26", ["displacement", "halogens", "advanced"],
      "Consider the reaction: 2KI + Cl2 -> 2KCl + I2. What type of reaction is this, and why?",
      "अभिक्रिया पर विचार करें: 2KI + Cl2 -> 2KCl + I2। यह किस प्रकार की अभिक्रिया है, और क्यों?",
      ["Combination, because two non-metals combine", "Displacement, because Chlorine is more reactive than Iodine", "Double displacement, because ions are swapped", "Decomposition, because KI breaks down"],
      ["संयोजन, क्योंकि दो अधातुएं जुड़ती हैं", "विस्थापन, क्योंकि क्लोरीन आयोडीन की तुलना में अधिक अभिक्रियाशील है", "द्विविस्थापन, क्योंकि आयनों की अदला-बदली होती है", "अपघटन, क्योंकि KI टूट जाता है"],
      1,
      ["Look closely at which element replaces another from its salt compound.", "ध्यान से देखें कि कौन सा तत्व अपने लवण यौगिक से दूसरे तत्व को प्रतिस्थापित कर रहा है।"],
      "Chlorine is more reactive than Iodine. It displaces the iodide ion from Potassium iodide to form potassium chloride and iodine gas, making it a single displacement reaction.",
      "क्लोरीन आयोडीन की तुलना में अधिक अभिक्रियाशील है। यह पोटेशियम आयोडाइड से आयोडाइड आयन को विस्थापित करके पोटेशियम क्लोराइड और आयोडीन गैस बनाता है, जिससे यह एक एकल विस्थापन अभिक्रिया बन जाती है।",
      "hard", 1565
    ],

    ["10-sc-cr-27", ["calcium-carbonate", "limestone", "slaking-cycle"],
      "A solution of substance X is used for whitewashing walls. After 2-3 days of application, it reacts with carbon dioxide in air to form a shiny layer of substance Y. Identify X and Y.",
      "दीवारों पर सफेदी करने के लिए पदार्थ X के विलयन का उपयोग किया जाता है। लगाने के 2-3 दिनों बाद, यह हवा में कार्बन डाइऑक्साइड के साथ अभिक्रिया करके पदार्थ Y की एक चमकदार परत बनाता है। X और Y की पहचान कीजिए।",
      ["X = CaO, Y = CaCO3", "X = Ca(OH)2, Y = CaCO3", "X = CaCO3, Y = Ca(OH)2", "X = Ca(OH)2, Y = CaO"],
      ["X = CaO, Y = CaCO3", "X = Ca(OH)2, Y = CaCO3", "X = CaCO3, Y = Ca(OH)2", "X = Ca(OH)2, Y = CaO"],
      1,
      ["Substance X is the alkaline solution formed after adding water to quicklime.", "पदार्थ X वह क्षारीय विलयन है जो बिना बुझे चूने में पानी मिलाने के बाद बनता है।"],
      "Slaked lime [Ca(OH)2] is used for whitewashing. It reacts slowly with CO2 in the air to form a thin, shiny layer of Calcium Carbonate (CaCO3) on the walls.",
      "सफेदी के लिए बुझे हुए चूने [Ca(OH)2] का उपयोग किया जाता है। यह हवा में मौजूद CO2 के साथ धीरे-धीरे अभिक्रिया करके दीवारों पर कैल्शियम कार्बोनेट (CaCO3) की एक पतली, चमकदार परत बनाता है।",
      "medium", 1510
    ],

    ["10-sc-cr-28", ["endothermic", "decomposition", "nitrates"],
      "Which of the following chemical reactions represents an endothermic process?",
      "निम्नलिखित में से कौन सी रासायनिक अभिक्रिया एक ऊष्माशोषी प्रक्रिया को दर्शाती है?",
      ["Burning of natural gas", "Decomposition of calcium carbonate by heat", "Reaction of sodium with water", "Dilution of concentrated sulfuric acid"],
      ["प्राकृतिक गैस का जलना", "ऊष्मा द्वारा कैल्शियम कार्बोनेट का अपघटन", "सोडियम की जल के साथ अभिक्रिया", "सांद्र सल्फ्यूरिक अम्ल का तनुकरण"],
      1,
      ["Endothermic reactions require or absorb heat energy from the surroundings to break bonds.", "ऊष्माशोषी अभिक्रियाओं को बंधों को तोड़ने के लिए परिवेश से ऊष्मा ऊर्जा की आवश्यकता होती है या वे इसे अवशोषित करती हैं।"],
      "Thermal decomposition of calcium carbonate into calcium oxide and carbon dioxide requires continuous external heating, making it an endothermic reaction.",
      "कैल्शियम कार्बोनेट का कैल्शियम ऑक्साइड और कार्बन डाइऑक्साइड में ऊष्मीय अपघटन के लिए निरंतर बाहरी ऊष्मा की आवश्यकता होती है, जिससे यह एक ऊष्माशोषी अभिक्रिया बन जाती है।",
      "easy", 1440
    ],

    ["10-sc-cr-29", ["catalysts", "photosynthesis", "equation-conditions"],
      "In the chemical equation for plant photosynthesis, what essential factors are specifically written above and below the reaction arrow?",
      "पौधों में प्रकाश संश्लेषण के रासायनिक समीकरण में, अभिक्रिया के तीर के ऊपर और नीचे विशेष रूप से कौन से आवश्यक कारक लिखे जाते हैं?",
      ["Heat and Oxygen concentration", "Sunlight and Chlorophyll", "Water volume and Carbon dioxide level", "Glucose and Enzymes"],
      ["ऊष्मा और ऑक्सीजन की सांद्रता", "सूर्य का प्रकाश और क्लोरोफिल", "जल का आयतन और कार्बन डाइऑक्साइड का स्तर", "ग्लूकोज और एंजाइम"],
      1,
      ["These represent the non-chemical environment and pigment catalysts required for the pathway.", "ये इस मार्ग के लिए आवश्यक गैर-रासायनिक पर्यावरण और वर्णक उत्प्रेरकों का प्रतिनिधित्व करते हैं।"],
      "Photosynthesis requires light energy from the sun absorbed by the plant pigment chlorophyll. These reaction parameters are written above/below the arrow to denote precise reaction conditions.",
      "प्रकाश संश्लेषण के लिए पौधों के वर्णक क्लोरोफिल द्वारा अवशोषित सूर्य की प्रकाश ऊर्जा की आवश्यकता होती है। सटीक अभिक्रिया स्थितियों को दर्शाने के लिए इन मापदंडों को तीर के ऊपर/नीचे लिखा जाता है।",
      "easy", 1410
    ],

    ["10-sc-cr-30", ["redox", "advanced-mechanisms", "definition"],
      "Which of the following options defines 'reduction' in a comprehensive chemical context?",
      "निम्नलिखित में से कौन सा विकल्प व्यापक रासायनिक संदर्भ में 'अपचयन' को परिभाषित करता है?",
      ["Gain of oxygen or loss of hydrogen", "Loss of oxygen or gain of hydrogen", "Gain of oxygen and gain of electrons", "Loss of hydrogen and loss of electrons"],
      ["ऑक्सीजन की वृद्धि या हाइड्रोजन का ह्रास", "ऑक्सीजन का ह्रास या हाइड्रोजन की वृद्धि", "ऑक्सीजन की वृद्धि और इलेक्ट्रॉनों की वृद्धि", "हाइड्रोजन का ह्रास और इलेक्ट्रॉनों का ह्रास"],
      1,
      ["Reduction is the complete inverse chemical pathway of oxidation.", "अपचयन, ऑक्सीकरण का पूर्णतः विपरीत रासायनिक मार्ग है।"],
      "Reduction is explicitly defined as either the loss of oxygen atoms, the gain of hydrogen atoms, or the gain of electrons by a chemical substance during a reaction.",
      "अपचयन को स्पष्ट रूप से किसी अभिक्रिया के दौरान रासायनिक पदार्थ द्वारा ऑक्सीजन परमाणुओं के ह्रास, हाइड्रोजन परमाणुओं की वृद्धि, या इलेक्ट्रॉनों की वृद्धि के रूप में परिभाषित किया जाता है।",
      "medium", 1460
    ]
  ])
},

  {
  chapterNumber: 2,
  topicId: "science-acids-bases-salts",
  chapterTitle: "Acids, Bases and Salts",
  chapterTitleHindi: "अम्ल, क्षारक एवं लवण",
  questions: makeQuestionSet("science-acids-bases-salts", [

    ["10-sc-abs-01", ["indicators", "olfactory", "basics"],
      "Which of the following substances can be used as an olfactory indicator to detect the presence of an acid or a base?",
      "अम्ल या क्षारक की उपस्थिति का पता लगाने के लिए निम्नलिखित में से किस पदार्थ का उपयोग घ्राण (ओल्फ़ैक्ट्री) सूचक के रूप में किया जा सकता है?",
      ["Litmus", "Turmeric", "Vanilla essence", "Petunia leaves"],
      ["लिटमस", "हल्दी", "वैनिला एसेंस", "पेटुनिया की पत्तियाँ"],
      2,
      ["Olfactory indicators change their odor/smell depending on whether they are in an acidic or basic medium.", "घ्राण सूचक अम्लीय या क्षारीय माध्यम में होने के आधार पर अपनी गंध बदल लेते हैं।"],
      "Vanilla essence, onion, and clove oil change their unique smell in basic solutions but retain it in acidic solutions, making them olfactory indicators.",
      "वैनिला एसेंस, प्याज और लौंग का तेल क्षारीय विलयन में अपनी अनूठी गंध बदल लेते हैं लेकिन अम्लीय विलयन में इसे बनाए रखते हैं, जिससे वे घ्राण सूचक बन जाते हैं।",
      "easy", 1420
    ],

    ["10-sc-abs-02", ["metal-reactions", "sodium-zincate", "advanced"],
      "Granulated zinc reacts with hot sodium hydroxide solution to evolve hydrogen gas along with the formation of a specific salt. Name the salt formed.",
      "दानेदार जिंक गर्म सोडियम हाइड्रोक्साइड विलयन के साथ अभिक्रिया करके हाइड्रोजन गैस मुक्त करता है और साथ ही एक विशिष्ट लवण का निर्माण करता है। बनने वाले लवण का नाम बताइए।",
      ["Zinc hydroxide", "Sodium zincate", "Sodium zinc oxide", "Zincate chloride"],
      ["जिंक हाइड्रोक्साइड", "सोडियम जिंकेट", "सोडियम जिंक ऑक्साइड", "जिंकेट क्लोराइड"],
      1,
      ["The formula of this unique salt is Na2ZnO2.", "इस अनूठे लवण का सूत्र Na2ZnO2 है।"],
      "Zinc reacts with a strong base like NaOH to form Sodium Zincate (Na2ZnO2) and Hydrogen gas. This demonstrates that certain metals can react with bases as well.",
      "जिंक NaOH जैसे प्रबल क्षारक के साथ अभिक्रिया करके सोडियम जिंकेट (Na2ZnO2) और हाइड्रोजन गैस बनाता है। यह प्रदर्शित करता है कि कुछ धातुएं क्षारकों के साथ भी अभिक्रिया कर सकती हैं।",
      "hard", 1550
    ],

    ["10-sc-abs-03", ["metal-carbonates", "gas-evolution", "observations"],
      "When dilute Hydrochloric acid is added to Sodium Hydrogen Carbonate in a test tube, a colorless gas is evolved with brisk effervescence. What is the nature of this gas?",
      "जब एक परखनली में सोडियम हाइड्रोजन कार्बोनेट में तनु हाइड्रोक्लोरिक अम्ल मिलाया जाता है, तो तीव्र बुदबुदाहट के साथ एक रंगहीन गैस निकलती है। इस गैस की प्रकृति क्या है?",
      ["It supports combustion", "It turns lime water milky", "It burns with a pop sound", "It has a pungent suffocating smell"],
      ["यह दहन का समर्थन करती है", "यह चूने के पानी को दूधिया कर देती है", "यह पॉप ध्वनि के साथ जलती है", "इसमें एक तीखी दम घोटने वाली गंध होती है"],
      1,
      ["The evolved gas is carbon dioxide, which is produced when metal hydrogen carbonates react with acids.", "निकलने वाली गैस कार्बन डाइऑक्साइड है, जो तब उत्पन्न होती है जब धातु हाइड्रोजन कार्बोनेट अम्लों के साथ अभिक्रिया करते।"],
      "Acids react with metal carbonates and hydrogen carbonates to produce carbon dioxide gas (CO2), water, and a salt. CO2 turns lime water milky due to the formation of insoluble calcium carbonate.",
      "अम्ल धातु कार्बोनेट और हाइड्रोजन कार्बोनेट के साथ अभिक्रिया करके कार्बन डाइऑक्साइड गैस (CO2), जल और लवण बनाते हैं। CO2 अघुलनशील कैल्शियम कार्बोनेट के बनने के कारण चूने के पानी को दूधिया कर देती है।",
      "easy", 1430
    ],

    ["10-sc-abs-04", ["lime-water", "excess-gas", "chemical-equations"],
      "When carbon dioxide gas is passed through lime water for a prolonged duration, the initial milkiness disappears. This disappearance is due to the formation of which compound?",
      "जब कार्बन डाइऑक्साइड गैस को लंबे समय तक चूने के पानी से गुजारा जाता है, तो शुरुआती दूधियापन गायब हो जाता है। यह गायब होना किस यौगिक के बनने के कारण होता है?",
      ["Calcium Carbonate", "Calcium Hydroxide", "Calcium Hydrogen Carbonate", "Calcium Oxide"],
      ["कैल्शियम कार्बोनेट", "कैल्शियम हाइड्रोक्साइड", "कैल्शियम हाइड्रोजन कार्बोनेट", "कैल्शियम ऑक्साइड"],
      2,
      ["The milkiness disappears because the new compound formed is completely soluble in water.", "दूधियापन इसलिए गायब हो जाता है क्योंकि बनने वाला नया यौगिक पानी में पूरी तरह से घुलनशील होता है।"],
      "Passing excess CO2 converts the insoluble calcium carbonate (CaCO3) into water-soluble Calcium Hydrogen Carbonate [Ca(HCO3)2], making the solution clear again.",
      "अत्यधिक CO2 प्रवाहित करने पर अघुलनशील कैल्शियम कार्बोनेट (CaCO3) पानी में घुलनशील कैल्शियम हाइड्रोजन कार्बोनेट [Ca(HCO3)2] में बदल जाता है, जिससे विलयन फिर से साफ हो जाता है।",
      "hard", 1610
    ],

    ["10-sc-abs-05", ["metal-oxides", "neutralization", "color-change"],
      "On adding dilute Hydrochloric acid to a small amount of black Copper Oxide powder, the solution turns blue-green. What is the cause of this color change?",
      "काले रंग के कॉपर ऑक्साइड पाउडर की थोड़ी मात्रा में तनु हाइड्रोक्लोरिक अम्ल मिलाने पर विलयन का रंग नीला-हरा हो जाता है। इस रंग परिवर्तन का कारण क्या है?",
      ["Formation of Copper hydroxide", "Formation of Copper(II) chloride", "Oxidation of copper metal", "Reduction of copper oxide to copper"],
      ["कॉपर हाइड्रोक्साइड का बनना", "कॉपर(II) क्लोराइड का बनना", "कॉपर धातु का ऑक्सीकरण", "कॉपर ऑक्साइड का कॉपर में अपचयन"],
      1,
      ["The metal oxide reacts with acid to form a soluble salt whose transition metal ions impart a blue-green color.", "धातु ऑक्साइड अम्ल के साथ अभिक्रिया करके एक घुलनशील लवण बनाता है जिसके संक्रमण धातु आयन नीला-हरा रंग प्रदान करते हैं।"],
      "Copper oxide (CuO) reacts with HCl to form Copper(II) chloride (CuCl2) and water. The formation of CuCl2 gives the solution its characteristic blue-green color, proving metal oxides are basic.",
      "कॉपर ऑक्साइड (CuO) HCl के साथ अभिक्रिया करके कॉपर(II) क्लोराइड (CuCl2) और जल बनाता है। CuCl2 का निर्माण विलयन को उसका विशिष्ट नीला-हरा रंग देता है, जो यह सिद्ध करता है कि धातु ऑक्साइड क्षारीय होते हैं।",
      "medium", 1520
    ],

    ["10-sc-abs-06", ["non-metal-oxides", "nature", "theory"],
      "Non-metallic oxides react with bases to produce salt and water. What structural property does this reaction prove about non-metallic oxides?",
      "अधात्विक ऑक्साइड क्षारकों के साथ अभिक्रिया करके लवण और जल बनाते हैं। यह अभिक्रिया अधात्विक ऑक्साइडों के बारे में किस संरचनात्मक विशेषता को सिद्ध करती है?",
      ["They are basic in nature", "They are amphoteric in nature", "They are acidic in nature", "They are neutral in nature"],
      ["वे प्रकृति में क्षारीय होते हैं", "वे प्रकृति में उभयधर्मी होते हैं", "वे प्रकृति में अम्लीय होते हैं", "वे प्रकृति में उदासीन होते हैं"],
      2,
      ["Think about the typical reaction that yields salt and water from a base.", "उस विशिष्ट अभिक्रिया के बारे में सोचें जो क्षारक से लवण और जल उत्पन्न करती है।"],
      "The reaction between a non-metallic oxide and a base is identical to a neutralization reaction (Acid + Base -> Salt + Water). Therefore, non-metallic oxides are acidic in nature.",
      "अधात्विक ऑक्साइड और क्षारक के बीच की अभिक्रिया उदासीनीकरण अभिक्रिया (अम्ल + क्षारक -> लवण + जल) के समान होती है। इसलिए, अधात्विक ऑक्साइड प्रकृति में अम्लीय होते हैं।",
      "medium", 1480
    ],

    ["10-sc-abs-07", ["conductivity", "ions", "advanced"],
      "Aqueous solutions of glucose and alcohol do not conduct electricity, whereas solutions of hydrochloric acid and nitric acid show strong conductivity. Why?",
      "ग्लूकोज और अल्कोहल के जलीय विलयन विद्युत का चालन नहीं करते हैं, जबकि हाइड्रोक्लोरिक अम्ल और नाइट्रिक अम्ल के विलयन मजबूत चालकता प्रदर्शित करते हैं। क्यों?",
      ["Glucose and alcohol contain more hydrogen atoms", "Glucose and alcohol do not dissociate into free ions in water", "Acids do not form hydronium ions in water", "Acids are covalent molecules that block current flow"],
      ["ग्लूकोज और अल्कोहल में अधिक हाइड्रोजन परमाणु होते हैं", "ग्लूकोज और अल्कोहल पानी में मुक्त आयनों में पृथक नहीं होते हैं", "अम्ल पानी में हाइड्रोनियम आयन नहीं बनाते हैं", "अम्ल सहसंयोजक अणु हैं जो धारा प्रवाह को रोकते हैं"],
      1,
      ["Electric current requires mobile charge carriers (ions or electrons) to flow through a solution.", "विलयन में विद्युत धारा के प्रवाह के लिए गतिशील आवेश वाहकों (आयनों या इलेक्ट्रॉनों) की आवश्यकता होती है।"],
      "Acids dissociate completely into H+ (or H3O+) ions and anions in water, allowing electrical conduction. Glucose and alcohol do not dissociate into ions, so they cannot conduct electricity.",
      "अम्ल पानी में पूरी तरह से H+ (या H3O+) आयनों और ऋणायनों में पृथक हो जाते हैं, जिससे विद्युत चालन संभव होता है। ग्लूकोज और अल्कोहल आयनों में पृथक नहीं होते हैं, इसलिए वे विद्युत का चालन नहीं कर सकते।",
      "hard", 1540
    ],

    ["10-sc-abs-08", ["dry-hcl", "moisture", "litmus"],
      "Dry Hydrogen Chloride (HCl) gas is passed over dry blue litmus paper. What color change is observed on the litmus paper?",
      "शुष्क हाइड्रोजन क्लोराइड (HCl) गैस को शुष्क नीले लिटमस पत्र पर प्रवाहित किया जाता है। लिटमस पत्र पर क्या रंग परिवर्तन दिखाई देता है?",
      ["It turns bright red", "It turns green", "It remains blue with no color change", "It becomes completely bleached and white"],
      ["यह चमकीला लाल हो जाता है", "यह हरा हो जाता है", "यह बिना किसी रंग परिवर्तन के नीला ही रहता है", "यह पूरी तरह से विरंजित और सफेद हो जाता है"],
      2,
      ["Acids exhibit their acidic behavior only when they release hydrogen ions, which requires moisture.", "अम्ल अपना अम्लीय व्यवहार केवल तभी प्रदर्शित करते हैं जब वे हाइड्रोजन आयन मुक्त करते हैं, जिसके लिए नमी की आवश्यकता होती है।"],
      "Dry HCl gas does not dissociate into H+ ions in the complete absence of water. Since no hydronium ions are generated, it shows no acidic properties and does not alter dry litmus color.",
      "पानी की पूर्ण अनुपस्थिति में शुष्क HCl गैस H+ आयनों में पृथक नहीं होती है। चूंकि कोई हाइड्रोनियम आयन उत्पन्न नहीं होते हैं, इसलिए यह कोई अम्लीय गुण नहीं दिखाता है और शुष्क लिटमस का रंग नहीं बदलता है।",
      "medium", 1490
    ],

    ["10-sc-abs-09", ["dilution", "hydronium-ions", "advanced"],
      "What happens to the concentration of hydronium ions (H3O+) per unit volume when an aqueous solution of an acid is diluted by adding water?",
      "जब पानी मिलाकर किसी अम्ल के जलीय विलयन को तनु किया जाता है, तो प्रति इकाई आयतन में हाइड्रोनियम आयनों (H3O+) की सांद्रता पर क्या प्रभाव पड़ता है?",
      ["It increases sharply", "It decreases continuously", "It remains exactly the same", "It first increases then decreases"],
      ["यह तेजी से बढ़ती है", "यह निरंतर घटती है", "यह बिल्कुल समान रहती है", "यह पहले बढ़ती है फिर घटती है"],
      1,
      ["Think about spreading the same fixed amount of ions into a larger total volume of liquid.", "आयनों की उसी निश्चित मात्रा को तरल के एक बड़े कुल आयतन में फैलाने के बारे में सोचें।"],
      "Dilution involves adding more solvent (water). Although the total amount of water increases, the total number of H3O+ ions remains constant, causing the concentration of H3O+ ions per unit volume to decrease.",
      "तनुकरण में अधिक विलायक (पानी) मिलाना शामिल है। हालांकि पानी की कुल मात्रा बढ़ती है, H3O+ आयनों की कुल संख्या स्थिर रहती है, जिससे प्रति इकाई आयतन में H3O+ आयनों की सांद्रता घट जाती है।",
      "hard", 1560
    ],

    ["10-sc-abs-10", ["ph-scale", "h-ion-concentration", "basics"],
      "How is the pH value of a solution related to its hydrogen ion (H+) concentration?",
      "किसी विलयन का pH मान उसकी हाइड्रोजन आयन (H+) सांद्रता से किस प्रकार संबंधित है?",
      ["Higher H+ concentration results in a higher pH value", "Higher H+ concentration results in a lower pH value", "pH value is independent of H+ concentration", "pH value is directly proportional to the square of H+ concentration"],
      ["अधिक H+ सांद्रता के परिणामस्वरूप उच्च pH मान होता है", "अधिक H+ सांद्रता के परिणामस्वरूप निम्न pH मान होता है", "pH मान H+ सांद्रता से स्वतंत्र होता है", "pH मान H+ सांद्रता के वर्ग के सीधे अनुपाती होता है"],
      1,
      ["The 'p' in pH stands for 'potenz' (power), and the scale works inversely from 0 to 14.", "pH में 'p' का अर्थ 'पोटेंज़' (शक्ति) है, और यह पैमाना 0 से 14 तक उल्टा काम करता है।"],
      "pH is defined as the negative logarithm of hydrogen ion concentration. Therefore, a highly acidic solution with a high concentration of H+ ions will have a low pH value (closer to 0).",
      "pH को हाइड्रोजन आयन सांद्रता के ऋणात्मक लघुगणक (negative logarithm) के रूप में परिभाषित किया जाता है। इसलिए, उच्च H+ आयन सांद्रता वाले अत्यधिक अम्लीय विलयन का pH मान कम (0 के करीब) होगा।",
      "medium", 1470
    ],

    ["10-sc-abs-11", ["tooth-decay", "daily-life-ph", "basics"],
      "Tooth decay inside the human mouth typically begins when the pH level drops below a certain threshold. Identify this critical pH threshold value.",
      "मानव मुंह के अंदर दांतों का सड़ना (दंत क्षय) आमतौर पर तब शुरू होता है जब pH स्तर एक निश्चित सीमा से नीचे गिर जाता है। इस महत्वपूर्ण pH सीमा मान की पहचान कीजिए।",
      ["pH 7.0", "pH 6.5", "pH 5.5", "pH 4.0"],
      ["pH 7.0", "pH 6.5", "pH 5.5", "pH 4.0"],
      2,
      ["At this acidic pH, calcium phosphate (tooth enamel) starts getting corroded or demineralized.", "इस अम्लीय pH पर, कैल्शियम फास्फेट (दांतों का इनेमल) संक्षारित या विखनिजीकृत होने लगता है।"],
      "Bacteria present in the mouth produce acids by degrading sugar and food particles. When the mouth's pH falls below 5.5, the acid is strong enough to corrode tooth enamel, initiating decay.",
      "मुंह में मौजूद बैक्टीरिया शर्करा और भोजन के कणों को अपघटित करके अम्ल बनाते हैं। जब मुंह का pH 5.5 से नीचे गिर जाता है, तो अम्ल दांतों के इनेमल को संक्षारित करने के लिए पर्याप्त मजबूत हो जाता है, जिससे सड़न शुरू हो जाती है।",
      "easy", 1410
    ],

    ["10-sc-abs-12", ["antacids", "digestive-system", "basics"],
      "Our stomach produces Hydrochloric acid to aid digestion. During indigestion, excess acid causes pain. Which mild base is commonly used as an antacid medicine to cure this?",
      "हमारा पेट पाचन में सहायता के लिए हाइड्रोक्लोरिक अम्ल उत्पन्न करता है। अपच के दौरान, अत्यधिक अम्ल के कारण दर्द होता है। इसे ठीक करने के लिए एंटासिड दवा के रूप में आमतौर पर किस हल्के क्षारक का उपयोग किया जाता है?",
      ["Sodium hydroxide", "Magnesium hydroxide (Milk of Magnesia)", "Potassium hydroxide", "Calcium oxide"],
      ["सोडियम हाइड्रोक्साइड", "मैग्नीशियम हाइड्रोक्साइड (मिल्क ऑफ मैग्नीशिया)", "पोटेशियम हाइड्रोक्साइड", "कैल्शियम ऑक्साइड"],
      1,
      ["The antacid must be a mild, non-corrosive base that can safely neutralize the stomach acid.", "एंटासिड एक हल्का, गैर-संक्षारक क्षारक होना चाहिए जो पेट के अम्ल को सुरक्षित रूप से उदासीन कर सके।"],
      "Magnesium hydroxide [Mg(OH)2], commonly known as Milk of Magnesia, is a mild base used as an antacid to neutralize excess gastric acid and relieve pain.",
      "मैग्नीशियम हाइड्रोक्साइड [Mg(OH)2], जिसे आमतौर पर मिल्क ऑफ मैग्नीशिया के रूप में जाना जाता है, एक हल्का क्षारक है जिसका उपयोग पेट के अतिरिक्त अम्ल को उदासीन करने और दर्द से राहत देने के लिए एंटासिड के रूप में किया जाता है।",
      "easy", 1415
    ],

    ["10-sc-abs-13", ["chemical-defense", "methanoic-acid", "basics"],
      "Nettle leaf stings or bee stings inject a fluid into the skin that causes severe burning pain and irritation. What is the chemical compound present in this fluid?",
      "नेटल के पत्तों के डंक या मधुमक्खी के डंक त्वचा में एक तरल छोड़ते हैं जिससे गंभीर जलन, दर्द और जलन होती है। इस तरल में मौजूद रासायनिक यौगिक क्या है?",
      ["Acetic acid", "Citric acid", "Methanoic acid", "Tartaric acid"],
      ["एसिटिक अम्ल", "साइट्रिक अम्ल", "मेथनोइक अम्ल", "टार्टरिक अम्ल"],
      2,
      ["This acid is also known structurally as formic acid.", "इस अम्ल को संरचनात्मक रूप से फॉर्मिक अम्ल के रूप में भी जाना जाता है।"],
      "Bee stings and stinging hair of nettle leaves inject Methanoic acid (formic acid) into the skin, which induces acute painful burning sensations.",
      "मधुमक्खी के डंक और नेटल के पत्तों के डंक मारने वाले बाल त्वचा में मेथनोइक अम्ल (फॉर्मिक अम्ल) छोड़ते हैं, जिससे तीव्र दर्दनाक जलन का अनुभव होता है।",
      "easy", 1425
    ],

    ["10-sc-abs-14", ["nature-of-salts", "parent-acid-base", "advanced"],
      "A specific salt is formed by the neutralization reaction of a Strong Acid with a Weak Base. What will be the nature and approximate pH of its aqueous solution?",
      "एक विशिष्ट लवण का निर्माण एक प्रबल अम्ल और एक दुर्बल क्षारक की उदासीनीकरण अभिक्रिया द्वारा होता है। इसके जलीय विलयन की प्रकृति और अनुमानित pH क्या होगा?",
      ["Basic, pH > 7", "Acidic, pH < 7", "Neutral, pH = 7", "Amphoteric, pH = 14"],
      ["क्षारीय, pH > 7", "अम्लीय, pH < 7", "उदासीन, pH = 7", "उभयधर्मी, pH = 14"],
      1,
      ["The strong component dominates the nature of the resulting hydrolyzed salt solution.", "प्रबल घटक परिणामी जलअपघटित लवण विलयन की प्रकृति पर हावी होता है।"],
      "Salts of a strong acid and a weak base undergo hydrolysis to yield an excess of hydronium ions, making the aqueous salt solution acidic in nature with a pH less than 7.",
      "एक प्रबल अम्ल और एक दुर्बल क्षारक के लवण जलअपघटन से गुजरकर हाइड्रोनियम आयनों की अधिकता उत्पन्न करते हैं, जिससे जलीय लवण का विलयन प्रकृति में अम्लीय हो जाता है और इसका pH 7 से कम होता है।",
      "medium", 1510
    ],

    ["10-sc-abs-15", ["chlor-alkali", "brine", "industrial"],
      "In the chlor-alkali industrial process, which chemical raw material is broken down by passing electricity, and what are its core products?",
      "क्लोरे-क्षार औद्योगिक प्रक्रिया में, विद्युत प्रवाहित करके किस रासायनिक कच्चे माल को तोड़ा जाता है, और इसके मुख्य उत्पाद क्या हैं?",
      ["Solid sodium carbonate; produces chlorine and sodium", "Aqueous sodium chloride (brine); produces NaOH, Cl2, and H2", "Molten calcium chloride; produces calcium and chlorine", "Aqueous sodium bicarbonate; produces washing soda"],
      ["ठोस सोडियम कार्बोनेट; क्लोरीन और सोडियम का उत्पादन करता है", "सोडियम क्लोराइड का जलीय विलयन (लवण-जल); NaOH, Cl2, और H2 का उत्पादन करता है", "पिघला हुआ कैल्शियम क्लोराइड; कैल्शियम और क्लोरीन का उत्पादन करता है", "सोडियम बाईकार्बोनेट का जलीय विलयन; वाशिंग सोडा का उत्पादन करता है"],
      1,
      ["The process is named 'chlor-alkali' due to the simultaneous formation of Chlorine gas and an Alkaline hydroxide.", "इस प्रक्रिया का नाम 'क्लोरे-क्षार' क्लोरीन गैस और एक क्षारीय हाइड्रोक्साइड के एक साथ बनने के कारण पड़ा है।"],
      "When electricity is passed through brine (aqueous NaCl), it decomposes to form Sodium Hydroxide (alkali) at the cathode, Chlorine gas at the anode, and Hydrogen gas at the cathode.",
      "जब लवण-जल (NaCl का जलीय विलयन) से विद्युत प्रवाहित की जाती है, तो यह अपघटित होकर कैथोड पर सोडियम हाइड्रोक्साइड (क्षार), एनोड पर क्लोरीन गैस और कैथोड पर हाइड्रोजन गैस बनाता है।",
      "medium", 1530
    ],

    ["10-sc-abs-16", ["bleaching-powder", "chemical-formulas", "basics"],
      "What is the common name and exact chemical formula of the compound generated by treating dry slaked lime with chlorine gas?",
      "शुष्क बुझे हुए चूने की क्लोरीन गैस के साथ अभिक्रिया कराने पर उत्पन्न होने वाले यौगिक का सामान्य नाम और सटीक रासायनिक सूत्र क्या है?",
      ["Baking soda, NaHCO3", "Bleaching powder, CaOCl2", "Washing soda, Na2CO3.10H2O", "Plaster of Paris, CaSO4.2H2O"],
      ["बेकिंग सोडा, NaHCO3", "विरंजक चूर्ण (ब्लीचिंग पाउडर), CaOCl2", "वाशिंग सोडा, Na2CO3.10H2O", "प्लास्टर ऑफ पेरिस, CaSO4.2H2O"],
      1,
      ["This compound is widely used for disinfecting drinking water and bleaching cotton fabrics in textile mills.", "इस यौगिक का उपयोग पीने के पानी को कीटाणुरहित करने और कपड़ा मिलों में सूती कपड़ों को विरंजित करने के लिए व्यापक रूप से किया जाता है।"],
      "Bleaching powder is Calcium Oxychloride (CaOCl2). It is manufactured by the chemical reaction of chlorine gas on dry slaked lime [Ca(OH)2].",
      "विरंजक चूर्ण कैल्शियम ऑक्सीक्लोराइड (CaOCl2) है। इसका निर्माण शुष्क बुझे हुए चूने [Ca(OH)2] पर क्लोरीन गैस की रासायनिक अभिक्रिया द्वारा किया जाता है।",
      "easy", 1440
    ],

    ["10-sc-abs-17", ["baking-soda", "compounds", "basics"],
      "Identify the correct chemical name and raw materials used in the industrial preparation of Baking Soda.",
      "बेकिंग सोडा के औद्योगिक निर्माण में प्रयुक्त होने वाले सही रासायनिक नाम और कच्चे माल की पहचान कीजिए।",
      ["Sodium Carbonate; NaCl, CaCO3", "Sodium Hydrogen Carbonate; NaCl, NH3, CO2, H2O", "Sodium Hydroxide; Brine and Oxygen", "Calcium Sulfate; Gypsum and Carbon"],
      ["सोडियम कार्बोनेट; NaCl, CaCO3", "सोडियम हाइड्रोजन कार्बोनेट; NaCl, NH3, CO2, H2O", "सोडियम हाइड्रोक्साइड; लवण-जल और ऑक्सीजन", "कैल्शियम सल्फेट; जिप्सम और कार्बन"],
      1,
      ["Baking soda is produced using the Solvay process, which involves brine, ammonia, and carbon dioxide gas.", "बेकिंग सोडा का उत्पादन साल्वे प्रक्रिया का उपयोग करके किया जाता है, जिसमें लवण-जल, अमोनिया और कार्बन डाइऑक्साइड गैस शामिल होती है।"],
      "Baking soda is Sodium Hydrogen Carbonate (NaHCO3). It is produced using sodium chloride (NaCl) as one of the raw materials along with water, CO2, and ammonia (NH3).",
      "बेकिंग सोडा सोडियम हाइड्रोजन कार्बोनेट (NaHCO3) है। इसका उत्पादन पानी, CO2 और अमोनिया (NH3) के साथ कच्चे माल के रूप में सोडियम क्लोराइड (NaCl) का उपयोग करके किया जाता है।",
      "easy", 1435
    ],

    ["10-sc-abs-18", ["heating-baking-soda", "cooking", "advanced"],
      "When baking soda (NaHCO3) is heated during cooking, it decomposes to form a component X along with water and carbon dioxide. Identify component X.",
      "जब खाना पकाने के दौरान बेकिंग सोडा (NaHCO3) को गर्म किया जाता है, तो यह पानी और कार्बन डाइऑक्साइड के साथ एक घटक X बनाने के लिए अपघटित होता है। घटक X की पहचान कीजिए।",
      ["Sodium hydroxide", "Sodium oxide", "Sodium carbonate", "Sodium peroxide"],
      ["सोडियम हाइड्रोक्साइड", "सोडियम ऑक्साइड", "सोडियम कार्बोनेट", "सोडियम पेरोक्साइड"],
      2,
      ["Component X is an anhydrous salt that can be recrystallized later to form washing soda.", "घटक X एक निर्जल लवण है जिसे बाद में वाशिंग सोडा बनाने के लिए पुन: क्रिस्टलीकृत किया जा सकता है।"],
      "On heating, 2 molecules of NaNaHCO3 decompose into Sodium Carbonate (Na2CO3), Carbon dioxide gas (CO2), and water vapor (H2O).",
      "गर्म करने पर, NaHCO3 के 2 अणु सोडियम कार्बोनेट (Na2CO3), कार्बन डाइऑक्साइड गैस (CO2) और जल वाष्प (H2O) में अपघटित हो जाते हैं।",
      "medium", 1500
    ],

    ["10-sc-abs-19", ["washing-soda", "formulas", "basics"],
      "What is the chemical formula of Washing Soda, and how many molecules of water of crystallization does it structurally contain?",
      "वाशिंग सोडा का रासायनिक सूत्र क्या है, और इसमें संरचनात्मक रूप से क्रिस्टलीकरण के जल के कितने अणु होते हैं?",
      ["Na2CO3 * 5H2O; 5 molecules", "Na2CO3 * 10H2O; 10 molecules", "NaHCO3 * 10H2O; 10 molecules", "Na2CO3 * H2O; 1 molecule"],
      ["Na2CO3 * 5H2O; 5 अणु", "Na2CO3 * 10H2O; 10 अणु", "NaHCO3 * 10H2O; 10 अणु", "Na2CO3 * H2O; 1 अणु"],
      1,
      ["This sodium salt requires ten water molecules attached to its crystalline framework to be classified as washing soda.", "इस सोडियम लवण को वाशिंग सोडा के रूप में वर्गीकृत करने के लिए इसके क्रिस्टलीय ढांचे से जुड़े पानी के दस अणुओं की आवश्यकता होती है।"],
      "Washing soda is Sodium Carbonate Decahydrate (Na2CO3.10H2O). Recrystallization of anhydrous sodium carbonate yields washing soda containing 10 molecules of water of crystallization.",
      "वाशिंग सोडा सोडियम कार्बोनेट डेकाहाइड्रेट (Na2CO3.10H2O) है। निर्जल सोडियम कार्बोनेट के पुनः क्रिस्टलीकरण से वाशिंग सोडा प्राप्त होता है जिसमें क्रिस्टलीकरण के जल के 10 अणु होते हैं।",
      "easy", 1420
    ],

    ["10-sc-abs-20", ["plaster-of-paris", "gypsum", "temperature-control"],
      "At what exact temperature must Gypsum be heated carefully to obtain Plaster of Paris without destroying its hemihydrate structure?",
      "इसके हेमीहाइड्रेट ढांचे को नष्ट किए बिना प्लास्टर ऑफ पेरिस प्राप्त करने के लिए जिप्सम को किस सटीक तापमान पर सावधानीपूर्वक गर्म किया जाना चाहिए?",
      ["100 K", "273 K", "373 K", "473 K"],
      ["100 K", "273 K", "373 K", "473 K"],
      2,
      ["This temperature corresponds precisely to 100 degrees Celsius.", "यह तापमान ठीक 100 डिग्री सेल्सियस के संगत है।"],
      "Heating Gypsum (CaSO4.2H2O) at 373 K (100°C) causes it to lose three-fourths of its water of crystallization, turning into Plaster of Paris (CaSO4.1/2H2O). Heating above this creates 'dead burnt plaster'.",
      "जिमसन (CaSO4.2H2O) को 373 K (100°C) पर गर्म करने से यह अपने क्रिस्टलीकरण के जल का तीन-चौथाई हिस्सा खो देता है, जिससे यह प्लास्टर ऑफ पेरिस (CaSO4.1/2H2O) में बदल जाता है। इससे अधिक गर्म करने पर 'मृत भर्जित प्लास्टर' बनता है।",
      "medium", 1455
    ],

    ["10-sc-abs-21", ["pop-setting", "gypsum", "chemical-reaction"],
      "What hard solid compound is formed when Plaster of Paris is mixed with a suitable amount of water during setting?",
      "जमाने के दौरान जब प्लास्टर ऑफ पेरिस को पानी की उचित मात्रा के साथ मिलाया जाता है तो कौन सा कठोर ठोस यौगिक बनता है?",
      ["Dead burnt plaster", "Gypsum", "Calcium hydroxide", "Calcium carbonate"],
      ["मृत भर्जित प्लास्टर", "जिप्सम", "कैल्शियम हाइड्रोक्साइड", "कैल्शियम कार्बोनेट"],
      1,
      ["This is the same mineral compound from which Plaster of Paris is originally made.", "यह वही खनिज यौगिक है जिससे मूल रूप से प्लास्टर ऑफ पेरिस बनाया जाता है।"],
      "Plaster of Paris (Calcium Sulfate Hemihydrate) absorbs water to reverse its preparation reaction, turning back into a hard crystalline solid mass of Gypsum (Calcium Sulfate Dihydrate).",
      "प्लास्टर ऑफ पेरिस (कैल्शियम सल्फेट हेमीहाइड्रेट) अपनी निर्माण अभिक्रिया को उलटने के लिए पानी को अवशोषित करता है, जिससे यह वापस जिप्सम (कैल्शियम सल्फेट डाइहाइड्रेट) के कठोर क्रिस्टलीय ठोस द्रव्यमान में बदल जाता है।",
      "easy", 1422
    ],

    ["10-sc-abs-22", ["water-of-crystallization", "copper-sulfate", "color-change"],
      "What physical observation occurs when blue crystals of copper sulfate are heated strongly in a dry test tube?",
      "जब कॉपर सल्फेट के नीले क्रिस्टल को एक सूखी परखनली में तेजी से गर्म किया जाता है तो क्या भौतिक परिवर्तन दिखाई देता है?",
      ["They turn bright green", "They turn white and water droplets form on the inner tube walls", "They melt into a yellow liquid", "They instantly turn into a black gas"],
      ["वे चमकीले हरे हो जाते हैं", "वे सफेद हो जाते हैं और परखनली की भीतरी दीवारों पर पानी की बूंदें बन जाती हैं", "वे पिघलकर पीले तरल में बदल जाते हैं", "वे तुरंत एक काली गैस में बदल जाते हैं"],
      1,
      ["The heating process drives away the chemically bound water molecules responsible for the crystal's color.", "गर्म करने की प्रक्रिया क्रिस्टल के रंग के लिए उत्तरदायी रासायनिक रूप से बंधे पानी के अणुओं को दूर भगा देती है।"],
      "Hydrated copper sulfate (CuSO4.5H2O) is blue. Heating removes its 5 molecules of water of crystallization, turning it into anhydrous copper sulfate, which is white. Droplets condense on cooler parts of the tube.",
      "जलीय कॉपर सल्फेट (CuSO4.5H2O) नीला होता है। गर्म करने से इसके क्रिस्टलीकरण के जल के 5 अणु निकल जाते हैं, जिससे यह निर्जल कॉपर सल्फेट में बदल जाता है, जो सफेद होता है। बूंदें परखनली के ठंडे हिस्सों पर संघनित हो जाती हैं।",
      "medium", 1450
    ],

    ["10-sc-abs-23", ["phenolphthalein", "indicators", "basics"],
      "What are the distinct colors exhibited by the synthetic indicator Phenolphthalein in highly acidic and highly basic solutions respectively?",
      "सिंथेटिक सूचक फेनोल्फथैलीन द्वारा क्रमशः अत्यधिक अम्लीय और अत्यधिक क्षारीय विलयनों में प्रदर्शित किए जाने वाले विशिष्ट रंग क्या हैं?",
      ["Pink in acid, Colorless in base", "Colorless in acid, Pink in base", "Red in acid, Yellow in base", "Yellow in acid, Pink in base"],
      ["अम्ल में गुलाबी, क्षारक में रंगहीन", "अम्ल में रंगहीन, क्षारक में गुलाबी", "अम्ल में लाल, क्षारक में पीला", "अम्ल में पीला, क्षारक में गुलाबी"],
      1,
      ["Phenolphthalein remains unchanged in acidic conditions but turns vibrant magenta-pink in alkaline conditions.", "फेनोल्फथैलीन अम्लीय परिस्थितियों में अपरिवर्तित रहता है लेकिन क्षारीय परिस्थितियों में चमकीला मैजेंटा-गुलाबी हो जाता है।"],
      "Phenolphthalein is a color-changing synthetic organic indicator. It remains completely colorless in acidic and neutral environments but shifts to a distinct pink color in basic mediums.",
      "फेनोल्फथैलीन रंग बदलने वाला एक कृत्रिम कार्बनिक सूचक है। यह अम्लीय और उदासीन वातावरण में पूरी तरह से रंगहीन रहता है लेकिन क्षारीय माध्यम में एक विशिष्ट गुलाबी रंग में बदल जाता है।",
      "easy", 1445
    ],

    ["10-sc-abs-24", ["methyl-orange", "indicators", "advanced"],
      "A student adds a few drops of Methyl Orange indicator to an unknown solution, and the solution instantly turns red. What does this indicate about the solution?",
      "एक छात्र एक अज्ञात विलयन में मिथाइल ऑरेंज सूचक की कुछ बूंदें मिलाता है, और विलयन तुरंत लाल हो जाता है। यह विलयन के बारे में क्या दर्शाता है?",
      ["The solution is strongly basic", "The solution is neutral", "The solution is acidic", "The solution contains water of crystallization"],
      ["विलयन प्रबल क्षारीय है", "विलयन उदासीन है", "विलयन अम्लीय है", "विलयन में क्रिस्टलीकरण का जल है"],
      2,
      ["Methyl orange turns red-pink in low pH ranges and yellow in higher pH ranges.", "मिथाइल ऑरेंज कम pH श्रेणियों में लाल-गुलाबी और उच्च pH श्रेणियों में पीला हो जाता है।"],
      "Methyl orange is an indicator that exhibits a red color in acidic solutions (pH < 3.1) and a yellow color in basic or neutral solutions.",
      "मिथाइल ऑरेंज एक सूचक है जो अम्लीय विलयनों (pH < 3.1) में लाल रंग और क्षारीय या उदासीन विलयनों में पीला रंग प्रदर्शित करता है।",
      "medium", 1475
    ],

    ["10-sc-abs-25", ["alkali", "definitions", "basics"],
      "How is an 'Alkali' scientifically distinguished from other common bases?",
      "एक 'क्षार' (Alkali) को वैज्ञानिक रूप से अन्य सामान्य क्षारकों (Bases) से किस प्रकार अलग किया जाता है?",
      ["Alkalis are bases that do not contain hydroxide ions", "Alkalis are bases that are completely soluble in water", "Alkalis are weak bases that cannot neutralize acids", "Alkalis are liquid bases only"],
      ["क्षार वे क्षारक हैं जिनमें हाइड्रोक्साइड आयन नहीं होते हैं", "क्षार वे क्षारक हैं जो पानी में पूरी तरह से घुलनशील होते हैं", "क्षार दुर्बल क्षारक हैं जो अम्लों को उदासीन नहीं कर सकते", "क्षार केवल तरल क्षारक होते हैं"],
      1,
      ["Remember the phrase: All alkalis are bases, but all bases are not alkalis.", "इस वाक्यांश को याद रखें: सभी क्षार क्षारक होते हैं, लेकिन सभी क्षारक क्षार नहीं होते।"],
      "Bases that dissolve easily in water are specifically called alkalis (e.g., NaOH, KOH). Bases that are insoluble in water (e.g., CuO, Al(OH)3) are not alkalis.",
      "पानी में आसानी से घुलने वाले क्षारकों को विशेष रूप से क्षार (Alkali) कहा जाता है (जैसे, NaOH, KOH)। पानी में अघुलनशील क्षारक (जैसे, CuO, Al(OH)3) क्षार नहीं होते हैं।",
      "easy", 1430
    ],

    ["10-sc-abs-26", ["acid-rain", "environment", "basics"],
      "Rainwater is normally slightly acidic. However, when its pH value drops below a specific level, it is classified as 'Acid Rain'. What is this pH threshold?",
      "वर्षा का जल सामान्यतः थोड़ा अम्लीय होता है। हालाँकि, जब इसका pH मान एक विशिष्ट स्तर से नीचे गिर जाता है, तो इसे 'अम्ल वर्षा' के रूप में वर्गीकृत किया जाता है। यह pH सीमा क्या है?",
      ["pH 7.0", "pH 6.5", "pH 5.6", "pH 4.2"],
      ["pH 7.0", "pH 6.5", "pH 5.6", "pH 4.2"],
      2,
      ["This threshold occurs when atmospheric pollutants like SO2 and NO2 mix with cloud moisture.", "यह सीमा तब उत्पन्न होती है जब SO2 और NO2 जैसे वायुमंडलीय प्रदूषक बादलों की नमी के साथ मिल जाते हैं।"],
      "When the pH of rainwater drops below 5.6 due to dissolved pollutants forming nitric and sulfuric acids, it is officially designated as acid rain, which damages aquatic ecosystems.",
      "जब प्रदूषकों के घुलने से नाइट्रिक और सल्फ्यूरिक अम्ल बनने के कारण वर्षा के जल का pH 5.6 से नीचे गिर जाता है, तो इसे आधिकारिक तौर पर अम्ल वर्षा नाम दिया जाता है, जो जलीय पारिस्थितिकी तंत्र को नुकसान पहुंचाती है।",
      "easy", 1460
    ],

    ["10-sc-abs-27", ["exothermic-dilution", "safety", "basics"],
      "What is the correct chemical procedure for diluting concentrated sulfuric acid safely in a laboratory?",
      "प्रयोगशाला में सांद्र सल्फ्यूरिक अम्ल को सुरक्षित रूप से तनु करने की सही रासायनिक प्रक्रिया क्या है?",
      ["Add water to the acid rapidly without stirring", "Add acid to water slowly with constant stirring", "Mix equal volumes of water and acid simultaneously", "Heat the acid before pouring water into it"],
      ["बिना हिलाए तेजी से अम्ल में पानी मिलाएं", "लगातार हिलाते हुए धीरे-धीरे पानी में अम्ल मिलाएं", "पानी और अम्ल की समान मात्रा को एक साथ मिलाएं", "अम्ल में पानी डालने से पहले उसे गर्म करें"],
      1,
      ["Dilution of acid releases massive heat; we must maximize the volume of absorbing water present to prevent splashing.", "अम्ल के तनुकरण से अत्यधिक ऊष्मा मुक्त होती है; छलकने से रोकने के लिए हमें उपस्थित अवशोषक पानी के आयतन को अधिकतम करना चाहिए।"],
      "Adding water directly to concentrated acid creates localized boiling and steam eruption due to intense heat, causing dangerous splashing. Adding acid to water slowly dissipates the generated heat safely.",
      "सांद्र अम्ल में सीधे पानी मिलाने से तीव्र ऊष्मा के कारण स्थानीय स्तर पर उबाल और भाप का विस्फोट होता है, जिससे खतरनाक छलकन हो सकती है। पानी में धीरे-धीरे अम्ल मिलाने से उत्पन्न ऊष्मा सुरक्षित रूप से फैल जाती है।",
      "easy", 1412
    ],

    ["10-sc-abs-28", ["distilled-water", "conductivity", "medium"],
      "Why does pure distilled water show zero electrical conductivity, while typical rainwater easily conducts electric current?",
      "शुद्ध आसुत जल शून्य विद्युत चालकता क्यों दर्शाता है, जबकि सामान्य वर्षा का जल आसानी से विद्युत धारा का चालन करता है?",
      ["Distilled water contains dissolved minerals that block current", "Rainwater absorbs atmospheric gases like CO2 that form ions, while distilled water has no ions", "Distilled water undergoes automatic decomposition into neutral atoms", "Rainwater is pure covalent compound"],
      ["आसुत जल में घुले हुए खनिज होते हैं जो धारा को रोकते हैं", "वर्षा का जल CO2 जैसी वायुमंडलीय गैसों को अवशोषित करता है जो आयन बनाती हैं, जबकि आसुत जल में कोई आयन नहीं होते हैं", "आसुत जल स्वतः उदासीन परमाणुओं में अपघटित हो जाता है", "वर्षा का जल शुद्ध सहसंयोजक यौगिक है"],
      1,
      ["Conduction requires the presence of dissolved ionic components or electrolytes.", "चालन के लिए घुले हुए आयनिक घटकों या विद्युतअपघट्यों (electrolytes) की उपस्थिति आवश्यक है।"],
      "Distilled water is pure and free of dissolved electrolytes or ions. Rainwater dissolves atmospheric CO2, SO2, etc., forming trace amounts of carbonic and other acids that dissociate into mobile ions to conduct current.",
      "आसुत जल शुद्ध होता है और घुले हुए विद्युतअपघट्यों या आयनों से मुक्त होता है। वर्षा का जल वायुमंडलीय CO2, SO2 आदि को घोलता है, जिससे सूक्ष्म मात्रा में कार्बोनिक और अन्य अम्ल बनते हैं जो धारा का चालन करने के लिए गतिशील आयनों में पृथक हो जाते हैं।",
      "medium", 1465
    ],

    ["10-sc-abs-29", ["metal-oxides-nature", "basics", "theory"],
      "What is the general chemical nature of metallic oxides, such as Magnesium Oxide (MgO) or Sodium Oxide (Na2O)?",
      "धात्विक ऑक्साइडों, जैसे मैग्नीशियम ऑक्साइड (MgO) या सोडियम ऑक्साइड (Na2O) की सामान्य रासायनिक प्रकृति क्या होती है?",
      ["Acidic", "Basic", "Neutral", "Amphoteric only"],
      ["अम्लीय", "क्षारीय", "उदासीन", "केवल उभयधर्मी"],
      1,
      ["When dissolved in water, these metal oxides form alkaline solutions that turn red litmus blue.", "जब पानी में घोला जाता है, तो ये धातु ऑक्साइड क्षारीय विलयन बनाते हैं जो लाल लिटमस को नीला कर देते हैं।"],
      "Most metallic oxides are basic in nature because they react with acids to form salt and water, and soluble metal oxides dissolve in water to produce hydroxide ions.",
      "अधिकांश धात्विक ऑक्साइड प्रकृति में क्षारीय होते हैं क्योंकि वे अम्लों के साथ अभिक्रिया करके लवण और जल बनाते हैं, और घुलनशील धातु ऑक्साइड पानी में घुलकर हाइड्रोक्साइड आयन उत्पन्न करते हैं।",
      "easy", 1405
    ],

    ["10-sc-abs-30", ["sodium-zincate-valency", "advanced-chemistry", "compounds"],
      "What are the correct oxidation/valency proportions inside the chemical formula of Sodium Zincate?",
      "सोडियम जिंकेट के रासायनिक सूत्र के भीतर सही ऑक्सीकरण/संयोजकता अनुपात क्या हैं?",
      ["NaZnO", "Na2ZnO2", "NaZn2O", "Na(ZnO2)2"],
      ["NaZnO", "Na2ZnO2", "NaZn2O", "Na(ZnO2)2"],
      1,
      ["The zincate anion carries a net electrical charge of -2.", "जिंकेट ऋणायन पर -2 का कुल विद्युत आवेश होता है।"],
      "Sodium zincate consists of two Na+ ions coordinating with one zincate anion [ZnO2]2-. Thus, its precise stoichiometric formula balanced by charge is Na2ZnO2.",
      "सोडियम जिंकेट में दो Na+ आयन एक जिंकेट ऋणायन [ZnO2]2- के साथ जुड़े होते हैं। इस प्रकार, आवेश द्वारा संतुलित इसका सटीक रससमीकरणमितीय सूत्र Na2ZnO2 है।",
      "hard", 1580
    ]
  ])
},









  
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

  {
  chapterNumber: 4,
  topicId: "science-carbon-its-compounds",
  chapterTitle: "Carbon and its Compounds",
  chapterTitleHindi: "कार्बन एवं उसके यौगिक",
  questions: makeQuestionSet("science-carbon-its-compounds", [

    ["10-sc-cc-01", ["bonding", "covalent-bond", "basics"],
      "Why does carbon form covalent bonds rather than ionic bonds by gaining or losing four electrons?",
      "कार्बन चार इलेक्ट्रॉन प्राप्त करके या खोकर आयनिक बंध बनाने के बजाय सहसंयोजक बंध क्यों बनाता है?",
      ["It requires too much energy to remove or add four electrons due to nuclear pull", "Carbon is a noble gas element", "Carbon atoms have a very large atomic radius", "Carbon lacks protons in its nucleus"],
      ["नाभिकीय खिंचाव के कारण चार इलेक्ट्रॉनों को हटाने या जोड़ने के लिए अत्यधिक ऊर्जा की आवश्यकता होती है", "कार्बन एक उत्कृष्ट गैस तत्व है", "कार्बन परमाणुओं की परमाणु त्रिज्या बहुत बड़ी होती है", "कार्बन के नाभिक में प्रोटॉन की कमी होती है"],
      0,
      ["Consider the energy required to remove 4 electrons from a small atom or hold 10 electrons with 6 protons.", "एक छोटे परमाणु से 4 इलेक्ट्रॉनों को हटाने या 6 प्रोटॉन के साथ 10 इलेक्ट्रॉनों को धारण करने के लिए आवश्यक ऊर्जा पर विचार करें।"],
      "Gaining four electrons to form a C4- anion is difficult for 6 protons to hold 10 electrons. Losing four electrons to form a C4+ cation requires a massive amount of energy to overcome nuclear attraction. Hence, it shares electrons via covalent bonding.",
      "C4- ऋणायन बनाने के लिए चार इलेक्ट्रॉन प्राप्त करना 6 प्रोटॉन वाले नाभिक के लिए 10 इलेक्ट्रॉनों को धारण करना कठिन बनाता है। C4+ धनायन बनाने के लिए चार इलेक्ट्रॉनों को खोने के लिए नाभिकीय आकर्षण को पार करने के लिए अत्यधिक ऊर्जा की आवश्यकता होती है। इसलिए, यह सहसंयोजक बंधन के माध्यम से इलेक्ट्रॉनों की साझेदारी करता है।",
      "medium", 1460
    ],

    ["10-sc-cc-02", ["catenation", "versatile-nature", "basics"],
      "What is the unique property of carbon atoms to form long chains, branched chains, or ring structures with other carbon atoms called?",
      "कार्बन परमाणुओं द्वारा अन्य कार्बन परमाणुओं के साथ लंबी शृंखलाएं, शाखित शृंखलाएं या वलय संरचनाएं बनाने के अनूठे गुण को क्या कहा जाता है?",
      ["Isomerism", "Tetravalency", "Catenation", "Homology"],
      ["समावयवता", "चतुःसंयोजकता", "शृंखलन (कैटिनेशन)", "समजातता"],
      2,
      ["This word is derived from the Latin word for 'chain'.", "यह शब्द 'जंजीर' या 'शृंखला' के लिए लैटिन शब्द से बना है।"],
      "Catenation is the self-linking capability of carbon atoms via strong covalent carbon-carbon bonds, enabling the creation of vast, diverse, and stable molecular frameworks.",
      "शृंखलन (Catenation) मजबूत सहसंयोजक कार्बन-कार्बन बंधों के माध्यम से कार्बन परमाणुओं की स्वतः जुड़ने की क्षमता है, जो विशाल, विविध और स्थिर आणविक ढांचों के निर्माण को सक्षम बनाती है।",
      "easy", 1410
    ],

    ["10-sc-cc-03", ["tetravalency", "bonding", "basics"],
      "Carbon is tetravalent. What does the term 'tetravalency' signify regarding carbon's chemical behavior?",
      "कार्बन चतुःसंयोजक होता है। कार्बन के रासायनिक व्यवहार के संबंध में 'चतुःसंयोजकता' शब्द क्या दर्शाता है?",
      ["It can form bonds with only four specific elements", "It has four valence electrons and can bond with four other mono-valent atoms", "It forms four ionic bonds simultaneously", "It can only exist in four allotropic forms"],
      ["यह केवल चार विशिष्ट तत्वों के साथ बंध बना सकता है", "इसके पास चार संयोजकता इलेक्ट्रॉन होते हैं और यह चार अन्य एकल-संयोजक परमाणुओं के साथ बंध बना सकता है", "यह एक साथ चार आयनिक बंध बनाता है", "यह केवल चार अपरूपों में मौजूद हो सकता है"],
      1,
      ["Look at the atomic number of carbon (6) and its electronic configuration.", "कार्बन के परमाणु क्रमांक (6) और इसके इलेक्ट्रॉनिक विन्यास को देखें।"],
      "Carbon has an atomic number of 6 with an electronic configuration of 2,4. Since it contains 4 valence electrons, it is capable of sharing electrons with four other univalent or multivalent atoms, termed tetravalency.",
      "कार्बन का परमाणु क्रमांक 6 है जिसका इलेक्ट्रॉनिक विन्यास 2,4 है। चूंकि इसमें 4 संयोजकता इलेक्ट्रॉन होते हैं, इसलिए यह चार अन्य एकल-संयोजक या बहु-संयोजक परमाणुओं के साथ इलेक्ट्रॉनों की साझेदारी करने में सक्षम है, जिसे चतुःसंयोजकता कहा जाता है।",
      "easy", 1405
    ],

    ["10-sc-cc-04", ["allotropes", "graphite", "conductivity"],
      "Graphite is an allotrope of carbon that is a very good conductor of electricity, unlike most non-metals. What structural feature allows this?",
      "ग्रेफाइट कार्बन का एक ऐसा अपरूप है जो अधिकांश अधातुओं के विपरीत विद्युत का बहुत अच्छा चालक है। कौन सी संरचनात्मक विशेषता इसकी अनुमति देती है?",
      ["It has a dense three-dimensional rigid structure", "Each carbon atom is bonded to three other carbon atoms, leaving one free valence electron per atom", "It contains ionic molecules trapped between its hexagonal layers", "It has low melting and boiling points"],
      ["इसकी एक घनी त्रि-आयामी दृढ़ संरचना होती है", "प्रत्येक कार्बन परमाणु तीन अन्य कार्बन परमाणुओं से जुड़ा होता है, जिससे प्रति परमाणु एक मुक्त संयोजकता इलेक्ट्रॉन बचता है", "इसके षट्कोणीय परतों के बीच आयनिक अणु फंसे होते हैं", "इसका गलनांक और क्वथनांक कम होता है"],
      1,
      ["Electrical conductivity requires mobile charge carriers, such as delocalized electrons.", "विद्युत चालकता के लिए गतिशील आवेश वाहकों, जैसे विस्थानीकृत (delocalized) इलेक्ट्रॉनों की आवश्यकता होती है।"],
      "In graphite, each carbon atom forms covalent bonds with three adjacent carbons within a hexagonal layer. The fourth valence electron of each atom remains free or delocalized between layers, enabling electrical conduction.",
      "ग्रेफाइट में, प्रत्येक कार्बन परमाणु एक षट्कोणीय परत के भीतर तीन आसन्न कार्बन परमाणुओं के साथ सहसंयोजक बंध बनाता है। प्रत्येक परमाणु का चौथा संयोजकता इलेक्ट्रॉन परतों के बीच मुक्त या विस्थानीकृत रहता है, जिससे विद्युत चालन संभव होता है।",
      "medium", 1470
    ],

    ["10-sc-cc-05", ["allotropes", "fullerene", "basics"],
      "Identify the dark, cage-like carbon allotrope shaped like a geodesic soccer ball consisting of 60 carbon atoms clustered together.",
      "60 कार्बन परमाणुओं से बने भू-गणितीय (जिओडेसिक) फुटबॉल के आकार के पिंजरे जैसे कार्बन अपरूप की पहचान कीजिए जो एक साथ जुड़े होते हैं।",
      ["Diamond", "Graphite", "Buckminsterfullerene", "Carbon nanotube"],
      ["हीरा", "ग्रेफाइट", "बकमिनिस्टरफुलरीन", "कार्बन नैनोट्यूब"],
      2,
      ["This allotrope was named after an architect who designed geodesic domes.", "इस अपरूप का नाम एक वास्तुकार के नाम पर रखा गया था जिसने जिओडेसिक डोम डिजाइन किए थे।"],
      "Buckminsterfullerene (C60) is an allotrope of carbon forming a spherical molecule composed of alternating pentagons and hexagons, visually resembling a soccer ball.",
      "बकमिनिस्टरफुलरीन (C60) कार्बन का एक अपरूप है जो बारी-बारी से पंचकोणों और षट्कोणों से बना एक गोलाकार अणु बनाता है, जो दिखने में फुटबॉल जैसा लगता है।",
      "easy", 1420
    ],

    ["10-sc-cc-06", ["hydrocarbons", "saturated-unsaturated", "basics"],
      "What is the chemical distinction between saturated and unsaturated hydrocarbons?",
      "संतृप्त और असंतृप्त हाइड्रोकार्बन के बीच रासायनिक अंतर क्या है?",
      ["Saturated contain single bonds only, while unsaturated contain double or triple covalent bonds", "Saturated contain oxygen atoms, while unsaturated do not", "Saturated hydrocarbons are highly reactive compared to unsaturated ones", "Unsaturated hydrocarbons possess only single carbon-carbon bonds"],
      ["संतृप्त में केवल एकल बंध होते हैं, जबकि असंतृप्त में दोहरे या तिहरे सहसंयोजक बंध होते हैं", "संतृप्त में ऑक्सीजन परमाणु होते हैं, जबकि असंतृप्त में नहीं", "असंतृप्त की तुलना में संतृप्त हाइड्रोकार्बन अत्यधिक अभिक्रियाशील होते हैं", "असंतृप्त हाइड्रोकार्बन में केवल एकल कार्बन-कार्बन बंध होते हैं"],
      0,
      ["Think about Alkanes vs Alkenes/Alkynes.", "एल्केन बनाम एल्कीन/एल्काइन के बारे में सोचें।"],
      "Saturated hydrocarbons (alkanes) contain only single carbon-carbon covalent bonds and are generally less reactive. Unsaturated hydrocarbons contain at least one double (alkenes) or triple (alkynes) carbon-carbon bond.",
      "संतृप्त हाइड्रोकार्बन (एल्केन) में केवल एकल कार्बन-कार्बन सहसंयोजक बंध होते हैं और वे आम तौर पर कम अभिक्रियाशील होते हैं। असंतृप्त हाइड्रोकार्बन में कम से कम एक दोहरा (एल्कीन) या तिहरा (एल्काइन) कार्बन-कार्बन बंध होता है।",
      "easy", 1415
    ],

    ["10-sc-cc-07", ["electron-dot-structure", "ethane", "medium"],
      "How many total shared pairs of electrons (covalent bonds) are present in a single molecule of Ethane ($C_2H_6$)?",
      "एथेन ($C_2H_6$) के एक एकल अणु में इलेक्ट्रॉनों के कुल कितने साझा जोड़े (सहसंयोजक बंध) उपस्थित होते हैं?",
      ["6 covalent bonds", "7 covalent bonds", "8 covalent bonds", "9 covalent bonds"],
      ["6 सहसंयोजक बंध", "7 सहसंयोजक बंध", "8 सहसंयोजक बंध", "9 सहसंयोजक बंध"],
      1,
      ["Count all the Carbon-Hydrogen single bonds plus the single Carbon-Carbon bond.", "सभी कार्बन-हाइड्रोजन एकल बंधों के साथ-साथ एकल कार्बन-कार्बन बंध को भी गिनें।"],
      "Ethane has 6 C-H single covalent bonds and 1 C-C single covalent bond. Total covalent bonds = 6 + 1 = 7 bonds, which represents 7 shared electron pairs.",
      "एथेन में 6 C-H एकल सहसंयोजक बंध और 1 C-C एकल सहसंयोजक बंध होते हैं। कुल सहसंयोजक बंध = 6 + 1 = 7 बंध, जो 7 साझा इलेक्ट्रॉन जोड़ों का प्रतिनिधित्व करते हैं।",
      "medium", 1485
    ],

    ["10-sc-cc-08", ["general-formula", "alkenes", "basics"],
      "What is the general chemical formula representing the homologous series of Alkenes?",
      "एल्कीन की समजात श्रेणी का प्रतिनिधित्व करने वाला सामान्य रासायनिक सूत्र क्या है?",
      ["CnH2n+2", "CnH2n", "CnH2n-2", "CnH2n+1OH"],
      ["CnH2n+2", "CnH2n", "CnH2n-2", "CnH2n+1OH"],
      1,
      ["Alkenes contain one carbon-carbon double bond, which reduces the hydrogen count by two compared to alkanes.", "एल्कीन में एक कार्बन-कार्बन दोहरा बंध होता है, जो एल्केन की तुलना में हाइड्रोजन की संख्या को दो कम कर देता है।"],
      "The general formula for alkanes is $C_nH_{2n+2}$, for alkenes is $C_nH_{2n}$ (containing a double bond), and for alkynes is $C_nH_{2n-2}$ (containing a triple bond).",
      "एल्केन का सामान्य सूत्र $C_nH_{2n+2}$ है, एल्कीन का $C_nH_{2n}$ है (जिसमें एक दोहरा बंध होता है), और एल्काइन का $C_nH_{2n-2}$ है (जिसमें एक तिहरा बंध होता है)।",
      "easy", 1425
    ],

    ["10-sc-cc-09", ["isomerism", "butane", "medium"],
      "Structural isomers are compounds with the same molecular formula but different structural arrangements. How many structural isomers are possible for Butane ($C_4H_{10}$)?",
      "संरचनात्मक समावयवी वे यौगिक हैं जिनका आणविक सूत्र समान होता है लेकिन संरचनात्मक व्यवस्था भिन्न होती है। ब्यूटेन ($C_4H_{10}$) के लिए कितने संरचनात्मक समावयवी संभव हैं?",
      ["2 isomers", "3 isomers", "4 isomers", "5 isomers"],
      ["2 समावयवी", "3 समावयवी", "4 समावयवी", "5 समावयवी"],
      0,
      ["Butane can form a simple straight chain or a single branched chain structure.", "ब्यूटेन एक सरल सीधी शृंखला या एक एकल शाखित शृंखला संरचना बना सकता है।"],
      "Butane ($C_4H_{10}$) has exactly two structural isomers: n-butane (straight chain) and isobutane / 2-methylpropane (branched chain).",
      "ब्यूटेन ($C_4H_{10}$) के ठीक दो संरचनात्मक समावयवी होते हैं: n-ब्यूटेन (सीधी शृंखला) और आइसोब्यूटेन / 2-मेथिलप्रोपेन (शाखित शृंखला)।",
      "medium", 1510
    ],

    ["10-sc-cc-10", ["benzene", "cyclic-hydrocarbons", "medium"],
      "Benzene is a cyclic unsaturated hydrocarbon. What is its molecular formula and the total number of single and double bonds inside its ring structure?",
      "बेंजीन एक चक्रीय असंतृप्त हाइड्रोकार्बन है। इसका आणविक सूत्र और इसकी वलय संरचना के भीतर एकल और दोहरे बंधों की कुल संख्या क्या है?",
      ["C6H12; 6 single bonds and 3 double bonds", "C6H6; 9 single bonds and 3 double bonds", "C6H6; 6 single bonds and 6 double bonds", "C6H12; 9 single bonds and 6 double bonds"],
      ["C6H12; 6 एकल बंध और 3 दोहरे बंध", "C6H6; 9 एकल बंध और 3 दोहरे बंध", "C6H6; 6 एकल बंध और 6 दोहरे बंध", "C6H12; 9 एकल बंध और 6 दोहरे बंध"],
      1,
      ["Count the C-H single bonds as well as the alternating C-C bonds in the hexagonal ring.", "षट्कोणीय वलय में C-H एकल बंधों के साथ-साथ एकांतर (alternating) C-C बंधों को भी गिनें।"],
      "Benzene ($C_6H_6$) contains a ring of 6 carbon atoms with alternating single and double bonds. It has 6 C-C bonds (3 single, 3 double) and 6 C-H single bonds, giving 9 total single bonds and 3 double bonds.",
      "बेंजीन ($C_6H_6$) में एकांतर एकल और दोहरे बंधों वाले 6 कार्बन परमाणुओं का एक वलय होता है। इसमें 6 C-C बंध (3 एकल, 3 दोहरे) और 6 C-H एकल बंध होते हैं, जिससे कुल 9 एकल बंध और 3 दोहरे बंध प्राप्त होते हैं।",
      "medium", 1525
    ],

    ["10-sc-cc-11", ["functional-groups", "alcohol", "basics"],
      "What organic functional group is characterized by the presence of an -OH group attached to a carbon chain, and what suffix is used in its IUPAC naming?",
      "कौन सा कार्बनिक क्रियात्मक समूह कार्बन शृंखला से जुड़े -OH समूह की उपस्थिति द्वारा पहचाना जाता है, और इसके IUPAC नामकरण में किस अनुलग्न (suffix) का उपयोग किया जाता है?",
      ["Aldehyde, -al", "Ketone, -one", "Alcohol, -ol", "Carboxylic acid, -oic acid"],
      ["एल्डिहाइड, -al", "कीटोन, -one", "एल्कोहॉल, -ol", "कार्बोक्सिलिक अम्ल, -oic acid"],
      2,
      ["Ethanol and Methanol belong to this specific chemical family.", "एथेनॉल और मेथेनॉल इसी विशिष्ट रासायनिक परिवार से संबंधित हैं।"],
      "The -OH group represents the alcohol functional group. In nomenclature, the terminal '-e' of the parent alkane is replaced by the suffix '-ol' (e.g., Ethane becomes Ethanol).",
      "-OH समूह एल्कोहॉल क्रियात्मक समूह का प्रतिनिधित्व करता है। नामकरण में, जनक एल्केन के अंतिम '-e' को अनुलग्न (suffix) '-ol' द्वारा प्रतिस्थापित किया जाता है (जैसे, एथेन एथेनॉल बन जाता है)।",
      "easy", 1412
    ],

    ["10-sc-cc-12", ["functional-groups", "ketone-aldehyde", "advanced"],
      "How does a Ketone functional group structurally differ from an Aldehyde functional group?",
      "एक कीटोन क्रियात्मक समूह संरचनात्मक रूप से एल्डिहाइड क्रियात्मक समूह से किस प्रकार भिन्न होता है?",
      ["Aldehydes contain oxygen while ketones contain nitrogen", "In ketones, the carbonyl group carbon is bonded to two other carbon atoms, whereas in aldehydes, it is at the end of the chain bonded to at least one hydrogen", "Ketones contain single bonds only whereas aldehydes contain double bonds", "Aldehydes are cyclic compounds while ketones are straight chains"],
      ["एल्डिहाइड में ऑक्सीजन होती है जबकि कीटोन में नाइट्रोजन होती है", "कीटोन में, कार्बोनिल समूह का कार्बन दो अन्य कार्बन परमाणुओं से जुड़ा होता है, जबकि एल्डिहाइड में, यह शृंखला के अंत में कम से कम एक हाइड्रोजन से जुड़ा होता है", "कीटोन में केवल एकल बंध होते हैं जबकि एल्डिहाइड में दोहरे बंध होते हैं", "एल्डिहाइड चक्रीय यौगिक होते हैं जबकि कीटोन सीधी शृंखलाएं होते हैं"],
      1,
      ["Think about Propanone ($CH_3COCH_3$) versus Propanal ($CH_3CH_2CHO$).", "प्रोपेनोन ($CH_3COCH_3$) बनाम प्रोपेनॉल ($CH_3CH_2CHO$) के बारे में सोचें।"],
      "Both contain a carbonyl group ($C=O$). In an aldehyde ($R-CHO$), the carbonyl carbon is terminal and bonded to a hydrogen. In a ketone ($R-CO-R'$), the carbonyl carbon is internal, flanked by two carbon chains.",
      "दोनों में एक कार्बोनिल समूह ($C=O$) होता है। एल्डिहाइड ($R-CHO$) में, कार्बोनिल कार्बन अंत में होता है और एक हाइड्रोजन से जुड़ा होता है। कीटोन ($R-CO-R'$) में, कार्बोनिल कार्बन बीच में होता है, जिसके दोनों ओर दो कार्बन शृंखलाएं होती हैं।",
      "hard", 1560
    ],

    ["10-sc-cc-13", ["homologous-series", "mass-difference", "basics"],
      "Any two consecutive members of a homologous series differ in their molecular formulas and molecular masses by how much?",
      "किसी समजात श्रेणी के किन्हीं दो लगातार सदस्यों के आणविक सूत्रों और आणविक द्रव्यमानों में कितना अंतर होता है?",
      ["$-CH_2-$ group and 14 u", "$-CH_3-$ group and 15 u", "$-CH_4-$ group and 16 u", "$-CH-$ group and 13 u"],
      ["$-CH_2-$ समूह और 14 u", "$-CH_3-$ समूह और 15 u", "$-CH_4-$ समूह और 16 u", "$-CH-$ समूह और 13 u"],
      0,
      ["Calculate the molecular mass of one carbon atom (12u) combined with two hydrogen atoms (2 x 1u).", "एक कार्बन परमाणु (12u) और दो हाइड्रोजन परमाणुओं (2 x 1u) को मिलाकर आणविक द्रव्यमान की गणना करें।"],
      "Consecutive members of a homologous series (e.g., $CH_4$ and $C_2H_6$) differ systematically by a methylene unit ($-CH_2-$). The mass difference is $12 + (2 \\times 1) = 14$ unified mass units (u).",
      "समजात श्रेणी के लगातार सदस्यों (जैसे, $CH_4$ और $C_2H_6$) में व्यवस्थित रूप से एक मेथिलीन इकाई ($-CH_2-$) का अंतर होता है। द्रव्यमान का अंतर $12 + (2 \\times 1) = 14$ एकीकृत द्रव्यमान इकाइयाँ (u) होता है।",
      "easy", 1430
    ],

    ["10-sc-cc-14", ["homologous-series", "methanol", "basics"],
      "Identify the chemical formula of the next higher homologue of Methanol ($CH_3OH$).",
      "मेथेनॉल ($CH_3OH$) के अगले उच्च समजात का रासायनिक सूत्र पहचानिए।",
      ["$CH_3CH_2CH_2OH$", "$CH_3CH_2OH$", "$HCOOH$", "$CH_3CHO$"],
      ["$CH_3CH_2CH_2OH$", "$CH_3CH_2OH$", "$HCOOH$", "$CH_3CHO$"],
      1,
      ["Add a $-CH_2-$ unit to the existing molecular formula of Methanol.", "मेथेनॉल के मौजूदा आणविक सूत्र में एक $-CH_2-$ इकाई जोड़ें।"],
      "Methanol ($CH_3OH$) is the first member of the alcohol homologous series. Adding a $-CH_2-$ unit yields Ethanol ($C_2H_5OH$ or $CH_3CH_2OH$).",
      "मेथेनॉल ($CH_3OH$) एल्कोहॉल समजात श्रेणी का पहला सदस्य है। इसमें एक $-CH_2-$ इकाई जोड़ने पर एथेनॉल ($C_2H_5OH$ या $CH_3CH_2OH$) प्राप्त होता है।",
      "easy", 1422
    ],

    ["10-sc-cc-15", ["nomenclature", "iupac", "medium"],
      "What is the correct IUPAC systematic name for the carbon compound represented by structural formula $CH_3-CH_2-COOH$?",
      "संरचनात्मक सूत्र $CH_3-CH_2-COOH$ द्वारा दर्शाए गए कार्बन यौगिक का सही IUPAC व्यवस्थित नाम क्या है?",
      ["Ethanoic acid", "Propanoic acid", "Butanoic acid", "Propanal"],
      ["एथेनोइक अम्ल", "प्रोपेनोइक अम्ल", "ब्यूटेनोइक अम्ल", "प्रोपेनैल"],
      1,
      ["Count the total number of carbon atoms, including the carbon inside the functional group.", "क्रियात्मक समूह के भीतर मौजूद कार्बन सहित कार्बन परमाणुओं की कुल संख्या गिनें।"],
      "The compound contains 3 carbon atoms (root word: 'propan') and a carboxylic acid group ($-COOH$, suffix: '-oic acid'). Combining them gives Propanoic acid.",
      "इस यौगिक में 3 कार्बन परमाणु हैं (मूल शब्द: 'propan') और एक कार्बोक्सिलिक अम्ल समूह ($-COOH$, अनुलग्न: '-oic acid') है। इन्हें मिलाने पर प्रोपेनोइक अम्ल प्राप्त होता है।",
      "medium", 1475
    ],

    ["10-sc-cc-16", ["combustion", "flame-type", "medium"],
      "Why do unsaturated hydrocarbons generally burn with a yellow, sooty flame when ignited in air?",
      "वायु में जलाने पर असंतृप्त हाइड्रोकार्बन आम तौर पर पीली, कज्जली (काले धुएं वाली) ज्वाला के साथ क्यों जलते हैं?",
      ["They contain a lower percentage of carbon than saturated hydrocarbons", "The percentage of carbon is very high, preventing complete combustion in limited atmospheric oxygen", "They undergo endothermic decomposition during combustion", "Unsaturated carbons reject oxygen atoms"],
      ["उनमें संतृप्त हाइड्रोकार्बन की तुलना में कार्बन का प्रतिशत कम होता है", "कार्बन का प्रतिशत बहुत अधिक होता है, जो सीमित वायुमंडलीय ऑक्सीजन में पूर्ण दहन को रोकता है", "दहन के दौरान उनका ऊष्माशोषी अपघटन होता है", "असंतृप्त कार्बन ऑक्सीजन परमाणुओं को अस्वीकार करते हैं"],
      1,
      ["Unsaturated compounds have a higher carbon-to-hydrogen ratio, requiring more oxygen for full breakdown.", "असंतृप्त यौगिकों में कार्बन-से-हाइड्रोजन का अनुपात अधिक होता है, जिससे पूर्ण अपघटन के लिए अधिक ऑक्सीजन की आवश्यकता होती है।"],
      "Unsaturated hydrocarbons have a high relative carbon percentage. Air supplies insufficient oxygen for complete oxidation, leaving unburnt carbon particles that glow yellow and form soot.",
      "असंतृप्त हाइड्रोकार्बन में कार्बन का सापेक्ष प्रतिशत अधिक होता है। हवा पूर्ण ऑक्सीकरण के लिए अपर्याप्त ऑक्सीजन की आपूर्ति कर पाती है, जिससे बिना जले कार्बन कण बच जाते हैं जो पीले रंग में चमकते हैं और कालिख (soot) बनाते हैं।",
      "medium", 1495
    ],

    ["10-sc-cc-17", ["oxidation", "potassium-permanganate", "advanced"],
      "Alkaline Potassium Permanganate ($KMnO_4$) or Acidified Potassium Dichromate ($K_2Cr_2O_7$) convert Ethanol into Ethanoic acid. What role do these chemical reagents perform?",
      "क्षारीय पोटेशियम परमैंगनेट ($KMnO_4$) या अम्लीकृत पोटेशियम डाइक्रोमेट ($K_2Cr_2O_7$) एथेनॉल को एथेनोइक अम्ल में परिवर्तित करते हैं। ये रासायनिक अभिकर्मक क्या भूमिका निभाते हैं?",
      ["Catalysts", "Oxidizing agents", "Reducing agents", "Dehydrating agents"],
      ["उत्प्रेरक", "ऑक्सीकारक (उपचायक)", "अपचायक", "निर्जलीकारक"],
      1,
      ["These substances are capable of adding oxygen to other starting materials.", "ये पदार्थ अन्य प्रारंभिक सामग्रियों में ऑक्सीजन जोड़ने में सक्षम होते हैं।"],
      "Reagents like alkaline $KMnO_4$ supply oxygen to convert alcohols to carboxylic acids, meaning they oxidize the alcohol and act as oxidizing agents.",
      "क्षारीय $KMnO_4$ जैसे अभिकर्मक एल्कोहॉल को कार्बोक्सिलिक अम्ल में बदलने के लिए ऑक्सीजन की आपूर्ति करते हैं, जिसका अर्थ है कि वे एल्कोहॉल को ऑक्सीकृत करते हैं और ऑक्सीकारक के रूप में कार्य करते हैं।",
      "hard", 1575
    ],

    ["10-sc-cc-18", ["addition-reaction", "hydrogenation", "medium"],
      "The conversion of liquid vegetable oils into solid vegetable ghee in the presence of a Nickel catalyst is an example of which type of chemical reaction?",
      "निकेल उत्प्रेरक की उपस्थिति में तरल वनस्पति तेलों का ठोस वनस्पति घी में परिवर्तन किस प्रकार की रासायनिक अभिक्रिया का उदाहरण है?",
      ["Substitution reaction", "Addition reaction", "Displacement reaction", "Dehydration reaction"],
      ["प्रतिस्थापन अभिक्रिया", "संकलन (योगज/आवर्धन) अभिक्रिया", "विस्थापन अभिक्रिया", "निर्जलीकरण अभिक्रिया"],
      1,
      ["This process involves adding hydrogen gas across carbon-carbon double bonds to saturate them.", "इस प्रक्रिया में कार्बन-कार्बन दोहरे बंधों को संतृप्त करने के लिए उनमें हाइड्रोजन गैस जोड़ना शामिल है।"],
      "Vegetable oils are unsaturated fats. Hydrogenation adds hydrogen atoms across their double bonds using a Nickel ($Ni$) catalyst to form saturated fats (ghee), which is an addition reaction.",
      "वनस्पति तेल असंतृप्त वसा होते हैं। हाइड्रोजनीकरण निकेल ($Ni$) उत्प्रेरक का उपयोग करके उनके दोहरे बंधों में हाइड्रोजन परमाणु जोड़ता है ताकि संतृप्त वसा (घी) बन सके, जो कि एक संकलन (addition) अभिक्रिया है।",
      "medium", 1480
    ],

    ["10-sc-cc-19", ["substitution", "methane-chlorination", "medium"],
      "Saturated hydrocarbons react with Chlorine gas in the presence of sunlight. What type of reaction occurs, and what is the primary organic product when Methane reacts?",
      "संतृप्त हाइड्रोकार्बन सूर्य के प्रकाश की उपस्थिति में क्लोरीन गैस के साथ अभिक्रिया करते हैं। यह किस प्रकार की अभिक्रिया है, और मेथेनॉल की अभिक्रिया होने पर मुख्य कार्बनिक उत्पाद क्या बनता है?",
      ["Addition reaction; Chloroform", "Substitution reaction; Chloromethane", "Combustion reaction; Carbon tetrachloride", "Elimination reaction; Dichloromethane"],
      ["संकलन अभिक्रिया; क्लोरोफॉर्म", "प्रतिस्थापन अभिक्रिया; क्लोरोमेथेन", "दहन अभिक्रिया; कार्बन टेट्राक्लोराइड", "विलोपन अभिक्रिया; डाइक्लोरोमेथेन"],
      1,
      ["One chlorine atom replaces one hydrogen atom from the stable alkane structure.", "एक क्लोरीन परमाणु स्थिर एल्केन संरचना से एक हाइड्रोजन परमाणु को प्रतिस्थापित करता है।"],
      "Methane ($CH_4$) reacts with chlorine in sunlight via a substitution pathway where chlorine replaces hydrogen atoms step-by-step, forming Chloromethane ($CH_3Cl$) and HCl gas.",
      "मेथेन ($CH_4$) सूर्य के प्रकाश में प्रतिस्थापन मार्ग से क्लोरीन के साथ अभिक्रिया करता है जहाँ क्लोरीन चरण-दर-चरण हाइड्रोजन परमाणुओं को प्रतिस्थापित करता है, जिससे क्लोरोमेथेन ($CH_3Cl$) और HCl गैस बनती है।",
      "medium", 1490
    ],

    ["10-sc-cc-20", ["ethanol-sodium", "reactions", "advanced"],
      "When a tiny piece of Sodium metal is dropped into pure Ethanol, a gas is evolved with effervescence. Identify the gas evolved and the other salt product formed.",
      "जब सोडियम धातु का एक छोटा टुकड़ा शुद्ध एथेनॉल में डाला जाता है, तो बुदबुदाहट के साथ एक गैस निकलती है। निकलने वाली गैस और बनने वाले अन्य लवण उत्पाद की पहचान कीजिए।",
      ["Oxygen gas and Sodium ethanoate", "Hydrogen gas and Sodium ethoxide", "Carbon dioxide and Sodium carbonate", "Hydrogen gas and Sodium acetate"],
      ["ऑक्सीजन गैस और सोडियम एथेनोएट", "हाइड्रोजन गैस और सोडियम एथॉक्साइड", "कार्बन डाइऑक्साइड और सोडियम कार्बोनेट", "हाइड्रोजन गैस और सोडियम एसीटेट"],
      1,
      ["Alcohols react with reactive metals to displace the hydrogen atom attached to the oxygen.", "एल्कोहॉल सक्रिय धातुओं के साथ अभिक्रिया करके ऑक्सीजन से जुड़े हाइड्रोजन परमाणु को विस्थापित करते हैं।"],
      "Ethanol reacts with sodium metal to produce Hydrogen gas ($H_2$) along with an ionic compound salt named Sodium Ethoxide ($2CH_3CH_2OH + 2Na \\rightarrow 2CH_3CH_2ONa + H_2$).",
      "एथेनॉल सोडियम धातु के साथ अभिक्रिया करके हाइड्रोजन गैस ($H_2$) और साथ ही सोडियम एथॉक्साइड ($2CH_3CH_2OH + 2Na \\rightarrow 2CH_3CH_2ONa + H_2$) नाम का एक आयनिक लवण बनाता है।",
      "hard", 1565
    ],

    ["10-sc-cc-21", ["dehydration", "ethanol", "advanced"],
      "Heating Ethanol at 443 K with excess concentrated Sulfuric acid ($H_2SO_4$) converts it into Ethene. What is the role of concentrated Sulfuric acid in this reaction?",
      "एथेनॉल को 443 K पर अत्यधिक सांद्र सल्फ्यूरिक अम्ल ($H_2SO_4$) के साथ गर्म करने पर यह एथीन में बदल जाता है। इस अभिक्रिया में सांद्र सल्फ्यूरिक अम्ल की क्या भूमिका है?",
      ["Oxidizing agent", "Dehydrating agent", "Reducing agent", "Substituent reagent"],
      ["ऑक्सीकारक", "निर्जलीकारक", "अपचायक", "प्रतिस्थापन अभिकर्मक"],
      1,
      ["The acid molecule removes a water molecule ($H_2O$) structurally from the ethanol compound.", "अम्ल का अणु एथेनॉल यौगिक से संरचनात्मक रूप से एक जल के अणु ($H_2O$) को हटा देता है।"],
      "Concentrated sulfuric acid acts as a powerful dehydrating agent at 443 K. It removes a molecule of water from ethanol, transforming it into unsaturated ethene ($CH_2=CH_2$).",
      "सांद्र सल्फ्यूरिक अम्ल 443 K पर एक शक्तिशाली निर्जलीकारक के रूप में कार्य करता है। यह एथेनॉल से पानी के एक अणु को हटा देता है, जिससे यह असंतृप्त एथीन ($CH_2=CH_2$) में बदल जाता है।",
      "hard", 1620
    ],

    ["10-sc-cc-22", ["glacial-acetic-acid", "ethanoic-acid", "basics"],
      "Why is pure Ethanoic acid sometimes referred to as 'Glacial Acetic Acid'?",
      "शुद्ध एथेनोइक अम्ल को कभी-कभी 'ग्लेशियल एसिटिक अम्ल' क्यों कहा जाता है?",
      ["It smells like glaciers", "It freezes into ice-like crystals during cold winter climates due to its 290 K melting point", "It is extracted directly from Arctic glaciers", "It undergoes polymerization when cooled below zero degrees"],
      ["इसकी गंध ग्लेशियरों जैसी होती है", "इसके 290 K गलनांक के कारण यह ठंडी सर्दियों की जलवायु में बर्फ जैसे क्रिस्टल में जम जाता है", "इसे सीधे आर्कटिक ग्लेशियरों से निकाला जाता है", "शून्य डिग्री से नीचे ठंडा होने पर इसका बहुलकीकरण होता है"],
      1,
      ["Consider its physical melting point, which is 17 degrees Celsius (290 K).", "इसके भौतिक गलनांक पर विचार करें, जो 17 डिग्री सेल्सियस (290 K) है।"],
      "Pure ethanoic acid has a melting point of 290 K (17°C). Because of this, it frequently freezes into crystalline solid blocks during winters in cold climates, looking like a glacier.",
      "शुद्ध एथेनोइक अम्ल का गलनांक 290 K (17°C) होता है। इस कारण ठंडी जलवायु में सर्दियों के दौरान यह अक्सर क्रिस्टलीय ठोस टुकड़ों में जम जाता है, जो ग्लेशियर जैसा दिखता है।",
      "easy", 1440
    ],

    ["10-sc-cc-23", ["esterification", "reactions", "advanced"],
      "When Ethanoic Acid is reacted with absolute Ethanol in the presence of an acid catalyst, a sweet-smelling substance is formed. Name this reaction and the class of compound produced.",
      "जब एक अम्ल उत्प्रेरक की उपस्थिति में एथेनोइक अम्ल की अभिक्रिया एब्सोल्यूट एथेनॉल के साथ कराई जाती है, तो एक मीठी गंध वाला पदार्थ बनता है। इस अभिक्रिया और बनने वाले यौगिक के वर्ग का नाम बताइए।",
      ["Saponification, Soap", "Esterification, Ester", "Dehydration, Ether", "Hydrogenation, Alkane"],
      ["साबुनीकरण, साबुन", "एस्टरीकरण, एस्टर", "निर्जलीकरण, ईथर", "हाइड्रोजननीकरण, एल्केन"],
      1,
      ["These sweet-smelling molecules are widely synthesized for making perfumes and artificial flavorings.", "इन मीठी गंध वाले अणुओं का निर्माण इत्र और कृत्रिम स्वाद (flavorings) बनाने के लिए व्यापक रूप से किया जाता है।"],
      "The condensation reaction of a carboxylic acid with an alcohol yields an Ester and water, which is termed Esterification ($CH_3COOH + CH_3CH_2OH \\rightarrow CH_3COOCH_2CH_3 + H_2O$).",
      "एक कार्बोक्सिलिक अम्ल और एक एल्कोहॉल की संघनन (condensation) अभिक्रिया से एस्टर और जल प्राप्त होता है, जिसे एस्टरीकरण कहा जाता है ($CH_3COOH + CH_3CH_2OH \\rightarrow CH_3COOCH_2CH_3 + H_2O$)।",
      "hard", 1590
    ],

    ["10-sc-cc-24", ["saponification", "esters", "advanced"],
      "What reaction takes place when an Ester is treated with an alkali like Sodium Hydroxide ($NaOH$), and what are the functional products?",
      "जब किसी एस्टर की अभिक्रिया सोडियम हाइड्रोक्साइड ($NaOH$) जैसे क्षार के साथ कराई जाती है तो कौन सी अभिक्रिया होती है, और उसके क्रियात्मक उत्पाद क्या होते हैं?",
      ["Esterification; converts ester back into ether", "Saponification; yields ethanol and sodium salt of carboxylic acid (soap)", "Combustion; forms carbon dioxide gas and water vapor", "Addition; converts unsaturated bonds into single bonds"],
      ["एस्टरीकरण; एस्टर को वापस ईथर में बदलता है", "साबुनीकरण; एथेनॉल और कार्बोक्सिलिक अम्ल का सोडियम लवण (साबुन) देता है", "दहन; कार्बन डाइऑक्साइड गैस और जल वाष्प बनाता है", "संकलन; असंतृप्त बंधों को एकल बंधों में बदलता है"],
      1,
      ["This base-catalyzed cleavage pathway is the foundational chemical process for soap manufacturing factories.", "यह क्षार-उत्प्रेरित विदलन (cleavage) मार्ग साबुन निर्माण के कारखानों के लिए मूलभूत रासायनिक प्रक्रिया है।"],
      "Esters react with alkalis to split back into alcohol and sodium salt of carboxylic acid. Because this method prepares soap, it is called Saponification.",
      "एस्टर क्षार के साथ अभिक्रिया करके वापस एल्कोहॉल और कार्बोक्सिलिक अम्ल के सोडियम लवण में टूट जाते हैं। चूंकि इस विधि से साबुन तैयार किया जाता है, इसलिए इसे साबुनीकरण कहा जाता है।",
      "hard", 1615
    ],

    ["10-sc-cc-25", ["reactions-of-ethanoic-acid", "carbonates", "medium"],
      "Ethanoic acid reacts with Sodium Carbonate ($Na_2CO_3$). Which of the following sets represents all the correct chemical products of this reaction?",
      "एथेनोइक अम्ल सोडियम कार्बोनेट ($Na_2CO_3$) के साथ अभिक्रिया करता है। निम्नलिखित में से कौन सा सेट इस अभिक्रिया के सभी सही रासायनिक उत्पादों को दर्शाता है?",
      ["Sodium ethoxide and Hydrogen gas", "Sodium acetate, Carbon dioxide, and Water", "Sodium methanoate and Carbon monoxide", "Sodium hydride and Acetone"],
      ["सोडियम एथॉक्साइड और हाइड्रोजन गैस", "सोडियम एसीटेट, कार्बन डाइऑक्साइड और जल", "सोडियम मेथेनोएट और कार्बन मोनोऑक्साइड", "सोडियम हाइड्राइड और एसीटोन"],
      1,
      ["Carboxylic acids break down metal carbonates to yield a salt, water, and an effervescent gas.", "कार्बोक्सिलिक अम्ल धातु कार्बोनेटों को तोड़कर एक लवण, जल और एक बुदबुदाहट वाली गैस बनाते हैं।"],
      "The chemical reaction is $2CH_3COOH + Na_2CO_3 \\rightarrow 2CH_3COONa + H_2O + CO_2$. The products are Sodium acetate (ethanoate), water, and carbon dioxide.",
      "रासायनिक अभिक्रिया $2CH_3COOH + Na_2CO_3 \\rightarrow 2CH_3COONa + H_2O + CO_2$ है। इसके उत्पाद सोडियम एसीटेट (एथेनोएट), जल और कार्बन डाइऑक्साइड हैं।",
      "medium", 1520
    ],

    ["10-sc-cc-26", ["soap-structure", "micelle", "medium"],
      "A soap molecule consists of a long hydrocarbon tail and a polar ionic head. What are their respective affinity behaviors toward water?",
      "साबुन के एक अणु में एक लंबी हाइड्रोकार्बन पूंछ और एक ध्रुवीय आयनिक सिर होता है। पानी के प्रति उनके संबंधित आकर्षण का व्यवहार क्या होता है?",
      ["Hydrophilic head and Hydrophobic tail", "Hydrophobic head and Hydrophilic tail", "Both parts are hydrophilic in nature", "Both parts are hydrophobic in nature"],
      ["जलरागी (Hydrophilic) सिर और जलविरागी (Hydrophobic) पूंछ", "जलविरागी (Hydrophobic) सिर और जलरागी (Hydrophilic) पूंछ", "दोनों भाग प्रकृति में जलरागी होते हैं", "दोनों भाग प्रकृति में जलविरागी होते हैं"],
      0,
      ["The ionic cluster likes water, whereas the non-polar carbon chain prefers grease/oils.", "आयनिक समूह पानी को पसंद करता है, जबकि अध्रुवीय कार्बन शृंखला ग्रीस/तेलों को प्राथमिकता देती है।"],
      "Soap molecules are sodium salts of long-chain fatty acids. The ionic head is hydrophilic (attracts water), while the non-polar long carbon chain tail is hydrophobic (repels water, attracts grease).",
      "साबुन के अणु लंबी शृंखला वाले फैटी अम्लों के सोडियम लवण होते हैं। आयनिक सिर जलरागी (पानी को आकर्षित करने वाला) होता है, जबकि अध्रुवीय लंबी कार्बन शृंखला वाली पूंछ जलविरागी (पानी को दूर भगाने वाली, ग्रीस को आकर्षित करने वाली) होती है।",
      "medium", 1465
    ],

    ["10-sc-cc-27", ["micelle", "cleansing-mechanism", "advanced"],
      "During the cleansing action of soap, soap molecules aggregate into a spherical cluster called a 'Micelle'. How are the molecules oriented inside a micelle?",
      "साबुन की सफाई प्रक्रिया के दौरान, साबुन के अणु एक गोलाकार समूह में एकत्रित हो जाते हैं जिसे 'मिसेल' (Micelle) कहा जाता है। मिसेल के भीतर अणुओं का विन्यास कैसा होता है?",
      ["Hydrophobic tails point outward into the water, heads point inward", "Hydrophobic tails point inward toward the center trap containing dirt, while hydrophilic heads point outward facing water", "Molecules align in parallel flat sheets blocking water", "Heads and tails dissolve uniformly without specific pattern"],
      ["जलविरागी पूंछ बाहर पानी की ओर और सिर अंदर की ओर इंगित करते हैं", "जलविरागी पूंछ अंदर केंद्र की ओर होती हैं जहाँ गंदगी फंसी होती है, जबकि जलरागी सिर बाहर पानी की ओर इंगित करते हैं", "अणु समानांतर समतल परतों में संरेखित होकर पानी को रोकते हैं", "बिना किसी विशिष्ट पैटर्न के सिर और पूंछ समान रूप से घुल जाते हैं"],
      1,
      ["The interior traps the hydrophobic oily grime away from the aquatic bulk.", "आंतरिक भाग जलविरागी तैलीय मैल को जलीय घोल से दूर अंदर फंसा लेता है।"],
      "In a micelle cluster, the hydrophobic hydrocarbon tails gather at the interior center to dissolve and trap the oil/grease droplet, while the ionic hydrophilic heads face outward into the surrounding water matrix.",
      "एक मिसेल समूह में, जलविरागी हाइड्रोकार्बन पूंछ तेल/ग्रीस की बूंद को घोलने और फंसाने के लिए आंतरिक केंद्र में इकट्ठा होती हैं, जबकि आयनिक जलरागी सिर बाहर चारों ओर के पानी की ओर उन्मुख होते हैं।",
      "hard", 1580
    ],

    ["10-sc-cc-28", ["hard-water", "scum", "advanced"],
      "When soap is mixed with hard water, a sticky insoluble curd-like precipitate called 'scum' forms, reducing lather. Which ions present in hard water react with soap to create this?",
      "जब साबुन को कठोर जल के साथ मिलाया जाता है, तो 'स्कम' (Scum) नामक एक चिपचिपा अघुलनशील दही जैसा अवक्षेप बनता है, जो झाग को कम करता है। कठोर जल में मौजूद कौन से आयन साबुन के साथ अभिक्रिया करके इसे बनाते हैं?",
      ["Sodium and Potassium ions", "Calcium and Magnesium ions", "Iron and Copper ions", "Carbonate and Sulfate ions"],
      ["सोडियम और पोटेशियम आयन", "कैल्शियम और मैग्नीशियम आयन", "आयरन और कॉपर आयन", "कार्बोनेट और सल्फेट आयन"],
      1,
      ["These divalent metal ions replace sodium ions from soap molecules to form insoluble salts.", "ये द्विसंयोजक धातु आयन साबुन के अणुओं से सोडियम आयनों को प्रतिस्थापित करके अघुलनशील लवण बनाते हैं।"],
      "Hard water contains dissolved salts of Calcium ($Ca^{2+}$) and Magnesium ($Mg^{2+}$). These ions swap with the sodium ions of soap, precipitating out as insoluble calcium/magnesium salts of fatty acids, known as scum.",
      "कठोर जल में कैल्शियम ($Ca^{2+}$) और मैग्नीशियम ($Mg^{2+}$) के घुले हुए लवण होते हैं। ये आयन साबुन के सोडियम आयनों के साथ अदला-बदली कर लेते हैं, जिससे वे फैटी अम्लों के अघुलनशील कैल्शियम/मैग्नीशियम लवणों के रूप में अवक्षेपित हो जाते हैं, जिसे स्कम कहा जाता है।",
      "hard", 1635
    ],

    ["10-sc-cc-29", ["detergents", "hard-water-action", "advanced"],
      "Why do synthetic detergents successfully clean clothes and form lather even inside hard water, unlike regular soaps?",
      "कृत्रिम अपमार्जक (detergents) सामान्य साबुनों के विपरीत कठोर जल के भीतर भी कपड़ों को सफलतापूर्वक साफ क्यों करते हैं और झाग क्यों बनाते हैं?",
      ["Detergents are completely non-polar molecules", "The ammonium or sulfate head groups of detergents do not form insoluble precipitates with the calcium and magnesium ions of hard water", "Detergents alter the pH of hard water to make it completely soft", "Detergents contain oils that dissolve calcium deposits"],
      ["अपमार्जक पूरी तरह से अध्रुवीय अणु होते हैं", "अपमार्जकों के अमोनियम या सल्फेट सिर समूह कठोर जल के कैल्शियम और मैग्नीशियम आयनों के साथ अघुलनशील अवक्षेप नहीं बनाते हैं", "अपमार्जक कठोर जल के pH को बदलकर उसे पूरी तरह से मृदु बना देते हैं", "अपमार्जकों में ऐसे तेल होते हैं जो कैल्शियम जमाव को घोल देते हैं"],
      1,
      ["The structural salts of detergents remain soluble even when combined with divalent ions.", "अपमार्जक के संरचनात्मक लवण द्विसंयोजक आयनों के साथ जुड़ने पर भी घुलनशील रहते हैं।"],
      "Detergents are usually sodium salts of sulfonic acids or ammonium salts with chlorides/bromides. Their charged ends do not precipitate out with $Ca^{2+}$ or $Mg^{2+}$ ions, ensuring they remain fully effective in hard water.",
      "अपमार्जक आमतौर पर सल्फोनिक अम्लों के सोडियम लवण या क्लोराइड/ब्रोमाइड वाले अमोनियम लवण होते हैं। उनके आवेशित सिरे $Ca^{2+}$ या $Mg^{2+}$ आयनों के साथ अवक्षेपित नहीं होते हैं, जिससे यह सुनिश्चित होता है कि वे कठोर जल में भी पूरी तरह प्रभावी रहते हैं।",
      "hard", 1610
    ],

    ["10-sc-cc-30", ["ionic-vs-covalent", "melting-points", "medium"],
      "Why do covalent carbon compounds generally exhibit relatively low melting and boiling points compared to ionic compounds?",
      "आयनिक यौगिकों की तुलना में सहसंयोजक कार्बन यौगिक आम तौर पर अपेक्षाकृत कम गलनांक और क्वथनांक क्यों प्रदर्शित करते हैं?",
      ["Covalent bonds within molecules are weak", "The intermolecular forces of attraction between distinct molecules are weak", "Carbon compounds exist only as gases at room temperature", "Covalent compounds have high electrical charges pulling molecules apart"],
      ["अणुओं के भीतर सहसंयोजक बंध कमजोर होते हैं", "अलग-अलग अणुओं के बीच पारस्परिक अंतर-आणविक आकर्षण बल कमजोर होते हैं", "कार्बन यौगिक कमरे के तापमान पर केवल गैसों के रूप में मौजूद होते हैं", "सहसंयोजक यौगिकों में उच्च विद्युत आवेश होते हैं जो अणुओं को अलग करते हैं"],
      1,
      ["Distinguish between strong bonds inside a molecule versus weak electrostatic attraction holding separate molecules together.", "एक अणु के भीतर मजबूत बंधों और अलग-अलग अणुओं को एक साथ रखने वाले कमजोर इलेक्ट्रोस्टैटिक आकर्षण के बीच अंतर करें।"],
      "While intra-molecular covalent bonds are strong, the intermolecular forces (Vander Waals forces) between neutral carbon molecules are weak. Minimal thermal energy is required to overcome these forces, leading to lower melting/boiling points.",
      "हालांकि अंतर-आणविक सहसंयोजक बंध मजबूत होते हैं, लेकिन उदासीन कार्बन अणुओं के बीच अंतर-आणविक बल (intermolecular forces) कमजोर होते हैं। इन बलों को पार करने के लिए न्यूनतम ऊष्मीय ऊर्जा की आवश्यकता होती है, जिससे गलनांक/क्वथनांक कम हो जाता है।",
      "medium", 1455
    ]
  ])
},

  {
  chapterNumber: 5,
  topicId: "science-life-processes",
  chapterTitle: "Life Processes",
  chapterTitleHindi: "जैव प्रक्रम",
  questions: makeQuestionSet("science-life-processes", [

    ["10-sc-lp-01", ["nutrition", "photosynthesis", "basics"],
      "Which of the following raw materials is NOT directly required by autotrophs for the process of photosynthesis?",
      "स्वपोषी जीवों द्वारा प्रकाश संश्लेषण की प्रक्रिया के लिए निम्नलिखित में से किस कच्चे माल की प्रत्यक्ष आवश्यकता नहीं होती है?",
      ["Carbon dioxide", "Water", "Oxygen", "Sunlight"],
      ["कार्बन डाइऑक्साइड", "जल", "ऑक्सीजन", "सूर्य का प्रकाश"],
      2,
      ["Photosynthesis is a process where green plants produce food and release a certain gas as a by-product.", "प्रकाश संश्लेषण एक ऐसी प्रक्रिया है जिसमें हरे पौधे भोजन बनाते हैं और एक निश्चित गैस को उप-उत्पाद के रूप में छोड़ते हैं।"],
      "Autotrophs use carbon dioxide, water, and sunlight in the presence of chlorophyll to synthesize carbohydrates. Oxygen is actually released as a by-product of this process, not consumed as a raw material.",
      "स्वपोषी क्लोरोफिल की उपस्थिति में कार्बोहाइड्रेट का संश्लेषण करने के लिए कार्बन डाइऑक्साइड, जल और सूर्य के प्रकाश का उपयोग करते हैं। ऑक्सीजन वास्तव में इस प्रक्रिया के उप-उत्पाद के रूप में निकलती है, न कि कच्चे माल के रूप में उपयोग की जाती है।",
      "easy", 1410
    ],

    ["10-sc-lp-02", ["stomata", "guard-cells", "medium"],
      "The opening and closing of the stomatal pore is a carefully regulated process. What directly causes the stomatal pore to open?",
      "रंध्रीय छिद्र का खुलना और बंद होना एक सावधानीपूर्वक नियंत्रित प्रक्रिया है। रंध्रीय छिद्र के खुलने का प्रत्यक्ष कारण क्या है?",
      ["Guard cells lose water and shrink", "Guard cells swell up when water flows into them", "Concentration of oxygen increases inside the leaf", "Temperature of the environment drops suddenly"],
      ["द्वार कोशिकाएँ (Guard cells) पानी खो देती हैं और सिकुड़ जाती हैं", "जब पानी द्वार कोशिकाओं के भीतर बहता है तो वे फूल जाती हैं", "पत्ती के अंदर ऑक्सीजन की सांद्रता बढ़ जाती है", "पर्यावरण का तापमान अचानक गिर जाता है"],
      1,
      ["Think about the turgor pressure changes in the specialized kidney-shaped cells flanking the pore.", "रंध्र के दोनों ओर स्थित विशिष्ट गुर्दे के आकार की कोशिकाओं में स्फीति दाब (turgor pressure) के परिवर्तनों के बारे में सोचें।"],
      "When water flows into the guard cells, they swell up and curve outward, causing the stomatal pore to open. When they lose water, they shrink and become straight, closing the pore.",
      "जब पानी द्वार कोशिकाओं के भीतर बहता है, तो वे फूल जाती हैं और बाहर की ओर मुड़ जाती हैं, जिससे रंध्रीय छिद्र खुल जाता है। जब वे पानी खो देती हैं, तो वे सिकुड़ जाती हैं और सीधी हो जाती हैं, जिससे छिद्र बंद हो जाता है।",
      "medium", 1465
    ],

    ["10-sc-lp-03", ["digestion", "enzymes", "basics"],
      "Human saliva contains an enzyme called salivary amylase. What is the specific chemical function of this enzyme in the digestive tract?",
      "मानव लार में लार एमाइलेज (salivary amylase) नामक एंजाइम होता है। पाचन तंत्र में इस एंजाइम का विशिष्ट रासायनिक कार्य क्या है?",
      ["Breaking down complex proteins into amino acids", "Emulsifying large fat globules into smaller droplets", "Breaking down complex starch molecules into simple sugars", "Activating pepsinogen inside the oral cavity"],
      ["जटिल प्रोटीनों को अमीनो अम्लों में तोड़ना", "वसा के बड़े गोलकों को छोटे-छोटे टुकड़ों में पायसीकृत करना", "जटिल स्टार्च अणुओं को सरल शर्करा में तोड़ना", "मुख गुहा के भीतर पेप्सिनोजेन को सक्रिय करना"],
      2,
      ["This is why chewing plain bread or rice for a long time makes it taste slightly sweet.", "यही कारण है कि सादे ब्रेड या चावल को लंबे समय तक चबाने से उसका स्वाद थोड़ा मीठा लगने लगता है।"],
      "Salivary amylase begins the process of chemical digestion in the mouth by breaking down complex starch carbohydrates into simpler sugar molecules like maltose.",
      "लार एमाइलेज मुंह में ही जटिल स्टार्च कार्बोहाइड्रेट को माल्टोज़ जैसी सरल शर्करा के अणुओं में तोड़कर रासायनिक पाचन की प्रक्रिया शुरू कर देता है।",
      "easy", 1420
    ],

    ["10-sc-lp-04", ["stomach", "gastric-juice", "medium"],
      "The gastric glands in the human stomach secrete hydrochloric acid, pepsin, and mucus. What is the vital role performed by mucus?",
      "मानव आमाशय (stomach) में जठर ग्रंथियां हाइड्रोक्लोरिक अम्ल, पेप्सिन और म्यूकस (श्लेष्मा) स्रावित करती हैं। म्यूकस द्वारा निभाई जाने वाली महत्वपूर्ण भूमिका क्या है?",
      ["It digests complex carbohydrates in the stomach", "It protects the inner lining of the stomach from the corrosive action of hydrochloric acid", "It kills harmful bacteria entering with the food", "It provides an alkaline medium for pepsin activation"],
      ["यह आमाशय में जटिल कार्बोहाइड्रेट को पचाता है", "यह हाइड्रोक्लोरिक अम्ल की संक्षारक क्रिया से आमाशय की आंतरिक परत की रक्षा करता है", "यह भोजन के साथ प्रवेश करने वाले हानिकारक बैक्टीरिया को मारता है", "यह पेप्सिन के सक्रियण के लिए एक क्षारीय माध्यम प्रदान करता है"],
      1,
      ["Hydrochloric acid is highly corrosive. Think about what prevents it from digesting the stomach's own muscular walls.", "हाइड्रोक्लोरिक अम्ल अत्यधिक संक्षारक होता है। सोचें कि क्या इसे आमाशय की अपनी पेशीय दीवारों को पचाने से रोकता है।"],
      "Mucus forms a protective barrier over the inner muscular wall of the stomach, shielding it from being eroded or damaged by the highly acidic environment created by hydrochloric acid.",
      "म्यूकस आमाशय की आंतरिक पेशीय दीवार पर एक सुरक्षात्मक परत बनाता है, जो इसे हाइड्रोक्लोरिक अम्ल द्वारा बनाए गए अत्यधिक अम्लीय वातावरण से नष्ट या क्षतिग्रस्त होने से बचाता है।",
      "medium", 1450
    ],

    ["10-sc-lp-05", ["stomach", "digestion", "medium"],
      "What muscular structure regulates the exit of partially digested food from the stomach into the small intestine?",
      "कौन सी पेशीय संरचना आमाशय से छोटी आंत (small intestine) में आंशिक रूप से पचे हुए भोजन के निकास को नियंत्रित करती है?",
      ["Anal sphincter", "Pyloric sphincter muscle", "Epiglottis", "Oesophageal valve"],
      ["गुदा अवरोधिनी (Anal sphincter)", "जठरनिर्गमी अवरोधिनी पेशी (Pyloric sphincter)", "घाटी ढक्कन (Epiglottis)", "ग्रसिका वाल्व"],
      1,
      ["This ring-like muscle releases food in small amounts into the next segment of the alimentary canal.", "यह छल्ले जैसी पेशी भोजन को कम मात्रा में आहार नाल के अगले हिस्से में छोड़ती है।"],
      "The exit of food from the stomach is strictly regulated by a sphincter muscle (specifically the pyloric sphincter), which releases it in small quantities into the small intestine.",
      "आमाशय से भोजन का निकास एक अवरोधिनी पेशी (विशेष रूप से पाइलोरिक स्फिंक्टर) द्वारा कड़ाई से नियंत्रित होता है, जो इसे कम मात्रा में छोटी आंत में छोड़ती है।",
      "medium", 1480
    ],

    ["10-sc-lp-06", ["bile-juice", "liver", "medium"],
      "Bile juice secreted by the liver does not contain any digestive enzymes, yet it is essential for digestion. Why?",
      "यकृत (liver) द्वारा स्रावित पित्त रस (bile juice) में कोई पाचक एंजाइम नहीं होते हैं, फिर भी यह पाचन के लिए आवश्यक है। क्यों?",
      ["It breaks proteins into peptides", "It converts starch into glucose", "It makes the food acidic and emulsifies large fat molecules", "It turns the acidic food alkaline and emulsifies large fat globules"],
      ["यह प्रोटीन को पेप्टाइड्स में तोड़ता है", "यह स्टार्च को ग्लूकोज में बदलता", "यह भोजन को अम्लीय बनाता है और वसा के बड़े अणुओं को पायसीकृत करता है", "यह अम्लीय भोजन को क्षारीय बनाता है और वसा के बड़े गोलकों को पायसीकृत करता है"],
      3,
      ["Think about the two constraints faced by pancreatic enzymes: food from the stomach is highly acidic, and fats are clustered in giant drops.", "अग्न्याशयी एंजाइमों के सामने आने वाली दो बाधाओं के बारे में सोचें: आमाशय से आने वाला भोजन अत्यधिक अम्लीय होता है, और वसा विशाल बूंदों में एकत्रित होती है।"],
      "Bile juice performs two critical roles: it neutralizes the acidic stomach food to make it alkaline for pancreatic enzymes to function, and it emulsifies large fat globules into smaller particles, increasing enzyme efficiency.",
      "पित्त रस दो महत्वपूर्ण भूमिकाएँ निभाता है: यह आमाशय के अम्लीय भोजन को उदासीन करके क्षारीय बनाता है ताकि अग्न्याशयी एंजाइम कार्य कर सकें, और यह वसा के बड़े गोलकों को छोटे कणों में पायसीकृत (emulsify) करता है, जिससे एंजाइम की कार्यक्षमता बढ़ जाती है।",
      "medium", 1490
    ],

    ["10-sc-lp-07", ["pancreas", "enzymes", "advanced"],
      "Identify the correct matching pairing of enzymes secreted by the pancreas along with their specific targets.",
      "अग्न्याशय (pancreas) द्वारा स्रावित एंजाइमों और उनके विशिष्ट लक्ष्यों का सही मिलान युग्म पहचानिए।",
      ["Trypsin digests carbohydrates; Lipase digests proteins", "Trypsin digests proteins; Lipase digests emulsified fats", "Amylase digests fats; Trypsin digests carbohydrates", "Lipase digests proteins; Amylase digests emulsified fats"],
      ["ट्रिप्सिन कार्बोहाइड्रेट को पचाता है; लाइपेज प्रोटीन को पचाता है", "ट्रिप्सिन प्रोटीन को पचाता है; लाइपेज पायसीकृत वसा को पचाता है", "एमाइलेज वसा को पचाता है; ट्रिप्सिन कार्बोहाइड्रेट को पचाता है", "लाइपेज प्रोटीन को पचाता है; एमाइलेज पायसीकृत वसा को पचाता है"],
      1,
      ["Trypsin acts similarly to pepsin but in an alkaline medium, while lipase breaks down lipid molecules.", "ट्रिप्सिन पेप्सिन के समान ही कार्य करता है लेकिन क्षारीय माध्यम में, जबकि लाइपेज लिपिड अणुओं को तोड़ता है।"],
      "Pancreatic juice contains enzymes like trypsin for carrying out the digestion of proteins, and lipase for breaking down fats that have been emulsified by bile.",
      "अग्न्याशयी रस में प्रोटीन के पाचन के लिए ट्रिप्सिन और पित्त द्वारा पायसीकृत वसा को तोड़ने के लिए लाइपेज जैसे एंजाइम होते हैं।",
      "hard", 1540
    ],

    ["10-sc-lp-08", ["small-intestine", "villi", "basics"],
      "The inner wall of the small intestine features millions of tiny, finger-like projections called villi. What is their primary biological purpose?",
      "छोटी आंत की आंतरिक दीवार पर लाखों छोटे, उंगली जैसे उभार होते हैं जिन्हें दीर्घरोम (villi) कहा जाता है। उनका प्राथमिक जैविक उद्देश्य क्या है?",
      ["To secrete digestive juices continuously", "To increase the surface area for more efficient absorption of digested food", "To push the food forward into the large intestine via rhythmic beating", "To filter out toxic substances from entering the bloodstream"],
      ["लगातार पाचक रसों का स्राव करना", "पचे हुए भोजन के अधिक कुशल अवशोषण के लिए सतह क्षेत्र को बढ़ाना", "लयबद्ध गति के माध्यम से भोजन को बड़ी आंत में आगे धकेलना", "विषाक्त पदार्थों को रक्तप्रवाह में प्रवेश करने से रोकना"],
      1,
      ["Think about how geometric structures optimize absorption capacity without expanding total organ volume.", "इस बारे में सोचें कि कैसे ज्यामितीय संरचनाएं कुल अंग की मात्रा को बढ़ाए बिना अवशोषण क्षमता को अनुकूलित करती हैं।"],
      "Villi enormously increase the internal surface area of the small intestine. They are richly supplied with blood vessels to take up the absorbed nutrients and distribute them throughout the body.",
      "दीर्घरोम (Villi) छोटी आंत के आंतरिक सतह क्षेत्र को अत्यधिक बढ़ा देते हैं। अवशोषित पोषक तत्वों को लेने और उन्हें पूरे शरीर में वितरित करने के लिए इनमें रक्त वाहिकाओं की प्रचुर आपूर्ति होती है।",
      "easy", 1415
    ],

    ["10-sc-lp-09", ["respiration", "glucose-breakdown", "medium"],
      "The first stage in the breakdown of glucose is identical for both aerobic and anaerobic respiration. Where inside the cell does this initial phase take place?",
      "ग्लूकोज के टूटने का पहला चरण वायवीय (aerobic) और अवायवीय (anaerobic) दोनों श्वसन के लिए समान होता है। कोशिका के भीतर यह प्रारंभिक चरण कहाँ होता है?",
      ["Mitochondria", "Cytoplasm", "Nucleus", "Ribosomes"],
      ["माइटोकॉन्ड्रिया", "कोशिकाद्रव्य (Cytoplasm)", "केन्द्रक", "राइबोसोम"],
      1,
      ["This process converts a 6-carbon glucose molecule into a 3-carbon pyruvate molecule without using oxygen.", "यह प्रक्रिया ऑक्सीजन का उपयोग किए बिना 6-कार्बन वाले ग्लूकोज अणु को 3-कार्बन वाले पाइरुवेट अणु में बदल देती है।"],
      "The conversion of glucose (6-carbon molecule) into pyruvate (3-carbon molecule) takes place entirely within the cytoplasm of the cell and does not require oxygen.",
      "गुकोज (6-कार्बन अणु) का पाइरुवेट (3-कार्बन अणु) में परिवर्तन पूरी तरह से कोशिका के कोशिकाद्रव्य (cytoplasm) के भीतर होता है और इसके लिए ऑक्सीजन की आवश्यकता नहीं होती है।",
      "medium", 1470
    ],

    ["10-sc-lp-10", ["respiration", "yeast", "basics"],
      "During fermentation in yeast cells, pyruvate is broken down anaerobically. What are the end-products of this metabolic pathway?",
      "खमीर (yeast) कोशिकाओं में किण्वन (fermentation) के दौरान, पाइरुवेट अवायवीय रूप से टूट जाता है। इस चयापचय मार्ग के अंतिम उत्पाद क्या हैं?",
      ["Lactic acid and Energy", "Carbon dioxide, Water, and Energy", "Ethanol, Carbon dioxide, and Energy", "Pyruvic acid and Oxygen"],
      ["लैक्टिक अम्ल और ऊर्जा", "कार्बन डाइऑक्साइड, जल और ऊर्जा", "एथेनॉल, कार्बन डाइऑक्साइड और ऊर्जा", "पाइरुविक अम्ल और ऑक्सीजन"],
      2,
      ["This anaerobic process is exploited in industries to manufacture wine, beer, and bread.", "इस अवायवीय प्रक्रिया का उपयोग उद्योगों में वाइन, बीयर और ब्रेड बनाने के लिए किया जाता है।"],
      "In yeast, during anaerobic respiration (fermentation), the 3-carbon pyruvate molecule is converted into ethanol (a 2-carbon alcohol) and carbon dioxide, alongside the release of a small amount of energy.",
      "यीस्ट में, अवायवीय श्वसन (किण्वन) के दौरान, 3-कार्बन वाला पाइरुवेट अणु एथेनॉल (एक 2-कार्बन अल्कोहल) और कार्बन डाइऑक्साइड में परिवर्तित हो जाता है, साथ ही कम मात्रा में ऊर्जा निकलती है।",
      "easy", 1430
    ],

    ["10-sc-lp-11", ["respiration", "muscle-cramps", "medium"],
      "When we undergo sudden, intense physical exercise, we often experience painful muscle cramps. What chemical accumulation is responsible for this condition?",
      "जब हम अचानक, तीव्र शारीरिक व्यायाम करते हैं, तो हमें अक्सर मांसपेशियों में दर्दनाक ऐंठन (cramps) का अनुभव होता है। इस स्थिति के लिए कौन सा रासायनिक संचय जिम्मेदार है?",
      ["Excess accumulation of Ethanol", "Accumulation of Lactic acid due to anaerobic breakdown of pyruvate", "Deposition of Calcium phosphate crystals", "Production of excess Carbon dioxide bubbles"],
      ["एथेनॉल का अत्यधिक संचय", "पाइरुवेट के अवायवीय विखंडन के कारण लैक्टिक अम्ल का संचय", "कैल्शियम फास्फेट क्रिस्टल का जमाव", "अत्यधिक कार्बन डाइऑक्साइड के बुलबुलों का उत्पादन"],
      1,
      ["This happens due to a temporary lack of oxygen in our skeletal muscle tissues.", "ऐसा हमारी कंकाल पेशी ऊतकों में ऑक्सीजन की अस्थायी कमी के कारण होता है।"],
      "During sudden activity, oxygen demand outpaces supply in muscles. Pyruvate breaks down via an anaerobic pathway into lactic acid. The buildup of lactic acid causes muscle cramps.",
      "अचानक होने वाली गतिविधि के दौरान, मांसपेशियों में ऑक्सीजन की मांग आपूर्ति से अधिक हो जाती है। पाइरुवेट एक अवायवीय मार्ग के माध्यम से लैक्टिक अम्ल में टूट जाता है। लैक्टिक अम्ल का यह संचय मांसपेशियों में ऐंठन का कारण बनता है।",
      "medium", 1475
    ],

    ["10-sc-lp-12", ["mitochondria", "aerobic-respiration", "medium"],
      "Aerobic breakdown of pyruvate occurs inside the mitochondria. What are the specific products generated, and how does the energy yield compare to anaerobic pathways?",
      "पाइरुवेट का वायवीय विखंडन माइटोकॉन्ड्रिया के भीतर होता है। उत्पन्न होने वाले विशिष्ट उत्पाद क्या हैं, और अवायवीय मार्गों की तुलना में इसका ऊर्जा उत्पादन कैसा होता है?",
      ["Ethanol + CO2; significantly lower energy yield", "Lactic acid + Water; identical energy yield", "Carbon dioxide + Water; significantly higher energy yield", "Oxygen + Glucose; variable energy yield"],
      ["एथेनॉल + CO2; काफी कम ऊर्जा उत्पादन", "लैक्टिक अम्ल + जल; समान ऊर्जा उत्पादन", "कार्बन डाइऑक्साइड + जल; काफी अधिक ऊर्जा उत्पादन", "ऑक्सीजन + ग्लूकोज; परिवर्तनशील ऊर्जा उत्पादन"],
      2,
      ["Think about complete oxidation versus partial oxidation of carbon substrates.", "कार्बन सबस्ट्रेट्स के पूर्ण ऑक्सीकरण बनाम आंशिक ऑक्सीकरण के बारे में सोचें।"],
      "Aerobic respiration inside mitochondria breaks down pyruvate completely into carbon dioxide and water. Because the oxidation is complete, the energy released is vastly greater (approx 36-38 ATP) than anaerobic pathways (2 ATP).",
      "माइटोकॉन्ड्रिया के भीतर वायवीय श्वसन पाइरुवेट को पूरी तरह से कार्बन डाइऑक्साइड और जल में तोड़ देता है। क्योंकि ऑक्सीकरण पूर्ण होता है, इसलिए जारी ऊर्जा अवायवीय मार्गों (2 ATP) की तुलना में बहुत अधिक (लगभग 36-38 ATP) होती है।",
      "medium", 1495
    ],

    ["10-sc-lp-13", ["aquatic-respiration", "breathing-rate", "advanced"],
      "Why is the rate of breathing in aquatic organisms significantly faster than that seen in terrestrial organisms?",
      "जलीय जीवों में श्वास लेने की दर (breathing rate) स्थलीय जीवों की तुलना में काफी तेज क्यों होती है?",
      ["Aquatic organisms possess inefficient lungs", "The amount of dissolved oxygen in water is fairly low compared to the amount of oxygen in the air", "Water offers more friction to gaseous diffusion", "Warm water forces organisms to expand energy rapidly"],
      ["जलीय जीवों के फेफड़े अक्षम होते हैं", "हवा में ऑक्सीजन की मात्रा की तुलना में पानी में घुली हुई ऑक्सीजन की मात्रा काफी कम होती है", "पानी गैसीय विसरण में अधिक घर्षण पैदा करता है", "गर्म पानी जीवों को तेजी से ऊर्जा खर्च करने के लिए मजबूर करता है"],
      1,
      ["Consider the availability of oxygen gas in an aquatic environment versus atmospheric air.", "जलीय वातावरण बनाम वायुमंडलीय हवा में ऑक्सीजन गैस की उपलब्धता पर विचार करें।"],
      "Since the availability of dissolved oxygen in water bodies is much lower than atmospheric air, aquatic animals (like fish) must gulp water and pump it over gills rapidly to meet their oxygen requirements.",
      "चूंकि जल निकायों में घुली हुई ऑक्सीजन की उपलब्धता वायुमंडलीय हवा की तुलना में बहुत कम होती है, इसलिए जलीय जंतुओं (जैसे मछली) को अपनी ऑक्सीजन की आवश्यकताओं को पूरा करने के लिए तेजी से पानी निगलना पड़ता है और उसे गिल्स (क्लोम) पर पंप करना पड़ता है।",
      "advanced", 1530
    ],

    ["10-sc-lp-14", ["alveoli", "lungs", "basics"],
      "Within the human respiratory system, what structural units provide the maximum surface area for the exchange of gases between blood capillaries and air?",
      "मानव श्वसन प्रणाली के भीतर, कौन सी संरचनात्मक इकाइयाँ रक्त कोशिकाओं और हवा के बीच गैसों के आदान-प्रदान के लिए अधिकतम सतह क्षेत्र प्रदान करती हैं?",
      ["Bronchioles", "Trachea with cartilaginous rings", "Alveoli", "Pharynx"],
      ["श्वसनिकाएं (Bronchioles)", "उपास्थि वलयों से युक्त श्वास नली (Trachea)", "कूपिकाएं (Alveoli)", "ग्रसनी (Pharynx)"],
      2,
      ["These are balloon-like structures located at the very terminus of the bronchial tree.", "ये श्वसनी वृक्ष (bronchial tree) के बिल्कुल अंतिम छोर पर स्थित गुब्बारे जैसी संरचनाएं हैं।"],
      "Alveoli are tiny balloon-like structures at the ends of bronchioles inside the lungs. Their extremely thin walls are covered in extensive capillary networks, optimizing the diffusion of $O_2$ and $CO_2$.",
      "कूपिकाएं (Alveoli) फेफड़ों के अंदर श्वसनिकाओं के सिरों पर स्थित छोटी गुब्बारे जैसी संरचनाएं होती हैं। उनकी अत्यधिक पतली दीवारें व्यापक केशिका नेटवर्क से ढकी होती हैं, जो $O_2$ और $CO_2$ के विसरण को अनुकूलित करती हैं।",
      "easy", 1425
    ],

    ["10-sc-lp-15", ["hemoglobin", "respiratory-pigment", "medium"],
      "In large animals like humans, simple diffusion pressure alone cannot deliver oxygen to all parts of the body efficiently. What pigment binds oxygen to carry it?",
      "मनुष्यों जैसे बड़े जानवरों में, केवल साधारण विसरण दाब (diffusion pressure) ही शरीर के सभी हिस्सों में कुशलतापूर्वक ऑक्सीजन नहीं पहुंचा सकता है। इसे ले जाने के लिए कौन सा वर्णक ऑक्सीजन को बांधता है?",
      ["Chlorophyll", "Hemoglobin", "Plasma proteins", "Platelets"],
      ["क्लोरोफिल", "हीमोग्लोबिन (Hemoglobin)", "प्लाज्मा प्रोटीन", "प्लेटलेट्स"],
      1,
      ["This iron-rich protein gives red blood cells their characteristic color.", "यह आयरन युक्त प्रोटीन लाल रक्त कोशिकाओं को उनका विशिष्ट रंग देता है।"],
      "Hemoglobin is the respiratory pigment present in red blood cells. It has a very high chemical affinity for oxygen, binding it in the lungs and releasing it into distant bodily tissues.",
      "हीमोग्लोबिन लाल रक्त कोशिकाओं में मौजूद श्वसन वर्णक है। इसमें ऑक्सीजन के लिए बहुत उच्च रासायनिक आकर्षण होता है, जो इसे फेफड़ों में बांधता है और दूर के शारीरिक ऊतकों में छोड़ता है।",
      "medium", 1460
    ],

    ["10-sc-lp-16", ["heart", "chambers", "advanced"],
      "Warm-blooded animals like mammals and birds possess a complete four-chambered heart. What evolutionary advantage does this design supply?",
      "स्तनधारियों और पक्षियों जैसे गर्म रक्त वाले जीवों (warm-blooded animals) में पूर्ण चार कक्षों वाला हृदय होता है। यह संरचना क्या विकासात्मक लाभ प्रदान करती है?",
      ["It reduces overall blood pressure", "It allows complete separation of oxygenated and deoxygenated blood, ensuring high-efficiency oxygen delivery to maintain body temperature", "It allows blood to flow back into lungs during relaxation phases", "It decreases the speed of blood circulation around tissues"],
      ["यह समग्र रक्तचाप को कम करता है", "यह ऑक्सीजन युक्त और ऑक्सीजन रहित रक्त के पूर्ण पृथक्करण की अनुमति देता है, जिससे शरीर के तापमान को बनाए रखने के लिए उच्च दक्षता वाली ऑक्सीजन की आपूर्ति सुनिश्चित होती है", "यह आराम के चरणों के दौरान रक्त को फेफड़ों में वापस प्रवाहित होने देता है", "यह ऊतकों के चारों ओर रक्त परिसंचरण की गति को कम करता है"],
      1,
      ["Think about the massive continuous energy demands needed by warm-blooded creatures to keep their internal temperature steady.", "गर्म रक्त वाले जीवों को अपने आंतरिक तापमान को स्थिर रखने के लिए आवश्यक भारी निरंतर ऊर्जा मांगों के बारे में सोचें।"],
      "The four-chambered heart prevents any mixing of oxygenated and deoxygenated blood. This separation ensures an incredibly efficient supply of oxygen, fulfilling the high energy demands needed to regulate internal body temperature.",
      "चार कक्षों वाला हृदय ऑक्सीजन युक्त और ऑक्सीजन रहित रक्त के किसी भी मिश्रण को रोकता है। यह पृथक्करण ऑक्सीजन की अविश्वसनीय रूप से कुशल आपूर्ति सुनिश्चित करता है, जो आंतरिक शरीर के तापमान को नियंत्रित करने के लिए आवश्यक उच्च ऊर्जा मांगों को पूरा करता है।",
      "hard", 1555
    ],

    ["10-sc-lp-17", ["amphibians-reptiles", "heart-structure", "advanced"],
      "Amphibians and many reptiles can tolerate some mixing of oxygenated and deoxygenated blood. How many chambers do their hearts normally contain?",
      "उभयचर (amphibians) और कई सरीसृप (reptiles) ऑक्सीजन युक्त और ऑक्सीजन रहित रक्त के कुछ मिश्रण को सहन कर सकते हैं। उनके हृदय में सामान्यतः कितने कक्ष होते हैं?",
      ["Two chambers", "Three chambers", "Four chambers", "Single chamber"],
      ["दो कक्ष", "तीन कक्ष", "चार कक्ष", "एकल कक्ष"],
      1,
      ["These animals do not use metabolic energy to maintain a constant internal body temperature.", "ये जानवर निरंतर आंतरिक शरीर के तापमान को बनाए रखने के लिए चयापचय ऊर्जा का उपयोग नहीं करते हैं।"],
      "Amphibians and cold-blooded reptiles have 3-chambered hearts (two atria and one ventricle). Because their body temperature depends on environmental surroundings, their energy needs are lower, allowing them to tolerate partial blood mixing.",
      "उभयचरों और ठंडे रक्त वाले सरीसृपों में 3-कक्षीय हृदय (दो अलिंद और एक निलय) होते हैं। चूंकि उनका शरीर का तापमान पर्यावरणीय परिवेश पर निर्भर करता है, इसलिए उनकी ऊर्जा की आवश्यकताएं कम होती हैं, जिससे वे आंशिक रक्त मिश्रण को सहन कर सकते हैं।",
      "hard", 1560
    ],

    ["10-sc-lp-18", ["blood-pressure", "vessels", "medium"],
      "Why do arteries possess significantly thicker and more elastic walls compared to veins?",
      "शिराओं (veins) की तुलना में धमनियों (arteries) की दीवारें काफी मोटी और अधिक लचीली क्यों होती हैं?",
      ["Arteries must store extra blood cells", "Blood emerges from the heart under extremely high pressure, requiring robust, stretchable vessels", "Arteries contain valves that need muscular support", "Veins carry blood directly away from the heart"],
      ["धमनियों को अतिरिक्त रक्त कोशिकाओं को संग्रहीत करना चाहिए", "हृदय से रक्त अत्यधिक उच्च दाब में निकलता है, जिसके लिए मजबूत, खिंचाव योग्य वाहिकाओं की आवश्यकता होती है", "धमनियों में वाल्व होते हैं जिन्हें मांसपेशियों के सहारे की आवश्यकता होती है", "शिराएं रक्त को सीधे हृदय से दूर ले जाती हैं"],
      1,
      ["Arteries receive the immediate surge of blood pumped out by the powerful muscular contraction of ventricles.", "धमनियां निलय के शक्तिशाली पेशीय संकुचन द्वारा पंप किए गए रक्त के तत्काल प्रवाह को प्राप्त करती हैं।"],
      "Arteries carry blood away from the heart to various organs. Since the blood emerges from the heart under high pressure, the walls of arteries are thick and elastic to withstand and absorb this force.",
      "धमनियां रक्त को हृदय से दूर विभिन्न अंगों तक ले जाती हैं। चूंकि रक्त हृदय से उच्च दाब के तहत निकलता है, इसलिए इस बल को सहन करने और अवशोषित करने के लिए धमनियों की दीवारें मोटी और लचीली होती हैं।",
      "medium", 1485
    ],

    ["10-sc-lp-19", ["valves", "heart-mechanics", "medium"],
      "What is the exact functional purpose of valves present within the chambers of the human heart and in veins?",
      "मानव हृदय के कक्षों और शिराओं (veins) में मौजूद वाल्वों (valves) का सटीक कार्यात्मक उद्देश्य क्या है?",
      ["To increase the speed of circulating blood cells", "To ensure that blood flows only in a single direction and prevents backflow", "To oxygenate deoxygenated blood cells locally", "To filter out tiny blood clots"],
      ["परिसंचारी रक्त कोशिकाओं की गति को बढ़ाना", "यह सुनिश्चित करना कि रक्त केवल एक ही दिशा में प्रवाहित हो और पश्चप्रवाह (backflow) को रोकना", "ऑक्सीजन रहित रक्त कोशिकाओं को स्थानीय रूप से ऑक्सीजन युक्त करना", "रक्त के छोटे थक्कों को छानना"],
      1,
      ["Think about what happens when blood moves against gravity or when a chamber relaxes.", "इस बारे में सोचें कि क्या होता है जब रक्त गुरुत्वाकर्षण के विपरीत चलता है या जब कोई कक्ष शिथिल (relax) होता है।"],
      "Valves ensure that blood flows unidirectionally. In the heart, they prevent blood from rushing backward into atria when ventricles contract. In veins, they keep blood moving toward the heart against gravity.",
      "वाल्व यह सुनिश्चित करते हैं कि रक्त एकदिशीय (unidirectionally) प्रवाहित हो। हृदय में, वे निलय के संकुचित होने पर रक्त को वापस अलिंद में जाने से रोकते हैं। शिराओं में, वे रक्त को गुरुत्वाकर्षण के विरुद्ध हृदय की ओर ले जाते हैं।",
      "medium", 1455
    ],

    ["10-sc-lp-20", ["platelets", "clotting", "basics"],
      "When a person gets injured and bleeds, which specialized component of blood leaks out around the wound to form a plug, minimizing further blood loss?",
      "जब कोई व्यक्ति घायल हो जाता है और खून बहता है, तो रक्त का कौन सा विशिष्ट घटक घाव के आसपास निकलकर थक्का (plug) बनाता है, जिससे रक्त की आगे की हानि कम से कम हो?",
      ["Red Blood Corpuscles (RBCs)", "White Blood Corpuscles (WBCs)", "Blood Platelets", "Lymph fluid cells"],
      ["लाल रक्त कणिकाएं (RBCs)", "श्वेत रक्त कणिकाएं (WBCs)", "रक्त प्लेटलेट्स (पट्टिकाणु)", "लसिका द्रव कोशिकाएं"],
      2,
      ["These are tiny cell fragments circulating in plasma dedicated purely to coagulation.", "ये प्लाज्मा में परिसंचरण करने वाले छोटे सेलुलर टुकड़े हैं जो पूरी तरह से स्कंदन (coagulation) के लिए समर्पित हैं।"],
      "Platelets circulate around the body and plug leaks by helping to clot the blood at the precise points of injury, preventing hemorrhage and keeping blood pressure stable.",
      "प्लेटलेट्स पूरे शरीर में परिसंचरण करते हैं और चोट के सटीक स्थानों पर रक्त का थक्का जमाने में मदद करके रिसाव को रोकते हैं, जिससे रक्तस्राव रुकता है और रक्तचाप स्थिर रहता है।",
      "easy", 1405
    ],

    ["10-sc-lp-21", ["lymph", "tissue-fluid", "advanced"],
      "Lymph (or tissue fluid) is another fluid involved in human transportation. How does lymph composition differ from blood plasma?",
      "लसिका (lymph या ऊतक द्रव) मानव परिवहन में शामिल एक अन्य द्रव है। लसिका का संगठन रक्त प्लाज्मा से किस प्रकार भिन्न होता है?",
      ["It contains much more proteins and RBCs", "It is completely yellow and carries oxygen at higher pressures", "It is colorless and contains less protein than blood plasma", "It contains no liquid matrix and only white cells"],
      ["इसमें बहुत अधिक प्रोटीन और RBC होते हैं", "यह पूरी तरह से पीला होता है और उच्च दाब पर ऑक्सीजन ले जाता है", "यह रंगहीन होता है और इसमें रक्त प्लाज्मा की तुलना में कम प्रोटीन होता है", "इसमें कोई तरल मैट्रिक्स नहीं होता है और केवल श्वेत कोशिकाएं होती हैं"],
      2,
      ["This fluid escapes through the pores present in the walls of capillaries into intercellular spaces.", "यह द्रव केशिकाओं की दीवारों में मौजूद छिद्रों के माध्यम से अंतर-कोशिकीय स्थानों में निकल जाता है।"],
      "Lymph is a colorless fluid containing less protein than plasma because large blood cells and proteins stay trapped inside capillaries. It drains excess intercellular fluid back into veins and carries digested fats.",
      "लसिका एक रंगहीन द्रव है जिसमें प्लाज्मा की तुलना में कम प्रोटीन होता है क्योंकि बड़ी रक्त कोशिकाएं और प्रोटीन केशिकाओं के भीतर ही फंसे रहते हैं। यह अतिरिक्त अंतर-कोशिकीय द्रव को वापस शिराओं में पहुंचाता है और पचे हुए वसा को ले जाता है।",
      "hard", 1545
    ],

    ["10-sc-lp-22", ["xylem", "water-transport", "basics"],
      "In plants, xylem tissue is responsible for moving water and mineral salts. What tissue acts as the structural transport channel for food?",
      "पौधों में, जाइलम (xylem) ऊतक जल और खनिज लवणों को ले जाने के लिए जिम्मेदार होता है। भोजन के लिए संरचनात्मक परिवहन चैनल के रूप में कौन सा ऊतक कार्य करता है?",
      ["Pith", "Phloem", "Cortex", "Stomata parenchyma"],
      ["मज्जा (Pith)", "फ्लोएम (Phloem)", "वल्कुट (Cortex)", "रंध्र मृदूतक"],
      1,
      ["This tissue transports the soluble products of photosynthesis from the leaves to other parts of the plant.", "यह ऊतक पत्तियों से प्रकाश संश्लेषण के घुलनशील उत्पादों को पौधे के अन्य भागों तक पहुँचाता है।"],
      "Phloem is the specialized plant vascular tissue responsible for the transport of soluble food materials, amino acids, and hormones from leaves (sources) to storage organs and growing tips (sinks).",
      "फ्लोएम पौधे का विशिष्ट संवहनी ऊतक है जो पत्तियों (स्रोतों) से घुलनशील खाद्य पदार्थों, अमीनो अम्लों और हार्मोन को संचयन अंगों और बढ़ते हुए सिरों (सिंक) तक पहुँचाने के लिए जिम्मेदार है।",
      "easy", 1412
    ],

    ["10-sc-lp-23", ["transpiration", "suction-pull", "medium"],
      "During the daytime, what physiological process provides the major driving force or suction pull to lift water up through the xylem vessels to the top of tall trees?",
      "दिन के समय, कौन सी शारीरिक प्रक्रिया ऊंचे पेड़ों के शीर्ष तक जाइलम वाहिकाओं के माध्यम से पानी को ऊपर खींचने के लिए मुख्य चालक बल या खिंचाव (suction pull) प्रदान करती है?",
      ["Root pressure alone", "Transpiration from leaf surfaces", "Guttation", "Photolysis of water molecules"],
      ["केवल मूल दाब (Root pressure)", "पत्तियों की सतह से वाष्पोत्सर्जन (Transpiration)", "बिन्दुस्राव (Guttation)", "जल के अणुओं का प्रकाश-अपघटन"],
      1,
      ["This process involves the evaporation of water molecules into the air from the stomatal pores of leaves.", "इस प्रक्रिया में पत्तियों के रंध्रों से हवा में जल के अणुओं का वाष्पीकरण शामिल है।"],
      "Evaporation of water from stomata creates a continuous negative suction pressure that pulls water columns upward from roots through the xylem. This transpirational pull dominates during the day.",
      "रंध्रों से पानी का वाष्पीकरण एक निरंतर ऋणात्मक खिंचाव दाब बनाता है जो जाइलम के माध्यम से जड़ों से पानी के स्तंभों को ऊपर खींचता है। यह वाष्पोत्सर्जन खिंचाव दिन के दौरान हावी रहता है।",
      "medium", 1480
    ],

    ["10-sc-lp-24", ["translocation", "phloem-energy", "advanced"],
      "The transport of soluble nutrients in phloem is called translocation. How does translocation differ dynamically from passive water movement in xylem?",
      "फ्लोएम में घुलनशील पोषक तत्वों के परिवहन को स्थानांतरण (translocation) कहा जाता है। स्थानांतरण गतिशील रूप से जाइलम में होने वाले निष्क्रिय जल प्रवाह से किस प्रकार भिन्न है?",
      ["Translocation is purely physical and needs no energy", "Translocation is an active process that requires metabolic energy supplied in the form of ATP", "Translocation moves substances only downward under gravity", "Translocation occurs inside dead cells without cytoplasm"],
      ["स्थानांतरण विशुद्ध रूप से भौतिक है और इसके लिए किसी ऊर्जा की आवश्यकता नहीं होती है", "स्थानांतरण एक सक्रिय प्रक्रिया है जिसके लिए ATP के रूप में चयापचय ऊर्जा की आवश्यकता होती है", "स्थानांतरण गुरुत्वाकर्षण के तहत पदार्थों को केवल नीचे की ओर ले जाता है", "स्थानांतरण कोशिकाद्रव्य रहित मृत कोशिकाओं के भीतर होता है"],
      1,
      ["Material like sucrose is transferred into phloem tissue using energy from a specific cellular currency.", "सुक्रोज जैसी सामग्री को एक विशिष्ट सेलुलर मुद्रा से प्राप्त ऊर्जा का उपयोग करके फ्लोएम ऊतक में स्थानांतरित किया जाता है।"],
      "Unlike xylem transport driven by physical forces, phloem translocation is an active process. Sucrose is loaded into sieve tubes utilizing energy from ATP, which increases osmotic pressure, moving material to low-pressure regions.",
      "भौतिक बलों द्वारा संचालित जाइलम परिवहन के विपरीत, फ्लोएम स्थानांतरण एक सक्रिय प्रक्रिया है। सुक्रोज को ATP से प्राप्त ऊर्जा का उपयोग करके चालनी नलिकाओं (sieve tubes) में लोड किया जाता है, जिससे परासरण दाब बढ़ जाता है और सामग्री कम दाब वाले क्षेत्रों में चली जाती है।",
      "hard", 1570
    ],

    ["10-sc-lp-25", ["excretion", "nephron", "basics"],
      "What is the name of the fundamental microscopic structural and functional filtration unit found inside human kidneys?",
      "मानव वृक्क (kidneys) के भीतर पाए जाने वाले मूलभूत सूक्ष्म संरचनात्मक और कार्यात्मक निस्पंदन इकाई (filtration unit) का क्या नाम है?",
      ["Neuron", "Nephron", "Alveolus", "Ureter tube"],
      ["न्यूरॉन (Neuron)", "नेफ्रॉन / वृक्काणु (Nephron)", "कूपिका (Alveolus)", "मूत्रवाहिनी नली"],
      1,
      ["Be careful not to confuse this renal cell framework with the signaling network cells of the nervous system.", "सावधान रहें कि इस वृक्क कोशिका ढांचे को तंत्रिका तंत्र की सिग्नलिंग नेटवर्क कोशिकाओं के साथ भ्रमित न करें।"],
      "Each human kidney contains roughly one million microscopic filtering units called nephrons or uriniferous tubules, which extract metabolic wastes from the blood.",
      "प्रत्येक मानव वृक्क में लगभग दस लाख सूक्ष्म निस्पंदन इकाइयाँ होती हैं जिन्हें नेफ्रॉन या वृक्काणु कहा जाता है, जो रक्त से चयापचय अपशिष्टों को बाहर निकालते हैं।",
      "easy", 1400
    ],

    ["10-sc-lp-26", ["bowmans-capsule", "nephron-structure", "medium"],
      "Each nephron features a cup-shaped structure at its starting end that clusters around a knot of capillaries. Identify this cup-shaped filter collector.",
      "प्रत्येक नेफ्रॉन के शुरुआती छोर पर एक कप के आकार की संरचना होती है जो केशिकाओं के गुच्छे के चारों ओर केंद्रित होती है। इस कप के आकार के निस्पंदन संग्राहक को पहचानिए।",
      ["Glomerulus", "Bowman's capsule", "Henle's loop", "Collecting duct"],
      ["कोशिकागुच्छ (Glomerulus)", "बोमन संपुट (Bowman's capsule)", "हेनले का लूप", "संग्राहक वाहिनी"],
      1,
      ["The capillary bundle inside it is called the glomerulus, while the surrounding container shares a scientist's name.", "इसके अंदर मौजूद केशिका बंडल को ग्लोमेरुलस कहा जाता है, जबकि आसपास के कंटेनर का नाम एक वैज्ञानिक के नाम पर है।"],
      "The nephron begins with a cup-shaped framework called Bowman's capsule, which encloses a dense knot of blood capillaries called the glomerulus. It receives the fluid filtered out under pressure.",
      "नेफ्रॉन की शुरुआत बोमन संपुट (Bowman's capsule) नामक एक कप के आकार के ढांचे से होती है, जो ग्लोमेरुलस (कोशिकागुच्छ) नामक रक्त केशिकाओं के एक घने गुच्छे को घेरता है। यह दाब में छनकर आने वाले द्रव को प्राप्त करता है।",
      "medium", 1465
    ],

    ["10-sc-lp-27", ["selective-reabsorption", "urine-formation", "advanced"],
      "As the initial filtrate flows along the long tubular parts of a nephron, which substances are selectively reabsorbed back into surrounding blood capillaries?",
      "जैसे ही प्रारंभिक निस्यंद (initial filtrate) नेफ्रॉन के लंबे नलिकाकार भागों से होकर बहता है, कौन से पदार्थ चुनिंदा रूप से वापस आसपास की रक्त केशिकाओं में अवशोषित हो जाते हैं?",
      ["Urea, Uric acid, and excess water only", "Glucose, Amino acids, Salts, and a major amount of Water", "Proteins and Red Blood Cells exclusively", "Toxic chemical compounds and bile pigments"],
      ["केवल यूरिया, यूरिक अम्ल और अतिरिक्त जल", "ग्लूकोज, अमीनो अम्ल, लवण और जल की बड़ी मात्रा", "विशेष रूप से प्रोटीन और लाल रक्त कोशिकाएं", "विषाक्त रासायनिक यौगिक और पित्त वर्णक"],
      1,
      ["Think about the valuable small nutrient molecules that pass through the initial sieve but shouldn't be wasted in urine.", "उन मूल्यवान छोटे पोषक तत्वों के अणुओं के बारे में सोचें जो प्रारंभिक छलनी से तो गुजर जाते हैं लेकिन उन्हें मूत्र में बर्बाद नहीं किया जाना चाहिए।"],
      "The initial filtrate contains waste along with useful substances. As it passes through the tubule, essential nutrients like glucose, amino acids, salts, and water are selectively reabsorbed depending on body hydration levels.",
      "प्रारंभिक निस्यंद में उपयोगी पदार्थों के साथ-साथ अपशिष्ट भी होते हैं। जैसे-जैसे यह नलिका से गुजरता है, शरीर में पानी की मात्रा के आधार पर ग्लूकोज, अमीनो अम्ल, लवण और जल जैसे आवश्यक पोषक तत्वों को चुनिंदा रूप से वापस अवशोषित कर लिया जाता है।",
      "hard", 1550
    ],

    ["10-sc-lp-28", ["hemodialysis", "artificial-kidney", "advanced"],
      "In case of kidney failure, an artificial kidney machine is used to cleanse blood. What baseline physical process allows it to strip away nitrogenous wastes?",
      "वृक्क खराब होने (kidney failure) की स्थिति में रक्त को साफ करने के लिए कृत्रिम वृक्क (artificial kidney) मशीन का उपयोग किया जाता है। कौन सी बुनियादी भौतिक प्रक्रिया इसे नाइट्रोजनयुक्त अपशिष्टों को हटाने की अनुमति देती है?",
      ["Active transport using ATP pumps", "Diffusion across semi-permeable lining tubes into a dialyzing fluid", "High-speed centrifugation of whole blood cells", "Chemical precipitation using enzymatic catalysts"],
      ["ATP पंपों का उपयोग करके सक्रिय परिवहन", "एक अपोहन द्रव (dialyzing fluid) में अर्ध-पारगम्य अस्तर नलिकाओं के माध्यम से विसरण", "संपूर्ण रक्त कोशिकाओं का उच्च गति से सेंट्रीफ्यूजेशन", "एंजाइमी उत्प्रेरकों का उपयोग करके रासायनिक अवक्षेपण"],
      1,
      ["The machine contains long tubes made of a semi-permeable membrane suspended in a tank filled with fluid that has identical osmotic pressure to blood minus metabolic wastes.", "मशीन में अर्ध-पारगम्य झिल्ली से बनी लंबी नलिकाएं होती हैं जो एक ऐसे द्रव से भरे टैंक में डूबी होती हैं जिसका परासरण दाब चयापचय अपशिष्टों को छोड़कर रक्त के समान होता है।"],
      "An artificial kidney works via hemodialysis. Patient's blood flows through semi-permeable cellophane tubes. Nitrogenous wastes diffuse out out of the blood into the dialyzing fluid due to a concentration gradient, requiring no active pumping.",
      "एक कृत्रिम वृक्क हीमोडायलिसिस (अपोहन) के माध्यम से काम करता है। रोगी का रक्त अर्ध-पारगम्य सेलोफेन नलिकाओं से होकर बहता है। सांद्रता प्रवणता के कारण नाइट्रोजनयुक्त अपशिष्ट रक्त से बाहर निकलकर अपोहन द्रव में विसरित हो जाते हैं, जिसमें किसी सक्रिय पंपिंग की आवश्यकता नहीं होती है।",
      "hard", 1610
    ],

    ["10-sc-lp-29", ["plant-excretion", "wastes", "medium"],
      "Plants employ very different strategies for excretion compared to animals. Where do plants store older waste materials like resins and gums internally?",
      "जानवरों की तुलना में पौधे उत्सर्जन के लिए बहुत अलग रणनीतियों का उपयोग करते हैं। पौधे रेजिन (resins) और गोंद (gums) जैसे पुराने अपशिष्ट पदार्थों को आंतरिक रूप से कहाँ संग्रहीत करते हैं?",
      ["In young green leaves actively performing photosynthesis", "Inside old, non-functional xylem tissues", "Inside growing root tips", "Inside the guard cell membranes"],
      ["सक्रिय रूप से प्रकाश संश्लेषण करने वाली युवा हरी पत्तियों में", "पुराने, गैर-कार्यात्मक जाइलम (xylem) ऊतकों के भीतर", "जड़ों के बढ़ते हुए सिरों के भीतर", "द्वार कोशिका की झिल्लियों के भीतर"],
      1,
      ["Think about the dead woody central core tissue of a tree trunk that no longer conducts water.", "एक पेड़ के तने के मृत काष्ठ केंद्रीय कोर ऊतक (woody central tissue) के बारे में सोचें जो अब पानी का संचालन नहीं करता है।"],
      "Many plant waste materials are stored in cellular vacuoles or discarded when leaves fall off. However, specific wastes like resins and gums are safely packed away inside old, non-conducting xylem tissue.",
      "पौधों के कई अपशिष्ट पदार्थ कोशिकीय रिक्तिकाओं (vacuoles) में जमा हो जाते हैं या पत्तियों के गिरने पर बाहर निकल जाते हैं। हालांकि, रेजिन और गोंद जैसे विशिष्ट अपशिष्टों को पुराने, गैर-कार्यात्मक जाइलम ऊतक के भीतर सुरक्षित रूप से पैक कर दिया जाता है।",
      "medium", 1470
    ],

    ["10-sc-lp-30", ["saprophytic", "fungi-nutrition", "basics"],
      "Fungi like bread moulds, mushrooms, and yeast display a saprophytic mode of nutrition. How do they process their food molecules structurally?",
      "ब्रेड मोल्ड, मशरूम और यीस्ट जैसे कवक पोषण का एक मृतजीवी (saprophytic) तरीका प्रदर्शित करते हैं। वे अपने भोजन के अणुओं को संरचनात्मक रूप से कैसे संसाधित करते हैं?",
      ["They engulf raw solid food items inside vacuoles via phagocytosis", "They break down food materials outside their body and then absorb the soluble nutrients", "They live inside host intestines extracting digested blood directly", "They produce food internally via chemical synthesis using hydrogen sulfide"],
      ["वे फैगोसाइटोसिस के माध्यम से रिक्तिकाओं के भीतर कच्चे ठोस खाद्य पदार्थों को निगलते हैं", "वे शरीर के बाहर ही खाद्य पदार्थों को तोड़ते हैं और फिर घुलनशील पोषक तत्वों को अवशोषित करते हैं", "वे मेजबान (host) की आंतों के अंदर रहकर सीधे पचे हुए रक्त को निकालते हैं", "वे हाइड्रोजन सल्फाइड का उपयोग करके रासायनिक संश्लेषण द्वारा आंतरिक रूप से भोजन बनाते हैं"],
      1,
      ["Think about organisms that lack an internal digestive tract or alimentary canal.", "उन जीवों के बारे में सोचें जिनमें आंतरिक पाचन तंत्र या आहार नाल नहीं होती है।"],
      "Saprophytes cannot ingest solid food. They secrete digestive enzymes directly onto dead, decaying organic matter outside their bodies, converting complex compounds into simple forms, and then absorbing the nutrient solution.",
      "मृतजीवी (Saprophytes) ठोस भोजन को निगल नहीं सकते। वे अपने शरीर के बाहर मृत, सड़ने वाले कार्बनिक पदार्थों पर सीधे पाचक एंजाइमों का स्राव करते हैं, जटिल यौगिकों को सरल रूपों में बदलते हैं, और फिर पोषक तत्वों के घोल को अवशोषित करते हैं।",
      "easy", 1422
    ]
  ])
},

  {
  chapterNumber: 6,
  topicId: "science-control-coordination",
  chapterTitle: "Control and Coordination",
  chapterTitleHindi: "नियंत्रण एवं समन्वय",
  questions: makeQuestionSet("science-control-coordination", [

    ["10-sc-cc-01", ["neuron", "synapse", "transmission"],
      "Where within a neuron does an electrical impulse convert into a chemical signal for transmission across a gap?",
      "एक तंत्रिका कोशिका (न्यूरॉन) के भीतर कहाँ विद्युत आवेग एक अंतराल को पार करने के लिए रासायनिक संकेत में परिवर्तित होता है?",
      ["Dendrite tip", "Axon core", "Axon terminal at synapse", "Cell body nucleus"],
      ["द्रुमाकृतिक सिरा (Dendrite tip)", "अक्षतंतु (Axon) का मुख्य भाग", "सिनेप्स पर तंत्रिका का अंतिम सिरा", "कोशिका काय (Cell body) का केंद्रक"],
      2,
      ["This transformation occurs at the very end of the axonal pathway, just before the cellular gap.", "यह रूपांतरण अक्षतंतु मार्ग के बिल्कुल अंत में, कोशिकीय अंतराल से ठीक पहले होता है।"],
      "At the axon terminal, the electrical impulse triggers the release of chemical neurotransmitters across the synapse gap to be detected by the next neuron's dendrites.",
      "तंत्रिका के अंतिम सिरे (axon terminal) पर, विद्युत आवेग सिनेप्स अंतराल में रासायनिक न्यूरोट्रांसमीटर के स्राव को सक्रिय करता है, जिसे अगली तंत्रिका कोशिका की द्रुमाकृतियों द्वारा ग्रहण किया जाता है।",
      "medium", 1460
    ],

    ["10-sc-cc-02", ["reflex-arc", "nervous-system", "pathway"],
      "Identify the correct anatomical sequence of components that constitute a functional Reflex Arc.",
      "एक कार्यात्मक प्रतिवर्ती चाप (Reflex Arc) का निर्माण करने वाले घटकों के सही संरचनात्मक अनुक्रम की पहचान कीजिए।",
      ["Receptor -> Motor neuron -> Spinal cord -> Sensory neuron -> Effector", "Effector -> Sensory neuron -> Brain -> Motor neuron -> Receptor", "Receptor -> Spinal cord -> Sensory neuron -> Motor neuron -> Effector", "Receptor -> Sensory neuron -> Spinal cord -> Motor neuron -> Effector"],
      ["ग्राही -> प्रेरक तंत्रिका कोशिका -> मेरुरज्जु -> संवेदी तंत्रिका कोशिका -> कार्यकर अंग", "कार्यकर अंग -> संवेदी तंत्रिका कोशिका -> मस्तिष्क -> प्रेरक तंत्रिका कोशिका -> ग्राही", "ग्राही -> मेरुरज्जु -> संवेदी तंत्रिका कोशिका -> प्रेरक तंत्रिका कोशिका -> कार्यकर अंग", "ग्राही -> संवेदी तंत्रिका कोशिका -> मेरुरज्जु -> प्रेरक तंत्रिका कोशिका -> कार्यकर अंग"],
      3,
      ["The signal must travel from the sensor inward to the central integrator before outward action occurs.", "बाहरी क्रिया होने से पहले संकेत को संवेदक से अंदर केंद्रीय समन्वयक की ओर जाना चाहिए।"],
      "A reflex arc tracks a stimulus from the Receptor via a Sensory neuron to the Spinal cord, which processes it and commands an Effector organ through a Motor neuron.",
      "एक प्रतिवर्ती चाप उद्दीपन को ग्राही (Receptor) से संवेदी तंत्रिका कोशिका द्वारा मेरुरज्जु (Spinal cord) तक ले जाता है, जो इसका प्रसंस्करण करता है और प्रेरक तंत्रिका कोशिका द्वारा कार्यकर अंग (Effector) को आदेश देता है।",
      "hard", 1540
    ],

    ["10-sc-cc-03", ["brain-structure", "cerebellum", "voluntary"],
      "Which specific sub-region of the human brain regulates posture, body balance, and precision during voluntary activities like walking in a straight line?",
      "मानव मस्तिष्क का कौन सा विशिष्ट उप-भाग स्वैच्छिक क्रियाओं (जैसे सीधी रेखा में चलना) के दौरान मुद्रा, शारीरिक संतुलन और सटीकता को नियंत्रित करता है?",
      ["Cerebellum", "Medulla oblongata", "Pons", "Cerebrum"],
      ["अनुमस्तिष्क (Cerebellum)", "मध्यांश (Medulla oblongata)", "पॉन्स (Pons)", "प्रमस्तिष्क (Cerebrum)"],
      0,
      ["This cauliflower-shaped component is located at the back portion of the hindbrain.", "यह फूलगोभी के आकार का घटक पश्चमस्तिष्क के पिछले हिस्से में स्थित होता है।"],
      "The cerebellum is a part of the hindbrain responsible for coordinating fine motor movements, maintaining body equilibrium, and governing physical posture.",
      "अनुमस्तिष्क पश्चमस्तिष्क का एक हिस्सा है जो सूक्ष्म पेशीय गतिविधियों के समन्वय, शारीरिक संतुलन बनाए रखने और शारीरिक मुद्रा को नियंत्रित करने के लिए जिम्मेदार है।",
      "easy", 1410
    ],

    ["10-sc-cc-04", ["brain-structure", "medulla", "involuntary"],
      "Involuntary physiological activities such as blood pressure regulation, salivation, and vomiting are centrally governed by which anatomical region?",
      "अनैच्छिक शारीरिक गतिविधियाँ जैसे रक्तचाप नियंत्रण, लार आना और उल्टी होना, किस संरचनात्मक भाग द्वारा केंद्रीय रूप से नियंत्रित होती हैं?",
      ["Hypothalamus", "Medulla in the hindbrain", "Cerebrum forebrain", "Cerebellum"],
      ["हाइपोथैलेमस", "पश्चमस्तिष्क में स्थित मेडुला", "अग्रमस्तिष्क का प्रमस्तिष्क", "अनुमस्तिष्क"],
      1,
      ["It is the terminal base structure of the hindbrain that transitions continuously down into the spinal cord.", "यह पश्चमस्तिष्क की अंतिम आधार संरचना है जो निरंतर नीचे मेरुरज्जु में बदल जाती है।"],
      "The Medulla oblongata located in the hindbrain contains vital autonomic reflex centers that control blood pressure, salivation, swallowing, and vomiting.",
      "पश्चमस्तिष्क में स्थित मेडुला ऑबलांगेटा में महत्वपूर्ण स्वायत्त प्रतिवर्ती केंद्र होते हैं जो रक्तचाप, लार आना, निगलना और उल्टी को नियंत्रित करते हैं।",
      "medium", 1475
    ],

    ["10-sc-cc-05", ["plant-hormones", "auxin", "phototropism"],
      "When a growing plant detects light from one direction, how does the hormone Auxin structurally facilitate the plant's bending toward that light source?",
      "जब एक बढ़ता हुआ पौधा एक दिशा से आने वाले प्रकाश को महसूस करता है, तो ऑक्सिन (Auxin) हार्मोन संरचनात्मक रूप से उस प्रकाश स्रोत की ओर झुकने में कैसे सहायता करता है?",
      ["Auxin breaks down rapidly on the darker side of the plant stem", "Auxin clusters strictly on the illuminated side, halting all tissue growth", "Auxin diffuses toward the shaded side of the shoot, stimulating cells there to grow longer", "Auxin thickens the cell walls facing the light to pull the apex sideways"],
      ["पौधे के तने के अंधेरे वाले हिस्से में ऑक्सिन तेजी से टूट जाता है", "ऑक्सिन केवल प्रकाश वाले हिस्से में जमा होकर ऊतक विकास को रोक देता है", "ऑक्सिन प्ररोह (shoot) के छाया वाले हिस्से की ओर विसरित होकर वहाँ की कोशिकाओं को लंबा होने के लिए उद्दीप्त करता है", "ऑक्सिन प्रकाश के सामने वाली कोशिका भित्तियों को मोटा करता है ताकि शीर्ष को एक तरफ खींचा जा सके"],
      2,
      ["The cells on the side away from the light source grow faster than the cells directly exposed to light.", "प्रकाश स्रोत से दूर वाले हिस्से की कोशिकाएं सीधे प्रकाश के संपर्क में आने वाली कोशिकाओं की तुलना में तेजी से बढ़ती हैं।"],
      "Auxin is synthesized at the shoot tip and diffuses toward the shaded side. The high concentration of auxin on the shaded side causes those cells to elongate faster, bending the shoot toward light.",
      "ऑक्सिन का संश्लेषण प्ररोह के शीर्ष पर होता है और यह छाया वाले हिस्से की ओर विसरित हो जाता है। छाया वाले हिस्से में ऑक्सिन की उच्च सांद्रता वहाँ की कोशिकाओं को तेजी से लंबा करती है, जिससे प्ररोह प्रकाश की ओर झुक जाता है।",
      "hard", 1585
    ],

    ["10-sc-cc-06", ["plant-hormones", "abscisic-acid", "growth-inhibitor"],
      "Which of the following plant hormones serves as a growth inhibitor, directly promoting the wilting and falling of leaves?",
      "निम्नलिखित में से कौन सा पादप हार्मोन वृद्धि अवरोधक के रूप में कार्य करता है, जो सीधे पत्तियों के मुरझाने और गिरने को बढ़ावा देता है?",
      ["Gibberellin", "Cytokinin", "Auxin", "Abscisic acid"],
      ["जिब्बेरेलिन", "साइटोकाइनिन", "ऑक्सिन", "एब्सिसिक अम्ल (Abscisic acid)"],
      3,
      ["Its function is completely opposite to growth-promoting signals like auxins and gibberellins.", "इसका कार्य ऑक्सिन और जिब्बेरेलिन जैसे वृद्धि-प्रवर्तक संकेतों के बिल्कुल विपरीत है।"],
      "Abscisic acid (ABA) is a specialized plant growth inhibitor. It regulates stomatal closure during drought stress and signals leaf abscission and wilting.",
      "एब्सिसिक अम्ल (ABA) एक विशिष्ट पादप वृद्धि अवरोधक है। यह सूखे के तनाव के दौरान रंध्रों के बंद होने को नियंत्रित करता है और पत्तियों के झड़ने व मुरझाने का संकेत देता है।",
      "easy", 1420
    ],

    ["10-sc-cc-07", ["plant-hormones", "cytokinin", "cell-division"],
      "Which plant hormone is consistently found in exceptionally high concentrations inside zones of rapid cell division, such as developing fruits and seeds?",
      "कौन सा पादप हार्मोन तीव्र कोशिका विभाजन वाले क्षेत्रों, जैसे विकसित हो रहे फलों और बीजों के भीतर विशेष रूप से उच्च सांद्रता में पाया जाता है?",
      ["Cytokinin", "Auxin", "Abscisic acid", "Gibberellin"],
      ["साइटोकाइनिन (Cytokinin)", "ऑक्सिन", "एब्सिसिक अम्ल", "जिब्बेरेलिन"],
      0,
      ["The name of this hormone is fundamentally derived from the biological word for cytoplasmic division.", "इस हार्मोन का नाम मूल रूप से कोशिकाद्रव्य विभाजन (cytoplasmic division) के जैविक शब्द से लिया गया है।"],
      "Cytokinins promote active cell division (cytokinesis). Naturally, they are concentrated in tissues undergoing explosive mitotic growth like seeds, root tips, and fruits.",
      "साइटोकाइनिन सक्रिय कोशिका विभाजन (साइटोकाइनेसिस) को बढ़ावा देते हैं। स्वाभाविक रूप से, वे बीजों, जड़ों के सिरों और फलों जैसे विस्फोटक समसूत्री विभाजन (mitotic growth) से गुजरने वाले ऊतकों में केंद्रित होते हैं।",
      "easy", 1435
    ],

    ["10-sc-cc-08", ["animal-hormones", "thyroxine", "iodine"],
      "Why is the inclusion of iodized salt strictly recommended within our daily nutritional diet?",
      "हमारे दैनिक पोषण संबंधी आहार में आयोडीन युक्त नमक को शामिल करने की कड़ाई से सलाह क्यों दी जाती है?",
      ["Iodine acts as a co-enzyme to trigger insulin breakdown", "Iodine is indispensable for the thyroid gland to synthesize thyroxine hormone", "Iodine increases glucose levels inside blood plasma", "Iodine directly binds growth hormone molecules"],
      ["आयोडीन इंसुलिन के विखंडन को सक्रिय करने के लिए एक सह-एंजाइम के रूप में कार्य करता है", "थायराइड ग्रंथि द्वारा थायरोक्सिन हार्मोन के संश्लेषण के लिए आयोडीन अपरिहार्य है", "आयोडीन रक्त प्लाज्मा के भीतर ग्लूकोज के स्तर को बढ़ाता है", "आयोडीन सीधे वृद्धि हार्मोन के अणुओं को बांधता है"],
      1,
      ["Deficiency of this mineral element causes the neck region to swell up, a condition known as goitre.", "इस खनिज तत्व की कमी से गर्दन का क्षेत्र सूज जाता है, जिसे घेंघा (goitre) रोग कहा जाता है।"],
      "The thyroid gland requires iodine atoms to manufacture thyroxine. Thyroxine regulates carbohydrate, protein, and fat metabolism for optimal balanced growth.",
      "थायराइड ग्रंथि को थायरोक्सिन बनाने के लिए आयोडीन परमाणुओं की आवश्यकता होती है। थायरोक्सिन संतुलित विकास के लिए कार्बोहाइड्रेट, प्रोटीन और वसा के चयापचय को नियंत्रित करता है।",
      "easy", 1415
    ],

    ["10-sc-cc-09", ["animal-hormones", "adrenaline", "fight-or-flight"],
      "Which of the following physiological modifications does NOT occur inside the human body when Adrenaline is released into the bloodstream?",
      "जब एड्रीनेलीन (Adrenaline) को रक्तप्रवाह में स्रावित किया जाता है, तो मानव शरीर के भीतर निम्नलिखित में से कौन सा शारीरिक परिवर्तन नहीं होता है?",
      ["Heart rate and pumping force escalate sharply", "Blood supply shifts away from skin and digestive organs via vasoconstriction", "The overall breathing rate drops significantly through bronchial constriction", "Blood supply to skeletal muscle systems rises"],
      ["हृदय गति और पंपिंग बल तेजी से बढ़ते हैं", "वाहिकाप्रकीर्णन (vasoconstriction) द्वारा रक्त की आपूर्ति त्वचा और पाचन अंगों से दूर हो जाती है", "श्वसनिका संकुचन के माध्यम से समग्र श्वसन दर में काफी कमी आती है", "कंकाल पेशी प्रणालियों में रक्त की आपूर्ति बढ़ जाती है"],
      2,
      ["Adrenaline readies the organism to fight or run, requiring an increased intake of oxygen gas.", "एड्रीनेलीन जीव को लड़ने या भागने के लिए तैयार करता है, जिसके लिए ऑक्सीजन गैस के अधिक सेवन की आवश्यकता होती है।"],
      "Adrenaline increases heart rate and breathing rate (via relaxation of airway muscles) to maximize oxygen delivery to muscles. A decrease in breathing rate is false.",
      "एड्रीनेलीन मांसपेशियों को ऑक्सीजन की आपूर्ति अधिकतम करने के लिए हृदय गति और श्वसन दर (श्वसन मार्ग की मांसपेशियों को शिथिल करके) को बढ़ाता है। श्वसन दर में कमी आना गलत कथन है।",
      "medium", 1515
    ],

    ["10-sc-cc-10", ["feedback-mechanism", "insulin", "homeostasis"],
      "Hormonal discharge is tightly governed by feedback systems. When blood glucose concentrations surge, which cellular sensor detects it to initiate corrective action?",
      "हार्मोन का स्राव पुनर्भरण (feedback) प्रणालियों द्वारा कड़ाई से नियंत्रित होता है। जब रक्त में ग्लूकोज की सांद्रता बढ़ जाती है, तो कौन सा कोशिकीय संवेदक उपचारात्मक क्रिया शुरू करने के लिए इसका पता लगाता है?",
      ["Hepatic cells of the liver", "Pituitary somatotrophs", "Thyroid follicular clusters", "Beta cells of the Pancreas"],
      ["यकृत की हेपेटिक कोशिकाएं", "पिट्यूटरी सोमैटोट्रॉफ़्स", "थायराइड फॉलिक्युलर क्लस्टर", "अग्न्याशय (Pancreas) की बीटा कोशिकाएं"],
      3,
      ["This dual-function organ is situated just below the stomach cavity.", "यह दोहरे कार्य वाला अंग आमाशय के ठीक नीचे स्थित होता है।"],
      "An increase in blood sugar is detected by the cells of the pancreas, which respond by producing and releasing more insulin to reduce glucose concentrations to normal levels.",
      "रक्त में शर्करा की वृद्धि का पता अग्न्याशय की कोशिकाओं द्वारा लगाया जाता है, जो ग्लूकोज की सांद्रता को सामान्य स्तर पर लाने के लिए अधिक इंसुलिन का उत्पादन और स्राव करके प्रतिक्रिया करती हैं।",
      "medium", 1490
    ],

    ["10-sc-cc-11", ["coordination-modes", "electrical-impulses", "advanced"],
      "Why must multi-cellular organisms utilize endocrine chemical networks for system coordination rather than depending solely on nervous electrical impulses?",
      "बहुकोशिकीय जीवों को प्रणालीगत समन्वय के लिए केवल तंत्रिका विद्युत आवेगों पर निर्भर रहने के बजाय अंतःस्रावी रासायनिक नेटवर्क का उपयोग क्यों करना चाहिए?",
      ["Electrical impulses cannot reach every single cell continuously, and nerve cells need time to reset after an impulse", "Hormones move at much higher velocities than electrical potentials", "Nervous impulses structurally damage target receptors upon impact", "Hormones are restricted exclusively to brain tissue signaling"],
      ["विद्युत आवेग लगातार हर एक कोशिका तक नहीं पहुंच सकते हैं, और तंत्रिका कोशिकाओं को एक आवेग के बाद खुद को रीसेट करने के लिए समय चाहिए होता है", "हार्मोन विद्युत विभव की तुलना में बहुत अधिक वेग से चलते हैं", "तंत्रिका आवेग प्रभाव पड़ने पर लक्षित ग्राहियों को संरचनात्मक रूप से क्षतिग्रस्त कर देते हैं", "हार्मोन विशेष रूप से केवल मस्तिष्क के ऊतकों के संकेतों तक सीमित होते हैं"],
      0,
      ["Nerve fibers innervate specific points, and electrochemical polarization cannot remain activated non-stop.", "तंत्रिका तंतु विशिष्ट बिंदुओं को तंत्रिका आपूर्ति प्रदान करते हैं, और विद्युत-रासायनिक ध्रुवीकरण बिना रुके सक्रिय नहीं रह सकता।"],
      "Electrical impulses reach only cells connected by nervous tissue. Also, a neuron cannot generate a new impulse until it resets its polarized state. Chemical hormones bypass this by diffusing to all cells.",
      "विद्युत आवेग केवल तंत्रिका ऊतक से जुड़ी कोशिकाओं तक ही पहुँचते हैं। इसके अलावा, एक न्यूरॉन तब तक नया आवेग उत्पन्न नहीं कर सकता जब तक कि वह अपनी ध्रुवित अवस्था को रीसेट न कर ले। रासायनिक हार्मोन सभी कोशिकाओं में विसरित होकर इस कमी को पूरा करते हैं।",
      "hard", 1610
    ],

    ["10-sc-cc-12", ["plant-movements", "nastic", "mimosa-pudica"],
      "The instantaneous drooping and folding of leaves observed in the sensitive plant (Mimosa pudica) upon touch is an analytical example of:",
      "छूने पर छुईमुई के पौधे (Mimosa pudica) की पत्तियों का तुरंत झुकना और मुड़ना किसका एक विश्लेषणात्मक उदाहरण है?",
      ["Positive thigmotropism driven by asymmetric growth", "Nastic movement entirely independent of growth directional axes", "Negative hydrotropism caused by cellular division", "Chemotropic realignment of cell membranes"],
      ["असममित विकास द्वारा संचालित धनात्मक स्पर्शानुवर्तन (thigmotropism)", "वृद्धि की दिशात्मक अक्षों से पूरी तरह स्वतंत्र अनुकुंचन (Nastic) गति", "कोशिकीय विभाजन के कारण होने वाला ऋणात्मक जलानुवर्तन", "कोशिका झिल्लियों का रसायनानुवर्तनी संरेखण"],
      1,
      ["The plant moves rapidly by shifting water volumes out of specific cell layers without growing new tissues.", "पौधा नए ऊतकों को उगाए बिना विशिष्ट कोशिका परतों से पानी की मात्रा को बाहर निकालकर तेजी से गति करता है।"],
      "The movement of Mimosa pudica occurs due to changes in turgor pressure inside leaf cushions (pulvini) upon stimulus. It does not involve growth, making it a non-directional nastic movement.",
      "छुईमुई की गति उद्दीपन मिलने पर पत्तियों के आधार (पल्विनी) के भीतर स्फीति दाब (turgor pressure) में परिवर्तन के कारण होती है। इसमें वृद्धि शामिल नहीं होती है, जिससे यह एक गैर-दिशात्मक अनुकुंचन गति बन जाती है।",
      "medium", 1480
    ],

    ["10-sc-cc-13", ["tropic-movements", "chemotropism", "reproduction"],
      "The slow directional growth elongation of pollen tubes towards embryonic ovules inside a flower is classified as which movement?",
      "एक फूल के भीतर भ्रूणीय बीजांडों (ovules) की ओर पराग नलिकाओं की धीमी दिशात्मक वृद्धि को किस गति के रूप में वर्गीकृत किया जाता है?",
      ["Hydrotropism", "Geotropism", "Chemotropism", "Phototropism"],
      ["जलानुवर्तन (Hydrotropism)", "गुरुत्वानुवर्तन (Geotropism)", "रसायनानुवर्तन (Chemotropism)", "प्रकाशनुवर्तन (Phototropism)"],
      2,
      ["This physiological response is guided by specific chemical substances secreted by the target ovule structures.", "यह शारीरिक प्रतिक्रिया लक्षित बीजांड संरचनाओं द्वारा स्रावित विशिष्ट रासायनिक पदार्थों द्वारा निर्देशित होती है।"],
      "Chemotropism is the growth movement of plant parts in response to a chemical stimulus. The growth of a pollen tube down the style toward the ovule is driven by chemical attractants.",
      "रसायनानुवर्तन रासायनिक उद्दीपन के जवाब में पादप अंगों की वृद्धि गति है। बीजांड की ओर वर्तिका से नीचे पराग नलिका का बढ़ना रासायनिक आकर्षक पदार्थों द्वारा संचालित होता है।",
      "easy", 1440
    ],

    ["10-sc-cc-14", ["brain-protection", "meninges", "fluid"],
      "The human brain is protected from severe mechanical jolts and shocks by a cushioning layer of fluid contained within a skeletal framework. What is this liquid matrix called?",
      "मानव मस्तिष्क को एक कंकाल के ढांचे के भीतर मौजूद तरल की एक सुरक्षात्मक परत द्वारा गंभीर यांत्रिक झटकों से बचाया जाता है। इस तरल मैट्रिक्स को क्या कहा जाता है?",
      ["Intercellular interstitial plasma", "Pericardial exudate", "Amniotic fluid tissue", "Cerebrospinal fluid"],
      ["अंतर-कोशिकीय अंतराली प्लाज्मा", "पेरीकार्डियल एक्सयूडेट", "एम्नियोटिक द्रव ऊतक", "मस्तिष्क-मेरुद्रव (Cerebrospinal fluid)"],
      3,
      ["This specialized fluid also circulates along the central canal of the spinal cord.", "यह विशिष्ट तरल मेरुरज्जु की केंद्रीय वाहिनी के साथ भी परिसंचरण करता है।"],
      "The brain sits inside a fluid-filled balloon structure known as cerebrospinal fluid (CSF), which resides inside the meninges membranes, acting as a shock absorber.",
      "मस्तिष्क एक तरल से भरे गुब्बारे जैसी संरचना के भीतर स्थित होता है जिसे मस्तिष्क-मेरुद्रव (CSF) कहा जाता है, जो मेनिन्जेस झिल्लियों के अंदर रहता है और एक शॉक एब्जॉर्बर के रूप में कार्य करता है।",
      "medium", 1465
    ],

    ["10-sc-cc-15", ["spinal-cord", "anatomy", "medulla"],
      "From which specific hindbrain segment does the elongated spinal cord track originate and continue downwards?",
      "लम्बी मेरुरज्जु (spinal cord) का मार्ग पश्चमस्तिष्क के किस विशिष्ट खंड से उत्पन्न होकर नीचे की ओर जारी रहता है?",
      ["Medulla", "Cerebrum", "Cerebellum", "Pons"],
      ["मेडुला (Medulla)", "प्रमस्तिष्क (Cerebrum)", "अनुमस्तिष्क (Cerebellum)", "पॉन्स (Pons)"],
      0,
      ["This structure contains the brain's autonomous cardiorespiratory reflex centers.", "इस संरचना में मस्तिष्क के स्वायत्त कार्डियोरेस्पिरेटरी प्रतिवर्ती केंद्र होते हैं।"],
      "The medulla oblongata forms the base of the brainstem. It extends continuously out from the cranium aperture to form the spinal cord, enclosed within the vertebral column.",
      "मेडुला ऑबलांगेटा ब्रेनस्टेम का आधार बनाता है। यह कशेरुक दंड (vertebral column) के भीतर सुरक्षित मेरुरज्जु बनाने के लिए कपाल के छिद्र से बाहर निरंतर फैला होता है।",
      "easy", 1410
    ],

    ["10-sc-cc-16", ["geotropism", "plant-growth", "roots"],
      "Plant shoots exhibit negative geotropism while their roots demonstrate positive geotropism. What does positive geotropism directly mean?",
      "पौधों के प्ररोह ऋणात्मक गुरुत्वानुवर्तन प्रदर्शित करते हैं जबकि उनकी जड़ें धनात्मक गुरुत्वानुवर्तन दर्शाती हैं। धनात्मक गुरुत्वानुवर्तन का प्रत्यक्ष अर्थ क्या है?",
      ["Growth movement away from moisture reservoirs", "Growth movement downward in the direction of gravity's pull", "Growth orientation toward localized warmth zones", "Chemical avoidance of sub-soil toxins"],
      ["नमी के भंडारों से दूर वृद्धि गति", "गुरुत्वाकर्षण के खिंचाव की दिशा में नीचे की ओर वृद्धि गति", "स्थानीयकृत गर्मी वाले क्षेत्रों की ओर वृद्धि अभिविन्यास", "उप-मृदा विषाक्त पदार्थों से रासायनिक बचाव"],
      1,
      ["Think about why root networks plunge deep into the center of the earth matrix.", "सोचें कि क्यों जड़ प्रणालियाँ पृथ्वी मैट्रिक्स के केंद्र में गहराई तक जाती हैं।"],
      "Positive geotropism is the downward growth movement of plant organs (like roots) toward the vector force of gravity, anchoring the organism.",
      "धनात्मक गुरुत्वानुवर्तन गुरुत्वाकर्षण के खिंचाव बल की ओर पादप अंगों (जैसे जड़ों) की नीचे की ओर होने वाली वृद्धि गति है, जो जीव को स्थिरता प्रदान करती है।",
      "easy", 1405
    ],

    ["10-sc-cc-17", ["pituitary", "growth-hormone", "endocrine"],
      "Dwarfism in human individuals is linked to a developmental deficiency during childhood. Identify the responsible hormone and its secreting gland.",
      "मानव व्यक्तियों में बौनापन (Dwarfism) बचपन के दौरान एक विकासात्मक कमी से जुड़ा हुआ है। जिम्मेदार हार्मोन और उसके स्राव करने वाली ग्रंथि की पहचान कीजिए।",
      ["Thyroxine from the Thyroid follicular framework", "Insulin from the Pancreatic islets", "Growth Hormone from the anterior Pituitary gland", "Adrenaline from the Adrenal cortex"],
      ["थायराइड कूपिक ऊतकों से थायरोक्सिन", "अग्न्याशयी आइलेट्स से इंसुलिन", "अग्र पिट्यूटरी (पीयूष) ग्रंथि से वृद्धि हार्मोन (Growth Hormone)", "एड्रिनल कॉर्टेक्स से एड्रीनेलीन"],
      2,
      ["This master gland is suspended directly underneath the brain's hypothalamus infrastructure.", "यह मास्टर ग्रंथि मस्तिष्क के हाइपोथैलेमस के ठीक नीचे लटकी होती है।"],
      "Growth hormone regulates the expansion and development of bones and muscle tissues. Hyposecretion of growth hormone by the pituitary gland during childhood triggers dwarfism.",
      "वृद्धि हार्मोन हड्डियों और मांसपेशियों के विकास को नियंत्रित करता है। बचपन के दौरान पिट्यूटरी (पीयूष) ग्रंथि द्वारा वृद्धि हार्मोन के कम स्राव (hyposecretion) से बौनापन होता है।",
      "easy", 1412
    ],

    ["10-sc-cc-18", ["neuron-conduction", "direction", "impulse"],
      "Within a single neural pathway, electrochemical signals travel in a strict, unalterable directional path. Map the correct route.",
      "एक एकल तंत्रिका मार्ग के भीतर, विद्युत-रासायनिक संकेत एक सख्त, अपरिवर्तनीय दिशात्मक मार्ग में यात्रा करते हैं। सही मार्ग का निर्धारण कीजिए।",
      ["Axon -> Dendrite -> Cell body -> Axon terminal branch", "Cell body -> Axon core -> Dendrite -> Terminal tip", "Axon terminal -> Axon -> Cell body -> Dendrite mesh", "Dendrite -> Cell body -> Axon -> Axon terminal"],
      ["अक्षतंतु -> द्रुमाकृति -> कोशिका काय -> अक्षतंतु का अंतिम सिरा", "कोशिका काय -> अक्षतंतु -> द्रुमाकृति -> अंतिम सिरा", "अक्षतंतु का अंतिम सिरा -> अक्षतंतु -> कोशिका काय -> द्रुमाकृति", "द्रुमाकृति -> कोशिका काय -> अक्षतंतु -> अक्षतंतु का अंतिम सिरा"],
      3,
      ["The input is collected by the root-like receiving branches before being propelled down the transmission cable.", "ट्रांसमिशन केबल से नीचे भेजे जाने से पहले इनपुट को जड़ जैसी प्राप्त करने वाली शाखाओं द्वारा एकत्र किया जाता है।"],
      "Information is acquired at the dendrite tip, moves as an electrical impulse across the cell body down the longitudinal length of the axon, and exits at the axon terminal.",
      "सूचना द्रुमाकृति (dendrite) के सिरे पर प्राप्त की जाती है, एक विद्युत आवेग के रूप में कोशिका काय से होते हुए अक्षतंतु (axon) की लंबाई के साथ आगे बढ़ती है, और अक्षतंतु के अंतिम सिरे पर समाप्त होती है।",
      "medium", 1495
    ],

    ["10-sc-cc-19", ["receptors", "gustatory", "olfactory"],
      "Which pair of specialized neuro-sensory receptors is dedicated to evaluating taste inputs and odor chemicals respectively?",
      "विशिष्ट तंत्रिका-संवेदी ग्राहियों (receptors) का कौन सा जोड़ा क्रमशः स्वाद और गंध के रसायनों का मूल्यांकन करने के लिए समर्पित है?",
      ["Gustatory receptors and Olfactory receptors", "Olfactory receptors and Gustatory receptors", "Photoreceptors and Thigmoreceptors", "Gustatory receptors and Auditory nodes"],
      ["रससंवेदी ग्राही (Gustatory) और घ्राणग्राही (Olfactory)", "घ्राणग्राही और रससंवेदी ग्राही", "प्रकाशग्राही और स्पर्शग्राही", "रससंवेदी ग्राही और श्रवण नोड्स"],
      0,
      ["The sensory cells evaluating taste are located on the tongue surface, while smell sensors reside inside nasal passages.", "स्वाद का मूल्यांकन करने वाली संवेदी कोशिकाएं जीभ की सतह पर स्थित होती हैं, जबकि गंध के सेंसर नाक के मार्ग के भीतर होते हैं।"],
      "Gustatory receptors detect dissolved chemicals to perceive taste, while olfactory receptors detect volatile environmental molecules to perceive smell.",
      "रससंवेदी ग्राही स्वाद का पता लगाने के लिए घुले हुए रसायनों को पहचानते हैं, जबकि घ्राणग्राही गंध को पहचानने के लिए हवा में मौजूद अणुओं का पता लगाते हैं।",
      "easy", 1425
    ],

    ["10-sc-cc-20", ["hypothalamus", "brain", "homeostasis"],
      "Which neurological center serves as the main structural interface between the nervous and endocrine systems via the pituitary, while also controlling hunger sensations?",
      "कौन सा तंत्रिका केंद्र पिट्यूटरी के माध्यम से तंत्रिका और अंतःस्रावी प्रणालियों के बीच मुख्य संरचनात्मक इंटरफ़ेस के रूप में कार्य करता है, और भूख की संवेदनाओं को भी नियंत्रित करता है?",
      ["Cerebrum upper shell", "Hypothalamus", "Pons mid-zone", "Medulla core"],
      ["प्रमस्तिष्क का ऊपरी भाग", "हाइपोथैलेमस (Hypothalamus)", "पॉन्स का मध्य क्षेत्र", "मेडुला कोर"],
      1,
      ["It is located at the base floor of the forebrain structure, controlling core metabolic behaviors.", "यह अग्रमस्तिष्क संरचना के आधार पर स्थित होता है, जो मुख्य चयापचय व्यवहारों को नियंत्रित करता है।"],
      "The hypothalamus integrates neuro-sensory inputs and dictates pituitary hormonal operations. It also holds homeostatic centers managing body temperature, thirst, and hunger.",
      "हाइपोथैलेमस तंत्रिका-संवेदी इनपुट का समन्वय करता है और पिट्यूटरी के हार्मोनल कार्यों को निर्देशित करता है। इसमें शरीर के तापमान, प्यास और भूख को नियंत्रित करने वाले केंद्र भी होते हैं।",
      "hard", 1560
    ],

    ["10-sc-cc-21", ["hydrotropism", "tropic-movements", "advanced"],
      "During experimental assessments of Hydrotropism, plant root systems bend aggressively toward moisture zones even when forced to grow against gravity vectors. What does this reveal?",
      "जलानुवर्तन (Hydrotropism) के प्रयोगात्मक मूल्यांकनों के दौरान, पौधों की जड़ प्रणालियाँ गुरुत्वाकर्षण के विपरीत बढ़ने के लिए मजबूर होने पर भी नमी वाले क्षेत्रों की ओर तेजी से झुकती हैं। यह क्या दर्शाता है?",
      ["Phototropism completely suppresses hydrotropic responses", "Hydrotropism is structurally weaker than geotropic responses", "Hydrotropic growth responses can dominate and override geotropic growth inputs", "Plant root frameworks are negatively hydrotropic"],
      ["प्रकाशनुवर्तन पूरी तरह से जलानुवर्ती प्रतिक्रियाओं को दबा देता है", "जलानुवर्तन संरचनात्मक रूप से गुरुत्वानुवर्ती प्रतिक्रियाओं की तुलना में कमजोर होता है", "जलानुवर्ती वृद्धि प्रतिक्रियाएं गुरुत्वानुवर्ती वृद्धि इनपुट पर हावी हो सकती हैं", "पौधों की जड़ संरचनाएं ऋणात्मक जलानुवर्ती होती हैं"],
      2,
      ["The survival need to acquire water outbalances the alignment rules imposed by gravity fields.", "पानी प्राप्त करने की उत्तरजीविता की आवश्यकता गुरुत्वाकर्षण क्षेत्रों द्वारा लगाए गए नियमों से अधिक महत्वपूर्ण होती है।"],
      "Hydrotropism guides roots toward water sources. When moisture gradients conflict with gravitational alignment, hydrotropic forces override geotropic signaling to secure hydration.",
      "जलानुवर्तन जड़ों को पानी के स्रोतों की ओर निर्देशित करता है। जब नमी का अंतर गुरुत्वाकर्षण के संरेखण के साथ संघर्ष करता है, तो जलानुवर्ती बल जड़ों को हाइड्रेटेड रखने के लिए गुरुत्वानुवर्ती संकेतों पर हावी हो जाते हैं।",
      "hard", 1625
    ],

    ["10-sc-cc-22", ["gonads", "puberty", "hormones"],
      "The development of secondary sexual characteristics during puberty in human males and human females is driven by which hormonal combination respectively?",
      "मानव पुरुषों और मानव महिलाओं में यौवन (puberty) के दौरान द्वितीयक लैंगिक लक्षणों का विकास क्रमशः किस हार्मोनल संयोजन द्वारा संचालित होता है?",
      ["Insulin and Thyroxine mix", "Adrenaline and Progesterone profile", "Growth Hormone and Estrogen core", "Testosterone and Estrogen"],
      ["इंसुलिन और थायरोक्सिन का मिश्रण", "एड्रीनेलीन और प्रोजेस्टेरोन प्रोफाइल", "वृद्धि हार्मोन और एस्ट्रोजन", "टेस्टोस्टेरोन और एस्ट्रोजन"],
      3,
      ["These steroid hormones are manufactured by the male testes and female ovarian structures.", "इन स्टेरॉयड हार्मोन का निर्माण पुरुष के वृषण (testes) और महिला की अंडाशय (ovarian) संरचनाओं द्वारा किया जाता है।"],
      "Testosterone secreted by male testes induces male pubertal shifts. Estrogen secreted by female ovaries governs female structural developments at puberty.",
      "पुरुषों के वृषण द्वारा स्रावित टेस्टोस्टेरोन पुरुषों में यौवन के परिवर्तनों को प्रेरित करता है। महिलाओं के अंडाशय द्वारा स्रावित एस्ट्रोजन यौवन के समय महिलाओं के शारीरिक परिवर्तनों को नियंत्रित करता है।",
      "easy", 1418
    ],

    ["10-sc-cc-23", ["cns", "anatomy", "components"],
      "The Central Nervous System (CNS) architecture within the human anatomy is composed of which structural elements?",
      "मानव शरीर रचना के भीतर केंद्रीय तंत्रिका तंत्र (CNS) की वास्तुकला किन संरचनात्मक तत्वों से बनी है?",
      ["Brain and Spinal Cord network", "Cranial nerves and Spinal nerve branches", "Autonomic fibers and Peripheral cords", "Cerebrum and Cerebellum cortex only"],
      ["मस्तिष्क और मेरुरज्जु (Brain and Spinal Cord) का नेटवर्क", "कपाल तंत्रिकाएं और मेरु तंत्रिका की शाखाएं", "स्वायत्त तंतु और परिधीय डोरियाँ", "केवल प्रमस्तिष्क और अनुमस्तिष्क प्रांतस्था"],
      0,
      ["This core system acts as the central processing command unit protected within the skull and spine.", "यह मुख्य प्रणाली खोपड़ी और रीढ़ के भीतर सुरक्षित केंद्रीय प्रसंस्करण कमांड इकाई के रूप में कार्य करती है।"],
      "The Central Nervous System consists of the Brain and the Spinal cord. It collects, integrates, and processes systemic information to output behavioral commands.",
      "केंद्रीय तंत्रिका तंत्र में मस्तिष्क और मेरुरज्जु शामिल हैं। यह व्यवहार संबंधी आदेश देने के लिए शारीरिक जानकारी एकत्र, एकीकृत और संसाधित करता है।",
      "easy", 1400
    ],

    ["10-sc-cc-24", ["pns", "anatomy", "nerves"],
      "The Peripheral Nervous System (PNS) bridges communication pathways between the CNS and bodily organs. What are its fundamental structural parts?",
      "परिधीय तंत्रिका तंत्र (PNS) केंद्रीय तंत्रिका तंत्र (CNS) और शारीरिक अंगों के बीच संचार मार्गों को जोड़ता है। इसके मूलभूत संरचनात्मक भाग क्या हैं?",
      ["The biological mass of Brain and Spinal Cord tissue", "Cranial nerves emerging from brain and Spinal nerves originating from spinal cord", "Sympathetic motor pathways exclusively", "Meninges sheets and cerebral ventricles"],
      ["मस्तिष्क और मेरुरज्जु ऊतक का जैविक द्रव्यमान", "मस्तिष्क से निकलने वाली कपाल तंत्रिकाएं (Cranial nerves) और मेरुरज्जु से उत्पन्न होने वाली मेरु तंत्रिकाएं (Spinal nerves)", "विशेष रूप से केवल अनुकंपी (Sympathetic) मोटर मार्ग", "मेनिन्जेस परतें और प्रमस्तिष्क निलय"],
      1,
      ["These long fiber bundles radiate directly outward from the cranium and vertebral channel.", "ये लंबे तंतु बंडल कपाल और कशेरुकी वाहिनी से सीधे बाहर की ओर फैले होते हैं।"],
      "The PNS contains all peripheral nerves: 12 pairs of cranial nerves branched from the brain base, and 31 pairs of spinal nerves spanning out from the spinal cord.",
      "परिधीय तंत्रिका तंत्र (PNS) में सभी परिधीय तंत्रिकाएं शामिल हैं: मस्तिष्क के आधार से निकलने वाली कपाल तंत्रिकाओं के 12 जोड़े, और मेरुरज्जु से बाहर निकलने वाली मेरु तंत्रिकाओं के 31 जोड़े।",
      "medium", 1520
    ],

    ["10-sc-cc-25", ["plant-hormones", "gibberellin", "stem-elongation"],
      "Which specific plant hormone acts in synergy with auxins to accelerate stem growth by promoting active cell elongation?",
      "कौन सा विशिष्ट पादप हार्मोन कोशिकाओं के सक्रिय खिंचाव को बढ़ावा देकर तने के विकास को तेज करने के लिए ऑक्सिन के साथ मिलकर कार्य करता है?",
      ["Abscisic acid", "Cytokinin node", "Gibberellin", "Ethylene vapor"],
      ["एब्सिसिक अम्ल", "साइटोकाइनिन नोड", "जिब्बेरेलिन (Gibberellin)", "एथिलीन वाष्प"],
      2,
      ["This hormone family is heavily involved in triggering seed germination and breaking dormancy.", "यह हार्मोन परिवार बीज के अंकुरण को सक्रिय करने और सुशुप्तावस्था (dormancy) को तोड़ने में बहुत शामिल होता है।"],
      "Gibberellins stimulate longitudinal stem growth, cell elongation, and break bud dormancy. They assist auxins in driving upward growth trends.",
      "जिब्बेरेलिन तने के सीधे विकास, कोशिकाओं के लंबे होने और कली की सुशुप्तावस्था को तोड़ने में मदद करते हैं। वे ऊपर की ओर होने वाले विकास को बढ़ावा देने में ऑक्सिन की सहायता करते हैं।",
      "medium", 1450
    ],

    ["10-sc-cc-26", ["neurons", "sensory", "reflex-action"],
      "When your finger accidentally makes contact with a scorching hot object, which functional nerve fiber carries that urgent somatic signal from skin receptors into the spinal cord?",
      "जब आपकी उंगली दुर्घटनावश किसी अत्यधिक गर्म वस्तु के संपर्क में आती है, तो कौन सा कार्यात्मक तंत्रिका तंतु त्वचा के ग्राहियों से उस आवश्यक संकेत को मेरुरज्जु में ले जाता है?",
      ["Motor efferent neuron", "Cranial facial pathway", "Interneuron relay bridge", "Sensory afferent neuron"],
      ["प्रेरक अपवाही (Motor efferent) तंत्रिका कोशिका", "कपाल चेहरे का मार्ग", "इंटरन्यूरॉन रिले ब्रिज", "संवेदी अभिवाही (Sensory afferent) तंत्रिका कोशिका"],
      3,
      ["This category of neurons conducts inbound impulses directed toward the central integrating centers.", "तंत्रिका कोशिकाओं की यह श्रेणी केंद्रीय एकीकृत केंद्रों की ओर निर्देशित आने वाले आवेगों का संचालन करती है।"],
      "Sensory (or afferent) neurons convert external physical stimuli into internal electrical impulses, carrying them toward the central nervous processing system.",
      "संवेदी (या अभिवाही) तंत्रिका कोशिकाएं बाहरी भौतिक उद्दीपन को आंतरिक विद्युत आवेगों में बदल देती हैं, और उन्हें केंद्रीय तंत्रिका प्रसंस्करण प्रणाली की ओर ले जाती हैं।",
      "medium", 1485
    ],

    ["10-sc-cc-27", ["voluntary-action", "forebrain", "control"],
      "Which of the following neural actions represents a true voluntary response consciously directed by the human forebrain?",
      "निम्नलिखित में से कौन सी तंत्रिका क्रिया मानव अग्रमस्तिष्क द्वारा सचेत रूप से निर्देशित एक वास्तविक स्वैच्छिक प्रतिक्रिया का प्रतिनिधित्व करती है?",
      ["Writing down a conceptual answer on an examination sheet", "Rhythmic contractions of cardiac muscle tissue", "Peristaltic moving of food masses inside the esophagus", "Pupil constriction under blinding flash conditions"],
      ["परीक्षा की शीट पर एक वैचारिक उत्तर लिखना", "हृदय के पेशी ऊतकों का लयबद्ध संकुचन", "ग्रासनली के भीतर भोजन के द्रव्यमान की क्रमाकुंचन (Peristaltic) गति", "तेज रोशनी की स्थिति में पुतली का सिकुड़ना"],
      0,
      ["This behavior requires active intellectual cognitive intent governed by the cerebral cortex.", "इस व्यवहार के लिए प्रमस्तिष्क प्रांतस्था (cerebral cortex) द्वारा नियंत्रित सक्रिय बौद्धिक संज्ञानात्मक इरादे की आवश्यकता होती है।"],
      "Writing is a voluntary task controlled consciously by the cerebrum in the forebrain. Heartbeats, peristalsis, and pupil reflexes are involuntary processes handled by autonomic sub-centers.",
      "लिखना एक स्वैच्छिक कार्य है जिसे अग्रमस्तिष्क में प्रमस्तिष्क द्वारा सचेत रूप से नियंत्रित किया जाता है। दिल की धड़कन, क्रमाकुंचन और पुतली की प्रतिक्रियाएं स्वायत्त उप-केंद्रों द्वारा संभाली जाने वाली अनैच्छिक प्रक्रियाएं हैं।",
      "easy", 1410
    ],

    ["10-sc-cc-28", ["insulin", "diabetes", "pancreas"],
      "A clinical patient diagnosed with acute Diabetes mellitus is prescribed routine therapeutic injections of Insulin by their doctor because:",
      "गंभीर मधुमेह (Diabetes mellitus) से पीड़ित एक रोगी को उसके डॉक्टर द्वारा इंसुलिन के नियमित उपचारात्मक इंजेक्शन लेने की सलाह दी जाती है क्योंकि:",
      ["Their arterial blood pressure is exceptionally low", "Their blood sugar concentration is dangerously high due to hyposecretion of insulin", "Their basal metabolic rate must be artificially slowed down", "Their body is unable to synthesize cellular thyroxine molecules"],
      ["उनका धमनी रक्तचाप असाधारण रूप से कम है", "इंसुलिन के कम स्राव के कारण उनके रक्त में शर्करा की सांद्रता खतरनाक रूप से उच्च है", "उनके बेसल चयापचय दर को कृत्रिम रूप से धीमा किया जाना चाहिए", "उनका शरीर कोशिकीय थायरोक्सिन अणुओं का संश्लेषण करने में असमर्थ है"],
      1,
      ["This pancreatic hormone acts to lower circulating blood glucose levels by helping cells absorb it.", "यह अग्न्याशयी हार्मोन कोशिकाओं को ग्लूकोज अवशोषित करने में मदद करके रक्त में परिसंचरण करने वाले ग्लूकोज के स्तर को कम करने का कार्य करता है।"],
      "Insulin lowers blood sugar. In diabetes patients, the pancreas fails to produce sufficient insulin, elevating blood glucose to hazardous levels. Exogenous insulin injections help re-establish healthy baselines.",
      "इंसुलिन रक्त शर्करा को कम करता है। मधुमेह के रोगियों में, अग्न्याशय पर्याप्त इंसुलिन का उत्पादन करने में विफल रहता है, जिससे रक्त में ग्लूकोज खतरनाक स्तर तक बढ़ जाता है। बाहरी इंसुलिन के इंजेक्शन स्वस्थ सामान्य स्तर को फिर से स्थापित करने में मदद करते हैं।",
      "easy", 1430
    ],

    ["10-sc-cc-29", ["thigmotropism", "tendrils", "plant-mechanics"],
      "The tendrils of climbing plants encircle a wooden support grid immediately upon contact. What cellular growth dynamic causes this curling movement?",
      "चढ़ने वाले पौधों के प्रतान (tendrils) संपर्क में आते ही लकड़ी के सहारे के ग्रिड को घेर लेते हैं। कौन सी कोशिकीय वृद्धि गति इस घुमावदार गति का कारण बनती है?",
      ["Rapid cellular division rates exploding restrictedly on the side of tendril touching support", "Auxin molecules destroying plant tissues located at the contact point", "Rapid elongation of cells on the outer side of the tendril away from the support source", "Gravitational force pulling down the tendril's inner surface layers"],
      ["सहारे को छूने वाले प्रतान के हिस्से पर तीव्र कोशिकीय विभाजन की दर का बढ़ना", "संपर्क बिंदु पर स्थित पादप ऊतकों को नष्ट करने वाले ऑक्सिन अणु", "सहारे के स्रोत से दूर प्रतान के बाहरी हिस्से की कोशिकाओं का तेजी से लंबा होना", "प्रतान की आंतरिक सतह परतों को नीचे खींचने वाला गुरुत्वाकर्षण बल"],
      2,
      ["The part of the tendril in contact with the object does not grow as rapidly as the part away from the object.", "वस्तु के संपर्क में रहने वाला प्रतान का हिस्सा उतनी तेजी से नहीं बढ़ता है जितनी तेजी से वस्तु से दूर वाला हिस्सा बढ़ता है।"],
      "When a tendril contacts a support, auxin shifts to the outer side away from the object. This causes the outer cells to elongate much faster than the inner contact cells, resulting in a wrap around the object.",
      "जब कोई प्रतान किसी सहारे के संपर्क में आता है, तो ऑक्सिन वस्तु से दूर बाहरी हिस्से की ओर स्थानांतरित हो जाता है। इसके कारण बाहरी कोशिकाएं आंतरिक संपर्क कोशिकाओं की तुलना में बहुत तेजी से लंबी होती हैं, जिसके परिणामस्वरूप प्रतान वस्तु के चारों ओर लिपट जाता है।",
      "hard", 1615
    ],

    ["10-sc-cc-30", ["pons", "hindbrain", "respiration"],
      "Which specific sub-anatomical block of the hindbrain is directly involved in cooperating with the medulla to regulate the respiratory cycle?",
      "पश्चमस्तिष्क का कौन सा विशिष्ट उप-संरचनात्मक भाग श्वसन चक्र को नियंत्रित करने के लिए मेडुला के साथ सहयोग करने में सीधे शामिल होता है?",
      ["Cerebellum outer ridge", "Cerebrum sensory cortex", "Medulla oblongata exclusively without assist", "Pons"],
      ["अनुमस्तिष्क का बाहरी भाग", "प्रमस्तिष्क संवेदी प्रांतस्था", "बिना किसी सहायता के विशेष रूप से केवल मेडुला ऑबलांगेटा", "पॉन्स (Pons)"],
      3,
      ["Its name means 'bridge' in Latin, connecting different brain architectures together.", "लैटिन में इसके नाम का अर्थ 'पुल' (bridge) होता है, जो मस्तिष्क की विभिन्न संरचनाओं को एक साथ जोड़ता है।"],
      "The Pons is a part of the hindbrain that contains pneumotaxic and apneustic centers, working closely with the medulla to regulate and stabilize the rate of breathing.",
      "पॉन्स पश्चमस्तिष्क का एक हिस्सा है जिसमें न्यूमोटैक्सिक और एप्न्यूस्टिक केंद्र होते हैं, जो श्वास की दर को नियंत्रित और स्थिर करने के लिए मेडुला के साथ मिलकर काम करते हैं।",
      "hard", 1575
    ]
  ])
}









  
];

export { class10ScienceQuestionBank };
