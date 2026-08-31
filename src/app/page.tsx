import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import { SimpleHero } from "@/components/home/simple-hero"
import { QuickActions } from "@/components/home/quick-actions"
import { RealtimeNotifications } from "@/components/home/realtime-notifications"

// Keep announcements and gallery for community feel, lazy load them
const AnnouncementsFeed = dynamic(
  () => import("@/components/home/announcements-feed").then(mod => mod.AnnouncementsFeed),
  { loading: () => <SectionSkeleton height="h-[400px]" /> }
)

const GalleryShowcase = dynamic(
  () => import("@/components/home/gallery-showcase").then(mod => mod.GalleryShowcase),
  { loading: () => <SectionSkeleton height="h-[500px]" /> }
)

const ContactSection = dynamic(
  () => import("@/components/home/contact-section").then(mod => mod.ContactSection),
  { loading: () => <SectionSkeleton height="h-[400px]" /> }
)

function SectionSkeleton({ height }: { height: string }) {
  return (
    <div className={`w-full ${height} container mx-auto px-4 py-12 space-y-4`}>
      <Skeleton className="h-8 w-1/3 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simplified Hero */}
      <SimpleHero />

      {/* "Saya Mau..." Actions */}
      <QuickActions />

      {/* Pengumuman */}
      <AnnouncementsFeed />

      {/* Galeri Kegiatan */}
      <GalleryShowcase />

      {/* Kontak */}
      <ContactSection />
      
      {/* Notifications */}
      <RealtimeNotifications />
    </div>
  );
}
