import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GoogleAuthProviderWrapper } from '@/components/GoogleAuthProvider';

export const metadata: Metadata = {
  title: 'FinG — Quản lý tài chính cá nhân tối giản',
  description: 'Ứng dụng quản lý tài chính cá nhân phong cách minimal: ghi chép thu chi, sổ ghi chú và báo cáo trực quan.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinG',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfc' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased min-h-screen text-zinc-900 dark:text-zinc-100 bg-[#fbfbfc] dark:bg-[#09090b] selection:bg-zinc-200 dark:selection:bg-zinc-800">
        <GoogleAuthProviderWrapper>
          {children}
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
