import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ORIGIN_URL } from "@/utils/helper";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ['200', '300','400','500','600','700','800','900']
});


export const metadata: Metadata = {
  title: "SummaryAI",
  description: "App for summarizing pdf",
  icons: {
    icon: '/icon.ico',
  },
  openGraph: {
    images: [
      {
        url: '/opengraph-image.png',
      },
    ],
  },
  metadataBase: new URL(ORIGIN_URL),
  alternates: {
    canonical: ORIGIN_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${fontSans.variable} font-sans antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        
        </div>
        <Toaster />
      </body>
    </html>
    </ClerkProvider>
  );
}
