
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { recentInteractions } from '@/lib/data';
import { useLanguage } from '@/app/(app)/layout';


const translations = {
    en: {
        title: "Recent Interactions",
        description: "Unified feed of comments, mentions, and DMs.",
        reply: "Reply",
    },
    ar: {
        title: "التفاعلات الأخيرة",
        description: "موجز موحد للتعليقات والإشارات والرسائل الخاصة.",
        reply: "رد",
    }
}

export default function RecentInteractions() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentInteractions.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={item.user.avatar.imageUrl} alt={item.user.name} data-ai-hint={item.user.avatar.imageHint}/>
              <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{item.user.name}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">{item.content}</p>
            </div>
            <Button variant="outline" size="sm">{t.reply}</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
