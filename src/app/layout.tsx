
import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'ArchivaSmart | نظام الأرشفة الذكي',
  description: 'نظام إدارة وأرشفة الاختبارات الذكي مع استخراج البيانات تلقائياً',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0B3C5D" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <SidebarProvider>
          {children}
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
