import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GAInitializer from "@/components/GAInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://extratime-app.com';
const ogImageUrl = `${baseUrl}/og-image.svg`;

export const metadata: Metadata = {
  title: "ExtraTime - Controle de Jornada e Hora Extra",
  description: "Controle suas horas extras, gestão de expediente e análise de compensações com ExtraTime. Aplicativo gratuito para rastreamento de jornada, overtime e folgas.",
  applicationName: "ExtraTime",
  keywords: ["controle de jornada", "hora extra", "overtime", "expediente", "horas extras", "rastreador de ponto"],
  icons: {
    icon: '/logo_menu.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: baseUrl,
    siteName: 'ExtraTime',
    title: "ExtraTime - Controle de Jornada e Hora Extra",
    description: "Controle suas horas extras, gestão de expediente e análise de compensações com ExtraTime.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'ExtraTime - Controle de Jornada',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "ExtraTime - Controle de Jornada e Hora Extra",
    description: "Controle suas horas extras, gestão de expediente e análise de compensações.",
    images: [ogImageUrl],
  },
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com;"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <GAInitializer />
      </body>
    </html>
  );
}
