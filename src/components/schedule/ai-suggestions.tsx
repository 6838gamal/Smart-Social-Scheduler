'use client';
import { type UseFormReturn } from 'react-hook-form';
import {
  suggestContentImprovements,
  type SuggestContentImprovementsOutput,
} from '@/ai/flows/suggest-content-improvements';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wand2, Loader2, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useTransition } from 'react';
import { z } from 'zod';
import { useI18n } from '@/contexts/i18n-provider';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  content: z.string().min(10, {
    message: 'Post content must be at least 10 characters.',
  }),
  platforms: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: 'You have to select at least one platform.',
    }),
  date: z.date({
    required_error: 'A date is required.',
  }),
  topic: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface AiSuggestionsProps {
  form: UseFormReturn<FormValues>;
}

export function AiSuggestions({ form }: AiSuggestionsProps) {
  const [isPending, startTransition] = useTransition();
  const [aiSuggestions, setAiSuggestions] =
    useState<SuggestContentImprovementsOutput | null>(null);
  const { dictionary } = useI18n();
  const { toast } = useToast();

  const handleGetSuggestions = () => {
    const { content, platforms: selectedPlatforms, topic } = form.getValues();
    if (!content) {
      form.setError('content', {
        message: dictionary.pages.schedule.ai.error,
      });
      return;
    }
    startTransition(async () => {
      try {
        const result = await suggestContentImprovements({
          postContent: content,
          platform: selectedPlatforms[0] as any, // GenAI flow expects one
          topic: topic || 'general marketing',
        });
        setAiSuggestions(result);
      } catch (error) {
        console.error('Error getting AI suggestions:', error);
        toast({
          variant: 'destructive',
          title: dictionary.errors.genericTitle,
          description: dictionary.errors.aiError,
        });
        setAiSuggestions(null);
      }
    });
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Wand2 className="text-accent" /> {dictionary.pages.schedule.ai.title}
        </CardTitle>
        <CardDescription>
          {dictionary.pages.schedule.ai.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGetSuggestions}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isPending ? dictionary.pages.schedule.ai.gettingSuggestions : dictionary.pages.schedule.ai.getSuggestions}
        </Button>
        {aiSuggestions && (
          <div className="mt-6 space-y-4 animate-in fade-in">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                {dictionary.pages.schedule.ai.explanation}
              </h4>
              <p className="text-sm text-muted-foreground">
                {aiSuggestions.explanation}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">{dictionary.pages.schedule.ai.hashtags}</h4>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.suggestedHashtags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      form.setValue(
                        'content',
                        form.getValues('content') + ` ${tag}`
                      )
                    }
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">{dictionary.pages.schedule.ai.times}</h4>
              <p className="text-sm text-muted-foreground">
                {dictionary.pages.schedule.ai.timesDescription}
              </p>
              <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                {aiSuggestions.suggestedPostingTimes.map((time) => (
                  <li key={time}>
                    {format(new Date(time), "EEE, MMM d 'at' h:mm a")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
