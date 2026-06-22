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
}

];