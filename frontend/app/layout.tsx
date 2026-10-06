import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { Providers } from './Providers';

export const metadata: Metadata = {
  title: 'Shiksha Mitra',
  description: 'AI-powered learning platform for Indian students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
