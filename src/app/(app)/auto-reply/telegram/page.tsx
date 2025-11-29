
"use client";

import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/(app)/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const translations = {
  en: {
    title: "Telegram Auto-Replies",
    description: "Manage your rules for automated replies to Telegram messages.",
    newRule: "Create New Rule",
    status: "Status",
    keywords: "Keywords",
    response: "Response",
    target: "Target",
    replyType: "Reply Type",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    edit: "Edit",
    delete: "Delete",
  },
  ar: {
    title: "الردود التلقائية لتليجرام",
    description: "إدارة القواعد الخاصة بك للردود التلقائية على رسائل تليجرام.",
    newRule: "إنشاء قاعدة جديدة",
    status: "الحالة",
    keywords: "الكلمات المفتاحية",
    response: "الرد الآلي",
    target: "الاستهداف",
    replyType: "نوع الرد",
    actions: "الإجراءات",
    active: "نشط",
    inactive: "غير نشط",
    edit: "تعديل",
    delete: "حذف",
  },
};

const rules = [
    {
        id: "rule1",
        active: true,
        keywords: ["price", "pricing", "cost"],
        response: "Thanks for asking about pricing! You can find all details on our website: [link]",
        target: "All Groups & DMs",
        replyType: "In Chat",
    },
    {
        id: "rule2",
        active: true,
        keywords: ["help", "support"],
        response: "If you need support, please send a private message to our admin @SupportAdmin.",
        target: "All Groups",
        replyType: "In Chat",
    },
    {
        id: "rule3",
        active: false,
        keywords: ["welcome"],
        response: "Welcome to the group! We're excited to have you here.",
        target: "New Members",
        replyType: "Private Message",
    },
     {
        id: "rule4",
        active: true,
        keywords: ["roadmap"],
        response: "Our latest roadmap is available here: [link]",
        target: "All DMs",
        replyType: "In Chat",
    },
];

export default function AutoReplyTelegramPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        description={t.description}
      >
        <Button>
            <PlusCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t.newRule}
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">{t.status}</TableHead>
                        <TableHead className="w-[250px]">{t.keywords}</TableHead>
                        <TableHead>{t.response}</TableHead>
                        <TableHead>{t.target}</TableHead>
                        <TableHead>{t.replyType}</TableHead>
                        <TableHead className="text-right">{t.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rules.map((rule) => (
                        <TableRow key={rule.id}>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Switch id={`status-${rule.id}`} checked={rule.active} />
                                    <label htmlFor={`status-${rule.id}`} className="text-sm font-medium">
                                        {rule.active ? t.active : t.inactive}
                                    </label>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {rule.keywords.map(keyword => (
                                        <Badge key={keyword} variant="secondary">{keyword}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{rule.response}</TableCell>
                            <TableCell>{rule.target}</TableCell>
                            <TableCell>
                                <Badge variant={rule.replyType === "In Chat" ? "outline" : "default"}>
                                    {rule.replyType}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Pencil className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t.edit}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t.delete}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
