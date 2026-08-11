import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AiService, AiChatResponse } from '../../services/ai.service';
import { TtsService } from '../../services/tts.service';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  modelUsed?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './ai-copilot.component.html',
  styleUrls: ['./ai-copilot.component.css'],
})
export class AiCopilotComponent implements OnInit {
  isOpen = false;
  isLoading = false;
  userMessage = '';
  selectedModel = 'meta/llama-3.1-70b-instruct';
  
  availableModels: string[] = [
    'meta/llama-3.1-70b-instruct',
    'meta/llama-3.1-405b-instruct',
    'mistralai/mixtral-8x22b-instruct-v0.1'
  ];

  selectedFile: File | null = null;
  messages: ChatMessage[] = [
    {
      sender: 'ai',
      text: 'Hello! I am your Nvidia AI HR Copilot. How can I assist you with employee evaluations, policy queries, or document analysis today?',
      modelUsed: 'meta/llama-3.1-70b-instruct',
      timestamp: new Date(),
    },
  ];

  constructor(
    private aiService: AiService,
    public ttsService: TtsService
  ) {}

  ngOnInit(): void {
    this.aiService.getAvailableModels().subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.availableModels = res.data;
        }
      },
      error: () => {},
    });
  }

  toggleDrawer(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.ttsService.stop();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  sendMessage(): void {
    if ((!this.userMessage.trim() && !this.selectedFile) || this.isLoading) {
      return;
    }

    const messageText = this.userMessage.trim();
    this.userMessage = '';

    // If file is attached, process document analysis
    if (this.selectedFile) {
      const fileToUpload = this.selectedFile;
      this.selectedFile = null;

      this.messages.push({
        sender: 'user',
        text: `📄 [Uploaded Document: ${fileToUpload.name}] ${messageText}`,
        timestamp: new Date(),
      });

      this.isLoading = true;
      this.aiService.analyzeDocument(fileToUpload, messageText).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.messages.push({
            sender: 'ai',
            text: res.data.reply,
            modelUsed: res.data.modelUsed,
            timestamp: new Date(),
          });
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Document analysis failed:', err);
          this.messages.push({
            sender: 'ai',
            text: 'Sorry, I encountered an error analyzing the document. Please ensure it is a valid text/document file and try again.',
            timestamp: new Date(),
          });
        },
      });
      return;
    }

    // Standard chat message
    this.messages.push({
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    });

    this.isLoading = true;
    this.aiService.chat({
      message: messageText,
      model: this.selectedModel,
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.messages.push({
          sender: 'ai',
          text: res.data.reply,
          modelUsed: res.data.modelUsed,
          timestamp: new Date(),
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('AI chat failed:', err);
        this.messages.push({
          sender: 'ai',
          text: 'Error connecting to Nvidia AI API. Please try selecting a different model or try again later.',
          timestamp: new Date(),
        });
      },
    });
  }

  sendQuickChip(chipText: string): void {
    this.userMessage = chipText;
    this.sendMessage();
  }

  speakMessage(text: string): void {
    this.ttsService.toggle(text);
  }
}
