'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { useI18n } from '@/contexts/i18n-provider';

export default function WelcomePage() {
  const { dictionary } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-8">
        <Logo className="h-24 w-24 text-primary mx-auto" />
      </div>
      <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl md:text-6xl">
        {dictionary.pages.welcome.title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        {dictionary.pages.welcome.subtitle}
      </p>
      <div className="mt-10">
        <Button asChild size="lg">
          <Link href="/login">{dictionary.pages.welcome.getStarted}</Link>
        </Button>
      </div>
    </div>
  );
}
