import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { FeatureCatalogue } from '@/components/home/feature-catalogue';
import { QuickActions } from '@/components/home/quick-actions';
import { AnnouncementsFeed } from '@/components/home/announcements-feed';
import { GalleryShowcase } from '@/components/home/gallery-showcase';
import { ContactSection } from '@/components/home/contact-section';
import { RealtimeNotifications } from '@/components/home/realtime-notifications';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* PRD Compliant Hero Carousel */}
      <HeroCarousel />

      {/* Quick Action Buttons */}
      <QuickActions />

      {/* PRD Compliant Feature Catalogue */}
      <FeatureCatalogue />

      {/* Realtime Community Feed */}
      <AnnouncementsFeed />

      {/* Community Gallery */}
      <GalleryShowcase />

      {/* Contact & Emergency Desk */}
      <ContactSection />

      {/* Real-time Toast Notifications */}
      <RealtimeNotifications />
    </div>
  );
}
