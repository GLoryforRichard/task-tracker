import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BackgroundProvider } from '@/components/background-provider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PuppyHabits - 习惯追踪器",
  description: "🐶 跟随小狗一起培养好习惯，记录任务，追踪时间，让每一天都更加高效",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackgroundProvider>
          {children}
        </BackgroundProvider>
      </body>
    </html>
  );
}
