'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/contexts/i18n-provider';

interface Account {
  id: number;
  platform: string;
  name: string;
  handle: string;
  icon: React.FC<any>;
}

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const Icon = account.icon;
  const { dictionary } = useI18n();

  return (
    <Card key={account.id}>
      <CardHeader className="flex flex-row items-center gap-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
        <div>
          <CardTitle className="font-headline text-lg">
            {account.platform}
          </CardTitle>
          <CardDescription>{account.name}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {dictionary.pages.accounts.card.handle}{' '}
          <span className="font-medium text-foreground">{account.handle}</span>
        </div>
        <Button variant="destructive" className="w-full">
          {dictionary.pages.accounts.card.disconnect}
        </Button>
      </CardContent>
    </Card>
  );
}
