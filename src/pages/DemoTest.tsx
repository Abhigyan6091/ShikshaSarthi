import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatabaseInteractiveDemo from '@/components/DatabaseInteractiveDemo';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const API_URL = import.meta.env.VITE_API_URL;

const DemoTest: React.FC = () => {
  const [demo, setDemo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemo();
  }, []);

  const loadDemo = async () => {
    try {
      const response = await axios.get(`${API_URL}/mat/questions/MAT-SC-H-001`);
      setDemo(response.data.interactiveContent);
      setLoading(false);
      console.log('Demo loaded:', response.data);
    } catch (error) {
      console.error('Error loading demo:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading demo...</div>;
  }

  if (!demo || !demo.html) {
    return <div className="p-8">No demo data found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Demo Test Page</h1>
        
        <div className="bg-white p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Demo Data Info:</h2>
          <ul className="space-y-2">
            <li>✅ HTML Length: {demo.html?.length || 0} chars</li>
            <li>✅ CSS Length: {demo.css?.length || 0} chars</li>
            <li>✅ JavaScript Length: {demo.javascript?.length || 0} chars</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Console Instructions:</h2>
          <p className="text-gray-700">
            Open browser console (F12) and check for:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>🎨 Loading interactive demo...</li>
            <li>✅ CSS injected</li>
            <li>✅ JavaScript injected and executed</li>
            <li>✅ Demo functions loaded successfully</li>
          </ul>
        </div>

        <DatabaseInteractiveDemo
          html={demo.html}
          css={demo.css}
          javascript={demo.javascript}
        />

        <div className="mt-6 space-x-4">
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button 
            onClick={() => {
              // @ts-ignore
              if (typeof window.startDemo === 'function') {
                // @ts-ignore
                window.startDemo('sc-001');
                console.log('✅ Manually called startDemo()');
              } else {
                console.error('❌ startDemo not found in window');
                console.log('Available:', Object.keys(window).filter(k => k.toLowerCase().includes('demo')));
              }
            }}
            variant="outline"
          >
            Test startDemo() Manually
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemoTest;
