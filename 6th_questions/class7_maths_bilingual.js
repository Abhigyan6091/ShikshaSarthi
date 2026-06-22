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
  difficulty = "easy",
  eloRating = 900,
  interval = 10,
  marks = 1,
  negativeMarks = 0,
}) => ({
  id,
  subjectId: "7-maths",
  class: 7,
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
      hintsHindi,
      explanation,
      explanationHindi,
      difficulty,
      eloRating,
    ]) => {
      const variantPrompts = [
        [
          question,
          questionHindi,
          difficulty,
          eloRating,
        ],
        [
          "Which of the following is correct?",
          "निम्नलिखित में से कौन-सा सही है?",
          difficulty,
          eloRating + 5,
        ],
        [
          "Choose the best answer.",
          "सबसे उपयुक्त उत्तर चुनिए।",
          "medium",
          eloRating + 10,
        ],
        [
          "Select the correct statement.",
          "सही कथन का चयन कीजिए।",
          "medium",
          eloRating + 15,
        ],
      ];

      return variantPrompts.map(
        (
          [
            variantQuestion,
            variantQuestionHindi,
            variantDifficulty,
            variantElo,
          ],
          index
        ) =>
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
            hintsHindi,
            explanation,
            explanationHindi,
            difficulty: variantDifficulty,
            eloRating: variantElo,
          })
      );
    }
    );
