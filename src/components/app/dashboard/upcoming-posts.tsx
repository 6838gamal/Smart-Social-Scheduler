
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { upcomingPosts } from '@/lib/data';
import { useLanguage } from '@/app/(app)/layout';


const translations = {
    en: {
        title: "Upcoming Posts",
        description: "Your next 3 scheduled posts.",
        smartTimeSuggestion: "Smart Time Suggestion:",
        suggestionText: "Best next slot is tomorrow at 6:45 PM.",
        schedule: "Schedule",
    },
    ar: {
        title: "المنشورات القادمة",
        description: "أول 3 منشورات مجدولة لك.",
        smartTimeSuggestion: "اقتراح الوقت الذكي:",
        suggestionText: "أفضل فترة تالية هي غدًا الساعة 6:45 مساءً.",
        schedule: "جدولة",
    }
}

export default function UpcomingPosts() {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {upcomingPosts.map((post, index) => (
                        <div key={post.id}>
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold">
                                    {post.platform.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium leading-none">{post.content}</p>
                                    <p className="text-sm text-muted-foreground">{post.time}</p>
                                </div>
                            </div>
                            {index < upcomingPosts.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-accent/20 border border-accent/50 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-accent-foreground/80 font-medium">✨ <span className="font-bold">{t.smartTimeSuggestion}</span> {t.suggestionText}</p>
                    <Button variant="ghost" size="sm">{t.schedule}</Button>
                </div>
            </CardContent>
        </Card>
    );
}
