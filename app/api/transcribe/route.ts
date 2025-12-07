import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { Innertube, Platform } from "youtubei.js";
import fs from "fs";
import path from "path";
import os from "os";
import { pipeline } from "stream/promises";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "");

// Provide a custom JavaScript evaluator for youtubei.js
Platform.shim.eval = async (data, env) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(", ")} }`;

  return new Function(code)();
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let filePath = "";
    let mimeType = "";

    // Handle YouTube URL
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { youtubeUrl } = body;

      if (!youtubeUrl) {
        return NextResponse.json(
          { error: "YouTube URL is required" },
          { status: 400 }
        );
      }

      // Extract Video ID (simple regex for standard URLs)
      const videoIdMatch = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        return NextResponse.json(
          { error: "Invalid YouTube URL" },
          { status: 400 }
        );
      }

      // Download audio using youtubei.js
      const tempDir = os.tmpdir();
      filePath = path.join(tempDir, `${videoId}.mp4`);
      mimeType = "video/mp4"; // Gemini handles video files for transcription too

      console.log(`Attempting to download video: ${videoId}`);

      const youtube = await Innertube.create();
      const stream = await youtube.download(videoId, {
        format: "mp4",
      });

      const fileStream = fs.createWriteStream(filePath);
      for await (const chunk of stream as any) {
        fileStream.write(chunk);
      }
      fileStream.close(); // Ensure stream is closed before proceeding
    } else if (contentType.includes("multipart/form-data")) {
      // Handle File Upload
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "File is required" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const tempDir = os.tmpdir();
      filePath = path.join(tempDir, file.name);
      mimeType = file.type || "audio/mp3"; // Default to mp3 if unknown, Gemini is smart enough usually

      await fs.promises.writeFile(filePath, buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    // Upload to Gemini
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: mimeType,
      displayName: path.basename(filePath),
    });

    // Wait for file processing to complete
    let file = await fileManager.getFile(uploadResponse.file.name);
    while (file.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(uploadResponse.file.name);
    }

    if (file.state !== "ACTIVE") {
      throw new Error(`File processing failed with state: ${file.state}`);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: "Transcribe this audio, detect language accurately. Output only the transcription text. Do not include timestamps or speaker labels.",
      },
    ]);

    const transcription = result.response.text();

    // Cleanup temp file
    await fs.promises.unlink(filePath).catch(() => {});
    // Cleanup Gemini file (optional but good for privacy)
    await fileManager.deleteFile(uploadResponse.file.name).catch(() => {});

    return NextResponse.json({ text: transcription });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
