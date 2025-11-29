
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  ImageIcon,
  Paperclip,
  Sparkles,
  VideoIcon,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { generateAiCaption } from "@/ai/flows/ai-suggested-caption";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/app/(app)/layout";

const translations = {
  en: {
    pageTitle: "Create & Schedule Post",
    saveDraft: "Save Draft",
    schedulePost: "Schedule Post",
    textareaPlaceholder: "What's on your mind? Type your content or let AI assist you...",
    postScore: "Post score: 87/100",
    aiAssistantTitle: "AI Content Assistant",
    selectToneLabel: "Select Tone",
    selectTonePlaceholder: "Select a tone",
    inspirational: "Inspirational",
    technical: "Technical",
    promotional: "Promotional",
    generateCaption: "Generate caption with AI",
    schedulingTitle: "Scheduling",
    schedulingDescription: "Choose platforms and time to post.",
    choosePlatforms: "Choose Platform(s)",
    optionsLabel: "Options",
    postNow: "Post now",
    smartSchedule: "Smart Schedule",
    customTime: "Custom time",
    postScheduled: "Post Scheduled!",
    postScheduledDescription: "Your post has been successfully scheduled.",
    contentEmptyError: "Content is empty",
    contentEmptyDescription: "Please write something to generate a caption from.",
    aiError: "AI Assistant Error",
    aiErrorDescription: "Could not generate caption. Please try again.",
    generating: "Generating...",
  },
  ar: {
    pageTitle: "إنشاء وجدولة منشور",
    saveDraft: "حفظ كمسودة",
    schedulePost: "جدولة المنشور",
    textareaPlaceholder: "بماذا تفكر؟ اكتب المحتوى الخاص بك أو دع الذكاء الاصطناعي يساعدك...",
    postScore: "درجة المنشور: 87/100",
    aiAssistantTitle: "مساعد المحتوى الذكي",
    selectToneLabel: "اختر النبرة",
    selectTonePlaceholder: "اختر نبرة",
    inspirational: "ملهم",
    technical: "تقني",
    promotional: "ترويجي",
    generateCaption: "إنشاء تعليق بالذكاء الاصطناعي",
    schedulingTitle: "الجدولة",
    schedulingDescription: "اختر المنصات ووقت النشر.",
    choosePlatforms: "اختر المنصة (المنصات)",
    optionsLabel: "الخيارات",
    postNow: "النشر الآن",
    smartSchedule: "جدولة ذكية",
    customTime: "وقت مخصص",
    postScheduled: "تم جدولة المنشور!",
    postScheduledDescription: "تمت جدولة منشورك بنجاح.",
    contentEmptyError: "المحتوى فارغ",
    contentEmptyDescription: "الرجاء كتابة شيء لإنشاء تعليق منه.",
    aiError: "خطأ في مساعد الذكاء الاصطناعي",
    aiErrorDescription: "تعذر إنشاء التسمية التوضيحية. يرجى المحاولة مرة أخرى.",
    generating: "جارٍ الإنشاء...",
  }
};

const postSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty."),
  tone: z.string().optional(),
  platforms: z.array(z.string()).min(1, "Please select at least one platform."),
  scheduleType: z.enum(["now", "smart", "custom"]),
  customDate: z.date().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

const platforms = [
  { id: "telegram", label: "Telegram" },
];

export default function CreatePostPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { lang } = useLanguage();
  const t = translations[lang];

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      platforms: ["telegram"],
      scheduleType: "smart",
    },
  });

  const handleGenerateCaption = async () => {
    const content = form.getValues("content");
    const tone = form.getValues("tone") || t.inspirational;
    if (!content) {
      toast({
        variant: "destructive",
        title: t.contentEmptyError,
        description: t.contentEmptyDescription,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAiCaption({ content, tone });
      form.setValue("content", `${content}\n\n${result.caption}`);
    } catch (error) {
      console.error("AI caption generation failed:", error);
      toast({
        variant: "destructive",
        title: t.aiError,
        description: t.aiErrorDescription,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  function onSubmit(data: PostFormValues) {
    toast({
      title: t.postScheduled,
      description: t.postScheduledDescription,
    });
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <PageHeader title={t.pageTitle}>
          <div className="flex items-center gap-2">
            <Button variant="outline" type="button">
              {t.saveDraft}
            </Button>
            <Button type="submit" className="glow-lavender">{t.schedulePost}</Button>
          </div>
        </PageHeader>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={t.textareaPlaceholder}
                          className="min-h-[250px] text-base resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" type="button">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" type="button">
                    <VideoIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" type="button">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t.postScore}
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t.aiAssistantTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.selectToneLabel}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectTonePlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Inspirational">
                            {t.inspirational}
                          </SelectItem>
                          <SelectItem value="Technical">{t.technical}</SelectItem>
                          <SelectItem value="Promotional">{t.promotional}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button
                  onClick={handleGenerateCaption}
                  disabled={isGenerating}
                  className="w-full glow-lavender"
                  type="button"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? t.generating : t.generateCaption}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.schedulingTitle}</CardTitle>
                <CardDescription>{t.schedulingDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="platforms"
                    render={() => (
                        <FormItem>
                            <FormLabel>{t.choosePlatforms}</FormLabel>
                            <div className="flex gap-4 pt-2">
                            {platforms.map((item) => (
                                <FormField
                                key={item.id}
                                control={form.control}
                                name="platforms"
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
                                                ? field.onChange([...field.value, item.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== item.id
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        {item.label}
                                        </FormLabel>
                                    </FormItem>
                                    )
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
                  name="scheduleType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t.optionsLabel}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="now" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t.postNow}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="smart" />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center gap-2">
                              {t.smartSchedule} <Sparkles className="h-4 w-4 text-primary"/>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="custom" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t.customTime}
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("scheduleType") === "custom" && (
                    <FormField
                    control={form.control}
                    name="customDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
