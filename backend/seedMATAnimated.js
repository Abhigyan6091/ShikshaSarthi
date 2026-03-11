const mongoose = require('mongoose');
require('dotenv').config();
const MATQuestion = require('./models/MATQuestion');

const animatedQuestions = [
  {
    questionId: "MAT_ANIM_001",
    module: "श्रृंखला पूर्णता",
    subModule: "संख्या श्रृंखला",
    question: "निम्नलिखित श्रृंखला में अगली संख्या क्या होगी?\n2, 5, 10, 17, 26, ?",
    options: ["35", "37", "38", "40"],
    correctAnswer: 1,
    explanation: "यह एक वर्ग संख्या + 1 की श्रृंखला है: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26, 6²+1=37",
    hint: "प्रत्येक संख्या को पिछली संख्या से घटाकर देखें और पैटर्न खोजें।",
    difficulty: "Medium",
    points: 2,
    timeLimit: 90,
    tags: ["number-series", "pattern", "squares"],
    animation: {
      enabled: true,
      autoPlaySpeed: 2500,
      frames: [
        {
          html: `
            <div class="animation-container">
              <h3 class="text-center mb-4 text-lg font-bold">श्रृंखला विश्लेषण</h3>
              <div class="series-display">
                <div class="number-box">2</div>
                <div class="arrow">→</div>
                <div class="number-box">5</div>
                <div class="arrow">→</div>
                <div class="number-box">10</div>
                <div class="arrow">→</div>
                <div class="number-box">17</div>
                <div class="arrow">→</div>
                <div class="number-box">26</div>
                <div class="arrow">→</div>
                <div class="number-box question-mark">?</div>
              </div>
              <div class="explanation-text mt-4">
                <p>श्रृंखला को समझने के लिए अंतर देखें</p>
              </div>
            </div>
          `,
          css: `
            .animation-container {
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              color: white;
            }
            .series-display {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-wrap: wrap;
              gap: 10px;
              margin: 20px 0;
            }
            .number-box {
              width: 60px;
              height: 60px;
              background: white;
              color: #667eea;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .question-mark {
              background: #ffd700;
              color: #333;
            }
            .arrow {
              font-size: 24px;
              color: white;
            }
            .explanation-text {
              text-align: center;
              font-size: 16px;
              padding: 10px;
              background: rgba(255,255,255,0.1);
              border-radius: 8px;
            }
          `,
          javascript: "",
          description: "श्रृंखला प्रस्तुत करना"
        },
        {
          html: `
            <div class="animation-container">
              <h3 class="text-center mb-4 text-lg font-bold">चरण 1: अंतर खोजें</h3>
              <div class="series-display">
                <div class="number-box">2</div>
                <div class="arrow">→</div>
                <div class="number-box">5</div>
                <div class="difference highlight">+3</div>
                <div class="arrow">→</div>
                <div class="number-box">10</div>
                <div class="arrow">→</div>
                <div class="number-box">17</div>
                <div class="arrow">→</div>
                <div class="number-box">26</div>
                <div class="arrow">→</div>
                <div class="number-box question-mark">?</div>
              </div>
              <div class="explanation-text mt-4">
                <p>2 से 5 तक का अंतर = 3</p>
              </div>
            </div>
          `,
          css: `
            .animation-container {
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              color: white;
            }
            .series-display {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-wrap: wrap;
              gap: 10px;
              margin: 20px 0;
            }
            .number-box {
              width: 60px;
              height: 60px;
              background: white;
              color: #667eea;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .difference {
              padding: 8px 12px;
              background: #ff6b6b;
              color: white;
              border-radius: 6px;
              font-size: 18px;
              font-weight: bold;
            }
            .highlight {
              animation: pulse 1s infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            .question-mark {
              background: #ffd700;
              color: #333;
            }
            .arrow {
              font-size: 24px;
              color: white;
            }
            .explanation-text {
              text-align: center;
              font-size: 16px;
              padding: 10px;
              background: rgba(255,255,255,0.1);
              border-radius: 8px;
            }
          `,
          javascript: "",
          description: "पहला अंतर खोजना"
        },
        {
          html: `
            <div class="animation-container">
              <h3 class="text-center mb-4 text-lg font-bold">चरण 2: सभी अंतर खोजें</h3>
              <div class="series-display">
                <div class="number-box">2</div>
                <div class="difference">+3</div>
                <div class="number-box">5</div>
                <div class="difference highlight">+5</div>
                <div class="number-box">10</div>
                <div class="difference">+7</div>
                <div class="number-box">17</div>
                <div class="difference">+9</div>
                <div class="number-box">26</div>
                <div class="difference">+?</div>
                <div class="number-box question-mark">?</div>
              </div>
              <div class="explanation-text mt-4">
                <p>अंतर की श्रृंखला: 3, 5, 7, 9, ...</p>
                <p>यह विषम संख्याओं की श्रृंखला है!</p>
              </div>
            </div>
          `,
          css: `
            .animation-container {
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              color: white;
            }
            .series-display {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;
              margin: 20px 0;
            }
            .number-box {
              width: 60px;
              height: 60px;
              background: white;
              color: #667eea;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .difference {
              padding: 8px 12px;
              background: #ff6b6b;
              color: white;
              border-radius: 6px;
              font-size: 16px;
              font-weight: bold;
            }
            .highlight {
              animation: pulse 1s infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            .question-mark {
              background: #ffd700;
              color: #333;
            }
            .explanation-text {
              text-align: center;
              font-size: 14px;
              padding: 10px;
              background: rgba(255,255,255,0.1);
              border-radius: 8px;
            }
          `,
          javascript: "",
          description: "अंतरों का पैटर्न खोजना"
        },
        {
          html: `
            <div class="animation-container">
              <h3 class="text-center mb-4 text-lg font-bold">चरण 3: उत्तर खोजें</h3>
              <div class="series-display">
                <div class="number-box">2</div>
                <div class="difference">+3</div>
                <div class="number-box">5</div>
                <div class="difference">+5</div>
                <div class="number-box">10</div>
                <div class="difference">+7</div>
                <div class="number-box">17</div>
                <div class="difference">+9</div>
                <div class="number-box">26</div>
                <div class="difference highlight">+11</div>
                <div class="number-box answer-box">37</div>
              </div>
              <div class="calculation">
                <p class="calc-text">26 + 11 = <span class="result">37</span></p>
              </div>
              <div class="explanation-text mt-4">
                <p><strong>उत्तर: 37</strong></p>
                <p>पैटर्न: विषम संख्याओं का अंतर (3, 5, 7, 9, 11)</p>
              </div>
            </div>
          `,
          css: `
            .animation-container {
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              color: white;
            }
            .series-display {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;
              margin: 20px 0;
            }
            .number-box {
              width: 60px;
              height: 60px;
              background: white;
              color: #667eea;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .answer-box {
              background: #4caf50;
              color: white;
              animation: celebration 0.5s ease-in-out;
            }
            @keyframes celebration {
              0%, 100% { transform: scale(1); }
              25% { transform: scale(1.2) rotate(-5deg); }
              75% { transform: scale(1.2) rotate(5deg); }
            }
            .difference {
              padding: 8px 12px;
              background: #ff6b6b;
              color: white;
              border-radius: 6px;
              font-size: 16px;
              font-weight: bold;
            }
            .highlight {
              background: #4caf50;
              animation: pulse 1s infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            .calculation {
              text-align: center;
              margin: 20px 0;
            }
            .calc-text {
              font-size: 28px;
              font-weight: bold;
            }
            .result {
              color: #4caf50;
              font-size: 32px;
            }
            .explanation-text {
              text-align: center;
              font-size: 14px;
              padding: 10px;
              background: rgba(255,255,255,0.1);
              border-radius: 8px;
            }
          `,
          javascript: "",
          description: "अंतिम उत्तर"
        }
      ]
    },
    isActive: true
  },
  {
    questionId: "MAT_ANIM_002",
    module: "दिशा ज्ञान",
    subModule: "दिशा परिवर्तन",
    question: "राम अपने घर से उत्तर की ओर 5 किमी चलता है, फिर दाएं मुड़कर 3 किमी चलता है, फिर दाएं मुड़कर 5 किमी चलता है। अब वह अपने घर से कितनी दूर है और किस दिशा में है?",
    options: ["3 किमी पूर्व", "3 किमी पश्चिम", "5 किमी उत्तर", "8 किमी दक्षिण"],
    correctAnswer: 0,
    explanation: "राम उत्तर जाकर, फिर पूर्व (दाएं), फिर दक्षिण (दाएं) जाता है। उत्तर और दक्षिण की दूरी समान होने से वह सिर्फ 3 किमी पूर्व में है।",
    hint: "प्रत्येक चरण को एक आरेख पर चिह्नित करें और अंतिम स्थिति देखें।",
    difficulty: "Easy",
    points: 2,
    timeLimit: 90,
    tags: ["direction", "distance", "navigation"],
    animation: {
      enabled: true,
      autoPlaySpeed: 2500,
      frames: [
        {
          html: `
            <div class="animation-container">
              <h3 class="text-center mb-4 text-lg font-bold">प्रारंभिक स्थिति</h3>
              <div class="compass">
                <div class="direction north">उत्तर ↑</div>
                <div class="direction-row">
                  <div class="direction west">← पश्चिम</div>
                  <div class="center-area">
                    <div class="grid">
                      <div class="home-icon">🏠</div>
                      <div class="person">👤</div>
                    </div>
                  </div>
                  <div class="direction east">पूर्व →</div>
                </div>
                <div class="direction south">दक्षिण ↓</div>
              </div>
              <div class="explanation-text mt-4">
                <p>राम अपने घर से यात्रा शुरू करता है</p>
              </div>
            </div>
          `,
          css: `
            .animation-container {
              padding: 20px;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              border-radius: 12px;
              color: white;
            }
            .compass {
              margin: 20px auto;
              max-width: 400px;
            }
            .direction {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              padding: 10px;
            }
            .direction-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .center-area {
              background: white;
              border-radius: 8px;
              padding: 20px;
              min-width: 200px;
              min-height: 200px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .grid {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .home-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .person {
              font-size: 36px;
            }
            .explanation-text {
              text-align: center;
              font-size: 16px;
              padding: 10px;
              background: rgba(255,255,255,0.2);
              border-radius: 8px;
              margin-top: 20px;
            }
          `,
          javascript: "",
          description: "प्रारंभिक स्थिति"
        },
        {
          html: `
            <div class="animation-container">
              <h3 class="text-center mb-4 text-lg font-bold">चरण 1: उत्तर की ओर 5 किमी</h3>
              <div class="compass">
                <div class="direction north">उत्तर ↑</div>
                <div class="direction-row">
                  <div class="direction west">← पश्चिम</div>
                  <div class="center-area">
                    <svg viewBox="0 0 200 300" class="path-svg">
                      <line x1="100" y1="250" x2="100" y2="50" stroke="#4caf50" stroke-width="3" stroke-dasharray="5,5"/>
                      <circle cx="100" cy="250" r="8" fill="#ff6b6b"/>
                      <text x="100" y="270" text-anchor="middle" fill="#333" font-size="14">🏠</text>
                      <circle cx="100" cy="50" r="10" fill="#4caf50" class="pulse"/>
                      <text x="100" y="35" text-anchor="middle" fill="#333" font-size="16">👤</text>
                      <text x="120" y="150" fill="#333" font-size="14" font-weight="bold">5 किमी</text>
                      <polygon points="100,60 95,70 105,70" fill="#4caf50"/>
                    </svg>
                  </div>
                  <div class="direction east">पूर्व →</div>
                </div>
                <div class="direction south">दक्षिण ↓</div>
              </div>
              <div class="explanation-text mt-4">
                <p><strong>चरण 1:</strong> उत्तर की ओर 5 किमी चला</p>
              </div>
            </div>
          `,
          css: `
            .animation-container {
              padding: 20px;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              border-radius: 12px;
              color: white;
            }
            .compass {
              margin: 20px auto;
              max-width: 400px;
            }
            .direction {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              padding: 10px;
            }
            .direction-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .center-area {
              background: white;
              border-radius: 8px;
              padding: 20px;
              min-width: 200px;
              min-height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .path-svg {
              width: 100%;
              height: 100%;
            }
            .pulse {
              animation: pulse 1s infinite;
            }
            @keyframes pulse {
              0%, 100% { r: 10; opacity: 1; }
              50% { r: 15; opacity: 0.5; }
            }
            .explanation-text {
              text-align: center;
              font-size: 16px;
              padding: 10px;
              background: rgba(255,255,255,0.2);
              border-radius: 8px;
              margin-top: 20px;
            }
          `,
          javascript: "",
          description: "पहला चरण - उत्तर"
        },
        {
          html: `
            <div class="animation-container">
              <h3 class="text-center mb-4 text-lg font-bold">चरण 2: दाएं मुड़कर 3 किमी</h3>
              <div class="compass">
                <div class="direction north">उत्तर ↑</div>
                <div class="direction-row">
                  <div class="direction west">← पश्चिम</div>
                  <div class="center-area">
                    <svg viewBox="0 0 300 300" class="path-svg">
                      <circle cx="100" cy="250" r="8" fill="#ff6b6b"/>
                      <text x="100" y="270" text-anchor="middle" fill="#333" font-size="14">🏠</text>
                      <line x1="100" y1="250" x2="100" y2="50" stroke="#4caf50" stroke-width="3" stroke-dasharray="5,5"/>
                      <text x="80" y="150" fill="#333" font-size="12">5km</text>
                      <path d="M 100 50 Q 120 50 120 70" stroke="#ffa726" stroke-width="3" fill="none"/>
                      <text x="110" y="45" font-size="20">↻</text>
                      <line x1="100" y1="50" x2="250" y2="50" stroke="#2196f3" stroke-width="3" stroke-dasharray="5,5"/>
                      <text x="170" y="40" fill="#333" font-size="12">3km</text>
                      <circle cx="250" cy="50" r="10" fill="#2196f3" class="pulse"/>
                      <text x="250" y="30" text-anchor="middle" fill="#333" font-size="16">👤</text>
                    </svg>
                  </div>
                  <div class="direction east">पूर्व →</div>
                </div>
                <div class="direction south">दक्षिण ↓</div>
              </div>
              <div class="explanation-text mt-4">
                <p><strong>चरण 2:</strong> दाएं मुड़कर (पूर्व) 3 किमी चला</p>
              </div>
            </div>
          `,
          css: `
            .animation-container {
              padding: 20px;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              border-radius: 12px;
              color: white;
            }
            .compass {
              margin: 20px auto;
              max-width: 400px;
            }
            .direction {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              padding: 10px;
            }
            .direction-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .center-area {
              background: white;
              border-radius: 8px;
              padding: 20px;
              min-width: 300px;
              min-height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .path-svg {
              width: 100%;
              height: 100%;
            }
            .pulse {
              animation: pulse 1s infinite;
            }
            @keyframes pulse {
              0%, 100% { r: 10; opacity: 1; }
              50% { r: 15; opacity: 0.5; }
            }
            .explanation-text {
              text-align: center;
              font-size: 16px;
              padding: 10px;
              background: rgba(255,255,255,0.2);
              border-radius: 8px;
              margin-top: 20px;
            }
          `,
          javascript: "",
          description: "दूसरा चरण - पूर्व"
        },
        {
          html: `
            <div class="animation-container">
              <h3 class="text-center mb-4 text-lg font-bold">चरण 3: फिर दाएं मुड़कर 5 किमी</h3>
              <div class="compass">
                <div class="direction north">उत्तर ↑</div>
                <div class="direction-row">
                  <div class="direction west">← पश्चिम</div>
                  <div class="center-area">
                    <svg viewBox="0 0 300 300" class="path-svg">
                      <circle cx="100" cy="50" r="8" fill="#ff6b6b"/>
                      <text x="100" y="35" text-anchor="middle" fill="#333" font-size="14">🏠</text>
                      <line x1="100" y1="50" x2="100" y2="150" stroke="#4caf50" stroke-width="3" stroke-dasharray="5,5"/>
                      <text x="80" y="100" fill="#333" font-size="12">5km</text>
                      <line x1="100" y1="150" x2="250" y2="150" stroke="#2196f3" stroke-width="3" stroke-dasharray="5,5"/>
                      <text x="170" y="140" fill="#333" font-size="12">3km</text>
                      <path d="M 250 150 Q 250 170 230 170" stroke="#ffa726" stroke-width="3" fill="none"/>
                      <text x="255" y="160" font-size="20">↻</text>
                      <line x1="250" y1="150" x2="250" y2="50" stroke="#9c27b0" stroke-width="3" stroke-dasharray="5,5"/>
                      <text x="260" y="100" fill="#333" font-size="12">5km</text>
                      <circle cx="250" cy="50" r="10" fill="#9c27b0" class="pulse"/>
                      <text x="250" y="30" text-anchor="middle" fill="#333" font-size="16">👤</text>
                      <line x1="100" y1="50" x2="250" y2="50" stroke="#ff9800" stroke-width="2" stroke-dasharray="3,3"/>
                      <text x="175" y="45" fill="#ff9800" font-size="14" font-weight="bold">3 किमी</text>
                    </svg>
                  </div>
                  <div class="direction east">पूर्व →</div>
                </div>
                <div class="direction south">दक्षिण ↓</div>
              </div>
              <div class="explanation-text mt-4">
                <p><strong>उत्तर: 3 किमी पूर्व</strong></p>
                <p>उत्तर और दक्षिण की दूरी समान होने से वे रद्द हो जाती हैं।</p>
              </div>
            </div>
          `,
          css: `
            .animation-container {
              padding: 20px;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              border-radius: 12px;
              color: white;
            }
            .compass {
              margin: 20px auto;
              max-width: 400px;
            }
            .direction {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              padding: 10px;
            }
            .direction-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .center-area {
              background: white;
              border-radius: 8px;
              padding: 20px;
              min-width: 300px;
              min-height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .path-svg {
              width: 100%;
              height: 100%;
            }
            .pulse {
              animation: pulse 1s infinite;
            }
            @keyframes pulse {
              0%, 100% { r: 10; opacity: 1; }
              50% { r: 15; opacity: 0.5; }
            }
            .explanation-text {
              text-align: center;
              font-size: 16px;
              padding: 10px;
              background: rgba(255,255,255,0.2);
              border-radius: 8px;
              margin-top: 20px;
            }
          `,
          javascript: "",
          description: "अंतिम स्थिति और उत्तर"
        }
      ]
    },
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📝 Inserting animated MAT questions...');
    const result = await MATQuestion.insertMany(animatedQuestions);
    console.log(`✅ Successfully inserted ${result.length} animated questions\n`);

    console.log('📊 Summary:');
    animatedQuestions.forEach((q, index) => {
      console.log(`   ${index + 1}. ${q.questionId} - ${q.module} (${q.animation.frames.length} frames)`);
    });

    console.log('\n✨ Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║     Animated MAT Questions Seeding Script              ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

seedDatabase();
