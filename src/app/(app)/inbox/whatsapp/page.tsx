'use client';

import { useI18n } from '@/contexts/i18n-provider';

export default function WhatsappInboxPage() {
  const { dictionary } = useI18n();
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <h1 className="text-2xl font-bold">{dictionary.pages.inbox.whatsapp}</h1>
    </div>
  );
}
