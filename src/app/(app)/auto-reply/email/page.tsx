
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
    title: "Email Auto-Replies",
    description: "Manage your email auto-reply rules.",
    cardTitle: "Email Auto-Reply Rules",
    cardDescription: "Manage your rules for automated replies to emails.",
    wip: "Auto-reply feature is currently in development.",
    newRule: "Create New Rule",
  },
  ar: {
    title: "الردود التلقائية للبريد الإلكتروني",
    description: "إدارة قواعد الرد التلقائي للبريد الإلكتروني.",
    cardTitle: "قواعد الرد التلقائي للبريد الإلكتروني",
    cardDescription: "إدارة القواعد الخاصة بك للردود التلقائية على رسائل البريد الإلكتروني.",
    wip: "ميزة الرد التلقائي قيد التطوير حاليًا.",
    newRule: "إنشاء قاعدة جديدة",
  },
};

export default function AutoReplyEmailPage() {
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
