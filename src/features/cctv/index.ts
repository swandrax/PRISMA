export interface CctvCamera {
  id: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  streamUrl?: string;
  snapshotUrl?: string;
  isPublic: boolean;
}

export const COMMUNITY_CCTV_CAMERAS: CctvCamera[] = [
  {
    id: 'cctv-pos-utama',
    name: 'CCTV 01 - Pos Keamanan Bugis',
    location: 'Gang Bugis No. 95 (Pos Kamling)',
    status: 'ONLINE',
    isPublic: true,
  },
  {
    id: 'cctv-gang-bugis-timur',
    name: 'CCTV 02 - Gang Bugis Timur',
    location: 'Pertigaan Blok B',
    status: 'ONLINE',
    isPublic: true,
  },
  {
    id: 'cctv-gerbang-masuk',
    name: 'CCTV 03 - Portal Pintu Masuk RT',
    location: 'Gerbang Utama RT 04 / RW 09',
    status: 'ONLINE',
    isPublic: true,
  },
  {
    id: 'cctv-taman-warga',
    name: 'CCTV 04 - Ruang Terbuka Hijau & Taman',
    location: 'Taman Blok C',
    status: 'ONLINE',
    isPublic: true,
  },
];
