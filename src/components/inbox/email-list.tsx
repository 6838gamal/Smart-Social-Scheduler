'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useI18n, useAuth, useUser } from '@/firebase';
import {
  Loader2,
  FileText,
  SlidersHorizontal,
  Download,
  Mail,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { generateEmailReport } from '@/ai/flows/generate-email-report';
import { collection, addDoc } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Report } from '@/app/(app)/reports/page';
import { downloadReportAsCSV, downloadReportAsXLSX } from '@/lib/download';

interface Email {
  id: string;
  snippet: string;
  from: string;
  subject: string;
}

export function EmailList() {
  const { dictionary } = useI18n();
  const [emails, setEmails] = useState<Email[]>([]);
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const { auth, firestore } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [isGenerating, startTransition] = useTransition();
  const [lastReport, setLastReport] = useState<Report | null>(null);

  const connectAndFetchEmails = async () => {
    if (!auth || !user) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

    try {
      const result = await reauthenticateWithPopup(user, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error(dictionary.pages.inbox.errors.token);
      }

      // Fetch emails
      const listResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!listResponse.ok) {
        const errorData = await listResponse.json();
        throw new Error(
          errorData.error.message || dictionary.pages.inbox.errors.fetchFailed
        );
      }
      const listData = await listResponse.json();

      if (!listData.messages || listData.messages.length === 0) {
        setEmails([]);
        setStatus('connected');
        return;
      }

      // Fetch details for each message
      const emailPromises = listData.messages.map(
        async (message: { id: string }) => {
          const msgResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!msgResponse.ok) return null;
          return msgResponse.json();
        }
      );

      const detailedEmails = await Promise.all(emailPromises);

      const formattedEmails: Email[] = detailedEmails
        .filter((e) => e)
        .map((email: any) => {
          const headers = email.payload.headers;
          const fromHeader = headers.find(
            (h: any) => h.name.toLowerCase() === 'from'
          );
          const subjectHeader = headers.find(
            (h: any) => h.name.toLowerCase() === 'subject'
          );
          return {
            id: email.id,
            snippet: email.snippet,
            from: fromHeader ? fromHeader.value : 'N/A',
            subject: subjectHeader ? subjectHeader.value : '(No Subject)',
          };
        });

      setEmails(formattedEmails);
      setStatus('connected');
    } catch (error: any) {
      console.error('Error connecting to Gmail:', error);
      let description = dictionary.errors.genericDescription;

      if (error.code === 'auth/popup-closed-by-user') {
        description = dictionary.pages.inbox.errors.popupClosed;
      } else if (error.code === 'auth/popup-blocked') {
        description = dictionary.pages.inbox.errors.popupBlocked;
      } else if (
        error.message &&
        (error.message.includes('API has not been used') ||
          error.message.includes('is disabled'))
      ) {
        description = dictionary.pages.inbox.errors.apiNotEnabled;
      }

      toast({
        variant: 'destructive',
        title: dictionary.pages.inbox.errors.connectionFailed,
        description: description,
      });
      setStatus('error');
    }
  };

  useEffect(() => {
    if (user) {
      connectAndFetchEmails();
    }
  }, [user]);

  const handleGenerateReport = () => {
    if (!firestore || !user || emails.length === 0) return;

    startTransition(async () => {
      try {
        const result = await generateEmailReport({ emails });
        const reportData = {
          ...result,
          uid: user.uid,
        };
        const reportsCollection = collection(
          firestore,
          `users/${user.uid}/reports`
        );
        const newReportRef = await addDoc(reportsCollection, reportData);
        setLastReport({ ...reportData, id: newReportRef.id });
        toast({
          title: dictionary.pages.inbox.reportGeneratedTitle,
          description: dictionary.pages.inbox.reportGeneratedDescription,
        });
      } catch (error) {
        console.error('Error generating email report:', error);
        toast({
          variant: 'destructive',
          title: dictionary.pages.inbox.errors.reportFailed,
          description: dictionary.errors.aiError,
        });
      }
    });
  };

  const handlePeriodicReport = (period: string) => {
    toast({
      title: dictionary.pages.reports.periodicReport.toastTitle,
      description: dictionary.pages.reports.periodicReport.toastDescription.replace(
        '{period}',
        period
      ),
    });
  };

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>{dictionary.pages.inbox.connectingButton}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.pages.inbox.connectTitle}</CardTitle>
          <CardDescription>
            {dictionary.pages.inbox.connectDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectAndFetchEmails}>
            <Mail className="mr-2 h-4 w-4" />
            {dictionary.pages.inbox.connectButton}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle>{dictionary.pages.inbox.email}</CardTitle>
          <CardDescription>
            {dictionary.pages.inbox.emailDescription.replace(
              '{email}',
              user?.email || ''
            )}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            disabled={emails.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isGenerating
              ? dictionary.pages.inbox.generatingReport
              : dictionary.pages.inbox.generateReport}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {dictionary.pages.reports.periodicReport.button}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {dictionary.pages.reports.periodicReport.label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handlePeriodicReport(
                    dictionary.pages.reports.periodicReport.daily
                  )
                }
              >
                {dictionary.pages.reports.periodicReport.daily}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handlePeriodicReport(
                    dictionary.pages.reports.periodicReport.weekly
                  )
                }
              >
                {dictionary.pages.reports.periodicReport.weekly}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handlePeriodicReport(
                    dictionary.pages.reports.periodicReport.monthly
                  )
                }
              >
                {dictionary.pages.reports.periodicReport.monthly}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={!lastReport}>
                <Download className="mr-2 h-4 w-4" />
                {dictionary.pages.inbox.downloadReport}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => lastReport && downloadReportAsCSV(lastReport)}
              >
                {dictionary.pages.reports.display.downloadCSV}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => lastReport && downloadReportAsXLSX(lastReport)}
              >
                {dictionary.pages.reports.display.downloadXLSX}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                {dictionary.pages.inbox.from}
              </TableHead>
              <TableHead>{dictionary.pages.inbox.subject}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.length > 0 ? (
              emails.map((email) => (
                <TableRow
                  key={email.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {email.from.replace(/<.*?>/g, '').replace(/"/g, '').trim()}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium truncate">{email.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {email.snippet}
                    </p>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  {dictionary.pages.inbox.noEmails}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
