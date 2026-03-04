import { useRef, useCallback, useState } from 'react'
import { useChatStore } from '@application/stores/useChatStore'

interface UseVoiceRecordingOptions {
  onTranscript: (text: string) => void
}

/**
 * Hook for voice-to-text using the Web Speech API (SpeechRecognition).
 * Falls back gracefully if unsupported.
 */
export function useVoiceRecording({ onTranscript }: UseVoiceRecordingOptions) {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { isRecording, setIsRecording } = useChatStore()
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  })

  const startRecording = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'pt-BR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) {
        onTranscript(transcript)
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
  }, [isSupported, onTranscript, setIsRecording])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [setIsRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
  }
}
