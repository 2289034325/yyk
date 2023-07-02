'use client'

import '../styles/globals.css';
import SiteHeader from '../components/header';
import SessionProvider from '../components/provider/session';
import QueryProvider from '../components/provider/query';
import { AuthProvider, useAuthContext } from '../components/provider/auth';

import { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

export const metadata = {
  title: '予約',
  description: 'オンライン会話レッスン予約システム'
}

const RootLayout = ({ children }) => {
  

  return (
    <html lang='jp'>
      <head></head>
      <body>
        <AuthProvider>          
          <QueryProvider>
            <main className='app flex h-screen flex-col'>
              <SiteHeader />
              <section className='flex-1 w-full overflow-y-auto'>
                {children}
              </section>
            </main>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

export default RootLayout