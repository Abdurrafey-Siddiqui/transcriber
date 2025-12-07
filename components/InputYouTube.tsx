"use client";

import { useState } from "react";
import { Youtube, ArrowRight } from "lucide-react";

interface InputYouTubeProps {
  onStart: () => void;
  onComplete: (text: string) => void;
  onError: (msg: string) => void;
}

export default function InputYouTube({
  onStart,
  onComplete,
  onError,
}: InputYouTubeProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    onStart();

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtubeUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Transcription failed");
      }

      const data = await response.json();
      onComplete(data.text);
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Youtube className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="url"
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 text-black focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-4 flex items-center bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500 text-center">
        Supports public videos only. Audio will be extracted and processed.
      </p>
    </form>
  );
}
