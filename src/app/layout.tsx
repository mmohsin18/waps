import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ConvexClientProvider } from './ConvexClientProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const APP_NAME = 'Waps'
const APP_DEFAULT_TITLE = 'Waps - Your Bookmarking Buddy'
const APP_TITLE_TEMPLATE = '%s - Waps'
const APP_DESCRIPTION = 'Your Bookmarking Buddy'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
}

export const viewport: Viewport = {
  themeColor: '#FF4D2E'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
        <link rel='manifest' href='/manifest.webmanifest' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
        <link rel='apple-touch-icon' href='/favicon/icon-192.png' />
      </head>
      <body className={inter.className}>
        <ConvexClientProvider>
          <div className='mx-auto flex min-h-screen flex-col'>
            <main className='flex grow flex-col'>{children}</main>
            {/* <BottomNav /> */}
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
