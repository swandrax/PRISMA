export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'RT_WIDE' | 'BLOK' | 'PENGURUS';
  targetBlock?: string | null;
  channels: string[];
  isPinned: boolean;
  status: string;
  publishedAt: string | Date;
}

export * from '@/components/home/announcements-feed';
