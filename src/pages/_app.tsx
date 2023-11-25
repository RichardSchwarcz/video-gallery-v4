import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'
import { api } from '~/utils/api'
import '~/styles/globals.css'
import { ThemeProvider } from '~/components/theme-provider'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <main className={`${inter.variable} font-sans`}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </SessionProvider>
  )
}

export default api.withTRPC(MyApp)
