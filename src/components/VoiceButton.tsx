'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, X } from 'lucide-react'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
}

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null)

  const startRecording = useCallback(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new (SpeechRecognition as new () => SpeechRecognitionInstance)()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' '
      }
      if (transcript.trim()) {
        onTranscript(transcript.trim())
      }
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }, [])

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
        <MicOff className="h-4 w-4" />
        Seu navegador não suporta reconhecimento de voz
      </div>
    )
  }

  return (
    <div className="relative">
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-jarvis-800 px-6 py-4 transition-all hover:border-cyan-500/50 hover:from-cyan-500/15"
        >
          {/* Glow ring behind icon */}
          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-xl transition-all group-hover:h-16 group-hover:w-16 group-hover:bg-cyan-500/20" />

          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10">
            <Mic className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-cyan-400">Falar com Jarvis</p>
            <p className="text-xs text-cyan-600">Descreva seu conteúdo por voz</p>
          </div>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/50 bg-gradient-to-b from-cyan-500/15 to-jarvis-800 px-6 py-4">
          {/* Animated border glow */}
          <div className="animate-voice-pulse absolute inset-0 rounded-xl" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/60 bg-cyan-500/20">
                <Mic className="h-5 w-5 text-cyan-300" />
                <div className="absolute inset-0 animate-ping rounded-full border border-cyan-400/30" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cyan-300">Ouvindo...</p>
                <p className="text-xs text-cyan-500">Fale sobre seu negócio e conteúdo desejado</p>
              </div>
            </div>

            {/* Wave animation */}
            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-cyan-400"
                  style={{
                    animation: `recordWave 0.8s ease-in-out ${i * 0.1}s infinite`,
                    height: '8px',
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={stopRecording}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 transition-all hover:bg-red-500/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Type stubs for SpeechRecognition API
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } }; length: number }
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

function createRecognition(): SpeechRecognitionInstance {
  throw new Error('Not implemented')
}
