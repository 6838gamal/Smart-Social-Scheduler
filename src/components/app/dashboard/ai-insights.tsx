
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { aiInsights } from '@/lib/data';
import { useLanguage } from '@/app/(app)/layout';

const translations = {
    en: {
        title: "AI Insights",
        goToAnalytics: "Go to Analytics",
    },
    ar: {
        title: "رؤى الذكاء الاصطناعي",
        goToAnalytics: "اذهب إلى التحليلات",
    }
}

export default function AiInsights() {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {t.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3 text-sm">
                    {aiInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                            <span>{insight}</span>
                        </li>
                    ))}
                </ul>
                <Button variant="link" className="px-0 mt-2 h-auto">
                    {t.goToAnalytics} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
            </CardContent>
        </Card>
    );
}
