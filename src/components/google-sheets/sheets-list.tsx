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
import { FileSpreadsheet, MoreVertical, Loader2, Link } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { generateSheetReport } from '@/ai/flows/generate-sheet-report';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Sheet {
  id: string;
  name: string;
  lastModified: string;
}

export function SheetsList() {
  const { dictionary } = useI18n();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>(
    'loading'
  );
  const { auth, firestore } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [isExtracting, startExtracting] = useTransition();
  const [extractingId, setExtractingId] = useState<string | null>(null);

  const connectAndFetchSheets = async () => {
    if (!auth || !user) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
    provider.addScope('https://www.googleapis.com/auth/drive');

    try {
      const result = await reauthenticateWithPopup(user, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (!accessToken) {
        throw new Error(dictionary.pages.googleSheets.errors.token);
      }

      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,modifiedTime)",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error.message ||
            dictionary.pages.googleSheets.errors.fetchFailed
        );
      }

      const data = await response.json();
      const fetchedSheets = data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        lastModified: new Date(file.modifiedTime).toLocaleDateString(),
      }));

      setSheets(fetchedSheets);
      setStatus('connected');
    } catch (error: any) {
      console.error('Error fetching sheets:', error);
      let description = dictionary.errors.genericDescription;
      if (error.code === 'auth/popup-closed-by-user') {
        description = dictionary.pages.googleSheets.errors.popupClosed;
      } else if (error.code === 'auth/popup-blocked') {
        description = dictionary.pages.googleSheets.errors.popupBlocked;
      } else if (
        error.message &&
        error.message.includes('API has not been used')
      ) {
        description = dictionary.pages.googleSheets.errors.apiNotEnabled;
      }
      toast({
        variant: 'destructive',
        title: dictionary.pages.googleSheets.errors.fetchFailed,
        description: description,
      });
      setStatus('error');
    }
  };

  useEffect(() => {
    if (user) {
      connectAndFetchSheets();
    }
  }, [user]);

  const getAccessToken = async (): Promise<string | null> => {
    if (!auth || !user) {
      toast({
        variant: 'destructive',
        title: dictionary.pages.googleSheets.errors.connectionFailed,
        description: dictionary.pages.googleSheets.errors.auth,
      });
      return null;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
    provider.addScope('https://www.googleapis.com/auth/drive');

    try {
      const result = await reauthenticateWithPopup(user, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (!accessToken) {
        throw new Error(dictionary.pages.googleSheets.errors.token);
      }
      return accessToken;
    } catch (error: any) {
      console.error('Error getting access token:', error);
      let description = dictionary.errors.genericDescription;
      if (error.code === 'auth/popup-closed-by-user') {
        description = dictionary.pages.googleSheets.errors.popupClosed;
      } else if (error.code === 'auth/popup-blocked') {
        description = dictionary.pages.googleSheets.errors.popupBlocked;
      }
      toast({
        variant: 'destructive',
        title: dictionary.pages.googleSheets.errors.connectionFailed,
        description: description,
      });
      return null;
    }
  };

  const handleSync = (sheet: Sheet) => {
    toast({
      title: dictionary.pages.googleSheets.syncing,
    });
    // Placeholder for actual sync logic
    setTimeout(() => {
      toast({
        title: dictionary.pages.googleSheets.synced,
      });
    }, 1500);
  };

  const handleExtractReport = (sheet: Sheet) => {
    if (!firestore || !user) return;

    setExtractingId(sheet.id);
    startExtracting(async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setExtractingId(null);
          return;
        }

        // Fetch sheet data as CSV
        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${sheet.id}/export?format=csv`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch sheet data.');
        }

        const sheetData = await response.text();

        const result = await generateSheetReport({
          sheetName: sheet.name,
          sheetData: sheetData,
        });

        const reportData = {
          ...result,
          uid: user.uid,
        };
        const reportsCollection = collection(
          firestore,
          `users/${user.uid}/reports`
        );
        await addDoc(reportsCollection, reportData);

        toast({
          title: dictionary.pages.googleSheets.reportExtractedTitle,
          description: dictionary.pages.googleSheets.reportExtracted,
        });
        router.push('/reports');
      } catch (error: any) {
        console.error('Error extracting report:', error);
        toast({
          variant: 'destructive',
          title: dictionary.pages.googleSheets.errors.reportFailed,
          description: dictionary.errors.aiError,
        });
      } finally {
        setExtractingId(null);
      }
    });
  };

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>{dictionary.pages.googleSheets.connectingButton}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.pages.googleSheets.connectTitle}</CardTitle>
          <CardDescription>
            {dictionary.pages.googleSheets.connectDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectAndFetchSheets}>
            <Link className="mr-2 h-4 w-4" />
            {dictionary.pages.googleSheets.connectButton}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.pages.googleSheets.syncedSheets}</CardTitle>
        <CardDescription>
          {dictionary.pages.googleSheets.syncedSheetsDescription.replace(
            '{email}',
            user?.email || ''
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dictionary.pages.googleSheets.sheetName}</TableHead>
              <TableHead className="hidden md:table-cell">
                {dictionary.pages.googleSheets.lastModified}
              </TableHead>
              <TableHead className="text-right">
                {dictionary.pages.googleSheets.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sheets.length > 0 ? (
              sheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      <span>{sheet.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {sheet.lastModified}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isExtracting && extractingId === sheet.id}
                        >
                          {isExtracting && extractingId === sheet.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(
                              `https://docs.google.com/spreadsheets/d/${sheet.id}`,
                              '_blank'
                            )
                          }
                        >
                          {dictionary.pages.googleSheets.view}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSync(sheet)}>
                          {dictionary.pages.googleSheets.sync}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExtractReport(sheet)}
                        >
                          {dictionary.pages.googleSheets.extractReport}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  {dictionary.pages.googleSheets.noSheets}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
