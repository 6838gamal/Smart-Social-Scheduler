'use client';

import { useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n, useUser, useAuth } from '@/firebase';
import { Upload, Loader2 } from 'lucide-react';
import { SheetsList } from '@/components/google-sheets/sheets-list';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';

export default function GoogleSheetsPage() {
  const { dictionary } = useI18n();
  const { toast } = useToast();
  const { user } = useUser();
  const { auth } = useAuth();
  const [isImporting, startImporting] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const supportedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!supportedTypes.includes(fileExtension)) {
      toast({
        variant: 'destructive',
        title: dictionary.pages.googleSheets.errors.unsupportedFile,
        description:
          dictionary.pages.googleSheets.errors.unsupportedFileDescription,
      });
      return;
    }

    startImporting(async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        const metadata = {
          name: file.name,
          mimeType: 'application/vnd.google-apps.spreadsheet',
        };

        const formData = new FormData();
        formData.append(
          'metadata',
          new Blob([JSON.stringify(metadata)], { type: 'application/json' })
        );
        formData.append('file', file);

        const response = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error.message || 'Failed to upload file.'
          );
        }

        toast({
          title: dictionary.pages.googleSheets.fileImportedSuccessTitle,
          description: dictionary.pages.googleSheets.fileImportedSuccess.replace('{fileName}', file.name),
        });
      } catch (error: any) {
        console.error('Error uploading file:', error);
        toast({
          variant: 'destructive',
          title: dictionary.pages.googleSheets.errors.uploadFailed,
          description: dictionary.errors.genericDescription,
        });
      }
    });

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold tracking-tight">
            {dictionary.pages.googleSheets.title}
          </h2>
          <p className="text-muted-foreground">
            {dictionary.pages.googleSheets.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isImporting
              ? dictionary.pages.googleSheets.importingButton
              : dictionary.pages.googleSheets.import}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".csv, .xlsx, .xls"
          />
        </div>
      </div>

      <SheetsList />
    </div>
  );
}
