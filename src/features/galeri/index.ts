export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: 'KEGIATAN' | 'KERJA_BAKTI' | 'PERAYAAN' | 'INFRASTRUKTUR';
  date: string | Date;
}

export * from '@/components/home/gallery-showcase';
