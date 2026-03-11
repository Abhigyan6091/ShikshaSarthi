#!/bin/bash

echo "=== MAT Animation System Verification ==="
echo ""

# Check if backend is running
echo "1. Checking Backend..."
if curl -s http://localhost:5000/api/mat/questions?animated=true > /dev/null; then
    echo "   ✅ Backend is running on port 5000"
else
    echo "   ❌ Backend is NOT running"
    exit 1
fi

# Check if questions exist
QUESTION_COUNT=$(curl -s http://localhost:5000/api/mat/questions?animated=true | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "   📊 Found $QUESTION_COUNT animated questions"

# Check if frontend is running
echo ""
echo "2. Checking Frontend..."
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 8081"
else
    echo "   ❌ Frontend is NOT running"
fi

# Check animation data structure
echo ""
echo "3. Checking Animation Data..."
curl -s http://localhost:5000/api/mat/questions?animated=true | python3 << 'EOF'
import json, sys
try:
    data = json.load(sys.stdin)
    for q in data:
        qid = q.get('questionId', 'Unknown')
        module = q.get('module', 'Unknown')
        has_anim = 'animation' in q
        anim_enabled = q.get('animation', {}).get('enabled', False) if has_anim else False
        frame_count = len(q.get('animation', {}).get('frames', [])) if has_anim else 0
        
        status = "✅" if (has_anim and anim_enabled and frame_count > 0) else "❌"
        print(f"   {status} {qid} ({module})")
        print(f"      - Animation object exists: {has_anim}")
        print(f"      - Animation enabled: {anim_enabled}")
        print(f"      - Frames: {frame_count}")
        
        if frame_count > 0:
            frame1 = q['animation']['frames'][0]
            html_len = len(frame1.get('html', ''))
            css_len = len(frame1.get('css', ''))
            print(f"      - Frame 1: HTML ({html_len} chars), CSS ({css_len} chars)")
except Exception as e:
    print(f"   ❌ Error: {e}")
EOF

echo ""
echo "4. Testing React App..."
echo "   🌐 Open: http://localhost:8081/student/mat-animated-demo"
echo "   🧪 Test page: http://localhost:9000/test-animation-frontend.html"

echo ""
echo "=== Verification Complete ==="
