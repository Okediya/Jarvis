'use client';

import React, { useMemo } from 'react';

interface SoftwareEngineProps {
  code: string;
}

export default function SoftwareEngine({ code }: SoftwareEngineProps) {
  const srcDoc = useMemo(() => {
    // If the code already has an HTML structure, use it as is
    if (code.trim().startsWith('<!') || code.trim().startsWith('<html')) {
      return code;
    }

    // Wrap in a basic HTML document with Tailwind CDN
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
  ${code}
</body>
</html>`;
  }, [code]);

  return (
    <div className="w-full h-full relative">
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0 rounded-lg"
        title="Software Prototype Preview"
      />

      {/* Overlay label */}
      <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
        <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">
          Software Prototype
        </span>
      </div>
    </div>
  );
}
