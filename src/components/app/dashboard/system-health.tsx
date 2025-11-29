
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { systemHealth } from '@/lib/data';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/app/(app)/layout';

const translations = {
    en: {
        title: "System Health",
        connected: "Connected",
        syncProgress: "Sync Progress",
        lastSynced: "Last synced: 2 minutes ago",
    },
    ar: {
        title: "صحة النظام",
        connected: "متصل",
        syncProgress: "تقدم المزامنة",
        lastSynced: "آخر مزامنة: قبل دقيقتين",
    }
}

export default function SystemHealth() {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">{systemHealth.telegram.label}</span>
                    </div>
                    <span className="text-sm text-green-500">{t.connected}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">{systemHealth.x.label}</span>
                    </div>
                    <span className="text-sm text-yellow-500">{systemHealth.x.message}</span>
                </div>
                <Separator />
                <div>
                    <p className="text-sm font-medium mb-2">{t.syncProgress}</p>
                    <Progress value={85} />
                    <p className="text-xs text-muted-foreground mt-1">{t.lastSynced}</p>
                </div>
            </CardContent>
        </Card>
    );
}
