'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Loader2 } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-provider';

const platforms = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn'];
const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time'];
const useFormSchema = (dictionary: any) => {
  return useMemo(
    () =>
      z.object({
        platform: z.string({
          required_error: dictionary.pages.reports.form.validation.platform,
        }),
        dateRange: z.string({
          required_error: dictionary.pages.reports.form.validation.dateRange,
        }),
        metrics: z
          .array(z.string())
          .refine((value) => value.some((item) => item), {
            message: dictionary.pages.reports.form.validation.metrics,
          }),
        postContent: z.string().min(1, {
          message: dictionary.pages.reports.form.validation.content,
        }),
      }),
    [dictionary]
  );
};

export type FormValues = z.infer<ReturnType<typeof useFormSchema>>;

interface ReportFormProps {
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
}

export function ReportForm({ onSubmit, isPending }: ReportFormProps) {
  const { dictionary } = useI18n();
  const FormSchema = useFormSchema(dictionary);

  const metrics = [
    { id: 'likes', label: dictionary.pages.reports.form.metricLabels.likes },
    { id: 'comments', label: dictionary.pages.reports.form.metricLabels.comments },
    { id: 'shares', label: dictionary.pages.reports.form.metricLabels.shares },
    { id: 'impressions', label: dictionary.pages.reports.form.metricLabels.impressions },
    { id: 'reach', label: dictionary.pages.reports.form.metricLabels.reach },
    { id: 'engagement_rate', label: dictionary.pages.reports.form.metricLabels.engagement_rate },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      platform: 'Twitter',
      dateRange: 'Last 30 days',
      metrics: ['likes', 'comments', 'impressions'],
      postContent:
        'Just launched our new analytics feature! Now you can track your post performance with more detail than ever before. #newfeature #analytics',
    },
  });

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="font-headline">{dictionary.pages.reports.form.title}</CardTitle>
        <CardDescription>
          {dictionary.pages.reports.form.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.pages.reports.form.platform}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={dictionary.pages.reports.form.selectPlatform}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.pages.reports.form.dateRange}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            dictionary.pages.reports.form.selectDateRange
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dateRanges.map((dr) => (
                        <SelectItem key={dr} value={dr}>
                          {dr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metrics"
              render={() => (
                <FormItem>
                  <FormLabel>{dictionary.pages.reports.form.metrics}</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {metrics.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="metrics"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
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
                              <FormLabel className="text-sm font-normal">
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
              name="postContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.pages.reports.form.examplePost}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide an example post..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {dictionary.pages.reports.form.examplePostDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isPending
                ? dictionary.pages.reports.form.generatingButton
                : dictionary.pages.reports.form.submitButton}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
