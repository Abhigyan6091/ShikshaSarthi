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
    {
  chapterNumber: 4,
  topicId: "math-simple-equations",
  chapterTitle: "Simple Equations",
  chapterTitleHindi: "सरल समीकरण",
  questions: makeQuestionSetFromConcepts("math-simple-equations", [

    [
      "7-math-se-01",
      ["equations", "variables"],
      "A number increased by 8 gives 21. Which equation correctly represents this statement?",
      "किसी संख्या में 8 जोड़ने पर 21 प्राप्त होता है। कौन-सी समीकरण इस कथन को सही दर्शाती है?",
      ["x + 8 = 21", "x - 8 = 21", "8x = 21", "21 - 8 = x + 8"],
      ["x + 8 = 21", "x - 8 = 21", "8x = 21", "21 - 8 = x + 8"],
      0,
      [
        "Let the unknown number be x.",
        "Translate words into mathematical symbols."
      ],
      [
        "अज्ञात संख्या को x मानिए।",
        "शब्दों को गणितीय चिन्हों में बदलिए।"
      ],
      "If a number x is increased by 8 and becomes 21, then x + 8 = 21.",
      "यदि संख्या x में 8 जोड़ने पर 21 मिलता है, तो समीकरण x + 8 = 21 होगी।",
      "easy",
      850
    ],

    [
      "7-math-se-02",
      ["equations", "solving"],
      "Solve: x + 15 = 32",
      "हल कीजिए: x + 15 = 32",
      ["17", "47", "15", "32"],
      ["17", "47", "15", "32"],
      0,
      [
        "Subtract 15 from both sides.",
        "Keep the equation balanced."
      ],
      [
        "दोनों पक्षों से 15 घटाइए।",
        "समीकरण का संतुलन बनाए रखिए।"
      ],
      "x = 32 - 15 = 17.",
      "x = 32 - 15 = 17।",
      "easy",
      860
    ],

    [
      "7-math-se-03",
      ["equations", "subtraction"],
      "Solve: y - 9 = 14",
      "हल कीजिए: y - 9 = 14",
      ["23", "5", "14", "9"],
      ["23", "5", "14", "9"],
      0,
      [
        "Add 9 to both sides.",
        "Undo subtraction."
      ],
      [
        "दोनों पक्षों में 9 जोड़िए।",
        "घटाव को समाप्त कीजिए।"
      ],
      "y = 14 + 9 = 23.",
      "y = 14 + 9 = 23।",
      "easy",
      870
    ],

    [
      "7-math-se-04",
      ["equations", "multiplication"],
      "Solve: 7x = 49",
      "हल कीजिए: 7x = 49",
      ["7", "6", "8", "49"],
      ["7", "6", "8", "49"],
      0,
      [
        "Divide both sides by 7.",
        "Use the inverse operation."
      ],
      [
        "दोनों पक्षों को 7 से भाग दीजिए।",
        "प्रतिलोम संक्रिया का उपयोग कीजिए।"
      ],
      "x = 49 ÷ 7 = 7.",
      "x = 49 ÷ 7 = 7।",
      "easy",
      880
    ],

    [
      "7-math-se-05",
      ["equations", "division"],
      "Solve: a/5 = 12",
      "हल कीजिए: a/5 = 12",
      ["60", "17", "7", "50"],
      ["60", "17", "7", "50"],
      0,
      [
        "Multiply both sides by 5.",
        "Undo the division."
      ],
      [
        "दोनों पक्षों को 5 से गुणा कीजिए।",
        "भाग को समाप्त कीजिए।"
      ],
      "a = 12 × 5 = 60.",
      "a = 12 × 5 = 60।",
      "easy",
      890
    ],

    [
      "7-math-se-06",
      ["word-problem"],
      "Twice a number is 38. What is the number?",
      "किसी संख्या का दुगुना 38 है। संख्या क्या है?",
      ["19", "76", "18", "20"],
      ["19", "76", "18", "20"],
      0,
      [
        "Let the number be x.",
        "Form the equation 2x = 38."
      ],
      [
        "संख्या को x मानिए।",
        "समीकरण 2x = 38 बनाइए।"
      ],
      "2x = 38 ⇒ x = 19.",
      "2x = 38 ⇒ x = 19।",
      "easy",
      900
    ],

    [
      "7-math-se-07",
      ["word-problem"],
      "The sum of a number and 17 is 45. What is the number?",
      "किसी संख्या और 17 का योग 45 है। संख्या क्या है?",
      ["28", "62", "17", "45"],
      ["28", "62", "17", "45"],
      0,
      [
        "Let the number be x.",
        "Form x + 17 = 45."
      ],
      [
        "संख्या को x मानिए।",
        "समीकरण x + 17 = 45 बनाइए।"
      ],
      "x = 45 - 17 = 28.",
      "x = 45 - 17 = 28।",
      "easy",
      910
    ],

    [
      "7-math-se-08",
      ["equations", "verification"],
      "Which value satisfies the equation x + 6 = 18?",
      "कौन-सा मान समीकरण x + 6 = 18 को संतुष्ट करता है?",
      ["12", "24", "6", "18"],
      ["12", "24", "6", "18"],
      0,
      [
        "Substitute each option.",
        "Check which makes the equation true."
      ],
      [
        "प्रत्येक विकल्प को रखकर जाँचिए।",
        "देखिए कौन-सा समीकरण को सत्य बनाता है।"
      ],
      "12 + 6 = 18.",
      "12 + 6 = 18।",
      "easy",
      860
    ],

    [
      "7-math-se-09",
      ["equations", "applications"],
      "Three times a number decreased by 5 equals 22. Which equation represents this situation?",
      "किसी संख्या का तीन गुना, 5 कम करने पर 22 होता है। कौन-सी समीकरण सही है?",
      ["3x - 5 = 22", "3x + 5 = 22", "x - 5 = 22", "5x - 3 = 22"],
      ["3x - 5 = 22", "3x + 5 = 22", "x - 5 = 22", "5x - 3 = 22"],
      0,
      [
        "Translate each phrase carefully.",
        "Three times a number means 3x."
      ],
      [
        "प्रत्येक वाक्यांश को ध्यान से बदलिए।",
        "किसी संख्या का तीन गुना = 3x।"
      ],
      "Three times a number minus 5 equals 22 gives 3x - 5 = 22.",
      "किसी संख्या का तीन गुना 5 कम करने पर 22 होता है, इसलिए 3x - 5 = 22।",
      "medium",
      920
    ],

    [
      "7-math-se-10",
      ["equations", "solving"],
      "Solve: 3x - 5 = 22",
      "हल कीजिए: 3x - 5 = 22",
      ["9", "27", "7", "11"],
      ["9", "27", "7", "11"],
      0,
      [
        "Add 5 to both sides first.",
        "Then divide by 3."
      ],
      [
        "पहले दोनों पक्षों में 5 जोड़िए।",
        "फिर 3 से भाग दीजिए।"
      ],
      "3x = 27 ⇒ x = 9.",
      "3x = 27 ⇒ x = 9।",
      "medium",
      930
    ],

    [
      "7-math-se-11",
      ["equations", "olympiad"],
      "If x + x + x = 45, then x = ?",
      "यदि x + x + x = 45, तो x = ?",
      ["15", "45", "30", "10"],
      ["15", "45", "30", "10"],
      0,
      [
        "Combine like terms.",
        "3x = 45."
      ],
      [
        "समान पदों को जोड़िए।",
        "3x = 45 प्राप्त होगा।"
      ],
      "3x = 45 ⇒ x = 15.",
      "3x = 45 ⇒ x = 15।",
      "medium",
      940
    ],

    [
      "7-math-se-12",
      ["equations", "reasoning"],
      "The difference between a number and 12 is 18. What is the number?",
      "किसी संख्या और 12 का अंतर 18 है। संख्या क्या है?",
      ["30", "6", "18", "24"],
      ["30", "6", "18", "24"],
      0,
      [
        "Let the number be x.",
        "Form x - 12 = 18."
      ],
      [
        "संख्या को x मानिए।",
        "समीकरण x - 12 = 18 बनाइए।"
      ],
      "x = 18 + 12 = 30.",
      "x = 18 + 12 = 30।",
      "medium",
      950
    ],

    [
      "7-math-se-13",
      ["olympiad", "logic"],
      "A number when divided by 4 gives 11. What is the number?",
      "किसी संख्या को 4 से भाग देने पर 11 प्राप्त होता है। संख्या क्या है?",
      ["44", "15", "40", "48"],
      ["44", "15", "40", "48"],
      0,
      [
        "Use the inverse operation.",
        "Multiply 11 by 4."
      ],
      [
        "प्रतिलोम संक्रिया का उपयोग कीजिए।",
        "11 को 4 से गुणा कीजिए।"
      ],
      "Number = 11 × 4 = 44.",
      "संख्या = 11 × 4 = 44।",
      "medium",
      940
    ],

    [
      "7-math-se-14",
      ["equations", "olympiad"],
      "If 5x = 3x + 24, what is the value of x?",
      "यदि 5x = 3x + 24, तो x का मान क्या है?",
      ["12", "24", "8", "6"],
      ["12", "24", "8", "6"],
      0,
      [
        "Bring like terms together.",
        "Subtract 3x from both sides."
      ],
      [
        "समान पदों को एक ओर लाइए।",
        "दोनों पक्षों से 3x घटाइए।"
      ],
      "2x = 24 ⇒ x = 12.",
      "2x = 24 ⇒ x = 12।",
      "hard",
      980
    ],

    [
      "7-math-se-15",
      ["equations", "applications"],
      "The perimeter of a square is 36 cm. If each side is x cm, which equation is correct?",
      "एक वर्ग का परिमाप 36 सेमी है। यदि प्रत्येक भुजा x सेमी है, तो सही समीकरण कौन-सी होगी?",
      ["4x = 36", "x + 4 = 36", "x² = 36", "2x = 36"],
      ["4x = 36", "x + 4 = 36", "x² = 36", "2x = 36"],
      0,
      [
        "Perimeter of a square = 4 × side.",
        "Translate into an equation."
      ],
      [
        "वर्ग का परिमाप = 4 × भुजा।",
        "इसे समीकरण में बदलिए।"
      ],
      "Perimeter = 4x = 36.",
      "परिमाप = 4x = 36।",
      "medium",
      950
    ],

    [
      "7-math-se-16",
      ["olympiad", "multi-step"],
      "A number is increased by 8 and the result is doubled to obtain 40. What is the number?",
      "किसी संख्या में 8 जोड़कर परिणाम को दोगुना किया जाता है और 40 प्राप्त होता है। संख्या क्या है?",
      ["12", "20", "16", "8"],
      ["12", "20", "16", "8"],
      0,
      [
        "Form the equation 2(x + 8) = 40.",
        "Solve step by step."
      ],
      [
        "समीकरण 2(x + 8) = 40 बनाइए।",
        "चरणबद्ध हल कीजिए।"
      ],
      "2(x + 8) = 40 ⇒ x + 8 = 20 ⇒ x = 12.",
      "2(x + 8) = 40 ⇒ x + 8 = 20 ⇒ x = 12।",
      "hard",
      1000
    ],

    [
      "7-math-se-17",
      ["olympiad", "reasoning"],
      "The sum of two consecutive integers is 41. What is the smaller integer?",
      "दो क्रमागत पूर्णांकों का योग 41 है। छोटा पूर्णांक क्या है?",
      ["20", "21", "19", "22"],
      ["20", "21", "19", "22"],
      0,
      [
        "Let the smaller integer be x.",
        "The next integer is x + 1."
      ],
      [
        "छोटे पूर्णांक को x मानिए।",
        "अगला पूर्णांक x + 1 होगा।"
      ],
      "x + (x + 1) = 41 ⇒ 2x = 40 ⇒ x = 20.",
      "x + (x + 1) = 41 ⇒ 2x = 40 ⇒ x = 20।",
      "hard",
      1010
    ],

    [
      "7-math-se-18",
      ["olympiad", "money"],
      "A shopkeeper sells a notebook for ₹x. Three notebooks cost ₹126. What is x?",
      "एक दुकानदार एक कॉपी ₹x में बेचता है। तीन कॉपियों की कीमत ₹126 है। x का मान क्या होगा?",
      ["42", "126", "63", "36"],
      ["42", "126", "63", "36"],
      0,
      [
        "Form the equation 3x = 126.",
        "Divide both sides by 3."
      ],
      [
        "समीकरण 3x = 126 बनाइए।",
        "दोनों पक्षों को 3 से भाग दीजिए।"
      ],
      "x = 126 ÷ 3 = 42.",
      "x = 126 ÷ 3 = 42।",
      "medium",
      960
    ],

    [
      "7-math-se-19",
      ["olympiad", "challenge"],
      "If 4x + 3 = 31, what is the value of x?",
      "यदि 4x + 3 = 31, तो x का मान क्या है?",
      ["7", "8", "9", "6"],
      ["7", "8", "9", "6"],
      0,
      [
        "Subtract 3 first.",
        "Then divide by 4."
      ],
      [
        "पहले 3 घटाइए।",
        "फिर 4 से भाग दीजिए।"
      ],
      "4x = 28 ⇒ x = 7.",
      "4x = 28 ⇒ x = 7।",
      "hard",
      1020
    ],

    [
      "7-math-se-20",
      ["olympiad", "challenge"],
      "The age of a father is three times the age of his son. If their total age is 48 years, what is the son's age?",
      "एक पिता की आयु उसके पुत्र की आयु की तीन गुनी है। यदि उनकी कुल आयु 48 वर्ष है, तो पुत्र की आयु क्या है?",
      ["12 years", "16 years", "24 years", "18 years"],
      ["12 वर्ष", "16 वर्ष", "24 वर्ष", "18 वर्ष"],
      0,
      [
        "Let the son's age be x.",
        "Father's age will be 3x."
      ],
      [
        "पुत्र की आयु x मानिए।",
        "पिता की आयु 3x होगी।"
      ],
      "x + 3x = 48 ⇒ 4x = 48 ⇒ x = 12.",
      "x + 3x = 48 ⇒ 4x = 48 ⇒ x = 12।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 5,
  topicId: "math-lines-and-angles",
  chapterTitle: "Lines and Angles",
  chapterTitleHindi: "रेखाएँ और कोण",
  questions: makeQuestionSetFromConcepts("math-lines-and-angles", [

    [
      "7-math-la-01",
      ["geometry", "basics"],
      "A road extending endlessly in both directions is best represented in geometry by which figure?",
      "दोनों दिशाओं में अनंत तक फैली सड़क को ज्यामिति में किस आकृति द्वारा दर्शाया जाता है?",
      ["Line", "Line Segment", "Ray", "Point"],
      ["रेखा", "रेखाखंड", "किरण", "बिंदु"],
      0,
      [
        "Think about a figure with no endpoints.",
        "It extends infinitely in both directions."
      ],
      [
        "ऐसी आकृति के बारे में सोचिए जिसके कोई अंतिम बिंदु न हों।",
        "यह दोनों दिशाओं में अनंत तक फैली होती है।"
      ],
      "A line extends infinitely in both directions.",
      "रेखा दोनों दिशाओं में अनंत तक फैली होती है।",
      "easy",
      850
    ],

    [
      "7-math-la-02",
      ["geometry", "ray"],
      "Sunlight traveling from the Sun toward Earth is best represented by:",
      "सूर्य से पृथ्वी की ओर आने वाला प्रकाश किससे सबसे अच्छा प्रदर्शित किया जाता है?",
      ["Ray", "Line", "Point", "Line Segment"],
      ["किरण", "रेखा", "बिंदु", "रेखाखंड"],
      0,
      [
        "It starts from a point and extends in one direction.",
        "Think of a source of light."
      ],
      [
        "यह एक बिंदु से शुरू होकर एक दिशा में फैलती है।",
        "प्रकाश स्रोत के बारे में सोचिए।"
      ],
      "A ray has one endpoint and extends infinitely in one direction.",
      "किरण का एक प्रारंभिक बिंदु होता है और यह एक दिशा में अनंत तक जाती है।",
      "easy",
      860
    ],

    [
      "7-math-la-03",
      ["angles"],
      "Which angle measures exactly 90°?",
      "कौन-सा कोण ठीक 90° का होता है?",
      ["Right Angle", "Acute Angle", "Obtuse Angle", "Reflex Angle"],
      ["समकोण", "न्यूनकोण", "अधिककोण", "प्रतिवर्ती कोण"],
      0,
      [
        "Think of the corner of a square.",
        "It forms an L-shape."
      ],
      [
        "वर्ग के कोने के बारे में सोचिए।",
        "यह L आकार बनाता है।"
      ],
      "A right angle measures exactly 90°.",
      "समकोण का माप ठीक 90° होता है।",
      "easy",
      870
    ],

    [
      "7-math-la-04",
      ["angles", "classification"],
      "An angle measuring 65° is classified as:",
      "65° के कोण को किस प्रकार वर्गीकृत किया जाएगा?",
      ["Acute Angle", "Right Angle", "Obtuse Angle", "Straight Angle"],
      ["न्यूनकोण", "समकोण", "अधिककोण", "सरल कोण"],
      0,
      [
        "Acute angles are less than 90°.",
        "Compare 65° with 90°."
      ],
      [
        "न्यूनकोण 90° से छोटे होते हैं।",
        "65° की तुलना 90° से कीजिए।"
      ],
      "Since 65° < 90°, it is an acute angle.",
      "चूँकि 65° < 90° है, इसलिए यह न्यूनकोण है।",
      "easy",
      880
    ],

    [
      "7-math-la-05",
      ["angles", "classification"],
      "An angle measuring 135° is:",
      "135° का कोण क्या कहलाएगा?",
      ["Obtuse Angle", "Acute Angle", "Right Angle", "Straight Angle"],
      ["अधिककोण", "न्यूनकोण", "समकोण", "सरल कोण"],
      0,
      [
        "Obtuse angles lie between 90° and 180°.",
        "Compare 135° with these limits."
      ],
      [
        "अधिककोण 90° और 180° के बीच होते हैं।",
        "135° की इन सीमाओं से तुलना करें।"
      ],
      "135° lies between 90° and 180°, so it is obtuse.",
      "135° , 90° और 180° के बीच है, इसलिए यह अधिककोण है।",
      "easy",
      890
    ],

    [
      "7-math-la-06",
      ["linear-pair"],
      "Two adjacent angles form a straight line. Their sum is:",
      "दो संलग्न कोण मिलकर एक सीधी रेखा बनाते हैं। उनका योग कितना होगा?",
      ["180°", "90°", "360°", "270°"],
      ["180°", "90°", "360°", "270°"],
      0,
      [
        "Think about a straight angle.",
        "Linear pair property."
      ],
      [
        "सरल कोण के बारे में सोचिए।",
        "रेखीय युग्म का गुण याद कीजिए।"
      ],
      "Angles forming a linear pair sum to 180°.",
      "रेखीय युग्म के कोणों का योग 180° होता है।",
      "medium",
      900
    ],

    [
      "7-math-la-07",
      ["complementary-angles"],
      "If one angle of a complementary pair is 38°, the other angle is:",
      "यदि पूरक कोणों के युग्म में एक कोण 38° है, तो दूसरा कोण कितना होगा?",
      ["52°", "142°", "48°", "62°"],
      ["52°", "142°", "48°", "62°"],
      0,
      [
        "Complementary angles sum to 90°.",
        "Subtract from 90°."
      ],
      [
        "पूरक कोणों का योग 90° होता है।",
        "90° में से घटाइए।"
      ],
      "90° - 38° = 52°.",
      "90° - 38° = 52°।",
      "medium",
      910
    ],

    [
      "7-math-la-08",
      ["supplementary-angles"],
      "If one supplementary angle is 112°, find the other.",
      "यदि एक संपूरक कोण 112° है, तो दूसरा ज्ञात कीजिए।",
      ["68°", "78°", "58°", "48°"],
      ["68°", "78°", "58°", "48°"],
      0,
      [
        "Supplementary angles add to 180°.",
        "Subtract 112° from 180°."
      ],
      [
        "संपूरक कोणों का योग 180° होता है।",
        "180° में से 112° घटाइए।"
      ],
      "180° - 112° = 68°.",
      "180° - 112° = 68°।",
      "medium",
      920
    ],

    [
      "7-math-la-09",
      ["vertical-angles"],
      "When two lines intersect, vertically opposite angles are always:",
      "जब दो रेखाएँ प्रतिच्छेद करती हैं, तो शीर्षाभिमुख कोण सदैव कैसे होते हैं?",
      ["Equal", "Supplementary", "Complementary", "Unequal"],
      ["बराबर", "संपूरक", "पूरक", "असमान"],
      0,
      [
        "Recall the property of vertically opposite angles.",
        "They always have the same measure."
      ],
      [
        "शीर्षाभिमुख कोणों का गुण याद कीजिए।",
        "इनका माप हमेशा समान होता है।"
      ],
      "Vertically opposite angles are equal.",
      "शीर्षाभिमुख कोण बराबर होते हैं।",
      "medium",
      930
    ],

    [
      "7-math-la-10",
      ["parallel-lines"],
      "Two railway tracks running side by side without meeting represent:",
      "दो रेल पटरियाँ जो साथ-साथ चलती हैं और कभी नहीं मिलतीं, किसका उदाहरण हैं?",
      ["Parallel Lines", "Intersecting Lines", "Perpendicular Lines", "Rays"],
      ["समांतर रेखाएँ", "प्रतिच्छेदी रेखाएँ", "लंबवत रेखाएँ", "किरणें"],
      0,
      [
        "Think about lines that never meet.",
        "Distance between them remains constant."
      ],
      [
        "ऐसी रेखाओं के बारे में सोचिए जो कभी नहीं मिलतीं।",
        "उनके बीच की दूरी समान रहती है।"
      ],
      "Railway tracks are examples of parallel lines.",
      "रेल पटरियाँ समांतर रेखाओं का उदाहरण हैं।",
      "easy",
      890
    ],

    [
      "7-math-la-11",
      ["perpendicular-lines"],
      "The corner formed by two walls of a room is usually an example of:",
      "एक कमरे की दो दीवारों के बीच बनने वाला कोना सामान्यतः किसका उदाहरण है?",
      ["Perpendicular Lines", "Parallel Lines", "Intersecting Lines", "Ray"],
      ["लंबवत रेखाएँ", "समांतर रेखाएँ", "प्रतिच्छेदी रेखाएँ", "किरण"],
      0,
      [
        "Think about a right angle.",
        "Perpendicular lines meet at 90°."
      ],
      [
        "समकोण के बारे में सोचिए।",
        "लंबवत रेखाएँ 90° पर मिलती हैं।"
      ],
      "Walls generally meet at right angles, forming perpendicular lines.",
      "दीवारें सामान्यतः 90° पर मिलती हैं और लंबवत रेखाएँ बनाती हैं।",
      "easy",
      900
    ],

    [
      "7-math-la-12",
      ["olympiad", "angles"],
      "One angle of a linear pair is three times the other. Find the smaller angle.",
      "रेखीय युग्म का एक कोण दूसरे का तीन गुना है। छोटा कोण ज्ञात कीजिए।",
      ["45°", "60°", "30°", "90°"],
      ["45°", "60°", "30°", "90°"],
      0,
      [
        "Let smaller angle be x.",
        "x + 3x = 180°."
      ],
      [
        "छोटे कोण को x मानिए।",
        "x + 3x = 180° बनाइए।"
      ],
      "4x = 180°, x = 45°.",
      "4x = 180°, इसलिए x = 45°।",
      "hard",
      980
    ],

    [
      "7-math-la-13",
      ["olympiad", "angles"],
      "Two complementary angles are in the ratio 2:3. Find the larger angle.",
      "दो पूरक कोणों का अनुपात 2:3 है। बड़ा कोण ज्ञात कीजिए।",
      ["54°", "36°", "60°", "45°"],
      ["54°", "36°", "60°", "45°"],
      0,
      [
        "Let angles be 2x and 3x.",
        "Their sum is 90°."
      ],
      [
        "कोणों को 2x और 3x मानिए।",
        "इनका योग 90° होगा।"
      ],
      "5x = 90°, x = 18°, larger angle = 54°.",
      "5x = 90°, x = 18°, बड़ा कोण = 54°।",
      "hard",
      990
    ],

    [
      "7-math-la-14",
      ["olympiad", "vertically-opposite"],
      "If one of the vertically opposite angles formed by two intersecting lines measures 125°, what is the measure of its opposite angle?",
      "यदि दो प्रतिच्छेदी रेखाओं द्वारा बने शीर्षाभिमुख कोणों में से एक 125° है, तो उसका विपरीत कोण कितना होगा?",
      ["125°", "55°", "65°", "180°"],
      ["125°", "55°", "65°", "180°"],
      0,
      [
        "Vertically opposite angles are equal.",
        "Use the property directly."
      ],
      [
        "शीर्षाभिमुख कोण बराबर होते हैं।",
        "इस गुण का सीधे उपयोग कीजिए।"
      ],
      "The opposite angle is also 125°.",
      "विपरीत कोण भी 125° होगा।",
      "medium",
      950
    ],

    [
      "7-math-la-15",
      ["olympiad", "supplementary"],
      "One supplementary angle is twice the other. Find the larger angle.",
      "एक संपूरक कोण दूसरे का दुगुना है। बड़ा कोण ज्ञात कीजिए।",
      ["120°", "60°", "90°", "150°"],
      ["120°", "60°", "90°", "150°"],
      0,
      [
        "Let smaller angle be x.",
        "x + 2x = 180°."
      ],
      [
        "छोटे कोण को x मानिए।",
        "x + 2x = 180° बनाइए।"
      ],
      "3x = 180°, x = 60°, larger angle = 120°.",
      "3x = 180°, x = 60°, बड़ा कोण = 120°।",
      "hard",
      1000
    ],

    [
      "7-math-la-16",
      ["angles", "reasoning"],
      "Which angle is larger than a straight angle but smaller than a complete angle?",
      "कौन-सा कोण सरल कोण से बड़ा लेकिन पूर्ण कोण से छोटा होता है?",
      ["Reflex Angle", "Acute Angle", "Right Angle", "Obtuse Angle"],
      ["प्रतिवर्ती कोण", "न्यूनकोण", "समकोण", "अधिककोण"],
      0,
      [
        "Think of angles between 180° and 360°.",
        "These are called reflex angles."
      ],
      [
        "180° और 360° के बीच के कोणों के बारे में सोचिए।",
        "इन्हें प्रतिवर्ती कोण कहते हैं।"
      ],
      "A reflex angle lies between 180° and 360°.",
      "प्रतिवर्ती कोण 180° और 360° के बीच होता है।",
      "medium",
      960
    ],

    [
      "7-math-la-17",
      ["olympiad", "parallel-lines"],
      "If a transversal intersects two parallel lines and one corresponding angle measures 72°, the corresponding angle on the other line measures:",
      "यदि एक छेदक दो समांतर रेखाओं को काटती है और एक संगत कोण 72° है, तो दूसरी रेखा पर संगत कोण कितना होगा?",
      ["72°", "108°", "36°", "144°"],
      ["72°", "108°", "36°", "144°"],
      0,
      [
        "Corresponding angles are equal.",
        "Use the parallel line property."
      ],
      [
        "संगत कोण बराबर होते हैं।",
        "समांतर रेखाओं का गुण प्रयोग करें।"
      ],
      "Corresponding angles are equal, so it is 72°.",
      "संगत कोण बराबर होते हैं, इसलिए उत्तर 72° है।",
      "hard",
      1010
    ],

    [
      "7-math-la-18",
      ["olympiad", "geometry"],
      "How many right angles are formed when two perpendicular lines intersect?",
      "जब दो लंबवत रेखाएँ प्रतिच्छेद करती हैं, तो कितने समकोण बनते हैं?",
      ["4", "2", "1", "8"],
      ["4", "2", "1", "8"],
      0,
      [
        "Each intersection creates four angles.",
        "All are equal."
      ],
      [
        "प्रतिच्छेदन पर चार कोण बनते हैं।",
        "सभी समान होते हैं।"
      ],
      "Four right angles are formed.",
      "चार समकोण बनते हैं।",
      "medium",
      970
    ],

    [
      "7-math-la-19",
      ["olympiad", "challenge"],
      "The difference between two supplementary angles is 40°. Find the larger angle.",
      "दो संपूरक कोणों का अंतर 40° है। बड़ा कोण ज्ञात कीजिए।",
      ["110°", "70°", "140°", "100°"],
      ["110°", "70°", "140°", "100°"],
      0,
      [
        "Let angles be x and y.",
        "Use x + y = 180° and x − y = 40°."
      ],
      [
        "कोणों को x और y मानिए।",
        "x + y = 180° तथा x − y = 40° का उपयोग कीजिए।"
      ],
      "Solving gives x = 110° and y = 70°.",
      "हल करने पर x = 110° तथा y = 70° मिलता है।",
      "hard",
      1030
    ],

    [
      "7-math-la-20",
      ["olympiad", "challenge"],
      "An angle is four times its complementary angle. Find the larger angle.",
      "एक कोण अपने पूरक कोण का चार गुना है। बड़ा कोण ज्ञात कीजिए।",
      ["72°", "18°", "60°", "75°"],
      ["72°", "18°", "60°", "75°"],
      0,
      [
        "Let the smaller angle be x.",
        "x + 4x = 90°."
      ],
      [
        "छोटे कोण को x मानिए।",
        "x + 4x = 90° बनाइए।"
      ],
      "5x = 90°, x = 18°, larger angle = 72°.",
      "5x = 90°, x = 18°, बड़ा कोण = 72°।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 6,
  topicId: "math-triangle-and-its-properties",
  chapterTitle: "The Triangle and Its Properties",
  chapterTitleHindi: "त्रिभुज और उसके गुण",
  questions: makeQuestionSetFromConcepts("math-triangle-and-its-properties", [

    [
      "7-math-tri-01",
      ["triangle", "basics"],
      "A polygon has exactly three sides and three vertices. Which geometric figure is it?",
      "किसी बहुभुज की ठीक तीन भुजाएँ और तीन शीर्ष हैं। वह कौन-सी ज्यामितीय आकृति है?",
      ["Triangle", "Quadrilateral", "Pentagon", "Hexagon"],
      ["त्रिभुज", "चतुर्भुज", "पंचभुज", "षट्भुज"],
      0,
      [
        "Count the number of sides.",
        "A triangle always has three sides."
      ],
      [
        "भुजाओं की संख्या गिनिए।",
        "त्रिभुज में सदैव तीन भुजाएँ होती हैं।"
      ],
      "A polygon with three sides is called a triangle.",
      "तीन भुजाओं वाले बहुभुज को त्रिभुज कहते हैं।",
      "easy",
      850
    ],

    [
      "7-math-tri-02",
      ["angle-sum"],
      "The three angles of a triangle are 55°, 65° and x°. Find x.",
      "किसी त्रिभुज के तीन कोण 55°, 65° और x° हैं। x ज्ञात कीजिए।",
      ["60°", "70°", "50°", "80°"],
      ["60°", "70°", "50°", "80°"],
      0,
      [
        "The sum of angles in a triangle is 180°.",
        "Add the known angles first."
      ],
      [
        "त्रिभुज के कोणों का योग 180° होता है।",
        "पहले ज्ञात कोणों को जोड़िए।"
      ],
      "x = 180° - (55° + 65°) = 60°.",
      "x = 180° - (55° + 65°) = 60°।",
      "easy",
      870
    ],

    [
      "7-math-tri-03",
      ["classification"],
      "A triangle has all three sides equal. It is called:",
      "किसी त्रिभुज की तीनों भुजाएँ बराबर हैं। उसे क्या कहते हैं?",
      ["Equilateral Triangle", "Isosceles Triangle", "Scalene Triangle", "Right Triangle"],
      ["समबाहु त्रिभुज", "समद्विबाहु त्रिभुज", "विषमबाहु त्रिभुज", "समकोण त्रिभुज"],
      0,
      [
        "All sides have the same length.",
        "Think about equal-sided triangles."
      ],
      [
        "सभी भुजाओं की लंबाई समान है।",
        "समान भुजाओं वाले त्रिभुज के बारे में सोचिए।"
      ],
      "A triangle with all sides equal is an equilateral triangle.",
      "जिस त्रिभुज की सभी भुजाएँ बराबर हों, वह समबाहु त्रिभुज कहलाता है।",
      "easy",
      880
    ],

    [
      "7-math-tri-04",
      ["isosceles-triangle"],
      "In an isosceles triangle, two sides are equal. What can be said about the angles opposite those sides?",
      "समद्विबाहु त्रिभुज में दो भुजाएँ बराबर होती हैं। उन भुजाओं के सम्मुख कोणों के बारे में क्या कहा जा सकता है?",
      [
        "They are equal",
        "They are supplementary",
        "They are complementary",
        "They are always 90°"
      ],
      [
        "वे बराबर होते हैं",
        "वे संपूरक होते हैं",
        "वे पूरक होते हैं",
        "वे हमेशा 90° होते हैं"
      ],
      0,
      [
        "Recall the property of an isosceles triangle.",
        "Equal sides have equal opposite angles."
      ],
      [
        "समद्विबाहु त्रिभुज का गुण याद कीजिए।",
        "बराबर भुजाओं के सम्मुख कोण बराबर होते हैं।"
      ],
      "Angles opposite equal sides are equal.",
      "बराबर भुजाओं के सामने वाले कोण बराबर होते हैं।",
      "medium",
      900
    ],

    [
      "7-math-tri-05",
      ["angle-sum"],
      "Two angles of a triangle are 45° and 75°. What is the third angle?",
      "किसी त्रिभुज के दो कोण 45° और 75° हैं। तीसरा कोण क्या होगा?",
      ["60°", "50°", "70°", "80°"],
      ["60°", "50°", "70°", "80°"],
      0,
      [
        "The sum of angles is 180°.",
        "Subtract the sum of known angles."
      ],
      [
        "कोणों का कुल योग 180° होता है।",
        "ज्ञात कोणों का योग घटाइए।"
      ],
      "180° - (45° + 75°) = 60°.",
      "180° - (45° + 75°) = 60°।",
      "easy",
      890
    ],

    [
      "7-math-tri-06",
      ["right-triangle"],
      "A triangle has one angle equal to 90°. It is called:",
      "किसी त्रिभुज का एक कोण 90° है। उसे क्या कहते हैं?",
      ["Right Triangle", "Acute Triangle", "Obtuse Triangle", "Equilateral Triangle"],
      ["समकोण त्रिभुज", "न्यूनकोण त्रिभुज", "अधिककोण त्रिभुज", "समबाहु त्रिभुज"],
      0,
      [
        "Classify triangles based on angles.",
        "A 90° angle is a right angle."
      ],
      [
        "कोणों के आधार पर वर्गीकरण कीजिए।",
        "90° का कोण समकोण कहलाता है।"
      ],
      "A triangle containing a right angle is a right triangle.",
      "जिस त्रिभुज में समकोण हो, वह समकोण त्रिभुज कहलाता है।",
      "easy",
      900
    ],

    [
      "7-math-tri-07",
      ["exterior-angle"],
      "The exterior angle of a triangle is equal to:",
      "त्रिभुज का बाह्य कोण किसके बराबर होता है?",
      [
        "Sum of the two opposite interior angles",
        "Half the sum of all interior angles",
        "The adjacent interior angle",
        "Twice the opposite angle"
      ],
      [
        "दो विपरीत अंतःकोणों के योग के बराबर",
        "सभी अंतःकोणों के योग का आधा",
        "सन्निकट अंतःकोण",
        "विपरीत कोण का दोगुना"
      ],
      0,
      [
        "Recall the exterior angle property.",
        "Look at the two remote interior angles."
      ],
      [
        "बाह्य कोण का गुण याद कीजिए।",
        "दो दूरस्थ अंतःकोणों पर ध्यान दें।"
      ],
      "Exterior angle = sum of the two opposite interior angles.",
      "बाह्य कोण = दो विपरीत अंतःकोणों का योग।",
      "medium",
      920
    ],

    [
      "7-math-tri-08",
      ["triangle-inequality"],
      "Can lengths 3 cm, 4 cm and 8 cm form a triangle?",
      "क्या 3 सेमी, 4 सेमी और 8 सेमी लंबाइयाँ एक त्रिभुज बना सकती हैं?",
      ["No", "Yes", "Only a right triangle", "Cannot determine"],
      ["नहीं", "हाँ", "केवल समकोण त्रिभुज", "निर्धारित नहीं किया जा सकता"],
      0,
      [
        "Use the triangle inequality theorem.",
        "The sum of two sides must be greater than the third side."
      ],
      [
        "त्रिभुज असमता प्रमेय का उपयोग करें।",
        "दो भुजाओं का योग तीसरी भुजा से बड़ा होना चाहिए।"
      ],
      "3 + 4 = 7 < 8, so a triangle cannot be formed.",
      "3 + 4 = 7 < 8, इसलिए त्रिभुज नहीं बन सकता।",
      "medium",
      930
    ],

    [
      "7-math-tri-09",
      ["triangle-inequality"],
      "Which set of lengths can form a triangle?",
      "निम्न में से कौन-सी लंबाइयाँ त्रिभुज बना सकती हैं?",
      ["5 cm, 6 cm, 7 cm", "2 cm, 3 cm, 6 cm", "4 cm, 5 cm, 10 cm", "1 cm, 2 cm, 4 cm"],
      ["5 सेमी, 6 सेमी, 7 सेमी", "2 सेमी, 3 सेमी, 6 सेमी", "4 सेमी, 5 सेमी, 10 सेमी", "1 सेमी, 2 सेमी, 4 सेमी"],
      0,
      [
        "Check the triangle inequality.",
        "Sum of any two sides must exceed the third."
      ],
      [
        "त्रिभुज असमता की जाँच कीजिए।",
        "किसी भी दो भुजाओं का योग तीसरी से बड़ा होना चाहिए।"
      ],
      "5+6>7, 6+7>5 and 5+7>6, so a triangle is possible.",
      "5+6>7, 6+7>5 तथा 5+7>6, इसलिए त्रिभुज बन सकता है।",
      "medium",
      940
    ],

    [
      "7-math-tri-10",
      ["median"],
      "A line segment joining a vertex of a triangle to the midpoint of the opposite side is called:",
      "त्रिभुज के किसी शीर्ष को विपरीत भुजा के मध्यबिंदु से जोड़ने वाला रेखाखंड क्या कहलाता है?",
      ["Median", "Altitude", "Angle Bisector", "Perpendicular Bisector"],
      ["मध्यिका", "लंब", "कोण समद्विभाजक", "लंब समद्विभाजक"],
      0,
      [
        "It connects a vertex and midpoint.",
        "Recall triangle terminology."
      ],
      [
        "यह शीर्ष और मध्यबिंदु को जोड़ता है।",
        "त्रिभुज की शब्दावली याद कीजिए।"
      ],
      "Such a segment is called a median.",
      "ऐसे रेखाखंड को मध्यिका कहते हैं।",
      "easy",
      900
    ],

    [
      "7-math-tri-11",
      ["altitude"],
      "A perpendicular drawn from a vertex to the opposite side of a triangle is called:",
      "त्रिभुज के किसी शीर्ष से विपरीत भुजा पर खींचा गया लंब क्या कहलाता है?",
      ["Altitude", "Median", "Bisector", "Chord"],
      ["लंब", "मध्यिका", "समद्विभाजक", "जीवा"],
      0,
      [
        "It forms a right angle with the side.",
        "Think of height."
      ],
      [
        "यह भुजा पर समकोण बनाता है।",
        "ऊँचाई के बारे में सोचिए।"
      ],
      "This perpendicular segment is called an altitude.",
      "इस लंब रेखाखंड को त्रिभुज का लंब कहते हैं।",
      "easy",
      910
    ],

    [
      "7-math-tri-12",
      ["olympiad", "angle-sum"],
      "Two angles of a triangle are in the ratio 2:3 and the third angle is 60°. Find the largest angle.",
      "किसी त्रिभुज के दो कोणों का अनुपात 2:3 है और तीसरा कोण 60° है। सबसे बड़ा कोण ज्ञात कीजिए।",
      ["72°", "48°", "60°", "90°"],
      ["72°", "48°", "60°", "90°"],
      0,
      [
        "Remaining angle sum = 180° - 60°.",
        "Divide according to the ratio."
      ],
      [
        "शेष कोणों का योग = 180° - 60°।",
        "अनुपात के अनुसार बाँटिए।"
      ],
      "Remaining sum = 120°. Ratio 2:3 ⇒ 48° and 72°. Largest = 72°.",
      "शेष योग = 120°। अनुपात 2:3 ⇒ 48° और 72°। बड़ा कोण 72° है।",
      "hard",
      980
    ],

    [
      "7-math-tri-13",
      ["olympiad", "isosceles"],
      "In an isosceles triangle, the vertex angle is 40°. What is each base angle?",
      "एक समद्विबाहु त्रिभुज में शीर्ष कोण 40° है। प्रत्येक आधार कोण कितना होगा?",
      ["70°", "60°", "80°", "40°"],
      ["70°", "60°", "80°", "40°"],
      0,
      [
        "Base angles are equal.",
        "Sum of angles is 180°."
      ],
      [
        "आधार कोण बराबर होते हैं।",
        "कोणों का योग 180° होता है।"
      ],
      "Remaining angle sum = 140°. Each base angle = 70°.",
      "शेष योग = 140°। प्रत्येक आधार कोण = 70°।",
      "hard",
      990
    ],

    [
      "7-math-tri-14",
      ["olympiad", "exterior-angle"],
      "An exterior angle of a triangle measures 130°. One opposite interior angle is 55°. Find the other opposite interior angle.",
      "किसी त्रिभुज का बाह्य कोण 130° है। एक विपरीत अंतःकोण 55° है। दूसरा विपरीत अंतःकोण ज्ञात कीजिए।",
      ["75°", "65°", "85°", "70°"],
      ["75°", "65°", "85°", "70°"],
      0,
      [
        "Exterior angle equals sum of opposite interior angles.",
        "Subtract 55° from 130°."
      ],
      [
        "बाह्य कोण = दो विपरीत अंतःकोणों का योग।",
        "130° में से 55° घटाइए।"
      ],
      "130° - 55° = 75°.",
      "130° - 55° = 75°।",
      "hard",
      1000
    ],

    [
      "7-math-tri-15",
      ["olympiad", "classification"],
      "A triangle has angles 35°, 55° and 90°. It is classified as:",
      "किसी त्रिभुज के कोण 35°, 55° और 90° हैं। इसे किस प्रकार वर्गीकृत किया जाएगा?",
      ["Right-angled Triangle", "Acute Triangle", "Obtuse Triangle", "Equilateral Triangle"],
      ["समकोण त्रिभुज", "न्यूनकोण त्रिभुज", "अधिककोण त्रिभुज", "समबाहु त्रिभुज"],
      0,
      [
        "One angle is 90°.",
        "Classify using angles."
      ],
      [
        "एक कोण 90° है।",
        "कोणों के आधार पर वर्गीकरण करें।"
      ],
      "A triangle with one 90° angle is right-angled.",
      "90° वाला त्रिभुज समकोण त्रिभुज कहलाता है।",
      "medium",
      950
    ],

    [
      "7-math-tri-16",
      ["olympiad", "triangle-inequality"],
      "The two sides of a triangle are 9 cm and 14 cm. Which of the following can be the third side?",
      "त्रिभुज की दो भुजाएँ 9 सेमी और 14 सेमी हैं। निम्न में से कौन-सी तीसरी भुजा हो सकती है?",
      ["20 cm", "25 cm", "4 cm", "30 cm"],
      ["20 सेमी", "25 सेमी", "4 सेमी", "30 सेमी"],
      0,
      [
        "The third side must be less than 23 and greater than 5.",
        "Apply triangle inequality."
      ],
      [
        "तीसरी भुजा 23 से कम और 5 से अधिक होनी चाहिए।",
        "त्रिभुज असमता का प्रयोग करें।"
      ],
      "Only 20 cm satisfies the condition.",
      "केवल 20 सेमी शर्त को पूरा करती है।",
      "hard",
      1010
    ],

    [
      "7-math-tri-17",
      ["olympiad", "reasoning"],
      "Which triangle always has all three angles equal?",
      "कौन-सा त्रिभुज सदैव तीनों कोणों को बराबर रखता है?",
      ["Equilateral Triangle", "Scalene Triangle", "Right Triangle", "Obtuse Triangle"],
      ["समबाहु त्रिभुज", "विषमबाहु त्रिभुज", "समकोण त्रिभुज", "अधिककोण त्रिभुज"],
      0,
      [
        "Equal sides imply equal angles.",
        "Think of symmetry."
      ],
      [
        "बराबर भुजाएँ बराबर कोण देती हैं।",
        "सममिति के बारे में सोचिए।"
      ],
      "Each angle in an equilateral triangle is 60°.",
      "समबाहु त्रिभुज का प्रत्येक कोण 60° होता है।",
      "medium",
      960
    ],

    [
      "7-math-tri-18",
      ["olympiad", "challenge"],
      "The angles of a triangle are x°, 2x° and 3x°. Find the largest angle.",
      "किसी त्रिभुज के कोण x°, 2x° और 3x° हैं। सबसे बड़ा कोण ज्ञात कीजिए।",
      ["90°", "60°", "120°", "45°"],
      ["90°", "60°", "120°", "45°"],
      0,
      [
        "Sum of angles = 180°.",
        "x + 2x + 3x = 180°."
      ],
      [
        "कोणों का योग = 180°।",
        "x + 2x + 3x = 180° बनाइए।"
      ],
      "6x = 180° ⇒ x = 30°. Largest angle = 3x = 90°.",
      "6x = 180° ⇒ x = 30°। सबसे बड़ा कोण = 90°।",
      "hard",
      1030
    ],

    [
      "7-math-tri-19",
      ["olympiad", "challenge"],
      "A triangle has sides 7 cm, 24 cm and 25 cm. What type of triangle is it?",
      "किसी त्रिभुज की भुजाएँ 7 सेमी, 24 सेमी और 25 सेमी हैं। यह किस प्रकार का त्रिभुज है?",
      ["Right Triangle", "Equilateral Triangle", "Isosceles Triangle", "Obtuse Triangle"],
      ["समकोण त्रिभुज", "समबाहु त्रिभुज", "समद्विबाहु त्रिभुज", "अधिककोण त्रिभुज"],
      0,
      [
        "Check Pythagoras: 7² + 24².",
        "Compare with 25²."
      ],
      [
        "पाइथागोरस जाँचिए: 7² + 24²।",
        "25² से तुलना कीजिए।"
      ],
      "49 + 576 = 625 = 25², so it is right-angled.",
      "49 + 576 = 625 = 25², इसलिए यह समकोण त्रिभुज है।",
      "hard",
      1040
    ],

    [
      "7-math-tri-20",
      ["olympiad", "challenge"],
      "In a triangle, the exterior angle is 145° and one remote interior angle is 65°. Find the interior angle adjacent to the exterior angle.",
      "किसी त्रिभुज में बाह्य कोण 145° है और एक दूरस्थ अंतःकोण 65° है। बाह्य कोण के सन्निकट अंतःकोण का मान ज्ञात कीजिए।",
      ["35°", "80°", "65°", "45°"],
      ["35°", "80°", "65°", "45°"],
      0,
      [
        "Interior adjacent angle + exterior angle = 180°.",
        "Use the linear pair property."
      ],
      [
        "सन्निकट अंतःकोण + बाह्य कोण = 180°।",
        "रेखीय युग्म का गुण प्रयोग करें।"
      ],
      "Adjacent interior angle = 180° - 145° = 35°.",
      "सन्निकट अंतःकोण = 180° - 145° = 35°।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 7,
  topicId: "math-congruence-of-triangles",
  chapterTitle: "Congruence of Triangles",
  chapterTitleHindi: "त्रिभुजों की सर्वांगसमता",
  questions: makeQuestionSetFromConcepts("math-congruence-of-triangles", [

    [
      "7-math-ct-01",
      ["congruence", "basics"],
      "Two triangles have exactly the same shape and size. Such triangles are called:",
      "दो त्रिभुजों का आकार और माप बिल्कुल समान है। ऐसे त्रिभुज क्या कहलाते हैं?",
      ["Congruent Triangles", "Similar Triangles", "Scalene Triangles", "Right Triangles"],
      ["सर्वांगसम त्रिभुज", "सदृश त्रिभुज", "विषमबाहु त्रिभुज", "समकोण त्रिभुज"],
      0,
      [
        "Think about identical shape and size.",
        "Congruent means exactly equal in all measurements."
      ],
      [
        "आकार और माप दोनों समान होने चाहिए।",
        "सर्वांगसम का अर्थ है सभी मापों में समान।"
      ],
      "Triangles with the same shape and size are called congruent triangles.",
      "समान आकार और समान माप वाले त्रिभुज सर्वांगसम कहलाते हैं।",
      "easy",
      850
    ],

    [
      "7-math-ct-02",
      ["congruence", "notation"],
      "Which symbol is used to denote congruence between two triangles?",
      "दो त्रिभुजों की सर्वांगसमता दर्शाने के लिए कौन-सा चिन्ह प्रयोग किया जाता है?",
      ["≅", "≈", "=", "∥"],
      ["≅", "≈", "=", "∥"],
      0,
      [
        "Recall the symbol used in geometry.",
        "It is not the equality sign."
      ],
      [
        "ज्यामिति में प्रयुक्त चिन्ह याद कीजिए।",
        "यह बराबरी (=) का चिन्ह नहीं है।"
      ],
      "The symbol ≅ denotes congruence.",
      "सर्वांगसमता दर्शाने के लिए ≅ चिन्ह का प्रयोग किया जाता है।",
      "easy",
      860
    ],

    [
      "7-math-ct-03",
      ["cpct"],
      "If two triangles are congruent, what can be said about their corresponding sides?",
      "यदि दो त्रिभुज सर्वांगसम हैं, तो उनकी संगत भुजाओं के बारे में क्या कहा जा सकता है?",
      [
        "They are equal in length",
        "They are parallel",
        "They are perpendicular",
        "They are unequal"
      ],
      [
        "वे लंबाई में बराबर होती हैं",
        "वे समांतर होती हैं",
        "वे लंबवत होती हैं",
        "वे असमान होती हैं"
      ],
      0,
      [
        "Think about CPCT.",
        "Corresponding parts are equal."
      ],
      [
        "CPCT के बारे में सोचिए।",
        "संगत भाग बराबर होते हैं।"
      ],
      "Corresponding sides of congruent triangles are equal.",
      "सर्वांगसम त्रिभुजों की संगत भुजाएँ बराबर होती हैं।",
      "easy",
      870
    ],

    [
      "7-math-ct-04",
      ["sss"],
      "If all three sides of one triangle are equal to the corresponding three sides of another triangle, which congruence rule applies?",
      "यदि एक त्रिभुज की तीनों भुजाएँ दूसरे त्रिभुज की संगत तीनों भुजाओं के बराबर हों, तो कौन-सा सर्वांगसमता नियम लागू होगा?",
      ["SSS", "SAS", "ASA", "RHS"],
      ["SSS", "SAS", "ASA", "RHS"],
      0,
      [
        "Count the number of equal sides given.",
        "All three sides are known."
      ],
      [
        "बराबर भुजाओं की संख्या गिनिए।",
        "तीनों भुजाएँ ज्ञात हैं।"
      ],
      "This is the Side-Side-Side (SSS) congruence criterion.",
      "यह भुजा-भुजा-भुजा (SSS) सर्वांगसमता नियम है।",
      "easy",
      880
    ],

    [
      "7-math-ct-05",
      ["sas"],
      "Two sides and the included angle of one triangle are equal to the corresponding parts of another triangle. Which criterion proves congruence?",
      "एक त्रिभुज की दो भुजाएँ और उनके बीच का कोण दूसरे त्रिभुज के संगत भागों के बराबर हैं। कौन-सा नियम सर्वांगसमता सिद्ध करेगा?",
      ["SAS", "SSS", "ASA", "RHS"],
      ["SAS", "SSS", "ASA", "RHS"],
      0,
      [
        "Two sides and included angle are given.",
        "Think Side-Angle-Side."
      ],
      [
        "दो भुजाएँ और बीच का कोण दिया गया है।",
        "भुजा-कोण-भुजा के बारे में सोचिए।"
      ],
      "This is the SAS congruence criterion.",
      "यह SAS (भुजा-कोण-भुजा) सर्वांगसमता नियम है।",
      "easy",
      890
    ],

    [
      "7-math-ct-06",
      ["asa"],
      "If two angles and the included side of one triangle are equal to those of another triangle, which rule proves congruence?",
      "यदि एक त्रिभुज के दो कोण और उनके बीच की भुजा दूसरे त्रिभुज के बराबर हों, तो कौन-सा नियम सर्वांगसमता सिद्ध करेगा?",
      ["ASA", "SSS", "SAS", "RHS"],
      ["ASA", "SSS", "SAS", "RHS"],
      0,
      [
        "Two angles and one side are given.",
        "Look for Angle-Side-Angle."
      ],
      [
        "दो कोण और एक भुजा दी गई है।",
        "कोण-भुजा-कोण नियम सोचिए।"
      ],
      "This is the ASA congruence criterion.",
      "यह ASA (कोण-भुजा-कोण) सर्वांगसमता नियम है।",
      "easy",
      900
    ],

    [
      "7-math-ct-07",
      ["rhs"],
      "Which congruence criterion is specifically used for right-angled triangles?",
      "समकोण त्रिभुजों के लिए विशेष रूप से कौन-सा सर्वांगसमता नियम प्रयोग किया जाता है?",
      ["RHS", "ASA", "SAS", "SSS"],
      ["RHS", "ASA", "SAS", "SSS"],
      0,
      [
        "Think about right angle, hypotenuse and side.",
        "Only one criterion is specific to right triangles."
      ],
      [
        "समकोण, कर्ण और भुजा के बारे में सोचिए।",
        "यह नियम केवल समकोण त्रिभुजों के लिए होता है।"
      ],
      "RHS stands for Right angle-Hypotenuse-Side.",
      "RHS का अर्थ है समकोण-कर्ण-भुजा नियम।",
      "easy",
      910
    ],

    [
      "7-math-ct-08",
      ["cpct"],
      "CPCT stands for:",
      "CPCT का पूर्ण रूप क्या है?",
      [
        "Corresponding Parts of Congruent Triangles are Equal",
        "Congruent Parts of Corresponding Triangles are Equal",
        "Corresponding Points of Congruent Triangles",
        "Common Parts of Congruent Triangles"
      ],
      [
        "सर्वांगसम त्रिभुजों के संगत भाग बराबर होते हैं",
        "संगत त्रिभुजों के सर्वांगसम भाग बराबर होते हैं",
        "सर्वांगसम त्रिभुजों के संगत बिंदु",
        "सर्वांगसम त्रिभुजों के सामान्य भाग"
      ],
      0,
      [
        "A famous theorem used after proving congruence.",
        "Focus on corresponding parts."
      ],
      [
        "यह सर्वांगसमता सिद्ध करने के बाद प्रयोग होता है।",
        "संगत भागों पर ध्यान दीजिए।"
      ],
      "CPCT means Corresponding Parts of Congruent Triangles are Equal.",
      "CPCT का अर्थ है सर्वांगसम त्रिभुजों के संगत भाग बराबर होते हैं।",
      "medium",
      920
    ],

    [
      "7-math-ct-09",
      ["sss", "reasoning"],
      "Triangles ABC and DEF have AB = DE, BC = EF and AC = DF. Which criterion proves they are congruent?",
      "त्रिभुज ABC और DEF में AB = DE, BC = EF तथा AC = DF है। कौन-सा नियम उनकी सर्वांगसमता सिद्ध करता है?",
      ["SSS", "SAS", "ASA", "RHS"],
      ["SSS", "SAS", "ASA", "RHS"],
      0,
      [
        "All three sides are equal.",
        "No angle information is needed."
      ],
      [
        "तीनों भुजाएँ बराबर हैं।",
        "कोणों की जानकारी आवश्यक नहीं है।"
      ],
      "Three corresponding sides are equal, so SSS applies.",
      "तीनों संगत भुजाएँ बराबर हैं, इसलिए SSS लागू होगा।",
      "medium",
      930
    ],

    [
      "7-math-ct-10",
      ["sas", "reasoning"],
      "In triangles PQR and XYZ, PQ = XY, ∠P = ∠X and PR = XZ. Which criterion proves congruence?",
      "त्रिभुज PQR और XYZ में PQ = XY, ∠P = ∠X तथा PR = XZ है। कौन-सा नियम सर्वांगसमता सिद्ध करेगा?",
      ["SAS", "SSS", "ASA", "RHS"],
      ["SAS", "SSS", "ASA", "RHS"],
      0,
      [
        "Two sides and included angle are equal.",
        "Identify the included angle."
      ],
      [
        "दो भुजाएँ और बीच का कोण बराबर है।",
        "अंतर्विष्ट कोण की पहचान कीजिए।"
      ],
      "This matches the SAS criterion.",
      "यह SAS नियम को संतुष्ट करता है।",
      "medium",
      940
    ],

    [
      "7-math-ct-11",
      ["asa", "angles"],
      "If two angles of a triangle are 50° and 60°, what is the third angle?",
      "यदि किसी त्रिभुज के दो कोण 50° और 60° हैं, तो तीसरा कोण कितना होगा?",
      ["70°", "80°", "60°", "90°"],
      ["70°", "80°", "60°", "90°"],
      0,
      [
        "Sum of angles in a triangle is 180°.",
        "Subtract the known angles."
      ],
      [
        "त्रिभुज के कोणों का योग 180° होता है।",
        "ज्ञात कोणों को घटाइए।"
      ],
      "180° - (50° + 60°) = 70°.",
      "180° - (50° + 60°) = 70°।",
      "easy",
      900
    ],

    [
      "7-math-ct-12",
      ["rhs", "right-triangle"],
      "Two right triangles have equal hypotenuse and one corresponding side equal. Which criterion proves congruence?",
      "दो समकोण त्रिभुजों का कर्ण और एक संगत भुजा बराबर है। कौन-सा नियम सर्वांगसमता सिद्ध करेगा?",
      ["RHS", "SAS", "ASA", "SSS"],
      ["RHS", "SAS", "ASA", "SSS"],
      0,
      [
        "Think specifically about right triangles.",
        "Hypotenuse is mentioned."
      ],
      [
        "विशेष रूप से समकोण त्रिभुजों के बारे में सोचिए।",
        "कर्ण का उल्लेख किया गया है।"
      ],
      "RHS is used when right angle, hypotenuse and one side are equal.",
      "समकोण, कर्ण और एक भुजा बराबर होने पर RHS नियम लागू होता है।",
      "medium",
      950
    ],

    [
      "7-math-ct-13",
      ["olympiad", "cpct"],
      "After proving ΔABC ≅ ΔPQR, which statement must be true?",
      "ΔABC ≅ ΔPQR सिद्ध करने के बाद कौन-सा कथन अवश्य सत्य होगा?",
      ["∠A = ∠P", "AB > PQ", "BC ≠ QR", "AC < PR"],
      ["∠A = ∠P", "AB > PQ", "BC ≠ QR", "AC < PR"],
      0,
      [
        "Use CPCT.",
        "Corresponding parts are equal."
      ],
      [
        "CPCT का प्रयोग कीजिए।",
        "संगत भाग बराबर होते हैं।"
      ],
      "Corresponding angles of congruent triangles are equal.",
      "सर्वांगसम त्रिभुजों के संगत कोण बराबर होते हैं।",
      "hard",
      980
    ],

    [
      "7-math-ct-14",
      ["olympiad", "sss"],
      "The sides of two triangles are (5 cm, 7 cm, 9 cm) and (9 cm, 5 cm, 7 cm). What can be concluded?",
      "दो त्रिभुजों की भुजाएँ क्रमशः (5 सेमी, 7 सेमी, 9 सेमी) और (9 सेमी, 5 सेमी, 7 सेमी) हैं। क्या निष्कर्ष निकाला जा सकता है?",
      [
        "The triangles are congruent",
        "The triangles are not congruent",
        "The triangles are similar only",
        "Cannot be determined"
      ],
      [
        "त्रिभुज सर्वांगसम हैं",
        "त्रिभुज सर्वांगसम नहीं हैं",
        "केवल सदृश हैं",
        "निर्धारित नहीं किया जा सकता"
      ],
      0,
      [
        "Compare the three side lengths.",
        "Order of sides does not matter."
      ],
      [
        "तीनों भुजाओं की तुलना कीजिए।",
        "भुजाओं का क्रम महत्वपूर्ण नहीं है।"
      ],
      "All three corresponding sides are equal, so the triangles are congruent by SSS.",
      "तीनों संगत भुजाएँ बराबर हैं, इसलिए SSS से त्रिभुज सर्वांगसम हैं।",
      "hard",
      990
    ],

    [
      "7-math-ct-15",
      ["olympiad", "angles"],
      "Two congruent triangles each have one angle measuring 48°. What is the measure of the corresponding angle in the other triangle?",
      "दो सर्वांगसम त्रिभुजों में से एक का कोण 48° है। दूसरे त्रिभुज का संगत कोण कितना होगा?",
      ["48°", "132°", "96°", "24°"],
      ["48°", "132°", "96°", "24°"],
      0,
      [
        "Congruent triangles have equal corresponding angles.",
        "Use CPCT."
      ],
      [
        "सर्वांगसम त्रिभुजों के संगत कोण बराबर होते हैं।",
        "CPCT का उपयोग कीजिए।"
      ],
      "The corresponding angle is also 48°.",
      "संगत कोण भी 48° होगा।",
      "medium",
      960
    ],

    [
      "7-math-ct-16",
      ["olympiad", "reasoning"],
      "Which of the following information is NOT sufficient to prove congruence of two triangles?",
      [
        "Three equal angles only",
        "Three equal sides",
        "Two sides and included angle",
        "Two angles and included side"
      ],
      [
        "केवल तीन बराबर कोण",
        "तीन बराबर भुजाएँ",
        "दो भुजाएँ और अंतर्विष्ट कोण",
        "दो कोण और अंतर्विष्ट भुजा"
      ],
      0,
      [
        "Equal angles may produce similar triangles.",
        "Congruence requires size equality too."
      ],
      [
        "बराबर कोण केवल सदृशता भी दे सकते हैं।",
        "सर्वांगसमता के लिए आकार भी समान होना चाहिए।"
      ],
      "AAA proves similarity, not congruence.",
      "AAA केवल सदृशता सिद्ध करता है, सर्वांगसमता नहीं।",
      "hard",
      1000
    ],

    [
      "7-math-ct-17",
      ["olympiad", "cpct"],
      "ΔABC ≅ ΔDEF and AB = 12 cm. What is DE?",
      "यदि ΔABC ≅ ΔDEF तथा AB = 12 सेमी है, तो DE कितना होगा?",
      ["12 cm", "24 cm", "6 cm", "Cannot be determined"],
      ["12 सेमी", "24 सेमी", "6 सेमी", "निर्धारित नहीं किया जा सकता"],
      0,
      [
        "Look at the order of vertices.",
        "Corresponding sides are equal."
      ],
      [
        "शीर्षों के क्रम पर ध्यान दीजिए।",
        "संगत भुजाएँ बराबर होती हैं।"
      ],
      "AB corresponds to DE, so DE = 12 cm.",
      "AB, DE के संगत है, इसलिए DE = 12 सेमी।",
      "hard",
      1010
    ],

    [
      "7-math-ct-18",
      ["olympiad", "geometry"],
      "In two congruent triangles, the perimeter of one triangle is 27 cm. What is the perimeter of the other triangle?",
      "दो सर्वांगसम त्रिभुजों में से एक का परिमाप 27 सेमी है। दूसरे त्रिभुज का परिमाप कितना होगा?",
      ["27 cm", "54 cm", "13.5 cm", "Cannot be determined"],
      ["27 सेमी", "54 सेमी", "13.5 सेमी", "निर्धारित नहीं किया जा सकता"],
      0,
      [
        "Congruent triangles have equal side lengths.",
        "Hence their perimeters are equal."
      ],
      [
        "सर्वांगसम त्रिभुजों की भुजाएँ बराबर होती हैं।",
        "इसलिए उनके परिमाप भी बराबर होंगे।"
      ],
      "Congruent triangles have equal perimeters.",
      "सर्वांगसम त्रिभुजों के परिमाप बराबर होते हैं।",
      "hard",
      1020
    ],

    [
      "7-math-ct-19",
      ["olympiad", "challenge"],
      "A right triangle has hypotenuse 13 cm and one side 5 cm. Another right triangle has hypotenuse 13 cm and one side 5 cm. Which criterion proves the triangles congruent?",
      "एक समकोण त्रिभुज का कर्ण 13 सेमी और एक भुजा 5 सेमी है। दूसरे समकोण त्रिभुज का भी कर्ण 13 सेमी और एक भुजा 5 सेमी है। कौन-सा नियम सर्वांगसमता सिद्ध करेगा?",
      ["RHS", "ASA", "SAS", "SSS"],
      ["RHS", "ASA", "SAS", "SSS"],
      0,
      [
        "Both triangles are right-angled.",
        "Hypotenuse and one side are equal."
      ],
      [
        "दोनों त्रिभुज समकोण त्रिभुज हैं।",
        "कर्ण और एक भुजा बराबर है।"
      ],
      "The RHS criterion proves congruence.",
      "RHS नियम सर्वांगसमता सिद्ध करता है।",
      "hard",
      1035
    ],

    [
      "7-math-ct-20",
      ["olympiad", "challenge"],
      "If ΔABC ≅ ΔPQR, AB = 7 cm, BC = 9 cm and AC = 11 cm, what is the perimeter of ΔPQR?",
      "यदि ΔABC ≅ ΔPQR, AB = 7 सेमी, BC = 9 सेमी तथा AC = 11 सेमी हैं, तो ΔPQR का परिमाप कितना होगा?",
      ["27 cm", "54 cm", "18 cm", "11 cm"],
      ["27 सेमी", "54 सेमी", "18 सेमी", "11 सेमी"],
      0,
      [
        "Congruent triangles have equal corresponding sides.",
        "Find the perimeter of ΔABC first."
      ],
      [
        "सर्वांगसम त्रिभुजों की संगत भुजाएँ बराबर होती हैं।",
        "पहले ΔABC का परिमाप ज्ञात कीजिए।"
      ],
      "Perimeter = 7 + 9 + 11 = 27 cm. Hence ΔPQR also has perimeter 27 cm.",
      "परिमाप = 7 + 9 + 11 = 27 सेमी। इसलिए ΔPQR का परिमाप भी 27 सेमी होगा।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 8,
  topicId: "math-comparing-quantities",
  chapterTitle: "Comparing Quantities",
  chapterTitleHindi: "राशियों की तुलना",
  questions: makeQuestionSetFromConcepts("math-comparing-quantities", [

    [
      "7-math-cq-01",
      ["ratio"],
      "In a class of 36 students, 20 are boys and 16 are girls. What is the ratio of boys to girls in its simplest form?",
      "36 विद्यार्थियों की एक कक्षा में 20 लड़के और 16 लड़कियाँ हैं। लड़कों और लड़कियों का अनुपात सरलतम रूप में क्या होगा?",
      ["5:4", "4:5", "20:16", "9:8"],
      ["5:4", "4:5", "20:16", "9:8"],
      0,
      [
        "Write the ratio as 20:16.",
        "Divide both terms by their HCF."
      ],
      [
        "अनुपात 20:16 लिखिए।",
        "दोनों पदों को उनके महत्तम समापवर्तक से भाग दीजिए।"
      ],
      "20:16 = 5:4.",
      "20:16 = 5:4।",
      "easy",
      850
    ],

    [
      "7-math-cq-02",
      ["percentage"],
      "What percentage of 200 is 50?",
      "200 का 50 कितना प्रतिशत है?",
      ["25%", "20%", "50%", "40%"],
      ["25%", "20%", "50%", "40%"],
      0,
      [
        "Use Percentage = (Part/Whole) × 100.",
        "Substitute the values carefully."
      ],
      [
        "प्रतिशत = (भाग/कुल) × 100 का उपयोग कीजिए।",
        "मानों को सावधानीपूर्वक रखिए।"
      ],
      "50/200 × 100 = 25%.",
      "50/200 × 100 = 25%।",
      "easy",
      860
    ],

    [
      "7-math-cq-03",
      ["percentage"],
      "A student scores 72 marks out of 90. What percentage marks did the student obtain?",
      "एक विद्यार्थी 90 में से 72 अंक प्राप्त करता है। उसका प्रतिशत कितना है?",
      ["80%", "72%", "90%", "75%"],
      ["80%", "72%", "90%", "75%"],
      0,
      [
        "Convert the fraction into percentage.",
        "72 ÷ 90 × 100."
      ],
      [
        "भिन्न को प्रतिशत में बदलिए।",
        "72 ÷ 90 × 100 कीजिए।"
      ],
      "72/90 × 100 = 80%.",
      "72/90 × 100 = 80%।",
      "easy",
      870
    ],

    [
      "7-math-cq-04",
      ["profit-loss"],
      "A shopkeeper buys a notebook for ₹40 and sells it for ₹50. What is the profit?",
      "एक दुकानदार ₹40 में कॉपी खरीदता है और ₹50 में बेचता है। लाभ कितना हुआ?",
      ["₹10", "₹90", "₹50", "₹40"],
      ["₹10", "₹90", "₹50", "₹40"],
      0,
      [
        "Profit = Selling Price − Cost Price.",
        "Subtract carefully."
      ],
      [
        "लाभ = विक्रय मूल्य − क्रय मूल्य।",
        "सावधानीपूर्वक घटाइए।"
      ],
      "Profit = ₹50 − ₹40 = ₹10.",
      "लाभ = ₹50 − ₹40 = ₹10।",
      "easy",
      880
    ],

    [
      "7-math-cq-05",
      ["profit-loss"],
      "An article is bought for ₹500 and sold for ₹450. What is the loss?",
      "एक वस्तु ₹500 में खरीदी गई और ₹450 में बेची गई। हानि कितनी हुई?",
      ["₹50", "₹450", "₹500", "₹950"],
      ["₹50", "₹450", "₹500", "₹950"],
      0,
      [
        "Loss = Cost Price − Selling Price.",
        "Find the difference."
      ],
      [
        "हानि = क्रय मूल्य − विक्रय मूल्य।",
        "अंतर ज्ञात कीजिए।"
      ],
      "Loss = ₹500 − ₹450 = ₹50.",
      "हानि = ₹500 − ₹450 = ₹50।",
      "easy",
      890
    ],

    [
      "7-math-cq-06",
      ["discount"],
      "A shirt marked ₹800 is sold at a discount of ₹120. What is its selling price?",
      "₹800 अंकित मूल्य वाली शर्ट पर ₹120 की छूट दी गई। विक्रय मूल्य क्या होगा?",
      ["₹680", "₹920", "₹720", "₹600"],
      ["₹680", "₹920", "₹720", "₹600"],
      0,
      [
        "Selling Price = Marked Price − Discount.",
        "Subtract the discount."
      ],
      [
        "विक्रय मूल्य = अंकित मूल्य − छूट।",
        "छूट को घटाइए।"
      ],
      "₹800 − ₹120 = ₹680.",
      "₹800 − ₹120 = ₹680।",
      "easy",
      900
    ],

    [
      "7-math-cq-07",
      ["simple-interest"],
      "What is the simple interest on ₹1000 at 5% per annum for 2 years?",
      "₹1000 पर 5% वार्षिक दर से 2 वर्षों का साधारण ब्याज कितना होगा?",
      ["₹100", "₹50", "₹200", "₹150"],
      ["₹100", "₹50", "₹200", "₹150"],
      0,
      [
        "SI = (P × R × T)/100.",
        "Substitute the values."
      ],
      [
        "SI = (P × R × T)/100 का प्रयोग कीजिए।",
        "मानों को रखिए।"
      ],
      "SI = (1000 × 5 × 2)/100 = ₹100.",
      "SI = (1000 × 5 × 2)/100 = ₹100।",
      "medium",
      910
    ],

    [
      "7-math-cq-08",
      ["ratio", "proportion"],
      "If 5 pens cost ₹40, what is the cost of 8 pens at the same rate?",
      "यदि 5 पेन की कीमत ₹40 है, तो उसी दर पर 8 पेन की कीमत क्या होगी?",
      ["₹64", "₹60", "₹80", "₹48"],
      ["₹64", "₹60", "₹80", "₹48"],
      0,
      [
        "Find the cost of one pen first.",
        "Then multiply by 8."
      ],
      [
        "पहले एक पेन की कीमत ज्ञात कीजिए।",
        "फिर 8 से गुणा कीजिए।"
      ],
      "One pen costs ₹8, so 8 pens cost ₹64.",
      "एक पेन की कीमत ₹8 है, इसलिए 8 पेन की कीमत ₹64 होगी।",
      "medium",
      920
    ],

    [
      "7-math-cq-09",
      ["percentage", "increase"],
      "The price of a book increases from ₹200 to ₹250. What is the percentage increase?",
      "एक पुस्तक की कीमत ₹200 से बढ़कर ₹250 हो जाती है। प्रतिशत वृद्धि क्या है?",
      ["25%", "20%", "50%", "10%"],
      ["25%", "20%", "50%", "10%"],
      0,
      [
        "Increase = New Price − Old Price.",
        "Percentage Increase = Increase/Old Price × 100."
      ],
      [
        "वृद्धि = नई कीमत − पुरानी कीमत।",
        "प्रतिशत वृद्धि = वृद्धि/पुरानी कीमत × 100।"
      ],
      "Increase = ₹50, so percentage increase = 50/200 × 100 = 25%.",
      "वृद्धि ₹50 है, इसलिए प्रतिशत वृद्धि 25% होगी।",
      "medium",
      930
    ],

    [
      "7-math-cq-10",
      ["percentage", "decrease"],
      "A school had 500 students last year and 450 students this year. What is the percentage decrease?",
      "एक विद्यालय में पिछले वर्ष 500 विद्यार्थी थे और इस वर्ष 450 हैं। प्रतिशत कमी क्या है?",
      ["10%", "5%", "15%", "20%"],
      ["10%", "5%", "15%", "20%"],
      0,
      [
        "Decrease = Old Value − New Value.",
        "Use percentage decrease formula."
      ],
      [
        "कमी = पुराना मान − नया मान।",
        "प्रतिशत कमी का सूत्र लगाइए।"
      ],
      "Decrease = 50, so 50/500 × 100 = 10%.",
      "कमी = 50, इसलिए 50/500 × 100 = 10%।",
      "medium",
      940
    ],

    [
      "7-math-cq-11",
      ["olympiad", "percentage"],
      "A number is increased by 20% and becomes 240. What was the original number?",
      "एक संख्या में 20% वृद्धि करने पर वह 240 हो जाती है। मूल संख्या क्या थी?",
      ["200", "220", "180", "192"],
      ["200", "220", "180", "192"],
      0,
      [
        "240 represents 120% of the original.",
        "Find 100%."
      ],
      [
        "240 मूल संख्या का 120% है।",
        "100% ज्ञात कीजिए।"
      ],
      "Original = 240 × 100 / 120 = 200.",
      "मूल संख्या = 240 × 100 / 120 = 200।",
      "hard",
      980
    ],

    [
      "7-math-cq-12",
      ["olympiad", "discount"],
      "A bicycle marked ₹6000 is sold at a 15% discount. What is the discount amount?",
      "₹6000 अंकित मूल्य वाली साइकिल 15% छूट पर बेची जाती है। छूट की राशि कितनी होगी?",
      ["₹900", "₹600", "₹750", "₹1000"],
      ["₹900", "₹600", "₹750", "₹1000"],
      0,
      [
        "Discount = 15% of ₹6000.",
        "Convert percentage into fraction."
      ],
      [
        "छूट = ₹6000 का 15%।",
        "प्रतिशत को भिन्न में बदलिए।"
      ],
      "Discount = 6000 × 15/100 = ₹900.",
      "छूट = 6000 × 15/100 = ₹900।",
      "hard",
      990
    ],

    [
      "7-math-cq-13",
      ["olympiad", "profit-loss"],
      "A trader gains 20% by selling an article for ₹720. What is the cost price?",
      "एक व्यापारी ₹720 में वस्तु बेचकर 20% लाभ कमाता है। क्रय मूल्य क्या होगा?",
      ["₹600", "₹650", "₹700", "₹580"],
      ["₹600", "₹650", "₹700", "₹580"],
      0,
      [
        "Selling Price = 120% of Cost Price.",
        "Find the 100% value."
      ],
      [
        "विक्रय मूल्य = क्रय मूल्य का 120% है।",
        "100% मान ज्ञात कीजिए।"
      ],
      "CP = 720 × 100 / 120 = ₹600.",
      "क्रय मूल्य = 720 × 100 / 120 = ₹600।",
      "hard",
      1000
    ],

    [
      "7-math-cq-14",
      ["olympiad", "simple-interest"],
      "What amount will ₹2000 become in 3 years at 10% simple interest per annum?",
      "₹2000, 10% वार्षिक साधारण ब्याज की दर से 3 वर्षों में कितनी राशि बन जाएगी?",
      ["₹2600", "₹2400", "₹2300", "₹2800"],
      ["₹2600", "₹2400", "₹2300", "₹2800"],
      0,
      [
        "Find simple interest first.",
        "Amount = Principal + Interest."
      ],
      [
        "पहले साधारण ब्याज ज्ञात कीजिए।",
        "राशि = मूलधन + ब्याज।"
      ],
      "SI = ₹600, Amount = ₹2600.",
      "साधारण ब्याज = ₹600, राशि = ₹2600।",
      "hard",
      1010
    ],

    [
      "7-math-cq-15",
      ["olympiad", "ratio"],
      "The ratio of boys to girls in a class is 7:5. If there are 24 girls, how many boys are there?",
      "एक कक्षा में लड़कों और लड़कियों का अनुपात 7:5 है। यदि 24 लड़कियाँ हैं, तो लड़के कितने होंगे?",
      ["33.6", "35", "30", "28"],
      ["33.6", "35", "30", "28"],
      0,
      [
        "Find the value of one ratio unit.",
        "Girls correspond to 5 parts."
      ],
      [
        "एक अनुपात इकाई का मान ज्ञात कीजिए।",
        "लड़कियाँ 5 भागों के बराबर हैं।"
      ],
      "1 part = 24/5, Boys = 7 × 24/5 = 33.6.",
      "1 भाग = 24/5, लड़के = 7 × 24/5 = 33.6।",
      "hard",
      1015
    ],

    [
      "7-math-cq-16",
      ["olympiad", "percentage"],
      "A student answered 45 out of 60 questions correctly. What percentage of questions were answered correctly?",
      "एक विद्यार्थी ने 60 में से 45 प्रश्न सही हल किए। सही उत्तरों का प्रतिशत कितना है?",
      ["75%", "70%", "80%", "65%"],
      ["75%", "70%", "80%", "65%"],
      0,
      [
        "Convert the fraction into percentage.",
        "45/60 × 100."
      ],
      [
        "भिन्न को प्रतिशत में बदलिए।",
        "45/60 × 100 कीजिए।"
      ],
      "45/60 × 100 = 75%.",
      "45/60 × 100 = 75%।",
      "medium",
      960
    ],

    [
      "7-math-cq-17",
      ["olympiad", "comparison"],
      "Which represents the greatest value?",
      "निम्न में से सबसे बड़ा मान कौन-सा है?",
      ["40%", "2/5", "0.39", "39%"],
      ["40%", "2/5", "0.39", "39%"],
      0,
      [
        "Convert all values into decimals.",
        "Compare carefully."
      ],
      [
        "सभी मानों को दशमलव में बदलिए।",
        "सावधानीपूर्वक तुलना कीजिए।"
      ],
      "40% = 0.40, which is the largest.",
      "40% = 0.40, जो सबसे बड़ा है।",
      "hard",
      1020
    ],

    [
      "7-math-cq-18",
      ["olympiad", "profit-loss"],
      "A shopkeeper buys an article for ₹800 and sells it at a profit of 25%. Find the selling price.",
      "एक दुकानदार ₹800 में वस्तु खरीदता है और 25% लाभ पर बेचता है। विक्रय मूल्य ज्ञात कीजिए।",
      ["₹1000", "₹900", "₹1200", "₹950"],
      ["₹1000", "₹900", "₹1200", "₹950"],
      0,
      [
        "Profit = 25% of ₹800.",
        "Add profit to cost price."
      ],
      [
        "लाभ = ₹800 का 25%।",
        "लाभ को क्रय मूल्य में जोड़िए।"
      ],
      "Profit = ₹200, SP = ₹1000.",
      "लाभ = ₹200, विक्रय मूल्य = ₹1000।",
      "hard",
      1030
    ],

    [
      "7-math-cq-19",
      ["olympiad", "discount"],
      "After a 20% discount, a watch costs ₹2400. What was its marked price?",
      "20% छूट के बाद एक घड़ी की कीमत ₹2400 है। उसका अंकित मूल्य क्या था?",
      ["₹3000", "₹2800", "₹3200", "₹3600"],
      ["₹3000", "₹2800", "₹3200", "₹3600"],
      0,
      [
        "₹2400 represents 80% of the marked price.",
        "Find the 100% value."
      ],
      [
        "₹2400 अंकित मूल्य का 80% है।",
        "100% मान ज्ञात कीजिए।"
      ],
      "Marked Price = 2400 × 100 / 80 = ₹3000.",
      "अंकित मूल्य = 2400 × 100 / 80 = ₹3000।",
      "hard",
      1040
    ],

    [
      "7-math-cq-20",
      ["olympiad", "challenge"],
      "The population of a town increases by 10% in one year and then decreases by 10% in the next year. Compared to the original population, the final population is:",
      "किसी नगर की जनसंख्या एक वर्ष में 10% बढ़ती है और अगले वर्ष 10% घट जाती है। मूल जनसंख्या की तुलना में अंतिम जनसंख्या कैसी होगी?",
      [
        "1% less",
        "Same as original",
        "1% more",
        "10% less"
      ],
      [
        "1% कम",
        "मूल के बराबर",
        "1% अधिक",
        "10% कम"
      ],
      0,
      [
        "Assume an easy number like 100.",
        "Apply increase and decrease successively."
      ],
      [
        "100 जैसी सरल संख्या मान लीजिए।",
        "क्रमशः वृद्धि और कमी लागू कीजिए।"
      ],
      "100 → 110 → 99, so the final population is 1% less.",
      "100 → 110 → 99, इसलिए अंतिम जनसंख्या 1% कम है।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 9,
  topicId: "math-rational-numbers",
  chapterTitle: "Rational Numbers",
  chapterTitleHindi: "परिमेय संख्याएँ",
  questions: makeQuestionSetFromConcepts("math-rational-numbers", [

    [
      "7-math-rn-01",
      ["rational-numbers"],
      "Which of the following numbers can be expressed in the form p/q where q ≠ 0?",
      "निम्नलिखित में से कौन-सी संख्या p/q के रूप में व्यक्त की जा सकती है जहाँ q ≠ 0 हो?",
      ["Rational Number", "Natural Number Only", "Whole Number Only", "Irrational Number"],
      ["परिमेय संख्या", "केवल प्राकृतिक संख्या", "केवल पूर्ण संख्या", "अपरिमेय संख्या"],
      0,
      [
        "Recall the definition of rational numbers.",
        "Think about fractions."
      ],
      [
        "परिमेय संख्या की परिभाषा याद कीजिए।",
        "भिन्नों के बारे में सोचिए।"
      ],
      "Any number that can be written as p/q, q ≠ 0, is a rational number.",
      "जो संख्या p/q (q ≠ 0) के रूप में लिखी जा सके, वह परिमेय संख्या कहलाती है।",
      "easy",
      850
    ],

    [
      "7-math-rn-02",
      ["rational-numbers"],
      "Which of the following is a rational number?",
      "निम्न में से कौन-सी परिमेय संख्या है?",
      ["3/7", "√2", "π", "√5"],
      ["3/7", "√2", "π", "√5"],
      0,
      [
        "Check whether the number can be written as p/q.",
        "Fractions are rational."
      ],
      [
        "जाँचिए कि संख्या p/q के रूप में लिखी जा सकती है या नहीं।",
        "भिन्न परिमेय होती हैं।"
      ],
      "3/7 is already in the form p/q.",
      "3/7 पहले से ही p/q के रूप में है।",
      "easy",
      860
    ],

    [
      "7-math-rn-03",
      ["number-line"],
      "Which rational number lies exactly midway between 1/4 and 3/4 on the number line?",
      "संख्या रेखा पर 1/4 और 3/4 के ठीक मध्य में कौन-सी परिमेय संख्या स्थित है?",
      ["1/2", "1/3", "2/3", "3/8"],
      ["1/2", "1/3", "2/3", "3/8"],
      0,
      [
        "Find the average of the two numbers.",
        "Add them and divide by 2."
      ],
      [
        "दोनों संख्याओं का औसत ज्ञात कीजिए।",
        "उन्हें जोड़कर 2 से भाग दीजिए।"
      ],
      "((1/4)+(3/4))/2 = 1/2.",
      "((1/4)+(3/4))/2 = 1/2।",
      "medium",
      890
    ],

    [
      "7-math-rn-04",
      ["equivalent-rational"],
      "Which fraction is equivalent to 2/5?",
      "निम्न में से कौन-सी भिन्न 2/5 के समतुल्य है?",
      ["8/20", "6/20", "10/30", "12/25"],
      ["8/20", "6/20", "10/30", "12/25"],
      0,
      [
        "Multiply numerator and denominator by the same number.",
        "Simplify the options."
      ],
      [
        "अंश और हर को समान संख्या से गुणा कीजिए।",
        "विकल्पों को सरल कीजिए।"
      ],
      "2/5 × 4/4 = 8/20.",
      "2/5 × 4/4 = 8/20।",
      "easy",
      870
    ],

    [
      "7-math-rn-05",
      ["comparison"],
      "Which of the following rational numbers is the greatest?",
      "निम्नलिखित परिमेय संख्याओं में सबसे बड़ी कौन-सी है?",
      ["5/6", "3/4", "7/10", "4/5"],
      ["5/6", "3/4", "7/10", "4/5"],
      0,
      [
        "Convert to decimals or compare using common denominators.",
        "Look carefully."
      ],
      [
        "दशमलव या समान हर का उपयोग कीजिए।",
        "सावधानीपूर्वक तुलना कीजिए।"
      ],
      "5/6 ≈ 0.833, which is greatest.",
      "5/6 ≈ 0.833, जो सबसे बड़ी है।",
      "medium",
      900
    ],

    [
      "7-math-rn-06",
      ["addition"],
      "Find: 2/7 + 3/7",
      "ज्ञात कीजिए: 2/7 + 3/7",
      ["5/7", "6/14", "1", "5/14"],
      ["5/7", "6/14", "1", "5/14"],
      0,
      [
        "Denominators are already equal.",
        "Add the numerators."
      ],
      [
        "हर पहले से समान हैं।",
        "अंशों को जोड़िए।"
      ],
      "2/7 + 3/7 = 5/7.",
      "2/7 + 3/7 = 5/7।",
      "easy",
      880
    ],

    [
      "7-math-rn-07",
      ["subtraction"],
      "Find: 5/8 − 1/8",
      "ज्ञात कीजिए: 5/8 − 1/8",
      ["4/8", "1/2", "Both A and B", "3/8"],
      ["4/8", "1/2", "A और B दोनों", "3/8"],
      2,
      [
        "Subtract the numerators.",
        "Simplify the result."
      ],
      [
        "अंशों को घटाइए।",
        "उत्तर को सरल कीजिए।"
      ],
      "5/8 − 1/8 = 4/8 = 1/2.",
      "5/8 − 1/8 = 4/8 = 1/2।",
      "easy",
      890
    ],

    [
      "7-math-rn-08",
      ["multiplication"],
      "Find the product: (-3/5) × (10/9)",
      "गुणनफल ज्ञात कीजिए: (-3/5) × (10/9)",
      ["-2/3", "-6/9", "2/3", "-1/3"],
      ["-2/3", "-6/9", "2/3", "-1/3"],
      0,
      [
        "Multiply numerators and denominators.",
        "Simplify carefully."
      ],
      [
        "अंश और हर का गुणा कीजिए।",
        "सावधानीपूर्वक सरल कीजिए।"
      ],
      "(-3×10)/(5×9) = -30/45 = -2/3.",
      "(-3×10)/(5×9) = -30/45 = -2/3।",
      "medium",
      920
    ],

    [
      "7-math-rn-09",
      ["division"],
      "Find: (4/9) ÷ (2/3)",
      "ज्ञात कीजिए: (4/9) ÷ (2/3)",
      ["2/3", "8/27", "6/9", "4/6"],
      ["2/3", "8/27", "6/9", "4/6"],
      0,
      [
        "Multiply by the reciprocal.",
        "Convert division into multiplication."
      ],
      [
        "व्युत्क्रम से गुणा कीजिए।",
        "भाग को गुणा में बदलिए।"
      ],
      "4/9 × 3/2 = 12/18 = 2/3.",
      "4/9 × 3/2 = 12/18 = 2/3।",
      "medium",
      930
    ],

    [
      "7-math-rn-10",
      ["negative-rational"],
      "Which rational number is smallest?",
      "निम्न में से सबसे छोटी परिमेय संख्या कौन-सी है?",
      ["-5/6", "-3/4", "-1/2", "0"],
      ["-5/6", "-3/4", "-1/2", "0"],
      0,
      [
        "Among negative numbers, the one farther left is smaller.",
        "Compare decimal values."
      ],
      [
        "ऋणात्मक संख्याओं में जो अधिक बाईं ओर होती है, वह छोटी होती है।",
        "दशमलव मानों की तुलना कीजिए।"
      ],
      "-5/6 ≈ -0.833, which is the smallest.",
      "-5/6 ≈ -0.833, जो सबसे छोटी है।",
      "medium",
      940
    ],

    [
      "7-math-rn-11",
      ["olympiad"],
      "What is the additive inverse of -7/11?",
      "−7/11 का योगात्मक प्रतिलोम क्या होगा?",
      ["7/11", "-11/7", "11/7", "-7/11"],
      ["7/11", "-11/7", "11/7", "-7/11"],
      0,
      [
        "Additive inverse makes the sum zero.",
        "Change the sign."
      ],
      [
        "योगात्मक प्रतिलोम जोड़ने पर शून्य देता है।",
        "केवल चिन्ह बदलना है।"
      ],
      "The additive inverse of -7/11 is 7/11.",
      "−7/11 का योगात्मक प्रतिलोम 7/11 है।",
      "hard",
      980
    ],

    [
      "7-math-rn-12",
      ["olympiad"],
      "What is the multiplicative inverse of -5/9?",
      "−5/9 का गुणात्मक प्रतिलोम क्या होगा?",
      ["-9/5", "9/5", "-5/9", "5/9"],
      ["-9/5", "9/5", "-5/9", "5/9"],
      0,
      [
        "Invert numerator and denominator.",
        "Keep the sign unchanged."
      ],
      [
        "अंश और हर को उलट दीजिए।",
        "चिन्ह वही रहेगा।"
      ],
      "The reciprocal of -5/9 is -9/5.",
      "−5/9 का व्युत्क्रम −9/5 है।",
      "hard",
      990
    ],

    [
      "7-math-rn-13",
      ["olympiad", "comparison"],
      "Arrange in ascending order: -2/3, 1/4, -5/6, 0",
      "आरोही क्रम में व्यवस्थित कीजिए: -2/3, 1/4, -5/6, 0",
      [
        "-5/6, -2/3, 0, 1/4",
        "-2/3, -5/6, 0, 1/4",
        "0, -5/6, -2/3, 1/4",
        "-5/6, 0, -2/3, 1/4"
      ],
      [
        "-5/6, -2/3, 0, 1/4",
        "-2/3, -5/6, 0, 1/4",
        "0, -5/6, -2/3, 1/4",
        "-5/6, 0, -2/3, 1/4"
      ],
      0,
      [
        "Convert to decimals mentally.",
        "Place them on the number line."
      ],
      [
        "दशमलव में सोचिए।",
        "संख्या रेखा पर स्थान निर्धारित कीजिए।"
      ],
      "-5/6 < -2/3 < 0 < 1/4.",
      "−5/6 < −2/3 < 0 < 1/4।",
      "hard",
      1000
    ],

    [
      "7-math-rn-14",
      ["olympiad", "operations"],
      "Evaluate: (3/4) + (-5/8)",
      "मान ज्ञात कीजिए: (3/4) + (-5/8)",
      ["1/8", "-1/8", "2/8", "-2/8"],
      ["1/8", "-1/8", "2/8", "-2/8"],
      0,
      [
        "Convert to a common denominator.",
        "3/4 = 6/8."
      ],
      [
        "समान हर बनाइए।",
        "3/4 = 6/8 लिखिए।"
      ],
      "6/8 - 5/8 = 1/8.",
      "6/8 - 5/8 = 1/8।",
      "hard",
      1010
    ],

    [
      "7-math-rn-15",
      ["olympiad", "number-line"],
      "Which rational number lies exactly between -1/2 and 1/2?",
      "−1/2 और 1/2 के ठीक बीच में कौन-सी परिमेय संख्या है?",
      ["0", "1/4", "-1/4", "1"],
      ["0", "1/4", "-1/4", "1"],
      0,
      [
        "Think of symmetry on the number line.",
        "Find the average."
      ],
      [
        "संख्या रेखा पर सममिति के बारे में सोचिए।",
        "औसत ज्ञात कीजिए।"
      ],
      "The midpoint is 0.",
      "मध्य बिंदु 0 है।",
      "medium",
      960
    ],

    [
      "7-math-rn-16",
      ["olympiad", "application"],
      "A temperature drops from 3°C to -5°C. By how many degrees did it decrease?",
      "तापमान 3°C से घटकर -5°C हो जाता है। तापमान में कितनी कमी हुई?",
      ["8°C", "2°C", "5°C", "3°C"],
      ["8°C", "2°C", "5°C", "3°C"],
      0,
      [
        "Find the difference between the temperatures.",
        "Use number line reasoning."
      ],
      [
        "दोनों तापमानों का अंतर ज्ञात कीजिए।",
        "संख्या रेखा का उपयोग कीजिए।"
      ],
      "3 - (-5) = 8.",
      "3 - (-5) = 8।",
      "hard",
      1020
    ],

    [
      "7-math-rn-17",
      ["olympiad", "challenge"],
      "If x = -3/4 and y = 5/6, find x + y.",
      "यदि x = -3/4 तथा y = 5/6 है, तो x + y ज्ञात कीजिए।",
      ["1/12", "-1/12", "19/12", "-19/12"],
      ["1/12", "-1/12", "19/12", "-19/12"],
      0,
      [
        "Take LCM of denominators.",
        "Carefully add the signed fractions."
      ],
      [
        "हरों का लघुत्तम समापवर्त्य लीजिए।",
        "चिन्हों सहित भिन्नों को जोड़िए।"
      ],
      "(-9 + 10)/12 = 1/12.",
      "(-9 + 10)/12 = 1/12।",
      "hard",
      1030
    ],

    [
      "7-math-rn-18",
      ["olympiad", "challenge"],
      "Which of the following is closest to zero?",
      "निम्न में से कौन-सी संख्या शून्य के सबसे निकट है?",
      ["-1/20", "1/8", "-1/10", "1/5"],
      ["-1/20", "1/8", "-1/10", "1/5"],
      0,
      [
        "Compare absolute values.",
        "Smallest magnitude wins."
      ],
      [
        "परम मानों की तुलना कीजिए।",
        "सबसे छोटा परिमाण चुने।"
      ],
      "|-1/20| = 0.05 is the smallest.",
      "|-1/20| = 0.05 सबसे छोटा है।",
      "hard",
      1040
    ],

    [
      "7-math-rn-19",
      ["olympiad", "challenge"],
      "The product of a rational number and its reciprocal is:",
      "किसी परिमेय संख्या और उसके व्युत्क्रम का गुणनफल क्या होता है?",
      ["1", "0", "-1", "The number itself"],
      ["1", "0", "-1", "वही संख्या"],
      0,
      [
        "Think about a × (1/a).",
        "a ≠ 0."
      ],
      [
        "a × (1/a) के बारे में सोचिए।",
        "जहाँ a ≠ 0 हो।"
      ],
      "Any non-zero rational number multiplied by its reciprocal equals 1.",
      "कोई भी शून्येतर परिमेय संख्या अपने व्युत्क्रम से गुणा करने पर 1 देती है।",
      "hard",
      1045
    ],

    [
      "7-math-rn-20",
      ["olympiad", "challenge"],
      "A rational number is equal to its own reciprocal. Which of the following can be that number?",
      "एक परिमेय संख्या अपने ही व्युत्क्रम के बराबर है। निम्न में से कौन-सी संख्या ऐसी हो सकती है?",
      ["1", "2", "3/2", "5"],
      ["1", "2", "3/2", "5"],
      0,
      [
        "If x = 1/x, then x² = 1.",
        "Think about possible rational values."
      ],
      [
        "यदि x = 1/x, तो x² = 1 होगा।",
        "संभव परिमेय मानों के बारे में सोचिए।"
      ],
      "The rational numbers satisfying x² = 1 are 1 and -1. Among the options, 1 is present.",
      "x² = 1 को संतुष्ट करने वाली संख्याएँ 1 और -1 हैं। विकल्पों में केवल 1 है।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 10,
  topicId: "math-practical-geometry",
  chapterTitle: "Practical Geometry",
  chapterTitleHindi: "प्रायोगिक ज्यामिति",
  questions: makeQuestionSetFromConcepts("math-practical-geometry", [

    [
      "7-math-pg-01",
      ["geometry-tools"],
      "While constructing a line segment of exact length 7.5 cm, which instrument is most essential for measuring the length accurately?",
      "7.5 सेमी लंबाई का रेखाखंड बनाते समय लंबाई को सही मापने के लिए कौन-सा उपकरण सबसे आवश्यक है?",
      ["Ruler", "Compass", "Protractor", "Divider"],
      ["स्केल", "परकार", "प्रोट्रैक्टर", "डिवाइडर"],
      0,
      [
        "Think about which instrument measures length directly.",
        "It has centimeter markings."
      ],
      [
        "सोचिए कौन-सा उपकरण सीधे लंबाई मापता है।",
        "उस पर सेंटीमीटर के निशान बने होते हैं।"
      ],
      "A ruler is used to measure and draw line segments accurately.",
      "रेखाखंड की सही लंबाई मापने और बनाने के लिए स्केल का उपयोग किया जाता है।",
      "easy",
      850
    ],

    [
      "7-math-pg-02",
      ["line-segment"],
      "To construct a line segment equal in length to a given segment AB, which tool is used to transfer the exact distance?",
      "दिए गए रेखाखंड AB के बराबर लंबाई का रेखाखंड बनाने के लिए दूरी को स्थानांतरित करने में कौन-सा उपकरण उपयोग किया जाता है?",
      ["Compass", "Protractor", "Scale only", "Set Square"],
      ["परकार", "प्रोट्रैक्टर", "केवल स्केल", "सेट स्क्वेयर"],
      0,
      [
        "The tool can store a fixed distance.",
        "It is commonly used in constructions."
      ],
      [
        "यह उपकरण एक निश्चित दूरी को सुरक्षित रख सकता है।",
        "ज्यामितीय रचनाओं में इसका उपयोग होता है।"
      ],
      "A compass is used to transfer distances accurately.",
      "दूरी को सही रूप से स्थानांतरित करने के लिए परकार का उपयोग किया जाता है।",
      "easy",
      860
    ],

    [
      "7-math-pg-03",
      ["angles"],
      "Which instrument is specifically used to construct an angle of 60° or measure an angle already drawn?",
      "60° का कोण बनाने या बने हुए कोण को मापने के लिए किस उपकरण का उपयोग किया जाता है?",
      ["Protractor", "Compass", "Divider", "Scale"],
      ["प्रोट्रैक्टर", "परकार", "डिवाइडर", "स्केल"],
      0,
      [
        "It is marked from 0° to 180°.",
        "Used for measuring angles."
      ],
      [
        "इस पर 0° से 180° तक अंकित होता है।",
        "यह कोण मापने के लिए प्रयोग होता है।"
      ],
      "A protractor is used to measure and construct angles.",
      "कोणों को मापने और बनाने के लिए प्रोट्रैक्टर का उपयोग किया जाता है।",
      "easy",
      870
    ],

    [
      "7-math-pg-04",
      ["circle"],
      "Which instrument is essential for drawing a circle of radius 4 cm with precision?",
      "4 सेमी त्रिज्या वाला वृत्त सटीक रूप से बनाने के लिए कौन-सा उपकरण आवश्यक है?",
      ["Compass", "Scale", "Protractor", "Divider"],
      ["परकार", "स्केल", "प्रोट्रैक्टर", "डिवाइडर"],
      0,
      [
        "It rotates around a fixed point.",
        "Radius remains constant."
      ],
      [
        "यह एक स्थिर बिंदु के चारों ओर घूमता है।",
        "त्रिज्या स्थिर रहती है।"
      ],
      "A compass is used to draw circles of a given radius.",
      "निर्धारित त्रिज्या का वृत्त बनाने के लिए परकार का उपयोग किया जाता है।",
      "easy",
      880
    ],

    [
      "7-math-pg-05",
      ["perpendicular-bisector"],
      "What is the main purpose of constructing the perpendicular bisector of a line segment?",
      "किसी रेखाखंड का लंब समद्विभाजक बनाने का मुख्य उद्देश्य क्या है?",
      [
        "To divide the segment into two equal parts at 90°",
        "To draw a parallel line",
        "To measure the segment",
        "To find an angle"
      ],
      [
        "रेखाखंड को 90° पर दो बराबर भागों में बाँटना",
        "समांतर रेखा बनाना",
        "रेखाखंड को मापना",
        "कोण ज्ञात करना"
      ],
      0,
      [
        "Think about the words perpendicular and bisector.",
        "It divides and forms a right angle."
      ],
      [
        "लंब और समद्विभाजक शब्दों पर ध्यान दीजिए।",
        "यह बराबर भाग करता है और समकोण बनाता है।"
      ],
      "A perpendicular bisector divides a segment into two equal parts at 90°.",
      "लंब समद्विभाजक रेखाखंड को 90° पर दो बराबर भागों में विभाजित करता है।",
      "medium",
      900
    ],

    [
      "7-math-pg-06",
      ["construction"],
      "When constructing a 90° angle at a point on a line, which geometric idea is primarily used?",
      "किसी रेखा पर स्थित बिंदु पर 90° का कोण बनाते समय मुख्यतः किस ज्यामितीय विचार का उपयोग होता है?",
      [
        "Perpendicular line",
        "Parallel line",
        "Bisector only",
        "Circle only"
      ],
      [
        "लंबवत रेखा",
        "समांतर रेखा",
        "केवल समद्विभाजक",
        "केवल वृत्त"
      ],
      0,
      [
        "A 90° angle is formed by two special lines.",
        "Think of right angles."
      ],
      [
        "90° का कोण दो विशेष रेखाओं से बनता है।",
        "समकोण के बारे में सोचिए।"
      ],
      "Perpendicular lines meet at 90°.",
      "लंबवत रेखाएँ 90° पर मिलती हैं।",
      "medium",
      910
    ],

    [
      "7-math-pg-07",
      ["triangle-construction"],
      "To construct a triangle uniquely using SSS criterion, how much information is required?",
      "SSS नियम द्वारा किसी त्रिभुज को अद्वितीय रूप से बनाने के लिए कितनी जानकारी आवश्यक है?",
      [
        "Lengths of all three sides",
        "Two sides only",
        "One side and one angle",
        "Three angles"
      ],
      [
        "तीनों भुजाओं की लंबाई",
        "केवल दो भुजाएँ",
        "एक भुजा और एक कोण",
        "तीन कोण"
      ],
      0,
      [
        "SSS stands for Side-Side-Side.",
        "All sides must be known."
      ],
      [
        "SSS का अर्थ Side-Side-Side है।",
        "तीनों भुजाएँ ज्ञात होनी चाहिए।"
      ],
      "A unique triangle can be constructed if all three sides are known.",
      "यदि तीनों भुजाएँ ज्ञात हों तो त्रिभुज अद्वितीय रूप से बनाया जा सकता है।",
      "easy",
      920
    ],

    [
      "7-math-pg-08",
      ["triangle-construction"],
      "A triangle is to be constructed with sides 5 cm, 6 cm and 7 cm. Which side is generally drawn first?",
      "5 सेमी, 6 सेमी और 7 सेमी भुजाओं वाला त्रिभुज बनाना है। सामान्यतः सबसे पहले कौन-सी भुजा खींची जाती है?",
      [
        "Any one of the given sides",
        "Always the longest side",
        "Always the shortest side",
        "Cannot be drawn"
      ],
      [
        "दी गई किसी भी भुजा को",
        "हमेशा सबसे बड़ी भुजा",
        "हमेशा सबसे छोटी भुजा",
        "नहीं बनाया जा सकता"
      ],
      0,
      [
        "Construction can begin with any known side.",
        "The remaining sides are drawn using arcs."
      ],
      [
        "रचना किसी भी ज्ञात भुजा से शुरू की जा सकती है।",
        "बाकी भुजाएँ चापों से बनाई जाती हैं।"
      ],
      "Any one of the known sides may be drawn first.",
      "दी गई किसी भी भुजा को पहले खींचा जा सकता है।",
      "medium",
      930
    ],

    [
      "7-math-pg-09",
      ["angles"],
      "What is the angle formed by two perpendicular lines?",
      "दो लंबवत रेखाओं द्वारा बना कोण कितना होता है?",
      ["90°", "180°", "45°", "60°"],
      ["90°", "180°", "45°", "60°"],
      0,
      [
        "Perpendicular lines form a right angle.",
        "Recall the measure of a right angle."
      ],
      [
        "लंबवत रेखाएँ समकोण बनाती हैं।",
        "समकोण का मान याद कीजिए।"
      ],
      "Perpendicular lines always form a 90° angle.",
      "लंबवत रेखाएँ हमेशा 90° का कोण बनाती हैं।",
      "easy",
      890
    ],

    [
      "7-math-pg-10",
      ["construction"],
      "While constructing an angle bisector, the resulting ray divides the angle into:",
      "कोण समद्विभाजक बनाते समय प्राप्त किरण कोण को किस प्रकार विभाजित करती है?",
      [
        "Two equal angles",
        "Three equal angles",
        "Two supplementary angles",
        "Four equal angles"
      ],
      [
        "दो बराबर कोण",
        "तीन बराबर कोण",
        "दो संपूरक कोण",
        "चार बराबर कोण"
      ],
      0,
      [
        "The word bisector means divide into two equal parts.",
        "Think of symmetry."
      ],
      [
        "समद्विभाजक का अर्थ है दो बराबर भाग।",
        "सममिति के बारे में सोचिए।"
      ],
      "An angle bisector divides an angle into two equal angles.",
      "कोण समद्विभाजक कोण को दो बराबर कोणों में बाँटता है।",
      "easy",
      900
    ],

    [
      "7-math-pg-11",
      ["olympiad", "construction"],
      "A triangle has sides 3 cm, 4 cm and 8 cm. Can it be constructed?",
      "किसी त्रिभुज की भुजाएँ 3 सेमी, 4 सेमी और 8 सेमी हैं। क्या इसे बनाया जा सकता है?",
      ["No", "Yes", "Only with a compass", "Only approximately"],
      ["नहीं", "हाँ", "केवल परकार से", "केवल अनुमानित रूप से"],
      0,
      [
        "Apply the triangle inequality theorem.",
        "The sum of two sides must exceed the third."
      ],
      [
        "त्रिभुज असमता प्रमेय लागू कीजिए।",
        "दो भुजाओं का योग तीसरी से बड़ा होना चाहिए।"
      ],
      "3 + 4 = 7 which is less than 8, so construction is impossible.",
      "3 + 4 = 7 जो 8 से कम है, इसलिए त्रिभुज नहीं बनाया जा सकता।",
      "hard",
      980
    ],

    [
      "7-math-pg-12",
      ["olympiad", "angles"],
      "How many distinct 90° angles can be constructed at a given point on a straight line?",
      "किसी सीधी रेखा पर दिए गए बिंदु पर कितने अलग-अलग 90° कोण बनाए जा सकते हैं?",
      ["2", "1", "4", "Infinite"],
      ["2", "1", "4", "अनंत"],
      0,
      [
        "A perpendicular can be drawn on either side of the line.",
        "Visualize both directions."
      ],
      [
        "रेखा के दोनों ओर लंब बनाया जा सकता है।",
        "दोनों दिशाओं की कल्पना कीजिए।"
      ],
      "Two distinct right angles can be formed on either side of the line.",
      "रेखा के दोनों ओर दो अलग-अलग समकोण बनाए जा सकते हैं।",
      "hard",
      990
    ],

    [
      "7-math-pg-13",
      ["olympiad", "triangle-construction"],
      "Which set of measurements is sufficient to construct a unique triangle?",
      [
        "Three sides: 5 cm, 6 cm, 7 cm",
        "Three angles: 60°, 60°, 60°",
        "Only two angles",
        "Only one side"
      ],
      [
        "तीन भुजाएँ: 5 सेमी, 6 सेमी, 7 सेमी",
        "तीन कोण: 60°, 60°, 60°",
        "केवल दो कोण",
        "केवल एक भुजा"
      ],
      0,
      [
        "Think about unique construction.",
        "SSS always gives a unique triangle."
      ],
      [
        "अद्वितीय रचना के बारे में सोचिए।",
        "SSS सदैव अद्वितीय त्रिभुज देता है।"
      ],
      "Three given sides uniquely determine a triangle.",
      "तीनों भुजाएँ ज्ञात होने पर त्रिभुज अद्वितीय रूप से निर्धारित होता है।",
      "hard",
      1000
    ],

    [
      "7-math-pg-14",
      ["olympiad", "circle"],
      "A circle has radius 5 cm. What is the distance from its center to any point on the circle?",
      "किसी वृत्त की त्रिज्या 5 सेमी है। केंद्र से वृत्त पर स्थित किसी भी बिंदु की दूरी कितनी होगी?",
      ["5 cm", "10 cm", "2.5 cm", "15 cm"],
      ["5 सेमी", "10 सेमी", "2.5 सेमी", "15 सेमी"],
      0,
      [
        "Recall the definition of radius.",
        "All points on the circle are equally distant."
      ],
      [
        "त्रिज्या की परिभाषा याद कीजिए।",
        "वृत्त के सभी बिंदु समान दूरी पर होते हैं।"
      ],
      "Radius is the distance from the center to any point on the circle.",
      "त्रिज्या केंद्र से वृत्त के किसी भी बिंदु तक की दूरी होती है।",
      "medium",
      950
    ],

    [
      "7-math-pg-15",
      ["olympiad", "perpendicular-bisector"],
      "Any point lying on the perpendicular bisector of a line segment is:",
      "रेखाखंड के लंब समद्विभाजक पर स्थित कोई भी बिंदु कैसा होता है?",
      [
        "Equidistant from both endpoints",
        "Closer to one endpoint",
        "Always the midpoint",
        "On the segment itself"
      ],
      [
        "दोनों सिरों से समान दूरी पर",
        "एक सिरे के अधिक निकट",
        "हमेशा मध्यबिंदु",
        "रेखाखंड पर ही"
      ],
      0,
      [
        "Recall the property of perpendicular bisectors.",
        "Distance to endpoints is important."
      ],
      [
        "लंब समद्विभाजक का गुण याद कीजिए।",
        "सिरों से दूरी पर ध्यान दीजिए।"
      ],
      "Every point on the perpendicular bisector is equidistant from the endpoints.",
      "लंब समद्विभाजक पर स्थित प्रत्येक बिंदु दोनों सिरों से समान दूरी पर होता है।",
      "hard",
      1010
    ],

    [
      "7-math-pg-16",
      ["olympiad", "construction"],
      "To draw a perpendicular bisector of a segment AB, why are arcs drawn from A and B with the same radius?",
      "रेखाखंड AB का लंब समद्विभाजक बनाने के लिए A और B से समान त्रिज्या के चाप क्यों बनाए जाते हैं?",
      [
        "To locate points equidistant from A and B",
        "To find the length of AB",
        "To create a circle only",
        "To measure angles"
      ],
      [
        "A और B से समान दूरी वाले बिंदु खोजने के लिए",
        "AB की लंबाई ज्ञात करने के लिए",
        "केवल वृत्त बनाने के लिए",
        "कोण मापने के लिए"
      ],
      0,
      [
        "Think about the geometric property of equal radii.",
        "Intersection points are important."
      ],
      [
        "समान त्रिज्या के ज्यामितीय गुण पर विचार कीजिए।",
        "चापों के प्रतिच्छेद बिंदुओं पर ध्यान दें।"
      ],
      "The intersections are equidistant from A and B.",
      "प्रतिच्छेद बिंदु A और B दोनों से समान दूरी पर होते हैं।",
      "hard",
      1020
    ],

    [
      "7-math-pg-17",
      ["olympiad", "triangle"],
      "A triangle has sides 6 cm, 8 cm and 10 cm. Which special type of triangle is it?",
      "किसी त्रिभुज की भुजाएँ 6 सेमी, 8 सेमी और 10 सेमी हैं। यह कौन-सा विशेष त्रिभुज है?",
      [
        "Right-angled triangle",
        "Equilateral triangle",
        "Isosceles triangle",
        "Impossible triangle"
      ],
      [
        "समकोण त्रिभुज",
        "समबाहु त्रिभुज",
        "समद्विबाहु त्रिभुज",
        "असंभव त्रिभुज"
      ],
      0,
      [
        "Check the Pythagoras relationship.",
        "6² + 8² = ?"
      ],
      [
        "पाइथागोरस संबंध जाँचिए।",
        "6² + 8² = ?"
      ],
      "36 + 64 = 100 = 10², so it is right-angled.",
      "36 + 64 = 100 = 10², इसलिए यह समकोण त्रिभुज है।",
      "hard",
      1030
    ],

    [
      "7-math-pg-18",
      ["olympiad", "angles"],
      "If an angle bisector divides a 124° angle, what is the measure of each resulting angle?",
      "यदि कोण समद्विभाजक 124° के कोण को विभाजित करता है, तो प्रत्येक नया कोण कितना होगा?",
      ["62°", "31°", "124°", "248°"],
      ["62°", "31°", "124°", "248°"],
      0,
      [
        "An angle bisector creates two equal angles.",
        "Divide by 2."
      ],
      [
        "कोण समद्विभाजक दो बराबर कोण बनाता है।",
        "2 से भाग दीजिए।"
      ],
      "124° ÷ 2 = 62°.",
      "124° ÷ 2 = 62°।",
      "medium",
      980
    ],

    [
      "7-math-pg-19",
      ["olympiad", "challenge"],
      "Which construction requires both a compass and a ruler but does NOT require a protractor?",
      [
        "Perpendicular bisector of a line segment",
        "Measuring a 75° angle",
        "Reading an angle",
        "Estimating a distance"
      ],
      [
        "रेखाखंड का लंब समद्विभाजक",
        "75° कोण मापना",
        "कोण पढ़ना",
        "दूरी का अनुमान लगाना"
      ],
      0,
      [
        "Think about classical geometric constructions.",
        "No angle measurement is required."
      ],
      [
        "शास्त्रीय ज्यामितीय रचनाओं के बारे में सोचिए।",
        "कोण मापने की आवश्यकता नहीं है।"
      ],
      "A perpendicular bisector can be constructed using only a ruler and compass.",
      "लंब समद्विभाजक केवल स्केल और परकार से बनाया जा सकता है।",
      "hard",
      1040
    ],

    [
      "7-math-pg-20",
      ["olympiad", "challenge"],
      "A student constructs a triangle with sides 5 cm, 12 cm and 13 cm. Which statement must be true?",
      [
        "The triangle is right-angled",
        "The triangle is equilateral",
        "The triangle is isosceles",
        "The triangle cannot exist"
      ],
      [
        "त्रिभुज समकोण है",
        "त्रिभुज समबाहु है",
        "त्रिभुज समद्विबाहु है",
        "त्रिभुज अस्तित्व में नहीं हो सकता"
      ],
      0,
      [
        "Check the Pythagorean relationship.",
        "5² + 12² should be compared with 13²."
      ],
      [
        "पाइथागोरस संबंध जाँचिए।",
        "5² + 12² की तुलना 13² से कीजिए।"
      ],
      "25 + 144 = 169 = 13², therefore the triangle is right-angled.",
      "25 + 144 = 169 = 13², इसलिए त्रिभुज समकोण है।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 11,
  topicId: "math-perimeter-and-area",
  chapterTitle: "Perimeter and Area",
  chapterTitleHindi: "परिमाप और क्षेत्रफल",
  questions: makeQuestionSetFromConcepts("math-perimeter-and-area", [

    [
      "7-math-pa-01",
      ["perimeter", "rectangle"],
      "A rectangular playground is 40 m long and 25 m wide. If a student walks once around its boundary, what total distance will be covered?",
      "एक आयताकार खेल का मैदान 40 मीटर लंबा और 25 मीटर चौड़ा है। यदि कोई विद्यार्थी इसकी सीमा के चारों ओर एक चक्कर लगाए, तो वह कुल कितनी दूरी तय करेगा?",
      ["130 m", "100 m", "65 m", "1000 m²"],
      ["130 मी", "100 मी", "65 मी", "1000 मी²"],
      0,
      [
        "Use the perimeter formula of a rectangle.",
        "Perimeter = 2 × (Length + Breadth)."
      ],
      [
        "आयत के परिमाप का सूत्र प्रयोग करें।",
        "परिमाप = 2 × (लंबाई + चौड़ाई)।"
      ],
      "Perimeter = 2 × (40 + 25) = 130 m.",
      "परिमाप = 2 × (40 + 25) = 130 मीटर।",
      "easy",
      850
    ],

    [
      "7-math-pa-02",
      ["area", "rectangle"],
      "A farmer owns a rectangular field measuring 60 m by 35 m. What is the total area of the field?",
      "एक किसान के पास 60 मीटर × 35 मीटर का आयताकार खेत है। खेत का कुल क्षेत्रफल कितना होगा?",
      ["2100 m²", "190 m", "1200 m²", "95 m²"],
      ["2100 मी²", "190 मी", "1200 मी²", "95 मी²"],
      0,
      [
        "Area of rectangle = Length × Breadth.",
        "Multiply the two dimensions."
      ],
      [
        "आयत का क्षेत्रफल = लंबाई × चौड़ाई।",
        "दोनों मापों का गुणा करें।"
      ],
      "Area = 60 × 35 = 2100 m².",
      "क्षेत्रफल = 60 × 35 = 2100 मी²।",
      "easy",
      860
    ],

    [
      "7-math-pa-03",
      ["square"],
      "A square garden has side length 18 m. What is its perimeter?",
      "एक वर्गाकार बगीचे की भुजा 18 मीटर है। उसका परिमाप कितना होगा?",
      ["72 m", "324 m²", "36 m", "54 m"],
      ["72 मी", "324 मी²", "36 मी", "54 मी"],
      0,
      [
        "Perimeter of square = 4 × side.",
        "All sides are equal."
      ],
      [
        "वर्ग का परिमाप = 4 × भुजा।",
        "सभी भुजाएँ समान होती हैं।"
      ],
      "Perimeter = 4 × 18 = 72 m.",
      "परिमाप = 4 × 18 = 72 मीटर।",
      "easy",
      870
    ],

    [
      "7-math-pa-04",
      ["square", "area"],
      "A square tile has side 12 cm. What area does one tile cover?",
      "एक वर्गाकार टाइल की भुजा 12 सेमी है। एक टाइल कितना क्षेत्रफल ढकेगी?",
      ["144 cm²", "48 cm", "24 cm²", "120 cm²"],
      ["144 सेमी²", "48 सेमी", "24 सेमी²", "120 सेमी²"],
      0,
      [
        "Area of square = side².",
        "Multiply side by itself."
      ],
      [
        "वर्ग का क्षेत्रफल = भुजा²।",
        "भुजा का स्वयं से गुणा करें।"
      ],
      "Area = 12 × 12 = 144 cm².",
      "क्षेत्रफल = 12 × 12 = 144 सेमी²।",
      "easy",
      880
    ],

    [
      "7-math-pa-05",
      ["units"],
      "Which unit is most appropriate for measuring the area of a classroom floor?",
      "कक्षा के फर्श का क्षेत्रफल मापने के लिए कौन-सी इकाई सबसे उपयुक्त है?",
      ["Square metre (m²)", "Metre (m)", "Centimetre (cm)", "Kilogram (kg)"],
      ["वर्ग मीटर (m²)", "मीटर (m)", "सेंटीमीटर (cm)", "किलोग्राम (kg)"],
      0,
      [
        "Area is measured in square units.",
        "Think of room-sized surfaces."
      ],
      [
        "क्षेत्रफल वर्ग इकाइयों में मापा जाता है।",
        "कमरे के आकार की सतह के बारे में सोचें।"
      ],
      "Large floor areas are generally measured in square metres.",
      "बड़े फर्श का क्षेत्रफल सामान्यतः वर्ग मीटर में मापा जाता है।",
      "easy",
      890
    ],

    [
      "7-math-pa-06",
      ["rectangle", "missing-dimension"],
      "A rectangle has area 180 cm² and breadth 12 cm. What is its length?",
      "एक आयत का क्षेत्रफल 180 सेमी² और चौड़ाई 12 सेमी है। उसकी लंबाई कितनी होगी?",
      ["15 cm", "18 cm", "12 cm", "20 cm"],
      ["15 सेमी", "18 सेमी", "12 सेमी", "20 सेमी"],
      0,
      [
        "Length = Area ÷ Breadth.",
        "Use the rectangle area formula."
      ],
      [
        "लंबाई = क्षेत्रफल ÷ चौड़ाई।",
        "आयत के क्षेत्रफल का सूत्र प्रयोग करें।"
      ],
      "Length = 180 ÷ 12 = 15 cm.",
      "लंबाई = 180 ÷ 12 = 15 सेमी।",
      "medium",
      900
    ],

    [
      "7-math-pa-07",
      ["perimeter"],
      "The perimeter of a square is 64 cm. What is the length of one side?",
      "एक वर्ग का परिमाप 64 सेमी है। उसकी एक भुजा की लंबाई कितनी होगी?",
      ["16 cm", "8 cm", "32 cm", "64 cm"],
      ["16 सेमी", "8 सेमी", "32 सेमी", "64 सेमी"],
      0,
      [
        "Side = Perimeter ÷ 4.",
        "All sides are equal."
      ],
      [
        "भुजा = परिमाप ÷ 4।",
        "सभी भुजाएँ समान होती हैं।"
      ],
      "Side = 64 ÷ 4 = 16 cm.",
      "भुजा = 64 ÷ 4 = 16 सेमी।",
      "medium",
      910
    ],

    [
      "7-math-pa-08",
      ["area"],
      "Two rectangles have the same area. Does it mean they must have the same perimeter?",
      "दो आयतों का क्षेत्रफल समान है। क्या इसका अर्थ है कि उनका परिमाप भी समान होगा?",
      ["No", "Yes", "Always double", "Cannot exist"],
      ["नहीं", "हाँ", "हमेशा दोगुना", "संभव नहीं"],
      0,
      [
        "Different dimensions can produce the same area.",
        "Compare 4×9 and 6×6."
      ],
      [
        "अलग-अलग माप समान क्षेत्रफल दे सकते हैं।",
        "4×9 और 6×6 की तुलना करें।"
      ],
      "Rectangles may have equal areas but different perimeters.",
      "आयतों का क्षेत्रफल समान हो सकता है लेकिन परिमाप अलग हो सकता है।",
      "medium",
      920
    ],

    [
      "7-math-pa-09",
      ["olympiad"],
      "A square and a rectangle have the same perimeter of 40 cm. The rectangle measures 12 cm × 8 cm. Which shape has the larger area?",
      "एक वर्ग और एक आयत का परिमाप 40 सेमी है। आयत की माप 12 सेमी × 8 सेमी है। किसका क्षेत्रफल अधिक होगा?",
      ["Square", "Rectangle", "Both equal", "Cannot determine"],
      ["वर्ग", "आयत", "दोनों बराबर", "निर्धारित नहीं किया जा सकता"],
      0,
      [
        "Find the square's side from perimeter.",
        "Compare areas."
      ],
      [
        "परिमाप से वर्ग की भुजा ज्ञात करें।",
        "क्षेत्रफलों की तुलना करें।"
      ],
      "Square side = 10 cm, area = 100 cm². Rectangle area = 96 cm².",
      "वर्ग की भुजा = 10 सेमी, क्षेत्रफल = 100 सेमी²। आयत का क्षेत्रफल = 96 सेमी²।",
      "hard",
      980
    ],

    [
      "7-math-pa-10",
      ["olympiad"],
      "A wire 48 cm long is bent to form a square. What will be the area of the square?",
      "48 सेमी लंबी तार को मोड़कर वर्ग बनाया जाता है। वर्ग का क्षेत्रफल कितना होगा?",
      ["144 cm²", "48 cm²", "96 cm²", "192 cm²"],
      ["144 सेमी²", "48 सेमी²", "96 सेमी²", "192 सेमी²"],
      0,
      [
        "The wire length becomes the perimeter.",
        "Find side first."
      ],
      [
        "तार की लंबाई ही परिमाप बनेगी।",
        "पहले भुजा ज्ञात करें।"
      ],
      "Side = 48/4 = 12 cm, Area = 12² = 144 cm².",
      "भुजा = 48/4 = 12 सेमी, क्षेत्रफल = 144 सेमी²।",
      "hard",
      990
    ],

    [
      "7-math-pa-11",
      ["olympiad"],
      "A rectangular garden is twice as long as it is wide. If its perimeter is 72 m, what is its area?",
      "एक आयताकार बगीचे की लंबाई उसकी चौड़ाई की दोगुनी है। यदि उसका परिमाप 72 मीटर है, तो क्षेत्रफल कितना होगा?",
      ["288 m²", "144 m²", "324 m²", "216 m²"],
      ["288 मी²", "144 मी²", "324 मी²", "216 मी²"],
      0,
      [
        "Let width = x and length = 2x.",
        "Use perimeter formula first."
      ],
      [
        "चौड़ाई = x और लंबाई = 2x मानिए।",
        "पहले परिमाप का सूत्र लगाइए।"
      ],
      "6x = 72 ⇒ x = 12, Area = 24 × 12 = 288 m².",
      "6x = 72 ⇒ x = 12, क्षेत्रफल = 24 × 12 = 288 मी²।",
      "hard",
      1000
    ],

    [
      "7-math-pa-12",
      ["olympiad"],
      "A square field has area 625 m². What is its perimeter?",
      "एक वर्गाकार खेत का क्षेत्रफल 625 मी² है। उसका परिमाप कितना होगा?",
      ["100 m", "50 m", "125 m", "80 m"],
      ["100 मी", "50 मी", "125 मी", "80 मी"],
      0,
      [
        "Find the side using square root.",
        "Then calculate perimeter."
      ],
      [
        "वर्गमूल निकालकर भुजा ज्ञात करें।",
        "फिर परिमाप निकालें।"
      ],
      "Side = 25 m, Perimeter = 100 m.",
      "भुजा = 25 मीटर, परिमाप = 100 मीटर।",
      "hard",
      1010
    ],

    [
      "7-math-pa-13",
      ["olympiad"],
      "The length of a rectangle is increased by 20% while its breadth remains unchanged. What happens to its area?",
      "एक आयत की लंबाई में 20% वृद्धि की जाती है जबकि चौड़ाई समान रहती है। क्षेत्रफल पर क्या प्रभाव पड़ेगा?",
      ["Increases by 20%", "Increases by 10%", "Remains same", "Doubles"],
      ["20% बढ़ेगा", "10% बढ़ेगा", "समान रहेगा", "दोगुना होगा"],
      0,
      [
        "Area depends directly on length.",
        "Breadth is unchanged."
      ],
      [
        "क्षेत्रफल सीधे लंबाई पर निर्भर करता है।",
        "चौड़ाई नहीं बदली है।"
      ],
      "Area increases by the same percentage as length.",
      "क्षेत्रफल भी 20% बढ़ेगा।",
      "hard",
      1020
    ],

    [
      "7-math-pa-14",
      ["olympiad"],
      "A rectangle has perimeter 50 cm and length 15 cm. Find its breadth.",
      "एक आयत का परिमाप 50 सेमी और लंबाई 15 सेमी है। चौड़ाई ज्ञात कीजिए।",
      ["10 cm", "15 cm", "20 cm", "12 cm"],
      ["10 सेमी", "15 सेमी", "20 सेमी", "12 सेमी"],
      0,
      [
        "Use P = 2(l + b).",
        "Substitute known values."
      ],
      [
        "P = 2(l + b) का प्रयोग करें।",
        "दिए गए मान रखिए।"
      ],
      "25 = 15 + b ⇒ b = 10 cm.",
      "25 = 15 + b ⇒ b = 10 सेमी।",
      "hard",
      1030
    ],

    [
      "7-math-pa-15",
      ["olympiad"],
      "How many square tiles of side 20 cm are required to cover a floor of area 8 m²?",
      "8 मी² क्षेत्रफल वाले फर्श को ढकने के लिए 20 सेमी भुजा वाली कितनी वर्गाकार टाइलों की आवश्यकता होगी?",
      ["200", "100", "150", "250"],
      ["200", "100", "150", "250"],
      0,
      [
        "Convert units first.",
        "Find area of one tile."
      ],
      [
        "पहले इकाइयाँ समान करें।",
        "एक टाइल का क्षेत्रफल ज्ञात करें।"
      ],
      "8 m² = 80000 cm², tile area = 400 cm², tiles = 200.",
      "8 मी² = 80000 सेमी², टाइल क्षेत्रफल = 400 सेमी², टाइलें = 200।",
      "hard",
      1040
    ],

    [
      "7-math-pa-16",
      ["olympiad", "application"],
      "A rectangular park is 80 m long and 50 m wide. A path 2 m wide is built inside along the boundary. Which quantity should be calculated first to find the area of the path?",
      "80 मीटर लंबा और 50 मीटर चौड़ा पार्क है। इसकी सीमा के अंदर 2 मीटर चौड़ा मार्ग बनाया गया है। मार्ग का क्षेत्रफल ज्ञात करने के लिए सबसे पहले क्या निकालना चाहिए?",
      [
        "Area of the outer rectangle",
        "Perimeter of the inner rectangle",
        "Length of the path",
        "Area of one corner"
      ],
      [
        "बाहरी आयत का क्षेत्रफल",
        "भीतरी आयत का परिमाप",
        "मार्ग की लंबाई",
        "एक कोने का क्षेत्रफल"
      ],
      0,
      [
        "Path area = Outer area − Inner area.",
        "Start with the whole park."
      ],
      [
        "मार्ग का क्षेत्रफल = बाहरी क्षेत्रफल − भीतरी क्षेत्रफल।",
        "पूरे पार्क से शुरुआत करें।"
      ],
      "The outer rectangle's area must be found first.",
      "सबसे पहले बाहरी आयत का क्षेत्रफल निकालना चाहिए।",
      "hard",
      1025
    ],

    [
      "7-math-pa-17",
      ["olympiad", "reasoning"],
      "Among all rectangles having perimeter 24 cm, which shape has the maximum area?",
      "24 सेमी परिमाप वाले सभी आयतों में किसका क्षेत्रफल अधिकतम होगा?",
      ["Square", "Longest rectangle", "Thinnest rectangle", "Cannot determine"],
      ["वर्ग", "सबसे लंबा आयत", "सबसे पतला आयत", "निर्धारित नहीं किया जा सकता"],
      0,
      [
        "A square is a special rectangle.",
        "Think about area optimization."
      ],
      [
        "वर्ग भी एक विशेष आयत है।",
        "अधिकतम क्षेत्रफल के बारे में सोचिए।"
      ],
      "For a fixed perimeter, a square encloses the maximum area.",
      "निश्चित परिमाप के लिए वर्ग का क्षेत्रफल अधिकतम होता है।",
      "hard",
      1040
    ],

    [
      "7-math-pa-18",
      ["olympiad", "challenge"],
      "The area of a rectangle is 360 cm². If its length is decreased by 20% and breadth remains unchanged, what will be the new area?",
      "एक आयत का क्षेत्रफल 360 सेमी² है। यदि उसकी लंबाई 20% कम कर दी जाए और चौड़ाई समान रहे, तो नया क्षेत्रफल कितना होगा?",
      ["288 cm²", "300 cm²", "320 cm²", "240 cm²"],
      ["288 सेमी²", "300 सेमी²", "320 सेमी²", "240 सेमी²"],
      0,
      [
        "Area changes in the same ratio as length.",
        "80% of original area."
      ],
      [
        "क्षेत्रफल लंबाई के अनुपात में बदलेगा।",
        "मूल क्षेत्रफल का 80% निकालिए।"
      ],
      "New area = 360 × 0.8 = 288 cm².",
      "नया क्षेत्रफल = 360 × 0.8 = 288 सेमी²।",
      "hard",
      1045
    ],

    [
      "7-math-pa-19",
      ["olympiad", "challenge"],
      "A square and a rectangle have equal areas of 196 cm². If the rectangle is 28 cm long, what is its breadth?",
      "एक वर्ग और एक आयत का क्षेत्रफल 196 सेमी² है। यदि आयत की लंबाई 28 सेमी है, तो उसकी चौड़ाई कितनी होगी?",
      ["7 cm", "14 cm", "8 cm", "6 cm"],
      ["7 सेमी", "14 सेमी", "8 सेमी", "6 सेमी"],
      0,
      [
        "Breadth = Area ÷ Length.",
        "Use the rectangle area formula."
      ],
      [
        "चौड़ाई = क्षेत्रफल ÷ लंबाई।",
        "आयत का क्षेत्रफल सूत्र लगाइए।"
      ],
      "Breadth = 196 ÷ 28 = 7 cm.",
      "चौड़ाई = 196 ÷ 28 = 7 सेमी।",
      "hard",
      1048
    ],

    [
      "7-math-pa-20",
      ["olympiad", "challenge"],
      "A square plot has side 50 m. A fence is to be built all around it at ₹120 per metre. What will be the total fencing cost?",
      "50 मीटर भुजा वाले वर्गाकार भूखंड के चारों ओर ₹120 प्रति मीटर की दर से बाड़ लगानी है। कुल लागत कितनी होगी?",
      ["₹24,000", "₹12,000", "₹20,000", "₹30,000"],
      ["₹24,000", "₹12,000", "₹20,000", "₹30,000"],
      0,
      [
        "Find the perimeter first.",
        "Multiply by cost per metre."
      ],
      [
        "पहले परिमाप ज्ञात करें।",
        "फिर प्रति मीटर लागत से गुणा करें।"
      ],
      "Perimeter = 200 m, Cost = 200 × 120 = ₹24,000.",
      "परिमाप = 200 मीटर, लागत = 200 × 120 = ₹24,000।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 12,
  topicId: "math-algebraic-expressions",
  chapterTitle: "Algebraic Expressions",
  chapterTitleHindi: "बीजीय व्यंजक",
  questions: makeQuestionSetFromConcepts("math-algebraic-expressions", [

    [
      "7-math-ae-01",
      ["algebra", "variable"],
      "In the expression 7x + 5, which part represents the variable whose value can change depending on the situation?",
      "व्यंजक 7x + 5 में वह कौन-सा भाग है जिसका मान परिस्थिति के अनुसार बदल सकता है?",
      ["x", "7", "5", "7x"],
      ["x", "7", "5", "7x"],
      0,
      [
        "Variables are represented by letters.",
        "Its value is not fixed."
      ],
      [
        "चर को अक्षरों द्वारा दर्शाया जाता है।",
        "उसका मान निश्चित नहीं होता।"
      ],
      "x is the variable because its value can change.",
      "x चर है क्योंकि उसका मान बदल सकता है।",
      "easy",
      850
    ],

    [
      "7-math-ae-02",
      ["algebra", "constant"],
      "In the expression 4a - 9, which term is a constant?",
      "व्यंजक 4a - 9 में कौन-सा पद अचर है?",
      ["-9", "4a", "a", "4"],
      ["-9", "4a", "a", "4"],
      0,
      [
        "A constant does not contain any variable.",
        "Look for the fixed number."
      ],
      [
        "अचर में कोई चर नहीं होता।",
        "स्थिर संख्या को पहचानिए।"
      ],
      "−9 is a constant term.",
      "−9 एक अचर पद है।",
      "easy",
      860
    ],

    [
      "7-math-ae-03",
      ["terms"],
      "How many terms are present in the algebraic expression 5x + 3y - 8?",
      "बीजीय व्यंजक 5x + 3y - 8 में कुल कितने पद हैं?",
      ["3", "2", "4", "5"],
      ["3", "2", "4", "5"],
      0,
      [
        "Terms are separated by + or − signs.",
        "Count carefully."
      ],
      [
        "+ या − चिह्नों से अलग हुए भागों को गिनिए।",
        "सावधानी से गणना कीजिए।"
      ],
      "The terms are 5x, 3y and -8.",
      "पद हैं: 5x, 3y और -8।",
      "easy",
      870
    ],

    [
      "7-math-ae-04",
      ["like-terms"],
      "Which pair consists of like terms?",
      "निम्न में से कौन-सा युग्म समरूप पदों का है?",
      ["7x and -3x", "5x and 5y", "2a and 2ab", "3m and 3n"],
      ["7x और -3x", "5x और 5y", "2a और 2ab", "3m और 3n"],
      0,
      [
        "Like terms have the same variable part.",
        "Only coefficients may differ."
      ],
      [
        "समरूप पदों का चर भाग समान होता है।",
        "केवल गुणांक अलग हो सकते हैं।"
      ],
      "7x and -3x are like terms because both contain x.",
      "7x और -3x समरूप पद हैं क्योंकि दोनों में x है।",
      "easy",
      880
    ],

    [
      "7-math-ae-05",
      ["simplification"],
      "Simplify: 6x + 4x",
      "सरलीकृत कीजिए: 6x + 4x",
      ["10x", "24x", "10", "x"],
      ["10x", "24x", "10", "x"],
      0,
      [
        "Add the coefficients of like terms.",
        "The variable remains unchanged."
      ],
      [
        "समरूप पदों के गुणांकों को जोड़िए।",
        "चर वही रहेगा।"
      ],
      "6x + 4x = 10x.",
      "6x + 4x = 10x।",
      "easy",
      890
    ],

    [
      "7-math-ae-06",
      ["simplification"],
      "Simplify: 8y - 3y",
      "सरलीकृत कीजिए: 8y - 3y",
      ["5y", "11y", "24y", "y"],
      ["5y", "11y", "24y", "y"],
      0,
      [
        "Subtract coefficients.",
        "The variable remains y."
      ],
      [
        "गुणांकों को घटाइए।",
        "चर y ही रहेगा।"
      ],
      "8y - 3y = 5y.",
      "8y - 3y = 5y।",
      "easy",
      900
    ],

    [
      "7-math-ae-07",
      ["evaluation"],
      "Evaluate 3x + 2 when x = 4.",
      "जब x = 4 हो, तब 3x + 2 का मान ज्ञात कीजिए।",
      ["14", "12", "10", "16"],
      ["14", "12", "10", "16"],
      0,
      [
        "Substitute x = 4.",
        "Follow BODMAS."
      ],
      [
        "x = 4 रखिए।",
        "BODMAS का पालन कीजिए।"
      ],
      "3(4) + 2 = 14.",
      "3(4) + 2 = 14।",
      "easy",
      910
    ],

    [
      "7-math-ae-08",
      ["evaluation"],
      "Find the value of 2a² when a = 3.",
      "जब a = 3 हो, तब 2a² का मान ज्ञात कीजिए।",
      ["18", "12", "9", "6"],
      ["18", "12", "9", "6"],
      0,
      [
        "Square first, then multiply.",
        "3² = ?"
      ],
      [
        "पहले वर्ग कीजिए, फिर गुणा कीजिए।",
        "3² = ?"
      ],
      "2 × 3² = 2 × 9 = 18.",
      "2 × 3² = 2 × 9 = 18।",
      "medium",
      920
    ],

    [
      "7-math-ae-09",
      ["addition"],
      "Add: (4x + 7) + (3x - 2)",
      "जोड़िए: (4x + 7) + (3x - 2)",
      ["7x + 5", "7x - 5", "12x + 5", "x + 5"],
      ["7x + 5", "7x - 5", "12x + 5", "x + 5"],
      0,
      [
        "Combine like terms.",
        "Add x terms and constants separately."
      ],
      [
        "समरूप पदों को मिलाइए।",
        "x वाले पद और अचर अलग-अलग जोड़िए।"
      ],
      "4x + 3x = 7x and 7 - 2 = 5.",
      "4x + 3x = 7x तथा 7 - 2 = 5।",
      "medium",
      930
    ],

    [
      "7-math-ae-10",
      ["subtraction"],
      "Simplify: (9m + 5) - (4m + 2)",
      "सरलीकृत कीजिए: (9m + 5) - (4m + 2)",
      ["5m + 3", "13m + 7", "5m + 7", "13m + 3"],
      ["5m + 3", "13m + 7", "5m + 7", "13m + 3"],
      0,
      [
        "Distribute the minus sign.",
        "Then combine like terms."
      ],
      [
        "ऋण चिह्न को दोनों पदों पर लागू कीजिए।",
        "फिर समरूप पद मिलाइए।"
      ],
      "9m + 5 - 4m - 2 = 5m + 3.",
      "9m + 5 - 4m - 2 = 5m + 3।",
      "medium",
      940
    ],

    [
      "7-math-ae-11",
      ["olympiad"],
      "If x + 5 = 17, what is the value of 2x?",
      "यदि x + 5 = 17 है, तो 2x का मान क्या होगा?",
      ["24", "12", "17", "22"],
      ["24", "12", "17", "22"],
      0,
      [
        "Find x first.",
        "Then multiply by 2."
      ],
      [
        "पहले x ज्ञात कीजिए।",
        "फिर 2 से गुणा कीजिए।"
      ],
      "x = 12, so 2x = 24.",
      "x = 12, अतः 2x = 24।",
      "hard",
      980
    ],

    [
      "7-math-ae-12",
      ["olympiad"],
      "The sum of three consecutive integers is represented by:",
      "तीन क्रमागत पूर्णांकों का योग किस प्रकार व्यक्त किया जा सकता है?",
      ["x + (x+1) + (x+2)", "x + x + x", "x(x+1)(x+2)", "x + 2"],
      ["x + (x+1) + (x+2)", "x + x + x", "x(x+1)(x+2)", "x + 2"],
      0,
      [
        "Consecutive integers differ by 1.",
        "Represent the first as x."
      ],
      [
        "क्रमागत पूर्णांकों में 1 का अंतर होता है।",
        "पहले को x मानिए।"
      ],
      "Consecutive integers can be written as x, x+1, x+2.",
      "क्रमागत पूर्णांक x, x+1, x+2 लिखे जाते हैं।",
      "hard",
      990
    ],

    [
      "7-math-ae-13",
      ["olympiad"],
      "If a = 2 and b = 3, find the value of 2a + 3b.",
      "यदि a = 2 और b = 3 हैं, तो 2a + 3b का मान ज्ञात कीजिए।",
      ["13", "12", "10", "11"],
      ["13", "12", "10", "11"],
      0,
      [
        "Substitute the values carefully.",
        "Multiply before adding."
      ],
      [
        "मानों को सावधानीपूर्वक रखिए।",
        "पहले गुणा फिर जोड़ कीजिए।"
      ],
      "2(2) + 3(3) = 4 + 9 = 13.",
      "2(2) + 3(3) = 4 + 9 = 13।",
      "hard",
      1000
    ],

    [
      "7-math-ae-14",
      ["olympiad"],
      "Which expression represents 'five less than three times a number n'?",
      "‘किसी संख्या n के तीन गुने से 5 कम’ को कौन-सा व्यंजक दर्शाता है?",
      ["3n - 5", "5n - 3", "3(n - 5)", "n - 15"],
      ["3n - 5", "5n - 3", "3(n - 5)", "n - 15"],
      0,
      [
        "Start with three times n.",
        "Then subtract 5."
      ],
      [
        "पहले n का तीन गुना लिखिए।",
        "फिर उसमें से 5 घटाइए।"
      ],
      "Three times n is 3n, five less means subtract 5.",
      "n का तीन गुना 3n होता है और 5 कम का अर्थ 5 घटाना है।",
      "hard",
      1010
    ],

    [
      "7-math-ae-15",
      ["olympiad"],
      "Simplify: 7x + 4y - 3x + 2y",
      "सरलीकृत कीजिए: 7x + 4y - 3x + 2y",
      ["4x + 6y", "10x + 6y", "4x + 2y", "10x + 2y"],
      ["4x + 6y", "10x + 6y", "4x + 2y", "10x + 2y"],
      0,
      [
        "Combine x terms and y terms separately.",
        "Like terms only."
      ],
      [
        "x और y के पद अलग-अलग मिलाइए।",
        "केवल समरूप पदों को जोड़िए।"
      ],
      "7x - 3x = 4x and 4y + 2y = 6y.",
      "7x - 3x = 4x तथा 4y + 2y = 6y।",
      "hard",
      1020
    ],

    [
      "7-math-ae-16",
      ["olympiad"],
      "A number x is increased by 25 and then doubled. Which expression represents the result?",
      "किसी संख्या x में 25 जोड़कर उसे दोगुना किया जाता है। परिणाम को कौन-सा व्यंजक दर्शाता है?",
      ["2(x + 25)", "2x + 25", "x + 50", "25x + 2"],
      ["2(x + 25)", "2x + 25", "x + 50", "25x + 2"],
      0,
      [
        "Perform operations in the given order.",
        "Addition happens before doubling."
      ],
      [
        "दिए गए क्रम का पालन कीजिए।",
        "पहले जोड़, फिर दोगुना।"
      ],
      "First x+25, then multiply the result by 2.",
      "पहले x+25, फिर पूरे परिणाम को 2 से गुणा करें।",
      "hard",
      1030
    ],

    [
      "7-math-ae-17",
      ["olympiad"],
      "If 4p = 28, evaluate p².",
      "यदि 4p = 28 है, तो p² का मान ज्ञात कीजिए।",
      ["49", "14", "196", "7"],
      ["49", "14", "196", "7"],
      0,
      [
        "Find p first.",
        "Then square it."
      ],
      [
        "पहले p ज्ञात कीजिए।",
        "फिर उसका वर्ग कीजिए।"
      ],
      "p = 7, therefore p² = 49.",
      "p = 7, इसलिए p² = 49।",
      "hard",
      1040
    ],

    [
      "7-math-ae-18",
      ["olympiad"],
      "The perimeter of a square with side x cm can be expressed as:",
      "x सेमी भुजा वाले वर्ग का परिमाप किस व्यंजक द्वारा व्यक्त किया जाएगा?",
      ["4x", "x²", "2x", "x + 4"],
      ["4x", "x²", "2x", "x + 4"],
      0,
      [
        "A square has four equal sides.",
        "Add all sides."
      ],
      [
        "वर्ग की चारों भुजाएँ बराबर होती हैं।",
        "सभी भुजाओं को जोड़िए।"
      ],
      "Perimeter = 4 × side = 4x.",
      "परिमाप = 4 × भुजा = 4x।",
      "medium",
      1000
    ],

    [
      "7-math-ae-19",
      ["olympiad"],
      "If x = -2, what is the value of x² + 3x?",
      "यदि x = -2 है, तो x² + 3x का मान क्या होगा?",
      ["-2", "2", "-10", "10"],
      ["-2", "2", "-10", "10"],
      0,
      [
        "Substitute carefully.",
        "Remember that (-2)² is positive."
      ],
      [
        "सावधानीपूर्वक मान रखिए।",
        "ध्यान रखें कि (-2)² धनात्मक होता है।"
      ],
      "(-2)² + 3(-2) = 4 - 6 = -2.",
      "(-2)² + 3(-2) = 4 - 6 = -2।",
      "hard",
      1045
    ],

    [
      "7-math-ae-20",
      ["olympiad", "challenge"],
      "The sum of a number and its double is 36. Which equation correctly represents the situation?",
      "किसी संख्या और उसके दुगुने का योग 36 है। इस स्थिति को कौन-सा समीकरण सही रूप से दर्शाता है?",
      ["x + 2x = 36", "x + 36 = 2x", "2x = 36", "x² = 36"],
      ["x + 2x = 36", "x + 36 = 2x", "2x = 36", "x² = 36"],
      0,
      [
        "Let the number be x.",
        "Its double will be 2x."
      ],
      [
        "संख्या को x मानिए।",
        "उसका दुगुना 2x होगा।"
      ],
      "Number + double of number = 36 ⇒ x + 2x = 36.",
      "संख्या + उसका दुगुना = 36 ⇒ x + 2x = 36।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 13,
  topicId: "math-exponents-and-powers",
  chapterTitle: "Exponents and Powers",
  chapterTitleHindi: "घातांक और घात",
  questions: makeQuestionSetFromConcepts("math-exponents-and-powers", [

    [
      "7-math-ep-01",
      ["exponents", "basics"],
      "A scientist writes the expression 2 × 2 × 2 × 2 × 2 to represent repeated multiplication. Which exponential form correctly represents this product?",
      "एक वैज्ञानिक 2 × 2 × 2 × 2 × 2 को बार-बार गुणा के रूप में लिखता है। इसका सही घातीय रूप क्या होगा?",
      ["2⁵", "5²", "2⁴", "10"],
      ["2⁵", "5²", "2⁴", "10"],
      0,
      [
        "Count how many times 2 appears as a factor.",
        "That count becomes the exponent."
      ],
      [
        "गिनिए कि 2 कितनी बार गुणनखंड के रूप में आया है।",
        "वही संख्या घातांक बनेगी।"
      ],
      "2 is multiplied by itself 5 times, so the expression is 2⁵.",
      "2 स्वयं से 5 बार गुणा हुआ है, इसलिए उत्तर 2⁵ है।",
      "easy",
      850
    ],

    [
      "7-math-ep-02",
      ["powers"],
      "In the expression 7⁴, what is the exponent?",
      "व्यंजक 7⁴ में घातांक कौन-सा है?",
      ["4", "7", "28", "49"],
      ["4", "7", "28", "49"],
      0,
      [
        "The small raised number is called the exponent.",
        "Look carefully at the notation."
      ],
      [
        "ऊपर लिखा छोटा अंक घातांक कहलाता है।",
        "चिन्ह को ध्यान से देखिए।"
      ],
      "In 7⁴, 4 is the exponent.",
      "7⁴ में 4 घातांक है।",
      "easy",
      860
    ],

    [
      "7-math-ep-03",
      ["powers"],
      "Evaluate: 3³",
      "मान ज्ञात कीजिए: 3³",
      ["27", "9", "81", "18"],
      ["27", "9", "81", "18"],
      0,
      [
        "3³ means 3 × 3 × 3.",
        "Multiply step by step."
      ],
      [
        "3³ का अर्थ 3 × 3 × 3 है।",
        "क्रम से गुणा कीजिए।"
      ],
      "3 × 3 × 3 = 27.",
      "3 × 3 × 3 = 27।",
      "easy",
      870
    ],

    [
      "7-math-ep-04",
      ["powers"],
      "What is the value of 10³?",
      "10³ का मान क्या है?",
      ["1000", "100", "30", "300"],
      ["1000", "100", "30", "300"],
      0,
      [
        "10³ = 10 × 10 × 10.",
        "Count the zeros."
      ],
      [
        "10³ = 10 × 10 × 10।",
        "शून्यों की संख्या पर ध्यान दें।"
      ],
      "10 × 10 × 10 = 1000.",
      "10 × 10 × 10 = 1000।",
      "easy",
      880
    ],

    [
      "7-math-ep-05",
      ["powers"],
      "Which of the following is equal to 5²?",
      "निम्न में से कौन-सा 5² के बराबर है?",
      ["25", "10", "15", "20"],
      ["25", "10", "15", "20"],
      0,
      [
        "Square means multiply the number by itself.",
        "5 × 5 = ?"
      ],
      [
        "वर्ग का अर्थ संख्या को स्वयं से गुणा करना है।",
        "5 × 5 = ?"
      ],
      "5² = 25.",
      "5² = 25।",
      "easy",
      890
    ],

    [
      "7-math-ep-06",
      ["laws"],
      "Evaluate: 2³ × 2²",
      "मान ज्ञात कीजिए: 2³ × 2²",
      ["2⁵", "2⁶", "4⁵", "2¹"],
      ["2⁵", "2⁶", "4⁵", "2¹"],
      0,
      [
        "When bases are same, add exponents.",
        "Use exponent laws."
      ],
      [
        "समान आधार होने पर घातांकों को जोड़ते हैं।",
        "घातांक नियम का प्रयोग करें।"
      ],
      "2³ × 2² = 2⁵.",
      "2³ × 2² = 2⁵।",
      "medium",
      900
    ],

    [
      "7-math-ep-07",
      ["laws"],
      "Simplify: 5⁶ ÷ 5²",
      "सरलीकृत कीजिए: 5⁶ ÷ 5²",
      ["5⁴", "5⁸", "25⁴", "5³"],
      ["5⁴", "5⁸", "25⁴", "5³"],
      0,
      [
        "Subtract exponents when dividing.",
        "Same base rule."
      ],
      [
        "भाग करते समय घातांक घटाए जाते हैं।",
        "समान आधार का नियम प्रयोग करें।"
      ],
      "5⁶ ÷ 5² = 5⁴.",
      "5⁶ ÷ 5² = 5⁴।",
      "medium",
      910
    ],

    [
      "7-math-ep-08",
      ["scientific-notation"],
      "How is 100000 written using exponents of 10?",
      "100000 को 10 की घात के रूप में कैसे लिखा जाएगा?",
      ["10⁵", "10⁴", "10⁶", "5¹⁰"],
      ["10⁵", "10⁴", "10⁶", "5¹⁰"],
      0,
      [
        "Count the number of zeros.",
        "That number becomes the exponent."
      ],
      [
        "शून्यों की संख्या गिनिए।",
        "वही घातांक होगा।"
      ],
      "100000 = 10⁵.",
      "100000 = 10⁵।",
      "easy",
      920
    ],

    [
      "7-math-ep-09",
      ["scientific-notation"],
      "The distance between stars is often written in standard form. Which of the following is in standard form?",
      "तारों के बीच की दूरी को प्रायः मानक रूप में लिखा जाता है। निम्न में से कौन-सा मानक रूप है?",
      ["4.2 × 10⁶", "42 × 10⁵", "420 × 10⁴", "4200 × 10³"],
      ["4.2 × 10⁶", "42 × 10⁵", "420 × 10⁴", "4200 × 10³"],
      0,
      [
        "In standard form, the first number is between 1 and 10.",
        "Check the coefficient."
      ],
      [
        "मानक रूप में पहला अंक 1 और 10 के बीच होता है।",
        "गुणांक को देखिए।"
      ],
      "4.2 × 10⁶ is in proper standard form.",
      "4.2 × 10⁶ सही मानक रूप है।",
      "medium",
      930
    ],

    [
      "7-math-ep-10",
      ["powers"],
      "Which statement correctly represents 4⁴?",
      "निम्न में से कौन-सा कथन 4⁴ को सही दर्शाता है?",
      ["4 × 4 × 4 × 4", "4 + 4 + 4 + 4", "4 × 4 + 4", "16 × 4"],
      ["4 × 4 × 4 × 4", "4 + 4 + 4 + 4", "4 × 4 + 4", "16 × 4"],
      0,
      [
        "Exponent means repeated multiplication.",
        "Not repeated addition."
      ],
      [
        "घात का अर्थ बार-बार गुणा है।",
        "यह बार-बार जोड़ नहीं है।"
      ],
      "4⁴ means 4 multiplied by itself four times.",
      "4⁴ का अर्थ 4 को स्वयं से चार बार गुणा करना है।",
      "easy",
      940
    ],

    [
      "7-math-ep-11",
      ["olympiad"],
      "Evaluate: 2⁵ + 2⁴",
      "मान ज्ञात कीजिए: 2⁵ + 2⁴",
      ["48", "32", "64", "24"],
      ["48", "32", "64", "24"],
      0,
      [
        "Calculate each power separately.",
        "Then add."
      ],
      [
        "पहले प्रत्येक घात का मान निकालिए।",
        "फिर जोड़िए।"
      ],
      "2⁵ = 32 and 2⁴ = 16, so total = 48.",
      "2⁵ = 32 तथा 2⁴ = 16, अतः योग 48 है।",
      "hard",
      980
    ],

    [
      "7-math-ep-12",
      ["olympiad"],
      "Which is greater?",
      "इनमें से कौन बड़ा है?",
      ["3⁴", "4³", "Both equal", "Cannot determine"],
      ["3⁴", "4³", "दोनों बराबर", "निर्धारित नहीं किया जा सकता"],
      0,
      [
        "Calculate both values.",
        "Compare carefully."
      ],
      [
        "दोनों मान निकालिए।",
        "सावधानीपूर्वक तुलना कीजिए।"
      ],
      "3⁴ = 81 and 4³ = 64, so 3⁴ is greater.",
      "3⁴ = 81 तथा 4³ = 64, इसलिए 3⁴ बड़ा है।",
      "hard",
      990
    ],

    [
      "7-math-ep-13",
      ["olympiad"],
      "Simplify: (10³ × 10²) ÷ 10⁴",
      "सरलीकृत कीजिए: (10³ × 10²) ÷ 10⁴",
      ["10", "100", "1000", "1"],
      ["10", "100", "1000", "1"],
      0,
      [
        "Add exponents while multiplying.",
        "Subtract while dividing."
      ],
      [
        "गुणा करते समय घातांक जोड़िए।",
        "भाग करते समय घटाइए।"
      ],
      "10^(3+2-4) = 10¹ = 10.",
      "10^(3+2-4) = 10¹ = 10।",
      "hard",
      1000
    ],

    [
      "7-math-ep-14",
      ["olympiad"],
      "The number 7,200,000 can be written in standard form as:",
      "संख्या 7,200,000 को मानक रूप में कैसे लिखा जाएगा?",
      ["7.2 × 10⁶", "72 × 10⁵", "0.72 × 10⁷", "720 × 10⁴"],
      ["7.2 × 10⁶", "72 × 10⁵", "0.72 × 10⁷", "720 × 10⁴"],
      0,
      [
        "Move the decimal point until the coefficient is between 1 and 10.",
        "Count places moved."
      ],
      [
        "दशमलव को तब तक खिसकाइए जब तक गुणांक 1 और 10 के बीच न हो।",
        "स्थानांतरण की संख्या गिनिए।"
      ],
      "7,200,000 = 7.2 × 10⁶.",
      "7,200,000 = 7.2 × 10⁶।",
      "hard",
      1010
    ],

    [
      "7-math-ep-15",
      ["olympiad"],
      "What is the value of 9² − 5²?",
      "9² − 5² का मान क्या है?",
      ["56", "36", "81", "25"],
      ["56", "36", "81", "25"],
      0,
      [
        "Find both squares first.",
        "Then subtract."
      ],
      [
        "पहले दोनों वर्ग ज्ञात कीजिए।",
        "फिर घटाइए।"
      ],
      "81 − 25 = 56.",
      "81 − 25 = 56।",
      "hard",
      1020
    ],

    [
      "7-math-ep-16",
      ["olympiad"],
      "A computer stores 2¹⁰ bytes in a memory block. How many bytes is that?",
      "एक कंप्यूटर मेमोरी ब्लॉक में 2¹⁰ बाइट संग्रहित करता है। यह कितने बाइट होंगे?",
      ["1024", "1000", "512", "2048"],
      ["1024", "1000", "512", "2048"],
      0,
      [
        "2¹⁰ = 2 × 2 × ... × 2 (10 times).",
        "A commonly used computer value."
      ],
      [
        "2¹⁰ = 2 × 2 × ... × 2 (10 बार)।",
        "कंप्यूटर विज्ञान में प्रचलित मान।"
      ],
      "2¹⁰ = 1024.",
      "2¹⁰ = 1024।",
      "hard",
      1030
    ],

    [
      "7-math-ep-17",
      ["olympiad"],
      "Which expression is equal to 8³?",
      "निम्न में से कौन-सा 8³ के बराबर है?",
      ["2⁹", "2⁶", "4⁶", "16³"],
      ["2⁹", "2⁶", "4⁶", "16³"],
      0,
      [
        "Express 8 as a power of 2.",
        "Then apply exponent laws."
      ],
      [
        "8 को 2 की घात के रूप में लिखिए।",
        "फिर घातांक नियम लगाइए।"
      ],
      "8³ = (2³)³ = 2⁹.",
      "8³ = (2³)³ = 2⁹।",
      "hard",
      1040
    ],

    [
      "7-math-ep-18",
      ["olympiad"],
      "How many digits are there in the number 10⁸?",
      "संख्या 10⁸ में कुल कितने अंक होते हैं?",
      ["9", "8", "10", "7"],
      ["9", "8", "10", "7"],
      0,
      [
        "10⁸ = 100000000.",
        "Count the digits."
      ],
      [
        "10⁸ = 100000000।",
        "अंकों की संख्या गिनिए।"
      ],
      "10⁸ has 9 digits.",
      "10⁸ में 9 अंक होते हैं।",
      "hard",
      1045
    ],

    [
      "7-math-ep-19",
      ["olympiad"],
      "Evaluate: (5² × 2²)",
      "मान ज्ञात कीजिए: (5² × 2²)",
      ["100", "50", "25", "20"],
      ["100", "50", "25", "20"],
      0,
      [
        "Use (a² × b²) = (ab)².",
        "Or calculate separately."
      ],
      [
        "(a² × b²) = (ab)² का प्रयोग कीजिए।",
        "या अलग-अलग मान निकालिए।"
      ],
      "25 × 4 = 100.",
      "25 × 4 = 100।",
      "hard",
      1048
    ],

    [
      "7-math-ep-20",
      ["olympiad", "challenge"],
      "A bacteria colony doubles every hour. Starting with 1 bacterium, how many bacteria will there be after 10 hours?",
      "एक बैक्टीरिया कॉलोनी हर घंटे दोगुनी हो जाती है। यदि शुरुआत 1 बैक्टीरिया से हो, तो 10 घंटे बाद कितने बैक्टीरिया होंगे?",
      ["1024", "512", "1000", "2048"],
      ["1024", "512", "1000", "2048"],
      0,
      [
        "Each hour multiplies the count by 2.",
        "Think in terms of powers of 2."
      ],
      [
        "हर घंटे संख्या 2 से गुणा होती है।",
        "2 की घातों के बारे में सोचिए।"
      ],
      "After 10 doublings, count = 2¹⁰ = 1024.",
      "10 बार दोगुना होने पर संख्या = 2¹⁰ = 1024।",
      "hard",
      1050
    ]

  ])
    },
    {
  chapterNumber: 14,
  topicId: "math-symmetry",
  chapterTitle: "Symmetry",
  chapterTitleHindi: "सममिति",
  questions: makeQuestionSetFromConcepts("math-symmetry", [

    [
      "7-math-sym-01",
      ["symmetry", "line-symmetry"],
      "A butterfly appears identical on both sides when folded along its body. Which mathematical concept best describes this property?",
      "एक तितली अपने शरीर के मध्य से मोड़ने पर दोनों ओर समान दिखाई देती है। यह किस गणितीय अवधारणा को दर्शाता है?",
      ["Line Symmetry", "Rotation", "Translation", "Reflection Error"],
      ["रेखीय सममिति", "घूर्णन", "स्थानांतरण", "परावर्तन त्रुटि"],
      0,
      [
        "Think about a figure being divided into two identical halves.",
        "A fold line is involved."
      ],
      [
        "चित्र के दो समान भागों के बारे में सोचिए।",
        "यहाँ मोड़ने वाली रेखा शामिल है।"
      ],
      "When a figure can be folded into two identical halves, it has line symmetry.",
      "जब किसी आकृति को मोड़ने पर दो समान भाग प्राप्त हों, तो उसमें रेखीय सममिति होती है।",
      "easy",
      850
    ],

    [
      "7-math-sym-02",
      ["line-symmetry"],
      "How many lines of symmetry does a square possess?",
      "एक वर्ग में कितनी सममिति रेखाएँ होती हैं?",
      ["4", "2", "1", "8"],
      ["4", "2", "1", "8"],
      0,
      [
        "Consider vertical, horizontal and diagonal folds.",
        "Count all valid symmetry lines."
      ],
      [
        "ऊर्ध्वाधर, क्षैतिज और विकर्ण मोड़ों पर विचार करें।",
        "सभी सममिति रेखाएँ गिनिए।"
      ],
      "A square has 4 lines of symmetry.",
      "एक वर्ग में 4 सममिति रेखाएँ होती हैं।",
      "easy",
      860
    ],

    [
      "7-math-sym-03",
      ["line-symmetry"],
      "Which of the following shapes has exactly one line of symmetry?",
      "निम्नलिखित में से किस आकृति में ठीक एक सममिति रेखा होती है?",
      ["Isosceles Triangle", "Square", "Circle", "Rectangle"],
      ["समद्विबाहु त्रिभुज", "वर्ग", "वृत्त", "आयत"],
      0,
      [
        "Think about folding the shape into two identical halves.",
        "Count only one valid fold."
      ],
      [
        "आकृति को दो समान भागों में मोड़ने के बारे में सोचिए।",
        "केवल एक मान्य मोड़ गिनिए।"
      ],
      "An isosceles triangle has exactly one line of symmetry.",
      "समद्विबाहु त्रिभुज में ठीक एक सममिति रेखा होती है।",
      "easy",
      870
    ],

    [
      "7-math-sym-04",
      ["reflection"],
      "The image seen in a mirror is an example of:",
      "दर्पण में दिखाई देने वाली छवि किसका उदाहरण है?",
      ["Reflection Symmetry", "Translation", "Enlargement", "Rotation"],
      ["परावर्तन सममिति", "स्थानांतरण", "विस्तार", "घूर्णन"],
      0,
      [
        "Mirror images reverse left and right.",
        "Think of reflection."
      ],
      [
        "दर्पण में बायाँ-दायाँ उल्टा दिखाई देता है।",
        "परावर्तन के बारे में सोचिए।"
      ],
      "Mirror images demonstrate reflection symmetry.",
      "दर्पण की छवि परावर्तन सममिति का उदाहरण है।",
      "easy",
      880
    ],

    [
      "7-math-sym-05",
      ["symmetry"],
      "How many lines of symmetry does a rectangle have?",
      "एक आयत में कितनी सममिति रेखाएँ होती हैं?",
      ["2", "4", "1", "0"],
      ["2", "4", "1", "0"],
      0,
      [
        "Consider horizontal and vertical folds.",
        "Ignore diagonals."
      ],
      [
        "क्षैतिज और ऊर्ध्वाधर मोड़ों पर विचार करें।",
        "विकर्णों को न गिनें।"
      ],
      "A rectangle has 2 lines of symmetry.",
      "आयत में 2 सममिति रेखाएँ होती हैं।",
      "easy",
      890
    ],

    [
      "7-math-sym-06",
      ["rotation"],
      "A ceiling fan looks the same after turning by 120°. This property is called:",
      "एक पंखा 120° घुमाने पर वैसा ही दिखाई देता है। इस गुण को क्या कहते हैं?",
      ["Rotational Symmetry", "Reflection", "Translation", "Scaling"],
      ["घूर्णी सममिति", "परावर्तन", "स्थानांतरण", "मापन परिवर्तन"],
      0,
      [
        "The figure is rotated around a center.",
        "No folding is involved."
      ],
      [
        "आकृति किसी केंद्र के चारों ओर घुमाई जाती है।",
        "इसमें मोड़ना शामिल नहीं है।"
      ],
      "This is rotational symmetry.",
      "इसे घूर्णी सममिति कहते हैं।",
      "medium",
      900
    ],

    [
      "7-math-sym-07",
      ["rotation"],
      "What is the order of rotational symmetry of an equilateral triangle?",
      "समबाहु त्रिभुज की घूर्णी सममिति का क्रम क्या है?",
      ["3", "2", "1", "6"],
      ["3", "2", "1", "6"],
      0,
      [
        "Count how many times the figure matches itself in one full turn.",
        "A full turn is 360°."
      ],
      [
        "गिनिए कि एक पूर्ण घूर्णन में आकृति कितनी बार स्वयं से मेल खाती है।",
        "पूर्ण घूर्णन 360° होता है।"
      ],
      "An equilateral triangle matches itself 3 times in one rotation.",
      "समबाहु त्रिभुज एक पूर्ण घूर्णन में 3 बार स्वयं से मेल खाता है।",
      "medium",
      910
    ],

    [
      "7-math-sym-08",
      ["line-symmetry"],
      "How many lines of symmetry does a circle have?",
      "एक वृत्त में कितनी सममिति रेखाएँ होती हैं?",
      ["Infinitely Many", "4", "2", "1"],
      ["अनंत", "4", "2", "1"],
      0,
      [
        "Any diameter divides the circle into identical halves.",
        "There are infinitely many diameters."
      ],
      [
        "कोई भी व्यास वृत्त को दो समान भागों में बाँटता है।",
        "व्यासों की संख्या अनंत है।"
      ],
      "A circle has infinitely many lines of symmetry.",
      "वृत्त में अनंत सममिति रेखाएँ होती हैं।",
      "medium",
      920
    ],

    [
      "7-math-sym-09",
      ["patterns"],
      "Rangoli designs often show symmetry because:",
      "रंगोली डिज़ाइन प्रायः सममित होते हैं क्योंकि:",
      [
        "They repeat identical patterns around a center",
        "They contain only circles",
        "They use only straight lines",
        "They avoid geometric shapes"
      ],
      [
        "वे केंद्र के चारों ओर समान पैटर्न दोहराते हैं",
        "उनमें केवल वृत्त होते हैं",
        "वे केवल सीधी रेखाओं का उपयोग करते हैं",
        "वे ज्यामितीय आकृतियों से बचते हैं"
      ],
      0,
      [
        "Think about decorative patterns.",
        "Symmetry often creates balance."
      ],
      [
        "सजावटी पैटर्न के बारे में सोचिए।",
        "सममिति संतुलन प्रदान करती है।"
      ],
      "Rangoli patterns often use repeated symmetric designs.",
      "रंगोली में अक्सर दोहराए गए सममित पैटर्न उपयोग होते हैं।",
      "easy",
      930
    ],

    [
      "7-math-sym-10",
      ["symmetry"],
      "Which capital English letter has exactly one vertical line of symmetry?",
      "अंग्रेज़ी का कौन-सा बड़ा अक्षर ठीक एक ऊर्ध्वाधर सममिति रेखा रखता है?",
      ["A", "S", "Z", "N"],
      ["A", "S", "Z", "N"],
      0,
      [
        "Visualize folding the letter vertically.",
        "Only one fold should work."
      ],
      [
        "अक्षर को ऊर्ध्वाधर दिशा में मोड़कर सोचिए।",
        "केवल एक मोड़ काम करना चाहिए।"
      ],
      "The letter A has one vertical line of symmetry.",
      "अक्षर A में एक ऊर्ध्वाधर सममिति रेखा होती है।",
      "medium",
      940
    ],

    [
      "7-math-sym-11",
      ["olympiad", "rotation"],
      "A regular hexagon is rotated about its center. What is the smallest angle of rotation that maps it onto itself?",
      "एक सम षट्भुज को उसके केंद्र के चारों ओर घुमाया जाता है। सबसे छोटा घूर्णन कोण क्या होगा जिससे वह स्वयं पर आ जाए?",
      ["60°", "30°", "90°", "120°"],
      ["60°", "30°", "90°", "120°"],
      0,
      [
        "A regular hexagon has 6 equal sides.",
        "Divide 360° by the order."
      ],
      [
        "सम षट्भुज की 6 समान भुजाएँ होती हैं।",
        "360° को क्रम से भाग दें।"
      ],
      "360° ÷ 6 = 60°.",
      "360° ÷ 6 = 60°।",
      "hard",
      980
    ],

    [
      "7-math-sym-12",
      ["olympiad", "symmetry"],
      "Which of the following figures has rotational symmetry but no line symmetry?",
      "निम्न में से किस आकृति में घूर्णी सममिति है लेकिन रेखीय सममिति नहीं है?",
      ["Parallelogram", "Square", "Circle", "Rectangle"],
      ["समांतर चतुर्भुज", "वर्ग", "वृत्त", "आयत"],
      0,
      [
        "Think about a general parallelogram.",
        "It matches after 180° rotation."
      ],
      [
        "साधारण समांतर चतुर्भुज के बारे में सोचिए।",
        "यह 180° घूर्णन के बाद मेल खाता है।"
      ],
      "A parallelogram has rotational symmetry of order 2 but no line symmetry.",
      "समांतर चतुर्भुज में क्रम 2 की घूर्णी सममिति होती है, लेकिन रेखीय सममिति नहीं होती।",
      "hard",
      990
    ],

    [
      "7-math-sym-13",
      ["olympiad", "rotation"],
      "What is the order of rotational symmetry of a square?",
      "वर्ग की घूर्णी सममिति का क्रम क्या है?",
      ["4", "2", "8", "1"],
      ["4", "2", "8", "1"],
      0,
      [
        "Count all positions where the square looks unchanged.",
        "Include the starting position."
      ],
      [
        "उन सभी स्थितियों को गिनिए जहाँ वर्ग समान दिखता है।",
        "प्रारंभिक स्थिति को भी शामिल करें।"
      ],
      "A square has rotational symmetry of order 4.",
      "वर्ग की घूर्णी सममिति का क्रम 4 होता है।",
      "hard",
      1000
    ],

    [
      "7-math-sym-14",
      ["olympiad", "reflection"],
      "If a point is 5 cm to the right of a mirror line, where will its reflected image be located?",
      "यदि कोई बिंदु दर्पण रेखा के दाईं ओर 5 सेमी दूर है, तो उसकी प्रतिबिंबित छवि कहाँ होगी?",
      [
        "5 cm to the left of the mirror line",
        "10 cm to the left",
        "5 cm to the right",
        "At the mirror line"
      ],
      [
        "दर्पण रेखा के बाईं ओर 5 सेमी",
        "बाईं ओर 10 सेमी",
        "दाईं ओर 5 सेमी",
        "दर्पण रेखा पर"
      ],
      0,
      [
        "Reflection preserves distance.",
        "The mirror line lies exactly in the middle."
      ],
      [
        "परावर्तन दूरी को समान रखता है।",
        "दर्पण रेखा ठीक बीच में होती है।"
      ],
      "The reflected point lies 5 cm on the opposite side.",
      "प्रतिबिंबित बिंदु दूसरी ओर 5 सेमी दूरी पर होगा।",
      "hard",
      1010
    ],

    [
      "7-math-sym-15",
      ["olympiad", "patterns"],
      "A decorative pattern repeats every 72°. What is the order of its rotational symmetry?",
      "एक सजावटी पैटर्न हर 72° पर दोहराया जाता है। उसकी घूर्णी सममिति का क्रम क्या होगा?",
      ["5", "4", "6", "3"],
      ["5", "4", "6", "3"],
      0,
      [
        "Order = 360° ÷ smallest angle.",
        "Apply the formula."
      ],
      [
        "क्रम = 360° ÷ सबसे छोटा कोण।",
        "सूत्र लागू कीजिए।"
      ],
      "360° ÷ 72° = 5.",
      "360° ÷ 72° = 5।",
      "hard",
      1020
    ],

    [
      "7-math-sym-16",
      ["olympiad", "geometry"],
      "How many lines of symmetry does a regular pentagon have?",
      "एक सम पंचभुज में कितनी सममिति रेखाएँ होती हैं?",
      ["5", "10", "2", "1"],
      ["5", "10", "2", "1"],
      0,
      [
        "For a regular polygon, the number of symmetry lines equals the number of sides.",
        "Think of all possible folds."
      ],
      [
        "सम बहुभुज में सममिति रेखाओं की संख्या भुजाओं के बराबर होती है।",
        "सभी संभावित मोड़ों के बारे में सोचिए।"
      ],
      "A regular pentagon has 5 lines of symmetry.",
      "सम पंचभुज में 5 सममिति रेखाएँ होती हैं।",
      "hard",
      1030
    ],

    [
      "7-math-sym-17",
      ["olympiad", "challenge"],
      "Which shape has infinitely many lines of symmetry and infinitely many rotational symmetries?",
      "किस आकृति में अनंत सममिति रेखाएँ और अनंत घूर्णी सममितियाँ होती हैं?",
      ["Circle", "Square", "Rectangle", "Triangle"],
      ["वृत्त", "वर्ग", "आयत", "त्रिभुज"],
      0,
      [
        "Think about every diameter and every angle of rotation.",
        "Only one shape satisfies both."
      ],
      [
        "हर व्यास और हर घूर्णन कोण के बारे में सोचिए।",
        "केवल एक आकृति दोनों शर्तें पूरी करती है।"
      ],
      "A circle has infinitely many line and rotational symmetries.",
      "वृत्त में अनंत रेखीय और घूर्णी सममितियाँ होती हैं।",
      "hard",
      1040
    ],

    [
      "7-math-sym-18",
      ["olympiad", "reasoning"],
      "A figure has rotational symmetry of order 8. What is its smallest angle of rotation?",
      "किसी आकृति की घूर्णी सममिति का क्रम 8 है। उसका सबसे छोटा घूर्णन कोण कितना होगा?",
      ["45°", "22.5°", "90°", "60°"],
      ["45°", "22.5°", "90°", "60°"],
      0,
      [
        "Smallest angle = 360° ÷ order.",
        "Use the definition of rotational symmetry."
      ],
      [
        "सबसे छोटा कोण = 360° ÷ क्रम।",
        "घूर्णी सममिति की परिभाषा का उपयोग करें।"
      ],
      "360° ÷ 8 = 45°.",
      "360° ÷ 8 = 45°।",
      "hard",
      1045
    ],

    [
      "7-math-sym-19",
      ["olympiad", "challenge"],
      "Which regular polygon has rotational symmetry of order 12?",
      "किस सम बहुभुज की घूर्णी सममिति का क्रम 12 होता है?",
      ["Regular Dodecagon", "Regular Hexagon", "Regular Pentagon", "Regular Octagon"],
      ["सम द्वादशभुज", "सम षट्भुज", "सम पंचभुज", "सम अष्टभुज"],
      0,
      [
        "For a regular polygon, order equals number of sides.",
        "Think of the polygon with 12 sides."
      ],
      [
        "सम बहुभुज में क्रम = भुजाओं की संख्या।",
        "12 भुजाओं वाले बहुभुज के बारे में सोचिए।"
      ],
      "A regular dodecagon has 12 sides and rotational symmetry of order 12.",
      "सम द्वादशभुज में 12 भुजाएँ होती हैं और उसकी घूर्णी सममिति का क्रम 12 होता है।",
      "hard",
      1048
    ],

    [
      "7-math-sym-20",
      ["olympiad", "challenge"],
      "A logo remains unchanged after rotations of 90°, 180°, and 270°. What is the order of its rotational symmetry?",
      "एक लोगो 90°, 180° और 270° घुमाने पर अपरिवर्तित रहता है। उसकी घूर्णी सममिति का क्रम क्या है?",
      ["4", "3", "2", "8"],
      ["4", "3", "2", "8"],
      0,
      [
        "Count all matching positions including the starting position.",
        "Think of one complete revolution."
      ],
      [
        "प्रारंभिक स्थिति सहित सभी मेल खाने वाली स्थितियाँ गिनिए।",
        "एक पूर्ण घूर्णन के बारे में सोचिए।"
      ],
      "The logo matches itself 4 times in one full turn, so the order is 4.",
      "लोगो एक पूर्ण घूर्णन में 4 बार स्वयं से मेल खाता है, इसलिए क्रम 4 है।",
      "hard",
      1050
    ]

  ])
    },
    

];
export { class7MathematicsQuestionBank };