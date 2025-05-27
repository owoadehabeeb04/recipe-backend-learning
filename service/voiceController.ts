import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private isRecording: boolean = false;
  private transcript: string = '';
  private onTranscriptUpdate: ((transcript: string) => void) | null = null;
  private onRecordingStateChange: ((isRecording: boolean) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private interimResults: boolean = true;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Create speech recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure recognition
      if (this.recognition) {
        this.recognition.continuous = true;
        this.recognition.interimResults = this.interimResults;
        this.recognition.lang = 'en-US';
      }

      // Set up event handlers
      if (this.recognition) {
        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update current transcript
        const currentTranscript = finalTranscript || interimTranscript;
        this.transcript = currentTranscript;
        
        // Notify listener about the update
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(currentTranscript);
        }
      };
      }

      if (this.recognition) {
        this.recognition.onend = () => {
          // If we didn't manually stop it, restart
          if (this.isRecording) {
            try {
              this.recognition?.start();
            } catch (error) {
              this.stopRecording();
              if (this.onError) {
                this.onError('Error restarting recording');
              }
            }
          } else {
            this.isRecording = false;
            if (this.onRecordingStateChange) {
              this.onRecordingStateChange(false);
            }
          }
        };
        
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          if (this.onError) {
            this.onError(`Speech recognition error: ${event.error}`);
          }
          this.stopRecording();
        };
      }
    }
  }

  // Start recording
  public startRecording() {
    if (!this.recognition) {
      if (this.onError) {
        this.onError('Speech recognition not supported in this browser');
      }
      return false;
    }

    // First check if already recording to prevent errors
    if (this.isRecording) {
      console.log('Recognition already active, no need to start again');
      return true; // Return true since recording is active
    }

    try {
      this.transcript = '';
      this.recognition.start();
      this.isRecording = true;
      
      if (this.onRecordingStateChange) {
        this.onRecordingStateChange(true);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error starting speech recognition', error);
      
      // Check for the specific "already started" error
      if (error.name === 'InvalidStateError' || 
          (error.message && error.message.includes('already started'))) {
        console.log('Recognition was already running');
        this.isRecording = true;
        
        if (this.onRecordingStateChange) {
          this.onRecordingStateChange(true);
        }
        
        return true;
      }
      
      // Handle other errors
      if (this.onError) {
        this.onError('Error starting recording');
      }
      return false;
    }
  }

  // Stop recording
  public stopRecording() {
    if (!this.recognition) {
      return this.transcript;
    }

    if (this.isRecording) {
      this.isRecording = false;
      
      try {
        this.recognition.stop();
      } catch (error: any) {
        console.error('Error stopping speech recognition', error);
        // If it's already stopped, just update the state
        if (error.name === 'InvalidStateError' || 
            (error.message && error.message.includes('not started'))) {
          console.log('Recognition was not running');
        }
      }
      
      if (this.onRecordingStateChange) {
        this.onRecordingStateChange(false);
      }
    }
    
    return this.transcript;
  }

  // Toggle recording state
  public toggleRecording() {
    return this.isRecording ? this.stopRecording() : this.startRecording();
  }

  // Get current recording state
  public getIsRecording() {
    return this.isRecording;
  }

  // Get current transcript
  public getTranscript() {
    return this.transcript;
  }

  // Clear transcript
  public clearTranscript() {
    this.transcript = '';
    if (this.onTranscriptUpdate) {
      this.onTranscriptUpdate('');
    }
  }

  // Set transcript update handler
  public setOnTranscriptUpdate(callback: (transcript: string) => void) {
    this.onTranscriptUpdate = callback;
  }

  // Set recording state change handler
  public setOnRecordingStateChange(callback: (isRecording: boolean) => void) {
    this.onRecordingStateChange = callback;
  }

  // Set error handler
  public setOnError(callback: (error: string) => void) {
    this.onError = callback;
  }
}

export const sendVoiceMessage = async (token: string, chatId: string, transcription: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/chatbot/chats/${chatId}/voice`, 
        { transcription }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending voice message', error);
      throw error;
    }
  };
  
  // Add streaming support
  export const sendVoiceMessageStream = async (
    token: string, 
    chatId: string, 
    transcription: string,
    onChunk: (chunk: string) => void,
    onComplete: (message: any) => void
  ) => {
    try {
      const response = await fetch(`${API_URL}/chatbot/chats/${chatId}/voice-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      // Get the reader from the response body stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');
  
      const decoder = new TextDecoder();
      let buffer = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          try {
            const jsonData = JSON.parse(line.substring(6));
            
            if (jsonData.type === 'chunk' && jsonData.data.content) {
              // Send each chunk to the UI immediately
              onChunk(jsonData.data.content);
            } else if (jsonData.type === 'complete') {
              // Handle completion
              onComplete(jsonData.data.aiMessage);
            }
          } catch (e) {
            console.error('Error parsing JSON from stream:', e);
          }
        }
      }
      
      // Process any remaining data in the buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const jsonData = JSON.parse(buffer.substring(6));
          if (jsonData.type === 'complete') {
            onComplete(jsonData.data.aiMessage);
          }
        } catch (e) {
          console.error('Error parsing final JSON chunk:', e);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error streaming voice message:', error);
      throw error;
    }
  };// Create a singleton instance
export const speechService = new SpeechService();

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}