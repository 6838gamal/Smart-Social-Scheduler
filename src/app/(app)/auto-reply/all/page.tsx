
"use client";

import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/(app)/layout";

const translations = {
  en: {
    title: "All Auto-Replies",
    description: "Manage all your auto-reply rules.",
    cardTitle: "Auto-Reply Rules",
    cardDescription: "Manage your rules for automated replies to messages and comments.",
    wip: "Auto-reply feature is currently in development.",
    newRule: "Create New Rule",
  },
  ar: {
    title: "كل الردود التلقائية",
    description: "إدارة جميع قواعد الرد التلقائي الخاصة بك.",
    cardTitle: "قواعد الرد التلقائي",
    cardDescription: "إدارة القواعد الخاصة بك للردود التلقائية على الرسائل والتعليقات.",
    wip: "ميزة الرد التلقائي قيد التطوير حاليًا.",
    newRule: "إنشاء قاعدة جديدة",
  },
};

export default function AutoReplyAllPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        description={t.description}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>
            {t.cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t.wip}</p>
        </CardContent>
        <CardFooter>
            <Button>{t.newRule}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
