'use client';

import { type UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Mail, Notion, Telegram, WhatsApp } from '@/components/icons';
import { z } from 'zod';
import { useI18n } from '@/contexts/i18n-provider';

const platforms = [
  { id: 'Email', label: 'Email', icon: Mail },
  { id: 'WhatsApp', label: 'WhatsApp', icon: WhatsApp },
  { id: 'Telegram', label: 'Telegram', icon: Telegram },
  { id: 'Notion', label: 'Notion', icon: Notion },
] as const;

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

interface ScheduleFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (data: FormValues) => void;
}

export function ScheduleForm({ form, onSubmit }: ScheduleFormProps) {
  const { dictionary } = useI18n();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{dictionary.pages.schedule.form.title}</CardTitle>
            <CardDescription>
              {dictionary.pages.schedule.form.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.pages.schedule.form.contentLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={dictionary.pages.schedule.form.contentPlaceholder}
                      className="min-h-48"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="platforms"
              render={() => (
                <FormItem>
                  <FormLabel>{dictionary.pages.schedule.form.platformsLabel}</FormLabel>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {platforms.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground has-[[data-state=checked]]:bg-primary/10"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-2">
                                <item.icon className="h-5 w-5" />
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{dictionary.pages.schedule.form.dateLabel}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>{dictionary.pages.schedule.form.datePlaceholder}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="submit" size="lg">
              {dictionary.pages.schedule.form.submitButton}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
