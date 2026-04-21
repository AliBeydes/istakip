'use client';

import { useState, useEffect } from 'react';

export default function DebugInfo() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    setInfo({
      apiUrl: 'http://localhost:3020/api',
      envApiUrl: process.env.NEXT_PUBLIC_API_URL,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      cookies: document.cookie
    });
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-xs">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(info, null, 2)}
      </pre>
    </div>
  );
}
