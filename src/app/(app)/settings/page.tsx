
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Mail, Send, FolderKanban, Power, Loader2, AlertCircle, X } from "lucide-react";
import { useLanguage } from "@/app/(app)/layout";
import Link from "next/link";
import { useUser } from "@/firebase/auth/use-user";
import { useFirebase, useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const translations = {
    en: {
        title: "Settings",
        description: "Control integrations, preferences, and notifications.",
        accountIntegration: "Account Integration",
        accountIntegrationDesc: "Connect and manage your social media platforms.",
        googleAccount: "Google Account",
        telegram: "Telegram",
        connectGoogle: "Connect Google Account",
        connecting: "Connecting...",
        manage: "Manage",
        connected: "Connected",
        notificationsAndAlerts: "Notifications & Alerts",
        notificationsAndAlertsDesc: "Choose how you want to be notified.",
        notificationChannels: "Notification Channels",
        webPush: "Web Push",
        email: "Email",
        notificationTriggers: "Notification Triggers",
        failedPost: "Failed Post",
        newMessage: "New Message",
        aiAlert: "AI Alert",
        aiPersonalization: "AI Personalization",
        aiPersonalizationDesc: "Customize the AI assistant to match your style.",
        defaultTone: "Default Tone",
        selectTone: "Select a tone",
        inspirational: "Inspirational",
        technical: "Technical",
        promotional: "Promotional",
        casual: "Casual",
        preferredPostLength: "Preferred Post Length",
        selectLength: "Select a length",
        short: "Short (1-2 sentences)",
        medium: "Medium (3-5 sentences)",
        long: "Long (5+ sentences)",
        savePreferences: "Save Preferences",
        backupAndData: "Backup & Data Management",
        backupAndDataDesc: "Export your data or reset system settings.",
        exportAllData: "Export All Data",
        importSettings: "Import Settings",
        resetSystem: "Reset System",
        languageAndRegion: "Language & Region",
        languageAndRegionDesc: "Set your preferred language for the interface.",
        language: "Language",
        english: "English",
        arabic: "العربية",
        connect: "Connect",
        connectionSuccessTitle: "Google Account Connected!",
        connectionSuccessDescription: "Your Google account has been successfully linked. You can now fetch emails in the inbox.",
        connectionErrorTitle: "Connection Failed",
        connectionErrorDescription: "Could not connect Google account. Please try again.",
        storeTokenError: "Failed to securely store connection details.",
    },
    ar: {
        title: "الإعدادات",
        description: "تحكم في عمليات التكامل والتفضيلات والإشعارات.",
        accountIntegration: "تكامل الحساب",
        accountIntegrationDesc: "قم بتوصيل وإدارة منصات التواصل الاجتماعي الخاصة بك.",
        googleAccount: "حساب جوجل",
        telegram: "تليجرام",
        connectGoogle: "ربط حساب جوجل",
        connecting: "جارٍ الربط...",
        manage: "إدارة",
        connected: "متصل",
        notificationsAndAlerts: "الإشعارات والتنبيهات",
        notificationsAndAlertsDesc: "اختر كيف تريد أن يتم إعلامك.",
        notificationChannels: "قنوات الإشعارات",
        webPush: "إشعارات الويب",
        email: "البريد الإلكتروني",
        notificationTriggers: "مشغلات الإشعارات",
        failedPost: "فشل النشر",
        newMessage: "رسالة جديدة",
        aiAlert: "تنبيهات الذكاء الاصطناعي",
        aiPersonalization: "تخصيص الذكاء الاصطناعي",
        aiPersonalizationDesc: "خصص مساعد الذكاء الاصطناعي ليتناسب مع أسلوبك.",
        defaultTone: "النبرة الافتراضية",
        selectTone: "اختر نبرة",
        inspirational: "ملهم",
        technical: "تقني",
        promotional: "ترويجي",
        casual: "غير رسمي",
        preferredPostLength: "طول المنشور المفضل",
        selectLength: "اختر طولًا",
        short: "قصير (1-2 جمل)",
        medium: "متوسط (3-5 جمل)",
        long: "طويل (5+ جمل)",
        savePreferences: "حفظ التفضيلات",
        backupAndData: "النسخ الاحتياطي وإدارة البيانات",
        backupAndDataDesc: "تصدير بياناتك أو إعادة تعيين إعدادات النظام.",
        exportAllData: "تصدير جميع البيانات",
        importSettings: "استيراد الإعدادات",
        resetSystem: "إعادة ضبط النظام",
        languageAndRegion: "اللغة والمنطقة",
        languageAndRegionDesc: "قم بتعيين لغتك المفضلة للواجهة.",
        language: "اللغة",
        english: "English",
        arabic: "العربية",
        connect: "ربط",
        connectionSuccessTitle: "تم ربط حساب جوجل!",
        connectionSuccessDescription: "تم ربط حسابك في Google بنجاح. يمكنك الآن سحب رسائل البريد الإلكتروني في صندوق الوارد.",
        connectionErrorTitle: "فشل الربط",
        connectionErrorDescription: "تعذر ربط حساب Google. يرجى المحاولة مرة أخرى.",
        storeTokenError: "فشل تخزين تفاصيل الربط بشكل آمن.",
    },
};


type Status = {
    type: 'success' | 'error';
    title: string;
    message: string;
}

export default function SettingsPage() {
  const { lang, setLang } = useLanguage();
  const { user, idToken } = useUser();
  const { auth, firestore } = useFirebase();
  const t = translations[lang];
  
  const connectionsQuery = user && firestore ? collection(firestore, 'users', user.uid, 'connections') : null;
  const { data: connections, loading: connectionsLoading } = useCollection(connectionsQuery);
  
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    if (connections) {
      const googleConnection = connections.find(c => c.provider === 'google');
      setIsGoogleConnected(!!googleConnection);
      
      const telegramConnection = connections.find(c => c.provider === 'telegram');
      setIsTelegramConnected(!!telegramConnection);
    }
  }, [connections]);
  
  const handleConnectGoogle = async () => {
    if (!auth || !user) return;
    setIsConnecting(true);
    setStatus(null);

    try {
      const provider = new GoogleAuthProvider();
      // Request offline access to get a refresh token
      provider.setCustomParameters({
        access_type: 'offline',
        prompt: 'consent',
      });
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      
      const result = await signInWithPopup(auth, provider);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) {
        throw new Error("Could not get credential from Google sign-in result.");
      }
      
      const { accessToken } = credential;
      // The refresh token is often available in the server response, not directly on the credential
      // For client-side flows, Firebase SDKs manage the refresh token internally. 
      // We will primarily rely on the access token and the SDK's ability to refresh it.
      
      const googleUser = result.user;

      if (!accessToken) {
        throw new Error("Access token not found");
      }
      
      const idToken = await user.getIdToken(true); // Force refresh the Firebase user token
      
      const response = await fetch('/api/auth/google/store-token', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ 
              accessToken,
              // refreshToken might not be available on re-authentication, which is fine
              userEmail: googleUser.email,
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t.storeTokenError);
      }

      setStatus({
          type: 'success',
          title: t.connectionSuccessTitle,
          message: t.connectionSuccessDescription,
      });
      setIsGoogleConnected(true);

    } catch (error: any) {
      console.error("Google connection error:", error);
      setStatus({
          type: 'error',
          title: t.connectionErrorTitle,
          message: error.message || t.connectionErrorDescription,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t.accountIntegration}</CardTitle>
          <CardDescription>
            {t.accountIntegrationDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Power className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{t.googleAccount}</span>
              {isGoogleConnected && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-4 w-4"/> Gmail</span>
                    <span className="flex items-center gap-1"><FolderKanban className="h-4 w-4"/> Drive</span>
                </div>
              )}
            </div>
            {isGoogleConnected ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{t.connected}</span>
                </div>
            ) : (
                <Button onClick={handleConnectGoogle} variant="outline" size="sm" disabled={!user || isConnecting}>
                  {isConnecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isConnecting ? t.connecting : t.connectGoogle}
                </Button>
            )}
          </div>
           {status && (
              <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className="mt-4 relative">
                  {status.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <AlertTitle>{status.title}</AlertTitle>
                  <AlertDescription>
                      {status.message}
                  </AlertDescription>
                   <button onClick={() => setStatus(null)} className="absolute top-2 right-2 p-1">
                       <X className="h-4 w-4" />
                   </button>
              </Alert>
          )}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">{t.telegram}</span>
            </div>
            {isTelegramConnected ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{t.connected}</span>
                </div>
            ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/inbox/telegram">{t.connect}</Link>
                </Button>
            )}
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.notificationsAndAlerts}</CardTitle>
          <CardDescription>
            {t.notificationsAndAlertsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>{t.notificationChannels}</Label>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Switch id="email-notifications" defaultChecked />
                        <Label htmlFor="email-notifications">{t.email}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="telegram-notifications" />
                        <Label htmlFor="telegram-notifications">{t.telegram}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="web-push-notifications" defaultChecked />
                        <Label htmlFor="web-push-notifications">{t.webPush}</Label>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="space-y-2">
                <Label>{t.notificationTriggers}</Label>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="failed-post" defaultChecked />
                        <Label htmlFor="failed-post">{t.failedPost}</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="new-message" defaultChecked />
                        <Label htmlFor="new-message">{t.newMessage}</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="ai-alert" />
                        <Label htmlFor="ai-alert">{t.aiAlert}</Label>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.aiPersonalization}</CardTitle>
          <CardDescription>
            {t.aiPersonalizationDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
                <Label htmlFor="default-tone">{t.defaultTone}</Label>
                <Select defaultValue="inspirational">
                    <SelectTrigger id="default-tone">
                        <SelectValue placeholder={t.selectTone} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inspirational">{t.inspirational}</SelectItem>
                        <SelectItem value="technical">{t.technical}</SelectItem>
                        <SelectItem value="promotional">{t.promotional}</SelectItem>
                        <SelectItem value="casual">{t.casual}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="post-length">{t.preferredPostLength}</Label>
                <Select defaultValue="medium">
                    <SelectTrigger id="post-length">
                        <SelectValue placeholder={t.selectLength} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="short">{t.short}</SelectItem>
                        <SelectItem value="medium">{t.medium}</SelectItem>
                        <SelectItem value="long">{t.long}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button>{t.savePreferences}</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>{t.languageAndRegion}</CardTitle>
            <CardDescription>{t.languageAndRegionDesc}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-2 max-w-xs">
                <Label htmlFor="language-select">{t.language}</Label>
                <Select value={lang} onValueChange={(value: "ar" | "en") => setLang(value)}>
                    <SelectTrigger id="language-select">
                        <SelectValue placeholder={t.language} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">{t.english}</SelectItem>
                        <SelectItem value="ar">{t.arabic}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.backupAndData}</CardTitle>
          <CardDescription>
            {t.backupAndDataDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline">{t.exportAllData}</Button>
            <Button variant="outline">{t.importSettings}</Button>
            <Button variant="destructive">{t.resetSystem}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
