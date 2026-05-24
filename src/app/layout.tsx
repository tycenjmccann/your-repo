import type { Metadata } from 'next'
import './globals.css'
import { SidebarProvider } from '@/components/layout/sidebar/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import MainContent from '@/components/layout/MainContent'

export const metadata: Metadata = {
  title: 'App',
  description: 'Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var collapsed = localStorage.getItem('sidebar-collapsed');
                  if (collapsed === 'true') {
                    document.documentElement.setAttribute('data-sidebar', 'collapsed');
                  } else {
                    document.documentElement.setAttribute('data-sidebar', 'expanded');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <SidebarProvider>
          <Sidebar />
          <MainContent>
            {children}
          </MainContent>
        </SidebarProvider>
      </body>
    </html>
  )
}
