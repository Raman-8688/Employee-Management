import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SttService {
  private recognition: any = null;
  private isListeningSubject = new BehaviorSubject<boolean>(false);
  public isListening$: Observable<boolean> = this.isListeningSubject.asObservable();
  
  private transcriptSubject = new Subject<string>();
  public transcript$: Observable<string> = this.transcriptSubject.asObservable();

  constructor(private ngZone: NgZone) {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionApi) {
        this.recognition = new SpeechRecognitionApi();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.ngZone.run(() => {
            this.isListeningSubject.next(true);
          });
        };

        this.recognition.onend = () => {
          this.ngZone.run(() => {
            this.isListeningSubject.next(false);
          });
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.ngZone.run(() => {
            this.isListeningSubject.next(false);
          });
        };

        this.recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          this.ngZone.run(() => {
            this.transcriptSubject.next(transcript);
          });
        };
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  start(): void {
    if (this.recognition && !this.isListeningSubject.value) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Error starting speech recognition:', e);
      }
    } else if (!this.recognition) {
      alert('Speech Recognition (Microphone) is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    }
  }

  stop(): void {
    if (this.recognition && this.isListeningSubject.value) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping speech recognition:', e);
      }
    }
  }

  toggle(): void {
    if (this.isListeningSubject.value) {
      this.stop();
    } else {
      this.start();
    }
  }
}
