
"use client";

import { PageHeader } from "@/components/app/page-header";
import { InboxView } from "@/components/app/inbox-view";
import { inboxMessages } from "@/lib/data";
import { useLanguage } from "@/app/(app)/layout";

const translations = {
  en: {
    title: "All Messages",
    description: "View and respond to all messages, comments, and replies.",
    noMessagesText: "No messages.",
  },
  ar: {
    title: "كل الرسائل",
    description: "عرض والرد على جميع الرسائل والتعليقات والردود.",
    noMessagesText: "لا توجد رسائل.",
  }
};

export default function InboxAllPage() {
  const allMessages = inboxMessages;
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <PageHeader title={t.title} description={t.description} />
      <InboxView messages={allMessages} noMessagesText={t.noMessagesText} />
    </div>
  );
}
