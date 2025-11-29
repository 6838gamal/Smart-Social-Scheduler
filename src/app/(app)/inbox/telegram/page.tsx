
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { InboxView } from "@/components/app/inbox-view";
import { inboxMessages } from "@/lib/data";
import { useLanguage } from "@/app/(app)/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { useToast } from "@/hooks/use-toast";

const translations = {
  en: {
    title: "Telegram Inbox",
    description: "View and respond to all Telegram messages.",
    noMessagesText: "No Telegram messages.",
    connectTitle: "Connect Your Telegram Account",
    connectDescription: "Enter your phone number to receive a verification code from Telegram.",
    phoneNumber: "Phone Number",
    phoneNumberPlaceholder: "+1 234 567 8900",
    sendCode: "Send Code",
    sending: "Sending...",
    verifyTitle: "Verify Your Phone Number",
    verifyDescription: "We've sent a code to your Telegram app. Please enter it below.",
    verificationCode: "Verification Code",
    password2FA: "2FA Password (if required)",
    verify: "Verify",
    verifying: "Verifying...",
    errorTitle: "An Error Occurred",
    sendCodeError: "Could not send verification code. Please check the phone number and try again.",
    verifyError: "Could not verify code. Please check the code and password, then try again.",
    loginRequired: "You must be logged in to connect an account.",
    codeSent: "Verification code sent!",
    connectedSuccessfully: "Telegram account connected successfully!",
    passwordRequired: "Two-factor authentication password is required.",
  },
  ar: {
    title: "صندوق وارد تليجرام",
    description: "عرض والرد على جميع رسائل تليجرام.",
    noMessagesText: "لا توجد رسائل تليجرام.",
    connectTitle: "ربط حساب تليجرام الخاص بك",
    connectDescription: "أدخل رقم هاتفك لتلقي رمز التحقق من تليجرام.",
    phoneNumber: "رقم الهاتف",
    phoneNumberPlaceholder: "+966 50 123 4567",
    sendCode: "إرسال الرمز",
    sending: "جارٍ الإرسال...",
    verifyTitle: "تحقق من رقم هاتفك",
    verifyDescription: "لقد أرسلنا رمزًا إلى تطبيق تليجرام الخاص بك. الرجاء إدخاله أدناه.",
    verificationCode: "رمز التحقق",
    password2FA: "كلمة مرور التحقق بخطوتين (إن وجدت)",
    verify: "تحقق",
verifying: "جارٍ التحقق...",
    errorTitle: "حدث خطأ",
    sendCodeError: "تعذر إرسال رمز التحقق. يرجى التحقق من رقم الهاتف والمحاولة مرة أخرى.",
    verifyError: "تعذر التحقق من الرمز. يرجى التحقق من الرمز وكلمة المرور ثم المحاولة مرة أخرى.",
    loginRequired: "يجب عليك تسجيل الدخول لربط حساب.",
    codeSent: "تم إرسال رمز التحقق!",
    connectedSuccessfully: "تم ربط حساب تليجرام بنجاح!",
    passwordRequired: "كلمة مرور المصادقة الثنائية مطلوبة.",
  }
};

function TelegramConnectionWizard({ onConnected }: { onConnected: () => void }) {
  const [step, setStep] = useState<'request_phone' | 'submit_code'>('request_phone');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const { lang } = useLanguage();
  const t = translations[lang];
  const { user } = useUser();
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: t.errorTitle, description: t.loginRequired });
        return;
    }
    setIsLoading(true);
    try {
        const token = await user.getIdToken(true);
        const response = await fetch('/api/telegram/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ phoneNumber }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || t.sendCodeError);
        }

        setPhoneCodeHash(result.phoneCodeHash);
        setStep('submit_code');
        toast({ title: t.codeSent });

    } catch (error: any) {
        console.error(error);
        const description = error.message.includes('PHONE_NUMBER_INVALID') 
            ? 'The phone number format is invalid. Please include the country code.' 
            : error.message || t.sendCodeError;
        toast({ variant: 'destructive', title: t.errorTitle, description });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!user) {
        toast({ variant: 'destructive', title: t.errorTitle, description: t.loginRequired });
        return;
    }
    setIsLoading(true);
    try {
        const token = await user.getIdToken(true);
        const response = await fetch('/api/telegram/verify-code', {
             method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ phoneNumber, phoneCode: verificationCode, phoneCodeHash, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            if (result.error === 'SESSION_PASSWORD_NEEDED') {
                setNeeds2FA(true);
                toast({ variant: 'destructive', title: t.errorTitle, description: t.passwordRequired });
            } else {
                 throw new Error(result.error || t.verifyError);
            }
        } else if (result.success) {
            toast({ title: t.connectedSuccessfully });
            onConnected();
        } else {
             throw new Error("Verification failed for an unknown reason.");
        }
    } catch (error: any) {
         console.error(error);
         toast({ variant: 'destructive', title: t.errorTitle, description: error.message || t.verifyError });
    } finally {
        setIsLoading(false);
    }
  };

  if (step === 'submit_code') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{t.verifyTitle}</CardTitle>
          <CardDescription>{t.verifyDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">{t.verificationCode}</Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
             {needs2FA && (
                <div className="space-y-2">
                <Label htmlFor="password">{t.password2FA}</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your 2FA password"
                    required
                />
                </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t.verifying : t.verify}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{t.connectTitle}</CardTitle>
        <CardDescription>{t.connectDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t.phoneNumber}</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder={t.phoneNumberPlaceholder}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required 
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? t.sending : t.sendCode}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function InboxTelegramPage() {
  const [isConnected, setIsConnected] = useState(false);
  const telegramMessages = isConnected ? inboxMessages.filter(m => m.platform === 'Telegram') : [];
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader title={t.title} description={t.description} />
      
      {isConnected ? (
        <InboxView messages={telegramMessages} noMessagesText={t.noMessagesText} />
      ) : (
        <div className="flex-1 flex items-start justify-center pt-10">
          <TelegramConnectionWizard onConnected={() => setIsConnected(true)} />
        </div>
      )}
    </div>
  );
}
