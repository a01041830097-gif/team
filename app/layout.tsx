import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import './globals.css'

export const metadata: Metadata = {
  title: '팀 주간업무보고',
  description: '팀 주간 업무 보고 시스템',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '주간업무보고',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2160c4',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors />
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  )
}
