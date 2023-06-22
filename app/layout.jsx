import '@styles/globals.css';
import SiteHeader from '@components/header';
import SessionProvider from '@components/provider/session';
import QueryProvider from '@components/provider/query';

export const metadata = {
  title: '予約',
  description: 'オンライン会話レッスン予約システム'
}

const RootLayout = ({ children }) => {
  return (
    <html lang='jp'>
      <body>
        <SessionProvider>
          <QueryProvider>
            <main className='app flex h-screen flex-col'>
              <SiteHeader />
              {children}
            </main>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

export default RootLayout