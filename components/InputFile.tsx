"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

interface InputFileProps {
  onStart: () => void;
  onComplete: (text: string) => void;
  onError: (msg: string) => void;
}

export default function InputFile({
  onStart,
  onComplete,
  onError,
}: InputFileProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      onStart();

      const formData = new FormData();
      formData.append("file", file);

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
    },
    [onStart, onComplete, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <div className="p-4 bg-indigo-100 rounded-full mb-4">
          <UploadCloud className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {isDragActive
            ? "Drop the file here"
            : "Click to upload or drag and drop"}
        </h3>
        <p className="text-sm text-gray-500">MP3, WAV, M4A (max 25MB)</p>
      </div>
    </div>
  );
}
