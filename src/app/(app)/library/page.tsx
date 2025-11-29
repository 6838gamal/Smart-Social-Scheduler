
"use client";

import { useState } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { contentLibraryItems } from "@/lib/data";
import {
  MoreVertical,
  Search,
  Tag,
  Heart,
  Eye,
  Edit,
  Copy,
  Trash2,
  BookText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { aiContentLibrarySearch } from "@/ai/flows/ai-content-library-search";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/app/(app)/layout";

const translations = {
  en: {
    pageTitle: "Content Library",
    pageDescription: "Store, organize, and reuse past content, visuals, and templates.",
    allPosts: "All Posts",
    drafts: "Drafts",
    templates: "Templates",
    media: "Media",
    aiSearchPlaceholder: "AI search: 'Find my motivational posts'",
    aiSearch: "AI",
    selectItem: "Select an item to see details",
    details: "Details",
    createdOn: "Created on",
    tags: "Tags",
    notes: "Notes",
    repost: "Repost",
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",
    type: "Type",
    aiSearchResults: "AI Search Results",
    foundItems: (count: number) => `Found ${count} items. (Note: This is a mock response)`,
    aiSearchFailed: "AI Search Failed",
  },
  ar: {
    pageTitle: "مكتبة المحتوى",
    pageDescription: "تخزين وتنظيم وإعادة استخدام المحتوى والمرئيات والقوالب السابقة.",
    allPosts: "جميع المنشورات",
    drafts: "المسودات",
    templates: "القوالب",
    media: "الوسائط",
    aiSearchPlaceholder: "بحث بالذكاء الاصطناعي: 'ابحث عن منشوراتي التحفيزية'",
    aiSearch: "بحث ذكي",
    selectItem: "حدد عنصرًا لرؤية التفاصيل",
    details: "التفاصيل",
    createdOn: "تم الإنشاء في",
    tags: "العلامات",
    notes: "ملاحظات",
    repost: "إعادة النشر",
    edit: "تعديل",
    duplicate: "تكرار",
    delete: "حذف",
    type: "النوع",
    aiSearchResults: "نتائج بحث الذكاء الاصطناعي",
    foundItems: (count: number) => `تم العثور على ${count} عنصر. (ملاحظة: هذه استجابة وهمية)`,
    aiSearchFailed: "فشل بحث الذكاء الاصطناعي",
  }
};


type Item = (typeof contentLibraryItems)[0];

function ItemCard({ item, onSelect }: { item: Item; onSelect: (item: Item) => void }) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect(item)}>
      <div className="relative aspect-[4/3] bg-secondary">
        {item.image && (
          <Image
            src={item.image.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            data-ai-hint={item.image.imageHint}
          />
        )}
        {item.type !== 'media' && <div className="absolute inset-0 bg-black/20" />}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-base truncate">{item.title}</CardTitle>
        <CardDescription>{new Date(item.date).toLocaleDateString()}</CardDescription>
      </CardHeader>
      {item.stats && (
        <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> {item.stats.likes}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {item.stats.reach}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function DetailPanel({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  if (!item) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{t.type}: {item.type}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <MoreVertical className="w-4 h-4 rotate-90" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {item.image && (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image src={item.image.imageUrl} alt={item.title} fill className="object-cover" data-ai-hint={item.image.imageHint}/>
          </div>
        )}
        <div>
          <h3 className="font-semibold mb-2">{t.details}</h3>
          <p className="text-sm text-muted-foreground">{t.createdOn}: {new Date(item.date).toLocaleString()}</p>
        </div>
        <Separator/>
        <div>
          <h3 className="font-semibold mb-2">{t.tags}</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
        <Separator/>
        <div>
            <h3 className="font-semibold mb-2">{t.notes}</h3>
            <p className="text-sm text-muted-foreground italic">"This post performed well at 9 PM."</p>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 flex-col items-stretch space-y-2">
        <Button className="w-full">{t.repost}</Button>
        <div className="grid grid-cols-3 gap-2">
            <Button variant="outline"><Edit className="w-4 h-4 mr-2"/> {t.edit}</Button>
            <Button variant="outline"><Copy className="w-4 h-4 mr-2"/> {t.duplicate}</Button>
            <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2"/> {t.delete}</Button>
        </div>
      </CardFooter>
    </Card>
  );
}


export default function ContentLibraryPage() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { lang } = useLanguage();
  const t = translations[lang];

  const handleAiSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
        const results = await aiContentLibrarySearch({ query: searchQuery });
        toast({
            title: t.aiSearchResults,
            description: t.foundItems(results.results.length),
        })
    } catch (e) {
        toast({ variant: 'destructive', title: t.aiSearchFailed });
    } finally {
        setIsSearching(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <PageHeader title={t.pageTitle} description={t.pageDescription} />

      <Tabs defaultValue="all" className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">{t.allPosts}</TabsTrigger>
            <TabsTrigger value="drafts">{t.drafts}</TabsTrigger>
            <TabsTrigger value="templates">{t.templates}</TabsTrigger>
            <TabsTrigger value="media">{t.media}</TabsTrigger>
          </TabsList>
          <div className="relative w-full max-w-sm">
            <Input 
                placeholder={t.aiSearchPlaceholder}
                className="pr-24"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                onClick={handleAiSearch}
                disabled={isSearching}
            >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-primary" />}
                <span className="ml-1">{t.aiSearch}</span>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 h-[calc(100%-60px)] overflow-hidden">
            <TabsContent value="all" className="mt-0 h-full overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentLibraryItems.map((item) => (
                    <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
                ))}
                </div>
            </TabsContent>
            {/* Other TabsContent would go here */}

            <div className="hidden md:block h-full overflow-y-auto">
                {selectedItem ? (
                     <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
                ): (
                    <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg bg-secondary/50">
                        <BookText className="w-16 h-16 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">{t.selectItem}</p>
                    </div>
                )}
            </div>
        </div>

      </Tabs>
    </div>
  );
}
