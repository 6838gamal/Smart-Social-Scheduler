'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/contexts/i18n-provider';

interface Template {
  id: number;
  title: string;
  content: string;
  platforms: string[];
}

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const { dictionary } = useI18n();
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-lg">{template.title}</CardTitle>
        <CardDescription>
          {dictionary.pages.templates.card.for.replace(
            '{platforms}',
            template.platforms.join(', ')
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {template.content}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {dictionary.pages.templates.card.use}
        </Button>
      </CardFooter>
    </Card>
  );
}
