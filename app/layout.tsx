import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CredDev - The Credibility Layer for Developers",
  description: "Verify skills. Build trust. Get discovered. AI-powered credibility reports for developers.",
  keywords: ["developer", "credibility", "skills", "github", "leetcode", "hiring"],
  authors: [{ name: "CredDev Team" }],
  openGraph: {
    title: "CredDev - The Credibility Layer for Developers",
    description: "Verify skills. Build trust. Get discovered.",
    type: "website",
  },
  icons: {
    icon: '/meta-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster position="top-center" theme="dark" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}