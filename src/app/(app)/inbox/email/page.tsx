
"use client";

import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/app/page-header";
import { InboxView } from "@/components/app/inbox-view";
import { useLanguage } from "@/app/(app)/layout";
import { useUser } from "@/firebase/auth/use-user";
import { useFirebase, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, Query } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const translations = {
  en: {
    title: "Email Inbox",
    description: "View and respond to all email messages.",
    noMessagesText: "No email messages.",
    loadingMessages: "Loading messages...",
    fetchEmails: "Fetch Emails",
    connectAccount: "Connect Account",
    notConnectedTitle: "Gmail Account Not Connected",
    notConnectedDescription: "To view your emails here, you need to connect your Gmail account first. This will allow the app to securely access and display your messages.",
    fetchingEmails: "Fetching emails...",
    fetchSuccess: "Emails fetched successfully!",
    fetchError: "Failed to fetch emails.",
    fetchErrorDescription: "Could not retrieve emails at this time. Please try again or reconnect your account if the issue persists.",
  },
  ar: {
    title: "صندوق بريد البريد الإلكتروني",
    description: "عرض والرد على جميع رسائل البريد الإلكتروني.",
    noMessagesText: "لا توجد رسائل بريد إلكتروني.",
    loadingMessages: "جارٍ تحميل الرسائل...",
    fetchEmails: "سحب رسائل البريد الإلكتروني",
    connectAccount: "ربط الحساب",
    notConnectedTitle: "حساب Gmail غير متصل",
    notConnectedDescription: "لعرض رسائل البريد الإلكتروني الخاصة بك هنا، تحتاج إلى ربط حساب Gmail الخاص بك أولاً. سيسمح هذا للتطبيق بالوصول إلى رسائلك وعرضها بشكل آمن.",
    fetchingEmails: "جارٍ سحب رسائل البريد الإلكتروني...",
    fetchSuccess: "تم سحب رسائل البريد الإلكتروني بنجاح!",
    fetchError: "فشل في سحب رسائل البريد الإلكتروني.",
    fetchErrorDescription: "تعذر سحب رسائل البريد الإلكتروني في هذا الوقت. يرجى المحاولة مرة أخرى أو إعادة ربط حسابك إذا استمرت المشكلة.",
  }
};

export default function InboxEmailPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const connectionsQuery = user && firestore ? collection(firestore, 'users', user.uid, 'connections') : null;
  const { data: connections, loading: connectionsLoading } = useCollection(connectionsQuery);
  
  useEffect(() => {
    if (connections) {
      const googleConnection = connections.find(c => c.provider === 'google' && c.services?.includes('gmail'));
      setIsGmailConnected(!!googleConnection);
    }
  }, [connections]);

  const messagesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'emails'),
      orderBy('timestamp', 'desc')
    ) as Query<any>;
  }, [user, firestore]);

  const { data: messages, loading: messagesLoading } = useCollection(messagesQuery);
  
  const handleFetchEmails = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch('/api/emails/fetch', { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch emails');
      }

      toast({ title: t.fetchSuccess });
    } catch (error: any) {
      console.error(error);
      toast({ 
          variant: 'destructive', 
          title: t.fetchError, 
          description: error.message || t.fetchErrorDescription 
      });
    } finally {
      setIsFetching(false);
    }
  };

  const formattedMessages = useMemo(() => {
    if (!messages) return [];
    return messages.map(m => {
        let timestampStr = '';
        if (m.timestamp && m.timestamp.toDate) {
            timestampStr = new Date(m.timestamp.toDate()).toLocaleString();
        } else if (m.timestamp) {
            try {
                timestampStr = new Date(m.timestamp).toLocaleString();
            } catch (e) {
                timestampStr = String(m.timestamp);
            }
        }
        return {
            id: m.id,
            user: { name: m.from, avatar: { imageUrl: m.avatarUrl || '', imageHint: 'person avatar' } },
            content: m.content,
            timestamp: timestampStr,
            platform: 'Email',
            type: 'email',
            read: m.read,
        };
    });
  }, [messages]);

  const isLoading = connectionsLoading || messagesLoading;

  return (
    <div className="h-full flex flex-col">
      <PageHeader title={t.title} description={t.description}>
        {isGmailConnected && (
            <Button onClick={handleFetchEmails} disabled={isFetching || !user}>
                <RefreshCw className={`h-4 w-4 ltr:mr-2 rtl:ml-2 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? t.fetchingEmails : t.fetchEmails}
            </Button>
        )}
      </PageHeader>
      
      {!isGmailConnected && !connectionsLoading ? (
        <div className="flex flex-1 items-center justify-center">
            <Card className="max-w-lg text-center">
                <CardHeader>
                    <CardTitle>{t.notConnectedTitle}</CardTitle>
                    <CardDescription>{t.notConnectedDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/settings">
                            <Mail className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.connectAccount}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      ) : (
        <InboxView 
          messages={formattedMessages} 
          isLoading={isLoading}
          noMessagesText={isLoading ? t.loadingMessages : t.noMessagesText} 
        />
      )}
    </div>
  );
}
