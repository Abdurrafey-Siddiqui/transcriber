"use client";

import { useState } from "react";
import { Copy, Download, Check, RefreshCw } from "lucide-react";

interface TranscriptionResultProps {
  text: string;
  onReset: () => void;
}

export default function TranscriptionResult({
  text,
  onReset,
}: TranscriptionResultProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = text;
    const mimeType = "text/plain";
    const extension = "txt";

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Transcription Result
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            {downloaded ? (
              <Check className="h-4 w-4 mr-1 text-green-500" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            {downloaded ? "Downloaded" : "Download"}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
        {text}
      </div>

      <div className="text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Transcribe Another
        </button>
      </div>
    </div>
  );
}
