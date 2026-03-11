# 🎬 MAT Animation System - Testing Guide

## Current Status
✅ Backend running on port 5000
✅ Frontend running on port 8081  
✅ 2 animated questions in database
✅ Debug logging added to component

## Testing Steps

### 1. Open Browser Console
1. Open your browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Go to the "Console" tab

### 2. Navigate to Animated Demo Page
Open this URL: **http://localhost:8081/student/mat-animated-demo**

### 3. Check Console Logs
You should see logs like:
```
========= MATQuestionViewer DEBUG =========
Question ID: MAT_ANIM_001
Question object keys: [...]
Has animation key: true
Animation value: {enabled: true, frames: Array(4), ...}
Animation enabled: true
Frames array: Array(4)
Frames length: 4
hasAnimation result: true
==========================================
```

### 4. What You Should See

#### Page Header:
- "प्रश्न 1 / 2" (Question 1 / 2)
- Back button (वापस जाएं)

#### Question Card (White):
- Module badges: "श्रृंखला पूर्णता" and "संख्या श्रृंखला"
- Difficulty badge: "Medium"
- Question ID: "MAT_ANIM_001"
- Question text in Hindi
- Hint button: "संकेत देखें"

#### **ANIMATION CARD (Purple themed):**
This is the KEY section that should be visible!
- Purple border (2px)
- Purple header with "📊 एनिमेशन व्याख्या"
- Frame counter: "फ्रेम 1 / 4"
- **LARGE ANIMATION AREA** (400px min height)
  - Gradient background (blue to purple)
  - Animated content showing number series
  - Numbers in boxes: 2 → 5 → 10 → 17 → 26 → ?
- Frame description (blue box)
- Control buttons:
  - 🔄 Reset
  - ← Previous  
  - ▶ चलाएं (Play) / ⏸ रोकें (Pause)
  - → Next
- Progress bar at bottom

#### Options Card:
- Multiple choice options (A, B, C, D)
- Four options: "35", "37", "38", "40"

### 5. Test Animation Controls

**Previous/Next:**
1. Click "Next →" button
2. Animation should change to Frame 2
3. Frame counter should update: "फ्रेम 2 / 4"
4. Description should change
5. Continue clicking Next through all 4 frames

**Auto-Play:**
1. Click "▶ चलाएं" (Play)
2. Frames should auto-advance every 2.5 seconds
3. Button changes to "⏸ रोकें" (Pause)
4. Click Pause to stop
5. Button changes back to "▶ चलाएं"

**Reset:**
1. Navigate to Frame 3 or 4
2. Click "🔄 Reset" button
3. Should jump back to Frame 1

### 6. Test Second Question

1. Select any answer option
2. Click "अगला प्रश्न" (Next Question)
3. Should show Question 2: "दिशा ज्ञान"
4. Should also have animation with 4 frames
5. This question shows direction/movement with SVG paths

## Troubleshooting

### If Animation Card is NOT Visible:

1. **Check Console Logs:**
   - Look for the debug output
   - Check if `hasAnimation result:` is `true` or `false`
   - If `false`, check why (enabled? frames length?)

2. **Check Network Tab:**
   - Open Network tab in DevTools
   - Look for: `/api/mat/questions?animated=true`
   - Click on it and check "Preview" or "Response"
   - Verify `animation.enabled` is `true`
   - Verify `animation.frames` has 4 items

3. **Check API Directly:**
   Run in terminal:
   ```bash
   curl -s "http://localhost:5000/api/mat/questions?animated=true" | python3 -c "import sys, json; data = json.load(sys.stdin); q = data[0]; print('Enabled:', q['animation']['enabled']); print('Frames:', len(q['animation']['frames']))"
   ```
   Should output:
   ```
   Enabled: True
   Frames: 4
   ```

4. **Check React Component:**
   - If console shows `hasAnimation result: false`
   - But API returns animation data
   - Then there's a type mismatch or data transformation issue

### If Animation is Visible but Content is Empty:

1. Check if frames have HTML content:
   ```bash
   curl -s "http://localhost:5000/api/mat/questions?animated=true" | python3 -c "import sys, json; data = json.load(sys.stdin); print('HTML length:', len(data[0]['animation']['frames'][0]['html']))"
   ```

2. Check browser console for rendering errors

3. Check if CSS is being applied (inspect element)

### Common Issues:

| Issue | Solution |
|-------|----------|
| 404 Error on API call | Backend not running on port 5000 |
| Empty question list | Database not seeded |
| Animation card missing | `hasAnimation` evaluating to false |
| Empty animation area | Frame HTML not rendering |
| No CSS styling | CSS not being injected |

## Expected Console Output

```javascript
========= MATQuestionViewer DEBUG =========
Question ID: MAT_ANIM_001
Question object keys: Array(15) ["questionId", "module", "subModule", "question", "options", "correctAnswer", "explanation", "hint", "difficulty", "points", "timeLimit", "tags", "isActive", "animation", "_id"]
Has animation key: true
Animation value: {
  enabled: true,
  frames: Array(4) [
    {html: "...", css: "...", javascript: "", description: "...", _id: "..."},
    ...
  ],
  autoPlaySpeed: 2500
}
Animation enabled: true
Frames array: Array(4)
Frames length: 4
hasAnimation result: true
==========================================
```

## Success Criteria

✅ Page loads without errors
✅ Console shows `hasAnimation result: true`
✅ Purple animation card is visible
✅ Animation area shows colored number boxes
✅ Frame counter shows "फ्रेम 1 / 4"
✅ Previous/Next buttons work
✅ Play button starts auto-play
✅ Pause button stops auto-play
✅ Reset button returns to Frame 1
✅ Progress bar updates correctly
✅ Frame descriptions change with each frame
✅ All 4 frames render correctly
✅ Second question also has working animation

## URLs for Testing

| What | URL |
|------|-----|
| Animated Demo (React) | http://localhost:8081/student/mat-animated-demo |
| Test Page (Vanilla JS) | http://localhost:9000/test-animation-frontend.html |
| API Endpoint | http://localhost:5000/api/mat/questions?animated=true |
| MAT Modules | http://localhost:8081/student/mat |

## Quick Verification Commands

```bash
# Check backend
curl -s http://localhost:5000/api/mat/questions?animated=true | python3 -c "import sys, json; print(f\"Questions: {len(json.load(sys.stdin))}\")"

# Check animation data
curl -s "http://localhost:5000/api/mat/questions?animated=true" | python3 -c "import sys, json; q = json.load(sys.stdin)[0]; print(f\"Question: {q['questionId']}\"); print(f\"Enabled: {q['animation']['enabled']}\"); print(f\"Frames: {len(q['animation']['frames'])}\")"

# Rebuild frontend
cd /home/yogesh/Desktop/Github/ShikshaSarthi && npm run build

# Check if servers are running
lsof -i:5000  # Backend
lsof -i:8081  # Frontend
```

---

**Please follow these steps and report:**
1. What do you see in the browser console?
2. Is the purple animation card visible?
3. Can you see the animated content?
4. Do the controls work?
5. Take a screenshot if the animation is still not visible
