'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useI18n, useUser, useCollection } from '@/firebase';
import type { Report } from '@/app/(app)/reports/page';
import { Bot, Mic, StopCircle, User, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getAgentResponse, transcribeAudio } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function AgentPage() {
  const { dictionary } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const { user } = useUser();
  const { data: reports, loading: reportsLoading } = useCollection<Report>(
    user ? `users/${user.uid}/reports` : null
  );

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const processAndSendMessage = async (text: string) => {
    if (isLoading || !text) return;

    setIsLoading(true);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const historyForApi = [...messages, newUserMessage].map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const agentResponseId = `${Date.now()}-agent-response`;
    const agentPlaceholderMessage: Message = {
      id: agentResponseId,
      role: 'model',
      content: '',
    };

    setMessages((prev) => [...prev, newUserMessage, agentPlaceholderMessage]);

    try {
      const stream = await getAgentResponse(historyForApi, reports);

      let content = '';
      for await (const chunk of stream) {
        content += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentResponseId ? { ...m, content } : m
          )
        );
      }
    } catch (error) {
      console.error('Streaming error:', error);
      const errorMessage =
        error instanceof Error ? error.message : dictionary.errors.aiError;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentResponseId
            ? { ...m, content: `Error: ${errorMessage}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || isTranscribing) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const userInput = (formData.get('message') as string).trim();

    if (!userInput) return;

    form.reset();
    await processAndSendMessage(userInput);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    if (hasPermission === false) {
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description:
          'Please enable microphone permissions in your browser settings to use voice input.',
      });
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setHasPermission(true);
        setIsRecording(true);

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorder.addEventListener('stop', async () => {
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm',
          });

          if (audioBlob.size === 0) return;

          setIsTranscribing(true);
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64data = reader.result as string;
              const transcribedText = await transcribeAudio(base64data);
              if (transcribedText) {
                await processAndSendMessage(transcribedText);
              } else {
                toast({
                  variant: 'destructive',
                  title: 'Transcription Failed',
                  description: 'Could not understand the audio. Please try again.',
                });
              }
            } catch (error) {
              console.error('Transcription error:', error);
              toast({
                variant: 'destructive',
                title: 'Transcription Failed',
                description:
                  error instanceof Error
                    ? error.message
                    : 'An unknown error occurred.',
              });
            } finally {
              setIsTranscribing(false);
            }
          };
        });

        mediaRecorder.start();
      })
      .catch((err) => {
        console.error('Error getting media device:', err);
        setHasPermission(false);
        toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description:
            'Please enable microphone permissions in your browser settings to use voice input.',
        });
      });
  };

  const lastMessage = messages[messages.length - 1];
  const isAgentThinking = isLoading && lastMessage?.role === 'model';
  const inputPlaceholder = isTranscribing
    ? 'جاري تحويل الصوت إلى نص...'
    : dictionary.pages.agent.placeholder;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-12 text-center">
            <Bot className="h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-bold">
              {dictionary.sidebar.agent}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {dictionary.pages.agent.description}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' && 'justify-end'
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md break-words rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
                {isAgentThinking && lastMessage?.id === message.id && (
                  <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-current" />
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <div className="mt-4 border-t pt-4">
        {hasPermission === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Microphone Access Required</AlertTitle>
            <AlertDescription>
              Please allow microphone access in your browser to use voice input.
            </AlertDescription>
          </Alert>
        )}
        <form
          ref={formRef}
          onSubmit={handleSendMessage}
          className="flex items-center gap-2"
        >
          <Input
            name="message"
            placeholder={inputPlaceholder}
            disabled={isLoading || isRecording || reportsLoading || isTranscribing}
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            variant={isRecording ? 'destructive' : 'outline'}
            onClick={handleToggleRecording}
            disabled={isLoading || isTranscribing}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || isRecording || isTranscribing}
            aria-label={dictionary.pages.agent.send}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        {reportsLoading && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {dictionary.pages.agent.loadingReports}
          </p>
        )}
      </div>
    </div>
  );
}
