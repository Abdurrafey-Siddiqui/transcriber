"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { Upload, Youtube, Mic } from "lucide-react";
import clsx from "clsx";
import InputFile from "@/components/InputFile";
import InputYouTube from "@/components/InputYouTube";
import InputRecord from "@/components/InputRecord";
import TranscriptionResult from "@/components/TranscriptionResult";

type Tab = "upload" | "youtube" | "record";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [processing, setProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptionComplete = (text: string) => {
    setProcessing(false);
    setTranscription(text);
  };

  const handleError = (msg: string) => {
    setProcessing(false);
    setError(msg);
  };

  const handleStartProcessing = () => {
    setProcessing(true);
    setError(null);
    setTranscription(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Turn your audio into accurate text
            </h1>
            <p className="text-lg text-gray-600">
              Upload a file, paste a link, or record directly.
            </p>
          </div>

          {/* Input Selection Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("upload")}
                disabled={processing}
                className={clsx(
                  "flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  activeTab === "upload"
                    ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                  processing && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab("youtube")}
                disabled={processing}
                className={clsx(
                  "flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  activeTab === "youtube"
                    ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                  processing && "opacity-50 cursor-not-allowed"
                )}
              >
                <Youtube className="w-4 h-4" />
                YouTube Link
              </button>
              <button
                onClick={() => setActiveTab("record")}
                disabled={processing}
                className={clsx(
                  "flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  activeTab === "record"
                    ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                  processing && "opacity-50 cursor-not-allowed"
                )}
              >
                <Mic className="w-4 h-4" />
                Record Audio
              </button>
            </div>

            <div className="p-8">
              {processing ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Analyzing Audio...
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Gemini is generating your transcript.
                  </p>
                </div>
              ) : transcription ? (
                <TranscriptionResult
                  text={transcription}
                  onReset={() => setTranscription(null)}
                />
              ) : (
                <>
                  {activeTab === "upload" && (
                    <InputFile
                      onStart={handleStartProcessing}
                      onComplete={handleTranscriptionComplete}
                      onError={handleError}
                    />
                  )}
                  {activeTab === "youtube" && (
                    <InputYouTube
                      onStart={handleStartProcessing}
                      onComplete={handleTranscriptionComplete}
                      onError={handleError}
                    />
                  )}
                  {activeTab === "record" && (
                    <InputRecord
                      onStart={handleStartProcessing}
                      onComplete={handleTranscriptionComplete}
                      onError={handleError}
                    />
                  )}
                </>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
