'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ScheduleForm } from '@/components/schedule/schedule-form';
import { AiSuggestions } from '@/components/schedule/ai-suggestions';
import { useI18n } from '@/contexts/i18n-provider';
import { useMemo, useEffect } from 'react';

type FormValues = z.infer<ReturnType<typeof useFormSchema>>;

const useFormSchema = (dictionary: any) => {
  return useMemo(
    () =>
      z.object({
        content: z.string().min(10, {
          message: dictionary.pages.schedule.validation.content,
        }),
        platforms: z
          .array(z.string())
          .refine((value) => value.some((item) => item), {
            message: dictionary.pages.schedule.validation.platform,
          }),
        date: z.date({
          required_error: dictionary.pages.schedule.validation.date,
        }),
        topic: z.string().optional(),
      }),
    [dictionary]
  );
};

export default function SchedulePage() {
  const { toast } = useToast();
  const { dictionary } = useI18n();
  const FormSchema = useFormSchema(dictionary);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: '',
      platforms: ['Telegram'],
    },
  });

  useEffect(() => {
    // Set date on client to avoid hydration mismatch
    if (!form.getValues('date')) {
      form.setValue('date', new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
  }, [form]);


  const onSubmit = (data: FormValues) => {
    toast({
      title: dictionary.pages.schedule.toast.title,
      description: dictionary.pages.schedule.toast.description.replace(
        '{date}',
        format(data.date, 'PPP')
      ),
    });
    console.log(data);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ScheduleForm form={form} onSubmit={onSubmit} />
      </div>
      <div className="lg:col-span-1">
        <AiSuggestions form={form} />
      </div>
    </div>
  );
}
