import { useCallback, useRef, useState } from "react";
import { assistantAPI } from "@/lib/api/assistant";
import { toWav16kMono } from "@/lib/audio";

/**
 * Voice input via MediaRecorder + self-hosted transcription.
 *
 * Replaces the old browser Web Speech API (unreliable, Chrome/Edge-only, weak on
 * Hindi/Hinglish). Records audio in-browser, converts it to 16 kHz mono WAV, and
 * POSTs it to /assistant/transcribe/ (whisper.cpp). The resulting text is handed
 * back via `onTranscript`, then flows through the normal chat path as if typed.
 *
 * Works in every browser with getUserMedia + MediaRecorder (incl. Firefox/Safari).
 */

const isSupported = (): boolean =>
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== "undefined";

interface UseVoiceInput {
  supported: boolean;
  recording: boolean;
  transcribing: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

export function useVoiceInput(
  onTranscript: (text: string) => void,
  getLanguage: () => string
): UseVoiceInput {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  // Keep the latest callbacks in refs so start/stop can stay stable (avoids
  // re-subscribing the widget's external-open effect on every render).
  const onTranscriptRef = useRef(onTranscript);
  const getLanguageRef = useRef(getLanguage);
  onTranscriptRef.current = onTranscript;
  getLanguageRef.current = getLanguage;

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const start = useCallback(async () => {
    if (recorderRef.current) return; // already recording
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setRecording(false);
      return; // permission denied / no mic
    }
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      releaseStream();
      setRecording(false);
      if (!blob.size) return;

      setTranscribing(true);
      try {
        const wav = await toWav16kMono(blob);
        const { transcript } = await assistantAPI.transcribe(wav, getLanguageRef.current());
        if (transcript) onTranscriptRef.current(transcript);
      } catch {
        // Swallow: the widget shows a generic failure via the chat flow / toast.
      } finally {
        setTranscribing(false);
      }
    };

    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }, [releaseStream]);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }, []);

  return { supported: isSupported(), recording, transcribing, start, stop };
}
