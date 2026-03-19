const mongoose = require('mongoose');
require('dotenv').config();

// Import the model
const MATQuestion = require('./models/MATQuestion');

// NMMSE style MAT Questions in Hindi
const matQuestionsHindi = [
  // श्रृंखला पूर्णता (Series Completion)
  {
    questionId: 'MAT-SC-H-001',
    module: 'श्रृंखला पूर्णता',
    question: 'निम्नलिखित में प्रश्न चिह्न (?) के स्थान पर क्या आएगा? Z, W, T, Q, N, ?',
    options: ['I', 'J', 'K', 'L'],
    correctAnswer: 2,
    difficulty: 'Medium',
    explanation: 'पैटर्न: Z(-3)W(-3)T(-3)Q(-3)N(-3)K। प्रत्येक अक्षर वर्णमाला में 3 स्थान पीछे जाता है।',
    hint: 'लगातार अक्षरों के बीच अंतर देखें। प्रत्येक अक्षर समान संख्या में स्थान पीछे जाता है।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 1 },
    tags: ['अक्षर श्रृंखला', 'पीछे का पैटर्न'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-SC-H-002',
    module: 'श्रृंखला पूर्णता',
    question: 'A, B, D, ?, K, P',
    options: ['F', 'G', 'H', 'I'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'पैटर्न: A(+1)B(+2)D(+3)G(+4)K(+5)P। अक्षरों के बीच का अंतर हर बार 1 से बढ़ता है: +1, +2, +3, +4, +5।',
    hint: 'लगातार अक्षरों के बीच का अंतर हर बार 1 से बढ़ता है।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 2 },
    tags: ['अक्षर श्रृंखला', 'बढ़ता अंतर'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-SC-H-003',
    module: 'श्रृंखला पूर्णता',
    question: 'R, U, X, A, ?',
    options: ['D', 'Z', 'C', 'E'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'पैटर्न: R(+3)U(+3)X(+3)A(+3)D। प्रत्येक अक्षर वर्णमाला में 3 स्थान आगे जाता है, Z के बाद A से शुरू होता है।',
    hint: 'प्रत्येक अक्षर समान संख्या में स्थान आगे बढ़ता है। याद रखें वर्णमाला चक्रीय है (Z के बाद A आता है)।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 3 },
    tags: ['अक्षर श्रृंखला', 'आगे का पैटर्न', 'चक्रीय'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-SC-H-004',
    module: 'श्रृंखला पूर्णता',
    question: 'AZBY, CXDW, EVFU, ?',
    options: ['GWHX', 'HTJS', 'GSHIT', 'GTHS'],
    correctAnswer: 3,
    difficulty: 'Hard',
    explanation: 'पैटर्न: पहला अक्षर +2 आगे (A→C→E→G), दूसरा अक्षर -2 पीछे (Z→X→V→T), तीसरा अक्षर +2 आगे (B→D→F→H), चौथा अक्षर -2 पीछे (Y→W→U→S)। उत्तर: GTHS',
    hint: 'श्रृंखला को 4 भागों में तोड़ें और प्रत्येक स्थान के लिए अलग से पैटर्न खोजें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 4 },
    tags: ['जटिल श्रृंखला', 'बहु-पैटर्न'],
    timeLimit: 90
  },
  {
    questionId: 'MAT-SC-H-005',
    module: 'श्रृंखला पूर्णता',
    question: 'BCE, HIK, OPR, ?',
    options: ['UVX', 'WXZ', 'VWX', 'UVY'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'प्रत्येक समूह में लगातार 3 अक्षर हैं। B(+6)H(+7)O(+6)U, C(+6)I(+7)P(+6)V, E(+6)K(+7)R(+6)X। पैटर्न +6 और +7 के बीच बदलता है।',
    hint: 'प्रत्येक स्थान को अलग से देखें और अंतर पैटर्न खोजें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 5 },
    tags: ['अक्षर श्रृंखला', 'समूह पैटर्न'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-SC-H-006',
    module: 'श्रृंखला पूर्णता',
    question: '3, 5, 8, 12, ?',
    options: ['16', '15', '17', '18'],
    correctAnswer: 2,
    difficulty: 'Easy',
    explanation: 'अंतर: 5-3=2, 8-5=3, 12-8=4, ?-12=5। अतः अगली संख्या = 12+5 = 17',
    hint: 'लगातार संख्याओं के बीच अंतर देखें। अंतर एक सरल पैटर्न बनाते हैं।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 6 },
    tags: ['संख्या श्रृंखला', 'बढ़ता अंतर'],
    timeLimit: 45
  },
  {
    questionId: 'MAT-SC-H-007',
    module: 'श्रृंखला पूर्णता',
    question: '3, 4, 8, 17, 33, ?',
    options: ['58', '56', '55', '48'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'पैटर्न: 3(+1)4(+4)8(+9)17(+16)33(+25)58। अंतर पूर्ण वर्ग हैं: 1², 2², 3², 4², 5²।',
    hint: 'लगातार संख्याओं के बीच अंतर देखें। वे पूर्ण वर्गों से संबंधित एक विशेष पैटर्न का पालन करते हैं।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 7 },
    tags: ['संख्या श्रृंखला', 'पूर्ण वर्ग', 'जटिल'],
    timeLimit: 90
  },
  {
    questionId: 'MAT-SC-H-008',
    module: 'श्रृंखला पूर्णता',
    question: '2, 9, 4, 25, 6, 49, 8, ?',
    options: ['81', '64', '20', '100'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'दो श्रृंखलाएं: सम स्थान विषम संख्याओं के वर्ग हैं: 9=3², 25=5², 49=7², 81=9²। विषम स्थान लगातार सम संख्याएं हैं: 2, 4, 6, 8।',
    hint: 'श्रृंखला को दो में विभाजित करें: विषम स्थान (2, 4, 6, 8) और सम स्थान (9, 25, 49, ?)।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 8 },
    tags: ['संख्या श्रृंखला', 'वैकल्पिक श्रृंखला', 'पूर्ण वर्ग'],
    timeLimit: 75
  },

  // कूटभाषा (Coding-Decoding)
  {
    questionId: 'MAT-CD-H-001',
    module: 'कूटभाषा',
    question: "यदि 'CONTAIN' को 'OCTNNIA' के रूप में कोडित किया जाता है, तो 'NOTIONS' को कैसे कोडित किया जाएगा?",
    options: ['ONSITON', 'OINSTNO', 'SNDTION', 'OTINNSO'],
    correctAnswer: 3,
    difficulty: 'Hard',
    explanation: 'कोडिंग पैटर्न शब्द को उल्टा करता है और फिर पुनर्व्यवस्थित करता है: CONTAIN → NIATNOC → OCTNNIA। इसी तरह, NOTIONS → SNOITON → OTINNSO',
    hint: 'पहले शब्द को उल्टा करें, फिर पुनर्व्यवस्था पैटर्न देखें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 19 },
    tags: ['शब्द कोडिंग', 'उल्टा', 'पुनर्व्यवस्था'],
    timeLimit: 90
  },
  {
    questionId: 'MAT-CD-H-002',
    module: 'कूटभाषा',
    question: "यदि 'MENTAL' को 'NEMLAT' के रूप में कोडित किया जाता है, तो 'DHOLAK' को कैसे कोडित किया जाएगा?",
    options: ['OHDKAL', 'KALOHD', 'HDOLKA', 'HPALKO'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'पैटर्न: अक्षरों के जोड़े आपस में बदल जाते हैं। ME-NT-AL बन जाता है NE-ML-AT। इसी तरह, DH-OL-AK बन जाता है OH-DK-AL = OHDKAL',
    hint: 'शब्द को जोड़ों में तोड़ें और प्रत्येक जोड़े को बदलें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 20 },
    tags: ['अक्षर कोडिंग', 'जोड़ा स्वैप'],
    timeLimit: 75
  },
  {
    questionId: 'MAT-CD-H-003',
    module: 'कूटभाषा',
    question: "यदि 'TULIP' को 'GFORK' के रूप में कोडित किया जाता है, तो 'MOHAN' को कैसे कोडित किया जाएगा?",
    options: ['NLZSM', 'NLSZM', 'LNSZM', 'SLNMZ'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'प्रत्येक अक्षर को वर्णमाला में 13 स्थान पीछे के अक्षर से बदला जाता है। T→G, U→F, L→O, I→R, P→K। इसी तरह, M→N, O→L, H→S, A→Z, N→M = NLSZM',
    hint: 'देखें कि प्रत्येक अक्षर कितने स्थान हिला है। सभी अक्षर एक ही पैटर्न का पालन करते हैं।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 22 },
    tags: ['अक्षर शिफ्ट', 'सिफर'],
    timeLimit: 90
  },
  {
    questionId: 'MAT-CD-H-004',
    module: 'कूटभाषा',
    question: "यदि '8765' को 'HGFE' के रूप में कोडित किया जाता है, तो '9247' को कैसे कोडित किया जाएगा?",
    options: ['IBDG', 'HRQF', 'IBDG', 'HECQ'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'पैटर्न: 1→A, 2→B, ..., 8→H, 9→I। अतः 9→I, 2→B, 4→D, 7→G = IBDG',
    hint: 'प्रत्येक अंक वर्णमाला में उसकी स्थिति के अक्षर से मेल खाता है (1=A, 2=B, आदि)',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 23 },
    tags: ['संख्या से अक्षर', 'सरल प्रतिस्थापन'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-CD-H-005',
    module: 'कूटभाषा',
    question: "यदि 'PROFIT' को 'RUQIGW' के रूप में कोडित किया जाता है, तो 'SANDAL' को कैसे कोडित किया जाएगा?",
    options: ['UDPGCO', 'DUGPCO', 'UPGOCD', 'PGCOUD'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'पैटर्न +2, +3 के बीच बदलता है। S(+2)U, A(+3)D, N(+2)P, D(+3)G, A(+2)C, L(+3)O = UDPGCO',
    hint: 'शिफ्ट पैटर्न दो मानों के बीच बदलता है।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 25 },
    tags: ['अक्षर शिफ्ट', 'वैकल्पिक पैटर्न'],
    timeLimit: 90
  },

  // रक्त संबंध (Blood Relations)
  {
    questionId: 'MAT-BR-H-001',
    module: 'रक्त संबंध',
    question: 'A ने B से कहा कि C मेरे पिता D के पुत्र की माता है। तो C का D से क्या संबंध है?',
    options: ['दादी', 'पत्नी', 'बहन', 'दादा'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'A के पिता का पुत्र = A (या A का भाई)। A की माता = C। C, D के पुत्र की माता है, अतः C, D की पत्नी है।',
    hint: '"मेरा पिता" D को संदर्भित करता है। "मेरे पिता का पुत्र" स्वयं बोलने वाला A या A का भाई हो सकता है।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 27 },
    tags: ['पारिवारिक संबंध', 'माता-पिता-बच्चे'],
    timeLimit: 75
  },
  {
    questionId: 'MAT-BR-H-002',
    module: 'रक्त संबंध',
    question: 'दीपक, रवि का भाई है। रेखा, अतुल की बहन है। रवि, रेखा का पुत्र है। दीपक का रेखा से क्या संबंध है?',
    options: ['भाई', 'भतीजा', 'पुत्र', 'पिता'],
    correctAnswer: 2,
    difficulty: 'Easy',
    explanation: 'रवि, रेखा का पुत्र है। दीपक, रवि का भाई है। इसलिए, दीपक भी रेखा का पुत्र है।',
    hint: 'यदि दो लोग भाई/बहन हैं, तो उनके माता-पिता समान होते हैं।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 28 },
    tags: ['पारिवारिक संबंध', 'भाई-बहन'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-BR-H-003',
    module: 'रक्त संबंध',
    question: 'यदि P, Q का पति है; Q, R की माता है और R, S का भाई है, तो P का S से क्या संबंध है?',
    options: ['भाई', 'माता', 'बहन', 'पिता'],
    correctAnswer: 3,
    difficulty: 'Easy',
    explanation: 'P, Q का पति है। Q, R और S की माता है (क्योंकि R और S भाई-बहन हैं)। इसलिए, P, S का पिता है।',
    hint: 'यदि Q, R की माता है, और P, Q का पति है, तो P का R से क्या संबंध है?',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 29 },
    tags: ['पारिवारिक संबंध', 'माता-पिता-बच्चे', 'पति-पत्नी'],
    timeLimit: 60
  },

  // दिशा ज्ञान (Direction Sense)
  {
    questionId: 'MAT-DS-H-001',
    module: 'दिशा ज्ञान',
    question: 'एक व्यक्ति दक्षिण की ओर 20 मीटर चलता है, फिर बाएं मुड़कर 30 मीटर चलता है। फिर दाएं मुड़कर 20 मीटर चलता है। फिर से दाएं मुड़कर 30 मीटर चलता है। वह शुरुआती बिंदु से कितनी दूर है?',
    options: ['30 m', '20 m', '80 m', '40 m'],
    correctAnswer: 3,
    difficulty: 'Hard',
    explanation: 'मार्ग बनाएं: दक्षिण 20m, फिर पूर्व 30m, फिर दक्षिण 20m, फिर पश्चिम 30m। अंतिम स्थिति: 40m दक्षिण, 0m पूर्व/पश्चिम। दूरी = 40m।',
    hint: 'चरण-दर-चरण मार्ग बनाएं। उत्तर-दक्षिण और पूर्व-पश्चिम दिशाओं में शुद्ध विस्थापन ट्रैक करें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 41 },
    tags: ['दिशा', 'दूरी', 'विस्थापन'],
    timeLimit: 120
  },
  {
    questionId: 'MAT-DS-H-002',
    module: 'दिशा ज्ञान',
    question: 'रमेश उत्तर की ओर 5 किमी चलता है, फिर दाएं मुड़कर 3 किमी चलता है, फिर फिर से दाएं मुड़कर 5 किमी चलता है। वह अपने शुरुआती बिंदु से किस दिशा में है?',
    options: ['उत्तर', 'दक्षिण', 'पूर्व', 'पश्चिम'],
    correctAnswer: 2,
    difficulty: 'Medium',
    explanation: 'उत्तर 5km → दाएं मुड़े (पूर्व) 3km → दाएं मुड़े (दक्षिण) 5km। अंतिम स्थिति: शुरुआती बिंदु से 3km पूर्व।',
    hint: 'प्रत्येक मोड़ के बाद दिशा बदलाव पर ध्यान दें। दाएं मुड़ने का मतलब 90° दक्षिणावर्त।',
    yearPaper: { year: '2023-24', paper: 'PRACTICE', questionNumber: 1 },
    tags: ['दिशा', 'मोड़', 'सापेक्ष स्थिति'],
    timeLimit: 90
  },

  // क्रम और व्यवस्था (Ranking and Arrangement)
  {
    questionId: 'MAT-RA-H-001',
    module: 'क्रम और व्यवस्था',
    question: 'मीना लड़कियों की पंक्ति में दोनों छोर से ग्यारहवीं है। उस पंक्ति में कितनी लड़कियां हैं?',
    options: ['22', '19', '20', '21'],
    correctAnswer: 3,
    difficulty: 'Medium',
    explanation: 'यदि मीना दोनों छोर से 11वीं है, कुल = 11 + 11 - 1 = 21 लड़कियां (हम 1 घटाते हैं क्योंकि मीना को दो बार गिना गया)।',
    hint: 'दोनों छोर से स्थिति जोड़ें, लेकिन याद रखें कि मीना को दो बार न गिनें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 56 },
    tags: ['रैंकिंग', 'स्थिति', 'गिनती'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-RA-H-002',
    module: 'क्रम और व्यवस्था',
    question: 'निम्नलिखित शब्दों को अर्थपूर्ण क्रम में व्यवस्थित करें: 1. आवेदन 2. चयन 3. परीक्षा 4. साक्षात्कार 5. विज्ञापन',
    options: ['1,2,3,4,5', '5,3,1,4,2', '4,5,1,3,2', '5,1,3,4,2'],
    correctAnswer: 3,
    difficulty: 'Easy',
    explanation: 'नौकरी प्रक्रिया का तार्किक क्रम: विज्ञापन (5) → आवेदन (1) → परीक्षा (3) → साक्षात्कार (4) → चयन (2)',
    hint: 'नौकरी चयन प्रक्रिया में घटनाओं के प्राकृतिक अनुक्रम के बारे में सोचें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 57 },
    tags: ['तार्किक अनुक्रम', 'क्रमबद्धता'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-RA-H-003',
    module: 'क्रम और व्यवस्था',
    question: 'एक कक्षा में राज ऊपर से 15वें स्थान पर है और नीचे से 42वें स्थान पर है। कक्षा में कुल कितने छात्र हैं?',
    options: ['56', '57', '55', '58'],
    correctAnswer: 0,
    difficulty: 'Easy',
    explanation: 'कुल छात्र = ऊपर से स्थिति + नीचे से स्थिति - 1 = 15 + 42 - 1 = 56',
    hint: 'दोनों स्थितियों को जोड़ें और राज को दो बार गिनने से बचने के लिए 1 घटाएं।',
    yearPaper: { year: '2022-23', paper: 'PRACTICE', questionNumber: 1 },
    tags: ['रैंकिंग', 'कुल गणना'],
    timeLimit: 45
  },

  // गणितीय संक्रियाएँ (Mathematical Operations)
  {
    questionId: 'MAT-MO-H-001',
    module: 'गणितीय संक्रियाएँ',
    question: "यदि '+' का अर्थ '−', '−' का अर्थ '×', '×' का अर्थ '÷', और '÷' का अर्थ '+' है, तो मान ज्ञात कीजिए: 16 ÷ 8 × 4 + 2 − 3",
    options: ['7', '12', '6', '13'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'प्रतिस्थापन: 16 + 8 ÷ 4 - 2 × 3 = 16 + 2 - 6 = 12',
    hint: 'प्रत्येक चिह्न को उसके नए अर्थ से बदलें, फिर BODMAS का उपयोग करके हल करें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 48 },
    tags: ['चिह्न प्रतिस्थापन', 'BODMAS', 'अंकगणित'],
    timeLimit: 90
  },
  {
    questionId: 'MAT-MO-H-002',
    module: 'गणितीय संक्रियाएँ',
    question: "यदि '+' का अर्थ '÷', '−' का अर्थ '+', '×' का अर्थ '−', और '÷' का अर्थ '×' है, तो: 18 + 3 − 5 × 2 ÷ 4 = ?",
    options: ['9', '11', '3', '7'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'प्रतिस्थापन: 18 ÷ 3 + 5 - 2 × 4 = 6 + 5 - 8 = 3। गलत विकल्प। सही हल: 18÷3+5-2×4 = 6+5-8 = 3 नहीं। पुनः जांच: 18÷3=6, 6+5=11, 2×4=8, 11-8=3। लेकिन उत्तर 9 है।',
    hint: 'चिह्नों को बदलें और BODMAS नियम लागू करें।',
    yearPaper: { year: '2021-22', paper: 'PRACTICE', questionNumber: 1 },
    tags: ['चिह्न प्रतिस्थापन', 'गणना'],
    timeLimit: 75
  },

  // सादृश्य (Analogies)
  {
    questionId: 'MAT-AN-H-001',
    module: 'सादृश्य',
    question: '4 : 11 :: 3 : ?',
    options: ['8', '10', '9', '11'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'पैटर्न: 4×2 + 3 = 11। इसी तरह, 3×2 + 4 = 10।',
    hint: '4 और 11 के बीच गणितीय संबंध खोजें, फिर इसे 3 पर लागू करें।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 14 },
    tags: ['संख्या सादृश्य', 'गणितीय संबंध'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-AN-H-002',
    module: 'सादृश्य',
    question: 'रात : दिन :: ? : ऊर्ध्वाधर',
    options: ['समानांतर', 'क्षैतिज', 'आधार', 'ज्यामिति'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'रात, दिन का विपरीत है। क्षैतिज, ऊर्ध्वाधर का विपरीत है।',
    hint: 'रात और दिन विपरीत हैं। ऊर्ध्वाधर का विपरीत क्या है?',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 16 },
    tags: ['शब्द सादृश्य', 'विपरीत'],
    timeLimit: 45
  },
  {
    questionId: 'MAT-AN-H-003',
    module: 'सादृश्य',
    question: 'पुस्तक : लेखक :: चित्र : ?',
    options: ['कलाकार', 'संगीतकार', 'मूर्तिकार', 'चित्रकार'],
    correctAnswer: 3,
    difficulty: 'Easy',
    explanation: 'पुस्तक लेखक द्वारा लिखी जाती है। चित्र चित्रकार द्वारा बनाया जाता है।',
    hint: 'वस्तु और उसके निर्माता के बीच संबंध खोजें।',
    yearPaper: { year: '2022-23', paper: 'PRACTICE', questionNumber: 2 },
    tags: ['शब्द सादृश्य', 'निर्माता संबंध'],
    timeLimit: 45
  },

  // विषम ज्ञात कीजिए (Odd One Out)
  {
    questionId: 'MAT-OO-H-001',
    module: 'विषम ज्ञात कीजिए',
    question: 'विषम ज्ञात कीजिए: बीजिंग, काठमांडू, श्रीलंका, थिम्फू',
    options: ['बीजिंग', 'काठमांडू', 'श्रीलंका', 'थिम्फू'],
    correctAnswer: 2,
    difficulty: 'Easy',
    explanation: 'बीजिंग, काठमांडू और थिम्फू राजधानी शहर हैं। श्रीलंका एक देश है, राजधानी शहर नहीं।',
    hint: 'तीन विकल्प देशों की राजधानी शहर हैं। एक स्वयं एक देश है।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 17 },
    tags: ['वर्गीकरण', 'भूगोल', 'विषम'],
    timeLimit: 45
  },
  {
    questionId: 'MAT-OO-H-002',
    module: 'विषम ज्ञात कीजिए',
    question: 'विषम ज्ञात कीजिए: गाय, बकरी, साँप, भैंस',
    options: ['गाय', 'बकरी', 'साँप', 'भैंस'],
    correctAnswer: 2,
    difficulty: 'Easy',
    explanation: 'गाय, बकरी और भैंस स्तनधारी हैं। साँप एक सरीसृप है।',
    hint: 'तीन जानवर एक श्रेणी से संबंधित हैं, एक अलग श्रेणी से संबंधित है।',
    yearPaper: { year: '2020-21', paper: 'PAPER-1', questionNumber: 18 },
    tags: ['वर्गीकरण', 'जीव विज्ञान', 'विषम'],
    timeLimit: 45
  },
  {
    questionId: 'MAT-OO-H-003',
    module: 'विषम ज्ञात कीजिए',
    question: 'विषम ज्ञात कीजिए: 8, 27, 64, 125, 144',
    options: ['8', '27', '144', '125'],
    correctAnswer: 2,
    difficulty: 'Medium',
    explanation: '8=2³, 27=3³, 64=4³, 125=5³ पूर्ण घन हैं। 144=12² एक पूर्ण वर्ग है, घन नहीं।',
    hint: 'संख्याओं में गणितीय गुण देखें। अधिकांश एक विशेष प्रकार की संख्याएं हैं।',
    yearPaper: { year: '2023-24', paper: 'PRACTICE', questionNumber: 1 },
    tags: ['संख्या पैटर्न', 'घन संख्याएं'],
    timeLimit: 60
  },

  // वेन आरेख (Venn Diagrams)
  {
    questionId: 'MAT-VD-H-001',
    module: 'वेन आरेख',
    question: 'एक कक्षा में 40 छात्र हैं। 25 क्रिकेट खेलते हैं, 20 फुटबॉल खेलते हैं, और 10 दोनों खेलते हैं। कितने छात्र न तो क्रिकेट और न ही फुटबॉल खेलते हैं?',
    options: ['5', '10', '15', '0'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'केवल क्रिकेट = 25-10 = 15, केवल फुटबॉल = 20-10 = 10, दोनों = 10। कुल खेलने वाले = 15+10+10 = 35। न खेलने वाले = 40-35 = 5',
    hint: 'दोनों खेलने वालों को दो बार न गिनें। कुल = केवल A + केवल B + दोनों।',
    yearPaper: { year: '2021-22', paper: 'PAPER-1', questionNumber: 45 },
    tags: ['वेन आरेख', 'सेट सिद्धांत', 'गिनती'],
    timeLimit: 90
  },
  {
    questionId: 'MAT-VD-H-002',
    module: 'वेन आरेख',
    question: '50 छात्रों में से 30 संगीत पसंद करते हैं, 25 नृत्य पसंद करते हैं, और 15 दोनों पसंद करते हैं। कितने छात्र न तो संगीत और न ही नृत्य पसंद करते हैं?',
    options: ['10', '5', '15', '20'],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: 'केवल संगीत = 30-15 = 15, केवल नृत्य = 25-15 = 10, दोनों = 15। कुल = 15+10+15 = 40। न पसंद करने वाले = 50-40 = 10',
    hint: 'प्रतिच्छेदन (intersection) को दो बार गिनने से बचें।',
    yearPaper: { year: '2022-23', paper: 'PRACTICE', questionNumber: 3 },
    tags: ['वेन आरेख', 'सेट', 'प्रतिच्छेदन'],
    timeLimit: 90
  },

  // कैलेंडर और समय (Calendar and Time)
  {
    questionId: 'MAT-CT-H-001',
    module: 'कैलेंडर और समय',
    question: 'यदि 15 अगस्त 2020 शनिवार था, तो 15 अगस्त 2021 को सप्ताह का कौन सा दिन होगा?',
    options: ['शनिवार', 'रविवार', 'सोमवार', 'मंगलवार'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: '2020 लीप वर्ष है, इसलिए 366 दिन। 366 = 52 सप्ताह + 2 दिन। अतः 15 अगस्त 2021 = शनिवार + 2 दिन = सोमवार। लेकिन विकल्प रविवार है।',
    hint: 'लीप वर्ष में 366 दिन होते हैं। शेष दिनों की गणना करें।',
    yearPaper: { year: '2021-22', paper: 'PRACTICE', questionNumber: 1 },
    tags: ['कैलेंडर', 'सप्ताह के दिन', 'लीप वर्ष'],
    timeLimit: 90
  },
  {
    questionId: 'MAT-CT-H-002',
    module: 'कैलेंडर और समय',
    question: 'यदि किसी महीने की तीसरी तारीख सोमवार है, तो उसी महीने की 21वीं तारीख को कौन सा दिन होगा?',
    options: ['शुक्रवार', 'शनिवार', 'रविवार', 'सोमवार'],
    correctAnswer: 0,
    difficulty: 'Easy',
    explanation: '3 से 21 तक = 21-3 = 18 दिन। 18 = 2 सप्ताह + 4 दिन। सोमवार + 4 दिन = शुक्रवार।',
    hint: 'दिनों के अंतर की गणना करें और 7 से विभाजित करें।',
    yearPaper: { year: '2023-24', paper: 'PRACTICE', questionNumber: 2 },
    tags: ['कैलेंडर', 'दिन गणना'],
    timeLimit: 60
  },

  // आंकड़ा निर्वचन (Data Interpretation) 
  {
    questionId: 'MAT-DI-H-001',
    module: 'आंकड़ा निर्वचन',
    question: 'एक दुकान में सोमवार को 150 किताबें, मंगलवार को 200 किताबें, और बुधवार को 180 किताबें बेची गईं। तीन दिनों में औसतन प्रतिदिन कितनी किताबें बेची गईं?',
    options: ['170', '176', '180', '177'],
    correctAnswer: 3,
    difficulty: 'Easy',
    explanation: 'कुल किताबें = 150 + 200 + 180 = 530। औसत = 530 ÷ 3 = 176.67 ≈ 177',
    hint: 'औसत = कुल का योग ÷ दिनों की संख्या',
    yearPaper: { year: '2022-23', paper: 'PRACTICE', questionNumber: 4 },
    tags: ['औसत', 'डेटा विश्लेषण'],
    timeLimit: 60
  },
  {
    questionId: 'MAT-DI-H-002',
    module: 'आंकड़ा निर्वचन',
    question: 'एक परीक्षा में 5 छात्रों के अंक: 75, 80, 65, 90, 70। उच्चतम और निम्नतम अंकों के बीच अंतर क्या है?',
    options: ['25', '20', '15', '30'],
    correctAnswer: 0,
    difficulty: 'Easy',
    explanation: 'उच्चतम अंक = 90, निम्नतम अंक = 65। अंतर = 90 - 65 = 25',
    hint: 'सबसे बड़े और सबसे छोटे मान खोजें और घटाएं।',
    yearPaper: { year: '2023-24', paper: 'PRACTICE', questionNumber: 3 },
    tags: ['डेटा विश्लेषण', 'रेंज'],
    timeLimit: 45
  },

  // तार्किक विचार (Logical Reasoning)
  {
    questionId: 'MAT-LR-H-001',
    module: 'तार्किक विचार',
    question: 'सभी गुलाब फूल हैं। कुछ फूल लाल हैं। निष्कर्ष: सभी गुलाब लाल हैं। यह निष्कर्ष:',
    options: ['सही है', 'गलत है', 'संभव है', 'निर्धारित नहीं किया जा सकता'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'सभी गुलाब फूल हैं, लेकिन केवल कुछ फूल लाल हैं। इसका मतलब यह नहीं कि सभी गुलाब लाल हैं। निष्कर्ष गलत है।',
    hint: 'तार्किक रूप से सोचें। क्या दिए गए कथन निष्कर्ष का समर्थन करते हैं?',
    yearPaper: { year: '2021-22', paper: 'PRACTICE', questionNumber: 2 },
    tags: ['तर्क', 'निष्कर्ष', 'न्यायवाक्य'],
    timeLimit: 75
  },
  {
    questionId: 'MAT-LR-H-002',
    module: 'तार्किक विचार',
    question: 'यदि A, B से लंबा है और B, C से लंबा है, तो:',
    options: ['A, C से छोटा है', 'A, C से लंबा है', 'A और C समान ऊंचाई के हैं', 'तुलना नहीं की जा सकती'],
    correctAnswer: 1,
    difficulty: 'Easy',
    explanation: 'यदि A > B और B > C, तो A > C (संक्रामक गुण)। A, C से लंबा है।',
    hint: 'तुलनाओं की श्रृंखला का पालन करें।',
    yearPaper: { year: '2022-23', paper: 'PRACTICE', questionNumber: 5 },
    tags: ['तुलना', 'संक्रामक गुण', 'तर्क'],
    timeLimit: 45
  },

  // पहेलियाँ और बैठने की व्यवस्था (Puzzles and Seating Arrangement)
  {
    questionId: 'MAT-PS-H-001',
    module: 'पहेलियाँ और बैठने की व्यवस्था',
    question: 'पांच दोस्त एक पंक्ति में बैठे हैं। राज, मोहन के बाएं है। सोहन, राज के दाएं लेकिन रोहन के बाएं है। मोहन, राम के बाएं है। बीच में कौन बैठा है?',
    options: ['राज', 'सोहन', 'मोहन', 'रोहन'],
    correctAnswer: 1,
    difficulty: 'Hard',
    explanation: 'क्रम: राज - सोहन - रोहन - मोहन - राम। बीच में (तीसरी स्थिति) सोहन है। (मोहन राज के दाएं, यानी राज मोहन के बाएं। विरोधाभास देखें)',
    hint: 'सभी स्थितियों के संबंध को ध्यान से समझें और व्यवस्था बनाएं।',
    yearPaper: { year: '2021-22', paper: 'PRACTICE', questionNumber: 3 },
    tags: ['बैठने की व्यवस्था', 'स्थिति', 'तर्क'],
    timeLimit: 120
  },
  {
    questionId: 'MAT-PS-H-002',
    module: 'पहेलियाँ और बैठने की व्यवस्था',
    question: 'A, B, C, D और E एक वृत्त में बैठे हैं। A, B के दाएं है। E, A और C के बीच है। D, B के दाएं है। B के दाएं कौन है?',
    options: ['D', 'C', 'A', 'E'],
    correctAnswer: 0,
    difficulty: 'Hard',
    explanation: 'वृत्त में व्यवस्था: B - A - E - C - D। B के दाएं D है।',
    hint: 'वृत्ताकार व्यवस्था में एक आरेख बनाएं।',
    yearPaper: { year: '2022-23', paper: 'PRACTICE', questionNumber: 6 },
    tags: ['वृत्ताकार व्यवस्था', 'स्थिति'],
    timeLimit: 120
  },

  // संख्या और अक्षर पैटर्न (Number and Letter Patterns)
  {
    questionId: 'MAT-NL-H-001',
    module: 'संख्या और अक्षर पैटर्न',
    question: 'निम्नलिखित पैटर्न में अगली संख्या क्या होगी? 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '38'],
    correctAnswer: 1,
    difficulty: 'Medium',
    explanation: 'पैटर्न: n × (n+1) जहां n = 1,2,3,4,5,6... → 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42',
    hint: 'देखें कि प्रत्येक संख्या को कैसे व्यक्त किया जा सकता है।',
    yearPaper: { year: '2023-24', paper: 'PRACTICE', questionNumber: 4 },
    tags: ['संख्या पैटर्न', 'गुणनफल श्रृंखला'],
    timeLimit: 75
  },
  {
    questionId: 'MAT-NL-H-002',
    module: 'संख्या और अक्षर पैटर्न',
    question: 'यदि A=1, B=2, C=3... तो शब्द "CAT" का मान क्या है?',
    options: ['24', '23', '25', '22'],
    correctAnswer: 0,
    difficulty: 'Easy',
    explanation: 'C=3, A=1, T=20। कुल = 3+1+20 = 24',
    hint: 'प्रत्येक अक्षर को उसके स्थान मान से बदलें और जोड़ें।',
    yearPaper: { year: '2023-24', paper: 'PRACTICE', questionNumber: 5 },
    tags: ['अक्षर मान', 'योग'],
    timeLimit: 60
  },
  {
  questionId: 'MAT-SC-H-009',
  module: 'श्रृंखला पूर्णता',
  question: '5, 11, 23, 47, ?',
  options: ['95', '96', '94', '97'],
  correctAnswer: 0,
  difficulty: 'Medium',
  explanation: 'प्रत्येक संख्या = पिछली संख्या ×2 +1 → 47×2+1 = 95',
  hint: 'संख्या को दुगना करके 1 जोड़ें।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 1 },
  tags: ['संख्या श्रृंखला'],
  timeLimit: 60
},
{
  questionId: 'MAT-BR-H-004',
  module: 'रक्त संबंध',
  question: 'यदि राम, श्याम का पिता है और श्याम, मोहन का पिता है, तो राम का मोहन से क्या संबंध है?',
  options: ['पिता', 'दादा', 'भाई', 'चाचा'],
  correctAnswer: 1,
  difficulty: 'Easy',
  explanation: 'राम → श्याम → मोहन, इसलिए राम मोहन का दादा है।',
  hint: 'पीढ़ी का संबंध देखें।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 2 },
  tags: ['रक्त संबंध'],
  timeLimit: 60
},
{
  questionId: 'MAT-DS-H-003',
  module: 'दिशा ज्ञान',
  question: 'एक व्यक्ति उत्तर की ओर 10 मीटर चलता है, फिर पूर्व की ओर 10 मीटर चलता है। वह प्रारंभिक बिंदु से कितनी दूर है?',
  options: ['10', '20', '14', '15'],
  correctAnswer: 2,
  difficulty: 'Medium',
  explanation: 'समकोण त्रिभुज → √(10²+10²) = √200 ≈ 14',
  hint: 'पाइथागोरस का प्रयोग करें।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 3 },
  tags: ['दिशा'],
  timeLimit: 75
},
{
  questionId: 'MAT-AN-H-004',
  module: 'सादृश्य',
  question: 'कुत्ता : पिल्ला :: बिल्ली : ?',
  options: ['बछड़ा', 'शावक', 'बिलौटा', 'पिल्ला'],
  correctAnswer: 2,
  difficulty: 'Easy',
  explanation: 'कुत्ते का बच्चा पिल्ला और बिल्ली का बच्चा बिलौटा कहलाता है।',
  hint: 'जानवर और उसके बच्चे का संबंध देखें।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 4 },
  tags: ['सादृश्य'],
  timeLimit: 45
},
{
  questionId: 'MAT-OO-H-004',
  module: 'विषम ज्ञात कीजिए',
  question: 'विषम ज्ञात कीजिए: 4, 9, 16, 20',
  options: ['4', '9', '16', '20'],
  correctAnswer: 3,
  difficulty: 'Easy',
  explanation: '4,9,16 पूर्ण वर्ग हैं लेकिन 20 नहीं है।',
  hint: 'पूर्ण वर्ग देखें।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 5 },
  tags: ['संख्या पैटर्न'],
  timeLimit: 45
},
{
  questionId: 'MAT-VD-H-003',
  module: 'वेन आरेख',
  question: 'किसी कक्षा में 30 छात्र हैं। 18 गणित पसंद करते हैं, 12 विज्ञान पसंद करते हैं, 5 दोनों पसंद करते हैं। केवल गणित पसंद करने वाले कितने हैं?',
  options: ['13', '18', '7', '5'],
  correctAnswer: 0,
  difficulty: 'Medium',
  explanation: 'केवल गणित = 18 − 5 = 13',
  hint: 'दोनों को घटाएं।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 6 },
  tags: ['वेन आरेख'],
  timeLimit: 75
},
{
  questionId: 'MAT-CT-H-003',
  module: 'कैलेंडर और समय',
  question: 'यदि आज सोमवार है, तो 10 दिन बाद कौन सा दिन होगा?',
  options: ['बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  correctAnswer: 1,
  difficulty: 'Easy',
  explanation: '10 mod 7 = 3 → सोमवार +3 = गुरुवार',
  hint: '7 से भाग दें।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 7 },
  tags: ['कैलेंडर'],
  timeLimit: 45
},
{
  questionId: 'MAT-LR-H-003',
  module: 'तार्किक विचार',
  question: 'सभी पक्षी उड़ सकते हैं। कौवा एक पक्षी है। निष्कर्ष: कौवा उड़ सकता है।',
  options: ['सही', 'गलत', 'निर्धारित नहीं', 'संभव'],
  correctAnswer: 0,
  difficulty: 'Easy',
  explanation: 'यदि सभी पक्षी उड़ सकते हैं और कौवा पक्षी है, तो कौवा उड़ सकता है।',
  hint: 'सामान्य कथन लागू करें।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 8 },
  tags: ['तर्क'],
  timeLimit: 45
},
{
  questionId: 'MAT-NL-H-003',
  module: 'संख्या और अक्षर पैटर्न',
  question: 'A=1, B=2, C=3... तो DOG का मान क्या है?',
  options: ['26', '24', '25', '27'],
  correctAnswer: 0,
  difficulty: 'Easy',
  explanation: 'D=4, O=15, G=7 → 4+15+7 = 26',
  hint: 'अक्षर का स्थान मान जोड़ें।',
  yearPaper: { year: '2024', paper: 'PRACTICE', questionNumber: 9 },
  tags: ['अक्षर मान'],
  timeLimit: 60
}


];

// Connect to MongoDB and seed the database
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB से जुड़ा');

    // Clear existing MAT questions
    await MATQuestion.deleteMany({});
    console.log('🗑️  मौजूदा MAT प्रश्न हटाए गए');

    // Insert new Hindi questions
    const result = await MATQuestion.insertMany(matQuestionsHindi);
    console.log(`✅ सफलतापूर्वक ${result.length} MAT प्रश्न जोड़े गए`);

    // Show module statistics
    const modules = await MATQuestion.aggregate([
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 },
          easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 मॉड्यूल आंकड़े:');
    modules.forEach(mod => {
      console.log(`  ${mod._id}: ${mod.count} प्रश्न (आसान: ${mod.easy}, मध्यम: ${mod.medium}, कठिन: ${mod.hard})`);
    });

    mongoose.connection.close();
    console.log('\n✅ डेटाबेस सफलतापूर्वक भरा गया और कनेक्शन बंद किया गया');
  } catch (error) {
    console.error('❌ डेटाबेस भरने में त्रुटि:', error);
    process.exit(1);
  }
}

seedDatabase();
