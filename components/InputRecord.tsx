"use client";

import { useState, useRef } from "react";
import { Mic, Square, Play, Trash2, Upload } from "lucide-react";

interface InputRecordProps {
  onStart: () => void;
  onComplete: (text: string) => void;
  onError: (msg: string) => void;
}

export default function InputRecord({
  onStart,
  onComplete,
  onError,
}: InputRecordProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      onError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    chunksRef.current = [];
  };

  const submitRecording = async () => {
    if (!audioBlob) return;

    onStart();

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
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
    <div className="flex flex-col items-center justify-center space-y-6">
      {!audioBlob ? (
        <div className="text-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? "bg-red-100 text-red-600 animate-pulse ring-4 ring-red-50"
                : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
          <p className="mt-4 text-sm font-medium text-gray-900">
            {isRecording
              ? "Recording... Click to stop"
              : "Click to start recording"}
          </p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Audio Recorded
              </span>
            </div>
            <span className="text-xs text-gray-500">Ready to transcribe</span>
          </div>

          <audio
            controls
            src={URL.createObjectURL(audioBlob)}
            className="w-full mb-4"
          />

          <div className="flex space-x-3">
            <button
              onClick={discardRecording}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Discard
            </button>
            <button
              onClick={submitRecording}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              <Upload className="w-4 h-4 mr-2" />
              Transcribe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
