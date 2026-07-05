import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface DatabaseInteractiveDemoProps {
  html: string;
  css: string;
  javascript: string;
}

// Interactive demos ship arbitrary HTML/CSS/JS as question content, which syncs
// between schools via AWS. Executing that in the main window would let malicious
// synced content read the logged-in user's auth token / act as them (stored XSS).
// We instead render it inside a sandboxed iframe with `allow-scripts` but WITHOUT
// `allow-same-origin`, so the demo runs in an opaque null origin: its scripts
// work, but it cannot reach the parent's DOM, localStorage, cookies, or backend
// session. This keeps the feature intact while containing any injected code.
const DatabaseInteractiveDemo: React.FC<DatabaseInteractiveDemoProps> = ({
  html,
  css,
  javascript
}) => {
  const srcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body { margin: 0; padding: 8px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  ${css || ''}
</style>
</head>
<body>
${html || ''}
<script>
try {
${javascript || ''}
} catch (e) {
  document.body.insertAdjacentHTML('beforeend', '<pre style="color:#b91c1c">Demo error: ' + (e && e.message) + '</pre>');
}
</script>
</body>
</html>`;
  }, [html, css, javascript]);

  if (!html && !javascript) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden mb-6">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-700">इंटरैक्टिव डेमो</span>
        </div>
        <iframe
          title="Interactive demo"
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          className="demo-content w-full rounded-md bg-white"
          style={{ minHeight: 360, border: '1px solid #e5e7eb' }}
        />
      </div>
    </Card>
  );
};

export default DatabaseInteractiveDemo;
