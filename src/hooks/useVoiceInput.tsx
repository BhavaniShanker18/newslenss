import { useState, useEffect } from 'react';
import { useLanguage } from './useLanguage';

// Language code mapping for speech recognition
const languageCodeMap = {
  en: 'en-US',
  te: 'te-IN',
  hi: 'hi-IN',
};

// TypeScript declarations for Web Speech API
interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: any) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

export const useVoiceInput = () => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const startListening = (onResult: (transcript: string) => void) => {
    if (!recognition || !isSupported) return;

    recognition.lang = languageCodeMap[language];
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return { startListening, stopListening, isListening, isSupported };
};