const class7MathematicsQuestionBank = [
  // Chapter 1: Integers
  // Chapter 2: Fractions and Decimals
  // Chapter 3: Data Handling
  // Chapter 4: Simple Equations
  // Chapter 5: Lines and Angles
  // Chapter 6: The Triangle and its Properties
  // Chapter 7: Congruence of Triangles
  // Chapter 8: Comparing Quantities
  // Chapter 9: Rational Numbers
  // Chapter 10: Practical Geometry
  // Chapter 11: Perimeter and Area
  // Chapter 12: Algebraic Expressions
  // Chapter 13: Exponents and Powers
  // Chapter 14: Symmetry
    // Chapter 15: Visualising Solid Shapes
    
    {
  chapterNumber: 1,
  topicId: "math-integers",
  chapterTitle: "Integers",
  chapterTitleHindi: "पूर्णांक",
  questions: makeQuestionSetFromConcepts("math-integers", [

    [
      "7-math-int-01",
      ["integers", "number-line"],
      "A mountaineer is standing 250 m above sea level. He descends 420 m into a valley and then climbs 95 m. Which integer represents his final position relative to sea level?",
      "एक पर्वतारोही समुद्र तल से 250 मीटर ऊपर खड़ा है। वह 420 मीटर नीचे घाटी में उतरता है और फिर 95 मीटर ऊपर चढ़ता है। समुद्र तल के सापेक्ष उसकी अंतिम स्थिति को कौन-सा पूर्णांक दर्शाता है?",
      ["-75", "75", "-65", "65"],
      ["-75", "75", "-65", "65"],
      0,
      [
        "Use positive integers for heights above sea level.",
        "Subtract downward movement and add upward movement."
      ],
      [
        "समुद्र तल से ऊपर की ऊँचाई को धनात्मक पूर्णांक से दर्शाइए।",
        "नीचे जाने पर घटाएँ और ऊपर आने पर जोड़ें।"
      ],
      "250 - 420 + 95 = -75. Therefore the final position is 75 m below sea level.",
      "250 - 420 + 95 = -75, इसलिए अंतिम स्थिति समुद्र तल से 75 मीटर नीचे है।",
      "medium",
      920
    ],

    [
      "7-math-int-02",
      ["integers", "temperature"],
      "The temperature in a city was 4°C in the morning. It dropped by 11°C at night. What was the night temperature?",
      "किसी शहर का तापमान सुबह 4°C था। रात में यह 11°C गिर गया। रात का तापमान क्या होगा?",
      ["-7°C", "7°C", "-15°C", "15°C"],
      ["-7°C", "7°C", "-15°C", "15°C"],
      0,
      [
        "A fall in temperature means subtraction.",
        "Use integers to represent temperatures below zero."
      ],
      [
        "तापमान में गिरावट का अर्थ घटाना है।",
        "शून्य से कम तापमान को ऋणात्मक पूर्णांक से दर्शाएँ।"
      ],
      "4 - 11 = -7°C.",
      "4 - 11 = -7°C।",
      "easy",
      850
    ],

    [
      "7-math-int-03",
      ["addition"],
      "A diver is 35 m below sea level. He rises 18 m and then rises another 12 m. What is his final position?",
      "एक गोताखोर समुद्र तल से 35 मीटर नीचे है। वह 18 मीटर ऊपर आता है और फिर 12 मीटर और ऊपर आता है। उसकी अंतिम स्थिति क्या होगी?",
      ["-5 m", "5 m", "-7 m", "7 m"],
      ["-5 मी", "5 मी", "-7 मी", "7 मी"],
      0,
      [
        "Represent below sea level by negative integers.",
        "Add upward movements."
      ],
      [
        "समुद्र तल से नीचे की स्थिति को ऋणात्मक पूर्णांक से दर्शाएँ।",
        "ऊपर की ओर होने वाली गतियों को जोड़ें।"
      ],
      "-35 + 18 + 12 = -5.",
      "-35 + 18 + 12 = -5।",
      "easy",
      860
    ],

    [
      "7-math-int-04",
      ["subtraction"],
      "A bank account has a debt of ₹850. Another debt of ₹250 is added. Which integer represents the total balance?",
      "एक बैंक खाते पर ₹850 का ऋण है। उस पर ₹250 का और ऋण जुड़ जाता है। कुल शेष राशि को कौन-सा पूर्णांक दर्शाएगा?",
      ["-1100", "1100", "-600", "600"],
      ["-1100", "1100", "-600", "600"],
      0,
      [
        "Debt is represented by negative integers.",
        "Add the debts."
      ],
      [
        "ऋण को ऋणात्मक पूर्णांक से दर्शाया जाता है।",
        "दोनों ऋणों को जोड़िए।"
      ],
      "-850 + (-250) = -1100.",
      "-850 + (-250) = -1100।",
      "easy",
      870
    ],

    [
      "7-math-int-05",
      ["number-line"],
      "Which integer lies exactly halfway between -12 and 4 on a number line?",
      "संख्या रेखा पर -12 और 4 के बीच ठीक मध्य में कौन-सा पूर्णांक स्थित है?",
      ["-4", "4", "-8", "0"],
      ["-4", "4", "-8", "0"],
      0,
      [
        "Find the average of the two integers.",
        "Halfway means equal distance from both numbers."
      ],
      [
        "दोनों पूर्णांकों का औसत ज्ञात कीजिए।",
        "मध्य बिंदु दोनों से समान दूरी पर होता है।"
      ],
      "(-12 + 4)/2 = -4.",
      "(-12 + 4)/2 = -4।",
      "medium",
      910
    ],

    [
      "7-math-int-06",
      ["comparison"],
      "Which of the following integers is the greatest?",
      "निम्नलिखित में से सबसे बड़ा पूर्णांक कौन-सा है?",
      ["-2", "-15", "-8", "-21"],
      ["-2", "-15", "-8", "-21"],
      0,
      [
        "On a number line, numbers to the right are greater.",
        "Among negative numbers, the one closer to zero is greater."
      ],
      [
        "संख्या रेखा पर दाईं ओर की संख्या बड़ी होती है।",
        "ऋणात्मक संख्याओं में शून्य के निकट संख्या बड़ी होती है।"
      ],
      "-2 is closest to zero.",
      "-2 शून्य के सबसे निकट है।",
      "easy",
      840
    ],

    [
      "7-math-int-07",
      ["absolute-value"],
      "A climber is 180 m above sea level while a diver is 180 m below sea level. What is common about the integers representing their positions?",
      "एक पर्वतारोही समुद्र तल से 180 मीटर ऊपर है जबकि एक गोताखोर 180 मीटर नीचे है। उनकी स्थितियों को दर्शाने वाले पूर्णांकों में क्या समानता है?",
      [
        "They have the same distance from zero",
        "They are equal",
        "Both are positive",
        "Both are negative"
      ],
      [
        "दोनों शून्य से समान दूरी पर हैं",
        "दोनों बराबर हैं",
        "दोनों धनात्मक हैं",
        "दोनों ऋणात्मक हैं"
      ],
      0,
      [
        "Think about opposite integers.",
        "Distance from zero matters."
      ],
      [
        "विपरीत पूर्णांकों के बारे में सोचिए।",
        "शून्य से दूरी पर ध्यान दीजिए।"
      ],
      "+180 and -180 are opposite integers with equal distance from zero.",
      "+180 और -180 शून्य से समान दूरी पर स्थित विपरीत पूर्णांक हैं।",
      "medium",
      930
    ],

    [
      "7-math-int-08",
      ["addition"],
      "Evaluate: (-24) + (+17)",
      "मान ज्ञात कीजिए: (-24) + (+17)",
      ["-7", "7", "-41", "41"],
      ["-7", "7", "-41", "41"],
      0,
      [
        "Subtract the smaller magnitude from the larger.",
        "Keep the sign of the larger magnitude."
      ],
      [
        "छोटे मान को बड़े मान से घटाइए।",
        "बड़े मान का चिन्ह रखिए।"
      ],
      "-24 + 17 = -7.",
      "-24 + 17 = -7।",
      "easy",
      850
    ],

    [
      "7-math-int-09",
      ["subtraction"],
      "Evaluate: (-35) - (-18)",
      "मान ज्ञात कीजिए: (-35) - (-18)",
      ["-17", "17", "-53", "53"],
      ["-17", "17", "-53", "53"],
      0,
      [
        "Subtracting a negative means adding a positive.",
        "Convert the expression first."
      ],
      [
        "ऋणात्मक संख्या घटाने का अर्थ धनात्मक जोड़ना है।",
        "पहले व्यंजक को बदलें।"
      ],
      "-35 + 18 = -17.",
      "-35 + 18 = -17।",
      "medium",
      900
    ],

    [
      "7-math-int-10",
      ["multiplication"],
      "Which statement is correct?",
      "कौन-सा कथन सही है?",
      [
        "The product of two negative integers is positive",
        "The product of two negative integers is always negative",
        "Zero is a negative integer",
        "Every integer is positive"
      ],
      [
        "दो ऋणात्मक पूर्णांकों का गुणनफल धनात्मक होता है",
        "दो ऋणात्मक पूर्णांकों का गुणनफल सदैव ऋणात्मक होता है",
        "शून्य एक ऋणात्मक पूर्णांक है",
        "प्रत्येक पूर्णांक धनात्मक होता है"
      ],
      0,
      [
        "Recall multiplication sign rules.",
        "Negative × Negative = Positive."
      ],
      [
        "गुणा के चिन्ह नियम याद करें।",
        "ऋणात्मक × ऋणात्मक = धनात्मक।"
      ],
      "The product of two negative integers is positive.",
      "दो ऋणात्मक पूर्णांकों का गुणनफल धनात्मक होता है।",
      "medium",
      920
    ],

    [
      "7-math-int-11",
      ["division"],
      "What is (-72) ÷ 9 ?",
      "(-72) ÷ 9 का मान क्या है?",
      ["-8", "8", "-9", "9"],
      ["-8", "8", "-9", "9"],
      0,
      [
        "A negative divided by a positive is negative.",
        "72 ÷ 9 = 8."
      ],
      [
        "ऋणात्मक संख्या को धनात्मक से भाग देने पर उत्तर ऋणात्मक होता है।",
        "72 ÷ 9 = 8।"
      ],
      "(-72) ÷ 9 = -8.",
      "(-72) ÷ 9 = -8।",
      "easy",
      860
    ],

    [
      "7-math-int-12",
      ["word-problem"],
      "A submarine descends 40 m, rises 25 m, descends 18 m and then rises 10 m. What is its net movement from the starting point?",
      "एक पनडुब्बी 40 मीटर नीचे जाती है, 25 मीटर ऊपर आती है, 18 मीटर नीचे जाती है और फिर 10 मीटर ऊपर आती है। प्रारंभिक स्थिति से इसका कुल विस्थापन क्या है?",
      ["-23 m", "23 m", "-17 m", "17 m"],
      ["-23 मी", "23 मी", "-17 मी", "17 मी"],
      0,
      [
        "Treat downward movement as negative.",
        "Add all movements."
      ],
      [
        "नीचे की गति को ऋणात्मक मानें।",
        "सभी गतियों को जोड़ें।"
      ],
      "-40 + 25 - 18 + 10 = -23.",
      "-40 + 25 - 18 + 10 = -23।",
      "medium",
      940
    ],

    [
      "7-math-int-13",
      ["olympiad"],
      "The sum of three consecutive integers is -36. What is the middle integer?",
      "तीन क्रमागत पूर्णांकों का योग -36 है। मध्य पूर्णांक क्या होगा?",
      ["-12", "-11", "-13", "-10"],
      ["-12", "-11", "-13", "-10"],
      0,
      [
        "Let the integers be x-1, x, x+1.",
        "Use the sum condition."
      ],
      [
        "पूर्णांकों को x-1, x, x+1 मानिए।",
        "योग की शर्त का उपयोग करें।"
      ],
      "3x = -36, therefore x = -12.",
      "3x = -36, इसलिए x = -12।",
      "hard",
      980
    ],

    [
      "7-math-int-14",
      ["olympiad", "patterns"],
      "Which integer should replace ? : (-8) + ? = (-3)",
      "रिक्त स्थान भरिए: (-8) + ? = (-3)",
      ["5", "-5", "11", "-11"],
      ["5", "-5", "11", "-11"],
      0,
      [
        "Find the number that moves -8 to -3.",
        "Think of inverse operations."
      ],
      [
        "-8 से -3 तक पहुँचने के लिए क्या जोड़ना होगा?",
        "प्रतिलोम संक्रिया का प्रयोग करें।"
      ],
      "-8 + 5 = -3.",
      "-8 + 5 = -3।",
      "medium",
      920
    ],

    [
      "7-math-int-15",
      ["comparison", "olympiad"],
      "Arrange the integers -7, 5, -2, 0, 8 in ascending order.",
      "पूर्णांकों -7, 5, -2, 0, 8 को आरोही क्रम में व्यवस्थित कीजिए।",
      [
        "-7, -2, 0, 5, 8",
        "-2, -7, 0, 5, 8",
        "-7, 0, -2, 5, 8",
        "8, 5, 0, -2, -7"
      ],
      [
        "-7, -2, 0, 5, 8",
        "-2, -7, 0, 5, 8",
        "-7, 0, -2, 5, 8",
        "8, 5, 0, -2, -7"
      ],
      0,
      [
        "Use a number line.",
        "Move from left to right."
      ],
      [
        "संख्या रेखा का उपयोग करें।",
        "बाएँ से दाएँ चलें।"
      ],
      "Ascending order is -7, -2, 0, 5, 8.",
      "आरोही क्रम -7, -2, 0, 5, 8 है।",
      "medium",
      930
    ],

    [
      "7-math-int-16",
      ["properties"],
      "Which integer is the additive identity?",
      "योगात्मक सर्वसमिका कौन-सा पूर्णांक है?",
      ["0", "1", "-1", "10"],
      ["0", "1", "-1", "10"],
      0,
      [
        "Adding it does not change a number.",
        "Think identity element."
      ],
      [
        "इसे जोड़ने पर संख्या नहीं बदलती।",
        "सर्वसमिका तत्व के बारे में सोचिए।"
      ],
      "0 is the additive identity.",
      "0 योगात्मक सर्वसमिका है।",
      "easy",
      840
    ],

    [
      "7-math-int-17",
      ["properties"],
      "What is the additive inverse of -29?",
      "-29 का योगात्मक प्रतिलोम क्या है?",
      ["29", "-29", "0", "58"],
      ["29", "-29", "0", "58"],
      0,
      [
        "Additive inverses add up to zero.",
        "Find the opposite integer."
      ],
      [
        "योगात्मक प्रतिलोम का योग शून्य होता है।",
        "विपरीत पूर्णांक ज्ञात करें।"
      ],
      "-29 + 29 = 0.",
      "-29 + 29 = 0।",
      "easy",
      860
    ],

    [
      "7-math-int-18",
      ["olympiad", "reasoning"],
      "The difference between two integers is -15. If one integer is 8, what could be the other integer?",
      "दो पूर्णांकों का अंतर -15 है। यदि एक पूर्णांक 8 है, तो दूसरा कौन-सा हो सकता है?",
      ["23", "-7", "15", "7"],
      ["23", "-7", "15", "7"],
      0,
      [
        "Let 8 - x = -15.",
        "Solve the equation."
      ],
      [
        "8 - x = -15 मानिए।",
        "समीकरण हल कीजिए।"
      ],
      "8 - x = -15 ⇒ x = 23.",
      "8 - x = -15 ⇒ x = 23।",
      "hard",
      1000
    ],

    [
      "7-math-int-19",
      ["olympiad"],
      "The sum of an integer and its additive inverse is always:",
      "किसी पूर्णांक और उसके योगात्मक प्रतिलोम का योग सदैव क्या होता है?",
      ["0", "1", "-1", "The same integer"],
      ["0", "1", "-1", "वही पूर्णांक"],
      0,
      [
        "Think about opposite integers.",
        "Example: 8 + (-8)."
      ],
      [
        "विपरीत पूर्णांकों के बारे में सोचिए।",
        "उदाहरण: 8 + (-8)।"
      ],
      "An integer and its additive inverse always sum to zero.",
      "किसी पूर्णांक और उसके योगात्मक प्रतिलोम का योग सदैव शून्य होता है।",
      "medium",
      900
    ],

    [
      "7-math-int-20",
      ["olympiad", "challenge"],
      "A number line game starts at -18. A player moves right 27 units, left 14 units, right 8 units and left 5 units. Where does the player end?",
      "एक संख्या रेखा खेल -18 से शुरू होता है। खिलाड़ी 27 इकाई दाएँ, 14 इकाई बाएँ, 8 इकाई दाएँ और 5 इकाई बाएँ चलता है। वह कहाँ पहुँचेगा?",
      ["-2", "2", "-4", "4"],
      ["-2", "2", "-4", "4"],
      0,
      [
        "Right means positive movement.",
        "Left means negative movement."
      ],
      [
        "दाएँ जाना धनात्मक गति है।",
        "बाएँ जाना ऋणात्मक गति है।"
      ],
      "-18 + 27 - 14 + 8 - 5 = -2.",
      "-18 + 27 - 14 + 8 - 5 = -2।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 2,
  topicId: "math-fractions-and-decimals",
  chapterTitle: "Fractions and Decimals",
  chapterTitleHindi: "भिन्न तथा दशमलव",
  questions: makeQuestionSetFromConcepts("math-fractions-and-decimals", [

    [
      "7-math-fd-01",
      ["fractions", "comparison"],
      "Two students ate different portions of a pizza. Rohan ate 3/4 of a pizza while Aman ate 5/8 of a pizza. Who ate more?",
      "दो विद्यार्थियों ने पिज़्ज़ा के अलग-अलग भाग खाए। रोहन ने 3/4 पिज़्ज़ा खाया जबकि अमन ने 5/8 पिज़्ज़ा खाया। किसने अधिक खाया?",
      ["Rohan", "Aman", "Both ate equal", "Cannot be determined"],
      ["रोहन", "अमन", "दोनों ने बराबर खाया", "निर्धारित नहीं किया जा सकता"],
      0,
      [
        "Convert both fractions to the same denominator.",
        "Compare 3/4 and 5/8."
      ],
      [
        "दोनों भिन्नों का हर समान बनाइए।",
        "3/4 और 5/8 की तुलना कीजिए।"
      ],
      "3/4 = 6/8, and 6/8 > 5/8. Therefore, Rohan ate more.",
      "3/4 = 6/8 तथा 6/8 > 5/8, इसलिए रोहन ने अधिक खाया।",
      "easy",
      860
    ],

    [
      "7-math-fd-02",
      ["fractions", "addition"],
      "A water tank was 2/5 full in the morning. By afternoon, another 1/4 of the tank was filled. What fraction of the tank is filled now?",
      "एक पानी की टंकी सुबह 2/5 भरी हुई थी। दोपहर तक उसमें टंकी का 1/4 भाग और भर दिया गया। अब टंकी का कितना भाग भरा है?",
      ["13/20", "3/9", "11/20", "7/20"],
      ["13/20", "3/9", "11/20", "7/20"],
      0,
      [
        "Find a common denominator.",
        "Add the fractions carefully."
      ],
      [
        "समान हर ज्ञात कीजिए।",
        "भिन्नों को सावधानीपूर्वक जोड़िए।"
      ],
      "2/5 + 1/4 = 8/20 + 5/20 = 13/20.",
      "2/5 + 1/4 = 8/20 + 5/20 = 13/20।",
      "medium",
      910
    ],

    [
      "7-math-fd-03",
      ["fractions", "subtraction"],
      "A ribbon of length 7/8 m was cut. If 3/8 m was used, how much ribbon remains?",
      "7/8 मीटर लंबी रिबन में से 3/8 मीटर उपयोग कर लिया गया। कितनी रिबन बची?",
      ["1/2 m", "4/8 m", "Both A and B", "3/4 m"],
      ["1/2 मी", "4/8 मी", "A और B दोनों", "3/4 मी"],
      2,
      [
        "Subtract numerators when denominators are same.",
        "Simplify the answer."
      ],
      [
        "हर समान होने पर अंशों को घटाइए।",
        "उत्तर को सरल रूप में लिखिए।"
      ],
      "7/8 - 3/8 = 4/8 = 1/2.",
      "7/8 - 3/8 = 4/8 = 1/2।",
      "easy",
      870
    ],

    [
      "7-math-fd-04",
      ["multiplication", "fractions"],
      "A farmer owns 3/5 hectare of land. He cultivates 2/3 of it with wheat. What fraction of a hectare is cultivated with wheat?",
      "एक किसान के पास 3/5 हेक्टेयर भूमि है। वह उसमें से 2/3 भाग पर गेहूँ उगाता है। गेहूँ से कितनी भूमि बोई गई?",
      ["2/5", "1/5", "5/6", "6/15"],
      ["2/5", "1/5", "5/6", "6/15"],
      0,
      [
        "Multiply the fractions.",
        "Simplify if necessary."
      ],
      [
        "भिन्नों का गुणा कीजिए।",
        "आवश्यक हो तो सरल कीजिए।"
      ],
      "3/5 × 2/3 = 2/5.",
      "3/5 × 2/3 = 2/5।",
      "medium",
      920
    ],

    [
      "7-math-fd-05",
      ["division", "fractions"],
      "How many halves are there in 5?",
      "5 में कितने आधे (1/2) होते हैं?",
      ["10", "5", "2.5", "15"],
      ["10", "5", "2.5", "15"],
      0,
      [
        "Divide 5 by 1/2.",
        "Remember reciprocal."
      ],
      [
        "5 को 1/2 से भाग दीजिए।",
        "व्युत्क्रम याद रखिए।"
      ],
      "5 ÷ 1/2 = 10.",
      "5 ÷ 1/2 = 10।",
      "medium",
      930
    ],

    [
      "7-math-fd-06",
      ["decimals"],
      "Which decimal represents the fraction 7/10?",
      "7/10 को कौन-सा दशमलव दर्शाता है?",
      ["0.7", "0.07", "7.0", "0.70"],
      ["0.7", "0.07", "7.0", "0.70"],
      0,
      [
        "Divide numerator by denominator.",
        "Tenths place is important."
      ],
      [
        "अंश को हर से भाग दीजिए।",
        "दशांश स्थान पर ध्यान दीजिए।"
      ],
      "7/10 = 0.7.",
      "7/10 = 0.7।",
      "easy",
      840
    ],

    [
      "7-math-fd-07",
      ["decimals", "comparison"],
      "Which is greater?",
      "कौन-सा बड़ा है?",
      ["0.56", "0.506", "Both are equal", "Cannot compare"],
      ["0.56", "0.506", "दोनों बराबर हैं", "तुलना नहीं की जा सकती"],
      0,
      [
        "Write both decimals with equal digits.",
        "Compare place values."
      ],
      [
        "दोनों दशमलवों में समान अंक लिखिए।",
        "स्थानिक मान की तुलना कीजिए।"
      ],
      "0.560 > 0.506.",
      "0.560 > 0.506।",
      "easy",
      860
    ],

    [
      "7-math-fd-08",
      ["decimals", "addition"],
      "A shopkeeper sold cloth measuring 2.75 m and 1.85 m. What is the total length sold?",
      "एक दुकानदार ने 2.75 मीटर और 1.85 मीटर कपड़ा बेचा। कुल कितनी लंबाई बेची गई?",
      ["4.60 m", "4.50 m", "3.60 m", "5.60 m"],
      ["4.60 मी", "4.50 मी", "3.60 मी", "5.60 मी"],
      0,
      [
        "Align decimal points.",
        "Add normally."
      ],
      [
        "दशमलव बिंदुओं को एक सीध में रखिए।",
        "सामान्य जोड़ कीजिए।"
      ],
      "2.75 + 1.85 = 4.60.",
      "2.75 + 1.85 = 4.60।",
      "easy",
      870
    ],

    [
      "7-math-fd-09",
      ["decimals", "subtraction"],
      "A bottle contains 5.0 L of juice. If 2.65 L is consumed, how much remains?",
      "एक बोतल में 5.0 लीटर रस है। यदि 2.65 लीटर उपयोग कर लिया जाए, तो कितना शेष रहेगा?",
      ["2.35 L", "2.45 L", "3.35 L", "1.35 L"],
      ["2.35 ली", "2.45 ली", "3.35 ली", "1.35 ली"],
      0,
      [
        "Subtract carefully.",
        "Align decimal places."
      ],
      [
        "सावधानीपूर्वक घटाइए।",
        "दशमलव स्थानों को एक सीध में रखिए।"
      ],
      "5.00 - 2.65 = 2.35.",
      "5.00 - 2.65 = 2.35।",
      "medium",
      900
    ],

    [
      "7-math-fd-10",
      ["fractions-decimals"],
      "Which fraction is equivalent to 0.125?",
      "0.125 के समतुल्य भिन्न कौन-सी है?",
      ["1/8", "1/4", "1/2", "3/8"],
      ["1/8", "1/4", "1/2", "3/8"],
      0,
      [
        "Write as 125/1000.",
        "Simplify the fraction."
      ],
      [
        "इसे 125/1000 के रूप में लिखिए।",
        "भिन्न को सरल कीजिए।"
      ],
      "125/1000 = 1/8.",
      "125/1000 = 1/8।",
      "medium",
      930
    ],

    [
      "7-math-fd-11",
      ["olympiad"],
      "The sum of two fractions is 5/6. One fraction is 1/4. What is the other fraction?",
      "दो भिन्नों का योग 5/6 है। यदि एक भिन्न 1/4 है, तो दूसरी भिन्न क्या होगी?",
      ["7/12", "1/2", "3/4", "5/12"],
      ["7/12", "1/2", "3/4", "5/12"],
      0,
      [
        "Subtract the known fraction from the total.",
        "Use common denominators."
      ],
      [
        "ज्ञात भिन्न को कुल योग से घटाइए।",
        "समान हर का उपयोग कीजिए।"
      ],
      "5/6 - 1/4 = 10/12 - 3/12 = 7/12.",
      "5/6 - 1/4 = 10/12 - 3/12 = 7/12।",
      "hard",
      980
    ],

    [
      "7-math-fd-12",
      ["olympiad", "comparison"],
      "Which is the smallest?",
      "सबसे छोटी संख्या कौन-सी है?",
      ["2/5", "0.42", "3/8", "0.4"],
      ["2/5", "0.42", "3/8", "0.4"],
      2,
      [
        "Convert everything to decimals.",
        "Compare carefully."
      ],
      [
        "सभी को दशमलव में बदलिए।",
        "सावधानीपूर्वक तुलना कीजिए।"
      ],
      "2/5=0.4, 0.42=0.42, 3/8=0.375. Smallest is 3/8.",
      "2/5=0.4, 0.42=0.42, 3/8=0.375। सबसे छोटी 3/8 है।",
      "hard",
      990
    ],

    [
      "7-math-fd-13",
      ["word-problem"],
      "A runner completed 2/3 of a race in the morning and 1/6 in the evening. What fraction of the race remains?",
      "एक धावक ने दौड़ का 2/3 भाग सुबह और 1/6 भाग शाम को पूरा किया। दौड़ का कितना भाग शेष है?",
      ["1/6", "1/3", "5/6", "0"],
      ["1/6", "1/3", "5/6", "0"],
      0,
      [
        "Find total completed first.",
        "Subtract from 1."
      ],
      [
        "पहले पूरा किया गया भाग ज्ञात कीजिए।",
        "फिर 1 में से घटाइए।"
      ],
      "2/3 + 1/6 = 5/6, remaining = 1/6.",
      "2/3 + 1/6 = 5/6, शेष = 1/6।",
      "medium",
      940
    ],

    [
      "7-math-fd-14",
      ["decimal-multiplication"],
      "What is 0.8 × 0.5 ?",
      "0.8 × 0.5 का मान क्या है?",
      ["0.4", "4.0", "0.40", "Both A and C"],
      ["0.4", "4.0", "0.40", "A और C दोनों"],
      3,
      [
        "Multiply normally.",
        "Count decimal places."
      ],
      [
        "सामान्य गुणा कीजिए।",
        "दशमलव स्थान गिनिए।"
      ],
      "0.8 × 0.5 = 0.4 = 0.40.",
      "0.8 × 0.5 = 0.4 = 0.40।",
      "medium",
      920
    ],

    [
      "7-math-fd-15",
      ["decimal-division"],
      "What is 3.6 ÷ 0.6 ?",
      "3.6 ÷ 0.6 का मान क्या है?",
      ["6", "0.6", "60", "3"],
      ["6", "0.6", "60", "3"],
      0,
      [
        "Remove decimals by multiplying both numbers by 10.",
        "Then divide."
      ],
      [
        "दोनों संख्याओं को 10 से गुणा करके दशमलव हटाइए।",
        "फिर भाग दीजिए।"
      ],
      "36 ÷ 6 = 6.",
      "36 ÷ 6 = 6।",
      "medium",
      940
    ],

    [
      "7-math-fd-16",
      ["olympiad"],
      "A fraction is equivalent to 3/5 and its denominator is 40. What is its numerator?",
      "एक भिन्न 3/5 के समतुल्य है और उसका हर 40 है। उसका अंश क्या होगा?",
      ["24", "20", "15", "18"],
      ["24", "20", "15", "18"],
      0,
      [
        "Find the multiplication factor.",
        "Apply it to the numerator."
      ],
      [
        "गुणन गुणांक ज्ञात कीजिए।",
        "उसे अंश पर लागू कीजिए।"
      ],
      "5 × 8 = 40, therefore 3 × 8 = 24.",
      "5 × 8 = 40, इसलिए 3 × 8 = 24।",
      "hard",
      1000
    ],

    [
      "7-math-fd-17",
      ["olympiad", "reasoning"],
      "Which fraction is closest to 1?",
      "कौन-सी भिन्न 1 के सबसे निकट है?",
      ["7/8", "11/12", "15/16", "19/20"],
      ["7/8", "11/12", "15/16", "19/20"],
      3,
      [
        "Compare how far each fraction is from 1.",
        "Smaller difference means closer."
      ],
      [
        "प्रत्येक भिन्न की 1 से दूरी ज्ञात कीजिए।",
        "कम अंतर का अर्थ अधिक निकटता है।"
      ],
      "19/20 differs from 1 by only 1/20.",
      "19/20, 1 से केवल 1/20 कम है।",
      "hard",
      1010
    ],

    [
      "7-math-fd-18",
      ["olympiad", "mixed"],
      "The average of 0.4 and 0.8 is:",
      "0.4 और 0.8 का औसत क्या है?",
      ["0.6", "0.5", "1.2", "0.4"],
      ["0.6", "0.5", "1.2", "0.4"],
      0,
      [
        "Add the numbers first.",
        "Divide by 2."
      ],
      [
        "पहले दोनों संख्याएँ जोड़िए।",
        "फिर 2 से भाग दीजिए।"
      ],
      "(0.4 + 0.8)/2 = 0.6.",
      "(0.4 + 0.8)/2 = 0.6।",
      "hard",
      1020
    ],

    [
      "7-math-fd-19",
      ["application"],
      "A rope of length 12 m is cut into pieces of length 3/4 m each. How many pieces are obtained?",
      "12 मीटर लंबी रस्सी को 3/4 मीटर की लंबाई के टुकड़ों में काटा जाता है। कुल कितने टुकड़े बनेंगे?",
      ["16", "9", "12", "18"],
      ["16", "9", "12", "18"],
      0,
      [
        "Divide total length by piece length.",
        "Use reciprocal."
      ],
      [
        "कुल लंबाई को एक टुकड़े की लंबाई से भाग दीजिए।",
        "व्युत्क्रम का उपयोग कीजिए।"
      ],
      "12 ÷ 3/4 = 12 × 4/3 = 16.",
      "12 ÷ 3/4 = 12 × 4/3 = 16।",
      "hard",
      1030
    ],

    [
      "7-math-fd-20",
      ["olympiad", "challenge"],
      "Three numbers are 1/2, 0.45 and 3/5. Which is the greatest?",
      "तीन संख्याएँ 1/2, 0.45 और 3/5 हैं। इनमें सबसे बड़ी कौन-सी है?",
      ["3/5", "1/2", "0.45", "All are equal"],
      ["3/5", "1/2", "0.45", "सभी बराबर हैं"],
      0,
      [
        "Convert all numbers into decimals.",
        "Compare carefully."
      ],
      [
        "सभी संख्याओं को दशमलव में बदलिए।",
        "सावधानीपूर्वक तुलना कीजिए।"
      ],
      "1/2 = 0.5, 3/5 = 0.6, therefore 3/5 is greatest.",
      "1/2 = 0.5, 3/5 = 0.6, इसलिए 3/5 सबसे बड़ी है।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 3,
  topicId: "math-data-handling",
  chapterTitle: "Data Handling",
  chapterTitleHindi: "आँकड़ों का प्रबंधन",
  questions: makeQuestionSetFromConcepts("math-data-handling", [

    [
      "7-math-dh-01",
      ["data", "observation"],
      "A teacher records the daily attendance of a class for a month. The collection of these attendance records is called:",
      "एक शिक्षक एक महीने तक कक्षा की दैनिक उपस्थिति दर्ज करता है। इन उपस्थिति अभिलेखों के संग्रह को क्या कहते हैं?",
      ["Data", "Graph", "Scale", "Survey"],
      ["आँकड़े", "ग्राफ", "मापनी", "सर्वेक्षण"],
      0,
      [
        "Think about collected information.",
        "Data is a collection of facts."
      ],
      [
        "संग्रहित जानकारी के बारे में सोचिए।",
        "आँकड़े तथ्यों का संग्रह होते हैं।"
      ],
      "A collection of facts or information is called data.",
      "तथ्यों या सूचनाओं के संग्रह को आँकड़े (Data) कहते हैं।",
      "easy",
      850
    ],

    [
      "7-math-dh-02",
      ["frequency"],
      "The marks scored by students are: 15, 18, 15, 20, 15, 18, 22. What is the frequency of 15?",
      "विद्यार्थियों के अंक हैं: 15, 18, 15, 20, 15, 18, 22। 15 की आवृत्ति क्या है?",
      ["3", "2", "1", "4"],
      ["3", "2", "1", "4"],
      0,
      [
        "Count how many times 15 appears.",
        "Frequency means occurrence."
      ],
      [
        "15 कितनी बार आया है, गिनिए।",
        "आवृत्ति का अर्थ है बार-बार आना।"
      ],
      "15 appears 3 times.",
      "15 कुल 3 बार आया है।",
      "easy",
      860
    ],

    [
      "7-math-dh-03",
      ["range"],
      "The temperatures recorded during a week are 28°C, 31°C, 35°C, 30°C, 33°C, 29°C, and 32°C. What is the range?",
      "एक सप्ताह के तापमान हैं: 28°C, 31°C, 35°C, 30°C, 33°C, 29°C और 32°C। परास (Range) क्या है?",
      ["7°C", "35°C", "28°C", "63°C"],
      ["7°C", "35°C", "28°C", "63°C"],
      0,
      [
        "Range = Maximum value − Minimum value.",
        "Find the highest and lowest temperatures."
      ],
      [
        "परास = अधिकतम मान − न्यूनतम मान।",
        "सबसे बड़ा और सबसे छोटा तापमान ज्ञात कीजिए।"
      ],
      "35 − 28 = 7.",
      "35 − 28 = 7।",
      "medium",
      900
    ],

    [
      "7-math-dh-04",
      ["mean"],
      "The marks of five students are 12, 16, 18, 14 and 20. What is their average (mean)?",
      "पाँच विद्यार्थियों के अंक 12, 16, 18, 14 और 20 हैं। उनका औसत (Mean) क्या है?",
      ["16", "15", "18", "14"],
      ["16", "15", "18", "14"],
      0,
      [
        "Add all values.",
        "Divide by the number of observations."
      ],
      [
        "सभी मानों को जोड़िए।",
        "कुल प्रेक्षणों की संख्या से भाग दीजिए।"
      ],
      "80 ÷ 5 = 16.",
      "80 ÷ 5 = 16।",
      "medium",
      910
    ],

    [
      "7-math-dh-05",
      ["mode"],
      "Which number is the mode of the data set: 4, 7, 8, 7, 9, 7, 10?",
      "आँकड़ों 4, 7, 8, 7, 9, 7, 10 का बहुलक (Mode) क्या है?",
      ["7", "8", "9", "10"],
      ["7", "8", "9", "10"],
      0,
      [
        "Mode is the most frequently occurring value.",
        "Find the value appearing most often."
      ],
      [
        "बहुलक वह मान है जो सबसे अधिक बार आता है।",
        "सबसे अधिक बार आने वाला मान ज्ञात कीजिए।"
      ],
      "7 occurs three times, more than any other value.",
      "7 तीन बार आता है, इसलिए वही बहुलक है।",
      "easy",
      870
    ],

    [
      "7-math-dh-06",
      ["bar-graph"],
      "A bar graph shows the number of books read by students in a month. What does the height of each bar represent?",
      "एक दंड आलेख (Bar Graph) में विद्यार्थियों द्वारा पढ़ी गई पुस्तकों की संख्या दिखाई गई है। प्रत्येक दंड की ऊँचाई क्या दर्शाती है?",
      [
        "The value of the corresponding category",
        "The width of the graph",
        "The scale only",
        "The title of the graph"
      ],
      [
        "संबंधित श्रेणी का मान",
        "ग्राफ की चौड़ाई",
        "केवल मापनी",
        "ग्राफ का शीर्षक"
      ],
      0,
      [
        "Bar height represents quantity.",
        "Look at what each category measures."
      ],
      [
        "दंड की ऊँचाई मात्रा दर्शाती है।",
        "प्रत्येक श्रेणी किस चीज़ को मापती है, देखें।"
      ],
      "The height of a bar represents the value of that category.",
      "दंड की ऊँचाई उस श्रेणी के मान को दर्शाती है।",
      "easy",
      880
    ],

    [
      "7-math-dh-07",
      ["survey"],
      "To find the favorite sport of students in a school, which method is most appropriate?",
      "विद्यालय के विद्यार्थियों का पसंदीदा खेल जानने के लिए कौन-सी विधि सबसे उपयुक्त है?",
      ["Survey", "Guessing", "Estimation", "Drawing"],
      ["सर्वेक्षण", "अनुमान लगाना", "आकलन", "चित्र बनाना"],
      0,
      [
        "Data should be collected from students.",
        "Think about gathering opinions."
      ],
      [
        "विद्यार्थियों से जानकारी एकत्र करनी होगी।",
        "राय एकत्र करने के बारे में सोचिए।"
      ],
      "A survey is used to collect opinions and preferences.",
      "राय और पसंद जानने के लिए सर्वेक्षण किया जाता है।",
      "easy",
      860
    ],

    [
      "7-math-dh-08",
      ["pictograph"],
      "In a pictograph, one symbol represents 5 students. If 8 symbols are shown, how many students are represented?",
      "एक चित्रालेख में एक चिन्ह 5 विद्यार्थियों को दर्शाता है। यदि 8 चिन्ह बने हों, तो कुल कितने विद्यार्थी दर्शाए गए हैं?",
      ["40", "13", "45", "80"],
      ["40", "13", "45", "80"],
      0,
      [
        "Multiply the number of symbols by the value of each symbol.",
        "8 × 5."
      ],
      [
        "चिन्हों की संख्या को प्रत्येक चिन्ह के मान से गुणा करें।",
        "8 × 5 कीजिए।"
      ],
      "8 × 5 = 40 students.",
      "8 × 5 = 40 विद्यार्थी।",
      "easy",
      870
    ],

    [
      "7-math-dh-09",
      ["mean", "application"],
      "A batsman scores 45, 60, 55, 50 and 40 runs in five matches. What is his average score?",
      "एक बल्लेबाज पाँच मैचों में 45, 60, 55, 50 और 40 रन बनाता है। उसका औसत स्कोर क्या है?",
      ["50", "45", "55", "60"],
      ["50", "45", "55", "60"],
      0,
      [
        "Add all runs scored.",
        "Divide by 5."
      ],
      [
        "सभी रन जोड़िए।",
        "5 से भाग दीजिए।"
      ],
      "250 ÷ 5 = 50.",
      "250 ÷ 5 = 50।",
      "medium",
      920
    ],

    [
      "7-math-dh-10",
      ["data-interpretation"],
      "A class collected data on favorite fruits. Mango received 18 votes, Apple 12 votes, Banana 15 votes, and Orange 10 votes. Which fruit was most preferred?",
      "एक कक्षा ने पसंदीदा फलों का आँकड़ा एकत्र किया। आम को 18, सेब को 12, केले को 15 और संतरे को 10 मत मिले। सबसे पसंदीदा फल कौन-सा था?",
      ["Mango", "Apple", "Banana", "Orange"],
      ["आम", "सेब", "केला", "संतरा"],
      0,
      [
        "Look for the highest frequency.",
        "Compare the votes."
      ],
      [
        "सबसे अधिक आवृत्ति देखें।",
        "मतों की तुलना करें।"
      ],
      "Mango received the highest number of votes.",
      "आम को सबसे अधिक मत मिले।",
      "easy",
      880
    ],

    [
      "7-math-dh-11",
      ["olympiad", "mean"],
      "The average of six numbers is 18. If five of the numbers are 12, 15, 20, 22 and 17, what is the sixth number?",
      "छह संख्याओं का औसत 18 है। यदि पाँच संख्याएँ 12, 15, 20, 22 और 17 हैं, तो छठी संख्या क्या होगी?",
      ["22", "20", "24", "18"],
      ["22", "20", "24", "18"],
      0,
      [
        "Find the total sum using the average.",
        "Subtract the sum of the known numbers."
      ],
      [
        "औसत से कुल योग ज्ञात कीजिए।",
        "ज्ञात संख्याओं का योग घटाइए।"
      ],
      "Total = 18 × 6 = 108. Known sum = 86. Sixth number = 22.",
      "कुल योग = 18 × 6 = 108। ज्ञात योग = 86। छठी संख्या = 22।",
      "hard",
      980
    ],

    [
      "7-math-dh-12",
      ["mode", "reasoning"],
      "Which statement about the mode is correct?",
      "बहुलक (Mode) के बारे में कौन-सा कथन सही है?",
      [
        "It is the value occurring most frequently",
        "It is always the largest value",
        "It is the average of all values",
        "It is the smallest value"
      ],
      [
        "यह सबसे अधिक बार आने वाला मान है",
        "यह हमेशा सबसे बड़ा मान होता है",
        "यह सभी मानों का औसत होता है",
        "यह सबसे छोटा मान होता है"
      ],
      0,
      [
        "Recall the definition of mode.",
        "Think frequency."
      ],
      [
        "बहुलक की परिभाषा याद कीजिए।",
        "आवृत्ति के बारे में सोचिए।"
      ],
      "Mode is the value with the highest frequency.",
      "बहुलक वह मान है जिसकी आवृत्ति सबसे अधिक होती है।",
      "easy",
      870
    ],

    [
      "7-math-dh-13",
      ["bar-graph", "olympiad"],
      "A bar graph shows sales of books during four months as 40, 55, 35 and 70. During which month were the sales highest?",
      "एक दंड आलेख में चार महीनों की पुस्तक बिक्री 40, 55, 35 और 70 दिखाई गई है। किस महीने में बिक्री सबसे अधिक थी?",
      ["Month 4", "Month 2", "Month 1", "Month 3"],
      ["माह 4", "माह 2", "माह 1", "माह 3"],
      0,
      [
        "Look for the highest value.",
        "Highest bar means highest sales."
      ],
      [
        "सबसे बड़ा मान खोजिए।",
        "सबसे ऊँचा दंड सबसे अधिक बिक्री दर्शाता है।"
      ],
      "70 is the highest value.",
      "70 सबसे बड़ा मान है।",
      "medium",
      920
    ],

    [
      "7-math-dh-14",
      ["range", "olympiad"],
      "The smallest value in a data set is 14 and the range is 26. What is the largest value?",
      "किसी आँकड़ा समूह का सबसे छोटा मान 14 है और परास 26 है। सबसे बड़ा मान क्या होगा?",
      ["40", "12", "26", "28"],
      ["40", "12", "26", "28"],
      0,
      [
        "Range = Maximum − Minimum.",
        "Rearrange the formula."
      ],
      [
        "परास = अधिकतम − न्यूनतम।",
        "सूत्र को पुनर्व्यवस्थित कीजिए।"
      ],
      "Maximum = 14 + 26 = 40.",
      "अधिकतम = 14 + 26 = 40।",
      "medium",
      940
    ],

    [
      "7-math-dh-15",
      ["frequency-table"],
      "Why is a frequency table useful when handling large amounts of data?",
      "अधिक मात्रा के आँकड़ों के लिए आवृत्ति सारणी उपयोगी क्यों होती है?",
      [
        "It organizes data in a compact form",
        "It increases data size",
        "It removes observations",
        "It changes the values"
      ],
      [
        "यह आँकड़ों को व्यवस्थित रूप में प्रस्तुत करती है",
        "यह आँकड़ों का आकार बढ़ाती है",
        "यह प्रेक्षणों को हटा देती है",
        "यह मान बदल देती है"
      ],
      0,
      [
        "Think about organization.",
        "Data becomes easier to interpret."
      ],
      [
        "व्यवस्थित करने के बारे में सोचिए।",
        "आँकड़ों को समझना आसान हो जाता है।"
      ],
      "Frequency tables summarize data effectively.",
      "आवृत्ति सारणी आँकड़ों को संक्षिप्त और व्यवस्थित बनाती है।",
      "medium",
      930
    ],

    [
      "7-math-dh-16",
      ["olympiad", "data-analysis"],
      "The average age of 8 students is 12 years. If one more student aged 20 joins the group, what is the new average age?",
      "8 विद्यार्थियों की औसत आयु 12 वर्ष है। यदि 20 वर्ष आयु का एक और विद्यार्थी समूह में जुड़ जाए, तो नई औसत आयु क्या होगी?",
      ["12.89 years", "13 years", "14 years", "12 years"],
      ["12.89 वर्ष", "13 वर्ष", "14 वर्ष", "12 वर्ष"],
      0,
      [
        "Find the original total age.",
        "Add 20 and divide by 9."
      ],
      [
        "पहले कुल आयु ज्ञात कीजिए।",
        "20 जोड़कर 9 से भाग दीजिए।"
      ],
      "Original total = 96. New total = 116. Average = 116/9 ≈ 12.89.",
      "कुल आयु = 96। नई कुल आयु = 116। औसत = 116/9 ≈ 12.89।",
      "hard",
      1000
    ],

    [
      "7-math-dh-17",
      ["pictograph", "olympiad"],
      "In a pictograph, one symbol represents 25 trees. If a category shows 7½ symbols, how many trees does it represent?",
      "एक चित्रालेख में एक चिन्ह 25 पेड़ों को दर्शाता है। यदि किसी श्रेणी में 7½ चिन्ह हों, तो वह कितने पेड़ों को दर्शाएगी?",
      ["187.5", "175", "200", "150"],
      ["187.5", "175", "200", "150"],
      0,
      [
        "Multiply the number of symbols by 25.",
        "Remember that half a symbol has half the value."
      ],
      [
        "चिन्हों की संख्या को 25 से गुणा कीजिए।",
        "आधा चिन्ह आधा मान दर्शाता है।"
      ],
      "7.5 × 25 = 187.5.",
      "7.5 × 25 = 187.5।",
      "hard",
      1010
    ],

    [
      "7-math-dh-18",
      ["mean", "reasoning"],
      "Which value is most affected when a very large number is added to a data set?",
      "यदि आँकड़ा समूह में बहुत बड़ी संख्या जोड़ दी जाए, तो कौन-सा मान सबसे अधिक प्रभावित होगा?",
      ["Mean", "Mode", "Frequency", "Category"],
      ["औसत", "बहुलक", "आवृत्ति", "श्रेणी"],
      0,
      [
        "Think about how averages are calculated.",
        "One large value can pull the mean upward."
      ],
      [
        "औसत निकालने की प्रक्रिया के बारे में सोचिए।",
        "एक बड़ा मान औसत को ऊपर खींच सकता है।"
      ],
      "The mean is highly sensitive to extreme values.",
      "औसत (Mean) चरम मानों से सबसे अधिक प्रभावित होता है।",
      "hard",
      1020
    ],

    [
      "7-math-dh-19",
      ["data-interpretation", "olympiad"],
      "The frequencies of four values are 5, 8, 12 and 7. What is the total number of observations?",
      "चार मानों की आवृत्तियाँ 5, 8, 12 और 7 हैं। कुल प्रेक्षणों की संख्या क्या होगी?",
      ["32", "30", "12", "20"],
      ["32", "30", "12", "20"],
      0,
      [
        "Add all frequencies.",
        "Total observations equal total frequency."
      ],
      [
        "सभी आवृत्तियाँ जोड़िए।",
        "कुल प्रेक्षण = कुल आवृत्ति।"
      ],
      "5 + 8 + 12 + 7 = 32.",
      "5 + 8 + 12 + 7 = 32।",
      "medium",
      950
    ],

    [
      "7-math-dh-20",
      ["olympiad", "challenge"],
      "A data set has mean 18. If every observation is increased by 5, what will be the new mean?",
      "किसी आँकड़ा समूह का औसत 18 है। यदि प्रत्येक प्रेक्षण में 5 जोड़ दिया जाए, तो नया औसत क्या होगा?",
      ["23", "18", "13", "90"],
      ["23", "18", "13", "90"],
      0,
      [
        "Adding the same number to all observations shifts the mean by that amount.",
        "Think transformation of data."
      ],
      [
        "सभी प्रेक्षणों में समान संख्या जोड़ने से औसत भी उतना ही बढ़ता है।",
        "आँकड़ों के रूपांतरण के बारे में सोचिए।"
      ],
      "New mean = 18 + 5 = 23.",
      "नया औसत = 18 + 5 = 23।",
      "hard",
      1050
    ]

  ])
},

];
export { class7MathematicsQuestionBank };