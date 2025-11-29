
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Archive,
  Send,
  Sparkles,
  Loader2,
} from "lucide-react";
import { generateReplySuggestions } from "@/ai/flows/ai-unified-inbox-reply-suggestions";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/app/(app)/layout";

const translations = {
    en: {
        aiSuggestions: "AI Suggestions",
        aiReplySuggestions: "AI Reply Suggestions",
        failedToGetSuggestions: "Failed to get suggestions",
        aiCouldNotGenerate: "The AI assistant could not generate suggestions at this time.",
        typeYourReply: "Type your reply...",
        sendAndArchive: "Send & Archive",
        markAsDone: "Mark as Done",
        selectAMessage: "Select a message to view",
    },
    ar: {
        aiSuggestions: "اقتراحات الذكاء الاصطناعي",
        aiReplySuggestions: "اقتراحات الرد بالذكاء الاصطناعي",
        failedToGetSuggestions: "فشل في الحصول على الاقتراحات",
        aiCouldNotGenerate: "لم يتمكن مساعد الذكاء الاصطناعي من إنشاء اقتراحات في هذا الوقت.",
        typeYourReply: "اكتب ردك...",
        sendAndArchive: "إرسال وأرشفة",
        markAsDone: "وضع علامة كـ تم",
        selectAMessage: "حدد رسالة لعرضها",
    }
}

type MessageUser = {
  name: string;
  avatar: {
    imageUrl: string;
    imageHint: string;
  };
};

type Message = {
  id: string | number;
  user: MessageUser;
  content: string;
  timestamp: string;
  platform: string;
  type: string;
  read: boolean;
};


function AiReplySuggestions({ message }: { message: Message }) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { lang } = useLanguage();
    const t = translations[lang];

    useEffect(() => {
      // Reset suggestions when message changes
      setSuggestions([]);
    }, [message]);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const result = await generateReplySuggestions({ message: message.content });
            setSuggestions(result.suggestions);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: t.failedToGetSuggestions,
                description: t.aiCouldNotGenerate,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (suggestions.length > 0) {
        return (
            <div className="space-y-2 pt-4">
                <p className="text-sm font-medium flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> {t.aiSuggestions}</p>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                        <Button key={i} variant="outline" size="sm" className="h-auto py-1 px-2 text-xs">{s}</Button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <Button onClick={fetchSuggestions} disabled={isLoading} variant="outline" size="sm" className="mt-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t.aiReplySuggestions}
        </Button>
    )
}

interface InboxViewProps {
    messages: Message[];
    noMessagesText: string;
    isLoading?: boolean;
}

export function InboxView({ messages, noMessagesText, isLoading = false }: InboxViewProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setSelectedMessage(messages[0]);
    } else if (!isLoading && messages.length === 0) {
      setSelectedMessage(null);
    }
  }, [messages, isLoading]);


  return (
      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-4 flex-1 overflow-hidden">
        {/* Message List */}
        <Card className="overflow-hidden">
          <CardContent className="p-0 h-full overflow-y-auto">
            {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : messages.length > 0 ? (
                <ul className="divide-y">
                {messages.map((message) => (
                    <li
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={cn(
                        "p-4 cursor-pointer hover:bg-secondary/50",
                        selectedMessage?.id === message.id && "bg-secondary",
                        !message.read && "font-semibold"
                    )}
                    >
                    <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border">
                        <AvatarImage src={message.user.avatar.imageUrl} alt={message.user.name} data-ai-hint={message.user.avatar.imageHint}/>
                        <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <p className="truncate">{message.user.name}</p>
                            <p className="text-xs text-muted-foreground flex-shrink-0">{message.timestamp}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{message.content}</p>
                        </div>
                    </div>
                    </li>
                ))}
                </ul>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    {noMessagesText}
                </div>
            )}
          </CardContent>
        </Card>
        
        {/* Message Detail */}
        {selectedMessage ? (
          <Card className="flex flex-col h-full">
            <CardContent className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-start gap-4">
                 <Avatar className="h-10 w-10 border">
                    <AvatarImage src={selectedMessage.user.avatar.imageUrl} alt={selectedMessage.user.name} data-ai-hint={selectedMessage.user.avatar.imageHint} />
                    <AvatarFallback>{selectedMessage.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{selectedMessage.user.name}</p>
                    <p className="text-sm text-muted-foreground">via {selectedMessage.platform}</p>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap">{selectedMessage.content}</p>
              <AiReplySuggestions message={selectedMessage} />
            </CardContent>
            <div className="p-4 bg-secondary/50 border-t">
              <div className="relative">
                <Textarea placeholder={t.typeYourReply} className="pr-16" />
                <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="archive" />
                    <label htmlFor="archive" className="text-sm font-medium">{t.sendAndArchive}</label>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Archive className="h-4 w-4 mr-2" /> {t.markAsDone}</Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="hidden lg:flex items-center justify-center h-full border rounded-lg bg-secondary/50">
            <p className="text-muted-foreground">{t.selectAMessage}</p>
          </div>
        )}
      </div>
  );
}
