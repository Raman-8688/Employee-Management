import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TtsService {
  private isSpeakingSubject = new BehaviorSubject<boolean>(false);
  public isSpeaking$: Observable<boolean> = this.isSpeakingSubject.asObservable();
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  speak(text: string): void {
    if (!this.synthesis) {
      console.warn('Web Speech API (speechSynthesis) is not supported in this browser.');
      return;
    }

    this.stop(); // Stop any ongoing speech

    // Clean markdown formatting symbols before speaking
    const cleanText = text.replace(/[*#_`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      this.isSpeakingSubject.next(true);
    };

    utterance.onend = () => {
      this.isSpeakingSubject.next(false);
    };

    utterance.onerror = () => {
      this.isSpeakingSubject.next(false);
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeakingSubject.next(false);
    }
  }

  toggle(text: string): void {
    if (this.isSpeakingSubject.value) {
      this.stop();
    } else {
      this.speak(text);
    }
  }
}
